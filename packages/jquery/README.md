# @passcore/jquery

An accessible password strength meter plugin for jQuery, built on [`@passcore/core`](../core).

```bash
pnpm add @passcore/jquery jquery
```

## Usage

With a bundler, importing the package registers `$.fn.password` on the `jquery` module:

```js
import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'

$('#password').password({ userInputs: ['#username', '#email'] })
```

If your page uses another jQuery instance, register the plugin on it with `install($)`.

Without a bundler, load the standalone build after jQuery. It bundles `@passcore/core` and expects a global `jQuery`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@passcore/jquery/dist/styles.css">
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@passcore/jquery/dist/password.min.js"></script>
```

The meter is appended to the input's closest `div` (see `closestSelector`):

```html
<div class="form-group">
  <label for="password">Password</label>
  <input id="password" type="password" class="form-control" />
</div>
```

## Options

```js
$('#password').password({
  // plugin
  userInputs: [],          // fields (selectors, elements or jQuery objects) the password must not contain, read on every keyup
  translations: {},        // texts in i18next's JSON format, merged over the English defaults (see Translations)
  locale: 'en',            // used to pick plural forms
  translate: undefined,    // (key, params) => string, e.g. i18next's t; replaces translations and locale
  showPercent: false,
  showText: true,
  animate: true,           // hide the meter until focus, and slide it in and out
  animateSpeed: 'fast',
  closestSelector: 'div',  // ancestor the meter is appended to

  // passed to @passcore/core
  targetBits: 100,
  estimator: undefined,
  commonWords: undefined,  // replaces the common-password list
  rules: { minLength: 8 }, // merged with the default rules
  levels: { strong: 80 },  // merged with the default levels
})
```

See the [`@passcore/core` README](../core#options) for the core options.

## Translations

Texts use [i18next](https://www.i18next.com)'s JSON format: nested keys, `{{count}}` placeholders and plural forms (`_one`, `_other`, plus `_many` and others where the language needs them). English is built in, and Spanish and Catalan ship with the package:

```js
import ca from '@passcore/jquery/locales/ca.json'

$('#password').password({ translations: ca, locale: 'ca' })
```

Override some texts by passing only those keys; the rest keep their defaults:

```js
$('#password').password({
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
import es from '@passcore/jquery/locales/es.json'

i18next.addResourceBundle('es', 'passcore', es)

$('#password').password({
  translate: (key, params) => i18next.t(key, { ns: 'passcore', ...params }),
})
```

The keys are `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.notCommon`, `rule.notUserInputs`, and the plural forms of `rule.minLength`, `rule.maxLength`, `rule.lowercase`, `rule.uppercase`, `rule.numbers` and `rule.symbols`. See [`locales/en.json`](../../locales/en.json) for the English texts.

Texts are inserted as text, not HTML.

## Events

```js
$('#password').on('password.score', (e, percent, result) => {
  // on every keyup; result is the @passcore/core result (level, valid, rules...)
})

$('#password').on('password.text', (e, text, result) => {
  // when the message changes (also when showText is false)
})
```

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

The input gets `aria-describedby` pointing to the text. The wrapper has a `pass-level-*` class and, while a rule fails, `pass-invalid`. The default stylesheet colors levels through custom properties you can set on any ancestor:

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

## Migrating from `password-strength-meter` 2.x/3.x and earlier @passcore/jquery versions

| Old option | Replacement |
|---|---|
| `enterPass` | `translations.empty` |
| `shortPass` | `translations.rule.minLength_one` / `minLength_other` |
| `containsField` | `translations.rule.notUserInputs` |
| `steps` | `levels` (thresholds) and `translations.level` (texts) |
| `minimumLength` | `rules.minLength` (default is now 8) |
| `field` | `userInputs: [field]` |
| `fieldPartialMatch` | removed: user inputs are always matched anywhere in the password |
| `useColorBarImage`, `customColorBarRGB` | removed: style levels with the CSS custom properties |
| `messages` (0.2) | `translations` (i18next JSON format, `{{count}}` placeholders) or `translate` |

The scores are different: the new estimate puts length first and is stricter with common patterns. `password.score` now receives the percent (0 to 100, never negative) and the full result, and `password.text` receives the text and the result.

## Compatibility

Tested with jQuery 3 and 4. The standalone build uses ES2015 syntax, but the core needs Unicode property escapes in regular expressions and `Intl.PluralRules`: every current browser, not Internet Explorer.
