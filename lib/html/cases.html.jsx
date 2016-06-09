/**
 * Prerender contents for cases.html
 */

'use strict'

import React, {PropTypes as types} from 'react'
import CasesComponent from '../components/cases.component'
import {DOMINANT} from '../colors.json'

import Html from './html'

const CasesHtml = React.createClass({
  render () {
    const s = this
    return (
      <Html js={ ['../js/cases.js'] }
            css={ ['../css/cases.css'] }
            wrapId="cases-wrap"
            title="CASES_TITLE"
            component={ CasesComponent }
      />)
  }
})

export default CasesHtml