<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { meterTexts, t } from '../lib/i18n'
import Icon from './Icon.vue'
import PasswordInput from './PasswordInput.vue'

const password = ref('')
const texts = meterTexts()
</script>

<template>
  <div class="form-group field">
    <label class="field__label" for="vue-group">{{ t('field.password') }}</label>
    <div class="input-group">
      <span class="input-group__addon" aria-hidden="true"><Icon name="lock" :size="18" /></span>
      <PasswordInput id="vue-group" v-model="password" described-by="vue-group-strength" />
    </div>
    <PasswordStrengthMeter id="vue-group-strength" :password="password" v-bind="texts" />
  </div>
</template>
