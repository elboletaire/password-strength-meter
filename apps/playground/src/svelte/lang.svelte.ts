import { locales, meterLabel, t } from '../lib/i18n'
import { currentLang, onLanguageChange, type Lang } from '../lib/lang'

let active = $state<Lang>(currentLang())
onLanguageChange((next) => {
  active = next
})

/**
 * The language of the header, as a rune: reading `lang.current`, or calling `lang.t()`, in a template
 * or a $derived follows the switcher.
 */
export const lang = {
  get current(): Lang {
    return active
  },
  /** The site's `t`, tracked: the text is computed again on a language change. */
  t(key: string, params?: Record<string, unknown>): string {
    return active ? t(key, params) : key
  },
  /** The texts and the accessible name of the meter in the current language, for every demo. */
  get meterTexts() {
    return { translations: locales[active], locale: active, label: active ? meterLabel() : '' }
  },
}
