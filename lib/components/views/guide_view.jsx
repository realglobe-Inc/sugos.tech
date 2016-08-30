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

import Snippet from '../fragments/snippet'
import {get} from 'bwindow'
import Markdown, {EOL} from '../fragments/markdown'
import {singleton as snippetService} from '../../services/snippet_service'
import {singleton as markdownService} from '../../services/markdown_service'

const GuideView = React.createClass({
  mixins: [],
  getInitialState () {
    return {
      toggle: 'QUICK_START'
    }
  },
  render () {
    const s = this
    let { props, state } = s
    let { l } = props

    let _section = s._renderSection
    let _ifToggle = (value, components) => value === state.toggle ? components : null

    let pathname = get('location.pathname')
    return (
      <ApView className='guide-view'>
        <ApViewHeader titleText={ l('titles.GUIDES_TITLE') }/>
        <ApViewBody>
          <div className='guide-toggle-container'>
            <ApToggle value={ state.toggle }
                      options={ s.getToggleOptions() }
                      onToggle={ s.handleToggle }
            />
          </div>
          <div>
            <ApArticle>
              <div className='guide-lead'>
                <p>{ l('leads.QUICK_START_LEAD_01') }</p>
                <ol>
                  <li><a href={ `${pathname}#hub-setup` }>{ l('titles.GUIDE_CLOUD_TITLE') }</a></li>
                  <li><a href={ `${pathname}#actor-run` }>{ l('titles.GUIDE_ACTOR_TITLE') }</a></li>
                  <li><a href={ `${pathname}#caller-use` }>{ l('titles.GUIDE_CALLER_TITLE') }</a></li>
                </ol>
                <Markdown src={ markdownService.getMarkdown('10.quick-start.md') }/>
              </div>
              {
                _ifToggle('QUICK_START', [
                  _section('hub-setup', {
                    title: l('titles.GUIDE_CLOUD_TITLE'),
                    markdown: markdownService.getMarkdown('11.setup-hub'),
                    snippet: snippetService.getSnippet('exampleCloud')
                  }),
                  _section('actor-run', {
                    title: l('titles.GUIDE_ACTOR_TITLE'),
                    markdown: markdownService.getMarkdown('12.declare-on-sugo-actor'),
                    snippet: snippetService.getSnippet('exampleActor')
                  }),
                  _section('caller-use', {
                    title: l('titles.GUIDE_CALLER_TITLE'),
                    markdown: markdownService.getMarkdown('13.call-from-sugo-caller'),
                    snippet: snippetService.getSnippet('exampleCaller')
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
    let { l } = s.props
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
    const s = this
    let { title, markdown, snippet } = config
    let { l } = s.props
    return (
      <ApSection id={ `guide-${name}-section` }
                 className='guide-section'
                 key={ name }
      >
        <a name={ name }></a>
        <ApSectionHeader>{ title }</ApSectionHeader>
        <ApSectionBody>
          <div className='guide-text-container'>
            <div className='guide-description'>
              <Markdown src={ markdown }/>
            </div>
          </div>
          <div className='guide-image-container'>
            <div className='guide-snippet'>
              <Snippet src={ snippet }/>
            </div>
          </div>
        </ApSectionBody>
      </ApSection>
    )
  }

})

module.exports = GuideView

