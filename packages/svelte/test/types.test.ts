import { expectTypeOf, it } from 'vitest'
import { passwordStrength, type PasswordStrengthMeterProps, type PasswordStrengthOptions } from '../src/lib/index'

it('keeps the component-only props out of the helper options', () => {
  // @ts-expect-error showPercent is a component prop, not a helper option
  const options: PasswordStrengthOptions = { showPercent: true }
  passwordStrength(() => '', () => options)

  expectTypeOf<PasswordStrengthMeterProps>().toMatchTypeOf<PasswordStrengthOptions>()
  expectTypeOf<PasswordStrengthOptions>().toHaveProperty('commonPasswords')
})
