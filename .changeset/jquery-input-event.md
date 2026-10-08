---
'@passcore/jquery': patch
---

Update the meter on `input` events too, not only on `keyup`: pasting with the mouse, browser autofill and drag and drop changed the value without updating the meter or firing `password.score` until a key was released. Typing still updates once per keystroke, and a `keyup` that isn't preceded by an `input` event fires as before.
