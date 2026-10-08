# Changesets

Every change that affects a published package needs a changeset. Run `pnpm changeset`, pick the packages and the bump type, and commit the generated file with your change.

On `master`, the release workflow opens a "Version Packages" pull request that bumps versions and writes changelogs. Merging it publishes to npm.

## Versioning notes

- `@passcore/*` packages stay below 1.0.0 until their API settles. While they're on 0.x, use `minor` for breaking changes (0.1 → 0.2) and `patch` for everything else. A `major` changeset publishes 1.0.0.
- `password-strength-meter` (the 2.x/3.x jQuery package) is no longer part of this workspace. Its 3.x line lives on the `v3` branch, for fixes only.
