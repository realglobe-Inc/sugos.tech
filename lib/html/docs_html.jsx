/**
 * Prerender contents for docs.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import DocsComponent from '../components/docs_component'
import {DOMINANT} from '../constants/color_constants.json'

import Html from './html'

const DocsHtml = React.createClass({
  render () {
    const s = this
    let { props } = s
    return (
      <Html { ...props }
        js={ ['javascripts/docs.js'] }
        css={ ['stylesheets/docs.css'] }
        wrapId="docs-wrap"
        title="DOCS_PAGE_TITLE"
        component={ DocsComponent }
      />)
  }
})

export default DocsHtml
