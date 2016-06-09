/**
 * Prerender contents for cases.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import CasesComponent from '../components/cases.component'
import {DOMINANT} from '../constants/color_constants.json'

import Html from './html'

const CasesHtml = React.createClass({
  render () {
    const s = this
    return (
      <Html js={ ['../javascripts/cases.js'] }
            css={ ['../stylesheets/cases.css'] }
            wrapId="cases-wrap"
            title="CASES_PAGE_TITLE"
            component={ CasesComponent }
      />)
  }
})

export default CasesHtml
