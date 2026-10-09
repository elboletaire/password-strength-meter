import '../../src/lib/site'
import '@passcore/vanilla/styles.css'
import type { Result } from '@passcore/core'
import { createPasswordMeter } from '@passcore/vanilla'
import { REQUIREMENT_RULES, renderChecklist } from '../../src/lib/checklist'
import { formatNumber, locales, meterLabel, t } from '../../src/lib/i18n'
import { currentLang } from '../../src/lib/lang'

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

function show(result: Result): void {
  bits.textContent = formatNumber(Math.round(result.bits))
  level.textContent = t(`level.${result.level}`)
  level.dataset.level = result.level
  const passed = result.rules.filter((rule) => rule.passed).length
  rules.textContent = result.level === 'empty' ? '—' : t('home.try.rulesValue', { passed, total: result.rules.length })
}

const meter = createPasswordMeter(input, {
  translations: locales[currentLang()],
  locale: currentLang(),
  label: meterLabel(),
  showPercent: true,
  onScore: (_percent, result) => show(result),
})

show(meter.result)

document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.dataset.sample ?? ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
})

// the requirements checklist: @passcore/vanilla again, its `result.rules` drawn as a checklist
const signupInput = byId<HTMLInputElement>('home-password')

const signup = createPasswordMeter(signupInput, {
  translations: locales[currentLang()],
  locale: currentLang(),
  label: meterLabel(),
  userInputs: ['#home-username'],
  rules: REQUIREMENT_RULES,
  onScore: (_percent, result) => renderChecklist('home-checklist', result.rules, signupInput.value !== ''),
})

renderChecklist('home-checklist', signup.result.rules, signupInput.value !== '')

// the username is read on each update: refresh when it changes
byId('home-username').addEventListener('input', () => signup.refresh())
