import type { Plugin } from 'vite'
import { PAGE_IDS } from './src/shell/routes.ts'
import { absolute } from './src/shell/site.ts'

/**
 * A stub for each URL of the former site (`/jquery.html`, ...): it sends the visitor to the page's new URL
 * (`/jquery/`). Vike pre-renders every document as `<url>/index.html`, so these are emitted with the client
 * build instead. The script runs first, so the `#hash` (`jquery.html#demo-checklist`) survives, which a meta
 * refresh would drop; the refresh is for clients without JavaScript. `/index.html` is the home page itself.
 */
export function legacyStubs(): Plugin {
  let base = '/'

  return {
    name: 'playground-legacy-stubs',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    generateBundle() {
      if (this.environment.name !== 'client') {
        return
      }
      for (const id of PAGE_IDS.filter((page) => page !== 'index')) {
        const target = `${base}${id}/`
        const canonical = absolute(target)
        this.emitFile({
          type: 'asset',
          fileName: `${id}.html`,
          source: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Passcore</title>
    <meta name="robots" content="noindex">
    <link rel="canonical" href="${canonical}">
    <meta http-equiv="refresh" content="0; url=${target}">
    <script>location.replace(${JSON.stringify(target)} + location.hash)</script>
  </head>
  <body>
    <a href="${target}">${target}</a>
  </body>
</html>
`,
        })
      }
    },
  }
}
