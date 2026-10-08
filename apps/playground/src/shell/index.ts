import { bindingMain } from './binding.ts'
import { body, head, PAGES, type PageId } from './layout.ts'
import { homeMain } from './pages/home.ts'
import { inspectorMain } from './pages/inspector.ts'
import { jqueryPage } from './pages/jquery.ts'
import { reactPage } from './pages/react.ts'
import { sveltePage } from './pages/svelte.ts'
import { vanillaPage } from './pages/vanilla.ts'
import { vuePage } from './pages/vue.ts'

/**
 * Renders the pages at build time (and on every request of the dev server): each HTML file is a skeleton
 * with `<!--@head-->` and `<!--@body-->`, filled in here, so the header, the footer and the demos are
 * written once and the page arrives complete, without layout shifts.
 */

const MAINS: Record<PageId, () => string> = {
  index: homeMain,
  inspector: inspectorMain,
  jquery: () => bindingMain(jqueryPage),
  vanilla: () => bindingMain(vanillaPage),
  react: () => bindingMain(reactPage),
  vue: () => bindingMain(vuePage),
  svelte: () => bindingMain(sveltePage),
}

export const isPageId = (value: string): value is PageId => PAGES.some(({ id }) => id === value)

export function renderPage(page: PageId, html: string): string {
  return html
    .replace('<!--@head-->', () => head(page))
    .replace('<!--@body-->', () => body(page, MAINS[page]()))
}
