<script lang="ts">
  import { ICONS, type IconName } from '../common/icons'

  let { name, size = 20, className = 'icon' }: { name: IconName, size?: number, className?: string } = $props()
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  {#each ICONS[name] as d (d)}
    <path {d} />
  {/each}
</svg>
