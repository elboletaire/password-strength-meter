import { defineProject } from 'vitest/config'
import { workspaceAlias } from '../../vitest.shared'

export default defineProject({
  resolve: {
    alias: workspaceAlias,
  },
  test: {
    name: 'password-strength-meter',
    environment: 'jsdom',
  },
})
