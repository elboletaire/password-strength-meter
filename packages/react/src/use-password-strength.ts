import {
  createMeter,
  createTranslator,
  translationParams,
  type Meter,
  type MeterOptions,
  type MessageKey,
  type Result,
  type Translate,
  type Translations,
} from '@passcore/core'
import { useMemo } from 'react'
import en from '../../../locales/en.json'

export interface PasswordStrengthOptions extends MeterOptions {
  /** Values the password must not contain (usernames, emails...). Pass the current values. */
  userInputs?: readonly string[]
  /** Texts in i18next's JSON format, deep-merged over the bundled English ones. */
  translations?: Translations
  /** Locale used to pick plural forms. Default 'en'. */
  locale?: string
  /** Translates a message key with its params (e.g. i18next's `t`); replaces `translations` and `locale`. */
  translate?: Translate
}

export interface PasswordStrength {
  /** The core result: percent, level, validity, rules and message. */
  result: Result
  /** Translated message. */
  text: string
  /** Translated level, for aria-valuetext. */
  levelText: string
}

/**
 * The meter for the given options. It is memoized by the value of the options
 * (the estimator function is compared by identity), so it is only recreated
 * when they change.
 */
function useMeter(options: PasswordStrengthOptions): Meter {
  const { targetBits, estimator, commonPasswords, rules, levels } = options
  // computed only when the array itself changes: a stable list costs nothing per keystroke
  const passwordsKey = useMemo(() => commonPasswords && JSON.stringify(commonPasswords), [commonPasswords])
  const rulesKey = JSON.stringify(rules ?? {})
  const levelsKey = JSON.stringify(levels ?? {})

  return useMemo(
    () => createMeter({
      targetBits,
      estimator,
      commonPasswords: passwordsKey ? JSON.parse(passwordsKey) : undefined,
      rules: JSON.parse(rulesKey),
      levels: JSON.parse(levelsKey),
    }),
    [targetBits, estimator, passwordsKey, rulesKey, levelsKey],
  )
}

/** The translator for the given options, memoized by the value of the translations. */
function useTranslator(options: PasswordStrengthOptions): Translate {
  const { translate, translations, locale } = options
  const translationsKey = JSON.stringify(translations ?? {})

  return useMemo(
    () => translate ?? createTranslator([en, JSON.parse(translationsKey) as Translations], locale ?? 'en'),
    [translate, translationsKey, locale],
  )
}

/**
 * Evaluates a password and translates its message. Recomputes only when the
 * password, the user inputs or the options change (compared by value).
 */
export function usePasswordStrength(password: string, options: PasswordStrengthOptions = {}): PasswordStrength {
  const meter = useMeter(options)
  const translate = useTranslator(options)
  const { userInputs, locale } = options
  const inputsKey = JSON.stringify(userInputs ?? [])

  const result = useMemo(
    () => meter.evaluate(password, JSON.parse(inputsKey)),
    [meter, password, inputsKey],
  )

  return useMemo(() => {
    // with a `translate` function, `locale` is the signal that the language changed: the function
    // itself (i18next's `t`) may keep its identity
    void locale
    const levelKey: MessageKey = result.level === 'empty' ? 'empty' : `level.${result.level}`
    return {
      result,
      text: translate(result.message.key, translationParams(result.message)),
      levelText: translate(levelKey),
    }
  }, [result, translate, locale])
}
