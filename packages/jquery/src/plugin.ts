import {
  createMeter,
  createTranslator,
  translationParams,
  type Level,
  type Meter,
  type MeterOptions,
  type Result,
  type Translate,
  type Translations,
} from '@passcore/core'
import en from '../../../locales/en.json'

/** A field whose value the password must not contain: a selector, an element, a jQuery object or a function returning the value. */
export type FieldRef = JQuery.Selector | Element | JQuery | (() => string)

interface PluginOptions {
  /** Fields whose values the password must not contain (username, email...), read on every update. */
  userInputs: FieldRef[]
  /** Translations in i18next's JSON format, layered over the bundled English ones. */
  translations: Translations
  /** Locale used to pick plural forms. */
  locale: string
  /** Translates a message key with its params (e.g. i18next's `t`); replaces `translations` and `locale`. */
  translate?: Translate
  /** Show the score percentage. */
  showPercent: boolean
  /** Show the message. */
  showText: boolean
  /** Accessible name of the meter (its `aria-label`), read at creation. */
  label: string
  /** Hide the meter until the input is focused, and slide it in and out. */
  animate: boolean
  /** Speed of the slide animation. */
  animateSpeed: JQuery.Duration
  /** Selector of the ancestor the meter is appended to. */
  closestSelector: JQuery.Selector
}

/** Plugin options plus the @passcore/core options (targetBits, estimator, commonPasswords, rules, levels). */
export type PasswordOptions = MeterOptions & Partial<PluginOptions>

const defaults: PluginOptions = {
  userInputs: [],
  translations: {},
  locale: 'en',
  showPercent: false,
  showText: true,
  label: 'Password strength',
  animate: true,
  animateSpeed: 'fast',
  closestSelector: 'div',
}

/** What `.password()` stores on each element, under the `passcore` data key. */
interface Instance {
  refresh: () => void
  destroy: () => void
}

const DATA_KEY = 'passcore'
const LEVELS: Level[] = ['empty', 'very-weak', 'weak', 'fair', 'good', 'strong']
const LEVEL_CLASSES = LEVELS.map((level) => 'pass-level-' + level).join(' ')

declare global {
  interface JQuery {
    /**
     * Attaches a password strength meter to each matched input. Calling it again on the same input
     * replaces the previous meter.
     *
     * Updates on every `input` and `keyup` event (typing, pasting, autofill), once per keystroke.
     * Triggers `password.score` (percent, result) on every update and
     * `password.text` (text, result) when the message changes.
     */
    password(options?: PasswordOptions): this
    /** Re-evaluates the meters now, e.g. after another field changed or the language did. */
    password(command: 'refresh' | 'destroy'): this
  }
}

let uid = 0

/** Copies `base`, then the overrides that are not `undefined`. */
function merge<T extends object>(base: T, overrides: Partial<T>): T {
  const merged: T = { ...base }
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    if (overrides[key] !== undefined) {
      merged[key] = overrides[key] as T[keyof T]
    }
  }
  return merged
}

