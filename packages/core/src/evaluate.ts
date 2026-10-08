import { estimateBits } from './estimator'
import { deepFreeze, resolveOptions } from './options'
import { checkRules } from './rules'
import type { EvaluateOptions, Level, Levels, Message, Meter, MeterOptions, ResolvedOptions, Result } from './types'
import { prepareWords, type WordList } from './words'

/**
 * The level whose lower bound is the highest one not above `percent`
 * (or the lowest level, if every bound is above it).
 */
export function levelFor(percent: number, levels: Readonly<Levels>): Exclude<Level, 'empty'> {
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

function computeResult(password: string, options: ResolvedOptions, words: WordList, userInputs: readonly string[]): Result {
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

/** Computes a result and freezes it, so results are never mutated by their holder. */
function compute(password: string, options: ResolvedOptions, words: WordList, userInputs: readonly string[]): Result {
  return deepFreeze(computeResult(password, options, words, userInputs))
}

/**
 * Creates a meter: resolves the options and prepares the word list once.
 * The meter is pure: evaluating the same password always gives the same result.
 */
export function createMeter(options: MeterOptions = {}): Meter {
  const resolved = resolveOptions(options)
  const words = prepareWords(resolved.commonPasswords)

  return {
    options: resolved,
    evaluate(password, userInputs = []) {
      return compute(password, resolved, words, userInputs)
    },
  }
}

/**
 * Evaluates a password once, with the given options (`userInputs` included).
 * For repeated evaluations (e.g. on every keystroke) use createMeter().
 */
export function evaluate(password: string, options: EvaluateOptions = {}): Result {
  const { userInputs = [], ...meterOptions } = options
  return createMeter(meterOptions).evaluate(password, userInputs)
}
