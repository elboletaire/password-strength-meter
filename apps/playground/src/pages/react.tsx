import '../lib/site'
import '@passcore/react/styles.css'
import { StrictMode, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { initStudio } from '../lib/studio'
import {
  ChecklistDemo,
  DefaultDemo,
  EventsDemo,
  GroupDemo,
  I18nDemo,
  LinkedDemo,
  PercentDemo,
  ThemeDemo,
  TranslationsDemo,
} from '../react/demos'
import { slot } from '../lib/slot'

function mount(name: string, element: ReactElement): void {
  createRoot(slot(name)).render(<StrictMode>{element}</StrictMode>)
}

mount('default', <DefaultDemo />)
mount('checklist', <ChecklistDemo />)
mount('percent', <PercentDemo />)
mount('linked', <LinkedDemo />)
mount('translations', <TranslationsDemo />)
mount('i18next', <I18nDemo />)
mount('events', <EventsDemo />)
mount('group', <GroupDemo />)
mount('theme', <ThemeDemo />)

initStudio()
