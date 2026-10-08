// Single-file components: the playground's type checks don't compile them (see `typecheck` in package.json).
// `svelte-check` checks the .svelte files, and the .vue files are compiled by Vite only.

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '*.svelte' {
  import type { Component } from 'svelte'

  const component: Component<Record<string, never>>
  export default component
}
