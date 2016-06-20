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
},{"./fragments/header":6,"./views/showcase_view":11,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],5:[function(require,module,exports){
module.exports=[
  {
    "name": "remote-plen",
    "body": {
      "title": "CASE_REMOTE_TITLE",
      "text": "CASE_REMOTE_TEXT",
      "video": "videos/SUGOS_remote_PLEN.mp4",
      "canvas1": {
        "dx": 0,
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dx": 0,
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dx": 0,
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dx": 0,
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dx": 0,
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dx": 0,
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dx": 0,
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
        "dy": 0
      },
      "canvas2": {
        "dx": 0,
        "dy": 0
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
    var translateX = props.translateX;
    var translateY = props.translateY;

    var style = {
      transform: 'translate(' + translateX + 'px, ' + translateY + 'px)',
      position: 'absolute', // 消せ
      top: '400px'
    };
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
          playerRef: function playerRef(player) {
            return s._player = player;
          },
          autoPlay: true,
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

var articles = require('../data/articles.json');

var ShowcaseView = _react2.default.createClass({
  displayName: 'ShowcaseView',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  getInitialState: function getInitialState() {
    return { videos: {} };
  },
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
          articles.map(function (article) {
            return _section(article.name, article.body, reversed);
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

    // defines requeatAnimation functions
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

    // defines this.videos
    var videos = articles.map(function (article) {
      var name = article.name;

      var video = {
        name: name,
        inScreen: true,
        container: s._videoContainers[name],
        player: {
          element: s._players[name]._player,
          canPlay: false,
          onCanPlay: function onCanPlay() {
            video.player.canPlay = true;
            debug('canPlay ' + name);
          }
        },
        canvas1: s._canvases[name].canvas1,
        canvas2: s._canvases[name].canvas2
      };
      return video;
    });
    videos.forEach(function (video) {
      video.player.element.addEventListener('canplaythrough', video.player.onCanPlay, false);
    });
    s.videos = videos;
  },
  componentWillUnmount: function componentWillUnmount() {
    this.videos.forEach(function (video) {
      window.cancelAnimationFrame(video.animationId1);
      window.cancelAnimationFrame(video.animationId2);
      var player = video.player;

      player.element.removeEventListner('canplaythrough', player.onCanPlay, false);
    });
  },

  // -----------------
  // Custom
  // -----------------

  mounted: false,
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
    var _canvas = config.canvas1;
    var _canvas2 = config.canvas2;

    s._canvases[name] = {}; // Error 回避
    var refs = {
      container: function container(c) {
        s._videoContainers[name] = c;
      },
      video: function video(c) {
        s._players[name] = c;
      },
      canvas1: function canvas1(c) {
        s._canvases[name].canvas1 = {
          element: c,
          dx: _canvas.dx,
          dy: _canvas.dy,
          animationId: 0,
          ctime: 0,
          lastTime: 0
        };
      },
      canvas2: function canvas2(c) {
        s._canvases[name].canvas2 = {
          element: c,
          dx: _canvas2.dx,
          dy: _canvas2.dy,
          animationId: 0,
          ctime: 0,
          lastTime: 0
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
          { className: 'showcase-video-container', ref: function ref(c) {
              return s._videoContainers[name] = c;
            } },
          _react2.default.createElement(_video2.default, { src: video, ref: refs.video }),
          _react2.default.createElement(_video_canvas2.default, { className: 'showcase-video', ref: refs.canvas1 }),
          _react2.default.createElement(_joiner2.default, { className: 'showcase-joiner', color: reversed ? _color_constants.DOMINANT : 'white' }),
          _react2.default.createElement(_video_canvas2.default, { className: 'showcase-video', ref: refs.canvas2 })
        )
      )
    );
  },
  _updateInScreen: function _updateInScreen(clientHeight) {
    var s = this;
    var videos = s.videos;
    videos.forEach(function (video, i) {
      var rect = video.container.getBoundingClientRect();
      var nextInScreen = clientHeight - rect.top > 0 && rect.top > 0;
      var prevInScreen = video.inScreen;
      if (nextInScreen !== prevInScreen) {
        video.inScreen = nextInScreen;
        if (video.inScreen) {
          s._play(video);
        } else {
          s._pause(video);
        }
      }
    });
  },
  _play: function _play(video) {
    var playerElement = video.player.element;
    if (!video.player.canPlay) {
      return;
    }
    playerElement.play();
    debug('play ' + video.name);

    function play(canvas) {
      var ua = navigator.userAgent;
      var ctx = canvas.element._canvas.getContext('2d');
      var _loop2 = void 0;
      if (/(iPhone|iPod)/.test(ua)) {
        canvas.lastTime = Date.now();
        _loop2 = function loop(timestamp) {
          var diff = Date.now() - canvas.lastTime;
          canvas.lastTime = Date.now();
          canvas.ctime += diff / 1000;
          playerElement.currentTime = canvas.ctime;
          ctx.drawImage(playerElement, canvas.dx, canvas.dy);
          if (playerElement.duration <= playerElement.currentTime) {
            canvas.ctime = 0;
          }
          canvas.animationId = window.requestAnimationFrame(_loop2);
        };
      } else {
        _loop2 = function _loop() {
          ctx.drawImage(playerElement, canvas.dx, canvas.dy);
          canvas.animationId = window.requestAnimationFrame(_loop2);
        };
      }
      canvas.animationId = window.requestAnimationFrame(_loop2);
    }

    var canvas1 = video.canvas1;
    var canvas2 = video.canvas2;

    play(canvas1);
    play(canvas2);
  },
  _pause: function _pause(video) {
    if (!video.player.canPlay) {
      return;
    }
    debug('pause ' + video.name);
    video.player.element.pause();
    window.cancelAnimationFrame(video.animationId1);
    window.cancelAnimationFrame(video.animationId2);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMS4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjEuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsImxpYi9icm93c2VyL2Nhc2VzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMiLCJsaWIvY29tcG9uZW50cy9kYXRhL2FydGljbGVzLmpzb24iLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2pvaW5lci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvX2NhbnZhcy5qcyIsImxpYi9jb21wb25lbnRzL3ZpZXdzL3Nob3djYXNlX3ZpZXcuanMiLCJsaWIvY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cy5qc29uIiwibGliL3NlcnZpY2VzL2xpbmtfc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxU0E7QUFDQTtBQUNBOzs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBCcm93c2VyIHNjcmlwdCBmb3IgY2FzZXMuXG4gKlxuICogR2VuZXJhdGVkIGJ5IGNveiBvbiA2LzkvMjAxNixcbiAqIGZyb20gYSB0ZW1wbGF0ZSBwcm92aWRlZCBieSBhcGVtYW4tYnVkLW1vY2suXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9hcGVtYW5CcndzUmVhY3QgPSByZXF1aXJlKCdhcGVtYW4tYnJ3cy1yZWFjdCcpO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGVtYW5CcndzUmVhY3QpO1xuXG52YXIgX2Nhc2VzQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMnKTtcblxudmFyIF9jYXNlc0NvbXBvbmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jYXNlc0NvbXBvbmVudCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBDT05UQUlORVJfSUQgPSAnY2FzZXMtd3JhcCc7XG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3dpbmRvdyA9IHdpbmRvdztcbiAgdmFyIGxvY2FsZSA9IF93aW5kb3cubG9jYWxlO1xuXG4gIF9hcGVtYW5CcndzUmVhY3QyLmRlZmF1bHQucmVuZGVyKENPTlRBSU5FUl9JRCwgX2Nhc2VzQ29tcG9uZW50Mi5kZWZhdWx0LCB7XG4gICAgbG9jYWxlOiBsb2NhbGVcbiAgfSwgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAvLyBUaGUgY29tcG9uZW50IGlzIHJlYWR5LlxuICB9KTtcbn07IiwiLyoqXG4gKiBDb21wb25lbnQgb2YgY2FzZXMuXG4gKlxuICogR2VuZXJhdGVkIGJ5IGNveiBvbiA2LzkvMjAxNixcbiAqIGZyb20gYSB0ZW1wbGF0ZSBwcm92aWRlZCBieSBhcGVtYW4tYnVkLW1vY2suXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2hlYWRlciA9IHJlcXVpcmUoJy4vZnJhZ21lbnRzL2hlYWRlcicpO1xuXG52YXIgX2hlYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWFkZXIpO1xuXG52YXIgX3Nob3djYXNlX3ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL3Nob3djYXNlX3ZpZXcnKTtcblxudmFyIF9zaG93Y2FzZV92aWV3MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Nob3djYXNlX3ZpZXcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgQ2FzZXNDb21wb25lbnQgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0Nhc2VzQ29tcG9uZW50JyxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWNrZXI6IG5ldyBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjay5TdGFja2VyKHtcbiAgICAgICAgcm9vdDogX3Nob3djYXNlX3ZpZXcyLmRlZmF1bHQsXG4gICAgICAgIHJvb3RQcm9wczoge31cbiAgICAgIH0pXG4gICAgfTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICBzLnJlZ2lzdGVyTG9jYWxlKHByb3BzLmxvY2FsZSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwUGFnZSxcbiAgICAgIG51bGwsXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfaGVhZGVyMi5kZWZhdWx0LCB7IHRhYjogJ0NBU0VTJyB9KSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcE1haW4sXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLCB7IHN0YWNrZXI6IHByb3BzLnN0YWNrZXIgfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ2FzZXNDb21wb25lbnQ7IiwibW9kdWxlLmV4cG9ydHM9W1xuICB7XG4gICAgXCJuYW1lXCI6IFwicmVtb3RlLXBsZW5cIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfUkVNT1RFX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX1JFTU9URV9URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL1NVR09TX3JlbW90ZV9QTEVOLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDBcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcInByZXNldC1kcm9uZVwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9EUk9ORV9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9EUk9ORV9URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL2FyZHJvbmUubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAwXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwia2luZWN0LWFuYWx5c2lzXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX1NFTlNFX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX1NFTlNFX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvU1VHT1NfcmVtb3RlX3NlbnNvci5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAwXG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJzcGVlY2gtcGVwcGVyXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX1NQRUVDSF9SRUNPR05JVElPTl9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9TUEVFQ0hfUkVDT0dOSVRJT05fVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9wZXBwZXJfc3BlZWNoX3JlY29nbml0aW9uLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDBcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcInRleHQtaW5wdXRcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfVEVYVF9JTlBVVF9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9URVhUX0lOUFVUX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvcGVwcGVyX3RleHRfaW5wdXQubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAwXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwiZWRpc29uX3Jvb21iYVwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9FRElTT05fUk9PTUJBX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0VESVNPTl9ST09NQkFfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9lZGlzb25fcm9vbWJhLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDBcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImVkaXNvbi1zdHJlYW1cIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfRURJU09OX1NUUkVBTV9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9FRElTT05fU1RSRUFNX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MveWFiZWUtc3RyZWFtLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDBcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImN1cmwtcmFwaXJvXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0NVUkxfUkFQSVJPX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0NVUkxfUkFQSVJPX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvY3VybF9yYXBpcm8ubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAwXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwiaGl0b2UtbWFwXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0hJVE9FX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0hJVE9FX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvaGl0b2UtbWFwLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDBcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImd5cm8tcGVwcGVyXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0dZUk9fVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfR1lST19URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL2d5cm8tcGVwcGVyLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDBcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMFxuICAgICAgfVxuICAgIH1cbiAgfVxuXVxuIiwiLyoqXG4gKiBIZWFkZXIgY29tcG9uZW50XG4gKiBAY2xhc3MgSGVhZGVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9sb2dvID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL2xvZ28nKTtcblxudmFyIF9sb2dvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xvZ28pO1xuXG52YXIgX2xpbmtfc2VydmljZSA9IHJlcXVpcmUoJy4uLy4uL3NlcnZpY2VzL2xpbmtfc2VydmljZScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKiogQGxlbmRzIEhlYWRlciAqL1xudmFyIEhlYWRlciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnSGVhZGVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB0YWI6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0YWI6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG4gICAgdmFyIHRhYiA9IHByb3BzLnRhYjtcblxuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICB2YXIgX3RhYkl0ZW0gPSBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlclRhYkl0ZW0uY3JlYXRlSXRlbTtcbiAgICB2YXIgX2xpbmsgPSBmdW5jdGlvbiBfbGluaygpIHtcbiAgICAgIHJldHVybiBfbGlua19zZXJ2aWNlLnNpbmdsZXRvbi5yZXNvbHZlSHRtbExpbmsuYXBwbHkoX2xpbmtfc2VydmljZS5zaW5nbGV0b24sIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlcixcbiAgICAgIHsgY2xhc3NOYW1lOiAnaGVhZGVyJyB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwQ29udGFpbmVyLFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlckxvZ28sXG4gICAgICAgICAgeyBocmVmOiBfbGluaygnaW5kZXguaHRtbCcpIH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2xvZ28yLmRlZmF1bHQsIG51bGwpXG4gICAgICAgICksXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyVGFiLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3RhYkl0ZW0obCgncGFnZXMuRE9DU19QQUdFJyksIF9saW5rKCdkb2NzLmh0bWwnKSwgeyBzZWxlY3RlZDogdGFiID09PSAnRE9DUycgfSksXG4gICAgICAgICAgX3RhYkl0ZW0obCgncGFnZXMuQ0FTRVNfUEFHRScpLCBfbGluaygnY2FzZXMuaHRtbCcpLCB7IHNlbGVjdGVkOiB0YWIgPT09ICdDQVNFUycgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBIZWFkZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIF9jbGFzc25hbWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsYXNzbmFtZXMpO1xuXG52YXIgX2NvbG9yX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4uLy4uL2NvbnN0YW50cy9jb2xvcl9jb25zdGFudHMuanNvbicpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgSm9pbmVyID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdKb2luZXInLFxuXG4gIHByb3BUeXBlczoge1xuICAgIGNvbG9yOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBsaW5lV2lkdGg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2xvcjogX2NvbG9yX2NvbnN0YW50cy5ET01JTkFOVCxcbiAgICAgIGxpbmVXaWR0aDogNFxuICAgIH07XG4gIH0sXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTGF5b3V0TWl4aW4sIF9hcGVtYW5SZWFjdE1peGlucy5BcFB1cmVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciBsYXlvdXRzID0gcy5sYXlvdXRzO1xuICAgIHZhciBjb2xvciA9IHByb3BzLmNvbG9yO1xuICAgIHZhciBsaW5lV2lkdGggPSBwcm9wcy5saW5lV2lkdGg7XG4gICAgdmFyIF9sYXlvdXRzJHN2ZyA9IGxheW91dHMuc3ZnO1xuICAgIHZhciB3aWR0aCA9IF9sYXlvdXRzJHN2Zy53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gX2xheW91dHMkc3ZnLmhlaWdodDtcbiAgICB2YXIgbWluWCA9IDA7XG4gICAgdmFyIG1pZFggPSB3aWR0aCAvIDI7XG4gICAgdmFyIG1heFggPSB3aWR0aDtcbiAgICB2YXIgbWluWSA9IDA7XG4gICAgdmFyIG1pZFkgPSBoZWlnaHQgLyAyO1xuICAgIHZhciBtYXhZID0gaGVpZ2h0O1xuXG4gICAgdmFyIF9saW5lID0gZnVuY3Rpb24gX2xpbmUoeDEsIHgyLCB5MSwgeTIpIHtcbiAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnbGluZScsIHsgeDE6IHgxLCB4MjogeDIsIHkxOiB5MSwgeTI6IHkyIH0pO1xuICAgIH07XG5cbiAgICB2YXIgeFRpbHQgPSAwLjE7XG4gICAgdmFyIHlUaWx0ID0gMC4zO1xuXG4gICAgdmFyIHgxID0gbWluWDtcbiAgICB2YXIgeDIgPSBtaWRYICogKDEgKyB4VGlsdCk7XG4gICAgdmFyIHgzID0gbWlkWCAqICgxIC0geFRpbHQpO1xuICAgIHZhciB4NCA9IG1heFg7XG4gICAgdmFyIHkxID0gbWlkWTtcbiAgICB2YXIgeTIgPSBtaWRZICogKDEgLSB5VGlsdCk7XG4gICAgdmFyIHkzID0gbWlkWSAqICgxICsgeVRpbHQpO1xuXG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2RpdicsXG4gICAgICB7IGNsYXNzTmFtZTogKDAsIF9jbGFzc25hbWVzMi5kZWZhdWx0KSgnam9pbmVyJywgcHJvcHMuY2xhc3NOYW1lKSxcbiAgICAgICAgcmVmOiBmdW5jdGlvbiByZWYoam9pbmVyKSB7XG4gICAgICAgICAgcy5qb2luZXIgPSBqb2luZXI7XG4gICAgICAgIH0gfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnc3ZnJyxcbiAgICAgICAgeyB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgc3Ryb2tlOiBjb2xvcixcbiAgICAgICAgICBzdHJva2VMaW5lY2FwOiAncm91bmQnLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiBsaW5lV2lkdGhcbiAgICAgICAgfSxcbiAgICAgICAgX2xpbmUoeDEsIHgyLCB5MSwgeTIpLFxuICAgICAgICBfbGluZSh4MiwgeDMsIHkyLCB5MyksXG4gICAgICAgIF9saW5lKHgzLCB4NCwgeTMsIHkxKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBGb3IgQXBMYXlvdXRNaXhpblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRJbml0aWFsTGF5b3V0czogZnVuY3Rpb24gZ2V0SW5pdGlhbExheW91dHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN2ZzogeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDQwIH1cbiAgICB9O1xuICB9LFxuICBjYWxjTGF5b3V0czogZnVuY3Rpb24gY2FsY0xheW91dHMoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBqb2luZXIgPSBzLmpvaW5lcjtcblxuICAgIGlmICgham9pbmVyKSB7XG4gICAgICByZXR1cm4gcy5nZXRJbml0aWFsTGF5b3V0cygpO1xuICAgIH1cblxuICAgIHZhciBfam9pbmVyJGdldEJvdW5kaW5nQ2wgPSBqb2luZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB2YXIgd2lkdGggPSBfam9pbmVyJGdldEJvdW5kaW5nQ2wud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IF9qb2luZXIkZ2V0Qm91bmRpbmdDbC5oZWlnaHQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3ZnOiB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfVxuICAgIH07XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBKb2luZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBMb2dvID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdMb2dvJyxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2gxJyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnbG9nbycgfSxcbiAgICAgIGwoJ2xvZ28uTE9HTycpXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IExvZ287IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfc2dSZWFjdENvbXBvbmVudHMgPSByZXF1aXJlKCdzZy1yZWFjdC1jb21wb25lbnRzJyk7XG5cbnZhciBfY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIF9jbGFzc25hbWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsYXNzbmFtZXMpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgVmlkZW8gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1ZpZGVvJyxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBUb3VjaE1peGluXSxcbiAgcHJvcFR5cGVzOiB7XG4gICAgc3JjOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICB3aWR0aDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgaGVpZ2h0OiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICB0cmFuc2xhdGVYOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICB0cmFuc2xhdGVZOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciB0cmFuc2xhdGVYID0gcHJvcHMudHJhbnNsYXRlWDtcbiAgICB2YXIgdHJhbnNsYXRlWSA9IHByb3BzLnRyYW5zbGF0ZVk7XG5cbiAgICB2YXIgc3R5bGUgPSB7XG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHRyYW5zbGF0ZVggKyAncHgsICcgKyB0cmFuc2xhdGVZICsgJ3B4KScsXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJywgLy8g5raI44GbXG4gICAgICB0b3A6ICc0MDBweCdcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ3ZpZGVvJywgcHJvcHMuY2xhc3NOYW1lKSB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdkaXYnLFxuICAgICAgICB7IGNsYXNzTmFtZTogJ3ZpZGVvLWlubmVyJyB9LFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfc2dSZWFjdENvbXBvbmVudHMuU2dWaWRlbywgeyBzcmM6IHByb3BzLnNyYyxcbiAgICAgICAgICBzdHlsZTogc3R5bGUsXG4gICAgICAgICAgd2lkdGg6IHByb3BzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogcHJvcHMuaGVpZ2h0LFxuICAgICAgICAgIHBsYXllclJlZjogZnVuY3Rpb24gcGxheWVyUmVmKHBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuIHMuX3BsYXllciA9IHBsYXllcjtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGF1dG9QbGF5OiB0cnVlLFxuICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgICAgICBtdXRlZDogdHJ1ZSxcbiAgICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAndmlkZW8tb3ZlcmxheScgfSlcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVmlkZW87IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIF9jbGFzc25hbWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsYXNzbmFtZXMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgVmlkZW9DYW52YXMgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1ZpZGVvQ2FudmFzJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBzcmM6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVk6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogMTQ4LFxuICAgICAgaGVpZ2h0OiAxNDhcbiAgICB9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ3ZpZGVvLWNhbnZhcycsIHByb3BzLmNsYXNzTmFtZSkgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnZGl2JyxcbiAgICAgICAgeyBjbGFzc05hbWU6ICd2aWRlby1jYW52YXMtaW5uZXInIH0sXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdjYW52YXMnLCB7IHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHByb3BzLmhlaWdodCxcbiAgICAgICAgICByZWY6IGZ1bmN0aW9uIHJlZihjYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybiBzLl9jYW52YXMgPSBjYW52YXM7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogJ3ZpZGVvLWNhbnZhcy1vdmVybGF5JyB9KVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBWaWRlb0NhbnZhczsiLCIvKipcbiAqIFZpZXcgZm9yIHNob3djYXNlXG4gKiBAY2xhc3MgU2hvd2Nhc2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX3ZpZGVvID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL3ZpZGVvJyk7XG5cbnZhciBfdmlkZW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdmlkZW8pO1xuXG52YXIgX3ZpZGVvX2NhbnZhcyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy92aWRlb19jYW52YXMnKTtcblxudmFyIF92aWRlb19jYW52YXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdmlkZW9fY2FudmFzKTtcblxudmFyIF9qb2luZXIgPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvam9pbmVyJyk7XG5cbnZhciBfam9pbmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2pvaW5lcik7XG5cbnZhciBfY29sb3JfY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzZzpjb21wb25lbnQ6c2hvd2Nhc2UnKTtcblxudmFyIGFydGljbGVzID0gcmVxdWlyZSgnLi4vZGF0YS9hcnRpY2xlcy5qc29uJyk7XG5cbnZhciBTaG93Y2FzZVZpZXcgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1Nob3djYXNlVmlldycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4geyB2aWRlb3M6IHt9IH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGRlYnVnKCdyZW5kZXIgY2FsbGVkLicpO1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF9zZWN0aW9uID0gcy5fcmVuZGVyU2VjdGlvbjtcbiAgICAvLyDplovnmbrkuK3jga4gc2VjdGlvbiDjga7mjL/lhaXjg7vlhaXjgozmm7/jgYjjgpLlrrnmmJPjgavjgZnjgovjgZ/jgoFcbiAgICB2YXIgZmlyc3QgPSB0cnVlO1xuICAgIHZhciByZXZlcnNlZCA9IGZ1bmN0aW9uIHJldmVyc2VkKCkge1xuICAgICAgZmlyc3QgPSAhZmlyc3Q7XG4gICAgICByZXR1cm4gZmlyc3Q7XG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXcsXG4gICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZXcnLFxuICAgICAgICBzcGlubmluZzogIXMubW91bnRlZCxcbiAgICAgICAgb25TY3JvbGw6IHMuX2hhbmRsZVNjcm9sbFxuICAgICAgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0hlYWRlciwgeyB0aXRsZVRleHQ6IGwoJ3RpdGxlcy5TSE9XQ0FTRV9USVRMRScpIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0JvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdhcnRpY2xlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGFydGljbGVzLm1hcChmdW5jdGlvbiAoYXJ0aWNsZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZWN0aW9uKGFydGljbGUubmFtZSwgYXJ0aWNsZS5ib2R5LCByZXZlcnNlZCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBMaWZlQ3ljbGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIC8vIGRlZmluZXMgbW91bnRlZCB2YWx1ZVxuICAgIHMubW91bnRlZCA9IHRydWU7XG5cbiAgICAvLyBkZWZpbmVzIHJlcXVlYXRBbmltYXRpb24gZnVuY3Rpb25zXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGYsIDEwMDAgLyA2MCk7XG4gICAgICB9O1xuICAgIH0oKTtcblxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1vekNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm9DYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jbGVhclRpbWVvdXQoaWQpO1xuICAgICAgfTtcbiAgICB9KCk7XG5cbiAgICAvLyBkZWZpbmVzIHRoaXMudmlkZW9zXG4gICAgdmFyIHZpZGVvcyA9IGFydGljbGVzLm1hcChmdW5jdGlvbiAoYXJ0aWNsZSkge1xuICAgICAgdmFyIG5hbWUgPSBhcnRpY2xlLm5hbWU7XG5cbiAgICAgIHZhciB2aWRlbyA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgaW5TY3JlZW46IHRydWUsXG4gICAgICAgIGNvbnRhaW5lcjogcy5fdmlkZW9Db250YWluZXJzW25hbWVdLFxuICAgICAgICBwbGF5ZXI6IHtcbiAgICAgICAgICBlbGVtZW50OiBzLl9wbGF5ZXJzW25hbWVdLl9wbGF5ZXIsXG4gICAgICAgICAgY2FuUGxheTogZmFsc2UsXG4gICAgICAgICAgb25DYW5QbGF5OiBmdW5jdGlvbiBvbkNhblBsYXkoKSB7XG4gICAgICAgICAgICB2aWRlby5wbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgICAgICBkZWJ1ZygnY2FuUGxheSAnICsgbmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjYW52YXMxOiBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMxLFxuICAgICAgICBjYW52YXMyOiBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMyXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHZpZGVvO1xuICAgIH0pO1xuICAgIHZpZGVvcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgdmlkZW8ucGxheWVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCB2aWRlby5wbGF5ZXIub25DYW5QbGF5LCBmYWxzZSk7XG4gICAgfSk7XG4gICAgcy52aWRlb3MgPSB2aWRlb3M7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLnZpZGVvcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHZpZGVvLmFuaW1hdGlvbklkMSk7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodmlkZW8uYW5pbWF0aW9uSWQyKTtcbiAgICAgIHZhciBwbGF5ZXIgPSB2aWRlby5wbGF5ZXI7XG5cbiAgICAgIHBsYXllci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdG5lcignY2FucGxheXRocm91Z2gnLCBwbGF5ZXIub25DYW5QbGF5LCBmYWxzZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQ3VzdG9tXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbW91bnRlZDogZmFsc2UsXG4gIHZpZGVvczogW10sXG4gIF92aWRlb0NvbnRhaW5lcnM6IHt9LFxuICBfcGxheWVyczoge30sXG4gIF9jYW52YXNlczoge30sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUHJpdmF0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9yZW5kZXJTZWN0aW9uOiBmdW5jdGlvbiBfcmVuZGVyU2VjdGlvbihuYW1lLCBjb25maWcsIHJldmVyc2VkKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICB2YXIgdGl0bGUgPSBjb25maWcudGl0bGU7XG4gICAgdmFyIHRleHQgPSBjb25maWcudGV4dDtcbiAgICB2YXIgdmlkZW8gPSBjb25maWcudmlkZW87XG4gICAgdmFyIF9jYW52YXMgPSBjb25maWcuY2FudmFzMTtcbiAgICB2YXIgX2NhbnZhczIgPSBjb25maWcuY2FudmFzMjtcblxuICAgIHMuX2NhbnZhc2VzW25hbWVdID0ge307IC8vIEVycm9yIOWbnumBv1xuICAgIHZhciByZWZzID0ge1xuICAgICAgY29udGFpbmVyOiBmdW5jdGlvbiBjb250YWluZXIoYykge1xuICAgICAgICBzLl92aWRlb0NvbnRhaW5lcnNbbmFtZV0gPSBjO1xuICAgICAgfSxcbiAgICAgIHZpZGVvOiBmdW5jdGlvbiB2aWRlbyhjKSB7XG4gICAgICAgIHMuX3BsYXllcnNbbmFtZV0gPSBjO1xuICAgICAgfSxcbiAgICAgIGNhbnZhczE6IGZ1bmN0aW9uIGNhbnZhczEoYykge1xuICAgICAgICBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMxID0ge1xuICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgZHg6IF9jYW52YXMuZHgsXG4gICAgICAgICAgZHk6IF9jYW52YXMuZHksXG4gICAgICAgICAgYW5pbWF0aW9uSWQ6IDAsXG4gICAgICAgICAgY3RpbWU6IDAsXG4gICAgICAgICAgbGFzdFRpbWU6IDBcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBjYW52YXMyOiBmdW5jdGlvbiBjYW52YXMyKGMpIHtcbiAgICAgICAgcy5fY2FudmFzZXNbbmFtZV0uY2FudmFzMiA9IHtcbiAgICAgICAgICBlbGVtZW50OiBjLFxuICAgICAgICAgIGR4OiBfY2FudmFzMi5keCxcbiAgICAgICAgICBkeTogX2NhbnZhczIuZHksXG4gICAgICAgICAgYW5pbWF0aW9uSWQ6IDAsXG4gICAgICAgICAgY3RpbWU6IDAsXG4gICAgICAgICAgbGFzdFRpbWU6IDBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbixcbiAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2Utc2VjdGlvbicsXG4gICAgICAgIGlkOiAnc2hvd2Nhc2UtJyArIG5hbWUgKyAnLXNlY3Rpb24nLFxuICAgICAgICBrZXk6IG5hbWUgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25IZWFkZXIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGwoJ3NlY3Rpb25zLicgKyB0aXRsZSlcbiAgICAgICksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uQm9keSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS10ZXh0LWNvbnRhaW5lcicgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS1kZXNjcmlwdGlvbicgfSxcbiAgICAgICAgICAgIFtdLmNvbmNhdChsKCdzZWN0aW9ucy4nICsgdGV4dCkpLm1hcChmdW5jdGlvbiAodGV4dCwgaSkge1xuICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3AnLFxuICAgICAgICAgICAgICAgIHsga2V5OiBpIH0sXG4gICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdkaXYnLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8tY29udGFpbmVyJywgcmVmOiBmdW5jdGlvbiByZWYoYykge1xuICAgICAgICAgICAgICByZXR1cm4gcy5fdmlkZW9Db250YWluZXJzW25hbWVdID0gYztcbiAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfdmlkZW8yLmRlZmF1bHQsIHsgc3JjOiB2aWRlbywgcmVmOiByZWZzLnZpZGVvIH0pLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF92aWRlb19jYW52YXMyLmRlZmF1bHQsIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8nLCByZWY6IHJlZnMuY2FudmFzMSB9KSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfam9pbmVyMi5kZWZhdWx0LCB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLWpvaW5lcicsIGNvbG9yOiByZXZlcnNlZCA/IF9jb2xvcl9jb25zdGFudHMuRE9NSU5BTlQgOiAnd2hpdGUnIH0pLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF92aWRlb19jYW52YXMyLmRlZmF1bHQsIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8nLCByZWY6IHJlZnMuY2FudmFzMiB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcbiAgX3VwZGF0ZUluU2NyZWVuOiBmdW5jdGlvbiBfdXBkYXRlSW5TY3JlZW4oY2xpZW50SGVpZ2h0KSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciB2aWRlb3MgPSBzLnZpZGVvcztcbiAgICB2aWRlb3MuZm9yRWFjaChmdW5jdGlvbiAodmlkZW8sIGkpIHtcbiAgICAgIHZhciByZWN0ID0gdmlkZW8uY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIG5leHRJblNjcmVlbiA9IGNsaWVudEhlaWdodCAtIHJlY3QudG9wID4gMCAmJiByZWN0LnRvcCA+IDA7XG4gICAgICB2YXIgcHJldkluU2NyZWVuID0gdmlkZW8uaW5TY3JlZW47XG4gICAgICBpZiAobmV4dEluU2NyZWVuICE9PSBwcmV2SW5TY3JlZW4pIHtcbiAgICAgICAgdmlkZW8uaW5TY3JlZW4gPSBuZXh0SW5TY3JlZW47XG4gICAgICAgIGlmICh2aWRlby5pblNjcmVlbikge1xuICAgICAgICAgIHMuX3BsYXkodmlkZW8pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMuX3BhdXNlKHZpZGVvKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfcGxheTogZnVuY3Rpb24gX3BsYXkodmlkZW8pIHtcbiAgICB2YXIgcGxheWVyRWxlbWVudCA9IHZpZGVvLnBsYXllci5lbGVtZW50O1xuICAgIGlmICghdmlkZW8ucGxheWVyLmNhblBsYXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcGxheWVyRWxlbWVudC5wbGF5KCk7XG4gICAgZGVidWcoJ3BsYXkgJyArIHZpZGVvLm5hbWUpO1xuXG4gICAgZnVuY3Rpb24gcGxheShjYW52YXMpIHtcbiAgICAgIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gICAgICB2YXIgY3R4ID0gY2FudmFzLmVsZW1lbnQuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgdmFyIF9sb29wMiA9IHZvaWQgMDtcbiAgICAgIGlmICgvKGlQaG9uZXxpUG9kKS8udGVzdCh1YSkpIHtcbiAgICAgICAgY2FudmFzLmxhc3RUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgX2xvb3AyID0gZnVuY3Rpb24gbG9vcCh0aW1lc3RhbXApIHtcbiAgICAgICAgICB2YXIgZGlmZiA9IERhdGUubm93KCkgLSBjYW52YXMubGFzdFRpbWU7XG4gICAgICAgICAgY2FudmFzLmxhc3RUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICBjYW52YXMuY3RpbWUgKz0gZGlmZiAvIDEwMDA7XG4gICAgICAgICAgcGxheWVyRWxlbWVudC5jdXJyZW50VGltZSA9IGNhbnZhcy5jdGltZTtcbiAgICAgICAgICBjdHguZHJhd0ltYWdlKHBsYXllckVsZW1lbnQsIGNhbnZhcy5keCwgY2FudmFzLmR5KTtcbiAgICAgICAgICBpZiAocGxheWVyRWxlbWVudC5kdXJhdGlvbiA8PSBwbGF5ZXJFbGVtZW50LmN1cnJlbnRUaW1lKSB7XG4gICAgICAgICAgICBjYW52YXMuY3RpbWUgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYW52YXMuYW5pbWF0aW9uSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKF9sb29wMik7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfbG9vcDIgPSBmdW5jdGlvbiBfbG9vcCgpIHtcbiAgICAgICAgICBjdHguZHJhd0ltYWdlKHBsYXllckVsZW1lbnQsIGNhbnZhcy5keCwgY2FudmFzLmR5KTtcbiAgICAgICAgICBjYW52YXMuYW5pbWF0aW9uSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKF9sb29wMik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYW52YXMuYW5pbWF0aW9uSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKF9sb29wMik7XG4gICAgfVxuXG4gICAgdmFyIGNhbnZhczEgPSB2aWRlby5jYW52YXMxO1xuICAgIHZhciBjYW52YXMyID0gdmlkZW8uY2FudmFzMjtcblxuICAgIHBsYXkoY2FudmFzMSk7XG4gICAgcGxheShjYW52YXMyKTtcbiAgfSxcbiAgX3BhdXNlOiBmdW5jdGlvbiBfcGF1c2UodmlkZW8pIHtcbiAgICBpZiAoIXZpZGVvLnBsYXllci5jYW5QbGF5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlYnVnKCdwYXVzZSAnICsgdmlkZW8ubmFtZSk7XG4gICAgdmlkZW8ucGxheWVyLmVsZW1lbnQucGF1c2UoKTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodmlkZW8uYW5pbWF0aW9uSWQxKTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodmlkZW8uYW5pbWF0aW9uSWQyKTtcbiAgfSxcbiAgX2hhbmRsZVNjcm9sbDogZnVuY3Rpb24gX2hhbmRsZVNjcm9sbChldmVudCkge1xuICAgIHZhciBjbGllbnRIZWlnaHQgPSBldmVudC50YXJnZXQuY2xpZW50SGVpZ2h0O1xuXG4gICAgdGhpcy5fdXBkYXRlSW5TY3JlZW4oY2xpZW50SGVpZ2h0KTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvd2Nhc2VWaWV3OyIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJET01JTkFOVFwiOiBcIiNkNmI4MTBcIlxufSIsIi8qKlxuICogQGNsYXNzIExpbmtTZXJ2aWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8qKiBAbGVuZHMgTGlua1NlcnZpY2UgKi9cblxudmFyIExpbmtTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBMaW5rU2VydmljZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGlua1NlcnZpY2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKExpbmtTZXJ2aWNlLCBbe1xuICAgIGtleTogJ3Jlc29sdmVIdG1sTGluaycsXG5cblxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgYSBodG1sIGxpbmtcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgLSBIdG1sIGZpbGUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gUmVzb2x2ZWQgZmlsZSBuYW1lXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVIdG1sTGluayhmaWxlbmFtZSkge1xuICAgICAgdmFyIHMgPSB0aGlzO1xuICAgICAgdmFyIGxhbmcgPSBzLl9nZXRMYW5nKCk7XG4gICAgICB2YXIgaHRtbERpciA9IGxhbmcgPyAnaHRtbC8nICsgbGFuZyA6ICdodG1sJztcbiAgICAgIHJldHVybiBwYXRoLmpvaW4oaHRtbERpciwgZmlsZW5hbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19nZXRMYW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2dldExhbmcoKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LkxBTkc7XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93Lmxhbmc7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIExpbmtTZXJ2aWNlO1xufSgpO1xuXG52YXIgc2luZ2xldG9uID0gbmV3IExpbmtTZXJ2aWNlKCk7XG5cbk9iamVjdC5hc3NpZ24oTGlua1NlcnZpY2UsIHtcbiAgc2luZ2xldG9uOiBzaW5nbGV0b25cbn0pO1xuXG5leHBvcnRzLnNpbmdsZXRvbiA9IHNpbmdsZXRvbjtcbmV4cG9ydHMuZGVmYXVsdCA9IExpbmtTZXJ2aWNlOyJdfQ==
