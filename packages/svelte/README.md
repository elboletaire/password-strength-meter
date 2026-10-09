# @passcore/svelte

[![npm version](https://img.shields.io/npm/v/@passcore/svelte)](https://www.npmjs.com/package/@passcore/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@passcore/svelte)](https://www.npmjs.com/package/@passcore/svelte)
[![CI](https://img.shields.io/github/actions/workflow/status/elboletaire/password-strength-meter/ci.yml?branch=master)](https://github.com/elboletaire/password-strength-meter/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@passcore/svelte)](https://bundlephobia.com/package/@passcore/svelte)
[![license](https://img.shields.io/npm/l/@passcore/svelte)](https://github.com/elboletaire/password-strength-meter/blob/master/LICENSE)
[![types](https://img.shields.io/npm/types/@passcore/svelte)](https://www.npmjs.com/package/@passcore/svelte)

An accessible password strength meter for Svelte 5, built on [`@passcore/core`](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core). It ships a `<PasswordStrengthMeter>` component and a rune-based helper, `passwordStrength()`, to build your own markup.

[Live demo](https://elboletaire.github.io/password-strength-meter/svelte/) in the playground.

## Install

```bash
pnpm add @passcore/svelte
```

Requires Svelte 5 (`svelte@^5`). The package ships `.svelte` components and `.svelte.js` rune modules, so your bundler must compile Svelte 5 files in `node_modules`, as Vite and SvelteKit do.

## Usage

```svelte
<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import '@passcore/svelte/styles.css'

  let password = $state('')
</script>

<label for="password">Password</label>
<input id="password" type="password" bind:value={password} aria-describedby="password-strength" />
<PasswordStrengthMeter {password} id="password-strength" userInputs={['johndoe']} />
```

> [!NOTE]
> The component is controlled: pass the password as a prop. The input is yours, so link it to the text with `aria-describedby` and the `id` prop.

### Helper

`passwordStrength(getPassword, getOptions?)` evaluates a password and returns getters for `result`, `text` and `levelText`: the core result (percent, level, validity, rules and message), the translated message and the translated level, for a custom UI. Both arguments are getters, so the helper follows your state. It is rune-based, so use it in a component or in a `.svelte.ts` module:

```ts
import { passwordStrength } from '@passcore/svelte'

let password = $state('')
const strength = passwordStrength(() => password, () => ({ userInputs: ['johndoe'] }))

strength.result   // the core result: percent, level, valid, rules, message
strength.text     // the translated message
strength.levelText // the translated level, for aria-valuetext
```

## Options

The helper takes the options in the first table (`PasswordStrengthOptions`). The component takes the same options as props, plus the ones in the second table.

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
| `password` | | The password to evaluate (required). |
| `id` | `undefined` | `id` of the text element, for `aria-describedby` on the input. |
| `class` | `undefined` | Added to the wrapper. |
| `showPercent` | `false` | Show the score percentage. |
| `showText` | `true` | Show the message. |
| `label` | `'Password strength'` | `aria-label` of the meter. |
| `onscore` | `undefined` | `(percent, result) => void`, see [Events](#events). |
| `ontext` | `undefined` | `(text, result) => void`, see [Events](#events). |

Core options are memoized: the meter is only recreated when `targetBits`, `estimator`, `commonPasswords`, `rules` or `levels` change, so typing does not rebuild the word list.

> [!TIP]
> `rules`, `levels` and `commonPasswords` are compared by value, so inline objects and arrays are fine. `estimator` is a function and is compared by identity, so define it outside the markup.

See the [`@passcore/core` stability section](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core#stability) for what may change in minor releases.

## Events

The component takes callback props, Svelte 5's replacement for component events:

```svelte
<PasswordStrengthMeter
  {password}
  onscore={(percent, result) => (canSubmit = percent > 75)}
  ontext={(text, result) => console.log(text)}
/>
```

`onscore` fires when the evaluated result changes (not on mount); `ontext` when the message (key or params) changes. A language change rewrites the text without firing `ontext`. Re-rendering with the same password does not fire them again.

## Translations

Texts use [i18next](https://www.i18next.com)'s JSON format: nested keys, `{{count}}` placeholders and plural forms (`_one`, `_other`, plus `_many` and others where the language needs them). English is built in, and Spanish and Catalan ship with the package:

```svelte
<script lang="ts">
  import ca from '@passcore/svelte/locales/ca.json'
</script>

<PasswordStrengthMeter {password} translations={ca} locale="ca" />
```

Override some texts by passing only those keys; the rest keep their defaults:

```svelte
<PasswordStrengthMeter
  {password}
  translations={{ rule: { minLength_one: 'At least {{count}} character, please', minLength_other: 'At least {{count}} characters, please' } }}
/>
```

If your app already uses i18next, load the files into a namespace and pass its `t`:

```ts
import i18next from 'i18next'
import es from '@passcore/svelte/locales/es.json'

i18next.addResourceBundle('es', 'passcore', es)
```

```svelte
<PasswordStrengthMeter
  {password}
  translate={(key, params) => i18next.t(key, { ns: 'passcore', ...params })}
  locale={language}
/>
```

Here `language` is a piece of state that holds the current language (set it in `i18next.on('languageChanged', ...)`).

When you use `translate`, pass the current language as `locale` too: changing `locale` refreshes the texts, even if your `translate` function keeps the same identity when the language changes.

The keys are `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.notCommon`, `rule.notUserInputs`, and the plural forms of `rule.minLength`, `rule.maxLength`, `rule.lowercase`, `rule.uppercase`, `rule.numbers` and `rule.symbols`. See [`locales/en.json`](https://github.com/elboletaire/password-strength-meter/blob/master/locales/en.json) for the English texts.

Texts are inserted as text, not HTML.

## Styling

Import the stylesheet once (`@passcore/svelte/styles.css`) and customize the meter with CSS custom properties, on `.pass-wrapper` or any ancestor (e.g. `:root`):

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
