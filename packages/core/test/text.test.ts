import { describe, expect, it } from 'vitest'
import { defaults, scoreText } from '../src'

describe('scoreText', () => {
  it('returns shortPass for -1 and containsField for -2', () => {
    expect(scoreText(-1, defaults)).toBe(defaults.shortPass)
    expect(scoreText(-2, defaults)).toBe(defaults.containsField)
  })

  it('returns the message of the highest step below the score', () => {
    expect(scoreText(4, defaults)).toBe(defaults.shortPass)
    expect(scoreText(13, defaults)).toBe(defaults.shortPass)
    expect(scoreText(14, defaults)).toBe('Really insecure password')
    expect(scoreText(44, defaults)).toBe('Weak; try combining letters & numbers')
    expect(scoreText(91, defaults)).toBe('Medium; try using special characters')
    expect(scoreText(100, defaults)).toBe('Strong password')
  })

  it('does not depend on the order the steps are declared in', () => {
    const steps = { 94: 'strong', 67: 'medium', 33: 'weak', 13: 'insecure' }
    expect(scoreText(100, { ...defaults, steps })).toBe('strong')
    expect(scoreText(50, { ...defaults, steps })).toBe('weak')
  })

  it('legacy-compat: sorts step keys as strings', () => {
    const steps = { 5: 'five', 9: 'nine', 50: 'fifty', 100: 'hundred' }
    // visited as 100, 5, 50, 9: "nine" wins for any score above 9
    expect(scoreText(6, { ...defaults, steps })).toBe('five')
    expect(scoreText(60, { ...defaults, steps })).toBe('nine')
    expect(scoreText(100, { ...defaults, steps })).toBe('nine')
  })
})
