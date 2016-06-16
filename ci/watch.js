#!/usr/bin/env node

/**
 * Watch files.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeWatching = require('ape-watching')
const childProcess = require('child_process')

let timer = null
apeWatching.watchFiles([
  'lib/**/*.jsx'
], (ev, filename) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    childProcess.fork('ci/compile.js', {
      stdio: 'inherit',
      env: Object.assign({}, process.env, {'LANG': 'ja'})
    })
  }, 300)
})