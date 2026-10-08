<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import PasswordField from './PasswordField.vue'
import { useMeterTexts } from './use-lang'

const password = ref('')
const texts = useMeterTexts()
</script>

<template>
  <PasswordField id="vue-percent" v-model="password" described-by="vue-percent-strength">
    <PasswordStrengthMeter id="vue-percent-strength" :password="password" show-percent v-bind="texts" />
  </PasswordField>
</template>
