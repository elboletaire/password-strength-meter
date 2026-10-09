import '../../src/lib/site'
import '@passcore/svelte/styles.css'
import { mount, type Component } from 'svelte'
import { slot } from '../../src/lib/slot'
import { initStudio } from '../../src/lib/studio'
import ChecklistDemo from '../../src/svelte/ChecklistDemo.svelte'
import DefaultDemo from '../../src/svelte/DefaultDemo.svelte'
import EventsDemo from '../../src/svelte/EventsDemo.svelte'
import GroupDemo from '../../src/svelte/GroupDemo.svelte'
import I18nDemo from '../../src/svelte/I18nDemo.svelte'
import LinkedDemo from '../../src/svelte/LinkedDemo.svelte'
import PercentDemo from '../../src/svelte/PercentDemo.svelte'
import ThemeDemo from '../../src/svelte/ThemeDemo.svelte'
import TranslationsDemo from '../../src/svelte/TranslationsDemo.svelte'

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
