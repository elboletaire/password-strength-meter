import '../lib/site'
import '@passcore/vanilla/styles.css'
import type { MeterResult } from '@passcore/core'
import { createPasswordMeter, type PasswordMeter } from '@passcore/vanilla'
import { formatNumber, locales, meterLabel, t } from '../lib/i18n'
import { currentLang, onLanguageChange } from '../lib/lang'

/**
 * The "try it" panel of the home page: @passcore/vanilla on a real input, with a readout of the result.
 */

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing #${id} in the page`)
  }
  return element as T
}

const input = byId<HTMLInputElement>('hero-password')
const bits = byId('hero-bits')
const level = byId('hero-level')
const rules = byId('hero-rules')

function show(result: MeterResult): void {
  bits.textContent = formatNumber(Math.round(result.bits))
  level.textContent = t(`level.${result.level}`)
  level.dataset.level = result.level
  const passed = result.rules.filter((rule) => rule.passed).length
  rules.textContent = result.level === 'empty' ? '—' : t('home.try.rulesValue', { passed, total: result.rules.length })
}

const create = (): PasswordMeter => createPasswordMeter(input, {
  translations: locales[currentLang()],
  locale: currentLang(),
  label: meterLabel(),
  showPercent: true,
  onScore: (_percent, result) => show(result),
})

let meter = create()
show(meter.result)

onLanguageChange(() => {
  meter.destroy()
  meter = create()
  show(meter.result)
})

document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.dataset.sample ?? ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
})
