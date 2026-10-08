<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'

  let password = $state('')
</script>

<div class="field">
  <label for="svelte-theme">Password</label>
  <input id="svelte-theme" type="password" autocomplete="new-password" aria-describedby="svelte-theme-strength" bind:value={password} />
  <PasswordStrengthMeter id="svelte-theme-strength" {password} showPercent />
</div>
