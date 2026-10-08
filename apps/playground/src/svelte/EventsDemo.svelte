<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import Icon from './Icon.svelte'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
  let percent = $state(0)
  let sent = $state(false)

  const submit = (event: SubmitEvent): void => {
    event.preventDefault()
    sent = true
  }
</script>

<form class="events" novalidate onsubmit={submit}>
  <PasswordField id="svelte-events" bind:value={password} describedBy="svelte-events-strength">
    <PasswordStrengthMeter id="svelte-events-strength" {password} onscore={(value) => (percent = value)} {...lang.meterTexts} />
  </PasswordField>
  <div class="events__bar">
    <p class="events__score">
      <span>{lang.t('events.score')}</span>
      <output for="svelte-events">{percent}%</output>
    </p>
    <button type="submit" class="btn btn--primary" disabled={percent <= 75}>
      <span>{lang.t('events.send')}</span>
      <Icon name="arrowRight" size={18} />
    </button>
  </div>
  <p class="hint">{lang.t('events.hint')}</p>
  <p class="events__status" role="status">{sent ? lang.t('events.sent') : ''}</p>
</form>
