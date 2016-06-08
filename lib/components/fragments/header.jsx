/**
 * Header component
 */
'use strict'

import React, {PropTypes as types} from 'react'
import pkg from '../../../package.json'
import {ApHeader, ApHeaderLogo, ApContainer} from 'apeman-react-basic'
import Logo from '../fragments/logo'

const Header = React.createClass({
  render () {
    return (
      <ApHeader className="header">
        <ApContainer>
          <ApHeaderLogo>
            <Logo />
          </ApHeaderLogo>
        </ApContainer>
      </ApHeader>
    )
  }
})

export default Header
