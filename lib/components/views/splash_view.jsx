/**
 * View for splash
 * @class Splash
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApView,
  ApImage,
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

            <ApSection id="splash-overview-section">
              <ApSectionHeader></ApSectionHeader>
              <ApSectionBody>
                <Snippet src={ snippetService.getSnippet('exampleUsage') }/>
              </ApSectionBody>
            </ApSection>
            <ApSection id="splash-overview-section">
              <ApSectionHeader></ApSectionHeader>
              <ApSectionBody>
                <ApImage src="../images/structure.png"
                         width="100%"
                         height="300px"
                         scale="fit"
                />
              </ApSectionBody>
            </ApSection>
          </ApArticle>
        </ApViewBody>
      </ApView>
    )
  },
  componentDidMount () {

  }
})

module.exports = SplashView

