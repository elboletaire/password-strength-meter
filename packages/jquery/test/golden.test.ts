// Replays the cases recorded from the legacy plugin through the new one, in the DOM
import $ from 'jquery'
import { beforeEach, describe, expect, it } from 'vitest'
import golden from '../../core/test/fixtures/legacy-golden.json'
import '../src'

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

beforeEach(() => {
  $.fx.off = true
})

function run(options: object, c: GoldenCase) {
  document.body.innerHTML = '<div><input type="password" id="password" /><input type="text" id="username" /></div>'
  if (c.field !== undefined) {
    $('#username').val(c.field)
  }

  const $input = $('#password').password({ ...golden.baseOptions, ...options })
  const events = { score: [] as number[], text: [] as Array<[string, number]> }
  $input.on('password.score', (e, score: number) => events.score.push(score))
  $input.on('password.text', (e, text: string, score: number) => events.text.push([text, score]))
  $input.val(c.password).trigger('keyup')

  const colorbar = document.querySelector<HTMLElement>('.pass-colorbar') as HTMLElement
  return {
    score: events.score[0],
    textEvents: events.text,
    text: $('.pass-text').html(),
    percent: $('.pass-percent').text(),
    bar: {
      width: colorbar.style.width,
      backgroundColor: colorbar.style.backgroundColor,
      backgroundImage: colorbar.style.backgroundImage,
      backgroundPosition: colorbar.style.backgroundPosition,
    },
  }
}

// each test replays hundreds or thousands of cases, too many for the default 5s on CI runners
describe('legacy golden fixture', { timeout: 60_000 }, () => {
  for (const scenario of golden.scenarios) {
    it(`${scenario.name}: matches the legacy plugin for ${scenario.cases.length} cases`, () => {
      for (const c of scenario.cases as GoldenCase[]) {
        const label = JSON.stringify({ password: c.password, field: c.field })
        if (c.error) {
          expect(() => run(scenario.options, c), label).toThrow(globalThis[c.error as 'SyntaxError'])
          continue
        }

        const { password, field, ...expected } = c
        expect(run(scenario.options, c), label).toEqual(expected)
      }
    })
  }
})
