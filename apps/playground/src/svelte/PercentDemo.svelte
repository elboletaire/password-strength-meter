<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { meterTexts } from '../lib/i18n'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
</script>

<PasswordField id="svelte-percent" bind:value={password} describedBy="svelte-percent-strength">
  <PasswordStrengthMeter id="svelte-percent-strength" {password} showPercent {...meterTexts()} />
</PasswordField>
