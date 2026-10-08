import type { Translations } from '@passcore/core'
import i18next from 'i18next'
import ca from '../../../../locales/ca.json'
import en from '../../../../locales/en.json'
import es from '../../../../locales/es.json'
import siteCa from '../locales/site.ca.json'
import siteEn from '../locales/site.en.json'
import siteEs from '../locales/site.es.json'
import { currentLang, LANGS, onLanguageChange, type Lang } from './lang'

/**
 * The playground's i18next instance: the site's own texts in the `site` namespace, and the meter texts
 * the packages bundle (the repository's locales/ folder) in the `passcore` namespace, the way an app
 * that already uses i18next would load them. Its language follows the switcher in the header.
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

// registered when this module loads, before any page listener: they all see the new language
onLanguageChange((lang) => {
  void i18n.changeLanguage(lang)
})

/** A text of the site. */
export const t = (key: string, params?: Record<string, unknown>): string => i18n.t(key, { ns: 'site', ...params })

/** The `translate` option of the bindings: (key, params) => text, from the `passcore` namespace. */
export const translate = (key: string, params?: Record<string, number>): string => i18n.t(key, { ns: 'passcore', ...params })

/** A number in the current language's format: 66,7 in Spanish and Catalan. */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => new Intl.NumberFormat(currentLang(), options).format(value)

/** The accessible name of the meters, in the current language. */
export const meterLabel = (): string => t('meter.label')

/** Translates the elements marked at build time (`data-i18n`, `data-i18n-html`, `data-i18n-attr`) under `root`. */
export function applyTranslations(root: ParentNode = document): void {
  const params = (element: Element): Record<string, unknown> | undefined => {
    const raw = element.getAttribute('data-i18n-params')
    return raw ? JSON.parse(raw) as Record<string, unknown> : undefined
  }
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.getAttribute('data-i18n') ?? '', params(element))
  })
  root.querySelectorAll('[data-i18n-html]').forEach((element) => {
    // trusted: our own resource files
    element.innerHTML = t(element.getAttribute('data-i18n-html') ?? '', params(element))
  })
  root.querySelectorAll('[data-i18n-attr]').forEach((element) => {
    for (const pair of (element.getAttribute('data-i18n-attr') ?? '').split(';')) {
      const [name, key] = pair.split(':')
      if (name && key) {
        element.setAttribute(name, t(key, params(element)))
      }
    }
  })
}
