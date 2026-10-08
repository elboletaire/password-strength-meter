import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RULE_ORDER, type Translations } from '../src'

const dir = join(import.meta.dirname, '../../../locales')
const files = readdirSync(dir).filter((file) => file.endsWith('.json'))

const COUNT_RULES = ['minLength', 'maxLength', 'lowercase', 'uppercase', 'numbers', 'symbols']

/**
 * Every leaf key a locale must have, as dotted paths. Count-based rules need a form for
 * every plural category of the language: i18next does not fall back from `_many` to `_other`.
 */
const expected = (lang: string) => {
  const categories = new Intl.PluralRules(lang).resolvedOptions().pluralCategories
  return [
    'empty',
    ...['very-weak', 'weak', 'fair', 'good', 'strong'].map((level) => `level.${level}`),
    ...RULE_ORDER.flatMap((rule) => COUNT_RULES.includes(rule)
      ? categories.map((category) => `rule.${rule}_${category}`)
      : [`rule.${rule}`]),
  ].sort()
}

function leaves(node: Translations, prefix = ''): Array<[string, unknown]> {
  return Object.entries(node).flatMap(([key, value]) => typeof value === 'object' && value !== null
    ? leaves(value, prefix + key + '.')
    : [[prefix + key, value]])
}

describe('locales', () => {
  it('includes en, es and ca', () => {
    expect(files).toEqual(expect.arrayContaining(['en.json', 'es.json', 'ca.json']))
  })

  it.each(files)('%s has exactly the expected keys, all strings', (file) => {
    const entries = leaves(JSON.parse(readFileSync(join(dir, file), 'utf8')))
    expect(entries.map(([key]) => key).sort()).toEqual(expected(file.replace('.json', '')))
    for (const [key, value] of entries) {
      expect(typeof value, key).toBe('string')
      expect((value as string).trim(), key).not.toBe('')
    }
  })

  it.each(files)('%s only uses the {{count}} placeholder, in plural forms', (file) => {
    for (const [key, value] of leaves(JSON.parse(readFileSync(join(dir, file), 'utf8')))) {
      const placeholders = (value as string).match(/\{\{\s*\w+\s*\}\}/g) ?? []
      for (const placeholder of placeholders) {
        expect(placeholder.replace(/\s/g, ''), key).toBe('{{count}}')
      }
    }
  })
})
