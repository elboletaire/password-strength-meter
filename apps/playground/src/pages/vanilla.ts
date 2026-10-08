import '../lib/site'
import '@passcore/vanilla/styles.css'
import { createPasswordMeter, type PasswordMeter, type VanillaOptions } from '@passcore/vanilla'
import '@passcore/vanilla/element'
import type { PasswordMeterElement } from '@passcore/vanilla/element'
import ca from '@passcore/vanilla/locales/ca.json'
import en from '@passcore/vanilla/locales/en.json'
import es from '@passcore/vanilla/locales/es.json'
import type { MeterResult } from '@passcore/core'
import { REQUIREMENT_RULES, requirementState, requirementsSummary, setLiveText } from '../lib/checklist'
import { meterLabel, t, translate } from '../lib/i18n'
import { currentLang, onLanguageChange } from '../lib/lang'
import { initStudio } from '../lib/studio'

const bundled = { en, es, ca }

/** The texts and the accessible name in the current language, for every demo. */
const texts = (): VanillaOptions => ({ translations: bundled[currentLang()], locale: currentLang(), label: meterLabel() })

/**
 * The options are read once, so the demos are created through this helper, which creates them again
 * when the language changes. The i18next demo doesn't need it: it refreshes instead (see below).
 */
function mount(input: string | HTMLInputElement, options: () => VanillaOptions): () => PasswordMeter {
  let meter: PasswordMeter = createPasswordMeter(input, options())
  onLanguageChange(() => {
    meter.destroy()
    meter = createPasswordMeter(input, options())
  })
  return () => meter
}

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing #${id} in the page`)
  }
  return element as T
}

// default: hidden until the field gets focus
mount('#default-password', () => ({ ...texts(), hideUntilFocus: true }))

// requirements checklist: every rule of `result.rules`, neutral until something is typed
const signupInput = byId<HTMLInputElement>('signup-password')
const summary = byId('checklist-summary')

function check(result: MeterResult): void {
  const typed = signupInput.value !== ''
  for (const rule of result.rules) {
    const item = document.querySelector<HTMLElement>(`#checklist [data-rule="${rule.id}"]`)
    if (item) {
      item.dataset.state = requirementState(typed, rule.passed)
    }
  }
  // a live region: only touch it when the count changes
  setLiveText(summary, requirementsSummary(result.rules, typed))
}

const signupMeter = mount(signupInput, () => ({
  ...texts(),
  userInputs: ['#signup-username'],
  rules: REQUIREMENT_RULES,
  onScore: (_percent, result) => check(result),
}))

// the username is read on each update: refresh when it changes
byId('signup-username').addEventListener('input', () => signupMeter().refresh())

// callbacks fire on updates, not on creation: render the first result, and the one of every new meter
check(signupMeter().result)
onLanguageChange(() => check(signupMeter().result))

mount('#always-password', () => ({ ...texts(), showPercent: true }))

mount('#linked-password', () => ({ ...texts(), userInputs: ['#username'], showPercent: true }))

mount('#translations-password', () => ({
  translations: bundled[currentLang()],
  locale: currentLang(),
  label: meterLabel(),
  showPercent: true,
}))

// i18next: the texts are translated on every update, so a refresh is enough. The accessible name is
// an option, read once: the playground renames the meter itself, so this demo shows refresh() alone.
const i18nMeter = createPasswordMeter('#i18next-password', { translate, label: meterLabel(), showPercent: true })
onLanguageChange(() => {
  i18nMeter.refresh()
  document.querySelector('#i18next-password ~ .pass-wrapper .pass-meter')?.setAttribute('aria-label', meterLabel())
})

// events: the callback and the DOM event both see every update
const sendButton = byId<HTMLButtonElement>('send')
const eventsInput = byId<HTMLInputElement>('events-password')

mount(eventsInput, () => ({
  ...texts(),
  onScore: (percent) => {
    sendButton.disabled = percent <= 75
  },
}))

eventsInput.addEventListener('passcore:score', (event) => {
  byId('events-score').textContent = `${(event as CustomEvent<{ percent: number }>).detail.percent}%`
})

const sendStatus = byId('send-status')
byId('events-form').addEventListener('submit', (event) => {
  event.preventDefault()
  sendStatus.textContent = t('events.sent')
})
onLanguageChange(() => {
  if (sendStatus.textContent) {
    sendStatus.textContent = t('events.sent')
  }
})

// a custom container: below the whole input group
mount('#group-password', () => ({ ...texts(), container: '#group-field' }))

// the custom element: attributes in the markup; the language as attributes and the texts as options
const elementMeter = document.querySelector<PasswordMeterElement>('password-meter[for="element-password"]')
const optionsMeter = document.querySelector<PasswordMeterElement>('password-meter[for="options-password"]')
if (!elementMeter || !optionsMeter) {
  throw new Error('Missing the password-meter elements of the page')
}

function localizeElements(): void {
  elementMeter?.setAttribute('locale', currentLang())
  elementMeter?.setAttribute('label', meterLabel())
  if (elementMeter) {
    elementMeter.options = { translations: bundled[currentLang()] }
  }
  // options from script: merged over the attributes, so show-percent still applies
  if (optionsMeter) {
    optionsMeter.options = {
      translations: bundled[currentLang()],
      locale: currentLang(),
      label: meterLabel(),
      rules: { numbers: 1, symbols: 1 },
    }
  }
}

localizeElements()
onLanguageChange(localizeElements)

// theming: the sample meters and the typed password use the same custom properties
initStudio()
mount('#theme-password', () => ({ ...texts(), showPercent: true }))
