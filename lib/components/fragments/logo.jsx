'use strict'

import React, {PropTypes as types} from 'react'
import {ApPage, ApMain} from 'apeman-react-basic'

const Logo = React.createClass({
  render () {
    return (
      <h1 className="logo">
        {
          'SUGOS'.split('').map((letter, i) => (
            <span key={ i }>{ letter }</span>
          ))
        }
      </h1>
    )
  }
})

module.exports = Logo
