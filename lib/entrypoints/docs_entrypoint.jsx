/**
 * Browser script for docs.
 */
'use strict'

import {mount, once} from 'sg-react'
import DocsComponent from '../components/docs_component'
import {singleton as redirectService} from '../services/redirect_service'

const CONTAINER_ID = 'docs-wrap'

once('DOMContentLoaded', () => {
  let { locale } = window
  mount(CONTAINER_ID, DocsComponent, {
    locale
  }).then(() => {
    // The component is ready.
  })
})
