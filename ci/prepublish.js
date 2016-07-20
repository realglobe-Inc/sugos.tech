#!/usr/bin/env node

/**
 * Prepublish script.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const co = require('co')
const loc = require('../loc')

let { execcli } = apeTasking

apeTasking.runTasks('prepublish', [
  () => co(function * () {
    let { env } = process
    for (let lang of Object.keys(loc)) {
      yield execcli('ci/compile.js', [], { env: Object.assign({ LANG: lang }, env) })
    }
  })
], true)
