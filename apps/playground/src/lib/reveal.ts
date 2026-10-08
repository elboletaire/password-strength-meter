import { t } from './i18n'

/**
 * The show/hide button inside every password field. The markup is `src/shell/components.ts`
 * (`revealButton`) for the plain pages; the React, Vue and Svelte demos render the same markup from
 * their own components (`src/react/PasswordInput.tsx`, `src/vue/PasswordInput.vue`,
 * `src/svelte/PasswordInput.svelte`) and use `revealLabel` and `keepFocus` from here.
 */

/** The accessible name of the button: what pressing it does. */
export const revealLabel = (shown: boolean): string => t(shown ? 'reveal.hide' : 'reveal.show')

/**
 * Pressing the button with a pointer must not move the focus out of the field: the caret stays where it
 * was, and meters that hide on blur (or listen to it) don't react to a click on the eye.
 */
export function keepFocus(event: { preventDefault(): void }): void {
  event.preventDefault()
}

/** Switches the input between hidden and shown, keeping the caret and the selection when it has the focus. */
export function setRevealed(input: HTMLInputElement, shown: boolean): void {
  const focused = document.activeElement === input
  const { selectionStart, selectionEnd, selectionDirection } = input
  input.type = shown ? 'text' : 'password'
  if (focused && selectionStart !== null && selectionEnd !== null) {
    input.setSelectionRange(selectionStart, selectionEnd, selectionDirection ?? undefined)
  }
}

function update(button: HTMLButtonElement, shown: boolean): void {
  button.setAttribute('aria-pressed', String(shown))
  button.setAttribute('aria-label', revealLabel(shown))
}

/** Binds the `[data-reveal]` buttons rendered at build time: one delegated listener for the whole page. */
export function initReveal(): void {
  document.addEventListener('mousedown', (event) => {
    if ((event.target as Element | null)?.closest('[data-reveal]')) {
      keepFocus(event)
    }
  })

  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-reveal]')
    const input = button ? document.getElementById(button.getAttribute('aria-controls') ?? '') : null
    if (!button || !(input instanceof HTMLInputElement)) {
      return
    }
    const shown = input.type === 'password'
    setRevealed(input, shown)
    update(button, shown)
  })
}
