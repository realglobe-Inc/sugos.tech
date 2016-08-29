/**
 * Prerender contents for index.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import pkg from '../../package.json'

import {ApHtml, ApHead, ApBody, ApStyle} from 'apeman-react-basic'
import {ApThemeStyle} from 'apeman-react-theme'
import loc from '../../loc'
import * as snippets from '../constants/snippet_constants'
import * as markdowns from '../constants/markdown_constants'
import {DOMINANT} from '../constants/color_constants'
import {highlightJsx} from 'ape-highlighting'
import {singleton as localeService} from '../services/locale_service'

const { l, setLoc, setLang } = localeService

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
    return (
      <ApHtml>
        <ApHead chaset="utf-8"
                title={ s.getTitle() }
                version={ pkg.version }
                icon={ 'images/favicon.svg' }
                css={ s.getCss() }
                js={ s.getJs() }
                viewport={ { initialScale: 1 } }
                globals={ { loc, snippets, lang, markdowns: markdowns[ lang ] } }
                base={ base }
        >
          <ApThemeStyle dominant={ DOMINANT }/>
          <ApStyle>
            { highlightJsx.style() }
          </ApStyle>
        </ApHead>
        <ApBody style={ { padding: 5 } }>
          <div id={ props.wrapId }>
            <props.component />
          </div>
        </ApBody>
      </ApHtml>
    )
  },

  componentWillMount () {
    const s = this
    let { props } = s
    let { lang } = props
    setLang(lang)
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
    return []
      .concat(props.js || [])
  },

  getTitle () {
    const s = this
    let { props } = s
    return [
      props.title && l(`titles.${props.title}`),
      l('titles.UI_TITLE')
    ]
      .filter((component) => !!component)
      .join(' - ')
  }

})

export default Html
