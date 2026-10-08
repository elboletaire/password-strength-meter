# @passcore/jquery

A password strength meter plugin for jQuery, built on [`@passcore/core`](../core).

```bash
pnpm add @passcore/jquery jquery
```

## Usage

With a bundler, importing the package registers `$.fn.password` on the `jquery` module:

```js
import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'

$('#password').password({ /* options */ })
```

If your page uses another jQuery instance, register the plugin on it with `install($)`.

Without a bundler, load the standalone build after jQuery. It bundles `@passcore/core` and expects a global `jQuery`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@passcore/jquery/dist/styles.css">
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@passcore/jquery/dist/password.min.js"></script>
```

The meter is appended to the input's closest `div` (see `closestSelector`), so wrap the input in one:

```html
<div class="form-group">
  <label for="password">Password</label>
  <input id="password" type="password" class="form-control" />
</div>
```

## Options

```js
$('#password').password({
  enterPass: 'Type your password',
  shortPass: 'The password is too short',
  containsField: 'The password contains your username',
  steps: {
    // the message of the highest step below the score is shown
    13: 'Really insecure password',
    33: 'Weak; try combining letters & numbers',
    67: 'Medium; try using special characters',
    94: 'Strong password',
  },
  showPercent: false,
  showText: true, // show the text tips
  animate: true, // hide the meter until focus, and slide it in and out
  animateSpeed: 'fast',
  field: false, // field (selector, element or jQuery object) the password must not match, e.g. the username
  fieldPartialMatch: true, // also reject passwords containing the field value
  minimumLength: 4, // below this length the score is -1
  closestSelector: 'div', // ancestor the meter is appended to
  useColorBarImage: false, // use the legacy color bar image instead of a computed color
  customColorBarRGB: {
    red: [0, 240],
    green: [0, 240],
    blue: 10,
  },
})
```

`customColorBarRGB` takes `[min, max]` ranges for red and green, and a single base value for blue.

Texts are inserted as HTML.

## Events

```js
$('#password').on('password.score', (e, score) => {
  // on every keyup: -1 (too short), -2 (contains the field value) or 0 to 100
})

$('#password').on('password.text', (e, text, score) => {
  // only when the displayed text changes
})
```

## Compatibility

Tested with jQuery 3 and 4. The standalone build targets ES2015, so Internet Explorer is no longer supported.
