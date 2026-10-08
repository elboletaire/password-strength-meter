import type { Message, MessageKey, Params } from './types'

/** Nested translations, in i18next's JSON format. */
export type Translations = { [key: string]: string | Translations }

/** Turns a message key and its params into text, e.g. a translator or i18next's `t`. */
export type Translate = (key: MessageKey, params?: Params) => string

/**
 * The message params plus `count` (from `min`, else `max`), which selects plural forms.
 */
export function translationParams(message: Message): Params {
  const count = message.params.min ?? message.params.max
  return count === undefined ? { ...message.params } : { ...message.params, count }
}

function lookup(translations: Translations, path: string): string | undefined {
  let node: string | Translations | undefined = translations
  for (const part of path.split('.')) {
    if (typeof node !== 'object') {
      return undefined
    }
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

/**
 * Creates a translator over nested translations, compatible with i18next's format:
 * plural forms as `key_one`, `key_other`... selected by `count`, and `{{param}}` placeholders.
 * Missing keys translate to the key itself.
 */
export function createTranslator(translations: Translations, locale = 'en'): Translate {
  const plurals = new Intl.PluralRules(locale)

  return (key, params = {}) => {
    const count = params.count
    const candidates = typeof count === 'number'
      ? [`${key}_${plurals.select(count)}`, `${key}_other`, key]
      : [key]

    for (const candidate of candidates) {
      const text = lookup(translations, candidate)
      if (text !== undefined) {
        return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, name: string) =>
          name in params ? String(params[name]) : placeholder)
      }
    }
    return key
  }
}
