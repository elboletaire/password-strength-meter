<script setup lang="ts">
import { PasswordStrengthMeter } from '@passcore/vue'
import { ref } from 'vue'
import { meterTexts, t } from '../lib/i18n'
import Icon from './Icon.vue'
import PasswordField from './PasswordField.vue'

const password = ref('')
const percent = ref(0)
const sent = ref(false)
const texts = meterTexts()

const onScore = (value: number): void => {
  percent.value = value
}
</script>

<template>
  <form class="events" novalidate @submit.prevent="sent = true">
    <PasswordField id="vue-events" v-model="password" described-by="vue-events-strength">
      <PasswordStrengthMeter id="vue-events-strength" :password="password" v-bind="texts" @score="onScore" />
    </PasswordField>
    <div class="events__bar">
      <p class="events__score">
        <span>{{ t('events.score') }}</span>
        {{ ' ' }}
        <output for="vue-events">{{ percent }}%</output>
      </p>
      <button type="submit" class="btn btn--primary" :disabled="percent <= 75">
        <span>{{ t('events.send') }}</span>
        <Icon name="arrowRight" :size="18" />
      </button>
    </div>
    <p class="hint">{{ t('events.hint') }}</p>
    <p class="events__status" role="status">{{ sent ? t('events.sent') : '' }}</p>
  </form>
</template>
