// Post-build checks of the pre-rendered site (dist/client). Node only, no dependencies: Node 22.18+ strips the
// types by itself, and the `check` script passes the flag for the versions that still need it.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist/client')

const BASE = '/password-strength-meter/'
const ORIGIN = (process.env.PLAYGROUND_SITE_ORIGIN || 'https://elboletaire.github.io').replace(/\/+$/, '')
const PAGES = ['index', 'inspector', 'jquery', 'vanilla', 'react', 'vue', 'svelte']
const LANGS = ['en', 'es', 'ca']

const errors: string[] = []
const fail = (where: string, message: string): void => {
  errors.push(`${where}: ${message}`)
}

type Locale = { meta: Record<string, { title: string, description: string }> }

const locale = (lang: string): Locale => JSON.parse(readFileSync(join(root, `src/locales/site.${lang}.json`), 'utf8')) as Locale
const titleOf = (lang: string, page: string): string => locale(lang).meta[page]?.title ?? ''
const descriptionOf = (lang: string, page: string): string => locale(lang).meta[page]?.description ?? ''

const pagePath = (page: string, lang: string): string => `${lang === 'en' ? '' : `${lang}/`}${page === 'index' ? '' : `${page}/`}`
const pageUrl = (page: string, lang: string): string => `${ORIGIN}${BASE}${pagePath(page, lang)}`

const decode = (text: string): string => text
  .replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

/** The attributes of every `<tag ...>` in the document, as objects. */
function tags(html: string, name: string): Record<string, string>[] {
  const found: Record<string, string>[] = []
  for (const match of html.matchAll(new RegExp(`<${name}\\s([^>]*)>`, 'g'))) {
    const attrs: Record<string, string> = {}
    for (const attr of (match[1] ?? '').matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) {
      attrs[attr[1] ?? ''] = decode(attr[2] ?? '')
    }
    found.push(attrs)
  }
  return found
}

const links = (html: string, rel: string): Record<string, string>[] => tags(html, 'link').filter((link) => link.rel === rel)
const metas = (html: string, key: 'name' | 'property', value: string): string[] => tags(html, 'meta')
  .filter((meta) => meta[key] === value)
  .map((meta) => meta.content ?? '')

const read = (file: string): string => readFileSync(join(dist, file), 'utf8')

