/**
 * Header component
 * @class Header
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {
  ApHeader, ApHeaderLogo, ApContainer,
  ApHeaderTab, ApHeaderTabItem
} from 'apeman-react-basic'
import Logo from '../fragments/logo'
import {singleton as linkService} from '../../services/link_service'

/** @lends Header */
const Header = React.createClass({
  propTypes: {
    tab: types.string
  },
  getDefaultProps () {
    return {
      tab: null
    }
  },
  mixins: [],
  render () {
    const s = this
    let { props } = s
    let { tab, l } = props

    let _tabItem = ApHeaderTabItem.createItem
    let _link = (...args) => linkService.resolveHtmlLink(...args)
    return (
      <ApHeader className='header'>
        <ApContainer>
          <ApHeaderLogo href={ _link('index.html') }>
            <Logo l={ l }/>
          </ApHeaderLogo>
          <ApHeaderTab>
            { _tabItem(l('pages.DOCS_PAGE'), _link('docs.html'), { selected: tab === 'DOCS' }) }
            { _tabItem(l('pages.CASES_PAGE'), _link('cases.html'), { selected: tab === 'CASES' }) }
          </ApHeaderTab>
        </ApContainer>
      </ApHeader>
    )
  }

})

export default Header
