/**
 * Prerender contents for index.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import pkg from '../../package.json'

import {ApHtml, ApHead, ApBody, ApFaIconStyle, ApIonIconStyle} from 'apeman-react-basic'
import {ApThemeStyle} from 'apeman-react-theme'
import {ApBackgroundStyle} from 'apeman-react-background'

import IndexComponent from '../components/index.component'
import loc from '../../loc'
import {DOMINANT} from '../colors.json'

const FAVICON_URL = 'https://raw.githubusercontent.com/apeman-asset-labo/apeman-asset-images/master/dist/favicon/mock-favicon.png'

const locale = loc[ 'en' ] // TODO multi lang

const IndexHtml = React.createClass({
  componentWillMount () {
    const s = this
    let { props } = s
  },

  render () {
    return (
      <ApHtml>
        <ApHead chaset="utf-8"
                title={ pkg.name }
                version={ pkg.version }
                icon={ FAVICON_URL }
                css={ [ '../css/base.css', '../css/index.css' ] }
                js={ [ '../js/external.cc.js', '../js/index.js' ] }
                viewport={ { initialScale: 1 } }
                globals={ { locale } }
        >
          <ApThemeStyle dominant={ DOMINANT }/>
          <ApFaIconStyle />
          <ApIonIconStyle />
          <ApBackgroundStyle />
        </ApHead>
        <ApBody style={ {padding: 5} }>
          <div id="index-wrap">
            <IndexComponent locale={ locale }/>
          </div>
        </ApBody>
      </ApHtml>
    )
  }
})

export default IndexHtml
