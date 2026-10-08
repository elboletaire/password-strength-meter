# @passcore/react

An accessible password strength meter for React: a hook and a component, built on [`@passcore/core`](../core). Requires React 18 or later.

[Try it in the playground](https://elboletaire.github.io/password-strength-meter/react.html).

```bash
pnpm add @passcore/react
```

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

The input is controlled: the component receives the password as a prop and never listens to DOM events on the input. Link the input to the text with `aria-describedby` and the `id` prop.

The meter is rendered next to your input, wherever you put it. The wrapper is a `div` with the `pass-wrapper` class.

### Hook

`usePasswordStrength(password, options?)` evaluates a password and returns the core result with the translated texts, for a custom UI:

```tsx
import { usePasswordStrength } from '@passcore/react'

function Strength({ password }: { password: string }) {
  const { percent, level, valid, text, levelText } = usePasswordStrength(password)
  return <p data-level={level} data-valid={valid}>{text} ({percent}%, {levelText})</p>
}
```

## Options

Both the hook and the component take these options. The component also takes `id`, `className`, `onScore` and `onText`.

| Option | Default | Description |
|---|---|---|
| `userInputs` | `[]` | Values the password must not contain (usernames, emails...). Pass the current values. |
| `translations` | `{}` | Texts in i18next's JSON format, deep-merged over the English ones (see [Translations](#translations)). |
| `locale` | `'en'` | Locale used to pick plural forms. |
| `translate` | `undefined` | `(key, params) => string`, e.g. i18next's `t`. Replaces `translations` and `locale`. |
| `showPercent` | `false` | Show the score percentage. |
| `showText` | `true` | Show the message. |
| `label` | `'Password strength'` | `aria-label` of the meter. |
| `targetBits` | `100` | Estimated bits that count as 100%. |
| `estimator` | `undefined` | `(password, userInputs) => bits`, replaces the built-in estimate. |
| `commonWords` | `undefined` | Common passwords, replacing the built-in list. |
| `rules` | `{ minLength: 8, ... }` | Rules, merged with the defaults (see the [`@passcore/core` README](../core#options)). |
| `levels` | `{ 'very-weak': 0, ... }` | Lower bound of each level, merged with the defaults. |

`rules`, `levels` and `commonWords` are compared by value, so inline objects and arrays are fine. `estimator` is a function and is compared by identity: define it outside the component, or memoize it, to avoid recreating the meter on every render.

## Events

`onScore(percent, result)` is called whenever the evaluated result changes: when the password, the user inputs or the options change it. `onText(text, result)` is called only when the message changes (its key or params), also when `showText` is false. Neither is called on mount, and StrictMode does not call them twice.

```tsx
<PasswordStrengthMeter
  password={password}
  onScore={(percent) => setCanSubmit(percent > 75)}
  onText={(text) => console.log(text)}
/>
```

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

The keys are `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.notCommon`, `rule.notUserInputs`, and the plural forms of `rule.minLength`, `rule.maxLength`, `rule.lowercase`, `rule.uppercase`, `rule.numbers` and `rule.symbols`. See [`locales/en.json`](../../locales/en.json) for the English texts.

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

The markup, identical to `@passcore/jquery` and `@passcore/vanilla`, is:

```html
<div class="pass-wrapper pass-level-weak pass-invalid">
  <div class="pass-meter" role="meter" aria-label="Password strength" aria-valuemin="0"
       aria-valuemax="100" aria-valuenow="30" aria-valuetext="Weak password">
    <div class="pass-bar" style="width: 30%"></div>
  </div>
  <span class="pass-percent">30%</span>
  <span class="pass-text" id="password-strength" aria-live="polite">Weak password</span>
</div>
```

The wrapper has a `pass-level-<level>` class and `pass-invalid` while the password does not pass every rule. Add your own class with `className`.
