import $ from 'jquery'
import { beforeEach, describe, expect, it } from 'vitest'
import { defaultMessages, defaults, install } from '../src'

beforeEach(() => {
  $.fx.off = true
  document.body.innerHTML = `<div><input type="password" id="password" /></div>
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
  })
})

describe('exports', () => {
  it('exposes the plugin defaults and the default messages', () => {
    expect(defaults).toEqual({
      userInputs: [],
      messages: {},
      showPercent: false,
      showText: true,
      animate: true,
      animateSpeed: 'fast',
      closestSelector: 'div',
    })
    expect(defaultMessages.empty).toBe('Type your password')
  })
})

describe('$.fn.password', () => {
  it('returns the same jQuery object for chaining', () => {
    const $input = $('#password')
    expect($input.password()).toBe($input)
  })

  it('attaches an independent meter to each matched input', () => {
    $('input').password({ animate: false })
    expect($('.pass-wrapper').length).toBe(2)

    $('#password').val('k8#Qz!2mWp').trigger('keyup')
    expect($('#password').parent().find('.pass-text').text()).toBe('Good password')
    expect($('#other').parent().find('.pass-text').text()).toBe('Type your password')
  })

  it('does not change the defaults when options are given', () => {
    $('#password').password({ showPercent: true, messages: { empty: 'x' } })
    expect(defaults.showPercent).toBe(false)
    expect(defaults.messages).toEqual({})
    expect(defaultMessages.empty).toBe('Type your password')
  })
})
