import { dangerouslySkipEscape, escapeInject } from 'vike/server'
import type { OnRenderHtmlAsync } from 'vike/types'
import { body, head } from '../src/shell/layout.ts'
import { withLang } from '../src/shell/t.ts'

export const onRenderHtml: OnRenderHtmlAsync = async (pageContext) => {
  const { pageId } = pageContext.config
  if (!pageId) {
    throw new Error(`The page ${pageContext.urlPathname} has no +pageId`)
  }
  const lang = pageContext.lang
  const { headHtml, bodyHtml } = withLang(lang, () => ({
    headHtml: head(pageId),
    bodyHtml: body(pageId, pageContext.Page()),
  }))

  return escapeInject`<!doctype html>
<html lang="${lang}">
  <head>
    ${dangerouslySkipEscape(headHtml)}
  </head>
  <body>
    ${dangerouslySkipEscape(bodyHtml)}
  </body>
</html>`
}
