/**
 * Prerender contents for index.html
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _apemanReactBasic = require('apeman-react-basic');

var _apemanReactTheme = require('apeman-react-theme');

var _index = require('../components/index.component');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FAVICON_URL = 'https://raw.githubusercontent.com/apeman-asset-labo/apeman-asset-images/master/dist/favicon/mock-favicon.png';
var DOMINANT_COLOR = '#38A';

var IndexHtml = _react2.default.createClass({
  displayName: 'IndexHtml',
  render: function render() {
    return _react2.default.createElement(
      _apemanReactBasic.ApHtml,
      null,
      _react2.default.createElement(
        _apemanReactBasic.ApHead,
        { chaset: 'utf-8',
          title: _package2.default.name,
          version: _package2.default.version,
          icon: FAVICON_URL,
          css: ['../css/index.css'],
          js: ['../js/external.cc.js', '../js/index.js'] },
        _react2.default.createElement(_apemanReactTheme.ApThemeStyle, { dominant: DOMINANT_COLOR }),
        _react2.default.createElement(_apemanReactBasic.ApFaIconStyle, null),
        _react2.default.createElement(_apemanReactBasic.ApIonIconStyle, null)
      ),
      _react2.default.createElement(
        _apemanReactBasic.ApBody,
        { style: { padding: 5 } },
        _react2.default.createElement(
          'div',
          { id: 'index-wrap' },
          _react2.default.createElement(_index2.default, null)
        )
      )
    );
  }
});

exports.default = IndexHtml;