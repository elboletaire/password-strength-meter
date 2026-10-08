import type { Config } from 'vike/types'
import type { PageId } from '../src/shell/routes.ts'

declare global {
  // Vike's documented way to type its config and page context
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vike {
    interface Config {
      /** The page's id, as the shell knows it (`src/shell/routes.ts`). */
      pageId?: PageId
    }
    interface PageContext {
      /** Renders the page's `<main>`: a server-only function, the pages are HTML-only. */
      Page: () => string
    }
  }
}

/**
 * The pages are HTML only: `Page` renders the `<main>` on the server (src/shell), and the browser runs the
 * page's `+client` entry, which attaches to that markup and mounts the framework islands. There is no client
 * routing, so every link is a full page load, which the DOM-mutating demos (jQuery, vanilla) assume.
 */
export default {
  // the legacy `*.html` URLs have their own stubs (pages/legacy), which keep the #hash
  prerender: { redirects: false },
  meta: {
    Page: { env: { server: true, client: false } },
    pageId: { env: { server: true, client: false } },
  },
} satisfies Config
