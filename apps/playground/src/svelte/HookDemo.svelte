<script lang="ts">
  import { passwordStrength } from '@passcore/svelte'
  import ca from '@passcore/svelte/locales/ca.json'
  import en from '@passcore/svelte/locales/en.json'
  import es from '@passcore/svelte/locales/es.json'
  import { CHECKLIST_RULES, describeRule, litSteps, ruleState, STEPS } from '../lib/checklist'
  import Icon from './Icon.svelte'
  import { lang } from './lang.svelte'
  import PasswordField from './PasswordField.svelte'

  const bundled = { en, es, ca }
  let password = $state('')

  const strength = passwordStrength(() => password, () => ({
    translations: bundled[lang.current],
    locale: lang.current,
    rules: CHECKLIST_RULES,
  }))
  const lit = $derived(litSteps(strength.result.level))
  // the rule descriptions are site texts: they follow the language too
  const rules = $derived(strength.result.rules.map((rule) => ({
    ...rule,
    description: lang.current ? describeRule(rule) : '',
    state: ruleState(rule.passed),
  })))
</script>

<div class="custom">
  <PasswordField id="svelte-hook" bind:value={password} describedBy="svelte-hook-text" />
  <div class="steps" data-level={strength.result.level} aria-hidden="true">
    {#each STEPS as step, index (step)}
      <span class={index < lit ? 'steps__step steps__step--on' : 'steps__step'}></span>
    {/each}
  </div>
  <p id="svelte-hook-text" class="custom__text" aria-live="polite">{strength.text}</p>
  <p id="svelte-hook-rules" class="checklist__title">{lang.t('checklist.title')}</p>
  <ul class="checklist" aria-labelledby="svelte-hook-rules">
    {#each rules as rule (rule.id)}
      <li class="checklist__item" data-passed={String(rule.passed)}>
        <Icon name={rule.passed ? 'check' : 'cross'} size={16} className="icon checklist__icon" />
        <span>{rule.description}</span>
        <span class="visually-hidden">, {rule.state}</span>
      </li>
    {/each}
  </ul>
</div>
