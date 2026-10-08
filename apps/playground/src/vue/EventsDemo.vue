<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'

const password = ref('')
const percent = ref(0)
const status = ref('')

const onScore = (value: number): void => {
  percent.value = value
}

const submit = (): void => {
  status.value = 'Submitted in the playground: nothing was sent.'
}
</script>

<template>
  <form @submit.prevent="submit">
    <div class="field">
      <label for="vue-events">Password</label>
      <input id="vue-events" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-events-strength">
      <PasswordStrengthMeter id="vue-events-strength" :password="password" @score="onScore" />
    </div>
    <p class="hint">Score: <output for="vue-events">{{ percent }}%</output></p>
    <div class="actions">
      <button type="submit" class="btn btn--primary" :disabled="percent <= 75">Send</button>
      <p class="hint" role="status">{{ status }}</p>
    </div>
  </form>
</template>
