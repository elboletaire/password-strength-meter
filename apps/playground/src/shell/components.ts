import { escapeHtml } from '../common/escape.ts'
import { highlight } from '../common/highlight.ts'
import { iconSvg } from '../common/icons.ts'
import { REQUIREMENTS, requirementKey } from '../common/requirements.ts'
import { attrs, tr, rich, tAttrs, text, type Attrs } from './t.ts'

/**
 * The building blocks of the pages, rendered at build time. The browser only binds them (see src/lib/).
 */

export interface PasswordFieldOptions {
  id: string
  /** Key of the label. Default: `field.password`. */
  label?: string
  autocomplete?: string
  /** Extra attributes of the input. */
  input?: Attrs
  /** Extra markup after the input box, inside the field (e.g. a `<passcore-meter>`). */
  after?: string
  /** Class of the field wrapper. Default `field`. */
  className?: string
}

/** The show/hide button of a password field: the browser side is `src/lib/reveal.ts`. */
export function revealButton(inputId: string): string {
  return `<button${attrs({ 'type': 'button', 'class': 'reveal', 'data-reveal': true, 'aria-controls': inputId, 'aria-pressed': 'false', 'aria-label': tr('reveal.show') })}>`
    + iconSvg('eye', 20, 'icon reveal__show')
    + iconSvg('eyeOff', 20, 'icon reveal__hide')
    + '</button>'
}

/** A password input with its show/hide button, in a `.pw` box (a `div`, so jQuery appends its meter right there). */
export function passwordBox(id: string, input: Attrs = {}, autocomplete = 'new-password'): string {
  return `<div class="pw">
  <input${attrs({ class: 'input pw__input', id, type: 'password', autocomplete, autocapitalize: 'off', spellcheck: 'false', ...input })}>
  ${revealButton(id)}
</div>`
}

export function passwordField({ id, label = 'field.password', autocomplete, input, after = '', className = 'field' }: PasswordFieldOptions): string {
  return `<div class="${className}">
  ${text('label', label, { class: 'field__label', for: id })}
  ${passwordBox(id, input, autocomplete)}
  ${after}
</div>`
}

export interface TextFieldOptions {
  id: string
  label: string
  placeholder?: string
  autocomplete?: string
  hint?: string
}

export function textField({ id, label, placeholder, autocomplete = 'off', hint }: TextFieldOptions): string {
  const hintId = hint ? `${id}-hint` : undefined
  return `<div class="field">
  ${text('label', label, { class: 'field__label', for: id })}
  <input${attrs({ 'class': 'input', id, 'type': 'text', autocomplete, 'autocapitalize': 'off', 'spellcheck': 'false', 'aria-describedby': hintId, ...(placeholder ? tAttrs({ placeholder }) : {}) })}>
  ${hint ? rich('p', hint, { class: 'hint', id: hintId }) : ''}
</div>`
}

/** The username field of the linked demos. */
export const usernameField = (id: string): string => textField({ id, label: 'field.username', placeholder: 'field.usernamePlaceholder', autocomplete: 'username' })

/** An input group: a lock addon and the password box, inside a `.form-group` with the given id. */
export function inputGroup(id: string, groupId: string): string {
  return `<div class="form-group field" id="${groupId}">
  ${text('label', 'field.password', { class: 'field__label', for: id })}
  <div class="input-group">
    <span class="input-group__addon" aria-hidden="true">${iconSvg('lock', 18)}</span>
    ${passwordBox(id)}
  </div>
</div>`
}

/** The events demo: a field, its score, and a Send button that is enabled above 75%. */
export function eventsForm(inputId: string): string {
  return `<form class="events" id="events-form" novalidate>
  ${passwordField({ id: inputId })}
  ${eventsFooter(inputId)}
</form>`
}

/** The score, the Send button and the status of the events demo. */
export function eventsFooter(inputId: string, scoreId = 'events-score', sendId = 'send', statusId = 'send-status'): string {
  return `<div class="events__bar">
    <p class="events__score"><span>${escapeHtml(tr('events.score'))}</span> <output id="${scoreId}" for="${inputId}">0%</output></p>
    <button type="submit" id="${sendId}" class="btn btn--primary" disabled>${text('span', 'events.send')}${iconSvg('arrowRight', 18)}</button>
  </div>
  ${text('p', 'events.hint', { class: 'hint' })}
  <p class="events__status" id="${statusId}" role="status"></p>`
}

export type CodeLang = 'js' | 'ts' | 'tsx' | 'html' | 'vue' | 'svelte' | 'css' | 'sh'

