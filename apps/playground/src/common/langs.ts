/**
 * The languages of the site, shared by the build (the page shell) and the browser.
 */

export type Lang = 'en' | 'es' | 'ca'

export const LANGS: readonly Lang[] = ['en', 'es', 'ca']

/** The name of each language, in that language: the switcher shows them like this in every language. */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
}

export const LANG_STORAGE_KEY = 'passcore-playground-lang'
export const THEME_STORAGE_KEY = 'passcore-playground-theme'
export const PM_STORAGE_KEY = 'passcore-playground-pm'

export const isLang = (value: unknown): value is Lang => LANGS.some((lang) => lang === value)
