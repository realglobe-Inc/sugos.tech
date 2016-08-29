/**
 * @class LocaleService
 */
'use strict'

const abind = require('abind')
const { get } = require('bwindow')

/**
 * Create a resolver function for message
 * @param {Object} messages - Message data
 * @returns {function}
 */
function messageResolver (messages) {
  /**
   * Resolver function
   * @param {string} keypath - Keypath to resolve
   */
  return function resolver (keypath, options = {}) {
    let { formatter = (message) => message } = options
    if (!keypath) {
      return keypath
    }
    if (typeof keypath === 'object') {
      return Object.keys(keypath)
        .filter((key) => !/^\$/.test(key))
        .reduce((resolved, key) => Object.assign(resolved, {
          [key]: resolver(keypath[ key ], {
            formatter: (message) => formatter(message, key)
          })
        }), {})
    }
    let keys = keypath.split(/\./)
    let data = messages
    while (data && keys.length > 0) {
      let key = keys.shift()
      let message = data[ key ]
      if (typeof message === 'string') {
        return formatter(message)
      }
      data = message
    }
    console.warn(`Message not found with keypath: ${keypath}`)
  }
}

/**
 * Create a multiple message resolvers
 * @param messages
 * @returns {Array}
 */
function messageResolvers (messages) {
  return Object.keys(messages)
    .reduce((resolvers, lang) => Object.assign(resolvers, {
      [lang]: messageResolver(messages[ lang ])
    }), {})
}

/** @lends LocaleService */
class LocaleService {
  constructor (lang = 'en') {
    const s = this
    abind(s)
    s.setLang(lang)
    s.setLoc({})
  }

  setLoc (loc) {
    const s = this
    s.resolvers = messageResolvers(loc)
  }

  /**
   * Set lang
   * @param lang
   */
  setLang (lang) {
    const s = this
    s.lang = lang
  }

  /**
   * Localize message
   * @param keypath - Message key path
   * @param {Object} [options=[]} - Optional settings
   * @returns {Promise}
   */
  localize (keypath, options = {}) {
    const s = this
    let { resolvers, lang } = s
    let resolver = resolvers[ lang ] || resolvers[ Object.keys(resolvers).shift() ]
    return resolver(keypath, options)
  }

  /**
   * Alias for localize function
   * @param {...*} args - Args to resolve
   * @returns {string} - Resolved messaged
   */
  l (...args) {
    const s = this
    return s.localize(...args)
  }
}

const singleton = new LocaleService()

Object.assign(LocaleService, {
  singleton
})

export {
  singleton
}

export default LocaleService
