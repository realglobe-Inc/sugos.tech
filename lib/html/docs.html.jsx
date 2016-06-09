/**
 * Prerender contents for docs.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import DocsComponent from '../components/docs.component'
import {DOMINANT} from '../colors.json'

import Html from './html'

const DocsHtml = React.createClass({
  render () {
    const s = this
    return (
      <Html js={ ['../js/docs.js'] }
            css={ ['../css/docs.css'] }
            wrapId="docs-wrap"
            title="DOCS_TITLE"
            component={ DocsComponent }
      />)
  }
})

export default DocsHtml
