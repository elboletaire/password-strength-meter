# Changesets

Every change that affects a published package needs a changeset. Run `pnpm changeset`, pick the packages and the bump type, and commit the generated file with your change.

On `master`, the release workflow opens a "Version Packages" pull request that bumps versions and writes changelogs. Merging it publishes to npm.

## Versioning notes

- `@passcore/*` packages follow semver since 1.0.0: `major` for breaking changes, `minor` for new features, `patch` for fixes. How the built-in estimate works (pool sizes, bits per pattern, the leetspeak map, bits per matched word) is tuned in minor releases: it changes scores, not the API. The common-password list, the `levels` thresholds, the rule defaults and the message keys are stable (see the Stability section of the core README).
- `password-strength-meter` (the 2.x/3.x jQuery package) is no longer part of this workspace. Its 3.x line lives on the `v3` branch, for fixes only.

## Publishing

The release workflow (`.github/workflows/release.yml`) publishes with npm trusted publishing: no token is stored, npm checks the GitHub Actions workflow instead. A package must already exist on npm before a trusted publisher can be configured, so **the first version of every new package is published by hand** (`pnpm build`, then `pnpm publish --access public` from the package directory). Then, on npmjs.com, open the package's Settings → Trusted publishing and add GitHub Actions with repository `elboletaire/password-strength-meter` and workflow `release.yml`.
