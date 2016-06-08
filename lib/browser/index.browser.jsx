'use strict'

import apReact from 'apeman-brws-react'
import IndexComponent from '../components/index.component'

const CONTAINER_ID = 'index-wrap'
window.onload = function () {
  apReact.render(CONTAINER_ID, IndexComponent, {}, function done () {
    // The component is ready.
  })
}
