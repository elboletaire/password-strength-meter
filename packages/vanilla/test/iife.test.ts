// Smoke tests for the standalone builds (dist/passcore.min.js and dist/passcore-element.min.js), run after `pnpm build`
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

const dist = (file: string) => join(import.meta.dirname, '../dist', file)
const bundles = ['passcore.min.js', 'passcore-element.min.js'].map(dist)

/** The jsdom window, with the global the bundles define. */
interface Page extends Window {
  eval: (code: string) => void
  Event: typeof Event
  passcore?: { createPasswordMeter: (input: string, options?: object) => unknown }
}

describe.skipIf(!bundles.every((file) => existsSync(file)))('standalone bundles', () => {
  it('exposes createPasswordMeter as a global', () => {
    const dom = new JSDOM('<input type="password" id="password">', { runScripts: 'outside-only' })
    const window = dom.window as unknown as Page
    window.eval(readFileSync(dist('passcore.min.js'), 'utf8'))

    const input = window.document.querySelector('#password') as HTMLInputElement
    window.passcore?.createPasswordMeter('#password', { showPercent: true })
    input.value = 'Tester23$'
    input.dispatchEvent(new window.Event('input'))

    expect(window.document.querySelector('.pass-text')?.textContent).toBe('Weak password')
    expect(window.document.querySelector('.pass-percent')?.textContent).toBe('30%')
    expect(input.getAttribute('aria-describedby')).toBe('password-strength')
    window.close()
  })

  it('registers the <password-meter> element', async () => {
    const dom = new JSDOM('<input type="password" id="password"><password-meter for="password" show-percent></password-meter>', { runScripts: 'outside-only' })
    const window = dom.window as unknown as Page
    window.eval(readFileSync(dist('passcore-element.min.js'), 'utf8'))
    // a fresh jsdom document is still loading: the element waits for DOMContentLoaded to find its input
    if (window.document.readyState === 'loading') {
      await new Promise((resolve) => window.document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    }

    const element = window.document.querySelector('password-meter') as HTMLElement
    const input = window.document.querySelector('#password') as HTMLInputElement
    expect(element.querySelector('.pass-meter')?.getAttribute('aria-valuetext')).toBe('Type your password')

    input.value = 'Tester23$'
    input.dispatchEvent(new window.Event('input'))
    expect(element.querySelector('.pass-text')?.textContent).toBe('Weak password')
    expect(element.querySelector('.pass-percent')?.textContent).toBe('30%')
    window.close()
  })
})
