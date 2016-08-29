/**
 * Footer component
 * @class Footer
 */
'use strict'

import React, {PropTypes as types} from 'react'
import {ApFooter, ApImage, ApLinks} from 'apeman-react-basic'
import links from '../../../doc/links.json'

/** @lends Footer */
const Footer = React.createClass({
  mixins: [],
  render () {
    const s = this
    let { props } = s
    let { l } = props

    return (
      <ApFooter className="footer">
        <div className="footer-group">
          <h3 className="footer-title">{ l('footer.LINKS_TITLE') }</h3>
          <ApLinks links={ links }/>
        </div>
        { props.children }
        <div className="footer-group">
          <a className="footer-company"
             href="http://realglobe.jp/"
          >
            <ApImage width="64px"
                     height="64px"
                     scale="fit"
                     src="images/company-logo.png"
            />
            <span className="footer-copyright">{ l('footer.COPY_RIGHT') }</span>
          </a>
        </div>
      </ApFooter>
    )
  }
})

export default Footer
