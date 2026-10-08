import { createMeter, mergeDeep, type Level, type MeterResult, type PartialOptions } from '@passcore/core'
import { defaultMessages, formatMessage, type Messages } from './messages'

/** A field: selector, element or jQuery object. */
export type FieldRef = JQuery.Selector | Element | JQuery

export interface PluginOptions {
  /** Fields whose values the password must not contain (username, email...), read on every keyup. */
  userInputs: FieldRef[]
  /** Message overrides, keyed by message key. */
  messages: Partial<Messages>
  /** Show the score percentage. */
  showPercent: boolean
  /** Show the message. */
  showText: boolean
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
  messages: {},
  showPercent: false,
  showText: true,
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
     * Triggers `password.score` (percent, result) on every keyup and
     * `password.text` (text, result) when the message changes.
     */
    password(options?: PasswordOptions): this
  }
}

let uid = 0

function attach($: JQueryStatic, $object: JQuery, plugin: PluginOptions, messages: Messages, core: PartialOptions): void {
  const meter = createMeter(core)
  const $container = $object.closest(plugin.closestSelector)
  let shown = true

  const $bar = $('<div>').addClass('pass-bar')
  const $meter = $('<div>').addClass('pass-meter').attr({
    'role': 'meter',
    'aria-label': 'Password strength',
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

  $container.addClass('pass-strength-visible')
  if (plugin.animate) {
    $wrapper.css('display', 'none')
    shown = false
    $container.removeClass('pass-strength-visible')
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
      'aria-valuetext': formatMessage(messages, levelKey, {}),
    })
    $bar.css('width', result.percent + '%')
    $percent?.text(result.percent + '%')
    return formatMessage(messages, result.message.key, result.message.params)
  }

  const evaluate = (): MeterResult => meter.evaluate(String($object.val() ?? ''), userInputs())

  // initial state, also covering pre-filled inputs
  $text?.text(render(evaluate()))

  $object.on('keyup', () => {
    const result = evaluate()
    const text = render(result)
    $object.trigger('password.score', [result.percent, result])
    if (result.messageChanged) {
      $text?.text(text)
      $object.trigger('password.text', [text, result])
    }
  })

  if (plugin.animate) {
    $object.on('focus', () => {
      if (!shown) {
        $wrapper.slideDown(plugin.animateSpeed, () => {
          shown = true
          $container.addClass('pass-strength-visible')
        })
      }
    })

    $object.on('blur', () => {
      if (!String($object.val() ?? '').length && shown) {
        $wrapper.slideUp(plugin.animateSpeed, () => {
          shown = false
          $container.removeClass('pass-strength-visible')
        })
      }
    })
  }
}

/**
 * Registers `$.fn.password` on the given jQuery instance.
 */
export function install($: JQueryStatic): void {
  $.fn.password = function (this: JQuery, options: PasswordOptions = {}) {
    const { userInputs, messages, showPercent, showText, animate, animateSpeed, closestSelector, ...core } = options
    const plugin = mergeDeep(defaults, { userInputs, messages, showPercent, showText, animate, animateSpeed, closestSelector })
    const resolvedMessages = mergeDeep(defaultMessages, plugin.messages)

    return this.each(function () {
      attach($, $(this), plugin, resolvedMessages, core)
    })
  }
}
