import $ from 'jquery'
import { install } from './plugin'

install($)

export { install, type FieldRef, type PasswordOptions } from './plugin'
export type { Level, Result, Translate, Translations } from '@passcore/core'
