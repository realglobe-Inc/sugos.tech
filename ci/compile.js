#!/usr/bin/env node

/**
 * Compile files.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const apeTasking = require('ape-tasking')
const path = require('path')
const co = require('co')
const coz = require('coz')
const expandglob = require('expandglob')
const filecopy = require('filecopy')
const apeCompiling = require('ape-compiling')
const React = require('react')
const ReactDOM = require('react-dom/server')

const base = null
const publicDir = 'public'

apeTasking.runTasks('compile', [
  () => apeCompiling.compileReactJsx('**/*.jsx', {
    cwd: 'lib',
    out: 'lib'
  }),
  () => co(function * () {
    let filenames = yield expandglob('*.browser.js', {
      cwd: 'lib/browser'
    })
    for (let filename of filenames) {
      yield apeCompiling.browserifyJs(
        path.join('lib/browser', filename),
        path.join(`${publicDir}/javascripts`, filename.replace(/\.browser\.js$/, '.js')),
        {
          external: require('./config/external.config.json'),
          debug: true
        }
      )
    }
  }),
  () => co(function * () {
    let filenames = yield expandglob('*.scss', {
      cwd: 'lib/stylesheets'
    })
    for (let filename of filenames) {
      let lib = path.join('lib/stylesheets', filename)
      let dest = path.join(`${publicDir}/stylesheets`, filename.replace(/\.scss$/, '.css'))
      yield apeCompiling.compileScss(lib, dest)
    }
  }),
  () => co(function * () {
    let filenames = yield expandglob('*.html.js', {
      cwd: 'lib/html'
    })
    yield coz.render(
      filenames.map((filename) => ({
        path: path.resolve(`${publicDir}/html`, filename.replace(/\.html\.js$/, '.html')),
        mkdirp: true,
        force: true,
        tmpl: (data) => {
          let { component, props } = data
          let element = React.createElement(component.default || component, props || {})
          return ReactDOM.renderToStaticMarkup(element)
        },
        data: {
          component: require(path.resolve('lib/html', filename))
        }
      }))
    )
  }),
  () => co(function * () {
    let src = './node_modules/sugos/doc/images/structure.png'
    let dest = 'public/images/structure.png'
    let results = yield filecopy(src, dest)
    for (let filename of Object.keys(results)) {
      console.log(`File generated: ${filename}`)
    }
  })
], true)
