'use strict'

import React, {PropTypes as types} from 'react'
import {ApPage, ApMain, ApViewStack} from 'apeman-react-basic'
import Header from './fragments/header'
import SplashView from './views/splash_view'

const IndexComponent = React.createClass({
  getInitialState () {
    return {}
  },
  getDefaultProps () {
    return {
      stacker: new (ApViewStack.Stacker)({
        root: SplashView,
        rootProps: {}
      })
    }
  },
  componentWillMount () {
    const s = this
  },
  render () {
    const s = this
    let {props} = s
    return (
      <ApPage>
        <Header />
        <ApMain>
          <ApViewStack stacker={ props.stacker }/>
        </ApMain>
      </ApPage>
    )
  }
})

export default IndexComponent
