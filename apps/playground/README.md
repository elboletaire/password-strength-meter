# Passcore playground

The demo site for the password strength meter: a Vite multi-page static site. The shell is plain TypeScript; the React, Vue and Svelte pages mount their own components.

- `index.html`: the core inspector. Type a password and see everything `@passcore/core` returns (bits, percent, level, valid, every rule, the message key and its translation), with options to change the rules and the target bits.
- `jquery.html`: the `@passcore/jquery` plugin, each card with the code that runs it: default, always visible, linked to a field, translations, events, input groups, and theming (the `--pass-*` custom properties).
- `vanilla.html`: `@passcore/vanilla`: the same cases, the `hideUntilFocus` default, i18next translations, `onScore` and the `passcore:score` event, `container`, the `<password-meter>` element (attributes, and the `options` property).
- `react.html`, `vue.html`, `svelte.html`: the component of each binding with the same cases (the Svelte and Vue components take `onscore`/`@score`), and a custom UI built with the hook (`usePasswordStrength()`), the composable (`usePasswordStrength()`) or the helper (`passwordStrength()`).

Each binding page is generated from a list of cards (`src/cards.ts`), so the markup of the cards and the theming card (`src/theme.ts`) are written once. Frameworks mount their demo into the `data-slot` of their card.

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
pnpm --filter playground typecheck  # tsc, then svelte-check for the .svelte files
```

The build uses a relative `base`, so it works from any path, such as a GitHub Pages project site. `.github/workflows/pages.yml` builds it and deploys it on pushes to `master`.

## Layout

- `src/site.ts`: the language switcher shared by the pages (the choice is remembered in `localStorage`) and the bundled translations.
- `src/i18n.ts`: the i18next instance of the playground (`passcore` namespace), used by the inspector and the `translate` examples.
- `src/cards.ts`, `src/theme.ts`: the shared demo cards (markup, fields, input groups, events, theming).
- `src/inspector.ts`, `src/jquery.ts`, `src/vanilla.ts`, `src/react.tsx` (demos in `src/react/`), `src/vue.ts` (`src/vue/*.vue`), `src/svelte.ts` (`src/svelte/*.svelte`): the pages.
- `src/style.css`: the site's styles, in light and dark themes (`prefers-color-scheme`).
