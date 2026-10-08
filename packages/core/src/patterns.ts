import { classify } from './charset'

/** Bits a character is worth when it continues a predictable pattern. */
export const PATTERN_BITS = 1

const KEYBOARD_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const MAX_BLOCK = 8

function step(chars: string[], i: number): number {
  const a = chars[i - 1] as string
  const b = chars[i] as string
  const charClass = classify(b)
  if (charClass === 'symbol' || charClass === 'other' || classify(a) !== charClass) {
    return 0
  }
  const diff = (b.codePointAt(0) as number) - (a.codePointAt(0) as number)
  return diff === 1 || diff === -1 ? diff : 0
}

/** `abc`, `cba`, `123`: ±1 code points within a class, not reversing direction. */
function isSequence(chars: string[], i: number): boolean {
  const current = step(chars, i)
  if (current === 0) {
    return false
  }
  return i < 2 || step(chars, i - 1) !== -current
}

/** `qwer`, `asdf`, `1234`: neighbours on the same QWERTY row. */
function isKeyboardRun(chars: string[], i: number): boolean {
  const a = (chars[i - 1] as string).toLowerCase()
  const b = (chars[i] as string).toLowerCase()
  return KEYBOARD_ROWS.some((row) => {
    const from = row.indexOf(a)
    const to = row.indexOf(b)
    return from !== -1 && to !== -1 && Math.abs(from - to) === 1
  })
}

/** `abcabc`, `ab12ab12`: this and the previous character repeat those `k` positions back. */
function isRepeatedBlock(chars: string[], i: number): boolean {
  for (let k = 2; k <= MAX_BLOCK && i - 1 - k >= 0; k++) {
    if (chars[i] === chars[i - k] && chars[i - 1] === chars[i - 1 - k]) {
      return true
    }
  }
  return false
}

/**
 * Whether the character at `i` continues a pattern, judging only the characters before it.
 */
export function isPattern(chars: string[], i: number): boolean {
  if (i === 0) {
    return false
  }
  return chars[i] === chars[i - 1]
    || isSequence(chars, i)
    || isKeyboardRun(chars, i)
    || isRepeatedBlock(chars, i)
}

/**
 * Bits for each character: `log2(pool)` for free characters, PATTERN_BITS for pattern ones.
 */
export function characterBits(chars: string[], pool: number): number[] {
  const free = pool > 1 ? Math.log2(pool) : 0
  return chars.map((_, i) => (isPattern(chars, i) ? Math.min(PATTERN_BITS, free) : free))
}
