(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
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

},{"_process":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
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

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":5,"_process":4,"inherits":2}],7:[function(require,module,exports){
/**
 * Browser script for docs.
 *
 * Generated by coz on 6/9/2016,
 * from a template provided by apeman-bud-mock.
 */
'use strict';

var _apemanBrwsReact = require('apeman-brws-react');

var _apemanBrwsReact2 = _interopRequireDefault(_apemanBrwsReact);

var _docsComponent = require('../components/docs.component.js');

var _docsComponent2 = _interopRequireDefault(_docsComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONTAINER_ID = 'docs-wrap';
window.onload = function () {
  var _window = window;
  var locale = _window.locale;

  _apemanBrwsReact2.default.render(CONTAINER_ID, _docsComponent2.default, {
    locale: locale
  }, function done() {
    // The component is ready.
  });
};
},{"../components/docs.component.js":8,"apeman-brws-react":"apeman-brws-react"}],8:[function(require,module,exports){
/**
 * Component of docs.
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

var _apemanReactStyle = require('apeman-react-style');

var _apemanReactBasic = require('apeman-react-basic');

var _apemanReactMixins = require('apeman-react-mixins');

var _header = require('./fragments/header');

var _header2 = _interopRequireDefault(_header);

var _guide_view = require('./views/guide_view');

var _guide_view2 = _interopRequireDefault(_guide_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DocsComponent = _react2.default.createClass({
  displayName: 'DocsComponent',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  getInitialState: function getInitialState() {
    return {};
  },
  getDefaultProps: function getDefaultProps() {
    return {
      stacker: new _apemanReactBasic.ApViewStack.Stacker({
        root: _guide_view2.default,
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
      _react2.default.createElement(_header2.default, { tab: 'DOCS' }),
      _react2.default.createElement(
        _apemanReactBasic.ApMain,
        null,
        _react2.default.createElement(_apemanReactBasic.ApViewStack, { stacker: props.stacker })
      )
    );
  }
});

exports.default = DocsComponent;
},{"./fragments/header":9,"./views/guide_view":12,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","apeman-react-style":"apeman-react-style","react":"react"}],9:[function(require,module,exports){
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
},{"../../services/link_service":14,"../fragments/logo":10,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],10:[function(require,module,exports){
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
},{"react":"react"}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Snippet = _react2.default.createClass({
  displayName: 'Snippet',

  propTypes: {
    src: _react.PropTypes.string.isRequired
  },
  render: function render() {
    var s = this;
    var props = s.props;

    return _react2.default.createElement('div', { className: 'snippet', dangerouslySetInnerHTML: { __html: props.src } });
  }
});

exports.default = Snippet;
},{"react":"react"}],12:[function(require,module,exports){
/**
 * View for guide
 * @class Guide
 */
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _apemanReactMixins = require('apeman-react-mixins');

var _snippet = require('../fragments/snippet');

var _snippet2 = _interopRequireDefault(_snippet);

var _snippet_service = require('../../services/snippet_service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GuideView = _react2.default.createClass({
  displayName: 'GuideView',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  render: function render() {
    var s = this;
    var l = s.getLocale();

    var _section = function _section(name, config) {
      var title = config.title;
      var text = config.text;
      var snippet = config.snippet;

      return _react2.default.createElement(
        _apemanReactBasic.ApSection,
        { id: 'guide-' + name + '-section',
          className: 'guide-section',
          key: name
        },
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
            { className: 'guide-text-container' },
            _react2.default.createElement(
              'div',
              { className: 'guide-description' },
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
            { className: 'guide-image-container' },
            _react2.default.createElement(
              'div',
              { className: 'guide-snippet' },
              _react2.default.createElement(_snippet2.default, { src: snippet })
            )
          )
        )
      );
    };

    return _react2.default.createElement(
      _apemanReactBasic.ApView,
      { className: 'guide-view' },
      _react2.default.createElement(_apemanReactBasic.ApViewHeader, null),
      _react2.default.createElement(
        _apemanReactBasic.ApViewBody,
        null,
        [_section('cloud-setup', {
          title: l('sections.GUIDE_CLOUD_SETUP_TITLE'),
          text: l('sections.GUIDE_CLOUD_SETUP_TEXT'),
          snippet: _snippet_service.singleton.getSnippet('exampleCloud')
        }), _section('spot-run', {
          title: l('sections.GUIDE_SPOT_RUN_TITLE'),
          text: l('sections.GUIDE_SPOT_RUN_TEXT'),
          snippet: _snippet_service.singleton.getSnippet('exampleSpot')
        }), _section('terminal-use', {
          title: l('sections.GUIDE_TERMINAL_USE_TITLE'),
          text: l('sections.GUIDE_TERMINAL_USE_TEXT'),
          snippet: _snippet_service.singleton.getSnippet('exampleTerminal')
        })]
      )
    );
  }
});

module.exports = GuideView;
},{"../../services/snippet_service":15,"../fragments/snippet":11,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],13:[function(require,module,exports){
/**
 * @namespace SnippetConstants
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exampleTerminal = exports.exampleSpot = exports.exampleCloud = exports.exampleUsage = undefined;

var _apeHighlighting = require('ape-highlighting');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exists = function exists(filename) {
  return _fs2.default.existsSync && _fs2.default.existsSync(filename);
};
var read = function read(filename) {
  return exists(filename) && _fs2.default.readFileSync(filename).toString() || null;
};

var exampleUsage = _apeHighlighting.highlightJsx.code(read(require.resolve('sugos/example/example-usage.js')));
var exampleCloud = _apeHighlighting.highlightJsx.code(read(require.resolve('sugos/example/modules/example-cloud.js')));
var exampleSpot = _apeHighlighting.highlightJsx.code(read(require.resolve('sugos/example/modules/example-spot.js')));
var exampleTerminal = _apeHighlighting.highlightJsx.code(read(require.resolve('sugos/example/modules/example-terminal.js')));

exports.exampleUsage = exampleUsage;
exports.exampleCloud = exampleCloud;
exports.exampleSpot = exampleSpot;
exports.exampleTerminal = exampleTerminal;
},{"ape-highlighting":17,"fs":1}],14:[function(require,module,exports){
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

},{"_process":4,"path":3}],15:[function(require,module,exports){
/**
 * @class SnippetService
 */
'use strict';

/** @lends SnippetService */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SnippetService = function () {
  function SnippetService() {
    _classCallCheck(this, SnippetService);
  }

  _createClass(SnippetService, [{
    key: 'getSnippet',

    /**
     * Get snippet with name
     * @param {string} name - Name of snippet
     * @returns {?string} - Matched snippet
     */
    value: function getSnippet(name) {
      var s = this;
      var snippets = s._getSnippets();
      return snippets[name];
    }
  }, {
    key: '_getSnippets',
    value: function _getSnippets() {
      if (typeof window === 'undefined') {
        return require('../constants/snippet_constants');
      }
      return window.snippets;
    }
  }]);

  return SnippetService;
}();

var singleton = new SnippetService();

Object.assign(SnippetService, {
  singleton: singleton
});

exports.singleton = singleton;
exports.default = SnippetService;
},{"../constants/snippet_constants":13}],16:[function(require,module,exports){
/**
 * @function highlightJsx
 * @param {string} src - Source string.
 * @param {object} options - Optional settings.
 * @returns {string} - Highlighted string.
 */

'use strict'

const nsh = require('node-syntaxhighlighter')
const jsx = require('jsx-syntaxhighlighter')
const fs = require('fs')

/** @lends highlightJsx */
function highlightJsx (src, options = {}) {
  let style = highlightJsx.style()
  let code = highlightJsx.code(src)
  return [
    '<div>',
    '<style scoped="scoped">' + style + '</style>',
    code,
    '</div>'
  ].join('')
}

highlightJsx.code = function (src) {
  return nsh.highlight(src, jsx, { gutter: false })
}

highlightJsx.style = function () {
  let filename = nsh.getStyles()[ 0 ].sourcePath
  return fs.readFileSync(filename).toString()
}

highlightJsx.fromFile = function (filename, options) {
  let src = fs.readFileSync(filename).toString()
  return highlightJsx(src, options)
}
module.exports = highlightJsx

},{"fs":1,"jsx-syntaxhighlighter":18,"node-syntaxhighlighter":22}],17:[function(require,module,exports){
/**
 * ape framework module for highlighting.
 * @module ape-highlighting
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get highlightJsx () { return d(require('./highlight_jsx')) }
}

},{"./highlight_jsx":16}],18:[function(require,module,exports){
var XRegExp = require("node-syntaxhighlighter/lib/scripts/XRegExp").XRegExp;
var SyntaxHighlighter;
;(function()
{
	// CommonJS
	SyntaxHighlighter = SyntaxHighlighter || (typeof require !== 'undefined'? require("node-syntaxhighlighter/lib/scripts/shCore").SyntaxHighlighter : null);

	function Brush()
	{
		function process(match, regexInfo)
		{
			var constructor = SyntaxHighlighter.Match,
				code = match[0],
				tag = new XRegExp('(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)', 'xg').exec(code),
				result = []
				;
		
			if (match.attributes != null) 
			{
				var attributes,
					regex = new XRegExp('(?<name> [\\w:\\-\\.]+)' +
										'\\s*=\\s*' +
										'(?<value> ".*?"|\'.*?\'|\\w+)',
										'xg');

				while ((attributes = regex.exec(code)) != null) 
				{
					result.push(new constructor(attributes.name, match.index + attributes.index, 'color1'));
					result.push(new constructor(attributes.value, match.index + attributes.index + attributes[0].indexOf(attributes.value), 'string'));
				}
			}

			if (tag != null)
				result.push(
					new constructor(tag.name, match.index + tag[0].indexOf(tag.name), 'keyword')
				);

			return result;
		}
		
		var keywords =	'break case catch continue ' +
						'default delete do else false  ' +
						'for function if in instanceof ' +
						'new null return super switch ' +
						'this throw true try typeof var while with'
						;

		var r = SyntaxHighlighter.regexLib;
	
		this.regexList = [
			{ regex: r.multiLineDoubleQuotedString,					css: 'string' },			// double quoted strings
			{ regex: r.multiLineSingleQuotedString,					css: 'string' },			// single quoted strings
			{ regex: r.singleLineCComments,							css: 'comments' },			// one line comments
			{ regex: r.multiLineCComments,							css: 'comments' },			// multiline comments
			{ regex: /\s*#.*/gm,									css: 'preprocessor' },		// preprocessor tags like #region and #endregion
			{ regex: new RegExp(this.getKeywords(keywords), 'gm'),	css: 'keyword' },
			
			{ regex: new XRegExp('(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)', 'gm'),			css: 'color2' },	// <![ ... [ ... ]]>
			{ regex: SyntaxHighlighter.regexLib.xmlComments,												css: 'comments' },	// <!-- ... -->
			{ regex: new XRegExp('(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)', 'sg'), func: process }
		];
		
		this.forHtmlScript(r.scriptScriptTags);
	};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
	Brush.aliases	= ['jsx'];

	SyntaxHighlighter.brushes.JSX = Brush;

	// CommonJS
	typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();

},{"node-syntaxhighlighter/lib/scripts/XRegExp":20,"node-syntaxhighlighter/lib/scripts/shCore":21}],19:[function(require,module,exports){
/*jshint laxbreak: true */

var codePattern = /<td class="code".*?<\/td>/
  , allScriptTags = [
      
        // <script> ... </script>
        { open: /<script[^>]*>/, close: /<\/script[^>]*>/, alias: 'js' }

        // <? ... ?>
      , { open: /^\s*<\?\s*$/, close: /^\s*\?>\s*$/,  alias: 'php' }

        // <![CDATA[ ... ]]     -- (inline actionscript) only used for xhtml
      , { open: /^\s*?<!\[CDATA\[\s*?$/, close: /^\s*?\]\]>\s*?$/, alias: 'as3', applyTo: 'xhtml' }
    ];

function findScripts(lines, specifiedAlias) {
  var scripts = []
    , inScript = false
    , currentScript
    , scriptTags = allScriptTags
        .filter(function (tag) {
          // E.g., in case of ![CDATA make sure we only highlight if user specified xhtml
          return !tag.applyTo || tag.applyTo === specifiedAlias;
        });

  for (var lineNum  = 0; lineNum < lines.length; lineNum++) {
    var line = lines[lineNum];

    if (!inScript) {
      var matchingTag = null;

      for (var tagIndex = 0; tagIndex < scriptTags.length; tagIndex++) {
        var tag = scriptTags[tagIndex];

        if (line.match(tag.open)) { 
          matchingTag = tag;
          break;
        }
      }

      if (matchingTag) {
        inScript = true;
        currentScript = { from: lineNum + 1, code: '', tag: matchingTag };
      }

      continue;
    }

    if (line.match(currentScript.tag.close)) {
      inScript = false;
      currentScript.to = lineNum - 1;
      scripts.push(currentScript);
      continue;
    }

    currentScript.code += line + '\n';
  }

  return scripts;
}

function extractLines(html) {
  var code = html.match(codePattern)[0]
    , lines = code.match(/<div +class="line .+?<\/div>/mg);

  return lines.join('');
}

function replacePlainLines(fromIndex, toIndex, html, replacement) {
  var regexp = new RegExp(
          '<div +class="[^"]+?index' + fromIndex + '[^"]*"'  // opening tag of start
        + '.+'                                               // script html
        + '<div +class="[^"]+?index' + toIndex + '[^"]*"'    // opening tag of end
        + '.+?</div>'                                        // closing tag of end
      )
    , code                =  html.match(codePattern)[0]
    , codeWithReplacement =  code.replace(regexp, replacement);

  return html.replace(code, codeWithReplacement);
}


module.exports = {
    findScripts       :  findScripts
  , extractLines      :  extractLines
  , replacePlainLines :  replacePlainLines
};

},{}],20:[function(require,module,exports){
// XRegExp 1.5.1
// (c) 2007-2012 Steven Levithan
// MIT License
// <http://xregexp.com>
// Provides an augmented, extensible, cross-browser implementation of regular expressions,
// including support for additional syntax, flags, and methods

var XRegExp;

if (XRegExp) {
    // Avoid running twice, since that would break references to native globals
    throw Error("can't load XRegExp twice in the same frame");
}

// Run within an anonymous function to protect variables and avoid new globals
(function (undefined) {

    //---------------------------------
    //  Constructor
    //---------------------------------

    // Accepts a pattern and flags; returns a new, extended `RegExp` object. Differs from a native
    // regular expression in that additional syntax and flags are supported and cross-browser
    // syntax inconsistencies are ameliorated. `XRegExp(/regex/)` clones an existing regex and
    // converts to type XRegExp
    XRegExp = function (pattern, flags) {
        var output = [],
            currScope = XRegExp.OUTSIDE_CLASS,
            pos = 0,
            context, tokenResult, match, chr, regex;

        if (XRegExp.isRegExp(pattern)) {
            if (flags !== undefined)
                throw TypeError("can't supply flags when constructing one RegExp from another");
            return clone(pattern);
        }
        // Tokens become part of the regex construction process, so protect against infinite
        // recursion when an XRegExp is constructed within a token handler or trigger
        if (isInsideConstructor)
            throw Error("can't call the XRegExp constructor within token definition functions");

        flags = flags || "";
        context = { // `this` object for custom tokens
            hasNamedCapture: false,
            captureNames: [],
            hasFlag: function (flag) {return flags.indexOf(flag) > -1;},
            setFlag: function (flag) {flags += flag;}
        };

        while (pos < pattern.length) {
            // Check for custom tokens at the current position
            tokenResult = runTokens(pattern, pos, currScope, context);

            if (tokenResult) {
                output.push(tokenResult.output);
                pos += (tokenResult.match[0].length || 1);
            } else {
                // Check for native multicharacter metasequences (excluding character classes) at
                // the current position
                if (match = nativ.exec.call(nativeTokens[currScope], pattern.slice(pos))) {
                    output.push(match[0]);
                    pos += match[0].length;
                } else {
                    chr = pattern.charAt(pos);
                    if (chr === "[")
                        currScope = XRegExp.INSIDE_CLASS;
                    else if (chr === "]")
                        currScope = XRegExp.OUTSIDE_CLASS;
                    // Advance position one character
                    output.push(chr);
                    pos++;
                }
            }
        }

        regex = RegExp(output.join(""), nativ.replace.call(flags, flagClip, ""));
        regex._xregexp = {
            source: pattern,
            captureNames: context.hasNamedCapture ? context.captureNames : null
        };
        return regex;
    };


    //---------------------------------
    //  Public properties
    //---------------------------------

    XRegExp.version = "1.5.1";

    // Token scope bitflags
    XRegExp.INSIDE_CLASS = 1;
    XRegExp.OUTSIDE_CLASS = 2;


    //---------------------------------
    //  Private variables
    //---------------------------------

    var replacementToken = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g,
        flagClip = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g, // Nonnative and duplicate flags
        quantifier = /^(?:[?*+]|{\d+(?:,\d*)?})\??/,
        isInsideConstructor = false,
        tokens = [],
        // Copy native globals for reference ("native" is an ES3 reserved keyword)
        nativ = {
            exec: RegExp.prototype.exec,
            test: RegExp.prototype.test,
            match: String.prototype.match,
            replace: String.prototype.replace,
            split: String.prototype.split
        },
        compliantExecNpcg = nativ.exec.call(/()??/, "")[1] === undefined, // check `exec` handling of nonparticipating capturing groups
        compliantLastIndexIncrement = function () {
            var x = /^/g;
            nativ.test.call(x, "");
            return !x.lastIndex;
        }(),
        hasNativeY = RegExp.prototype.sticky !== undefined,
        nativeTokens = {};

    // `nativeTokens` match native multicharacter metasequences only (including deprecated octals,
    // excluding character classes)
    nativeTokens[XRegExp.INSIDE_CLASS] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;
    nativeTokens[XRegExp.OUTSIDE_CLASS] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;


    //---------------------------------
    //  Public methods
    //---------------------------------

    // Lets you extend or change XRegExp syntax and create custom flags. This is used internally by
    // the XRegExp library and can be used to create XRegExp plugins. This function is intended for
    // users with advanced knowledge of JavaScript's regular expression syntax and behavior. It can
    // be disabled by `XRegExp.freezeTokens`
    XRegExp.addToken = function (regex, handler, scope, trigger) {
        tokens.push({
            pattern: clone(regex, "g" + (hasNativeY ? "y" : "")),
            handler: handler,
            scope: scope || XRegExp.OUTSIDE_CLASS,
            trigger: trigger || null
        });
    };

    // Accepts a pattern and flags; returns an extended `RegExp` object. If the pattern and flag
    // combination has previously been cached, the cached copy is returned; otherwise the newly
    // created regex is cached
    XRegExp.cache = function (pattern, flags) {
        var key = pattern + "/" + (flags || "");
        return XRegExp.cache[key] || (XRegExp.cache[key] = XRegExp(pattern, flags));
    };

    // Accepts a `RegExp` instance; returns a copy with the `/g` flag set. The copy has a fresh
    // `lastIndex` (set to zero). If you want to copy a regex without forcing the `global`
    // property, use `XRegExp(regex)`. Do not use `RegExp(regex)` because it will not preserve
    // special properties required for named capture
    XRegExp.copyAsGlobal = function (regex) {
        return clone(regex, "g");
    };

    // Accepts a string; returns the string with regex metacharacters escaped. The returned string
    // can safely be used at any point within a regex to match the provided literal string. Escaped
    // characters are [ ] { } ( ) * + ? - . , \ ^ $ | # and whitespace
    XRegExp.escape = function (str) {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // Accepts a string to search, regex to search with, position to start the search within the
    // string (default: 0), and an optional Boolean indicating whether matches must start at-or-
    // after the position or at the specified position only. This function ignores the `lastIndex`
    // of the provided regex in its own handling, but updates the property for compatibility
    XRegExp.execAt = function (str, regex, pos, anchored) {
        var r2 = clone(regex, "g" + ((anchored && hasNativeY) ? "y" : "")),
            match;
        r2.lastIndex = pos = pos || 0;
        match = r2.exec(str); // Run the altered `exec` (required for `lastIndex` fix, etc.)
        if (anchored && match && match.index !== pos)
            match = null;
        if (regex.global)
            regex.lastIndex = match ? r2.lastIndex : 0;
        return match;
    };

    // Breaks the unrestorable link to XRegExp's private list of tokens, thereby preventing
    // syntax and flag changes. Should be run after XRegExp and any plugins are loaded
    XRegExp.freezeTokens = function () {
        XRegExp.addToken = function () {
            throw Error("can't run addToken after freezeTokens");
        };
    };

    // Accepts any value; returns a Boolean indicating whether the argument is a `RegExp` object.
    // Note that this is also `true` for regex literals and regexes created by the `XRegExp`
    // constructor. This works correctly for variables created in another frame, when `instanceof`
    // and `constructor` checks would fail to work as intended
    XRegExp.isRegExp = function (o) {
        return Object.prototype.toString.call(o) === "[object RegExp]";
    };

    // Executes `callback` once per match within `str`. Provides a simpler and cleaner way to
    // iterate over regex matches compared to the traditional approaches of subverting
    // `String.prototype.replace` or repeatedly calling `exec` within a `while` loop
    XRegExp.iterate = function (str, regex, callback, context) {
        var r2 = clone(regex, "g"),
            i = -1, match;
        while (match = r2.exec(str)) { // Run the altered `exec` (required for `lastIndex` fix, etc.)
            if (regex.global)
                regex.lastIndex = r2.lastIndex; // Doing this to follow expectations if `lastIndex` is checked within `callback`
            callback.call(context, match, ++i, str, regex);
            if (r2.lastIndex === match.index)
                r2.lastIndex++;
        }
        if (regex.global)
            regex.lastIndex = 0;
    };

    // Accepts a string and an array of regexes; returns the result of using each successive regex
    // to search within the matches of the previous regex. The array of regexes can also contain
    // objects with `regex` and `backref` properties, in which case the named or numbered back-
    // references specified are passed forward to the next regex or returned. E.g.:
    // var xregexpImgFileNames = XRegExp.matchChain(html, [
    //     {regex: /<img\b([^>]+)>/i, backref: 1}, // <img> tag attributes
    //     {regex: XRegExp('(?ix) \\s src=" (?<src> [^"]+ )'), backref: "src"}, // src attribute values
    //     {regex: XRegExp("^http://xregexp\\.com(/[^#?]+)", "i"), backref: 1}, // xregexp.com paths
    //     /[^\/]+$/ // filenames (strip directory paths)
    // ]);
    XRegExp.matchChain = function (str, chain) {
        return function recurseChain (values, level) {
            var item = chain[level].regex ? chain[level] : {regex: chain[level]},
                regex = clone(item.regex, "g"),
                matches = [], i;
            for (i = 0; i < values.length; i++) {
                XRegExp.iterate(values[i], regex, function (match) {
                    matches.push(item.backref ? (match[item.backref] || "") : match[0]);
                });
            }
            return ((level === chain.length - 1) || !matches.length) ?
                matches : recurseChain(matches, level + 1);
        }([str], 0);
    };


    //---------------------------------
    //  New RegExp prototype methods
    //---------------------------------

    // Accepts a context object and arguments array; returns the result of calling `exec` with the
    // first value in the arguments array. the context is ignored but is accepted for congruity
    // with `Function.prototype.apply`
    RegExp.prototype.apply = function (context, args) {
        return this.exec(args[0]);
    };

    // Accepts a context object and string; returns the result of calling `exec` with the provided
    // string. the context is ignored but is accepted for congruity with `Function.prototype.call`
    RegExp.prototype.call = function (context, str) {
        return this.exec(str);
    };


    //---------------------------------
    //  Overriden native methods
    //---------------------------------

    // Adds named capture support (with backreferences returned as `result.name`), and fixes two
    // cross-browser issues per ES3:
    // - Captured values for nonparticipating capturing groups should be returned as `undefined`,
    //   rather than the empty string.
    // - `lastIndex` should not be incremented after zero-length matches.
    RegExp.prototype.exec = function (str) {
        var match, name, r2, origLastIndex;
        if (!this.global)
            origLastIndex = this.lastIndex;
        match = nativ.exec.apply(this, arguments);
        if (match) {
            // Fix browsers whose `exec` methods don't consistently return `undefined` for
            // nonparticipating capturing groups
            if (!compliantExecNpcg && match.length > 1 && indexOf(match, "") > -1) {
                r2 = RegExp(this.source, nativ.replace.call(getNativeFlags(this), "g", ""));
                // Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
                // matching due to characters outside the match
                nativ.replace.call((str + "").slice(match.index), r2, function () {
                    for (var i = 1; i < arguments.length - 2; i++) {
                        if (arguments[i] === undefined)
                            match[i] = undefined;
                    }
                });
            }
            // Attach named capture properties
            if (this._xregexp && this._xregexp.captureNames) {
                for (var i = 1; i < match.length; i++) {
                    name = this._xregexp.captureNames[i - 1];
                    if (name)
                       match[name] = match[i];
                }
            }
            // Fix browsers that increment `lastIndex` after zero-length matches
            if (!compliantLastIndexIncrement && this.global && !match[0].length && (this.lastIndex > match.index))
                this.lastIndex--;
        }
        if (!this.global)
            this.lastIndex = origLastIndex; // Fix IE, Opera bug (last tested IE 9.0.5, Opera 11.61 on Windows)
        return match;
    };

    // Fix browser bugs in native method
    RegExp.prototype.test = function (str) {
        // Use the native `exec` to skip some processing overhead, even though the altered
        // `exec` would take care of the `lastIndex` fixes
        var match, origLastIndex;
        if (!this.global)
            origLastIndex = this.lastIndex;
        match = nativ.exec.call(this, str);
        // Fix browsers that increment `lastIndex` after zero-length matches
        if (match && !compliantLastIndexIncrement && this.global && !match[0].length && (this.lastIndex > match.index))
            this.lastIndex--;
        if (!this.global)
            this.lastIndex = origLastIndex; // Fix IE, Opera bug (last tested IE 9.0.5, Opera 11.61 on Windows)
        return !!match;
    };

    // Adds named capture support and fixes browser bugs in native method
    String.prototype.match = function (regex) {
        if (!XRegExp.isRegExp(regex))
            regex = RegExp(regex); // Native `RegExp`
        if (regex.global) {
            var result = nativ.match.apply(this, arguments);
            regex.lastIndex = 0; // Fix IE bug
            return result;
        }
        return regex.exec(this); // Run the altered `exec`
    };

    // Adds support for `${n}` tokens for named and numbered backreferences in replacement text,
    // and provides named backreferences to replacement functions as `arguments[0].name`. Also
    // fixes cross-browser differences in replacement text syntax when performing a replacement
    // using a nonregex search value, and the value of replacement regexes' `lastIndex` property
    // during replacement iterations. Note that this doesn't support SpiderMonkey's proprietary
    // third (`flags`) parameter
    String.prototype.replace = function (search, replacement) {
        var isRegex = XRegExp.isRegExp(search),
            captureNames, result, str, origLastIndex;

        // There are too many combinations of search/replacement types/values and browser bugs that
        // preclude passing to native `replace`, so don't try
        //if (...)
        //    return nativ.replace.apply(this, arguments);

        if (isRegex) {
            if (search._xregexp)
                captureNames = search._xregexp.captureNames; // Array or `null`
            if (!search.global)
                origLastIndex = search.lastIndex;
        } else {
            search = search + ""; // Type conversion
        }

        if (Object.prototype.toString.call(replacement) === "[object Function]") {
            result = nativ.replace.call(this + "", search, function () {
                if (captureNames) {
                    // Change the `arguments[0]` string primitive to a String object which can store properties
                    arguments[0] = new String(arguments[0]);
                    // Store named backreferences on `arguments[0]`
                    for (var i = 0; i < captureNames.length; i++) {
                        if (captureNames[i])
                            arguments[0][captureNames[i]] = arguments[i + 1];
                    }
                }
                // Update `lastIndex` before calling `replacement` (fix browsers)
                if (isRegex && search.global)
                    search.lastIndex = arguments[arguments.length - 2] + arguments[0].length;
                return replacement.apply(null, arguments);
            });
        } else {
            str = this + ""; // Type conversion, so `args[args.length - 1]` will be a string (given nonstring `this`)
            result = nativ.replace.call(str, search, function () {
                var args = arguments; // Keep this function's `arguments` available through closure
                return nativ.replace.call(replacement + "", replacementToken, function ($0, $1, $2) {
                    // Numbered backreference (without delimiters) or special variable
                    if ($1) {
                        switch ($1) {
                            case "$": return "$";
                            case "&": return args[0];
                            case "`": return args[args.length - 1].slice(0, args[args.length - 2]);
                            case "'": return args[args.length - 1].slice(args[args.length - 2] + args[0].length);
                            // Numbered backreference
                            default:
                                // What does "$10" mean?
                                // - Backreference 10, if 10 or more capturing groups exist
                                // - Backreference 1 followed by "0", if 1-9 capturing groups exist
                                // - Otherwise, it's the string "$10"
                                // Also note:
                                // - Backreferences cannot be more than two digits (enforced by `replacementToken`)
                                // - "$01" is equivalent to "$1" if a capturing group exists, otherwise it's the string "$01"
                                // - There is no "$0" token ("$&" is the entire match)
                                var literalNumbers = "";
                                $1 = +$1; // Type conversion; drop leading zero
                                if (!$1) // `$1` was "0" or "00"
                                    return $0;
                                while ($1 > args.length - 3) {
                                    literalNumbers = String.prototype.slice.call($1, -1) + literalNumbers;
                                    $1 = Math.floor($1 / 10); // Drop the last digit
                                }
                                return ($1 ? args[$1] || "" : "$") + literalNumbers;
                        }
                    // Named backreference or delimited numbered backreference
                    } else {
                        // What does "${n}" mean?
                        // - Backreference to numbered capture n. Two differences from "$n":
                        //   - n can be more than two digits
                        //   - Backreference 0 is allowed, and is the entire match
                        // - Backreference to named capture n, if it exists and is not a number overridden by numbered capture
                        // - Otherwise, it's the string "${n}"
                        var n = +$2; // Type conversion; drop leading zeros
                        if (n <= args.length - 3)
                            return args[n];
                        n = captureNames ? indexOf(captureNames, $2) : -1;
                        return n > -1 ? args[n + 1] : $0;
                    }
                });
            });
        }

        if (isRegex) {
            if (search.global)
                search.lastIndex = 0; // Fix IE, Safari bug (last tested IE 9.0.5, Safari 5.1.2 on Windows)
            else
                search.lastIndex = origLastIndex; // Fix IE, Opera bug (last tested IE 9.0.5, Opera 11.61 on Windows)
        }

        return result;
    };

    // A consistent cross-browser, ES3 compliant `split`
    String.prototype.split = function (s /* separator */, limit) {
        // If separator `s` is not a regex, use the native `split`
        if (!XRegExp.isRegExp(s))
            return nativ.split.apply(this, arguments);

        var str = this + "", // Type conversion
            output = [],
            lastLastIndex = 0,
            match, lastLength;

        // Behavior for `limit`: if it's...
        // - `undefined`: No limit
        // - `NaN` or zero: Return an empty array
        // - A positive number: Use `Math.floor(limit)`
        // - A negative number: No limit
        // - Other: Type-convert, then use the above rules
        if (limit === undefined || +limit < 0) {
            limit = Infinity;
        } else {
            limit = Math.floor(+limit);
            if (!limit)
                return [];
        }

        // This is required if not `s.global`, and it avoids needing to set `s.lastIndex` to zero
        // and restore it to its original value when we're done using the regex
        s = XRegExp.copyAsGlobal(s);

        while (match = s.exec(str)) { // Run the altered `exec` (required for `lastIndex` fix, etc.)
            if (s.lastIndex > lastLastIndex) {
                output.push(str.slice(lastLastIndex, match.index));

                if (match.length > 1 && match.index < str.length)
                    Array.prototype.push.apply(output, match.slice(1));

                lastLength = match[0].length;
                lastLastIndex = s.lastIndex;

                if (output.length >= limit)
                    break;
            }

            if (s.lastIndex === match.index)
                s.lastIndex++;
        }

        if (lastLastIndex === str.length) {
            if (!nativ.test.call(s, "") || lastLength)
                output.push("");
        } else {
            output.push(str.slice(lastLastIndex));
        }

        return output.length > limit ? output.slice(0, limit) : output;
    };


    //---------------------------------
    //  Private helper functions
    //---------------------------------

    // Supporting function for `XRegExp`, `XRegExp.copyAsGlobal`, etc. Returns a copy of a `RegExp`
    // instance with a fresh `lastIndex` (set to zero), preserving properties required for named
    // capture. Also allows adding new flags in the process of copying the regex
    function clone (regex, additionalFlags) {
        if (!XRegExp.isRegExp(regex))
            throw TypeError("type RegExp expected");
        var x = regex._xregexp;
        regex = XRegExp(regex.source, getNativeFlags(regex) + (additionalFlags || ""));
        if (x) {
            regex._xregexp = {
                source: x.source,
                captureNames: x.captureNames ? x.captureNames.slice(0) : null
            };
        }
        return regex;
    }

    function getNativeFlags (regex) {
        return (regex.global     ? "g" : "") +
               (regex.ignoreCase ? "i" : "") +
               (regex.multiline  ? "m" : "") +
               (regex.extended   ? "x" : "") + // Proposed for ES4; included in AS3
               (regex.sticky     ? "y" : "");
    }

    function runTokens (pattern, index, scope, context) {
        var i = tokens.length,
            result, match, t;
        // Protect against constructing XRegExps within token handler and trigger functions
        isInsideConstructor = true;
        // Must reset `isInsideConstructor`, even if a `trigger` or `handler` throws
        try {
            while (i--) { // Run in reverse order
                t = tokens[i];
                if ((scope & t.scope) && (!t.trigger || t.trigger.call(context))) {
                    t.pattern.lastIndex = index;
                    match = t.pattern.exec(pattern); // Running the altered `exec` here allows use of named backreferences, etc.
                    if (match && match.index === index) {
                        result = {
                            output: t.handler.call(context, match, scope),
                            match: match
                        };
                        break;
                    }
                }
            }
        } catch (err) {
            throw err;
        } finally {
            isInsideConstructor = false;
        }
        return result;
    }

    function indexOf (array, item, from) {
        if (Array.prototype.indexOf) // Use the native array method if available
            return array.indexOf(item, from);
        for (var i = from || 0; i < array.length; i++) {
            if (array[i] === item)
                return i;
        }
        return -1;
    }


    //---------------------------------
    //  Built-in tokens
    //---------------------------------

    // Augment XRegExp's regular expression syntax and flags. Note that when adding tokens, the
    // third (`scope`) argument defaults to `XRegExp.OUTSIDE_CLASS`

    // Comment pattern: (?# )
    XRegExp.addToken(
        /\(\?#[^)]*\)/,
        function (match) {
            // Keep tokens separated unless the following token is a quantifier
            return nativ.test.call(quantifier, match.input.slice(match.index + match[0].length)) ? "" : "(?:)";
        }
    );

    // Capturing group (match the opening parenthesis only).
    // Required for support of named capturing groups
    XRegExp.addToken(
        /\((?!\?)/,
        function () {
            this.captureNames.push(null);
            return "(";
        }
    );

    // Named capturing group (match the opening delimiter only): (?<name>
    XRegExp.addToken(
        /\(\?<([$\w]+)>/,
        function (match) {
            this.captureNames.push(match[1]);
            this.hasNamedCapture = true;
            return "(";
        }
    );

    // Named backreference: \k<name>
    XRegExp.addToken(
        /\\k<([\w$]+)>/,
        function (match) {
            var index = indexOf(this.captureNames, match[1]);
            // Keep backreferences separate from subsequent literal numbers. Preserve back-
            // references to named groups that are undefined at this point as literal strings
            return index > -1 ?
                "\\" + (index + 1) + (isNaN(match.input.charAt(match.index + match[0].length)) ? "" : "(?:)") :
                match[0];
        }
    );

    // Empty character class: [] or [^]
    XRegExp.addToken(
        /\[\^?]/,
        function (match) {
            // For cross-browser compatibility with ES3, convert [] to \b\B and [^] to [\s\S].
            // (?!) should work like \b\B, but is unreliable in Firefox
            return match[0] === "[]" ? "\\b\\B" : "[\\s\\S]";
        }
    );

    // Mode modifier at the start of the pattern only, with any combination of flags imsx: (?imsx)
    // Does not support x(?i), (?-i), (?i-m), (?i: ), (?i)(?m), etc.
    XRegExp.addToken(
        /^\(\?([imsx]+)\)/,
        function (match) {
            this.setFlag(match[1]);
            return "";
        }
    );

    // Whitespace and comments, in free-spacing (aka extended) mode only
    XRegExp.addToken(
        /(?:\s+|#.*)+/,
        function (match) {
            // Keep tokens separated unless the following token is a quantifier
            return nativ.test.call(quantifier, match.input.slice(match.index + match[0].length)) ? "" : "(?:)";
        },
        XRegExp.OUTSIDE_CLASS,
        function () {return this.hasFlag("x");}
    );

    // Dot, in dotall (aka singleline) mode only
    XRegExp.addToken(
        /\./,
        function () {return "[\\s\\S]";},
        XRegExp.OUTSIDE_CLASS,
        function () {return this.hasFlag("s");}
    );


    //---------------------------------
    //  Backward compatibility
    //---------------------------------

    // Uncomment the following block for compatibility with XRegExp 1.0-1.2:
    /*
    XRegExp.matchWithinChain = XRegExp.matchChain;
    RegExp.prototype.addFlags = function (s) {return clone(this, s);};
    RegExp.prototype.execAll = function (s) {var r = []; XRegExp.iterate(s, this, function (m) {r.push(m);}); return r;};
    RegExp.prototype.forEachExec = function (s, f, c) {return XRegExp.iterate(s, this, f, c);};
    RegExp.prototype.validate = function (s) {var r = RegExp("^(?:" + this.source + ")$(?!\\s)", getNativeFlags(this)); if (this.global) this.lastIndex = 0; return s.search(r) === 0;};
    */

})();


module.exports.XRegExp = XRegExp;
},{}],21:[function(require,module,exports){
var XRegExp = require("./XRegExp").XRegExp;
var className,
   gutter;
//
// Begin anonymous function. This is used to contain local scope variables without polutting global scope.
//
var SyntaxHighlighter = function() { 

// CommonJS
if (typeof(require) != 'undefined' && typeof(XRegExp) == 'undefined')
{
// No op since required properly at top of file

}

// Shortcut object which will be assigned to the SyntaxHighlighter variable.
// This is a shorthand for local reference in order to avoid long namespace 
// references to SyntaxHighlighter.whatever...
var sh = {
	defaults : {
		/** Additional CSS class names to be added to highlighter elements. */
		'class-name' : '',
		
		/** First line number. */
		'first-line' : 1,
		
		/**
		 * Pads line numbers. Possible values are:
		 *
		 *   false - don't pad line numbers.
		 *   true  - automaticaly pad numbers with minimum required number of leading zeroes.
		 *   [int] - length up to which pad line numbers.
		 */
		'pad-line-numbers' : false,
		
		/** Lines to highlight. */
		'highlight' : null,
		
		/** Title to be displayed above the code block. */
		'title' : null,
		
		/** Enables or disables smart tabs. */
		'smart-tabs' : true,
		
		/** Gets or sets tab size. */
		'tab-size' : 4,
		
		/** Enables or disables gutter. */
		'gutter' : true,
		
		/** Enables or disables toolbar. */
		'toolbar' : true,
		
		/** Enables quick code copy and paste from double click. */
		'quick-code' : true,
		
		/** Forces code view to be collapsed. */
		'collapse' : false,
		
		/** Enables or disables automatic links. */
		'auto-links' : true,
		
		/** Gets or sets light mode. Equavalent to turning off gutter and toolbar. */
		'light' : false,

		'unindent' : true,
		
		'html-script' : false
	},
	
	config : {
		space : '&nbsp;',
		
		/** Enables use of <SCRIPT type="syntaxhighlighter" /> tags. */
		useScriptTags : true,
		
		/** Blogger mode flag. */
		bloggerMode : false,
		
		stripBrs : false,
		
		/** Name of the tag that SyntaxHighlighter will automatically look for. */
		tagName : 'pre',
		
		strings : {
			expandSource : 'expand source',
			help : '?',
			alert: 'SyntaxHighlighter\n\n',
			noBrush : 'Can\'t find brush for: ',
			brushNotHtmlScript : 'Brush wasn\'t configured for html-script option: ',
			
			// this is populated by the build script
			aboutDialog : '@ABOUT@'
		}
	},
	
	/** Internal 'global' variables. */
	vars : {
		discoveredBrushes : null,
		highlighters : {}
	},
	
	/** This object is populated by user included external brush files. */
	brushes : {},

	/** Common regular expressions. */
	regexLib : {
		multiLineCComments			: /\/\*[\s\S]*?\*\//gm,
		singleLineCComments			: /\/\/.*$/gm,
		singleLinePerlComments		: /#.*$/gm,
		doubleQuotedString			: /"([^\\"\n]|\\.)*"/g,
		singleQuotedString			: /'([^\\'\n]|\\.)*'/g,
		multiLineDoubleQuotedString	: new XRegExp('"([^\\\\"]|\\\\.)*"', 'gs'),
		multiLineSingleQuotedString	: new XRegExp("'([^\\\\']|\\\\.)*'", 'gs'),
		xmlComments					: /(&lt;|<)!--[\s\S]*?--(&gt;|>)/gm,
		url							: /\w+:\/\/[\w-.\/?%&=:@;#]*/g,
		
		/** <?= ?> tags. */
		phpScriptTags 				: { left: /(&lt;|<)\?(?:=|php)?/g, right: /\?(&gt;|>)/g, 'eof' : true },
		
		/** <%= %> tags. */
		aspScriptTags				: { left: /(&lt;|<)%=?/g, right: /%(&gt;|>)/g },
		
		/** <script> tags. */
		scriptScriptTags			: { left: /(&lt;|<)\s*script.*?(&gt;|>)/gi, right: /(&lt;|<)\/\s*script\s*(&gt;|>)/gi }
	},

	toolbar: {
		/**
		 * Generates HTML markup for the toolbar.
		 * @param {Highlighter} highlighter Highlighter instance.
		 * @return {String} Returns HTML markup.
		 */
		getHtml: function(highlighter)
		{
			var html = '<div class="toolbar">',
				items = sh.toolbar.items,
				list = items.list
				;
			
			function defaultGetHtml(highlighter, name)
			{
				return sh.toolbar.getButtonHtml(highlighter, name, sh.config.strings[name]);
			};
			
			for (var i = 0; i < list.length; i++)
				html += (items[list[i]].getHtml || defaultGetHtml)(highlighter, list[i]);
			
			html += '</div>';
			
			return html;
		},
		
		/**
		 * Generates HTML markup for a regular button in the toolbar.
		 * @param {Highlighter} highlighter Highlighter instance.
		 * @param {String} commandName		Command name that would be executed.
		 * @param {String} label			Label text to display.
		 * @return {String}					Returns HTML markup.
		 */
		getButtonHtml: function(highlighter, commandName, label)
		{
			return '<span><a href="#" class="toolbar_item'
				+ ' command_' + commandName
				+ ' ' + commandName
				+ '">' + label + '</a></span>'
				;
		},
		
		/**
		 * Event handler for a toolbar anchor.
		 */
		handler: function(e)
		{
			var target = e.target,
				className = target.className || ''
				;

			function getValue(name)
			{
				var r = new RegExp(name + '_(\\w+)'),
					match = r.exec(className)
					;

				return match ? match[1] : null;
			};
			
			var highlighter = getHighlighterById(findParentElement(target, '.syntaxhighlighter').id),
				commandName = getValue('command')
				;
			
			// execute the toolbar command
			if (highlighter && commandName)
				sh.toolbar.items[commandName].execute(highlighter);

			// disable default A click behaviour
			e.preventDefault();
		},
		
		/** Collection of toolbar items. */
		items : {
			// Ordered lis of items in the toolbar. Can't expect `for (var n in items)` to be consistent.
			list: ['expandSource', 'help'],

			expandSource: {
				getHtml: function(highlighter)
				{
					if (highlighter.getParam('collapse') != true)
						return '';
						
					var title = highlighter.getParam('title');
					return sh.toolbar.getButtonHtml(highlighter, 'expandSource', title ? title : sh.config.strings.expandSource);
				},
			
				execute: function(highlighter)
				{
					var div = getHighlighterDivById(highlighter.id);
					removeClass(div, 'collapsed');
				}
			},

			/** Command to display the about dialog window. */
			help: {
				execute: function(highlighter)
				{	
					var wnd = popup('', '_blank', 500, 250, 'scrollbars=0'),
						doc = wnd.document
						;
					
					doc.write(sh.config.strings.aboutDialog);
					doc.close();
					wnd.focus();
				}
			}
		}
	},

	/**
	 * Finds all elements on the page which should be processes by SyntaxHighlighter.
	 *
	 * @param {Object} globalParams		Optional parameters which override element's 
	 * 									parameters. Only used if element is specified.
	 * 
	 * @param {Object} element	Optional element to highlight. If none is
	 * 							provided, all elements in the current document 
	 * 							are returned which qualify.
	 *
	 * @return {Array}	Returns list of <code>{ target: DOMElement, params: Object }</code> objects.
	 */
	findElements: function(globalParams, element)
	{
		var elements = element ? [element] : toArray(document.getElementsByTagName(sh.config.tagName)), 
			conf = sh.config,
			result = []
			;

		// support for <SCRIPT TYPE="syntaxhighlighter" /> feature
		if (conf.useScriptTags)
			elements = elements.concat(getSyntaxHighlighterScriptTags());

		if (elements.length === 0) 
			return result;
	
		for (var i = 0; i < elements.length; i++) 
		{
			var item = {
				target: elements[i], 
				// local params take precedence over globals
				params: merge(globalParams, parseParams(elements[i].className))
			};

			if (item.params['brush'] == null)
				continue;
				
			result.push(item);
		}
		
		return result;
	},

	/**
	 * Shorthand to highlight all elements on the page that are marked as 
	 * SyntaxHighlighter source code.
	 * 
	 * @param {Object} globalParams		Optional parameters which override element's 
	 * 									parameters. Only used if element is specified.
	 * 
	 * @param {Object} element	Optional element to highlight. If none is
	 * 							provided, all elements in the current document 
	 * 							are highlighted.
	 */ 
	highlight: function(globalParams, element)
	{
		var elements = this.findElements(globalParams, element),
			propertyName = 'innerHTML', 
			highlighter = null,
			conf = sh.config
			;

		if (elements.length === 0) 
			return;
	
		for (var i = 0; i < elements.length; i++) 
		{
			var element = elements[i],
				target = element.target,
				params = element.params,
				brushName = params.brush,
				code
				;

			if (brushName == null)
				continue;

			// Instantiate a brush
			if (params['html-script'] == 'true' || sh.defaults['html-script'] == true) 
			{
				highlighter = new sh.HtmlScript(brushName);
				brushName = 'htmlscript';
			}
			else
			{
				var brush = findBrush(brushName);
				
				if (brush)
					highlighter = new brush();
				else
					continue;
			}
			
			code = target[propertyName];
			
			// remove CDATA from <SCRIPT/> tags if it's present
			if (conf.useScriptTags)
				code = stripCData(code);
				
			// Inject title if the attribute is present
			if ((target.title || '') != '')
				params.title = target.title;
				
			params['brush'] = brushName;
			highlighter.init(params);
			element = highlighter.getDiv(code);
			
			// carry over ID
			if ((target.id || '') != '')
				element.id = target.id;
			
			target.parentNode.replaceChild(element, target);
		}
	},

	/**
	 * Main entry point for the SyntaxHighlighter.
	 * @param {Object} params Optional params to apply to all highlighted elements.
	 */
	all: function(params)
	{
		attachEvent(
			window,
			'load',
			function() { sh.highlight(params); }
		);
	}
}; // end of sh

/**
 * Checks if target DOM elements has specified CSS class.
 * @param {DOMElement} target Target DOM element to check.
 * @param {String} className Name of the CSS class to check for.
 * @return {Boolean} Returns true if class name is present, false otherwise.
 */
function hasClass(target, className)
{
	return target.className.indexOf(className) != -1;
};

/**
 * Adds CSS class name to the target DOM element.
 * @param {DOMElement} target Target DOM element.
 * @param {String} className New CSS class to add.
 */
function addClass(target, className)
{
	if (!hasClass(target, className))
		target.className += ' ' + className;
};

/**
 * Removes CSS class name from the target DOM element.
 * @param {DOMElement} target Target DOM element.
 * @param {String} className CSS class to remove.
 */
function removeClass(target, className)
{
	target.className = target.className.replace(className, '');
};

/**
 * Converts the source to array object. Mostly used for function arguments and 
 * lists returned by getElementsByTagName() which aren't Array objects.
 * @param {List} source Source list.
 * @return {Array} Returns array.
 */
function toArray(source)
{
	var result = [];
	
	for (var i = 0; i < source.length; i++) 
		result.push(source[i]);
		
	return result;
};

/**
 * Splits block of text into lines.
 * @param {String} block Block of text.
 * @return {Array} Returns array of lines.
 */
function splitLines(block)
{
	return block.split(/\r?\n/);
}

/**
 * Generates HTML ID for the highlighter.
 * @param {String} highlighterId Highlighter ID.
 * @return {String} Returns HTML ID.
 */
function getHighlighterId(id)
{
	var prefix = 'highlighter_';
	return id.indexOf(prefix) == 0 ? id : prefix + id;
};

/**
 * Finds Highlighter instance by ID.
 * @param {String} highlighterId Highlighter ID.
 * @return {Highlighter} Returns instance of the highlighter.
 */
function getHighlighterById(id)
{
	return sh.vars.highlighters[getHighlighterId(id)];
};

/**
 * Finds highlighter's DIV container.
 * @param {String} highlighterId Highlighter ID.
 * @return {Element} Returns highlighter's DIV element.
 */
function getHighlighterDivById(id)
{
	return document.getElementById(getHighlighterId(id));
};

/**
 * Stores highlighter so that getHighlighterById() can do its thing. Each
 * highlighter must call this method to preserve itself.
 * @param {Highilghter} highlighter Highlighter instance.
 */
function storeHighlighter(highlighter)
{
	sh.vars.highlighters[getHighlighterId(highlighter.id)] = highlighter;
};

/**
 * Looks for a child or parent node which has specified classname.
 * Equivalent to jQuery's $(container).find(".className")
 * @param {Element} target Target element.
 * @param {String} search Class name or node name to look for.
 * @param {Boolean} reverse If set to true, will go up the node tree instead of down.
 * @return {Element} Returns found child or parent element on null.
 */
function findElement(target, search, reverse /* optional */)
{
	if (target == null)
		return null;
		
	var nodes			= reverse != true ? target.childNodes : [ target.parentNode ],
		propertyToFind	= { '#' : 'id', '.' : 'className' }[search.substr(0, 1)] || 'nodeName',
		expectedValue,
		found
		;

	expectedValue = propertyToFind != 'nodeName'
		? search.substr(1)
		: search.toUpperCase()
		;
		
	// main return of the found node
	if ((target[propertyToFind] || '').indexOf(expectedValue) != -1)
		return target;
	
	for (var i = 0; nodes && i < nodes.length && found == null; i++)
		found = findElement(nodes[i], search, reverse);
	
	return found;
};

/**
 * Looks for a parent node which has specified classname.
 * This is an alias to <code>findElement(container, className, true)</code>.
 * @param {Element} target Target element.
 * @param {String} className Class name to look for.
 * @return {Element} Returns found parent element on null.
 */
function findParentElement(target, className)
{
	return findElement(target, className, true);
};

/**
 * Finds an index of element in the array.
 * @ignore
 * @param {Object} searchElement
 * @param {Number} fromIndex
 * @return {Number} Returns index of element if found; -1 otherwise.
 */
function indexOf(array, searchElement, fromIndex)
{
	fromIndex = Math.max(fromIndex || 0, 0);

	for (var i = fromIndex; i < array.length; i++)
		if(array[i] == searchElement)
			return i;
	
	return -1;
};

/**
 * Generates a unique element ID.
 */
function guid(prefix)
{
	return (prefix || '') + Math.round(Math.random() * 1000000).toString();
};

/**
 * Merges two objects. Values from obj2 override values in obj1.
 * Function is NOT recursive and works only for one dimensional objects.
 * @param {Object} obj1 First object.
 * @param {Object} obj2 Second object.
 * @return {Object} Returns combination of both objects.
 */
function merge(obj1, obj2)
{
	var result = {}, name;

	for (name in obj1) 
		result[name] = obj1[name];
	
	for (name in obj2) 
		result[name] = obj2[name];
		
	return result;
};

/**
 * Attempts to convert string to boolean.
 * @param {String} value Input string.
 * @return {Boolean} Returns true if input was "true", false if input was "false" and value otherwise.
 */
function toBoolean(value)
{
	var result = { "true" : true, "false" : false }[value];
	return result == null ? value : result;
};

/**
 * Opens up a centered popup window.
 * @param {String} url		URL to open in the window.
 * @param {String} name		Popup name.
 * @param {int} width		Popup width.
 * @param {int} height		Popup height.
 * @param {String} options	window.open() options.
 * @return {Window}			Returns window instance.
 */
function popup(url, name, width, height, options)
{
	var x = (screen.width - width) / 2,
		y = (screen.height - height) / 2
		;
		
	options +=	', left=' + x + 
				', top=' + y +
				', width=' + width +
				', height=' + height
		;
	options = options.replace(/^,/, '');

	var win = window.open(url, name, options);
	win.focus();
	return win;
};

/**
 * Adds event handler to the target object.
 * @param {Object} obj		Target object.
 * @param {String} type		Name of the event.
 * @param {Function} func	Handling function.
 */
function attachEvent(obj, type, func, scope)
{
	function handler(e)
	{
		e = e || window.event;
		
		if (!e.target)
		{
			e.target = e.srcElement;
			e.preventDefault = function()
			{
				this.returnValue = false;
			};
		}
			
		func.call(scope || window, e);
	};
	
	if (obj.attachEvent) 
	{
		obj.attachEvent('on' + type, handler);
	}
	else 
	{
		obj.addEventListener(type, handler, false);
	}
};

/**
 * Displays an alert.
 * @param {String} str String to display.
 */
function alert(str)
{
	window.alert(sh.config.strings.alert + str);
};

/**
 * Finds a brush by its alias.
 *
 * @param {String} alias		Brush alias.
 * @param {Boolean} showAlert	Suppresses the alert if false.
 * @return {Brush}				Returns bursh constructor if found, null otherwise.
 */
function findBrush(alias, showAlert)
{
	var brushes = sh.vars.discoveredBrushes,
		result = null
		;
	
	if (brushes == null) 
	{
		brushes = {};
		
		// Find all brushes
		for (var brush in sh.brushes) 
		{
			var info = sh.brushes[brush],
				aliases = info.aliases
				;
			
			if (aliases == null) 
				continue;
			
			// keep the brush name
			info.brushName = brush.toLowerCase();
			
			for (var i = 0; i < aliases.length; i++) 
				brushes[aliases[i]] = brush;
		}
		
		sh.vars.discoveredBrushes = brushes;
	}
	
	result = sh.brushes[brushes[alias]];

	if (result == null && showAlert)
		alert(sh.config.strings.noBrush + alias);
	
	return result;
};

/**
 * Executes a callback on each line and replaces each line with result from the callback.
 * @param {Object} str			Input string.
 * @param {Object} callback		Callback function taking one string argument and returning a string.
 */
function eachLine(str, callback)
{
	var lines = splitLines(str);
	
	for (var i = 0; i < lines.length; i++)
		lines[i] = callback(lines[i], i);
		
	// include \r to enable copy-paste on windows (ie8) without getting everything on one line
	return lines.join('\r\n');
};

/**
 * This is a special trim which only removes first and last empty lines
 * and doesn't affect valid leading space on the first line.
 * 
 * @param {String} str   Input string
 * @return {String}      Returns string without empty first and last lines.
 */
function trimFirstAndLastLines(str)
{
	return str.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g, '');
};

/**
 * Parses key/value pairs into hash object.
 * 
 * Understands the following formats:
 * - name: word;
 * - name: [word, word];
 * - name: "string";
 * - name: 'string';
 * 
 * For example:
 *   name1: value; name2: [value, value]; name3: 'value'
 *   
 * @param {String} str    Input string.
 * @return {Object}       Returns deserialized object.
 */
function parseParams(str)
{
	var match, 
		result = {},
		arrayRegex = new XRegExp("^\\[(?<values>(.*?))\\]$"),
		regex = new XRegExp(
			"(?<name>[\\w-]+)" +
			"\\s*:\\s*" +
			"(?<value>" +
				"[\\w-%#]+|" +		// word
				"\\[.*?\\]|" +		// [] array
				'".*?"|' +			// "" string
				"'.*?'" +			// '' string
			")\\s*;?",
			"g"
		)
		;

	while ((match = regex.exec(str)) != null) 
	{
		var value = match.value
			.replace(/^['"]|['"]$/g, '') // strip quotes from end of strings
			;
		
		// try to parse array value
		if (value != null && arrayRegex.test(value))
		{
			var m = arrayRegex.exec(value);
			value = m.values.length > 0 ? m.values.split(/\s*,\s*/) : [];
		}
		
		result[match.name] = value;
	}
	
	return result;
};

/**
 * Wraps each line of the string into <code/> tag with given style applied to it.
 * 
 * @param {String} str   Input string.
 * @param {String} css   Style name to apply to the string.
 * @return {String}      Returns input string with each line surrounded by <span/> tag.
 */
function wrapLinesWithCode(str, css)
{
	if (str == null || str.length == 0 || str == '\n') 
		return str;

	str = str.replace(/</g, '&lt;');

	// Replace two or more sequential spaces with &nbsp; leaving last space untouched.
	str = str.replace(/ {2,}/g, function(m)
	{
		var spaces = '';
		
		for (var i = 0; i < m.length - 1; i++)
			spaces += sh.config.space;
		
		return spaces + ' ';
	});

	// Split each line and apply <span class="...">...</span> to them so that
	// leading spaces aren't included.
	if (css != null) 
		str = eachLine(str, function(line)
		{
			if (line.length == 0) 
				return '';
			
			var spaces = '';
			
			line = line.replace(/^(&nbsp;| )+/, function(s)
			{
				spaces = s;
				return '';
			});
			
			if (line.length == 0) 
				return spaces;
			
			return spaces + '<code class="' + css + '">' + line + '</code>';
		});

	return str;
};

/**
 * Pads number with zeros until it's length is the same as given length.
 * 
 * @param {Number} number	Number to pad.
 * @param {Number} length	Max string length with.
 * @return {String}			Returns a string padded with proper amount of '0'.
 */
function padNumber(number, length)
{
	var result = number.toString();
	
	while (result.length < length)
		result = '0' + result;
	
	return result;
};

/**
 * Replaces tabs with spaces.
 * 
 * @param {String} code		Source code.
 * @param {Number} tabSize	Size of the tab.
 * @return {String}			Returns code with all tabs replaces by spaces.
 */
function processTabs(code, tabSize)
{
	var tab = '';
	
	for (var i = 0; i < tabSize; i++)
		tab += ' ';

	return code.replace(/\t/g, tab);
};

/**
 * Replaces tabs with smart spaces.
 * 
 * @param {String} code    Code to fix the tabs in.
 * @param {Number} tabSize Number of spaces in a column.
 * @return {String}        Returns code with all tabs replaces with roper amount of spaces.
 */
function processSmartTabs(code, tabSize)
{
	var lines = splitLines(code),
		tab = '\t',
		spaces = ''
		;
	
	// Create a string with 1000 spaces to copy spaces from... 
	// It's assumed that there would be no indentation longer than that.
	for (var i = 0; i < 50; i++) 
		spaces += '                    '; // 20 spaces * 50
			
	// This function inserts specified amount of spaces in the string
	// where a tab is while removing that given tab.
	function insertSpaces(line, pos, count)
	{
		return line.substr(0, pos)
			+ spaces.substr(0, count)
			+ line.substr(pos + 1, line.length) // pos + 1 will get rid of the tab
			;
	};

	// Go through all the lines and do the 'smart tabs' magic.
	code = eachLine(code, function(line)
	{
		if (line.indexOf(tab) == -1) 
			return line;
		
		var pos = 0;
		
		while ((pos = line.indexOf(tab)) != -1) 
		{
			// This is pretty much all there is to the 'smart tabs' logic.
			// Based on the position within the line and size of a tab,
			// calculate the amount of spaces we need to insert.
			var spaces = tabSize - pos % tabSize;
			line = insertSpaces(line, pos, spaces);
		}
		
		return line;
	});
	
	return code;
};

/**
 * Performs various string fixes based on configuration.
 */
function fixInputString(str)
{
	var br = /<br\s*\/?>|&lt;br\s*\/?&gt;/gi;
	
	if (sh.config.bloggerMode == true)
		str = str.replace(br, '\n');

	if (sh.config.stripBrs == true)
		str = str.replace(br, '');
		
	return str;
};

/**
 * Removes all white space at the begining and end of a string.
 * 
 * @param {String} str   String to trim.
 * @return {String}      Returns string without leading and following white space characters.
 */
function trim(str)
{
	return str.replace(/^\s+|\s+$/g, '');
};

/**
 * Unindents a block of text by the lowest common indent amount.
 * @param {String} str   Text to unindent.
 * @return {String}      Returns unindented text block.
 */
function unindent(str)
{
	var lines = splitLines(fixInputString(str)),
		indents = new Array(),
		regex = /^\s*/,
		min = 1000
		;
	
	// go through every line and check for common number of indents
	for (var i = 0; i < lines.length && min > 0; i++) 
	{
		var line = lines[i];
		
		if (trim(line).length == 0) 
			continue;
		
		var matches = regex.exec(line);
		
		// In the event that just one line doesn't have leading white space
		// we can't unindent anything, so bail completely.
		if (matches == null) 
			return str;
			
		min = Math.min(matches[0].length, min);
	}
	
	// trim minimum common number of white space from the begining of every line
	if (min > 0) 
		for (var i = 0; i < lines.length; i++) 
			lines[i] = lines[i].substr(min);
	
	return lines.join('\n');
};

/**
 * Callback method for Array.sort() which sorts matches by
 * index position and then by length.
 * 
 * @param {Match} m1	Left object.
 * @param {Match} m2    Right object.
 * @return {Number}     Returns -1, 0 or -1 as a comparison result.
 */
function matchesSortCallback(m1, m2)
{
	// sort matches by index first
	if(m1.index < m2.index)
		return -1;
	else if(m1.index > m2.index)
		return 1;
	else
	{
		// if index is the same, sort by length
		if(m1.length < m2.length)
			return -1;
		else if(m1.length > m2.length)
			return 1;
	}
	
	return 0;
};

/**
 * Executes given regular expression on provided code and returns all
 * matches that are found.
 * 
 * @param {String} code    Code to execute regular expression on.
 * @param {Object} regex   Regular expression item info from <code>regexList</code> collection.
 * @return {Array}         Returns a list of Match objects.
 */ 
function getMatches(code, regexInfo)
{
	function defaultAdd(match, regexInfo)
	{
		return match[0];
	};
	
	var index = 0,
		match = null,
		matches = [],
		func = regexInfo.func ? regexInfo.func : defaultAdd
		;
	
	while((match = regexInfo.regex.exec(code)) != null)
	{
		var resultMatch = func(match, regexInfo);
		
		if (typeof(resultMatch) == 'string')
			resultMatch = [new sh.Match(resultMatch, match.index, regexInfo.css)];

		matches = matches.concat(resultMatch);
	}
	
	return matches;
};

/**
 * Turns all URLs in the code into <a/> tags.
 * @param {String} code Input code.
 * @return {String} Returns code with </a> tags.
 */
function processUrls(code)
{
	var gt = /(.*)((&gt;|&lt;).*)/;
	
	return code.replace(sh.regexLib.url, function(m)
	{
		var suffix = '',
			match = null
			;
		
		// We include &lt; and &gt; in the URL for the common cases like <http://google.com>
		// The problem is that they get transformed into &lt;http://google.com&gt;
		// Where as &gt; easily looks like part of the URL string.
	
		if (match = gt.exec(m))
		{
			m = match[1];
			suffix = match[2];
		}
		
		return '<a href="' + m + '">' + m + '</a>' + suffix;
	});
};

/**
 * Finds all <SCRIPT TYPE="syntaxhighlighter" /> elementss.
 * @return {Array} Returns array of all found SyntaxHighlighter tags.
 */
function getSyntaxHighlighterScriptTags()
{
	var tags = document.getElementsByTagName('script'),
		result = []
		;
	
	for (var i = 0; i < tags.length; i++)
		if (tags[i].type == 'syntaxhighlighter')
			result.push(tags[i]);
			
	return result;
};

/**
 * Strips <![CDATA[]]> from <SCRIPT /> content because it should be used
 * there in most cases for XHTML compliance.
 * @param {String} original	Input code.
 * @return {String} Returns code without leading <![CDATA[]]> tags.
 */
function stripCData(original)
{
	var left = '<![CDATA[',
		right = ']]>',
		// for some reason IE inserts some leading blanks here
		copy = trim(original),
		changed = false,
		leftLength = left.length,
		rightLength = right.length
		;
	
	if (copy.indexOf(left) == 0)
	{
		copy = copy.substring(leftLength);
		changed = true;
	}
	
	var copyLength = copy.length;
	
	if (copy.indexOf(right) == copyLength - rightLength)
	{
		copy = copy.substring(0, copyLength - rightLength);
		changed = true;
	}
	
	return changed ? copy : original;
};


/**
 * Quick code mouse double click handler.
 */
function quickCodeHandler(e)
{
	var target = e.target,
		highlighterDiv = findParentElement(target, '.syntaxhighlighter'),
		container = findParentElement(target, '.container'),
		textarea = document.createElement('textarea'),
		highlighter
		;

	if (!container || !highlighterDiv || findElement(container, 'textarea'))
		return;

	highlighter = getHighlighterById(highlighterDiv.id);
	
	// add source class name
	addClass(highlighterDiv, 'source');

	// Have to go over each line and grab it's text, can't just do it on the
	// container because Firefox loses all \n where as Webkit doesn't.
	var lines = container.childNodes,
		code = []
		;
	
	for (var i = 0; i < lines.length; i++)
		code.push(lines[i].innerText || lines[i].textContent);
	
	// using \r instead of \r or \r\n makes this work equally well on IE, FF and Webkit
	code = code.join('\r');

    // For Webkit browsers, replace nbsp with a breaking space
    code = code.replace(/\u00a0/g, " ");
	
	// inject <textarea/> tag
	textarea.appendChild(document.createTextNode(code));
	container.appendChild(textarea);
	
	// preselect all text
	textarea.focus();
	textarea.select();
	
	// set up handler for lost focus
	attachEvent(textarea, 'blur', function(e)
	{
		textarea.parentNode.removeChild(textarea);
		removeClass(highlighterDiv, 'source');
	});
};

/**
 * Match object.
 */
sh.Match = function(value, index, css)
{
	this.value = value;
	this.index = index;
	this.length = value.length;
	this.css = css;
	this.brushName = null;
};

sh.Match.prototype.toString = function()
{
	return this.value;
};

/**
 * Simulates HTML code with a scripting language embedded.
 * 
 * @param {String} scriptBrushName Brush name of the scripting language.
 */
sh.HtmlScript = function(scriptBrushName)
{
	var brushClass = findBrush(scriptBrushName),
		scriptBrush,
		xmlBrush = new sh.brushes.Xml(),
		bracketsRegex = null,
		ref = this,
		methodsToExpose = 'getDiv getHtml init'.split(' ')
		;

	if (brushClass == null)
		return;
	
	scriptBrush = new brushClass();
	
	for(var i = 0; i < methodsToExpose.length; i++)
		// make a closure so we don't lose the name after i changes
		(function() {
			var name = methodsToExpose[i];
			
			ref[name] = function()
			{
				return xmlBrush[name].apply(xmlBrush, arguments);
			};
		})();
	
	if (scriptBrush.htmlScript == null)
	{
		alert(sh.config.strings.brushNotHtmlScript + scriptBrushName);
		return;
	}
	
	xmlBrush.regexList.push(
		{ regex: scriptBrush.htmlScript.code, func: process }
	);
	
	function offsetMatches(matches, offset)
	{
		for (var j = 0; j < matches.length; j++) 
			matches[j].index += offset;
	}
	
	function process(match, info)
	{
		var code = match.code,
			matches = [],
			regexList = scriptBrush.regexList,
			offset = match.index + match.left.length,
			htmlScript = scriptBrush.htmlScript,
			result
			;

		// add all matches from the code
		for (var i = 0; i < regexList.length; i++)
		{
			result = getMatches(code, regexList[i]);
			offsetMatches(result, offset);
			matches = matches.concat(result);
		}
		
		// add left script bracket
		if (htmlScript.left != null && match.left != null)
		{
			result = getMatches(match.left, htmlScript.left);
			offsetMatches(result, match.index);
			matches = matches.concat(result);
		}
		
		// add right script bracket
		if (htmlScript.right != null && match.right != null)
		{
			result = getMatches(match.right, htmlScript.right);
			offsetMatches(result, match.index + match[0].lastIndexOf(match.right));
			matches = matches.concat(result);
		}
		
		for (var j = 0; j < matches.length; j++)
			matches[j].brushName = brushClass.brushName;
			
		return matches;
	}
};

/**
 * Main Highlither class.
 * @constructor
 */
sh.Highlighter = function()
{
	// not putting any code in here because of the prototype inheritance
};

sh.Highlighter.prototype = {
	/**
	 * Returns value of the parameter passed to the highlighter.
	 * @param {String} name				Name of the parameter.
	 * @param {Object} defaultValue		Default value.
	 * @return {Object}					Returns found value or default value otherwise.
	 */
	getParam: function(name, defaultValue)
	{
		var result = this.params[name];
		return toBoolean(result == null ? defaultValue : result);
	},
	
	/**
	 * Shortcut to document.createElement().
	 * @param {String} name		Name of the element to create (DIV, A, etc).
	 * @return {HTMLElement}	Returns new HTML element.
	 */
	create: function(name)
	{
		return document.createElement(name);
	},
	
	/**
	 * Applies all regular expression to the code and stores all found
	 * matches in the `this.matches` array.
	 * @param {Array} regexList		List of regular expressions.
	 * @param {String} code			Source code.
	 * @return {Array}				Returns list of matches.
	 */
	findMatches: function(regexList, code)
	{
		var result = [];
		
		if (regexList != null)
			for (var i = 0; i < regexList.length; i++) 
				// BUG: length returns len+1 for array if methods added to prototype chain (oising@gmail.com)
				if (typeof (regexList[i]) == "object")
					result = result.concat(getMatches(code, regexList[i]));
		
		// sort and remove nested the matches
		return this.removeNestedMatches(result.sort(matchesSortCallback));
	},
	
	/**
	 * Checks to see if any of the matches are inside of other matches. 
	 * This process would get rid of highligted strings inside comments, 
	 * keywords inside strings and so on.
	 */
	removeNestedMatches: function(matches)
	{
		// Optimized by Jose Prado (http://joseprado.com)
		for (var i = 0; i < matches.length; i++) 
		{ 
			if (matches[i] === null)
				continue;
			
			var itemI = matches[i],
				itemIEndPos = itemI.index + itemI.length
				;
			
			for (var j = i + 1; j < matches.length && matches[i] !== null; j++) 
			{
				var itemJ = matches[j];
				
				if (itemJ === null) 
					continue;
				else if (itemJ.index > itemIEndPos) 
					break;
				else if (itemJ.index == itemI.index && itemJ.length > itemI.length)
					matches[i] = null;
				else if (itemJ.index >= itemI.index && itemJ.index < itemIEndPos) 
					matches[j] = null;
			}
		}
		
		return matches;
	},
	
	/**
	 * Creates an array containing integer line numbers starting from the 'first-line' param.
	 * @return {Array} Returns array of integers.
	 */
	figureOutLineNumbers: function(code)
	{
		var lines = [],
			firstLine = parseInt(this.getParam('first-line'))
			;
		
		eachLine(code, function(line, index)
		{
			lines.push(index + firstLine);
		});
		
		return lines;
	},
	
	/**
	 * Determines if specified line number is in the highlighted list.
	 */
	isLineHighlighted: function(lineNumber)
	{
		var list = this.getParam('highlight', []);
		
		if (typeof(list) != 'object' && list.push == null) 
			list = [ list ];
		
		return indexOf(list, lineNumber.toString()) != -1;
	},
	
	/**
	 * Generates HTML markup for a single line of code while determining alternating line style.
	 * @param {Integer} lineNumber	Line number.
	 * @param {String} code Line	HTML markup.
	 * @return {String}				Returns HTML markup.
	 */
	getLineHtml: function(lineIndex, lineNumber, code)
	{
		var classes = [
			'line',
			'number' + lineNumber,
			'index' + lineIndex,
			'alt' + (lineNumber % 2 == 0 ? 1 : 2).toString()
		];
		
		if (this.isLineHighlighted(lineNumber))
		 	classes.push('highlighted');
		
		if (lineNumber == 0)
			classes.push('break');
			
		return '<div class="' + classes.join(' ') + '">' + code + '</div>';
	},
	
	/**
	 * Generates HTML markup for line number column.
	 * @param {String} code			Complete code HTML markup.
	 * @param {Array} lineNumbers	Calculated line numbers.
	 * @return {String}				Returns HTML markup.
	 */
	getLineNumbersHtml: function(code, lineNumbers)
	{
		var html = '',
			count = splitLines(code).length,
			firstLine = parseInt(this.getParam('first-line')),
			pad = this.getParam('pad-line-numbers')
			;
		
		if (pad == true)
			pad = (firstLine + count - 1).toString().length;
		else if (isNaN(pad) == true)
			pad = 0;
			
		for (var i = 0; i < count; i++)
		{
			var lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i,
				code = lineNumber == 0 ? sh.config.space : padNumber(lineNumber, pad)
				;
				
			html += this.getLineHtml(i, lineNumber, code);
		}
		
		return html;
	},
	
	/**
	 * Splits block of text into individual DIV lines.
	 * @param {String} code			Code to highlight.
	 * @param {Array} lineNumbers	Calculated line numbers.
	 * @return {String}				Returns highlighted code in HTML form.
	 */
	getCodeLinesHtml: function(html, lineNumbers)
	{
		html = trim(html);
		
		var lines = splitLines(html),
			padLength = this.getParam('pad-line-numbers'),
			firstLine = parseInt(this.getParam('first-line')),
			html = '',
			brushName = this.getParam('brush')
			;

		for (var i = 0; i < lines.length; i++)
		{
			var line = lines[i],
				indent = /^(&nbsp;|\s)+/.exec(line),
				spaces = null,
				lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i;
				;

			if (indent != null)
			{
				spaces = indent[0].toString();
				line = line.substr(spaces.length);
				spaces = spaces.replace(' ', sh.config.space);
			}

			line = trim(line);
			
			if (line.length == 0)
				line = sh.config.space;
			
			html += this.getLineHtml(
				i,
				lineNumber, 
				(spaces != null ? '<code class="' + brushName + ' spaces">' + spaces + '</code>' : '') + line
			);
		}
		
		return html;
	},
	
	/**
	 * Returns HTML for the table title or empty string if title is null.
	 */
	getTitleHtml: function(title)
	{
		return title ? '<caption>' + title + '</caption>' : '';
	},
	
	/**
	 * Finds all matches in the source code.
	 * @param {String} code		Source code to process matches in.
	 * @param {Array} matches	Discovered regex matches.
	 * @return {String} Returns formatted HTML with processed mathes.
	 */
	getMatchesHtml: function(code, matches)
	{
		var pos = 0, 
			result = '',
			brushName = this.getParam('brush', '')
			;
		
		function getBrushNameCss(match)
		{
			var result = match ? (match.brushName || brushName) : brushName;
			return result ? result + ' ' : '';
		};
		
		// Finally, go through the final list of matches and pull the all
		// together adding everything in between that isn't a match.
		for (var i = 0; i < matches.length; i++) 
		{
			var match = matches[i],
				matchBrushName
				;
			
			if (match === null || match.length === 0) 
				continue;
			
			matchBrushName = getBrushNameCss(match);
			
			result += wrapLinesWithCode(code.substr(pos, match.index - pos), matchBrushName + 'plain')
					+ wrapLinesWithCode(match.value, matchBrushName + match.css)
					;

			pos = match.index + match.length + (match.offset || 0);
		}

		// don't forget to add whatever's remaining in the string
		result += wrapLinesWithCode(code.substr(pos), getBrushNameCss() + 'plain');

		return result;
	},
	
	/**
	 * Generates HTML markup for the whole syntax highlighter.
	 * @param {String} code Source code.
	 * @return {String} Returns HTML markup.
	 */
	getHtml: function(code)
	{
		var html = '',
			classes = [ 'syntaxhighlighter' ],
			tabSize,
			matches,
			lineNumbers
			;
		
		// process light mode
		if (this.getParam('light') == true)
			this.params.toolbar = this.params.gutter = false;

		className = 'syntaxhighlighter';

		if (this.getParam('collapse') == true)
			classes.push('collapsed');
		
		if ((gutter = this.getParam('gutter')) == false)
			classes.push('nogutter');

		// add custom user style name
		classes.push(this.getParam('class-name'));

		// add brush alias to the class name for custom CSS
		classes.push(this.getParam('brush'));

		code = trimFirstAndLastLines(code)
			.replace(/\r/g, ' ') // IE lets these buggers through
			;

		tabSize = this.getParam('tab-size');

		// replace tabs with spaces
		code = this.getParam('smart-tabs') == true
			? processSmartTabs(code, tabSize)
			: processTabs(code, tabSize)
			;

		// unindent code by the common indentation
		if (this.getParam('unindent'))
			code = unindent(code);

		if (gutter)
			lineNumbers = this.figureOutLineNumbers(code);
		
		// find matches in the code using brushes regex list
		matches = this.findMatches(this.regexList, code);
		// processes found matches into the html
		html = this.getMatchesHtml(code, matches);
		// finally, split all lines so that they wrap well
		html = this.getCodeLinesHtml(html, lineNumbers);

		// finally, process the links
		if (this.getParam('auto-links'))
			html = processUrls(html);
		
		if (typeof(navigator) != 'undefined' && navigator.userAgent && navigator.userAgent.match(/MSIE/))
			classes.push('ie');
		
		html = 
			'<div id="' + getHighlighterId(this.id) + '" class="' + classes.join(' ') + '">'
				+ (this.getParam('toolbar') ? sh.toolbar.getHtml(this) : '')
				+ '<table border="0" cellpadding="0" cellspacing="0">'
					+ this.getTitleHtml(this.getParam('title'))
					+ '<tbody>'
						+ '<tr>'
							+ (gutter ? '<td class="gutter">' + this.getLineNumbersHtml(code) + '</td>' : '')
							+ '<td class="code">'
								+ '<div class="container">'
									+ html
								+ '</div>'
							+ '</td>'
						+ '</tr>'
					+ '</tbody>'
				+ '</table>'
			+ '</div>'
			;
			
		return html;
	},
	
	/**
	 * Highlights the code and returns complete HTML.
	 * @param {String} code     Code to highlight.
	 * @return {Element}        Returns container DIV element with all markup.
	 */
	getDiv: function(code)
	{
		if (code === null) 
			code = '';
		
		this.code = code;

		var div = this.create('div');

		// create main HTML
		div.innerHTML = this.getHtml(code);
		
		// set up click handlers
		if (this.getParam('toolbar'))
			attachEvent(findElement(div, '.toolbar'), 'click', sh.toolbar.handler);
		
		if (this.getParam('quick-code'))
			attachEvent(findElement(div, '.code'), 'dblclick', quickCodeHandler);
		
		return div;
	},
	
	/**
	 * Initializes the highlighter/brush.
	 *
	 * Constructor isn't used for initialization so that nothing executes during necessary
	 * `new SyntaxHighlighter.Highlighter()` call when setting up brush inheritence.
	 *
	 * @param {Hash} params Highlighter parameters.
	 */
	init: function(params)
	{
		this.id = guid();
		
		// register this instance in the highlighters list
		storeHighlighter(this);
		
		// local params take precedence over defaults
		this.params = merge(sh.defaults, params || {})
		
		// process light mode
		if (this.getParam('light') == true)
			this.params.toolbar = this.params.gutter = false;
	},
	
	/**
	 * Converts space separated list of keywords into a regular expression string.
	 * @param {String} str    Space separated keywords.
	 * @return {String}       Returns regular expression string.
	 */
	getKeywords: function(str)
	{
		str = str
			.replace(/^\s+|\s+$/g, '')
			.replace(/\s+/g, '|')
			;
		
		return '\\b(?:' + str + ')\\b';
	},
	
	/**
	 * Makes a brush compatible with the `html-script` functionality.
	 * @param {Object} regexGroup Object containing `left` and `right` regular expressions.
	 */
	forHtmlScript: function(regexGroup)
	{
		var regex = { 'end' : regexGroup.right.source };

		if(regexGroup.eof)
			regex.end = "(?:(?:" + regex.end + ")|$)";
		
		this.htmlScript = {
			left : { regex: regexGroup.left, css: 'script' },
			right : { regex: regexGroup.right, css: 'script' },
			code : new XRegExp(
				"(?<left>" + regexGroup.left.source + ")" +
				"(?<code>.*?)" +
				"(?<right>" + regex.end + ")",
				"sgi"
				)
		};
	}
}; // end of Highlighter

return sh;
}(); // end of anonymous function

// CommonJS
typeof(exports) != 'undefined' ? exports.SyntaxHighlighter = SyntaxHighlighter : null;

},{"./XRegExp":20}],22:[function(require,module,exports){
(function (__dirname){
var fs         =  require('fs')
  , path       =  require('path')
  , util       =  require('util')
  , inline     =  require('./inline-scripts')
  , scriptsDir =  path.join(__dirname, './lib/scripts')
  , stylesDir  =  path.join(__dirname, './lib/styles')
  , styles
  , langMap    =  { }
  , similarMap =  { }
  , similarLangs =  {
        'js'     :  [ 'json' ]
      , 'python' :  ['coffee', 'groovy', 'hs', 'haskell' ]
    }
  ;


// Self invoking functions block until they are finished in order to ensure that 
// this module is properly initialized before it is returned.
// Since this only happens once (when module is required), it shouldn't be a problem.
(function mapBrushes() {
  fs.readdirSync(scriptsDir).forEach(function (file) {
    if (!file.match(/shBrush\w+\.js/)) return;
    
    var language = require(path.join(scriptsDir, file));
    language.Brush.aliases.forEach(function (alias) {
      langMap[alias.toLowerCase()] = language;
    });
  });  

  // Add some known aliases
  langMap['cs'] = langMap['c#'];

  // Add similar brushes to similar map
  Object.keys(similarLangs).forEach(function (lang) {
    similarLangs[lang].forEach(function (similar) {
      similarMap[similar] = langMap[lang];
    });
  });
}) ();

(function collectStyles () {
  styles = fs.readdirSync(stylesDir)
    .filter(function (fileName) {
      return fileName.match(/shCore.+\.css/);
    })
    .map(function (fileName) {
      var normalizedFileName =  fileName.replace(/shCore/, '')
        , extLength          =  path.extname(normalizedFileName).length
        , nameLength         =  normalizedFileName.length - extLength
        , styleName          =  normalizedFileName.substr(0, nameLength).toLowerCase()
        , fullFilePath       =  path.join(stylesDir, fileName)
        ;

      return { name: styleName, sourcePath: fullFilePath };
      
    });
}) ();

function getLanguage(alias, strict) {
  // accept *.ext, .ext and ext
  var normalizedAlias = alias.replace(/^\*/,'').replace(/^\./,'');

  var match = langMap[normalizedAlias] || (!strict ? similarMap[normalizedAlias] : void 0);
  
  // Need to remember if user is highlighting html or xhtml for instance for use in highlight
  if (match) match.specifiedAlias = normalizedAlias;

  return match;
}

// options: http://alexgorbatchev.com/SyntaxHighlighter/manual/configuration/
function highlight(code, language, options) {
  var mergedOpts = { }
    , defaults = {
          toolbar: false
        , 'first-line': 1
      }
    , highlightedHtml
    ;

  if (!language) throw new Error('You need to pass a language obtained via "getLanguage"');
  if (!language.Brush) throw new Error('You need to pass a language with a Brush, obtained via "getLanguage"');

  if (options) {
    // Gather all user specified options first
    Object.keys(options).forEach(function (key) {
      mergedOpts[key] = options[key];
    });
    // Add default option only if user didn't specify its value
    Object.keys(defaults).forEach(function (key) {
      mergedOpts[key] = options[key] || defaults[key];
    });

  } else {
    mergedOpts = defaults;
  }

  var brush = new language.Brush();
  brush.init(mergedOpts);

  highlightedHtml = brush.getHtml(code);

  if (language === langMap['html']) {
    var lines = code.split('\n')
      , scripts = inline.findScripts(lines, language.specifiedAlias);

    // Highlight code in between scripts tags and interject it into highlighted html
    scripts.forEach(function (script) {
      var scriptLang = langMap[script.tag.alias]
        , brush = new scriptLang.Brush()
        , opts = mergedOpts
        ;

      // adapt line numbers of highlighted code since it is in the middle of html document
      opts['first-line'] = mergedOpts['first-line'] + script.from;
      
      brush.init(opts);

      var highlightedScript = brush.getHtml(script.code)
        , higlightedLines = inline.extractLines(highlightedScript);

      highlightedHtml = inline.replacePlainLines(script.from, script.to, highlightedHtml, higlightedLines);
    });
 } 

  return highlightedHtml;
}


function getStyles () {
  return styles;
}

function copyStyle (style, tgt, cb) {
  var sourcePath
    , styleName;

  // Allow style to just be a string (its name) or a style returned from getStyles
  if (typeof style === 'string') {
    styleName = style;

    var matchingStyle = styles.filter(function (s) { return s.name === style; })[0];

    if (!matchingStyle) 
      cb(new Error('Style named "' + style + '" not found.'));
    else
      sourcePath = matchingStyle.sourcePath;

  } else if (!style.sourcePath) {
    cb(new Error('style needs to be string or have "sourcePath" property'));
  } else {
    styleName = style.name;
    sourcePath = style.sourcePath;
  }

  var readStream = fs.createReadStream(sourcePath)
    , writeStream = fs.createWriteStream(path.join(tgt, styleName + '.css'))
    ; 

  util.pump(readStream, writeStream, cb);
}


function copyStyles(tgt, cb) {
  var pending = styles.length;
  styles.forEach(function (s) {
    copyStyle(s, tgt, function (err) {
      if (err) { 
        cb(err);
      } else {
        if (--pending === 0) cb();
      } 
    });
  });
}

module.exports = {
    highlight   :  highlight
  , getLanguage :  getLanguage
  , getStyles   :  getStyles
  , copyStyle   :  copyStyle
  , copyStyles  :  copyStyles
};


}).call(this,"/node_modules/node-syntaxhighlighter")

},{"./inline-scripts":19,"fs":1,"path":3,"util":6}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsImxpYi9icm93c2VyL2RvY3MuYnJvd3Nlci5qcyIsImxpYi9jb21wb25lbnRzL2RvY3MuY29tcG9uZW50LmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2hlYWRlci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3NuaXBwZXQuanMiLCJsaWIvY29tcG9uZW50cy92aWV3cy9ndWlkZV92aWV3LmpzIiwibGliL2NvbnN0YW50cy9zbmlwcGV0X2NvbnN0YW50cy5qcyIsImxpYi9zZXJ2aWNlcy9saW5rX3NlcnZpY2UuanMiLCJsaWIvc2VydmljZXMvc25pcHBldF9zZXJ2aWNlLmpzIiwibm9kZV9tb2R1bGVzL2FwZS1oaWdobGlnaHRpbmcvbGliL2hpZ2hsaWdodF9qc3guanMiLCJub2RlX21vZHVsZXMvYXBlLWhpZ2hsaWdodGluZy9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvanN4LXN5bnRheGhpZ2hsaWdodGVyL3NoQnJ1c2hKc3guanMiLCJub2RlX21vZHVsZXMvbm9kZS1zeW50YXhoaWdobGlnaHRlci9pbmxpbmUtc2NyaXB0cy5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXN5bnRheGhpZ2hsaWdodGVyL2xpYi9zY3JpcHRzL1hSZWdFeHAuanMiLCJub2RlX21vZHVsZXMvbm9kZS1zeW50YXhoaWdobGlnaHRlci9saWIvc2NyaXB0cy9zaENvcmUuanMiLCJub2RlX21vZHVsZXMvbm9kZS1zeW50YXhoaWdobGlnaHRlci9ub2RlLXN5bnRheGhpZ2hsaWdodGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdHJEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsYXN0ID0gcGFydHNbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gU3BsaXQgYSBmaWxlbmFtZSBpbnRvIFtyb290LCBkaXIsIGJhc2VuYW1lLCBleHRdLCB1bml4IHZlcnNpb25cbi8vICdyb290JyBpcyBqdXN0IGEgc2xhc2gsIG9yIG5vdGhpbmcuXG52YXIgc3BsaXRQYXRoUmUgPVxuICAgIC9eKFxcLz98KShbXFxzXFxTXSo/KSgoPzpcXC57MSwyfXxbXlxcL10rP3wpKFxcLlteLlxcL10qfCkpKD86W1xcL10qKSQvO1xudmFyIHNwbGl0UGF0aCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gIHJldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKTtcbn07XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZWRQYXRoID0gJycsXG4gICAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICB2YXIgcGF0aCA9IChpID49IDApID8gYXJndW1lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5qb2luIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuLy8gcGF0aC5yZWxhdGl2ZShmcm9tLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuZXhwb3J0cy5kZWxpbWl0ZXIgPSAnOic7XG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIHJlc3VsdCA9IHNwbGl0UGF0aChwYXRoKSxcbiAgICAgIHJvb3QgPSByZXN1bHRbMF0sXG4gICAgICBkaXIgPSByZXN1bHRbMV07XG5cbiAgaWYgKCFyb290ICYmICFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lIHdoYXRzb2V2ZXJcbiAgICByZXR1cm4gJy4nO1xuICB9XG5cbiAgaWYgKGRpcikge1xuICAgIC8vIEl0IGhhcyBhIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgZGlyID0gZGlyLnN1YnN0cigwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gcm9vdCArIGRpcjtcbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aChwYXRoKVsyXTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbXBhcmlzb24gY2FzZS1pbnNlbnNpdGl2ZSBvbiB3aW5kb3dzP1xuICBpZiAoZXh0ICYmIGYuc3Vic3RyKC0xICogZXh0Lmxlbmd0aCkgPT09IGV4dCkge1xuICAgIGYgPSBmLnN1YnN0cigwLCBmLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBmO1xufTtcblxuXG5leHBvcnRzLmV4dG5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBzcGxpdFBhdGgocGF0aClbM107XG59O1xuXG5mdW5jdGlvbiBmaWx0ZXIgKHhzLCBmKSB7XG4gICAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbnZhciBzdWJzdHIgPSAnYWInLnN1YnN0cigtMSkgPT09ICdiJ1xuICAgID8gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikgeyByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKSB9XG4gICAgOiBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKTtcbiAgICB9XG47XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCIvKipcbiAqIEJyb3dzZXIgc2NyaXB0IGZvciBkb2NzLlxuICpcbiAqIEdlbmVyYXRlZCBieSBjb3ogb24gNi85LzIwMTYsXG4gKiBmcm9tIGEgdGVtcGxhdGUgcHJvdmlkZWQgYnkgYXBlbWFuLWJ1ZC1tb2NrLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0ID0gcmVxdWlyZSgnYXBlbWFuLWJyd3MtcmVhY3QnKTtcblxudmFyIF9hcGVtYW5CcndzUmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBlbWFuQnJ3c1JlYWN0KTtcblxudmFyIF9kb2NzQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9kb2NzLmNvbXBvbmVudC5qcycpO1xuXG52YXIgX2RvY3NDb21wb25lbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZG9jc0NvbXBvbmVudCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBDT05UQUlORVJfSUQgPSAnZG9jcy13cmFwJztcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfd2luZG93ID0gd2luZG93O1xuICB2YXIgbG9jYWxlID0gX3dpbmRvdy5sb2NhbGU7XG5cbiAgX2FwZW1hbkJyd3NSZWFjdDIuZGVmYXVsdC5yZW5kZXIoQ09OVEFJTkVSX0lELCBfZG9jc0NvbXBvbmVudDIuZGVmYXVsdCwge1xuICAgIGxvY2FsZTogbG9jYWxlXG4gIH0sIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgLy8gVGhlIGNvbXBvbmVudCBpcyByZWFkeS5cbiAgfSk7XG59OyIsIi8qKlxuICogQ29tcG9uZW50IG9mIGRvY3MuXG4gKlxuICogR2VuZXJhdGVkIGJ5IGNveiBvbiA2LzkvMjAxNixcbiAqIGZyb20gYSB0ZW1wbGF0ZSBwcm92aWRlZCBieSBhcGVtYW4tYnVkLW1vY2suXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RTdHlsZSA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1zdHlsZScpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9oZWFkZXIgPSByZXF1aXJlKCcuL2ZyYWdtZW50cy9oZWFkZXInKTtcblxudmFyIF9oZWFkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVhZGVyKTtcblxudmFyIF9ndWlkZV92aWV3ID0gcmVxdWlyZSgnLi92aWV3cy9ndWlkZV92aWV3Jyk7XG5cbnZhciBfZ3VpZGVfdmlldzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ndWlkZV92aWV3KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIERvY3NDb21wb25lbnQgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0RvY3NDb21wb25lbnQnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhY2tlcjogbmV3IF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLlN0YWNrZXIoe1xuICAgICAgICByb290OiBfZ3VpZGVfdmlldzIuZGVmYXVsdCxcbiAgICAgICAgcm9vdFByb3BzOiB7fVxuICAgICAgfSlcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHMucmVnaXN0ZXJMb2NhbGUocHJvcHMubG9jYWxlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBQYWdlLFxuICAgICAgbnVsbCxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9oZWFkZXIyLmRlZmF1bHQsIHsgdGFiOiAnRE9DUycgfSksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBNYWluLFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjaywgeyBzdGFja2VyOiBwcm9wcy5zdGFja2VyIH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IERvY3NDb21wb25lbnQ7IiwiLyoqXG4gKiBIZWFkZXIgY29tcG9uZW50XG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9sb2dvID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL2xvZ28nKTtcblxudmFyIF9sb2dvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xvZ28pO1xuXG52YXIgX2xpbmtfc2VydmljZSA9IHJlcXVpcmUoJy4uLy4uL3NlcnZpY2VzL2xpbmtfc2VydmljZScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgSGVhZGVyID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdIZWFkZXInLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHRhYjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhYjogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgdGFiID0gcHJvcHMudGFiO1xuXG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHZhciBfdGFiSXRlbSA9IF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyVGFiSXRlbS5jcmVhdGVJdGVtO1xuICAgIHZhciBfbGluayA9IGZ1bmN0aW9uIF9saW5rKCkge1xuICAgICAgcmV0dXJuIF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLnJlc29sdmVIdG1sTGluay5hcHBseShfbGlua19zZXJ2aWNlLnNpbmdsZXRvbiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyLFxuICAgICAgeyBjbGFzc05hbWU6ICdoZWFkZXInIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBDb250YWluZXIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyTG9nbyxcbiAgICAgICAgICB7IGhyZWY6IF9saW5rKCdpbmRleC5odG1sJykgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbG9nbzIuZGVmYXVsdCwgbnVsbClcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5ET0NTX1BBR0UnKSwgX2xpbmsoJ2RvY3MuaHRtbCcpLCB7IHNlbGVjdGVkOiB0YWIgPT09ICdET0NTJyB9KSxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5DQVNFU19QQUdFJyksIF9saW5rKCdjYXNlcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0NBU0VTJyB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEhlYWRlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIExvZ28gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0xvZ28nLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2gxJyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnbG9nbycgfSxcbiAgICAgICdTVUdPUydcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9nbzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFNuaXBwZXQgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1NuaXBwZXQnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZFxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdzbmlwcGV0JywgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHsgX19odG1sOiBwcm9wcy5zcmMgfSB9KTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNuaXBwZXQ7IiwiLyoqXG4gKiBWaWV3IGZvciBndWlkZVxuICogQGNsYXNzIEd1aWRlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9zbmlwcGV0ID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL3NuaXBwZXQnKTtcblxudmFyIF9zbmlwcGV0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NuaXBwZXQpO1xuXG52YXIgX3NuaXBwZXRfc2VydmljZSA9IHJlcXVpcmUoJy4uLy4uL3NlcnZpY2VzL3NuaXBwZXRfc2VydmljZScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgR3VpZGVWaWV3ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdHdWlkZVZpZXcnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcblxuICAgIHZhciBfc2VjdGlvbiA9IGZ1bmN0aW9uIF9zZWN0aW9uKG5hbWUsIGNvbmZpZykge1xuICAgICAgdmFyIHRpdGxlID0gY29uZmlnLnRpdGxlO1xuICAgICAgdmFyIHRleHQgPSBjb25maWcudGV4dDtcbiAgICAgIHZhciBzbmlwcGV0ID0gY29uZmlnLnNuaXBwZXQ7XG5cbiAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uLFxuICAgICAgICB7IGlkOiAnZ3VpZGUtJyArIG5hbWUgKyAnLXNlY3Rpb24nLFxuICAgICAgICAgIGNsYXNzTmFtZTogJ2d1aWRlLXNlY3Rpb24nLFxuICAgICAgICAgIGtleTogbmFtZVxuICAgICAgICB9LFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25IZWFkZXIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICB0aXRsZVxuICAgICAgICApLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb25Cb2R5LFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZ3VpZGUtdGV4dC1jb250YWluZXInIH0sXG4gICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZ3VpZGUtZGVzY3JpcHRpb24nIH0sXG4gICAgICAgICAgICAgIFtdLmNvbmNhdCh0ZXh0KS5tYXAoZnVuY3Rpb24gKHRleHQsIGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAncCcsXG4gICAgICAgICAgICAgICAgICB7IGtleTogaSB9LFxuICAgICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS1pbWFnZS1jb250YWluZXInIH0sXG4gICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZ3VpZGUtc25pcHBldCcgfSxcbiAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3NuaXBwZXQyLmRlZmF1bHQsIHsgc3JjOiBzbmlwcGV0IH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXcsXG4gICAgICB7IGNsYXNzTmFtZTogJ2d1aWRlLXZpZXcnIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdIZWFkZXIsIG51bGwpLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0JvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIFtfc2VjdGlvbignY2xvdWQtc2V0dXAnLCB7XG4gICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkdVSURFX0NMT1VEX1NFVFVQX1RJVExFJyksXG4gICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuR1VJREVfQ0xPVURfU0VUVVBfVEVYVCcpLFxuICAgICAgICAgIHNuaXBwZXQ6IF9zbmlwcGV0X3NlcnZpY2Uuc2luZ2xldG9uLmdldFNuaXBwZXQoJ2V4YW1wbGVDbG91ZCcpXG4gICAgICAgIH0pLCBfc2VjdGlvbignc3BvdC1ydW4nLCB7XG4gICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkdVSURFX1NQT1RfUlVOX1RJVExFJyksXG4gICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuR1VJREVfU1BPVF9SVU5fVEVYVCcpLFxuICAgICAgICAgIHNuaXBwZXQ6IF9zbmlwcGV0X3NlcnZpY2Uuc2luZ2xldG9uLmdldFNuaXBwZXQoJ2V4YW1wbGVTcG90JylcbiAgICAgICAgfSksIF9zZWN0aW9uKCd0ZXJtaW5hbC11c2UnLCB7XG4gICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkdVSURFX1RFUk1JTkFMX1VTRV9USVRMRScpLFxuICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkdVSURFX1RFUk1JTkFMX1VTRV9URVhUJyksXG4gICAgICAgICAgc25pcHBldDogX3NuaXBwZXRfc2VydmljZS5zaW5nbGV0b24uZ2V0U25pcHBldCgnZXhhbXBsZVRlcm1pbmFsJylcbiAgICAgICAgfSldXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpZGVWaWV3OyIsIi8qKlxuICogQG5hbWVzcGFjZSBTbmlwcGV0Q29uc3RhbnRzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5leGFtcGxlVGVybWluYWwgPSBleHBvcnRzLmV4YW1wbGVTcG90ID0gZXhwb3J0cy5leGFtcGxlQ2xvdWQgPSBleHBvcnRzLmV4YW1wbGVVc2FnZSA9IHVuZGVmaW5lZDtcblxudmFyIF9hcGVIaWdobGlnaHRpbmcgPSByZXF1aXJlKCdhcGUtaGlnaGxpZ2h0aW5nJyk7XG5cbnZhciBfZnMgPSByZXF1aXJlKCdmcycpO1xuXG52YXIgX2ZzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGV4aXN0cyA9IGZ1bmN0aW9uIGV4aXN0cyhmaWxlbmFtZSkge1xuICByZXR1cm4gX2ZzMi5kZWZhdWx0LmV4aXN0c1N5bmMgJiYgX2ZzMi5kZWZhdWx0LmV4aXN0c1N5bmMoZmlsZW5hbWUpO1xufTtcbnZhciByZWFkID0gZnVuY3Rpb24gcmVhZChmaWxlbmFtZSkge1xuICByZXR1cm4gZXhpc3RzKGZpbGVuYW1lKSAmJiBfZnMyLmRlZmF1bHQucmVhZEZpbGVTeW5jKGZpbGVuYW1lKS50b1N0cmluZygpIHx8IG51bGw7XG59O1xuXG52YXIgZXhhbXBsZVVzYWdlID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9leGFtcGxlLXVzYWdlLmpzJykpKTtcbnZhciBleGFtcGxlQ2xvdWQgPSBfYXBlSGlnaGxpZ2h0aW5nLmhpZ2hsaWdodEpzeC5jb2RlKHJlYWQocmVxdWlyZS5yZXNvbHZlKCdzdWdvcy9leGFtcGxlL21vZHVsZXMvZXhhbXBsZS1jbG91ZC5qcycpKSk7XG52YXIgZXhhbXBsZVNwb3QgPSBfYXBlSGlnaGxpZ2h0aW5nLmhpZ2hsaWdodEpzeC5jb2RlKHJlYWQocmVxdWlyZS5yZXNvbHZlKCdzdWdvcy9leGFtcGxlL21vZHVsZXMvZXhhbXBsZS1zcG90LmpzJykpKTtcbnZhciBleGFtcGxlVGVybWluYWwgPSBfYXBlSGlnaGxpZ2h0aW5nLmhpZ2hsaWdodEpzeC5jb2RlKHJlYWQocmVxdWlyZS5yZXNvbHZlKCdzdWdvcy9leGFtcGxlL21vZHVsZXMvZXhhbXBsZS10ZXJtaW5hbC5qcycpKSk7XG5cbmV4cG9ydHMuZXhhbXBsZVVzYWdlID0gZXhhbXBsZVVzYWdlO1xuZXhwb3J0cy5leGFtcGxlQ2xvdWQgPSBleGFtcGxlQ2xvdWQ7XG5leHBvcnRzLmV4YW1wbGVTcG90ID0gZXhhbXBsZVNwb3Q7XG5leHBvcnRzLmV4YW1wbGVUZXJtaW5hbCA9IGV4YW1wbGVUZXJtaW5hbDsiLCIvKipcbiAqIEBjbGFzcyBMaW5rU2VydmljZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vKiogQGxlbmRzIExpbmtTZXJ2aWNlICovXG5cbnZhciBMaW5rU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTGlua1NlcnZpY2UoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExpbmtTZXJ2aWNlKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhMaW5rU2VydmljZSwgW3tcbiAgICBrZXk6ICdyZXNvbHZlSHRtbExpbmsnLFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIGEgaHRtbCBsaW5rXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gSHRtbCBmaWxlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFJlc29sdmVkIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlSHRtbExpbmsoZmlsZW5hbWUpIHtcbiAgICAgIHZhciBzID0gdGhpcztcbiAgICAgIHZhciBsYW5nID0gcy5fZ2V0TGFuZygpO1xuICAgICAgdmFyIGh0bWxEaXIgPSBsYW5nID8gJ2h0bWwvJyArIGxhbmcgOiAnaHRtbCc7XG4gICAgICByZXR1cm4gcGF0aC5qb2luKGh0bWxEaXIsIGZpbGVuYW1lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfZ2V0TGFuZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9nZXRMYW5nKCkge1xuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5MQU5HO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpbmRvdy5sYW5nO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBMaW5rU2VydmljZTtcbn0oKTtcblxudmFyIHNpbmdsZXRvbiA9IG5ldyBMaW5rU2VydmljZSgpO1xuXG5PYmplY3QuYXNzaWduKExpbmtTZXJ2aWNlLCB7XG4gIHNpbmdsZXRvbjogc2luZ2xldG9uXG59KTtcblxuZXhwb3J0cy5zaW5nbGV0b24gPSBzaW5nbGV0b247XG5leHBvcnRzLmRlZmF1bHQgPSBMaW5rU2VydmljZTsiLCIvKipcbiAqIEBjbGFzcyBTbmlwcGV0U2VydmljZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKiBAbGVuZHMgU25pcHBldFNlcnZpY2UgKi9cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNuaXBwZXRTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTbmlwcGV0U2VydmljZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU25pcHBldFNlcnZpY2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNuaXBwZXRTZXJ2aWNlLCBbe1xuICAgIGtleTogJ2dldFNuaXBwZXQnLFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNuaXBwZXQgd2l0aCBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHNuaXBwZXRcbiAgICAgKiBAcmV0dXJucyB7P3N0cmluZ30gLSBNYXRjaGVkIHNuaXBwZXRcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U25pcHBldChuYW1lKSB7XG4gICAgICB2YXIgcyA9IHRoaXM7XG4gICAgICB2YXIgc25pcHBldHMgPSBzLl9nZXRTbmlwcGV0cygpO1xuICAgICAgcmV0dXJuIHNuaXBwZXRzW25hbWVdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19nZXRTbmlwcGV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9nZXRTbmlwcGV0cygpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcmVxdWlyZSgnLi4vY29uc3RhbnRzL3NuaXBwZXRfY29uc3RhbnRzJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93LnNuaXBwZXRzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTbmlwcGV0U2VydmljZTtcbn0oKTtcblxudmFyIHNpbmdsZXRvbiA9IG5ldyBTbmlwcGV0U2VydmljZSgpO1xuXG5PYmplY3QuYXNzaWduKFNuaXBwZXRTZXJ2aWNlLCB7XG4gIHNpbmdsZXRvbjogc2luZ2xldG9uXG59KTtcblxuZXhwb3J0cy5zaW5nbGV0b24gPSBzaW5nbGV0b247XG5leHBvcnRzLmRlZmF1bHQgPSBTbmlwcGV0U2VydmljZTsiLCIvKipcbiAqIEBmdW5jdGlvbiBoaWdobGlnaHRKc3hcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmMgLSBTb3VyY2Ugc3RyaW5nLlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBPcHRpb25hbCBzZXR0aW5ncy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IC0gSGlnaGxpZ2h0ZWQgc3RyaW5nLlxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBuc2ggPSByZXF1aXJlKCdub2RlLXN5bnRheGhpZ2hsaWdodGVyJylcbmNvbnN0IGpzeCA9IHJlcXVpcmUoJ2pzeC1zeW50YXhoaWdobGlnaHRlcicpXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuLyoqIEBsZW5kcyBoaWdobGlnaHRKc3ggKi9cbmZ1bmN0aW9uIGhpZ2hsaWdodEpzeCAoc3JjLCBvcHRpb25zID0ge30pIHtcbiAgbGV0IHN0eWxlID0gaGlnaGxpZ2h0SnN4LnN0eWxlKClcbiAgbGV0IGNvZGUgPSBoaWdobGlnaHRKc3guY29kZShzcmMpXG4gIHJldHVybiBbXG4gICAgJzxkaXY+JyxcbiAgICAnPHN0eWxlIHNjb3BlZD1cInNjb3BlZFwiPicgKyBzdHlsZSArICc8L3N0eWxlPicsXG4gICAgY29kZSxcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJycpXG59XG5cbmhpZ2hsaWdodEpzeC5jb2RlID0gZnVuY3Rpb24gKHNyYykge1xuICByZXR1cm4gbnNoLmhpZ2hsaWdodChzcmMsIGpzeCwgeyBndXR0ZXI6IGZhbHNlIH0pXG59XG5cbmhpZ2hsaWdodEpzeC5zdHlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IGZpbGVuYW1lID0gbnNoLmdldFN0eWxlcygpWyAwIF0uc291cmNlUGF0aFxuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lKS50b1N0cmluZygpXG59XG5cbmhpZ2hsaWdodEpzeC5mcm9tRmlsZSA9IGZ1bmN0aW9uIChmaWxlbmFtZSwgb3B0aW9ucykge1xuICBsZXQgc3JjID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lKS50b1N0cmluZygpXG4gIHJldHVybiBoaWdobGlnaHRKc3goc3JjLCBvcHRpb25zKVxufVxubW9kdWxlLmV4cG9ydHMgPSBoaWdobGlnaHRKc3hcbiIsIi8qKlxuICogYXBlIGZyYW1ld29yayBtb2R1bGUgZm9yIGhpZ2hsaWdodGluZy5cbiAqIEBtb2R1bGUgYXBlLWhpZ2hsaWdodGluZ1xuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IGhpZ2hsaWdodEpzeCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vaGlnaGxpZ2h0X2pzeCcpKSB9XG59XG4iLCJ2YXIgWFJlZ0V4cCA9IHJlcXVpcmUoXCJub2RlLXN5bnRheGhpZ2hsaWdodGVyL2xpYi9zY3JpcHRzL1hSZWdFeHBcIikuWFJlZ0V4cDtcclxudmFyIFN5bnRheEhpZ2hsaWdodGVyO1xyXG47KGZ1bmN0aW9uKClcclxue1xyXG5cdC8vIENvbW1vbkpTXHJcblx0U3ludGF4SGlnaGxpZ2h0ZXIgPSBTeW50YXhIaWdobGlnaHRlciB8fCAodHlwZW9mIHJlcXVpcmUgIT09ICd1bmRlZmluZWQnPyByZXF1aXJlKFwibm9kZS1zeW50YXhoaWdobGlnaHRlci9saWIvc2NyaXB0cy9zaENvcmVcIikuU3ludGF4SGlnaGxpZ2h0ZXIgOiBudWxsKTtcclxuXHJcblx0ZnVuY3Rpb24gQnJ1c2goKVxyXG5cdHtcclxuXHRcdGZ1bmN0aW9uIHByb2Nlc3MobWF0Y2gsIHJlZ2V4SW5mbylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGNvbnN0cnVjdG9yID0gU3ludGF4SGlnaGxpZ2h0ZXIuTWF0Y2gsXHJcblx0XHRcdFx0Y29kZSA9IG1hdGNoWzBdLFxyXG5cdFx0XHRcdHRhZyA9IG5ldyBYUmVnRXhwKCcoJmx0O3w8KVtcXFxcc1xcXFwvXFxcXD9dKig/PG5hbWU+WzpcXFxcdy1cXFxcLl0rKScsICd4ZycpLmV4ZWMoY29kZSksXHJcblx0XHRcdFx0cmVzdWx0ID0gW11cclxuXHRcdFx0XHQ7XHJcblx0XHRcclxuXHRcdFx0aWYgKG1hdGNoLmF0dHJpYnV0ZXMgIT0gbnVsbCkgXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgYXR0cmlidXRlcyxcclxuXHRcdFx0XHRcdHJlZ2V4ID0gbmV3IFhSZWdFeHAoJyg/PG5hbWU+IFtcXFxcdzpcXFxcLVxcXFwuXSspJyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0J1xcXFxzKj1cXFxccyonICtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQnKD88dmFsdWU+IFwiLio/XCJ8XFwnLio/XFwnfFxcXFx3KyknLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCd4ZycpO1xyXG5cclxuXHRcdFx0XHR3aGlsZSAoKGF0dHJpYnV0ZXMgPSByZWdleC5leGVjKGNvZGUpKSAhPSBudWxsKSBcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgY29uc3RydWN0b3IoYXR0cmlidXRlcy5uYW1lLCBtYXRjaC5pbmRleCArIGF0dHJpYnV0ZXMuaW5kZXgsICdjb2xvcjEnKSk7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgY29uc3RydWN0b3IoYXR0cmlidXRlcy52YWx1ZSwgbWF0Y2guaW5kZXggKyBhdHRyaWJ1dGVzLmluZGV4ICsgYXR0cmlidXRlc1swXS5pbmRleE9mKGF0dHJpYnV0ZXMudmFsdWUpLCAnc3RyaW5nJykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHRhZyAhPSBudWxsKVxyXG5cdFx0XHRcdHJlc3VsdC5wdXNoKFxyXG5cdFx0XHRcdFx0bmV3IGNvbnN0cnVjdG9yKHRhZy5uYW1lLCBtYXRjaC5pbmRleCArIHRhZ1swXS5pbmRleE9mKHRhZy5uYW1lKSwgJ2tleXdvcmQnKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIga2V5d29yZHMgPVx0J2JyZWFrIGNhc2UgY2F0Y2ggY29udGludWUgJyArXHJcblx0XHRcdFx0XHRcdCdkZWZhdWx0IGRlbGV0ZSBkbyBlbHNlIGZhbHNlICAnICtcclxuXHRcdFx0XHRcdFx0J2ZvciBmdW5jdGlvbiBpZiBpbiBpbnN0YW5jZW9mICcgK1xyXG5cdFx0XHRcdFx0XHQnbmV3IG51bGwgcmV0dXJuIHN1cGVyIHN3aXRjaCAnICtcclxuXHRcdFx0XHRcdFx0J3RoaXMgdGhyb3cgdHJ1ZSB0cnkgdHlwZW9mIHZhciB3aGlsZSB3aXRoJ1xyXG5cdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0dmFyIHIgPSBTeW50YXhIaWdobGlnaHRlci5yZWdleExpYjtcclxuXHRcclxuXHRcdHRoaXMucmVnZXhMaXN0ID0gW1xyXG5cdFx0XHR7IHJlZ2V4OiByLm11bHRpTGluZURvdWJsZVF1b3RlZFN0cmluZyxcdFx0XHRcdFx0Y3NzOiAnc3RyaW5nJyB9LFx0XHRcdC8vIGRvdWJsZSBxdW90ZWQgc3RyaW5nc1xyXG5cdFx0XHR7IHJlZ2V4OiByLm11bHRpTGluZVNpbmdsZVF1b3RlZFN0cmluZyxcdFx0XHRcdFx0Y3NzOiAnc3RyaW5nJyB9LFx0XHRcdC8vIHNpbmdsZSBxdW90ZWQgc3RyaW5nc1xyXG5cdFx0XHR7IHJlZ2V4OiByLnNpbmdsZUxpbmVDQ29tbWVudHMsXHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdFx0XHQvLyBvbmUgbGluZSBjb21tZW50c1xyXG5cdFx0XHR7IHJlZ2V4OiByLm11bHRpTGluZUNDb21tZW50cyxcdFx0XHRcdFx0XHRcdGNzczogJ2NvbW1lbnRzJyB9LFx0XHRcdC8vIG11bHRpbGluZSBjb21tZW50c1xyXG5cdFx0XHR7IHJlZ2V4OiAvXFxzKiMuKi9nbSxcdFx0XHRcdFx0XHRcdFx0XHRjc3M6ICdwcmVwcm9jZXNzb3InIH0sXHRcdC8vIHByZXByb2Nlc3NvciB0YWdzIGxpa2UgI3JlZ2lvbiBhbmQgI2VuZHJlZ2lvblxyXG5cdFx0XHR7IHJlZ2V4OiBuZXcgUmVnRXhwKHRoaXMuZ2V0S2V5d29yZHMoa2V5d29yZHMpLCAnZ20nKSxcdGNzczogJ2tleXdvcmQnIH0sXHJcblx0XHRcdFxyXG5cdFx0XHR7IHJlZ2V4OiBuZXcgWFJlZ0V4cCgnKFxcXFwmbHQ7fDwpXFxcXCFcXFxcW1tcXFxcd1xcXFxzXSo/XFxcXFsoLnxcXFxccykqP1xcXFxdXFxcXF0oXFxcXCZndDt8PiknLCAnZ20nKSxcdFx0XHRjc3M6ICdjb2xvcjInIH0sXHQvLyA8IVsgLi4uIFsgLi4uIF1dPlxyXG5cdFx0XHR7IHJlZ2V4OiBTeW50YXhIaWdobGlnaHRlci5yZWdleExpYi54bWxDb21tZW50cyxcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdC8vIDwhLS0gLi4uIC0tPlxyXG5cdFx0XHR7IHJlZ2V4OiBuZXcgWFJlZ0V4cCgnKCZsdDt8PClbXFxcXHNcXFxcL1xcXFw/XSooXFxcXHcrKSg/PGF0dHJpYnV0ZXM+Lio/KVtcXFxcc1xcXFwvXFxcXD9dKigmZ3Q7fD4pJywgJ3NnJyksIGZ1bmM6IHByb2Nlc3MgfVxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0dGhpcy5mb3JIdG1sU2NyaXB0KHIuc2NyaXB0U2NyaXB0VGFncyk7XHJcblx0fTtcclxuXHJcblx0QnJ1c2gucHJvdG90eXBlXHQ9IG5ldyBTeW50YXhIaWdobGlnaHRlci5IaWdobGlnaHRlcigpO1xyXG5cdEJydXNoLmFsaWFzZXNcdD0gWydqc3gnXTtcclxuXHJcblx0U3ludGF4SGlnaGxpZ2h0ZXIuYnJ1c2hlcy5KU1ggPSBCcnVzaDtcclxuXHJcblx0Ly8gQ29tbW9uSlNcclxuXHR0eXBlb2YoZXhwb3J0cykgIT0gJ3VuZGVmaW5lZCcgPyBleHBvcnRzLkJydXNoID0gQnJ1c2ggOiBudWxsO1xyXG59KSgpO1xyXG4iLCIvKmpzaGludCBsYXhicmVhazogdHJ1ZSAqL1xuXG52YXIgY29kZVBhdHRlcm4gPSAvPHRkIGNsYXNzPVwiY29kZVwiLio/PFxcL3RkPi9cbiAgLCBhbGxTY3JpcHRUYWdzID0gW1xuICAgICAgXG4gICAgICAgIC8vIDxzY3JpcHQ+IC4uLiA8L3NjcmlwdD5cbiAgICAgICAgeyBvcGVuOiAvPHNjcmlwdFtePl0qPi8sIGNsb3NlOiAvPFxcL3NjcmlwdFtePl0qPi8sIGFsaWFzOiAnanMnIH1cblxuICAgICAgICAvLyA8PyAuLi4gPz5cbiAgICAgICwgeyBvcGVuOiAvXlxccyo8XFw/XFxzKiQvLCBjbG9zZTogL15cXHMqXFw/PlxccyokLywgIGFsaWFzOiAncGhwJyB9XG5cbiAgICAgICAgLy8gPCFbQ0RBVEFbIC4uLiBdXSAgICAgLS0gKGlubGluZSBhY3Rpb25zY3JpcHQpIG9ubHkgdXNlZCBmb3IgeGh0bWxcbiAgICAgICwgeyBvcGVuOiAvXlxccyo/PCFcXFtDREFUQVxcW1xccyo/JC8sIGNsb3NlOiAvXlxccyo/XFxdXFxdPlxccyo/JC8sIGFsaWFzOiAnYXMzJywgYXBwbHlUbzogJ3hodG1sJyB9XG4gICAgXTtcblxuZnVuY3Rpb24gZmluZFNjcmlwdHMobGluZXMsIHNwZWNpZmllZEFsaWFzKSB7XG4gIHZhciBzY3JpcHRzID0gW11cbiAgICAsIGluU2NyaXB0ID0gZmFsc2VcbiAgICAsIGN1cnJlbnRTY3JpcHRcbiAgICAsIHNjcmlwdFRhZ3MgPSBhbGxTY3JpcHRUYWdzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgIC8vIEUuZy4sIGluIGNhc2Ugb2YgIVtDREFUQSBtYWtlIHN1cmUgd2Ugb25seSBoaWdobGlnaHQgaWYgdXNlciBzcGVjaWZpZWQgeGh0bWxcbiAgICAgICAgICByZXR1cm4gIXRhZy5hcHBseVRvIHx8IHRhZy5hcHBseVRvID09PSBzcGVjaWZpZWRBbGlhcztcbiAgICAgICAgfSk7XG5cbiAgZm9yICh2YXIgbGluZU51bSAgPSAwOyBsaW5lTnVtIDwgbGluZXMubGVuZ3RoOyBsaW5lTnVtKyspIHtcbiAgICB2YXIgbGluZSA9IGxpbmVzW2xpbmVOdW1dO1xuXG4gICAgaWYgKCFpblNjcmlwdCkge1xuICAgICAgdmFyIG1hdGNoaW5nVGFnID0gbnVsbDtcblxuICAgICAgZm9yICh2YXIgdGFnSW5kZXggPSAwOyB0YWdJbmRleCA8IHNjcmlwdFRhZ3MubGVuZ3RoOyB0YWdJbmRleCsrKSB7XG4gICAgICAgIHZhciB0YWcgPSBzY3JpcHRUYWdzW3RhZ0luZGV4XTtcblxuICAgICAgICBpZiAobGluZS5tYXRjaCh0YWcub3BlbikpIHsgXG4gICAgICAgICAgbWF0Y2hpbmdUYWcgPSB0YWc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1hdGNoaW5nVGFnKSB7XG4gICAgICAgIGluU2NyaXB0ID0gdHJ1ZTtcbiAgICAgICAgY3VycmVudFNjcmlwdCA9IHsgZnJvbTogbGluZU51bSArIDEsIGNvZGU6ICcnLCB0YWc6IG1hdGNoaW5nVGFnIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChsaW5lLm1hdGNoKGN1cnJlbnRTY3JpcHQudGFnLmNsb3NlKSkge1xuICAgICAgaW5TY3JpcHQgPSBmYWxzZTtcbiAgICAgIGN1cnJlbnRTY3JpcHQudG8gPSBsaW5lTnVtIC0gMTtcbiAgICAgIHNjcmlwdHMucHVzaChjdXJyZW50U2NyaXB0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGN1cnJlbnRTY3JpcHQuY29kZSArPSBsaW5lICsgJ1xcbic7XG4gIH1cblxuICByZXR1cm4gc2NyaXB0cztcbn1cblxuZnVuY3Rpb24gZXh0cmFjdExpbmVzKGh0bWwpIHtcbiAgdmFyIGNvZGUgPSBodG1sLm1hdGNoKGNvZGVQYXR0ZXJuKVswXVxuICAgICwgbGluZXMgPSBjb2RlLm1hdGNoKC88ZGl2ICtjbGFzcz1cImxpbmUgLis/PFxcL2Rpdj4vbWcpO1xuXG4gIHJldHVybiBsaW5lcy5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVBsYWluTGluZXMoZnJvbUluZGV4LCB0b0luZGV4LCBodG1sLCByZXBsYWNlbWVudCkge1xuICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChcbiAgICAgICAgICAnPGRpdiArY2xhc3M9XCJbXlwiXSs/aW5kZXgnICsgZnJvbUluZGV4ICsgJ1teXCJdKlwiJyAgLy8gb3BlbmluZyB0YWcgb2Ygc3RhcnRcbiAgICAgICAgKyAnLisnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzY3JpcHQgaHRtbFxuICAgICAgICArICc8ZGl2ICtjbGFzcz1cIlteXCJdKz9pbmRleCcgKyB0b0luZGV4ICsgJ1teXCJdKlwiJyAgICAvLyBvcGVuaW5nIHRhZyBvZiBlbmRcbiAgICAgICAgKyAnLis/PC9kaXY+JyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjbG9zaW5nIHRhZyBvZiBlbmRcbiAgICAgIClcbiAgICAsIGNvZGUgICAgICAgICAgICAgICAgPSAgaHRtbC5tYXRjaChjb2RlUGF0dGVybilbMF1cbiAgICAsIGNvZGVXaXRoUmVwbGFjZW1lbnQgPSAgY29kZS5yZXBsYWNlKHJlZ2V4cCwgcmVwbGFjZW1lbnQpO1xuXG4gIHJldHVybiBodG1sLnJlcGxhY2UoY29kZSwgY29kZVdpdGhSZXBsYWNlbWVudCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZmluZFNjcmlwdHMgICAgICAgOiAgZmluZFNjcmlwdHNcbiAgLCBleHRyYWN0TGluZXMgICAgICA6ICBleHRyYWN0TGluZXNcbiAgLCByZXBsYWNlUGxhaW5MaW5lcyA6ICByZXBsYWNlUGxhaW5MaW5lc1xufTtcbiIsIi8vIFhSZWdFeHAgMS41LjFcbi8vIChjKSAyMDA3LTIwMTIgU3RldmVuIExldml0aGFuXG4vLyBNSVQgTGljZW5zZVxuLy8gPGh0dHA6Ly94cmVnZXhwLmNvbT5cbi8vIFByb3ZpZGVzIGFuIGF1Z21lbnRlZCwgZXh0ZW5zaWJsZSwgY3Jvc3MtYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiByZWd1bGFyIGV4cHJlc3Npb25zLFxuLy8gaW5jbHVkaW5nIHN1cHBvcnQgZm9yIGFkZGl0aW9uYWwgc3ludGF4LCBmbGFncywgYW5kIG1ldGhvZHNcblxudmFyIFhSZWdFeHA7XG5cbmlmIChYUmVnRXhwKSB7XG4gICAgLy8gQXZvaWQgcnVubmluZyB0d2ljZSwgc2luY2UgdGhhdCB3b3VsZCBicmVhayByZWZlcmVuY2VzIHRvIG5hdGl2ZSBnbG9iYWxzXG4gICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBsb2FkIFhSZWdFeHAgdHdpY2UgaW4gdGhlIHNhbWUgZnJhbWVcIik7XG59XG5cbi8vIFJ1biB3aXRoaW4gYW4gYW5vbnltb3VzIGZ1bmN0aW9uIHRvIHByb3RlY3QgdmFyaWFibGVzIGFuZCBhdm9pZCBuZXcgZ2xvYmFsc1xuKGZ1bmN0aW9uICh1bmRlZmluZWQpIHtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIENvbnN0cnVjdG9yXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEFjY2VwdHMgYSBwYXR0ZXJuIGFuZCBmbGFnczsgcmV0dXJucyBhIG5ldywgZXh0ZW5kZWQgYFJlZ0V4cGAgb2JqZWN0LiBEaWZmZXJzIGZyb20gYSBuYXRpdmVcbiAgICAvLyByZWd1bGFyIGV4cHJlc3Npb24gaW4gdGhhdCBhZGRpdGlvbmFsIHN5bnRheCBhbmQgZmxhZ3MgYXJlIHN1cHBvcnRlZCBhbmQgY3Jvc3MtYnJvd3NlclxuICAgIC8vIHN5bnRheCBpbmNvbnNpc3RlbmNpZXMgYXJlIGFtZWxpb3JhdGVkLiBgWFJlZ0V4cCgvcmVnZXgvKWAgY2xvbmVzIGFuIGV4aXN0aW5nIHJlZ2V4IGFuZFxuICAgIC8vIGNvbnZlcnRzIHRvIHR5cGUgWFJlZ0V4cFxuICAgIFhSZWdFeHAgPSBmdW5jdGlvbiAocGF0dGVybiwgZmxhZ3MpIHtcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdLFxuICAgICAgICAgICAgY3VyclNjb3BlID0gWFJlZ0V4cC5PVVRTSURFX0NMQVNTLFxuICAgICAgICAgICAgcG9zID0gMCxcbiAgICAgICAgICAgIGNvbnRleHQsIHRva2VuUmVzdWx0LCBtYXRjaCwgY2hyLCByZWdleDtcblxuICAgICAgICBpZiAoWFJlZ0V4cC5pc1JlZ0V4cChwYXR0ZXJuKSkge1xuICAgICAgICAgICAgaWYgKGZsYWdzICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiY2FuJ3Qgc3VwcGx5IGZsYWdzIHdoZW4gY29uc3RydWN0aW5nIG9uZSBSZWdFeHAgZnJvbSBhbm90aGVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGNsb25lKHBhdHRlcm4pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRva2VucyBiZWNvbWUgcGFydCBvZiB0aGUgcmVnZXggY29uc3RydWN0aW9uIHByb2Nlc3MsIHNvIHByb3RlY3QgYWdhaW5zdCBpbmZpbml0ZVxuICAgICAgICAvLyByZWN1cnNpb24gd2hlbiBhbiBYUmVnRXhwIGlzIGNvbnN0cnVjdGVkIHdpdGhpbiBhIHRva2VuIGhhbmRsZXIgb3IgdHJpZ2dlclxuICAgICAgICBpZiAoaXNJbnNpZGVDb25zdHJ1Y3RvcilcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiY2FuJ3QgY2FsbCB0aGUgWFJlZ0V4cCBjb25zdHJ1Y3RvciB3aXRoaW4gdG9rZW4gZGVmaW5pdGlvbiBmdW5jdGlvbnNcIik7XG5cbiAgICAgICAgZmxhZ3MgPSBmbGFncyB8fCBcIlwiO1xuICAgICAgICBjb250ZXh0ID0geyAvLyBgdGhpc2Agb2JqZWN0IGZvciBjdXN0b20gdG9rZW5zXG4gICAgICAgICAgICBoYXNOYW1lZENhcHR1cmU6IGZhbHNlLFxuICAgICAgICAgICAgY2FwdHVyZU5hbWVzOiBbXSxcbiAgICAgICAgICAgIGhhc0ZsYWc6IGZ1bmN0aW9uIChmbGFnKSB7cmV0dXJuIGZsYWdzLmluZGV4T2YoZmxhZykgPiAtMTt9LFxuICAgICAgICAgICAgc2V0RmxhZzogZnVuY3Rpb24gKGZsYWcpIHtmbGFncyArPSBmbGFnO31cbiAgICAgICAgfTtcblxuICAgICAgICB3aGlsZSAocG9zIDwgcGF0dGVybi5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBjdXN0b20gdG9rZW5zIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgICAgICB0b2tlblJlc3VsdCA9IHJ1blRva2VucyhwYXR0ZXJuLCBwb3MsIGN1cnJTY29wZSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgIGlmICh0b2tlblJlc3VsdCkge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHRva2VuUmVzdWx0Lm91dHB1dCk7XG4gICAgICAgICAgICAgICAgcG9zICs9ICh0b2tlblJlc3VsdC5tYXRjaFswXS5sZW5ndGggfHwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBuYXRpdmUgbXVsdGljaGFyYWN0ZXIgbWV0YXNlcXVlbmNlcyAoZXhjbHVkaW5nIGNoYXJhY3RlciBjbGFzc2VzKSBhdFxuICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoID0gbmF0aXYuZXhlYy5jYWxsKG5hdGl2ZVRva2Vuc1tjdXJyU2NvcGVdLCBwYXR0ZXJuLnNsaWNlKHBvcykpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKG1hdGNoWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjaHIgPSBwYXR0ZXJuLmNoYXJBdChwb3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hyID09PSBcIltcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJTY29wZSA9IFhSZWdFeHAuSU5TSURFX0NMQVNTO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjaHIgPT09IFwiXVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyclNjb3BlID0gWFJlZ0V4cC5PVVRTSURFX0NMQVNTO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHBvc2l0aW9uIG9uZSBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goY2hyKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVnZXggPSBSZWdFeHAob3V0cHV0LmpvaW4oXCJcIiksIG5hdGl2LnJlcGxhY2UuY2FsbChmbGFncywgZmxhZ0NsaXAsIFwiXCIpKTtcbiAgICAgICAgcmVnZXguX3hyZWdleHAgPSB7XG4gICAgICAgICAgICBzb3VyY2U6IHBhdHRlcm4sXG4gICAgICAgICAgICBjYXB0dXJlTmFtZXM6IGNvbnRleHQuaGFzTmFtZWRDYXB0dXJlID8gY29udGV4dC5jYXB0dXJlTmFtZXMgOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZWdleDtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQdWJsaWMgcHJvcGVydGllc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBYUmVnRXhwLnZlcnNpb24gPSBcIjEuNS4xXCI7XG5cbiAgICAvLyBUb2tlbiBzY29wZSBiaXRmbGFnc1xuICAgIFhSZWdFeHAuSU5TSURFX0NMQVNTID0gMTtcbiAgICBYUmVnRXhwLk9VVFNJREVfQ0xBU1MgPSAyO1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQcml2YXRlIHZhcmlhYmxlc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICB2YXIgcmVwbGFjZW1lbnRUb2tlbiA9IC9cXCQoPzooXFxkXFxkP3xbJCZgJ10pfHsoWyRcXHddKyl9KS9nLFxuICAgICAgICBmbGFnQ2xpcCA9IC9bXmdpbXldK3woW1xcc1xcU10pKD89W1xcc1xcU10qXFwxKS9nLCAvLyBOb25uYXRpdmUgYW5kIGR1cGxpY2F0ZSBmbGFnc1xuICAgICAgICBxdWFudGlmaWVyID0gL14oPzpbPyorXXx7XFxkKyg/OixcXGQqKT99KVxcPz8vLFxuICAgICAgICBpc0luc2lkZUNvbnN0cnVjdG9yID0gZmFsc2UsXG4gICAgICAgIHRva2VucyA9IFtdLFxuICAgICAgICAvLyBDb3B5IG5hdGl2ZSBnbG9iYWxzIGZvciByZWZlcmVuY2UgKFwibmF0aXZlXCIgaXMgYW4gRVMzIHJlc2VydmVkIGtleXdvcmQpXG4gICAgICAgIG5hdGl2ID0ge1xuICAgICAgICAgICAgZXhlYzogUmVnRXhwLnByb3RvdHlwZS5leGVjLFxuICAgICAgICAgICAgdGVzdDogUmVnRXhwLnByb3RvdHlwZS50ZXN0LFxuICAgICAgICAgICAgbWF0Y2g6IFN0cmluZy5wcm90b3R5cGUubWF0Y2gsXG4gICAgICAgICAgICByZXBsYWNlOiBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UsXG4gICAgICAgICAgICBzcGxpdDogU3RyaW5nLnByb3RvdHlwZS5zcGxpdFxuICAgICAgICB9LFxuICAgICAgICBjb21wbGlhbnRFeGVjTnBjZyA9IG5hdGl2LmV4ZWMuY2FsbCgvKCk/Py8sIFwiXCIpWzFdID09PSB1bmRlZmluZWQsIC8vIGNoZWNrIGBleGVjYCBoYW5kbGluZyBvZiBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cHNcbiAgICAgICAgY29tcGxpYW50TGFzdEluZGV4SW5jcmVtZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHggPSAvXi9nO1xuICAgICAgICAgICAgbmF0aXYudGVzdC5jYWxsKHgsIFwiXCIpO1xuICAgICAgICAgICAgcmV0dXJuICF4Lmxhc3RJbmRleDtcbiAgICAgICAgfSgpLFxuICAgICAgICBoYXNOYXRpdmVZID0gUmVnRXhwLnByb3RvdHlwZS5zdGlja3kgIT09IHVuZGVmaW5lZCxcbiAgICAgICAgbmF0aXZlVG9rZW5zID0ge307XG5cbiAgICAvLyBgbmF0aXZlVG9rZW5zYCBtYXRjaCBuYXRpdmUgbXVsdGljaGFyYWN0ZXIgbWV0YXNlcXVlbmNlcyBvbmx5IChpbmNsdWRpbmcgZGVwcmVjYXRlZCBvY3RhbHMsXG4gICAgLy8gZXhjbHVkaW5nIGNoYXJhY3RlciBjbGFzc2VzKVxuICAgIG5hdGl2ZVRva2Vuc1tYUmVnRXhwLklOU0lERV9DTEFTU10gPSAvXig/OlxcXFwoPzpbMC0zXVswLTddezAsMn18WzQtN11bMC03XT98eFtcXGRBLUZhLWZdezJ9fHVbXFxkQS1GYS1mXXs0fXxjW0EtWmEtel18W1xcc1xcU10pKS87XG4gICAgbmF0aXZlVG9rZW5zW1hSZWdFeHAuT1VUU0lERV9DTEFTU10gPSAvXig/OlxcXFwoPzowKD86WzAtM11bMC03XXswLDJ9fFs0LTddWzAtN10/KT98WzEtOV1cXGQqfHhbXFxkQS1GYS1mXXsyfXx1W1xcZEEtRmEtZl17NH18Y1tBLVphLXpdfFtcXHNcXFNdKXxcXChcXD9bOj0hXXxbPyorXVxcP3x7XFxkKyg/OixcXGQqKT99XFw/PykvO1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQdWJsaWMgbWV0aG9kc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBMZXRzIHlvdSBleHRlbmQgb3IgY2hhbmdlIFhSZWdFeHAgc3ludGF4IGFuZCBjcmVhdGUgY3VzdG9tIGZsYWdzLiBUaGlzIGlzIHVzZWQgaW50ZXJuYWxseSBieVxuICAgIC8vIHRoZSBYUmVnRXhwIGxpYnJhcnkgYW5kIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBYUmVnRXhwIHBsdWdpbnMuIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgZm9yXG4gICAgLy8gdXNlcnMgd2l0aCBhZHZhbmNlZCBrbm93bGVkZ2Ugb2YgSmF2YVNjcmlwdCdzIHJlZ3VsYXIgZXhwcmVzc2lvbiBzeW50YXggYW5kIGJlaGF2aW9yLiBJdCBjYW5cbiAgICAvLyBiZSBkaXNhYmxlZCBieSBgWFJlZ0V4cC5mcmVlemVUb2tlbnNgXG4gICAgWFJlZ0V4cC5hZGRUb2tlbiA9IGZ1bmN0aW9uIChyZWdleCwgaGFuZGxlciwgc2NvcGUsIHRyaWdnZXIpIHtcbiAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgcGF0dGVybjogY2xvbmUocmVnZXgsIFwiZ1wiICsgKGhhc05hdGl2ZVkgPyBcInlcIiA6IFwiXCIpKSxcbiAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICBzY29wZTogc2NvcGUgfHwgWFJlZ0V4cC5PVVRTSURFX0NMQVNTLFxuICAgICAgICAgICAgdHJpZ2dlcjogdHJpZ2dlciB8fCBudWxsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgcGF0dGVybiBhbmQgZmxhZ3M7IHJldHVybnMgYW4gZXh0ZW5kZWQgYFJlZ0V4cGAgb2JqZWN0LiBJZiB0aGUgcGF0dGVybiBhbmQgZmxhZ1xuICAgIC8vIGNvbWJpbmF0aW9uIGhhcyBwcmV2aW91c2x5IGJlZW4gY2FjaGVkLCB0aGUgY2FjaGVkIGNvcHkgaXMgcmV0dXJuZWQ7IG90aGVyd2lzZSB0aGUgbmV3bHlcbiAgICAvLyBjcmVhdGVkIHJlZ2V4IGlzIGNhY2hlZFxuICAgIFhSZWdFeHAuY2FjaGUgPSBmdW5jdGlvbiAocGF0dGVybiwgZmxhZ3MpIHtcbiAgICAgICAgdmFyIGtleSA9IHBhdHRlcm4gKyBcIi9cIiArIChmbGFncyB8fCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIFhSZWdFeHAuY2FjaGVba2V5XSB8fCAoWFJlZ0V4cC5jYWNoZVtrZXldID0gWFJlZ0V4cChwYXR0ZXJuLCBmbGFncykpO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgYFJlZ0V4cGAgaW5zdGFuY2U7IHJldHVybnMgYSBjb3B5IHdpdGggdGhlIGAvZ2AgZmxhZyBzZXQuIFRoZSBjb3B5IGhhcyBhIGZyZXNoXG4gICAgLy8gYGxhc3RJbmRleGAgKHNldCB0byB6ZXJvKS4gSWYgeW91IHdhbnQgdG8gY29weSBhIHJlZ2V4IHdpdGhvdXQgZm9yY2luZyB0aGUgYGdsb2JhbGBcbiAgICAvLyBwcm9wZXJ0eSwgdXNlIGBYUmVnRXhwKHJlZ2V4KWAuIERvIG5vdCB1c2UgYFJlZ0V4cChyZWdleClgIGJlY2F1c2UgaXQgd2lsbCBub3QgcHJlc2VydmVcbiAgICAvLyBzcGVjaWFsIHByb3BlcnRpZXMgcmVxdWlyZWQgZm9yIG5hbWVkIGNhcHR1cmVcbiAgICBYUmVnRXhwLmNvcHlBc0dsb2JhbCA9IGZ1bmN0aW9uIChyZWdleCkge1xuICAgICAgICByZXR1cm4gY2xvbmUocmVnZXgsIFwiZ1wiKTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHN0cmluZzsgcmV0dXJucyB0aGUgc3RyaW5nIHdpdGggcmVnZXggbWV0YWNoYXJhY3RlcnMgZXNjYXBlZC4gVGhlIHJldHVybmVkIHN0cmluZ1xuICAgIC8vIGNhbiBzYWZlbHkgYmUgdXNlZCBhdCBhbnkgcG9pbnQgd2l0aGluIGEgcmVnZXggdG8gbWF0Y2ggdGhlIHByb3ZpZGVkIGxpdGVyYWwgc3RyaW5nLiBFc2NhcGVkXG4gICAgLy8gY2hhcmFjdGVycyBhcmUgWyBdIHsgfSAoICkgKiArID8gLSAuICwgXFwgXiAkIHwgIyBhbmQgd2hpdGVzcGFjZVxuICAgIFhSZWdFeHAuZXNjYXBlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1stW1xcXXt9KCkqKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHN0cmluZyB0byBzZWFyY2gsIHJlZ2V4IHRvIHNlYXJjaCB3aXRoLCBwb3NpdGlvbiB0byBzdGFydCB0aGUgc2VhcmNoIHdpdGhpbiB0aGVcbiAgICAvLyBzdHJpbmcgKGRlZmF1bHQ6IDApLCBhbmQgYW4gb3B0aW9uYWwgQm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgbWF0Y2hlcyBtdXN0IHN0YXJ0IGF0LW9yLVxuICAgIC8vIGFmdGVyIHRoZSBwb3NpdGlvbiBvciBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIG9ubHkuIFRoaXMgZnVuY3Rpb24gaWdub3JlcyB0aGUgYGxhc3RJbmRleGBcbiAgICAvLyBvZiB0aGUgcHJvdmlkZWQgcmVnZXggaW4gaXRzIG93biBoYW5kbGluZywgYnV0IHVwZGF0ZXMgdGhlIHByb3BlcnR5IGZvciBjb21wYXRpYmlsaXR5XG4gICAgWFJlZ0V4cC5leGVjQXQgPSBmdW5jdGlvbiAoc3RyLCByZWdleCwgcG9zLCBhbmNob3JlZCkge1xuICAgICAgICB2YXIgcjIgPSBjbG9uZShyZWdleCwgXCJnXCIgKyAoKGFuY2hvcmVkICYmIGhhc05hdGl2ZVkpID8gXCJ5XCIgOiBcIlwiKSksXG4gICAgICAgICAgICBtYXRjaDtcbiAgICAgICAgcjIubGFzdEluZGV4ID0gcG9zID0gcG9zIHx8IDA7XG4gICAgICAgIG1hdGNoID0gcjIuZXhlYyhzdHIpOyAvLyBSdW4gdGhlIGFsdGVyZWQgYGV4ZWNgIChyZXF1aXJlZCBmb3IgYGxhc3RJbmRleGAgZml4LCBldGMuKVxuICAgICAgICBpZiAoYW5jaG9yZWQgJiYgbWF0Y2ggJiYgbWF0Y2guaW5kZXggIT09IHBvcylcbiAgICAgICAgICAgIG1hdGNoID0gbnVsbDtcbiAgICAgICAgaWYgKHJlZ2V4Lmdsb2JhbClcbiAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IG1hdGNoID8gcjIubGFzdEluZGV4IDogMDtcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH07XG5cbiAgICAvLyBCcmVha3MgdGhlIHVucmVzdG9yYWJsZSBsaW5rIHRvIFhSZWdFeHAncyBwcml2YXRlIGxpc3Qgb2YgdG9rZW5zLCB0aGVyZWJ5IHByZXZlbnRpbmdcbiAgICAvLyBzeW50YXggYW5kIGZsYWcgY2hhbmdlcy4gU2hvdWxkIGJlIHJ1biBhZnRlciBYUmVnRXhwIGFuZCBhbnkgcGx1Z2lucyBhcmUgbG9hZGVkXG4gICAgWFJlZ0V4cC5mcmVlemVUb2tlbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFhSZWdFeHAuYWRkVG9rZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImNhbid0IHJ1biBhZGRUb2tlbiBhZnRlciBmcmVlemVUb2tlbnNcIik7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYW55IHZhbHVlOyByZXR1cm5zIGEgQm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEgYFJlZ0V4cGAgb2JqZWN0LlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGlzIGFsc28gYHRydWVgIGZvciByZWdleCBsaXRlcmFscyBhbmQgcmVnZXhlcyBjcmVhdGVkIGJ5IHRoZSBgWFJlZ0V4cGBcbiAgICAvLyBjb25zdHJ1Y3Rvci4gVGhpcyB3b3JrcyBjb3JyZWN0bHkgZm9yIHZhcmlhYmxlcyBjcmVhdGVkIGluIGFub3RoZXIgZnJhbWUsIHdoZW4gYGluc3RhbmNlb2ZgXG4gICAgLy8gYW5kIGBjb25zdHJ1Y3RvcmAgY2hlY2tzIHdvdWxkIGZhaWwgdG8gd29yayBhcyBpbnRlbmRlZFxuICAgIFhSZWdFeHAuaXNSZWdFeHAgPSBmdW5jdGlvbiAobykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pID09PSBcIltvYmplY3QgUmVnRXhwXVwiO1xuICAgIH07XG5cbiAgICAvLyBFeGVjdXRlcyBgY2FsbGJhY2tgIG9uY2UgcGVyIG1hdGNoIHdpdGhpbiBgc3RyYC4gUHJvdmlkZXMgYSBzaW1wbGVyIGFuZCBjbGVhbmVyIHdheSB0b1xuICAgIC8vIGl0ZXJhdGUgb3ZlciByZWdleCBtYXRjaGVzIGNvbXBhcmVkIHRvIHRoZSB0cmFkaXRpb25hbCBhcHByb2FjaGVzIG9mIHN1YnZlcnRpbmdcbiAgICAvLyBgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlYCBvciByZXBlYXRlZGx5IGNhbGxpbmcgYGV4ZWNgIHdpdGhpbiBhIGB3aGlsZWAgbG9vcFxuICAgIFhSZWdFeHAuaXRlcmF0ZSA9IGZ1bmN0aW9uIChzdHIsIHJlZ2V4LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICB2YXIgcjIgPSBjbG9uZShyZWdleCwgXCJnXCIpLFxuICAgICAgICAgICAgaSA9IC0xLCBtYXRjaDtcbiAgICAgICAgd2hpbGUgKG1hdGNoID0gcjIuZXhlYyhzdHIpKSB7IC8vIFJ1biB0aGUgYWx0ZXJlZCBgZXhlY2AgKHJlcXVpcmVkIGZvciBgbGFzdEluZGV4YCBmaXgsIGV0Yy4pXG4gICAgICAgICAgICBpZiAocmVnZXguZ2xvYmFsKVxuICAgICAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IHIyLmxhc3RJbmRleDsgLy8gRG9pbmcgdGhpcyB0byBmb2xsb3cgZXhwZWN0YXRpb25zIGlmIGBsYXN0SW5kZXhgIGlzIGNoZWNrZWQgd2l0aGluIGBjYWxsYmFja2BcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgbWF0Y2gsICsraSwgc3RyLCByZWdleCk7XG4gICAgICAgICAgICBpZiAocjIubGFzdEluZGV4ID09PSBtYXRjaC5pbmRleClcbiAgICAgICAgICAgICAgICByMi5sYXN0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVnZXguZ2xvYmFsKVxuICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHN0cmluZyBhbmQgYW4gYXJyYXkgb2YgcmVnZXhlczsgcmV0dXJucyB0aGUgcmVzdWx0IG9mIHVzaW5nIGVhY2ggc3VjY2Vzc2l2ZSByZWdleFxuICAgIC8vIHRvIHNlYXJjaCB3aXRoaW4gdGhlIG1hdGNoZXMgb2YgdGhlIHByZXZpb3VzIHJlZ2V4LiBUaGUgYXJyYXkgb2YgcmVnZXhlcyBjYW4gYWxzbyBjb250YWluXG4gICAgLy8gb2JqZWN0cyB3aXRoIGByZWdleGAgYW5kIGBiYWNrcmVmYCBwcm9wZXJ0aWVzLCBpbiB3aGljaCBjYXNlIHRoZSBuYW1lZCBvciBudW1iZXJlZCBiYWNrLVxuICAgIC8vIHJlZmVyZW5jZXMgc3BlY2lmaWVkIGFyZSBwYXNzZWQgZm9yd2FyZCB0byB0aGUgbmV4dCByZWdleCBvciByZXR1cm5lZC4gRS5nLjpcbiAgICAvLyB2YXIgeHJlZ2V4cEltZ0ZpbGVOYW1lcyA9IFhSZWdFeHAubWF0Y2hDaGFpbihodG1sLCBbXG4gICAgLy8gICAgIHtyZWdleDogLzxpbWdcXGIoW14+XSspPi9pLCBiYWNrcmVmOiAxfSwgLy8gPGltZz4gdGFnIGF0dHJpYnV0ZXNcbiAgICAvLyAgICAge3JlZ2V4OiBYUmVnRXhwKCcoP2l4KSBcXFxccyBzcmM9XCIgKD88c3JjPiBbXlwiXSsgKScpLCBiYWNrcmVmOiBcInNyY1wifSwgLy8gc3JjIGF0dHJpYnV0ZSB2YWx1ZXNcbiAgICAvLyAgICAge3JlZ2V4OiBYUmVnRXhwKFwiXmh0dHA6Ly94cmVnZXhwXFxcXC5jb20oL1teIz9dKylcIiwgXCJpXCIpLCBiYWNrcmVmOiAxfSwgLy8geHJlZ2V4cC5jb20gcGF0aHNcbiAgICAvLyAgICAgL1teXFwvXSskLyAvLyBmaWxlbmFtZXMgKHN0cmlwIGRpcmVjdG9yeSBwYXRocylcbiAgICAvLyBdKTtcbiAgICBYUmVnRXhwLm1hdGNoQ2hhaW4gPSBmdW5jdGlvbiAoc3RyLCBjaGFpbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcmVjdXJzZUNoYWluICh2YWx1ZXMsIGxldmVsKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGNoYWluW2xldmVsXS5yZWdleCA/IGNoYWluW2xldmVsXSA6IHtyZWdleDogY2hhaW5bbGV2ZWxdfSxcbiAgICAgICAgICAgICAgICByZWdleCA9IGNsb25lKGl0ZW0ucmVnZXgsIFwiZ1wiKSxcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gW10sIGk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgWFJlZ0V4cC5pdGVyYXRlKHZhbHVlc1tpXSwgcmVnZXgsIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goaXRlbS5iYWNrcmVmID8gKG1hdGNoW2l0ZW0uYmFja3JlZl0gfHwgXCJcIikgOiBtYXRjaFswXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKChsZXZlbCA9PT0gY2hhaW4ubGVuZ3RoIC0gMSkgfHwgIW1hdGNoZXMubGVuZ3RoKSA/XG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA6IHJlY3Vyc2VDaGFpbihtYXRjaGVzLCBsZXZlbCArIDEpO1xuICAgICAgICB9KFtzdHJdLCAwKTtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBOZXcgUmVnRXhwIHByb3RvdHlwZSBtZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEFjY2VwdHMgYSBjb250ZXh0IG9iamVjdCBhbmQgYXJndW1lbnRzIGFycmF5OyByZXR1cm5zIHRoZSByZXN1bHQgb2YgY2FsbGluZyBgZXhlY2Agd2l0aCB0aGVcbiAgICAvLyBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJndW1lbnRzIGFycmF5LiB0aGUgY29udGV4dCBpcyBpZ25vcmVkIGJ1dCBpcyBhY2NlcHRlZCBmb3IgY29uZ3J1aXR5XG4gICAgLy8gd2l0aCBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YFxuICAgIFJlZ0V4cC5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbiAoY29udGV4dCwgYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy5leGVjKGFyZ3NbMF0pO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgY29udGV4dCBvYmplY3QgYW5kIHN0cmluZzsgcmV0dXJucyB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgYGV4ZWNgIHdpdGggdGhlIHByb3ZpZGVkXG4gICAgLy8gc3RyaW5nLiB0aGUgY29udGV4dCBpcyBpZ25vcmVkIGJ1dCBpcyBhY2NlcHRlZCBmb3IgY29uZ3J1aXR5IHdpdGggYEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsYFxuICAgIFJlZ0V4cC5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uIChjb250ZXh0LCBzdHIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlYyhzdHIpO1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIE92ZXJyaWRlbiBuYXRpdmUgbWV0aG9kc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBBZGRzIG5hbWVkIGNhcHR1cmUgc3VwcG9ydCAod2l0aCBiYWNrcmVmZXJlbmNlcyByZXR1cm5lZCBhcyBgcmVzdWx0Lm5hbWVgKSwgYW5kIGZpeGVzIHR3b1xuICAgIC8vIGNyb3NzLWJyb3dzZXIgaXNzdWVzIHBlciBFUzM6XG4gICAgLy8gLSBDYXB0dXJlZCB2YWx1ZXMgZm9yIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3VwcyBzaG91bGQgYmUgcmV0dXJuZWQgYXMgYHVuZGVmaW5lZGAsXG4gICAgLy8gICByYXRoZXIgdGhhbiB0aGUgZW1wdHkgc3RyaW5nLlxuICAgIC8vIC0gYGxhc3RJbmRleGAgc2hvdWxkIG5vdCBiZSBpbmNyZW1lbnRlZCBhZnRlciB6ZXJvLWxlbmd0aCBtYXRjaGVzLlxuICAgIFJlZ0V4cC5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgdmFyIG1hdGNoLCBuYW1lLCByMiwgb3JpZ0xhc3RJbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLmdsb2JhbClcbiAgICAgICAgICAgIG9yaWdMYXN0SW5kZXggPSB0aGlzLmxhc3RJbmRleDtcbiAgICAgICAgbWF0Y2ggPSBuYXRpdi5leGVjLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gRml4IGJyb3dzZXJzIHdob3NlIGBleGVjYCBtZXRob2RzIGRvbid0IGNvbnNpc3RlbnRseSByZXR1cm4gYHVuZGVmaW5lZGAgZm9yXG4gICAgICAgICAgICAvLyBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cHNcbiAgICAgICAgICAgIGlmICghY29tcGxpYW50RXhlY05wY2cgJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBpbmRleE9mKG1hdGNoLCBcIlwiKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcjIgPSBSZWdFeHAodGhpcy5zb3VyY2UsIG5hdGl2LnJlcGxhY2UuY2FsbChnZXROYXRpdmVGbGFncyh0aGlzKSwgXCJnXCIsIFwiXCIpKTtcbiAgICAgICAgICAgICAgICAvLyBVc2luZyBgc3RyLnNsaWNlKG1hdGNoLmluZGV4KWAgcmF0aGVyIHRoYW4gYG1hdGNoWzBdYCBpbiBjYXNlIGxvb2thaGVhZCBhbGxvd2VkXG4gICAgICAgICAgICAgICAgLy8gbWF0Y2hpbmcgZHVlIHRvIGNoYXJhY3RlcnMgb3V0c2lkZSB0aGUgbWF0Y2hcbiAgICAgICAgICAgICAgICBuYXRpdi5yZXBsYWNlLmNhbGwoKHN0ciArIFwiXCIpLnNsaWNlKG1hdGNoLmluZGV4KSwgcjIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEF0dGFjaCBuYW1lZCBjYXB0dXJlIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlmICh0aGlzLl94cmVnZXhwICYmIHRoaXMuX3hyZWdleHAuY2FwdHVyZU5hbWVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBtYXRjaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdGhpcy5feHJlZ2V4cC5jYXB0dXJlTmFtZXNbaSAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbbmFtZV0gPSBtYXRjaFtpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGaXggYnJvd3NlcnMgdGhhdCBpbmNyZW1lbnQgYGxhc3RJbmRleGAgYWZ0ZXIgemVyby1sZW5ndGggbWF0Y2hlc1xuICAgICAgICAgICAgaWYgKCFjb21wbGlhbnRMYXN0SW5kZXhJbmNyZW1lbnQgJiYgdGhpcy5nbG9iYWwgJiYgIW1hdGNoWzBdLmxlbmd0aCAmJiAodGhpcy5sYXN0SW5kZXggPiBtYXRjaC5pbmRleCkpXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4OyAvLyBGaXggSUUsIE9wZXJhIGJ1ZyAobGFzdCB0ZXN0ZWQgSUUgOS4wLjUsIE9wZXJhIDExLjYxIG9uIFdpbmRvd3MpXG4gICAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9O1xuXG4gICAgLy8gRml4IGJyb3dzZXIgYnVncyBpbiBuYXRpdmUgbWV0aG9kXG4gICAgUmVnRXhwLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAvLyBVc2UgdGhlIG5hdGl2ZSBgZXhlY2AgdG8gc2tpcCBzb21lIHByb2Nlc3Npbmcgb3ZlcmhlYWQsIGV2ZW4gdGhvdWdoIHRoZSBhbHRlcmVkXG4gICAgICAgIC8vIGBleGVjYCB3b3VsZCB0YWtlIGNhcmUgb2YgdGhlIGBsYXN0SW5kZXhgIGZpeGVzXG4gICAgICAgIHZhciBtYXRjaCwgb3JpZ0xhc3RJbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLmdsb2JhbClcbiAgICAgICAgICAgIG9yaWdMYXN0SW5kZXggPSB0aGlzLmxhc3RJbmRleDtcbiAgICAgICAgbWF0Y2ggPSBuYXRpdi5leGVjLmNhbGwodGhpcywgc3RyKTtcbiAgICAgICAgLy8gRml4IGJyb3dzZXJzIHRoYXQgaW5jcmVtZW50IGBsYXN0SW5kZXhgIGFmdGVyIHplcm8tbGVuZ3RoIG1hdGNoZXNcbiAgICAgICAgaWYgKG1hdGNoICYmICFjb21wbGlhbnRMYXN0SW5kZXhJbmNyZW1lbnQgJiYgdGhpcy5nbG9iYWwgJiYgIW1hdGNoWzBdLmxlbmd0aCAmJiAodGhpcy5sYXN0SW5kZXggPiBtYXRjaC5pbmRleCkpXG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleC0tO1xuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4OyAvLyBGaXggSUUsIE9wZXJhIGJ1ZyAobGFzdCB0ZXN0ZWQgSUUgOS4wLjUsIE9wZXJhIDExLjYxIG9uIFdpbmRvd3MpXG4gICAgICAgIHJldHVybiAhIW1hdGNoO1xuICAgIH07XG5cbiAgICAvLyBBZGRzIG5hbWVkIGNhcHR1cmUgc3VwcG9ydCBhbmQgZml4ZXMgYnJvd3NlciBidWdzIGluIG5hdGl2ZSBtZXRob2RcbiAgICBTdHJpbmcucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24gKHJlZ2V4KSB7XG4gICAgICAgIGlmICghWFJlZ0V4cC5pc1JlZ0V4cChyZWdleCkpXG4gICAgICAgICAgICByZWdleCA9IFJlZ0V4cChyZWdleCk7IC8vIE5hdGl2ZSBgUmVnRXhwYFxuICAgICAgICBpZiAocmVnZXguZ2xvYmFsKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmF0aXYubWF0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IDA7IC8vIEZpeCBJRSBidWdcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZ2V4LmV4ZWModGhpcyk7IC8vIFJ1biB0aGUgYWx0ZXJlZCBgZXhlY2BcbiAgICB9O1xuXG4gICAgLy8gQWRkcyBzdXBwb3J0IGZvciBgJHtufWAgdG9rZW5zIGZvciBuYW1lZCBhbmQgbnVtYmVyZWQgYmFja3JlZmVyZW5jZXMgaW4gcmVwbGFjZW1lbnQgdGV4dCxcbiAgICAvLyBhbmQgcHJvdmlkZXMgbmFtZWQgYmFja3JlZmVyZW5jZXMgdG8gcmVwbGFjZW1lbnQgZnVuY3Rpb25zIGFzIGBhcmd1bWVudHNbMF0ubmFtZWAuIEFsc29cbiAgICAvLyBmaXhlcyBjcm9zcy1icm93c2VyIGRpZmZlcmVuY2VzIGluIHJlcGxhY2VtZW50IHRleHQgc3ludGF4IHdoZW4gcGVyZm9ybWluZyBhIHJlcGxhY2VtZW50XG4gICAgLy8gdXNpbmcgYSBub25yZWdleCBzZWFyY2ggdmFsdWUsIGFuZCB0aGUgdmFsdWUgb2YgcmVwbGFjZW1lbnQgcmVnZXhlcycgYGxhc3RJbmRleGAgcHJvcGVydHlcbiAgICAvLyBkdXJpbmcgcmVwbGFjZW1lbnQgaXRlcmF0aW9ucy4gTm90ZSB0aGF0IHRoaXMgZG9lc24ndCBzdXBwb3J0IFNwaWRlck1vbmtleSdzIHByb3ByaWV0YXJ5XG4gICAgLy8gdGhpcmQgKGBmbGFnc2ApIHBhcmFtZXRlclxuICAgIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIChzZWFyY2gsIHJlcGxhY2VtZW50KSB7XG4gICAgICAgIHZhciBpc1JlZ2V4ID0gWFJlZ0V4cC5pc1JlZ0V4cChzZWFyY2gpLFxuICAgICAgICAgICAgY2FwdHVyZU5hbWVzLCByZXN1bHQsIHN0ciwgb3JpZ0xhc3RJbmRleDtcblxuICAgICAgICAvLyBUaGVyZSBhcmUgdG9vIG1hbnkgY29tYmluYXRpb25zIG9mIHNlYXJjaC9yZXBsYWNlbWVudCB0eXBlcy92YWx1ZXMgYW5kIGJyb3dzZXIgYnVncyB0aGF0XG4gICAgICAgIC8vIHByZWNsdWRlIHBhc3NpbmcgdG8gbmF0aXZlIGByZXBsYWNlYCwgc28gZG9uJ3QgdHJ5XG4gICAgICAgIC8vaWYgKC4uLilcbiAgICAgICAgLy8gICAgcmV0dXJuIG5hdGl2LnJlcGxhY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICBpZiAoaXNSZWdleCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaC5feHJlZ2V4cClcbiAgICAgICAgICAgICAgICBjYXB0dXJlTmFtZXMgPSBzZWFyY2guX3hyZWdleHAuY2FwdHVyZU5hbWVzOyAvLyBBcnJheSBvciBgbnVsbGBcbiAgICAgICAgICAgIGlmICghc2VhcmNoLmdsb2JhbClcbiAgICAgICAgICAgICAgICBvcmlnTGFzdEluZGV4ID0gc2VhcmNoLmxhc3RJbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlYXJjaCA9IHNlYXJjaCArIFwiXCI7IC8vIFR5cGUgY29udmVyc2lvblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZXBsYWNlbWVudCkgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIikge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmF0aXYucmVwbGFjZS5jYWxsKHRoaXMgKyBcIlwiLCBzZWFyY2gsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FwdHVyZU5hbWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoYW5nZSB0aGUgYGFyZ3VtZW50c1swXWAgc3RyaW5nIHByaW1pdGl2ZSB0byBhIFN0cmluZyBvYmplY3Qgd2hpY2ggY2FuIHN0b3JlIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3IFN0cmluZyhhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSBuYW1lZCBiYWNrcmVmZXJlbmNlcyBvbiBgYXJndW1lbnRzWzBdYFxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcHR1cmVOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhcHR1cmVOYW1lc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1bY2FwdHVyZU5hbWVzW2ldXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGBsYXN0SW5kZXhgIGJlZm9yZSBjYWxsaW5nIGByZXBsYWNlbWVudGAgKGZpeCBicm93c2VycylcbiAgICAgICAgICAgICAgICBpZiAoaXNSZWdleCAmJiBzZWFyY2guZ2xvYmFsKVxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gubGFzdEluZGV4ID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAyXSArIGFyZ3VtZW50c1swXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VtZW50LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IHRoaXMgKyBcIlwiOyAvLyBUeXBlIGNvbnZlcnNpb24sIHNvIGBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1gIHdpbGwgYmUgYSBzdHJpbmcgKGdpdmVuIG5vbnN0cmluZyBgdGhpc2ApXG4gICAgICAgICAgICByZXN1bHQgPSBuYXRpdi5yZXBsYWNlLmNhbGwoc3RyLCBzZWFyY2gsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50czsgLy8gS2VlcCB0aGlzIGZ1bmN0aW9uJ3MgYGFyZ3VtZW50c2AgYXZhaWxhYmxlIHRocm91Z2ggY2xvc3VyZVxuICAgICAgICAgICAgICAgIHJldHVybiBuYXRpdi5yZXBsYWNlLmNhbGwocmVwbGFjZW1lbnQgKyBcIlwiLCByZXBsYWNlbWVudFRva2VuLCBmdW5jdGlvbiAoJDAsICQxLCAkMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBOdW1iZXJlZCBiYWNrcmVmZXJlbmNlICh3aXRob3V0IGRlbGltaXRlcnMpIG9yIHNwZWNpYWwgdmFyaWFibGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKCQxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIiRcIjogcmV0dXJuIFwiJFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCImXCI6IHJldHVybiBhcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJgXCI6IHJldHVybiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0uc2xpY2UoMCwgYXJnc1thcmdzLmxlbmd0aCAtIDJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiJ1wiOiByZXR1cm4gYXJnc1thcmdzLmxlbmd0aCAtIDFdLnNsaWNlKGFyZ3NbYXJncy5sZW5ndGggLSAyXSArIGFyZ3NbMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOdW1iZXJlZCBiYWNrcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2hhdCBkb2VzIFwiJDEwXCIgbWVhbj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlIDEwLCBpZiAxMCBvciBtb3JlIGNhcHR1cmluZyBncm91cHMgZXhpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlIDEgZm9sbG93ZWQgYnkgXCIwXCIsIGlmIDEtOSBjYXB0dXJpbmcgZ3JvdXBzIGV4aXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gT3RoZXJ3aXNlLCBpdCdzIHRoZSBzdHJpbmcgXCIkMTBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIG5vdGU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gQmFja3JlZmVyZW5jZXMgY2Fubm90IGJlIG1vcmUgdGhhbiB0d28gZGlnaXRzIChlbmZvcmNlZCBieSBgcmVwbGFjZW1lbnRUb2tlbmApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gXCIkMDFcIiBpcyBlcXVpdmFsZW50IHRvIFwiJDFcIiBpZiBhIGNhcHR1cmluZyBncm91cCBleGlzdHMsIG90aGVyd2lzZSBpdCdzIHRoZSBzdHJpbmcgXCIkMDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIG5vIFwiJDBcIiB0b2tlbiAoXCIkJlwiIGlzIHRoZSBlbnRpcmUgbWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXRlcmFsTnVtYmVycyA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQxID0gKyQxOyAvLyBUeXBlIGNvbnZlcnNpb247IGRyb3AgbGVhZGluZyB6ZXJvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghJDEpIC8vIGAkMWAgd2FzIFwiMFwiIG9yIFwiMDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoJDEgPiBhcmdzLmxlbmd0aCAtIDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdGVyYWxOdW1iZXJzID0gU3RyaW5nLnByb3RvdHlwZS5zbGljZS5jYWxsKCQxLCAtMSkgKyBsaXRlcmFsTnVtYmVycztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQxID0gTWF0aC5mbG9vcigkMSAvIDEwKTsgLy8gRHJvcCB0aGUgbGFzdCBkaWdpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJDEgPyBhcmdzWyQxXSB8fCBcIlwiIDogXCIkXCIpICsgbGl0ZXJhbE51bWJlcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIE5hbWVkIGJhY2tyZWZlcmVuY2Ugb3IgZGVsaW1pdGVkIG51bWJlcmVkIGJhY2tyZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdoYXQgZG9lcyBcIiR7bn1cIiBtZWFuP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlIHRvIG51bWJlcmVkIGNhcHR1cmUgbi4gVHdvIGRpZmZlcmVuY2VzIGZyb20gXCIkblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAtIG4gY2FuIGJlIG1vcmUgdGhhbiB0d28gZGlnaXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgIC0gQmFja3JlZmVyZW5jZSAwIGlzIGFsbG93ZWQsIGFuZCBpcyB0aGUgZW50aXJlIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgdG8gbmFtZWQgY2FwdHVyZSBuLCBpZiBpdCBleGlzdHMgYW5kIGlzIG5vdCBhIG51bWJlciBvdmVycmlkZGVuIGJ5IG51bWJlcmVkIGNhcHR1cmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gT3RoZXJ3aXNlLCBpdCdzIHRoZSBzdHJpbmcgXCIke259XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuID0gKyQyOyAvLyBUeXBlIGNvbnZlcnNpb247IGRyb3AgbGVhZGluZyB6ZXJvc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4gPD0gYXJncy5sZW5ndGggLSAzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmdzW25dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IGNhcHR1cmVOYW1lcyA/IGluZGV4T2YoY2FwdHVyZU5hbWVzLCAkMikgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuID4gLTEgPyBhcmdzW24gKyAxXSA6ICQwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1JlZ2V4KSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoLmdsb2JhbClcbiAgICAgICAgICAgICAgICBzZWFyY2gubGFzdEluZGV4ID0gMDsgLy8gRml4IElFLCBTYWZhcmkgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgU2FmYXJpIDUuMS4yIG9uIFdpbmRvd3MpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VhcmNoLmxhc3RJbmRleCA9IG9yaWdMYXN0SW5kZXg7IC8vIEZpeCBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgT3BlcmEgMTEuNjEgb24gV2luZG93cylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8vIEEgY29uc2lzdGVudCBjcm9zcy1icm93c2VyLCBFUzMgY29tcGxpYW50IGBzcGxpdGBcbiAgICBTdHJpbmcucHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gKHMgLyogc2VwYXJhdG9yICovLCBsaW1pdCkge1xuICAgICAgICAvLyBJZiBzZXBhcmF0b3IgYHNgIGlzIG5vdCBhIHJlZ2V4LCB1c2UgdGhlIG5hdGl2ZSBgc3BsaXRgXG4gICAgICAgIGlmICghWFJlZ0V4cC5pc1JlZ0V4cChzKSlcbiAgICAgICAgICAgIHJldHVybiBuYXRpdi5zcGxpdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHZhciBzdHIgPSB0aGlzICsgXCJcIiwgLy8gVHlwZSBjb252ZXJzaW9uXG4gICAgICAgICAgICBvdXRwdXQgPSBbXSxcbiAgICAgICAgICAgIGxhc3RMYXN0SW5kZXggPSAwLFxuICAgICAgICAgICAgbWF0Y2gsIGxhc3RMZW5ndGg7XG5cbiAgICAgICAgLy8gQmVoYXZpb3IgZm9yIGBsaW1pdGA6IGlmIGl0J3MuLi5cbiAgICAgICAgLy8gLSBgdW5kZWZpbmVkYDogTm8gbGltaXRcbiAgICAgICAgLy8gLSBgTmFOYCBvciB6ZXJvOiBSZXR1cm4gYW4gZW1wdHkgYXJyYXlcbiAgICAgICAgLy8gLSBBIHBvc2l0aXZlIG51bWJlcjogVXNlIGBNYXRoLmZsb29yKGxpbWl0KWBcbiAgICAgICAgLy8gLSBBIG5lZ2F0aXZlIG51bWJlcjogTm8gbGltaXRcbiAgICAgICAgLy8gLSBPdGhlcjogVHlwZS1jb252ZXJ0LCB0aGVuIHVzZSB0aGUgYWJvdmUgcnVsZXNcbiAgICAgICAgaWYgKGxpbWl0ID09PSB1bmRlZmluZWQgfHwgK2xpbWl0IDwgMCkge1xuICAgICAgICAgICAgbGltaXQgPSBJbmZpbml0eTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbWl0ID0gTWF0aC5mbG9vcigrbGltaXQpO1xuICAgICAgICAgICAgaWYgKCFsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIGlmIG5vdCBgcy5nbG9iYWxgLCBhbmQgaXQgYXZvaWRzIG5lZWRpbmcgdG8gc2V0IGBzLmxhc3RJbmRleGAgdG8gemVyb1xuICAgICAgICAvLyBhbmQgcmVzdG9yZSBpdCB0byBpdHMgb3JpZ2luYWwgdmFsdWUgd2hlbiB3ZSdyZSBkb25lIHVzaW5nIHRoZSByZWdleFxuICAgICAgICBzID0gWFJlZ0V4cC5jb3B5QXNHbG9iYWwocyk7XG5cbiAgICAgICAgd2hpbGUgKG1hdGNoID0gcy5leGVjKHN0cikpIHsgLy8gUnVuIHRoZSBhbHRlcmVkIGBleGVjYCAocmVxdWlyZWQgZm9yIGBsYXN0SW5kZXhgIGZpeCwgZXRjLilcbiAgICAgICAgICAgIGlmIChzLmxhc3RJbmRleCA+IGxhc3RMYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChzdHIuc2xpY2UobGFzdExhc3RJbmRleCwgbWF0Y2guaW5kZXgpKTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoLmluZGV4IDwgc3RyLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkob3V0cHV0LCBtYXRjaC5zbGljZSgxKSk7XG5cbiAgICAgICAgICAgICAgICBsYXN0TGVuZ3RoID0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxhc3RMYXN0SW5kZXggPSBzLmxhc3RJbmRleDtcblxuICAgICAgICAgICAgICAgIGlmIChvdXRwdXQubGVuZ3RoID49IGxpbWl0KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHMubGFzdEluZGV4ID09PSBtYXRjaC5pbmRleClcbiAgICAgICAgICAgICAgICBzLmxhc3RJbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxhc3RMYXN0SW5kZXggPT09IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghbmF0aXYudGVzdC5jYWxsKHMsIFwiXCIpIHx8IGxhc3RMZW5ndGgpXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChzdHIuc2xpY2UobGFzdExhc3RJbmRleCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dC5sZW5ndGggPiBsaW1pdCA/IG91dHB1dC5zbGljZSgwLCBsaW1pdCkgOiBvdXRwdXQ7XG4gICAgfTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgUHJpdmF0ZSBoZWxwZXIgZnVuY3Rpb25zXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIFN1cHBvcnRpbmcgZnVuY3Rpb24gZm9yIGBYUmVnRXhwYCwgYFhSZWdFeHAuY29weUFzR2xvYmFsYCwgZXRjLiBSZXR1cm5zIGEgY29weSBvZiBhIGBSZWdFeHBgXG4gICAgLy8gaW5zdGFuY2Ugd2l0aCBhIGZyZXNoIGBsYXN0SW5kZXhgIChzZXQgdG8gemVybyksIHByZXNlcnZpbmcgcHJvcGVydGllcyByZXF1aXJlZCBmb3IgbmFtZWRcbiAgICAvLyBjYXB0dXJlLiBBbHNvIGFsbG93cyBhZGRpbmcgbmV3IGZsYWdzIGluIHRoZSBwcm9jZXNzIG9mIGNvcHlpbmcgdGhlIHJlZ2V4XG4gICAgZnVuY3Rpb24gY2xvbmUgKHJlZ2V4LCBhZGRpdGlvbmFsRmxhZ3MpIHtcbiAgICAgICAgaWYgKCFYUmVnRXhwLmlzUmVnRXhwKHJlZ2V4KSlcbiAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcihcInR5cGUgUmVnRXhwIGV4cGVjdGVkXCIpO1xuICAgICAgICB2YXIgeCA9IHJlZ2V4Ll94cmVnZXhwO1xuICAgICAgICByZWdleCA9IFhSZWdFeHAocmVnZXguc291cmNlLCBnZXROYXRpdmVGbGFncyhyZWdleCkgKyAoYWRkaXRpb25hbEZsYWdzIHx8IFwiXCIpKTtcbiAgICAgICAgaWYgKHgpIHtcbiAgICAgICAgICAgIHJlZ2V4Ll94cmVnZXhwID0ge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogeC5zb3VyY2UsXG4gICAgICAgICAgICAgICAgY2FwdHVyZU5hbWVzOiB4LmNhcHR1cmVOYW1lcyA/IHguY2FwdHVyZU5hbWVzLnNsaWNlKDApIDogbnVsbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVnZXg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TmF0aXZlRmxhZ3MgKHJlZ2V4KSB7XG4gICAgICAgIHJldHVybiAocmVnZXguZ2xvYmFsICAgICA/IFwiZ1wiIDogXCJcIikgK1xuICAgICAgICAgICAgICAgKHJlZ2V4Lmlnbm9yZUNhc2UgPyBcImlcIiA6IFwiXCIpICtcbiAgICAgICAgICAgICAgIChyZWdleC5tdWx0aWxpbmUgID8gXCJtXCIgOiBcIlwiKSArXG4gICAgICAgICAgICAgICAocmVnZXguZXh0ZW5kZWQgICA/IFwieFwiIDogXCJcIikgKyAvLyBQcm9wb3NlZCBmb3IgRVM0OyBpbmNsdWRlZCBpbiBBUzNcbiAgICAgICAgICAgICAgIChyZWdleC5zdGlja3kgICAgID8gXCJ5XCIgOiBcIlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBydW5Ub2tlbnMgKHBhdHRlcm4sIGluZGV4LCBzY29wZSwgY29udGV4dCkge1xuICAgICAgICB2YXIgaSA9IHRva2Vucy5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQsIG1hdGNoLCB0O1xuICAgICAgICAvLyBQcm90ZWN0IGFnYWluc3QgY29uc3RydWN0aW5nIFhSZWdFeHBzIHdpdGhpbiB0b2tlbiBoYW5kbGVyIGFuZCB0cmlnZ2VyIGZ1bmN0aW9uc1xuICAgICAgICBpc0luc2lkZUNvbnN0cnVjdG9yID0gdHJ1ZTtcbiAgICAgICAgLy8gTXVzdCByZXNldCBgaXNJbnNpZGVDb25zdHJ1Y3RvcmAsIGV2ZW4gaWYgYSBgdHJpZ2dlcmAgb3IgYGhhbmRsZXJgIHRocm93c1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKGktLSkgeyAvLyBSdW4gaW4gcmV2ZXJzZSBvcmRlclxuICAgICAgICAgICAgICAgIHQgPSB0b2tlbnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKChzY29wZSAmIHQuc2NvcGUpICYmICghdC50cmlnZ2VyIHx8IHQudHJpZ2dlci5jYWxsKGNvbnRleHQpKSkge1xuICAgICAgICAgICAgICAgICAgICB0LnBhdHRlcm4ubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gdC5wYXR0ZXJuLmV4ZWMocGF0dGVybik7IC8vIFJ1bm5pbmcgdGhlIGFsdGVyZWQgYGV4ZWNgIGhlcmUgYWxsb3dzIHVzZSBvZiBuYW1lZCBiYWNrcmVmZXJlbmNlcywgZXRjLlxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2guaW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiB0LmhhbmRsZXIuY2FsbChjb250ZXh0LCBtYXRjaCwgc2NvcGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluZGV4T2YgKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgICAgIGlmIChBcnJheS5wcm90b3R5cGUuaW5kZXhPZikgLy8gVXNlIHRoZSBuYXRpdmUgYXJyYXkgbWV0aG9kIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgZnJvbSk7XG4gICAgICAgIGZvciAodmFyIGkgPSBmcm9tIHx8IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKVxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIEJ1aWx0LWluIHRva2Vuc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBBdWdtZW50IFhSZWdFeHAncyByZWd1bGFyIGV4cHJlc3Npb24gc3ludGF4IGFuZCBmbGFncy4gTm90ZSB0aGF0IHdoZW4gYWRkaW5nIHRva2VucywgdGhlXG4gICAgLy8gdGhpcmQgKGBzY29wZWApIGFyZ3VtZW50IGRlZmF1bHRzIHRvIGBYUmVnRXhwLk9VVFNJREVfQ0xBU1NgXG5cbiAgICAvLyBDb21tZW50IHBhdHRlcm46ICg/IyApXG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcKFxcPyNbXildKlxcKS8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gS2VlcCB0b2tlbnMgc2VwYXJhdGVkIHVubGVzcyB0aGUgZm9sbG93aW5nIHRva2VuIGlzIGEgcXVhbnRpZmllclxuICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnRlc3QuY2FsbChxdWFudGlmaWVyLCBtYXRjaC5pbnB1dC5zbGljZShtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkpID8gXCJcIiA6IFwiKD86KVwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIENhcHR1cmluZyBncm91cCAobWF0Y2ggdGhlIG9wZW5pbmcgcGFyZW50aGVzaXMgb25seSkuXG4gICAgLy8gUmVxdWlyZWQgZm9yIHN1cHBvcnQgb2YgbmFtZWQgY2FwdHVyaW5nIGdyb3Vwc1xuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXCgoPyFcXD8pLyxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jYXB0dXJlTmFtZXMucHVzaChudWxsKTtcbiAgICAgICAgICAgIHJldHVybiBcIihcIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBOYW1lZCBjYXB0dXJpbmcgZ3JvdXAgKG1hdGNoIHRoZSBvcGVuaW5nIGRlbGltaXRlciBvbmx5KTogKD88bmFtZT5cbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFwoXFw/PChbJFxcd10rKT4vLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuY2FwdHVyZU5hbWVzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgICAgICAgdGhpcy5oYXNOYW1lZENhcHR1cmUgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIFwiKFwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIE5hbWVkIGJhY2tyZWZlcmVuY2U6IFxcazxuYW1lPlxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXFxcazwoW1xcdyRdKyk+LyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMuY2FwdHVyZU5hbWVzLCBtYXRjaFsxXSk7XG4gICAgICAgICAgICAvLyBLZWVwIGJhY2tyZWZlcmVuY2VzIHNlcGFyYXRlIGZyb20gc3Vic2VxdWVudCBsaXRlcmFsIG51bWJlcnMuIFByZXNlcnZlIGJhY2stXG4gICAgICAgICAgICAvLyByZWZlcmVuY2VzIHRvIG5hbWVkIGdyb3VwcyB0aGF0IGFyZSB1bmRlZmluZWQgYXQgdGhpcyBwb2ludCBhcyBsaXRlcmFsIHN0cmluZ3NcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA+IC0xID9cbiAgICAgICAgICAgICAgICBcIlxcXFxcIiArIChpbmRleCArIDEpICsgKGlzTmFOKG1hdGNoLmlucHV0LmNoYXJBdChtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkpID8gXCJcIiA6IFwiKD86KVwiKSA6XG4gICAgICAgICAgICAgICAgbWF0Y2hbMF07XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gRW1wdHkgY2hhcmFjdGVyIGNsYXNzOiBbXSBvciBbXl1cbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFxbXFxeP10vLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIC8vIEZvciBjcm9zcy1icm93c2VyIGNvbXBhdGliaWxpdHkgd2l0aCBFUzMsIGNvbnZlcnQgW10gdG8gXFxiXFxCIGFuZCBbXl0gdG8gW1xcc1xcU10uXG4gICAgICAgICAgICAvLyAoPyEpIHNob3VsZCB3b3JrIGxpa2UgXFxiXFxCLCBidXQgaXMgdW5yZWxpYWJsZSBpbiBGaXJlZm94XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hbMF0gPT09IFwiW11cIiA/IFwiXFxcXGJcXFxcQlwiIDogXCJbXFxcXHNcXFxcU11cIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBNb2RlIG1vZGlmaWVyIGF0IHRoZSBzdGFydCBvZiB0aGUgcGF0dGVybiBvbmx5LCB3aXRoIGFueSBjb21iaW5hdGlvbiBvZiBmbGFncyBpbXN4OiAoP2ltc3gpXG4gICAgLy8gRG9lcyBub3Qgc3VwcG9ydCB4KD9pKSwgKD8taSksICg/aS1tKSwgKD9pOiApLCAoP2kpKD9tKSwgZXRjLlxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9eXFwoXFw/KFtpbXN4XSspXFwpLyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICB0aGlzLnNldEZsYWcobWF0Y2hbMV0pO1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gV2hpdGVzcGFjZSBhbmQgY29tbWVudHMsIGluIGZyZWUtc3BhY2luZyAoYWthIGV4dGVuZGVkKSBtb2RlIG9ubHlcbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvKD86XFxzK3wjLiopKy8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gS2VlcCB0b2tlbnMgc2VwYXJhdGVkIHVubGVzcyB0aGUgZm9sbG93aW5nIHRva2VuIGlzIGEgcXVhbnRpZmllclxuICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnRlc3QuY2FsbChxdWFudGlmaWVyLCBtYXRjaC5pbnB1dC5zbGljZShtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkpID8gXCJcIiA6IFwiKD86KVwiO1xuICAgICAgICB9LFxuICAgICAgICBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gdGhpcy5oYXNGbGFnKFwieFwiKTt9XG4gICAgKTtcblxuICAgIC8vIERvdCwgaW4gZG90YWxsIChha2Egc2luZ2xlbGluZSkgbW9kZSBvbmx5XG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcLi8sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gXCJbXFxcXHNcXFxcU11cIjt9LFxuICAgICAgICBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gdGhpcy5oYXNGbGFnKFwic1wiKTt9XG4gICAgKTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgQmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBVbmNvbW1lbnQgdGhlIGZvbGxvd2luZyBibG9jayBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFhSZWdFeHAgMS4wLTEuMjpcbiAgICAvKlxuICAgIFhSZWdFeHAubWF0Y2hXaXRoaW5DaGFpbiA9IFhSZWdFeHAubWF0Y2hDaGFpbjtcbiAgICBSZWdFeHAucHJvdG90eXBlLmFkZEZsYWdzID0gZnVuY3Rpb24gKHMpIHtyZXR1cm4gY2xvbmUodGhpcywgcyk7fTtcbiAgICBSZWdFeHAucHJvdG90eXBlLmV4ZWNBbGwgPSBmdW5jdGlvbiAocykge3ZhciByID0gW107IFhSZWdFeHAuaXRlcmF0ZShzLCB0aGlzLCBmdW5jdGlvbiAobSkge3IucHVzaChtKTt9KTsgcmV0dXJuIHI7fTtcbiAgICBSZWdFeHAucHJvdG90eXBlLmZvckVhY2hFeGVjID0gZnVuY3Rpb24gKHMsIGYsIGMpIHtyZXR1cm4gWFJlZ0V4cC5pdGVyYXRlKHMsIHRoaXMsIGYsIGMpO307XG4gICAgUmVnRXhwLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uIChzKSB7dmFyIHIgPSBSZWdFeHAoXCJeKD86XCIgKyB0aGlzLnNvdXJjZSArIFwiKSQoPyFcXFxccylcIiwgZ2V0TmF0aXZlRmxhZ3ModGhpcykpOyBpZiAodGhpcy5nbG9iYWwpIHRoaXMubGFzdEluZGV4ID0gMDsgcmV0dXJuIHMuc2VhcmNoKHIpID09PSAwO307XG4gICAgKi9cblxufSkoKTtcblxuXG5tb2R1bGUuZXhwb3J0cy5YUmVnRXhwID0gWFJlZ0V4cDsiLCJ2YXIgWFJlZ0V4cCA9IHJlcXVpcmUoXCIuL1hSZWdFeHBcIikuWFJlZ0V4cDtcbnZhciBjbGFzc05hbWUsXG4gICBndXR0ZXI7XG4vL1xuLy8gQmVnaW4gYW5vbnltb3VzIGZ1bmN0aW9uLiBUaGlzIGlzIHVzZWQgdG8gY29udGFpbiBsb2NhbCBzY29wZSB2YXJpYWJsZXMgd2l0aG91dCBwb2x1dHRpbmcgZ2xvYmFsIHNjb3BlLlxuLy9cbnZhciBTeW50YXhIaWdobGlnaHRlciA9IGZ1bmN0aW9uKCkgeyBcblxuLy8gQ29tbW9uSlNcbmlmICh0eXBlb2YocmVxdWlyZSkgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mKFhSZWdFeHApID09ICd1bmRlZmluZWQnKVxue1xuLy8gTm8gb3Agc2luY2UgcmVxdWlyZWQgcHJvcGVybHkgYXQgdG9wIG9mIGZpbGVcblxufVxuXG4vLyBTaG9ydGN1dCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBhc3NpZ25lZCB0byB0aGUgU3ludGF4SGlnaGxpZ2h0ZXIgdmFyaWFibGUuXG4vLyBUaGlzIGlzIGEgc2hvcnRoYW5kIGZvciBsb2NhbCByZWZlcmVuY2UgaW4gb3JkZXIgdG8gYXZvaWQgbG9uZyBuYW1lc3BhY2UgXG4vLyByZWZlcmVuY2VzIHRvIFN5bnRheEhpZ2hsaWdodGVyLndoYXRldmVyLi4uXG52YXIgc2ggPSB7XG5cdGRlZmF1bHRzIDoge1xuXHRcdC8qKiBBZGRpdGlvbmFsIENTUyBjbGFzcyBuYW1lcyB0byBiZSBhZGRlZCB0byBoaWdobGlnaHRlciBlbGVtZW50cy4gKi9cblx0XHQnY2xhc3MtbmFtZScgOiAnJyxcblx0XHRcblx0XHQvKiogRmlyc3QgbGluZSBudW1iZXIuICovXG5cdFx0J2ZpcnN0LWxpbmUnIDogMSxcblx0XHRcblx0XHQvKipcblx0XHQgKiBQYWRzIGxpbmUgbnVtYmVycy4gUG9zc2libGUgdmFsdWVzIGFyZTpcblx0XHQgKlxuXHRcdCAqICAgZmFsc2UgLSBkb24ndCBwYWQgbGluZSBudW1iZXJzLlxuXHRcdCAqICAgdHJ1ZSAgLSBhdXRvbWF0aWNhbHkgcGFkIG51bWJlcnMgd2l0aCBtaW5pbXVtIHJlcXVpcmVkIG51bWJlciBvZiBsZWFkaW5nIHplcm9lcy5cblx0XHQgKiAgIFtpbnRdIC0gbGVuZ3RoIHVwIHRvIHdoaWNoIHBhZCBsaW5lIG51bWJlcnMuXG5cdFx0ICovXG5cdFx0J3BhZC1saW5lLW51bWJlcnMnIDogZmFsc2UsXG5cdFx0XG5cdFx0LyoqIExpbmVzIHRvIGhpZ2hsaWdodC4gKi9cblx0XHQnaGlnaGxpZ2h0JyA6IG51bGwsXG5cdFx0XG5cdFx0LyoqIFRpdGxlIHRvIGJlIGRpc3BsYXllZCBhYm92ZSB0aGUgY29kZSBibG9jay4gKi9cblx0XHQndGl0bGUnIDogbnVsbCxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBzbWFydCB0YWJzLiAqL1xuXHRcdCdzbWFydC10YWJzJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEdldHMgb3Igc2V0cyB0YWIgc2l6ZS4gKi9cblx0XHQndGFiLXNpemUnIDogNCxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBndXR0ZXIuICovXG5cdFx0J2d1dHRlcicgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIHRvb2xiYXIuICovXG5cdFx0J3Rvb2xiYXInIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBxdWljayBjb2RlIGNvcHkgYW5kIHBhc3RlIGZyb20gZG91YmxlIGNsaWNrLiAqL1xuXHRcdCdxdWljay1jb2RlJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEZvcmNlcyBjb2RlIHZpZXcgdG8gYmUgY29sbGFwc2VkLiAqL1xuXHRcdCdjb2xsYXBzZScgOiBmYWxzZSxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBhdXRvbWF0aWMgbGlua3MuICovXG5cdFx0J2F1dG8tbGlua3MnIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogR2V0cyBvciBzZXRzIGxpZ2h0IG1vZGUuIEVxdWF2YWxlbnQgdG8gdHVybmluZyBvZmYgZ3V0dGVyIGFuZCB0b29sYmFyLiAqL1xuXHRcdCdsaWdodCcgOiBmYWxzZSxcblxuXHRcdCd1bmluZGVudCcgOiB0cnVlLFxuXHRcdFxuXHRcdCdodG1sLXNjcmlwdCcgOiBmYWxzZVxuXHR9LFxuXHRcblx0Y29uZmlnIDoge1xuXHRcdHNwYWNlIDogJyZuYnNwOycsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgdXNlIG9mIDxTQ1JJUFQgdHlwZT1cInN5bnRheGhpZ2hsaWdodGVyXCIgLz4gdGFncy4gKi9cblx0XHR1c2VTY3JpcHRUYWdzIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogQmxvZ2dlciBtb2RlIGZsYWcuICovXG5cdFx0YmxvZ2dlck1vZGUgOiBmYWxzZSxcblx0XHRcblx0XHRzdHJpcEJycyA6IGZhbHNlLFxuXHRcdFxuXHRcdC8qKiBOYW1lIG9mIHRoZSB0YWcgdGhhdCBTeW50YXhIaWdobGlnaHRlciB3aWxsIGF1dG9tYXRpY2FsbHkgbG9vayBmb3IuICovXG5cdFx0dGFnTmFtZSA6ICdwcmUnLFxuXHRcdFxuXHRcdHN0cmluZ3MgOiB7XG5cdFx0XHRleHBhbmRTb3VyY2UgOiAnZXhwYW5kIHNvdXJjZScsXG5cdFx0XHRoZWxwIDogJz8nLFxuXHRcdFx0YWxlcnQ6ICdTeW50YXhIaWdobGlnaHRlclxcblxcbicsXG5cdFx0XHRub0JydXNoIDogJ0NhblxcJ3QgZmluZCBicnVzaCBmb3I6ICcsXG5cdFx0XHRicnVzaE5vdEh0bWxTY3JpcHQgOiAnQnJ1c2ggd2FzblxcJ3QgY29uZmlndXJlZCBmb3IgaHRtbC1zY3JpcHQgb3B0aW9uOiAnLFxuXHRcdFx0XG5cdFx0XHQvLyB0aGlzIGlzIHBvcHVsYXRlZCBieSB0aGUgYnVpbGQgc2NyaXB0XG5cdFx0XHRhYm91dERpYWxvZyA6ICdAQUJPVVRAJ1xuXHRcdH1cblx0fSxcblx0XG5cdC8qKiBJbnRlcm5hbCAnZ2xvYmFsJyB2YXJpYWJsZXMuICovXG5cdHZhcnMgOiB7XG5cdFx0ZGlzY292ZXJlZEJydXNoZXMgOiBudWxsLFxuXHRcdGhpZ2hsaWdodGVycyA6IHt9XG5cdH0sXG5cdFxuXHQvKiogVGhpcyBvYmplY3QgaXMgcG9wdWxhdGVkIGJ5IHVzZXIgaW5jbHVkZWQgZXh0ZXJuYWwgYnJ1c2ggZmlsZXMuICovXG5cdGJydXNoZXMgOiB7fSxcblxuXHQvKiogQ29tbW9uIHJlZ3VsYXIgZXhwcmVzc2lvbnMuICovXG5cdHJlZ2V4TGliIDoge1xuXHRcdG11bHRpTGluZUNDb21tZW50c1x0XHRcdDogL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZ20sXG5cdFx0c2luZ2xlTGluZUNDb21tZW50c1x0XHRcdDogL1xcL1xcLy4qJC9nbSxcblx0XHRzaW5nbGVMaW5lUGVybENvbW1lbnRzXHRcdDogLyMuKiQvZ20sXG5cdFx0ZG91YmxlUXVvdGVkU3RyaW5nXHRcdFx0OiAvXCIoW15cXFxcXCJcXG5dfFxcXFwuKSpcIi9nLFxuXHRcdHNpbmdsZVF1b3RlZFN0cmluZ1x0XHRcdDogLycoW15cXFxcJ1xcbl18XFxcXC4pKicvZyxcblx0XHRtdWx0aUxpbmVEb3VibGVRdW90ZWRTdHJpbmdcdDogbmV3IFhSZWdFeHAoJ1wiKFteXFxcXFxcXFxcIl18XFxcXFxcXFwuKSpcIicsICdncycpLFxuXHRcdG11bHRpTGluZVNpbmdsZVF1b3RlZFN0cmluZ1x0OiBuZXcgWFJlZ0V4cChcIicoW15cXFxcXFxcXCddfFxcXFxcXFxcLikqJ1wiLCAnZ3MnKSxcblx0XHR4bWxDb21tZW50c1x0XHRcdFx0XHQ6IC8oJmx0O3w8KSEtLVtcXHNcXFNdKj8tLSgmZ3Q7fD4pL2dtLFxuXHRcdHVybFx0XHRcdFx0XHRcdFx0OiAvXFx3KzpcXC9cXC9bXFx3LS5cXC8/JSY9OkA7I10qL2csXG5cdFx0XG5cdFx0LyoqIDw/PSA/PiB0YWdzLiAqL1xuXHRcdHBocFNjcmlwdFRhZ3MgXHRcdFx0XHQ6IHsgbGVmdDogLygmbHQ7fDwpXFw/KD86PXxwaHApPy9nLCByaWdodDogL1xcPygmZ3Q7fD4pL2csICdlb2YnIDogdHJ1ZSB9LFxuXHRcdFxuXHRcdC8qKiA8JT0gJT4gdGFncy4gKi9cblx0XHRhc3BTY3JpcHRUYWdzXHRcdFx0XHQ6IHsgbGVmdDogLygmbHQ7fDwpJT0/L2csIHJpZ2h0OiAvJSgmZ3Q7fD4pL2cgfSxcblx0XHRcblx0XHQvKiogPHNjcmlwdD4gdGFncy4gKi9cblx0XHRzY3JpcHRTY3JpcHRUYWdzXHRcdFx0OiB7IGxlZnQ6IC8oJmx0O3w8KVxccypzY3JpcHQuKj8oJmd0O3w+KS9naSwgcmlnaHQ6IC8oJmx0O3w8KVxcL1xccypzY3JpcHRcXHMqKCZndDt8PikvZ2kgfVxuXHR9LFxuXG5cdHRvb2xiYXI6IHtcblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIHRoZSB0b29sYmFyLlxuXHRcdCAqIEBwYXJhbSB7SGlnaGxpZ2h0ZXJ9IGhpZ2hsaWdodGVyIEhpZ2hsaWdodGVyIGluc3RhbmNlLlxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBIVE1MIG1hcmt1cC5cblx0XHQgKi9cblx0XHRnZXRIdG1sOiBmdW5jdGlvbihoaWdobGlnaHRlcilcblx0XHR7XG5cdFx0XHR2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwidG9vbGJhclwiPicsXG5cdFx0XHRcdGl0ZW1zID0gc2gudG9vbGJhci5pdGVtcyxcblx0XHRcdFx0bGlzdCA9IGl0ZW1zLmxpc3Rcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBkZWZhdWx0R2V0SHRtbChoaWdobGlnaHRlciwgbmFtZSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHNoLnRvb2xiYXIuZ2V0QnV0dG9uSHRtbChoaWdobGlnaHRlciwgbmFtZSwgc2guY29uZmlnLnN0cmluZ3NbbmFtZV0pO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKVxuXHRcdFx0XHRodG1sICs9IChpdGVtc1tsaXN0W2ldXS5nZXRIdG1sIHx8IGRlZmF1bHRHZXRIdG1sKShoaWdobGlnaHRlciwgbGlzdFtpXSk7XG5cdFx0XHRcblx0XHRcdGh0bWwgKz0gJzwvZGl2Pic7XG5cdFx0XHRcblx0XHRcdHJldHVybiBodG1sO1xuXHRcdH0sXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciBhIHJlZ3VsYXIgYnV0dG9uIGluIHRoZSB0b29sYmFyLlxuXHRcdCAqIEBwYXJhbSB7SGlnaGxpZ2h0ZXJ9IGhpZ2hsaWdodGVyIEhpZ2hsaWdodGVyIGluc3RhbmNlLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBjb21tYW5kTmFtZVx0XHRDb21tYW5kIG5hbWUgdGhhdCB3b3VsZCBiZSBleGVjdXRlZC5cblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWxcdFx0XHRMYWJlbCB0ZXh0IHRvIGRpc3BsYXkuXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0XHRSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHRcdCAqL1xuXHRcdGdldEJ1dHRvbkh0bWw6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyLCBjb21tYW5kTmFtZSwgbGFiZWwpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICc8c3Bhbj48YSBocmVmPVwiI1wiIGNsYXNzPVwidG9vbGJhcl9pdGVtJ1xuXHRcdFx0XHQrICcgY29tbWFuZF8nICsgY29tbWFuZE5hbWVcblx0XHRcdFx0KyAnICcgKyBjb21tYW5kTmFtZVxuXHRcdFx0XHQrICdcIj4nICsgbGFiZWwgKyAnPC9hPjwvc3Bhbj4nXG5cdFx0XHRcdDtcblx0XHR9LFxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEV2ZW50IGhhbmRsZXIgZm9yIGEgdG9vbGJhciBhbmNob3IuXG5cdFx0ICovXG5cdFx0aGFuZGxlcjogZnVuY3Rpb24oZSlcblx0XHR7XG5cdFx0XHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQsXG5cdFx0XHRcdGNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUgfHwgJydcblx0XHRcdFx0O1xuXG5cdFx0XHRmdW5jdGlvbiBnZXRWYWx1ZShuYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgciA9IG5ldyBSZWdFeHAobmFtZSArICdfKFxcXFx3KyknKSxcblx0XHRcdFx0XHRtYXRjaCA9IHIuZXhlYyhjbGFzc05hbWUpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogbnVsbDtcblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdHZhciBoaWdobGlnaHRlciA9IGdldEhpZ2hsaWdodGVyQnlJZChmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsICcuc3ludGF4aGlnaGxpZ2h0ZXInKS5pZCksXG5cdFx0XHRcdGNvbW1hbmROYW1lID0gZ2V0VmFsdWUoJ2NvbW1hbmQnKVxuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdC8vIGV4ZWN1dGUgdGhlIHRvb2xiYXIgY29tbWFuZFxuXHRcdFx0aWYgKGhpZ2hsaWdodGVyICYmIGNvbW1hbmROYW1lKVxuXHRcdFx0XHRzaC50b29sYmFyLml0ZW1zW2NvbW1hbmROYW1lXS5leGVjdXRlKGhpZ2hsaWdodGVyKTtcblxuXHRcdFx0Ly8gZGlzYWJsZSBkZWZhdWx0IEEgY2xpY2sgYmVoYXZpb3VyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fSxcblx0XHRcblx0XHQvKiogQ29sbGVjdGlvbiBvZiB0b29sYmFyIGl0ZW1zLiAqL1xuXHRcdGl0ZW1zIDoge1xuXHRcdFx0Ly8gT3JkZXJlZCBsaXMgb2YgaXRlbXMgaW4gdGhlIHRvb2xiYXIuIENhbid0IGV4cGVjdCBgZm9yICh2YXIgbiBpbiBpdGVtcylgIHRvIGJlIGNvbnNpc3RlbnQuXG5cdFx0XHRsaXN0OiBbJ2V4cGFuZFNvdXJjZScsICdoZWxwJ10sXG5cblx0XHRcdGV4cGFuZFNvdXJjZToge1xuXHRcdFx0XHRnZXRIdG1sOiBmdW5jdGlvbihoaWdobGlnaHRlcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChoaWdobGlnaHRlci5nZXRQYXJhbSgnY29sbGFwc2UnKSAhPSB0cnVlKVxuXHRcdFx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIHRpdGxlID0gaGlnaGxpZ2h0ZXIuZ2V0UGFyYW0oJ3RpdGxlJyk7XG5cdFx0XHRcdFx0cmV0dXJuIHNoLnRvb2xiYXIuZ2V0QnV0dG9uSHRtbChoaWdobGlnaHRlciwgJ2V4cGFuZFNvdXJjZScsIHRpdGxlID8gdGl0bGUgOiBzaC5jb25maWcuc3RyaW5ncy5leHBhbmRTb3VyY2UpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XG5cdFx0XHRcdGV4ZWN1dGU6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGRpdiA9IGdldEhpZ2hsaWdodGVyRGl2QnlJZChoaWdobGlnaHRlci5pZCk7XG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoZGl2LCAnY29sbGFwc2VkJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8qKiBDb21tYW5kIHRvIGRpc3BsYXkgdGhlIGFib3V0IGRpYWxvZyB3aW5kb3cuICovXG5cdFx0XHRoZWxwOiB7XG5cdFx0XHRcdGV4ZWN1dGU6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdFx0XHR7XHRcblx0XHRcdFx0XHR2YXIgd25kID0gcG9wdXAoJycsICdfYmxhbmsnLCA1MDAsIDI1MCwgJ3Njcm9sbGJhcnM9MCcpLFxuXHRcdFx0XHRcdFx0ZG9jID0gd25kLmRvY3VtZW50XG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ZG9jLndyaXRlKHNoLmNvbmZpZy5zdHJpbmdzLmFib3V0RGlhbG9nKTtcblx0XHRcdFx0XHRkb2MuY2xvc2UoKTtcblx0XHRcdFx0XHR3bmQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogRmluZHMgYWxsIGVsZW1lbnRzIG9uIHRoZSBwYWdlIHdoaWNoIHNob3VsZCBiZSBwcm9jZXNzZXMgYnkgU3ludGF4SGlnaGxpZ2h0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBnbG9iYWxQYXJhbXNcdFx0T3B0aW9uYWwgcGFyYW1ldGVycyB3aGljaCBvdmVycmlkZSBlbGVtZW50J3MgXG5cdCAqIFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuIE9ubHkgdXNlZCBpZiBlbGVtZW50IGlzIHNwZWNpZmllZC5cblx0ICogXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XHRPcHRpb25hbCBlbGVtZW50IHRvIGhpZ2hsaWdodC4gSWYgbm9uZSBpc1xuXHQgKiBcdFx0XHRcdFx0XHRcdHByb3ZpZGVkLCBhbGwgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQgXG5cdCAqIFx0XHRcdFx0XHRcdFx0YXJlIHJldHVybmVkIHdoaWNoIHF1YWxpZnkuXG5cdCAqXG5cdCAqIEByZXR1cm4ge0FycmF5fVx0UmV0dXJucyBsaXN0IG9mIDxjb2RlPnsgdGFyZ2V0OiBET01FbGVtZW50LCBwYXJhbXM6IE9iamVjdCB9PC9jb2RlPiBvYmplY3RzLlxuXHQgKi9cblx0ZmluZEVsZW1lbnRzOiBmdW5jdGlvbihnbG9iYWxQYXJhbXMsIGVsZW1lbnQpXG5cdHtcblx0XHR2YXIgZWxlbWVudHMgPSBlbGVtZW50ID8gW2VsZW1lbnRdIDogdG9BcnJheShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShzaC5jb25maWcudGFnTmFtZSkpLCBcblx0XHRcdGNvbmYgPSBzaC5jb25maWcsXG5cdFx0XHRyZXN1bHQgPSBbXVxuXHRcdFx0O1xuXG5cdFx0Ly8gc3VwcG9ydCBmb3IgPFNDUklQVCBUWVBFPVwic3ludGF4aGlnaGxpZ2h0ZXJcIiAvPiBmZWF0dXJlXG5cdFx0aWYgKGNvbmYudXNlU2NyaXB0VGFncylcblx0XHRcdGVsZW1lbnRzID0gZWxlbWVudHMuY29uY2F0KGdldFN5bnRheEhpZ2hsaWdodGVyU2NyaXB0VGFncygpKTtcblxuXHRcdGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIFxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykgXG5cdFx0e1xuXHRcdFx0dmFyIGl0ZW0gPSB7XG5cdFx0XHRcdHRhcmdldDogZWxlbWVudHNbaV0sIFxuXHRcdFx0XHQvLyBsb2NhbCBwYXJhbXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgZ2xvYmFsc1xuXHRcdFx0XHRwYXJhbXM6IG1lcmdlKGdsb2JhbFBhcmFtcywgcGFyc2VQYXJhbXMoZWxlbWVudHNbaV0uY2xhc3NOYW1lKSlcblx0XHRcdH07XG5cblx0XHRcdGlmIChpdGVtLnBhcmFtc1snYnJ1c2gnXSA9PSBudWxsKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XG5cdFx0XHRyZXN1bHQucHVzaChpdGVtKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogU2hvcnRoYW5kIHRvIGhpZ2hsaWdodCBhbGwgZWxlbWVudHMgb24gdGhlIHBhZ2UgdGhhdCBhcmUgbWFya2VkIGFzIFxuXHQgKiBTeW50YXhIaWdobGlnaHRlciBzb3VyY2UgY29kZS5cblx0ICogXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBnbG9iYWxQYXJhbXNcdFx0T3B0aW9uYWwgcGFyYW1ldGVycyB3aGljaCBvdmVycmlkZSBlbGVtZW50J3MgXG5cdCAqIFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuIE9ubHkgdXNlZCBpZiBlbGVtZW50IGlzIHNwZWNpZmllZC5cblx0ICogXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XHRPcHRpb25hbCBlbGVtZW50IHRvIGhpZ2hsaWdodC4gSWYgbm9uZSBpc1xuXHQgKiBcdFx0XHRcdFx0XHRcdHByb3ZpZGVkLCBhbGwgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQgXG5cdCAqIFx0XHRcdFx0XHRcdFx0YXJlIGhpZ2hsaWdodGVkLlxuXHQgKi8gXG5cdGhpZ2hsaWdodDogZnVuY3Rpb24oZ2xvYmFsUGFyYW1zLCBlbGVtZW50KVxuXHR7XG5cdFx0dmFyIGVsZW1lbnRzID0gdGhpcy5maW5kRWxlbWVudHMoZ2xvYmFsUGFyYW1zLCBlbGVtZW50KSxcblx0XHRcdHByb3BlcnR5TmFtZSA9ICdpbm5lckhUTUwnLCBcblx0XHRcdGhpZ2hsaWdodGVyID0gbnVsbCxcblx0XHRcdGNvbmYgPSBzaC5jb25maWdcblx0XHRcdDtcblxuXHRcdGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIFxuXHRcdFx0cmV0dXJuO1xuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSBcblx0XHR7XG5cdFx0XHR2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldLFxuXHRcdFx0XHR0YXJnZXQgPSBlbGVtZW50LnRhcmdldCxcblx0XHRcdFx0cGFyYW1zID0gZWxlbWVudC5wYXJhbXMsXG5cdFx0XHRcdGJydXNoTmFtZSA9IHBhcmFtcy5icnVzaCxcblx0XHRcdFx0Y29kZVxuXHRcdFx0XHQ7XG5cblx0XHRcdGlmIChicnVzaE5hbWUgPT0gbnVsbClcblx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdC8vIEluc3RhbnRpYXRlIGEgYnJ1c2hcblx0XHRcdGlmIChwYXJhbXNbJ2h0bWwtc2NyaXB0J10gPT0gJ3RydWUnIHx8IHNoLmRlZmF1bHRzWydodG1sLXNjcmlwdCddID09IHRydWUpIFxuXHRcdFx0e1xuXHRcdFx0XHRoaWdobGlnaHRlciA9IG5ldyBzaC5IdG1sU2NyaXB0KGJydXNoTmFtZSk7XG5cdFx0XHRcdGJydXNoTmFtZSA9ICdodG1sc2NyaXB0Jztcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dmFyIGJydXNoID0gZmluZEJydXNoKGJydXNoTmFtZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoYnJ1c2gpXG5cdFx0XHRcdFx0aGlnaGxpZ2h0ZXIgPSBuZXcgYnJ1c2goKTtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb2RlID0gdGFyZ2V0W3Byb3BlcnR5TmFtZV07XG5cdFx0XHRcblx0XHRcdC8vIHJlbW92ZSBDREFUQSBmcm9tIDxTQ1JJUFQvPiB0YWdzIGlmIGl0J3MgcHJlc2VudFxuXHRcdFx0aWYgKGNvbmYudXNlU2NyaXB0VGFncylcblx0XHRcdFx0Y29kZSA9IHN0cmlwQ0RhdGEoY29kZSk7XG5cdFx0XHRcdFxuXHRcdFx0Ly8gSW5qZWN0IHRpdGxlIGlmIHRoZSBhdHRyaWJ1dGUgaXMgcHJlc2VudFxuXHRcdFx0aWYgKCh0YXJnZXQudGl0bGUgfHwgJycpICE9ICcnKVxuXHRcdFx0XHRwYXJhbXMudGl0bGUgPSB0YXJnZXQudGl0bGU7XG5cdFx0XHRcdFxuXHRcdFx0cGFyYW1zWydicnVzaCddID0gYnJ1c2hOYW1lO1xuXHRcdFx0aGlnaGxpZ2h0ZXIuaW5pdChwYXJhbXMpO1xuXHRcdFx0ZWxlbWVudCA9IGhpZ2hsaWdodGVyLmdldERpdihjb2RlKTtcblx0XHRcdFxuXHRcdFx0Ly8gY2Fycnkgb3ZlciBJRFxuXHRcdFx0aWYgKCh0YXJnZXQuaWQgfHwgJycpICE9ICcnKVxuXHRcdFx0XHRlbGVtZW50LmlkID0gdGFyZ2V0LmlkO1xuXHRcdFx0XG5cdFx0XHR0YXJnZXQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWxlbWVudCwgdGFyZ2V0KTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSBTeW50YXhIaWdobGlnaHRlci5cblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBPcHRpb25hbCBwYXJhbXMgdG8gYXBwbHkgdG8gYWxsIGhpZ2hsaWdodGVkIGVsZW1lbnRzLlxuXHQgKi9cblx0YWxsOiBmdW5jdGlvbihwYXJhbXMpXG5cdHtcblx0XHRhdHRhY2hFdmVudChcblx0XHRcdHdpbmRvdyxcblx0XHRcdCdsb2FkJyxcblx0XHRcdGZ1bmN0aW9uKCkgeyBzaC5oaWdobGlnaHQocGFyYW1zKTsgfVxuXHRcdCk7XG5cdH1cbn07IC8vIGVuZCBvZiBzaFxuXG4vKipcbiAqIENoZWNrcyBpZiB0YXJnZXQgRE9NIGVsZW1lbnRzIGhhcyBzcGVjaWZpZWQgQ1NTIGNsYXNzLlxuICogQHBhcmFtIHtET01FbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50IHRvIGNoZWNrLlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBOYW1lIG9mIHRoZSBDU1MgY2xhc3MgdG8gY2hlY2sgZm9yLlxuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGNsYXNzIG5hbWUgaXMgcHJlc2VudCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBoYXNDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0cmV0dXJuIHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZihjbGFzc05hbWUpICE9IC0xO1xufTtcblxuLyoqXG4gKiBBZGRzIENTUyBjbGFzcyBuYW1lIHRvIHRoZSB0YXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIE5ldyBDU1MgY2xhc3MgdG8gYWRkLlxuICovXG5mdW5jdGlvbiBhZGRDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0aWYgKCFoYXNDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSkpXG5cdFx0dGFyZ2V0LmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgQ1NTIGNsYXNzIG5hbWUgZnJvbSB0aGUgdGFyZ2V0IERPTSBlbGVtZW50LlxuICogQHBhcmFtIHtET01FbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50LlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBDU1MgY2xhc3MgdG8gcmVtb3ZlLlxuICovXG5mdW5jdGlvbiByZW1vdmVDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0dGFyZ2V0LmNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUucmVwbGFjZShjbGFzc05hbWUsICcnKTtcbn07XG5cbi8qKlxuICogQ29udmVydHMgdGhlIHNvdXJjZSB0byBhcnJheSBvYmplY3QuIE1vc3RseSB1c2VkIGZvciBmdW5jdGlvbiBhcmd1bWVudHMgYW5kIFxuICogbGlzdHMgcmV0dXJuZWQgYnkgZ2V0RWxlbWVudHNCeVRhZ05hbWUoKSB3aGljaCBhcmVuJ3QgQXJyYXkgb2JqZWN0cy5cbiAqIEBwYXJhbSB7TGlzdH0gc291cmNlIFNvdXJjZSBsaXN0LlxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHRvQXJyYXkoc291cmNlKVxue1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykgXG5cdFx0cmVzdWx0LnB1c2goc291cmNlW2ldKTtcblx0XHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogU3BsaXRzIGJsb2NrIG9mIHRleHQgaW50byBsaW5lcy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBibG9jayBCbG9jayBvZiB0ZXh0LlxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYXJyYXkgb2YgbGluZXMuXG4gKi9cbmZ1bmN0aW9uIHNwbGl0TGluZXMoYmxvY2spXG57XG5cdHJldHVybiBibG9jay5zcGxpdCgvXFxyP1xcbi8pO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBIVE1MIElEIGZvciB0aGUgaGlnaGxpZ2h0ZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gaGlnaGxpZ2h0ZXJJZCBIaWdobGlnaHRlciBJRC5cbiAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBIVE1MIElELlxuICovXG5mdW5jdGlvbiBnZXRIaWdobGlnaHRlcklkKGlkKVxue1xuXHR2YXIgcHJlZml4ID0gJ2hpZ2hsaWdodGVyXyc7XG5cdHJldHVybiBpZC5pbmRleE9mKHByZWZpeCkgPT0gMCA/IGlkIDogcHJlZml4ICsgaWQ7XG59O1xuXG4vKipcbiAqIEZpbmRzIEhpZ2hsaWdodGVyIGluc3RhbmNlIGJ5IElELlxuICogQHBhcmFtIHtTdHJpbmd9IGhpZ2hsaWdodGVySWQgSGlnaGxpZ2h0ZXIgSUQuXG4gKiBAcmV0dXJuIHtIaWdobGlnaHRlcn0gUmV0dXJucyBpbnN0YW5jZSBvZiB0aGUgaGlnaGxpZ2h0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodGVyQnlJZChpZClcbntcblx0cmV0dXJuIHNoLnZhcnMuaGlnaGxpZ2h0ZXJzW2dldEhpZ2hsaWdodGVySWQoaWQpXTtcbn07XG5cbi8qKlxuICogRmluZHMgaGlnaGxpZ2h0ZXIncyBESVYgY29udGFpbmVyLlxuICogQHBhcmFtIHtTdHJpbmd9IGhpZ2hsaWdodGVySWQgSGlnaGxpZ2h0ZXIgSUQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBSZXR1cm5zIGhpZ2hsaWdodGVyJ3MgRElWIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodGVyRGl2QnlJZChpZClcbntcblx0cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGdldEhpZ2hsaWdodGVySWQoaWQpKTtcbn07XG5cbi8qKlxuICogU3RvcmVzIGhpZ2hsaWdodGVyIHNvIHRoYXQgZ2V0SGlnaGxpZ2h0ZXJCeUlkKCkgY2FuIGRvIGl0cyB0aGluZy4gRWFjaFxuICogaGlnaGxpZ2h0ZXIgbXVzdCBjYWxsIHRoaXMgbWV0aG9kIHRvIHByZXNlcnZlIGl0c2VsZi5cbiAqIEBwYXJhbSB7SGlnaGlsZ2h0ZXJ9IGhpZ2hsaWdodGVyIEhpZ2hsaWdodGVyIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBzdG9yZUhpZ2hsaWdodGVyKGhpZ2hsaWdodGVyKVxue1xuXHRzaC52YXJzLmhpZ2hsaWdodGVyc1tnZXRIaWdobGlnaHRlcklkKGhpZ2hsaWdodGVyLmlkKV0gPSBoaWdobGlnaHRlcjtcbn07XG5cbi8qKlxuICogTG9va3MgZm9yIGEgY2hpbGQgb3IgcGFyZW50IG5vZGUgd2hpY2ggaGFzIHNwZWNpZmllZCBjbGFzc25hbWUuXG4gKiBFcXVpdmFsZW50IHRvIGpRdWVyeSdzICQoY29udGFpbmVyKS5maW5kKFwiLmNsYXNzTmFtZVwiKVxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VhcmNoIENsYXNzIG5hbWUgb3Igbm9kZSBuYW1lIHRvIGxvb2sgZm9yLlxuICogQHBhcmFtIHtCb29sZWFufSByZXZlcnNlIElmIHNldCB0byB0cnVlLCB3aWxsIGdvIHVwIHRoZSBub2RlIHRyZWUgaW5zdGVhZCBvZiBkb3duLlxuICogQHJldHVybiB7RWxlbWVudH0gUmV0dXJucyBmb3VuZCBjaGlsZCBvciBwYXJlbnQgZWxlbWVudCBvbiBudWxsLlxuICovXG5mdW5jdGlvbiBmaW5kRWxlbWVudCh0YXJnZXQsIHNlYXJjaCwgcmV2ZXJzZSAvKiBvcHRpb25hbCAqLylcbntcblx0aWYgKHRhcmdldCA9PSBudWxsKVxuXHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHR2YXIgbm9kZXNcdFx0XHQ9IHJldmVyc2UgIT0gdHJ1ZSA/IHRhcmdldC5jaGlsZE5vZGVzIDogWyB0YXJnZXQucGFyZW50Tm9kZSBdLFxuXHRcdHByb3BlcnR5VG9GaW5kXHQ9IHsgJyMnIDogJ2lkJywgJy4nIDogJ2NsYXNzTmFtZScgfVtzZWFyY2guc3Vic3RyKDAsIDEpXSB8fCAnbm9kZU5hbWUnLFxuXHRcdGV4cGVjdGVkVmFsdWUsXG5cdFx0Zm91bmRcblx0XHQ7XG5cblx0ZXhwZWN0ZWRWYWx1ZSA9IHByb3BlcnR5VG9GaW5kICE9ICdub2RlTmFtZSdcblx0XHQ/IHNlYXJjaC5zdWJzdHIoMSlcblx0XHQ6IHNlYXJjaC50b1VwcGVyQ2FzZSgpXG5cdFx0O1xuXHRcdFxuXHQvLyBtYWluIHJldHVybiBvZiB0aGUgZm91bmQgbm9kZVxuXHRpZiAoKHRhcmdldFtwcm9wZXJ0eVRvRmluZF0gfHwgJycpLmluZGV4T2YoZXhwZWN0ZWRWYWx1ZSkgIT0gLTEpXG5cdFx0cmV0dXJuIHRhcmdldDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBub2RlcyAmJiBpIDwgbm9kZXMubGVuZ3RoICYmIGZvdW5kID09IG51bGw7IGkrKylcblx0XHRmb3VuZCA9IGZpbmRFbGVtZW50KG5vZGVzW2ldLCBzZWFyY2gsIHJldmVyc2UpO1xuXHRcblx0cmV0dXJuIGZvdW5kO1xufTtcblxuLyoqXG4gKiBMb29rcyBmb3IgYSBwYXJlbnQgbm9kZSB3aGljaCBoYXMgc3BlY2lmaWVkIGNsYXNzbmFtZS5cbiAqIFRoaXMgaXMgYW4gYWxpYXMgdG8gPGNvZGU+ZmluZEVsZW1lbnQoY29udGFpbmVyLCBjbGFzc05hbWUsIHRydWUpPC9jb2RlPi5cbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFRhcmdldCBlbGVtZW50LlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBuYW1lIHRvIGxvb2sgZm9yLlxuICogQHJldHVybiB7RWxlbWVudH0gUmV0dXJucyBmb3VuZCBwYXJlbnQgZWxlbWVudCBvbiBudWxsLlxuICovXG5mdW5jdGlvbiBmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0cmV0dXJuIGZpbmRFbGVtZW50KHRhcmdldCwgY2xhc3NOYW1lLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRmluZHMgYW4gaW5kZXggb2YgZWxlbWVudCBpbiB0aGUgYXJyYXkuXG4gKiBAaWdub3JlXG4gKiBAcGFyYW0ge09iamVjdH0gc2VhcmNoRWxlbWVudFxuICogQHBhcmFtIHtOdW1iZXJ9IGZyb21JbmRleFxuICogQHJldHVybiB7TnVtYmVyfSBSZXR1cm5zIGluZGV4IG9mIGVsZW1lbnQgaWYgZm91bmQ7IC0xIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgc2VhcmNoRWxlbWVudCwgZnJvbUluZGV4KVxue1xuXHRmcm9tSW5kZXggPSBNYXRoLm1heChmcm9tSW5kZXggfHwgMCwgMCk7XG5cblx0Zm9yICh2YXIgaSA9IGZyb21JbmRleDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKVxuXHRcdGlmKGFycmF5W2ldID09IHNlYXJjaEVsZW1lbnQpXG5cdFx0XHRyZXR1cm4gaTtcblx0XG5cdHJldHVybiAtMTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdW5pcXVlIGVsZW1lbnQgSUQuXG4gKi9cbmZ1bmN0aW9uIGd1aWQocHJlZml4KVxue1xuXHRyZXR1cm4gKHByZWZpeCB8fCAnJykgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKS50b1N0cmluZygpO1xufTtcblxuLyoqXG4gKiBNZXJnZXMgdHdvIG9iamVjdHMuIFZhbHVlcyBmcm9tIG9iajIgb3ZlcnJpZGUgdmFsdWVzIGluIG9iajEuXG4gKiBGdW5jdGlvbiBpcyBOT1QgcmVjdXJzaXZlIGFuZCB3b3JrcyBvbmx5IGZvciBvbmUgZGltZW5zaW9uYWwgb2JqZWN0cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIEZpcnN0IG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoyIFNlY29uZCBvYmplY3QuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgY29tYmluYXRpb24gb2YgYm90aCBvYmplY3RzLlxuICovXG5mdW5jdGlvbiBtZXJnZShvYmoxLCBvYmoyKVxue1xuXHR2YXIgcmVzdWx0ID0ge30sIG5hbWU7XG5cblx0Zm9yIChuYW1lIGluIG9iajEpIFxuXHRcdHJlc3VsdFtuYW1lXSA9IG9iajFbbmFtZV07XG5cdFxuXHRmb3IgKG5hbWUgaW4gb2JqMikgXG5cdFx0cmVzdWx0W25hbWVdID0gb2JqMltuYW1lXTtcblx0XHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gY29udmVydCBzdHJpbmcgdG8gYm9vbGVhbi5cbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBJbnB1dCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgaW5wdXQgd2FzIFwidHJ1ZVwiLCBmYWxzZSBpZiBpbnB1dCB3YXMgXCJmYWxzZVwiIGFuZCB2YWx1ZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSlcbntcblx0dmFyIHJlc3VsdCA9IHsgXCJ0cnVlXCIgOiB0cnVlLCBcImZhbHNlXCIgOiBmYWxzZSB9W3ZhbHVlXTtcblx0cmV0dXJuIHJlc3VsdCA9PSBudWxsID8gdmFsdWUgOiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIE9wZW5zIHVwIGEgY2VudGVyZWQgcG9wdXAgd2luZG93LlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFx0XHRVUkwgdG8gb3BlbiBpbiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcdFx0UG9wdXAgbmFtZS5cbiAqIEBwYXJhbSB7aW50fSB3aWR0aFx0XHRQb3B1cCB3aWR0aC5cbiAqIEBwYXJhbSB7aW50fSBoZWlnaHRcdFx0UG9wdXAgaGVpZ2h0LlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnNcdHdpbmRvdy5vcGVuKCkgb3B0aW9ucy5cbiAqIEByZXR1cm4ge1dpbmRvd31cdFx0XHRSZXR1cm5zIHdpbmRvdyBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gcG9wdXAodXJsLCBuYW1lLCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKVxue1xuXHR2YXIgeCA9IChzY3JlZW4ud2lkdGggLSB3aWR0aCkgLyAyLFxuXHRcdHkgPSAoc2NyZWVuLmhlaWdodCAtIGhlaWdodCkgLyAyXG5cdFx0O1xuXHRcdFxuXHRvcHRpb25zICs9XHQnLCBsZWZ0PScgKyB4ICsgXG5cdFx0XHRcdCcsIHRvcD0nICsgeSArXG5cdFx0XHRcdCcsIHdpZHRoPScgKyB3aWR0aCArXG5cdFx0XHRcdCcsIGhlaWdodD0nICsgaGVpZ2h0XG5cdFx0O1xuXHRvcHRpb25zID0gb3B0aW9ucy5yZXBsYWNlKC9eLC8sICcnKTtcblxuXHR2YXIgd2luID0gd2luZG93Lm9wZW4odXJsLCBuYW1lLCBvcHRpb25zKTtcblx0d2luLmZvY3VzKCk7XG5cdHJldHVybiB3aW47XG59O1xuXG4vKipcbiAqIEFkZHMgZXZlbnQgaGFuZGxlciB0byB0aGUgdGFyZ2V0IG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcdFx0VGFyZ2V0IG9iamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXHRcdE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY1x0SGFuZGxpbmcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGF0dGFjaEV2ZW50KG9iaiwgdHlwZSwgZnVuYywgc2NvcGUpXG57XG5cdGZ1bmN0aW9uIGhhbmRsZXIoZSlcblx0e1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRcblx0XHRpZiAoIWUudGFyZ2V0KVxuXHRcdHtcblx0XHRcdGUudGFyZ2V0ID0gZS5zcmNFbGVtZW50O1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0XHRcblx0XHRmdW5jLmNhbGwoc2NvcGUgfHwgd2luZG93LCBlKTtcblx0fTtcblx0XG5cdGlmIChvYmouYXR0YWNoRXZlbnQpIFxuXHR7XG5cdFx0b2JqLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBoYW5kbGVyKTtcblx0fVxuXHRlbHNlIFxuXHR7XG5cdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuXHR9XG59O1xuXG4vKipcbiAqIERpc3BsYXlzIGFuIGFsZXJ0LlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBTdHJpbmcgdG8gZGlzcGxheS5cbiAqL1xuZnVuY3Rpb24gYWxlcnQoc3RyKVxue1xuXHR3aW5kb3cuYWxlcnQoc2guY29uZmlnLnN0cmluZ3MuYWxlcnQgKyBzdHIpO1xufTtcblxuLyoqXG4gKiBGaW5kcyBhIGJydXNoIGJ5IGl0cyBhbGlhcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWxpYXNcdFx0QnJ1c2ggYWxpYXMuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3dBbGVydFx0U3VwcHJlc3NlcyB0aGUgYWxlcnQgaWYgZmFsc2UuXG4gKiBAcmV0dXJuIHtCcnVzaH1cdFx0XHRcdFJldHVybnMgYnVyc2ggY29uc3RydWN0b3IgaWYgZm91bmQsIG51bGwgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBmaW5kQnJ1c2goYWxpYXMsIHNob3dBbGVydClcbntcblx0dmFyIGJydXNoZXMgPSBzaC52YXJzLmRpc2NvdmVyZWRCcnVzaGVzLFxuXHRcdHJlc3VsdCA9IG51bGxcblx0XHQ7XG5cdFxuXHRpZiAoYnJ1c2hlcyA9PSBudWxsKSBcblx0e1xuXHRcdGJydXNoZXMgPSB7fTtcblx0XHRcblx0XHQvLyBGaW5kIGFsbCBicnVzaGVzXG5cdFx0Zm9yICh2YXIgYnJ1c2ggaW4gc2guYnJ1c2hlcykgXG5cdFx0e1xuXHRcdFx0dmFyIGluZm8gPSBzaC5icnVzaGVzW2JydXNoXSxcblx0XHRcdFx0YWxpYXNlcyA9IGluZm8uYWxpYXNlc1xuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdGlmIChhbGlhc2VzID09IG51bGwpIFxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Ly8ga2VlcCB0aGUgYnJ1c2ggbmFtZVxuXHRcdFx0aW5mby5icnVzaE5hbWUgPSBicnVzaC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFsaWFzZXMubGVuZ3RoOyBpKyspIFxuXHRcdFx0XHRicnVzaGVzW2FsaWFzZXNbaV1dID0gYnJ1c2g7XG5cdFx0fVxuXHRcdFxuXHRcdHNoLnZhcnMuZGlzY292ZXJlZEJydXNoZXMgPSBicnVzaGVzO1xuXHR9XG5cdFxuXHRyZXN1bHQgPSBzaC5icnVzaGVzW2JydXNoZXNbYWxpYXNdXTtcblxuXHRpZiAocmVzdWx0ID09IG51bGwgJiYgc2hvd0FsZXJ0KVxuXHRcdGFsZXJ0KHNoLmNvbmZpZy5zdHJpbmdzLm5vQnJ1c2ggKyBhbGlhcyk7XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIGNhbGxiYWNrIG9uIGVhY2ggbGluZSBhbmQgcmVwbGFjZXMgZWFjaCBsaW5lIHdpdGggcmVzdWx0IGZyb20gdGhlIGNhbGxiYWNrLlxuICogQHBhcmFtIHtPYmplY3R9IHN0clx0XHRcdElucHV0IHN0cmluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjYWxsYmFja1x0XHRDYWxsYmFjayBmdW5jdGlvbiB0YWtpbmcgb25lIHN0cmluZyBhcmd1bWVudCBhbmQgcmV0dXJuaW5nIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBlYWNoTGluZShzdHIsIGNhbGxiYWNrKVxue1xuXHR2YXIgbGluZXMgPSBzcGxpdExpbmVzKHN0cik7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxuXHRcdGxpbmVzW2ldID0gY2FsbGJhY2sobGluZXNbaV0sIGkpO1xuXHRcdFxuXHQvLyBpbmNsdWRlIFxcciB0byBlbmFibGUgY29weS1wYXN0ZSBvbiB3aW5kb3dzIChpZTgpIHdpdGhvdXQgZ2V0dGluZyBldmVyeXRoaW5nIG9uIG9uZSBsaW5lXG5cdHJldHVybiBsaW5lcy5qb2luKCdcXHJcXG4nKTtcbn07XG5cbi8qKlxuICogVGhpcyBpcyBhIHNwZWNpYWwgdHJpbSB3aGljaCBvbmx5IHJlbW92ZXMgZmlyc3QgYW5kIGxhc3QgZW1wdHkgbGluZXNcbiAqIGFuZCBkb2Vzbid0IGFmZmVjdCB2YWxpZCBsZWFkaW5nIHNwYWNlIG9uIHRoZSBmaXJzdCBsaW5lLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyBzdHJpbmcgd2l0aG91dCBlbXB0eSBmaXJzdCBhbmQgbGFzdCBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gdHJpbUZpcnN0QW5kTGFzdExpbmVzKHN0cilcbntcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9eWyBdKltcXG5dK3xbXFxuXSpbIF0qJC9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFBhcnNlcyBrZXkvdmFsdWUgcGFpcnMgaW50byBoYXNoIG9iamVjdC5cbiAqIFxuICogVW5kZXJzdGFuZHMgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogLSBuYW1lOiB3b3JkO1xuICogLSBuYW1lOiBbd29yZCwgd29yZF07XG4gKiAtIG5hbWU6IFwic3RyaW5nXCI7XG4gKiAtIG5hbWU6ICdzdHJpbmcnO1xuICogXG4gKiBGb3IgZXhhbXBsZTpcbiAqICAgbmFtZTE6IHZhbHVlOyBuYW1lMjogW3ZhbHVlLCB2YWx1ZV07IG5hbWUzOiAndmFsdWUnXG4gKiAgIFxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgICBJbnB1dCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgIFJldHVybnMgZGVzZXJpYWxpemVkIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VQYXJhbXMoc3RyKVxue1xuXHR2YXIgbWF0Y2gsIFxuXHRcdHJlc3VsdCA9IHt9LFxuXHRcdGFycmF5UmVnZXggPSBuZXcgWFJlZ0V4cChcIl5cXFxcWyg/PHZhbHVlcz4oLio/KSlcXFxcXSRcIiksXG5cdFx0cmVnZXggPSBuZXcgWFJlZ0V4cChcblx0XHRcdFwiKD88bmFtZT5bXFxcXHctXSspXCIgK1xuXHRcdFx0XCJcXFxccyo6XFxcXHMqXCIgK1xuXHRcdFx0XCIoPzx2YWx1ZT5cIiArXG5cdFx0XHRcdFwiW1xcXFx3LSUjXSt8XCIgK1x0XHQvLyB3b3JkXG5cdFx0XHRcdFwiXFxcXFsuKj9cXFxcXXxcIiArXHRcdC8vIFtdIGFycmF5XG5cdFx0XHRcdCdcIi4qP1wifCcgK1x0XHRcdC8vIFwiXCIgc3RyaW5nXG5cdFx0XHRcdFwiJy4qPydcIiArXHRcdFx0Ly8gJycgc3RyaW5nXG5cdFx0XHRcIilcXFxccyo7P1wiLFxuXHRcdFx0XCJnXCJcblx0XHQpXG5cdFx0O1xuXG5cdHdoaWxlICgobWF0Y2ggPSByZWdleC5leGVjKHN0cikpICE9IG51bGwpIFxuXHR7XG5cdFx0dmFyIHZhbHVlID0gbWF0Y2gudmFsdWVcblx0XHRcdC5yZXBsYWNlKC9eWydcIl18WydcIl0kL2csICcnKSAvLyBzdHJpcCBxdW90ZXMgZnJvbSBlbmQgb2Ygc3RyaW5nc1xuXHRcdFx0O1xuXHRcdFxuXHRcdC8vIHRyeSB0byBwYXJzZSBhcnJheSB2YWx1ZVxuXHRcdGlmICh2YWx1ZSAhPSBudWxsICYmIGFycmF5UmVnZXgudGVzdCh2YWx1ZSkpXG5cdFx0e1xuXHRcdFx0dmFyIG0gPSBhcnJheVJlZ2V4LmV4ZWModmFsdWUpO1xuXHRcdFx0dmFsdWUgPSBtLnZhbHVlcy5sZW5ndGggPiAwID8gbS52YWx1ZXMuc3BsaXQoL1xccyosXFxzKi8pIDogW107XG5cdFx0fVxuXHRcdFxuXHRcdHJlc3VsdFttYXRjaC5uYW1lXSA9IHZhbHVlO1xuXHR9XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBXcmFwcyBlYWNoIGxpbmUgb2YgdGhlIHN0cmluZyBpbnRvIDxjb2RlLz4gdGFnIHdpdGggZ2l2ZW4gc3R5bGUgYXBwbGllZCB0byBpdC5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgIElucHV0IHN0cmluZy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjc3MgICBTdHlsZSBuYW1lIHRvIGFwcGx5IHRvIHRoZSBzdHJpbmcuXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyBpbnB1dCBzdHJpbmcgd2l0aCBlYWNoIGxpbmUgc3Vycm91bmRlZCBieSA8c3Bhbi8+IHRhZy5cbiAqL1xuZnVuY3Rpb24gd3JhcExpbmVzV2l0aENvZGUoc3RyLCBjc3MpXG57XG5cdGlmIChzdHIgPT0gbnVsbCB8fCBzdHIubGVuZ3RoID09IDAgfHwgc3RyID09ICdcXG4nKSBcblx0XHRyZXR1cm4gc3RyO1xuXG5cdHN0ciA9IHN0ci5yZXBsYWNlKC88L2csICcmbHQ7Jyk7XG5cblx0Ly8gUmVwbGFjZSB0d28gb3IgbW9yZSBzZXF1ZW50aWFsIHNwYWNlcyB3aXRoICZuYnNwOyBsZWF2aW5nIGxhc3Qgc3BhY2UgdW50b3VjaGVkLlxuXHRzdHIgPSBzdHIucmVwbGFjZSgvIHsyLH0vZywgZnVuY3Rpb24obSlcblx0e1xuXHRcdHZhciBzcGFjZXMgPSAnJztcblx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoIC0gMTsgaSsrKVxuXHRcdFx0c3BhY2VzICs9IHNoLmNvbmZpZy5zcGFjZTtcblx0XHRcblx0XHRyZXR1cm4gc3BhY2VzICsgJyAnO1xuXHR9KTtcblxuXHQvLyBTcGxpdCBlYWNoIGxpbmUgYW5kIGFwcGx5IDxzcGFuIGNsYXNzPVwiLi4uXCI+Li4uPC9zcGFuPiB0byB0aGVtIHNvIHRoYXRcblx0Ly8gbGVhZGluZyBzcGFjZXMgYXJlbid0IGluY2x1ZGVkLlxuXHRpZiAoY3NzICE9IG51bGwpIFxuXHRcdHN0ciA9IGVhY2hMaW5lKHN0ciwgZnVuY3Rpb24obGluZSlcblx0XHR7XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT0gMCkgXG5cdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFxuXHRcdFx0dmFyIHNwYWNlcyA9ICcnO1xuXHRcdFx0XG5cdFx0XHRsaW5lID0gbGluZS5yZXBsYWNlKC9eKCZuYnNwO3wgKSsvLCBmdW5jdGlvbihzKVxuXHRcdFx0e1xuXHRcdFx0XHRzcGFjZXMgPSBzO1xuXHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09IDApIFxuXHRcdFx0XHRyZXR1cm4gc3BhY2VzO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gc3BhY2VzICsgJzxjb2RlIGNsYXNzPVwiJyArIGNzcyArICdcIj4nICsgbGluZSArICc8L2NvZGU+Jztcblx0XHR9KTtcblxuXHRyZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBQYWRzIG51bWJlciB3aXRoIHplcm9zIHVudGlsIGl0J3MgbGVuZ3RoIGlzIHRoZSBzYW1lIGFzIGdpdmVuIGxlbmd0aC5cbiAqIFxuICogQHBhcmFtIHtOdW1iZXJ9IG51bWJlclx0TnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcdE1heCBzdHJpbmcgbGVuZ3RoIHdpdGguXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0UmV0dXJucyBhIHN0cmluZyBwYWRkZWQgd2l0aCBwcm9wZXIgYW1vdW50IG9mICcwJy5cbiAqL1xuZnVuY3Rpb24gcGFkTnVtYmVyKG51bWJlciwgbGVuZ3RoKVxue1xuXHR2YXIgcmVzdWx0ID0gbnVtYmVyLnRvU3RyaW5nKCk7XG5cdFxuXHR3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IGxlbmd0aClcblx0XHRyZXN1bHQgPSAnMCcgKyByZXN1bHQ7XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyB0YWJzIHdpdGggc3BhY2VzLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRTb3VyY2UgY29kZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0YWJTaXplXHRTaXplIG9mIHRoZSB0YWIuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0UmV0dXJucyBjb2RlIHdpdGggYWxsIHRhYnMgcmVwbGFjZXMgYnkgc3BhY2VzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzVGFicyhjb2RlLCB0YWJTaXplKVxue1xuXHR2YXIgdGFiID0gJyc7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRhYlNpemU7IGkrKylcblx0XHR0YWIgKz0gJyAnO1xuXG5cdHJldHVybiBjb2RlLnJlcGxhY2UoL1xcdC9nLCB0YWIpO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyB0YWJzIHdpdGggc21hcnQgc3BhY2VzLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZSAgICBDb2RlIHRvIGZpeCB0aGUgdGFicyBpbi5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0YWJTaXplIE51bWJlciBvZiBzcGFjZXMgaW4gYSBjb2x1bW4uXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgICBSZXR1cm5zIGNvZGUgd2l0aCBhbGwgdGFicyByZXBsYWNlcyB3aXRoIHJvcGVyIGFtb3VudCBvZiBzcGFjZXMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NTbWFydFRhYnMoY29kZSwgdGFiU2l6ZSlcbntcblx0dmFyIGxpbmVzID0gc3BsaXRMaW5lcyhjb2RlKSxcblx0XHR0YWIgPSAnXFx0Jyxcblx0XHRzcGFjZXMgPSAnJ1xuXHRcdDtcblx0XG5cdC8vIENyZWF0ZSBhIHN0cmluZyB3aXRoIDEwMDAgc3BhY2VzIHRvIGNvcHkgc3BhY2VzIGZyb20uLi4gXG5cdC8vIEl0J3MgYXNzdW1lZCB0aGF0IHRoZXJlIHdvdWxkIGJlIG5vIGluZGVudGF0aW9uIGxvbmdlciB0aGFuIHRoYXQuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgNTA7IGkrKykgXG5cdFx0c3BhY2VzICs9ICcgICAgICAgICAgICAgICAgICAgICc7IC8vIDIwIHNwYWNlcyAqIDUwXG5cdFx0XHRcblx0Ly8gVGhpcyBmdW5jdGlvbiBpbnNlcnRzIHNwZWNpZmllZCBhbW91bnQgb2Ygc3BhY2VzIGluIHRoZSBzdHJpbmdcblx0Ly8gd2hlcmUgYSB0YWIgaXMgd2hpbGUgcmVtb3ZpbmcgdGhhdCBnaXZlbiB0YWIuXG5cdGZ1bmN0aW9uIGluc2VydFNwYWNlcyhsaW5lLCBwb3MsIGNvdW50KVxuXHR7XG5cdFx0cmV0dXJuIGxpbmUuc3Vic3RyKDAsIHBvcylcblx0XHRcdCsgc3BhY2VzLnN1YnN0cigwLCBjb3VudClcblx0XHRcdCsgbGluZS5zdWJzdHIocG9zICsgMSwgbGluZS5sZW5ndGgpIC8vIHBvcyArIDEgd2lsbCBnZXQgcmlkIG9mIHRoZSB0YWJcblx0XHRcdDtcblx0fTtcblxuXHQvLyBHbyB0aHJvdWdoIGFsbCB0aGUgbGluZXMgYW5kIGRvIHRoZSAnc21hcnQgdGFicycgbWFnaWMuXG5cdGNvZGUgPSBlYWNoTGluZShjb2RlLCBmdW5jdGlvbihsaW5lKVxuXHR7XG5cdFx0aWYgKGxpbmUuaW5kZXhPZih0YWIpID09IC0xKSBcblx0XHRcdHJldHVybiBsaW5lO1xuXHRcdFxuXHRcdHZhciBwb3MgPSAwO1xuXHRcdFxuXHRcdHdoaWxlICgocG9zID0gbGluZS5pbmRleE9mKHRhYikpICE9IC0xKSBcblx0XHR7XG5cdFx0XHQvLyBUaGlzIGlzIHByZXR0eSBtdWNoIGFsbCB0aGVyZSBpcyB0byB0aGUgJ3NtYXJ0IHRhYnMnIGxvZ2ljLlxuXHRcdFx0Ly8gQmFzZWQgb24gdGhlIHBvc2l0aW9uIHdpdGhpbiB0aGUgbGluZSBhbmQgc2l6ZSBvZiBhIHRhYixcblx0XHRcdC8vIGNhbGN1bGF0ZSB0aGUgYW1vdW50IG9mIHNwYWNlcyB3ZSBuZWVkIHRvIGluc2VydC5cblx0XHRcdHZhciBzcGFjZXMgPSB0YWJTaXplIC0gcG9zICUgdGFiU2l6ZTtcblx0XHRcdGxpbmUgPSBpbnNlcnRTcGFjZXMobGluZSwgcG9zLCBzcGFjZXMpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbGluZTtcblx0fSk7XG5cdFxuXHRyZXR1cm4gY29kZTtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgdmFyaW91cyBzdHJpbmcgZml4ZXMgYmFzZWQgb24gY29uZmlndXJhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZml4SW5wdXRTdHJpbmcoc3RyKVxue1xuXHR2YXIgYnIgPSAvPGJyXFxzKlxcLz8+fCZsdDticlxccypcXC8/Jmd0Oy9naTtcblx0XG5cdGlmIChzaC5jb25maWcuYmxvZ2dlck1vZGUgPT0gdHJ1ZSlcblx0XHRzdHIgPSBzdHIucmVwbGFjZShiciwgJ1xcbicpO1xuXG5cdGlmIChzaC5jb25maWcuc3RyaXBCcnMgPT0gdHJ1ZSlcblx0XHRzdHIgPSBzdHIucmVwbGFjZShiciwgJycpO1xuXHRcdFxuXHRyZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCB3aGl0ZSBzcGFjZSBhdCB0aGUgYmVnaW5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZy5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgIFN0cmluZyB0byB0cmltLlxuICogQHJldHVybiB7U3RyaW5nfSAgICAgIFJldHVybnMgc3RyaW5nIHdpdGhvdXQgbGVhZGluZyBhbmQgZm9sbG93aW5nIHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMuXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKVxue1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn07XG5cbi8qKlxuICogVW5pbmRlbnRzIGEgYmxvY2sgb2YgdGV4dCBieSB0aGUgbG93ZXN0IGNvbW1vbiBpbmRlbnQgYW1vdW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgIFRleHQgdG8gdW5pbmRlbnQuXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyB1bmluZGVudGVkIHRleHQgYmxvY2suXG4gKi9cbmZ1bmN0aW9uIHVuaW5kZW50KHN0cilcbntcblx0dmFyIGxpbmVzID0gc3BsaXRMaW5lcyhmaXhJbnB1dFN0cmluZyhzdHIpKSxcblx0XHRpbmRlbnRzID0gbmV3IEFycmF5KCksXG5cdFx0cmVnZXggPSAvXlxccyovLFxuXHRcdG1pbiA9IDEwMDBcblx0XHQ7XG5cdFxuXHQvLyBnbyB0aHJvdWdoIGV2ZXJ5IGxpbmUgYW5kIGNoZWNrIGZvciBjb21tb24gbnVtYmVyIG9mIGluZGVudHNcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGggJiYgbWluID4gMDsgaSsrKSBcblx0e1xuXHRcdHZhciBsaW5lID0gbGluZXNbaV07XG5cdFx0XG5cdFx0aWYgKHRyaW0obGluZSkubGVuZ3RoID09IDApIFxuXHRcdFx0Y29udGludWU7XG5cdFx0XG5cdFx0dmFyIG1hdGNoZXMgPSByZWdleC5leGVjKGxpbmUpO1xuXHRcdFxuXHRcdC8vIEluIHRoZSBldmVudCB0aGF0IGp1c3Qgb25lIGxpbmUgZG9lc24ndCBoYXZlIGxlYWRpbmcgd2hpdGUgc3BhY2Vcblx0XHQvLyB3ZSBjYW4ndCB1bmluZGVudCBhbnl0aGluZywgc28gYmFpbCBjb21wbGV0ZWx5LlxuXHRcdGlmIChtYXRjaGVzID09IG51bGwpIFxuXHRcdFx0cmV0dXJuIHN0cjtcblx0XHRcdFxuXHRcdG1pbiA9IE1hdGgubWluKG1hdGNoZXNbMF0ubGVuZ3RoLCBtaW4pO1xuXHR9XG5cdFxuXHQvLyB0cmltIG1pbmltdW0gY29tbW9uIG51bWJlciBvZiB3aGl0ZSBzcGFjZSBmcm9tIHRoZSBiZWdpbmluZyBvZiBldmVyeSBsaW5lXG5cdGlmIChtaW4gPiAwKSBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSBcblx0XHRcdGxpbmVzW2ldID0gbGluZXNbaV0uc3Vic3RyKG1pbik7XG5cdFxuXHRyZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59O1xuXG4vKipcbiAqIENhbGxiYWNrIG1ldGhvZCBmb3IgQXJyYXkuc29ydCgpIHdoaWNoIHNvcnRzIG1hdGNoZXMgYnlcbiAqIGluZGV4IHBvc2l0aW9uIGFuZCB0aGVuIGJ5IGxlbmd0aC5cbiAqIFxuICogQHBhcmFtIHtNYXRjaH0gbTFcdExlZnQgb2JqZWN0LlxuICogQHBhcmFtIHtNYXRjaH0gbTIgICAgUmlnaHQgb2JqZWN0LlxuICogQHJldHVybiB7TnVtYmVyfSAgICAgUmV0dXJucyAtMSwgMCBvciAtMSBhcyBhIGNvbXBhcmlzb24gcmVzdWx0LlxuICovXG5mdW5jdGlvbiBtYXRjaGVzU29ydENhbGxiYWNrKG0xLCBtMilcbntcblx0Ly8gc29ydCBtYXRjaGVzIGJ5IGluZGV4IGZpcnN0XG5cdGlmKG0xLmluZGV4IDwgbTIuaW5kZXgpXG5cdFx0cmV0dXJuIC0xO1xuXHRlbHNlIGlmKG0xLmluZGV4ID4gbTIuaW5kZXgpXG5cdFx0cmV0dXJuIDE7XG5cdGVsc2Vcblx0e1xuXHRcdC8vIGlmIGluZGV4IGlzIHRoZSBzYW1lLCBzb3J0IGJ5IGxlbmd0aFxuXHRcdGlmKG0xLmxlbmd0aCA8IG0yLmxlbmd0aClcblx0XHRcdHJldHVybiAtMTtcblx0XHRlbHNlIGlmKG0xLmxlbmd0aCA+IG0yLmxlbmd0aClcblx0XHRcdHJldHVybiAxO1xuXHR9XG5cdFxuXHRyZXR1cm4gMDtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIG9uIHByb3ZpZGVkIGNvZGUgYW5kIHJldHVybnMgYWxsXG4gKiBtYXRjaGVzIHRoYXQgYXJlIGZvdW5kLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZSAgICBDb2RlIHRvIGV4ZWN1dGUgcmVndWxhciBleHByZXNzaW9uIG9uLlxuICogQHBhcmFtIHtPYmplY3R9IHJlZ2V4ICAgUmVndWxhciBleHByZXNzaW9uIGl0ZW0gaW5mbyBmcm9tIDxjb2RlPnJlZ2V4TGlzdDwvY29kZT4gY29sbGVjdGlvbi5cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgIFJldHVybnMgYSBsaXN0IG9mIE1hdGNoIG9iamVjdHMuXG4gKi8gXG5mdW5jdGlvbiBnZXRNYXRjaGVzKGNvZGUsIHJlZ2V4SW5mbylcbntcblx0ZnVuY3Rpb24gZGVmYXVsdEFkZChtYXRjaCwgcmVnZXhJbmZvKVxuXHR7XG5cdFx0cmV0dXJuIG1hdGNoWzBdO1xuXHR9O1xuXHRcblx0dmFyIGluZGV4ID0gMCxcblx0XHRtYXRjaCA9IG51bGwsXG5cdFx0bWF0Y2hlcyA9IFtdLFxuXHRcdGZ1bmMgPSByZWdleEluZm8uZnVuYyA/IHJlZ2V4SW5mby5mdW5jIDogZGVmYXVsdEFkZFxuXHRcdDtcblx0XG5cdHdoaWxlKChtYXRjaCA9IHJlZ2V4SW5mby5yZWdleC5leGVjKGNvZGUpKSAhPSBudWxsKVxuXHR7XG5cdFx0dmFyIHJlc3VsdE1hdGNoID0gZnVuYyhtYXRjaCwgcmVnZXhJbmZvKTtcblx0XHRcblx0XHRpZiAodHlwZW9mKHJlc3VsdE1hdGNoKSA9PSAnc3RyaW5nJylcblx0XHRcdHJlc3VsdE1hdGNoID0gW25ldyBzaC5NYXRjaChyZXN1bHRNYXRjaCwgbWF0Y2guaW5kZXgsIHJlZ2V4SW5mby5jc3MpXTtcblxuXHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHRNYXRjaCk7XG5cdH1cblx0XG5cdHJldHVybiBtYXRjaGVzO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbGwgVVJMcyBpbiB0aGUgY29kZSBpbnRvIDxhLz4gdGFncy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlIElucHV0IGNvZGUuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgY29kZSB3aXRoIDwvYT4gdGFncy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1VybHMoY29kZSlcbntcblx0dmFyIGd0ID0gLyguKikoKCZndDt8Jmx0OykuKikvO1xuXHRcblx0cmV0dXJuIGNvZGUucmVwbGFjZShzaC5yZWdleExpYi51cmwsIGZ1bmN0aW9uKG0pXG5cdHtcblx0XHR2YXIgc3VmZml4ID0gJycsXG5cdFx0XHRtYXRjaCA9IG51bGxcblx0XHRcdDtcblx0XHRcblx0XHQvLyBXZSBpbmNsdWRlICZsdDsgYW5kICZndDsgaW4gdGhlIFVSTCBmb3IgdGhlIGNvbW1vbiBjYXNlcyBsaWtlIDxodHRwOi8vZ29vZ2xlLmNvbT5cblx0XHQvLyBUaGUgcHJvYmxlbSBpcyB0aGF0IHRoZXkgZ2V0IHRyYW5zZm9ybWVkIGludG8gJmx0O2h0dHA6Ly9nb29nbGUuY29tJmd0O1xuXHRcdC8vIFdoZXJlIGFzICZndDsgZWFzaWx5IGxvb2tzIGxpa2UgcGFydCBvZiB0aGUgVVJMIHN0cmluZy5cblx0XG5cdFx0aWYgKG1hdGNoID0gZ3QuZXhlYyhtKSlcblx0XHR7XG5cdFx0XHRtID0gbWF0Y2hbMV07XG5cdFx0XHRzdWZmaXggPSBtYXRjaFsyXTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuICc8YSBocmVmPVwiJyArIG0gKyAnXCI+JyArIG0gKyAnPC9hPicgKyBzdWZmaXg7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBGaW5kcyBhbGwgPFNDUklQVCBUWVBFPVwic3ludGF4aGlnaGxpZ2h0ZXJcIiAvPiBlbGVtZW50c3MuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhcnJheSBvZiBhbGwgZm91bmQgU3ludGF4SGlnaGxpZ2h0ZXIgdGFncy5cbiAqL1xuZnVuY3Rpb24gZ2V0U3ludGF4SGlnaGxpZ2h0ZXJTY3JpcHRUYWdzKClcbntcblx0dmFyIHRhZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksXG5cdFx0cmVzdWx0ID0gW11cblx0XHQ7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRhZ3MubGVuZ3RoOyBpKyspXG5cdFx0aWYgKHRhZ3NbaV0udHlwZSA9PSAnc3ludGF4aGlnaGxpZ2h0ZXInKVxuXHRcdFx0cmVzdWx0LnB1c2godGFnc1tpXSk7XG5cdFx0XHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogU3RyaXBzIDwhW0NEQVRBW11dPiBmcm9tIDxTQ1JJUFQgLz4gY29udGVudCBiZWNhdXNlIGl0IHNob3VsZCBiZSB1c2VkXG4gKiB0aGVyZSBpbiBtb3N0IGNhc2VzIGZvciBYSFRNTCBjb21wbGlhbmNlLlxuICogQHBhcmFtIHtTdHJpbmd9IG9yaWdpbmFsXHRJbnB1dCBjb2RlLlxuICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIGNvZGUgd2l0aG91dCBsZWFkaW5nIDwhW0NEQVRBW11dPiB0YWdzLlxuICovXG5mdW5jdGlvbiBzdHJpcENEYXRhKG9yaWdpbmFsKVxue1xuXHR2YXIgbGVmdCA9ICc8IVtDREFUQVsnLFxuXHRcdHJpZ2h0ID0gJ11dPicsXG5cdFx0Ly8gZm9yIHNvbWUgcmVhc29uIElFIGluc2VydHMgc29tZSBsZWFkaW5nIGJsYW5rcyBoZXJlXG5cdFx0Y29weSA9IHRyaW0ob3JpZ2luYWwpLFxuXHRcdGNoYW5nZWQgPSBmYWxzZSxcblx0XHRsZWZ0TGVuZ3RoID0gbGVmdC5sZW5ndGgsXG5cdFx0cmlnaHRMZW5ndGggPSByaWdodC5sZW5ndGhcblx0XHQ7XG5cdFxuXHRpZiAoY29weS5pbmRleE9mKGxlZnQpID09IDApXG5cdHtcblx0XHRjb3B5ID0gY29weS5zdWJzdHJpbmcobGVmdExlbmd0aCk7XG5cdFx0Y2hhbmdlZCA9IHRydWU7XG5cdH1cblx0XG5cdHZhciBjb3B5TGVuZ3RoID0gY29weS5sZW5ndGg7XG5cdFxuXHRpZiAoY29weS5pbmRleE9mKHJpZ2h0KSA9PSBjb3B5TGVuZ3RoIC0gcmlnaHRMZW5ndGgpXG5cdHtcblx0XHRjb3B5ID0gY29weS5zdWJzdHJpbmcoMCwgY29weUxlbmd0aCAtIHJpZ2h0TGVuZ3RoKTtcblx0XHRjaGFuZ2VkID0gdHJ1ZTtcblx0fVxuXHRcblx0cmV0dXJuIGNoYW5nZWQgPyBjb3B5IDogb3JpZ2luYWw7XG59O1xuXG5cbi8qKlxuICogUXVpY2sgY29kZSBtb3VzZSBkb3VibGUgY2xpY2sgaGFuZGxlci5cbiAqL1xuZnVuY3Rpb24gcXVpY2tDb2RlSGFuZGxlcihlKVxue1xuXHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQsXG5cdFx0aGlnaGxpZ2h0ZXJEaXYgPSBmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsICcuc3ludGF4aGlnaGxpZ2h0ZXInKSxcblx0XHRjb250YWluZXIgPSBmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsICcuY29udGFpbmVyJyksXG5cdFx0dGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpLFxuXHRcdGhpZ2hsaWdodGVyXG5cdFx0O1xuXG5cdGlmICghY29udGFpbmVyIHx8ICFoaWdobGlnaHRlckRpdiB8fCBmaW5kRWxlbWVudChjb250YWluZXIsICd0ZXh0YXJlYScpKVxuXHRcdHJldHVybjtcblxuXHRoaWdobGlnaHRlciA9IGdldEhpZ2hsaWdodGVyQnlJZChoaWdobGlnaHRlckRpdi5pZCk7XG5cdFxuXHQvLyBhZGQgc291cmNlIGNsYXNzIG5hbWVcblx0YWRkQ2xhc3MoaGlnaGxpZ2h0ZXJEaXYsICdzb3VyY2UnKTtcblxuXHQvLyBIYXZlIHRvIGdvIG92ZXIgZWFjaCBsaW5lIGFuZCBncmFiIGl0J3MgdGV4dCwgY2FuJ3QganVzdCBkbyBpdCBvbiB0aGVcblx0Ly8gY29udGFpbmVyIGJlY2F1c2UgRmlyZWZveCBsb3NlcyBhbGwgXFxuIHdoZXJlIGFzIFdlYmtpdCBkb2Vzbid0LlxuXHR2YXIgbGluZXMgPSBjb250YWluZXIuY2hpbGROb2Rlcyxcblx0XHRjb2RlID0gW11cblx0XHQ7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxuXHRcdGNvZGUucHVzaChsaW5lc1tpXS5pbm5lclRleHQgfHwgbGluZXNbaV0udGV4dENvbnRlbnQpO1xuXHRcblx0Ly8gdXNpbmcgXFxyIGluc3RlYWQgb2YgXFxyIG9yIFxcclxcbiBtYWtlcyB0aGlzIHdvcmsgZXF1YWxseSB3ZWxsIG9uIElFLCBGRiBhbmQgV2Via2l0XG5cdGNvZGUgPSBjb2RlLmpvaW4oJ1xccicpO1xuXG4gICAgLy8gRm9yIFdlYmtpdCBicm93c2VycywgcmVwbGFjZSBuYnNwIHdpdGggYSBicmVha2luZyBzcGFjZVxuICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL1xcdTAwYTAvZywgXCIgXCIpO1xuXHRcblx0Ly8gaW5qZWN0IDx0ZXh0YXJlYS8+IHRhZ1xuXHR0ZXh0YXJlYS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjb2RlKSk7XG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cdFxuXHQvLyBwcmVzZWxlY3QgYWxsIHRleHRcblx0dGV4dGFyZWEuZm9jdXMoKTtcblx0dGV4dGFyZWEuc2VsZWN0KCk7XG5cdFxuXHQvLyBzZXQgdXAgaGFuZGxlciBmb3IgbG9zdCBmb2N1c1xuXHRhdHRhY2hFdmVudCh0ZXh0YXJlYSwgJ2JsdXInLCBmdW5jdGlvbihlKVxuXHR7XG5cdFx0dGV4dGFyZWEucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0ZXh0YXJlYSk7XG5cdFx0cmVtb3ZlQ2xhc3MoaGlnaGxpZ2h0ZXJEaXYsICdzb3VyY2UnKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIE1hdGNoIG9iamVjdC5cbiAqL1xuc2guTWF0Y2ggPSBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNzcylcbntcblx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR0aGlzLmluZGV4ID0gaW5kZXg7XG5cdHRoaXMubGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXHR0aGlzLmNzcyA9IGNzcztcblx0dGhpcy5icnVzaE5hbWUgPSBudWxsO1xufTtcblxuc2guTWF0Y2gucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKVxue1xuXHRyZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cbi8qKlxuICogU2ltdWxhdGVzIEhUTUwgY29kZSB3aXRoIGEgc2NyaXB0aW5nIGxhbmd1YWdlIGVtYmVkZGVkLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc2NyaXB0QnJ1c2hOYW1lIEJydXNoIG5hbWUgb2YgdGhlIHNjcmlwdGluZyBsYW5ndWFnZS5cbiAqL1xuc2guSHRtbFNjcmlwdCA9IGZ1bmN0aW9uKHNjcmlwdEJydXNoTmFtZSlcbntcblx0dmFyIGJydXNoQ2xhc3MgPSBmaW5kQnJ1c2goc2NyaXB0QnJ1c2hOYW1lKSxcblx0XHRzY3JpcHRCcnVzaCxcblx0XHR4bWxCcnVzaCA9IG5ldyBzaC5icnVzaGVzLlhtbCgpLFxuXHRcdGJyYWNrZXRzUmVnZXggPSBudWxsLFxuXHRcdHJlZiA9IHRoaXMsXG5cdFx0bWV0aG9kc1RvRXhwb3NlID0gJ2dldERpdiBnZXRIdG1sIGluaXQnLnNwbGl0KCcgJylcblx0XHQ7XG5cblx0aWYgKGJydXNoQ2xhc3MgPT0gbnVsbClcblx0XHRyZXR1cm47XG5cdFxuXHRzY3JpcHRCcnVzaCA9IG5ldyBicnVzaENsYXNzKCk7XG5cdFxuXHRmb3IodmFyIGkgPSAwOyBpIDwgbWV0aG9kc1RvRXhwb3NlLmxlbmd0aDsgaSsrKVxuXHRcdC8vIG1ha2UgYSBjbG9zdXJlIHNvIHdlIGRvbid0IGxvc2UgdGhlIG5hbWUgYWZ0ZXIgaSBjaGFuZ2VzXG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5hbWUgPSBtZXRob2RzVG9FeHBvc2VbaV07XG5cdFx0XHRcblx0XHRcdHJlZltuYW1lXSA9IGZ1bmN0aW9uKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHhtbEJydXNoW25hbWVdLmFwcGx5KHhtbEJydXNoLCBhcmd1bWVudHMpO1xuXHRcdFx0fTtcblx0XHR9KSgpO1xuXHRcblx0aWYgKHNjcmlwdEJydXNoLmh0bWxTY3JpcHQgPT0gbnVsbClcblx0e1xuXHRcdGFsZXJ0KHNoLmNvbmZpZy5zdHJpbmdzLmJydXNoTm90SHRtbFNjcmlwdCArIHNjcmlwdEJydXNoTmFtZSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdFxuXHR4bWxCcnVzaC5yZWdleExpc3QucHVzaChcblx0XHR7IHJlZ2V4OiBzY3JpcHRCcnVzaC5odG1sU2NyaXB0LmNvZGUsIGZ1bmM6IHByb2Nlc3MgfVxuXHQpO1xuXHRcblx0ZnVuY3Rpb24gb2Zmc2V0TWF0Y2hlcyhtYXRjaGVzLCBvZmZzZXQpXG5cdHtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG1hdGNoZXMubGVuZ3RoOyBqKyspIFxuXHRcdFx0bWF0Y2hlc1tqXS5pbmRleCArPSBvZmZzZXQ7XG5cdH1cblx0XG5cdGZ1bmN0aW9uIHByb2Nlc3MobWF0Y2gsIGluZm8pXG5cdHtcblx0XHR2YXIgY29kZSA9IG1hdGNoLmNvZGUsXG5cdFx0XHRtYXRjaGVzID0gW10sXG5cdFx0XHRyZWdleExpc3QgPSBzY3JpcHRCcnVzaC5yZWdleExpc3QsXG5cdFx0XHRvZmZzZXQgPSBtYXRjaC5pbmRleCArIG1hdGNoLmxlZnQubGVuZ3RoLFxuXHRcdFx0aHRtbFNjcmlwdCA9IHNjcmlwdEJydXNoLmh0bWxTY3JpcHQsXG5cdFx0XHRyZXN1bHRcblx0XHRcdDtcblxuXHRcdC8vIGFkZCBhbGwgbWF0Y2hlcyBmcm9tIHRoZSBjb2RlXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZWdleExpc3QubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0cmVzdWx0ID0gZ2V0TWF0Y2hlcyhjb2RlLCByZWdleExpc3RbaV0pO1xuXHRcdFx0b2Zmc2V0TWF0Y2hlcyhyZXN1bHQsIG9mZnNldCk7XG5cdFx0XHRtYXRjaGVzID0gbWF0Y2hlcy5jb25jYXQocmVzdWx0KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gYWRkIGxlZnQgc2NyaXB0IGJyYWNrZXRcblx0XHRpZiAoaHRtbFNjcmlwdC5sZWZ0ICE9IG51bGwgJiYgbWF0Y2gubGVmdCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdHJlc3VsdCA9IGdldE1hdGNoZXMobWF0Y2gubGVmdCwgaHRtbFNjcmlwdC5sZWZ0KTtcblx0XHRcdG9mZnNldE1hdGNoZXMocmVzdWx0LCBtYXRjaC5pbmRleCk7XG5cdFx0XHRtYXRjaGVzID0gbWF0Y2hlcy5jb25jYXQocmVzdWx0KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gYWRkIHJpZ2h0IHNjcmlwdCBicmFja2V0XG5cdFx0aWYgKGh0bWxTY3JpcHQucmlnaHQgIT0gbnVsbCAmJiBtYXRjaC5yaWdodCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdHJlc3VsdCA9IGdldE1hdGNoZXMobWF0Y2gucmlnaHQsIGh0bWxTY3JpcHQucmlnaHQpO1xuXHRcdFx0b2Zmc2V0TWF0Y2hlcyhyZXN1bHQsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGFzdEluZGV4T2YobWF0Y2gucmlnaHQpKTtcblx0XHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHQpO1xuXHRcdH1cblx0XHRcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG1hdGNoZXMubGVuZ3RoOyBqKyspXG5cdFx0XHRtYXRjaGVzW2pdLmJydXNoTmFtZSA9IGJydXNoQ2xhc3MuYnJ1c2hOYW1lO1xuXHRcdFx0XG5cdFx0cmV0dXJuIG1hdGNoZXM7XG5cdH1cbn07XG5cbi8qKlxuICogTWFpbiBIaWdobGl0aGVyIGNsYXNzLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnNoLkhpZ2hsaWdodGVyID0gZnVuY3Rpb24oKVxue1xuXHQvLyBub3QgcHV0dGluZyBhbnkgY29kZSBpbiBoZXJlIGJlY2F1c2Ugb2YgdGhlIHByb3RvdHlwZSBpbmhlcml0YW5jZVxufTtcblxuc2guSGlnaGxpZ2h0ZXIucHJvdG90eXBlID0ge1xuXHQvKipcblx0ICogUmV0dXJucyB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgaGlnaGxpZ2h0ZXIuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXHRcdFx0XHROYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0VmFsdWVcdFx0RGVmYXVsdCB2YWx1ZS5cblx0ICogQHJldHVybiB7T2JqZWN0fVx0XHRcdFx0XHRSZXR1cm5zIGZvdW5kIHZhbHVlIG9yIGRlZmF1bHQgdmFsdWUgb3RoZXJ3aXNlLlxuXHQgKi9cblx0Z2V0UGFyYW06IGZ1bmN0aW9uKG5hbWUsIGRlZmF1bHRWYWx1ZSlcblx0e1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLnBhcmFtc1tuYW1lXTtcblx0XHRyZXR1cm4gdG9Cb29sZWFuKHJlc3VsdCA9PSBudWxsID8gZGVmYXVsdFZhbHVlIDogcmVzdWx0KTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTaG9ydGN1dCB0byBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXHRcdE5hbWUgb2YgdGhlIGVsZW1lbnQgdG8gY3JlYXRlIChESVYsIEEsIGV0YykuXG5cdCAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVx0UmV0dXJucyBuZXcgSFRNTCBlbGVtZW50LlxuXHQgKi9cblx0Y3JlYXRlOiBmdW5jdGlvbihuYW1lKVxuXHR7XG5cdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQXBwbGllcyBhbGwgcmVndWxhciBleHByZXNzaW9uIHRvIHRoZSBjb2RlIGFuZCBzdG9yZXMgYWxsIGZvdW5kXG5cdCAqIG1hdGNoZXMgaW4gdGhlIGB0aGlzLm1hdGNoZXNgIGFycmF5LlxuXHQgKiBAcGFyYW0ge0FycmF5fSByZWdleExpc3RcdFx0TGlzdCBvZiByZWd1bGFyIGV4cHJlc3Npb25zLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRcdFNvdXJjZSBjb2RlLlxuXHQgKiBAcmV0dXJuIHtBcnJheX1cdFx0XHRcdFJldHVybnMgbGlzdCBvZiBtYXRjaGVzLlxuXHQgKi9cblx0ZmluZE1hdGNoZXM6IGZ1bmN0aW9uKHJlZ2V4TGlzdCwgY29kZSlcblx0e1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHRcblx0XHRpZiAocmVnZXhMaXN0ICE9IG51bGwpXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2V4TGlzdC5sZW5ndGg7IGkrKykgXG5cdFx0XHRcdC8vIEJVRzogbGVuZ3RoIHJldHVybnMgbGVuKzEgZm9yIGFycmF5IGlmIG1ldGhvZHMgYWRkZWQgdG8gcHJvdG90eXBlIGNoYWluIChvaXNpbmdAZ21haWwuY29tKVxuXHRcdFx0XHRpZiAodHlwZW9mIChyZWdleExpc3RbaV0pID09IFwib2JqZWN0XCIpXG5cdFx0XHRcdFx0cmVzdWx0ID0gcmVzdWx0LmNvbmNhdChnZXRNYXRjaGVzKGNvZGUsIHJlZ2V4TGlzdFtpXSkpO1xuXHRcdFxuXHRcdC8vIHNvcnQgYW5kIHJlbW92ZSBuZXN0ZWQgdGhlIG1hdGNoZXNcblx0XHRyZXR1cm4gdGhpcy5yZW1vdmVOZXN0ZWRNYXRjaGVzKHJlc3VsdC5zb3J0KG1hdGNoZXNTb3J0Q2FsbGJhY2spKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDaGVja3MgdG8gc2VlIGlmIGFueSBvZiB0aGUgbWF0Y2hlcyBhcmUgaW5zaWRlIG9mIG90aGVyIG1hdGNoZXMuIFxuXHQgKiBUaGlzIHByb2Nlc3Mgd291bGQgZ2V0IHJpZCBvZiBoaWdobGlndGVkIHN0cmluZ3MgaW5zaWRlIGNvbW1lbnRzLCBcblx0ICoga2V5d29yZHMgaW5zaWRlIHN0cmluZ3MgYW5kIHNvIG9uLlxuXHQgKi9cblx0cmVtb3ZlTmVzdGVkTWF0Y2hlczogZnVuY3Rpb24obWF0Y2hlcylcblx0e1xuXHRcdC8vIE9wdGltaXplZCBieSBKb3NlIFByYWRvIChodHRwOi8vam9zZXByYWRvLmNvbSlcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIFxuXHRcdHsgXG5cdFx0XHRpZiAobWF0Y2hlc1tpXSA9PT0gbnVsbClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciBpdGVtSSA9IG1hdGNoZXNbaV0sXG5cdFx0XHRcdGl0ZW1JRW5kUG9zID0gaXRlbUkuaW5kZXggKyBpdGVtSS5sZW5ndGhcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBqID0gaSArIDE7IGogPCBtYXRjaGVzLmxlbmd0aCAmJiBtYXRjaGVzW2ldICE9PSBudWxsOyBqKyspIFxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgaXRlbUogPSBtYXRjaGVzW2pdO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGl0ZW1KID09PSBudWxsKSBcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0ZWxzZSBpZiAoaXRlbUouaW5kZXggPiBpdGVtSUVuZFBvcykgXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGVsc2UgaWYgKGl0ZW1KLmluZGV4ID09IGl0ZW1JLmluZGV4ICYmIGl0ZW1KLmxlbmd0aCA+IGl0ZW1JLmxlbmd0aClcblx0XHRcdFx0XHRtYXRjaGVzW2ldID0gbnVsbDtcblx0XHRcdFx0ZWxzZSBpZiAoaXRlbUouaW5kZXggPj0gaXRlbUkuaW5kZXggJiYgaXRlbUouaW5kZXggPCBpdGVtSUVuZFBvcykgXG5cdFx0XHRcdFx0bWF0Y2hlc1tqXSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBtYXRjaGVzO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyBpbnRlZ2VyIGxpbmUgbnVtYmVycyBzdGFydGluZyBmcm9tIHRoZSAnZmlyc3QtbGluZScgcGFyYW0uXG5cdCAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFycmF5IG9mIGludGVnZXJzLlxuXHQgKi9cblx0ZmlndXJlT3V0TGluZU51bWJlcnM6IGZ1bmN0aW9uKGNvZGUpXG5cdHtcblx0XHR2YXIgbGluZXMgPSBbXSxcblx0XHRcdGZpcnN0TGluZSA9IHBhcnNlSW50KHRoaXMuZ2V0UGFyYW0oJ2ZpcnN0LWxpbmUnKSlcblx0XHRcdDtcblx0XHRcblx0XHRlYWNoTGluZShjb2RlLCBmdW5jdGlvbihsaW5lLCBpbmRleClcblx0XHR7XG5cdFx0XHRsaW5lcy5wdXNoKGluZGV4ICsgZmlyc3RMaW5lKTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gbGluZXM7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyBpZiBzcGVjaWZpZWQgbGluZSBudW1iZXIgaXMgaW4gdGhlIGhpZ2hsaWdodGVkIGxpc3QuXG5cdCAqL1xuXHRpc0xpbmVIaWdobGlnaHRlZDogZnVuY3Rpb24obGluZU51bWJlcilcblx0e1xuXHRcdHZhciBsaXN0ID0gdGhpcy5nZXRQYXJhbSgnaGlnaGxpZ2h0JywgW10pO1xuXHRcdFxuXHRcdGlmICh0eXBlb2YobGlzdCkgIT0gJ29iamVjdCcgJiYgbGlzdC5wdXNoID09IG51bGwpIFxuXHRcdFx0bGlzdCA9IFsgbGlzdCBdO1xuXHRcdFxuXHRcdHJldHVybiBpbmRleE9mKGxpc3QsIGxpbmVOdW1iZXIudG9TdHJpbmcoKSkgIT0gLTE7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciBhIHNpbmdsZSBsaW5lIG9mIGNvZGUgd2hpbGUgZGV0ZXJtaW5pbmcgYWx0ZXJuYXRpbmcgbGluZSBzdHlsZS5cblx0ICogQHBhcmFtIHtJbnRlZ2VyfSBsaW5lTnVtYmVyXHRMaW5lIG51bWJlci5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgTGluZVx0SFRNTCBtYXJrdXAuXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRcdFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdCAqL1xuXHRnZXRMaW5lSHRtbDogZnVuY3Rpb24obGluZUluZGV4LCBsaW5lTnVtYmVyLCBjb2RlKVxuXHR7XG5cdFx0dmFyIGNsYXNzZXMgPSBbXG5cdFx0XHQnbGluZScsXG5cdFx0XHQnbnVtYmVyJyArIGxpbmVOdW1iZXIsXG5cdFx0XHQnaW5kZXgnICsgbGluZUluZGV4LFxuXHRcdFx0J2FsdCcgKyAobGluZU51bWJlciAlIDIgPT0gMCA/IDEgOiAyKS50b1N0cmluZygpXG5cdFx0XTtcblx0XHRcblx0XHRpZiAodGhpcy5pc0xpbmVIaWdobGlnaHRlZChsaW5lTnVtYmVyKSlcblx0XHQgXHRjbGFzc2VzLnB1c2goJ2hpZ2hsaWdodGVkJyk7XG5cdFx0XG5cdFx0aWYgKGxpbmVOdW1iZXIgPT0gMClcblx0XHRcdGNsYXNzZXMucHVzaCgnYnJlYWsnKTtcblx0XHRcdFxuXHRcdHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIj4nICsgY29kZSArICc8L2Rpdj4nO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgbGluZSBudW1iZXIgY29sdW1uLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRcdENvbXBsZXRlIGNvZGUgSFRNTCBtYXJrdXAuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGxpbmVOdW1iZXJzXHRDYWxjdWxhdGVkIGxpbmUgbnVtYmVycy5cblx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0UmV0dXJucyBIVE1MIG1hcmt1cC5cblx0ICovXG5cdGdldExpbmVOdW1iZXJzSHRtbDogZnVuY3Rpb24oY29kZSwgbGluZU51bWJlcnMpXG5cdHtcblx0XHR2YXIgaHRtbCA9ICcnLFxuXHRcdFx0Y291bnQgPSBzcGxpdExpbmVzKGNvZGUpLmxlbmd0aCxcblx0XHRcdGZpcnN0TGluZSA9IHBhcnNlSW50KHRoaXMuZ2V0UGFyYW0oJ2ZpcnN0LWxpbmUnKSksXG5cdFx0XHRwYWQgPSB0aGlzLmdldFBhcmFtKCdwYWQtbGluZS1udW1iZXJzJylcblx0XHRcdDtcblx0XHRcblx0XHRpZiAocGFkID09IHRydWUpXG5cdFx0XHRwYWQgPSAoZmlyc3RMaW5lICsgY291bnQgLSAxKS50b1N0cmluZygpLmxlbmd0aDtcblx0XHRlbHNlIGlmIChpc05hTihwYWQpID09IHRydWUpXG5cdFx0XHRwYWQgPSAwO1xuXHRcdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKVxuXHRcdHtcblx0XHRcdHZhciBsaW5lTnVtYmVyID0gbGluZU51bWJlcnMgPyBsaW5lTnVtYmVyc1tpXSA6IGZpcnN0TGluZSArIGksXG5cdFx0XHRcdGNvZGUgPSBsaW5lTnVtYmVyID09IDAgPyBzaC5jb25maWcuc3BhY2UgOiBwYWROdW1iZXIobGluZU51bWJlciwgcGFkKVxuXHRcdFx0XHQ7XG5cdFx0XHRcdFxuXHRcdFx0aHRtbCArPSB0aGlzLmdldExpbmVIdG1sKGksIGxpbmVOdW1iZXIsIGNvZGUpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTcGxpdHMgYmxvY2sgb2YgdGV4dCBpbnRvIGluZGl2aWR1YWwgRElWIGxpbmVzLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRcdENvZGUgdG8gaGlnaGxpZ2h0LlxuXHQgKiBAcGFyYW0ge0FycmF5fSBsaW5lTnVtYmVyc1x0Q2FsY3VsYXRlZCBsaW5lIG51bWJlcnMuXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRcdFJldHVybnMgaGlnaGxpZ2h0ZWQgY29kZSBpbiBIVE1MIGZvcm0uXG5cdCAqL1xuXHRnZXRDb2RlTGluZXNIdG1sOiBmdW5jdGlvbihodG1sLCBsaW5lTnVtYmVycylcblx0e1xuXHRcdGh0bWwgPSB0cmltKGh0bWwpO1xuXHRcdFxuXHRcdHZhciBsaW5lcyA9IHNwbGl0TGluZXMoaHRtbCksXG5cdFx0XHRwYWRMZW5ndGggPSB0aGlzLmdldFBhcmFtKCdwYWQtbGluZS1udW1iZXJzJyksXG5cdFx0XHRmaXJzdExpbmUgPSBwYXJzZUludCh0aGlzLmdldFBhcmFtKCdmaXJzdC1saW5lJykpLFxuXHRcdFx0aHRtbCA9ICcnLFxuXHRcdFx0YnJ1c2hOYW1lID0gdGhpcy5nZXRQYXJhbSgnYnJ1c2gnKVxuXHRcdFx0O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHR2YXIgbGluZSA9IGxpbmVzW2ldLFxuXHRcdFx0XHRpbmRlbnQgPSAvXigmbmJzcDt8XFxzKSsvLmV4ZWMobGluZSksXG5cdFx0XHRcdHNwYWNlcyA9IG51bGwsXG5cdFx0XHRcdGxpbmVOdW1iZXIgPSBsaW5lTnVtYmVycyA/IGxpbmVOdW1iZXJzW2ldIDogZmlyc3RMaW5lICsgaTtcblx0XHRcdFx0O1xuXG5cdFx0XHRpZiAoaW5kZW50ICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHNwYWNlcyA9IGluZGVudFswXS50b1N0cmluZygpO1xuXHRcdFx0XHRsaW5lID0gbGluZS5zdWJzdHIoc3BhY2VzLmxlbmd0aCk7XG5cdFx0XHRcdHNwYWNlcyA9IHNwYWNlcy5yZXBsYWNlKCcgJywgc2guY29uZmlnLnNwYWNlKTtcblx0XHRcdH1cblxuXHRcdFx0bGluZSA9IHRyaW0obGluZSk7XG5cdFx0XHRcblx0XHRcdGlmIChsaW5lLmxlbmd0aCA9PSAwKVxuXHRcdFx0XHRsaW5lID0gc2guY29uZmlnLnNwYWNlO1xuXHRcdFx0XG5cdFx0XHRodG1sICs9IHRoaXMuZ2V0TGluZUh0bWwoXG5cdFx0XHRcdGksXG5cdFx0XHRcdGxpbmVOdW1iZXIsIFxuXHRcdFx0XHQoc3BhY2VzICE9IG51bGwgPyAnPGNvZGUgY2xhc3M9XCInICsgYnJ1c2hOYW1lICsgJyBzcGFjZXNcIj4nICsgc3BhY2VzICsgJzwvY29kZT4nIDogJycpICsgbGluZVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBIVE1MIGZvciB0aGUgdGFibGUgdGl0bGUgb3IgZW1wdHkgc3RyaW5nIGlmIHRpdGxlIGlzIG51bGwuXG5cdCAqL1xuXHRnZXRUaXRsZUh0bWw6IGZ1bmN0aW9uKHRpdGxlKVxuXHR7XG5cdFx0cmV0dXJuIHRpdGxlID8gJzxjYXB0aW9uPicgKyB0aXRsZSArICc8L2NhcHRpb24+JyA6ICcnO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEZpbmRzIGFsbCBtYXRjaGVzIGluIHRoZSBzb3VyY2UgY29kZS5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGVcdFx0U291cmNlIGNvZGUgdG8gcHJvY2VzcyBtYXRjaGVzIGluLlxuXHQgKiBAcGFyYW0ge0FycmF5fSBtYXRjaGVzXHREaXNjb3ZlcmVkIHJlZ2V4IG1hdGNoZXMuXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBmb3JtYXR0ZWQgSFRNTCB3aXRoIHByb2Nlc3NlZCBtYXRoZXMuXG5cdCAqL1xuXHRnZXRNYXRjaGVzSHRtbDogZnVuY3Rpb24oY29kZSwgbWF0Y2hlcylcblx0e1xuXHRcdHZhciBwb3MgPSAwLCBcblx0XHRcdHJlc3VsdCA9ICcnLFxuXHRcdFx0YnJ1c2hOYW1lID0gdGhpcy5nZXRQYXJhbSgnYnJ1c2gnLCAnJylcblx0XHRcdDtcblx0XHRcblx0XHRmdW5jdGlvbiBnZXRCcnVzaE5hbWVDc3MobWF0Y2gpXG5cdFx0e1xuXHRcdFx0dmFyIHJlc3VsdCA9IG1hdGNoID8gKG1hdGNoLmJydXNoTmFtZSB8fCBicnVzaE5hbWUpIDogYnJ1c2hOYW1lO1xuXHRcdFx0cmV0dXJuIHJlc3VsdCA/IHJlc3VsdCArICcgJyA6ICcnO1xuXHRcdH07XG5cdFx0XG5cdFx0Ly8gRmluYWxseSwgZ28gdGhyb3VnaCB0aGUgZmluYWwgbGlzdCBvZiBtYXRjaGVzIGFuZCBwdWxsIHRoZSBhbGxcblx0XHQvLyB0b2dldGhlciBhZGRpbmcgZXZlcnl0aGluZyBpbiBiZXR3ZWVuIHRoYXQgaXNuJ3QgYSBtYXRjaC5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIFxuXHRcdHtcblx0XHRcdHZhciBtYXRjaCA9IG1hdGNoZXNbaV0sXG5cdFx0XHRcdG1hdGNoQnJ1c2hOYW1lXG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0aWYgKG1hdGNoID09PSBudWxsIHx8IG1hdGNoLmxlbmd0aCA9PT0gMCkgXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRtYXRjaEJydXNoTmFtZSA9IGdldEJydXNoTmFtZUNzcyhtYXRjaCk7XG5cdFx0XHRcblx0XHRcdHJlc3VsdCArPSB3cmFwTGluZXNXaXRoQ29kZShjb2RlLnN1YnN0cihwb3MsIG1hdGNoLmluZGV4IC0gcG9zKSwgbWF0Y2hCcnVzaE5hbWUgKyAncGxhaW4nKVxuXHRcdFx0XHRcdCsgd3JhcExpbmVzV2l0aENvZGUobWF0Y2gudmFsdWUsIG1hdGNoQnJ1c2hOYW1lICsgbWF0Y2guY3NzKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0cG9zID0gbWF0Y2guaW5kZXggKyBtYXRjaC5sZW5ndGggKyAobWF0Y2gub2Zmc2V0IHx8IDApO1xuXHRcdH1cblxuXHRcdC8vIGRvbid0IGZvcmdldCB0byBhZGQgd2hhdGV2ZXIncyByZW1haW5pbmcgaW4gdGhlIHN0cmluZ1xuXHRcdHJlc3VsdCArPSB3cmFwTGluZXNXaXRoQ29kZShjb2RlLnN1YnN0cihwb3MpLCBnZXRCcnVzaE5hbWVDc3MoKSArICdwbGFpbicpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIHRoZSB3aG9sZSBzeW50YXggaGlnaGxpZ2h0ZXIuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlIFNvdXJjZSBjb2RlLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdCAqL1xuXHRnZXRIdG1sOiBmdW5jdGlvbihjb2RlKVxuXHR7XG5cdFx0dmFyIGh0bWwgPSAnJyxcblx0XHRcdGNsYXNzZXMgPSBbICdzeW50YXhoaWdobGlnaHRlcicgXSxcblx0XHRcdHRhYlNpemUsXG5cdFx0XHRtYXRjaGVzLFxuXHRcdFx0bGluZU51bWJlcnNcblx0XHRcdDtcblx0XHRcblx0XHQvLyBwcm9jZXNzIGxpZ2h0IG1vZGVcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgnbGlnaHQnKSA9PSB0cnVlKVxuXHRcdFx0dGhpcy5wYXJhbXMudG9vbGJhciA9IHRoaXMucGFyYW1zLmd1dHRlciA9IGZhbHNlO1xuXG5cdFx0Y2xhc3NOYW1lID0gJ3N5bnRheGhpZ2hsaWdodGVyJztcblxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdjb2xsYXBzZScpID09IHRydWUpXG5cdFx0XHRjbGFzc2VzLnB1c2goJ2NvbGxhcHNlZCcpO1xuXHRcdFxuXHRcdGlmICgoZ3V0dGVyID0gdGhpcy5nZXRQYXJhbSgnZ3V0dGVyJykpID09IGZhbHNlKVxuXHRcdFx0Y2xhc3Nlcy5wdXNoKCdub2d1dHRlcicpO1xuXG5cdFx0Ly8gYWRkIGN1c3RvbSB1c2VyIHN0eWxlIG5hbWVcblx0XHRjbGFzc2VzLnB1c2godGhpcy5nZXRQYXJhbSgnY2xhc3MtbmFtZScpKTtcblxuXHRcdC8vIGFkZCBicnVzaCBhbGlhcyB0byB0aGUgY2xhc3MgbmFtZSBmb3IgY3VzdG9tIENTU1xuXHRcdGNsYXNzZXMucHVzaCh0aGlzLmdldFBhcmFtKCdicnVzaCcpKTtcblxuXHRcdGNvZGUgPSB0cmltRmlyc3RBbmRMYXN0TGluZXMoY29kZSlcblx0XHRcdC5yZXBsYWNlKC9cXHIvZywgJyAnKSAvLyBJRSBsZXRzIHRoZXNlIGJ1Z2dlcnMgdGhyb3VnaFxuXHRcdFx0O1xuXG5cdFx0dGFiU2l6ZSA9IHRoaXMuZ2V0UGFyYW0oJ3RhYi1zaXplJyk7XG5cblx0XHQvLyByZXBsYWNlIHRhYnMgd2l0aCBzcGFjZXNcblx0XHRjb2RlID0gdGhpcy5nZXRQYXJhbSgnc21hcnQtdGFicycpID09IHRydWVcblx0XHRcdD8gcHJvY2Vzc1NtYXJ0VGFicyhjb2RlLCB0YWJTaXplKVxuXHRcdFx0OiBwcm9jZXNzVGFicyhjb2RlLCB0YWJTaXplKVxuXHRcdFx0O1xuXG5cdFx0Ly8gdW5pbmRlbnQgY29kZSBieSB0aGUgY29tbW9uIGluZGVudGF0aW9uXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ3VuaW5kZW50JykpXG5cdFx0XHRjb2RlID0gdW5pbmRlbnQoY29kZSk7XG5cblx0XHRpZiAoZ3V0dGVyKVxuXHRcdFx0bGluZU51bWJlcnMgPSB0aGlzLmZpZ3VyZU91dExpbmVOdW1iZXJzKGNvZGUpO1xuXHRcdFxuXHRcdC8vIGZpbmQgbWF0Y2hlcyBpbiB0aGUgY29kZSB1c2luZyBicnVzaGVzIHJlZ2V4IGxpc3Rcblx0XHRtYXRjaGVzID0gdGhpcy5maW5kTWF0Y2hlcyh0aGlzLnJlZ2V4TGlzdCwgY29kZSk7XG5cdFx0Ly8gcHJvY2Vzc2VzIGZvdW5kIG1hdGNoZXMgaW50byB0aGUgaHRtbFxuXHRcdGh0bWwgPSB0aGlzLmdldE1hdGNoZXNIdG1sKGNvZGUsIG1hdGNoZXMpO1xuXHRcdC8vIGZpbmFsbHksIHNwbGl0IGFsbCBsaW5lcyBzbyB0aGF0IHRoZXkgd3JhcCB3ZWxsXG5cdFx0aHRtbCA9IHRoaXMuZ2V0Q29kZUxpbmVzSHRtbChodG1sLCBsaW5lTnVtYmVycyk7XG5cblx0XHQvLyBmaW5hbGx5LCBwcm9jZXNzIHRoZSBsaW5rc1xuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdhdXRvLWxpbmtzJykpXG5cdFx0XHRodG1sID0gcHJvY2Vzc1VybHMoaHRtbCk7XG5cdFx0XG5cdFx0aWYgKHR5cGVvZihuYXZpZ2F0b3IpICE9ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvTVNJRS8pKVxuXHRcdFx0Y2xhc3Nlcy5wdXNoKCdpZScpO1xuXHRcdFxuXHRcdGh0bWwgPSBcblx0XHRcdCc8ZGl2IGlkPVwiJyArIGdldEhpZ2hsaWdodGVySWQodGhpcy5pZCkgKyAnXCIgY2xhc3M9XCInICsgY2xhc3Nlcy5qb2luKCcgJykgKyAnXCI+J1xuXHRcdFx0XHQrICh0aGlzLmdldFBhcmFtKCd0b29sYmFyJykgPyBzaC50b29sYmFyLmdldEh0bWwodGhpcykgOiAnJylcblx0XHRcdFx0KyAnPHRhYmxlIGJvcmRlcj1cIjBcIiBjZWxscGFkZGluZz1cIjBcIiBjZWxsc3BhY2luZz1cIjBcIj4nXG5cdFx0XHRcdFx0KyB0aGlzLmdldFRpdGxlSHRtbCh0aGlzLmdldFBhcmFtKCd0aXRsZScpKVxuXHRcdFx0XHRcdCsgJzx0Ym9keT4nXG5cdFx0XHRcdFx0XHQrICc8dHI+J1xuXHRcdFx0XHRcdFx0XHQrIChndXR0ZXIgPyAnPHRkIGNsYXNzPVwiZ3V0dGVyXCI+JyArIHRoaXMuZ2V0TGluZU51bWJlcnNIdG1sKGNvZGUpICsgJzwvdGQ+JyA6ICcnKVxuXHRcdFx0XHRcdFx0XHQrICc8dGQgY2xhc3M9XCJjb2RlXCI+J1xuXHRcdFx0XHRcdFx0XHRcdCsgJzxkaXYgY2xhc3M9XCJjb250YWluZXJcIj4nXG5cdFx0XHRcdFx0XHRcdFx0XHQrIGh0bWxcblx0XHRcdFx0XHRcdFx0XHQrICc8L2Rpdj4nXG5cdFx0XHRcdFx0XHRcdCsgJzwvdGQ+J1xuXHRcdFx0XHRcdFx0KyAnPC90cj4nXG5cdFx0XHRcdFx0KyAnPC90Ym9keT4nXG5cdFx0XHRcdCsgJzwvdGFibGU+J1xuXHRcdFx0KyAnPC9kaXY+J1xuXHRcdFx0O1xuXHRcdFx0XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogSGlnaGxpZ2h0cyB0aGUgY29kZSBhbmQgcmV0dXJucyBjb21wbGV0ZSBIVE1MLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZSAgICAgQ29kZSB0byBoaWdobGlnaHQuXG5cdCAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgICBSZXR1cm5zIGNvbnRhaW5lciBESVYgZWxlbWVudCB3aXRoIGFsbCBtYXJrdXAuXG5cdCAqL1xuXHRnZXREaXY6IGZ1bmN0aW9uKGNvZGUpXG5cdHtcblx0XHRpZiAoY29kZSA9PT0gbnVsbCkgXG5cdFx0XHRjb2RlID0gJyc7XG5cdFx0XG5cdFx0dGhpcy5jb2RlID0gY29kZTtcblxuXHRcdHZhciBkaXYgPSB0aGlzLmNyZWF0ZSgnZGl2Jyk7XG5cblx0XHQvLyBjcmVhdGUgbWFpbiBIVE1MXG5cdFx0ZGl2LmlubmVySFRNTCA9IHRoaXMuZ2V0SHRtbChjb2RlKTtcblx0XHRcblx0XHQvLyBzZXQgdXAgY2xpY2sgaGFuZGxlcnNcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgndG9vbGJhcicpKVxuXHRcdFx0YXR0YWNoRXZlbnQoZmluZEVsZW1lbnQoZGl2LCAnLnRvb2xiYXInKSwgJ2NsaWNrJywgc2gudG9vbGJhci5oYW5kbGVyKTtcblx0XHRcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgncXVpY2stY29kZScpKVxuXHRcdFx0YXR0YWNoRXZlbnQoZmluZEVsZW1lbnQoZGl2LCAnLmNvZGUnKSwgJ2RibGNsaWNrJywgcXVpY2tDb2RlSGFuZGxlcik7XG5cdFx0XG5cdFx0cmV0dXJuIGRpdjtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgaGlnaGxpZ2h0ZXIvYnJ1c2guXG5cdCAqXG5cdCAqIENvbnN0cnVjdG9yIGlzbid0IHVzZWQgZm9yIGluaXRpYWxpemF0aW9uIHNvIHRoYXQgbm90aGluZyBleGVjdXRlcyBkdXJpbmcgbmVjZXNzYXJ5XG5cdCAqIGBuZXcgU3ludGF4SGlnaGxpZ2h0ZXIuSGlnaGxpZ2h0ZXIoKWAgY2FsbCB3aGVuIHNldHRpbmcgdXAgYnJ1c2ggaW5oZXJpdGVuY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7SGFzaH0gcGFyYW1zIEhpZ2hsaWdodGVyIHBhcmFtZXRlcnMuXG5cdCAqL1xuXHRpbml0OiBmdW5jdGlvbihwYXJhbXMpXG5cdHtcblx0XHR0aGlzLmlkID0gZ3VpZCgpO1xuXHRcdFxuXHRcdC8vIHJlZ2lzdGVyIHRoaXMgaW5zdGFuY2UgaW4gdGhlIGhpZ2hsaWdodGVycyBsaXN0XG5cdFx0c3RvcmVIaWdobGlnaHRlcih0aGlzKTtcblx0XHRcblx0XHQvLyBsb2NhbCBwYXJhbXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgZGVmYXVsdHNcblx0XHR0aGlzLnBhcmFtcyA9IG1lcmdlKHNoLmRlZmF1bHRzLCBwYXJhbXMgfHwge30pXG5cdFx0XG5cdFx0Ly8gcHJvY2VzcyBsaWdodCBtb2RlXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ2xpZ2h0JykgPT0gdHJ1ZSlcblx0XHRcdHRoaXMucGFyYW1zLnRvb2xiYXIgPSB0aGlzLnBhcmFtcy5ndXR0ZXIgPSBmYWxzZTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBrZXl3b3JkcyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uIHN0cmluZy5cblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgICBTcGFjZSBzZXBhcmF0ZWQga2V5d29yZHMuXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgUmV0dXJucyByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuXHQgKi9cblx0Z2V0S2V5d29yZHM6IGZ1bmN0aW9uKHN0cilcblx0e1xuXHRcdHN0ciA9IHN0clxuXHRcdFx0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuXHRcdFx0LnJlcGxhY2UoL1xccysvZywgJ3wnKVxuXHRcdFx0O1xuXHRcdFxuXHRcdHJldHVybiAnXFxcXGIoPzonICsgc3RyICsgJylcXFxcYic7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogTWFrZXMgYSBicnVzaCBjb21wYXRpYmxlIHdpdGggdGhlIGBodG1sLXNjcmlwdGAgZnVuY3Rpb25hbGl0eS5cblx0ICogQHBhcmFtIHtPYmplY3R9IHJlZ2V4R3JvdXAgT2JqZWN0IGNvbnRhaW5pbmcgYGxlZnRgIGFuZCBgcmlnaHRgIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG5cdCAqL1xuXHRmb3JIdG1sU2NyaXB0OiBmdW5jdGlvbihyZWdleEdyb3VwKVxuXHR7XG5cdFx0dmFyIHJlZ2V4ID0geyAnZW5kJyA6IHJlZ2V4R3JvdXAucmlnaHQuc291cmNlIH07XG5cblx0XHRpZihyZWdleEdyb3VwLmVvZilcblx0XHRcdHJlZ2V4LmVuZCA9IFwiKD86KD86XCIgKyByZWdleC5lbmQgKyBcIil8JClcIjtcblx0XHRcblx0XHR0aGlzLmh0bWxTY3JpcHQgPSB7XG5cdFx0XHRsZWZ0IDogeyByZWdleDogcmVnZXhHcm91cC5sZWZ0LCBjc3M6ICdzY3JpcHQnIH0sXG5cdFx0XHRyaWdodCA6IHsgcmVnZXg6IHJlZ2V4R3JvdXAucmlnaHQsIGNzczogJ3NjcmlwdCcgfSxcblx0XHRcdGNvZGUgOiBuZXcgWFJlZ0V4cChcblx0XHRcdFx0XCIoPzxsZWZ0PlwiICsgcmVnZXhHcm91cC5sZWZ0LnNvdXJjZSArIFwiKVwiICtcblx0XHRcdFx0XCIoPzxjb2RlPi4qPylcIiArXG5cdFx0XHRcdFwiKD88cmlnaHQ+XCIgKyByZWdleC5lbmQgKyBcIilcIixcblx0XHRcdFx0XCJzZ2lcIlxuXHRcdFx0XHQpXG5cdFx0fTtcblx0fVxufTsgLy8gZW5kIG9mIEhpZ2hsaWdodGVyXG5cbnJldHVybiBzaDtcbn0oKTsgLy8gZW5kIG9mIGFub255bW91cyBmdW5jdGlvblxuXG4vLyBDb21tb25KU1xudHlwZW9mKGV4cG9ydHMpICE9ICd1bmRlZmluZWQnID8gZXhwb3J0cy5TeW50YXhIaWdobGlnaHRlciA9IFN5bnRheEhpZ2hsaWdodGVyIDogbnVsbDtcbiIsInZhciBmcyAgICAgICAgID0gIHJlcXVpcmUoJ2ZzJylcbiAgLCBwYXRoICAgICAgID0gIHJlcXVpcmUoJ3BhdGgnKVxuICAsIHV0aWwgICAgICAgPSAgcmVxdWlyZSgndXRpbCcpXG4gICwgaW5saW5lICAgICA9ICByZXF1aXJlKCcuL2lubGluZS1zY3JpcHRzJylcbiAgLCBzY3JpcHRzRGlyID0gIHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2xpYi9zY3JpcHRzJylcbiAgLCBzdHlsZXNEaXIgID0gIHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2xpYi9zdHlsZXMnKVxuICAsIHN0eWxlc1xuICAsIGxhbmdNYXAgICAgPSAgeyB9XG4gICwgc2ltaWxhck1hcCA9ICB7IH1cbiAgLCBzaW1pbGFyTGFuZ3MgPSAge1xuICAgICAgICAnanMnICAgICA6ICBbICdqc29uJyBdXG4gICAgICAsICdweXRob24nIDogIFsnY29mZmVlJywgJ2dyb292eScsICdocycsICdoYXNrZWxsJyBdXG4gICAgfVxuICA7XG5cblxuLy8gU2VsZiBpbnZva2luZyBmdW5jdGlvbnMgYmxvY2sgdW50aWwgdGhleSBhcmUgZmluaXNoZWQgaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXQgXG4vLyB0aGlzIG1vZHVsZSBpcyBwcm9wZXJseSBpbml0aWFsaXplZCBiZWZvcmUgaXQgaXMgcmV0dXJuZWQuXG4vLyBTaW5jZSB0aGlzIG9ubHkgaGFwcGVucyBvbmNlICh3aGVuIG1vZHVsZSBpcyByZXF1aXJlZCksIGl0IHNob3VsZG4ndCBiZSBhIHByb2JsZW0uXG4oZnVuY3Rpb24gbWFwQnJ1c2hlcygpIHtcbiAgZnMucmVhZGRpclN5bmMoc2NyaXB0c0RpcikuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xuICAgIGlmICghZmlsZS5tYXRjaCgvc2hCcnVzaFxcdytcXC5qcy8pKSByZXR1cm47XG4gICAgXG4gICAgdmFyIGxhbmd1YWdlID0gcmVxdWlyZShwYXRoLmpvaW4oc2NyaXB0c0RpciwgZmlsZSkpO1xuICAgIGxhbmd1YWdlLkJydXNoLmFsaWFzZXMuZm9yRWFjaChmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgIGxhbmdNYXBbYWxpYXMudG9Mb3dlckNhc2UoKV0gPSBsYW5ndWFnZTtcbiAgICB9KTtcbiAgfSk7ICBcblxuICAvLyBBZGQgc29tZSBrbm93biBhbGlhc2VzXG4gIGxhbmdNYXBbJ2NzJ10gPSBsYW5nTWFwWydjIyddO1xuXG4gIC8vIEFkZCBzaW1pbGFyIGJydXNoZXMgdG8gc2ltaWxhciBtYXBcbiAgT2JqZWN0LmtleXMoc2ltaWxhckxhbmdzKS5mb3JFYWNoKGZ1bmN0aW9uIChsYW5nKSB7XG4gICAgc2ltaWxhckxhbmdzW2xhbmddLmZvckVhY2goZnVuY3Rpb24gKHNpbWlsYXIpIHtcbiAgICAgIHNpbWlsYXJNYXBbc2ltaWxhcl0gPSBsYW5nTWFwW2xhbmddO1xuICAgIH0pO1xuICB9KTtcbn0pICgpO1xuXG4oZnVuY3Rpb24gY29sbGVjdFN0eWxlcyAoKSB7XG4gIHN0eWxlcyA9IGZzLnJlYWRkaXJTeW5jKHN0eWxlc0RpcilcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIChmaWxlTmFtZSkge1xuICAgICAgcmV0dXJuIGZpbGVOYW1lLm1hdGNoKC9zaENvcmUuK1xcLmNzcy8pO1xuICAgIH0pXG4gICAgLm1hcChmdW5jdGlvbiAoZmlsZU5hbWUpIHtcbiAgICAgIHZhciBub3JtYWxpemVkRmlsZU5hbWUgPSAgZmlsZU5hbWUucmVwbGFjZSgvc2hDb3JlLywgJycpXG4gICAgICAgICwgZXh0TGVuZ3RoICAgICAgICAgID0gIHBhdGguZXh0bmFtZShub3JtYWxpemVkRmlsZU5hbWUpLmxlbmd0aFxuICAgICAgICAsIG5hbWVMZW5ndGggICAgICAgICA9ICBub3JtYWxpemVkRmlsZU5hbWUubGVuZ3RoIC0gZXh0TGVuZ3RoXG4gICAgICAgICwgc3R5bGVOYW1lICAgICAgICAgID0gIG5vcm1hbGl6ZWRGaWxlTmFtZS5zdWJzdHIoMCwgbmFtZUxlbmd0aCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAsIGZ1bGxGaWxlUGF0aCAgICAgICA9ICBwYXRoLmpvaW4oc3R5bGVzRGlyLCBmaWxlTmFtZSlcbiAgICAgICAgO1xuXG4gICAgICByZXR1cm4geyBuYW1lOiBzdHlsZU5hbWUsIHNvdXJjZVBhdGg6IGZ1bGxGaWxlUGF0aCB9O1xuICAgICAgXG4gICAgfSk7XG59KSAoKTtcblxuZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UoYWxpYXMsIHN0cmljdCkge1xuICAvLyBhY2NlcHQgKi5leHQsIC5leHQgYW5kIGV4dFxuICB2YXIgbm9ybWFsaXplZEFsaWFzID0gYWxpYXMucmVwbGFjZSgvXlxcKi8sJycpLnJlcGxhY2UoL15cXC4vLCcnKTtcblxuICB2YXIgbWF0Y2ggPSBsYW5nTWFwW25vcm1hbGl6ZWRBbGlhc10gfHwgKCFzdHJpY3QgPyBzaW1pbGFyTWFwW25vcm1hbGl6ZWRBbGlhc10gOiB2b2lkIDApO1xuICBcbiAgLy8gTmVlZCB0byByZW1lbWJlciBpZiB1c2VyIGlzIGhpZ2hsaWdodGluZyBodG1sIG9yIHhodG1sIGZvciBpbnN0YW5jZSBmb3IgdXNlIGluIGhpZ2hsaWdodFxuICBpZiAobWF0Y2gpIG1hdGNoLnNwZWNpZmllZEFsaWFzID0gbm9ybWFsaXplZEFsaWFzO1xuXG4gIHJldHVybiBtYXRjaDtcbn1cblxuLy8gb3B0aW9uczogaHR0cDovL2FsZXhnb3JiYXRjaGV2LmNvbS9TeW50YXhIaWdobGlnaHRlci9tYW51YWwvY29uZmlndXJhdGlvbi9cbmZ1bmN0aW9uIGhpZ2hsaWdodChjb2RlLCBsYW5ndWFnZSwgb3B0aW9ucykge1xuICB2YXIgbWVyZ2VkT3B0cyA9IHsgfVxuICAgICwgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgdG9vbGJhcjogZmFsc2VcbiAgICAgICAgLCAnZmlyc3QtbGluZSc6IDFcbiAgICAgIH1cbiAgICAsIGhpZ2hsaWdodGVkSHRtbFxuICAgIDtcblxuICBpZiAoIWxhbmd1YWdlKSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHBhc3MgYSBsYW5ndWFnZSBvYnRhaW5lZCB2aWEgXCJnZXRMYW5ndWFnZVwiJyk7XG4gIGlmICghbGFuZ3VhZ2UuQnJ1c2gpIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gcGFzcyBhIGxhbmd1YWdlIHdpdGggYSBCcnVzaCwgb2J0YWluZWQgdmlhIFwiZ2V0TGFuZ3VhZ2VcIicpO1xuXG4gIGlmIChvcHRpb25zKSB7XG4gICAgLy8gR2F0aGVyIGFsbCB1c2VyIHNwZWNpZmllZCBvcHRpb25zIGZpcnN0XG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBtZXJnZWRPcHRzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgfSk7XG4gICAgLy8gQWRkIGRlZmF1bHQgb3B0aW9uIG9ubHkgaWYgdXNlciBkaWRuJ3Qgc3BlY2lmeSBpdHMgdmFsdWVcbiAgICBPYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBtZXJnZWRPcHRzW2tleV0gPSBvcHRpb25zW2tleV0gfHwgZGVmYXVsdHNba2V5XTtcbiAgICB9KTtcblxuICB9IGVsc2Uge1xuICAgIG1lcmdlZE9wdHMgPSBkZWZhdWx0cztcbiAgfVxuXG4gIHZhciBicnVzaCA9IG5ldyBsYW5ndWFnZS5CcnVzaCgpO1xuICBicnVzaC5pbml0KG1lcmdlZE9wdHMpO1xuXG4gIGhpZ2hsaWdodGVkSHRtbCA9IGJydXNoLmdldEh0bWwoY29kZSk7XG5cbiAgaWYgKGxhbmd1YWdlID09PSBsYW5nTWFwWydodG1sJ10pIHtcbiAgICB2YXIgbGluZXMgPSBjb2RlLnNwbGl0KCdcXG4nKVxuICAgICAgLCBzY3JpcHRzID0gaW5saW5lLmZpbmRTY3JpcHRzKGxpbmVzLCBsYW5ndWFnZS5zcGVjaWZpZWRBbGlhcyk7XG5cbiAgICAvLyBIaWdobGlnaHQgY29kZSBpbiBiZXR3ZWVuIHNjcmlwdHMgdGFncyBhbmQgaW50ZXJqZWN0IGl0IGludG8gaGlnaGxpZ2h0ZWQgaHRtbFxuICAgIHNjcmlwdHMuZm9yRWFjaChmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICB2YXIgc2NyaXB0TGFuZyA9IGxhbmdNYXBbc2NyaXB0LnRhZy5hbGlhc11cbiAgICAgICAgLCBicnVzaCA9IG5ldyBzY3JpcHRMYW5nLkJydXNoKClcbiAgICAgICAgLCBvcHRzID0gbWVyZ2VkT3B0c1xuICAgICAgICA7XG5cbiAgICAgIC8vIGFkYXB0IGxpbmUgbnVtYmVycyBvZiBoaWdobGlnaHRlZCBjb2RlIHNpbmNlIGl0IGlzIGluIHRoZSBtaWRkbGUgb2YgaHRtbCBkb2N1bWVudFxuICAgICAgb3B0c1snZmlyc3QtbGluZSddID0gbWVyZ2VkT3B0c1snZmlyc3QtbGluZSddICsgc2NyaXB0LmZyb207XG4gICAgICBcbiAgICAgIGJydXNoLmluaXQob3B0cyk7XG5cbiAgICAgIHZhciBoaWdobGlnaHRlZFNjcmlwdCA9IGJydXNoLmdldEh0bWwoc2NyaXB0LmNvZGUpXG4gICAgICAgICwgaGlnbGlnaHRlZExpbmVzID0gaW5saW5lLmV4dHJhY3RMaW5lcyhoaWdobGlnaHRlZFNjcmlwdCk7XG5cbiAgICAgIGhpZ2hsaWdodGVkSHRtbCA9IGlubGluZS5yZXBsYWNlUGxhaW5MaW5lcyhzY3JpcHQuZnJvbSwgc2NyaXB0LnRvLCBoaWdobGlnaHRlZEh0bWwsIGhpZ2xpZ2h0ZWRMaW5lcyk7XG4gICAgfSk7XG4gfSBcblxuICByZXR1cm4gaGlnaGxpZ2h0ZWRIdG1sO1xufVxuXG5cbmZ1bmN0aW9uIGdldFN0eWxlcyAoKSB7XG4gIHJldHVybiBzdHlsZXM7XG59XG5cbmZ1bmN0aW9uIGNvcHlTdHlsZSAoc3R5bGUsIHRndCwgY2IpIHtcbiAgdmFyIHNvdXJjZVBhdGhcbiAgICAsIHN0eWxlTmFtZTtcblxuICAvLyBBbGxvdyBzdHlsZSB0byBqdXN0IGJlIGEgc3RyaW5nIChpdHMgbmFtZSkgb3IgYSBzdHlsZSByZXR1cm5lZCBmcm9tIGdldFN0eWxlc1xuICBpZiAodHlwZW9mIHN0eWxlID09PSAnc3RyaW5nJykge1xuICAgIHN0eWxlTmFtZSA9IHN0eWxlO1xuXG4gICAgdmFyIG1hdGNoaW5nU3R5bGUgPSBzdHlsZXMuZmlsdGVyKGZ1bmN0aW9uIChzKSB7IHJldHVybiBzLm5hbWUgPT09IHN0eWxlOyB9KVswXTtcblxuICAgIGlmICghbWF0Y2hpbmdTdHlsZSkgXG4gICAgICBjYihuZXcgRXJyb3IoJ1N0eWxlIG5hbWVkIFwiJyArIHN0eWxlICsgJ1wiIG5vdCBmb3VuZC4nKSk7XG4gICAgZWxzZVxuICAgICAgc291cmNlUGF0aCA9IG1hdGNoaW5nU3R5bGUuc291cmNlUGF0aDtcblxuICB9IGVsc2UgaWYgKCFzdHlsZS5zb3VyY2VQYXRoKSB7XG4gICAgY2IobmV3IEVycm9yKCdzdHlsZSBuZWVkcyB0byBiZSBzdHJpbmcgb3IgaGF2ZSBcInNvdXJjZVBhdGhcIiBwcm9wZXJ0eScpKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZU5hbWUgPSBzdHlsZS5uYW1lO1xuICAgIHNvdXJjZVBhdGggPSBzdHlsZS5zb3VyY2VQYXRoO1xuICB9XG5cbiAgdmFyIHJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHNvdXJjZVBhdGgpXG4gICAgLCB3cml0ZVN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHBhdGguam9pbih0Z3QsIHN0eWxlTmFtZSArICcuY3NzJykpXG4gICAgOyBcblxuICB1dGlsLnB1bXAocmVhZFN0cmVhbSwgd3JpdGVTdHJlYW0sIGNiKTtcbn1cblxuXG5mdW5jdGlvbiBjb3B5U3R5bGVzKHRndCwgY2IpIHtcbiAgdmFyIHBlbmRpbmcgPSBzdHlsZXMubGVuZ3RoO1xuICBzdHlsZXMuZm9yRWFjaChmdW5jdGlvbiAocykge1xuICAgIGNvcHlTdHlsZShzLCB0Z3QsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGlmIChlcnIpIHsgXG4gICAgICAgIGNiKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoLS1wZW5kaW5nID09PSAwKSBjYigpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGhpZ2hsaWdodCAgIDogIGhpZ2hsaWdodFxuICAsIGdldExhbmd1YWdlIDogIGdldExhbmd1YWdlXG4gICwgZ2V0U3R5bGVzICAgOiAgZ2V0U3R5bGVzXG4gICwgY29weVN0eWxlICAgOiAgY29weVN0eWxlXG4gICwgY29weVN0eWxlcyAgOiAgY29weVN0eWxlc1xufTtcblxuIl19
