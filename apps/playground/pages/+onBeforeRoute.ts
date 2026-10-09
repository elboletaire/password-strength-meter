import type { OnBeforeRouteSync } from 'vike/types'
import { isLang, type Lang } from '../src/common/langs.ts'

declare global {
  // Vike's documented way to type its page context
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vike {
    interface PageContext {
      /** The language of the page, from the first segment of its URL (`/es/react/`); English has none. */
      lang: Lang
    }
  }
}

/** `/es/react/` is the `/react/` page in Spanish: the language is taken off the URL before routing. */
export const onBeforeRoute: OnBeforeRouteSync = (pageContext) => {
  const [, first = '', ...rest] = pageContext.urlPathname.split('/')
  if (first !== 'en' && isLang(first)) {
    return { pageContext: { lang: first, urlLogical: `/${rest.join('/')}` } }
  }
  return { pageContext: { lang: 'en' as Lang } }
}
