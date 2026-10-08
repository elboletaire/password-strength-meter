---
'@passcore/jquery': patch
---

Fix the meter staying hidden with password managers such as Bitwarden. They show an overlay that takes the focus away from the empty field (the meter started sliding out), then fill the value and refocus the field while it was still sliding: the plugin ignored that focus and the animation ended with the meter hidden on a focused, filled field, until the next focus. The meter now follows the state of the field (visible while it is focused or has a value) and an animation in flight gives way to it. Fields that are already focused or filled start visible, and `change` events (fired by some managers and by autofill) update the meter too.
