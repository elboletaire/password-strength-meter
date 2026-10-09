import '../../src/lib/site'
import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'
import type { Result } from '@passcore/core'
import type { PasswordOptions } from '@passcore/jquery'
import { REQUIREMENT_RULES, requirementState, requirementsSummary, setLiveText } from '../../src/lib/checklist'
import { locales, meterLabel, t, translate } from '../../src/lib/i18n'
import { currentLang } from '../../src/lib/lang'
import { initStudio } from '../../src/lib/studio'

// respect the reduced motion preference: jQuery's slides complete at once
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $.fx.off = true
}

/** The bundled texts of the page's language, for the demos that are not about translations. */
const texts = (): PasswordOptions => ({ translations: locales[currentLang()], locale: currentLang() })

/** The texts are read when a meter is created: the page's language never changes, so that is once. */
function mount(selector: string, options: () => PasswordOptions, closest = 'div'): JQuery<HTMLElement> {
  const input = $<HTMLElement>(selector)
  input.password({ closestSelector: closest, label: meterLabel(), ...options() })
  return input
}

// default: hidden until the field gets focus
mount('#default-password', () => texts())

// requirements checklist: every rule of `result.rules`, neutral until something is typed
const $summary = $('#checklist-summary')
function check(result: Result, typed: boolean): void {
  for (const rule of result.rules) {
    $(`#checklist [data-rule="${rule.id}"]`).attr('data-state', requirementState(typed, rule.passed))
  }
  // a live region: only touch it when the count changes
  setLiveText($summary[0] as HTMLElement, requirementsSummary(result.rules, typed))
}

mount('#signup-password', () => ({ ...texts(), userInputs: ['#signup-username'], rules: REQUIREMENT_RULES, animate: false }))
  .on('password.score', (event, _percent: number, result: Result) => {
    check(result, String($(event.target).val() ?? '') !== '')
  })

// the plugin reads the username when the password changes: update on its changes too
$('#signup-username').on('input', () => $('#signup-password').trigger('input'))

// the summary is written by this script, in the page's language: render it now
$('#signup-password').trigger('input')

mount('#always-password', () => ({ ...texts(), animate: false, showPercent: true }))

mount('#linked-password', () => ({ ...texts(), userInputs: ['#username'], showPercent: true }))

// translations: the bundled files
mount('#translations-password', () => ({
  translations: locales[currentLang()],
  locale: currentLang(),
  animate: false,
  showPercent: true,
}))

// i18next: the playground's instance, in the `passcore` namespace
mount('#i18next-password', () => ({ translate, animate: false, showPercent: true }))

// events: the Send button wakes up above 75%
const sendButton = $('#send')

mount('#events-password', () => ({ ...texts(), animate: false }))
  .on('password.score', (_event, percent: number) => {
    sendButton.prop('disabled', percent <= 75)
    $('#events-score').text(`${percent}%`)
  })

$('#events-form').on('submit', (event) => {
  event.preventDefault()
  $('#send-status').text(t('events.sent'))
})

// input group: the meter goes below the whole group
mount('#group-password', () => ({ ...texts(), animate: false }), '.form-group')

// theming: the sample meters and the typed password use the same custom properties
initStudio()
mount('#theme-password', () => ({ ...texts(), animate: false, showPercent: true }))
