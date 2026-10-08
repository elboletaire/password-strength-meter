import { classify, type CharClass } from './charset'
import { normalize, normalizeChars, toChars, tokenize } from './normalize'
import type { RuleId, RuleResult, Rules } from './types'
import type { WordList } from './words'

/** Order in which rules are reported, and in which the first failing one becomes the message. */
export const RULE_ORDER: RuleId[] = [
  'minLength',
  'maxLength',
  'notCommon',
  'notUserInputs',
  'lowercase',
  'uppercase',
  'numbers',
  'symbols',
]

const CLASS_RULES: Partial<Record<RuleId, CharClass>> = {
  lowercase: 'lower',
  uppercase: 'upper',
  numbers: 'digit',
  symbols: 'symbol',
}

/**
 * Whether the password is a common word, alone or followed only by digits and symbols.
 */
export function isCommon(chars: string[], words: WordList): boolean {
  // shortest prefix after which everything is digits or symbols
  let suffixStart = chars.length
  while (suffixStart > 0) {
    const charClass = classify(chars[suffixStart - 1] as string)
    if (charClass !== 'digit' && charClass !== 'symbol') {
      break
    }
    suffixStart--
  }

  const normalized = normalizeChars(chars)
  for (let length = Math.max(suffixStart, 1); length <= chars.length; length++) {
    if (words.set.has(normalized.slice(0, length).join(''))) {
      return true
    }
  }
  return false
}

/**
 * Whether the password contains any user-input token (plain substring, after normalization).
 */
export function containsUserInput(password: string, userInputs: readonly string[]): boolean {
  const normalized = normalize(password)
  return tokenize(userInputs).some((token) => normalized.includes(token))
}

/**
 * Evaluates the enabled rules, in RULE_ORDER.
 */
export function checkRules(password: string, rules: Rules, words: WordList, userInputs: readonly string[]): RuleResult[] {
  const chars = toChars(password)
  const results: RuleResult[] = []

  for (const id of RULE_ORDER) {
    const charClass = CLASS_RULES[id]
    if (charClass) {
      const min = rules[id as 'lowercase' | 'uppercase' | 'numbers' | 'symbols']
      if (min > 0) {
        const count = chars.filter((char) => classify(char) === charClass).length
        results.push({ id, passed: count >= min, params: { min } })
      }
      continue
    }

    switch (id) {
      case 'minLength':
        if (rules.minLength > 0) {
          results.push({ id, passed: chars.length >= rules.minLength, params: { min: rules.minLength } })
        }
        break
      case 'maxLength':
        if (rules.maxLength > 0) {
          results.push({ id, passed: chars.length <= rules.maxLength, params: { max: rules.maxLength } })
        }
        break
      case 'notCommon':
        if (rules.notCommon) {
          results.push({ id, passed: !isCommon(chars, words), params: {} })
        }
        break
      case 'notUserInputs':
        if (rules.notUserInputs) {
          results.push({ id, passed: !containsUserInput(password, userInputs), params: {} })
        }
        break
    }
  }

  return results
}
