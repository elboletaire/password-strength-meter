import { escapeHtml } from '../common/escape.ts'
import { LANGS } from '../common/langs.ts'
import { PAGE_IDS } from './routes.ts'
import { pageUrl } from './site.ts'

/**
 * The sitemap: one `<url>` per page and language (21), each listing the whole set of alternates, itself
 * included, like the hreflang tags of the pages do. The URLs come from the same function as those tags.
 */
export function sitemap(base: string): string {
  const urls = PAGE_IDS.flatMap((page) => {
    const alternates = [
      ...LANGS.map((code) => ({ hreflang: code as string, href: pageUrl(page, code, base) })),
      { hreflang: 'x-default', href: pageUrl(page, 'en', base) },
    ]
    const links = alternates
      .map(({ hreflang, href }) => `      <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(href)}"/>`)
      .join('\n')
    return LANGS.map((code) => `  <url>
    <loc>${escapeHtml(pageUrl(page, code, base))}</loc>
${links}
  </url>`)
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
}
