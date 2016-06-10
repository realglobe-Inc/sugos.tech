/**
 * View for guide
 * @class Guide
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApView,
  ApViewHeader, ApViewBody,
  ApSection, ApSectionHeader, ApSectionBody,
  ApArticle,
  ApToggle
} from 'apeman-react-basic'
import {
  ApLocaleMixin
} from 'apeman-react-mixins'

import Snippet from '../fragments/snippet'
import Markdown from '../fragments/markdown'
import {singleton as snippetService} from '../../services/snippet_service'
import {EOL} from 'os'

const GuideView = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  render () {
    const s = this
    let l = s.getLocale()

    let _section = (name, config) => {
      let { title, text, snippet } = config
      return (
        <ApSection id={ `guide-${name}-section` }
                   className="guide-section"
                   key={ name }
        >
          <ApSectionHeader>{ title }</ApSectionHeader>
          <ApSectionBody>
            <div className="guide-text-container">
              <div className="guide-description">
                <Markdown text={ [].concat(text).join(EOL + EOL) }/>
              </div>
            </div>
            <div className="guide-image-container">
              <div className="guide-snippet">
                <Snippet src={ snippet }/>
              </div>
            </div>
          </ApSectionBody>
        </ApSection>
      )
    }

    return (
      <ApView className="guide-view">
        <ApViewHeader/>
        <ApViewBody>

          <ApArticle>
            { [
              _section('cloud-setup', {
                title: l('sections.GUIDE_CLOUD_SETUP_TITLE'),
                text: l('sections.GUIDE_CLOUD_SETUP_TEXT'),
                snippet: snippetService.getSnippet('exampleCloud')
              }),
              _section('spot-run', {
                title: l('sections.GUIDE_SPOT_RUN_TITLE'),
                text: l('sections.GUIDE_SPOT_RUN_TEXT'),
                snippet: snippetService.getSnippet('exampleSpot')
              }),
              _section('terminal-use', {
                title: l('sections.GUIDE_TERMINAL_USE_TITLE'),
                text: l('sections.GUIDE_TERMINAL_USE_TEXT'),
                snippet: snippetService.getSnippet('exampleTerminal')
              })
            ]
            }
          </ApArticle>
        </ApViewBody>
      </ApView>
    )
  }

})

module.exports = GuideView

