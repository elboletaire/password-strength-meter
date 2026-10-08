import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'

const { name, version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { name: string, version: string }

const assets = ['src/styles.css', { from: '../../locales/*.json', to: 'dist/locales' }]

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'neutral',
    dts: true,
    // the declarations augment the global JQuery interface: keep the reference to @types/jquery
    banner: { dts: '/// <reference types="jquery" />' },
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
    banner: `/*!\n * ${name} v${version}\n * MIT License\n * Includes a list of common passwords from SecLists (https://github.com/danielmiessler/SecLists),\n * MIT License, Copyright (c) 2018 Daniel Miessler\n */`,
    deps: {
      alwaysBundle: ['@passcore/core'],
    },
    outputOptions: {
      globals: { jquery: 'jQuery' },
      entryFileNames: '[name].js',
    },
  },
])
