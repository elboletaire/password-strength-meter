/** Shared fixtures from the bindings design spec, with the default options. */
export interface Fixture {
  password: string
  percent: number
  level: string
  valid: boolean
  text: string
  levelText: string
}

export const fixtures: Fixture[] = [
  { password: '', percent: 0, level: 'empty', valid: false, text: 'Type your password', levelText: 'Type your password' },
  { password: 'abc', percent: 7, level: 'very-weak', valid: false, text: 'Use at least 8 characters', levelText: 'Very weak password' },
  { password: 'password', percent: 8, level: 'very-weak', valid: false, text: 'This password is too common', levelText: 'Very weak password' },
  { password: 'Tester23$', percent: 30, level: 'weak', valid: true, text: 'Weak password', levelText: 'Weak password' },
  { password: '!Tester23$#', percent: 43, level: 'fair', valid: true, text: 'Fair password', levelText: 'Fair password' },
  { password: 'k8#Qz!2mWp', percent: 66, level: 'good', valid: true, text: 'Good password', levelText: 'Good password' },
  { password: 'correct horse battery staple', percent: 100, level: 'strong', valid: true, text: 'Strong password', levelText: 'Strong password' },
]
