import { highlight } from '../common/highlight'
import { isDark, onThemeChange } from './site'

/**
 * The theming studio (markup: src/shell/studio.ts). The controls set the packages' custom properties on
 * the preview only, and the code panel shows the CSS they add up to.
 */

type Values = Record<string, string>

const COLOR_VARS = ['--pass-color-very-weak', '--pass-color-weak', '--pass-color-fair', '--pass-color-good', '--pass-color-strong']

/** The site's own meter colours (keep in sync with the `--pass-*` properties of src/style.css). */
function themeDefaults(dark: boolean): Values {
  return dark
    ? {
        '--pass-height': '6px',
        '--pass-track': '#2b3038',
        '--pass-color-very-weak': '#f2555a',
        '--pass-color-weak': '#f5893a',
        '--pass-color-fair': '#f0c02a',
        '--pass-color-good': '#97d13a',
        '--pass-color-strong': '#3ccf7c',
      }
    : {
        '--pass-height': '6px',
        '--pass-track': '#e4e2db',
        '--pass-color-very-weak': '#d92d20',
        '--pass-color-weak': '#e06a0f',
        '--pass-color-fair': '#c99400',
        '--pass-color-good': '#5e9e0f',
        '--pass-color-strong': '#16884a',
      }
}

const PRESETS: Record<string, (dark: boolean) => Values> = {
  ocean: (dark) => ({
    '--pass-height': '8px',
    '--pass-track': dark ? '#1b2a3a' : '#dbe7f3',
    ...colors(dark
      ? ['#a78bfa', '#818cf8', '#60a5fa', '#22d3ee', '#2dd4bf']
      : ['#7c3aed', '#4f46e5', '#2563eb', '#0891b2', '#0d9488']),
  }),
  mono: (dark) => ({
    '--pass-height': '4px',
    '--pass-track': dark ? '#262a30' : '#e6e6e6',
    ...colors(dark
      ? ['#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#f9fafb']
      : ['#c4c7cc', '#9ca3af', '#6b7280', '#374151', '#111827']),
  }),
  neon: (dark) => ({
    '--pass-height': '12px',
    '--pass-track': dark ? '#16121f' : '#1f1a2e',
    ...colors(['#ff2e88', '#ff8a00', '#ffe600', '#7cff00', '#00f0ff']),
  }),
}

function colors(values: string[]): Values {
  return Object.fromEntries(COLOR_VARS.map((name, index) => [name, values[index] ?? '#000000']))
}

export function initStudio(): void {
  const preview = document.getElementById('studio-preview')
  const code = document.querySelector('[data-studio-code] pre code')
  if (!preview || !code) {
    throw new Error('Missing the theming studio in the page')
  }
  const controls = Array.from(document.querySelectorAll<HTMLInputElement>('.studio [data-var]'))

  /** What the controls show: the theme's defaults, a preset, or the visitor's own colours. */
  let source: { kind: 'theme' } | { kind: 'preset', name: string } | { kind: 'custom' } = { kind: 'theme' }
  let values: Values = themeDefaults(isDark())

  const presetButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-preset]'))

  const render = (): void => {
    // the preset in use is pressed; the visitor's own colours press none
    for (const button of presetButtons) {
      const name = button.dataset.preset
      if (name !== 'reset') {
        button.setAttribute('aria-pressed', String(source.kind === 'preset' && source.name === name))
      }
    }
    for (const control of controls) {
      const name = control.dataset.var ?? ''
      const value = values[name] ?? ''
      control.value = control.type === 'range' ? String(parseFloat(value)) : value
      preview.style.setProperty(name, value)
      const output = control.closest('label')?.querySelector('output')
      if (output) {
        output.textContent = value
      }
    }
    const lines = ['--pass-height', '--pass-track', ...COLOR_VARS].map((name) => `  ${name}: ${values[name] ?? ''};`)
    code.innerHTML = highlight(`.signup {\n${lines.join('\n')}\n}`)
  }

  for (const control of controls) {
    control.addEventListener('input', () => {
      values = { ...values, [control.dataset.var ?? '']: control.value + (control.dataset.unit ?? '') }
      source = { kind: 'custom' }
      render()
    })
  }

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.preset ?? ''
      const preset = PRESETS[name]
      source = preset ? { kind: 'preset', name } : { kind: 'theme' }
      values = preset ? preset(isDark()) : themeDefaults(isDark())
      render()
    })
  })

  // a theme change brings the theme's colours, unless the visitor picked their own
  onThemeChange(() => {
    if (source.kind === 'theme') {
      values = themeDefaults(isDark())
    }
    else if (source.kind === 'preset') {
      values = PRESETS[source.name]?.(isDark()) ?? values
    }
    render()
  })

  render()
}
