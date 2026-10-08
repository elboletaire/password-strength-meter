import '../../src/lib/site'
import '@passcore/vue/styles.css'
import { createApp, type Component } from 'vue'
import { slot } from '../../src/lib/slot'
import { initStudio } from '../../src/lib/studio'
import ChecklistDemo from '../../src/vue/ChecklistDemo.vue'
import DefaultDemo from '../../src/vue/DefaultDemo.vue'
import EventsDemo from '../../src/vue/EventsDemo.vue'
import GroupDemo from '../../src/vue/GroupDemo.vue'
import I18nDemo from '../../src/vue/I18nDemo.vue'
import LinkedDemo from '../../src/vue/LinkedDemo.vue'
import PercentDemo from '../../src/vue/PercentDemo.vue'
import ThemeDemo from '../../src/vue/ThemeDemo.vue'
import TranslationsDemo from '../../src/vue/TranslationsDemo.vue'

function mount(name: string, component: Component): void {
  createApp(component).mount(slot(name))
}

mount('default', DefaultDemo)
mount('checklist', ChecklistDemo)
mount('percent', PercentDemo)
mount('linked', LinkedDemo)
mount('translations', TranslationsDemo)
mount('i18next', I18nDemo)
mount('events', EventsDemo)
mount('group', GroupDemo)
mount('theme', ThemeDemo)

initStudio()
