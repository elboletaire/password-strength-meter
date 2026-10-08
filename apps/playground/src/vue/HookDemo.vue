<script setup lang="ts">
import { usePasswordStrength } from '@passcore/vue'
import { ref } from 'vue'

const password = ref('')
// the composable returns refs: destructured, they are unwrapped in the template
const { result, text, levelText } = usePasswordStrength(password)
</script>

<template>
  <div class="field">
    <label for="vue-hook">Password</label>
    <input id="vue-hook" v-model="password" type="password" autocomplete="new-password">
    <p class="hint" aria-live="polite">{{ text }} ({{ result.percent }}%, {{ levelText }})</p>
    <ul class="checklist">
      <li v-for="rule in result.rules" :key="rule.id">
        <span :class="rule.passed ? 'badge badge--ok' : 'badge badge--bad'">{{ rule.passed ? 'passed' : 'failed' }}</span>
        <code>{{ rule.id }}</code>
      </li>
    </ul>
  </div>
</template>
