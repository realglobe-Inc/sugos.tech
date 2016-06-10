/**
 * Prerender contents for index.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import IndexComponent from '../components/index.component'
import {DOMINANT} from '../constants/color_constants.json'

import Html from './html'

const IndexHtml = React.createClass({
  render () {
    const s = this
    let { props } = s
    return (
      <Html { ...props }
        js={ ['javascripts/index.js'] }
            css={ ['stylesheets/index.css'] }
            wrapId="index-wrap"
            component={ IndexComponent }
      />)
  }
})

export default IndexHtml
