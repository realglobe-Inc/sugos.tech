#!/usr/bin/env node

/**
 * Generate docs
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const co = require('co')
const childProcess = require('child_process')
const writeout = require('writeout')

apeTasking.runTasks('build', [
  () => co(function * () {
    let config = {
      'sugo-cloud': 'node_modules/sugo-cloud/lib/**/*.js',
      'sugo-spot': 'node_modules/sugo-spot/lib/**/*.js',
      'sugo-caller': 'node_modules/sugo-caller/lib/**/*.js'
    }
    for (let name of Object.keys(config)) {
      let src = config[ name ]
      let dest = `doc/jsdoc/${name}.jsdoc.json`
      let data = childProcess.execSync(`
    jsdoc ${src} -t templates/haruki -d console -q format=JSON
`)
      data = JSON.stringify(JSON.parse(data), null, 2)
      let result = yield writeout(dest, data, {
        mkdirp: true,
        skipIfIdentical: true
      })
      if (!result.skipped) {
        console.log(`File generated: ${result.filename}`)
      }
    }
  })
], true)
