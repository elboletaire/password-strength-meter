import '@passcore/vue/styles.css'
import { createApp, type Component } from 'vue'
import { renderCards, slot, type Card } from './cards'
import { initTheme, themeCard } from './theme'
import DefaultDemo from './vue/DefaultDemo.vue'
import EventsDemo from './vue/EventsDemo.vue'
import GroupDemo from './vue/GroupDemo.vue'
import HookDemo from './vue/HookDemo.vue'
import I18nDemo from './vue/I18nDemo.vue'
import LinkedDemo from './vue/LinkedDemo.vue'
import PercentDemo from './vue/PercentDemo.vue'
import ThemeDemo from './vue/ThemeDemo.vue'
import TranslationsDemo from './vue/TranslationsDemo.vue'

const cards: Card[] = [
  {
    id: 'default',
    title: 'Default',
    text: 'The component is controlled: it gets the password as a prop. It has no hide behavior, so the meter is always shown.',
    demo: '<div data-slot="default"></div>',
    code: `const password = ref('')

<input id="password" v-model="password" type="password" aria-describedby="password-strength">
<PasswordStrengthMeter id="password-strength" :password="password" />`,
  },
  {
    id: 'percent',
    title: 'Always visible, with the percent',
    text: '<code>show-percent</code> adds the number next to the bar.',
    demo: '<div data-slot="percent"></div>',
    code: `<PasswordStrengthMeter id="password-strength" :password="password" show-percent />`,
  },
  {
    id: 'linked',
    title: 'Linked to a field',
    text: 'With <code>userInputs</code> the password can\'t contain the username. The username comes from a ref, like the password.',
    demo: '<div data-slot="linked"></div>',
    code: `const username = ref('')

<input v-model="username" type="text" autocomplete="username">
<PasswordStrengthMeter id="password-strength" :password="password" :user-inputs="[username]" show-percent />`,
  },
  {
    id: 'translations',
    title: 'Translations',
    text: 'The bundled files are passed as <code>translations</code>, with <code>locale</code> for the plural forms. Switch the language in the header: the ref of the page changes the props.',
    demo: '<div data-slot="translations"></div>',
    code: `import ca from '@passcore/vue/locales/ca.json'
import en from '@passcore/vue/locales/en.json'
import es from '@passcore/vue/locales/es.json'

const bundled = { en, es, ca }

<PasswordStrengthMeter :password="password" :translations="bundled[lang]" :locale="lang" show-percent />`,
  },
  {
    id: 'i18next',
    title: 'Translations with i18next',
    text: 'The <code>translate</code> prop takes the <code>t</code> of an i18next instance, here the playground\'s one (<code>src/i18n.ts</code>). The function reads the language ref, so the texts follow it.',
    demo: '<div data-slot="i18next"></div>',
    code: `import i18next from 'i18next'
import es from '@passcore/vue/locales/es.json'

i18next.addResourceBundle('es', 'passcore', es)

const translate = (key, params) => {
  void lang.value
  return i18next.t(key, { ns: 'passcore', ...params })
}

<PasswordStrengthMeter :password="password" :translate="translate" show-percent />`,
  },
  {
    id: 'events',
    title: 'Events',
    text: 'The <code>score</code> event gives the percent on every change. Here it enables the button above 75%.',
    demo: '<div data-slot="events"></div>',
    code: `const percent = ref(0)

<PasswordStrengthMeter :password="password" @score="(value) => percent = value" />
<button type="submit" :disabled="percent <= 75">Send</button>`,
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
    <input id="password" v-model="password" type="password">
  </div>
  <PasswordStrengthMeter :password="password" />
</div>`,
  },
  {
    id: 'hook',
    title: 'Custom UI with the composable',
    text: '<code>usePasswordStrength()</code> returns refs with the result and its translated texts, for your own markup. Here it draws a checklist of <code>result.rules</code>.',
    demo: '<div data-slot="hook"></div>',
    code: `const { result, text, levelText } = usePasswordStrength(password)

<ul>
  <li v-for="rule in result.rules" :key="rule.id">{{ rule.id }}: {{ rule.passed ? 'passed' : 'failed' }}</li>
</ul>`,
  },
  themeCard('<div data-slot="theme"></div>'),
]

renderCards(cards)

function mount(name: string, component: Component): void {
  createApp(component).mount(slot(name))
}

mount('default', DefaultDemo)
mount('percent', PercentDemo)
mount('linked', LinkedDemo)
mount('translations', TranslationsDemo)
mount('i18next', I18nDemo)
mount('events', EventsDemo)
mount('group', GroupDemo)
mount('hook', HookDemo)
mount('theme', ThemeDemo)

initTheme()
