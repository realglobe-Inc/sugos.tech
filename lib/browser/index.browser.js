'use strict';

var _apemanBrwsReact = require('apeman-brws-react');

var _apemanBrwsReact2 = _interopRequireDefault(_apemanBrwsReact);

var _index = require('../components/index.component');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONTAINER_ID = 'index-wrap';
window.onload = function () {
  _apemanBrwsReact2.default.render(CONTAINER_ID, _index2.default, {}, function done() {
    // The component is ready.
  });
};