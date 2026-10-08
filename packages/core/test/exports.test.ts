import { describe, expect, it } from 'vitest'

describe('public exports', () => {
  it('exports exactly the 1.0 API at runtime', async () => {
    expect(Object.keys(await import('../src')).sort()).toEqual([
      'commonPasswords',
      'createMeter',
      'createTranslator',
      'defaultOptions',
      'evaluate',
      'translationParams',
    ])
  })
})
