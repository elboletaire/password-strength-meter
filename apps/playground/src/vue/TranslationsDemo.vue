<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import ca from '@passcore/vue/locales/ca.json'
import en from '@passcore/vue/locales/en.json'
import es from '@passcore/vue/locales/es.json'
import { ref } from 'vue'
import { useLang } from './use-lang'

const bundled = { en, es, ca }
const password = ref('')
const lang = useLang()
</script>

<template>
  <div class="field">
    <label for="vue-translations">Password</label>
    <input id="vue-translations" v-model="password" type="password" autocomplete="new-password" aria-describedby="vue-translations-strength">
    <PasswordStrengthMeter
      id="vue-translations-strength"
      :password="password"
      :translations="bundled[lang]"
      :locale="lang"
      show-percent
    />
  </div>
</template>
