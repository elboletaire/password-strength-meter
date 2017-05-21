const brfs = require('brfs'),
      istanbul = require('browserify-istanbul')

module.exports = function(config) {
  const launchers = {
    firefox_first: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Linux',
      version: '6.0',
    },
    firefox_latest: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: 'latest',
    },
    chrome_first: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Linux',
      version: '26.0',
    },
    chrome_latest: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest',
    },
    ie_win_7: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9.0',
    },
    ie_win_8: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10.0',
    },
    ie_win_81: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11.0',
    },
    ie_win_10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: '11.103',
    },
    edge_win_10: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: '14.14393',
    },
    safari_first: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.8',
      version: '6.0',
    },
    safari_latest: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.12',
      version: 'latest',
    },
    android_first: {
      base: 'SauceLabs',
      browserName: 'Browser',
      appiumVersion: '1.6.4',
      deviceName: 'Android Emulator',
      deviceOrientation: 'portrait',
      platformVersion: '4.4',
      platformName: 'Android',
    },
    android_latest: {
      base: 'SauceLabs',
      browserName: 'Chrome',
      appiumVersion: '1.6.4',
      deviceName: 'Android Emulator',
      deviceOrientation: 'portrait',
      platformVersion: '6.0',
      platformName: 'Android',
    }
  }

  const localLaunchers = {
    phantom: { base: 'PhantomJS' },
    firefox: { base: 'Firefox' },
    chrome: { base: 'Chrome' },
  }

  if (!process.env.CI) {
    localLaunchers.ie8_virtual = {
      base: 'VirtualBoxAny',
      config: {
        vm_name: 'IE8 - Win7',
        use_gui: false,
        cmd: 'C:\\Program Files\\Internet Explorer\\iexplore.exe',
        shutdown: false,
      }
    }
  }

  const customLaunchers = Object.assign({}, launchers, localLaunchers)

  let browsers = Object.keys(localLaunchers)
  if (process.env.CI) {
    browsers = Object.keys(launchers)
  }

  const saucelabs = {
    testName: 'password-strength-meter browser tests',
    recordScreenshots: true,
    public: 'public',
    tags: ['password-strength-meter', 'jquery', 'plugin'],
  }

  if (process.env.TRAVIS) {
    // https://github.com/karma-runner/karma-sauce-launcher/issues/73
    saucelabs.startConnect = false
    saucelabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER
  }

  config.set({
    client: {
      jasmine: {
        config: './test/support/jasmine.json',
      }
    },
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'jasmine-jquery', 'jasmine'],
    // list of files / patterns to load in the browser
    files: [
      'src/*.js',
      'test/*.js',
      'test/*.html',
    ],
    // list of files to exclude
    exclude: [
    ],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './test/*.spec.js': ['browserify'],
      './src/*.js': ['coverage'],
    },
    browserify: {
      debug: true,
      transform: [brfs, 'browserify-shim', 'es6-arrow-function', istanbul({
        ignore: ['**/node_modules/**', '**/test/**'],
      })],
    },
    coverageReporter: {
      type: 'lcov',
    },
    sauceLabs: saucelabs,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'saucelabs'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    customLaunchers: customLaunchers,
    browsers: browsers,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
