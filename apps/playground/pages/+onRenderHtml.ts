import { dangerouslySkipEscape, escapeInject } from 'vike/server'
import type { OnRenderHtmlAsync } from 'vike/types'
import { body, head } from '../src/shell/layout.ts'

export const onRenderHtml: OnRenderHtmlAsync = async (pageContext) => {
  const { pageId } = pageContext.config
  if (!pageId) {
    throw new Error(`The page ${pageContext.urlPathname} has no +pageId`)
  }
  const main = pageContext.Page()

  return escapeInject`<!doctype html>
<html lang="en">
  <head>
    ${dangerouslySkipEscape(head(pageId))}
  </head>
  <body>
    ${dangerouslySkipEscape(body(pageId, main))}
  </body>
</html>`
}
