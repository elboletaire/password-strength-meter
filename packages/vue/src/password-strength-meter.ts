import type { Estimator, Levels, Result, Rules, Translate, Translations } from '@passcore/core'
import { defineComponent, h, watch, type PropType } from 'vue'
import { usePasswordStrength, type PasswordStrengthOptions } from './use-password-strength'

export interface PasswordStrengthMeterProps extends PasswordStrengthOptions {
  /** The password to evaluate (controlled). */
  password: string
  /** id of the text element, for the input's aria-describedby. */
  id?: string
  /** Show the score percentage, default false. */
  showPercent?: boolean
  /** Show the message, default true. */
  showText?: boolean
  /** aria-label of the meter, default 'Password strength'. */
  label?: string
}

/**
 * A password strength meter. Emits `score(percent, result)` and `text(text, result)`
 * on changes after mount; `text` only when the message changes.
 */
export const PasswordStrengthMeter = defineComponent({
  name: 'PasswordStrengthMeter',
  props: {
    password: { type: String, required: true },
    id: String,
    userInputs: Array as PropType<readonly string[]>,
    targetBits: Number,
    estimator: Function as PropType<Estimator>,
    commonPasswords: Array as PropType<readonly string[]>,
    rules: Object as PropType<Partial<Rules>>,
    levels: Object as PropType<Partial<Levels>>,
    translations: Object as PropType<Translations>,
    locale: String,
    translate: Function as PropType<Translate>,
    showPercent: Boolean,
    showText: { type: Boolean, default: true },
    label: { type: String, default: 'Password strength' },
  },
  emits: {
    score: (percent: number, result: Result) => typeof percent === 'number' && typeof result === 'object',
    text: (text: string, result: Result) => typeof text === 'string' && typeof result === 'object',
  },
  setup(props, { emit }) {
    const { result, text, levelText } = usePasswordStrength(() => props.password, () => props)

    // by value: a new but equal result (e.g. the same options passed again) doesn't emit
    watch(() => JSON.stringify(result.value), () => emit('score', result.value.percent, result.value))

    // compare key and params, so that equal messages (e.g. another password with the same failing rule) don't emit
    const messageKey = () => JSON.stringify([result.value.message.key, result.value.message.params])
    watch(messageKey, () => emit('text', text.value, result.value))

    return () => {
      const current = result.value
      const meter = h('div', {
        'class': 'pass-meter',
        'role': 'meter',
        'aria-label': props.label,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': current.percent,
        'aria-valuetext': levelText.value,
      }, [h('div', { class: 'pass-bar', style: { width: `${current.percent}%` } })])

      const children = [meter]
      if (props.showPercent) {
        children.push(h('span', { class: 'pass-percent' }, `${current.percent}%`))
      }
      if (props.showText) {
        children.push(h('span', { 'class': 'pass-text', 'id': props.id, 'aria-live': 'polite' }, text.value))
      }

      return h('div', {
        class: ['pass-wrapper', `pass-level-${current.level}`, { 'pass-invalid': !current.valid }],
      }, children)
    }
  },
})
