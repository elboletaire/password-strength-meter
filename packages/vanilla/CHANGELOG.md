# @passcore/vanilla

## 1.0.0

### Major Changes

- [#71](https://github.com/elboletaire/password-strength-meter/pull/71) [`8bb68ae`](https://github.com/elboletaire/password-strength-meter/commit/8bb68ae9cf327db72f4c5e2e328adf07dbc98f99) Thanks [@elboletaire](https://github.com/elboletaire)! - First stable release. The API is now covered by semver.
  
  Breaking changes since 0.x:
  
  - **core:** `commonWords` is now `commonPasswords`; `evaluate(password, options)` takes `userInputs` inside the options; `defaults` is now `defaultOptions` (deep-frozen); `Options` is `ResolvedOptions` and `PartialOptions` is `MeterOptions`; `MeterResult` and `messageChanged` are gone (evaluation is pure, results are read-only); `mergeDeep`, `resolveOptions`, `levelFor` and `RULE_ORDER` are no longer exported; `createTranslator` accepts a list of layers. The list of common passwords is frozen for all of 1.x.
  - **jquery:** `defaults` and `PluginOptions` are no longer exported; a second `.password(options)` call replaces the meter; new `.password('refresh')` and `.password('destroy')`; `userInputs` reads every matched element and accepts functions; generated ids use the `passcore-jq-` prefix; peer `jquery ^3 || ^4`.
  - **vanilla:** the element is now `<passcore-meter>` (`PasscoreMeterElement`); `VanillaOptions` is `PasswordMeterOptions`; `onScore` and `passcore:score` fire only when the result changes; `userInputs` selectors read every match.
  - **react, vue, svelte:** `PasswordOptions` is split into `PasswordStrengthOptions` (hook, composable, helper) and the component props; the React hook returns `{ result, text, levelText }`; peer `react ^18 || ^19`.
  - **all:** forced-colors support in the stylesheet, the MIT licence, and the standalone builds carry a licence banner.

### Patch Changes

- [#70](https://github.com/elboletaire/password-strength-meter/pull/70) [`cf7b24b`](https://github.com/elboletaire/password-strength-meter/commit/cf7b24b2ae28c31c767d1de60e7fdf04f3ae6123) Thanks [@elboletaire](https://github.com/elboletaire)! - The license is now MIT (it was GPL-3.0). The packages bundle a list of common passwords from SecLists (MIT License, Copyright (c) 2018 Daniel Miessler); the standalone builds carry that notice in their header.
- Updated dependencies [[`cf7b24b`](https://github.com/elboletaire/password-strength-meter/commit/cf7b24b2ae28c31c767d1de60e7fdf04f3ae6123), [`8bb68ae`](https://github.com/elboletaire/password-strength-meter/commit/8bb68ae9cf327db72f4c5e2e328adf07dbc98f99)]:
  - @passcore/core@1.0.0
