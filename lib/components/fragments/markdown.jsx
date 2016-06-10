'use strict'

import React, {PropTypes as types} from 'react'
import marked from 'marked'
import {EOL} from 'os'

const Markdown = React.createClass({
  propTypes: {
    text: types.string
  },
  statics: {
    EOL
  },
  getDefaultProps () {
    const s = this
    return {
      text: null
    }
  },
  render () {
    const s = this
    let { props } = s
    let content = marked(props.text)
    return (
      <div dangerouslySetInnerHTML={ {__html: content} }>
      </div>
    )
  }
})

export default Markdown
