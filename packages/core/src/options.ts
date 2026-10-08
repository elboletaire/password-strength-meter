import { commonPasswords } from './common-passwords'
import type { Options, PartialOptions } from './types'

export const defaults: Options = {
  targetBits: 100,
  commonWords: commonPasswords,
  rules: {
    minLength: 8,
    maxLength: 0,
    lowercase: 0,
    uppercase: 0,
    numbers: 0,
    symbols: 0,
    notUserInputs: true,
    notCommon: true,
  },
  levels: {
    'very-weak': 0,
    'weak': 20,
    'fair': 40,
    'good': 60,
    'strong': 80,
  },
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Deep-merges partial objects over `base`: plain objects are merged key by key,
 * anything else (arrays, functions, primitives) is replaced, and `undefined` is ignored.
 */
export function mergeDeep<T>(base: T, ...sources: unknown[]): T {
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const source of sources) {
    if (!isPlainObject(source)) {
      continue
    }
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) {
        continue
      }
      result[key] = isPlainObject(value) && isPlainObject(result[key])
        ? mergeDeep(result[key], value)
        : value
    }
  }
  return result as T
}

export function resolveOptions(options?: PartialOptions): Options {
  return mergeDeep(defaults, options)
}
