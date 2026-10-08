import { requirementKey, requirementState } from '../common/requirements'
import { t } from './i18n'

export { REQUIREMENT_RULES, requirementState, type RequirementState } from '../common/requirements'

/**
 * Texts of the requirements checklists (markup: `checklistHtml()` in src/shell/components.ts for the plain
 * pages, and the Checklist demos of React, Vue and Svelte).
 */

/** A rule, in words: "At least 8 characters", "A lowercase letter"... (neutral labels, not the failure messages). */
export function requirementLabel(rule: { id: string, params: Record<string, number> }): string {
  const [key, params] = requirementKey(rule)
  return t(key, params)
}

/** What screen readers hear after a requirement: "met" or "not met"; nothing before anything is typed. */
export function requirementStateText(state: 'idle' | 'met' | 'unmet'): string {
  return state === 'idle' ? '' : t(`requirements.${state}`)
}

/** "5 of 7 requirements met", or "7 requirements to meet" before anything is typed. */
export function requirementsSummary(rules: ReadonlyArray<{ passed: boolean }>, typed: boolean): string {
  const total = rules.length
  return typed
    ? t('requirements.summary', { met: rules.filter((rule) => rule.passed).length, total })
    : t('requirements.summaryIdle', { total })
}

/** Writes a live region only when its text changes, so screen readers hear it once per change. */
export function setLiveText(element: Element, text: string): void {
  if (element.textContent !== text) {
    element.textContent = text
  }
}

/** Renders `result.rules` into a checklist of the plain pages (`checklistHtml(id)`): states and summary. */
export function renderChecklist(id: string, rules: ReadonlyArray<{ id: string, passed: boolean }>, typed: boolean): void {
  for (const rule of rules) {
    const item = document.querySelector<HTMLElement>(`#${id} [data-rule="${rule.id}"]`)
    if (item) {
      item.dataset.state = requirementState(typed, rule.passed)
    }
  }
  const summary = document.getElementById(`${id}-summary`)
  if (summary) {
    setLiveText(summary, requirementsSummary(rules, typed))
  }
}
