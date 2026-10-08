# @passcore/svelte

An accessible password strength meter for Svelte 5, built on [`@passcore/core`](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core/README.md). It ships a `<PasswordStrengthMeter>` component and a rune-based helper, `passwordStrength()`, to build your own markup.

[Try it in the playground](https://elboletaire.github.io/password-strength-meter/svelte.html).

```bash
pnpm add @passcore/svelte
```

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

The component is controlled: pass the password as a prop. The input is yours, so link it to the text with `aria-describedby` and the `id` prop.

## Markup

```html
<div class="pass-wrapper pass-level-weak">
  <div class="pass-meter" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="100" aria-valuenow="30" aria-valuetext="Weak password">
    <div class="pass-bar" style="width: 30%"></div>
  </div>
  <span class="pass-percent">30%</span>
  <span class="pass-text" id="password-strength" aria-live="polite">Weak password</span>
</div>
```

The wrapper has a `pass-level-*` class and, while the password is not valid (a rule fails), `pass-invalid`. The percent is only rendered with `showPercent`, and the text unless `showText` is `false`.

## Options

Props of the component. Core options (`targetBits`, `estimator`, `commonPasswords`, `rules`, `levels`) are props too, see the [`@passcore/core` README](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core/README.md#options). The [stability policy](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core/README.md#stability) says what can change in a minor release.

| Prop | Default | Description |
|---|---|---|
| `password` | | The password to evaluate (required). |
| `id` | | Id of the text element, for `aria-describedby`. |
| `class` | | Added to the wrapper. |
| `userInputs` | `[]` | Values the password must not contain (username, email...). |
| `translations` | `{}` | Texts in i18next's JSON format, merged over the English ones. |
| `locale` | `'en'` | Locale used to pick plural forms. |
| `translate` | | `(key, params) => string`, e.g. i18next's `t`. Replaces `translations` and `locale`. |
| `showPercent` | `false` | Show the percentage. |
| `showText` | `true` | Show the message. |
| `label` | `'Password strength'` | `aria-label` of the meter. |
| `onscore` | | `(percent, result)`, see [Callbacks](#callbacks). |
| `ontext` | | `(text, result)`, see [Callbacks](#callbacks). |

## Callbacks

```svelte
<PasswordStrengthMeter
  {password}
  onscore={(percent, result) => (canSubmit = percent > 75)}
  ontext={(text, result) => console.log(text)}
/>
```

`onscore` fires when the evaluated result changes (not on creation); `ontext` when the message (key or params) changes. A language change rewrites the text without firing `ontext`.

Neither fires on mount, and re-rendering with the same password does not fire them again.

## The helper

`passwordStrength()` evaluates a password with the same options (`PasswordStrengthOptions`: the core options plus `userInputs`, `translations`, `locale` and `translate`) and returns getters for the result and its texts. It is rune-based, so use it in a component or in a `.svelte.ts` module:

```ts
import { passwordStrength } from '@passcore/svelte'

let password = $state('')
const strength = passwordStrength(() => password, () => ({ userInputs: ['johndoe'] }))

strength.result   // the core result: percent, level, valid, rules, message
strength.text     // the translated message
strength.levelText // the translated level, for aria-valuetext
```

The core meter is memoized: it is recreated only when `targetBits`, `estimator`, `commonPasswords`, `rules` or `levels` change so typing does not prepare the word list again. `rules`, `levels` and `commonPasswords` are compared by value, so inline objects and arrays are fine; `estimator` is a function and is compared by identity.

## Translations

Texts use [i18next](https://www.i18next.com)'s JSON format: nested keys, `{{count}}` placeholders and plural forms. English is built in, and Spanish and Catalan ship with the package:

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

Import the default stylesheet once (`@passcore/svelte/styles.css`), then customize it with these custom properties, set on `.pass-wrapper` or any ancestor (e.g. `:root`):

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

## Requirements

Svelte 5 (`svelte@^5`). The package ships `.svelte` components and `.svelte.js` rune modules: your bundler must compile Svelte 5 files in `node_modules`, as Vite and SvelteKit do.
