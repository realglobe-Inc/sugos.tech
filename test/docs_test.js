/**
 * Test case for index.
 * Runs with mocha.
 */

describe('docs', function () {
  it('loads without problems', function () {
    var div = document.createElement('div')
    div.id = 'docs-wrap'
    document.body.appendChild(div)
  })
})

/* global describe, it */
