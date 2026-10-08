# Passcore playground

The demo site of the password strength meters: a Vite multi-page static site, in English, Spanish and Catalan. Every page runs the real packages (`@passcore/*`, resolved to their sources through Vite aliases).

- `index.html`: the overview. A live meter (`@passcore/vanilla`) with a readout of the result and sample passwords, the features, the bindings and an install panel (per package and package manager).
- `inspector.html`: the core inspector. Type a password and see everything `@passcore/core` returns (bits, percent, level, valid, every rule, the message key and its translation), with options for the rules, the target bits, extra common words and personal details (`userInputs`).
- `jquery.html`, `vanilla.html`, `react.html`, `vue.html`, `svelte.html`: one page per binding, each demo next to the code that runs it: default, always visible with the percent, linked to a username, bundled translations, i18next translations, callbacks and events, input group or container, the custom element and its `options` (vanilla), a custom UI built with the hook, composable or helper (React, Vue, Svelte), and a theming studio over the `--pass-*` custom properties.

## Running it

From the repository root:

```bash
pnpm install
pnpm --filter playground dev        # or: pnpm dev
```

## Building

```bash
pnpm --filter playground build      # static files in apps/playground/dist
pnpm --filter playground preview    # serve the build locally
pnpm --filter playground typecheck  # tsc, then svelte-check for the .svelte files
```

The build uses a relative `base`, so it works from any path, such as a GitHub Pages project site. `.github/workflows/pages.yml` builds it and deploys it on pushes to `master`. It makes no request to other hosts: the only web font (JetBrains Mono, `src/fonts/`, SIL Open Font License) is served with the site.

## How it is put together

- The HTML files are skeletons. A small Vite plugin (`pageShell` in `vite.config.ts`) fills them at build time, and on every request of the dev server, with the markup of `src/shell/`: the header, the footer and each page's content (`src/shell/pages/`). Pages arrive complete, so nothing jumps while the scripts load; the frameworks mount into slots that reserve their room.
- Texts live in `src/locales/site.{en,es,ca}.json`. The shell writes the English text with its key (`data-i18n`, `data-i18n-html`, `data-i18n-attr`); in the browser, `src/lib/i18n.ts` (an i18next instance, with the packages' bundled files in the `passcore` namespace) translates them in place. A build fails on a missing key.
- The language (`src/lib/lang.ts`) is the stored choice, else the browser's language when it is English, Spanish or Catalan. An inline script in the head applies it, and the theme, before the first paint. Every meter on the pages follows it too.
- `src/lib/site.ts`: what every page shares (language switcher, theme toggle, copy buttons, tabs, the list of demos). `src/lib/reveal.ts`: the show/hide button of the password fields; the React, Vue and Svelte demos render the same button from their own `PasswordInput` component. `src/lib/studio.ts`: the theming studio.
- `src/pages/`: the entry of each page. `src/react/`, `src/vue/`, `src/svelte/`: the framework demos.
- `src/style.css`: the site's styles, light and dark (`prefers-color-scheme`, or the toggle in the header).
