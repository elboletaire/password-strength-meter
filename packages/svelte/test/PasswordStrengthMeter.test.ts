import { cleanup, render, screen } from '@testing-library/svelte'
import { afterEach, describe, expect, it } from 'vitest'
import ca from '../../../locales/ca.json'
import { evaluate } from '@passcore/core'
import { PasswordStrengthMeter } from '../src/lib/index'

afterEach(cleanup)

const wrapper = (): HTMLElement => document.querySelector('.pass-wrapper') as HTMLElement
const meter = (): HTMLElement => screen.getByRole('meter')
const text = (): HTMLElement | null => document.querySelector('.pass-text')

describe('PasswordStrengthMeter', () => {
  describe('markup', () => {
    it('renders an ARIA meter with a bar next to the input', () => {
      render(PasswordStrengthMeter, { props: { password: '' } })
      expect(wrapper().querySelector(':scope > .pass-meter > .pass-bar')).not.toBeNull()
      expect(meter().getAttribute('aria-label')).toBe('Password strength')
      expect(meter().getAttribute('aria-valuemin')).toBe('0')
      expect(meter().getAttribute('aria-valuemax')).toBe('100')
    })

    it('sets the ARIA values and the bar width', () => {
      render(PasswordStrengthMeter, { props: { password: 'k8#Qz!2mWp' } })
      expect(meter().getAttribute('aria-valuenow')).toBe('66')
      expect(meter().getAttribute('aria-valuetext')).toBe('Good password')
      expect((document.querySelector('.pass-bar') as HTMLElement).style.width).toBe('66%')
    })

    it('renders the text with aria-live and the id prop', () => {
      render(PasswordStrengthMeter, { props: { password: '', id: 'pw-strength' } })
      expect(text()?.id).toBe('pw-strength')
      expect(text()?.getAttribute('aria-live')).toBe('polite')
      expect(text()?.textContent).toBe('Type your password')
    })

    it('does not render the percent by default', () => {
      render(PasswordStrengthMeter, { props: { password: 'Tester23$' } })
      expect(document.querySelector('.pass-percent')).toBeNull()
    })

    it('merges the class prop with the standard classes', () => {
      render(PasswordStrengthMeter, { props: { password: '', class: 'my-meter' } })
      expect(wrapper().classList.contains('pass-wrapper')).toBe(true)
      expect(wrapper().classList.contains('my-meter')).toBe(true)
    })
  })

  describe('levels', () => {
    const fixtures: Array<[string, number, string, boolean, string]> = [
      ['', 0, 'empty', false, 'Type your password'],
      ['abc', 7, 'very-weak', false, 'Use at least 8 characters'],
      ['password', 8, 'very-weak', false, 'This password is too common'],
      ['Tester23$', 30, 'weak', true, 'Weak password'],
      ['!Tester23$#', 43, 'fair', true, 'Fair password'],
      ['k8#Qz!2mWp', 66, 'good', true, 'Good password'],
      ['correct horse battery staple', 100, 'strong', true, 'Strong password'],
    ]

    it.each(fixtures)('renders %j as %i%% (%s, valid %s)', (password, percent, level, valid, message) => {
      render(PasswordStrengthMeter, { props: { password, showPercent: true } })
      expect(wrapper().classList.contains(`pass-level-${level}`)).toBe(true)
      expect(wrapper().classList.contains('pass-invalid')).toBe(!valid)
      expect(meter().getAttribute('aria-valuenow')).toBe(String(percent))
      expect(document.querySelector('.pass-percent')?.textContent).toBe(`${percent}%`)
      expect(text()?.textContent).toBe(message)
    })

    it('shows the first failing rule and marks the meter invalid', () => {
      render(PasswordStrengthMeter, { props: { password: 'abc' } })
      expect(wrapper().classList.contains('pass-invalid')).toBe(true)
      expect(text()?.textContent).toBe('Use at least 8 characters')
      expect(meter().getAttribute('aria-valuetext')).toBe('Very weak password')
    })

    it('matches the core for the fixtures', () => {
      for (const [password] of fixtures) {
        const { unmount } = render(PasswordStrengthMeter, { props: { password } })
        const expected = evaluate(password)
        expect(meter().getAttribute('aria-valuenow')).toBe(String(expected.percent))
        expect(wrapper().classList.contains(`pass-level-${expected.level}`)).toBe(true)
        unmount()
      }
    })
  })

  describe('options', () => {
    it('shows the percent when showPercent is true', () => {
      render(PasswordStrengthMeter, { props: { password: 'Tester23$', showPercent: true } })
      expect(document.querySelector('.pass-percent')?.textContent).toBe('30%')
    })

    it('does not render the text when showText is false', () => {
      render(PasswordStrengthMeter, { props: { password: 'Tester23$', showText: false } })
      expect(text()).toBeNull()
    })

    it('uses label as the aria-label of the meter', () => {
      render(PasswordStrengthMeter, { props: { password: '', label: 'Contrasenya' } })
      expect(meter().getAttribute('aria-label')).toBe('Contrasenya')
    })

    it('inserts texts as text, not HTML', () => {
      render(PasswordStrengthMeter, { props: { password: '', translations: { empty: '<b>Type</b>' } } })
      expect(text()?.textContent).toBe('<b>Type</b>')
      expect(text()?.querySelector('b')).toBeNull()
    })

    it('overrides texts partially, with {{count}} placeholders', () => {
      render(PasswordStrengthMeter, {
        props: { password: 'abc', translations: { rule: { minLength_other: 'Min {{count}}!' } } },
      })
      expect(text()?.textContent).toBe('Min 8!')
    })

    it('renders a bundled language with locale', () => {
      render(PasswordStrengthMeter, { props: { password: '', translations: ca, locale: 'ca' } })
      expect(text()?.textContent).toBe('Escriu la teva contrasenya')
      expect(meter().getAttribute('aria-valuetext')).toBe('Escriu la teva contrasenya')
    })

    it('uses a translate function, with count for plural rules', () => {
      const calls: Array<[string, unknown]> = []
      render(PasswordStrengthMeter, {
        props: {
          password: 'abc',
          translate: (key: string, params?: unknown) => {
            calls.push([key, params])
            return `t(${key})`
          },
        },
      })
      expect(text()?.textContent).toBe('t(rule.minLength)')
      expect(meter().getAttribute('aria-valuetext')).toBe('t(level.very-weak)')
      expect(calls).toContainEqual(['rule.minLength', { min: 8, count: 8 }])
    })

    it('rejects passwords containing a user input', () => {
      render(PasswordStrengthMeter, { props: { password: 'johndoe99', userInputs: ['johndoe'] } })
      expect(wrapper().classList.contains('pass-invalid')).toBe(true)
      expect(text()?.textContent).toBe('Don\'t use your personal details')
    })

    it('passes core options through', () => {
      render(PasswordStrengthMeter, { props: { password: 'xkqz', rules: { minLength: 4, numbers: 1 } } })
      expect(text()?.textContent).toBe('Add a number')
    })
  })
})
