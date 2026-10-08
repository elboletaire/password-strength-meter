import { describe, expect, it } from 'vitest'
import { commonPasswords } from '../src'
import { defaultOptions, mergeDeep, resolveOptions } from '../src/options'

describe('resolveOptions', () => {
  it('returns the defaults when nothing is given', () => {
    expect(resolveOptions()).toEqual(defaultOptions)
  })

  it('merges rules and levels key by key', () => {
    const options = resolveOptions({ rules: { numbers: 1 }, levels: { strong: 90 } })
    expect(options.rules).toEqual({ ...defaultOptions.rules, numbers: 1 })
    expect(options.levels).toEqual({ ...defaultOptions.levels, strong: 90 })
  })

  it('replaces the common passwords and ignores undefined values', () => {
    const options = resolveOptions({ commonPasswords: ['acme'], targetBits: undefined })
    expect(options.commonPasswords).toEqual(['acme'])
    expect(options.targetBits).toBe(100)
  })

  it('does not modify the defaults', () => {
    resolveOptions({ rules: { minLength: 20 } })
    expect(defaultOptions.rules.minLength).toBe(8)
  })

  it('copies everything and returns deep-frozen options', () => {
    const options = resolveOptions()
    expect(options).not.toBe(defaultOptions)
    expect(options.rules).not.toBe(defaultOptions.rules)
    expect(options.levels).not.toBe(defaultOptions.levels)
    expect(options.commonPasswords).not.toBe(commonPasswords)
    expect(Object.isFrozen(options)).toBe(true)
    expect(Object.isFrozen(options.rules)).toBe(true)
    expect(Object.isFrozen(options.levels)).toBe(true)
    expect(Object.isFrozen(options.commonPasswords)).toBe(true)
  })

  it('copies the caller objects and arrays', () => {
    const rules = { numbers: 1 }
    const words = ['acme']
    const options = resolveOptions({ rules, commonPasswords: words })
    expect(options.rules).not.toBe(rules)
    expect(options.commonPasswords).not.toBe(words)
    expect(options.commonPasswords).toEqual(['acme'])
  })
})

describe('mergeDeep', () => {
  it('merges several sources in order', () => {
    expect(mergeDeep({ a: 1, b: { c: 1, d: 1 } }, { b: { c: 2 } }, { a: 3 })).toEqual({ a: 3, b: { c: 2, d: 1 } })
  })
})
