import '../lib/site'
import '@passcore/svelte/styles.css'
import { mount, type Component } from 'svelte'
import { slot } from '../lib/slot'
import { initStudio } from '../lib/studio'
import ChecklistDemo from '../svelte/ChecklistDemo.svelte'
import DefaultDemo from '../svelte/DefaultDemo.svelte'
import EventsDemo from '../svelte/EventsDemo.svelte'
import GroupDemo from '../svelte/GroupDemo.svelte'
import I18nDemo from '../svelte/I18nDemo.svelte'
import LinkedDemo from '../svelte/LinkedDemo.svelte'
import PercentDemo from '../svelte/PercentDemo.svelte'
import ThemeDemo from '../svelte/ThemeDemo.svelte'
import TranslationsDemo from '../svelte/TranslationsDemo.svelte'

function start(component: Component<Record<string, never>>, name: string): void {
  mount(component, { target: slot(name) })
}

start(DefaultDemo, 'default')
start(ChecklistDemo, 'checklist')
start(PercentDemo, 'percent')
start(LinkedDemo, 'linked')
start(TranslationsDemo, 'translations')
start(I18nDemo, 'i18next')
start(EventsDemo, 'events')
start(GroupDemo, 'group')
start(ThemeDemo, 'theme')

initStudio()
