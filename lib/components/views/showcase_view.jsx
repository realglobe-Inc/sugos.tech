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
import {DOMINANT} from '../../constants/color_constants'

const VIDEO_CONTAINER_PREFIX = '_videoSection:'
const PLAER_PREFIX = '_playerSection:'

const ShowcaseView = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  getInitialState () {
    return {videos: {}}
  },
  render () {
    const s = this
    let l = s.getLocale()
    let _section = s._renderSection
    return (
      <ApView className='showcase-view'
              spinning={ !s.mounted }
              onScroll={s._handleScroll}
      >
        <ApViewHeader titleText={ l('titles.SHOWCASE_TITLE') }/>
        <ApViewBody>
          <article>
            { [
              _section('remote', {
                title: l('sections.CASE_REMOTE_TITLE'),
                text: l('sections.CASE_REMOTE_TEXT'),
                reversed: false,
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
                reversed: true,
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
                reversed: false,
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
                reversed: true,
                video1: {
                  src: 'videos/pepper_text_input.mp4',
                  translateX: -165,
                  translateY: -20,
                  width: 320
                },
                video2: {
                  src: 'videos/pepper_text_input.mp4',
                  translateX: -52,
                  translateY: -30,
                  width: 510
                }
              }),
              _section('edison-roomba', {
                title: l('sections.CASE_EDISON_ROOMBA_TITLE'),
                text: l('sections.CASE_EDISON_ROOMBA_TEXT'),
                reversed: false,
                video1: {
                  src: 'videos/edison_roomba.mp4',
                  translateX: -15,
                  translateY: -30,
                  width: 380
                },
                video2: {
                  src: 'videos/edison_roomba.mp4',
                  translateX: -162,
                  translateY: -20,
                  width: 320
                }
              }),
              _section('edison-stream', {
                title: l('sections.CASE_EDISON_STREAM_TITLE'),
                text: l('sections.CASE_EDISON_STREAM_TEXT'),
                reversed: true,
                video1: {
                  src: 'videos/yabee-stream.mp4',
                  translateX: 0,
                  translateY: -20,
                  width: 310
                },
                video2: {
                  src: 'videos/yabee-stream.mp4',
                  translateX: -163,
                  translateY: -20,
                  width: 320
                }
              })
            ]}
          </article>
        </ApViewBody>
      </ApView>
    )
  },

  // -----------------
  // LifeCycle
  // -----------------

  componentDidMount () {
    const s = this
    s.mounted = true

    let videos = Object.keys(s).reduce((elements, key) => {
      if (key.startsWith(VIDEO_CONTAINER_PREFIX)) {
        let name = key.split(':')[1]
        let players = Object.keys(s).reduce((players, key) =>
          players.concat(
            key.startsWith(`${PLAER_PREFIX}${name}`) ? s[key]._player : []
          ), [])
        let video = {
          element: s[key],
          name: name,
          inScreen: true,
          players: players
        }
        return elements.concat(video)
      } else {
        return elements
      }
    }, [])
    s.setState({videos})
  },

  // -----------------
  // Custom
  // -----------------

  mounted: false,

  // -----------------
  // Private
  // -----------------

  _renderSection (name, config) {
    const s = this
    let {
      title, text,
      video1, video2,
      reversed
    } = config
    return (
      <ApSection className='showcase-section'
                 id={ `showcase-${name}-section` }
                 key={ name }>
        <ApSectionHeader>{ title }</ApSectionHeader>
        <ApSectionBody>
          <div className='showcase-text-container'>
            <div className='showcase-description'>{
              [].concat(text).map((text, i) => (<p key={i}>{ text }</p>))
            }</div>
          </div>
          <div className='showcase-video-container' ref={v => s[`${VIDEO_CONTAINER_PREFIX}${name}`] = v}>
            <Video className='showcase-video' { ...video1 } ref={v => s[`${PLAER_PREFIX}${name}:video1`] = v}/>
            <Joiner className='showcase-joiner' color={ reversed ? DOMINANT : 'white' }/>
            <Video className='showcase-video' { ...video2 } ref={v => s[`${PLAER_PREFIX}${name}:video2`] = v}/>
          </div>
        </ApSectionBody>
      </ApSection>
    )
  },

  _updateInScreen (videos, clientHeight) {
    const s = this
    let updated = videos.concat()
    updated.forEach((video, i) => {
      let rect = video.element.getBoundingClientRect()
      updated[i].inScreen = clientHeight - rect.top > 0 && rect.top > 0
    })
    s._playJustInScreen(updated)
    s.setState({videos: updated})
  },

  _playJustInScreen (videos) {
    videos.forEach(video => {
      video.players.forEach(player => {
        if (video.inScreen) {
          player.play()
        } else {
          player.pause()
        }
      })
    })
  },

  _handleScroll (event) {
    let {clientHeight} = event.target
    let {videos} = this.state
    this._updateInScreen(videos, clientHeight)
  }
})

module.exports = ShowcaseView
