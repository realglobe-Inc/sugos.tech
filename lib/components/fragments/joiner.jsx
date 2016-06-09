'use strict'

import React, {PropTypes as types} from 'react'
import {ApLayoutMixin, ApPureMixin} from 'apeman-react-mixins'
import classnames from 'classnames'
import {DOMINANT} from '../../constants/color_constants.json'

const Joiner = React.createClass({
  propTypes: {
    color: types.string,
    lineWidth: types.number
  },
  getDefaultProps () {
    return {
      color: DOMINANT,
      lineWidth: 4
    }
  },
  mixins: [
    ApLayoutMixin,
    ApPureMixin
  ],
  render () {
    const s = this
    let { props, layouts } = s
    let { color, lineWidth } = props

    let { width, height } = layouts.svg
    let [minX, midX, maxX] = [ 0, width / 2, width ]
    let [minY, midY, maxY] = [ 0, height / 2, height ]
    let _line = (x1, x2, y1, y2) => (<line { ...{ x1, x2, y1, y2 } }/>)

    let xTilt = 0.1
    let yTilt = 0.3

    let [x1, x2, x3, x4] = [ minX, midX * (1 + xTilt), midX * (1 - xTilt), maxX ]
    let [y1, y2, y3] = [ midY, midY * (1 - yTilt), midY * (1 + yTilt) ]
    return (
      <div className={ classnames('joiner', props.className) }
           ref={ (joiner) => { s.joiner = joiner } }>
        <svg width={ width }
             height={ height }
             stroke={ color }
             strokeWidth={ lineWidth }
        >
          { _line(x1, x2, y1, y2) }
          { _line(x2, x3, y2, y3) }
          { _line(x3, x4, y3, y1) }
        </svg>
      </div>
    )
  },

  // -----------------
  // For ApLayoutMixin
  // -----------------
  getInitialLayouts () {
    return {
      svg: { width: 100, height: 40 }
    }
  },

  calcLayouts () {
    const s = this
    let { joiner } = s
    if (!joiner) {
      return s.getInitialLayouts()
    }
    let { width, height } = joiner.getBoundingClientRect()
    return {
      svg: { width, height }
    }
  }
})

export default Joiner
