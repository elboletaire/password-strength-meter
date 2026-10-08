import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'
import { eventsHtml, fieldHtml, inputGroupHtml, renderCards, type Card } from './cards'
import { currentLang, locales, onLanguageChange, type Lang } from './site'
import { initTheme, themeCard } from './theme'

// respect the reduced motion preference: jQuery's slide animations complete at once
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $.fx.off = true
}

const cards: Card[] = [
  {
    id: 'default',
    title: 'Default',
    text: 'The meter stays hidden until the input gets focus, then slides in. It slides out again when the input loses focus while empty.',
    demo: fieldHtml({ id: 'default-password', label: 'Password' }),
    code: `$('#default-password').password()`,
  },
  {
    id: 'always',
    title: 'Always visible',
    text: 'With <code>animate: false</code> the meter is shown from the start, and <code>showPercent</code> adds the number.',
    demo: fieldHtml({ id: 'always-password', label: 'Password' }),
    code: `$('#always-password').password({ animate: false, showPercent: true })`,
  },
  {
    id: 'linked',
    title: 'Linked to a field',
    text: 'With <code>userInputs</code> the password can\'t contain the username. The field is read on every keystroke.',
    demo: fieldHtml({ id: 'username', label: 'Username', type: 'text', autocomplete: 'username', placeholder: 'johndoe' })
      + fieldHtml({ id: 'linked-password', label: 'Password' }),
    code: `$('#linked-password').password({ userInputs: ['#username'], showPercent: true })`,
  },
  {
    id: 'translations',
    title: 'Translations',
    text: 'The bundled <code>es</code> and <code>ca</code> files are passed as <code>translations</code>, with <code>locale</code> for the plural forms. Switch the language in the header.',
    demo: fieldHtml({ id: 'translations-password', label: 'Password' }),
    code: `import es from '@passcore/jquery/locales/es.json'

$('#translations-password').password({ translations: es, locale: 'es', showPercent: true })`,
  },
  {
    id: 'events',
    title: 'Events',
    text: 'The <code>password.score</code> event gives the percent on every keystroke. Here it enables the button above 75%.',
    demo: eventsHtml('events-password'),
    code: `$('#events-password')
  .password({ animate: false })
  .on('password.score', (event, percent) => {
    $('#send').prop('disabled', percent <= 75)
  })`,
  },
  {
    id: 'group',
    title: 'Input group',
    text: 'The meter is appended to the closest <code>.form-group</code> instead of the closest <code>div</code>, so it goes below the whole input group.',
    demo: inputGroupHtml('group-password', 'Password', 'group-field'),
    code: `$('#group-password').password({ animate: false, closestSelector: '.form-group' })`,
  },
  themeCard(fieldHtml({ id: 'theme-password', label: 'Password' })),
]

renderCards(cards)

// the default cards
$('#default-password').password()

$('#always-password').password({ animate: false, showPercent: true })

$('#linked-password').password({ userInputs: ['#username'], showPercent: true })

$('#group-password').password({ animate: false, closestSelector: '.form-group' })

// translations: the plugin reads its texts once, so a language change mounts the meter again
const translationsInput = $('#translations-password')

function mountTranslations(lang: Lang): void {
  translationsInput.off('keyup focus blur')
  translationsInput.closest('.field').children('.pass-wrapper').remove()
  // the plugin appends its text id to aria-describedby on every mount: start from none
  translationsInput.removeAttr('aria-describedby')
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

// theming: the sample meters and the typed password use the same custom properties
initTheme()
$('#theme-password').password({ animate: false, showPercent: true })
