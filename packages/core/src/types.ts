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

export type Estimator = (password: string, userInputs: string[]) => number

export interface Options {
  /** Estimated bits that count as 100%. */
  targetBits: number
  /** Replaces the built-in strength estimate; returns bits. */
  estimator?: Estimator
  /** Common passwords; replaces the built-in list. */
  commonWords: string[]
  rules: Rules
  levels: Levels
}

export type PartialOptions = Partial<Omit<Options, 'rules' | 'levels'>> & {
  rules?: Partial<Rules>
  levels?: Partial<Levels>
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

export interface MeterResult extends Result {
  /** Whether the message differs from the previous evaluation. */
  messageChanged: boolean
}
