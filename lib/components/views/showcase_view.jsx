/**
 * View for showcase
 * @class Showcase
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApView,
  ApViewHeader, ApViewBody
} from 'apeman-react-basic'

const ShowcaseView = React.createClass({
  render () {
    const s = this
    return (
      <ApView className="showcase-view">
        <ApViewHeader/>
        <ApViewBody>
          This is the showcase view
        </ApViewBody>
      </ApView>
    )
  }
})

module.exports = ShowcaseView

