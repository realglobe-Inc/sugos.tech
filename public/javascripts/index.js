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
'use strict';

var _apemanBrwsReact = require('apeman-brws-react');

var _apemanBrwsReact2 = _interopRequireDefault(_apemanBrwsReact);

var _index = require('../components/index.component');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONTAINER_ID = 'index-wrap';
window.onload = function () {
  var _window = window;
  var locale = _window.locale;

  _apemanBrwsReact2.default.render(CONTAINER_ID, _index2.default, {
    locale: locale
  }, function done() {
    // The component is ready.
  });
};
},{"../components/index.component":11,"apeman-brws-react":"apeman-brws-react"}],8:[function(require,module,exports){
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
    return _react2.default.createElement(
      _apemanReactBasic.ApHeader,
      { className: 'header' },
      _react2.default.createElement(
        _apemanReactBasic.ApContainer,
        null,
        _react2.default.createElement(
          _apemanReactBasic.ApHeaderLogo,
          null,
          _react2.default.createElement(_logo2.default, null)
        ),
        _react2.default.createElement(
          _apemanReactBasic.ApHeaderTab,
          null,
          _tabItem(l('pages.DOCS_PAGE'), './docs.html', { selected: tab === 'DOCS' }),
          _tabItem(l('pages.CASES_PAGE'), './cases.html', { selected: tab === 'CASES' })
        )
      )
    );
  }
});

exports.default = Header;
},{"../fragments/logo":9,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],9:[function(require,module,exports){
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
},{"react":"react"}],10:[function(require,module,exports){
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

    return _react2.default.createElement('pre', { className: 'snippet', dangerouslySetInnerHTML: { __html: props.src } });
  }
});

