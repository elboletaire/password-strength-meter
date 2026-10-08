<script lang="ts">
  import { tick } from 'svelte'
  import { keepFocus, revealLabel } from '../lib/reveal'
  import Icon from './Icon.svelte'

  /** A password input with the playground's show/hide button inside it (see src/lib/reveal.ts). */
  let { id, value = $bindable(''), describedBy }: { id: string, value?: string, describedBy?: string } = $props()

  let shown = $state(false)
  let input: HTMLInputElement | undefined = $state()
  const label = $derived(revealLabel(shown))

  async function toggle(): Promise<void> {
    const selection = input && input.selectionStart !== null && input.selectionEnd !== null
      ? [input.selectionStart, input.selectionEnd] as const
      : null
    shown = !shown
    // changing the type can move the caret: put it back where it was
    await tick()
    if (input && selection && document.activeElement === input) {
      input.setSelectionRange(selection[0], selection[1])
    }
  }
</script>

<div class="pw">
  <input
    bind:this={input}
    bind:value
    class="input pw__input"
    {id}
    type={shown ? 'text' : 'password'}
    autocomplete="new-password"
    autocapitalize="off"
    spellcheck="false"
    aria-describedby={describedBy}
  />
  <button
    type="button"
    class="reveal"
    aria-controls={id}
    aria-pressed={shown}
    aria-label={label}
    onmousedown={keepFocus}
    onclick={toggle}
  >
    <Icon name="eye" className="icon reveal__show" />
    <Icon name="eyeOff" className="icon reveal__hide" />
  </button>
</div>
