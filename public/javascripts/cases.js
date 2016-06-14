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

// cached from whatever global is present so that test runners that stub it don't break things.
var cachedSetTimeout = setTimeout;
var cachedClearTimeout = clearTimeout;

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
},{"../../constants/color_constants.json":10,"apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","react":"react"}],7:[function(require,module,exports){
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
},{"apeman-react-mixins":"apeman-react-mixins","react":"react"}],8:[function(require,module,exports){
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

var _color_constants = require('../../constants/color_constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ShowcaseView = _react2.default.createClass({
  displayName: 'ShowcaseView',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  render: function render() {
    var s = this;
    var l = s.getLocale();
    var _section = s._renderSection;

    return _react2.default.createElement(
      _apemanReactBasic.ApView,
      { className: 'showcase-view',
        spinning: !s.mounted
      },
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
            reversed: false,
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
            reversed: true,
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
            reversed: false,
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
            reversed: true,
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
            reversed: false,
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
  },


  // -----------------
  // LifeCycle
  // -----------------

  componentDidMount: function componentDidMount() {
    var s = this;
    s.mounted = true;
  },


  // -----------------
  // Custom
  // -----------------

  mounted: false,

  // -----------------
  // Private
  // -----------------

  _renderSection: function _renderSection(name, config) {
    var title = config.title;
    var text = config.text;
    var video1 = config.video1;
    var video2 = config.video2;
    var reversed = config.reversed;

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
          _react2.default.createElement(_joiner2.default, { className: 'showcase-joiner', color: reversed ? _color_constants.DOMINANT : "white" }),
          _react2.default.createElement(_video2.default, _extends({ className: 'showcase-video' }, video2))
        )
      )
    );
  }
});

