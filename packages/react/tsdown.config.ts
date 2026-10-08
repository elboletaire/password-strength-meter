import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  dts: true,
  // react and react/jsx-runtime are peer dependencies, and @passcore/core a dependency: never bundled
  deps: {
    neverBundle: ['react', 'react/jsx-runtime', '@passcore/core'],
  },
  copy: ['src/styles.css', { from: '../../locales/*.json', to: 'dist/locales' }],
})
