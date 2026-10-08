<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'

const username = ref('')
const password = ref('')
</script>

<template>
  <div class="field">
    <label for="vue-username">Username</label>
    <input id="vue-username" v-model="username" type="text" autocomplete="username" placeholder="johndoe">
  </div>
  <div class="field">
    <label for="vue-linked">Password</label>
    <input id="vue-linked" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-linked-strength">
    <PasswordStrengthMeter id="vue-linked-strength" :password="password" :user-inputs="[username]" show-percent />
  </div>
</template>
