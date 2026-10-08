import type { MeterOptions } from './options'
import { SCORE_CONTAINS_FIELD, SCORE_TOO_SHORT } from './score'

/**
 * Returns the message for the given score.
 *
 * legacy-compat: step keys are sorted as strings, so thresholds such as
 * `{ 5, 50, 100 }` are visited as `100, 5, 50` and the last one below the
 * score wins.
 */
export function scoreText(
  score: number,
  options: Pick<MeterOptions, 'shortPass' | 'containsField' | 'steps'>,
): string {
  if (score === SCORE_TOO_SHORT) {
    return options.shortPass
  }
  if (score === SCORE_CONTAINS_FIELD) {
    return options.containsField
  }

  score = score < 0 ? 0 : score

  let text = options.shortPass
  const sortedStepKeys = Object.keys(options.steps).sort()
  for (const stepVal of sortedStepKeys) {
    if (Number(stepVal) < score) {
      text = options.steps[stepVal] as string
    }
  }

  return text
}
