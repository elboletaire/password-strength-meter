import type { BindingPage } from '../binding.ts'
import { slot } from '../components.ts'
import { studioDemo } from '../studio.ts'

export const vuePage: BindingPage = {
  id: 'vue',
  pkg: '@passcore/vue',
  folder: 'packages/vue',
  install: 'pnpm add @passcore/vue',
  demos: [
    {
      id: 'default',
      title: 'demo.default.title',
      text: 'vue.demo.default',
      demo: slot('default', 6.5),
      lang: 'vue',
      code: `<script setup>
import { ref } from 'vue'
import { PasswordStrengthMeter } from '@passcore/vue'
import '@passcore/vue/styles.css'

const password = ref('')
</script>

<template>
  <input id="password" v-model="password" type="password" aria-describedby="password-strength">
  <PasswordStrengthMeter id="password-strength" :password="password" />
</template>`,
    },
    {
      id: 'percent',
      title: 'demo.percent.title',
      text: 'vue.demo.percent',
      demo: slot('percent', 6.5),
      lang: 'vue',
      code: `<PasswordStrengthMeter id="password-strength" :password="password" show-percent />`,
    },
    {
      id: 'linked',
      title: 'demo.linked.title',
      text: 'vue.demo.linked',
      demo: slot('linked', 13),
      lang: 'vue',
      code: `<input v-model="username" type="text" autocomplete="username">
<PasswordStrengthMeter
  id="password-strength"
  :password="password"
  :user-inputs="[username]"
  show-percent
/>`,
    },
    {
      id: 'translations',
      title: 'demo.translations.title',
      text: 'vue.demo.translations',
      demo: slot('translations', 6.5),
      lang: 'vue',
      code: `<script setup>
import en from '@passcore/vue/locales/en.json'
import es from '@passcore/vue/locales/es.json'
import ca from '@passcore/vue/locales/ca.json'

const locales = { en, es, ca }
</script>

<template>
  <PasswordStrengthMeter
    :password="password"
    :translations="locales[lang]"
    :locale="lang"
    :label="labels[lang]"
    show-percent
  />
</template>`,
    },
    {
      id: 'i18next',
      title: 'demo.i18next.title',
      text: 'vue.demo.i18next',
      demo: slot('i18next', 6.5),
      lang: 'vue',
      code: `<script setup>
import i18next from 'i18next'
import es from '@passcore/vue/locales/es.json'
import ca from '@passcore/vue/locales/ca.json'

i18next.addResourceBundle('es', 'passcore', es)
i18next.addResourceBundle('ca', 'passcore', ca)

const translate = (key, params) => i18next.t(key, { ns: 'passcore', ...params })
</script>

<template>
  <!-- locale tells the meter to translate again -->
  <PasswordStrengthMeter :password="password" :translate="translate" :locale="lang" :label="labels[lang]" show-percent />
</template>`,
    },
    {
      id: 'events',
      title: 'demo.events.title',
      text: 'vue.demo.events',
      demo: slot('events', 12),
      lang: 'vue',
      code: `<script setup>
const percent = ref(0)
</script>

<template>
  <PasswordStrengthMeter :password="password" @score="(value) => (percent = value)" />
  <output>{{ percent }}%</output>
  <button type="submit" :disabled="percent <= 75">Send</button>
</template>`,
    },
    {
      id: 'group',
      title: 'demo.group.title',
      text: 'vue.demo.group',
      demo: slot('group', 6.5),
      lang: 'vue',
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
      title: 'demo.hook.vue.title',
      text: 'vue.demo.hook',
      demo: slot('hook', 19),
      lang: 'vue',
      code: `<script setup>
import { usePasswordStrength } from '@passcore/vue'

const { result, text } = usePasswordStrength(password, {
  rules: { uppercase: 1, numbers: 1, symbols: 1 },
})
</script>

<template>
  <p :data-level="result.level">{{ text }}</p>
  <ul>
    <li v-for="rule in result.rules" :key="rule.id" :data-passed="rule.passed">
      {{ describe(rule) }}
    </li>
  </ul>
</template>`,
    },
    studioDemo(`<div class="slot" data-slot="theme" style="min-height: 6.5rem"></div>`),
  ],
}
