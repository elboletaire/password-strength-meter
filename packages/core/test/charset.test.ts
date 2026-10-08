import { describe, expect, it } from 'vitest'
import { classify, poolSize } from '../src/charset'

describe('classify', () => {
  it('classifies ASCII letters, digits and symbols', () => {
    expect(classify('a')).toBe('lower')
    expect(classify('Z')).toBe('upper')
    expect(classify('5')).toBe('digit')
    expect(classify('!')).toBe('symbol')
    expect(classify('~')).toBe('symbol')
    expect(classify(' ')).toBe('symbol')
  })

  it('puts anything else in "other"', () => {
    expect(classify('ñ')).toBe('other')
    expect(classify('🔒')).toBe('other')
    expect(classify('\t')).toBe('other')
  })
})

describe('poolSize', () => {
  it('sums the sizes of the classes present', () => {
    expect(poolSize(['a', 'b'])).toBe(26)
    expect(poolSize(['a', '1'])).toBe(36)
    expect(poolSize(['a', 'B', '1', '!'])).toBe(95)
    expect(poolSize(['ñ'])).toBe(100)
    expect(poolSize([])).toBe(0)
  })
})
