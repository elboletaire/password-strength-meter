import { onScopeDispose, ref } from 'vue'
import { currentLang, onLanguageChange, type Lang } from '../site'

/** The language of the header, as a ref: a change updates the templates that use it. */
export function useLang() {
  const lang = ref<Lang>(currentLang())
  onScopeDispose(onLanguageChange((next) => {
    lang.value = next
  }))
  return lang
}
