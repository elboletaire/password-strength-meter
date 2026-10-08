export type Level = 'empty' | 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'

export type RuleId = 'minLength' | 'maxLength' | 'notCommon' | 'notUserInputs'
  | 'lowercase' | 'uppercase' | 'numbers' | 'symbols'

export type MessageKey = 'empty' | `level.${Exclude<Level, 'empty'>}` | `rule.${RuleId}`

export type Params = Record<string, number>

export interface Rules {
  /** Minimum length in characters (code points). 0 disables it. */
  minLength: number
  /** Maximum length in characters (code points). 0 disables it. */
  maxLength: number
  /** Minimum count of lowercase ASCII letters. 0 disables it. */
  lowercase: number
  /** Minimum count of uppercase ASCII letters. 0 disables it. */
  uppercase: number
  /** Minimum count of digits. 0 disables it. */
  numbers: number
  /** Minimum count of ASCII symbols (including space). 0 disables it. */
  symbols: number
  /** Reject passwords containing any of the user inputs. */
  notUserInputs: boolean
  /** Reject common passwords, alone or followed by digits and symbols. */
  notCommon: boolean
}

/** Lower bound (in percent) of each level. */
export type Levels = Record<Exclude<Level, 'empty'>, number>

export type Estimator = (password: string, userInputs: readonly string[]) => number

/** What you pass to createMeter(): every field is optional and merged over the defaults. */
export interface MeterOptions {
  /** Estimated bits that count as 100%. */
  targetBits?: number
  /** Replaces the built-in strength estimate; returns bits. */
  estimator?: Estimator
  /** Common passwords; replaces the built-in list. */
  commonPasswords?: readonly string[]
  rules?: Partial<Rules>
  levels?: Partial<Levels>
}

/** The complete, frozen options of a meter (`meter.options`). */
export interface ResolvedOptions {
  /** Estimated bits that count as 100%. */
  readonly targetBits: number
  /** Replaces the built-in strength estimate; returns bits. */
  readonly estimator?: Estimator
  /** Common passwords; replaces the built-in list. */
  readonly commonPasswords: readonly string[]
  readonly rules: Readonly<Rules>
  readonly levels: Readonly<Levels>
}

/** Options for evaluate(): the meter options plus the user inputs to check against. */
export type EvaluateOptions = MeterOptions & {
  /** Values the password must not contain, such as the username or email. */
  userInputs?: readonly string[]
}

export interface RuleResult {
  id: RuleId
  passed: boolean
  params: Params
}

export interface Message {
  key: MessageKey
  params: Params
}

export interface Result {
  /** Estimated strength in bits. */
  bits: number
  /** Integer from 0 to 100: bits relative to targetBits. */
  percent: number
  level: Level
  /** Whether every enabled rule passes. */
  valid: boolean
  /** Enabled rules, in rule order. */
  rules: RuleResult[]
  /** What to show: an empty password, the first failing rule, or the level. */
  message: Message
}

export interface Meter {
  /** The resolved, frozen options. */
  readonly options: ResolvedOptions
  /** Evaluates a password. Pure: the same input always gives the same result. */
  evaluate(password: string, userInputs?: readonly string[]): Result
}

/** Nested translations, in i18next's JSON format. */
export type Translations = { [key: string]: string | Translations }

/** Turns a message key and its params into text, e.g. a translator or i18next's `t`. */
export type Translate = (key: MessageKey, params?: Params) => string
