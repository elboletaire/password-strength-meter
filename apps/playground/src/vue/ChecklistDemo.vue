<script setup lang="ts">
import { PasswordStrengthMeter, usePasswordStrength } from '@passcore/vue'
import ca from '@passcore/vue/locales/ca.json'
import en from '@passcore/vue/locales/en.json'
import es from '@passcore/vue/locales/es.json'
import { computed, ref } from 'vue'
import { REQUIREMENT_RULES, requirementLabel, requirementState, requirementStateText, requirementsSummary } from '../lib/checklist'
import { meterTexts, t } from '../lib/i18n'
import { currentLang } from '../lib/lang'
import Icon from './Icon.vue'
import PasswordField from './PasswordField.vue'

const STATE_ICONS = { idle: 'dash', met: 'check', unmet: 'cross' } as const

const bundled = { en, es, ca }
const username = ref('')
const password = ref('')
const texts = meterTexts()
const lang = currentLang()

// the composable drives your own UI: a checklist of `result.rules`, next to the meter of the component
const { result } = usePasswordStrength(password, () => ({
  translations: bundled[lang],
  locale: lang,
  userInputs: [username.value],
  rules: REQUIREMENT_RULES,
}))
const typed = computed(() => password.value !== '')
const items = computed(() => result.value.rules.map((rule) => {
  const state = requirementState(typed.value, rule.passed)
  return { id: rule.id, state, label: requirementLabel(rule), stateText: requirementStateText(state) }
}))
// a live region: Vue only touches the text when it changes, so it is heard once per change
const summary = computed(() => requirementsSummary(result.value.rules, typed.value))
</script>

<template>
  <div class="field">
    <label class="field__label" for="vue-signup-username">{{ t('field.username') }}</label>
    <input
      id="vue-signup-username"
      v-model="username"
      class="input"
      type="text"
      autocomplete="username"
      autocapitalize="off"
      spellcheck="false"
      :placeholder="t('field.usernamePlaceholder')"
    >
  </div>
  <PasswordField id="vue-signup" v-model="password" described-by="vue-signup-strength vue-checklist-summary">
    <PasswordStrengthMeter id="vue-signup-strength" :password="password" :user-inputs="[username]" :rules="REQUIREMENT_RULES" v-bind="texts" />
  </PasswordField>
  <div class="reqs">
    <p id="vue-checklist-title" class="reqs__title">{{ t('requirements.title') }}</p>
    <ul class="reqs__list" aria-labelledby="vue-checklist-title">
      <li v-for="item in items" :key="item.id" class="req" :data-rule="item.id" :data-state="item.state">
        <span class="req__icon" aria-hidden="true">
          <Icon :name="STATE_ICONS[item.state]" :size="14" :class-name="`icon req__icon-${item.state}`" />
        </span>
        <span class="req__label">{{ item.label }}</span>
        <span v-if="item.state !== 'idle'" class="visually-hidden">, {{ item.stateText }}</span>
      </li>
    </ul>
    <p id="vue-checklist-summary" class="reqs__summary" aria-live="polite">{{ summary }}</p>
  </div>
</template>
