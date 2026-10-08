// @vitest-environment node
import { describe, expect, it } from 'vitest'

describe('importing the custom element on the server', () => {
  it('does not throw and defines nothing without a DOM', async () => {
    expect(typeof HTMLElement).toBe('undefined')
    const module = await import('../src/element')
    expect(typeof module.PasscoreMeterElement).toBe('function')
  })

  it('can create a meter only where there is a document', async () => {
    const { createPasswordMeter } = await import('../src')
    expect(() => createPasswordMeter('#password')).toThrow()
  })
})
