export type CharClass = 'lower' | 'upper' | 'digit' | 'symbol' | 'other'

const POOL: Record<CharClass, number> = {
  lower: 26,
  upper: 26,
  digit: 10,
  symbol: 33,
  other: 100,
}

/**
 * Classifies one character (a code point) into a character class.
 * `symbol` covers ASCII punctuation and space.
 */
export function classify(char: string): CharClass {
  if (char >= 'a' && char <= 'z') {
    return 'lower'
  }
  if (char >= 'A' && char <= 'Z') {
    return 'upper'
  }
  if (char >= '0' && char <= '9') {
    return 'digit'
  }
  const code = char.codePointAt(0) as number
  if (code >= 0x20 && code <= 0x7e) {
    return 'symbol'
  }
  return 'other'
}

/**
 * Sum of the sizes of the classes present in the characters.
 */
export function poolSize(chars: string[]): number {
  const classes = new Set(chars.map(classify))
  let size = 0
  for (const charClass of classes) {
    size += POOL[charClass]
  }
  return size
}
