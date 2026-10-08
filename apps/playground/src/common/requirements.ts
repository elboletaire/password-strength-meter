/**
 * The requirements checklist, shared by the build (the plain pages' markup) and the browser (every binding).
 */

/** The rules the checklist demos turn on; the defaults add notCommon and notUserInputs. */
export const REQUIREMENT_RULES = { minLength: 8, lowercase: 1, uppercase: 1, numbers: 1, symbols: 1 }

/**
 * The seven requirements those rules add up to, in the order the core reports them (`RULE_ORDER` of
 * @passcore/core), with the `min` each one takes. The plain pages render this list at build time.
 */
export const REQUIREMENTS: Array<{ id: string, min?: number }> = [
  { id: 'minLength', min: REQUIREMENT_RULES.minLength },
  { id: 'notCommon' },
  { id: 'notUserInputs' },
  { id: 'lowercase', min: REQUIREMENT_RULES.lowercase },
  { id: 'uppercase', min: REQUIREMENT_RULES.uppercase },
  { id: 'numbers', min: REQUIREMENT_RULES.numbers },
  { id: 'symbols', min: REQUIREMENT_RULES.symbols },
]

/** Neutral until something is typed, then met or not met. */
export type RequirementState = 'idle' | 'met' | 'unmet'

export const requirementState = (typed: boolean, passed: boolean): RequirementState => {
  if (!typed) {
    return 'idle'
  }
  return passed ? 'met' : 'unmet'
}

/** The key and params of a requirement's label in the site's locale files: `count` picks the plural form. */
export function requirementKey(rule: { id: string, params?: Record<string, number> }): [string, { count: number } | undefined] {
  const count = rule.params?.min ?? rule.params?.max
  return [`requirements.rule.${rule.id}`, count === undefined ? undefined : { count }]
}
