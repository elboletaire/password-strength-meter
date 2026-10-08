<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { keepFocus, revealLabel } from '../lib/reveal'
import Icon from './Icon.vue'

/** A password input with the playground's show/hide button inside it (see src/lib/reveal.ts). */
defineProps<{ id: string, describedBy?: string }>()
const model = defineModel<string>({ required: true })

const shown = ref(false)
const input = ref<HTMLInputElement | null>(null)
const label = computed(() => revealLabel(shown.value))

async function toggle(): Promise<void> {
  const element = input.value
  const selection = element && element.selectionStart !== null && element.selectionEnd !== null
    ? [element.selectionStart, element.selectionEnd] as const
    : null
  shown.value = !shown.value
  // changing the type can move the caret: put it back where it was
  await nextTick()
  if (element && selection && document.activeElement === element) {
    element.setSelectionRange(selection[0], selection[1])
  }
}
</script>

<template>
  <div class="pw">
    <input
      :id="id"
      ref="input"
      v-model="model"
      class="input pw__input"
      :type="shown ? 'text' : 'password'"
      autocomplete="new-password"
      autocapitalize="off"
      spellcheck="false"
      :aria-describedby="describedBy"
    >
    <button
      type="button"
      class="reveal"
      :aria-controls="id"
      :aria-pressed="String(shown)"
      :aria-label="label"
      @mousedown="keepFocus"
      @click="toggle"
    >
      <Icon name="eye" class-name="icon reveal__show" />
      <Icon name="eyeOff" class-name="icon reveal__hide" />
    </button>
  </div>
</template>
