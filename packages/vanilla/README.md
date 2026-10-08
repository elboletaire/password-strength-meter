# @passcore/vanilla

[![npm version](https://img.shields.io/npm/v/@passcore/vanilla)](https://www.npmjs.com/package/@passcore/vanilla)
[![npm downloads](https://img.shields.io/npm/dm/@passcore/vanilla)](https://www.npmjs.com/package/@passcore/vanilla)
[![CI](https://img.shields.io/github/actions/workflow/status/elboletaire/password-strength-meter/ci.yml?branch=master)](https://github.com/elboletaire/password-strength-meter/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@passcore/vanilla)](https://bundlephobia.com/package/@passcore/vanilla)
[![license](https://img.shields.io/npm/l/@passcore/vanilla)](https://github.com/elboletaire/password-strength-meter/blob/master/LICENSE)
[![types](https://img.shields.io/npm/types/@passcore/vanilla)](https://www.npmjs.com/package/@passcore/vanilla)

An accessible password strength meter for any page, with no framework and no jQuery: a function, and a `<passcore-meter>` custom element. Built on [`@passcore/core`](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core/README.md).

[Live demo](https://elboletaire.github.io/password-strength-meter/vanilla/) in the playground.

- Two ways in: `createPasswordMeter()` or a `<passcore-meter>` element.
- Accessible: a `role="meter"` bar and a polite live-region message linked to the input.
- Translated: English, Spanish and Catalan included, or bring your own `translate` (i18next works out of the box).
- Themeable with CSS custom properties, no images. Standalone builds need no other dependency.

```bash
pnpm add @passcore/vanilla
```

## Usage

With a bundler, call `createPasswordMeter` with the input (a selector or the element):

```js
import { createPasswordMeter } from '@passcore/vanilla'
import '@passcore/vanilla/styles.css'

const meter = createPasswordMeter('#password', { userInputs: ['#username', '#email'] })
```

The meter is inserted right after the input. Use `container` to append it somewhere else (a selector or an element).

Or use the custom element, which renders the meter where you put it:

```js
import '@passcore/vanilla/element'
```

```html
<input type="password" id="password">
<passcore-meter for="password" min-length="10" show-percent user-inputs="#username, #email"></passcore-meter>
```

Without a bundler, load the standalone builds. They bundle `@passcore/core` and need no other dependency:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@passcore/vanilla@1/dist/styles.css">
<input type="password" id="password">
<script src="https://cdn.jsdelivr.net/npm/@passcore/vanilla@1/dist/passcore.min.js"></script>
<script>
  passcore.createPasswordMeter('#password', { showPercent: true })
</script>
```

The standalone builds expose these globals:

- `passcore` (from `passcore.min.js`): `createPasswordMeter`.
- `passcoreElement` (from `passcore-element.min.js`): the `PasscoreMeterElement` class. The script registers the `<passcore-meter>` element when it loads, so you don't need to use the global. Load the one you need.

## Options

```js
createPasswordMeter(input, {
  // meter
  userInputs: [],          // fields the password must not contain: selectors (every match is read), elements or functions, read on every evaluation
  container: undefined,    // selector or element to append the markup to (default: right after the input)
  hideUntilFocus: false,   // hide the meter until the input is focused, and again on blur when it is empty
  showPercent: false,
  showText: true,          // the message, linked to the input with aria-describedby
  label: 'Password strength', // aria-label of the meter, read at creation
  listen: true,            // listen to the input, focus and blur events (set false and call refresh() yourself)

  // texts
  translations: {},        // texts in i18next's JSON format, merged over the English defaults (see Translations)
  locale: 'en',            // used to pick plural forms
  translate: undefined,    // (key, params) => string, e.g. i18next's t; replaces translations and locale

  // callbacks (see Events)
  onScore: undefined,      // (percent, result) => void
  onText: undefined,       // (text, result) => void

  // passed to @passcore/core
  targetBits: 100,
  estimator: undefined,
  commonPasswords: undefined, // replaces the common-password list
  rules: { minLength: 8 },    // merged with the default rules
  levels: { strong: 80 },     // merged with the default levels
})
```

See the [`@passcore/core` README](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core/README.md#options) for the core options, and its [stability section](https://github.com/elboletaire/password-strength-meter/blob/master/packages/core/README.md#stability) for what may change in minor releases.

> [!IMPORTANT]
> A string in `userInputs` is a **selector**, not a value (unlike in the React, Vue and Svelte packages, which take values). Every element matching it contributes its value, so `'#username, #email'` works too. To pass a value, use a function: `userInputs: [() => user.email]`. An invalid selector throws when the meter is created.

It returns an object with:

- `result`: the last evaluation (the core result, with `percent`, `level`, `valid`, `rules` and `message`).
- `refresh()`: evaluates the input again and renders it, e.g. after a user input changed. Returns the result. It fires the callbacks and events when the result or the message changes, like typing does.
- `focus()` and `blur()`: what the focus and blur listeners do, for `hideUntilFocus`.
- `destroy()`: removes the markup and the listeners, and restores `aria-describedby`.

### The custom element

`<passcore-meter>` takes the simple options as attributes:

| Attribute | Option |
|---|---|
| `for` | id of the input (required) |
| `min-length`, `max-length` | `rules.minLength`, `rules.maxLength` |
| `target-bits` | `targetBits` |
| `show-percent` | `showPercent` |
| `hide-text` | `showText: false` |
| `hide-until-focus` | `hideUntilFocus` |
| `locale` | `locale` |
| `label` | `label`, read when the meter is created |
| `user-inputs` | `userInputs`, as one selector list, e.g. `"#username, #email"` (not split on commas) |

Anything else goes in the `options` property, which is merged over the attributes (it also works when it is set before the element's script has loaded):

```js
document.querySelector('passcore-meter').options = {
  translations: ca,
  rules: { numbers: 1 },
}
```

The meter is rebuilt when an attribute or `options` changes, and removed when the element is disconnected. The element renders in the light DOM, so your CSS applies to it.

## Events and callbacks

Callbacks and events fire on updates after the meter is created (typing, pasting, autofill, `refresh()`), not on creation:

```js
createPasswordMeter('#password', {
  onScore: (percent, result) => {
    // when the result changes
  },
  onText: (text, result) => {
    // when the message changes (also when showText is false)
  },
})

document.querySelector('#password').addEventListener('passcore:score', (event) => {
  const { percent, result } = event.detail
})

document.querySelector('#password').addEventListener('passcore:text', (event) => {
  const { text, result } = event.detail
})
```

`onScore` fires when the evaluated result changes (not on creation); `onText` when the message (key or params) changes. A language change rewrites the text without firing `onText`.

The events bubble and are dispatched on the input.

## Translations

Texts use [i18next](https://www.i18next.com)'s JSON format: nested keys, `{{count}}` placeholders and plural forms (`_one`, `_other`, plus `_many` and others where the language needs them). English is built in, and Spanish and Catalan ship with the package:

```js
import ca from '@passcore/vanilla/locales/ca.json'

createPasswordMeter('#password', { translations: ca, locale: 'ca' })
```

Override some texts by passing only those keys; the rest keep their defaults:

```js
createPasswordMeter('#password', {
  translations: {
    rule: {
      minLength_one: 'At least {{count}} character, please',
      minLength_other: 'At least {{count}} characters, please',
    },
  },
})
```

If your app already uses i18next, load the files into a namespace and pass its `t`:

```js
import i18next from 'i18next'
import es from '@passcore/vanilla/locales/es.json'

i18next.addResourceBundle('es', 'passcore', es)

const meter = createPasswordMeter('#password', {
  translate: (key, params) => i18next.t(key, { ns: 'passcore', ...params }),
})

// the texts are translated on every update: refresh them when the language changes
i18next.on('languageChanged', () => meter.refresh())
```

The keys are `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.notCommon`, `rule.notUserInputs`, and the plural forms of `rule.minLength`, `rule.maxLength`, `rule.lowercase`, `rule.uppercase`, `rule.numbers` and `rule.symbols`. See [`locales/en.json`](https://github.com/elboletaire/password-strength-meter/blob/master/locales/en.json) for the English texts.

Texts are inserted as text, not HTML.

## Markup and styling

```html
<div class="pass-wrapper pass-level-very-weak pass-invalid">
  <div class="pass-meter" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="100" aria-valuenow="7" aria-valuetext="Very weak password">
    <div class="pass-bar" style="width: 7%"></div>
  </div>
  <span class="pass-percent">7%</span>
  <span class="pass-text" id="password-strength" aria-live="polite">Use at least 8 characters</span>
</div>
```

The input gets `aria-describedby` pointing to the text (the id is `<input id>-strength`, or a generated one for inputs without an id). The wrapper has a `pass-level-*` class and, while a rule fails, `pass-invalid`. With `hideUntilFocus`, the wrapper has `pass-hidden` while hidden. The container (or the input's parent) always has `pass-strength-visible` while the meter is shown, which is always, unless `hideUntilFocus` hides it.

The default stylesheet colors levels through custom properties you can set on any ancestor:

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

In forced colors mode (for example Windows high contrast), the meter gets a system border and the bar uses the system highlight color.

## Compatibility

The standalone builds use ES2015 syntax, but the core needs Unicode property escapes in regular expressions and `Intl.PluralRules`: every current browser, not Internet Explorer. The `<passcore-meter>` element also needs custom elements support.

## Third-party data

The standalone builds include a list of common passwords from [SecLists](https://github.com/danielmiessler/SecLists), MIT License, Copyright (c) 2018 Daniel Miessler.
