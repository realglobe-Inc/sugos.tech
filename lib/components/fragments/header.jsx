/**
 * Header component
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {ApLocaleMixin} from 'apeman-react-mixins'
import {
  ApHeader, ApHeaderLogo, ApContainer,
  ApHeaderTab, ApHeaderTabItem
} from 'apeman-react-basic'
import Logo from '../fragments/logo'

const Header = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  render () {
    const s = this
    let l = s.getLocale()
    return (
      <ApHeader className="header">
        <ApContainer>
          <ApHeaderLogo>
            <Logo />
          </ApHeaderLogo>
          <ApHeaderTab>
            <ApHeaderTabItem>{ l('pages.DOCS_PAGE') }</ApHeaderTabItem>
            <ApHeaderTabItem>{ l('pages.DEMO_PAGE') }</ApHeaderTabItem>
          </ApHeaderTab>
        </ApContainer>
      </ApHeader>
    )
  }
})

export default Header
