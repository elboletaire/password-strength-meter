import type { Translations } from '@passcore/core'
import ca from '../../../locales/ca.json'
import en from '../../../locales/en.json'
import es from '../../../locales/es.json'
import './style.css'

/**
 * Shared by every page: the language of the meter texts (the site's own texts stay in English),
 * remembered across pages, and the switcher in the header.
 */

export type Lang = 'en' | 'es' | 'ca'

export const LANGS: readonly Lang[] = ['en', 'es', 'ca']

/** The bundled translation files, in i18next's JSON format. */
export const locales: Record<Lang, Translations> = { en, es, ca }

const STORAGE_KEY = 'passcore-playground-lang'
const listeners = new Set<(lang: Lang) => void>()

const isLang = (value: unknown): value is Lang => LANGS.some((lang) => lang === value)

function readStored(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLang(stored)) {
      return stored
    }
  }
  catch {
    // storage can be disabled: fall back to English
  }
  return 'en'
}

let current: Lang = readStored()

export function currentLang(): Lang {
  return current
}

/** Calls `listener` on every language change; returns the function that removes it. */
export function onLanguageChange(listener: (lang: Lang) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function markButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === current))
  })
}

function setLang(lang: Lang): void {
  if (lang === current) {
    return
  }
  current = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  }
  catch {
    // not persisted, the switch still works for this page
  }
  markButtons()
  listeners.forEach((listener) => listener(lang))
}

document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((button) => {
  button.addEventListener('click', () => {
    if (isLang(button.dataset.lang)) {
      setLang(button.dataset.lang)
    }
  })
})
markButtons()
