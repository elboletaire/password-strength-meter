# Passcore

Accessible password strength meters for every framework, built on one small core.

> **About the name.** *Passcore* is the name of the packages (`@passcore/*`). It plays on *pass score* (the score of a password, written with one `s` because "passscore" repeated too many letters) and on *core* (the small core every package shares). This repository is still called `password-strength-meter` because that is how it started: as a jQuery plugin with that name. The original `password-strength-meter` package on npm is now a compatibility release; see [Looking for the old plugin?](#looking-for-the-old-plugin).

## Packages

| Package | For |
|---|---|
| [`@passcore/core`](packages/core) | Strength estimation and password rules. No dependencies, no DOM, no texts: use it to build your own UI or to validate on the server |
| [`@passcore/jquery`](packages/jquery) | `$.fn.password`: a jQuery plugin with an accessible meter |
| [`@passcore/vanilla`](packages/vanilla) | `createPasswordMeter()` for any page, and a `<passcore-meter>` custom element |
| [`@passcore/react`](packages/react) | A hook and a component for React |
| [`@passcore/vue`](packages/vue) | A composable and a component for Vue 3 |
| [`@passcore/svelte`](packages/svelte) | A component and a rune-based helper for Svelte 5 |

Pick the one for your stack: each binding depends on `@passcore/core` and renders the same markup, so they all behave and look alike.

## Why Passcore

- **Length first.** The estimate counts how hard a password is to guess, and discounts repeats, sequences, keyboard runs, common passwords and personal details such as the username. Adding characters never makes a password look weaker, unless they complete a known weak word.
- **Rules are separate from strength.** Minimum length, required character types, "no personal details" and "not a common password" are configurable and reported on their own, so a long passphrase that misses one rule still shows its real strength.
- **Accessible.** A `role="meter"` bar with ARIA values, and the message in a polite live region linked to the input.
- **Translated, your way.** The core returns message keys, never texts. English, Spanish and Catalan are included in i18next's JSON format (see [`locales/`](locales)), and you can pass your own `translate` function, such as i18next's `t`.
- **Themeable.** One stylesheet, colored with CSS custom properties, no images.

## Quick start

```bash
pnpm add @passcore/react   # or @passcore/vue, @passcore/svelte, @passcore/vanilla, @passcore/jquery
```

```tsx
import { PasswordStrengthMeter } from '@passcore/react'
import '@passcore/react/styles.css'

function PasswordField({ password, onChange }: { password: string, onChange: (value: string) => void }) {
  return (
    <>
      <input type="password" value={password} onChange={(e) => onChange(e.target.value)} aria-describedby="password-strength" />
      <PasswordStrengthMeter password={password} id="password-strength" />
    </>
  )
}
```

Or skip the UI and use the core directly:

```ts
import { createMeter } from '@passcore/core'

const meter = createMeter({ rules: { minLength: 10 } })
const { percent, level, valid, message } = meter.evaluate('correct horse battery staple', ['johndoe'])
```

Each package's README has its options, events, translations and styling; the [core's Stability section](packages/core#stability) lists what changes only in a major release. The [playground](apps/playground) (`pnpm dev`) shows every package running, with the code for each case.

## Looking for the old plugin?

`password-strength-meter` 2.x was a jQuery plugin. Its npm package now publishes version 3, a compatibility release that keeps the 2.x behavior and options, maintained on the [`v3` branch](https://github.com/elboletaire/password-strength-meter/tree/v3) for fixes only, and it is deprecated in favor of [`@passcore/jquery`](packages/jquery). The new plugin has a different scoring system and different options: the [`@passcore/jquery` README](packages/jquery#migrating-from-password-strength-meter-2x3x-and-earlier-passcorejquery-versions) has a table that maps each old option to its replacement.

## Development

```bash
pnpm install
pnpm dev         # the playground, with the packages' sources (no build needed)
pnpm test        # vitest, all packages (jQuery 3 and 4)
pnpm lint
pnpm typecheck
pnpm build       # the packages (the playground has its own build)
```

Releases are managed with [changesets](.changeset/README.md).

## License

MIT
