import type { BindingPage } from '../binding.ts'
import { eventsForm, inputGroup, passwordField, usernameField } from '../components.ts'
import { studioDemo } from '../studio.ts'

export const vanillaPage: BindingPage = {
  id: 'vanilla',
  pkg: '@passcore/vanilla',
  folder: 'packages/vanilla',
  install: 'pnpm add @passcore/vanilla',
  demos: [
    {
      id: 'default',
      title: 'demo.default.title',
      text: 'vanilla.demo.default',
      demo: passwordField({ id: 'default-password' }),
      lang: 'js',
      code: `import { createPasswordMeter } from '@passcore/vanilla'
import '@passcore/vanilla/styles.css'

createPasswordMeter('#default-password', { hideUntilFocus: true })`,
    },
    {
      id: 'always',
      title: 'demo.always.title',
      text: 'vanilla.demo.always',
      demo: passwordField({ id: 'always-password' }),
      lang: 'js',
      code: `createPasswordMeter('#always-password', { showPercent: true })`,
    },
    {
      id: 'linked',
      title: 'demo.linked.title',
      text: 'vanilla.demo.linked',
      demo: usernameField('username') + passwordField({ id: 'linked-password' }),
      lang: 'js',
      code: `createPasswordMeter('#linked-password', {
  userInputs: ['#username'],
  showPercent: true,
})`,
    },
    {
      id: 'translations',
      title: 'demo.translations.title',
      text: 'vanilla.demo.translations',
      demo: passwordField({ id: 'translations-password' }),
      lang: 'js',
      code: `import en from '@passcore/vanilla/locales/en.json'
import es from '@passcore/vanilla/locales/es.json'
import ca from '@passcore/vanilla/locales/ca.json'

const locales = { en, es, ca }

// the options are read once: create the meter again for another language
meter?.destroy()
meter = createPasswordMeter('#translations-password', {
  translations: locales[lang],
  locale: lang,
  label: labels[lang],
  showPercent: true,
})`,
    },
    {
      id: 'i18next',
      title: 'demo.i18next.title',
      text: 'vanilla.demo.i18next',
      demo: passwordField({ id: 'i18next-password' }),
      lang: 'js',
      code: `import i18next from 'i18next'
import es from '@passcore/vanilla/locales/es.json'
import ca from '@passcore/vanilla/locales/ca.json'

i18next.addResourceBundle('es', 'passcore', es)
i18next.addResourceBundle('ca', 'passcore', ca)

const meter = createPasswordMeter('#i18next-password', {
  translate: (key, params) => i18next.t(key, { ns: 'passcore', ...params }),
  showPercent: true,
})

// the texts are translated on every update: refresh them
i18next.on('languageChanged', () => meter.refresh())`,
    },
    {
      id: 'events',
      title: 'demo.events.title',
      text: 'vanilla.demo.events',
      demo: eventsForm('events-password'),
      lang: 'js',
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
      title: 'demo.container.title',
      text: 'vanilla.demo.group',
      demo: inputGroup('group-password', 'group-field'),
      lang: 'js',
      code: `createPasswordMeter('#group-password', { container: '#group-field' })`,
    },
    {
      id: 'element',
      title: 'demo.element.title',
      text: 'vanilla.demo.element',
      demo: usernameField('element-username')
        + passwordField({ id: 'element-password', after: '<password-meter for="element-password" min-length="10" show-percent user-inputs="#element-username"></password-meter>' }),
      lang: 'html',
      code: `<script type="module">
  import '@passcore/vanilla/element'
</script>

<input type="text" id="element-username">
<input type="password" id="element-password">
<password-meter
  for="element-password"
  min-length="10"
  show-percent
  user-inputs="#element-username"
></password-meter>`,
    },
    {
      id: 'options',
      title: 'demo.options.title',
      text: 'vanilla.demo.options',
      demo: passwordField({ id: 'options-password', after: '<password-meter for="options-password" show-percent></password-meter>' }),
      lang: 'js',
      code: `const element = document.querySelector('password-meter[for="options-password"]')

// merged over the attributes: show-percent still applies
element.options = {
  translations: locales[lang],
  locale: lang,
  rules: { numbers: 1, symbols: 1 },
}`,
    },
    studioDemo(passwordField({ id: 'theme-password' })),
  ],
}
