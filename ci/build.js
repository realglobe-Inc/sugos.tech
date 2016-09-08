#!/usr/bin/env node

/**
 * Build this project.
 */

'use strict'
require('ababel-react/register')()

process.chdir(`${__dirname}/..`)

const { runTasks } = require('ape-tasking')
const coz = require('coz')

const path = require('path')
const co = require('co')
const aglob = require('aglob')
const filecopy = require('filecopy')
const filelink = require('filelink')
const { markup } = require('breact')
const ababelReactTransform = require('ababel-react/transform')
const ascss = require('ascss')
const abrowserify = require('abrowserify')
const amap = require('amap')
const loc = require('../loc')
// const lang = String(process.env.LANG || 'en').split(/[_\.]/g).shift()
const lang ='en'
if (!loc[ lang ]) {
  throw new Error(`Unknown lang: ${lang}`)
}

const publicDir = 'public'
const publicHtmlDir = `${publicDir}/html/${lang}`
const base = '../..'

let isForked = !!process.send

runTasks('build', [
  () => coz.render([
    '.*.bud',
    'assert/**/.*.bud',
    'lib/**/.*.bud',
    'test/.*.bud'
  ]),
  () => co(function * () {
    const copies = {
      'node_modules/sugos/asset/images/sugos-overview.jpeg': 'public/images/sugos-overview.jpeg'
    }
    for (let src of Object.keys(copies)) {
      let dest = copies[ src ]
      yield filecopy(src, dest, { mkdirp: true })
    }
  }),
  () => co(function * () {
    const links = {
      'asset/videos': 'public/videos',
      'asset/fonts': 'public/fonts',
      'asset/images': 'public/images',
      'asset/index.html': 'public/index.html',
      'doc/api': 'asset/markdowns/en/api'
    }
    for (let src of Object.keys(links)) {
      let dest = links[ src ]
      yield filelink(src, dest, { force: true })
    }
  }),
  () => co(function * () {
    const externals = require('./configs/external_config')
    const entrypointDir = 'lib/entrypoints'
    let filenames = yield aglob('*_entrypoint.jsx', {
      cwd: entrypointDir
    })
    for (let filename of filenames) {
      let dest = path.join(`${publicDir}/javascripts`, filename.replace(/_entrypoint\.jsx$/, '.js'))
      let src = path.join(entrypointDir, filename)
      yield abrowserify(src, dest, {
        debug: true,
        externals,
        extensions: [ '.jsx' ],
        transforms: [
          [ require('abrowserify/transforms/json_transform'), { pattern: '**/lib/constants/*.*' } ],
          [ ababelReactTransform() ]
        ]
      })
      yield amap(dest)
    }
  }),
  () => co(function * () {
    let filenames = yield aglob('*.scss', {
      cwd: 'lib/stylesheets'
    })
    for (let filename of filenames) {
      let lib = path.join('lib/stylesheets', filename)
      let dest = path.join(`${publicDir}/stylesheets`, filename.replace(/\.scss$/, '.css'))
      yield ascss(lib, dest)
    }
  }),
  () => co(function * () {
    let htmlDir = 'lib/html'
    let filenames = yield aglob('*_html.jsx', {
      cwd: htmlDir
    })
    yield coz.render(
      filenames.map((filename) => ({
        path: path.resolve(publicHtmlDir, filename.replace(/_html\.jsx$/, '.html')),
        mkdirp: true,
        force: true,
        tmpl: ({ component, props }) => {
          return markup(component, props)
        },
        data: {
          component: require(path.resolve(htmlDir, filename)),
          props: { base, lang }
        }
      }))
    )
  })
], !isForked)

process.on('message', (message) => {
  if (message.rerun) {
    runTasks.rerun()
  }
})
