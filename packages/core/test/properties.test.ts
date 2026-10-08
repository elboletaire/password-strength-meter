import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { evaluate } from '../src'

const alphabet = [...'abcxyzABCXYZ0129!?#_ ', 'ñ', '🔒']
const password = fc.array(fc.constantFrom(...alphabet), { maxLength: 30 }).map((chars) => chars.join(''))

describe('properties', () => {
  it('never lowers the estimate when a character is appended (without known words)', () => {
    fc.assert(fc.property(password, fc.constantFrom(...alphabet), (value, char) => {
      const before = evaluate(value, { commonPasswords: [] }).bits
      const after = evaluate(value + char, { commonPasswords: [] }).bits
      expect(after).toBeGreaterThanOrEqual(before - 1e-9)
    }))
  })

  it('always returns an integer percent from 0 to 100', () => {
    fc.assert(fc.property(password, (value) => {
      const { percent } = evaluate(value)
      expect(Number.isInteger(percent)).toBe(true)
      expect(percent).toBeGreaterThanOrEqual(0)
      expect(percent).toBeLessThanOrEqual(100)
    }))
  })

  it('is valid exactly when every rule passes', () => {
    fc.assert(fc.property(password, (value) => {
      const result = evaluate(value, { rules: { numbers: 1, symbols: 1 } })
      expect(result.valid).toBe(result.rules.every((rule) => rule.passed))
    }))
  })
})
