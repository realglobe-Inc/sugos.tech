'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Logo = _react2.default.createClass({
  displayName: 'Logo',
  render: function render() {
    return _react2.default.createElement(
      'h1',
      { className: 'logo' },
      'SUGOS'.split('').map(function (letter, i) {
        return _react2.default.createElement(
          'span',
          { key: i },
          letter
        );
      })
    );
  }
});