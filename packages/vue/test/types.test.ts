import { describe, expect, it } from 'vitest'
import { usePasswordStrength, type PasswordStrengthMeterProps, type PasswordStrengthOptions } from '../src'

describe('types', () => {
  it('keeps the component-only options out of the composable', () => {
    // @ts-expect-error showPercent is a component prop, not a composable option
    const strength = usePasswordStrength('abc', { showPercent: true })
    expect(strength.text.value).toBe('Use at least 8 characters')
  })

  it('accepts the core and binding options in the composable and the component', () => {
    const options: PasswordStrengthOptions = { commonPasswords: ['acme'], rules: { minLength: 8 }, userInputs: ['john'], locale: 'en' }
    const props: PasswordStrengthMeterProps = { ...options, password: 'abc', showPercent: true, showText: false, label: 'Strength', id: 'hint' }
    expect(props.password).toBe('abc')
    expect(usePasswordStrength('abc', options).result.value.valid).toBe(false)
  })
})
