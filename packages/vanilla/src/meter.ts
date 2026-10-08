import {
  createMeter,
  createTranslator,
  translationParams,
  type Level,
  type MeterOptions,
  type Result,
  type Translate,
  type Translations,
} from '@passcore/core'
import en from '../../../locales/en.json'

/**
 * A user input: a selector (every match contributes its value) or an element. `userInputs` also takes functions.
 * Selectors are read on every evaluation.
 */
export type FieldRef = string | Element

export interface PasswordMeterOptions extends MeterOptions {
  /** Texts in i18next's JSON format, deep-merged over the bundled English ones. */
  translations?: Translations
  /** Locale used to pick plural forms. Default 'en'. */
  locale?: string
  /** Translates a message key with its params (e.g. i18next's `t`); replaces `translations` and `locale`. */
  translate?: Translate
  /** Show the score percentage. Default false. */
  showPercent?: boolean
  /** Show the message. Default true. */
  showText?: boolean
  /** aria-label of the meter, read at creation. Default 'Password strength'. */
  label?: string
  /**
   * Values the password must not contain (username, email...), read on every evaluation.
   * A string is a selector (not a value): to pass a value, use a function such as `() => 'john'`.
   */
  userInputs?: Array<FieldRef | (() => string)>
  /** Element, or selector, the markup is appended to. Default: right after the input. */
  container?: string | Element
  /** Hide the meter until the input is focused. Default false. */
  hideUntilFocus?: boolean
  /** Called when the result changes, after creation. */
  onScore?: (percent: number, result: Result) => void
  /** Called when the message (key or params) changes, after creation. */
  onText?: (text: string, result: Result) => void
  /** Attach the input, focus and blur listeners. Default true. */
  listen?: boolean
}

export interface PasswordMeter {
  /** The last evaluation. */
  readonly result: Result
  /**
   * Evaluates the input now (e.g. after a user input changed) and renders it.
   * Fires the callbacks and events when the result or the message changed.
   */
  refresh(): Result
  /** Shows the meter when `hideUntilFocus` is set (what the focus listener does). */
  focus(): void
  /** Hides the meter when `hideUntilFocus` is set and the input is empty (what the blur listener does). */
  blur(): void
  /** Removes the markup and the listeners, and restores `aria-describedby`. */
  destroy(): void
}

const LEVEL_CLASSES = (['empty', 'very-weak', 'weak', 'fair', 'good', 'strong'] as Level[])
  .map((level) => 'pass-level-' + level)

let uid = 0

function element(tag: string, className: string, doc: Document): HTMLElement {
  const el = doc.createElement(tag)
  el.className = className
  return el
}

/** The values of a user input: every element matching a selector, an element, or a function's result. */
function valuesOf(ref: FieldRef | (() => string), doc: Document): string[] {
  if (typeof ref === 'function') {
    return [String(ref() ?? '')]
  }
  const fields: Element[] = typeof ref === 'string' ? Array.from(doc.querySelectorAll(ref)) : [ref]
  return fields.map((field) => {
    const value = (field as { value?: unknown }).value
    return value === undefined || value === null ? '' : String(value)
  })
}

/** Whether two values are equal by value (they are JSON-serializable results and messages). */
const sameValue = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

/**
 * Adds a password strength meter next to an input, and keeps it updated as the user types.
 * Listens to the input's `input` event, and to focus and blur when `hideUntilFocus` is set.
 */
