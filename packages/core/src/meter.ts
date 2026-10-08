import { barStyle, type BarStyle } from './color'
import { resolveOptions, type MeterOptions } from './options'
import { calculateScore } from './score'
import { scoreText } from './text'

export interface MeterState {
  /** -1 (too short), -2 (contains the field value) or 0 to 100. */
  score: number
  /** The score clamped to 0 to 100, used for the bar width. */
  percent: number
  /** The message to display. */
  text: string
  /** Inline styles for the color bar. */
  style: BarStyle
}

/**
 * Evaluates a password, returning everything a meter needs to render it.
 */
export function evaluate(password: string, options: MeterOptions, field?: string): MeterState {
  const score = calculateScore(password, options, field)
  const percent = score < 0 ? 0 : score
  let text = scoreText(score, options)
  if (!password.length && score <= 0) {
    text = options.enterPass
  }

  return {
    score,
    percent,
    text,
    style: barStyle(percent, options),
  }
}

export interface MeterUpdate extends MeterState {
  /** Whether `text` differs from the previous update (or from `enterPass` on the first one). */
  textChanged: boolean
}

export interface Meter {
  readonly options: MeterOptions
  /** The state of the last update, or the initial (empty password) state. */
  readonly state: MeterState
  update(password: string, field?: string): MeterUpdate
}

/**
 * Creates a stateful meter that remembers the last displayed text, so bindings
 * know when to notify text changes.
 */
export function createMeter(options?: Partial<MeterOptions>): Meter {
  const resolved = resolveOptions(options)
  let state: MeterState = {
    score: 0,
    percent: 0,
    text: resolved.enterPass,
    style: barStyle(0, resolved),
  }

  return {
    options: resolved,
    get state() {
      return state
    },
    update(password, field) {
      const next = evaluate(password, resolved, field)
      const textChanged = next.text !== state.text
      state = next
      return { ...next, textChanged }
    },
  }
}
