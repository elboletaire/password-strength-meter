import { iconSvg, faviconHref, logoSvg } from '../common/icons.ts'
import { LANG_NAMES, LANG_STORAGE_KEY, LANGS, THEME_STORAGE_KEY } from '../common/langs.ts'
import { url, type PageId } from './routes.ts'
import { attrs, en, tAttrs, text } from './t.ts'

export type { PageId } from './routes.ts'

export const PAGES: Array<{ id: PageId, href: string, nav: string }> = [
  { id: 'index', href: url('index'), nav: 'nav.home' },
  { id: 'inspector', href: url('inspector'), nav: 'nav.inspector' },
  { id: 'jquery', href: url('jquery'), nav: 'nav.jquery' },
  { id: 'vanilla', href: url('vanilla'), nav: 'nav.vanilla' },
  { id: 'react', href: url('react'), nav: 'nav.react' },
  { id: 'vue', href: url('vue'), nav: 'nav.vue' },
  { id: 'svelte', href: url('svelte'), nav: 'nav.svelte' },
]

export const REPO = 'https://github.com/elboletaire/password-strength-meter'

/**
 * Runs before the first paint: the language (stored, or the browser's when it is one of ours) and the theme,
 * so the page doesn't flash. Pages in Spanish or Catalan stay invisible until their texts are in place
 * (`i18n-pending`, removed by src/lib/site.ts; the stylesheet shows the page anyway after a moment).
 */
const BOOT = `(function () {
  var root = document.documentElement, langs = ${JSON.stringify(LANGS)}, lang = null, theme = null
  try { lang = localStorage.getItem('${LANG_STORAGE_KEY}'); theme = localStorage.getItem('${THEME_STORAGE_KEY}') } catch (e) {}
  if (langs.indexOf(lang) < 0) {
    lang = 'en'
    var wanted = navigator.languages || [navigator.language]
    for (var i = 0; i < wanted.length; i++) {
      var code = String(wanted[i] || '').slice(0, 2).toLowerCase()
      if (langs.indexOf(code) >= 0) { lang = code; break }
    }
  }
  root.lang = lang
  if (lang !== 'en') root.classList.add('i18n-pending')
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme
})()`

const GA_ID = 'G-STPVDBEE54'

/** Google Analytics, in production builds only, so `pnpm dev` doesn't count as a visit. */
const analytics = () => process.env.NODE_ENV === 'production'
  ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}')</script>`
  : ''

export function head(page: PageId): string {
  return `<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    ${text('title', `meta.${page}.title`)}
    <meta${attrs({ name: 'description', ...tAttrs({ content: `meta.${page}.description` }) })}>
    <link rel="icon" href="${faviconHref()}">
    <script>${BOOT}</script>${analytics()}`
}

function header(page: PageId): string {
  const nav = PAGES.map(({ id, href, nav: key }) => `<li>${text('a', key, { 'href': href, 'class': 'site-nav__link', 'aria-current': id === page ? 'page' : undefined })}</li>`).join('\n          ')
  const langs = LANGS.map((lang) => `<button${attrs({ 'type': 'button', 'class': 'lang-switch__button', 'data-lang': lang, lang, 'aria-label': LANG_NAMES[lang], 'aria-pressed': lang === 'en' ? 'true' : 'false' })}>${lang.toUpperCase()}</button>`).join('')

  return `<a class="skip-link" href="#main" data-i18n="a11y.skip">${en('a11y.skip')}</a>
    <header class="site-header">
      <div class="site-header__inner">
        <a class="brand" href="${url('index')}">
          ${logoSvg(30)}
          <span class="brand__name">passcore</span>
          ${text('span', 'brand.tag', { class: 'brand__tag' })}
        </a>
        <nav${attrs({ class: 'site-nav', ...tAttrs({ 'aria-label': 'nav.label' }) })}>
          <ul class="site-nav__list">
          ${nav}
          </ul>
        </nav>
        <div class="site-tools">
          <div${attrs({ class: 'lang-switch', role: 'group', ...tAttrs({ 'aria-label': 'lang.label' }) })}>${langs}</div>
          <button${attrs({ 'type': 'button', 'class': 'icon-button theme-toggle', 'data-theme-toggle': true, 'aria-label': en('theme.toDark') })}>${iconSvg('moon', 20, 'icon theme-toggle__moon')}${iconSvg('sun', 20, 'icon theme-toggle__sun')}</button>
        </div>
      </div>
    </header>`
}

function footer(): string {
  return `<footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__brand">
          ${logoSvg(28)}
          <div>
            <p class="site-footer__name">passcore</p>
            ${text('p', 'footer.tagline', { class: 'site-footer__tagline' })}
          </div>
        </div>
        <p class="site-footer__privacy">${iconSvg('lock', 18)}${text('span', 'footer.privacy')}</p>
        <ul class="site-footer__links">
          <li><a href="${REPO}" rel="noopener">${text('span', 'footer.source')}${iconSvg('external', 14)}</a></li>
          <li><a href="${REPO}/tree/master/packages" rel="noopener">${text('span', 'footer.packages')}${iconSvg('external', 14)}</a></li>
          <li><a href="${REPO}/blob/master/LICENSE" rel="noopener">${text('span', 'footer.license')}${iconSvg('external', 14)}</a></li>
        </ul>
        ${text('p', 'footer.credits', { class: 'site-footer__credits' })}
      </div>
    </footer>
    <div id="announcer" class="visually-hidden" role="status" aria-live="polite"></div>`
}

/** The whole body: skip link, header, the page's main content and the footer. */
export function body(page: PageId, main: string): string {
  return `${header(page)}
    <main id="main" class="main main--${page}" tabindex="-1">
${main}
    </main>
    ${footer()}`
}
