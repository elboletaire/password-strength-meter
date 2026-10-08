# @passcore/core

Framework-agnostic password strength estimation and rules. It has no dependencies, no DOM access and no texts: it returns data and message keys that bindings render and translate.

```bash
pnpm add @passcore/core
```

## Usage

```ts
import { createMeter } from '@passcore/core'

const meter = createMeter({ rules: { minLength: 10 } })
const result = meter.evaluate('correct horse battery staple', ['johndoe', 'john@example.com'])
```

Use `createMeter()` when evaluating repeatedly (on every keystroke): it prepares the word list once and reports `messageChanged`. For one-off checks, `evaluate(password, options, userInputs)` does the same without state.

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
  messageChanged: true,      // meter.evaluate() only
}
```

The message is `empty` for an empty password; otherwise the first failing rule (`rule.<id>`, with its params); otherwise the level (`level.<level>`).

Message keys: `empty`, `level.very-weak`, `level.weak`, `level.fair`, `level.good`, `level.strong`, `rule.minLength` (`{ min }`), `rule.maxLength` (`{ max }`), `rule.notCommon`, `rule.notUserInputs`, `rule.lowercase`, `rule.uppercase`, `rule.numbers`, `rule.symbols` (`{ min }`).

## Translating messages

The core has no texts, but it can turn message keys into text with translations in [i18next](https://www.i18next.com)'s JSON format (nested keys, `{{count}}` placeholders, plural forms such as `_one` and `_other`). The bindings ship English, Spanish and Catalan files in that format.

```ts
import { createTranslator, translationParams } from '@passcore/core'

const translate = createTranslator(translations, 'ca')   // translations: a parsed locale JSON
translate(result.message.key, translationParams(result.message))
```

`translationParams()` adds `count` (from `min` or `max`), which selects the plural form. With i18next, pass the same params to its `t`: `t(result.message.key, { ns: 'passcore', ...translationParams(result.message) })`.

`createTranslator()` picks the plural form with `Intl.PluralRules`, falls back to `_other` and then to the plain key, and returns the key itself when nothing matches.

## Options

```ts
createMeter({
  targetBits: 100,              // bits that count as 100%
  estimator: undefined,         // (password, userInputs) => bits, replaces the built-in estimate
  commonWords: commonPasswords, // replaces the built-in list of common passwords
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

Options are deep-merged over the defaults, so `{ rules: { numbers: 1 } }` keeps the other rules.

To extend the common-password list instead of replacing it:

```ts
import { commonPasswords, createMeter } from '@passcore/core'

createMeter({ commonWords: [...commonPasswords, 'acme', 'acme2024'] })
```

## How strength is estimated

Each character is worth `log2(pool)` bits, where the pool is the sum of the character classes used (lowercase 26, uppercase 26, digits 10, ASCII symbols 33, anything else 100). Characters that continue a pattern are worth 1 bit: repeats (`aaa`), sequences (`abc`, `321`), QWERTY runs (`qwer`) and repeated blocks (`abcabc`). Common passwords and user inputs, also matched with simple leetspeak (`p@ssw0rd`), are worth only a few bits. Without known words, adding a character never lowers the estimate.

The built-in common-password list is the top 200 of [SecLists](https://github.com/danielmiessler/SecLists)' `xato-net-10-million-passwords-1000.txt` (MIT License, Copyright (c) 2018 Daniel Miessler).
