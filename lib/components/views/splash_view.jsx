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
import {ApLocaleMixin} from 'apeman-react-mixins'
import Snippet from '../fragments/snippet'
import Footer from '../fragments/footer'

import {singleton as snippetService} from '../../services/snippet_service'

const SplashView = React.createClass({
  getInitialState () {
    return {}
  },
  mixins: [
    ApLocaleMixin
  ],
  render () {
    const s = this
    let l = s.getLocale()
    return (
      <ApView className="splash-view">
        <ApViewBody>
          <ApJumbotron className="jumbotron"
                       imgSrc="images/jumbotron.jpg">
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
            <ApSection id="splash-mechanism-section">
              <ApSectionHeader>{ l('sections.SPLASH_MECHANISM_TITLE') }</ApSectionHeader>
              <ApSectionBody>
                <div>
                  <img src="images/structure.png" height="300"/>
                </div>
              </ApSectionBody>
            </ApSection>
          </ApArticle>
          <Footer />
        </ApViewBody>
      </ApView>
    )
  },
  componentDidMount () {

  }
})

module.exports = SplashView

