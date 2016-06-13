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
                  src: 'videos/SUGOS_remote_PLEN.mp4',
                  translateX: -155,
                  translateY: -10,
                  width: 310
                },
                video2: {
                  src: 'videos/SUGOS_remote_PLEN.mp4',
                  translateX: 0,
                  translateY: -20,
                  width: 310
                }
              }),
              _section('sense', {
                title: l('sections.CASE_SENSE_TITLE'),
                text: l('sections.CASE_SENSE_TEXT'),
                video1: {
                  src: 'videos/SUGOS_remote_sensor.mp4',
                  translateX: -155,
                  translateY: -5,
                  width: 310
                },
                video2: {
                  src: 'videos/SUGOS_remote_sensor.mp4',
                  translateX: 0,
                  translateY: -20,
                  width: 310
                }
              }),
              _section('talk', {
                title: l('sections.CASE_SPEECH_RECOGNITION_TITLE'),
                text: l('sections.CASE_SPEECH_RECOGNITION_TEXT'),
                video1: {
                  src: 'videos/pepper_speech_recognition.mp4',
                  translateX: 0,
                  translateY: 0,
                  width: 470
                },
                video2: {
                  src: 'videos/pepper_speech_recognition.mp4',
                  translateX: -200,
                  translateY: -30,
                  width: 350
                }
              }),
              _section('text-input', {
                title: l('sections.CASE_TEXT_INPUT_TITLE'),
                text: l('sections.CASE_TEXT_INPUT_TEXT'),
                video1: {
                  src: 'videos/pepper_speech_recognition.mp4',
                  translateX: 0,
                  translateY: 0,
                  width: 470
                },
                video2: {
                  src: 'videos/pepper_speech_recognition.mp4',
                  translateX: -200,
                  translateY: -30,
                  width: 350
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
