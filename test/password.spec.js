const $ = jQuery = require("jquery");

require('../src/password')

beforeEach(() => {
  jQuery.fx.off = true
  document.body.innerHTML = `<input type="password" id="password" />
<input type="text" id="username" />`
})

describe('$.fn.password', () => {
  describe('init()', () => {
    it('creates the required layers next to the input', () => {
      $('#password').password()
      expect($('.pass-wrapper').length).toBeTruthy()
      expect($('.pass-wrapper').length).toBeTruthy()
      expect($('.pass-colorbar').length).toBeTruthy()
      expect($('.pass-graybar').length).toBeTruthy()
      expect($('input + div.pass-wrapper').length).toBeTruthy()
      expect($('.pass-text').length).toBeTruthy()
    })
  })


  it('does not attach the text span when showText is set to false', () => {
    $('input').password({ showText: false })
    expect($('.pass-text').length).toBeFalsy()
  })

  it('does not show the wrapper by default', () => {
    $('#password').password()
    expect($('.pass-wrapper:hidden').length).toBeTruthy()
    expect($('.pass-strength-visible').length).toBeFalsy()
  })

  it('shows the wrapper if animate is set to false', () => {
    $('#password').password({ animate: false })
    expect($('.pass-strength-visible').length).toBeTruthy()
  })

  it('shows the wrapper on focus', () => {
    $('#password').password({ animate: true })
    expect($('.pass-wrapper').css('display')).toEqual('none')

    $('input').triggerHandler('focus')
    expect($('.pass-wrapper').css('display')).not.toEqual('none')
  })

  it('hides the wrapper again on blur after the value has been removed from input', () => {
    $('#password').password({ animate: true })
    expect($('.pass-wrapper').css('display')).toEqual('none')

    $('#password').val('124123123').trigger('keyup').triggerHandler('focus')
    expect($('.pass-wrapper').css('display')).not.toEqual('none')

    $('#password').val('').trigger('keyup').triggerHandler('blur')
    expect($('.pass-wrapper').css('display')).toEqual('none')
  })

  it('shows the percentage when enabled', () => {
    $('#password').password({ showPercent: true })
    expect($('.pass-percent').length).toBeTruthy()
  })

  it('percentage is updated when value is set', () => {
    $('#password').password({ showPercent: true });

    expect($('.pass-percent').length).toBeTruthy()

    var percentage = $('.pass-percent').text()

    $('input').val('testing').trigger('keyup')

    expect($('.pass-percent').text()).not.toEqual(percentage)
  })

  it('shows enterPass value when there\'s no text', () => {
    $('#password').password({ animate: false, enterPass: 'hi' })
    expect($('.pass-text').text()).toEqual('hi')
  })
})



describe('score/meter functions', () => {
  it('gives us the shortPass message when passing less than what\'s defined in minimumLength', () => {
    $('#password').password({ shortPass: 'hi', minimumLength: 6 }).val('12312').trigger('keyup')

    expect($('.pass-text').text()).toEqual('hi')
  })

  it('gives us containsUsername value when username field is defined and input values are equal', () => {
    $('#username').val('test')
    $('#password').password({
        username: '#username',
        containsUsername: 'hi',
        usernamePartialMatch: false
      })
      .val('test').trigger('keyup')

    expect($('.pass-text').text()).toEqual('hi')

    // also ensure that usernamePartialMatch set to
    // false does what it should to
    $('#username').val('tester')
    $('#password').trigger('keyup')

    expect('hi').not.toEqual($('.pass-text').text())
  })

  it('usernamePartialMatch works as expected', () => {
    $('#username').val('test')
    $('#password').password({
        username: '#username',
        containsUsername: 'hi',
        usernamePartialMatch: true
      })
      .val('tester').trigger('keyup')

    expect($('.pass-text').text()).toEqual('hi')
  })

  it('gives us badPass value when score is under 34', () => {
    $('#password').password({ badPass: 'hi' }).val('tester').trigger('keyup')
    expect($('.pass-text').text()).toEqual('hi')
  })

  it('gives us badPass value when score is under 34', () => {
    $('#password').password({ badPass: 'hi' }).val('tester').trigger('keyup')
    expect($('.pass-text').text()).toEqual('hi')
  })

  it('gives us goodPass value when score is under 68', () => {
    $('#password').password({ goodPass: 'hi' }).val('tester23').trigger('keyup')
    expect($('.pass-text').text()).toEqual('hi')
  })

  it('gives us strongPass value when score is under over 68', () => {
    $('#password').password({ strongPass: 'hi' }).val('!Tester23$').trigger('keyup')
    expect($('.pass-text').text()).toEqual('hi')
  })

  it('gives us badPass value when there\'s a lot of characters but repeated', () => {
    $('#password').password({ badPass: 'hi' })
      .val('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadddddddddddddddddd')
      .trigger('keyup')

    expect($('.pass-text').text()).toEqual('hi')
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
