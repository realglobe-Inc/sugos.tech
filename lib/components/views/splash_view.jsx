/**
 * View for splash
 * @class Splash
 */
'use strict'

import React, {Component, PropTypes as types} from 'react'
import {
  ApButton,
  ApView,
  ApImage,
  ApViewHeader, ApViewBody,
  ApArticle,
  ApJumbotron, ApJumbotronTitle, ApJumbotronText,
  ApSection, ApSectionHeader, ApSectionBody
} from 'apeman-react-basic'
import {description} from 'sugos/package.json'
import Markdown, {EOL} from '../fragments/markdown'
import Footer from '../fragments/footer'
import {singleton as linkService} from '../../services/link_service'

import {singleton as snippetService} from '../../services/snippet_service'
import {singleton as markdownService} from '../../services/markdown_service'

class SplashView extends Component {
  render () {
    const s = this
    let { l } = s.props
    let _link = (...args) => linkService.resolveHtmlLink(...args)
    return (
      <ApView className='splash-view'>
        <ApViewBody>

          <ApJumbotron className='jumbotron'
                       imgSrc='images/jumbotron.jpg'>
            <ApJumbotronTitle className='logo-font'>SUGOS</ApJumbotronTitle>
            <ApJumbotronText>{ description }</ApJumbotronText>
            <p className='splash-button-container'>
              <ApButton href={ _link('docs.html') }> { l('buttons.GET_STARTED') } </ApButton>
            </p>
          </ApJumbotron>
          <ApArticle>
            <SplashView.Section id='splash-about-section'
                                markdownName='01.about-this'/>
            <SplashView.Section id='splash-how-section'
                                title={ l('captions.HOW_IT_WORKS') }
                                markdownName={ '02.how-it-works' }/>
            <SplashView.Section id='splash-why-section'
                                title={ l('captions.WHAT_TO_USE') }
                                markdownName={ '03.what-to-use' }/>
          </ApArticle>
          <Footer l={ l }/>
        </ApViewBody>
      </ApView>
    )
  }

  static Section ({ id, title = null, markdownName }) {
    return (
      <ApSection id={ id }>
        <ApSectionHeader>{ title }</ApSectionHeader>
        <ApSectionBody>
          <Markdown src={ markdownService.getMarkdown(markdownName) }/>
        </ApSectionBody>
      </ApSection>
    )
  }
}

module.exports = SplashView

