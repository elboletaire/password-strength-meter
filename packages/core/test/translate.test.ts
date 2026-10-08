import { describe, expect, it } from 'vitest'
import { createTranslator, translationParams } from '../src'
import en from '../../../locales/en.json'

describe('translationParams', () => {
  it('adds count from min or max', () => {
    expect(translationParams({ key: 'rule.minLength', params: { min: 8 } })).toEqual({ min: 8, count: 8 })
    expect(translationParams({ key: 'rule.maxLength', params: { max: 64 } })).toEqual({ max: 64, count: 64 })
  })

  it('leaves params without min or max untouched', () => {
    expect(translationParams({ key: 'level.good', params: {} })).toEqual({})
  })
})

describe('createTranslator', () => {
  const translate = createTranslator(en)

  it('looks up nested keys', () => {
    expect(translate('empty')).toBe('Type your password')
    expect(translate('level.very-weak')).toBe('Very weak password')
    expect(translate('rule.notCommon')).toBe('This password is too common')
  })

  it('selects plural forms with count', () => {
    expect(translate('rule.numbers', { min: 1, count: 1 })).toBe('Add a number')
    expect(translate('rule.numbers', { min: 3, count: 3 })).toBe('Add at least 3 numbers')
    expect(translate('rule.minLength', { min: 8, count: 8 })).toBe('Use at least 8 characters')
  })

  it('uses the plural rules of the locale, falling back to _other', () => {
    const translations = { rule: { numbers_one: 'one', numbers_many: 'many', numbers_other: 'other' } }
    expect(createTranslator(translations, 'es')('rule.numbers', { count: 1 })).toBe('one')
    expect(createTranslator(translations, 'es')('rule.numbers', { count: 1000000 })).toBe('many')
    expect(createTranslator(en, 'es')('rule.numbers', { count: 1000000 })).toBe('Add at least 1000000 numbers')
  })

  it('falls back to the plain key when there are no plural forms', () => {
    expect(createTranslator({ rule: { numbers: '{{count}} numbers' } })('rule.numbers', { count: 2 })).toBe('2 numbers')
  })

  it('replaces placeholders, with or without spaces, and keeps unknown ones', () => {
    const custom = createTranslator({ empty: 'Hi {{ name }}, {{other}}' })
    expect(custom('empty', { name: 3 })).toBe('Hi 3, {{other}}')
  })

  it('returns the key when it is missing', () => {
    expect(createTranslator({})('level.good')).toBe('level.good')
    expect(createTranslator({ level: 'not an object' })('level.good')).toBe('level.good')
  })
})

describe('createTranslator layers', () => {
  it('deep-merges layers in order, later layers winning', () => {
    const base = { empty: 'base empty', level: { good: 'base good', weak: 'base weak' }, rule: { numbers: 'base numbers' } }
    const middle = { level: { good: 'middle good' }, rule: { numbers: 'middle numbers' } }
    const top = { level: { weak: 'top weak' } }
    const translate = createTranslator([base, middle, top])
    expect(translate('empty')).toBe('base empty')
    expect(translate('level.good')).toBe('middle good')
    expect(translate('level.weak')).toBe('top weak')
    expect(translate('rule.numbers')).toBe('middle numbers')
  })

  it('does not mutate the layers', () => {
    const base = { level: { good: 'base good' } }
    const top = { level: { weak: 'top weak' } }
    const snapshot = JSON.stringify([base, top])
    createTranslator([base, top])('level.good')
    expect(JSON.stringify([base, top])).toBe(snapshot)
    expect(base).toEqual({ level: { good: 'base good' } })
  })

  it('only merges plain objects: a string replaces an object, and the other way around', () => {
    const translate = createTranslator([{ level: { good: 'x' } }, { level: 'flat' }])
    expect(translate('level.good')).toBe('level.good')
    const back = createTranslator([{ level: 'flat' }, { level: { good: 'nested' } }])
    expect(back('level.good')).toBe('nested')
  })

  it('accepts a single layer and an empty list of layers', () => {
    expect(createTranslator([en])('empty')).toBe('Type your password')
    expect(createTranslator([])('empty')).toBe('empty')
  })

  it('uses the locale for plural forms with layers', () => {
    const translate = createTranslator([en, { rule: { numbers_other: '{{count}} numbers' } }], 'es')
    expect(translate('rule.numbers', { min: 3, count: 3 })).toBe('3 numbers')
  })
})
