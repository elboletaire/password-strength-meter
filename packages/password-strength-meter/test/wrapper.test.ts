import { existsSync } from 'node:fs'
import { join } from 'node:path'
import $ from 'jquery'
import { describe, expect, it } from 'vitest'
import * as passcore from '@passcore/jquery'
import * as legacy from '../src'

describe('password-strength-meter', () => {
  it('registers $.fn.password like 2.x did', () => {
    expect(typeof $.fn.password).toBe('function')
  })

  it('re-exports @passcore/jquery', () => {
    expect(legacy.defaults).toBe(passcore.defaults)
    expect(legacy.install).toBe(passcore.install)
  })

  it('works as the 2.x plugin', () => {
    $.fx.off = true
    document.body.innerHTML = '<div><input type="password" id="password" /></div>'
    $('#password').password({ animate: false }).val('!Tester23$#').trigger('keyup')
    expect($('.pass-text').text()).toBe('Strong password')
  })
})

const dist = join(import.meta.dirname, '../dist')

describe.skipIf(!existsSync(dist))('dist', () => {
  it.each(['password.min.js', 'password.min.css', 'passwordstrength.jpg'])('keeps the 2.x file %s', (file) => {
    expect(existsSync(join(dist, file))).toBe(true)
  })
})
