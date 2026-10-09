import { dangerouslySkipEscape, escapeInject } from 'vike/server'
import type { OnRenderHtmlAsync } from 'vike/types'
import { notFoundPage } from '../../src/shell/not-found.ts'

/** Pre-rendered as `404.html`, which GitHub Pages serves for any missing path of the site. */
export const onRenderHtml: OnRenderHtmlAsync = async () => escapeInject`${dangerouslySkipEscape(notFoundPage())}`
