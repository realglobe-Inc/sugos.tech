'use strict'

import React, {PropTypes as types} from 'react'

const Logo = React.createClass({
  mixins: [],
  render () {
    const s = this
    let { l } = s.props
    return (
      <h1 className="logo">{ l('logo.LOGO') }</h1>
    )
  }
})

export default Logo
