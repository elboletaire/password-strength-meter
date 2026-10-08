<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import Icon from './Icon.svelte'
  import { lang } from './lang.svelte'
  import PasswordInput from './PasswordInput.svelte'

  let password = $state('')
</script>

<div class="form-group field">
  <label class="field__label" for="svelte-group">{lang.t('field.password')}</label>
  <div class="input-group">
    <span class="input-group__addon" aria-hidden="true"><Icon name="lock" size={18} /></span>
    <PasswordInput id="svelte-group" bind:value={password} describedBy="svelte-group-strength" />
  </div>
  <PasswordStrengthMeter id="svelte-group-strength" {password} {...lang.meterTexts} />
</div>
