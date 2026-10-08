// svelte-package only packages src/lib: copy the shared locale files next to the build
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

cpSync(new URL('../../../locales', import.meta.url), new URL('../dist/locales', import.meta.url), { recursive: true })
console.log('locales copied to dist/locales')

// svelte-package emits imports as they are: the source imports the English locale from the repo root
// (../../../../locales, from src/lib), which does not exist next to dist/. Point it at dist/locales.
const file = new URL('../dist/strength.svelte.js', import.meta.url)
const from = `'../../../../locales/en.json'`
const source = readFileSync(file, 'utf8')
if (!source.includes(from)) {
  throw new Error(`${from} not found in dist/strength.svelte.js: update scripts/copy-assets.mjs`)
}
writeFileSync(file, source.replace(from, `'./locales/en.json'`))

// svelte-package leaves its temporary copy behind: remove it so linters don't pick it up
rmSync(new URL('../.svelte-kit/__package__', import.meta.url), { recursive: true, force: true })
