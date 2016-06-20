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
        "dx": 427,
        "dy": 15,
        "width": 408
      },
      "canvas2": {
        "dx": 0,
        "dy": 31,
        "width": 408
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
        "dy": 8,
        "width": 408
      },
      "canvas2": {
        "dx": 427,
        "dy": 15,
        "width": 408
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
        "dx": 427,
        "dy": 8,
        "width": 408
      },
      "canvas2": {
        "dx": 0,
        "dy": 31,
        "width": 408
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
        "width": 269
      },
      "canvas2": {
        "dx": 488,
        "dy": 41,
        "width": 361
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
        "dx": 440,
        "dy": 30,
        "width": 395
      },
      "canvas2": {
        "dx": 87,
        "dy": 28,
        "width": 248
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
        "dx": 34,
        "dy": 38,
        "width": 333
      },
      "canvas2": {
        "dx": 432,
        "dy": 30,
        "width": 395
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
        "dx": 435,
        "dy": 30,
        "width": 395
      },
      "canvas2": {
        "dx": 0,
        "dy": 31,
        "width": 408
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
        "dx": 451,
        "dy": 53,
        "width": 388
      },
      "canvas2": {
        "dx": 13,
        "dy": 30,
        "width": 395
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
        "dx": 79,
        "dy": 62,
        "width": 273
      },
      "canvas2": {
        "dx": 446,
        "dy": 15,
        "width": 408
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
        "width": 408
      },
      "canvas2": {
        "dx": 446,
        "dy": 3,
        "width": 408
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
      transform: 'translate(' + translateX + 'px, ' + translateY + 'px)'
    };
    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('video', props.className) },
      _react2.default.createElement(
        'div',
        { className: 'video-inner' },
        _react2.default.createElement(_sgReactComponents.SgVideo, { src: props.src,
          style: style,
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
          width: _canvas.width,
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
          width: _canvas2.width,
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
    var s = this;
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
          s._draw(ctx, playerElement, canvas);
          if (playerElement.duration <= playerElement.currentTime) {
            canvas.ctime = 0;
          }
          canvas.animationId = window.requestAnimationFrame(_loop2);
        };
      } else {
        _loop2 = function _loop() {
          s._draw(ctx, playerElement, canvas);
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
  _draw: function _draw(ctx, playerElement, canvas) {
    ctx.drawImage(playerElement, canvas.dx, canvas.dy, canvas.width, canvas.width, 0, 0, 148, 148);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMS4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjEuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsImxpYi9icm93c2VyL2Nhc2VzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMiLCJsaWIvY29tcG9uZW50cy9kYXRhL2FydGljbGVzLmpzb24iLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2pvaW5lci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvX2NhbnZhcy5qcyIsImxpYi9jb21wb25lbnRzL3ZpZXdzL3Nob3djYXNlX3ZpZXcuanMiLCJsaWIvY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cy5qc29uIiwibGliL3NlcnZpY2VzL2xpbmtfc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKipcbiAqIEJyb3dzZXIgc2NyaXB0IGZvciBjYXNlcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdCA9IHJlcXVpcmUoJ2FwZW1hbi1icndzLXJlYWN0Jyk7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwZW1hbkJyd3NSZWFjdCk7XG5cbnZhciBfY2FzZXNDb21wb25lbnQgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2Nhc2VzLmNvbXBvbmVudC5qcycpO1xuXG52YXIgX2Nhc2VzQ29tcG9uZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Nhc2VzQ29tcG9uZW50KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENPTlRBSU5FUl9JRCA9ICdjYXNlcy13cmFwJztcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfd2luZG93ID0gd2luZG93O1xuICB2YXIgbG9jYWxlID0gX3dpbmRvdy5sb2NhbGU7XG5cbiAgX2FwZW1hbkJyd3NSZWFjdDIuZGVmYXVsdC5yZW5kZXIoQ09OVEFJTkVSX0lELCBfY2FzZXNDb21wb25lbnQyLmRlZmF1bHQsIHtcbiAgICBsb2NhbGU6IGxvY2FsZVxuICB9LCBmdW5jdGlvbiBkb25lKCkge1xuICAgIC8vIFRoZSBjb21wb25lbnQgaXMgcmVhZHkuXG4gIH0pO1xufTsiLCIvKipcbiAqIENvbXBvbmVudCBvZiBjYXNlcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfaGVhZGVyID0gcmVxdWlyZSgnLi9mcmFnbWVudHMvaGVhZGVyJyk7XG5cbnZhciBfaGVhZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlYWRlcik7XG5cbnZhciBfc2hvd2Nhc2VfdmlldyA9IHJlcXVpcmUoJy4vdmlld3Mvc2hvd2Nhc2VfdmlldycpO1xuXG52YXIgX3Nob3djYXNlX3ZpZXcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2hvd2Nhc2Vfdmlldyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBDYXNlc0NvbXBvbmVudCA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnQ2FzZXNDb21wb25lbnQnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhY2tlcjogbmV3IF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLlN0YWNrZXIoe1xuICAgICAgICByb290OiBfc2hvd2Nhc2VfdmlldzIuZGVmYXVsdCxcbiAgICAgICAgcm9vdFByb3BzOiB7fVxuICAgICAgfSlcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHMucmVnaXN0ZXJMb2NhbGUocHJvcHMubG9jYWxlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBQYWdlLFxuICAgICAgbnVsbCxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9oZWFkZXIyLmRlZmF1bHQsIHsgdGFiOiAnQ0FTRVMnIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwTWFpbixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2ssIHsgc3RhY2tlcjogcHJvcHMuc3RhY2tlciB9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBDYXNlc0NvbXBvbmVudDsiLCJtb2R1bGUuZXhwb3J0cz1bXG4gIHtcbiAgICBcIm5hbWVcIjogXCJyZW1vdGUtcGxlblwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9SRU1PVEVfVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfUkVNT1RFX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvU1VHT1NfcmVtb3RlX1BMRU4ubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDQyNyxcbiAgICAgICAgXCJkeVwiOiAxNSxcbiAgICAgICAgXCJ3aWR0aFwiOiA0MDhcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDAsXG4gICAgICAgIFwiZHlcIjogMzEsXG4gICAgICAgIFwid2lkdGhcIjogNDA4XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwicHJlc2V0LWRyb25lXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0RST05FX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0RST05FX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvYXJkcm9uZS5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiA4LFxuICAgICAgICBcIndpZHRoXCI6IDQwOFxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogNDI3LFxuICAgICAgICBcImR5XCI6IDE1LFxuICAgICAgICBcIndpZHRoXCI6IDQwOFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImtpbmVjdC1hbmFseXNpc1wiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9TRU5TRV9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9TRU5TRV9URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL1NVR09TX3JlbW90ZV9zZW5zb3IubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDQyNyxcbiAgICAgICAgXCJkeVwiOiA4LFxuICAgICAgICBcIndpZHRoXCI6IDQwOFxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAzMSxcbiAgICAgICAgXCJ3aWR0aFwiOiA0MDhcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJzcGVlY2gtcGVwcGVyXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX1NQRUVDSF9SRUNPR05JVElPTl9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9TUEVFQ0hfUkVDT0dOSVRJT05fVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9wZXBwZXJfc3BlZWNoX3JlY29nbml0aW9uLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDAsXG4gICAgICAgIFwid2lkdGhcIjogMjY5XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiA0ODgsXG4gICAgICAgIFwiZHlcIjogNDEsXG4gICAgICAgIFwid2lkdGhcIjogMzYxXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwidGV4dC1pbnB1dFwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9URVhUX0lOUFVUX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX1RFWFRfSU5QVVRfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9wZXBwZXJfdGV4dF9pbnB1dC5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogNDQwLFxuICAgICAgICBcImR5XCI6IDMwLFxuICAgICAgICBcIndpZHRoXCI6IDM5NVxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogODcsXG4gICAgICAgIFwiZHlcIjogMjgsXG4gICAgICAgIFwid2lkdGhcIjogMjQ4XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwiZWRpc29uX3Jvb21iYVwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9FRElTT05fUk9PTUJBX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0VESVNPTl9ST09NQkFfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9lZGlzb25fcm9vbWJhLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAzNCxcbiAgICAgICAgXCJkeVwiOiAzOCxcbiAgICAgICAgXCJ3aWR0aFwiOiAzMzNcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDQzMixcbiAgICAgICAgXCJkeVwiOiAzMCxcbiAgICAgICAgXCJ3aWR0aFwiOiAzOTVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJlZGlzb24tc3RyZWFtXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0VESVNPTl9TVFJFQU1fVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfRURJU09OX1NUUkVBTV9URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL3lhYmVlLXN0cmVhbS5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogNDM1LFxuICAgICAgICBcImR5XCI6IDMwLFxuICAgICAgICBcIndpZHRoXCI6IDM5NVxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAzMSxcbiAgICAgICAgXCJ3aWR0aFwiOiA0MDhcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJjdXJsLXJhcGlyb1wiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9DVVJMX1JBUElST19USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9DVVJMX1JBUElST19URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL2N1cmxfcmFwaXJvLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiA0NTEsXG4gICAgICAgIFwiZHlcIjogNTMsXG4gICAgICAgIFwid2lkdGhcIjogMzg4XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxMyxcbiAgICAgICAgXCJkeVwiOiAzMCxcbiAgICAgICAgXCJ3aWR0aFwiOiAzOTVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJoaXRvZS1tYXBcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfSElUT0VfVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfSElUT0VfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9oaXRvZS1tYXAubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDc5LFxuICAgICAgICBcImR5XCI6IDYyLFxuICAgICAgICBcIndpZHRoXCI6IDI3M1xuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogNDQ2LFxuICAgICAgICBcImR5XCI6IDE1LFxuICAgICAgICBcIndpZHRoXCI6IDQwOFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImd5cm8tcGVwcGVyXCIsXG4gICAgXCJib2R5XCI6IHtcbiAgICAgIFwidGl0bGVcIjogXCJDQVNFX0dZUk9fVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfR1lST19URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL2d5cm8tcGVwcGVyLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDAsXG4gICAgICAgIFwid2lkdGhcIjogNDA4XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiA0NDYsXG4gICAgICAgIFwiZHlcIjogMyxcbiAgICAgICAgXCJ3aWR0aFwiOiA0MDhcbiAgICAgIH1cbiAgICB9XG4gIH1cbl1cbiIsIi8qKlxuICogSGVhZGVyIGNvbXBvbmVudFxuICogQGNsYXNzIEhlYWRlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfbG9nbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9sb2dvJyk7XG5cbnZhciBfbG9nbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2dvKTtcblxudmFyIF9saW5rX3NlcnZpY2UgPSByZXF1aXJlKCcuLi8uLi9zZXJ2aWNlcy9saW5rX3NlcnZpY2UnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqIEBsZW5kcyBIZWFkZXIgKi9cbnZhciBIZWFkZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGFiOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFiOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciB0YWIgPSBwcm9wcy50YWI7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF90YWJJdGVtID0gX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWJJdGVtLmNyZWF0ZUl0ZW07XG4gICAgdmFyIF9saW5rID0gZnVuY3Rpb24gX2xpbmsoKSB7XG4gICAgICByZXR1cm4gX2xpbmtfc2VydmljZS5zaW5nbGV0b24ucmVzb2x2ZUh0bWxMaW5rLmFwcGx5KF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXIsXG4gICAgICB7IGNsYXNzTmFtZTogJ2hlYWRlcicgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcENvbnRhaW5lcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJMb2dvLFxuICAgICAgICAgIHsgaHJlZjogX2xpbmsoJ2luZGV4Lmh0bWwnKSB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9sb2dvMi5kZWZhdWx0LCBudWxsKVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlclRhYixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkRPQ1NfUEFHRScpLCBfbGluaygnZG9jcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0RPQ1MnIH0pLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkNBU0VTX1BBR0UnKSwgX2xpbmsoJ2Nhc2VzLmh0bWwnKSwgeyBzZWxlY3RlZDogdGFiID09PSAnQ0FTRVMnIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSGVhZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9jb2xvcl9jb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEpvaW5lciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnSm9pbmVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2xvcjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgbGluZVdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IF9jb2xvcl9jb25zdGFudHMuRE9NSU5BTlQsXG4gICAgICBsaW5lV2lkdGg6IDRcbiAgICB9O1xuICB9LFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExheW91dE1peGluLCBfYXBlbWFuUmVhY3RNaXhpbnMuQXBQdXJlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgbGF5b3V0cyA9IHMubGF5b3V0cztcbiAgICB2YXIgY29sb3IgPSBwcm9wcy5jb2xvcjtcbiAgICB2YXIgbGluZVdpZHRoID0gcHJvcHMubGluZVdpZHRoO1xuICAgIHZhciBfbGF5b3V0cyRzdmcgPSBsYXlvdXRzLnN2ZztcbiAgICB2YXIgd2lkdGggPSBfbGF5b3V0cyRzdmcud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IF9sYXlvdXRzJHN2Zy5oZWlnaHQ7XG4gICAgdmFyIG1pblggPSAwO1xuICAgIHZhciBtaWRYID0gd2lkdGggLyAyO1xuICAgIHZhciBtYXhYID0gd2lkdGg7XG4gICAgdmFyIG1pblkgPSAwO1xuICAgIHZhciBtaWRZID0gaGVpZ2h0IC8gMjtcbiAgICB2YXIgbWF4WSA9IGhlaWdodDtcblxuICAgIHZhciBfbGluZSA9IGZ1bmN0aW9uIF9saW5lKHgxLCB4MiwgeTEsIHkyKSB7XG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2xpbmUnLCB7IHgxOiB4MSwgeDI6IHgyLCB5MTogeTEsIHkyOiB5MiB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHhUaWx0ID0gMC4xO1xuICAgIHZhciB5VGlsdCA9IDAuMztcblxuICAgIHZhciB4MSA9IG1pblg7XG4gICAgdmFyIHgyID0gbWlkWCAqICgxICsgeFRpbHQpO1xuICAgIHZhciB4MyA9IG1pZFggKiAoMSAtIHhUaWx0KTtcbiAgICB2YXIgeDQgPSBtYXhYO1xuICAgIHZhciB5MSA9IG1pZFk7XG4gICAgdmFyIHkyID0gbWlkWSAqICgxIC0geVRpbHQpO1xuICAgIHZhciB5MyA9IG1pZFkgKiAoMSArIHlUaWx0KTtcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ2pvaW5lcicsIHByb3BzLmNsYXNzTmFtZSksXG4gICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGpvaW5lcikge1xuICAgICAgICAgIHMuam9pbmVyID0gam9pbmVyO1xuICAgICAgICB9IH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3N2ZycsXG4gICAgICAgIHsgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcDogJ3JvdW5kJyxcbiAgICAgICAgICBzdHJva2VXaWR0aDogbGluZVdpZHRoXG4gICAgICAgIH0sXG4gICAgICAgIF9saW5lKHgxLCB4MiwgeTEsIHkyKSxcbiAgICAgICAgX2xpbmUoeDIsIHgzLCB5MiwgeTMpLFxuICAgICAgICBfbGluZSh4MywgeDQsIHkzLCB5MSlcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gRm9yIEFwTGF5b3V0TWl4aW5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0SW5pdGlhbExheW91dHM6IGZ1bmN0aW9uIGdldEluaXRpYWxMYXlvdXRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdmc6IHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiA0MCB9XG4gICAgfTtcbiAgfSxcbiAgY2FsY0xheW91dHM6IGZ1bmN0aW9uIGNhbGNMYXlvdXRzKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgam9pbmVyID0gcy5qb2luZXI7XG5cbiAgICBpZiAoIWpvaW5lcikge1xuICAgICAgcmV0dXJuIHMuZ2V0SW5pdGlhbExheW91dHMoKTtcbiAgICB9XG5cbiAgICB2YXIgX2pvaW5lciRnZXRCb3VuZGluZ0NsID0gam9pbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdmFyIHdpZHRoID0gX2pvaW5lciRnZXRCb3VuZGluZ0NsLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSBfam9pbmVyJGdldEJvdW5kaW5nQ2wuaGVpZ2h0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN2ZzogeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH1cbiAgICB9O1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSm9pbmVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgTG9nbyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTG9nbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdoMScsXG4gICAgICB7IGNsYXNzTmFtZTogJ2xvZ28nIH0sXG4gICAgICBsKCdsb2dvLkxPR08nKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBMb2dvOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3NnUmVhY3RDb21wb25lbnRzID0gcmVxdWlyZSgnc2ctcmVhY3QtY29tcG9uZW50cycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFZpZGVvID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdWaWRlbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwVG91Y2hNaXhpbl0sXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgd2lkdGg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWTogX3JlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgdHJhbnNsYXRlWCA9IHByb3BzLnRyYW5zbGF0ZVg7XG4gICAgdmFyIHRyYW5zbGF0ZVkgPSBwcm9wcy50cmFuc2xhdGVZO1xuXG4gICAgdmFyIHN0eWxlID0ge1xuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKCcgKyB0cmFuc2xhdGVYICsgJ3B4LCAnICsgdHJhbnNsYXRlWSArICdweCknXG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgY2xhc3NOYW1lOiAoMCwgX2NsYXNzbmFtZXMyLmRlZmF1bHQpKCd2aWRlbycsIHByb3BzLmNsYXNzTmFtZSkgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnZGl2JyxcbiAgICAgICAgeyBjbGFzc05hbWU6ICd2aWRlby1pbm5lcicgfSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3NnUmVhY3RDb21wb25lbnRzLlNnVmlkZW8sIHsgc3JjOiBwcm9wcy5zcmMsXG4gICAgICAgICAgc3R5bGU6IHN0eWxlLFxuICAgICAgICAgIHBsYXllclJlZjogZnVuY3Rpb24gcGxheWVyUmVmKHBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuIHMuX3BsYXllciA9IHBsYXllcjtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGF1dG9QbGF5OiB0cnVlLFxuICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgICAgICBtdXRlZDogdHJ1ZSxcbiAgICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAndmlkZW8tb3ZlcmxheScgfSlcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVmlkZW87IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIF9jbGFzc25hbWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsYXNzbmFtZXMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgVmlkZW9DYW52YXMgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1ZpZGVvQ2FudmFzJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBzcmM6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zbGF0ZVk6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogMTQ4LFxuICAgICAgaGVpZ2h0OiAxNDhcbiAgICB9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ3ZpZGVvLWNhbnZhcycsIHByb3BzLmNsYXNzTmFtZSkgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnZGl2JyxcbiAgICAgICAgeyBjbGFzc05hbWU6ICd2aWRlby1jYW52YXMtaW5uZXInIH0sXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdjYW52YXMnLCB7IHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHByb3BzLmhlaWdodCxcbiAgICAgICAgICByZWY6IGZ1bmN0aW9uIHJlZihjYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybiBzLl9jYW52YXMgPSBjYW52YXM7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogJ3ZpZGVvLWNhbnZhcy1vdmVybGF5JyB9KVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBWaWRlb0NhbnZhczsiLCIvKipcbiAqIFZpZXcgZm9yIHNob3djYXNlXG4gKiBAY2xhc3MgU2hvd2Nhc2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX3ZpZGVvID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL3ZpZGVvJyk7XG5cbnZhciBfdmlkZW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdmlkZW8pO1xuXG52YXIgX3ZpZGVvX2NhbnZhcyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy92aWRlb19jYW52YXMnKTtcblxudmFyIF92aWRlb19jYW52YXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdmlkZW9fY2FudmFzKTtcblxudmFyIF9qb2luZXIgPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvam9pbmVyJyk7XG5cbnZhciBfam9pbmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2pvaW5lcik7XG5cbnZhciBfY29sb3JfY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzZzpjb21wb25lbnQ6c2hvd2Nhc2UnKTtcblxudmFyIGFydGljbGVzID0gcmVxdWlyZSgnLi4vZGF0YS9hcnRpY2xlcy5qc29uJyk7XG5cbnZhciBTaG93Y2FzZVZpZXcgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1Nob3djYXNlVmlldycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4geyB2aWRlb3M6IHt9IH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGRlYnVnKCdyZW5kZXIgY2FsbGVkLicpO1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF9zZWN0aW9uID0gcy5fcmVuZGVyU2VjdGlvbjtcbiAgICAvLyDplovnmbrkuK3jga4gc2VjdGlvbiDjga7mjL/lhaXjg7vlhaXjgozmm7/jgYjjgpLlrrnmmJPjgavjgZnjgovjgZ/jgoFcbiAgICB2YXIgZmlyc3QgPSB0cnVlO1xuICAgIHZhciByZXZlcnNlZCA9IGZ1bmN0aW9uIHJldmVyc2VkKCkge1xuICAgICAgZmlyc3QgPSAhZmlyc3Q7XG4gICAgICByZXR1cm4gZmlyc3Q7XG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXcsXG4gICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZXcnLFxuICAgICAgICBzcGlubmluZzogIXMubW91bnRlZCxcbiAgICAgICAgb25TY3JvbGw6IHMuX2hhbmRsZVNjcm9sbFxuICAgICAgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0hlYWRlciwgeyB0aXRsZVRleHQ6IGwoJ3RpdGxlcy5TSE9XQ0FTRV9USVRMRScpIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0JvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdhcnRpY2xlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGFydGljbGVzLm1hcChmdW5jdGlvbiAoYXJ0aWNsZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZWN0aW9uKGFydGljbGUubmFtZSwgYXJ0aWNsZS5ib2R5LCByZXZlcnNlZCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBMaWZlQ3ljbGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIC8vIGRlZmluZXMgbW91bnRlZCB2YWx1ZVxuICAgIHMubW91bnRlZCA9IHRydWU7XG5cbiAgICAvLyBkZWZpbmVzIHJlcXVlYXRBbmltYXRpb24gZnVuY3Rpb25zXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGYsIDEwMDAgLyA2MCk7XG4gICAgICB9O1xuICAgIH0oKTtcblxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1vekNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm9DYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cub0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jbGVhclRpbWVvdXQoaWQpO1xuICAgICAgfTtcbiAgICB9KCk7XG5cbiAgICAvLyBkZWZpbmVzIHRoaXMudmlkZW9zXG4gICAgdmFyIHZpZGVvcyA9IGFydGljbGVzLm1hcChmdW5jdGlvbiAoYXJ0aWNsZSkge1xuICAgICAgdmFyIG5hbWUgPSBhcnRpY2xlLm5hbWU7XG5cbiAgICAgIHZhciB2aWRlbyA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgaW5TY3JlZW46IHRydWUsXG4gICAgICAgIGNvbnRhaW5lcjogcy5fdmlkZW9Db250YWluZXJzW25hbWVdLFxuICAgICAgICBwbGF5ZXI6IHtcbiAgICAgICAgICBlbGVtZW50OiBzLl9wbGF5ZXJzW25hbWVdLl9wbGF5ZXIsXG4gICAgICAgICAgY2FuUGxheTogZmFsc2UsXG4gICAgICAgICAgb25DYW5QbGF5OiBmdW5jdGlvbiBvbkNhblBsYXkoKSB7XG4gICAgICAgICAgICB2aWRlby5wbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgICAgICBkZWJ1ZygnY2FuUGxheSAnICsgbmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjYW52YXMxOiBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMxLFxuICAgICAgICBjYW52YXMyOiBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMyXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHZpZGVvO1xuICAgIH0pO1xuICAgIHZpZGVvcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgdmlkZW8ucGxheWVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCB2aWRlby5wbGF5ZXIub25DYW5QbGF5LCBmYWxzZSk7XG4gICAgfSk7XG4gICAgcy52aWRlb3MgPSB2aWRlb3M7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLnZpZGVvcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHZpZGVvLmFuaW1hdGlvbklkMSk7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodmlkZW8uYW5pbWF0aW9uSWQyKTtcbiAgICAgIHZhciBwbGF5ZXIgPSB2aWRlby5wbGF5ZXI7XG5cbiAgICAgIHBsYXllci5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdG5lcignY2FucGxheXRocm91Z2gnLCBwbGF5ZXIub25DYW5QbGF5LCBmYWxzZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQ3VzdG9tXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbW91bnRlZDogZmFsc2UsXG4gIHZpZGVvczogW10sXG4gIF92aWRlb0NvbnRhaW5lcnM6IHt9LFxuICBfcGxheWVyczoge30sXG4gIF9jYW52YXNlczoge30sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUHJpdmF0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9yZW5kZXJTZWN0aW9uOiBmdW5jdGlvbiBfcmVuZGVyU2VjdGlvbihuYW1lLCBjb25maWcsIHJldmVyc2VkKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICB2YXIgdGl0bGUgPSBjb25maWcudGl0bGU7XG4gICAgdmFyIHRleHQgPSBjb25maWcudGV4dDtcbiAgICB2YXIgdmlkZW8gPSBjb25maWcudmlkZW87XG4gICAgdmFyIF9jYW52YXMgPSBjb25maWcuY2FudmFzMTtcbiAgICB2YXIgX2NhbnZhczIgPSBjb25maWcuY2FudmFzMjtcblxuICAgIHMuX2NhbnZhc2VzW25hbWVdID0ge307IC8vIEVycm9yIOWbnumBv1xuICAgIHZhciByZWZzID0ge1xuICAgICAgY29udGFpbmVyOiBmdW5jdGlvbiBjb250YWluZXIoYykge1xuICAgICAgICBzLl92aWRlb0NvbnRhaW5lcnNbbmFtZV0gPSBjO1xuICAgICAgfSxcbiAgICAgIHZpZGVvOiBmdW5jdGlvbiB2aWRlbyhjKSB7XG4gICAgICAgIHMuX3BsYXllcnNbbmFtZV0gPSBjO1xuICAgICAgfSxcbiAgICAgIGNhbnZhczE6IGZ1bmN0aW9uIGNhbnZhczEoYykge1xuICAgICAgICBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMxID0ge1xuICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgZHg6IF9jYW52YXMuZHgsXG4gICAgICAgICAgZHk6IF9jYW52YXMuZHksXG4gICAgICAgICAgd2lkdGg6IF9jYW52YXMud2lkdGgsXG4gICAgICAgICAgYW5pbWF0aW9uSWQ6IDAsXG4gICAgICAgICAgY3RpbWU6IDAsXG4gICAgICAgICAgbGFzdFRpbWU6IDBcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBjYW52YXMyOiBmdW5jdGlvbiBjYW52YXMyKGMpIHtcbiAgICAgICAgcy5fY2FudmFzZXNbbmFtZV0uY2FudmFzMiA9IHtcbiAgICAgICAgICBlbGVtZW50OiBjLFxuICAgICAgICAgIGR4OiBfY2FudmFzMi5keCxcbiAgICAgICAgICBkeTogX2NhbnZhczIuZHksXG4gICAgICAgICAgd2lkdGg6IF9jYW52YXMyLndpZHRoLFxuICAgICAgICAgIGFuaW1hdGlvbklkOiAwLFxuICAgICAgICAgIGN0aW1lOiAwLFxuICAgICAgICAgIGxhc3RUaW1lOiAwXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb24sXG4gICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXNlY3Rpb24nLFxuICAgICAgICBpZDogJ3Nob3djYXNlLScgKyBuYW1lICsgJy1zZWN0aW9uJyxcbiAgICAgICAga2V5OiBuYW1lIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uSGVhZGVyLFxuICAgICAgICBudWxsLFxuICAgICAgICBsKCdzZWN0aW9ucy4nICsgdGl0bGUpXG4gICAgICApLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbkJvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdkaXYnLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdGV4dC1jb250YWluZXInIH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtZGVzY3JpcHRpb24nIH0sXG4gICAgICAgICAgICBbXS5jb25jYXQobCgnc2VjdGlvbnMuJyArIHRleHQpKS5tYXAoZnVuY3Rpb24gKHRleHQsIGkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdwJyxcbiAgICAgICAgICAgICAgICB7IGtleTogaSB9LFxuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZGVvLWNvbnRhaW5lcicsIHJlZjogZnVuY3Rpb24gcmVmKGMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHMuX3ZpZGVvQ29udGFpbmVyc1tuYW1lXSA9IGM7XG4gICAgICAgICAgICB9IH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3ZpZGVvMi5kZWZhdWx0LCB7IHNyYzogdmlkZW8sIHJlZjogcmVmcy52aWRlbyB9KSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfdmlkZW9fY2FudmFzMi5kZWZhdWx0LCB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZGVvJywgcmVmOiByZWZzLmNhbnZhczEgfSksXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2pvaW5lcjIuZGVmYXVsdCwgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS1qb2luZXInLCBjb2xvcjogcmV2ZXJzZWQgPyBfY29sb3JfY29uc3RhbnRzLkRPTUlOQU5UIDogJ3doaXRlJyB9KSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfdmlkZW9fY2FudmFzMi5kZWZhdWx0LCB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZGVvJywgcmVmOiByZWZzLmNhbnZhczIgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG4gIF91cGRhdGVJblNjcmVlbjogZnVuY3Rpb24gX3VwZGF0ZUluU2NyZWVuKGNsaWVudEhlaWdodCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgdmlkZW9zID0gcy52aWRlb3M7XG4gICAgdmlkZW9zLmZvckVhY2goZnVuY3Rpb24gKHZpZGVvLCBpKSB7XG4gICAgICB2YXIgcmVjdCA9IHZpZGVvLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciBuZXh0SW5TY3JlZW4gPSBjbGllbnRIZWlnaHQgLSByZWN0LnRvcCA+IDAgJiYgcmVjdC50b3AgPiAwO1xuICAgICAgdmFyIHByZXZJblNjcmVlbiA9IHZpZGVvLmluU2NyZWVuO1xuICAgICAgaWYgKG5leHRJblNjcmVlbiAhPT0gcHJldkluU2NyZWVuKSB7XG4gICAgICAgIHZpZGVvLmluU2NyZWVuID0gbmV4dEluU2NyZWVuO1xuICAgICAgICBpZiAodmlkZW8uaW5TY3JlZW4pIHtcbiAgICAgICAgICBzLl9wbGF5KHZpZGVvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzLl9wYXVzZSh2aWRlbyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3BsYXk6IGZ1bmN0aW9uIF9wbGF5KHZpZGVvKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwbGF5ZXJFbGVtZW50ID0gdmlkZW8ucGxheWVyLmVsZW1lbnQ7XG4gICAgaWYgKCF2aWRlby5wbGF5ZXIuY2FuUGxheSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwbGF5ZXJFbGVtZW50LnBsYXkoKTtcbiAgICBkZWJ1ZygncGxheSAnICsgdmlkZW8ubmFtZSk7XG5cbiAgICBmdW5jdGlvbiBwbGF5KGNhbnZhcykge1xuICAgICAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICAgIHZhciBjdHggPSBjYW52YXMuZWxlbWVudC5fY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICB2YXIgX2xvb3AyID0gdm9pZCAwO1xuICAgICAgaWYgKC8oaVBob25lfGlQb2QpLy50ZXN0KHVhKSkge1xuICAgICAgICBjYW52YXMubGFzdFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBfbG9vcDIgPSBmdW5jdGlvbiBsb29wKHRpbWVzdGFtcCkge1xuICAgICAgICAgIHZhciBkaWZmID0gRGF0ZS5ub3coKSAtIGNhbnZhcy5sYXN0VGltZTtcbiAgICAgICAgICBjYW52YXMubGFzdFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgIGNhbnZhcy5jdGltZSArPSBkaWZmIC8gMTAwMDtcbiAgICAgICAgICBwbGF5ZXJFbGVtZW50LmN1cnJlbnRUaW1lID0gY2FudmFzLmN0aW1lO1xuICAgICAgICAgIHMuX2RyYXcoY3R4LCBwbGF5ZXJFbGVtZW50LCBjYW52YXMpO1xuICAgICAgICAgIGlmIChwbGF5ZXJFbGVtZW50LmR1cmF0aW9uIDw9IHBsYXllckVsZW1lbnQuY3VycmVudFRpbWUpIHtcbiAgICAgICAgICAgIGNhbnZhcy5jdGltZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhbnZhcy5hbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoX2xvb3AyKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9sb29wMiA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgICAgICAgIHMuX2RyYXcoY3R4LCBwbGF5ZXJFbGVtZW50LCBjYW52YXMpO1xuICAgICAgICAgIGNhbnZhcy5hbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoX2xvb3AyKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNhbnZhcy5hbmltYXRpb25JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoX2xvb3AyKTtcbiAgICB9XG5cbiAgICB2YXIgY2FudmFzMSA9IHZpZGVvLmNhbnZhczE7XG4gICAgdmFyIGNhbnZhczIgPSB2aWRlby5jYW52YXMyO1xuXG4gICAgcGxheShjYW52YXMxKTtcbiAgICBwbGF5KGNhbnZhczIpO1xuICB9LFxuICBfZHJhdzogZnVuY3Rpb24gX2RyYXcoY3R4LCBwbGF5ZXJFbGVtZW50LCBjYW52YXMpIHtcbiAgICBjdHguZHJhd0ltYWdlKHBsYXllckVsZW1lbnQsIGNhbnZhcy5keCwgY2FudmFzLmR5LCBjYW52YXMud2lkdGgsIGNhbnZhcy53aWR0aCwgMCwgMCwgMTQ4LCAxNDgpO1xuICB9LFxuICBfcGF1c2U6IGZ1bmN0aW9uIF9wYXVzZSh2aWRlbykge1xuICAgIGlmICghdmlkZW8ucGxheWVyLmNhblBsYXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGVidWcoJ3BhdXNlICcgKyB2aWRlby5uYW1lKTtcbiAgICB2aWRlby5wbGF5ZXIuZWxlbWVudC5wYXVzZSgpO1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh2aWRlby5hbmltYXRpb25JZDEpO1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh2aWRlby5hbmltYXRpb25JZDIpO1xuICB9LFxuICBfaGFuZGxlU2Nyb2xsOiBmdW5jdGlvbiBfaGFuZGxlU2Nyb2xsKGV2ZW50KSB7XG4gICAgdmFyIGNsaWVudEhlaWdodCA9IGV2ZW50LnRhcmdldC5jbGllbnRIZWlnaHQ7XG5cbiAgICB0aGlzLl91cGRhdGVJblNjcmVlbihjbGllbnRIZWlnaHQpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG93Y2FzZVZpZXc7IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIkRPTUlOQU5UXCI6IFwiI2Q2YjgxMFwiXG59IiwiLyoqXG4gKiBAY2xhc3MgTGlua1NlcnZpY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLyoqIEBsZW5kcyBMaW5rU2VydmljZSAqL1xuXG52YXIgTGlua1NlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIExpbmtTZXJ2aWNlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaW5rU2VydmljZSk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTGlua1NlcnZpY2UsIFt7XG4gICAga2V5OiAncmVzb2x2ZUh0bWxMaW5rJyxcblxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZSBhIGh0bWwgbGlua1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIEh0bWwgZmlsZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gLSBSZXNvbHZlZCBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZUh0bWxMaW5rKGZpbGVuYW1lKSB7XG4gICAgICB2YXIgcyA9IHRoaXM7XG4gICAgICB2YXIgbGFuZyA9IHMuX2dldExhbmcoKTtcbiAgICAgIHZhciBodG1sRGlyID0gbGFuZyA/ICdodG1sLycgKyBsYW5nIDogJ2h0bWwnO1xuICAgICAgcmV0dXJuIHBhdGguam9pbihodG1sRGlyLCBmaWxlbmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2dldExhbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0TGFuZygpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTEFORztcbiAgICAgIH1cbiAgICAgIHJldHVybiB3aW5kb3cubGFuZztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTGlua1NlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgTGlua1NlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihMaW5rU2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gTGlua1NlcnZpY2U7Il19
