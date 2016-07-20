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
import {description} from 'sugos/package.json'
import Snippet from '../fragments/snippet'
import Markdown, {EOL} from '../fragments/markdown'
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
      <ApView className='splash-view'>
        <ApViewBody>
          <ApJumbotron className='jumbotron'
                       imgSrc='images/jumbotron.jpg'>
            <ApJumbotronTitle className='logo-font'>SUGOS</ApJumbotronTitle>
            <ApJumbotronText>{ description }</ApJumbotronText>
          </ApJumbotron>
          <ApArticle>

            <ApSection id='splash-overview-section'>
              <ApSectionHeader></ApSectionHeader>
              <ApSectionBody>
                <div>
                  <img src='images/sugos-overview.jpeg' className='splash-overview-image'/>
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