/** A URL under the base, resolved to the file GitHub Pages would serve for it. */
function resolves(path: string): boolean {
  const clean = decodeURIComponent(path.slice(BASE.length).split(/[?#]/)[0] ?? '')
  const file = join(dist, clean)
  if (!file.startsWith(dist)) {
    return false
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    return existsSync(join(file, 'index.html'))
  }
  return existsSync(file)
}

const files = [
  '404.html',
  'sitemap.xml',
  ...LANGS.flatMap((lang) => PAGES.map((page) => `${pagePath(page, lang)}index.html`)),
]
for (const file of files) {
  if (!existsSync(join(dist, file))) {
    fail(file, 'missing')
  }
}

function checkHrefs(file: string, html: string): void {
  // inline scripts and the code samples show URLs as text: only real attributes count
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  for (const match of body.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const value = decode(match[1] ?? '')
    if (value.startsWith(BASE)) {
      if (!resolves(value)) {
        fail(file, `${value} does not resolve to a file`)
      }
    }
    else if (/^\.\/[^"#?]*\.html/.test(value)) {
      fail(file, `relative link left: ${value}`)
    }
  }
}

for (const lang of LANGS) {
  for (const page of PAGES) {
    const file = `${pagePath(page, lang)}index.html`
    if (!existsSync(join(dist, file))) {
      continue
    }
    const html = read(file)
    const self = pageUrl(page, lang)

    if (!new RegExp(`<html lang="${lang}"`).test(html)) {
      fail(file, `<html lang> is not ${lang}`)
    }

    const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? '').trim()
    if (!title) {
      fail(file, 'empty <title>')
    }
    else if (title !== titleOf(lang, page)) {
      fail(file, `title "${title}" is not the ${lang} one ("${titleOf(lang, page)}")`)
    }
    // some titles are the same in every language (`React · Passcore`): the description tells the languages apart
    const [description] = metas(html, 'name', 'description')
    if (!description?.trim()) {
      fail(file, 'empty description')
    }
    else if (description !== descriptionOf(lang, page)) {
      fail(file, `description is not the ${lang} one`)
    }

    for (const image of [...metas(html, 'property', 'og:image'), ...metas(html, 'name', 'twitter:image')]) {
      if (!image.startsWith(`${ORIGIN}${BASE}`) || !resolves(image.slice(ORIGIN.length))) {
        fail(file, `${image} is not a file of the site`)
      }
    }

    const canonical = links(html, 'canonical')
    if (canonical.length !== 1 || canonical[0]?.href !== self) {
      fail(file, `canonical is ${canonical.map((link) => link.href).join(', ') || 'missing'}, expected ${self}`)
    }

    const alternates = links(html, 'alternate').filter((link) => link.hreflang)
    for (const hreflang of [...LANGS, 'x-default']) {
      const expected = pageUrl(page, hreflang === 'x-default' ? 'en' : hreflang)
      const found = alternates.filter((link) => link.hreflang === hreflang)
      if (found.length !== 1 || found[0]?.href !== expected) {
        fail(file, `hreflang ${hreflang} is ${found.map((link) => link.href).join(', ') || 'missing'}, expected ${expected}`)
      }
    }
    if (alternates.length !== 4) {
      fail(file, `${alternates.length} hreflang links, expected 4`)
    }

    const ogUrl = metas(html, 'property', 'og:url')
    if (ogUrl.length !== 1 || ogUrl[0] !== self) {
      fail(file, `og:url is ${ogUrl.join(', ') || 'missing'}, expected ${self}`)
    }

    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    if (ld.length === 0) {
      fail(file, 'no JSON-LD')
    }
    for (const block of ld) {
      try {
        JSON.parse(block[1] ?? '')
      }
      catch (error) {
        fail(file, `invalid JSON-LD: ${(error as Error).message}`)
      }
    }

    checkHrefs(file, html)
  }
}

if (existsSync(join(dist, '404.html'))) {
  const notFound = read('404.html')
  checkHrefs('404.html', notFound)
  if (!/<meta name="robots" content="noindex">/.test(notFound)) {
    fail('404.html', 'not noindex')
  }
  // the old `<page>.html` URLs are redirected by this page
  if (!notFound.includes('.html')) {
    fail('404.html', 'does not redirect the former *.html URLs')
  }
}

if (existsSync(join(dist, 'sitemap.xml'))) {
  const sitemap = read('sitemap.xml')
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => decode(match[1] ?? ''))
  const expected = LANGS.flatMap((lang) => PAGES.map((page) => pageUrl(page, lang)))
  if (locs.length !== expected.length) {
    fail('sitemap.xml', `${locs.length} <loc>, expected ${expected.length}`)
  }
  for (const loc of expected) {
    if (!locs.includes(loc)) {
      fail('sitemap.xml', `${loc} is missing`)
    }
  }
  for (const loc of locs) {
    if (!expected.includes(loc)) {
      fail('sitemap.xml', `${loc} is not a page`)
    }
  }
  if (new Set(locs).size !== locs.length) {
    fail('sitemap.xml', 'duplicated <loc>')
  }
  // every <url> lists the alternates of its page, like the hreflang links of the page itself
  for (const block of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = decode(block[1]?.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? '')
    const page = PAGES.find((id) => LANGS.some((lang) => pageUrl(id, lang) === loc))
    if (!page) {
      continue
    }
    const alternates = tags(block[1] ?? '', 'xhtml:link')
    for (const hreflang of [...LANGS, 'x-default']) {
      const expected = pageUrl(page, hreflang === 'x-default' ? 'en' : hreflang)
      if (alternates.filter((link) => link.hreflang === hreflang && link.href === expected).length !== 1) {
        fail('sitemap.xml', `${loc}: hreflang ${hreflang} is not ${expected}`)
      }
    }
    if (alternates.length !== LANGS.length + 1) {
      fail('sitemap.xml', `${loc}: ${alternates.length} alternates, expected ${LANGS.length + 1}`)
    }
  }
}

// any stray file the pages link to is covered above; this only guards against an empty build
if (!existsSync(dist) || readdirSync(dist).length === 0) {
  fail('dist/client', 'empty or missing: run the build first')
}

if (errors.length > 0) {
  console.error(`check-site: ${errors.length} problem(s)\n${errors.map((error) => `  - ${error}`).join('\n')}`)
  process.exit(1)
}
console.log(`check-site: ${files.length} files ok`)
