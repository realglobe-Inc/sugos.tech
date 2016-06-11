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
          }
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

    var _section = function _section(name, config) {
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
            reversed: false,
            video1: {
              src: 'videos/mock-mp4.mp4',
              translateX: -120,
              translateY: -30
            },
            video2: {
              src: 'videos/mock-mp4-2.mp4',
              translateX: -60,
              translateY: -40
            }
          }), _section('sense', {
            title: l('sections.CASE_SENSE_TITLE'),
            text: l('sections.CASE_SENSE_TEXT'),
            reversed: true,
            video1: {
              src: 'videos/mock-mp4.mp4',
              translateX: -60,
              translateY: -60
            },
            video2: {
              src: 'videos/mock-mp4-2.mp4',
              translateX: -30,
              translateY: 0
            }
          }), _section('talk', {
            title: l('sections.CASE_TALK_TITLE'),
            text: l('sections.CASE_TALK_TEXT'),
            reversed: false,
            video1: {
              src: 'videos/mock-mp4.mp4',
              translateX: -10,
              translateY: -10
            },
            video2: {
              src: 'videos/mock-mp4-2.mp4',
              translateX: -140,
              translateY: -70
            }
          })]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsImxpYi9icm93c2VyL2Nhc2VzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9jYXNlcy5jb21wb25lbnQuanMiLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2pvaW5lci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZGVvLmpzIiwibGliL2NvbXBvbmVudHMvdmlld3Mvc2hvd2Nhc2Vfdmlldy5qcyIsImxpYi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24iLCJsaWIvc2VydmljZXMvbGlua19zZXJ2aWNlLmpzIiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvYXBlbWFuLXByb2plY3RzL2FwZW1hbi1yZWFjdC1zd2l0Y2gvbGliL2FwX3N3aXRjaC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9hcGVtYW4tcHJvamVjdHMvYXBlbWFuLXJlYWN0LXN3aXRjaC9saWIvYXBfc3dpdGNoX3N0eWxlLmpzeCIsIm5vZGVfbW9kdWxlcy9hcGVtYW4tcmVhY3Qtc3dpdGNoL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcGVtYW5jb2xvci9saWIvYWxwaGEuanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2NvbG9yaXplcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2NvbG9yaXplcnMvcm90YXRlX2NvbG9yaXplci5qcyIsIm5vZGVfbW9kdWxlcy9hcGVtYW5jb2xvci9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2lzX2RhcmsuanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL2lzX2xpZ2h0LmpzIiwibm9kZV9tb2R1bGVzL2FwZW1hbmNvbG9yL2xpYi9taXguanMiLCJub2RlX21vZHVsZXMvYXBlbWFuY29sb3IvbGliL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL2FwZW1hbmNvbG9yL2xpYi9yb3RhdGUuanMiLCJub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9jb252ZXJzaW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1jb252ZXJ0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLW5hbWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL2NvbG9yLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zZy1raW5lY3QtY29uc3RhbnRzL2xpYi9kZXB0aF9zcGFjZS5qcyIsIm5vZGVfbW9kdWxlcy9zZy1raW5lY3QtY29uc3RhbnRzL2xpYi9oYW5kX3N0YXRlLmpzIiwibm9kZV9tb2R1bGVzL3NnLWtpbmVjdC1jb25zdGFudHMvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NnLWtpbmVjdC1jb25zdGFudHMvbGliL2pvaW50X3R5cGVzLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2NvbnN0YW50cy9hbmltYXRpb25fY29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2hlbHBlcnMvY29sb3JfaGVscGVyLmpzIiwibm9kZV9tb2R1bGVzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL2hlbHBlcnMvZHJhd19oZWxwZXIuanMiLCJub2RlX21vZHVsZXMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvaW5kZXguanMiLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfYWxidW0uanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX2JvZHkuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX2J1dHRvbi5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfaGVhZC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfaGVhZGVyLmpzeCIsIi9Vc2Vycy9va3VuaXNoaW5pc2hpL1Byb2plY3RzL3JlYWxnbG9iZS1wcm9qZWN0cy9zZy1yZWFjdC1jb21wb25lbnRzL2xpYi9zZ19odG1sLmpzeCIsIi9Vc2Vycy9va3VuaXNoaW5pc2hpL1Byb2plY3RzL3JlYWxnbG9iZS1wcm9qZWN0cy9zZy1yZWFjdC1jb21wb25lbnRzL2xpYi9zZ19raW5lY3RfZnJhbWUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX21haW4uanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX21pY3JvcGhvbmUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3BhZ2UuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3N3aXRjaC5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9yZWFsZ2xvYmUtcHJvamVjdHMvc2ctcmVhY3QtY29tcG9uZW50cy9saWIvc2dfdGhlbWVfc3R5bGUuanN4IiwiL1VzZXJzL29rdW5pc2hpbmlzaGkvUHJvamVjdHMvcmVhbGdsb2JlLXByb2plY3RzL3NnLXJlYWN0LWNvbXBvbmVudHMvbGliL3NnX3ZpZGVvLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ25CQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7OztBQUdBLElBQU0sVUFB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LE1BQUgsQ0FBVSxNQUFNLEdBQU4sSUFBYSxFQUF2QixDQUFWO0FBQ0EsV0FDRTtBQUFBO01BQUEsYUFBWSxLQUFaO0FBQ0UsbUJBQVksMEJBQVcsVUFBWCxFQUF1QixNQUFNLFNBQTdCLENBRGQ7QUFFRSxlQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsTUFBTSxLQUF4QixDQUZWO0FBR0UsYUFBTSxhQUFDLE1BQUQ7QUFBQSxpQkFBWSxNQUFNLFNBQU4sQ0FBZ0IsTUFBaEIsQ0FBWjtBQUFBO0FBSFI7TUFLSSxJQUFJLEdBQUosQ0FBUSxVQUFDLEdBQUQ7QUFBQSxlQUNSLDBDQUFRLEtBQU0sR0FBZCxFQUFvQixLQUFNLEdBQTFCLEdBRFE7QUFBQSxPQUFSLENBTEo7TUFRSSxNQUFNO0FBUlYsS0FERjtBQVlEO0FBckMrQixDQUFsQixDQUFoQjs7a0JBeUNlLE8iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsYXN0ID0gcGFydHNbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gU3BsaXQgYSBmaWxlbmFtZSBpbnRvIFtyb290LCBkaXIsIGJhc2VuYW1lLCBleHRdLCB1bml4IHZlcnNpb25cbi8vICdyb290JyBpcyBqdXN0IGEgc2xhc2gsIG9yIG5vdGhpbmcuXG52YXIgc3BsaXRQYXRoUmUgPVxuICAgIC9eKFxcLz98KShbXFxzXFxTXSo/KSgoPzpcXC57MSwyfXxbXlxcL10rP3wpKFxcLlteLlxcL10qfCkpKD86W1xcL10qKSQvO1xudmFyIHNwbGl0UGF0aCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gIHJldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKTtcbn07XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZWRQYXRoID0gJycsXG4gICAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICB2YXIgcGF0aCA9IChpID49IDApID8gYXJndW1lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5qb2luIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuLy8gcGF0aC5yZWxhdGl2ZShmcm9tLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuZXhwb3J0cy5kZWxpbWl0ZXIgPSAnOic7XG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIHJlc3VsdCA9IHNwbGl0UGF0aChwYXRoKSxcbiAgICAgIHJvb3QgPSByZXN1bHRbMF0sXG4gICAgICBkaXIgPSByZXN1bHRbMV07XG5cbiAgaWYgKCFyb290ICYmICFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lIHdoYXRzb2V2ZXJcbiAgICByZXR1cm4gJy4nO1xuICB9XG5cbiAgaWYgKGRpcikge1xuICAgIC8vIEl0IGhhcyBhIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgZGlyID0gZGlyLnN1YnN0cigwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gcm9vdCArIGRpcjtcbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aChwYXRoKVsyXTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbXBhcmlzb24gY2FzZS1pbnNlbnNpdGl2ZSBvbiB3aW5kb3dzP1xuICBpZiAoZXh0ICYmIGYuc3Vic3RyKC0xICogZXh0Lmxlbmd0aCkgPT09IGV4dCkge1xuICAgIGYgPSBmLnN1YnN0cigwLCBmLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBmO1xufTtcblxuXG5leHBvcnRzLmV4dG5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBzcGxpdFBhdGgocGF0aClbM107XG59O1xuXG5mdW5jdGlvbiBmaWx0ZXIgKHhzLCBmKSB7XG4gICAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbnZhciBzdWJzdHIgPSAnYWInLnN1YnN0cigtMSkgPT09ICdiJ1xuICAgID8gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikgeyByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKSB9XG4gICAgOiBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKTtcbiAgICB9XG47XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qKlxuICogQnJvd3NlciBzY3JpcHQgZm9yIGNhc2VzLlxuICpcbiAqIEdlbmVyYXRlZCBieSBjb3ogb24gNi85LzIwMTYsXG4gKiBmcm9tIGEgdGVtcGxhdGUgcHJvdmlkZWQgYnkgYXBlbWFuLWJ1ZC1tb2NrLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0ID0gcmVxdWlyZSgnYXBlbWFuLWJyd3MtcmVhY3QnKTtcblxudmFyIF9hcGVtYW5CcndzUmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBlbWFuQnJ3c1JlYWN0KTtcblxudmFyIF9jYXNlc0NvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvY2FzZXMuY29tcG9uZW50LmpzJyk7XG5cbnZhciBfY2FzZXNDb21wb25lbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2FzZXNDb21wb25lbnQpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgQ09OVEFJTkVSX0lEID0gJ2Nhc2VzLXdyYXAnO1xud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF93aW5kb3cgPSB3aW5kb3c7XG4gIHZhciBsb2NhbGUgPSBfd2luZG93LmxvY2FsZTtcblxuICBfYXBlbWFuQnJ3c1JlYWN0Mi5kZWZhdWx0LnJlbmRlcihDT05UQUlORVJfSUQsIF9jYXNlc0NvbXBvbmVudDIuZGVmYXVsdCwge1xuICAgIGxvY2FsZTogbG9jYWxlXG4gIH0sIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgLy8gVGhlIGNvbXBvbmVudCBpcyByZWFkeS5cbiAgfSk7XG59OyIsIi8qKlxuICogQ29tcG9uZW50IG9mIGNhc2VzLlxuICpcbiAqIEdlbmVyYXRlZCBieSBjb3ogb24gNi85LzIwMTYsXG4gKiBmcm9tIGEgdGVtcGxhdGUgcHJvdmlkZWQgYnkgYXBlbWFuLWJ1ZC1tb2NrLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9oZWFkZXIgPSByZXF1aXJlKCcuL2ZyYWdtZW50cy9oZWFkZXInKTtcblxudmFyIF9oZWFkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVhZGVyKTtcblxudmFyIF9zaG93Y2FzZV92aWV3ID0gcmVxdWlyZSgnLi92aWV3cy9zaG93Y2FzZV92aWV3Jyk7XG5cbnZhciBfc2hvd2Nhc2VfdmlldzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zaG93Y2FzZV92aWV3KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENhc2VzQ29tcG9uZW50ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdDYXNlc0NvbXBvbmVudCcsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFja2VyOiBuZXcgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2suU3RhY2tlcih7XG4gICAgICAgIHJvb3Q6IF9zaG93Y2FzZV92aWV3Mi5kZWZhdWx0LFxuICAgICAgICByb290UHJvcHM6IHt9XG4gICAgICB9KVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgcy5yZWdpc3RlckxvY2FsZShwcm9wcy5sb2NhbGUpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFBhZ2UsXG4gICAgICBudWxsLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2hlYWRlcjIuZGVmYXVsdCwgeyB0YWI6ICdDQVNFUycgfSksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBNYWluLFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjaywgeyBzdGFja2VyOiBwcm9wcy5zdGFja2VyIH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENhc2VzQ29tcG9uZW50OyIsIi8qKlxuICogSGVhZGVyIGNvbXBvbmVudFxuICogQGNsYXNzIEhlYWRlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfbG9nbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9sb2dvJyk7XG5cbnZhciBfbG9nbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2dvKTtcblxudmFyIF9saW5rX3NlcnZpY2UgPSByZXF1aXJlKCcuLi8uLi9zZXJ2aWNlcy9saW5rX3NlcnZpY2UnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqIEBsZW5kcyBIZWFkZXIgKi9cbnZhciBIZWFkZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGFiOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFiOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciB0YWIgPSBwcm9wcy50YWI7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF90YWJJdGVtID0gX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWJJdGVtLmNyZWF0ZUl0ZW07XG4gICAgdmFyIF9saW5rID0gZnVuY3Rpb24gX2xpbmsoKSB7XG4gICAgICByZXR1cm4gX2xpbmtfc2VydmljZS5zaW5nbGV0b24ucmVzb2x2ZUh0bWxMaW5rLmFwcGx5KF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXIsXG4gICAgICB7IGNsYXNzTmFtZTogJ2hlYWRlcicgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcENvbnRhaW5lcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJMb2dvLFxuICAgICAgICAgIHsgaHJlZjogX2xpbmsoJ2luZGV4Lmh0bWwnKSB9LFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9sb2dvMi5kZWZhdWx0LCBudWxsKVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlclRhYixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkRPQ1NfUEFHRScpLCBfbGluaygnZG9jcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0RPQ1MnIH0pLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkNBU0VTX1BBR0UnKSwgX2xpbmsoJ2Nhc2VzLmh0bWwnKSwgeyBzZWxlY3RlZDogdGFiID09PSAnQ0FTRVMnIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSGVhZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9jb2xvcl9jb25zdGFudHMgPSByZXF1aXJlKCcuLi8uLi9jb25zdGFudHMvY29sb3JfY29uc3RhbnRzLmpzb24nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEpvaW5lciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnSm9pbmVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2xvcjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgbGluZVdpZHRoOiBfcmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IF9jb2xvcl9jb25zdGFudHMuRE9NSU5BTlQsXG4gICAgICBsaW5lV2lkdGg6IDRcbiAgICB9O1xuICB9LFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExheW91dE1peGluLCBfYXBlbWFuUmVhY3RNaXhpbnMuQXBQdXJlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgbGF5b3V0cyA9IHMubGF5b3V0cztcbiAgICB2YXIgY29sb3IgPSBwcm9wcy5jb2xvcjtcbiAgICB2YXIgbGluZVdpZHRoID0gcHJvcHMubGluZVdpZHRoO1xuICAgIHZhciBfbGF5b3V0cyRzdmcgPSBsYXlvdXRzLnN2ZztcbiAgICB2YXIgd2lkdGggPSBfbGF5b3V0cyRzdmcud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IF9sYXlvdXRzJHN2Zy5oZWlnaHQ7XG4gICAgdmFyIG1pblggPSAwO1xuICAgIHZhciBtaWRYID0gd2lkdGggLyAyO1xuICAgIHZhciBtYXhYID0gd2lkdGg7XG4gICAgdmFyIG1pblkgPSAwO1xuICAgIHZhciBtaWRZID0gaGVpZ2h0IC8gMjtcbiAgICB2YXIgbWF4WSA9IGhlaWdodDtcblxuICAgIHZhciBfbGluZSA9IGZ1bmN0aW9uIF9saW5lKHgxLCB4MiwgeTEsIHkyKSB7XG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2xpbmUnLCB7IHgxOiB4MSwgeDI6IHgyLCB5MTogeTEsIHkyOiB5MiB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHhUaWx0ID0gMC4xO1xuICAgIHZhciB5VGlsdCA9IDAuMztcblxuICAgIHZhciB4MSA9IG1pblg7XG4gICAgdmFyIHgyID0gbWlkWCAqICgxICsgeFRpbHQpO1xuICAgIHZhciB4MyA9IG1pZFggKiAoMSAtIHhUaWx0KTtcbiAgICB2YXIgeDQgPSBtYXhYO1xuICAgIHZhciB5MSA9IG1pZFk7XG4gICAgdmFyIHkyID0gbWlkWSAqICgxIC0geVRpbHQpO1xuICAgIHZhciB5MyA9IG1pZFkgKiAoMSArIHlUaWx0KTtcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgeyBjbGFzc05hbWU6ICgwLCBfY2xhc3NuYW1lczIuZGVmYXVsdCkoJ2pvaW5lcicsIHByb3BzLmNsYXNzTmFtZSksXG4gICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGpvaW5lcikge1xuICAgICAgICAgIHMuam9pbmVyID0gam9pbmVyO1xuICAgICAgICB9IH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3N2ZycsXG4gICAgICAgIHsgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgIHN0cm9rZTogY29sb3IsXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcDogJ3JvdW5kJyxcbiAgICAgICAgICBzdHJva2VXaWR0aDogbGluZVdpZHRoXG4gICAgICAgIH0sXG4gICAgICAgIF9saW5lKHgxLCB4MiwgeTEsIHkyKSxcbiAgICAgICAgX2xpbmUoeDIsIHgzLCB5MiwgeTMpLFxuICAgICAgICBfbGluZSh4MywgeDQsIHkzLCB5MSlcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gRm9yIEFwTGF5b3V0TWl4aW5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0SW5pdGlhbExheW91dHM6IGZ1bmN0aW9uIGdldEluaXRpYWxMYXlvdXRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdmc6IHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiA0MCB9XG4gICAgfTtcbiAgfSxcbiAgY2FsY0xheW91dHM6IGZ1bmN0aW9uIGNhbGNMYXlvdXRzKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgam9pbmVyID0gcy5qb2luZXI7XG5cbiAgICBpZiAoIWpvaW5lcikge1xuICAgICAgcmV0dXJuIHMuZ2V0SW5pdGlhbExheW91dHMoKTtcbiAgICB9XG5cbiAgICB2YXIgX2pvaW5lciRnZXRCb3VuZGluZ0NsID0gam9pbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdmFyIHdpZHRoID0gX2pvaW5lciRnZXRCb3VuZGluZ0NsLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSBfam9pbmVyJGdldEJvdW5kaW5nQ2wuaGVpZ2h0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN2ZzogeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH1cbiAgICB9O1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSm9pbmVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgTG9nbyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTG9nbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdoMScsXG4gICAgICB7IGNsYXNzTmFtZTogJ2xvZ28nIH0sXG4gICAgICBsKCdsb2dvLkxPR08nKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBMb2dvOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3NnUmVhY3RDb21wb25lbnRzID0gcmVxdWlyZSgnc2ctcmVhY3QtY29tcG9uZW50cycpO1xuXG52YXIgX2NsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBfY2xhc3NuYW1lczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGFzc25hbWVzKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFZpZGVvID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdWaWRlbycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwVG91Y2hNaXhpbl0sXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgd2lkdGg6IF9yZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWDogX3JlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgdHJhbnNsYXRlWTogX3JlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgdHJhbnNsYXRlWCA9IHByb3BzLnRyYW5zbGF0ZVg7XG4gICAgdmFyIHRyYW5zbGF0ZVkgPSBwcm9wcy50cmFuc2xhdGVZO1xuXG4gICAgdmFyIHN0eWxlID0geyB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHRyYW5zbGF0ZVggKyAncHgsICcgKyB0cmFuc2xhdGVZICsgJ3B4KScgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgY2xhc3NOYW1lOiAoMCwgX2NsYXNzbmFtZXMyLmRlZmF1bHQpKCd2aWRlbycsIHByb3BzLmNsYXNzTmFtZSkgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnZGl2JyxcbiAgICAgICAgeyBjbGFzc05hbWU6ICd2aWRlby1pbm5lcicgfSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3NnUmVhY3RDb21wb25lbnRzLlNnVmlkZW8sIHsgc3JjOiBwcm9wcy5zcmMsXG4gICAgICAgICAgc3R5bGU6IHN0eWxlLFxuICAgICAgICAgIHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHByb3BzLmhlaWdodCxcbiAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgIGF1dG9QbGF5OiBmdW5jdGlvbiBhdXRvUGxheShwbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAndmlkZW8tb3ZlcmxheScgfSlcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVmlkZW87IiwiLyoqXG4gKiBWaWV3IGZvciBzaG93Y2FzZVxuICogQGNsYXNzIFNob3djYXNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF92aWRlbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy92aWRlbycpO1xuXG52YXIgX3ZpZGVvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3ZpZGVvKTtcblxudmFyIF9qb2luZXIgPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvam9pbmVyJyk7XG5cbnZhciBfam9pbmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2pvaW5lcik7XG5cbnZhciBfY29sb3JfY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL2NvbG9yX2NvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgU2hvd2Nhc2VWaWV3ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdTaG93Y2FzZVZpZXcnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcblxuICAgIHZhciBfc2VjdGlvbiA9IGZ1bmN0aW9uIF9zZWN0aW9uKG5hbWUsIGNvbmZpZykge1xuICAgICAgdmFyIHRpdGxlID0gY29uZmlnLnRpdGxlO1xuICAgICAgdmFyIHRleHQgPSBjb25maWcudGV4dDtcbiAgICAgIHZhciB2aWRlbzEgPSBjb25maWcudmlkZW8xO1xuICAgICAgdmFyIHZpZGVvMiA9IGNvbmZpZy52aWRlbzI7XG4gICAgICB2YXIgcmV2ZXJzZWQgPSBjb25maWcucmV2ZXJzZWQ7XG5cbiAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uLFxuICAgICAgICB7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXNlY3Rpb24nLFxuICAgICAgICAgIGlkOiAnc2hvd2Nhc2UtJyArIG5hbWUgKyAnLXNlY3Rpb24nLFxuICAgICAgICAgIGtleTogbmFtZSB9LFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25IZWFkZXIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICB0aXRsZVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25Cb2R5LFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdGV4dC1jb250YWluZXInIH0sXG4gICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtZGVzY3JpcHRpb24nIH0sXG4gICAgICAgICAgICAgIFtdLmNvbmNhdCh0ZXh0KS5tYXAoZnVuY3Rpb24gKHRleHQsIGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAncCcsXG4gICAgICAgICAgICAgICAgICB7IGtleTogaSB9LFxuICAgICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS12aWRlby1jb250YWluZXInIH0sXG4gICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfdmlkZW8yLmRlZmF1bHQsIF9leHRlbmRzKHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlkZW8nIH0sIHZpZGVvMSkpLFxuICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2pvaW5lcjIuZGVmYXVsdCwgeyBjbGFzc05hbWU6ICdzaG93Y2FzZS1qb2luZXInLCBjb2xvcjogcmV2ZXJzZWQgPyBfY29sb3JfY29uc3RhbnRzLkRPTUlOQU5UIDogXCJ3aGl0ZVwiIH0pLFxuICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3ZpZGVvMi5kZWZhdWx0LCBfZXh0ZW5kcyh7IGNsYXNzTmFtZTogJ3Nob3djYXNlLXZpZGVvJyB9LCB2aWRlbzIpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlldyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnc2hvd2Nhc2UtdmlldycgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0hlYWRlciwgeyB0aXRsZVRleHQ6IGwoJ3RpdGxlcy5TSE9XQ0FTRV9USVRMRScpIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0JvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICdhcnRpY2xlJyxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFtfc2VjdGlvbigncmVtb3RlJywge1xuICAgICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkNBU0VfUkVNT1RFX1RJVExFJyksXG4gICAgICAgICAgICB0ZXh0OiBsKCdzZWN0aW9ucy5DQVNFX1JFTU9URV9URVhUJyksXG4gICAgICAgICAgICByZXZlcnNlZDogZmFsc2UsXG4gICAgICAgICAgICB2aWRlbzE6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL21vY2stbXA0Lm1wNCcsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0xMjAsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC0zMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZpZGVvMjoge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvbW9jay1tcDQtMi5tcDQnLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVYOiAtNjAsXG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IC00MFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLCBfc2VjdGlvbignc2Vuc2UnLCB7XG4gICAgICAgICAgICB0aXRsZTogbCgnc2VjdGlvbnMuQ0FTRV9TRU5TRV9USVRMRScpLFxuICAgICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuQ0FTRV9TRU5TRV9URVhUJyksXG4gICAgICAgICAgICByZXZlcnNlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZpZGVvMToge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvbW9jay1tcDQubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTYwLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtNjBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2aWRlbzI6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL21vY2stbXA0LTIubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTMwLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksIF9zZWN0aW9uKCd0YWxrJywge1xuICAgICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkNBU0VfVEFMS19USVRMRScpLFxuICAgICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuQ0FTRV9UQUxLX1RFWFQnKSxcbiAgICAgICAgICAgIHJldmVyc2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHZpZGVvMToge1xuICAgICAgICAgICAgICBzcmM6ICd2aWRlb3MvbW9jay1tcDQubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTEwLFxuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAtMTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2aWRlbzI6IHtcbiAgICAgICAgICAgICAgc3JjOiAndmlkZW9zL21vY2stbXA0LTIubXA0JyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLTE0MCxcbiAgICAgICAgICAgICAgdHJhbnNsYXRlWTogLTcwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSldXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG93Y2FzZVZpZXc7IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIkRPTUlOQU5UXCI6IFwiI2Q2YjgxMFwiXG59IiwiLyoqXG4gKiBAY2xhc3MgTGlua1NlcnZpY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLyoqIEBsZW5kcyBMaW5rU2VydmljZSAqL1xuXG52YXIgTGlua1NlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIExpbmtTZXJ2aWNlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaW5rU2VydmljZSk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTGlua1NlcnZpY2UsIFt7XG4gICAga2V5OiAncmVzb2x2ZUh0bWxMaW5rJyxcblxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZSBhIGh0bWwgbGlua1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIEh0bWwgZmlsZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gLSBSZXNvbHZlZCBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZUh0bWxMaW5rKGZpbGVuYW1lKSB7XG4gICAgICB2YXIgcyA9IHRoaXM7XG4gICAgICB2YXIgbGFuZyA9IHMuX2dldExhbmcoKTtcbiAgICAgIHZhciBodG1sRGlyID0gbGFuZyA/ICdodG1sLycgKyBsYW5nIDogJ2h0bWwnO1xuICAgICAgcmV0dXJuIHBhdGguam9pbihodG1sRGlyLCBmaWxlbmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2dldExhbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0TGFuZygpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTEFORztcbiAgICAgIH1cbiAgICAgIHJldHVybiB3aW5kb3cubGFuZztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTGlua1NlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgTGlua1NlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihMaW5rU2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gTGlua1NlcnZpY2U7IiwiLyoqXG4gKiBhcGVtYW4gcmVhY3QgcGFja2FnZSBmb3Igc3dpdGNoIGNvbXBvbmVudHNcbiAqIEBjb25zdHJ1Y3RvciBBcFN3aXRjaFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcbmltcG9ydCB7QXBQdXJlTWl4aW4sIEFwVG91Y2hNaXhpbiwgQXBVVUlETWl4aW59IGZyb20gJ2FwZW1hbi1yZWFjdC1taXhpbnMnXG5cbi8qKiBAbGVuZHMgQXBTd2l0Y2ggKi9cbmNvbnN0IEFwU3dpdGNoID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqIFN3aXRjaCBvbiBvciBub3QgKi9cbiAgICBvbjogdHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIC8qKiBIYW5kbGUgZm9yIHRhcCBldmVudCAqL1xuICAgIG9uVGFwOiB0eXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgLyoqIFRpdGxlIHRleHQgZm9yIG9uIHN0YXRlICovXG4gICAgb25UaXRsZTogdHlwZXMuc3RyaW5nLFxuICAgIC8qKiBUaXRsZSB0ZXh0IGZvciBvZmYgc3RhdGUgKi9cbiAgICBvZmZUaXRsZTogdHlwZXMuc3RyaW5nLFxuICAgIC8qKiBXaWR0aCBvZiBjb21wb25lbnQgKi9cbiAgICB3aWR0aDogdHlwZXMubnVtYmVyXG4gIH0sXG5cbiAgbWl4aW5zOiBbXG4gICAgQXBQdXJlTWl4aW4sXG4gICAgQXBUb3VjaE1peGluLFxuICAgIEFwVVVJRE1peGluXG4gIF0sXG5cbiAgc3RhdGljczoge30sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlICgpIHtcbiAgICByZXR1cm4ge31cbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvbjogZmFsc2UsXG4gICAgICBvblRpdGxlOiAnJyxcbiAgICAgIG9mZlRpdGxlOiAnJ1xuICAgIH1cbiAgfSxcblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG4gICAgbGV0IHsgd2lkdGggfSA9IHByb3BzXG4gICAgbGV0IGlkID0gcHJvcHMuaGFzT3duUHJvcGVydHkoJ2lkJykgPyBwcm9wcy5pZCA6IHMudXVpZFxuICAgIGxldCBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdhcC1zd2l0Y2gnLCB7XG4gICAgICAnYXAtc3dpdGNoLW9uJzogcHJvcHMub24sXG4gICAgICAnYXAtc3dpdGNoLW9mZic6ICFwcm9wcy5vblxuICAgIH0sIHByb3BzLmNsYXNzTmFtZSlcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc05hbWUgfVxuICAgICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe3dpZHRofSwgcHJvcHMuc3R5bGUpIH1cbiAgICAgICAgICAgaWQ9eyBpZCB9XG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXAtc3dpdGNoLWlubmVyXCI+XG4gICAgICAgICAgeyBzLl9yZW5kZXJMYWJlbChgJHtpZH0tcmFkaW8tb2ZmYCwgJ2FwLXN3aXRjaC1vbi1sYWJlbCcsIHByb3BzLm9uVGl0bGUpIH1cbiAgICAgICAgICB7IHMuX3JlbmRlclJhZGlvKGAke2lkfS1yYWRpby1vZmZgLCAnb2ZmJywgIXByb3BzLm9uKX1cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwLXN3aXRjaC1oYW5kbGVcIj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7IHMuX3JlbmRlckxhYmVsKGAke2lkfS1yYWRpby1vbmAsICdhcC1zd2l0Y2gtb2ZmLWxhYmVsJywgcHJvcHMub2ZmVGl0bGUpIH1cbiAgICAgICAgICB7IHMuX3JlbmRlclJhZGlvKGAke2lkfS1yYWRpby1vbmAsICdvbicsICEhcHJvcHMub24pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gTGlmZWN5Y2xlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEN1c3RvbVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICBub29wICgpIHtcblxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBQcml2YXRlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9yZW5kZXJMYWJlbCAoaHRtbEZvciwgY2xhc3NOYW1lLCB0aXRsZSkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcmV0dXJuIChcbiAgICAgIDxsYWJlbCBodG1sRm9yPXsgaHRtbEZvciB9XG4gICAgICAgICAgICAgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnYXAtc3dpdGNoLWxhYmVsJywgY2xhc3NOYW1lKSB9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhcC1zd2l0Y2gtbGFiZWwtdGV4dFwiPnsgdGl0bGUgfTwvc3Bhbj5cbiAgICAgIDwvbGFiZWw+XG4gICAgKVxuICB9LFxuXG4gIF9yZW5kZXJSYWRpbyAoaWQsIHZhbHVlLCBjaGVja2VkKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPXsgaWQgfVxuICAgICAgICAgICAgIHZhbHVlPXsgdmFsdWUgfVxuICAgICAgICAgICAgIGNoZWNrZWQ9eyBjaGVja2VkIH1cbiAgICAgICAgICAgICBvbkNoYW5nZT17IHMubm9vcCB9XG4gICAgICAgICAgICAgY2xhc3NOYW1lPVwiYXAtc3dpdGNoLXJhZGlvXCIvPlxuICAgIClcbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgQXBTd2l0Y2hcbiIsIi8qKlxuICogU3R5bGUgZm9yIEFwU3dpdGNoLlxuICogQGNvbnN0cnVjdG9yIEFwU3dpdGNoU3R5bGVcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7QXBTdHlsZX0gZnJvbSAnYXBlbWFuLXJlYWN0LXN0eWxlJ1xuXG4vKiogQGxlbmRzIEFwU3dpdGNoU3R5bGUgKi9cbmNvbnN0IEFwU3dpdGNoU3R5bGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIHN0eWxlOiB0eXBlcy5vYmplY3QsXG4gICAgaGlnaGxpZ2h0Q29sb3I6IHR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdHlsZToge30sXG4gICAgICBoaWdobGlnaHRDb2xvcjogQXBTdHlsZS5ERUZBVUxUX0hJR0hMSUdIVF9DT0xPUixcbiAgICAgIGJhY2tncm91bmRDb2xvcjogQXBTdHlsZS5ERUZBVUxUX0JBQ0tHUk9VTkRfQ09MT1IsXG4gICAgICBib3JkZXJDb2xvcjogJyNDQ0MnXG4gICAgfVxuICB9LFxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcblxuICAgIGxldCB7IGhpZ2hsaWdodENvbG9yLCBiYWNrZ3JvdW5kQ29sb3IsIGJvcmRlckNvbG9yIH0gPSBwcm9wc1xuICAgIGxldCBoYW5kbGVTaXplID0gMjRcbiAgICBsZXQgdHJhbnNpdGlvbiA9IDQwMFxuICAgIGxldCBtaW5XaWR0aCA9IGhhbmRsZVNpemUgKiAxLjVcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICcuYXAtc3dpdGNoJzoge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLXJhZGlvJzoge1xuICAgICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1sYWJlbCc6IHtcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxuICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICBmbGV4U2hyaW5rOiAxLFxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgdHJhbnNpdGlvbjogYHdpZHRoICR7dHJhbnNpdGlvbn1tc2AsXG4gICAgICAgIGxpbmVIZWlnaHQ6IGAke2hhbmRsZVNpemV9cHhgXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtbGFiZWwtdGV4dCc6IHtcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIHBhZGRpbmc6ICcwIDhweCcsXG4gICAgICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgIG1pbldpZHRoOiBtaW5XaWR0aFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9uLWxhYmVsJzoge1xuICAgICAgICBiYWNrZ3JvdW5kOiBoaWdobGlnaHRDb2xvcixcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgIGJvcmRlclJhZGl1czogYCR7aGFuZGxlU2l6ZSAvIDJ9cHggMCAwICR7aGFuZGxlU2l6ZSAvIDJ9cHhgLFxuICAgICAgICBtYXJnaW5SaWdodDogLTEgKiBoYW5kbGVTaXplIC8gMlxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9mZi1sYWJlbCc6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNGQUZBRkEnLFxuICAgICAgICBjb2xvcjogJyNBQUEnLFxuICAgICAgICBib3JkZXJSYWRpdXM6IGAwICR7aGFuZGxlU2l6ZSAvIDJ9cHggJHtoYW5kbGVTaXplIC8gMn1weCAwYCxcbiAgICAgICAgbWFyZ2luTGVmdDogLTEgKiBoYW5kbGVTaXplIC8gMlxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9uIC5hcC1zd2l0Y2gtb2ZmLWxhYmVsJzoge1xuICAgICAgICB3aWR0aDogYCR7aGFuZGxlU2l6ZSAvIDIgKyAyfXB4ICFpbXBvcnRhbnRgXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb2ZmIC5hcC1zd2l0Y2gtb24tbGFiZWwnOiB7XG4gICAgICAgIHdpZHRoOiBgJHtoYW5kbGVTaXplIC8gMiArIDJ9cHggIWltcG9ydGFudGBcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1pbm5lcic6IHtcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LXN0YXJ0JyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZENvbG9yLFxuICAgICAgICBoZWlnaHQ6IGhhbmRsZVNpemUsXG4gICAgICAgIGJvcmRlclJhZGl1czogKGhhbmRsZVNpemUgLyAyICsgMSksXG4gICAgICAgIG1pbldpZHRoOiBtaW5XaWR0aCxcbiAgICAgICAgYm9yZGVyOiBgMXB4IHNvbGlkICR7Ym9yZGVyQ29sb3J9YCxcbiAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICB3aWR0aDogJzEwMCUnXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtaGFuZGxlJzoge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcbiAgICAgICAgd2lkdGg6IGhhbmRsZVNpemUsXG4gICAgICAgIGhlaWdodDogaGFuZGxlU2l6ZSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICBib3JkZXI6IGAxcHggc29saWQgJHtib3JkZXJDb2xvcn1gLFxuICAgICAgICBmbGV4R3JvdzogMCxcbiAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgIHpJbmRleDogNFxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgc21hbGxNZWRpYURhdGEgPSB7fVxuICAgIGxldCBtZWRpdW1NZWRpYURhdGEgPSB7fVxuICAgIGxldCBsYXJnZU1lZGlhRGF0YSA9IHt9XG4gICAgcmV0dXJuIChcbiAgICAgIDxBcFN0eWxlIGRhdGE9eyBPYmplY3QuYXNzaWduKGRhdGEsIHByb3BzLnN0eWxlKSB9XG4gICAgICAgICAgICAgICBzbWFsbE1lZGlhRGF0YT17IHNtYWxsTWVkaWFEYXRhIH1cbiAgICAgICAgICAgICAgIG1lZGl1bU1lZGlhRGF0YT17IG1lZGl1bU1lZGlhRGF0YSB9XG4gICAgICAgICAgICAgICBsYXJnZU1lZGlhRGF0YT17IGxhcmdlTWVkaWFEYXRhIH1cbiAgICAgID57IHByb3BzLmNoaWxkcmVuIH08L0FwU3R5bGU+XG4gICAgKVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBBcFN3aXRjaFN0eWxlXG4iLCIvKipcbiAqIGFwZW1hbiByZWFjdCBwYWNrYWdlIGZvciBzd2l0Y2ggY29tcG9uZW50c1xuICogQG1vZHVsZSBhcGVtYW4tcmVhY3Qtc3dpdGNoXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmxldCBkID0gKG1vZHVsZSkgPT4gbW9kdWxlLmRlZmF1bHQgfHwgbW9kdWxlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgQXBTd2l0Y2hTdHlsZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vYXBfc3dpdGNoX3N0eWxlJykpIH0sXG4gIGdldCBBcFN3aXRjaCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vYXBfc3dpdGNoJykpIH1cbn1cbiIsIi8qKlxuICogU2V0IGFscGhhIHZhbHVlXG4gKiBAZnVuY3Rpb24gYWxwaGFcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAtIENvbG9yIHZhbHVlLlxuICogQHBhcmFtIHtudW1iZXJ9IEFscGhhIHZhbHVlLiAwLjAwIHRvIDEuMDBcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKVxuXG4vKiogQGxlbmRzIGFscGhhICovXG5mdW5jdGlvbiBhbHBoYSAoY29sb3IsIGFscGhhKSB7XG4gIGNvbG9yID0gcGFyc2UoY29sb3IpXG4gIHJldHVybiBjb2xvci5hbHBoYShhbHBoYSkucmdiYVN0cmluZygpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWxwaGFcbiIsIi8qKlxuICogY29sb3JpemVyIGZ1bmN0aW9uc1xuICogQG1vZHVsZSBjb2xvcml6ZXJzXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmxldCBkID0gKG1vZHVsZSkgPT4gbW9kdWxlLmRlZmF1bHQgfHwgbW9kdWxlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgcm90YXRlQ29sb3JpemVyICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9yb3RhdGVfY29sb3JpemVyJykpIH1cbn1cbiIsIi8qKlxuICogRGVmaW5lIGEgY29sb3JpemVyIHRvIGdlbmVyYXRlIHVuaXF1ZSBjb2xvcnNcbiAqIEBmdW5jdGlvbiByb3RhdGVDb2xvcml6ZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlIC0gQmFzZSBjb2xvciBzdHJpbmdcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn0gLSBHZW5lcmF0ZWQgZnVuY3Rpb25cbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHJvdGF0ZSA9IHJlcXVpcmUoJy4uL3JvdGF0ZScpXG5cbi8qKiBAbGVuZHMgcm90YXRlQ29sb3JpemVyICovXG5mdW5jdGlvbiByb3RhdGVDb2xvcml6ZXIgKGJhc2UpIHtcbiAgbGV0IGNvbG9ycyA9IHt9XG5cbiAgLyoqXG4gICAqIENvbG9yaXplciBmdW5jdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBVbmlxdWUgaWRlbnRpZmllclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb2xvciAtIENvbG9yIGZvciB0aGUgaWRcbiAgICovXG4gIGZ1bmN0aW9uIGNvbG9yaXplciAoaWQpIHtcbiAgICBsZXQgY29sb3IgPSBjb2xvcnNbIGlkIF1cbiAgICBpZiAoY29sb3IpIHtcbiAgICAgIHJldHVybiBjb2xvclxuICAgIH1cbiAgICBsZXQga25vd25Db2xvcnMgPSBPYmplY3Qua2V5cyhjb2xvcnMpLm1hcCgoaWQpID0+IGNvbG9yc1sgaWQgXSlcbiAgICBkbyB7XG4gICAgICBjb2xvciA9IHJvdGF0ZShiYXNlLCBwYXJzZUludChNYXRoLnJhbmRvbSgpICogMzYwLjApKVxuICAgICAgaWYgKGtub3duQ29sb3JzLmxlbmd0aCA+PSAzNjApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9IHdoaWxlICh+a25vd25Db2xvcnMuaW5kZXhPZihjb2xvcikpXG4gICAgY29sb3JzWyBpZCBdID0gY29sb3JcbiAgICByZXR1cm4gY29sb3JcbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oY29sb3JpemVyLCB7IGJhc2UsIGNvbG9ycyB9KVxuICByZXR1cm4gY29sb3JpemVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gcm90YXRlQ29sb3JpemVyXG4iLCIvKipcbiAqIENvbG9yIHV0aWxpdHkuXG4gKiBAbW9kdWxlIGFwZW1hbmNvbG9yXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmxldCBkID0gKG1vZHVsZSkgPT4gbW9kdWxlLmRlZmF1bHQgfHwgbW9kdWxlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgYWxwaGEgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2FscGhhJykpIH0sXG4gIGdldCBjb2xvcml6ZXJzICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9jb2xvcml6ZXJzJykpIH0sXG4gIGdldCBpc0RhcmsgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2lzX2RhcmsnKSkgfSxcbiAgZ2V0IGlzTGlnaHQgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2lzX2xpZ2h0JykpIH0sXG4gIGdldCBtaXggKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL21peCcpKSB9LFxuICBnZXQgcGFyc2UgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3BhcnNlJykpIH0sXG4gIGdldCByb3RhdGUgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3JvdGF0ZScpKSB9XG59XG4iLCIvKipcbiAqIERldGVjdCBkYXJrIG9yIG5vdFxuICogQGZ1bmN0aW9uIGlzRGFya1xuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIC0gQ29sb3IgdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJylcbmZ1bmN0aW9uIGlzRGFyayAoY29sb3IpIHtcbiAgbGV0IHsgciwgZywgYiB9ID0gcGFyc2UoY29sb3IpLnJnYigpXG4gIHJldHVybiAociAqIDAuMjk5ICsgZyAqIDAuNTg3ICsgYiAqIDAuMTE0KSA8IDE4NlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRGFya1xuIiwiLyoqXG4gKiBEZXRlY3QgbGlnaHQgb3Igbm90XG4gKiBAZnVuY3Rpb24gaXNMaWdodFxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIC0gQ29sb3IgdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgaXNEYXJrID0gcmVxdWlyZSgnLi9pc19kYXJrJylcbmZ1bmN0aW9uIGlzTGlnaHQgKGNvbG9yKSB7XG4gIHJldHVybiAhaXNEYXJrKGNvbG9yKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGlnaHRcbiIsIi8qKlxuICogbWl4IGNvbG9yc1xuICogQGZ1bmN0aW9uIG1peFxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yMSAtIENvbG9yIHZhbHVlLlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yMiAtIENvbG9yIHZhbHVlLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpXG5cbi8qKiBAbGVuZHMgbWl4ICovXG5mdW5jdGlvbiBtaXggKGNvbG9yMSwgY29sb3IyKSB7XG4gIHJldHVybiBwYXJzZShjb2xvcjEpLm1peChwYXJzZShjb2xvcjIpKS5yZ2JhU3RyaW5nKClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtaXhcbiIsIi8qKlxuICogUGFyc2UgYSBjb2xvclxuICogQGZ1bmN0aW9uIHBhcnNlXG4gKiBAcGFyYW0ge3ZhbHVlfSAtIENvbG9yIHZhbHVlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIFBhcnNlZCBjb2xvciBpbnN0YW5jZS5cbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGNvbG9yID0gcmVxdWlyZSgnY29sb3InKVxuXG4vKiogQGxlbmRzIHBhcnNlICovXG5mdW5jdGlvbiBwYXJzZSAodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignW2FwZW1hbmNvbG9yXSBWYWx1ZSBpcyByZXF1aXJlZC4nKVxuICB9XG4gIGxldCBwYXJzZWQgPSBjb2xvcih2YWx1ZSlcbiAgaWYgKCFwYXJzZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29sb3I6ICR7dmFsdWV9YClcbiAgfVxuICByZXR1cm4gcGFyc2VkXG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VcbiIsIi8qKlxuICogcm90YXRlIGNvbG9yXG4gKiBAZnVuY3Rpb24gcm90YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBDb2xvciB2YWx1ZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWdyZWUgdG8gcm90YXRlLiAwIHRvIDM2MFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpXG5cbi8qKiBAbGVuZHMgcm90YXRlICovXG5mdW5jdGlvbiByb3RhdGUgKGNvbG9yLCBkZWdyZWUpIHtcbiAgY29sb3IgPSBwYXJzZShjb2xvcilcbiAgcmV0dXJuIGNvbG9yLmh1ZShjb2xvci5odWUoKSArIE51bWJlcihkZWdyZWUpKS5yZ2JhU3RyaW5nKClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByb3RhdGVcbiIsIi8qIE1JVCBsaWNlbnNlICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZ2IyaHNsOiByZ2IyaHNsLFxuICByZ2IyaHN2OiByZ2IyaHN2LFxuICByZ2IyaHdiOiByZ2IyaHdiLFxuICByZ2IyY215azogcmdiMmNteWssXG4gIHJnYjJrZXl3b3JkOiByZ2Iya2V5d29yZCxcbiAgcmdiMnh5ejogcmdiMnh5eixcbiAgcmdiMmxhYjogcmdiMmxhYixcbiAgcmdiMmxjaDogcmdiMmxjaCxcblxuICBoc2wycmdiOiBoc2wycmdiLFxuICBoc2wyaHN2OiBoc2wyaHN2LFxuICBoc2wyaHdiOiBoc2wyaHdiLFxuICBoc2wyY215azogaHNsMmNteWssXG4gIGhzbDJrZXl3b3JkOiBoc2wya2V5d29yZCxcblxuICBoc3YycmdiOiBoc3YycmdiLFxuICBoc3YyaHNsOiBoc3YyaHNsLFxuICBoc3YyaHdiOiBoc3YyaHdiLFxuICBoc3YyY215azogaHN2MmNteWssXG4gIGhzdjJrZXl3b3JkOiBoc3Yya2V5d29yZCxcblxuICBod2IycmdiOiBod2IycmdiLFxuICBod2IyaHNsOiBod2IyaHNsLFxuICBod2IyaHN2OiBod2IyaHN2LFxuICBod2IyY215azogaHdiMmNteWssXG4gIGh3YjJrZXl3b3JkOiBod2Iya2V5d29yZCxcblxuICBjbXlrMnJnYjogY215azJyZ2IsXG4gIGNteWsyaHNsOiBjbXlrMmhzbCxcbiAgY215azJoc3Y6IGNteWsyaHN2LFxuICBjbXlrMmh3YjogY215azJod2IsXG4gIGNteWsya2V5d29yZDogY215azJrZXl3b3JkLFxuXG4gIGtleXdvcmQycmdiOiBrZXl3b3JkMnJnYixcbiAga2V5d29yZDJoc2w6IGtleXdvcmQyaHNsLFxuICBrZXl3b3JkMmhzdjoga2V5d29yZDJoc3YsXG4gIGtleXdvcmQyaHdiOiBrZXl3b3JkMmh3YixcbiAga2V5d29yZDJjbXlrOiBrZXl3b3JkMmNteWssXG4gIGtleXdvcmQybGFiOiBrZXl3b3JkMmxhYixcbiAga2V5d29yZDJ4eXo6IGtleXdvcmQyeHl6LFxuXG4gIHh5ejJyZ2I6IHh5ejJyZ2IsXG4gIHh5ejJsYWI6IHh5ejJsYWIsXG4gIHh5ejJsY2g6IHh5ejJsY2gsXG5cbiAgbGFiMnh5ejogbGFiMnh5eixcbiAgbGFiMnJnYjogbGFiMnJnYixcbiAgbGFiMmxjaDogbGFiMmxjaCxcblxuICBsY2gybGFiOiBsY2gybGFiLFxuICBsY2gyeHl6OiBsY2gyeHl6LFxuICBsY2gycmdiOiBsY2gycmdiXG59XG5cblxuZnVuY3Rpb24gcmdiMmhzbChyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0vMjU1LFxuICAgICAgZyA9IHJnYlsxXS8yNTUsXG4gICAgICBiID0gcmdiWzJdLzI1NSxcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBkZWx0YSA9IG1heCAtIG1pbixcbiAgICAgIGgsIHMsIGw7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgaCA9IDA7XG4gIGVsc2UgaWYgKHIgPT0gbWF4KVxuICAgIGggPSAoZyAtIGIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuICBlbHNlIGlmIChiID09IG1heClcbiAgICBoID0gNCArIChyIC0gZykvIGRlbHRhO1xuXG4gIGggPSBNYXRoLm1pbihoICogNjAsIDM2MCk7XG5cbiAgaWYgKGggPCAwKVxuICAgIGggKz0gMzYwO1xuXG4gIGwgPSAobWluICsgbWF4KSAvIDI7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgcyA9IDA7XG4gIGVsc2UgaWYgKGwgPD0gMC41KVxuICAgIHMgPSBkZWx0YSAvIChtYXggKyBtaW4pO1xuICBlbHNlXG4gICAgcyA9IGRlbHRhIC8gKDIgLSBtYXggLSBtaW4pO1xuXG4gIHJldHVybiBbaCwgcyAqIDEwMCwgbCAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJoc3YocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLFxuICAgICAgZyA9IHJnYlsxXSxcbiAgICAgIGIgPSByZ2JbMl0sXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgZGVsdGEgPSBtYXggLSBtaW4sXG4gICAgICBoLCBzLCB2O1xuXG4gIGlmIChtYXggPT0gMClcbiAgICBzID0gMDtcbiAgZWxzZVxuICAgIHMgPSAoZGVsdGEvbWF4ICogMTAwMCkvMTA7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgaCA9IDA7XG4gIGVsc2UgaWYgKHIgPT0gbWF4KVxuICAgIGggPSAoZyAtIGIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuICBlbHNlIGlmIChiID09IG1heClcbiAgICBoID0gNCArIChyIC0gZykgLyBkZWx0YTtcblxuICBoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG4gIGlmIChoIDwgMClcbiAgICBoICs9IDM2MDtcblxuICB2ID0gKChtYXggLyAyNTUpICogMTAwMCkgLyAxMDtcblxuICByZXR1cm4gW2gsIHMsIHZdO1xufVxuXG5mdW5jdGlvbiByZ2IyaHdiKHJnYikge1xuICB2YXIgciA9IHJnYlswXSxcbiAgICAgIGcgPSByZ2JbMV0sXG4gICAgICBiID0gcmdiWzJdLFxuICAgICAgaCA9IHJnYjJoc2wocmdiKVswXSxcbiAgICAgIHcgPSAxLzI1NSAqIE1hdGgubWluKHIsIE1hdGgubWluKGcsIGIpKSxcbiAgICAgIGIgPSAxIC0gMS8yNTUgKiBNYXRoLm1heChyLCBNYXRoLm1heChnLCBiKSk7XG5cbiAgcmV0dXJuIFtoLCB3ICogMTAwLCBiICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmNteWsocmdiKSB7XG4gIHZhciByID0gcmdiWzBdIC8gMjU1LFxuICAgICAgZyA9IHJnYlsxXSAvIDI1NSxcbiAgICAgIGIgPSByZ2JbMl0gLyAyNTUsXG4gICAgICBjLCBtLCB5LCBrO1xuXG4gIGsgPSBNYXRoLm1pbigxIC0gciwgMSAtIGcsIDEgLSBiKTtcbiAgYyA9ICgxIC0gciAtIGspIC8gKDEgLSBrKSB8fCAwO1xuICBtID0gKDEgLSBnIC0gaykgLyAoMSAtIGspIHx8IDA7XG4gIHkgPSAoMSAtIGIgLSBrKSAvICgxIC0gaykgfHwgMDtcbiAgcmV0dXJuIFtjICogMTAwLCBtICogMTAwLCB5ICogMTAwLCBrICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmtleXdvcmQocmdiKSB7XG4gIHJldHVybiByZXZlcnNlS2V5d29yZHNbSlNPTi5zdHJpbmdpZnkocmdiKV07XG59XG5cbmZ1bmN0aW9uIHJnYjJ4eXoocmdiKSB7XG4gIHZhciByID0gcmdiWzBdIC8gMjU1LFxuICAgICAgZyA9IHJnYlsxXSAvIDI1NSxcbiAgICAgIGIgPSByZ2JbMl0gLyAyNTU7XG5cbiAgLy8gYXNzdW1lIHNSR0JcbiAgciA9IHIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChyICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKHIgLyAxMi45Mik7XG4gIGcgPSBnID4gMC4wNDA0NSA/IE1hdGgucG93KCgoZyArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChnIC8gMTIuOTIpO1xuICBiID0gYiA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoYiAvIDEyLjkyKTtcblxuICB2YXIgeCA9IChyICogMC40MTI0KSArIChnICogMC4zNTc2KSArIChiICogMC4xODA1KTtcbiAgdmFyIHkgPSAociAqIDAuMjEyNikgKyAoZyAqIDAuNzE1MikgKyAoYiAqIDAuMDcyMik7XG4gIHZhciB6ID0gKHIgKiAwLjAxOTMpICsgKGcgKiAwLjExOTIpICsgKGIgKiAwLjk1MDUpO1xuXG4gIHJldHVybiBbeCAqIDEwMCwgeSAqMTAwLCB6ICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmxhYihyZ2IpIHtcbiAgdmFyIHh5eiA9IHJnYjJ4eXoocmdiKSxcbiAgICAgICAgeCA9IHh5elswXSxcbiAgICAgICAgeSA9IHh5elsxXSxcbiAgICAgICAgeiA9IHh5elsyXSxcbiAgICAgICAgbCwgYSwgYjtcblxuICB4IC89IDk1LjA0NztcbiAgeSAvPSAxMDA7XG4gIHogLz0gMTA4Ljg4MztcblxuICB4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMS8zKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcbiAgeSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEvMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG4gIHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxLzMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG4gIGwgPSAoMTE2ICogeSkgLSAxNjtcbiAgYSA9IDUwMCAqICh4IC0geSk7XG4gIGIgPSAyMDAgKiAoeSAtIHopO1xuXG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIHJnYjJsY2goYXJncykge1xuICByZXR1cm4gbGFiMmxjaChyZ2IybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHNsMnJnYihoc2wpIHtcbiAgdmFyIGggPSBoc2xbMF0gLyAzNjAsXG4gICAgICBzID0gaHNsWzFdIC8gMTAwLFxuICAgICAgbCA9IGhzbFsyXSAvIDEwMCxcbiAgICAgIHQxLCB0MiwgdDMsIHJnYiwgdmFsO1xuXG4gIGlmIChzID09IDApIHtcbiAgICB2YWwgPSBsICogMjU1O1xuICAgIHJldHVybiBbdmFsLCB2YWwsIHZhbF07XG4gIH1cblxuICBpZiAobCA8IDAuNSlcbiAgICB0MiA9IGwgKiAoMSArIHMpO1xuICBlbHNlXG4gICAgdDIgPSBsICsgcyAtIGwgKiBzO1xuICB0MSA9IDIgKiBsIC0gdDI7XG5cbiAgcmdiID0gWzAsIDAsIDBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIHQzID0gaCArIDEgLyAzICogLSAoaSAtIDEpO1xuICAgIHQzIDwgMCAmJiB0MysrO1xuICAgIHQzID4gMSAmJiB0My0tO1xuXG4gICAgaWYgKDYgKiB0MyA8IDEpXG4gICAgICB2YWwgPSB0MSArICh0MiAtIHQxKSAqIDYgKiB0MztcbiAgICBlbHNlIGlmICgyICogdDMgPCAxKVxuICAgICAgdmFsID0gdDI7XG4gICAgZWxzZSBpZiAoMyAqIHQzIDwgMilcbiAgICAgIHZhbCA9IHQxICsgKHQyIC0gdDEpICogKDIgLyAzIC0gdDMpICogNjtcbiAgICBlbHNlXG4gICAgICB2YWwgPSB0MTtcblxuICAgIHJnYltpXSA9IHZhbCAqIDI1NTtcbiAgfVxuXG4gIHJldHVybiByZ2I7XG59XG5cbmZ1bmN0aW9uIGhzbDJoc3YoaHNsKSB7XG4gIHZhciBoID0gaHNsWzBdLFxuICAgICAgcyA9IGhzbFsxXSAvIDEwMCxcbiAgICAgIGwgPSBoc2xbMl0gLyAxMDAsXG4gICAgICBzdiwgdjtcblxuICBpZihsID09PSAwKSB7XG4gICAgICAvLyBubyBuZWVkIHRvIGRvIGNhbGMgb24gYmxhY2tcbiAgICAgIC8vIGFsc28gYXZvaWRzIGRpdmlkZSBieSAwIGVycm9yXG4gICAgICByZXR1cm4gWzAsIDAsIDBdO1xuICB9XG5cbiAgbCAqPSAyO1xuICBzICo9IChsIDw9IDEpID8gbCA6IDIgLSBsO1xuICB2ID0gKGwgKyBzKSAvIDI7XG4gIHN2ID0gKDIgKiBzKSAvIChsICsgcyk7XG4gIHJldHVybiBbaCwgc3YgKiAxMDAsIHYgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiBoc2wyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoaHNsMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGhzbDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc2wya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChoc2wycmdiKGFyZ3MpKTtcbn1cblxuXG5mdW5jdGlvbiBoc3YycmdiKGhzdikge1xuICB2YXIgaCA9IGhzdlswXSAvIDYwLFxuICAgICAgcyA9IGhzdlsxXSAvIDEwMCxcbiAgICAgIHYgPSBoc3ZbMl0gLyAxMDAsXG4gICAgICBoaSA9IE1hdGguZmxvb3IoaCkgJSA2O1xuXG4gIHZhciBmID0gaCAtIE1hdGguZmxvb3IoaCksXG4gICAgICBwID0gMjU1ICogdiAqICgxIC0gcyksXG4gICAgICBxID0gMjU1ICogdiAqICgxIC0gKHMgKiBmKSksXG4gICAgICB0ID0gMjU1ICogdiAqICgxIC0gKHMgKiAoMSAtIGYpKSksXG4gICAgICB2ID0gMjU1ICogdjtcblxuICBzd2l0Y2goaGkpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gW3YsIHQsIHBdO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBbcSwgdiwgcF07XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIFtwLCB2LCB0XTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gW3AsIHEsIHZdO1xuICAgIGNhc2UgNDpcbiAgICAgIHJldHVybiBbdCwgcCwgdl07XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIFt2LCBwLCBxXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoc3YyaHNsKGhzdikge1xuICB2YXIgaCA9IGhzdlswXSxcbiAgICAgIHMgPSBoc3ZbMV0gLyAxMDAsXG4gICAgICB2ID0gaHN2WzJdIC8gMTAwLFxuICAgICAgc2wsIGw7XG5cbiAgbCA9ICgyIC0gcykgKiB2O1xuICBzbCA9IHMgKiB2O1xuICBzbCAvPSAobCA8PSAxKSA/IGwgOiAyIC0gbDtcbiAgc2wgPSBzbCB8fCAwO1xuICBsIC89IDI7XG4gIHJldHVybiBbaCwgc2wgKiAxMDAsIGwgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiBoc3YyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoaHN2MnJnYihhcmdzKSlcbn1cblxuZnVuY3Rpb24gaHN2MmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHN2MnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzdjJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGhzdjJyZ2IoYXJncykpO1xufVxuXG4vLyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtY29sb3IvI2h3Yi10by1yZ2JcbmZ1bmN0aW9uIGh3YjJyZ2IoaHdiKSB7XG4gIHZhciBoID0gaHdiWzBdIC8gMzYwLFxuICAgICAgd2ggPSBod2JbMV0gLyAxMDAsXG4gICAgICBibCA9IGh3YlsyXSAvIDEwMCxcbiAgICAgIHJhdGlvID0gd2ggKyBibCxcbiAgICAgIGksIHYsIGYsIG47XG5cbiAgLy8gd2ggKyBibCBjYW50IGJlID4gMVxuICBpZiAocmF0aW8gPiAxKSB7XG4gICAgd2ggLz0gcmF0aW87XG4gICAgYmwgLz0gcmF0aW87XG4gIH1cblxuICBpID0gTWF0aC5mbG9vcig2ICogaCk7XG4gIHYgPSAxIC0gYmw7XG4gIGYgPSA2ICogaCAtIGk7XG4gIGlmICgoaSAmIDB4MDEpICE9IDApIHtcbiAgICBmID0gMSAtIGY7XG4gIH1cbiAgbiA9IHdoICsgZiAqICh2IC0gd2gpOyAgLy8gbGluZWFyIGludGVycG9sYXRpb25cblxuICBzd2l0Y2ggKGkpIHtcbiAgICBkZWZhdWx0OlxuICAgIGNhc2UgNjpcbiAgICBjYXNlIDA6IHIgPSB2OyBnID0gbjsgYiA9IHdoOyBicmVhaztcbiAgICBjYXNlIDE6IHIgPSBuOyBnID0gdjsgYiA9IHdoOyBicmVhaztcbiAgICBjYXNlIDI6IHIgPSB3aDsgZyA9IHY7IGIgPSBuOyBicmVhaztcbiAgICBjYXNlIDM6IHIgPSB3aDsgZyA9IG47IGIgPSB2OyBicmVhaztcbiAgICBjYXNlIDQ6IHIgPSBuOyBnID0gd2g7IGIgPSB2OyBicmVhaztcbiAgICBjYXNlIDU6IHIgPSB2OyBnID0gd2g7IGIgPSBuOyBicmVhaztcbiAgfVxuXG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIGh3YjJoc2woYXJncykge1xuICByZXR1cm4gcmdiMmhzbChod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBod2IyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsycmdiKGNteWspIHtcbiAgdmFyIGMgPSBjbXlrWzBdIC8gMTAwLFxuICAgICAgbSA9IGNteWtbMV0gLyAxMDAsXG4gICAgICB5ID0gY215a1syXSAvIDEwMCxcbiAgICAgIGsgPSBjbXlrWzNdIC8gMTAwLFxuICAgICAgciwgZywgYjtcblxuICByID0gMSAtIE1hdGgubWluKDEsIGMgKiAoMSAtIGspICsgayk7XG4gIGcgPSAxIC0gTWF0aC5taW4oMSwgbSAqICgxIC0gaykgKyBrKTtcbiAgYiA9IDEgLSBNYXRoLm1pbigxLCB5ICogKDEgLSBrKSArIGspO1xuICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufVxuXG5mdW5jdGlvbiBjbXlrMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihjbXlrMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoY215azJyZ2IoYXJncykpO1xufVxuXG5cbmZ1bmN0aW9uIHh5ejJyZ2IoeHl6KSB7XG4gIHZhciB4ID0geHl6WzBdIC8gMTAwLFxuICAgICAgeSA9IHh5elsxXSAvIDEwMCxcbiAgICAgIHogPSB4eXpbMl0gLyAxMDAsXG4gICAgICByLCBnLCBiO1xuXG4gIHIgPSAoeCAqIDMuMjQwNikgKyAoeSAqIC0xLjUzNzIpICsgKHogKiAtMC40OTg2KTtcbiAgZyA9ICh4ICogLTAuOTY4OSkgKyAoeSAqIDEuODc1OCkgKyAoeiAqIDAuMDQxNSk7XG4gIGIgPSAoeCAqIDAuMDU1NykgKyAoeSAqIC0wLjIwNDApICsgKHogKiAxLjA1NzApO1xuXG4gIC8vIGFzc3VtZSBzUkdCXG4gIHIgPSByID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KHIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiByID0gKHIgKiAxMi45Mik7XG5cbiAgZyA9IGcgPiAwLjAwMzEzMDggPyAoKDEuMDU1ICogTWF0aC5wb3coZywgMS4wIC8gMi40KSkgLSAwLjA1NSlcbiAgICA6IGcgPSAoZyAqIDEyLjkyKTtcblxuICBiID0gYiA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhiLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogYiA9IChiICogMTIuOTIpO1xuXG4gIHIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCByKSwgMSk7XG4gIGcgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnKSwgMSk7XG4gIGIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBiKSwgMSk7XG5cbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24geHl6MmxhYih4eXopIHtcbiAgdmFyIHggPSB4eXpbMF0sXG4gICAgICB5ID0geHl6WzFdLFxuICAgICAgeiA9IHh5elsyXSxcbiAgICAgIGwsIGEsIGI7XG5cbiAgeCAvPSA5NS4wNDc7XG4gIHkgLz0gMTAwO1xuICB6IC89IDEwOC44ODM7XG5cbiAgeCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEvMykgOiAoNy43ODcgKiB4KSArICgxNiAvIDExNik7XG4gIHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxLzMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuICB6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMS8zKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuICBsID0gKDExNiAqIHkpIC0gMTY7XG4gIGEgPSA1MDAgKiAoeCAtIHkpO1xuICBiID0gMjAwICogKHkgLSB6KTtcblxuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiB4eXoybGNoKGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJsY2goeHl6MmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxhYjJ4eXoobGFiKSB7XG4gIHZhciBsID0gbGFiWzBdLFxuICAgICAgYSA9IGxhYlsxXSxcbiAgICAgIGIgPSBsYWJbMl0sXG4gICAgICB4LCB5LCB6LCB5MjtcblxuICBpZiAobCA8PSA4KSB7XG4gICAgeSA9IChsICogMTAwKSAvIDkwMy4zO1xuICAgIHkyID0gKDcuNzg3ICogKHkgLyAxMDApKSArICgxNiAvIDExNik7XG4gIH0gZWxzZSB7XG4gICAgeSA9IDEwMCAqIE1hdGgucG93KChsICsgMTYpIC8gMTE2LCAzKTtcbiAgICB5MiA9IE1hdGgucG93KHkgLyAxMDAsIDEvMyk7XG4gIH1cblxuICB4ID0geCAvIDk1LjA0NyA8PSAwLjAwODg1NiA/IHggPSAoOTUuMDQ3ICogKChhIC8gNTAwKSArIHkyIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiA5NS4wNDcgKiBNYXRoLnBvdygoYSAvIDUwMCkgKyB5MiwgMyk7XG5cbiAgeiA9IHogLyAxMDguODgzIDw9IDAuMDA4ODU5ID8geiA9ICgxMDguODgzICogKHkyIC0gKGIgLyAyMDApIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiAxMDguODgzICogTWF0aC5wb3coeTIgLSAoYiAvIDIwMCksIDMpO1xuXG4gIHJldHVybiBbeCwgeSwgel07XG59XG5cbmZ1bmN0aW9uIGxhYjJsY2gobGFiKSB7XG4gIHZhciBsID0gbGFiWzBdLFxuICAgICAgYSA9IGxhYlsxXSxcbiAgICAgIGIgPSBsYWJbMl0sXG4gICAgICBociwgaCwgYztcblxuICBociA9IE1hdGguYXRhbjIoYiwgYSk7XG4gIGggPSBociAqIDM2MCAvIDIgLyBNYXRoLlBJO1xuICBpZiAoaCA8IDApIHtcbiAgICBoICs9IDM2MDtcbiAgfVxuICBjID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpO1xuICByZXR1cm4gW2wsIGMsIGhdO1xufVxuXG5mdW5jdGlvbiBsYWIycmdiKGFyZ3MpIHtcbiAgcmV0dXJuIHh5ejJyZ2IobGFiMnh5eihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxjaDJsYWIobGNoKSB7XG4gIHZhciBsID0gbGNoWzBdLFxuICAgICAgYyA9IGxjaFsxXSxcbiAgICAgIGggPSBsY2hbMl0sXG4gICAgICBhLCBiLCBocjtcblxuICBociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcbiAgYSA9IGMgKiBNYXRoLmNvcyhocik7XG4gIGIgPSBjICogTWF0aC5zaW4oaHIpO1xuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiBsY2gyeHl6KGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJ4eXoobGNoMmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxjaDJyZ2IoYXJncykge1xuICByZXR1cm4gbGFiMnJnYihsY2gybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJyZ2Ioa2V5d29yZCkge1xuICByZXR1cm4gY3NzS2V5d29yZHNba2V5d29yZF07XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3YihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQybGFiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJsYWIoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMnh5eihhcmdzKSB7XG4gIHJldHVybiByZ2IyeHl6KGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxudmFyIGNzc0tleXdvcmRzID0ge1xuICBhbGljZWJsdWU6ICBbMjQwLDI0OCwyNTVdLFxuICBhbnRpcXVld2hpdGU6IFsyNTAsMjM1LDIxNV0sXG4gIGFxdWE6IFswLDI1NSwyNTVdLFxuICBhcXVhbWFyaW5lOiBbMTI3LDI1NSwyMTJdLFxuICBhenVyZTogIFsyNDAsMjU1LDI1NV0sXG4gIGJlaWdlOiAgWzI0NSwyNDUsMjIwXSxcbiAgYmlzcXVlOiBbMjU1LDIyOCwxOTZdLFxuICBibGFjazogIFswLDAsMF0sXG4gIGJsYW5jaGVkYWxtb25kOiBbMjU1LDIzNSwyMDVdLFxuICBibHVlOiBbMCwwLDI1NV0sXG4gIGJsdWV2aW9sZXQ6IFsxMzgsNDMsMjI2XSxcbiAgYnJvd246ICBbMTY1LDQyLDQyXSxcbiAgYnVybHl3b29kOiAgWzIyMiwxODQsMTM1XSxcbiAgY2FkZXRibHVlOiAgWzk1LDE1OCwxNjBdLFxuICBjaGFydHJldXNlOiBbMTI3LDI1NSwwXSxcbiAgY2hvY29sYXRlOiAgWzIxMCwxMDUsMzBdLFxuICBjb3JhbDogIFsyNTUsMTI3LDgwXSxcbiAgY29ybmZsb3dlcmJsdWU6IFsxMDAsMTQ5LDIzN10sXG4gIGNvcm5zaWxrOiBbMjU1LDI0OCwyMjBdLFxuICBjcmltc29uOiAgWzIyMCwyMCw2MF0sXG4gIGN5YW46IFswLDI1NSwyNTVdLFxuICBkYXJrYmx1ZTogWzAsMCwxMzldLFxuICBkYXJrY3lhbjogWzAsMTM5LDEzOV0sXG4gIGRhcmtnb2xkZW5yb2Q6ICBbMTg0LDEzNCwxMV0sXG4gIGRhcmtncmF5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJrZ3JlZW46ICBbMCwxMDAsMF0sXG4gIGRhcmtncmV5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJra2hha2k6ICBbMTg5LDE4MywxMDddLFxuICBkYXJrbWFnZW50YTogIFsxMzksMCwxMzldLFxuICBkYXJrb2xpdmVncmVlbjogWzg1LDEwNyw0N10sXG4gIGRhcmtvcmFuZ2U6IFsyNTUsMTQwLDBdLFxuICBkYXJrb3JjaGlkOiBbMTUzLDUwLDIwNF0sXG4gIGRhcmtyZWQ6ICBbMTM5LDAsMF0sXG4gIGRhcmtzYWxtb246IFsyMzMsMTUwLDEyMl0sXG4gIGRhcmtzZWFncmVlbjogWzE0MywxODgsMTQzXSxcbiAgZGFya3NsYXRlYmx1ZTogIFs3Miw2MSwxMzldLFxuICBkYXJrc2xhdGVncmF5OiAgWzQ3LDc5LDc5XSxcbiAgZGFya3NsYXRlZ3JleTogIFs0Nyw3OSw3OV0sXG4gIGRhcmt0dXJxdW9pc2U6ICBbMCwyMDYsMjA5XSxcbiAgZGFya3Zpb2xldDogWzE0OCwwLDIxMV0sXG4gIGRlZXBwaW5rOiBbMjU1LDIwLDE0N10sXG4gIGRlZXBza3libHVlOiAgWzAsMTkxLDI1NV0sXG4gIGRpbWdyYXk6ICBbMTA1LDEwNSwxMDVdLFxuICBkaW1ncmV5OiAgWzEwNSwxMDUsMTA1XSxcbiAgZG9kZ2VyYmx1ZTogWzMwLDE0NCwyNTVdLFxuICBmaXJlYnJpY2s6ICBbMTc4LDM0LDM0XSxcbiAgZmxvcmFsd2hpdGU6ICBbMjU1LDI1MCwyNDBdLFxuICBmb3Jlc3RncmVlbjogIFszNCwxMzksMzRdLFxuICBmdWNoc2lhOiAgWzI1NSwwLDI1NV0sXG4gIGdhaW5zYm9ybzogIFsyMjAsMjIwLDIyMF0sXG4gIGdob3N0d2hpdGU6IFsyNDgsMjQ4LDI1NV0sXG4gIGdvbGQ6IFsyNTUsMjE1LDBdLFxuICBnb2xkZW5yb2Q6ICBbMjE4LDE2NSwzMl0sXG4gIGdyYXk6IFsxMjgsMTI4LDEyOF0sXG4gIGdyZWVuOiAgWzAsMTI4LDBdLFxuICBncmVlbnllbGxvdzogIFsxNzMsMjU1LDQ3XSxcbiAgZ3JleTogWzEyOCwxMjgsMTI4XSxcbiAgaG9uZXlkZXc6IFsyNDAsMjU1LDI0MF0sXG4gIGhvdHBpbms6ICBbMjU1LDEwNSwxODBdLFxuICBpbmRpYW5yZWQ6ICBbMjA1LDkyLDkyXSxcbiAgaW5kaWdvOiBbNzUsMCwxMzBdLFxuICBpdm9yeTogIFsyNTUsMjU1LDI0MF0sXG4gIGtoYWtpOiAgWzI0MCwyMzAsMTQwXSxcbiAgbGF2ZW5kZXI6IFsyMzAsMjMwLDI1MF0sXG4gIGxhdmVuZGVyYmx1c2g6ICBbMjU1LDI0MCwyNDVdLFxuICBsYXduZ3JlZW46ICBbMTI0LDI1MiwwXSxcbiAgbGVtb25jaGlmZm9uOiBbMjU1LDI1MCwyMDVdLFxuICBsaWdodGJsdWU6ICBbMTczLDIxNiwyMzBdLFxuICBsaWdodGNvcmFsOiBbMjQwLDEyOCwxMjhdLFxuICBsaWdodGN5YW46ICBbMjI0LDI1NSwyNTVdLFxuICBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwyNTAsMjEwXSxcbiAgbGlnaHRncmF5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRncmVlbjogWzE0NCwyMzgsMTQ0XSxcbiAgbGlnaHRncmV5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRwaW5rOiAgWzI1NSwxODIsMTkzXSxcbiAgbGlnaHRzYWxtb246ICBbMjU1LDE2MCwxMjJdLFxuICBsaWdodHNlYWdyZWVuOiAgWzMyLDE3OCwxNzBdLFxuICBsaWdodHNreWJsdWU6IFsxMzUsMjA2LDI1MF0sXG4gIGxpZ2h0c2xhdGVncmF5OiBbMTE5LDEzNiwxNTNdLFxuICBsaWdodHNsYXRlZ3JleTogWzExOSwxMzYsMTUzXSxcbiAgbGlnaHRzdGVlbGJsdWU6IFsxNzYsMTk2LDIyMl0sXG4gIGxpZ2h0eWVsbG93OiAgWzI1NSwyNTUsMjI0XSxcbiAgbGltZTogWzAsMjU1LDBdLFxuICBsaW1lZ3JlZW46ICBbNTAsMjA1LDUwXSxcbiAgbGluZW46ICBbMjUwLDI0MCwyMzBdLFxuICBtYWdlbnRhOiAgWzI1NSwwLDI1NV0sXG4gIG1hcm9vbjogWzEyOCwwLDBdLFxuICBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLDIwNSwxNzBdLFxuICBtZWRpdW1ibHVlOiBbMCwwLDIwNV0sXG4gIG1lZGl1bW9yY2hpZDogWzE4Niw4NSwyMTFdLFxuICBtZWRpdW1wdXJwbGU6IFsxNDcsMTEyLDIxOV0sXG4gIG1lZGl1bXNlYWdyZWVuOiBbNjAsMTc5LDExM10sXG4gIG1lZGl1bXNsYXRlYmx1ZTogIFsxMjMsMTA0LDIzOF0sXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAgWzAsMjUwLDE1NF0sXG4gIG1lZGl1bXR1cnF1b2lzZTogIFs3MiwyMDksMjA0XSxcbiAgbWVkaXVtdmlvbGV0cmVkOiAgWzE5OSwyMSwxMzNdLFxuICBtaWRuaWdodGJsdWU6IFsyNSwyNSwxMTJdLFxuICBtaW50Y3JlYW06ICBbMjQ1LDI1NSwyNTBdLFxuICBtaXN0eXJvc2U6ICBbMjU1LDIyOCwyMjVdLFxuICBtb2NjYXNpbjogWzI1NSwyMjgsMTgxXSxcbiAgbmF2YWpvd2hpdGU6ICBbMjU1LDIyMiwxNzNdLFxuICBuYXZ5OiBbMCwwLDEyOF0sXG4gIG9sZGxhY2U6ICBbMjUzLDI0NSwyMzBdLFxuICBvbGl2ZTogIFsxMjgsMTI4LDBdLFxuICBvbGl2ZWRyYWI6ICBbMTA3LDE0MiwzNV0sXG4gIG9yYW5nZTogWzI1NSwxNjUsMF0sXG4gIG9yYW5nZXJlZDogIFsyNTUsNjksMF0sXG4gIG9yY2hpZDogWzIxOCwxMTIsMjE0XSxcbiAgcGFsZWdvbGRlbnJvZDogIFsyMzgsMjMyLDE3MF0sXG4gIHBhbGVncmVlbjogIFsxNTIsMjUxLDE1Ml0sXG4gIHBhbGV0dXJxdW9pc2U6ICBbMTc1LDIzOCwyMzhdLFxuICBwYWxldmlvbGV0cmVkOiAgWzIxOSwxMTIsMTQ3XSxcbiAgcGFwYXlhd2hpcDogWzI1NSwyMzksMjEzXSxcbiAgcGVhY2hwdWZmOiAgWzI1NSwyMTgsMTg1XSxcbiAgcGVydTogWzIwNSwxMzMsNjNdLFxuICBwaW5rOiBbMjU1LDE5MiwyMDNdLFxuICBwbHVtOiBbMjIxLDE2MCwyMjFdLFxuICBwb3dkZXJibHVlOiBbMTc2LDIyNCwyMzBdLFxuICBwdXJwbGU6IFsxMjgsMCwxMjhdLFxuICByZWJlY2NhcHVycGxlOiBbMTAyLCA1MSwgMTUzXSxcbiAgcmVkOiAgWzI1NSwwLDBdLFxuICByb3N5YnJvd246ICBbMTg4LDE0MywxNDNdLFxuICByb3lhbGJsdWU6ICBbNjUsMTA1LDIyNV0sXG4gIHNhZGRsZWJyb3duOiAgWzEzOSw2OSwxOV0sXG4gIHNhbG1vbjogWzI1MCwxMjgsMTE0XSxcbiAgc2FuZHlicm93bjogWzI0NCwxNjQsOTZdLFxuICBzZWFncmVlbjogWzQ2LDEzOSw4N10sXG4gIHNlYXNoZWxsOiBbMjU1LDI0NSwyMzhdLFxuICBzaWVubmE6IFsxNjAsODIsNDVdLFxuICBzaWx2ZXI6IFsxOTIsMTkyLDE5Ml0sXG4gIHNreWJsdWU6ICBbMTM1LDIwNiwyMzVdLFxuICBzbGF0ZWJsdWU6ICBbMTA2LDkwLDIwNV0sXG4gIHNsYXRlZ3JheTogIFsxMTIsMTI4LDE0NF0sXG4gIHNsYXRlZ3JleTogIFsxMTIsMTI4LDE0NF0sXG4gIHNub3c6IFsyNTUsMjUwLDI1MF0sXG4gIHNwcmluZ2dyZWVuOiAgWzAsMjU1LDEyN10sXG4gIHN0ZWVsYmx1ZTogIFs3MCwxMzAsMTgwXSxcbiAgdGFuOiAgWzIxMCwxODAsMTQwXSxcbiAgdGVhbDogWzAsMTI4LDEyOF0sXG4gIHRoaXN0bGU6ICBbMjE2LDE5MSwyMTZdLFxuICB0b21hdG86IFsyNTUsOTksNzFdLFxuICB0dXJxdW9pc2U6ICBbNjQsMjI0LDIwOF0sXG4gIHZpb2xldDogWzIzOCwxMzAsMjM4XSxcbiAgd2hlYXQ6ICBbMjQ1LDIyMiwxNzldLFxuICB3aGl0ZTogIFsyNTUsMjU1LDI1NV0sXG4gIHdoaXRlc21va2U6IFsyNDUsMjQ1LDI0NV0sXG4gIHllbGxvdzogWzI1NSwyNTUsMF0sXG4gIHllbGxvd2dyZWVuOiAgWzE1NCwyMDUsNTBdXG59O1xuXG52YXIgcmV2ZXJzZUtleXdvcmRzID0ge307XG5mb3IgKHZhciBrZXkgaW4gY3NzS2V5d29yZHMpIHtcbiAgcmV2ZXJzZUtleXdvcmRzW0pTT04uc3RyaW5naWZ5KGNzc0tleXdvcmRzW2tleV0pXSA9IGtleTtcbn1cbiIsInZhciBjb252ZXJzaW9ucyA9IHJlcXVpcmUoXCIuL2NvbnZlcnNpb25zXCIpO1xuXG52YXIgY29udmVydCA9IGZ1bmN0aW9uKCkge1xuICAgcmV0dXJuIG5ldyBDb252ZXJ0ZXIoKTtcbn1cblxuZm9yICh2YXIgZnVuYyBpbiBjb252ZXJzaW9ucykge1xuICAvLyBleHBvcnQgUmF3IHZlcnNpb25zXG4gIGNvbnZlcnRbZnVuYyArIFwiUmF3XCJdID0gIChmdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gYWNjZXB0IGFycmF5IG9yIHBsYWluIGFyZ3NcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PSBcIm51bWJlclwiKVxuICAgICAgICBhcmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNvbnZlcnNpb25zW2Z1bmNdKGFyZyk7XG4gICAgfVxuICB9KShmdW5jKTtcblxuICB2YXIgcGFpciA9IC8oXFx3KykyKFxcdyspLy5leGVjKGZ1bmMpLFxuICAgICAgZnJvbSA9IHBhaXJbMV0sXG4gICAgICB0byA9IHBhaXJbMl07XG5cbiAgLy8gZXhwb3J0IHJnYjJoc2wgYW5kIFtcInJnYlwiXVtcImhzbFwiXVxuICBjb252ZXJ0W2Zyb21dID0gY29udmVydFtmcm9tXSB8fCB7fTtcblxuICBjb252ZXJ0W2Zyb21dW3RvXSA9IGNvbnZlcnRbZnVuY10gPSAoZnVuY3Rpb24oZnVuYykgeyBcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PSBcIm51bWJlclwiKVxuICAgICAgICBhcmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgXG4gICAgICB2YXIgdmFsID0gY29udmVyc2lvbnNbZnVuY10oYXJnKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09IFwic3RyaW5nXCIgfHwgdmFsID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB2YWw7IC8vIGtleXdvcmRcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspXG4gICAgICAgIHZhbFtpXSA9IE1hdGgucm91bmQodmFsW2ldKTtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9KShmdW5jKTtcbn1cblxuXG4vKiBDb252ZXJ0ZXIgZG9lcyBsYXp5IGNvbnZlcnNpb24gYW5kIGNhY2hpbmcgKi9cbnZhciBDb252ZXJ0ZXIgPSBmdW5jdGlvbigpIHtcbiAgIHRoaXMuY29udnMgPSB7fTtcbn07XG5cbi8qIEVpdGhlciBnZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSBvclxuICBzZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSwgZGVwZW5kaW5nIG9uIGFyZ3MgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUucm91dGVTcGFjZSA9IGZ1bmN0aW9uKHNwYWNlLCBhcmdzKSB7XG4gICB2YXIgdmFsdWVzID0gYXJnc1swXTtcbiAgIGlmICh2YWx1ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gY29sb3IucmdiKClcbiAgICAgIHJldHVybiB0aGlzLmdldFZhbHVlcyhzcGFjZSk7XG4gICB9XG4gICAvLyBjb2xvci5yZ2IoMTAsIDEwLCAxMClcbiAgIGlmICh0eXBlb2YgdmFsdWVzID09IFwibnVtYmVyXCIpIHtcbiAgICAgIHZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpOyAgICAgICAgXG4gICB9XG5cbiAgIHJldHVybiB0aGlzLnNldFZhbHVlcyhzcGFjZSwgdmFsdWVzKTtcbn07XG4gIFxuLyogU2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UsIGludmFsaWRhdGluZyBjYWNoZSAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5zZXRWYWx1ZXMgPSBmdW5jdGlvbihzcGFjZSwgdmFsdWVzKSB7XG4gICB0aGlzLnNwYWNlID0gc3BhY2U7XG4gICB0aGlzLmNvbnZzID0ge307XG4gICB0aGlzLmNvbnZzW3NwYWNlXSA9IHZhbHVlcztcbiAgIHJldHVybiB0aGlzO1xufTtcblxuLyogR2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UuIElmIHRoZXJlJ3MgYWxyZWFkeVxuICBhIGNvbnZlcnNpb24gZm9yIHRoZSBzcGFjZSwgZmV0Y2ggaXQsIG90aGVyd2lzZVxuICBjb21wdXRlIGl0ICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlKSB7XG4gICB2YXIgdmFscyA9IHRoaXMuY29udnNbc3BhY2VdO1xuICAgaWYgKCF2YWxzKSB7XG4gICAgICB2YXIgZnNwYWNlID0gdGhpcy5zcGFjZSxcbiAgICAgICAgICBmcm9tID0gdGhpcy5jb252c1tmc3BhY2VdO1xuICAgICAgdmFscyA9IGNvbnZlcnRbZnNwYWNlXVtzcGFjZV0oZnJvbSk7XG5cbiAgICAgIHRoaXMuY29udnNbc3BhY2VdID0gdmFscztcbiAgIH1cbiAgcmV0dXJuIHZhbHM7XG59O1xuXG5bXCJyZ2JcIiwgXCJoc2xcIiwgXCJoc3ZcIiwgXCJjbXlrXCIsIFwia2V5d29yZFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHNwYWNlKSB7XG4gICBDb252ZXJ0ZXIucHJvdG90eXBlW3NwYWNlXSA9IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlU3BhY2Uoc3BhY2UsIGFyZ3VtZW50cyk7XG4gICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb252ZXJ0OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdFwiYWxpY2VibHVlXCI6IFsyNDAsIDI0OCwgMjU1XSxcclxuXHRcImFudGlxdWV3aGl0ZVwiOiBbMjUwLCAyMzUsIDIxNV0sXHJcblx0XCJhcXVhXCI6IFswLCAyNTUsIDI1NV0sXHJcblx0XCJhcXVhbWFyaW5lXCI6IFsxMjcsIDI1NSwgMjEyXSxcclxuXHRcImF6dXJlXCI6IFsyNDAsIDI1NSwgMjU1XSxcclxuXHRcImJlaWdlXCI6IFsyNDUsIDI0NSwgMjIwXSxcclxuXHRcImJpc3F1ZVwiOiBbMjU1LCAyMjgsIDE5Nl0sXHJcblx0XCJibGFja1wiOiBbMCwgMCwgMF0sXHJcblx0XCJibGFuY2hlZGFsbW9uZFwiOiBbMjU1LCAyMzUsIDIwNV0sXHJcblx0XCJibHVlXCI6IFswLCAwLCAyNTVdLFxyXG5cdFwiYmx1ZXZpb2xldFwiOiBbMTM4LCA0MywgMjI2XSxcclxuXHRcImJyb3duXCI6IFsxNjUsIDQyLCA0Ml0sXHJcblx0XCJidXJseXdvb2RcIjogWzIyMiwgMTg0LCAxMzVdLFxyXG5cdFwiY2FkZXRibHVlXCI6IFs5NSwgMTU4LCAxNjBdLFxyXG5cdFwiY2hhcnRyZXVzZVwiOiBbMTI3LCAyNTUsIDBdLFxyXG5cdFwiY2hvY29sYXRlXCI6IFsyMTAsIDEwNSwgMzBdLFxyXG5cdFwiY29yYWxcIjogWzI1NSwgMTI3LCA4MF0sXHJcblx0XCJjb3JuZmxvd2VyYmx1ZVwiOiBbMTAwLCAxNDksIDIzN10sXHJcblx0XCJjb3Juc2lsa1wiOiBbMjU1LCAyNDgsIDIyMF0sXHJcblx0XCJjcmltc29uXCI6IFsyMjAsIDIwLCA2MF0sXHJcblx0XCJjeWFuXCI6IFswLCAyNTUsIDI1NV0sXHJcblx0XCJkYXJrYmx1ZVwiOiBbMCwgMCwgMTM5XSxcclxuXHRcImRhcmtjeWFuXCI6IFswLCAxMzksIDEzOV0sXHJcblx0XCJkYXJrZ29sZGVucm9kXCI6IFsxODQsIDEzNCwgMTFdLFxyXG5cdFwiZGFya2dyYXlcIjogWzE2OSwgMTY5LCAxNjldLFxyXG5cdFwiZGFya2dyZWVuXCI6IFswLCAxMDAsIDBdLFxyXG5cdFwiZGFya2dyZXlcIjogWzE2OSwgMTY5LCAxNjldLFxyXG5cdFwiZGFya2toYWtpXCI6IFsxODksIDE4MywgMTA3XSxcclxuXHRcImRhcmttYWdlbnRhXCI6IFsxMzksIDAsIDEzOV0sXHJcblx0XCJkYXJrb2xpdmVncmVlblwiOiBbODUsIDEwNywgNDddLFxyXG5cdFwiZGFya29yYW5nZVwiOiBbMjU1LCAxNDAsIDBdLFxyXG5cdFwiZGFya29yY2hpZFwiOiBbMTUzLCA1MCwgMjA0XSxcclxuXHRcImRhcmtyZWRcIjogWzEzOSwgMCwgMF0sXHJcblx0XCJkYXJrc2FsbW9uXCI6IFsyMzMsIDE1MCwgMTIyXSxcclxuXHRcImRhcmtzZWFncmVlblwiOiBbMTQzLCAxODgsIDE0M10sXHJcblx0XCJkYXJrc2xhdGVibHVlXCI6IFs3MiwgNjEsIDEzOV0sXHJcblx0XCJkYXJrc2xhdGVncmF5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmtzbGF0ZWdyZXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3R1cnF1b2lzZVwiOiBbMCwgMjA2LCAyMDldLFxyXG5cdFwiZGFya3Zpb2xldFwiOiBbMTQ4LCAwLCAyMTFdLFxyXG5cdFwiZGVlcHBpbmtcIjogWzI1NSwgMjAsIDE0N10sXHJcblx0XCJkZWVwc2t5Ymx1ZVwiOiBbMCwgMTkxLCAyNTVdLFxyXG5cdFwiZGltZ3JheVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkaW1ncmV5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRvZGdlcmJsdWVcIjogWzMwLCAxNDQsIDI1NV0sXHJcblx0XCJmaXJlYnJpY2tcIjogWzE3OCwgMzQsIDM0XSxcclxuXHRcImZsb3JhbHdoaXRlXCI6IFsyNTUsIDI1MCwgMjQwXSxcclxuXHRcImZvcmVzdGdyZWVuXCI6IFszNCwgMTM5LCAzNF0sXHJcblx0XCJmdWNoc2lhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJnYWluc2Jvcm9cIjogWzIyMCwgMjIwLCAyMjBdLFxyXG5cdFwiZ2hvc3R3aGl0ZVwiOiBbMjQ4LCAyNDgsIDI1NV0sXHJcblx0XCJnb2xkXCI6IFsyNTUsIDIxNSwgMF0sXHJcblx0XCJnb2xkZW5yb2RcIjogWzIxOCwgMTY1LCAzMl0sXHJcblx0XCJncmF5XCI6IFsxMjgsIDEyOCwgMTI4XSxcclxuXHRcImdyZWVuXCI6IFswLCAxMjgsIDBdLFxyXG5cdFwiZ3JlZW55ZWxsb3dcIjogWzE3MywgMjU1LCA0N10sXHJcblx0XCJncmV5XCI6IFsxMjgsIDEyOCwgMTI4XSxcclxuXHRcImhvbmV5ZGV3XCI6IFsyNDAsIDI1NSwgMjQwXSxcclxuXHRcImhvdHBpbmtcIjogWzI1NSwgMTA1LCAxODBdLFxyXG5cdFwiaW5kaWFucmVkXCI6IFsyMDUsIDkyLCA5Ml0sXHJcblx0XCJpbmRpZ29cIjogWzc1LCAwLCAxMzBdLFxyXG5cdFwiaXZvcnlcIjogWzI1NSwgMjU1LCAyNDBdLFxyXG5cdFwia2hha2lcIjogWzI0MCwgMjMwLCAxNDBdLFxyXG5cdFwibGF2ZW5kZXJcIjogWzIzMCwgMjMwLCAyNTBdLFxyXG5cdFwibGF2ZW5kZXJibHVzaFwiOiBbMjU1LCAyNDAsIDI0NV0sXHJcblx0XCJsYXduZ3JlZW5cIjogWzEyNCwgMjUyLCAwXSxcclxuXHRcImxlbW9uY2hpZmZvblwiOiBbMjU1LCAyNTAsIDIwNV0sXHJcblx0XCJsaWdodGJsdWVcIjogWzE3MywgMjE2LCAyMzBdLFxyXG5cdFwibGlnaHRjb3JhbFwiOiBbMjQwLCAxMjgsIDEyOF0sXHJcblx0XCJsaWdodGN5YW5cIjogWzIyNCwgMjU1LCAyNTVdLFxyXG5cdFwibGlnaHRnb2xkZW5yb2R5ZWxsb3dcIjogWzI1MCwgMjUwLCAyMTBdLFxyXG5cdFwibGlnaHRncmF5XCI6IFsyMTEsIDIxMSwgMjExXSxcclxuXHRcImxpZ2h0Z3JlZW5cIjogWzE0NCwgMjM4LCAxNDRdLFxyXG5cdFwibGlnaHRncmV5XCI6IFsyMTEsIDIxMSwgMjExXSxcclxuXHRcImxpZ2h0cGlua1wiOiBbMjU1LCAxODIsIDE5M10sXHJcblx0XCJsaWdodHNhbG1vblwiOiBbMjU1LCAxNjAsIDEyMl0sXHJcblx0XCJsaWdodHNlYWdyZWVuXCI6IFszMiwgMTc4LCAxNzBdLFxyXG5cdFwibGlnaHRza3libHVlXCI6IFsxMzUsIDIwNiwgMjUwXSxcclxuXHRcImxpZ2h0c2xhdGVncmF5XCI6IFsxMTksIDEzNiwgMTUzXSxcclxuXHRcImxpZ2h0c2xhdGVncmV5XCI6IFsxMTksIDEzNiwgMTUzXSxcclxuXHRcImxpZ2h0c3RlZWxibHVlXCI6IFsxNzYsIDE5NiwgMjIyXSxcclxuXHRcImxpZ2h0eWVsbG93XCI6IFsyNTUsIDI1NSwgMjI0XSxcclxuXHRcImxpbWVcIjogWzAsIDI1NSwgMF0sXHJcblx0XCJsaW1lZ3JlZW5cIjogWzUwLCAyMDUsIDUwXSxcclxuXHRcImxpbmVuXCI6IFsyNTAsIDI0MCwgMjMwXSxcclxuXHRcIm1hZ2VudGFcIjogWzI1NSwgMCwgMjU1XSxcclxuXHRcIm1hcm9vblwiOiBbMTI4LCAwLCAwXSxcclxuXHRcIm1lZGl1bWFxdWFtYXJpbmVcIjogWzEwMiwgMjA1LCAxNzBdLFxyXG5cdFwibWVkaXVtYmx1ZVwiOiBbMCwgMCwgMjA1XSxcclxuXHRcIm1lZGl1bW9yY2hpZFwiOiBbMTg2LCA4NSwgMjExXSxcclxuXHRcIm1lZGl1bXB1cnBsZVwiOiBbMTQ3LCAxMTIsIDIxOV0sXHJcblx0XCJtZWRpdW1zZWFncmVlblwiOiBbNjAsIDE3OSwgMTEzXSxcclxuXHRcIm1lZGl1bXNsYXRlYmx1ZVwiOiBbMTIzLCAxMDQsIDIzOF0sXHJcblx0XCJtZWRpdW1zcHJpbmdncmVlblwiOiBbMCwgMjUwLCAxNTRdLFxyXG5cdFwibWVkaXVtdHVycXVvaXNlXCI6IFs3MiwgMjA5LCAyMDRdLFxyXG5cdFwibWVkaXVtdmlvbGV0cmVkXCI6IFsxOTksIDIxLCAxMzNdLFxyXG5cdFwibWlkbmlnaHRibHVlXCI6IFsyNSwgMjUsIDExMl0sXHJcblx0XCJtaW50Y3JlYW1cIjogWzI0NSwgMjU1LCAyNTBdLFxyXG5cdFwibWlzdHlyb3NlXCI6IFsyNTUsIDIyOCwgMjI1XSxcclxuXHRcIm1vY2Nhc2luXCI6IFsyNTUsIDIyOCwgMTgxXSxcclxuXHRcIm5hdmFqb3doaXRlXCI6IFsyNTUsIDIyMiwgMTczXSxcclxuXHRcIm5hdnlcIjogWzAsIDAsIDEyOF0sXHJcblx0XCJvbGRsYWNlXCI6IFsyNTMsIDI0NSwgMjMwXSxcclxuXHRcIm9saXZlXCI6IFsxMjgsIDEyOCwgMF0sXHJcblx0XCJvbGl2ZWRyYWJcIjogWzEwNywgMTQyLCAzNV0sXHJcblx0XCJvcmFuZ2VcIjogWzI1NSwgMTY1LCAwXSxcclxuXHRcIm9yYW5nZXJlZFwiOiBbMjU1LCA2OSwgMF0sXHJcblx0XCJvcmNoaWRcIjogWzIxOCwgMTEyLCAyMTRdLFxyXG5cdFwicGFsZWdvbGRlbnJvZFwiOiBbMjM4LCAyMzIsIDE3MF0sXHJcblx0XCJwYWxlZ3JlZW5cIjogWzE1MiwgMjUxLCAxNTJdLFxyXG5cdFwicGFsZXR1cnF1b2lzZVwiOiBbMTc1LCAyMzgsIDIzOF0sXHJcblx0XCJwYWxldmlvbGV0cmVkXCI6IFsyMTksIDExMiwgMTQ3XSxcclxuXHRcInBhcGF5YXdoaXBcIjogWzI1NSwgMjM5LCAyMTNdLFxyXG5cdFwicGVhY2hwdWZmXCI6IFsyNTUsIDIxOCwgMTg1XSxcclxuXHRcInBlcnVcIjogWzIwNSwgMTMzLCA2M10sXHJcblx0XCJwaW5rXCI6IFsyNTUsIDE5MiwgMjAzXSxcclxuXHRcInBsdW1cIjogWzIyMSwgMTYwLCAyMjFdLFxyXG5cdFwicG93ZGVyYmx1ZVwiOiBbMTc2LCAyMjQsIDIzMF0sXHJcblx0XCJwdXJwbGVcIjogWzEyOCwgMCwgMTI4XSxcclxuXHRcInJlYmVjY2FwdXJwbGVcIjogWzEwMiwgNTEsIDE1M10sXHJcblx0XCJyZWRcIjogWzI1NSwgMCwgMF0sXHJcblx0XCJyb3N5YnJvd25cIjogWzE4OCwgMTQzLCAxNDNdLFxyXG5cdFwicm95YWxibHVlXCI6IFs2NSwgMTA1LCAyMjVdLFxyXG5cdFwic2FkZGxlYnJvd25cIjogWzEzOSwgNjksIDE5XSxcclxuXHRcInNhbG1vblwiOiBbMjUwLCAxMjgsIDExNF0sXHJcblx0XCJzYW5keWJyb3duXCI6IFsyNDQsIDE2NCwgOTZdLFxyXG5cdFwic2VhZ3JlZW5cIjogWzQ2LCAxMzksIDg3XSxcclxuXHRcInNlYXNoZWxsXCI6IFsyNTUsIDI0NSwgMjM4XSxcclxuXHRcInNpZW5uYVwiOiBbMTYwLCA4MiwgNDVdLFxyXG5cdFwic2lsdmVyXCI6IFsxOTIsIDE5MiwgMTkyXSxcclxuXHRcInNreWJsdWVcIjogWzEzNSwgMjA2LCAyMzVdLFxyXG5cdFwic2xhdGVibHVlXCI6IFsxMDYsIDkwLCAyMDVdLFxyXG5cdFwic2xhdGVncmF5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNsYXRlZ3JleVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbm93XCI6IFsyNTUsIDI1MCwgMjUwXSxcclxuXHRcInNwcmluZ2dyZWVuXCI6IFswLCAyNTUsIDEyN10sXHJcblx0XCJzdGVlbGJsdWVcIjogWzcwLCAxMzAsIDE4MF0sXHJcblx0XCJ0YW5cIjogWzIxMCwgMTgwLCAxNDBdLFxyXG5cdFwidGVhbFwiOiBbMCwgMTI4LCAxMjhdLFxyXG5cdFwidGhpc3RsZVwiOiBbMjE2LCAxOTEsIDIxNl0sXHJcblx0XCJ0b21hdG9cIjogWzI1NSwgOTksIDcxXSxcclxuXHRcInR1cnF1b2lzZVwiOiBbNjQsIDIyNCwgMjA4XSxcclxuXHRcInZpb2xldFwiOiBbMjM4LCAxMzAsIDIzOF0sXHJcblx0XCJ3aGVhdFwiOiBbMjQ1LCAyMjIsIDE3OV0sXHJcblx0XCJ3aGl0ZVwiOiBbMjU1LCAyNTUsIDI1NV0sXHJcblx0XCJ3aGl0ZXNtb2tlXCI6IFsyNDUsIDI0NSwgMjQ1XSxcclxuXHRcInllbGxvd1wiOiBbMjU1LCAyNTUsIDBdLFxyXG5cdFwieWVsbG93Z3JlZW5cIjogWzE1NCwgMjA1LCA1MF1cclxufTsiLCIvKiBNSVQgbGljZW5zZSAqL1xudmFyIGNvbG9yTmFtZXMgPSByZXF1aXJlKCdjb2xvci1uYW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgZ2V0UmdiYTogZ2V0UmdiYSxcbiAgIGdldEhzbGE6IGdldEhzbGEsXG4gICBnZXRSZ2I6IGdldFJnYixcbiAgIGdldEhzbDogZ2V0SHNsLFxuICAgZ2V0SHdiOiBnZXRId2IsXG4gICBnZXRBbHBoYTogZ2V0QWxwaGEsXG5cbiAgIGhleFN0cmluZzogaGV4U3RyaW5nLFxuICAgcmdiU3RyaW5nOiByZ2JTdHJpbmcsXG4gICByZ2JhU3RyaW5nOiByZ2JhU3RyaW5nLFxuICAgcGVyY2VudFN0cmluZzogcGVyY2VudFN0cmluZyxcbiAgIHBlcmNlbnRhU3RyaW5nOiBwZXJjZW50YVN0cmluZyxcbiAgIGhzbFN0cmluZzogaHNsU3RyaW5nLFxuICAgaHNsYVN0cmluZzogaHNsYVN0cmluZyxcbiAgIGh3YlN0cmluZzogaHdiU3RyaW5nLFxuICAga2V5d29yZDoga2V5d29yZFxufVxuXG5mdW5jdGlvbiBnZXRSZ2JhKHN0cmluZykge1xuICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cbiAgIHZhciBhYmJyID0gIC9eIyhbYS1mQS1GMC05XXszfSkkLyxcbiAgICAgICBoZXggPSAgL14jKFthLWZBLUYwLTldezZ9KSQvLFxuICAgICAgIHJnYmEgPSAvXnJnYmE/XFwoXFxzKihbKy1dP1xcZCspXFxzKixcXHMqKFsrLV0/XFxkKylcXHMqLFxccyooWystXT9cXGQrKVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkkLyxcbiAgICAgICBwZXIgPSAvXnJnYmE/XFwoXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkkLyxcbiAgICAgICBrZXl3b3JkID0gLyhcXEQrKS87XG5cbiAgIHZhciByZ2IgPSBbMCwgMCwgMF0sXG4gICAgICAgYSA9IDEsXG4gICAgICAgbWF0Y2ggPSBzdHJpbmcubWF0Y2goYWJicik7XG4gICBpZiAobWF0Y2gpIHtcbiAgICAgIG1hdGNoID0gbWF0Y2hbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaV0gKyBtYXRjaFtpXSwgMTYpO1xuICAgICAgfVxuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goaGV4KSkge1xuICAgICAgbWF0Y2ggPSBtYXRjaFsxXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBwYXJzZUludChtYXRjaC5zbGljZShpICogMiwgaSAqIDIgKyAyKSwgMTYpO1xuICAgICAgfVxuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocmdiYSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpICsgMV0pO1xuICAgICAgfVxuICAgICAgYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocGVyKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IE1hdGgucm91bmQocGFyc2VGbG9hdChtYXRjaFtpICsgMV0pICogMi41NSk7XG4gICAgICB9XG4gICAgICBhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChrZXl3b3JkKSkge1xuICAgICAgaWYgKG1hdGNoWzFdID09IFwidHJhbnNwYXJlbnRcIikge1xuICAgICAgICAgcmV0dXJuIFswLCAwLCAwLCAwXTtcbiAgICAgIH1cbiAgICAgIHJnYiA9IGNvbG9yTmFtZXNbbWF0Y2hbMV1dO1xuICAgICAgaWYgKCFyZ2IpIHtcbiAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgIH1cblxuICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJnYltpXSA9IHNjYWxlKHJnYltpXSwgMCwgMjU1KTtcbiAgIH1cbiAgIGlmICghYSAmJiBhICE9IDApIHtcbiAgICAgIGEgPSAxO1xuICAgfVxuICAgZWxzZSB7XG4gICAgICBhID0gc2NhbGUoYSwgMCwgMSk7XG4gICB9XG4gICByZ2JbM10gPSBhO1xuICAgcmV0dXJuIHJnYjtcbn1cblxuZnVuY3Rpb24gZ2V0SHNsYShzdHJpbmcpIHtcbiAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm47XG4gICB9XG4gICB2YXIgaHNsID0gL15oc2xhP1xcKFxccyooWystXT9cXGQrKSg/OmRlZyk/XFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkvO1xuICAgdmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGhzbCk7XG4gICBpZiAobWF0Y2gpIHtcbiAgICAgIHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgICAgdmFyIGggPSBzY2FsZShwYXJzZUludChtYXRjaFsxXSksIDAsIDM2MCksXG4gICAgICAgICAgcyA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApLFxuICAgICAgICAgIGwgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKSxcbiAgICAgICAgICBhID0gc2NhbGUoaXNOYU4oYWxwaGEpID8gMSA6IGFscGhhLCAwLCAxKTtcbiAgICAgIHJldHVybiBbaCwgcywgbCwgYV07XG4gICB9XG59XG5cbmZ1bmN0aW9uIGdldEh3YihzdHJpbmcpIHtcbiAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm47XG4gICB9XG4gICB2YXIgaHdiID0gL15od2JcXChcXHMqKFsrLV0/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpLztcbiAgIHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChod2IpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgdmFyIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICAgICB2YXIgaCA9IHNjYWxlKHBhcnNlSW50KG1hdGNoWzFdKSwgMCwgMzYwKSxcbiAgICAgICAgICB3ID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCksXG4gICAgICAgICAgYiA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbM10pLCAwLCAxMDApLFxuICAgICAgICAgIGEgPSBzY2FsZShpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuICAgICAgcmV0dXJuIFtoLCB3LCBiLCBhXTtcbiAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmdiKHN0cmluZykge1xuICAgdmFyIHJnYmEgPSBnZXRSZ2JhKHN0cmluZyk7XG4gICByZXR1cm4gcmdiYSAmJiByZ2JhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRIc2woc3RyaW5nKSB7XG4gIHZhciBoc2xhID0gZ2V0SHNsYShzdHJpbmcpO1xuICByZXR1cm4gaHNsYSAmJiBoc2xhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRBbHBoYShzdHJpbmcpIHtcbiAgIHZhciB2YWxzID0gZ2V0UmdiYShzdHJpbmcpO1xuICAgaWYgKHZhbHMpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxuICAgZWxzZSBpZiAodmFscyA9IGdldEhzbGEoc3RyaW5nKSkge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG4gICBlbHNlIGlmICh2YWxzID0gZ2V0SHdiKHN0cmluZykpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxufVxuXG4vLyBnZW5lcmF0b3JzXG5mdW5jdGlvbiBoZXhTdHJpbmcocmdiKSB7XG4gICByZXR1cm4gXCIjXCIgKyBoZXhEb3VibGUocmdiWzBdKSArIGhleERvdWJsZShyZ2JbMV0pXG4gICAgICAgICAgICAgICsgaGV4RG91YmxlKHJnYlsyXSk7XG59XG5cbmZ1bmN0aW9uIHJnYlN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAocmdiYVszXSAmJiByZ2JhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKTtcbiAgIH1cbiAgIHJldHVybiBcInJnYihcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAocmdiYVszXSAhPT0gdW5kZWZpbmVkID8gcmdiYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwicmdiYShcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXVxuICAgICAgICAgICArIFwiLCBcIiArIGFscGhhICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKHJnYmFbM10gJiYgcmdiYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpO1xuICAgfVxuICAgdmFyIHIgPSBNYXRoLnJvdW5kKHJnYmFbMF0vMjU1ICogMTAwKSxcbiAgICAgICBnID0gTWF0aC5yb3VuZChyZ2JhWzFdLzI1NSAqIDEwMCksXG4gICAgICAgYiA9IE1hdGgucm91bmQocmdiYVsyXS8yNTUgKiAxMDApO1xuXG4gICByZXR1cm4gXCJyZ2IoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSlcIjtcbn1cblxuZnVuY3Rpb24gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIHZhciByID0gTWF0aC5yb3VuZChyZ2JhWzBdLzI1NSAqIDEwMCksXG4gICAgICAgZyA9IE1hdGgucm91bmQocmdiYVsxXS8yNTUgKiAxMDApLFxuICAgICAgIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0vMjU1ICogMTAwKTtcbiAgIHJldHVybiBcInJnYmEoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSwgXCIgKyAoYWxwaGEgfHwgcmdiYVszXSB8fCAxKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xTdHJpbmcoaHNsYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKGhzbGFbM10gJiYgaHNsYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gaHNsYVN0cmluZyhoc2xhLCBhbHBoYSk7XG4gICB9XG4gICByZXR1cm4gXCJoc2woXCIgKyBoc2xhWzBdICsgXCIsIFwiICsgaHNsYVsxXSArIFwiJSwgXCIgKyBoc2xhWzJdICsgXCIlKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xhU3RyaW5nKGhzbGEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHNsYVszXSAhPT0gdW5kZWZpbmVkID8gaHNsYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHNsYShcIiArIGhzbGFbMF0gKyBcIiwgXCIgKyBoc2xhWzFdICsgXCIlLCBcIiArIGhzbGFbMl0gKyBcIiUsIFwiXG4gICAgICAgICAgICsgYWxwaGEgKyBcIilcIjtcbn1cblxuLy8gaHdiIGlzIGEgYml0IGRpZmZlcmVudCB0aGFuIHJnYihhKSAmIGhzbChhKSBzaW5jZSB0aGVyZSBpcyBubyBhbHBoYSBzcGVjaWZpYyBzeW50YXhcbi8vIChod2IgaGF2ZSBhbHBoYSBvcHRpb25hbCAmIDEgaXMgZGVmYXVsdCB2YWx1ZSlcbmZ1bmN0aW9uIGh3YlN0cmluZyhod2IsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHdiWzNdICE9PSB1bmRlZmluZWQgPyBod2JbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcImh3YihcIiArIGh3YlswXSArIFwiLCBcIiArIGh3YlsxXSArIFwiJSwgXCIgKyBod2JbMl0gKyBcIiVcIlxuICAgICAgICAgICArIChhbHBoYSAhPT0gdW5kZWZpbmVkICYmIGFscGhhICE9PSAxID8gXCIsIFwiICsgYWxwaGEgOiBcIlwiKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkKHJnYikge1xuICByZXR1cm4gcmV2ZXJzZU5hbWVzW3JnYi5zbGljZSgwLCAzKV07XG59XG5cbi8vIGhlbHBlcnNcbmZ1bmN0aW9uIHNjYWxlKG51bSwgbWluLCBtYXgpIHtcbiAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtaW4sIG51bSksIG1heCk7XG59XG5cbmZ1bmN0aW9uIGhleERvdWJsZShudW0pIHtcbiAgdmFyIHN0ciA9IG51bS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIChzdHIubGVuZ3RoIDwgMikgPyBcIjBcIiArIHN0ciA6IHN0cjtcbn1cblxuXG4vL2NyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xudmFyIHJldmVyc2VOYW1lcyA9IHt9O1xuZm9yICh2YXIgbmFtZSBpbiBjb2xvck5hbWVzKSB7XG4gICByZXZlcnNlTmFtZXNbY29sb3JOYW1lc1tuYW1lXV0gPSBuYW1lO1xufVxuIiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjb252ZXJ0ID0gcmVxdWlyZSgnY29sb3ItY29udmVydCcpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJ2NvbG9yLXN0cmluZycpO1xuXG52YXIgQ29sb3IgPSBmdW5jdGlvbiAob2JqKSB7XG5cdGlmIChvYmogaW5zdGFuY2VvZiBDb2xvcikge1xuXHRcdHJldHVybiBvYmo7XG5cdH1cblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIENvbG9yKSkge1xuXHRcdHJldHVybiBuZXcgQ29sb3Iob2JqKTtcblx0fVxuXG5cdHRoaXMudmFsdWVzID0ge1xuXHRcdHJnYjogWzAsIDAsIDBdLFxuXHRcdGhzbDogWzAsIDAsIDBdLFxuXHRcdGhzdjogWzAsIDAsIDBdLFxuXHRcdGh3YjogWzAsIDAsIDBdLFxuXHRcdGNteWs6IFswLCAwLCAwLCAwXSxcblx0XHRhbHBoYTogMVxuXHR9O1xuXG5cdC8vIHBhcnNlIENvbG9yKCkgYXJndW1lbnRcblx0dmFyIHZhbHM7XG5cdGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykge1xuXHRcdHZhbHMgPSBzdHJpbmcuZ2V0UmdiYShvYmopO1xuXHRcdGlmICh2YWxzKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygncmdiJywgdmFscyk7XG5cdFx0fSBlbHNlIGlmICh2YWxzID0gc3RyaW5nLmdldEhzbGEob2JqKSkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzbCcsIHZhbHMpO1xuXHRcdH0gZWxzZSBpZiAodmFscyA9IHN0cmluZy5nZXRId2Iob2JqKSkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZXMoJ2h3YicsIHZhbHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIHN0cmluZyBcIicgKyBvYmogKyAnXCInKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcblx0XHR2YWxzID0gb2JqO1xuXHRcdGlmICh2YWxzLnIgIT09IHVuZGVmaW5lZCB8fCB2YWxzLnJlZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygncmdiJywgdmFscyk7XG5cdFx0fSBlbHNlIGlmICh2YWxzLmwgIT09IHVuZGVmaW5lZCB8fCB2YWxzLmxpZ2h0bmVzcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygnaHNsJywgdmFscyk7XG5cdFx0fSBlbHNlIGlmICh2YWxzLnYgIT09IHVuZGVmaW5lZCB8fCB2YWxzLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdoc3YnLCB2YWxzKTtcblx0XHR9IGVsc2UgaWYgKHZhbHMudyAhPT0gdW5kZWZpbmVkIHx8IHZhbHMud2hpdGVuZXNzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVzKCdod2InLCB2YWxzKTtcblx0XHR9IGVsc2UgaWYgKHZhbHMuYyAhPT0gdW5kZWZpbmVkIHx8IHZhbHMuY3lhbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlcygnY215aycsIHZhbHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIG9iamVjdCAnICsgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5Db2xvci5wcm90b3R5cGUgPSB7XG5cdHJnYjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnNldFNwYWNlKCdyZ2InLCBhcmd1bWVudHMpO1xuXHR9LFxuXHRoc2w6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRTcGFjZSgnaHNsJywgYXJndW1lbnRzKTtcblx0fSxcblx0aHN2OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0U3BhY2UoJ2hzdicsIGFyZ3VtZW50cyk7XG5cdH0sXG5cdGh3YjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnNldFNwYWNlKCdod2InLCBhcmd1bWVudHMpO1xuXHR9LFxuXHRjbXlrOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0U3BhY2UoJ2NteWsnLCBhcmd1bWVudHMpO1xuXHR9LFxuXG5cdHJnYkFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWVzLnJnYjtcblx0fSxcblx0aHNsQXJyYXk6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy52YWx1ZXMuaHNsO1xuXHR9LFxuXHRoc3ZBcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbHVlcy5oc3Y7XG5cdH0sXG5cdGh3YkFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMudmFsdWVzLmFscGhhICE9PSAxKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWx1ZXMuaHdiLmNvbmNhdChbdGhpcy52YWx1ZXMuYWxwaGFdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMudmFsdWVzLmh3Yjtcblx0fSxcblx0Y215a0FycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWVzLmNteWs7XG5cdH0sXG5cdHJnYmFBcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2I7XG5cdFx0cmV0dXJuIHJnYi5jb25jYXQoW3RoaXMudmFsdWVzLmFscGhhXSk7XG5cdH0sXG5cdGhzbGFBcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBoc2wgPSB0aGlzLnZhbHVlcy5oc2w7XG5cdFx0cmV0dXJuIGhzbC5jb25jYXQoW3RoaXMudmFsdWVzLmFscGhhXSk7XG5cdH0sXG5cdGFscGhhOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWx1ZXMuYWxwaGE7XG5cdFx0fVxuXHRcdHRoaXMuc2V0VmFsdWVzKCdhbHBoYScsIHZhbCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cmVkOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgncmdiJywgMCwgdmFsKTtcblx0fSxcblx0Z3JlZW46IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdyZ2InLCAxLCB2YWwpO1xuXHR9LFxuXHRibHVlOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgncmdiJywgMiwgdmFsKTtcblx0fSxcblx0aHVlOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0aWYgKHZhbCkge1xuXHRcdFx0dmFsICU9IDM2MDtcblx0XHRcdHZhbCA9IHZhbCA8IDAgPyAzNjAgKyB2YWwgOiB2YWw7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2hzbCcsIDAsIHZhbCk7XG5cdH0sXG5cdHNhdHVyYXRpb246IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdoc2wnLCAxLCB2YWwpO1xuXHR9LFxuXHRsaWdodG5lc3M6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDaGFubmVsKCdoc2wnLCAyLCB2YWwpO1xuXHR9LFxuXHRzYXR1cmF0aW9udjogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2hzdicsIDEsIHZhbCk7XG5cdH0sXG5cdHdoaXRlbmVzczogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2h3YicsIDEsIHZhbCk7XG5cdH0sXG5cdGJsYWNrbmVzczogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2h3YicsIDIsIHZhbCk7XG5cdH0sXG5cdHZhbHVlOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnaHN2JywgMiwgdmFsKTtcblx0fSxcblx0Y3lhbjogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2NteWsnLCAwLCB2YWwpO1xuXHR9LFxuXHRtYWdlbnRhOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbCgnY215aycsIDEsIHZhbCk7XG5cdH0sXG5cdHllbGxvdzogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2NteWsnLCAyLCB2YWwpO1xuXHR9LFxuXHRibGFjazogZnVuY3Rpb24gKHZhbCkge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwoJ2NteWsnLCAzLCB2YWwpO1xuXHR9LFxuXG5cdGhleFN0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcuaGV4U3RyaW5nKHRoaXMudmFsdWVzLnJnYik7XG5cdH0sXG5cdHJnYlN0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcucmdiU3RyaW5nKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuXHR9LFxuXHRyZ2JhU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5yZ2JhU3RyaW5nKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuXHR9LFxuXHRwZXJjZW50U3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5wZXJjZW50U3RyaW5nKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuXHR9LFxuXHRoc2xTdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLmhzbFN0cmluZyh0aGlzLnZhbHVlcy5oc2wsIHRoaXMudmFsdWVzLmFscGhhKTtcblx0fSxcblx0aHNsYVN0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBzdHJpbmcuaHNsYVN0cmluZyh0aGlzLnZhbHVlcy5oc2wsIHRoaXMudmFsdWVzLmFscGhhKTtcblx0fSxcblx0aHdiU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5od2JTdHJpbmcodGhpcy52YWx1ZXMuaHdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG5cdH0sXG5cdGtleXdvcmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gc3RyaW5nLmtleXdvcmQodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG5cdH0sXG5cblx0cmdiTnVtYmVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICh0aGlzLnZhbHVlcy5yZ2JbMF0gPDwgMTYpIHwgKHRoaXMudmFsdWVzLnJnYlsxXSA8PCA4KSB8IHRoaXMudmFsdWVzLnJnYlsyXTtcblx0fSxcblxuXHRsdW1pbm9zaXR5OiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNyZWxhdGl2ZWx1bWluYW5jZWRlZlxuXHRcdHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2I7XG5cdFx0dmFyIGx1bSA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgY2hhbiA9IHJnYltpXSAvIDI1NTtcblx0XHRcdGx1bVtpXSA9IChjaGFuIDw9IDAuMDM5MjgpID8gY2hhbiAvIDEyLjkyIDogTWF0aC5wb3coKChjaGFuICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpO1xuXHRcdH1cblx0XHRyZXR1cm4gMC4yMTI2ICogbHVtWzBdICsgMC43MTUyICogbHVtWzFdICsgMC4wNzIyICogbHVtWzJdO1xuXHR9LFxuXG5cdGNvbnRyYXN0OiBmdW5jdGlvbiAoY29sb3IyKSB7XG5cdFx0Ly8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNjb250cmFzdC1yYXRpb2RlZlxuXHRcdHZhciBsdW0xID0gdGhpcy5sdW1pbm9zaXR5KCk7XG5cdFx0dmFyIGx1bTIgPSBjb2xvcjIubHVtaW5vc2l0eSgpO1xuXHRcdGlmIChsdW0xID4gbHVtMikge1xuXHRcdFx0cmV0dXJuIChsdW0xICsgMC4wNSkgLyAobHVtMiArIDAuMDUpO1xuXHRcdH1cblx0XHRyZXR1cm4gKGx1bTIgKyAwLjA1KSAvIChsdW0xICsgMC4wNSk7XG5cdH0sXG5cblx0bGV2ZWw6IGZ1bmN0aW9uIChjb2xvcjIpIHtcblx0XHR2YXIgY29udHJhc3RSYXRpbyA9IHRoaXMuY29udHJhc3QoY29sb3IyKTtcblx0XHRpZiAoY29udHJhc3RSYXRpbyA+PSA3LjEpIHtcblx0XHRcdHJldHVybiAnQUFBJztcblx0XHR9XG5cblx0XHRyZXR1cm4gKGNvbnRyYXN0UmF0aW8gPj0gNC41KSA/ICdBQScgOiAnJztcblx0fSxcblxuXHRkYXJrOiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gWUlRIGVxdWF0aW9uIGZyb20gaHR0cDovLzI0d2F5cy5vcmcvMjAxMC9jYWxjdWxhdGluZy1jb2xvci1jb250cmFzdFxuXHRcdHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2I7XG5cdFx0dmFyIHlpcSA9IChyZ2JbMF0gKiAyOTkgKyByZ2JbMV0gKiA1ODcgKyByZ2JbMl0gKiAxMTQpIC8gMTAwMDtcblx0XHRyZXR1cm4geWlxIDwgMTI4O1xuXHR9LFxuXG5cdGxpZ2h0OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICF0aGlzLmRhcmsoKTtcblx0fSxcblxuXHRuZWdhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgcmdiID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHRcdHJnYltpXSA9IDI1NSAtIHRoaXMudmFsdWVzLnJnYltpXTtcblx0XHR9XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ3JnYicsIHJnYik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0bGlnaHRlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy52YWx1ZXMuaHNsWzJdICs9IHRoaXMudmFsdWVzLmhzbFsyXSAqIHJhdGlvO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdoc2wnLCB0aGlzLnZhbHVlcy5oc2wpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGRhcmtlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy52YWx1ZXMuaHNsWzJdIC09IHRoaXMudmFsdWVzLmhzbFsyXSAqIHJhdGlvO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdoc2wnLCB0aGlzLnZhbHVlcy5oc2wpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHNhdHVyYXRlOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnZhbHVlcy5oc2xbMV0gKz0gdGhpcy52YWx1ZXMuaHNsWzFdICogcmF0aW87XG5cdFx0dGhpcy5zZXRWYWx1ZXMoJ2hzbCcsIHRoaXMudmFsdWVzLmhzbCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0ZGVzYXR1cmF0ZTogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy52YWx1ZXMuaHNsWzFdIC09IHRoaXMudmFsdWVzLmhzbFsxXSAqIHJhdGlvO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdoc2wnLCB0aGlzLnZhbHVlcy5oc2wpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHdoaXRlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dGhpcy52YWx1ZXMuaHdiWzFdICs9IHRoaXMudmFsdWVzLmh3YlsxXSAqIHJhdGlvO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdod2InLCB0aGlzLnZhbHVlcy5od2IpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGJsYWNrZW46IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMudmFsdWVzLmh3YlsyXSArPSB0aGlzLnZhbHVlcy5od2JbMl0gKiByYXRpbztcblx0XHR0aGlzLnNldFZhbHVlcygnaHdiJywgdGhpcy52YWx1ZXMuaHdiKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRncmV5c2NhbGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiO1xuXHRcdC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR3JheXNjYWxlI0NvbnZlcnRpbmdfY29sb3JfdG9fZ3JheXNjYWxlXG5cdFx0dmFyIHZhbCA9IHJnYlswXSAqIDAuMyArIHJnYlsxXSAqIDAuNTkgKyByZ2JbMl0gKiAwLjExO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdyZ2InLCBbdmFsLCB2YWwsIHZhbF0pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGNsZWFyZXI6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdhbHBoYScsIHRoaXMudmFsdWVzLmFscGhhIC0gKHRoaXMudmFsdWVzLmFscGhhICogcmF0aW8pKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRvcGFxdWVyOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR0aGlzLnNldFZhbHVlcygnYWxwaGEnLCB0aGlzLnZhbHVlcy5hbHBoYSArICh0aGlzLnZhbHVlcy5hbHBoYSAqIHJhdGlvKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cm90YXRlOiBmdW5jdGlvbiAoZGVncmVlcykge1xuXHRcdHZhciBodWUgPSB0aGlzLnZhbHVlcy5oc2xbMF07XG5cdFx0aHVlID0gKGh1ZSArIGRlZ3JlZXMpICUgMzYwO1xuXHRcdGh1ZSA9IGh1ZSA8IDAgPyAzNjAgKyBodWUgOiBodWU7XG5cdFx0dGhpcy52YWx1ZXMuaHNsWzBdID0gaHVlO1xuXHRcdHRoaXMuc2V0VmFsdWVzKCdoc2wnLCB0aGlzLnZhbHVlcy5oc2wpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQb3J0ZWQgZnJvbSBzYXNzIGltcGxlbWVudGF0aW9uIGluIENcblx0ICogaHR0cHM6Ly9naXRodWIuY29tL3Nhc3MvbGlic2Fzcy9ibG9iLzBlNmI0YTI4NTAwOTIzNTZhYTNlY2UwN2M2YjI0OWYwMjIxY2FjZWQvZnVuY3Rpb25zLmNwcCNMMjA5XG5cdCAqL1xuXHRtaXg6IGZ1bmN0aW9uIChtaXhpbkNvbG9yLCB3ZWlnaHQpIHtcblx0XHR2YXIgY29sb3IxID0gdGhpcztcblx0XHR2YXIgY29sb3IyID0gbWl4aW5Db2xvcjtcblx0XHR2YXIgcCA9IHdlaWdodCA9PT0gdW5kZWZpbmVkID8gMC41IDogd2VpZ2h0O1xuXG5cdFx0dmFyIHcgPSAyICogcCAtIDE7XG5cdFx0dmFyIGEgPSBjb2xvcjEuYWxwaGEoKSAtIGNvbG9yMi5hbHBoYSgpO1xuXG5cdFx0dmFyIHcxID0gKCgodyAqIGEgPT09IC0xKSA/IHcgOiAodyArIGEpIC8gKDEgKyB3ICogYSkpICsgMSkgLyAyLjA7XG5cdFx0dmFyIHcyID0gMSAtIHcxO1xuXG5cdFx0cmV0dXJuIHRoaXNcblx0XHRcdC5yZ2IoXG5cdFx0XHRcdHcxICogY29sb3IxLnJlZCgpICsgdzIgKiBjb2xvcjIucmVkKCksXG5cdFx0XHRcdHcxICogY29sb3IxLmdyZWVuKCkgKyB3MiAqIGNvbG9yMi5ncmVlbigpLFxuXHRcdFx0XHR3MSAqIGNvbG9yMS5ibHVlKCkgKyB3MiAqIGNvbG9yMi5ibHVlKClcblx0XHRcdClcblx0XHRcdC5hbHBoYShjb2xvcjEuYWxwaGEoKSAqIHAgKyBjb2xvcjIuYWxwaGEoKSAqICgxIC0gcCkpO1xuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnJnYigpO1xuXHR9LFxuXG5cdGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb2xvcih0aGlzLnJnYigpKTtcblx0fVxufTtcblxuQ29sb3IucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uIChzcGFjZSkge1xuXHR2YXIgdmFscyA9IHt9O1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcblx0XHR2YWxzW3NwYWNlLmNoYXJBdChpKV0gPSB0aGlzLnZhbHVlc1tzcGFjZV1baV07XG5cdH1cblxuXHRpZiAodGhpcy52YWx1ZXMuYWxwaGEgIT09IDEpIHtcblx0XHR2YWxzLmEgPSB0aGlzLnZhbHVlcy5hbHBoYTtcblx0fVxuXG5cdC8vIHtyOiAyNTUsIGc6IDI1NSwgYjogMjU1LCBhOiAwLjR9XG5cdHJldHVybiB2YWxzO1xufTtcblxuQ29sb3IucHJvdG90eXBlLnNldFZhbHVlcyA9IGZ1bmN0aW9uIChzcGFjZSwgdmFscykge1xuXHR2YXIgc3BhY2VzID0ge1xuXHRcdHJnYjogWydyZWQnLCAnZ3JlZW4nLCAnYmx1ZSddLFxuXHRcdGhzbDogWydodWUnLCAnc2F0dXJhdGlvbicsICdsaWdodG5lc3MnXSxcblx0XHRoc3Y6IFsnaHVlJywgJ3NhdHVyYXRpb24nLCAndmFsdWUnXSxcblx0XHRod2I6IFsnaHVlJywgJ3doaXRlbmVzcycsICdibGFja25lc3MnXSxcblx0XHRjbXlrOiBbJ2N5YW4nLCAnbWFnZW50YScsICd5ZWxsb3cnLCAnYmxhY2snXVxuXHR9O1xuXG5cdHZhciBtYXhlcyA9IHtcblx0XHRyZ2I6IFsyNTUsIDI1NSwgMjU1XSxcblx0XHRoc2w6IFszNjAsIDEwMCwgMTAwXSxcblx0XHRoc3Y6IFszNjAsIDEwMCwgMTAwXSxcblx0XHRod2I6IFszNjAsIDEwMCwgMTAwXSxcblx0XHRjbXlrOiBbMTAwLCAxMDAsIDEwMCwgMTAwXVxuXHR9O1xuXG5cdHZhciBpO1xuXHR2YXIgYWxwaGEgPSAxO1xuXHRpZiAoc3BhY2UgPT09ICdhbHBoYScpIHtcblx0XHRhbHBoYSA9IHZhbHM7XG5cdH0gZWxzZSBpZiAodmFscy5sZW5ndGgpIHtcblx0XHQvLyBbMTAsIDEwLCAxMF1cblx0XHR0aGlzLnZhbHVlc1tzcGFjZV0gPSB2YWxzLnNsaWNlKDAsIHNwYWNlLmxlbmd0aCk7XG5cdFx0YWxwaGEgPSB2YWxzW3NwYWNlLmxlbmd0aF07XG5cdH0gZWxzZSBpZiAodmFsc1tzcGFjZS5jaGFyQXQoMCldICE9PSB1bmRlZmluZWQpIHtcblx0XHQvLyB7cjogMTAsIGc6IDEwLCBiOiAxMH1cblx0XHRmb3IgKGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMudmFsdWVzW3NwYWNlXVtpXSA9IHZhbHNbc3BhY2UuY2hhckF0KGkpXTtcblx0XHR9XG5cblx0XHRhbHBoYSA9IHZhbHMuYTtcblx0fSBlbHNlIGlmICh2YWxzW3NwYWNlc1tzcGFjZV1bMF1dICE9PSB1bmRlZmluZWQpIHtcblx0XHQvLyB7cmVkOiAxMCwgZ3JlZW46IDEwLCBibHVlOiAxMH1cblx0XHR2YXIgY2hhbnMgPSBzcGFjZXNbc3BhY2VdO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnZhbHVlc1tzcGFjZV1baV0gPSB2YWxzW2NoYW5zW2ldXTtcblx0XHR9XG5cblx0XHRhbHBoYSA9IHZhbHMuYWxwaGE7XG5cdH1cblxuXHR0aGlzLnZhbHVlcy5hbHBoYSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChhbHBoYSA9PT0gdW5kZWZpbmVkID8gdGhpcy52YWx1ZXMuYWxwaGEgOiBhbHBoYSkpKTtcblxuXHRpZiAoc3BhY2UgPT09ICdhbHBoYScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgY2FwcGVkO1xuXG5cdC8vIGNhcCB2YWx1ZXMgb2YgdGhlIHNwYWNlIHByaW9yIGNvbnZlcnRpbmcgYWxsIHZhbHVlc1xuXHRmb3IgKGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcblx0XHRjYXBwZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhlc1tzcGFjZV1baV0sIHRoaXMudmFsdWVzW3NwYWNlXVtpXSkpO1xuXHRcdHRoaXMudmFsdWVzW3NwYWNlXVtpXSA9IE1hdGgucm91bmQoY2FwcGVkKTtcblx0fVxuXG5cdC8vIGNvbnZlcnQgdG8gYWxsIHRoZSBvdGhlciBjb2xvciBzcGFjZXNcblx0Zm9yICh2YXIgc25hbWUgaW4gc3BhY2VzKSB7XG5cdFx0aWYgKHNuYW1lICE9PSBzcGFjZSkge1xuXHRcdFx0dGhpcy52YWx1ZXNbc25hbWVdID0gY29udmVydFtzcGFjZV1bc25hbWVdKHRoaXMudmFsdWVzW3NwYWNlXSk7XG5cdFx0fVxuXG5cdFx0Ly8gY2FwIHZhbHVlc1xuXHRcdGZvciAoaSA9IDA7IGkgPCBzbmFtZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y2FwcGVkID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4ZXNbc25hbWVdW2ldLCB0aGlzLnZhbHVlc1tzbmFtZV1baV0pKTtcblx0XHRcdHRoaXMudmFsdWVzW3NuYW1lXVtpXSA9IE1hdGgucm91bmQoY2FwcGVkKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbkNvbG9yLnByb3RvdHlwZS5zZXRTcGFjZSA9IGZ1bmN0aW9uIChzcGFjZSwgYXJncykge1xuXHR2YXIgdmFscyA9IGFyZ3NbMF07XG5cblx0aWYgKHZhbHMgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIGNvbG9yLnJnYigpXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWVzKHNwYWNlKTtcblx0fVxuXG5cdC8vIGNvbG9yLnJnYigxMCwgMTAsIDEwKVxuXHRpZiAodHlwZW9mIHZhbHMgPT09ICdudW1iZXInKSB7XG5cdFx0dmFscyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpO1xuXHR9XG5cblx0dGhpcy5zZXRWYWx1ZXMoc3BhY2UsIHZhbHMpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbkNvbG9yLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24gKHNwYWNlLCBpbmRleCwgdmFsKSB7XG5cdGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIGNvbG9yLnJlZCgpXG5cdFx0cmV0dXJuIHRoaXMudmFsdWVzW3NwYWNlXVtpbmRleF07XG5cdH0gZWxzZSBpZiAodmFsID09PSB0aGlzLnZhbHVlc1tzcGFjZV1baW5kZXhdKSB7XG5cdFx0Ly8gY29sb3IucmVkKGNvbG9yLnJlZCgpKVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Ly8gY29sb3IucmVkKDEwMClcblx0dGhpcy52YWx1ZXNbc3BhY2VdW2luZGV4XSA9IHZhbDtcblx0dGhpcy5zZXRWYWx1ZXMoc3BhY2UsIHRoaXMudmFsdWVzW3NwYWNlXSk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG9yO1xuIiwiLyoqXG4gKiBEZXB0aCBzcGFjZSBjb29yZGluYXRlc1xuICogQHNlZSBodHRwczovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2RuNzg1NTMwLmFzcHhcbiAqL1xuJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuQk9VTkRfV0lEVEggPSA1MTJcbmV4cG9ydHMuQk9VTkRfSEVJR0hUID0gNDI0XG5cbiIsIi8qKlxuICogS2lubmVjdCBoYW5kIHN0YXR1c1xuICovXG4ndXNlIHN0cmljdCdcblxuZXhwb3J0cy5VTktOT1dOID0gMFxuZXhwb3J0cy5OT1RfVFJBQ0tFRCA9IDFcbmV4cG9ydHMuT1BFTiA9IDJcbmV4cG9ydHMuQ0xPU0VEID0gM1xuZXhwb3J0cy5MQVNTTyA9IDRcbiIsIi8qKlxuICogQ29uc3RhbnMgb2Yga2luZWN0XG4gKiBAbW9kdWxlIHNnLWtpbmVjdC1jb25zdGFudHNcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxubGV0IGQgPSAobW9kdWxlKSA9PiBtb2R1bGUuZGVmYXVsdCB8fCBtb2R1bGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBkZXB0aFNwYWNlICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9kZXB0aF9zcGFjZScpKSB9LFxuICBnZXQgaGFuZFN0YXRlICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9oYW5kX3N0YXRlJykpIH0sXG4gIGdldCBqb2ludFR5cGVzICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9qb2ludF90eXBlcycpKSB9XG59XG4iLCIvKipcbiAqIEpvaW50IHR5cGVzIG9mIGtpbm5lY3QyXG4gKiBAc2VlIGh0dHBzOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbWljcm9zb2Z0LmtpbmVjdC5qb2ludHR5cGUuYXNweFxuICovXG4ndXNlIHN0cmljdCdcblxuZXhwb3J0cy5TUElORV9CQVNFID0gMFxuZXhwb3J0cy5TUElORV9NSUQgPSAxXG5leHBvcnRzLk5FQ0sgPSAyXG5leHBvcnRzLkhFQUQgPSAzXG5leHBvcnRzLlNIT1VMREVSX0xFRlQgPSA0XG5leHBvcnRzLkVMQk9XX0xFRlQgPSA1XG5leHBvcnRzLldSSVNUX0xFRlQgPSA2XG5leHBvcnRzLkhBTkRfTEVGVCA9IDdcbmV4cG9ydHMuU0hPVUxERVJfUklHSFQgPSA4XG5leHBvcnRzLkVMQk9XX1JJR0hUID0gOVxuZXhwb3J0cy5XUklTVF9SSUdIVCA9IDEwXG5leHBvcnRzLkhBTkRfUklHSFQgPSAxMVxuZXhwb3J0cy5ISVBfTEVGVCA9IDEyXG5leHBvcnRzLktORUVfTEVGVCA9IDEzXG5leHBvcnRzLkFOS0xFX0xFRlQgPSAxNFxuZXhwb3J0cy5GT09UX0xFRlQgPSAxNVxuZXhwb3J0cy5ISVBfUklHSFQgPSAxNlxuZXhwb3J0cy5LTkVFX1JJR0hUID0gMTdcbmV4cG9ydHMuQU5LTEVfUklHSFQgPSAxOFxuZXhwb3J0cy5GT09UX1JJR0hUID0gMTlcbmV4cG9ydHMuU1BJTkVfU0hPVUxERVIgPSAyMFxuZXhwb3J0cy5IQU5EX1RJUF9MRUZUID0gMjFcbmV4cG9ydHMuVEhVTUJfTEVGVCA9IDIyXG5leHBvcnRzLkhBTkRfVElQX1JJR0hUID0gMjNcbmV4cG9ydHMuVEhVTUJfUklHSFQgPSAyNFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbihleHBvcnRzLCB7XG4gIE1JQ1JPUEhPTkVfVFJBTlNJVElPTjogODAwXG59KVxuIiwiLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gZm9yIGNvbG9yc1xuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgYXBlbWFuY29sb3IgPSByZXF1aXJlKCdhcGVtYW5jb2xvcicpXG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbihleHBvcnRzLCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSByYW5kb20gY29sb3IgZnJvbSBiYXNlIGNvbG9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZSAtIEJhc2UgY29sb3Igc3RyaW5nXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9uYWwgc2V0dGluZ3NcbiAgICogQHJldHVybnMge3N0cmluZ30gLSBHZW5lcmF0ZWQgY29sb3JcbiAgICovXG4gIHJhbmRvbUNvbG9yIChiYXNlLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgYW1vdW50ID0gcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDM2MC4wKVxuICAgIHJldHVybiBhcGVtYW5jb2xvci5yb3RhdGUoYmFzZSwgYW1vdW50KVxuICB9LFxuXG4gIC8qKlxuICAgKiBEZWZpbmUgYSBjb2xvcml6ZXIgdG8gZ2VuZXJhdGUgdW5pcXVlIGNvbG9yc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZSAtIEJhc2UgY29sb3Igc3RyaW5nXG4gICAqIEByZXR1cm5zIHtmdW5jdGlvbn0gLSBHZW5lcmF0ZWQgZnVuY3Rpb25cbiAgICovXG4gIHVuaXF1ZUNvbG9yaXplciAoYmFzZSkge1xuICAgIGxldCBjb2xvcnMgPSB7fVxuXG4gICAgLyoqXG4gICAgICogQ29sb3JpemVyIGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVW5pcXVlIGlkZW50aWZpZXJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb2xvciAtIENvbG9yIGZvciB0aGUgaWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb2xvcml6ZXIgKGlkKSB7XG4gICAgICBsZXQgY29sb3IgPSBjb2xvcnNbIGlkIF1cbiAgICAgIGlmIChjb2xvcikge1xuICAgICAgICByZXR1cm4gY29sb3JcbiAgICAgIH1cbiAgICAgIGNvbG9yID0gZXhwb3J0cy5yYW5kb21Db2xvcihiYXNlKVxuICAgICAgY29sb3JzWyBpZCBdID0gY29sb3JcbiAgICAgIHJldHVybiBjb2xvclxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oY29sb3JpemVyLCB7IGJhc2UsIGNvbG9ycyB9KVxuICAgIHJldHVybiBjb2xvcml6ZXJcbiAgfVxufSlcbiIsIi8qKlxuICogSGVscGVyIGZ1bmN0aW9ucyBmb3IgZHJhd2luZ1xuICovXG4ndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKGV4cG9ydHMsIHtcbiAgLyoqXG4gICAqIERyYXcgYSBjaXJjbGVcbiAgICogQHBhcmFtIGN0eFxuICAgKiBAcGFyYW0ge1BvaW50fSBwb2ludFxuICAgKiBAcGFyYW0gcmFkaXVzXG4gICAqL1xuICBkcmF3Q2lyY2xlIChjdHgsIHBvaW50LCByYWRpdXMpIHtcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHguYXJjKHBvaW50LngsIHBvaW50LnksIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpXG4gICAgY3R4LmZpbGwoKVxuICAgIGN0eC5jbG9zZVBhdGgoKVxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IGEgbGluZVxuICAgKiBAcGFyYW0gY3R4XG4gICAqIEBwYXJhbSB7Li4uUG9pbnR9IHBvaW50c1xuICAgKi9cbiAgZHJhd0xpbmUgKGN0eCwgLi4ucG9pbnRzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBsZXQgZnJvbSA9IHBvaW50c1sgaSBdXG4gICAgICBsZXQgdG8gPSBwb2ludHNbIGkgKyAxIF1cbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIGN0eC5tb3ZlVG8oZnJvbS54LCBmcm9tLnkpXG4gICAgICB9XG4gICAgICBjdHgubGluZVRvKHRvLngsIHRvLnkpXG4gICAgfVxuICAgIGN0eC5zdHJva2UoKVxuICAgIGN0eC5jbG9zZVBhdGgoKVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBQb2ludFxuICogQHByb3BlcnR5IHtudW1iZXJ9IHhcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB5XG4gKi9cbiIsIi8qKlxuICogUmVhY3QgY29tcG9uZW50cyBmb3IgU1VHT1MgcHJvamVjdC5cbiAqIEBtb2R1bGUgc2ctcmVhY3QtY29tcG9uZW50c1xuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IFNnQWxidW0gKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX2FsYnVtJykpIH0sXG4gIGdldCBTZ0JvZHkgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX2JvZHknKSkgfSxcbiAgZ2V0IFNnQnV0dG9uICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19idXR0b24nKSkgfSxcbiAgZ2V0IFNnSGVhZCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfaGVhZCcpKSB9LFxuICBnZXQgU2dIZWFkZXIgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX2hlYWRlcicpKSB9LFxuICBnZXQgU2dIdG1sICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19odG1sJykpIH0sXG4gIGdldCBTZ0tpbmVjdEZyYW1lICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19raW5lY3RfZnJhbWUnKSkgfSxcbiAgZ2V0IFNnTWFpbiAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfbWFpbicpKSB9LFxuICBnZXQgU2dNaWNyb3Bob25lICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19taWNyb3Bob25lJykpIH0sXG4gIGdldCBTZ1BhZ2UgKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX3BhZ2UnKSkgfSxcbiAgZ2V0IFNnU3dpdGNoICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9zZ19zd2l0Y2gnKSkgfSxcbiAgZ2V0IFNnVGhlbWVTdHlsZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vc2dfdGhlbWVfc3R5bGUnKSkgfSxcbiAgZ2V0IFNnVmlkZW8gKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL3NnX3ZpZGVvJykpIH1cbn1cbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5pbXBvcnQge0FwTmV4dEJ1dHRvbiwgQXBQcmV2QnV0dG9ufSBmcm9tICdhcGVtYW4tcmVhY3QtYnV0dG9uJ1xuXG4vKiogQGxlbmRzIFNnQWxidW0gKi9cbmNvbnN0IFNnQWxidW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqXG4gICAgICogV2lkdGgocHgpIG9mIGEgaW1hZ2UuXG4gICAgICovXG4gICAgd2lkdGg6IHR5cGVzLm51bWJlcixcbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGltYWdlIHNyYy5cbiAgICAgKi9cbiAgICBpbWFnZUxpc3Q6IHR5cGVzLmFycmF5LFxuICAgIC8qKlxuICAgICAqIE51bWJlciBvZiBpbWFnZXMgcGVyIDEgcm93IGluIHRoZSB0aHVtYm5haWwuXG4gICAgICovXG4gICAgdGh1bWJuYWlsQ29sOiB0eXBlcy5udW1iZXIsXG4gICAgLyoqXG4gICAgICogQm9yZGVyIGNvbG9yIG9mIHNlbGVjdGVkIGltYWdlIGluIHRoZSB0aHVtYm5haWwuXG4gICAgICovXG4gICAgdGh1bWJuYWlsU2VsZWN0ZWRDb2xvcjogdHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHVwZGF0ZS4gQXJndW1lbnQgaXMgaW5kZXggb2YgaW1hZ2VMaXN0LlxuICAgICAqL1xuICAgIG9uQ2hhbmdlOiB0eXBlcy5mdW5jXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW1hZ2VMaXN0OiBbXSxcbiAgICAgIHdpZHRoOiAzMDAsXG4gICAgICB0aHVtYm5haWxDb2w6IDQsXG4gICAgICB0aHVtYm5haWxTZWxlY3RlZENvbG9yOiAneWVsbG93J1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBudGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzLCBzdGF0ZSB9ID0gc1xuICAgIGxldCB7IGltYWdlTGlzdCB9ID0gcHJvcHNcbiAgICBsZXQgc3R5bGUgPSBzLmdldFN0eWxlKClcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLWFsYnVtJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIDxzdHlsZSBjbGFzc05hbWU9J3NnLWFsYnVtLXN0eWxlJyB0eXBlPSd0ZXh0L2Nzcyc+XG4gICAgICAgICAgeyBzdHlsZSB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZy1hbGJ1bS1jb250YWluZXInPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZy1hbGJ1bS1oZWFkZXInPlxuICAgICAgICAgICAgPEFwUHJldkJ1dHRvbiBvblRhcD17IHMudG9MZWZ0IH0gLz5cbiAgICAgICAgICAgIDxBcE5leHRCdXR0b24gb25UYXA9eyBzLnRvUmlnaHQgfSAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdzZy1hbGJ1bS1udGgnPiB7IHN0YXRlLm50aCB9IC8geyBpbWFnZUxpc3QubGVuZ3RoIH0gPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZy1hbGJ1bS1kaXNwbGF5Jz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZy1hbGJ1bS1mdWxsLWltZyc+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaW1hZ2VMaXN0Lm1hcCgoaW1hZ2UsIGkpID0+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPSdzZy1hbGJ1bS1pbWcnIHNyYz17IGltYWdlIH0ga2V5PXsgaSB9IC8+XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3NnLWFsYnVtLXRodW1ibmFpbCc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc2ctYWxidW0tdGh1bWJuYWlsLXNlbGVjdGVkJy8+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGltYWdlTGlzdC5tYXAoKGltYWdlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8g6YWN5YiX44Gu5YmN5pa544GL44KJ55S75YOP44KS5oy/5YWl44GX44Gm44KC44CB5ZCE55S75YOP44Gr5a++44GZ44KLa2V544KS5LiN5aSJ44Gr44GZ44KL44CC55S75YOP44OH44O844K/44KSa2V544Gr44GZ44KL44Go5ZCM44GY55S75YOP44KS5oy/5YWl44GZ44KL44Go44Ko44Op44O844Gr44Gq44KLXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IGltYWdlTGlzdC5sZW5ndGggLSBpXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdzZy1hbGJ1bS10aHVtYm5haWwtaW1nLWVmZmVjdCcga2V5PXsga2V5IH0gZGF0YT17IGkgfSBvbkNsaWNrPXsgdGhpcy5tb3ZlVG8gfT5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9J3NnLWFsYnVtLXRodW1ibmFpbC1pbWcnIHNyYz17IGltYWdlIH0ga2V5PXsga2V5IH0vPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIChuZXh0UHJvcHMpIHtcbiAgICAvLyDmlrDjgZfjgYTnlLvlg4/jgYzjgrfjg5Xjg4jjgZXjgozjgZ/jgonplrLopqfkvY3nva7jgpLmiLvjgZlcbiAgICBpZiAodGhpcy5wcm9wcy5pbWFnZUxpc3QubGVuZ3RoIDwgbmV4dFByb3BzLmltYWdlTGlzdC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRJbml0aWFsU3RhdGUoKSlcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVwZGF0ZSAobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAvLyDopqrjgrPjg7Pjg53jg7zjg43jg7Pjg4jjgYvjgonjgZPjga7jgrPjg7Pjg53jg7zjg43jg7Pjg4jjga7nirbmhYvjgpLlj5blvpfjgZnjgovjga7jgavkvb/jgYjjgotcbiAgICBsZXQgb25DaGFuZ2UgPSB0aGlzLnByb3BzLm9uQ2hhbmdlXG4gICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICBvbkNoYW5nZShuZXh0U3RhdGUubnRoIC0gMSlcbiAgICB9XG4gIH0sXG5cbiAgZ2V0U3R5bGUgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMsIHN0YXRlIH0gPSBzXG4gICAgbGV0IHsgaW1hZ2VMaXN0LCB3aWR0aCwgdGh1bWJuYWlsQ29sLCB0aHVtYm5haWxTZWxlY3RlZENvbG9yIH0gPSBwcm9wc1xuICAgIGxldCBkaXNwbGF5UmlnaHQgPSAoc3RhdGUubnRoIC0gMSkgKiB3aWR0aFxuICAgIGxldCB0aHVtYm5haWxXaWR0aCA9IHdpZHRoIC8gdGh1bWJuYWlsQ29sXG4gICAgbGV0IHRodW1ibmFpbEhlaWdodCA9IHRodW1ibmFpbFdpZHRoICogMyAvIDRcbiAgICBsZXQgdGh1bWJuYWlsTGVmdCA9IHRodW1ibmFpbFdpZHRoICogKChzdGF0ZS5udGggLSAxKSAlIHRodW1ibmFpbENvbClcbiAgICBsZXQgdGh1bWJuYWlsVG9wID0gdGh1bWJuYWlsSGVpZ2h0ICogTWF0aC5mbG9vcigoc3RhdGUubnRoIC0gMSkgLyB0aHVtYm5haWxDb2wpXG4gICAgcmV0dXJuIGBcbi5zZy1hbGJ1bS1jb250YWluZXIge1xuICB3aWR0aDogJHt3aWR0aH1weDtcbiAgbWFyZ2luOiA1cHg7XG59XG4uc2ctYWxidW0tZGlzcGxheSB7XG4gIHdpZHRoOiAke3dpZHRofXB4O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBib3JkZXItYm90dG9tOiAycHggc29saWQgIzY2Njtcbn1cbi5zZy1hbGJ1bS1mdWxsLWltZyB7XG4gIHdpZHRoOiAke3dpZHRoICogaW1hZ2VMaXN0Lmxlbmd0aH1weDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICByaWdodDogJHtkaXNwbGF5UmlnaHR9cHg7XG4gIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XG59XG4uc2ctYWxidW0taW1nIHtcbiAgd2lkdGg6ICR7d2lkdGh9cHg7XG59XG4uc2ctYWxidW0taGVhZGVyIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4uc2ctYWxidW0tbnRoIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICByaWdodDogMDtcbiAgdG9wOiAxMHB4O1xufVxuLnNnLWFsYnVtLXRodW1ibmFpbCB7XG4gIHdpZHRoOiAke3dpZHRofXB4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4uc2ctYWxidW0tdGh1bWJuYWlsLWltZy1lZmZlY3Qge1xuICB6LWluZGV4OiAxO1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgd2lkdGg6ICR7dGh1bWJuYWlsV2lkdGh9cHg7XG59XG4uc2ctYWxidW0tdGh1bWJuYWlsLWltZy1lZmZlY3Q6aG92ZXI6YmVmb3JlIHtcbiAgY29udGVudDogXCJcIjtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHotaW5kZXg6IDM7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICB3aWR0aDogJHt0aHVtYm5haWxXaWR0aH1weDtcbiAgaGVpZ2h0OiAke3RodW1ibmFpbEhlaWdodH1weDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG59XG4uc2ctYWxidW0tdGh1bWJuYWlsLWltZy1lZmZlY3Q6YWN0aXZlOmJlZm9yZSB7XG4gIGNvbnRlbnQ6IFwiXCI7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB6LWluZGV4OiAzO1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6ICR7dGh1bWJuYWlsV2lkdGh9cHg7XG4gIGhlaWdodDogJHt0aHVtYm5haWxIZWlnaHR9cHg7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xufVxuLnNnLWFsYnVtLXRodW1ibmFpbC1pbWcge1xuICB3aWR0aDogJHt0aHVtYm5haWxXaWR0aH1weDtcbn1cbi5zZy1hbGJ1bS10aHVtYm5haWwtc2VsZWN0ZWQge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgei1pbmRleDogMjtcbiAgd2lkdGg6ICR7dGh1bWJuYWlsV2lkdGh9cHg7XG4gIGhlaWdodDogJHt0aHVtYm5haWxIZWlnaHR9cHg7XG4gIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGJvcmRlcjogMnB4IHNvbGlkICR7dGh1bWJuYWlsU2VsZWN0ZWRDb2xvcn07XG4gIGxlZnQ6ICR7dGh1bWJuYWlsTGVmdH1weDtcbiAgdG9wOiAke3RodW1ibmFpbFRvcH1weDtcbn1cbmBcbiAgfSxcblxuICB0b1JpZ2h0ICgpIHtcbiAgICBsZXQgeyBwcm9wcywgc3RhdGUgfSA9IHRoaXNcbiAgICBsZXQgbnRoID0gc3RhdGUubnRoICUgcHJvcHMuaW1hZ2VMaXN0Lmxlbmd0aCArIDFcbiAgICB0aGlzLnNldFN0YXRlKHsgbnRoIH0pXG4gIH0sXG5cbiAgdG9MZWZ0ICgpIHtcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHRoaXNcbiAgICBsZXQgbnRoID0gKHN0YXRlLm50aCArIHByb3BzLmltYWdlTGlzdC5sZW5ndGggLSAyKSAlIHByb3BzLmltYWdlTGlzdC5sZW5ndGggKyAxXG4gICAgdGhpcy5zZXRTdGF0ZSh7IG50aCB9KVxuICB9LFxuXG4gIG1vdmVUbyAoZSkge1xuICAgIGxldCBudGggPSBOdW1iZXIoZS50YXJnZXQuYXR0cmlidXRlcy5kYXRhLnZhbHVlKSArIDFcbiAgICB0aGlzLnNldFN0YXRlKHsgbnRoIH0pXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnQWxidW1cbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7QXBCb2R5fSBmcm9tICdhcGVtYW4tcmVhY3QtYmFzaWMnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG4vKiogQGxlbmRzIFNnQm9keSAqL1xuY29uc3QgU2dCb2R5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxBcEJvZHkgeyAuLi5wcm9wcyB9XG4gICAgICAgIGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLWJvZHknLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L0FwQm9keT5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dCb2R5XG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQge0FwQnV0dG9ufSBmcm9tICdhcGVtYW4tcmVhY3QtYnV0dG9uJ1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuLyoqIEBsZW5kcyBTZ0J1dHRvbiAqL1xuY29uc3QgU2dCdXR0b24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEFwQnV0dG9uIHsgLi4ucHJvcHMgfVxuICAgICAgICBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1idXR0b24nLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L0FwQnV0dG9uPlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ0J1dHRvblxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcbmltcG9ydCB7QXBIZWFkfSBmcm9tICdhcGVtYW4tcmVhY3QtYmFzaWMnXG5cbi8qKiBAbGVuZHMgU2dIZWFkICovXG5jb25zdCBTZ0hlYWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEFwSGVhZCB7IC4uLnByb3BzIH1cbiAgICAgICAgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctaGVhZCcsIHByb3BzLmNsYXNzTmFtZSkgfVxuICAgICAgICBzdHlsZT17IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLnN0eWxlKSB9PlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvQXBIZWFkPlxuICAgIClcbiAgfVxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBTZ0hlYWRcbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbi8qKiBAbGVuZHMgU2dIZWFkZXIgKi9cbmNvbnN0IFNnSGVhZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctaGVhZGVyJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnSGVhZGVyXG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dIdG1sXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuaW1wb3J0IHtBcEh0bWx9IGZyb20gJ2FwZW1hbi1yZWFjdC1iYXNpYydcblxuLyoqIEBsZW5kcyBTZ0h0bWwgKi9cbmNvbnN0IFNnSHRtbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcblxuICAgIHJldHVybiAoXG4gICAgICA8QXBIdG1sIGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLWh0bWwnLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L0FwSHRtbD5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dIdG1sXG4iLCIvKipcbiAqIEhUTUwgQ29tcG9uZW50XG4gKiBAY2xhc3MgU2dLaW5lY3RGcmFtZVxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcbmltcG9ydCBhcGVtYW5jb2xvciBmcm9tICdhcGVtYW5jb2xvcidcbmltcG9ydCB7ZGVwdGhTcGFjZSwgam9pbnRUeXBlc30gZnJvbSAnc2cta2luZWN0LWNvbnN0YW50cydcbmltcG9ydCAqIGFzIGRyYXdIZWxwZXIgZnJvbSAnLi9oZWxwZXJzL2RyYXdfaGVscGVyJ1xuaW1wb3J0ICogYXMgY29sb3JIZWxwZXIgZnJvbSAnLi9oZWxwZXJzL2NvbG9yX2hlbHBlcidcblxuLyoqIEBsZW5kcyBTZ0tpbmVjdEZyYW1lICovXG5jb25zdCBTZ0tpbmVjdEZyYW1lID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqIEJvZHkgZnJhbWUgZGF0YSBmcm9tIGtpbmVjdCAqL1xuICAgIGJvZGllczogdHlwZXMuYXJyYXksXG4gICAgLyoqIENvbXBvbmVudCB3aWR0aCAqL1xuICAgIHdpZHRoOiB0eXBlcy5udW1iZXIsXG4gICAgLyoqIENvbXBvbmVudCBoZWlnaHQgKi9cbiAgICBoZWlnaHQ6IHR5cGVzLm51bWJlcixcbiAgICAvKiogV2lkdGggb2YgZnJhbWVzICovXG4gICAgZnJhbWVXaWR0aDogdHlwZXMubnVtYmVyLFxuICAgIC8qKiBSYWRpdXMgb2Ygam9pbnQgKi9cbiAgICBqb2ludFJhZGl1czogdHlwZXMubnVtYmVyLFxuICAgIC8qKiBTY2FsZSByYXRlIG9mIGNhbnZhcyAqL1xuICAgIHNjYWxlOiB0eXBlcy5udW1iZXIsXG4gICAgLyoqIEFsdCBtZXNzYWdlIHdoZW4gbm8gYm9keSBmb3VuZCAqL1xuICAgIGFsdDogdHlwZXMuc3RyaW5nLFxuICAgIC8qKiBDb2xvcml6ZXIgZnVuY3Rpb24gKi9cbiAgICBjb2xvcml6ZXI6IHR5cGVzLmZ1bmNcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogZGVwdGhTcGFjZS5CT1VORF9XSURUSCxcbiAgICAgIGhlaWdodDogZGVwdGhTcGFjZS5CT1VORF9IRUlHSFQsXG4gICAgICBmcmFtZVdpZHRoOiA0LFxuICAgICAgam9pbnRSYWRpdXM6IDMsXG4gICAgICBzY2FsZTogMixcbiAgICAgIGFsdDogJ05PIEJPRFkgRk9VTkQnLFxuICAgICAgY29sb3JpemVyOiBjb2xvckhlbHBlci51bmlxdWVDb2xvcml6ZXIoJyNDQ0NDMzMnKVxuICAgIH1cbiAgfSxcblxuICBzdGF0aWNzOiB7fSxcblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG4gICAgbGV0IHsgd2lkdGgsIGhlaWdodCwgc2NhbGUgfSA9IHByb3BzXG4gICAgbGV0IHN0eWxlID0gcy5nZXRTdHlsZSgpXG4gICAgbGV0IGlzRW1wdHkgPSBzLmdldEJvZGllcygpLmxlbmd0aCA9PT0gMFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLWtpbm5lY3QtZnJhbWUnLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgfSwgc3R5bGUubWFpbiwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgaXNFbXB0eSA/IHMuX3JlbmRlckFsdChzdHlsZS5hbHQpIDogbnVsbCB9XG4gICAgICAgIDxjYW52YXMgd2lkdGg9eyB3aWR0aCAqIHNjYWxlIH1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9eyBoZWlnaHQgKiBzY2FsZSB9XG4gICAgICAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgIHdpZHRoLCBoZWlnaHRcbiAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgcmVmPXsgKGNhbnZhcykgPT4gcy5yZWdpc3RlckNhbnZhcyhjYW52YXMpIH0vPlxuICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcy5fdHJhY2tpbmdDb2xvcnMgPSB7fVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgKG5leHRQcm9wcykge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcy5kcmF3Qm9keShzLmdldEJvZGllcygpKVxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50ICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHMuZHJhd0JvZHkocy5nZXRCb2RpZXMoKSlcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGUgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgcy5kcmF3Qm9keShzLmdldEJvZGllcygpKVxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZHJhd0JvZHkgKGJvZGllcykge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgY2FudmFzIH0gPSBzXG5cbiAgICBpZiAoIWNhbnZhcykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgU1BJTkVfQkFTRSwgU1BJTkVfTUlELCBORUNLLCBIRUFELCBTSE9VTERFUl9MRUZULFxuICAgICAgRUxCT1dfTEVGVCwgV1JJU1RfTEVGVCwgSEFORF9MRUZULCBTSE9VTERFUl9SSUdIVCxcbiAgICAgIEVMQk9XX1JJR0hULCBXUklTVF9SSUdIVCwgSEFORF9SSUdIVCwgSElQX0xFRlQsIEtORUVfTEVGVCxcbiAgICAgIEFOS0xFX0xFRlQsIEZPT1RfTEVGVCwgSElQX1JJR0hULCBLTkVFX1JJR0hULCBBTktMRV9SSUdIVCxcbiAgICAgIEZPT1RfUklHSFQsIFNQSU5FX1NIT1VMREVSLCBIQU5EX1RJUF9MRUZULCBUSFVNQl9MRUZULFxuICAgICAgSEFORF9USVBfUklHSFQsIFRIVU1CX1JJR0hUXG4gICAgfSA9IGpvaW50VHlwZXNcblxuICAgIGxldCB7IHByb3BzIH0gPSBzXG4gICAgbGV0IHsgd2lkdGgsIGhlaWdodCwgZnJhbWVXaWR0aCwgam9pbnRSYWRpdXMsIHNjYWxlLCBjb2xvcml6ZXIgfSA9IHByb3BzXG5cbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICBjdHguc2F2ZSgpXG5cbiAgICBjb25zdCB7IGRyYXdDaXJjbGUsIGRyYXdMaW5lIH0gPSBkcmF3SGVscGVyXG4gICAgbGV0IHRvUG9pbnQgPSAoam9pbnQpID0+ICh7XG4gICAgICB4OiBqb2ludC5kZXB0aFggKiB3aWR0aCxcbiAgICAgIHk6IGpvaW50LmRlcHRoWSAqIGhlaWdodFxuICAgIH0pXG5cbiAgICBjdHguc2NhbGUoc2NhbGUsIHNjYWxlKVxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodClcblxuICAgIGZvciAobGV0IGJvZHkgb2YgYm9kaWVzKSB7XG4gICAgICBsZXQgeyBqb2ludHMsIHRyYWNraW5nSWQgfSA9IGJvZHlcblxuICAgICAgbGV0IGNvbG9yID0gY29sb3JpemVyKGB0cmFja2luZy0ke3RyYWNraW5nSWR9YClcbiAgICAgIGxldCBwb2ludHMgPSBqb2ludHMubWFwKHRvUG9pbnQpXG5cbiAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYXBlbWFuY29sb3IucGFyc2UoY29sb3IpLmFscGhhKDAuNjYpLnJnYmFTdHJpbmcoKVxuICAgICAgY3R4LmxpbmVXaWR0aCA9IGZyYW1lV2lkdGhcblxuICAgICAgbGV0IHNwaW5lQiA9IHBvaW50c1sgU1BJTkVfQkFTRSBdXG4gICAgICBsZXQgc3BpbmVNID0gcG9pbnRzWyBTUElORV9NSUQgXVxuICAgICAgbGV0IG5lY2sgPSBwb2ludHNbIE5FQ0sgXVxuICAgICAgbGV0IGhlYWQgPSBwb2ludHNbIEhFQUQgXVxuICAgICAgbGV0IHNob3VsZGVyTCA9IHBvaW50c1sgU0hPVUxERVJfTEVGVCBdXG4gICAgICBsZXQgZWxib3dMID0gcG9pbnRzWyBFTEJPV19MRUZUIF1cbiAgICAgIGxldCB3cmlzdEwgPSBwb2ludHNbIFdSSVNUX0xFRlQgXVxuICAgICAgbGV0IGhhbmRMID0gcG9pbnRzWyBIQU5EX0xFRlQgXVxuICAgICAgbGV0IHNob3VsZGVyUiA9IHBvaW50c1sgU0hPVUxERVJfUklHSFQgXVxuICAgICAgbGV0IGVsYm93UiA9IHBvaW50c1sgRUxCT1dfUklHSFQgXVxuICAgICAgbGV0IHdyaXN0UiA9IHBvaW50c1sgV1JJU1RfUklHSFQgXVxuICAgICAgbGV0IGhhbmRSID0gcG9pbnRzWyBIQU5EX1JJR0hUIF1cbiAgICAgIGxldCBoaXBMID0gcG9pbnRzWyBISVBfTEVGVCBdXG4gICAgICBsZXQga25lZUwgPSBwb2ludHNbIEtORUVfTEVGVCBdXG4gICAgICBsZXQgYW5rbGVMID0gcG9pbnRzWyBBTktMRV9MRUZUIF1cbiAgICAgIGxldCBmb290TCA9IHBvaW50c1sgRk9PVF9MRUZUIF1cbiAgICAgIGxldCBoaXBSID0gcG9pbnRzWyBISVBfUklHSFQgXVxuICAgICAgbGV0IGtuZWVSID0gcG9pbnRzWyBLTkVFX1JJR0hUIF1cbiAgICAgIGxldCBhbmtsZVIgPSBwb2ludHNbIEFOS0xFX1JJR0hUIF1cbiAgICAgIGxldCBmb290UiA9IHBvaW50c1sgRk9PVF9SSUdIVCBdXG4gICAgICBsZXQgc3BpbmVTaG91bGRlciA9IHBvaW50c1sgU1BJTkVfU0hPVUxERVIgXVxuICAgICAgbGV0IGhhbmRUaXBMID0gcG9pbnRzWyBIQU5EX1RJUF9MRUZUIF1cbiAgICAgIGxldCB0aHVtYkwgPSBwb2ludHNbIFRIVU1CX0xFRlQgXVxuICAgICAgbGV0IGhhbmRUaXBSID0gcG9pbnRzWyBIQU5EX1RJUF9SSUdIVCBdXG4gICAgICBsZXQgdGh1bWJSID0gcG9pbnRzWyBUSFVNQl9SSUdIVCBdXG5cbiAgICAgIC8vIERyYXcgbGluZXNcbiAgICAgIHtcbiAgICAgICAgbGV0IGxpbmVQb2ludHMgPSBbXG4gICAgICAgICAgWyBoZWFkLCBuZWNrLCBzcGluZVNob3VsZGVyLCBzcGluZU0sIHNwaW5lQiBdLFxuICAgICAgICAgIFsgc3BpbmVTaG91bGRlciwgc2hvdWxkZXJMLCBlbGJvd0wsIHdyaXN0TCwgaGFuZEwsIGhhbmRUaXBMLCB0aHVtYkwgXSxcbiAgICAgICAgICBbIHNwaW5lQiwgaGlwTCwga25lZUwsIGFua2xlTCwgZm9vdEwgXSxcbiAgICAgICAgICBbIHNwaW5lU2hvdWxkZXIsIHNob3VsZGVyUiwgZWxib3dSLCB3cmlzdFIsIGhhbmRSLCBoYW5kVGlwUiwgdGh1bWJSIF0sXG4gICAgICAgICAgWyBzcGluZUIsIGhpcFIsIGtuZWVSLCBhbmtsZVIsIGZvb3RSIF1cbiAgICAgICAgXVxuICAgICAgICBmb3IgKGxldCBsaW5lUG9pbnQgb2YgbGluZVBvaW50cykge1xuICAgICAgICAgIGRyYXdMaW5lKGN0eCwgLi4ubGluZVBvaW50KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIERyYXcgY2lyY2xlc1xuICAgICAge1xuICAgICAgICBjb25zdCBSQURJVVMgPSBqb2ludFJhZGl1c1xuICAgICAgICBsZXQgY2lyY2xlUG9pbnRzID0gW1xuICAgICAgICAgIGhlYWQsIG5lY2ssIHNwaW5lU2hvdWxkZXIsIHNwaW5lTSwgc3BpbmVCLFxuICAgICAgICAgIHNob3VsZGVyTCwgaGlwTCwgZWxib3dMLCB3cmlzdEwsXG4gICAgICAgICAgc2hvdWxkZXJSLCBoaXBSLCBlbGJvd1IsIHdyaXN0UixcbiAgICAgICAgICBoYW5kTCwgaGFuZFRpcEwsIHRodW1iTCxcbiAgICAgICAgICBoYW5kUiwgaGFuZFRpcFIsIHRodW1iUlxuICAgICAgICBdXG4gICAgICAgIGZvciAobGV0IGNpcmNsZVBvaW50IG9mIGNpcmNsZVBvaW50cykge1xuICAgICAgICAgIGRyYXdDaXJjbGUoY3R4LCBjaXJjbGVQb2ludCwgUkFESVVTKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3R4LnJlc3RvcmUoKVxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEN1c3RvbVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlZ2lzdGVyQ2FudmFzIChjYW52YXMpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHMuY2FudmFzID0gY2FudmFzXG4gIH0sXG5cbiAgZ2V0U3R5bGUgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICB9LFxuICAgICAgYWx0OiB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGNvbG9yOiAnI0VFRScsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgIGZvbnRTaXplOiAnMzZweCcsXG4gICAgICAgIHpJbmRleDogJzQnLFxuICAgICAgICBsaW5lSGVpZ2h0OiAnMWVtJyxcbiAgICAgICAgd29yZEJyZWFrOiAnYnJlYWstd29yZCcsXG4gICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcidcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZ2V0Qm9kaWVzICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzIH0gPSBzXG4gICAgcmV0dXJuIChwcm9wcy5ib2RpZXMgfHwgW10pXG4gICAgICAuZmlsdGVyKChib2R5KSA9PiAhIWJvZHkpXG4gICAgICAuZmlsdGVyKChib2R5KSA9PiBib2R5LnRyYWNrZWQpXG4gIH0sXG5cbiAgX3JlbmRlckFsdCAoc3R5bGUpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzIH0gPSBzXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2cta2lubmVjdC1mcmFtZS1hbHRcIiBzdHlsZT17IHN0eWxlIH1cbiAgICAgID57IHByb3BzLmFsdCB9PC9kaXY+XG4gICAgKVxuICB9LFxuXG4gIGNhbnZhczogbnVsbCxcblxuICBfdHJhY2tpbmdDb2xvcnM6IG51bGxcblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dLaW5lY3RGcmFtZVxuIiwiLyoqXG4gKiBIVE1MIENvbXBvbmVudFxuICogQGNsYXNzIFNnSHRtbFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuLyoqIEBsZW5kcyBTZ01haW4gKi9cbmNvbnN0IFNnTWFpbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBzdGF0ZSwgcHJvcHMgfSA9IHNcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLW1haW4nLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dNYWluXG4iLCIvKipcbiAqIE1pY3JvcGhvbmUgY29tcG9uZW50XG4gKiBAY2xhc3MgU2dNaWNyb3Bob25lXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtBcEljb259IGZyb20gJ2FwZW1hbi1yZWFjdC1iYXNpYydcbmltcG9ydCB7QXBUb3VjaE1peGluLCBBcFB1cmVNaXhpbn0gZnJvbSAnYXBlbWFuLXJlYWN0LW1peGlucydcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbmNvbnN0IHsgTUlDUk9QSE9ORV9UUkFOU0lUSU9OIH0gPSByZXF1aXJlKCcuL2NvbnN0YW50cy9hbmltYXRpb25fY29uc3RhbnRzJylcblxuLyoqIEBsZW5kcyBTZ01pY3JvcGhvbmUgKi9cbmNvbnN0IFNnTWljcm9waG9uZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTcGVjc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHByb3BUeXBlczoge1xuICAgIHdpZHRoOiB0eXBlcy5udW1iZXIsXG4gICAgaGVpZ2h0OiB0eXBlcy5udW1iZXIsXG4gICAgb246IHR5cGVzLmJvb2xcbiAgfSxcblxuICBzdGF0aWNzOiB7XG4gICAgTUlDUk9QSE9ORV9UUkFOU0lUSU9OXG4gIH0sXG5cbiAgbWl4aW5zOiBbXG4gICAgQXBUb3VjaE1peGluLFxuICAgIEFwUHVyZU1peGluXG4gIF0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IDQ0LFxuICAgICAgaGVpZ2h0OiA0NCxcbiAgICAgIG9uOiBmYWxzZVxuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBlbmxhcmdlZDogZmFsc2VcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCBzdHlsZSA9IHMuZ2V0U3R5bGUoKVxuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuICAgIGxldCB7IG9uIH0gPSBwcm9wc1xuICAgIHJldHVybiAoXG4gICAgICA8YSBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1taWNyb3Bob25lJywge1xuICAgICAgICAnc2ctbWljcm9waG9uZS1vbic6IG9uXG4gICAgICB9KX1cbiAgICAgICAgIHN0eWxlPXsgc3R5bGUucm9vdCB9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLW1pY3JvcGhvbmUtYmFjaycsIHtcbiAgICAgICAgJ3NnLW1pY3JvcGhvbmUtYmFjay1lbmxhcmdlZCc6IHN0YXRlLmVubGFyZ2VkXG4gICAgICAgIH0pIH0+PC9kaXY+XG4gICAgICAgIDxBcEljb24gY2xhc3NOYW1lPVwiZmEgZmEtbWljcm9waG9uZSBzZy1taWNyb3Bob25lLWljb25cIlxuICAgICAgICAgICAgICAgIHN0eWxlPXsgc3R5bGUuaWNvbiB9XG4gICAgICAgIC8+XG4gICAgICA8L2E+XG4gICAgKVxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIExpZmVjeWNsZVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGNvbXBvbmVudERpZE1vdW50ICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIHMuX2FubWF0aW9uVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBjb25zdCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuICAgICAgaWYgKHByb3BzLm9uKSB7XG4gICAgICAgIHMuc2V0U3RhdGUoe1xuICAgICAgICAgIGVubGFyZ2VkOiAhc3RhdGUuZW5sYXJnZWRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCBNSUNST1BIT05FX1RSQU5TSVRJT04pXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVuTW91bnQgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgY2xlYXJJbnRlcnZhbChzLl9hbm1hdGlvblRpbWVyKVxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEN1c3RvbVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGdldFN0eWxlICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzIH0gPSBzXG4gICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gcHJvcHNcbiAgICByZXR1cm4ge1xuICAgICAgcm9vdDoge1xuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0XG4gICAgICB9LFxuICAgICAgaWNvbjoge1xuICAgICAgICBmb250U2l6ZTogaGVpZ2h0ICogMC42NlxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBTZ01pY3JvcGhvbmVcbiIsIi8qKlxuICogSFRNTCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ0h0bWxcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbi8qKiBAbGVuZHMgU2dQYWdlICovXG5jb25zdCBTZ1BhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eyBjbGFzc25hbWVzKCdzZy1wYWdlJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH0+XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnUGFnZVxuIiwiLyoqXG4gKiBTZ1N3aXRjaCBDb21wb25lbnRcbiAqIEBjbGFzcyBTZ1N3aXRjaFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMgYXMgdHlwZXN9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtBcFN3aXRjaH0gZnJvbSAnYXBlbWFuLXJlYWN0LXN3aXRjaCdcbmltcG9ydCB7QXBTdHlsZX0gZnJvbSAnYXBlbWFuLXJlYWN0LXN0eWxlJ1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcblxuLyoqIEBsZW5kcyBTZ1N3aXRjaCAqL1xuY29uc3QgU2dTd2l0Y2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIC8qKlxuICAgICAqIFdpZHRoKHB4KSBvZiBhIHN3aXRjaC5cbiAgICAgKi9cbiAgICB3aWR0aDogdHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIFRoZSBzdGF0ZSBvZiBvbi9vZmYuXG4gICAgICovXG4gICAgb246IHR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gb24gdGFwLlxuICAgICAqL1xuICAgIG9uVGFwOiB0eXBlcy5mdW5jLFxuICAgIG9uVGl0bGU6IHR5cGVzLnN0cmluZyxcbiAgICBvZmZUaXRsZTogdHlwZXMuc3RyaW5nLFxuICAgIGhpZ2hsaWdodENvbG9yOiB0eXBlcy5zdHJpbmcsXG4gICAgYmFja2dyb3VuZENvbG9yOiB0eXBlcy5zdHJpbmcsXG4gICAgYm9yZGVyQ29sb3I6IHR5cGVzLnN0cmluZyxcbiAgICBoYW5kbGVTaXplOiB0eXBlcy5udW1iZXJcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUgKCkge1xuICAgIGxldCBzdHlsZSA9IHRoaXMuY3VzdG9tU3R5bGUoKVxuICAgIHJldHVybiB7IHN0eWxlIH1cbiAgfSxcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMsIHN0YXRlIH0gPSBzXG4gICAgbGV0IHsgc3R5bGUgfSA9IHN0YXRlXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnc2ctc3dpdGNoJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7ZGlzcGxheTogJ2lubGluZS1ibG9jaycsIG1hcmdpbjogJzRweCd9LCBwcm9wcy5zdHlsZSkgfSA+XG4gICAgICAgIDxBcFN0eWxlIGRhdGE9eyBzdHlsZSB9IC8+XG4gICAgICAgIDxBcFN3aXRjaCB7IC4uLnByb3BzIH0vPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9LFxuXG4gIGN1c3RvbVN0eWxlICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzIH0gPSBzXG5cbiAgICBsZXQgeyBoaWdobGlnaHRDb2xvciwgYmFja2dyb3VuZENvbG9yLCBib3JkZXJDb2xvciB9ID0gcHJvcHNcbiAgICBsZXQgaGFuZGxlU2l6ZSA9IHByb3BzLmhhbmRsZVNpemUgfHwgMjRcbiAgICBsZXQgbWluV2lkdGggPSBoYW5kbGVTaXplICogMS41XG4gICAgbGV0IHN0eWxlID0ge1xuICAgICAgJy5hcC1zd2l0Y2gtbGFiZWwnOiB7XG4gICAgICAgIGZvbnRTaXplOiAnMTRweCcsXG4gICAgICAgIGxpbmVIZWlnaHQ6IGAke2hhbmRsZVNpemV9cHhgXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtbGFiZWwtdGV4dCc6IHtcbiAgICAgICAgbWluV2lkdGg6IG1pbldpZHRoXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb24tbGFiZWwnOiB7XG4gICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICBtYXJnaW5SaWdodDogLTEgKiBoYW5kbGVTaXplIC8gMlxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLW9mZi1sYWJlbCc6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNGQUZBRkEnLFxuICAgICAgICBjb2xvcjogJyNBQUEnLFxuICAgICAgICBtYXJnaW5MZWZ0OiAtMSAqIGhhbmRsZVNpemUgLyAyXG4gICAgICB9LFxuICAgICAgJy5hcC1zd2l0Y2gtb24gLmFwLXN3aXRjaC1vZmYtbGFiZWwnOiB7XG4gICAgICAgIHdpZHRoOiBgJHtoYW5kbGVTaXplIC8gMiArIDJ9cHggIWltcG9ydGFudGBcbiAgICAgIH0sXG4gICAgICAnLmFwLXN3aXRjaC1vZmYgLmFwLXN3aXRjaC1vbi1sYWJlbCc6IHtcbiAgICAgICAgd2lkdGg6IGAke2hhbmRsZVNpemUgLyAyICsgMn1weCAhaW1wb3J0YW50YFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLWlubmVyJzoge1xuICAgICAgICBoZWlnaHQ6IGhhbmRsZVNpemUsXG4gICAgICAgIGJvcmRlclJhZGl1czogKGhhbmRsZVNpemUgLyAyICsgMSksXG4gICAgICAgIG1pbldpZHRoOiBtaW5XaWR0aFxuICAgICAgfSxcbiAgICAgICcuYXAtc3dpdGNoLWhhbmRsZSc6IHtcbiAgICAgICAgd2lkdGg6IGhhbmRsZVNpemUsXG4gICAgICAgIGhlaWdodDogaGFuZGxlU2l6ZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaGlnaGxpZ2h0Q29sb3IpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oc3R5bGVbJy5hcC1zd2l0Y2gtb24tbGFiZWwnXSwge1xuICAgICAgICBiYWNrZ3JvdW5kOiBoaWdobGlnaHRDb2xvclxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKGJhY2tncm91bmRDb2xvcikge1xuICAgICAgT2JqZWN0LmFzc2lnbihzdHlsZVsnLmFwLXN3aXRjaC1pbm5lciddLCB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZENvbG9yXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAoYm9yZGVyQ29sb3IpIHtcbiAgICAgIGxldCBib3JkZXJDb2xvck9wdGlvbiA9IHtcbiAgICAgICAgYm9yZGVyOiBgMXB4IHNvbGlkICR7Ym9yZGVyQ29sb3J9YFxuICAgICAgfVxuICAgICAgT2JqZWN0LmFzc2lnbihzdHlsZVsnLmFwLXN3aXRjaC1pbm5lciddLCBib3JkZXJDb2xvck9wdGlvbilcbiAgICAgIE9iamVjdC5hc3NpZ24oc3R5bGVbJy5hcC1zd2l0Y2gtaGFuZGxlJ10sIGJvcmRlckNvbG9yT3B0aW9uKVxuICAgIH1cbiAgICByZXR1cm4gc3R5bGVcbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dTd2l0Y2hcbiIsIi8qKlxuICogU3R5bGUgZm9yIFNnSHRtbC5cbiAqIEBjb25zdHJ1Y3RvciBTZ1RoZW1lU3R5bGVcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7QXBTdHlsZX0gZnJvbSAnYXBlbWFuLXJlYWN0LXN0eWxlJ1xuaW1wb3J0IHtBcFRoZW1lU3R5bGV9IGZyb20gJ2FwZW1hbi1yZWFjdC10aGVtZSdcblxuY29uc3QgeyBNSUNST1BIT05FX1RSQU5TSVRJT04gfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL2FuaW1hdGlvbl9jb25zdGFudHMnKVxuXG4vKiogQGxlbmRzIFNnVGhlbWVTdHlsZSAqL1xuY29uc3QgU2dUaGVtZVN0eWxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBzdHlsZTogdHlwZXMub2JqZWN0LFxuICAgIGRvbWluYW50OiB0eXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3R5bGU6IHt9LFxuICAgICAgZG9taW5hbnQ6IEFwU3R5bGUuREVGQVVMVF9ISUdITElHSFRfQ09MT1JcbiAgICB9XG4gIH0sXG4gIHJlbmRlciAoKSB7XG4gICAgY29uc3QgcyA9IHRoaXNcbiAgICBsZXQgeyBwcm9wcyB9ID0gc1xuXG4gICAgbGV0IHsgZG9taW5hbnQgfSA9IHByb3BzXG5cbiAgICBsZXQgc3R5bGUgPSB7XG4gICAgICAnLnNnLWh0bWwnOiB7fSxcbiAgICAgICcuc2ctbWljcm9waG9uZSc6IHtcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1mbGV4JyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICBjb2xvcjogJ2luaGVyaXQnXG4gICAgICB9LFxuICAgICAgJy5zZy1taWNyb3Bob25lLWJhY2snOiB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGRvbWluYW50LFxuICAgICAgICBkaXNwbGF5OiAnbm9uZScsXG4gICAgICAgIHRvcDogJzlweCcsXG4gICAgICAgIGxlZnQ6ICc5cHgnLFxuICAgICAgICByaWdodDogJzlweCcsXG4gICAgICAgIGJvdHRvbTogJzlweCcsXG4gICAgICAgIHRyYW5zaXRpb246IGB0cmFuc2Zvcm0gJHtNSUNST1BIT05FX1RSQU5TSVRJT059bXNgLFxuICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICc1MCUgNTAlJyxcbiAgICAgICAgdHJhbnNmb3JtOiAnc2NhbGUoMSwgMSknXG4gICAgICB9LFxuICAgICAgJy5zZy1taWNyb3Bob25lLW9uIC5zZy1taWNyb3Bob25lLWJhY2snOiB7XG4gICAgICAgIGRpc3BsYXk6ICdibG9jaydcbiAgICAgIH0sXG4gICAgICAnLnNnLW1pY3JvcGhvbmUtb24gLnNnLW1pY3JvcGhvbmUtaWNvbic6IHtcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgIG9wYWNpdHk6IDAuOVxuICAgICAgfSxcbiAgICAgICcuc2ctbWljcm9waG9uZS1iYWNrLWVubGFyZ2VkJzoge1xuICAgICAgICB0cmFuc2Zvcm06ICdzY2FsZSgyLCAyKSdcbiAgICAgIH0sXG4gICAgICAnLnNnLW1pY3JvcGhvbmUtaWNvbic6IHtcbiAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgIHpJbmRleDogNCxcbiAgICAgICAgb3BhY2l0eTogMC43NVxuICAgICAgfSxcbiAgICAgICcuc2ctbWljcm9waG9uZTpob3ZlciAuc2ctbWljcm9waG9uZS1pY29uJzoge1xuICAgICAgICBvcGFjaXR5OiAxXG4gICAgICB9LFxuICAgICAgJy5zZy1taWNyb3Bob25lOmFjdGl2ZSAuc2ctbWljcm9waG9uZS1pY29uJzoge1xuICAgICAgICBvcGFjaXR5OiAwLjlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxBcFRoZW1lU3R5bGUgeyAuLi5wcm9wcyB9XG4gICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbihzdHlsZSwgcHJvcHMuc3R5bGUpIH1cbiAgICAgID57IHByb3BzLmNoaWxkcmVuIH08L0FwVGhlbWVTdHlsZT5cbiAgICApXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IFNnVGhlbWVTdHlsZVxuIiwiLyoqXG4gKiBTZ1ZpZGVvIENvbXBvbmVudFxuICogQGNsYXNzIFNnVmlkZW9cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG5cbi8qKiBAbGVuZHMgU2dWaWRlbyAqL1xuY29uc3QgU2dWaWRlbyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3BlY3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBwcm9wVHlwZXM6IHtcbiAgICAvKiogVmlkZW8gc291cmNlIFVSTCAqL1xuICAgIHNyYzogdHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIHR5cGVzLnN0cmluZyxcbiAgICAgIHR5cGVzLmFycmF5T2YodHlwZXMuc3RyaW5nKVxuICAgIF0pLFxuICAgIC8qKiBSZWdpc3RlciBwbGF5ZXIgKi9cbiAgICBwbGF5ZXJSZWY6IHR5cGVzLmZ1bmNcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwbGF5ZXJSZWYgKCkge31cbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyICgpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHN0YXRlLCBwcm9wcyB9ID0gc1xuICAgIGxldCBzcmMgPSBbXS5jb25jYXQocHJvcHMuc3JjIHx8IFtdKVxuICAgIHJldHVybiAoXG4gICAgICA8dmlkZW8geyAuLi5wcm9wcyB9XG4gICAgICAgIGNsYXNzTmFtZT17IGNsYXNzbmFtZXMoJ3NnLXZpZGVvJywgcHJvcHMuY2xhc3NOYW1lKSB9XG4gICAgICAgIHN0eWxlPXsgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMuc3R5bGUpIH1cbiAgICAgICAgcmVmPXsgKHBsYXllcikgPT4gcHJvcHMucGxheWVyUmVmKHBsYXllcikgfVxuICAgICAgPlxuICAgICAgICB7IHNyYy5tYXAoKHNyYykgPT4gKFxuICAgICAgICAgIDxzb3VyY2Ugc3JjPXsgc3JjIH0ga2V5PXsgc3JjIH0vPilcbiAgICAgICAgKSB9XG4gICAgICAgIHsgcHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC92aWRlbz5cbiAgICApXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgU2dWaWRlb1xuIl19
