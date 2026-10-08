import { defineProject } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { workspaceAlias } from '../../vitest.shared'

export default defineProject({
  plugins: [svelte()],
  resolve: {
    alias: workspaceAlias,
    conditions: ['browser'],
  },
  test: {
    name: 'svelte',
    environment: 'jsdom',
  },
})
