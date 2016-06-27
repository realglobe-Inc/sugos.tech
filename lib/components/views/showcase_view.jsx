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
import VideoCanvas from '../fragments/video_canvas'
import Joiner from '../fragments/joiner'
import {DOMINANT} from '../../constants/color_constants'

const debug = require('debug')('sg:component:showcase')

const ARTICLES = require('../data/articles.json')

const ShowcaseView = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  render () {
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
            {
              ARTICLES.map(article =>
                _section(article.name, article.body, reversed())
              )
            }
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
    // defines mounted value
    s.mounted = true

    let ua = navigator.userAgent
    s.isIPhone = /(iPhone|iPod)/.test(ua)

    // defines this.videos
    let videos = ARTICLES.map((article, i) => {
      let {name} = article
      let video = {
        name: name,
        inScreen: true,
        container: s._videoContainers[name],
        player: {
          element: s._players[name]._player,
          canPlay: false,
          // 先頭の動画2つだけ自動再生
          onCanPlay: i <= 1 ? () => {
            video.player.canPlay = true
            debug(`canPlay ${name}`)
            s._play(video)
          } : () => {
            video.player.canPlay = true
            debug(`canPlay ${name}`)
          },
          playing: false
        },
        canvas1: s._canvases[name].canvas1,
        canvas2: s._canvases[name].canvas2
      }
      return video
    })

    videos.forEach(video => {
      let {player} = video
      player.element.load()
      player.element.addEventListener('canplaythrough', player.onCanPlay, false)
    })

    s.videos = videos
  },

  componentWillUnmount () {
    const s = this
    s.videos.forEach(video => {
      s._pause(video)
      let {player} = video
      player.element.removeEventListner('canplaythrough', player.onCanPlay, false)
    })
  },
  // -----------------
  // Custom
  // -----------------

  mounted: false,
  isIPhone: false,
  videos: [],
  _videoContainers: {},
  _players: {},
  _canvases: {},

  // -----------------
  // Private
  // -----------------

  _renderSection (name, config, reversed) {
    const s = this
    let l = s.getLocale()
    let {
      title, text,
      video,
      canvas1, canvas2
    } = config
    s._canvases[name] = {} // Error 回避
    let refs = {
      container (c) {
        s._videoContainers[name] = c
      },
      video (c) {
        s._players[name] = c
      },
      canvas (nth) {
        let canvasName = `canvas${nth}`
        let canvasConf = nth === 1 ? canvas1 : canvas2
        return (c) => {
          s._canvases[name][canvasName] = {
            element: c,
            dx: canvasConf.dx,
            dy: canvasConf.dy,
            width: canvasConf.width,
            animationId: 0,
            ctime: 0,
            lastTime: 0
          }
        }
      }
    }
    return (
      <ApSection className='showcase-section'
                 id={ `showcase-${name}-section` }
                 key={ name }>
        <ApSectionHeader>{ l(`sections.${title}`) }</ApSectionHeader>
        <ApSectionBody>
          <div className='showcase-text-container'>
            <div className='showcase-description'>{
              [].concat(l(`sections.${text}`)).map((text, i) => (<p key={i}>{ text }</p>))
            }</div>
          </div>
          <div className='showcase-video-container' ref={ refs.container }>
            <Video src={ video } ref={ refs.video }/>
            <VideoCanvas className='showcase-video' ref={ refs.canvas(1) }/>
            <Joiner className='showcase-joiner' color={ reversed ? DOMINANT : 'white' }/>
            <VideoCanvas className='showcase-video' ref={ refs.canvas(2) }/>
          </div>
        </ApSectionBody>
      </ApSection>
    )
  },

  _updateInScreen (clientHeight) {
    const s = this
    s.videos.forEach((video, i) => {
      let top = video.container.getBoundingClientRect().top
      let nextInScreen = clientHeight - top > 100 && top > 50
      let prevInScreen = video.inScreen
      if (nextInScreen === prevInScreen) {
        return
      }
      video.inScreen = nextInScreen
      if (video.inScreen) {
        s._play(video)
      } else {
        s._pause(video)
      }
    })
  },

  _play (video, force) {
    const s = this
    let {player} = video
    if (!force && (!player.canPlay || player.playing)) {
      return
    }
    debug(`play ${video.name}`)

    player.playing = true
    let play = s.isIPhone ? s._playOnIPhone : s._playOnPc
    let playerElement = video.player.element
    let {canvas1, canvas2} = video

    play(canvas1, playerElement)
    play(canvas2, playerElement)
  },

  _playOnPc (canvas, playerElement) {
    const s = this
    let ctx = canvas.element._canvas.getContext('2d')
    let loop = () => {
      s._draw(playerElement, canvas, ctx)
      canvas.animationId = window.requestAnimationFrame(loop)
    }

    playerElement.play()
    s._startAnimationFrame(canvas, loop)
  },

  _playOnIPhone (canvas, playerElement) {
    const s = this
    let ctx = canvas.element._canvas.getContext('2d')
    canvas.lastTime = Date.now()
    let loop = (timestamp) => {
      let diff = Date.now() - canvas.lastTime
      canvas.lastTime = Date.now()
      canvas.ctime += diff / 1000
      playerElement.currentTime = canvas.ctime
      s._draw(playerElement, canvas, ctx)
      if (playerElement.duration <= playerElement.currentTime) {
        canvas.ctime = 0
      }
      canvas.animationId = window.requestAnimationFrame(loop)
    }

    s._startAnimationFrame(canvas, loop)
  },

  _startAnimationFrame (canvas, loop) {
    canvas.animationId = window.requestAnimationFrame(loop)
  },

  _draw (playerElement, canvas, ctx) {
    ctx.drawImage(playerElement, canvas.dx, canvas.dy, canvas.width, canvas.width, 0, 0, 148, 148)
  },

  _pause (video) {
    const s = this
    let {player, canvas1, canvas2} = video
    debug(`pause ${video.name} id ${canvas1.animationId} ${canvas2.animationId}`)
    player.playing = false
    if (!s.isIPhone) {
      player.element.pause()
    }
    window.cancelAnimationFrame(canvas1.animationId)
    window.cancelAnimationFrame(canvas2.animationId)
  },

  _handleScroll (event) {
    let {clientHeight} = event.target
    this._updateInScreen(clientHeight)
  }
})

module.exports = ShowcaseView
