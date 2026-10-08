import type { BindingPage } from '../binding.ts'
import { checklistHtml, eventsForm, inputGroup, passwordField, usernameField } from '../components.ts'
import { studioDemo } from '../studio.ts'

export const jqueryPage: BindingPage = {
  id: 'jquery',
  pkg: '@passcore/jquery',
  folder: 'packages/jquery',
  install: 'pnpm add @passcore/jquery jquery',
  demos: [
    {
      id: 'default',
      title: 'demo.default.title',
      text: 'jquery.demo.default',
      demo: passwordField({ id: 'default-password' }),
      lang: 'js',
      code: `import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'

$('#default-password').password()`,
    },
    {
      id: 'checklist',
      title: 'demo.checklist.title',
      text: 'jquery.demo.checklist',
      demo: usernameField('signup-username') + passwordField({ id: 'signup-password', input: { 'aria-describedby': 'checklist-summary' } }) + checklistHtml('checklist'),
      lang: 'js',
      code: `// the list: <li data-rule="minLength" data-state="idle">At least 8 characters</li>, and so on
const $summary = $('#checklist-summary')

$('#signup-password')
  .password({
    userInputs: ['#signup-username'],
    rules: { minLength: 8, lowercase: 1, uppercase: 1, numbers: 1, symbols: 1 },
    animate: false,
  })
  .on('password.score', (event, percent, result) => {
    const typed = event.target.value !== ''
    for (const rule of result.rules) {
      $(\`#checklist [data-rule="\${rule.id}"]\`)
        .attr('data-state', !typed ? 'idle' : rule.passed ? 'met' : 'unmet')
    }
    // a live region: only touch it when the count changes
    const met = result.rules.filter((rule) => rule.passed).length
    const text = typed ? \`\${met} of \${result.rules.length} requirements met\` : \`\${result.rules.length} requirements to meet\`
    if ($summary.text() !== text) {
      $summary.text(text)
    }
  })

// the plugin reads the username when the password changes: update on its changes too
$('#signup-username').on('input', () => $('#signup-password').trigger('input'))`,
    },
    {
      id: 'always',
      title: 'demo.always.title',
      text: 'jquery.demo.always',
      demo: passwordField({ id: 'always-password' }),
      lang: 'js',
      code: `$('#always-password').password({
  animate: false,
  showPercent: true,
})`,
    },
    {
      id: 'linked',
      title: 'demo.linked.title',
      text: 'jquery.demo.linked',
      demo: usernameField('username') + passwordField({ id: 'linked-password' }),
      lang: 'js',
      code: `$('#linked-password').password({
  userInputs: ['#username'],
  showPercent: true,
})`,
    },
    {
      id: 'translations',
      title: 'demo.translations.title',
      text: 'jquery.demo.translations',
      demo: passwordField({ id: 'translations-password' }),
      lang: 'js',
      code: `import en from '@passcore/jquery/locales/en.json'
import es from '@passcore/jquery/locales/es.json'
import ca from '@passcore/jquery/locales/ca.json'

const locales = { en, es, ca }

$('#translations-password').password({
  translations: locales[lang],
  locale: lang,
  animate: false,
  showPercent: true,
})`,
    },
    {
      id: 'i18next',
      title: 'demo.i18next.title',
      text: 'jquery.demo.i18next',
      demo: passwordField({ id: 'i18next-password' }),
      lang: 'js',
      code: `import i18next from 'i18next'
import es from '@passcore/jquery/locales/es.json'
import ca from '@passcore/jquery/locales/ca.json'

i18next.addResourceBundle('es', 'passcore', es)
i18next.addResourceBundle('ca', 'passcore', ca)

const $input = $('#i18next-password')
const mount = () => $input.password({
  translate: (key, params) => i18next.t(key, { ns: 'passcore', ...params }),
  animate: false,
  showPercent: true,
})

mount()

// the plugin has no refresh(): mount it again with the new language
i18next.on('languageChanged', () => {
  $input.off('input keyup change focus blur').closest('div').children('.pass-wrapper').remove()
  mount()
})`,
    },
    {
      id: 'events',
      title: 'demo.events.title',
      text: 'jquery.demo.events',
      demo: eventsForm('events-password'),
      lang: 'js',
      code: `$('#events-password')
  .password({ animate: false })
  .on('password.score', (event, percent) => {
    $('#send').prop('disabled', percent <= 75)
    $('#events-score').text(percent + '%')
  })`,
    },
    {
      id: 'group',
      title: 'demo.group.title',
      text: 'jquery.demo.group',
      demo: inputGroup('group-password', 'group-field'),
      lang: 'js',
      code: `$('#group-password').password({
  animate: false,
  closestSelector: '.form-group',
})`,
    },
    studioDemo(passwordField({ id: 'theme-password' })),
  ],
}
