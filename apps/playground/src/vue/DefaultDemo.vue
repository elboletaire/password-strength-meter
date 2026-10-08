<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import PasswordField from './PasswordField.vue'
import { useMeterTexts } from './use-lang'

const password = ref('')
const texts = useMeterTexts()
</script>

<template>
  <PasswordField id="vue-default" v-model="password" described-by="vue-default-strength">
    <PasswordStrengthMeter id="vue-default-strength" :password="password" v-bind="texts" />
  </PasswordField>
</template>
