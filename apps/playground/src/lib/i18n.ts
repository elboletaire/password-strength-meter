import type { Translations } from '@passcore/core'
import i18next from 'i18next'
import ca from '../../../../locales/ca.json'
import en from '../../../../locales/en.json'
import es from '../../../../locales/es.json'
import siteCa from '../locales/site.ca.json'
import siteEn from '../locales/site.en.json'
import siteEs from '../locales/site.es.json'
import { currentLang, LANGS, type Lang } from './lang'

/**
 * The playground's i18next instance: the site's own texts in the `site` namespace, and the meter texts
 * the packages bundle (the repository's locales/ folder) in the `passcore` namespace, the way an app
 * that already uses i18next would load them. Its language is the page's own.
 */

/** The bundled meter translations, in i18next's JSON format. */
export const locales: Record<Lang, Translations> = { en, es, ca }

const site: Record<Lang, object> = { en: siteEn, es: siteEs, ca: siteCa }

export const i18n = i18next.createInstance()

void i18n.init({
  lng: currentLang(),
  fallbackLng: 'en',
  defaultNS: 'site',
  ns: ['site', 'passcore'],
  resources: Object.fromEntries(LANGS.map((lang) => [lang, { site: site[lang], passcore: locales[lang] }])),
  interpolation: { escapeValue: false },
  initAsync: false,
})

/** A text of the site. */
export const t = (key: string, params?: Record<string, unknown>): string => i18n.t(key, { ns: 'site', ...params })

/** The `translate` option of the bindings: (key, params) => text, from the `passcore` namespace. */
export const translate = (key: string, params?: Record<string, number>): string => i18n.t(key, { ns: 'passcore', ...params })

/** A number in the page language's format: 66,7 in Spanish and Catalan. */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => new Intl.NumberFormat(currentLang(), options).format(value)

/** The accessible name of the meters, in the page language. */
export const meterLabel = (): string => t('meter.label')

/** The bundled texts, the locale and the accessible name of a meter, in the page's language: the options of every demo. */
export const meterTexts = () => ({ translations: locales[currentLang()], locale: currentLang(), label: meterLabel() })
