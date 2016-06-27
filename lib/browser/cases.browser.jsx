/**
 * Browser script for cases.
 *
 * Generated by coz on 6/9/2016,
 * from a template provided by apeman-bud-mock.
 */
'use strict'

import apReact from 'apeman-brws-react'
import CasesComponent from '../components/cases.component.js'

const CONTAINER_ID = 'cases-wrap'

// Polyfill of requestAnimationFrame
window.requestAnimationFrame = (() => {
  return window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    ((f) => window.setTimeout(f, 1000 / 60))
})()
window.cancelAnimationFrame = (() => {
  return window.cancelAnimationFrame ||
    window.cancelRequestAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    ((id) => window.clearTimeout(id))
})()

function onload () {
  let { locale } = window
  apReact.render(CONTAINER_ID, CasesComponent, {
    locale
  }, function done () {
    // The component is ready.
  })
  window.removeEventListener('DOMContentLoaded', onload)
}

window.addEventListener('DOMContentLoaded', onload)
