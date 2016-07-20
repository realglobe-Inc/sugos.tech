/**
 * Browser script for cases.
 *
 * Generated by coz on 6/9/2016,
 * from a template provided by apeman-bud-mock.
 */
'use strict'

import {mount} from 'sg-react'
import CasesComponent from '../components/cases_component'
import {singleton as redirectService} from '../services/redirect_service'
import {singleton as polyfillService} from '../services/polyfill_service'

const CONTAINER_ID = 'cases-wrap'

// Polyfill of requestAnimationFrame
window.requestAnimationFrame = polyfillService.defineRequestAnimationFrame()
window.cancelAnimationFrame = polyfillService.defineCancelAnimationFrame()

function onload () {
  window.removeEventListener('DOMContentLoaded', onload)
  redirectService.redirectIfNotAuth()
  let { locale } = window
  mount(CONTAINER_ID, CasesComponent, {
    locale
  }).then(() => {
    // The component is ready.
  })
}

window.addEventListener('DOMContentLoaded', onload)