<script lang="ts">
  import { untrack } from 'svelte'
  import { passwordStrength, type PasswordStrengthMeterProps } from './strength.svelte.js'

  const props: PasswordStrengthMeterProps = $props()

  const strength = passwordStrength(() => props.password, () => props)

  const showPercent = $derived(props.showPercent ?? false)
  const showText = $derived(props.showText ?? true)
  const label = $derived(props.label ?? 'Password strength')
  const wrapperClass = $derived([
    'pass-wrapper',
    `pass-level-${strength.result.level}`,
    strength.result.valid ? '' : 'pass-invalid',
    props.class,
  ].filter(Boolean).join(' '))

  // callbacks fire on changes after mount only (the first run just records the result), and
  // only when the evaluated result changes by value: re-renders with the same password don't fire
  let previous: { result: string, message: string } | undefined
  $effect(() => {
    const result = strength.result
    const json = JSON.stringify(result)
    const message = JSON.stringify(result.message)
    const before = previous
    previous = { result: json, message }
    if (before !== undefined && json !== before.result) {
      untrack(() => {
        props.onscore?.(result.percent, result)
        if (message !== before.message) {
          props.ontext?.(strength.text, result)
        }
      })
    }
  })
</script>

<div class={wrapperClass}>
  <div
    class="pass-meter"
    role="meter"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={strength.result.percent}
    aria-valuetext={strength.levelText}
  >
    <div class="pass-bar" style:width="{strength.result.percent}%"></div>
  </div>
  {#if showPercent}
    <span class="pass-percent">{strength.result.percent}%</span>
  {/if}
  {#if showText}
    <span class="pass-text" id={props.id} aria-live="polite">{strength.text}</span>
  {/if}
</div>
