<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import PasswordField from './PasswordField.vue'
import { useMeterTexts } from './use-lang'

const password = ref('')
const texts = useMeterTexts()
</script>

<template>
  <PasswordField id="vue-theme" v-model="password" described-by="vue-theme-strength">
    <PasswordStrengthMeter id="vue-theme-strength" :password="password" show-percent v-bind="texts" />
  </PasswordField>
</template>
