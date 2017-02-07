#!/usr/bin/env node

/**
 * Deploy docs to github pages
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const apeDeploying = require('ape-deploying')
const { execcli } = apeTasking

const publicDir = 'public'
const ghPagesDir = 'doc/ghpages'

apeTasking.runTasks('deploy', [
  () => execcli('rm', [ '-rf', ghPagesDir ]),
  () => execcli('mkdir', [ '-p', ghPagesDir ]),
  () => execcli('cp', [ '-r', publicDir, ghPagesDir ]),
  () => apeDeploying.deployGhPages(ghPagesDir)
], true)
