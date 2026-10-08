# @passcore/core

[![npm version](https://img.shields.io/npm/v/@passcore/core)](https://www.npmjs.com/package/@passcore/core)
[![npm downloads](https://img.shields.io/npm/dm/@passcore/core)](https://www.npmjs.com/package/@passcore/core)
[![CI](https://img.shields.io/github/actions/workflow/status/elboletaire/password-strength-meter/ci.yml?branch=master)](https://github.com/elboletaire/password-strength-meter/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@passcore/core)](https://bundlephobia.com/package/@passcore/core)
[![license](https://img.shields.io/npm/l/@passcore/core)](https://github.com/elboletaire/password-strength-meter/blob/master/LICENSE)
[![types](https://img.shields.io/npm/types/@passcore/core)](https://www.npmjs.com/package/@passcore/core)

Framework-agnostic password strength estimation and rules. It has no dependencies, no DOM access and no texts: it returns data and message keys that bindings render and translate.

- **Length first:** repeats, sequences, keyboard runs, common passwords and personal details are discounted.
- **Rules apart from strength:** minimum length, character types and more are reported on their own.
- **Server and browser:** ESM and CommonJS builds, fully typed, safe to run anywhere.

[Try it in the playground](https://elboletaire.github.io/password-strength-meter/inspector/) or see the [other packages](https://github.com/elboletaire/password-strength-meter#packages) (React, Vue, Svelte, jQuery and vanilla JS) that render a ready-made meter on top of this one.

```bash
pnpm add @passcore/core   # or npm install / yarn add
```

## Usage

```ts
import { createMeter } from '@passcore/core'

const meter = createMeter({ rules: { minLength: 10 } })
const result = meter.evaluate('correct horse battery staple', ['johndoe', 'john@example.com'])
```

Use `createMeter()` when evaluating repeatedly (on every keystroke): it resolves the options and prepares the word list once. `meter.evaluate(password, userInputs)` is pure: it returns a new result and keeps no state, so to know whether the message changed, compare the previous `result.message` (key and params) yourself. For one-off checks, `evaluate(password, options)` gives the same result as `createMeter(options).evaluate(...)`, with the user inputs in the options: `evaluate(password, { userInputs: ['johndoe'] })`.

`userInputs` are values the password must not contain, such as the username, email or name. They're passed on every call because they usually change while the user types.

## Result

```ts
{
  bits: 125.7,               // estimated strength
  percent: 100,              // integer 0..100: bits relative to targetBits
  level: 'strong',           // 'empty' | 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'
  valid: true,               // every enabled rule passes
  rules: [                   // enabled rules, in order
    { id: 'minLength', passed: true, params: { min: 10 } },
    { id: 'notCommon', passed: true, params: {} },
    { id: 'notUserInputs', passed: true, params: {} },
  ],
  message: { key: 'level.strong', params: {} },
}
```

The message is `empty` for an empty password; otherwise the first failing rule (`rule.<id>`, with its params); otherwise the level (`level.<level>`).

Message keys: `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.minLength` (`{ min }`), `rule.maxLength` (`{ max }`), `rule.notCommon`, `rule.notUserInputs`, `rule.lowercase`, `rule.uppercase`, `rule.numbers`, `rule.symbols` (`{ min }`).

## Showing every requirement

`result.rules` has one entry per enabled rule, in a fixed order, with whether it passed and its parameters. That is all you need for the checklist many sign-up forms show, each condition in red or green:

```ts
const result = meter.evaluate(password, userInputs)

// your own wording: the rule messages (`rule.*`) are phrased as instructions ("Add a number")
const labels: Record<string, (params: Record<string, number>) => string> = {
  minLength: ({ min }) => `At least ${min} characters`,
  lowercase: () => 'A lowercase letter',
  uppercase: () => 'An uppercase letter',
  numbers: () => 'A number',
  symbols: () => 'A symbol',
  notCommon: () => 'Not a common password',
  notUserInputs: () => 'No personal details',
}

for (const rule of result.rules) {
  render(labels[rule.id]?.(rule.params), rule.passed)   // met: green, not met: red
}
```

Enable the rules you want to show (`rules: { minLength: 8, lowercase: 1, uppercase: 1, numbers: 1, symbols: 1 }`); disabled ones are not in the list. While the password is empty, show every item neutral instead of red or green: rules such as `notCommon` pass trivially on an empty password. `result.valid` is true when every rule passes. The [playground](https://elboletaire.github.io/password-strength-meter/) has a live checklist for each package.

## Translating messages

The core has no texts, but it can turn message keys into text with translations in [i18next](https://www.i18next.com)'s JSON format (nested keys, `{{count}}` placeholders, plural forms such as `_one` and `_other`). The bindings ship English, Spanish and Catalan files in that format.

```ts
import { createTranslator, translationParams } from '@passcore/core'

const translate = createTranslator(translations, 'ca')   // translations: a parsed locale JSON
translate(result.message.key, translationParams(result.message))
```

`createTranslator()` also accepts a list of layers, deep-merged in order (later layers win; only plain objects are merged, and the layers are not modified). For example, English as the base and your own overrides on top: `createTranslator([en, overrides], 'ca')`.

`translationParams()` adds `count` (from `min` or `max`), which selects the plural form. With i18next, pass the same params to its `t`: `t(result.message.key, { ns: 'passcore', ...translationParams(result.message) })`.

`createTranslator()` picks the plural form with `Intl.PluralRules`, falls back to `_other` and then to the plain key, and returns the key itself when nothing matches.

## Options

```ts
createMeter({
  targetBits: 100,              // bits that count as 100%
  estimator: undefined,         // (password, userInputs) => bits, replaces the built-in estimate
  commonPasswords: commonPasswords, // replaces the built-in list of common passwords
  rules: {
    minLength: 8,               // 0 disables it
    maxLength: 0,               // 0 disables it
    lowercase: 0,               // minimum counts, 0 disables them
    uppercase: 0,
    numbers: 0,
    symbols: 0,                 // ASCII symbols and space
    notUserInputs: true,
    notCommon: true,            // also rejects common words followed by digits/symbols (password123!)
  },
  levels: { 'very-weak': 0, 'weak': 20, 'fair': 40, 'good': 60, 'strong': 80 }, // lower bound of each level, in percent
})
```

Options are deep-merged over the defaults, so `{ rules: { numbers: 1 } }` keeps the other rules. The defaults are exported as `defaultOptions`, and `meter.options` is the complete resolved set (with the same shape).

To extend the common-password list instead of replacing it:

```ts
import { commonPasswords, createMeter } from '@passcore/core'

createMeter({ commonPasswords: [...commonPasswords, 'acme', 'acme2024'] })
```

## Immutability

Options and results are never shared: a meter copies the options it is given, so `meter.options`, `defaultOptions` and `commonPasswords` are frozen and never change, and mutating an object or array you passed in does not change a meter or the defaults. Every evaluation returns a new, frozen result.

## How strength is estimated

Each character is worth `log2(pool)` bits, where the pool is the sum of the character classes used (lowercase 26, uppercase 26, digits 10, ASCII symbols 33, anything else 100). Characters that continue a pattern are worth 1 bit: repeats (`aaa`), sequences (`abc`, `321`), QWERTY runs (`qwer`) and repeated blocks (`abcabc`). Common passwords and user inputs, also matched with simple leetspeak (`p@ssw0rd`), are worth only a few bits. Without known words, adding a character never lowers the estimate.

The built-in common-password list is the top 200 of [SecLists](https://github.com/danielmiessler/SecLists)' `xato-net-10-million-passwords-1000.txt` (MIT License, Copyright (c) 2018 Daniel Miessler).

## Stability

- **Stable (a major release to change):** option names and defaults of `rules` (`minLength` 8, `notCommon` and `notUserInputs` on, the rest off), the `levels` thresholds, `targetBits` 100, the result shape, message keys, rule ids and their order (`minLength`, `maxLength`, `notCommon`, `notUserInputs`, `lowercase`, `uppercase`, `numbers`, `symbols`), the locale keys, the CSS classes and `--pass-*` custom properties, the markup and ARIA, the bundled **list of common passwords** (frozen for all of 1.x).
- **Tunable in minor releases:** how the built-in estimate works (pool sizes, bits per pattern, the leetspeak map, bits per matched word): `bits`, `percent` and `level` for a given password may change.
- New rules may be added in minor releases, disabled by default: the `RuleId` and `MessageKey` unions and the locale keys can grow.
- An empty password is `valid: true` when no rule is enabled for it (for example `minLength: 0`). `Params` values are numbers.
