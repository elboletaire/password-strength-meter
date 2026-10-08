# Password strength meter

Password strength meters built on a small, framework-agnostic core.

| Package | Description |
|---|---|
| [`@passcore/core`](packages/core) | Strength estimation and password rules. No dependencies, no DOM, no texts |
| [`@passcore/jquery`](packages/jquery) | `$.fn.password`: a jQuery plugin with an accessible meter |
| [`@passcore/vanilla`](packages/vanilla) | `createPasswordMeter()` for any page, and a `<password-meter>` custom element |
| [`@passcore/react`](packages/react) | A hook and a component for React |
| [`@passcore/vue`](packages/vue) | A composable and a component for Vue 3 |
| [`@passcore/svelte`](packages/svelte) | A component and a rune-based helper for Svelte 5 |

Every binding renders the same accessible markup (`role="meter"`, an `aria-live` message) and shares one stylesheet design, themeable with CSS custom properties. The [playground](apps/playground) shows them all running.

The core estimates how hard a password is to guess, putting length first and discounting repeats, sequences, keyboard runs, common passwords and personal details. Separately, it checks configurable rules such as a minimum length. Bindings render the result and translate its message keys, with texts in i18next's JSON format: English, Spanish and Catalan are included (see [`locales/`](locales)).

Looking for `password-strength-meter` (the 2.x jQuery plugin)? Version 3 is a compatibility release that keeps the 2.x behavior, maintained on the [`v3` branch](https://github.com/elboletaire/password-strength-meter/tree/v3). New projects should use [`@passcore/jquery`](packages/jquery).

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

GPL-3.0
