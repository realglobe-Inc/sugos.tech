/**
 * View for guide
 * @class Guide
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApView,
  ApViewHeader, ApViewBody
} from 'apeman-react-basic'

const GuideView = React.createClass({
  render () {
    const s = this
    return (
      <ApView className="guide-view">
        <ApViewHeader/>
        <ApViewBody>
          This is the guide view
        </ApViewBody>
      </ApView>
    )
  }
})

module.exports = GuideView

