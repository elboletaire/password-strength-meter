import '@passcore/svelte/styles.css'
import { mount, type Component } from 'svelte'
import { renderCards, slot, type Card } from './cards'
import { initTheme, themeCard } from './theme'
import DefaultDemo from './svelte/DefaultDemo.svelte'
import EventsDemo from './svelte/EventsDemo.svelte'
import GroupDemo from './svelte/GroupDemo.svelte'
import HookDemo from './svelte/HookDemo.svelte'
import I18nDemo from './svelte/I18nDemo.svelte'
import LinkedDemo from './svelte/LinkedDemo.svelte'
import PercentDemo from './svelte/PercentDemo.svelte'
import ThemeDemo from './svelte/ThemeDemo.svelte'
import TranslationsDemo from './svelte/TranslationsDemo.svelte'

const cards: Card[] = [
  {
    id: 'default',
    title: 'Default',
    text: 'The component is controlled: it gets the password as a prop. It has no hide behavior, so the meter is always shown.',
    demo: '<div data-slot="default"></div>',
    code: `let password = $state('')

<input id="password" type="password" aria-describedby="password-strength" bind:value={password} />
<PasswordStrengthMeter id="password-strength" {password} />`,
  },
  {
    id: 'percent',
    title: 'Always visible, with the percent',
    text: '<code>showPercent</code> adds the number next to the bar.',
    demo: '<div data-slot="percent"></div>',
    code: `<PasswordStrengthMeter id="password-strength" {password} showPercent />`,
  },
  {
    id: 'linked',
    title: 'Linked to a field',
    text: 'With <code>userInputs</code> the password can\'t contain the username. The username is a rune, like the password.',
    demo: '<div data-slot="linked"></div>',
    code: `let username = $state('')

<input type="text" bind:value={username} />
<PasswordStrengthMeter id="password-strength" {password} userInputs={[username]} showPercent />`,
  },
  {
    id: 'translations',
    title: 'Translations',
    text: 'The bundled files are passed as <code>translations</code>, with <code>locale</code> for the plural forms. Switch the language in the header: the rune of the page changes the props.',
    demo: '<div data-slot="translations"></div>',
    code: `import ca from '@passcore/svelte/locales/ca.json'
import en from '@passcore/svelte/locales/en.json'
import es from '@passcore/svelte/locales/es.json'

const bundled = { en, es, ca }

<PasswordStrengthMeter {password} translations={bundled[lang]} locale={lang} showPercent />`,
  },
  {
    id: 'i18next',
    title: 'Translations with i18next',
    text: 'The <code>translate</code> prop takes the <code>t</code> of an i18next instance, here the playground\'s one (<code>src/i18n.ts</code>). The function reads the language rune, so the texts follow it.',
    demo: '<div data-slot="i18next"></div>',
    code: `import i18next from 'i18next'
import es from '@passcore/svelte/locales/es.json'

i18next.addResourceBundle('es', 'passcore', es)

const translate = (key, params) => {
  void lang.current
  return i18next.t(key, { ns: 'passcore', ...params })
}

<PasswordStrengthMeter {password} {translate} showPercent />`,
  },
  {
    id: 'events',
    title: 'Events',
    text: 'The <code>onscore</code> callback gives the percent on every change. Here it enables the button above 75%.',
    demo: '<div data-slot="events"></div>',
    code: `let percent = $state(0)

<PasswordStrengthMeter {password} onscore={(value) => (percent = value)} />
<button type="submit" disabled={percent <= 75}>Send</button>`,
  },
  {
    id: 'group',
    title: 'Input group',
    text: 'The meter is a sibling of the input group, so it goes below the whole group, like the other bindings do with their containers.',
    demo: '<div data-slot="group"></div>',
    code: `<div class="form-group">
  <label for="password">Password</label>
  <div class="input-group">
    <span class="input-group__addon">…</span>
    <input id="password" type="password" bind:value={password} />
  </div>
  <PasswordStrengthMeter {password} />
</div>`,
  },
  {
    id: 'hook',
    title: 'Custom UI with the helper',
    text: '<code>passwordStrength()</code> evaluates the password with the same options, and returns getters for the result and its translated texts. Here it draws a checklist of <code>result.rules</code>.',
    demo: '<div data-slot="hook"></div>',
    code: `const strength = passwordStrength(() => password)

<p>{strength.text} ({strength.result.percent}%, {strength.levelText})</p>
<ul>
  {#each strength.result.rules as rule (rule.id)}
    <li>{rule.id}: {rule.passed ? 'passed' : 'failed'}</li>
  {/each}
</ul>`,
  },
  themeCard('<div data-slot="theme"></div>'),
]

renderCards(cards)

function start(component: Component<Record<string, never>>, name: string): void {
  mount(component, { target: slot(name) })
}

start(DefaultDemo, 'default')
start(PercentDemo, 'percent')
start(LinkedDemo, 'linked')
start(TranslationsDemo, 'translations')
start(I18nDemo, 'i18next')
start(EventsDemo, 'events')
start(GroupDemo, 'group')
start(HookDemo, 'hook')
start(ThemeDemo, 'theme')

initTheme()
