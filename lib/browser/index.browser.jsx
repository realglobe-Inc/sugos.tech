'use strict'

import apReact from 'apeman-brws-react'
import IndexComponent from '../components/index.component'
import RedirectService from '../services/redirect_service'

const CONTAINER_ID = 'index-wrap'

function onload () {
  window.removeEventListener('DOMContentLoaded', onload)
  RedirectService.redirectIfNotAuth()
  let { locale } = window
  apReact.render(CONTAINER_ID, IndexComponent, {
    locale
  }, function done () {
    // The component is ready.
  })
}

window.addEventListener('DOMContentLoaded', onload)
