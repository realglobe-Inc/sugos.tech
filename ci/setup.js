#!/usr/bin/env node

/**
 * Prepublish script.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const co = require('co')
const abrowserify = require('abrowserify')
const amap = require('amap')
let { execcli } = apeTasking
const publicDir = 'public'

apeTasking.runTasks('prepublish', [
  () => co(function * () {
    const externals = require('./configs/external_config')
    let filename = `${publicDir}/javascripts/external.js`
    yield abrowserify(
      null,
      filename,
      {
        debug: true,
        require: externals
      }
    )
    yield amap(filename)
  }),
  () => co(function * () {
    let { env } = process
    let langs = [ 'en' ]
    for (let lang of langs) {
      yield execcli('ci/build.js', [], { env: Object.assign({ LANG: lang }, env) })
    }
  })
], true)
