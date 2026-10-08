# @passcore/core

## 0.2.1

### Patch Changes

- [#64](https://github.com/elboletaire/password-strength-meter/pull/64) [`8bab984`](https://github.com/elboletaire/password-strength-meter/commit/8bab984ff771dda06bb9f8d15b3c948be27bf317) Thanks [@elboletaire](https://github.com/elboletaire)! - Add translations in i18next's JSON format: English, Spanish and Catalan locale files, and an i18next-compatible translator in the core (`createTranslator`, `translationParams`). `@passcore/jquery` replaces the `messages` option with `translations`, `locale` and `translate` (e.g. i18next's `t`), and exports the locale files as `@passcore/jquery/locales/*.json`.

## 0.2.0

### Minor Changes

- [#60](https://github.com/elboletaire/password-strength-meter/pull/60) [`9f77e80`](https://github.com/elboletaire/password-strength-meter/commit/9f77e808d0e3b6884bcfcab1f7fbb2b4cba93110) Thanks [@elboletaire](https://github.com/elboletaire)! - Rework the scoring: a length-first strength estimate (patterns, common passwords and user inputs discounted) and separate configurable rules. The core now returns data and message keys only, and the jQuery plugin renders an accessible meter with overridable English messages and CSS-themeable levels. This replaces the 0.1 API; see the READMEs for the new options and the migration table.

## 0.1.0

### Minor Changes

- 491798c: First release: the scoring logic of `password-strength-meter` 2.1.0, ported to TypeScript as a framework-agnostic package.
