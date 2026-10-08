// Smoke test for the standalone build (dist/password.min.js), run after `pnpm build`
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

// jsdom's URL is global here, so stick to paths
const bundle = join(import.meta.dirname, '../dist/password.min.js')
const require = createRequire(import.meta.filename)

describe.skipIf(!existsSync(bundle))('dist/password.min.js', () => {
  it('registers $.fn.password on the global jQuery', () => {
    const dom = new JSDOM('<div><input type="password" id="password" /></div>', { runScripts: 'outside-only' })
    const window = dom.window as unknown as Window & { jQuery: JQueryStatic, eval: (code: string) => void }
    window.eval(readFileSync(require.resolve('jquery/dist/jquery.js'), 'utf8'))
    window.eval(readFileSync(bundle, 'utf8'))

    const $ = window.jQuery
    $('#password').password({ animate: false, showPercent: true }).val('Tester23$').trigger('keyup')

    expect($('.pass-text').text()).toBe('Weak password')
    expect($('.pass-percent').text()).toBe('30%')
    window.close()
  })
})
