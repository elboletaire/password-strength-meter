import {
  createMeter,
  createTranslator,
  mergeDeep,
  translationParams,
  type Level,
  type MeterResult,
  type PartialOptions,
  type Translate,
  type Translations,
} from '@passcore/core'
import en from '../../../locales/en.json'

/** A field: selector, element or jQuery object. */
export type FieldRef = JQuery.Selector | Element | JQuery

export interface PluginOptions {
  /** Fields whose values the password must not contain (username, email...), read on every update. */
  userInputs: FieldRef[]
  /** Translations in i18next's JSON format, deep-merged over the bundled English ones. */
  translations: Translations
  /** Locale used to pick plural forms. */
  locale: string
  /** Translates a message key with its params (e.g. i18next's `t`); replaces `translations` and `locale`. */
  translate?: Translate
  /** Show the score percentage. */
  showPercent: boolean
  /** Show the message. */
  showText: boolean
  /** Accessible name of the meter (its `aria-label`). */
  label: string
  /** Hide the meter until the input is focused, and slide it in and out. */
  animate: boolean
  /** Speed of the slide animation. */
  animateSpeed: JQuery.Duration
  /** Selector of the ancestor the meter is appended to. */
  closestSelector: JQuery.Selector
}

/** Plugin options plus the @passcore/core options (targetBits, estimator, commonWords, rules, levels). */
export type PasswordOptions = PartialOptions & Partial<PluginOptions>

export const defaults: PluginOptions = {
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

const LEVELS: Level[] = ['empty', 'very-weak', 'weak', 'fair', 'good', 'strong']
const LEVEL_CLASSES = LEVELS.map((level) => 'pass-level-' + level).join(' ')

declare global {
  interface JQuery {
    /**
     * Attaches a password strength meter to each matched input.
     *
     * Updates on every `input` and `keyup` event (typing, pasting, autofill), once per keystroke.
     * Triggers `password.score` (percent, result) on every update and
     * `password.text` (text, result) when the message changes.
     */
    password(options?: PasswordOptions): this
  }
}

let uid = 0

function attach($: JQueryStatic, $object: JQuery, plugin: PluginOptions, translate: Translate, core: PartialOptions): void {
  const meter = createMeter(core)
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

  if (plugin.showPercent) {
    $percent = $('<span>').addClass('pass-percent')
    $wrapper.append($percent)
  }

  if (plugin.showText) {
    const id = ($object.attr('id') || 'passcore-' + (++uid)) + '-strength'
    $text = $('<span>').addClass('pass-text').attr({ 'id': id, 'aria-live': 'polite' })
    $wrapper.append($text)
    const describedBy = $object.attr('aria-describedby')
    $object.attr('aria-describedby', describedBy ? describedBy + ' ' + id : id)
  }

  if (visible) {
    $container.addClass('pass-strength-visible')
  }
  else {
    $wrapper.css('display', 'none')
  }

  $container.append($wrapper)

  const userInputs = (): string[] => plugin.userInputs
    .map((field) => String($(field as JQuery.Selector).val() ?? ''))
    .filter((value) => value.length > 0)

  /** Updates the meter and returns the message text. */
  const render = (result: MeterResult): string => {
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

  const evaluate = (): MeterResult => meter.evaluate(String($object.val() ?? ''), userInputs())

  // initial state, also covering pre-filled inputs
  $text?.text(render(evaluate()))

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

    const result = evaluate()
    const text = render(result)
    $object.trigger('password.score', [result.percent, result])
    // the text is written whenever it differs (also after a language change), the event only for a new message
    if ($text && $text.text() !== text) {
      $text.text(text)
    }
    if (result.messageChanged) {
      $object.trigger('password.text', [text, result])
    }
  }

  // `input` and `change` cover what `keyup` misses: pasting with the mouse, autofill and password managers
  $object.on('input', () => update('input'))
  $object.on('keyup', () => update('keyup'))
  $object.on('change', () => update('change'))
  $object.on('focus', () => {
    focused = true
    sync()
  })
  $object.on('blur', () => {
    focused = false
    sync()
  })
}

/**
 * Registers `$.fn.password` on the given jQuery instance.
 */
export function install($: JQueryStatic): void {
  $.fn.password = function (this: JQuery, options: PasswordOptions = {}) {
    const { userInputs, translations, locale, translate, showPercent, showText, label, animate, animateSpeed, closestSelector, ...core } = options
    const plugin = mergeDeep(defaults, { userInputs, translations, locale, translate, showPercent, showText, label, animate, animateSpeed, closestSelector })
    const translator = plugin.translate ?? createTranslator(mergeDeep<Translations>(en, plugin.translations), plugin.locale)

    return this.each(function () {
      attach($, $(this), plugin, translator, core)
    })
  }
}
