import type { OnPrerenderStartAsync } from 'vike/types'
import { LANGS } from '../src/common/langs.ts'

/** Pre-renders every page once per language: the English original, and copies under `/es/` and `/ca/`. */
export const onPrerenderStart: OnPrerenderStartAsync = async (prerenderContext) => {
  const pageContexts = prerenderContext.pageContexts.flatMap((pageContext) => {
    // the error page and the sitemap are not translated. The copy drops Vike's deprecated `url` getter, which would warn when it is read back
    if (pageContext.pageId === null || pageContext.pageId === undefined || /\/(_error|sitemap)\b/.test(pageContext.pageId)) {
      return [{ ...pageContext }]
    }
    return LANGS.map((lang) => lang === 'en'
      ? { ...pageContext, lang }
      : { ...pageContext, lang, urlOriginal: `/${lang}${pageContext.urlOriginal}`, urlLogical: pageContext.urlOriginal })
  })
  return { prerenderContext: { pageContexts } }
}
