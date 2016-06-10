/**
 * @class SnippetService
 */
'use strict'

class SnippetService {
  /**
   * Get snippet with name
   * @param {string} name - Name of snippet
   * @returns {?string} - Matched snippet
   */
  getSnippet (name) {
    const s = this
    let snippets = s._getSnippets()
    return snippets[ name ]
  }

  _getSnippets () {
    if (typeof window === 'undefined') {
      return require('../constants/snippet_constants')
    }
    return window.snippets
  }
}

const singleton = new SnippetService()

Object.assign(SnippetService, {
  singleton
})

export {
  singleton
}

export default SnippetService
