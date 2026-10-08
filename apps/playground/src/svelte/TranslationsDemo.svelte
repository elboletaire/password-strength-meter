<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import ca from '@passcore/svelte/locales/ca.json'
  import en from '@passcore/svelte/locales/en.json'
  import es from '@passcore/svelte/locales/es.json'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  const bundled = { en, es, ca }
  let password = $state('')
</script>

<PasswordField id="svelte-translations" bind:value={password} describedBy="svelte-translations-strength">
  <PasswordStrengthMeter
    id="svelte-translations-strength"
    {password}
    translations={bundled[lang.current]}
    locale={lang.current}
    label={lang.t('meter.label')}
    showPercent
  />
</PasswordField>
