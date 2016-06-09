/**
 * View for splash
 * @class Splash
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApView,
  ApViewHeader, ApViewBody,
  ApJumbotron, ApJumbotronTitle, ApJumbotronText
} from 'apeman-react-basic'

const SplashView = React.createClass({
  render () {
    const s = this
    return (
      <ApView className="splash-view">
        <ApViewBody>
          <ApJumbotron className="jumbotron"
                       imgSrc="../images/jumbotron.jpg">
            <ApJumbotronTitle className="logo-font">SUGOS</ApJumbotronTitle>
            <ApJumbotronText>Super Ultra Gorgeous Outstanding Special</ApJumbotronText>
          </ApJumbotron>
        </ApViewBody>
      </ApView>
    )
  }
})

module.exports = SplashView

