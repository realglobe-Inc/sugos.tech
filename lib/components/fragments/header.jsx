/**
 * Header component
 */
'use strict'

import React, {PropTypes as types} from 'react'
import pkg from '../../../package.json'
import {ApHeader, ApHeaderLogo} from 'apeman-react-basic'

const Header = React.createClass({
  render () {
    return (
      <ApHeader>
        <ApHeaderLogo>{ pkg.name }</ApHeaderLogo>
      </ApHeader>
    )
  }
})

export default Header
