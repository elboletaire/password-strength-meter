import '../style.css'
import { isLang, PM_STORAGE_KEY, THEME_STORAGE_KEY } from '../common/langs'
import { applyTranslations, t } from './i18n'
import { currentLang, onLanguageChange, setLang } from './lang'
import { initReveal } from './reveal'

/**
 * What every page shares: the texts in the chosen language, the language switcher, the theme toggle,
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

// language
function markLangButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === currentLang()))
  })
}

document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((button) => {
  button.addEventListener('click', () => {
    if (isLang(button.dataset.lang)) {
      setLang(button.dataset.lang)
    }
  })
})

onLanguageChange(() => {
  applyTranslations()
  markLangButtons()
  updateThemeToggle()
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
      label.removeAttribute('data-i18n')
      button.classList.add('copy--done')
      window.setTimeout(() => {
        label.textContent = t('code.copy')
        label.setAttribute('data-i18n', 'code.copy')
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

// the texts of the chosen language, then show the page (see the boot script in src/shell/layout.ts)
if (currentLang() !== 'en') {
  applyTranslations()
}
root.lang = currentLang()
markLangButtons()
updateThemeToggle()
root.classList.remove('i18n-pending')
