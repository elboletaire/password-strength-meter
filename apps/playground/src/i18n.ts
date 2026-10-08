import i18next from 'i18next'
import { currentLang, LANGS, locales, onLanguageChange } from './site'

/**
 * The playground's own i18next instance, with the bundled files in the `passcore` namespace.
 * Its language follows the header switcher, so `translate` always returns the current language.
 */
export const i18n = i18next.createInstance()

void i18n.init({
  lng: currentLang(),
  fallbackLng: 'en',
  defaultNS: 'passcore',
  ns: ['passcore'],
  resources: Object.fromEntries(LANGS.map((lang) => [lang, { passcore: locales[lang] }])),
  interpolation: { escapeValue: false },
  initAsync: false,
})

// the listener is registered when this module loads, so it runs before the pages' own listeners
onLanguageChange((lang) => {
  void i18n.changeLanguage(lang)
})

/** The `translate` option of the bindings: (key, params) => text, from the instance above. */
export const translate = (key: string, params?: Record<string, number>): string => i18n.t(key, { ns: 'passcore', ...params })
