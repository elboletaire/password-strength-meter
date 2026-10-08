<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'

  let username = $state('')
  let password = $state('')
</script>

<div class="field">
  <label for="svelte-username">Username</label>
  <input id="svelte-username" type="text" autocomplete="username" placeholder="johndoe" bind:value={username} />
</div>
<div class="field">
  <label for="svelte-linked">Password</label>
  <input id="svelte-linked" type="password" autocomplete="new-password" aria-describedby="svelte-linked-strength" bind:value={password} />
  <PasswordStrengthMeter id="svelte-linked-strength" {password} userInputs={[username]} showPercent />
</div>
