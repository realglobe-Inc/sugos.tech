/**
 * Test case for index.
 * Runs with mocha.
 */

describe('index', function () {
  it('loads without problems', function () {
    var div = document.createElement('div')
    div.id = 'index-wrap'
    document.body.appendChild(div)
  })
})

/* global describe, it */
