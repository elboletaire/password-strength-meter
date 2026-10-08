<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { meterTexts, t } from '../lib/i18n'
import PasswordField from './PasswordField.vue'

const username = ref('')
const password = ref('')
const texts = meterTexts()
</script>

<template>
  <div class="field">
    <label class="field__label" for="vue-username">{{ t('field.username') }}</label>
    <input
      id="vue-username"
      v-model="username"
      class="input"
      type="text"
      autocomplete="username"
      autocapitalize="off"
      spellcheck="false"
      :placeholder="t('field.usernamePlaceholder')"
    >
  </div>
  <PasswordField id="vue-linked" v-model="password" described-by="vue-linked-strength">
    <PasswordStrengthMeter id="vue-linked-strength" :password="password" :user-inputs="[username]" show-percent v-bind="texts" />
  </PasswordField>
</template>
