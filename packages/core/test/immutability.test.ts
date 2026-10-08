import { describe, expect, it } from 'vitest'
import { commonPasswords, createMeter, defaultOptions, evaluate } from '../src'

describe('frozen data', () => {
  it('freezes defaultOptions, its rules, levels and the common passwords', () => {
    expect(Object.isFrozen(defaultOptions)).toBe(true)
    expect(Object.isFrozen(defaultOptions.rules)).toBe(true)
    expect(Object.isFrozen(defaultOptions.levels)).toBe(true)
    expect(Object.isFrozen(defaultOptions.commonPasswords)).toBe(true)
  })

  it('throws when mutating defaultOptions', () => {
    expect(() => {
      (defaultOptions.rules as { minLength: number }).minLength = 1
    }).toThrow(TypeError)
    expect(() => {
      (defaultOptions.commonPasswords as string[]).push('acme')
    }).toThrow(TypeError)
    expect(defaultOptions.rules.minLength).toBe(8)
    expect(defaultOptions.commonPasswords).not.toContain('acme')
  })

  it('freezes commonPasswords', () => {
    expect(Object.isFrozen(commonPasswords)).toBe(true)
    expect(() => {
      (commonPasswords as string[]).push('acme')
    }).toThrow(TypeError)
    expect(commonPasswords).toHaveLength(200)
  })

  it('freezes the options of a meter', () => {
    const meter = createMeter({ rules: { numbers: 1 } })
    expect(Object.isFrozen(meter.options)).toBe(true)
    expect(Object.isFrozen(meter.options.rules)).toBe(true)
    expect(Object.isFrozen(meter.options.levels)).toBe(true)
    expect(Object.isFrozen(meter.options.commonPasswords)).toBe(true)
    expect(() => {
      (meter.options.rules as { numbers: number }).numbers = 5
    }).toThrow(TypeError)
  })
})

describe('no aliasing', () => {
  it('never lets a meter share objects with the defaults or with another meter', () => {
    const meter = createMeter()
    expect(meter.options).not.toBe(defaultOptions)
    expect(meter.options.rules).not.toBe(defaultOptions.rules)
    expect(meter.options.levels).not.toBe(defaultOptions.levels)
    expect(meter.options.commonPasswords).not.toBe(defaultOptions.commonPasswords)
    expect(createMeter().options.rules).not.toBe(meter.options.rules)
  })

  it('does not change a meter when the caller mutates the objects it passed in', () => {
    const rules: { numbers: number } = { numbers: 1 }
    const levels = { strong: 90 }
    const commonPasswords = ['acme']
    const meter = createMeter({ rules, levels, commonPasswords })

    rules.numbers = 9
    levels.strong = 10
    commonPasswords.push('other')

    expect(meter.options.rules.numbers).toBe(1)
    expect(meter.options.levels.strong).toBe(90)
    expect(meter.options.commonPasswords).toEqual(['acme'])
  })

  it('does not change the defaults when a meter option is mutated', () => {
    const rules: { minLength: number } = { minLength: 20 }
    createMeter({ rules })
    rules.minLength = 30
    expect(defaultOptions.rules.minLength).toBe(8)
    expect(evaluate('abcdefgh').valid).toBe(true)
  })

  it('does not change the defaults or other meters when evaluate() options are mutated', () => {
    const userInputs = ['john']
    const options = { rules: { numbers: 1 }, userInputs }
    expect(evaluate('abcdefgh1', options).valid).toBe(true)
    userInputs.push('abcdefgh')
    options.rules.numbers = 3
    expect(evaluate('abcdefgh1', { rules: { numbers: 1 } }).valid).toBe(true)
    expect(defaultOptions.rules.numbers).toBe(0)
  })
})

describe('results', () => {
  it('are frozen, down to their rules and message', () => {
    const result = evaluate('abc', { rules: { numbers: 1 } })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.rules)).toBe(true)
    expect(Object.isFrozen(result.rules[0])).toBe(true)
    expect(Object.isFrozen(result.message)).toBe(true)
    expect(Object.isFrozen(result.message.params)).toBe(true)
    expect(() => {
      (result.message as { key: string }).key = 'empty'
    }).toThrow(TypeError)
  })

  it('are never shared between evaluations', () => {
    const meter = createMeter()
    expect(meter.evaluate('abcdefgh')).not.toBe(meter.evaluate('abcdefgh'))
    expect(meter.evaluate('abcdefgh').rules).not.toBe(meter.evaluate('abcdefgh').rules)
  })

  it('does not freeze the functions it is given', () => {
    const estimator = () => 50
    createMeter({ estimator })
    evaluate('abc', { estimator })
    expect(Object.isFrozen(estimator)).toBe(false)
  })
})
