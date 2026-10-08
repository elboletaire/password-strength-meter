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
pnpm --filter playground preview    # serve the build locally, like GitHub Pages (run build first)
pnpm --filter playground typecheck  # tsc, then svelte-check for the .svelte files
pnpm --filter playground check      # checks the build: every page, its language, head tags, links and the sitemap
```

The site lives under the GitHub Pages project path: `base` is `/password-strength-meter/` (absolute, in `vite.config.ts`), and `vike dev` serves under it too. Pages have clean URLs with a trailing slash (`/password-strength-meter/react/`); the former `*.html` URLs (`/jquery.html`, ...) are kept as small redirect stubs that preserve the `#hash` (`legacy-stubs.ts`). The build also writes `sitemap.xml` (`sitemap.ts`, one entry per page and language) and `404.html` (`pages/_error`, translated in the browser from the URL). CI builds and checks the site on every pull request; `.github/workflows/pages.yml` builds it, checks it and deploys `dist/client` on pushes to `master`. `pnpm --filter playground preview` (`scripts/preview.ts`) serves the build the way GitHub Pages does; `vike preview` can't be used, because it serves the legacy stub for `/react/` and the stub redirects back in a loop. `vike dev` also redirects slash URLs, so check the build with `preview` when it matters. The site makes no request to other hosts: the only web font (JetBrains Mono, `src/fonts/`, SIL Open Font License) is served with the site.

## How it is put together

- Pages are rendered by [Vike](https://vike.dev), in HTML-only mode and without client routing: every link is a full page load, which the demos that mutate the DOM (jQuery, vanilla) assume. Each folder of `pages/` is a page (`+Page.ts`: a server-only function returning the page's `<main>` from `src/shell/pages/`; `+pageId.ts`; `+client.ts`: the browser entry, which attaches to that markup and mounts the framework islands). `pages/+onRenderHtml.ts` writes the document with the header, the footer and the head of `src/shell/layout.ts`. Pages arrive complete, so nothing jumps while the scripts load; the frameworks mount into slots that reserve their room. `src/shell/routes.ts` is the single source of the page URLs (`url(page, lang, hash?)`), and `src/shell/seo.ts` writes the head tags of each page from them: canonical, hreflang, Open Graph, Twitter and JSON-LD.
- `src/shell/**`, every `pages/` file but the `+client` entries, and the build plugins next to `vite.config.ts` run on the server, at build time: ESLint forbids importing `jquery` (and `@passcore/jquery`), the framework runtimes, `@passcore/vanilla/element` or `src/lib/**` from them.
- Texts live in `src/locales/site.{en,es,ca}.json`. Every page is pre-rendered in its own language (`/es/…`, `/ca/…`), and the build fails on a missing key in any of them. The browser doesn't translate the shell: `src/lib/i18n.ts` (an i18next instance, with the packages' bundled files in the `passcore` namespace) only serves the demos' own texts.
- The language (`src/lib/lang.ts`) is the one in `<html lang>`, from the URL. Switching language is a link to the same page in the other language, so the demos mount once, in that language. An inline script in the head applies the theme before the first paint, and on English pages sends visitors who chose Spanish or Catalan before to that version.
- `src/lib/site.ts`: what every page shares (language switcher, theme toggle, copy buttons, tabs, the list of demos). `src/lib/reveal.ts`: the show/hide button of the password fields; the React, Vue and Svelte demos render the same button from their own `PasswordInput` component. `src/lib/studio.ts`: the theming studio.
- `pages/*/+client.ts(x)`: the entry of each page. `src/react/`, `src/vue/`, `src/svelte/`: the framework demos.
- `src/style.css`: the site's styles, light and dark (`prefers-color-scheme`, or the toggle in the header).
