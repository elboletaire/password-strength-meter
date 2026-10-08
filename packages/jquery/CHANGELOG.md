# @passcore/jquery

## 1.0.0

### Major Changes

- [#71](https://github.com/elboletaire/password-strength-meter/pull/71) [`8bb68ae`](https://github.com/elboletaire/password-strength-meter/commit/8bb68ae9cf327db72f4c5e2e328adf07dbc98f99) Thanks [@elboletaire](https://github.com/elboletaire)! - First stable release. The API is now covered by semver.
  
  Breaking changes since 0.x:
  
  - **core:** `commonWords` is now `commonPasswords`; `evaluate(password, options)` takes `userInputs` inside the options; `defaults` is now `defaultOptions` (deep-frozen); `Options` is `ResolvedOptions` and `PartialOptions` is `MeterOptions`; `MeterResult` and `messageChanged` are gone (evaluation is pure, results are read-only); `mergeDeep`, `resolveOptions`, `levelFor` and `RULE_ORDER` are no longer exported; `createTranslator` accepts a list of layers. The list of common passwords is frozen for all of 1.x.
  - **jquery:** `defaults` and `PluginOptions` are no longer exported; a second `.password(options)` call replaces the meter; new `.password('refresh')` and `.password('destroy')`; `userInputs` reads every matched element and accepts functions; generated ids use the `passcore-jq-` prefix; peer `jquery ^3 || ^4`.
  - **vanilla:** the element is now `<passcore-meter>` (`PasscoreMeterElement`); `VanillaOptions` is `PasswordMeterOptions`; `onScore` and `passcore:score` fire only when the result changes; `userInputs` selectors read every match.
  - **react, vue, svelte:** `PasswordOptions` is split into `PasswordStrengthOptions` (hook, composable, helper) and the component props; the React hook returns `{ result, text, levelText }`; peer `react ^18 || ^19`.
  - **all:** forced-colors support in the stylesheet, the MIT licence, and the standalone builds carry a licence banner.

### Minor Changes

- [#68](https://github.com/elboletaire/password-strength-meter/pull/68) [`751f483`](https://github.com/elboletaire/password-strength-meter/commit/751f483d40ef19c4f2e754a0670d74a9c5ee5f22) Thanks [@elboletaire](https://github.com/elboletaire)! - Add the `label` option (the accessible name of the meter, previously always "Password strength"), and rewrite the message text on every update when it differs: after a language change with a `translate` function, call `.password('refresh')` to rewrite it.

### Patch Changes

- [#66](https://github.com/elboletaire/password-strength-meter/pull/66) [`ac19c20`](https://github.com/elboletaire/password-strength-meter/commit/ac19c20f5484e37720a993d70cb4e10741fbc8de) Thanks [@elboletaire](https://github.com/elboletaire)! - Update the meter on `input` events too, not only on `keyup`: pasting with the mouse, browser autofill and drag and drop changed the value without updating the meter or firing `password.score` until a key was released. Typing still updates once per keystroke, and a `keyup` that isn't preceded by an `input` event fires as before.

- [#68](https://github.com/elboletaire/password-strength-meter/pull/68) [`3c19556`](https://github.com/elboletaire/password-strength-meter/commit/3c19556cf69aa4f3d9fbcd144adc9e34a26abd2e) Thanks [@elboletaire](https://github.com/elboletaire)! - Fix the meter staying hidden with password managers such as Bitwarden. They show an overlay that takes the focus away from the empty field (the meter started sliding out), then fill the value and refocus the field while it was still sliding: the plugin ignored that focus and the animation ended with the meter hidden on a focused, filled field, until the next focus. The meter now follows the state of the field (visible while it is focused or has a value) and an animation in flight gives way to it. Fields that are already focused or filled start visible, and `change` events (fired by some managers and by autofill) update the meter too.

- [#70](https://github.com/elboletaire/password-strength-meter/pull/70) [`cf7b24b`](https://github.com/elboletaire/password-strength-meter/commit/cf7b24b2ae28c31c767d1de60e7fdf04f3ae6123) Thanks [@elboletaire](https://github.com/elboletaire)! - The license is now MIT (it was GPL-3.0). The packages bundle a list of common passwords from SecLists (MIT License, Copyright (c) 2018 Daniel Miessler); the standalone builds carry that notice in their header.
- Updated dependencies [[`cf7b24b`](https://github.com/elboletaire/password-strength-meter/commit/cf7b24b2ae28c31c767d1de60e7fdf04f3ae6123), [`8bb68ae`](https://github.com/elboletaire/password-strength-meter/commit/8bb68ae9cf327db72f4c5e2e328adf07dbc98f99)]:
  - @passcore/core@1.0.0

## 0.3.0

### Minor Changes

- [#64](https://github.com/elboletaire/password-strength-meter/pull/64) [`8bab984`](https://github.com/elboletaire/password-strength-meter/commit/8bab984ff771dda06bb9f8d15b3c948be27bf317) Thanks [@elboletaire](https://github.com/elboletaire)! - Add translations in i18next's JSON format: English, Spanish and Catalan locale files, and an i18next-compatible translator in the core (`createTranslator`, `translationParams`). `@passcore/jquery` replaces the `messages` option with `translations`, `locale` and `translate` (e.g. i18next's `t`), and exports the locale files as `@passcore/jquery/locales/*.json`.

### Patch Changes

- Updated dependencies [[`8bab984`](https://github.com/elboletaire/password-strength-meter/commit/8bab984ff771dda06bb9f8d15b3c948be27bf317)]:
  - @passcore/core@0.2.1

## 0.2.0

### Minor Changes

- [#60](https://github.com/elboletaire/password-strength-meter/pull/60) [`9f77e80`](https://github.com/elboletaire/password-strength-meter/commit/9f77e808d0e3b6884bcfcab1f7fbb2b4cba93110) Thanks [@elboletaire](https://github.com/elboletaire)! - Rework the scoring: a length-first strength estimate (patterns, common passwords and user inputs discounted) and separate configurable rules. The core now returns data and message keys only, and the jQuery plugin renders an accessible meter with overridable English messages and CSS-themeable levels. This replaces the 0.1 API; see the READMEs for the new options and the migration table.

### Patch Changes

- Updated dependencies [[`9f77e80`](https://github.com/elboletaire/password-strength-meter/commit/9f77e808d0e3b6884bcfcab1f7fbb2b4cba93110)]:
  - @passcore/core@0.2.0

## 0.1.0

### Minor Changes

- 66c1149: First release of `@passcore/jquery`: the `$.fn.password` plugin rewritten in TypeScript on top of `@passcore/core`, with the same options, markup and events as `password-strength-meter` 2.1.0, tested with jQuery 3 and 4.
  
  `password-strength-meter` 3.0.0 becomes a wrapper around `@passcore/jquery` that keeps the 2.x `dist/` files. A `field` selector matching nothing no longer throws, Internet Explorer is no longer supported, and bower is dropped.

### Patch Changes

- Updated dependencies [491798c]
  - @passcore/core@0.1.0
