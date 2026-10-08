import { fileURLToPath } from 'node:url'

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/** Resolves workspace packages to their sources, so tests don't need a build first. */
export const workspaceAlias: Array<{ find: RegExp, replacement: string }> = [
  { find: /^@passcore\/core$/, replacement: source('./packages/core/src/index.ts') },
  { find: /^@passcore\/jquery$/, replacement: source('./packages/jquery/src/index.ts') },
  { find: /^@passcore\/vanilla$/, replacement: source('./packages/vanilla/src/index.ts') },
  { find: /^@passcore\/vanilla\/element$/, replacement: source('./packages/vanilla/src/element.ts') },
  { find: /^@passcore\/react$/, replacement: source('./packages/react/src/index.ts') },
  { find: /^@passcore\/vue$/, replacement: source('./packages/vue/src/index.ts') },
  { find: /^@passcore\/svelte$/, replacement: source('./packages/svelte/src/lib/index.ts') },
]
