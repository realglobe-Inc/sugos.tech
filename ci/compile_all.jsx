#!/usr/bin/env node

/**
 * Compile files for all langs.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const co = require('co')
let { execcli } = apeTasking
const loc = require('../loc')

apeTasking.runTasks('compile-all', [
  () => co(function * () {
    for (let lang of Object.keys(loc)) {
      process.env.LANG = lang
      console.log(`Compiling ${lang} lang...`)
      yield execcli(require.resolve('./compile.js'), [], {})
    }
  })
])
