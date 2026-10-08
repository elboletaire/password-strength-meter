import { describe, expect, it, vi } from 'vitest'
import { commonPasswords, createMeter, defaultOptions, evaluate } from '../src'
import { levelFor } from '../src/evaluate'

describe('levelFor', () => {
  it('picks the highest level whose lower bound is not above the percent', () => {
    expect(levelFor(0, defaultOptions.levels)).toBe('very-weak')
    expect(levelFor(20, defaultOptions.levels)).toBe('weak')
    expect(levelFor(79, defaultOptions.levels)).toBe('good')
    expect(levelFor(80, defaultOptions.levels)).toBe('strong')
  })

  it('falls back to the lowest level', () => {
    expect(levelFor(5, { ...defaultOptions.levels, 'very-weak': 10 })).toBe('very-weak')
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

  it('uses a custom estimator, with the user inputs', () => {
    const estimator = vi.fn(() => 42)
    const result = evaluate('anything', { estimator, userInputs: ['john'] })
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

  it('takes userInputs from the options and rejects passwords containing them', () => {
    const result = evaluate('xJohnx!pass', { userInputs: ['john'] })
    expect(result.valid).toBe(false)
    expect(result.message).toEqual({ key: 'rule.notUserInputs', params: {} })
    expect(evaluate('xJohnx!pass').valid).toBe(true)
  })

  it('uses commonPasswords for both the estimate and notCommon', () => {
    expect(evaluate('acmecorp', { commonPasswords: ['acmecorp'] }).message.key).toBe('rule.notCommon')
    expect(evaluate('password', { commonPasswords: [] }).rules.find((rule) => rule.id === 'notCommon')?.passed).toBe(true)
    expect(evaluate('acmecorp', { commonPasswords: [...commonPasswords, 'acmecorp'] }).message.key).toBe('rule.notCommon')
    expect(evaluate('acmecorp', { commonPasswords: [] }).bits).toBeGreaterThan(evaluate('acmecorp', { commonPasswords: ['acmecorp'] }).bits)
  })
})

describe('createMeter', () => {
  it('exposes the resolved options', () => {
    expect(createMeter({ rules: { numbers: 1 } }).options.rules).toEqual({ ...defaultOptions.rules, numbers: 1 })
  })

  it('evaluates purely: the same password gives the same result every time', () => {
    const meter = createMeter()
    const first = meter.evaluate('Xk9!mQ2#pL7&')
    expect(meter.evaluate('a')).toEqual(meter.evaluate('a'))
    expect(meter.evaluate('Xk9!mQ2#pL7&')).toEqual(first)
    expect(first).not.toHaveProperty('messageChanged')
  })

  it('takes user inputs as an argument', () => {
    const meter = createMeter()
    expect(meter.evaluate('xJohnx!pass', ['john']).message.key).toBe('rule.notUserInputs')
    expect(meter.evaluate('xJohnx!pass').valid).toBe(true)
  })

  it('returns the same results as evaluate()', () => {
    expect(createMeter().evaluate('Tester23$', ['john'])).toEqual(evaluate('Tester23$', { userInputs: ['john'] }))
    expect(createMeter({ rules: { numbers: 2 } }).evaluate('abcdefgh')).toEqual(evaluate('abcdefgh', { rules: { numbers: 2 } }))
  })

  it('does not share state between meters', () => {
    const rules = { numbers: 1 }
    const meter = createMeter({ rules })
    rules.numbers = 3
    expect(meter.options.rules.numbers).toBe(1)
    expect(createMeter().options.rules.numbers).toBe(0)
  })
})
