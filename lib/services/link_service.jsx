/**
 * @class LinkService
 */
'use strict'

const path = require('path')
const abind = require('abind')

/** @lends LinkService */
class LinkService {

  /**
   * Resolve a html link
   * @param {string} filename - Html file name
   * @returns {string} - Resolved file name
   */
  resolveHtmlLink (filename) {
    const s = this
    let lang = s._getLang()
    let htmlDir = lang ? `html/${lang}` : 'html'
    return path.join(htmlDir, filename)
  }

  _getLang () {
    if (typeof window === 'undefined') {
      return process.env.LANG
    }
    return window.lang
  }

}

const singleton = new LinkService()

Object.assign(LinkService, {
  singleton
})

export {
  singleton
}
export default LinkService