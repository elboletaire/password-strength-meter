import { describe, expect, it } from 'vitest'
import { barStyle, colorFromPercentage, defaults } from '../src'

describe('colorFromPercentage', () => {
  it('goes from red to green with the default ranges', () => {
    expect(colorFromPercentage(0, defaults.customColorBarRGB)).toEqual({ red: 240, green: 0, blue: 10 })
    expect(colorFromPercentage(50, defaults.customColorBarRGB)).toEqual({ red: 240, green: 240, blue: 10 })
    expect(colorFromPercentage(100, defaults.customColorBarRGB)).toEqual({ red: 0, green: 240, blue: 10 })
  })

  it('clamps to custom ranges', () => {
    const rgb = { red: [10, 150] as [number, number], green: [0, 100] as [number, number], blue: 50 }
    expect(colorFromPercentage(100, rgb)).toEqual({ red: 10, green: 100, blue: 50 })
    expect(colorFromPercentage(0, rgb)).toEqual({ red: 150, green: 0, blue: 50 })
  })

  it('falls back to the default value of each missing color', () => {
    expect(colorFromPercentage(0, { green: [0, 100] })).toEqual({ red: 240, green: 0, blue: 10 })
  })
})

describe('barStyle', () => {
  it('uses a computed background color by default', () => {
    expect(barStyle(100, defaults)).toEqual({
      backgroundImage: 'none',
      backgroundColor: 'rgb(0, 240, 10)',
      width: '100%',
    })
  })

  it('offsets the background image when useColorBarImage is on', () => {
    expect(barStyle(91, { ...defaults, useColorBarImage: true })).toEqual({
      backgroundPosition: '0px -91px',
      width: '91%',
    })
  })
})
