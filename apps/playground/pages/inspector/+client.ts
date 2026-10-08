import '../../src/lib/site'
import '@passcore/vanilla/styles.css'
import { commonPasswords, createMeter, translationParams, type MeterOptions, type Result } from '@passcore/core'
import { formatNumber, meterLabel, t, translate } from '../../src/lib/i18n'
import { onLanguageChange } from '../../src/lib/lang'

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing #${id} in the inspector page`)
  }
  return element as T
}

const DEFAULT_OPTIONS = {
  minLength: 8,
  targetBits: 100,
  lowercase: 0,
  uppercase: 0,
  numbers: 0,
  symbols: 0,
}

const LEVEL_CLASSES = ['empty', 'very-weak', 'weak', 'fair', 'good', 'strong'].map((level) => `pass-level-${level}`)

const passwordInput = byId<HTMLInputElement>('password')
const personalInput = byId<HTMLInputElement>('personal')
const meterWrapper = byId('meter-wrapper')
const meterElement = byId('meter')
const meterBar = byId('meter-bar')
const meterPercent = byId('meter-percent')
const meterText = byId('meter-text')
const gaugeFill = byId('gauge-fill')
const outBits = byId('out-bits')
const outPercent = byId('out-percent')
const outLevel = byId('out-level')
const outValid = byId('out-valid')
const outMessageKey = byId('out-message-key')
const outMessageParams = byId('out-message-params')
const outMessageText = byId('out-message-text')
const outRules = byId<HTMLTableSectionElement>('out-rules')
const outRaw = byId('out-raw')
const optionsForm = byId<HTMLFormElement>('options')
const optionInputs = {
  minLength: byId<HTMLInputElement>('opt-min-length'),
  targetBits: byId<HTMLInputElement>('opt-target-bits'),
  lowercase: byId<HTMLInputElement>('opt-lowercase'),
  uppercase: byId<HTMLInputElement>('opt-uppercase'),
  numbers: byId<HTMLInputElement>('opt-numbers'),
  symbols: byId<HTMLInputElement>('opt-symbols'),
}
const wordsInput = byId<HTMLTextAreaElement>('opt-words')
const resetButton = byId<HTMLButtonElement>('reset-options')

/** Comma or line separated values, trimmed, without empty entries. */
const splitList = (value: string): string[] => value
  .split(/[,\n]/)
  .map((item) => item.trim())
  .filter((item) => item.length > 0)

/** A whole number from an input, or the fallback when it's empty or invalid. */
const readNumber = (input: HTMLInputElement, fallback: number): number => {
  const value = input.valueAsNumber
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback
}

/** Creates the core meter from the options form. Word list and rules are prepared once per change. */
function createMeterFromForm() {
  const options: MeterOptions = {
    targetBits: Math.max(1, readNumber(optionInputs.targetBits, DEFAULT_OPTIONS.targetBits)),
    rules: {
      minLength: readNumber(optionInputs.minLength, DEFAULT_OPTIONS.minLength),
      lowercase: readNumber(optionInputs.lowercase, DEFAULT_OPTIONS.lowercase),
      uppercase: readNumber(optionInputs.uppercase, DEFAULT_OPTIONS.uppercase),
      numbers: readNumber(optionInputs.numbers, DEFAULT_OPTIONS.numbers),
      symbols: readNumber(optionInputs.symbols, DEFAULT_OPTIONS.symbols),
    },
    commonPasswords: [...commonPasswords, ...splitList(wordsInput.value)],
  }
  return createMeter(options)
}

let meter = createMeterFromForm()

function codeElement(text: string): HTMLElement {
  const code = document.createElement('code')
  code.textContent = text
  return code
}

function ruleRow(id: string, passed: boolean, params: Record<string, number>): HTMLTableRowElement {
  const row = document.createElement('tr')

  const name = document.createElement('th')
  name.scope = 'row'
  name.append(codeElement(id))

  const status = document.createElement('td')
  const badge = document.createElement('span')
  badge.className = passed ? 'badge badge--ok' : 'badge badge--bad'
  badge.textContent = t(passed ? 'inspector.result.passed' : 'inspector.result.failed')
  status.append(badge)

  const paramsCell = document.createElement('td')
  const entries = Object.entries(params)
  if (entries.length === 0) {
    const none = document.createElement('span')
    none.className = 'muted'
    none.textContent = t('inspector.result.none')
    paramsCell.append(none)
  }
  else {
    paramsCell.append(codeElement(entries.map(([key, value]) => `${key}: ${value}`).join(', ')))
  }

  row.append(name, status, paramsCell)
  return row
}

function render(): void {
  const result: Result = meter.evaluate(passwordInput.value, splitList(personalInput.value))
  const text = translate(result.message.key, translationParams(result.message))
  const levelText = translate(result.level === 'empty' ? 'empty' : `level.${result.level}`)

  // the meter, with the markup and classes of the bindings
  meterWrapper.classList.remove(...LEVEL_CLASSES)
  meterWrapper.classList.add(`pass-level-${result.level}`)
  meterWrapper.classList.toggle('pass-invalid', !result.valid)
  meterElement.setAttribute('aria-label', meterLabel())
  meterElement.setAttribute('aria-valuenow', String(result.percent))
  meterElement.setAttribute('aria-valuetext', levelText)
  meterBar.style.width = `${result.percent}%`
  meterPercent.textContent = `${result.percent}%`
  if (meterText.textContent !== text) {
    meterText.textContent = text
  }

  // everything the core returns
  outBits.textContent = formatNumber(result.bits, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  outPercent.textContent = formatNumber(result.percent / 100, { style: 'percent' })
  outLevel.replaceChildren(codeElement(result.level))
  outValid.replaceChildren(codeElement(String(result.valid)))
  outValid.dataset.valid = String(result.valid)
  gaugeFill.style.width = `${result.percent}%`
  gaugeFill.dataset.level = result.level
  outMessageKey.textContent = result.message.key
  outMessageParams.textContent = JSON.stringify(result.message.params)
  outMessageText.textContent = text
  outRules.replaceChildren(...result.rules.map((rule) => ruleRow(rule.id, rule.passed, rule.params)))
  outRaw.textContent = JSON.stringify(result, null, 2)
}

passwordInput.addEventListener('input', render)
personalInput.addEventListener('input', render)

optionsForm.addEventListener('submit', (event) => event.preventDefault())
optionsForm.addEventListener('input', () => {
  meter = createMeterFromForm()
  render()
})

resetButton.addEventListener('click', () => {
  optionInputs.minLength.value = String(DEFAULT_OPTIONS.minLength)
  optionInputs.targetBits.value = String(DEFAULT_OPTIONS.targetBits)
  optionInputs.lowercase.value = String(DEFAULT_OPTIONS.lowercase)
  optionInputs.uppercase.value = String(DEFAULT_OPTIONS.uppercase)
  optionInputs.numbers.value = String(DEFAULT_OPTIONS.numbers)
  optionInputs.symbols.value = String(DEFAULT_OPTIONS.symbols)
  wordsInput.value = ''
  meter = createMeterFromForm()
  render()
})

// the i18n module changes the language on the same event, before this listener runs
onLanguageChange(render)

render()
