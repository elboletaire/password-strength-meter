<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'

  let password = $state('')
</script>

<div class="field">
  <label for="svelte-percent">Password</label>
  <input id="svelte-percent" type="password" autocomplete="new-password" aria-describedby="svelte-percent-strength" bind:value={password} />
  <PasswordStrengthMeter id="svelte-percent-strength" {password} showPercent />
</div>
