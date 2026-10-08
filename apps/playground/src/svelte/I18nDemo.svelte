<script lang="ts">
  import { PasswordStrengthMeter } from '@passcore/svelte'
  import { t, translate } from '../lib/i18n'
  import { currentLang } from '../lib/lang'
  import PasswordField from './PasswordField.svelte'

  let password = $state('')
</script>

<PasswordField id="svelte-i18next" bind:value={password} describedBy="svelte-i18next-strength">
  <PasswordStrengthMeter
    id="svelte-i18next-strength"
    {password}
    {translate}
    locale={currentLang()}
    label={t('meter.label')}
    showPercent
  />
</PasswordField>
