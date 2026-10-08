import type { Card } from './cards'

/**
 * The theming card, shared by the binding pages. `field` is the markup of the password field of the preview
 * (or an empty slot a framework mounts its field into); the sample meters and the colour pickers are the same everywhere.
 */
export function themeCard(field: string): Card {
  return {
    id: 'theme',
    title: 'Theming',
    text: `The colours, track and height are CSS custom properties: <code>--pass-color-very-weak</code> to
      <code>--pass-color-strong</code>, <code>--pass-track</code> and <code>--pass-height</code>. The controls set them on the
      preview below, and only there, so the other demos keep their look.`,
    demoClass: 'theme',
    demo: `<div class="theme__preview" id="theme-preview">
        ${field}
        <ul class="swatches" aria-label="One sample per level">
          <li class="pass-wrapper pass-level-very-weak">
            <span class="swatch__name">Very weak</span>
            <div class="pass-meter"><div class="pass-bar" style="width: 10%"></div></div>
          </li>
          <li class="pass-wrapper pass-level-weak">
            <span class="swatch__name">Weak</span>
            <div class="pass-meter"><div class="pass-bar" style="width: 30%"></div></div>
          </li>
          <li class="pass-wrapper pass-level-fair">
            <span class="swatch__name">Fair</span>
            <div class="pass-meter"><div class="pass-bar" style="width: 50%"></div></div>
          </li>
          <li class="pass-wrapper pass-level-good">
            <span class="swatch__name">Good</span>
            <div class="pass-meter"><div class="pass-bar" style="width: 70%"></div></div>
          </li>
          <li class="pass-wrapper pass-level-strong">
            <span class="swatch__name">Strong</span>
            <div class="pass-meter"><div class="pass-bar" style="width: 100%"></div></div>
          </li>
        </ul>
      </div>
      <fieldset class="theme__controls">
        <legend>Custom properties</legend>
        <div class="theme__grid">
          <label class="control">
            <span>Very weak</span>
            <input type="color" data-var="--pass-color-very-weak" value="#dc2626" />
          </label>
          <label class="control">
            <span>Weak</span>
            <input type="color" data-var="--pass-color-weak" value="#ea580c" />
          </label>
          <label class="control">
            <span>Fair</span>
            <input type="color" data-var="--pass-color-fair" value="#ca8a04" />
          </label>
          <label class="control">
            <span>Good</span>
            <input type="color" data-var="--pass-color-good" value="#65a30d" />
          </label>
          <label class="control">
            <span>Strong</span>
            <input type="color" data-var="--pass-color-strong" value="#16a34a" />
          </label>
          <label class="control">
            <span>Track</span>
            <input type="color" data-var="--pass-track" value="#e5e7eb" />
          </label>
        </div>
        <label class="control control--range">
          <span>Height</span>
          <input type="range" min="2" max="16" step="1" value="6" data-var="--pass-height" data-unit="px" />
          <output aria-live="off">6px</output>
        </label>
        <div class="actions">
          <button type="button" id="theme-reset" class="btn btn--ghost">Reset</button>
        </div>
      </fieldset>`,
    code: `.theme {
  --pass-height: 6px;
  --pass-track: #e5e7eb;
  --pass-color-weak: #c2410c;
  --pass-color-strong: #15803d;
}`,
  }
}

const HEX = /^#[0-9a-f]{6}$/i

/**
 * Binds the colour pickers and the slider of the theming card (rendered by `renderCards`).
 * They set the custom properties on the preview only; reset removes them again.
 */
export function initTheme(): void {
  const preview = document.getElementById('theme-preview')
  if (!preview) {
    throw new Error('Missing #theme-preview: render the theming card first')
  }

  const controls = Array.from(document.querySelectorAll<HTMLInputElement>('[data-var]'))
  const initialValues = new Map<HTMLInputElement, string>()

  // colours that come from the page (e.g. the dark theme's track) start the pickers
  const computed = getComputedStyle(preview)
  for (const control of controls) {
    const variable = control.dataset.var ?? ''
    const value = computed.getPropertyValue(variable).trim()
    if (control.type === 'color' && HEX.test(value)) {
      control.value = value
    }
    if (control.type === 'range' && Number.isFinite(parseFloat(value))) {
      control.value = String(parseFloat(value))
    }
    initialValues.set(control, control.value)
  }

  const withUnit = (control: HTMLInputElement): string => control.value + (control.dataset.unit ?? '')

  /** Shows the control's value next to a slider. */
  const showValue = (control: HTMLInputElement): void => {
    const output = control.closest('label')?.querySelector('output')
    if (output) {
      output.textContent = withUnit(control)
    }
  }

  for (const control of controls) {
    control.addEventListener('input', () => {
      preview.style.setProperty(control.dataset.var ?? '', withUnit(control))
      showValue(control)
    })
    preview.style.setProperty(control.dataset.var ?? '', withUnit(control))
    showValue(control)
  }

  // reset removes the inline properties, so the stylesheet's defaults apply again
  document.getElementById('theme-reset')?.addEventListener('click', () => {
    for (const control of controls) {
      control.value = initialValues.get(control) ?? control.defaultValue
      preview.style.removeProperty(control.dataset.var ?? '')
      showValue(control)
    }
  })
}
