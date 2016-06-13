(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
/**
 * Browser script for cases.
 *
 * Generated by coz on 6/9/2016,
 * from a template provided by apeman-bud-mock.
 */
'use strict';

var _apemanBrwsReact = require('apeman-brws-react');

var _apemanBrwsReact2 = _interopRequireDefault(_apemanBrwsReact);

var _casesComponent = require('../components/cases.component.js');

var _casesComponent2 = _interopRequireDefault(_casesComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONTAINER_ID = 'cases-wrap';
window.onload = function () {
  var _window = window;
  var locale = _window.locale;

  _apemanBrwsReact2.default.render(CONTAINER_ID, _casesComponent2.default, {
    locale: locale
  }, function done() {
    // The component is ready.
  });
};
},{"../components/cases.component.js":4,"apeman-brws-react":"apeman-brws-react"}],4:[function(require,module,exports){
/**
 * Component of cases.
 *
 * Generated by coz on 6/9/2016,
 * from a template provided by apeman-bud-mock.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _apemanReactMixins = require('apeman-react-mixins');

var _header = require('./fragments/header');

var _header2 = _interopRequireDefault(_header);

var _showcase_view = require('./views/showcase_view');

var _showcase_view2 = _interopRequireDefault(_showcase_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CasesComponent = _react2.default.createClass({
  displayName: 'CasesComponent',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  getInitialState: function getInitialState() {
    return {};
  },
  getDefaultProps: function getDefaultProps() {
    return {
      stacker: new _apemanReactBasic.ApViewStack.Stacker({
        root: _showcase_view2.default,
        rootProps: {}
      })
    };
  },
  componentWillMount: function componentWillMount() {
    var s = this;
    var props = s.props;

    s.registerLocale(props.locale);
  },
  render: function render() {
    var s = this;
    var props = s.props;

    var l = s.getLocale();
    return _react2.default.createElement(
      _apemanReactBasic.ApPage,
      null,
      _react2.default.createElement(_header2.default, { tab: 'CASES' }),
      _react2.default.createElement(
        _apemanReactBasic.ApMain,
        null,
        _react2.default.createElement(_apemanReactBasic.ApViewStack, { stacker: props.stacker })
      )
    );
  }
});

exports.default = CasesComponent;
},{"./fragments/header":5,"./views/showcase_view":9,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],5:[function(require,module,exports){
/**
 * Header component
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactMixins = require('apeman-react-mixins');

var _apemanReactBasic = require('apeman-react-basic');

var _logo = require('../fragments/logo');

var _logo2 = _interopRequireDefault(_logo);

var _link_service = require('../../services/link_service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Header = _react2.default.createClass({
  displayName: 'Header',

  propTypes: {
    tab: _react.PropTypes.string
  },
  getDefaultProps: function getDefaultProps() {
    return {
      tab: null
    };
  },

  mixins: [_apemanReactMixins.ApLocaleMixin],
  render: function render() {
    var s = this;
    var props = s.props;
    var tab = props.tab;

    var l = s.getLocale();
    var _tabItem = _apemanReactBasic.ApHeaderTabItem.createItem;
    var _link = function _link() {
      return _link_service.singleton.resolveHtmlLink.apply(_link_service.singleton, arguments);
    };
    return _react2.default.createElement(
      _apemanReactBasic.ApHeader,
      { className: 'header' },
      _react2.default.createElement(
        _apemanReactBasic.ApContainer,
        null,
        _react2.default.createElement(
          _apemanReactBasic.ApHeaderLogo,
          { href: _link('index.html') },
          _react2.default.createElement(_logo2.default, null)
        ),
        _react2.default.createElement(
          _apemanReactBasic.ApHeaderTab,
          null,
          _tabItem(l('pages.DOCS_PAGE'), _link('docs.html'), { selected: tab === 'DOCS' }),
          _tabItem(l('pages.CASES_PAGE'), _link('cases.html'), { selected: tab === 'CASES' })
        )
      )
    );
  }
});

exports.default = Header;
},{"../../services/link_service":11,"../fragments/logo":7,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactMixins = require('apeman-react-mixins');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _color_constants = require('../../constants/color_constants.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Joiner = _react2.default.createClass({
  displayName: 'Joiner',

  propTypes: {
    color: _react.PropTypes.string,
    lineWidth: _react.PropTypes.number
  },
  getDefaultProps: function getDefaultProps() {
    return {
      color: _color_constants.DOMINANT,
      lineWidth: 4
    };
  },

  mixins: [_apemanReactMixins.ApLayoutMixin, _apemanReactMixins.ApPureMixin],
  render: function render() {
    var s = this;
    var props = s.props;
    var layouts = s.layouts;
    var color = props.color;
    var lineWidth = props.lineWidth;
    var _layouts$svg = layouts.svg;
    var width = _layouts$svg.width;
    var height = _layouts$svg.height;
    var minX = 0;
    var midX = width / 2;
    var maxX = width;
    var minY = 0;
    var midY = height / 2;
    var maxY = height;

    var _line = function _line(x1, x2, y1, y2) {
      return _react2.default.createElement('line', { x1: x1, x2: x2, y1: y1, y2: y2 });
    };

    var xTilt = 0.1;
    var yTilt = 0.3;

    var x1 = minX;
    var x2 = midX * (1 + xTilt);
    var x3 = midX * (1 - xTilt);
    var x4 = maxX;
    var y1 = midY;
    var y2 = midY * (1 - yTilt);
    var y3 = midY * (1 + yTilt);

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('joiner', props.className),
        ref: function ref(joiner) {
          s.joiner = joiner;
        } },
      _react2.default.createElement(
        'svg',
        { width: width,
          height: height,
          stroke: color,
          strokeWidth: lineWidth
        },
        _line(x1, x2, y1, y2),
        _line(x2, x3, y2, y3),
        _line(x3, x4, y3, y1)
      )
    );
  },


  // -----------------
  // For ApLayoutMixin
  // -----------------
  getInitialLayouts: function getInitialLayouts() {
    return {
      svg: { width: 100, height: 40 }
    };
  },
  calcLayouts: function calcLayouts() {
    var s = this;
    var joiner = s.joiner;

    if (!joiner) {
      return s.getInitialLayouts();
    }

    var _joiner$getBoundingCl = joiner.getBoundingClientRect();

    var width = _joiner$getBoundingCl.width;
    var height = _joiner$getBoundingCl.height;

    return {
      svg: { width: width, height: height }
    };
  }
});

exports.default = Joiner;
},{"../../constants/color_constants.json":10,"apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","react":"react"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Logo = _react2.default.createClass({
  displayName: 'Logo',
  render: function render() {
    var s = this;
    return _react2.default.createElement(
      'h1',
      { className: 'logo' },
      'SUGOS'
    );
  }
});

exports.default = Logo;
},{"react":"react"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sgReactComponents = require('sg-react-components');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _apemanReactMixins = require('apeman-react-mixins');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Video = _react2.default.createClass({
  displayName: 'Video',

  mixins: [_apemanReactMixins.ApTouchMixin],
  propTypes: {
    src: _react.PropTypes.string,
    width: _react.PropTypes.number,
    height: _react.PropTypes.number,
    translateX: _react.PropTypes.number,
    translateY: _react.PropTypes.number
  },
  getDefaultProps: function getDefaultProps() {
    return {};
  },
  render: function render() {
    var s = this;
    var props = s.props;
    var translateX = props.translateX;
    var translateY = props.translateY;

    var style = { transform: 'translate(' + translateX + 'px, ' + translateY + 'px)' };
    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('video', props.className) },
      _react2.default.createElement(
        'div',
        { className: 'video-inner' },
        _react2.default.createElement(_sgReactComponents.SgVideo, { src: props.src,
          style: style,
          width: props.width,
          height: props.height,
          loop: true,
          autoPlay: function autoPlay(player) {
            return s.player = player;
          },
          muted: true
        })
      ),
      _react2.default.createElement('div', { className: 'video-overlay' })
    );
  }
});

exports.default = Video;
},{"apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","react":"react","sg-react-components":36}],9:[function(require,module,exports){
/**
 * View for showcase
 * @class Showcase
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _apemanReactMixins = require('apeman-react-mixins');

var _video = require('../fragments/video');

var _video2 = _interopRequireDefault(_video);

var _joiner = require('../fragments/joiner');

var _joiner2 = _interopRequireDefault(_joiner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ShowcaseView = _react2.default.createClass({
  displayName: 'ShowcaseView',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  render: function render() {
    var s = this;
    var l = s.getLocale();

    var _section = function _section(name, config) {
      var title = config.title;
      var text = config.text;
      var video1 = config.video1;
      var video2 = config.video2;

      return _react2.default.createElement(
        _apemanReactBasic.ApSection,
        { className: 'showcase-section',
          id: 'showcase-' + name + '-section',
          key: name },
        _react2.default.createElement(
          _apemanReactBasic.ApSectionHeader,
          null,
          title
        ),
        _react2.default.createElement(
          _apemanReactBasic.ApSectionBody,
          null,
          _react2.default.createElement(
            'div',
            { className: 'showcase-text-container' },
            _react2.default.createElement(
              'div',
              { className: 'showcase-description' },
              [].concat(text).map(function (text, i) {
                return _react2.default.createElement(
                  'p',
                  { key: i },
                  text
                );
              })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'showcase-video-container' },
            _react2.default.createElement(_video2.default, _extends({ className: 'showcase-video' }, video1)),
            _react2.default.createElement(_joiner2.default, { className: 'showcase-joiner' }),
            _react2.default.createElement(_video2.default, _extends({ className: 'showcase-video' }, video2))
          )
        )
      );
    };
    return _react2.default.createElement(
      _apemanReactBasic.ApView,
      { className: 'showcase-view' },
      _react2.default.createElement(_apemanReactBasic.ApViewHeader, { titleText: l('titles.SHOWCASE_TITLE') }),
      _react2.default.createElement(
        _apemanReactBasic.ApViewBody,
        null,
        _react2.default.createElement(
          'article',
          null,
          [_section('remote', {
            title: l('sections.CASE_REMOTE_TITLE'),
            text: l('sections.CASE_REMOTE_TEXT'),
            video1: {
              src: 'videos/SUGOS_remote_PLEN.mp4',
              translateX: -155,
              translateY: -10,
              width: 310
            },
            video2: {
              src: 'videos/SUGOS_remote_PLEN.mp4',
              translateX: 0,
              translateY: -20,
              width: 310
            }
          }), _section('sense', {
            title: l('sections.CASE_SENSE_TITLE'),
            text: l('sections.CASE_SENSE_TEXT'),
            video1: {
              src: 'videos/SUGOS_remote_sensor.mp4',
              translateX: -155,
              translateY: -5,
              width: 310
            },
            video2: {
              src: 'videos/SUGOS_remote_sensor.mp4',
              translateX: 0,
              translateY: -20,
              width: 310
            }
          }), _section('talk', {
            title: l('sections.CASE_SPEECH_RECOGNITION_TITLE'),
            text: l('sections.CASE_SPEECH_RECOGNITION_TEXT'),
            video1: {
              src: 'videos/pepper_speech_recognition.mp4',
              translateX: 0,
              translateY: 0,
              width: 470
            },
            video2: {
              src: 'videos/pepper_speech_recognition.mp4',
              translateX: -200,
              translateY: -30,
              width: 350
            }
          }), _section('text-input', {
            title: l('sections.CASE_TEXT_INPUT_TITLE'),
            text: l('sections.CASE_TEXT_INPUT_TEXT'),
            video1: {
              src: 'videos/pepper_text_input.mp4',
              translateX: -165,
              translateY: -20,
              width: 320
            },
            video2: {
              src: 'videos/pepper_text_input.mp4',
              translateX: -52,
              translateY: -30,
              width: 510
            }
          }), _section('edison-roomba', {
            title: l('sections.CASE_EDISON_ROOMBA_TITLE'),
            text: l('sections.CASE_EDISON_ROOMBA_TEXT'),
            video1: {
              src: 'videos/edison_roomba.mp4',
              translateX: -15,
              translateY: -30,
              width: 380
            },
            video2: {
              src: 'videos/edison_roomba.mp4',
              translateX: -162,
              translateY: -20,
              width: 320
            }
          })]
        )
      )
    );
  }
});

module.exports = ShowcaseView;
},{"../fragments/joiner":6,"../fragments/video":8,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],10:[function(require,module,exports){
module.exports={
  "DOMINANT": "#d6b810"
}
},{}],11:[function(require,module,exports){
(function (process){
/**
 * @class LinkService
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');

/** @lends LinkService */

var LinkService = function () {
  function LinkService() {
    _classCallCheck(this, LinkService);
  }

  _createClass(LinkService, [{
    key: 'resolveHtmlLink',


    /**
     * Resolve a html link
     * @param {string} filename - Html file name
     * @returns {string} - Resolved file name
     */
    value: function resolveHtmlLink(filename) {
      var s = this;
      var lang = s._getLang();
      var htmlDir = lang ? 'html/' + lang : 'html';
      return path.join(htmlDir, filename);
    }
  }, {
    key: '_getLang',
    value: function _getLang() {
      if (typeof window === 'undefined') {
        return process.env.LANG;
      }
      return window.lang;
    }
  }]);

  return LinkService;
}();

var singleton = new LinkService();

Object.assign(LinkService, {
  singleton: singleton
});

exports.singleton = singleton;
exports.default = LinkService;
}).call(this,require('_process'))

},{"_process":2,"path":1}],12:[function(require,module,exports){
/**
 * apeman react package for switch components
 * @constructor ApSwitch
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _apemanReactMixins = require('apeman-react-mixins');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends ApSwitch */
var ApSwitch = _react2.default.createClass({
  displayName: 'ApSwitch',


  // --------------------
  // Specs
  // --------------------

  propTypes: {
    /** Switch on or not */
    on: _react.PropTypes.bool.isRequired,
    /** Handle for tap event */
    onTap: _react.PropTypes.func.isRequired,
    /** Title text for on state */
    onTitle: _react.PropTypes.string,
    /** Title text for off state */
    offTitle: _react.PropTypes.string,
    /** Width of component */
    width: _react.PropTypes.number
  },

  mixins: [_apemanReactMixins.ApPureMixin, _apemanReactMixins.ApTouchMixin, _apemanReactMixins.ApUUIDMixin],

  statics: {},

  getInitialState: function getInitialState() {
    return {};
  },
  getDefaultProps: function getDefaultProps() {
    return {
      on: false,
      onTitle: '',
      offTitle: ''
    };
  },
  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;
    var width = props.width;

    var id = props.hasOwnProperty('id') ? props.id : s.uuid;
    var className = (0, _classnames2.default)('ap-switch', {
      'ap-switch-on': props.on,
      'ap-switch-off': !props.on
    }, props.className);
    return _react2.default.createElement(
      'div',
      { className: className,
        style: Object.assign({ width: width }, props.style),
        id: id
      },
      _react2.default.createElement(
        'div',
        { className: 'ap-switch-inner' },
        s._renderLabel(id + '-radio-off', 'ap-switch-on-label', props.onTitle),
        s._renderRadio(id + '-radio-off', 'off', !props.on),
        _react2.default.createElement('div', { className: 'ap-switch-handle' }),
        s._renderLabel(id + '-radio-on', 'ap-switch-off-label', props.offTitle),
        s._renderRadio(id + '-radio-on', 'on', !!props.on)
      ),
      props.children
    );
  },


  // --------------------
  // Lifecycle
  // --------------------

  // ------------------
  // Custom
  // ------------------

  noop: function noop() {},


  // ------------------
  // Private
  // ------------------

  _renderLabel: function _renderLabel(htmlFor, className, title) {
    var s = this;
    return _react2.default.createElement(
      'label',
      { htmlFor: htmlFor,
        className: (0, _classnames2.default)('ap-switch-label', className) },
      _react2.default.createElement(
        'span',
        { className: 'ap-switch-label-text' },
        title
      )
    );
  },
  _renderRadio: function _renderRadio(id, value, checked) {
    var s = this;
    return _react2.default.createElement('input', { type: 'radio', id: id,
      value: value,
      checked: checked,
      onChange: s.noop,
      className: 'ap-switch-radio' });
  }
});

exports.default = ApSwitch;

},{"apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","react":"react"}],13:[function(require,module,exports){
/**
 * Style for ApSwitch.
 * @constructor ApSwitchStyle
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactStyle = require('apeman-react-style');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends ApSwitchStyle */
var ApSwitchStyle = _react2.default.createClass({
  displayName: 'ApSwitchStyle',

  propTypes: {
    style: _react.PropTypes.object,
    highlightColor: _react.PropTypes.string
  },
  getDefaultProps: function getDefaultProps() {
    return {
      style: {},
      highlightColor: _apemanReactStyle.ApStyle.DEFAULT_HIGHLIGHT_COLOR,
      backgroundColor: _apemanReactStyle.ApStyle.DEFAULT_BACKGROUND_COLOR,
      borderColor: '#CCC'
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;
    var highlightColor = props.highlightColor;
    var backgroundColor = props.backgroundColor;
    var borderColor = props.borderColor;

    var handleSize = 24;
    var transition = 400;
    var minWidth = handleSize * 1.5;
    var data = {
      '.ap-switch': {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
      },
      '.ap-switch-radio': {
        display: 'none'
      },
      '.ap-switch-label': {
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontSize: '14px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        padding: 0,
        flexGrow: 1,
        flexShrink: 1,
        cursor: 'pointer',
        transition: 'width ' + transition + 'ms',
        lineHeight: handleSize + 'px'
      },
      '.ap-switch-label-text': {
        display: 'inline-block',
        width: '100%',
        padding: '0 8px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: minWidth
      },
      '.ap-switch-on-label': {
        background: highlightColor,
        color: 'white',
        borderRadius: handleSize / 2 + 'px 0 0 ' + handleSize / 2 + 'px',
        marginRight: -1 * handleSize / 2
      },
      '.ap-switch-off-label': {
        background: '#FAFAFA',
        color: '#AAA',
        borderRadius: '0 ' + handleSize / 2 + 'px ' + handleSize / 2 + 'px 0',
        marginLeft: -1 * handleSize / 2
      },
      '.ap-switch-on .ap-switch-off-label': {
        width: handleSize / 2 + 2 + 'px !important'
      },
      '.ap-switch-off .ap-switch-on-label': {
        width: handleSize / 2 + 2 + 'px !important'
      },
      '.ap-switch-inner': {
        display: 'inline-flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: backgroundColor,
        height: handleSize,
        borderRadius: handleSize / 2 + 1,
        minWidth: minWidth,
        border: '1px solid ' + borderColor,
        overflow: 'hidden',
        width: '100%'
      },
      '.ap-switch-handle': {
        display: 'inline-block',
        borderRadius: '50%',
        width: handleSize,
        height: handleSize,
        backgroundColor: 'white',
        border: '1px solid ' + borderColor,
        flexGrow: 0,
        flexShrink: 0,
        position: 'relative',
        zIndex: 4
      }
    };
    var smallMediaData = {};
    var mediumMediaData = {};
    var largeMediaData = {};
    return _react2.default.createElement(
      _apemanReactStyle.ApStyle,
      { data: Object.assign(data, props.style),
        smallMediaData: smallMediaData,
        mediumMediaData: mediumMediaData,
        largeMediaData: largeMediaData
      },
      props.children
    );
  }
});

exports.default = ApSwitchStyle;

},{"apeman-react-style":"apeman-react-style","react":"react"}],14:[function(require,module,exports){
/**
 * apeman react package for switch components
 * @module apeman-react-switch
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get ApSwitchStyle () { return d(require('./ap_switch_style')) },
  get ApSwitch () { return d(require('./ap_switch')) }
}

},{"./ap_switch":12,"./ap_switch_style":13}],15:[function(require,module,exports){
/**
 * Set alpha value
 * @function alpha
 * @param {string} color - Color value.
 * @param {number} Alpha value. 0.00 to 1.00
 * @returns {string}
 */
'use strict'

const parse = require('./parse')

/** @lends alpha */
function alpha (color, alpha) {
  color = parse(color)
  return color.alpha(alpha).rgbaString()
}

module.exports = alpha

},{"./parse":22}],16:[function(require,module,exports){
/**
 * colorizer functions
 * @module colorizers
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get rotateColorizer () { return d(require('./rotate_colorizer')) }
}

},{"./rotate_colorizer":17}],17:[function(require,module,exports){
/**
 * Define a colorizer to generate unique colors
 * @function rotateColorizer
 * @param {string} base - Base color string
 * @returns {function} - Generated function
 */
'use strict'

const rotate = require('../rotate')

/** @lends rotateColorizer */
function rotateColorizer (base) {
  let colors = {}

  /**
   * Colorizer function
   * @param {string} id - Unique identifier
   * @returns {string} color - Color for the id
   */
  function colorizer (id) {
    let color = colors[ id ]
    if (color) {
      return color
    }
    let knownColors = Object.keys(colors).map((id) => colors[ id ])
    do {
      color = rotate(base, parseInt(Math.random() * 360.0))
      if (knownColors.length >= 360) {
        break
      }
    } while (~knownColors.indexOf(color))
    colors[ id ] = color
    return color
  }

  Object.assign(colorizer, { base, colors })
  return colorizer
}

module.exports = rotateColorizer

},{"../rotate":23}],18:[function(require,module,exports){
/**
 * Color utility.
 * @module apemancolor
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get alpha () { return d(require('./alpha')) },
  get colorizers () { return d(require('./colorizers')) },
  get isDark () { return d(require('./is_dark')) },
  get isLight () { return d(require('./is_light')) },
  get mix () { return d(require('./mix')) },
  get parse () { return d(require('./parse')) },
  get rotate () { return d(require('./rotate')) }
}

},{"./alpha":15,"./colorizers":16,"./is_dark":19,"./is_light":20,"./mix":21,"./parse":22,"./rotate":23}],19:[function(require,module,exports){
/**
 * Detect dark or not
 * @function isDark
 * @param {string} color - Color value
 * @returns {boolean}
 */
'use strict'

const parse = require('./parse')
function isDark (color) {
  let { r, g, b } = parse(color).rgb()
  return (r * 0.299 + g * 0.587 + b * 0.114) < 186
}

module.exports = isDark

},{"./parse":22}],20:[function(require,module,exports){
/**
 * Detect light or not
 * @function isLight
 * @param {string} color - Color value
 * @returns {boolean}
 */
'use strict'

const isDark = require('./is_dark')
function isLight (color) {
  return !isDark(color)
}

module.exports = isLight

},{"./is_dark":19}],21:[function(require,module,exports){
/**
 * mix colors
 * @function mix
 * @param {string} color1 - Color value.
 * @param {string} color2 - Color value.
 * @returns {string}
 */
'use strict'

const parse = require('./parse')

/** @lends mix */
function mix (color1, color2) {
  return parse(color1).mix(parse(color2)).rgbaString()
}

module.exports = mix

},{"./parse":22}],22:[function(require,module,exports){
/**
 * Parse a color
 * @function parse
 * @param {value} - Color value
 * @returns {Object} - Parsed color instance.
 */
'use strict'

const color = require('color')

/** @lends parse */
function parse (value) {
  if (!value) {
    throw new Error('[apemancolor] Value is required.')
  }
  let parsed = color(value)
  if (!parsed) {
    throw new Error(`Invalid color: ${value}`)
  }
  return parsed
}

module.exports = parse

},{"color":28}],23:[function(require,module,exports){
/**
 * rotate color
 * @function rotate
 * @param {string} color - Color value.
 * @param {number} degree to rotate. 0 to 360
 * @returns {string}
 */
'use strict'

const parse = require('./parse')

/** @lends rotate */
function rotate (color, degree) {
  color = parse(color)
  return color.hue(color.hue() + Number(degree)).rgbaString()
}

module.exports = rotate

},{"./parse":22}],24:[function(require,module,exports){
/* MIT license */

module.exports = {
  rgb2hsl: rgb2hsl,
  rgb2hsv: rgb2hsv,
  rgb2hwb: rgb2hwb,
  rgb2cmyk: rgb2cmyk,
  rgb2keyword: rgb2keyword,
  rgb2xyz: rgb2xyz,
  rgb2lab: rgb2lab,
  rgb2lch: rgb2lch,

  hsl2rgb: hsl2rgb,
  hsl2hsv: hsl2hsv,
  hsl2hwb: hsl2hwb,
  hsl2cmyk: hsl2cmyk,
  hsl2keyword: hsl2keyword,

  hsv2rgb: hsv2rgb,
  hsv2hsl: hsv2hsl,
  hsv2hwb: hsv2hwb,
  hsv2cmyk: hsv2cmyk,
  hsv2keyword: hsv2keyword,

  hwb2rgb: hwb2rgb,
  hwb2hsl: hwb2hsl,
  hwb2hsv: hwb2hsv,
  hwb2cmyk: hwb2cmyk,
  hwb2keyword: hwb2keyword,

  cmyk2rgb: cmyk2rgb,
  cmyk2hsl: cmyk2hsl,
  cmyk2hsv: cmyk2hsv,
  cmyk2hwb: cmyk2hwb,
  cmyk2keyword: cmyk2keyword,

  keyword2rgb: keyword2rgb,
  keyword2hsl: keyword2hsl,
  keyword2hsv: keyword2hsv,
  keyword2hwb: keyword2hwb,
  keyword2cmyk: keyword2cmyk,
  keyword2lab: keyword2lab,
  keyword2xyz: keyword2xyz,

  xyz2rgb: xyz2rgb,
  xyz2lab: xyz2lab,
  xyz2lch: xyz2lch,

  lab2xyz: lab2xyz,
  lab2rgb: lab2rgb,
  lab2lch: lab2lch,

  lch2lab: lch2lab,
  lch2xyz: lch2xyz,
  lch2rgb: lch2rgb
}


function rgb2hsl(rgb) {
  var r = rgb[0]/255,
      g = rgb[1]/255,
      b = rgb[2]/255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, l;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g)/ delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  l = (min + max) / 2;

  if (max == min)
    s = 0;
  else if (l <= 0.5)
    s = delta / (max + min);
  else
    s = delta / (2 - max - min);

  return [h, s * 100, l * 100];
}

function rgb2hsv(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, v;

  if (max == 0)
    s = 0;
  else
    s = (delta/max * 1000)/10;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  v = ((max / 255) * 1000) / 10;

  return [h, s, v];
}

function rgb2hwb(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      h = rgb2hsl(rgb)[0],
      w = 1/255 * Math.min(r, Math.min(g, b)),
      b = 1 - 1/255 * Math.max(r, Math.max(g, b));

  return [h, w * 100, b * 100];
}

function rgb2cmyk(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      c, m, y, k;

  k = Math.min(1 - r, 1 - g, 1 - b);
  c = (1 - r - k) / (1 - k) || 0;
  m = (1 - g - k) / (1 - k) || 0;
  y = (1 - b - k) / (1 - k) || 0;
  return [c * 100, m * 100, y * 100, k * 100];
}

function rgb2keyword(rgb) {
  return reverseKeywords[JSON.stringify(rgb)];
}

function rgb2xyz(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  return [x * 100, y *100, z * 100];
}

function rgb2lab(rgb) {
  var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function rgb2lch(args) {
  return lab2lch(rgb2lab(args));
}

function hsl2rgb(hsl) {
  var h = hsl[0] / 360,
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      t1, t2, t3, rgb, val;

  if (s == 0) {
    val = l * 255;
    return [val, val, val];
  }

  if (l < 0.5)
    t2 = l * (1 + s);
  else
    t2 = l + s - l * s;
  t1 = 2 * l - t2;

  rgb = [0, 0, 0];
  for (var i = 0; i < 3; i++) {
    t3 = h + 1 / 3 * - (i - 1);
    t3 < 0 && t3++;
    t3 > 1 && t3--;

    if (6 * t3 < 1)
      val = t1 + (t2 - t1) * 6 * t3;
    else if (2 * t3 < 1)
      val = t2;
    else if (3 * t3 < 2)
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    else
      val = t1;

    rgb[i] = val * 255;
  }

  return rgb;
}

function hsl2hsv(hsl) {
  var h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      sv, v;

  if(l === 0) {
      // no need to do calc on black
      // also avoids divide by 0 error
      return [0, 0, 0];
  }

  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  v = (l + s) / 2;
  sv = (2 * s) / (l + s);
  return [h, sv * 100, v * 100];
}

function hsl2hwb(args) {
  return rgb2hwb(hsl2rgb(args));
}

function hsl2cmyk(args) {
  return rgb2cmyk(hsl2rgb(args));
}

function hsl2keyword(args) {
  return rgb2keyword(hsl2rgb(args));
}


function hsv2rgb(hsv) {
  var h = hsv[0] / 60,
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      hi = Math.floor(h) % 6;

  var f = h - Math.floor(h),
      p = 255 * v * (1 - s),
      q = 255 * v * (1 - (s * f)),
      t = 255 * v * (1 - (s * (1 - f))),
      v = 255 * v;

  switch(hi) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
  }
}

function hsv2hsl(hsv) {
  var h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      sl, l;

  l = (2 - s) * v;
  sl = s * v;
  sl /= (l <= 1) ? l : 2 - l;
  sl = sl || 0;
  l /= 2;
  return [h, sl * 100, l * 100];
}

function hsv2hwb(args) {
  return rgb2hwb(hsv2rgb(args))
}

function hsv2cmyk(args) {
  return rgb2cmyk(hsv2rgb(args));
}

function hsv2keyword(args) {
  return rgb2keyword(hsv2rgb(args));
}

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
function hwb2rgb(hwb) {
  var h = hwb[0] / 360,
      wh = hwb[1] / 100,
      bl = hwb[2] / 100,
      ratio = wh + bl,
      i, v, f, n;

  // wh + bl cant be > 1
  if (ratio > 1) {
    wh /= ratio;
    bl /= ratio;
  }

  i = Math.floor(6 * h);
  v = 1 - bl;
  f = 6 * h - i;
  if ((i & 0x01) != 0) {
    f = 1 - f;
  }
  n = wh + f * (v - wh);  // linear interpolation

  switch (i) {
    default:
    case 6:
    case 0: r = v; g = n; b = wh; break;
    case 1: r = n; g = v; b = wh; break;
    case 2: r = wh; g = v; b = n; break;
    case 3: r = wh; g = n; b = v; break;
    case 4: r = n; g = wh; b = v; break;
    case 5: r = v; g = wh; b = n; break;
  }

  return [r * 255, g * 255, b * 255];
}

function hwb2hsl(args) {
  return rgb2hsl(hwb2rgb(args));
}

function hwb2hsv(args) {
  return rgb2hsv(hwb2rgb(args));
}

function hwb2cmyk(args) {
  return rgb2cmyk(hwb2rgb(args));
}

function hwb2keyword(args) {
  return rgb2keyword(hwb2rgb(args));
}

function cmyk2rgb(cmyk) {
  var c = cmyk[0] / 100,
      m = cmyk[1] / 100,
      y = cmyk[2] / 100,
      k = cmyk[3] / 100,
      r, g, b;

  r = 1 - Math.min(1, c * (1 - k) + k);
  g = 1 - Math.min(1, m * (1 - k) + k);
  b = 1 - Math.min(1, y * (1 - k) + k);
  return [r * 255, g * 255, b * 255];
}

function cmyk2hsl(args) {
  return rgb2hsl(cmyk2rgb(args));
}

function cmyk2hsv(args) {
  return rgb2hsv(cmyk2rgb(args));
}

function cmyk2hwb(args) {
  return rgb2hwb(cmyk2rgb(args));
}

function cmyk2keyword(args) {
  return rgb2keyword(cmyk2rgb(args));
}


function xyz2rgb(xyz) {
  var x = xyz[0] / 100,
      y = xyz[1] / 100,
      z = xyz[2] / 100,
      r, g, b;

  r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

  // assume sRGB
  r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    : r = (r * 12.92);

  g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    : g = (g * 12.92);

  b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    : b = (b * 12.92);

  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);

  return [r * 255, g * 255, b * 255];
}

function xyz2lab(xyz) {
  var x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function xyz2lch(args) {
  return lab2lch(xyz2lab(args));
}

function lab2xyz(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      x, y, z, y2;

  if (l <= 8) {
    y = (l * 100) / 903.3;
    y2 = (7.787 * (y / 100)) + (16 / 116);
  } else {
    y = 100 * Math.pow((l + 16) / 116, 3);
    y2 = Math.pow(y / 100, 1/3);
  }

  x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

  z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

  return [x, y, z];
}

function lab2lch(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      hr, h, c;

  hr = Math.atan2(b, a);
  h = hr * 360 / 2 / Math.PI;
  if (h < 0) {
    h += 360;
  }
  c = Math.sqrt(a * a + b * b);
  return [l, c, h];
}

function lab2rgb(args) {
  return xyz2rgb(lab2xyz(args));
}

function lch2lab(lch) {
  var l = lch[0],
      c = lch[1],
      h = lch[2],
      a, b, hr;

  hr = h / 360 * 2 * Math.PI;
  a = c * Math.cos(hr);
  b = c * Math.sin(hr);
  return [l, a, b];
}

function lch2xyz(args) {
  return lab2xyz(lch2lab(args));
}

function lch2rgb(args) {
  return lab2rgb(lch2lab(args));
}

function keyword2rgb(keyword) {
  return cssKeywords[keyword];
}

function keyword2hsl(args) {
  return rgb2hsl(keyword2rgb(args));
}

function keyword2hsv(args) {
  return rgb2hsv(keyword2rgb(args));
}

function keyword2hwb(args) {
  return rgb2hwb(keyword2rgb(args));
}

function keyword2cmyk(args) {
  return rgb2cmyk(keyword2rgb(args));
}

function keyword2lab(args) {
  return rgb2lab(keyword2rgb(args));
}

function keyword2xyz(args) {
  return rgb2xyz(keyword2rgb(args));
}

var cssKeywords = {
  aliceblue:  [240,248,255],
  antiquewhite: [250,235,215],
  aqua: [0,255,255],
  aquamarine: [127,255,212],
  azure:  [240,255,255],
  beige:  [245,245,220],
  bisque: [255,228,196],
  black:  [0,0,0],
  blanchedalmond: [255,235,205],
  blue: [0,0,255],
  blueviolet: [138,43,226],
  brown:  [165,42,42],
  burlywood:  [222,184,135],
  cadetblue:  [95,158,160],
  chartreuse: [127,255,0],
  chocolate:  [210,105,30],
  coral:  [255,127,80],
  cornflowerblue: [100,149,237],
  cornsilk: [255,248,220],
  crimson:  [220,20,60],
  cyan: [0,255,255],
  darkblue: [0,0,139],
  darkcyan: [0,139,139],
  darkgoldenrod:  [184,134,11],
  darkgray: [169,169,169],
  darkgreen:  [0,100,0],
  darkgrey: [169,169,169],
  darkkhaki:  [189,183,107],
  darkmagenta:  [139,0,139],
  darkolivegreen: [85,107,47],
  darkorange: [255,140,0],
  darkorchid: [153,50,204],
  darkred:  [139,0,0],
  darksalmon: [233,150,122],
  darkseagreen: [143,188,143],
  darkslateblue:  [72,61,139],
  darkslategray:  [47,79,79],
  darkslategrey:  [47,79,79],
  darkturquoise:  [0,206,209],
  darkviolet: [148,0,211],
  deeppink: [255,20,147],
  deepskyblue:  [0,191,255],
  dimgray:  [105,105,105],
  dimgrey:  [105,105,105],
  dodgerblue: [30,144,255],
  firebrick:  [178,34,34],
  floralwhite:  [255,250,240],
  forestgreen:  [34,139,34],
  fuchsia:  [255,0,255],
  gainsboro:  [220,220,220],
  ghostwhite: [248,248,255],
  gold: [255,215,0],
  goldenrod:  [218,165,32],
  gray: [128,128,128],
  green:  [0,128,0],
  greenyellow:  [173,255,47],
  grey: [128,128,128],
  honeydew: [240,255,240],
  hotpink:  [255,105,180],
  indianred:  [205,92,92],
  indigo: [75,0,130],
  ivory:  [255,255,240],
  khaki:  [240,230,140],
  lavender: [230,230,250],
  lavenderblush:  [255,240,245],
  lawngreen:  [124,252,0],
  lemonchiffon: [255,250,205],
  lightblue:  [173,216,230],
  lightcoral: [240,128,128],
  lightcyan:  [224,255,255],
  lightgoldenrodyellow: [250,250,210],
  lightgray:  [211,211,211],
  lightgreen: [144,238,144],
  lightgrey:  [211,211,211],
  lightpink:  [255,182,193],
  lightsalmon:  [255,160,122],
  lightseagreen:  [32,178,170],
  lightskyblue: [135,206,250],
  lightslategray: [119,136,153],
  lightslategrey: [119,136,153],
  lightsteelblue: [176,196,222],
  lightyellow:  [255,255,224],
  lime: [0,255,0],
  limegreen:  [50,205,50],
  linen:  [250,240,230],
  magenta:  [255,0,255],
  maroon: [128,0,0],
  mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205],
  mediumorchid: [186,85,211],
  mediumpurple: [147,112,219],
  mediumseagreen: [60,179,113],
  mediumslateblue:  [123,104,238],
  mediumspringgreen:  [0,250,154],
  mediumturquoise:  [72,209,204],
  mediumvioletred:  [199,21,133],
  midnightblue: [25,25,112],
  mintcream:  [245,255,250],
  mistyrose:  [255,228,225],
  moccasin: [255,228,181],
  navajowhite:  [255,222,173],
  navy: [0,0,128],
  oldlace:  [253,245,230],
  olive:  [128,128,0],
  olivedrab:  [107,142,35],
  orange: [255,165,0],
  orangered:  [255,69,0],
  orchid: [218,112,214],
  palegoldenrod:  [238,232,170],
  palegreen:  [152,251,152],
  paleturquoise:  [175,238,238],
  palevioletred:  [219,112,147],
  papayawhip: [255,239,213],
  peachpuff:  [255,218,185],
  peru: [205,133,63],
  pink: [255,192,203],
  plum: [221,160,221],
  powderblue: [176,224,230],
  purple: [128,0,128],
  rebeccapurple: [102, 51, 153],
  red:  [255,0,0],
  rosybrown:  [188,143,143],
  royalblue:  [65,105,225],
  saddlebrown:  [139,69,19],
  salmon: [250,128,114],
  sandybrown: [244,164,96],
  seagreen: [46,139,87],
  seashell: [255,245,238],
  sienna: [160,82,45],
  silver: [192,192,192],
  skyblue:  [135,206,235],
  slateblue:  [106,90,205],
  slategray:  [112,128,144],
  slategrey:  [112,128,144],
  snow: [255,250,250],
  springgreen:  [0,255,127],
  steelblue:  [70,130,180],
  tan:  [210,180,140],
  teal: [0,128,128],
  thistle:  [216,191,216],
  tomato: [255,99,71],
  turquoise:  [64,224,208],
  violet: [238,130,238],
  wheat:  [245,222,179],
  white:  [255,255,255],
  whitesmoke: [245,245,245],
  yellow: [255,255,0],
  yellowgreen:  [154,205,50]
};

var reverseKeywords = {};
for (var key in cssKeywords) {
  reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
}

},{}],25:[function(require,module,exports){
var conversions = require("./conversions");

var convert = function() {
   return new Converter();
}

for (var func in conversions) {
  // export Raw versions
  convert[func + "Raw"] =  (function(func) {
    // accept array or plain args
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      return conversions[func](arg);
    }
  })(func);

  var pair = /(\w+)2(\w+)/.exec(func),
      from = pair[1],
      to = pair[2];

  // export rgb2hsl and ["rgb"]["hsl"]
  convert[from] = convert[from] || {};

  convert[from][to] = convert[func] = (function(func) { 
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      
      var val = conversions[func](arg);
      if (typeof val == "string" || val === undefined)
        return val; // keyword

      for (var i = 0; i < val.length; i++)
        val[i] = Math.round(val[i]);
      return val;
    }
  })(func);
}


