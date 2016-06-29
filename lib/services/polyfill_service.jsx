/**
 * @class PolyfillService
 */
'use strict'

class PolyfillService {
  defineRequestAnimationFrame () {
    return window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      ((f) => window.setTimeout(f, 1000 / 60))
  }

  defineCancelAnimationFrame () {
    return window.cancelAnimationFrame ||
      window.cancelRequestAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.msCancelAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      window.oCancelAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      ((id) => window.clearTimeout(id))
  }
}

const singleton = new PolyfillService()

Object.assign(PolyfillService, {
  singleton
})

export {
  singleton
}

export default PolyfillService
