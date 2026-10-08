import { defineConfig } from 'vitest/config'
import { workspaceAlias } from './vitest.shared'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      // run the jQuery binding against jQuery 4 too (the package itself is tested with jQuery 3)
      {
        extends: './packages/jquery/vitest.config.ts',
        root: './packages/jquery',
        test: {
          name: 'jquery@4',
          exclude: ['**/node_modules/**', 'test/iife.test.ts'],
        },
        resolve: {
          alias: [...workspaceAlias, { find: /^jquery$/, replacement: 'jquery4' }],
        },
      },
    ],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**'],
      reporter: ['text', 'lcov'],
    },
  },
})
