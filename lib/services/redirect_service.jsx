/**
 * @class RedirectService
 */
'use strict'

const url = require('url')
const debug = require('debug')('sg:services:redirect')

class RedirectService {
  redirectIfNotAuth () {
    let referrer = url.parse(document.referrer).hostname
    let { hostname } = window.location
    if (!hostname) {
      return
    }
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

const singleton = new RedirectService()

Object.assign(RedirectService, {
  singleton
})

export {
  singleton
}

export default RedirectService
