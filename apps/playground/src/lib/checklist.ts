import type { Level } from '@passcore/core'
import { t } from './i18n'

/**
 * Helpers of the custom UIs built with the hook (React), the composable (Vue) and the helper (Svelte):
 * a five-step bar and a checklist of the rules.
 */

/** The rules the custom UIs turn on, over the defaults (minimum length, common passwords, personal details). */
export const CHECKLIST_RULES = { uppercase: 1, numbers: 1, symbols: 1 }

export const STEPS: Level[] = ['very-weak', 'weak', 'fair', 'good', 'strong']

/** How many of the five steps a level lights up. */
export const litSteps = (level: Level): number => STEPS.indexOf(level) + 1

/** A rule, in words: "At least 8 characters", "An uppercase letter"... */
export function describeRule(rule: { id: string, params: Record<string, number> }): string {
  const count = rule.params.min ?? rule.params.max
  return t(`checklist.rule.${rule.id}`, count === undefined ? undefined : { count })
}

/** The word screen readers hear after each rule. */
export const ruleState = (passed: boolean): string => t(passed ? 'checklist.met' : 'checklist.missing')
