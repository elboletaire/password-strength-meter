<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import ca from '@passcore/svelte/locales/ca.json'
  import en from '@passcore/svelte/locales/en.json'
  import es from '@passcore/svelte/locales/es.json'
  import { langState } from './lang.svelte'

  const bundled = { en, es, ca }
  const lang = langState()
  let password = $state('')
</script>

<div class="field">
  <label for="svelte-translations">Password</label>
  <input id="svelte-translations" type="password" autocomplete="new-password" aria-describedby="svelte-translations-strength" bind:value={password} />
  <PasswordStrengthMeter
    id="svelte-translations-strength"
    {password}
    translations={bundled[lang.current]}
    locale={lang.current}
    showPercent
  />
</div>
