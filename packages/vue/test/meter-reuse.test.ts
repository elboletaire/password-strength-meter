import { effectScope, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePasswordStrength, type PasswordOptions } from '../src/use-password-strength'

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

function run<T>(setup: () => T): T {
  const scope = effectScope()
  const returned = scope.run(setup)
  if (!returned) {
    throw new Error('the scope did not run')
  }
  return returned
}

beforeEach(() => {
  created.count = 0
})

describe('usePasswordStrength meter reuse', () => {
  it('creates the meter once while the password changes', () => {
    const password = ref('')
    const { result } = run(() => usePasswordStrength(password))
    for (const value of ['a', 'ab', 'abc', 'abcd', 'abcde']) {
      password.value = value
      expect(result.value.percent).toBeGreaterThan(0)
    }
    expect(created.count).toBe(1)
  })

  it('does not recreate the meter for new but equal options', () => {
    const options = ref<PasswordOptions>({ rules: { minLength: 8 }, levels: { strong: 80 }, commonWords: ['acme'], userInputs: ['john'] })
    const { result } = run(() => usePasswordStrength('abc', options))
    expect(result.value.valid).toBe(false)
    options.value = { rules: { minLength: 8 }, levels: { strong: 80 }, commonWords: ['acme'], userInputs: ['john'] }
    expect(result.value.valid).toBe(false)
    expect(created.count).toBe(1)
  })

  it('recreates the meter when rules, levels, targetBits or commonWords change by value', () => {
    const options = ref<PasswordOptions>({ rules: { minLength: 8 } })
    const { result } = run(() => usePasswordStrength('abcdefghij', options))
    expect(result.value.valid).toBe(true)

    options.value = { rules: { minLength: 12 } }
    expect(result.value.valid).toBe(false)
    expect(created.count).toBe(2)

    options.value = { rules: { minLength: 12 }, targetBits: 50 }
    expect(result.value.percent).toBeGreaterThan(0)
    expect(created.count).toBe(3)

    options.value = { rules: { minLength: 12 }, targetBits: 50, commonWords: ['abcdefghij'] }
    expect(result.value.message.key).toBe('rule.minLength')
    expect(created.count).toBe(4)
  })
})
