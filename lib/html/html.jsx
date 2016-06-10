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
import {highlightJsx} from 'ape-highlighting'

const Html = React.createClass({
  propTypes: {
    js: types.arrayOf(types.string),
    css: types.arrayOf(types.string),
    wrapId: types.string.isRequired,
    component: types.func,
    base: types.string,
    lang: types.string
  },

  getDefaultProps () {
    return {
      base: '..',
      lang: 'en'
    }
  },

  render () {
    const s = this
    let { props } = s
    let { base, lang } = props
    let locale = s.getLocale()
    return (
      <ApHtml>
        <ApHead chaset="utf-8"
                title={ s.getTitle() }
                version={ pkg.version }
                icon={ 'images/favicon.png' }
                css={ s.getCss() }
                js={ s.getJs() }
                viewport={ { initialScale: 1 } }
                globals={ { locale, snippets, lang } }
                base={ base }
        >
          <ApThemeStyle dominant={ DOMINANT }/>
          <ApFaIconStyle />
          <ApIonIconStyle />
          <ApBackgroundStyle />
          <ApStyle>
            { highlightJsx.style() }
          </ApStyle>
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
    return [ 'stylesheets/base.css' ]
      .concat(props.css || [])
  },

  getJs () {
    const s = this
    let { props } = s
    return [ 'javascripts/external.cc.js' ]
      .concat(props.js || [])
  },

  getTitle () {
    const s = this
    let { props } = s
    let l = s.getLocale()
    return [
      l.titles[ props.title ],
      l.titles[ 'UI_TITLE' ]
    ]
      .filter((component) => !!component)
      .join(' - ')
  },

  getLocale () {
    const s = this
    let { props } = s
    return loc[ props.lang ]
  }
})

export default Html
