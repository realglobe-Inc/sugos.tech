'use strict'

import React, {PropTypes as types} from 'react'
import {ApPage, ApMain, ApViewStack} from 'apeman-react-basic'
import Header from './fragments/header'
import SplashView from './views/splash_view'

import {singleton as localeService} from '../services/locale_service'

const { l } = localeService

const IndexComponent = React.createClass({

  render () {
    const s = this
    return (
      <ApPage>
        <Header l={ l }/>
        <ApMain>
          <SplashView l={ l }/>
        </ApMain>
      </ApPage>
    )
  }
})

export default IndexComponent
