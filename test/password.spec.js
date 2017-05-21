// Initialize jQuery
const $ = global.jQuery = require('jquery')

require('../src/password.js')

describe('$.fn.password', () => {
  beforeEach(() => {
    $.fx.off = true
    jasmine.getFixtures().fixturesPath = './base/test/'
    loadFixtures('fixture.html')
  })

  describe('init()', () => {
    it('creates the required layers next to the input', (done) => {
      $('#password').password()
      expect($('.pass-wrapper')).toBeInDOM()
      expect($('.pass-colorbar')).toBeInDOM()
      expect($('.pass-graybar')).toBeInDOM()
      expect($('input + div.pass-wrapper')).toBeInDOM()
      expect($('.pass-text')).toBeInDOM()

      done()
    })

    it('does not attach the text span when showText is set to false', (done) => {
      $('input').password({ showText: false })
      expect($('.pass-text')).not.toBeInDOM()

      done()
    })

    it('does not show the wrapper by default', (done) => {
      $('#password').password()
      expect($('.pass-wrapper:hidden')).toBeInDOM()
      expect($('.pass-strength-visible')).not.toBeInDOM()

      done()
    })

    it('shows the wrapper if animate is set to false', (done) => {
      $('#password').password({ animate: false })
      expect($('.pass-strength-visible')).toBeInDOM()

      done()
    })

    it('shows the wrapper on focus', (done) => {
      $('#password').password({ animate: true })
      expect($('.pass-wrapper')).not.toBeVisible()

      $('input').triggerHandler('focus')
      expect($('.pass-wrapper')).toBeVisible()

      done()
    })

    it('hides the wrapper again on blur after the value has been removed from input', (done) => {
      $('#password').password({ animate: true })
      expect($('.pass-wrapper')).not.toBeVisible()

      $('#password').val('124123123').trigger('keyup').triggerHandler('focus')
      expect($('.pass-wrapper')).toBeVisible()

      $('#password').val('').trigger('keyup').triggerHandler('blur')
      expect($('.pass-wrapper')).not.toBeVisible()

      done()
    })

    it('shows the percentage when enabled', (done) => {
      $('#password').password({ showPercent: true })
      expect($('.pass-percent')).toBeInDOM()

      done()
    })

    it('percentage is updated when value is set', (done) => {
      $('#password').password({ showPercent: true });

      expect($('.pass-percent')).toBeInDOM()

      const percentage = $('.pass-percent').text()

      $('input').val('testing').trigger('keyup')

      expect($('.pass-percent').text()).not.toEqual(percentage)

      done()
    })

    it('shows enterPass value when there\'s no text', (done) => {
      $('#password').password({ animate: false, enterPass: 'hi' })
      expect('hi').toEqual($('.pass-text').text())

      done()
    })
  })

  describe('score/meter functions', () => {
    it('gives us the shortPass message when passing less than what\'s defined in minimumLength', (done) => {
      $('#password').password({ shortPass: 'hi', minimumLength: 6 }).val('12312').trigger('keyup')

      expect('hi').toEqual($('.pass-text').text())
      done()
    })

    it('gives us containsUsername value when username field is defined and input values are equal', (done) => {
      $('#username').val('test')
      $('#password').password({
          username: '#username',
          containsUsername: 'hi',
          usernamePartialMatch: false
        })
        .val('test').trigger('keyup')

      expect('hi').toEqual($('.pass-text').text())

      // also ensure that usernamePartialMatch set to
      // false does what it should to
      $('#username').val('tester')
      $('#password').trigger('keyup')

      expect('hi').not.toEqual($('.pass-text').text())

      done()
    })

    it('usernamePartialMatch works as expected', (done) => {
      $('#username').val('test')
      $('#password').password({
          username: '#username',
          containsUsername: 'hi',
          usernamePartialMatch: true
        })
        .val('tester').trigger('keyup')

      expect('hi').toEqual($('.pass-text').text())

      done()
    })

    it('gives us badPass value when score is under 34', (done) => {
      $('#password').password({ badPass: 'hi' }).val('tester').trigger('keyup')
      expect('hi').toEqual($('.pass-text').text())

      done()
    })

    it('gives us badPass value when score is under 34', (done) => {
      $('#password').password({ badPass: 'hi' }).val('tester').trigger('keyup')
      expect('hi').toEqual($('.pass-text').text())

      done()
    })

    it('gives us goodPass value when score is under 68', (done) => {
      $('#password').password({ goodPass: 'hi' }).val('tester23').trigger('keyup')
      expect('hi').toEqual($('.pass-text').text())

      done()
    })

    it('gives us strongPass value when score is under over 68', (done) => {
      $('#password').password({ strongPass: 'hi' }).val('!Tester23$').trigger('keyup')
      expect('hi').toEqual($('.pass-text').text())

      done()
    })

    it('gives us badPass value when there\'s a lot of characters but repeated', (done) => {
      $('#password').password({ badPass: 'hi' })
        .val('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadddddddddddddddddd')
        .trigger('keyup')

      expect('hi').toEqual($('.pass-text').text())

      done()
    })

    it('ensures score is corrected when it surpasses the threshold', (done) => {
      $('#password').password({ badPass: 'hi' })
        .on('password.text', (e, text, score) => {

          expect(score).toBeLessThan(101)

          done()
        })
        .val('_~%8::%nqy^7e~!!z!;N')
        .trigger('keyup')
    })
  })
})
