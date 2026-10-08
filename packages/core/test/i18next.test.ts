import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import i18next from 'i18next'
import { describe, expect, it } from 'vitest'
import { createTranslator, translationParams, type MessageKey, type Params } from '../src'
import { RULE_ORDER } from '../src/rules'

const dir = join(import.meta.dirname, '../../../locales')
const languages = readdirSync(dir).filter((file) => file.endsWith('.json')).map((file) => file.replace('.json', ''))
const load = (lang: string) => JSON.parse(readFileSync(join(dir, `${lang}.json`), 'utf8'))

// every message key, with the params the core would produce for it
const messages: Array<{ key: MessageKey, params: Params }> = [
  { key: 'empty', params: {} },
  ...(['very-weak', 'weak', 'fair', 'good', 'strong'] as const).map((level) => ({ key: `level.${level}` as MessageKey, params: {} })),
  ...RULE_ORDER.flatMap((rule) => [1, 2, 8, 1000000].map((n) => ({
    key: `rule.${rule}` as MessageKey,
    params: rule === 'maxLength' ? { max: n } : rule === 'notCommon' || rule === 'notUserInputs' ? {} : { min: n },
  }))),
]

describe('i18next compatibility', () => {
  it.each(languages)('%s renders the same with i18next and createTranslator', async (lang) => {
    const i18n = i18next.createInstance()
    await i18n.init({ lng: lang, resources: { [lang]: { passcore: load(lang) } }, interpolation: { escapeValue: false } })
    const t = i18n.getFixedT(lang, 'passcore')
    const translate = createTranslator(load(lang), lang)

    for (const message of messages) {
      const params = translationParams(message)
      const expected = t(message.key, params)
      expect(expected, `${lang} ${message.key} ${JSON.stringify(params)}`).not.toBe(message.key)
      expect(translate(message.key, params), `${lang} ${message.key} ${JSON.stringify(params)}`).toBe(expected)
    }
  })
})
