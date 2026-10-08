import { currentLang, onLanguageChange, type Lang } from '../site'

/** The language of the header, as a rune: reading `current` in a template or a $derived follows the switcher. */
export function langState(): { readonly current: Lang } {
  let lang = $state<Lang>(currentLang())
  onLanguageChange((next) => {
    lang = next
  })
  return {
    get current() {
      return lang
    },
  }
}
