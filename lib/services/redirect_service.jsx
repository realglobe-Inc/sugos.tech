/**
 * @class RedirectService
 */
'use strict'

const url = require('url')
const debug = require('debug')('sg:services:redirect')

const RedirectService = {
  redirectIfNotAuth () {
    let referrer = url.parse(document.referrer).hostname
    let {hostname} = window.location
    let hosts = [
      hostname,
      'www.sugos.tech',
      'sugos-tech-ghpage-proxy.herokuapp.com'
    ]
    debug(`referrer host: ${referrer}`)
    if (!hosts.includes(referrer) && hostname !== 'www.sugos.tech') {
      debug('redirecting to http://www.sugos.tech')
      window.location.href = 'http://www.sugos.tech'
    }
  }
}

export default RedirectService
