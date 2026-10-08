<script lang="ts">
  import { PasswordStrengthMeter, passwordStrength } from '@passcore/svelte'
  import ca from '@passcore/svelte/locales/ca.json'
  import en from '@passcore/svelte/locales/en.json'
  import es from '@passcore/svelte/locales/es.json'
  import { REQUIREMENT_RULES, requirementLabel, requirementState, requirementStateText, requirementsSummary } from '../lib/checklist'
  import Icon from './Icon.svelte'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  const STATE_ICONS = { idle: 'dash', met: 'check', unmet: 'cross' } as const

  const bundled = { en, es, ca }
  let username = $state('')
  let password = $state('')

  // the helper drives your own UI: a checklist of `result.rules`, next to the meter of the component
  const strength = passwordStrength(() => password, () => ({
    translations: bundled[lang.current],
    locale: lang.current,
    userInputs: [username],
    rules: REQUIREMENT_RULES,
  }))
  const typed = $derived(password !== '')
  // the labels and the summary are site texts: they follow the language too
  const items = $derived(strength.result.rules.map((rule) => {
    const state = requirementState(typed, rule.passed)
    return { id: rule.id, state, label: lang.current ? requirementLabel(rule) : '', stateText: requirementStateText(state) }
  }))
  // a live region: Svelte only touches the text when it changes, so it is heard once per change
  const summary = $derived(lang.current ? requirementsSummary(strength.result.rules, typed) : '')
</script>

<div class="field">
  <label class="field__label" for="svelte-signup-username">{lang.t('field.username')}</label>
  <input
    id="svelte-signup-username"
    class="input"
    type="text"
    autocomplete="username"
    autocapitalize="off"
    spellcheck="false"
    placeholder={lang.t('field.usernamePlaceholder')}
    bind:value={username}
  />
</div>
<PasswordField id="svelte-signup" bind:value={password} describedBy="svelte-signup-strength svelte-checklist-summary">
  <PasswordStrengthMeter id="svelte-signup-strength" {password} userInputs={[username]} rules={REQUIREMENT_RULES} {...lang.meterTexts} />
</PasswordField>
<div class="reqs">
  <p id="svelte-checklist-title" class="reqs__title">{lang.t('requirements.title')}</p>
  <ul class="reqs__list" aria-labelledby="svelte-checklist-title">
    {#each items as item (item.id)}
      <li class="req" data-rule={item.id} data-state={item.state}>
        <span class="req__icon" aria-hidden="true">
          <Icon name={STATE_ICONS[item.state]} size={14} className={`icon req__icon-${item.state}`} />
        </span>
        <span class="req__label">{item.label}</span>
        {#if item.state !== 'idle'}
          <span class="visually-hidden">, {item.stateText}</span>
        {/if}
      </li>
    {/each}
  </ul>
  <p id="svelte-checklist-summary" class="reqs__summary" aria-live="polite">{summary}</p>
</div>
