const $ = jQuery = require('jquery')

require('../src/password')

beforeEach(() => {
  jQuery.fx.off = true
  document.body.innerHTML = `<div><input type="password" id="password" />
<input type="text" id="username" /></div>`
})

describe('$.fn.password', () => {
  describe('init:', () => {
    it('creates the required layers next to the input', () => {
      $('#password').password()
      expect($('.pass-wrapper').length).toBeTruthy()
      expect($('.pass-wrapper').length).toBeTruthy()
      expect($('.pass-colorbar').length).toBeTruthy()
      expect($('.pass-graybar').length).toBeTruthy()
      expect($('input + div.pass-wrapper').length).toBeTruthy()
      expect($('.pass-text').length).toBeTruthy()
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

    describe('options:', () => {
      it('showPercent: shows the percent when set', () => {
        $('#password').password({ showPercent: true })
        expect($('.pass-percent').length).toBeTruthy()
      })

      it('enterPass: shows proper text', () => {
        $('#password').password({ animate: false, enterPass: 'hi' })
        expect($('.pass-text').text()).toEqual('hi')
      })
      it('closestSelector: fixes issue with input-groups', () => {
        document.body.innerHTML = `<div class="form-group">
        <div class="input-group">
            <span class="input-group-addon">
                <span class="glyphicon glyphicon-lock" aria-hidden="true"></span>
            </span>
            <input id="password" class="form-control" type="password">
        </div>
    </div>`

        $('#password').password({
          closestSelector: '.form-group',
        })

        expect($('.form-group > .pass-wrapper').length).toBeTruthy()
      })
    })

  })

  describe('behavior:', () => {
    it('percentage is updated when value is set', () => {
      $('#password').password({ showPercent: true })

      expect($('.pass-percent').length).toBeTruthy()

      var percentage = $('.pass-percent').text()

      $('input').val('testing').trigger('keyup')

      expect($('.pass-percent').text()).not.toEqual(percentage)
    })

    it('both shortPass and minimumLength work as expected', () => {
      $('#password').password({ shortPass: 'hi', minimumLength: 6 }).val('12312').trigger('keyup')

      expect($('.pass-text').text()).toEqual('hi')
    })

    it('field match works, showing containsField text', () => {
      $('#username').val('test')
      $('#password').password({
          field: '#username',
          containsField: 'hi',
          fieldPartialMatch: false
        })
        .val('test').trigger('keyup')

      expect($('.pass-text').text()).toEqual('hi')

      // also ensure that fieldPartialMatch set to
      // false does what it should to
      $('#username').val('tester')
      $('#password').trigger('keyup')

      expect('hi').not.toEqual($('.pass-text').text())
    })

    it('fieldPartialMatch works as expected', () => {
      $('#username').val('test')
      $('#password').password({
          field: '#username',
          containsField: 'hi',
          fieldPartialMatch: true
        })
        .val('tester').trigger('keyup')

      expect($('.pass-text').text()).toEqual('hi')
    })

    const steps = {
      13: 'Really insecure password',
      33: 'Weak; try combining letters & numbers',
      67: 'Medium; try using special characters',
      94: 'Strong password',
    }

    it('gives us the really insecure password error', () => {
      $('#password').password({steps}).val('tester').trigger('keyup')
      expect($('.pass-text').text()).toEqual(steps[13])
    })

    it('gives us the weak password warning', () => {
      $('#password').password({steps}).val('tester23').trigger('keyup')
      expect($('.pass-text').text()).toEqual(steps[33])
    })

    it('gives us the medium password warning', () => {
      $('#password').password({steps}).val('!Tester23').trigger('keyup')
      expect($('.pass-text').text()).toEqual(steps[67])
    })

    it('gives us the strong password warning', () => {
      $('#password').password({steps}).val('!Tester23$#').trigger('keyup')
      expect($('.pass-text').text()).toEqual(steps[94])
    })

    const unsortedSteps = {
      94: 'Strong password',
      67: 'Medium; try using special characters',
      33: 'Weak; try combining letters & numbers',
      13: 'Really insecure password',
    }
    it('steps order does not really affect messages', () => {
      $('#password').password({steps}).val('!Tester23$#').trigger('keyup')
      expect($('.pass-text').text()).toEqual(steps[94])
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

    it('uses no color background image by default', () => {
      $('#password').password()

      expect('').toEqual($('.pass-colorbar').css('background-image'))
    })

    it('makes background image style adjustments if turned on', () => {
      $('#password').password({useColorBarImage: true}).val('Tester23$').trigger('keyup')
      $colorbar = $('.pass-colorbar')

      expect('0px -91px').toEqual($colorbar.css('background-position'))
      expect('91%').toEqual($colorbar.css('width'))
    })

    it('can use custom rgb colorbar values for a good password', () => {
      $('#password').password({
        customColorBarRGB: {
          green: [0, 100],
          red: [10, 150],
          blue: 50
        }
      }).val('!Tester23$').trigger('keyup')

      expect('rgb(10, 100, 50)').toEqual($('.pass-colorbar').css('background-color'))
    })

    it('can use custom rgb colorbar values for a bad password', () => {
      $('#password').password({
        customColorBarRGB: {
          green: [0, 100],
          red: [10, 150]
        }
      }).val('abc').trigger('keyup')

      expect('rgb(150, 0, 10)').toEqual($('.pass-colorbar').css('background-color'))
    })
  })
})
