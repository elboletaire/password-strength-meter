export const REPO = 'https://github.com/elboletaire/password-strength-meter'

/** Where the site is published: a custom domain overrides it (`PLAYGROUND_SITE_ORIGIN`) at build time. */
export const SITE_ORIGIN = (process.env.PLAYGROUND_SITE_ORIGIN || 'https://elboletaire.github.io').replace(/\/+$/, '')

/** An absolute URL: the origin of the site plus a path that already carries the base (`/password-strength-meter/…`). */
export const absolute = (path: string): string => `${SITE_ORIGIN}${path}`
