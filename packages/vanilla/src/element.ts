import { mergeDeep, type Rules } from '@passcore/core'
import { createPasswordMeter, type PasswordMeter, type VanillaOptions } from './meter'

// importing this module on a server (SSR) must not throw: there is no HTMLElement there
const Base = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as typeof HTMLElement

/**
 * `<password-meter for="password">`: renders the meter inside the element (light DOM).
 * Attributes cover the simple options; the `options` property takes the rest.
 */
export class PasswordMeterElement extends Base {
  static observedAttributes = [
    'for',
    'min-length',
    'max-length',
    'target-bits',
    'show-percent',
    'hide-text',
    'hide-until-focus',
    'locale',
    'label',
    'user-inputs',
  ]

  private meter?: PasswordMeter
  private userOptions: Omit<VanillaOptions, 'container'> = {}
  private waiting = false
  private retrying = false

  constructor() {
    super()
    // `options` set before this element was upgraded is an own property that shadows the accessor
    if (Object.prototype.hasOwnProperty.call(this, 'options')) {
      const early = (this as unknown as { options?: Omit<VanillaOptions, 'container'> }).options
      delete (this as unknown as { options?: unknown }).options
      this.userOptions = early ?? {}
    }
  }

  /** Options that aren't simple attributes (translations, translate, rules, levels...). Merged over the attributes. */
  get options(): Omit<VanillaOptions, 'container'> {
    return this.userOptions
  }

  set options(value: Omit<VanillaOptions, 'container'> | undefined) {
    this.userOptions = value ?? {}
    this.start()
  }

  connectedCallback(): void {
    this.start()
  }

  disconnectedCallback(): void {
    this.stop()
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.start()
    }
  }

  private start(retry = false): void {
    if (!this.isConnected) {
      return
    }
    const doc = this.ownerDocument
    if (doc.readyState === 'loading') {
      // one listener, however many attributes are set while the document loads
      if (!this.waiting) {
        this.waiting = true
        doc.addEventListener('DOMContentLoaded', () => {
          this.waiting = false
          this.start()
        }, { once: true })
      }
      return
    }
    this.stop()
    const input = this.findInput()
    if (!input) {
      // frameworks may render this element just before its input: look once more after the current task
      if (!retry) {
        if (!this.retrying) {
          this.retrying = true
          queueMicrotask(() => {
            this.retrying = false
            this.start(true)
          })
        }
      }
      else {
        console.error(`<password-meter>: no input found for for="${this.getAttribute('for') ?? ''}"`)
      }
      return
    }
    this.meter = createPasswordMeter(input, this.buildOptions())
  }

  private stop(): void {
    this.meter?.destroy()
    this.meter = undefined
  }

  private findInput(): HTMLInputElement | null {
    const id = this.getAttribute('for')
    if (!id) {
      return null
    }
    const root = this.getRootNode() as Document | ShadowRoot | Element
    return ('getElementById' in root ? root.getElementById(id) : null) as HTMLInputElement | null
  }

  private buildOptions(): VanillaOptions {
    const options: VanillaOptions = {
      showPercent: this.hasAttribute('show-percent'),
      showText: !this.hasAttribute('hide-text'),
      hideUntilFocus: this.hasAttribute('hide-until-focus'),
    }

    const rules: Partial<Rules> = {}
    const minLength = this.number('min-length')
    if (minLength !== undefined) {
      rules.minLength = minLength
    }
    const maxLength = this.number('max-length')
    if (maxLength !== undefined) {
      rules.maxLength = maxLength
    }
    if (Object.keys(rules).length) {
      options.rules = rules
    }

    const targetBits = this.number('target-bits')
    if (targetBits !== undefined) {
      options.targetBits = targetBits
    }
    const locale = this.getAttribute('locale')
    if (locale) {
      options.locale = locale
    }
    const label = this.getAttribute('label')
    if (label !== null) {
      options.label = label
    }
    const userInputs = this.getAttribute('user-inputs')
    if (userInputs !== null) {
      options.userInputs = userInputs.split(',').map((selector) => selector.trim()).filter(Boolean)
    }

    return mergeDeep<VanillaOptions>(options, this.userOptions, { container: this })
  }

  private number(name: string): number | undefined {
    const value = this.getAttribute(name)
    if (value === null || value.trim() === '') {
      return undefined
    }
    const number = Number(value)
    return Number.isFinite(number) ? number : undefined
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('password-meter')) {
  customElements.define('password-meter', PasswordMeterElement)
}
