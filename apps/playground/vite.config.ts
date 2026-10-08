import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  // relative asset URLs, so the build works under any GitHub Pages path
  base: './',
  resolve: {
    // one jQuery instance: the plugin's package has jquery as a dev dependency too
    dedupe: ['jquery', 'i18next'],
    // the workspace packages resolve to their sources, so no build is needed to run the playground
    alias: [
      { find: /^@passcore\/core$/, replacement: fromHere('../../packages/core/src/index.ts') },
      { find: /^@passcore\/jquery$/, replacement: fromHere('../../packages/jquery/src/index.ts') },
      { find: /^@passcore\/jquery\/styles\.css$/, replacement: fromHere('../../packages/jquery/src/styles.css') },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        index: fromHere('./index.html'),
        jquery: fromHere('./jquery.html'),
      },
    },
  },
})
