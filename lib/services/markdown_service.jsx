/**
 * @class MarkdownService
 */
'use strict'

import abind from 'abind'
import {EOL} from 'os'

/** @lends MarkdownService */
class MarkdownService {
  constructor () {
    const s = this
    abind(s)

  }

  /**
   * Get markdown with name
   * @param {string} name - Name of markdown
   * @returns {?string} - Matched markdown
   */
  getMarkdown (name) {
    const s = this
    let markdowns = s._getMarkdowns()
    return markdowns[ name ]
  }

  getMarkdownHeading (name) {
    const s = this
    let markdown = s.getMarkdown(name)
    return markdown && markdown.trim().split(EOL).shift().trim().replace(/^#+/, '').trim()
  }

  _getMarkdowns () {
    if (typeof window === 'undefined') {
      return require('../constants/markdown_constants')
    }
    return window.markdowns
  }
}

const singleton = new MarkdownService()

Object.assign(MarkdownService, {
  singleton
})

export {
  singleton
}

export default MarkdownService
