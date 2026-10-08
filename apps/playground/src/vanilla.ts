import '@passcore/vanilla/styles.css'
import { createPasswordMeter, type PasswordMeter } from '@passcore/vanilla'
import type { PasswordMeterElement } from '@passcore/vanilla/element'
import '@passcore/vanilla/element'
import ca from '@passcore/vanilla/locales/ca.json'
import en from '@passcore/vanilla/locales/en.json'
import es from '@passcore/vanilla/locales/es.json'
import { byId, eventsHtml, fieldHtml, inputGroupHtml, renderCards, type Card } from './cards'
import { translate } from './i18n'
import { onLanguageChange, currentLang, type Lang } from './site'
import { initTheme, themeCard } from './theme'

const bundled = { en, es, ca }

const cards: Card[] = [
  {
    id: 'default',
    title: 'Default',
    text: 'With <code>hideUntilFocus</code> the meter is hidden until the input gets focus. It hides again on blur while the input is empty.',
    demo: fieldHtml({ id: 'default-password', label: 'Password' }),
    code: `createPasswordMeter('#default-password', { hideUntilFocus: true })`,
  },
  {
    id: 'always',
    title: 'Always visible',
    text: 'Without <code>hideUntilFocus</code> the meter is shown from the start, and <code>showPercent</code> adds the number.',
    demo: fieldHtml({ id: 'always-password', label: 'Password' }),
    code: `createPasswordMeter('#always-password', { showPercent: true })`,
  },
  {
    id: 'linked',
    title: 'Linked to a field',
    text: 'With <code>userInputs</code> the password can\'t contain the username. Selectors are read on every keystroke, and functions work too.',
    demo: fieldHtml({ id: 'username', label: 'Username', type: 'text', autocomplete: 'username', placeholder: 'johndoe' })
      + fieldHtml({ id: 'linked-password', label: 'Password' }),
    code: `createPasswordMeter('#linked-password', { userInputs: ['#username'], showPercent: true })`,
  },
  {
    id: 'translations',
    title: 'Translations',
    text: 'The bundled files are passed as <code>translations</code>, with <code>locale</code> for the plural forms. The meter is created again when the language changes in the header.',
    demo: fieldHtml({ id: 'translations-password', label: 'Password' }),
    code: `import ca from '@passcore/vanilla/locales/ca.json'
import en from '@passcore/vanilla/locales/en.json'
import es from '@passcore/vanilla/locales/es.json'

const locales = { en, es, ca }

createPasswordMeter('#translations-password', { translations: locales[lang], locale: lang, showPercent: true })`,
  },
  {
    id: 'i18next',
    title: 'Translations with i18next',
    text: 'The <code>translate</code> option takes the <code>t</code> of an i18next instance, here the one of the playground (<code>src/i18n.ts</code>). The texts follow the header, through <code>refresh()</code>.',
    demo: fieldHtml({ id: 'i18next-password', label: 'Password' }),
    code: `import i18next from 'i18next'
import es from '@passcore/vanilla/locales/es.json'

i18next.addResourceBundle('es', 'passcore', es)

createPasswordMeter('#i18next-password', {
  translate: (key, params) => i18next.t(key, { ns: 'passcore', ...params }),
  showPercent: true,
})`,
  },
  {
    id: 'events',
    title: 'Events',
    text: 'The <code>onScore</code> callback, and the <code>passcore:score</code> event that bubbles from the input, give the percent on every keystroke. Here they enable the button above 75%.',
    demo: eventsHtml('events-password'),
    code: `const input = document.querySelector('#events-password')
const send = document.querySelector('#send')

createPasswordMeter(input, {
  onScore: (percent) => {
    send.disabled = percent <= 75
  },
})

input.addEventListener('passcore:score', (event) => {
  document.querySelector('#events-score').textContent = \`\${event.detail.percent}%\`
})`,
  },
  {
    id: 'group',
    title: 'Input group',
    text: 'The <code>container</code> option appends the meter to another element than the one after the input, so it goes below the whole input group.',
    demo: inputGroupHtml('group-password', 'Password', 'group-field'),
    code: `createPasswordMeter('#group-password', { container: '#group-field' })`,
  },
  {
    id: 'element',
    title: 'Custom element',
    text: 'The <code>&lt;password-meter&gt;</code> element renders the meter where it is written. Its attributes are the simple options: <code>min-length</code>, <code>show-percent</code>, <code>user-inputs</code>, <code>locale</code>, and so on.',
    demo: fieldHtml({ id: 'element-username', label: 'Username', type: 'text', autocomplete: 'username', placeholder: 'johndoe' })
      + fieldHtml({ id: 'element-password', label: 'Password' })
      + '<password-meter for="element-password" min-length="10" show-percent user-inputs="#element-username"></password-meter>',
    code: `<input type="password" id="element-password">
<password-meter for="element-password" min-length="10" show-percent user-inputs="#element-username"></password-meter>`,
  },
  {
    id: 'options',
    title: 'Options from script',
    text: 'The <code>options</code> property takes what attributes can\'t: translations, rules, callbacks. It is merged over the attributes, so <code>min-length</code> and the other ones still apply.',
    demo: fieldHtml({ id: 'options-password', label: 'Password' })
      + '<password-meter for="options-password" locale="es"></password-meter>',
    code: `const meter = document.querySelector('password-meter')

meter.options = {
  translations: es,
  rules: { numbers: 1 },
}`,
  },
  themeCard(fieldHtml({ id: 'theme-password', label: 'Password' })),
]

renderCards(cards)

// default: hidden until the input is focused
createPasswordMeter('#default-password', { hideUntilFocus: true })

createPasswordMeter('#always-password', { showPercent: true })

createPasswordMeter('#linked-password', { userInputs: ['#username'], showPercent: true })

createPasswordMeter('#group-password', { container: '#group-field' })

// translations: the options are read once, so a language change creates the meter again
let translated: PasswordMeter | undefined

function mountTranslations(lang: Lang): void {
  translated?.destroy()
  translated = createPasswordMeter('#translations-password', { translations: bundled[lang], locale: lang, showPercent: true })
}

mountTranslations(currentLang())
onLanguageChange(mountTranslations)

// i18next: the texts are translated on each evaluation, so a language change only needs a refresh
const i18nMeter = createPasswordMeter('#i18next-password', { translate, showPercent: true })
onLanguageChange(() => i18nMeter.refresh())

// events: the callback and the DOM event both see every update
const sendButton = byId<HTMLButtonElement>('send')
const scoreOutput = byId('events-score')
const sendStatus = byId('send-status')
const eventsInput = byId<HTMLInputElement>('events-password')

createPasswordMeter(eventsInput, {
  onScore: (percent) => {
    sendButton.disabled = percent <= 75
  },
})

eventsInput.addEventListener('passcore:score', (event) => {
  const { percent } = (event as CustomEvent<{ percent: number }>).detail
  scoreOutput.textContent = `${percent}%`
})

byId('events-form').addEventListener('submit', (event) => {
  event.preventDefault()
  sendStatus.textContent = 'Submitted in the playground: nothing was sent.'
})

// the custom element: the attributes cover the first card, the options property the second one
const optionsElement = document.querySelector<PasswordMeterElement>('password-meter[for="options-password"]')
if (!optionsElement) {
  throw new Error('Missing the password-meter of the options card')
}
optionsElement.options = {
  translations: es,
  rules: { numbers: 1 },
}

// theming: the sample meters and the typed password use the same custom properties
initTheme()
createPasswordMeter('#theme-password', { showPercent: true })
