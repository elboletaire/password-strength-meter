import { isLang, LANG_STORAGE_KEY, LANGS, type Lang } from '../common/langs'

/**
 * The language of the whole site, shared by every page: the stored choice, else the browser's language
 * when it is English, Spanish or Catalan, else English. The page's boot script (src/shell/layout.ts)
 * already applied the same choice to `<html lang>` before the first paint.
 */

export type { Lang }
export { LANGS }

function detect(): Lang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (isLang(stored)) {
      return stored
    }
  }
  catch {
    // storage can be disabled: fall back to the browser's languages
  }
  for (const wanted of navigator.languages ?? [navigator.language]) {
    const code = wanted.slice(0, 2).toLowerCase()
    if (isLang(code)) {
      return code
    }
  }
  return 'en'
}

let current: Lang = detect()
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
