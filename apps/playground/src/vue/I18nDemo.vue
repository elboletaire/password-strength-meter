<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { t, translate } from '../lib/i18n'
import { currentLang } from '../lib/lang'
import PasswordField from './PasswordField.vue'

const password = ref('')
const lang = currentLang()
</script>

<template>
  <PasswordField id="vue-i18next" v-model="password" described-by="vue-i18next-strength">
    <PasswordStrengthMeter
      id="vue-i18next-strength"
      :password="password"
      :translate="translate"
      :locale="lang"
      :label="t('meter.label')"
      show-percent
    />
  </PasswordField>
</template>
