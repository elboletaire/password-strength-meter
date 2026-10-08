<script lang="ts">
  import type { Snippet } from 'svelte'
  import { t } from '../lib/i18n'
  import PasswordInput from './PasswordInput.svelte'

  /** A label and a password input; the meter goes in `children`. */
  let { id, value = $bindable(''), describedBy, children }: { id: string, value?: string, describedBy?: string, children?: Snippet } = $props()
</script>

<div class="field">
  <label class="field__label" for={id}>{t('field.password')}</label>
  <PasswordInput {id} bind:value {describedBy} />
  {@render children?.()}
</div>
