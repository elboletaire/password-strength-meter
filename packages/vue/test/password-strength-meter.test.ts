import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import ca from '../../../locales/ca.json'
import { PasswordStrengthMeter } from '../src'
import { fixtures } from './fixtures'

const wrapper = (container: Element) => container.querySelector('.pass-wrapper') as HTMLElement
const meterEl = (container: Element) => container.querySelector('.pass-meter') as HTMLElement
const text = (container: Element) => container.querySelector('.pass-text') as HTMLElement

describe('PasswordStrengthMeter', () => {
  afterEach(cleanup)

  describe('markup', () => {
    it('renders an ARIA meter with a bar', async () => {
      const { container } = render(PasswordStrengthMeter, { props: { password: 'k8#Qz!2mWp' } })
      expect(container.querySelector('.pass-wrapper > .pass-meter > .pass-bar')).not.toBeNull()
      expect(meterEl(container).getAttribute('role')).toBe('meter')
      expect(meterEl(container).getAttribute('aria-label')).toBe('Password strength')
      expect(meterEl(container).getAttribute('aria-valuemin')).toBe('0')
      expect(meterEl(container).getAttribute('aria-valuemax')).toBe('100')
      expect(meterEl(container).getAttribute('aria-valuenow')).toBe('66')
      expect(meterEl(container).getAttribute('aria-valuetext')).toBe('Good password')
      expect((container.querySelector('.pass-bar') as HTMLElement).style.width).toBe('66%')
    })

    it('links the text with the id prop and marks it polite', async () => {
      const { container } = render(PasswordStrengthMeter, { props: { password: 'abc', id: 'pw-hint' } })
      expect(text(container).id).toBe('pw-hint')
      expect(text(container).getAttribute('aria-live')).toBe('polite')
      expect(text(container).textContent).toBe('Use at least 8 characters')
    })

    it('renders no id when none is given', async () => {
      const { container } = render(PasswordStrengthMeter, { props: { password: 'abc' } })
      expect(text(container).hasAttribute('id')).toBe(false)
    })

    it('renders the percent only with showPercent', async () => {
      const without = render(PasswordStrengthMeter, { props: { password: 'k8#Qz!2mWp' } })
      expect(without.container.querySelector('.pass-percent')).toBeNull()
      without.unmount()

      const { container } = render(PasswordStrengthMeter, { props: { password: 'k8#Qz!2mWp', showPercent: true } })
      expect(container.querySelector('.pass-percent')?.textContent).toBe('66%')
    })

    it('does not render the text with showText false', async () => {
      const { container } = render(PasswordStrengthMeter, { props: { password: 'abc', showText: false } })
      expect(container.querySelector('.pass-text')).toBeNull()
    })

    it('uses label as the aria-label of the meter', async () => {
      const { container } = render(PasswordStrengthMeter, { props: { password: 'abc', label: 'Contrasenya' } })
      expect(meterEl(container).getAttribute('aria-label')).toBe('Contrasenya')
    })

    it('lets class and attributes fall through to the root element', async () => {
      const { container } = render(PasswordStrengthMeter, {
        props: { password: 'abc' },
        attrs: { 'class': 'my-meter', 'data-testid': 'meter' },
      })
      expect(wrapper(container).classList).toContain('my-meter')
      expect(wrapper(container).classList).toContain('pass-wrapper')
      expect(wrapper(container).getAttribute('data-testid')).toBe('meter')
    })
  })

  describe('levels', () => {
    it.each(fixtures)('renders $password as $level', ({ password, level, valid, percent, text: message }) => {
      const { container } = render(PasswordStrengthMeter, { props: { password, showPercent: true } })
      expect(wrapper(container).classList).toContain('pass-level-' + level)
      expect(wrapper(container).classList.contains('pass-invalid')).toBe(!valid)
      expect(meterEl(container).getAttribute('aria-valuenow')).toBe(String(percent))
      expect(text(container).textContent).toBe(message)
    })

    it('matches the core for every fixture', async () => {
      for (const { password, percent, level } of fixtures) {
        const { container, unmount } = render(PasswordStrengthMeter, { props: { password } })
        expect(meterEl(container).getAttribute('aria-valuenow')).toBe(String(percent))
        expect(wrapper(container).classList).toContain('pass-level-' + level)
        unmount()
      }
    })

    it('updates when the password changes', async () => {
      const { container, rerender } = render(PasswordStrengthMeter, { props: { password: '' } })
      expect(wrapper(container).classList).toContain('pass-level-empty')
      await rerender({ password: 'correct horse battery staple' })
      expect(wrapper(container).classList).toContain('pass-level-strong')
      expect(wrapper(container).classList.contains('pass-invalid')).toBe(false)
      expect((container.querySelector('.pass-bar') as HTMLElement).style.width).toBe('100%')
    })
  })

  describe('messages', () => {
    it('shows the first failing rule and marks the meter invalid', async () => {
      const { container } = render(PasswordStrengthMeter, { props: { password: 'password' } })
      expect(wrapper(container).classList).toContain('pass-invalid')
      expect(text(container).textContent).toBe('This password is too common')
      expect(meterEl(container).getAttribute('aria-valuetext')).toBe('Very weak password')
    })

    it('inserts texts as text, not HTML', async () => {
      const { container } = render(PasswordStrengthMeter, {
        props: { password: '', translations: { empty: '<b>Type</b>' } },
      })
      expect(text(container).textContent).toBe('<b>Type</b>')
      expect(text(container).querySelector('b')).toBeNull()
    })

    it('overrides texts partially', async () => {
      const { container } = render(PasswordStrengthMeter, {
        props: { password: 'abc', translations: { rule: { minLength_other: 'Min {{count}}!' } } },
      })
      expect(text(container).textContent).toBe('Min 8!')
    })

    it('renders a bundled language with locale', async () => {
      const { container } = render(PasswordStrengthMeter, {
        props: { password: 'abc', translations: ca, locale: 'ca' },
      })
      expect(text(container).textContent).toBe('Fes servir almenys 8 caràcters')
    })

    it('uses a translate function with count', async () => {
      const calls: Array<[string, unknown]> = []
      const { container } = render(PasswordStrengthMeter, {
        props: {
          password: 'abc',
          translate: (key: string, params?: unknown) => {
            calls.push([key, params])
            return `t(${key})`
          },
        },
      })
      expect(text(container).textContent).toBe('t(rule.minLength)')
      expect(meterEl(container).getAttribute('aria-valuetext')).toBe('t(level.very-weak)')
      expect(calls).toContainEqual(['rule.minLength', { min: 8, count: 8 }])
    })

    it('rejects passwords containing user inputs', async () => {
      const { container } = render(PasswordStrengthMeter, {
        props: { password: 'johndoe99', userInputs: ['johndoe'] },
      })
      expect(text(container).textContent).toBe('Don\'t use your personal details')
    })

    it('passes core rules through', async () => {
      const { container } = render(PasswordStrengthMeter, {
        props: { password: 'xkqz', rules: { minLength: 4, numbers: 1 } },
      })
      expect(text(container).textContent).toBe('Add a number')
    })
  })
})
