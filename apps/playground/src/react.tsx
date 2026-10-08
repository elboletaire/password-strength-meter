import '@passcore/react/styles.css'
import { createRoot } from 'react-dom/client'
import type { ReactElement } from 'react'
import { renderCards, slot, type Card } from './cards'
import { initTheme, themeCard } from './theme'
import {
  DefaultDemo,
  EventsDemo,
  GroupDemo,
  HookDemo,
  I18nDemo,
  LinkedDemo,
  PercentDemo,
  ThemeDemo,
  TranslationsDemo,
} from './react/demos'

const cards: Card[] = [
  {
    id: 'default',
    title: 'Default',
    text: 'The component is controlled: it gets the password as a prop. It has no hide behavior, so the meter is always shown.',
    demo: '<div data-slot="default"></div>',
    code: `const [password, setPassword] = useState('')

<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="password-strength" />
<PasswordStrengthMeter id="password-strength" password={password} />`,
  },
  {
    id: 'percent',
    title: 'Always visible, with the percent',
    text: '<code>showPercent</code> adds the number next to the bar.',
    demo: '<div data-slot="percent"></div>',
    code: `<PasswordStrengthMeter id="password-strength" password={password} showPercent />`,
  },
  {
    id: 'linked',
    title: 'Linked to a field',
    text: 'With <code>userInputs</code> the password can\'t contain the username. The username comes from state, like the password.',
    demo: '<div data-slot="linked"></div>',
    code: `const [username, setUsername] = useState('')

<input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
<PasswordStrengthMeter id="password-strength" password={password} userInputs={[username]} showPercent />`,
  },
  {
    id: 'translations',
    title: 'Translations',
    text: 'The bundled files are passed as <code>translations</code>, with <code>locale</code> for the plural forms. Switch the language in the header: the state of the page changes the props.',
    demo: '<div data-slot="translations"></div>',
    code: `import ca from '@passcore/react/locales/ca.json'
import en from '@passcore/react/locales/en.json'
import es from '@passcore/react/locales/es.json'

const bundled = { en, es, ca }

<PasswordStrengthMeter password={password} translations={bundled[lang]} locale={lang} showPercent />`,
  },
  {
    id: 'i18next',
    title: 'Translations with i18next',
    text: 'The <code>translate</code> prop takes the <code>t</code> of an i18next instance, here the playground\'s one (<code>src/i18n.ts</code>). It is passed as a new arrow function on each render, so the texts follow the language.',
    demo: '<div data-slot="i18next"></div>',
    code: `import i18next from 'i18next'
import es from '@passcore/react/locales/es.json'

i18next.addResourceBundle('es', 'passcore', es)

<PasswordStrengthMeter
  password={password}
  translate={(key, params) => i18next.t(key, { ns: 'passcore', ...params })}
  showPercent
/>`,
  },
  {
    id: 'events',
    title: 'Events',
    text: 'The <code>onScore</code> callback gives the percent on every change. Here it enables the button above 75%.',
    demo: '<div data-slot="events"></div>',
    code: `const [percent, setPercent] = useState(0)

<PasswordStrengthMeter password={password} onScore={(score) => setPercent(score)} />
<button type="submit" disabled={percent <= 75}>Send</button>`,
  },
  {
    id: 'group',
    title: 'Input group',
    text: 'The meter is a sibling of the input group, so it goes below the whole group, like the other bindings do with their containers.',
    demo: '<div data-slot="group"></div>',
    code: `<div className="form-group">
  <label htmlFor="password">Password</label>
  <div className="input-group">
    <span className="input-group__addon">…</span>
    <input id="password" type="password" value={password} onChange={…} />
  </div>
  <PasswordStrengthMeter password={password} />
</div>`,
  },
  {
    id: 'hook',
    title: 'Custom UI with the hook',
    text: '<code>usePasswordStrength()</code> returns the result with its translated texts, for your own markup. Here it draws a checklist of <code>result.rules</code>.',
    demo: '<div data-slot="hook"></div>',
    code: `const { percent, rules, text, levelText } = usePasswordStrength(password)

<ul>
  {rules.map((rule) => (
    <li key={rule.id}>{rule.id}: {rule.passed ? 'passed' : 'failed'}</li>
  ))}
</ul>`,
  },
  themeCard('<div data-slot="theme"></div>'),
]

renderCards(cards)

function mount(name: string, element: ReactElement): void {
  createRoot(slot(name)).render(element)
}

mount('default', <DefaultDemo />)
mount('percent', <PercentDemo />)
mount('linked', <LinkedDemo />)
mount('translations', <TranslationsDemo />)
mount('i18next', <I18nDemo />)
mount('events', <EventsDemo />)
mount('group', <GroupDemo />)
mount('hook', <HookDemo />)
mount('theme', <ThemeDemo />)

initTheme()
