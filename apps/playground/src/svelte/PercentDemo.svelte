<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
</script>

<PasswordField id="svelte-percent" bind:value={password} describedBy="svelte-percent-strength">
  <PasswordStrengthMeter id="svelte-percent-strength" {password} showPercent {...lang.meterTexts} />
</PasswordField>
