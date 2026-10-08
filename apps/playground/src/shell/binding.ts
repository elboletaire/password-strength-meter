import { iconSvg } from '../common/icons.ts'
import { commandLine, demoSection, type Demo } from './components.ts'
import { REPO } from './layout.ts'
import { attrs, rich, tAttrs, text } from './t.ts'

export interface BindingPage {
  /** The page id, also the key prefix of its texts (`<id>.title`, `<id>.lead`). */
  id: 'jquery' | 'vanilla' | 'react' | 'vue' | 'svelte'
  /** npm name of the package. */
  pkg: string
  /** Folder of the package in the repository. */
  folder: string
  /** pnpm command that installs it. */
  install: string
  demos: Demo[]
}

/** A binding page: its header, the list of demos, and the demos. */
export function bindingMain(page: BindingPage): string {
  const toc = page.demos.map((demo, index) => `<li><a class="toc__link" href="#demo-${demo.id}"><span class="toc__index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${text('span', demo.title)}</a></li>`).join('\n            ')

  return `<div class="page-head">
        <div class="page-head__inner">
          <p class="eyebrow"><span class="eyebrow__pkg">${page.pkg}</span></p>
          ${text('h1', `${page.id}.title`, { class: 'page-title' })}
          ${rich('p', `${page.id}.lead`, { class: 'lead' })}
          <div class="page-head__actions">
            ${commandLine(page.install, { class: 'command command--large' })}
            <a class="btn btn--quiet" href="${REPO}/tree/master/${page.folder}#readme" rel="noopener">${text('span', 'binding.readme')}${iconSvg('external', 16)}</a>
          </div>
        </div>
      </div>

      <div class="binding">
        <aside class="binding__aside">
          <nav${attrs({ class: 'toc', ...tAttrs({ 'aria-label': 'toc.label' }) })}>
            ${text('p', 'toc.label', { 'class': 'toc__title', 'aria-hidden': 'true' })}
            <ol class="toc__list">
            ${toc}
            </ol>
          </nav>
        </aside>
        <div class="binding__content">
          <div class="note">
            ${iconSvg('globe', 20)}
            ${rich('p', 'binding.note')}
          </div>
          ${page.demos.map(demoSection).join('\n')}
        </div>
      </div>`
}
