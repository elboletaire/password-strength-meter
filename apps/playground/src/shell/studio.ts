import { codeBlock, type Demo } from './components.ts'
import { attrs, rich, tAttrs, text } from './t.ts'

/**
 * The theming studio, the last demo of every binding page: colour pickers and a slider over the custom
 * properties of the packages' stylesheet, a preview with a live field, and the CSS they add up to.
 * The browser side is `src/lib/studio.ts`.
 */

export const STUDIO_VARS = [
  { name: '--pass-color-very-weak', label: 'level.very-weak' },
  { name: '--pass-color-weak', label: 'level.weak' },
  { name: '--pass-color-fair', label: 'level.fair' },
  { name: '--pass-color-good', label: 'level.good' },
  { name: '--pass-color-strong', label: 'level.strong' },
  { name: '--pass-track', label: 'studio.track' },
] as const

const SAMPLES = [
  ['very-weak', 12],
  ['weak', 32],
  ['fair', 52],
  ['good', 72],
  ['strong', 100],
] as const

/** The CSS the studio starts with, before the browser fills in the theme's colours. */
const INITIAL_CSS = `.signup {
  --pass-height: 6px;
  --pass-track: #e4e2db;
  --pass-color-very-weak: #d92d20;
  --pass-color-weak: #e06a0f;
  --pass-color-fair: #c99400;
  --pass-color-good: #5e9e0f;
  --pass-color-strong: #16884a;
}`

/** `field` is the markup of the preview's password field, or a slot a framework mounts its field into. */
export function studioDemo(field: string): Demo {
  const samples = SAMPLES.map(([level, width]) => `<li class="sample">
          ${text('span', `level.${level}`, { class: 'sample__name' })}
          <div class="pass-wrapper pass-level-${level}" aria-hidden="true"><div class="pass-meter"><div class="pass-bar" style="width: ${width}%"></div></div></div>
        </li>`).join('\n')

  const colors = STUDIO_VARS.map(({ name, label }) => `<label class="color-control">
          <input${attrs({ 'type': 'color', 'data-var': name, 'value': '#000000' })}>
          <span class="color-control__text">${text('span', label, { class: 'color-control__name' })}<code>${name}</code></span>
        </label>`).join('\n')

  const body = `<div class="studio">
    <div class="studio__preview" id="studio-preview">
      ${text('p', 'demo.live', { 'class': 'specimen__label', 'aria-hidden': 'true' })}
      ${field}
      <ul class="samples"${attrs(tAttrs({ 'aria-label': 'studio.samples' }))}>
        ${samples}
      </ul>
    </div>
    <fieldset class="studio__controls">
      ${text('legend', 'studio.legend', { class: 'studio__legend' })}
      <div class="studio__colors">
        ${colors}
      </div>
      <label class="range-control">
        ${text('span', 'studio.height', { class: 'range-control__name' })}
        <input${attrs({ 'type': 'range', 'min': 2, 'max': 16, 'step': 1, 'value': 6, 'data-var': '--pass-height', 'data-unit': 'px' })}>
        <output class="range-control__value">6px</output>
      </label>
      <div class="studio__presets">
        ${text('span', 'studio.presets', { class: 'studio__presets-label', id: 'studio-presets-label' })}
        <div class="chips" role="group" aria-labelledby="studio-presets-label">
          ${text('button', 'studio.preset.ocean', { 'type': 'button', 'class': 'chip', 'data-preset': 'ocean' })}
          ${text('button', 'studio.preset.mono', { 'type': 'button', 'class': 'chip', 'data-preset': 'mono' })}
          ${text('button', 'studio.preset.neon', { 'type': 'button', 'class': 'chip', 'data-preset': 'neon' })}
          ${text('button', 'studio.reset', { 'type': 'button', 'class': 'chip chip--ghost', 'data-preset': 'reset' })}
        </div>
      </div>
    </fieldset>
    ${codeBlock(INITIAL_CSS, 'css', { 'class': 'code studio__code', 'data-studio-code': true })}
  </div>
  ${rich('p', 'studio.note', { class: 'hint studio__note' })}`

  return {
    id: 'theming',
    title: 'demo.theming.title',
    text: 'demo.theming.text',
    demo: '',
    code: '',
    lang: 'css',
    body,
  }
}
