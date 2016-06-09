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
      <Html name="docs"
            wrapId="docs-wrap"
            component={ DocsComponent }
      />)
  }
})

export default DocsHtml
