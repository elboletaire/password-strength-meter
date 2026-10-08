import { evaluate } from '@passcore/core'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ca from '../../../locales/ca.json'
import { PasswordStrengthMeter } from '../src'

afterEach(() => cleanup())

const fixtures = [
  { password: '', percent: 0, level: 'empty', valid: false, text: 'Type your password', levelText: 'Type your password' },
  { password: 'abc', percent: 7, level: 'very-weak', valid: false, text: 'Use at least 8 characters', levelText: 'Very weak password' },
  { password: 'password', percent: 8, level: 'very-weak', valid: false, text: 'This password is too common', levelText: 'Very weak password' },
  { password: 'Tester23$', percent: 30, level: 'weak', valid: true, text: 'Weak password', levelText: 'Weak password' },
  { password: '!Tester23$#', percent: 43, level: 'fair', valid: true, text: 'Fair password', levelText: 'Fair password' },
  { password: 'k8#Qz!2mWp', percent: 66, level: 'good', valid: true, text: 'Good password', levelText: 'Good password' },
  { password: 'correct horse battery staple', percent: 100, level: 'strong', valid: true, text: 'Strong password', levelText: 'Strong password' },
] as const

const wrapperOf = (container: HTMLElement) => container.querySelector('.pass-wrapper') as HTMLElement

describe('<PasswordStrengthMeter>', () => {
  describe('markup', () => {
    it('renders an ARIA meter with a bar next to the input', () => {
      const { container } = render(<PasswordStrengthMeter password="Tester23$" />)
      const meter = screen.getByRole('meter', { name: 'Password strength' })
      expect(meter.getAttribute('aria-valuemin')).toBe('0')
      expect(meter.getAttribute('aria-valuemax')).toBe('100')
      expect(meter.getAttribute('aria-valuenow')).toBe('30')
      expect(meter.getAttribute('aria-valuetext')).toBe('Weak password')
      const bar = container.querySelector('.pass-wrapper > .pass-meter > .pass-bar') as HTMLElement
      expect(bar.getAttribute('style')).toBe('width: 30%;')
    })

    it.each(fixtures)('matches the core for "$password"', (fixture) => {
      const { container } = render(<PasswordStrengthMeter password={fixture.password} />)
      const core = evaluate(fixture.password)
      expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe(String(core.percent))
      expect(wrapperOf(container).classList).toContain(`pass-level-${core.level}`)
      expect(container.querySelector('.pass-text')?.textContent).toBe(fixture.text)
    })

    it.each(fixtures)('sets the level class and validity for "$password"', (fixture) => {
      const { container } = render(<PasswordStrengthMeter password={fixture.password} />)
      const wrapper = wrapperOf(container)
      expect(wrapper.classList).toContain(`pass-level-${fixture.level}`)
      expect(wrapper.classList.contains('pass-invalid')).toBe(!fixture.valid)
      expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe(fixture.levelText)
    })

    it('shows the first failing rule as the message', () => {
      const { container, rerender } = render(<PasswordStrengthMeter password="abc" />)
      expect(container.querySelector('.pass-text')?.textContent).toBe('Use at least 8 characters')
      expect(wrapperOf(container).classList).toContain('pass-invalid')
      rerender(<PasswordStrengthMeter password="password" />)
      expect(container.querySelector('.pass-text')?.textContent).toBe('This password is too common')
    })

    it('updates the bar width and ARIA values when the password changes', () => {
      const { container, rerender } = render(<PasswordStrengthMeter password="" />)
      rerender(<PasswordStrengthMeter password="correct horse battery staple" />)
      const bar = container.querySelector('.pass-bar') as HTMLElement
      expect(bar.getAttribute('style')).toBe('width: 100%;')
      expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe('Strong password')
      expect(wrapperOf(container).classList).toContain('pass-level-strong')
    })

    it('applies className to the wrapper', () => {
      const { container } = render(<PasswordStrengthMeter password="" className="my-meter" />)
      expect(wrapperOf(container).classList).toContain('my-meter')
      expect(wrapperOf(container).classList).toContain('pass-wrapper')
    })

    it('links the text with the id prop and is a polite live region', () => {
      const { container } = render(<PasswordStrengthMeter password="Tester23$" id="pw-strength" />)
      const text = container.querySelector('.pass-text') as HTMLElement
      expect(text.id).toBe('pw-strength')
      expect(text.getAttribute('aria-live')).toBe('polite')
      expect(text.textContent).toBe('Weak password')
    })
  })

  describe('options', () => {
    it('renders the percent when showPercent is true', () => {
      const { container } = render(<PasswordStrengthMeter password="Tester23$" showPercent />)
      expect(container.querySelector('.pass-percent')?.textContent).toBe('30%')
    })

    it('does not render the percent by default', () => {
      const { container } = render(<PasswordStrengthMeter password="Tester23$" />)
      expect(container.querySelector('.pass-percent')).toBeNull()
    })

    it('does not render the text when showText is false', () => {
      const { container } = render(<PasswordStrengthMeter password="Tester23$" showText={false} id="pw" />)
      expect(container.querySelector('.pass-text')).toBeNull()
    })

    it('uses label as the aria-label of the meter', () => {
      render(<PasswordStrengthMeter password="" label="Fortaleza" />)
      expect(screen.getByRole('meter', { name: 'Fortaleza' })).toBeTruthy()
    })

    it('inserts texts as text, not HTML', () => {
      const { container } = render(<PasswordStrengthMeter password="" translations={{ empty: '<b>Type</b>' }} />)
      expect(container.querySelector('b')).toBeNull()
      expect(container.querySelector('.pass-text')?.innerHTML).toBe('&lt;b&gt;Type&lt;/b&gt;')
    })

    it('overrides texts with translations', () => {
      const { container } = render(
        <PasswordStrengthMeter password="abc" translations={{ rule: { minLength_other: 'Min {{count}}!' } }} />,
      )
      expect(container.querySelector('.pass-text')?.textContent).toBe('Min 8!')
    })

    it('renders a bundled language with locale', () => {
      const { container } = render(<PasswordStrengthMeter password="k8#Qz!2mWp" translations={ca} locale="ca" />)
      expect(container.querySelector('.pass-text')?.textContent).toBe('Contrasenya bona')
      expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe('Contrasenya bona')
    })

    it('uses a translate function with count', () => {
      const { container } = render(
        <PasswordStrengthMeter password="abc" translate={(key) => `t(${key})`} />,
      )
      expect(container.querySelector('.pass-text')?.textContent).toBe('t(rule.minLength)')
    })

    it('rejects passwords containing a user input', () => {
      const { container } = render(<PasswordStrengthMeter password="johndoe99" userInputs={['johndoe']} />)
      expect(container.querySelector('.pass-text')?.textContent).toBe('Don\'t use your personal details')
      expect(wrapperOf(container).classList).toContain('pass-invalid')
    })

    it('passes core options through', () => {
      const { container } = render(<PasswordStrengthMeter password="xkqz" rules={{ minLength: 4, numbers: 1 }} />)
      expect(container.querySelector('.pass-text')?.textContent).toBe('Add a number')
    })
  })
})
