import { defineProject } from 'vitest/config'
import { workspaceAlias } from '../../vitest.shared'

export default defineProject({
  resolve: {
    alias: workspaceAlias,
  },
  test: {
    name: 'react',
    environment: 'jsdom',
  },
})
