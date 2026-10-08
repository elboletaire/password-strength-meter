import { evaluate } from '@passcore/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ca from '../../../locales/ca.json'
import { PasscoreMeterElement } from '../src/element'

const page = (meter: string, field = '<input type="password" id="password">') => {
  document.body.innerHTML = `${field}\n<input type="text" id="username">\n${meter}`
}
const element = () => document.querySelector('passcore-meter') as PasscoreMeterElement
const input = () => document.querySelector('#password') as HTMLInputElement
const type = (value: string) => {
  input().value = value
  input().dispatchEvent(new Event('input'))
}
const text = () => element().querySelector('.pass-text') as HTMLElement

beforeEach(() => {
  page('<passcore-meter for="password"></passcore-meter>')
})

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('<passcore-meter>', () => {
  it('defines the element', () => {
    expect(customElements.get('passcore-meter')).toBe(PasscoreMeterElement)
  })

  it('renders the markup inside the element (light DOM)', () => {
    expect(element().querySelector(':scope > .pass-wrapper > .pass-meter > .pass-bar')).not.toBeNull()
    expect(element().querySelector('.pass-meter')?.getAttribute('role')).toBe('meter')
    expect(input().getAttribute('aria-describedby')).toBe('password-strength')
    expect(text().textContent).toBe('Type your password')
  })

  it('links the input to the text', () => {
    type('k8#Qz!2mWp')
    expect(input().getAttribute('aria-describedby')).toBe('password-strength')
    expect(text().textContent).toBe('Good password')
  })

  it('takes min-length, max-length and target-bits as numbers', () => {
    page('<passcore-meter for="password" min-length="10" target-bits="1000"></passcore-meter>')
    type('Tester23$')
    expect(text().textContent).toBe('Use at least 10 characters')
    type('Tester23$!')
    expect(element().querySelector('.pass-meter')?.getAttribute('aria-valuenow'))
      .toBe(String(evaluate('Tester23$!', { targetBits: 1000 }).percent))
  })

  it('applies max-length', () => {
    page('<passcore-meter for="password" max-length="5"></passcore-meter>')
    type('k8#Qz!2mWp')
    expect(text().textContent).toBe('Use at most 5 characters')
  })

  it('renders the percent with show-percent', () => {
    page('<passcore-meter for="password" show-percent></passcore-meter>')
    type('k8#Qz!2mWp')
    expect(element().querySelector('.pass-percent')?.textContent).toBe('66%')
  })

  it('hides the text with hide-text', () => {
    page('<passcore-meter for="password" hide-text></passcore-meter>')
    expect(element().querySelector('.pass-text')).toBeNull()
    expect(input().hasAttribute('aria-describedby')).toBe(false)
  })

  it('hides the meter until focus with hide-until-focus', () => {
    page('<passcore-meter for="password" hide-until-focus></passcore-meter>')
    expect(element().querySelector('.pass-wrapper')?.classList.contains('pass-hidden')).toBe(true)
    input().dispatchEvent(new Event('focus'))
    expect(element().querySelector('.pass-wrapper')?.classList.contains('pass-hidden')).toBe(false)
    expect(element().classList.contains('pass-strength-visible')).toBe(true)
  })

  it('sets the label', () => {
    page('<passcore-meter for="password" label="Fortaleza"></passcore-meter>')
    expect(element().querySelector('.pass-meter')?.getAttribute('aria-label')).toBe('Fortaleza')
  })

  it('uses the locale attribute with the translations option', () => {
    page('<passcore-meter for="password" locale="ca"></passcore-meter>')
    element().options = { translations: ca }
    expect(text().textContent).toBe('Escriu la teva contrasenya')
    type('k8#Qz!2mWp')
    expect(text().textContent).toBe('Contrasenya bona')
  })

  it('reads user-inputs as one selector list, with every match', () => {
    page('<passcore-meter for="password" user-inputs="input:is(#username, #email)"></passcore-meter>'
      + '<input type="text" id="email" value="jane@example.com">')
    ;(document.querySelector('#username') as HTMLInputElement).value = 'johndoe'
    type('johndoe99')
    expect(text().textContent).toBe('Don\'t use your personal details')
    type('jane@example.com!1')
    expect(text().textContent).toBe('Don\'t use your personal details')
  })

  it('defines the element once when the module is imported again', async () => {
    vi.resetModules()
    await expect(import('../src/element')).resolves.toBeDefined()
    expect(customElements.get('passcore-meter')).toBe(PasscoreMeterElement)
  })

  it('merges the options property over the attributes', () => {
    page('<passcore-meter for="password" min-length="10"></passcore-meter>')
    element().options = { rules: { minLength: 2 } }
    type('abc')
    expect(text().textContent).toBe('Very weak password')
  })

  it('calls the translate option from the options property', () => {
    const translate = vi.fn((key: string) => `t(${key})`)
    element().options = { translate: translate as never }
    type('abc')
    expect(text().textContent).toBe('t(rule.minLength)')
  })

  it('dispatches the events on the input', () => {
    const listener = vi.fn()
    input().addEventListener('passcore:score', listener)
    type('k8#Qz!2mWp')
    expect(listener).toHaveBeenCalledTimes(1)
    expect((listener.mock.calls[0]?.[0] as CustomEvent).detail.percent).toBe(66)
  })

  it('re-creates the meter when an attribute changes', () => {
    element().setAttribute('min-length', '10')
    expect(element().querySelectorAll('.pass-wrapper')).toHaveLength(1)
    expect(input().getAttribute('aria-describedby')).toBe('password-strength')
    type('Tester23$')
    expect(text().textContent).toBe('Use at least 10 characters')
  })

  it('re-creates the meter when options change', () => {
    element().options = { showPercent: true }
    expect(element().querySelectorAll('.pass-wrapper')).toHaveLength(1)
    expect(element().querySelector('.pass-percent')).not.toBeNull()
  })

  it('destroys the meter on disconnect and creates it again on connect', () => {
    const el = element()
    el.remove()
    expect(el.querySelector('.pass-wrapper')).toBeNull()
    expect(input().hasAttribute('aria-describedby')).toBe(false)

    document.body.append(el)
    expect(el.querySelectorAll('.pass-wrapper')).toHaveLength(1)
    expect(input().getAttribute('aria-describedby')).toBe('password-strength')
  })

  it('does not re-create the meter while disconnected', () => {
    const el = element()
    el.remove()
    el.setAttribute('min-length', '10')
    expect(el.querySelector('.pass-wrapper')).toBeNull()
  })

  it('logs an error when the input from the for attribute is missing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    page('<passcore-meter for="missing"></passcore-meter>')
    await Promise.resolve()
    await Promise.resolve()
    expect(error).toHaveBeenCalledTimes(1)
    expect(String(error.mock.calls[0]?.[0])).toContain('"missing"')
    expect(element().querySelector('.pass-wrapper')).toBeNull()
  })

  it('finds an input that is rendered just after the element', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    document.body.innerHTML = '<passcore-meter for="late"></passcore-meter>'
    document.body.insertAdjacentHTML('beforeend', '<input type="password" id="late">')
    await Promise.resolve()
    expect(element().querySelector('.pass-wrapper')).not.toBeNull()
    expect(error).not.toHaveBeenCalled()
  })

  it('applies options set before the element was upgraded', () => {
    // elements created in a document without a registry are not upgraded until they are in this one
    const loose = document.implementation.createHTMLDocument('').createElement('passcore-meter') as PasscoreMeterElement
    loose.setAttribute('for', 'password')
    loose.options = { label: 'Fuerza' }
    expect(Object.prototype.hasOwnProperty.call(loose, 'options')).toBe(true)

    document.body.innerHTML = '<input type="password" id="password">'
    document.body.append(document.adoptNode(loose))
    customElements.upgrade(loose)

    expect(loose.querySelector('.pass-meter')?.getAttribute('aria-label')).toBe('Fuerza')
    expect(Object.prototype.hasOwnProperty.call(loose, 'options')).toBe(false)
  })

  it('creates one meter however many attributes are set while the document loads', () => {
    const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    const add = vi.spyOn(document, 'addEventListener')
    page('<passcore-meter for="password" min-length="10" show-percent hide-text></passcore-meter>')
    element().setAttribute('locale', 'ca')
    expect(add.mock.calls.filter(([type]) => type === 'DOMContentLoaded')).toHaveLength(1)
    readyState.mockReturnValue('complete')
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(element().querySelectorAll('.pass-wrapper')).toHaveLength(1)
  })
})
