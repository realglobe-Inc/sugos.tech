'use strict'

import React, {PropTypes as types} from 'react'
import {SgVideo} from 'sg-react-components'
import classnames from 'classnames'
import {ApTouchMixin} from 'apeman-react-mixins'

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
    let { translateX, translateY } = props
    let style = { transform: `translate(${translateX}px, ${translateY}px)` }
    return (
      <div className={ classnames('video', props.className) }>
        <div className="video-inner">
          <SgVideo src={ props.src }
                   style={ style }
                   width={ props.width }
                   height={ props.height }
                   playerRef={ (player) => s._player = player }
                   autoPlay={true}
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
