'use strict'

import React, {PropTypes as types} from 'react'
import {highlightJsx} from 'ape-highlighting'

const Snippet = React.createClass({
  propTypes: {
    src: types.string.isRequired
  },
  render () {
    const s = this
    let { props } = s
    return (
      <pre className="snippet" dangerouslySetInnerHTML={
        { __html: highlightJsx(props.src) }
        }>
      </pre>
    )
  }
})

export default  Snippet
