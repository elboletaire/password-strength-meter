/**
 * Messages shown once the score passes each threshold, keyed by score.
 */
export type Steps = Record<number | string, string>

/**
 * Color ranges used to paint the bar when `useColorBarImage` is disabled.
 * `red` and `green` are `[min, max]` ranges; `blue` is a fixed base value.
 */
export interface ColorBarRGB {
  red?: [number, number]
  green?: [number, number]
  blue?: number
}

export interface MeterOptions {
  /** Text shown while the password is empty. */
  enterPass: string
  /** Text shown while the password is shorter than `minimumLength`. */
  shortPass: string
  /** Text shown when the password matches (or contains) the field value. */
  containsField: string
  /** Score thresholds and their messages. */
  steps: Steps
  /** Below this length the score is -1. */
  minimumLength: number
  /** Whether a password containing the field value (not only equal to it) is rejected. */
  fieldPartialMatch: boolean
  /** Use the legacy background image instead of a computed color. */
  useColorBarImage: boolean
  customColorBarRGB: ColorBarRGB
}

export const defaults: MeterOptions = {
  enterPass: 'Type your password',
  shortPass: 'The password is too short',
  containsField: 'The password contains your username',
  steps: {
    13: 'Really insecure password',
    33: 'Weak; try combining letters & numbers',
    67: 'Medium; try using special characters',
    94: 'Strong password',
  },
  minimumLength: 4,
  fieldPartialMatch: true,
  useColorBarImage: false,
  customColorBarRGB: {
    red: [0, 240],
    green: [0, 240],
    blue: 10,
  },
}

/**
 * Shallow-merges option objects over `base`, skipping `undefined` values
 * like `$.extend` did (nested objects such as `steps` are replaced, not merged).
 */
export function mergeOptions<T extends object>(base: T, ...sources: Array<Partial<T> | undefined>): T {
  const result = { ...base }
  for (const source of sources) {
    if (!source) {
      continue
    }
    for (const key of Object.keys(source) as Array<keyof T>) {
      const value = source[key]
      if (value !== undefined) {
        result[key] = value as T[keyof T]
      }
    }
  }
  return result
}

export function resolveOptions(options?: Partial<MeterOptions>): MeterOptions {
  return mergeOptions(defaults, options)
}
