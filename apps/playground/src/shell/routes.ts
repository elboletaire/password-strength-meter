import type { Lang } from '../common/langs.ts'

export const PAGE_IDS = ['index', 'inspector', 'jquery', 'vanilla', 'react', 'vue', 'svelte'] as const

export type PageId = typeof PAGE_IDS[number]

export const isPageId = (value: string): value is PageId => (PAGE_IDS as readonly string[]).includes(value)

/**
 * The URL of a page in a language: clean, with a trailing slash (`/password-strength-meter/es/react/`), which is
 * what GitHub Pages serves without a redirect. English stays at the root, Spanish and Catalan live under
 * `/es/` and `/ca/`. The build config has no Vite env, so it passes the `base` itself. Every internal link of the shell goes through here, so a page only links inside its language.
 */
export function url(page: PageId, lang: Lang, hash?: string, base = import.meta.env.BASE_URL): string {
  const path = page === 'index' ? '' : `${page}/`
  const prefix = lang === 'en' ? '' : `${lang}/`
  return `${base}${prefix}${path}${hash ? `#${hash}` : ''}`
}
