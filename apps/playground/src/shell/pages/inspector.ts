import { passwordField, textField } from '../components.ts'
import { attrs, rich, text } from '../t.ts'

const NUMBER_OPTIONS = [
  { id: 'opt-min-length', key: 'minLength', value: 8, min: 0 },
  { id: 'opt-target-bits', key: 'targetBits', value: 100, min: 1 },
  { id: 'opt-lowercase', key: 'lowercase', value: 0, min: 0 },
  { id: 'opt-uppercase', key: 'uppercase', value: 0, min: 0 },
  { id: 'opt-numbers', key: 'numbers', value: 0, min: 0 },
  { id: 'opt-symbols', key: 'symbols', value: 0, min: 0 },
]

/** The meter of the inspector: the bindings' markup, drawn from the core result by pages/inspector/+client.ts. */
const METER = `<div class="pass-wrapper pass-level-empty pass-invalid" id="meter-wrapper">
          <div class="pass-meter" id="meter" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Type your password">
            <div class="pass-bar" id="meter-bar" style="width: 0%"></div>
          </div>
          <span class="pass-percent" id="meter-percent">0%</span>
          <span class="pass-text" id="meter-text" aria-live="polite">Type your password</span>
        </div>`

function numberField({ id, key, value, min }: typeof NUMBER_OPTIONS[number]): string {
  return `<div class="field field--number">
                ${text('label', `inspector.options.${key}.label`, { class: 'field__label', for: id })}
                <input${attrs({ 'class': 'input input--number', id, 'type': 'number', min, 'step': 1, value, 'inputmode': 'numeric', 'aria-describedby': `${id}-hint` })}>
                ${text('p', `inspector.options.${key}.hint`, { class: 'hint', id: `${id}-hint` })}
              </div>`
}

function stat(id: string, key: string, initial: string, extraClass = ''): string {
  return `<div class="stat ${extraClass}">
              ${text('dt', `inspector.result.${key}`, { class: 'stat__label' })}
              <dd class="stat__value" id="${id}">${initial}</dd>
            </div>`
}

export function inspectorMain(): string {
  return `<div class="page-head">
        <div class="page-head__inner">
          <p class="eyebrow"><span class="eyebrow__pkg">@passcore/core</span></p>
          ${text('h1', 'inspector.title', { class: 'page-title' })}
          ${rich('p', 'inspector.lead', { class: 'lead' })}
        </div>
      </div>

      <div class="inspector">
          <section class="panel inspector__input" aria-labelledby="input-title">
            ${text('h2', 'inspector.input.title', { id: 'input-title', class: 'panel__title' })}
            ${passwordField({ id: 'password', label: 'field.password', input: { 'aria-describedby': 'meter-text' }, after: METER, className: 'field field--hero' })}
            ${textField({ id: 'personal', label: 'inspector.input.personal', placeholder: 'inspector.input.personalPlaceholder', hint: 'inspector.input.personalHint' })}
          </section>

        <section class="panel inspector__result" aria-labelledby="result-title">
          ${text('h2', 'inspector.result.title', { id: 'result-title', class: 'panel__title' })}
          <dl class="stats">
            ${stat('out-bits', 'bits', '0.0', 'stat--bits')}
            ${stat('out-percent', 'percent', '0%')}
            ${stat('out-level', 'level', '<code>empty</code>')}
            ${stat('out-valid', 'valid', '<code>false</code>')}
          </dl>
          <div class="gauge" aria-hidden="true">
            <div class="gauge__track"><div class="gauge__fill" id="gauge-fill"></div></div>
            <ol class="gauge__levels">
              ${['very-weak', 'weak', 'fair', 'good', 'strong'].map((level) => text('li', `level.${level}`, { 'data-level': level })).join('')}
            </ol>
          </div>

          ${text('h3', 'inspector.result.message', { class: 'panel__subtitle' })}
          <dl class="kv">
            <div class="kv__row">${text('dt', 'inspector.result.key')}<dd><code id="out-message-key">empty</code></dd></div>
            <div class="kv__row">${text('dt', 'inspector.result.params')}<dd><code id="out-message-params">{}</code></dd></div>
            <div class="kv__row">${text('dt', 'inspector.result.translated')}<dd id="out-message-text">Type your password</dd></div>
          </dl>

          ${text('h3', 'inspector.result.rules', { class: 'panel__subtitle', id: 'rules-title' })}
          <div class="table-wrap">
            <table class="rules-table" aria-labelledby="rules-title">
              <thead>
                <tr>
                  ${text('th', 'inspector.result.rule', { scope: 'col' })}
                  ${text('th', 'inspector.result.outcome', { scope: 'col' })}
                  ${text('th', 'inspector.result.ruleParams', { scope: 'col' })}
                </tr>
              </thead>
              <tbody id="out-rules"></tbody>
            </table>
          </div>

          <details class="raw">
            ${text('summary', 'inspector.result.raw')}
            <pre class="code__pre raw__pre"><code id="out-raw"></code></pre>
          </details>
        </section>

          <section class="panel inspector__options" aria-labelledby="options-title">
            <div class="panel__head">
              ${text('h2', 'inspector.options.title', { id: 'options-title', class: 'panel__title' })}
              ${text('button', 'inspector.options.reset', { type: 'button', id: 'reset-options', class: 'btn btn--small btn--quiet' })}
            </div>
            ${rich('p', 'inspector.options.text', { class: 'hint' })}
            <form id="options" class="options" novalidate>
              <div class="options__grid">
              ${NUMBER_OPTIONS.map(numberField).join('\n              ')}
              </div>
              <div class="field">
                ${text('label', 'inspector.options.words.label', { class: 'field__label', for: 'opt-words' })}
                <textarea${attrs({ 'class': 'input input--area', 'id': 'opt-words', 'rows': 3, 'spellcheck': 'false', 'aria-describedby': 'opt-words-hint', 'placeholder': 'acme, acme2024' })}></textarea>
                ${text('p', 'inspector.options.words.hint', { class: 'hint', id: 'opt-words-hint' })}
              </div>
            </form>
          </section>
      </div>`
}
