'use strict'

import React, {PropTypes as types} from 'react'
import {ApPage, ApMain} from 'apeman-react-basic'
import Header from './fragments/header'

const IndexComponent = React.createClass({
  getInitialState () {
    return {
    }
  },
  componentWillMount () {
    const s = this
  },
  render () {
    const s = this
    return (
      <ApPage>
        <Header />
        <ApMain>
          This is the index
        </ApMain>
      </ApPage>
    )
  }
})

export default IndexComponent
