import { PasswordStrengthMeter, usePasswordStrength } from '@passcore/react'
import ca from '@passcore/react/locales/ca.json'
import en from '@passcore/react/locales/en.json'
import es from '@passcore/react/locales/es.json'
import { useEffect, useState, type FormEvent } from 'react'
import { LOCK_PATH } from '../cards'
import { translate } from '../i18n'
import { currentLang, onLanguageChange, type Lang } from '../site'

const bundled = { en, es, ca }

/** The language of the header, as state: a change re-renders the demo. */
function useLang(): Lang {
  const [lang, setLang] = useState(currentLang)
  useEffect(() => onLanguageChange(setLang), [])
  return lang
}

export function DefaultDemo() {
  const [password, setPassword] = useState('')

  return (
    <div className="field">
      <label htmlFor="react-default">Password</label>
      <input
        id="react-default"
        type="password"
        autoComplete="new-password"
        aria-describedby="react-default-strength"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordStrengthMeter id="react-default-strength" password={password} />
    </div>
  )
}

export function PercentDemo() {
  const [password, setPassword] = useState('')

  return (
    <div className="field">
      <label htmlFor="react-percent">Password</label>
      <input
        id="react-percent"
        type="password"
        autoComplete="new-password"
        aria-describedby="react-percent-strength"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordStrengthMeter id="react-percent-strength" password={password} showPercent />
    </div>
  )
}

export function LinkedDemo() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return (
    <>
      <div className="field">
        <label htmlFor="react-username">Username</label>
        <input
          id="react-username"
          type="text"
          autoComplete="username"
          placeholder="johndoe"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="react-linked">Password</label>
        <input
          id="react-linked"
          type="password"
          autoComplete="new-password"
          aria-describedby="react-linked-strength"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordStrengthMeter id="react-linked-strength" password={password} userInputs={[username]} showPercent />
      </div>
    </>
  )
}

export function TranslationsDemo() {
  const [password, setPassword] = useState('')
  const lang = useLang()

  return (
    <div className="field">
      <label htmlFor="react-translations">Password</label>
      <input
        id="react-translations"
        type="password"
        autoComplete="new-password"
        aria-describedby="react-translations-strength"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordStrengthMeter
        id="react-translations-strength"
        password={password}
        translations={bundled[lang]}
        locale={lang}
        showPercent
      />
    </div>
  )
}

export function I18nDemo() {
  const [password, setPassword] = useState('')
  // the language of the header, as state: the arrow below is new on each render, so the texts follow it
  useLang()

  return (
    <div className="field">
      <label htmlFor="react-i18next">Password</label>
      <input
        id="react-i18next"
        type="password"
        autoComplete="new-password"
        aria-describedby="react-i18next-strength"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordStrengthMeter
        id="react-i18next-strength"
        password={password}
        translate={(key, params) => translate(key, params)}
        showPercent
      />
    </div>
  )
}

export function EventsDemo() {
  const [password, setPassword] = useState('')
  const [percent, setPercent] = useState(0)
  const [status, setStatus] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('Submitted in the playground: nothing was sent.')
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="react-events">Password</label>
        <input
          id="react-events"
          type="password"
          autoComplete="new-password"
          aria-describedby="react-events-strength"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordStrengthMeter
          id="react-events-strength"
          password={password}
          onScore={(score) => setPercent(score)}
        />
      </div>
      <output className="hint" htmlFor="react-events">{`Score: ${percent}%`}</output>
      <div className="actions">
        <button type="submit" className="btn btn--primary" disabled={percent <= 75}>Send</button>
        <p className="hint" role="status">{status}</p>
      </div>
    </form>
  )
}

export function GroupDemo() {
  const [password, setPassword] = useState('')

  return (
    <div className="form-group">
      <label htmlFor="react-group">Password</label>
      <div className="input-group">
        <span className="input-group__addon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
            <path fill="currentColor" d={LOCK_PATH} />
          </svg>
        </span>
        <input
          id="react-group"
          type="password"
          autoComplete="new-password"
          aria-describedby="react-group-strength"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <PasswordStrengthMeter id="react-group-strength" password={password} />
    </div>
  )
}

/** The hook drives a custom UI: a checklist of the rules, and the message. */
export function HookDemo() {
  const [password, setPassword] = useState('')
  const { percent, rules, text, levelText } = usePasswordStrength(password)

  return (
    <div className="field">
      <label htmlFor="react-hook">Password</label>
      <input
        id="react-hook"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <p className="hint" aria-live="polite">{`${text} (${percent}%, ${levelText})`}</p>
      <ul className="checklist">
        {rules.map((rule) => (
          <li key={rule.id}>
            <span className={rule.passed ? 'badge badge--ok' : 'badge badge--bad'}>{rule.passed ? 'passed' : 'failed'}</span>
            <code>{rule.id}</code>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ThemeDemo() {
  const [password, setPassword] = useState('')

  return (
    <div className="field">
      <label htmlFor="react-theme">Password</label>
      <input
        id="react-theme"
        type="password"
        autoComplete="new-password"
        aria-describedby="react-theme-strength"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordStrengthMeter id="react-theme-strength" password={password} showPercent />
    </div>
  )
}
