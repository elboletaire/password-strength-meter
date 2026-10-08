<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { translate } from '../lib/i18n'
import PasswordField from './PasswordField.vue'
import { useT } from './use-lang'

const password = ref('')
// `translate` keeps its identity in every language: `locale` tells the component to translate again
const { lang, t } = useT()
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
