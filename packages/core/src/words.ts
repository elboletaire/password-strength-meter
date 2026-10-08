import { normalizeChar, normalizeChars, toChars } from './normalize'

/** Bits a matched user input is worth. */
export const USER_INPUT_BITS = 2
/** Common words shorter than this are ignored. */
export const MIN_COMMON_WORD_LENGTH = 4

export interface WordList {
  /** Normalized words, as character arrays, indexed by their first character. */
  byFirstChar: Map<string, string[][]>
  /** Normalized words, joined, for exact lookups. */
  set: Set<string>
  /** Bits a matched common word is worth before capitals and leetspeak. */
  baseBits: number
}

/**
 * Normalizes and indexes a list of common words. Do it once per meter.
 */
export function prepareWords(words: readonly string[]): WordList {
  const byFirstChar = new Map<string, string[][]>()
  const set = new Set<string>()
  for (const word of words) {
    const chars = normalizeChars(toChars(word))
    if (chars.length < MIN_COMMON_WORD_LENGTH) {
      continue
    }
    const joined = chars.join('')
    if (set.has(joined)) {
      continue
    }
    set.add(joined)
    const first = chars[0] as string
    const bucket = byFirstChar.get(first)
    if (bucket) {
      bucket.push(chars)
    }
    else {
      byFirstChar.set(first, [chars])
    }
  }
  return { byFirstChar, set, baseBits: Math.log2(Math.max(set.size, 2)) }
}

export interface WordMatch {
  start: number
  /** Exclusive. */
  end: number
  bits: number
}

function startsAt(haystack: string[], needle: string[], start: number): boolean {
  if (start + needle.length > haystack.length) {
    return false
  }
  for (let j = 0; j < needle.length; j++) {
    if (haystack[start + j] !== needle[j]) {
      return false
    }
  }
  return true
}

/** 1 bit per uppercase letter and per leet substitution in the original span. */
function variationBits(chars: string[], start: number, end: number): number {
  let bits = 0
  for (let i = start; i < end; i++) {
    const char = chars[i] as string
    const lower = char.toLowerCase()
    if (lower !== char || normalizeChar(char) !== lower) {
      bits++
    }
  }
  return bits
}

/**
 * Finds every occurrence of the common words and user-input tokens, then keeps
 * them greedily: longest first, leftmost on ties, without overlapping.
 */
export function findWords(chars: string[], words: WordList, tokens: string[][]): WordMatch[] {
  const normalized = normalizeChars(chars)
  const candidates: WordMatch[] = []

  for (let start = 0; start < normalized.length; start++) {
    for (const word of words.byFirstChar.get(normalized[start] as string) ?? []) {
      if (startsAt(normalized, word, start)) {
        const end = start + word.length
        candidates.push({ start, end, bits: words.baseBits + variationBits(chars, start, end) })
      }
    }
    for (const token of tokens) {
      if (startsAt(normalized, token, start)) {
        candidates.push({ start, end: start + token.length, bits: USER_INPUT_BITS })
      }
    }
  }

  candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start)

  const taken: boolean[] = new Array(chars.length).fill(false)
  const matches: WordMatch[] = []
  for (const match of candidates) {
    let free = true
    for (let i = match.start; i < match.end; i++) {
      if (taken[i]) {
        free = false
        break
      }
    }
    if (free) {
      taken.fill(true, match.start, match.end)
      matches.push(match)
    }
  }
  return matches
}
