<script lang="ts">
  import { passwordStrength } from '@passcore/svelte'

  let password = $state('')
  const strength = passwordStrength(() => password)
</script>

<div class="field">
  <label for="svelte-hook">Password</label>
  <input id="svelte-hook" type="password" autocomplete="new-password" bind:value={password} />
  <p class="hint" aria-live="polite">{strength.text} ({strength.result.percent}%, {strength.levelText})</p>
  <ul class="checklist">
    {#each strength.result.rules as rule (rule.id)}
      <li>
        <span class={rule.passed ? 'badge badge--ok' : 'badge badge--bad'}>{rule.passed ? 'passed' : 'failed'}</span>
        <code>{rule.id}</code>
      </li>
    {/each}
  </ul>
</div>
