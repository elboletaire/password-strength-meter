<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { meterTexts } from '../lib/i18n'
import PasswordField from './PasswordField.vue'

const password = ref('')
const texts = meterTexts()
</script>

<template>
  <PasswordField id="vue-theme" v-model="password" described-by="vue-theme-strength">
    <PasswordStrengthMeter id="vue-theme-strength" :password="password" show-percent v-bind="texts" />
  </PasswordField>
</template>
