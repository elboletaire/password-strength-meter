import { effectScope, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { evaluate } from '@passcore/core'
import ca from '../../../locales/ca.json'
import { usePasswordStrength, type PasswordStrengthOptions } from '../src/use-password-strength'
import { fixtures } from './fixtures'

type Password = Parameters<typeof usePasswordStrength>[0]

/** Runs the composable in its own scope, as a component's setup would. */
function strength(password: Password, options?: Parameters<typeof usePasswordStrength>[1]) {
  const scope = effectScope()
  const returned = scope.run(() => usePasswordStrength(password, options))
  if (!returned) {
    throw new Error('the scope did not run')
  }
  return returned
}

describe('usePasswordStrength', () => {
  describe('fixtures', () => {
    it.each(fixtures)('evaluates $password', ({ password, percent, level, valid, text, levelText }) => {
      const { result, text: translated, levelText: translatedLevel } = strength(password)
      expect(result.value.percent).toBe(percent)
      expect(result.value.level).toBe(level)
      expect(result.value.valid).toBe(valid)
      expect(translated.value).toBe(text)
      expect(translatedLevel.value).toBe(levelText)
    })

    it.each(fixtures)('matches the core for $password', ({ password }) => {
      const { result } = strength(password)
      const core = evaluate(password)
      expect(result.value.percent).toBe(core.percent)
      expect(result.value.level).toBe(core.level)
      expect(result.value.message).toEqual(core.message)
      expect(result.value).not.toHaveProperty('messageChanged')
    })
  })

  it('reads reactive passwords', () => {
    const password = ref('')
    const { text } = strength(password)
    expect(text.value).toBe('Type your password')
    password.value = 'abc'
    expect(text.value).toBe('Use at least 8 characters')
  })

  it('reads getters', () => {
    const password = 'abc'
    const { text } = strength(() => password)
    expect(text.value).toBe('Use at least 8 characters')
  })

  it('shows the first failing rule with its params', () => {
    const { result, text } = strength('abc')
    expect(result.value.message).toEqual({ key: 'rule.minLength', params: { min: 8 } })
    expect(text.value).toBe('Use at least 8 characters')
  })

  it('rejects passwords containing user inputs, read from the options', () => {
    const options = ref<PasswordStrengthOptions>({ userInputs: ['johndoe'] })
    const { result, text } = strength('johndoe99', options)
    expect(result.value.valid).toBe(false)
    expect(text.value).toBe('Don\'t use your personal details')

    options.value = { userInputs: ['someone'] }
    expect(text.value).not.toBe('Don\'t use your personal details')
  })

  it('passes core rules through', () => {
    const { text } = strength('xkqz', { rules: { minLength: 4, numbers: 1 } })
    expect(text.value).toBe('Add a number')
  })

  it('uses translations over the English defaults, with {{count}}', () => {
    const { text } = strength('abc', { translations: { rule: { minLength_other: 'Min {{count}}!' } } })
    expect(text.value).toBe('Min 8!')
  })

  it('renders a bundled language with locale', () => {
    const { text, levelText } = strength('k8#Qz!2mWp', { translations: ca, locale: 'ca' })
    expect(text.value).toBe('Contrasenya bona')
    expect(levelText.value).toBe('Contrasenya bona')
  })

  it('uses a translate function with count', () => {
    const calls: Array<[string, unknown]> = []
    const { text, levelText } = strength('abc', {
      translate: (key, params) => {
        calls.push([key, params])
        return `t(${key})`
      },
    })
    expect(text.value).toBe('t(rule.minLength)')
    expect(levelText.value).toBe('t(level.very-weak)')
    expect(calls).toContainEqual(['rule.minLength', { min: 8, count: 8 }])
  })

  it('keeps the same result when the options change by value', () => {
    const password = ref('k8#Qz!2mWp')
    const options = ref<PasswordStrengthOptions>({ rules: { minLength: 8 } })
    const { result } = strength(password, options)
    const first = result.value

    options.value = { rules: { minLength: 8 } }
    expect(result.value).toBe(first)

    options.value = { rules: { minLength: 12 } }
    expect(result.value).not.toBe(first)
    expect(result.value.valid).toBe(false)
  })

  it('does not evaluate again when only translations change', () => {
    const options = ref<PasswordStrengthOptions>({})
    const { result, text } = strength('abc', options)
    const first = result.value
    options.value = { translations: { empty: 'Empty' } }
    expect(result.value).toBe(first)
    expect(text.value).toBe('Use at least 8 characters')
  })

  it('refreshes the texts when the locale changes, even with a stable translate function', () => {
    let language = 'en'
    const stable = (key: string) => `${language}:${key}`
    const options = ref<PasswordStrengthOptions>({ translate: stable, locale: 'en' })
    const { text, levelText } = strength('abc', options)
    expect(text.value).toBe('en:rule.minLength')
    expect(levelText.value).toBe('en:level.very-weak')

    language = 'es'
    options.value = { translate: stable, locale: 'es' }
    expect(text.value).toBe('es:rule.minLength')
    expect(levelText.value).toBe('es:level.very-weak')
  })
})
