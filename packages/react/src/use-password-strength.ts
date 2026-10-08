import { useMemo } from 'react'
import {
  createMeter,
  createTranslator,
  mergeDeep,
  translationParams,
  type MessageKey,
  type PartialOptions,
  type Result,
  type Translate,
  type Translations,
} from '@passcore/core'
import en from '../../../locales/en.json'

export interface PasswordOptions extends PartialOptions {
  /** Values the password must not contain (usernames, emails...). */
  userInputs?: string[]
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
  /** aria-label of the meter. Default 'Password strength'. */
  label?: string
}

export interface PasswordStrength extends Result {
  /** Translated message. */
  text: string
  /** Translated level, for aria-valuetext. */
  levelText: string
}

/**
 * Evaluates the core result. The meter is memoized: it is only recreated when
 * its options change (compared by value, except the estimator function, which is
 * compared by identity).
 */
export function useStrengthResult(password: string, options: PasswordOptions = {}): Result {
  const { targetBits, estimator, commonWords, rules, levels, userInputs } = options
  // computed only when the array itself changes: a stable list costs nothing per keystroke
  const wordsKey = useMemo(() => commonWords && JSON.stringify(commonWords), [commonWords])
  const rulesKey = JSON.stringify(rules ?? {})
  const levelsKey = JSON.stringify(levels ?? {})
  const inputsKey = JSON.stringify(userInputs ?? [])

  const meter = useMemo(
    () => createMeter({
      targetBits,
      estimator,
      commonWords: wordsKey ? JSON.parse(wordsKey) : undefined,
      rules: JSON.parse(rulesKey),
      levels: JSON.parse(levelsKey),
    }),
    [targetBits, estimator, wordsKey, rulesKey, levelsKey],
  )

  return useMemo(() => {
    const { messageChanged: _messageChanged, ...result } = meter.evaluate(password, JSON.parse(inputsKey))
    return result
  }, [meter, password, inputsKey])
}

/** The translator for the given options, memoized by the value of the translations. */
export function useTranslator(options: PasswordOptions = {}): Translate {
  const { translate, translations, locale } = options
  const translationsKey = JSON.stringify(translations ?? {})

  return useMemo(
    () => translate ?? createTranslator(mergeDeep<Translations>(en, JSON.parse(translationsKey)), locale ?? 'en'),
    [translate, translationsKey, locale],
  )
}

/** Adds the translated message and level text to a core result. */
export function useTranslatedStrength(result: Result, options: PasswordOptions = {}): PasswordStrength {
  const translate = useTranslator(options)
  // with a `translate` function, `locale` is the signal that the language changed: the function
  // itself (i18next's `t`) may keep its identity
  const { locale } = options

  return useMemo(() => {
    void locale
    const levelKey: MessageKey = result.level === 'empty' ? 'empty' : `level.${result.level}`
    return {
      ...result,
      text: translate(result.message.key, translationParams(result.message)),
      levelText: translate(levelKey),
    }
  }, [result, translate, locale])
}

/**
 * Evaluates a password and translates its message. Recomputes only when the
 * password, the user inputs or the meter options change.
 */
export function usePasswordStrength(password: string, options?: PasswordOptions): PasswordStrength {
  const result = useStrengthResult(password, options)
  return useTranslatedStrength(result, options)
}
