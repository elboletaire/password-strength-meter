# Changesets

Every change that affects a published package needs a changeset. Run `pnpm changeset`, pick the packages and the bump type, and commit the generated file with your change.

On `master`, the release workflow opens a "Version Packages" pull request that bumps versions and writes changelogs. Merging it publishes to npm.

## Versioning notes

- `@passcore/*` packages stay below 1.0.0 until the scoring rework lands. While they're on 0.x, use `minor` for breaking changes (0.1 → 0.2) and `patch` for everything else. A `major` changeset publishes 1.0.0.
- `password-strength-meter` depends on `@passcore/jquery` with a caret range (`^0.1.0` means `<0.2.0`). When `@passcore/jquery` gets a breaking release, changesets only bumps the wrapper's range as a patch, so add `'password-strength-meter': major` to that changeset yourself.
