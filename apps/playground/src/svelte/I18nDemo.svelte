<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { translate } from '../lib/i18n'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
</script>

<!-- `translate` keeps its identity in every language: `locale` tells the component to translate again -->
<PasswordField id="svelte-i18next" bind:value={password} describedBy="svelte-i18next-strength">
  <PasswordStrengthMeter
    id="svelte-i18next-strength"
    {password}
    {translate}
    locale={lang.current}
    label={lang.t('meter.label')}
    showPercent
  />
</PasswordField>
