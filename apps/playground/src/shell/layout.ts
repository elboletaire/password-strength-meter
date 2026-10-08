import { iconSvg, faviconHref, logoSvg } from '../common/icons.ts'
import { LANG_NAMES, LANG_STORAGE_KEY, LANGS, THEME_STORAGE_KEY } from '../common/langs.ts'
import { url, type PageId } from './routes.ts'
import { attrs, lang, tAttrs, text, tr } from './t.ts'

export type { PageId } from './routes.ts'

const NAV: Array<{ id: PageId, nav: string }> = [
  { id: 'index', nav: 'nav.home' },
  { id: 'inspector', nav: 'nav.inspector' },
  { id: 'jquery', nav: 'nav.jquery' },
  { id: 'vanilla', nav: 'nav.vanilla' },
  { id: 'react', nav: 'nav.react' },
  { id: 'vue', nav: 'nav.vue' },
  { id: 'svelte', nav: 'nav.svelte' },
]

export const REPO = 'https://github.com/elboletaire/password-strength-meter'

/** Runs before the first paint: the theme, so the page doesn't flash. The language is the page's own (`<html lang>`). */
const BOOT = `(function () {
  var theme = null
  try { theme = localStorage.getItem('${THEME_STORAGE_KEY}') } catch (e) {}
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme
})()`

/**
 * English pages only: a visitor who chose Spanish or Catalan before is sent to the same page in that language,
 * with its #hash, unless they come from a page of the site (then they are navigating, not arriving). The URL
 * always wins for everyone else, crawlers included: they have no stored choice, so they are never redirected.
 */
const redirectScript = (): string => `(function () {
  var lang = null
  try { lang = localStorage.getItem('${LANG_STORAGE_KEY}') } catch (e) {}
  if (lang !== 'es' && lang !== 'ca') return
  var base = ${JSON.stringify(import.meta.env.BASE_URL)}
  if (document.referrer.indexOf(location.origin + base) === 0) return
  if (location.pathname.indexOf(base) !== 0) return
  location.replace(base + lang + '/' + location.pathname.slice(base.length) + location.search + location.hash)
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
    <script>${BOOT}</script>${lang() === 'en' ? `\n    <script>${redirectScript()}</script>` : ''}${analytics()}`
}

function header(page: PageId): string {
  const nav = NAV.map(({ id, nav: key }) => `<li>${text('a', key, { 'href': url(id, lang()), 'class': 'site-nav__link', 'aria-current': id === page ? 'page' : undefined })}</li>`).join('\n          ')
  const current = lang()
  const langs = LANGS.map((code) => `<a${attrs({ 'class': 'lang-switch__button', 'href': url(page, code), 'hreflang': code, 'lang': code, 'data-lang': code, 'aria-label': LANG_NAMES[code], 'aria-current': code === current ? 'true' : undefined })}>${code.toUpperCase()}</a>`).join('')

  return `<a class="skip-link" href="#main" data-i18n="a11y.skip">${tr('a11y.skip')}</a>
    <header class="site-header">
      <div class="site-header__inner">
        <a class="brand" href="${url('index', lang())}">
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
          <button${attrs({ 'type': 'button', 'class': 'icon-button theme-toggle', 'data-theme-toggle': true, 'aria-label': tr('theme.toDark') })}>${iconSvg('moon', 20, 'icon theme-toggle__moon')}${iconSvg('sun', 20, 'icon theme-toggle__sun')}</button>
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
