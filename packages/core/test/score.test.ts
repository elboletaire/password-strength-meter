import { describe, expect, it } from 'vitest'
import { calculateScore, checkRepetition, defaults, SCORE_CONTAINS_FIELD, SCORE_TOO_SHORT } from '../src'

const score = (password: string, field?: string, options: Partial<typeof defaults> = {}) =>
  calculateScore(password, { ...defaults, ...options }, field)

describe('checkRepetition', () => {
  it('removes single repeated characters', () => {
    expect(checkRepetition(1, 'aaaa')).toBe('a')
    expect(checkRepetition(1, 'abcd')).toBe('abcd')
  })

  it('removes repeated sequences of the given length', () => {
    expect(checkRepetition(2, 'abababab')).toBe('ab')
    expect(checkRepetition(3, 'abcabcabc')).toBe('abc')
    expect(checkRepetition(4, 'abcdabcdabcd')).toBe('abcd')
  })

  it('leaves strings shorter than twice the length untouched', () => {
    expect(checkRepetition(4, 'abcd')).toBe('abcd')
    expect(checkRepetition(2, '')).toBe('')
  })
})

describe('calculateScore', () => {
  it('returns -1 when the password is shorter than minimumLength', () => {
    expect(score('abc')).toBe(SCORE_TOO_SHORT)
    expect(score('12345', undefined, { minimumLength: 6 })).toBe(SCORE_TOO_SHORT)
    expect(score('123456', undefined, { minimumLength: 6 })).not.toBe(SCORE_TOO_SHORT)
  })

  it('checks the length before the field', () => {
    expect(score('abc', 'abc')).toBe(SCORE_TOO_SHORT)
  })

  it('returns -2 when the password equals the field, ignoring case', () => {
    expect(score('test', 'test')).toBe(SCORE_CONTAINS_FIELD)
    expect(score('TeSt', 'tEsT')).toBe(SCORE_CONTAINS_FIELD)
  })

  it('returns -2 when the password contains the field and fieldPartialMatch is on', () => {
    expect(score('tester', 'test')).toBe(SCORE_CONTAINS_FIELD)
    expect(score('tester', 'test', { fieldPartialMatch: false })).not.toBe(SCORE_CONTAINS_FIELD)
  })

  it('skips the partial match for an empty field', () => {
    expect(score('tester', '')).toBeGreaterThanOrEqual(0)
  })

  it('compares against an empty field when minimumLength allows an empty password', () => {
    expect(score('', '', { minimumLength: 0 })).toBe(SCORE_CONTAINS_FIELD)
    expect(score('', undefined, { minimumLength: 0 })).toBe(0)
  })

  it('legacy-compat: uses the field as an unescaped regular expression', () => {
    expect(score('axb1', 'a.b')).toBe(SCORE_CONTAINS_FIELD)
    expect(() => score('a(b1', 'a(b')).toThrow(SyntaxError)
  })

  it('scores the examples from the original test suite', () => {
    expect(score('tester')).toBe(14)
    expect(score('tester23')).toBe(37)
    expect(score('Tester23$')).toBe(91)
    expect(score('!Tester23$#')).toBe(100)
  })

  it('penalizes repetitions', () => {
    expect(score('aaaaaaaa')).toBeLessThan(score('abcdefgh'))
  })

  it('legacy-compat: counts commas as symbols', () => {
    // `.` is not a symbol, `,` only counts for the "two symbols" bonus (+5)
    expect(score('ab..cd')).toBe(23)
    expect(score('ab,,cd')).toBe(28)
  })

  it('legacy-compat: treats underscores as both symbols and word characters', () => {
    // +5 two symbols, +15 char and symbol, -10 "just chars" because \w matches `_`
    expect(score('ab__cd')).toBe(score('ab..cd') + 10)
  })

  it('clamps the score to 0..100', () => {
    expect(score('_~%8::%nqy^7e~!!z!;N')).toBe(100)
    // 4 points for the length, -10 for being just chars
    expect(score('a', undefined, { minimumLength: 0 })).toBe(0)
  })
})
