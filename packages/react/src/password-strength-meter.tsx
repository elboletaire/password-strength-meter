import type { Result } from '@passcore/core'
import { useEffect, useMemo, useRef, type ReactElement } from 'react'
import { usePasswordStrength, type PasswordStrengthOptions } from './use-password-strength'

export interface PasswordStrengthMeterProps extends PasswordStrengthOptions {
  password: string
  /** id of the text element, for aria-describedby on the input. */
  id?: string
  /** Added to the wrapper. */
  className?: string
  /** Show the score percentage. Default false. */
  showPercent?: boolean
  /** Show the message. Default true. */
  showText?: boolean
  /** aria-label of the meter. Default 'Password strength'. */
  label?: string
  /** Called with the percent and the core result when the evaluated result changes (not on mount). */
  onScore?: (percent: number, result: Result) => void
  /** Called with the translated text when the message changes (not on mount). */
  onText?: (text: string, result: Result) => void
}

/**
 * A password strength meter with the standard markup: a meter with a bar,
 * an optional percentage and the message, linked to the input with `id`.
 */
export function PasswordStrengthMeter(props: PasswordStrengthMeterProps): ReactElement {
  const {
    password,
    id,
    className,
    showPercent = false,
    showText = true,
    label = 'Password strength',
    onScore,
    onText,
    ...options
  } = props
  const { result, text, levelText } = usePasswordStrength(password, options)

  // the latest callbacks and text, read by the effects below (updated after each commit)
  const latest = useRef({ onScore, onText, text })
  useEffect(() => {
    latest.current = { onScore, onText, text }
  })

  // by value: a new but equal result (e.g. the same options passed again) doesn't fire onScore
  const resultKey = useMemo(() => JSON.stringify(result), [result])
  const previousKey = useRef<string | undefined>(undefined)
  useEffect(() => {
    const previous = previousKey.current
    previousKey.current = resultKey
    // the first run is the mount, and StrictMode's re-run sees the same result
    if (previous === undefined || previous === resultKey) {
      return
    }
    latest.current.onScore?.(result.percent, result)
  }, [resultKey, result])

  const messageKey = JSON.stringify([result.message.key, result.message.params])
  const previousMessage = useRef<string | undefined>(undefined)
  useEffect(() => {
    const previous = previousMessage.current
    previousMessage.current = messageKey
    if (previous === undefined || previous === messageKey) {
      return
    }
    latest.current.onText?.(latest.current.text, result)
  }, [messageKey, result])

  const wrapperClass = [
    'pass-wrapper',
    `pass-level-${result.level}`,
    result.valid ? '' : 'pass-invalid',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      <div
        className="pass-meter"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={result.percent}
        aria-valuetext={levelText}
      >
        <div className="pass-bar" style={{ width: `${result.percent}%` }} />
      </div>
      {showPercent && (
        <span className="pass-percent">{`${result.percent}%`}</span>
      )}
      {showText && <span className="pass-text" id={id} aria-live="polite">{text}</span>}
    </div>
  )
}
