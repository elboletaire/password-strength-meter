import type { BindingPage } from '../binding.ts'
import { slot } from '../components.ts'
import { studioDemo } from '../studio.ts'

export const sveltePage: BindingPage = {
  id: 'svelte',
  pkg: '@passcore/svelte',
  folder: 'packages/svelte',
  install: 'pnpm add @passcore/svelte',
  demos: [
    {
      id: 'default',
      title: 'demo.default.title',
      text: 'svelte.demo.default',
      demo: slot('default', 6.5),
      lang: 'svelte',
      code: `<script>
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import '@passcore/svelte/styles.css'

  let password = $state('')
</script>

<input id="password" type="password" bind:value={password} aria-describedby="password-strength" />
<PasswordStrengthMeter id="password-strength" {password} />`,
    },
    {
      id: 'percent',
      title: 'demo.percent.title',
      text: 'svelte.demo.percent',
      demo: slot('percent', 6.5),
      lang: 'svelte',
      code: `<PasswordStrengthMeter id="password-strength" {password} showPercent />`,
    },
    {
      id: 'linked',
      title: 'demo.linked.title',
      text: 'svelte.demo.linked',
      demo: slot('linked', 13),
      lang: 'svelte',
      code: `<script>
  let username = $state('')
</script>

<input type="text" autocomplete="username" bind:value={username} />
<PasswordStrengthMeter id="password-strength" {password} userInputs={[username]} showPercent />`,
    },
    {
      id: 'translations',
      title: 'demo.translations.title',
      text: 'svelte.demo.translations',
      demo: slot('translations', 6.5),
      lang: 'svelte',
      code: `<script>
  import en from '@passcore/svelte/locales/en.json'
  import es from '@passcore/svelte/locales/es.json'
  import ca from '@passcore/svelte/locales/ca.json'

  const locales = { en, es, ca }
</script>

<PasswordStrengthMeter
  {password}
  translations={locales[lang]}
  locale={lang}
  label={labels[lang]}
  showPercent
/>`,
    },
    {
      id: 'i18next',
      title: 'demo.i18next.title',
      text: 'svelte.demo.i18next',
      demo: slot('i18next', 6.5),
      lang: 'svelte',
      code: `<script>
  import i18next from 'i18next'
  import es from '@passcore/svelte/locales/es.json'
  import ca from '@passcore/svelte/locales/ca.json'

  i18next.addResourceBundle('es', 'passcore', es)
  i18next.addResourceBundle('ca', 'passcore', ca)

  const translate = (key, params) => i18next.t(key, { ns: 'passcore', ...params })
</script>

<!-- locale tells the meter to translate again -->
<PasswordStrengthMeter {password} {translate} locale={lang} label={labels[lang]} showPercent />`,
    },
    {
      id: 'events',
      title: 'demo.events.title',
      text: 'svelte.demo.events',
      demo: slot('events', 12),
      lang: 'svelte',
      code: `<script>
  let percent = $state(0)
</script>

<PasswordStrengthMeter {password} onscore={(value) => (percent = value)} />
<output>{percent}%</output>
<button type="submit" disabled={percent <= 75}>Send</button>`,
    },
    {
      id: 'group',
      title: 'demo.group.title',
      text: 'svelte.demo.group',
      demo: slot('group', 6.5),
      lang: 'svelte',
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
      title: 'demo.hook.svelte.title',
      text: 'svelte.demo.hook',
      demo: slot('hook', 19),
      lang: 'svelte',
      code: `<script>
  import { passwordStrength } from '@passcore/svelte'

  const strength = passwordStrength(() => password, () => ({
    rules: { uppercase: 1, numbers: 1, symbols: 1 },
  }))
</script>

<p data-level={strength.result.level}>{strength.text}</p>
<ul>
  {#each strength.result.rules as rule (rule.id)}
    <li data-passed={rule.passed}>{describe(rule)}</li>
  {/each}
</ul>`,
    },
    studioDemo(`<div class="slot" data-slot="theme" style="min-height: 6.5rem"></div>`),
  ],
}
