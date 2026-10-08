<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'

  let password = $state('')
  let percent = $state(0)
  let status = $state('')

  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    status = 'Submitted in the playground: nothing was sent.'
  }
</script>

<form onsubmit={submit}>
  <div class="field">
    <label for="svelte-events">Password</label>
    <input id="svelte-events" type="password" autocomplete="new-password" aria-describedby="svelte-events-strength" bind:value={password} />
    <PasswordStrengthMeter id="svelte-events-strength" {password} onscore={(value) => (percent = value)} />
  </div>
  <p class="hint">Score: <output for="svelte-events">{percent}%</output></p>
  <div class="actions">
    <button type="submit" class="btn btn--primary" disabled={percent <= 75}>Send</button>
    <p class="hint" role="status">{status}</p>
  </div>
</form>
