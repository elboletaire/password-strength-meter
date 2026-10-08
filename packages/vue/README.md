# @passcore/vue

An accessible password strength meter for Vue 3, built on [`@passcore/core`](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core): a composable (`usePasswordStrength`) and a component (`PasswordStrengthMeter`).

[Try it in the playground](https://elboletaire.github.io/password-strength-meter/vue.html).

```bash
pnpm add @passcore/vue
```

Requires Vue 3.5 or later.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PasswordStrengthMeter } from '@passcore/vue'
import '@passcore/vue/styles.css'

const password = ref('')
</script>

<template>
  <label for="password">Password</label>
  <input id="password" v-model="password" type="password" aria-describedby="password-strength">
  <PasswordStrengthMeter id="password-strength" :password="password" />
</template>
```

The component is a plain render function (no SFC compiler needed), so it works in any Vue setup. Its root element is a `div.pass-wrapper`; `class` and other attributes are added to it.

### Composable

`usePasswordStrength` evaluates a password and returns computed refs, for your own markup:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePasswordStrength } from '@passcore/vue'

const password = ref('')
const { result, text, levelText } = usePasswordStrength(password, { rules: { minLength: 10 } })
const canSubmit = computed(() => result.value.percent > 75)
</script>
```

The first argument takes a ref, a getter or a plain string; the options take the same forms (`MaybeRefOrGetter`). `result` is the `@passcore/core` result, `text` the translated message and `levelText` the translated level (for `aria-valuetext`).

## Options

The component takes them as props, and the composable as its second argument:

```ts
{
  // binding
  userInputs: [],          // values the password must not contain (username, email...), e.g. ['johndoe']
  translations: {},        // texts in i18next's JSON format, merged over the English defaults (see Translations)
  locale: 'en',            // used to pick plural forms
  translate: undefined,    // (key, params) => string, e.g. i18next's t; replaces translations and locale
  showPercent: false,      // component only: render the percentage
  showText: true,          // component only: render the message
  label: 'Password strength', // component only: aria-label of the meter

  // passed to @passcore/core
  targetBits: 100,
  estimator: undefined,
  commonPasswords: undefined, // replaces the common-password list
  rules: { minLength: 8 }, // merged with the default rules
  levels: { strong: 80 },  // merged with the default levels
}
```

The component also takes `password` (required, a string) and `id`, the id of the text element for `aria-describedby`.

Core options are memoized: the meter is only recreated when `targetBits`, `estimator`, `commonPasswords`, `rules` or `levels` change, so typing does not rebuild the word list. `rules`, `levels` and `commonPasswords` are compared by value, so inline objects and arrays are fine; `estimator` is a function and is compared by identity, so define it outside the template.

See the [`@passcore/core` README](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core#options) for the core options, and its [stability section](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core#stability) for what may change in minor releases.

## Events

The component emits events when the evaluated result changes:

```vue
<PasswordStrengthMeter
  :password="password"
  @score="(percent, result) => canSubmit = percent > 75"
  @text="(text, result) => console.log(text)"
/>
```

- `score(percent, result)` fires when the evaluated result changes (not on mount), whether the password, the user inputs or the options changed it.
- `text(text, result)` fires when the message (key or params) changes, not on every keystroke. A language change rewrites the text without emitting `text`.

## Translations

Texts use [i18next](https://www.i18next.com)'s JSON format: nested keys, `{{count}}` placeholders and plural forms (`_one`, `_other`, plus `_many` and others where the language needs them). English is built in, and Spanish and Catalan ship with the package:

```ts
import ca from '@passcore/vue/locales/ca.json'
```

```vue
<PasswordStrengthMeter :password="password" :translations="ca" locale="ca" />
```

Override some texts by passing only those keys; the rest keep their defaults:

```ts
const translations = {
  rule: {
    minLength_one: 'At least {{count}} character, please',
    minLength_other: 'At least {{count}} characters, please',
  },
}
```

The keys are `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.notCommon`, `rule.notUserInputs`, and the plural forms of `rule.minLength`, `rule.maxLength`, `rule.lowercase`, `rule.uppercase`, `rule.numbers` and `rule.symbols`. See [`locales/en.json`](https://github.com/elboletaire/password-strength-meter/blob/master/locales/en.json) for the English texts.

Texts are inserted as text, not HTML.

### vue-i18n

[vue-i18n](https://vue-i18n.intlify.dev) has its own message format, so it can't read the JSON files directly. Store the messages under a `passcore` key in your own locale messages, written in vue-i18n's syntax (`{count}` placeholders and `|` plural forms instead of `_one`/`_other` keys):

```ts
const messages = {
  en: {
    passcore: {
      empty: 'Type your password',
      level: { 'very-weak': 'Very weak password', weak: 'Weak password', fair: 'Fair password', good: 'Good password', strong: 'Strong password' },
      rule: {
        minLength: 'Use at least {count} character | Use at least {count} characters',
        numbers: 'Add a number | Add at least {count} numbers',
        notCommon: 'This password is too common',
        // …and the rest of the rule keys, see locales/en.json
      },
    },
  },
}
```

Then pass its `t` as `translate`:

```ts
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const translate = (key: string, params: Record<string, number> = {}) =>
  params.count === undefined
    ? t(`passcore.${key}`, params)
    : t(`passcore.${key}`, params, params.count)
```

```vue
<PasswordStrengthMeter :password="password" :translate="translate" :locale="locale" />
```

(`locale` comes from `useI18n()`.)

When you use `translate`, pass the current language as `locale` too: changing `locale` refreshes the texts, even if your `translate` function keeps the same identity when the language changes.

## Markup and styling

```html
<div class="pass-wrapper pass-level-weak pass-invalid">
  <div class="pass-meter" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="100" aria-valuenow="30" aria-valuetext="Weak password">
    <div class="pass-bar" style="width: 30%"></div>
  </div>
  <span class="pass-percent">30%</span>
  <span class="pass-text" id="password-strength" aria-live="polite">Use at least 8 characters</span>
</div>
```

The wrapper has a `pass-level-*` class and, while a rule fails, `pass-invalid`. Link the input to the text with `aria-describedby`, as in the usage example. The stylesheet (`@passcore/vue/styles.css`) colors levels through custom properties you can set on any ancestor:

```css
:root {
  --pass-height: 6px;
  --pass-track: #eee;
  --pass-color-very-weak: #b91c1c;
  --pass-color-weak: #c2410c;
  --pass-color-fair: #a16207;
  --pass-color-good: #4d7c0f;
  --pass-color-strong: #15803d;
}
```
