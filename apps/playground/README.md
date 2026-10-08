# Passcore playground

The demo site for the password strength meter: a Vite multi-page static site (plain TypeScript, no UI framework).

- `index.html`: the core inspector. Type a password and see everything `@passcore/core` returns (bits, percent, level, valid, every rule, the message key and its translation), with options to change the rules and the target bits.
- `jquery.html`: the `@passcore/jquery` plugin in its usual setups, each with the code that runs it: default, always visible, linked to a field, translations, events, input groups, and theming (the `--pass-*` custom properties).

The vanilla, React, Vue and Svelte pages are not here yet; their links in the header are disabled.

## Running it

From the repository root:

```bash
pnpm install
pnpm --filter playground dev        # or: pnpm dev
```

The `@passcore/*` imports resolve to the packages' sources through Vite aliases (see `vite.config.ts`), so no build of the packages is needed.

## Building

```bash
pnpm --filter playground build      # static files in apps/playground/dist
pnpm --filter playground preview    # serve the build locally
pnpm --filter playground typecheck
```

The build uses a relative `base`, so it works from any path, such as a GitHub Pages project site. `.github/workflows/pages.yml` builds it and deploys it on pushes to `master`.

## Layout

- `src/site.ts`: the language switcher shared by the pages (the choice is remembered in `localStorage`) and the bundled translations.
- `src/inspector.ts`: the core inspector, rendered with i18next (`passcore` namespace).
- `src/jquery.ts`: the jQuery demos.
- `src/style.css`: the site's styles, in light and dark themes (`prefers-color-scheme`).
