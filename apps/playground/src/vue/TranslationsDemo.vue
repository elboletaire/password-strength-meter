<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import ca from '@passcore/vue/locales/ca.json'
import en from '@passcore/vue/locales/en.json'
import es from '@passcore/vue/locales/es.json'
import { ref } from 'vue'
import PasswordField from './PasswordField.vue'
import { useT } from './use-lang'

const bundled = { en, es, ca }
const password = ref('')
const { lang, t } = useT()
</script>

<template>
  <PasswordField id="vue-translations" v-model="password" described-by="vue-translations-strength">
    <PasswordStrengthMeter
      id="vue-translations-strength"
      :password="password"
      :translations="bundled[lang]"
      :locale="lang"
      :label="t('meter.label')"
      show-percent
    />
  </PasswordField>
</template>
