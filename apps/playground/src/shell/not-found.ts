import { escapeHtml } from '../common/escape.ts'
import { faviconHref, logoSvg } from '../common/icons.ts'
import { LANG_NAMES, LANGS, THEME_STORAGE_KEY, type Lang } from '../common/langs.ts'
import { url } from './routes.ts'
import { attrs, tr, withLang } from './t.ts'

const strings = (code: Lang) => withLang(code, () => ({ title: tr('notFound.title'), message: tr('notFound.message'), back: tr('notFound.back') }))

/**
 * The 404 page. It is served at any depth (`/es/nope/deeper`), so every URL in it is absolute. The text is in
 * English, and a small script swaps it for the language in the URL (`/es/`, `/ca/`) from the strings embedded
 * below: no crawler indexes this page (`noindex`, no canonical, no hreflang).
 */
export function notFoundPage(): string {
  const texts = Object.fromEntries(LANGS.map((code) => [code, strings(code)]))
  const english = strings('en')
  const title = escapeHtml(english.title)
  const base = import.meta.env.BASE_URL
  const swap = `(function () {
  var texts = ${JSON.stringify(texts).replace(/</g, '\\u003c')}
  var path = location.pathname
  var base = ${JSON.stringify(base)}
  var first = path.indexOf(base) === 0 ? path.slice(base.length).split('/')[0] : ''
  var lang = Object.prototype.hasOwnProperty.call(texts, first) ? first : 'en'
  if (lang === 'en') return
  var root = document.documentElement
  var set = function (selector, value) { document.querySelector(selector).textContent = value }
  root.lang = lang
  document.title = texts[lang].title
  set('h1', texts[lang].title)
  set('.not-found__message', texts[lang].message)
  var back = document.querySelector('.not-found__back')
  back.textContent = texts[lang].back
  back.href = base + lang + '/'
})()`

  const links = LANGS.map((code) => `<a${attrs({ href: url('index', code), hreflang: code, lang: code })}>${LANG_NAMES[code]}</a>`).join(' · ')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="robots" content="noindex">
    <title>${title}</title>
    <link rel="icon" href="${faviconHref()}">
    <style>
      .not-found { display: grid; justify-items: center; gap: 1rem; min-height: 100vh; align-content: center; padding: 2rem; text-align: center }
      .not-found p { margin: 0; color: var(--ink-2) }
      .not-found__langs { font-size: .9rem }
    </style>
    <script>(function () {
  var theme = null
  try { theme = localStorage.getItem('${THEME_STORAGE_KEY}') } catch (e) {}
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme
})()</script>
  </head>
  <body>
    <main class="not-found">
      ${logoSvg(56)}
      <h1>${title}</h1>
      <p class="not-found__message">${escapeHtml(english.message)}</p>
      <a class="btn btn--primary not-found__back" href="${url('index', 'en')}">${escapeHtml(english.back)}</a>
      <p class="not-found__langs">${links}</p>
    </main>
    <script>${swap}</script>
  </body>
</html>`
}
