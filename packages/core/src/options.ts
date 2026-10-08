import { commonPasswords } from './common-passwords'
import type { MeterOptions, ResolvedOptions } from './types'

/** The default options, deep-frozen. */
export const defaultOptions: Readonly<ResolvedOptions> = deepFreeze({
  targetBits: 100,
  commonPasswords,
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
})

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

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

/** Copies plain objects and arrays deeply; anything else (functions, primitives) is kept as is. */
function copy<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(copy) as T
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copy(item)])) as T
  }
  return value
}

/** Freezes an object, its plain objects and its arrays, recursively. */
export function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach(deepFreeze)
  }
  else if (isPlainObject(value)) {
    Object.values(value).forEach(deepFreeze)
  }
  else {
    // primitives, and functions such as an estimator, belong to the caller
    return value
  }
  return Object.freeze(value)
}

/**
 * Resolves the options of a meter: the defaults merged with the given ones.
 * Everything is copied, so the result never shares objects with the defaults or the caller.
 */
export function resolveOptions(options: MeterOptions = {}): ResolvedOptions {
  return deepFreeze(copy(mergeDeep(defaultOptions, options))) as ResolvedOptions
}
