import type { ColorBarRGB, MeterOptions } from './options'

export interface RGB {
  red: number
  green: number
  blue: number
}

/**
 * Inline styles for the color bar, with camelCased property names so they
 * can be passed to `element.style`, jQuery's `.css()` or framework style bindings.
 */
export interface BarStyle {
  width: string
  backgroundImage?: string
  backgroundColor?: string
  backgroundPosition?: string
}

const has = (object: object, key: string): boolean => Object.prototype.hasOwnProperty.call(object, key)

/**
 * Calculates the bar color for a strength percentage, going from red to green.
 */
export function colorFromPercentage(perc: number, customColorBarRGB: ColorBarRGB): RGB {
  let minRed = 0
  let maxRed = 240
  let minGreen = 0
  let maxGreen = 240
  let blue = 10

  if (has(customColorBarRGB, 'red')) {
    [minRed, maxRed] = customColorBarRGB.red as [number, number]
  }

  if (has(customColorBarRGB, 'green')) {
    [minGreen, maxGreen] = customColorBarRGB.green as [number, number]
  }

  if (has(customColorBarRGB, 'blue')) {
    blue = customColorBarRGB.blue as number
  }

  const green = (perc * maxGreen / 50)
  const red = (2 * maxRed) - (perc * maxRed / 50)

  return {
    red: Math.min(Math.max(red, minRed), maxRed),
    green: Math.min(Math.max(green, minGreen), maxGreen),
    blue,
  }
}

/**
 * Returns the color bar styles for a strength percentage.
 */
export function barStyle(
  perc: number,
  options: Pick<MeterOptions, 'useColorBarImage' | 'customColorBarRGB'>,
): BarStyle {
  if (options.useColorBarImage) {
    return {
      backgroundPosition: '0px -' + perc + 'px',
      width: perc + '%',
    }
  }

  const colors = colorFromPercentage(perc, options.customColorBarRGB)

  return {
    backgroundImage: 'none',
    backgroundColor: 'rgb(' + colors.red + ', ' + colors.green + ', ' + colors.blue + ')',
    width: perc + '%',
  }
}
