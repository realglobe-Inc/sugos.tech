/**
 * Prerender contents for index.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import IndexComponent from '../components/index.component'
import {DOMINANT} from '../colors.json'

import Html from './html'

const IndexHtml = React.createClass({
  render () {
    const s = this
    return (
      <Html js={ ['../javascripts/index.js'] }
            css={ ['../stylesheets/index.css'] }
            wrapId="index-wrap"
            component={ IndexComponent }
      />)
  }
})

export default IndexHtml
