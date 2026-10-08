import {
  createMeter,
  createTranslator,
  mergeDeep,
  translationParams,
  type Meter,
  type MeterResult,
  type PartialOptions,
  type Result,
  type Translate,
  type Translations,
} from '@passcore/core'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import en from '../../../locales/en.json'

/** Binding options plus the @passcore/core options (targetBits, estimator, commonWords, rules, levels). */
export interface PasswordOptions extends PartialOptions {
  /** Values the password must not contain (username, email...). */
  userInputs?: string[]
  /** Translations in i18next's JSON format, deep-merged over the bundled English ones. */
  translations?: Translations
  /** Locale used to pick plural forms, default 'en'. */
  locale?: string
  /** Translates a message key with its params (e.g. i18next's `t`); replaces `translations` and `locale`. */
  translate?: Translate
  /** Show the score percentage (component only). */
  showPercent?: boolean
  /** Show the message (component only), default true. */
  showText?: boolean
  /** aria-label of the meter (component only), default 'Password strength'. */
  label?: string
}

export interface PasswordStrength {
  /** The @passcore/core result for the current password. */
  result: ComputedRef<Result>
  /** The translated message. */
  text: ComputedRef<string>
  /** The translated level, for aria-valuetext. */
  levelText: ComputedRef<string>
}

/** The core result without the stateful `messageChanged` flag. */
function plain(result: MeterResult): Result {
  const { messageChanged: _messageChanged, ...rest } = result
  return rest
}

/**
 * Evaluates a password with @passcore/core and translates the result.
 *
 * The meter is only recreated when targetBits, estimator, commonWords, rules or levels
 * change (compared by value, except the estimator function, which is compared by
 * identity), so typing never rebuilds the word list.
 */
export function usePasswordStrength(
  password: MaybeRefOrGetter<string>,
  options?: MaybeRefOrGetter<PasswordOptions | undefined>,
): PasswordStrength {
  let memo: { targetBits: unknown, estimator: unknown, commonWords: string | undefined, rules: string, levels: string, meter: Meter } | undefined

  const meter = computed(() => {
    const o = toValue(options) ?? {}
    const commonWords = o.commonWords && JSON.stringify(o.commonWords)
    const rules = JSON.stringify(o.rules ?? {})
    const levels = JSON.stringify(o.levels ?? {})
    if (!memo || memo.targetBits !== o.targetBits || memo.estimator !== o.estimator
      || memo.commonWords !== commonWords || memo.rules !== rules || memo.levels !== levels) {
      memo = {
        targetBits: o.targetBits,
        estimator: o.estimator,
        commonWords,
        rules,
        levels,
        meter: createMeter({
          targetBits: o.targetBits,
          estimator: o.estimator,
          commonWords: o.commonWords,
          rules: o.rules,
          levels: o.levels,
        }),
      }
    }
    return memo.meter
  })

  // a string, so that new-but-equal arrays don't trigger a new evaluation
  const userInputs = computed(() => JSON.stringify(toValue(options)?.userInputs ?? []))

  const result = computed<Result>(() =>
    plain(meter.value.evaluate(toValue(password), JSON.parse(userInputs.value) as string[])))

  const translate = computed<Translate>(() => {
    const o = toValue(options) ?? {}
    return o.translate ?? createTranslator(mergeDeep<Translations>(en, o.translations), o.locale ?? 'en')
  })

  // with a `translate` function, `locale` is the signal that the language changed: reading it
  // here makes the texts depend on it even when the function keeps its identity
  const locale = () => toValue(options)?.locale

  const text = computed(() => {
    locale()
    const { message } = result.value
    return translate.value(message.key, translationParams(message))
  })

  const levelText = computed(() => {
    locale()
    const { level } = result.value
    return translate.value(level === 'empty' ? 'empty' : `level.${level}` as const)
  })

  return { result, text, levelText }
}
