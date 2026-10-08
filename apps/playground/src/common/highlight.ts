import { escapeHtml } from './escape.ts'

/**
 * A small highlighter for the snippets of the playground (JavaScript, TypeScript, JSX, HTML, Vue, Svelte, CSS).
 * It only colours comments, strings, tags, keywords, numbers, custom properties and hex colours:
 * enough to read the snippets, without a dependency.
 */

const TOKENS = new RegExp([
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)/.source, // 1 comments
  /('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)/.source, // 2 strings
  /(<\/?[A-Za-z][\w.:-]*|\/>)/.source, // 3 tags
  /(--[A-Za-z][\w-]*)/.source, // 4 custom properties
  /(#[0-9a-fA-F]{6}\b)/.source, // 5 hex colours
  /\b(import|from|export|default|const|let|function|return|new|true|false|null|undefined|void|await|async)\b/.source, // 6 keywords
  /\b(\d+(?:\.\d+)?(?:px|rem|%)?)/.source, // 7 numbers
].join('|'), 'g')

const CLASSES = ['', 'tok-comment', 'tok-string', 'tok-tag', 'tok-prop', 'tok-color', 'tok-keyword', 'tok-number']

export function highlight(code: string): string {
  let html = ''
  let last = 0
  for (const match of code.matchAll(TOKENS)) {
    const index = match.index ?? 0
    html += escapeHtml(code.slice(last, index))
    const group = match.findIndex((value, position) => position > 0 && value !== undefined)
    const text = escapeHtml(match[0])
    if (group === 5) {
      html += `<span class="tok-color" style="--swatch: ${text}">${text}</span>`
    }
    else {
      html += `<span class="${CLASSES[group] ?? ''}">${text}</span>`
    }
    last = index + match[0].length
  }
  return html + escapeHtml(code.slice(last))
}
