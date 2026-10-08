<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { LOCK_PATH } from '../cards'

const password = ref('')
</script>

<template>
  <div class="form-group">
    <label for="vue-group">Password</label>
    <div class="input-group">
      <span class="input-group__addon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
          <path fill="currentColor" :d="LOCK_PATH" />
        </svg>
      </span>
      <input id="vue-group" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-group-strength">
    </div>
    <PasswordStrengthMeter id="vue-group-strength" :password="password" />
  </div>
</template>
