// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createMeter, type MeterOptions } from '../src'
import golden from './fixtures/legacy-golden.json'

interface GoldenCase {
  password: string
  field?: string
  error?: string
  score?: number
  textEvents?: Array<[string, number]>
  text?: string
  percent?: string
  bar?: Record<string, string>
}

/** Renders text and styles through the DOM, as the legacy plugin did, so both sides are normalized alike. */
function render(text: string, style: object) {
  const div = document.createElement('div')
  div.innerHTML = text
  const bar = document.createElement('div')
  Object.assign(bar.style, style)
  return {
    html: div.innerHTML,
    bar: {
      width: bar.style.width,
      backgroundColor: bar.style.backgroundColor,
      backgroundImage: bar.style.backgroundImage,
      backgroundPosition: bar.style.backgroundPosition,
    },
  }
}

// each test replays hundreds or thousands of cases, too many for the default 5s on CI runners
describe('legacy golden fixture', { timeout: 60_000 }, () => {
  for (const scenario of golden.scenarios) {
    // `field` (a selector) belongs to the jQuery binding; core receives its value
    const { field, ...options } = scenario.options as Partial<MeterOptions> & { field?: string }

    it(`${scenario.name}: matches the legacy plugin for ${scenario.cases.length} cases`, () => {
      for (const c of scenario.cases as GoldenCase[]) {
        const meter = createMeter(options)
        const label = JSON.stringify({ password: c.password, field: c.field })

        if (c.error) {
          expect(() => meter.update(c.password, c.field), label).toThrow(globalThis[c.error as 'SyntaxError'])
          continue
        }

        const result = meter.update(c.password, c.field)
        const rendered = render(result.text, result.style)

        expect(result.score, label).toBe(c.score)
        expect(rendered.html, label).toBe(c.text)
        expect(result.percent + '%', label).toBe(c.percent)
        expect(rendered.bar, label).toEqual(c.bar)
        expect(result.textChanged ? [[result.text, result.score]] : [], label).toEqual(c.textEvents)
      }
    })
  }
})
