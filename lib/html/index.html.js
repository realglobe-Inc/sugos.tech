/**
 * Prerender contents for index.html
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('../components/index.component');

var _index2 = _interopRequireDefault(_index);

var _colors = require('../colors.json');

var _html = require('./html');

var _html2 = _interopRequireDefault(_html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IndexHtml = _react2.default.createClass({
  displayName: 'IndexHtml',
  render: function render() {
    var s = this;
    return _react2.default.createElement(_html2.default, { name: 'index',
      wrapId: 'index-wrap',
      component: _index2.default
    });
  }
});

exports.default = IndexHtml;