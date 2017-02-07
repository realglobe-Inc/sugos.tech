/**
 * Browser script for cases.
 */
'use strict'

import {mount, once} from 'sg-react'
import CasesComponent from '../components/cases_component'
import {singleton as redirectService} from '../services/redirect_service'
import {singleton as polyfillService} from '../services/polyfill_service'

const CONTAINER_ID = 'cases-wrap'

// Polyfill of requestAnimationFrame
window.requestAnimationFrame = polyfillService.defineRequestAnimationFrame()
window.cancelAnimationFrame = polyfillService.defineCancelAnimationFrame()

once('DOMContentLoaded', () => {
  let { locale } = window
  mount(CONTAINER_ID, CasesComponent, {
    locale
  }).then(() => {
    // The component is ready.
  })
})
