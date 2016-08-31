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
import SNS from '../fragments/sns'
import {singleton as linkService} from '../../services/link_service'

import {singleton as snippetService} from '../../services/snippet_service'
import {singleton as markdownService} from '../../services/markdown_service'
import {get} from 'bwindow'

class SplashView extends Component {
  render () {
    const s = this
    let { l } = s.props
    let _link = (...args) => linkService.resolveHtmlLink(...args)

    let pathname = get('location.pathname')
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
          <SNS />
          <ApArticle>
            <SplashView.Section pathname={ pathname }
                                id='splash-about-section'
                                markdownName='01.about-this'/>
            <SplashView.Section pathname={ pathname }
                                id='splash-how-section'
                                title={ l('captions.HOW_IT_WORKS') }
                                markdownName={ '02.how-it-works' }/>
            <SplashView.Section pathname={ pathname }
                                id='splash-why-section'
                                title={ l('captions.WHAT_TO_USE') }
                                markdownName={ '03.what-to-use' }/>
          </ApArticle>
          <Footer l={ l }/>
        </ApViewBody>
      </ApView>
    )
  }

  static Section ({ pathname, id, title = null, markdownName }) {
    let markdown = markdownService.getMarkdown(markdownName)
    markdown = markdown && markdown.replace(/\]\(\.\//g, `](${pathname}/../`)
    return (
      <ApSection id={ id }>
        <ApSectionHeader>{ title }</ApSectionHeader>
        <ApSectionBody>
          <Markdown src={ markdown }/>
        </ApSectionBody>
      </ApSection>
    )
  }
}

module.exports = SplashView

