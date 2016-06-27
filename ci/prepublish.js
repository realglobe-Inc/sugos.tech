#!/usr/bin/env node

/**
 * Prepublish script.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const apeCompiling = require('ape-compiling')
const co = require('co')
const loc = require('../loc')

let { execcli } = apeTasking
let dest = 'public/javascripts/external.js'
let destCC = 'public/javascripts/external.cc.js'

apeTasking.runTasks('prepublish', [
  () => co(function * () {
    let { env } = process
    for (let lang of Object.keys(loc)) {
      yield execcli('ci/compile.js', [], { env: Object.assign({ LANG: lang }, env) })
    }
  }),
  () => co(function * () {
    try {
      yield apeCompiling.browserifyJs('', dest, {
        require: require('./config/external.config.json'),
        debug: false
      })
      console.log(`File generated: ${dest}`)
    } catch (e) {
      console.warn('Failed to update bundle.js', e)
      throw e
    }
  }),
  () => co(function * () {
    yield apeCompiling.compileCC(dest, destCC)
    console.log(`File generated: ${destCC}`)
  })
], true)
