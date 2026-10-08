import i18next from 'i18next'
import { escapeHtml } from '../common/escape.ts'
import english from '../locales/site.en.json' with { type: 'json' }

/**
 * Build-time texts: the pages are written in English from the same resource file the browser uses,
 * and every text carries its key, so the browser can switch it to Spanish or Catalan in place.
 */

const instance = i18next.createInstance()

void instance.init({
  lng: 'en',
  resources: { en: { site: english } },
  defaultNS: 'site',
  ns: ['site'],
  interpolation: { escapeValue: false },
  initAsync: false,
})

export type Params = Record<string, string | number>

/** The English text of a key. Throws on a missing key, so a typo fails the build. */
export function en(key: string, params?: Params): string {
  if (!instance.exists(key, params)) {
    throw new Error(`Missing site text: ${key}`)
  }
  return instance.t(key, params)
}

export type Attrs = Record<string, string | number | boolean | undefined>

/** HTML attributes; `true` renders a bare attribute, `false` and `undefined` skip it. */
export function attrs(values: Attrs = {}): string {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== false)
    .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeHtml(String(value))}"`))
    .join('')
}

const paramsAttr = (params?: Params): Attrs => (params ? { 'data-i18n-params': JSON.stringify(params) } : {})

/** An element whose text is the translation of `key`. */
export function text(tag: string, key: string, extra: Attrs = {}, params?: Params): string {
  return `<${tag}${attrs({ ...extra, 'data-i18n': key, ...paramsAttr(params) })}>${escapeHtml(en(key, params))}</${tag}>`
}

/** An element whose content is the translation of `key`, as trusted HTML (our own resource files: `<code>`, `<strong>`). */
export function rich(tag: string, key: string, extra: Attrs = {}, params?: Params): string {
  return `<${tag}${attrs({ ...extra, 'data-i18n-html': key, ...paramsAttr(params) })}>${en(key, params)}</${tag}>`
}

/** Translated attributes, e.g. `{ placeholder: 'fields.username.placeholder' }`, rendered in English with their keys. */
export function tAttrs(map: Record<string, string>): Attrs {
  const result: Attrs = {}
  for (const [name, key] of Object.entries(map)) {
    result[name] = en(key)
  }
  result['data-i18n-attr'] = Object.entries(map).map(([name, key]) => `${name}:${key}`).join(';')
  return result
}