export function createPasswordMeter(input: HTMLInputElement | string, options: PasswordMeterOptions = {}): PasswordMeter {
  const {
    translations,
    locale = 'en',
    translate,
    showPercent = false,
    showText = true,
    label = 'Password strength',
    userInputs = [],
    container,
    hideUntilFocus = false,
    onScore,
    onText,
    listen = true,
    ...core
  } = options

  const field = typeof input === 'string' ? document.querySelector<HTMLInputElement>(input) : input
  if (!field) {
    throw new Error(`createPasswordMeter: no input matches "${input}"`)
  }
  const doc = field.ownerDocument

  // strings are selectors, not values: fail early and clearly, instead of on every keystroke
  for (const ref of userInputs) {
    if (typeof ref === 'string') {
      try {
        doc.querySelector(ref)
      }
      catch {
        throw new Error(`createPasswordMeter: the userInputs entry "${ref}" is not a valid selector. Strings are selectors, not values: to pass a value, use a function such as () => 'john'`)
      }
    }
  }

  let host: Element | null = null
  if (typeof container === 'string') {
    host = doc.querySelector(container)
    if (!host) {
      throw new Error(`createPasswordMeter: no container matches "${container}"`)
    }
  }
  else if (container) {
    host = container
  }

  const bar = element('div', 'pass-bar', doc)
  const meterEl = element('div', 'pass-meter', doc)
  meterEl.setAttribute('role', 'meter')
  meterEl.setAttribute('aria-label', label)
  meterEl.setAttribute('aria-valuemin', '0')
  meterEl.setAttribute('aria-valuemax', '100')
  meterEl.append(bar)

  const wrapper = element('div', 'pass-wrapper', doc)
  wrapper.append(meterEl)

  let percentEl: HTMLElement | undefined
  if (showPercent) {
    percentEl = element('span', 'pass-percent', doc)
    wrapper.append(percentEl)
  }

  let textEl: HTMLElement | undefined
  let addedId: string | undefined
  if (showText) {
    const id = `${field.id || 'passcore-' + (++uid)}-strength`
    textEl = element('span', 'pass-text', doc)
    textEl.id = id
    textEl.setAttribute('aria-live', 'polite')
    wrapper.append(textEl)
    const describedBy = field.getAttribute('aria-describedby')
    field.setAttribute('aria-describedby', describedBy ? `${describedBy} ${id}` : id)
    addedId = id
  }

  // the element that gets pass-strength-visible: the container, or the input's parent
  const visibilityHost = host ?? field.parentElement
  if (host) {
    host.append(wrapper)
  }
  else if (field.parentNode) {
    field.after(wrapper)
  }
  else {
    throw new Error('createPasswordMeter: the input has no parent, pass a container')
  }

  // an input that is already focused or filled (autofill, a re-created element) shows the meter
  const hadVisibleClass = visibilityHost?.classList.contains('pass-strength-visible') ?? false
  let shown = !hideUntilFocus || doc.activeElement === field || field.value !== ''
  const setShown = (value: boolean): void => {
    shown = value
    wrapper.classList.toggle('pass-hidden', hideUntilFocus && !value)
    visibilityHost?.classList.toggle('pass-strength-visible', value)
  }
  setShown(shown)

  const meter = createMeter(core)
  const translator = translate ?? createTranslator([en, translations ?? {}], locale)

  /** Evaluates the input and renders it. Returns the result and the message text. */
  const update = (): { result: Result, text: string } => {
    const values = userInputs.flatMap((ref) => valuesOf(ref, doc))
    const result = meter.evaluate(field.value, values.filter((value) => value.length > 0))

    const levelKey = result.level === 'empty' ? 'empty' : `level.${result.level}` as const
    const text = translator(result.message.key, translationParams(result.message))
    wrapper.classList.remove(...LEVEL_CLASSES)
    wrapper.classList.add('pass-level-' + result.level)
    wrapper.classList.toggle('pass-invalid', !result.valid)
    meterEl.setAttribute('aria-valuenow', String(result.percent))
    meterEl.setAttribute('aria-valuetext', translator(levelKey))
    bar.style.width = result.percent + '%'
    if (percentEl && percentEl.textContent !== result.percent + '%') {
      percentEl.textContent = result.percent + '%'
    }
    // only touch the live region when the text changes: replacing the node makes some screen readers repeat it
    if (textEl && textEl.textContent !== text) {
      textEl.textContent = text
    }
    return { result, text }
  }

  // the initial state, without firing events
  let current = update().result

  const refresh = (): Result => {
    const previous = current
    const { result, text } = update()
    current = result
    if (!sameValue(previous, result)) {
      onScore?.(result.percent, result)
      field.dispatchEvent(new CustomEvent('passcore:score', { bubbles: true, detail: { percent: result.percent, result } }))
    }
    if (!sameValue(previous.message, result.message)) {
      onText?.(text, result)
      field.dispatchEvent(new CustomEvent('passcore:text', { bubbles: true, detail: { text, result } }))
    }
    return result
  }

  const focus = (): void => {
    if (hideUntilFocus) {
      setShown(true)
    }
  }

  const blur = (): void => {
    if (hideUntilFocus && !field.value) {
      setShown(false)
    }
  }

  const listeners: Array<[string, () => void]> = []
  if (listen) {
    listeners.push(['input', refresh])
    if (hideUntilFocus) {
      listeners.push(['focus', focus], ['blur', blur])
    }
    for (const [type, handler] of listeners) {
      field.addEventListener(type, handler)
    }
  }

  return {
    get result() {
      return current
    },
    refresh,
    focus,
    blur,
    destroy() {
      for (const [type, handler] of listeners) {
        field.removeEventListener(type, handler)
      }
      listeners.length = 0
      wrapper.remove()
      visibilityHost?.classList.toggle('pass-strength-visible', hadVisibleClass)
      if (addedId) {
        const rest = (field.getAttribute('aria-describedby') ?? '')
          .split(/\s+/)
          .filter((id) => id && id !== addedId)
        if (rest.length) {
          field.setAttribute('aria-describedby', rest.join(' '))
        }
        else {
          field.removeAttribute('aria-describedby')
        }
      }
    },
  }
}
