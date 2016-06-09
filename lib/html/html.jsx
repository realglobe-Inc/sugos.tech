/**
 * Prerender contents for index.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import pkg from '../../package.json'

import {ApHtml, ApHead, ApBody, ApFaIconStyle, ApIonIconStyle} from 'apeman-react-basic'
import {ApThemeStyle} from 'apeman-react-theme'
import {ApBackgroundStyle} from 'apeman-react-background'
import loc from '../../loc'
import {DOMINANT} from '../colors.json'

const FAVICON_URL = 'https://raw.githubusercontent.com/apeman-asset-labo/apeman-asset-images/master/dist/favicon/mock-favicon.png'
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
                globals={ { locale } }
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
    return [ '../css/base.css' ]
      .concat(props.css || [])
  },

  getJs () {
    const s = this
    let { props } = s
    return [ '../js/external.cc.js' ]
      .concat(props.js || [])
  },

  getTitle () {
    const s = this
    let { props } = s
    return [
      pkg.name,
      locale.titles[ props.title ]
    ]
      .filter((component) => !!component)
      .join(' - ')
  }
})

export default Html