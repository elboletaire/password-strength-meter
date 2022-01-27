/**
 * @author Òscar Casajuana a.k.a. elboletaire <elboletaire at underave dot net>
 * @link https://github.com/elboletaire/password-strength-meter
 * @license GPL-3.0
 *
 * @version 2.2.0
 */
// eslint-disable-next-line
;(function($) {
  'use strict';

  var Password = function ($object, options) {
    var defaults = {
      enterPass: 'Type your password',
      shortPass: 'The password is too short',
      containsField: 'The password contains your name',
      notAllowed: 'The password contains a commonly used word',
      steps: {
        13: 'Really insecure password',
        33: 'Weak; try combining letters & numbers',
        67: 'Medium; try using special characters',
        94: 'Strong password',
      },
      showPercent: false,
      showText: true,
      animate: true,
      animateSpeed: 'fast',
      fields: false, // Legacy 'field'
      fieldsPartialMatch: true, // Legacy 'fieldPartialMatch'
      contains: [],
      appendContainsMatch: false,
      conditions: {
        lowercase: '',
        uppercase: '',
        number: '',
        special: '',
      },
      conditionsRequired: [], // 'lowercase', 'uppercase', 'number', 'special'
      minimumConditions: 0,
      minimumLength: 4,
      closestSelector: 'div',
      useColorBarImage: false,
      customColorBarRGB: {
        red: [0, 240],
        green: [0, 240],
        blue: 10
      },
    };
    var containsMatch = '';
    var passwordState = {
      isValid: false,
      conditionsPassed: 0,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecial: false,
    }

    options = $.extend({}, defaults, options);

    /**
     * Returns strings based on the score given.
     *
     * @param {int} score Score base.
     * @return {string}
     */
    function scoreText(score) {
      if (score === -1) {
        return options.shortPass;
      }
      if (score === -2) {
        return options.containsField;
      }
      if ( score === -3) {
        if (options.appendContainsMatch) {
          return options.notAllowed + containsMatch;
        } else {
          return options.notAllowed;
        }
      }

      score = score < 0 ? 0 : score;

      var text = options.shortPass;
      var sortedStepKeys = Object.keys(options.steps).sort();
      for (var step in sortedStepKeys) {
        var stepVal = sortedStepKeys[step];
        if (stepVal < score) {
          text = options.steps[stepVal];
        }
      }

      return text;
    }

    /**
     * Returns a value between -2 and 100 to score
     * the user's password.
     * 
     * @version 2.2.0
     *
     * @param  {string} password The password to be checked.
     * @param  {array} fieldValues Array of prohibited strings from field values.
     * @return {int}
     */
    function calculateScore(password, fieldValues) {
      var score = 0;

      // password < options.minimumLength
      if (password.length < options.minimumLength) {
        $('.has-pw-condition').removeClass('has-pw-condition');
        $object.trigger('notValid');
        return -1;
      }

      if (options.fields || options.field) { // Compatibility for > 2.2.0 singular fields
        // password === field
        if (fieldValues.includes(password.toLowerCase())) {
          $object.trigger('notValid');
          $('.has-pw-condition').removeClass('has-pw-condition');
          return -2;
        }
        // password contains field (and fieldPartialMatch is set to true)
        if (
          (options.fieldsPartialMatch || options.fieldPartialMatch) // Compatibility for > 2.2.0 singular fields
            && fieldValues.length
          ) {
          for (var fieldValue of fieldValues) {
            if (password.toLowerCase().includes(fieldValue)) {
              containsMatch = ': ' + fieldValue;
              $('.has-pw-condition').removeClass('has-pw-condition');
              $object.trigger('notValid');
              return -2;
            }
          }
        }
      }

      if (options.contains.length >= 1) {
        for (var stopWord of options.contains) {
          if (password.toLowerCase().includes(stopWord.toLowerCase())) {
            containsMatch = ': ' + stopWord;
            $('.has-pw-condition').removeClass('has-pw-condition');
            $object.trigger('notValid');
            return -3;
          }
        }
      }

      // password length
      score += password.length * 4;
      score += checkRepetition(1, password).length - password.length;
      score += checkRepetition(2, password).length - password.length;
      score += checkRepetition(3, password).length - password.length;
      score += checkRepetition(4, password).length - password.length;

      // password has 1 number
      if (password.match(/([0-9])/)) {
        passwordState.hasNumber = true;
      } else {
        passwordState.hasNumber = false;
      }

      // password has 3 numbers
      if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
        score += 5;
      }

      // password has at least 1 symbol
      var oneSymbol = new RegExp(/([$-/:-?{-~!"^_`¬\[\]])/);
      if (password.match(oneSymbol)) {
        passwordState.hasSpecial = true;
      } else {
        passwordState.hasSpecial = false;
      }
      // password has at least 2 symbols
      var twoSymbols = new RegExp(/([$-/:-?{-~!"^_`¬\[\]].*[$-/:-?{-~!"^_`¬\[\]])/);
      if (password.match(twoSymbols)) {
        score += 5;
      }

      // password has 1 lowercase
      if (password.match(/([a-z])/)) {
        passwordState.hasLowercase = true;
      } else {
        passwordState.hasLowercase = false;
      }

      // password has 1 uppercase
      if (password.match(/([A-Z])/)) {
        passwordState.hasUppercase = true;
      } else {
        passwordState.hasUppercase = false;
      }

      // password has Upper and Lower chars
      if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        score += 10;
      }

      // password has number and chars
      if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
        score += 15;
      }

      // password has number and symbol
      if (password.match(/([!@#$%^&*?_~])/) && password.match(/([0-9])/)) {
        score += 15;
      }

      // password has char and symbol
      if (password.match(/([!@#$%^&*?_~])/) && password.match(/([a-zA-Z])/)) {
        score += 15;
      }

      // password is just numbers or chars
      if (password.match(/^\w+$/) || password.match(/^\d+$/)) {
        score -= 10;
      }

      if (score > 100) {
        score = 100;
      }

      if (score < 0) {
        score = 0;
      }

      // Validation from conditions
      var passed = 0;
      var requiredPassed = false;
      // Lower Case 
      if (passwordState.hasLowercase) {
        passed++;
        if( options.conditionsRequired.includes('lowercase') ) {
          requiredPassed = true;
        }
        if(options.conditions.lowercase ) {
          $(options.conditions.lowercase).addClass('has-pw-condition');
        }
      } else {
        $(options.conditions.lowercase).removeClass('has-pw-condition');
      }

      // Uppercase
      if (passwordState.hasUppercase) {
        passed++;
        if (options.conditionsRequired.includes('uppercase')) {
          requiredPassed = true;
        }
        if (options.conditions.uppercase) {
          $(options.conditions.uppercase).addClass('has-pw-condition');
        }
      } else {
        $(options.conditions.uppercase).removeClass('has-pw-condition');
      }

      // Number
      if (passwordState.hasNumber) {
        passed++;
        if (options.conditionsRequired.includes('number')) {
          requiredPassed = true;
        }
        if (options.conditions.number) {
          $(options.conditions.number).addClass('has-pw-condition');
        }
      } else {
        $(options.conditions.number).removeClass('has-pw-condition');
      }

      // Special
      if (passwordState.hasSpecial) {
        passed++; 
        if (options.conditionsRequired.includes('special')) {
          requiredPassed = true;
        }
        if (options.conditions.special) {
          $(options.conditions.special).addClass('has-pw-condition');
        }
      } else {
        $(options.conditions.special).removeClass('has-pw-condition');
      }

      // Check if our conditions are all passed
      if (passed && passed >= options.minimumConditions && requiredPassed) {
        passwordState.isValid = true;
        $object.trigger('isValid', [passwordState]);
      } else {
        $object.trigger('notValid', [passwordState]);
      }

      return score;
    }

    /**
     * Checks for repetition of characters in
     * a string
     *
     * @param {int} length Repetition length.
     * @param {string} str The string to be checked.
     * @return {string}
     */
    function checkRepetition(length, str) {
      var res = "", repeated = false;
      for (var i = 0; i < str.length; i++) {
        repeated = true;
        for (var j = 0; j < length && (j + i + length) < str.length; j++) {
          repeated = repeated && (str.charAt(j + i) === str.charAt(j + i + length));
        }
        if (j < length) {
          repeated = false;
        }
        if (repeated) {
          i += length - 1;
          repeated = false;
        }
        else {
          res += str.charAt(i);
        }
      }
      return res;
    }

    /**
     * Calculates background colors from percentage value.
     *
     * @param {int} perc The percentage strength of the password.
     * @return {object} Object with colors as keys
     */
    function calculateColorFromPercentage(perc) {
      var minRed = 0;
      var maxRed = 240;
      var minGreen = 0;
      var maxGreen = 240;
      var blue = 10;

      if (Object.prototype.hasOwnProperty.call(options.customColorBarRGB, 'red')) {
        minRed = options.customColorBarRGB.red[0];
        maxRed = options.customColorBarRGB.red[1];
      }

      if (Object.prototype.hasOwnProperty.call(options.customColorBarRGB, 'green')) {
        minGreen = options.customColorBarRGB.green[0];
        maxGreen = options.customColorBarRGB.green[1];
      }

      if (Object.prototype.hasOwnProperty.call(options.customColorBarRGB, 'blue')) {
        blue = options.customColorBarRGB.blue;
      }

      var green = (perc * maxGreen / 50);
      var red = (2 * maxRed) - (perc * maxRed / 50);

      return {
        red: Math.min(Math.max(red, minRed), maxRed),
        green: Math.min(Math.max(green, minGreen), maxGreen),
        blue: blue
      }
    }

    /**
     * Adds color styles to colorbar jQuery object.
     *
     * @param {jQuery} $colorbar The colorbar jquery object.
     * @param {int} perc The percentage strength of the password.
     * @return {jQuery}
     */
    function addColorBarStyle($colorbar, perc) {
      if (options.useColorBarImage) {
        $colorbar.css({
          backgroundPosition: "0px -" + perc + "px",
          width: perc + '%'
        });
      }
      else {
        var colors = calculateColorFromPercentage(perc);

        $colorbar.css({
          'background-image': 'none',
          'background-color': 'rgb(' + colors.red.toString() + ', ' + colors.green.toString() + ', ' + colors.blue.toString() + ')',
          width: perc + '%'
        });
      }

      return $colorbar;
    }

    /**
     * Initializes the plugin creating and binding the
     * required layers and events.
     *
     * @return {Password} Returns the Password instance.
     */
    function init() {
      var shown = true;
      var $text = options.showText;
      var $percentage = options.showPercent;
      var $graybar = $('<div>').addClass('pass-graybar');
      var $colorbar = $('<div>').addClass('pass-colorbar');
      var $insert = $('<div>').addClass('pass-wrapper').append(
        $graybar.append($colorbar)
      );

      $object.closest(options.closestSelector).addClass('pass-strength-visible');
      if (options.animate) {
        $insert.css('display', 'none');
        shown = false;
        $object.closest(options.closestSelector).removeClass('pass-strength-visible');
      }

      if (options.showPercent) {
        $percentage = $('<span>').addClass('pass-percent').text('0%');
        $insert.append($percentage);
      }

      if (options.showText) {
        $text = $('<span>').addClass('pass-text').html(options.enterPass);
        $insert.append($text);
      }

      $object.closest(options.closestSelector).append($insert);

      $object.keyup(function() {
        var fields = options.fields || options.field || ''; // check for legacy options.field
        if (fields) {
          var $fields = $(fields);
          var fieldValues = [];
          $fields.each(function () {
            if( $(this).val() ) {
              fieldValues.push($(this).val().toLowerCase());
            }
          });
        }

        var score = calculateScore($object.val(), fieldValues);
        $object.trigger('password.score', [score]);
        var perc = score < 0 ? 0 : score;

        $colorbar = addColorBarStyle($colorbar, perc);

        if (options.showPercent) {
          $percentage.html(perc + '%');
        }

        if (options.showText) {
          var text = scoreText(score);
          if (!$object.val().length && score <= 0) {
            text = options.enterPass;
          }

          if ($text.html() !== $('<div>').html(text).html()) {
            $text.html(text);
            $object.trigger('password.text', [text, score]);
          }
        }
      });

      if (options.animate) {
        $object.focus(function() {
          if (!shown) {
            $insert.slideDown(options.animateSpeed, function () {
              shown = true;
              $object.closest(options.closestSelector).addClass('pass-strength-visible');
            });
          }
        });

        $object.blur(function() {
          if (!$object.val().length && shown) {
            $insert.slideUp(options.animateSpeed, function () {
              shown = false;
              $object.closest(options.closestSelector).removeClass('pass-strength-visible')
            });
          }
        });
      }

      return this;
    }

    return init.call(this);
  };

  // Bind to jquery
  $.fn.password = function(options) {
    return this.each(function() {
      new Password($(this), options);
    });
  };
})(jQuery);
