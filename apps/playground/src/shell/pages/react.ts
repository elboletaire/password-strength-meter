import type { BindingPage } from '../binding.ts'
import { slot } from '../components.ts'
import { studioDemo } from '../studio.ts'

export const reactPage: BindingPage = {
  id: 'react',
  pkg: '@passcore/react',
  folder: 'packages/react',
  install: 'pnpm add @passcore/react',
  demos: [
    {
      id: 'default',
      title: 'demo.default.title',
      text: 'react.demo.default',
      demo: slot('default', 6.5),
      lang: 'tsx',
      code: `import { PasswordStrengthMeter } from '@passcore/react'
import '@passcore/react/styles.css'

const [password, setPassword] = useState('')

<input
  id="password"
  type="password"
  value={password}
  onChange={(event) => setPassword(event.target.value)}
  aria-describedby="password-strength"
/>
<PasswordStrengthMeter id="password-strength" password={password} />`,
    },
    {
      id: 'checklist',
      title: 'demo.checklist.title',
      text: 'react.demo.checklist',
      demo: slot('checklist', 25),
      lang: 'tsx',
      code: `import { PasswordStrengthMeter, usePasswordStrength } from '@passcore/react'

const rules = { minLength: 8, lowercase: 1, uppercase: 1, numbers: 1, symbols: 1 }

const { result } = usePasswordStrength(password, { userInputs: [username], rules })
const typed = password !== ''
const met = result.rules.filter((rule) => rule.passed).length

<PasswordStrengthMeter password={password} userInputs={[username]} rules={rules} />
<ul>
  {result.rules.map((rule) => (
    <li key={rule.id} data-state={!typed ? 'idle' : rule.passed ? 'met' : 'unmet'}>
      {t(\`requirements.rule.\${rule.id}\`, { count: rule.params.min })}
    </li>
  ))}
</ul>
<p aria-live="polite">
  {typed ? \`\${met} of \${result.rules.length} requirements met\` : \`\${result.rules.length} requirements to meet\`}
</p>`,
    },
    {
      id: 'percent',
      title: 'demo.percent.title',
      text: 'react.demo.percent',
      demo: slot('percent', 6.5),
      lang: 'tsx',
      code: `<PasswordStrengthMeter
  id="password-strength"
  password={password}
  showPercent
/>`,
    },
    {
      id: 'linked',
      title: 'demo.linked.title',
      text: 'react.demo.linked',
      demo: slot('linked', 13),
      lang: 'tsx',
      code: `const [username, setUsername] = useState('')

<input
  type="text"
  autoComplete="username"
  value={username}
  onChange={(event) => setUsername(event.target.value)}
/>
<PasswordStrengthMeter
  id="password-strength"
  password={password}
  userInputs={[username]}
  showPercent
/>`,
    },
    {
      id: 'translations',
      title: 'demo.translations.title',
      text: 'react.demo.translations',
      demo: slot('translations', 6.5),
      lang: 'tsx',
      code: `import en from '@passcore/react/locales/en.json'
import es from '@passcore/react/locales/es.json'
import ca from '@passcore/react/locales/ca.json'

const locales = { en, es, ca }

<PasswordStrengthMeter
  password={password}
  translations={locales[lang]}
  locale={lang}
  label={labels[lang]}
  showPercent
/>`,
    },
    {
      id: 'i18next',
      title: 'demo.i18next.title',
      text: 'react.demo.i18next',
      demo: slot('i18next', 6.5),
      lang: 'tsx',
      code: `import i18next from 'i18next'
import es from '@passcore/react/locales/es.json'
import ca from '@passcore/react/locales/ca.json'

i18next.addResourceBundle('es', 'passcore', es)
i18next.addResourceBundle('ca', 'passcore', ca)

const translate = (key, params) => i18next.t(key, { ns: 'passcore', ...params })

// the same function in every language: locale tells the meter to translate again
<PasswordStrengthMeter
  password={password}
  translate={translate}
  locale={lang}
  label={labels[lang]}
  showPercent
/>`,
    },
    {
      id: 'events',
      title: 'demo.events.title',
      text: 'react.demo.events',
      demo: slot('events', 12),
      lang: 'tsx',
      code: `const [percent, setPercent] = useState(0)

<PasswordStrengthMeter password={password} onScore={setPercent} />
<output>{percent}%</output>
<button type="submit" disabled={percent <= 75}>Send</button>`,
    },
    {
      id: 'group',
      title: 'demo.group.title',
      text: 'react.demo.group',
      demo: slot('group', 6.5),
      lang: 'tsx',
      code: `<div className="form-group">
  <label htmlFor="password">Password</label>
  <div className="input-group">
    <span className="input-group__addon">…</span>
    <input id="password" type="password" value={password} onChange={…} />
  </div>
  <PasswordStrengthMeter password={password} />
</div>`,
    },
    studioDemo(`<div class="slot" data-slot="theme" style="min-height: 6.5rem"></div>`),
  ],
}
