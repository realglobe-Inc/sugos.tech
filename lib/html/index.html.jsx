/**
 * Prerender contents for index.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import pkg from '../../package.json'

import {ApHtml, ApHead, ApBody, ApFaIconStyle, ApIonIconStyle} from 'apeman-react-basic'
import {ApThemeStyle} from 'apeman-react-theme'

import IndexComponent from '../components/index.component'

const FAVICON_URL = 'https://raw.githubusercontent.com/apeman-asset-labo/apeman-asset-images/master/dist/favicon/mock-favicon.png'
const DOMINANT_COLOR = '#38A'

const IndexHtml = React.createClass({
  render () {
    return (
      <ApHtml>
        <ApHead chaset="utf-8"
                title={ pkg.name }
                version={ pkg.version }
                icon={ FAVICON_URL }
                css={ [ '../css/index.css' ] }
                js={ [ '../js/external.cc.js', '../js/index.js' ] }>
          <ApThemeStyle dominant={ DOMINANT_COLOR }/>
          <ApFaIconStyle />
          <ApIonIconStyle />
        </ApHead>
        <ApBody style={ {padding: 5} }>
          <div id="index-wrap">
            <IndexComponent />
          </div>
        </ApBody>
      </ApHtml>
    )
  }
})

export default IndexHtml
