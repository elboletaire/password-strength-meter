# password-strength-meter

> **This package is now a compatibility wrapper around [`@passcore/jquery`](https://www.npmjs.com/package/@passcore/jquery).** New projects should install `@passcore/jquery` directly.

Version 3 re-exports `@passcore/jquery` and keeps the 2.x files at the same paths, so existing imports and CDN links keep working:

- `dist/password.min.js`: standalone build, expects a global `jQuery`
- `dist/password.min.css`
- `dist/passwordstrength.jpg`

```js
import 'password-strength-meter' // registers $.fn.password

$('#password').password({ /* options */ })
```

Options and events are unchanged. See the [`@passcore/jquery` README](https://github.com/elboletaire/password-strength-meter/tree/master/packages/jquery#readme).

## Upgrading from 2.x

- The plugin is attached with `.on('keyup')`, `.on('focus')` and `.on('blur')`, and is tested with jQuery 3 and 4.
- A `field` selector matching no element is treated as an empty field instead of throwing.
- The standalone build targets ES2015: Internet Explorer is no longer supported.
- Bower is no longer supported.
