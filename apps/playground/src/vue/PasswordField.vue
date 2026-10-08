<script setup lang="ts">
import PasswordInput from './PasswordInput.vue'
import { useT } from './use-lang'

/** A label and a password input; the meter goes in the default slot. */
defineProps<{ id: string, describedBy?: string }>()
const model = defineModel<string>({ required: true })
const { t } = useT()
</script>

<template>
  <div class="field">
    <label class="field__label" :for="id">{{ t('field.password') }}</label>
    <PasswordInput :id="id" v-model="model" :described-by="describedBy" />
    <slot />
  </div>
</template>
