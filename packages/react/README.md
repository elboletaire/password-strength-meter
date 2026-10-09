# @passcore/react

[![npm version](https://img.shields.io/npm/v/@passcore/react)](https://www.npmjs.com/package/@passcore/react)
[![npm downloads](https://img.shields.io/npm/dm/@passcore/react)](https://www.npmjs.com/package/@passcore/react)
[![CI](https://img.shields.io/github/actions/workflow/status/elboletaire/password-strength-meter/ci.yml?branch=master)](https://github.com/elboletaire/password-strength-meter/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@passcore/react)](https://bundlephobia.com/package/@passcore/react)
[![license](https://img.shields.io/npm/l/@passcore/react)](https://github.com/elboletaire/password-strength-meter/blob/master/LICENSE)
[![types](https://img.shields.io/npm/types/@passcore/react)](https://www.npmjs.com/package/@passcore/react)

An accessible password strength meter for React: a hook and a component, built on [`@passcore/core`](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core). Works with React 18 and 19.

[Live demo](https://elboletaire.github.io/password-strength-meter/react/) in the playground.

## Install

```bash
pnpm add @passcore/react
```

Requires React 18 or 19 (`react@^18 || ^19`). ESM and CommonJS builds, with TypeScript types.

## Usage

```tsx
import { PasswordStrengthMeter } from '@passcore/react'
import '@passcore/react/styles.css'
import { useState } from 'react'

export function SignUp() {
  const [password, setPassword] = useState('')

  return (
    <div className="form-group">
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        aria-describedby="password-strength"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordStrengthMeter id="password-strength" password={password} />
    </div>
  )
}
```

> [!NOTE]
> The input is controlled: the component receives the password as a prop and never listens to DOM events on the input. Link the input to the text with `aria-describedby` and the `id` prop.

The meter is rendered wherever you put it. The wrapper is a `div` with the `pass-wrapper` class. It renders fine on the server (`renderToString`), with no browser-only APIs involved.

### Hook

`usePasswordStrength(password, options?)` evaluates a password and returns `{ result, text, levelText }`: the core `result` (percent, level, validity, rules and message), the translated message and the translated level, for a custom UI:

```tsx
import { usePasswordStrength } from '@passcore/react'

function Strength({ password }: { password: string }) {
  const { result, text, levelText } = usePasswordStrength(password)
  return <p data-level={result.level} data-valid={result.valid}>{text} ({result.percent}%, {levelText})</p>
}
```

## Options

The hook takes the options in the first table. The component takes the same options plus the props in the second one.

| Option | Default | Description |
|---|---|---|
| `userInputs` | `[]` | Values the password must not contain (usernames, emails...). Pass the current values. |
| `translations` | `{}` | Texts in i18next's JSON format, deep-merged over the English ones (see [Translations](#translations)). |
| `locale` | `'en'` | Locale used to pick plural forms. |
| `translate` | `undefined` | `(key, params) => string`, e.g. i18next's `t`. Replaces `translations` and `locale`. |
| `targetBits` | `100` | Estimated bits that count as 100%. |
| `estimator` | `undefined` | `(password, userInputs) => bits`, replaces the built-in estimate. |
| `commonPasswords` | `undefined` | Common passwords, replacing the built-in list. |
| `rules` | `{ minLength: 8, ... }` | Rules, merged with the defaults (see the [`@passcore/core` README](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core#options)). |
| `levels` | `{ 'very-weak': 0, ... }` | Lower bound of each level, merged with the defaults. |

The component also takes these props:

| Prop | Default | Description |
|---|---|---|
| `password` | | The password to evaluate (required). |
| `id` | `undefined` | `id` of the text element, for `aria-describedby` on the input. |
| `className` | `undefined` | Added to the wrapper. |
| `showPercent` | `false` | Show the score percentage. |
| `showText` | `true` | Show the message. |
| `label` | `'Password strength'` | `aria-label` of the meter. |
| `onScore` | `undefined` | `(percent, result) => void`, see [Events](#events). |
| `onText` | `undefined` | `(text, result) => void`, see [Events](#events). |

> [!TIP]
> `rules`, `levels` and `commonPasswords` are compared by value, so inline objects and arrays are fine. `estimator` is a function and is compared by identity: define it outside the component, or memoize it, to avoid recreating the meter on every render.

## Events

`onScore` fires when the evaluated result changes (not on creation); `onText` fires when the message (key or params) changes. A language change rewrites the text without firing `onText`.

```tsx
<PasswordStrengthMeter
  password={password}
  onScore={(percent) => setCanSubmit(percent > 75)}
  onText={(text) => console.log(text)}
/>
```

`onText` is also called when `showText` is false, and neither is called on mount. StrictMode does not call them twice.

## Translations

Texts use [i18next](https://www.i18next.com)'s JSON format: nested keys, `{{count}}` placeholders and plural forms (`_one`, `_other`, plus `_many` and others where the language needs them). English is built in, and Spanish and Catalan ship with the package:

```tsx
import ca from '@passcore/react/locales/ca.json'

<PasswordStrengthMeter password={password} translations={ca} locale="ca" />
```

Override some texts by passing only those keys; the rest keep their defaults:

```tsx
<PasswordStrengthMeter
  password={password}
  translations={{
    rule: {
      minLength_one: 'At least {{count}} character, please',
      minLength_other: 'At least {{count}} characters, please',
    },
  }}
/>
```

If your app already uses i18next, load the files into a namespace and pass its `t`. With [react-i18next](https://react.i18next.com):

```tsx
import { useTranslation } from 'react-i18next'
import i18n from './i18n'
import es from '@passcore/react/locales/es.json'

i18n.addResourceBundle('es', 'passcore', es)

function PasswordField({ password }: { password: string }) {
  const { t, i18n: instance } = useTranslation('passcore')
  return (
    <PasswordStrengthMeter
      password={password}
      translate={(key, params) => t(key, params)}
      locale={instance.language}
    />
  )
}
```

When you use `translate`, pass the current language as `locale` too: changing `locale` refreshes the texts, even if your `translate` function keeps the same identity when the language changes.

The keys are `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.notCommon`, `rule.notUserInputs`, and the plural forms of `rule.minLength`, `rule.maxLength`, `rule.lowercase`, `rule.uppercase`, `rule.numbers` and `rule.symbols`. See [`locales/en.json`](https://github.com/elboletaire/password-strength-meter/blob/master/locales/en.json) for the English texts.

Texts are inserted as text, not HTML.

## Styling

Import the stylesheet once (`@passcore/react/styles.css`) and customize the meter with CSS custom properties, on `.pass-wrapper` or any ancestor (e.g. `:root`):

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

The markup, identical to `@passcore/jquery` and `@passcore/vanilla`, is:

```html
<div class="pass-wrapper pass-level-weak">
  <div class="pass-meter" role="meter" aria-label="Password strength" aria-valuemin="0"
       aria-valuemax="100" aria-valuenow="30" aria-valuetext="Weak password">
    <div class="pass-bar" style="width: 30%"></div>
  </div>
  <span class="pass-percent">30%</span>
  <span class="pass-text" id="password-strength" aria-live="polite">Weak password</span>
</div>
```

The wrapper has a `pass-level-<level>` class and `pass-invalid` while the password does not pass every rule (a weak password can still be valid, with the default rules). Add your own class with `className`.

The [`@passcore/core` stability policy](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core#stability) describes what may change in minor releases.
