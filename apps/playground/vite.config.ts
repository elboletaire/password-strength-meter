import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { basename } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { isPageId, renderPage } from './src/shell/index.ts'

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/** Fills the `<!--@head-->` and `<!--@body-->` of each page with its markup (see src/shell/index.ts). */
function pageShell(): Plugin {
  return {
    name: 'playground-page-shell',
    transformIndexHtml: {
      order: 'pre',
      handler(html, { filename }) {
        const page = basename(filename, '.html')
        if (!isPageId(page)) {
          throw new Error(`No page shell for ${filename}`)
        }
        return renderPage(page, html)
      },
    },
  }
}

export default defineConfig({
  // relative asset URLs, so the build works under any GitHub Pages path
  base: './',
  plugins: [
    pageShell(),
    react(),
    vue(),
    svelte({ preprocess: vitePreprocess() }),
  ],
  resolve: {
    // one instance of each library: the packages list them as peers, and the playground depends on them too
    dedupe: ['jquery', 'i18next', 'react', 'react-dom', 'vue', 'svelte'],
    // the workspace packages resolve to their sources, so no build is needed to run the playground
    alias: [
      { find: /^@passcore\/core$/, replacement: fromHere('../../packages/core/src/index.ts') },

      { find: /^@passcore\/jquery$/, replacement: fromHere('../../packages/jquery/src/index.ts') },
      { find: /^@passcore\/jquery\/styles\.css$/, replacement: fromHere('../../packages/jquery/src/styles.css') },

      { find: /^@passcore\/vanilla$/, replacement: fromHere('../../packages/vanilla/src/index.ts') },
      { find: /^@passcore\/vanilla\/element$/, replacement: fromHere('../../packages/vanilla/src/element.ts') },
      { find: /^@passcore\/vanilla\/styles\.css$/, replacement: fromHere('../../packages/vanilla/src/styles.css') },

      { find: /^@passcore\/react$/, replacement: fromHere('../../packages/react/src/index.ts') },
      { find: /^@passcore\/react\/styles\.css$/, replacement: fromHere('../../packages/react/src/styles.css') },

      { find: /^@passcore\/vue$/, replacement: fromHere('../../packages/vue/src/index.ts') },
      { find: /^@passcore\/vue\/styles\.css$/, replacement: fromHere('../../packages/vue/src/styles.css') },

      { find: /^@passcore\/svelte$/, replacement: fromHere('../../packages/svelte/src/lib/index.ts') },
      { find: /^@passcore\/svelte\/styles\.css$/, replacement: fromHere('../../packages/svelte/src/lib/styles.css') },

      // the bundled translations of every binding: the same files as the root locales/ folder
      { find: /^@passcore\/(?:jquery|vanilla|react|vue|svelte)\/locales\/(\w+)\.json$/, replacement: fromHere('../../locales/$1.json') },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        index: fromHere('./index.html'),
        inspector: fromHere('./inspector.html'),
        jquery: fromHere('./jquery.html'),
        vanilla: fromHere('./vanilla.html'),
        react: fromHere('./react.html'),
        vue: fromHere('./vue.html'),
        svelte: fromHere('./svelte.html'),
      },
    },
  },
})
