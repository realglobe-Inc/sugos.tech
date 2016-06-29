'use strict'

import apReact from 'apeman-brws-react'
import IndexComponent from '../components/index_component'
import { singleton as redirectService } from '../services/redirect_service'

const CONTAINER_ID = 'index-wrap'

function onload () {
  window.removeEventListener('DOMContentLoaded', onload)
  redirectService.redirectIfNotAuth()
  let { locale } = window
  apReact.render(CONTAINER_ID, IndexComponent, {
    locale
  }, function done () {
    // The component is ready.
  })
}

window.addEventListener('DOMContentLoaded', onload)
