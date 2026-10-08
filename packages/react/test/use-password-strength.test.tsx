import { evaluate } from '@passcore/core'
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ca from '../../../locales/ca.json'
import { usePasswordStrength, type PasswordOptions } from '../src'

afterEach(() => cleanup())

const fixtures = [
  { password: '', percent: 0, level: 'empty', valid: false, text: 'Type your password' },
  { password: 'abc', percent: 7, level: 'very-weak', valid: false, text: 'Use at least 8 characters' },
  { password: 'password', percent: 8, level: 'very-weak', valid: false, text: 'This password is too common' },
  { password: 'Tester23$', percent: 30, level: 'weak', valid: true, text: 'Weak password' },
  { password: '!Tester23$#', percent: 43, level: 'fair', valid: true, text: 'Fair password' },
  { password: 'k8#Qz!2mWp', percent: 66, level: 'good', valid: true, text: 'Good password' },
  { password: 'correct horse battery staple', percent: 100, level: 'strong', valid: true, text: 'Strong password' },
] as const

interface ProbeProps {
  password: string
  options?: PasswordOptions
}

function useProbe({ password, options }: ProbeProps) {
  return usePasswordStrength(password, options)
}

const useWith = (password: string, options?: PasswordOptions) =>
  renderHook(useProbe, { initialProps: { password, options } }).result.current

describe('usePasswordStrength', () => {
  it.each(fixtures)('evaluates "$password"', (fixture) => {
    const strength = useWith(fixture.password)
    expect(strength.percent).toBe(fixture.percent)
    expect(strength.level).toBe(fixture.level)
    expect(strength.valid).toBe(fixture.valid)
    expect(strength.text).toBe(fixture.text)
  })

  it.each(fixtures)('matches the core for "$password"', (fixture) => {
    const strength = useWith(fixture.password)
    const core = evaluate(fixture.password)
    expect(strength.percent).toBe(core.percent)
    expect(strength.level).toBe(core.level)
    expect(strength.valid).toBe(core.valid)
    expect(strength.bits).toBe(core.bits)
  })

  it('translates the level for aria-valuetext', () => {
    expect(useWith('').levelText).toBe('Type your password')
    expect(useWith('abc').levelText).toBe('Very weak password')
    expect(useWith('Tester23$').levelText).toBe('Weak password')
  })

  it('rejects passwords containing a user input', () => {
    const strength = useWith('johndoe99', { userInputs: ['johndoe'] })
    expect(strength.valid).toBe(false)
    expect(strength.text).toBe('Don\'t use your personal details')
  })

  it('re-evaluates when the user inputs change', () => {
    const { result, rerender } = renderHook(useProbe, {
      initialProps: { password: 'johndoe99', options: { userInputs: ['johndoe'] } },
    })
    expect(result.current.text).toBe('Don\'t use your personal details')
    rerender({ password: 'johndoe99', options: { userInputs: ['someone'] } })
    expect(result.current.text).not.toBe('Don\'t use your personal details')
  })

  it('overrides texts partially, with {{count}} placeholders', () => {
    const strength = useWith('abc', { translations: { rule: { minLength_other: 'Min {{count}}!' } } })
    expect(strength.text).toBe('Min 8!')
  })

  it('renders a bundled language with locale', () => {
    expect(useWith('', { translations: ca, locale: 'ca' }).text).toBe('Escriu la teva contrasenya')
    expect(useWith('abc', { translations: ca, locale: 'ca' }).text).toBe('Fes servir almenys 8 caràcters')
    const good = useWith('k8#Qz!2mWp', { translations: ca, locale: 'ca' })
    expect(good.text).toBe('Contrasenya bona')
    expect(good.levelText).toBe('Contrasenya bona')
  })

  it('uses a translate function with count', () => {
    const calls: Array<[string, unknown]> = []
    const strength = useWith('abc', {
      translate: (key, params) => {
        calls.push([key, params])
        return `t(${key})`
      },
    })
    expect(strength.text).toBe('t(rule.minLength)')
    expect(strength.levelText).toBe('t(level.very-weak)')
    expect(calls).toContainEqual(['rule.minLength', { min: 8, count: 8 }])
  })

  it('passes core options through', () => {
    expect(useWith('xkqz', { rules: { minLength: 4, numbers: 1 } }).text).toBe('Add a number')
    expect(useWith('abcdefgh', { targetBits: 10 }).percent).toBe(100)
  })

  it('keeps the same result when rules are equal by value', () => {
    const { result, rerender } = renderHook(useProbe, {
      initialProps: { password: 'k8#Qz!2mWp', options: { rules: { minLength: 8 } } },
    })
    const first = result.current
    rerender({ password: 'k8#Qz!2mWp', options: { rules: { minLength: 8 } } })
    expect(result.current).toBe(first)
  })

  it('refreshes the texts when the locale changes, even with a stable translate function', () => {
    let language = 'en'
    const stable = (key: string) => `${language}:${key}`
    const { result, rerender } = renderHook(useProbe, {
      initialProps: { password: 'abc', options: { translate: stable, locale: 'en' } } as ProbeProps,
    })
    expect(result.current.text).toBe('en:rule.minLength')
    expect(result.current.levelText).toBe('en:level.very-weak')

    language = 'es'
    rerender({ password: 'abc', options: { translate: stable, locale: 'es' } })
    expect(result.current.text).toBe('es:rule.minLength')
    expect(result.current.levelText).toBe('es:level.very-weak')
  })
})
