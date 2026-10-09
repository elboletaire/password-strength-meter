import type { Plugin } from 'vite'
import { sitemap } from './src/shell/sitemap.ts'

/**
 * `/sitemap.xml`, emitted with the client build: Vike would write a route like that as `sitemap.xml/index.html`,
 * and crawlers need the file itself.
 */
export function sitemapFile(): Plugin {
  let base = '/'

  return {
    name: 'playground-sitemap',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    generateBundle() {
      if (this.environment.name === 'client') {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(base) })
      }
    },
  }
}
