<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { LOCK_PATH } from '../cards'

  let password = $state('')
</script>

<div class="form-group">
  <label for="svelte-group">Password</label>
  <div class="input-group">
    <span class="input-group__addon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
        <path fill="currentColor" d={LOCK_PATH} />
      </svg>
    </span>
    <input id="svelte-group" type="password" autocomplete="new-password" aria-describedby="svelte-group-strength" bind:value={password} />
  </div>
  <PasswordStrengthMeter id="svelte-group-strength" {password} />
</div>
