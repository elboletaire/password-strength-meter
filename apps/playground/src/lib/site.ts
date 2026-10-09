import '../style.css'
import { LANG_STORAGE_KEY, PM_STORAGE_KEY, THEME_STORAGE_KEY } from '../common/langs'
import { t } from './i18n'
import { currentLang } from './lang'
import { initReveal } from './reveal'

/**
 * What every page shares: the language switcher, the theme toggle,
 * the show/hide buttons, the copy buttons and the tabs. Each page's entry imports this module first.
 */

const root = document.documentElement

/** Says something to screen reader users, through the polite live region of the footer. */
export function announce(message: string): void {
  const region = document.getElementById('announcer')
  if (region) {
    region.textContent = ''
    // a fresh text node, so the same message is announced again
    window.setTimeout(() => {
      region.textContent = message
    }, 50)
  }
}

// language: the switcher is a set of links to the same page in the other languages
const langLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-lang]'))

/** The links keep the `#hash` of the page, so `#demo-checklist` survives a language switch. */
function syncLangLinks(): void {
  for (const link of langLinks) {
    link.hash = location.hash
  }
}

syncLangLinks()
window.addEventListener('hashchange', syncLangLinks)

langLinks.forEach((link) => {
  link.addEventListener('click', () => {
    syncLangLinks()
    // the last explicit choice: English pages send the visitor to it (see the head script in src/shell/layout.ts)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, link.dataset.lang ?? currentLang())
    }
    catch {
      // not remembered, but the link still works
    }
  })
})

// theme: follows the system until the visitor picks one
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function isDark(): boolean {
  const chosen = root.dataset.theme
  return chosen ? chosen === 'dark' : darkQuery.matches
}

const themeListeners = new Set<() => void>()

/** Calls `listener` when the theme changes, by the toggle or by the system. */
export function onThemeChange(listener: () => void): void {
  themeListeners.add(listener)
}

function updateThemeToggle(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-label', t(isDark() ? 'theme.toLight' : 'theme.toDark'))
  })
}

document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const theme = isDark() ? 'light' : 'dark'
    root.dataset.theme = theme
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
    catch {
      // not remembered
    }
    updateThemeToggle()
    themeListeners.forEach((listener) => listener())
  })
})

darkQuery.addEventListener('change', () => {
  updateThemeToggle()
  themeListeners.forEach((listener) => listener())
})

// copy buttons: the code of their panel, or the command of their line
document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy]')
  if (!button) {
    return
  }
  const source = button.closest('.code')?.querySelector('pre') ?? button.closest('.command')?.querySelector('.command__text')
  const label = button.querySelector('.copy__label')
  void navigator.clipboard.writeText(source?.textContent ?? '').then(() => {
    if (label) {
      label.textContent = t('code.copied')
      button.classList.add('copy--done')
      window.setTimeout(() => {
        label.textContent = t('code.copy')
        button.classList.remove('copy--done')
      }, 1800)
    }
    announce(t('a11y.copied'))
  }, () => {
    announce(t('a11y.copyFailed'))
  })
})

// tabs (the install panel): arrows move between tabs, as in the ARIA tabs pattern
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((list) => {
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
  const select = (tab: HTMLButtonElement, focus: boolean): void => {
    for (const other of tabs) {
      const selected = other === tab
      other.setAttribute('aria-selected', String(selected))
      other.tabIndex = selected ? 0 : -1
      const panel = document.getElementById(other.getAttribute('aria-controls') ?? '')
      if (panel) {
        panel.hidden = !selected
      }
    }
    if (focus) {
      tab.focus()
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab, false))
    tab.addEventListener('keydown', (event) => {
      const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
      const target = moves[event.key]
      if (target !== undefined) {
        event.preventDefault()
        select(tabs[(target + tabs.length) % tabs.length] as HTMLButtonElement, true)
      }
    })
  })
})

// package manager of the install commands, remembered
const VERBS: Record<string, string> = { pnpm: 'pnpm add', npm: 'npm install', yarn: 'yarn add', bun: 'bun add' }

function setPackageManager(manager: string): void {
  const verb = VERBS[manager]
  if (!verb) {
    return
  }
  document.querySelectorAll<HTMLElement>('[data-install]').forEach((line) => {
    const text = line.querySelector('.command__text')
    if (text) {
      text.textContent = `${verb} ${line.dataset.install ?? ''}`
    }
  })
  document.querySelectorAll<HTMLInputElement>('input[name="pm"]').forEach((radio) => {
    radio.checked = radio.value === manager
  })
}

document.querySelectorAll<HTMLInputElement>('input[name="pm"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    setPackageManager(radio.value)
    try {
      localStorage.setItem(PM_STORAGE_KEY, radio.value)
    }
    catch {
      // not remembered
    }
  })
})

try {
  setPackageManager(localStorage.getItem(PM_STORAGE_KEY) ?? 'pnpm')
}
catch {
  // storage disabled: pnpm, as rendered
}

// the list of demos marks the demo being read
const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc__link'))
if (tocLinks.length && 'IntersectionObserver' in window) {
  const visible = new Set<string>()
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        visible.add(entry.target.id)
      }
      else {
        visible.delete(entry.target.id)
      }
    }
    const first = tocLinks.find((link) => visible.has(link.hash.slice(1)))
    if (first) {
      tocLinks.forEach((link) => link.toggleAttribute('aria-current', link === first))
      first.setAttribute('aria-current', 'true')
    }
  }, { rootMargin: '-20% 0px -55% 0px' })
  tocLinks.forEach((link) => {
    const section = document.getElementById(link.hash.slice(1))
    if (section) {
      observer.observe(section)
    }
  })
}

initReveal()

updateThemeToggle()
