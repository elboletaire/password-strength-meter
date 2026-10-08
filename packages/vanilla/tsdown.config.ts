import { defineConfig } from 'tsdown'

const assets = ['src/styles.css', { from: '../../locales/*.json', to: 'dist/locales' }]

export default defineConfig([
  {
    entry: { index: 'src/index.ts', element: 'src/element.ts' },
    format: ['esm', 'cjs'],
    platform: 'neutral',
    dts: true,
    copy: assets,
  },
  {
    // standalone build for <script> tags: exposes window.passcore.createPasswordMeter, bundles @passcore/core
    entry: { 'passcore.min': 'src/index.ts' },
    format: 'iife',
    platform: 'browser',
    target: 'es2015',
    globalName: 'passcore',
    minify: true,
    clean: false,
    deps: {
      alwaysBundle: ['@passcore/core'],
    },
    outputOptions: {
      entryFileNames: '[name].js',
    },
  },
  {
    // standalone build for <script> tags: registers the <password-meter> element, bundles @passcore/core
    entry: { 'passcore-element.min': 'src/element.ts' },
    format: 'iife',
    platform: 'browser',
    target: 'es2015',
    globalName: 'passcoreElement',
    minify: true,
    clean: false,
    deps: {
      alwaysBundle: ['@passcore/core'],
    },
    outputOptions: {
      entryFileNames: '[name].js',
    },
  },
])
