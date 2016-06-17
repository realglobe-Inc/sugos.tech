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

const debug = require('debug')('sg:component:showcase')

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
    debug('render called.')
    const s = this
    let l = s.getLocale()
    let _section = s._renderSection
    // 開発中の section の挿入・入れ替えを容易にするため
    let first = true
    let reversed = () => {
      first = !first
      return first
    }
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
                reversed: reversed(),
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
              _section('preset-drone', {
                title: l('sections.CASE_DRONE_TITLE'),
                text: l('sections.CASE_DRONE_TEXT'),
                reversed: reversed(),
                video1: {
                  src: 'videos/ardrone.mp4',
                  translateX: 0,
                  translateY: -5,
                  width: 310
                },
                video2: {
                  src: 'videos/ardrone.mp4',
                  translateX: -155,
                  translateY: -10,
                  width: 310
                }
              }),
              _section('sense', {
                title: l('sections.CASE_SENSE_TITLE'),
                text: l('sections.CASE_SENSE_TEXT'),
                reversed: reversed(),
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
                reversed: reversed(),
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
                reversed: reversed(),
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
                reversed: reversed(),
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
                reversed: reversed(),
                video1: {
                  src: 'videos/yabee-stream.mp4',
                  translateX: -163,
                  translateY: -20,
                  width: 320
                },
                video2: {
                  src: 'videos/yabee-stream.mp4',
                  translateX: 0,
                  translateY: -20,
                  width: 310
                }
              }),
              _section('curl-rapiro', {
                title: l('sections.CASE_CURL_RAPIRO_TITLE'),
                text: l('sections.CASE_CURL_RAPIRO_TEXT'),
                reversed: reversed(),
                video1: {
                  src: 'videos/curl_rapiro.mp4',
                  translateX: -172,
                  translateY: -36,
                  width: 326
                },
                video2: {
                  src: 'videos/curl_rapiro.mp4',
                  translateX: -5,
                  translateY: -20,
                  width: 320
                }
              }),
              _section('hitoe-map', {
                title: l('sections.CASE_HITOE_TITLE'),
                text: l('sections.CASE_HITOE_TEXT'),
                reversed: reversed(),
                video1: {
                  src: 'videos/hitoe-map.mp4',
                  translateX: -43,
                  translateY: -60,
                  width: 463
                },
                video2: {
                  src: 'videos/hitoe-map.mp4',
                  translateX: -162,
                  translateY: -10,
                  width: 310
                }
              }),
              _section('gyro-pepper', {
                title: l('sections.CASE_GYRO_TITLE'),
                text: l('sections.CASE_GYRO_TEXT'),
                reversed: reversed(),
                video1: {
                  src: 'videos/gyro-pepper.mp4',
                  translateX: 0,
                  translateY: 0,
                  width: 310
                },
                video2: {
                  src: 'videos/gyro-pepper.mp4',
                  translateX: -162,
                  translateY: -2,
                  width: 310
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
    s.videos = videos
  },

  // -----------------
  // Custom
  // -----------------

  mounted: false,
  videos: [],

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

  _updateInScreen (clientHeight) {
    const s = this
    let videos = s.videos
    let shouldUpdatePlay = false
    videos.forEach((video, i) => {
      let rect = video.element.getBoundingClientRect()
      let nextInScreen = clientHeight - rect.top > 0 && rect.top > 0
      let prevInScreen = video.inScreen
      if (nextInScreen !== prevInScreen) {
        video.inScreen = nextInScreen
        shouldUpdatePlay = true
      }
    })
    if (shouldUpdatePlay) {
      s._playJustInScreen()
    }
  },

  _playJustInScreen () {
    const s = this
    let videos = s.videos
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
    this._updateInScreen(clientHeight)
  }
})

module.exports = ShowcaseView