exports.default = Snippet;
},{"react":"react"}],11:[function(require,module,exports){
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

var _splash_view = require('./views/splash_view');

var _splash_view2 = _interopRequireDefault(_splash_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IndexComponent = _react2.default.createClass({
  displayName: 'IndexComponent',

  mixins: [_apemanReactMixins.ApLocaleMixin],

  getInitialState: function getInitialState() {
    return {};
  },
  getDefaultProps: function getDefaultProps() {
    return {
      stacker: new _apemanReactBasic.ApViewStack.Stacker({
        root: _splash_view2.default,
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

    return _react2.default.createElement(
      _apemanReactBasic.ApPage,
      null,
      _react2.default.createElement(_header2.default, null),
      _react2.default.createElement(
        _apemanReactBasic.ApMain,
        null,
        _react2.default.createElement(_apemanReactBasic.ApViewStack, { stacker: props.stacker })
      )
    );
  }
});

exports.default = IndexComponent;
},{"./fragments/header":8,"./views/splash_view":12,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],12:[function(require,module,exports){
/**
 * View for splash
 * @class Splash
 */
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _snippet = require('../fragments/snippet');

var _snippet2 = _interopRequireDefault(_snippet);

var _snippet_service = require('../../services/snippet_service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SplashView = _react2.default.createClass({
  displayName: 'SplashView',
  getInitialState: function getInitialState() {
    return {};
  },
  render: function render() {
    var s = this;
    return _react2.default.createElement(
      _apemanReactBasic.ApView,
      { className: 'splash-view' },
      _react2.default.createElement(
        _apemanReactBasic.ApViewBody,
        null,
        _react2.default.createElement(
          _apemanReactBasic.ApJumbotron,
          { className: 'jumbotron',
            imgSrc: '../images/jumbotron.jpg' },
          _react2.default.createElement(
            _apemanReactBasic.ApJumbotronTitle,
            { className: 'logo-font' },
            'SUGOS'
          ),
          _react2.default.createElement(
            _apemanReactBasic.ApJumbotronText,
            null,
            'Super Ultra Gorgeous Outstanding Special'
          )
        ),
        _react2.default.createElement(
          _apemanReactBasic.ApArticle,
          null,
          _react2.default.createElement(_snippet2.default, { src: _snippet_service.singleton.getSnippet('exampleCloud') })
        )
      )
    );
  },
  componentDidMount: function componentDidMount() {}
});

module.exports = SplashView;
},{"../../services/snippet_service":14,"../fragments/snippet":10,"apeman-react-basic":"apeman-react-basic","react":"react"}],13:[function(require,module,exports){
/**
 * @namespace SnippetConstants
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exampleCloud = undefined;

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

var exampleCloud = (0, _apeHighlighting.highlightJsx)(read(require.resolve('sugos/example/modules/example-cloud.js')));

exports.exampleCloud = exampleCloud;
},{"ape-highlighting":16,"fs":1}],14:[function(require,module,exports){
/**
 * @class SnippetService
 */
'use strict';

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
},{"../constants/snippet_constants":13}],15:[function(require,module,exports){
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
  return [
    '<div>',
    '<style scoped="scoped">' + style + '</style>',
    nsh.highlight(src, jsx, { gutter: false }
    ),
    '</div>'
  ].join('')
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

},{"fs":1,"jsx-syntaxhighlighter":17,"node-syntaxhighlighter":21}],16:[function(require,module,exports){
/**
 * ape framework module for highlighting.
 * @module ape-highlighting
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get highlightJsx () { return d(require('./highlight_jsx')) }
}

},{"./highlight_jsx":15}],17:[function(require,module,exports){
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

},{"node-syntaxhighlighter/lib/scripts/XRegExp":19,"node-syntaxhighlighter/lib/scripts/shCore":20}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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

},{"./XRegExp":19}],21:[function(require,module,exports){
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

},{"./inline-scripts":18,"fs":1,"path":3,"util":6}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsImxpYi9icm93c2VyL2luZGV4LmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvaGVhZGVyLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2xvZ28uanMiLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvc25pcHBldC5qcyIsImxpYi9jb21wb25lbnRzL2luZGV4LmNvbXBvbmVudC5qcyIsImxpYi9jb21wb25lbnRzL3ZpZXdzL3NwbGFzaF92aWV3LmpzIiwibGliL2NvbnN0YW50cy9zbmlwcGV0X2NvbnN0YW50cy5qcyIsImxpYi9zZXJ2aWNlcy9zbmlwcGV0X3NlcnZpY2UuanMiLCJub2RlX21vZHVsZXMvYXBlLWhpZ2hsaWdodGluZy9saWIvaGlnaGxpZ2h0X2pzeC5qcyIsIm5vZGVfbW9kdWxlcy9hcGUtaGlnaGxpZ2h0aW5nL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qc3gtc3ludGF4aGlnaGxpZ2h0ZXIvc2hCcnVzaEpzeC5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXN5bnRheGhpZ2hsaWdodGVyL2lubGluZS1zY3JpcHRzLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbGliL3NjcmlwdHMvWFJlZ0V4cC5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXN5bnRheGhpZ2hsaWdodGVyL2xpYi9zY3JpcHRzL3NoQ29yZS5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXN5bnRheGhpZ2hsaWdodGVyL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDenBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdCA9IHJlcXVpcmUoJ2FwZW1hbi1icndzLXJlYWN0Jyk7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwZW1hbkJyd3NSZWFjdCk7XG5cbnZhciBfaW5kZXggPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2luZGV4LmNvbXBvbmVudCcpO1xuXG52YXIgX2luZGV4MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2luZGV4KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENPTlRBSU5FUl9JRCA9ICdpbmRleC13cmFwJztcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfd2luZG93ID0gd2luZG93O1xuICB2YXIgbG9jYWxlID0gX3dpbmRvdy5sb2NhbGU7XG5cbiAgX2FwZW1hbkJyd3NSZWFjdDIuZGVmYXVsdC5yZW5kZXIoQ09OVEFJTkVSX0lELCBfaW5kZXgyLmRlZmF1bHQsIHtcbiAgICBsb2NhbGU6IGxvY2FsZVxuICB9LCBmdW5jdGlvbiBkb25lKCkge1xuICAgIC8vIFRoZSBjb21wb25lbnQgaXMgcmVhZHkuXG4gIH0pO1xufTsiLCIvKipcbiAqIEhlYWRlciBjb21wb25lbnRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2xvZ28gPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvbG9nbycpO1xuXG52YXIgX2xvZ28yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9nbyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBIZWFkZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGFiOiBfcmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFiOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciB0YWIgPSBwcm9wcy50YWI7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG4gICAgdmFyIF90YWJJdGVtID0gX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWJJdGVtLmNyZWF0ZUl0ZW07XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXIsXG4gICAgICB7IGNsYXNzTmFtZTogJ2hlYWRlcicgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcENvbnRhaW5lcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJMb2dvLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2xvZ28yLmRlZmF1bHQsIG51bGwpXG4gICAgICAgICksXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyVGFiLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3RhYkl0ZW0obCgncGFnZXMuRE9DU19QQUdFJyksICcuL2RvY3MuaHRtbCcsIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0RPQ1MnIH0pLFxuICAgICAgICAgIF90YWJJdGVtKGwoJ3BhZ2VzLkNBU0VTX1BBR0UnKSwgJy4vY2FzZXMuaHRtbCcsIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0NBU0VTJyB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEhlYWRlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIExvZ28gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0xvZ28nLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2gxJyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnbG9nbycgfSxcbiAgICAgICdTVUdPUydcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9nbzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFNuaXBwZXQgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1NuaXBwZXQnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZFxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgncHJlJywgeyBjbGFzc05hbWU6ICdzbmlwcGV0JywgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHsgX19odG1sOiBwcm9wcy5zcmMgfSB9KTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNuaXBwZXQ7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2hlYWRlciA9IHJlcXVpcmUoJy4vZnJhZ21lbnRzL2hlYWRlcicpO1xuXG52YXIgX2hlYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWFkZXIpO1xuXG52YXIgX3NwbGFzaF92aWV3ID0gcmVxdWlyZSgnLi92aWV3cy9zcGxhc2hfdmlldycpO1xuXG52YXIgX3NwbGFzaF92aWV3MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NwbGFzaF92aWV3KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEluZGV4Q29tcG9uZW50ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdJbmRleENvbXBvbmVudCcsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWNrZXI6IG5ldyBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjay5TdGFja2VyKHtcbiAgICAgICAgcm9vdDogX3NwbGFzaF92aWV3Mi5kZWZhdWx0LFxuICAgICAgICByb290UHJvcHM6IHt9XG4gICAgICB9KVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgcy5yZWdpc3RlckxvY2FsZShwcm9wcy5sb2NhbGUpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwUGFnZSxcbiAgICAgIG51bGwsXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfaGVhZGVyMi5kZWZhdWx0LCBudWxsKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcE1haW4sXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLCB7IHN0YWNrZXI6IHByb3BzLnN0YWNrZXIgfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSW5kZXhDb21wb25lbnQ7IiwiLyoqXG4gKiBWaWV3IGZvciBzcGxhc2hcbiAqIEBjbGFzcyBTcGxhc2hcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX3NuaXBwZXQgPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvc25pcHBldCcpO1xuXG52YXIgX3NuaXBwZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc25pcHBldCk7XG5cbnZhciBfc25pcHBldF9zZXJ2aWNlID0gcmVxdWlyZSgnLi4vLi4vc2VydmljZXMvc25pcHBldF9zZXJ2aWNlJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBTcGxhc2hWaWV3ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdTcGxhc2hWaWV3JyxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3LFxuICAgICAgeyBjbGFzc05hbWU6ICdzcGxhc2gtdmlldycgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdCb2R5LFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEp1bWJvdHJvbixcbiAgICAgICAgICB7IGNsYXNzTmFtZTogJ2p1bWJvdHJvbicsXG4gICAgICAgICAgICBpbWdTcmM6ICcuLi9pbWFnZXMvanVtYm90cm9uLmpwZycgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSnVtYm90cm9uVGl0bGUsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2xvZ28tZm9udCcgfSxcbiAgICAgICAgICAgICdTVUdPUydcbiAgICAgICAgICApLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBKdW1ib3Ryb25UZXh0LFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICdTdXBlciBVbHRyYSBHb3JnZW91cyBPdXRzdGFuZGluZyBTcGVjaWFsJ1xuICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBBcnRpY2xlLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3NuaXBwZXQyLmRlZmF1bHQsIHsgc3JjOiBfc25pcHBldF9zZXJ2aWNlLnNpbmdsZXRvbi5nZXRTbmlwcGV0KCdleGFtcGxlQ2xvdWQnKSB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge31cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwbGFzaFZpZXc7IiwiLyoqXG4gKiBAbmFtZXNwYWNlIFNuaXBwZXRDb25zdGFudHNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmV4YW1wbGVDbG91ZCA9IHVuZGVmaW5lZDtcblxudmFyIF9hcGVIaWdobGlnaHRpbmcgPSByZXF1aXJlKCdhcGUtaGlnaGxpZ2h0aW5nJyk7XG5cbnZhciBfZnMgPSByZXF1aXJlKCdmcycpO1xuXG52YXIgX2ZzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGV4aXN0cyA9IGZ1bmN0aW9uIGV4aXN0cyhmaWxlbmFtZSkge1xuICByZXR1cm4gX2ZzMi5kZWZhdWx0LmV4aXN0c1N5bmMgJiYgX2ZzMi5kZWZhdWx0LmV4aXN0c1N5bmMoZmlsZW5hbWUpO1xufTtcbnZhciByZWFkID0gZnVuY3Rpb24gcmVhZChmaWxlbmFtZSkge1xuICByZXR1cm4gZXhpc3RzKGZpbGVuYW1lKSAmJiBfZnMyLmRlZmF1bHQucmVhZEZpbGVTeW5jKGZpbGVuYW1lKS50b1N0cmluZygpIHx8IG51bGw7XG59O1xuXG52YXIgZXhhbXBsZUNsb3VkID0gKDAsIF9hcGVIaWdobGlnaHRpbmcuaGlnaGxpZ2h0SnN4KShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9tb2R1bGVzL2V4YW1wbGUtY2xvdWQuanMnKSkpO1xuXG5leHBvcnRzLmV4YW1wbGVDbG91ZCA9IGV4YW1wbGVDbG91ZDsiLCIvKipcbiAqIEBjbGFzcyBTbmlwcGV0U2VydmljZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBTbmlwcGV0U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU25pcHBldFNlcnZpY2UoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNuaXBwZXRTZXJ2aWNlKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTbmlwcGV0U2VydmljZSwgW3tcbiAgICBrZXk6ICdnZXRTbmlwcGV0JyxcblxuICAgIC8qKlxuICAgICAqIEdldCBzbmlwcGV0IHdpdGggbmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzbmlwcGV0XG4gICAgICogQHJldHVybnMgez9zdHJpbmd9IC0gTWF0Y2hlZCBzbmlwcGV0XG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFNuaXBwZXQobmFtZSkge1xuICAgICAgdmFyIHMgPSB0aGlzO1xuICAgICAgdmFyIHNuaXBwZXRzID0gcy5fZ2V0U25pcHBldHMoKTtcbiAgICAgIHJldHVybiBzbmlwcGV0c1tuYW1lXTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfZ2V0U25pcHBldHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0U25pcHBldHMoKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoJy4uL2NvbnN0YW50cy9zbmlwcGV0X2NvbnN0YW50cycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpbmRvdy5zbmlwcGV0cztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU25pcHBldFNlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgU25pcHBldFNlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihTbmlwcGV0U2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gU25pcHBldFNlcnZpY2U7IiwiLyoqXG4gKiBAZnVuY3Rpb24gaGlnaGxpZ2h0SnN4XG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjIC0gU291cmNlIHN0cmluZy5cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gT3B0aW9uYWwgc2V0dGluZ3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAtIEhpZ2hsaWdodGVkIHN0cmluZy5cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgbnNoID0gcmVxdWlyZSgnbm9kZS1zeW50YXhoaWdobGlnaHRlcicpXG5jb25zdCBqc3ggPSByZXF1aXJlKCdqc3gtc3ludGF4aGlnaGxpZ2h0ZXInKVxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5cbi8qKiBAbGVuZHMgaGlnaGxpZ2h0SnN4ICovXG5mdW5jdGlvbiBoaWdobGlnaHRKc3ggKHNyYywgb3B0aW9ucyA9IHt9KSB7XG4gIGxldCBzdHlsZSA9IGhpZ2hsaWdodEpzeC5zdHlsZSgpXG4gIHJldHVybiBbXG4gICAgJzxkaXY+JyxcbiAgICAnPHN0eWxlIHNjb3BlZD1cInNjb3BlZFwiPicgKyBzdHlsZSArICc8L3N0eWxlPicsXG4gICAgbnNoLmhpZ2hsaWdodChzcmMsIGpzeCwgeyBndXR0ZXI6IGZhbHNlIH1cbiAgICApLFxuICAgICc8L2Rpdj4nXG4gIF0uam9pbignJylcbn1cblxuaGlnaGxpZ2h0SnN4LnN0eWxlID0gZnVuY3Rpb24gKCkge1xuICBsZXQgZmlsZW5hbWUgPSBuc2guZ2V0U3R5bGVzKClbIDAgXS5zb3VyY2VQYXRoXG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUpLnRvU3RyaW5nKClcbn1cblxuaGlnaGxpZ2h0SnN4LmZyb21GaWxlID0gZnVuY3Rpb24gKGZpbGVuYW1lLCBvcHRpb25zKSB7XG4gIGxldCBzcmMgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUpLnRvU3RyaW5nKClcbiAgcmV0dXJuIGhpZ2hsaWdodEpzeChzcmMsIG9wdGlvbnMpXG59XG5tb2R1bGUuZXhwb3J0cyA9IGhpZ2hsaWdodEpzeFxuIiwiLyoqXG4gKiBhcGUgZnJhbWV3b3JrIG1vZHVsZSBmb3IgaGlnaGxpZ2h0aW5nLlxuICogQG1vZHVsZSBhcGUtaGlnaGxpZ2h0aW5nXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmxldCBkID0gKG1vZHVsZSkgPT4gbW9kdWxlLmRlZmF1bHQgfHwgbW9kdWxlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgaGlnaGxpZ2h0SnN4ICgpIHsgcmV0dXJuIGQocmVxdWlyZSgnLi9oaWdobGlnaHRfanN4JykpIH1cbn1cbiIsInZhciBYUmVnRXhwID0gcmVxdWlyZShcIm5vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbGliL3NjcmlwdHMvWFJlZ0V4cFwiKS5YUmVnRXhwO1xyXG52YXIgU3ludGF4SGlnaGxpZ2h0ZXI7XHJcbjsoZnVuY3Rpb24oKVxyXG57XHJcblx0Ly8gQ29tbW9uSlNcclxuXHRTeW50YXhIaWdobGlnaHRlciA9IFN5bnRheEhpZ2hsaWdodGVyIHx8ICh0eXBlb2YgcmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCc/IHJlcXVpcmUoXCJub2RlLXN5bnRheGhpZ2hsaWdodGVyL2xpYi9zY3JpcHRzL3NoQ29yZVwiKS5TeW50YXhIaWdobGlnaHRlciA6IG51bGwpO1xyXG5cclxuXHRmdW5jdGlvbiBCcnVzaCgpXHJcblx0e1xyXG5cdFx0ZnVuY3Rpb24gcHJvY2VzcyhtYXRjaCwgcmVnZXhJbmZvKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgY29uc3RydWN0b3IgPSBTeW50YXhIaWdobGlnaHRlci5NYXRjaCxcclxuXHRcdFx0XHRjb2RlID0gbWF0Y2hbMF0sXHJcblx0XHRcdFx0dGFnID0gbmV3IFhSZWdFeHAoJygmbHQ7fDwpW1xcXFxzXFxcXC9cXFxcP10qKD88bmFtZT5bOlxcXFx3LVxcXFwuXSspJywgJ3hnJykuZXhlYyhjb2RlKSxcclxuXHRcdFx0XHRyZXN1bHQgPSBbXVxyXG5cdFx0XHRcdDtcclxuXHRcdFxyXG5cdFx0XHRpZiAobWF0Y2guYXR0cmlidXRlcyAhPSBudWxsKSBcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBhdHRyaWJ1dGVzLFxyXG5cdFx0XHRcdFx0cmVnZXggPSBuZXcgWFJlZ0V4cCgnKD88bmFtZT4gW1xcXFx3OlxcXFwtXFxcXC5dKyknICtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQnXFxcXHMqPVxcXFxzKicgK1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCcoPzx2YWx1ZT4gXCIuKj9cInxcXCcuKj9cXCd8XFxcXHcrKScsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0J3hnJyk7XHJcblxyXG5cdFx0XHRcdHdoaWxlICgoYXR0cmlidXRlcyA9IHJlZ2V4LmV4ZWMoY29kZSkpICE9IG51bGwpIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzLm5hbWUsIG1hdGNoLmluZGV4ICsgYXR0cmlidXRlcy5pbmRleCwgJ2NvbG9yMScpKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzLnZhbHVlLCBtYXRjaC5pbmRleCArIGF0dHJpYnV0ZXMuaW5kZXggKyBhdHRyaWJ1dGVzWzBdLmluZGV4T2YoYXR0cmlidXRlcy52YWx1ZSksICdzdHJpbmcnKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAodGFnICE9IG51bGwpXHJcblx0XHRcdFx0cmVzdWx0LnB1c2goXHJcblx0XHRcdFx0XHRuZXcgY29uc3RydWN0b3IodGFnLm5hbWUsIG1hdGNoLmluZGV4ICsgdGFnWzBdLmluZGV4T2YodGFnLm5hbWUpLCAna2V5d29yZCcpXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBrZXl3b3JkcyA9XHQnYnJlYWsgY2FzZSBjYXRjaCBjb250aW51ZSAnICtcclxuXHRcdFx0XHRcdFx0J2RlZmF1bHQgZGVsZXRlIGRvIGVsc2UgZmFsc2UgICcgK1xyXG5cdFx0XHRcdFx0XHQnZm9yIGZ1bmN0aW9uIGlmIGluIGluc3RhbmNlb2YgJyArXHJcblx0XHRcdFx0XHRcdCduZXcgbnVsbCByZXR1cm4gc3VwZXIgc3dpdGNoICcgK1xyXG5cdFx0XHRcdFx0XHQndGhpcyB0aHJvdyB0cnVlIHRyeSB0eXBlb2YgdmFyIHdoaWxlIHdpdGgnXHJcblx0XHRcdFx0XHRcdDtcclxuXHJcblx0XHR2YXIgciA9IFN5bnRheEhpZ2hsaWdodGVyLnJlZ2V4TGliO1xyXG5cdFxyXG5cdFx0dGhpcy5yZWdleExpc3QgPSBbXHJcblx0XHRcdHsgcmVnZXg6IHIubXVsdGlMaW5lRG91YmxlUXVvdGVkU3RyaW5nLFx0XHRcdFx0XHRjc3M6ICdzdHJpbmcnIH0sXHRcdFx0Ly8gZG91YmxlIHF1b3RlZCBzdHJpbmdzXHJcblx0XHRcdHsgcmVnZXg6IHIubXVsdGlMaW5lU2luZ2xlUXVvdGVkU3RyaW5nLFx0XHRcdFx0XHRjc3M6ICdzdHJpbmcnIH0sXHRcdFx0Ly8gc2luZ2xlIHF1b3RlZCBzdHJpbmdzXHJcblx0XHRcdHsgcmVnZXg6IHIuc2luZ2xlTGluZUNDb21tZW50cyxcdFx0XHRcdFx0XHRcdGNzczogJ2NvbW1lbnRzJyB9LFx0XHRcdC8vIG9uZSBsaW5lIGNvbW1lbnRzXHJcblx0XHRcdHsgcmVnZXg6IHIubXVsdGlMaW5lQ0NvbW1lbnRzLFx0XHRcdFx0XHRcdFx0Y3NzOiAnY29tbWVudHMnIH0sXHRcdFx0Ly8gbXVsdGlsaW5lIGNvbW1lbnRzXHJcblx0XHRcdHsgcmVnZXg6IC9cXHMqIy4qL2dtLFx0XHRcdFx0XHRcdFx0XHRcdGNzczogJ3ByZXByb2Nlc3NvcicgfSxcdFx0Ly8gcHJlcHJvY2Vzc29yIHRhZ3MgbGlrZSAjcmVnaW9uIGFuZCAjZW5kcmVnaW9uXHJcblx0XHRcdHsgcmVnZXg6IG5ldyBSZWdFeHAodGhpcy5nZXRLZXl3b3JkcyhrZXl3b3JkcyksICdnbScpLFx0Y3NzOiAna2V5d29yZCcgfSxcclxuXHRcdFx0XHJcblx0XHRcdHsgcmVnZXg6IG5ldyBYUmVnRXhwKCcoXFxcXCZsdDt8PClcXFxcIVxcXFxbW1xcXFx3XFxcXHNdKj9cXFxcWygufFxcXFxzKSo/XFxcXF1cXFxcXShcXFxcJmd0O3w+KScsICdnbScpLFx0XHRcdGNzczogJ2NvbG9yMicgfSxcdC8vIDwhWyAuLi4gWyAuLi4gXV0+XHJcblx0XHRcdHsgcmVnZXg6IFN5bnRheEhpZ2hsaWdodGVyLnJlZ2V4TGliLnhtbENvbW1lbnRzLFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNzczogJ2NvbW1lbnRzJyB9LFx0Ly8gPCEtLSAuLi4gLS0+XHJcblx0XHRcdHsgcmVnZXg6IG5ldyBYUmVnRXhwKCcoJmx0O3w8KVtcXFxcc1xcXFwvXFxcXD9dKihcXFxcdyspKD88YXR0cmlidXRlcz4uKj8pW1xcXFxzXFxcXC9cXFxcP10qKCZndDt8PiknLCAnc2cnKSwgZnVuYzogcHJvY2VzcyB9XHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHR0aGlzLmZvckh0bWxTY3JpcHQoci5zY3JpcHRTY3JpcHRUYWdzKTtcclxuXHR9O1xyXG5cclxuXHRCcnVzaC5wcm90b3R5cGVcdD0gbmV3IFN5bnRheEhpZ2hsaWdodGVyLkhpZ2hsaWdodGVyKCk7XHJcblx0QnJ1c2guYWxpYXNlc1x0PSBbJ2pzeCddO1xyXG5cclxuXHRTeW50YXhIaWdobGlnaHRlci5icnVzaGVzLkpTWCA9IEJydXNoO1xyXG5cclxuXHQvLyBDb21tb25KU1xyXG5cdHR5cGVvZihleHBvcnRzKSAhPSAndW5kZWZpbmVkJyA/IGV4cG9ydHMuQnJ1c2ggPSBCcnVzaCA6IG51bGw7XHJcbn0pKCk7XHJcbiIsIi8qanNoaW50IGxheGJyZWFrOiB0cnVlICovXG5cbnZhciBjb2RlUGF0dGVybiA9IC88dGQgY2xhc3M9XCJjb2RlXCIuKj88XFwvdGQ+L1xuICAsIGFsbFNjcmlwdFRhZ3MgPSBbXG4gICAgICBcbiAgICAgICAgLy8gPHNjcmlwdD4gLi4uIDwvc2NyaXB0PlxuICAgICAgICB7IG9wZW46IC88c2NyaXB0W14+XSo+LywgY2xvc2U6IC88XFwvc2NyaXB0W14+XSo+LywgYWxpYXM6ICdqcycgfVxuXG4gICAgICAgIC8vIDw/IC4uLiA/PlxuICAgICAgLCB7IG9wZW46IC9eXFxzKjxcXD9cXHMqJC8sIGNsb3NlOiAvXlxccypcXD8+XFxzKiQvLCAgYWxpYXM6ICdwaHAnIH1cblxuICAgICAgICAvLyA8IVtDREFUQVsgLi4uIF1dICAgICAtLSAoaW5saW5lIGFjdGlvbnNjcmlwdCkgb25seSB1c2VkIGZvciB4aHRtbFxuICAgICAgLCB7IG9wZW46IC9eXFxzKj88IVxcW0NEQVRBXFxbXFxzKj8kLywgY2xvc2U6IC9eXFxzKj9cXF1cXF0+XFxzKj8kLywgYWxpYXM6ICdhczMnLCBhcHBseVRvOiAneGh0bWwnIH1cbiAgICBdO1xuXG5mdW5jdGlvbiBmaW5kU2NyaXB0cyhsaW5lcywgc3BlY2lmaWVkQWxpYXMpIHtcbiAgdmFyIHNjcmlwdHMgPSBbXVxuICAgICwgaW5TY3JpcHQgPSBmYWxzZVxuICAgICwgY3VycmVudFNjcmlwdFxuICAgICwgc2NyaXB0VGFncyA9IGFsbFNjcmlwdFRhZ3NcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgLy8gRS5nLiwgaW4gY2FzZSBvZiAhW0NEQVRBIG1ha2Ugc3VyZSB3ZSBvbmx5IGhpZ2hsaWdodCBpZiB1c2VyIHNwZWNpZmllZCB4aHRtbFxuICAgICAgICAgIHJldHVybiAhdGFnLmFwcGx5VG8gfHwgdGFnLmFwcGx5VG8gPT09IHNwZWNpZmllZEFsaWFzO1xuICAgICAgICB9KTtcblxuICBmb3IgKHZhciBsaW5lTnVtICA9IDA7IGxpbmVOdW0gPCBsaW5lcy5sZW5ndGg7IGxpbmVOdW0rKykge1xuICAgIHZhciBsaW5lID0gbGluZXNbbGluZU51bV07XG5cbiAgICBpZiAoIWluU2NyaXB0KSB7XG4gICAgICB2YXIgbWF0Y2hpbmdUYWcgPSBudWxsO1xuXG4gICAgICBmb3IgKHZhciB0YWdJbmRleCA9IDA7IHRhZ0luZGV4IDwgc2NyaXB0VGFncy5sZW5ndGg7IHRhZ0luZGV4KyspIHtcbiAgICAgICAgdmFyIHRhZyA9IHNjcmlwdFRhZ3NbdGFnSW5kZXhdO1xuXG4gICAgICAgIGlmIChsaW5lLm1hdGNoKHRhZy5vcGVuKSkgeyBcbiAgICAgICAgICBtYXRjaGluZ1RhZyA9IHRhZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWF0Y2hpbmdUYWcpIHtcbiAgICAgICAgaW5TY3JpcHQgPSB0cnVlO1xuICAgICAgICBjdXJyZW50U2NyaXB0ID0geyBmcm9tOiBsaW5lTnVtICsgMSwgY29kZTogJycsIHRhZzogbWF0Y2hpbmdUYWcgfTtcbiAgICAgIH1cblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGxpbmUubWF0Y2goY3VycmVudFNjcmlwdC50YWcuY2xvc2UpKSB7XG4gICAgICBpblNjcmlwdCA9IGZhbHNlO1xuICAgICAgY3VycmVudFNjcmlwdC50byA9IGxpbmVOdW0gLSAxO1xuICAgICAgc2NyaXB0cy5wdXNoKGN1cnJlbnRTY3JpcHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY3VycmVudFNjcmlwdC5jb2RlICs9IGxpbmUgKyAnXFxuJztcbiAgfVxuXG4gIHJldHVybiBzY3JpcHRzO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0TGluZXMoaHRtbCkge1xuICB2YXIgY29kZSA9IGh0bWwubWF0Y2goY29kZVBhdHRlcm4pWzBdXG4gICAgLCBsaW5lcyA9IGNvZGUubWF0Y2goLzxkaXYgK2NsYXNzPVwibGluZSAuKz88XFwvZGl2Pi9tZyk7XG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlUGxhaW5MaW5lcyhmcm9tSW5kZXgsIHRvSW5kZXgsIGh0bWwsIHJlcGxhY2VtZW50KSB7XG4gIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKFxuICAgICAgICAgICc8ZGl2ICtjbGFzcz1cIlteXCJdKz9pbmRleCcgKyBmcm9tSW5kZXggKyAnW15cIl0qXCInICAvLyBvcGVuaW5nIHRhZyBvZiBzdGFydFxuICAgICAgICArICcuKycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNjcmlwdCBodG1sXG4gICAgICAgICsgJzxkaXYgK2NsYXNzPVwiW15cIl0rP2luZGV4JyArIHRvSW5kZXggKyAnW15cIl0qXCInICAgIC8vIG9wZW5pbmcgdGFnIG9mIGVuZFxuICAgICAgICArICcuKz88L2Rpdj4nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsb3NpbmcgdGFnIG9mIGVuZFxuICAgICAgKVxuICAgICwgY29kZSAgICAgICAgICAgICAgICA9ICBodG1sLm1hdGNoKGNvZGVQYXR0ZXJuKVswXVxuICAgICwgY29kZVdpdGhSZXBsYWNlbWVudCA9ICBjb2RlLnJlcGxhY2UocmVnZXhwLCByZXBsYWNlbWVudCk7XG5cbiAgcmV0dXJuIGh0bWwucmVwbGFjZShjb2RlLCBjb2RlV2l0aFJlcGxhY2VtZW50KTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBmaW5kU2NyaXB0cyAgICAgICA6ICBmaW5kU2NyaXB0c1xuICAsIGV4dHJhY3RMaW5lcyAgICAgIDogIGV4dHJhY3RMaW5lc1xuICAsIHJlcGxhY2VQbGFpbkxpbmVzIDogIHJlcGxhY2VQbGFpbkxpbmVzXG59O1xuIiwiLy8gWFJlZ0V4cCAxLjUuMVxuLy8gKGMpIDIwMDctMjAxMiBTdGV2ZW4gTGV2aXRoYW5cbi8vIE1JVCBMaWNlbnNlXG4vLyA8aHR0cDovL3hyZWdleHAuY29tPlxuLy8gUHJvdmlkZXMgYW4gYXVnbWVudGVkLCBleHRlbnNpYmxlLCBjcm9zcy1icm93c2VyIGltcGxlbWVudGF0aW9uIG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMsXG4vLyBpbmNsdWRpbmcgc3VwcG9ydCBmb3IgYWRkaXRpb25hbCBzeW50YXgsIGZsYWdzLCBhbmQgbWV0aG9kc1xuXG52YXIgWFJlZ0V4cDtcblxuaWYgKFhSZWdFeHApIHtcbiAgICAvLyBBdm9pZCBydW5uaW5nIHR3aWNlLCBzaW5jZSB0aGF0IHdvdWxkIGJyZWFrIHJlZmVyZW5jZXMgdG8gbmF0aXZlIGdsb2JhbHNcbiAgICB0aHJvdyBFcnJvcihcImNhbid0IGxvYWQgWFJlZ0V4cCB0d2ljZSBpbiB0aGUgc2FtZSBmcmFtZVwiKTtcbn1cblxuLy8gUnVuIHdpdGhpbiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gdG8gcHJvdGVjdCB2YXJpYWJsZXMgYW5kIGF2b2lkIG5ldyBnbG9iYWxzXG4oZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgQ29uc3RydWN0b3JcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gQWNjZXB0cyBhIHBhdHRlcm4gYW5kIGZsYWdzOyByZXR1cm5zIGEgbmV3LCBleHRlbmRlZCBgUmVnRXhwYCBvYmplY3QuIERpZmZlcnMgZnJvbSBhIG5hdGl2ZVxuICAgIC8vIHJlZ3VsYXIgZXhwcmVzc2lvbiBpbiB0aGF0IGFkZGl0aW9uYWwgc3ludGF4IGFuZCBmbGFncyBhcmUgc3VwcG9ydGVkIGFuZCBjcm9zcy1icm93c2VyXG4gICAgLy8gc3ludGF4IGluY29uc2lzdGVuY2llcyBhcmUgYW1lbGlvcmF0ZWQuIGBYUmVnRXhwKC9yZWdleC8pYCBjbG9uZXMgYW4gZXhpc3RpbmcgcmVnZXggYW5kXG4gICAgLy8gY29udmVydHMgdG8gdHlwZSBYUmVnRXhwXG4gICAgWFJlZ0V4cCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBmbGFncykge1xuICAgICAgICB2YXIgb3V0cHV0ID0gW10sXG4gICAgICAgICAgICBjdXJyU2NvcGUgPSBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgICAgICBwb3MgPSAwLFxuICAgICAgICAgICAgY29udGV4dCwgdG9rZW5SZXN1bHQsIG1hdGNoLCBjaHIsIHJlZ2V4O1xuXG4gICAgICAgIGlmIChYUmVnRXhwLmlzUmVnRXhwKHBhdHRlcm4pKSB7XG4gICAgICAgICAgICBpZiAoZmxhZ3MgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJjYW4ndCBzdXBwbHkgZmxhZ3Mgd2hlbiBjb25zdHJ1Y3Rpbmcgb25lIFJlZ0V4cCBmcm9tIGFub3RoZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gY2xvbmUocGF0dGVybik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVG9rZW5zIGJlY29tZSBwYXJ0IG9mIHRoZSByZWdleCBjb25zdHJ1Y3Rpb24gcHJvY2Vzcywgc28gcHJvdGVjdCBhZ2FpbnN0IGluZmluaXRlXG4gICAgICAgIC8vIHJlY3Vyc2lvbiB3aGVuIGFuIFhSZWdFeHAgaXMgY29uc3RydWN0ZWQgd2l0aGluIGEgdG9rZW4gaGFuZGxlciBvciB0cmlnZ2VyXG4gICAgICAgIGlmIChpc0luc2lkZUNvbnN0cnVjdG9yKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBjYWxsIHRoZSBYUmVnRXhwIGNvbnN0cnVjdG9yIHdpdGhpbiB0b2tlbiBkZWZpbml0aW9uIGZ1bmN0aW9uc1wiKTtcblxuICAgICAgICBmbGFncyA9IGZsYWdzIHx8IFwiXCI7XG4gICAgICAgIGNvbnRleHQgPSB7IC8vIGB0aGlzYCBvYmplY3QgZm9yIGN1c3RvbSB0b2tlbnNcbiAgICAgICAgICAgIGhhc05hbWVkQ2FwdHVyZTogZmFsc2UsXG4gICAgICAgICAgICBjYXB0dXJlTmFtZXM6IFtdLFxuICAgICAgICAgICAgaGFzRmxhZzogZnVuY3Rpb24gKGZsYWcpIHtyZXR1cm4gZmxhZ3MuaW5kZXhPZihmbGFnKSA+IC0xO30sXG4gICAgICAgICAgICBzZXRGbGFnOiBmdW5jdGlvbiAoZmxhZykge2ZsYWdzICs9IGZsYWc7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHdoaWxlIChwb3MgPCBwYXR0ZXJuLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGN1c3RvbSB0b2tlbnMgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gcnVuVG9rZW5zKHBhdHRlcm4sIHBvcywgY3VyclNjb3BlLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgaWYgKHRva2VuUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2godG9rZW5SZXN1bHQub3V0cHV0KTtcbiAgICAgICAgICAgICAgICBwb3MgKz0gKHRva2VuUmVzdWx0Lm1hdGNoWzBdLmxlbmd0aCB8fCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIG5hdGl2ZSBtdWx0aWNoYXJhY3RlciBtZXRhc2VxdWVuY2VzIChleGNsdWRpbmcgY2hhcmFjdGVyIGNsYXNzZXMpIGF0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2ggPSBuYXRpdi5leGVjLmNhbGwobmF0aXZlVG9rZW5zW2N1cnJTY29wZV0sIHBhdHRlcm4uc2xpY2UocG9zKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2gobWF0Y2hbMF0pO1xuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNociA9IHBhdHRlcm4uY2hhckF0KHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaHIgPT09IFwiW1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyclNjb3BlID0gWFJlZ0V4cC5JTlNJREVfQ0xBU1M7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNociA9PT0gXCJdXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyU2NvcGUgPSBYUmVnRXhwLk9VVFNJREVfQ0xBU1M7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgcG9zaXRpb24gb25lIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChjaHIpO1xuICAgICAgICAgICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZWdleCA9IFJlZ0V4cChvdXRwdXQuam9pbihcIlwiKSwgbmF0aXYucmVwbGFjZS5jYWxsKGZsYWdzLCBmbGFnQ2xpcCwgXCJcIikpO1xuICAgICAgICByZWdleC5feHJlZ2V4cCA9IHtcbiAgICAgICAgICAgIHNvdXJjZTogcGF0dGVybixcbiAgICAgICAgICAgIGNhcHR1cmVOYW1lczogY29udGV4dC5oYXNOYW1lZENhcHR1cmUgPyBjb250ZXh0LmNhcHR1cmVOYW1lcyA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlZ2V4O1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFB1YmxpYyBwcm9wZXJ0aWVzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIFhSZWdFeHAudmVyc2lvbiA9IFwiMS41LjFcIjtcblxuICAgIC8vIFRva2VuIHNjb3BlIGJpdGZsYWdzXG4gICAgWFJlZ0V4cC5JTlNJREVfQ0xBU1MgPSAxO1xuICAgIFhSZWdFeHAuT1VUU0lERV9DTEFTUyA9IDI7XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFByaXZhdGUgdmFyaWFibGVzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHZhciByZXBsYWNlbWVudFRva2VuID0gL1xcJCg/OihcXGRcXGQ/fFskJmAnXSl8eyhbJFxcd10rKX0pL2csXG4gICAgICAgIGZsYWdDbGlwID0gL1teZ2lteV0rfChbXFxzXFxTXSkoPz1bXFxzXFxTXSpcXDEpL2csIC8vIE5vbm5hdGl2ZSBhbmQgZHVwbGljYXRlIGZsYWdzXG4gICAgICAgIHF1YW50aWZpZXIgPSAvXig/Ols/KitdfHtcXGQrKD86LFxcZCopP30pXFw/Py8sXG4gICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSBmYWxzZSxcbiAgICAgICAgdG9rZW5zID0gW10sXG4gICAgICAgIC8vIENvcHkgbmF0aXZlIGdsb2JhbHMgZm9yIHJlZmVyZW5jZSAoXCJuYXRpdmVcIiBpcyBhbiBFUzMgcmVzZXJ2ZWQga2V5d29yZClcbiAgICAgICAgbmF0aXYgPSB7XG4gICAgICAgICAgICBleGVjOiBSZWdFeHAucHJvdG90eXBlLmV4ZWMsXG4gICAgICAgICAgICB0ZXN0OiBSZWdFeHAucHJvdG90eXBlLnRlc3QsXG4gICAgICAgICAgICBtYXRjaDogU3RyaW5nLnByb3RvdHlwZS5tYXRjaCxcbiAgICAgICAgICAgIHJlcGxhY2U6IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSxcbiAgICAgICAgICAgIHNwbGl0OiBTdHJpbmcucHJvdG90eXBlLnNwbGl0XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBsaWFudEV4ZWNOcGNnID0gbmF0aXYuZXhlYy5jYWxsKC8oKT8/LywgXCJcIilbMV0gPT09IHVuZGVmaW5lZCwgLy8gY2hlY2sgYGV4ZWNgIGhhbmRsaW5nIG9mIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3Vwc1xuICAgICAgICBjb21wbGlhbnRMYXN0SW5kZXhJbmNyZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgeCA9IC9eL2c7XG4gICAgICAgICAgICBuYXRpdi50ZXN0LmNhbGwoeCwgXCJcIik7XG4gICAgICAgICAgICByZXR1cm4gIXgubGFzdEluZGV4O1xuICAgICAgICB9KCksXG4gICAgICAgIGhhc05hdGl2ZVkgPSBSZWdFeHAucHJvdG90eXBlLnN0aWNreSAhPT0gdW5kZWZpbmVkLFxuICAgICAgICBuYXRpdmVUb2tlbnMgPSB7fTtcblxuICAgIC8vIGBuYXRpdmVUb2tlbnNgIG1hdGNoIG5hdGl2ZSBtdWx0aWNoYXJhY3RlciBtZXRhc2VxdWVuY2VzIG9ubHkgKGluY2x1ZGluZyBkZXByZWNhdGVkIG9jdGFscyxcbiAgICAvLyBleGNsdWRpbmcgY2hhcmFjdGVyIGNsYXNzZXMpXG4gICAgbmF0aXZlVG9rZW5zW1hSZWdFeHAuSU5TSURFX0NMQVNTXSA9IC9eKD86XFxcXCg/OlswLTNdWzAtN117MCwyfXxbNC03XVswLTddP3x4W1xcZEEtRmEtZl17Mn18dVtcXGRBLUZhLWZdezR9fGNbQS1aYS16XXxbXFxzXFxTXSkpLztcbiAgICBuYXRpdmVUb2tlbnNbWFJlZ0V4cC5PVVRTSURFX0NMQVNTXSA9IC9eKD86XFxcXCg/OjAoPzpbMC0zXVswLTddezAsMn18WzQtN11bMC03XT8pP3xbMS05XVxcZCp8eFtcXGRBLUZhLWZdezJ9fHVbXFxkQS1GYS1mXXs0fXxjW0EtWmEtel18W1xcc1xcU10pfFxcKFxcP1s6PSFdfFs/KitdXFw/fHtcXGQrKD86LFxcZCopP31cXD8/KS87XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFB1YmxpYyBtZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIExldHMgeW91IGV4dGVuZCBvciBjaGFuZ2UgWFJlZ0V4cCBzeW50YXggYW5kIGNyZWF0ZSBjdXN0b20gZmxhZ3MuIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IGJ5XG4gICAgLy8gdGhlIFhSZWdFeHAgbGlicmFyeSBhbmQgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIFhSZWdFeHAgcGx1Z2lucy4gVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCBmb3JcbiAgICAvLyB1c2VycyB3aXRoIGFkdmFuY2VkIGtub3dsZWRnZSBvZiBKYXZhU2NyaXB0J3MgcmVndWxhciBleHByZXNzaW9uIHN5bnRheCBhbmQgYmVoYXZpb3IuIEl0IGNhblxuICAgIC8vIGJlIGRpc2FibGVkIGJ5IGBYUmVnRXhwLmZyZWV6ZVRva2Vuc2BcbiAgICBYUmVnRXhwLmFkZFRva2VuID0gZnVuY3Rpb24gKHJlZ2V4LCBoYW5kbGVyLCBzY29wZSwgdHJpZ2dlcikge1xuICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICBwYXR0ZXJuOiBjbG9uZShyZWdleCwgXCJnXCIgKyAoaGFzTmF0aXZlWSA/IFwieVwiIDogXCJcIikpLFxuICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZSB8fCBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgICAgICB0cmlnZ2VyOiB0cmlnZ2VyIHx8IG51bGxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBwYXR0ZXJuIGFuZCBmbGFnczsgcmV0dXJucyBhbiBleHRlbmRlZCBgUmVnRXhwYCBvYmplY3QuIElmIHRoZSBwYXR0ZXJuIGFuZCBmbGFnXG4gICAgLy8gY29tYmluYXRpb24gaGFzIHByZXZpb3VzbHkgYmVlbiBjYWNoZWQsIHRoZSBjYWNoZWQgY29weSBpcyByZXR1cm5lZDsgb3RoZXJ3aXNlIHRoZSBuZXdseVxuICAgIC8vIGNyZWF0ZWQgcmVnZXggaXMgY2FjaGVkXG4gICAgWFJlZ0V4cC5jYWNoZSA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBmbGFncykge1xuICAgICAgICB2YXIga2V5ID0gcGF0dGVybiArIFwiL1wiICsgKGZsYWdzIHx8IFwiXCIpO1xuICAgICAgICByZXR1cm4gWFJlZ0V4cC5jYWNoZVtrZXldIHx8IChYUmVnRXhwLmNhY2hlW2tleV0gPSBYUmVnRXhwKHBhdHRlcm4sIGZsYWdzKSk7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBgUmVnRXhwYCBpbnN0YW5jZTsgcmV0dXJucyBhIGNvcHkgd2l0aCB0aGUgYC9nYCBmbGFnIHNldC4gVGhlIGNvcHkgaGFzIGEgZnJlc2hcbiAgICAvLyBgbGFzdEluZGV4YCAoc2V0IHRvIHplcm8pLiBJZiB5b3Ugd2FudCB0byBjb3B5IGEgcmVnZXggd2l0aG91dCBmb3JjaW5nIHRoZSBgZ2xvYmFsYFxuICAgIC8vIHByb3BlcnR5LCB1c2UgYFhSZWdFeHAocmVnZXgpYC4gRG8gbm90IHVzZSBgUmVnRXhwKHJlZ2V4KWAgYmVjYXVzZSBpdCB3aWxsIG5vdCBwcmVzZXJ2ZVxuICAgIC8vIHNwZWNpYWwgcHJvcGVydGllcyByZXF1aXJlZCBmb3IgbmFtZWQgY2FwdHVyZVxuICAgIFhSZWdFeHAuY29weUFzR2xvYmFsID0gZnVuY3Rpb24gKHJlZ2V4KSB7XG4gICAgICAgIHJldHVybiBjbG9uZShyZWdleCwgXCJnXCIpO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgc3RyaW5nOyByZXR1cm5zIHRoZSBzdHJpbmcgd2l0aCByZWdleCBtZXRhY2hhcmFjdGVycyBlc2NhcGVkLiBUaGUgcmV0dXJuZWQgc3RyaW5nXG4gICAgLy8gY2FuIHNhZmVseSBiZSB1c2VkIGF0IGFueSBwb2ludCB3aXRoaW4gYSByZWdleCB0byBtYXRjaCB0aGUgcHJvdmlkZWQgbGl0ZXJhbCBzdHJpbmcuIEVzY2FwZWRcbiAgICAvLyBjaGFyYWN0ZXJzIGFyZSBbIF0geyB9ICggKSAqICsgPyAtIC4gLCBcXCBeICQgfCAjIGFuZCB3aGl0ZXNwYWNlXG4gICAgWFJlZ0V4cC5lc2NhcGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgc3RyaW5nIHRvIHNlYXJjaCwgcmVnZXggdG8gc2VhcmNoIHdpdGgsIHBvc2l0aW9uIHRvIHN0YXJ0IHRoZSBzZWFyY2ggd2l0aGluIHRoZVxuICAgIC8vIHN0cmluZyAoZGVmYXVsdDogMCksIGFuZCBhbiBvcHRpb25hbCBCb29sZWFuIGluZGljYXRpbmcgd2hldGhlciBtYXRjaGVzIG11c3Qgc3RhcnQgYXQtb3ItXG4gICAgLy8gYWZ0ZXIgdGhlIHBvc2l0aW9uIG9yIGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gb25seS4gVGhpcyBmdW5jdGlvbiBpZ25vcmVzIHRoZSBgbGFzdEluZGV4YFxuICAgIC8vIG9mIHRoZSBwcm92aWRlZCByZWdleCBpbiBpdHMgb3duIGhhbmRsaW5nLCBidXQgdXBkYXRlcyB0aGUgcHJvcGVydHkgZm9yIGNvbXBhdGliaWxpdHlcbiAgICBYUmVnRXhwLmV4ZWNBdCA9IGZ1bmN0aW9uIChzdHIsIHJlZ2V4LCBwb3MsIGFuY2hvcmVkKSB7XG4gICAgICAgIHZhciByMiA9IGNsb25lKHJlZ2V4LCBcImdcIiArICgoYW5jaG9yZWQgJiYgaGFzTmF0aXZlWSkgPyBcInlcIiA6IFwiXCIpKSxcbiAgICAgICAgICAgIG1hdGNoO1xuICAgICAgICByMi5sYXN0SW5kZXggPSBwb3MgPSBwb3MgfHwgMDtcbiAgICAgICAgbWF0Y2ggPSByMi5leGVjKHN0cik7IC8vIFJ1biB0aGUgYWx0ZXJlZCBgZXhlY2AgKHJlcXVpcmVkIGZvciBgbGFzdEluZGV4YCBmaXgsIGV0Yy4pXG4gICAgICAgIGlmIChhbmNob3JlZCAmJiBtYXRjaCAmJiBtYXRjaC5pbmRleCAhPT0gcG9zKVxuICAgICAgICAgICAgbWF0Y2ggPSBudWxsO1xuICAgICAgICBpZiAocmVnZXguZ2xvYmFsKVxuICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gbWF0Y2ggPyByMi5sYXN0SW5kZXggOiAwO1xuICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfTtcblxuICAgIC8vIEJyZWFrcyB0aGUgdW5yZXN0b3JhYmxlIGxpbmsgdG8gWFJlZ0V4cCdzIHByaXZhdGUgbGlzdCBvZiB0b2tlbnMsIHRoZXJlYnkgcHJldmVudGluZ1xuICAgIC8vIHN5bnRheCBhbmQgZmxhZyBjaGFuZ2VzLiBTaG91bGQgYmUgcnVuIGFmdGVyIFhSZWdFeHAgYW5kIGFueSBwbHVnaW5zIGFyZSBsb2FkZWRcbiAgICBYUmVnRXhwLmZyZWV6ZVRva2VucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgWFJlZ0V4cC5hZGRUb2tlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiY2FuJ3QgcnVuIGFkZFRva2VuIGFmdGVyIGZyZWV6ZVRva2Vuc1wiKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhbnkgdmFsdWU7IHJldHVybnMgYSBCb29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSBgUmVnRXhwYCBvYmplY3QuXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgYWxzbyBgdHJ1ZWAgZm9yIHJlZ2V4IGxpdGVyYWxzIGFuZCByZWdleGVzIGNyZWF0ZWQgYnkgdGhlIGBYUmVnRXhwYFxuICAgIC8vIGNvbnN0cnVjdG9yLiBUaGlzIHdvcmtzIGNvcnJlY3RseSBmb3IgdmFyaWFibGVzIGNyZWF0ZWQgaW4gYW5vdGhlciBmcmFtZSwgd2hlbiBgaW5zdGFuY2VvZmBcbiAgICAvLyBhbmQgYGNvbnN0cnVjdG9yYCBjaGVja3Mgd291bGQgZmFpbCB0byB3b3JrIGFzIGludGVuZGVkXG4gICAgWFJlZ0V4cC5pc1JlZ0V4cCA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09IFwiW29iamVjdCBSZWdFeHBdXCI7XG4gICAgfTtcblxuICAgIC8vIEV4ZWN1dGVzIGBjYWxsYmFja2Agb25jZSBwZXIgbWF0Y2ggd2l0aGluIGBzdHJgLiBQcm92aWRlcyBhIHNpbXBsZXIgYW5kIGNsZWFuZXIgd2F5IHRvXG4gICAgLy8gaXRlcmF0ZSBvdmVyIHJlZ2V4IG1hdGNoZXMgY29tcGFyZWQgdG8gdGhlIHRyYWRpdGlvbmFsIGFwcHJvYWNoZXMgb2Ygc3VidmVydGluZ1xuICAgIC8vIGBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VgIG9yIHJlcGVhdGVkbHkgY2FsbGluZyBgZXhlY2Agd2l0aGluIGEgYHdoaWxlYCBsb29wXG4gICAgWFJlZ0V4cC5pdGVyYXRlID0gZnVuY3Rpb24gKHN0ciwgcmVnZXgsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciByMiA9IGNsb25lKHJlZ2V4LCBcImdcIiksXG4gICAgICAgICAgICBpID0gLTEsIG1hdGNoO1xuICAgICAgICB3aGlsZSAobWF0Y2ggPSByMi5leGVjKHN0cikpIHsgLy8gUnVuIHRoZSBhbHRlcmVkIGBleGVjYCAocmVxdWlyZWQgZm9yIGBsYXN0SW5kZXhgIGZpeCwgZXRjLilcbiAgICAgICAgICAgIGlmIChyZWdleC5nbG9iYWwpXG4gICAgICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gcjIubGFzdEluZGV4OyAvLyBEb2luZyB0aGlzIHRvIGZvbGxvdyBleHBlY3RhdGlvbnMgaWYgYGxhc3RJbmRleGAgaXMgY2hlY2tlZCB3aXRoaW4gYGNhbGxiYWNrYFxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBtYXRjaCwgKytpLCBzdHIsIHJlZ2V4KTtcbiAgICAgICAgICAgIGlmIChyMi5sYXN0SW5kZXggPT09IG1hdGNoLmluZGV4KVxuICAgICAgICAgICAgICAgIHIyLmxhc3RJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZWdleC5nbG9iYWwpXG4gICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSAwO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgc3RyaW5nIGFuZCBhbiBhcnJheSBvZiByZWdleGVzOyByZXR1cm5zIHRoZSByZXN1bHQgb2YgdXNpbmcgZWFjaCBzdWNjZXNzaXZlIHJlZ2V4XG4gICAgLy8gdG8gc2VhcmNoIHdpdGhpbiB0aGUgbWF0Y2hlcyBvZiB0aGUgcHJldmlvdXMgcmVnZXguIFRoZSBhcnJheSBvZiByZWdleGVzIGNhbiBhbHNvIGNvbnRhaW5cbiAgICAvLyBvYmplY3RzIHdpdGggYHJlZ2V4YCBhbmQgYGJhY2tyZWZgIHByb3BlcnRpZXMsIGluIHdoaWNoIGNhc2UgdGhlIG5hbWVkIG9yIG51bWJlcmVkIGJhY2stXG4gICAgLy8gcmVmZXJlbmNlcyBzcGVjaWZpZWQgYXJlIHBhc3NlZCBmb3J3YXJkIHRvIHRoZSBuZXh0IHJlZ2V4IG9yIHJldHVybmVkLiBFLmcuOlxuICAgIC8vIHZhciB4cmVnZXhwSW1nRmlsZU5hbWVzID0gWFJlZ0V4cC5tYXRjaENoYWluKGh0bWwsIFtcbiAgICAvLyAgICAge3JlZ2V4OiAvPGltZ1xcYihbXj5dKyk+L2ksIGJhY2tyZWY6IDF9LCAvLyA8aW1nPiB0YWcgYXR0cmlidXRlc1xuICAgIC8vICAgICB7cmVnZXg6IFhSZWdFeHAoJyg/aXgpIFxcXFxzIHNyYz1cIiAoPzxzcmM+IFteXCJdKyApJyksIGJhY2tyZWY6IFwic3JjXCJ9LCAvLyBzcmMgYXR0cmlidXRlIHZhbHVlc1xuICAgIC8vICAgICB7cmVnZXg6IFhSZWdFeHAoXCJeaHR0cDovL3hyZWdleHBcXFxcLmNvbSgvW14jP10rKVwiLCBcImlcIiksIGJhY2tyZWY6IDF9LCAvLyB4cmVnZXhwLmNvbSBwYXRoc1xuICAgIC8vICAgICAvW15cXC9dKyQvIC8vIGZpbGVuYW1lcyAoc3RyaXAgZGlyZWN0b3J5IHBhdGhzKVxuICAgIC8vIF0pO1xuICAgIFhSZWdFeHAubWF0Y2hDaGFpbiA9IGZ1bmN0aW9uIChzdHIsIGNoYWluKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiByZWN1cnNlQ2hhaW4gKHZhbHVlcywgbGV2ZWwpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gY2hhaW5bbGV2ZWxdLnJlZ2V4ID8gY2hhaW5bbGV2ZWxdIDoge3JlZ2V4OiBjaGFpbltsZXZlbF19LFxuICAgICAgICAgICAgICAgIHJlZ2V4ID0gY2xvbmUoaXRlbS5yZWdleCwgXCJnXCIpLFxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBbXSwgaTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBYUmVnRXhwLml0ZXJhdGUodmFsdWVzW2ldLCByZWdleCwgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXMucHVzaChpdGVtLmJhY2tyZWYgPyAobWF0Y2hbaXRlbS5iYWNrcmVmXSB8fCBcIlwiKSA6IG1hdGNoWzBdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoKGxldmVsID09PSBjaGFpbi5sZW5ndGggLSAxKSB8fCAhbWF0Y2hlcy5sZW5ndGgpID9cbiAgICAgICAgICAgICAgICBtYXRjaGVzIDogcmVjdXJzZUNoYWluKG1hdGNoZXMsIGxldmVsICsgMSk7XG4gICAgICAgIH0oW3N0cl0sIDApO1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIE5ldyBSZWdFeHAgcHJvdG90eXBlIG1ldGhvZHNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gQWNjZXB0cyBhIGNvbnRleHQgb2JqZWN0IGFuZCBhcmd1bWVudHMgYXJyYXk7IHJldHVybnMgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIGBleGVjYCB3aXRoIHRoZVxuICAgIC8vIGZpcnN0IHZhbHVlIGluIHRoZSBhcmd1bWVudHMgYXJyYXkuIHRoZSBjb250ZXh0IGlzIGlnbm9yZWQgYnV0IGlzIGFjY2VwdGVkIGZvciBjb25ncnVpdHlcbiAgICAvLyB3aXRoIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgXG4gICAgUmVnRXhwLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uIChjb250ZXh0LCBhcmdzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4ZWMoYXJnc1swXSk7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBjb250ZXh0IG9iamVjdCBhbmQgc3RyaW5nOyByZXR1cm5zIHRoZSByZXN1bHQgb2YgY2FsbGluZyBgZXhlY2Agd2l0aCB0aGUgcHJvdmlkZWRcbiAgICAvLyBzdHJpbmcuIHRoZSBjb250ZXh0IGlzIGlnbm9yZWQgYnV0IGlzIGFjY2VwdGVkIGZvciBjb25ncnVpdHkgd2l0aCBgRnVuY3Rpb24ucHJvdG90eXBlLmNhbGxgXG4gICAgUmVnRXhwLnByb3RvdHlwZS5jYWxsID0gZnVuY3Rpb24gKGNvbnRleHQsIHN0cikge1xuICAgICAgICByZXR1cm4gdGhpcy5leGVjKHN0cik7XG4gICAgfTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgT3ZlcnJpZGVuIG5hdGl2ZSBtZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEFkZHMgbmFtZWQgY2FwdHVyZSBzdXBwb3J0ICh3aXRoIGJhY2tyZWZlcmVuY2VzIHJldHVybmVkIGFzIGByZXN1bHQubmFtZWApLCBhbmQgZml4ZXMgdHdvXG4gICAgLy8gY3Jvc3MtYnJvd3NlciBpc3N1ZXMgcGVyIEVTMzpcbiAgICAvLyAtIENhcHR1cmVkIHZhbHVlcyBmb3Igbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBzIHNob3VsZCBiZSByZXR1cm5lZCBhcyBgdW5kZWZpbmVkYCxcbiAgICAvLyAgIHJhdGhlciB0aGFuIHRoZSBlbXB0eSBzdHJpbmcuXG4gICAgLy8gLSBgbGFzdEluZGV4YCBzaG91bGQgbm90IGJlIGluY3JlbWVudGVkIGFmdGVyIHplcm8tbGVuZ3RoIG1hdGNoZXMuXG4gICAgUmVnRXhwLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgbWF0Y2gsIG5hbWUsIHIyLCBvcmlnTGFzdEluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgb3JpZ0xhc3RJbmRleCA9IHRoaXMubGFzdEluZGV4O1xuICAgICAgICBtYXRjaCA9IG5hdGl2LmV4ZWMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAvLyBGaXggYnJvd3NlcnMgd2hvc2UgYGV4ZWNgIG1ldGhvZHMgZG9uJ3QgY29uc2lzdGVudGx5IHJldHVybiBgdW5kZWZpbmVkYCBmb3JcbiAgICAgICAgICAgIC8vIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3Vwc1xuICAgICAgICAgICAgaWYgKCFjb21wbGlhbnRFeGVjTnBjZyAmJiBtYXRjaC5sZW5ndGggPiAxICYmIGluZGV4T2YobWF0Y2gsIFwiXCIpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByMiA9IFJlZ0V4cCh0aGlzLnNvdXJjZSwgbmF0aXYucmVwbGFjZS5jYWxsKGdldE5hdGl2ZUZsYWdzKHRoaXMpLCBcImdcIiwgXCJcIikpO1xuICAgICAgICAgICAgICAgIC8vIFVzaW5nIGBzdHIuc2xpY2UobWF0Y2guaW5kZXgpYCByYXRoZXIgdGhhbiBgbWF0Y2hbMF1gIGluIGNhc2UgbG9va2FoZWFkIGFsbG93ZWRcbiAgICAgICAgICAgICAgICAvLyBtYXRjaGluZyBkdWUgdG8gY2hhcmFjdGVycyBvdXRzaWRlIHRoZSBtYXRjaFxuICAgICAgICAgICAgICAgIG5hdGl2LnJlcGxhY2UuY2FsbCgoc3RyICsgXCJcIikuc2xpY2UobWF0Y2guaW5kZXgpLCByMiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXR0YWNoIG5hbWVkIGNhcHR1cmUgcHJvcGVydGllc1xuICAgICAgICAgICAgaWYgKHRoaXMuX3hyZWdleHAgJiYgdGhpcy5feHJlZ2V4cC5jYXB0dXJlTmFtZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IG1hdGNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSB0aGlzLl94cmVnZXhwLmNhcHR1cmVOYW1lc1tpIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFtuYW1lXSA9IG1hdGNoW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZpeCBicm93c2VycyB0aGF0IGluY3JlbWVudCBgbGFzdEluZGV4YCBhZnRlciB6ZXJvLWxlbmd0aCBtYXRjaGVzXG4gICAgICAgICAgICBpZiAoIWNvbXBsaWFudExhc3RJbmRleEluY3JlbWVudCAmJiB0aGlzLmdsb2JhbCAmJiAhbWF0Y2hbMF0ubGVuZ3RoICYmICh0aGlzLmxhc3RJbmRleCA+IG1hdGNoLmluZGV4KSlcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RJbmRleC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nbG9iYWwpXG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleCA9IG9yaWdMYXN0SW5kZXg7IC8vIEZpeCBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgT3BlcmEgMTEuNjEgb24gV2luZG93cylcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH07XG5cbiAgICAvLyBGaXggYnJvd3NlciBidWdzIGluIG5hdGl2ZSBtZXRob2RcbiAgICBSZWdFeHAucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIC8vIFVzZSB0aGUgbmF0aXZlIGBleGVjYCB0byBza2lwIHNvbWUgcHJvY2Vzc2luZyBvdmVyaGVhZCwgZXZlbiB0aG91Z2ggdGhlIGFsdGVyZWRcbiAgICAgICAgLy8gYGV4ZWNgIHdvdWxkIHRha2UgY2FyZSBvZiB0aGUgYGxhc3RJbmRleGAgZml4ZXNcbiAgICAgICAgdmFyIG1hdGNoLCBvcmlnTGFzdEluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgb3JpZ0xhc3RJbmRleCA9IHRoaXMubGFzdEluZGV4O1xuICAgICAgICBtYXRjaCA9IG5hdGl2LmV4ZWMuY2FsbCh0aGlzLCBzdHIpO1xuICAgICAgICAvLyBGaXggYnJvd3NlcnMgdGhhdCBpbmNyZW1lbnQgYGxhc3RJbmRleGAgYWZ0ZXIgemVyby1sZW5ndGggbWF0Y2hlc1xuICAgICAgICBpZiAobWF0Y2ggJiYgIWNvbXBsaWFudExhc3RJbmRleEluY3JlbWVudCAmJiB0aGlzLmdsb2JhbCAmJiAhbWF0Y2hbMF0ubGVuZ3RoICYmICh0aGlzLmxhc3RJbmRleCA+IG1hdGNoLmluZGV4KSlcbiAgICAgICAgICAgIHRoaXMubGFzdEluZGV4LS07XG4gICAgICAgIGlmICghdGhpcy5nbG9iYWwpXG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleCA9IG9yaWdMYXN0SW5kZXg7IC8vIEZpeCBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgT3BlcmEgMTEuNjEgb24gV2luZG93cylcbiAgICAgICAgcmV0dXJuICEhbWF0Y2g7XG4gICAgfTtcblxuICAgIC8vIEFkZHMgbmFtZWQgY2FwdHVyZSBzdXBwb3J0IGFuZCBmaXhlcyBicm93c2VyIGJ1Z3MgaW4gbmF0aXZlIG1ldGhvZFxuICAgIFN0cmluZy5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbiAocmVnZXgpIHtcbiAgICAgICAgaWYgKCFYUmVnRXhwLmlzUmVnRXhwKHJlZ2V4KSlcbiAgICAgICAgICAgIHJlZ2V4ID0gUmVnRXhwKHJlZ2V4KTsgLy8gTmF0aXZlIGBSZWdFeHBgXG4gICAgICAgIGlmIChyZWdleC5nbG9iYWwpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuYXRpdi5tYXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gMDsgLy8gRml4IElFIGJ1Z1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVnZXguZXhlYyh0aGlzKTsgLy8gUnVuIHRoZSBhbHRlcmVkIGBleGVjYFxuICAgIH07XG5cbiAgICAvLyBBZGRzIHN1cHBvcnQgZm9yIGAke259YCB0b2tlbnMgZm9yIG5hbWVkIGFuZCBudW1iZXJlZCBiYWNrcmVmZXJlbmNlcyBpbiByZXBsYWNlbWVudCB0ZXh0LFxuICAgIC8vIGFuZCBwcm92aWRlcyBuYW1lZCBiYWNrcmVmZXJlbmNlcyB0byByZXBsYWNlbWVudCBmdW5jdGlvbnMgYXMgYGFyZ3VtZW50c1swXS5uYW1lYC4gQWxzb1xuICAgIC8vIGZpeGVzIGNyb3NzLWJyb3dzZXIgZGlmZmVyZW5jZXMgaW4gcmVwbGFjZW1lbnQgdGV4dCBzeW50YXggd2hlbiBwZXJmb3JtaW5nIGEgcmVwbGFjZW1lbnRcbiAgICAvLyB1c2luZyBhIG5vbnJlZ2V4IHNlYXJjaCB2YWx1ZSwgYW5kIHRoZSB2YWx1ZSBvZiByZXBsYWNlbWVudCByZWdleGVzJyBgbGFzdEluZGV4YCBwcm9wZXJ0eVxuICAgIC8vIGR1cmluZyByZXBsYWNlbWVudCBpdGVyYXRpb25zLiBOb3RlIHRoYXQgdGhpcyBkb2Vzbid0IHN1cHBvcnQgU3BpZGVyTW9ua2V5J3MgcHJvcHJpZXRhcnlcbiAgICAvLyB0aGlyZCAoYGZsYWdzYCkgcGFyYW1ldGVyXG4gICAgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24gKHNlYXJjaCwgcmVwbGFjZW1lbnQpIHtcbiAgICAgICAgdmFyIGlzUmVnZXggPSBYUmVnRXhwLmlzUmVnRXhwKHNlYXJjaCksXG4gICAgICAgICAgICBjYXB0dXJlTmFtZXMsIHJlc3VsdCwgc3RyLCBvcmlnTGFzdEluZGV4O1xuXG4gICAgICAgIC8vIFRoZXJlIGFyZSB0b28gbWFueSBjb21iaW5hdGlvbnMgb2Ygc2VhcmNoL3JlcGxhY2VtZW50IHR5cGVzL3ZhbHVlcyBhbmQgYnJvd3NlciBidWdzIHRoYXRcbiAgICAgICAgLy8gcHJlY2x1ZGUgcGFzc2luZyB0byBuYXRpdmUgYHJlcGxhY2VgLCBzbyBkb24ndCB0cnlcbiAgICAgICAgLy9pZiAoLi4uKVxuICAgICAgICAvLyAgICByZXR1cm4gbmF0aXYucmVwbGFjZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIGlmIChpc1JlZ2V4KSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoLl94cmVnZXhwKVxuICAgICAgICAgICAgICAgIGNhcHR1cmVOYW1lcyA9IHNlYXJjaC5feHJlZ2V4cC5jYXB0dXJlTmFtZXM7IC8vIEFycmF5IG9yIGBudWxsYFxuICAgICAgICAgICAgaWYgKCFzZWFyY2guZ2xvYmFsKVxuICAgICAgICAgICAgICAgIG9yaWdMYXN0SW5kZXggPSBzZWFyY2gubGFzdEluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VhcmNoID0gc2VhcmNoICsgXCJcIjsgLy8gVHlwZSBjb252ZXJzaW9uXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHJlcGxhY2VtZW50KSA9PT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuYXRpdi5yZXBsYWNlLmNhbGwodGhpcyArIFwiXCIsIHNlYXJjaCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChjYXB0dXJlTmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hhbmdlIHRoZSBgYXJndW1lbnRzWzBdYCBzdHJpbmcgcHJpbWl0aXZlIHRvIGEgU3RyaW5nIG9iamVjdCB3aGljaCBjYW4gc3RvcmUgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0gPSBuZXcgU3RyaW5nKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN0b3JlIG5hbWVkIGJhY2tyZWZlcmVuY2VzIG9uIGBhcmd1bWVudHNbMF1gXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FwdHVyZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FwdHVyZU5hbWVzW2ldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtjYXB0dXJlTmFtZXNbaV1dID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgYGxhc3RJbmRleGAgYmVmb3JlIGNhbGxpbmcgYHJlcGxhY2VtZW50YCAoZml4IGJyb3dzZXJzKVxuICAgICAgICAgICAgICAgIGlmIChpc1JlZ2V4ICYmIHNlYXJjaC5nbG9iYWwpXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5sYXN0SW5kZXggPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDJdICsgYXJndW1lbnRzWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnQuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gdGhpcyArIFwiXCI7IC8vIFR5cGUgY29udmVyc2lvbiwgc28gYGFyZ3NbYXJncy5sZW5ndGggLSAxXWAgd2lsbCBiZSBhIHN0cmluZyAoZ2l2ZW4gbm9uc3RyaW5nIGB0aGlzYClcbiAgICAgICAgICAgIHJlc3VsdCA9IG5hdGl2LnJlcGxhY2UuY2FsbChzdHIsIHNlYXJjaCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzOyAvLyBLZWVwIHRoaXMgZnVuY3Rpb24ncyBgYXJndW1lbnRzYCBhdmFpbGFibGUgdGhyb3VnaCBjbG9zdXJlXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnJlcGxhY2UuY2FsbChyZXBsYWNlbWVudCArIFwiXCIsIHJlcGxhY2VtZW50VG9rZW4sIGZ1bmN0aW9uICgkMCwgJDEsICQyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE51bWJlcmVkIGJhY2tyZWZlcmVuY2UgKHdpdGhvdXQgZGVsaW1pdGVycykgb3Igc3BlY2lhbCB2YXJpYWJsZVxuICAgICAgICAgICAgICAgICAgICBpZiAoJDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoJDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiJFwiOiByZXR1cm4gXCIkXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIiZcIjogcmV0dXJuIGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImBcIjogcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXS5zbGljZSgwLCBhcmdzW2FyZ3MubGVuZ3RoIC0gMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCInXCI6IHJldHVybiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0uc2xpY2UoYXJnc1thcmdzLmxlbmd0aCAtIDJdICsgYXJnc1swXS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE51bWJlcmVkIGJhY2tyZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaGF0IGRvZXMgXCIkMTBcIiBtZWFuP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgMTAsIGlmIDEwIG9yIG1vcmUgY2FwdHVyaW5nIGdyb3VwcyBleGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgMSBmb2xsb3dlZCBieSBcIjBcIiwgaWYgMS05IGNhcHR1cmluZyBncm91cHMgZXhpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBPdGhlcndpc2UsIGl0J3MgdGhlIHN0cmluZyBcIiQxMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gbm90ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlcyBjYW5ub3QgYmUgbW9yZSB0aGFuIHR3byBkaWdpdHMgKGVuZm9yY2VkIGJ5IGByZXBsYWNlbWVudFRva2VuYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBcIiQwMVwiIGlzIGVxdWl2YWxlbnQgdG8gXCIkMVwiIGlmIGEgY2FwdHVyaW5nIGdyb3VwIGV4aXN0cywgb3RoZXJ3aXNlIGl0J3MgdGhlIHN0cmluZyBcIiQwMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgbm8gXCIkMFwiIHRva2VuIChcIiQmXCIgaXMgdGhlIGVudGlyZSBtYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpdGVyYWxOdW1iZXJzID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJDEgPSArJDE7IC8vIFR5cGUgY29udmVyc2lvbjsgZHJvcCBsZWFkaW5nIHplcm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEkMSkgLy8gYCQxYCB3YXMgXCIwXCIgb3IgXCIwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgkMSA+IGFyZ3MubGVuZ3RoIC0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl0ZXJhbE51bWJlcnMgPSBTdHJpbmcucHJvdG90eXBlLnNsaWNlLmNhbGwoJDEsIC0xKSArIGxpdGVyYWxOdW1iZXJzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJDEgPSBNYXRoLmZsb29yKCQxIC8gMTApOyAvLyBEcm9wIHRoZSBsYXN0IGRpZ2l0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgkMSA/IGFyZ3NbJDFdIHx8IFwiXCIgOiBcIiRcIikgKyBsaXRlcmFsTnVtYmVycztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gTmFtZWQgYmFja3JlZmVyZW5jZSBvciBkZWxpbWl0ZWQgbnVtYmVyZWQgYmFja3JlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2hhdCBkb2VzIFwiJHtufVwiIG1lYW4/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgdG8gbnVtYmVyZWQgY2FwdHVyZSBuLiBUd28gZGlmZmVyZW5jZXMgZnJvbSBcIiRuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgIC0gbiBjYW4gYmUgbW9yZSB0aGFuIHR3byBkaWdpdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgLSBCYWNrcmVmZXJlbmNlIDAgaXMgYWxsb3dlZCwgYW5kIGlzIHRoZSBlbnRpcmUgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gQmFja3JlZmVyZW5jZSB0byBuYW1lZCBjYXB0dXJlIG4sIGlmIGl0IGV4aXN0cyBhbmQgaXMgbm90IGEgbnVtYmVyIG92ZXJyaWRkZW4gYnkgbnVtYmVyZWQgY2FwdHVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBPdGhlcndpc2UsIGl0J3MgdGhlIHN0cmluZyBcIiR7bn1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG4gPSArJDI7IC8vIFR5cGUgY29udmVyc2lvbjsgZHJvcCBsZWFkaW5nIHplcm9zXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobiA8PSBhcmdzLmxlbmd0aCAtIDMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3Nbbl07XG4gICAgICAgICAgICAgICAgICAgICAgICBuID0gY2FwdHVyZU5hbWVzID8gaW5kZXhPZihjYXB0dXJlTmFtZXMsICQyKSA6IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG4gPiAtMSA/IGFyZ3NbbiArIDFdIDogJDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzUmVnZXgpIHtcbiAgICAgICAgICAgIGlmIChzZWFyY2guZ2xvYmFsKVxuICAgICAgICAgICAgICAgIHNlYXJjaC5sYXN0SW5kZXggPSAwOyAvLyBGaXggSUUsIFNhZmFyaSBidWcgKGxhc3QgdGVzdGVkIElFIDkuMC41LCBTYWZhcmkgNS4xLjIgb24gV2luZG93cylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZWFyY2gubGFzdEluZGV4ID0gb3JpZ0xhc3RJbmRleDsgLy8gRml4IElFLCBPcGVyYSBidWcgKGxhc3QgdGVzdGVkIElFIDkuMC41LCBPcGVyYSAxMS42MSBvbiBXaW5kb3dzKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgLy8gQSBjb25zaXN0ZW50IGNyb3NzLWJyb3dzZXIsIEVTMyBjb21wbGlhbnQgYHNwbGl0YFxuICAgIFN0cmluZy5wcm90b3R5cGUuc3BsaXQgPSBmdW5jdGlvbiAocyAvKiBzZXBhcmF0b3IgKi8sIGxpbWl0KSB7XG4gICAgICAgIC8vIElmIHNlcGFyYXRvciBgc2AgaXMgbm90IGEgcmVnZXgsIHVzZSB0aGUgbmF0aXZlIGBzcGxpdGBcbiAgICAgICAgaWYgKCFYUmVnRXhwLmlzUmVnRXhwKHMpKVxuICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnNwbGl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgdmFyIHN0ciA9IHRoaXMgKyBcIlwiLCAvLyBUeXBlIGNvbnZlcnNpb25cbiAgICAgICAgICAgIG91dHB1dCA9IFtdLFxuICAgICAgICAgICAgbGFzdExhc3RJbmRleCA9IDAsXG4gICAgICAgICAgICBtYXRjaCwgbGFzdExlbmd0aDtcblxuICAgICAgICAvLyBCZWhhdmlvciBmb3IgYGxpbWl0YDogaWYgaXQncy4uLlxuICAgICAgICAvLyAtIGB1bmRlZmluZWRgOiBObyBsaW1pdFxuICAgICAgICAvLyAtIGBOYU5gIG9yIHplcm86IFJldHVybiBhbiBlbXB0eSBhcnJheVxuICAgICAgICAvLyAtIEEgcG9zaXRpdmUgbnVtYmVyOiBVc2UgYE1hdGguZmxvb3IobGltaXQpYFxuICAgICAgICAvLyAtIEEgbmVnYXRpdmUgbnVtYmVyOiBObyBsaW1pdFxuICAgICAgICAvLyAtIE90aGVyOiBUeXBlLWNvbnZlcnQsIHRoZW4gdXNlIHRoZSBhYm92ZSBydWxlc1xuICAgICAgICBpZiAobGltaXQgPT09IHVuZGVmaW5lZCB8fCArbGltaXQgPCAwKSB7XG4gICAgICAgICAgICBsaW1pdCA9IEluZmluaXR5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGltaXQgPSBNYXRoLmZsb29yKCtsaW1pdCk7XG4gICAgICAgICAgICBpZiAoIWxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgaWYgbm90IGBzLmdsb2JhbGAsIGFuZCBpdCBhdm9pZHMgbmVlZGluZyB0byBzZXQgYHMubGFzdEluZGV4YCB0byB6ZXJvXG4gICAgICAgIC8vIGFuZCByZXN0b3JlIGl0IHRvIGl0cyBvcmlnaW5hbCB2YWx1ZSB3aGVuIHdlJ3JlIGRvbmUgdXNpbmcgdGhlIHJlZ2V4XG4gICAgICAgIHMgPSBYUmVnRXhwLmNvcHlBc0dsb2JhbChzKTtcblxuICAgICAgICB3aGlsZSAobWF0Y2ggPSBzLmV4ZWMoc3RyKSkgeyAvLyBSdW4gdGhlIGFsdGVyZWQgYGV4ZWNgIChyZXF1aXJlZCBmb3IgYGxhc3RJbmRleGAgZml4LCBldGMuKVxuICAgICAgICAgICAgaWYgKHMubGFzdEluZGV4ID4gbGFzdExhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4LCBtYXRjaC5pbmRleCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2guaW5kZXggPCBzdHIubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShvdXRwdXQsIG1hdGNoLnNsaWNlKDEpKTtcblxuICAgICAgICAgICAgICAgIGxhc3RMZW5ndGggPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGFzdExhc3RJbmRleCA9IHMubGFzdEluZGV4O1xuXG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dC5sZW5ndGggPj0gbGltaXQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocy5sYXN0SW5kZXggPT09IG1hdGNoLmluZGV4KVxuICAgICAgICAgICAgICAgIHMubGFzdEluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFzdExhc3RJbmRleCA9PT0gc3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCFuYXRpdi50ZXN0LmNhbGwocywgXCJcIikgfHwgbGFzdExlbmd0aClcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4KSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0Lmxlbmd0aCA+IGxpbWl0ID8gb3V0cHV0LnNsaWNlKDAsIGxpbWl0KSA6IG91dHB1dDtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQcml2YXRlIGhlbHBlciBmdW5jdGlvbnNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gU3VwcG9ydGluZyBmdW5jdGlvbiBmb3IgYFhSZWdFeHBgLCBgWFJlZ0V4cC5jb3B5QXNHbG9iYWxgLCBldGMuIFJldHVybnMgYSBjb3B5IG9mIGEgYFJlZ0V4cGBcbiAgICAvLyBpbnN0YW5jZSB3aXRoIGEgZnJlc2ggYGxhc3RJbmRleGAgKHNldCB0byB6ZXJvKSwgcHJlc2VydmluZyBwcm9wZXJ0aWVzIHJlcXVpcmVkIGZvciBuYW1lZFxuICAgIC8vIGNhcHR1cmUuIEFsc28gYWxsb3dzIGFkZGluZyBuZXcgZmxhZ3MgaW4gdGhlIHByb2Nlc3Mgb2YgY29weWluZyB0aGUgcmVnZXhcbiAgICBmdW5jdGlvbiBjbG9uZSAocmVnZXgsIGFkZGl0aW9uYWxGbGFncykge1xuICAgICAgICBpZiAoIVhSZWdFeHAuaXNSZWdFeHAocmVnZXgpKVxuICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwidHlwZSBSZWdFeHAgZXhwZWN0ZWRcIik7XG4gICAgICAgIHZhciB4ID0gcmVnZXguX3hyZWdleHA7XG4gICAgICAgIHJlZ2V4ID0gWFJlZ0V4cChyZWdleC5zb3VyY2UsIGdldE5hdGl2ZUZsYWdzKHJlZ2V4KSArIChhZGRpdGlvbmFsRmxhZ3MgfHwgXCJcIikpO1xuICAgICAgICBpZiAoeCkge1xuICAgICAgICAgICAgcmVnZXguX3hyZWdleHAgPSB7XG4gICAgICAgICAgICAgICAgc291cmNlOiB4LnNvdXJjZSxcbiAgICAgICAgICAgICAgICBjYXB0dXJlTmFtZXM6IHguY2FwdHVyZU5hbWVzID8geC5jYXB0dXJlTmFtZXMuc2xpY2UoMCkgOiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWdleDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXROYXRpdmVGbGFncyAocmVnZXgpIHtcbiAgICAgICAgcmV0dXJuIChyZWdleC5nbG9iYWwgICAgID8gXCJnXCIgOiBcIlwiKSArXG4gICAgICAgICAgICAgICAocmVnZXguaWdub3JlQ2FzZSA/IFwiaVwiIDogXCJcIikgK1xuICAgICAgICAgICAgICAgKHJlZ2V4Lm11bHRpbGluZSAgPyBcIm1cIiA6IFwiXCIpICtcbiAgICAgICAgICAgICAgIChyZWdleC5leHRlbmRlZCAgID8gXCJ4XCIgOiBcIlwiKSArIC8vIFByb3Bvc2VkIGZvciBFUzQ7IGluY2x1ZGVkIGluIEFTM1xuICAgICAgICAgICAgICAgKHJlZ2V4LnN0aWNreSAgICAgPyBcInlcIiA6IFwiXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1blRva2VucyAocGF0dGVybiwgaW5kZXgsIHNjb3BlLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpID0gdG9rZW5zLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdCwgbWF0Y2gsIHQ7XG4gICAgICAgIC8vIFByb3RlY3QgYWdhaW5zdCBjb25zdHJ1Y3RpbmcgWFJlZ0V4cHMgd2l0aGluIHRva2VuIGhhbmRsZXIgYW5kIHRyaWdnZXIgZnVuY3Rpb25zXG4gICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSB0cnVlO1xuICAgICAgICAvLyBNdXN0IHJlc2V0IGBpc0luc2lkZUNvbnN0cnVjdG9yYCwgZXZlbiBpZiBhIGB0cmlnZ2VyYCBvciBgaGFuZGxlcmAgdGhyb3dzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7IC8vIFJ1biBpbiByZXZlcnNlIG9yZGVyXG4gICAgICAgICAgICAgICAgdCA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoKHNjb3BlICYgdC5zY29wZSkgJiYgKCF0LnRyaWdnZXIgfHwgdC50cmlnZ2VyLmNhbGwoY29udGV4dCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHQucGF0dGVybi5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSB0LnBhdHRlcm4uZXhlYyhwYXR0ZXJuKTsgLy8gUnVubmluZyB0aGUgYWx0ZXJlZCBgZXhlY2AgaGVyZSBhbGxvd3MgdXNlIG9mIG5hbWVkIGJhY2tyZWZlcmVuY2VzLCBldGMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaC5pbmRleCA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IHQuaGFuZGxlci5jYWxsKGNvbnRleHQsIG1hdGNoLCBzY29wZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaXNJbnNpZGVDb25zdHJ1Y3RvciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5kZXhPZiAoYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICAgICAgaWYgKEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSAvLyBVc2UgdGhlIG5hdGl2ZSBhcnJheSBtZXRob2QgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtLCBmcm9tKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IGZyb20gfHwgMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgQnVpbHQtaW4gdG9rZW5zXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEF1Z21lbnQgWFJlZ0V4cCdzIHJlZ3VsYXIgZXhwcmVzc2lvbiBzeW50YXggYW5kIGZsYWdzLiBOb3RlIHRoYXQgd2hlbiBhZGRpbmcgdG9rZW5zLCB0aGVcbiAgICAvLyB0aGlyZCAoYHNjb3BlYCkgYXJndW1lbnQgZGVmYXVsdHMgdG8gYFhSZWdFeHAuT1VUU0lERV9DTEFTU2BcblxuICAgIC8vIENvbW1lbnQgcGF0dGVybjogKD8jIClcbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFwoXFw/I1teKV0qXFwpLyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRva2VucyBzZXBhcmF0ZWQgdW5sZXNzIHRoZSBmb2xsb3dpbmcgdG9rZW4gaXMgYSBxdWFudGlmaWVyXG4gICAgICAgICAgICByZXR1cm4gbmF0aXYudGVzdC5jYWxsKHF1YW50aWZpZXIsIG1hdGNoLmlucHV0LnNsaWNlKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSkgPyBcIlwiIDogXCIoPzopXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQ2FwdHVyaW5nIGdyb3VwIChtYXRjaCB0aGUgb3BlbmluZyBwYXJlbnRoZXNpcyBvbmx5KS5cbiAgICAvLyBSZXF1aXJlZCBmb3Igc3VwcG9ydCBvZiBuYW1lZCBjYXB0dXJpbmcgZ3JvdXBzXG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcKCg/IVxcPykvLFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhcHR1cmVOYW1lcy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIFwiKFwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIE5hbWVkIGNhcHR1cmluZyBncm91cCAobWF0Y2ggdGhlIG9wZW5pbmcgZGVsaW1pdGVyIG9ubHkpOiAoPzxuYW1lPlxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXChcXD88KFskXFx3XSspPi8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgdGhpcy5jYXB0dXJlTmFtZXMucHVzaChtYXRjaFsxXSk7XG4gICAgICAgICAgICB0aGlzLmhhc05hbWVkQ2FwdHVyZSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gXCIoXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTmFtZWQgYmFja3JlZmVyZW5jZTogXFxrPG5hbWU+XG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcXFxrPChbXFx3JF0rKT4vLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGluZGV4T2YodGhpcy5jYXB0dXJlTmFtZXMsIG1hdGNoWzFdKTtcbiAgICAgICAgICAgIC8vIEtlZXAgYmFja3JlZmVyZW5jZXMgc2VwYXJhdGUgZnJvbSBzdWJzZXF1ZW50IGxpdGVyYWwgbnVtYmVycy4gUHJlc2VydmUgYmFjay1cbiAgICAgICAgICAgIC8vIHJlZmVyZW5jZXMgdG8gbmFtZWQgZ3JvdXBzIHRoYXQgYXJlIHVuZGVmaW5lZCBhdCB0aGlzIHBvaW50IGFzIGxpdGVyYWwgc3RyaW5nc1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4ID4gLTEgP1xuICAgICAgICAgICAgICAgIFwiXFxcXFwiICsgKGluZGV4ICsgMSkgKyAoaXNOYU4obWF0Y2guaW5wdXQuY2hhckF0KG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSkgPyBcIlwiIDogXCIoPzopXCIpIDpcbiAgICAgICAgICAgICAgICBtYXRjaFswXTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBFbXB0eSBjaGFyYWN0ZXIgY2xhc3M6IFtdIG9yIFteXVxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXFtcXF4/XS8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gRm9yIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJpbGl0eSB3aXRoIEVTMywgY29udmVydCBbXSB0byBcXGJcXEIgYW5kIFteXSB0byBbXFxzXFxTXS5cbiAgICAgICAgICAgIC8vICg/ISkgc2hvdWxkIHdvcmsgbGlrZSBcXGJcXEIsIGJ1dCBpcyB1bnJlbGlhYmxlIGluIEZpcmVmb3hcbiAgICAgICAgICAgIHJldHVybiBtYXRjaFswXSA9PT0gXCJbXVwiID8gXCJcXFxcYlxcXFxCXCIgOiBcIltcXFxcc1xcXFxTXVwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIE1vZGUgbW9kaWZpZXIgYXQgdGhlIHN0YXJ0IG9mIHRoZSBwYXR0ZXJuIG9ubHksIHdpdGggYW55IGNvbWJpbmF0aW9uIG9mIGZsYWdzIGltc3g6ICg/aW1zeClcbiAgICAvLyBEb2VzIG5vdCBzdXBwb3J0IHgoP2kpLCAoPy1pKSwgKD9pLW0pLCAoP2k6ICksICg/aSkoP20pLCBldGMuXG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL15cXChcXD8oW2ltc3hdKylcXCkvLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RmxhZyhtYXRjaFsxXSk7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBXaGl0ZXNwYWNlIGFuZCBjb21tZW50cywgaW4gZnJlZS1zcGFjaW5nIChha2EgZXh0ZW5kZWQpIG1vZGUgb25seVxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC8oPzpcXHMrfCMuKikrLyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRva2VucyBzZXBhcmF0ZWQgdW5sZXNzIHRoZSBmb2xsb3dpbmcgdG9rZW4gaXMgYSBxdWFudGlmaWVyXG4gICAgICAgICAgICByZXR1cm4gbmF0aXYudGVzdC5jYWxsKHF1YW50aWZpZXIsIG1hdGNoLmlucHV0LnNsaWNlKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSkgPyBcIlwiIDogXCIoPzopXCI7XG4gICAgICAgIH0sXG4gICAgICAgIFhSZWdFeHAuT1VUU0lERV9DTEFTUyxcbiAgICAgICAgZnVuY3Rpb24gKCkge3JldHVybiB0aGlzLmhhc0ZsYWcoXCJ4XCIpO31cbiAgICApO1xuXG4gICAgLy8gRG90LCBpbiBkb3RhbGwgKGFrYSBzaW5nbGVsaW5lKSBtb2RlIG9ubHlcbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFwuLyxcbiAgICAgICAgZnVuY3Rpb24gKCkge3JldHVybiBcIltcXFxcc1xcXFxTXVwiO30sXG4gICAgICAgIFhSZWdFeHAuT1VUU0lERV9DTEFTUyxcbiAgICAgICAgZnVuY3Rpb24gKCkge3JldHVybiB0aGlzLmhhc0ZsYWcoXCJzXCIpO31cbiAgICApO1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBCYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIFVuY29tbWVudCB0aGUgZm9sbG93aW5nIGJsb2NrIGZvciBjb21wYXRpYmlsaXR5IHdpdGggWFJlZ0V4cCAxLjAtMS4yOlxuICAgIC8qXG4gICAgWFJlZ0V4cC5tYXRjaFdpdGhpbkNoYWluID0gWFJlZ0V4cC5tYXRjaENoYWluO1xuICAgIFJlZ0V4cC5wcm90b3R5cGUuYWRkRmxhZ3MgPSBmdW5jdGlvbiAocykge3JldHVybiBjbG9uZSh0aGlzLCBzKTt9O1xuICAgIFJlZ0V4cC5wcm90b3R5cGUuZXhlY0FsbCA9IGZ1bmN0aW9uIChzKSB7dmFyIHIgPSBbXTsgWFJlZ0V4cC5pdGVyYXRlKHMsIHRoaXMsIGZ1bmN0aW9uIChtKSB7ci5wdXNoKG0pO30pOyByZXR1cm4gcjt9O1xuICAgIFJlZ0V4cC5wcm90b3R5cGUuZm9yRWFjaEV4ZWMgPSBmdW5jdGlvbiAocywgZiwgYykge3JldHVybiBYUmVnRXhwLml0ZXJhdGUocywgdGhpcywgZiwgYyk7fTtcbiAgICBSZWdFeHAucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKHMpIHt2YXIgciA9IFJlZ0V4cChcIl4oPzpcIiArIHRoaXMuc291cmNlICsgXCIpJCg/IVxcXFxzKVwiLCBnZXROYXRpdmVGbGFncyh0aGlzKSk7IGlmICh0aGlzLmdsb2JhbCkgdGhpcy5sYXN0SW5kZXggPSAwOyByZXR1cm4gcy5zZWFyY2gocikgPT09IDA7fTtcbiAgICAqL1xuXG59KSgpO1xuXG5cbm1vZHVsZS5leHBvcnRzLlhSZWdFeHAgPSBYUmVnRXhwOyIsInZhciBYUmVnRXhwID0gcmVxdWlyZShcIi4vWFJlZ0V4cFwiKS5YUmVnRXhwO1xudmFyIGNsYXNzTmFtZSxcbiAgIGd1dHRlcjtcbi8vXG4vLyBCZWdpbiBhbm9ueW1vdXMgZnVuY3Rpb24uIFRoaXMgaXMgdXNlZCB0byBjb250YWluIGxvY2FsIHNjb3BlIHZhcmlhYmxlcyB3aXRob3V0IHBvbHV0dGluZyBnbG9iYWwgc2NvcGUuXG4vL1xudmFyIFN5bnRheEhpZ2hsaWdodGVyID0gZnVuY3Rpb24oKSB7IFxuXG4vLyBDb21tb25KU1xuaWYgKHR5cGVvZihyZXF1aXJlKSAhPSAndW5kZWZpbmVkJyAmJiB0eXBlb2YoWFJlZ0V4cCkgPT0gJ3VuZGVmaW5lZCcpXG57XG4vLyBObyBvcCBzaW5jZSByZXF1aXJlZCBwcm9wZXJseSBhdCB0b3Agb2YgZmlsZVxuXG59XG5cbi8vIFNob3J0Y3V0IG9iamVjdCB3aGljaCB3aWxsIGJlIGFzc2lnbmVkIHRvIHRoZSBTeW50YXhIaWdobGlnaHRlciB2YXJpYWJsZS5cbi8vIFRoaXMgaXMgYSBzaG9ydGhhbmQgZm9yIGxvY2FsIHJlZmVyZW5jZSBpbiBvcmRlciB0byBhdm9pZCBsb25nIG5hbWVzcGFjZSBcbi8vIHJlZmVyZW5jZXMgdG8gU3ludGF4SGlnaGxpZ2h0ZXIud2hhdGV2ZXIuLi5cbnZhciBzaCA9IHtcblx0ZGVmYXVsdHMgOiB7XG5cdFx0LyoqIEFkZGl0aW9uYWwgQ1NTIGNsYXNzIG5hbWVzIHRvIGJlIGFkZGVkIHRvIGhpZ2hsaWdodGVyIGVsZW1lbnRzLiAqL1xuXHRcdCdjbGFzcy1uYW1lJyA6ICcnLFxuXHRcdFxuXHRcdC8qKiBGaXJzdCBsaW5lIG51bWJlci4gKi9cblx0XHQnZmlyc3QtbGluZScgOiAxLFxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFBhZHMgbGluZSBudW1iZXJzLiBQb3NzaWJsZSB2YWx1ZXMgYXJlOlxuXHRcdCAqXG5cdFx0ICogICBmYWxzZSAtIGRvbid0IHBhZCBsaW5lIG51bWJlcnMuXG5cdFx0ICogICB0cnVlICAtIGF1dG9tYXRpY2FseSBwYWQgbnVtYmVycyB3aXRoIG1pbmltdW0gcmVxdWlyZWQgbnVtYmVyIG9mIGxlYWRpbmcgemVyb2VzLlxuXHRcdCAqICAgW2ludF0gLSBsZW5ndGggdXAgdG8gd2hpY2ggcGFkIGxpbmUgbnVtYmVycy5cblx0XHQgKi9cblx0XHQncGFkLWxpbmUtbnVtYmVycycgOiBmYWxzZSxcblx0XHRcblx0XHQvKiogTGluZXMgdG8gaGlnaGxpZ2h0LiAqL1xuXHRcdCdoaWdobGlnaHQnIDogbnVsbCxcblx0XHRcblx0XHQvKiogVGl0bGUgdG8gYmUgZGlzcGxheWVkIGFib3ZlIHRoZSBjb2RlIGJsb2NrLiAqL1xuXHRcdCd0aXRsZScgOiBudWxsLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIHNtYXJ0IHRhYnMuICovXG5cdFx0J3NtYXJ0LXRhYnMnIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogR2V0cyBvciBzZXRzIHRhYiBzaXplLiAqL1xuXHRcdCd0YWItc2l6ZScgOiA0LFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGd1dHRlci4gKi9cblx0XHQnZ3V0dGVyJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdG9vbGJhci4gKi9cblx0XHQndG9vbGJhcicgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIHF1aWNrIGNvZGUgY29weSBhbmQgcGFzdGUgZnJvbSBkb3VibGUgY2xpY2suICovXG5cdFx0J3F1aWNrLWNvZGUnIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogRm9yY2VzIGNvZGUgdmlldyB0byBiZSBjb2xsYXBzZWQuICovXG5cdFx0J2NvbGxhcHNlJyA6IGZhbHNlLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGF1dG9tYXRpYyBsaW5rcy4gKi9cblx0XHQnYXV0by1saW5rcycgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBHZXRzIG9yIHNldHMgbGlnaHQgbW9kZS4gRXF1YXZhbGVudCB0byB0dXJuaW5nIG9mZiBndXR0ZXIgYW5kIHRvb2xiYXIuICovXG5cdFx0J2xpZ2h0JyA6IGZhbHNlLFxuXG5cdFx0J3VuaW5kZW50JyA6IHRydWUsXG5cdFx0XG5cdFx0J2h0bWwtc2NyaXB0JyA6IGZhbHNlXG5cdH0sXG5cdFxuXHRjb25maWcgOiB7XG5cdFx0c3BhY2UgOiAnJm5ic3A7Jyxcblx0XHRcblx0XHQvKiogRW5hYmxlcyB1c2Ugb2YgPFNDUklQVCB0eXBlPVwic3ludGF4aGlnaGxpZ2h0ZXJcIiAvPiB0YWdzLiAqL1xuXHRcdHVzZVNjcmlwdFRhZ3MgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBCbG9nZ2VyIG1vZGUgZmxhZy4gKi9cblx0XHRibG9nZ2VyTW9kZSA6IGZhbHNlLFxuXHRcdFxuXHRcdHN0cmlwQnJzIDogZmFsc2UsXG5cdFx0XG5cdFx0LyoqIE5hbWUgb2YgdGhlIHRhZyB0aGF0IFN5bnRheEhpZ2hsaWdodGVyIHdpbGwgYXV0b21hdGljYWxseSBsb29rIGZvci4gKi9cblx0XHR0YWdOYW1lIDogJ3ByZScsXG5cdFx0XG5cdFx0c3RyaW5ncyA6IHtcblx0XHRcdGV4cGFuZFNvdXJjZSA6ICdleHBhbmQgc291cmNlJyxcblx0XHRcdGhlbHAgOiAnPycsXG5cdFx0XHRhbGVydDogJ1N5bnRheEhpZ2hsaWdodGVyXFxuXFxuJyxcblx0XHRcdG5vQnJ1c2ggOiAnQ2FuXFwndCBmaW5kIGJydXNoIGZvcjogJyxcblx0XHRcdGJydXNoTm90SHRtbFNjcmlwdCA6ICdCcnVzaCB3YXNuXFwndCBjb25maWd1cmVkIGZvciBodG1sLXNjcmlwdCBvcHRpb246ICcsXG5cdFx0XHRcblx0XHRcdC8vIHRoaXMgaXMgcG9wdWxhdGVkIGJ5IHRoZSBidWlsZCBzY3JpcHRcblx0XHRcdGFib3V0RGlhbG9nIDogJ0BBQk9VVEAnXG5cdFx0fVxuXHR9LFxuXHRcblx0LyoqIEludGVybmFsICdnbG9iYWwnIHZhcmlhYmxlcy4gKi9cblx0dmFycyA6IHtcblx0XHRkaXNjb3ZlcmVkQnJ1c2hlcyA6IG51bGwsXG5cdFx0aGlnaGxpZ2h0ZXJzIDoge31cblx0fSxcblx0XG5cdC8qKiBUaGlzIG9iamVjdCBpcyBwb3B1bGF0ZWQgYnkgdXNlciBpbmNsdWRlZCBleHRlcm5hbCBicnVzaCBmaWxlcy4gKi9cblx0YnJ1c2hlcyA6IHt9LFxuXG5cdC8qKiBDb21tb24gcmVndWxhciBleHByZXNzaW9ucy4gKi9cblx0cmVnZXhMaWIgOiB7XG5cdFx0bXVsdGlMaW5lQ0NvbW1lbnRzXHRcdFx0OiAvXFwvXFwqW1xcc1xcU10qP1xcKlxcLy9nbSxcblx0XHRzaW5nbGVMaW5lQ0NvbW1lbnRzXHRcdFx0OiAvXFwvXFwvLiokL2dtLFxuXHRcdHNpbmdsZUxpbmVQZXJsQ29tbWVudHNcdFx0OiAvIy4qJC9nbSxcblx0XHRkb3VibGVRdW90ZWRTdHJpbmdcdFx0XHQ6IC9cIihbXlxcXFxcIlxcbl18XFxcXC4pKlwiL2csXG5cdFx0c2luZ2xlUXVvdGVkU3RyaW5nXHRcdFx0OiAvJyhbXlxcXFwnXFxuXXxcXFxcLikqJy9nLFxuXHRcdG11bHRpTGluZURvdWJsZVF1b3RlZFN0cmluZ1x0OiBuZXcgWFJlZ0V4cCgnXCIoW15cXFxcXFxcXFwiXXxcXFxcXFxcXC4pKlwiJywgJ2dzJyksXG5cdFx0bXVsdGlMaW5lU2luZ2xlUXVvdGVkU3RyaW5nXHQ6IG5ldyBYUmVnRXhwKFwiJyhbXlxcXFxcXFxcJ118XFxcXFxcXFwuKSonXCIsICdncycpLFxuXHRcdHhtbENvbW1lbnRzXHRcdFx0XHRcdDogLygmbHQ7fDwpIS0tW1xcc1xcU10qPy0tKCZndDt8PikvZ20sXG5cdFx0dXJsXHRcdFx0XHRcdFx0XHQ6IC9cXHcrOlxcL1xcL1tcXHctLlxcLz8lJj06QDsjXSovZyxcblx0XHRcblx0XHQvKiogPD89ID8+IHRhZ3MuICovXG5cdFx0cGhwU2NyaXB0VGFncyBcdFx0XHRcdDogeyBsZWZ0OiAvKCZsdDt8PClcXD8oPzo9fHBocCk/L2csIHJpZ2h0OiAvXFw/KCZndDt8PikvZywgJ2VvZicgOiB0cnVlIH0sXG5cdFx0XG5cdFx0LyoqIDwlPSAlPiB0YWdzLiAqL1xuXHRcdGFzcFNjcmlwdFRhZ3NcdFx0XHRcdDogeyBsZWZ0OiAvKCZsdDt8PCklPT8vZywgcmlnaHQ6IC8lKCZndDt8PikvZyB9LFxuXHRcdFxuXHRcdC8qKiA8c2NyaXB0PiB0YWdzLiAqL1xuXHRcdHNjcmlwdFNjcmlwdFRhZ3NcdFx0XHQ6IHsgbGVmdDogLygmbHQ7fDwpXFxzKnNjcmlwdC4qPygmZ3Q7fD4pL2dpLCByaWdodDogLygmbHQ7fDwpXFwvXFxzKnNjcmlwdFxccyooJmd0O3w+KS9naSB9XG5cdH0sXG5cblx0dG9vbGJhcjoge1xuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgdGhlIHRvb2xiYXIuXG5cdFx0ICogQHBhcmFtIHtIaWdobGlnaHRlcn0gaGlnaGxpZ2h0ZXIgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UuXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHRcdCAqL1xuXHRcdGdldEh0bWw6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdHtcblx0XHRcdHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJ0b29sYmFyXCI+Jyxcblx0XHRcdFx0aXRlbXMgPSBzaC50b29sYmFyLml0ZW1zLFxuXHRcdFx0XHRsaXN0ID0gaXRlbXMubGlzdFxuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdGZ1bmN0aW9uIGRlZmF1bHRHZXRIdG1sKGhpZ2hsaWdodGVyLCBuYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gc2gudG9vbGJhci5nZXRCdXR0b25IdG1sKGhpZ2hsaWdodGVyLCBuYW1lLCBzaC5jb25maWcuc3RyaW5nc1tuYW1lXSk7XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG5cdFx0XHRcdGh0bWwgKz0gKGl0ZW1zW2xpc3RbaV1dLmdldEh0bWwgfHwgZGVmYXVsdEdldEh0bWwpKGhpZ2hsaWdodGVyLCBsaXN0W2ldKTtcblx0XHRcdFxuXHRcdFx0aHRtbCArPSAnPC9kaXY+Jztcblx0XHRcdFxuXHRcdFx0cmV0dXJuIGh0bWw7XG5cdFx0fSxcblx0XHRcblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIGEgcmVndWxhciBidXR0b24gaW4gdGhlIHRvb2xiYXIuXG5cdFx0ICogQHBhcmFtIHtIaWdobGlnaHRlcn0gaGlnaGxpZ2h0ZXIgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UuXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGNvbW1hbmROYW1lXHRcdENvbW1hbmQgbmFtZSB0aGF0IHdvdWxkIGJlIGV4ZWN1dGVkLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbFx0XHRcdExhYmVsIHRleHQgdG8gZGlzcGxheS5cblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0XHRcdFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdFx0ICovXG5cdFx0Z2V0QnV0dG9uSHRtbDogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIsIGNvbW1hbmROYW1lLCBsYWJlbClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJzxzcGFuPjxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ0b29sYmFyX2l0ZW0nXG5cdFx0XHRcdCsgJyBjb21tYW5kXycgKyBjb21tYW5kTmFtZVxuXHRcdFx0XHQrICcgJyArIGNvbW1hbmROYW1lXG5cdFx0XHRcdCsgJ1wiPicgKyBsYWJlbCArICc8L2E+PC9zcGFuPidcblx0XHRcdFx0O1xuXHRcdH0sXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogRXZlbnQgaGFuZGxlciBmb3IgYSB0b29sYmFyIGFuY2hvci5cblx0XHQgKi9cblx0XHRoYW5kbGVyOiBmdW5jdGlvbihlKVxuXHRcdHtcblx0XHRcdHZhciB0YXJnZXQgPSBlLnRhcmdldCxcblx0XHRcdFx0Y2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZSB8fCAnJ1xuXHRcdFx0XHQ7XG5cblx0XHRcdGZ1bmN0aW9uIGdldFZhbHVlKG5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciByID0gbmV3IFJlZ0V4cChuYW1lICsgJ18oXFxcXHcrKScpLFxuXHRcdFx0XHRcdG1hdGNoID0gci5leGVjKGNsYXNzTmFtZSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0dmFyIGhpZ2hsaWdodGVyID0gZ2V0SGlnaGxpZ2h0ZXJCeUlkKGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgJy5zeW50YXhoaWdobGlnaHRlcicpLmlkKSxcblx0XHRcdFx0Y29tbWFuZE5hbWUgPSBnZXRWYWx1ZSgnY29tbWFuZCcpXG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0Ly8gZXhlY3V0ZSB0aGUgdG9vbGJhciBjb21tYW5kXG5cdFx0XHRpZiAoaGlnaGxpZ2h0ZXIgJiYgY29tbWFuZE5hbWUpXG5cdFx0XHRcdHNoLnRvb2xiYXIuaXRlbXNbY29tbWFuZE5hbWVdLmV4ZWN1dGUoaGlnaGxpZ2h0ZXIpO1xuXG5cdFx0XHQvLyBkaXNhYmxlIGRlZmF1bHQgQSBjbGljayBiZWhhdmlvdXJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9LFxuXHRcdFxuXHRcdC8qKiBDb2xsZWN0aW9uIG9mIHRvb2xiYXIgaXRlbXMuICovXG5cdFx0aXRlbXMgOiB7XG5cdFx0XHQvLyBPcmRlcmVkIGxpcyBvZiBpdGVtcyBpbiB0aGUgdG9vbGJhci4gQ2FuJ3QgZXhwZWN0IGBmb3IgKHZhciBuIGluIGl0ZW1zKWAgdG8gYmUgY29uc2lzdGVudC5cblx0XHRcdGxpc3Q6IFsnZXhwYW5kU291cmNlJywgJ2hlbHAnXSxcblxuXHRcdFx0ZXhwYW5kU291cmNlOiB7XG5cdFx0XHRcdGdldEh0bWw6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGhpZ2hsaWdodGVyLmdldFBhcmFtKCdjb2xsYXBzZScpICE9IHRydWUpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHR2YXIgdGl0bGUgPSBoaWdobGlnaHRlci5nZXRQYXJhbSgndGl0bGUnKTtcblx0XHRcdFx0XHRyZXR1cm4gc2gudG9vbGJhci5nZXRCdXR0b25IdG1sKGhpZ2hsaWdodGVyLCAnZXhwYW5kU291cmNlJywgdGl0bGUgPyB0aXRsZSA6IHNoLmNvbmZpZy5zdHJpbmdzLmV4cGFuZFNvdXJjZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcblx0XHRcdFx0ZXhlY3V0ZTogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgZGl2ID0gZ2V0SGlnaGxpZ2h0ZXJEaXZCeUlkKGhpZ2hsaWdodGVyLmlkKTtcblx0XHRcdFx0XHRyZW1vdmVDbGFzcyhkaXYsICdjb2xsYXBzZWQnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqIENvbW1hbmQgdG8gZGlzcGxheSB0aGUgYWJvdXQgZGlhbG9nIHdpbmRvdy4gKi9cblx0XHRcdGhlbHA6IHtcblx0XHRcdFx0ZXhlY3V0ZTogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIpXG5cdFx0XHRcdHtcdFxuXHRcdFx0XHRcdHZhciB3bmQgPSBwb3B1cCgnJywgJ19ibGFuaycsIDUwMCwgMjUwLCAnc2Nyb2xsYmFycz0wJyksXG5cdFx0XHRcdFx0XHRkb2MgPSB3bmQuZG9jdW1lbnRcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkb2Mud3JpdGUoc2guY29uZmlnLnN0cmluZ3MuYWJvdXREaWFsb2cpO1xuXHRcdFx0XHRcdGRvYy5jbG9zZSgpO1xuXHRcdFx0XHRcdHduZC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhbGwgZWxlbWVudHMgb24gdGhlIHBhZ2Ugd2hpY2ggc2hvdWxkIGJlIHByb2Nlc3NlcyBieSBTeW50YXhIaWdobGlnaHRlci5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGdsb2JhbFBhcmFtc1x0XHRPcHRpb25hbCBwYXJhbWV0ZXJzIHdoaWNoIG92ZXJyaWRlIGVsZW1lbnQncyBcblx0ICogXHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1ldGVycy4gT25seSB1c2VkIGlmIGVsZW1lbnQgaXMgc3BlY2lmaWVkLlxuXHQgKiBcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcdE9wdGlvbmFsIGVsZW1lbnQgdG8gaGlnaGxpZ2h0LiBJZiBub25lIGlzXG5cdCAqIFx0XHRcdFx0XHRcdFx0cHJvdmlkZWQsIGFsbCBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBkb2N1bWVudCBcblx0ICogXHRcdFx0XHRcdFx0XHRhcmUgcmV0dXJuZWQgd2hpY2ggcXVhbGlmeS5cblx0ICpcblx0ICogQHJldHVybiB7QXJyYXl9XHRSZXR1cm5zIGxpc3Qgb2YgPGNvZGU+eyB0YXJnZXQ6IERPTUVsZW1lbnQsIHBhcmFtczogT2JqZWN0IH08L2NvZGU+IG9iamVjdHMuXG5cdCAqL1xuXHRmaW5kRWxlbWVudHM6IGZ1bmN0aW9uKGdsb2JhbFBhcmFtcywgZWxlbWVudClcblx0e1xuXHRcdHZhciBlbGVtZW50cyA9IGVsZW1lbnQgPyBbZWxlbWVudF0gOiB0b0FycmF5KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHNoLmNvbmZpZy50YWdOYW1lKSksIFxuXHRcdFx0Y29uZiA9IHNoLmNvbmZpZyxcblx0XHRcdHJlc3VsdCA9IFtdXG5cdFx0XHQ7XG5cblx0XHQvLyBzdXBwb3J0IGZvciA8U0NSSVBUIFRZUEU9XCJzeW50YXhoaWdobGlnaHRlclwiIC8+IGZlYXR1cmVcblx0XHRpZiAoY29uZi51c2VTY3JpcHRUYWdzKVxuXHRcdFx0ZWxlbWVudHMgPSBlbGVtZW50cy5jb25jYXQoZ2V0U3ludGF4SGlnaGxpZ2h0ZXJTY3JpcHRUYWdzKCkpO1xuXG5cdFx0aWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkgXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSBcblx0XHR7XG5cdFx0XHR2YXIgaXRlbSA9IHtcblx0XHRcdFx0dGFyZ2V0OiBlbGVtZW50c1tpXSwgXG5cdFx0XHRcdC8vIGxvY2FsIHBhcmFtcyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBnbG9iYWxzXG5cdFx0XHRcdHBhcmFtczogbWVyZ2UoZ2xvYmFsUGFyYW1zLCBwYXJzZVBhcmFtcyhlbGVtZW50c1tpXS5jbGFzc05hbWUpKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKGl0ZW0ucGFyYW1zWydicnVzaCddID09IG51bGwpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdHJlc3VsdC5wdXNoKGl0ZW0pO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTaG9ydGhhbmQgdG8gaGlnaGxpZ2h0IGFsbCBlbGVtZW50cyBvbiB0aGUgcGFnZSB0aGF0IGFyZSBtYXJrZWQgYXMgXG5cdCAqIFN5bnRheEhpZ2hsaWdodGVyIHNvdXJjZSBjb2RlLlxuXHQgKiBcblx0ICogQHBhcmFtIHtPYmplY3R9IGdsb2JhbFBhcmFtc1x0XHRPcHRpb25hbCBwYXJhbWV0ZXJzIHdoaWNoIG92ZXJyaWRlIGVsZW1lbnQncyBcblx0ICogXHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1ldGVycy4gT25seSB1c2VkIGlmIGVsZW1lbnQgaXMgc3BlY2lmaWVkLlxuXHQgKiBcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcdE9wdGlvbmFsIGVsZW1lbnQgdG8gaGlnaGxpZ2h0LiBJZiBub25lIGlzXG5cdCAqIFx0XHRcdFx0XHRcdFx0cHJvdmlkZWQsIGFsbCBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBkb2N1bWVudCBcblx0ICogXHRcdFx0XHRcdFx0XHRhcmUgaGlnaGxpZ2h0ZWQuXG5cdCAqLyBcblx0aGlnaGxpZ2h0OiBmdW5jdGlvbihnbG9iYWxQYXJhbXMsIGVsZW1lbnQpXG5cdHtcblx0XHR2YXIgZWxlbWVudHMgPSB0aGlzLmZpbmRFbGVtZW50cyhnbG9iYWxQYXJhbXMsIGVsZW1lbnQpLFxuXHRcdFx0cHJvcGVydHlOYW1lID0gJ2lubmVySFRNTCcsIFxuXHRcdFx0aGlnaGxpZ2h0ZXIgPSBudWxsLFxuXHRcdFx0Y29uZiA9IHNoLmNvbmZpZ1xuXHRcdFx0O1xuXG5cdFx0aWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkgXG5cdFx0XHRyZXR1cm47XG5cdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIFxuXHRcdHtcblx0XHRcdHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV0sXG5cdFx0XHRcdHRhcmdldCA9IGVsZW1lbnQudGFyZ2V0LFxuXHRcdFx0XHRwYXJhbXMgPSBlbGVtZW50LnBhcmFtcyxcblx0XHRcdFx0YnJ1c2hOYW1lID0gcGFyYW1zLmJydXNoLFxuXHRcdFx0XHRjb2RlXG5cdFx0XHRcdDtcblxuXHRcdFx0aWYgKGJydXNoTmFtZSA9PSBudWxsKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0Ly8gSW5zdGFudGlhdGUgYSBicnVzaFxuXHRcdFx0aWYgKHBhcmFtc1snaHRtbC1zY3JpcHQnXSA9PSAndHJ1ZScgfHwgc2guZGVmYXVsdHNbJ2h0bWwtc2NyaXB0J10gPT0gdHJ1ZSkgXG5cdFx0XHR7XG5cdFx0XHRcdGhpZ2hsaWdodGVyID0gbmV3IHNoLkh0bWxTY3JpcHQoYnJ1c2hOYW1lKTtcblx0XHRcdFx0YnJ1c2hOYW1lID0gJ2h0bWxzY3JpcHQnO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgYnJ1c2ggPSBmaW5kQnJ1c2goYnJ1c2hOYW1lKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChicnVzaClcblx0XHRcdFx0XHRoaWdobGlnaHRlciA9IG5ldyBicnVzaCgpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGNvZGUgPSB0YXJnZXRbcHJvcGVydHlOYW1lXTtcblx0XHRcdFxuXHRcdFx0Ly8gcmVtb3ZlIENEQVRBIGZyb20gPFNDUklQVC8+IHRhZ3MgaWYgaXQncyBwcmVzZW50XG5cdFx0XHRpZiAoY29uZi51c2VTY3JpcHRUYWdzKVxuXHRcdFx0XHRjb2RlID0gc3RyaXBDRGF0YShjb2RlKTtcblx0XHRcdFx0XG5cdFx0XHQvLyBJbmplY3QgdGl0bGUgaWYgdGhlIGF0dHJpYnV0ZSBpcyBwcmVzZW50XG5cdFx0XHRpZiAoKHRhcmdldC50aXRsZSB8fCAnJykgIT0gJycpXG5cdFx0XHRcdHBhcmFtcy50aXRsZSA9IHRhcmdldC50aXRsZTtcblx0XHRcdFx0XG5cdFx0XHRwYXJhbXNbJ2JydXNoJ10gPSBicnVzaE5hbWU7XG5cdFx0XHRoaWdobGlnaHRlci5pbml0KHBhcmFtcyk7XG5cdFx0XHRlbGVtZW50ID0gaGlnaGxpZ2h0ZXIuZ2V0RGl2KGNvZGUpO1xuXHRcdFx0XG5cdFx0XHQvLyBjYXJyeSBvdmVyIElEXG5cdFx0XHRpZiAoKHRhcmdldC5pZCB8fCAnJykgIT0gJycpXG5cdFx0XHRcdGVsZW1lbnQuaWQgPSB0YXJnZXQuaWQ7XG5cdFx0XHRcblx0XHRcdHRhcmdldC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbGVtZW50LCB0YXJnZXQpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIFN5bnRheEhpZ2hsaWdodGVyLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIE9wdGlvbmFsIHBhcmFtcyB0byBhcHBseSB0byBhbGwgaGlnaGxpZ2h0ZWQgZWxlbWVudHMuXG5cdCAqL1xuXHRhbGw6IGZ1bmN0aW9uKHBhcmFtcylcblx0e1xuXHRcdGF0dGFjaEV2ZW50KFxuXHRcdFx0d2luZG93LFxuXHRcdFx0J2xvYWQnLFxuXHRcdFx0ZnVuY3Rpb24oKSB7IHNoLmhpZ2hsaWdodChwYXJhbXMpOyB9XG5cdFx0KTtcblx0fVxufTsgLy8gZW5kIG9mIHNoXG5cbi8qKlxuICogQ2hlY2tzIGlmIHRhcmdldCBET00gZWxlbWVudHMgaGFzIHNwZWNpZmllZCBDU1MgY2xhc3MuXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnQgdG8gY2hlY2suXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIE5hbWUgb2YgdGhlIENTUyBjbGFzcyB0byBjaGVjayBmb3IuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgY2xhc3MgbmFtZSBpcyBwcmVzZW50LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGhhc0NsYXNzKHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHRyZXR1cm4gdGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKGNsYXNzTmFtZSkgIT0gLTE7XG59O1xuXG4vKipcbiAqIEFkZHMgQ1NTIGNsYXNzIG5hbWUgdG8gdGhlIHRhcmdldCBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgTmV3IENTUyBjbGFzcyB0byBhZGQuXG4gKi9cbmZ1bmN0aW9uIGFkZENsYXNzKHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHRpZiAoIWhhc0NsYXNzKHRhcmdldCwgY2xhc3NOYW1lKSlcblx0XHR0YXJnZXQuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBDU1MgY2xhc3MgbmFtZSBmcm9tIHRoZSB0YXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIENTUyBjbGFzcyB0byByZW1vdmUuXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHR0YXJnZXQuY2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZS5yZXBsYWNlKGNsYXNzTmFtZSwgJycpO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgc291cmNlIHRvIGFycmF5IG9iamVjdC4gTW9zdGx5IHVzZWQgZm9yIGZ1bmN0aW9uIGFyZ3VtZW50cyBhbmQgXG4gKiBsaXN0cyByZXR1cm5lZCBieSBnZXRFbGVtZW50c0J5VGFnTmFtZSgpIHdoaWNoIGFyZW4ndCBBcnJheSBvYmplY3RzLlxuICogQHBhcmFtIHtMaXN0fSBzb3VyY2UgU291cmNlIGxpc3QuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gdG9BcnJheShzb3VyY2UpXG57XG5cdHZhciByZXN1bHQgPSBbXTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSBcblx0XHRyZXN1bHQucHVzaChzb3VyY2VbaV0pO1xuXHRcdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBTcGxpdHMgYmxvY2sgb2YgdGV4dCBpbnRvIGxpbmVzLlxuICogQHBhcmFtIHtTdHJpbmd9IGJsb2NrIEJsb2NrIG9mIHRleHQuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhcnJheSBvZiBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gc3BsaXRMaW5lcyhibG9jaylcbntcblx0cmV0dXJuIGJsb2NrLnNwbGl0KC9cXHI/XFxuLyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIEhUTUwgSUQgZm9yIHRoZSBoaWdobGlnaHRlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBoaWdobGlnaHRlcklkIEhpZ2hsaWdodGVyIElELlxuICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIEhUTUwgSUQuXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodGVySWQoaWQpXG57XG5cdHZhciBwcmVmaXggPSAnaGlnaGxpZ2h0ZXJfJztcblx0cmV0dXJuIGlkLmluZGV4T2YocHJlZml4KSA9PSAwID8gaWQgOiBwcmVmaXggKyBpZDtcbn07XG5cbi8qKlxuICogRmluZHMgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UgYnkgSUQuXG4gKiBAcGFyYW0ge1N0cmluZ30gaGlnaGxpZ2h0ZXJJZCBIaWdobGlnaHRlciBJRC5cbiAqIEByZXR1cm4ge0hpZ2hsaWdodGVyfSBSZXR1cm5zIGluc3RhbmNlIG9mIHRoZSBoaWdobGlnaHRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0SGlnaGxpZ2h0ZXJCeUlkKGlkKVxue1xuXHRyZXR1cm4gc2gudmFycy5oaWdobGlnaHRlcnNbZ2V0SGlnaGxpZ2h0ZXJJZChpZCldO1xufTtcblxuLyoqXG4gKiBGaW5kcyBoaWdobGlnaHRlcidzIERJViBjb250YWluZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gaGlnaGxpZ2h0ZXJJZCBIaWdobGlnaHRlciBJRC5cbiAqIEByZXR1cm4ge0VsZW1lbnR9IFJldHVybnMgaGlnaGxpZ2h0ZXIncyBESVYgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZ2V0SGlnaGxpZ2h0ZXJEaXZCeUlkKGlkKVxue1xuXHRyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZ2V0SGlnaGxpZ2h0ZXJJZChpZCkpO1xufTtcblxuLyoqXG4gKiBTdG9yZXMgaGlnaGxpZ2h0ZXIgc28gdGhhdCBnZXRIaWdobGlnaHRlckJ5SWQoKSBjYW4gZG8gaXRzIHRoaW5nLiBFYWNoXG4gKiBoaWdobGlnaHRlciBtdXN0IGNhbGwgdGhpcyBtZXRob2QgdG8gcHJlc2VydmUgaXRzZWxmLlxuICogQHBhcmFtIHtIaWdoaWxnaHRlcn0gaGlnaGxpZ2h0ZXIgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0b3JlSGlnaGxpZ2h0ZXIoaGlnaGxpZ2h0ZXIpXG57XG5cdHNoLnZhcnMuaGlnaGxpZ2h0ZXJzW2dldEhpZ2hsaWdodGVySWQoaGlnaGxpZ2h0ZXIuaWQpXSA9IGhpZ2hsaWdodGVyO1xufTtcblxuLyoqXG4gKiBMb29rcyBmb3IgYSBjaGlsZCBvciBwYXJlbnQgbm9kZSB3aGljaCBoYXMgc3BlY2lmaWVkIGNsYXNzbmFtZS5cbiAqIEVxdWl2YWxlbnQgdG8galF1ZXJ5J3MgJChjb250YWluZXIpLmZpbmQoXCIuY2xhc3NOYW1lXCIpXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCBUYXJnZXQgZWxlbWVudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWFyY2ggQ2xhc3MgbmFtZSBvciBub2RlIG5hbWUgdG8gbG9vayBmb3IuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJldmVyc2UgSWYgc2V0IHRvIHRydWUsIHdpbGwgZ28gdXAgdGhlIG5vZGUgdHJlZSBpbnN0ZWFkIG9mIGRvd24uXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBSZXR1cm5zIGZvdW5kIGNoaWxkIG9yIHBhcmVudCBlbGVtZW50IG9uIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGZpbmRFbGVtZW50KHRhcmdldCwgc2VhcmNoLCByZXZlcnNlIC8qIG9wdGlvbmFsICovKVxue1xuXHRpZiAodGFyZ2V0ID09IG51bGwpXG5cdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdHZhciBub2Rlc1x0XHRcdD0gcmV2ZXJzZSAhPSB0cnVlID8gdGFyZ2V0LmNoaWxkTm9kZXMgOiBbIHRhcmdldC5wYXJlbnROb2RlIF0sXG5cdFx0cHJvcGVydHlUb0ZpbmRcdD0geyAnIycgOiAnaWQnLCAnLicgOiAnY2xhc3NOYW1lJyB9W3NlYXJjaC5zdWJzdHIoMCwgMSldIHx8ICdub2RlTmFtZScsXG5cdFx0ZXhwZWN0ZWRWYWx1ZSxcblx0XHRmb3VuZFxuXHRcdDtcblxuXHRleHBlY3RlZFZhbHVlID0gcHJvcGVydHlUb0ZpbmQgIT0gJ25vZGVOYW1lJ1xuXHRcdD8gc2VhcmNoLnN1YnN0cigxKVxuXHRcdDogc2VhcmNoLnRvVXBwZXJDYXNlKClcblx0XHQ7XG5cdFx0XG5cdC8vIG1haW4gcmV0dXJuIG9mIHRoZSBmb3VuZCBub2RlXG5cdGlmICgodGFyZ2V0W3Byb3BlcnR5VG9GaW5kXSB8fCAnJykuaW5kZXhPZihleHBlY3RlZFZhbHVlKSAhPSAtMSlcblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IG5vZGVzICYmIGkgPCBub2Rlcy5sZW5ndGggJiYgZm91bmQgPT0gbnVsbDsgaSsrKVxuXHRcdGZvdW5kID0gZmluZEVsZW1lbnQobm9kZXNbaV0sIHNlYXJjaCwgcmV2ZXJzZSk7XG5cdFxuXHRyZXR1cm4gZm91bmQ7XG59O1xuXG4vKipcbiAqIExvb2tzIGZvciBhIHBhcmVudCBub2RlIHdoaWNoIGhhcyBzcGVjaWZpZWQgY2xhc3NuYW1lLlxuICogVGhpcyBpcyBhbiBhbGlhcyB0byA8Y29kZT5maW5kRWxlbWVudChjb250YWluZXIsIGNsYXNzTmFtZSwgdHJ1ZSk8L2NvZGU+LlxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIENsYXNzIG5hbWUgdG8gbG9vayBmb3IuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBSZXR1cm5zIGZvdW5kIHBhcmVudCBlbGVtZW50IG9uIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHRyZXR1cm4gZmluZEVsZW1lbnQodGFyZ2V0LCBjbGFzc05hbWUsIHRydWUpO1xufTtcblxuLyoqXG4gKiBGaW5kcyBhbiBpbmRleCBvZiBlbGVtZW50IGluIHRoZSBhcnJheS5cbiAqIEBpZ25vcmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZWFyY2hFbGVtZW50XG4gKiBAcGFyYW0ge051bWJlcn0gZnJvbUluZGV4XG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFJldHVybnMgaW5kZXggb2YgZWxlbWVudCBpZiBmb3VuZDsgLTEgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCBzZWFyY2hFbGVtZW50LCBmcm9tSW5kZXgpXG57XG5cdGZyb21JbmRleCA9IE1hdGgubWF4KGZyb21JbmRleCB8fCAwLCAwKTtcblxuXHRmb3IgKHZhciBpID0gZnJvbUluZGV4OyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspXG5cdFx0aWYoYXJyYXlbaV0gPT0gc2VhcmNoRWxlbWVudClcblx0XHRcdHJldHVybiBpO1xuXHRcblx0cmV0dXJuIC0xO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB1bmlxdWUgZWxlbWVudCBJRC5cbiAqL1xuZnVuY3Rpb24gZ3VpZChwcmVmaXgpXG57XG5cdHJldHVybiAocHJlZml4IHx8ICcnKSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApLnRvU3RyaW5nKCk7XG59O1xuXG4vKipcbiAqIE1lcmdlcyB0d28gb2JqZWN0cy4gVmFsdWVzIGZyb20gb2JqMiBvdmVycmlkZSB2YWx1ZXMgaW4gb2JqMS5cbiAqIEZ1bmN0aW9uIGlzIE5PVCByZWN1cnNpdmUgYW5kIHdvcmtzIG9ubHkgZm9yIG9uZSBkaW1lbnNpb25hbCBvYmplY3RzLlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgRmlyc3Qgb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IG9iajIgU2Vjb25kIG9iamVjdC5cbiAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBjb21iaW5hdGlvbiBvZiBib3RoIG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKG9iajEsIG9iajIpXG57XG5cdHZhciByZXN1bHQgPSB7fSwgbmFtZTtcblxuXHRmb3IgKG5hbWUgaW4gb2JqMSkgXG5cdFx0cmVzdWx0W25hbWVdID0gb2JqMVtuYW1lXTtcblx0XG5cdGZvciAobmFtZSBpbiBvYmoyKSBcblx0XHRyZXN1bHRbbmFtZV0gPSBvYmoyW25hbWVdO1xuXHRcdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBjb252ZXJ0IHN0cmluZyB0byBib29sZWFuLlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIElucHV0IHN0cmluZy5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBpbnB1dCB3YXMgXCJ0cnVlXCIsIGZhbHNlIGlmIGlucHV0IHdhcyBcImZhbHNlXCIgYW5kIHZhbHVlIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKVxue1xuXHR2YXIgcmVzdWx0ID0geyBcInRydWVcIiA6IHRydWUsIFwiZmFsc2VcIiA6IGZhbHNlIH1bdmFsdWVdO1xuXHRyZXR1cm4gcmVzdWx0ID09IG51bGwgPyB2YWx1ZSA6IHJlc3VsdDtcbn07XG5cbi8qKlxuICogT3BlbnMgdXAgYSBjZW50ZXJlZCBwb3B1cCB3aW5kb3cuXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXHRcdFVSTCB0byBvcGVuIGluIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVx0XHRQb3B1cCBuYW1lLlxuICogQHBhcmFtIHtpbnR9IHdpZHRoXHRcdFBvcHVwIHdpZHRoLlxuICogQHBhcmFtIHtpbnR9IGhlaWdodFx0XHRQb3B1cCBoZWlnaHQuXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9uc1x0d2luZG93Lm9wZW4oKSBvcHRpb25zLlxuICogQHJldHVybiB7V2luZG93fVx0XHRcdFJldHVybnMgd2luZG93IGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBwb3B1cCh1cmwsIG5hbWUsIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpXG57XG5cdHZhciB4ID0gKHNjcmVlbi53aWR0aCAtIHdpZHRoKSAvIDIsXG5cdFx0eSA9IChzY3JlZW4uaGVpZ2h0IC0gaGVpZ2h0KSAvIDJcblx0XHQ7XG5cdFx0XG5cdG9wdGlvbnMgKz1cdCcsIGxlZnQ9JyArIHggKyBcblx0XHRcdFx0JywgdG9wPScgKyB5ICtcblx0XHRcdFx0Jywgd2lkdGg9JyArIHdpZHRoICtcblx0XHRcdFx0JywgaGVpZ2h0PScgKyBoZWlnaHRcblx0XHQ7XG5cdG9wdGlvbnMgPSBvcHRpb25zLnJlcGxhY2UoL14sLywgJycpO1xuXG5cdHZhciB3aW4gPSB3aW5kb3cub3Blbih1cmwsIG5hbWUsIG9wdGlvbnMpO1xuXHR3aW4uZm9jdXMoKTtcblx0cmV0dXJuIHdpbjtcbn07XG5cbi8qKlxuICogQWRkcyBldmVudCBoYW5kbGVyIHRvIHRoZSB0YXJnZXQgb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IG9ialx0XHRUYXJnZXQgb2JqZWN0LlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcdFx0TmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jXHRIYW5kbGluZyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYXR0YWNoRXZlbnQob2JqLCB0eXBlLCBmdW5jLCBzY29wZSlcbntcblx0ZnVuY3Rpb24gaGFuZGxlcihlKVxuXHR7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdFxuXHRcdGlmICghZS50YXJnZXQpXG5cdFx0e1xuXHRcdFx0ZS50YXJnZXQgPSBlLnNyY0VsZW1lbnQ7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnJldHVyblZhbHVlID0gZmFsc2U7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRcdFxuXHRcdGZ1bmMuY2FsbChzY29wZSB8fCB3aW5kb3csIGUpO1xuXHR9O1xuXHRcblx0aWYgKG9iai5hdHRhY2hFdmVudCkgXG5cdHtcblx0XHRvYmouYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGhhbmRsZXIpO1xuXHR9XG5cdGVsc2UgXG5cdHtcblx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XG5cdH1cbn07XG5cbi8qKlxuICogRGlzcGxheXMgYW4gYWxlcnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBkaXNwbGF5LlxuICovXG5mdW5jdGlvbiBhbGVydChzdHIpXG57XG5cdHdpbmRvdy5hbGVydChzaC5jb25maWcuc3RyaW5ncy5hbGVydCArIHN0cik7XG59O1xuXG4vKipcbiAqIEZpbmRzIGEgYnJ1c2ggYnkgaXRzIGFsaWFzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhbGlhc1x0XHRCcnVzaCBhbGlhcy5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hvd0FsZXJ0XHRTdXBwcmVzc2VzIHRoZSBhbGVydCBpZiBmYWxzZS5cbiAqIEByZXR1cm4ge0JydXNofVx0XHRcdFx0UmV0dXJucyBidXJzaCBjb25zdHJ1Y3RvciBpZiBmb3VuZCwgbnVsbCBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGZpbmRCcnVzaChhbGlhcywgc2hvd0FsZXJ0KVxue1xuXHR2YXIgYnJ1c2hlcyA9IHNoLnZhcnMuZGlzY292ZXJlZEJydXNoZXMsXG5cdFx0cmVzdWx0ID0gbnVsbFxuXHRcdDtcblx0XG5cdGlmIChicnVzaGVzID09IG51bGwpIFxuXHR7XG5cdFx0YnJ1c2hlcyA9IHt9O1xuXHRcdFxuXHRcdC8vIEZpbmQgYWxsIGJydXNoZXNcblx0XHRmb3IgKHZhciBicnVzaCBpbiBzaC5icnVzaGVzKSBcblx0XHR7XG5cdFx0XHR2YXIgaW5mbyA9IHNoLmJydXNoZXNbYnJ1c2hdLFxuXHRcdFx0XHRhbGlhc2VzID0gaW5mby5hbGlhc2VzXG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0aWYgKGFsaWFzZXMgPT0gbnVsbCkgXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHQvLyBrZWVwIHRoZSBicnVzaCBuYW1lXG5cdFx0XHRpbmZvLmJydXNoTmFtZSA9IGJydXNoLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYWxpYXNlcy5sZW5ndGg7IGkrKykgXG5cdFx0XHRcdGJydXNoZXNbYWxpYXNlc1tpXV0gPSBicnVzaDtcblx0XHR9XG5cdFx0XG5cdFx0c2gudmFycy5kaXNjb3ZlcmVkQnJ1c2hlcyA9IGJydXNoZXM7XG5cdH1cblx0XG5cdHJlc3VsdCA9IHNoLmJydXNoZXNbYnJ1c2hlc1thbGlhc11dO1xuXG5cdGlmIChyZXN1bHQgPT0gbnVsbCAmJiBzaG93QWxlcnQpXG5cdFx0YWxlcnQoc2guY29uZmlnLnN0cmluZ3Mubm9CcnVzaCArIGFsaWFzKTtcblx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY2FsbGJhY2sgb24gZWFjaCBsaW5lIGFuZCByZXBsYWNlcyBlYWNoIGxpbmUgd2l0aCByZXN1bHQgZnJvbSB0aGUgY2FsbGJhY2suXG4gKiBAcGFyYW0ge09iamVjdH0gc3RyXHRcdFx0SW5wdXQgc3RyaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IGNhbGxiYWNrXHRcdENhbGxiYWNrIGZ1bmN0aW9uIHRha2luZyBvbmUgc3RyaW5nIGFyZ3VtZW50IGFuZCByZXR1cm5pbmcgYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGVhY2hMaW5lKHN0ciwgY2FsbGJhY2spXG57XG5cdHZhciBsaW5lcyA9IHNwbGl0TGluZXMoc3RyKTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspXG5cdFx0bGluZXNbaV0gPSBjYWxsYmFjayhsaW5lc1tpXSwgaSk7XG5cdFx0XG5cdC8vIGluY2x1ZGUgXFxyIHRvIGVuYWJsZSBjb3B5LXBhc3RlIG9uIHdpbmRvd3MgKGllOCkgd2l0aG91dCBnZXR0aW5nIGV2ZXJ5dGhpbmcgb24gb25lIGxpbmVcblx0cmV0dXJuIGxpbmVzLmpvaW4oJ1xcclxcbicpO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGEgc3BlY2lhbCB0cmltIHdoaWNoIG9ubHkgcmVtb3ZlcyBmaXJzdCBhbmQgbGFzdCBlbXB0eSBsaW5lc1xuICogYW5kIGRvZXNuJ3QgYWZmZWN0IHZhbGlkIGxlYWRpbmcgc3BhY2Ugb24gdGhlIGZpcnN0IGxpbmUuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBSZXR1cm5zIHN0cmluZyB3aXRob3V0IGVtcHR5IGZpcnN0IGFuZCBsYXN0IGxpbmVzLlxuICovXG5mdW5jdGlvbiB0cmltRmlyc3RBbmRMYXN0TGluZXMoc3RyKVxue1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL15bIF0qW1xcbl0rfFtcXG5dKlsgXSokL2csICcnKTtcbn07XG5cbi8qKlxuICogUGFyc2VzIGtleS92YWx1ZSBwYWlycyBpbnRvIGhhc2ggb2JqZWN0LlxuICogXG4gKiBVbmRlcnN0YW5kcyB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gKiAtIG5hbWU6IHdvcmQ7XG4gKiAtIG5hbWU6IFt3b3JkLCB3b3JkXTtcbiAqIC0gbmFtZTogXCJzdHJpbmdcIjtcbiAqIC0gbmFtZTogJ3N0cmluZyc7XG4gKiBcbiAqIEZvciBleGFtcGxlOlxuICogICBuYW1lMTogdmFsdWU7IG5hbWUyOiBbdmFsdWUsIHZhbHVlXTsgbmFtZTM6ICd2YWx1ZSdcbiAqICAgXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgIElucHV0IHN0cmluZy5cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgUmV0dXJucyBkZXNlcmlhbGl6ZWQgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBwYXJzZVBhcmFtcyhzdHIpXG57XG5cdHZhciBtYXRjaCwgXG5cdFx0cmVzdWx0ID0ge30sXG5cdFx0YXJyYXlSZWdleCA9IG5ldyBYUmVnRXhwKFwiXlxcXFxbKD88dmFsdWVzPiguKj8pKVxcXFxdJFwiKSxcblx0XHRyZWdleCA9IG5ldyBYUmVnRXhwKFxuXHRcdFx0XCIoPzxuYW1lPltcXFxcdy1dKylcIiArXG5cdFx0XHRcIlxcXFxzKjpcXFxccypcIiArXG5cdFx0XHRcIig/PHZhbHVlPlwiICtcblx0XHRcdFx0XCJbXFxcXHctJSNdK3xcIiArXHRcdC8vIHdvcmRcblx0XHRcdFx0XCJcXFxcWy4qP1xcXFxdfFwiICtcdFx0Ly8gW10gYXJyYXlcblx0XHRcdFx0J1wiLio/XCJ8JyArXHRcdFx0Ly8gXCJcIiBzdHJpbmdcblx0XHRcdFx0XCInLio/J1wiICtcdFx0XHQvLyAnJyBzdHJpbmdcblx0XHRcdFwiKVxcXFxzKjs/XCIsXG5cdFx0XHRcImdcIlxuXHRcdClcblx0XHQ7XG5cblx0d2hpbGUgKChtYXRjaCA9IHJlZ2V4LmV4ZWMoc3RyKSkgIT0gbnVsbCkgXG5cdHtcblx0XHR2YXIgdmFsdWUgPSBtYXRjaC52YWx1ZVxuXHRcdFx0LnJlcGxhY2UoL15bJ1wiXXxbJ1wiXSQvZywgJycpIC8vIHN0cmlwIHF1b3RlcyBmcm9tIGVuZCBvZiBzdHJpbmdzXG5cdFx0XHQ7XG5cdFx0XG5cdFx0Ly8gdHJ5IHRvIHBhcnNlIGFycmF5IHZhbHVlXG5cdFx0aWYgKHZhbHVlICE9IG51bGwgJiYgYXJyYXlSZWdleC50ZXN0KHZhbHVlKSlcblx0XHR7XG5cdFx0XHR2YXIgbSA9IGFycmF5UmVnZXguZXhlYyh2YWx1ZSk7XG5cdFx0XHR2YWx1ZSA9IG0udmFsdWVzLmxlbmd0aCA+IDAgPyBtLnZhbHVlcy5zcGxpdCgvXFxzKixcXHMqLykgOiBbXTtcblx0XHR9XG5cdFx0XG5cdFx0cmVzdWx0W21hdGNoLm5hbWVdID0gdmFsdWU7XG5cdH1cblx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFdyYXBzIGVhY2ggbGluZSBvZiB0aGUgc3RyaW5nIGludG8gPGNvZGUvPiB0YWcgd2l0aCBnaXZlbiBzdHlsZSBhcHBsaWVkIHRvIGl0LlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgSW5wdXQgc3RyaW5nLlxuICogQHBhcmFtIHtTdHJpbmd9IGNzcyAgIFN0eWxlIG5hbWUgdG8gYXBwbHkgdG8gdGhlIHN0cmluZy5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBSZXR1cm5zIGlucHV0IHN0cmluZyB3aXRoIGVhY2ggbGluZSBzdXJyb3VuZGVkIGJ5IDxzcGFuLz4gdGFnLlxuICovXG5mdW5jdGlvbiB3cmFwTGluZXNXaXRoQ29kZShzdHIsIGNzcylcbntcblx0aWYgKHN0ciA9PSBudWxsIHx8IHN0ci5sZW5ndGggPT0gMCB8fCBzdHIgPT0gJ1xcbicpIFxuXHRcdHJldHVybiBzdHI7XG5cblx0c3RyID0gc3RyLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcblxuXHQvLyBSZXBsYWNlIHR3byBvciBtb3JlIHNlcXVlbnRpYWwgc3BhY2VzIHdpdGggJm5ic3A7IGxlYXZpbmcgbGFzdCBzcGFjZSB1bnRvdWNoZWQuXG5cdHN0ciA9IHN0ci5yZXBsYWNlKC8gezIsfS9nLCBmdW5jdGlvbihtKVxuXHR7XG5cdFx0dmFyIHNwYWNlcyA9ICcnO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGggLSAxOyBpKyspXG5cdFx0XHRzcGFjZXMgKz0gc2guY29uZmlnLnNwYWNlO1xuXHRcdFxuXHRcdHJldHVybiBzcGFjZXMgKyAnICc7XG5cdH0pO1xuXG5cdC8vIFNwbGl0IGVhY2ggbGluZSBhbmQgYXBwbHkgPHNwYW4gY2xhc3M9XCIuLi5cIj4uLi48L3NwYW4+IHRvIHRoZW0gc28gdGhhdFxuXHQvLyBsZWFkaW5nIHNwYWNlcyBhcmVuJ3QgaW5jbHVkZWQuXG5cdGlmIChjc3MgIT0gbnVsbCkgXG5cdFx0c3RyID0gZWFjaExpbmUoc3RyLCBmdW5jdGlvbihsaW5lKVxuXHRcdHtcblx0XHRcdGlmIChsaW5lLmxlbmd0aCA9PSAwKSBcblx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0XG5cdFx0XHR2YXIgc3BhY2VzID0gJyc7XG5cdFx0XHRcblx0XHRcdGxpbmUgPSBsaW5lLnJlcGxhY2UoL14oJm5ic3A7fCApKy8sIGZ1bmN0aW9uKHMpXG5cdFx0XHR7XG5cdFx0XHRcdHNwYWNlcyA9IHM7XG5cdFx0XHRcdHJldHVybiAnJztcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT0gMCkgXG5cdFx0XHRcdHJldHVybiBzcGFjZXM7XG5cdFx0XHRcblx0XHRcdHJldHVybiBzcGFjZXMgKyAnPGNvZGUgY2xhc3M9XCInICsgY3NzICsgJ1wiPicgKyBsaW5lICsgJzwvY29kZT4nO1xuXHRcdH0pO1xuXG5cdHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIFBhZHMgbnVtYmVyIHdpdGggemVyb3MgdW50aWwgaXQncyBsZW5ndGggaXMgdGhlIHNhbWUgYXMgZ2l2ZW4gbGVuZ3RoLlxuICogXG4gKiBAcGFyYW0ge051bWJlcn0gbnVtYmVyXHROdW1iZXIgdG8gcGFkLlxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aFx0TWF4IHN0cmluZyBsZW5ndGggd2l0aC5cbiAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRSZXR1cm5zIGEgc3RyaW5nIHBhZGRlZCB3aXRoIHByb3BlciBhbW91bnQgb2YgJzAnLlxuICovXG5mdW5jdGlvbiBwYWROdW1iZXIobnVtYmVyLCBsZW5ndGgpXG57XG5cdHZhciByZXN1bHQgPSBudW1iZXIudG9TdHJpbmcoKTtcblx0XG5cdHdoaWxlIChyZXN1bHQubGVuZ3RoIDwgbGVuZ3RoKVxuXHRcdHJlc3VsdCA9ICcwJyArIHJlc3VsdDtcblx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlcGxhY2VzIHRhYnMgd2l0aCBzcGFjZXMuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFNvdXJjZSBjb2RlLlxuICogQHBhcmFtIHtOdW1iZXJ9IHRhYlNpemVcdFNpemUgb2YgdGhlIHRhYi5cbiAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRSZXR1cm5zIGNvZGUgd2l0aCBhbGwgdGFicyByZXBsYWNlcyBieSBzcGFjZXMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NUYWJzKGNvZGUsIHRhYlNpemUpXG57XG5cdHZhciB0YWIgPSAnJztcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGFiU2l6ZTsgaSsrKVxuXHRcdHRhYiArPSAnICc7XG5cblx0cmV0dXJuIGNvZGUucmVwbGFjZSgvXFx0L2csIHRhYik7XG59O1xuXG4vKipcbiAqIFJlcGxhY2VzIHRhYnMgd2l0aCBzbWFydCBzcGFjZXMuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlICAgIENvZGUgdG8gZml4IHRoZSB0YWJzIGluLlxuICogQHBhcmFtIHtOdW1iZXJ9IHRhYlNpemUgTnVtYmVyIG9mIHNwYWNlcyBpbiBhIGNvbHVtbi5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgIFJldHVybnMgY29kZSB3aXRoIGFsbCB0YWJzIHJlcGxhY2VzIHdpdGggcm9wZXIgYW1vdW50IG9mIHNwYWNlcy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1NtYXJ0VGFicyhjb2RlLCB0YWJTaXplKVxue1xuXHR2YXIgbGluZXMgPSBzcGxpdExpbmVzKGNvZGUpLFxuXHRcdHRhYiA9ICdcXHQnLFxuXHRcdHNwYWNlcyA9ICcnXG5cdFx0O1xuXHRcblx0Ly8gQ3JlYXRlIGEgc3RyaW5nIHdpdGggMTAwMCBzcGFjZXMgdG8gY29weSBzcGFjZXMgZnJvbS4uLiBcblx0Ly8gSXQncyBhc3N1bWVkIHRoYXQgdGhlcmUgd291bGQgYmUgbm8gaW5kZW50YXRpb24gbG9uZ2VyIHRoYW4gdGhhdC5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCA1MDsgaSsrKSBcblx0XHRzcGFjZXMgKz0gJyAgICAgICAgICAgICAgICAgICAgJzsgLy8gMjAgc3BhY2VzICogNTBcblx0XHRcdFxuXHQvLyBUaGlzIGZ1bmN0aW9uIGluc2VydHMgc3BlY2lmaWVkIGFtb3VudCBvZiBzcGFjZXMgaW4gdGhlIHN0cmluZ1xuXHQvLyB3aGVyZSBhIHRhYiBpcyB3aGlsZSByZW1vdmluZyB0aGF0IGdpdmVuIHRhYi5cblx0ZnVuY3Rpb24gaW5zZXJ0U3BhY2VzKGxpbmUsIHBvcywgY291bnQpXG5cdHtcblx0XHRyZXR1cm4gbGluZS5zdWJzdHIoMCwgcG9zKVxuXHRcdFx0KyBzcGFjZXMuc3Vic3RyKDAsIGNvdW50KVxuXHRcdFx0KyBsaW5lLnN1YnN0cihwb3MgKyAxLCBsaW5lLmxlbmd0aCkgLy8gcG9zICsgMSB3aWxsIGdldCByaWQgb2YgdGhlIHRhYlxuXHRcdFx0O1xuXHR9O1xuXG5cdC8vIEdvIHRocm91Z2ggYWxsIHRoZSBsaW5lcyBhbmQgZG8gdGhlICdzbWFydCB0YWJzJyBtYWdpYy5cblx0Y29kZSA9IGVhY2hMaW5lKGNvZGUsIGZ1bmN0aW9uKGxpbmUpXG5cdHtcblx0XHRpZiAobGluZS5pbmRleE9mKHRhYikgPT0gLTEpIFxuXHRcdFx0cmV0dXJuIGxpbmU7XG5cdFx0XG5cdFx0dmFyIHBvcyA9IDA7XG5cdFx0XG5cdFx0d2hpbGUgKChwb3MgPSBsaW5lLmluZGV4T2YodGFiKSkgIT0gLTEpIFxuXHRcdHtcblx0XHRcdC8vIFRoaXMgaXMgcHJldHR5IG11Y2ggYWxsIHRoZXJlIGlzIHRvIHRoZSAnc21hcnQgdGFicycgbG9naWMuXG5cdFx0XHQvLyBCYXNlZCBvbiB0aGUgcG9zaXRpb24gd2l0aGluIHRoZSBsaW5lIGFuZCBzaXplIG9mIGEgdGFiLFxuXHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBhbW91bnQgb2Ygc3BhY2VzIHdlIG5lZWQgdG8gaW5zZXJ0LlxuXHRcdFx0dmFyIHNwYWNlcyA9IHRhYlNpemUgLSBwb3MgJSB0YWJTaXplO1xuXHRcdFx0bGluZSA9IGluc2VydFNwYWNlcyhsaW5lLCBwb3MsIHNwYWNlcyk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBsaW5lO1xuXHR9KTtcblx0XG5cdHJldHVybiBjb2RlO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyB2YXJpb3VzIHN0cmluZyBmaXhlcyBiYXNlZCBvbiBjb25maWd1cmF0aW9uLlxuICovXG5mdW5jdGlvbiBmaXhJbnB1dFN0cmluZyhzdHIpXG57XG5cdHZhciBiciA9IC88YnJcXHMqXFwvPz58Jmx0O2JyXFxzKlxcLz8mZ3Q7L2dpO1xuXHRcblx0aWYgKHNoLmNvbmZpZy5ibG9nZ2VyTW9kZSA9PSB0cnVlKVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKGJyLCAnXFxuJyk7XG5cblx0aWYgKHNoLmNvbmZpZy5zdHJpcEJycyA9PSB0cnVlKVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKGJyLCAnJyk7XG5cdFx0XG5cdHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIHdoaXRlIHNwYWNlIGF0IHRoZSBiZWdpbmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgU3RyaW5nIHRvIHRyaW0uXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyBzdHJpbmcgd2l0aG91dCBsZWFkaW5nIGFuZCBmb2xsb3dpbmcgd2hpdGUgc3BhY2UgY2hhcmFjdGVycy5cbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpXG57XG5cdHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufTtcblxuLyoqXG4gKiBVbmluZGVudHMgYSBibG9jayBvZiB0ZXh0IGJ5IHRoZSBsb3dlc3QgY29tbW9uIGluZGVudCBhbW91bnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgVGV4dCB0byB1bmluZGVudC5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBSZXR1cm5zIHVuaW5kZW50ZWQgdGV4dCBibG9jay5cbiAqL1xuZnVuY3Rpb24gdW5pbmRlbnQoc3RyKVxue1xuXHR2YXIgbGluZXMgPSBzcGxpdExpbmVzKGZpeElucHV0U3RyaW5nKHN0cikpLFxuXHRcdGluZGVudHMgPSBuZXcgQXJyYXkoKSxcblx0XHRyZWdleCA9IC9eXFxzKi8sXG5cdFx0bWluID0gMTAwMFxuXHRcdDtcblx0XG5cdC8vIGdvIHRocm91Z2ggZXZlcnkgbGluZSBhbmQgY2hlY2sgZm9yIGNvbW1vbiBudW1iZXIgb2YgaW5kZW50c1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aCAmJiBtaW4gPiAwOyBpKyspIFxuXHR7XG5cdFx0dmFyIGxpbmUgPSBsaW5lc1tpXTtcblx0XHRcblx0XHRpZiAodHJpbShsaW5lKS5sZW5ndGggPT0gMCkgXG5cdFx0XHRjb250aW51ZTtcblx0XHRcblx0XHR2YXIgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMobGluZSk7XG5cdFx0XG5cdFx0Ly8gSW4gdGhlIGV2ZW50IHRoYXQganVzdCBvbmUgbGluZSBkb2Vzbid0IGhhdmUgbGVhZGluZyB3aGl0ZSBzcGFjZVxuXHRcdC8vIHdlIGNhbid0IHVuaW5kZW50IGFueXRoaW5nLCBzbyBiYWlsIGNvbXBsZXRlbHkuXG5cdFx0aWYgKG1hdGNoZXMgPT0gbnVsbCkgXG5cdFx0XHRyZXR1cm4gc3RyO1xuXHRcdFx0XG5cdFx0bWluID0gTWF0aC5taW4obWF0Y2hlc1swXS5sZW5ndGgsIG1pbik7XG5cdH1cblx0XG5cdC8vIHRyaW0gbWluaW11bSBjb21tb24gbnVtYmVyIG9mIHdoaXRlIHNwYWNlIGZyb20gdGhlIGJlZ2luaW5nIG9mIGV2ZXJ5IGxpbmVcblx0aWYgKG1pbiA+IDApIFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIFxuXHRcdFx0bGluZXNbaV0gPSBsaW5lc1tpXS5zdWJzdHIobWluKTtcblx0XG5cdHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn07XG5cbi8qKlxuICogQ2FsbGJhY2sgbWV0aG9kIGZvciBBcnJheS5zb3J0KCkgd2hpY2ggc29ydHMgbWF0Y2hlcyBieVxuICogaW5kZXggcG9zaXRpb24gYW5kIHRoZW4gYnkgbGVuZ3RoLlxuICogXG4gKiBAcGFyYW0ge01hdGNofSBtMVx0TGVmdCBvYmplY3QuXG4gKiBAcGFyYW0ge01hdGNofSBtMiAgICBSaWdodCBvYmplY3QuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBSZXR1cm5zIC0xLCAwIG9yIC0xIGFzIGEgY29tcGFyaXNvbiByZXN1bHQuXG4gKi9cbmZ1bmN0aW9uIG1hdGNoZXNTb3J0Q2FsbGJhY2sobTEsIG0yKVxue1xuXHQvLyBzb3J0IG1hdGNoZXMgYnkgaW5kZXggZmlyc3Rcblx0aWYobTEuaW5kZXggPCBtMi5pbmRleClcblx0XHRyZXR1cm4gLTE7XG5cdGVsc2UgaWYobTEuaW5kZXggPiBtMi5pbmRleClcblx0XHRyZXR1cm4gMTtcblx0ZWxzZVxuXHR7XG5cdFx0Ly8gaWYgaW5kZXggaXMgdGhlIHNhbWUsIHNvcnQgYnkgbGVuZ3RoXG5cdFx0aWYobTEubGVuZ3RoIDwgbTIubGVuZ3RoKVxuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdGVsc2UgaWYobTEubGVuZ3RoID4gbTIubGVuZ3RoKVxuXHRcdFx0cmV0dXJuIDE7XG5cdH1cblx0XG5cdHJldHVybiAwO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gb24gcHJvdmlkZWQgY29kZSBhbmQgcmV0dXJucyBhbGxcbiAqIG1hdGNoZXMgdGhhdCBhcmUgZm91bmQuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlICAgIENvZGUgdG8gZXhlY3V0ZSByZWd1bGFyIGV4cHJlc3Npb24gb24uXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXggICBSZWd1bGFyIGV4cHJlc3Npb24gaXRlbSBpbmZvIGZyb20gPGNvZGU+cmVnZXhMaXN0PC9jb2RlPiBjb2xsZWN0aW9uLlxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgUmV0dXJucyBhIGxpc3Qgb2YgTWF0Y2ggb2JqZWN0cy5cbiAqLyBcbmZ1bmN0aW9uIGdldE1hdGNoZXMoY29kZSwgcmVnZXhJbmZvKVxue1xuXHRmdW5jdGlvbiBkZWZhdWx0QWRkKG1hdGNoLCByZWdleEluZm8pXG5cdHtcblx0XHRyZXR1cm4gbWF0Y2hbMF07XG5cdH07XG5cdFxuXHR2YXIgaW5kZXggPSAwLFxuXHRcdG1hdGNoID0gbnVsbCxcblx0XHRtYXRjaGVzID0gW10sXG5cdFx0ZnVuYyA9IHJlZ2V4SW5mby5mdW5jID8gcmVnZXhJbmZvLmZ1bmMgOiBkZWZhdWx0QWRkXG5cdFx0O1xuXHRcblx0d2hpbGUoKG1hdGNoID0gcmVnZXhJbmZvLnJlZ2V4LmV4ZWMoY29kZSkpICE9IG51bGwpXG5cdHtcblx0XHR2YXIgcmVzdWx0TWF0Y2ggPSBmdW5jKG1hdGNoLCByZWdleEluZm8pO1xuXHRcdFxuXHRcdGlmICh0eXBlb2YocmVzdWx0TWF0Y2gpID09ICdzdHJpbmcnKVxuXHRcdFx0cmVzdWx0TWF0Y2ggPSBbbmV3IHNoLk1hdGNoKHJlc3VsdE1hdGNoLCBtYXRjaC5pbmRleCwgcmVnZXhJbmZvLmNzcyldO1xuXG5cdFx0bWF0Y2hlcyA9IG1hdGNoZXMuY29uY2F0KHJlc3VsdE1hdGNoKTtcblx0fVxuXHRcblx0cmV0dXJuIG1hdGNoZXM7XG59O1xuXG4vKipcbiAqIFR1cm5zIGFsbCBVUkxzIGluIHRoZSBjb2RlIGludG8gPGEvPiB0YWdzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgSW5wdXQgY29kZS5cbiAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBjb2RlIHdpdGggPC9hPiB0YWdzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzVXJscyhjb2RlKVxue1xuXHR2YXIgZ3QgPSAvKC4qKSgoJmd0O3wmbHQ7KS4qKS87XG5cdFxuXHRyZXR1cm4gY29kZS5yZXBsYWNlKHNoLnJlZ2V4TGliLnVybCwgZnVuY3Rpb24obSlcblx0e1xuXHRcdHZhciBzdWZmaXggPSAnJyxcblx0XHRcdG1hdGNoID0gbnVsbFxuXHRcdFx0O1xuXHRcdFxuXHRcdC8vIFdlIGluY2x1ZGUgJmx0OyBhbmQgJmd0OyBpbiB0aGUgVVJMIGZvciB0aGUgY29tbW9uIGNhc2VzIGxpa2UgPGh0dHA6Ly9nb29nbGUuY29tPlxuXHRcdC8vIFRoZSBwcm9ibGVtIGlzIHRoYXQgdGhleSBnZXQgdHJhbnNmb3JtZWQgaW50byAmbHQ7aHR0cDovL2dvb2dsZS5jb20mZ3Q7XG5cdFx0Ly8gV2hlcmUgYXMgJmd0OyBlYXNpbHkgbG9va3MgbGlrZSBwYXJ0IG9mIHRoZSBVUkwgc3RyaW5nLlxuXHRcblx0XHRpZiAobWF0Y2ggPSBndC5leGVjKG0pKVxuXHRcdHtcblx0XHRcdG0gPSBtYXRjaFsxXTtcblx0XHRcdHN1ZmZpeCA9IG1hdGNoWzJdO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gJzxhIGhyZWY9XCInICsgbSArICdcIj4nICsgbSArICc8L2E+JyArIHN1ZmZpeDtcblx0fSk7XG59O1xuXG4vKipcbiAqIEZpbmRzIGFsbCA8U0NSSVBUIFRZUEU9XCJzeW50YXhoaWdobGlnaHRlclwiIC8+IGVsZW1lbnRzcy5cbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFycmF5IG9mIGFsbCBmb3VuZCBTeW50YXhIaWdobGlnaHRlciB0YWdzLlxuICovXG5mdW5jdGlvbiBnZXRTeW50YXhIaWdobGlnaHRlclNjcmlwdFRhZ3MoKVxue1xuXHR2YXIgdGFncyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSxcblx0XHRyZXN1bHQgPSBbXVxuXHRcdDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGFncy5sZW5ndGg7IGkrKylcblx0XHRpZiAodGFnc1tpXS50eXBlID09ICdzeW50YXhoaWdobGlnaHRlcicpXG5cdFx0XHRyZXN1bHQucHVzaCh0YWdzW2ldKTtcblx0XHRcdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBTdHJpcHMgPCFbQ0RBVEFbXV0+IGZyb20gPFNDUklQVCAvPiBjb250ZW50IGJlY2F1c2UgaXQgc2hvdWxkIGJlIHVzZWRcbiAqIHRoZXJlIGluIG1vc3QgY2FzZXMgZm9yIFhIVE1MIGNvbXBsaWFuY2UuXG4gKiBAcGFyYW0ge1N0cmluZ30gb3JpZ2luYWxcdElucHV0IGNvZGUuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgY29kZSB3aXRob3V0IGxlYWRpbmcgPCFbQ0RBVEFbXV0+IHRhZ3MuXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQ0RhdGEob3JpZ2luYWwpXG57XG5cdHZhciBsZWZ0ID0gJzwhW0NEQVRBWycsXG5cdFx0cmlnaHQgPSAnXV0+Jyxcblx0XHQvLyBmb3Igc29tZSByZWFzb24gSUUgaW5zZXJ0cyBzb21lIGxlYWRpbmcgYmxhbmtzIGhlcmVcblx0XHRjb3B5ID0gdHJpbShvcmlnaW5hbCksXG5cdFx0Y2hhbmdlZCA9IGZhbHNlLFxuXHRcdGxlZnRMZW5ndGggPSBsZWZ0Lmxlbmd0aCxcblx0XHRyaWdodExlbmd0aCA9IHJpZ2h0Lmxlbmd0aFxuXHRcdDtcblx0XG5cdGlmIChjb3B5LmluZGV4T2YobGVmdCkgPT0gMClcblx0e1xuXHRcdGNvcHkgPSBjb3B5LnN1YnN0cmluZyhsZWZ0TGVuZ3RoKTtcblx0XHRjaGFuZ2VkID0gdHJ1ZTtcblx0fVxuXHRcblx0dmFyIGNvcHlMZW5ndGggPSBjb3B5Lmxlbmd0aDtcblx0XG5cdGlmIChjb3B5LmluZGV4T2YocmlnaHQpID09IGNvcHlMZW5ndGggLSByaWdodExlbmd0aClcblx0e1xuXHRcdGNvcHkgPSBjb3B5LnN1YnN0cmluZygwLCBjb3B5TGVuZ3RoIC0gcmlnaHRMZW5ndGgpO1xuXHRcdGNoYW5nZWQgPSB0cnVlO1xuXHR9XG5cdFxuXHRyZXR1cm4gY2hhbmdlZCA/IGNvcHkgOiBvcmlnaW5hbDtcbn07XG5cblxuLyoqXG4gKiBRdWljayBjb2RlIG1vdXNlIGRvdWJsZSBjbGljayBoYW5kbGVyLlxuICovXG5mdW5jdGlvbiBxdWlja0NvZGVIYW5kbGVyKGUpXG57XG5cdHZhciB0YXJnZXQgPSBlLnRhcmdldCxcblx0XHRoaWdobGlnaHRlckRpdiA9IGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgJy5zeW50YXhoaWdobGlnaHRlcicpLFxuXHRcdGNvbnRhaW5lciA9IGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgJy5jb250YWluZXInKSxcblx0XHR0ZXh0YXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyksXG5cdFx0aGlnaGxpZ2h0ZXJcblx0XHQ7XG5cblx0aWYgKCFjb250YWluZXIgfHwgIWhpZ2hsaWdodGVyRGl2IHx8IGZpbmRFbGVtZW50KGNvbnRhaW5lciwgJ3RleHRhcmVhJykpXG5cdFx0cmV0dXJuO1xuXG5cdGhpZ2hsaWdodGVyID0gZ2V0SGlnaGxpZ2h0ZXJCeUlkKGhpZ2hsaWdodGVyRGl2LmlkKTtcblx0XG5cdC8vIGFkZCBzb3VyY2UgY2xhc3MgbmFtZVxuXHRhZGRDbGFzcyhoaWdobGlnaHRlckRpdiwgJ3NvdXJjZScpO1xuXG5cdC8vIEhhdmUgdG8gZ28gb3ZlciBlYWNoIGxpbmUgYW5kIGdyYWIgaXQncyB0ZXh0LCBjYW4ndCBqdXN0IGRvIGl0IG9uIHRoZVxuXHQvLyBjb250YWluZXIgYmVjYXVzZSBGaXJlZm94IGxvc2VzIGFsbCBcXG4gd2hlcmUgYXMgV2Via2l0IGRvZXNuJ3QuXG5cdHZhciBsaW5lcyA9IGNvbnRhaW5lci5jaGlsZE5vZGVzLFxuXHRcdGNvZGUgPSBbXVxuXHRcdDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspXG5cdFx0Y29kZS5wdXNoKGxpbmVzW2ldLmlubmVyVGV4dCB8fCBsaW5lc1tpXS50ZXh0Q29udGVudCk7XG5cdFxuXHQvLyB1c2luZyBcXHIgaW5zdGVhZCBvZiBcXHIgb3IgXFxyXFxuIG1ha2VzIHRoaXMgd29yayBlcXVhbGx5IHdlbGwgb24gSUUsIEZGIGFuZCBXZWJraXRcblx0Y29kZSA9IGNvZGUuam9pbignXFxyJyk7XG5cbiAgICAvLyBGb3IgV2Via2l0IGJyb3dzZXJzLCByZXBsYWNlIG5ic3Agd2l0aCBhIGJyZWFraW5nIHNwYWNlXG4gICAgY29kZSA9IGNvZGUucmVwbGFjZSgvXFx1MDBhMC9nLCBcIiBcIik7XG5cdFxuXHQvLyBpbmplY3QgPHRleHRhcmVhLz4gdGFnXG5cdHRleHRhcmVhLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNvZGUpKTtcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRleHRhcmVhKTtcblx0XG5cdC8vIHByZXNlbGVjdCBhbGwgdGV4dFxuXHR0ZXh0YXJlYS5mb2N1cygpO1xuXHR0ZXh0YXJlYS5zZWxlY3QoKTtcblx0XG5cdC8vIHNldCB1cCBoYW5kbGVyIGZvciBsb3N0IGZvY3VzXG5cdGF0dGFjaEV2ZW50KHRleHRhcmVhLCAnYmx1cicsIGZ1bmN0aW9uKGUpXG5cdHtcblx0XHR0ZXh0YXJlYS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRleHRhcmVhKTtcblx0XHRyZW1vdmVDbGFzcyhoaWdobGlnaHRlckRpdiwgJ3NvdXJjZScpO1xuXHR9KTtcbn07XG5cbi8qKlxuICogTWF0Y2ggb2JqZWN0LlxuICovXG5zaC5NYXRjaCA9IGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY3NzKVxue1xuXHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdHRoaXMuaW5kZXggPSBpbmRleDtcblx0dGhpcy5sZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cdHRoaXMuY3NzID0gY3NzO1xuXHR0aGlzLmJydXNoTmFtZSA9IG51bGw7XG59O1xuXG5zaC5NYXRjaC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpXG57XG5cdHJldHVybiB0aGlzLnZhbHVlO1xufTtcblxuLyoqXG4gKiBTaW11bGF0ZXMgSFRNTCBjb2RlIHdpdGggYSBzY3JpcHRpbmcgbGFuZ3VhZ2UgZW1iZWRkZWQuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzY3JpcHRCcnVzaE5hbWUgQnJ1c2ggbmFtZSBvZiB0aGUgc2NyaXB0aW5nIGxhbmd1YWdlLlxuICovXG5zaC5IdG1sU2NyaXB0ID0gZnVuY3Rpb24oc2NyaXB0QnJ1c2hOYW1lKVxue1xuXHR2YXIgYnJ1c2hDbGFzcyA9IGZpbmRCcnVzaChzY3JpcHRCcnVzaE5hbWUpLFxuXHRcdHNjcmlwdEJydXNoLFxuXHRcdHhtbEJydXNoID0gbmV3IHNoLmJydXNoZXMuWG1sKCksXG5cdFx0YnJhY2tldHNSZWdleCA9IG51bGwsXG5cdFx0cmVmID0gdGhpcyxcblx0XHRtZXRob2RzVG9FeHBvc2UgPSAnZ2V0RGl2IGdldEh0bWwgaW5pdCcuc3BsaXQoJyAnKVxuXHRcdDtcblxuXHRpZiAoYnJ1c2hDbGFzcyA9PSBudWxsKVxuXHRcdHJldHVybjtcblx0XG5cdHNjcmlwdEJydXNoID0gbmV3IGJydXNoQ2xhc3MoKTtcblx0XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBtZXRob2RzVG9FeHBvc2UubGVuZ3RoOyBpKyspXG5cdFx0Ly8gbWFrZSBhIGNsb3N1cmUgc28gd2UgZG9uJ3QgbG9zZSB0aGUgbmFtZSBhZnRlciBpIGNoYW5nZXNcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmFtZSA9IG1ldGhvZHNUb0V4cG9zZVtpXTtcblx0XHRcdFxuXHRcdFx0cmVmW25hbWVdID0gZnVuY3Rpb24oKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4geG1sQnJ1c2hbbmFtZV0uYXBwbHkoeG1sQnJ1c2gsIGFyZ3VtZW50cyk7XG5cdFx0XHR9O1xuXHRcdH0pKCk7XG5cdFxuXHRpZiAoc2NyaXB0QnJ1c2guaHRtbFNjcmlwdCA9PSBudWxsKVxuXHR7XG5cdFx0YWxlcnQoc2guY29uZmlnLnN0cmluZ3MuYnJ1c2hOb3RIdG1sU2NyaXB0ICsgc2NyaXB0QnJ1c2hOYW1lKTtcblx0XHRyZXR1cm47XG5cdH1cblx0XG5cdHhtbEJydXNoLnJlZ2V4TGlzdC5wdXNoKFxuXHRcdHsgcmVnZXg6IHNjcmlwdEJydXNoLmh0bWxTY3JpcHQuY29kZSwgZnVuYzogcHJvY2VzcyB9XG5cdCk7XG5cdFxuXHRmdW5jdGlvbiBvZmZzZXRNYXRjaGVzKG1hdGNoZXMsIG9mZnNldClcblx0e1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgbWF0Y2hlcy5sZW5ndGg7IGorKykgXG5cdFx0XHRtYXRjaGVzW2pdLmluZGV4ICs9IG9mZnNldDtcblx0fVxuXHRcblx0ZnVuY3Rpb24gcHJvY2VzcyhtYXRjaCwgaW5mbylcblx0e1xuXHRcdHZhciBjb2RlID0gbWF0Y2guY29kZSxcblx0XHRcdG1hdGNoZXMgPSBbXSxcblx0XHRcdHJlZ2V4TGlzdCA9IHNjcmlwdEJydXNoLnJlZ2V4TGlzdCxcblx0XHRcdG9mZnNldCA9IG1hdGNoLmluZGV4ICsgbWF0Y2gubGVmdC5sZW5ndGgsXG5cdFx0XHRodG1sU2NyaXB0ID0gc2NyaXB0QnJ1c2guaHRtbFNjcmlwdCxcblx0XHRcdHJlc3VsdFxuXHRcdFx0O1xuXG5cdFx0Ly8gYWRkIGFsbCBtYXRjaGVzIGZyb20gdGhlIGNvZGVcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2V4TGlzdC5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRyZXN1bHQgPSBnZXRNYXRjaGVzKGNvZGUsIHJlZ2V4TGlzdFtpXSk7XG5cdFx0XHRvZmZzZXRNYXRjaGVzKHJlc3VsdCwgb2Zmc2V0KTtcblx0XHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHQpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBhZGQgbGVmdCBzY3JpcHQgYnJhY2tldFxuXHRcdGlmIChodG1sU2NyaXB0LmxlZnQgIT0gbnVsbCAmJiBtYXRjaC5sZWZ0ICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0cmVzdWx0ID0gZ2V0TWF0Y2hlcyhtYXRjaC5sZWZ0LCBodG1sU2NyaXB0LmxlZnQpO1xuXHRcdFx0b2Zmc2V0TWF0Y2hlcyhyZXN1bHQsIG1hdGNoLmluZGV4KTtcblx0XHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHQpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBhZGQgcmlnaHQgc2NyaXB0IGJyYWNrZXRcblx0XHRpZiAoaHRtbFNjcmlwdC5yaWdodCAhPSBudWxsICYmIG1hdGNoLnJpZ2h0ICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0cmVzdWx0ID0gZ2V0TWF0Y2hlcyhtYXRjaC5yaWdodCwgaHRtbFNjcmlwdC5yaWdodCk7XG5cdFx0XHRvZmZzZXRNYXRjaGVzKHJlc3VsdCwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sYXN0SW5kZXhPZihtYXRjaC5yaWdodCkpO1xuXHRcdFx0bWF0Y2hlcyA9IG1hdGNoZXMuY29uY2F0KHJlc3VsdCk7XG5cdFx0fVxuXHRcdFxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgbWF0Y2hlcy5sZW5ndGg7IGorKylcblx0XHRcdG1hdGNoZXNbal0uYnJ1c2hOYW1lID0gYnJ1c2hDbGFzcy5icnVzaE5hbWU7XG5cdFx0XHRcblx0XHRyZXR1cm4gbWF0Y2hlcztcblx0fVxufTtcblxuLyoqXG4gKiBNYWluIEhpZ2hsaXRoZXIgY2xhc3MuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuc2guSGlnaGxpZ2h0ZXIgPSBmdW5jdGlvbigpXG57XG5cdC8vIG5vdCBwdXR0aW5nIGFueSBjb2RlIGluIGhlcmUgYmVjYXVzZSBvZiB0aGUgcHJvdG90eXBlIGluaGVyaXRhbmNlXG59O1xuXG5zaC5IaWdobGlnaHRlci5wcm90b3R5cGUgPSB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIgcGFzc2VkIHRvIHRoZSBoaWdobGlnaHRlci5cblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcdFx0XHRcdE5hbWUgb2YgdGhlIHBhcmFtZXRlci5cblx0ICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRWYWx1ZVx0XHREZWZhdWx0IHZhbHVlLlxuXHQgKiBAcmV0dXJuIHtPYmplY3R9XHRcdFx0XHRcdFJldHVybnMgZm91bmQgdmFsdWUgb3IgZGVmYXVsdCB2YWx1ZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRnZXRQYXJhbTogZnVuY3Rpb24obmFtZSwgZGVmYXVsdFZhbHVlKVxuXHR7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyYW1zW25hbWVdO1xuXHRcdHJldHVybiB0b0Jvb2xlYW4ocmVzdWx0ID09IG51bGwgPyBkZWZhdWx0VmFsdWUgOiByZXN1bHQpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNob3J0Y3V0IHRvIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoKS5cblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcdFx0TmFtZSBvZiB0aGUgZWxlbWVudCB0byBjcmVhdGUgKERJViwgQSwgZXRjKS5cblx0ICogQHJldHVybiB7SFRNTEVsZW1lbnR9XHRSZXR1cm5zIG5ldyBIVE1MIGVsZW1lbnQuXG5cdCAqL1xuXHRjcmVhdGU6IGZ1bmN0aW9uKG5hbWUpXG5cdHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBBcHBsaWVzIGFsbCByZWd1bGFyIGV4cHJlc3Npb24gdG8gdGhlIGNvZGUgYW5kIHN0b3JlcyBhbGwgZm91bmRcblx0ICogbWF0Y2hlcyBpbiB0aGUgYHRoaXMubWF0Y2hlc2AgYXJyYXkuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHJlZ2V4TGlzdFx0XHRMaXN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFx0U291cmNlIGNvZGUuXG5cdCAqIEByZXR1cm4ge0FycmF5fVx0XHRcdFx0UmV0dXJucyBsaXN0IG9mIG1hdGNoZXMuXG5cdCAqL1xuXHRmaW5kTWF0Y2hlczogZnVuY3Rpb24ocmVnZXhMaXN0LCBjb2RlKVxuXHR7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdFxuXHRcdGlmIChyZWdleExpc3QgIT0gbnVsbClcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVnZXhMaXN0Lmxlbmd0aDsgaSsrKSBcblx0XHRcdFx0Ly8gQlVHOiBsZW5ndGggcmV0dXJucyBsZW4rMSBmb3IgYXJyYXkgaWYgbWV0aG9kcyBhZGRlZCB0byBwcm90b3R5cGUgY2hhaW4gKG9pc2luZ0BnbWFpbC5jb20pXG5cdFx0XHRcdGlmICh0eXBlb2YgKHJlZ2V4TGlzdFtpXSkgPT0gXCJvYmplY3RcIilcblx0XHRcdFx0XHRyZXN1bHQgPSByZXN1bHQuY29uY2F0KGdldE1hdGNoZXMoY29kZSwgcmVnZXhMaXN0W2ldKSk7XG5cdFx0XG5cdFx0Ly8gc29ydCBhbmQgcmVtb3ZlIG5lc3RlZCB0aGUgbWF0Y2hlc1xuXHRcdHJldHVybiB0aGlzLnJlbW92ZU5lc3RlZE1hdGNoZXMocmVzdWx0LnNvcnQobWF0Y2hlc1NvcnRDYWxsYmFjaykpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENoZWNrcyB0byBzZWUgaWYgYW55IG9mIHRoZSBtYXRjaGVzIGFyZSBpbnNpZGUgb2Ygb3RoZXIgbWF0Y2hlcy4gXG5cdCAqIFRoaXMgcHJvY2VzcyB3b3VsZCBnZXQgcmlkIG9mIGhpZ2hsaWd0ZWQgc3RyaW5ncyBpbnNpZGUgY29tbWVudHMsIFxuXHQgKiBrZXl3b3JkcyBpbnNpZGUgc3RyaW5ncyBhbmQgc28gb24uXG5cdCAqL1xuXHRyZW1vdmVOZXN0ZWRNYXRjaGVzOiBmdW5jdGlvbihtYXRjaGVzKVxuXHR7XG5cdFx0Ly8gT3B0aW1pemVkIGJ5IEpvc2UgUHJhZG8gKGh0dHA6Ly9qb3NlcHJhZG8uY29tKVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykgXG5cdFx0eyBcblx0XHRcdGlmIChtYXRjaGVzW2ldID09PSBudWxsKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0dmFyIGl0ZW1JID0gbWF0Y2hlc1tpXSxcblx0XHRcdFx0aXRlbUlFbmRQb3MgPSBpdGVtSS5pbmRleCArIGl0ZW1JLmxlbmd0aFxuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGogPSBpICsgMTsgaiA8IG1hdGNoZXMubGVuZ3RoICYmIG1hdGNoZXNbaV0gIT09IG51bGw7IGorKykgXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBpdGVtSiA9IG1hdGNoZXNbal07XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoaXRlbUogPT09IG51bGwpIFxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRlbHNlIGlmIChpdGVtSi5pbmRleCA+IGl0ZW1JRW5kUG9zKSBcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZWxzZSBpZiAoaXRlbUouaW5kZXggPT0gaXRlbUkuaW5kZXggJiYgaXRlbUoubGVuZ3RoID4gaXRlbUkubGVuZ3RoKVxuXHRcdFx0XHRcdG1hdGNoZXNbaV0gPSBudWxsO1xuXHRcdFx0XHRlbHNlIGlmIChpdGVtSi5pbmRleCA+PSBpdGVtSS5pbmRleCAmJiBpdGVtSi5pbmRleCA8IGl0ZW1JRW5kUG9zKSBcblx0XHRcdFx0XHRtYXRjaGVzW2pdID0gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG1hdGNoZXM7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIGludGVnZXIgbGluZSBudW1iZXJzIHN0YXJ0aW5nIGZyb20gdGhlICdmaXJzdC1saW5lJyBwYXJhbS5cblx0ICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYXJyYXkgb2YgaW50ZWdlcnMuXG5cdCAqL1xuXHRmaWd1cmVPdXRMaW5lTnVtYmVyczogZnVuY3Rpb24oY29kZSlcblx0e1xuXHRcdHZhciBsaW5lcyA9IFtdLFxuXHRcdFx0Zmlyc3RMaW5lID0gcGFyc2VJbnQodGhpcy5nZXRQYXJhbSgnZmlyc3QtbGluZScpKVxuXHRcdFx0O1xuXHRcdFxuXHRcdGVhY2hMaW5lKGNvZGUsIGZ1bmN0aW9uKGxpbmUsIGluZGV4KVxuXHRcdHtcblx0XHRcdGxpbmVzLnB1c2goaW5kZXggKyBmaXJzdExpbmUpO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBsaW5lcztcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIGlmIHNwZWNpZmllZCBsaW5lIG51bWJlciBpcyBpbiB0aGUgaGlnaGxpZ2h0ZWQgbGlzdC5cblx0ICovXG5cdGlzTGluZUhpZ2hsaWdodGVkOiBmdW5jdGlvbihsaW5lTnVtYmVyKVxuXHR7XG5cdFx0dmFyIGxpc3QgPSB0aGlzLmdldFBhcmFtKCdoaWdobGlnaHQnLCBbXSk7XG5cdFx0XG5cdFx0aWYgKHR5cGVvZihsaXN0KSAhPSAnb2JqZWN0JyAmJiBsaXN0LnB1c2ggPT0gbnVsbCkgXG5cdFx0XHRsaXN0ID0gWyBsaXN0IF07XG5cdFx0XG5cdFx0cmV0dXJuIGluZGV4T2YobGlzdCwgbGluZU51bWJlci50b1N0cmluZygpKSAhPSAtMTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIGEgc2luZ2xlIGxpbmUgb2YgY29kZSB3aGlsZSBkZXRlcm1pbmluZyBhbHRlcm5hdGluZyBsaW5lIHN0eWxlLlxuXHQgKiBAcGFyYW0ge0ludGVnZXJ9IGxpbmVOdW1iZXJcdExpbmUgbnVtYmVyLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZSBMaW5lXHRIVE1MIG1hcmt1cC5cblx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0UmV0dXJucyBIVE1MIG1hcmt1cC5cblx0ICovXG5cdGdldExpbmVIdG1sOiBmdW5jdGlvbihsaW5lSW5kZXgsIGxpbmVOdW1iZXIsIGNvZGUpXG5cdHtcblx0XHR2YXIgY2xhc3NlcyA9IFtcblx0XHRcdCdsaW5lJyxcblx0XHRcdCdudW1iZXInICsgbGluZU51bWJlcixcblx0XHRcdCdpbmRleCcgKyBsaW5lSW5kZXgsXG5cdFx0XHQnYWx0JyArIChsaW5lTnVtYmVyICUgMiA9PSAwID8gMSA6IDIpLnRvU3RyaW5nKClcblx0XHRdO1xuXHRcdFxuXHRcdGlmICh0aGlzLmlzTGluZUhpZ2hsaWdodGVkKGxpbmVOdW1iZXIpKVxuXHRcdCBcdGNsYXNzZXMucHVzaCgnaGlnaGxpZ2h0ZWQnKTtcblx0XHRcblx0XHRpZiAobGluZU51bWJlciA9PSAwKVxuXHRcdFx0Y2xhc3Nlcy5wdXNoKCdicmVhaycpO1xuXHRcdFx0XG5cdFx0cmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzZXMuam9pbignICcpICsgJ1wiPicgKyBjb2RlICsgJzwvZGl2Pic7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciBsaW5lIG51bWJlciBjb2x1bW4uXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFx0Q29tcGxldGUgY29kZSBIVE1MIG1hcmt1cC5cblx0ICogQHBhcmFtIHtBcnJheX0gbGluZU51bWJlcnNcdENhbGN1bGF0ZWQgbGluZSBudW1iZXJzLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0XHRSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHQgKi9cblx0Z2V0TGluZU51bWJlcnNIdG1sOiBmdW5jdGlvbihjb2RlLCBsaW5lTnVtYmVycylcblx0e1xuXHRcdHZhciBodG1sID0gJycsXG5cdFx0XHRjb3VudCA9IHNwbGl0TGluZXMoY29kZSkubGVuZ3RoLFxuXHRcdFx0Zmlyc3RMaW5lID0gcGFyc2VJbnQodGhpcy5nZXRQYXJhbSgnZmlyc3QtbGluZScpKSxcblx0XHRcdHBhZCA9IHRoaXMuZ2V0UGFyYW0oJ3BhZC1saW5lLW51bWJlcnMnKVxuXHRcdFx0O1xuXHRcdFxuXHRcdGlmIChwYWQgPT0gdHJ1ZSlcblx0XHRcdHBhZCA9IChmaXJzdExpbmUgKyBjb3VudCAtIDEpLnRvU3RyaW5nKCkubGVuZ3RoO1xuXHRcdGVsc2UgaWYgKGlzTmFOKHBhZCkgPT0gdHJ1ZSlcblx0XHRcdHBhZCA9IDA7XG5cdFx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGxpbmVOdW1iZXIgPSBsaW5lTnVtYmVycyA/IGxpbmVOdW1iZXJzW2ldIDogZmlyc3RMaW5lICsgaSxcblx0XHRcdFx0Y29kZSA9IGxpbmVOdW1iZXIgPT0gMCA/IHNoLmNvbmZpZy5zcGFjZSA6IHBhZE51bWJlcihsaW5lTnVtYmVyLCBwYWQpXG5cdFx0XHRcdDtcblx0XHRcdFx0XG5cdFx0XHRodG1sICs9IHRoaXMuZ2V0TGluZUh0bWwoaSwgbGluZU51bWJlciwgY29kZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNwbGl0cyBibG9jayBvZiB0ZXh0IGludG8gaW5kaXZpZHVhbCBESVYgbGluZXMuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFx0Q29kZSB0byBoaWdobGlnaHQuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGxpbmVOdW1iZXJzXHRDYWxjdWxhdGVkIGxpbmUgbnVtYmVycy5cblx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0UmV0dXJucyBoaWdobGlnaHRlZCBjb2RlIGluIEhUTUwgZm9ybS5cblx0ICovXG5cdGdldENvZGVMaW5lc0h0bWw6IGZ1bmN0aW9uKGh0bWwsIGxpbmVOdW1iZXJzKVxuXHR7XG5cdFx0aHRtbCA9IHRyaW0oaHRtbCk7XG5cdFx0XG5cdFx0dmFyIGxpbmVzID0gc3BsaXRMaW5lcyhodG1sKSxcblx0XHRcdHBhZExlbmd0aCA9IHRoaXMuZ2V0UGFyYW0oJ3BhZC1saW5lLW51bWJlcnMnKSxcblx0XHRcdGZpcnN0TGluZSA9IHBhcnNlSW50KHRoaXMuZ2V0UGFyYW0oJ2ZpcnN0LWxpbmUnKSksXG5cdFx0XHRodG1sID0gJycsXG5cdFx0XHRicnVzaE5hbWUgPSB0aGlzLmdldFBhcmFtKCdicnVzaCcpXG5cdFx0XHQ7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdHZhciBsaW5lID0gbGluZXNbaV0sXG5cdFx0XHRcdGluZGVudCA9IC9eKCZuYnNwO3xcXHMpKy8uZXhlYyhsaW5lKSxcblx0XHRcdFx0c3BhY2VzID0gbnVsbCxcblx0XHRcdFx0bGluZU51bWJlciA9IGxpbmVOdW1iZXJzID8gbGluZU51bWJlcnNbaV0gOiBmaXJzdExpbmUgKyBpO1xuXHRcdFx0XHQ7XG5cblx0XHRcdGlmIChpbmRlbnQgIT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0c3BhY2VzID0gaW5kZW50WzBdLnRvU3RyaW5nKCk7XG5cdFx0XHRcdGxpbmUgPSBsaW5lLnN1YnN0cihzcGFjZXMubGVuZ3RoKTtcblx0XHRcdFx0c3BhY2VzID0gc3BhY2VzLnJlcGxhY2UoJyAnLCBzaC5jb25maWcuc3BhY2UpO1xuXHRcdFx0fVxuXG5cdFx0XHRsaW5lID0gdHJpbShsaW5lKTtcblx0XHRcdFxuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09IDApXG5cdFx0XHRcdGxpbmUgPSBzaC5jb25maWcuc3BhY2U7XG5cdFx0XHRcblx0XHRcdGh0bWwgKz0gdGhpcy5nZXRMaW5lSHRtbChcblx0XHRcdFx0aSxcblx0XHRcdFx0bGluZU51bWJlciwgXG5cdFx0XHRcdChzcGFjZXMgIT0gbnVsbCA/ICc8Y29kZSBjbGFzcz1cIicgKyBicnVzaE5hbWUgKyAnIHNwYWNlc1wiPicgKyBzcGFjZXMgKyAnPC9jb2RlPicgOiAnJykgKyBsaW5lXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIEhUTUwgZm9yIHRoZSB0YWJsZSB0aXRsZSBvciBlbXB0eSBzdHJpbmcgaWYgdGl0bGUgaXMgbnVsbC5cblx0ICovXG5cdGdldFRpdGxlSHRtbDogZnVuY3Rpb24odGl0bGUpXG5cdHtcblx0XHRyZXR1cm4gdGl0bGUgPyAnPGNhcHRpb24+JyArIHRpdGxlICsgJzwvY2FwdGlvbj4nIDogJyc7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogRmluZHMgYWxsIG1hdGNoZXMgaW4gdGhlIHNvdXJjZSBjb2RlLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRTb3VyY2UgY29kZSB0byBwcm9jZXNzIG1hdGNoZXMgaW4uXG5cdCAqIEBwYXJhbSB7QXJyYXl9IG1hdGNoZXNcdERpc2NvdmVyZWQgcmVnZXggbWF0Y2hlcy5cblx0ICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIGZvcm1hdHRlZCBIVE1MIHdpdGggcHJvY2Vzc2VkIG1hdGhlcy5cblx0ICovXG5cdGdldE1hdGNoZXNIdG1sOiBmdW5jdGlvbihjb2RlLCBtYXRjaGVzKVxuXHR7XG5cdFx0dmFyIHBvcyA9IDAsIFxuXHRcdFx0cmVzdWx0ID0gJycsXG5cdFx0XHRicnVzaE5hbWUgPSB0aGlzLmdldFBhcmFtKCdicnVzaCcsICcnKVxuXHRcdFx0O1xuXHRcdFxuXHRcdGZ1bmN0aW9uIGdldEJydXNoTmFtZUNzcyhtYXRjaClcblx0XHR7XG5cdFx0XHR2YXIgcmVzdWx0ID0gbWF0Y2ggPyAobWF0Y2guYnJ1c2hOYW1lIHx8IGJydXNoTmFtZSkgOiBicnVzaE5hbWU7XG5cdFx0XHRyZXR1cm4gcmVzdWx0ID8gcmVzdWx0ICsgJyAnIDogJyc7XG5cdFx0fTtcblx0XHRcblx0XHQvLyBGaW5hbGx5LCBnbyB0aHJvdWdoIHRoZSBmaW5hbCBsaXN0IG9mIG1hdGNoZXMgYW5kIHB1bGwgdGhlIGFsbFxuXHRcdC8vIHRvZ2V0aGVyIGFkZGluZyBldmVyeXRoaW5nIGluIGJldHdlZW4gdGhhdCBpc24ndCBhIG1hdGNoLlxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykgXG5cdFx0e1xuXHRcdFx0dmFyIG1hdGNoID0gbWF0Y2hlc1tpXSxcblx0XHRcdFx0bWF0Y2hCcnVzaE5hbWVcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHRpZiAobWF0Y2ggPT09IG51bGwgfHwgbWF0Y2gubGVuZ3RoID09PSAwKSBcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdG1hdGNoQnJ1c2hOYW1lID0gZ2V0QnJ1c2hOYW1lQ3NzKG1hdGNoKTtcblx0XHRcdFxuXHRcdFx0cmVzdWx0ICs9IHdyYXBMaW5lc1dpdGhDb2RlKGNvZGUuc3Vic3RyKHBvcywgbWF0Y2guaW5kZXggLSBwb3MpLCBtYXRjaEJydXNoTmFtZSArICdwbGFpbicpXG5cdFx0XHRcdFx0KyB3cmFwTGluZXNXaXRoQ29kZShtYXRjaC52YWx1ZSwgbWF0Y2hCcnVzaE5hbWUgKyBtYXRjaC5jc3MpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRwb3MgPSBtYXRjaC5pbmRleCArIG1hdGNoLmxlbmd0aCArIChtYXRjaC5vZmZzZXQgfHwgMCk7XG5cdFx0fVxuXG5cdFx0Ly8gZG9uJ3QgZm9yZ2V0IHRvIGFkZCB3aGF0ZXZlcidzIHJlbWFpbmluZyBpbiB0aGUgc3RyaW5nXG5cdFx0cmVzdWx0ICs9IHdyYXBMaW5lc1dpdGhDb2RlKGNvZGUuc3Vic3RyKHBvcyksIGdldEJydXNoTmFtZUNzcygpICsgJ3BsYWluJyk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgdGhlIHdob2xlIHN5bnRheCBoaWdobGlnaHRlci5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgU291cmNlIGNvZGUuXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBIVE1MIG1hcmt1cC5cblx0ICovXG5cdGdldEh0bWw6IGZ1bmN0aW9uKGNvZGUpXG5cdHtcblx0XHR2YXIgaHRtbCA9ICcnLFxuXHRcdFx0Y2xhc3NlcyA9IFsgJ3N5bnRheGhpZ2hsaWdodGVyJyBdLFxuXHRcdFx0dGFiU2l6ZSxcblx0XHRcdG1hdGNoZXMsXG5cdFx0XHRsaW5lTnVtYmVyc1xuXHRcdFx0O1xuXHRcdFxuXHRcdC8vIHByb2Nlc3MgbGlnaHQgbW9kZVxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdsaWdodCcpID09IHRydWUpXG5cdFx0XHR0aGlzLnBhcmFtcy50b29sYmFyID0gdGhpcy5wYXJhbXMuZ3V0dGVyID0gZmFsc2U7XG5cblx0XHRjbGFzc05hbWUgPSAnc3ludGF4aGlnaGxpZ2h0ZXInO1xuXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ2NvbGxhcHNlJykgPT0gdHJ1ZSlcblx0XHRcdGNsYXNzZXMucHVzaCgnY29sbGFwc2VkJyk7XG5cdFx0XG5cdFx0aWYgKChndXR0ZXIgPSB0aGlzLmdldFBhcmFtKCdndXR0ZXInKSkgPT0gZmFsc2UpXG5cdFx0XHRjbGFzc2VzLnB1c2goJ25vZ3V0dGVyJyk7XG5cblx0XHQvLyBhZGQgY3VzdG9tIHVzZXIgc3R5bGUgbmFtZVxuXHRcdGNsYXNzZXMucHVzaCh0aGlzLmdldFBhcmFtKCdjbGFzcy1uYW1lJykpO1xuXG5cdFx0Ly8gYWRkIGJydXNoIGFsaWFzIHRvIHRoZSBjbGFzcyBuYW1lIGZvciBjdXN0b20gQ1NTXG5cdFx0Y2xhc3Nlcy5wdXNoKHRoaXMuZ2V0UGFyYW0oJ2JydXNoJykpO1xuXG5cdFx0Y29kZSA9IHRyaW1GaXJzdEFuZExhc3RMaW5lcyhjb2RlKVxuXHRcdFx0LnJlcGxhY2UoL1xcci9nLCAnICcpIC8vIElFIGxldHMgdGhlc2UgYnVnZ2VycyB0aHJvdWdoXG5cdFx0XHQ7XG5cblx0XHR0YWJTaXplID0gdGhpcy5nZXRQYXJhbSgndGFiLXNpemUnKTtcblxuXHRcdC8vIHJlcGxhY2UgdGFicyB3aXRoIHNwYWNlc1xuXHRcdGNvZGUgPSB0aGlzLmdldFBhcmFtKCdzbWFydC10YWJzJykgPT0gdHJ1ZVxuXHRcdFx0PyBwcm9jZXNzU21hcnRUYWJzKGNvZGUsIHRhYlNpemUpXG5cdFx0XHQ6IHByb2Nlc3NUYWJzKGNvZGUsIHRhYlNpemUpXG5cdFx0XHQ7XG5cblx0XHQvLyB1bmluZGVudCBjb2RlIGJ5IHRoZSBjb21tb24gaW5kZW50YXRpb25cblx0XHRpZiAodGhpcy5nZXRQYXJhbSgndW5pbmRlbnQnKSlcblx0XHRcdGNvZGUgPSB1bmluZGVudChjb2RlKTtcblxuXHRcdGlmIChndXR0ZXIpXG5cdFx0XHRsaW5lTnVtYmVycyA9IHRoaXMuZmlndXJlT3V0TGluZU51bWJlcnMoY29kZSk7XG5cdFx0XG5cdFx0Ly8gZmluZCBtYXRjaGVzIGluIHRoZSBjb2RlIHVzaW5nIGJydXNoZXMgcmVnZXggbGlzdFxuXHRcdG1hdGNoZXMgPSB0aGlzLmZpbmRNYXRjaGVzKHRoaXMucmVnZXhMaXN0LCBjb2RlKTtcblx0XHQvLyBwcm9jZXNzZXMgZm91bmQgbWF0Y2hlcyBpbnRvIHRoZSBodG1sXG5cdFx0aHRtbCA9IHRoaXMuZ2V0TWF0Y2hlc0h0bWwoY29kZSwgbWF0Y2hlcyk7XG5cdFx0Ly8gZmluYWxseSwgc3BsaXQgYWxsIGxpbmVzIHNvIHRoYXQgdGhleSB3cmFwIHdlbGxcblx0XHRodG1sID0gdGhpcy5nZXRDb2RlTGluZXNIdG1sKGh0bWwsIGxpbmVOdW1iZXJzKTtcblxuXHRcdC8vIGZpbmFsbHksIHByb2Nlc3MgdGhlIGxpbmtzXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ2F1dG8tbGlua3MnKSlcblx0XHRcdGh0bWwgPSBwcm9jZXNzVXJscyhodG1sKTtcblx0XHRcblx0XHRpZiAodHlwZW9mKG5hdmlnYXRvcikgIT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9NU0lFLykpXG5cdFx0XHRjbGFzc2VzLnB1c2goJ2llJyk7XG5cdFx0XG5cdFx0aHRtbCA9IFxuXHRcdFx0JzxkaXYgaWQ9XCInICsgZ2V0SGlnaGxpZ2h0ZXJJZCh0aGlzLmlkKSArICdcIiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIj4nXG5cdFx0XHRcdCsgKHRoaXMuZ2V0UGFyYW0oJ3Rvb2xiYXInKSA/IHNoLnRvb2xiYXIuZ2V0SHRtbCh0aGlzKSA6ICcnKVxuXHRcdFx0XHQrICc8dGFibGUgYm9yZGVyPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiPidcblx0XHRcdFx0XHQrIHRoaXMuZ2V0VGl0bGVIdG1sKHRoaXMuZ2V0UGFyYW0oJ3RpdGxlJykpXG5cdFx0XHRcdFx0KyAnPHRib2R5Pidcblx0XHRcdFx0XHRcdCsgJzx0cj4nXG5cdFx0XHRcdFx0XHRcdCsgKGd1dHRlciA/ICc8dGQgY2xhc3M9XCJndXR0ZXJcIj4nICsgdGhpcy5nZXRMaW5lTnVtYmVyc0h0bWwoY29kZSkgKyAnPC90ZD4nIDogJycpXG5cdFx0XHRcdFx0XHRcdCsgJzx0ZCBjbGFzcz1cImNvZGVcIj4nXG5cdFx0XHRcdFx0XHRcdFx0KyAnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPidcblx0XHRcdFx0XHRcdFx0XHRcdCsgaHRtbFxuXHRcdFx0XHRcdFx0XHRcdCsgJzwvZGl2Pidcblx0XHRcdFx0XHRcdFx0KyAnPC90ZD4nXG5cdFx0XHRcdFx0XHQrICc8L3RyPidcblx0XHRcdFx0XHQrICc8L3Rib2R5Pidcblx0XHRcdFx0KyAnPC90YWJsZT4nXG5cdFx0XHQrICc8L2Rpdj4nXG5cdFx0XHQ7XG5cdFx0XHRcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBIaWdobGlnaHRzIHRoZSBjb2RlIGFuZCByZXR1cm5zIGNvbXBsZXRlIEhUTUwuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlICAgICBDb2RlIHRvIGhpZ2hsaWdodC5cblx0ICogQHJldHVybiB7RWxlbWVudH0gICAgICAgIFJldHVybnMgY29udGFpbmVyIERJViBlbGVtZW50IHdpdGggYWxsIG1hcmt1cC5cblx0ICovXG5cdGdldERpdjogZnVuY3Rpb24oY29kZSlcblx0e1xuXHRcdGlmIChjb2RlID09PSBudWxsKSBcblx0XHRcdGNvZGUgPSAnJztcblx0XHRcblx0XHR0aGlzLmNvZGUgPSBjb2RlO1xuXG5cdFx0dmFyIGRpdiA9IHRoaXMuY3JlYXRlKCdkaXYnKTtcblxuXHRcdC8vIGNyZWF0ZSBtYWluIEhUTUxcblx0XHRkaXYuaW5uZXJIVE1MID0gdGhpcy5nZXRIdG1sKGNvZGUpO1xuXHRcdFxuXHRcdC8vIHNldCB1cCBjbGljayBoYW5kbGVyc1xuXHRcdGlmICh0aGlzLmdldFBhcmFtKCd0b29sYmFyJykpXG5cdFx0XHRhdHRhY2hFdmVudChmaW5kRWxlbWVudChkaXYsICcudG9vbGJhcicpLCAnY2xpY2snLCBzaC50b29sYmFyLmhhbmRsZXIpO1xuXHRcdFxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdxdWljay1jb2RlJykpXG5cdFx0XHRhdHRhY2hFdmVudChmaW5kRWxlbWVudChkaXYsICcuY29kZScpLCAnZGJsY2xpY2snLCBxdWlja0NvZGVIYW5kbGVyKTtcblx0XHRcblx0XHRyZXR1cm4gZGl2O1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBoaWdobGlnaHRlci9icnVzaC5cblx0ICpcblx0ICogQ29uc3RydWN0b3IgaXNuJ3QgdXNlZCBmb3IgaW5pdGlhbGl6YXRpb24gc28gdGhhdCBub3RoaW5nIGV4ZWN1dGVzIGR1cmluZyBuZWNlc3Nhcnlcblx0ICogYG5ldyBTeW50YXhIaWdobGlnaHRlci5IaWdobGlnaHRlcigpYCBjYWxsIHdoZW4gc2V0dGluZyB1cCBicnVzaCBpbmhlcml0ZW5jZS5cblx0ICpcblx0ICogQHBhcmFtIHtIYXNofSBwYXJhbXMgSGlnaGxpZ2h0ZXIgcGFyYW1ldGVycy5cblx0ICovXG5cdGluaXQ6IGZ1bmN0aW9uKHBhcmFtcylcblx0e1xuXHRcdHRoaXMuaWQgPSBndWlkKCk7XG5cdFx0XG5cdFx0Ly8gcmVnaXN0ZXIgdGhpcyBpbnN0YW5jZSBpbiB0aGUgaGlnaGxpZ2h0ZXJzIGxpc3Rcblx0XHRzdG9yZUhpZ2hsaWdodGVyKHRoaXMpO1xuXHRcdFxuXHRcdC8vIGxvY2FsIHBhcmFtcyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBkZWZhdWx0c1xuXHRcdHRoaXMucGFyYW1zID0gbWVyZ2Uoc2guZGVmYXVsdHMsIHBhcmFtcyB8fCB7fSlcblx0XHRcblx0XHQvLyBwcm9jZXNzIGxpZ2h0IG1vZGVcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgnbGlnaHQnKSA9PSB0cnVlKVxuXHRcdFx0dGhpcy5wYXJhbXMudG9vbGJhciA9IHRoaXMucGFyYW1zLmd1dHRlciA9IGZhbHNlO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENvbnZlcnRzIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGtleXdvcmRzIGludG8gYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgIFNwYWNlIHNlcGFyYXRlZCBrZXl3b3Jkcy5cblx0ICogQHJldHVybiB7U3RyaW5nfSAgICAgICBSZXR1cm5zIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmcuXG5cdCAqL1xuXHRnZXRLZXl3b3JkczogZnVuY3Rpb24oc3RyKVxuXHR7XG5cdFx0c3RyID0gc3RyXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnfCcpXG5cdFx0XHQ7XG5cdFx0XG5cdFx0cmV0dXJuICdcXFxcYig/OicgKyBzdHIgKyAnKVxcXFxiJztcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBNYWtlcyBhIGJydXNoIGNvbXBhdGlibGUgd2l0aCB0aGUgYGh0bWwtc2NyaXB0YCBmdW5jdGlvbmFsaXR5LlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcmVnZXhHcm91cCBPYmplY3QgY29udGFpbmluZyBgbGVmdGAgYW5kIGByaWdodGAgcmVndWxhciBleHByZXNzaW9ucy5cblx0ICovXG5cdGZvckh0bWxTY3JpcHQ6IGZ1bmN0aW9uKHJlZ2V4R3JvdXApXG5cdHtcblx0XHR2YXIgcmVnZXggPSB7ICdlbmQnIDogcmVnZXhHcm91cC5yaWdodC5zb3VyY2UgfTtcblxuXHRcdGlmKHJlZ2V4R3JvdXAuZW9mKVxuXHRcdFx0cmVnZXguZW5kID0gXCIoPzooPzpcIiArIHJlZ2V4LmVuZCArIFwiKXwkKVwiO1xuXHRcdFxuXHRcdHRoaXMuaHRtbFNjcmlwdCA9IHtcblx0XHRcdGxlZnQgOiB7IHJlZ2V4OiByZWdleEdyb3VwLmxlZnQsIGNzczogJ3NjcmlwdCcgfSxcblx0XHRcdHJpZ2h0IDogeyByZWdleDogcmVnZXhHcm91cC5yaWdodCwgY3NzOiAnc2NyaXB0JyB9LFxuXHRcdFx0Y29kZSA6IG5ldyBYUmVnRXhwKFxuXHRcdFx0XHRcIig/PGxlZnQ+XCIgKyByZWdleEdyb3VwLmxlZnQuc291cmNlICsgXCIpXCIgK1xuXHRcdFx0XHRcIig/PGNvZGU+Lio/KVwiICtcblx0XHRcdFx0XCIoPzxyaWdodD5cIiArIHJlZ2V4LmVuZCArIFwiKVwiLFxuXHRcdFx0XHRcInNnaVwiXG5cdFx0XHRcdClcblx0XHR9O1xuXHR9XG59OyAvLyBlbmQgb2YgSGlnaGxpZ2h0ZXJcblxucmV0dXJuIHNoO1xufSgpOyAvLyBlbmQgb2YgYW5vbnltb3VzIGZ1bmN0aW9uXG5cbi8vIENvbW1vbkpTXG50eXBlb2YoZXhwb3J0cykgIT0gJ3VuZGVmaW5lZCcgPyBleHBvcnRzLlN5bnRheEhpZ2hsaWdodGVyID0gU3ludGF4SGlnaGxpZ2h0ZXIgOiBudWxsO1xuIiwidmFyIGZzICAgICAgICAgPSAgcmVxdWlyZSgnZnMnKVxuICAsIHBhdGggICAgICAgPSAgcmVxdWlyZSgncGF0aCcpXG4gICwgdXRpbCAgICAgICA9ICByZXF1aXJlKCd1dGlsJylcbiAgLCBpbmxpbmUgICAgID0gIHJlcXVpcmUoJy4vaW5saW5lLXNjcmlwdHMnKVxuICAsIHNjcmlwdHNEaXIgPSAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vbGliL3NjcmlwdHMnKVxuICAsIHN0eWxlc0RpciAgPSAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vbGliL3N0eWxlcycpXG4gICwgc3R5bGVzXG4gICwgbGFuZ01hcCAgICA9ICB7IH1cbiAgLCBzaW1pbGFyTWFwID0gIHsgfVxuICAsIHNpbWlsYXJMYW5ncyA9ICB7XG4gICAgICAgICdqcycgICAgIDogIFsgJ2pzb24nIF1cbiAgICAgICwgJ3B5dGhvbicgOiAgWydjb2ZmZWUnLCAnZ3Jvb3Z5JywgJ2hzJywgJ2hhc2tlbGwnIF1cbiAgICB9XG4gIDtcblxuXG4vLyBTZWxmIGludm9raW5nIGZ1bmN0aW9ucyBibG9jayB1bnRpbCB0aGV5IGFyZSBmaW5pc2hlZCBpbiBvcmRlciB0byBlbnN1cmUgdGhhdCBcbi8vIHRoaXMgbW9kdWxlIGlzIHByb3Blcmx5IGluaXRpYWxpemVkIGJlZm9yZSBpdCBpcyByZXR1cm5lZC5cbi8vIFNpbmNlIHRoaXMgb25seSBoYXBwZW5zIG9uY2UgKHdoZW4gbW9kdWxlIGlzIHJlcXVpcmVkKSwgaXQgc2hvdWxkbid0IGJlIGEgcHJvYmxlbS5cbihmdW5jdGlvbiBtYXBCcnVzaGVzKCkge1xuICBmcy5yZWFkZGlyU3luYyhzY3JpcHRzRGlyKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgaWYgKCFmaWxlLm1hdGNoKC9zaEJydXNoXFx3K1xcLmpzLykpIHJldHVybjtcbiAgICBcbiAgICB2YXIgbGFuZ3VhZ2UgPSByZXF1aXJlKHBhdGguam9pbihzY3JpcHRzRGlyLCBmaWxlKSk7XG4gICAgbGFuZ3VhZ2UuQnJ1c2guYWxpYXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChhbGlhcykge1xuICAgICAgbGFuZ01hcFthbGlhcy50b0xvd2VyQ2FzZSgpXSA9IGxhbmd1YWdlO1xuICAgIH0pO1xuICB9KTsgIFxuXG4gIC8vIEFkZCBzb21lIGtub3duIGFsaWFzZXNcbiAgbGFuZ01hcFsnY3MnXSA9IGxhbmdNYXBbJ2MjJ107XG5cbiAgLy8gQWRkIHNpbWlsYXIgYnJ1c2hlcyB0byBzaW1pbGFyIG1hcFxuICBPYmplY3Qua2V5cyhzaW1pbGFyTGFuZ3MpLmZvckVhY2goZnVuY3Rpb24gKGxhbmcpIHtcbiAgICBzaW1pbGFyTGFuZ3NbbGFuZ10uZm9yRWFjaChmdW5jdGlvbiAoc2ltaWxhcikge1xuICAgICAgc2ltaWxhck1hcFtzaW1pbGFyXSA9IGxhbmdNYXBbbGFuZ107XG4gICAgfSk7XG4gIH0pO1xufSkgKCk7XG5cbihmdW5jdGlvbiBjb2xsZWN0U3R5bGVzICgpIHtcbiAgc3R5bGVzID0gZnMucmVhZGRpclN5bmMoc3R5bGVzRGlyKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gKGZpbGVOYW1lKSB7XG4gICAgICByZXR1cm4gZmlsZU5hbWUubWF0Y2goL3NoQ29yZS4rXFwuY3NzLyk7XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uIChmaWxlTmFtZSkge1xuICAgICAgdmFyIG5vcm1hbGl6ZWRGaWxlTmFtZSA9ICBmaWxlTmFtZS5yZXBsYWNlKC9zaENvcmUvLCAnJylcbiAgICAgICAgLCBleHRMZW5ndGggICAgICAgICAgPSAgcGF0aC5leHRuYW1lKG5vcm1hbGl6ZWRGaWxlTmFtZSkubGVuZ3RoXG4gICAgICAgICwgbmFtZUxlbmd0aCAgICAgICAgID0gIG5vcm1hbGl6ZWRGaWxlTmFtZS5sZW5ndGggLSBleHRMZW5ndGhcbiAgICAgICAgLCBzdHlsZU5hbWUgICAgICAgICAgPSAgbm9ybWFsaXplZEZpbGVOYW1lLnN1YnN0cigwLCBuYW1lTGVuZ3RoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICwgZnVsbEZpbGVQYXRoICAgICAgID0gIHBhdGguam9pbihzdHlsZXNEaXIsIGZpbGVOYW1lKVxuICAgICAgICA7XG5cbiAgICAgIHJldHVybiB7IG5hbWU6IHN0eWxlTmFtZSwgc291cmNlUGF0aDogZnVsbEZpbGVQYXRoIH07XG4gICAgICBcbiAgICB9KTtcbn0pICgpO1xuXG5mdW5jdGlvbiBnZXRMYW5ndWFnZShhbGlhcywgc3RyaWN0KSB7XG4gIC8vIGFjY2VwdCAqLmV4dCwgLmV4dCBhbmQgZXh0XG4gIHZhciBub3JtYWxpemVkQWxpYXMgPSBhbGlhcy5yZXBsYWNlKC9eXFwqLywnJykucmVwbGFjZSgvXlxcLi8sJycpO1xuXG4gIHZhciBtYXRjaCA9IGxhbmdNYXBbbm9ybWFsaXplZEFsaWFzXSB8fCAoIXN0cmljdCA/IHNpbWlsYXJNYXBbbm9ybWFsaXplZEFsaWFzXSA6IHZvaWQgMCk7XG4gIFxuICAvLyBOZWVkIHRvIHJlbWVtYmVyIGlmIHVzZXIgaXMgaGlnaGxpZ2h0aW5nIGh0bWwgb3IgeGh0bWwgZm9yIGluc3RhbmNlIGZvciB1c2UgaW4gaGlnaGxpZ2h0XG4gIGlmIChtYXRjaCkgbWF0Y2guc3BlY2lmaWVkQWxpYXMgPSBub3JtYWxpemVkQWxpYXM7XG5cbiAgcmV0dXJuIG1hdGNoO1xufVxuXG4vLyBvcHRpb25zOiBodHRwOi8vYWxleGdvcmJhdGNoZXYuY29tL1N5bnRheEhpZ2hsaWdodGVyL21hbnVhbC9jb25maWd1cmF0aW9uL1xuZnVuY3Rpb24gaGlnaGxpZ2h0KGNvZGUsIGxhbmd1YWdlLCBvcHRpb25zKSB7XG4gIHZhciBtZXJnZWRPcHRzID0geyB9XG4gICAgLCBkZWZhdWx0cyA9IHtcbiAgICAgICAgICB0b29sYmFyOiBmYWxzZVxuICAgICAgICAsICdmaXJzdC1saW5lJzogMVxuICAgICAgfVxuICAgICwgaGlnaGxpZ2h0ZWRIdG1sXG4gICAgO1xuXG4gIGlmICghbGFuZ3VhZ2UpIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gcGFzcyBhIGxhbmd1YWdlIG9idGFpbmVkIHZpYSBcImdldExhbmd1YWdlXCInKTtcbiAgaWYgKCFsYW5ndWFnZS5CcnVzaCkgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCB0byBwYXNzIGEgbGFuZ3VhZ2Ugd2l0aCBhIEJydXNoLCBvYnRhaW5lZCB2aWEgXCJnZXRMYW5ndWFnZVwiJyk7XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICAvLyBHYXRoZXIgYWxsIHVzZXIgc3BlY2lmaWVkIG9wdGlvbnMgZmlyc3RcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIG1lcmdlZE9wdHNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICB9KTtcbiAgICAvLyBBZGQgZGVmYXVsdCBvcHRpb24gb25seSBpZiB1c2VyIGRpZG4ndCBzcGVjaWZ5IGl0cyB2YWx1ZVxuICAgIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIG1lcmdlZE9wdHNba2V5XSA9IG9wdGlvbnNba2V5XSB8fCBkZWZhdWx0c1trZXldO1xuICAgIH0pO1xuXG4gIH0gZWxzZSB7XG4gICAgbWVyZ2VkT3B0cyA9IGRlZmF1bHRzO1xuICB9XG5cbiAgdmFyIGJydXNoID0gbmV3IGxhbmd1YWdlLkJydXNoKCk7XG4gIGJydXNoLmluaXQobWVyZ2VkT3B0cyk7XG5cbiAgaGlnaGxpZ2h0ZWRIdG1sID0gYnJ1c2guZ2V0SHRtbChjb2RlKTtcblxuICBpZiAobGFuZ3VhZ2UgPT09IGxhbmdNYXBbJ2h0bWwnXSkge1xuICAgIHZhciBsaW5lcyA9IGNvZGUuc3BsaXQoJ1xcbicpXG4gICAgICAsIHNjcmlwdHMgPSBpbmxpbmUuZmluZFNjcmlwdHMobGluZXMsIGxhbmd1YWdlLnNwZWNpZmllZEFsaWFzKTtcblxuICAgIC8vIEhpZ2hsaWdodCBjb2RlIGluIGJldHdlZW4gc2NyaXB0cyB0YWdzIGFuZCBpbnRlcmplY3QgaXQgaW50byBoaWdobGlnaHRlZCBodG1sXG4gICAgc2NyaXB0cy5mb3JFYWNoKGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgIHZhciBzY3JpcHRMYW5nID0gbGFuZ01hcFtzY3JpcHQudGFnLmFsaWFzXVxuICAgICAgICAsIGJydXNoID0gbmV3IHNjcmlwdExhbmcuQnJ1c2goKVxuICAgICAgICAsIG9wdHMgPSBtZXJnZWRPcHRzXG4gICAgICAgIDtcblxuICAgICAgLy8gYWRhcHQgbGluZSBudW1iZXJzIG9mIGhpZ2hsaWdodGVkIGNvZGUgc2luY2UgaXQgaXMgaW4gdGhlIG1pZGRsZSBvZiBodG1sIGRvY3VtZW50XG4gICAgICBvcHRzWydmaXJzdC1saW5lJ10gPSBtZXJnZWRPcHRzWydmaXJzdC1saW5lJ10gKyBzY3JpcHQuZnJvbTtcbiAgICAgIFxuICAgICAgYnJ1c2guaW5pdChvcHRzKTtcblxuICAgICAgdmFyIGhpZ2hsaWdodGVkU2NyaXB0ID0gYnJ1c2guZ2V0SHRtbChzY3JpcHQuY29kZSlcbiAgICAgICAgLCBoaWdsaWdodGVkTGluZXMgPSBpbmxpbmUuZXh0cmFjdExpbmVzKGhpZ2hsaWdodGVkU2NyaXB0KTtcblxuICAgICAgaGlnaGxpZ2h0ZWRIdG1sID0gaW5saW5lLnJlcGxhY2VQbGFpbkxpbmVzKHNjcmlwdC5mcm9tLCBzY3JpcHQudG8sIGhpZ2hsaWdodGVkSHRtbCwgaGlnbGlnaHRlZExpbmVzKTtcbiAgICB9KTtcbiB9IFxuXG4gIHJldHVybiBoaWdobGlnaHRlZEh0bWw7XG59XG5cblxuZnVuY3Rpb24gZ2V0U3R5bGVzICgpIHtcbiAgcmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gY29weVN0eWxlIChzdHlsZSwgdGd0LCBjYikge1xuICB2YXIgc291cmNlUGF0aFxuICAgICwgc3R5bGVOYW1lO1xuXG4gIC8vIEFsbG93IHN0eWxlIHRvIGp1c3QgYmUgYSBzdHJpbmcgKGl0cyBuYW1lKSBvciBhIHN0eWxlIHJldHVybmVkIGZyb20gZ2V0U3R5bGVzXG4gIGlmICh0eXBlb2Ygc3R5bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3R5bGVOYW1lID0gc3R5bGU7XG5cbiAgICB2YXIgbWF0Y2hpbmdTdHlsZSA9IHN0eWxlcy5maWx0ZXIoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIHMubmFtZSA9PT0gc3R5bGU7IH0pWzBdO1xuXG4gICAgaWYgKCFtYXRjaGluZ1N0eWxlKSBcbiAgICAgIGNiKG5ldyBFcnJvcignU3R5bGUgbmFtZWQgXCInICsgc3R5bGUgKyAnXCIgbm90IGZvdW5kLicpKTtcbiAgICBlbHNlXG4gICAgICBzb3VyY2VQYXRoID0gbWF0Y2hpbmdTdHlsZS5zb3VyY2VQYXRoO1xuXG4gIH0gZWxzZSBpZiAoIXN0eWxlLnNvdXJjZVBhdGgpIHtcbiAgICBjYihuZXcgRXJyb3IoJ3N0eWxlIG5lZWRzIHRvIGJlIHN0cmluZyBvciBoYXZlIFwic291cmNlUGF0aFwiIHByb3BlcnR5JykpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlTmFtZSA9IHN0eWxlLm5hbWU7XG4gICAgc291cmNlUGF0aCA9IHN0eWxlLnNvdXJjZVBhdGg7XG4gIH1cblxuICB2YXIgcmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oc291cmNlUGF0aClcbiAgICAsIHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aC5qb2luKHRndCwgc3R5bGVOYW1lICsgJy5jc3MnKSlcbiAgICA7IFxuXG4gIHV0aWwucHVtcChyZWFkU3RyZWFtLCB3cml0ZVN0cmVhbSwgY2IpO1xufVxuXG5cbmZ1bmN0aW9uIGNvcHlTdHlsZXModGd0LCBjYikge1xuICB2YXIgcGVuZGluZyA9IHN0eWxlcy5sZW5ndGg7XG4gIHN0eWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG4gICAgY29weVN0eWxlKHMsIHRndCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgaWYgKGVycikgeyBcbiAgICAgICAgY2IoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICgtLXBlbmRpbmcgPT09IDApIGNiKCk7XG4gICAgICB9IFxuICAgIH0pO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaGlnaGxpZ2h0ICAgOiAgaGlnaGxpZ2h0XG4gICwgZ2V0TGFuZ3VhZ2UgOiAgZ2V0TGFuZ3VhZ2VcbiAgLCBnZXRTdHlsZXMgICA6ICBnZXRTdHlsZXNcbiAgLCBjb3B5U3R5bGUgICA6ICBjb3B5U3R5bGVcbiAgLCBjb3B5U3R5bGVzICA6ICBjb3B5U3R5bGVzXG59O1xuXG4iXX0=
