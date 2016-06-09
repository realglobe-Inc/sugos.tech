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
    name: types.string,
    wrapId: types.string.isRequired,
    component: types.func
  },
  render () {
    const s = this
    let { props } = s
    let title = pkg.name
    var subTitle = locale.titles[ `${String(props.name).toUpperCase()}_NAME` ]
    if (subTitle) {
      title = [ subTitle, title ].join(' - ')
    }
    return (
      <ApHtml>
        <ApHead chaset="utf-8"
                title={ title }
                version={ pkg.version }
                icon={ FAVICON_URL }
                css={ [ '../css/base.css', '../css/index.css' ] }
                js={ [ '../js/external.cc.js', `../js/${props.name}.js`] }
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
  }
})

export default Html
