import { evaluate } from '@passcore/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ca from '../../../locales/ca.json'
import { passwordStrength } from '../src/lib/strength.svelte.js'

const created = vi.hoisted(() => ({ count: 0 }))

// count the meters created: the word list must be prepared once, not on every keystroke
vi.mock('@passcore/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@passcore/core')>()
  return {
    ...actual,
    createMeter: (options?: Parameters<typeof actual.createMeter>[0]) => {
      created.count++
      return actual.createMeter(options)
    },
  }
})

beforeEach(() => {
  created.count = 0
})

describe('passwordStrength', () => {
  it('evaluates the password with the default options', () => {
    let password = $state('')
    const strength = passwordStrength(() => password)
    expect(strength.result.level).toBe('empty')
    expect(strength.text).toBe('Type your password')
    expect(strength.levelText).toBe('Type your password')

    password = 'abc'
    expect(strength.result.valid).toBe(false)
    expect(strength.text).toBe('Use at least 8 characters')
    expect(strength.levelText).toBe('Very weak password')
  })

  it('follows the password as it changes', () => {
    let password = $state('k8#Qz!2mWp')
    const strength = passwordStrength(() => password)
    expect(strength.result.level).toBe('good')
    expect(strength.text).toBe('Good password')

    password = 'password'
    expect(strength.text).toBe('This password is too common')
  })

  it('matches the core for the fixtures', () => {
    const fixtures = ['', 'abc', 'password', 'Tester23$', '!Tester23$#', 'k8#Qz!2mWp', 'correct horse battery staple']
    for (const password of fixtures) {
      const strength = passwordStrength(() => password)
      const expected = evaluate(password)
      expect(strength.result.percent).toBe(expected.percent)
      expect(strength.result.level).toBe(expected.level)
      expect(strength.result.valid).toBe(expected.valid)
    }
  })

  it('passes user inputs and core options through', () => {
    let password = $state('johndoe99')
    const strength = passwordStrength(() => password, () => ({ userInputs: ['johndoe'] }))
    expect(strength.result.valid).toBe(false)
    expect(strength.text).toBe('Don\'t use your personal details')

    password = 'xkqz'
    const withRules = passwordStrength(() => password, () => ({ rules: { minLength: 4, numbers: 1 } }))
    expect(withRules.text).toBe('Add a number')
  })

  it('uses the translations, the locale and the translate function', () => {
    const catalan = passwordStrength(() => '', () => ({ translations: ca, locale: 'ca' }))
    expect(catalan.text).toBe('Escriu la teva contrasenya')

    const overridden = passwordStrength(() => 'abc', () => ({ translations: { rule: { minLength_other: 'Min {{count}}!' } } }))
    expect(overridden.text).toBe('Min 8!')

    const calls: Array<[string, unknown]> = []
    const translated = passwordStrength(() => 'abc', () => ({
      translate: (key, params) => {
        calls.push([key, params])
        return `t(${key})`
      },
    }))
    expect(translated.text).toBe('t(rule.minLength)')
    expect(translated.levelText).toBe('t(level.very-weak)')
    expect(calls).toContainEqual(['rule.minLength', { min: 8, count: 8 }])
  })

  it('creates the core meter once per set of meter options, not on every keystroke', () => {
    let password = $state('')
    const strength = passwordStrength(() => password)
    for (const value of ['a', 'ab', 'abc', 'abcd', 'abcde']) {
      password = value
      void strength.text
    }
    expect(created.count).toBe(1)
  })

  it('recreates the meter only when the rules change by value', () => {
    let rules = $state({ minLength: 8 })
    const password = 'abc'
    const strength = passwordStrength(() => password, () => ({ rules }))
    void strength.text
    expect(created.count).toBe(1)

    rules = { minLength: 8 }
    void strength.text
    expect(created.count).toBe(1)

    rules = { minLength: 4 }
    expect(strength.text).toBe('Use at least 4 characters')
    expect(created.count).toBe(2)
  })

  it('uses the common passwords it is given', () => {
    const strength = passwordStrength(() => 'zebra-horse', () => ({ commonPasswords: ['zebra-horse'] }))
    expect(strength.result.valid).toBe(false)
    expect(strength.text).toBe('This password is too common')
  })

  it('refreshes the texts when the locale changes, even with a stable translate function', () => {
    let language = 'en'
    const stable = (key: string) => `${language}:${key}`
    // a single prop changes, as in a component: only what reads `locale` is invalidated
    const options = $state<{ translate: (key: string) => string, locale: string }>({ translate: stable, locale: 'en' })
    const strength = passwordStrength(() => 'abc', () => options)
    expect(strength.text).toBe('en:rule.minLength')
    expect(strength.levelText).toBe('en:level.very-weak')

    language = 'es'
    options.locale = 'es'
    expect(strength.text).toBe('es:rule.minLength')
    expect(strength.levelText).toBe('es:level.very-weak')
  })
})