/* Converter does lazy conversion and caching */
var Converter = function() {
   this.convs = {};
};

/* Either get the values for a space or
  set the values for a space, depending on args */
Converter.prototype.routeSpace = function(space, args) {
   var values = args[0];
   if (values === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof values == "number") {
      values = Array.prototype.slice.call(args);        
   }

   return this.setValues(space, values);
};
  
/* Set the values for a space, invalidating cache */
Converter.prototype.setValues = function(space, values) {
   this.space = space;
   this.convs = {};
   this.convs[space] = values;
   return this;
};

/* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */
Converter.prototype.getValues = function(space) {
   var vals = this.convs[space];
   if (!vals) {
      var fspace = this.space,
          from = this.convs[fspace];
      vals = convert[fspace][space](from);

      this.convs[space] = vals;
   }
  return vals;
};

["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function(space) {
   Converter.prototype[space] = function(vals) {
      return this.routeSpace(space, arguments);
   }
});

module.exports = convert;
},{"./conversions":24}],26:[function(require,module,exports){
module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};
},{}],27:[function(require,module,exports){
/* MIT license */
var colorNames = require('color-name');

module.exports = {
   getRgba: getRgba,
   getHsla: getHsla,
   getRgb: getRgb,
   getHsl: getHsl,
   getHwb: getHwb,
   getAlpha: getAlpha,

   hexString: hexString,
   rgbString: rgbString,
   rgbaString: rgbaString,
   percentString: percentString,
   percentaString: percentaString,
   hslString: hslString,
   hslaString: hslaString,
   hwbString: hwbString,
   keyword: keyword
}

function getRgba(string) {
   if (!string) {
      return;
   }
   var abbr =  /^#([a-fA-F0-9]{3})$/,
       hex =  /^#([a-fA-F0-9]{6})$/,
       rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
       per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
       keyword = /(\D+)/;

   var rgb = [0, 0, 0],
       a = 1,
       match = string.match(abbr);
   if (match) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i] + match[i], 16);
      }
   }
   else if (match = string.match(hex)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
   }
   else if (match = string.match(rgba)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i + 1]);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(per)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(keyword)) {
      if (match[1] == "transparent") {
         return [0, 0, 0, 0];
      }
      rgb = colorNames[match[1]];
      if (!rgb) {
         return;
      }
   }

   for (var i = 0; i < rgb.length; i++) {
      rgb[i] = scale(rgb[i], 0, 255);
   }
   if (!a && a != 0) {
      a = 1;
   }
   else {
      a = scale(a, 0, 1);
   }
   rgb[3] = a;
   return rgb;
}

function getHsla(string) {
   if (!string) {
      return;
   }
   var hsl = /^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hsl);
   if (match) {
      var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          s = scale(parseFloat(match[2]), 0, 100),
          l = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, s, l, a];
   }
}

function getHwb(string) {
   if (!string) {
      return;
   }
   var hwb = /^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hwb);
   if (match) {
    var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          w = scale(parseFloat(match[2]), 0, 100),
          b = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, w, b, a];
   }
}

function getRgb(string) {
   var rgba = getRgba(string);
   return rgba && rgba.slice(0, 3);
}

function getHsl(string) {
  var hsla = getHsla(string);
  return hsla && hsla.slice(0, 3);
}

function getAlpha(string) {
   var vals = getRgba(string);
   if (vals) {
      return vals[3];
   }
   else if (vals = getHsla(string)) {
      return vals[3];
   }
   else if (vals = getHwb(string)) {
      return vals[3];
   }
}

// generators
function hexString(rgb) {
   return "#" + hexDouble(rgb[0]) + hexDouble(rgb[1])
              + hexDouble(rgb[2]);
}

function rgbString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return rgbaString(rgba, alpha);
   }
   return "rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")";
}

function rgbaString(rgba, alpha) {
   if (alpha === undefined) {
      alpha = (rgba[3] !== undefined ? rgba[3] : 1);
   }
   return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2]
           + ", " + alpha + ")";
}

function percentString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return percentaString(rgba, alpha);
   }
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);

   return "rgb(" + r + "%, " + g + "%, " + b + "%)";
}

function percentaString(rgba, alpha) {
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);
   return "rgba(" + r + "%, " + g + "%, " + b + "%, " + (alpha || rgba[3] || 1) + ")";
}

function hslString(hsla, alpha) {
   if (alpha < 1 || (hsla[3] && hsla[3] < 1)) {
      return hslaString(hsla, alpha);
   }
   return "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)";
}

function hslaString(hsla, alpha) {
   if (alpha === undefined) {
      alpha = (hsla[3] !== undefined ? hsla[3] : 1);
   }
   return "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, "
           + alpha + ")";
}

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
function hwbString(hwb, alpha) {
   if (alpha === undefined) {
      alpha = (hwb[3] !== undefined ? hwb[3] : 1);
   }
   return "hwb(" + hwb[0] + ", " + hwb[1] + "%, " + hwb[2] + "%"
           + (alpha !== undefined && alpha !== 1 ? ", " + alpha : "") + ")";
}

function keyword(rgb) {
  return reverseNames[rgb.slice(0, 3)];
}

// helpers
function scale(num, min, max) {
   return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
  var str = num.toString(16).toUpperCase();
  return (str.length < 2) ? "0" + str : str;
}


//create a list of reverse color names
var reverseNames = {};
for (var name in colorNames) {
   reverseNames[colorNames[name]] = name;
}

},{"color-name":26}],28:[function(require,module,exports){
/* MIT license */
var convert = require('color-convert');
var string = require('color-string');

var Color = function (obj) {
	if (obj instanceof Color) {
		return obj;
	}
	if (!(this instanceof Color)) {
		return new Color(obj);
	}

	this.values = {
		rgb: [0, 0, 0],
		hsl: [0, 0, 0],
		hsv: [0, 0, 0],
		hwb: [0, 0, 0],
		cmyk: [0, 0, 0, 0],
		alpha: 1
	};

	// parse Color() argument
	var vals;
	if (typeof obj === 'string') {
		vals = string.getRgba(obj);
		if (vals) {
			this.setValues('rgb', vals);
		} else if (vals = string.getHsla(obj)) {
			this.setValues('hsl', vals);
		} else if (vals = string.getHwb(obj)) {
			this.setValues('hwb', vals);
		} else {
			throw new Error('Unable to parse color from string "' + obj + '"');
		}
	} else if (typeof obj === 'object') {
		vals = obj;
		if (vals.r !== undefined || vals.red !== undefined) {
			this.setValues('rgb', vals);
		} else if (vals.l !== undefined || vals.lightness !== undefined) {
			this.setValues('hsl', vals);
		} else if (vals.v !== undefined || vals.value !== undefined) {
			this.setValues('hsv', vals);
		} else if (vals.w !== undefined || vals.whiteness !== undefined) {
			this.setValues('hwb', vals);
		} else if (vals.c !== undefined || vals.cyan !== undefined) {
			this.setValues('cmyk', vals);
		} else {
			throw new Error('Unable to parse color from object ' + JSON.stringify(obj));
		}
	}
};

Color.prototype = {
	rgb: function () {
		return this.setSpace('rgb', arguments);
	},
	hsl: function () {
		return this.setSpace('hsl', arguments);
	},
	hsv: function () {
		return this.setSpace('hsv', arguments);
	},
	hwb: function () {
		return this.setSpace('hwb', arguments);
	},
	cmyk: function () {
		return this.setSpace('cmyk', arguments);
	},

	rgbArray: function () {
		return this.values.rgb;
	},
	hslArray: function () {
		return this.values.hsl;
	},
	hsvArray: function () {
		return this.values.hsv;
	},
	hwbArray: function () {
		if (this.values.alpha !== 1) {
			return this.values.hwb.concat([this.values.alpha]);
		}
		return this.values.hwb;
	},
	cmykArray: function () {
		return this.values.cmyk;
	},
	rgbaArray: function () {
		var rgb = this.values.rgb;
		return rgb.concat([this.values.alpha]);
	},
	hslaArray: function () {
		var hsl = this.values.hsl;
		return hsl.concat([this.values.alpha]);
	},
	alpha: function (val) {
		if (val === undefined) {
			return this.values.alpha;
		}
		this.setValues('alpha', val);
		return this;
	},

	red: function (val) {
		return this.setChannel('rgb', 0, val);
	},
	green: function (val) {
		return this.setChannel('rgb', 1, val);
	},
	blue: function (val) {
		return this.setChannel('rgb', 2, val);
	},
	hue: function (val) {
		if (val) {
			val %= 360;
			val = val < 0 ? 360 + val : val;
		}
		return this.setChannel('hsl', 0, val);
	},
	saturation: function (val) {
		return this.setChannel('hsl', 1, val);
	},
	lightness: function (val) {
		return this.setChannel('hsl', 2, val);
	},
	saturationv: function (val) {
		return this.setChannel('hsv', 1, val);
	},
	whiteness: function (val) {
		return this.setChannel('hwb', 1, val);
	},
	blackness: function (val) {
		return this.setChannel('hwb', 2, val);
	},
	value: function (val) {
		return this.setChannel('hsv', 2, val);
	},
	cyan: function (val) {
		return this.setChannel('cmyk', 0, val);
	},
	magenta: function (val) {
		return this.setChannel('cmyk', 1, val);
	},
	yellow: function (val) {
		return this.setChannel('cmyk', 2, val);
	},
	black: function (val) {
		return this.setChannel('cmyk', 3, val);
	},

	hexString: function () {
		return string.hexString(this.values.rgb);
	},
	rgbString: function () {
		return string.rgbString(this.values.rgb, this.values.alpha);
	},
	rgbaString: function () {
		return string.rgbaString(this.values.rgb, this.values.alpha);
	},
	percentString: function () {
		return string.percentString(this.values.rgb, this.values.alpha);
	},
	hslString: function () {
		return string.hslString(this.values.hsl, this.values.alpha);
	},
	hslaString: function () {
		return string.hslaString(this.values.hsl, this.values.alpha);
	},
	hwbString: function () {
		return string.hwbString(this.values.hwb, this.values.alpha);
	},
	keyword: function () {
		return string.keyword(this.values.rgb, this.values.alpha);
	},

	rgbNumber: function () {
		return (this.values.rgb[0] << 16) | (this.values.rgb[1] << 8) | this.values.rgb[2];
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.values.rgb;
		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}
		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();
		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}
		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	dark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.values.rgb;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	light: function () {
		return !this.dark();
	},

	negate: function () {
		var rgb = [];
		for (var i = 0; i < 3; i++) {
			rgb[i] = 255 - this.values.rgb[i];
		}
		this.setValues('rgb', rgb);
		return this;
	},

	lighten: function (ratio) {
		this.values.hsl[2] += this.values.hsl[2] * ratio;
		this.setValues('hsl', this.values.hsl);
		return this;
	},

	darken: function (ratio) {
		this.values.hsl[2] -= this.values.hsl[2] * ratio;
		this.setValues('hsl', this.values.hsl);
		return this;
	},

	saturate: function (ratio) {
		this.values.hsl[1] += this.values.hsl[1] * ratio;
		this.setValues('hsl', this.values.hsl);
		return this;
	},

	desaturate: function (ratio) {
		this.values.hsl[1] -= this.values.hsl[1] * ratio;
		this.setValues('hsl', this.values.hsl);
		return this;
	},

	whiten: function (ratio) {
		this.values.hwb[1] += this.values.hwb[1] * ratio;
		this.setValues('hwb', this.values.hwb);
		return this;
	},

	blacken: function (ratio) {
		this.values.hwb[2] += this.values.hwb[2] * ratio;
		this.setValues('hwb', this.values.hwb);
		return this;
	},

	greyscale: function () {
		var rgb = this.values.rgb;
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		this.setValues('rgb', [val, val, val]);
		return this;
	},

	clearer: function (ratio) {
		this.setValues('alpha', this.values.alpha - (this.values.alpha * ratio));
		return this;
	},

	opaquer: function (ratio) {
		this.setValues('alpha', this.values.alpha + (this.values.alpha * ratio));
		return this;
	},

	rotate: function (degrees) {
		var hue = this.values.hsl[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		this.values.hsl[0] = hue;
		this.setValues('hsl', this.values.hsl);
		return this;
	},

	/**
	 * Ported from sass implementation in C
	 * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
	 */
	mix: function (mixinColor, weight) {
		var color1 = this;
		var color2 = mixinColor;
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return this
			.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue()
			)
			.alpha(color1.alpha() * p + color2.alpha() * (1 - p));
	},

	toJSON: function () {
		return this.rgb();
	},

	clone: function () {
		return new Color(this.rgb());
	}
};

Color.prototype.getValues = function (space) {
	var vals = {};

	for (var i = 0; i < space.length; i++) {
		vals[space.charAt(i)] = this.values[space][i];
	}

	if (this.values.alpha !== 1) {
		vals.a = this.values.alpha;
	}

	// {r: 255, g: 255, b: 255, a: 0.4}
	return vals;
};

Color.prototype.setValues = function (space, vals) {
	var spaces = {
		rgb: ['red', 'green', 'blue'],
		hsl: ['hue', 'saturation', 'lightness'],
		hsv: ['hue', 'saturation', 'value'],
		hwb: ['hue', 'whiteness', 'blackness'],
		cmyk: ['cyan', 'magenta', 'yellow', 'black']
	};

	var maxes = {
		rgb: [255, 255, 255],
		hsl: [360, 100, 100],
		hsv: [360, 100, 100],
		hwb: [360, 100, 100],
		cmyk: [100, 100, 100, 100]
	};

	var i;
	var alpha = 1;
	if (space === 'alpha') {
		alpha = vals;
	} else if (vals.length) {
		// [10, 10, 10]
		this.values[space] = vals.slice(0, space.length);
		alpha = vals[space.length];
	} else if (vals[space.charAt(0)] !== undefined) {
		// {r: 10, g: 10, b: 10}
		for (i = 0; i < space.length; i++) {
			this.values[space][i] = vals[space.charAt(i)];
		}

		alpha = vals.a;
	} else if (vals[spaces[space][0]] !== undefined) {
		// {red: 10, green: 10, blue: 10}
		var chans = spaces[space];

		for (i = 0; i < space.length; i++) {
			this.values[space][i] = vals[chans[i]];
		}

		alpha = vals.alpha;
	}

	this.values.alpha = Math.max(0, Math.min(1, (alpha === undefined ? this.values.alpha : alpha)));

	if (space === 'alpha') {
		return false;
	}

	var capped;

	// cap values of the space prior converting all values
	for (i = 0; i < space.length; i++) {
		capped = Math.max(0, Math.min(maxes[space][i], this.values[space][i]));
		this.values[space][i] = Math.round(capped);
	}

	// convert to all the other color spaces
	for (var sname in spaces) {
		if (sname !== space) {
			this.values[sname] = convert[space][sname](this.values[space]);
		}

		// cap values
		for (i = 0; i < sname.length; i++) {
			capped = Math.max(0, Math.min(maxes[sname][i], this.values[sname][i]));
			this.values[sname][i] = Math.round(capped);
		}
	}

	return true;
};

Color.prototype.setSpace = function (space, args) {
	var vals = args[0];

	if (vals === undefined) {
		// color.rgb()
		return this.getValues(space);
	}

	// color.rgb(10, 10, 10)
	if (typeof vals === 'number') {
		vals = Array.prototype.slice.call(args);
	}

	this.setValues(space, vals);
	return this;
};

Color.prototype.setChannel = function (space, index, val) {
	if (val === undefined) {
		// color.red()
		return this.values[space][index];
	} else if (val === this.values[space][index]) {
		// color.red(color.red())
		return this;
	}

	// color.red(100)
	this.values[space][index] = val;
	this.setValues(space, this.values[space]);

	return this;
};

module.exports = Color;

},{"color-convert":25,"color-string":27}],29:[function(require,module,exports){
/**
 * Depth space coordinates
 * @see https://msdn.microsoft.com/en-us/library/dn785530.aspx
 */
'use strict'

exports.BOUND_WIDTH = 512
exports.BOUND_HEIGHT = 424


},{}],30:[function(require,module,exports){
/**
 * Kinnect hand status
 */
'use strict'

exports.UNKNOWN = 0
exports.NOT_TRACKED = 1
exports.OPEN = 2
exports.CLOSED = 3
exports.LASSO = 4

},{}],31:[function(require,module,exports){
/**
 * Constans of kinect
 * @module sg-kinect-constants
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get depthSpace () { return d(require('./depth_space')) },
  get handState () { return d(require('./hand_state')) },
  get jointTypes () { return d(require('./joint_types')) }
}

},{"./depth_space":29,"./hand_state":30,"./joint_types":32}],32:[function(require,module,exports){
/**
 * Joint types of kinnect2
 * @see https://msdn.microsoft.com/en-us/library/microsoft.kinect.jointtype.aspx
 */
'use strict'

exports.SPINE_BASE = 0
exports.SPINE_MID = 1
exports.NECK = 2
exports.HEAD = 3
exports.SHOULDER_LEFT = 4
exports.ELBOW_LEFT = 5
exports.WRIST_LEFT = 6
exports.HAND_LEFT = 7
exports.SHOULDER_RIGHT = 8
exports.ELBOW_RIGHT = 9
exports.WRIST_RIGHT = 10
exports.HAND_RIGHT = 11
exports.HIP_LEFT = 12
exports.KNEE_LEFT = 13
exports.ANKLE_LEFT = 14
exports.FOOT_LEFT = 15
exports.HIP_RIGHT = 16
exports.KNEE_RIGHT = 17
exports.ANKLE_RIGHT = 18
exports.FOOT_RIGHT = 19
exports.SPINE_SHOULDER = 20
exports.HAND_TIP_LEFT = 21
exports.THUMB_LEFT = 22
exports.HAND_TIP_RIGHT = 23
exports.THUMB_RIGHT = 24

},{}],33:[function(require,module,exports){
'use strict'

module.exports = Object.assign(exports, {
  MICROPHONE_TRANSITION: 800
})

},{}],34:[function(require,module,exports){
/**
 * Helper function for colors
 */
'use strict'

const apemancolor = require('apemancolor')

module.exports = Object.assign(exports, {
  /**
   * Create a random color from base color.
   * @param {string} base - Base color string
   * @param {Object} options - Optional settings
   * @returns {string} - Generated color
   */
  randomColor (base, options = {}) {
    let amount = parseInt(Math.random() * 360.0)
    return apemancolor.rotate(base, amount)
  },

  /**
   * Define a colorizer to generate unique colors
   * @param {string} base - Base color string
   * @returns {function} - Generated function
   */
  uniqueColorizer (base) {
    let colors = {}

    /**
     * Colorizer function
     * @param {string} id - Unique identifier
     * @returns {string} color - Color for the id
     */
    function colorizer (id) {
      let color = colors[ id ]
      if (color) {
        return color
      }
      color = exports.randomColor(base)
      colors[ id ] = color
      return color
    }

    Object.assign(colorizer, { base, colors })
    return colorizer
  }
})

},{"apemancolor":18}],35:[function(require,module,exports){
/**
 * Helper functions for drawing
 */
'use strict'

module.exports = Object.assign(exports, {
  /**
   * Draw a circle
   * @param ctx
   * @param {Point} point
   * @param radius
   */
  drawCircle (ctx, point, radius) {
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
  },

  /**
   * Draw a line
   * @param ctx
   * @param {...Point} points
   */
  drawLine (ctx, ...points) {
    ctx.beginPath()
    for (let i = 0; i < points.length - 1; i++) {
      let from = points[ i ]
      let to = points[ i + 1 ]
      if (i === 0) {
        ctx.moveTo(from.x, from.y)
      }
      ctx.lineTo(to.x, to.y)
    }
    ctx.stroke()
    ctx.closePath()
  }
})

module.exports = exports

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

},{}],36:[function(require,module,exports){
/**
 * React components for SUGOS project.
 * @module sg-react-components
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get SgAlbum () { return d(require('./sg_album')) },
  get SgBody () { return d(require('./sg_body')) },
  get SgButton () { return d(require('./sg_button')) },
  get SgHead () { return d(require('./sg_head')) },
  get SgHeader () { return d(require('./sg_header')) },
  get SgHtml () { return d(require('./sg_html')) },
  get SgKinectFrame () { return d(require('./sg_kinect_frame')) },
  get SgMain () { return d(require('./sg_main')) },
  get SgMicrophone () { return d(require('./sg_microphone')) },
  get SgPage () { return d(require('./sg_page')) },
  get SgSwitch () { return d(require('./sg_switch')) },
  get SgThemeStyle () { return d(require('./sg_theme_style')) },
  get SgVideo () { return d(require('./sg_video')) }
}

},{"./sg_album":37,"./sg_body":38,"./sg_button":39,"./sg_head":40,"./sg_header":41,"./sg_html":42,"./sg_kinect_frame":43,"./sg_main":44,"./sg_microphone":45,"./sg_page":46,"./sg_switch":47,"./sg_theme_style":48,"./sg_video":49}],37:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _apemanReactButton = require('apeman-react-button');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgAlbum */
var SgAlbum = _react2.default.createClass({
  displayName: 'SgAlbum',


  propTypes: {
    /**
     * Width(px) of a image.
     */
    width: _react.PropTypes.number,
    /**
     * List of image src.
     */
    imageList: _react.PropTypes.array,
    /**
     * Number of images per 1 row in the thumbnail.
     */
    thumbnailCol: _react.PropTypes.number,
    /**
     * Border color of selected image in the thumbnail.
     */
    thumbnailSelectedColor: _react.PropTypes.string,
    /**
     * Called when update. Argument is index of imageList.
     */
    onChange: _react.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      imageList: [],
      width: 300,
      thumbnailCol: 4,
      thumbnailSelectedColor: 'yellow'
    };
  },
  getInitialState: function getInitialState() {
    return {
      nth: 1
    };
  },
  render: function render() {
    var _this = this;

    var s = this;
    var props = s.props;
    var state = s.state;
    var imageList = props.imageList;

    var style = s.getStyle();

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('sg-album', props.className),
        style: Object.assign({}, props.style) },
      _react2.default.createElement(
        'style',
        { className: 'sg-album-style', type: 'text/css' },
        style
      ),
      _react2.default.createElement(
        'div',
        { className: 'sg-album-container' },
        _react2.default.createElement(
          'div',
          { className: 'sg-album-header' },
          _react2.default.createElement(_apemanReactButton.ApPrevButton, { onTap: s.toLeft }),
          _react2.default.createElement(_apemanReactButton.ApNextButton, { onTap: s.toRight }),
          _react2.default.createElement(
            'span',
            { className: 'sg-album-nth' },
            ' ',
            state.nth,
            ' / ',
            imageList.length,
            ' '
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'sg-album-display' },
          _react2.default.createElement(
            'div',
            { className: 'sg-album-full-img' },
            imageList.map(function (image, i) {
              return _react2.default.createElement('img', { className: 'sg-album-img', src: image, key: i });
            })
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'sg-album-thumbnail' },
          _react2.default.createElement('div', { className: 'sg-album-thumbnail-selected' }),
          imageList.map(function (image, i) {
            // 配列の前方から画像を挿入しても、各画像に対するkeyを不変にする。画像データをkeyにすると同じ画像を挿入するとエラーになる
            var key = imageList.length - i;
            return _react2.default.createElement(
              'div',
              { className: 'sg-album-thumbnail-img-effect', key: key, data: i, onClick: _this.moveTo },
              _react2.default.createElement('img', { className: 'sg-album-thumbnail-img', src: image, key: key })
            );
          })
        )
      )
    );
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    // 新しい画像がシフトされたら閲覧位置を戻す
    if (this.props.imageList.length < nextProps.imageList.length) {
      this.setState(this.getInitialState());
    }
  },
  componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
    // 親コンポーネントからこのコンポーネントの状態を取得するのに使える
    var onChange = this.props.onChange;
    if (onChange) {
      onChange(nextState.nth - 1);
    }
  },
  getStyle: function getStyle() {
    var s = this;
    var props = s.props;
    var state = s.state;
    var imageList = props.imageList;
    var width = props.width;
    var thumbnailCol = props.thumbnailCol;
    var thumbnailSelectedColor = props.thumbnailSelectedColor;

    var displayRight = (state.nth - 1) * width;
    var thumbnailWidth = width / thumbnailCol;
    var thumbnailHeight = thumbnailWidth * 3 / 4;
    var thumbnailLeft = thumbnailWidth * ((state.nth - 1) % thumbnailCol);
    var thumbnailTop = thumbnailHeight * Math.floor((state.nth - 1) / thumbnailCol);
    return '\n.sg-album-container {\n  width: ' + width + 'px;\n  margin: 5px;\n}\n.sg-album-display {\n  width: ' + width + 'px;\n  overflow: hidden;\n  border-bottom: 2px solid #666;\n}\n.sg-album-full-img {\n  width: ' + width * imageList.length + 'px;\n  position: relative;\n  white-space: nowrap;\n  right: ' + displayRight + 'px;\n  transition: all 0.3s ease;\n}\n.sg-album-img {\n  width: ' + width + 'px;\n}\n.sg-album-header {\n  position: relative;\n  text-align: center;\n}\n.sg-album-nth {\n  position: absolute;\n  right: 0;\n  top: 10px;\n}\n.sg-album-thumbnail {\n  width: ' + width + 'px;\n  position: relative;\n}\n.sg-album-thumbnail-img-effect {\n  z-index: 1;\n  display: inline-block;\n  position: relative;\n  width: ' + thumbnailWidth + 'px;\n}\n.sg-album-thumbnail-img-effect:hover:before {\n  content: "";\n  cursor: pointer;\n  position: absolute;\n  z-index: 3;\n  display: block;\n  width: ' + thumbnailWidth + 'px;\n  height: ' + thumbnailHeight + 'px;\n  top: 0;\n  left: 0;\n  background: rgba(255, 255, 255, 0.2);\n}\n.sg-album-thumbnail-img-effect:active:before {\n  content: "";\n  cursor: pointer;\n  position: absolute;\n  z-index: 3;\n  display: block;\n  width: ' + thumbnailWidth + 'px;\n  height: ' + thumbnailHeight + 'px;\n  top: 0;\n  left: 0;\n  background: rgba(255, 255, 255, 0.3);\n}\n.sg-album-thumbnail-img {\n  width: ' + thumbnailWidth + 'px;\n}\n.sg-album-thumbnail-selected {\n  position: absolute;\n  cursor: pointer;\n  z-index: 2;\n  width: ' + thumbnailWidth + 'px;\n  height: ' + thumbnailHeight + 'px;\n  transition: all 0.3s ease;\n  box-sizing: border-box;\n  border: 2px solid ' + thumbnailSelectedColor + ';\n  left: ' + thumbnailLeft + 'px;\n  top: ' + thumbnailTop + 'px;\n}\n';
  },
  toRight: function toRight() {
    var props = this.props;
    var state = this.state;

    var nth = state.nth % props.imageList.length + 1;
    this.setState({ nth: nth });
  },
  toLeft: function toLeft() {
    var state = this.state;
    var props = this.props;

    var nth = (state.nth + props.imageList.length - 2) % props.imageList.length + 1;
    this.setState({ nth: nth });
  },
  moveTo: function moveTo(e) {
    var nth = Number(e.target.attributes.data.value) + 1;
    this.setState({ nth: nth });
  }
});

exports.default = SgAlbum;

},{"apeman-react-button":"apeman-react-button","classnames":"classnames","react":"react"}],38:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgBody */
var SgBody = _react2.default.createClass({
  displayName: 'SgBody',


  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;


    return _react2.default.createElement(
      _apemanReactBasic.ApBody,
      _extends({}, props, {
        className: (0, _classnames2.default)('sg-body', props.className),
        style: Object.assign({}, props.style) }),
      props.children
    );
  }
});

exports.default = SgBody;

},{"apeman-react-basic":"apeman-react-basic","classnames":"classnames","react":"react"}],39:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactButton = require('apeman-react-button');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgButton */
var SgButton = _react2.default.createClass({
  displayName: 'SgButton',


  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;


    return _react2.default.createElement(
      _apemanReactButton.ApButton,
      _extends({}, props, {
        className: (0, _classnames2.default)('sg-button', props.className),
        style: Object.assign({}, props.style) }),
      props.children
    );
  }
});

exports.default = SgButton;

},{"apeman-react-button":"apeman-react-button","classnames":"classnames","react":"react"}],40:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _apemanReactBasic = require('apeman-react-basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgHead */
var SgHead = _react2.default.createClass({
  displayName: 'SgHead',


  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;


    return _react2.default.createElement(
      _apemanReactBasic.ApHead,
      _extends({}, props, {
        className: (0, _classnames2.default)('sg-head', props.className),
        style: Object.assign({}, props.style) }),
      props.children
    );
  }
});

exports.default = SgHead;

},{"apeman-react-basic":"apeman-react-basic","classnames":"classnames","react":"react"}],41:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgHeader */
var SgHeader = _react2.default.createClass({
  displayName: 'SgHeader',


  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;


    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('sg-header', props.className),
        style: Object.assign({}, props.style) },
      props.children
    );
  }
});

