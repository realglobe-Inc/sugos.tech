/**
 * @class MarkdownService
 */
'use strict'

/** @lends MarkdownService */
class MarkdownService {
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
