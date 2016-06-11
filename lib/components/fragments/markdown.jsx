'use strict'

import React, {PropTypes as types} from 'react'
import marked from 'marked'
import {ApMarkdown} from 'apeman-react-markdown'

const { EOL } = ApMarkdown

const Markdown = React.createClass({
  propTypes: {},
  statics: {
    EOL
  },
  getDefaultProps () {
    const s = this
    return {
      links: require('../../../doc/links')
    }
  },
  render () {
    const s = this
    let { props } = s
    return (
      <ApMarkdown { ...props } />
    )
  }
})

export default Markdown
