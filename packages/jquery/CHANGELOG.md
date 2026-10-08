# @passcore/jquery

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
