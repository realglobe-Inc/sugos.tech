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
import Markdown, {EOL} from '../fragments/markdown'
import {singleton as snippetService} from '../../services/snippet_service'

const GuideView = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  getInitialState () {
    return {
      toggle: 'QUICK_START'
    }
  },
  render () {
    const s = this
    let { props, state } = s
    let l = s.getLocale()

    let _section = s._renderSection
    let _ifToggle = (value, components) => value === state.toggle ? components : null

    return (
      <ApView className="guide-view">
        <ApViewHeader titleText={ l('titles.GUIDES_TITLE') }/>
        <ApViewBody>
          <div className="guide-toggle-container">
            <ApToggle value={ state.toggle }
                      options={ s.getToggleOptions() }
                      onToggle={ s.handleToggle }
            />
          </div>
          <div>
            <ApArticle>
              {
                _ifToggle('QUICK_START', [
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
                ])
              }
              {
                _ifToggle('REFERENCES', [
                  'No reference available yet'
                ])
              }

              {
                _ifToggle('TIPS', [
                  'No tips available yet'
                ])
              }
            </ApArticle>
          </div>
        </ApViewBody>
      </ApView>
    )
  },

  // ------------------
  // Custom
  // ------------------

  handleToggle (e) {
    const s = this
    s.setState({ toggle: e.data })
  },

  getToggleOptions () {
    const s = this
    let l = s.getLocale()
    return {
      QUICK_START: (<span>{ l('toggles.QUICK_START') }</span>),
      REFERENCES: (<span>{ l('toggles.REFERENCES') }</span>),
      TIPS: (<span>{ l('toggles.TIPS') }</span>)
    }
  },

  // ------------------
  // Private
  // ------------------

  _renderSection (name, config) {
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
              <Markdown src={ [].concat(text).join(EOL + EOL) }/>
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

})

module.exports = GuideView

