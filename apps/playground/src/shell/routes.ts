export const PAGE_IDS = ['index', 'inspector', 'jquery', 'vanilla', 'react', 'vue', 'svelte'] as const

export type PageId = typeof PAGE_IDS[number]

export const isPageId = (value: string): value is PageId => (PAGE_IDS as readonly string[]).includes(value)

/**
 * The URL of a page: clean, with a trailing slash (`/password-strength-meter/react/`), which is what GitHub Pages
 * serves without a redirect. Every internal link of the shell goes through here.
 */
export function url(page: PageId, hash?: string): string {
  const path = page === 'index' ? '' : `${page}/`
  return `${import.meta.env.BASE_URL}${path}${hash ? `#${hash}` : ''}`
}
