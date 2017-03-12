const chai = require('chai'),
      sinon = require('sinon'),
      sinonChai = require('sinon-chai'),
      jsdom = require('jsdom'),
      assert = chai.assert

chai.should()
chai.use(sinonChai)

const window = jsdom.jsdom().defaultView,
      document = window.document

// Initialize jQuery
const $ = global.jQuery = require('jquery')(window)

// Append password input to DOM
let input = () => $('<div>').append(
  $('<input>', { type: 'password', id: 'password' })
)
$('body').append(input())

require('../password.js')

describe('$.fn.password', () => {
  beforeEach(() => {
    $('body').children().remove()
    $('body').append(input())
  })

  it('creates the required layers next to the input', (done) => {
    $('input').password().ready(() => {
      assert.isOk($('.pass-wrapper').length)
      assert.isOk($('.pass-colorbar').length)
      assert.isOk($('.pass-graybar').length)
      assert.isOk($('input + div.pass-wrapper').length)
      done()
    })
  })

  it('does not show the wrapper by default', (done) => {
    $('input').password().ready(() => {
      assert.isOk($('.pass-wrapper:hidden').length)
      assert.isNotOk($('.pass-strength-visible').length)
      done()
    })
  })

  it('shows the wrapper if animate is set to false', (done) => {
    $('input').password({ animate: false }).ready(() => {
      assert.isOk($('.pass-strength-visible').length, 'ble')
      assert.isOk($('.pass-wrapper:visible').length, 'blu')
      done()
    })
  })

  it('shows the wrapper on focus', (done) => {
    $('input').password({ animate: true }).ready(() => {
      assert.isOk($('.pass-wrapper:hidden').length)
      $('input').focus().ready(() => {
        assert.isOk($('.pass-wrapper:visible').length)
        done()
      })
    })
  })

  it('hides the wrapper on blur, if there\'s no text in it', (done) => {
    $('input').password({ animate: true }).ready(() => {
      assert.isOk($('.pass-wrapper:hidden').length)
      $('input').focus().ready(() => {
        assert.isOk($('.pass-wrapper:visible').length)
        $('input').blur().ready(() => {
          console.log('passa per aquí')
          assert.isOk($('.pass-wrapper:hidden').length)
          done()
        })
      })
    })
  })

  it('shows the percentage when enabled', (done) => {
    $('input').password({ showPercent: false }).ready(() => {
      assert($('.pass-percent').length > 0)
      console.log('eiiii')
      done()
    })
  })

  it('shows "type your password" when there\'s no text', (done) => {
    $('input').password({ animate: false, enterPass: 'hi' })
    setTimeout(() => {
      assert.equal('hi', $('.pass-test').text())
      done()
    }, 20)
  })
})
