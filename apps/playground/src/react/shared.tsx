import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { ICONS, type IconName } from '../common/icons'
import { locales, meterLabel, t } from '../lib/i18n'
import { currentLang, onLanguageChange, type Lang } from '../lib/lang'
import { keepFocus, revealLabel } from '../lib/reveal'

/** The language of the header, as state: a change renders the demo again. */
export function useLang(): Lang {
  const [lang, setLang] = useState(currentLang)
  useEffect(() => onLanguageChange(setLang), [])
  return lang
}

/** The texts and the accessible name of the meter in the current language, for every demo. */
export function meterTexts(lang: Lang) {
  return { translations: locales[lang], locale: lang, label: meterLabel() }
}

export function Icon({ name, size = 20, className = 'icon' }: { name: IconName, size?: number, className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  )
}

interface PasswordInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  describedBy?: string
}

/** A password input with the playground's show/hide button inside it (see src/lib/reveal.ts). */
export function PasswordInput({ id, value, onChange, describedBy }: PasswordInputProps) {
  useLang()
  const [shown, setShown] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const selection = useRef<[number, number] | null>(null)

  // changing the type can move the caret: put it back where it was
  useLayoutEffect(() => {
    const element = input.current
    if (element && selection.current && document.activeElement === element) {
      element.setSelectionRange(...selection.current)
    }
    selection.current = null
  }, [shown])

  const toggle = () => {
    const element = input.current
    if (element && element.selectionStart !== null && element.selectionEnd !== null) {
      selection.current = [element.selectionStart, element.selectionEnd]
    }
    setShown(!shown)
  }

  return (
    <div className="pw">
      <input
        ref={input}
        className="input pw__input"
        id={id}
        type={shown ? 'text' : 'password'}
        autoComplete="new-password"
        autoCapitalize="off"
        spellCheck={false}
        aria-describedby={describedBy}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="reveal"
        aria-controls={id}
        aria-pressed={shown}
        aria-label={revealLabel(shown)}
        onMouseDown={keepFocus}
        onClick={toggle}
      >
        <Icon name="eye" className="icon reveal__show" />
        <Icon name="eyeOff" className="icon reveal__hide" />
      </button>
    </div>
  )
}

/** A label and a password input; the meter goes in `children`. */
export function PasswordField({ id, value, onChange, describedBy, children }: PasswordInputProps & { children?: ReactNode }) {
  useLang()
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{t('field.password')}</label>
      <PasswordInput id={id} value={value} onChange={onChange} describedBy={describedBy} />
      {children}
    </div>
  )
}
