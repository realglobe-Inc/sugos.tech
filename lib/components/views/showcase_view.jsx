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

const articles = require('../data/articles.json')

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
            {
              articles.map(article =>
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

    // defines this.videos
    let videos = articles.map((article, i) => {
      let {name} = article
      let video = {
        name: name,
        inScreen: true,
        container: s._videoContainers[name],
        player: {
          element: s._players[name]._player,
          canPlay: false,
          onCanPlay: () => {
            video.player.canPlay = true
            debug(`canPlay ${name}`)
            // 先頭の動画2つだけ自動再生
            if (i <= 1) {
              s._play(video, true)
            }
          }
        },
        canvas1: s._canvases[name].canvas1,
        canvas2: s._canvases[name].canvas2
      }
      return video
    })

    videos.forEach(video => {
      let playerElement = video.player.element
      playerElement.load()
      playerElement.addEventListener('canplaythrough', video.player.onCanPlay, false)
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
      canvas1 (c) {
        s._canvases[name].canvas1 = {
          element: c,
          dx: canvas1.dx,
          dy: canvas1.dy,
          width: canvas1.width,
          animationId: 0,
          ctime: 0,
          lastTime: 0
        }
      },
      canvas2 (c) {
        s._canvases[name].canvas2 = {
          element: c,
          dx: canvas2.dx,
          dy: canvas2.dy,
          width: canvas2.width,
          animationId: 0,
          ctime: 0,
          lastTime: 0
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
          <div className='showcase-video-container' ref={ (c) => s._videoContainers[name] = c }>
            <Video src={ video } ref={ refs.video }/>
            <VideoCanvas className='showcase-video' ref={ refs.canvas1 }/>
            <Joiner className='showcase-joiner' color={ reversed ? DOMINANT : 'white' }/>
            <VideoCanvas className='showcase-video' ref={ refs.canvas2 }/>
          </div>
        </ApSectionBody>
      </ApSection>
    )
  },

  _updateInScreen (clientHeight) {
    const s = this
    let videos = s.videos
    videos.forEach((video, i) => {
      let rect = video.container.getBoundingClientRect()
      let nextInScreen = clientHeight - rect.top > 0 && rect.top > 0
      let prevInScreen = video.inScreen
      if (nextInScreen !== prevInScreen) {
        video.inScreen = nextInScreen
        if (video.inScreen) {
          s._play(video)
        } else {
          s._pause(video)
        }
      }
    })
  },

  _play (video, force) {
    const s = this
    let playerElement = video.player.element
    if (!video.player.canPlay && !force) {
      return
    }
    debug(`play ${video.name}`)

    function play (canvas) {
      let ua = navigator.userAgent
      let ctx = canvas.element._canvas.getContext('2d')
      let loop
      if (/(iPhone|iPod)/.test(ua)) {
        canvas.lastTime = Date.now()
        loop = (timestamp) => {
          let diff = Date.now() - canvas.lastTime
          canvas.lastTime = Date.now()
          canvas.ctime += diff / 1000
          playerElement.currentTime = canvas.ctime
          s._draw(ctx, playerElement, canvas)
          if (playerElement.duration <= playerElement.currentTime) {
            canvas.ctime = 0
          }
          canvas.animationId = window.requestAnimationFrame(loop)
        }
      } else {
        playerElement.play()

        loop = () => {
          s._draw(ctx, playerElement, canvas)
          canvas.animationId = window.requestAnimationFrame(loop)
        }
      }
      canvas.animationId = window.requestAnimationFrame(loop)
    }

    let {canvas1, canvas2} = video
    play(canvas1)
    play(canvas2)
  },

  _draw (ctx, playerElement, canvas) {
    ctx.drawImage(playerElement, canvas.dx, canvas.dy, canvas.width, canvas.width, 0, 0, 148, 148)
  },

  _pause (video) {
    if (!video.player.canPlay) {
      return
    }
    debug(`pause ${video.name} id ${video.canvas1.animationId} ${video.canvas2.animationId}`)
    let ua = navigator.userAgent
    if (!/(iPhone|iPod)/.test(ua)) {
      video.player.element.pause()
    }
    window.cancelAnimationFrame(video.canvas1.animationId)
    window.cancelAnimationFrame(video.canvas2.animationId)
  },

  _handleScroll (event) {
    let {clientHeight} = event.target
    this._updateInScreen(clientHeight)
  }
})

module.exports = ShowcaseView
