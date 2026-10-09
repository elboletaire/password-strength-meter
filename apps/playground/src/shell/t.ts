import i18next from 'i18next'
import { escapeHtml } from '../common/escape.ts'
import { LANGS, type Lang } from '../common/langs.ts'
import ca from '../locales/site.ca.json' with { type: 'json' }
import en from '../locales/site.en.json' with { type: 'json' }
import es from '../locales/site.es.json' with { type: 'json' }

/**
 * Build-time texts: every page is written in its own language, and that is the final text: the browser
 * doesn't translate the shell, it only reads `<html lang>` for the demos' own texts.
 */

const site: Record<Lang, object> = { en, es, ca }

const instance = i18next.createInstance()

void instance.init({
  lng: 'en',
  resources: Object.fromEntries(LANGS.map((lang) => [lang, { site: site[lang] }])),
  defaultNS: 'site',
  ns: ['site'],
  // no fallback: a key missing in any language is an error, not an English text on a Spanish page
  fallbackLng: false,
  interpolation: { escapeValue: false },
  initAsync: false,
})

export type Params = Record<string, string | number>

let active: Lang | undefined

/**
 * Runs `render` with `lang` as the language of every text. It is synchronous on purpose: the language lives
 * only while `render` runs, so pre-rendering several pages in parallel can't mix them up.
 */
export function withLang<T>(lang: Lang, render: () => T): T {
  const previous = active
  active = lang
  try {
    return render()
  }
  finally {
    active = previous
  }
}

/** The language of the page being rendered. */
export function lang(): Lang {
  if (!active) {
    throw new Error('Site texts are only available inside withLang()')
  }
  return active
}

/** The text of a key in the language of the page. Throws on a missing key, in any language, so a typo fails the build. */
export function tr(key: string, params?: Params): string {
  const language = lang()
  if (!instance.exists(key, { lng: language, ...params })) {
    throw new Error(`Missing site text: ${key} (${language})`)
  }
  return instance.t(key, { lng: language, ...params })
}

export type Attrs = Record<string, string | number | boolean | undefined>

/** HTML attributes; `true` renders a bare attribute, `false` and `undefined` skip it. */
export function attrs(values: Attrs = {}): string {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== false)
    .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeHtml(String(value))}"`))
    .join('')
}

/** An element whose text is the translation of `key`. */
export function text(tag: string, key: string, extra: Attrs = {}, params?: Params): string {
  return `<${tag}${attrs(extra)}>${escapeHtml(tr(key, params))}</${tag}>`
}

/** An element whose content is the translation of `key`, as trusted HTML (our own resource files: `<code>`, `<strong>`). */
export function rich(tag: string, key: string, extra: Attrs = {}, params?: Params): string {
  return `<${tag}${attrs(extra)}>${tr(key, params)}</${tag}>`
}

/** Translated attributes, e.g. `{ placeholder: 'fields.username.placeholder' }`. */
export function tAttrs(map: Record<string, string>): Attrs {
  const result: Attrs = {}
  for (const [name, key] of Object.entries(map)) {
    result[name] = tr(key)
  }
  return result
}
