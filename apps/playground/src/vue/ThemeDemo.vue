<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <div class="field">
    <label for="vue-theme">Password</label>
    <input id="vue-theme" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-theme-strength">
    <PasswordStrengthMeter id="vue-theme-strength" :password="password" show-percent />
  </div>
</template>
