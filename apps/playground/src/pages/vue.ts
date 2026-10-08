import '../lib/site'
import '@passcore/vue/styles.css'
import { createApp, type Component } from 'vue'
import { slot } from '../lib/slot'
import { initStudio } from '../lib/studio'
import ChecklistDemo from '../vue/ChecklistDemo.vue'
import DefaultDemo from '../vue/DefaultDemo.vue'
import EventsDemo from '../vue/EventsDemo.vue'
import GroupDemo from '../vue/GroupDemo.vue'
import I18nDemo from '../vue/I18nDemo.vue'
import LinkedDemo from '../vue/LinkedDemo.vue'
import PercentDemo from '../vue/PercentDemo.vue'
import ThemeDemo from '../vue/ThemeDemo.vue'
import TranslationsDemo from '../vue/TranslationsDemo.vue'

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
