import { estimateBits } from './estimator'
import { resolveOptions } from './options'
import { checkRules } from './rules'
import type { Level, Levels, Message, MeterResult, Options, PartialOptions, Result } from './types'
import { prepareWords, type WordList } from './words'

/**
 * The level whose lower bound is the highest one not above `percent`
 * (or the lowest level, if every bound is above it).
 */
export function levelFor(percent: number, levels: Levels): Exclude<Level, 'empty'> {
  const sorted = (Object.entries(levels) as Array<[Exclude<Level, 'empty'>, number]>)
    .sort((a, b) => a[1] - b[1])
  let level = (sorted[0] as [Exclude<Level, 'empty'>, number])[0]
  for (const [name, min] of sorted) {
    if (min <= percent) {
      level = name
    }
  }
  return level
}

function compute(password: string, options: Options, words: WordList, userInputs: string[]): Result {
  const rules = checkRules(password, options.rules, words, userInputs)
  const valid = rules.every((rule) => rule.passed)

  if (!password.length) {
    return { bits: 0, percent: 0, level: 'empty', valid, rules, message: { key: 'empty', params: {} } }
  }

  const estimated = options.estimator
    ? options.estimator(password, userInputs)
    : estimateBits(password, userInputs, words)
  const bits = Number.isFinite(estimated) && estimated > 0 ? estimated : 0
  const target = options.targetBits > 0 ? options.targetBits : 1
  const percent = Math.round(Math.min(bits / target, 1) * 100)
  const level = levelFor(percent, options.levels)

  const failing = rules.find((rule) => !rule.passed)
  const message: Message = failing
    ? { key: `rule.${failing.id}`, params: failing.params }
    : { key: `level.${level}`, params: {} }

  return { bits, percent, level, valid, rules, message }
}

/**
 * Evaluates a password with the given options. Stateless: for repeated
 * evaluations (e.g. on every keystroke) use createMeter(), which prepares
 * the word list once and tracks message changes.
 */
export function evaluate(password: string, options?: PartialOptions, userInputs: string[] = []): Result {
  const resolved = resolveOptions(options)
  return compute(password, resolved, prepareWords(resolved.commonWords), userInputs)
}

export interface Meter {
  readonly options: Options
  evaluate(password: string, userInputs?: string[]): MeterResult
}

const sameMessage = (a: Message, b: Message): boolean =>
  a.key === b.key && JSON.stringify(a.params) === JSON.stringify(b.params)

/**
 * Creates a meter: resolves the options and prepares the word list once,
 * and reports whether each evaluation changed the message.
 */
export function createMeter(options?: PartialOptions): Meter {
  const resolved = resolveOptions(options)
  const words = prepareWords(resolved.commonWords)
  let previous: Message = { key: 'empty', params: {} }

  return {
    options: resolved,
    evaluate(password, userInputs = []) {
      const result = compute(password, resolved, words, userInputs)
      const messageChanged = !sameMessage(result.message, previous)
      previous = result.message
      return { ...result, messageChanged }
    },
  }
}
