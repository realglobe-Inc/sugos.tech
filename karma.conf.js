module.exports = function (config) {
  config.set({
    browsers: process.env.CI ? ['Firefox'] : ['Chrome', 'Firefox'],

    frameworks: ['mocha'],

    singleRun: true,

    files: [
      'test/index_test.js',
      'public/javascripts/index.js',
      'test/docs_test.js',
      'public/javascripts/docs.js',
      'test/cases_test.js',
      'public/javascripts/cases.js'
    ],

    reporters: [ 'mocha' ],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO
  })
}
