/**
 * Prerender contents for index.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import pkg from '../../package.json'

import {ApHtml, ApHead, ApBody, ApStyle, ApFaIconStyle, ApIonIconStyle} from 'apeman-react-basic'
import {ApThemeStyle} from 'apeman-react-theme'
import {ApBackgroundStyle} from 'apeman-react-background'
import loc from '../../loc'
import * as snippets from '../constants/snippet_constants'
import {DOMINANT} from '../constants/color_constants'

const FAVICON_URL = '../images/favicon.png'
const { LANG } = process.env
const locale = loc[ LANG || 'en' ]
if (!locale) {
  throw new Error(`Unknown lang: ${LANG}`)
}

const Html = React.createClass({
  propTypes: {
    js: types.arrayOf(types.string),
    css: types.arrayOf(types.string),
    wrapId: types.string.isRequired,
    component: types.func
  },

  render () {
    const s = this
    let { props } = s

    return (
      <ApHtml>
        <ApHead chaset="utf-8"
                title={ s.getTitle() }
                version={ pkg.version }
                icon={ FAVICON_URL }
                css={ s.getCss() }
                js={ s.getJs() }
                viewport={ { initialScale: 1 } }
                globals={ { locale, snippets } }
        >
          <ApThemeStyle dominant={ DOMINANT }/>
          <ApFaIconStyle />
          <ApIonIconStyle />
          <ApBackgroundStyle />
        </ApHead>
        <ApBody style={ {padding: 5} }>
          <div id={ props.wrapId }>
            <props.component locale={ locale }/>
          </div>
        </ApBody>
      </ApHtml>
    )
  },

  getCss () {
    const s = this
    let { props } = s
    return [ '../stylesheets/base.css' ]
      .concat(props.css || [])
  },

  getJs () {
    const s = this
    let { props } = s
    return [ '../javascripts/external.cc.js' ]
      .concat(props.js || [])
  },

  getTitle () {
    const s = this
    let { props } = s
    return [
      locale.titles[ props.title ],
      locale.titles[ 'UI_TITLE' ]
    ]
      .filter((component) => !!component)
      .join(' - ')
  }
})

export default Html
