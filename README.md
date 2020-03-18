Password Strength Meter plugin for jQuery
=========================================

[![Build status][build svg]][build status]
[![Code coverage][coverage svg]][coverage]
[![License][license svg]][license]
[![Latest stable version][releases svg]][releases]
[![Total downloads][downloads svg]][downloads]
[![Code climate][climate svg]][climate]
[![jsDelivr CDN][jsdelivr svg]][jsdelivr]

A password strength meter for jQuery. [Give it a try!][web]

![password example][example]


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

Or much better, using yarn

~~~bash
yarn add password-strength-meter
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
  enterPass: 'Type your password',
  shortPass: 'The password is too short',
  containsField: 'The password contains your username',
  steps: {
    // Easily change the steps' expected score here
    13: 'Really insecure password',
    33: 'Weak; try combining letters & numbers',
    67: 'Medium; try using special characters',
    94: 'Strong password',
  },
  showPercent: false,
  showText: true, // shows the text tips
  animate: true, // whether or not to animate the progress bar on input blur/focus
  animateSpeed: 'fast', // the above animation speed
  field: false, // select the match field (selector or jQuery instance) for better password checks
  fieldPartialMatch: true, // whether to check for partials in field
  minimumLength: 4, // minimum password length (below this threshold, the score is 0)
  useColorBarImage: true, // use the (old) colorbar image
  customColorBarRGB: {
    red: [0, 240],
    green: [0, 240],
    blue: 10,
  } // set custom rgb color ranges for colorbar.
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

This plugin was originally created in 2010 for jQuery 1.14, and the current release
has been tested under jQuery 1, 2 & 3.

It should work in all browsers (even IE 666).

Testing
-------

First you'll need to grab the code, as the npm version does not come with the
source files:

~~~bash
git clone https://github.com/elboletaire/password-strength-meter.git
cd password-strength-meter
npm install
npm test
~~~

> Note: tests are just run using jQuery 3.

Why?
----

Why another library? Well, I found this on March 11th (of 2017) cleaning up my
documents folder and noticed I made it in 2010 and never published it, so I
decided to refactor it "a bit" (simply remade it from the ground-up) and publish
it, so others can use it.

Credits
-------

Created by Òscar Casajuana <elboletaire at underave dot net>.

Based on unlicensed work by [Firas Kassem][firas], published in 2007 and modified
by Amin Rajaee in 2009.

This code is licensed under a [GPL 3.0 license][license].

[example]: src/example.png
[firas]: https://phiras.wordpress.com/2009/07/29/password-strength-meter-v-2/
[license]: LICENSE.md
[web]: https://elboletaire.github.io/password-strength-meter/

[build status]: https://gitlab.com/elboletaire/password-strength-meter/pipelines
[coverage]: https://gitlab.com/elboletaire/password-strength-meter/-/jobs
[license]: https://github.com/elboletaire/password-strength-meter/blob/master/LICENSE.md
[releases]: https://github.com/elboletaire/password-strength-meter/releases
[downloads]: https://www.npmjs.com/package/password-strength-meter
[climate]: https://codeclimate.com/github/elboletaire/password-strength-meter
[jsdelivr]: https://www.jsdelivr.com/package/npm/password-strength-meter

[build svg]: https://gitlab.com/elboletaire/password-strength-meter/badges/master/pipeline.svg
[coverage svg]: https://gitlab.com/elboletaire/password-strength-meter/badges/master/coverage.svg
[license svg]: https://img.shields.io/github/license/elboletaire/password-strength-meter.svg
[releases svg]: https://img.shields.io/npm/v/password-strength-meter.svg
[downloads svg]: https://img.shields.io/npm/dt/password-strength-meter.svg
[climate svg]: https://img.shields.io/codeclimate/maintainability/elboletaire/password-strength-meter.svg
[jsdelivr svg]: https://data.jsdelivr.com/v1/package/npm/password-strength-meter/badge?style=rounded
