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
import en from '../../../../locales/en.json'

export type { Level, Result, Translate, Translations }

/** Options of passwordStrength(), and the base of the component props. */
export interface PasswordStrengthOptions extends MeterOptions {
  /** Values the password must not contain (username, email...). */
  userInputs?: readonly string[]
  /** Translations in i18next's JSON format, merged over the bundled English ones. */
  translations?: Translations
  /** Locale used to pick plural forms, default 'en'. */
  locale?: string
  /** Translates a message key with its params (e.g. i18next's `t`); replaces `translations` and `locale`. */
  translate?: Translate
}

/** Props of the PasswordStrengthMeter component. */
export interface PasswordStrengthMeterProps extends PasswordStrengthOptions {
  /** The password to evaluate. */
  password: string
  /** Show the score percentage, default false. */
  showPercent?: boolean
  /** Show the message, default true. */
  showText?: boolean
  /** aria-label of the meter, default 'Password strength'. */
  label?: string
  /** Id of the text element, for aria-describedby on the input. */
  id?: string
  /** Added to the wrapper. */
  class?: string
  /** Fires when the evaluated result changes (not on mount). */
  onscore?: (percent: number, result: Result) => void
  /** Fires when the message (key and params) changes (not on mount). */
  ontext?: (text: string, result: Result) => void
}

/** The evaluation of a password, with its translated texts. */
export interface PasswordStrength {
  /** The core result: percent, level, valid, rules and message. */
  readonly result: Result
  /** The translated message, e.g. "Use at least 8 characters". */
  readonly text: string
  /** The translated level, for aria-valuetext. */
  readonly levelText: string
}

/**
 * Evaluates a password on every change. The core meter is memoized: it is only
 * recreated when targetBits, estimator, commonPasswords, rules or levels change
 * (compared by value, except the estimator function, which is compared by
 * identity), so typing never prepares the word list again.
 */
export function passwordStrength(getPassword: () => string, getOptions: () => PasswordStrengthOptions = () => ({})): PasswordStrength {
  let memo: { targetBits: unknown, estimator: unknown, commonPasswords: string | undefined, rules: string, levels: string, meter: Meter } | undefined

  const meter = $derived.by(() => {
    const options = getOptions()
    const commonPasswords = options.commonPasswords && JSON.stringify(options.commonPasswords)
    const rules = JSON.stringify(options.rules ?? {})
    const levels = JSON.stringify(options.levels ?? {})
    if (!memo || memo.targetBits !== options.targetBits || memo.estimator !== options.estimator
      || memo.commonPasswords !== commonPasswords || memo.rules !== rules || memo.levels !== levels) {
      memo = {
        targetBits: options.targetBits,
        estimator: options.estimator,
        commonPasswords,
        rules,
        levels,
        meter: createMeter({
          targetBits: options.targetBits,
          estimator: options.estimator,
          commonPasswords: options.commonPasswords,
          rules: options.rules,
          levels: options.levels,
        }),
      }
    }
    return memo.meter
  })

  const result: Result = $derived(meter.evaluate(getPassword(), getOptions().userInputs))

  const translator: Translate = $derived.by(() => {
    const options = getOptions()
    return options.translate ?? createTranslator([en, options.translations ?? {}], options.locale ?? 'en')
  })

  // with a `translate` function, `locale` is the signal that the language changed: reading it here
  // makes the texts depend on it even when the function keeps its identity
  const text = $derived.by(() => {
    void getOptions().locale
    return translator(result.message.key, translationParams(result.message))
  })

  const levelText = $derived.by(() => {
    void getOptions().locale
    return translator(result.level === 'empty' ? 'empty' : `level.${result.level}` as const)
  })

  return {
    get result() {
      return result
    },
    get text() {
      return text
    },
    get levelText() {
      return levelText
    },
  }
}
