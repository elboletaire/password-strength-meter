import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PasswordStrengthMeter } from '../src'

describe('server rendering', () => {
  it('renders the meter to a string, with the text nodes in one piece', () => {
    const html = renderToString(<PasswordStrengthMeter password="Tester23$" id="pw-strength" showPercent />)
    expect(html).toContain('class="pass-wrapper pass-level-weak"')
    expect(html).toContain('aria-valuenow="30"')
    expect(html).toContain('<span class="pass-percent">30%</span>')
    expect(html).toContain('id="pw-strength"')
    expect(html).toContain('>Weak password</span>')
  })
})
