import { describe, expect, it } from 'vitest'
import { toChars } from '../src/normalize'
import { findWords, prepareWords } from '../src/words'

describe('prepareWords', () => {
  it('normalizes, deduplicates and drops words shorter than 4 characters', () => {
    const words = prepareWords(['password', 'Password', 'p@ssword', 'abc'])
    expect(Array.from(words.set)).toEqual(['password'])
    expect(words.baseBits).toBe(1) // log2(max(1, 2))
  })

  it('bases the word bits on the list size', () => {
    expect(prepareWords(['aaaa', 'bbbb', 'cccc', 'dddd']).baseBits).toBe(2)
  })
})

describe('findWords', () => {
  it('finds common words anywhere', () => {
    expect(findWords(toChars('mypassword'), prepareWords(['password']), []))
      .toEqual([{ start: 2, end: 10, bits: 1 }])
  })

  it('adds 1 bit per uppercase letter and leet substitution', () => {
    expect(findWords(toChars('P@ssword'), prepareWords(['password']), []))
      .toEqual([{ start: 0, end: 8, bits: 3 }])
  })

  it('finds user-input tokens', () => {
    expect(findWords(toChars('xjohnx'), prepareWords([]), [toChars('john')]))
      .toEqual([{ start: 1, end: 5, bits: 2 }])
  })

  it('keeps the longest matches without overlapping', () => {
    expect(findWords(toChars('password'), prepareWords(['pass', 'password', 'word']), []))
      .toEqual([{ start: 0, end: 8, bits: Math.log2(3) }])
  })
})
