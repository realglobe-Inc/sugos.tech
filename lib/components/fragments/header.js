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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Header = _react2.default.createClass({
  displayName: 'Header',
  render: function render() {
    return _react2.default.createElement(
      _apemanReactBasic.ApHeader,
      null,
      _react2.default.createElement(
        _apemanReactBasic.ApHeaderLogo,
        null,
        _package2.default.name
      )
    );
  }
});

exports.default = Header;