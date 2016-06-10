'use strict'

import React, {PropTypes as types} from 'react'

const Snippet = React.createClass({
  propTypes: {
    src: types.string.isRequired
  },
  render () {
    const s = this
    let { props } = s
    return (
      <div className="snippet" dangerouslySetInnerHTML={
        { __html: props.src }
        }>
      </div>
    )
  }
})

export default Snippet
