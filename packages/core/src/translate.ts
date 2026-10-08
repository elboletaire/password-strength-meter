import type { Message, Params, Translate, Translations } from './types'

/**
 * The message params plus `count` (from `min`, else `max`), which selects plural forms.
 */
export function translationParams(message: Message): Params {
  const count = message.params.min ?? message.params.max
  return count === undefined ? { ...message.params } : { ...message.params, count }
}

const isNested = (value: unknown): value is Translations =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Deep-merges one layer over another, without mutating either. Only plain objects are merged. */
function mergeLayer(base: Translations, layer: Translations): Translations {
  const result: Translations = { ...base }
  for (const [key, value] of Object.entries(layer)) {
    const current = result[key]
    result[key] = isNested(value) && isNested(current)
      ? mergeLayer(current, value)
      : value
  }
  return result
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
 * `translations` can be a list of layers, deep-merged in order (later layers win).
 * Missing keys translate to the key itself.
 */
export function createTranslator(translations: Translations | readonly Translations[], locale = 'en'): Translate {
  const plurals = new Intl.PluralRules(locale)
  const layers: readonly Translations[] = Array.isArray(translations) ? translations : [translations as Translations]
  const merged = layers.reduce(mergeLayer, {})

  return (key, params = {}) => {
    const count = params.count
    const candidates = typeof count === 'number'
      ? [`${key}_${plurals.select(count)}`, `${key}_other`, key]
      : [key]

    for (const candidate of candidates) {
      const text = lookup(merged, candidate)
      if (text !== undefined) {
        return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, name: string) =>
          name in params ? String(params[name]) : placeholder)
      }
    }
    return key
  }
}
