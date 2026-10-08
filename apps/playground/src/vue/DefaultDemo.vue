<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <div class="field">
    <label for="vue-default">Password</label>
    <input id="vue-default" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-default-strength">
    <PasswordStrengthMeter id="vue-default-strength" :password="password" />
  </div>
</template>
