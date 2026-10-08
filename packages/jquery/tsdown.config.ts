import { defineConfig } from 'tsdown'

const assets = ['src/styles.css', { from: '../../locales/*.json', to: 'dist/locales' }]

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'neutral',
    dts: true,
    copy: assets,
  },
  {
    // standalone build for <script> tags: expects a global jQuery and bundles @passcore/core
    entry: { 'password.min': 'src/index.ts' },
    format: 'iife',
    platform: 'browser',
    target: 'es2015',
    globalName: 'passcoreJQuery',
    minify: true,
    clean: false,
    deps: {
      alwaysBundle: ['@passcore/core'],
    },
    outputOptions: {
      globals: { jquery: 'jQuery' },
      entryFileNames: '[name].js',
    },
  },
])
