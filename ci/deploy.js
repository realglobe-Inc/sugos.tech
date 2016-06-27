#!/usr/bin/env node

/**
 * Deploy docs to github pages
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const apeDeploying = require('ape-deploying')
const { execcli } = apeTasking

// For proxy (see https://github.com/comsysto/github-pages-basic-auth-proxy )
const OBFUSCATOR = '9ebb3fa7-66d9-4554-8b86-fb2308040afe'

const publicDir = 'public'
const ghPagesDir = 'doc/ghpages'

apeTasking.runTasks('deploy', [
  () => execcli('rm', [ '-rf', ghPagesDir ]),
  () => execcli('mkdir', [ '-p', ghPagesDir ]),
  () => execcli('cp', [ '-r', publicDir, `${ghPagesDir}/${OBFUSCATOR}` ]),
  () => execcli('git', [ 'add', '-A', ghPagesDir ]),
  // コミットするものがない場合に exit code 1 で落ちるので
  () => execcli('git', [ 'commit', '-m', 'Update Github Pages', ghPagesDir ]).catch((e) => { console.error(e) }),
  () => apeDeploying.deployGhPages(ghPagesDir)
], true)
