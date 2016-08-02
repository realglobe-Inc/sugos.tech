#!/usr/bin/env node

/**
 * Watch files.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const awatch = require('awatch')
const { fork } = require('child_process')

let build = fork('ci/build.js', {
})

awatch([
  'lib/**/*.jsx'
], (ev, filename) => {
  build.send({ rerun: { ev, filename } })
}, {
  interval: 1000
})
