import $ from 'jquery'
import { beforeEach, describe, expect, it } from 'vitest'
import { defaults, install } from '../src'

beforeEach(() => {
  $.fx.off = true
  document.body.innerHTML = `<div><input type="password" id="password" />
<input type="text" id="username" /></div>
<div><input type="password" id="other" /></div>`
})

describe('install', () => {
  it('registers $.fn.password when the module is imported', () => {
    expect(typeof $.fn.password).toBe('function')
  })

  it('can register the plugin again on a given jQuery instance', () => {
    const previous = $.fn.password
    install($)
    expect($.fn.password).not.toBe(previous)
    expect(typeof $.fn.password).toBe('function')
  })
})

describe('$.fn.password', () => {
  it('exposes the defaults, including the core ones', () => {
    expect(defaults).toMatchObject({ animate: true, closestSelector: 'div', minimumLength: 4 })
  })

  it('returns the same jQuery object for chaining', () => {
    const $input = $('#password')
    expect($input.password()).toBe($input)
  })

  it('attaches an independent meter to each matched input', () => {
    $('input[type=password]').password({ animate: false, showPercent: true })
    expect($('.pass-wrapper').length).toBe(2)

    $('#password').val('!Tester23$#').trigger('keyup')
    expect($('#password').parent().find('.pass-percent').text()).toBe('100%')
    expect($('#other').parent().find('.pass-percent').text()).toBe('0%')
  })

  it('does not attach the percent span by default', () => {
    $('#password').password()
    expect($('.pass-percent').length).toBe(0)
  })

  it('triggers password.score on every keyup', () => {
    const scores: number[] = []
    $('#password').password()
      .on('password.score', (e, score: number) => scores.push(score))
      .val('ab').trigger('keyup')
      .val('abc').trigger('keyup')
      .val('Tester23$').trigger('keyup')

    expect(scores).toEqual([-1, -1, 91])
  })

  it('triggers password.text only when the text changes', () => {
    const texts: Array<[string, number]> = []
    $('#password').password()
      .on('password.text', (e, text: string, score: number) => texts.push([text, score]))
      .val('ab').trigger('keyup')
      .val('abc').trigger('keyup')
      .val('Tester23$').trigger('keyup')

    expect(texts).toEqual([
      ['The password is too short', -1],
      ['Medium; try using special characters', 91],
    ])
  })

  it('does not trigger password.text when showText is false', () => {
    const texts: string[] = []
    $('#password').password({ showText: false })
      .on('password.text', (e, text: string) => texts.push(text))
      .val('Tester23$').trigger('keyup')

    expect(texts).toEqual([])
  })

  it('shows enterPass again when the input is emptied', () => {
    $('#password').password({ enterPass: 'type' })
      .val('Tester23$').trigger('keyup')
      .val('').trigger('keyup')

    expect($('.pass-text').text()).toBe('type')
  })

  it('accepts a jQuery object or an element as field', () => {
    $('#username').val('test')
    $('#password').password({ field: $('#username'), containsField: 'jquery' }).val('test1').trigger('keyup')
    expect($('#password').parent().find('.pass-text').text()).toBe('jquery')

    $('#other').password({ field: document.getElementById('username') as HTMLElement, containsField: 'element' })
      .val('Test').trigger('keyup')
    expect($('#other').parent().find('.pass-text').text()).toBe('element')
  })

  it('treats a field selector matching nothing as an empty field', () => {
    $('#password').password({ field: '#missing' })
    expect(() => $('#password').val('Tester23$').trigger('keyup')).not.toThrow()
    expect($('.pass-text').text()).toBe('Medium; try using special characters')
  })

  it('keeps the wrapper visible on blur while the input has a value', () => {
    $('#password').password({ animate: true })
      .val('Tester23$').trigger('keyup').triggerHandler('focus')

    $('#password').triggerHandler('blur')
    expect($('.pass-wrapper').css('display')).not.toBe('none')
    expect($('.pass-strength-visible').length).toBe(1)
  })
})
