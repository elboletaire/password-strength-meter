const brfs = require('brfs'),
      istanbul = require('browserify-istanbul')

module.exports = function(config) {
  const launchers = {
    firefox_win_7: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 7',
      version: 'latest',
    },
    firefox_win_8: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 8.1',
      version: 'latest',
    },
    chrome_win_10: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest',
    },
    firefox_win_10: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: 'latest',
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
    safari_sierra: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.12',
      version: 'latest',
    },
    android: {
      base: 'SauceLabs',
      browserName: 'Android',
      appiumVersion: '1.6.4',
      deviceName: 'Android Emulator',
      deviceOrientation: 'portrait',
      browserName: 'Chrome',
      platformVersion: '6.0',
      platformName: 'Android',
    }
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
    sauceLabs: {
      testName: 'password-strength-meter browser tests',
      recordScreenshots: true,
      public: 'public',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

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
    customLaunchers: launchers,
    browsers: Object.keys(launchers),

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
