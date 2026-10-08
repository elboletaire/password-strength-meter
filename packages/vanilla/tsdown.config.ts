import { defineConfig } from 'tsdown'
import pkg from './package.json' with { type: 'json' }

const assets = ['src/styles.css', { from: '../../locales/*.json', to: 'dist/locales' }]

// license and attribution, first thing in the standalone builds
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * MIT License
 * Includes a list of common passwords from SecLists (https://github.com/danielmiessler/SecLists),
 * MIT License, Copyright (c) 2018 Daniel Miessler
 */`

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
    banner,
    deps: {
      alwaysBundle: ['@passcore/core'],
    },
    outputOptions: {
      entryFileNames: '[name].js',
    },
  },
  {
    // standalone build for <script> tags: registers the <passcore-meter> element, bundles @passcore/core
    entry: { 'passcore-element.min': 'src/element.ts' },
    format: 'iife',
    platform: 'browser',
    target: 'es2015',
    globalName: 'passcoreElement',
    minify: true,
    clean: false,
    banner,
    deps: {
      alwaysBundle: ['@passcore/core'],
    },
    outputOptions: {
      entryFileNames: '[name].js',
    },
  },
])
