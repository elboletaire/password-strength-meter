<script setup lang="ts">
import { usePasswordStrength } from '@passcore/vue'
import ca from '@passcore/vue/locales/ca.json'
import en from '@passcore/vue/locales/en.json'
import es from '@passcore/vue/locales/es.json'
import { computed, ref } from 'vue'
import { CHECKLIST_RULES, describeRule, litSteps, ruleState, STEPS } from '../lib/checklist'
import Icon from './Icon.vue'
import PasswordField from './PasswordField.vue'
import { useT } from './use-lang'

const bundled = { en, es, ca }
const password = ref('')
const { lang, t } = useT()

// the composable returns refs: destructured, they are unwrapped in the template
const { result, text } = usePasswordStrength(password, () => ({
  translations: bundled[lang.value],
  locale: lang.value,
  rules: CHECKLIST_RULES,
}))
const lit = computed(() => litSteps(result.value.level))
// the rule descriptions are site texts: they follow the language too
const rules = computed(() => result.value.rules.map((rule) => ({
  ...rule,
  description: lang.value ? describeRule(rule) : '',
  state: ruleState(rule.passed),
})))
</script>

<template>
  <div class="custom">
    <PasswordField id="vue-hook" v-model="password" described-by="vue-hook-text" />
    <div class="steps" :data-level="result.level" aria-hidden="true">
      <span v-for="(step, index) in STEPS" :key="step" :class="index < lit ? 'steps__step steps__step--on' : 'steps__step'" />
    </div>
    <p id="vue-hook-text" class="custom__text" aria-live="polite">{{ text }}</p>
    <p id="vue-hook-rules" class="checklist__title">{{ t('checklist.title') }}</p>
    <ul class="checklist" aria-labelledby="vue-hook-rules">
      <li v-for="rule in rules" :key="rule.id" class="checklist__item" :data-passed="String(rule.passed)">
        <Icon :name="rule.passed ? 'check' : 'cross'" :size="16" class-name="icon checklist__icon" />
        <span>{{ rule.description }}</span>
        <span class="visually-hidden">, {{ rule.state }}</span>
      </li>
    </ul>
  </div>
</template>
