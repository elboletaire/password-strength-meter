import { poolSize } from './charset'
import { toChars, tokenize } from './normalize'
import { characterBits } from './patterns'
import { findWords, type WordList } from './words'

/**
 * Built-in strength estimate, in bits: per-character entropy over the pool of
 * classes used, with patterns worth 1 bit and known words worth only their
 * dictionary size.
 */
export function estimateBits(password: string, userInputs: readonly string[], words: WordList): number {
  const chars = toChars(password)
  if (!chars.length) {
    return 0
  }

  const bits = characterBits(chars, poolSize(chars))
  const tokens = tokenize(userInputs).map(toChars)

  for (const match of findWords(chars, words, tokens)) {
    let spanBits = 0
    for (let i = match.start; i < match.end; i++) {
      spanBits += bits[i] as number
    }
    if (match.bits < spanBits) {
      // spread the word's bits over its span, so the total is the word's value
      const each = match.bits / (match.end - match.start)
      bits.fill(each, match.start, match.end)
    }
  }

  return bits.reduce((total, value) => total + value, 0)
}
