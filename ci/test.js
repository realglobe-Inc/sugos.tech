#!/usr/bin/env node

/**
 * Run tests.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const { runTasks } = require('ape-tasking')
const {execSync} = require('child_process')

runTasks('test', [
  () => {
    execSync('./node_modules/.bin/karma start', {stdio: 'inherit'})
  }
], true)
