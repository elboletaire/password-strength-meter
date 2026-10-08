import $ from 'jquery'
import { beforeEach, describe, expect, it } from 'vitest'
import ca from '../../../locales/ca.json'
import '../src'

beforeEach(() => {
  $.fx.off = true
  document.body.innerHTML = `<div><input type="password" id="password" />
<input type="text" id="username" /></div>`
})

const type = (value: string, selector = '#password') => $(selector).val(value).trigger('keyup')
const wrapper = () => $('.pass-wrapper')

describe('$.fn.password', () => {
  describe('markup', () => {
    it('renders an ARIA meter with a bar next to the input', () => {
      $('#password').password()
      expect($('input + .pass-wrapper > .pass-meter > .pass-bar').length).toBe(1)
      expect($('.pass-meter').attr('role')).toBe('meter')
      expect($('.pass-meter').attr('aria-label')).toBe('Password strength')
      expect($('.pass-meter').attr('aria-valuemin')).toBe('0')
      expect($('.pass-meter').attr('aria-valuemax')).toBe('100')
    })

    it('links the text to the input for screen readers', () => {
      $('#password').password()
      expect($('.pass-text').attr('id')).toBe('password-strength')
      expect($('.pass-text').attr('aria-live')).toBe('polite')
      expect($('#password').attr('aria-describedby')).toBe('password-strength')
    })

    it('keeps an existing aria-describedby', () => {
      $('#password').attr('aria-describedby', 'hint').password()
      expect($('#password').attr('aria-describedby')).toBe('hint password-strength')
    })

    it('generates a text id for inputs without one', () => {
      $('#password').removeAttr('id').password()
      const id = $('.pass-text').attr('id') as string
      expect(id).toMatch(/^passcore-\d+-strength$/)
      expect($('input[type=password]').attr('aria-describedby')).toBe(id)
    })

    it('does not render the text when showText is false', () => {
      $('#password').password({ showText: false })
      expect($('.pass-text').length).toBe(0)
      expect($('#password').attr('aria-describedby')).toBeUndefined()
    })

    it('renders the percent when showPercent is true', () => {
      $('#password').password({ showPercent: true })
      expect($('.pass-percent').text()).toBe('0%')
    })

    it('starts empty and invalid', () => {
      $('#password').password()
      expect(wrapper().hasClass('pass-level-empty')).toBe(true)
      expect(wrapper().hasClass('pass-invalid')).toBe(true)
      expect($('.pass-text').text()).toBe('Type your password')
      expect($('.pass-meter').attr('aria-valuetext')).toBe('Type your password')
    })

    it('renders pre-filled inputs', () => {
      $('#password').val('k8#Qz!2mWp').password()
      expect(wrapper().hasClass('pass-level-good')).toBe(true)
      expect($('.pass-text').text()).toBe('Good password')
    })

    it('appends the meter to closestSelector', () => {
      document.body.innerHTML = `<div class="form-group">
        <div class="input-group">
          <span class="input-group-addon"></span>
          <input id="password" class="form-control" type="password">
        </div>
      </div>`
      $('#password').password({ closestSelector: '.form-group' })
      expect($('.form-group > .pass-wrapper').length).toBe(1)
    })
  })

  describe('animation', () => {
    it('hides the meter until the input is focused', () => {
      $('#password').password()
      expect(wrapper().css('display')).toBe('none')
      expect($('.pass-strength-visible').length).toBe(0)

      $('#password').triggerHandler('focus')
      expect(wrapper().css('display')).not.toBe('none')
      expect($('.pass-strength-visible').length).toBe(1)
    })

    it('hides it again on blur once the input is empty', () => {
      $('#password').password()
      type('Tester23$').triggerHandler('focus')
      $('#password').triggerHandler('blur')
      expect(wrapper().css('display')).not.toBe('none')

      type('').triggerHandler('blur')
      expect(wrapper().css('display')).toBe('none')
      expect($('.pass-strength-visible').length).toBe(0)
    })

    it('shows the meter from the start when animate is false', () => {
      $('#password').password({ animate: false })
      expect(wrapper().css('display')).not.toBe('none')
      expect($('.pass-strength-visible').length).toBe(1)
    })
  })

  describe('updates', () => {
    it('renders the level, ARIA values, width and text on keyup', () => {
      $('#password').password({ showPercent: true })
      type('k8#Qz!2mWp')
      expect(wrapper().hasClass('pass-level-good')).toBe(true)
      expect(wrapper().hasClass('pass-level-empty')).toBe(false)
      expect(wrapper().hasClass('pass-invalid')).toBe(false)
      expect($('.pass-meter').attr('aria-valuenow')).toBe('66')
      expect($('.pass-meter').attr('aria-valuetext')).toBe('Good password')
      expect($('.pass-bar').prop('style').width).toBe('66%')
      expect($('.pass-percent').text()).toBe('66%')
      expect($('.pass-text').text()).toBe('Good password')
    })

    it('reaches strong with a long passphrase', () => {
      $('#password').password()
      type('correct horse battery staple')
      expect(wrapper().hasClass('pass-level-strong')).toBe(true)
      expect($('.pass-bar').prop('style').width).toBe('100%')
    })

    it('shows the first failing rule and marks the meter invalid', () => {
      $('#password').password()
      type('abc')
      expect(wrapper().hasClass('pass-invalid')).toBe(true)
      expect($('.pass-text').text()).toBe('Use at least 8 characters')
      expect($('.pass-meter').attr('aria-valuetext')).toBe('Very weak password')

      type('password')
      expect($('.pass-text').text()).toBe('This password is too common')
    })

    it('shows the empty message again when the input is cleared', () => {
      $('#password').password()
      type('k8#Qz!2mWp')
      type('')
      expect(wrapper().hasClass('pass-level-empty')).toBe(true)
      expect($('.pass-text').text()).toBe('Type your password')
    })

    it('passes core options through', () => {
      $('#password').password({ rules: { minLength: 4, numbers: 1 } })
      type('xkqz')
      expect($('.pass-text').text()).toBe('Add a number')
    })

    it('inserts texts as text, not HTML', () => {
      $('#password').password({ translations: { empty: '<b>Type</b>' } })
      expect($('.pass-text').html()).toBe('&lt;b&gt;Type&lt;/b&gt;')
    })
  })

  describe('translations', () => {
    it('overrides texts partially, with {{count}} placeholders', () => {
      $('#password').password({ translations: { rule: { minLength_other: 'Min {{count}}!' } } })
      type('abc')
      expect($('.pass-text').text()).toBe('Min 8!')
      type('k8#Qz!2mWp')
      expect($('.pass-text').text()).toBe('Good password')
    })

    it('picks plural forms', () => {
      $('#password').password({ rules: { minLength: 0, numbers: 1 } })
      type('abc')
      expect($('.pass-text').text()).toBe('Add a number')
    })

    it('renders a bundled language', () => {
      $('#password').password({ translations: ca, locale: 'ca' })
      expect($('.pass-text').text()).toBe('Escriu la teva contrasenya')
      type('abc')
      expect($('.pass-text').text()).toBe('Fes servir almenys 8 caràcters')
      type('k8#Qz!2mWp')
      expect($('.pass-text').text()).toBe('Contrasenya bona')
      expect($('.pass-meter').attr('aria-valuetext')).toBe('Contrasenya bona')
    })

    it('uses a translate function, such as i18next\'s t, with count', () => {
      const calls: Array<[string, unknown]> = []
      $('#password').password({
        translate: (key, params) => {
          calls.push([key, params])
          return `t(${key})`
        },
      })
      type('abc')
      expect($('.pass-text').text()).toBe('t(rule.minLength)')
      expect($('.pass-meter').attr('aria-valuetext')).toBe('t(level.very-weak)')
      expect(calls).toContainEqual(['rule.minLength', { min: 8, count: 8 }])
    })
  })

  describe('userInputs', () => {
    it('rejects passwords containing a field value, read on every keyup', () => {
      $('#username').val('johndoe')
      $('#password').password({ userInputs: ['#username'] })
      type('johndoe99')
      expect($('.pass-text').text()).toBe('Don\'t use your personal details')

      $('#username').val('someone')
      type('johndoe99')
      expect($('.pass-text').text()).not.toBe('Don\'t use your personal details')
    })

    it('accepts elements and jQuery objects', () => {
      $('#username').val('johndoe')
      $('#password').password({ userInputs: [$('#username'), document.getElementById('username') as HTMLElement] })
      type('johndoe99')
      expect($('.pass-text').text()).toBe('Don\'t use your personal details')
    })

    it('ignores empty fields and selectors matching nothing', () => {
      $('#password').password({ userInputs: ['#username', '#missing'] })
      expect(() => type('k8#Qz!2mWp')).not.toThrow()
      expect($('.pass-text').text()).toBe('Good password')
    })
  })

  describe('input events (paste, autofill, drag and drop)', () => {
    const track = () => {
      const scores: number[] = []
      const texts: string[] = []
      $('#password').password()
        .on('password.score', (e, percent: number) => scores.push(percent))
        .on('password.text', (e, text: string) => texts.push(text))
      return { scores, texts }
    }
    const change = (value: string) => $('#password').val(value).trigger('input')

    it('updates the meter when the value changes without a key release', () => {
      const { scores, texts } = track()
      change('k8#Qz!2mWp')
      expect($('.pass-text').text()).toBe('Good password')
      expect($('.pass-bar').prop('style').width).toBe('66%')
      expect(scores).toEqual([66])
      expect(texts).toEqual(['Good password'])
    })

    it('does not fire twice for a keystroke: the input event, then the keyup', () => {
      const { scores } = track()
      change('abc')
      $('#password').trigger('keyup')
      change('abcd')
      $('#password').trigger('keyup')
      expect(scores).toEqual([7, 8])
    })

    it('still fires on every keyup that is not preceded by an input event', () => {
      const { scores } = track()
      type('abc')
      $('#password').trigger('keyup')
      $('#password').trigger('keyup')
      expect(scores).toEqual([7, 7, 7])
    })

    it('skips only the first keyup after an input event: later ones fire as before', () => {
      const { scores } = track()
      change('abc')
      $('#password').trigger('keyup')
      $('#password').trigger('keyup')
      expect(scores).toEqual([7, 7])
    })

    it('does not skip the keyup when the evaluated state changed since the input event', () => {
      $('#username').val('johndoe')
      $('#password').password({ userInputs: ['#username'] })
      const scores: number[] = []
      $('#password').on('password.score', (e, percent: number) => scores.push(percent))
      change('johndoe99')
      $('#username').val('someone')
      $('#password').trigger('keyup')
      expect(scores).toHaveLength(2)
      expect($('.pass-text').text()).not.toBe('Don\'t use your personal details')
    })
  })

  describe('events', () => {
    it('triggers password.score with the percent and the result on every keyup', () => {
      const scores: Array<[number, string]> = []
      $('#password').password()
        .on('password.score', (e, percent: number, result: { level: string }) => scores.push([percent, result.level]))
      type('ab')
      type('abc')
      type('k8#Qz!2mWp')
      expect(scores).toEqual([[6, 'very-weak'], [7, 'very-weak'], [66, 'good']])
    })

    it('triggers password.text only when the message changes', () => {
      const texts: string[] = []
      $('#password').password()
        .on('password.text', (e, text: string) => texts.push(text))
      type('ab')
      type('abc')
      type('k8#Qz!2mWp')
      expect(texts).toEqual(['Use at least 8 characters', 'Good password'])
    })

    it('triggers password.text even when showText is false', () => {
      const texts: string[] = []
      $('#password').password({ showText: false })
        .on('password.text', (e, text: string) => texts.push(text))
      type('k8#Qz!2mWp')
      expect(texts).toEqual(['Good password'])
    })
  })
})
