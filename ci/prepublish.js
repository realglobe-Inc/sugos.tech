#!/usr/bin/env node

/**
 * Prepublish script.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const co = require('co')

let { execcli } = apeTasking

apeTasking.runTasks('prepublish', [
  () => co(function * () {
    let { env } = process
    let langs = [ 'en' ]
    for (let lang of langs) {
      yield execcli('ci/build.js', [], { env: Object.assign({ LANG: lang }, env) })
    }
  })
], true)
