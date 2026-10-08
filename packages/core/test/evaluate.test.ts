import { describe, expect, it, vi } from 'vitest'
import { commonPasswords, createMeter, defaults, evaluate, levelFor } from '../src'

describe('levelFor', () => {
  it('picks the highest level whose lower bound is not above the percent', () => {
    expect(levelFor(0, defaults.levels)).toBe('very-weak')
    expect(levelFor(20, defaults.levels)).toBe('weak')
    expect(levelFor(79, defaults.levels)).toBe('good')
    expect(levelFor(80, defaults.levels)).toBe('strong')
  })

  it('falls back to the lowest level', () => {
    expect(levelFor(5, { ...defaults.levels, 'very-weak': 10 })).toBe('very-weak')
  })
})

describe('evaluate', () => {
  it('reports an empty password', () => {
    expect(evaluate('')).toEqual({
      bits: 0,
      percent: 0,
      level: 'empty',
      valid: false,
      rules: [
        { id: 'minLength', passed: false, params: { min: 8 } },
        { id: 'notCommon', passed: true, params: {} },
        { id: 'notUserInputs', passed: true, params: {} },
      ],
      message: { key: 'empty', params: {} },
    })
  })

  it('treats an empty password as valid when no rule fails', () => {
    expect(evaluate('', { rules: { minLength: 0 } }).valid).toBe(true)
  })

  it('shows the first failing rule, in rule order', () => {
    expect(evaluate('abc', { rules: { numbers: 1 } }).message).toEqual({ key: 'rule.minLength', params: { min: 8 } })
    expect(evaluate('Xkqzwmtrpl', { rules: { numbers: 2 } }).message).toEqual({ key: 'rule.numbers', params: { min: 2 } })
  })

  it('shows the level when every rule passes', () => {
    const result = evaluate('k8#Qz!2mWp')
    expect(result.valid).toBe(true)
    expect(result.message).toEqual({ key: `level.${result.level}`, params: {} })
  })

  it('scales the percent with targetBits', () => {
    const { bits } = evaluate('k8#Qz!2mWp')
    expect(evaluate('k8#Qz!2mWp', { targetBits: bits }).percent).toBe(100)
    expect(evaluate('k8#Qz!2mWp', { targetBits: bits * 2 }).percent).toBe(50)
  })

  it('uses a custom estimator', () => {
    const estimator = vi.fn(() => 42)
    const result = evaluate('anything', { estimator }, ['john'])
    expect(estimator).toHaveBeenCalledWith('anything', ['john'])
    expect(result.bits).toBe(42)
    expect(result.percent).toBe(42)
    expect(result.level).toBe('fair')
  })

  it('treats invalid estimates as 0 bits', () => {
    expect(evaluate('anything', { estimator: () => Number.NaN }).bits).toBe(0)
    expect(evaluate('anything', { estimator: () => -5 }).bits).toBe(0)
  })

  it('keeps the built-in rules with a custom estimator', () => {
    expect(evaluate('password', { estimator: () => 100 }).valid).toBe(false)
  })

  it('uses commonWords for both the estimate and notCommon', () => {
    expect(evaluate('acmecorp', { commonWords: ['acmecorp'] }).message.key).toBe('rule.notCommon')
    expect(evaluate('password', { commonWords: [] }).rules.find((rule) => rule.id === 'notCommon')?.passed).toBe(true)
    expect(evaluate('acmecorp', { commonWords: [...commonPasswords, 'acmecorp'] }).message.key).toBe('rule.notCommon')
    expect(evaluate('acmecorp', { commonWords: [] }).bits).toBeGreaterThan(evaluate('acmecorp', { commonWords: ['acmecorp'] }).bits)
  })
})

describe('createMeter', () => {
  it('exposes the resolved options', () => {
    expect(createMeter({ rules: { numbers: 1 } }).options.rules).toEqual({ ...defaults.rules, numbers: 1 })
  })

  it('reports message changes between evaluations', () => {
    const meter = createMeter()
    expect(meter.evaluate('').messageChanged).toBe(false)
    expect(meter.evaluate('a').messageChanged).toBe(true)
    expect(meter.evaluate('ab').messageChanged).toBe(false)
    expect(meter.evaluate('Xk9!mQ2#pL7&').messageChanged).toBe(true)
    expect(meter.evaluate('Xk9!mQ2#pL7&').messageChanged).toBe(false)
  })

  it('reports param changes as message changes', () => {
    const meter = createMeter({ rules: { minLength: 0, numbers: 1 } })
    meter.evaluate('abc')
    const other = createMeter({ rules: { minLength: 0, numbers: 2 } })
    other.evaluate('abc')
    expect(meter.evaluate('abc').message.params).toEqual({ min: 1 })
    expect(other.evaluate('abc').message.params).toEqual({ min: 2 })
  })

  it('returns the same results as evaluate()', () => {
    const { messageChanged, ...result } = createMeter().evaluate('Tester23$', ['john'])
    expect(messageChanged).toBe(true)
    expect(result).toEqual(evaluate('Tester23$', {}, ['john']))
  })
})
