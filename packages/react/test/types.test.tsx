import { describe, expect, it } from 'vitest'
import { usePasswordStrength, type PasswordStrengthMeterProps } from '../src'

describe('types', () => {
  it('keeps the component props out of the hook options', () => {
    // compile-time check: the hook is never called here, since hooks need a render
    const useTypeCheck = () => usePasswordStrength('', {
      // @ts-expect-error showPercent is a component prop, not a hook option
      showPercent: true,
    })
    expect(typeof useTypeCheck).toBe('function')
  })

  it('accepts the display props on the component', () => {
    const props: PasswordStrengthMeterProps = { password: '', showPercent: true, showText: false, label: 'Strength' }
    expect(props.showPercent).toBe(true)
  })
})