exports.default = SgHeader;

},{"classnames":"classnames","react":"react"}],42:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _apemanReactBasic = require('apeman-react-basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgHtml */
var SgHtml = _react2.default.createClass({
  displayName: 'SgHtml',


  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;


    return _react2.default.createElement(
      _apemanReactBasic.ApHtml,
      { className: (0, _classnames2.default)('sg-html', props.className),
        style: Object.assign({}, props.style) },
      props.children
    );
  }
});

exports.default = SgHtml;

},{"apeman-react-basic":"apeman-react-basic","classnames":"classnames","react":"react"}],43:[function(require,module,exports){
/**
 * HTML Component
 * @class SgKinectFrame
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _apemancolor = require('apemancolor');

var _apemancolor2 = _interopRequireDefault(_apemancolor);

var _sgKinectConstants = require('sg-kinect-constants');

var _draw_helper = require('./helpers/draw_helper');

var drawHelper = _interopRequireWildcard(_draw_helper);

var _color_helper = require('./helpers/color_helper');

var colorHelper = _interopRequireWildcard(_color_helper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** @lends SgKinectFrame */
var SgKinectFrame = _react2.default.createClass({
  displayName: 'SgKinectFrame',


  // --------------------
  // Specs
  // --------------------

  propTypes: {
    /** Body frame data from kinect */
    bodies: _react.PropTypes.array,
    /** Component width */
    width: _react.PropTypes.number,
    /** Component height */
    height: _react.PropTypes.number,
    /** Width of frames */
    frameWidth: _react.PropTypes.number,
    /** Radius of joint */
    jointRadius: _react.PropTypes.number,
    /** Scale rate of canvas */
    scale: _react.PropTypes.number,
    /** Alt message when no body found */
    alt: _react.PropTypes.string,
    /** Colorizer function */
    colorizer: _react.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      width: _sgKinectConstants.depthSpace.BOUND_WIDTH,
      height: _sgKinectConstants.depthSpace.BOUND_HEIGHT,
      frameWidth: 4,
      jointRadius: 3,
      scale: 2,
      alt: 'NO BODY FOUND',
      colorizer: colorHelper.uniqueColorizer('#CCCC33')
    };
  },


  statics: {},

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;
    var width = props.width;
    var height = props.height;
    var scale = props.scale;

    var style = s.getStyle();
    var isEmpty = s.getBodies().length === 0;
    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('sg-kinnect-frame', props.className),
        style: Object.assign({}, style.main, props.style) },
      isEmpty ? s._renderAlt(style.alt) : null,
      _react2.default.createElement('canvas', { width: width * scale,
        height: height * scale,
        style: Object.assign({
          width: width, height: height
        }),
        ref: function ref(canvas) {
          return s.registerCanvas(canvas);
        } }),
      props.children
    );
  },
  componentWillMount: function componentWillMount() {
    var s = this;
    s._trackingColors = {};
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var s = this;
    s.drawBody(s.getBodies());
  },
  componentDidMount: function componentDidMount() {
    var s = this;
    s.drawBody(s.getBodies());
  },
  componentDidUpdate: function componentDidUpdate() {
    var s = this;
    s.drawBody(s.getBodies());
  },


  // --------------------
  // Specs
  // --------------------

  drawBody: function drawBody(bodies) {
    var s = this;
    var canvas = s.canvas;


    if (!canvas) {
      return;
    }

    var SPINE_BASE = _sgKinectConstants.jointTypes.SPINE_BASE;
    var SPINE_MID = _sgKinectConstants.jointTypes.SPINE_MID;
    var NECK = _sgKinectConstants.jointTypes.NECK;
    var HEAD = _sgKinectConstants.jointTypes.HEAD;
    var SHOULDER_LEFT = _sgKinectConstants.jointTypes.SHOULDER_LEFT;
    var ELBOW_LEFT = _sgKinectConstants.jointTypes.ELBOW_LEFT;
    var WRIST_LEFT = _sgKinectConstants.jointTypes.WRIST_LEFT;
    var HAND_LEFT = _sgKinectConstants.jointTypes.HAND_LEFT;
    var SHOULDER_RIGHT = _sgKinectConstants.jointTypes.SHOULDER_RIGHT;
    var ELBOW_RIGHT = _sgKinectConstants.jointTypes.ELBOW_RIGHT;
    var WRIST_RIGHT = _sgKinectConstants.jointTypes.WRIST_RIGHT;
    var HAND_RIGHT = _sgKinectConstants.jointTypes.HAND_RIGHT;
    var HIP_LEFT = _sgKinectConstants.jointTypes.HIP_LEFT;
    var KNEE_LEFT = _sgKinectConstants.jointTypes.KNEE_LEFT;
    var ANKLE_LEFT = _sgKinectConstants.jointTypes.ANKLE_LEFT;
    var FOOT_LEFT = _sgKinectConstants.jointTypes.FOOT_LEFT;
    var HIP_RIGHT = _sgKinectConstants.jointTypes.HIP_RIGHT;
    var KNEE_RIGHT = _sgKinectConstants.jointTypes.KNEE_RIGHT;
    var ANKLE_RIGHT = _sgKinectConstants.jointTypes.ANKLE_RIGHT;
    var FOOT_RIGHT = _sgKinectConstants.jointTypes.FOOT_RIGHT;
    var SPINE_SHOULDER = _sgKinectConstants.jointTypes.SPINE_SHOULDER;
    var HAND_TIP_LEFT = _sgKinectConstants.jointTypes.HAND_TIP_LEFT;
    var THUMB_LEFT = _sgKinectConstants.jointTypes.THUMB_LEFT;
    var HAND_TIP_RIGHT = _sgKinectConstants.jointTypes.HAND_TIP_RIGHT;
    var THUMB_RIGHT = _sgKinectConstants.jointTypes.THUMB_RIGHT;
    var props = s.props;
    var width = props.width;
    var height = props.height;
    var frameWidth = props.frameWidth;
    var jointRadius = props.jointRadius;
    var scale = props.scale;
    var colorizer = props.colorizer;


    var ctx = canvas.getContext('2d');
    ctx.save();

    var drawCircle = drawHelper.drawCircle;
    var drawLine = drawHelper.drawLine;

    var toPoint = function toPoint(joint) {
      return {
        x: joint.depthX * width,
        y: joint.depthY * height
      };
    };

    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, width, height);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = bodies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var body = _step.value;
        var joints = body.joints;
        var trackingId = body.trackingId;


        var color = colorizer('tracking-' + trackingId);
        var points = joints.map(toPoint);

        ctx.fillStyle = color;
        ctx.strokeStyle = _apemancolor2.default.parse(color).alpha(0.66).rgbaString();
        ctx.lineWidth = frameWidth;

        var spineB = points[SPINE_BASE];
        var spineM = points[SPINE_MID];
        var neck = points[NECK];
        var head = points[HEAD];
        var shoulderL = points[SHOULDER_LEFT];
        var elbowL = points[ELBOW_LEFT];
        var wristL = points[WRIST_LEFT];
        var handL = points[HAND_LEFT];
        var shoulderR = points[SHOULDER_RIGHT];
        var elbowR = points[ELBOW_RIGHT];
        var wristR = points[WRIST_RIGHT];
        var handR = points[HAND_RIGHT];
        var hipL = points[HIP_LEFT];
        var kneeL = points[KNEE_LEFT];
        var ankleL = points[ANKLE_LEFT];
        var footL = points[FOOT_LEFT];
        var hipR = points[HIP_RIGHT];
        var kneeR = points[KNEE_RIGHT];
        var ankleR = points[ANKLE_RIGHT];
        var footR = points[FOOT_RIGHT];
        var spineShoulder = points[SPINE_SHOULDER];
        var handTipL = points[HAND_TIP_LEFT];
        var thumbL = points[THUMB_LEFT];
        var handTipR = points[HAND_TIP_RIGHT];
        var thumbR = points[THUMB_RIGHT];

        // Draw lines
        {
          var linePoints = [[head, neck, spineShoulder, spineM, spineB], [spineShoulder, shoulderL, elbowL, wristL, handL, handTipL, thumbL], [spineB, hipL, kneeL, ankleL, footL], [spineShoulder, shoulderR, elbowR, wristR, handR, handTipR, thumbR], [spineB, hipR, kneeR, ankleR, footR]];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = linePoints[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var linePoint = _step2.value;

              drawLine.apply(undefined, [ctx].concat(_toConsumableArray(linePoint)));
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }

        // Draw circles
        {
          var RADIUS = jointRadius;
          var circlePoints = [head, neck, spineShoulder, spineM, spineB, shoulderL, hipL, elbowL, wristL, shoulderR, hipR, elbowR, wristR, handL, handTipL, thumbL, handR, handTipR, thumbR];
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = circlePoints[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var circlePoint = _step3.value;

              drawCircle(ctx, circlePoint, RADIUS);
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    ctx.restore();
  },


  // --------------------
  // Custom
  // --------------------

  registerCanvas: function registerCanvas(canvas) {
    var s = this;
    s.canvas = canvas;
  },
  getStyle: function getStyle() {
    return {
      main: {
        position: 'relative'
      },
      alt: {
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#EEE',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.1)',
        fontSize: '36px',
        zIndex: '4',
        lineHeight: '1em',
        wordBreak: 'break-word',
        textAlign: 'center'
      }
    };
  },
  getBodies: function getBodies() {
    var s = this;
    var props = s.props;

    return (props.bodies || []).filter(function (body) {
      return !!body;
    }).filter(function (body) {
      return body.tracked;
    });
  },
  _renderAlt: function _renderAlt(style) {
    var s = this;
    var props = s.props;

    return _react2.default.createElement(
      'div',
      { className: 'sg-kinnect-frame-alt', style: style
      },
      props.alt
    );
  },


  canvas: null,

  _trackingColors: null

});

exports.default = SgKinectFrame;

},{"./helpers/color_helper":34,"./helpers/draw_helper":35,"apemancolor":18,"classnames":"classnames","react":"react","sg-kinect-constants":31}],44:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgMain */
var SgMain = _react2.default.createClass({
  displayName: 'SgMain',


  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;


    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('sg-main', props.className),
        style: Object.assign({}, props.style) },
      props.children
    );
  }
});

exports.default = SgMain;

},{"classnames":"classnames","react":"react"}],45:[function(require,module,exports){
/**
 * Microphone component
 * @class SgMicrophone
 */
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _apemanReactMixins = require('apeman-react-mixins');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./constants/animation_constants');

var MICROPHONE_TRANSITION = _require.MICROPHONE_TRANSITION;

/** @lends SgMicrophone */

var SgMicrophone = _react2.default.createClass({
  displayName: 'SgMicrophone',


  // --------------------
  // Specs
  // --------------------

  propTypes: {
    width: _react.PropTypes.number,
    height: _react.PropTypes.number,
    on: _react.PropTypes.bool
  },

  statics: {
    MICROPHONE_TRANSITION: MICROPHONE_TRANSITION
  },

  mixins: [_apemanReactMixins.ApTouchMixin, _apemanReactMixins.ApPureMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      width: 44,
      height: 44,
      on: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      enlarged: false
    };
  },
  render: function render() {
    var s = this;
    var style = s.getStyle();
    var state = s.state;
    var props = s.props;
    var on = props.on;

    return _react2.default.createElement(
      'a',
      { className: (0, _classnames2.default)('sg-microphone', {
          'sg-microphone-on': on
        }),
        style: style.root },
      _react2.default.createElement('div', { className: (0, _classnames2.default)('sg-microphone-back', {
          'sg-microphone-back-enlarged': state.enlarged
        }) }),
      _react2.default.createElement(_apemanReactBasic.ApIcon, { className: 'fa fa-microphone sg-microphone-icon',
        style: style.icon
      })
    );
  },


  // --------------------
  // Lifecycle
  // --------------------

  componentDidMount: function componentDidMount() {
    var s = this;
    s._anmationTimer = setInterval(function () {
      var state = s.state;
      var props = s.props;

      if (props.on) {
        s.setState({
          enlarged: !state.enlarged
        });
      }
    }, MICROPHONE_TRANSITION);
  },
  componentWillUnMount: function componentWillUnMount() {
    var s = this;
    clearInterval(s._anmationTimer);
  },


  // --------------------
  // Custom
  // --------------------

  getStyle: function getStyle() {
    var s = this;
    var props = s.props;
    var width = props.width;
    var height = props.height;

    return {
      root: {
        width: width,
        height: height
      },
      icon: {
        fontSize: height * 0.66
      }
    };
  }
});

module.exports = SgMicrophone;

},{"./constants/animation_constants":33,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","react":"react"}],46:[function(require,module,exports){
/**
 * HTML Component
 * @class SgHtml
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgPage */
var SgPage = _react2.default.createClass({
  displayName: 'SgPage',


  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;


    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('sg-page', props.className),
        style: Object.assign({}, props.style) },
      props.children
    );
  }
});

exports.default = SgPage;

},{"classnames":"classnames","react":"react"}],47:[function(require,module,exports){
/**
 * SgSwitch Component
 * @class SgSwitch
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactSwitch = require('apeman-react-switch');

var _apemanReactStyle = require('apeman-react-style');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgSwitch */
var SgSwitch = _react2.default.createClass({
  displayName: 'SgSwitch',

  propTypes: {
    /**
     * Width(px) of a switch.
     */
    width: _react.PropTypes.number,
    /**
     * The state of on/off.
     */
    on: _react.PropTypes.bool,
    /**
     * Function on tap.
     */
    onTap: _react.PropTypes.func,
    onTitle: _react.PropTypes.string,
    offTitle: _react.PropTypes.string,
    highlightColor: _react.PropTypes.string,
    backgroundColor: _react.PropTypes.string,
    borderColor: _react.PropTypes.string,
    handleSize: _react.PropTypes.number
  },

  getInitialState: function getInitialState() {
    var style = this.customStyle();
    return { style: style };
  },

  // --------------------
  // Specs
  // --------------------

  render: function render() {
    var s = this;
    var props = s.props;
    var state = s.state;
    var style = state.style;

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('sg-switch', props.className),
        style: Object.assign({ display: 'inline-block', margin: '4px' }, props.style) },
      _react2.default.createElement(_apemanReactStyle.ApStyle, { data: style }),
      _react2.default.createElement(_apemanReactSwitch.ApSwitch, props)
    );
  },
  customStyle: function customStyle() {
    var s = this;
    var props = s.props;
    var highlightColor = props.highlightColor;
    var backgroundColor = props.backgroundColor;
    var borderColor = props.borderColor;

    var handleSize = props.handleSize || 24;
    var minWidth = handleSize * 1.5;
    var style = {
      '.ap-switch-label': {
        fontSize: '14px',
        lineHeight: handleSize + 'px'
      },
      '.ap-switch-label-text': {
        minWidth: minWidth
      },
      '.ap-switch-on-label': {
        color: 'white',
        marginRight: -1 * handleSize / 2
      },
      '.ap-switch-off-label': {
        background: '#FAFAFA',
        color: '#AAA',
        marginLeft: -1 * handleSize / 2
      },
      '.ap-switch-on .ap-switch-off-label': {
        width: handleSize / 2 + 2 + 'px !important'
      },
      '.ap-switch-off .ap-switch-on-label': {
        width: handleSize / 2 + 2 + 'px !important'
      },
      '.ap-switch-inner': {
        height: handleSize,
        borderRadius: handleSize / 2 + 1,
        minWidth: minWidth
      },
      '.ap-switch-handle': {
        width: handleSize,
        height: handleSize
      }
    };
    if (highlightColor) {
      Object.assign(style['.ap-switch-on-label'], {
        background: highlightColor
      });
    }
    if (backgroundColor) {
      Object.assign(style['.ap-switch-inner'], {
        backgroundColor: backgroundColor
      });
    }
    if (borderColor) {
      var borderColorOption = {
        border: '1px solid ' + borderColor
      };
      Object.assign(style['.ap-switch-inner'], borderColorOption);
      Object.assign(style['.ap-switch-handle'], borderColorOption);
    }
    return style;
  }
});

exports.default = SgSwitch;

},{"apeman-react-style":"apeman-react-style","apeman-react-switch":14,"classnames":"classnames","react":"react"}],48:[function(require,module,exports){
/**
 * Style for SgHtml.
 * @constructor SgThemeStyle
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactStyle = require('apeman-react-style');

var _apemanReactTheme = require('apeman-react-theme');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./constants/animation_constants');

var MICROPHONE_TRANSITION = _require.MICROPHONE_TRANSITION;

/** @lends SgThemeStyle */

var SgThemeStyle = _react2.default.createClass({
  displayName: 'SgThemeStyle',

  propTypes: {
    style: _react.PropTypes.object,
    dominant: _react.PropTypes.string
  },
  getDefaultProps: function getDefaultProps() {
    return {
      style: {},
      dominant: _apemanReactStyle.ApStyle.DEFAULT_HIGHLIGHT_COLOR
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;
    var dominant = props.dominant;


    var style = {
      '.sg-html': {},
      '.sg-microphone': {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        color: 'inherit'
      },
      '.sg-microphone-back': {
        position: 'absolute',
        borderRadius: '50%',
        backgroundColor: dominant,
        display: 'none',
        top: '9px',
        left: '9px',
        right: '9px',
        bottom: '9px',
        transition: 'transform ' + MICROPHONE_TRANSITION + 'ms',
        transformOrigin: '50% 50%',
        transform: 'scale(1, 1)'
      },
      '.sg-microphone-on .sg-microphone-back': {
        display: 'block'
      },
      '.sg-microphone-on .sg-microphone-icon': {
        color: 'white',
        opacity: 0.9
      },
      '.sg-microphone-back-enlarged': {
        transform: 'scale(2, 2)'
      },
      '.sg-microphone-icon': {
        position: 'relative',
        zIndex: 4,
        opacity: 0.75
      },
      '.sg-microphone:hover .sg-microphone-icon': {
        opacity: 1
      },
      '.sg-microphone:active .sg-microphone-icon': {
        opacity: 0.9
      }
    };
    return _react2.default.createElement(
      _apemanReactTheme.ApThemeStyle,
      _extends({}, props, {
        style: Object.assign(style, props.style)
      }),
      props.children
    );
  }
});

exports.default = SgThemeStyle;

},{"./constants/animation_constants":33,"apeman-react-style":"apeman-react-style","apeman-react-theme":"apeman-react-theme","react":"react"}],49:[function(require,module,exports){
/**
 * SgVideo Component
 * @class SgVideo
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends SgVideo */
var SgVideo = _react2.default.createClass({
  displayName: 'SgVideo',

  // --------------------
  // Specs
  // --------------------

  propTypes: {
    /** Video source URL */
    src: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]),
    /** Register player */
    playerRef: _react.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      playerRef: function playerRef() {}
    };
  },
  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;

    var src = [].concat(props.src || []);
    return _react2.default.createElement(
      'video',
      _extends({}, props, {
        className: (0, _classnames2.default)('sg-video', props.className),
        style: Object.assign({}, props.style),
        ref: function ref(player) {
          return props.playerRef(player);
        }
      }),
      src.map(function (src) {
        return _react2.default.createElement('source', { src: src, key: src });
      }),
      props.children
    );
  }
});