const LANG_LABELS: Record<CodeLang, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  html: 'HTML',
  vue: 'Vue',
  svelte: 'Svelte',
  css: 'CSS',
  sh: 'Shell',
}

/** A code panel: language, copy button, and the highlighted code (wrapped, so it reads on narrow screens). */
export function codeBlock(code: string, lang: CodeLang, extra: Attrs = {}): string {
  return `<div${attrs({ class: 'code', ...extra })}>
  <div class="code__bar">
    <span class="code__lang">${LANG_LABELS[lang]}</span>
    ${copyButton()}
  </div>
  <pre class="code__pre"><code>${highlight(code)}</code></pre>
</div>`
}

export function copyButton(): string {
  return `<button type="button" class="copy" data-copy>${iconSvg('copy', 16)}${text('span', 'code.copy', { class: 'copy__label' })}</button>`
}

/** A one-line shell command with a copy button. */
export function commandLine(command: string, extra: Attrs = {}): string {
  return `<div${attrs({ class: 'command', ...extra })}>
  <span class="command__prompt" aria-hidden="true">$</span>
  <code class="command__text">${escapeHtml(command)}</code>
  ${copyButton()}
</div>`
}

export interface Demo {
  /** The section id is `demo-${id}`. */
  id: string
  /** Key of the title. */
  title: string
  /** Key of the description (trusted HTML). */
  text: string
  /** The live demo: markup, or a `data-slot` a framework mounts into. */
  demo: string
  code: string
  lang: CodeLang
  /** Replaces the whole specimen (the theming studio). */
  body?: string
}

export function demoSection(demo: Demo, index: number): string {
  const number = String(index + 1).padStart(2, '0')
  const body = demo.body ?? `<div class="specimen">
    <div class="specimen__live">
      ${text('p', 'demo.live', { 'class': 'specimen__label', 'aria-hidden': 'true' })}
      ${demo.demo}
    </div>
    ${codeBlock(demo.code, demo.lang, { class: 'code specimen__code' })}
  </div>`
  return `<section class="demo" id="demo-${demo.id}" aria-labelledby="demo-${demo.id}-title">
  <div class="demo__head">
    <span class="demo__index" aria-hidden="true">${number}</span>
    ${text('h2', demo.title, { id: `demo-${demo.id}-title` })}
    ${rich('p', demo.text, { class: 'demo__text' })}
  </div>
  ${body}
</section>`
}

/** A framework slot: the component mounts into it; the minimum height keeps the page from jumping. */
export const slot = (name: string, minHeight = 7): string => `<div class="slot" data-slot="${name}" style="min-height: ${minHeight}rem"></div>`

/** The icons of a requirement: the stylesheet shows the one of its state (idle, met, unmet). */
export function requirementIcons(): string {
  return `<span class="req__icon" aria-hidden="true">${iconSvg('dash', 14, 'icon req__icon-idle')}${iconSvg('check', 14, 'icon req__icon-met')}${iconSvg('cross', 14, 'icon req__icon-unmet')}</span>`
}

/**
 * The requirements checklist of the plain pages (jQuery, vanilla, home): one item per rule, in the order the
 * core reports them, all neutral until the script sets `data-state` from `result.rules`. Screen readers hear
 * "met" or "not met" after each item (the stylesheet keeps only the one of the state), and the summary is a
 * polite live region, written by the script (not by the page translations, so a language switch updates it once).
 */
export function checklistHtml(id: string): string {
  const items = REQUIREMENTS.map((requirement) => {
    const [key, params] = requirementKey({ id: requirement.id, params: requirement.min === undefined ? {} : { min: requirement.min } })
    return `<li class="req" data-rule="${requirement.id}" data-state="idle">
      ${requirementIcons()}
      ${text('span', key, { class: 'req__label' }, params)}
      <span class="visually-hidden req__sr req__sr--met">, ${text('span', 'requirements.met')}</span>
      <span class="visually-hidden req__sr req__sr--unmet">, ${text('span', 'requirements.unmet')}</span>
    </li>`
  }).join('\n    ')
  return `<div class="reqs" id="${id}">
  ${text('p', 'requirements.title', { class: 'reqs__title', id: `${id}-title` })}
  <ul class="reqs__list" aria-labelledby="${id}-title">
    ${items}
  </ul>
  <p class="reqs__summary" id="${id}-summary" aria-live="polite">${escapeHtml(tr('requirements.summaryIdle', { total: REQUIREMENTS.length }))}</p>
</div>`
}
