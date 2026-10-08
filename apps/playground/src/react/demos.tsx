import { PasswordStrengthMeter, usePasswordStrength } from '@passcore/react'
import ca from '@passcore/react/locales/ca.json'
import en from '@passcore/react/locales/en.json'
import es from '@passcore/react/locales/es.json'
import { useState, type FormEvent } from 'react'
import { REQUIREMENT_RULES, requirementLabel, requirementState, requirementStateText, requirementsSummary } from '../lib/checklist'
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

const STATE_ICONS = { idle: 'dash', met: 'check', unmet: 'cross' } as const

/** The hook drives your own UI: a checklist of `result.rules`, next to the meter of the component. */
export function ChecklistDemo() {
  const lang = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { result } = usePasswordStrength(password, {
    translations: bundled[lang],
    locale: lang,
    userInputs: [username],
    rules: REQUIREMENT_RULES,
  })
  const typed = password !== ''

  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor="react-signup-username">{t('field.username')}</label>
        <input
          className="input"
          id="react-signup-username"
          type="text"
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={t('field.usernamePlaceholder')}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>
      <PasswordField id="react-signup" value={password} onChange={setPassword} describedBy="react-signup-strength react-checklist-summary">
        <PasswordStrengthMeter id="react-signup-strength" password={password} userInputs={[username]} rules={REQUIREMENT_RULES} {...meterTexts(lang)} />
      </PasswordField>
      <div className="reqs">
        <p className="reqs__title" id="react-checklist-title">{t('requirements.title')}</p>
        <ul className="reqs__list" aria-labelledby="react-checklist-title">
          {result.rules.map((rule) => {
            const state = requirementState(typed, rule.passed)
            return (
              <li key={rule.id} className="req" data-rule={rule.id} data-state={state}>
                <span className="req__icon" aria-hidden="true">
                  <Icon name={STATE_ICONS[state]} size={14} className={`icon req__icon-${state}`} />
                </span>
                <span className="req__label">{requirementLabel(rule)}</span>
                {state !== 'idle' && <span className="visually-hidden">{`, ${requirementStateText(state)}`}</span>}
              </li>
            )
          })}
        </ul>
        {/* a live region: React only touches the text when it changes, so it is heard once per change */}
        <p className="reqs__summary" id="react-checklist-summary" aria-live="polite">{requirementsSummary(result.rules, typed)}</p>
      </div>
    </>
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
