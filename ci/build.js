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
const React = require('react')
const ReactDOM = require('react-dom/server')
const ababelReact = require('ababel-react')
const ababelReactTransform = require('ababel-react/transform')
const ascss = require('ascss')
const abrowserify = require('abrowserify')
const loc = require('../loc')
const lang = String(process.env.LANG || 'en').split(/[_\.]/g).shift()
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
    'lib/**/.*.bud',
    'test/.*.bud'
  ]),
  () => {
    let libDir = `${__dirname}/../lib`
    let shimDir = `${__dirname}/../shim/node`
    return ababelReact('**/+(*.jsx|*.js)', {
      cwd: libDir,
      out: shimDir
    })
  },
  () => co(function * () {
    const copies = {
      'node_modules/sugos/assets/images/sugos-overview.jpeg': 'public/images/sugos-overview.jpeg'
    }
    for (let src of Object.keys(copies)) {
      let dest = copies[ src ]
      yield filecopy(src, dest, { mkdirp: true })
    }
  }),
  () => co(function * () {
    const links = {
      'assets/videos': 'public/videos',
      'assets/fonts': 'public/fonts',
      'assets/images': 'public/images',
      'assets/index.html': 'public/index.html'
    }
    for (let src of Object.keys(links)) {
      let dest = links[ src ]
      yield filelink(src, dest, { force: true })
    }
  }),
  () => co(function * () {
    const entrypointDir = 'lib/entrypoints'
    let filenames = yield aglob('*_entrypoint.jsx', {
      cwd: entrypointDir
    })
    for (let filename of filenames) {
      yield abrowserify(
        path.join(entrypointDir, filename),
        path.join(`${publicDir}/javascripts`, filename.replace(/_entrypoint\.jsx$/, '.js')),
        {
          debug: true,
          extensions: [ '.jsx' ],
          transforms: [
            ababelReactTransform()
          ]
        }
      )
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
        path: path.resolve(publicHtmlDir, filename.replace(/\_html\.jsx$/, '.html')),
        mkdirp: true,
        force: true,
        tmpl: (data) => {
          let { component, props } = data
          let element = React.createElement(component.default || component, props || {})
          return ReactDOM.renderToStaticMarkup(element)
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
