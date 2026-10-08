---
'@passcore/core': major
'@passcore/jquery': major
'@passcore/vanilla': major
'@passcore/react': major
'@passcore/vue': major
'@passcore/svelte': major
---

First stable release. The API is now covered by semver.

Breaking changes since 0.x:

- **core:** `commonWords` is now `commonPasswords`; `evaluate(password, options)` takes `userInputs` inside the options; `defaults` is now `defaultOptions` (deep-frozen); `Options` is `ResolvedOptions` and `PartialOptions` is `MeterOptions`; `MeterResult` and `messageChanged` are gone (evaluation is pure, results are read-only); `mergeDeep`, `resolveOptions`, `levelFor` and `RULE_ORDER` are no longer exported; `createTranslator` accepts a list of layers. The list of common passwords is frozen for all of 1.x.
- **jquery:** `defaults` and `PluginOptions` are no longer exported; a second `.password(options)` call replaces the meter; new `.password('refresh')` and `.password('destroy')`; `userInputs` reads every matched element and accepts functions; generated ids use the `passcore-jq-` prefix; peer `jquery ^3 || ^4`.
- **vanilla:** the element is now `<passcore-meter>` (`PasscoreMeterElement`); `VanillaOptions` is `PasswordMeterOptions`; `onScore` and `passcore:score` fire only when the result changes; `userInputs` selectors read every match.
- **react, vue, svelte:** `PasswordOptions` is split into `PasswordStrengthOptions` (hook, composable, helper) and the component props; the React hook returns `{ result, text, levelText }`; peer `react ^18 || ^19`.
- **all:** forced-colors support in the stylesheet, the MIT licence, and the standalone builds carry a licence banner.
