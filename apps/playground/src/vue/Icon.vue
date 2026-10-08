<script setup lang="ts">
import { ICONS, type IconName } from '../common/icons'

withDefaults(defineProps<{ name: IconName, size?: number, className?: string }>(), { size: 20, className: 'icon' })
</script>

<template>
  <svg
    :class="className"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="d in ICONS[name]" :key="d" :d="d" />
  </svg>
</template>