module.exports = ShowcaseView;
},{"../../constants/color_constants":10,"../fragments/joiner":6,"../fragments/video":8,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4yLjEvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMi4xL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjIuMS9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsImxpYi9icm93c2VyL2Nhc2VzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMiLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2pvaW5lci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvLmpzIiwibGliL2NvbXBvbmVudHMvdmlld3Mvc2hvd2Nhc2Vfdmlldy5qcyIsImxpYi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24iLCJsaWIvc2VydmljZXMvbGlua19zZXJ2aWNlLmpzIiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvYXBlbWFuLXByb2plY3RzL2FwZW1hbi1yZWFjdC1zd2l0Y2gvbGliL2FwX3N3aXRjaC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9hcGVtYW4tcHJvamVjdHMvYXBlbWFuLXJlYWN0LXN3aXRjaC9saWIvYXBfc3dpdGNoX3N0eWxlLmpzeCIsIm5vZGVfbW9kdWxlcy9hcGVtYW4tcmVhY3Qtc3dpdGNoL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcGVtYW5jb2xvci9saWIvYWxwaGEuanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2NvbG9yaXplcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2NvbG9yaXplcnMvcm90YXRlX2NvbG9yaXplci5qcyIsIm5vZGVfbW9kdWxlcy9hcGVtYW5jb2xvci9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2lzX2RhcmsuanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2lzX2xpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2FwZW1hbmNvbG9yL2xpYi9taXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL2FwZW1hbmNvbG9yL2xpYi9yb3RhdGUuanMiLCJub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9jb252ZXJzaW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1jb252ZXJ0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLW5hbWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL2NvbG9yLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zZy1raW5lY3QtY29uc3RhbnRzL2xpYi9kZXB0aF9zcGFjZS5qcyIsIm5vZGVfbW9kdWxlcy9zZy1raW5lY3QtY29uc3RhbnRzL2xpYi9oYW5kX3N0YXRlLmpzIiwibm9kZV9tb2R1bGVzL3NnLWtpbmVjdC1jb25zdGFudHMvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NnLWtpbmVjdC1jb25zdGFudHMvbGliL2pvaW50X3R5cGVzLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2NvbnN0YW50cy9hbmltYXRpb25fY29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2hlbHBlcnMvY29sb3JfaGVscGVyLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2hlbHBlcnMvZHJhd19oZWxwZXIuanMiLCJub2RlX21vZHVsZXMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvaW5kZXguanMiLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfYWxidW0uanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX2JvZHkuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX2J1dHRvbi5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfaGVhZC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfaGVhZGVyLmpzeCIsIi9Vc2Vycy9va3VuaXNoaW5pc2hpL1Byb2plY3RzL3JlYWxnbG9iZS1wcm9qZWN0cy9zZy1yZWFjdC1jb21wb25lbnRzL2xpYi9zZ19odG1sLmpzeCIsIi9Vc2Vycy9va3VuaXNoaW5pc2hpL1Byb2plY3RzL3JlYWxnbG9iZS1wcm9qZWN0cy9zZy1yZWFjdC1jb21wb25lbnRzL2xpYi9zZ19raW5lY3RfZnJhbWUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX21haW4uanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX21pY3JvcGhvbmUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3BhZ2UuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3N3aXRjaC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfdGhlbWVfc3R5bGUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3ZpZGVvLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3BEQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7OztBQUdBLElBQU0sV0FBVyxnQkFBTSxXQUFOLENBQWtCO0FBQUE7Ozs7Ozs7QUFNakMsYUFBVzs7QUFFVCxRQUFJ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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ25CQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7OztBQUdBLElBQU0sVUFBVSxnQkFBTSxXQUFOLENBQWtCO0FBQUE7OztBQUVoQyxhQUFXOzs7O0FBSVQsV0FBTyxpQkFBTSxNQUpKOzs7O0FBUVQsZUFBVyxpQkFBTSxLQVJSOzs7O0FBWVQsa0JBQWMsaUJBQU0sTUFaWDs7OztBQWdCVCw0QkFBd0IsaUJBQU0sTUFoQnJCOzs7O0FBb0JULGNBQVUsaUJBQU07QUFwQlAsR0FGcUI7O0FBeUJoQyxpQkF6QmdDLDZCQXlCYjtBQUNqQixXQUFPO0FBQ0wsaUJBQVcsRUFETjtBQUVMLGFBQU8sR0FGRjtBQUdMLG9CQUFjLENBSFQ7QUFJTCw4QkFBd0I7QUFKbkIsS0FBUDtBQU1ELEdBaEMrQjtBQWtDaEMsaUJBbENnQyw2QkFrQ2I7QUFDakIsV0FBTztBQUNMLFdBQUs7QUFEQSxLQUFQO0FBR0QsR0F0QytCO0FBd0NoQyxRQXhDZ0Msb0JBd0N0QjtBQUFBOztBQUNSLFFBQU0sSUFBSSxJQUFWO0FBRFEsUUFFRixLQUZFLEdBRWUsQ0FGZixDQUVGLEtBRkU7QUFBQSxRQUVLLEtBRkwsR0FFZSxDQUZmLENBRUssS0FGTDtBQUFBLFFBR0YsU0FIRSxHQUdZLEtBSFosQ0FHRixTQUhFOztBQUlSLFFBQUksUUFBUSxFQUFFLFFBQUYsRUFBWjs7QUFFQSxXQUNFO0FBQUE7TUFBQSxFQUFLLFdBQVksMEJBQVcsVUFBWCxFQUF1QixNQUFNLFNBQTdCLENBQWpCO0FBQ0ssZUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLE1BQU0sS0FBeEIsQ0FEYjtNQUVFO0FBQUE7UUFBQSxFQUFPLFdBQVUsZ0JBQWpCLEVBQWtDLE1BQUssVUFBdkM7UUFDSTtBQURKLE9BRkY7TUFLRTtBQUFBO1FBQUEsRUFBSyxXQUFVLG9CQUFmO1FBQ0U7QUFBQTtVQUFBLEVBQUssV0FBVSxpQkFBZjtVQUNFLGlFQUFjLE9BQVEsRUFBRSxNQUF4QixHQURGO1VBRUUsaUVBQWMsT0FBUSxFQUFFLE9BQXhCLEdBRkY7VUFHRTtBQUFBO1lBQUEsRUFBTSxXQUFVLGNBQWhCO1lBQUE7WUFBa0MsTUFBTSxHQUF4QztZQUFBO1lBQWtELFVBQVUsTUFBNUQ7WUFBQTtBQUFBO0FBSEYsU0FERjtRQU1FO0FBQUE7VUFBQSxFQUFLLFdBQVUsa0JBQWY7VUFDRTtBQUFBO1lBQUEsRUFBSyxXQUFVLG1CQUFmO1lBRU0sVUFBVSxHQUFWLENBQWMsVUFBQyxLQUFELEVBQVEsQ0FBUjtBQUFBLHFCQUNaLHVDQUFLLFdBQVUsY0FBZixFQUE4QixLQUFNLEtBQXBDLEVBQTRDLEtBQU0sQ0FBbEQsR0FEWTtBQUFBLGFBQWQ7QUFGTjtBQURGLFNBTkY7UUFlRTtBQUFBO1VBQUEsRUFBSyxXQUFVLG9CQUFmO1VBQ0UsdUNBQUssV0FBVSw2QkFBZixHQURGO1VBR0ksVUFBVSxHQUFWLENBQWMsVUFBQyxLQUFELEVBQVEsQ0FBUixFQUFjOztBQUUxQixnQkFBSSxNQUFNLFVBQVUsTUFBVixHQUFtQixDQUE3QjtBQUNBLG1CQUNFO0FBQUE7Y0FBQSxFQUFLLFdBQVUsK0JBQWYsRUFBK0MsS0FBTSxHQUFyRCxFQUEyRCxNQUFPLENBQWxFLEVBQXNFLFNBQVUsTUFBSyxNQUFyRjtjQUNFLHVDQUFLLFdBQVUsd0JBQWYsRUFBd0MsS0FBTSxLQUE5QyxFQUFzRCxLQUFNLEdBQTVEO0FBREYsYUFERjtBQUtELFdBUkQ7QUFISjtBQWZGO0FBTEYsS0FERjtBQXNDRCxHQXBGK0I7QUFzRmhDLDJCQXRGZ0MscUNBc0ZMLFNBdEZLLEVBc0ZNOztBQUVwQyxRQUFJLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsR0FBOEIsVUFBVSxTQUFWLENBQW9CLE1BQXRELEVBQThEO0FBQzVELFdBQUssUUFBTCxDQUFjLEtBQUssZUFBTCxFQUFkO0FBQ0Q7QUFDRixHQTNGK0I7QUE2RmhDLHFCQTdGZ0MsK0JBNkZYLFNBN0ZXLEVBNkZBLFNBN0ZBLEVBNkZXOztBQUV6QyxRQUFJLFdBQVcsS0FBSyxLQUFMLENBQVcsUUFBMUI7QUFDQSxRQUFJLFFBQUosRUFBYztBQUNaLGVBQVMsVUFBVSxHQUFWLEdBQWdCLENBQXpCO0FBQ0Q7QUFDRixHQW5HK0I7QUFxR2hDLFVBckdnQyxzQkFxR3BCO0FBQ1YsUUFBTSxJQUFJLElBQVY7QUFEVSxRQUVKLEtBRkksR0FFYSxDQUZiLENBRUosS0FGSTtBQUFBLFFBRUcsS0FGSCxHQUVhLENBRmIsQ0FFRyxLQUZIO0FBQUEsUUFHSixTQUhJLEdBR3VELEtBSHZELENBR0osU0FISTtBQUFBLFFBR08sS0FIUCxHQUd1RCxLQUh2RCxDQUdPLEtBSFA7QUFBQSxRQUdjLFlBSGQsR0FHdUQsS0FIdkQsQ0FHYyxZQUhkO0FBQUEsUUFHNEIsc0JBSDVCLEdBR3VELEtBSHZELENBRzRCLHNCQUg1Qjs7QUFJVixRQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQU4sR0FBWSxDQUFiLElBQWtCLEtBQXJDO0FBQ0EsUUFBSSxpQkFBaUIsUUFBUSxZQUE3QjtBQUNBLFFBQUksa0JBQWtCLGlCQUFpQixDQUFqQixHQUFxQixDQUEzQztBQUNBLFFBQUksZ0JBQWdCLGtCQUFrQixDQUFDLE1BQU0sR0FBTixHQUFZLENBQWIsSUFBa0IsWUFBcEMsQ0FBcEI7QUFDQSxRQUFJLGVBQWUsa0JBQWtCLEtBQUssS0FBTCxDQUFXLENBQUMsTUFBTSxHQUFOLEdBQVksQ0FBYixJQUFrQixZQUE3QixDQUFyQztBQUNBLGtEQUVPLEtBRlAsOERBTU8sS0FOUCxzR0FXTyxRQUFRLFVBQVUsTUFYekIscUVBY08sWUFkUCx3RUFrQk8sS0FsQlAsMkxBOEJPLEtBOUJQLGtKQXFDTyxjQXJDUCxxS0E2Q08sY0E3Q1AsdUJBOENRLGVBOUNSLHNPQXlETyxjQXpEUCx1QkEwRFEsZUExRFIsb0hBZ0VPLGNBaEVQLG1IQXNFTyxjQXRFUCx1QkF1RVEsZUF2RVIsMEZBMEVrQixzQkExRWxCLG1CQTJFTSxhQTNFTixvQkE0RUssWUE1RUw7QUErRUQsR0E3TCtCO0FBK0xoQyxTQS9MZ0MscUJBK0xyQjtBQUFBLFFBQ0gsS0FERyxHQUNjLElBRGQsQ0FDSCxLQURHO0FBQUEsUUFDSSxLQURKLEdBQ2MsSUFEZCxDQUNJLEtBREo7O0FBRVQsUUFBSSxNQUFNLE1BQU0sR0FBTixHQUFZLE1BQU0sU0FBTixDQUFnQixNQUE1QixHQUFxQyxDQUEvQztBQUNBLFNBQUssUUFBTCxDQUFjLEVBQUUsUUFBRixFQUFkO0FBQ0QsR0FuTStCO0FBcU1oQyxRQXJNZ0Msb0JBcU10QjtBQUFBLFFBQ0YsS0FERSxHQUNlLElBRGYsQ0FDRixLQURFO0FBQUEsUUFDSyxLQURMLEdBQ2UsSUFEZixDQUNLLEtBREw7O0FBRVIsUUFBSSxNQUFNLENBQUMsTUFBTSxHQUFOLEdBQVksTUFBTSxTQUFOLENBQWdCLE1BQTVCLEdBQXFDLENBQXRDLElBQTJDLE1BQU0sU0FBTixDQUFnQixNQUEzRCxHQUFvRSxDQUE5RTtBQUNBLFNBQUssUUFBTCxDQUFjLEVBQUUsUUFBRixFQUFkO0FBQ0QsR0F6TStCO0FBMk1oQyxRQTNNZ0Msa0JBMk14QixDQTNNd0IsRUEyTXJCO0FBQ1QsUUFBSSxNQUFNLE9BQU8sRUFBRSxNQUFGLENBQVMsVUFBVCxDQUFvQixJQUFwQixDQUF5QixLQUFoQyxJQUF5QyxDQUFuRDtBQUNBLFNBQUssUUFBTCxDQUFjLEVBQUUsUUFBRixFQUFkO0FBQ0Q7QUE5TStCLENBQWxCLENBQWhCOztrQkFpTmUsTzs7Ozs7Ozs7QUN4TmY7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7Ozs7OztBQUdBLElBQU0sU0FBUyxnQkFBTSxXQUFOLENBQWtCO0FBQUE7Ozs7Ozs7QUFNL0IsUUFOK0Isb0JBTXJCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFZSxDQUZmLENBRUYsS0FGRTtBQUFBLFFBRUssS0FGTCxHQUVlLENBRmYsQ0FFSyxLQUZMOzs7QUFJUixXQUNFO0FBQUE7TUFBQSxhQUFhLEtBQWI7QUFDRSxtQkFBWSwwQkFBVyxTQUFYLEVBQXNCLE1BQU0sU0FBNUIsQ0FEZDtBQUVFLGVBQVEsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixNQUFNLEtBQXhCLENBRlY7TUFHSSxNQUFNO0FBSFYsS0FERjtBQU9EO0FBakI4QixDQUFsQixDQUFmOztrQkFxQmUsTTs7Ozs7Ozs7QUM1QmY7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7Ozs7OztBQUdBLElBQU0sV0FBVyxnQkFBTSxXQUFOLENBQWtCO0FBQUE7Ozs7Ozs7QUFNakMsUUFOaUMsb0JBTXZCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFZSxDQUZmLENBRUYsS0FGRTtBQUFBLFFBRUssS0FGTCxHQUVlLENBRmYsQ0FFSyxLQUZMOzs7QUFJUixXQUNFO0FBQUE7TUFBQSxhQUFlLEtBQWY7QUFDRSxtQkFBWSwwQkFBVyxXQUFYLEVBQXdCLE1BQU0sU0FBOUIsQ0FEZDtBQUVFLGVBQVEsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixNQUFNLEtBQXhCLENBRlY7TUFHSSxNQUFNO0FBSFYsS0FERjtBQU9EO0FBakJnQyxDQUFsQixDQUFqQjs7a0JBcUJlLFE7Ozs7Ozs7O0FDNUJmOzs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7QUFHQSxJQUFNLFNBQVMsZ0JBQU0sV0FBTixDQUFrQjtBQUFBOzs7Ozs7O0FBTS9CLFFBTitCLG9CQU1yQjtBQUNSLFFBQU0sSUFBSSxJQUFWO0FBRFEsUUFFRixLQUZFLEdBRWUsQ0FGZixDQUVGLEtBRkU7QUFBQSxRQUVLLEtBRkwsR0FFZSxDQUZmLENBRUssS0FGTDs7O0FBSVIsV0FDRTtBQUFBO01BQUEsYUFBYSxLQUFiO0FBQ0UsbUJBQVksMEJBQVcsU0FBWCxFQUFzQixNQUFNLFNBQTVCLENBRGQ7QUFFRSxlQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsTUFBTSxLQUF4QixDQUZWO01BR0ksTUFBTTtBQUhWLEtBREY7QUFPRDtBQWpCOEIsQ0FBbEIsQ0FBZjs7a0JBcUJlLE07Ozs7Ozs7O0FDNUJmOzs7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7O0FBR0EsSUFBTSxXQUFXLGdCQUFNLFdBQU4sQ0FBa0I7QUFBQTs7Ozs7OztBQU1qQyxRQU5pQyxvQkFNdkI7QUFDUixRQUFNLElBQUksSUFBVjtBQURRLFFBRUYsS0FGRSxHQUVlLENBRmYsQ0FFRixLQUZFO0FBQUEsUUFFSyxLQUZMLEdBRWUsQ0FGZixDQUVLLEtBRkw7OztBQUlSLFdBQ0U7QUFBQTtNQUFBLEVBQUssV0FBWSwwQkFBVyxXQUFYLEVBQXdCLE1BQU0sU0FBOUIsQ0FBakI7QUFDSyxlQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsTUFBTSxLQUF4QixDQURiO01BRUksTUFBTTtBQUZWLEtBREY7QUFNRDtBQWhCZ0MsQ0FBbEIsQ0FBakI7O2tCQW9CZSxROzs7Ozs7OztBQzFCZjs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7OztBQUdBLElBQU0sU0FBUyxnQkFBTSxXQUFOLENBQWtCO0FBQUE7Ozs7Ozs7QUFNL0IsUUFOK0Isb0JBTXJCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFZSxDQUZmLENBRUYsS0FGRTtBQUFBLFFBRUssS0FGTCxHQUVlLENBRmYsQ0FFSyxLQUZMOzs7QUFJUixXQUNFO0FBQUE7TUFBQSxFQUFRLFdBQVksMEJBQVcsU0FBWCxFQUFzQixNQUFNLFNBQTVCLENBQXBCO0FBQ1EsZUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLE1BQU0sS0FBeEIsQ0FEaEI7TUFFSSxNQUFNO0FBRlYsS0FERjtBQU1EO0FBaEI4QixDQUFsQixDQUFmOztrQkFvQmUsTTs7Ozs7Ozs7QUMzQmY7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztJQUFZLFU7O0FBQ1o7O0lBQVksVzs7Ozs7Ozs7O0FBR1osSUFBTSxnQkFBZ0IsZ0JBQU0sV0FBTixDQUFrQjtBQUFBOzs7Ozs7O0FBTXRDLGFBQVc7O0FBRVQsWUFBUSxpQkFBTSxLQUZMOztBQUlULFdBQU8saUJBQU0sTUFKSjs7QUFNVCxZQUFRLGlCQUFNLE1BTkw7O0FBUVQsZ0JBQVksaUJBQU0sTUFSVDs7QUFVVCxpQkFBYSxpQkFBTSxNQVZWOztBQVlULFdBQU8saUJBQU0sTUFaSjs7QUFjVCxTQUFLLGlCQUFNLE1BZEY7O0FBZ0JULGVBQVcsaUJBQU07QUFoQlIsR0FOMkI7O0FBeUJ0QyxpQkF6QnNDLDZCQXlCbkI7QUFDakIsV0FBTztBQUNMLGFBQU8sOEJBQVcsV0FEYjtBQUVMLGNBQVEsOEJBQVcsWUFGZDtBQUdMLGtCQUFZLENBSFA7QUFJTCxtQkFBYSxDQUpSO0FBS0wsYUFBTyxDQUxGO0FBTUwsV0FBSyxlQU5BO0FBT0wsaUJBQVcsWUFBWSxlQUFaLENBQTRCLFNBQTVCO0FBUE4sS0FBUDtBQVNELEdBbkNxQzs7O0FBcUN0QyxXQUFTLEVBckM2Qjs7QUF1Q3RDLFFBdkNzQyxvQkF1QzVCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFZSxDQUZmLENBRUYsS0FGRTtBQUFBLFFBRUssS0FGTCxHQUVlLENBRmYsQ0FFSyxLQUZMO0FBQUEsUUFHRixLQUhFLEdBR3VCLEtBSHZCLENBR0YsS0FIRTtBQUFBLFFBR0ssTUFITCxHQUd1QixLQUh2QixDQUdLLE1BSEw7QUFBQSxRQUdhLEtBSGIsR0FHdUIsS0FIdkIsQ0FHYSxLQUhiOztBQUlSLFFBQUksUUFBUSxFQUFFLFFBQUYsRUFBWjtBQUNBLFFBQUksVUFBVSxFQUFFLFNBQUYsR0FBYyxNQUFkLEtBQXlCLENBQXZDO0FBQ0EsV0FDRTtBQUFBO01BQUEsRUFBSyxXQUFZLDBCQUFXLGtCQUFYLEVBQStCLE1BQU0sU0FBckMsQ0FBakI7QUFDSyxlQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFDTCxNQUFNLElBREQsRUFDTyxNQUFNLEtBRGIsQ0FEYjtNQUdJLFVBQVUsRUFBRSxVQUFGLENBQWEsTUFBTSxHQUFuQixDQUFWLEdBQW9DLElBSHhDO01BSUUsMENBQVEsT0FBUSxRQUFRLEtBQXhCO0FBQ1EsZ0JBQVMsU0FBUyxLQUQxQjtBQUVRLGVBQVEsT0FBTyxNQUFQLENBQWM7QUFDcEIsc0JBRG9CLEVBQ2I7QUFEYSxTQUFkLENBRmhCO0FBS1EsYUFBTSxhQUFDLE1BQUQ7QUFBQSxpQkFBWSxFQUFFLGNBQUYsQ0FBaUIsTUFBakIsQ0FBWjtBQUFBLFNBTGQsR0FKRjtNQVVJLE1BQU07QUFWVixLQURGO0FBY0QsR0EzRHFDO0FBNkR0QyxvQkE3RHNDLGdDQTZEaEI7QUFDcEIsUUFBTSxJQUFJLElBQVY7QUFDQSxNQUFFLGVBQUYsR0FBb0IsRUFBcEI7QUFDRCxHQWhFcUM7QUFrRXRDLDJCQWxFc0MscUNBa0VYLFNBbEVXLEVBa0VBO0FBQ3BDLFFBQU0sSUFBSSxJQUFWO0FBQ0EsTUFBRSxRQUFGLENBQVcsRUFBRSxTQUFGLEVBQVg7QUFDRCxHQXJFcUM7QUF1RXRDLG1CQXZFc0MsK0JBdUVqQjtBQUNuQixRQUFNLElBQUksSUFBVjtBQUNBLE1BQUUsUUFBRixDQUFXLEVBQUUsU0FBRixFQUFYO0FBQ0QsR0ExRXFDO0FBNEV0QyxvQkE1RXNDLGdDQTRFaEI7QUFDcEIsUUFBTSxJQUFJLElBQVY7QUFDQSxNQUFFLFFBQUYsQ0FBVyxFQUFFLFNBQUYsRUFBWDtBQUNELEdBL0VxQzs7Ozs7OztBQXFGdEMsVUFyRnNDLG9CQXFGNUIsTUFyRjRCLEVBcUZwQjtBQUNoQixRQUFNLElBQUksSUFBVjtBQURnQixRQUVWLE1BRlUsR0FFQyxDQUZELENBRVYsTUFGVTs7O0FBSWhCLFFBQUksQ0FBQyxNQUFMLEVBQWE7QUFDWDtBQUNEOztBQU5lLFFBU2QsVUFUYyxpQ0FTZCxVQVRjO0FBQUEsUUFTRixTQVRFLGlDQVNGLFNBVEU7QUFBQSxRQVNTLElBVFQsaUNBU1MsSUFUVDtBQUFBLFFBU2UsSUFUZixpQ0FTZSxJQVRmO0FBQUEsUUFTcUIsYUFUckIsaUNBU3FCLGFBVHJCO0FBQUEsUUFVZCxVQVZjLGlDQVVkLFVBVmM7QUFBQSxRQVVGLFVBVkUsaUNBVUYsVUFWRTtBQUFBLFFBVVUsU0FWVixpQ0FVVSxTQVZWO0FBQUEsUUFVcUIsY0FWckIsaUNBVXFCLGNBVnJCO0FBQUEsUUFXZCxXQVhjLGlDQVdkLFdBWGM7QUFBQSxRQVdELFdBWEMsaUNBV0QsV0FYQztBQUFBLFFBV1ksVUFYWixpQ0FXWSxVQVhaO0FBQUEsUUFXd0IsUUFYeEIsaUNBV3dCLFFBWHhCO0FBQUEsUUFXa0MsU0FYbEMsaUNBV2tDLFNBWGxDO0FBQUEsUUFZZCxVQVpjLGlDQVlkLFVBWmM7QUFBQSxRQVlGLFNBWkUsaUNBWUYsU0FaRTtBQUFBLFFBWVMsU0FaVCxpQ0FZUyxTQVpUO0FBQUEsUUFZb0IsVUFacEIsaUNBWW9CLFVBWnBCO0FBQUEsUUFZZ0MsV0FaaEMsaUNBWWdDLFdBWmhDO0FBQUEsUUFhZCxVQWJjLGlDQWFkLFVBYmM7QUFBQSxRQWFGLGNBYkUsaUNBYUYsY0FiRTtBQUFBLFFBYWMsYUFiZCxpQ0FhYyxhQWJkO0FBQUEsUUFhNkIsVUFiN0IsaUNBYTZCLFVBYjdCO0FBQUEsUUFjZCxjQWRjLGlDQWNkLGNBZGM7QUFBQSxRQWNFLFdBZEYsaUNBY0UsV0FkRjtBQUFBLFFBaUJWLEtBakJVLEdBaUJBLENBakJBLENBaUJWLEtBakJVO0FBQUEsUUFrQlYsS0FsQlUsR0FrQm1ELEtBbEJuRCxDQWtCVixLQWxCVTtBQUFBLFFBa0JILE1BbEJHLEdBa0JtRCxLQWxCbkQsQ0FrQkgsTUFsQkc7QUFBQSxRQWtCSyxVQWxCTCxHQWtCbUQsS0FsQm5ELENBa0JLLFVBbEJMO0FBQUEsUUFrQmlCLFdBbEJqQixHQWtCbUQsS0FsQm5ELENBa0JpQixXQWxCakI7QUFBQSxRQWtCOEIsS0FsQjlCLEdBa0JtRCxLQWxCbkQsQ0FrQjhCLEtBbEI5QjtBQUFBLFFBa0JxQyxTQWxCckMsR0FrQm1ELEtBbEJuRCxDQWtCcUMsU0FsQnJDOzs7QUFvQmhCLFFBQUksTUFBTSxPQUFPLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBVjtBQUNBLFFBQUksSUFBSjs7QUFyQmdCLFFBdUJSLFVBdkJRLEdBdUJpQixVQXZCakIsQ0F1QlIsVUF2QlE7QUFBQSxRQXVCSSxRQXZCSixHQXVCaUIsVUF2QmpCLENBdUJJLFFBdkJKOztBQXdCaEIsUUFBSSxVQUFVLFNBQVYsT0FBVSxDQUFDLEtBQUQ7QUFBQSxhQUFZO0FBQ3hCLFdBQUcsTUFBTSxNQUFOLEdBQWUsS0FETTtBQUV4QixXQUFHLE1BQU0sTUFBTixHQUFlO0FBRk0sT0FBWjtBQUFBLEtBQWQ7O0FBS0EsUUFBSSxLQUFKLENBQVUsS0FBVixFQUFpQixLQUFqQjtBQUNBLFFBQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBb0IsS0FBcEIsRUFBMkIsTUFBM0I7O0FBOUJnQjtBQUFBO0FBQUE7O0FBQUE7QUFnQ2hCLDJCQUFpQixNQUFqQiw4SEFBeUI7QUFBQSxZQUFoQixJQUFnQjtBQUFBLFlBQ2pCLE1BRGlCLEdBQ00sSUFETixDQUNqQixNQURpQjtBQUFBLFlBQ1QsVUFEUyxHQUNNLElBRE4sQ0FDVCxVQURTOzs7QUFHdkIsWUFBSSxRQUFRLHdCQUFzQixVQUF0QixDQUFaO0FBQ0EsWUFBSSxTQUFTLE9BQU8sR0FBUCxDQUFXLE9BQVgsQ0FBYjs7QUFFQSxZQUFJLFNBQUosR0FBZ0IsS0FBaEI7QUFDQSxZQUFJLFdBQUosR0FBa0Isc0JBQVksS0FBWixDQUFrQixLQUFsQixFQUF5QixLQUF6QixDQUErQixJQUEvQixFQUFxQyxVQUFyQyxFQUFsQjtBQUNBLFlBQUksU0FBSixHQUFnQixVQUFoQjs7QUFFQSxZQUFJLFNBQVMsT0FBUSxVQUFSLENBQWI7QUFDQSxZQUFJLFNBQVMsT0FBUSxTQUFSLENBQWI7QUFDQSxZQUFJLE9BQU8sT0FBUSxJQUFSLENBQVg7QUFDQSxZQUFJLE9BQU8sT0FBUSxJQUFSLENBQVg7QUFDQSxZQUFJLFlBQVksT0FBUSxhQUFSLENBQWhCO0FBQ0EsWUFBSSxTQUFTLE9BQVEsVUFBUixDQUFiO0FBQ0EsWUFBSSxTQUFTLE9BQVEsVUFBUixDQUFiO0FBQ0EsWUFBSSxRQUFRLE9BQVEsU0FBUixDQUFaO0FBQ0EsWUFBSSxZQUFZLE9BQVEsY0FBUixDQUFoQjtBQUNBLFlBQUksU0FBUyxPQUFRLFdBQVIsQ0FBYjtBQUNBLFlBQUksU0FBUyxPQUFRLFdBQVIsQ0FBYjtBQUNBLFlBQUksUUFBUSxPQUFRLFVBQVIsQ0FBWjtBQUNBLFlBQUksT0FBTyxPQUFRLFFBQVIsQ0FBWDtBQUNBLFlBQUksUUFBUSxPQUFRLFNBQVIsQ0FBWjtBQUNBLFlBQUksU0FBUyxPQUFRLFVBQVIsQ0FBYjtBQUNBLFlBQUksUUFBUSxPQUFRLFNBQVIsQ0FBWjtBQUNBLFlBQUksT0FBTyxPQUFRLFNBQVIsQ0FBWDtBQUNBLFlBQUksUUFBUSxPQUFRLFVBQVIsQ0FBWjtBQUNBLFlBQUksU0FBUyxPQUFRLFdBQVIsQ0FBYjtBQUNBLFlBQUksUUFBUSxPQUFRLFVBQVIsQ0FBWjtBQUNBLFlBQUksZ0JBQWdCLE9BQVEsY0FBUixDQUFwQjtBQUNBLFlBQUksV0FBVyxPQUFRLGFBQVIsQ0FBZjtBQUNBLFlBQUksU0FBUyxPQUFRLFVBQVIsQ0FBYjtBQUNBLFlBQUksV0FBVyxPQUFRLGNBQVIsQ0FBZjtBQUNBLFlBQUksU0FBUyxPQUFRLFdBQVIsQ0FBYjs7O0FBR0E7QUFDRSxjQUFJLGFBQWEsQ0FDZixDQUFFLElBQUYsRUFBUSxJQUFSLEVBQWMsYUFBZCxFQUE2QixNQUE3QixFQUFxQyxNQUFyQyxDQURlLEVBRWYsQ0FBRSxhQUFGLEVBQWlCLFNBQWpCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLEVBQTRDLEtBQTVDLEVBQW1ELFFBQW5ELEVBQTZELE1BQTdELENBRmUsRUFHZixDQUFFLE1BQUYsRUFBVSxJQUFWLEVBQWdCLEtBQWhCLEVBQXVCLE1BQXZCLEVBQStCLEtBQS9CLENBSGUsRUFJZixDQUFFLGFBQUYsRUFBaUIsU0FBakIsRUFBNEIsTUFBNUIsRUFBb0MsTUFBcEMsRUFBNEMsS0FBNUMsRUFBbUQsUUFBbkQsRUFBNkQsTUFBN0QsQ0FKZSxFQUtmLENBQUUsTUFBRixFQUFVLElBQVYsRUFBZ0IsS0FBaEIsRUFBdUIsTUFBdkIsRUFBK0IsS0FBL0IsQ0FMZSxDQUFqQjtBQURGO0FBQUE7QUFBQTs7QUFBQTtBQVFFLGtDQUFzQixVQUF0QixtSUFBa0M7QUFBQSxrQkFBekIsU0FBeUI7O0FBQ2hDLHlDQUFTLEdBQVQsNEJBQWlCLFNBQWpCO0FBQ0Q7QUFWSDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBV0M7OztBQUdEO0FBQ0UsY0FBTSxTQUFTLFdBQWY7QUFDQSxjQUFJLGVBQWUsQ0FDakIsSUFEaUIsRUFDWCxJQURXLEVBQ0wsYUFESyxFQUNVLE1BRFYsRUFDa0IsTUFEbEIsRUFFakIsU0FGaUIsRUFFTixJQUZNLEVBRUEsTUFGQSxFQUVRLE1BRlIsRUFHakIsU0FIaUIsRUFHTixJQUhNLEVBR0EsTUFIQSxFQUdRLE1BSFIsRUFJakIsS0FKaUIsRUFJVixRQUpVLEVBSUEsTUFKQSxFQUtqQixLQUxpQixFQUtWLFFBTFUsRUFLQSxNQUxBLENBQW5CO0FBRkY7QUFBQTtBQUFBOztBQUFBO0FBU0Usa0NBQXdCLFlBQXhCLG1JQUFzQztBQUFBLGtCQUE3QixXQUE2Qjs7QUFDcEMseUJBQVcsR0FBWCxFQUFnQixXQUFoQixFQUE2QixNQUE3QjtBQUNEO0FBWEg7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVlDO0FBQ0Y7QUFoR2U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFrR2hCLFFBQUksT0FBSjtBQUNELEdBeExxQzs7Ozs7OztBQThMdEMsZ0JBOUxzQywwQkE4THRCLE1BOUxzQixFQThMZDtBQUN0QixRQUFNLElBQUksSUFBVjtBQUNBLE1BQUUsTUFBRixHQUFXLE1BQVg7QUFDRCxHQWpNcUM7QUFtTXRDLFVBbk1zQyxzQkFtTTFCO0FBQ1YsV0FBTztBQUNMLFlBQU07QUFDSixrQkFBVTtBQUROLE9BREQ7QUFJTCxXQUFLO0FBQ0gsa0JBQVUsVUFEUDtBQUVILGlCQUFTLE1BRk47QUFHSCx3QkFBZ0IsUUFIYjtBQUlILG9CQUFZLFFBSlQ7QUFLSCxlQUFPLE1BTEo7QUFNSCxjQUFNLENBTkg7QUFPSCxhQUFLLENBUEY7QUFRSCxlQUFPLENBUko7QUFTSCxnQkFBUSxDQVRMO0FBVUgsb0JBQVksaUJBVlQ7QUFXSCxrQkFBVSxNQVhQO0FBWUgsZ0JBQVEsR0FaTDtBQWFILG9CQUFZLEtBYlQ7QUFjSCxtQkFBVyxZQWRSO0FBZUgsbUJBQVc7QUFmUjtBQUpBLEtBQVA7QUFzQkQsR0ExTnFDO0FBNE50QyxXQTVOc0MsdUJBNE56QjtBQUNYLFFBQU0sSUFBSSxJQUFWO0FBRFcsUUFFTCxLQUZLLEdBRUssQ0FGTCxDQUVMLEtBRks7O0FBR1gsV0FBTyxDQUFDLE1BQU0sTUFBTixJQUFnQixFQUFqQixFQUNKLE1BREksQ0FDRyxVQUFDLElBQUQ7QUFBQSxhQUFVLENBQUMsQ0FBQyxJQUFaO0FBQUEsS0FESCxFQUVKLE1BRkksQ0FFRyxVQUFDLElBQUQ7QUFBQSxhQUFVLEtBQUssT0FBZjtBQUFBLEtBRkgsQ0FBUDtBQUdELEdBbE9xQztBQW9PdEMsWUFwT3NDLHNCQW9PMUIsS0FwTzBCLEVBb09uQjtBQUNqQixRQUFNLElBQUksSUFBVjtBQURpQixRQUVYLEtBRlcsR0FFRCxDQUZDLENBRVgsS0FGVzs7QUFHakIsV0FDRTtBQUFBO01BQUEsRUFBSyxXQUFVLHNCQUFmLEVBQXNDLE9BQVE7QUFBOUM7TUFDRyxNQUFNO0FBRFQsS0FERjtBQUlELEdBM09xQzs7O0FBNk90QyxVQUFRLElBN084Qjs7QUErT3RDLG1CQUFpQjs7QUEvT3FCLENBQWxCLENBQXRCOztrQkFtUGUsYTs7Ozs7Ozs7QUM3UGY7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7Ozs7QUFHQSxJQUFNLFNBQVMsZ0JBQU0sV0FBTixDQUFrQjtBQUFBOzs7Ozs7O0FBTS9CLFFBTitCLG9CQU1yQjtBQUNSLFFBQU0sSUFBSSxJQUFWO0FBRFEsUUFFRixLQUZFLEdBRWUsQ0FGZixDQUVGLEtBRkU7QUFBQSxRQUVLLEtBRkwsR0FFZSxDQUZmLENBRUssS0FGTDs7O0FBSVIsV0FDRTtBQUFBO01BQUEsRUFBSyxXQUFZLDBCQUFXLFNBQVgsRUFBc0IsTUFBTSxTQUE1QixDQUFqQjtBQUNLLGVBQVEsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixNQUFNLEtBQXhCLENBRGI7TUFFSSxNQUFNO0FBRlYsS0FERjtBQU1EO0FBaEI4QixDQUFsQixDQUFmOztrQkFvQmUsTTs7Ozs7OztBQzNCZjs7QUFFQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7ZUFFa0MsUUFBUSxpQ0FBUixDOztJQUExQixxQixZQUFBLHFCOzs7O0FBR1IsSUFBTSxlQUFlLGdCQUFNLFdBQU4sQ0FBa0I7QUFBQTs7Ozs7OztBQU1yQyxhQUFXO0FBQ1QsV0FBTyxpQkFBTSxNQURKO0FBRVQsWUFBUSxpQkFBTSxNQUZMO0FBR1QsUUFBSSxpQkFBTTtBQUhELEdBTjBCOztBQVlyQyxXQUFTO0FBQ1A7QUFETyxHQVo0Qjs7QUFnQnJDLFVBQVEsaUVBaEI2Qjs7QUFxQnJDLGlCQXJCcUMsNkJBcUJsQjtBQUNqQixXQUFPO0FBQ0wsYUFBTyxFQURGO0FBRUwsY0FBUSxFQUZIO0FBR0wsVUFBSTtBQUhDLEtBQVA7QUFLRCxHQTNCb0M7QUE2QnJDLGlCQTdCcUMsNkJBNkJsQjtBQUNqQixXQUFPO0FBQ0wsZ0JBQVU7QUFETCxLQUFQO0FBR0QsR0FqQ29DO0FBbUNyQyxRQW5DcUMsb0JBbUMzQjtBQUNSLFFBQU0sSUFBSSxJQUFWO0FBQ0EsUUFBSSxRQUFRLEVBQUUsUUFBRixFQUFaO0FBRlEsUUFHRixLQUhFLEdBR2UsQ0FIZixDQUdGLEtBSEU7QUFBQSxRQUdLLEtBSEwsR0FHZSxDQUhmLENBR0ssS0FITDtBQUFBLFFBSUYsRUFKRSxHQUlLLEtBSkwsQ0FJRixFQUpFOztBQUtSLFdBQ0U7QUFBQTtNQUFBLEVBQUcsV0FBWSwwQkFBVyxlQUFYLEVBQTRCO0FBQ3pDLDhCQUFvQjtBQURxQixTQUE1QixDQUFmO0FBR0csZUFBUSxNQUFNLElBSGpCO01BSUUsdUNBQUssV0FBWSwwQkFBVyxvQkFBWCxFQUFpQztBQUNsRCx5Q0FBK0IsTUFBTTtBQURhLFNBQWpDLENBQWpCLEdBSkY7TUFPRSwwREFBUSxXQUFVLHFDQUFsQjtBQUNRLGVBQVEsTUFBTTtBQUR0QjtBQVBGLEtBREY7QUFhRCxHQXJEb0M7Ozs7Ozs7QUEyRHJDLG1CQTNEcUMsK0JBMkRoQjtBQUNuQixRQUFNLElBQUksSUFBVjtBQUNBLE1BQUUsY0FBRixHQUFtQixZQUFZLFlBQU07QUFBQSxVQUMzQixLQUQyQixHQUNWLENBRFUsQ0FDM0IsS0FEMkI7QUFBQSxVQUNwQixLQURvQixHQUNWLENBRFUsQ0FDcEIsS0FEb0I7O0FBRW5DLFVBQUksTUFBTSxFQUFWLEVBQWM7QUFDWixVQUFFLFFBQUYsQ0FBVztBQUNULG9CQUFVLENBQUMsTUFBTTtBQURSLFNBQVg7QUFHRDtBQUNGLEtBUGtCLEVBT2hCLHFCQVBnQixDQUFuQjtBQVFELEdBckVvQztBQXVFckMsc0JBdkVxQyxrQ0F1RWI7QUFDdEIsUUFBTSxJQUFJLElBQVY7QUFDQSxrQkFBYyxFQUFFLGNBQWhCO0FBQ0QsR0ExRW9DOzs7Ozs7O0FBZ0ZyQyxVQWhGcUMsc0JBZ0Z6QjtBQUNWLFFBQU0sSUFBSSxJQUFWO0FBRFUsUUFFSixLQUZJLEdBRU0sQ0FGTixDQUVKLEtBRkk7QUFBQSxRQUdKLEtBSEksR0FHYyxLQUhkLENBR0osS0FISTtBQUFBLFFBR0csTUFISCxHQUdjLEtBSGQsQ0FHRyxNQUhIOztBQUlWLFdBQU87QUFDTCxZQUFNO0FBQ0osb0JBREk7QUFFSjtBQUZJLE9BREQ7QUFLTCxZQUFNO0FBQ0osa0JBQVUsU0FBUztBQURmO0FBTEQsS0FBUDtBQVNEO0FBN0ZvQyxDQUFsQixDQUFyQjs7QUFnR0EsT0FBTyxPQUFQLEdBQWlCLFlBQWpCOzs7Ozs7OztBQ3pHQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7Ozs7OztBQUdBLElBQU0sU0FBUyxnQkFBTSxXQUFOLENBQWtCO0FBQUE7Ozs7Ozs7QUFNL0IsUUFOK0Isb0JBTXJCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFZSxDQUZmLENBRUYsS0FGRTtBQUFBLFFBRUssS0FGTCxHQUVlLENBRmYsQ0FFSyxLQUZMOzs7QUFJUixXQUNFO0FBQUE7TUFBQSxFQUFLLFdBQVksMEJBQVcsU0FBWCxFQUFzQixNQUFNLFNBQTVCLENBQWpCO0FBQ0ssZUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLE1BQU0sS0FBeEIsQ0FEYjtNQUVJLE1BQU07QUFGVixLQURGO0FBTUQ7QUFoQjhCLENBQWxCLENBQWY7O2tCQW9CZSxNOzs7Ozs7OztBQzFCZjs7Ozs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7OztBQUdBLElBQU0sV0FBVyxnQkFBTSxXQUFOLENBQWtCO0FBQUE7O0FBQ2pDLGFBQVc7Ozs7QUFJVCxXQUFPLGlCQUFNLE1BSko7Ozs7QUFRVCxRQUFJLGlCQUFNLElBUkQ7Ozs7QUFZVCxXQUFPLGlCQUFNLElBWko7QUFhVCxhQUFTLGlCQUFNLE1BYk47QUFjVCxjQUFVLGlCQUFNLE1BZFA7QUFlVCxvQkFBZ0IsaUJBQU0sTUFmYjtBQWdCVCxxQkFBaUIsaUJBQU0sTUFoQmQ7QUFpQlQsaUJBQWEsaUJBQU0sTUFqQlY7QUFrQlQsZ0JBQVksaUJBQU07QUFsQlQsR0FEc0I7O0FBc0JqQyxpQkF0QmlDLDZCQXNCZDtBQUNqQixRQUFJLFFBQVEsS0FBSyxXQUFMLEVBQVo7QUFDQSxXQUFPLEVBQUUsWUFBRixFQUFQO0FBQ0QsR0F6QmdDOzs7Ozs7QUE4QmpDLFFBOUJpQyxvQkE4QnZCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFZSxDQUZmLENBRUYsS0FGRTtBQUFBLFFBRUssS0FGTCxHQUVlLENBRmYsQ0FFSyxLQUZMO0FBQUEsUUFHRixLQUhFLEdBR1EsS0FIUixDQUdGLEtBSEU7O0FBSVIsV0FDRTtBQUFBO01BQUEsRUFBSyxXQUFZLDBCQUFXLFdBQVgsRUFBd0IsTUFBTSxTQUE5QixDQUFqQjtBQUNFLGVBQVEsT0FBTyxNQUFQLENBQWMsRUFBQyxTQUFTLGNBQVYsRUFBMEIsUUFBUSxLQUFsQyxFQUFkLEVBQXdELE1BQU0sS0FBOUQsQ0FEVjtNQUVFLDJEQUFTLE1BQU8sS0FBaEIsR0FGRjtNQUdFLDJEQUFlLEtBQWY7QUFIRixLQURGO0FBT0QsR0F6Q2dDO0FBMkNqQyxhQTNDaUMseUJBMkNsQjtBQUNiLFFBQU0sSUFBSSxJQUFWO0FBRGEsUUFFUCxLQUZPLEdBRUcsQ0FGSCxDQUVQLEtBRk87QUFBQSxRQUlQLGNBSk8sR0FJMEMsS0FKMUMsQ0FJUCxjQUpPO0FBQUEsUUFJUyxlQUpULEdBSTBDLEtBSjFDLENBSVMsZUFKVDtBQUFBLFFBSTBCLFdBSjFCLEdBSTBDLEtBSjFDLENBSTBCLFdBSjFCOztBQUtiLFFBQUksYUFBYSxNQUFNLFVBQU4sSUFBb0IsRUFBckM7QUFDQSxRQUFJLFdBQVcsYUFBYSxHQUE1QjtBQUNBLFFBQUksUUFBUTtBQUNWLDBCQUFvQjtBQUNsQixrQkFBVSxNQURRO0FBRWxCLG9CQUFlLFVBQWY7QUFGa0IsT0FEVjtBQUtWLCtCQUF5QjtBQUN2QixrQkFBVTtBQURhLE9BTGY7QUFRViw2QkFBdUI7QUFDckIsZUFBTyxPQURjO0FBRXJCLHFCQUFhLENBQUMsQ0FBRCxHQUFLLFVBQUwsR0FBa0I7QUFGVixPQVJiO0FBWVYsOEJBQXdCO0FBQ3RCLG9CQUFZLFNBRFU7QUFFdEIsZUFBTyxNQUZlO0FBR3RCLG9CQUFZLENBQUMsQ0FBRCxHQUFLLFVBQUwsR0FBa0I7QUFIUixPQVpkO0FBaUJWLDRDQUFzQztBQUNwQyxlQUFVLGFBQWEsQ0FBYixHQUFpQixDQUEzQjtBQURvQyxPQWpCNUI7QUFvQlYsNENBQXNDO0FBQ3BDLGVBQVUsYUFBYSxDQUFiLEdBQWlCLENBQTNCO0FBRG9DLE9BcEI1QjtBQXVCViwwQkFBb0I7QUFDbEIsZ0JBQVEsVUFEVTtBQUVsQixzQkFBZSxhQUFhLENBQWIsR0FBaUIsQ0FGZDtBQUdsQixrQkFBVTtBQUhRLE9BdkJWO0FBNEJWLDJCQUFxQjtBQUNuQixlQUFPLFVBRFk7QUFFbkIsZ0JBQVE7QUFGVztBQTVCWCxLQUFaO0FBaUNBLFFBQUksY0FBSixFQUFvQjtBQUNsQixhQUFPLE1BQVAsQ0FBYyxNQUFNLHFCQUFOLENBQWQsRUFBNEM7QUFDMUMsb0JBQVk7QUFEOEIsT0FBNUM7QUFHRDtBQUNELFFBQUksZUFBSixFQUFxQjtBQUNuQixhQUFPLE1BQVAsQ0FBYyxNQUFNLGtCQUFOLENBQWQsRUFBeUM7QUFDdkMseUJBQWlCO0FBRHNCLE9BQXpDO0FBR0Q7QUFDRCxRQUFJLFdBQUosRUFBaUI7QUFDZixVQUFJLG9CQUFvQjtBQUN0QiwrQkFBcUI7QUFEQyxPQUF4QjtBQUdBLGFBQU8sTUFBUCxDQUFjLE1BQU0sa0JBQU4sQ0FBZCxFQUF5QyxpQkFBekM7QUFDQSxhQUFPLE1BQVAsQ0FBYyxNQUFNLG1CQUFOLENBQWQsRUFBMEMsaUJBQTFDO0FBQ0Q7QUFDRCxXQUFPLEtBQVA7QUFDRDtBQXJHZ0MsQ0FBbEIsQ0FBakI7O2tCQXdHZSxROzs7Ozs7OztBQ2hIZjs7Ozs7Ozs7QUFFQTs7OztBQUNBOztBQUNBOzs7O2VBRWtDLFFBQVEsaUNBQVIsQzs7SUFBMUIscUIsWUFBQSxxQjs7OztBQUdSLElBQU0sZUFBZSxnQkFBTSxXQUFOLENBQWtCO0FBQUE7O0FBQ3JDLGFBQVc7QUFDVCxXQUFPLGlCQUFNLE1BREo7QUFFVCxjQUFVLGlCQUFNO0FBRlAsR0FEMEI7QUFLckMsaUJBTHFDLDZCQUtsQjtBQUNqQixXQUFPO0FBQ0wsYUFBTyxFQURGO0FBRUwsZ0JBQVUsMEJBQVE7QUFGYixLQUFQO0FBSUQsR0FWb0M7QUFXckMsUUFYcUMsb0JBVzNCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFUSxDQUZSLENBRUYsS0FGRTtBQUFBLFFBSUYsUUFKRSxHQUlXLEtBSlgsQ0FJRixRQUpFOzs7QUFNUixRQUFJLFFBQVE7QUFDVixrQkFBWSxFQURGO0FBRVYsd0JBQWtCO0FBQ2hCLGlCQUFTLGFBRE87QUFFaEIsd0JBQWdCLFFBRkE7QUFHaEIsb0JBQVksUUFISTtBQUloQixrQkFBVSxVQUpNO0FBS2hCLGdCQUFRLFNBTFE7QUFNaEIsZUFBTztBQU5TLE9BRlI7QUFVViw2QkFBdUI7QUFDckIsa0JBQVUsVUFEVztBQUVyQixzQkFBYyxLQUZPO0FBR3JCLHlCQUFpQixRQUhJO0FBSXJCLGlCQUFTLE1BSlk7QUFLckIsYUFBSyxLQUxnQjtBQU1yQixjQUFNLEtBTmU7QUFPckIsZUFBTyxLQVBjO0FBUXJCLGdCQUFRLEtBUmE7QUFTckIsbUNBQXlCLHFCQUF6QixPQVRxQjtBQVVyQix5QkFBaUIsU0FWSTtBQVdyQixtQkFBVztBQVhVLE9BVmI7QUF1QlYsK0NBQXlDO0FBQ3ZDLGlCQUFTO0FBRDhCLE9BdkIvQjtBQTBCViwrQ0FBeUM7QUFDdkMsZUFBTyxPQURnQztBQUV2QyxpQkFBUztBQUY4QixPQTFCL0I7QUE4QlYsc0NBQWdDO0FBQzlCLG1CQUFXO0FBRG1CLE9BOUJ0QjtBQWlDViw2QkFBdUI7QUFDckIsa0JBQVUsVUFEVztBQUVyQixnQkFBUSxDQUZhO0FBR3JCLGlCQUFTO0FBSFksT0FqQ2I7QUFzQ1Ysa0RBQTRDO0FBQzFDLGlCQUFTO0FBRGlDLE9BdENsQztBQXlDVixtREFBNkM7QUFDM0MsaUJBQVM7QUFEa0M7QUF6Q25DLEtBQVo7QUE2Q0EsV0FDRTtBQUFBO01BQUEsYUFBbUIsS0FBbkI7QUFDRSxlQUFRLE9BQU8sTUFBUCxDQUFjLEtBQWQsRUFBcUIsTUFBTSxLQUEzQjtBQURWO01BRUcsTUFBTTtBQUZULEtBREY7QUFLRDtBQW5Fb0MsQ0FBbEIsQ0FBckI7O2tCQXNFZSxZOzs7Ozs7OztBQy9FZjs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7O0FBR0EsSUFBTSxVQUFVLGdCQUFNLFdBQU4sQ0FBa0I7QUFBQTs7Ozs7O0FBS2hDLGFBQVc7O0FBRVQsU0FBSyxpQkFBTSxTQUFOLENBQWdCLENBQ25CLGlCQUFNLE1BRGEsRUFFbkIsaUJBQU0sT0FBTixDQUFjLGlCQUFNLE1BQXBCLENBRm1CLENBQWhCLENBRkk7O0FBT1QsZUFBVyxpQkFBTTtBQVBSLEdBTHFCOztBQWVoQyxpQkFmZ0MsNkJBZWI7QUFDakIsV0FBTztBQUNMLGVBREssdUJBQ1EsQ0FBRTtBQURWLEtBQVA7QUFHRCxHQW5CK0I7QUFxQmhDLFFBckJnQyxvQkFxQnRCO0FBQ1IsUUFBTSxJQUFJLElBQVY7QUFEUSxRQUVGLEtBRkUsR0FFZSxDQUZmLENBRUYsS0FGRTtBQUFBLFFBRUssS0FGTCxHQUVlLENBRmYsQ0FFSyxLQUZMOztBQUdSLFFBQUksTUFBTSxHQUFHLE1BQUgsQ0FBVSxNQUFNLEdBQU4sSUFBYSxFQUF2QixDQUFWO0FBQ0EsV0FDRTtBQUFBO01BQUEsYUFBWSxLQUFaO0FBQ0UsbUJBQVksMEJBQVcsVUFBWCxFQUF1QixNQUFNLFNBQTdCLENBRGQ7QUFFRSxlQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsTUFBTSxLQUF4QixDQUZWO0FBR0UsYUFBTSxhQUFDLE1BQUQ7QUFBQSxpQkFBWSxNQUFNLFNBQU4sQ0FBZ0IsTUFBaEIsQ0FBWjtBQUFBO0FBSFI7TUFLSSxJQUFJLEdBQUosQ0FBUSxVQUFDLEdBQUQ7QUFBQSxlQUNSLDBDQUFRLEtBQU0sR0FBZCxFQUFvQixLQUFNLEdBQTFCLEdBRFE7QUFBQSxPQUFSLENBTEo7TUFRSSxNQUFNO0FBUlYsS0FERjtBQVlEO0FBckMrQixDQUFsQixDQUFoQjs7a0JBeUNlLE8iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsYXN0ID0gcGFydHNbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gU3BsaXQgYSBmaWxlbmFtZSBpbnRvIFtyb290LCBkaXIsIGJhc2VuYW1lLCBleHRdLCB1bml4IHZlcnNpb25cbi8vICdyb290JyBpcyBqdXN0IGEgc2xhc2gsIG9yIG5vdGhpbmcuXG52YXIgc3BsaXRQYXRoUmUgPVxuICAgIC9eKFxcLz98KShbXFxzXFxTXSo/KSgoPzpcXC57MSwyfXxbXlxcL10rP3wpKFxcLlteLlxcL10qfCkpKD86W1xcL10qKSQvO1xudmFyIHNwbGl0UGF0aCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gIHJldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKTtcbn07XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZWRQYXRoID0gJycsXG4gICAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICB2YXIgcGF0aCA9IChpID49IDApID8gYXJndW1lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5qb2luIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuLy8gcGF0aC5yZWxhdGl2ZShmcm9tLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuZXhwb3J0cy5kZWxpbWl0ZXIgPSAnOic7XG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIHJlc3VsdCA9IHNwbGl0UGF0aChwYXRoKSxcbiAgICAgIHJvb3QgPSByZXN1bHRbMF0sXG4gICAgICBkaXIgPSByZXN1bHRbMV07XG5cbiAgaWYgKCFyb290ICYmICFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lIHdoYXRzb2V2ZXJcbiAgICByZXR1cm4gJy4nO1xuICB9XG5cbiAgaWYgKGRpcikge1xuICAgIC8vIEl0IGhhcyBhIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgZGlyID0gZGlyLnN1YnN0cigwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gcm9vdCArIGRpcjtcbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aChwYXRoKVsyXTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbXBhcmlzb24gY2FzZS1pbnNlbnNpdGl2ZSBvbiB3aW5kb3dzP1xuICBpZiAoZXh0ICYmIGYuc3Vic3RyKC0xICogZXh0Lmxlbmd0aCkgPT09IGV4dCkge1xuICAgIGYgPSBmLnN1YnN0cigwLCBmLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBmO1xufTtcblxuXG5leHBvcnRzLmV4dG5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBzcGxpdFBhdGgocGF0aClbM107XG59O1xuXG5mdW5jdGlvbiBmaWx0ZXIgKHhzLCBmKSB7XG4gICAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbnZhciBzdWJzdHIgPSAnYWInLnN1YnN0cigtMSkgPT09ICdiJ1xuICAgID8gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikgeyByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKSB9XG4gICAgOiBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKTtcbiAgICB9XG47XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXQgZG9uJ3QgYnJlYWsgdGhpbmdzLlxudmFyIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcblxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gY2FjaGVkU2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2FjaGVkQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qKlxuICogQnJvd3NlciBzY3JpcHQgZm9yIGNhc2VzLlxuICpcbiAqIEdlbmVyYXRlZCBieSBjb3ogb24gNi85LzIwMTYsXG4gKiBmcm9tIGEgdGVtcGxhdGUgcHJvdmlkZWQgYnkgYXBlbWFuLWJ1ZC1tb2NrLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0ID0gcmVxdWlyZSgnYXBlbWFuLWJyd3MtcmVhY3QnKTtcblxudmFyIF9hcGVtYW5CcndzUmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBlbWFuQnJ3c1JlYWN0KTtcblxudmFyIF9jYXNlc0NvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvY2FzZXMuY29tcG9uZW50LmpzJyk7XG5cbnZhciBfY2FzZXNDb21wb25lbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2FzZXNDb21wb25lbnQpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgQ09OVEFJTkVSX0lEID0gJ2Nhc2VzLXdyYXAnO1xud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF93aW5kb3cgPSB3aW5kb3c7XG4gIHZhciBsb2NhbGUgPSBfd2luZG93LmxvY2FsZTtcblxuICBfYXBlbWFuQnJ3c1JlYWN0Mi5kZWZhdWx0LnJlbmRlcihDT05UQUlORVJfSUQsIF9jYXNlc0NvbXBvbmVudDIuZGVmYXVsdCwge1xuICAgIGxvY2FsZTogbG9jYWxlXG4gIH0sIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgLy8gVGhlIGNvbXBvbmVudCBpcyByZWFkeS5cbiAgfSk7XG59OyIsIi8qKlxuICogQ29tcG9uZW50IG9mIGNhc2VzLlxuICpcbiAqIEdlbmVyYXRlZCBieSBjb3ogb24gNi85LzIwMTYsXG4gKiBmcm9tIGEgdGVtcGxhdGUgcHJvdmlkZWQgYnkgYXBlbWFuLWJ1ZC1tb2NrLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9oZWFkZXIgPSByZXF1aXJlKCcuL2ZyYWdtZW50cy9oZWFkZXInKTtcblxudmFyIF9oZWFkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVhZGVyKTtcblxudmFyIF9zaG93Y2FzZV92aWV3ID0gcmVxdWlyZSgnLi92aWV3cy9zaG93Y2FzZV92aWV3Jyk7XG5cbnZhciBfc2hvd2Nhc2VfdmlldzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zaG93Y2FzZV92aWV3KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENhc2VzQ29tcG9uZW50ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdDYXNlc0NvbXBvbmVudCcsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFja2VyOiBuZXcgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2suU3RhY2tlcih7XG4gICAgICAgIHJvb3Q6IF9zaG93Y2FzZV92aWV3Mi5kZWZhdWx0LFxuICAgICAgICByb290UHJvcHM6IHt9XG4gICAgICB9KVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgcy5yZWdpc3RlckxvY2FsZShwcm9wcy5sb2NhbGUpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFBhZ2UsXG4gICAgICBudWxsLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2hlYWRlcjIuZGVmYXVsdCwgeyB0YWI6ICdDQVNFUycgfSksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBNYWluLFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjaywgeyBzdGFja2VyOiBwcm9wcy5zdGFja2VyIH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENhc2VzQ29tcG9uZW50OyIsIi8qKlxuICogSGVhZGVyIGNvbXBvbmVudFxuICogQGNsYXNzIEhlYWRlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfbG9nbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9sb2dvJyk7XG5cbnZhciBfbG9nbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2dvKTtcblxudmFyIF9saW5rX3NlcnZpY2UgPSByZXF1aXJlKCcuLi8uLi9zZXJ2aWNlcy9saW5rX3NlcnZpY2UnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqIEBsZW5kcyBIZWFkZXIgKi9cbnZhciBIZWFkZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGFiOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFiOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciB0YWIgPSBwcm9wcy50YWI7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF90YWJJdGVtID0gX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWJJdGVtLmNyZWF0ZUl0ZW07XG4gICAgdmFyIF9saW5rID0gZnVuY3Rpb24gX2xpbmsoKSB7XG4gICAgICByZXR1cm4gX2xpbmtfc2VydmljZS5zaW5nbGV0b24ucmVzb2x2ZUh0bWxMaW5rLmFwcGx5KF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXIsXG4gICAgICB7IGNsYXNzTmFtZTogJ2hlYWRlcicgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcENvbnRhaW5lcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJMb2dvLFxuICAgICAgICAgIHsgaHJlZjogX2xpbmsoJ2luZGV4Lmh0bWwnKSB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9sb2dvMi5kZWZhdWx0LCBudWxsKVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlclRhYixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkRPQ1NfUEFHRScpLCBfbGluaygnZG9jcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0RPQ1MnIH0pLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkNBU0VTX1BBR0UnKSwgX2xpbmsoJ2Nhc2VzLmh0bWwnKSwgeyBzZWxlY3RlZDogdGFiID09PSAnQ0FTRVMnIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSGVhZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9jb2xvcl9jb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEpvaW5lciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnSm9pbmVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2xvcjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgbGluZVdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IF9jb2xvcl9jb25zdGFudHMuRE9NSU5BTlQsXG4gICAgICBsaW5lV2lkdGg6IDRcbiAgICB9O1xuICB9LFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExheW91dE1peGluLCBfYXBlbWFuUmVhY3RNaXhpbnMuQXBQdXJlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgbGF5b3V0cyA9IHMubGF5b3V0cztcbiAgICB2YXIgY29sb3IgPSBwcm9wcy5jb2xvcjtcbiAgICB2YXIgbGluZVdpZHRoID0gcHJvcHMubGluZVdpZHRoO1xuICAgIHZhciBfbGF5b3V0cyRzdmcgPSBsYXlvdXRzLnN2ZztcbiAgICB2YXIgd2lkdGggPSBfbGF5b3V0cyRzdmcud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IF9sYXlvdXRzJHN2Zy5oZWlnaHQ7XG4gICAgdmFyIG1pblggPSAwO1xuICAgIHZhciBtaWRYID0gd2lkdGggLyAyO1xuICAgIHZhciBtYXhYID0gd2lkdGg7XG4gICAgdmFyIG1pblkgPSAwO1xuICAgIHZhciBtaWRZID0gaGVpZ2h0IC8gMjtcbiAgICB2YXIgbWF4WSA9IGhlaWdodDtcblxuICAgIHZhciBfbGluZSA9IGZ1bmN0aW9uIF9saW5lKHgxLCB4MiwgeTEsIHkyKSB7XG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2xpbmUnLCB7IHgxOiB4MSwgeDI6IHgyLCB5MTogeTEsIHkyOiB5MiB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHhUaWx0ID0gMC4xO1xuICAgIHZhciB5VGlsdCA9IDAuMztcblxuICAgIHZhciB4MSA9IG1pblg7XG4gICAgdmFyIHgyID0gbWlkWCAqICgxICsgeFRpbHQpO1xuICAgIHZhciB4MyA9IG1pZFggKiAoMSAtIHhUaWx0KTtcbiAgICB2YXIgeDQgPSBtYXhYO1xuICAgIHZhciB5MSA9IG1pZFk7XG4gICAgdmFyIHkyID0gbWlkWSAqICgxIC0geVRpbHQpO1xuICAgIHZhciB5MyA9IG1pZFkgKiAoMSArIHlUaWx0KTtcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ2pvaW5lcicsIHByb3BzLmNsYXNzTmFtZSksXG4gICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGpvaW5lcikge1xuICAgICAgICAgIHMuam9pbmVyID0gam9pbmVyO1xuICAgICAgICB9IH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3N2ZycsXG4gICAgICAgIHsgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcDogJ3JvdW5kJyxcbiAgICAgICAgICBzdHJva2VXaWR0aDogbGluZVdpZHRoXG4gICAgICAgIH0sXG4gICAgICAgIF9saW5lKHgxLCB4MiwgeTEsIHkyKSxcbiAgICAgICAgX2xpbmUoeDIsIHgzLCB5MiwgeTMpLFxuICAgICAgICBfbGluZSh4MywgeDQsIHkzLCB5MSlcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gRm9yIEFwTGF5b3V0TWl4aW5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0SW5pdGlhbExheW91dHM6IGZ1bmN0aW9uIGdldEluaXRpYWxMYXlvdXRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdmc6IHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiA0MCB9XG4gICAgfTtcbiAgfSxcbiAgY2FsY0xheW91dHM6IGZ1bmN0aW9uIGNhbGNMYXlvdXRzKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgam9pbmVyID0gcy5qb2luZXI7XG5cbiAgICBpZiAoIWpvaW5lcikge1xuICAgICAgcmV0dXJuIHMuZ2V0SW5pdGlhbExheW91dHMoKTtcbiAgICB9XG5cbiAgICB2YXIgX2pvaW5lciRnZXRCb3VuZGluZ0NsID0gam9pbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdmFyIHdpZHRoID0gX2pvaW5lciRnZXRCb3VuZGluZ0NsLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSBfam9pbmVyJGdldEJvdW5kaW5nQ2wuaGVpZ2h0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN2ZzogeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH1cbiAgICB9O1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSm9pbmVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgTG9nbyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTG9nbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdoMScsXG4gICAgICB7IGNsYXNzTmFtZTogJ2xvZ28nIH0sXG4gICAgICBsKCdsb2dvLkxPR08nKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBMb2dvOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3NnUmVhY3RDb21wb25lbnRzID0gcmVxdWlyZSgnc2ctcmVhY3QtY29tcG9uZW50cycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFZpZGVvID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdWaWRlbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwVG91Y2hNaXhpbl0sXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgd2lkdGg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWTogX3JlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgdHJhbnNsYXRlWCA9IHByb3BzLnRyYW5zbGF0ZVg7XG4gICAgdmFyIHRyYW5zbGF0ZVkgPSBwcm9wcy50cmFuc2xhdGVZO1xuXG4gICAgdmFyIHN0eWxlID0geyB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHRyYW5zbGF0ZVggKyAncHgsICcgKyB0cmFuc2xhdGVZICsgJ3B4KScgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgY2xhc3NOYW1lOiAoMCwgX2NsYXNzbmFtZXMyLmRlZmF1bHQpKCd2aWRlbycsIHByb3BzLmNsYXNzTmFtZSkgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnZGl2JyxcbiAgICAgICAgeyBjbGFzc05hbWU6ICd2aWRlby1pbm5lcicgfSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3NnUmVhY3RDb21wb25lbnRzLlNnVmlkZW8sIHsgc3JjOiBwcm9wcy5zcmMsXG4gICAgICAgICAgc3R5bGU6IHN0eWxlLFxuICAgICAgICAgIHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHByb3BzLmhlaWdodCxcbiAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgIGF1dG9QbGF5OiBmdW5jdGlvbiBhdXRvUGxheShwbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG11dGVkOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAndmlkZW8tb3ZlcmxheScgfSlcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVmlkZW87IiwiLyoqXG4gKiBWaWV3IGZvciBzaG93Y2FzZVxuICogQGNsYXNzIFNob3djYXNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF92aWRlbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy92aWRlbycpO1xuXG52YXIgX3ZpZGVvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3ZpZGVvKTtcblxudmFyIF9qb2luZXIgPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvam9pbmVyJyk7XG5cbnZhciBfam9pbmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2pvaW5lcik7XG5cbnZhciBfY29sb3JfY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgU2hvd2Nhc2VWaWV3ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdTaG93Y2FzZVZpZXcnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICB2YXIgX3NlY3Rpb24gPSBzLl9yZW5kZXJTZWN0aW9uO1xuXG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3LFxuICAgICAgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS12aWV3JyxcbiAgICAgICAgc3Bpbm5pbmc6ICFzLm1vdW50ZWRcbiAgICAgIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdIZWFkZXIsIHsgdGl0bGVUZXh0OiBsKCd0aXRsZXMuU0hPV0NBU0VfVElUTEUnKSB9KSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdCb2R5LFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAnYXJ0aWNsZScsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBbX3NlY3Rpb24oJ3JlbW90ZScsIHtcbiAgICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5DQVNFX1JFTU9URV9USVRMRScpLFxuICAgICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuQ0FTRV9SRU1PVEVfVEVYVCcpLFxuICAgICAgICAgICAgcmV2ZXJzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgdmlkZW8xOiB7XG4gICAgICAgICAgICAgIHNyYzogJ3ZpZGVvcy9TVUdPU19yZW1vdGVfUExFTi5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAtMTU1LFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtMTAsXG4gICAgICAgICAgICAgIHdpZHRoOiAzMTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2aWRlbzI6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL1NVR09TX3JlbW90ZV9QTEVOLm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IDAsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0yMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDMxMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLCBfc2VjdGlvbignc2Vuc2UnLCB7XG4gICAgICAgICAgICB0aXRsZTogbCgnc2VjdGlvbnMuQ0FTRV9TRU5TRV9USVRMRScpLFxuICAgICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuQ0FTRV9TRU5TRV9URVhUJyksXG4gICAgICAgICAgICByZXZlcnNlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZpZGVvMToge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvU1VHT1NfcmVtb3RlX3NlbnNvci5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAtMTU1LFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtNSxcbiAgICAgICAgICAgICAgd2lkdGg6IDMxMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZpZGVvMjoge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvU1VHT1NfcmVtb3RlX3NlbnNvci5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAwLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtMjAsXG4gICAgICAgICAgICAgIHdpZHRoOiAzMTBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSwgX3NlY3Rpb24oJ3RhbGsnLCB7XG4gICAgICAgICAgICB0aXRsZTogbCgnc2VjdGlvbnMuQ0FTRV9TUEVFQ0hfUkVDT0dOSVRJT05fVElUTEUnKSxcbiAgICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkNBU0VfU1BFRUNIX1JFQ09HTklUSU9OX1RFWFQnKSxcbiAgICAgICAgICAgIHJldmVyc2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHZpZGVvMToge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvcGVwcGVyX3NwZWVjaF9yZWNvZ25pdGlvbi5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAwLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAwLFxuICAgICAgICAgICAgICB3aWR0aDogNDcwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmlkZW8yOiB7XG4gICAgICAgICAgICAgIHNyYzogJ3ZpZGVvcy9wZXBwZXJfc3BlZWNoX3JlY29nbml0aW9uLm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0yMDAsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0zMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDM1MFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLCBfc2VjdGlvbigndGV4dC1pbnB1dCcsIHtcbiAgICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5DQVNFX1RFWFRfSU5QVVRfVElUTEUnKSxcbiAgICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkNBU0VfVEVYVF9JTlBVVF9URVhUJyksXG4gICAgICAgICAgICByZXZlcnNlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZpZGVvMToge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvcGVwcGVyX3RleHRfaW5wdXQubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTE2NSxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWTogLTIwLFxuICAgICAgICAgICAgICB3aWR0aDogMzIwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmlkZW8yOiB7XG4gICAgICAgICAgICAgIHNyYzogJ3ZpZGVvcy9wZXBwZXJfdGV4dF9pbnB1dC5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAtNTIsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0zMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDUxMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLCBfc2VjdGlvbignZWRpc29uLXJvb21iYScsIHtcbiAgICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5DQVNFX0VESVNPTl9ST09NQkFfVElUTEUnKSxcbiAgICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkNBU0VfRURJU09OX1JPT01CQV9URVhUJyksXG4gICAgICAgICAgICByZXZlcnNlZDogZmFsc2UsXG4gICAgICAgICAgICB2aWRlbzE6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL2VkaXNvbl9yb29tYmEubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTE1LFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtMzAsXG4gICAgICAgICAgICAgIHdpZHRoOiAzODBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2aWRlbzI6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL2VkaXNvbl9yb29tYmEubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTE2MixcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWTogLTIwLFxuICAgICAgICAgICAgICB3aWR0aDogMzIwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSldXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gTGlmZUN5Y2xlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICBzLm1vdW50ZWQgPSB0cnVlO1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQ3VzdG9tXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbW91bnRlZDogZmFsc2UsXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUHJpdmF0ZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9yZW5kZXJTZWN0aW9uOiBmdW5jdGlvbiBfcmVuZGVyU2VjdGlvbihuYW1lLCBjb25maWcpIHtcbiAgICB2YXIgdGl0bGUgPSBjb25maWcudGl0bGU7XG4gICAgdmFyIHRleHQgPSBjb25maWcudGV4dDtcbiAgICB2YXIgdmlkZW8xID0gY29uZmlnLnZpZGVvMTtcbiAgICB2YXIgdmlkZW8yID0gY29uZmlnLnZpZGVvMjtcbiAgICB2YXIgcmV2ZXJzZWQgPSBjb25maWcucmV2ZXJzZWQ7XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb24sXG4gICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXNlY3Rpb24nLFxuICAgICAgICBpZDogJ3Nob3djYXNlLScgKyBuYW1lICsgJy1zZWN0aW9uJyxcbiAgICAgICAga2V5OiBuYW1lIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uSGVhZGVyLFxuICAgICAgICBudWxsLFxuICAgICAgICB0aXRsZVxuICAgICAgKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25Cb2R5LFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXRleHQtY29udGFpbmVyJyB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLWRlc2NyaXB0aW9uJyB9LFxuICAgICAgICAgICAgW10uY29uY2F0KHRleHQpLm1hcChmdW5jdGlvbiAodGV4dCwgaSkge1xuICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3AnLFxuICAgICAgICAgICAgICAgIHsga2V5OiBpIH0sXG4gICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdkaXYnLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8tY29udGFpbmVyJyB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF92aWRlbzIuZGVmYXVsdCwgX2V4dGVuZHMoeyBjbGFzc05hbWU6ICdzaG93Y2FzZS12aWRlbycgfSwgdmlkZW8xKSksXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2pvaW5lcjIuZGVmYXVsdCwgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS1qb2luZXInLCBjb2xvcjogcmV2ZXJzZWQgPyBfY29sb3JfY29uc3RhbnRzLkRPTUlOQU5UIDogXCJ3aGl0ZVwiIH0pLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF92aWRlbzIuZGVmYXVsdCwgX2V4dGVuZHMoeyBjbGFzc05hbWU6ICdzaG93Y2FzZS12aWRlbycgfSwgdmlkZW8yKSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3djYXNlVmlldzsiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiRE9NSU5BTlRcIjogXCIjZDZiODEwXCJcbn0iLCIvKipcbiAqIEBjbGFzcyBMaW5rU2VydmljZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vKiogQGxlbmRzIExpbmtTZXJ2aWNlICovXG5cbnZhciBMaW5rU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTGlua1NlcnZpY2UoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExpbmtTZXJ2aWNlKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhMaW5rU2VydmljZSwgW3tcbiAgICBrZXk6ICdyZXNvbHZlSHRtbExpbmsnLFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIGEgaHRtbCBsaW5rXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gSHRtbCBmaWxlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFJlc29sdmVkIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlSHRtbExpbmsoZmlsZW5hbWUpIHtcbiAgICAgIHZhciBzID0gdGhpcztcbiAgICAgIHZhciBsYW5nID0gcy5fZ2V0TGFuZygpO1xuICAgICAgdmFyIGh0bWxEaXIgPSBsYW5nID8gJ2h0bWwvJyArIGxhbmcgOiAnaHRtbCc7XG4gICAgICByZXR1cm4gcGF0aC5qb2luKGh0bWxEaXIsIGZpbGVuYW1lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfZ2V0TGFuZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9nZXRMYW5nKCkge1xuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5MQU5HO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpbmRvdy5sYW5nO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBMaW5rU2VydmljZTtcbn0oKTtcblxudmFyIHNpbmdsZXRvbiA9IG5ldyBMaW5rU2VydmljZSgpO1xuXG5PYmplY3QuYXNzaWduKExpbmtTZXJ2aWNlLCB7XG4gIHNpbmdsZXRvbjogc2luZ2xldG9uXG59KTtcblxuZXhwb3J0cy5zaW5nbGV0b24gPSBzaW5nbGV0b247XG5leHBvcnRzLmRlZmF1bHQgPSBMaW5rU2VydmljZTsiLCIvKipcbiAqIGFwZW1hbiByZWFjdCBwYWNrYWdlIGZvciBzd2l0Y2ggY29tcG9uZW50c1xuICogQGNvbnN0cnVjdG9yIEFwU3dpdGNoXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuaW1wb3J0IHtBcFB1cmVNaXhpbiwgQXBUb3VjaE1peGluLCBBcFVVSURNaXhpbn0gZnJvbSAnYXBlbWFuLXJlYWN0LW1peGlucydcblxuLyoqIEBsZW5kcyBBcFN3aXRjaCAqL1xuY29uc3QgQXBTd2l0Y2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBwcm9wVHlwZXM6IHtcbiAgICAvKiogU3dpdGNoIG9uIG9yIG5vdCAqL1xuICAgIG9uOiB0eXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgLyoqIEhhbmRsZSBmb3IgdGFwIGV2ZW50ICovXG4gICAgb25UYXA6IHR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvKiogVGl0bGUgdGV4dCBmb3Igb24gc3RhdGUgKi9cbiAgICBvblRpdGxlOiB0eXBlcy5zdHJpbmcsXG4gICAgLyoqIFRpdGxlIHRleHQgZm9yIG9mZiBzdGF0ZSAqL1xuICAgIG9mZlRpdGxlOiB0eXBlcy5zdHJpbmcsXG4gICAgLyoqIFdpZHRoIG9mIGNvbXBvbmVudCAqL1xuICAgIHdpZHRoOiB0eXBlcy5udW1iZXJcbiAgfSxcblxuICBtaXhpbnM6IFtcbiAgICBBcFB1cmVNaXhpbixcbiAgICBBcFRvdWNoTWl4aW4sXG4gICAgQXBVVUlETWl4aW5cbiAgXSxcblxuICBzdGF0aWNzOiB7fSxcblxuICBnZXRJbml0aWFsU3RhdGUgKCkge1xuICAgIHJldHVybiB7fVxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9uOiBmYWxzZSxcbiAgICAgIG9uVGl0bGU6ICcnLFxuICAgICAgb2ZmVGl0bGU6ICcnXG4gICAgfVxuICB9LFxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcbiAgICBsZXQgeyB3aWR0aCB9ID0gcHJvcHNcbiAgICBsZXQgaWQgPSBwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnaWQnKSA/IHByb3BzLmlkIDogcy51dWlkXG4gICAgbGV0IGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2FwLXN3aXRjaCcsIHtcbiAgICAgICdhcC1zd2l0Y2gtb24nOiBwcm9wcy5vbixcbiAgICAgICdhcC1zd2l0Y2gtb2ZmJzogIXByb3BzLm9uXG4gICAgfSwgcHJvcHMuY2xhc3NOYW1lKVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9XG4gICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7d2lkdGh9LCBwcm9wcy5zdHlsZSkgfVxuICAgICAgICAgICBpZD17IGlkIH1cbiAgICAgID5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcC1zd2l0Y2gtaW5uZXJcIj5cbiAgICAgICAgICB7IHMuX3JlbmRlckxhYmVsKGAke2lkfS1yYWRpby1vZmZgLCAnYXAtc3dpdGNoLW9uLWxhYmVsJywgcHJvcHMub25UaXRsZSkgfVxuICAgICAgICAgIHsgcy5fcmVuZGVyUmFkaW8oYCR7aWR9LXJhZGlvLW9mZmAsICdvZmYnLCAhcHJvcHMub24pfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXAtc3dpdGNoLWhhbmRsZVwiPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHsgcy5fcmVuZGVyTGFiZWwoYCR7aWR9LXJhZGlvLW9uYCwgJ2FwLXN3aXRjaC1vZmYtbGFiZWwnLCBwcm9wcy5vZmZUaXRsZSkgfVxuICAgICAgICAgIHsgcy5fcmVuZGVyUmFkaW8oYCR7aWR9LXJhZGlvLW9uYCwgJ29uJywgISFwcm9wcy5vbil9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBMaWZlY3ljbGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQ3VzdG9tXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG5vb3AgKCkge1xuXG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFByaXZhdGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX3JlbmRlckxhYmVsIChodG1sRm9yLCBjbGFzc05hbWUsIHRpdGxlKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICByZXR1cm4gKFxuICAgICAgPGxhYmVsIGh0bWxGb3I9eyBodG1sRm9yIH1cbiAgICAgICAgICAgICBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdhcC1zd2l0Y2gtbGFiZWwnLCBjbGFzc05hbWUpIH0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFwLXN3aXRjaC1sYWJlbC10ZXh0XCI+eyB0aXRsZSB9PC9zcGFuPlxuICAgICAgPC9sYWJlbD5cbiAgICApXG4gIH0sXG5cbiAgX3JlbmRlclJhZGlvIChpZCwgdmFsdWUsIGNoZWNrZWQpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHJldHVybiAoXG4gICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgaWQ9eyBpZCB9XG4gICAgICAgICAgICAgdmFsdWU9eyB2YWx1ZSB9XG4gICAgICAgICAgICAgY2hlY2tlZD17IGNoZWNrZWQgfVxuICAgICAgICAgICAgIG9uQ2hhbmdlPXsgcy5ub29wIH1cbiAgICAgICAgICAgICBjbGFzc05hbWU9XCJhcC1zd2l0Y2gtcmFkaW9cIi8+XG4gICAgKVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBBcFN3aXRjaFxuIiwiLyoqXG4gKiBTdHlsZSBmb3IgQXBTd2l0Y2guXG4gKiBAY29uc3RydWN0b3IgQXBTd2l0Y2hTdHlsZVxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtBcFN0eWxlfSBmcm9tICdhcGVtYW4tcmVhY3Qtc3R5bGUnXG5cbi8qKiBAbGVuZHMgQXBTd2l0Y2hTdHlsZSAqL1xuY29uc3QgQXBTd2l0Y2hTdHlsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgc3R5bGU6IHR5cGVzLm9iamVjdCxcbiAgICBoaWdobGlnaHRDb2xvcjogdHlwZXMuc3RyaW5nXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0eWxlOiB7fSxcbiAgICAgIGhpZ2hsaWdodENvbG9yOiBBcFN0eWxlLkRFRkFVTFRfSElHSExJR0hUX0NPTE9SLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBBcFN0eWxlLkRFRkFVTFRfQkFDS0dST1VORF9DT0xPUixcbiAgICAgIGJvcmRlckNvbG9yOiAnI0NDQydcbiAgICB9XG4gIH0sXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcyB9ID0gc1xuXG4gICAgbGV0IHsgaGlnaGxpZ2h0Q29sb3IsIGJhY2tncm91bmRDb2xvciwgYm9yZGVyQ29sb3IgfSA9IHByb3BzXG4gICAgbGV0IGhhbmRsZVNpemUgPSAyNFxuICAgIGxldCB0cmFuc2l0aW9uID0gNDAwXG4gICAgbGV0IG1pbldpZHRoID0gaGFuZGxlU2l6ZSAqIDEuNVxuICAgIGxldCBkYXRhID0ge1xuICAgICAgJy5hcC1zd2l0Y2gnOiB7XG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtcmFkaW8nOiB7XG4gICAgICAgIGRpc3BsYXk6ICdub25lJ1xuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLWxhYmVsJzoge1xuICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG4gICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZvbnRTaXplOiAnMTRweCcsXG4gICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgcGFkZGluZzogMCxcbiAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgIGZsZXhTaHJpbms6IDEsXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICB0cmFuc2l0aW9uOiBgd2lkdGggJHt0cmFuc2l0aW9ufW1zYCxcbiAgICAgICAgbGluZUhlaWdodDogYCR7aGFuZGxlU2l6ZX1weGBcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1sYWJlbC10ZXh0Jzoge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgcGFkZGluZzogJzAgOHB4JyxcbiAgICAgICAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG4gICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgICAgICAgbWluV2lkdGg6IG1pbldpZHRoXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb24tbGFiZWwnOiB7XG4gICAgICAgIGJhY2tncm91bmQ6IGhpZ2hsaWdodENvbG9yLFxuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiBgJHtoYW5kbGVTaXplIC8gMn1weCAwIDAgJHtoYW5kbGVTaXplIC8gMn1weGAsXG4gICAgICAgIG1hcmdpblJpZ2h0OiAtMSAqIGhhbmRsZVNpemUgLyAyXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb2ZmLWxhYmVsJzoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZBRkFGQScsXG4gICAgICAgIGNvbG9yOiAnI0FBQScsXG4gICAgICAgIGJvcmRlclJhZGl1czogYDAgJHtoYW5kbGVTaXplIC8gMn1weCAke2hhbmRsZVNpemUgLyAyfXB4IDBgLFxuICAgICAgICBtYXJnaW5MZWZ0OiAtMSAqIGhhbmRsZVNpemUgLyAyXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb24gLmFwLXN3aXRjaC1vZmYtbGFiZWwnOiB7XG4gICAgICAgIHdpZHRoOiBgJHtoYW5kbGVTaXplIC8gMiArIDJ9cHggIWltcG9ydGFudGBcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vZmYgLmFwLXN3aXRjaC1vbi1sYWJlbCc6IHtcbiAgICAgICAgd2lkdGg6IGAke2hhbmRsZVNpemUgLyAyICsgMn1weCAhaW1wb3J0YW50YFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLWlubmVyJzoge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtc3RhcnQnLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYWNrZ3JvdW5kQ29sb3IsXG4gICAgICAgIGhlaWdodDogaGFuZGxlU2l6ZSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAoaGFuZGxlU2l6ZSAvIDIgKyAxKSxcbiAgICAgICAgbWluV2lkdGg6IG1pbldpZHRoLFxuICAgICAgICBib3JkZXI6IGAxcHggc29saWQgJHtib3JkZXJDb2xvcn1gLFxuICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgIHdpZHRoOiAnMTAwJSdcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1oYW5kbGUnOiB7XG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICB3aWR0aDogaGFuZGxlU2l6ZSxcbiAgICAgICAgaGVpZ2h0OiBoYW5kbGVTaXplLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgIGJvcmRlcjogYDFweCBzb2xpZCAke2JvcmRlckNvbG9yfWAsXG4gICAgICAgIGZsZXhHcm93OiAwLFxuICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgekluZGV4OiA0XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBzbWFsbE1lZGlhRGF0YSA9IHt9XG4gICAgbGV0IG1lZGl1bU1lZGlhRGF0YSA9IHt9XG4gICAgbGV0IGxhcmdlTWVkaWFEYXRhID0ge31cbiAgICByZXR1cm4gKFxuICAgICAgPEFwU3R5bGUgZGF0YT17IE9iamVjdC5hc3NpZ24oZGF0YSwgcHJvcHMuc3R5bGUpIH1cbiAgICAgICAgICAgICAgIHNtYWxsTWVkaWFEYXRhPXsgc21hbGxNZWRpYURhdGEgfVxuICAgICAgICAgICAgICAgbWVkaXVtTWVkaWFEYXRhPXsgbWVkaXVtTWVkaWFEYXRhIH1cbiAgICAgICAgICAgICAgIGxhcmdlTWVkaWFEYXRhPXsgbGFyZ2VNZWRpYURhdGEgfVxuICAgICAgPnsgcHJvcHMuY2hpbGRyZW4gfTwvQXBTdHlsZT5cbiAgICApXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IEFwU3dpdGNoU3R5bGVcbiIsIi8qKlxuICogYXBlbWFuIHJlYWN0IHBhY2thZ2UgZm9yIHN3aXRjaCBjb21wb25lbnRzXG4gKiBAbW9kdWxlIGFwZW1hbi1yZWFjdC1zd2l0Y2hcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxubGV0IGQgPSAobW9kdWxlKSA9PiBtb2R1bGUuZGVmYXVsdCB8fCBtb2R1bGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBBcFN3aXRjaFN0eWxlICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9hcF9zd2l0Y2hfc3R5bGUnKSkgfSxcbiAgZ2V0IEFwU3dpdGNoICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9hcF9zd2l0Y2gnKSkgfVxufVxuIiwiLyoqXG4gKiBTZXQgYWxwaGEgdmFsdWVcbiAqIEBmdW5jdGlvbiBhbHBoYVxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIC0gQ29sb3IgdmFsdWUuXG4gKiBAcGFyYW0ge251bWJlcn0gQWxwaGEgdmFsdWUuIDAuMDAgdG8gMS4wMFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpXG5cbi8qKiBAbGVuZHMgYWxwaGEgKi9cbmZ1bmN0aW9uIGFscGhhIChjb2xvciwgYWxwaGEpIHtcbiAgY29sb3IgPSBwYXJzZShjb2xvcilcbiAgcmV0dXJuIGNvbG9yLmFscGhhKGFscGhhKS5yZ2JhU3RyaW5nKClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhbHBoYVxuIiwiLyoqXG4gKiBjb2xvcml6ZXIgZnVuY3Rpb25zXG4gKiBAbW9kdWxlIGNvbG9yaXplcnNcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxubGV0IGQgPSAobW9kdWxlKSA9PiBtb2R1bGUuZGVmYXVsdCB8fCBtb2R1bGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCByb3RhdGVDb2xvcml6ZXIgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3JvdGF0ZV9jb2xvcml6ZXInKSkgfVxufVxuIiwiLyoqXG4gKiBEZWZpbmUgYSBjb2xvcml6ZXIgdG8gZ2VuZXJhdGUgdW5pcXVlIGNvbG9yc1xuICogQGZ1bmN0aW9uIHJvdGF0ZUNvbG9yaXplclxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2UgLSBCYXNlIGNvbG9yIHN0cmluZ1xuICogQHJldHVybnMge2Z1bmN0aW9ufSAtIEdlbmVyYXRlZCBmdW5jdGlvblxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3Qgcm90YXRlID0gcmVxdWlyZSgnLi4vcm90YXRlJylcblxuLyoqIEBsZW5kcyByb3RhdGVDb2xvcml6ZXIgKi9cbmZ1bmN0aW9uIHJvdGF0ZUNvbG9yaXplciAoYmFzZSkge1xuICBsZXQgY29sb3JzID0ge31cblxuICAvKipcbiAgICogQ29sb3JpemVyIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFVuaXF1ZSBpZGVudGlmaWVyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbG9yIC0gQ29sb3IgZm9yIHRoZSBpZFxuICAgKi9cbiAgZnVuY3Rpb24gY29sb3JpemVyIChpZCkge1xuICAgIGxldCBjb2xvciA9IGNvbG9yc1sgaWQgXVxuICAgIGlmIChjb2xvcikge1xuICAgICAgcmV0dXJuIGNvbG9yXG4gICAgfVxuICAgIGxldCBrbm93bkNvbG9ycyA9IE9iamVjdC5rZXlzKGNvbG9ycykubWFwKChpZCkgPT4gY29sb3JzWyBpZCBdKVxuICAgIGRvIHtcbiAgICAgIGNvbG9yID0gcm90YXRlKGJhc2UsIHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAzNjAuMCkpXG4gICAgICBpZiAoa25vd25Db2xvcnMubGVuZ3RoID49IDM2MCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0gd2hpbGUgKH5rbm93bkNvbG9ycy5pbmRleE9mKGNvbG9yKSlcbiAgICBjb2xvcnNbIGlkIF0gPSBjb2xvclxuICAgIHJldHVybiBjb2xvclxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihjb2xvcml6ZXIsIHsgYmFzZSwgY29sb3JzIH0pXG4gIHJldHVybiBjb2xvcml6ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByb3RhdGVDb2xvcml6ZXJcbiIsIi8qKlxuICogQ29sb3IgdXRpbGl0eS5cbiAqIEBtb2R1bGUgYXBlbWFuY29sb3JcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxubGV0IGQgPSAobW9kdWxlKSA9PiBtb2R1bGUuZGVmYXVsdCB8fCBtb2R1bGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBhbHBoYSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vYWxwaGEnKSkgfSxcbiAgZ2V0IGNvbG9yaXplcnMgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2NvbG9yaXplcnMnKSkgfSxcbiAgZ2V0IGlzRGFyayAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vaXNfZGFyaycpKSB9LFxuICBnZXQgaXNMaWdodCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vaXNfbGlnaHQnKSkgfSxcbiAgZ2V0IG1peCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vbWl4JykpIH0sXG4gIGdldCBwYXJzZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vcGFyc2UnKSkgfSxcbiAgZ2V0IHJvdGF0ZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vcm90YXRlJykpIH1cbn1cbiIsIi8qKlxuICogRGV0ZWN0IGRhcmsgb3Igbm90XG4gKiBAZnVuY3Rpb24gaXNEYXJrXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBDb2xvciB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKVxuZnVuY3Rpb24gaXNEYXJrIChjb2xvcikge1xuICBsZXQgeyByLCBnLCBiIH0gPSBwYXJzZShjb2xvcikucmdiKClcbiAgcmV0dXJuIChyICogMC4yOTkgKyBnICogMC41ODcgKyBiICogMC4xMTQpIDwgMTg2XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNEYXJrXG4iLCIvKipcbiAqIERldGVjdCBsaWdodCBvciBub3RcbiAqIEBmdW5jdGlvbiBpc0xpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBDb2xvciB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBpc0RhcmsgPSByZXF1aXJlKCcuL2lzX2RhcmsnKVxuZnVuY3Rpb24gaXNMaWdodCAoY29sb3IpIHtcbiAgcmV0dXJuICFpc0RhcmsoY29sb3IpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNMaWdodFxuIiwiLyoqXG4gKiBtaXggY29sb3JzXG4gKiBAZnVuY3Rpb24gbWl4XG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IxIC0gQ29sb3IgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IyIC0gQ29sb3IgdmFsdWUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJylcblxuLyoqIEBsZW5kcyBtaXggKi9cbmZ1bmN0aW9uIG1peCAoY29sb3IxLCBjb2xvcjIpIHtcbiAgcmV0dXJuIHBhcnNlKGNvbG9yMSkubWl4KHBhcnNlKGNvbG9yMikpLnJnYmFTdHJpbmcoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1peFxuIiwiLyoqXG4gKiBQYXJzZSBhIGNvbG9yXG4gKiBAZnVuY3Rpb24gcGFyc2VcbiAqIEBwYXJhbSB7dmFsdWV9IC0gQ29sb3IgdmFsdWVcbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gUGFyc2VkIGNvbG9yIGluc3RhbmNlLlxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgY29sb3IgPSByZXF1aXJlKCdjb2xvcicpXG5cbi8qKiBAbGVuZHMgcGFyc2UgKi9cbmZ1bmN0aW9uIHBhcnNlICh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdbYXBlbWFuY29sb3JdIFZhbHVlIGlzIHJlcXVpcmVkLicpXG4gIH1cbiAgbGV0IHBhcnNlZCA9IGNvbG9yKHZhbHVlKVxuICBpZiAoIXBhcnNlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb2xvcjogJHt2YWx1ZX1gKVxuICB9XG4gIHJldHVybiBwYXJzZWRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVxuIiwiLyoqXG4gKiByb3RhdGUgY29sb3JcbiAqIEBmdW5jdGlvbiByb3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAtIENvbG9yIHZhbHVlLlxuICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZSB0byByb3RhdGUuIDAgdG8gMzYwXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJylcblxuLyoqIEBsZW5kcyByb3RhdGUgKi9cbmZ1bmN0aW9uIHJvdGF0ZSAoY29sb3IsIGRlZ3JlZSkge1xuICBjb2xvciA9IHBhcnNlKGNvbG9yKVxuICByZXR1cm4gY29sb3IuaHVlKGNvbG9yLmh1ZSgpICsgTnVtYmVyKGRlZ3JlZSkpLnJnYmFTdHJpbmcoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdGF0ZVxuIiwiLyogTUlUIGxpY2Vuc2UgKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJnYjJoc2w6IHJnYjJoc2wsXG4gIHJnYjJoc3Y6IHJnYjJoc3YsXG4gIHJnYjJod2I6IHJnYjJod2IsXG4gIHJnYjJjbXlrOiByZ2IyY215ayxcbiAgcmdiMmtleXdvcmQ6IHJnYjJrZXl3b3JkLFxuICByZ2IyeHl6OiByZ2IyeHl6LFxuICByZ2IybGFiOiByZ2IybGFiLFxuICByZ2IybGNoOiByZ2IybGNoLFxuXG4gIGhzbDJyZ2I6IGhzbDJyZ2IsXG4gIGhzbDJoc3Y6IGhzbDJoc3YsXG4gIGhzbDJod2I6IGhzbDJod2IsXG4gIGhzbDJjbXlrOiBoc2wyY215ayxcbiAgaHNsMmtleXdvcmQ6IGhzbDJrZXl3b3JkLFxuXG4gIGhzdjJyZ2I6IGhzdjJyZ2IsXG4gIGhzdjJoc2w6IGhzdjJoc2wsXG4gIGhzdjJod2I6IGhzdjJod2IsXG4gIGhzdjJjbXlrOiBoc3YyY215ayxcbiAgaHN2MmtleXdvcmQ6IGhzdjJrZXl3b3JkLFxuXG4gIGh3YjJyZ2I6IGh3YjJyZ2IsXG4gIGh3YjJoc2w6IGh3YjJoc2wsXG4gIGh3YjJoc3Y6IGh3YjJoc3YsXG4gIGh3YjJjbXlrOiBod2IyY215ayxcbiAgaHdiMmtleXdvcmQ6IGh3YjJrZXl3b3JkLFxuXG4gIGNteWsycmdiOiBjbXlrMnJnYixcbiAgY215azJoc2w6IGNteWsyaHNsLFxuICBjbXlrMmhzdjogY215azJoc3YsXG4gIGNteWsyaHdiOiBjbXlrMmh3YixcbiAgY215azJrZXl3b3JkOiBjbXlrMmtleXdvcmQsXG5cbiAga2V5d29yZDJyZ2I6IGtleXdvcmQycmdiLFxuICBrZXl3b3JkMmhzbDoga2V5d29yZDJoc2wsXG4gIGtleXdvcmQyaHN2OiBrZXl3b3JkMmhzdixcbiAga2V5d29yZDJod2I6IGtleXdvcmQyaHdiLFxuICBrZXl3b3JkMmNteWs6IGtleXdvcmQyY215ayxcbiAga2V5d29yZDJsYWI6IGtleXdvcmQybGFiLFxuICBrZXl3b3JkMnh5ejoga2V5d29yZDJ4eXosXG5cbiAgeHl6MnJnYjogeHl6MnJnYixcbiAgeHl6MmxhYjogeHl6MmxhYixcbiAgeHl6MmxjaDogeHl6MmxjaCxcblxuICBsYWIyeHl6OiBsYWIyeHl6LFxuICBsYWIycmdiOiBsYWIycmdiLFxuICBsYWIybGNoOiBsYWIybGNoLFxuXG4gIGxjaDJsYWI6IGxjaDJsYWIsXG4gIGxjaDJ4eXo6IGxjaDJ4eXosXG4gIGxjaDJyZ2I6IGxjaDJyZ2Jcbn1cblxuXG5mdW5jdGlvbiByZ2IyaHNsKHJnYikge1xuICB2YXIgciA9IHJnYlswXS8yNTUsXG4gICAgICBnID0gcmdiWzFdLzI1NSxcbiAgICAgIGIgPSByZ2JbMl0vMjU1LFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGRlbHRhID0gbWF4IC0gbWluLFxuICAgICAgaCwgcywgbDtcblxuICBpZiAobWF4ID09IG1pbilcbiAgICBoID0gMDtcbiAgZWxzZSBpZiAociA9PSBtYXgpXG4gICAgaCA9IChnIC0gYikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoZyA9PSBtYXgpXG4gICAgaCA9IDIgKyAoYiAtIHIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGIgPT0gbWF4KVxuICAgIGggPSA0ICsgKHIgLSBnKS8gZGVsdGE7XG5cbiAgaCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuICBpZiAoaCA8IDApXG4gICAgaCArPSAzNjA7XG5cbiAgbCA9IChtaW4gKyBtYXgpIC8gMjtcblxuICBpZiAobWF4ID09IG1pbilcbiAgICBzID0gMDtcbiAgZWxzZSBpZiAobCA8PSAwLjUpXG4gICAgcyA9IGRlbHRhIC8gKG1heCArIG1pbik7XG4gIGVsc2VcbiAgICBzID0gZGVsdGEgLyAoMiAtIG1heCAtIG1pbik7XG5cbiAgcmV0dXJuIFtoLCBzICogMTAwLCBsICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmhzdihyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0sXG4gICAgICBnID0gcmdiWzFdLFxuICAgICAgYiA9IHJnYlsyXSxcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBkZWx0YSA9IG1heCAtIG1pbixcbiAgICAgIGgsIHMsIHY7XG5cbiAgaWYgKG1heCA9PSAwKVxuICAgIHMgPSAwO1xuICBlbHNlXG4gICAgcyA9IChkZWx0YS9tYXggKiAxMDAwKS8xMDtcblxuICBpZiAobWF4ID09IG1pbilcbiAgICBoID0gMDtcbiAgZWxzZSBpZiAociA9PSBtYXgpXG4gICAgaCA9IChnIC0gYikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoZyA9PSBtYXgpXG4gICAgaCA9IDIgKyAoYiAtIHIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGIgPT0gbWF4KVxuICAgIGggPSA0ICsgKHIgLSBnKSAvIGRlbHRhO1xuXG4gIGggPSBNYXRoLm1pbihoICogNjAsIDM2MCk7XG5cbiAgaWYgKGggPCAwKVxuICAgIGggKz0gMzYwO1xuXG4gIHYgPSAoKG1heCAvIDI1NSkgKiAxMDAwKSAvIDEwO1xuXG4gIHJldHVybiBbaCwgcywgdl07XG59XG5cbmZ1bmN0aW9uIHJnYjJod2IocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLFxuICAgICAgZyA9IHJnYlsxXSxcbiAgICAgIGIgPSByZ2JbMl0sXG4gICAgICBoID0gcmdiMmhzbChyZ2IpWzBdLFxuICAgICAgdyA9IDEvMjU1ICogTWF0aC5taW4ociwgTWF0aC5taW4oZywgYikpLFxuICAgICAgYiA9IDEgLSAxLzI1NSAqIE1hdGgubWF4KHIsIE1hdGgubWF4KGcsIGIpKTtcblxuICByZXR1cm4gW2gsIHcgKiAxMDAsIGIgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2IyY215ayhyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0gLyAyNTUsXG4gICAgICBnID0gcmdiWzFdIC8gMjU1LFxuICAgICAgYiA9IHJnYlsyXSAvIDI1NSxcbiAgICAgIGMsIG0sIHksIGs7XG5cbiAgayA9IE1hdGgubWluKDEgLSByLCAxIC0gZywgMSAtIGIpO1xuICBjID0gKDEgLSByIC0gaykgLyAoMSAtIGspIHx8IDA7XG4gIG0gPSAoMSAtIGcgLSBrKSAvICgxIC0gaykgfHwgMDtcbiAgeSA9ICgxIC0gYiAtIGspIC8gKDEgLSBrKSB8fCAwO1xuICByZXR1cm4gW2MgKiAxMDAsIG0gKiAxMDAsIHkgKiAxMDAsIGsgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2Iya2V5d29yZChyZ2IpIHtcbiAgcmV0dXJuIHJldmVyc2VLZXl3b3Jkc1tKU09OLnN0cmluZ2lmeShyZ2IpXTtcbn1cblxuZnVuY3Rpb24gcmdiMnh5eihyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0gLyAyNTUsXG4gICAgICBnID0gcmdiWzFdIC8gMjU1LFxuICAgICAgYiA9IHJnYlsyXSAvIDI1NTtcblxuICAvLyBhc3N1bWUgc1JHQlxuICByID0gciA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKHIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAociAvIDEyLjkyKTtcbiAgZyA9IGcgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChnICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKGcgLyAxMi45Mik7XG4gIGIgPSBiID4gMC4wNDA0NSA/IE1hdGgucG93KCgoYiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChiIC8gMTIuOTIpO1xuXG4gIHZhciB4ID0gKHIgKiAwLjQxMjQpICsgKGcgKiAwLjM1NzYpICsgKGIgKiAwLjE4MDUpO1xuICB2YXIgeSA9IChyICogMC4yMTI2KSArIChnICogMC43MTUyKSArIChiICogMC4wNzIyKTtcbiAgdmFyIHogPSAociAqIDAuMDE5MykgKyAoZyAqIDAuMTE5MikgKyAoYiAqIDAuOTUwNSk7XG5cbiAgcmV0dXJuIFt4ICogMTAwLCB5ICoxMDAsIHogKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2IybGFiKHJnYikge1xuICB2YXIgeHl6ID0gcmdiMnh5eihyZ2IpLFxuICAgICAgICB4ID0geHl6WzBdLFxuICAgICAgICB5ID0geHl6WzFdLFxuICAgICAgICB6ID0geHl6WzJdLFxuICAgICAgICBsLCBhLCBiO1xuXG4gIHggLz0gOTUuMDQ3O1xuICB5IC89IDEwMDtcbiAgeiAvPSAxMDguODgzO1xuXG4gIHggPSB4ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh4LCAxLzMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuICB5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMS8zKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcbiAgeiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEvMykgOiAoNy43ODcgKiB6KSArICgxNiAvIDExNik7XG5cbiAgbCA9ICgxMTYgKiB5KSAtIDE2O1xuICBhID0gNTAwICogKHggLSB5KTtcbiAgYiA9IDIwMCAqICh5IC0geik7XG5cbiAgcmV0dXJuIFtsLCBhLCBiXTtcbn1cblxuZnVuY3Rpb24gcmdiMmxjaChhcmdzKSB7XG4gIHJldHVybiBsYWIybGNoKHJnYjJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc2wycmdiKGhzbCkge1xuICB2YXIgaCA9IGhzbFswXSAvIDM2MCxcbiAgICAgIHMgPSBoc2xbMV0gLyAxMDAsXG4gICAgICBsID0gaHNsWzJdIC8gMTAwLFxuICAgICAgdDEsIHQyLCB0MywgcmdiLCB2YWw7XG5cbiAgaWYgKHMgPT0gMCkge1xuICAgIHZhbCA9IGwgKiAyNTU7XG4gICAgcmV0dXJuIFt2YWwsIHZhbCwgdmFsXTtcbiAgfVxuXG4gIGlmIChsIDwgMC41KVxuICAgIHQyID0gbCAqICgxICsgcyk7XG4gIGVsc2VcbiAgICB0MiA9IGwgKyBzIC0gbCAqIHM7XG4gIHQxID0gMiAqIGwgLSB0MjtcblxuICByZ2IgPSBbMCwgMCwgMF07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgdDMgPSBoICsgMSAvIDMgKiAtIChpIC0gMSk7XG4gICAgdDMgPCAwICYmIHQzKys7XG4gICAgdDMgPiAxICYmIHQzLS07XG5cbiAgICBpZiAoNiAqIHQzIDwgMSlcbiAgICAgIHZhbCA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzO1xuICAgIGVsc2UgaWYgKDIgKiB0MyA8IDEpXG4gICAgICB2YWwgPSB0MjtcbiAgICBlbHNlIGlmICgzICogdDMgPCAyKVxuICAgICAgdmFsID0gdDEgKyAodDIgLSB0MSkgKiAoMiAvIDMgLSB0MykgKiA2O1xuICAgIGVsc2VcbiAgICAgIHZhbCA9IHQxO1xuXG4gICAgcmdiW2ldID0gdmFsICogMjU1O1xuICB9XG5cbiAgcmV0dXJuIHJnYjtcbn1cblxuZnVuY3Rpb24gaHNsMmhzdihoc2wpIHtcbiAgdmFyIGggPSBoc2xbMF0sXG4gICAgICBzID0gaHNsWzFdIC8gMTAwLFxuICAgICAgbCA9IGhzbFsyXSAvIDEwMCxcbiAgICAgIHN2LCB2O1xuXG4gIGlmKGwgPT09IDApIHtcbiAgICAgIC8vIG5vIG5lZWQgdG8gZG8gY2FsYyBvbiBibGFja1xuICAgICAgLy8gYWxzbyBhdm9pZHMgZGl2aWRlIGJ5IDAgZXJyb3JcbiAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gIH1cblxuICBsICo9IDI7XG4gIHMgKj0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG4gIHYgPSAobCArIHMpIC8gMjtcbiAgc3YgPSAoMiAqIHMpIC8gKGwgKyBzKTtcbiAgcmV0dXJuIFtoLCBzdiAqIDEwMCwgdiAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIGhzbDJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3Yihoc2wycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHNsMmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHNsMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGhzbDJyZ2IoYXJncykpO1xufVxuXG5cbmZ1bmN0aW9uIGhzdjJyZ2IoaHN2KSB7XG4gIHZhciBoID0gaHN2WzBdIC8gNjAsXG4gICAgICBzID0gaHN2WzFdIC8gMTAwLFxuICAgICAgdiA9IGhzdlsyXSAvIDEwMCxcbiAgICAgIGhpID0gTWF0aC5mbG9vcihoKSAlIDY7XG5cbiAgdmFyIGYgPSBoIC0gTWF0aC5mbG9vcihoKSxcbiAgICAgIHAgPSAyNTUgKiB2ICogKDEgLSBzKSxcbiAgICAgIHEgPSAyNTUgKiB2ICogKDEgLSAocyAqIGYpKSxcbiAgICAgIHQgPSAyNTUgKiB2ICogKDEgLSAocyAqICgxIC0gZikpKSxcbiAgICAgIHYgPSAyNTUgKiB2O1xuXG4gIHN3aXRjaChoaSkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBbdiwgdCwgcF07XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFtxLCB2LCBwXTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gW3AsIHYsIHRdO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBbcCwgcSwgdl07XG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuIFt0LCBwLCB2XTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gW3YsIHAsIHFdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhzdjJoc2woaHN2KSB7XG4gIHZhciBoID0gaHN2WzBdLFxuICAgICAgcyA9IGhzdlsxXSAvIDEwMCxcbiAgICAgIHYgPSBoc3ZbMl0gLyAxMDAsXG4gICAgICBzbCwgbDtcblxuICBsID0gKDIgLSBzKSAqIHY7XG4gIHNsID0gcyAqIHY7XG4gIHNsIC89IChsIDw9IDEpID8gbCA6IDIgLSBsO1xuICBzbCA9IHNsIHx8IDA7XG4gIGwgLz0gMjtcbiAgcmV0dXJuIFtoLCBzbCAqIDEwMCwgbCAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIGhzdjJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3Yihoc3YycmdiKGFyZ3MpKVxufVxuXG5mdW5jdGlvbiBoc3YyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhoc3YycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHN2MmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoaHN2MnJnYihhcmdzKSk7XG59XG5cbi8vIGh0dHA6Ly9kZXYudzMub3JnL2Nzc3dnL2Nzcy1jb2xvci8jaHdiLXRvLXJnYlxuZnVuY3Rpb24gaHdiMnJnYihod2IpIHtcbiAgdmFyIGggPSBod2JbMF0gLyAzNjAsXG4gICAgICB3aCA9IGh3YlsxXSAvIDEwMCxcbiAgICAgIGJsID0gaHdiWzJdIC8gMTAwLFxuICAgICAgcmF0aW8gPSB3aCArIGJsLFxuICAgICAgaSwgdiwgZiwgbjtcblxuICAvLyB3aCArIGJsIGNhbnQgYmUgPiAxXG4gIGlmIChyYXRpbyA+IDEpIHtcbiAgICB3aCAvPSByYXRpbztcbiAgICBibCAvPSByYXRpbztcbiAgfVxuXG4gIGkgPSBNYXRoLmZsb29yKDYgKiBoKTtcbiAgdiA9IDEgLSBibDtcbiAgZiA9IDYgKiBoIC0gaTtcbiAgaWYgKChpICYgMHgwMSkgIT0gMCkge1xuICAgIGYgPSAxIC0gZjtcbiAgfVxuICBuID0gd2ggKyBmICogKHYgLSB3aCk7ICAvLyBsaW5lYXIgaW50ZXJwb2xhdGlvblxuXG4gIHN3aXRjaCAoaSkge1xuICAgIGRlZmF1bHQ6XG4gICAgY2FzZSA2OlxuICAgIGNhc2UgMDogciA9IHY7IGcgPSBuOyBiID0gd2g7IGJyZWFrO1xuICAgIGNhc2UgMTogciA9IG47IGcgPSB2OyBiID0gd2g7IGJyZWFrO1xuICAgIGNhc2UgMjogciA9IHdoOyBnID0gdjsgYiA9IG47IGJyZWFrO1xuICAgIGNhc2UgMzogciA9IHdoOyBnID0gbjsgYiA9IHY7IGJyZWFrO1xuICAgIGNhc2UgNDogciA9IG47IGcgPSB3aDsgYiA9IHY7IGJyZWFrO1xuICAgIGNhc2UgNTogciA9IHY7IGcgPSB3aDsgYiA9IG47IGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24gaHdiMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBod2IyaHN2KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc3YoaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGh3YjJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBod2Iya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJyZ2IoY215aykge1xuICB2YXIgYyA9IGNteWtbMF0gLyAxMDAsXG4gICAgICBtID0gY215a1sxXSAvIDEwMCxcbiAgICAgIHkgPSBjbXlrWzJdIC8gMTAwLFxuICAgICAgayA9IGNteWtbM10gLyAxMDAsXG4gICAgICByLCBnLCBiO1xuXG4gIHIgPSAxIC0gTWF0aC5taW4oMSwgYyAqICgxIC0gaykgKyBrKTtcbiAgZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspO1xuICBiID0gMSAtIE1hdGgubWluKDEsIHkgKiAoMSAtIGspICsgayk7XG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIGNteWsyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3YihjbXlrMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChjbXlrMnJnYihhcmdzKSk7XG59XG5cblxuZnVuY3Rpb24geHl6MnJnYih4eXopIHtcbiAgdmFyIHggPSB4eXpbMF0gLyAxMDAsXG4gICAgICB5ID0geHl6WzFdIC8gMTAwLFxuICAgICAgeiA9IHh5elsyXSAvIDEwMCxcbiAgICAgIHIsIGcsIGI7XG5cbiAgciA9ICh4ICogMy4yNDA2KSArICh5ICogLTEuNTM3MikgKyAoeiAqIC0wLjQ5ODYpO1xuICBnID0gKHggKiAtMC45Njg5KSArICh5ICogMS44NzU4KSArICh6ICogMC4wNDE1KTtcbiAgYiA9ICh4ICogMC4wNTU3KSArICh5ICogLTAuMjA0MCkgKyAoeiAqIDEuMDU3MCk7XG5cbiAgLy8gYXNzdW1lIHNSR0JcbiAgciA9IHIgPiAwLjAwMzEzMDggPyAoKDEuMDU1ICogTWF0aC5wb3cociwgMS4wIC8gMi40KSkgLSAwLjA1NSlcbiAgICA6IHIgPSAociAqIDEyLjkyKTtcblxuICBnID0gZyA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhnLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogZyA9IChnICogMTIuOTIpO1xuXG4gIGIgPSBiID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KGIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiBiID0gKGIgKiAxMi45Mik7XG5cbiAgciA9IE1hdGgubWluKE1hdGgubWF4KDAsIHIpLCAxKTtcbiAgZyA9IE1hdGgubWluKE1hdGgubWF4KDAsIGcpLCAxKTtcbiAgYiA9IE1hdGgubWluKE1hdGgubWF4KDAsIGIpLCAxKTtcblxuICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufVxuXG5mdW5jdGlvbiB4eXoybGFiKHh5eikge1xuICB2YXIgeCA9IHh5elswXSxcbiAgICAgIHkgPSB4eXpbMV0sXG4gICAgICB6ID0geHl6WzJdLFxuICAgICAgbCwgYSwgYjtcblxuICB4IC89IDk1LjA0NztcbiAgeSAvPSAxMDA7XG4gIHogLz0gMTA4Ljg4MztcblxuICB4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMS8zKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcbiAgeSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEvMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG4gIHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxLzMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG4gIGwgPSAoMTE2ICogeSkgLSAxNjtcbiAgYSA9IDUwMCAqICh4IC0geSk7XG4gIGIgPSAyMDAgKiAoeSAtIHopO1xuXG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIHh5ejJsY2goYXJncykge1xuICByZXR1cm4gbGFiMmxjaCh4eXoybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gbGFiMnh5eihsYWIpIHtcbiAgdmFyIGwgPSBsYWJbMF0sXG4gICAgICBhID0gbGFiWzFdLFxuICAgICAgYiA9IGxhYlsyXSxcbiAgICAgIHgsIHksIHosIHkyO1xuXG4gIGlmIChsIDw9IDgpIHtcbiAgICB5ID0gKGwgKiAxMDApIC8gOTAzLjM7XG4gICAgeTIgPSAoNy43ODcgKiAoeSAvIDEwMCkpICsgKDE2IC8gMTE2KTtcbiAgfSBlbHNlIHtcbiAgICB5ID0gMTAwICogTWF0aC5wb3coKGwgKyAxNikgLyAxMTYsIDMpO1xuICAgIHkyID0gTWF0aC5wb3coeSAvIDEwMCwgMS8zKTtcbiAgfVxuXG4gIHggPSB4IC8gOTUuMDQ3IDw9IDAuMDA4ODU2ID8geCA9ICg5NS4wNDcgKiAoKGEgLyA1MDApICsgeTIgLSAoMTYgLyAxMTYpKSkgLyA3Ljc4NyA6IDk1LjA0NyAqIE1hdGgucG93KChhIC8gNTAwKSArIHkyLCAzKTtcblxuICB6ID0geiAvIDEwOC44ODMgPD0gMC4wMDg4NTkgPyB6ID0gKDEwOC44ODMgKiAoeTIgLSAoYiAvIDIwMCkgLSAoMTYgLyAxMTYpKSkgLyA3Ljc4NyA6IDEwOC44ODMgKiBNYXRoLnBvdyh5MiAtIChiIC8gMjAwKSwgMyk7XG5cbiAgcmV0dXJuIFt4LCB5LCB6XTtcbn1cblxuZnVuY3Rpb24gbGFiMmxjaChsYWIpIHtcbiAgdmFyIGwgPSBsYWJbMF0sXG4gICAgICBhID0gbGFiWzFdLFxuICAgICAgYiA9IGxhYlsyXSxcbiAgICAgIGhyLCBoLCBjO1xuXG4gIGhyID0gTWF0aC5hdGFuMihiLCBhKTtcbiAgaCA9IGhyICogMzYwIC8gMiAvIE1hdGguUEk7XG4gIGlmIChoIDwgMCkge1xuICAgIGggKz0gMzYwO1xuICB9XG4gIGMgPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYik7XG4gIHJldHVybiBbbCwgYywgaF07XG59XG5cbmZ1bmN0aW9uIGxhYjJyZ2IoYXJncykge1xuICByZXR1cm4geHl6MnJnYihsYWIyeHl6KGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gbGNoMmxhYihsY2gpIHtcbiAgdmFyIGwgPSBsY2hbMF0sXG4gICAgICBjID0gbGNoWzFdLFxuICAgICAgaCA9IGxjaFsyXSxcbiAgICAgIGEsIGIsIGhyO1xuXG4gIGhyID0gaCAvIDM2MCAqIDIgKiBNYXRoLlBJO1xuICBhID0gYyAqIE1hdGguY29zKGhyKTtcbiAgYiA9IGMgKiBNYXRoLnNpbihocik7XG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIGxjaDJ4eXooYXJncykge1xuICByZXR1cm4gbGFiMnh5eihsY2gybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gbGNoMnJnYihhcmdzKSB7XG4gIHJldHVybiBsYWIycmdiKGxjaDJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMnJnYihrZXl3b3JkKSB7XG4gIHJldHVybiBjc3NLZXl3b3Jkc1trZXl3b3JkXTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJoc2woYXJncykge1xuICByZXR1cm4gcmdiMmhzbChrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyaHN2KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc3Yoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJsYWIoYXJncykge1xuICByZXR1cm4gcmdiMmxhYihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyeHl6KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJ4eXooa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG52YXIgY3NzS2V5d29yZHMgPSB7XG4gIGFsaWNlYmx1ZTogIFsyNDAsMjQ4LDI1NV0sXG4gIGFudGlxdWV3aGl0ZTogWzI1MCwyMzUsMjE1XSxcbiAgYXF1YTogWzAsMjU1LDI1NV0sXG4gIGFxdWFtYXJpbmU6IFsxMjcsMjU1LDIxMl0sXG4gIGF6dXJlOiAgWzI0MCwyNTUsMjU1XSxcbiAgYmVpZ2U6ICBbMjQ1LDI0NSwyMjBdLFxuICBiaXNxdWU6IFsyNTUsMjI4LDE5Nl0sXG4gIGJsYWNrOiAgWzAsMCwwXSxcbiAgYmxhbmNoZWRhbG1vbmQ6IFsyNTUsMjM1LDIwNV0sXG4gIGJsdWU6IFswLDAsMjU1XSxcbiAgYmx1ZXZpb2xldDogWzEzOCw0MywyMjZdLFxuICBicm93bjogIFsxNjUsNDIsNDJdLFxuICBidXJseXdvb2Q6ICBbMjIyLDE4NCwxMzVdLFxuICBjYWRldGJsdWU6ICBbOTUsMTU4LDE2MF0sXG4gIGNoYXJ0cmV1c2U6IFsxMjcsMjU1LDBdLFxuICBjaG9jb2xhdGU6ICBbMjEwLDEwNSwzMF0sXG4gIGNvcmFsOiAgWzI1NSwxMjcsODBdLFxuICBjb3JuZmxvd2VyYmx1ZTogWzEwMCwxNDksMjM3XSxcbiAgY29ybnNpbGs6IFsyNTUsMjQ4LDIyMF0sXG4gIGNyaW1zb246ICBbMjIwLDIwLDYwXSxcbiAgY3lhbjogWzAsMjU1LDI1NV0sXG4gIGRhcmtibHVlOiBbMCwwLDEzOV0sXG4gIGRhcmtjeWFuOiBbMCwxMzksMTM5XSxcbiAgZGFya2dvbGRlbnJvZDogIFsxODQsMTM0LDExXSxcbiAgZGFya2dyYXk6IFsxNjksMTY5LDE2OV0sXG4gIGRhcmtncmVlbjogIFswLDEwMCwwXSxcbiAgZGFya2dyZXk6IFsxNjksMTY5LDE2OV0sXG4gIGRhcmtraGFraTogIFsxODksMTgzLDEwN10sXG4gIGRhcmttYWdlbnRhOiAgWzEzOSwwLDEzOV0sXG4gIGRhcmtvbGl2ZWdyZWVuOiBbODUsMTA3LDQ3XSxcbiAgZGFya29yYW5nZTogWzI1NSwxNDAsMF0sXG4gIGRhcmtvcmNoaWQ6IFsxNTMsNTAsMjA0XSxcbiAgZGFya3JlZDogIFsxMzksMCwwXSxcbiAgZGFya3NhbG1vbjogWzIzMywxNTAsMTIyXSxcbiAgZGFya3NlYWdyZWVuOiBbMTQzLDE4OCwxNDNdLFxuICBkYXJrc2xhdGVibHVlOiAgWzcyLDYxLDEzOV0sXG4gIGRhcmtzbGF0ZWdyYXk6ICBbNDcsNzksNzldLFxuICBkYXJrc2xhdGVncmV5OiAgWzQ3LDc5LDc5XSxcbiAgZGFya3R1cnF1b2lzZTogIFswLDIwNiwyMDldLFxuICBkYXJrdmlvbGV0OiBbMTQ4LDAsMjExXSxcbiAgZGVlcHBpbms6IFsyNTUsMjAsMTQ3XSxcbiAgZGVlcHNreWJsdWU6ICBbMCwxOTEsMjU1XSxcbiAgZGltZ3JheTogIFsxMDUsMTA1LDEwNV0sXG4gIGRpbWdyZXk6ICBbMTA1LDEwNSwxMDVdLFxuICBkb2RnZXJibHVlOiBbMzAsMTQ0LDI1NV0sXG4gIGZpcmVicmljazogIFsxNzgsMzQsMzRdLFxuICBmbG9yYWx3aGl0ZTogIFsyNTUsMjUwLDI0MF0sXG4gIGZvcmVzdGdyZWVuOiAgWzM0LDEzOSwzNF0sXG4gIGZ1Y2hzaWE6ICBbMjU1LDAsMjU1XSxcbiAgZ2FpbnNib3JvOiAgWzIyMCwyMjAsMjIwXSxcbiAgZ2hvc3R3aGl0ZTogWzI0OCwyNDgsMjU1XSxcbiAgZ29sZDogWzI1NSwyMTUsMF0sXG4gIGdvbGRlbnJvZDogIFsyMTgsMTY1LDMyXSxcbiAgZ3JheTogWzEyOCwxMjgsMTI4XSxcbiAgZ3JlZW46ICBbMCwxMjgsMF0sXG4gIGdyZWVueWVsbG93OiAgWzE3MywyNTUsNDddLFxuICBncmV5OiBbMTI4LDEyOCwxMjhdLFxuICBob25leWRldzogWzI0MCwyNTUsMjQwXSxcbiAgaG90cGluazogIFsyNTUsMTA1LDE4MF0sXG4gIGluZGlhbnJlZDogIFsyMDUsOTIsOTJdLFxuICBpbmRpZ286IFs3NSwwLDEzMF0sXG4gIGl2b3J5OiAgWzI1NSwyNTUsMjQwXSxcbiAga2hha2k6ICBbMjQwLDIzMCwxNDBdLFxuICBsYXZlbmRlcjogWzIzMCwyMzAsMjUwXSxcbiAgbGF2ZW5kZXJibHVzaDogIFsyNTUsMjQwLDI0NV0sXG4gIGxhd25ncmVlbjogIFsxMjQsMjUyLDBdLFxuICBsZW1vbmNoaWZmb246IFsyNTUsMjUwLDIwNV0sXG4gIGxpZ2h0Ymx1ZTogIFsxNzMsMjE2LDIzMF0sXG4gIGxpZ2h0Y29yYWw6IFsyNDAsMTI4LDEyOF0sXG4gIGxpZ2h0Y3lhbjogIFsyMjQsMjU1LDI1NV0sXG4gIGxpZ2h0Z29sZGVucm9keWVsbG93OiBbMjUwLDI1MCwyMTBdLFxuICBsaWdodGdyYXk6ICBbMjExLDIxMSwyMTFdLFxuICBsaWdodGdyZWVuOiBbMTQ0LDIzOCwxNDRdLFxuICBsaWdodGdyZXk6ICBbMjExLDIxMSwyMTFdLFxuICBsaWdodHBpbms6ICBbMjU1LDE4MiwxOTNdLFxuICBsaWdodHNhbG1vbjogIFsyNTUsMTYwLDEyMl0sXG4gIGxpZ2h0c2VhZ3JlZW46ICBbMzIsMTc4LDE3MF0sXG4gIGxpZ2h0c2t5Ymx1ZTogWzEzNSwyMDYsMjUwXSxcbiAgbGlnaHRzbGF0ZWdyYXk6IFsxMTksMTM2LDE1M10sXG4gIGxpZ2h0c2xhdGVncmV5OiBbMTE5LDEzNiwxNTNdLFxuICBsaWdodHN0ZWVsYmx1ZTogWzE3NiwxOTYsMjIyXSxcbiAgbGlnaHR5ZWxsb3c6ICBbMjU1LDI1NSwyMjRdLFxuICBsaW1lOiBbMCwyNTUsMF0sXG4gIGxpbWVncmVlbjogIFs1MCwyMDUsNTBdLFxuICBsaW5lbjogIFsyNTAsMjQwLDIzMF0sXG4gIG1hZ2VudGE6ICBbMjU1LDAsMjU1XSxcbiAgbWFyb29uOiBbMTI4LDAsMF0sXG4gIG1lZGl1bWFxdWFtYXJpbmU6IFsxMDIsMjA1LDE3MF0sXG4gIG1lZGl1bWJsdWU6IFswLDAsMjA1XSxcbiAgbWVkaXVtb3JjaGlkOiBbMTg2LDg1LDIxMV0sXG4gIG1lZGl1bXB1cnBsZTogWzE0NywxMTIsMjE5XSxcbiAgbWVkaXVtc2VhZ3JlZW46IFs2MCwxNzksMTEzXSxcbiAgbWVkaXVtc2xhdGVibHVlOiAgWzEyMywxMDQsMjM4XSxcbiAgbWVkaXVtc3ByaW5nZ3JlZW46ICBbMCwyNTAsMTU0XSxcbiAgbWVkaXVtdHVycXVvaXNlOiAgWzcyLDIwOSwyMDRdLFxuICBtZWRpdW12aW9sZXRyZWQ6ICBbMTk5LDIxLDEzM10sXG4gIG1pZG5pZ2h0Ymx1ZTogWzI1LDI1LDExMl0sXG4gIG1pbnRjcmVhbTogIFsyNDUsMjU1LDI1MF0sXG4gIG1pc3R5cm9zZTogIFsyNTUsMjI4LDIyNV0sXG4gIG1vY2Nhc2luOiBbMjU1LDIyOCwxODFdLFxuICBuYXZham93aGl0ZTogIFsyNTUsMjIyLDE3M10sXG4gIG5hdnk6IFswLDAsMTI4XSxcbiAgb2xkbGFjZTogIFsyNTMsMjQ1LDIzMF0sXG4gIG9saXZlOiAgWzEyOCwxMjgsMF0sXG4gIG9saXZlZHJhYjogIFsxMDcsMTQyLDM1XSxcbiAgb3JhbmdlOiBbMjU1LDE2NSwwXSxcbiAgb3JhbmdlcmVkOiAgWzI1NSw2OSwwXSxcbiAgb3JjaGlkOiBbMjE4LDExMiwyMTRdLFxuICBwYWxlZ29sZGVucm9kOiAgWzIzOCwyMzIsMTcwXSxcbiAgcGFsZWdyZWVuOiAgWzE1MiwyNTEsMTUyXSxcbiAgcGFsZXR1cnF1b2lzZTogIFsxNzUsMjM4LDIzOF0sXG4gIHBhbGV2aW9sZXRyZWQ6ICBbMjE5LDExMiwxNDddLFxuICBwYXBheWF3aGlwOiBbMjU1LDIzOSwyMTNdLFxuICBwZWFjaHB1ZmY6ICBbMjU1LDIxOCwxODVdLFxuICBwZXJ1OiBbMjA1LDEzMyw2M10sXG4gIHBpbms6IFsyNTUsMTkyLDIwM10sXG4gIHBsdW06IFsyMjEsMTYwLDIyMV0sXG4gIHBvd2RlcmJsdWU6IFsxNzYsMjI0LDIzMF0sXG4gIHB1cnBsZTogWzEyOCwwLDEyOF0sXG4gIHJlYmVjY2FwdXJwbGU6IFsxMDIsIDUxLCAxNTNdLFxuICByZWQ6ICBbMjU1LDAsMF0sXG4gIHJvc3licm93bjogIFsxODgsMTQzLDE0M10sXG4gIHJveWFsYmx1ZTogIFs2NSwxMDUsMjI1XSxcbiAgc2FkZGxlYnJvd246ICBbMTM5LDY5LDE5XSxcbiAgc2FsbW9uOiBbMjUwLDEyOCwxMTRdLFxuICBzYW5keWJyb3duOiBbMjQ0LDE2NCw5Nl0sXG4gIHNlYWdyZWVuOiBbNDYsMTM5LDg3XSxcbiAgc2Vhc2hlbGw6IFsyNTUsMjQ1LDIzOF0sXG4gIHNpZW5uYTogWzE2MCw4Miw0NV0sXG4gIHNpbHZlcjogWzE5MiwxOTIsMTkyXSxcbiAgc2t5Ymx1ZTogIFsxMzUsMjA2LDIzNV0sXG4gIHNsYXRlYmx1ZTogIFsxMDYsOTAsMjA1XSxcbiAgc2xhdGVncmF5OiAgWzExMiwxMjgsMTQ0XSxcbiAgc2xhdGVncmV5OiAgWzExMiwxMjgsMTQ0XSxcbiAgc25vdzogWzI1NSwyNTAsMjUwXSxcbiAgc3ByaW5nZ3JlZW46ICBbMCwyNTUsMTI3XSxcbiAgc3RlZWxibHVlOiAgWzcwLDEzMCwxODBdLFxuICB0YW46ICBbMjEwLDE4MCwxNDBdLFxuICB0ZWFsOiBbMCwxMjgsMTI4XSxcbiAgdGhpc3RsZTogIFsyMTYsMTkxLDIxNl0sXG4gIHRvbWF0bzogWzI1NSw5OSw3MV0sXG4gIHR1cnF1b2lzZTogIFs2NCwyMjQsMjA4XSxcbiAgdmlvbGV0OiBbMjM4LDEzMCwyMzhdLFxuICB3aGVhdDogIFsyNDUsMjIyLDE3OV0sXG4gIHdoaXRlOiAgWzI1NSwyNTUsMjU1XSxcbiAgd2hpdGVzbW9rZTogWzI0NSwyNDUsMjQ1XSxcbiAgeWVsbG93OiBbMjU1LDI1NSwwXSxcbiAgeWVsbG93Z3JlZW46ICBbMTU0LDIwNSw1MF1cbn07XG5cbnZhciByZXZlcnNlS2V5d29yZHMgPSB7fTtcbmZvciAodmFyIGtleSBpbiBjc3NLZXl3b3Jkcykge1xuICByZXZlcnNlS2V5d29yZHNbSlNPTi5zdHJpbmdpZnkoY3NzS2V5d29yZHNba2V5XSldID0ga2V5O1xufVxuIiwidmFyIGNvbnZlcnNpb25zID0gcmVxdWlyZShcIi4vY29udmVyc2lvbnNcIik7XG5cbnZhciBjb252ZXJ0ID0gZnVuY3Rpb24oKSB7XG4gICByZXR1cm4gbmV3IENvbnZlcnRlcigpO1xufVxuXG5mb3IgKHZhciBmdW5jIGluIGNvbnZlcnNpb25zKSB7XG4gIC8vIGV4cG9ydCBSYXcgdmVyc2lvbnNcbiAgY29udmVydFtmdW5jICsgXCJSYXdcIl0gPSAgKGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAvLyBhY2NlcHQgYXJyYXkgb3IgcGxhaW4gYXJnc1xuICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnID09IFwibnVtYmVyXCIpXG4gICAgICAgIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gY29udmVyc2lvbnNbZnVuY10oYXJnKTtcbiAgICB9XG4gIH0pKGZ1bmMpO1xuXG4gIHZhciBwYWlyID0gLyhcXHcrKTIoXFx3KykvLmV4ZWMoZnVuYyksXG4gICAgICBmcm9tID0gcGFpclsxXSxcbiAgICAgIHRvID0gcGFpclsyXTtcblxuICAvLyBleHBvcnQgcmdiMmhzbCBhbmQgW1wicmdiXCJdW1wiaHNsXCJdXG4gIGNvbnZlcnRbZnJvbV0gPSBjb252ZXJ0W2Zyb21dIHx8IHt9O1xuXG4gIGNvbnZlcnRbZnJvbV1bdG9dID0gY29udmVydFtmdW5jXSA9IChmdW5jdGlvbihmdW5jKSB7IFxuICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnID09IFwibnVtYmVyXCIpXG4gICAgICAgIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBcbiAgICAgIHZhciB2YWwgPSBjb252ZXJzaW9uc1tmdW5jXShhcmcpO1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gXCJzdHJpbmdcIiB8fCB2YWwgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHZhbDsgLy8ga2V5d29yZFxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKylcbiAgICAgICAgdmFsW2ldID0gTWF0aC5yb3VuZCh2YWxbaV0pO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gIH0pKGZ1bmMpO1xufVxuXG5cbi8qIENvbnZlcnRlciBkb2VzIGxhenkgY29udmVyc2lvbiBhbmQgY2FjaGluZyAqL1xudmFyIENvbnZlcnRlciA9IGZ1bmN0aW9uKCkge1xuICAgdGhpcy5jb252cyA9IHt9O1xufTtcblxuLyogRWl0aGVyIGdldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlIG9yXG4gIHNldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlLCBkZXBlbmRpbmcgb24gYXJncyAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5yb3V0ZVNwYWNlID0gZnVuY3Rpb24oc3BhY2UsIGFyZ3MpIHtcbiAgIHZhciB2YWx1ZXMgPSBhcmdzWzBdO1xuICAgaWYgKHZhbHVlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBjb2xvci5yZ2IoKVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVzKHNwYWNlKTtcbiAgIH1cbiAgIC8vIGNvbG9yLnJnYigxMCwgMTAsIDEwKVxuICAgaWYgKHR5cGVvZiB2YWx1ZXMgPT0gXCJudW1iZXJcIikge1xuICAgICAgdmFsdWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7ICAgICAgICBcbiAgIH1cblxuICAgcmV0dXJuIHRoaXMuc2V0VmFsdWVzKHNwYWNlLCB2YWx1ZXMpO1xufTtcbiAgXG4vKiBTZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSwgaW52YWxpZGF0aW5nIGNhY2hlICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLnNldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlLCB2YWx1ZXMpIHtcbiAgIHRoaXMuc3BhY2UgPSBzcGFjZTtcbiAgIHRoaXMuY29udnMgPSB7fTtcbiAgIHRoaXMuY29udnNbc3BhY2VdID0gdmFsdWVzO1xuICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiBHZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZS4gSWYgdGhlcmUncyBhbHJlYWR5XG4gIGEgY29udmVyc2lvbiBmb3IgdGhlIHNwYWNlLCBmZXRjaCBpdCwgb3RoZXJ3aXNlXG4gIGNvbXB1dGUgaXQgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUuZ2V0VmFsdWVzID0gZnVuY3Rpb24oc3BhY2UpIHtcbiAgIHZhciB2YWxzID0gdGhpcy5jb252c1tzcGFjZV07XG4gICBpZiAoIXZhbHMpIHtcbiAgICAgIHZhciBmc3BhY2UgPSB0aGlzLnNwYWNlLFxuICAgICAgICAgIGZyb20gPSB0aGlzLmNvbnZzW2ZzcGFjZV07XG4gICAgICB2YWxzID0gY29udmVydFtmc3BhY2VdW3NwYWNlXShmcm9tKTtcblxuICAgICAgdGhpcy5jb252c1tzcGFjZV0gPSB2YWxzO1xuICAgfVxuICByZXR1cm4gdmFscztcbn07XG5cbltcInJnYlwiLCBcImhzbFwiLCBcImhzdlwiLCBcImNteWtcIiwgXCJrZXl3b3JkXCJdLmZvckVhY2goZnVuY3Rpb24oc3BhY2UpIHtcbiAgIENvbnZlcnRlci5wcm90b3R5cGVbc3BhY2VdID0gZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVTcGFjZShzcGFjZSwgYXJndW1lbnRzKTtcbiAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnZlcnQ7IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0XCJhbGljZWJsdWVcIjogWzI0MCwgMjQ4LCAyNTVdLFxyXG5cdFwiYW50aXF1ZXdoaXRlXCI6IFsyNTAsIDIzNSwgMjE1XSxcclxuXHRcImFxdWFcIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImFxdWFtYXJpbmVcIjogWzEyNywgMjU1LCAyMTJdLFxyXG5cdFwiYXp1cmVcIjogWzI0MCwgMjU1LCAyNTVdLFxyXG5cdFwiYmVpZ2VcIjogWzI0NSwgMjQ1LCAyMjBdLFxyXG5cdFwiYmlzcXVlXCI6IFsyNTUsIDIyOCwgMTk2XSxcclxuXHRcImJsYWNrXCI6IFswLCAwLCAwXSxcclxuXHRcImJsYW5jaGVkYWxtb25kXCI6IFsyNTUsIDIzNSwgMjA1XSxcclxuXHRcImJsdWVcIjogWzAsIDAsIDI1NV0sXHJcblx0XCJibHVldmlvbGV0XCI6IFsxMzgsIDQzLCAyMjZdLFxyXG5cdFwiYnJvd25cIjogWzE2NSwgNDIsIDQyXSxcclxuXHRcImJ1cmx5d29vZFwiOiBbMjIyLCAxODQsIDEzNV0sXHJcblx0XCJjYWRldGJsdWVcIjogWzk1LCAxNTgsIDE2MF0sXHJcblx0XCJjaGFydHJldXNlXCI6IFsxMjcsIDI1NSwgMF0sXHJcblx0XCJjaG9jb2xhdGVcIjogWzIxMCwgMTA1LCAzMF0sXHJcblx0XCJjb3JhbFwiOiBbMjU1LCAxMjcsIDgwXSxcclxuXHRcImNvcm5mbG93ZXJibHVlXCI6IFsxMDAsIDE0OSwgMjM3XSxcclxuXHRcImNvcm5zaWxrXCI6IFsyNTUsIDI0OCwgMjIwXSxcclxuXHRcImNyaW1zb25cIjogWzIyMCwgMjAsIDYwXSxcclxuXHRcImN5YW5cIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImRhcmtibHVlXCI6IFswLCAwLCAxMzldLFxyXG5cdFwiZGFya2N5YW5cIjogWzAsIDEzOSwgMTM5XSxcclxuXHRcImRhcmtnb2xkZW5yb2RcIjogWzE4NCwgMTM0LCAxMV0sXHJcblx0XCJkYXJrZ3JheVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJrZ3JlZW5cIjogWzAsIDEwMCwgMF0sXHJcblx0XCJkYXJrZ3JleVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJra2hha2lcIjogWzE4OSwgMTgzLCAxMDddLFxyXG5cdFwiZGFya21hZ2VudGFcIjogWzEzOSwgMCwgMTM5XSxcclxuXHRcImRhcmtvbGl2ZWdyZWVuXCI6IFs4NSwgMTA3LCA0N10sXHJcblx0XCJkYXJrb3JhbmdlXCI6IFsyNTUsIDE0MCwgMF0sXHJcblx0XCJkYXJrb3JjaGlkXCI6IFsxNTMsIDUwLCAyMDRdLFxyXG5cdFwiZGFya3JlZFwiOiBbMTM5LCAwLCAwXSxcclxuXHRcImRhcmtzYWxtb25cIjogWzIzMywgMTUwLCAxMjJdLFxyXG5cdFwiZGFya3NlYWdyZWVuXCI6IFsxNDMsIDE4OCwgMTQzXSxcclxuXHRcImRhcmtzbGF0ZWJsdWVcIjogWzcyLCA2MSwgMTM5XSxcclxuXHRcImRhcmtzbGF0ZWdyYXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3NsYXRlZ3JleVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrdHVycXVvaXNlXCI6IFswLCAyMDYsIDIwOV0sXHJcblx0XCJkYXJrdmlvbGV0XCI6IFsxNDgsIDAsIDIxMV0sXHJcblx0XCJkZWVwcGlua1wiOiBbMjU1LCAyMCwgMTQ3XSxcclxuXHRcImRlZXBza3libHVlXCI6IFswLCAxOTEsIDI1NV0sXHJcblx0XCJkaW1ncmF5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRpbWdyZXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZG9kZ2VyYmx1ZVwiOiBbMzAsIDE0NCwgMjU1XSxcclxuXHRcImZpcmVicmlja1wiOiBbMTc4LCAzNCwgMzRdLFxyXG5cdFwiZmxvcmFsd2hpdGVcIjogWzI1NSwgMjUwLCAyNDBdLFxyXG5cdFwiZm9yZXN0Z3JlZW5cIjogWzM0LCAxMzksIDM0XSxcclxuXHRcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcclxuXHRcImdhaW5zYm9yb1wiOiBbMjIwLCAyMjAsIDIyMF0sXHJcblx0XCJnaG9zdHdoaXRlXCI6IFsyNDgsIDI0OCwgMjU1XSxcclxuXHRcImdvbGRcIjogWzI1NSwgMjE1LCAwXSxcclxuXHRcImdvbGRlbnJvZFwiOiBbMjE4LCAxNjUsIDMyXSxcclxuXHRcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXHJcblx0XCJncmVlbnllbGxvd1wiOiBbMTczLCAyNTUsIDQ3XSxcclxuXHRcImdyZXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiaG9uZXlkZXdcIjogWzI0MCwgMjU1LCAyNDBdLFxyXG5cdFwiaG90cGlua1wiOiBbMjU1LCAxMDUsIDE4MF0sXHJcblx0XCJpbmRpYW5yZWRcIjogWzIwNSwgOTIsIDkyXSxcclxuXHRcImluZGlnb1wiOiBbNzUsIDAsIDEzMF0sXHJcblx0XCJpdm9yeVwiOiBbMjU1LCAyNTUsIDI0MF0sXHJcblx0XCJraGFraVwiOiBbMjQwLCAyMzAsIDE0MF0sXHJcblx0XCJsYXZlbmRlclwiOiBbMjMwLCAyMzAsIDI1MF0sXHJcblx0XCJsYXZlbmRlcmJsdXNoXCI6IFsyNTUsIDI0MCwgMjQ1XSxcclxuXHRcImxhd25ncmVlblwiOiBbMTI0LCAyNTIsIDBdLFxyXG5cdFwibGVtb25jaGlmZm9uXCI6IFsyNTUsIDI1MCwgMjA1XSxcclxuXHRcImxpZ2h0Ymx1ZVwiOiBbMTczLCAyMTYsIDIzMF0sXHJcblx0XCJsaWdodGNvcmFsXCI6IFsyNDAsIDEyOCwgMTI4XSxcclxuXHRcImxpZ2h0Y3lhblwiOiBbMjI0LCAyNTUsIDI1NV0sXHJcblx0XCJsaWdodGdvbGRlbnJvZHllbGxvd1wiOiBbMjUwLCAyNTAsIDIxMF0sXHJcblx0XCJsaWdodGdyYXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRncmVlblwiOiBbMTQ0LCAyMzgsIDE0NF0sXHJcblx0XCJsaWdodGdyZXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRwaW5rXCI6IFsyNTUsIDE4MiwgMTkzXSxcclxuXHRcImxpZ2h0c2FsbW9uXCI6IFsyNTUsIDE2MCwgMTIyXSxcclxuXHRcImxpZ2h0c2VhZ3JlZW5cIjogWzMyLCAxNzgsIDE3MF0sXHJcblx0XCJsaWdodHNreWJsdWVcIjogWzEzNSwgMjA2LCAyNTBdLFxyXG5cdFwibGlnaHRzbGF0ZWdyYXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzbGF0ZWdyZXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzdGVlbGJsdWVcIjogWzE3NiwgMTk2LCAyMjJdLFxyXG5cdFwibGlnaHR5ZWxsb3dcIjogWzI1NSwgMjU1LCAyMjRdLFxyXG5cdFwibGltZVwiOiBbMCwgMjU1LCAwXSxcclxuXHRcImxpbWVncmVlblwiOiBbNTAsIDIwNSwgNTBdLFxyXG5cdFwibGluZW5cIjogWzI1MCwgMjQwLCAyMzBdLFxyXG5cdFwibWFnZW50YVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxyXG5cdFwibWVkaXVtYXF1YW1hcmluZVwiOiBbMTAyLCAyMDUsIDE3MF0sXHJcblx0XCJtZWRpdW1ibHVlXCI6IFswLCAwLCAyMDVdLFxyXG5cdFwibWVkaXVtb3JjaGlkXCI6IFsxODYsIDg1LCAyMTFdLFxyXG5cdFwibWVkaXVtcHVycGxlXCI6IFsxNDcsIDExMiwgMjE5XSxcclxuXHRcIm1lZGl1bXNlYWdyZWVuXCI6IFs2MCwgMTc5LCAxMTNdLFxyXG5cdFwibWVkaXVtc2xhdGVibHVlXCI6IFsxMjMsIDEwNCwgMjM4XSxcclxuXHRcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IFswLCAyNTAsIDE1NF0sXHJcblx0XCJtZWRpdW10dXJxdW9pc2VcIjogWzcyLCAyMDksIDIwNF0sXHJcblx0XCJtZWRpdW12aW9sZXRyZWRcIjogWzE5OSwgMjEsIDEzM10sXHJcblx0XCJtaWRuaWdodGJsdWVcIjogWzI1LCAyNSwgMTEyXSxcclxuXHRcIm1pbnRjcmVhbVwiOiBbMjQ1LCAyNTUsIDI1MF0sXHJcblx0XCJtaXN0eXJvc2VcIjogWzI1NSwgMjI4LCAyMjVdLFxyXG5cdFwibW9jY2FzaW5cIjogWzI1NSwgMjI4LCAxODFdLFxyXG5cdFwibmF2YWpvd2hpdGVcIjogWzI1NSwgMjIyLCAxNzNdLFxyXG5cdFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcclxuXHRcIm9sZGxhY2VcIjogWzI1MywgMjQ1LCAyMzBdLFxyXG5cdFwib2xpdmVcIjogWzEyOCwgMTI4LCAwXSxcclxuXHRcIm9saXZlZHJhYlwiOiBbMTA3LCAxNDIsIDM1XSxcclxuXHRcIm9yYW5nZVwiOiBbMjU1LCAxNjUsIDBdLFxyXG5cdFwib3JhbmdlcmVkXCI6IFsyNTUsIDY5LCAwXSxcclxuXHRcIm9yY2hpZFwiOiBbMjE4LCAxMTIsIDIxNF0sXHJcblx0XCJwYWxlZ29sZGVucm9kXCI6IFsyMzgsIDIzMiwgMTcwXSxcclxuXHRcInBhbGVncmVlblwiOiBbMTUyLCAyNTEsIDE1Ml0sXHJcblx0XCJwYWxldHVycXVvaXNlXCI6IFsxNzUsIDIzOCwgMjM4XSxcclxuXHRcInBhbGV2aW9sZXRyZWRcIjogWzIxOSwgMTEyLCAxNDddLFxyXG5cdFwicGFwYXlhd2hpcFwiOiBbMjU1LCAyMzksIDIxM10sXHJcblx0XCJwZWFjaHB1ZmZcIjogWzI1NSwgMjE4LCAxODVdLFxyXG5cdFwicGVydVwiOiBbMjA1LCAxMzMsIDYzXSxcclxuXHRcInBpbmtcIjogWzI1NSwgMTkyLCAyMDNdLFxyXG5cdFwicGx1bVwiOiBbMjIxLCAxNjAsIDIyMV0sXHJcblx0XCJwb3dkZXJibHVlXCI6IFsxNzYsIDIyNCwgMjMwXSxcclxuXHRcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxyXG5cdFwicmViZWNjYXB1cnBsZVwiOiBbMTAyLCA1MSwgMTUzXSxcclxuXHRcInJlZFwiOiBbMjU1LCAwLCAwXSxcclxuXHRcInJvc3licm93blwiOiBbMTg4LCAxNDMsIDE0M10sXHJcblx0XCJyb3lhbGJsdWVcIjogWzY1LCAxMDUsIDIyNV0sXHJcblx0XCJzYWRkbGVicm93blwiOiBbMTM5LCA2OSwgMTldLFxyXG5cdFwic2FsbW9uXCI6IFsyNTAsIDEyOCwgMTE0XSxcclxuXHRcInNhbmR5YnJvd25cIjogWzI0NCwgMTY0LCA5Nl0sXHJcblx0XCJzZWFncmVlblwiOiBbNDYsIDEzOSwgODddLFxyXG5cdFwic2Vhc2hlbGxcIjogWzI1NSwgMjQ1LCAyMzhdLFxyXG5cdFwic2llbm5hXCI6IFsxNjAsIDgyLCA0NV0sXHJcblx0XCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxyXG5cdFwic2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDIzNV0sXHJcblx0XCJzbGF0ZWJsdWVcIjogWzEwNiwgOTAsIDIwNV0sXHJcblx0XCJzbGF0ZWdyYXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic2xhdGVncmV5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNub3dcIjogWzI1NSwgMjUwLCAyNTBdLFxyXG5cdFwic3ByaW5nZ3JlZW5cIjogWzAsIDI1NSwgMTI3XSxcclxuXHRcInN0ZWVsYmx1ZVwiOiBbNzAsIDEzMCwgMTgwXSxcclxuXHRcInRhblwiOiBbMjEwLCAxODAsIDE0MF0sXHJcblx0XCJ0ZWFsXCI6IFswLCAxMjgsIDEyOF0sXHJcblx0XCJ0aGlzdGxlXCI6IFsyMTYsIDE5MSwgMjE2XSxcclxuXHRcInRvbWF0b1wiOiBbMjU1LCA5OSwgNzFdLFxyXG5cdFwidHVycXVvaXNlXCI6IFs2NCwgMjI0LCAyMDhdLFxyXG5cdFwidmlvbGV0XCI6IFsyMzgsIDEzMCwgMjM4XSxcclxuXHRcIndoZWF0XCI6IFsyNDUsIDIyMiwgMTc5XSxcclxuXHRcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcclxuXHRcIndoaXRlc21va2VcIjogWzI0NSwgMjQ1LCAyNDVdLFxyXG5cdFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF0sXHJcblx0XCJ5ZWxsb3dncmVlblwiOiBbMTU0LCAyMDUsIDUwXVxyXG59OyIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY29sb3JOYW1lcyA9IHJlcXVpcmUoJ2NvbG9yLW5hbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICBnZXRSZ2JhOiBnZXRSZ2JhLFxuICAgZ2V0SHNsYTogZ2V0SHNsYSxcbiAgIGdldFJnYjogZ2V0UmdiLFxuICAgZ2V0SHNsOiBnZXRIc2wsXG4gICBnZXRId2I6IGdldEh3YixcbiAgIGdldEFscGhhOiBnZXRBbHBoYSxcblxuICAgaGV4U3RyaW5nOiBoZXhTdHJpbmcsXG4gICByZ2JTdHJpbmc6IHJnYlN0cmluZyxcbiAgIHJnYmFTdHJpbmc6IHJnYmFTdHJpbmcsXG4gICBwZXJjZW50U3RyaW5nOiBwZXJjZW50U3RyaW5nLFxuICAgcGVyY2VudGFTdHJpbmc6IHBlcmNlbnRhU3RyaW5nLFxuICAgaHNsU3RyaW5nOiBoc2xTdHJpbmcsXG4gICBoc2xhU3RyaW5nOiBoc2xhU3RyaW5nLFxuICAgaHdiU3RyaW5nOiBod2JTdHJpbmcsXG4gICBrZXl3b3JkOiBrZXl3b3JkXG59XG5cbmZ1bmN0aW9uIGdldFJnYmEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGFiYnIgPSAgL14jKFthLWZBLUYwLTldezN9KSQvLFxuICAgICAgIGhleCA9ICAvXiMoW2EtZkEtRjAtOV17Nn0pJC8sXG4gICAgICAgcmdiYSA9IC9ecmdiYT9cXChcXHMqKFsrLV0/XFxkKylcXHMqLFxccyooWystXT9cXGQrKVxccyosXFxzKihbKy1dP1xcZCspXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKSQvLFxuICAgICAgIHBlciA9IC9ecmdiYT9cXChcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKSQvLFxuICAgICAgIGtleXdvcmQgPSAvKFxcRCspLztcblxuICAgdmFyIHJnYiA9IFswLCAwLCAwXSxcbiAgICAgICBhID0gMSxcbiAgICAgICBtYXRjaCA9IHN0cmluZy5tYXRjaChhYmJyKTtcbiAgIGlmIChtYXRjaCkge1xuICAgICAgbWF0Y2ggPSBtYXRjaFsxXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpXSArIG1hdGNoW2ldLCAxNik7XG4gICAgICB9XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChoZXgpKSB7XG4gICAgICBtYXRjaCA9IG1hdGNoWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoLnNsaWNlKGkgKiAyLCBpICogMiArIDIpLCAxNik7XG4gICAgICB9XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChyZ2JhKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2kgKyAxXSk7XG4gICAgICB9XG4gICAgICBhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChwZXIpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KG1hdGNoW2kgKyAxXSkgKiAyLjU1KTtcbiAgICAgIH1cbiAgICAgIGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGtleXdvcmQpKSB7XG4gICAgICBpZiAobWF0Y2hbMV0gPT0gXCJ0cmFuc3BhcmVudFwiKSB7XG4gICAgICAgICByZXR1cm4gWzAsIDAsIDAsIDBdO1xuICAgICAgfVxuICAgICAgcmdiID0gY29sb3JOYW1lc1ttYXRjaFsxXV07XG4gICAgICBpZiAoIXJnYikge1xuICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgfVxuXG4gICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgcmdiW2ldID0gc2NhbGUocmdiW2ldLCAwLCAyNTUpO1xuICAgfVxuICAgaWYgKCFhICYmIGEgIT0gMCkge1xuICAgICAgYSA9IDE7XG4gICB9XG4gICBlbHNlIHtcbiAgICAgIGEgPSBzY2FsZShhLCAwLCAxKTtcbiAgIH1cbiAgIHJnYlszXSA9IGE7XG4gICByZXR1cm4gcmdiO1xufVxuXG5mdW5jdGlvbiBnZXRIc2xhKHN0cmluZykge1xuICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cbiAgIHZhciBoc2wgPSAvXmhzbGE/XFwoXFxzKihbKy1dP1xcZCspKD86ZGVnKT9cXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKS87XG4gICB2YXIgbWF0Y2ggPSBzdHJpbmcubWF0Y2goaHNsKTtcbiAgIGlmIChtYXRjaCkge1xuICAgICAgdmFyIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICAgICB2YXIgaCA9IHNjYWxlKHBhcnNlSW50KG1hdGNoWzFdKSwgMCwgMzYwKSxcbiAgICAgICAgICBzID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCksXG4gICAgICAgICAgbCA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbM10pLCAwLCAxMDApLFxuICAgICAgICAgIGEgPSBzY2FsZShpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuICAgICAgcmV0dXJuIFtoLCBzLCBsLCBhXTtcbiAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0SHdiKHN0cmluZykge1xuICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cbiAgIHZhciBod2IgPSAvXmh3YlxcKFxccyooWystXT9cXGQrKSg/OmRlZyk/XFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkvO1xuICAgdmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGh3Yik7XG4gICBpZiAobWF0Y2gpIHtcbiAgICB2YXIgYWxwaGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgICAgIHZhciBoID0gc2NhbGUocGFyc2VJbnQobWF0Y2hbMV0pLCAwLCAzNjApLFxuICAgICAgICAgIHcgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKSxcbiAgICAgICAgICBiID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCksXG4gICAgICAgICAgYSA9IHNjYWxlKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XG4gICAgICByZXR1cm4gW2gsIHcsIGIsIGFdO1xuICAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZ2Ioc3RyaW5nKSB7XG4gICB2YXIgcmdiYSA9IGdldFJnYmEoc3RyaW5nKTtcbiAgIHJldHVybiByZ2JhICYmIHJnYmEuc2xpY2UoMCwgMyk7XG59XG5cbmZ1bmN0aW9uIGdldEhzbChzdHJpbmcpIHtcbiAgdmFyIGhzbGEgPSBnZXRIc2xhKHN0cmluZyk7XG4gIHJldHVybiBoc2xhICYmIGhzbGEuc2xpY2UoMCwgMyk7XG59XG5cbmZ1bmN0aW9uIGdldEFscGhhKHN0cmluZykge1xuICAgdmFyIHZhbHMgPSBnZXRSZ2JhKHN0cmluZyk7XG4gICBpZiAodmFscykge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG4gICBlbHNlIGlmICh2YWxzID0gZ2V0SHNsYShzdHJpbmcpKSB7XG4gICAgICByZXR1cm4gdmFsc1szXTtcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHMgPSBnZXRId2Ioc3RyaW5nKSkge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG59XG5cbi8vIGdlbmVyYXRvcnNcbmZ1bmN0aW9uIGhleFN0cmluZyhyZ2IpIHtcbiAgIHJldHVybiBcIiNcIiArIGhleERvdWJsZShyZ2JbMF0pICsgaGV4RG91YmxlKHJnYlsxXSlcbiAgICAgICAgICAgICAgKyBoZXhEb3VibGUocmdiWzJdKTtcbn1cblxuZnVuY3Rpb24gcmdiU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPCAxIHx8IChyZ2JhWzNdICYmIHJnYmFbM10gPCAxKSkge1xuICAgICAgcmV0dXJuIHJnYmFTdHJpbmcocmdiYSwgYWxwaGEpO1xuICAgfVxuICAgcmV0dXJuIFwicmdiKFwiICsgcmdiYVswXSArIFwiLCBcIiArIHJnYmFbMV0gKyBcIiwgXCIgKyByZ2JhWzJdICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIHJnYmFTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbHBoYSA9IChyZ2JhWzNdICE9PSB1bmRlZmluZWQgPyByZ2JhWzNdIDogMSk7XG4gICB9XG4gICByZXR1cm4gXCJyZ2JhKFwiICsgcmdiYVswXSArIFwiLCBcIiArIHJnYmFbMV0gKyBcIiwgXCIgKyByZ2JhWzJdXG4gICAgICAgICAgICsgXCIsIFwiICsgYWxwaGEgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gcGVyY2VudFN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAocmdiYVszXSAmJiByZ2JhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiBwZXJjZW50YVN0cmluZyhyZ2JhLCBhbHBoYSk7XG4gICB9XG4gICB2YXIgciA9IE1hdGgucm91bmQocmdiYVswXS8yNTUgKiAxMDApLFxuICAgICAgIGcgPSBNYXRoLnJvdW5kKHJnYmFbMV0vMjU1ICogMTAwKSxcbiAgICAgICBiID0gTWF0aC5yb3VuZChyZ2JhWzJdLzI1NSAqIDEwMCk7XG5cbiAgIHJldHVybiBcInJnYihcIiArIHIgKyBcIiUsIFwiICsgZyArIFwiJSwgXCIgKyBiICsgXCIlKVwiO1xufVxuXG5mdW5jdGlvbiBwZXJjZW50YVN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgdmFyIHIgPSBNYXRoLnJvdW5kKHJnYmFbMF0vMjU1ICogMTAwKSxcbiAgICAgICBnID0gTWF0aC5yb3VuZChyZ2JhWzFdLzI1NSAqIDEwMCksXG4gICAgICAgYiA9IE1hdGgucm91bmQocmdiYVsyXS8yNTUgKiAxMDApO1xuICAgcmV0dXJuIFwicmdiYShcIiArIHIgKyBcIiUsIFwiICsgZyArIFwiJSwgXCIgKyBiICsgXCIlLCBcIiArIChhbHBoYSB8fCByZ2JhWzNdIHx8IDEpICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIGhzbFN0cmluZyhoc2xhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAoaHNsYVszXSAmJiBoc2xhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiBoc2xhU3RyaW5nKGhzbGEsIGFscGhhKTtcbiAgIH1cbiAgIHJldHVybiBcImhzbChcIiArIGhzbGFbMF0gKyBcIiwgXCIgKyBoc2xhWzFdICsgXCIlLCBcIiArIGhzbGFbMl0gKyBcIiUpXCI7XG59XG5cbmZ1bmN0aW9uIGhzbGFTdHJpbmcoaHNsYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbHBoYSA9IChoc2xhWzNdICE9PSB1bmRlZmluZWQgPyBoc2xhWzNdIDogMSk7XG4gICB9XG4gICByZXR1cm4gXCJoc2xhKFwiICsgaHNsYVswXSArIFwiLCBcIiArIGhzbGFbMV0gKyBcIiUsIFwiICsgaHNsYVsyXSArIFwiJSwgXCJcbiAgICAgICAgICAgKyBhbHBoYSArIFwiKVwiO1xufVxuXG4vLyBod2IgaXMgYSBiaXQgZGlmZmVyZW50IHRoYW4gcmdiKGEpICYgaHNsKGEpIHNpbmNlIHRoZXJlIGlzIG5vIGFscGhhIHNwZWNpZmljIHN5bnRheFxuLy8gKGh3YiBoYXZlIGFscGhhIG9wdGlvbmFsICYgMSBpcyBkZWZhdWx0IHZhbHVlKVxuZnVuY3Rpb24gaHdiU3RyaW5nKGh3YiwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbHBoYSA9IChod2JbM10gIT09IHVuZGVmaW5lZCA/IGh3YlszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHdiKFwiICsgaHdiWzBdICsgXCIsIFwiICsgaHdiWzFdICsgXCIlLCBcIiArIGh3YlsyXSArIFwiJVwiXG4gICAgICAgICAgICsgKGFscGhhICE9PSB1bmRlZmluZWQgJiYgYWxwaGEgIT09IDEgPyBcIiwgXCIgKyBhbHBoYSA6IFwiXCIpICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQocmdiKSB7XG4gIHJldHVybiByZXZlcnNlTmFtZXNbcmdiLnNsaWNlKDAsIDMpXTtcbn1cblxuLy8gaGVscGVyc1xuZnVuY3Rpb24gc2NhbGUobnVtLCBtaW4sIG1heCkge1xuICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KG1pbiwgbnVtKSwgbWF4KTtcbn1cblxuZnVuY3Rpb24gaGV4RG91YmxlKG51bSkge1xuICB2YXIgc3RyID0gbnVtLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gKHN0ci5sZW5ndGggPCAyKSA/IFwiMFwiICsgc3RyIDogc3RyO1xufVxuXG5cbi8vY3JlYXRlIGEgbGlzdCBvZiByZXZlcnNlIGNvbG9yIG5hbWVzXG52YXIgcmV2ZXJzZU5hbWVzID0ge307XG5mb3IgKHZhciBuYW1lIGluIGNvbG9yTmFtZXMpIHtcbiAgIHJldmVyc2VOYW1lc1tjb2xvck5hbWVzW25hbWVdXSA9IG5hbWU7XG59XG4iLCIvKiBNSVQgbGljZW5zZSAqL1xudmFyIGNvbnZlcnQgPSByZXF1aXJlKCdjb2xvci1jb252ZXJ0Jyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnY29sb3Itc3RyaW5nJyk7XG5cbnZhciBDb2xvciA9IGZ1bmN0aW9uIChvYmopIHtcblx0aWYgKG9iaiBpbnN0YW5jZW9mIENvbG9yKSB7XG5cdFx0cmV0dXJuIG9iajtcblx0fVxuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29sb3IpKSB7XG5cdFx0cmV0dXJuIG5ldyBDb2xvcihvYmopO1xuXHR9XG5cblx0dGhpcy52YWx1ZXMgPSB7XG5cdFx0cmdiOiBbMCwgMCwgMF0sXG5cdFx0aHNsOiBbMCwgMCwgMF0sXG5cdFx0aHN2OiBbMCwgMCwgMF0sXG5cdFx0aHdiOiBbMCwgMCwgMF0sXG5cdFx0Y215azogWzAsIDAsIDAsIDBdLFxuXHRcdGFscGhhOiAxXG5cdH07XG5cblx0Ly8gcGFyc2UgQ29sb3IoKSBhcmd1bWVudFxuXHR2YXIgdmFscztcblx0aWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG5cdFx0dmFscyA9IHN0cmluZy5nZXRSZ2JhKG9iaik7XG5cdFx0aWYgKHZhbHMpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdyZ2InLCB2YWxzKTtcblx0XHR9IGVsc2UgaWYgKHZhbHMgPSBzdHJpbmcuZ2V0SHNsYShvYmopKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygnaHNsJywgdmFscyk7XG5cdFx0fSBlbHNlIGlmICh2YWxzID0gc3RyaW5nLmdldEh3YihvYmopKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygnaHdiJywgdmFscyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHBhcnNlIGNvbG9yIGZyb20gc3RyaW5nIFwiJyArIG9iaiArICdcIicpO1xuXHRcdH1cblx0fSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuXHRcdHZhbHMgPSBvYmo7XG5cdFx0aWYgKHZhbHMuciAhPT0gdW5kZWZpbmVkIHx8IHZhbHMucmVkICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdyZ2InLCB2YWxzKTtcblx0XHR9IGVsc2UgaWYgKHZhbHMubCAhPT0gdW5kZWZpbmVkIHx8IHZhbHMubGlnaHRuZXNzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdoc2wnLCB2YWxzKTtcblx0XHR9IGVsc2UgaWYgKHZhbHMudiAhPT0gdW5kZWZpbmVkIHx8IHZhbHMudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzdicsIHZhbHMpO1xuXHRcdH0gZWxzZSBpZiAodmFscy53ICE9PSB1bmRlZmluZWQgfHwgdmFscy53aGl0ZW5lc3MgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ2h3YicsIHZhbHMpO1xuXHRcdH0gZWxzZSBpZiAodmFscy5jICE9PSB1bmRlZmluZWQgfHwgdmFscy5jeWFuICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdjbXlrJywgdmFscyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHBhcnNlIGNvbG9yIGZyb20gb2JqZWN0ICcgKyBKU09OLnN0cmluZ2lmeShvYmopKTtcblx0XHR9XG5cdH1cbn07XG5cbkNvbG9yLnByb3RvdHlwZSA9IHtcblx0cmdiOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0U3BhY2UoJ3JnYicsIGFyZ3VtZW50cyk7XG5cdH0sXG5cdGhzbDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnNldFNwYWNlKCdoc2wnLCBhcmd1bWVudHMpO1xuXHR9LFxuXHRoc3Y6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRTcGFjZSgnaHN2JywgYXJndW1lbnRzKTtcblx0fSxcblx0aHdiOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0U3BhY2UoJ2h3YicsIGFyZ3VtZW50cyk7XG5cdH0sXG5cdGNteWs6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRTcGFjZSgnY215aycsIGFyZ3VtZW50cyk7XG5cdH0sXG5cblx0cmdiQXJyYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZXMucmdiO1xuXHR9LFxuXHRoc2xBcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbHVlcy5oc2w7XG5cdH0sXG5cdGhzdkFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWVzLmhzdjtcblx0fSxcblx0aHdiQXJyYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy52YWx1ZXMuYWxwaGEgIT09IDEpIHtcblx0XHRcdHJldHVybiB0aGlzLnZhbHVlcy5od2IuY29uY2F0KFt0aGlzLnZhbHVlcy5hbHBoYV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy52YWx1ZXMuaHdiO1xuXHR9LFxuXHRjbXlrQXJyYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZXMuY215aztcblx0fSxcblx0cmdiYUFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYjtcblx0XHRyZXR1cm4gcmdiLmNvbmNhdChbdGhpcy52YWx1ZXMuYWxwaGFdKTtcblx0fSxcblx0aHNsYUFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGhzbCA9IHRoaXMudmFsdWVzLmhzbDtcblx0XHRyZXR1cm4gaHNsLmNvbmNhdChbdGhpcy52YWx1ZXMuYWxwaGFdKTtcblx0fSxcblx0YWxwaGE6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiB0aGlzLnZhbHVlcy5hbHBoYTtcblx0XHR9XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2FscGhhJywgdmFsKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZWQ6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdyZ2InLCAwLCB2YWwpO1xuXHR9LFxuXHRncmVlbjogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ3JnYicsIDEsIHZhbCk7XG5cdH0sXG5cdGJsdWU6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdyZ2InLCAyLCB2YWwpO1xuXHR9LFxuXHRodWU6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRpZiAodmFsKSB7XG5cdFx0XHR2YWwgJT0gMzYwO1xuXHRcdFx0dmFsID0gdmFsIDwgMCA/IDM2MCArIHZhbCA6IHZhbDtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnaHNsJywgMCwgdmFsKTtcblx0fSxcblx0c2F0dXJhdGlvbjogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2hzbCcsIDEsIHZhbCk7XG5cdH0sXG5cdGxpZ2h0bmVzczogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2hzbCcsIDIsIHZhbCk7XG5cdH0sXG5cdHNhdHVyYXRpb252OiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnaHN2JywgMSwgdmFsKTtcblx0fSxcblx0d2hpdGVuZXNzOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnaHdiJywgMSwgdmFsKTtcblx0fSxcblx0YmxhY2tuZXNzOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnaHdiJywgMiwgdmFsKTtcblx0fSxcblx0dmFsdWU6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdoc3YnLCAyLCB2YWwpO1xuXHR9LFxuXHRjeWFuOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnY215aycsIDAsIHZhbCk7XG5cdH0sXG5cdG1hZ2VudGE6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdjbXlrJywgMSwgdmFsKTtcblx0fSxcblx0eWVsbG93OiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnY215aycsIDIsIHZhbCk7XG5cdH0sXG5cdGJsYWNrOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnY215aycsIDMsIHZhbCk7XG5cdH0sXG5cblx0aGV4U3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5oZXhTdHJpbmcodGhpcy52YWx1ZXMucmdiKTtcblx0fSxcblx0cmdiU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5yZ2JTdHJpbmcodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG5cdH0sXG5cdHJnYmFTdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLnJnYmFTdHJpbmcodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG5cdH0sXG5cdHBlcmNlbnRTdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLnBlcmNlbnRTdHJpbmcodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG5cdH0sXG5cdGhzbFN0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcuaHNsU3RyaW5nKHRoaXMudmFsdWVzLmhzbCwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuXHR9LFxuXHRoc2xhU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5oc2xhU3RyaW5nKHRoaXMudmFsdWVzLmhzbCwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuXHR9LFxuXHRod2JTdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLmh3YlN0cmluZyh0aGlzLnZhbHVlcy5od2IsIHRoaXMudmFsdWVzLmFscGhhKTtcblx0fSxcblx0a2V5d29yZDogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcua2V5d29yZCh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcblx0fSxcblxuXHRyZ2JOdW1iZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKHRoaXMudmFsdWVzLnJnYlswXSA8PCAxNikgfCAodGhpcy52YWx1ZXMucmdiWzFdIDw8IDgpIHwgdGhpcy52YWx1ZXMucmdiWzJdO1xuXHR9LFxuXG5cdGx1bWlub3NpdHk6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9XQ0FHMjAvI3JlbGF0aXZlbHVtaW5hbmNlZGVmXG5cdFx0dmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYjtcblx0XHR2YXIgbHVtID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBjaGFuID0gcmdiW2ldIC8gMjU1O1xuXHRcdFx0bHVtW2ldID0gKGNoYW4gPD0gMC4wMzkyOCkgPyBjaGFuIC8gMTIuOTIgOiBNYXRoLnBvdygoKGNoYW4gKyAwLjA1NSkgLyAxLjA1NSksIDIuNCk7XG5cdFx0fVxuXHRcdHJldHVybiAwLjIxMjYgKiBsdW1bMF0gKyAwLjcxNTIgKiBsdW1bMV0gKyAwLjA3MjIgKiBsdW1bMl07XG5cdH0sXG5cblx0Y29udHJhc3Q6IGZ1bmN0aW9uIChjb2xvcjIpIHtcblx0XHQvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9XQ0FHMjAvI2NvbnRyYXN0LXJhdGlvZGVmXG5cdFx0dmFyIGx1bTEgPSB0aGlzLmx1bWlub3NpdHkoKTtcblx0XHR2YXIgbHVtMiA9IGNvbG9yMi5sdW1pbm9zaXR5KCk7XG5cdFx0aWYgKGx1bTEgPiBsdW0yKSB7XG5cdFx0XHRyZXR1cm4gKGx1bTEgKyAwLjA1KSAvIChsdW0yICsgMC4wNSk7XG5cdFx0fVxuXHRcdHJldHVybiAobHVtMiArIDAuMDUpIC8gKGx1bTEgKyAwLjA1KTtcblx0fSxcblxuXHRsZXZlbDogZnVuY3Rpb24gKGNvbG9yMikge1xuXHRcdHZhciBjb250cmFzdFJhdGlvID0gdGhpcy5jb250cmFzdChjb2xvcjIpO1xuXHRcdGlmIChjb250cmFzdFJhdGlvID49IDcuMSkge1xuXHRcdFx0cmV0dXJuICdBQUEnO1xuXHRcdH1cblxuXHRcdHJldHVybiAoY29udHJhc3RSYXRpbyA+PSA0LjUpID8gJ0FBJyA6ICcnO1xuXHR9LFxuXG5cdGRhcms6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBZSVEgZXF1YXRpb24gZnJvbSBodHRwOi8vMjR3YXlzLm9yZy8yMDEwL2NhbGN1bGF0aW5nLWNvbG9yLWNvbnRyYXN0XG5cdFx0dmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYjtcblx0XHR2YXIgeWlxID0gKHJnYlswXSAqIDI5OSArIHJnYlsxXSAqIDU4NyArIHJnYlsyXSAqIDExNCkgLyAxMDAwO1xuXHRcdHJldHVybiB5aXEgPCAxMjg7XG5cdH0sXG5cblx0bGlnaHQ6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gIXRoaXMuZGFyaygpO1xuXHR9LFxuXG5cdG5lZ2F0ZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZ2IgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdFx0cmdiW2ldID0gMjU1IC0gdGhpcy52YWx1ZXMucmdiW2ldO1xuXHRcdH1cblx0XHR0aGlzLnNldFZhbHVlcygncmdiJywgcmdiKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRsaWdodGVuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnZhbHVlcy5oc2xbMl0gKz0gdGhpcy52YWx1ZXMuaHNsWzJdICogcmF0aW87XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzbCcsIHRoaXMudmFsdWVzLmhzbCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0ZGFya2VuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnZhbHVlcy5oc2xbMl0gLT0gdGhpcy52YWx1ZXMuaHNsWzJdICogcmF0aW87XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzbCcsIHRoaXMudmFsdWVzLmhzbCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0c2F0dXJhdGU6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMudmFsdWVzLmhzbFsxXSArPSB0aGlzLnZhbHVlcy5oc2xbMV0gKiByYXRpbztcblx0XHR0aGlzLnNldFZhbHVlcygnaHNsJywgdGhpcy52YWx1ZXMuaHNsKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRkZXNhdHVyYXRlOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnZhbHVlcy5oc2xbMV0gLT0gdGhpcy52YWx1ZXMuaHNsWzFdICogcmF0aW87XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzbCcsIHRoaXMudmFsdWVzLmhzbCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0d2hpdGVuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnZhbHVlcy5od2JbMV0gKz0gdGhpcy52YWx1ZXMuaHdiWzFdICogcmF0aW87XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2h3YicsIHRoaXMudmFsdWVzLmh3Yik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YmxhY2tlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy52YWx1ZXMuaHdiWzJdICs9IHRoaXMudmFsdWVzLmh3YlsyXSAqIHJhdGlvO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdod2InLCB0aGlzLnZhbHVlcy5od2IpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGdyZXlzY2FsZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2I7XG5cdFx0Ly8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmF5c2NhbGUjQ29udmVydGluZ19jb2xvcl90b19ncmF5c2NhbGVcblx0XHR2YXIgdmFsID0gcmdiWzBdICogMC4zICsgcmdiWzFdICogMC41OSArIHJnYlsyXSAqIDAuMTE7XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ3JnYicsIFt2YWwsIHZhbCwgdmFsXSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Y2xlYXJlcjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2FscGhhJywgdGhpcy52YWx1ZXMuYWxwaGEgLSAodGhpcy52YWx1ZXMuYWxwaGEgKiByYXRpbykpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdG9wYXF1ZXI6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdhbHBoYScsIHRoaXMudmFsdWVzLmFscGhhICsgKHRoaXMudmFsdWVzLmFscGhhICogcmF0aW8pKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyb3RhdGU6IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG5cdFx0dmFyIGh1ZSA9IHRoaXMudmFsdWVzLmhzbFswXTtcblx0XHRodWUgPSAoaHVlICsgZGVncmVlcykgJSAzNjA7XG5cdFx0aHVlID0gaHVlIDwgMCA/IDM2MCArIGh1ZSA6IGh1ZTtcblx0XHR0aGlzLnZhbHVlcy5oc2xbMF0gPSBodWU7XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzbCcsIHRoaXMudmFsdWVzLmhzbCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFBvcnRlZCBmcm9tIHNhc3MgaW1wbGVtZW50YXRpb24gaW4gQ1xuXHQgKiBodHRwczovL2dpdGh1Yi5jb20vc2Fzcy9saWJzYXNzL2Jsb2IvMGU2YjRhMjg1MDA5MjM1NmFhM2VjZTA3YzZiMjQ5ZjAyMjFjYWNlZC9mdW5jdGlvbnMuY3BwI0wyMDlcblx0ICovXG5cdG1peDogZnVuY3Rpb24gKG1peGluQ29sb3IsIHdlaWdodCkge1xuXHRcdHZhciBjb2xvcjEgPSB0aGlzO1xuXHRcdHZhciBjb2xvcjIgPSBtaXhpbkNvbG9yO1xuXHRcdHZhciBwID0gd2VpZ2h0ID09PSB1bmRlZmluZWQgPyAwLjUgOiB3ZWlnaHQ7XG5cblx0XHR2YXIgdyA9IDIgKiBwIC0gMTtcblx0XHR2YXIgYSA9IGNvbG9yMS5hbHBoYSgpIC0gY29sb3IyLmFscGhhKCk7XG5cblx0XHR2YXIgdzEgPSAoKCh3ICogYSA9PT0gLTEpID8gdyA6ICh3ICsgYSkgLyAoMSArIHcgKiBhKSkgKyAxKSAvIDIuMDtcblx0XHR2YXIgdzIgPSAxIC0gdzE7XG5cblx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0LnJnYihcblx0XHRcdFx0dzEgKiBjb2xvcjEucmVkKCkgKyB3MiAqIGNvbG9yMi5yZWQoKSxcblx0XHRcdFx0dzEgKiBjb2xvcjEuZ3JlZW4oKSArIHcyICogY29sb3IyLmdyZWVuKCksXG5cdFx0XHRcdHcxICogY29sb3IxLmJsdWUoKSArIHcyICogY29sb3IyLmJsdWUoKVxuXHRcdFx0KVxuXHRcdFx0LmFscGhhKGNvbG9yMS5hbHBoYSgpICogcCArIGNvbG9yMi5hbHBoYSgpICogKDEgLSBwKSk7XG5cdH0sXG5cblx0dG9KU09OOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmdiKCk7XG5cdH0sXG5cblx0Y2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gbmV3IENvbG9yKHRoaXMucmdiKCkpO1xuXHR9XG59O1xuXG5Db2xvci5wcm90b3R5cGUuZ2V0VmFsdWVzID0gZnVuY3Rpb24gKHNwYWNlKSB7XG5cdHZhciB2YWxzID0ge307XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuXHRcdHZhbHNbc3BhY2UuY2hhckF0KGkpXSA9IHRoaXMudmFsdWVzW3NwYWNlXVtpXTtcblx0fVxuXG5cdGlmICh0aGlzLnZhbHVlcy5hbHBoYSAhPT0gMSkge1xuXHRcdHZhbHMuYSA9IHRoaXMudmFsdWVzLmFscGhhO1xuXHR9XG5cblx0Ly8ge3I6IDI1NSwgZzogMjU1LCBiOiAyNTUsIGE6IDAuNH1cblx0cmV0dXJuIHZhbHM7XG59O1xuXG5Db2xvci5wcm90b3R5cGUuc2V0VmFsdWVzID0gZnVuY3Rpb24gKHNwYWNlLCB2YWxzKSB7XG5cdHZhciBzcGFjZXMgPSB7XG5cdFx0cmdiOiBbJ3JlZCcsICdncmVlbicsICdibHVlJ10sXG5cdFx0aHNsOiBbJ2h1ZScsICdzYXR1cmF0aW9uJywgJ2xpZ2h0bmVzcyddLFxuXHRcdGhzdjogWydodWUnLCAnc2F0dXJhdGlvbicsICd2YWx1ZSddLFxuXHRcdGh3YjogWydodWUnLCAnd2hpdGVuZXNzJywgJ2JsYWNrbmVzcyddLFxuXHRcdGNteWs6IFsnY3lhbicsICdtYWdlbnRhJywgJ3llbGxvdycsICdibGFjayddXG5cdH07XG5cblx0dmFyIG1heGVzID0ge1xuXHRcdHJnYjogWzI1NSwgMjU1LCAyNTVdLFxuXHRcdGhzbDogWzM2MCwgMTAwLCAxMDBdLFxuXHRcdGhzdjogWzM2MCwgMTAwLCAxMDBdLFxuXHRcdGh3YjogWzM2MCwgMTAwLCAxMDBdLFxuXHRcdGNteWs6IFsxMDAsIDEwMCwgMTAwLCAxMDBdXG5cdH07XG5cblx0dmFyIGk7XG5cdHZhciBhbHBoYSA9IDE7XG5cdGlmIChzcGFjZSA9PT0gJ2FscGhhJykge1xuXHRcdGFscGhhID0gdmFscztcblx0fSBlbHNlIGlmICh2YWxzLmxlbmd0aCkge1xuXHRcdC8vIFsxMCwgMTAsIDEwXVxuXHRcdHRoaXMudmFsdWVzW3NwYWNlXSA9IHZhbHMuc2xpY2UoMCwgc3BhY2UubGVuZ3RoKTtcblx0XHRhbHBoYSA9IHZhbHNbc3BhY2UubGVuZ3RoXTtcblx0fSBlbHNlIGlmICh2YWxzW3NwYWNlLmNoYXJBdCgwKV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIHtyOiAxMCwgZzogMTAsIGI6IDEwfVxuXHRcdGZvciAoaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy52YWx1ZXNbc3BhY2VdW2ldID0gdmFsc1tzcGFjZS5jaGFyQXQoaSldO1xuXHRcdH1cblxuXHRcdGFscGhhID0gdmFscy5hO1xuXHR9IGVsc2UgaWYgKHZhbHNbc3BhY2VzW3NwYWNlXVswXV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIHtyZWQ6IDEwLCBncmVlbjogMTAsIGJsdWU6IDEwfVxuXHRcdHZhciBjaGFucyA9IHNwYWNlc1tzcGFjZV07XG5cblx0XHRmb3IgKGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMudmFsdWVzW3NwYWNlXVtpXSA9IHZhbHNbY2hhbnNbaV1dO1xuXHRcdH1cblxuXHRcdGFscGhhID0gdmFscy5hbHBoYTtcblx0fVxuXG5cdHRoaXMudmFsdWVzLmFscGhhID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgKGFscGhhID09PSB1bmRlZmluZWQgPyB0aGlzLnZhbHVlcy5hbHBoYSA6IGFscGhhKSkpO1xuXG5cdGlmIChzcGFjZSA9PT0gJ2FscGhhJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBjYXBwZWQ7XG5cblx0Ly8gY2FwIHZhbHVlcyBvZiB0aGUgc3BhY2UgcHJpb3IgY29udmVydGluZyBhbGwgdmFsdWVzXG5cdGZvciAoaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuXHRcdGNhcHBlZCA9IE1hdGgubWF4KDAsIE1hdGgubWluKG1heGVzW3NwYWNlXVtpXSwgdGhpcy52YWx1ZXNbc3BhY2VdW2ldKSk7XG5cdFx0dGhpcy52YWx1ZXNbc3BhY2VdW2ldID0gTWF0aC5yb3VuZChjYXBwZWQpO1xuXHR9XG5cblx0Ly8gY29udmVydCB0byBhbGwgdGhlIG90aGVyIGNvbG9yIHNwYWNlc1xuXHRmb3IgKHZhciBzbmFtZSBpbiBzcGFjZXMpIHtcblx0XHRpZiAoc25hbWUgIT09IHNwYWNlKSB7XG5cdFx0XHR0aGlzLnZhbHVlc1tzbmFtZV0gPSBjb252ZXJ0W3NwYWNlXVtzbmFtZV0odGhpcy52YWx1ZXNbc3BhY2VdKTtcblx0XHR9XG5cblx0XHQvLyBjYXAgdmFsdWVzXG5cdFx0Zm9yIChpID0gMDsgaSA8IHNuYW1lLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjYXBwZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhlc1tzbmFtZV1baV0sIHRoaXMudmFsdWVzW3NuYW1lXVtpXSkpO1xuXHRcdFx0dGhpcy52YWx1ZXNbc25hbWVdW2ldID0gTWF0aC5yb3VuZChjYXBwZWQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcblxuQ29sb3IucHJvdG90eXBlLnNldFNwYWNlID0gZnVuY3Rpb24gKHNwYWNlLCBhcmdzKSB7XG5cdHZhciB2YWxzID0gYXJnc1swXTtcblxuXHRpZiAodmFscyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gY29sb3IucmdiKClcblx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZXMoc3BhY2UpO1xuXHR9XG5cblx0Ly8gY29sb3IucmdiKDEwLCAxMCwgMTApXG5cdGlmICh0eXBlb2YgdmFscyA9PT0gJ251bWJlcicpIHtcblx0XHR2YWxzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG5cdH1cblxuXHR0aGlzLnNldFZhbHVlcyhzcGFjZSwgdmFscyk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuQ29sb3IucHJvdG90eXBlLnNldENoYW5uZWwgPSBmdW5jdGlvbiAoc3BhY2UsIGluZGV4LCB2YWwpIHtcblx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gY29sb3IucmVkKClcblx0XHRyZXR1cm4gdGhpcy52YWx1ZXNbc3BhY2VdW2luZGV4XTtcblx0fSBlbHNlIGlmICh2YWwgPT09IHRoaXMudmFsdWVzW3NwYWNlXVtpbmRleF0pIHtcblx0XHQvLyBjb2xvci5yZWQoY29sb3IucmVkKCkpXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvLyBjb2xvci5yZWQoMTAwKVxuXHR0aGlzLnZhbHVlc1tzcGFjZV1baW5kZXhdID0gdmFsO1xuXHR0aGlzLnNldFZhbHVlcyhzcGFjZSwgdGhpcy52YWx1ZXNbc3BhY2VdKTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3I7XG4iLCIvKipcbiAqIERlcHRoIHNwYWNlIGNvb3JkaW5hdGVzXG4gKiBAc2VlIGh0dHBzOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvZG43ODU1MzAuYXNweFxuICovXG4ndXNlIHN0cmljdCdcblxuZXhwb3J0cy5CT1VORF9XSURUSCA9IDUxMlxuZXhwb3J0cy5CT1VORF9IRUlHSFQgPSA0MjRcblxuIiwiLyoqXG4gKiBLaW5uZWN0IGhhbmQgc3RhdHVzXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLlVOS05PV04gPSAwXG5leHBvcnRzLk5PVF9UUkFDS0VEID0gMVxuZXhwb3J0cy5PUEVOID0gMlxuZXhwb3J0cy5DTE9TRUQgPSAzXG5leHBvcnRzLkxBU1NPID0gNFxuIiwiLyoqXG4gKiBDb25zdGFucyBvZiBraW5lY3RcbiAqIEBtb2R1bGUgc2cta2luZWN0LWNvbnN0YW50c1xuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IGRlcHRoU3BhY2UgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2RlcHRoX3NwYWNlJykpIH0sXG4gIGdldCBoYW5kU3RhdGUgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2hhbmRfc3RhdGUnKSkgfSxcbiAgZ2V0IGpvaW50VHlwZXMgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2pvaW50X3R5cGVzJykpIH1cbn1cbiIsIi8qKlxuICogSm9pbnQgdHlwZXMgb2Yga2lubmVjdDJcbiAqIEBzZWUgaHR0cHM6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9taWNyb3NvZnQua2luZWN0LmpvaW50dHlwZS5hc3B4XG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLlNQSU5FX0JBU0UgPSAwXG5leHBvcnRzLlNQSU5FX01JRCA9IDFcbmV4cG9ydHMuTkVDSyA9IDJcbmV4cG9ydHMuSEVBRCA9IDNcbmV4cG9ydHMuU0hPVUxERVJfTEVGVCA9IDRcbmV4cG9ydHMuRUxCT1dfTEVGVCA9IDVcbmV4cG9ydHMuV1JJU1RfTEVGVCA9IDZcbmV4cG9ydHMuSEFORF9MRUZUID0gN1xuZXhwb3J0cy5TSE9VTERFUl9SSUdIVCA9IDhcbmV4cG9ydHMuRUxCT1dfUklHSFQgPSA5XG5leHBvcnRzLldSSVNUX1JJR0hUID0gMTBcbmV4cG9ydHMuSEFORF9SSUdIVCA9IDExXG5leHBvcnRzLkhJUF9MRUZUID0gMTJcbmV4cG9ydHMuS05FRV9MRUZUID0gMTNcbmV4cG9ydHMuQU5LTEVfTEVGVCA9IDE0XG5leHBvcnRzLkZPT1RfTEVGVCA9IDE1XG5leHBvcnRzLkhJUF9SSUdIVCA9IDE2XG5leHBvcnRzLktORUVfUklHSFQgPSAxN1xuZXhwb3J0cy5BTktMRV9SSUdIVCA9IDE4XG5leHBvcnRzLkZPT1RfUklHSFQgPSAxOVxuZXhwb3J0cy5TUElORV9TSE9VTERFUiA9IDIwXG5leHBvcnRzLkhBTkRfVElQX0xFRlQgPSAyMVxuZXhwb3J0cy5USFVNQl9MRUZUID0gMjJcbmV4cG9ydHMuSEFORF9USVBfUklHSFQgPSAyM1xuZXhwb3J0cy5USFVNQl9SSUdIVCA9IDI0XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKGV4cG9ydHMsIHtcbiAgTUlDUk9QSE9ORV9UUkFOU0lUSU9OOiA4MDBcbn0pXG4iLCIvKipcbiAqIEhlbHBlciBmdW5jdGlvbiBmb3IgY29sb3JzXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBhcGVtYW5jb2xvciA9IHJlcXVpcmUoJ2FwZW1hbmNvbG9yJylcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKGV4cG9ydHMsIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIHJhbmRvbSBjb2xvciBmcm9tIGJhc2UgY29sb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlIC0gQmFzZSBjb2xvciBzdHJpbmdcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPcHRpb25hbCBzZXR0aW5nc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIEdlbmVyYXRlZCBjb2xvclxuICAgKi9cbiAgcmFuZG9tQ29sb3IgKGJhc2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBhbW91bnQgPSBwYXJzZUludChNYXRoLnJhbmRvbSgpICogMzYwLjApXG4gICAgcmV0dXJuIGFwZW1hbmNvbG9yLnJvdGF0ZShiYXNlLCBhbW91bnQpXG4gIH0sXG5cbiAgLyoqXG4gICAqIERlZmluZSBhIGNvbG9yaXplciB0byBnZW5lcmF0ZSB1bmlxdWUgY29sb3JzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlIC0gQmFzZSBjb2xvciBzdHJpbmdcbiAgICogQHJldHVybnMge2Z1bmN0aW9ufSAtIEdlbmVyYXRlZCBmdW5jdGlvblxuICAgKi9cbiAgdW5pcXVlQ29sb3JpemVyIChiYXNlKSB7XG4gICAgbGV0IGNvbG9ycyA9IHt9XG5cbiAgICAvKipcbiAgICAgKiBDb2xvcml6ZXIgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBVbmlxdWUgaWRlbnRpZmllclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbG9yIC0gQ29sb3IgZm9yIHRoZSBpZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbG9yaXplciAoaWQpIHtcbiAgICAgIGxldCBjb2xvciA9IGNvbG9yc1sgaWQgXVxuICAgICAgaWYgKGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBjb2xvclxuICAgICAgfVxuICAgICAgY29sb3IgPSBleHBvcnRzLnJhbmRvbUNvbG9yKGJhc2UpXG4gICAgICBjb2xvcnNbIGlkIF0gPSBjb2xvclxuICAgICAgcmV0dXJuIGNvbG9yXG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihjb2xvcml6ZXIsIHsgYmFzZSwgY29sb3JzIH0pXG4gICAgcmV0dXJuIGNvbG9yaXplclxuICB9XG59KVxuIiwiLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb25zIGZvciBkcmF3aW5nXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oZXhwb3J0cywge1xuICAvKipcbiAgICogRHJhdyBhIGNpcmNsZVxuICAgKiBAcGFyYW0gY3R4XG4gICAqIEBwYXJhbSB7UG9pbnR9IHBvaW50XG4gICAqIEBwYXJhbSByYWRpdXNcbiAgICovXG4gIGRyYXdDaXJjbGUgKGN0eCwgcG9pbnQsIHJhZGl1cykge1xuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5hcmMocG9pbnQueCwgcG9pbnQueSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSlcbiAgICBjdHguZmlsbCgpXG4gICAgY3R4LmNsb3NlUGF0aCgpXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgYSBsaW5lXG4gICAqIEBwYXJhbSBjdHhcbiAgICogQHBhcmFtIHsuLi5Qb2ludH0gcG9pbnRzXG4gICAqL1xuICBkcmF3TGluZSAoY3R4LCAuLi5wb2ludHMpIHtcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGxldCBmcm9tID0gcG9pbnRzWyBpIF1cbiAgICAgIGxldCB0byA9IHBvaW50c1sgaSArIDEgXVxuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgY3R4Lm1vdmVUbyhmcm9tLngsIGZyb20ueSlcbiAgICAgIH1cbiAgICAgIGN0eC5saW5lVG8odG8ueCwgdG8ueSlcbiAgICB9XG4gICAgY3R4LnN0cm9rZSgpXG4gICAgY3R4LmNsb3NlUGF0aCgpXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFBvaW50XG4gKiBAcHJvcGVydHkge251bWJlcn0geFxuICogQHByb3BlcnR5IHtudW1iZXJ9IHlcbiAqL1xuIiwiLyoqXG4gKiBSZWFjdCBjb21wb25lbnRzIGZvciBTVUdPUyBwcm9qZWN0LlxuICogQG1vZHVsZSBzZy1yZWFjdC1jb21wb25lbnRzXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmxldCBkID0gKG1vZHVsZSkgPT4gbW9kdWxlLmRlZmF1bHQgfHwgbW9kdWxlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgU2dBbGJ1bSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfYWxidW0nKSkgfSxcbiAgZ2V0IFNnQm9keSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfYm9keScpKSB9LFxuICBnZXQgU2dCdXR0b24gKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX2J1dHRvbicpKSB9LFxuICBnZXQgU2dIZWFkICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19oZWFkJykpIH0sXG4gIGdldCBTZ0hlYWRlciAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfaGVhZGVyJykpIH0sXG4gIGdldCBTZ0h0bWwgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX2h0bWwnKSkgfSxcbiAgZ2V0IFNnS2luZWN0RnJhbWUgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX2tpbmVjdF9mcmFtZScpKSB9LFxuICBnZXQgU2dNYWluICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19tYWluJykpIH0sXG4gIGdldCBTZ01pY3JvcGhvbmUgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX21pY3JvcGhvbmUnKSkgfSxcbiAgZ2V0IFNnUGFnZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfcGFnZScpKSB9LFxuICBnZXQgU2dTd2l0Y2ggKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX3N3aXRjaCcpKSB9LFxuICBnZXQgU2dUaGVtZVN0eWxlICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ190aGVtZV9zdHlsZScpKSB9LFxuICBnZXQgU2dWaWRlbyAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfdmlkZW8nKSkgfVxufVxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcbmltcG9ydCB7QXBOZXh0QnV0dG9uLCBBcFByZXZCdXR0b259IGZyb20gJ2FwZW1hbi1yZWFjdC1idXR0b24nXG5cbi8qKiBAbGVuZHMgU2dBbGJ1bSAqL1xuY29uc3QgU2dBbGJ1bSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICAvKipcbiAgICAgKiBXaWR0aChweCkgb2YgYSBpbWFnZS5cbiAgICAgKi9cbiAgICB3aWR0aDogdHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgaW1hZ2Ugc3JjLlxuICAgICAqL1xuICAgIGltYWdlTGlzdDogdHlwZXMuYXJyYXksXG4gICAgLyoqXG4gICAgICogTnVtYmVyIG9mIGltYWdlcyBwZXIgMSByb3cgaW4gdGhlIHRodW1ibmFpbC5cbiAgICAgKi9cbiAgICB0aHVtYm5haWxDb2w6IHR5cGVzLm51bWJlcixcbiAgICAvKipcbiAgICAgKiBCb3JkZXIgY29sb3Igb2Ygc2VsZWN0ZWQgaW1hZ2UgaW4gdGhlIHRodW1ibmFpbC5cbiAgICAgKi9cbiAgICB0aHVtYm5haWxTZWxlY3RlZENvbG9yOiB0eXBlcy5zdHJpbmcsXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdXBkYXRlLiBBcmd1bWVudCBpcyBpbmRleCBvZiBpbWFnZUxpc3QuXG4gICAgICovXG4gICAgb25DaGFuZ2U6IHR5cGVzLmZ1bmNcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpbWFnZUxpc3Q6IFtdLFxuICAgICAgd2lkdGg6IDMwMCxcbiAgICAgIHRodW1ibmFpbENvbDogNCxcbiAgICAgIHRodW1ibmFpbFNlbGVjdGVkQ29sb3I6ICd5ZWxsb3cnXG4gICAgfVxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG50aDogMVxuICAgIH1cbiAgfSxcblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMsIHN0YXRlIH0gPSBzXG4gICAgbGV0IHsgaW1hZ2VMaXN0IH0gPSBwcm9wc1xuICAgIGxldCBzdHlsZSA9IHMuZ2V0U3R5bGUoKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctYWxidW0nLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgPHN0eWxlIGNsYXNzTmFtZT0nc2ctYWxidW0tc3R5bGUnIHR5cGU9J3RleHQvY3NzJz5cbiAgICAgICAgICB7IHN0eWxlIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NnLWFsYnVtLWNvbnRhaW5lcic+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NnLWFsYnVtLWhlYWRlcic+XG4gICAgICAgICAgICA8QXBQcmV2QnV0dG9uIG9uVGFwPXsgcy50b0xlZnQgfSAvPlxuICAgICAgICAgICAgPEFwTmV4dEJ1dHRvbiBvblRhcD17IHMudG9SaWdodCB9IC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J3NnLWFsYnVtLW50aCc+IHsgc3RhdGUubnRoIH0gLyB7IGltYWdlTGlzdC5sZW5ndGggfSA8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NnLWFsYnVtLWRpc3BsYXknPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NnLWFsYnVtLWZ1bGwtaW1nJz5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpbWFnZUxpc3QubWFwKChpbWFnZSwgaSkgPT5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9J3NnLWFsYnVtLWltZycgc3JjPXsgaW1hZ2UgfSBrZXk9eyBpIH0gLz5cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2ctYWxidW0tdGh1bWJuYWlsJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZy1hbGJ1bS10aHVtYm5haWwtc2VsZWN0ZWQnLz5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaW1hZ2VMaXN0Lm1hcCgoaW1hZ2UsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAvLyDphY3liJfjga7liY3mlrnjgYvjgonnlLvlg4/jgpLmjL/lhaXjgZfjgabjgoLjgIHlkITnlLvlg4/jgavlr77jgZnjgotrZXnjgpLkuI3lpInjgavjgZnjgovjgILnlLvlg4/jg4fjg7zjgr/jgpJrZXnjgavjgZnjgovjgajlkIzjgZjnlLvlg4/jgpLmjL/lhaXjgZnjgovjgajjgqjjg6njg7zjgavjgarjgotcbiAgICAgICAgICAgICAgICBsZXQga2V5ID0gaW1hZ2VMaXN0Lmxlbmd0aCAtIGlcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NnLWFsYnVtLXRodW1ibmFpbC1pbWctZWZmZWN0JyBrZXk9eyBrZXkgfSBkYXRhPXsgaSB9IG9uQ2xpY2s9eyB0aGlzLm1vdmVUbyB9PlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT0nc2ctYWxidW0tdGh1bWJuYWlsLWltZycgc3JjPXsgaW1hZ2UgfSBrZXk9eyBrZXkgfS8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgKG5leHRQcm9wcykge1xuICAgIC8vIOaWsOOBl+OBhOeUu+WDj+OBjOOCt+ODleODiOOBleOCjOOBn+OCiemWsuimp+S9jee9ruOCkuaIu+OBmVxuICAgIGlmICh0aGlzLnByb3BzLmltYWdlTGlzdC5sZW5ndGggPCBuZXh0UHJvcHMuaW1hZ2VMaXN0Lmxlbmd0aCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldEluaXRpYWxTdGF0ZSgpKVxuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsVXBkYXRlIChuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgIC8vIOimquOCs+ODs+ODneODvOODjeODs+ODiOOBi+OCieOBk+OBruOCs+ODs+ODneODvOODjeODs+ODiOOBrueKtuaFi+OCkuWPluW+l+OBmeOCi+OBruOBq+S9v+OBiOOCi1xuICAgIGxldCBvbkNoYW5nZSA9IHRoaXMucHJvcHMub25DaGFuZ2VcbiAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgIG9uQ2hhbmdlKG5leHRTdGF0ZS5udGggLSAxKVxuICAgIH1cbiAgfSxcblxuICBnZXRTdHlsZSAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcywgc3RhdGUgfSA9IHNcbiAgICBsZXQgeyBpbWFnZUxpc3QsIHdpZHRoLCB0aHVtYm5haWxDb2wsIHRodW1ibmFpbFNlbGVjdGVkQ29sb3IgfSA9IHByb3BzXG4gICAgbGV0IGRpc3BsYXlSaWdodCA9IChzdGF0ZS5udGggLSAxKSAqIHdpZHRoXG4gICAgbGV0IHRodW1ibmFpbFdpZHRoID0gd2lkdGggLyB0aHVtYm5haWxDb2xcbiAgICBsZXQgdGh1bWJuYWlsSGVpZ2h0ID0gdGh1bWJuYWlsV2lkdGggKiAzIC8gNFxuICAgIGxldCB0aHVtYm5haWxMZWZ0ID0gdGh1bWJuYWlsV2lkdGggKiAoKHN0YXRlLm50aCAtIDEpICUgdGh1bWJuYWlsQ29sKVxuICAgIGxldCB0aHVtYm5haWxUb3AgPSB0aHVtYm5haWxIZWlnaHQgKiBNYXRoLmZsb29yKChzdGF0ZS5udGggLSAxKSAvIHRodW1ibmFpbENvbClcbiAgICByZXR1cm4gYFxuLnNnLWFsYnVtLWNvbnRhaW5lciB7XG4gIHdpZHRoOiAke3dpZHRofXB4O1xuICBtYXJnaW46IDVweDtcbn1cbi5zZy1hbGJ1bS1kaXNwbGF5IHtcbiAgd2lkdGg6ICR7d2lkdGh9cHg7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCAjNjY2O1xufVxuLnNnLWFsYnVtLWZ1bGwtaW1nIHtcbiAgd2lkdGg6ICR7d2lkdGggKiBpbWFnZUxpc3QubGVuZ3RofXB4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIHJpZ2h0OiAke2Rpc3BsYXlSaWdodH1weDtcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbn1cbi5zZy1hbGJ1bS1pbWcge1xuICB3aWR0aDogJHt3aWR0aH1weDtcbn1cbi5zZy1hbGJ1bS1oZWFkZXIge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cbi5zZy1hbGJ1bS1udGgge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHJpZ2h0OiAwO1xuICB0b3A6IDEwcHg7XG59XG4uc2ctYWxidW0tdGh1bWJuYWlsIHtcbiAgd2lkdGg6ICR7d2lkdGh9cHg7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5zZy1hbGJ1bS10aHVtYm5haWwtaW1nLWVmZmVjdCB7XG4gIHotaW5kZXg6IDE7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB3aWR0aDogJHt0aHVtYm5haWxXaWR0aH1weDtcbn1cbi5zZy1hbGJ1bS10aHVtYm5haWwtaW1nLWVmZmVjdDpob3ZlcjpiZWZvcmUge1xuICBjb250ZW50OiBcIlwiO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogMztcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiAke3RodW1ibmFpbFdpZHRofXB4O1xuICBoZWlnaHQ6ICR7dGh1bWJuYWlsSGVpZ2h0fXB4O1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcbn1cbi5zZy1hbGJ1bS10aHVtYm5haWwtaW1nLWVmZmVjdDphY3RpdmU6YmVmb3JlIHtcbiAgY29udGVudDogXCJcIjtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHotaW5kZXg6IDM7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICB3aWR0aDogJHt0aHVtYm5haWxXaWR0aH1weDtcbiAgaGVpZ2h0OiAke3RodW1ibmFpbEhlaWdodH1weDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyk7XG59XG4uc2ctYWxidW0tdGh1bWJuYWlsLWltZyB7XG4gIHdpZHRoOiAke3RodW1ibmFpbFdpZHRofXB4O1xufVxuLnNnLWFsYnVtLXRodW1ibmFpbC1zZWxlY3RlZCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB6LWluZGV4OiAyO1xuICB3aWR0aDogJHt0aHVtYm5haWxXaWR0aH1weDtcbiAgaGVpZ2h0OiAke3RodW1ibmFpbEhlaWdodH1weDtcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgYm9yZGVyOiAycHggc29saWQgJHt0aHVtYm5haWxTZWxlY3RlZENvbG9yfTtcbiAgbGVmdDogJHt0aHVtYm5haWxMZWZ0fXB4O1xuICB0b3A6ICR7dGh1bWJuYWlsVG9wfXB4O1xufVxuYFxuICB9LFxuXG4gIHRvUmlnaHQgKCkge1xuICAgIGxldCB7IHByb3BzLCBzdGF0ZSB9ID0gdGhpc1xuICAgIGxldCBudGggPSBzdGF0ZS5udGggJSBwcm9wcy5pbWFnZUxpc3QubGVuZ3RoICsgMVxuICAgIHRoaXMuc2V0U3RhdGUoeyBudGggfSlcbiAgfSxcblxuICB0b0xlZnQgKCkge1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gdGhpc1xuICAgIGxldCBudGggPSAoc3RhdGUubnRoICsgcHJvcHMuaW1hZ2VMaXN0Lmxlbmd0aCAtIDIpICUgcHJvcHMuaW1hZ2VMaXN0Lmxlbmd0aCArIDFcbiAgICB0aGlzLnNldFN0YXRlKHsgbnRoIH0pXG4gIH0sXG5cbiAgbW92ZVRvIChlKSB7XG4gICAgbGV0IG50aCA9IE51bWJlcihlLnRhcmdldC5hdHRyaWJ1dGVzLmRhdGEudmFsdWUpICsgMVxuICAgIHRoaXMuc2V0U3RhdGUoeyBudGggfSlcbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dBbGJ1bVxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtBcEJvZHl9IGZyb20gJ2FwZW1hbi1yZWFjdC1iYXNpYydcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbi8qKiBAbGVuZHMgU2dCb2R5ICovXG5jb25zdCBTZ0JvZHkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEFwQm9keSB7IC4uLnByb3BzIH1cbiAgICAgICAgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctYm9keScsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvQXBCb2R5PlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ0JvZHlcbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7QXBCdXR0b259IGZyb20gJ2FwZW1hbi1yZWFjdC1idXR0b24nXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG4vKiogQGxlbmRzIFNnQnV0dG9uICovXG5jb25zdCBTZ0J1dHRvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcblxuICAgIHJldHVybiAoXG4gICAgICA8QXBCdXR0b24geyAuLi5wcm9wcyB9XG4gICAgICAgIGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLWJ1dHRvbicsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvQXBCdXR0b24+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnQnV0dG9uXG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuaW1wb3J0IHtBcEhlYWR9IGZyb20gJ2FwZW1hbi1yZWFjdC1iYXNpYydcblxuLyoqIEBsZW5kcyBTZ0hlYWQgKi9cbmNvbnN0IFNnSGVhZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcblxuICAgIHJldHVybiAoXG4gICAgICA8QXBIZWFkIHsgLi4ucHJvcHMgfVxuICAgICAgICBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1oZWFkJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9BcEhlYWQ+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnSGVhZFxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuLyoqIEBsZW5kcyBTZ0hlYWRlciAqL1xuY29uc3QgU2dIZWFkZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1oZWFkZXInLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dIZWFkZXJcbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5pbXBvcnQge0FwSHRtbH0gZnJvbSAnYXBlbWFuLXJlYWN0LWJhc2ljJ1xuXG4vKiogQGxlbmRzIFNnSHRtbCAqL1xuY29uc3QgU2dIdG1sID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxBcEh0bWwgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctaHRtbCcsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvQXBIdG1sPlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ0h0bWxcbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0tpbmVjdEZyYW1lXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuaW1wb3J0IGFwZW1hbmNvbG9yIGZyb20gJ2FwZW1hbmNvbG9yJ1xuaW1wb3J0IHtkZXB0aFNwYWNlLCBqb2ludFR5cGVzfSBmcm9tICdzZy1raW5lY3QtY29uc3RhbnRzJ1xuaW1wb3J0ICogYXMgZHJhd0hlbHBlciBmcm9tICcuL2hlbHBlcnMvZHJhd19oZWxwZXInXG5pbXBvcnQgKiBhcyBjb2xvckhlbHBlciBmcm9tICcuL2hlbHBlcnMvY29sb3JfaGVscGVyJ1xuXG4vKiogQGxlbmRzIFNnS2luZWN0RnJhbWUgKi9cbmNvbnN0IFNnS2luZWN0RnJhbWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBwcm9wVHlwZXM6IHtcbiAgICAvKiogQm9keSBmcmFtZSBkYXRhIGZyb20ga2luZWN0ICovXG4gICAgYm9kaWVzOiB0eXBlcy5hcnJheSxcbiAgICAvKiogQ29tcG9uZW50IHdpZHRoICovXG4gICAgd2lkdGg6IHR5cGVzLm51bWJlcixcbiAgICAvKiogQ29tcG9uZW50IGhlaWdodCAqL1xuICAgIGhlaWdodDogdHlwZXMubnVtYmVyLFxuICAgIC8qKiBXaWR0aCBvZiBmcmFtZXMgKi9cbiAgICBmcmFtZVdpZHRoOiB0eXBlcy5udW1iZXIsXG4gICAgLyoqIFJhZGl1cyBvZiBqb2ludCAqL1xuICAgIGpvaW50UmFkaXVzOiB0eXBlcy5udW1iZXIsXG4gICAgLyoqIFNjYWxlIHJhdGUgb2YgY2FudmFzICovXG4gICAgc2NhbGU6IHR5cGVzLm51bWJlcixcbiAgICAvKiogQWx0IG1lc3NhZ2Ugd2hlbiBubyBib2R5IGZvdW5kICovXG4gICAgYWx0OiB0eXBlcy5zdHJpbmcsXG4gICAgLyoqIENvbG9yaXplciBmdW5jdGlvbiAqL1xuICAgIGNvbG9yaXplcjogdHlwZXMuZnVuY1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiBkZXB0aFNwYWNlLkJPVU5EX1dJRFRILFxuICAgICAgaGVpZ2h0OiBkZXB0aFNwYWNlLkJPVU5EX0hFSUdIVCxcbiAgICAgIGZyYW1lV2lkdGg6IDQsXG4gICAgICBqb2ludFJhZGl1czogMyxcbiAgICAgIHNjYWxlOiAyLFxuICAgICAgYWx0OiAnTk8gQk9EWSBGT1VORCcsXG4gICAgICBjb2xvcml6ZXI6IGNvbG9ySGVscGVyLnVuaXF1ZUNvbG9yaXplcignI0NDQ0MzMycpXG4gICAgfVxuICB9LFxuXG4gIHN0YXRpY3M6IHt9LFxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcbiAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0LCBzY2FsZSB9ID0gcHJvcHNcbiAgICBsZXQgc3R5bGUgPSBzLmdldFN0eWxlKClcbiAgICBsZXQgaXNFbXB0eSA9IHMuZ2V0Qm9kaWVzKCkubGVuZ3RoID09PSAwXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2cta2lubmVjdC1mcmFtZScsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICB9LCBzdHlsZS5tYWluLCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBpc0VtcHR5ID8gcy5fcmVuZGVyQWx0KHN0eWxlLmFsdCkgOiBudWxsIH1cbiAgICAgICAgPGNhbnZhcyB3aWR0aD17IHdpZHRoICogc2NhbGUgfVxuICAgICAgICAgICAgICAgIGhlaWdodD17IGhlaWdodCAqIHNjYWxlIH1cbiAgICAgICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgd2lkdGgsIGhlaWdodFxuICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICByZWY9eyAoY2FudmFzKSA9PiBzLnJlZ2lzdGVyQ2FudmFzKGNhbnZhcykgfS8+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBzLl90cmFja2luZ0NvbG9ycyA9IHt9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyAobmV4dFByb3BzKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBzLmRyYXdCb2R5KHMuZ2V0Qm9kaWVzKCkpXG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcy5kcmF3Qm9keShzLmdldEJvZGllcygpKVxuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBzLmRyYXdCb2R5KHMuZ2V0Qm9kaWVzKCkpXG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBkcmF3Qm9keSAoYm9kaWVzKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBjYW52YXMgfSA9IHNcblxuICAgIGlmICghY2FudmFzKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBTUElORV9CQVNFLCBTUElORV9NSUQsIE5FQ0ssIEhFQUQsIFNIT1VMREVSX0xFRlQsXG4gICAgICBFTEJPV19MRUZULCBXUklTVF9MRUZULCBIQU5EX0xFRlQsIFNIT1VMREVSX1JJR0hULFxuICAgICAgRUxCT1dfUklHSFQsIFdSSVNUX1JJR0hULCBIQU5EX1JJR0hULCBISVBfTEVGVCwgS05FRV9MRUZULFxuICAgICAgQU5LTEVfTEVGVCwgRk9PVF9MRUZULCBISVBfUklHSFQsIEtORUVfUklHSFQsIEFOS0xFX1JJR0hULFxuICAgICAgRk9PVF9SSUdIVCwgU1BJTkVfU0hPVUxERVIsIEhBTkRfVElQX0xFRlQsIFRIVU1CX0xFRlQsXG4gICAgICBIQU5EX1RJUF9SSUdIVCwgVEhVTUJfUklHSFRcbiAgICB9ID0gam9pbnRUeXBlc1xuXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcbiAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0LCBmcmFtZVdpZHRoLCBqb2ludFJhZGl1cywgc2NhbGUsIGNvbG9yaXplciB9ID0gcHJvcHNcblxuICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgIGN0eC5zYXZlKClcblxuICAgIGNvbnN0IHsgZHJhd0NpcmNsZSwgZHJhd0xpbmUgfSA9IGRyYXdIZWxwZXJcbiAgICBsZXQgdG9Qb2ludCA9IChqb2ludCkgPT4gKHtcbiAgICAgIHg6IGpvaW50LmRlcHRoWCAqIHdpZHRoLFxuICAgICAgeTogam9pbnQuZGVwdGhZICogaGVpZ2h0XG4gICAgfSlcblxuICAgIGN0eC5zY2FsZShzY2FsZSwgc2NhbGUpXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxuXG4gICAgZm9yIChsZXQgYm9keSBvZiBib2RpZXMpIHtcbiAgICAgIGxldCB7IGpvaW50cywgdHJhY2tpbmdJZCB9ID0gYm9keVxuXG4gICAgICBsZXQgY29sb3IgPSBjb2xvcml6ZXIoYHRyYWNraW5nLSR7dHJhY2tpbmdJZH1gKVxuICAgICAgbGV0IHBvaW50cyA9IGpvaW50cy5tYXAodG9Qb2ludClcblxuICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yXG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBhcGVtYW5jb2xvci5wYXJzZShjb2xvcikuYWxwaGEoMC42NikucmdiYVN0cmluZygpXG4gICAgICBjdHgubGluZVdpZHRoID0gZnJhbWVXaWR0aFxuXG4gICAgICBsZXQgc3BpbmVCID0gcG9pbnRzWyBTUElORV9CQVNFIF1cbiAgICAgIGxldCBzcGluZU0gPSBwb2ludHNbIFNQSU5FX01JRCBdXG4gICAgICBsZXQgbmVjayA9IHBvaW50c1sgTkVDSyBdXG4gICAgICBsZXQgaGVhZCA9IHBvaW50c1sgSEVBRCBdXG4gICAgICBsZXQgc2hvdWxkZXJMID0gcG9pbnRzWyBTSE9VTERFUl9MRUZUIF1cbiAgICAgIGxldCBlbGJvd0wgPSBwb2ludHNbIEVMQk9XX0xFRlQgXVxuICAgICAgbGV0IHdyaXN0TCA9IHBvaW50c1sgV1JJU1RfTEVGVCBdXG4gICAgICBsZXQgaGFuZEwgPSBwb2ludHNbIEhBTkRfTEVGVCBdXG4gICAgICBsZXQgc2hvdWxkZXJSID0gcG9pbnRzWyBTSE9VTERFUl9SSUdIVCBdXG4gICAgICBsZXQgZWxib3dSID0gcG9pbnRzWyBFTEJPV19SSUdIVCBdXG4gICAgICBsZXQgd3Jpc3RSID0gcG9pbnRzWyBXUklTVF9SSUdIVCBdXG4gICAgICBsZXQgaGFuZFIgPSBwb2ludHNbIEhBTkRfUklHSFQgXVxuICAgICAgbGV0IGhpcEwgPSBwb2ludHNbIEhJUF9MRUZUIF1cbiAgICAgIGxldCBrbmVlTCA9IHBvaW50c1sgS05FRV9MRUZUIF1cbiAgICAgIGxldCBhbmtsZUwgPSBwb2ludHNbIEFOS0xFX0xFRlQgXVxuICAgICAgbGV0IGZvb3RMID0gcG9pbnRzWyBGT09UX0xFRlQgXVxuICAgICAgbGV0IGhpcFIgPSBwb2ludHNbIEhJUF9SSUdIVCBdXG4gICAgICBsZXQga25lZVIgPSBwb2ludHNbIEtORUVfUklHSFQgXVxuICAgICAgbGV0IGFua2xlUiA9IHBvaW50c1sgQU5LTEVfUklHSFQgXVxuICAgICAgbGV0IGZvb3RSID0gcG9pbnRzWyBGT09UX1JJR0hUIF1cbiAgICAgIGxldCBzcGluZVNob3VsZGVyID0gcG9pbnRzWyBTUElORV9TSE9VTERFUiBdXG4gICAgICBsZXQgaGFuZFRpcEwgPSBwb2ludHNbIEhBTkRfVElQX0xFRlQgXVxuICAgICAgbGV0IHRodW1iTCA9IHBvaW50c1sgVEhVTUJfTEVGVCBdXG4gICAgICBsZXQgaGFuZFRpcFIgPSBwb2ludHNbIEhBTkRfVElQX1JJR0hUIF1cbiAgICAgIGxldCB0aHVtYlIgPSBwb2ludHNbIFRIVU1CX1JJR0hUIF1cblxuICAgICAgLy8gRHJhdyBsaW5lc1xuICAgICAge1xuICAgICAgICBsZXQgbGluZVBvaW50cyA9IFtcbiAgICAgICAgICBbIGhlYWQsIG5lY2ssIHNwaW5lU2hvdWxkZXIsIHNwaW5lTSwgc3BpbmVCIF0sXG4gICAgICAgICAgWyBzcGluZVNob3VsZGVyLCBzaG91bGRlckwsIGVsYm93TCwgd3Jpc3RMLCBoYW5kTCwgaGFuZFRpcEwsIHRodW1iTCBdLFxuICAgICAgICAgIFsgc3BpbmVCLCBoaXBMLCBrbmVlTCwgYW5rbGVMLCBmb290TCBdLFxuICAgICAgICAgIFsgc3BpbmVTaG91bGRlciwgc2hvdWxkZXJSLCBlbGJvd1IsIHdyaXN0UiwgaGFuZFIsIGhhbmRUaXBSLCB0aHVtYlIgXSxcbiAgICAgICAgICBbIHNwaW5lQiwgaGlwUiwga25lZVIsIGFua2xlUiwgZm9vdFIgXVxuICAgICAgICBdXG4gICAgICAgIGZvciAobGV0IGxpbmVQb2ludCBvZiBsaW5lUG9pbnRzKSB7XG4gICAgICAgICAgZHJhd0xpbmUoY3R4LCAuLi5saW5lUG9pbnQpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRHJhdyBjaXJjbGVzXG4gICAgICB7XG4gICAgICAgIGNvbnN0IFJBRElVUyA9IGpvaW50UmFkaXVzXG4gICAgICAgIGxldCBjaXJjbGVQb2ludHMgPSBbXG4gICAgICAgICAgaGVhZCwgbmVjaywgc3BpbmVTaG91bGRlciwgc3BpbmVNLCBzcGluZUIsXG4gICAgICAgICAgc2hvdWxkZXJMLCBoaXBMLCBlbGJvd0wsIHdyaXN0TCxcbiAgICAgICAgICBzaG91bGRlclIsIGhpcFIsIGVsYm93Uiwgd3Jpc3RSLFxuICAgICAgICAgIGhhbmRMLCBoYW5kVGlwTCwgdGh1bWJMLFxuICAgICAgICAgIGhhbmRSLCBoYW5kVGlwUiwgdGh1bWJSXG4gICAgICAgIF1cbiAgICAgICAgZm9yIChsZXQgY2lyY2xlUG9pbnQgb2YgY2lyY2xlUG9pbnRzKSB7XG4gICAgICAgICAgZHJhd0NpcmNsZShjdHgsIGNpcmNsZVBvaW50LCBSQURJVVMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdHgucmVzdG9yZSgpXG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQ3VzdG9tXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVnaXN0ZXJDYW52YXMgKGNhbnZhcykge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcy5jYW52YXMgPSBjYW52YXNcbiAgfSxcblxuICBnZXRTdHlsZSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgIH0sXG4gICAgICBhbHQ6IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgY29sb3I6ICcjRUVFJyxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgZm9udFNpemU6ICczNnB4JyxcbiAgICAgICAgekluZGV4OiAnNCcsXG4gICAgICAgIGxpbmVIZWlnaHQ6ICcxZW0nLFxuICAgICAgICB3b3JkQnJlYWs6ICdicmVhay13b3JkJyxcbiAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRCb2RpZXMgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcbiAgICByZXR1cm4gKHByb3BzLmJvZGllcyB8fCBbXSlcbiAgICAgIC5maWx0ZXIoKGJvZHkpID0+ICEhYm9keSlcbiAgICAgIC5maWx0ZXIoKGJvZHkpID0+IGJvZHkudHJhY2tlZClcbiAgfSxcblxuICBfcmVuZGVyQWx0IChzdHlsZSkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZy1raW5uZWN0LWZyYW1lLWFsdFwiIHN0eWxlPXsgc3R5bGUgfVxuICAgICAgPnsgcHJvcHMuYWx0IH08L2Rpdj5cbiAgICApXG4gIH0sXG5cbiAgY2FudmFzOiBudWxsLFxuXG4gIF90cmFja2luZ0NvbG9yczogbnVsbFxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ0tpbmVjdEZyYW1lXG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG4vKiogQGxlbmRzIFNnTWFpbiAqL1xuY29uc3QgU2dNYWluID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctbWFpbicsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ01haW5cbiIsIi8qKlxuICogTWljcm9waG9uZSBjb21wb25lbnRcbiAqIEBjbGFzcyBTZ01pY3JvcGhvbmVcbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQge0FwSWNvbn0gZnJvbSAnYXBlbWFuLXJlYWN0LWJhc2ljJ1xuaW1wb3J0IHtBcFRvdWNoTWl4aW4sIEFwUHVyZU1peGlufSBmcm9tICdhcGVtYW4tcmVhY3QtbWl4aW5zJ1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuY29uc3QgeyBNSUNST1BIT05FX1RSQU5TSVRJT04gfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL2FuaW1hdGlvbl9jb25zdGFudHMnKVxuXG4vKiogQGxlbmRzIFNnTWljcm9waG9uZSAqL1xuY29uc3QgU2dNaWNyb3Bob25lID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgd2lkdGg6IHR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IHR5cGVzLm51bWJlcixcbiAgICBvbjogdHlwZXMuYm9vbFxuICB9LFxuXG4gIHN0YXRpY3M6IHtcbiAgICBNSUNST1BIT05FX1RSQU5TSVRJT05cbiAgfSxcblxuICBtaXhpbnM6IFtcbiAgICBBcFRvdWNoTWl4aW4sXG4gICAgQXBQdXJlTWl4aW5cbiAgXSxcblxuICBnZXREZWZhdWx0UHJvcHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogNDQsXG4gICAgICBoZWlnaHQ6IDQ0LFxuICAgICAgb246IGZhbHNlXG4gICAgfVxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVubGFyZ2VkOiBmYWxzZVxuICAgIH1cbiAgfSxcblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHN0eWxlID0gcy5nZXRTdHlsZSgpXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG4gICAgbGV0IHsgb24gfSA9IHByb3BzXG4gICAgcmV0dXJuIChcbiAgICAgIDxhIGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLW1pY3JvcGhvbmUnLCB7XG4gICAgICAgICdzZy1taWNyb3Bob25lLW9uJzogb25cbiAgICAgIH0pfVxuICAgICAgICAgc3R5bGU9eyBzdHlsZS5yb290IH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctbWljcm9waG9uZS1iYWNrJywge1xuICAgICAgICAnc2ctbWljcm9waG9uZS1iYWNrLWVubGFyZ2VkJzogc3RhdGUuZW5sYXJnZWRcbiAgICAgICAgfSkgfT48L2Rpdj5cbiAgICAgICAgPEFwSWNvbiBjbGFzc05hbWU9XCJmYSBmYS1taWNyb3Bob25lIHNnLW1pY3JvcGhvbmUtaWNvblwiXG4gICAgICAgICAgICAgICAgc3R5bGU9eyBzdHlsZS5pY29uIH1cbiAgICAgICAgLz5cbiAgICAgIDwvYT5cbiAgICApXG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gTGlmZWN5Y2xlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgY29tcG9uZW50RGlkTW91bnQgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcy5fYW5tYXRpb25UaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGNvbnN0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG4gICAgICBpZiAocHJvcHMub24pIHtcbiAgICAgICAgcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgZW5sYXJnZWQ6ICFzdGF0ZS5lbmxhcmdlZFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sIE1JQ1JPUEhPTkVfVFJBTlNJVElPTilcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5Nb3VudCAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBjbGVhckludGVydmFsKHMuX2FubWF0aW9uVGltZXIpXG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQ3VzdG9tXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZ2V0U3R5bGUgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcbiAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSBwcm9wc1xuICAgIHJldHVybiB7XG4gICAgICByb290OiB7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHRcbiAgICAgIH0sXG4gICAgICBpY29uOiB7XG4gICAgICAgIGZvbnRTaXplOiBoZWlnaHQgKiAwLjY2XG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNnTWljcm9waG9uZVxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuLyoqIEBsZW5kcyBTZ1BhZ2UgKi9cbmNvbnN0IFNnUGFnZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLXBhZ2UnLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dQYWdlXG4iLCIvKipcbiAqIFNnU3dpdGNoIENvbXBvbmVudFxuICogQGNsYXNzIFNnU3dpdGNoXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQge0FwU3dpdGNofSBmcm9tICdhcGVtYW4tcmVhY3Qtc3dpdGNoJ1xuaW1wb3J0IHtBcFN0eWxlfSBmcm9tICdhcGVtYW4tcmVhY3Qtc3R5bGUnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG4vKiogQGxlbmRzIFNnU3dpdGNoICovXG5jb25zdCBTZ1N3aXRjaCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqXG4gICAgICogV2lkdGgocHgpIG9mIGEgc3dpdGNoLlxuICAgICAqL1xuICAgIHdpZHRoOiB0eXBlcy5udW1iZXIsXG4gICAgLyoqXG4gICAgICogVGhlIHN0YXRlIG9mIG9uL29mZi5cbiAgICAgKi9cbiAgICBvbjogdHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiBvbiB0YXAuXG4gICAgICovXG4gICAgb25UYXA6IHR5cGVzLmZ1bmMsXG4gICAgb25UaXRsZTogdHlwZXMuc3RyaW5nLFxuICAgIG9mZlRpdGxlOiB0eXBlcy5zdHJpbmcsXG4gICAgaGlnaGxpZ2h0Q29sb3I6IHR5cGVzLnN0cmluZyxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IHR5cGVzLnN0cmluZyxcbiAgICBib3JkZXJDb2xvcjogdHlwZXMuc3RyaW5nLFxuICAgIGhhbmRsZVNpemU6IHR5cGVzLm51bWJlclxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSAoKSB7XG4gICAgbGV0IHN0eWxlID0gdGhpcy5jdXN0b21TdHlsZSgpXG4gICAgcmV0dXJuIHsgc3R5bGUgfVxuICB9LFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcywgc3RhdGUgfSA9IHNcbiAgICBsZXQgeyBzdHlsZSB9ID0gc3RhdGVcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1zd2l0Y2gnLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHtkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgbWFyZ2luOiAnNHB4J30sIHByb3BzLnN0eWxlKSB9ID5cbiAgICAgICAgPEFwU3R5bGUgZGF0YT17IHN0eWxlIH0gLz5cbiAgICAgICAgPEFwU3dpdGNoIHsgLi4ucHJvcHMgfS8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH0sXG5cbiAgY3VzdG9tU3R5bGUgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcblxuICAgIGxldCB7IGhpZ2hsaWdodENvbG9yLCBiYWNrZ3JvdW5kQ29sb3IsIGJvcmRlckNvbG9yIH0gPSBwcm9wc1xuICAgIGxldCBoYW5kbGVTaXplID0gcHJvcHMuaGFuZGxlU2l6ZSB8fCAyNFxuICAgIGxldCBtaW5XaWR0aCA9IGhhbmRsZVNpemUgKiAxLjVcbiAgICBsZXQgc3R5bGUgPSB7XG4gICAgICAnLmFwLXN3aXRjaC1sYWJlbCc6IHtcbiAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcbiAgICAgICAgbGluZUhlaWdodDogYCR7aGFuZGxlU2l6ZX1weGBcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1sYWJlbC10ZXh0Jzoge1xuICAgICAgICBtaW5XaWR0aDogbWluV2lkdGhcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vbi1sYWJlbCc6IHtcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgIG1hcmdpblJpZ2h0OiAtMSAqIGhhbmRsZVNpemUgLyAyXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb2ZmLWxhYmVsJzoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZBRkFGQScsXG4gICAgICAgIGNvbG9yOiAnI0FBQScsXG4gICAgICAgIG1hcmdpbkxlZnQ6IC0xICogaGFuZGxlU2l6ZSAvIDJcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vbiAuYXAtc3dpdGNoLW9mZi1sYWJlbCc6IHtcbiAgICAgICAgd2lkdGg6IGAke2hhbmRsZVNpemUgLyAyICsgMn1weCAhaW1wb3J0YW50YFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9mZiAuYXAtc3dpdGNoLW9uLWxhYmVsJzoge1xuICAgICAgICB3aWR0aDogYCR7aGFuZGxlU2l6ZSAvIDIgKyAyfXB4ICFpbXBvcnRhbnRgXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtaW5uZXInOiB7XG4gICAgICAgIGhlaWdodDogaGFuZGxlU2l6ZSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAoaGFuZGxlU2l6ZSAvIDIgKyAxKSxcbiAgICAgICAgbWluV2lkdGg6IG1pbldpZHRoXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtaGFuZGxlJzoge1xuICAgICAgICB3aWR0aDogaGFuZGxlU2l6ZSxcbiAgICAgICAgaGVpZ2h0OiBoYW5kbGVTaXplXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChoaWdobGlnaHRDb2xvcikge1xuICAgICAgT2JqZWN0LmFzc2lnbihzdHlsZVsnLmFwLXN3aXRjaC1vbi1sYWJlbCddLCB7XG4gICAgICAgIGJhY2tncm91bmQ6IGhpZ2hsaWdodENvbG9yXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAoYmFja2dyb3VuZENvbG9yKSB7XG4gICAgICBPYmplY3QuYXNzaWduKHN0eWxlWycuYXAtc3dpdGNoLWlubmVyJ10sIHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYWNrZ3JvdW5kQ29sb3JcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChib3JkZXJDb2xvcikge1xuICAgICAgbGV0IGJvcmRlckNvbG9yT3B0aW9uID0ge1xuICAgICAgICBib3JkZXI6IGAxcHggc29saWQgJHtib3JkZXJDb2xvcn1gXG4gICAgICB9XG4gICAgICBPYmplY3QuYXNzaWduKHN0eWxlWycuYXAtc3dpdGNoLWlubmVyJ10sIGJvcmRlckNvbG9yT3B0aW9uKVxuICAgICAgT2JqZWN0LmFzc2lnbihzdHlsZVsnLmFwLXN3aXRjaC1oYW5kbGUnXSwgYm9yZGVyQ29sb3JPcHRpb24pXG4gICAgfVxuICAgIHJldHVybiBzdHlsZVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ1N3aXRjaFxuIiwiLyoqXG4gKiBTdHlsZSBmb3IgU2dIdG1sLlxuICogQGNvbnN0cnVjdG9yIFNnVGhlbWVTdHlsZVxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtBcFN0eWxlfSBmcm9tICdhcGVtYW4tcmVhY3Qtc3R5bGUnXG5pbXBvcnQge0FwVGhlbWVTdHlsZX0gZnJvbSAnYXBlbWFuLXJlYWN0LXRoZW1lJ1xuXG5jb25zdCB7IE1JQ1JPUEhPTkVfVFJBTlNJVElPTiB9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMvYW5pbWF0aW9uX2NvbnN0YW50cycpXG5cbi8qKiBAbGVuZHMgU2dUaGVtZVN0eWxlICovXG5jb25zdCBTZ1RoZW1lU3R5bGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIHN0eWxlOiB0eXBlcy5vYmplY3QsXG4gICAgZG9taW5hbnQ6IHR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdHlsZToge30sXG4gICAgICBkb21pbmFudDogQXBTdHlsZS5ERUZBVUxUX0hJR0hMSUdIVF9DT0xPUlxuICAgIH1cbiAgfSxcbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzIH0gPSBzXG5cbiAgICBsZXQgeyBkb21pbmFudCB9ID0gcHJvcHNcblxuICAgIGxldCBzdHlsZSA9IHtcbiAgICAgICcuc2ctaHRtbCc6IHt9LFxuICAgICAgJy5zZy1taWNyb3Bob25lJzoge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgIGNvbG9yOiAnaW5oZXJpdCdcbiAgICAgIH0sXG4gICAgICAnLnNnLW1pY3JvcGhvbmUtYmFjayc6IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogZG9taW5hbnQsXG4gICAgICAgIGRpc3BsYXk6ICdub25lJyxcbiAgICAgICAgdG9wOiAnOXB4JyxcbiAgICAgICAgbGVmdDogJzlweCcsXG4gICAgICAgIHJpZ2h0OiAnOXB4JyxcbiAgICAgICAgYm90dG9tOiAnOXB4JyxcbiAgICAgICAgdHJhbnNpdGlvbjogYHRyYW5zZm9ybSAke01JQ1JPUEhPTkVfVFJBTlNJVElPTn1tc2AsXG4gICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJzUwJSA1MCUnLFxuICAgICAgICB0cmFuc2Zvcm06ICdzY2FsZSgxLCAxKSdcbiAgICAgIH0sXG4gICAgICAnLnNnLW1pY3JvcGhvbmUtb24gLnNnLW1pY3JvcGhvbmUtYmFjayc6IHtcbiAgICAgICAgZGlzcGxheTogJ2Jsb2NrJ1xuICAgICAgfSxcbiAgICAgICcuc2ctbWljcm9waG9uZS1vbiAuc2ctbWljcm9waG9uZS1pY29uJzoge1xuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICB9LFxuICAgICAgJy5zZy1taWNyb3Bob25lLWJhY2stZW5sYXJnZWQnOiB7XG4gICAgICAgIHRyYW5zZm9ybTogJ3NjYWxlKDIsIDIpJ1xuICAgICAgfSxcbiAgICAgICcuc2ctbWljcm9waG9uZS1pY29uJzoge1xuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgekluZGV4OiA0LFxuICAgICAgICBvcGFjaXR5OiAwLjc1XG4gICAgICB9LFxuICAgICAgJy5zZy1taWNyb3Bob25lOmhvdmVyIC5zZy1taWNyb3Bob25lLWljb24nOiB7XG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgIH0sXG4gICAgICAnLnNnLW1pY3JvcGhvbmU6YWN0aXZlIC5zZy1taWNyb3Bob25lLWljb24nOiB7XG4gICAgICAgIG9wYWNpdHk6IDAuOVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPEFwVGhlbWVTdHlsZSB7IC4uLnByb3BzIH1cbiAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHN0eWxlLCBwcm9wcy5zdHlsZSkgfVxuICAgICAgPnsgcHJvcHMuY2hpbGRyZW4gfTwvQXBUaGVtZVN0eWxlPlxuICAgIClcbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dUaGVtZVN0eWxlXG4iLCIvKipcbiAqIFNnVmlkZW8gQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dWaWRlb1xuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuLyoqIEBsZW5kcyBTZ1ZpZGVvICovXG5jb25zdCBTZ1ZpZGVvID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHByb3BUeXBlczoge1xuICAgIC8qKiBWaWRlbyBzb3VyY2UgVVJMICovXG4gICAgc3JjOiB0eXBlcy5vbmVPZlR5cGUoW1xuICAgICAgdHlwZXMuc3RyaW5nLFxuICAgICAgdHlwZXMuYXJyYXlPZih0eXBlcy5zdHJpbmcpXG4gICAgXSksXG4gICAgLyoqIFJlZ2lzdGVyIHBsYXllciAqL1xuICAgIHBsYXllclJlZjogdHlwZXMuZnVuY1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBsYXllclJlZiAoKSB7fVxuICAgIH1cbiAgfSxcblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG4gICAgbGV0IHNyYyA9IFtdLmNvbmNhdChwcm9wcy5zcmMgfHwgW10pXG4gICAgcmV0dXJuIChcbiAgICAgIDx2aWRlbyB7IC4uLnByb3BzIH1cbiAgICAgICAgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctdmlkZW8nLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfVxuICAgICAgICByZWY9eyAocGxheWVyKSA9PiBwcm9wcy5wbGF5ZXJSZWYocGxheWVyKSB9XG4gICAgICA+XG4gICAgICAgIHsgc3JjLm1hcCgoc3JjKSA9PiAoXG4gICAgICAgICAgPHNvdXJjZSBzcmM9eyBzcmMgfSBrZXk9eyBzcmMgfS8+KVxuICAgICAgICApIH1cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L3ZpZGVvPlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ1ZpZGVvXG4iXX0=
