import { computed, onScopeDispose, ref } from 'vue'
import { locales, meterLabel, t } from '../lib/i18n'
import { currentLang, onLanguageChange, type Lang } from '../lib/lang'

/** The language of the header, as a ref: a change updates the templates that use it. */
export function useLang() {
  const lang = ref<Lang>(currentLang())
  onScopeDispose(onLanguageChange((next) => {
    lang.value = next
  }))
  return lang
}

/** The site's `t`, renewed on every language change so the templates that call it render again. */
export function useT() {
  const lang = useLang()
  const tr = computed(() => {
    const current = lang.value
    return (key: string, params?: Record<string, unknown>): string => (current ? t(key, params) : key)
  })
  return { lang, t: tr }
}

/** The texts and the accessible name of the meter in the current language, for every demo. */
export function useMeterTexts() {
  const lang = useLang()
  return computed(() => ({ translations: locales[lang.value], locale: lang.value, label: meterLabel() }))
}
