import { escapeHtml } from '../../common/escape.ts'
import { iconSvg, type IconName } from '../../common/icons.ts'
import { codeBlock, commandLine, passwordField, type CodeLang } from '../components.ts'
import { attrs, rich, tAttrs, text } from '../t.ts'

const SAMPLES = ['123456', 'qwerty123', 'P@ssw0rd!', 'Tr0ub4dor&3', 'correct horse battery staple']

const FEATURES: Array<{ id: string, icon: IconName }> = [
  { id: 'estimate', icon: 'gauge' },
  { id: 'rules', icon: 'checklist' },
  { id: 'a11y', icon: 'person' },
  { id: 'i18n', icon: 'globe' },
  { id: 'theme', icon: 'sliders' },
  { id: 'core', icon: 'cube' },
]

interface Binding {
  id: 'core' | 'jquery' | 'vanilla' | 'react' | 'vue' | 'svelte'
  monogram: string
  name: string
  href: string
  install: string
  lang: CodeLang
  code: string
}

const BINDINGS: Binding[] = [
  {
    id: 'core',
    monogram: '{}',
    name: '@passcore/core',
    href: './inspector.html',
    install: '@passcore/core',
    lang: 'ts',
    code: `import { createMeter } from '@passcore/core'

const meter = createMeter({ rules: { minLength: 10 } })
const result = meter.evaluate(password, [username])

result.percent // 0 to 100
result.message // { key: 'rule.minLength', params: { min: 10 } }`,
  },
  {
    id: 'jquery',
    monogram: '$',
    name: '@passcore/jquery',
    href: './jquery.html',
    install: '@passcore/jquery jquery',
    lang: 'js',
    code: `import $ from 'jquery'
import '@passcore/jquery'
import '@passcore/jquery/styles.css'

$('#password').password({ userInputs: ['#username'] })`,
  },
  {
    id: 'vanilla',
    monogram: 'JS',
    name: '@passcore/vanilla',
    href: './vanilla.html',
    install: '@passcore/vanilla',
    lang: 'js',
    code: `import { createPasswordMeter } from '@passcore/vanilla'
import '@passcore/vanilla/styles.css'

createPasswordMeter('#password', { showPercent: true })`,
  },
  {
    id: 'react',
    monogram: '</>',
    name: '@passcore/react',
    href: './react.html',
    install: '@passcore/react',
    lang: 'tsx',
    code: `import { PasswordStrengthMeter } from '@passcore/react'
import '@passcore/react/styles.css'

<PasswordStrengthMeter password={password} showPercent />`,
  },
  {
    id: 'vue',
    monogram: 'V',
    name: '@passcore/vue',
    href: './vue.html',
    install: '@passcore/vue',
    lang: 'vue',
    code: `<script setup>
import { PasswordStrengthMeter } from '@passcore/vue'
import '@passcore/vue/styles.css'
</script>

<template>
  <PasswordStrengthMeter :password="password" show-percent />
</template>`,
  },
  {
    id: 'svelte',
    monogram: 'S',
    name: '@passcore/svelte',
    href: './svelte.html',
    install: '@passcore/svelte',
    lang: 'svelte',
    code: `<script>
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import '@passcore/svelte/styles.css'
</script>

<PasswordStrengthMeter {password} showPercent />`,
  },
]

const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun']

function hero(): string {
  const chips = SAMPLES.map((sample) => `<button type="button" class="chip chip--mono" data-sample="${sample}">${sample}</button>`).join('\n            ')
  return `<section class="hero" aria-labelledby="hero-title">
        <div class="hero__inner">
          <div class="hero__copy">
            ${text('p', 'home.eyebrow', { class: 'eyebrow' })}
            ${rich('h1', 'home.title', { id: 'hero-title', class: 'hero__title' })}
            ${text('p', 'home.lead', { class: 'lead hero__lead' })}
            <div class="hero__actions">
              <a class="btn btn--primary btn--large" href="./inspector.html">${text('span', 'home.ctaInspector')}${iconSvg('arrowRight', 18)}</a>
              <a class="btn btn--quiet btn--large" href="#bindings">${text('span', 'home.ctaBindings')}</a>
            </div>
          </div>

          <section class="tryit" aria-labelledby="tryit-title">
            <div class="tryit__head">
              ${text('h2', 'home.try.title', { id: 'tryit-title', class: 'tryit__title' })}
              <span class="badge badge--mono">@passcore/vanilla</span>
            </div>
            ${passwordField({ id: 'hero-password', label: 'home.try.label', className: 'field tryit__field' })}
            <dl class="readout">
              <div class="readout__item">
                ${text('dt', 'home.try.bits')}
                <dd><span class="readout__big" id="hero-bits">0</span> ${text('span', 'home.try.bitsUnit', { class: 'readout__unit' })}</dd>
              </div>
              <div class="readout__item">
                ${text('dt', 'home.try.level')}
                <dd id="hero-level" class="readout__level">—</dd>
              </div>
              <div class="readout__item">
                ${text('dt', 'home.try.rules')}
                <dd id="hero-rules" class="readout__rules">—</dd>
              </div>
            </dl>
            <div class="tryit__samples">
              ${text('p', 'home.try.samples', { id: 'samples-label', class: 'tryit__samples-label' })}
              <div class="chips" role="group" aria-labelledby="samples-label">
            ${chips}
              </div>
            </div>
            <p class="tryit__privacy">${iconSvg('lock', 16)}${text('span', 'footer.privacy')}</p>
          </section>
        </div>
      </section>`
}

