/**
 * View for showcase
 * @class Showcase
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApView,
  ApViewHeader, ApViewBody,
  ApSection, ApSectionHeader, ApSectionBody
} from 'apeman-react-basic'
import {
  ApLocaleMixin
} from 'apeman-react-mixins'

const ShowcaseView = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  render () {
    const s = this
    let l = s.getLocale()
    return (
      <ApView className="showcase-view">
        <ApViewHeader/>
        <ApViewBody>
          <article>
            <ApSection className="showcase-section"
                       id="showcase-remote-section">
              <ApSectionHeader>{ l('sections.CASE_REMOTE_TITLE') }</ApSectionHeader>
              <ApSectionBody>
                <p className="showcase-description">{ l('sections.CASE_REMOTE_TEXT') }</p>
              </ApSectionBody>
            </ApSection>

            <ApSection className="showcase-section"
                       id="showcase-sense-section">
              <ApSectionHeader>{ l('sections.CASE_SENSE_TITLE') }</ApSectionHeader>
              <ApSectionBody>
                <p className="showcase-description">{ l('sections.CASE_SENSE_TEXT') }</p>
              </ApSectionBody>
            </ApSection>

            <ApSection className="showcase-section"
                       id="showcase-talk-section">
              <ApSectionHeader>{ l('sections.CASE_TALK_TITLE') }</ApSectionHeader>
              <ApSectionBody>
                <p className="showcase-description">{ l('sections.CASE_TALK_TEXT') }</p>
              </ApSectionBody>
            </ApSection>
          </article>
        </ApViewBody>
      </ApView>
    )
  }
})

module.exports = ShowcaseView

