#!/usr/bin/env node
/**
 * Generate favicon
 */
'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const { execcli } = apeTasking

const { DOMINANT } = require('../lib/constants/color_constants.json')

apeTasking.runTasks('favicon', [
  () => execcli('fur', [
    'favicon', 'lib/images/favicon.png', {
      color: DOMINANT,
      font: 'd',
      text: 'S'
    }
  ])
])
