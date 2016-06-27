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

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
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
    var timeout = cachedSetTimeout(cleanUpNextTick);
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
    cachedClearTimeout(timeout);
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
        cachedSetTimeout(drainQueue, 0);
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

// Polyfill of requestAnimationFrame
window.requestAnimationFrame = function () {
  return window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
    return window.setTimeout(f, 1000 / 60);
  };
}();
window.cancelAnimationFrame = function () {
  return window.cancelAnimationFrame || window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame || function (id) {
    return window.clearTimeout(id);
  };
}();

function onload() {
  var _window = window;
  var locale = _window.locale;

  _apemanBrwsReact2.default.render(CONTAINER_ID, _casesComponent2.default, {
    locale: locale
  }, function done() {
    // The component is ready.
  });
  window.removeEventListener('DOMContentLoaded', onload);
}

window.addEventListener('DOMContentLoaded', onload);
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
},{"./fragments/header":6,"./views/showcase_view":11,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],5:[function(require,module,exports){
module.exports=[
  {
    "name": "remote-plen",
    "body": {
      "title": "CASE_REMOTE_TITLE",
      "text": "CASE_REMOTE_TEXT",
      "video": "videos/SUGOS_remote_PLEN.mp4",
      "canvas1": {
        "dx": 160,
        "dy": 5.6,
        "width": 152.9
      },
      "canvas2": {
        "dx": 0,
        "dy": 11.6,
        "width": 152.9
      }
    }
  },
  {
    "name": "preset-drone",
    "body": {
      "title": "CASE_DRONE_TITLE",
      "text": "CASE_DRONE_TEXT",
      "video": "videos/ardrone.mp4",
      "canvas1": {
        "dx": 0,
        "dy": 3,
        "width": 152.9
      },
      "canvas2": {
        "dx": 160,
        "dy": 5.6,
        "width": 152.9
      }
    }
  },
  {
    "name": "kinect-analysis",
    "body": {
      "title": "CASE_SENSE_TITLE",
      "text": "CASE_SENSE_TEXT",
      "video": "videos/SUGOS_remote_sensor.mp4",
      "canvas1": {
        "dx": 160,
        "dy": 3,
        "width": 152.9
      },
      "canvas2": {
        "dx": 0,
        "dy": 11.6,
        "width": 152.9
      }
    }
  },
  {
    "name": "speech-pepper",
    "body": {
      "title": "CASE_SPEECH_RECOGNITION_TITLE",
      "text": "CASE_SPEECH_RECOGNITION_TEXT",
      "video": "videos/pepper_speech_recognition.mp4",
      "canvas1": {
        "dx": 0,
        "dy": 0,
        "width": 100.8
      },
      "canvas2": {
        "dx": 182.9,
        "dy": 15.4,
        "width": 135.3
      }
    }
  },
  {
    "name": "text-input",
    "body": {
      "title": "CASE_TEXT_INPUT_TITLE",
      "text": "CASE_TEXT_INPUT_TEXT",
      "video": "videos/pepper_text_input.mp4",
      "canvas1": {
        "dx": 164.9,
        "dy": 11.2,
        "width": 148
      },
      "canvas2": {
        "dx": 32.6,
        "dy": 10.5,
        "width": 92.9
      }
    }
  },
  {
    "name": "edison_roomba",
    "body": {
      "title": "CASE_EDISON_ROOMBA_TITLE",
      "text": "CASE_EDISON_ROOMBA_TEXT",
      "video": "videos/edison_roomba.mp4",
      "canvas1": {
        "dx": 12.7,
        "dy": 14.2,
        "width": 124.8
      },
      "canvas2": {
        "dx": 161.9,
        "dy": 11.2,
        "width": 148
      }
    }
  },
  {
    "name": "edison-stream",
    "body": {
      "title": "CASE_EDISON_STREAM_TITLE",
      "text": "CASE_EDISON_STREAM_TEXT",
      "video": "videos/yabee-stream.mp4",
      "canvas1": {
        "dx": 163,
        "dy": 11.2,
        "width": 148
      },
      "canvas2": {
        "dx": 0,
        "dy": 21.6,
        "width": 152.9
      }
    }
  },
  {
    "name": "curl-rapiro",
    "body": {
      "title": "CASE_CURL_RAPIRO_TITLE",
      "text": "CASE_CURL_RAPIRO_TEXT",
      "video": "videos/curl_rapiro.mp4",
      "canvas1": {
        "dx": 169,
        "dy": 19.9,
        "width": 145.4
      },
      "canvas2": {
        "dx": 4.9,
        "dy": 11.2,
        "width": 148
      }
    }
  },
  {
    "name": "hitoe-map",
    "body": {
      "title": "CASE_HITOE_TITLE",
      "text": "CASE_HITOE_TEXT",
      "video": "videos/hitoe-map.mp4",
      "canvas1": {
        "dx": 29.6,
        "dy": 23.2,
        "width": 102.3
      },
      "canvas2": {
        "dx": 167.1,
        "dy": 5.6,
        "width": 152.9
      }
    }
  },
  {
    "name": "gyro-pepper",
    "body": {
      "title": "CASE_GYRO_TITLE",
      "text": "CASE_GYRO_TEXT",
      "video": "videos/gyro-pepper.mp4",
      "canvas1": {
        "dx": 0,
        "dy": 0,
        "width": 152.9
      },
      "canvas2": {
        "dx": 167.1,
        "dy": 1.1,
        "width": 152.9
      }
    }
  }
]

},{}],6:[function(require,module,exports){
/**
 * Header component
 * @class Header
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

/** @lends Header */
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
},{"../../services/link_service":13,"../fragments/logo":8,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],7:[function(require,module,exports){
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
          strokeLinecap: 'round',
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
},{"../../constants/color_constants.json":12,"apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","react":"react"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactMixins = require('apeman-react-mixins');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Logo = _react2.default.createClass({
  displayName: 'Logo',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  render: function render() {
    var s = this;
    var l = s.getLocale();
    return _react2.default.createElement(
      'h1',
      { className: 'logo' },
      l('logo.LOGO')
    );
  }
});

exports.default = Logo;
},{"apeman-react-mixins":"apeman-react-mixins","react":"react"}],9:[function(require,module,exports){
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

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('video', props.className) },
      _react2.default.createElement(
        'div',
        { className: 'video-inner' },
        _react2.default.createElement(_sgReactComponents.SgVideo, { src: props.src,
          playerRef: function playerRef(player) {
            return s._player = player;
          },
          hidden: true,
          muted: true,
          loop: true
        })
      ),
      _react2.default.createElement('div', { className: 'video-overlay' })
    );
  }
});

