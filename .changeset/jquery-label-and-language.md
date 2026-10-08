---
'@passcore/jquery': minor
---

Add the `label` option (the accessible name of the meter, previously always "Password strength"), and rewrite the message text on every update when it differs: after a language change with a `translate` function, call `.password('refresh')` to rewrite it.
