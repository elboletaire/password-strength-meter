<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { translate } from '../i18n'
  import { langState } from './lang.svelte'

  const lang = langState()
  let password = $state('')

  // reads the language, so the texts that use it are translated again when it changes
  const translateNow = (key: string, params?: Record<string, number>): string => {
    void lang.current
    return translate(key, params)
  }
</script>

<div class="field">
  <label for="svelte-i18next">Password</label>
  <input id="svelte-i18next" type="password" autocomplete="new-password" aria-describedby="svelte-i18next-strength" bind:value={password} />
  <PasswordStrengthMeter id="svelte-i18next-strength" {password} translate={translateNow} showPercent />
</div>
