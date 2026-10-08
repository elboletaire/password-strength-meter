import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { PasswordStrengthMeter } from '../src'

describe('PasswordStrengthMeter events', () => {
  afterEach(cleanup)

  it('emits nothing on mount', async () => {
    const { emitted } = render(PasswordStrengthMeter, { props: { password: 'k8#Qz!2mWp' } })
    expect(emitted('score')).toBeUndefined()
    expect(emitted('text')).toBeUndefined()
  })

  it('emits score with the percent and the result on every change', async () => {
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: '' } })
    await rerender({ password: 'ab' })
    await rerender({ password: 'abc' })
    await rerender({ password: 'k8#Qz!2mWp' })
    const scores = emitted('score') as Array<[number, { level: string }]>
    expect(scores.map(([percent, result]) => [percent, result.level])).toEqual([
      [6, 'very-weak'],
      [7, 'very-weak'],
      [66, 'good'],
    ])
  })

  it('does not emit when a parent passes new but equal objects', async () => {
    const props = { password: 'Tester23$' }
    const { emitted, rerender } = render(PasswordStrengthMeter, {
      props: { ...props, commonWords: ['acmecorp'], rules: { minLength: 8 }, userInputs: ['john'] },
    })
    await rerender({ ...props, commonWords: ['acmecorp'], rules: { minLength: 8 }, userInputs: ['john'] })
    expect(emitted('score')).toBeUndefined()
    expect(emitted('text')).toBeUndefined()
  })

  it('does not emit score when the evaluated result is the same', async () => {
    // a different password with an identical result, and an option set to its default value
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: 'xqz' } })
    await rerender({ password: 'xqy' })
    expect(emitted('score')).toBeUndefined()
    await rerender({ password: 'xqy', targetBits: 100 })
    expect(emitted('score')).toBeUndefined()
  })

  it('does not emit score when nothing changed', async () => {
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: 'abc' } })
    await rerender({ password: 'abc' })
    expect(emitted('score')).toBeUndefined()
  })

  it('emits score when the user inputs change the result', async () => {
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: 'johndoe99' } })
    expect(emitted('score')).toBeUndefined()
    await rerender({ userInputs: ['johndoe'] })
    const scores = emitted('score') as Array<[number, { valid: boolean }]>
    expect(scores).toHaveLength(1)
    expect(scores[0]?.[1].valid).toBe(false)
  })

  it('emits score when the options change the result', async () => {
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: 'k8#Qz!2mWp' } })
    await rerender({ rules: { minLength: 12 } })
    const scores = emitted('score') as Array<[number, { valid: boolean }]>
    expect(scores).toHaveLength(1)
    expect(scores[0]?.[1].valid).toBe(false)
  })

  it('emits text only when the message changes', async () => {
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: 'ab' } })
    await rerender({ password: 'abc' })
    expect(emitted('text')).toBeUndefined()
    await rerender({ password: 'k8#Qz!2mWp' })
    const texts = emitted('text') as Array<[string, { level: string }]>
    expect(texts).toHaveLength(1)
    expect(texts[0]?.[0]).toBe('Good password')
    expect(texts[0]?.[1].level).toBe('good')
  })

  it('emits text for every distinct message', async () => {
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: '' } })
    await rerender({ password: 'abc' })
    await rerender({ password: 'password' })
    await rerender({ password: 'Tester23$' })
    const texts = (emitted('text') as Array<[string]>).map(([text]) => text)
    expect(texts).toEqual([
      'Use at least 8 characters',
      'This password is too common',
      'Weak password',
    ])
  })

  it('does not emit text when only the translations change', async () => {
    const { emitted, rerender } = render(PasswordStrengthMeter, { props: { password: 'abc' } })
    await rerender({ translations: { rule: { minLength_other: 'Min {{count}}!' } } })
    expect(emitted('text')).toBeUndefined()
  })
})
