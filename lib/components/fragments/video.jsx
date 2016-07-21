'use strict'

import React, {PropTypes as types} from 'react'
import {SgVideo} from 'sg-react-components'
import classnames from 'classnames'
import {ApTouchMixin} from 'apeman-react-mixin-touch'

const Video = React.createClass({
  mixins: [
    ApTouchMixin
  ],
  propTypes: {
    src: types.string,
    width: types.number,
    height: types.number,
    translateX: types.number,
    translateY: types.number
  },
  getDefaultProps () {
    return {}
  },
  render () {
    const s = this
    let { props } = s
    return (
      <div className={ classnames('video', props.className) }>
        <div className="video-inner">
          <SgVideo src={ props.src }
                   playerRef={ (player) => s._player = player }
                   hidden
                   muted
                   loop
          />
        </div>
        <div className="video-overlay"></div>
      </div>
    )
  }
})

export default Video
