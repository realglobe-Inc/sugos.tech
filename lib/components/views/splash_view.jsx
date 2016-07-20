/**
 * View for splash
 * @class Splash
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApButton,
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
import {singleton as markdownService} from '../../services/markdown_service'

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
            <p className='splash-button-container'>
              <ApButton href='./docs'> { l('buttons.GET_STARTED') } </ApButton>
            </p>
          </ApJumbotron>
          <ApArticle>
            { s._renderSection('splash-about-section', null, '01.about-this') }
            { s._renderSection('splash-how-section', l('captions.HOW_IT_WORKS'), '02.how-it-works') }
            { s._renderSection('splash-why-section', l('captions.WHAT_TO_USE'), '03.what-to-use') }
          </ApArticle>
          <Footer />
        </ApViewBody>
      </ApView>
    )
  },
  componentDidMount () {

  },

  _renderSection (id, title, markdownName) {
    return (
      <ApSection id={ id }>
        <ApSectionHeader>{ title }</ApSectionHeader>
        <ApSectionBody>
          <Markdown src={ markdownService.getMarkdown(markdownName) }></Markdown>
        </ApSectionBody>
      </ApSection>
    )
  }
})

module.exports = SplashView

