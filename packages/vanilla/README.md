# @passcore/vanilla

An accessible password strength meter for any page, with no framework and no jQuery: a function, and a `<password-meter>` custom element. Built on [`@passcore/core`](../core).

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
<password-meter for="password" min-length="10" show-percent user-inputs="#username,#email"></password-meter>
```

Without a bundler, load the standalone builds. They bundle `@passcore/core` and need no other dependency:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@passcore/vanilla/dist/styles.css">
<input type="password" id="password">
<script src="https://cdn.jsdelivr.net/npm/@passcore/vanilla/dist/passcore.min.js"></script>
<script>
  passcore.createPasswordMeter('#password', { showPercent: true })
</script>
```

`passcore-element.min.js` registers the `<password-meter>` element instead (it doesn't expose `createPasswordMeter`). Load the one you need.

## Options

```js
createPasswordMeter(input, {
  // meter
  userInputs: [],          // fields the password must not contain: selectors, elements or functions, read on every evaluation
  container: undefined,    // selector or element to append the markup to (default: right after the input)
  hideUntilFocus: false,   // hide the meter until the input is focused, and again on blur when it is empty
  showPercent: false,
  showText: true,          // the message, linked to the input with aria-describedby
  label: 'Password strength', // aria-label of the meter
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
  commonWords: undefined,  // replaces the common-password list
  rules: { minLength: 8 }, // merged with the default rules
  levels: { strong: 80 },  // merged with the default levels
})
```

See the [`@passcore/core` README](../core#options) for the core options.

A string in `userInputs` is a **selector**, not a value (unlike in the React, Vue and Svelte packages, which take values). To pass a value, use a function: `userInputs: [() => user.email]`. An invalid selector throws when the meter is created.

It returns an object with:

- `result`: the last evaluation (the core result, with `percent`, `level`, `valid`, `rules` and `message`).
- `refresh()`: evaluates the input again and renders it, e.g. after a user input changed. Returns the result. It fires the callbacks and events, like typing does.
- `focus()` and `blur()`: what the focus and blur listeners do, for `hideUntilFocus`.
- `destroy()`: removes the markup and the listeners, and restores `aria-describedby`.

### The custom element

`<password-meter>` takes the simple options as attributes:

| Attribute | Option |
|---|---|
| `for` | id of the input (required) |
| `min-length`, `max-length` | `rules.minLength`, `rules.maxLength` |
| `target-bits` | `targetBits` |
| `show-percent` | `showPercent` |
| `hide-text` | `showText: false` |
| `hide-until-focus` | `hideUntilFocus` |
| `locale` | `locale` |
| `label` | `label` |
| `user-inputs` | `userInputs`, as comma-separated selectors |

Anything else goes in the `options` property, which is merged over the attributes (it also works when it is set before the element's script has loaded):

```js
document.querySelector('password-meter').options = {
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
    // on every update
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

The keys are `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.notCommon`, `rule.notUserInputs`, and the plural forms of `rule.minLength`, `rule.maxLength`, `rule.lowercase`, `rule.uppercase`, `rule.numbers` and `rule.symbols`. See [`locales/en.json`](../../locales/en.json) for the English texts.

Texts are inserted as text, not HTML.

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

The input gets `aria-describedby` pointing to the text (the id is `<input id>-strength`, or a generated one for inputs without an id). The wrapper has a `pass-level-*` class and, while a rule fails, `pass-invalid`. With `hideUntilFocus`, the wrapper has `pass-hidden` while hidden, and the container (or the input's parent) has `pass-strength-visible` while the meter is shown.

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

## Compatibility

The standalone builds use ES2015 syntax, but the core needs Unicode property escapes in regular expressions and `Intl.PluralRules`: every current browser, not Internet Explorer. The `<password-meter>` element also needs custom elements support.
