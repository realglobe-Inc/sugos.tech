/**
 * Header component
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _package = require('../../../package.json');

var _package2 = _interopRequireDefault(_package);

var _apemanReactBasic = require('apeman-react-basic');

var _logo = require('../fragments/logo');

var _logo2 = _interopRequireDefault(_logo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Header = _react2.default.createClass({
  displayName: 'Header',
  render: function render() {
    return _react2.default.createElement(
      _apemanReactBasic.ApHeader,
      { className: 'header' },
      _react2.default.createElement(
        _apemanReactBasic.ApContainer,
        null,
        _react2.default.createElement(
          _apemanReactBasic.ApHeaderLogo,
          null,
          _react2.default.createElement(_logo2.default, null)
        )
      )
    );
  }
});

exports.default = Header;