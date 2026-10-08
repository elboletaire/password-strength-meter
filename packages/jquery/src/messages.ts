import type { MessageKey, Params } from '@passcore/core'

/** A message: a string with `{param}` placeholders, or a function of the params. */
export type MessageText = string | ((params: Params) => string)

export type Messages = Record<MessageKey, MessageText>

const count = (singular: string, plural: string) =>
  ({ min = 1 }: Params) => (min === 1 ? singular : plural.replace('{min}', String(min)))

/** English defaults, overridable per key with the `messages` option. */
export const defaultMessages: Messages = {
  'empty': 'Type your password',
  'level.very-weak': 'Very weak password',
  'level.weak': 'Weak password',
  'level.fair': 'Fair password',
  'level.good': 'Good password',
  'level.strong': 'Strong password',
  'rule.minLength': 'Use at least {min} characters',
  'rule.maxLength': 'Use at most {max} characters',
  'rule.notCommon': 'This password is too common',
  'rule.notUserInputs': 'Don\'t use your personal details',
  'rule.lowercase': count('Add a lowercase letter', 'Add at least {min} lowercase letters'),
  'rule.uppercase': count('Add an uppercase letter', 'Add at least {min} uppercase letters'),
  'rule.numbers': count('Add a number', 'Add at least {min} numbers'),
  'rule.symbols': count('Add a symbol', 'Add at least {min} symbols'),
}

/**
 * Turns a message key and its params into text.
 */
export function formatMessage(messages: Messages, key: MessageKey, params: Params): string {
  const text = messages[key]
  if (typeof text === 'function') {
    return text(params)
  }
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder)
}
