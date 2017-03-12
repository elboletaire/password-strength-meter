Password Strength Meter plugin for jQuery
=========================================

A password strength meter for jQuery.

![password example][example]

Why?
----

Why another library? Well, I found this on March 11th (of 2017) cleaning up my
documents folder and noticed I made it in 2010 and never published it, so I
decided to refactor it "a bit" (simply remade it from the ground-up) and publish
it, so others can use it.

Installation
------------

Using npm

~~~bash
npm install --save password-strength-meter
~~~

Using bower

~~~bash
bower install --save password-strength-meter
~~~

For manual installations check out the [releases][releases] section for tarballs.

Usage
-----

Import the required scripts:

~~~html
<script src="./js/password-strength-meter/password.min.js"></script>
<script src="./js/password-strength-meter/password.min.css"></script>
~~~

Ensure your password field has a wrapper div, like in Bootstrap:

~~~html
<div class="form-group">
  <label for="password">
    Password
  </label>
  <input id="password" type="password" class="form-control" />
</div>
~~~

And call the plugin when you wanna enable it:

~~~javascript
$('#password').password({ /* options */ });
~~~

### Available options

Here's the list of available options you can pass to the `password` plugin:

~~~javascript
$('#password').password({
  shortPass: 'The password is too short',
  badPass: 'Weak; try combining letters & numbers',
  goodPass: 'Medium; try using special charecters',
  strongPass: 'Strong password',
  containsUsername: 'The password contains the username',
  enterPass: 'Type your password',
  showPercent: false,
  showText: true, // shows the text tips
  animate: true, // whether or not to animate the progress bar on input blur/focus
  animateSpeed: 'fast', // the above animation speed
  username: false, // select the username field (selector or jQuery instance) for better password checks
  usernamePartialMatch: true, // whether to check for username partials
  minimumLength: 4 // minimum password length (below this threshold, the score is 0)
});
~~~

### Events

There are two events fired by the `password` plugin:

~~~javascript
$('#password').on('password.score', (e, score) => {
  console.log('Called every time a new score is calculated (this means on every keyup)')
  console.log('Current score is %d', score)
})

$('#password').on('password.text', (e, text, score) => {
  console.log('Called every time the text is changed (less updated than password.score)')
  console.log('Current message is %s with a score of %d', text, score)
})
~~~

Compatiblity
------------

This plugin was originally created in 2010 for jQuery 1.14, and the current relase
has been tested under jQuery 1, 2 & 3.

It should work in all browswers (even IE 666).

Credits
-------

Created by Òscar Casajuana <elboletaire at underave dot net>.

Based on unlicensed work by [Firas Kassem][firas], published in 2007 and modified
by Amin Rajaee in 2009.

This code is licensed under a [GPL 3.0 license][license].

[example]: src/example.png
[firas]: https://phiras.wordpress.com/2009/07/29/password-strength-meter-v-2/
[license]: ./LICENSE.md
