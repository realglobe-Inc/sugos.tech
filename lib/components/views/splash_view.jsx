/**
 * View for splash
 * @class Splash
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApView,
  ApViewHeader, ApViewBody,
  ApArticle,
  ApJumbotron, ApJumbotronTitle, ApJumbotronText,
  ApSection, ApSectionHeader, ApSectionBody
} from 'apeman-react-basic'

import Snippet from '../fragments/snippet'
import {singleton as snippetService} from '../../services/snippet_service'

const SplashView = React.createClass({
  getInitialState () {
    return {}
  },
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
          <ApArticle>
            <Snippet src={ snippetService.getSnippet('exampleCloud') }/>
          </ApArticle>
        </ApViewBody>
      </ApView>
    )
  },
  componentDidMount () {

  }
})

module.exports = SplashView

