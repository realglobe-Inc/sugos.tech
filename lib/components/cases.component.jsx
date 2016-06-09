/**
 * Component of cases.
 *
 * Generated by coz on 6/9/2016,
 * from a template provided by apeman-bud-mock.
 */

'use strict'

import React from 'react'
import {ApPage, ApMain, ApViewStack} from 'apeman-react-basic'
import {ApLocaleMixin} from 'apeman-react-mixins'
import Header from './fragments/header'
import ShowcaseView from './views/showcase_view'

const CasesComponent = React.createClass({
  mixins: [
    ApLocaleMixin
  ],
  getInitialState () {
    return {}
  },
  getDefaultProps () {
    return {
      stacker: new (ApViewStack.Stacker)({
        root: ShowcaseView,
        rootProps: {}
      })
    }
  },

  componentWillMount () {
    const s = this
    let { props } = s
    s.registerLocale(props.locale)
  },

  render () {
    const s = this
    let { props } = s
    let l = s.getLocale()
    return (
      <ApPage>
        <Header selected="CASES"/>
        <ApMain>
          <ApViewStack stacker={ props.stacker }/>
        </ApMain>
      </ApPage>
    )
  }
})

export default CasesComponent