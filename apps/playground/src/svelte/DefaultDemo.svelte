<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'

  let password = $state('')
</script>

<div class="field">
  <label for="svelte-default">Password</label>
  <input id="svelte-default" type="password" autocomplete="new-password" aria-describedby="svelte-default-strength" bind:value={password} />
  <PasswordStrengthMeter id="svelte-default-strength" {password} />
</div>
