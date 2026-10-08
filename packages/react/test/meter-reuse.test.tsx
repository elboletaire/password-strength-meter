import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePasswordStrength, type PasswordStrengthOptions } from '../src'

const created = vi.hoisted(() => ({ count: 0 }))

// count the meters created: the word list must be prepared once, not on every keystroke
vi.mock('@passcore/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@passcore/core')>()
  return {
    ...actual,
    createMeter: (options?: Parameters<typeof actual.createMeter>[0]) => {
      created.count++
      return actual.createMeter(options)
    },
  }
})

interface ProbeProps {
  password: string
  options?: PasswordStrengthOptions
}

function useProbe({ password, options }: ProbeProps) {
  return usePasswordStrength(password, options)
}

beforeEach(() => {
  created.count = 0
})

afterEach(() => cleanup())

describe('usePasswordStrength meter reuse', () => {
  it('creates the meter once while the password changes', () => {
    const { rerender } = renderHook(useProbe, { initialProps: { password: '' } as ProbeProps })
    for (const password of ['a', 'ab', 'abc', 'abcd', 'abcde']) {
      rerender({ password })
    }
    expect(created.count).toBe(1)
  })

  it('does not recreate the meter for new but equal options', () => {
    const options = (): PasswordStrengthOptions => ({ rules: { minLength: 8 }, levels: { strong: 80 }, commonPasswords: ['acme'], userInputs: ['john'] })
    const { rerender } = renderHook(useProbe, { initialProps: { password: 'abc', options: options() } as ProbeProps })
    rerender({ password: 'abc', options: options() })
    rerender({ password: 'abcd', options: options() })
    expect(created.count).toBe(1)
  })

  it('recreates the meter when rules, targetBits or commonPasswords change by value', () => {
    const { rerender, result } = renderHook(useProbe, {
      initialProps: { password: 'abcdefghij', options: { rules: { minLength: 8 } } } as ProbeProps,
    })
    expect(result.current.result.valid).toBe(true)

    rerender({ password: 'abcdefghij', options: { rules: { minLength: 12 } } })
    expect(result.current.result.valid).toBe(false)
    expect(created.count).toBe(2)

    rerender({ password: 'abcdefghij', options: { rules: { minLength: 12 }, targetBits: 50 } })
    expect(created.count).toBe(3)

    rerender({ password: 'abcdefghij', options: { rules: { minLength: 12 }, targetBits: 50, commonPasswords: ['abcdefghij'] } })
    expect(created.count).toBe(4)
  })
})
