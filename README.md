# Password strength meter

Password strength meters built on a small, framework-agnostic core.

| Package | Description |
|---|---|
| [`@passcore/core`](packages/core) | Strength estimation and password rules. No dependencies, no DOM, no texts |
| [`@passcore/jquery`](packages/jquery) | `$.fn.password`: a jQuery plugin with an accessible meter |

The core estimates how hard a password is to guess, putting length first and discounting repeats, sequences, keyboard runs, common passwords and personal details. Separately, it checks configurable rules such as a minimum length. Bindings render the result and translate its message keys.

Looking for `password-strength-meter` (the 2.x jQuery plugin)? Version 3 is a compatibility release that keeps the 2.x behavior, maintained on the [`v3` branch](https://github.com/elboletaire/password-strength-meter/tree/v3). New projects should use [`@passcore/jquery`](packages/jquery).

## Development

```bash
pnpm install
pnpm test        # vitest, all packages (jQuery 3 and 4)
pnpm lint
pnpm typecheck
pnpm build
```

Releases are managed with [changesets](.changeset/README.md).

## License

GPL-3.0
