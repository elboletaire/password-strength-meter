import { describe, expect, it } from 'vitest'
import { characterBits, isPattern } from '../src/patterns'
import { toChars } from '../src/normalize'

const pattern = (value: string) => toChars(value).map((_, i, chars) => isPattern(chars, i))

describe('isPattern', () => {
  it('never marks the first character', () => {
    expect(pattern('a')).toEqual([false])
  })

  it('marks repeated characters', () => {
    expect(pattern('aaa')).toEqual([false, true, true])
  })

  it('marks ascending and descending sequences within a class', () => {
    expect(pattern('abc')).toEqual([false, true, true])
    expect(pattern('cba')).toEqual([false, true, true])
    expect(pattern('321')).toEqual([false, true, true])
  })

  it('does not mark a sequence that reverses direction', () => {
    expect(pattern('aba')).toEqual([false, true, false])
  })

  it('does not mark sequences across classes', () => {
    expect(pattern('Ab')).toEqual([false, false])
  })

  it('marks neighbours on a QWERTY row, case-insensitively', () => {
    expect(pattern('qwer')).toEqual([false, true, true, true])
    expect(pattern('ASDF')).toEqual([false, true, true, true])
    expect(pattern('qe')).toEqual([false, false])
  })

  it('marks repeated blocks from their second character', () => {
    expect(pattern('xkqxkq')).toEqual([false, false, false, false, true, true])
    expect(pattern('k9k9')).toEqual([false, false, false, true])
  })
})

describe('characterBits', () => {
  it('gives free characters log2(pool) bits and pattern characters 1 bit', () => {
    expect(characterBits(['x', 'x'], 26)).toEqual([Math.log2(26), 1])
  })
})
