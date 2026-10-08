import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PasswordStrengthMeter } from '../src/lib/index'

afterEach(cleanup)

describe('callbacks', () => {
  it('does not fire on mount', async () => {
    const onscore = vi.fn()
    const ontext = vi.fn()
    render(PasswordStrengthMeter, { props: { password: 'k8#Qz!2mWp', onscore, ontext } })
    await tick()
    expect(onscore).not.toHaveBeenCalled()
    expect(ontext).not.toHaveBeenCalled()
  })

  it('fires onscore with the percent and the result on every change', async () => {
    const onscore = vi.fn()
    const { rerender } = render(PasswordStrengthMeter, { props: { password: '', onscore } })

    await rerender({ password: 'ab', onscore })
    await rerender({ password: 'abc', onscore })
    await rerender({ password: 'k8#Qz!2mWp', onscore })

    expect(onscore).toHaveBeenCalledTimes(3)
    expect(onscore.mock.calls.map(([percent]) => percent)).toEqual([6, 7, 66])
    const [, result] = onscore.mock.calls[2] as [number, { level: string, valid: boolean }]
    expect(result.level).toBe('good')
    expect(result.valid).toBe(true)
  })

  it('fires ontext only when the message changes', async () => {
    const ontext = vi.fn()
    const { rerender } = render(PasswordStrengthMeter, { props: { password: '', ontext } })

    await rerender({ password: 'ab', ontext })
    await rerender({ password: 'abc', ontext })
    await rerender({ password: 'k8#Qz!2mWp', ontext })

    expect(ontext.mock.calls.map(([text]) => text)).toEqual(['Use at least 8 characters', 'Good password'])
  })

  it('fires ontext when the failing rule changes, even if the level does not', async () => {
    const ontext = vi.fn()
    const { rerender } = render(PasswordStrengthMeter, { props: { password: 'abc', ontext } })

    await rerender({ password: 'password', ontext })
    expect(ontext.mock.calls.map(([text]) => text)).toEqual(['This password is too common'])
  })

  it('does not fire ontext when the message params stay the same', async () => {
    const ontext = vi.fn()
    const { rerender } = render(PasswordStrengthMeter, { props: { password: 'abc', ontext } })

    await rerender({ password: 'abcd', ontext })
    expect(ontext).toHaveBeenCalledTimes(0)
  })

  it('fires onscore when the user inputs change the result', async () => {
    const onscore = vi.fn()
    const { rerender } = render(PasswordStrengthMeter, {
      props: { password: 'johndoe99', userInputs: [], onscore },
    })

    await rerender({ password: 'johndoe99', userInputs: ['johndoe'], onscore })
    expect(onscore).toHaveBeenCalledTimes(1)
    const [, result] = onscore.mock.calls[0] as [number, { valid: boolean }]
    expect(result.valid).toBe(false)
  })

  it('does not fire when a parent passes new but equal objects', async () => {
    const onscore = vi.fn()
    const ontext = vi.fn()
    const props = () => ({
      password: 'Tester23$',
      commonPasswords: ['acmecorp'],
      rules: { minLength: 8 },
      userInputs: ['john'],
      onscore,
      ontext,
    })
    const { rerender } = render(PasswordStrengthMeter, { props: props() })
    await rerender(props())
    expect(onscore).not.toHaveBeenCalled()
    expect(ontext).not.toHaveBeenCalled()
  })

  it('does not fire onscore when only the callbacks change', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(PasswordStrengthMeter, { props: { password: 'abc', onscore: first } })

    await rerender({ password: 'abc', onscore: second })
    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
  })
})