function attach($: JQueryStatic, element: HTMLElement, plugin: PluginOptions, translate: Translate, meter: Meter): Instance {
  const $object = $(element)
  const $container = $object.closest(plugin.closestSelector)
  // the meter is shown while the field has the focus or a value: the state decides, not which event came last
  let focused = $object.is(':focus')
  const wanted = (): boolean => focused || String($object.val() ?? '').length > 0
  // where the meter is heading (shown or hidden), which may differ from what is on screen mid-animation
  let visible = !plugin.animate || wanted()

  const $bar = $('<div>').addClass('pass-bar')
  const $meter = $('<div>').addClass('pass-meter').attr({
    'role': 'meter',
    'aria-label': plugin.label,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  }).append($bar)
  const $wrapper = $('<div>').addClass('pass-wrapper').append($meter)
  let $percent: JQuery | undefined
  let $text: JQuery | undefined
  let textId: string | undefined

  if (plugin.showPercent) {
    $percent = $('<span>').addClass('pass-percent')
    $wrapper.append($percent)
  }

  if (plugin.showText) {
    textId = ($object.attr('id') || 'passcore-jq-' + (++uid)) + '-strength'
    $text = $('<span>').addClass('pass-text').attr({ 'id': textId, 'aria-live': 'polite' })
    $wrapper.append($text)
    const describedBy = $object.attr('aria-describedby')
    $object.attr('aria-describedby', describedBy ? describedBy + ' ' + textId : textId)
  }

  if (visible) {
    $container.addClass('pass-strength-visible')
  }
  else {
    $wrapper.css('display', 'none')
  }

  $container.append($wrapper)

  /** The values of one field: every matched element for a selector, the result of a function otherwise. */
  const valuesOf = (field: FieldRef): string[] => {
    if (typeof field === 'function') {
      return [field() ?? '']
    }
    return $(field as JQuery.Selector).get().map((element) => String($(element).val() ?? ''))
  }

  const userInputs = (): string[] => plugin.userInputs
    .flatMap(valuesOf)
    .filter((value) => value.length > 0)

  /** Updates the meter and returns the message text. */
  const render = (result: Result): string => {
    const levelKey = result.level === 'empty' ? 'empty' : `level.${result.level}` as const
    $wrapper
      .removeClass(LEVEL_CLASSES)
      .addClass('pass-level-' + result.level)
      .toggleClass('pass-invalid', !result.valid)
    $meter.attr({
      'aria-valuenow': result.percent,
      'aria-valuetext': translate(levelKey),
    })
    $bar.css('width', result.percent + '%')
    $percent?.text(result.percent + '%')
    return translate(result.message.key, translationParams(result.message))
  }

  const evaluate = (): Result => meter.evaluate(String($object.val() ?? ''), userInputs())

  // the last evaluated result: `password.text` fires when its message (key or params) changes
  let previous = evaluate()
  // initial state, also covering pre-filled inputs
  $text?.text(render(previous))

  // Slides the meter in or out to match the state of the field. Password managers take the focus away with an
  // overlay, then fill the field and refocus it while the meter is still sliding out: an animation in flight
  // gives way to the new state instead of finishing the old one.
  const sync = (): void => {
    if (!plugin.animate || wanted() === visible) {
      return
    }
    visible = !visible
    $wrapper.stop(true, true)
    if (visible) {
      $wrapper.slideDown(plugin.animateSpeed, () => {
        $container.addClass('pass-strength-visible')
      })
    }
    else {
      $wrapper.slideUp(plugin.animateSpeed, () => {
        $container.removeClass('pass-strength-visible')
      })
    }
  }

  // What the last update evaluated, and whether an `input` event made it. Typing fires `input` and then
  // `keyup`: the `keyup` is skipped when it would only repeat that update.
  let lastState = JSON.stringify([$object.val() ?? '', userInputs()])
  let fromInput = false

  /** Evaluates and renders the field, then triggers the events. */
  const publish = (): void => {
    const result = evaluate()
    const changed = JSON.stringify(result.message) !== JSON.stringify(previous.message)
    previous = result
    const text = render(result)
    $object.trigger('password.score', [result.percent, result])
    // the text is written whenever it differs (also after a language change), the event only for a new message
    if ($text && $text.text() !== text) {
      $text.text(text)
    }
    if (changed) {
      $object.trigger('password.text', [text, result])
    }
  }

  const update = (source: 'input' | 'keyup' | 'change'): void => {
    sync()

    const state = JSON.stringify([$object.val() ?? '', userInputs()])
    if (source === 'keyup' && fromInput && state === lastState) {
      fromInput = false
      return
    }
    // `change` comes after typing too, when the field is left: it only matters if the value changed since
    if (source === 'change' && state === lastState) {
      return
    }
    fromInput = source !== 'keyup'
    lastState = state

    publish()
  }

  const refresh = (): void => {
    sync()
    lastState = JSON.stringify([$object.val() ?? '', userInputs()])
    fromInput = false
    publish()
  }

  const destroy = (): void => {
    // every listener of this meter is in the `passcore` namespace
    $object.off('.passcore')
    $wrapper.stop(true, true)
    $container.removeClass('pass-strength-visible')
    $wrapper.remove()
    if (textId) {
      const ids = ($object.attr('aria-describedby') ?? '').split(' ').filter((id) => id && id !== textId)
      if (ids.length) {
        $object.attr('aria-describedby', ids.join(' '))
      }
      else {
        $object.removeAttr('aria-describedby')
      }
    }
    $.removeData(element, DATA_KEY)
  }

  // `input` and `change` cover what `keyup` misses: pasting with the mouse, autofill and password managers
  $object.on('input.passcore', () => update('input'))
  $object.on('keyup.passcore', () => update('keyup'))
  $object.on('change.passcore', () => update('change'))
  $object.on('focus.passcore', () => {
    focused = true
    sync()
  })
  $object.on('blur.passcore', () => {
    focused = false
    sync()
  })

  return { refresh, destroy }
}

/**
 * Registers `$.fn.password` on the given jQuery instance.
 */
export function install($: JQueryStatic): void {
  $.fn.password = function (this: JQuery, arg: PasswordOptions | 'refresh' | 'destroy' = {}) {
    if (typeof arg === 'string') {
      // a command does nothing on an element without a meter
      return this.each(function () {
        const instance = $.data(this, DATA_KEY) as Instance | undefined
        if (arg === 'refresh') {
          instance?.refresh()
        }
        else if (arg === 'destroy') {
          instance?.destroy()
        }
      })
    }

    const {
      userInputs,
      translations,
      locale,
      translate,
      showPercent,
      showText,
      label,
      animate,
      animateSpeed,
      closestSelector,
      ...core
    } = arg
    const plugin = merge(defaults, { userInputs, translations, locale, translate, showPercent, showText, label, animate, animateSpeed, closestSelector })
    const translator = plugin.translate ?? createTranslator([en, plugin.translations], plugin.locale)
    const meter = createMeter(core as MeterOptions)

    return this.each(function () {
      // a new meter replaces the previous one on the same input
      ($.data(this, DATA_KEY) as Instance | undefined)?.destroy()
      $.data(this, DATA_KEY, attach($, this, plugin, translator, meter))
    })
  }
}
