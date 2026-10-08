// svelte-package only packages src/lib: copy the shared locale files next to the build
import { cpSync } from 'node:fs'

cpSync(new URL('../../../locales', import.meta.url), new URL('../dist/locales', import.meta.url), { recursive: true })
console.log('locales copied to dist/locales')
