import { isLang, LANGS, type Lang } from '../common/langs'

/**
 * The language of the page: the one its HTML was rendered in (`<html lang>`, written at build time from the
 * URL: `/es/...` is Spanish). It never changes while the page is open: switching language is a navigation to
 * the other URL, see src/lib/site.ts.
 */

export type { Lang }
export { LANGS }

const lang = document.documentElement.lang
const current: Lang = isLang(lang) ? lang : 'en'

export function currentLang(): Lang {
  return current
}
