#!/usr/bin/env node

/**
 * Compile files.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const ClosureCompiler = require('closurecompiler')
const apeTasking = require('ape-tasking')
const apeCompiling = require('ape-compiling')
const co = require('co')
const fs = require('fs')

let dest = 'public/javascripts/external.js'
let destCC = 'public/javascripts/external.cc.js'

apeTasking.runTasks('postinstall', [
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
    let cc = yield new Promise((resolve, reject) =>
      ClosureCompiler.compile([
        dest
      ], {
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        warning_level: 'QUIET'
      }, (err, result) => err ? reject(err) : resolve(result))
    )
    yield new Promise((resolve, reject) =>
      fs.writeFile(destCC, cc, (err) => err ? reject(err) : resolve())
    )
    console.log(`File generated: ${destCC}`)
  })
], true)
