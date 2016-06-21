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

// Pollyfill of requeatAnimationFrame
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMS4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjEuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsImxpYi9icm93c2VyL2Nhc2VzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMiLCJsaWIvY29tcG9uZW50cy9kYXRhL2FydGljbGVzLmpzb24iLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2pvaW5lci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvX2NhbnZhcy5qcyIsImxpYi9jb21wb25lbnRzL3ZpZXdzL3Nob3djYXNlX3ZpZXcuanMiLCJsaWIvY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cy5qc29uIiwibGliL3NlcnZpY2VzL2xpbmtfc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyVEE7QUFDQTtBQUNBOzs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBCcm93c2VyIHNjcmlwdCBmb3IgY2FzZXMuXG4gKlxuICogR2VuZXJhdGVkIGJ5IGNveiBvbiA2LzkvMjAxNixcbiAqIGZyb20gYSB0ZW1wbGF0ZSBwcm92aWRlZCBieSBhcGVtYW4tYnVkLW1vY2suXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9hcGVtYW5CcndzUmVhY3QgPSByZXF1aXJlKCdhcGVtYW4tYnJ3cy1yZWFjdCcpO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGVtYW5CcndzUmVhY3QpO1xuXG52YXIgX2Nhc2VzQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMnKTtcblxudmFyIF9jYXNlc0NvbXBvbmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jYXNlc0NvbXBvbmVudCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBDT05UQUlORVJfSUQgPSAnY2FzZXMtd3JhcCc7XG5cbi8vIFBvbGx5ZmlsbCBvZiByZXF1ZWF0QW5pbWF0aW9uRnJhbWVcbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZiwgMTAwMCAvIDYwKTtcbiAgfTtcbn0oKTtcbndpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuY2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cub0NhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5vQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IGZ1bmN0aW9uIChpZCkge1xuICAgIHJldHVybiB3aW5kb3cuY2xlYXJUaW1lb3V0KGlkKTtcbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gb25sb2FkKCkge1xuICB2YXIgX3dpbmRvdyA9IHdpbmRvdztcbiAgdmFyIGxvY2FsZSA9IF93aW5kb3cubG9jYWxlO1xuXG4gIF9hcGVtYW5CcndzUmVhY3QyLmRlZmF1bHQucmVuZGVyKENPTlRBSU5FUl9JRCwgX2Nhc2VzQ29tcG9uZW50Mi5kZWZhdWx0LCB7XG4gICAgbG9jYWxlOiBsb2NhbGVcbiAgfSwgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAvLyBUaGUgY29tcG9uZW50IGlzIHJlYWR5LlxuICB9KTtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBvbmxvYWQpO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIG9ubG9hZCk7IiwiLyoqXG4gKiBDb21wb25lbnQgb2YgY2FzZXMuXG4gKlxuICogR2VuZXJhdGVkIGJ5IGNveiBvbiA2LzkvMjAxNixcbiAqIGZyb20gYSB0ZW1wbGF0ZSBwcm92aWRlZCBieSBhcGVtYW4tYnVkLW1vY2suXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2hlYWRlciA9IHJlcXVpcmUoJy4vZnJhZ21lbnRzL2hlYWRlcicpO1xuXG52YXIgX2hlYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWFkZXIpO1xuXG52YXIgX3Nob3djYXNlX3ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL3Nob3djYXNlX3ZpZXcnKTtcblxudmFyIF9zaG93Y2FzZV92aWV3MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Nob3djYXNlX3ZpZXcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgQ2FzZXNDb21wb25lbnQgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0Nhc2VzQ29tcG9uZW50JyxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWNrZXI6IG5ldyBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjay5TdGFja2VyKHtcbiAgICAgICAgcm9vdDogX3Nob3djYXNlX3ZpZXcyLmRlZmF1bHQsXG4gICAgICAgIHJvb3RQcm9wczoge31cbiAgICAgIH0pXG4gICAgfTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICBzLnJlZ2lzdGVyTG9jYWxlKHByb3BzLmxvY2FsZSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwUGFnZSxcbiAgICAgIG51bGwsXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfaGVhZGVyMi5kZWZhdWx0LCB7IHRhYjogJ0NBU0VTJyB9KSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcE1haW4sXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLCB7IHN0YWNrZXI6IHByb3BzLnN0YWNrZXIgfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ2FzZXNDb21wb25lbnQ7IiwibW9kdWxlLmV4cG9ydHM9W1xuICB7XG4gICAgXCJuYW1lXCI6IFwicmVtb3RlLXBsZW5cIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfUkVNT1RFX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX1JFTU9URV9URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL1NVR09TX3JlbW90ZV9QTEVOLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxNjAsXG4gICAgICAgIFwiZHlcIjogNS42LFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDExLjYsXG4gICAgICAgIFwid2lkdGhcIjogMTUyLjlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJwcmVzZXQtZHJvbmVcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfRFJPTkVfVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfRFJPTkVfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9hcmRyb25lLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAwLFxuICAgICAgICBcImR5XCI6IDMsXG4gICAgICAgIFwid2lkdGhcIjogMTUyLjlcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDE2MCxcbiAgICAgICAgXCJkeVwiOiA1LjYsXG4gICAgICAgIFwid2lkdGhcIjogMTUyLjlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJraW5lY3QtYW5hbHlzaXNcIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfU0VOU0VfVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfU0VOU0VfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9TVUdPU19yZW1vdGVfc2Vuc29yLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxNjAsXG4gICAgICAgIFwiZHlcIjogMyxcbiAgICAgICAgXCJ3aWR0aFwiOiAxNTIuOVxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAxMS42LFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwic3BlZWNoLXBlcHBlclwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9TUEVFQ0hfUkVDT0dOSVRJT05fVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfU1BFRUNIX1JFQ09HTklUSU9OX1RFWFRcIixcbiAgICAgIFwidmlkZW9cIjogXCJ2aWRlb3MvcGVwcGVyX3NwZWVjaF9yZWNvZ25pdGlvbi5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAwLFxuICAgICAgICBcIndpZHRoXCI6IDEwMC44XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxODIuOSxcbiAgICAgICAgXCJkeVwiOiAxNS40LFxuICAgICAgICBcIndpZHRoXCI6IDEzNS4zXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwidGV4dC1pbnB1dFwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9URVhUX0lOUFVUX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX1RFWFRfSU5QVVRfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9wZXBwZXJfdGV4dF9pbnB1dC5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMTY0LjksXG4gICAgICAgIFwiZHlcIjogMTEuMixcbiAgICAgICAgXCJ3aWR0aFwiOiAxNDhcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDMyLjYsXG4gICAgICAgIFwiZHlcIjogMTAuNSxcbiAgICAgICAgXCJ3aWR0aFwiOiA5Mi45XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwiZWRpc29uX3Jvb21iYVwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9FRElTT05fUk9PTUJBX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0VESVNPTl9ST09NQkFfVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9lZGlzb25fcm9vbWJhLm1wNFwiLFxuICAgICAgXCJjYW52YXMxXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxMi43LFxuICAgICAgICBcImR5XCI6IDE0LjIsXG4gICAgICAgIFwid2lkdGhcIjogMTI0LjhcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDE2MS45LFxuICAgICAgICBcImR5XCI6IDExLjIsXG4gICAgICAgIFwid2lkdGhcIjogMTQ4XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwiZWRpc29uLXN0cmVhbVwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9FRElTT05fU1RSRUFNX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0VESVNPTl9TVFJFQU1fVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy95YWJlZS1zdHJlYW0ubXA0XCIsXG4gICAgICBcImNhbnZhczFcIjoge1xuICAgICAgICBcImR4XCI6IDE2MyxcbiAgICAgICAgXCJkeVwiOiAxMS4yLFxuICAgICAgICBcIndpZHRoXCI6IDE0OFxuICAgICAgfSxcbiAgICAgIFwiY2FudmFzMlwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAyMS42LFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgXCJuYW1lXCI6IFwiY3VybC1yYXBpcm9cIixcbiAgICBcImJvZHlcIjoge1xuICAgICAgXCJ0aXRsZVwiOiBcIkNBU0VfQ1VSTF9SQVBJUk9fVElUTEVcIixcbiAgICAgIFwidGV4dFwiOiBcIkNBU0VfQ1VSTF9SQVBJUk9fVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9jdXJsX3JhcGlyby5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMTY5LFxuICAgICAgICBcImR5XCI6IDE5LjksXG4gICAgICAgIFwid2lkdGhcIjogMTQ1LjRcbiAgICAgIH0sXG4gICAgICBcImNhbnZhczJcIjoge1xuICAgICAgICBcImR4XCI6IDQuOSxcbiAgICAgICAgXCJkeVwiOiAxMS4yLFxuICAgICAgICBcIndpZHRoXCI6IDE0OFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIFwibmFtZVwiOiBcImhpdG9lLW1hcFwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9ISVRPRV9USVRMRVwiLFxuICAgICAgXCJ0ZXh0XCI6IFwiQ0FTRV9ISVRPRV9URVhUXCIsXG4gICAgICBcInZpZGVvXCI6IFwidmlkZW9zL2hpdG9lLW1hcC5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMjkuNixcbiAgICAgICAgXCJkeVwiOiAyMy4yLFxuICAgICAgICBcIndpZHRoXCI6IDEwMi4zXG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxNjcuMSxcbiAgICAgICAgXCJkeVwiOiA1LjYsXG4gICAgICAgIFwid2lkdGhcIjogMTUyLjlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBcIm5hbWVcIjogXCJneXJvLXBlcHBlclwiLFxuICAgIFwiYm9keVwiOiB7XG4gICAgICBcInRpdGxlXCI6IFwiQ0FTRV9HWVJPX1RJVExFXCIsXG4gICAgICBcInRleHRcIjogXCJDQVNFX0dZUk9fVEVYVFwiLFxuICAgICAgXCJ2aWRlb1wiOiBcInZpZGVvcy9neXJvLXBlcHBlci5tcDRcIixcbiAgICAgIFwiY2FudmFzMVwiOiB7XG4gICAgICAgIFwiZHhcIjogMCxcbiAgICAgICAgXCJkeVwiOiAwLFxuICAgICAgICBcIndpZHRoXCI6IDE1Mi45XG4gICAgICB9LFxuICAgICAgXCJjYW52YXMyXCI6IHtcbiAgICAgICAgXCJkeFwiOiAxNjcuMSxcbiAgICAgICAgXCJkeVwiOiAxLjEsXG4gICAgICAgIFwid2lkdGhcIjogMTUyLjlcbiAgICAgIH1cbiAgICB9XG4gIH1cbl1cbiIsIi8qKlxuICogSGVhZGVyIGNvbXBvbmVudFxuICogQGNsYXNzIEhlYWRlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfbG9nbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9sb2dvJyk7XG5cbnZhciBfbG9nbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2dvKTtcblxudmFyIF9saW5rX3NlcnZpY2UgPSByZXF1aXJlKCcuLi8uLi9zZXJ2aWNlcy9saW5rX3NlcnZpY2UnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqIEBsZW5kcyBIZWFkZXIgKi9cbnZhciBIZWFkZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGFiOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFiOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciB0YWIgPSBwcm9wcy50YWI7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF90YWJJdGVtID0gX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWJJdGVtLmNyZWF0ZUl0ZW07XG4gICAgdmFyIF9saW5rID0gZnVuY3Rpb24gX2xpbmsoKSB7XG4gICAgICByZXR1cm4gX2xpbmtfc2VydmljZS5zaW5nbGV0b24ucmVzb2x2ZUh0bWxMaW5rLmFwcGx5KF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXIsXG4gICAgICB7IGNsYXNzTmFtZTogJ2hlYWRlcicgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcENvbnRhaW5lcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJMb2dvLFxuICAgICAgICAgIHsgaHJlZjogX2xpbmsoJ2luZGV4Lmh0bWwnKSB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9sb2dvMi5kZWZhdWx0LCBudWxsKVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlclRhYixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkRPQ1NfUEFHRScpLCBfbGluaygnZG9jcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0RPQ1MnIH0pLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkNBU0VTX1BBR0UnKSwgX2xpbmsoJ2Nhc2VzLmh0bWwnKSwgeyBzZWxlY3RlZDogdGFiID09PSAnQ0FTRVMnIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSGVhZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9jb2xvcl9jb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEpvaW5lciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnSm9pbmVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2xvcjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgbGluZVdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IF9jb2xvcl9jb25zdGFudHMuRE9NSU5BTlQsXG4gICAgICBsaW5lV2lkdGg6IDRcbiAgICB9O1xuICB9LFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExheW91dE1peGluLCBfYXBlbWFuUmVhY3RNaXhpbnMuQXBQdXJlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgbGF5b3V0cyA9IHMubGF5b3V0cztcbiAgICB2YXIgY29sb3IgPSBwcm9wcy5jb2xvcjtcbiAgICB2YXIgbGluZVdpZHRoID0gcHJvcHMubGluZVdpZHRoO1xuICAgIHZhciBfbGF5b3V0cyRzdmcgPSBsYXlvdXRzLnN2ZztcbiAgICB2YXIgd2lkdGggPSBfbGF5b3V0cyRzdmcud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IF9sYXlvdXRzJHN2Zy5oZWlnaHQ7XG4gICAgdmFyIG1pblggPSAwO1xuICAgIHZhciBtaWRYID0gd2lkdGggLyAyO1xuICAgIHZhciBtYXhYID0gd2lkdGg7XG4gICAgdmFyIG1pblkgPSAwO1xuICAgIHZhciBtaWRZID0gaGVpZ2h0IC8gMjtcbiAgICB2YXIgbWF4WSA9IGhlaWdodDtcblxuICAgIHZhciBfbGluZSA9IGZ1bmN0aW9uIF9saW5lKHgxLCB4MiwgeTEsIHkyKSB7XG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2xpbmUnLCB7IHgxOiB4MSwgeDI6IHgyLCB5MTogeTEsIHkyOiB5MiB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHhUaWx0ID0gMC4xO1xuICAgIHZhciB5VGlsdCA9IDAuMztcblxuICAgIHZhciB4MSA9IG1pblg7XG4gICAgdmFyIHgyID0gbWlkWCAqICgxICsgeFRpbHQpO1xuICAgIHZhciB4MyA9IG1pZFggKiAoMSAtIHhUaWx0KTtcbiAgICB2YXIgeDQgPSBtYXhYO1xuICAgIHZhciB5MSA9IG1pZFk7XG4gICAgdmFyIHkyID0gbWlkWSAqICgxIC0geVRpbHQpO1xuICAgIHZhciB5MyA9IG1pZFkgKiAoMSArIHlUaWx0KTtcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ2pvaW5lcicsIHByb3BzLmNsYXNzTmFtZSksXG4gICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGpvaW5lcikge1xuICAgICAgICAgIHMuam9pbmVyID0gam9pbmVyO1xuICAgICAgICB9IH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3N2ZycsXG4gICAgICAgIHsgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcDogJ3JvdW5kJyxcbiAgICAgICAgICBzdHJva2VXaWR0aDogbGluZVdpZHRoXG4gICAgICAgIH0sXG4gICAgICAgIF9saW5lKHgxLCB4MiwgeTEsIHkyKSxcbiAgICAgICAgX2xpbmUoeDIsIHgzLCB5MiwgeTMpLFxuICAgICAgICBfbGluZSh4MywgeDQsIHkzLCB5MSlcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gRm9yIEFwTGF5b3V0TWl4aW5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0SW5pdGlhbExheW91dHM6IGZ1bmN0aW9uIGdldEluaXRpYWxMYXlvdXRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdmc6IHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiA0MCB9XG4gICAgfTtcbiAgfSxcbiAgY2FsY0xheW91dHM6IGZ1bmN0aW9uIGNhbGNMYXlvdXRzKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgam9pbmVyID0gcy5qb2luZXI7XG5cbiAgICBpZiAoIWpvaW5lcikge1xuICAgICAgcmV0dXJuIHMuZ2V0SW5pdGlhbExheW91dHMoKTtcbiAgICB9XG5cbiAgICB2YXIgX2pvaW5lciRnZXRCb3VuZGluZ0NsID0gam9pbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdmFyIHdpZHRoID0gX2pvaW5lciRnZXRCb3VuZGluZ0NsLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSBfam9pbmVyJGdldEJvdW5kaW5nQ2wuaGVpZ2h0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN2ZzogeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH1cbiAgICB9O1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSm9pbmVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgTG9nbyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTG9nbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdoMScsXG4gICAgICB7IGNsYXNzTmFtZTogJ2xvZ28nIH0sXG4gICAgICBsKCdsb2dvLkxPR08nKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBMb2dvOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3NnUmVhY3RDb21wb25lbnRzID0gcmVxdWlyZSgnc2ctcmVhY3QtY29tcG9uZW50cycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFZpZGVvID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdWaWRlbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwVG91Y2hNaXhpbl0sXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgd2lkdGg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWTogX3JlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ3ZpZGVvJywgcHJvcHMuY2xhc3NOYW1lKSB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdkaXYnLFxuICAgICAgICB7IGNsYXNzTmFtZTogJ3ZpZGVvLWlubmVyJyB9LFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfc2dSZWFjdENvbXBvbmVudHMuU2dWaWRlbywgeyBzcmM6IHByb3BzLnNyYyxcbiAgICAgICAgICBwbGF5ZXJSZWY6IGZ1bmN0aW9uIHBsYXllclJlZihwbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoaWRkZW46IHRydWUsXG4gICAgICAgICAgbXV0ZWQ6IHRydWUsXG4gICAgICAgICAgbG9vcDogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogJ3ZpZGVvLW92ZXJsYXknIH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFZpZGVvOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFZpZGVvQ2FudmFzID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdWaWRlb0NhbnZhcycsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgc3JjOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICB3aWR0aDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgaGVpZ2h0OiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICB0cmFuc2xhdGVYOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICB0cmFuc2xhdGVZOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IDE0OCxcbiAgICAgIGhlaWdodDogMTQ4XG4gICAgfTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgY2xhc3NOYW1lOiAoMCwgX2NsYXNzbmFtZXMyLmRlZmF1bHQpKCd2aWRlby1jYW52YXMnLCBwcm9wcy5jbGFzc05hbWUpIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ2RpdicsXG4gICAgICAgIHsgY2xhc3NOYW1lOiAndmlkZW8tY2FudmFzLWlubmVyJyB9LFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnY2FudmFzJywgeyB3aWR0aDogcHJvcHMud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBwcm9wcy5oZWlnaHQsXG4gICAgICAgICAgcmVmOiBmdW5jdGlvbiByZWYoY2FudmFzKSB7XG4gICAgICAgICAgICByZXR1cm4gcy5fY2FudmFzID0gY2FudmFzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICd2aWRlby1jYW52YXMtb3ZlcmxheScgfSlcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVmlkZW9DYW52YXM7IiwiLyoqXG4gKiBWaWV3IGZvciBzaG93Y2FzZVxuICogQGNsYXNzIFNob3djYXNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF92aWRlbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy92aWRlbycpO1xuXG52YXIgX3ZpZGVvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3ZpZGVvKTtcblxudmFyIF92aWRlb19jYW52YXMgPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvdmlkZW9fY2FudmFzJyk7XG5cbnZhciBfdmlkZW9fY2FudmFzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3ZpZGVvX2NhbnZhcyk7XG5cbnZhciBfam9pbmVyID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL2pvaW5lcicpO1xuXG52YXIgX2pvaW5lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9qb2luZXIpO1xuXG52YXIgX2NvbG9yX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4uLy4uL2NvbnN0YW50cy9jb2xvcl9jb25zdGFudHMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc2c6Y29tcG9uZW50OnNob3djYXNlJyk7XG5cbnZhciBBUlRJQ0xFUyA9IHJlcXVpcmUoJy4uL2RhdGEvYXJ0aWNsZXMuanNvbicpO1xuXG52YXIgU2hvd2Nhc2VWaWV3ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdTaG93Y2FzZVZpZXcnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgZGVidWcoJ3JlbmRlciBjYWxsZWQuJyk7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICB2YXIgX3NlY3Rpb24gPSBzLl9yZW5kZXJTZWN0aW9uO1xuICAgIC8vIOmWi+eZuuS4reOBriBzZWN0aW9uIOOBruaMv+WFpeODu+WFpeOCjOabv+OBiOOCkuWuueaYk+OBq+OBmeOCi+OBn+OCgVxuICAgIHZhciBmaXJzdCA9IHRydWU7XG4gICAgdmFyIHJldmVyc2VkID0gZnVuY3Rpb24gcmV2ZXJzZWQoKSB7XG4gICAgICBmaXJzdCA9ICFmaXJzdDtcbiAgICAgIHJldHVybiBmaXJzdDtcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlldyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlldycsXG4gICAgICAgIHNwaW5uaW5nOiAhcy5tb3VudGVkLFxuICAgICAgICBvblNjcm9sbDogcy5faGFuZGxlU2Nyb2xsXG4gICAgICB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3SGVhZGVyLCB7IHRpdGxlVGV4dDogbCgndGl0bGVzLlNIT1dDQVNFX1RJVExFJykgfSksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3Qm9keSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgJ2FydGljbGUnLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgQVJUSUNMRVMubWFwKGZ1bmN0aW9uIChhcnRpY2xlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NlY3Rpb24oYXJ0aWNsZS5uYW1lLCBhcnRpY2xlLmJvZHksIHJldmVyc2VkKCkpO1xuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gTGlmZUN5Y2xlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICAvLyBkZWZpbmVzIG1vdW50ZWQgdmFsdWVcbiAgICBzLm1vdW50ZWQgPSB0cnVlO1xuXG4gICAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICBzLmlzSVBob25lID0gLyhpUGhvbmV8aVBvZCkvLnRlc3QodWEpO1xuXG4gICAgLy8gZGVmaW5lcyB0aGlzLnZpZGVvc1xuICAgIHZhciB2aWRlb3MgPSBBUlRJQ0xFUy5tYXAoZnVuY3Rpb24gKGFydGljbGUsIGkpIHtcbiAgICAgIHZhciBuYW1lID0gYXJ0aWNsZS5uYW1lO1xuXG4gICAgICB2YXIgdmlkZW8gPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGluU2NyZWVuOiB0cnVlLFxuICAgICAgICBjb250YWluZXI6IHMuX3ZpZGVvQ29udGFpbmVyc1tuYW1lXSxcbiAgICAgICAgcGxheWVyOiB7XG4gICAgICAgICAgZWxlbWVudDogcy5fcGxheWVyc1tuYW1lXS5fcGxheWVyLFxuICAgICAgICAgIGNhblBsYXk6IGZhbHNlLFxuICAgICAgICAgIC8vIOWFiOmgreOBruWLleeUuzLjgaTjgaDjgZHoh6rli5Xlho3nlJ9cbiAgICAgICAgICBvbkNhblBsYXk6IGkgPD0gMSA/IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZpZGVvLnBsYXllci5jYW5QbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGRlYnVnKCdjYW5QbGF5ICcgKyBuYW1lKTtcbiAgICAgICAgICAgIHMuX3BsYXkodmlkZW8pO1xuICAgICAgICAgIH0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2aWRlby5wbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgICAgICBkZWJ1ZygnY2FuUGxheSAnICsgbmFtZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwbGF5aW5nOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBjYW52YXMxOiBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMxLFxuICAgICAgICBjYW52YXMyOiBzLl9jYW52YXNlc1tuYW1lXS5jYW52YXMyXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHZpZGVvO1xuICAgIH0pO1xuXG4gICAgdmlkZW9zLmZvckVhY2goZnVuY3Rpb24gKHZpZGVvKSB7XG4gICAgICB2YXIgcGxheWVyID0gdmlkZW8ucGxheWVyO1xuXG4gICAgICBwbGF5ZXIuZWxlbWVudC5sb2FkKCk7XG4gICAgICBwbGF5ZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIHBsYXllci5vbkNhblBsYXksIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIHMudmlkZW9zID0gdmlkZW9zO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHMudmlkZW9zLmZvckVhY2goZnVuY3Rpb24gKHZpZGVvKSB7XG4gICAgICBzLl9wYXVzZSh2aWRlbyk7XG4gICAgICB2YXIgcGxheWVyID0gdmlkZW8ucGxheWVyO1xuXG4gICAgICBwbGF5ZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RuZXIoJ2NhbnBsYXl0aHJvdWdoJywgcGxheWVyLm9uQ2FuUGxheSwgZmFsc2UpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEN1c3RvbVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG1vdW50ZWQ6IGZhbHNlLFxuICBpc0lQaG9uZTogZmFsc2UsXG4gIHZpZGVvczogW10sXG4gIF92aWRlb0NvbnRhaW5lcnM6IHt9LFxuICBfcGxheWVyczoge30sXG4gIF9jYW52YXNlczoge30sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUHJpdmF0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9yZW5kZXJTZWN0aW9uOiBmdW5jdGlvbiBfcmVuZGVyU2VjdGlvbihuYW1lLCBjb25maWcsIHJldmVyc2VkKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICB2YXIgdGl0bGUgPSBjb25maWcudGl0bGU7XG4gICAgdmFyIHRleHQgPSBjb25maWcudGV4dDtcbiAgICB2YXIgdmlkZW8gPSBjb25maWcudmlkZW87XG4gICAgdmFyIGNhbnZhczEgPSBjb25maWcuY2FudmFzMTtcbiAgICB2YXIgY2FudmFzMiA9IGNvbmZpZy5jYW52YXMyO1xuXG4gICAgcy5fY2FudmFzZXNbbmFtZV0gPSB7fTsgLy8gRXJyb3Ig5Zue6YG/XG4gICAgdmFyIHJlZnMgPSB7XG4gICAgICBjb250YWluZXI6IGZ1bmN0aW9uIGNvbnRhaW5lcihjKSB7XG4gICAgICAgIHMuX3ZpZGVvQ29udGFpbmVyc1tuYW1lXSA9IGM7XG4gICAgICB9LFxuICAgICAgdmlkZW86IGZ1bmN0aW9uIHZpZGVvKGMpIHtcbiAgICAgICAgcy5fcGxheWVyc1tuYW1lXSA9IGM7XG4gICAgICB9LFxuICAgICAgY2FudmFzOiBmdW5jdGlvbiBjYW52YXMobnRoKSB7XG4gICAgICAgIHZhciBjYW52YXNOYW1lID0gJ2NhbnZhcycgKyBudGg7XG4gICAgICAgIHZhciBjYW52YXNDb25mID0gbnRoID09PSAxID8gY2FudmFzMSA6IGNhbnZhczI7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYykge1xuICAgICAgICAgIHMuX2NhbnZhc2VzW25hbWVdW2NhbnZhc05hbWVdID0ge1xuICAgICAgICAgICAgZWxlbWVudDogYyxcbiAgICAgICAgICAgIGR4OiBjYW52YXNDb25mLmR4LFxuICAgICAgICAgICAgZHk6IGNhbnZhc0NvbmYuZHksXG4gICAgICAgICAgICB3aWR0aDogY2FudmFzQ29uZi53aWR0aCxcbiAgICAgICAgICAgIGFuaW1hdGlvbklkOiAwLFxuICAgICAgICAgICAgY3RpbWU6IDAsXG4gICAgICAgICAgICBsYXN0VGltZTogMFxuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb24sXG4gICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXNlY3Rpb24nLFxuICAgICAgICBpZDogJ3Nob3djYXNlLScgKyBuYW1lICsgJy1zZWN0aW9uJyxcbiAgICAgICAga2V5OiBuYW1lIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uSGVhZGVyLFxuICAgICAgICBudWxsLFxuICAgICAgICBsKCdzZWN0aW9ucy4nICsgdGl0bGUpXG4gICAgICApLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbkJvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdkaXYnLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdGV4dC1jb250YWluZXInIH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtZGVzY3JpcHRpb24nIH0sXG4gICAgICAgICAgICBbXS5jb25jYXQobCgnc2VjdGlvbnMuJyArIHRleHQpKS5tYXAoZnVuY3Rpb24gKHRleHQsIGkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdwJyxcbiAgICAgICAgICAgICAgICB7IGtleTogaSB9LFxuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZGVvLWNvbnRhaW5lcicsIHJlZjogcmVmcy5jb250YWluZXIgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfdmlkZW8yLmRlZmF1bHQsIHsgc3JjOiB2aWRlbywgcmVmOiByZWZzLnZpZGVvIH0pLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF92aWRlb19jYW52YXMyLmRlZmF1bHQsIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8nLCByZWY6IHJlZnMuY2FudmFzKDEpIH0pLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9qb2luZXIyLmRlZmF1bHQsIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2Utam9pbmVyJywgY29sb3I6IHJldmVyc2VkID8gX2NvbG9yX2NvbnN0YW50cy5ET01JTkFOVCA6ICd3aGl0ZScgfSksXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3ZpZGVvX2NhbnZhczIuZGVmYXVsdCwgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS12aWRlbycsIHJlZjogcmVmcy5jYW52YXMoMikgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG4gIF91cGRhdGVJblNjcmVlbjogZnVuY3Rpb24gX3VwZGF0ZUluU2NyZWVuKGNsaWVudEhlaWdodCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICBzLnZpZGVvcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWRlbywgaSkge1xuICAgICAgdmFyIHRvcCA9IHZpZGVvLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG4gICAgICB2YXIgbmV4dEluU2NyZWVuID0gY2xpZW50SGVpZ2h0IC0gdG9wID4gMCAmJiB0b3AgPiAwO1xuICAgICAgdmFyIHByZXZJblNjcmVlbiA9IHZpZGVvLmluU2NyZWVuO1xuICAgICAgaWYgKG5leHRJblNjcmVlbiA9PT0gcHJldkluU2NyZWVuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZpZGVvLmluU2NyZWVuID0gbmV4dEluU2NyZWVuO1xuICAgICAgaWYgKHZpZGVvLmluU2NyZWVuKSB7XG4gICAgICAgIHMuX3BsYXkodmlkZW8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5fcGF1c2UodmlkZW8pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfcGxheTogZnVuY3Rpb24gX3BsYXkodmlkZW8sIGZvcmNlKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwbGF5ZXIgPSB2aWRlby5wbGF5ZXI7XG5cbiAgICBpZiAoIWZvcmNlICYmICghcGxheWVyLmNhblBsYXkgfHwgcGxheWVyLnBsYXlpbmcpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlYnVnKCdwbGF5ICcgKyB2aWRlby5uYW1lKTtcblxuICAgIHBsYXllci5wbGF5aW5nID0gdHJ1ZTtcbiAgICB2YXIgcGxheSA9IHMuaXNJUGhvbmUgPyBzLl9wbGF5T25JUGhvbmUgOiBzLl9wbGF5T25QYztcbiAgICB2YXIgcGxheWVyRWxlbWVudCA9IHZpZGVvLnBsYXllci5lbGVtZW50O1xuICAgIHZhciBjYW52YXMxID0gdmlkZW8uY2FudmFzMTtcbiAgICB2YXIgY2FudmFzMiA9IHZpZGVvLmNhbnZhczI7XG5cblxuICAgIHBsYXkoY2FudmFzMSwgcGxheWVyRWxlbWVudCk7XG4gICAgcGxheShjYW52YXMyLCBwbGF5ZXJFbGVtZW50KTtcbiAgfSxcbiAgX3BsYXlPblBjOiBmdW5jdGlvbiBfcGxheU9uUGMoY2FudmFzLCBwbGF5ZXJFbGVtZW50KSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBjdHggPSBjYW52YXMuZWxlbWVudC5fY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIGxvb3AgPSBmdW5jdGlvbiBsb29wKCkge1xuICAgICAgcy5fZHJhdyhwbGF5ZXJFbGVtZW50LCBjYW52YXMsIGN0eCk7XG4gICAgICBjYW52YXMuYW5pbWF0aW9uSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApO1xuICAgIH07XG5cbiAgICBwbGF5ZXJFbGVtZW50LnBsYXkoKTtcbiAgICBzLl9zdGFydEFuaW1hdGlvbkZyYW1lKGNhbnZhcywgbG9vcCk7XG4gIH0sXG4gIF9wbGF5T25JUGhvbmU6IGZ1bmN0aW9uIF9wbGF5T25JUGhvbmUoY2FudmFzLCBwbGF5ZXJFbGVtZW50KSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBjdHggPSBjYW52YXMuZWxlbWVudC5fY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY2FudmFzLmxhc3RUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uIGxvb3AodGltZXN0YW1wKSB7XG4gICAgICB2YXIgZGlmZiA9IERhdGUubm93KCkgLSBjYW52YXMubGFzdFRpbWU7XG4gICAgICBjYW52YXMubGFzdFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgY2FudmFzLmN0aW1lICs9IGRpZmYgLyAxMDAwO1xuICAgICAgcGxheWVyRWxlbWVudC5jdXJyZW50VGltZSA9IGNhbnZhcy5jdGltZTtcbiAgICAgIHMuX2RyYXcocGxheWVyRWxlbWVudCwgY2FudmFzLCBjdHgpO1xuICAgICAgaWYgKHBsYXllckVsZW1lbnQuZHVyYXRpb24gPD0gcGxheWVyRWxlbWVudC5jdXJyZW50VGltZSkge1xuICAgICAgICBjYW52YXMuY3RpbWUgPSAwO1xuICAgICAgfVxuICAgICAgY2FudmFzLmFuaW1hdGlvbklkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICB9O1xuXG4gICAgcy5fc3RhcnRBbmltYXRpb25GcmFtZShjYW52YXMsIGxvb3ApO1xuICB9LFxuICBfc3RhcnRBbmltYXRpb25GcmFtZTogZnVuY3Rpb24gX3N0YXJ0QW5pbWF0aW9uRnJhbWUoY2FudmFzLCBsb29wKSB7XG4gICAgY2FudmFzLmFuaW1hdGlvbklkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgfSxcbiAgX2RyYXc6IGZ1bmN0aW9uIF9kcmF3KHBsYXllckVsZW1lbnQsIGNhbnZhcywgY3R4KSB7XG4gICAgY3R4LmRyYXdJbWFnZShwbGF5ZXJFbGVtZW50LCBjYW52YXMuZHgsIGNhbnZhcy5keSwgY2FudmFzLndpZHRoLCBjYW52YXMud2lkdGgsIDAsIDAsIDE0OCwgMTQ4KTtcbiAgfSxcbiAgX3BhdXNlOiBmdW5jdGlvbiBfcGF1c2UodmlkZW8pIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHBsYXllciA9IHZpZGVvLnBsYXllcjtcbiAgICB2YXIgY2FudmFzMSA9IHZpZGVvLmNhbnZhczE7XG4gICAgdmFyIGNhbnZhczIgPSB2aWRlby5jYW52YXMyO1xuXG4gICAgZGVidWcoJ3BhdXNlICcgKyB2aWRlby5uYW1lICsgJyBpZCAnICsgY2FudmFzMS5hbmltYXRpb25JZCArICcgJyArIGNhbnZhczIuYW5pbWF0aW9uSWQpO1xuICAgIHBsYXllci5wbGF5aW5nID0gZmFsc2U7XG4gICAgaWYgKCFzLmlzSVBob25lKSB7XG4gICAgICBwbGF5ZXIuZWxlbWVudC5wYXVzZSgpO1xuICAgIH1cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoY2FudmFzMS5hbmltYXRpb25JZCk7XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGNhbnZhczIuYW5pbWF0aW9uSWQpO1xuICB9LFxuICBfaGFuZGxlU2Nyb2xsOiBmdW5jdGlvbiBfaGFuZGxlU2Nyb2xsKGV2ZW50KSB7XG4gICAgdmFyIGNsaWVudEhlaWdodCA9IGV2ZW50LnRhcmdldC5jbGllbnRIZWlnaHQ7XG5cbiAgICB0aGlzLl91cGRhdGVJblNjcmVlbihjbGllbnRIZWlnaHQpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG93Y2FzZVZpZXc7IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIkRPTUlOQU5UXCI6IFwiI2Q2YjgxMFwiXG59IiwiLyoqXG4gKiBAY2xhc3MgTGlua1NlcnZpY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLyoqIEBsZW5kcyBMaW5rU2VydmljZSAqL1xuXG52YXIgTGlua1NlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIExpbmtTZXJ2aWNlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaW5rU2VydmljZSk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTGlua1NlcnZpY2UsIFt7XG4gICAga2V5OiAncmVzb2x2ZUh0bWxMaW5rJyxcblxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZSBhIGh0bWwgbGlua1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIEh0bWwgZmlsZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gLSBSZXNvbHZlZCBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZUh0bWxMaW5rKGZpbGVuYW1lKSB7XG4gICAgICB2YXIgcyA9IHRoaXM7XG4gICAgICB2YXIgbGFuZyA9IHMuX2dldExhbmcoKTtcbiAgICAgIHZhciBodG1sRGlyID0gbGFuZyA/ICdodG1sLycgKyBsYW5nIDogJ2h0bWwnO1xuICAgICAgcmV0dXJuIHBhdGguam9pbihodG1sRGlyLCBmaWxlbmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2dldExhbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0TGFuZygpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTEFORztcbiAgICAgIH1cbiAgICAgIHJldHVybiB3aW5kb3cubGFuZztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTGlua1NlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgTGlua1NlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihMaW5rU2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gTGlua1NlcnZpY2U7Il19
