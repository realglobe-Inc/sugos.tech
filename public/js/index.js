(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../components/index.component":3,"apeman-brws-react":"apeman-brws-react"}],2:[function(require,module,exports){
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
},{"../../../package.json":4,"apeman-react-basic":"apeman-react-basic","react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _header = require('./fragments/header');

var _header2 = _interopRequireDefault(_header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IndexComponent = _react2.default.createClass({
  displayName: 'IndexComponent',
  getInitialState: function getInitialState() {
    return {};
  },
  componentWillMount: function componentWillMount() {
    var s = this;
  },
  render: function render() {
    var s = this;
    return _react2.default.createElement(
      _apemanReactBasic.ApPage,
      null,
      _react2.default.createElement(_header2.default, null),
      _react2.default.createElement(
        _apemanReactBasic.ApMain,
        null,
        'This is the index'
      )
    );
  }
});

exports.default = IndexComponent;
},{"./fragments/header":2,"apeman-react-basic":"apeman-react-basic","react":"react"}],4:[function(require,module,exports){
module.exports={
  "name": "sugos.tech",
  "version": "1.0.0",
  "description": "Homepage of SUGOS",
  "main": "lib",
  "scripts": {
    "debug": "./ci/watch.js & npm start",
    "postinstall": "./ci/postinstall.js",
    "start": "http-server public -d false -p 3000",
    "test": "./ci/test.js"
  },
  "repository": "realglobe-Inc/sugos.tech",
  "keywords": [
    "apeman"
  ],
  "author": {
    "email": "okunishitaka.com@gmail.com",
    "name": "Taka Okunishi",
    "url": "http://okunishitaka.com"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/realglobe-Inc/sugos.tech/issues"
  },
  "homepage": "https://github.com/realglobe-Inc/sugos.tech#readme",
  "dependencies": {
    "apeman-brws-react": "^2.0.1",
    "apeman-brws-request": "^2.0.0",
    "apeman-proto-abstract": "^4.0.1",
    "apeman-proto-react": "^4.1.0",
    "apeman-proto-scss": "^4.0.6",
    "apeman-react-basic": "^6.2.1",
    "apeman-react-decorative": "^2.0.4",
    "apeman-react-handy": "^4.0.2",
    "apeman-react-style": "^4.0.0",
    "apeman-react-theme": "^4.2.1",
    "co": "^4.6.0",
    "execcli": "^4.0.5",
    "http-server": "^0.9.0",
    "stringcase": "^2.0.1"
  },
  "devDependencies": {
    "ape-compiling": "^4.1.2",
    "ape-covering": "^3.0.3",
    "ape-deploying": "^4.0.2",
    "ape-releasing": "^3.1.1",
    "ape-reporting": "^3.0.1",
    "ape-tasking": "^4.0.0",
    "ape-testing": "^4.0.0",
    "ape-tmpl": "^5.0.2",
    "ape-updating": "^3.0.2",
    "ape-watching": "^2.1.1",
    "apeman-bud-mock": "^3.0.0",
    "arrayreduce": "^2.1.0",
    "closurecompiler": "^1.5.3",
    "coz": "^6.0.2",
    "injectmock": "^2.0.0",
    "react": "^15.1.0",
    "react-dom": "^15.1.0"
  },
  "engines": {
    "node": ">=6",
    "npm": ">=3"
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvYnJvd3Nlci9pbmRleC5icm93c2VyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2hlYWRlci5qcyIsImxpYi9jb21wb25lbnRzL2luZGV4LmNvbXBvbmVudC5qcyIsInBhY2thZ2UuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9hcGVtYW5CcndzUmVhY3QgPSByZXF1aXJlKCdhcGVtYW4tYnJ3cy1yZWFjdCcpO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGVtYW5CcndzUmVhY3QpO1xuXG52YXIgX2luZGV4ID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9pbmRleC5jb21wb25lbnQnKTtcblxudmFyIF9pbmRleDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pbmRleCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBDT05UQUlORVJfSUQgPSAnaW5kZXgtd3JhcCc7XG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICBfYXBlbWFuQnJ3c1JlYWN0Mi5kZWZhdWx0LnJlbmRlcihDT05UQUlORVJfSUQsIF9pbmRleDIuZGVmYXVsdCwge30sIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgLy8gVGhlIGNvbXBvbmVudCBpcyByZWFkeS5cbiAgfSk7XG59OyIsIi8qKlxuICogSGVhZGVyIGNvbXBvbmVudFxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9wYWNrYWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vcGFja2FnZS5qc29uJyk7XG5cbnZhciBfcGFja2FnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYWNrYWdlKTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBIZWFkZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyLFxuICAgICAgbnVsbCxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlckxvZ28sXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9wYWNrYWdlMi5kZWZhdWx0Lm5hbWVcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSGVhZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9oZWFkZXIgPSByZXF1aXJlKCcuL2ZyYWdtZW50cy9oZWFkZXInKTtcblxudmFyIF9oZWFkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVhZGVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEluZGV4Q29tcG9uZW50ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdJbmRleENvbXBvbmVudCcsXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBQYWdlLFxuICAgICAgbnVsbCxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9oZWFkZXIyLmRlZmF1bHQsIG51bGwpLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwTWFpbixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgJ1RoaXMgaXMgdGhlIGluZGV4J1xuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBJbmRleENvbXBvbmVudDsiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcInN1Z29zLnRlY2hcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkhvbWVwYWdlIG9mIFNVR09TXCIsXG4gIFwibWFpblwiOiBcImxpYlwiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiZGVidWdcIjogXCIuL2NpL3dhdGNoLmpzICYgbnBtIHN0YXJ0XCIsXG4gICAgXCJwb3N0aW5zdGFsbFwiOiBcIi4vY2kvcG9zdGluc3RhbGwuanNcIixcbiAgICBcInN0YXJ0XCI6IFwiaHR0cC1zZXJ2ZXIgcHVibGljIC1kIGZhbHNlIC1wIDMwMDBcIixcbiAgICBcInRlc3RcIjogXCIuL2NpL3Rlc3QuanNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjogXCJyZWFsZ2xvYmUtSW5jL3N1Z29zLnRlY2hcIixcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJhcGVtYW5cIlxuICBdLFxuICBcImF1dGhvclwiOiB7XG4gICAgXCJlbWFpbFwiOiBcIm9rdW5pc2hpdGFrYS5jb21AZ21haWwuY29tXCIsXG4gICAgXCJuYW1lXCI6IFwiVGFrYSBPa3VuaXNoaVwiLFxuICAgIFwidXJsXCI6IFwiaHR0cDovL29rdW5pc2hpdGFrYS5jb21cIlxuICB9LFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJidWdzXCI6IHtcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9yZWFsZ2xvYmUtSW5jL3N1Z29zLnRlY2gvaXNzdWVzXCJcbiAgfSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9yZWFsZ2xvYmUtSW5jL3N1Z29zLnRlY2gjcmVhZG1lXCIsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImFwZW1hbi1icndzLXJlYWN0XCI6IFwiXjIuMC4xXCIsXG4gICAgXCJhcGVtYW4tYnJ3cy1yZXF1ZXN0XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJhcGVtYW4tcHJvdG8tYWJzdHJhY3RcIjogXCJeNC4wLjFcIixcbiAgICBcImFwZW1hbi1wcm90by1yZWFjdFwiOiBcIl40LjEuMFwiLFxuICAgIFwiYXBlbWFuLXByb3RvLXNjc3NcIjogXCJeNC4wLjZcIixcbiAgICBcImFwZW1hbi1yZWFjdC1iYXNpY1wiOiBcIl42LjIuMVwiLFxuICAgIFwiYXBlbWFuLXJlYWN0LWRlY29yYXRpdmVcIjogXCJeMi4wLjRcIixcbiAgICBcImFwZW1hbi1yZWFjdC1oYW5keVwiOiBcIl40LjAuMlwiLFxuICAgIFwiYXBlbWFuLXJlYWN0LXN0eWxlXCI6IFwiXjQuMC4wXCIsXG4gICAgXCJhcGVtYW4tcmVhY3QtdGhlbWVcIjogXCJeNC4yLjFcIixcbiAgICBcImNvXCI6IFwiXjQuNi4wXCIsXG4gICAgXCJleGVjY2xpXCI6IFwiXjQuMC41XCIsXG4gICAgXCJodHRwLXNlcnZlclwiOiBcIl4wLjkuMFwiLFxuICAgIFwic3RyaW5nY2FzZVwiOiBcIl4yLjAuMVwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImFwZS1jb21waWxpbmdcIjogXCJeNC4xLjJcIixcbiAgICBcImFwZS1jb3ZlcmluZ1wiOiBcIl4zLjAuM1wiLFxuICAgIFwiYXBlLWRlcGxveWluZ1wiOiBcIl40LjAuMlwiLFxuICAgIFwiYXBlLXJlbGVhc2luZ1wiOiBcIl4zLjEuMVwiLFxuICAgIFwiYXBlLXJlcG9ydGluZ1wiOiBcIl4zLjAuMVwiLFxuICAgIFwiYXBlLXRhc2tpbmdcIjogXCJeNC4wLjBcIixcbiAgICBcImFwZS10ZXN0aW5nXCI6IFwiXjQuMC4wXCIsXG4gICAgXCJhcGUtdG1wbFwiOiBcIl41LjAuMlwiLFxuICAgIFwiYXBlLXVwZGF0aW5nXCI6IFwiXjMuMC4yXCIsXG4gICAgXCJhcGUtd2F0Y2hpbmdcIjogXCJeMi4xLjFcIixcbiAgICBcImFwZW1hbi1idWQtbW9ja1wiOiBcIl4zLjAuMFwiLFxuICAgIFwiYXJyYXlyZWR1Y2VcIjogXCJeMi4xLjBcIixcbiAgICBcImNsb3N1cmVjb21waWxlclwiOiBcIl4xLjUuM1wiLFxuICAgIFwiY296XCI6IFwiXjYuMC4yXCIsXG4gICAgXCJpbmplY3Rtb2NrXCI6IFwiXjIuMC4wXCIsXG4gICAgXCJyZWFjdFwiOiBcIl4xNS4xLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xNS4xLjBcIlxuICB9LFxuICBcImVuZ2luZXNcIjoge1xuICAgIFwibm9kZVwiOiBcIj49NlwiLFxuICAgIFwibnBtXCI6IFwiPj0zXCJcbiAgfVxufVxuIl19
