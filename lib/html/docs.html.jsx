/**
 * Prerender contents for docs.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import DocsComponent from '../components/docs.component'
import {DOMINANT} from '../constants/color_constants.json'

import Html from './html'

const DocsHtml = React.createClass({
  render () {
    const s = this
    return (
      <Html js={ ['../javascripts/docs.js'] }
            css={ ['../stylesheets/docs.css'] }
            wrapId="docs-wrap"
            title="DOCS_PAGE_TITLE"
            component={ DocsComponent }
      />)
  }
})

export default DocsHtml
