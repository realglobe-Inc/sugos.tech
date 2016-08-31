/**
 * View for guide
 * @class Guide
 */
'use strict'

import React, {Component, PropTypes as types} from 'react'
import {
  ApView,
  ApViewHeader, ApViewBody,
  ApSection, ApSectionHeader, ApSectionBody,
  ApArticle,
  ApToggle,
  ApAccordion, ApAccordionArrow, ApAccordionHeader, ApAccordionBody
} from 'apeman-react-basic'
import {save, restore} from 'bstorage'

import Snippet from '../fragments/snippet'
import {get} from 'bwindow'
import abind from 'abind'
import Markdown, {EOL} from '../fragments/markdown'
import {singleton as snippetService} from '../../services/snippet_service'
import {singleton as markdownService} from '../../services/markdown_service'
import {spinalcase} from 'stringcase'

const STORAGE_KEY = 'guide.state'

const tips = [
  'tip-module-variations'
]

class GuideView extends Component {
  constructor (props) {
    super(props)
    const s = this
    abind(s)
    s.state = restore(STORAGE_KEY) || { toggle: 'QUICK_START' }
  }

  render () {
    const s = this
    let { props, state } = s
    let { l } = props

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
              {
                _ifToggle('QUICK_START', [
                  <div className='guide-lead' key='lead'>
                    <p>{ l('leads.QUICK_START_LEAD_01') }</p>
                    <ol>
                      <li><a href={ `${pathname}#hub-setup` }>{ l('titles.GUIDE_CLOUD_TITLE') }</a></li>
                      <li><a href={ `${pathname}#actor-run` }>{ l('titles.GUIDE_ACTOR_TITLE') }</a></li>
                      <li><a href={ `${pathname}#caller-use` }>{ l('titles.GUIDE_CALLER_TITLE') }</a></li>
                    </ol>
                    <Markdown src={ markdownService.getMarkdown('10.quick-start.md') }/>
                  </div>,
                  <GuideView.Section key='01' name='hub-setup' { ...{
                    title: l('titles.GUIDE_CLOUD_TITLE'),
                    markdown: markdownService.getMarkdown('11.setup-hub'),
                    snippet: snippetService.getSnippet('exampleCloud')
                  } }/>,
                  <GuideView.Section key='02' name='actor-run' { ...{
                    title: l('titles.GUIDE_ACTOR_TITLE'),
                    markdown: markdownService.getMarkdown('12.declare-on-sugo-actor'),
                    snippet: snippetService.getSnippet('exampleActor')
                  } }/>,
                  <GuideView.Section key='03' name='caller-use' { ...{
                    title: l('titles.GUIDE_CALLER_TITLE'),
                    markdown: markdownService.getMarkdown('13.call-from-sugo-caller'),
                    snippet: snippetService.getSnippet('exampleCaller')
                  } }/>
                ])
              }
              {
                _ifToggle('REFERENCES', [
                  <h3 className='guide-heading'>{ l('headings.REFERENCE_API') }</h3>,
                  <GuideView.Accordion key='01' name='hub-api' { ...{
                    title: l('accordions.HUB_API'),
                    open: state[ 'accordion.hub' ],
                    onToggle: () => s.flipState('accordion.hub'),
                    markdown: markdownService.getMarkdown('hub')
                  } }/>,
                  <GuideView.Accordion key='02' name='actor-api' { ...{
                    title: l('accordions.ACTOR_API'),
                    open: state[ 'accordion.actor' ],
                    onToggle: () => s.flipState('accordion.actor'),
                    markdown: markdownService.getMarkdown('actor')
                  } }/>,
                  <GuideView.Accordion key='03' name='caller-api' { ...{
                    title: l('accordions.CALLER_API'),
                    open: state[ 'accordion.caller' ],
                    onToggle: () => s.flipState('accordion.caller'),
                    markdown: markdownService.getMarkdown('caller')
                  } }/>,
                  <br/>,
                  <h3 className='guide-heading'>{ l('headings.REFERENCE_README') }</h3>,
                  <GuideView.ReadMeLink />
                ])
              }

              {
                _ifToggle('TIPS', [
                  ...tips.map((tip) =>
                    <GuideView.Tip key={tip}
                                   id={ spinalcase(tip) }
                                   markdown={ markdownService.getMarkdown(tip) }/>
                  )
                ])
              }
            </ApArticle>
          </div>
        </ApViewBody>
      </ApView>
    )
  }

  // ------------------
  // LifeCycle
  // ------------------
  componentDidUpdate () {
    const s = this
    save(STORAGE_KEY, s.state)
  }

  // ------------------
  // Custom
  // ------------------

  handleToggle (e) {
    const s = this
    s.setState({ toggle: e.data })
  }

  getToggleOptions () {
    const s = this
    let { l } = s.props
    return {
      QUICK_START: (<span>{ l('toggles.QUICK_START') }</span>),
      REFERENCES: (<span>{ l('toggles.REFERENCES') }</span>),
      TIPS: (<span>{ l('toggles.TIPS') }</span>)
    }
  }

  flipState (key) {
    const s = this
    s.setState({ [key]: !s.state[ key ] })
  }

  // ------------------
  // Sub components
  // ------------------

  static Section ({ name, title, markdown, snippet }) {
    return (
      <ApSection id={ `guide-${name}-section` }
                 className='guide-section'
                 key={ name }
      >
        <a name={ name }>
        </a>
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

  static Tip ({ markdown }) {
    return (
      <div className="guide-tip">
        <Markdown src={ markdown }/>
      </div>
    )
  }

  static Accordion ({ name, title, open, onToggle, markdown }) {
    return (
      <ApAccordion key={ name } open={ open }
                   className='guide-accordion'
      >
        <ApAccordionHeader onToggle={ onToggle }>
          <ApAccordionArrow />
          { title }
        </ApAccordionHeader>
        <ApAccordionBody>
          <Markdown src={ markdown }/>
        </ApAccordionBody>
      </ApAccordion>
    )
  }

  static ReadMeLink () {
    let links = {
      'SUGO-Hub': 'https://github.com/realglobe-Inc/sugo-hub#readme',
      'SUGO-Actor': 'https://github.com/realglobe-Inc/sugo-actor#readme',
      'SUGO-Caller': 'https://github.com/realglobe-Inc/sugo-caller#readme'
    }
    return (
      <ul className='guide-readme-link-list'>
        {
          Object.keys(links).map((name) => (
            <li key={ name }>
              <a href={ links[ name ] }>
                <img src="images/GitHub-Mark-64px.png" alt=""/>
                README of { name }
              </a>
            </li>
          ))
        }
      </ul>
    )
  }
}

module.exports = GuideView

