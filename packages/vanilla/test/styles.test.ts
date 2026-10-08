import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(import.meta.dirname, '../src/styles.css'), 'utf8')

describe('styles.css', () => {
  it('keeps the hidden class', () => {
    expect(css).toMatch(/\.pass-hidden\s*\{\s*display:\s*none;?\s*\}/)
  })

  it('has the forced colors rules', () => {
    expect(css).toMatch(/@media \(forced-colors: active\) \{[\s\S]*\.pass-meter \{\s*border: 1px solid CanvasText;/)
    expect(css).toMatch(/\.pass-bar \{\s*background-color: Highlight;\s*forced-color-adjust: none;/)
  })

  it('has the same forced colors block as the other packages', () => {
    const block = (text: string): string => text.slice(text.indexOf('@media (forced-colors')).trim()
    expect(block(css)).toMatch(/^@media/)
    for (const other of ['jquery/src/styles.css', 'react/src/styles.css', 'vue/src/styles.css', 'svelte/src/lib/styles.css']) {
      const text = readFileSync(join(import.meta.dirname, '../..', other), 'utf8')
      expect(block(text), other).toBe(block(css))
    }
  })
})
