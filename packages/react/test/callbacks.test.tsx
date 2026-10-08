import { evaluate } from '@passcore/core'
import { cleanup, render } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PasswordStrengthMeter } from '../src'

afterEach(() => cleanup())

describe('onScore and onText', () => {
  it('does not fire on mount', () => {
    const onScore = vi.fn()
    const onText = vi.fn()
    render(<PasswordStrengthMeter password="Tester23$" onScore={onScore} onText={onText} />)
    expect(onScore).not.toHaveBeenCalled()
    expect(onText).not.toHaveBeenCalled()
  })

  it('fires onScore with the percent and the core result on every change', () => {
    const onScore = vi.fn()
    const { rerender } = render(<PasswordStrengthMeter password="" onScore={onScore} />)
    rerender(<PasswordStrengthMeter password="ab" onScore={onScore} />)
    rerender(<PasswordStrengthMeter password="abc" onScore={onScore} />)
    rerender(<PasswordStrengthMeter password="k8#Qz!2mWp" onScore={onScore} />)
    expect(onScore.mock.calls.map(([percent]) => percent)).toEqual([6, 7, 66])
    expect(onScore.mock.calls[2]?.[1]).toEqual(evaluate('k8#Qz!2mWp'))
  })

  it('does not fire onScore when nothing changes', () => {
    const onScore = vi.fn()
    const { rerender } = render(<PasswordStrengthMeter password="abc" onScore={onScore} />)
    rerender(<PasswordStrengthMeter password="abc" onScore={onScore} />)
    expect(onScore).not.toHaveBeenCalled()
  })

  it('does not fire when a parent passes new but equal objects', () => {
    const onScore = vi.fn()
    const onText = vi.fn()
    const props = { password: 'Tester23$', onScore, onText }
    const { rerender } = render(<PasswordStrengthMeter {...props} commonPasswords={['acmecorp']} rules={{ minLength: 8 }} userInputs={['john']} />)
    rerender(<PasswordStrengthMeter {...props} commonPasswords={['acmecorp']} rules={{ minLength: 8 }} userInputs={['john']} />)
    expect(onScore).not.toHaveBeenCalled()
    expect(onText).not.toHaveBeenCalled()
  })

  it('does not fire onScore when the evaluated result is the same', () => {
    // a different password with an identical result, and an option set to its default value
    const onScore = vi.fn()
    const { rerender } = render(<PasswordStrengthMeter password="xqz" onScore={onScore} />)
    rerender(<PasswordStrengthMeter password="xqy" onScore={onScore} />)
    rerender(<PasswordStrengthMeter password="xqy" targetBits={100} onScore={onScore} />)
    expect(onScore).not.toHaveBeenCalled()
  })

  it('fires onScore when the options change the evaluated result', () => {
    const onScore = vi.fn()
    const { rerender } = render(<PasswordStrengthMeter password="abc" onScore={onScore} />)
    rerender(<PasswordStrengthMeter password="abc" rules={{ minLength: 2 }} onScore={onScore} />)
    expect(onScore).toHaveBeenCalledTimes(1)
  })

  it('fires onText only when the message changes', () => {
    const onText = vi.fn()
    const { rerender } = render(<PasswordStrengthMeter password="" onText={onText} />)
    rerender(<PasswordStrengthMeter password="ab" onText={onText} />)
    rerender(<PasswordStrengthMeter password="abc" onText={onText} />)
    rerender(<PasswordStrengthMeter password="k8#Qz!2mWp" onText={onText} />)
    expect(onText.mock.calls.map(([text]) => text)).toEqual([
      'Use at least 8 characters',
      'Good password',
    ])
    expect(onText.mock.calls[1]?.[1]).toMatchObject({ level: 'good', valid: true })
  })

  it('does not fire onText when only the translations change', () => {
    const onText = vi.fn()
    const { rerender } = render(<PasswordStrengthMeter password="abc" onText={onText} />)
    rerender(<PasswordStrengthMeter password="abc" translations={{ rule: { minLength_other: 'Min {{count}}!' } }} onText={onText} />)
    expect(onText).not.toHaveBeenCalled()
  })

  it('calls the latest callbacks', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<PasswordStrengthMeter password="" onScore={first} />)
    rerender(<PasswordStrengthMeter password="" onScore={second} />)
    rerender(<PasswordStrengthMeter password="abc" onScore={second} />)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('does not fire twice or on mount under StrictMode', () => {
    const onScore = vi.fn()
    const onText = vi.fn()
    const { rerender } = render(
      <StrictMode>
        <PasswordStrengthMeter password="" onScore={onScore} onText={onText} />
      </StrictMode>,
    )
    expect(onScore).not.toHaveBeenCalled()
    expect(onText).not.toHaveBeenCalled()

    rerender(
      <StrictMode>
        <PasswordStrengthMeter password="k8#Qz!2mWp" onScore={onScore} onText={onText} />
      </StrictMode>,
    )
    expect(onScore).toHaveBeenCalledTimes(1)
    expect(onText).toHaveBeenCalledTimes(1)
    expect(onText).toHaveBeenCalledWith('Good password', expect.objectContaining({ level: 'good' }))
  })
})
