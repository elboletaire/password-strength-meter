---
'@passcore/core': minor
'@passcore/jquery': minor
---

Rework the scoring: a length-first strength estimate (patterns, common passwords and user inputs discounted) and separate configurable rules. The core now returns data and message keys only, and the jQuery plugin renders an accessible meter with overridable English messages and CSS-themeable levels. This replaces the 0.1 API; see the READMEs for the new options and the migration table.
