# Passcore playground

The demo site of the password strength meters: a static site pre-rendered with Vike, in English, Spanish and Catalan. Every page runs the real packages (`@passcore/*`, resolved to their sources through Vite aliases).

- `pages/index`: the overview. A live meter (`@passcore/vanilla`) with a readout of the result and sample passwords, a live requirements checklist (a signup form) linking to the same demo on each binding page, the features, the bindings and an install panel (per package and package manager).
- `pages/inspector`: the core inspector. Type a password and see everything `@passcore/core` returns (bits, percent, level, valid, every rule, the message key and its translation), with options for the rules, the target bits, extra common words and personal details (`userInputs`).
- `pages/jquery`, `pages/vanilla`, `pages/react`, `pages/vue`, `pages/svelte`: one page per binding, each demo next to the code that runs it: default, a requirements checklist (every rule of `result.rules`, neutral until something is typed, then met or not met: from `password.score`, `onScore`, the hook, the composable or the helper), always visible with the percent, linked to a username, bundled translations, i18next translations, callbacks and events, input group or container, the custom element and its `options` (vanilla) and a theming studio over the `--pass-*` custom properties.

## Running it

From the repository root:

```bash
pnpm install
pnpm --filter playground dev        # or: pnpm dev
```

## Building

```bash
pnpm --filter playground build      # static files in apps/playground/dist/client
pnpm --filter playground preview    # serve the build locally
pnpm --filter playground typecheck  # tsc, then svelte-check for the .svelte files
```

The site lives under the GitHub Pages project path: `base` is `/password-strength-meter/` (absolute, in `vite.config.ts`), and `vike dev` and `vike preview` serve under it too. Pages have clean URLs with a trailing slash (`/password-strength-meter/react/`); the former `*.html` URLs (`/jquery.html`, ...) are kept as small redirect stubs that preserve the `#hash` (`legacy-stubs.ts`). `.github/workflows/pages.yml` builds it and deploys `dist/client` on pushes to `master`. Note that `vike preview` (like `vike dev`) serves `/react/` differently from GitHub Pages: check the build with a plain static server when it matters. The site makes no request to other hosts: the only web font (JetBrains Mono, `src/fonts/`, SIL Open Font License) is served with the site.

## How it is put together

- Pages are rendered by [Vike](https://vike.dev), in HTML-only mode and without client routing: every link is a full page load, which the demos that mutate the DOM (jQuery, vanilla) assume. Each folder of `pages/` is a page (`+Page.ts`: a server-only function returning the page's `<main>` from `src/shell/pages/`; `+pageId.ts`; `+client.ts`: the browser entry, which attaches to that markup and mounts the framework islands). `pages/+onRenderHtml.ts` writes the document with the header, the footer and the head of `src/shell/layout.ts`. Pages arrive complete, so nothing jumps while the scripts load; the frameworks mount into slots that reserve their room. `src/shell/routes.ts` is the single source of the page URLs (`url(page, hash?)`).
- `src/shell/**` and the `+Page.ts` / `+onRenderHtml.ts` files run on the server, at build time: ESLint forbids importing `jquery`, the framework runtimes or `src/lib/**` from them.
- Texts live in `src/locales/site.{en,es,ca}.json`. The shell writes the English text with its key (`data-i18n`, `data-i18n-html`, `data-i18n-attr`); in the browser, `src/lib/i18n.ts` (an i18next instance, with the packages' bundled files in the `passcore` namespace) translates them in place. A build fails on a missing key.
- The language (`src/lib/lang.ts`) is the stored choice, else the browser's language when it is English, Spanish or Catalan. An inline script in the head applies it, and the theme, before the first paint. Every meter on the pages follows it too.
- `src/lib/site.ts`: what every page shares (language switcher, theme toggle, copy buttons, tabs, the list of demos). `src/lib/reveal.ts`: the show/hide button of the password fields; the React, Vue and Svelte demos render the same button from their own `PasswordInput` component. `src/lib/studio.ts`: the theming studio.
- `pages/*/+client.ts(x)`: the entry of each page. `src/react/`, `src/vue/`, `src/svelte/`: the framework demos.
- `src/style.css`: the site's styles, light and dark (`prefers-color-scheme`, or the toggle in the header).
