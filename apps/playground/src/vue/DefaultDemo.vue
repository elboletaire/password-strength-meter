<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { meterTexts } from '../lib/i18n'
import PasswordField from './PasswordField.vue'

const password = ref('')
const texts = meterTexts()
</script>

<template>
  <PasswordField id="vue-default" v-model="password" described-by="vue-default-strength">
    <PasswordStrengthMeter id="vue-default-strength" :password="password" v-bind="texts" />
  </PasswordField>
</template>
