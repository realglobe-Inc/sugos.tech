'use strict'

import React, {PropTypes as types} from 'react'
import classnames from 'classnames'

const VideoCanvas = React.createClass({
  propTypes: {
    src: types.string,
    width: types.number,
    height: types.number,
    translateX: types.number,
    translateY: types.number
  },
  getDefaultProps () {
    return {
      width: 148,
      height: 148
    }
  },
  render () {
    const s = this
    let { props } = s
    return (
      <div className={ classnames('video-canvas', props.className) }>
        <div className='video-canvas-inner'>
          <canvas width={ props.width }
                  height={ props.height }
                  ref={ canvas => s._canvas = canvas }
          />
        </div>
        <div className='video-canvas-overlay'></div>
      </div>
    )
  }
})

export default VideoCanvas
