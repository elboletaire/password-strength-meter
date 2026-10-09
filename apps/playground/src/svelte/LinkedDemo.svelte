<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { meterTexts, t } from '../lib/i18n'
  import PasswordField from './PasswordField.svelte'

  let username = $state('')
  let password = $state('')
</script>

<div class="field">
  <label class="field__label" for="svelte-username">{t('field.username')}</label>
  <input
    id="svelte-username"
    class="input"
    type="text"
    autocomplete="username"
    autocapitalize="off"
    spellcheck="false"
    placeholder={t('field.usernamePlaceholder')}
    bind:value={username}
  />
</div>
<PasswordField id="svelte-linked" bind:value={password} describedBy="svelte-linked-strength">
  <PasswordStrengthMeter id="svelte-linked-strength" {password} userInputs={[username]} showPercent {...meterTexts()} />
</PasswordField>