function features(): string {
  const items = FEATURES.map(({ id, icon }) => `<li class="feature">
            <span class="feature__icon">${iconSvg(icon, 22)}</span>
            ${text('h3', `home.features.${id}.title`, { class: 'feature__title' })}
            ${rich('p', `home.features.${id}.text`, { class: 'feature__text' })}
          </li>`).join('\n          ')
  return `<section class="section" aria-labelledby="features-title">
        <div class="section__head">
          ${text('p', 'home.features.eyebrow', { class: 'eyebrow' })}
          ${text('h2', 'home.features.title', { id: 'features-title', class: 'section__title' })}
        </div>
        <ul class="features">
          ${items}
        </ul>
      </section>`
}

function bindings(): string {
  const cards = BINDINGS.map((binding) => `<li>
            <a class="binding-card" href="${binding.href}">
              <span class="binding-card__mono" aria-hidden="true">${escapeHtml(binding.monogram)}</span>
              ${text('span', `home.bindings.${binding.id}.title`, { class: 'binding-card__title' })}
              <code class="binding-card__pkg">${binding.name}</code>
              ${rich('span', `home.bindings.${binding.id}.text`, { class: 'binding-card__text' })}
              <span class="binding-card__more">${text('span', binding.id === 'core' ? 'home.bindings.openInspector' : 'home.bindings.seeDemos')}${iconSvg('arrowRight', 16)}</span>
            </a>
          </li>`).join('\n          ')
  return `<section class="section" id="bindings" aria-labelledby="bindings-title" tabindex="-1">
        <div class="section__head">
          ${text('p', 'home.bindings.eyebrow', { class: 'eyebrow' })}
          ${text('h2', 'home.bindings.title', { id: 'bindings-title', class: 'section__title' })}
          ${text('p', 'home.bindings.lead', { class: 'lead' })}
        </div>
        <ul class="binding-cards">
          ${cards}
        </ul>
      </section>`
}

function install(): string {
  const tabs = BINDINGS.map((binding, index) => `<button${attrs({ 'type': 'button', 'role': 'tab', 'class': 'tabs__tab', 'id': `tab-${binding.id}`, 'aria-controls': `panel-${binding.id}`, 'aria-selected': index === 0 ? 'true' : 'false', 'tabindex': index === 0 ? undefined : '-1' })}>${binding.name.replace('@passcore/', '')}</button>`).join('\n              ')
  const panels = BINDINGS.map((binding, index) => `<div${attrs({ 'role': 'tabpanel', 'class': 'tabs__panel', 'id': `panel-${binding.id}`, 'aria-labelledby': `tab-${binding.id}`, 'hidden': index !== 0 })}>
              ${commandLine(`pnpm add ${binding.install}`, { 'class': 'command', 'data-install': binding.install })}
              ${codeBlock(binding.code, binding.lang)}
            </div>`).join('\n            ')
  const managers = PACKAGE_MANAGERS.map((manager, index) => `<label class="segmented__option"><input${attrs({ type: 'radio', name: 'pm', value: manager, checked: index === 0 })}><span>${manager}</span></label>`).join('')

  return `<section class="section" aria-labelledby="install-title">
        <div class="section__head">
          ${text('p', 'home.install.eyebrow', { class: 'eyebrow' })}
          ${text('h2', 'home.install.title', { id: 'install-title', class: 'section__title' })}
          ${text('p', 'home.install.lead', { class: 'lead' })}
        </div>
        <div class="install">
          <div class="install__bar">
            <div${attrs({ 'class': 'tabs__list', 'role': 'tablist', 'data-tabs': true, ...tAttrs({ 'aria-label': 'home.install.packages' }) })}>
              ${tabs}
            </div>
            <fieldset class="segmented">
              ${text('legend', 'home.install.manager', { class: 'visually-hidden' })}
              ${managers}
            </fieldset>
          </div>
          <div class="install__panels">
            ${panels}
          </div>
        </div>
      </section>`
}

export function homeMain(): string {
  return [hero(), features(), bindings(), install()].join('\n\n      ')
}
