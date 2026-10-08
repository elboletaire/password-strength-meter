/**
 * The demo cards shared by the binding pages. A card is a heading, a text, a demo and the code that runs.
 * The demo is markup for the plain bindings (jQuery, vanilla), or an empty slot that a framework mounts into.
 */

export interface Card {
  /** Prefix of the card's ids: the heading is `${id}-title`. */
  id: string
  title: string
  /** Trusted HTML (it may contain `<code>`). */
  text: string
  /** Trusted HTML: the demo's markup, or `<div data-slot="…">` for a framework. */
  demo: string
  /** The class of the demo wrapper. Default: `demo`. */
  demoClass?: string
  /** The code that runs, shown as is. */
  code: string
  /** Spans both columns of the grid. */
  wide?: boolean
}

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char)
}

export function cardHtml(card: Card): string {
  const className = card.wide ? 'card card--wide' : 'card'
  return `<section class="${className}" aria-labelledby="${card.id}-title">
  <h2 id="${card.id}-title">${escapeHtml(card.title)}</h2>
  <p>${card.text}</p>
  <div class="${card.demoClass ?? 'demo'}">${card.demo}</div>
  <pre><code>${escapeHtml(card.code)}</code></pre>
</section>`
}

/** The element with the given id. Throws when the page doesn't have it. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing #${id} in the page`)
  }
  return element as T
}

/** Renders the cards into the page's `#cards` element, replacing what it had. */
export function renderCards(cards: Card[]): void {
  byId('cards').innerHTML = cards.map(cardHtml).join('\n')
}

/** The element a framework mounts a demo into, inside the cards rendered by `renderCards`. */
export function slot(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-slot="${name}"]`)
  if (!element) {
    throw new Error(`Missing the [data-slot="${name}"] of the demo`)
  }
  return element
}

export interface FieldOptions {
  id: string
  label: string
  type?: 'password' | 'text'
  autocomplete?: string
  placeholder?: string
}

/** A label and an input, as in the demos. */
export function fieldHtml({ id, label, type = 'password', autocomplete = 'new-password', placeholder }: FieldOptions): string {
  const placeholderAttr = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : ''
  return `<div class="field">
  <label for="${id}">${escapeHtml(label)}</label>
  <input id="${id}" type="${type}" autocomplete="${autocomplete}"${placeholderAttr}>
</div>`
}

/** The path of the lock icon of the input group (a 24 by 24 viewBox). */
export const LOCK_PATH = 'M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2Zm-8 0V7a3 3 0 0 1 6 0v2H9Zm3 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z'

const LOCK_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" focusable="false"><path fill="currentColor" d="${LOCK_PATH}" /></svg>`

/** An input group (with an addon), inside a `.form-group` that has the given id. */
export function inputGroupHtml(id: string, label: string, groupId: string): string {
  return `<div class="form-group" id="${groupId}">
  <label for="${id}">${escapeHtml(label)}</label>
  <div class="input-group">
    <span class="input-group__addon" aria-hidden="true">${LOCK_ICON}</span>
    <input id="${id}" type="password" autocomplete="new-password">
  </div>
</div>`
}

/** The events demo: a password, its score, and a Send button that is enabled above 75%. */
export function eventsHtml(inputId: string): string {
  return `<form id="events-form">
  ${fieldHtml({ id: inputId, label: 'Password' })}
  <p class="hint">Score: <output id="events-score" for="${inputId}">0%</output></p>
  <div class="actions">
    <button type="submit" id="send" class="btn btn--primary" disabled>Send</button>
    <p id="send-status" class="hint" role="status"></p>
  </div>
</form>`
}