exports.default = SgVideo;

},{"classnames":"classnames","react":"react"}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMS4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjEuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsImxpYi9icm93c2VyL2Nhc2VzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMiLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2pvaW5lci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvLmpzIiwibGliL2NvbXBvbmVudHMvdmlld3Mvc2hvd2Nhc2Vfdmlldy5qcyIsImxpYi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24iLCJsaWIvc2VydmljZXMvbGlua19zZXJ2aWNlLmpzIiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvYXBlbWFuLXByb2plY3RzL2FwZW1hbi1yZWFjdC1zd2l0Y2gvbGliL2FwX3N3aXRjaC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9hcGVtYW4tcHJvamVjdHMvYXBlbWFuLXJlYWN0LXN3aXRjaC9saWIvYXBfc3dpdGNoX3N0eWxlLmpzeCIsIm5vZGVfbW9kdWxlcy9hcGVtYW4tcmVhY3Qtc3dpdGNoL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcGVtYW5jb2xvci9saWIvYWxwaGEuanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2NvbG9yaXplcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2NvbG9yaXplcnMvcm90YXRlX2NvbG9yaXplci5qcyIsIm5vZGVfbW9kdWxlcy9hcGVtYW5jb2xvci9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2lzX2RhcmsuanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2lzX2xpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2FwZW1hbmNvbG9yL2xpYi9taXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL2FwZW1hbmNvbG9yL2xpYi9yb3RhdGUuanMiLCJub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9jb252ZXJzaW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1jb252ZXJ0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLW5hbWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL2NvbG9yLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zZy1raW5lY3QtY29uc3RhbnRzL2xpYi9kZXB0aF9zcGFjZS5qcyIsIm5vZGVfbW9kdWxlcy9zZy1raW5lY3QtY29uc3RhbnRzL2xpYi9oYW5kX3N0YXRlLmpzIiwibm9kZV9tb2R1bGVzL3NnLWtpbmVjdC1jb25zdGFudHMvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NnLWtpbmVjdC1jb25zdGFudHMvbGliL2pvaW50X3R5cGVzLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2NvbnN0YW50cy9hbmltYXRpb25fY29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2hlbHBlcnMvY29sb3JfaGVscGVyLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2hlbHBlcnMvZHJhd19oZWxwZXIuanMiLCJub2RlX21vZHVsZXMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvaW5kZXguanMiLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfYWxidW0uanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX2JvZHkuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX2J1dHRvbi5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfaGVhZC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfaGVhZGVyLmpzeCIsIi9Vc2Vycy9va3VuaXNoaW5pc2hpL1Byb2plY3RzL3JlYWxnbG9iZS1wcm9qZWN0cy9zZy1yZWFjdC1jb21wb25lbnRzL2xpYi9zZ19odG1sLmpzeCIsIi9Vc2Vycy9va3VuaXNoaW5pc2hpL1Byb2plY3RzL3JlYWxnbG9iZS1wcm9qZWN0cy9zZy1yZWFjdC1jb21wb25lbnRzL2xpYi9zZ19raW5lY3RfZnJhbWUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX21haW4uanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX21pY3JvcGhvbmUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3BhZ2UuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3N3aXRjaC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfdGhlbWVfc3R5bGUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3ZpZGVvLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9iQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LFFBQU0sSUFBSSxJQUFWO0FBRFEsUUFFRixLQUZFLEdBRWUsQ0FGZixDQUVGLEtBRkU7QUFBQSxRQUVLLEtBRkwsR0FFZSxDQUZmLENBRUssS0FGTDs7QUFHUixRQUFJLE1BQU0sR0FBRyxNQUFILENBQVUsTUFBTSxHQUFOLElBQWEsRUFBdkIsQ0FBVjtBQUNBLFdBQ0U7QUFBQTtNQUFBLGFBQVksS0FBWjtBQUNFLG1CQUFZLDBCQUFXLFVBQVgsRUFBdUIsTUFBTSxTQUE3QixDQURkO0FBRUUsZUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLE1BQU0sS0FBeEIsQ0FGVjtBQUdFLGFBQU0sYUFBQyxNQUFEO0FBQUEsaUJBQVksTUFBTSxTQUFOLENBQWdCLE1BQWhCLENBQVo7QUFBQTtBQUhSO01BS0ksSUFBSSxHQUFKLENBQVEsVUFBQyxHQUFEO0FBQUEsZUFDUiwwQ0FBUSxLQUFNLEdBQWQsRUFBb0IsS0FBTSxHQUExQixHQURRO0FBQUEsT0FBUixDQUxKO01BUUksTUFBTTtBQVJWLEtBREY7QUFZRDtBQXJDK0IsQ0FBbEIsQ0FBaEI7O2tCQXlDZSxPIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKipcbiAqIEJyb3dzZXIgc2NyaXB0IGZvciBjYXNlcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdCA9IHJlcXVpcmUoJ2FwZW1hbi1icndzLXJlYWN0Jyk7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwZW1hbkJyd3NSZWFjdCk7XG5cbnZhciBfY2FzZXNDb21wb25lbnQgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2Nhc2VzLmNvbXBvbmVudC5qcycpO1xuXG52YXIgX2Nhc2VzQ29tcG9uZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Nhc2VzQ29tcG9uZW50KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENPTlRBSU5FUl9JRCA9ICdjYXNlcy13cmFwJztcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfd2luZG93ID0gd2luZG93O1xuICB2YXIgbG9jYWxlID0gX3dpbmRvdy5sb2NhbGU7XG5cbiAgX2FwZW1hbkJyd3NSZWFjdDIuZGVmYXVsdC5yZW5kZXIoQ09OVEFJTkVSX0lELCBfY2FzZXNDb21wb25lbnQyLmRlZmF1bHQsIHtcbiAgICBsb2NhbGU6IGxvY2FsZVxuICB9LCBmdW5jdGlvbiBkb25lKCkge1xuICAgIC8vIFRoZSBjb21wb25lbnQgaXMgcmVhZHkuXG4gIH0pO1xufTsiLCIvKipcbiAqIENvbXBvbmVudCBvZiBjYXNlcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfaGVhZGVyID0gcmVxdWlyZSgnLi9mcmFnbWVudHMvaGVhZGVyJyk7XG5cbnZhciBfaGVhZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlYWRlcik7XG5cbnZhciBfc2hvd2Nhc2VfdmlldyA9IHJlcXVpcmUoJy4vdmlld3Mvc2hvd2Nhc2VfdmlldycpO1xuXG52YXIgX3Nob3djYXNlX3ZpZXcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2hvd2Nhc2Vfdmlldyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBDYXNlc0NvbXBvbmVudCA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnQ2FzZXNDb21wb25lbnQnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhY2tlcjogbmV3IF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLlN0YWNrZXIoe1xuICAgICAgICByb290OiBfc2hvd2Nhc2VfdmlldzIuZGVmYXVsdCxcbiAgICAgICAgcm9vdFByb3BzOiB7fVxuICAgICAgfSlcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHMucmVnaXN0ZXJMb2NhbGUocHJvcHMubG9jYWxlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBQYWdlLFxuICAgICAgbnVsbCxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9oZWFkZXIyLmRlZmF1bHQsIHsgdGFiOiAnQ0FTRVMnIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwTWFpbixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2ssIHsgc3RhY2tlcjogcHJvcHMuc3RhY2tlciB9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBDYXNlc0NvbXBvbmVudDsiLCIvKipcbiAqIEhlYWRlciBjb21wb25lbnRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2xvZ28gPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvbG9nbycpO1xuXG52YXIgX2xvZ28yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9nbyk7XG5cbnZhciBfbGlua19zZXJ2aWNlID0gcmVxdWlyZSgnLi4vLi4vc2VydmljZXMvbGlua19zZXJ2aWNlJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBIZWFkZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGFiOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFiOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciB0YWIgPSBwcm9wcy50YWI7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF90YWJJdGVtID0gX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWJJdGVtLmNyZWF0ZUl0ZW07XG4gICAgdmFyIF9saW5rID0gZnVuY3Rpb24gX2xpbmsoKSB7XG4gICAgICByZXR1cm4gX2xpbmtfc2VydmljZS5zaW5nbGV0b24ucmVzb2x2ZUh0bWxMaW5rLmFwcGx5KF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXIsXG4gICAgICB7IGNsYXNzTmFtZTogJ2hlYWRlcicgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcENvbnRhaW5lcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJMb2dvLFxuICAgICAgICAgIHsgaHJlZjogX2xpbmsoJ2luZGV4Lmh0bWwnKSB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9sb2dvMi5kZWZhdWx0LCBudWxsKVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlclRhYixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkRPQ1NfUEFHRScpLCBfbGluaygnZG9jcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0RPQ1MnIH0pLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkNBU0VTX1BBR0UnKSwgX2xpbmsoJ2Nhc2VzLmh0bWwnKSwgeyBzZWxlY3RlZDogdGFiID09PSAnQ0FTRVMnIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSGVhZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9jb2xvcl9jb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEpvaW5lciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnSm9pbmVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2xvcjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgbGluZVdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IF9jb2xvcl9jb25zdGFudHMuRE9NSU5BTlQsXG4gICAgICBsaW5lV2lkdGg6IDRcbiAgICB9O1xuICB9LFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExheW91dE1peGluLCBfYXBlbWFuUmVhY3RNaXhpbnMuQXBQdXJlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgbGF5b3V0cyA9IHMubGF5b3V0cztcbiAgICB2YXIgY29sb3IgPSBwcm9wcy5jb2xvcjtcbiAgICB2YXIgbGluZVdpZHRoID0gcHJvcHMubGluZVdpZHRoO1xuICAgIHZhciBfbGF5b3V0cyRzdmcgPSBsYXlvdXRzLnN2ZztcbiAgICB2YXIgd2lkdGggPSBfbGF5b3V0cyRzdmcud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IF9sYXlvdXRzJHN2Zy5oZWlnaHQ7XG4gICAgdmFyIG1pblggPSAwO1xuICAgIHZhciBtaWRYID0gd2lkdGggLyAyO1xuICAgIHZhciBtYXhYID0gd2lkdGg7XG4gICAgdmFyIG1pblkgPSAwO1xuICAgIHZhciBtaWRZID0gaGVpZ2h0IC8gMjtcbiAgICB2YXIgbWF4WSA9IGhlaWdodDtcblxuICAgIHZhciBfbGluZSA9IGZ1bmN0aW9uIF9saW5lKHgxLCB4MiwgeTEsIHkyKSB7XG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2xpbmUnLCB7IHgxOiB4MSwgeDI6IHgyLCB5MTogeTEsIHkyOiB5MiB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHhUaWx0ID0gMC4xO1xuICAgIHZhciB5VGlsdCA9IDAuMztcblxuICAgIHZhciB4MSA9IG1pblg7XG4gICAgdmFyIHgyID0gbWlkWCAqICgxICsgeFRpbHQpO1xuICAgIHZhciB4MyA9IG1pZFggKiAoMSAtIHhUaWx0KTtcbiAgICB2YXIgeDQgPSBtYXhYO1xuICAgIHZhciB5MSA9IG1pZFk7XG4gICAgdmFyIHkyID0gbWlkWSAqICgxIC0geVRpbHQpO1xuICAgIHZhciB5MyA9IG1pZFkgKiAoMSArIHlUaWx0KTtcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ2pvaW5lcicsIHByb3BzLmNsYXNzTmFtZSksXG4gICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGpvaW5lcikge1xuICAgICAgICAgIHMuam9pbmVyID0gam9pbmVyO1xuICAgICAgICB9IH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3N2ZycsXG4gICAgICAgIHsgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IGxpbmVXaWR0aFxuICAgICAgICB9LFxuICAgICAgICBfbGluZSh4MSwgeDIsIHkxLCB5MiksXG4gICAgICAgIF9saW5lKHgyLCB4MywgeTIsIHkzKSxcbiAgICAgICAgX2xpbmUoeDMsIHg0LCB5MywgeTEpXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEZvciBBcExheW91dE1peGluXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEluaXRpYWxMYXlvdXRzOiBmdW5jdGlvbiBnZXRJbml0aWFsTGF5b3V0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3ZnOiB7IHdpZHRoOiAxMDAsIGhlaWdodDogNDAgfVxuICAgIH07XG4gIH0sXG4gIGNhbGNMYXlvdXRzOiBmdW5jdGlvbiBjYWxjTGF5b3V0cygpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIGpvaW5lciA9IHMuam9pbmVyO1xuXG4gICAgaWYgKCFqb2luZXIpIHtcbiAgICAgIHJldHVybiBzLmdldEluaXRpYWxMYXlvdXRzKCk7XG4gICAgfVxuXG4gICAgdmFyIF9qb2luZXIkZ2V0Qm91bmRpbmdDbCA9IGpvaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIHZhciB3aWR0aCA9IF9qb2luZXIkZ2V0Qm91bmRpbmdDbC53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gX2pvaW5lciRnZXRCb3VuZGluZ0NsLmhlaWdodDtcblxuICAgIHJldHVybiB7XG4gICAgICBzdmc6IHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9XG4gICAgfTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEpvaW5lcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIExvZ28gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0xvZ28nLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2gxJyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnbG9nbycgfSxcbiAgICAgICdTVUdPUydcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9nbzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9zZ1JlYWN0Q29tcG9uZW50cyA9IHJlcXVpcmUoJ3NnLXJlYWN0LWNvbXBvbmVudHMnKTtcblxudmFyIF9jbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgX2NsYXNzbmFtZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2xhc3NuYW1lcyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBWaWRlbyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnVmlkZW8nLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcFRvdWNoTWl4aW5dLFxuICBwcm9wVHlwZXM6IHtcbiAgICBzcmM6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVk6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG4gICAgdmFyIHRyYW5zbGF0ZVggPSBwcm9wcy50cmFuc2xhdGVYO1xuICAgIHZhciB0cmFuc2xhdGVZID0gcHJvcHMudHJhbnNsYXRlWTtcblxuICAgIHZhciBzdHlsZSA9IHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlKCcgKyB0cmFuc2xhdGVYICsgJ3B4LCAnICsgdHJhbnNsYXRlWSArICdweCknIH07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2RpdicsXG4gICAgICB7IGNsYXNzTmFtZTogKDAsIF9jbGFzc25hbWVzMi5kZWZhdWx0KSgndmlkZW8nLCBwcm9wcy5jbGFzc05hbWUpIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ2RpdicsXG4gICAgICAgIHsgY2xhc3NOYW1lOiAndmlkZW8taW5uZXInIH0sXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9zZ1JlYWN0Q29tcG9uZW50cy5TZ1ZpZGVvLCB7IHNyYzogcHJvcHMuc3JjLFxuICAgICAgICAgIHN0eWxlOiBzdHlsZSxcbiAgICAgICAgICB3aWR0aDogcHJvcHMud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBwcm9wcy5oZWlnaHQsXG4gICAgICAgICAgbG9vcDogdHJ1ZSxcbiAgICAgICAgICBhdXRvUGxheTogZnVuY3Rpb24gYXV0b1BsYXkocGxheWVyKSB7XG4gICAgICAgICAgICByZXR1cm4gcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBtdXRlZDogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogJ3ZpZGVvLW92ZXJsYXknIH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFZpZGVvOyIsIi8qKlxuICogVmlldyBmb3Igc2hvd2Nhc2VcbiAqIEBjbGFzcyBTaG93Y2FzZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfdmlkZW8gPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvdmlkZW8nKTtcblxudmFyIF92aWRlbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF92aWRlbyk7XG5cbnZhciBfam9pbmVyID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL2pvaW5lcicpO1xuXG52YXIgX2pvaW5lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9qb2luZXIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgU2hvd2Nhc2VWaWV3ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdTaG93Y2FzZVZpZXcnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcblxuICAgIHZhciBfc2VjdGlvbiA9IGZ1bmN0aW9uIF9zZWN0aW9uKG5hbWUsIGNvbmZpZykge1xuICAgICAgdmFyIHRpdGxlID0gY29uZmlnLnRpdGxlO1xuICAgICAgdmFyIHRleHQgPSBjb25maWcudGV4dDtcbiAgICAgIHZhciB2aWRlbzEgPSBjb25maWcudmlkZW8xO1xuICAgICAgdmFyIHZpZGVvMiA9IGNvbmZpZy52aWRlbzI7XG5cbiAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uLFxuICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXNlY3Rpb24nLFxuICAgICAgICAgIGlkOiAnc2hvd2Nhc2UtJyArIG5hbWUgKyAnLXNlY3Rpb24nLFxuICAgICAgICAgIGtleTogbmFtZSB9LFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25IZWFkZXIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICB0aXRsZVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25Cb2R5LFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdGV4dC1jb250YWluZXInIH0sXG4gICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtZGVzY3JpcHRpb24nIH0sXG4gICAgICAgICAgICAgIFtdLmNvbmNhdCh0ZXh0KS5tYXAoZnVuY3Rpb24gKHRleHQsIGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAncCcsXG4gICAgICAgICAgICAgICAgICB7IGtleTogaSB9LFxuICAgICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS12aWRlby1jb250YWluZXInIH0sXG4gICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfdmlkZW8yLmRlZmF1bHQsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8nIH0sIHZpZGVvMSkpLFxuICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2pvaW5lcjIuZGVmYXVsdCwgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS1qb2luZXInIH0pLFxuICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3ZpZGVvMi5kZWZhdWx0LCBfZXh0ZW5kcyh7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZGVvJyB9LCB2aWRlbzIpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlldyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlldycgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0hlYWRlciwgeyB0aXRsZVRleHQ6IGwoJ3RpdGxlcy5TSE9XQ0FTRV9USVRMRScpIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0JvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdhcnRpY2xlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFtfc2VjdGlvbigncmVtb3RlJywge1xuICAgICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkNBU0VfUkVNT1RFX1RJVExFJyksXG4gICAgICAgICAgICB0ZXh0OiBsKCdzZWN0aW9ucy5DQVNFX1JFTU9URV9URVhUJyksXG4gICAgICAgICAgICB2aWRlbzE6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL1NVR09TX3JlbW90ZV9QTEVOLm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0xNTUsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0xMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDMxMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZpZGVvMjoge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvU1VHT1NfcmVtb3RlX1BMRU4ubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogMCxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWTogLTIwLFxuICAgICAgICAgICAgICB3aWR0aDogMzEwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksIF9zZWN0aW9uKCdzZW5zZScsIHtcbiAgICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5DQVNFX1NFTlNFX1RJVExFJyksXG4gICAgICAgICAgICB0ZXh0OiBsKCdzZWN0aW9ucy5DQVNFX1NFTlNFX1RFWFQnKSxcbiAgICAgICAgICAgIHZpZGVvMToge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvU1VHT1NfcmVtb3RlX3NlbnNvci5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAtMTU1LFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtNSxcbiAgICAgICAgICAgICAgd2lkdGg6IDMxMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZpZGVvMjoge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvU1VHT1NfcmVtb3RlX3NlbnNvci5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAwLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtMjAsXG4gICAgICAgICAgICAgIHdpZHRoOiAzMTBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSwgX3NlY3Rpb24oJ3RhbGsnLCB7XG4gICAgICAgICAgICB0aXRsZTogbCgnc2VjdGlvbnMuQ0FTRV9TUEVFQ0hfUkVDT0dOSVRJT05fVElUTEUnKSxcbiAgICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkNBU0VfU1BFRUNIX1JFQ09HTklUSU9OX1RFWFQnKSxcbiAgICAgICAgICAgIHZpZGVvMToge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvcGVwcGVyX3NwZWVjaF9yZWNvZ25pdGlvbi5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAwLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAwLFxuICAgICAgICAgICAgICB3aWR0aDogNDcwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmlkZW8yOiB7XG4gICAgICAgICAgICAgIHNyYzogJ3ZpZGVvcy9wZXBwZXJfc3BlZWNoX3JlY29nbml0aW9uLm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0yMDAsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0zMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDM1MFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLCBfc2VjdGlvbigndGV4dC1pbnB1dCcsIHtcbiAgICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5DQVNFX1RFWFRfSU5QVVRfVElUTEUnKSxcbiAgICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkNBU0VfVEVYVF9JTlBVVF9URVhUJyksXG4gICAgICAgICAgICB2aWRlbzE6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL3BlcHBlcl90ZXh0X2lucHV0Lm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0xNjUsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0yMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDMyMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZpZGVvMjoge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvcGVwcGVyX3RleHRfaW5wdXQubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTUyLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtMzAsXG4gICAgICAgICAgICAgIHdpZHRoOiA1MTBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSwgX3NlY3Rpb24oJ2VkaXNvbi1yb29tYmEnLCB7XG4gICAgICAgICAgICB0aXRsZTogbCgnc2VjdGlvbnMuQ0FTRV9FRElTT05fUk9PTUJBX1RJVExFJyksXG4gICAgICAgICAgICB0ZXh0OiBsKCdzZWN0aW9ucy5DQVNFX0VESVNPTl9ST09NQkFfVEVYVCcpLFxuICAgICAgICAgICAgdmlkZW8xOiB7XG4gICAgICAgICAgICAgIHNyYzogJ3ZpZGVvcy9lZGlzb25fcm9vbWJhLm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0xNSxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWTogLTMwLFxuICAgICAgICAgICAgICB3aWR0aDogMzgwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmlkZW8yOiB7XG4gICAgICAgICAgICAgIHNyYzogJ3ZpZGVvcy9lZGlzb25fcm9vbWJhLm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0xNjIsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0yMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDMyMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvd2Nhc2VWaWV3OyIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJET01JTkFOVFwiOiBcIiNkNmI4MTBcIlxufSIsIi8qKlxuICogQGNsYXNzIExpbmtTZXJ2aWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8qKiBAbGVuZHMgTGlua1NlcnZpY2UgKi9cblxudmFyIExpbmtTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBMaW5rU2VydmljZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGlua1NlcnZpY2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKExpbmtTZXJ2aWNlLCBbe1xuICAgIGtleTogJ3Jlc29sdmVIdG1sTGluaycsXG5cblxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgYSBodG1sIGxpbmtcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgLSBIdG1sIGZpbGUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gUmVzb2x2ZWQgZmlsZSBuYW1lXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVIdG1sTGluayhmaWxlbmFtZSkge1xuICAgICAgdmFyIHMgPSB0aGlzO1xuICAgICAgdmFyIGxhbmcgPSBzLl9nZXRMYW5nKCk7XG4gICAgICB2YXIgaHRtbERpciA9IGxhbmcgPyAnaHRtbC8nICsgbGFuZyA6ICdodG1sJztcbiAgICAgIHJldHVybiBwYXRoLmpvaW4oaHRtbERpciwgZmlsZW5hbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19nZXRMYW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2dldExhbmcoKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LkxBTkc7XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93Lmxhbmc7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIExpbmtTZXJ2aWNlO1xufSgpO1xuXG52YXIgc2luZ2xldG9uID0gbmV3IExpbmtTZXJ2aWNlKCk7XG5cbk9iamVjdC5hc3NpZ24oTGlua1NlcnZpY2UsIHtcbiAgc2luZ2xldG9uOiBzaW5nbGV0b25cbn0pO1xuXG5leHBvcnRzLnNpbmdsZXRvbiA9IHNpbmdsZXRvbjtcbmV4cG9ydHMuZGVmYXVsdCA9IExpbmtTZXJ2aWNlOyIsIi8qKlxuICogYXBlbWFuIHJlYWN0IHBhY2thZ2UgZm9yIHN3aXRjaCBjb21wb25lbnRzXG4gKiBAY29uc3RydWN0b3IgQXBTd2l0Y2hcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5pbXBvcnQge0FwUHVyZU1peGluLCBBcFRvdWNoTWl4aW4sIEFwVVVJRE1peGlufSBmcm9tICdhcGVtYW4tcmVhY3QtbWl4aW5zJ1xuXG4vKiogQGxlbmRzIEFwU3dpdGNoICovXG5jb25zdCBBcFN3aXRjaCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHByb3BUeXBlczoge1xuICAgIC8qKiBTd2l0Y2ggb24gb3Igbm90ICovXG4gICAgb246IHR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICAvKiogSGFuZGxlIGZvciB0YXAgZXZlbnQgKi9cbiAgICBvblRhcDogdHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8qKiBUaXRsZSB0ZXh0IGZvciBvbiBzdGF0ZSAqL1xuICAgIG9uVGl0bGU6IHR5cGVzLnN0cmluZyxcbiAgICAvKiogVGl0bGUgdGV4dCBmb3Igb2ZmIHN0YXRlICovXG4gICAgb2ZmVGl0bGU6IHR5cGVzLnN0cmluZyxcbiAgICAvKiogV2lkdGggb2YgY29tcG9uZW50ICovXG4gICAgd2lkdGg6IHR5cGVzLm51bWJlclxuICB9LFxuXG4gIG1peGluczogW1xuICAgIEFwUHVyZU1peGluLFxuICAgIEFwVG91Y2hNaXhpbixcbiAgICBBcFVVSURNaXhpblxuICBdLFxuXG4gIHN0YXRpY3M6IHt9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHt9XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb246IGZhbHNlLFxuICAgICAgb25UaXRsZTogJycsXG4gICAgICBvZmZUaXRsZTogJydcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuICAgIGxldCB7IHdpZHRoIH0gPSBwcm9wc1xuICAgIGxldCBpZCA9IHByb3BzLmhhc093blByb3BlcnR5KCdpZCcpID8gcHJvcHMuaWQgOiBzLnV1aWRcbiAgICBsZXQgY2xhc3NOYW1lID0gY2xhc3NuYW1lcygnYXAtc3dpdGNoJywge1xuICAgICAgJ2FwLXN3aXRjaC1vbic6IHByb3BzLm9uLFxuICAgICAgJ2FwLXN3aXRjaC1vZmYnOiAhcHJvcHMub25cbiAgICB9LCBwcm9wcy5jbGFzc05hbWUpXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH1cbiAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt3aWR0aH0sIHByb3BzLnN0eWxlKSB9XG4gICAgICAgICAgIGlkPXsgaWQgfVxuICAgICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwLXN3aXRjaC1pbm5lclwiPlxuICAgICAgICAgIHsgcy5fcmVuZGVyTGFiZWwoYCR7aWR9LXJhZGlvLW9mZmAsICdhcC1zd2l0Y2gtb24tbGFiZWwnLCBwcm9wcy5vblRpdGxlKSB9XG4gICAgICAgICAgeyBzLl9yZW5kZXJSYWRpbyhgJHtpZH0tcmFkaW8tb2ZmYCwgJ29mZicsICFwcm9wcy5vbil9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcC1zd2l0Y2gtaGFuZGxlXCI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgeyBzLl9yZW5kZXJMYWJlbChgJHtpZH0tcmFkaW8tb25gLCAnYXAtc3dpdGNoLW9mZi1sYWJlbCcsIHByb3BzLm9mZlRpdGxlKSB9XG4gICAgICAgICAgeyBzLl9yZW5kZXJSYWRpbyhgJHtpZH0tcmFkaW8tb25gLCAnb24nLCAhIXByb3BzLm9uKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIExpZmVjeWNsZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDdXN0b21cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbm9vcCAoKSB7XG5cbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUHJpdmF0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfcmVuZGVyTGFiZWwgKGh0bWxGb3IsIGNsYXNzTmFtZSwgdGl0bGUpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHJldHVybiAoXG4gICAgICA8bGFiZWwgaHRtbEZvcj17IGh0bWxGb3IgfVxuICAgICAgICAgICAgIGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ2FwLXN3aXRjaC1sYWJlbCcsIGNsYXNzTmFtZSkgfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYXAtc3dpdGNoLWxhYmVsLXRleHRcIj57IHRpdGxlIH08L3NwYW4+XG4gICAgICA8L2xhYmVsPlxuICAgIClcbiAgfSxcblxuICBfcmVuZGVyUmFkaW8gKGlkLCB2YWx1ZSwgY2hlY2tlZCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcmV0dXJuIChcbiAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD17IGlkIH1cbiAgICAgICAgICAgICB2YWx1ZT17IHZhbHVlIH1cbiAgICAgICAgICAgICBjaGVja2VkPXsgY2hlY2tlZCB9XG4gICAgICAgICAgICAgb25DaGFuZ2U9eyBzLm5vb3AgfVxuICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFwLXN3aXRjaC1yYWRpb1wiLz5cbiAgICApXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IEFwU3dpdGNoXG4iLCIvKipcbiAqIFN0eWxlIGZvciBBcFN3aXRjaC5cbiAqIEBjb25zdHJ1Y3RvciBBcFN3aXRjaFN0eWxlXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQge0FwU3R5bGV9IGZyb20gJ2FwZW1hbi1yZWFjdC1zdHlsZSdcblxuLyoqIEBsZW5kcyBBcFN3aXRjaFN0eWxlICovXG5jb25zdCBBcFN3aXRjaFN0eWxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBzdHlsZTogdHlwZXMub2JqZWN0LFxuICAgIGhpZ2hsaWdodENvbG9yOiB0eXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3R5bGU6IHt9LFxuICAgICAgaGlnaGxpZ2h0Q29sb3I6IEFwU3R5bGUuREVGQVVMVF9ISUdITElHSFRfQ09MT1IsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IEFwU3R5bGUuREVGQVVMVF9CQUNLR1JPVU5EX0NPTE9SLFxuICAgICAgYm9yZGVyQ29sb3I6ICcjQ0NDJ1xuICAgIH1cbiAgfSxcbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzIH0gPSBzXG5cbiAgICBsZXQgeyBoaWdobGlnaHRDb2xvciwgYmFja2dyb3VuZENvbG9yLCBib3JkZXJDb2xvciB9ID0gcHJvcHNcbiAgICBsZXQgaGFuZGxlU2l6ZSA9IDI0XG4gICAgbGV0IHRyYW5zaXRpb24gPSA0MDBcbiAgICBsZXQgbWluV2lkdGggPSBoYW5kbGVTaXplICogMS41XG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICAnLmFwLXN3aXRjaCc6IHtcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1yYWRpbyc6IHtcbiAgICAgICAgZGlzcGxheTogJ25vbmUnXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtbGFiZWwnOiB7XG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICBib3hTaXppbmc6ICdib3JkZXItYm94JyxcbiAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcbiAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgZmxleFNocmluazogMSxcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgIHRyYW5zaXRpb246IGB3aWR0aCAke3RyYW5zaXRpb259bXNgLFxuICAgICAgICBsaW5lSGVpZ2h0OiBgJHtoYW5kbGVTaXplfXB4YFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLWxhYmVsLXRleHQnOiB7XG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICBwYWRkaW5nOiAnMCA4cHgnLFxuICAgICAgICBib3hTaXppbmc6ICdib3JkZXItYm94JyxcbiAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICBtaW5XaWR0aDogbWluV2lkdGhcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vbi1sYWJlbCc6IHtcbiAgICAgICAgYmFja2dyb3VuZDogaGlnaGxpZ2h0Q29sb3IsXG4gICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICBib3JkZXJSYWRpdXM6IGAke2hhbmRsZVNpemUgLyAyfXB4IDAgMCAke2hhbmRsZVNpemUgLyAyfXB4YCxcbiAgICAgICAgbWFyZ2luUmlnaHQ6IC0xICogaGFuZGxlU2l6ZSAvIDJcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vZmYtbGFiZWwnOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjRkFGQUZBJyxcbiAgICAgICAgY29sb3I6ICcjQUFBJyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiBgMCAke2hhbmRsZVNpemUgLyAyfXB4ICR7aGFuZGxlU2l6ZSAvIDJ9cHggMGAsXG4gICAgICAgIG1hcmdpbkxlZnQ6IC0xICogaGFuZGxlU2l6ZSAvIDJcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vbiAuYXAtc3dpdGNoLW9mZi1sYWJlbCc6IHtcbiAgICAgICAgd2lkdGg6IGAke2hhbmRsZVNpemUgLyAyICsgMn1weCAhaW1wb3J0YW50YFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9mZiAuYXAtc3dpdGNoLW9uLWxhYmVsJzoge1xuICAgICAgICB3aWR0aDogYCR7aGFuZGxlU2l6ZSAvIDIgKyAyfXB4ICFpbXBvcnRhbnRgXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtaW5uZXInOiB7XG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1zdGFydCcsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhY2tncm91bmRDb2xvcixcbiAgICAgICAgaGVpZ2h0OiBoYW5kbGVTaXplLFxuICAgICAgICBib3JkZXJSYWRpdXM6IChoYW5kbGVTaXplIC8gMiArIDEpLFxuICAgICAgICBtaW5XaWR0aDogbWluV2lkdGgsXG4gICAgICAgIGJvcmRlcjogYDFweCBzb2xpZCAke2JvcmRlckNvbG9yfWAsXG4gICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgd2lkdGg6ICcxMDAlJ1xuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLWhhbmRsZSc6IHtcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgIHdpZHRoOiBoYW5kbGVTaXplLFxuICAgICAgICBoZWlnaHQ6IGhhbmRsZVNpemUsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYm9yZGVyOiBgMXB4IHNvbGlkICR7Ym9yZGVyQ29sb3J9YCxcbiAgICAgICAgZmxleEdyb3c6IDAsXG4gICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICB6SW5kZXg6IDRcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHNtYWxsTWVkaWFEYXRhID0ge31cbiAgICBsZXQgbWVkaXVtTWVkaWFEYXRhID0ge31cbiAgICBsZXQgbGFyZ2VNZWRpYURhdGEgPSB7fVxuICAgIHJldHVybiAoXG4gICAgICA8QXBTdHlsZSBkYXRhPXsgT2JqZWN0LmFzc2lnbihkYXRhLCBwcm9wcy5zdHlsZSkgfVxuICAgICAgICAgICAgICAgc21hbGxNZWRpYURhdGE9eyBzbWFsbE1lZGlhRGF0YSB9XG4gICAgICAgICAgICAgICBtZWRpdW1NZWRpYURhdGE9eyBtZWRpdW1NZWRpYURhdGEgfVxuICAgICAgICAgICAgICAgbGFyZ2VNZWRpYURhdGE9eyBsYXJnZU1lZGlhRGF0YSB9XG4gICAgICA+eyBwcm9wcy5jaGlsZHJlbiB9PC9BcFN0eWxlPlxuICAgIClcbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgQXBTd2l0Y2hTdHlsZVxuIiwiLyoqXG4gKiBhcGVtYW4gcmVhY3QgcGFja2FnZSBmb3Igc3dpdGNoIGNvbXBvbmVudHNcbiAqIEBtb2R1bGUgYXBlbWFuLXJlYWN0LXN3aXRjaFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IEFwU3dpdGNoU3R5bGUgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2FwX3N3aXRjaF9zdHlsZScpKSB9LFxuICBnZXQgQXBTd2l0Y2ggKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2FwX3N3aXRjaCcpKSB9XG59XG4iLCIvKipcbiAqIFNldCBhbHBoYSB2YWx1ZVxuICogQGZ1bmN0aW9uIGFscGhhXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBDb2xvciB2YWx1ZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBBbHBoYSB2YWx1ZS4gMC4wMCB0byAxLjAwXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJylcblxuLyoqIEBsZW5kcyBhbHBoYSAqL1xuZnVuY3Rpb24gYWxwaGEgKGNvbG9yLCBhbHBoYSkge1xuICBjb2xvciA9IHBhcnNlKGNvbG9yKVxuICByZXR1cm4gY29sb3IuYWxwaGEoYWxwaGEpLnJnYmFTdHJpbmcoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFscGhhXG4iLCIvKipcbiAqIGNvbG9yaXplciBmdW5jdGlvbnNcbiAqIEBtb2R1bGUgY29sb3JpemVyc1xuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IHJvdGF0ZUNvbG9yaXplciAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vcm90YXRlX2NvbG9yaXplcicpKSB9XG59XG4iLCIvKipcbiAqIERlZmluZSBhIGNvbG9yaXplciB0byBnZW5lcmF0ZSB1bmlxdWUgY29sb3JzXG4gKiBAZnVuY3Rpb24gcm90YXRlQ29sb3JpemVyXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZSAtIEJhc2UgY29sb3Igc3RyaW5nXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IC0gR2VuZXJhdGVkIGZ1bmN0aW9uXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCByb3RhdGUgPSByZXF1aXJlKCcuLi9yb3RhdGUnKVxuXG4vKiogQGxlbmRzIHJvdGF0ZUNvbG9yaXplciAqL1xuZnVuY3Rpb24gcm90YXRlQ29sb3JpemVyIChiYXNlKSB7XG4gIGxldCBjb2xvcnMgPSB7fVxuXG4gIC8qKlxuICAgKiBDb2xvcml6ZXIgZnVuY3Rpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVW5pcXVlIGlkZW50aWZpZXJcbiAgICogQHJldHVybnMge3N0cmluZ30gY29sb3IgLSBDb2xvciBmb3IgdGhlIGlkXG4gICAqL1xuICBmdW5jdGlvbiBjb2xvcml6ZXIgKGlkKSB7XG4gICAgbGV0IGNvbG9yID0gY29sb3JzWyBpZCBdXG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICByZXR1cm4gY29sb3JcbiAgICB9XG4gICAgbGV0IGtub3duQ29sb3JzID0gT2JqZWN0LmtleXMoY29sb3JzKS5tYXAoKGlkKSA9PiBjb2xvcnNbIGlkIF0pXG4gICAgZG8ge1xuICAgICAgY29sb3IgPSByb3RhdGUoYmFzZSwgcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDM2MC4wKSlcbiAgICAgIGlmIChrbm93bkNvbG9ycy5sZW5ndGggPj0gMzYwKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSB3aGlsZSAofmtub3duQ29sb3JzLmluZGV4T2YoY29sb3IpKVxuICAgIGNvbG9yc1sgaWQgXSA9IGNvbG9yXG4gICAgcmV0dXJuIGNvbG9yXG4gIH1cblxuICBPYmplY3QuYXNzaWduKGNvbG9yaXplciwgeyBiYXNlLCBjb2xvcnMgfSlcbiAgcmV0dXJuIGNvbG9yaXplclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdGF0ZUNvbG9yaXplclxuIiwiLyoqXG4gKiBDb2xvciB1dGlsaXR5LlxuICogQG1vZHVsZSBhcGVtYW5jb2xvclxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IGFscGhhICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9hbHBoYScpKSB9LFxuICBnZXQgY29sb3JpemVycyAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vY29sb3JpemVycycpKSB9LFxuICBnZXQgaXNEYXJrICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9pc19kYXJrJykpIH0sXG4gIGdldCBpc0xpZ2h0ICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9pc19saWdodCcpKSB9LFxuICBnZXQgbWl4ICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9taXgnKSkgfSxcbiAgZ2V0IHBhcnNlICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9wYXJzZScpKSB9LFxuICBnZXQgcm90YXRlICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9yb3RhdGUnKSkgfVxufVxuIiwiLyoqXG4gKiBEZXRlY3QgZGFyayBvciBub3RcbiAqIEBmdW5jdGlvbiBpc0RhcmtcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAtIENvbG9yIHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpXG5mdW5jdGlvbiBpc0RhcmsgKGNvbG9yKSB7XG4gIGxldCB7IHIsIGcsIGIgfSA9IHBhcnNlKGNvbG9yKS5yZ2IoKVxuICByZXR1cm4gKHIgKiAwLjI5OSArIGcgKiAwLjU4NyArIGIgKiAwLjExNCkgPCAxODZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0RhcmtcbiIsIi8qKlxuICogRGV0ZWN0IGxpZ2h0IG9yIG5vdFxuICogQGZ1bmN0aW9uIGlzTGlnaHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAtIENvbG9yIHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGlzRGFyayA9IHJlcXVpcmUoJy4vaXNfZGFyaycpXG5mdW5jdGlvbiBpc0xpZ2h0IChjb2xvcikge1xuICByZXR1cm4gIWlzRGFyayhjb2xvcilcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xpZ2h0XG4iLCIvKipcbiAqIG1peCBjb2xvcnNcbiAqIEBmdW5jdGlvbiBtaXhcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvcjEgLSBDb2xvciB2YWx1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvcjIgLSBDb2xvciB2YWx1ZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKVxuXG4vKiogQGxlbmRzIG1peCAqL1xuZnVuY3Rpb24gbWl4IChjb2xvcjEsIGNvbG9yMikge1xuICByZXR1cm4gcGFyc2UoY29sb3IxKS5taXgocGFyc2UoY29sb3IyKSkucmdiYVN0cmluZygpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWl4XG4iLCIvKipcbiAqIFBhcnNlIGEgY29sb3JcbiAqIEBmdW5jdGlvbiBwYXJzZVxuICogQHBhcmFtIHt2YWx1ZX0gLSBDb2xvciB2YWx1ZVxuICogQHJldHVybnMge09iamVjdH0gLSBQYXJzZWQgY29sb3IgaW5zdGFuY2UuXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBjb2xvciA9IHJlcXVpcmUoJ2NvbG9yJylcblxuLyoqIEBsZW5kcyBwYXJzZSAqL1xuZnVuY3Rpb24gcGFyc2UgKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1thcGVtYW5jb2xvcl0gVmFsdWUgaXMgcmVxdWlyZWQuJylcbiAgfVxuICBsZXQgcGFyc2VkID0gY29sb3IodmFsdWUpXG4gIGlmICghcGFyc2VkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGNvbG9yOiAke3ZhbHVlfWApXG4gIH1cbiAgcmV0dXJuIHBhcnNlZFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlXG4iLCIvKipcbiAqIHJvdGF0ZSBjb2xvclxuICogQGZ1bmN0aW9uIHJvdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIC0gQ29sb3IgdmFsdWUuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVncmVlIHRvIHJvdGF0ZS4gMCB0byAzNjBcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKVxuXG4vKiogQGxlbmRzIHJvdGF0ZSAqL1xuZnVuY3Rpb24gcm90YXRlIChjb2xvciwgZGVncmVlKSB7XG4gIGNvbG9yID0gcGFyc2UoY29sb3IpXG4gIHJldHVybiBjb2xvci5odWUoY29sb3IuaHVlKCkgKyBOdW1iZXIoZGVncmVlKSkucmdiYVN0cmluZygpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gcm90YXRlXG4iLCIvKiBNSVQgbGljZW5zZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmdiMmhzbDogcmdiMmhzbCxcbiAgcmdiMmhzdjogcmdiMmhzdixcbiAgcmdiMmh3YjogcmdiMmh3YixcbiAgcmdiMmNteWs6IHJnYjJjbXlrLFxuICByZ2Iya2V5d29yZDogcmdiMmtleXdvcmQsXG4gIHJnYjJ4eXo6IHJnYjJ4eXosXG4gIHJnYjJsYWI6IHJnYjJsYWIsXG4gIHJnYjJsY2g6IHJnYjJsY2gsXG5cbiAgaHNsMnJnYjogaHNsMnJnYixcbiAgaHNsMmhzdjogaHNsMmhzdixcbiAgaHNsMmh3YjogaHNsMmh3YixcbiAgaHNsMmNteWs6IGhzbDJjbXlrLFxuICBoc2wya2V5d29yZDogaHNsMmtleXdvcmQsXG5cbiAgaHN2MnJnYjogaHN2MnJnYixcbiAgaHN2MmhzbDogaHN2MmhzbCxcbiAgaHN2Mmh3YjogaHN2Mmh3YixcbiAgaHN2MmNteWs6IGhzdjJjbXlrLFxuICBoc3Yya2V5d29yZDogaHN2MmtleXdvcmQsXG5cbiAgaHdiMnJnYjogaHdiMnJnYixcbiAgaHdiMmhzbDogaHdiMmhzbCxcbiAgaHdiMmhzdjogaHdiMmhzdixcbiAgaHdiMmNteWs6IGh3YjJjbXlrLFxuICBod2Iya2V5d29yZDogaHdiMmtleXdvcmQsXG5cbiAgY215azJyZ2I6IGNteWsycmdiLFxuICBjbXlrMmhzbDogY215azJoc2wsXG4gIGNteWsyaHN2OiBjbXlrMmhzdixcbiAgY215azJod2I6IGNteWsyaHdiLFxuICBjbXlrMmtleXdvcmQ6IGNteWsya2V5d29yZCxcblxuICBrZXl3b3JkMnJnYjoga2V5d29yZDJyZ2IsXG4gIGtleXdvcmQyaHNsOiBrZXl3b3JkMmhzbCxcbiAga2V5d29yZDJoc3Y6IGtleXdvcmQyaHN2LFxuICBrZXl3b3JkMmh3Yjoga2V5d29yZDJod2IsXG4gIGtleXdvcmQyY215azoga2V5d29yZDJjbXlrLFxuICBrZXl3b3JkMmxhYjoga2V5d29yZDJsYWIsXG4gIGtleXdvcmQyeHl6OiBrZXl3b3JkMnh5eixcblxuICB4eXoycmdiOiB4eXoycmdiLFxuICB4eXoybGFiOiB4eXoybGFiLFxuICB4eXoybGNoOiB4eXoybGNoLFxuXG4gIGxhYjJ4eXo6IGxhYjJ4eXosXG4gIGxhYjJyZ2I6IGxhYjJyZ2IsXG4gIGxhYjJsY2g6IGxhYjJsY2gsXG5cbiAgbGNoMmxhYjogbGNoMmxhYixcbiAgbGNoMnh5ejogbGNoMnh5eixcbiAgbGNoMnJnYjogbGNoMnJnYlxufVxuXG5cbmZ1bmN0aW9uIHJnYjJoc2wocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLzI1NSxcbiAgICAgIGcgPSByZ2JbMV0vMjU1LFxuICAgICAgYiA9IHJnYlsyXS8yNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgZGVsdGEgPSBtYXggLSBtaW4sXG4gICAgICBoLCBzLCBsO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIGggPSAwO1xuICBlbHNlIGlmIChyID09IG1heClcbiAgICBoID0gKGcgLSBiKSAvIGRlbHRhO1xuICBlbHNlIGlmIChnID09IG1heClcbiAgICBoID0gMiArIChiIC0gcikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoYiA9PSBtYXgpXG4gICAgaCA9IDQgKyAociAtIGcpLyBkZWx0YTtcblxuICBoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG4gIGlmIChoIDwgMClcbiAgICBoICs9IDM2MDtcblxuICBsID0gKG1pbiArIG1heCkgLyAyO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIHMgPSAwO1xuICBlbHNlIGlmIChsIDw9IDAuNSlcbiAgICBzID0gZGVsdGEgLyAobWF4ICsgbWluKTtcbiAgZWxzZVxuICAgIHMgPSBkZWx0YSAvICgyIC0gbWF4IC0gbWluKTtcblxuICByZXR1cm4gW2gsIHMgKiAxMDAsIGwgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2IyaHN2KHJnYikge1xuICB2YXIgciA9IHJnYlswXSxcbiAgICAgIGcgPSByZ2JbMV0sXG4gICAgICBiID0gcmdiWzJdLFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGRlbHRhID0gbWF4IC0gbWluLFxuICAgICAgaCwgcywgdjtcblxuICBpZiAobWF4ID09IDApXG4gICAgcyA9IDA7XG4gIGVsc2VcbiAgICBzID0gKGRlbHRhL21heCAqIDEwMDApLzEwO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIGggPSAwO1xuICBlbHNlIGlmIChyID09IG1heClcbiAgICBoID0gKGcgLSBiKSAvIGRlbHRhO1xuICBlbHNlIGlmIChnID09IG1heClcbiAgICBoID0gMiArIChiIC0gcikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoYiA9PSBtYXgpXG4gICAgaCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG5cbiAgaCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuICBpZiAoaCA8IDApXG4gICAgaCArPSAzNjA7XG5cbiAgdiA9ICgobWF4IC8gMjU1KSAqIDEwMDApIC8gMTA7XG5cbiAgcmV0dXJuIFtoLCBzLCB2XTtcbn1cblxuZnVuY3Rpb24gcmdiMmh3YihyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0sXG4gICAgICBnID0gcmdiWzFdLFxuICAgICAgYiA9IHJnYlsyXSxcbiAgICAgIGggPSByZ2IyaHNsKHJnYilbMF0sXG4gICAgICB3ID0gMS8yNTUgKiBNYXRoLm1pbihyLCBNYXRoLm1pbihnLCBiKSksXG4gICAgICBiID0gMSAtIDEvMjU1ICogTWF0aC5tYXgociwgTWF0aC5tYXgoZywgYikpO1xuXG4gIHJldHVybiBbaCwgdyAqIDEwMCwgYiAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJjbXlrKHJnYikge1xuICB2YXIgciA9IHJnYlswXSAvIDI1NSxcbiAgICAgIGcgPSByZ2JbMV0gLyAyNTUsXG4gICAgICBiID0gcmdiWzJdIC8gMjU1LFxuICAgICAgYywgbSwgeSwgaztcblxuICBrID0gTWF0aC5taW4oMSAtIHIsIDEgLSBnLCAxIC0gYik7XG4gIGMgPSAoMSAtIHIgLSBrKSAvICgxIC0gaykgfHwgMDtcbiAgbSA9ICgxIC0gZyAtIGspIC8gKDEgLSBrKSB8fCAwO1xuICB5ID0gKDEgLSBiIC0gaykgLyAoMSAtIGspIHx8IDA7XG4gIHJldHVybiBbYyAqIDEwMCwgbSAqIDEwMCwgeSAqIDEwMCwgayAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJrZXl3b3JkKHJnYikge1xuICByZXR1cm4gcmV2ZXJzZUtleXdvcmRzW0pTT04uc3RyaW5naWZ5KHJnYildO1xufVxuXG5mdW5jdGlvbiByZ2IyeHl6KHJnYikge1xuICB2YXIgciA9IHJnYlswXSAvIDI1NSxcbiAgICAgIGcgPSByZ2JbMV0gLyAyNTUsXG4gICAgICBiID0gcmdiWzJdIC8gMjU1O1xuXG4gIC8vIGFzc3VtZSBzUkdCXG4gIHIgPSByID4gMC4wNDA0NSA/IE1hdGgucG93KCgociArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChyIC8gMTIuOTIpO1xuICBnID0gZyA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGcgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoZyAvIDEyLjkyKTtcbiAgYiA9IGIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChiICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKGIgLyAxMi45Mik7XG5cbiAgdmFyIHggPSAociAqIDAuNDEyNCkgKyAoZyAqIDAuMzU3NikgKyAoYiAqIDAuMTgwNSk7XG4gIHZhciB5ID0gKHIgKiAwLjIxMjYpICsgKGcgKiAwLjcxNTIpICsgKGIgKiAwLjA3MjIpO1xuICB2YXIgeiA9IChyICogMC4wMTkzKSArIChnICogMC4xMTkyKSArIChiICogMC45NTA1KTtcblxuICByZXR1cm4gW3ggKiAxMDAsIHkgKjEwMCwgeiAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJsYWIocmdiKSB7XG4gIHZhciB4eXogPSByZ2IyeHl6KHJnYiksXG4gICAgICAgIHggPSB4eXpbMF0sXG4gICAgICAgIHkgPSB4eXpbMV0sXG4gICAgICAgIHogPSB4eXpbMl0sXG4gICAgICAgIGwsIGEsIGI7XG5cbiAgeCAvPSA5NS4wNDc7XG4gIHkgLz0gMTAwO1xuICB6IC89IDEwOC44ODM7XG5cbiAgeCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEvMykgOiAoNy43ODcgKiB4KSArICgxNiAvIDExNik7XG4gIHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxLzMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuICB6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMS8zKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuICBsID0gKDExNiAqIHkpIC0gMTY7XG4gIGEgPSA1MDAgKiAoeCAtIHkpO1xuICBiID0gMjAwICogKHkgLSB6KTtcblxuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiByZ2IybGNoKGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJsY2gocmdiMmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJyZ2IoaHNsKSB7XG4gIHZhciBoID0gaHNsWzBdIC8gMzYwLFxuICAgICAgcyA9IGhzbFsxXSAvIDEwMCxcbiAgICAgIGwgPSBoc2xbMl0gLyAxMDAsXG4gICAgICB0MSwgdDIsIHQzLCByZ2IsIHZhbDtcblxuICBpZiAocyA9PSAwKSB7XG4gICAgdmFsID0gbCAqIDI1NTtcbiAgICByZXR1cm4gW3ZhbCwgdmFsLCB2YWxdO1xuICB9XG5cbiAgaWYgKGwgPCAwLjUpXG4gICAgdDIgPSBsICogKDEgKyBzKTtcbiAgZWxzZVxuICAgIHQyID0gbCArIHMgLSBsICogcztcbiAgdDEgPSAyICogbCAtIHQyO1xuXG4gIHJnYiA9IFswLCAwLCAwXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICB0MyA9IGggKyAxIC8gMyAqIC0gKGkgLSAxKTtcbiAgICB0MyA8IDAgJiYgdDMrKztcbiAgICB0MyA+IDEgJiYgdDMtLTtcblxuICAgIGlmICg2ICogdDMgPCAxKVxuICAgICAgdmFsID0gdDEgKyAodDIgLSB0MSkgKiA2ICogdDM7XG4gICAgZWxzZSBpZiAoMiAqIHQzIDwgMSlcbiAgICAgIHZhbCA9IHQyO1xuICAgIGVsc2UgaWYgKDMgKiB0MyA8IDIpXG4gICAgICB2YWwgPSB0MSArICh0MiAtIHQxKSAqICgyIC8gMyAtIHQzKSAqIDY7XG4gICAgZWxzZVxuICAgICAgdmFsID0gdDE7XG5cbiAgICByZ2JbaV0gPSB2YWwgKiAyNTU7XG4gIH1cblxuICByZXR1cm4gcmdiO1xufVxuXG5mdW5jdGlvbiBoc2wyaHN2KGhzbCkge1xuICB2YXIgaCA9IGhzbFswXSxcbiAgICAgIHMgPSBoc2xbMV0gLyAxMDAsXG4gICAgICBsID0gaHNsWzJdIC8gMTAwLFxuICAgICAgc3YsIHY7XG5cbiAgaWYobCA9PT0gMCkge1xuICAgICAgLy8gbm8gbmVlZCB0byBkbyBjYWxjIG9uIGJsYWNrXG4gICAgICAvLyBhbHNvIGF2b2lkcyBkaXZpZGUgYnkgMCBlcnJvclxuICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgfVxuXG4gIGwgKj0gMjtcbiAgcyAqPSAobCA8PSAxKSA/IGwgOiAyIC0gbDtcbiAgdiA9IChsICsgcykgLyAyO1xuICBzdiA9ICgyICogcykgLyAobCArIHMpO1xuICByZXR1cm4gW2gsIHN2ICogMTAwLCB2ICogMTAwXTtcbn1cblxuZnVuY3Rpb24gaHNsMmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGhzbDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc2wyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhoc2wycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHNsMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoaHNsMnJnYihhcmdzKSk7XG59XG5cblxuZnVuY3Rpb24gaHN2MnJnYihoc3YpIHtcbiAgdmFyIGggPSBoc3ZbMF0gLyA2MCxcbiAgICAgIHMgPSBoc3ZbMV0gLyAxMDAsXG4gICAgICB2ID0gaHN2WzJdIC8gMTAwLFxuICAgICAgaGkgPSBNYXRoLmZsb29yKGgpICUgNjtcblxuICB2YXIgZiA9IGggLSBNYXRoLmZsb29yKGgpLFxuICAgICAgcCA9IDI1NSAqIHYgKiAoMSAtIHMpLFxuICAgICAgcSA9IDI1NSAqIHYgKiAoMSAtIChzICogZikpLFxuICAgICAgdCA9IDI1NSAqIHYgKiAoMSAtIChzICogKDEgLSBmKSkpLFxuICAgICAgdiA9IDI1NSAqIHY7XG5cbiAgc3dpdGNoKGhpKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIFt2LCB0LCBwXTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gW3EsIHYsIHBdO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBbcCwgdiwgdF07XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFtwLCBxLCB2XTtcbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gW3QsIHAsIHZdO1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBbdiwgcCwgcV07XG4gIH1cbn1cblxuZnVuY3Rpb24gaHN2MmhzbChoc3YpIHtcbiAgdmFyIGggPSBoc3ZbMF0sXG4gICAgICBzID0gaHN2WzFdIC8gMTAwLFxuICAgICAgdiA9IGhzdlsyXSAvIDEwMCxcbiAgICAgIHNsLCBsO1xuXG4gIGwgPSAoMiAtIHMpICogdjtcbiAgc2wgPSBzICogdjtcbiAgc2wgLz0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG4gIHNsID0gc2wgfHwgMDtcbiAgbCAvPSAyO1xuICByZXR1cm4gW2gsIHNsICogMTAwLCBsICogMTAwXTtcbn1cblxuZnVuY3Rpb24gaHN2Mmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGhzdjJyZ2IoYXJncykpXG59XG5cbmZ1bmN0aW9uIGhzdjJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGhzdjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc3Yya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChoc3YycmdiKGFyZ3MpKTtcbn1cblxuLy8gaHR0cDovL2Rldi53My5vcmcvY3Nzd2cvY3NzLWNvbG9yLyNod2ItdG8tcmdiXG5mdW5jdGlvbiBod2IycmdiKGh3Yikge1xuICB2YXIgaCA9IGh3YlswXSAvIDM2MCxcbiAgICAgIHdoID0gaHdiWzFdIC8gMTAwLFxuICAgICAgYmwgPSBod2JbMl0gLyAxMDAsXG4gICAgICByYXRpbyA9IHdoICsgYmwsXG4gICAgICBpLCB2LCBmLCBuO1xuXG4gIC8vIHdoICsgYmwgY2FudCBiZSA+IDFcbiAgaWYgKHJhdGlvID4gMSkge1xuICAgIHdoIC89IHJhdGlvO1xuICAgIGJsIC89IHJhdGlvO1xuICB9XG5cbiAgaSA9IE1hdGguZmxvb3IoNiAqIGgpO1xuICB2ID0gMSAtIGJsO1xuICBmID0gNiAqIGggLSBpO1xuICBpZiAoKGkgJiAweDAxKSAhPSAwKSB7XG4gICAgZiA9IDEgLSBmO1xuICB9XG4gIG4gPSB3aCArIGYgKiAodiAtIHdoKTsgIC8vIGxpbmVhciBpbnRlcnBvbGF0aW9uXG5cbiAgc3dpdGNoIChpKSB7XG4gICAgZGVmYXVsdDpcbiAgICBjYXNlIDY6XG4gICAgY2FzZSAwOiByID0gdjsgZyA9IG47IGIgPSB3aDsgYnJlYWs7XG4gICAgY2FzZSAxOiByID0gbjsgZyA9IHY7IGIgPSB3aDsgYnJlYWs7XG4gICAgY2FzZSAyOiByID0gd2g7IGcgPSB2OyBiID0gbjsgYnJlYWs7XG4gICAgY2FzZSAzOiByID0gd2g7IGcgPSBuOyBiID0gdjsgYnJlYWs7XG4gICAgY2FzZSA0OiByID0gbjsgZyA9IHdoOyBiID0gdjsgYnJlYWs7XG4gICAgY2FzZSA1OiByID0gdjsgZyA9IHdoOyBiID0gbjsgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufVxuXG5mdW5jdGlvbiBod2IyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGh3YjJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGh3YjJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMnJnYihjbXlrKSB7XG4gIHZhciBjID0gY215a1swXSAvIDEwMCxcbiAgICAgIG0gPSBjbXlrWzFdIC8gMTAwLFxuICAgICAgeSA9IGNteWtbMl0gLyAxMDAsXG4gICAgICBrID0gY215a1szXSAvIDEwMCxcbiAgICAgIHIsIGcsIGI7XG5cbiAgciA9IDEgLSBNYXRoLm1pbigxLCBjICogKDEgLSBrKSArIGspO1xuICBnID0gMSAtIE1hdGgubWluKDEsIG0gKiAoMSAtIGspICsgayk7XG4gIGIgPSAxIC0gTWF0aC5taW4oMSwgeSAqICgxIC0gaykgKyBrKTtcbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24gY215azJoc2woYXJncykge1xuICByZXR1cm4gcmdiMmhzbChjbXlrMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsyaHN2KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc3YoY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuXG5mdW5jdGlvbiB4eXoycmdiKHh5eikge1xuICB2YXIgeCA9IHh5elswXSAvIDEwMCxcbiAgICAgIHkgPSB4eXpbMV0gLyAxMDAsXG4gICAgICB6ID0geHl6WzJdIC8gMTAwLFxuICAgICAgciwgZywgYjtcblxuICByID0gKHggKiAzLjI0MDYpICsgKHkgKiAtMS41MzcyKSArICh6ICogLTAuNDk4Nik7XG4gIGcgPSAoeCAqIC0wLjk2ODkpICsgKHkgKiAxLjg3NTgpICsgKHogKiAwLjA0MTUpO1xuICBiID0gKHggKiAwLjA1NTcpICsgKHkgKiAtMC4yMDQwKSArICh6ICogMS4wNTcwKTtcblxuICAvLyBhc3N1bWUgc1JHQlxuICByID0gciA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhyLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogciA9IChyICogMTIuOTIpO1xuXG4gIGcgPSBnID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KGcsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiBnID0gKGcgKiAxMi45Mik7XG5cbiAgYiA9IGIgPiAwLjAwMzEzMDggPyAoKDEuMDU1ICogTWF0aC5wb3coYiwgMS4wIC8gMi40KSkgLSAwLjA1NSlcbiAgICA6IGIgPSAoYiAqIDEyLjkyKTtcblxuICByID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgciksIDEpO1xuICBnID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgZyksIDEpO1xuICBiID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgYiksIDEpO1xuXG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIHh5ejJsYWIoeHl6KSB7XG4gIHZhciB4ID0geHl6WzBdLFxuICAgICAgeSA9IHh5elsxXSxcbiAgICAgIHogPSB4eXpbMl0sXG4gICAgICBsLCBhLCBiO1xuXG4gIHggLz0gOTUuMDQ3O1xuICB5IC89IDEwMDtcbiAgeiAvPSAxMDguODgzO1xuXG4gIHggPSB4ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh4LCAxLzMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuICB5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMS8zKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcbiAgeiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEvMykgOiAoNy43ODcgKiB6KSArICgxNiAvIDExNik7XG5cbiAgbCA9ICgxMTYgKiB5KSAtIDE2O1xuICBhID0gNTAwICogKHggLSB5KTtcbiAgYiA9IDIwMCAqICh5IC0geik7XG5cbiAgcmV0dXJuIFtsLCBhLCBiXTtcbn1cblxuZnVuY3Rpb24geHl6MmxjaChhcmdzKSB7XG4gIHJldHVybiBsYWIybGNoKHh5ejJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBsYWIyeHl6KGxhYikge1xuICB2YXIgbCA9IGxhYlswXSxcbiAgICAgIGEgPSBsYWJbMV0sXG4gICAgICBiID0gbGFiWzJdLFxuICAgICAgeCwgeSwgeiwgeTI7XG5cbiAgaWYgKGwgPD0gOCkge1xuICAgIHkgPSAobCAqIDEwMCkgLyA5MDMuMztcbiAgICB5MiA9ICg3Ljc4NyAqICh5IC8gMTAwKSkgKyAoMTYgLyAxMTYpO1xuICB9IGVsc2Uge1xuICAgIHkgPSAxMDAgKiBNYXRoLnBvdygobCArIDE2KSAvIDExNiwgMyk7XG4gICAgeTIgPSBNYXRoLnBvdyh5IC8gMTAwLCAxLzMpO1xuICB9XG5cbiAgeCA9IHggLyA5NS4wNDcgPD0gMC4wMDg4NTYgPyB4ID0gKDk1LjA0NyAqICgoYSAvIDUwMCkgKyB5MiAtICgxNiAvIDExNikpKSAvIDcuNzg3IDogOTUuMDQ3ICogTWF0aC5wb3coKGEgLyA1MDApICsgeTIsIDMpO1xuXG4gIHogPSB6IC8gMTA4Ljg4MyA8PSAwLjAwODg1OSA/IHogPSAoMTA4Ljg4MyAqICh5MiAtIChiIC8gMjAwKSAtICgxNiAvIDExNikpKSAvIDcuNzg3IDogMTA4Ljg4MyAqIE1hdGgucG93KHkyIC0gKGIgLyAyMDApLCAzKTtcblxuICByZXR1cm4gW3gsIHksIHpdO1xufVxuXG5mdW5jdGlvbiBsYWIybGNoKGxhYikge1xuICB2YXIgbCA9IGxhYlswXSxcbiAgICAgIGEgPSBsYWJbMV0sXG4gICAgICBiID0gbGFiWzJdLFxuICAgICAgaHIsIGgsIGM7XG5cbiAgaHIgPSBNYXRoLmF0YW4yKGIsIGEpO1xuICBoID0gaHIgKiAzNjAgLyAyIC8gTWF0aC5QSTtcbiAgaWYgKGggPCAwKSB7XG4gICAgaCArPSAzNjA7XG4gIH1cbiAgYyA9IE1hdGguc3FydChhICogYSArIGIgKiBiKTtcbiAgcmV0dXJuIFtsLCBjLCBoXTtcbn1cblxuZnVuY3Rpb24gbGFiMnJnYihhcmdzKSB7XG4gIHJldHVybiB4eXoycmdiKGxhYjJ4eXooYXJncykpO1xufVxuXG5mdW5jdGlvbiBsY2gybGFiKGxjaCkge1xuICB2YXIgbCA9IGxjaFswXSxcbiAgICAgIGMgPSBsY2hbMV0sXG4gICAgICBoID0gbGNoWzJdLFxuICAgICAgYSwgYiwgaHI7XG5cbiAgaHIgPSBoIC8gMzYwICogMiAqIE1hdGguUEk7XG4gIGEgPSBjICogTWF0aC5jb3MoaHIpO1xuICBiID0gYyAqIE1hdGguc2luKGhyKTtcbiAgcmV0dXJuIFtsLCBhLCBiXTtcbn1cblxuZnVuY3Rpb24gbGNoMnh5eihhcmdzKSB7XG4gIHJldHVybiBsYWIyeHl6KGxjaDJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBsY2gycmdiKGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJyZ2IobGNoMmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQycmdiKGtleXdvcmQpIHtcbiAgcmV0dXJuIGNzc0tleXdvcmRzW2tleXdvcmRdO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2Ioa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmxhYihhcmdzKSB7XG4gIHJldHVybiByZ2IybGFiKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJ4eXooYXJncykge1xuICByZXR1cm4gcmdiMnh5eihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbnZhciBjc3NLZXl3b3JkcyA9IHtcbiAgYWxpY2VibHVlOiAgWzI0MCwyNDgsMjU1XSxcbiAgYW50aXF1ZXdoaXRlOiBbMjUwLDIzNSwyMTVdLFxuICBhcXVhOiBbMCwyNTUsMjU1XSxcbiAgYXF1YW1hcmluZTogWzEyNywyNTUsMjEyXSxcbiAgYXp1cmU6ICBbMjQwLDI1NSwyNTVdLFxuICBiZWlnZTogIFsyNDUsMjQ1LDIyMF0sXG4gIGJpc3F1ZTogWzI1NSwyMjgsMTk2XSxcbiAgYmxhY2s6ICBbMCwwLDBdLFxuICBibGFuY2hlZGFsbW9uZDogWzI1NSwyMzUsMjA1XSxcbiAgYmx1ZTogWzAsMCwyNTVdLFxuICBibHVldmlvbGV0OiBbMTM4LDQzLDIyNl0sXG4gIGJyb3duOiAgWzE2NSw0Miw0Ml0sXG4gIGJ1cmx5d29vZDogIFsyMjIsMTg0LDEzNV0sXG4gIGNhZGV0Ymx1ZTogIFs5NSwxNTgsMTYwXSxcbiAgY2hhcnRyZXVzZTogWzEyNywyNTUsMF0sXG4gIGNob2NvbGF0ZTogIFsyMTAsMTA1LDMwXSxcbiAgY29yYWw6ICBbMjU1LDEyNyw4MF0sXG4gIGNvcm5mbG93ZXJibHVlOiBbMTAwLDE0OSwyMzddLFxuICBjb3Juc2lsazogWzI1NSwyNDgsMjIwXSxcbiAgY3JpbXNvbjogIFsyMjAsMjAsNjBdLFxuICBjeWFuOiBbMCwyNTUsMjU1XSxcbiAgZGFya2JsdWU6IFswLDAsMTM5XSxcbiAgZGFya2N5YW46IFswLDEzOSwxMzldLFxuICBkYXJrZ29sZGVucm9kOiAgWzE4NCwxMzQsMTFdLFxuICBkYXJrZ3JheTogWzE2OSwxNjksMTY5XSxcbiAgZGFya2dyZWVuOiAgWzAsMTAwLDBdLFxuICBkYXJrZ3JleTogWzE2OSwxNjksMTY5XSxcbiAgZGFya2toYWtpOiAgWzE4OSwxODMsMTA3XSxcbiAgZGFya21hZ2VudGE6ICBbMTM5LDAsMTM5XSxcbiAgZGFya29saXZlZ3JlZW46IFs4NSwxMDcsNDddLFxuICBkYXJrb3JhbmdlOiBbMjU1LDE0MCwwXSxcbiAgZGFya29yY2hpZDogWzE1Myw1MCwyMDRdLFxuICBkYXJrcmVkOiAgWzEzOSwwLDBdLFxuICBkYXJrc2FsbW9uOiBbMjMzLDE1MCwxMjJdLFxuICBkYXJrc2VhZ3JlZW46IFsxNDMsMTg4LDE0M10sXG4gIGRhcmtzbGF0ZWJsdWU6ICBbNzIsNjEsMTM5XSxcbiAgZGFya3NsYXRlZ3JheTogIFs0Nyw3OSw3OV0sXG4gIGRhcmtzbGF0ZWdyZXk6ICBbNDcsNzksNzldLFxuICBkYXJrdHVycXVvaXNlOiAgWzAsMjA2LDIwOV0sXG4gIGRhcmt2aW9sZXQ6IFsxNDgsMCwyMTFdLFxuICBkZWVwcGluazogWzI1NSwyMCwxNDddLFxuICBkZWVwc2t5Ymx1ZTogIFswLDE5MSwyNTVdLFxuICBkaW1ncmF5OiAgWzEwNSwxMDUsMTA1XSxcbiAgZGltZ3JleTogIFsxMDUsMTA1LDEwNV0sXG4gIGRvZGdlcmJsdWU6IFszMCwxNDQsMjU1XSxcbiAgZmlyZWJyaWNrOiAgWzE3OCwzNCwzNF0sXG4gIGZsb3JhbHdoaXRlOiAgWzI1NSwyNTAsMjQwXSxcbiAgZm9yZXN0Z3JlZW46ICBbMzQsMTM5LDM0XSxcbiAgZnVjaHNpYTogIFsyNTUsMCwyNTVdLFxuICBnYWluc2Jvcm86ICBbMjIwLDIyMCwyMjBdLFxuICBnaG9zdHdoaXRlOiBbMjQ4LDI0OCwyNTVdLFxuICBnb2xkOiBbMjU1LDIxNSwwXSxcbiAgZ29sZGVucm9kOiAgWzIxOCwxNjUsMzJdLFxuICBncmF5OiBbMTI4LDEyOCwxMjhdLFxuICBncmVlbjogIFswLDEyOCwwXSxcbiAgZ3JlZW55ZWxsb3c6ICBbMTczLDI1NSw0N10sXG4gIGdyZXk6IFsxMjgsMTI4LDEyOF0sXG4gIGhvbmV5ZGV3OiBbMjQwLDI1NSwyNDBdLFxuICBob3RwaW5rOiAgWzI1NSwxMDUsMTgwXSxcbiAgaW5kaWFucmVkOiAgWzIwNSw5Miw5Ml0sXG4gIGluZGlnbzogWzc1LDAsMTMwXSxcbiAgaXZvcnk6ICBbMjU1LDI1NSwyNDBdLFxuICBraGFraTogIFsyNDAsMjMwLDE0MF0sXG4gIGxhdmVuZGVyOiBbMjMwLDIzMCwyNTBdLFxuICBsYXZlbmRlcmJsdXNoOiAgWzI1NSwyNDAsMjQ1XSxcbiAgbGF3bmdyZWVuOiAgWzEyNCwyNTIsMF0sXG4gIGxlbW9uY2hpZmZvbjogWzI1NSwyNTAsMjA1XSxcbiAgbGlnaHRibHVlOiAgWzE3MywyMTYsMjMwXSxcbiAgbGlnaHRjb3JhbDogWzI0MCwxMjgsMTI4XSxcbiAgbGlnaHRjeWFuOiAgWzIyNCwyNTUsMjU1XSxcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IFsyNTAsMjUwLDIxMF0sXG4gIGxpZ2h0Z3JheTogIFsyMTEsMjExLDIxMV0sXG4gIGxpZ2h0Z3JlZW46IFsxNDQsMjM4LDE0NF0sXG4gIGxpZ2h0Z3JleTogIFsyMTEsMjExLDIxMV0sXG4gIGxpZ2h0cGluazogIFsyNTUsMTgyLDE5M10sXG4gIGxpZ2h0c2FsbW9uOiAgWzI1NSwxNjAsMTIyXSxcbiAgbGlnaHRzZWFncmVlbjogIFszMiwxNzgsMTcwXSxcbiAgbGlnaHRza3libHVlOiBbMTM1LDIwNiwyNTBdLFxuICBsaWdodHNsYXRlZ3JheTogWzExOSwxMzYsMTUzXSxcbiAgbGlnaHRzbGF0ZWdyZXk6IFsxMTksMTM2LDE1M10sXG4gIGxpZ2h0c3RlZWxibHVlOiBbMTc2LDE5NiwyMjJdLFxuICBsaWdodHllbGxvdzogIFsyNTUsMjU1LDIyNF0sXG4gIGxpbWU6IFswLDI1NSwwXSxcbiAgbGltZWdyZWVuOiAgWzUwLDIwNSw1MF0sXG4gIGxpbmVuOiAgWzI1MCwyNDAsMjMwXSxcbiAgbWFnZW50YTogIFsyNTUsMCwyNTVdLFxuICBtYXJvb246IFsxMjgsMCwwXSxcbiAgbWVkaXVtYXF1YW1hcmluZTogWzEwMiwyMDUsMTcwXSxcbiAgbWVkaXVtYmx1ZTogWzAsMCwyMDVdLFxuICBtZWRpdW1vcmNoaWQ6IFsxODYsODUsMjExXSxcbiAgbWVkaXVtcHVycGxlOiBbMTQ3LDExMiwyMTldLFxuICBtZWRpdW1zZWFncmVlbjogWzYwLDE3OSwxMTNdLFxuICBtZWRpdW1zbGF0ZWJsdWU6ICBbMTIzLDEwNCwyMzhdLFxuICBtZWRpdW1zcHJpbmdncmVlbjogIFswLDI1MCwxNTRdLFxuICBtZWRpdW10dXJxdW9pc2U6ICBbNzIsMjA5LDIwNF0sXG4gIG1lZGl1bXZpb2xldHJlZDogIFsxOTksMjEsMTMzXSxcbiAgbWlkbmlnaHRibHVlOiBbMjUsMjUsMTEyXSxcbiAgbWludGNyZWFtOiAgWzI0NSwyNTUsMjUwXSxcbiAgbWlzdHlyb3NlOiAgWzI1NSwyMjgsMjI1XSxcbiAgbW9jY2FzaW46IFsyNTUsMjI4LDE4MV0sXG4gIG5hdmFqb3doaXRlOiAgWzI1NSwyMjIsMTczXSxcbiAgbmF2eTogWzAsMCwxMjhdLFxuICBvbGRsYWNlOiAgWzI1MywyNDUsMjMwXSxcbiAgb2xpdmU6ICBbMTI4LDEyOCwwXSxcbiAgb2xpdmVkcmFiOiAgWzEwNywxNDIsMzVdLFxuICBvcmFuZ2U6IFsyNTUsMTY1LDBdLFxuICBvcmFuZ2VyZWQ6ICBbMjU1LDY5LDBdLFxuICBvcmNoaWQ6IFsyMTgsMTEyLDIxNF0sXG4gIHBhbGVnb2xkZW5yb2Q6ICBbMjM4LDIzMiwxNzBdLFxuICBwYWxlZ3JlZW46ICBbMTUyLDI1MSwxNTJdLFxuICBwYWxldHVycXVvaXNlOiAgWzE3NSwyMzgsMjM4XSxcbiAgcGFsZXZpb2xldHJlZDogIFsyMTksMTEyLDE0N10sXG4gIHBhcGF5YXdoaXA6IFsyNTUsMjM5LDIxM10sXG4gIHBlYWNocHVmZjogIFsyNTUsMjE4LDE4NV0sXG4gIHBlcnU6IFsyMDUsMTMzLDYzXSxcbiAgcGluazogWzI1NSwxOTIsMjAzXSxcbiAgcGx1bTogWzIyMSwxNjAsMjIxXSxcbiAgcG93ZGVyYmx1ZTogWzE3NiwyMjQsMjMwXSxcbiAgcHVycGxlOiBbMTI4LDAsMTI4XSxcbiAgcmViZWNjYXB1cnBsZTogWzEwMiwgNTEsIDE1M10sXG4gIHJlZDogIFsyNTUsMCwwXSxcbiAgcm9zeWJyb3duOiAgWzE4OCwxNDMsMTQzXSxcbiAgcm95YWxibHVlOiAgWzY1LDEwNSwyMjVdLFxuICBzYWRkbGVicm93bjogIFsxMzksNjksMTldLFxuICBzYWxtb246IFsyNTAsMTI4LDExNF0sXG4gIHNhbmR5YnJvd246IFsyNDQsMTY0LDk2XSxcbiAgc2VhZ3JlZW46IFs0NiwxMzksODddLFxuICBzZWFzaGVsbDogWzI1NSwyNDUsMjM4XSxcbiAgc2llbm5hOiBbMTYwLDgyLDQ1XSxcbiAgc2lsdmVyOiBbMTkyLDE5MiwxOTJdLFxuICBza3libHVlOiAgWzEzNSwyMDYsMjM1XSxcbiAgc2xhdGVibHVlOiAgWzEwNiw5MCwyMDVdLFxuICBzbGF0ZWdyYXk6ICBbMTEyLDEyOCwxNDRdLFxuICBzbGF0ZWdyZXk6ICBbMTEyLDEyOCwxNDRdLFxuICBzbm93OiBbMjU1LDI1MCwyNTBdLFxuICBzcHJpbmdncmVlbjogIFswLDI1NSwxMjddLFxuICBzdGVlbGJsdWU6ICBbNzAsMTMwLDE4MF0sXG4gIHRhbjogIFsyMTAsMTgwLDE0MF0sXG4gIHRlYWw6IFswLDEyOCwxMjhdLFxuICB0aGlzdGxlOiAgWzIxNiwxOTEsMjE2XSxcbiAgdG9tYXRvOiBbMjU1LDk5LDcxXSxcbiAgdHVycXVvaXNlOiAgWzY0LDIyNCwyMDhdLFxuICB2aW9sZXQ6IFsyMzgsMTMwLDIzOF0sXG4gIHdoZWF0OiAgWzI0NSwyMjIsMTc5XSxcbiAgd2hpdGU6ICBbMjU1LDI1NSwyNTVdLFxuICB3aGl0ZXNtb2tlOiBbMjQ1LDI0NSwyNDVdLFxuICB5ZWxsb3c6IFsyNTUsMjU1LDBdLFxuICB5ZWxsb3dncmVlbjogIFsxNTQsMjA1LDUwXVxufTtcblxudmFyIHJldmVyc2VLZXl3b3JkcyA9IHt9O1xuZm9yICh2YXIga2V5IGluIGNzc0tleXdvcmRzKSB7XG4gIHJldmVyc2VLZXl3b3Jkc1tKU09OLnN0cmluZ2lmeShjc3NLZXl3b3Jkc1trZXldKV0gPSBrZXk7XG59XG4iLCJ2YXIgY29udmVyc2lvbnMgPSByZXF1aXJlKFwiLi9jb252ZXJzaW9uc1wiKTtcblxudmFyIGNvbnZlcnQgPSBmdW5jdGlvbigpIHtcbiAgIHJldHVybiBuZXcgQ29udmVydGVyKCk7XG59XG5cbmZvciAodmFyIGZ1bmMgaW4gY29udmVyc2lvbnMpIHtcbiAgLy8gZXhwb3J0IFJhdyB2ZXJzaW9uc1xuICBjb252ZXJ0W2Z1bmMgKyBcIlJhd1wiXSA9ICAoZnVuY3Rpb24oZnVuYykge1xuICAgIC8vIGFjY2VwdCBhcnJheSBvciBwbGFpbiBhcmdzXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHR5cGVvZiBhcmcgPT0gXCJudW1iZXJcIilcbiAgICAgICAgYXJnID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjb252ZXJzaW9uc1tmdW5jXShhcmcpO1xuICAgIH1cbiAgfSkoZnVuYyk7XG5cbiAgdmFyIHBhaXIgPSAvKFxcdyspMihcXHcrKS8uZXhlYyhmdW5jKSxcbiAgICAgIGZyb20gPSBwYWlyWzFdLFxuICAgICAgdG8gPSBwYWlyWzJdO1xuXG4gIC8vIGV4cG9ydCByZ2IyaHNsIGFuZCBbXCJyZ2JcIl1bXCJoc2xcIl1cbiAgY29udmVydFtmcm9tXSA9IGNvbnZlcnRbZnJvbV0gfHwge307XG5cbiAgY29udmVydFtmcm9tXVt0b10gPSBjb252ZXJ0W2Z1bmNdID0gKGZ1bmN0aW9uKGZ1bmMpIHsgXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHR5cGVvZiBhcmcgPT0gXCJudW1iZXJcIilcbiAgICAgICAgYXJnID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIFxuICAgICAgdmFyIHZhbCA9IGNvbnZlcnNpb25zW2Z1bmNdKGFyZyk7XG4gICAgICBpZiAodHlwZW9mIHZhbCA9PSBcInN0cmluZ1wiIHx8IHZhbCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdmFsOyAvLyBrZXl3b3JkXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsLmxlbmd0aDsgaSsrKVxuICAgICAgICB2YWxbaV0gPSBNYXRoLnJvdW5kKHZhbFtpXSk7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgfSkoZnVuYyk7XG59XG5cblxuLyogQ29udmVydGVyIGRvZXMgbGF6eSBjb252ZXJzaW9uIGFuZCBjYWNoaW5nICovXG52YXIgQ29udmVydGVyID0gZnVuY3Rpb24oKSB7XG4gICB0aGlzLmNvbnZzID0ge307XG59O1xuXG4vKiBFaXRoZXIgZ2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2Ugb3JcbiAgc2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UsIGRlcGVuZGluZyBvbiBhcmdzICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLnJvdXRlU3BhY2UgPSBmdW5jdGlvbihzcGFjZSwgYXJncykge1xuICAgdmFyIHZhbHVlcyA9IGFyZ3NbMF07XG4gICBpZiAodmFsdWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGNvbG9yLnJnYigpXG4gICAgICByZXR1cm4gdGhpcy5nZXRWYWx1ZXMoc3BhY2UpO1xuICAgfVxuICAgLy8gY29sb3IucmdiKDEwLCAxMCwgMTApXG4gICBpZiAodHlwZW9mIHZhbHVlcyA9PSBcIm51bWJlclwiKSB7XG4gICAgICB2YWx1ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKTsgICAgICAgIFxuICAgfVxuXG4gICByZXR1cm4gdGhpcy5zZXRWYWx1ZXMoc3BhY2UsIHZhbHVlcyk7XG59O1xuICBcbi8qIFNldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlLCBpbnZhbGlkYXRpbmcgY2FjaGUgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUuc2V0VmFsdWVzID0gZnVuY3Rpb24oc3BhY2UsIHZhbHVlcykge1xuICAgdGhpcy5zcGFjZSA9IHNwYWNlO1xuICAgdGhpcy5jb252cyA9IHt9O1xuICAgdGhpcy5jb252c1tzcGFjZV0gPSB2YWx1ZXM7XG4gICByZXR1cm4gdGhpcztcbn07XG5cbi8qIEdldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlLiBJZiB0aGVyZSdzIGFscmVhZHlcbiAgYSBjb252ZXJzaW9uIGZvciB0aGUgc3BhY2UsIGZldGNoIGl0LCBvdGhlcndpc2VcbiAgY29tcHV0ZSBpdCAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbihzcGFjZSkge1xuICAgdmFyIHZhbHMgPSB0aGlzLmNvbnZzW3NwYWNlXTtcbiAgIGlmICghdmFscykge1xuICAgICAgdmFyIGZzcGFjZSA9IHRoaXMuc3BhY2UsXG4gICAgICAgICAgZnJvbSA9IHRoaXMuY29udnNbZnNwYWNlXTtcbiAgICAgIHZhbHMgPSBjb252ZXJ0W2ZzcGFjZV1bc3BhY2VdKGZyb20pO1xuXG4gICAgICB0aGlzLmNvbnZzW3NwYWNlXSA9IHZhbHM7XG4gICB9XG4gIHJldHVybiB2YWxzO1xufTtcblxuW1wicmdiXCIsIFwiaHNsXCIsIFwiaHN2XCIsIFwiY215a1wiLCBcImtleXdvcmRcIl0uZm9yRWFjaChmdW5jdGlvbihzcGFjZSkge1xuICAgQ29udmVydGVyLnByb3RvdHlwZVtzcGFjZV0gPSBmdW5jdGlvbih2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZVNwYWNlKHNwYWNlLCBhcmd1bWVudHMpO1xuICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udmVydDsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRcImFsaWNlYmx1ZVwiOiBbMjQwLCAyNDgsIDI1NV0sXHJcblx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwgMjM1LCAyMTVdLFxyXG5cdFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiYXF1YW1hcmluZVwiOiBbMTI3LCAyNTUsIDIxMl0sXHJcblx0XCJhenVyZVwiOiBbMjQwLCAyNTUsIDI1NV0sXHJcblx0XCJiZWlnZVwiOiBbMjQ1LCAyNDUsIDIyMF0sXHJcblx0XCJiaXNxdWVcIjogWzI1NSwgMjI4LCAxOTZdLFxyXG5cdFwiYmxhY2tcIjogWzAsIDAsIDBdLFxyXG5cdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwgMjM1LCAyMDVdLFxyXG5cdFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcclxuXHRcImJsdWV2aW9sZXRcIjogWzEzOCwgNDMsIDIyNl0sXHJcblx0XCJicm93blwiOiBbMTY1LCA0MiwgNDJdLFxyXG5cdFwiYnVybHl3b29kXCI6IFsyMjIsIDE4NCwgMTM1XSxcclxuXHRcImNhZGV0Ymx1ZVwiOiBbOTUsIDE1OCwgMTYwXSxcclxuXHRcImNoYXJ0cmV1c2VcIjogWzEyNywgMjU1LCAwXSxcclxuXHRcImNob2NvbGF0ZVwiOiBbMjEwLCAxMDUsIDMwXSxcclxuXHRcImNvcmFsXCI6IFsyNTUsIDEyNywgODBdLFxyXG5cdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwgMTQ5LCAyMzddLFxyXG5cdFwiY29ybnNpbGtcIjogWzI1NSwgMjQ4LCAyMjBdLFxyXG5cdFwiY3JpbXNvblwiOiBbMjIwLCAyMCwgNjBdLFxyXG5cdFwiY3lhblwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiZGFya2JsdWVcIjogWzAsIDAsIDEzOV0sXHJcblx0XCJkYXJrY3lhblwiOiBbMCwgMTM5LCAxMzldLFxyXG5cdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LCAxMzQsIDExXSxcclxuXHRcImRhcmtncmF5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtncmVlblwiOiBbMCwgMTAwLCAwXSxcclxuXHRcImRhcmtncmV5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtraGFraVwiOiBbMTg5LCAxODMsIDEwN10sXHJcblx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LCAwLCAxMzldLFxyXG5cdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LCAxMDcsIDQ3XSxcclxuXHRcImRhcmtvcmFuZ2VcIjogWzI1NSwgMTQwLCAwXSxcclxuXHRcImRhcmtvcmNoaWRcIjogWzE1MywgNTAsIDIwNF0sXHJcblx0XCJkYXJrcmVkXCI6IFsxMzksIDAsIDBdLFxyXG5cdFwiZGFya3NhbG1vblwiOiBbMjMzLCAxNTAsIDEyMl0sXHJcblx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywgMTg4LCAxNDNdLFxyXG5cdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsIDYxLCAxMzldLFxyXG5cdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrc2xhdGVncmV5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmt0dXJxdW9pc2VcIjogWzAsIDIwNiwgMjA5XSxcclxuXHRcImRhcmt2aW9sZXRcIjogWzE0OCwgMCwgMjExXSxcclxuXHRcImRlZXBwaW5rXCI6IFsyNTUsIDIwLCAxNDddLFxyXG5cdFwiZGVlcHNreWJsdWVcIjogWzAsIDE5MSwgMjU1XSxcclxuXHRcImRpbWdyYXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZGltZ3JleVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkb2RnZXJibHVlXCI6IFszMCwgMTQ0LCAyNTVdLFxyXG5cdFwiZmlyZWJyaWNrXCI6IFsxNzgsIDM0LCAzNF0sXHJcblx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LCAyNTAsIDI0MF0sXHJcblx0XCJmb3Jlc3RncmVlblwiOiBbMzQsIDEzOSwgMzRdLFxyXG5cdFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwiZ2FpbnNib3JvXCI6IFsyMjAsIDIyMCwgMjIwXSxcclxuXHRcImdob3N0d2hpdGVcIjogWzI0OCwgMjQ4LCAyNTVdLFxyXG5cdFwiZ29sZFwiOiBbMjU1LCAyMTUsIDBdLFxyXG5cdFwiZ29sZGVucm9kXCI6IFsyMTgsIDE2NSwgMzJdLFxyXG5cdFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJncmVlblwiOiBbMCwgMTI4LCAwXSxcclxuXHRcImdyZWVueWVsbG93XCI6IFsxNzMsIDI1NSwgNDddLFxyXG5cdFwiZ3JleVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJob25leWRld1wiOiBbMjQwLCAyNTUsIDI0MF0sXHJcblx0XCJob3RwaW5rXCI6IFsyNTUsIDEwNSwgMTgwXSxcclxuXHRcImluZGlhbnJlZFwiOiBbMjA1LCA5MiwgOTJdLFxyXG5cdFwiaW5kaWdvXCI6IFs3NSwgMCwgMTMwXSxcclxuXHRcIml2b3J5XCI6IFsyNTUsIDI1NSwgMjQwXSxcclxuXHRcImtoYWtpXCI6IFsyNDAsIDIzMCwgMTQwXSxcclxuXHRcImxhdmVuZGVyXCI6IFsyMzAsIDIzMCwgMjUwXSxcclxuXHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwgMjQwLCAyNDVdLFxyXG5cdFwibGF3bmdyZWVuXCI6IFsxMjQsIDI1MiwgMF0sXHJcblx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwgMjUwLCAyMDVdLFxyXG5cdFwibGlnaHRibHVlXCI6IFsxNzMsIDIxNiwgMjMwXSxcclxuXHRcImxpZ2h0Y29yYWxcIjogWzI0MCwgMTI4LCAxMjhdLFxyXG5cdFwibGlnaHRjeWFuXCI6IFsyMjQsIDI1NSwgMjU1XSxcclxuXHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsIDI1MCwgMjEwXSxcclxuXHRcImxpZ2h0Z3JheVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodGdyZWVuXCI6IFsxNDQsIDIzOCwgMTQ0XSxcclxuXHRcImxpZ2h0Z3JleVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodHBpbmtcIjogWzI1NSwgMTgyLCAxOTNdLFxyXG5cdFwibGlnaHRzYWxtb25cIjogWzI1NSwgMTYwLCAxMjJdLFxyXG5cdFwibGlnaHRzZWFncmVlblwiOiBbMzIsIDE3OCwgMTcwXSxcclxuXHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDI1MF0sXHJcblx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LCAxOTYsIDIyMl0sXHJcblx0XCJsaWdodHllbGxvd1wiOiBbMjU1LCAyNTUsIDIyNF0sXHJcblx0XCJsaW1lXCI6IFswLCAyNTUsIDBdLFxyXG5cdFwibGltZWdyZWVuXCI6IFs1MCwgMjA1LCA1MF0sXHJcblx0XCJsaW5lblwiOiBbMjUwLCAyNDAsIDIzMF0sXHJcblx0XCJtYWdlbnRhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXHJcblx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsIDIwNSwgMTcwXSxcclxuXHRcIm1lZGl1bWJsdWVcIjogWzAsIDAsIDIwNV0sXHJcblx0XCJtZWRpdW1vcmNoaWRcIjogWzE4NiwgODUsIDIxMV0sXHJcblx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywgMTEyLCAyMTldLFxyXG5cdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLCAxNzksIDExM10sXHJcblx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywgMTA0LCAyMzhdLFxyXG5cdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsIDI1MCwgMTU0XSxcclxuXHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsIDIwOSwgMjA0XSxcclxuXHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LCAyMSwgMTMzXSxcclxuXHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsIDI1LCAxMTJdLFxyXG5cdFwibWludGNyZWFtXCI6IFsyNDUsIDI1NSwgMjUwXSxcclxuXHRcIm1pc3R5cm9zZVwiOiBbMjU1LCAyMjgsIDIyNV0sXHJcblx0XCJtb2NjYXNpblwiOiBbMjU1LCAyMjgsIDE4MV0sXHJcblx0XCJuYXZham93aGl0ZVwiOiBbMjU1LCAyMjIsIDE3M10sXHJcblx0XCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxyXG5cdFwib2xkbGFjZVwiOiBbMjUzLCAyNDUsIDIzMF0sXHJcblx0XCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxyXG5cdFwib2xpdmVkcmFiXCI6IFsxMDcsIDE0MiwgMzVdLFxyXG5cdFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXHJcblx0XCJvcmFuZ2VyZWRcIjogWzI1NSwgNjksIDBdLFxyXG5cdFwib3JjaGlkXCI6IFsyMTgsIDExMiwgMjE0XSxcclxuXHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwgMjMyLCAxNzBdLFxyXG5cdFwicGFsZWdyZWVuXCI6IFsxNTIsIDI1MSwgMTUyXSxcclxuXHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwgMjM4LCAyMzhdLFxyXG5cdFwicGFsZXZpb2xldHJlZFwiOiBbMjE5LCAxMTIsIDE0N10sXHJcblx0XCJwYXBheWF3aGlwXCI6IFsyNTUsIDIzOSwgMjEzXSxcclxuXHRcInBlYWNocHVmZlwiOiBbMjU1LCAyMTgsIDE4NV0sXHJcblx0XCJwZXJ1XCI6IFsyMDUsIDEzMywgNjNdLFxyXG5cdFwicGlua1wiOiBbMjU1LCAxOTIsIDIwM10sXHJcblx0XCJwbHVtXCI6IFsyMjEsIDE2MCwgMjIxXSxcclxuXHRcInBvd2RlcmJsdWVcIjogWzE3NiwgMjI0LCAyMzBdLFxyXG5cdFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXHJcblx0XCJyZWJlY2NhcHVycGxlXCI6IFsxMDIsIDUxLCAxNTNdLFxyXG5cdFwicmVkXCI6IFsyNTUsIDAsIDBdLFxyXG5cdFwicm9zeWJyb3duXCI6IFsxODgsIDE0MywgMTQzXSxcclxuXHRcInJveWFsYmx1ZVwiOiBbNjUsIDEwNSwgMjI1XSxcclxuXHRcInNhZGRsZWJyb3duXCI6IFsxMzksIDY5LCAxOV0sXHJcblx0XCJzYWxtb25cIjogWzI1MCwgMTI4LCAxMTRdLFxyXG5cdFwic2FuZHlicm93blwiOiBbMjQ0LCAxNjQsIDk2XSxcclxuXHRcInNlYWdyZWVuXCI6IFs0NiwgMTM5LCA4N10sXHJcblx0XCJzZWFzaGVsbFwiOiBbMjU1LCAyNDUsIDIzOF0sXHJcblx0XCJzaWVubmFcIjogWzE2MCwgODIsIDQ1XSxcclxuXHRcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXHJcblx0XCJza3libHVlXCI6IFsxMzUsIDIwNiwgMjM1XSxcclxuXHRcInNsYXRlYmx1ZVwiOiBbMTA2LCA5MCwgMjA1XSxcclxuXHRcInNsYXRlZ3JheVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbGF0ZWdyZXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic25vd1wiOiBbMjU1LCAyNTAsIDI1MF0sXHJcblx0XCJzcHJpbmdncmVlblwiOiBbMCwgMjU1LCAxMjddLFxyXG5cdFwic3RlZWxibHVlXCI6IFs3MCwgMTMwLCAxODBdLFxyXG5cdFwidGFuXCI6IFsyMTAsIDE4MCwgMTQwXSxcclxuXHRcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcclxuXHRcInRoaXN0bGVcIjogWzIxNiwgMTkxLCAyMTZdLFxyXG5cdFwidG9tYXRvXCI6IFsyNTUsIDk5LCA3MV0sXHJcblx0XCJ0dXJxdW9pc2VcIjogWzY0LCAyMjQsIDIwOF0sXHJcblx0XCJ2aW9sZXRcIjogWzIzOCwgMTMwLCAyMzhdLFxyXG5cdFwid2hlYXRcIjogWzI0NSwgMjIyLCAxNzldLFxyXG5cdFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxyXG5cdFwid2hpdGVzbW9rZVwiOiBbMjQ1LCAyNDUsIDI0NV0sXHJcblx0XCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXSxcclxuXHRcInllbGxvd2dyZWVuXCI6IFsxNTQsIDIwNSwgNTBdXHJcbn07IiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjb2xvck5hbWVzID0gcmVxdWlyZSgnY29sb3ItbmFtZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgIGdldFJnYmE6IGdldFJnYmEsXG4gICBnZXRIc2xhOiBnZXRIc2xhLFxuICAgZ2V0UmdiOiBnZXRSZ2IsXG4gICBnZXRIc2w6IGdldEhzbCxcbiAgIGdldEh3YjogZ2V0SHdiLFxuICAgZ2V0QWxwaGE6IGdldEFscGhhLFxuXG4gICBoZXhTdHJpbmc6IGhleFN0cmluZyxcbiAgIHJnYlN0cmluZzogcmdiU3RyaW5nLFxuICAgcmdiYVN0cmluZzogcmdiYVN0cmluZyxcbiAgIHBlcmNlbnRTdHJpbmc6IHBlcmNlbnRTdHJpbmcsXG4gICBwZXJjZW50YVN0cmluZzogcGVyY2VudGFTdHJpbmcsXG4gICBoc2xTdHJpbmc6IGhzbFN0cmluZyxcbiAgIGhzbGFTdHJpbmc6IGhzbGFTdHJpbmcsXG4gICBod2JTdHJpbmc6IGh3YlN0cmluZyxcbiAgIGtleXdvcmQ6IGtleXdvcmRcbn1cblxuZnVuY3Rpb24gZ2V0UmdiYShzdHJpbmcpIHtcbiAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm47XG4gICB9XG4gICB2YXIgYWJiciA9ICAvXiMoW2EtZkEtRjAtOV17M30pJC8sXG4gICAgICAgaGV4ID0gIC9eIyhbYS1mQS1GMC05XXs2fSkkLyxcbiAgICAgICByZ2JhID0gL15yZ2JhP1xcKFxccyooWystXT9cXGQrKVxccyosXFxzKihbKy1dP1xcZCspXFxzKixcXHMqKFsrLV0/XFxkKylcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC8sXG4gICAgICAgcGVyID0gL15yZ2JhP1xcKFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC8sXG4gICAgICAga2V5d29yZCA9IC8oXFxEKykvO1xuXG4gICB2YXIgcmdiID0gWzAsIDAsIDBdLFxuICAgICAgIGEgPSAxLFxuICAgICAgIG1hdGNoID0gc3RyaW5nLm1hdGNoKGFiYnIpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgICBtYXRjaCA9IG1hdGNoWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2ldICsgbWF0Y2hbaV0sIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGhleCkpIHtcbiAgICAgIG1hdGNoID0gbWF0Y2hbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2guc2xpY2UoaSAqIDIsIGkgKiAyICsgMiksIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHJnYmEpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaSArIDFdKTtcbiAgICAgIH1cbiAgICAgIGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQobWF0Y2hbaSArIDFdKSAqIDIuNTUpO1xuICAgICAgfVxuICAgICAgYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goa2V5d29yZCkpIHtcbiAgICAgIGlmIChtYXRjaFsxXSA9PSBcInRyYW5zcGFyZW50XCIpIHtcbiAgICAgICAgIHJldHVybiBbMCwgMCwgMCwgMF07XG4gICAgICB9XG4gICAgICByZ2IgPSBjb2xvck5hbWVzW21hdGNoWzFdXTtcbiAgICAgIGlmICghcmdiKSB7XG4gICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICB9XG5cbiAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZ2JbaV0gPSBzY2FsZShyZ2JbaV0sIDAsIDI1NSk7XG4gICB9XG4gICBpZiAoIWEgJiYgYSAhPSAwKSB7XG4gICAgICBhID0gMTtcbiAgIH1cbiAgIGVsc2Uge1xuICAgICAgYSA9IHNjYWxlKGEsIDAsIDEpO1xuICAgfVxuICAgcmdiWzNdID0gYTtcbiAgIHJldHVybiByZ2I7XG59XG5cbmZ1bmN0aW9uIGdldEhzbGEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGhzbCA9IC9eaHNsYT9cXChcXHMqKFsrLV0/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpLztcbiAgIHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChoc2wpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgICB2YXIgYWxwaGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgICAgIHZhciBoID0gc2NhbGUocGFyc2VJbnQobWF0Y2hbMV0pLCAwLCAzNjApLFxuICAgICAgICAgIHMgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKSxcbiAgICAgICAgICBsID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCksXG4gICAgICAgICAgYSA9IHNjYWxlKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XG4gICAgICByZXR1cm4gW2gsIHMsIGwsIGFdO1xuICAgfVxufVxuXG5mdW5jdGlvbiBnZXRId2Ioc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGh3YiA9IC9eaHdiXFwoXFxzKihbKy1dP1xcZCspKD86ZGVnKT9cXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKS87XG4gICB2YXIgbWF0Y2ggPSBzdHJpbmcubWF0Y2goaHdiKTtcbiAgIGlmIChtYXRjaCkge1xuICAgIHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgICAgdmFyIGggPSBzY2FsZShwYXJzZUludChtYXRjaFsxXSksIDAsIDM2MCksXG4gICAgICAgICAgdyA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApLFxuICAgICAgICAgIGIgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKSxcbiAgICAgICAgICBhID0gc2NhbGUoaXNOYU4oYWxwaGEpID8gMSA6IGFscGhhLCAwLCAxKTtcbiAgICAgIHJldHVybiBbaCwgdywgYiwgYV07XG4gICB9XG59XG5cbmZ1bmN0aW9uIGdldFJnYihzdHJpbmcpIHtcbiAgIHZhciByZ2JhID0gZ2V0UmdiYShzdHJpbmcpO1xuICAgcmV0dXJuIHJnYmEgJiYgcmdiYS5zbGljZSgwLCAzKTtcbn1cblxuZnVuY3Rpb24gZ2V0SHNsKHN0cmluZykge1xuICB2YXIgaHNsYSA9IGdldEhzbGEoc3RyaW5nKTtcbiAgcmV0dXJuIGhzbGEgJiYgaHNsYS5zbGljZSgwLCAzKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxwaGEoc3RyaW5nKSB7XG4gICB2YXIgdmFscyA9IGdldFJnYmEoc3RyaW5nKTtcbiAgIGlmICh2YWxzKSB7XG4gICAgICByZXR1cm4gdmFsc1szXTtcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHMgPSBnZXRIc2xhKHN0cmluZykpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxuICAgZWxzZSBpZiAodmFscyA9IGdldEh3YihzdHJpbmcpKSB7XG4gICAgICByZXR1cm4gdmFsc1szXTtcbiAgIH1cbn1cblxuLy8gZ2VuZXJhdG9yc1xuZnVuY3Rpb24gaGV4U3RyaW5nKHJnYikge1xuICAgcmV0dXJuIFwiI1wiICsgaGV4RG91YmxlKHJnYlswXSkgKyBoZXhEb3VibGUocmdiWzFdKVxuICAgICAgICAgICAgICArIGhleERvdWJsZShyZ2JbMl0pO1xufVxuXG5mdW5jdGlvbiByZ2JTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKHJnYmFbM10gJiYgcmdiYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gcmdiYVN0cmluZyhyZ2JhLCBhbHBoYSk7XG4gICB9XG4gICByZXR1cm4gXCJyZ2IoXCIgKyByZ2JhWzBdICsgXCIsIFwiICsgcmdiYVsxXSArIFwiLCBcIiArIHJnYmFbMl0gKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gcmdiYVN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFscGhhID0gKHJnYmFbM10gIT09IHVuZGVmaW5lZCA/IHJnYmFbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcInJnYmEoXCIgKyByZ2JhWzBdICsgXCIsIFwiICsgcmdiYVsxXSArIFwiLCBcIiArIHJnYmFbMl1cbiAgICAgICAgICAgKyBcIiwgXCIgKyBhbHBoYSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBwZXJjZW50U3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPCAxIHx8IChyZ2JhWzNdICYmIHJnYmFbM10gPCAxKSkge1xuICAgICAgcmV0dXJuIHBlcmNlbnRhU3RyaW5nKHJnYmEsIGFscGhhKTtcbiAgIH1cbiAgIHZhciByID0gTWF0aC5yb3VuZChyZ2JhWzBdLzI1NSAqIDEwMCksXG4gICAgICAgZyA9IE1hdGgucm91bmQocmdiYVsxXS8yNTUgKiAxMDApLFxuICAgICAgIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0vMjU1ICogMTAwKTtcblxuICAgcmV0dXJuIFwicmdiKFwiICsgciArIFwiJSwgXCIgKyBnICsgXCIlLCBcIiArIGIgKyBcIiUpXCI7XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRhU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICB2YXIgciA9IE1hdGgucm91bmQocmdiYVswXS8yNTUgKiAxMDApLFxuICAgICAgIGcgPSBNYXRoLnJvdW5kKHJnYmFbMV0vMjU1ICogMTAwKSxcbiAgICAgICBiID0gTWF0aC5yb3VuZChyZ2JhWzJdLzI1NSAqIDEwMCk7XG4gICByZXR1cm4gXCJyZ2JhKFwiICsgciArIFwiJSwgXCIgKyBnICsgXCIlLCBcIiArIGIgKyBcIiUsIFwiICsgKGFscGhhIHx8IHJnYmFbM10gfHwgMSkgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gaHNsU3RyaW5nKGhzbGEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPCAxIHx8IChoc2xhWzNdICYmIGhzbGFbM10gPCAxKSkge1xuICAgICAgcmV0dXJuIGhzbGFTdHJpbmcoaHNsYSwgYWxwaGEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHNsKFwiICsgaHNsYVswXSArIFwiLCBcIiArIGhzbGFbMV0gKyBcIiUsIFwiICsgaHNsYVsyXSArIFwiJSlcIjtcbn1cblxuZnVuY3Rpb24gaHNsYVN0cmluZyhoc2xhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFscGhhID0gKGhzbGFbM10gIT09IHVuZGVmaW5lZCA/IGhzbGFbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcImhzbGEoXCIgKyBoc2xhWzBdICsgXCIsIFwiICsgaHNsYVsxXSArIFwiJSwgXCIgKyBoc2xhWzJdICsgXCIlLCBcIlxuICAgICAgICAgICArIGFscGhhICsgXCIpXCI7XG59XG5cbi8vIGh3YiBpcyBhIGJpdCBkaWZmZXJlbnQgdGhhbiByZ2IoYSkgJiBoc2woYSkgc2luY2UgdGhlcmUgaXMgbm8gYWxwaGEgc3BlY2lmaWMgc3ludGF4XG4vLyAoaHdiIGhhdmUgYWxwaGEgb3B0aW9uYWwgJiAxIGlzIGRlZmF1bHQgdmFsdWUpXG5mdW5jdGlvbiBod2JTdHJpbmcoaHdiLCBhbHBoYSkge1xuICAgaWYgKGFscGhhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFscGhhID0gKGh3YlszXSAhPT0gdW5kZWZpbmVkID8gaHdiWzNdIDogMSk7XG4gICB9XG4gICByZXR1cm4gXCJod2IoXCIgKyBod2JbMF0gKyBcIiwgXCIgKyBod2JbMV0gKyBcIiUsIFwiICsgaHdiWzJdICsgXCIlXCJcbiAgICAgICAgICAgKyAoYWxwaGEgIT09IHVuZGVmaW5lZCAmJiBhbHBoYSAhPT0gMSA/IFwiLCBcIiArIGFscGhhIDogXCJcIikgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24ga2V5d29yZChyZ2IpIHtcbiAgcmV0dXJuIHJldmVyc2VOYW1lc1tyZ2Iuc2xpY2UoMCwgMyldO1xufVxuXG4vLyBoZWxwZXJzXG5mdW5jdGlvbiBzY2FsZShudW0sIG1pbiwgbWF4KSB7XG4gICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCBudW0pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiBoZXhEb3VibGUobnVtKSB7XG4gIHZhciBzdHIgPSBudW0udG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiAoc3RyLmxlbmd0aCA8IDIpID8gXCIwXCIgKyBzdHIgOiBzdHI7XG59XG5cblxuLy9jcmVhdGUgYSBsaXN0IG9mIHJldmVyc2UgY29sb3IgbmFtZXNcbnZhciByZXZlcnNlTmFtZXMgPSB7fTtcbmZvciAodmFyIG5hbWUgaW4gY29sb3JOYW1lcykge1xuICAgcmV2ZXJzZU5hbWVzW2NvbG9yTmFtZXNbbmFtZV1dID0gbmFtZTtcbn1cbiIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY29udmVydCA9IHJlcXVpcmUoJ2NvbG9yLWNvbnZlcnQnKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCdjb2xvci1zdHJpbmcnKTtcblxudmFyIENvbG9yID0gZnVuY3Rpb24gKG9iaikge1xuXHRpZiAob2JqIGluc3RhbmNlb2YgQ29sb3IpIHtcblx0XHRyZXR1cm4gb2JqO1xuXHR9XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb2xvcikpIHtcblx0XHRyZXR1cm4gbmV3IENvbG9yKG9iaik7XG5cdH1cblxuXHR0aGlzLnZhbHVlcyA9IHtcblx0XHRyZ2I6IFswLCAwLCAwXSxcblx0XHRoc2w6IFswLCAwLCAwXSxcblx0XHRoc3Y6IFswLCAwLCAwXSxcblx0XHRod2I6IFswLCAwLCAwXSxcblx0XHRjbXlrOiBbMCwgMCwgMCwgMF0sXG5cdFx0YWxwaGE6IDFcblx0fTtcblxuXHQvLyBwYXJzZSBDb2xvcigpIGFyZ3VtZW50XG5cdHZhciB2YWxzO1xuXHRpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcblx0XHR2YWxzID0gc3RyaW5nLmdldFJnYmEob2JqKTtcblx0XHRpZiAodmFscykge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ3JnYicsIHZhbHMpO1xuXHRcdH0gZWxzZSBpZiAodmFscyA9IHN0cmluZy5nZXRIc2xhKG9iaikpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdoc2wnLCB2YWxzKTtcblx0XHR9IGVsc2UgaWYgKHZhbHMgPSBzdHJpbmcuZ2V0SHdiKG9iaikpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdod2InLCB2YWxzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gcGFyc2UgY29sb3IgZnJvbSBzdHJpbmcgXCInICsgb2JqICsgJ1wiJyk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG5cdFx0dmFscyA9IG9iajtcblx0XHRpZiAodmFscy5yICE9PSB1bmRlZmluZWQgfHwgdmFscy5yZWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ3JnYicsIHZhbHMpO1xuXHRcdH0gZWxzZSBpZiAodmFscy5sICE9PSB1bmRlZmluZWQgfHwgdmFscy5saWdodG5lc3MgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzbCcsIHZhbHMpO1xuXHRcdH0gZWxzZSBpZiAodmFscy52ICE9PSB1bmRlZmluZWQgfHwgdmFscy52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygnaHN2JywgdmFscyk7XG5cdFx0fSBlbHNlIGlmICh2YWxzLncgIT09IHVuZGVmaW5lZCB8fCB2YWxzLndoaXRlbmVzcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygnaHdiJywgdmFscyk7XG5cdFx0fSBlbHNlIGlmICh2YWxzLmMgIT09IHVuZGVmaW5lZCB8fCB2YWxzLmN5YW4gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ2NteWsnLCB2YWxzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gcGFyc2UgY29sb3IgZnJvbSBvYmplY3QgJyArIEpTT04uc3RyaW5naWZ5KG9iaikpO1xuXHRcdH1cblx0fVxufTtcblxuQ29sb3IucHJvdG90eXBlID0ge1xuXHRyZ2I6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRTcGFjZSgncmdiJywgYXJndW1lbnRzKTtcblx0fSxcblx0aHNsOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0U3BhY2UoJ2hzbCcsIGFyZ3VtZW50cyk7XG5cdH0sXG5cdGhzdjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnNldFNwYWNlKCdoc3YnLCBhcmd1bWVudHMpO1xuXHR9LFxuXHRod2I6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRTcGFjZSgnaHdiJywgYXJndW1lbnRzKTtcblx0fSxcblx0Y215azogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnNldFNwYWNlKCdjbXlrJywgYXJndW1lbnRzKTtcblx0fSxcblxuXHRyZ2JBcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbHVlcy5yZ2I7XG5cdH0sXG5cdGhzbEFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWVzLmhzbDtcblx0fSxcblx0aHN2QXJyYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZXMuaHN2O1xuXHR9LFxuXHRod2JBcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLnZhbHVlcy5hbHBoYSAhPT0gMSkge1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsdWVzLmh3Yi5jb25jYXQoW3RoaXMudmFsdWVzLmFscGhhXSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnZhbHVlcy5od2I7XG5cdH0sXG5cdGNteWtBcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbHVlcy5jbXlrO1xuXHR9LFxuXHRyZ2JhQXJyYXk6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiO1xuXHRcdHJldHVybiByZ2IuY29uY2F0KFt0aGlzLnZhbHVlcy5hbHBoYV0pO1xuXHR9LFxuXHRoc2xhQXJyYXk6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaHNsID0gdGhpcy52YWx1ZXMuaHNsO1xuXHRcdHJldHVybiBoc2wuY29uY2F0KFt0aGlzLnZhbHVlcy5hbHBoYV0pO1xuXHR9LFxuXHRhbHBoYTogZnVuY3Rpb24gKHZhbCkge1xuXHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsdWVzLmFscGhhO1xuXHRcdH1cblx0XHR0aGlzLnNldFZhbHVlcygnYWxwaGEnLCB2YWwpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHJlZDogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ3JnYicsIDAsIHZhbCk7XG5cdH0sXG5cdGdyZWVuOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgncmdiJywgMSwgdmFsKTtcblx0fSxcblx0Ymx1ZTogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ3JnYicsIDIsIHZhbCk7XG5cdH0sXG5cdGh1ZTogZnVuY3Rpb24gKHZhbCkge1xuXHRcdGlmICh2YWwpIHtcblx0XHRcdHZhbCAlPSAzNjA7XG5cdFx0XHR2YWwgPSB2YWwgPCAwID8gMzYwICsgdmFsIDogdmFsO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdoc2wnLCAwLCB2YWwpO1xuXHR9LFxuXHRzYXR1cmF0aW9uOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnaHNsJywgMSwgdmFsKTtcblx0fSxcblx0bGlnaHRuZXNzOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnaHNsJywgMiwgdmFsKTtcblx0fSxcblx0c2F0dXJhdGlvbnY6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdoc3YnLCAxLCB2YWwpO1xuXHR9LFxuXHR3aGl0ZW5lc3M6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdod2InLCAxLCB2YWwpO1xuXHR9LFxuXHRibGFja25lc3M6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdod2InLCAyLCB2YWwpO1xuXHR9LFxuXHR2YWx1ZTogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2hzdicsIDIsIHZhbCk7XG5cdH0sXG5cdGN5YW46IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdjbXlrJywgMCwgdmFsKTtcblx0fSxcblx0bWFnZW50YTogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2NteWsnLCAxLCB2YWwpO1xuXHR9LFxuXHR5ZWxsb3c6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdjbXlrJywgMiwgdmFsKTtcblx0fSxcblx0YmxhY2s6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdjbXlrJywgMywgdmFsKTtcblx0fSxcblxuXHRoZXhTdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLmhleFN0cmluZyh0aGlzLnZhbHVlcy5yZ2IpO1xuXHR9LFxuXHRyZ2JTdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLnJnYlN0cmluZyh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcblx0fSxcblx0cmdiYVN0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcucmdiYVN0cmluZyh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcblx0fSxcblx0cGVyY2VudFN0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcucGVyY2VudFN0cmluZyh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcblx0fSxcblx0aHNsU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5oc2xTdHJpbmcodGhpcy52YWx1ZXMuaHNsLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG5cdH0sXG5cdGhzbGFTdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLmhzbGFTdHJpbmcodGhpcy52YWx1ZXMuaHNsLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG5cdH0sXG5cdGh3YlN0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcuaHdiU3RyaW5nKHRoaXMudmFsdWVzLmh3YiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuXHR9LFxuXHRrZXl3b3JkOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5rZXl3b3JkKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuXHR9LFxuXG5cdHJnYk51bWJlcjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAodGhpcy52YWx1ZXMucmdiWzBdIDw8IDE2KSB8ICh0aGlzLnZhbHVlcy5yZ2JbMV0gPDwgOCkgfCB0aGlzLnZhbHVlcy5yZ2JbMl07XG5cdH0sXG5cblx0bHVtaW5vc2l0eTogZnVuY3Rpb24gKCkge1xuXHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1dDQUcyMC8jcmVsYXRpdmVsdW1pbmFuY2VkZWZcblx0XHR2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiO1xuXHRcdHZhciBsdW0gPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGNoYW4gPSByZ2JbaV0gLyAyNTU7XG5cdFx0XHRsdW1baV0gPSAoY2hhbiA8PSAwLjAzOTI4KSA/IGNoYW4gLyAxMi45MiA6IE1hdGgucG93KCgoY2hhbiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KTtcblx0XHR9XG5cdFx0cmV0dXJuIDAuMjEyNiAqIGx1bVswXSArIDAuNzE1MiAqIGx1bVsxXSArIDAuMDcyMiAqIGx1bVsyXTtcblx0fSxcblxuXHRjb250cmFzdDogZnVuY3Rpb24gKGNvbG9yMikge1xuXHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1dDQUcyMC8jY29udHJhc3QtcmF0aW9kZWZcblx0XHR2YXIgbHVtMSA9IHRoaXMubHVtaW5vc2l0eSgpO1xuXHRcdHZhciBsdW0yID0gY29sb3IyLmx1bWlub3NpdHkoKTtcblx0XHRpZiAobHVtMSA+IGx1bTIpIHtcblx0XHRcdHJldHVybiAobHVtMSArIDAuMDUpIC8gKGx1bTIgKyAwLjA1KTtcblx0XHR9XG5cdFx0cmV0dXJuIChsdW0yICsgMC4wNSkgLyAobHVtMSArIDAuMDUpO1xuXHR9LFxuXG5cdGxldmVsOiBmdW5jdGlvbiAoY29sb3IyKSB7XG5cdFx0dmFyIGNvbnRyYXN0UmF0aW8gPSB0aGlzLmNvbnRyYXN0KGNvbG9yMik7XG5cdFx0aWYgKGNvbnRyYXN0UmF0aW8gPj0gNy4xKSB7XG5cdFx0XHRyZXR1cm4gJ0FBQSc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChjb250cmFzdFJhdGlvID49IDQuNSkgPyAnQUEnIDogJyc7XG5cdH0sXG5cblx0ZGFyazogZnVuY3Rpb24gKCkge1xuXHRcdC8vIFlJUSBlcXVhdGlvbiBmcm9tIGh0dHA6Ly8yNHdheXMub3JnLzIwMTAvY2FsY3VsYXRpbmctY29sb3ItY29udHJhc3Rcblx0XHR2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiO1xuXHRcdHZhciB5aXEgPSAocmdiWzBdICogMjk5ICsgcmdiWzFdICogNTg3ICsgcmdiWzJdICogMTE0KSAvIDEwMDA7XG5cdFx0cmV0dXJuIHlpcSA8IDEyODtcblx0fSxcblxuXHRsaWdodDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAhdGhpcy5kYXJrKCk7XG5cdH0sXG5cblx0bmVnYXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHJnYiA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSAyNTUgLSB0aGlzLnZhbHVlcy5yZ2JbaV07XG5cdFx0fVxuXHRcdHRoaXMuc2V0VmFsdWVzKCdyZ2InLCByZ2IpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGxpZ2h0ZW46IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMudmFsdWVzLmhzbFsyXSArPSB0aGlzLnZhbHVlcy5oc2xbMl0gKiByYXRpbztcblx0XHR0aGlzLnNldFZhbHVlcygnaHNsJywgdGhpcy52YWx1ZXMuaHNsKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRkYXJrZW46IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMudmFsdWVzLmhzbFsyXSAtPSB0aGlzLnZhbHVlcy5oc2xbMl0gKiByYXRpbztcblx0XHR0aGlzLnNldFZhbHVlcygnaHNsJywgdGhpcy52YWx1ZXMuaHNsKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRzYXR1cmF0ZTogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy52YWx1ZXMuaHNsWzFdICs9IHRoaXMudmFsdWVzLmhzbFsxXSAqIHJhdGlvO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdoc2wnLCB0aGlzLnZhbHVlcy5oc2wpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGRlc2F0dXJhdGU6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMudmFsdWVzLmhzbFsxXSAtPSB0aGlzLnZhbHVlcy5oc2xbMV0gKiByYXRpbztcblx0XHR0aGlzLnNldFZhbHVlcygnaHNsJywgdGhpcy52YWx1ZXMuaHNsKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR3aGl0ZW46IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMudmFsdWVzLmh3YlsxXSArPSB0aGlzLnZhbHVlcy5od2JbMV0gKiByYXRpbztcblx0XHR0aGlzLnNldFZhbHVlcygnaHdiJywgdGhpcy52YWx1ZXMuaHdiKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRibGFja2VuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnZhbHVlcy5od2JbMl0gKz0gdGhpcy52YWx1ZXMuaHdiWzJdICogcmF0aW87XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2h3YicsIHRoaXMudmFsdWVzLmh3Yik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Z3JleXNjYWxlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYjtcblx0XHQvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYXlzY2FsZSNDb252ZXJ0aW5nX2NvbG9yX3RvX2dyYXlzY2FsZVxuXHRcdHZhciB2YWwgPSByZ2JbMF0gKiAwLjMgKyByZ2JbMV0gKiAwLjU5ICsgcmdiWzJdICogMC4xMTtcblx0XHR0aGlzLnNldFZhbHVlcygncmdiJywgW3ZhbCwgdmFsLCB2YWxdKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRjbGVhcmVyOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnNldFZhbHVlcygnYWxwaGEnLCB0aGlzLnZhbHVlcy5hbHBoYSAtICh0aGlzLnZhbHVlcy5hbHBoYSAqIHJhdGlvKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0b3BhcXVlcjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2FscGhhJywgdGhpcy52YWx1ZXMuYWxwaGEgKyAodGhpcy52YWx1ZXMuYWxwaGEgKiByYXRpbykpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHJvdGF0ZTogZnVuY3Rpb24gKGRlZ3JlZXMpIHtcblx0XHR2YXIgaHVlID0gdGhpcy52YWx1ZXMuaHNsWzBdO1xuXHRcdGh1ZSA9IChodWUgKyBkZWdyZWVzKSAlIDM2MDtcblx0XHRodWUgPSBodWUgPCAwID8gMzYwICsgaHVlIDogaHVlO1xuXHRcdHRoaXMudmFsdWVzLmhzbFswXSA9IGh1ZTtcblx0XHR0aGlzLnNldFZhbHVlcygnaHNsJywgdGhpcy52YWx1ZXMuaHNsKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogUG9ydGVkIGZyb20gc2FzcyBpbXBsZW1lbnRhdGlvbiBpbiBDXG5cdCAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zYXNzL2xpYnNhc3MvYmxvYi8wZTZiNGEyODUwMDkyMzU2YWEzZWNlMDdjNmIyNDlmMDIyMWNhY2VkL2Z1bmN0aW9ucy5jcHAjTDIwOVxuXHQgKi9cblx0bWl4OiBmdW5jdGlvbiAobWl4aW5Db2xvciwgd2VpZ2h0KSB7XG5cdFx0dmFyIGNvbG9yMSA9IHRoaXM7XG5cdFx0dmFyIGNvbG9yMiA9IG1peGluQ29sb3I7XG5cdFx0dmFyIHAgPSB3ZWlnaHQgPT09IHVuZGVmaW5lZCA/IDAuNSA6IHdlaWdodDtcblxuXHRcdHZhciB3ID0gMiAqIHAgLSAxO1xuXHRcdHZhciBhID0gY29sb3IxLmFscGhhKCkgLSBjb2xvcjIuYWxwaGEoKTtcblxuXHRcdHZhciB3MSA9ICgoKHcgKiBhID09PSAtMSkgPyB3IDogKHcgKyBhKSAvICgxICsgdyAqIGEpKSArIDEpIC8gMi4wO1xuXHRcdHZhciB3MiA9IDEgLSB3MTtcblxuXHRcdHJldHVybiB0aGlzXG5cdFx0XHQucmdiKFxuXHRcdFx0XHR3MSAqIGNvbG9yMS5yZWQoKSArIHcyICogY29sb3IyLnJlZCgpLFxuXHRcdFx0XHR3MSAqIGNvbG9yMS5ncmVlbigpICsgdzIgKiBjb2xvcjIuZ3JlZW4oKSxcblx0XHRcdFx0dzEgKiBjb2xvcjEuYmx1ZSgpICsgdzIgKiBjb2xvcjIuYmx1ZSgpXG5cdFx0XHQpXG5cdFx0XHQuYWxwaGEoY29sb3IxLmFscGhhKCkgKiBwICsgY29sb3IyLmFscGhhKCkgKiAoMSAtIHApKTtcblx0fSxcblxuXHR0b0pTT046IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5yZ2IoKTtcblx0fSxcblxuXHRjbG9uZTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgQ29sb3IodGhpcy5yZ2IoKSk7XG5cdH1cbn07XG5cbkNvbG9yLnByb3RvdHlwZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbiAoc3BhY2UpIHtcblx0dmFyIHZhbHMgPSB7fTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFsc1tzcGFjZS5jaGFyQXQoaSldID0gdGhpcy52YWx1ZXNbc3BhY2VdW2ldO1xuXHR9XG5cblx0aWYgKHRoaXMudmFsdWVzLmFscGhhICE9PSAxKSB7XG5cdFx0dmFscy5hID0gdGhpcy52YWx1ZXMuYWxwaGE7XG5cdH1cblxuXHQvLyB7cjogMjU1LCBnOiAyNTUsIGI6IDI1NSwgYTogMC40fVxuXHRyZXR1cm4gdmFscztcbn07XG5cbkNvbG9yLnByb3RvdHlwZS5zZXRWYWx1ZXMgPSBmdW5jdGlvbiAoc3BhY2UsIHZhbHMpIHtcblx0dmFyIHNwYWNlcyA9IHtcblx0XHRyZ2I6IFsncmVkJywgJ2dyZWVuJywgJ2JsdWUnXSxcblx0XHRoc2w6IFsnaHVlJywgJ3NhdHVyYXRpb24nLCAnbGlnaHRuZXNzJ10sXG5cdFx0aHN2OiBbJ2h1ZScsICdzYXR1cmF0aW9uJywgJ3ZhbHVlJ10sXG5cdFx0aHdiOiBbJ2h1ZScsICd3aGl0ZW5lc3MnLCAnYmxhY2tuZXNzJ10sXG5cdFx0Y215azogWydjeWFuJywgJ21hZ2VudGEnLCAneWVsbG93JywgJ2JsYWNrJ11cblx0fTtcblxuXHR2YXIgbWF4ZXMgPSB7XG5cdFx0cmdiOiBbMjU1LCAyNTUsIDI1NV0sXG5cdFx0aHNsOiBbMzYwLCAxMDAsIDEwMF0sXG5cdFx0aHN2OiBbMzYwLCAxMDAsIDEwMF0sXG5cdFx0aHdiOiBbMzYwLCAxMDAsIDEwMF0sXG5cdFx0Y215azogWzEwMCwgMTAwLCAxMDAsIDEwMF1cblx0fTtcblxuXHR2YXIgaTtcblx0dmFyIGFscGhhID0gMTtcblx0aWYgKHNwYWNlID09PSAnYWxwaGEnKSB7XG5cdFx0YWxwaGEgPSB2YWxzO1xuXHR9IGVsc2UgaWYgKHZhbHMubGVuZ3RoKSB7XG5cdFx0Ly8gWzEwLCAxMCwgMTBdXG5cdFx0dGhpcy52YWx1ZXNbc3BhY2VdID0gdmFscy5zbGljZSgwLCBzcGFjZS5sZW5ndGgpO1xuXHRcdGFscGhhID0gdmFsc1tzcGFjZS5sZW5ndGhdO1xuXHR9IGVsc2UgaWYgKHZhbHNbc3BhY2UuY2hhckF0KDApXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8ge3I6IDEwLCBnOiAxMCwgYjogMTB9XG5cdFx0Zm9yIChpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnZhbHVlc1tzcGFjZV1baV0gPSB2YWxzW3NwYWNlLmNoYXJBdChpKV07XG5cdFx0fVxuXG5cdFx0YWxwaGEgPSB2YWxzLmE7XG5cdH0gZWxzZSBpZiAodmFsc1tzcGFjZXNbc3BhY2VdWzBdXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8ge3JlZDogMTAsIGdyZWVuOiAxMCwgYmx1ZTogMTB9XG5cdFx0dmFyIGNoYW5zID0gc3BhY2VzW3NwYWNlXTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy52YWx1ZXNbc3BhY2VdW2ldID0gdmFsc1tjaGFuc1tpXV07XG5cdFx0fVxuXG5cdFx0YWxwaGEgPSB2YWxzLmFscGhhO1xuXHR9XG5cblx0dGhpcy52YWx1ZXMuYWxwaGEgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCAoYWxwaGEgPT09IHVuZGVmaW5lZCA/IHRoaXMudmFsdWVzLmFscGhhIDogYWxwaGEpKSk7XG5cblx0aWYgKHNwYWNlID09PSAnYWxwaGEnKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGNhcHBlZDtcblxuXHQvLyBjYXAgdmFsdWVzIG9mIHRoZSBzcGFjZSBwcmlvciBjb252ZXJ0aW5nIGFsbCB2YWx1ZXNcblx0Zm9yIChpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2FwcGVkID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4ZXNbc3BhY2VdW2ldLCB0aGlzLnZhbHVlc1tzcGFjZV1baV0pKTtcblx0XHR0aGlzLnZhbHVlc1tzcGFjZV1baV0gPSBNYXRoLnJvdW5kKGNhcHBlZCk7XG5cdH1cblxuXHQvLyBjb252ZXJ0IHRvIGFsbCB0aGUgb3RoZXIgY29sb3Igc3BhY2VzXG5cdGZvciAodmFyIHNuYW1lIGluIHNwYWNlcykge1xuXHRcdGlmIChzbmFtZSAhPT0gc3BhY2UpIHtcblx0XHRcdHRoaXMudmFsdWVzW3NuYW1lXSA9IGNvbnZlcnRbc3BhY2VdW3NuYW1lXSh0aGlzLnZhbHVlc1tzcGFjZV0pO1xuXHRcdH1cblxuXHRcdC8vIGNhcCB2YWx1ZXNcblx0XHRmb3IgKGkgPSAwOyBpIDwgc25hbWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNhcHBlZCA9IE1hdGgubWF4KDAsIE1hdGgubWluKG1heGVzW3NuYW1lXVtpXSwgdGhpcy52YWx1ZXNbc25hbWVdW2ldKSk7XG5cdFx0XHR0aGlzLnZhbHVlc1tzbmFtZV1baV0gPSBNYXRoLnJvdW5kKGNhcHBlZCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59O1xuXG5Db2xvci5wcm90b3R5cGUuc2V0U3BhY2UgPSBmdW5jdGlvbiAoc3BhY2UsIGFyZ3MpIHtcblx0dmFyIHZhbHMgPSBhcmdzWzBdO1xuXG5cdGlmICh2YWxzID09PSB1bmRlZmluZWQpIHtcblx0XHQvLyBjb2xvci5yZ2IoKVxuXHRcdHJldHVybiB0aGlzLmdldFZhbHVlcyhzcGFjZSk7XG5cdH1cblxuXHQvLyBjb2xvci5yZ2IoMTAsIDEwLCAxMClcblx0aWYgKHR5cGVvZiB2YWxzID09PSAnbnVtYmVyJykge1xuXHRcdHZhbHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKTtcblx0fVxuXG5cdHRoaXMuc2V0VmFsdWVzKHNwYWNlLCB2YWxzKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Db2xvci5wcm90b3R5cGUuc2V0Q2hhbm5lbCA9IGZ1bmN0aW9uIChzcGFjZSwgaW5kZXgsIHZhbCkge1xuXHRpZiAodmFsID09PSB1bmRlZmluZWQpIHtcblx0XHQvLyBjb2xvci5yZWQoKVxuXHRcdHJldHVybiB0aGlzLnZhbHVlc1tzcGFjZV1baW5kZXhdO1xuXHR9IGVsc2UgaWYgKHZhbCA9PT0gdGhpcy52YWx1ZXNbc3BhY2VdW2luZGV4XSkge1xuXHRcdC8vIGNvbG9yLnJlZChjb2xvci5yZWQoKSlcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8vIGNvbG9yLnJlZCgxMDApXG5cdHRoaXMudmFsdWVzW3NwYWNlXVtpbmRleF0gPSB2YWw7XG5cdHRoaXMuc2V0VmFsdWVzKHNwYWNlLCB0aGlzLnZhbHVlc1tzcGFjZV0pO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xvcjtcbiIsIi8qKlxuICogRGVwdGggc3BhY2UgY29vcmRpbmF0ZXNcbiAqIEBzZWUgaHR0cHM6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9kbjc4NTUzMC5hc3B4XG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLkJPVU5EX1dJRFRIID0gNTEyXG5leHBvcnRzLkJPVU5EX0hFSUdIVCA9IDQyNFxuXG4iLCIvKipcbiAqIEtpbm5lY3QgaGFuZCBzdGF0dXNcbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuVU5LTk9XTiA9IDBcbmV4cG9ydHMuTk9UX1RSQUNLRUQgPSAxXG5leHBvcnRzLk9QRU4gPSAyXG5leHBvcnRzLkNMT1NFRCA9IDNcbmV4cG9ydHMuTEFTU08gPSA0XG4iLCIvKipcbiAqIENvbnN0YW5zIG9mIGtpbmVjdFxuICogQG1vZHVsZSBzZy1raW5lY3QtY29uc3RhbnRzXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmxldCBkID0gKG1vZHVsZSkgPT4gbW9kdWxlLmRlZmF1bHQgfHwgbW9kdWxlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgZGVwdGhTcGFjZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vZGVwdGhfc3BhY2UnKSkgfSxcbiAgZ2V0IGhhbmRTdGF0ZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vaGFuZF9zdGF0ZScpKSB9LFxuICBnZXQgam9pbnRUeXBlcyAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vam9pbnRfdHlwZXMnKSkgfVxufVxuIiwiLyoqXG4gKiBKb2ludCB0eXBlcyBvZiBraW5uZWN0MlxuICogQHNlZSBodHRwczovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21pY3Jvc29mdC5raW5lY3Quam9pbnR0eXBlLmFzcHhcbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuU1BJTkVfQkFTRSA9IDBcbmV4cG9ydHMuU1BJTkVfTUlEID0gMVxuZXhwb3J0cy5ORUNLID0gMlxuZXhwb3J0cy5IRUFEID0gM1xuZXhwb3J0cy5TSE9VTERFUl9MRUZUID0gNFxuZXhwb3J0cy5FTEJPV19MRUZUID0gNVxuZXhwb3J0cy5XUklTVF9MRUZUID0gNlxuZXhwb3J0cy5IQU5EX0xFRlQgPSA3XG5leHBvcnRzLlNIT1VMREVSX1JJR0hUID0gOFxuZXhwb3J0cy5FTEJPV19SSUdIVCA9IDlcbmV4cG9ydHMuV1JJU1RfUklHSFQgPSAxMFxuZXhwb3J0cy5IQU5EX1JJR0hUID0gMTFcbmV4cG9ydHMuSElQX0xFRlQgPSAxMlxuZXhwb3J0cy5LTkVFX0xFRlQgPSAxM1xuZXhwb3J0cy5BTktMRV9MRUZUID0gMTRcbmV4cG9ydHMuRk9PVF9MRUZUID0gMTVcbmV4cG9ydHMuSElQX1JJR0hUID0gMTZcbmV4cG9ydHMuS05FRV9SSUdIVCA9IDE3XG5leHBvcnRzLkFOS0xFX1JJR0hUID0gMThcbmV4cG9ydHMuRk9PVF9SSUdIVCA9IDE5XG5leHBvcnRzLlNQSU5FX1NIT1VMREVSID0gMjBcbmV4cG9ydHMuSEFORF9USVBfTEVGVCA9IDIxXG5leHBvcnRzLlRIVU1CX0xFRlQgPSAyMlxuZXhwb3J0cy5IQU5EX1RJUF9SSUdIVCA9IDIzXG5leHBvcnRzLlRIVU1CX1JJR0hUID0gMjRcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oZXhwb3J0cywge1xuICBNSUNST1BIT05FX1RSQU5TSVRJT046IDgwMFxufSlcbiIsIi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIGZvciBjb2xvcnNcbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGFwZW1hbmNvbG9yID0gcmVxdWlyZSgnYXBlbWFuY29sb3InKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oZXhwb3J0cywge1xuICAvKipcbiAgICogQ3JlYXRlIGEgcmFuZG9tIGNvbG9yIGZyb20gYmFzZSBjb2xvci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2UgLSBCYXNlIGNvbG9yIHN0cmluZ1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbmFsIHNldHRpbmdzXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gR2VuZXJhdGVkIGNvbG9yXG4gICAqL1xuICByYW5kb21Db2xvciAoYmFzZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGFtb3VudCA9IHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAzNjAuMClcbiAgICByZXR1cm4gYXBlbWFuY29sb3Iucm90YXRlKGJhc2UsIGFtb3VudClcbiAgfSxcblxuICAvKipcbiAgICogRGVmaW5lIGEgY29sb3JpemVyIHRvIGdlbmVyYXRlIHVuaXF1ZSBjb2xvcnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2UgLSBCYXNlIGNvbG9yIHN0cmluZ1xuICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IC0gR2VuZXJhdGVkIGZ1bmN0aW9uXG4gICAqL1xuICB1bmlxdWVDb2xvcml6ZXIgKGJhc2UpIHtcbiAgICBsZXQgY29sb3JzID0ge31cblxuICAgIC8qKlxuICAgICAqIENvbG9yaXplciBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFVuaXF1ZSBpZGVudGlmaWVyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY29sb3IgLSBDb2xvciBmb3IgdGhlIGlkXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29sb3JpemVyIChpZCkge1xuICAgICAgbGV0IGNvbG9yID0gY29sb3JzWyBpZCBdXG4gICAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIGNvbG9yXG4gICAgICB9XG4gICAgICBjb2xvciA9IGV4cG9ydHMucmFuZG9tQ29sb3IoYmFzZSlcbiAgICAgIGNvbG9yc1sgaWQgXSA9IGNvbG9yXG4gICAgICByZXR1cm4gY29sb3JcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKGNvbG9yaXplciwgeyBiYXNlLCBjb2xvcnMgfSlcbiAgICByZXR1cm4gY29sb3JpemVyXG4gIH1cbn0pXG4iLCIvKipcbiAqIEhlbHBlciBmdW5jdGlvbnMgZm9yIGRyYXdpbmdcbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbihleHBvcnRzLCB7XG4gIC8qKlxuICAgKiBEcmF3IGEgY2lyY2xlXG4gICAqIEBwYXJhbSBjdHhcbiAgICogQHBhcmFtIHtQb2ludH0gcG9pbnRcbiAgICogQHBhcmFtIHJhZGl1c1xuICAgKi9cbiAgZHJhd0NpcmNsZSAoY3R4LCBwb2ludCwgcmFkaXVzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4LmFyYyhwb2ludC54LCBwb2ludC55LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKVxuICAgIGN0eC5maWxsKClcbiAgICBjdHguY2xvc2VQYXRoKClcbiAgfSxcblxuICAvKipcbiAgICogRHJhdyBhIGxpbmVcbiAgICogQHBhcmFtIGN0eFxuICAgKiBAcGFyYW0gey4uLlBvaW50fSBwb2ludHNcbiAgICovXG4gIGRyYXdMaW5lIChjdHgsIC4uLnBvaW50cykge1xuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgbGV0IGZyb20gPSBwb2ludHNbIGkgXVxuICAgICAgbGV0IHRvID0gcG9pbnRzWyBpICsgMSBdXG4gICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICBjdHgubW92ZVRvKGZyb20ueCwgZnJvbS55KVxuICAgICAgfVxuICAgICAgY3R4LmxpbmVUbyh0by54LCB0by55KVxuICAgIH1cbiAgICBjdHguc3Ryb2tlKClcbiAgICBjdHguY2xvc2VQYXRoKClcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gUG9pbnRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB4XG4gKiBAcHJvcGVydHkge251bWJlcn0geVxuICovXG4iLCIvKipcbiAqIFJlYWN0IGNvbXBvbmVudHMgZm9yIFNVR09TIHByb2plY3QuXG4gKiBAbW9kdWxlIHNnLXJlYWN0LWNvbXBvbmVudHNcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxubGV0IGQgPSAobW9kdWxlKSA9PiBtb2R1bGUuZGVmYXVsdCB8fCBtb2R1bGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBTZ0FsYnVtICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19hbGJ1bScpKSB9LFxuICBnZXQgU2dCb2R5ICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19ib2R5JykpIH0sXG4gIGdldCBTZ0J1dHRvbiAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfYnV0dG9uJykpIH0sXG4gIGdldCBTZ0hlYWQgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX2hlYWQnKSkgfSxcbiAgZ2V0IFNnSGVhZGVyICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19oZWFkZXInKSkgfSxcbiAgZ2V0IFNnSHRtbCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfaHRtbCcpKSB9LFxuICBnZXQgU2dLaW5lY3RGcmFtZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfa2luZWN0X2ZyYW1lJykpIH0sXG4gIGdldCBTZ01haW4gKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX21haW4nKSkgfSxcbiAgZ2V0IFNnTWljcm9waG9uZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfbWljcm9waG9uZScpKSB9LFxuICBnZXQgU2dQYWdlICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19wYWdlJykpIH0sXG4gIGdldCBTZ1N3aXRjaCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfc3dpdGNoJykpIH0sXG4gIGdldCBTZ1RoZW1lU3R5bGUgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX3RoZW1lX3N0eWxlJykpIH0sXG4gIGdldCBTZ1ZpZGVvICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ192aWRlbycpKSB9XG59XG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuaW1wb3J0IHtBcE5leHRCdXR0b24sIEFwUHJldkJ1dHRvbn0gZnJvbSAnYXBlbWFuLXJlYWN0LWJ1dHRvbidcblxuLyoqIEBsZW5kcyBTZ0FsYnVtICovXG5jb25zdCBTZ0FsYnVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIC8qKlxuICAgICAqIFdpZHRoKHB4KSBvZiBhIGltYWdlLlxuICAgICAqL1xuICAgIHdpZHRoOiB0eXBlcy5udW1iZXIsXG4gICAgLyoqXG4gICAgICogTGlzdCBvZiBpbWFnZSBzcmMuXG4gICAgICovXG4gICAgaW1hZ2VMaXN0OiB0eXBlcy5hcnJheSxcbiAgICAvKipcbiAgICAgKiBOdW1iZXIgb2YgaW1hZ2VzIHBlciAxIHJvdyBpbiB0aGUgdGh1bWJuYWlsLlxuICAgICAqL1xuICAgIHRodW1ibmFpbENvbDogdHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIEJvcmRlciBjb2xvciBvZiBzZWxlY3RlZCBpbWFnZSBpbiB0aGUgdGh1bWJuYWlsLlxuICAgICAqL1xuICAgIHRodW1ibmFpbFNlbGVjdGVkQ29sb3I6IHR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiB1cGRhdGUuIEFyZ3VtZW50IGlzIGluZGV4IG9mIGltYWdlTGlzdC5cbiAgICAgKi9cbiAgICBvbkNoYW5nZTogdHlwZXMuZnVuY1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGltYWdlTGlzdDogW10sXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgdGh1bWJuYWlsQ29sOiA0LFxuICAgICAgdGh1bWJuYWlsU2VsZWN0ZWRDb2xvcjogJ3llbGxvdydcbiAgICB9XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbnRoOiAxXG4gICAgfVxuICB9LFxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcywgc3RhdGUgfSA9IHNcbiAgICBsZXQgeyBpbWFnZUxpc3QgfSA9IHByb3BzXG4gICAgbGV0IHN0eWxlID0gcy5nZXRTdHlsZSgpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1hbGJ1bScsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICA8c3R5bGUgY2xhc3NOYW1lPSdzZy1hbGJ1bS1zdHlsZScgdHlwZT0ndGV4dC9jc3MnPlxuICAgICAgICAgIHsgc3R5bGUgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2ctYWxidW0tY29udGFpbmVyJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2ctYWxidW0taGVhZGVyJz5cbiAgICAgICAgICAgIDxBcFByZXZCdXR0b24gb25UYXA9eyBzLnRvTGVmdCB9IC8+XG4gICAgICAgICAgICA8QXBOZXh0QnV0dG9uIG9uVGFwPXsgcy50b1JpZ2h0IH0gLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nc2ctYWxidW0tbnRoJz4geyBzdGF0ZS5udGggfSAvIHsgaW1hZ2VMaXN0Lmxlbmd0aCB9IDwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2ctYWxidW0tZGlzcGxheSc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2ctYWxidW0tZnVsbC1pbWcnPlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGltYWdlTGlzdC5tYXAoKGltYWdlLCBpKSA9PlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT0nc2ctYWxidW0taW1nJyBzcmM9eyBpbWFnZSB9IGtleT17IGkgfSAvPlxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZy1hbGJ1bS10aHVtYm5haWwnPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NnLWFsYnVtLXRodW1ibmFpbC1zZWxlY3RlZCcvPlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpbWFnZUxpc3QubWFwKChpbWFnZSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIOmFjeWIl+OBruWJjeaWueOBi+OCieeUu+WDj+OCkuaMv+WFpeOBl+OBpuOCguOAgeWQhOeUu+WDj+OBq+WvvuOBmeOCi2tleeOCkuS4jeWkieOBq+OBmeOCi+OAgueUu+WDj+ODh+ODvOOCv+OCkmtleeOBq+OBmeOCi+OBqOWQjOOBmOeUu+WDj+OCkuaMv+WFpeOBmeOCi+OBqOOCqOODqeODvOOBq+OBquOCi1xuICAgICAgICAgICAgICAgIGxldCBrZXkgPSBpbWFnZUxpc3QubGVuZ3RoIC0gaVxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2ctYWxidW0tdGh1bWJuYWlsLWltZy1lZmZlY3QnIGtleT17IGtleSB9IGRhdGE9eyBpIH0gb25DbGljaz17IHRoaXMubW92ZVRvIH0+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPSdzZy1hbGJ1bS10aHVtYm5haWwtaW1nJyBzcmM9eyBpbWFnZSB9IGtleT17IGtleSB9Lz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyAobmV4dFByb3BzKSB7XG4gICAgLy8g5paw44GX44GE55S75YOP44GM44K344OV44OI44GV44KM44Gf44KJ6Zay6Kan5L2N572u44KS5oi744GZXG4gICAgaWYgKHRoaXMucHJvcHMuaW1hZ2VMaXN0Lmxlbmd0aCA8IG5leHRQcm9wcy5pbWFnZUxpc3QubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0SW5pdGlhbFN0YXRlKCkpXG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUgKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgLy8g6Kaq44Kz44Oz44Od44O844ON44Oz44OI44GL44KJ44GT44Gu44Kz44Oz44Od44O844ON44Oz44OI44Gu54q25oWL44KS5Y+W5b6X44GZ44KL44Gu44Gr5L2/44GI44KLXG4gICAgbGV0IG9uQ2hhbmdlID0gdGhpcy5wcm9wcy5vbkNoYW5nZVxuICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgb25DaGFuZ2UobmV4dFN0YXRlLm50aCAtIDEpXG4gICAgfVxuICB9LFxuXG4gIGdldFN0eWxlICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzLCBzdGF0ZSB9ID0gc1xuICAgIGxldCB7IGltYWdlTGlzdCwgd2lkdGgsIHRodW1ibmFpbENvbCwgdGh1bWJuYWlsU2VsZWN0ZWRDb2xvciB9ID0gcHJvcHNcbiAgICBsZXQgZGlzcGxheVJpZ2h0ID0gKHN0YXRlLm50aCAtIDEpICogd2lkdGhcbiAgICBsZXQgdGh1bWJuYWlsV2lkdGggPSB3aWR0aCAvIHRodW1ibmFpbENvbFxuICAgIGxldCB0aHVtYm5haWxIZWlnaHQgPSB0aHVtYm5haWxXaWR0aCAqIDMgLyA0XG4gICAgbGV0IHRodW1ibmFpbExlZnQgPSB0aHVtYm5haWxXaWR0aCAqICgoc3RhdGUubnRoIC0gMSkgJSB0aHVtYm5haWxDb2wpXG4gICAgbGV0IHRodW1ibmFpbFRvcCA9IHRodW1ibmFpbEhlaWdodCAqIE1hdGguZmxvb3IoKHN0YXRlLm50aCAtIDEpIC8gdGh1bWJuYWlsQ29sKVxuICAgIHJldHVybiBgXG4uc2ctYWxidW0tY29udGFpbmVyIHtcbiAgd2lkdGg6ICR7d2lkdGh9cHg7XG4gIG1hcmdpbjogNXB4O1xufVxuLnNnLWFsYnVtLWRpc3BsYXkge1xuICB3aWR0aDogJHt3aWR0aH1weDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkICM2NjY7XG59XG4uc2ctYWxidW0tZnVsbC1pbWcge1xuICB3aWR0aDogJHt3aWR0aCAqIGltYWdlTGlzdC5sZW5ndGh9cHg7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgcmlnaHQ6ICR7ZGlzcGxheVJpZ2h0fXB4O1xuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xufVxuLnNnLWFsYnVtLWltZyB7XG4gIHdpZHRoOiAke3dpZHRofXB4O1xufVxuLnNnLWFsYnVtLWhlYWRlciB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuLnNnLWFsYnVtLW50aCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgcmlnaHQ6IDA7XG4gIHRvcDogMTBweDtcbn1cbi5zZy1hbGJ1bS10aHVtYm5haWwge1xuICB3aWR0aDogJHt3aWR0aH1weDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuLnNnLWFsYnVtLXRodW1ibmFpbC1pbWctZWZmZWN0IHtcbiAgei1pbmRleDogMTtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdpZHRoOiAke3RodW1ibmFpbFdpZHRofXB4O1xufVxuLnNnLWFsYnVtLXRodW1ibmFpbC1pbWctZWZmZWN0OmhvdmVyOmJlZm9yZSB7XG4gIGNvbnRlbnQ6IFwiXCI7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB6LWluZGV4OiAzO1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6ICR7dGh1bWJuYWlsV2lkdGh9cHg7XG4gIGhlaWdodDogJHt0aHVtYm5haWxIZWlnaHR9cHg7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xufVxuLnNnLWFsYnVtLXRodW1ibmFpbC1pbWctZWZmZWN0OmFjdGl2ZTpiZWZvcmUge1xuICBjb250ZW50OiBcIlwiO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogMztcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiAke3RodW1ibmFpbFdpZHRofXB4O1xuICBoZWlnaHQ6ICR7dGh1bWJuYWlsSGVpZ2h0fXB4O1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKTtcbn1cbi5zZy1hbGJ1bS10aHVtYm5haWwtaW1nIHtcbiAgd2lkdGg6ICR7dGh1bWJuYWlsV2lkdGh9cHg7XG59XG4uc2ctYWxidW0tdGh1bWJuYWlsLXNlbGVjdGVkIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHotaW5kZXg6IDI7XG4gIHdpZHRoOiAke3RodW1ibmFpbFdpZHRofXB4O1xuICBoZWlnaHQ6ICR7dGh1bWJuYWlsSGVpZ2h0fXB4O1xuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBib3JkZXI6IDJweCBzb2xpZCAke3RodW1ibmFpbFNlbGVjdGVkQ29sb3J9O1xuICBsZWZ0OiAke3RodW1ibmFpbExlZnR9cHg7XG4gIHRvcDogJHt0aHVtYm5haWxUb3B9cHg7XG59XG5gXG4gIH0sXG5cbiAgdG9SaWdodCAoKSB7XG4gICAgbGV0IHsgcHJvcHMsIHN0YXRlIH0gPSB0aGlzXG4gICAgbGV0IG50aCA9IHN0YXRlLm50aCAlIHByb3BzLmltYWdlTGlzdC5sZW5ndGggKyAxXG4gICAgdGhpcy5zZXRTdGF0ZSh7IG50aCB9KVxuICB9LFxuXG4gIHRvTGVmdCAoKSB7XG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSB0aGlzXG4gICAgbGV0IG50aCA9IChzdGF0ZS5udGggKyBwcm9wcy5pbWFnZUxpc3QubGVuZ3RoIC0gMikgJSBwcm9wcy5pbWFnZUxpc3QubGVuZ3RoICsgMVxuICAgIHRoaXMuc2V0U3RhdGUoeyBudGggfSlcbiAgfSxcblxuICBtb3ZlVG8gKGUpIHtcbiAgICBsZXQgbnRoID0gTnVtYmVyKGUudGFyZ2V0LmF0dHJpYnV0ZXMuZGF0YS52YWx1ZSkgKyAxXG4gICAgdGhpcy5zZXRTdGF0ZSh7IG50aCB9KVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ0FsYnVtXG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQge0FwQm9keX0gZnJvbSAnYXBlbWFuLXJlYWN0LWJhc2ljJ1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuLyoqIEBsZW5kcyBTZ0JvZHkgKi9cbmNvbnN0IFNnQm9keSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcblxuICAgIHJldHVybiAoXG4gICAgICA8QXBCb2R5IHsgLi4ucHJvcHMgfVxuICAgICAgICBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1ib2R5JywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9BcEJvZHk+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnQm9keVxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtBcEJ1dHRvbn0gZnJvbSAnYXBlbWFuLXJlYWN0LWJ1dHRvbidcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbi8qKiBAbGVuZHMgU2dCdXR0b24gKi9cbmNvbnN0IFNnQnV0dG9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxBcEJ1dHRvbiB7IC4uLnByb3BzIH1cbiAgICAgICAgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctYnV0dG9uJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9BcEJ1dHRvbj5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dCdXR0b25cbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5pbXBvcnQge0FwSGVhZH0gZnJvbSAnYXBlbWFuLXJlYWN0LWJhc2ljJ1xuXG4vKiogQGxlbmRzIFNnSGVhZCAqL1xuY29uc3QgU2dIZWFkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxBcEhlYWQgeyAuLi5wcm9wcyB9XG4gICAgICAgIGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLWhlYWQnLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L0FwSGVhZD5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dIZWFkXG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG4vKiogQGxlbmRzIFNnSGVhZGVyICovXG5jb25zdCBTZ0hlYWRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLWhlYWRlcicsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ0hlYWRlclxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcbmltcG9ydCB7QXBIdG1sfSBmcm9tICdhcGVtYW4tcmVhY3QtYmFzaWMnXG5cbi8qKiBAbGVuZHMgU2dIdG1sICovXG5jb25zdCBTZ0h0bWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEFwSHRtbCBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1odG1sJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9BcEh0bWw+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnSHRtbFxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnS2luZWN0RnJhbWVcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5pbXBvcnQgYXBlbWFuY29sb3IgZnJvbSAnYXBlbWFuY29sb3InXG5pbXBvcnQge2RlcHRoU3BhY2UsIGpvaW50VHlwZXN9IGZyb20gJ3NnLWtpbmVjdC1jb25zdGFudHMnXG5pbXBvcnQgKiBhcyBkcmF3SGVscGVyIGZyb20gJy4vaGVscGVycy9kcmF3X2hlbHBlcidcbmltcG9ydCAqIGFzIGNvbG9ySGVscGVyIGZyb20gJy4vaGVscGVycy9jb2xvcl9oZWxwZXInXG5cbi8qKiBAbGVuZHMgU2dLaW5lY3RGcmFtZSAqL1xuY29uc3QgU2dLaW5lY3RGcmFtZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHByb3BUeXBlczoge1xuICAgIC8qKiBCb2R5IGZyYW1lIGRhdGEgZnJvbSBraW5lY3QgKi9cbiAgICBib2RpZXM6IHR5cGVzLmFycmF5LFxuICAgIC8qKiBDb21wb25lbnQgd2lkdGggKi9cbiAgICB3aWR0aDogdHlwZXMubnVtYmVyLFxuICAgIC8qKiBDb21wb25lbnQgaGVpZ2h0ICovXG4gICAgaGVpZ2h0OiB0eXBlcy5udW1iZXIsXG4gICAgLyoqIFdpZHRoIG9mIGZyYW1lcyAqL1xuICAgIGZyYW1lV2lkdGg6IHR5cGVzLm51bWJlcixcbiAgICAvKiogUmFkaXVzIG9mIGpvaW50ICovXG4gICAgam9pbnRSYWRpdXM6IHR5cGVzLm51bWJlcixcbiAgICAvKiogU2NhbGUgcmF0ZSBvZiBjYW52YXMgKi9cbiAgICBzY2FsZTogdHlwZXMubnVtYmVyLFxuICAgIC8qKiBBbHQgbWVzc2FnZSB3aGVuIG5vIGJvZHkgZm91bmQgKi9cbiAgICBhbHQ6IHR5cGVzLnN0cmluZyxcbiAgICAvKiogQ29sb3JpemVyIGZ1bmN0aW9uICovXG4gICAgY29sb3JpemVyOiB0eXBlcy5mdW5jXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IGRlcHRoU3BhY2UuQk9VTkRfV0lEVEgsXG4gICAgICBoZWlnaHQ6IGRlcHRoU3BhY2UuQk9VTkRfSEVJR0hULFxuICAgICAgZnJhbWVXaWR0aDogNCxcbiAgICAgIGpvaW50UmFkaXVzOiAzLFxuICAgICAgc2NhbGU6IDIsXG4gICAgICBhbHQ6ICdOTyBCT0RZIEZPVU5EJyxcbiAgICAgIGNvbG9yaXplcjogY29sb3JIZWxwZXIudW5pcXVlQ29sb3JpemVyKCcjQ0NDQzMzJylcbiAgICB9XG4gIH0sXG5cbiAgc3RhdGljczoge30sXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuICAgIGxldCB7IHdpZHRoLCBoZWlnaHQsIHNjYWxlIH0gPSBwcm9wc1xuICAgIGxldCBzdHlsZSA9IHMuZ2V0U3R5bGUoKVxuICAgIGxldCBpc0VtcHR5ID0gcy5nZXRCb2RpZXMoKS5sZW5ndGggPT09IDBcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1raW5uZWN0LWZyYW1lJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgIH0sIHN0eWxlLm1haW4sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IGlzRW1wdHkgPyBzLl9yZW5kZXJBbHQoc3R5bGUuYWx0KSA6IG51bGwgfVxuICAgICAgICA8Y2FudmFzIHdpZHRoPXsgd2lkdGggKiBzY2FsZSB9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXsgaGVpZ2h0ICogc2NhbGUgfVxuICAgICAgICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICB3aWR0aCwgaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgIHJlZj17IChjYW52YXMpID0+IHMucmVnaXN0ZXJDYW52YXMoY2FudmFzKSB9Lz5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50ICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHMuX3RyYWNraW5nQ29sb3JzID0ge31cbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIChuZXh0UHJvcHMpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHMuZHJhd0JvZHkocy5nZXRCb2RpZXMoKSlcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudCAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBzLmRyYXdCb2R5KHMuZ2V0Qm9kaWVzKCkpXG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHMuZHJhd0JvZHkocy5nZXRCb2RpZXMoKSlcbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGRyYXdCb2R5IChib2RpZXMpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IGNhbnZhcyB9ID0gc1xuXG4gICAgaWYgKCFjYW52YXMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIFNQSU5FX0JBU0UsIFNQSU5FX01JRCwgTkVDSywgSEVBRCwgU0hPVUxERVJfTEVGVCxcbiAgICAgIEVMQk9XX0xFRlQsIFdSSVNUX0xFRlQsIEhBTkRfTEVGVCwgU0hPVUxERVJfUklHSFQsXG4gICAgICBFTEJPV19SSUdIVCwgV1JJU1RfUklHSFQsIEhBTkRfUklHSFQsIEhJUF9MRUZULCBLTkVFX0xFRlQsXG4gICAgICBBTktMRV9MRUZULCBGT09UX0xFRlQsIEhJUF9SSUdIVCwgS05FRV9SSUdIVCwgQU5LTEVfUklHSFQsXG4gICAgICBGT09UX1JJR0hULCBTUElORV9TSE9VTERFUiwgSEFORF9USVBfTEVGVCwgVEhVTUJfTEVGVCxcbiAgICAgIEhBTkRfVElQX1JJR0hULCBUSFVNQl9SSUdIVFxuICAgIH0gPSBqb2ludFR5cGVzXG5cbiAgICBsZXQgeyBwcm9wcyB9ID0gc1xuICAgIGxldCB7IHdpZHRoLCBoZWlnaHQsIGZyYW1lV2lkdGgsIGpvaW50UmFkaXVzLCBzY2FsZSwgY29sb3JpemVyIH0gPSBwcm9wc1xuXG4gICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gICAgY3R4LnNhdmUoKVxuXG4gICAgY29uc3QgeyBkcmF3Q2lyY2xlLCBkcmF3TGluZSB9ID0gZHJhd0hlbHBlclxuICAgIGxldCB0b1BvaW50ID0gKGpvaW50KSA9PiAoe1xuICAgICAgeDogam9pbnQuZGVwdGhYICogd2lkdGgsXG4gICAgICB5OiBqb2ludC5kZXB0aFkgKiBoZWlnaHRcbiAgICB9KVxuXG4gICAgY3R4LnNjYWxlKHNjYWxlLCBzY2FsZSlcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXG5cbiAgICBmb3IgKGxldCBib2R5IG9mIGJvZGllcykge1xuICAgICAgbGV0IHsgam9pbnRzLCB0cmFja2luZ0lkIH0gPSBib2R5XG5cbiAgICAgIGxldCBjb2xvciA9IGNvbG9yaXplcihgdHJhY2tpbmctJHt0cmFja2luZ0lkfWApXG4gICAgICBsZXQgcG9pbnRzID0gam9pbnRzLm1hcCh0b1BvaW50KVxuXG4gICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGFwZW1hbmNvbG9yLnBhcnNlKGNvbG9yKS5hbHBoYSgwLjY2KS5yZ2JhU3RyaW5nKClcbiAgICAgIGN0eC5saW5lV2lkdGggPSBmcmFtZVdpZHRoXG5cbiAgICAgIGxldCBzcGluZUIgPSBwb2ludHNbIFNQSU5FX0JBU0UgXVxuICAgICAgbGV0IHNwaW5lTSA9IHBvaW50c1sgU1BJTkVfTUlEIF1cbiAgICAgIGxldCBuZWNrID0gcG9pbnRzWyBORUNLIF1cbiAgICAgIGxldCBoZWFkID0gcG9pbnRzWyBIRUFEIF1cbiAgICAgIGxldCBzaG91bGRlckwgPSBwb2ludHNbIFNIT1VMREVSX0xFRlQgXVxuICAgICAgbGV0IGVsYm93TCA9IHBvaW50c1sgRUxCT1dfTEVGVCBdXG4gICAgICBsZXQgd3Jpc3RMID0gcG9pbnRzWyBXUklTVF9MRUZUIF1cbiAgICAgIGxldCBoYW5kTCA9IHBvaW50c1sgSEFORF9MRUZUIF1cbiAgICAgIGxldCBzaG91bGRlclIgPSBwb2ludHNbIFNIT1VMREVSX1JJR0hUIF1cbiAgICAgIGxldCBlbGJvd1IgPSBwb2ludHNbIEVMQk9XX1JJR0hUIF1cbiAgICAgIGxldCB3cmlzdFIgPSBwb2ludHNbIFdSSVNUX1JJR0hUIF1cbiAgICAgIGxldCBoYW5kUiA9IHBvaW50c1sgSEFORF9SSUdIVCBdXG4gICAgICBsZXQgaGlwTCA9IHBvaW50c1sgSElQX0xFRlQgXVxuICAgICAgbGV0IGtuZWVMID0gcG9pbnRzWyBLTkVFX0xFRlQgXVxuICAgICAgbGV0IGFua2xlTCA9IHBvaW50c1sgQU5LTEVfTEVGVCBdXG4gICAgICBsZXQgZm9vdEwgPSBwb2ludHNbIEZPT1RfTEVGVCBdXG4gICAgICBsZXQgaGlwUiA9IHBvaW50c1sgSElQX1JJR0hUIF1cbiAgICAgIGxldCBrbmVlUiA9IHBvaW50c1sgS05FRV9SSUdIVCBdXG4gICAgICBsZXQgYW5rbGVSID0gcG9pbnRzWyBBTktMRV9SSUdIVCBdXG4gICAgICBsZXQgZm9vdFIgPSBwb2ludHNbIEZPT1RfUklHSFQgXVxuICAgICAgbGV0IHNwaW5lU2hvdWxkZXIgPSBwb2ludHNbIFNQSU5FX1NIT1VMREVSIF1cbiAgICAgIGxldCBoYW5kVGlwTCA9IHBvaW50c1sgSEFORF9USVBfTEVGVCBdXG4gICAgICBsZXQgdGh1bWJMID0gcG9pbnRzWyBUSFVNQl9MRUZUIF1cbiAgICAgIGxldCBoYW5kVGlwUiA9IHBvaW50c1sgSEFORF9USVBfUklHSFQgXVxuICAgICAgbGV0IHRodW1iUiA9IHBvaW50c1sgVEhVTUJfUklHSFQgXVxuXG4gICAgICAvLyBEcmF3IGxpbmVzXG4gICAgICB7XG4gICAgICAgIGxldCBsaW5lUG9pbnRzID0gW1xuICAgICAgICAgIFsgaGVhZCwgbmVjaywgc3BpbmVTaG91bGRlciwgc3BpbmVNLCBzcGluZUIgXSxcbiAgICAgICAgICBbIHNwaW5lU2hvdWxkZXIsIHNob3VsZGVyTCwgZWxib3dMLCB3cmlzdEwsIGhhbmRMLCBoYW5kVGlwTCwgdGh1bWJMIF0sXG4gICAgICAgICAgWyBzcGluZUIsIGhpcEwsIGtuZWVMLCBhbmtsZUwsIGZvb3RMIF0sXG4gICAgICAgICAgWyBzcGluZVNob3VsZGVyLCBzaG91bGRlclIsIGVsYm93Uiwgd3Jpc3RSLCBoYW5kUiwgaGFuZFRpcFIsIHRodW1iUiBdLFxuICAgICAgICAgIFsgc3BpbmVCLCBoaXBSLCBrbmVlUiwgYW5rbGVSLCBmb290UiBdXG4gICAgICAgIF1cbiAgICAgICAgZm9yIChsZXQgbGluZVBvaW50IG9mIGxpbmVQb2ludHMpIHtcbiAgICAgICAgICBkcmF3TGluZShjdHgsIC4uLmxpbmVQb2ludClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBEcmF3IGNpcmNsZXNcbiAgICAgIHtcbiAgICAgICAgY29uc3QgUkFESVVTID0gam9pbnRSYWRpdXNcbiAgICAgICAgbGV0IGNpcmNsZVBvaW50cyA9IFtcbiAgICAgICAgICBoZWFkLCBuZWNrLCBzcGluZVNob3VsZGVyLCBzcGluZU0sIHNwaW5lQixcbiAgICAgICAgICBzaG91bGRlckwsIGhpcEwsIGVsYm93TCwgd3Jpc3RMLFxuICAgICAgICAgIHNob3VsZGVyUiwgaGlwUiwgZWxib3dSLCB3cmlzdFIsXG4gICAgICAgICAgaGFuZEwsIGhhbmRUaXBMLCB0aHVtYkwsXG4gICAgICAgICAgaGFuZFIsIGhhbmRUaXBSLCB0aHVtYlJcbiAgICAgICAgXVxuICAgICAgICBmb3IgKGxldCBjaXJjbGVQb2ludCBvZiBjaXJjbGVQb2ludHMpIHtcbiAgICAgICAgICBkcmF3Q2lyY2xlKGN0eCwgY2lyY2xlUG9pbnQsIFJBRElVUylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGN0eC5yZXN0b3JlKClcbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDdXN0b21cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZWdpc3RlckNhbnZhcyAoY2FudmFzKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBzLmNhbnZhcyA9IGNhbnZhc1xuICB9LFxuXG4gIGdldFN0eWxlICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWFpbjoge1xuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xuICAgICAgfSxcbiAgICAgIGFsdDoge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBjb2xvcjogJyNFRUUnLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICBmb250U2l6ZTogJzM2cHgnLFxuICAgICAgICB6SW5kZXg6ICc0JyxcbiAgICAgICAgbGluZUhlaWdodDogJzFlbScsXG4gICAgICAgIHdvcmRCcmVhazogJ2JyZWFrLXdvcmQnLFxuICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGdldEJvZGllcyAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcyB9ID0gc1xuICAgIHJldHVybiAocHJvcHMuYm9kaWVzIHx8IFtdKVxuICAgICAgLmZpbHRlcigoYm9keSkgPT4gISFib2R5KVxuICAgICAgLmZpbHRlcigoYm9keSkgPT4gYm9keS50cmFja2VkKVxuICB9LFxuXG4gIF9yZW5kZXJBbHQgKHN0eWxlKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcyB9ID0gc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNnLWtpbm5lY3QtZnJhbWUtYWx0XCIgc3R5bGU9eyBzdHlsZSB9XG4gICAgICA+eyBwcm9wcy5hbHQgfTwvZGl2PlxuICAgIClcbiAgfSxcblxuICBjYW52YXM6IG51bGwsXG5cbiAgX3RyYWNraW5nQ29sb3JzOiBudWxsXG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnS2luZWN0RnJhbWVcbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbi8qKiBAbGVuZHMgU2dNYWluICovXG5jb25zdCBTZ01haW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1tYWluJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnTWFpblxuIiwiLyoqXG4gKiBNaWNyb3Bob25lIGNvbXBvbmVudFxuICogQGNsYXNzIFNnTWljcm9waG9uZVxuICovXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7QXBJY29ufSBmcm9tICdhcGVtYW4tcmVhY3QtYmFzaWMnXG5pbXBvcnQge0FwVG91Y2hNaXhpbiwgQXBQdXJlTWl4aW59IGZyb20gJ2FwZW1hbi1yZWFjdC1taXhpbnMnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG5jb25zdCB7IE1JQ1JPUEhPTkVfVFJBTlNJVElPTiB9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMvYW5pbWF0aW9uX2NvbnN0YW50cycpXG5cbi8qKiBAbGVuZHMgU2dNaWNyb3Bob25lICovXG5jb25zdCBTZ01pY3JvcGhvbmUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBwcm9wVHlwZXM6IHtcbiAgICB3aWR0aDogdHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogdHlwZXMubnVtYmVyLFxuICAgIG9uOiB0eXBlcy5ib29sXG4gIH0sXG5cbiAgc3RhdGljczoge1xuICAgIE1JQ1JPUEhPTkVfVFJBTlNJVElPTlxuICB9LFxuXG4gIG1peGluczogW1xuICAgIEFwVG91Y2hNaXhpbixcbiAgICBBcFB1cmVNaXhpblxuICBdLFxuXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiA0NCxcbiAgICAgIGhlaWdodDogNDQsXG4gICAgICBvbjogZmFsc2VcbiAgICB9XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZW5sYXJnZWQ6IGZhbHNlXG4gICAgfVxuICB9LFxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgc3R5bGUgPSBzLmdldFN0eWxlKClcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcbiAgICBsZXQgeyBvbiB9ID0gcHJvcHNcbiAgICByZXR1cm4gKFxuICAgICAgPGEgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctbWljcm9waG9uZScsIHtcbiAgICAgICAgJ3NnLW1pY3JvcGhvbmUtb24nOiBvblxuICAgICAgfSl9XG4gICAgICAgICBzdHlsZT17IHN0eWxlLnJvb3QgfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1taWNyb3Bob25lLWJhY2snLCB7XG4gICAgICAgICdzZy1taWNyb3Bob25lLWJhY2stZW5sYXJnZWQnOiBzdGF0ZS5lbmxhcmdlZFxuICAgICAgICB9KSB9PjwvZGl2PlxuICAgICAgICA8QXBJY29uIGNsYXNzTmFtZT1cImZhIGZhLW1pY3JvcGhvbmUgc2ctbWljcm9waG9uZS1pY29uXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17IHN0eWxlLmljb24gfVxuICAgICAgICAvPlxuICAgICAgPC9hPlxuICAgIClcbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBMaWZlY3ljbGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBjb21wb25lbnREaWRNb3VudCAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBzLl9hbm1hdGlvblRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgY29uc3QgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcbiAgICAgIGlmIChwcm9wcy5vbikge1xuICAgICAgICBzLnNldFN0YXRlKHtcbiAgICAgICAgICBlbmxhcmdlZDogIXN0YXRlLmVubGFyZ2VkXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSwgTUlDUk9QSE9ORV9UUkFOU0lUSU9OKVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbk1vdW50ICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGNsZWFySW50ZXJ2YWwocy5fYW5tYXRpb25UaW1lcilcbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDdXN0b21cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBnZXRTdHlsZSAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcyB9ID0gc1xuICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IHByb3BzXG4gICAgcmV0dXJuIHtcbiAgICAgIHJvb3Q6IHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodFxuICAgICAgfSxcbiAgICAgIGljb246IHtcbiAgICAgICAgZm9udFNpemU6IGhlaWdodCAqIDAuNjZcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2dNaWNyb3Bob25lXG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG4vKiogQGxlbmRzIFNnUGFnZSAqL1xuY29uc3QgU2dQYWdlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctcGFnZScsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ1BhZ2VcbiIsIi8qKlxuICogU2dTd2l0Y2ggQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dTd2l0Y2hcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7QXBTd2l0Y2h9IGZyb20gJ2FwZW1hbi1yZWFjdC1zd2l0Y2gnXG5pbXBvcnQge0FwU3R5bGV9IGZyb20gJ2FwZW1hbi1yZWFjdC1zdHlsZSdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbi8qKiBAbGVuZHMgU2dTd2l0Y2ggKi9cbmNvbnN0IFNnU3dpdGNoID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICAvKipcbiAgICAgKiBXaWR0aChweCkgb2YgYSBzd2l0Y2guXG4gICAgICovXG4gICAgd2lkdGg6IHR5cGVzLm51bWJlcixcbiAgICAvKipcbiAgICAgKiBUaGUgc3RhdGUgb2Ygb24vb2ZmLlxuICAgICAqL1xuICAgIG9uOiB0eXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIG9uIHRhcC5cbiAgICAgKi9cbiAgICBvblRhcDogdHlwZXMuZnVuYyxcbiAgICBvblRpdGxlOiB0eXBlcy5zdHJpbmcsXG4gICAgb2ZmVGl0bGU6IHR5cGVzLnN0cmluZyxcbiAgICBoaWdobGlnaHRDb2xvcjogdHlwZXMuc3RyaW5nLFxuICAgIGJhY2tncm91bmRDb2xvcjogdHlwZXMuc3RyaW5nLFxuICAgIGJvcmRlckNvbG9yOiB0eXBlcy5zdHJpbmcsXG4gICAgaGFuZGxlU2l6ZTogdHlwZXMubnVtYmVyXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlICgpIHtcbiAgICBsZXQgc3R5bGUgPSB0aGlzLmN1c3RvbVN0eWxlKClcbiAgICByZXR1cm4geyBzdHlsZSB9XG4gIH0sXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzLCBzdGF0ZSB9ID0gc1xuICAgIGxldCB7IHN0eWxlIH0gPSBzdGF0ZVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLXN3aXRjaCcsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe2Rpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBtYXJnaW46ICc0cHgnfSwgcHJvcHMuc3R5bGUpIH0gPlxuICAgICAgICA8QXBTdHlsZSBkYXRhPXsgc3R5bGUgfSAvPlxuICAgICAgICA8QXBTd2l0Y2ggeyAuLi5wcm9wcyB9Lz5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfSxcblxuICBjdXN0b21TdHlsZSAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcyB9ID0gc1xuXG4gICAgbGV0IHsgaGlnaGxpZ2h0Q29sb3IsIGJhY2tncm91bmRDb2xvciwgYm9yZGVyQ29sb3IgfSA9IHByb3BzXG4gICAgbGV0IGhhbmRsZVNpemUgPSBwcm9wcy5oYW5kbGVTaXplIHx8IDI0XG4gICAgbGV0IG1pbldpZHRoID0gaGFuZGxlU2l6ZSAqIDEuNVxuICAgIGxldCBzdHlsZSA9IHtcbiAgICAgICcuYXAtc3dpdGNoLWxhYmVsJzoge1xuICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxuICAgICAgICBsaW5lSGVpZ2h0OiBgJHtoYW5kbGVTaXplfXB4YFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLWxhYmVsLXRleHQnOiB7XG4gICAgICAgIG1pbldpZHRoOiBtaW5XaWR0aFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9uLWxhYmVsJzoge1xuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgbWFyZ2luUmlnaHQ6IC0xICogaGFuZGxlU2l6ZSAvIDJcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vZmYtbGFiZWwnOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjRkFGQUZBJyxcbiAgICAgICAgY29sb3I6ICcjQUFBJyxcbiAgICAgICAgbWFyZ2luTGVmdDogLTEgKiBoYW5kbGVTaXplIC8gMlxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9uIC5hcC1zd2l0Y2gtb2ZmLWxhYmVsJzoge1xuICAgICAgICB3aWR0aDogYCR7aGFuZGxlU2l6ZSAvIDIgKyAyfXB4ICFpbXBvcnRhbnRgXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb2ZmIC5hcC1zd2l0Y2gtb24tbGFiZWwnOiB7XG4gICAgICAgIHdpZHRoOiBgJHtoYW5kbGVTaXplIC8gMiArIDJ9cHggIWltcG9ydGFudGBcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1pbm5lcic6IHtcbiAgICAgICAgaGVpZ2h0OiBoYW5kbGVTaXplLFxuICAgICAgICBib3JkZXJSYWRpdXM6IChoYW5kbGVTaXplIC8gMiArIDEpLFxuICAgICAgICBtaW5XaWR0aDogbWluV2lkdGhcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1oYW5kbGUnOiB7XG4gICAgICAgIHdpZHRoOiBoYW5kbGVTaXplLFxuICAgICAgICBoZWlnaHQ6IGhhbmRsZVNpemVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGhpZ2hsaWdodENvbG9yKSB7XG4gICAgICBPYmplY3QuYXNzaWduKHN0eWxlWycuYXAtc3dpdGNoLW9uLWxhYmVsJ10sIHtcbiAgICAgICAgYmFja2dyb3VuZDogaGlnaGxpZ2h0Q29sb3JcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChiYWNrZ3JvdW5kQ29sb3IpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oc3R5bGVbJy5hcC1zd2l0Y2gtaW5uZXInXSwge1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhY2tncm91bmRDb2xvclxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKGJvcmRlckNvbG9yKSB7XG4gICAgICBsZXQgYm9yZGVyQ29sb3JPcHRpb24gPSB7XG4gICAgICAgIGJvcmRlcjogYDFweCBzb2xpZCAke2JvcmRlckNvbG9yfWBcbiAgICAgIH1cbiAgICAgIE9iamVjdC5hc3NpZ24oc3R5bGVbJy5hcC1zd2l0Y2gtaW5uZXInXSwgYm9yZGVyQ29sb3JPcHRpb24pXG4gICAgICBPYmplY3QuYXNzaWduKHN0eWxlWycuYXAtc3dpdGNoLWhhbmRsZSddLCBib3JkZXJDb2xvck9wdGlvbilcbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnU3dpdGNoXG4iLCIvKipcbiAqIFN0eWxlIGZvciBTZ0h0bWwuXG4gKiBAY29uc3RydWN0b3IgU2dUaGVtZVN0eWxlXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQge0FwU3R5bGV9IGZyb20gJ2FwZW1hbi1yZWFjdC1zdHlsZSdcbmltcG9ydCB7QXBUaGVtZVN0eWxlfSBmcm9tICdhcGVtYW4tcmVhY3QtdGhlbWUnXG5cbmNvbnN0IHsgTUlDUk9QSE9ORV9UUkFOU0lUSU9OIH0gPSByZXF1aXJlKCcuL2NvbnN0YW50cy9hbmltYXRpb25fY29uc3RhbnRzJylcblxuLyoqIEBsZW5kcyBTZ1RoZW1lU3R5bGUgKi9cbmNvbnN0IFNnVGhlbWVTdHlsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgc3R5bGU6IHR5cGVzLm9iamVjdCxcbiAgICBkb21pbmFudDogdHlwZXMuc3RyaW5nXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0eWxlOiB7fSxcbiAgICAgIGRvbWluYW50OiBBcFN0eWxlLkRFRkFVTFRfSElHSExJR0hUX0NPTE9SXG4gICAgfVxuICB9LFxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcblxuICAgIGxldCB7IGRvbWluYW50IH0gPSBwcm9wc1xuXG4gICAgbGV0IHN0eWxlID0ge1xuICAgICAgJy5zZy1odG1sJzoge30sXG4gICAgICAnLnNnLW1pY3JvcGhvbmUnOiB7XG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgY29sb3I6ICdpbmhlcml0J1xuICAgICAgfSxcbiAgICAgICcuc2ctbWljcm9waG9uZS1iYWNrJzoge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBkb21pbmFudCxcbiAgICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgICB0b3A6ICc5cHgnLFxuICAgICAgICBsZWZ0OiAnOXB4JyxcbiAgICAgICAgcmlnaHQ6ICc5cHgnLFxuICAgICAgICBib3R0b206ICc5cHgnLFxuICAgICAgICB0cmFuc2l0aW9uOiBgdHJhbnNmb3JtICR7TUlDUk9QSE9ORV9UUkFOU0lUSU9OfW1zYCxcbiAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnNTAlIDUwJScsXG4gICAgICAgIHRyYW5zZm9ybTogJ3NjYWxlKDEsIDEpJ1xuICAgICAgfSxcbiAgICAgICcuc2ctbWljcm9waG9uZS1vbiAuc2ctbWljcm9waG9uZS1iYWNrJzoge1xuICAgICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICB9LFxuICAgICAgJy5zZy1taWNyb3Bob25lLW9uIC5zZy1taWNyb3Bob25lLWljb24nOiB7XG4gICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICBvcGFjaXR5OiAwLjlcbiAgICAgIH0sXG4gICAgICAnLnNnLW1pY3JvcGhvbmUtYmFjay1lbmxhcmdlZCc6IHtcbiAgICAgICAgdHJhbnNmb3JtOiAnc2NhbGUoMiwgMiknXG4gICAgICB9LFxuICAgICAgJy5zZy1taWNyb3Bob25lLWljb24nOiB7XG4gICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICB6SW5kZXg6IDQsXG4gICAgICAgIG9wYWNpdHk6IDAuNzVcbiAgICAgIH0sXG4gICAgICAnLnNnLW1pY3JvcGhvbmU6aG92ZXIgLnNnLW1pY3JvcGhvbmUtaWNvbic6IHtcbiAgICAgICAgb3BhY2l0eTogMVxuICAgICAgfSxcbiAgICAgICcuc2ctbWljcm9waG9uZTphY3RpdmUgLnNnLW1pY3JvcGhvbmUtaWNvbic6IHtcbiAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8QXBUaGVtZVN0eWxlIHsgLi4ucHJvcHMgfVxuICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oc3R5bGUsIHByb3BzLnN0eWxlKSB9XG4gICAgICA+eyBwcm9wcy5jaGlsZHJlbiB9PC9BcFRoZW1lU3R5bGU+XG4gICAgKVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ1RoZW1lU3R5bGVcbiIsIi8qKlxuICogU2dWaWRlbyBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ1ZpZGVvXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG4vKiogQGxlbmRzIFNnVmlkZW8gKi9cbmNvbnN0IFNnVmlkZW8gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqIFZpZGVvIHNvdXJjZSBVUkwgKi9cbiAgICBzcmM6IHR5cGVzLm9uZU9mVHlwZShbXG4gICAgICB0eXBlcy5zdHJpbmcsXG4gICAgICB0eXBlcy5hcnJheU9mKHR5cGVzLnN0cmluZylcbiAgICBdKSxcbiAgICAvKiogUmVnaXN0ZXIgcGxheWVyICovXG4gICAgcGxheWVyUmVmOiB0eXBlcy5mdW5jXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGxheWVyUmVmICgpIHt9XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcbiAgICBsZXQgc3JjID0gW10uY29uY2F0KHByb3BzLnNyYyB8fCBbXSlcbiAgICByZXR1cm4gKFxuICAgICAgPHZpZGVvIHsgLi4ucHJvcHMgfVxuICAgICAgICBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy12aWRlbycsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9XG4gICAgICAgIHJlZj17IChwbGF5ZXIpID0+IHByb3BzLnBsYXllclJlZihwbGF5ZXIpIH1cbiAgICAgID5cbiAgICAgICAgeyBzcmMubWFwKChzcmMpID0+IChcbiAgICAgICAgICA8c291cmNlIHNyYz17IHNyYyB9IGtleT17IHNyYyB9Lz4pXG4gICAgICAgICkgfVxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvdmlkZW8+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnVmlkZW9cbiJdfQ==
