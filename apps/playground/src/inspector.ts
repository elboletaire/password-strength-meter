import '@passcore/jquery/styles.css'
import { commonPasswords, createMeter, translationParams, type MeterResult, type PartialOptions } from '@passcore/core'
import i18next from 'i18next'
import { currentLang, LANGS, locales, onLanguageChange, type Lang } from './site'

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing #${id} in index.html`)
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

// i18next with the three bundled files, in the `passcore` namespace
const i18n = i18next.createInstance()
void i18n.init({
  lng: currentLang(),
  fallbackLng: 'en',
  defaultNS: 'passcore',
  ns: ['passcore'],
  resources: Object.fromEntries(LANGS.map((lang) => [lang, { passcore: locales[lang] }])),
  interpolation: { escapeValue: false },
  initAsync: false,
})

const passwordInput = byId<HTMLInputElement>('password')
const toggleButton = byId<HTMLButtonElement>('toggle-password')
const personalInput = byId<HTMLInputElement>('personal')
const meterWrapper = byId<HTMLElement>('meter-wrapper')
const meterElement = byId<HTMLElement>('meter')
const meterBar = byId<HTMLElement>('meter-bar')
const meterPercent = byId<HTMLElement>('meter-percent')
const meterText = byId<HTMLElement>('meter-text')
const outBits = byId<HTMLElement>('out-bits')
const outPercent = byId<HTMLElement>('out-percent')
const outLevel = byId<HTMLElement>('out-level')
const outValid = byId<HTMLElement>('out-valid')
const outMessageKey = byId<HTMLElement>('out-message-key')
const outMessageParams = byId<HTMLElement>('out-message-params')
const outMessageText = byId<HTMLElement>('out-message-text')
const outRules = byId<HTMLTableSectionElement>('out-rules')
const outRaw = byId<HTMLElement>('out-raw')
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
  const options: PartialOptions = {
    targetBits: Math.max(1, readNumber(optionInputs.targetBits, DEFAULT_OPTIONS.targetBits)),
    rules: {
      minLength: readNumber(optionInputs.minLength, DEFAULT_OPTIONS.minLength),
      lowercase: readNumber(optionInputs.lowercase, DEFAULT_OPTIONS.lowercase),
      uppercase: readNumber(optionInputs.uppercase, DEFAULT_OPTIONS.uppercase),
      numbers: readNumber(optionInputs.numbers, DEFAULT_OPTIONS.numbers),
      symbols: readNumber(optionInputs.symbols, DEFAULT_OPTIONS.symbols),
    },
    commonWords: [...commonPasswords, ...splitList(wordsInput.value)],
  }
  return createMeter(options)
}

let meter = createMeterFromForm()

const translate = (key: string, params?: Record<string, number>): string => i18n.t(key, { ns: 'passcore', ...params })

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
  badge.textContent = passed ? 'passed' : 'failed'
  status.append(badge)

  const paramsCell = document.createElement('td')
  const entries = Object.entries(params)
  if (entries.length === 0) {
    paramsCell.textContent = '-'
  }
  else {
    paramsCell.append(codeElement(entries.map(([key, value]) => `${key}: ${value}`).join(', ')))
  }

  row.append(name, status, paramsCell)
  return row
}

function render(): void {
  const result: MeterResult = meter.evaluate(passwordInput.value, splitList(personalInput.value))
  const text = translate(result.message.key, translationParams(result.message))
  const levelText = translate(result.level === 'empty' ? 'empty' : `level.${result.level}`)

  // the meter, with the same markup and classes the bindings render
  meterWrapper.classList.remove(...LEVEL_CLASSES)
  meterWrapper.classList.add(`pass-level-${result.level}`)
  meterWrapper.classList.toggle('pass-invalid', !result.valid)
  meterElement.setAttribute('aria-valuenow', String(result.percent))
  meterElement.setAttribute('aria-valuetext', levelText)
  meterBar.style.width = `${result.percent}%`
  meterPercent.textContent = `${result.percent}%`
  meterText.textContent = text

  // everything the core returns
  outBits.textContent = result.bits.toFixed(1)
  outPercent.textContent = `${result.percent}%`
  outLevel.replaceChildren(codeElement(result.level))
  outValid.replaceChildren(codeElement(String(result.valid)))
  outMessageKey.textContent = result.message.key
  outMessageParams.textContent = JSON.stringify(result.message.params)
  outMessageText.textContent = text
  outRules.replaceChildren(...result.rules.map((rule) => ruleRow(rule.id, rule.passed, rule.params)))
  outRaw.textContent = JSON.stringify(result, null, 2)
}

toggleButton.addEventListener('click', () => {
  const reveal = passwordInput.type === 'password'
  passwordInput.type = reveal ? 'text' : 'password'
  toggleButton.setAttribute('aria-pressed', String(reveal))
})

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

onLanguageChange((lang: Lang) => {
  void i18n.changeLanguage(lang).then(() => {
    meterText.lang = lang
    outMessageText.lang = lang
    render()
  })
})

meterText.lang = currentLang()
outMessageText.lang = currentLang()
render()
