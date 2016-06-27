'use strict';

var _apemanBrwsReact = require('apeman-brws-react');

var _apemanBrwsReact2 = _interopRequireDefault(_apemanBrwsReact);

var _index = require('../components/index.component');

var _index2 = _interopRequireDefault(_index);

var _redirect_service = require('../services/redirect_service');

var _redirect_service2 = _interopRequireDefault(_redirect_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONTAINER_ID = 'index-wrap';

function onload() {
  window.removeEventListener('DOMContentLoaded', onload);
  _redirect_service2.default.redirectIfNotAuth();
  var _window = window;
  var locale = _window.locale;

  _apemanBrwsReact2.default.render(CONTAINER_ID, _index2.default, {
    locale: locale
  }, function done() {
    // The component is ready.
  });
}

window.addEventListener('DOMContentLoaded', onload);