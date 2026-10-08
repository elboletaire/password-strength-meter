<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { meterTexts } from '../lib/i18n'
import PasswordField from './PasswordField.vue'

const password = ref('')
const texts = meterTexts()
</script>

<template>
  <PasswordField id="vue-percent" v-model="password" described-by="vue-percent-strength">
    <PasswordStrengthMeter id="vue-percent-strength" :password="password" show-percent v-bind="texts" />
  </PasswordField>
</template>
