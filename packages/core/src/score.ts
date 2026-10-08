import type { MeterOptions } from './options'

/** The password is shorter than `minimumLength`. */
export const SCORE_TOO_SHORT = -1
/** The password matches (or contains) the field value. */
export const SCORE_CONTAINS_FIELD = -2

/**
 * Removes repeated sequences of `length` characters from a string.
 */
export function checkRepetition(length: number, str: string): string {
  let res = ''
  for (let i = 0; i < str.length; i++) {
    let repeated = true
    let j = 0
    for (; j < length && (j + i + length) < str.length; j++) {
      repeated = repeated && (str.charAt(j + i) === str.charAt(j + i + length))
    }
    if (j < length) {
      repeated = false
    }
    if (repeated) {
      i += length - 1
    }
    else {
      res += str.charAt(i)
    }
  }
  return res
}

/**
 * Returns a value between -2 and 100 to score the user's password.
 *
 * Pass `field` (e.g. the username) to reject passwords equal to it, or
 * containing it when `fieldPartialMatch` is enabled. The field check is
 * skipped only when `field` is `undefined`.
 *
 * legacy-compat: `field` is used as an unescaped regular expression, so
 * values with special characters are interpreted (and may throw).
 */
export function calculateScore(
  password: string,
  options: Pick<MeterOptions, 'minimumLength' | 'fieldPartialMatch'>,
  field?: string,
): number {
  let score = 0

  if (password.length < options.minimumLength) {
    return SCORE_TOO_SHORT
  }

  if (field !== undefined) {
    if (password.toLowerCase() === field.toLowerCase()) {
      return SCORE_CONTAINS_FIELD
    }
    if (options.fieldPartialMatch && field.length) {
      const user = new RegExp(field.toLowerCase())
      if (password.toLowerCase().match(user)) {
        return SCORE_CONTAINS_FIELD
      }
    }
  }

  // password length
  score += password.length * 4
  score += checkRepetition(1, password).length - password.length
  score += checkRepetition(2, password).length - password.length
  score += checkRepetition(3, password).length - password.length
  score += checkRepetition(4, password).length - password.length

  // password has 3 numbers
  if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
    score += 5
  }

  // password has at least 2 symbols
  // legacy-compat: the commas make `,` count as a symbol
  if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) {
    score += 5
  }

  // password has Upper and Lower chars
  if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
    score += 10
  }

  // password has number and chars
  if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
    score += 15
  }

  // password has number and symbol
  if (password.match(/([!@#$%^&*?_~])/) && password.match(/([0-9])/)) {
    score += 15
  }

  // password has char and symbol
  if (password.match(/([!@#$%^&*?_~])/) && password.match(/([a-zA-Z])/)) {
    score += 15
  }

  // password is just numbers or chars
  // legacy-compat: \w also matches `_`
  if (password.match(/^\w+$/) || password.match(/^\d+$/)) {
    score -= 10
  }

  if (score > 100) {
    score = 100
  }

  if (score < 0) {
    score = 0
  }

  return score
}
