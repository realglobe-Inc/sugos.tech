'use strict'

import {mount} from 'sg-react'
import IndexComponent from '../components/index_component'
import {singleton as redirectService} from '../services/redirect_service'

const CONTAINER_ID = 'index-wrap'

function onload () {
  window.removeEventListener('DOMContentLoaded', onload)
  redirectService.redirectIfNotAuth()
  let { locale } = window
  mount(CONTAINER_ID, IndexComponent, {
    locale
  }).then(() => {
    // The component is ready.
  })
}

window.addEventListener('DOMContentLoaded', onload)
