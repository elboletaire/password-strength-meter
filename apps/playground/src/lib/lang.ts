import { isLang, LANG_STORAGE_KEY, LANGS, type Lang } from '../common/langs'

/**
 * The language of the page: the one its HTML was rendered in (`<html lang>`, written at build time from the
 * URL: `/es/...` is Spanish). Switching language is a navigation to the other URL, see src/lib/site.ts.
 */

export type { Lang }
export { LANGS }

function read(): Lang {
  const lang = document.documentElement.lang
  return isLang(lang) ? lang : 'en'
}

let current: Lang = read()
const listeners = new Set<(lang: Lang) => void>()

export function currentLang(): Lang {
  return current
}

/** Calls `listener` on every language change; returns the function that removes it. */
export function onLanguageChange(listener: (lang: Lang) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setLang(lang: Lang): void {
  if (lang === current) {
    return
  }
  current = lang
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  }
  catch {
    // not remembered, but the switch still works on this page
  }
  document.documentElement.lang = lang
  listeners.forEach((listener) => listener(lang))
}
