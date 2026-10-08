import { describe, expect, it } from 'vitest'
import { evaluate, type Level, type MessageKey } from '../src'

// Reviewed by hand: the level, validity and message every password must get with the defaults.
const table: Array<[password: string, level: Level, valid: boolean, message: MessageKey, userInputs?: string[]]> = [
  ['', 'empty', false, 'empty'],
  ['a', 'very-weak', false, 'rule.minLength'],
  ['abcdef', 'very-weak', false, 'rule.minLength'],
  ['abcabcabc', 'very-weak', true, 'level.very-weak'],
  ['tester23', 'very-weak', true, 'level.very-weak'],
  ['12345678', 'very-weak', false, 'rule.notCommon'],
  ['password', 'very-weak', false, 'rule.notCommon'],
  ['P@ssw0rd', 'very-weak', false, 'rule.notCommon'],
  ['qwertyuiop', 'very-weak', false, 'rule.notCommon'],
  ['monkey123', 'very-weak', false, 'rule.notCommon'],
  ['Password1!', 'weak', false, 'rule.notCommon'],
  ['p4ssw0rd2024', 'weak', false, 'rule.notCommon'],
  ['zxcvbnm,./', 'weak', false, 'rule.notCommon'],
  ['Tester23$', 'weak', true, 'level.weak'],
  ['xkcdxkcdxkcd', 'weak', true, 'level.weak'],
  ['johndoe2024', 'weak', false, 'rule.notUserInputs', ['johndoe']],
  ['xJohnx!pass', 'weak', false, 'rule.notUserInputs', ['john.doe@example.com']],
  ['!Tester23$#', 'fair', true, 'level.fair'],
  ['a8Fk2Lq9Zx', 'fair', true, 'level.fair'],
  ['k8#Qz!2mWp', 'good', true, 'level.good'],
  ['Tr0ub4dor&3', 'good', true, 'level.good'],
  ['correcthorsebatterystaple', 'strong', true, 'level.strong'],
  ['correct horse battery staple', 'strong', true, 'level.strong'],
  ['Th1sIsMyLongPassphrase!', 'strong', true, 'level.strong'],
]

describe('scoring expectations', () => {
  it.each(table)('%s → %s', (password, level, valid, message, userInputs) => {
    const result = evaluate(password, { userInputs })
    expect({ level: result.level, valid: result.valid, message: result.message.key })
      .toEqual({ level, valid, message })
  })

  // #4: longer passwords made of the same character must not score lower
  it('never scores a repeated character lower when it gets longer', () => {
    const bits = ['zzzz', 'zzzzz', 'zzzzzz', 'zzzzzzz'].map((password) => evaluate(password).bits)
    expect(bits).toEqual([...bits].sort((a, b) => a - b))
    expect(new Set(bits).size).toBe(bits.length)
  })

  // #5: with minLength 0, the bar moves from the first character
  it('gives the first character a visible percent', () => {
    expect(evaluate('a', { rules: { minLength: 0 } }).percent).toBeGreaterThan(0)
  })

  it('lets a longer passphrase beat a shorter complex password', () => {
    expect(evaluate('correct horse battery staple').bits).toBeGreaterThan(evaluate('Tr0ub4dor&3').bits)
  })
})
