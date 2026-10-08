import { evaluate, type Result } from '@passcore/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ca from '../../../locales/ca.json'
import { createPasswordMeter, type PasswordMeterOptions } from '../src'

let input: HTMLInputElement

const wrapper = () => document.querySelector('.pass-wrapper') as HTMLElement
const meterEl = () => document.querySelector('.pass-meter') as HTMLElement
const bar = () => document.querySelector('.pass-bar') as HTMLElement
const text = () => document.querySelector('.pass-text') as HTMLElement
const typeValue = (value: string, field: HTMLInputElement = input) => {
  field.value = value
  field.dispatchEvent(new Event('input'))
}
const create = (options?: PasswordMeterOptions) => createPasswordMeter(input, options)

beforeEach(() => {
  document.body.innerHTML = `<div><input type="password" id="password" />
<input type="text" id="username" /></div>`
  input = document.querySelector('#password') as HTMLInputElement
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createPasswordMeter', () => {
  describe('markup', () => {
    it('renders an ARIA meter with a bar right after the input', () => {
      create()
      expect(input.nextElementSibling).toBe(wrapper())
      expect(wrapper().classList.contains('pass-wrapper')).toBe(true)
      expect(wrapper().querySelector(':scope > .pass-meter > .pass-bar')).not.toBeNull()
      expect(meterEl().getAttribute('role')).toBe('meter')
      expect(meterEl().getAttribute('aria-label')).toBe('Password strength')
      expect(meterEl().getAttribute('aria-valuemin')).toBe('0')
      expect(meterEl().getAttribute('aria-valuemax')).toBe('100')
    })

    it('links the text to the input for screen readers', () => {
      create()
      expect(text().id).toBe('password-strength')
      expect(text().getAttribute('aria-live')).toBe('polite')
      expect(input.getAttribute('aria-describedby')).toBe('password-strength')
    })

    it('keeps an existing aria-describedby', () => {
      input.setAttribute('aria-describedby', 'hint')
      create()
      expect(input.getAttribute('aria-describedby')).toBe('hint password-strength')
    })

    it('generates a text id for inputs without one', () => {
      input.removeAttribute('id')
      create()
      expect(text().id).toMatch(/^passcore-\d+-strength$/)
      expect(input.getAttribute('aria-describedby')).toBe(text().id)
    })

    it('omits the text and the link when showText is false', () => {
      create({ showText: false })
      expect(document.querySelector('.pass-text')).toBeNull()
      expect(input.hasAttribute('aria-describedby')).toBe(false)
    })

    it('renders the percent when showPercent is true', () => {
      create({ showPercent: true })
      expect((document.querySelector('.pass-percent') as HTMLElement).textContent).toBe('0%')
      typeValue('k8#Qz!2mWp')
      expect((document.querySelector('.pass-percent') as HTMLElement).textContent).toBe('66%')
    })

    it('does not render the percent by default', () => {
      create()
      expect(document.querySelector('.pass-percent')).toBeNull()
    })

    it('uses label as the aria-label of the meter', () => {
      create({ label: 'Fortaleza' })
      expect(meterEl().getAttribute('aria-label')).toBe('Fortaleza')
    })

    it('starts empty and invalid', () => {
      create()
      expect(wrapper().classList.contains('pass-level-empty')).toBe(true)
      expect(wrapper().classList.contains('pass-invalid')).toBe(true)
      expect(text().textContent).toBe('Type your password')
      expect(meterEl().getAttribute('aria-valuenow')).toBe('0')
      expect(meterEl().getAttribute('aria-valuetext')).toBe('Type your password')
    })

    it('sets the bar width as the only inline style', () => {
      create()
      typeValue('k8#Qz!2mWp')
      expect(bar().getAttribute('style')).toBe('width: 66%;')
    })
  })

  describe('levels', () => {
    it.each([
      ['', 0, 'empty', false, 'Type your password'],
      ['abc', 7, 'very-weak', false, 'Use at least 8 characters'],
      ['password', 8, 'very-weak', false, 'This password is too common'],
      ['Tester23$', 30, 'weak', true, 'Weak password'],
      ['!Tester23$#', 43, 'fair', true, 'Fair password'],
      ['k8#Qz!2mWp', 66, 'good', true, 'Good password'],
      ['correct horse battery staple', 100, 'strong', true, 'Strong password'],
    ])('renders %j as %i%% (%s)', (password, percent, level, valid, message) => {
      input.value = password
      create()
      expect(meterEl().getAttribute('aria-valuenow')).toBe(String(percent))
      expect(wrapper().classList.contains(`pass-level-${level}`)).toBe(true)
      expect(wrapper().classList.contains('pass-invalid')).toBe(!valid)
      expect(text().textContent).toBe(message)
      expect(bar().getAttribute('style')).toBe(`width: ${percent}%;`)
    })

    it('renders the level on input events, replacing the previous one', () => {
      create()
      typeValue('k8#Qz!2mWp')
      expect(wrapper().classList.contains('pass-level-good')).toBe(true)
      expect(wrapper().classList.contains('pass-level-empty')).toBe(false)
      expect(wrapper().classList.contains('pass-invalid')).toBe(false)
      expect(meterEl().getAttribute('aria-valuetext')).toBe('Good password')
    })

    it('shows the level text as aria-valuetext', () => {
      create()
      typeValue('correct horse battery staple')
      expect(meterEl().getAttribute('aria-valuetext')).toBe('Strong password')
    })

    it('shows the empty message again when the input is cleared', () => {
      create()
      typeValue('k8#Qz!2mWp')
      typeValue('')
      expect(wrapper().classList.contains('pass-level-empty')).toBe(true)
      expect(text().textContent).toBe('Type your password')
    })
  })

  describe('rules', () => {
    it('shows the first failing rule and marks the meter invalid', () => {
      create()
      typeValue('abc')
      expect(wrapper().classList.contains('pass-invalid')).toBe(true)
      expect(text().textContent).toBe('Use at least 8 characters')
      expect(meterEl().getAttribute('aria-valuetext')).toBe('Very weak password')

      typeValue('password')
      expect(text().textContent).toBe('This password is too common')
    })

    it('passes core rules through', () => {
      create({ rules: { minLength: 4, numbers: 1 } })
      typeValue('xkqz')
      expect(text().textContent).toBe('Add a number')
    })

    it('passes targetBits through', () => {
      input.value = 'Tester23$'
      create({ targetBits: 1000 })
      expect(meterEl().getAttribute('aria-valuenow')).toBe(String(evaluate('Tester23$', { targetBits: 1000 }).percent))
    })

    it.each([
      ['', 0, 'empty', false, 'Type your password'],
      ['abc', 7, 'very-weak', false, 'Use at least 8 characters'],
      ['password', 8, 'very-weak', false, 'This password is too common'],
      ['Tester23$', 30, 'weak', true, 'Weak password'],
      ['!Tester23$#', 43, 'fair', true, 'Fair password'],
      ['k8#Qz!2mWp', 66, 'good', true, 'Good password'],
      ['correct horse battery staple', 100, 'strong', true, 'Strong password'],
    ])('matches the core for %j', (password, percent, level, valid, message) => {
      input.value = password
      const meter = create()
      const expected = evaluate(password)
      expect(expected.percent).toBe(percent)
      expect(expected.level).toBe(level)
      expect(expected.valid).toBe(valid)
      expect(meter.result.percent).toBe(expected.percent)
      expect(meter.result.level).toBe(expected.level)
      expect(meter.result.valid).toBe(expected.valid)
      expect(meter.result.message).toEqual(expected.message)
      expect(text().textContent).toBe(message)
    })
  })

  describe('texts', () => {
    it('inserts texts as text, not HTML', () => {
      create({ translations: { empty: '<b>Type</b>' } })
      expect(text().innerHTML).toBe('&lt;b&gt;Type&lt;/b&gt;')
      expect(text().querySelector('b')).toBeNull()
    })

    it('overrides texts partially, with {{count}} placeholders', () => {
      create({ translations: { rule: { minLength_other: 'Min {{count}}!' } } })
      typeValue('abc')
      expect(text().textContent).toBe('Min 8!')
      typeValue('k8#Qz!2mWp')
      expect(text().textContent).toBe('Good password')
    })

    it('picks plural forms', () => {
      create({ rules: { minLength: 0, numbers: 1 } })
      typeValue('abc')
      expect(text().textContent).toBe('Add a number')
    })

    it('renders a bundled language with locale', () => {
      create({ translations: ca, locale: 'ca' })
      expect(text().textContent).toBe('Escriu la teva contrasenya')
      typeValue('abc')
      expect(text().textContent).toBe('Fes servir almenys 8 caràcters')
      typeValue('k8#Qz!2mWp')
      expect(text().textContent).toBe('Contrasenya bona')
      expect(meterEl().getAttribute('aria-valuetext')).toBe('Contrasenya bona')
    })

    it('uses a translate function, such as i18next\'s t, with count', () => {
      const translate = vi.fn((key: string) => `t(${key})`)
      create({ translate: translate as PasswordMeterOptions['translate'] })
      typeValue('abc')
      expect(text().textContent).toBe('t(rule.minLength)')
      expect(meterEl().getAttribute('aria-valuetext')).toBe('t(level.very-weak)')
      expect(translate).toHaveBeenCalledWith('rule.minLength', { min: 8, count: 8 })
    })
  })

  describe('userInputs', () => {
    it('rejects passwords containing a selector value, read on every evaluation', () => {
      ;(document.querySelector('#username') as HTMLInputElement).value = 'johndoe'
      create({ userInputs: ['#username'] })
      typeValue('johndoe99')
      expect(text().textContent).toBe('Don\'t use your personal details')

      ;(document.querySelector('#username') as HTMLInputElement).value = 'someone'
      typeValue('johndoe99')
      expect(text().textContent).not.toBe('Don\'t use your personal details')
    })

    it('accepts elements', () => {
      const username = document.querySelector('#username') as HTMLInputElement
      username.value = 'johndoe'
      create({ userInputs: [username] })
      typeValue('johndoe99')
      expect(text().textContent).toBe('Don\'t use your personal details')
    })

    it('reads every element matching a selector', () => {
      document.body.insertAdjacentHTML('beforeend', '<input type="text" class="personal" value="someone"><input type="text" class="personal" value="johndoe">')
      create({ userInputs: ['.personal'] })
      typeValue('johndoe99')
      expect(text().textContent).toBe('Don\'t use your personal details')
    })

    it('accepts a selector list as one string', () => {
      const username = document.querySelector('#username') as HTMLInputElement
      username.value = 'johndoe'
      document.body.insertAdjacentHTML('beforeend', '<input type="text" id="email" value="jane@example.com">')
      create({ userInputs: ['#username, #email'] })
      typeValue('jane@example.com!1')
      expect(text().textContent).toBe('Don\'t use your personal details')
    })

    it('accepts functions', () => {
      create({ userInputs: [() => 'johndoe'] })
      typeValue('johndoe99')
      expect(text().textContent).toBe('Don\'t use your personal details')
    })

    it('ignores empty fields and selectors matching nothing', () => {
      create({ userInputs: ['#username', '#missing'] })
      expect(() => typeValue('k8#Qz!2mWp')).not.toThrow()
      expect(text().textContent).toBe('Good password')
    })
  })

  describe('container', () => {
    it('appends the markup to a container element', () => {
      document.body.innerHTML = '<div class="field"><input id="password" type="password"></div>'
      input = document.querySelector('#password') as HTMLInputElement
      const field = document.querySelector('.field') as HTMLElement
      create({ container: field })
      expect(field.lastElementChild).toBe(wrapper())
      expect(field.classList.contains('pass-strength-visible')).toBe(true)
    })

    it('appends the markup to a container selector', () => {
      document.body.innerHTML = '<div class="field"><input id="password" type="password"></div>'
      input = document.querySelector('#password') as HTMLInputElement
      create({ container: '.field' })
      expect(document.querySelector('.field > .pass-wrapper')).not.toBeNull()
    })

    it('throws when the container is not found', () => {
      expect(() => create({ container: '#missing' })).toThrow(/#missing/)
    })

    it('throws when the input is not found', () => {
      expect(() => createPasswordMeter('#missing')).toThrow(/#missing/)
    })
  })

  describe('events and callbacks', () => {
    it('does not call callbacks or dispatch events on creation', () => {
      input.value = 'Tester23$'
      const onScore = vi.fn()
      const onText = vi.fn()
      const listener = vi.fn()
      document.addEventListener('passcore:score', listener)
      create({ onScore, onText })
      expect(onScore).not.toHaveBeenCalled()
      expect(onText).not.toHaveBeenCalled()
      expect(listener).not.toHaveBeenCalled()
      document.removeEventListener('passcore:score', listener)
    })

    it('calls onScore when the result changes', () => {
      const onScore = vi.fn()
      create({ onScore })
      typeValue('ab')
      typeValue('abc')
      typeValue('k8#Qz!2mWp')
      expect(onScore.mock.calls.map(([percent, result]) => [percent, (result as Result).level]))
        .toEqual([[6, 'very-weak'], [7, 'very-weak'], [66, 'good']])
    })

    it('calls onText only when the message changes', () => {
      const onText = vi.fn()
      create({ onText })
      typeValue('ab')
      typeValue('abc')
      typeValue('k8#Qz!2mWp')
      expect(onText.mock.calls.map(([value]) => value)).toEqual(['Use at least 8 characters', 'Good password'])
    })

    it('does not call onText while the message stays the same, though the score changes', () => {
      const onScore = vi.fn()
      const onText = vi.fn()
      create({ onScore, onText })
      typeValue('abc')
      typeValue('abcd')
      expect(onScore).toHaveBeenCalledTimes(2)
      expect(onText).toHaveBeenCalledTimes(1)
      expect(onText).toHaveBeenCalledWith('Use at least 8 characters', expect.objectContaining({ percent: 7 }))
    })

    it('does not call onScore when the result does not change', () => {
      const onScore = vi.fn()
      const onText = vi.fn()
      const listener = vi.fn()
      document.addEventListener('passcore:score', listener)
      const meter = create({ onScore, onText })
      typeValue('k8#Qz!2mWp')
      typeValue('k8#Qz!2mWp')
      expect(onScore).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(onText).toHaveBeenCalledTimes(1)

      meter.refresh()
      expect(onScore).toHaveBeenCalledTimes(1)
      expect(onText).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledTimes(1)
      document.removeEventListener('passcore:score', listener)
    })

    it('calls onText from refresh() when the message changes after a user input changed', () => {
      const username = document.querySelector('#username') as HTMLInputElement
      username.value = 'johndoe'
      const onText = vi.fn()
      const meter = create({ userInputs: [() => username.value], onText })
      typeValue('johndoe99')
      expect(onText).toHaveBeenLastCalledWith('Don\'t use your personal details', expect.anything())

      username.value = 'someone'
      meter.refresh()
      expect(onText).toHaveBeenCalledTimes(2)
      expect(onText).toHaveBeenLastCalledWith('Fair password', expect.anything())
    })

    it('passes the result to the callbacks', () => {
      const onScore = vi.fn()
      create({ onScore })
      typeValue('Tester23$')
      const [percent, result] = onScore.mock.calls[0] as [number, Result]
      expect(percent).toBe(30)
      expect(result.valid).toBe(true)
    })

    it('dispatches bubbling passcore:score and passcore:text events on the input', () => {
      const scores: unknown[] = []
      const texts: unknown[] = []
      document.addEventListener('passcore:score', (event) => scores.push((event as CustomEvent).detail))
      document.addEventListener('passcore:text', (event) => texts.push((event as CustomEvent).detail))
      create()
      typeValue('k8#Qz!2mWp')
      expect(scores).toHaveLength(1)
      expect(scores[0]).toMatchObject({ percent: 66, result: { level: 'good' } })
      expect(texts).toHaveLength(1)
      expect(texts[0]).toMatchObject({ text: 'Good password', result: { level: 'good' } })
    })

    it('updates on refresh() after a user input changes, firing the callbacks', () => {
      const username = document.querySelector('#username') as HTMLInputElement
      username.value = 'johndoe'
      const onScore = vi.fn()
      const meter = create({ userInputs: [() => username.value], onScore })
      typeValue('johndoe99')
      expect(text().textContent).toBe('Don\'t use your personal details')

      username.value = 'someone'
      expect(meter.refresh().valid).toBe(true)
      expect(text().textContent).not.toBe('Don\'t use your personal details')
      expect(onScore).toHaveBeenCalledTimes(2)
    })

    it('does not listen to input events when listen is false', () => {
      const onScore = vi.fn()
      const meter = create({ listen: false, onScore })
      typeValue('k8#Qz!2mWp')
      expect(onScore).not.toHaveBeenCalled()
      expect(meter.result.level).toBe('empty')
      meter.refresh()
      expect(meter.result.level).toBe('good')
      expect(onScore).toHaveBeenCalledTimes(1)
    })

    it('exposes the last result', () => {
      const meter = create()
      typeValue('k8#Qz!2mWp')
      expect(meter.result).toMatchObject({ percent: 66, level: 'good', valid: true })
    })
  })

  describe('hideUntilFocus', () => {
    it('is visible from the start by default', () => {
      create()
      expect(wrapper().classList.contains('pass-hidden')).toBe(false)
      expect(input.parentElement?.classList.contains('pass-strength-visible')).toBe(true)
    })

    it('hides the meter until the input is focused', () => {
      create({ hideUntilFocus: true })
      expect(wrapper().classList.contains('pass-hidden')).toBe(true)
      expect(input.parentElement?.classList.contains('pass-strength-visible')).toBe(false)

      input.dispatchEvent(new Event('focus'))
      expect(wrapper().classList.contains('pass-hidden')).toBe(false)
      expect(input.parentElement?.classList.contains('pass-strength-visible')).toBe(true)
    })

    it('hides it again on blur once the input is empty', () => {
      create({ hideUntilFocus: true })
      input.dispatchEvent(new Event('focus'))
      typeValue('Tester23$')
      input.dispatchEvent(new Event('blur'))
      expect(wrapper().classList.contains('pass-hidden')).toBe(false)

      typeValue('')
      input.dispatchEvent(new Event('blur'))
      expect(wrapper().classList.contains('pass-hidden')).toBe(true)
      expect(input.parentElement?.classList.contains('pass-strength-visible')).toBe(false)
    })

    it('exposes focus() and blur() for the same behavior', () => {
      const meter = create({ hideUntilFocus: true })
      meter.focus()
      expect(wrapper().classList.contains('pass-hidden')).toBe(false)
      typeValue('Tester23$')
      meter.blur()
      expect(wrapper().classList.contains('pass-hidden')).toBe(false)
      typeValue('')
      meter.blur()
      expect(wrapper().classList.contains('pass-hidden')).toBe(true)
    })

    it('puts pass-strength-visible on the container', () => {
      document.body.innerHTML = '<div class="field"><input id="password" type="password"></div>'
      input = document.querySelector('#password') as HTMLInputElement
      create({ container: '.field', hideUntilFocus: true })
      const field = document.querySelector('.field') as HTMLElement
      expect(field.classList.contains('pass-strength-visible')).toBe(false)
      input.dispatchEvent(new Event('focus'))
      expect(field.classList.contains('pass-strength-visible')).toBe(true)
    })
  })

  describe('destroy', () => {
    it('removes the markup and the listeners', () => {
      const onScore = vi.fn()
      const meter = create({ onScore })
      meter.destroy()
      expect(document.querySelector('.pass-wrapper')).toBeNull()
      typeValue('k8#Qz!2mWp')
      expect(onScore).not.toHaveBeenCalled()
    })

    it('restores aria-describedby without removing the existing ids', () => {
      input.setAttribute('aria-describedby', 'hint')
      const meter = create()
      meter.destroy()
      expect(input.getAttribute('aria-describedby')).toBe('hint')
    })

    it('removes aria-describedby when it was not set before', () => {
      create().destroy()
      expect(input.hasAttribute('aria-describedby')).toBe(false)
    })

    it('removes the visibility class from the container', () => {
      const meter = create()
      expect(input.parentElement?.classList.contains('pass-strength-visible')).toBe(true)
      meter.destroy()
      expect(input.parentElement?.classList.contains('pass-strength-visible')).toBe(false)
    })

    it('can be called twice', () => {
      const meter = create()
      meter.destroy()
      expect(() => meter.destroy()).not.toThrow()
    })
  })
})

describe('robustness', () => {
  it('rejects a userInputs value that is not a valid selector, with a clear message', () => {
    expect(() => create({ userInputs: ['john.doe@example.com'] })).toThrow(/not a valid selector.*use a function/s)
    expect(document.querySelector('.pass-wrapper')).toBeNull()
  })

  it('does not touch the live region when the text does not change', () => {
    create()
    typeValue('a')
    const observer = new MutationObserver(() => {})
    observer.observe(text(), { childList: true, characterData: true, subtree: true })
    for (const value of ['ab', 'abc', 'abcd', 'abcde']) {
      typeValue(value)
    }
    expect(observer.takeRecords()).toHaveLength(0)
    typeValue('k8#Qz!2mWp')
    expect(observer.takeRecords().length).toBeGreaterThan(0)
    observer.disconnect()
  })

  it('shows the meter from the start when the input is focused or filled', () => {
    input.focus()
    const focused = create({ hideUntilFocus: true })
    expect(wrapper().classList.contains('pass-hidden')).toBe(false)
    focused.destroy()
    input.blur()

    input.value = 'Tester23$'
    create({ hideUntilFocus: true })
    expect(wrapper().classList.contains('pass-hidden')).toBe(false)
  })

  it('still hides the meter initially when the input is empty and not focused', () => {
    create({ hideUntilFocus: true })
    expect(wrapper().classList.contains('pass-hidden')).toBe(true)
  })

  it('restores pass-strength-visible on destroy to what it was before', () => {
    const parent = input.parentElement as HTMLElement
    create().destroy()
    expect(parent.classList.contains('pass-strength-visible')).toBe(false)

    parent.classList.add('pass-strength-visible')
    create({ hideUntilFocus: true }).destroy()
    expect(parent.classList.contains('pass-strength-visible')).toBe(true)
  })
})
