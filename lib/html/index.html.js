/**
 * Prerender contents for index.html
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('../components/index.component');

var _index2 = _interopRequireDefault(_index);

var _color_constants = require('../constants/color_constants.json');

var _html = require('./html');

var _html2 = _interopRequireDefault(_html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IndexHtml = _react2.default.createClass({
  displayName: 'IndexHtml',
  render: function render() {
    var s = this;
    var props = s.props;

    return _react2.default.createElement(_html2.default, _extends({}, props, {
      js: ['javascripts/index.js'],
      css: ['stylesheets/index.css'],
      wrapId: 'index-wrap',
      component: _index2.default
    }));
  }
});

exports.default = IndexHtml;