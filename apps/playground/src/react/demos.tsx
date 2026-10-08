import { PasswordStrengthMeter, usePasswordStrength } from '@passcore/react'
import ca from '@passcore/react/locales/ca.json'
import en from '@passcore/react/locales/en.json'
import es from '@passcore/react/locales/es.json'
import { useState, type FormEvent } from 'react'
import { CHECKLIST_RULES, describeRule, litSteps, ruleState, STEPS } from '../lib/checklist'
import { meterLabel, t, translate } from '../lib/i18n'
import { Icon, meterTexts, PasswordField, PasswordInput, useLang } from './shared'

const bundled = { en, es, ca }

export function DefaultDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')

  return (
    <PasswordField id="react-default" value={password} onChange={setPassword} describedBy="react-default-strength">
      <PasswordStrengthMeter id="react-default-strength" password={password} {...meterTexts(lang)} />
    </PasswordField>
  )
}

export function PercentDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')

  return (
    <PasswordField id="react-percent" value={password} onChange={setPassword} describedBy="react-percent-strength">
      <PasswordStrengthMeter id="react-percent-strength" password={password} showPercent {...meterTexts(lang)} />
    </PasswordField>
  )
}

export function LinkedDemo() {
  const lang = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor="react-username">{t('field.username')}</label>
        <input
          className="input"
          id="react-username"
          type="text"
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={t('field.usernamePlaceholder')}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>
      <PasswordField id="react-linked" value={password} onChange={setPassword} describedBy="react-linked-strength">
        <PasswordStrengthMeter id="react-linked-strength" password={password} userInputs={[username]} showPercent {...meterTexts(lang)} />
      </PasswordField>
    </>
  )
}

export function TranslationsDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')

  return (
    <PasswordField id="react-translations" value={password} onChange={setPassword} describedBy="react-translations-strength">
      <PasswordStrengthMeter
        id="react-translations-strength"
        password={password}
        translations={bundled[lang]}
        locale={lang}
        label={meterLabel()}
        showPercent
      />
    </PasswordField>
  )
}

export function I18nDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')

  // `translate` keeps its identity in every language: `locale` tells the component to translate again
  return (
    <PasswordField id="react-i18next" value={password} onChange={setPassword} describedBy="react-i18next-strength">
      <PasswordStrengthMeter
        id="react-i18next-strength"
        password={password}
        translate={translate}
        locale={lang}
        label={meterLabel()}
        showPercent
      />
    </PasswordField>
  )
}

export function EventsDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')
  const [percent, setPercent] = useState(0)
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <form className="events" onSubmit={submit} noValidate>
      <PasswordField id="react-events" value={password} onChange={setPassword} describedBy="react-events-strength">
        <PasswordStrengthMeter id="react-events-strength" password={password} onScore={setPercent} {...meterTexts(lang)} />
      </PasswordField>
      <div className="events__bar">
        <p className="events__score">
          <span>{t('events.score')}</span>
          {' '}
          <output htmlFor="react-events">{`${percent}%`}</output>
        </p>
        <button type="submit" className="btn btn--primary" disabled={percent <= 75}>
          <span>{t('events.send')}</span>
          <Icon name="arrowRight" size={18} />
        </button>
      </div>
      <p className="hint">{t('events.hint')}</p>
      <p className="events__status" role="status">{sent ? t('events.sent') : ''}</p>
    </form>
  )
}

export function GroupDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')

  return (
    <div className="form-group field">
      <label className="field__label" htmlFor="react-group">{t('field.password')}</label>
      <div className="input-group">
        <span className="input-group__addon" aria-hidden="true"><Icon name="lock" size={18} /></span>
        <PasswordInput id="react-group" value={password} onChange={setPassword} describedBy="react-group-strength" />
      </div>
      <PasswordStrengthMeter id="react-group-strength" password={password} {...meterTexts(lang)} />
    </div>
  )
}

/** The hook drives a custom UI: five steps, the message and a checklist of the rules. */
export function HookDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')
  const { level, rules, text } = usePasswordStrength(password, {
    translations: bundled[lang],
    locale: lang,
    rules: CHECKLIST_RULES,
  })
  const lit = litSteps(level)

  return (
    <div className="custom">
      <PasswordField id="react-hook" value={password} onChange={setPassword} describedBy="react-hook-text" />
      <div className="steps" data-level={level} aria-hidden="true">
        {STEPS.map((step, index) => <span key={step} className={index < lit ? 'steps__step steps__step--on' : 'steps__step'} />)}
      </div>
      <p className="custom__text" id="react-hook-text" aria-live="polite">{text}</p>
      <p className="checklist__title" id="react-hook-rules">{t('checklist.title')}</p>
      <ul className="checklist" aria-labelledby="react-hook-rules">
        {rules.map((rule) => (
          <li key={rule.id} className="checklist__item" data-passed={rule.passed}>
            <Icon name={rule.passed ? 'check' : 'cross'} size={16} className="icon checklist__icon" />
            <span>{describeRule(rule)}</span>
            <span className="visually-hidden">{`, ${ruleState(rule.passed)}`}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ThemeDemo() {
  const lang = useLang()
  const [password, setPassword] = useState('')

  return (
    <PasswordField id="react-theme" value={password} onChange={setPassword} describedBy="react-theme-strength">
      <PasswordStrengthMeter id="react-theme-strength" password={password} showPercent {...meterTexts(lang)} />
    </PasswordField>
  )
}
