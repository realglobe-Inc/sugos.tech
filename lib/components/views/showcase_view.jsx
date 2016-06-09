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
import Video from '../fragments/video'
import Joiner from '../fragments/joiner'

const ShowcaseView = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  render () {
    const s = this
    let l = s.getLocale()

    let _section = (name, config) => {
      let {
        title, text,
        video1, video2
      } = config
      return (
        <ApSection className="showcase-section"
                   id={ `showcase-${name}-section` }
                   key={ name }>
          <ApSectionHeader>{ title }</ApSectionHeader>
          <ApSectionBody>
            <div className="showcase-text-container">
              <div className="showcase-description">{
                [].concat(text).map((text, i) => (<p key={i}>{ text }</p>))
              }</div>
            </div>
            <div className="showcase-video-container">
              <Video className="showcase-video" { ...video1 }/>
              <Joiner className="showcase-joiner"/>
              <Video className="showcase-video" { ...video2 }/>
            </div>
          </ApSectionBody>
        </ApSection>
      )
    }
    return (
      <ApView className="showcase-view">
        <ApViewHeader titleText={ l('titles.SHOWCASE_TITLE') }/>
        <ApViewBody>
          <article>
            { [
              _section('remote', {
                title: l('sections.CASE_REMOTE_TITLE'),
                text: l('sections.CASE_REMOTE_TEXT'),
                video1: {
                  src: '../videos/mock-mp4.mp4',
                  translateX: -120,
                  translateY: -30
                },
                video2: {
                  src: '../videos/mock-mp4-2.mp4',
                  translateX: -60,
                  translateY: -40
                }
              }),
              _section('sense', {
                title: l('sections.CASE_SENSE_TITLE'),
                text: l('sections.CASE_SENSE_TEXT'),
                video1: {
                  src: '../videos/mock-mp4.mp4',
                  translateX: -60,
                  translateY: -60
                },
                video2: {
                  src: '../videos/mock-mp4-2.mp4',
                  translateX: -30,
                  translateY: 0
                }
              }),
              _section('talk', {
                title: l('sections.CASE_TALK_TITLE'),
                text: l('sections.CASE_TALK_TEXT'),
                video1: {
                  src: '../videos/mock-mp4.mp4',
                  translateX: -10,
                  translateY: -10
                },
                video2: {
                  src: '../videos/mock-mp4-2.mp4',
                  translateX: -140,
                  translateY: -70
                }
              })
            ]}
          </article>
        </ApViewBody>
      </ApView>
    )
  }

})

module.exports = ShowcaseView

