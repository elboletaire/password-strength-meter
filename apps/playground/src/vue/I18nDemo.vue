<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { translate } from '../i18n'
import { useLang } from './use-lang'

const password = ref('')
const lang = useLang()

// reads the language, so the texts that use it are translated again when it changes
const translateNow = (key: string, params?: Record<string, number>): string => {
  void lang.value
  return translate(key, params)
}
</script>

<template>
  <div class="field">
    <label for="vue-i18next">Password</label>
    <input id="vue-i18next" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-i18next-strength">
    <PasswordStrengthMeter id="vue-i18next-strength" :password="password" :translate="translateNow" show-percent />
  </div>
</template>
