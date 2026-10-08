import $ from 'jquery'
import { install } from './plugin'

install($)

export { defaultMessages, formatMessage, type Messages, type MessageText } from './messages'
export { defaults, install, type FieldRef, type PasswordOptions, type PluginOptions } from './plugin'
