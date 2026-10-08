import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import vike from 'vike/plugin'
import { defineConfig } from 'vite'
import { legacyStubs } from './legacy-stubs.ts'
import { sitemapFile } from './sitemap.ts'

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  // the GitHub Pages project path: absolute, so the assets also load from the 404 page, at any depth. `vike dev` serves under it too
  base: '/password-strength-meter/',
  plugins: [
    vike(),
    legacyStubs(),
    sitemapFile(),
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
})
