/**
 * The site's icons: stroked paths on a 24 by 24 grid, drawn for the playground.
 * Kept as path data so the plain pages and the React, Vue and Svelte demos draw the same shapes.
 */

const circle = (cx: number, cy: number, r: number): string => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

export const ICONS = {
  eye: [
    'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z',
    circle(12, 12, 3),
  ],
  eyeOff: [
    'M3 3l18 18',
    'M10.6 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2',
    'M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a10.6 10.6 0 0 0 5.4-1.6',
    'M9.9 9.9a3 3 0 0 0 4.2 4.2',
  ],
  lock: [
    'M6.5 10.5h11a2.5 2.5 0 0 1 2.5 2.5v5.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5V13a2.5 2.5 0 0 1 2.5-2.5Z',
    'M8 10.5V7.5a4 4 0 0 1 8 0v3',
  ],
  copy: [
    'M10.5 8h7A2.5 2.5 0 0 1 20 10.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 8 17.5v-7A2.5 2.5 0 0 1 10.5 8Z',
    'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2',
  ],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  cross: ['M7 7l10 10', 'M17 7L7 17'],
  sun: [
    circle(12, 12, 4),
    'M12 2.5v2M12 19.5v2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M2.5 12h2M19.5 12h2M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  ],
  moon: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z'],
  arrowRight: ['M5 12h14', 'M13 6l6 6-6 6'],
  external: ['M8 16L17 7', 'M9 7h8v8'],
  gauge: ['M3.5 17.5a9 9 0 1 1 17 0', 'M12 13.5l4.5-4.5', circle(12, 14, 1.2)],
  checklist: ['M4 6.5l1.5 1.5 3-3', 'M4 12.5l1.5 1.5 3-3', 'M4 18.5l1.5 1.5 3-3', 'M12 7h8', 'M12 13h8', 'M12 19h8'],
  person: [circle(12, 4.8, 1.8), 'M5 8.5l7 1.5 7-1.5', 'M12 10v4.5', 'M12 14.5L8.5 21', 'M12 14.5l3.5 6.5'],
  globe: [circle(12, 12, 9), 'M3 12h18', 'M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9', 'M12 3c-2.5 2.6-3.7 5.6-3.7 9s1.2 6.4 3.7 9'],
  sliders: ['M4 7h9', 'M19 7h1', 'M4 17h3', 'M11 17h9', circle(16, 7, 2.5), circle(9, 17, 2)],
  cube: ['M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z', 'M4 7.5l8 4.5 8-4.5', 'M12 12v9'],
} as const

export type IconName = keyof typeof ICONS

/** An inline, decorative SVG icon (hidden from assistive technologies). */
export function iconSvg(name: IconName, size = 20, className = 'icon'): string {
  const paths = ICONS[name].map((d) => `<path d="${d}"/>`).join('')
  return `<svg class="${className}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`
}

/** The logo: three masked characters over the five levels of the meter. */
export function logoSvg(size = 28): string {
  const colors = ['#e5484d', '#f2802c', '#e9b10a', '#7cb518', '#22a35a']
  const bars = colors.map((color, index) => `<rect x="${(5.5 + index * 4.4).toFixed(1)}" y="21" width="3.6" height="3.4" rx="1" fill="${color}"/>`).join('')
  return `<svg class="logo" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" focusable="false">`
    + '<rect width="32" height="32" rx="8" fill="var(--logo-bg, #14161a)"/>'
    + '<g fill="var(--logo-fg, #f4f3ee)"><circle cx="9.6" cy="12.5" r="2.6"/><circle cx="16" cy="12.5" r="2.6"/><circle cx="22.4" cy="12.5" r="2.6"/></g>'
    + `${bars}</svg>`
}

/** The favicon: the logo with fixed colours, as a data URL. */
export function faviconHref(): string {
  const svg = logoSvg(32).replace('var(--logo-bg, #14161a)', '#14161a').replace('var(--logo-fg, #f4f3ee)', '#f4f3ee').replace(' class="logo"', ' xmlns="http://www.w3.org/2000/svg"')
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
