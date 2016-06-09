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
  propTypes: {
    tab: types.string
  },
  getDefaultProps () {
    return {
      tab: null
    }
  },
  mixins: [
    ApLocaleMixin
  ],
  render () {
    const s = this
    let { props } = s
    let { tab } = props
    let l = s.getLocale()
    let _tabItem = ApHeaderTabItem.createItem
    return (
      <ApHeader className="header">
        <ApContainer>
          <ApHeaderLogo>
            <Logo />
          </ApHeaderLogo>
          <ApHeaderTab>
            { _tabItem(l('pages.DOCS_PAGE'), './docs.html', { selected: tab === 'DOCS' }) }
            { _tabItem(l('pages.CASES_PAGE'), './cases.html', { selected: tab === 'CASES' }) }
          </ApHeaderTab>
        </ApContainer>
      </ApHeader>
    )
  }
})

export default Header
