const LEET: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '5': 's',
  '$': 's',
  '7': 't',
}

/**
 * Splits a string into characters (code points).
 */
export function toChars(value: string): string[] {
  return Array.from(value)
}

/**
 * Normalizes one character for word matching: lowercase, then undo leetspeak.
 */
export function normalizeChar(char: string): string {
  const lower = char.toLowerCase()
  return LEET[lower] ?? lower
}

export function normalizeChars(chars: string[]): string[] {
  return chars.map(normalizeChar)
}

export function normalize(value: string): string {
  return normalizeChars(toChars(value)).join('')
}

/**
 * Splits user inputs into normalized tokens of at least 3 characters,
 * on anything that is not a letter or a digit (so emails and full names split too).
 */
export function tokenize(userInputs: readonly string[]): string[] {
  const tokens = new Set<string>()
  for (const input of userInputs) {
    for (const part of input.split(/[^\p{L}\p{N}]+/u)) {
      if (toChars(part).length >= 3) {
        tokens.add(normalize(part))
      }
    }
  }
  return Array.from(tokens)
}
