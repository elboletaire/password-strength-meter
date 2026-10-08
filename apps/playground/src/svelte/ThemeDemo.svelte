<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
</script>

<PasswordField id="svelte-theme" bind:value={password} describedBy="svelte-theme-strength">
  <PasswordStrengthMeter id="svelte-theme-strength" {password} showPercent {...lang.meterTexts} />
</PasswordField>
