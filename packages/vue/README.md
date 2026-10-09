# @passcore/vue

[![npm version](https://img.shields.io/npm/v/@passcore/vue)](https://www.npmjs.com/package/@passcore/vue)
[![npm downloads](https://img.shields.io/npm/dm/@passcore/vue)](https://www.npmjs.com/package/@passcore/vue)
[![CI](https://img.shields.io/github/actions/workflow/status/elboletaire/password-strength-meter/ci.yml?branch=master)](https://github.com/elboletaire/password-strength-meter/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@passcore/vue)](https://bundlephobia.com/package/@passcore/vue)
[![license](https://img.shields.io/npm/l/@passcore/vue)](https://github.com/elboletaire/password-strength-meter/blob/master/LICENSE)
[![types](https://img.shields.io/npm/types/@passcore/vue)](https://www.npmjs.com/package/@passcore/vue)

An accessible password strength meter for Vue 3, built on [`@passcore/core`](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core): a composable (`usePasswordStrength`) and a component (`PasswordStrengthMeter`).

[Live demo](https://elboletaire.github.io/password-strength-meter/vue/) in the playground.

## Install

```bash
pnpm add @passcore/vue
```

Requires Vue 3.5 or later (`vue@^3.5`). ESM and CommonJS builds, with TypeScript types.

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

> [!NOTE]
> The component is a plain render function (no SFC compiler needed), so it works in any Vue setup. Its root element is a `div.pass-wrapper`; `class` and other attributes are added to it. Link the input to the text with `aria-describedby` and the `id` prop.

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

The composable takes the options in the first table as its second argument. The component takes the same options as props, plus the ones in the second table.

| Option | Default | Description |
|---|---|---|
| `userInputs` | `[]` | Values the password must not contain (usernames, emails...), e.g. `['johndoe']`. |
| `translations` | `{}` | Texts in i18next's JSON format, merged over the English ones (see [Translations](#translations)). |
| `locale` | `'en'` | Locale used to pick plural forms. |
| `translate` | `undefined` | `(key, params) => string`, e.g. i18next's `t`. Replaces `translations` and `locale`. |
| `targetBits` | `100` | Estimated bits that count as 100%. |
| `estimator` | `undefined` | `(password, userInputs) => bits`, replaces the built-in estimate. |
| `commonPasswords` | `undefined` | Common passwords, replacing the built-in list. |
| `rules` | `{ minLength: 8, ... }` | Rules, merged with the defaults (see the [`@passcore/core` README](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core#options)). |
| `levels` | `{ 'very-weak': 0, ... }` | Lower bound of each level, merged with the defaults (e.g. `{ strong: 80 }`). |

The component also takes these props:

| Prop | Default | Description |
|---|---|---|
| `password` | | The password to evaluate (required, a string). |
| `id` | `undefined` | `id` of the text element, for `aria-describedby` on the input. |
| `showPercent` | `false` | Show the score percentage. |
| `showText` | `true` | Show the message. |
| `label` | `'Password strength'` | `aria-label` of the meter. |

Core options are memoized: the meter is only recreated when `targetBits`, `estimator`, `commonPasswords`, `rules` or `levels` change, so typing does not rebuild the word list.

> [!TIP]
> `rules`, `levels` and `commonPasswords` are compared by value, so inline objects and arrays are fine. `estimator` is a function and is compared by identity, so define it outside the template.

See the [`@passcore/core` stability section](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core#stability) for what may change in minor releases.

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

## Styling

Import the stylesheet once (`@passcore/vue/styles.css`) and customize the meter with CSS custom properties, on `.pass-wrapper` or any ancestor (e.g. `:root`):

| Property | Default | Applies to |
|---|---|---|
| `--pass-height` | `4px` | Height of the bar |
| `--pass-track` | `#e5e7eb` | Background of the bar |
| `--pass-color-very-weak` | `#dc2626` | Bar color, very weak level |
| `--pass-color-weak` | `#ea580c` | Bar color, weak level |
| `--pass-color-fair` | `#ca8a04` | Bar color, fair level |
| `--pass-color-good` | `#65a30d` | Bar color, good level |
| `--pass-color-strong` | `#16a34a` | Bar color, strong level |

```css
:root {
  --pass-height: 6px;
  --pass-color-strong: #0d9488;
}
```

The stylesheet also follows the forced colors mode: in Windows High Contrast and similar modes, the meter gets a border and the bar uses the system highlight color.

The markup, identical to the other `@passcore/*` packages, is:

```html
<div class="pass-wrapper pass-level-weak">
  <div class="pass-meter" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="100" aria-valuenow="30" aria-valuetext="Weak password">
    <div class="pass-bar" style="width: 30%"></div>
  </div>
  <span class="pass-percent">30%</span>
  <span class="pass-text" id="password-strength" aria-live="polite">Weak password</span>
</div>
```

The wrapper has a `pass-level-<level>` class and, while a rule fails, `pass-invalid`. The percent is only rendered with `showPercent`, and the text unless `showText` is `false`.
