import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'
import { currentLang, locales, onLanguageChange, type Lang } from './site'

// respect the reduced motion preference: jQuery's slide animations complete at once
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $.fx.off = true
}

// the default cards
$('#default-password').password()

$('#always-password').password({ animate: false, showPercent: true })

$('#linked-password').password({ userInputs: ['#username'], showPercent: true })

$('#group-password').password({ animate: false, closestSelector: '.form-group' })

// translations: the plugin reads its texts once, so a language change mounts the meter again
const translationsInput = $('#translations-password')
const translationsDescribedBy = translationsInput.attr('aria-describedby')

function mountTranslations(lang: Lang): void {
  translationsInput.off('keyup focus blur')
  translationsInput.closest('.field').children('.pass-wrapper').remove()
  if (translationsDescribedBy === undefined) {
    translationsInput.removeAttr('aria-describedby')
  }
  else {
    translationsInput.attr('aria-describedby', translationsDescribedBy)
  }
  translationsInput.password({ animate: false, showPercent: true, translations: locales[lang], locale: lang })
}

mountTranslations(currentLang())
onLanguageChange(mountTranslations)

// events: enables the button above 75%
const sendButton = $('#send')
const sendStatus = $('#send-status')

$('#events-password')
  .password({ animate: false })
  .on('password.score', (_event, percent: number) => {
    sendButton.prop('disabled', percent <= 75)
    $('#events-score').text(`${percent}%`)
  })

$('#events-form').on('submit', (event) => {
  event.preventDefault()
  sendStatus.text('Submitted in the playground: nothing was sent.')
})

// theming: the custom properties are set on the preview only
const preview = document.getElementById('theme-preview')
if (!preview) {
  throw new Error('Missing #theme-preview in jquery.html')
}

const HEX = /^#[0-9a-f]{6}$/i
const controls = Array.from(document.querySelectorAll<HTMLInputElement>('[data-var]'))
const initialValues = new Map<HTMLInputElement, string>()

// the sample meters and the typed password use the same properties
$('#theme-password').password({ animate: false, showPercent: true })

// colours that come from the page (e.g. the dark theme's track) start the pickers
const computed = getComputedStyle(preview)
for (const control of controls) {
  const variable = control.dataset.var ?? ''
  const value = computed.getPropertyValue(variable).trim()
  if (control.type === 'color' && HEX.test(value)) {
    control.value = value
  }
  if (control.type === 'range' && Number.isFinite(parseFloat(value))) {
    control.value = String(parseFloat(value))
  }
  initialValues.set(control, control.value)
}

const withUnit = (control: HTMLInputElement): string => control.value + (control.dataset.unit ?? '')

/** Shows the control's value next to a slider. */
const showValue = (control: HTMLInputElement): void => {
  const output = control.closest('label')?.querySelector('output')
  if (output) {
    output.textContent = withUnit(control)
  }
}

for (const control of controls) {
  control.addEventListener('input', () => {
    preview.style.setProperty(control.dataset.var ?? '', withUnit(control))
    showValue(control)
  })
  preview.style.setProperty(control.dataset.var ?? '', withUnit(control))
  showValue(control)
}

// reset removes the inline properties, so the stylesheet's defaults apply again
document.getElementById('theme-reset')?.addEventListener('click', () => {
  for (const control of controls) {
    control.value = initialValues.get(control) ?? control.defaultValue
    preview.style.removeProperty(control.dataset.var ?? '')
    showValue(control)
  }
})
