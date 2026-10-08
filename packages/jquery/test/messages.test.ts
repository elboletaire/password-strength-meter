import { describe, expect, it } from 'vitest'
import { defaultMessages, formatMessage } from '../src/messages'

describe('formatMessage', () => {
  it('replaces {param} placeholders', () => {
    expect(formatMessage(defaultMessages, 'rule.minLength', { min: 8 })).toBe('Use at least 8 characters')
    expect(formatMessage(defaultMessages, 'rule.maxLength', { max: 64 })).toBe('Use at most 64 characters')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(formatMessage({ ...defaultMessages, empty: 'Hi {name}' }, 'empty', {})).toBe('Hi {name}')
  })

  it('calls function messages with the params', () => {
    expect(formatMessage(defaultMessages, 'rule.numbers', { min: 1 })).toBe('Add a number')
    expect(formatMessage(defaultMessages, 'rule.numbers', { min: 3 })).toBe('Add at least 3 numbers')
    expect(formatMessage(defaultMessages, 'rule.symbols', { min: 2 })).toBe('Add at least 2 symbols')
  })

  it('has a default for every message key', () => {
    expect(Object.keys(defaultMessages).sort()).toEqual([
      'empty',
      'level.fair',
      'level.good',
      'level.strong',
      'level.very-weak',
      'level.weak',
      'rule.lowercase',
      'rule.maxLength',
      'rule.minLength',
      'rule.notCommon',
      'rule.notUserInputs',
      'rule.numbers',
      'rule.symbols',
      'rule.uppercase',
    ])
  })
})
