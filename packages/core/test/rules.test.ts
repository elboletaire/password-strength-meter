import { describe, expect, it } from 'vitest'
import { toChars } from '../src/normalize'
import { defaultOptions } from '../src/options'
import { checkRules, containsUserInput, isCommon } from '../src/rules'
import { prepareWords } from '../src/words'

const words = prepareWords(defaultOptions.commonPasswords)
const common = (password: string) => isCommon(toChars(password), words)

describe('isCommon', () => {
  it('matches common passwords, case and leetspeak aside', () => {
    expect(common('password')).toBe(true)
    expect(common('Password')).toBe(true)
    expect(common('P@ssw0rd')).toBe(true)
    expect(common('123456')).toBe(true)
  })

  it('matches common passwords followed by digits and symbols', () => {
    expect(common('password123!')).toBe(true)
    expect(common('qwerty2024')).toBe(true)
  })

  it('does not match common passwords inside other text', () => {
    expect(common('mypassword')).toBe(false)
    expect(common('password-is-long-enough-now')).toBe(false)
    expect(common('')).toBe(false)
  })
})

describe('containsUserInput', () => {
  it('finds normalized user-input tokens', () => {
    expect(containsUserInput('xJ0hnx', ['john'])).toBe(true)
    expect(containsUserInput('doe2024', ['john.doe@example.com'])).toBe(true)
  })

  it('ignores short tokens and empty inputs', () => {
    expect(containsUserInput('xjox', ['jo'])).toBe(false)
    expect(containsUserInput('anything', [])).toBe(false)
  })
})

describe('checkRules', () => {
  it('reports the default rules in order', () => {
    expect(checkRules('abc', defaultOptions.rules, words, [])).toEqual([
      { id: 'minLength', passed: false, params: { min: 8 } },
      { id: 'notCommon', passed: true, params: {} },
      { id: 'notUserInputs', passed: true, params: {} },
    ])
  })

  it('reports every enabled rule with its params', () => {
    const rules = { ...defaultOptions.rules, maxLength: 4, lowercase: 1, uppercase: 1, numbers: 2, symbols: 1 }
    expect(checkRules('aB1!x', rules, words, []).map(({ id, passed, params }) => [id, passed, params])).toEqual([
      ['minLength', false, { min: 8 }],
      ['maxLength', false, { max: 4 }],
      ['notCommon', true, {}],
      ['notUserInputs', true, {}],
      ['lowercase', true, { min: 1 }],
      ['uppercase', true, { min: 1 }],
      ['numbers', false, { min: 2 }],
      ['symbols', true, { min: 1 }],
    ])
  })

  it('skips disabled rules', () => {
    const rules = { ...defaultOptions.rules, minLength: 0, notCommon: false, notUserInputs: false }
    expect(checkRules('abc', rules, words, [])).toEqual([])
  })

  it('counts length in code points', () => {
    const rules = { ...defaultOptions.rules, minLength: 4 }
    expect(checkRules('🔒🔒🔒🔒', rules, words, [])[0]).toEqual({ id: 'minLength', passed: true, params: { min: 4 } })
  })
})
