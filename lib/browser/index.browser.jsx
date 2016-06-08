'use strict'

import apReact from 'apeman-brws-react'
import IndexComponent from '../components/index.component'

const CONTAINER_ID = 'index-wrap'
window.onload = function () {
  let { locale } = window
  apReact.render(CONTAINER_ID, IndexComponent, {
    locale
  }, function done () {
    // The component is ready.
  })
}
