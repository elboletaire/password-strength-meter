import { describe, expect, it } from 'vitest'
import { createMeter, defaults, evaluate, resolveOptions } from '../src'

describe('resolveOptions', () => {
  it('returns the defaults when no options are given', () => {
    expect(resolveOptions()).toEqual(defaults)
  })

  it('replaces nested objects instead of merging them', () => {
    expect(resolveOptions({ steps: { 50: 'half' } }).steps).toEqual({ 50: 'half' })
  })

  it('ignores undefined values', () => {
    expect(resolveOptions({ minimumLength: undefined }).minimumLength).toBe(4)
  })
})

describe('evaluate', () => {
  it('shows enterPass for an empty password', () => {
    expect(evaluate('', defaults)).toMatchObject({ score: -1, percent: 0, text: defaults.enterPass })
  })

  it('keeps the percent at 0 for negative scores', () => {
    expect(evaluate('abc', defaults)).toMatchObject({ score: -1, percent: 0, text: defaults.shortPass })
    expect(evaluate('test', defaults, 'test')).toMatchObject({ score: -2, percent: 0, text: defaults.containsField })
  })

  it('returns score, percent, text and style', () => {
    expect(evaluate('Tester23$', defaults)).toEqual({
      score: 91,
      percent: 91,
      text: 'Medium; try using special characters',
      // legacy-compat: color values are not rounded (browsers normalize them when applied)
      style: { backgroundImage: 'none', backgroundColor: 'rgb(43.19999999999999, 240, 10)', width: '91%' },
    })
  })
})

describe('createMeter', () => {
  it('starts with the enterPass text', () => {
    const meter = createMeter({ enterPass: 'hi' })
    expect(meter.state).toMatchObject({ score: 0, percent: 0, text: 'hi' })
    expect(meter.options.enterPass).toBe('hi')
  })

  it('reports text changes only when the text differs from the last update', () => {
    const meter = createMeter()
    expect(meter.update('').textChanged).toBe(false)
    expect(meter.update('ab').textChanged).toBe(true)
    expect(meter.update('abc').textChanged).toBe(false)
    expect(meter.update('Tester23$').textChanged).toBe(true)
    expect(meter.update('Tester23$').textChanged).toBe(false)
    expect(meter.state.score).toBe(91)
  })
})
