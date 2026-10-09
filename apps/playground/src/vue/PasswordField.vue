<script setup lang="ts">
import { t } from '../lib/i18n'
import PasswordInput from './PasswordInput.vue'

/** A label and a password input; the meter goes in the default slot. */
defineProps<{ id: string, describedBy?: string }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="field">
    <label class="field__label" :for="id">{{ t('field.password') }}</label>
    <PasswordInput :id="id" v-model="model" :described-by="describedBy" />
    <slot />
  </div>
</template>
