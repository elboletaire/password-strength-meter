<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { meterTexts } from '../lib/i18n'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
</script>

<PasswordField id="svelte-theme" bind:value={password} describedBy="svelte-theme-strength">
  <PasswordStrengthMeter id="svelte-theme-strength" {password} showPercent {...meterTexts()} />
</PasswordField>