exports.default = Video;
},{"apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","react":"react","sg-react-components":"sg-react-components"}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VideoCanvas = _react2.default.createClass({
  displayName: 'VideoCanvas',

  propTypes: {
    src: _react.PropTypes.string,
    width: _react.PropTypes.number,
    height: _react.PropTypes.number,
    translateX: _react.PropTypes.number,
    translateY: _react.PropTypes.number
  },
  getDefaultProps: function getDefaultProps() {
    return {
      width: 148,
      height: 148
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('video-canvas', props.className) },
      _react2.default.createElement(
        'div',
        { className: 'video-canvas-inner' },
        _react2.default.createElement('canvas', { width: props.width,
          height: props.height,
          ref: function ref(canvas) {
            return s._canvas = canvas;
          }
        })
      ),
      _react2.default.createElement('div', { className: 'video-canvas-overlay' })
    );
  }
});

exports.default = VideoCanvas;
},{"classnames":"classnames","react":"react"}],11:[function(require,module,exports){
/**
 * View for showcase
 * @class Showcase
 */
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _apemanReactMixins = require('apeman-react-mixins');

var _video = require('../fragments/video');

var _video2 = _interopRequireDefault(_video);

var _video_canvas = require('../fragments/video_canvas');

var _video_canvas2 = _interopRequireDefault(_video_canvas);

var _joiner = require('../fragments/joiner');

var _joiner2 = _interopRequireDefault(_joiner);

var _color_constants = require('../../constants/color_constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('sg:component:showcase');

var ARTICLES = require('../data/articles.json');

var ShowcaseView = _react2.default.createClass({
  displayName: 'ShowcaseView',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  render: function render() {
    debug('render called.');
    var s = this;
    var l = s.getLocale();
    var _section = s._renderSection;
    // 開発中の section の挿入・入れ替えを容易にするため
    var first = true;
    var reversed = function reversed() {
      first = !first;
      return first;
    };
    return _react2.default.createElement(
      _apemanReactBasic.ApView,
      { className: 'showcase-view',
        spinning: !s.mounted,
        onScroll: s._handleScroll
      },
      _react2.default.createElement(_apemanReactBasic.ApViewHeader, { titleText: l('titles.SHOWCASE_TITLE') }),
      _react2.default.createElement(
        _apemanReactBasic.ApViewBody,
        null,
        _react2.default.createElement(
          'article',
          null,
          ARTICLES.map(function (article) {
            return _section(article.name, article.body, reversed());
          })
        )
      )
    );
  },


  // -----------------
  // LifeCycle
  // -----------------

  componentDidMount: function componentDidMount() {
    var s = this;
    // defines mounted value
    s.mounted = true;

    var ua = navigator.userAgent;
    s.isIPhone = /(iPhone|iPod)/.test(ua);

    // defines this.videos
    var videos = ARTICLES.map(function (article, i) {
      var name = article.name;

      var video = {
        name: name,
        inScreen: true,
        container: s._videoContainers[name],
        player: {
          element: s._players[name]._player,
          canPlay: false,
          // 先頭の動画2つだけ自動再生
          onCanPlay: i <= 1 ? function () {
            video.player.canPlay = true;
            debug('canPlay ' + name);
            s._play(video);
          } : function () {
            video.player.canPlay = true;
            debug('canPlay ' + name);
          },
          playing: false
        },
        canvas1: s._canvases[name].canvas1,
        canvas2: s._canvases[name].canvas2
      };
      return video;
    });

    videos.forEach(function (video) {
      var player = video.player;

      player.element.load();
      player.element.addEventListener('canplaythrough', player.onCanPlay, false);
    });

    s.videos = videos;
  },
  componentWillUnmount: function componentWillUnmount() {
    var s = this;
    s.videos.forEach(function (video) {
      s._pause(video);
      var player = video.player;

      player.element.removeEventListner('canplaythrough', player.onCanPlay, false);
    });
  },

  // -----------------
  // Custom
  // -----------------

  mounted: false,
  isIPhone: false,
  videos: [],
  _videoContainers: {},
  _players: {},
  _canvases: {},

  // -----------------
  // Private
  // -----------------

  _renderSection: function _renderSection(name, config, reversed) {
    var s = this;
    var l = s.getLocale();
    var title = config.title;
    var text = config.text;
    var video = config.video;
    var canvas1 = config.canvas1;
    var canvas2 = config.canvas2;

    s._canvases[name] = {}; // Error 回避
    var refs = {
      container: function container(c) {
        s._videoContainers[name] = c;
      },
      video: function video(c) {
        s._players[name] = c;
      },
      canvas: function canvas(nth) {
        var canvasName = 'canvas' + nth;
        var canvasConf = nth === 1 ? canvas1 : canvas2;
        return function (c) {
          s._canvases[name][canvasName] = {
            element: c,
            dx: canvasConf.dx,
            dy: canvasConf.dy,
            width: canvasConf.width,
            animationId: 0,
            ctime: 0,
            lastTime: 0
          };
        };
      }
    };
    return _react2.default.createElement(
      _apemanReactBasic.ApSection,
      { className: 'showcase-section',
        id: 'showcase-' + name + '-section',
        key: name },
      _react2.default.createElement(
        _apemanReactBasic.ApSectionHeader,
        null,
        l('sections.' + title)
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
            [].concat(l('sections.' + text)).map(function (text, i) {
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
          { className: 'showcase-video-container', ref: refs.container },
          _react2.default.createElement(_video2.default, { src: video, ref: refs.video }),
          _react2.default.createElement(_video_canvas2.default, { className: 'showcase-video', ref: refs.canvas(1) }),
          _react2.default.createElement(_joiner2.default, { className: 'showcase-joiner', color: reversed ? _color_constants.DOMINANT : 'white' }),
          _react2.default.createElement(_video_canvas2.default, { className: 'showcase-video', ref: refs.canvas(2) })
        )
      )
    );
  },
  _updateInScreen: function _updateInScreen(clientHeight) {
    var s = this;
    s.videos.forEach(function (video, i) {
      var top = video.container.getBoundingClientRect().top;
      var nextInScreen = clientHeight - top > 0 && top > 0;
      var prevInScreen = video.inScreen;
      if (nextInScreen === prevInScreen) {
        return;
      }
      video.inScreen = nextInScreen;
      if (video.inScreen) {
        s._play(video);
      } else {
        s._pause(video);
      }
    });
  },
  _play: function _play(video, force) {
    var s = this;
    var player = video.player;

    if (!force && (!player.canPlay || player.playing)) {
      return;
    }
    debug('play ' + video.name);

    player.playing = true;
    var play = s.isIPhone ? s._playOnIPhone : s._playOnPc;
    var playerElement = video.player.element;
    var canvas1 = video.canvas1;
    var canvas2 = video.canvas2;


    play(canvas1, playerElement);
    play(canvas2, playerElement);
  },
  _playOnPc: function _playOnPc(canvas, playerElement) {
    var s = this;
    var ctx = canvas.element._canvas.getContext('2d');
    var loop = function loop() {
      s._draw(playerElement, canvas, ctx);
      canvas.animationId = window.requestAnimationFrame(loop);
    };

    playerElement.play();
    s._startAnimationFrame(canvas, loop);
  },
  _playOnIPhone: function _playOnIPhone(canvas, playerElement) {
    var s = this;
    var ctx = canvas.element._canvas.getContext('2d');
    canvas.lastTime = Date.now();
    var loop = function loop(timestamp) {
      var diff = Date.now() - canvas.lastTime;
      canvas.lastTime = Date.now();
      canvas.ctime += diff / 1000;
      playerElement.currentTime = canvas.ctime;
      s._draw(playerElement, canvas, ctx);
      if (playerElement.duration <= playerElement.currentTime) {
        canvas.ctime = 0;
      }
      canvas.animationId = window.requestAnimationFrame(loop);
    };

    s._startAnimationFrame(canvas, loop);
  },
  _startAnimationFrame: function _startAnimationFrame(canvas, loop) {
    canvas.animationId = window.requestAnimationFrame(loop);
  },
  _draw: function _draw(playerElement, canvas, ctx) {
    ctx.drawImage(playerElement, canvas.dx, canvas.dy, canvas.width, canvas.width, 0, 0, 148, 148);
  },
  _pause: function _pause(video) {
    var s = this;
    var player = video.player;
    var canvas1 = video.canvas1;
    var canvas2 = video.canvas2;

    debug('pause ' + video.name + ' id ' + canvas1.animationId + ' ' + canvas2.animationId);
    player.playing = false;
    if (!s.isIPhone) {
      player.element.pause();
    }
    window.cancelAnimationFrame(canvas1.animationId);
    window.cancelAnimationFrame(canvas2.animationId);
  },
  _handleScroll: function _handleScroll(event) {
    var clientHeight = event.target.clientHeight;

    this._updateInScreen(clientHeight);
  }
});

module.exports = ShowcaseView;
},{"../../constants/color_constants":12,"../data/articles.json":5,"../fragments/joiner":7,"../fragments/video":9,"../fragments/video_canvas":10,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","debug":"debug","react":"react"}],12:[function(require,module,exports){
module.exports={
  "DOMINANT": "#d6b810"
}
},{}],13:[function(require,module,exports){
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

},{"_process":2,"path":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4yLjEvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMi4xL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjIuMS9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsImxpYi9icm93c2VyL2Nhc2VzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMiLCJsaWIvY29tcG9uZW50cy9kYXRhL2FydGljbGVzLmpzb24iLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2pvaW5lci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvX2NhbnZhcy5qcyIsImxpYi9jb21wb25lbnRzL3ZpZXdzL3Nob3djYXNlX3ZpZXcuanMiLCJsaWIvY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cy5qc29uIiwibGliL3NlcnZpY2VzL2xpbmtfc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JUQTtBQUNBO0FBQ0E7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuKGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNhY2hlZFNldFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaXMgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBpcyBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgfVxufSAoKSlcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IGNhY2hlZFNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNhY2hlZENsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKipcbiAqIEJyb3dzZXIgc2NyaXB0IGZvciBjYXNlcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdCA9IHJlcXVpcmUoJ2FwZW1hbi1icndzLXJlYWN0Jyk7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwZW1hbkJyd3NSZWFjdCk7XG5cbnZhciBfY2FzZXNDb21wb25lbnQgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2Nhc2VzLmNvbXBvbmVudC5qcycpO1xuXG52YXIgX2Nhc2VzQ29tcG9uZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Nhc2VzQ29tcG9uZW50KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENPTlRBSU5FUl9JRCA9ICdjYXNlcy13cmFwJztcblxuLy8gUG9seWZpbGwgb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGYsIDEwMDAgLyA2MCk7XG4gIH07XG59KCk7XG53aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1vekNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm9DYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBmdW5jdGlvbiAoaWQpIHtcbiAgICByZXR1cm4gd2luZG93LmNsZWFyVGltZW91dChpZCk7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIG9ubG9hZCgpIHtcbiAgdmFyIF93aW5kb3cgPSB3aW5kb3c7XG4gIHZhciBsb2NhbGUgPSBfd2luZG93LmxvY2FsZTtcblxuICBfYXBlbWFuQnJ3c1JlYWN0Mi5kZWZhdWx0LnJlbmRlcihDT05UQUlORVJfSUQsIF9jYXNlc0NvbXBvbmVudDIuZGVmYXVsdCwge1xuICAgIGxvY2FsZTogbG9jYWxlXG4gIH0sIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgLy8gVGhlIGNvbXBvbmVudCBpcyByZWFkeS5cbiAgfSk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgb25sb2FkKTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBvbmxvYWQpOyIsIi8qKlxuICogQ29tcG9uZW50IG9mIGNhc2VzLlxuICpcbiAqIEdlbmVyYXRlZCBieSBjb3ogb24gNi85LzIwMTYsXG4gKiBmcm9tIGEgdGVtcGxhdGUgcHJvdmlkZWQgYnkgYXBlbWFuLWJ1ZC1tb2NrLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9oZWFkZXIgPSByZXF1aXJlKCcuL2ZyYWdtZW50cy9oZWFkZXInKTtcblxudmFyIF9oZWFkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVhZGVyKTtcblxudmFyIF9zaG93Y2FzZV92aWV3ID0gcmVxdWlyZSgnLi92aWV3cy9zaG93Y2FzZV92aWV3Jyk7XG5cbnZhciBfc2hvd2Nhc2VfdmlldzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zaG93Y2FzZV92aWV3KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENhc2VzQ29tcG9uZW50ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdDYXNlc0NvbXBvbmVudCcsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFja2VyOiBuZXcgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2suU3RhY2tlcih7XG4gICAgICAgIHJvb3Q6IF9zaG93Y2FzZV92aWV3Mi5kZWZhdWx0LFxuICAgICAgICByb290UHJvcHM6IHt9XG4gICAgICB9KVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgcy5yZWdpc3RlckxvY2FsZShwcm9wcy5sb2NhbGUpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFBhZ2UsXG4gICAgICBudWxsLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2hlYWRlcjIuZGVmYXVsdCwgeyB0YWI6ICdDQVNFUycgfSksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBNYWluLFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjaywgeyBzdGFja2VyOiBwcm9wcy5zdGFja2VyIH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENhc2VzQ29tcG9uZW50OyIsIm1vZHVsZS5leHBvcnRzPVtcbiAge1xuICAgIFwibmFtZVwiOiBcInJlbW90ZS1wbGVuXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX1JFTU9URV9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9SRU1PVEVfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9TVUdPU19yZW1vdGVfUExFTi5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMTYwLFxuICAgICAgICBcImR5XCI6IDUuNixcbiAgICAgICAgXCJ3aWR0aFwiOiAxNTIuOVxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAxMS42LFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwicHJlc2V0LWRyb25lXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0RST05FX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0RST05FX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvYXJkcm9uZS5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAzLFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxNjAsXG4gICAgICAgIFwiZHlcIjogNS42LFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwia2luZWN0LWFuYWx5c2lzXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX1NFTlNFX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX1NFTlNFX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvU1VHT1NfcmVtb3RlX3NlbnNvci5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMTYwLFxuICAgICAgICBcImR5XCI6IDMsXG4gICAgICAgIFwid2lkdGhcIjogMTUyLjlcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMTEuNixcbiAgICAgICAgXCJ3aWR0aFwiOiAxNTIuOVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcInNwZWVjaC1wZXBwZXJcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfU1BFRUNIX1JFQ09HTklUSU9OX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX1NQRUVDSF9SRUNPR05JVElPTl9URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL3BlcHBlcl9zcGVlY2hfcmVjb2duaXRpb24ubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMCxcbiAgICAgICAgXCJ3aWR0aFwiOiAxMDAuOFxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMTgyLjksXG4gICAgICAgIFwiZHlcIjogMTUuNCxcbiAgICAgICAgXCJ3aWR0aFwiOiAxMzUuM1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcInRleHQtaW5wdXRcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfVEVYVF9JTlBVVF9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9URVhUX0lOUFVUX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvcGVwcGVyX3RleHRfaW5wdXQubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDE2NC45LFxuICAgICAgICBcImR5XCI6IDExLjIsXG4gICAgICAgIFwid2lkdGhcIjogMTQ4XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAzMi42LFxuICAgICAgICBcImR5XCI6IDEwLjUsXG4gICAgICAgIFwid2lkdGhcIjogOTIuOVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImVkaXNvbl9yb29tYmFcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfRURJU09OX1JPT01CQV9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9FRElTT05fUk9PTUJBX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvZWRpc29uX3Jvb21iYS5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMTIuNyxcbiAgICAgICAgXCJkeVwiOiAxNC4yLFxuICAgICAgICBcIndpZHRoXCI6IDEyNC44XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxNjEuOSxcbiAgICAgICAgXCJkeVwiOiAxMS4yLFxuICAgICAgICBcIndpZHRoXCI6IDE0OFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImVkaXNvbi1zdHJlYW1cIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfRURJU09OX1NUUkVBTV9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9FRElTT05fU1RSRUFNX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MveWFiZWUtc3RyZWFtLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxNjMsXG4gICAgICAgIFwiZHlcIjogMTEuMixcbiAgICAgICAgXCJ3aWR0aFwiOiAxNDhcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMjEuNixcbiAgICAgICAgXCJ3aWR0aFwiOiAxNTIuOVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImN1cmwtcmFwaXJvXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0NVUkxfUkFQSVJPX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0NVUkxfUkFQSVJPX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvY3VybF9yYXBpcm8ubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDE2OSxcbiAgICAgICAgXCJkeVwiOiAxOS45LFxuICAgICAgICBcIndpZHRoXCI6IDE0NS40XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiA0LjksXG4gICAgICAgIFwiZHlcIjogMTEuMixcbiAgICAgICAgXCJ3aWR0aFwiOiAxNDhcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJoaXRvZS1tYXBcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfSElUT0VfVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfSElUT0VfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9oaXRvZS1tYXAubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDI5LjYsXG4gICAgICAgIFwiZHlcIjogMjMuMixcbiAgICAgICAgXCJ3aWR0aFwiOiAxMDIuM1xuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMTY3LjEsXG4gICAgICAgIFwiZHlcIjogNS42LFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwiZ3lyby1wZXBwZXJcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfR1lST19USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9HWVJPX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvZ3lyby1wZXBwZXIubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMCxcbiAgICAgICAgXCJ3aWR0aFwiOiAxNTIuOVxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMTY3LjEsXG4gICAgICAgIFwiZHlcIjogMS4xLFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9XG4gICAgfVxuICB9XG5dXG4iLCIvKipcbiAqIEhlYWRlciBjb21wb25lbnRcbiAqIEBjbGFzcyBIZWFkZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2xvZ28gPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvbG9nbycpO1xuXG52YXIgX2xvZ28yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9nbyk7XG5cbnZhciBfbGlua19zZXJ2aWNlID0gcmVxdWlyZSgnLi4vLi4vc2VydmljZXMvbGlua19zZXJ2aWNlJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKiBAbGVuZHMgSGVhZGVyICovXG52YXIgSGVhZGVyID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdIZWFkZXInLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHRhYjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhYjogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgdGFiID0gcHJvcHMudGFiO1xuXG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHZhciBfdGFiSXRlbSA9IF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyVGFiSXRlbS5jcmVhdGVJdGVtO1xuICAgIHZhciBfbGluayA9IGZ1bmN0aW9uIF9saW5rKCkge1xuICAgICAgcmV0dXJuIF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLnJlc29sdmVIdG1sTGluay5hcHBseShfbGlua19zZXJ2aWNlLnNpbmdsZXRvbiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyLFxuICAgICAgeyBjbGFzc05hbWU6ICdoZWFkZXInIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBDb250YWluZXIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyTG9nbyxcbiAgICAgICAgICB7IGhyZWY6IF9saW5rKCdpbmRleC5odG1sJykgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbG9nbzIuZGVmYXVsdCwgbnVsbClcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5ET0NTX1BBR0UnKSwgX2xpbmsoJ2RvY3MuaHRtbCcpLCB7IHNlbGVjdGVkOiB0YWIgPT09ICdET0NTJyB9KSxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5DQVNFU19QQUdFJyksIF9saW5rKCdjYXNlcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0NBU0VTJyB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEhlYWRlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9jbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgX2NsYXNzbmFtZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2xhc3NuYW1lcyk7XG5cbnZhciBfY29sb3JfY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cy5qc29uJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBKb2luZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0pvaW5lcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgY29sb3I6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIGxpbmVXaWR0aDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBfY29sb3JfY29uc3RhbnRzLkRPTUlOQU5ULFxuICAgICAgbGluZVdpZHRoOiA0XG4gICAgfTtcbiAgfSxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMYXlvdXRNaXhpbiwgX2FwZW1hblJlYWN0TWl4aW5zLkFwUHVyZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG4gICAgdmFyIGxheW91dHMgPSBzLmxheW91dHM7XG4gICAgdmFyIGNvbG9yID0gcHJvcHMuY29sb3I7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHByb3BzLmxpbmVXaWR0aDtcbiAgICB2YXIgX2xheW91dHMkc3ZnID0gbGF5b3V0cy5zdmc7XG4gICAgdmFyIHdpZHRoID0gX2xheW91dHMkc3ZnLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSBfbGF5b3V0cyRzdmcuaGVpZ2h0O1xuICAgIHZhciBtaW5YID0gMDtcbiAgICB2YXIgbWlkWCA9IHdpZHRoIC8gMjtcbiAgICB2YXIgbWF4WCA9IHdpZHRoO1xuICAgIHZhciBtaW5ZID0gMDtcbiAgICB2YXIgbWlkWSA9IGhlaWdodCAvIDI7XG4gICAgdmFyIG1heFkgPSBoZWlnaHQ7XG5cbiAgICB2YXIgX2xpbmUgPSBmdW5jdGlvbiBfbGluZSh4MSwgeDIsIHkxLCB5Mikge1xuICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdsaW5lJywgeyB4MTogeDEsIHgyOiB4MiwgeTE6IHkxLCB5MjogeTIgfSk7XG4gICAgfTtcblxuICAgIHZhciB4VGlsdCA9IDAuMTtcbiAgICB2YXIgeVRpbHQgPSAwLjM7XG5cbiAgICB2YXIgeDEgPSBtaW5YO1xuICAgIHZhciB4MiA9IG1pZFggKiAoMSArIHhUaWx0KTtcbiAgICB2YXIgeDMgPSBtaWRYICogKDEgLSB4VGlsdCk7XG4gICAgdmFyIHg0ID0gbWF4WDtcbiAgICB2YXIgeTEgPSBtaWRZO1xuICAgIHZhciB5MiA9IG1pZFkgKiAoMSAtIHlUaWx0KTtcbiAgICB2YXIgeTMgPSBtaWRZICogKDEgKyB5VGlsdCk7XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgY2xhc3NOYW1lOiAoMCwgX2NsYXNzbmFtZXMyLmRlZmF1bHQpKCdqb2luZXInLCBwcm9wcy5jbGFzc05hbWUpLFxuICAgICAgICByZWY6IGZ1bmN0aW9uIHJlZihqb2luZXIpIHtcbiAgICAgICAgICBzLmpvaW5lciA9IGpvaW5lcjtcbiAgICAgICAgfSB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdzdmcnLFxuICAgICAgICB7IHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICBzdHJva2U6IGNvbG9yLFxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA6ICdyb3VuZCcsXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IGxpbmVXaWR0aFxuICAgICAgICB9LFxuICAgICAgICBfbGluZSh4MSwgeDIsIHkxLCB5MiksXG4gICAgICAgIF9saW5lKHgyLCB4MywgeTIsIHkzKSxcbiAgICAgICAgX2xpbmUoeDMsIHg0LCB5MywgeTEpXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEZvciBBcExheW91dE1peGluXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEluaXRpYWxMYXlvdXRzOiBmdW5jdGlvbiBnZXRJbml0aWFsTGF5b3V0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3ZnOiB7IHdpZHRoOiAxMDAsIGhlaWdodDogNDAgfVxuICAgIH07XG4gIH0sXG4gIGNhbGNMYXlvdXRzOiBmdW5jdGlvbiBjYWxjTGF5b3V0cygpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIGpvaW5lciA9IHMuam9pbmVyO1xuXG4gICAgaWYgKCFqb2luZXIpIHtcbiAgICAgIHJldHVybiBzLmdldEluaXRpYWxMYXlvdXRzKCk7XG4gICAgfVxuXG4gICAgdmFyIF9qb2luZXIkZ2V0Qm91bmRpbmdDbCA9IGpvaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIHZhciB3aWR0aCA9IF9qb2luZXIkZ2V0Qm91bmRpbmdDbC53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gX2pvaW5lciRnZXRCb3VuZGluZ0NsLmhlaWdodDtcblxuICAgIHJldHVybiB7XG4gICAgICBzdmc6IHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9XG4gICAgfTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEpvaW5lcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIExvZ28gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0xvZ28nLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnaDEnLFxuICAgICAgeyBjbGFzc05hbWU6ICdsb2dvJyB9LFxuICAgICAgbCgnbG9nby5MT0dPJylcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9nbzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9zZ1JlYWN0Q29tcG9uZW50cyA9IHJlcXVpcmUoJ3NnLXJlYWN0LWNvbXBvbmVudHMnKTtcblxudmFyIF9jbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgX2NsYXNzbmFtZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2xhc3NuYW1lcyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBWaWRlbyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnVmlkZW8nLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcFRvdWNoTWl4aW5dLFxuICBwcm9wVHlwZXM6IHtcbiAgICBzcmM6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVk6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgY2xhc3NOYW1lOiAoMCwgX2NsYXNzbmFtZXMyLmRlZmF1bHQpKCd2aWRlbycsIHByb3BzLmNsYXNzTmFtZSkgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnZGl2JyxcbiAgICAgICAgeyBjbGFzc05hbWU6ICd2aWRlby1pbm5lcicgfSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3NnUmVhY3RDb21wb25lbnRzLlNnVmlkZW8sIHsgc3JjOiBwcm9wcy5zcmMsXG4gICAgICAgICAgcGxheWVyUmVmOiBmdW5jdGlvbiBwbGF5ZXJSZWYocGxheWVyKSB7XG4gICAgICAgICAgICByZXR1cm4gcy5fcGxheWVyID0gcGxheWVyO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaGlkZGVuOiB0cnVlLFxuICAgICAgICAgIG11dGVkOiB0cnVlLFxuICAgICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgfSlcbiAgICAgICksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICd2aWRlby1vdmVybGF5JyB9KVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBWaWRlbzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9jbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgX2NsYXNzbmFtZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2xhc3NuYW1lcyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBWaWRlb0NhbnZhcyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnVmlkZW9DYW52YXMnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgd2lkdGg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWTogX3JlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiAxNDgsXG4gICAgICBoZWlnaHQ6IDE0OFxuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2RpdicsXG4gICAgICB7IGNsYXNzTmFtZTogKDAsIF9jbGFzc25hbWVzMi5kZWZhdWx0KSgndmlkZW8tY2FudmFzJywgcHJvcHMuY2xhc3NOYW1lKSB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdkaXYnLFxuICAgICAgICB7IGNsYXNzTmFtZTogJ3ZpZGVvLWNhbnZhcy1pbm5lcicgfSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycsIHsgd2lkdGg6IHByb3BzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogcHJvcHMuaGVpZ2h0LFxuICAgICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuIHMuX2NhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAndmlkZW8tY2FudmFzLW92ZXJsYXknIH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFZpZGVvQ2FudmFzOyIsIi8qKlxuICogVmlldyBmb3Igc2hvd2Nhc2VcbiAqIEBjbGFzcyBTaG93Y2FzZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfdmlkZW8gPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvdmlkZW8nKTtcblxudmFyIF92aWRlbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF92aWRlbyk7XG5cbnZhciBfdmlkZW9fY2FudmFzID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL3ZpZGVvX2NhbnZhcycpO1xuXG52YXIgX3ZpZGVvX2NhbnZhczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF92aWRlb19jYW52YXMpO1xuXG52YXIgX2pvaW5lciA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9qb2luZXInKTtcblxudmFyIF9qb2luZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfam9pbmVyKTtcblxudmFyIF9jb2xvcl9jb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3NnOmNvbXBvbmVudDpzaG93Y2FzZScpO1xuXG52YXIgQVJUSUNMRVMgPSByZXF1aXJlKCcuLi9kYXRhL2FydGljbGVzLmpzb24nKTtcblxudmFyIFNob3djYXNlVmlldyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnU2hvd2Nhc2VWaWV3JyxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGRlYnVnKCdyZW5kZXIgY2FsbGVkLicpO1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF9zZWN0aW9uID0gcy5fcmVuZGVyU2VjdGlvbjtcbiAgICAvLyDplovnmbrkuK3jga4gc2VjdGlvbiDjga7mjL/lhaXjg7vlhaXjgozmm7/jgYjjgpLlrrnmmJPjgavjgZnjgovjgZ/jgoFcbiAgICB2YXIgZmlyc3QgPSB0cnVlO1xuICAgIHZhciByZXZlcnNlZCA9IGZ1bmN0aW9uIHJldmVyc2VkKCkge1xuICAgICAgZmlyc3QgPSAhZmlyc3Q7XG4gICAgICByZXR1cm4gZmlyc3Q7XG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXcsXG4gICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZXcnLFxuICAgICAgICBzcGlubmluZzogIXMubW91bnRlZCxcbiAgICAgICAgb25TY3JvbGw6IHMuX2hhbmRsZVNjcm9sbFxuICAgICAgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0hlYWRlciwgeyB0aXRsZVRleHQ6IGwoJ3RpdGxlcy5TSE9XQ0FTRV9USVRMRScpIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0JvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdhcnRpY2xlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIEFSVElDTEVTLm1hcChmdW5jdGlvbiAoYXJ0aWNsZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZWN0aW9uKGFydGljbGUubmFtZSwgYXJ0aWNsZS5ib2R5LCByZXZlcnNlZCgpKTtcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIExpZmVDeWNsZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgLy8gZGVmaW5lcyBtb3VudGVkIHZhbHVlXG4gICAgcy5tb3VudGVkID0gdHJ1ZTtcblxuICAgIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gICAgcy5pc0lQaG9uZSA9IC8oaVBob25lfGlQb2QpLy50ZXN0KHVhKTtcblxuICAgIC8vIGRlZmluZXMgdGhpcy52aWRlb3NcbiAgICB2YXIgdmlkZW9zID0gQVJUSUNMRVMubWFwKGZ1bmN0aW9uIChhcnRpY2xlLCBpKSB7XG4gICAgICB2YXIgbmFtZSA9IGFydGljbGUubmFtZTtcblxuICAgICAgdmFyIHZpZGVvID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBpblNjcmVlbjogdHJ1ZSxcbiAgICAgICAgY29udGFpbmVyOiBzLl92aWRlb0NvbnRhaW5lcnNbbmFtZV0sXG4gICAgICAgIHBsYXllcjoge1xuICAgICAgICAgIGVsZW1lbnQ6IHMuX3BsYXllcnNbbmFtZV0uX3BsYXllcixcbiAgICAgICAgICBjYW5QbGF5OiBmYWxzZSxcbiAgICAgICAgICAvLyDlhYjpoK3jga7li5XnlLsy44Gk44Gg44GR6Ieq5YuV5YaN55SfXG4gICAgICAgICAgb25DYW5QbGF5OiBpIDw9IDEgPyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2aWRlby5wbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgICAgICBkZWJ1ZygnY2FuUGxheSAnICsgbmFtZSk7XG4gICAgICAgICAgICBzLl9wbGF5KHZpZGVvKTtcbiAgICAgICAgICB9IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmlkZW8ucGxheWVyLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICAgICAgZGVidWcoJ2NhblBsYXkgJyArIG5hbWUpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcGxheWluZzogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgY2FudmFzMTogcy5fY2FudmFzZXNbbmFtZV0uY2FudmFzMSxcbiAgICAgICAgY2FudmFzMjogcy5fY2FudmFzZXNbbmFtZV0uY2FudmFzMlxuICAgICAgfTtcbiAgICAgIHJldHVybiB2aWRlbztcbiAgICB9KTtcblxuICAgIHZpZGVvcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgdmFyIHBsYXllciA9IHZpZGVvLnBsYXllcjtcblxuICAgICAgcGxheWVyLmVsZW1lbnQubG9hZCgpO1xuICAgICAgcGxheWVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBwbGF5ZXIub25DYW5QbGF5LCBmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBzLnZpZGVvcyA9IHZpZGVvcztcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICBzLnZpZGVvcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgcy5fcGF1c2UodmlkZW8pO1xuICAgICAgdmFyIHBsYXllciA9IHZpZGVvLnBsYXllcjtcblxuICAgICAgcGxheWVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0bmVyKCdjYW5wbGF5dGhyb3VnaCcsIHBsYXllci5vbkNhblBsYXksIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDdXN0b21cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICBtb3VudGVkOiBmYWxzZSxcbiAgaXNJUGhvbmU6IGZhbHNlLFxuICB2aWRlb3M6IFtdLFxuICBfdmlkZW9Db250YWluZXJzOiB7fSxcbiAgX3BsYXllcnM6IHt9LFxuICBfY2FudmFzZXM6IHt9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFByaXZhdGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfcmVuZGVyU2VjdGlvbjogZnVuY3Rpb24gX3JlbmRlclNlY3Rpb24obmFtZSwgY29uZmlnLCByZXZlcnNlZCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIHRpdGxlID0gY29uZmlnLnRpdGxlO1xuICAgIHZhciB0ZXh0ID0gY29uZmlnLnRleHQ7XG4gICAgdmFyIHZpZGVvID0gY29uZmlnLnZpZGVvO1xuICAgIHZhciBjYW52YXMxID0gY29uZmlnLmNhbnZhczE7XG4gICAgdmFyIGNhbnZhczIgPSBjb25maWcuY2FudmFzMjtcblxuICAgIHMuX2NhbnZhc2VzW25hbWVdID0ge307IC8vIEVycm9yIOWbnumBv1xuICAgIHZhciByZWZzID0ge1xuICAgICAgY29udGFpbmVyOiBmdW5jdGlvbiBjb250YWluZXIoYykge1xuICAgICAgICBzLl92aWRlb0NvbnRhaW5lcnNbbmFtZV0gPSBjO1xuICAgICAgfSxcbiAgICAgIHZpZGVvOiBmdW5jdGlvbiB2aWRlbyhjKSB7XG4gICAgICAgIHMuX3BsYXllcnNbbmFtZV0gPSBjO1xuICAgICAgfSxcbiAgICAgIGNhbnZhczogZnVuY3Rpb24gY2FudmFzKG50aCkge1xuICAgICAgICB2YXIgY2FudmFzTmFtZSA9ICdjYW52YXMnICsgbnRoO1xuICAgICAgICB2YXIgY2FudmFzQ29uZiA9IG50aCA9PT0gMSA/IGNhbnZhczEgOiBjYW52YXMyO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICBzLl9jYW52YXNlc1tuYW1lXVtjYW52YXNOYW1lXSA9IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgICBkeDogY2FudmFzQ29uZi5keCxcbiAgICAgICAgICAgIGR5OiBjYW52YXNDb25mLmR5LFxuICAgICAgICAgICAgd2lkdGg6IGNhbnZhc0NvbmYud2lkdGgsXG4gICAgICAgICAgICBhbmltYXRpb25JZDogMCxcbiAgICAgICAgICAgIGN0aW1lOiAwLFxuICAgICAgICAgICAgbGFzdFRpbWU6IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uLFxuICAgICAgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS1zZWN0aW9uJyxcbiAgICAgICAgaWQ6ICdzaG93Y2FzZS0nICsgbmFtZSArICctc2VjdGlvbicsXG4gICAgICAgIGtleTogbmFtZSB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbkhlYWRlcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgbCgnc2VjdGlvbnMuJyArIHRpdGxlKVxuICAgICAgKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25Cb2R5LFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXRleHQtY29udGFpbmVyJyB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLWRlc2NyaXB0aW9uJyB9LFxuICAgICAgICAgICAgW10uY29uY2F0KGwoJ3NlY3Rpb25zLicgKyB0ZXh0KSkubWFwKGZ1bmN0aW9uICh0ZXh0LCBpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAncCcsXG4gICAgICAgICAgICAgICAgeyBrZXk6IGkgfSxcbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS12aWRlby1jb250YWluZXInLCByZWY6IHJlZnMuY29udGFpbmVyIH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3ZpZGVvMi5kZWZhdWx0LCB7IHNyYzogdmlkZW8sIHJlZjogcmVmcy52aWRlbyB9KSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfdmlkZW9fY2FudmFzMi5kZWZhdWx0LCB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZGVvJywgcmVmOiByZWZzLmNhbnZhcygxKSB9KSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfam9pbmVyMi5kZWZhdWx0LCB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLWpvaW5lcicsIGNvbG9yOiByZXZlcnNlZCA/IF9jb2xvcl9jb25zdGFudHMuRE9NSU5BTlQgOiAnd2hpdGUnIH0pLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF92aWRlb19jYW52YXMyLmRlZmF1bHQsIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8nLCByZWY6IHJlZnMuY2FudmFzKDIpIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuICBfdXBkYXRlSW5TY3JlZW46IGZ1bmN0aW9uIF91cGRhdGVJblNjcmVlbihjbGllbnRIZWlnaHQpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgcy52aWRlb3MuZm9yRWFjaChmdW5jdGlvbiAodmlkZW8sIGkpIHtcbiAgICAgIHZhciB0b3AgPSB2aWRlby5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xuICAgICAgdmFyIG5leHRJblNjcmVlbiA9IGNsaWVudEhlaWdodCAtIHRvcCA+IDAgJiYgdG9wID4gMDtcbiAgICAgIHZhciBwcmV2SW5TY3JlZW4gPSB2aWRlby5pblNjcmVlbjtcbiAgICAgIGlmIChuZXh0SW5TY3JlZW4gPT09IHByZXZJblNjcmVlbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2aWRlby5pblNjcmVlbiA9IG5leHRJblNjcmVlbjtcbiAgICAgIGlmICh2aWRlby5pblNjcmVlbikge1xuICAgICAgICBzLl9wbGF5KHZpZGVvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMuX3BhdXNlKHZpZGVvKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3BsYXk6IGZ1bmN0aW9uIF9wbGF5KHZpZGVvLCBmb3JjZSkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcGxheWVyID0gdmlkZW8ucGxheWVyO1xuXG4gICAgaWYgKCFmb3JjZSAmJiAoIXBsYXllci5jYW5QbGF5IHx8IHBsYXllci5wbGF5aW5nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkZWJ1ZygncGxheSAnICsgdmlkZW8ubmFtZSk7XG5cbiAgICBwbGF5ZXIucGxheWluZyA9IHRydWU7XG4gICAgdmFyIHBsYXkgPSBzLmlzSVBob25lID8gcy5fcGxheU9uSVBob25lIDogcy5fcGxheU9uUGM7XG4gICAgdmFyIHBsYXllckVsZW1lbnQgPSB2aWRlby5wbGF5ZXIuZWxlbWVudDtcbiAgICB2YXIgY2FudmFzMSA9IHZpZGVvLmNhbnZhczE7XG4gICAgdmFyIGNhbnZhczIgPSB2aWRlby5jYW52YXMyO1xuXG5cbiAgICBwbGF5KGNhbnZhczEsIHBsYXllckVsZW1lbnQpO1xuICAgIHBsYXkoY2FudmFzMiwgcGxheWVyRWxlbWVudCk7XG4gIH0sXG4gIF9wbGF5T25QYzogZnVuY3Rpb24gX3BsYXlPblBjKGNhbnZhcywgcGxheWVyRWxlbWVudCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgY3R4ID0gY2FudmFzLmVsZW1lbnQuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciBsb29wID0gZnVuY3Rpb24gbG9vcCgpIHtcbiAgICAgIHMuX2RyYXcocGxheWVyRWxlbWVudCwgY2FudmFzLCBjdHgpO1xuICAgICAgY2FudmFzLmFuaW1hdGlvbklkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICB9O1xuXG4gICAgcGxheWVyRWxlbWVudC5wbGF5KCk7XG4gICAgcy5fc3RhcnRBbmltYXRpb25GcmFtZShjYW52YXMsIGxvb3ApO1xuICB9LFxuICBfcGxheU9uSVBob25lOiBmdW5jdGlvbiBfcGxheU9uSVBob25lKGNhbnZhcywgcGxheWVyRWxlbWVudCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgY3R4ID0gY2FudmFzLmVsZW1lbnQuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNhbnZhcy5sYXN0VGltZSA9IERhdGUubm93KCk7XG4gICAgdmFyIGxvb3AgPSBmdW5jdGlvbiBsb29wKHRpbWVzdGFtcCkge1xuICAgICAgdmFyIGRpZmYgPSBEYXRlLm5vdygpIC0gY2FudmFzLmxhc3RUaW1lO1xuICAgICAgY2FudmFzLmxhc3RUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIGNhbnZhcy5jdGltZSArPSBkaWZmIC8gMTAwMDtcbiAgICAgIHBsYXllckVsZW1lbnQuY3VycmVudFRpbWUgPSBjYW52YXMuY3RpbWU7XG4gICAgICBzLl9kcmF3KHBsYXllckVsZW1lbnQsIGNhbnZhcywgY3R4KTtcbiAgICAgIGlmIChwbGF5ZXJFbGVtZW50LmR1cmF0aW9uIDw9IHBsYXllckVsZW1lbnQuY3VycmVudFRpbWUpIHtcbiAgICAgICAgY2FudmFzLmN0aW1lID0gMDtcbiAgICAgIH1cbiAgICAgIGNhbnZhcy5hbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgfTtcblxuICAgIHMuX3N0YXJ0QW5pbWF0aW9uRnJhbWUoY2FudmFzLCBsb29wKTtcbiAgfSxcbiAgX3N0YXJ0QW5pbWF0aW9uRnJhbWU6IGZ1bmN0aW9uIF9zdGFydEFuaW1hdGlvbkZyYW1lKGNhbnZhcywgbG9vcCkge1xuICAgIGNhbnZhcy5hbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gIH0sXG4gIF9kcmF3OiBmdW5jdGlvbiBfZHJhdyhwbGF5ZXJFbGVtZW50LCBjYW52YXMsIGN0eCkge1xuICAgIGN0eC5kcmF3SW1hZ2UocGxheWVyRWxlbWVudCwgY2FudmFzLmR4LCBjYW52YXMuZHksIGNhbnZhcy53aWR0aCwgY2FudmFzLndpZHRoLCAwLCAwLCAxNDgsIDE0OCk7XG4gIH0sXG4gIF9wYXVzZTogZnVuY3Rpb24gX3BhdXNlKHZpZGVvKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwbGF5ZXIgPSB2aWRlby5wbGF5ZXI7XG4gICAgdmFyIGNhbnZhczEgPSB2aWRlby5jYW52YXMxO1xuICAgIHZhciBjYW52YXMyID0gdmlkZW8uY2FudmFzMjtcblxuICAgIGRlYnVnKCdwYXVzZSAnICsgdmlkZW8ubmFtZSArICcgaWQgJyArIGNhbnZhczEuYW5pbWF0aW9uSWQgKyAnICcgKyBjYW52YXMyLmFuaW1hdGlvbklkKTtcbiAgICBwbGF5ZXIucGxheWluZyA9IGZhbHNlO1xuICAgIGlmICghcy5pc0lQaG9uZSkge1xuICAgICAgcGxheWVyLmVsZW1lbnQucGF1c2UoKTtcbiAgICB9XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGNhbnZhczEuYW5pbWF0aW9uSWQpO1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShjYW52YXMyLmFuaW1hdGlvbklkKTtcbiAgfSxcbiAgX2hhbmRsZVNjcm9sbDogZnVuY3Rpb24gX2hhbmRsZVNjcm9sbChldmVudCkge1xuICAgIHZhciBjbGllbnRIZWlnaHQgPSBldmVudC50YXJnZXQuY2xpZW50SGVpZ2h0O1xuXG4gICAgdGhpcy5fdXBkYXRlSW5TY3JlZW4oY2xpZW50SGVpZ2h0KTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvd2Nhc2VWaWV3OyIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJET01JTkFOVFwiOiBcIiNkNmI4MTBcIlxufSIsIi8qKlxuICogQGNsYXNzIExpbmtTZXJ2aWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8qKiBAbGVuZHMgTGlua1NlcnZpY2UgKi9cblxudmFyIExpbmtTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBMaW5rU2VydmljZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGlua1NlcnZpY2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKExpbmtTZXJ2aWNlLCBbe1xuICAgIGtleTogJ3Jlc29sdmVIdG1sTGluaycsXG5cblxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgYSBodG1sIGxpbmtcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgLSBIdG1sIGZpbGUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gUmVzb2x2ZWQgZmlsZSBuYW1lXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVIdG1sTGluayhmaWxlbmFtZSkge1xuICAgICAgdmFyIHMgPSB0aGlzO1xuICAgICAgdmFyIGxhbmcgPSBzLl9nZXRMYW5nKCk7XG4gICAgICB2YXIgaHRtbERpciA9IGxhbmcgPyAnaHRtbC8nICsgbGFuZyA6ICdodG1sJztcbiAgICAgIHJldHVybiBwYXRoLmpvaW4oaHRtbERpciwgZmlsZW5hbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19nZXRMYW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2dldExhbmcoKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LkxBTkc7XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93Lmxhbmc7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIExpbmtTZXJ2aWNlO1xufSgpO1xuXG52YXIgc2luZ2xldG9uID0gbmV3IExpbmtTZXJ2aWNlKCk7XG5cbk9iamVjdC5hc3NpZ24oTGlua1NlcnZpY2UsIHtcbiAgc2luZ2xldG9uOiBzaW5nbGV0b25cbn0pO1xuXG5leHBvcnRzLnNpbmdsZXRvbiA9IHNpbmdsZXRvbjtcbmV4cG9ydHMuZGVmYXVsdCA9IExpbmtTZXJ2aWNlOyJdfQ==
