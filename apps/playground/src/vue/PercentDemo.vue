<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <div class="field">
    <label for="vue-percent">Password</label>
    <input id="vue-percent" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-percent-strength">
    <PasswordStrengthMeter id="vue-percent-strength" :password="password" show-percent />
  </div>
</template>
