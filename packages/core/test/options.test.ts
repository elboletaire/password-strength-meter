import { describe, expect, it } from 'vitest'
import { defaults, mergeDeep, resolveOptions } from '../src/options'

describe('resolveOptions', () => {
  it('returns the defaults when nothing is given', () => {
    expect(resolveOptions()).toEqual(defaults)
  })

  it('merges rules and levels key by key', () => {
    const options = resolveOptions({ rules: { numbers: 1 }, levels: { strong: 90 } })
    expect(options.rules).toEqual({ ...defaults.rules, numbers: 1 })
    expect(options.levels).toEqual({ ...defaults.levels, strong: 90 })
  })

  it('replaces arrays and ignores undefined values', () => {
    const options = resolveOptions({ commonWords: ['acme'], targetBits: undefined })
    expect(options.commonWords).toEqual(['acme'])
    expect(options.targetBits).toBe(100)
  })

  it('does not modify the defaults', () => {
    resolveOptions({ rules: { minLength: 20 } })
    expect(defaults.rules.minLength).toBe(8)
  })
})

describe('mergeDeep', () => {
  it('merges several sources in order', () => {
    expect(mergeDeep({ a: 1, b: { c: 1, d: 1 } }, { b: { c: 2 } }, { a: 3 })).toEqual({ a: 3, b: { c: 2, d: 1 } })
  })
})
