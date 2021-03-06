/**
 * Exports locale settings.
 *
 * Generated by apeman-tmpl on 5/11/2016,
 * from a template provided by apeman-tmpl-locale.
 *
 * @see https://github.com/apeman-labo/apemanlocale
 */

'use strict'

const apemanlocale = require('apemanlocale')

let locales = apemanlocale(__dirname, {
  default: 'en',
  buildin: true, // Use buildin messages as fallback
  fallback: true
})

// Check consistency.
locales.validate()

module.exports = locales

if (!module.parent) {
  // Print settings to stdout.
  locales.print()
}
