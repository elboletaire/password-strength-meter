import '../lib/site'
import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'
import type { PasswordOptions } from '@passcore/jquery'
import { locales, meterLabel, t, translate } from '../lib/i18n'
import { currentLang, onLanguageChange } from '../lib/lang'
import { initStudio } from '../lib/studio'

// respect the reduced motion preference: jQuery's slides complete at once
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $.fx.off = true
}

/**
 * The plugin reads its options once and has no way to refresh or destroy a meter, so each demo is
 * mounted through this helper, which mounts it again in the new language. Every demo gets the texts
 * of the current language; the plugin has no option for the accessible name of the meter, so the
 * helper sets it on the markup the plugin rendered.
 */
interface Mount {
  input: JQuery<HTMLElement>
  closest: string
  options: () => PasswordOptions
}

const mounts: Mount[] = []

/** The bundled texts of the current language, for the demos that are not about translations. */
const texts = (): PasswordOptions => ({ translations: locales[currentLang()], locale: currentLang() })

function attach(mount: Mount): void {
  mount.input.password({ closestSelector: mount.closest, ...mount.options() })
  const container = mount.input.closest(mount.closest)
  const wrapper = container.children('.pass-wrapper')
  wrapper.children('.pass-meter').attr('aria-label', meterLabel())
  // mounted again over a typed password: keep the meter in sight
  if (String(mount.input.val() ?? '') !== '' && wrapper.css('display') === 'none') {
    wrapper.show()
    container.addClass('pass-strength-visible')
  }
}

function detach({ input, closest }: Mount): void {
  const container = input.closest(closest)
  input.off('keyup focus blur')
  container.children('.pass-wrapper').remove()
  container.removeClass('pass-strength-visible')
  // the plugin appends its text id on every mount: take it out again
  const own = `${input.attr('id') ?? ''}-strength`
  const rest = (input.attr('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== own)
  if (rest.length) {
    input.attr('aria-describedby', rest.join(' '))
  }
  else {
    input.removeAttr('aria-describedby')
  }
}

function mount(selector: string, options: () => PasswordOptions, closest = 'div'): JQuery<HTMLElement> {
  const entry: Mount = { input: $<HTMLElement>(selector), closest, options }
  mounts.push(entry)
  attach(entry)
  return entry.input
}

onLanguageChange(() => {
  for (const entry of mounts) {
    detach(entry)
    attach(entry)
  }
})

// default: hidden until the field gets focus
mount('#default-password', () => texts())

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

onLanguageChange(() => {
  if ($('#send-status').text()) {
    $('#send-status').text(t('events.sent'))
  }
})

// input group: the meter goes below the whole group
mount('#group-password', () => ({ ...texts(), animate: false }), '.form-group')

// theming: the sample meters and the typed password use the same custom properties
initStudio()
mount('#theme-password', () => ({ ...texts(), animate: false, showPercent: true }))
