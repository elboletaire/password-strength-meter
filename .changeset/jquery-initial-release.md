---
'@passcore/jquery': minor
'password-strength-meter': major
---

First release of `@passcore/jquery`: the `$.fn.password` plugin rewritten in TypeScript on top of `@passcore/core`, with the same options, markup and events as `password-strength-meter` 2.1.0, tested with jQuery 3 and 4.

`password-strength-meter` 3.0.0 becomes a wrapper around `@passcore/jquery` that keeps the 2.x `dist/` files. A `field` selector matching nothing no longer throws, Internet Explorer is no longer supported, and bower is dropped.
