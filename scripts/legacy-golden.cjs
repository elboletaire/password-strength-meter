#!/usr/bin/env node
/**
 * Records the behavior of the legacy jQuery plugin (src/password.js) into a
 * golden fixture, so the TypeScript rewrite can be checked against it.
 *
 * Requires `jsdom` and `jquery` to be resolvable (e.g. via NODE_PATH).
 *
 * Usage: node scripts/legacy-golden.cjs [output.json]
 */
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const root = path.resolve(__dirname, '..')
const output = process.argv[2] || path.join(root, 'packages/core/test/fixtures/legacy-golden.json')
const plugin = fs.readFileSync(path.join(root, 'src/password.js'), 'utf8')
const jquery = fs.readFileSync(require.resolve('jquery/dist/jquery.js'), 'utf8')

// Deterministic PRNG (mulberry32) so the corpus is stable across runs
function prng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const handPicked = [
  '', 'a', 'ab', 'abc', 'abcd', 'abcde', '1234', '12345', '123456', '1234567890',
  'aaaa', 'aaaaaaaa', 'aaaaaaaaaaaaaaaa', 'abab', 'abababab', 'abcabcabc', 'abcdabcdabcd',
  '1111', '11112222', 'test', 'tester', 'testing', 'tester23', 'Tester23', '!Tester23',
  '!Tester23$', '!Tester23$#', 'Tester23$', '124123123', 'password', 'Password', 'Password1',
  'P@ssw0rd', 'P@ssw0rd!', 'correct horse battery staple', 'CorrectHorseBatteryStaple',
  '_~%8::%nqy^7e~!!z!;N', '____', 'a_b_c_d', '__init__', 'abc_123', 'a,b,c,d', ',,,,', 'ab,,cd',
  'abc!!', 'abc!@', '!!!!', '!@#$%^&*?_~', '12!@', 'ab12!@', 'AbCd', 'ABCD', 'ABCDEFGH',
  'ñandú', 'contraseña', 'Contraseña1!', 'пароль', 'пароль123', '密码密码密码', '🔒🔒🔒🔒', 'pass🔒word1',
  '   ', 'pass word', ' a b c d ', '\tabc\t', 'test.test', 'a.b.c.d', '(test)', '[abc]', 'a+b+c',
  'user', 'username', 'myuser123', 'USER', 'xuserx', 'a(b', 'x)y', 'a.b',
  'x'.repeat(30), 'Ab1!'.repeat(10), '!'.repeat(50), 'aA1!bB2@cC3#dD4$eE5%',
]

const charsets = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  '!@#$%^&*?_~',
  ',.;:()[]{}<>-+=/\\|\'"` ',
  'abcABC123!@#',
  'aA1!',
]

const random = prng(20100311)
const generated = []
for (let i = 0; i < 220; i++) {
  const charset = charsets[Math.floor(random() * charsets.length)]
  const mix = random() < 0.5 ? charsets.join('') : charset
  const length = 1 + Math.floor(random() * 24)
  let str = ''
  for (let j = 0; j < length; j++) {
    str += mix.charAt(Math.floor(random() * mix.length))
  }
  generated.push(str)
}

const passwords = Array.from(new Set(handPicked.concat(generated)))

const scenarios = [
  { name: 'defaults', options: {} },
  { name: 'colorbar-image', options: { useColorBarImage: true } },
  { name: 'custom-rgb', options: { customColorBarRGB: { red: [10, 150], green: [0, 100], blue: 50 } } },
  { name: 'custom-rgb-partial', options: { customColorBarRGB: { green: [20, 200] } } },
  { name: 'minimum-length-8', options: { minimumLength: 8 } },
  { name: 'minimum-length-0', options: { minimumLength: 0 } },
  // keys sort as strings: '100' < '5' < '50'
  { name: 'unsorted-steps', options: { steps: { 5: 'five', 100: 'hundred', 50: 'fifty', 9: 'nine' } } },
  { name: 'custom-texts', options: { enterPass: 'enter', shortPass: 'short', containsField: 'contains' } },
  { name: 'html-texts', options: { enterPass: '<b>enter</b>', steps: { 13: 'a &amp; b', 50: '<i>ok</i>' } } },
  { name: 'field-partial', options: { field: '#username' }, fields: ['user', 'test', 'USER', 'a.b', 'pass', ''] },
  { name: 'field-exact', options: { field: '#username', fieldPartialMatch: false }, fields: ['user', 'test', 'password', ''] },
  // unescaped regexp: invalid patterns throw
  { name: 'field-regexp', options: { field: '#username' }, fields: ['a(b', 'x)y', '[abc', 'a+'] },
]

const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' })
const { window } = dom
window.eval(jquery)
window.eval(plugin)
const $ = window.jQuery
$.fx.off = true

function run(options, password, fieldValue) {
  // .empty() also drops jQuery data and handlers bound to the previous elements
  $('body').empty().html('<div><input type="password" id="password" /><input type="text" id="username" /></div>')

  if (fieldValue !== undefined) {
    $('#username').val(fieldValue)
  }

  const $input = $('#password').password(Object.assign({ animate: false, showPercent: true }, options))
  const events = { score: [], text: [] }
  $input.on('password.score', (e, score) => events.score.push(score))
  $input.on('password.text', (e, text, score) => events.text.push([text, score]))

  const result = { password }
  if (fieldValue !== undefined) {
    result.field = fieldValue
  }

  try {
    $input.val(password).trigger('keyup')
  }
  catch (e) {
    result.error = e.constructor.name
    return result
  }

  const colorbar = window.document.querySelector('.pass-colorbar')
  Object.assign(result, {
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
  })
  return result
}

const fixture = {
  description: 'Behavior of the legacy jQuery plugin (src/password.js @ 2.1.0). Generated by scripts/legacy-golden.cjs; do not edit.',
  baseOptions: { animate: false, showPercent: true },
  scenarios: scenarios.map((scenario) => {
    const fields = scenario.fields || [undefined]
    const cases = []
    for (const field of fields) {
      for (const password of passwords) {
        cases.push(run(scenario.options, password, field))
      }
    }
    return { name: scenario.name, options: scenario.options, cases }
  }),
}

fs.mkdirSync(path.dirname(output), { recursive: true })
// One case per line keeps the file small and its diffs readable
const json = [
  '{',
  ' "description": ' + JSON.stringify(fixture.description) + ',',
  ' "baseOptions": ' + JSON.stringify(fixture.baseOptions) + ',',
  ' "scenarios": [',
  fixture.scenarios.map((s) => [
    '  {',
    '   "name": ' + JSON.stringify(s.name) + ',',
    '   "options": ' + JSON.stringify(s.options) + ',',
    '   "cases": [',
    s.cases.map((c) => '    ' + JSON.stringify(c)).join(',\n'),
    '   ]',
    '  }',
  ].join('\n')).join(',\n'),
  ' ]',
  '}',
].join('\n')
fs.writeFileSync(output, json + '\n')

const total = fixture.scenarios.reduce((n, s) => n + s.cases.length, 0)
console.log('%d passwords, %d scenarios, %d cases -> %s', passwords.length, scenarios.length, total, path.relative(root, output))
