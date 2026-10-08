<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
</script>

<PasswordField id="svelte-default" bind:value={password} describedBy="svelte-default-strength">
  <PasswordStrengthMeter id="svelte-default-strength" {password} {...lang.meterTexts} />
</PasswordField>
