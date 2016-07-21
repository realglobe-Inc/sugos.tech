'use strict'

import React, {PropTypes as types} from 'react'
import {ApLocaleMixin} from 'apeman-react-mixin-locale'

const Logo = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  render () {
    const s = this
    let l = s.getLocale()
    return (
      <h1 className="logo">{ l('logo.LOGO') }</h1>
    )
  }
})

export default Logo
