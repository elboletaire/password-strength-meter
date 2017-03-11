/**
 * Password Strength Meter for jQuery
 * v. 0.1 2010-02-07
 * @author Òscar Casajuana a.k.a. elboletaire <elboletaire at underave {dot} net>
 * 
 * Based on the script written by Firas Kassem [2007.04.05] <phiras at gmail {dot} com> 
 * and modified by Amin Rajaee [2009.07.26] <rajaee at gmail {dot} com>
 * 
 * 
 * Usage:
 * 
 * jQuery('input[type=password]').password();
 * 
 * Options you can set:
 * 
 * jQuery('#password').password({
 * 		shortPass:	'Too Short Password', // Text showed when the pass is too short
 *		badPass:	'Weak; Use letters & numbers',
 *		goodPass:	'Medium; Use special charecters',
 *		strongPass:	'Strong Password',
 *		enterPass:	'Enter your password', // Text showed before the user starts typing
 *		showPercent: false, // Show percentage?
 *		showText: true, // Show text?
 *		animate: true, // Animate?
 *		username: '#username', // Set the selector of the username to check it with the password
 *		sameAsUsername: 'Password is the same as username', // showed if var 'username' is set
 * });
 * 
 */
(function($){
	$.fn.password = function(options){
		// Init options
		$.fn.password.defaults = {
			shortPass:	'Too Short Password',
			badPass:	'Weak; Use letters & numbers',
			goodPass:	'Medium; Use special charecters',
			strongPass:	'Strong Password',
			sameAsUsername: 'Password is the same as username',
			enterPass:	'Enter your password',
			showPercent: false,
			showText: true,
			animate: true,
			username: false
		};

		var opts = $.extend({}, $.fn.password.defaults, options);

		return this.each(function(){
			var obj = $(this);
			
			var input = $('<input />').attr({
				type:	obj.attr('type'),
			});
			var attributes = ['id','class','style','name','value'];
			$.each(attributes, function(i,e){
				if(typeof obj.attr(e) != 'undefined' && obj.attr(e).length > 0)
					input.attr(e, obj.attr(e));
			});
			
			var wrapper = $('<div>').css('margin-left', obj.outerWidth() - obj.width());
			
			if(opts.animate)
			{
				wrapper.css('display', 'none');
			}
			
			var graybar = $('<div>').addClass('pass-graybar');
			
			var colorbar = $('<div>').addClass('pass-colorbar');
			
			var insert = $('<div>').css({
				width: obj.width()
			}).append(input).append($(wrapper).append($(graybar).append(colorbar)));
			
			if(opts.showPercent)
			{
				var percentage = $('<span>')
					.addClass('pass-percent').html('0%')
					.css('margin-right', '5px');
				wrapper.append(percentage);
			}
			
			if(opts.showText)
			{
				var text = $('<span>').addClass('pass-text').html(opts.enterPass);
				wrapper.append(text);
			}
			
			obj.replaceWith(insert);
			
			var showed = false;
			
			input.keyup(function(){
				var username = '';
				if (opts.username)
				{
					username = $(opts.username).val();
				}
				
				perc = percent(input.val(),username);
				percString = passwordStrengthString(input.val(),username);
				$(colorbar).css(
				{
					backgroundPosition: "0px -"+perc+"px",
					width: perc+"%"
				});
				
				if (opts.showPercent) $(percentage).html(perc+'%');
				
				if (opts.showText) $(text).html(percString);
			});
			
			if(opts.animate)
			{
				input.focus(function(){
					if(showed == false) {
						wrapper.slideDown('fast');
						showed = true;
					}
				});
				
				input.blur(function(){
					if (input.val() == '' && showed == true) {
						wrapper.slideUp();
						showed = false;
					}
				});
			}
		});

		function passwordStrengthString(password,username)
		{
			score = passwordStrength(password,username);

			if (score == -1) return opts.shortPass;
			if (score == -2) return opts.sameAsUsername;

			// verifing 0 < score < 100
			if ( score < 0 )  score = 0;
			if ( score > 100 )  score = 100;

			if (score < 34 )  return opts.badPass;
			if (score < 68 )  return opts.goodPass;

			return opts.strongPass;
		}
		
		function percent (password, username)
		{
			score = passwordStrength(password,username);

			if ( score < 0 )  score = 0;
			if ( score > 100 )  score = 100;

			return score;
		}

		function passwordStrength(password,username)
		{
			score = 0;

			// password < 4
			if (password.length < 4 ) { return -1; }

			// password == username
			if (password.toLowerCase() == username.toLowerCase()) return -2;

			// password length
			score += password.length * 4;
			score += ( checkRepetition(1,password).length - password.length ) * 1;
			score += ( checkRepetition(2,password).length - password.length ) * 1;
			score += ( checkRepetition(3,password).length - password.length ) * 1;
			score += ( checkRepetition(4,password).length - password.length ) * 1;

			// password has 3 numbers
			if (password.match(/(.*[0-9].*[0-9].*[0-9])/))  score += 5;

			// password has 2 sybols
			if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) score += 5;

			// password has Upper and Lower chars
			if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))  score += 10;

			// password has number and chars
			if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))  score += 15;

			// password has number and symbol
			if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/))  score += 15;

			// password has char and symbol
			if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/))  score += 15;

			// password is just numbers or chars
			if (password.match(/^\w+$/) || password.match(/^\d+$/) )  score -= 10;
			if (score > 100) return 100;

			return (score);
		}
		
		// checkRepetition(1,'aaaaaaabcbc')   = 'abcbc'
		// checkRepetition(2,'aaaaaaabcbc')   = 'aabc'
		// checkRepetition(2,'aaaaaaabcdbcd') = 'aabcd'
		function checkRepetition(pLen,str) {
			res = "";
			for ( i = 0; i < str.length; i++ ) {
				repeated = true;
				for ( j = 0; j < pLen && (j + i + pLen) < str.length; j++ ) {
					repeated = repeated && (str.charAt(j + i) == str.charAt(j + i + pLen));
				}
				if (j<pLen) repeated = false;
				if (repeated) {
					i += pLen - 1;
					repeated = false;
				}
				else {
					res+=str.charAt(i);
				}
			}
			return res;
		}
	};
})(jQuery);