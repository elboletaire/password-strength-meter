import { defaults as coreDefaults, evaluate, mergeOptions, type MeterOptions } from '@passcore/core'

export interface PasswordOptions extends MeterOptions {
  /** Show the score percentage next to the bar. */
  showPercent: boolean
  /** Show the text tips. */
  showText: boolean
  /** Hide the meter until the input is focused, and slide it in and out. */
  animate: boolean
  /** Speed of the slide animation. */
  animateSpeed: JQuery.Duration
  /** Field (selector, element or jQuery object) whose value the password must not match, e.g. the username. */
  field: false | JQuery.Selector | Element | JQuery
  /** Selector of the ancestor the meter is appended to. */
  closestSelector: JQuery.Selector
}

export const defaults: PasswordOptions = {
  ...coreDefaults,
  showPercent: false,
  showText: true,
  animate: true,
  animateSpeed: 'fast',
  field: false,
  closestSelector: 'div',
}

declare global {
  interface JQuery {
    /**
     * Attaches a password strength meter to each matched input.
     *
     * Triggers `password.score` (with the score) on every keyup and
     * `password.text` (with the text and the score) when the text changes.
     */
    password(options?: Partial<PasswordOptions>): this
  }
}

function attach($: JQueryStatic, $object: JQuery, options: PasswordOptions): void {
  let shown = true
  const $graybar = $('<div>').addClass('pass-graybar')
  let $colorbar = $('<div>').addClass('pass-colorbar')
  const $insert = $('<div>').addClass('pass-wrapper').append(
    $graybar.append($colorbar),
  )
  let $percentage: JQuery | undefined
  let $text: JQuery | undefined

  $object.closest(options.closestSelector).addClass('pass-strength-visible')
  if (options.animate) {
    $insert.css('display', 'none')
    shown = false
    $object.closest(options.closestSelector).removeClass('pass-strength-visible')
  }

  if (options.showPercent) {
    $percentage = $('<span>').addClass('pass-percent').text('0%')
    $insert.append($percentage)
  }

  if (options.showText) {
    $text = $('<span>').addClass('pass-text').html(options.enterPass)
    $insert.append($text)
  }

  $object.closest(options.closestSelector).append($insert)

  $object.on('keyup', () => {
    let field: string | undefined
    if (options.field) {
      // $() accepts a selector, an element or a jQuery object; the legacy
      // plugin crashed when the selector matched nothing
      field = String($(options.field as JQuery.Selector).val() ?? '')
    }

    const password = String($object.val() ?? '')
    const { score, percent, text, style } = evaluate(password, options, field)
    $object.trigger('password.score', [score])

    $colorbar = $colorbar.css(style as unknown as JQuery.PlainObject<string>)

    if ($percentage) {
      $percentage.html(percent + '%')
    }

    // compare as rendered HTML, so entities in the texts don't fire spurious events
    if ($text && $text.html() !== $('<div>').html(text).html()) {
      $text.html(text)
      $object.trigger('password.text', [text, score])
    }
  })

  if (options.animate) {
    $object.on('focus', () => {
      if (!shown) {
        $insert.slideDown(options.animateSpeed, () => {
          shown = true
          $object.closest(options.closestSelector).addClass('pass-strength-visible')
        })
      }
    })

    $object.on('blur', () => {
      if (!String($object.val() ?? '').length && shown) {
        $insert.slideUp(options.animateSpeed, () => {
          shown = false
          $object.closest(options.closestSelector).removeClass('pass-strength-visible')
        })
      }
    })
  }
}

/**
 * Registers `$.fn.password` on the given jQuery instance.
 */
export function install($: JQueryStatic): void {
  $.fn.password = function (this: JQuery, options?: Partial<PasswordOptions>) {
    const resolved = mergeOptions(defaults, options)
    return this.each(function () {
      attach($, $(this), resolved)
    })
  }
}
