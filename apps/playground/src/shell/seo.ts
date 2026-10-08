import { LANGS, type Lang } from '../common/langs.ts'
import { url, type PageId } from './routes.ts'
import { absolute, REPO } from './site.ts'
import { attrs, lang, tr } from './t.ts'

const OG_LOCALES: Record<Lang, string> = { en: 'en_US', es: 'es_ES', ca: 'ca_ES' }

/** The `--bg` token of style.css in each scheme, for the browser chrome. */
const THEME_COLORS = { light: '#f4f3ee', dark: '#0e1013' }

/** The package each binding page is about. */
const PACKAGES: Partial<Record<PageId, string>> = {
  jquery: 'jquery',
  vanilla: 'vanilla',
  react: 'react',
  vue: 'vue',
  svelte: 'svelte',
}

const NAME = 'Passcore'

/** The absolute URL of a page in a language: the canonical of that language, and its hreflang target. */
export const pageUrl = (page: PageId, code: Lang): string => absolute(url(page, code))

/** JSON for a `<script>`: a `<` becomes `<`, so no text can close the tag. */
const json = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')

const jsonLd = (...nodes: object[]): string => nodes
  .map((node) => `<script type="application/ld+json">${json({ '@context': 'https://schema.org', ...node })}</script>`)
  .join('\n    ')

function breadcrumb(page: PageId): object {
  const current = lang()
  return {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': tr('nav.home'), 'item': pageUrl('index', current) },
      { '@type': 'ListItem', 'position': 2, 'name': tr(`nav.${page}`), 'item': pageUrl(page, current) },
    ],
  }
}

function structuredData(page: PageId): string {
  const current = lang()
  const self = pageUrl(page, current)
  const description = tr(`meta.${page}.description`)

  if (page === 'index') {
    return jsonLd(
      { '@type': 'WebSite', 'name': NAME, 'url': self, 'description': description, 'inLanguage': current },
      {
        '@type': 'SoftwareSourceCode',
        'name': NAME,
        'description': description,
        'codeRepository': REPO,
        'programmingLanguage': 'TypeScript',
        'license': `${REPO}/blob/master/LICENSE`,
        'runtimePlatform': 'Browser',
      },
    )
  }
  if (page === 'inspector') {
    return jsonLd(
      {
        '@type': 'WebApplication',
        'name': tr(`meta.${page}.title`),
        'url': self,
        'description': description,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Any',
        'isAccessibleForFree': true,
        'inLanguage': current,
      },
      breadcrumb(page),
    )
  }
  const name = `@passcore/${PACKAGES[page]}`
  return jsonLd(
    {
      '@type': 'SoftwareSourceCode',
      name,
      'url': `https://www.npmjs.com/package/${name}`,
      'description': description,
      'codeRepository': `${REPO}/tree/master/packages/${PACKAGES[page]}`,
      'programmingLanguage': 'TypeScript',
      'license': `${REPO}/blob/master/LICENSE`,
      'runtimePlatform': 'Browser',
      'inLanguage': current,
    },
    breadcrumb(page),
  )
}

/** The head tags for search engines and link previews: canonical, hreflang, Open Graph, Twitter, theme colours, JSON-LD. */
export function seo(page: PageId): string {
  const current = lang()
  const canonical = pageUrl(page, current)
  const title = tr(`meta.${page}.title`)
  const description = tr(`meta.${page}.description`)
  const image = absolute(`${import.meta.env.BASE_URL}og-image.png`)
  const imageAlt = `${NAME}: ${tr('footer.tagline')}`
  const meta = (values: Record<string, string>) => `<meta${attrs(values)}>`

  const lines = [
    `<link${attrs({ rel: 'canonical', href: canonical })}>`,
    ...LANGS.map((code) => `<link${attrs({ rel: 'alternate', hreflang: code, href: pageUrl(page, code) })}>`),
    `<link${attrs({ rel: 'alternate', hreflang: 'x-default', href: pageUrl(page, 'en') })}>`,
    meta({ name: 'theme-color', content: THEME_COLORS.light, media: '(prefers-color-scheme: light)' }),
    meta({ name: 'theme-color', content: THEME_COLORS.dark, media: '(prefers-color-scheme: dark)' }),
    meta({ property: 'og:type', content: 'website' }),
    meta({ property: 'og:site_name', content: NAME }),
    meta({ property: 'og:title', content: title }),
    meta({ property: 'og:description', content: description }),
    meta({ property: 'og:url', content: canonical }),
    meta({ property: 'og:locale', content: OG_LOCALES[current] }),
    ...LANGS.filter((code) => code !== current).map((code) => meta({ property: 'og:locale:alternate', content: OG_LOCALES[code] })),
    meta({ property: 'og:image', content: image }),
    meta({ property: 'og:image:type', content: 'image/png' }),
    meta({ property: 'og:image:width', content: '1200' }),
    meta({ property: 'og:image:height', content: '630' }),
    meta({ property: 'og:image:alt', content: imageAlt }),
    meta({ name: 'twitter:card', content: 'summary_large_image' }),
    meta({ name: 'twitter:title', content: title }),
    meta({ name: 'twitter:description', content: description }),
    meta({ name: 'twitter:image', content: image }),
    meta({ name: 'twitter:image:alt', content: imageAlt }),
    structuredData(page),
  ]
  return lines.join('\n    ')
}
