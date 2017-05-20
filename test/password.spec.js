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

// Define inputs
const input = () => $('<div>').append(
  $('<input>', { type: 'password', id: 'password' })
)
const username = () => $('<input>', { type: 'text', id: 'username' })

require('../src/password.js')

describe('$.fn.password', () => {
  beforeEach(() => {
    $('body').children().remove()
    $('body').append(input())
  })

  describe('init()', () => {
    it('creates the required layers next to the input', (done) => {
      $('input').password()
      assert.isOk($('.pass-wrapper').length)
      assert.isOk($('.pass-colorbar').length)
      assert.isOk($('.pass-graybar').length)
      assert.isOk($('input + div.pass-wrapper').length)
      assert.isOk($('.pass-text').length)

      done()
    })

    it('does not attach the text span when showText is set to false', (done) => {
      $('input').password({ showText: false })
      assert.isNotOk($('.pass-text').length)

      done()
    })

    it('does not show the wrapper by default', (done) => {
      $('input').password()
      assert.isOk($('.pass-wrapper:hidden').length)
      assert.isNotOk($('.pass-strength-visible').length)

      done()
    })

    it('shows the wrapper if animate is set to false', (done) => {
      $('input').password({ animate: false })
      assert.isOk($('.pass-strength-visible').length)

      done()
    })

    it('shows the wrapper on focus', (done) => {
      $('input').password({ animate: true, animateSpeed: 0 })
      assert.isNotOk($('.pass-strength-visible').length)

      $('input').trigger('focus')
      assert.isOk($('.pass-strength-visible').length)

      done()
    })

    it('hides the wrapper again on blur after the value has been removed from input', (done) => {
      $('input').password({ animate: true, animateSpeed: 0 })
      assert.isNotOk($('.pass-strength-visible').length)

      $('input').val('124123123').trigger('keyup').trigger('focus')
      assert.isOk($('.pass-strength-visible').length)

      $('input').val('').trigger('keyup').trigger('focus')
      assert.isNotOk($('.pass-strength-visible').length)

      done()
    })

    it('hides the wrapper on blur, if there\'s no text in it', (done) => {
      $('input').password({ animate: true, animateSpeed: 0 })
      assert.isNotOk($('.pass-strength-visible').length)
      $('input').trigger('focus')
      assert.isOk($('.pass-strength-visible').length)
      $('input').trigger('blur')
      assert.isNotOk($('.pass-strength-visible').length)

      done()
    })

    it('shows the percentage when enabled', (done) => {
      $('input').password({ showPercent: true })
      assert.isOk($('.pass-percent').length)
      done()
    })

    it('percentage is updated when value is set', (done) => {
      $('input').password({ showPercent: true });

      assert.isOk($('.pass-percent').length)

      const percentage = $('.pass-percent').text()

      $('input').val('testing').trigger('keyup')

      assert.notEqual($('.pass-percent').text(), percentage)

      done()
    })

    it('shows enterPass value when there\'s no text', (done) => {
      $('input').password({ animate: false, enterPass: 'hi' })
      assert.equal('hi', $('.pass-text').text())
      done()
    })
  })

  describe('score/meter functions', () => {
    it('gives us the shortPass message when passing less than what\'s defined in minimumLength', (done) => {
      $('#password').password({ shortPass: 'hi', minimumLength: 6 })
        .val('12312').trigger('keyup')

      assert.equal('hi', $('.pass-text').text())
      done()
    })

    it('gives us containsUsername value when username field is defined and input values are equal', (done) => {
      $('body').append(username())
      $('#username').val('test')

      $('#password').password({
          username: '#username',
          containsUsername: 'hi',
          usernamePartialMatch: false
        })
        .val('test').trigger('keyup')

      assert.equal('hi', $('.pass-text').text())

      // also ensure that usernamePartialMatch set to
      // false does what it should to
      $('#username').val('tester')
      $('#password').trigger('keyup')

      assert.notEqual('hi', $('.pass-text').text())
      done()
    })

    it('usernamePartialMatch works as expected', (done) => {
      $('body').append(username())
      $('#username').val('test')

      $('#password').password({
          username: '#username',
          containsUsername: 'hi',
          usernamePartialMatch: true
        })
        .val('tester').trigger('keyup')

      assert.equal('hi', $('.pass-text').text())

      done()
    })

    it('gives us badPass value when score is under 34', (done) => {
      $('#password').password({ badPass: 'hi' }).val('tester').trigger('keyup')

      assert.equal('hi', $('.pass-text').text())
      done()
    })

    it('gives us badPass value when score is under 34', (done) => {
      $('#password').password({ badPass: 'hi' }).val('tester').trigger('keyup')

      assert.equal('hi', $('.pass-text').text())
      done()
    })

    it('gives us goodPass value when score is under 68', (done) => {
      $('#password').password({ goodPass: 'hi' }).val('tester23').trigger('keyup')

      assert.equal('hi', $('.pass-text').text())
      done()
    })

    it('gives us strongPass value when score is under over 68', (done) => {
      $('#password').password({ strongPass: 'hi' }).val('!Tester23$').trigger('keyup')

      assert.equal('hi', $('.pass-text').text())
      done()
    })

    it('gives us badPass value when there\'s a lot of characters but repeated', (done) => {
      $('#password').password({ badPass: 'hi' })
        .val('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadddddddddddddddddd')
        .trigger('keyup')

      assert.equal('hi', $('.pass-text').text())
      done()
    })

    it('ensures score is corrected when it surpasses the threshold', (done) => {
      $('#password').password({ badPass: 'hi' })
        .on('password.text', (e, text, score) => {

          assert.isBelow(score, 101)

          done()
        })
        .val('_~%8::%nqy^7e~!!z!;N')
        .trigger('keyup')
    })
  })
})
