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
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

},{}],4:[function(require,module,exports){
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

},{"_process":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
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

},{"./support/isBuffer":6,"_process":5,"inherits":2}],8:[function(require,module,exports){
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
},{"../components/docs.component.js":9,"apeman-brws-react":"apeman-brws-react"}],9:[function(require,module,exports){
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
},{"./fragments/header":10,"./views/guide_view":14,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","apeman-react-style":"apeman-react-style","react":"react"}],10:[function(require,module,exports){
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
},{"../../services/link_service":16,"../fragments/logo":11,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],11:[function(require,module,exports){
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
},{"react":"react"}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Markdown = _react2.default.createClass({
  displayName: 'Markdown',

  propTypes: {
    text: _react.PropTypes.string
  },
  getDefaultProps: function getDefaultProps() {
    var s = this;
    return {
      text: null
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;

    var content = (0, _marked2.default)(props.text);
    return _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } });
  }
});

exports.default = Markdown;
},{"marked":21,"react":"react"}],13:[function(require,module,exports){
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
},{"react":"react"}],14:[function(require,module,exports){
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

var _markdown = require('../fragments/markdown');

var _markdown2 = _interopRequireDefault(_markdown);

var _snippet_service = require('../../services/snippet_service');

var _os = require('os');

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
              _react2.default.createElement(_markdown2.default, { text: [].concat(text).join(_os.EOL + _os.EOL) })
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
},{"../../services/snippet_service":17,"../fragments/markdown":12,"../fragments/snippet":13,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","os":3,"react":"react"}],15:[function(require,module,exports){
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
},{"ape-highlighting":19,"fs":1}],16:[function(require,module,exports){
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

},{"_process":5,"path":4}],17:[function(require,module,exports){
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
},{"../constants/snippet_constants":15}],18:[function(require,module,exports){
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

},{"fs":1,"jsx-syntaxhighlighter":20,"node-syntaxhighlighter":25}],19:[function(require,module,exports){
/**
 * ape framework module for highlighting.
 * @module ape-highlighting
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get highlightJsx () { return d(require('./highlight_jsx')) }
}

},{"./highlight_jsx":18}],20:[function(require,module,exports){
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

},{"node-syntaxhighlighter/lib/scripts/XRegExp":23,"node-syntaxhighlighter/lib/scripts/shCore":24}],21:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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

},{"./XRegExp":23}],25:[function(require,module,exports){
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

},{"./inline-scripts":22,"fs":1,"path":4,"util":7}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvb3MtYnJvd3NlcmlmeS9icm93c2VyLmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJsaWIvYnJvd3Nlci9kb2NzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9kb2NzLmNvbXBvbmVudC5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9oZWFkZXIuanMiLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvbG9nby5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9tYXJrZG93bi5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9zbmlwcGV0LmpzIiwibGliL2NvbXBvbmVudHMvdmlld3MvZ3VpZGVfdmlldy5qcyIsImxpYi9jb25zdGFudHMvc25pcHBldF9jb25zdGFudHMuanMiLCJsaWIvc2VydmljZXMvbGlua19zZXJ2aWNlLmpzIiwibGliL3NlcnZpY2VzL3NuaXBwZXRfc2VydmljZS5qcyIsIm5vZGVfbW9kdWxlcy9hcGUtaGlnaGxpZ2h0aW5nL2xpYi9oaWdobGlnaHRfanN4LmpzIiwibm9kZV9tb2R1bGVzL2FwZS1oaWdobGlnaHRpbmcvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2pzeC1zeW50YXhoaWdobGlnaHRlci9zaEJydXNoSnN4LmpzIiwibm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvaW5saW5lLXNjcmlwdHMuanMiLCJub2RlX21vZHVsZXMvbm9kZS1zeW50YXhoaWdobGlnaHRlci9saWIvc2NyaXB0cy9YUmVnRXhwLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbGliL3NjcmlwdHMvc2hDb3JlLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbm9kZS1zeW50YXhoaWdobGlnaHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3J3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdHJEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiZXhwb3J0cy5lbmRpYW5uZXNzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJ0xFJyB9O1xuXG5leHBvcnRzLmhvc3RuYW1lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBsb2NhdGlvbi5ob3N0bmFtZVxuICAgIH1cbiAgICBlbHNlIHJldHVybiAnJztcbn07XG5cbmV4cG9ydHMubG9hZGF2ZyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtdIH07XG5cbmV4cG9ydHMudXB0aW1lID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gMCB9O1xuXG5leHBvcnRzLmZyZWVtZW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7XG59O1xuXG5leHBvcnRzLnRvdGFsbWVtID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBOdW1iZXIuTUFYX1ZBTFVFO1xufTtcblxuZXhwb3J0cy5jcHVzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW10gfTtcblxuZXhwb3J0cy50eXBlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJ0Jyb3dzZXInIH07XG5cbmV4cG9ydHMucmVsZWFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5hcHBWZXJzaW9uO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59O1xuXG5leHBvcnRzLm5ldHdvcmtJbnRlcmZhY2VzXG49IGV4cG9ydHMuZ2V0TmV0d29ya0ludGVyZmFjZXNcbj0gZnVuY3Rpb24gKCkgeyByZXR1cm4ge30gfTtcblxuZXhwb3J0cy5hcmNoID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJ2phdmFzY3JpcHQnIH07XG5cbmV4cG9ydHMucGxhdGZvcm0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnYnJvd3NlcicgfTtcblxuZXhwb3J0cy50bXBkaXIgPSBleHBvcnRzLnRtcERpciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJy90bXAnO1xufTtcblxuZXhwb3J0cy5FT0wgPSAnXFxuJztcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLyoqXG4gKiBCcm93c2VyIHNjcmlwdCBmb3IgZG9jcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdCA9IHJlcXVpcmUoJ2FwZW1hbi1icndzLXJlYWN0Jyk7XG5cbnZhciBfYXBlbWFuQnJ3c1JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwZW1hbkJyd3NSZWFjdCk7XG5cbnZhciBfZG9jc0NvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvZG9jcy5jb21wb25lbnQuanMnKTtcblxudmFyIF9kb2NzQ29tcG9uZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RvY3NDb21wb25lbnQpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgQ09OVEFJTkVSX0lEID0gJ2RvY3Mtd3JhcCc7XG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3dpbmRvdyA9IHdpbmRvdztcbiAgdmFyIGxvY2FsZSA9IF93aW5kb3cubG9jYWxlO1xuXG4gIF9hcGVtYW5CcndzUmVhY3QyLmRlZmF1bHQucmVuZGVyKENPTlRBSU5FUl9JRCwgX2RvY3NDb21wb25lbnQyLmRlZmF1bHQsIHtcbiAgICBsb2NhbGU6IGxvY2FsZVxuICB9LCBmdW5jdGlvbiBkb25lKCkge1xuICAgIC8vIFRoZSBjb21wb25lbnQgaXMgcmVhZHkuXG4gIH0pO1xufTsiLCIvKipcbiAqIENvbXBvbmVudCBvZiBkb2NzLlxuICpcbiAqIEdlbmVyYXRlZCBieSBjb3ogb24gNi85LzIwMTYsXG4gKiBmcm9tIGEgdGVtcGxhdGUgcHJvdmlkZWQgYnkgYXBlbWFuLWJ1ZC1tb2NrLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0U3R5bGUgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3Qtc3R5bGUnKTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfaGVhZGVyID0gcmVxdWlyZSgnLi9mcmFnbWVudHMvaGVhZGVyJyk7XG5cbnZhciBfaGVhZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlYWRlcik7XG5cbnZhciBfZ3VpZGVfdmlldyA9IHJlcXVpcmUoJy4vdmlld3MvZ3VpZGVfdmlldycpO1xuXG52YXIgX2d1aWRlX3ZpZXcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ3VpZGVfdmlldyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBEb2NzQ29tcG9uZW50ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdEb2NzQ29tcG9uZW50JyxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWNrZXI6IG5ldyBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdTdGFjay5TdGFja2VyKHtcbiAgICAgICAgcm9vdDogX2d1aWRlX3ZpZXcyLmRlZmF1bHQsXG4gICAgICAgIHJvb3RQcm9wczoge31cbiAgICAgIH0pXG4gICAgfTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICBzLnJlZ2lzdGVyTG9jYWxlKHByb3BzLmxvY2FsZSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwUGFnZSxcbiAgICAgIG51bGwsXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfaGVhZGVyMi5kZWZhdWx0LCB7IHRhYjogJ0RPQ1MnIH0pLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwTWFpbixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2ssIHsgc3RhY2tlcjogcHJvcHMuc3RhY2tlciB9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEb2NzQ29tcG9uZW50OyIsIi8qKlxuICogSGVhZGVyIGNvbXBvbmVudFxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfbG9nbyA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9sb2dvJyk7XG5cbnZhciBfbG9nbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2dvKTtcblxudmFyIF9saW5rX3NlcnZpY2UgPSByZXF1aXJlKCcuLi8uLi9zZXJ2aWNlcy9saW5rX3NlcnZpY2UnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEhlYWRlciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnSGVhZGVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB0YWI6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0YWI6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG4gICAgdmFyIHRhYiA9IHByb3BzLnRhYjtcblxuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICB2YXIgX3RhYkl0ZW0gPSBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlclRhYkl0ZW0uY3JlYXRlSXRlbTtcbiAgICB2YXIgX2xpbmsgPSBmdW5jdGlvbiBfbGluaygpIHtcbiAgICAgIHJldHVybiBfbGlua19zZXJ2aWNlLnNpbmdsZXRvbi5yZXNvbHZlSHRtbExpbmsuYXBwbHkoX2xpbmtfc2VydmljZS5zaW5nbGV0b24sIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlcixcbiAgICAgIHsgY2xhc3NOYW1lOiAnaGVhZGVyJyB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwQ29udGFpbmVyLFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcEhlYWRlckxvZ28sXG4gICAgICAgICAgeyBocmVmOiBfbGluaygnaW5kZXguaHRtbCcpIH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2xvZ28yLmRlZmF1bHQsIG51bGwpXG4gICAgICAgICksXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyVGFiLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgX3RhYkl0ZW0obCgncGFnZXMuRE9DU19QQUdFJyksIF9saW5rKCdkb2NzLmh0bWwnKSwgeyBzZWxlY3RlZDogdGFiID09PSAnRE9DUycgfSksXG4gICAgICAgICAgX3RhYkl0ZW0obCgncGFnZXMuQ0FTRVNfUEFHRScpLCBfbGluaygnY2FzZXMuaHRtbCcpLCB7IHNlbGVjdGVkOiB0YWIgPT09ICdDQVNFUycgfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBIZWFkZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBMb2dvID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdMb2dvJyxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICdoMScsXG4gICAgICB7IGNsYXNzTmFtZTogJ2xvZ28nIH0sXG4gICAgICAnU1VHT1MnXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IExvZ287IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWFya2VkID0gcmVxdWlyZSgnbWFya2VkJyk7XG5cbnZhciBfbWFya2VkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21hcmtlZCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBNYXJrZG93biA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTWFya2Rvd24nLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHRleHQ6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogbnVsbFxuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgdmFyIGNvbnRlbnQgPSAoMCwgX21hcmtlZDIuZGVmYXVsdCkocHJvcHMudGV4dCk7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7IF9faHRtbDogY29udGVudCB9IH0pO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTWFya2Rvd247IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBTbmlwcGV0ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdTbmlwcGV0JyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBzcmM6IF9yZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWRcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAnc25pcHBldCcsIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7IF9faHRtbDogcHJvcHMuc3JjIH0gfSk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBTbmlwcGV0OyIsIi8qKlxuICogVmlldyBmb3IgZ3VpZGVcbiAqIEBjbGFzcyBHdWlkZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdEJhc2ljID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LWJhc2ljJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfc25pcHBldCA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9zbmlwcGV0Jyk7XG5cbnZhciBfc25pcHBldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zbmlwcGV0KTtcblxudmFyIF9tYXJrZG93biA9IHJlcXVpcmUoJy4uL2ZyYWdtZW50cy9tYXJrZG93bicpO1xuXG52YXIgX21hcmtkb3duMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21hcmtkb3duKTtcblxudmFyIF9zbmlwcGV0X3NlcnZpY2UgPSByZXF1aXJlKCcuLi8uLi9zZXJ2aWNlcy9zbmlwcGV0X3NlcnZpY2UnKTtcblxudmFyIF9vcyA9IHJlcXVpcmUoJ29zJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBHdWlkZVZpZXcgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0d1aWRlVmlldycsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuXG4gICAgdmFyIF9zZWN0aW9uID0gZnVuY3Rpb24gX3NlY3Rpb24obmFtZSwgY29uZmlnKSB7XG4gICAgICB2YXIgdGl0bGUgPSBjb25maWcudGl0bGU7XG4gICAgICB2YXIgdGV4dCA9IGNvbmZpZy50ZXh0O1xuICAgICAgdmFyIHNuaXBwZXQgPSBjb25maWcuc25pcHBldDtcblxuICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb24sXG4gICAgICAgIHsgaWQ6ICdndWlkZS0nICsgbmFtZSArICctc2VjdGlvbicsXG4gICAgICAgICAgY2xhc3NOYW1lOiAnZ3VpZGUtc2VjdGlvbicsXG4gICAgICAgICAga2V5OiBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbkhlYWRlcixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIHRpdGxlXG4gICAgICAgICksXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbkJvZHksXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS10ZXh0LWNvbnRhaW5lcicgfSxcbiAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS1kZXNjcmlwdGlvbicgfSxcbiAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hcmtkb3duMi5kZWZhdWx0LCB7IHRleHQ6IFtdLmNvbmNhdCh0ZXh0KS5qb2luKF9vcy5FT0wgKyBfb3MuRU9MKSB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZ3VpZGUtaW1hZ2UtY29udGFpbmVyJyB9LFxuICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2d1aWRlLXNuaXBwZXQnIH0sXG4gICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9zbmlwcGV0Mi5kZWZhdWx0LCB7IHNyYzogc25pcHBldCB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3LFxuICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS12aWV3JyB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3SGVhZGVyLCBudWxsKSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdCb2R5LFxuICAgICAgICBudWxsLFxuICAgICAgICBbX3NlY3Rpb24oJ2Nsb3VkLXNldHVwJywge1xuICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5HVUlERV9DTE9VRF9TRVRVUF9USVRMRScpLFxuICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkdVSURFX0NMT1VEX1NFVFVQX1RFWFQnKSxcbiAgICAgICAgICBzbmlwcGV0OiBfc25pcHBldF9zZXJ2aWNlLnNpbmdsZXRvbi5nZXRTbmlwcGV0KCdleGFtcGxlQ2xvdWQnKVxuICAgICAgICB9KSwgX3NlY3Rpb24oJ3Nwb3QtcnVuJywge1xuICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5HVUlERV9TUE9UX1JVTl9USVRMRScpLFxuICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkdVSURFX1NQT1RfUlVOX1RFWFQnKSxcbiAgICAgICAgICBzbmlwcGV0OiBfc25pcHBldF9zZXJ2aWNlLnNpbmdsZXRvbi5nZXRTbmlwcGV0KCdleGFtcGxlU3BvdCcpXG4gICAgICAgIH0pLCBfc2VjdGlvbigndGVybWluYWwtdXNlJywge1xuICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5HVUlERV9URVJNSU5BTF9VU0VfVElUTEUnKSxcbiAgICAgICAgICB0ZXh0OiBsKCdzZWN0aW9ucy5HVUlERV9URVJNSU5BTF9VU0VfVEVYVCcpLFxuICAgICAgICAgIHNuaXBwZXQ6IF9zbmlwcGV0X3NlcnZpY2Uuc2luZ2xldG9uLmdldFNuaXBwZXQoJ2V4YW1wbGVUZXJtaW5hbCcpXG4gICAgICAgIH0pXVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1aWRlVmlldzsiLCIvKipcbiAqIEBuYW1lc3BhY2UgU25pcHBldENvbnN0YW50c1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZXhhbXBsZVRlcm1pbmFsID0gZXhwb3J0cy5leGFtcGxlU3BvdCA9IGV4cG9ydHMuZXhhbXBsZUNsb3VkID0gZXhwb3J0cy5leGFtcGxlVXNhZ2UgPSB1bmRlZmluZWQ7XG5cbnZhciBfYXBlSGlnaGxpZ2h0aW5nID0gcmVxdWlyZSgnYXBlLWhpZ2hsaWdodGluZycpO1xuXG52YXIgX2ZzID0gcmVxdWlyZSgnZnMnKTtcblxudmFyIF9mczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9mcyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBleGlzdHMgPSBmdW5jdGlvbiBleGlzdHMoZmlsZW5hbWUpIHtcbiAgcmV0dXJuIF9mczIuZGVmYXVsdC5leGlzdHNTeW5jICYmIF9mczIuZGVmYXVsdC5leGlzdHNTeW5jKGZpbGVuYW1lKTtcbn07XG52YXIgcmVhZCA9IGZ1bmN0aW9uIHJlYWQoZmlsZW5hbWUpIHtcbiAgcmV0dXJuIGV4aXN0cyhmaWxlbmFtZSkgJiYgX2ZzMi5kZWZhdWx0LnJlYWRGaWxlU3luYyhmaWxlbmFtZSkudG9TdHJpbmcoKSB8fCBudWxsO1xufTtcblxudmFyIGV4YW1wbGVVc2FnZSA9IF9hcGVIaWdobGlnaHRpbmcuaGlnaGxpZ2h0SnN4LmNvZGUocmVhZChyZXF1aXJlLnJlc29sdmUoJ3N1Z29zL2V4YW1wbGUvZXhhbXBsZS11c2FnZS5qcycpKSk7XG52YXIgZXhhbXBsZUNsb3VkID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9tb2R1bGVzL2V4YW1wbGUtY2xvdWQuanMnKSkpO1xudmFyIGV4YW1wbGVTcG90ID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9tb2R1bGVzL2V4YW1wbGUtc3BvdC5qcycpKSk7XG52YXIgZXhhbXBsZVRlcm1pbmFsID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9tb2R1bGVzL2V4YW1wbGUtdGVybWluYWwuanMnKSkpO1xuXG5leHBvcnRzLmV4YW1wbGVVc2FnZSA9IGV4YW1wbGVVc2FnZTtcbmV4cG9ydHMuZXhhbXBsZUNsb3VkID0gZXhhbXBsZUNsb3VkO1xuZXhwb3J0cy5leGFtcGxlU3BvdCA9IGV4YW1wbGVTcG90O1xuZXhwb3J0cy5leGFtcGxlVGVybWluYWwgPSBleGFtcGxlVGVybWluYWw7IiwiLyoqXG4gKiBAY2xhc3MgTGlua1NlcnZpY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLyoqIEBsZW5kcyBMaW5rU2VydmljZSAqL1xuXG52YXIgTGlua1NlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIExpbmtTZXJ2aWNlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaW5rU2VydmljZSk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTGlua1NlcnZpY2UsIFt7XG4gICAga2V5OiAncmVzb2x2ZUh0bWxMaW5rJyxcblxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZSBhIGh0bWwgbGlua1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIEh0bWwgZmlsZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gLSBSZXNvbHZlZCBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZUh0bWxMaW5rKGZpbGVuYW1lKSB7XG4gICAgICB2YXIgcyA9IHRoaXM7XG4gICAgICB2YXIgbGFuZyA9IHMuX2dldExhbmcoKTtcbiAgICAgIHZhciBodG1sRGlyID0gbGFuZyA/ICdodG1sLycgKyBsYW5nIDogJ2h0bWwnO1xuICAgICAgcmV0dXJuIHBhdGguam9pbihodG1sRGlyLCBmaWxlbmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2dldExhbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0TGFuZygpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTEFORztcbiAgICAgIH1cbiAgICAgIHJldHVybiB3aW5kb3cubGFuZztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTGlua1NlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgTGlua1NlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihMaW5rU2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gTGlua1NlcnZpY2U7IiwiLyoqXG4gKiBAY2xhc3MgU25pcHBldFNlcnZpY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKiogQGxlbmRzIFNuaXBwZXRTZXJ2aWNlICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBTbmlwcGV0U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU25pcHBldFNlcnZpY2UoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNuaXBwZXRTZXJ2aWNlKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTbmlwcGV0U2VydmljZSwgW3tcbiAgICBrZXk6ICdnZXRTbmlwcGV0JyxcblxuICAgIC8qKlxuICAgICAqIEdldCBzbmlwcGV0IHdpdGggbmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzbmlwcGV0XG4gICAgICogQHJldHVybnMgez9zdHJpbmd9IC0gTWF0Y2hlZCBzbmlwcGV0XG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFNuaXBwZXQobmFtZSkge1xuICAgICAgdmFyIHMgPSB0aGlzO1xuICAgICAgdmFyIHNuaXBwZXRzID0gcy5fZ2V0U25pcHBldHMoKTtcbiAgICAgIHJldHVybiBzbmlwcGV0c1tuYW1lXTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfZ2V0U25pcHBldHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0U25pcHBldHMoKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoJy4uL2NvbnN0YW50cy9zbmlwcGV0X2NvbnN0YW50cycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpbmRvdy5zbmlwcGV0cztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU25pcHBldFNlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgU25pcHBldFNlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihTbmlwcGV0U2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gU25pcHBldFNlcnZpY2U7IiwiLyoqXG4gKiBAZnVuY3Rpb24gaGlnaGxpZ2h0SnN4XG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjIC0gU291cmNlIHN0cmluZy5cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gT3B0aW9uYWwgc2V0dGluZ3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAtIEhpZ2hsaWdodGVkIHN0cmluZy5cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgbnNoID0gcmVxdWlyZSgnbm9kZS1zeW50YXhoaWdobGlnaHRlcicpXG5jb25zdCBqc3ggPSByZXF1aXJlKCdqc3gtc3ludGF4aGlnaGxpZ2h0ZXInKVxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5cbi8qKiBAbGVuZHMgaGlnaGxpZ2h0SnN4ICovXG5mdW5jdGlvbiBoaWdobGlnaHRKc3ggKHNyYywgb3B0aW9ucyA9IHt9KSB7XG4gIGxldCBzdHlsZSA9IGhpZ2hsaWdodEpzeC5zdHlsZSgpXG4gIGxldCBjb2RlID0gaGlnaGxpZ2h0SnN4LmNvZGUoc3JjKVxuICByZXR1cm4gW1xuICAgICc8ZGl2PicsXG4gICAgJzxzdHlsZSBzY29wZWQ9XCJzY29wZWRcIj4nICsgc3R5bGUgKyAnPC9zdHlsZT4nLFxuICAgIGNvZGUsXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCcnKVxufVxuXG5oaWdobGlnaHRKc3guY29kZSA9IGZ1bmN0aW9uIChzcmMpIHtcbiAgcmV0dXJuIG5zaC5oaWdobGlnaHQoc3JjLCBqc3gsIHsgZ3V0dGVyOiBmYWxzZSB9KVxufVxuXG5oaWdobGlnaHRKc3guc3R5bGUgPSBmdW5jdGlvbiAoKSB7XG4gIGxldCBmaWxlbmFtZSA9IG5zaC5nZXRTdHlsZXMoKVsgMCBdLnNvdXJjZVBhdGhcbiAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSkudG9TdHJpbmcoKVxufVxuXG5oaWdobGlnaHRKc3guZnJvbUZpbGUgPSBmdW5jdGlvbiAoZmlsZW5hbWUsIG9wdGlvbnMpIHtcbiAgbGV0IHNyYyA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSkudG9TdHJpbmcoKVxuICByZXR1cm4gaGlnaGxpZ2h0SnN4KHNyYywgb3B0aW9ucylcbn1cbm1vZHVsZS5leHBvcnRzID0gaGlnaGxpZ2h0SnN4XG4iLCIvKipcbiAqIGFwZSBmcmFtZXdvcmsgbW9kdWxlIGZvciBoaWdobGlnaHRpbmcuXG4gKiBAbW9kdWxlIGFwZS1oaWdobGlnaHRpbmdcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxubGV0IGQgPSAobW9kdWxlKSA9PiBtb2R1bGUuZGVmYXVsdCB8fCBtb2R1bGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBoaWdobGlnaHRKc3ggKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2hpZ2hsaWdodF9qc3gnKSkgfVxufVxuIiwidmFyIFhSZWdFeHAgPSByZXF1aXJlKFwibm9kZS1zeW50YXhoaWdobGlnaHRlci9saWIvc2NyaXB0cy9YUmVnRXhwXCIpLlhSZWdFeHA7XHJcbnZhciBTeW50YXhIaWdobGlnaHRlcjtcclxuOyhmdW5jdGlvbigpXHJcbntcclxuXHQvLyBDb21tb25KU1xyXG5cdFN5bnRheEhpZ2hsaWdodGVyID0gU3ludGF4SGlnaGxpZ2h0ZXIgfHwgKHR5cGVvZiByZXF1aXJlICE9PSAndW5kZWZpbmVkJz8gcmVxdWlyZShcIm5vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbGliL3NjcmlwdHMvc2hDb3JlXCIpLlN5bnRheEhpZ2hsaWdodGVyIDogbnVsbCk7XHJcblxyXG5cdGZ1bmN0aW9uIEJydXNoKClcclxuXHR7XHJcblx0XHRmdW5jdGlvbiBwcm9jZXNzKG1hdGNoLCByZWdleEluZm8pXHJcblx0XHR7XHJcblx0XHRcdHZhciBjb25zdHJ1Y3RvciA9IFN5bnRheEhpZ2hsaWdodGVyLk1hdGNoLFxyXG5cdFx0XHRcdGNvZGUgPSBtYXRjaFswXSxcclxuXHRcdFx0XHR0YWcgPSBuZXcgWFJlZ0V4cCgnKCZsdDt8PClbXFxcXHNcXFxcL1xcXFw/XSooPzxuYW1lPls6XFxcXHctXFxcXC5dKyknLCAneGcnKS5leGVjKGNvZGUpLFxyXG5cdFx0XHRcdHJlc3VsdCA9IFtdXHJcblx0XHRcdFx0O1xyXG5cdFx0XHJcblx0XHRcdGlmIChtYXRjaC5hdHRyaWJ1dGVzICE9IG51bGwpIFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIGF0dHJpYnV0ZXMsXHJcblx0XHRcdFx0XHRyZWdleCA9IG5ldyBYUmVnRXhwKCcoPzxuYW1lPiBbXFxcXHc6XFxcXC1cXFxcLl0rKScgK1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCdcXFxccyo9XFxcXHMqJyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Jyg/PHZhbHVlPiBcIi4qP1wifFxcJy4qP1xcJ3xcXFxcdyspJyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQneGcnKTtcclxuXHJcblx0XHRcdFx0d2hpbGUgKChhdHRyaWJ1dGVzID0gcmVnZXguZXhlYyhjb2RlKSkgIT0gbnVsbCkgXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMubmFtZSwgbWF0Y2guaW5kZXggKyBhdHRyaWJ1dGVzLmluZGV4LCAnY29sb3IxJykpO1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMudmFsdWUsIG1hdGNoLmluZGV4ICsgYXR0cmlidXRlcy5pbmRleCArIGF0dHJpYnV0ZXNbMF0uaW5kZXhPZihhdHRyaWJ1dGVzLnZhbHVlKSwgJ3N0cmluZycpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh0YWcgIT0gbnVsbClcclxuXHRcdFx0XHRyZXN1bHQucHVzaChcclxuXHRcdFx0XHRcdG5ldyBjb25zdHJ1Y3Rvcih0YWcubmFtZSwgbWF0Y2guaW5kZXggKyB0YWdbMF0uaW5kZXhPZih0YWcubmFtZSksICdrZXl3b3JkJylcclxuXHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGtleXdvcmRzID1cdCdicmVhayBjYXNlIGNhdGNoIGNvbnRpbnVlICcgK1xyXG5cdFx0XHRcdFx0XHQnZGVmYXVsdCBkZWxldGUgZG8gZWxzZSBmYWxzZSAgJyArXHJcblx0XHRcdFx0XHRcdCdmb3IgZnVuY3Rpb24gaWYgaW4gaW5zdGFuY2VvZiAnICtcclxuXHRcdFx0XHRcdFx0J25ldyBudWxsIHJldHVybiBzdXBlciBzd2l0Y2ggJyArXHJcblx0XHRcdFx0XHRcdCd0aGlzIHRocm93IHRydWUgdHJ5IHR5cGVvZiB2YXIgd2hpbGUgd2l0aCdcclxuXHRcdFx0XHRcdFx0O1xyXG5cclxuXHRcdHZhciByID0gU3ludGF4SGlnaGxpZ2h0ZXIucmVnZXhMaWI7XHJcblx0XHJcblx0XHR0aGlzLnJlZ2V4TGlzdCA9IFtcclxuXHRcdFx0eyByZWdleDogci5tdWx0aUxpbmVEb3VibGVRdW90ZWRTdHJpbmcsXHRcdFx0XHRcdGNzczogJ3N0cmluZycgfSxcdFx0XHQvLyBkb3VibGUgcXVvdGVkIHN0cmluZ3NcclxuXHRcdFx0eyByZWdleDogci5tdWx0aUxpbmVTaW5nbGVRdW90ZWRTdHJpbmcsXHRcdFx0XHRcdGNzczogJ3N0cmluZycgfSxcdFx0XHQvLyBzaW5nbGUgcXVvdGVkIHN0cmluZ3NcclxuXHRcdFx0eyByZWdleDogci5zaW5nbGVMaW5lQ0NvbW1lbnRzLFx0XHRcdFx0XHRcdFx0Y3NzOiAnY29tbWVudHMnIH0sXHRcdFx0Ly8gb25lIGxpbmUgY29tbWVudHNcclxuXHRcdFx0eyByZWdleDogci5tdWx0aUxpbmVDQ29tbWVudHMsXHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdFx0XHQvLyBtdWx0aWxpbmUgY29tbWVudHNcclxuXHRcdFx0eyByZWdleDogL1xccyojLiovZ20sXHRcdFx0XHRcdFx0XHRcdFx0Y3NzOiAncHJlcHJvY2Vzc29yJyB9LFx0XHQvLyBwcmVwcm9jZXNzb3IgdGFncyBsaWtlICNyZWdpb24gYW5kICNlbmRyZWdpb25cclxuXHRcdFx0eyByZWdleDogbmV3IFJlZ0V4cCh0aGlzLmdldEtleXdvcmRzKGtleXdvcmRzKSwgJ2dtJyksXHRjc3M6ICdrZXl3b3JkJyB9LFxyXG5cdFx0XHRcclxuXHRcdFx0eyByZWdleDogbmV3IFhSZWdFeHAoJyhcXFxcJmx0O3w8KVxcXFwhXFxcXFtbXFxcXHdcXFxcc10qP1xcXFxbKC58XFxcXHMpKj9cXFxcXVxcXFxdKFxcXFwmZ3Q7fD4pJywgJ2dtJyksXHRcdFx0Y3NzOiAnY29sb3IyJyB9LFx0Ly8gPCFbIC4uLiBbIC4uLiBdXT5cclxuXHRcdFx0eyByZWdleDogU3ludGF4SGlnaGxpZ2h0ZXIucmVnZXhMaWIueG1sQ29tbWVudHMsXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y3NzOiAnY29tbWVudHMnIH0sXHQvLyA8IS0tIC4uLiAtLT5cclxuXHRcdFx0eyByZWdleDogbmV3IFhSZWdFeHAoJygmbHQ7fDwpW1xcXFxzXFxcXC9cXFxcP10qKFxcXFx3KykoPzxhdHRyaWJ1dGVzPi4qPylbXFxcXHNcXFxcL1xcXFw/XSooJmd0O3w+KScsICdzZycpLCBmdW5jOiBwcm9jZXNzIH1cclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHRoaXMuZm9ySHRtbFNjcmlwdChyLnNjcmlwdFNjcmlwdFRhZ3MpO1xyXG5cdH07XHJcblxyXG5cdEJydXNoLnByb3RvdHlwZVx0PSBuZXcgU3ludGF4SGlnaGxpZ2h0ZXIuSGlnaGxpZ2h0ZXIoKTtcclxuXHRCcnVzaC5hbGlhc2VzXHQ9IFsnanN4J107XHJcblxyXG5cdFN5bnRheEhpZ2hsaWdodGVyLmJydXNoZXMuSlNYID0gQnJ1c2g7XHJcblxyXG5cdC8vIENvbW1vbkpTXHJcblx0dHlwZW9mKGV4cG9ydHMpICE9ICd1bmRlZmluZWQnID8gZXhwb3J0cy5CcnVzaCA9IEJydXNoIDogbnVsbDtcclxufSkoKTtcclxuIiwiLyoqXG4gKiBtYXJrZWQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWRcbiAqL1xuXG47KGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eXFxuKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rXFxuKikrLyxcbiAgZmVuY2VzOiBub29wLFxuICBocjogL14oICpbLSpfXSl7Myx9ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICooW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS8sXG4gIG5wdGFibGU6IG5vb3AsXG4gIGxoZWFkaW5nOiAvXihbXlxcbl0rKVxcbiAqKD18LSl7Mix9ICooPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oICo+W15cXG5dKyhcXG4oPyFkZWYpW15cXG5dKykqXFxuKikrLyxcbiAgbGlzdDogL14oICopKGJ1bGwpIFtcXHNcXFNdKz8oPzpocnxkZWZ8XFxuezIsfSg/ISApKD8hXFwxYnVsbCApXFxuKnxcXHMqJCkvLFxuICBodG1sOiAvXiAqKD86Y29tbWVudCAqKD86XFxufFxccyokKXxjbG9zZWQgKig/OlxcbnsyLH18XFxzKiQpfGNsb3NpbmcgKig/OlxcbnsyLH18XFxzKiQpKS8sXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICtbXCIoXShbXlxcbl0rKVtcIildKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcCxcbiAgcGFyYWdyYXBoOiAvXigoPzpbXlxcbl0rXFxuPyg/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXx0YWd8ZGVmKSkrKVxcbiovLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkK1xcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSBbXlxcbl0qKD86XFxuKD8hXFwxYnVsbCApW15cXG5dKikqLztcbmJsb2NrLml0ZW0gPSByZXBsYWNlKGJsb2NrLml0ZW0sICdnbScpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgpO1xuXG5ibG9jay5saXN0ID0gcmVwbGFjZShibG9jay5saXN0KVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/OlstKl9dICopezMsfSg/OlxcXFxuK3wkKSknKVxuICAoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgKCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSByZXBsYWNlKGJsb2NrLmJsb2NrcXVvdGUpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuYmxvY2suX3RhZyA9ICcoPyEoPzonXG4gICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlJ1xuICArICd8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG8nXG4gICsgJ3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZylcXFxcYilcXFxcdysoPyE6L3xbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJztcblxuYmxvY2suaHRtbCA9IHJlcGxhY2UoYmxvY2suaHRtbClcbiAgKCdjb21tZW50JywgLzwhLS1bXFxzXFxTXSo/LS0+LylcbiAgKCdjbG9zZWQnLCAvPCh0YWcpW1xcc1xcU10rPzxcXC9cXDE+LylcbiAgKCdjbG9zaW5nJywgLzx0YWcoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vKVxuICAoL3RhZy9nLCBibG9jay5fdGFnKVxuICAoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnaHInLCBibG9jay5ocilcbiAgKCdoZWFkaW5nJywgYmxvY2suaGVhZGluZylcbiAgKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAoJ2Jsb2NrcXVvdGUnLCBibG9jay5ibG9ja3F1b3RlKVxuICAoJ3RhZycsICc8JyArIGJsb2NrLl90YWcpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gKihgezMsfXx+ezMsfSlbIFxcLl0qKFxcUyspPyAqXFxuKFtcXHNcXFNdKj8pXFxzKlxcMSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogL14vLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKyhbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpL1xufSk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgKCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooXFxTLipcXHwuKilcXG4gKihbLTpdKyAqXFx8Wy18IDpdKilcXG4oKD86LipcXHwuKig/OlxcbnwkKSkqKVxcbiovLFxuICB0YWJsZTogL14gKlxcfCguKylcXG4gKlxcfCggKlstOl0rWy18IDpdKilcXG4oKD86ICpcXHwuKig/OlxcbnwkKSkqKVxcbiovXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMucnVsZXMgPSBibG9jay5ub3JtYWw7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wLCBicSkge1xuICB2YXIgc3JjID0gc3JjLnJlcGxhY2UoL14gKyQvZ20sICcnKVxuICAgICwgbmV4dFxuICAgICwgbG9vc2VcbiAgICAsIGNhcFxuICAgICwgYnVsbFxuICAgICwgYlxuICAgICwgaXRlbVxuICAgICwgc3BhY2VcbiAgICAsIGlcbiAgICAsIGw7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eIHs0fS9nbSwgJycpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gY2FwLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgOiBjYXBcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZmVuY2VzIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZmVuY2VzLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIGxhbmc6IGNhcFsyXSxcbiAgICAgICAgdGV4dDogY2FwWzNdIHx8ICcnXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0OiBjYXBbMl1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgbm8gbGVhZGluZyBwaXBlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsyXSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X3N0YXJ0JyxcbiAgICAgICAgb3JkZXJlZDogYnVsbC5sZW5ndGggPiAxXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGVhY2ggdG9wLWxldmVsIGl0ZW0uXG4gICAgICBjYXAgPSBjYXBbMF0ubWF0Y2godGhpcy5ydWxlcy5pdGVtKTtcblxuICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgbCA9IGNhcC5sZW5ndGg7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGNhcFtpXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxpc3QgaXRlbSdzIGJ1bGxldFxuICAgICAgICAvLyBzbyBpdCBpcyBzZWVuIGFzIHRoZSBuZXh0IHRva2VuLlxuICAgICAgICBzcGFjZSA9IGl0ZW0ubGVuZ3RoO1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9eICooWyorLV18XFxkK1xcLikgKy8sICcnKTtcblxuICAgICAgICAvLyBPdXRkZW50IHdoYXRldmVyIHRoZVxuICAgICAgICAvLyBsaXN0IGl0ZW0gY29udGFpbnMuIEhhY2t5LlxuICAgICAgICBpZiAofml0ZW0uaW5kZXhPZignXFxuICcpKSB7XG4gICAgICAgICAgc3BhY2UgLT0gaXRlbS5sZW5ndGg7XG4gICAgICAgICAgaXRlbSA9ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICAgID8gaXRlbS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14gezEsJyArIHNwYWNlICsgJ30nLCAnZ20nKSwgJycpXG4gICAgICAgICAgICA6IGl0ZW0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIG5leHQgbGlzdCBpdGVtIGJlbG9uZ3MgaGVyZS5cbiAgICAgICAgLy8gQmFja3BlZGFsIGlmIGl0IGRvZXMgbm90IGJlbG9uZyBpbiB0aGlzIGxpc3QuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnRMaXN0cyAmJiBpICE9PSBsIC0gMSkge1xuICAgICAgICAgIGIgPSBibG9jay5idWxsZXQuZXhlYyhjYXBbaSArIDFdKVswXTtcbiAgICAgICAgICBpZiAoYnVsbCAhPT0gYiAmJiAhKGJ1bGwubGVuZ3RoID4gMSAmJiBiLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICBzcmMgPSBjYXAuc2xpY2UoaSArIDEpLmpvaW4oJ1xcbicpICsgc3JjO1xuICAgICAgICAgICAgaSA9IGwgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGl0ZW0gaXMgbG9vc2Ugb3Igbm90LlxuICAgICAgICAvLyBVc2U6IC8oXnxcXG4pKD8hIClbXlxcbl0rXFxuXFxuKD8hXFxzKiQpL1xuICAgICAgICAvLyBmb3IgZGlzY291bnQgYmVoYXZpb3IuXG4gICAgICAgIGxvb3NlID0gbmV4dCB8fCAvXFxuXFxuKD8hXFxzKiQpLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBuZXh0ID0gaXRlbS5jaGFyQXQoaXRlbS5sZW5ndGggLSAxKSA9PT0gJ1xcbic7XG4gICAgICAgICAgaWYgKCFsb29zZSkgbG9vc2UgPSBuZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogbG9vc2VcbiAgICAgICAgICAgID8gJ2xvb3NlX2l0ZW1fc3RhcnQnXG4gICAgICAgICAgICA6ICdsaXN0X2l0ZW1fc3RhcnQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlY3Vyc2UuXG4gICAgICAgIHRoaXMudG9rZW4oaXRlbSwgZmFsc2UsIGJxKTtcblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtX2VuZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlZlxuICAgIGlmICgoIWJxICYmIHRvcCkgJiYgKGNhcCA9IHRoaXMucnVsZXMuZGVmLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5saW5rc1tjYXBbMV0udG9Mb3dlckNhc2UoKV0gPSB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy50YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC8oPzogKlxcfCAqKT9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXVxuICAgICAgICAgIC5yZXBsYWNlKC9eICpcXHwgKnwgKlxcfCAqJC9nLCAnJylcbiAgICAgICAgICAuc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMucGFyYWdyYXBoLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHRleHQ6IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgLy8gVG9wLWxldmVsIHNob3VsZCBuZXZlciByZWFjaCBoZXJlLlxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoW1xcXFxgKnt9XFxbXFxdKCkjK1xcLS4hXz5dKS8sXG4gIGF1dG9saW5rOiAvXjwoW14gPl0rKEB8OlxcLylbXiA+XSspPi8sXG4gIHVybDogbm9vcCxcbiAgdGFnOiAvXjwhLS1bXFxzXFxTXSo/LS0+fF48XFwvP1xcdysoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vLFxuICBsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXChocmVmXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8sXG4gIG5vbGluazogL14hP1xcWygoPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXSkqKVxcXS8sXG4gIHN0cm9uZzogL15fXyhbXFxzXFxTXSs/KV9fKD8hXyl8XlxcKlxcKihbXFxzXFxTXSs/KVxcKlxcKig/IVxcKikvLFxuICBlbTogL15cXGJfKCg/OlteX118X18pKz8pX1xcYnxeXFwqKCg/OlxcKlxcKnxbXFxzXFxTXSkrPylcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspXFxzKihbXFxzXFxTXSo/W15gXSlcXHMqXFwxKD8hYCkvLFxuICBicjogL14gezIsfVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcCxcbiAgdGV4dDogL15bXFxzXFxTXSs/KD89W1xcXFw8IVxcW18qYF18IHsyLH1cXG58JCkvXG59O1xuXG5pbmxpbmUuX2luc2lkZSA9IC8oPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXXxcXF0oPz1bXlxcW10qXFxdKSkqLztcbmlubGluZS5faHJlZiA9IC9cXHMqPD8oW1xcc1xcU10qPyk+Pyg/OlxccytbJ1wiXShbXFxzXFxTXSo/KVsnXCJdKT9cXHMqLztcblxuaW5saW5lLmxpbmsgPSByZXBsYWNlKGlubGluZS5saW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gICgpO1xuXG5pbmxpbmUucmVmbGluayA9IHJlcGxhY2UoaW5saW5lLnJlZmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pfF5cXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKS9cbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IHJlcGxhY2UoaW5saW5lLmVzY2FwZSkoJ10pJywgJ358XSknKSgpLFxuICB1cmw6IC9eKGh0dHBzPzpcXC9cXC9bXlxcczxdK1tePC4sOjtcIicpXFxdXFxzXSkvLFxuICBkZWw6IC9efn4oPz1cXFMpKFtcXHNcXFNdKj9cXFMpfn4vLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS50ZXh0KVxuICAgICgnXXwnLCAnfl18JylcbiAgICAoJ3wnLCAnfGh0dHBzPzovL3wnKVxuICAgICgpXG59KTtcblxuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSBtZXJnZSh7fSwgaW5saW5lLmdmbSwge1xuICBicjogcmVwbGFjZShpbmxpbmUuYnIpKCd7Mix9JywgJyonKSgpLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS5nZm0udGV4dCkoJ3syLH0nLCAnKicpKClcbn0pO1xuXG4vKipcbiAqIElubGluZSBMZXhlciAmIENvbXBpbGVyXG4gKi9cblxuZnVuY3Rpb24gSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMubGlua3MgPSBsaW5rcztcbiAgdGhpcy5ydWxlcyA9IGlubGluZS5ub3JtYWw7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKCF0aGlzLmxpbmtzKSB7XG4gICAgdGhyb3cgbmV3XG4gICAgICBFcnJvcignVG9rZW5zIGFycmF5IHJlcXVpcmVzIGEgYGxpbmtzYCBwcm9wZXJ0eS4nKTtcbiAgfVxuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuYnJlYWtzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmdmbTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGlubGluZS5wZWRhbnRpYztcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBJbmxpbmUgUnVsZXNcbiAqL1xuXG5JbmxpbmVMZXhlci5ydWxlcyA9IGlubGluZTtcblxuLyoqXG4gKiBTdGF0aWMgTGV4aW5nL0NvbXBpbGluZyBNZXRob2RcbiAqL1xuXG5JbmxpbmVMZXhlci5vdXRwdXQgPSBmdW5jdGlvbihzcmMsIGxpbmtzLCBvcHRpb25zKSB7XG4gIHZhciBpbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpO1xuICByZXR1cm4gaW5saW5lLm91dHB1dChzcmMpO1xufTtcblxuLyoqXG4gKiBMZXhpbmcvQ29tcGlsaW5nXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKHNyYykge1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGxpbmtcbiAgICAsIHRleHRcbiAgICAsIGhyZWZcbiAgICAsIGNhcDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gZXNjYXBlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZXNjYXBlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSBjYXBbMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBhdXRvbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmF1dG9saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gY2FwWzFdLmNoYXJBdCg2KSA9PT0gJzonXG4gICAgICAgICAgPyB0aGlzLm1hbmdsZShjYXBbMV0uc3Vic3RyaW5nKDcpKVxuICAgICAgICAgIDogdGhpcy5tYW5nbGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRoaXMubWFuZ2xlKCdtYWlsdG86JykgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFnXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFnLmV4ZWMoc3JjKSkge1xuICAgICAgaWYgKCF0aGlzLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgIDogZXNjYXBlKGNhcFswXSlcbiAgICAgICAgOiBjYXBbMF1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfSk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgaWYgKChjYXAgPSB0aGlzLnJ1bGVzLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICB8fCAoY2FwID0gdGhpcy5ydWxlcy5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IHRoaXMubGlua3NbbGluay50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghbGluayB8fCAhbGluay5ocmVmKSB7XG4gICAgICAgIG91dCArPSBjYXBbMF0uY2hhckF0KDApO1xuICAgICAgICBzcmMgPSBjYXBbMF0uc3Vic3RyaW5nKDEpICsgc3JjO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCBsaW5rKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBzdHJvbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5zdHJvbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuc3Ryb25nKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGVtXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZW0uZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZW0odGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuY29kZXNwYW4oZXNjYXBlKGNhcFsyXSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRleHQoZXNjYXBlKHRoaXMuc21hcnR5cGFudHMoY2FwWzBdKSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBMaW5rXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dExpbmsgPSBmdW5jdGlvbihjYXAsIGxpbmspIHtcbiAgdmFyIGhyZWYgPSBlc2NhcGUobGluay5ocmVmKVxuICAgICwgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5tYW5nbGUpIHJldHVybiB0ZXh0O1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGwgPSB0ZXh0Lmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG59XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2RlID0gZnVuY3Rpb24oY29kZSwgbGFuZywgZXNjYXBlZCkge1xuICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgIHZhciBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgY29kZSA9IG91dDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhbmcpIHtcbiAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICdcXG48L2NvZGU+PC9wcmU+JztcbiAgfVxuXG4gIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgKyBlc2NhcGUobGFuZywgdHJ1ZSlcbiAgICArICdcIj4nXG4gICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgKyAnXFxuPC9jb2RlPjwvcHJlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYmxvY2txdW90ZSA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gIHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJyArIHF1b3RlICsgJzwvYmxvY2txdW90ZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIHJldHVybiBodG1sO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhlYWRpbmcgPSBmdW5jdGlvbih0ZXh0LCBsZXZlbCwgcmF3KSB7XG4gIHJldHVybiAnPGgnXG4gICAgKyBsZXZlbFxuICAgICsgJyBpZD1cIidcbiAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICArIHJhdy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XSsvZywgJy0nKVxuICAgICsgJ1wiPidcbiAgICArIHRleHRcbiAgICArICc8L2gnXG4gICAgKyBsZXZlbFxuICAgICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkKSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICByZXR1cm4gJzwnICsgdHlwZSArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0aXRlbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8bGk+JyArIHRleHQgKyAnPC9saT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgKyAnPHRoZWFkPlxcbidcbiAgICArIGhlYWRlclxuICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICsgJzx0Ym9keT5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90Ym9keT5cXG4nXG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBzdHlsZT1cInRleHQtYWxpZ246JyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCd2YnNjcmlwdDonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuICB2YXIgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5pbWFnZSA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5cbmZ1bmN0aW9uIFBhcnNlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW4gPSBudWxsO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xufVxuXG4vKipcbiAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAqL1xuXG5QYXJzZXIucGFyc2UgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMsIHJlbmRlcmVyKSB7XG4gIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMsIHJlbmRlcmVyKTtcbiAgcmV0dXJuIHBhcnNlci5wYXJzZShzcmMpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBMb29wXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHNyYykge1xuICB0aGlzLmlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihzcmMubGlua3MsIHRoaXMub3B0aW9ucywgdGhpcy5yZW5kZXJlcik7XG4gIHRoaXMudG9rZW5zID0gc3JjLnJldmVyc2UoKTtcblxuICB2YXIgb3V0ID0gJyc7XG4gIHdoaWxlICh0aGlzLm5leHQoKSkge1xuICAgIG91dCArPSB0aGlzLnRvaygpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbiA9IHRoaXMudG9rZW5zLnBvcCgpO1xufTtcblxuLyoqXG4gKiBQcmV2aWV3IE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMudG9rZW5zLmxlbmd0aCAtIDFdIHx8IDA7XG59O1xuXG4vKipcbiAqIFBhcnNlIFRleHQgVG9rZW5zXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVRleHQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJvZHkgPSB0aGlzLnRva2VuLnRleHQ7XG5cbiAgd2hpbGUgKHRoaXMucGVlaygpLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgIGJvZHkgKz0gJ1xcbicgKyB0aGlzLm5leHQoKS50ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuaW5saW5lLm91dHB1dChib2R5KTtcbn07XG5cbi8qKlxuICogUGFyc2UgQ3VycmVudCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUudG9rID0gZnVuY3Rpb24oKSB7XG4gIHN3aXRjaCAodGhpcy50b2tlbi50eXBlKSB7XG4gICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNhc2UgJ2hyJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICB9XG4gICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpLFxuICAgICAgICB0aGlzLnRva2VuLmRlcHRoLFxuICAgICAgICB0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdjb2RlJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuY29kZSh0aGlzLnRva2VuLnRleHQsXG4gICAgICAgIHRoaXMudG9rZW4ubGFuZyxcbiAgICAgICAgdGhpcy50b2tlbi5lc2NhcGVkKTtcbiAgICB9XG4gICAgY2FzZSAndGFibGUnOiB7XG4gICAgICB2YXIgaGVhZGVyID0gJydcbiAgICAgICAgLCBib2R5ID0gJydcbiAgICAgICAgLCBpXG4gICAgICAgICwgcm93XG4gICAgICAgICwgY2VsbFxuICAgICAgICAsIGZsYWdzXG4gICAgICAgICwgajtcblxuICAgICAgLy8gaGVhZGVyXG4gICAgICBjZWxsID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5oZWFkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZmxhZ3MgPSB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfTtcbiAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi5oZWFkZXJbaV0pLFxuICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcm93ID0gdGhpcy50b2tlbi5jZWxsc1tpXTtcblxuICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHJvd1tqXSksXG4gICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnYmxvY2txdW90ZV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnYmxvY2txdW90ZV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJydcbiAgICAgICAgLCBvcmRlcmVkID0gdGhpcy50b2tlbi5vcmRlcmVkO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xvb3NlX2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICB2YXIgaHRtbCA9ICF0aGlzLnRva2VuLnByZSAmJiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgID8gdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dClcbiAgICAgICAgOiB0aGlzLnRva2VuLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5odG1sKGh0bWwpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKCFlbmNvZGUgPyAvJig/ISM/XFx3KzspL2cgOiAvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UoLyYoWyNcXHddKyk7L2csIGZ1bmN0aW9uKF8sIG4pIHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZihuYW1lLCB2YWwpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgIHZhbCA9IHZhbC5yZXBsYWNlKC8oXnxbXlxcW10pXFxeL2csICckMScpO1xuICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cbm5vb3AuZXhlYyA9IG5vb3A7XG5cbmZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICB2YXIgaSA9IDFcbiAgICAsIHRhcmdldFxuICAgICwga2V5O1xuXG4gIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAoa2V5IGluIHRhcmdldCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5cbi8qKlxuICogTWFya2VkXG4gKi9cblxuZnVuY3Rpb24gbWFya2VkKHNyYywgb3B0LCBjYWxsYmFjaykge1xuICBpZiAoY2FsbGJhY2sgfHwgdHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0O1xuICAgICAgb3B0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuXG4gICAgdmFyIGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHRcbiAgICAgICwgdG9rZW5zXG4gICAgICAsIHBlbmRpbmdcbiAgICAgICwgaSA9IDA7XG5cbiAgICB0cnkge1xuICAgICAgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICB9XG5cbiAgICBwZW5kaW5nID0gdG9rZW5zLmxlbmd0aDtcblxuICAgIHZhciBkb25lID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3V0O1xuXG4gICAgICB0cnkge1xuICAgICAgICBvdXQgPSBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnIgPSBlO1xuICAgICAgfVxuXG4gICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICByZXR1cm4gZXJyXG4gICAgICAgID8gY2FsbGJhY2soZXJyKVxuICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgfTtcblxuICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgaWYgKCFwZW5kaW5nKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgZm9yICg7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIChmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ2NvZGUnKSB7XG4gICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgIGlmIChjb2RlID09IG51bGwgfHwgY29kZSA9PT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSkodG9rZW5zW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAob3B0KSBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICAgIHJldHVybiBQYXJzZXIucGFyc2UoTGV4ZXIubGV4KHNyYywgb3B0KSwgb3B0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZC4nO1xuICAgIGlmICgob3B0IHx8IG1hcmtlZC5kZWZhdWx0cykuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZGVmYXVsdHMgPSB7XG4gIGdmbTogdHJ1ZSxcbiAgdGFibGVzOiB0cnVlLFxuICBicmVha3M6IGZhbHNlLFxuICBwZWRhbnRpYzogZmFsc2UsXG4gIHNhbml0aXplOiBmYWxzZSxcbiAgc2FuaXRpemVyOiBudWxsLFxuICBtYW5nbGU6IHRydWUsXG4gIHNtYXJ0TGlzdHM6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxuICBoaWdobGlnaHQ6IG51bGwsXG4gIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgaGVhZGVyUHJlZml4OiAnJyxcbiAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcixcbiAgeGh0bWw6IGZhbHNlXG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuXG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBtYXJrZWQ7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtYXJrZWQ7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5tYXJrZWQgPSBtYXJrZWQ7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuIiwiLypqc2hpbnQgbGF4YnJlYWs6IHRydWUgKi9cblxudmFyIGNvZGVQYXR0ZXJuID0gLzx0ZCBjbGFzcz1cImNvZGVcIi4qPzxcXC90ZD4vXG4gICwgYWxsU2NyaXB0VGFncyA9IFtcbiAgICAgIFxuICAgICAgICAvLyA8c2NyaXB0PiAuLi4gPC9zY3JpcHQ+XG4gICAgICAgIHsgb3BlbjogLzxzY3JpcHRbXj5dKj4vLCBjbG9zZTogLzxcXC9zY3JpcHRbXj5dKj4vLCBhbGlhczogJ2pzJyB9XG5cbiAgICAgICAgLy8gPD8gLi4uID8+XG4gICAgICAsIHsgb3BlbjogL15cXHMqPFxcP1xccyokLywgY2xvc2U6IC9eXFxzKlxcPz5cXHMqJC8sICBhbGlhczogJ3BocCcgfVxuXG4gICAgICAgIC8vIDwhW0NEQVRBWyAuLi4gXV0gICAgIC0tIChpbmxpbmUgYWN0aW9uc2NyaXB0KSBvbmx5IHVzZWQgZm9yIHhodG1sXG4gICAgICAsIHsgb3BlbjogL15cXHMqPzwhXFxbQ0RBVEFcXFtcXHMqPyQvLCBjbG9zZTogL15cXHMqP1xcXVxcXT5cXHMqPyQvLCBhbGlhczogJ2FzMycsIGFwcGx5VG86ICd4aHRtbCcgfVxuICAgIF07XG5cbmZ1bmN0aW9uIGZpbmRTY3JpcHRzKGxpbmVzLCBzcGVjaWZpZWRBbGlhcykge1xuICB2YXIgc2NyaXB0cyA9IFtdXG4gICAgLCBpblNjcmlwdCA9IGZhbHNlXG4gICAgLCBjdXJyZW50U2NyaXB0XG4gICAgLCBzY3JpcHRUYWdzID0gYWxsU2NyaXB0VGFnc1xuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgICAvLyBFLmcuLCBpbiBjYXNlIG9mICFbQ0RBVEEgbWFrZSBzdXJlIHdlIG9ubHkgaGlnaGxpZ2h0IGlmIHVzZXIgc3BlY2lmaWVkIHhodG1sXG4gICAgICAgICAgcmV0dXJuICF0YWcuYXBwbHlUbyB8fCB0YWcuYXBwbHlUbyA9PT0gc3BlY2lmaWVkQWxpYXM7XG4gICAgICAgIH0pO1xuXG4gIGZvciAodmFyIGxpbmVOdW0gID0gMDsgbGluZU51bSA8IGxpbmVzLmxlbmd0aDsgbGluZU51bSsrKSB7XG4gICAgdmFyIGxpbmUgPSBsaW5lc1tsaW5lTnVtXTtcblxuICAgIGlmICghaW5TY3JpcHQpIHtcbiAgICAgIHZhciBtYXRjaGluZ1RhZyA9IG51bGw7XG5cbiAgICAgIGZvciAodmFyIHRhZ0luZGV4ID0gMDsgdGFnSW5kZXggPCBzY3JpcHRUYWdzLmxlbmd0aDsgdGFnSW5kZXgrKykge1xuICAgICAgICB2YXIgdGFnID0gc2NyaXB0VGFnc1t0YWdJbmRleF07XG5cbiAgICAgICAgaWYgKGxpbmUubWF0Y2godGFnLm9wZW4pKSB7IFxuICAgICAgICAgIG1hdGNoaW5nVGFnID0gdGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaGluZ1RhZykge1xuICAgICAgICBpblNjcmlwdCA9IHRydWU7XG4gICAgICAgIGN1cnJlbnRTY3JpcHQgPSB7IGZyb206IGxpbmVOdW0gKyAxLCBjb2RlOiAnJywgdGFnOiBtYXRjaGluZ1RhZyB9O1xuICAgICAgfVxuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAobGluZS5tYXRjaChjdXJyZW50U2NyaXB0LnRhZy5jbG9zZSkpIHtcbiAgICAgIGluU2NyaXB0ID0gZmFsc2U7XG4gICAgICBjdXJyZW50U2NyaXB0LnRvID0gbGluZU51bSAtIDE7XG4gICAgICBzY3JpcHRzLnB1c2goY3VycmVudFNjcmlwdCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjdXJyZW50U2NyaXB0LmNvZGUgKz0gbGluZSArICdcXG4nO1xuICB9XG5cbiAgcmV0dXJuIHNjcmlwdHM7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RMaW5lcyhodG1sKSB7XG4gIHZhciBjb2RlID0gaHRtbC5tYXRjaChjb2RlUGF0dGVybilbMF1cbiAgICAsIGxpbmVzID0gY29kZS5tYXRjaCgvPGRpdiArY2xhc3M9XCJsaW5lIC4rPzxcXC9kaXY+L21nKTtcblxuICByZXR1cm4gbGluZXMuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VQbGFpbkxpbmVzKGZyb21JbmRleCwgdG9JbmRleCwgaHRtbCwgcmVwbGFjZW1lbnQpIHtcbiAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgJzxkaXYgK2NsYXNzPVwiW15cIl0rP2luZGV4JyArIGZyb21JbmRleCArICdbXlwiXSpcIicgIC8vIG9wZW5pbmcgdGFnIG9mIHN0YXJ0XG4gICAgICAgICsgJy4rJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2NyaXB0IGh0bWxcbiAgICAgICAgKyAnPGRpdiArY2xhc3M9XCJbXlwiXSs/aW5kZXgnICsgdG9JbmRleCArICdbXlwiXSpcIicgICAgLy8gb3BlbmluZyB0YWcgb2YgZW5kXG4gICAgICAgICsgJy4rPzwvZGl2PicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2xvc2luZyB0YWcgb2YgZW5kXG4gICAgICApXG4gICAgLCBjb2RlICAgICAgICAgICAgICAgID0gIGh0bWwubWF0Y2goY29kZVBhdHRlcm4pWzBdXG4gICAgLCBjb2RlV2l0aFJlcGxhY2VtZW50ID0gIGNvZGUucmVwbGFjZShyZWdleHAsIHJlcGxhY2VtZW50KTtcblxuICByZXR1cm4gaHRtbC5yZXBsYWNlKGNvZGUsIGNvZGVXaXRoUmVwbGFjZW1lbnQpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGZpbmRTY3JpcHRzICAgICAgIDogIGZpbmRTY3JpcHRzXG4gICwgZXh0cmFjdExpbmVzICAgICAgOiAgZXh0cmFjdExpbmVzXG4gICwgcmVwbGFjZVBsYWluTGluZXMgOiAgcmVwbGFjZVBsYWluTGluZXNcbn07XG4iLCIvLyBYUmVnRXhwIDEuNS4xXG4vLyAoYykgMjAwNy0yMDEyIFN0ZXZlbiBMZXZpdGhhblxuLy8gTUlUIExpY2Vuc2Vcbi8vIDxodHRwOi8veHJlZ2V4cC5jb20+XG4vLyBQcm92aWRlcyBhbiBhdWdtZW50ZWQsIGV4dGVuc2libGUsIGNyb3NzLWJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgcmVndWxhciBleHByZXNzaW9ucyxcbi8vIGluY2x1ZGluZyBzdXBwb3J0IGZvciBhZGRpdGlvbmFsIHN5bnRheCwgZmxhZ3MsIGFuZCBtZXRob2RzXG5cbnZhciBYUmVnRXhwO1xuXG5pZiAoWFJlZ0V4cCkge1xuICAgIC8vIEF2b2lkIHJ1bm5pbmcgdHdpY2UsIHNpbmNlIHRoYXQgd291bGQgYnJlYWsgcmVmZXJlbmNlcyB0byBuYXRpdmUgZ2xvYmFsc1xuICAgIHRocm93IEVycm9yKFwiY2FuJ3QgbG9hZCBYUmVnRXhwIHR3aWNlIGluIHRoZSBzYW1lIGZyYW1lXCIpO1xufVxuXG4vLyBSdW4gd2l0aGluIGFuIGFub255bW91cyBmdW5jdGlvbiB0byBwcm90ZWN0IHZhcmlhYmxlcyBhbmQgYXZvaWQgbmV3IGdsb2JhbHNcbihmdW5jdGlvbiAodW5kZWZpbmVkKSB7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBDb25zdHJ1Y3RvclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBBY2NlcHRzIGEgcGF0dGVybiBhbmQgZmxhZ3M7IHJldHVybnMgYSBuZXcsIGV4dGVuZGVkIGBSZWdFeHBgIG9iamVjdC4gRGlmZmVycyBmcm9tIGEgbmF0aXZlXG4gICAgLy8gcmVndWxhciBleHByZXNzaW9uIGluIHRoYXQgYWRkaXRpb25hbCBzeW50YXggYW5kIGZsYWdzIGFyZSBzdXBwb3J0ZWQgYW5kIGNyb3NzLWJyb3dzZXJcbiAgICAvLyBzeW50YXggaW5jb25zaXN0ZW5jaWVzIGFyZSBhbWVsaW9yYXRlZC4gYFhSZWdFeHAoL3JlZ2V4LylgIGNsb25lcyBhbiBleGlzdGluZyByZWdleCBhbmRcbiAgICAvLyBjb252ZXJ0cyB0byB0eXBlIFhSZWdFeHBcbiAgICBYUmVnRXhwID0gZnVuY3Rpb24gKHBhdHRlcm4sIGZsYWdzKSB7XG4gICAgICAgIHZhciBvdXRwdXQgPSBbXSxcbiAgICAgICAgICAgIGN1cnJTY29wZSA9IFhSZWdFeHAuT1VUU0lERV9DTEFTUyxcbiAgICAgICAgICAgIHBvcyA9IDAsXG4gICAgICAgICAgICBjb250ZXh0LCB0b2tlblJlc3VsdCwgbWF0Y2gsIGNociwgcmVnZXg7XG5cbiAgICAgICAgaWYgKFhSZWdFeHAuaXNSZWdFeHAocGF0dGVybikpIHtcbiAgICAgICAgICAgIGlmIChmbGFncyAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcihcImNhbid0IHN1cHBseSBmbGFncyB3aGVuIGNvbnN0cnVjdGluZyBvbmUgUmVnRXhwIGZyb20gYW5vdGhlclwiKTtcbiAgICAgICAgICAgIHJldHVybiBjbG9uZShwYXR0ZXJuKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUb2tlbnMgYmVjb21lIHBhcnQgb2YgdGhlIHJlZ2V4IGNvbnN0cnVjdGlvbiBwcm9jZXNzLCBzbyBwcm90ZWN0IGFnYWluc3QgaW5maW5pdGVcbiAgICAgICAgLy8gcmVjdXJzaW9uIHdoZW4gYW4gWFJlZ0V4cCBpcyBjb25zdHJ1Y3RlZCB3aXRoaW4gYSB0b2tlbiBoYW5kbGVyIG9yIHRyaWdnZXJcbiAgICAgICAgaWYgKGlzSW5zaWRlQ29uc3RydWN0b3IpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImNhbid0IGNhbGwgdGhlIFhSZWdFeHAgY29uc3RydWN0b3Igd2l0aGluIHRva2VuIGRlZmluaXRpb24gZnVuY3Rpb25zXCIpO1xuXG4gICAgICAgIGZsYWdzID0gZmxhZ3MgfHwgXCJcIjtcbiAgICAgICAgY29udGV4dCA9IHsgLy8gYHRoaXNgIG9iamVjdCBmb3IgY3VzdG9tIHRva2Vuc1xuICAgICAgICAgICAgaGFzTmFtZWRDYXB0dXJlOiBmYWxzZSxcbiAgICAgICAgICAgIGNhcHR1cmVOYW1lczogW10sXG4gICAgICAgICAgICBoYXNGbGFnOiBmdW5jdGlvbiAoZmxhZykge3JldHVybiBmbGFncy5pbmRleE9mKGZsYWcpID4gLTE7fSxcbiAgICAgICAgICAgIHNldEZsYWc6IGZ1bmN0aW9uIChmbGFnKSB7ZmxhZ3MgKz0gZmxhZzt9XG4gICAgICAgIH07XG5cbiAgICAgICAgd2hpbGUgKHBvcyA8IHBhdHRlcm4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgY3VzdG9tIHRva2VucyBhdCB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBydW5Ub2tlbnMocGF0dGVybiwgcG9zLCBjdXJyU2NvcGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgICBpZiAodG9rZW5SZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh0b2tlblJlc3VsdC5vdXRwdXQpO1xuICAgICAgICAgICAgICAgIHBvcyArPSAodG9rZW5SZXN1bHQubWF0Y2hbMF0ubGVuZ3RoIHx8IDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgbmF0aXZlIG11bHRpY2hhcmFjdGVyIG1ldGFzZXF1ZW5jZXMgKGV4Y2x1ZGluZyBjaGFyYWN0ZXIgY2xhc3NlcykgYXRcbiAgICAgICAgICAgICAgICAvLyB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgICAgICAgICAgICAgIGlmIChtYXRjaCA9IG5hdGl2LmV4ZWMuY2FsbChuYXRpdmVUb2tlbnNbY3VyclNjb3BlXSwgcGF0dGVybi5zbGljZShwb3MpKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChtYXRjaFswXSk7XG4gICAgICAgICAgICAgICAgICAgIHBvcyArPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2hyID0gcGF0dGVybi5jaGFyQXQocG9zKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNociA9PT0gXCJbXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyU2NvcGUgPSBYUmVnRXhwLklOU0lERV9DTEFTUztcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hyID09PSBcIl1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJTY29wZSA9IFhSZWdFeHAuT1VUU0lERV9DTEFTUztcbiAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSBwb3NpdGlvbiBvbmUgY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKGNocik7XG4gICAgICAgICAgICAgICAgICAgIHBvcysrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlZ2V4ID0gUmVnRXhwKG91dHB1dC5qb2luKFwiXCIpLCBuYXRpdi5yZXBsYWNlLmNhbGwoZmxhZ3MsIGZsYWdDbGlwLCBcIlwiKSk7XG4gICAgICAgIHJlZ2V4Ll94cmVnZXhwID0ge1xuICAgICAgICAgICAgc291cmNlOiBwYXR0ZXJuLFxuICAgICAgICAgICAgY2FwdHVyZU5hbWVzOiBjb250ZXh0Lmhhc05hbWVkQ2FwdHVyZSA/IGNvbnRleHQuY2FwdHVyZU5hbWVzIDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVnZXg7XG4gICAgfTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgUHVibGljIHByb3BlcnRpZXNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgWFJlZ0V4cC52ZXJzaW9uID0gXCIxLjUuMVwiO1xuXG4gICAgLy8gVG9rZW4gc2NvcGUgYml0ZmxhZ3NcbiAgICBYUmVnRXhwLklOU0lERV9DTEFTUyA9IDE7XG4gICAgWFJlZ0V4cC5PVVRTSURFX0NMQVNTID0gMjtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgUHJpdmF0ZSB2YXJpYWJsZXNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgdmFyIHJlcGxhY2VtZW50VG9rZW4gPSAvXFwkKD86KFxcZFxcZD98WyQmYCddKXx7KFskXFx3XSspfSkvZyxcbiAgICAgICAgZmxhZ0NsaXAgPSAvW15naW15XSt8KFtcXHNcXFNdKSg/PVtcXHNcXFNdKlxcMSkvZywgLy8gTm9ubmF0aXZlIGFuZCBkdXBsaWNhdGUgZmxhZ3NcbiAgICAgICAgcXVhbnRpZmllciA9IC9eKD86Wz8qK118e1xcZCsoPzosXFxkKik/fSlcXD8/LyxcbiAgICAgICAgaXNJbnNpZGVDb25zdHJ1Y3RvciA9IGZhbHNlLFxuICAgICAgICB0b2tlbnMgPSBbXSxcbiAgICAgICAgLy8gQ29weSBuYXRpdmUgZ2xvYmFscyBmb3IgcmVmZXJlbmNlIChcIm5hdGl2ZVwiIGlzIGFuIEVTMyByZXNlcnZlZCBrZXl3b3JkKVxuICAgICAgICBuYXRpdiA9IHtcbiAgICAgICAgICAgIGV4ZWM6IFJlZ0V4cC5wcm90b3R5cGUuZXhlYyxcbiAgICAgICAgICAgIHRlc3Q6IFJlZ0V4cC5wcm90b3R5cGUudGVzdCxcbiAgICAgICAgICAgIG1hdGNoOiBTdHJpbmcucHJvdG90eXBlLm1hdGNoLFxuICAgICAgICAgICAgcmVwbGFjZTogU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlLFxuICAgICAgICAgICAgc3BsaXQ6IFN0cmluZy5wcm90b3R5cGUuc3BsaXRcbiAgICAgICAgfSxcbiAgICAgICAgY29tcGxpYW50RXhlY05wY2cgPSBuYXRpdi5leGVjLmNhbGwoLygpPz8vLCBcIlwiKVsxXSA9PT0gdW5kZWZpbmVkLCAvLyBjaGVjayBgZXhlY2AgaGFuZGxpbmcgb2Ygbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBzXG4gICAgICAgIGNvbXBsaWFudExhc3RJbmRleEluY3JlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB4ID0gL14vZztcbiAgICAgICAgICAgIG5hdGl2LnRlc3QuY2FsbCh4LCBcIlwiKTtcbiAgICAgICAgICAgIHJldHVybiAheC5sYXN0SW5kZXg7XG4gICAgICAgIH0oKSxcbiAgICAgICAgaGFzTmF0aXZlWSA9IFJlZ0V4cC5wcm90b3R5cGUuc3RpY2t5ICE9PSB1bmRlZmluZWQsXG4gICAgICAgIG5hdGl2ZVRva2VucyA9IHt9O1xuXG4gICAgLy8gYG5hdGl2ZVRva2Vuc2AgbWF0Y2ggbmF0aXZlIG11bHRpY2hhcmFjdGVyIG1ldGFzZXF1ZW5jZXMgb25seSAoaW5jbHVkaW5nIGRlcHJlY2F0ZWQgb2N0YWxzLFxuICAgIC8vIGV4Y2x1ZGluZyBjaGFyYWN0ZXIgY2xhc3NlcylcbiAgICBuYXRpdmVUb2tlbnNbWFJlZ0V4cC5JTlNJREVfQ0xBU1NdID0gL14oPzpcXFxcKD86WzAtM11bMC03XXswLDJ9fFs0LTddWzAtN10/fHhbXFxkQS1GYS1mXXsyfXx1W1xcZEEtRmEtZl17NH18Y1tBLVphLXpdfFtcXHNcXFNdKSkvO1xuICAgIG5hdGl2ZVRva2Vuc1tYUmVnRXhwLk9VVFNJREVfQ0xBU1NdID0gL14oPzpcXFxcKD86MCg/OlswLTNdWzAtN117MCwyfXxbNC03XVswLTddPyk/fFsxLTldXFxkKnx4W1xcZEEtRmEtZl17Mn18dVtcXGRBLUZhLWZdezR9fGNbQS1aYS16XXxbXFxzXFxTXSl8XFwoXFw/Wzo9IV18Wz8qK11cXD98e1xcZCsoPzosXFxkKik/fVxcPz8pLztcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgUHVibGljIG1ldGhvZHNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gTGV0cyB5b3UgZXh0ZW5kIG9yIGNoYW5nZSBYUmVnRXhwIHN5bnRheCBhbmQgY3JlYXRlIGN1c3RvbSBmbGFncy4gVGhpcyBpcyB1c2VkIGludGVybmFsbHkgYnlcbiAgICAvLyB0aGUgWFJlZ0V4cCBsaWJyYXJ5IGFuZCBjYW4gYmUgdXNlZCB0byBjcmVhdGUgWFJlZ0V4cCBwbHVnaW5zLiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIGZvclxuICAgIC8vIHVzZXJzIHdpdGggYWR2YW5jZWQga25vd2xlZGdlIG9mIEphdmFTY3JpcHQncyByZWd1bGFyIGV4cHJlc3Npb24gc3ludGF4IGFuZCBiZWhhdmlvci4gSXQgY2FuXG4gICAgLy8gYmUgZGlzYWJsZWQgYnkgYFhSZWdFeHAuZnJlZXplVG9rZW5zYFxuICAgIFhSZWdFeHAuYWRkVG9rZW4gPSBmdW5jdGlvbiAocmVnZXgsIGhhbmRsZXIsIHNjb3BlLCB0cmlnZ2VyKSB7XG4gICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgIHBhdHRlcm46IGNsb25lKHJlZ2V4LCBcImdcIiArIChoYXNOYXRpdmVZID8gXCJ5XCIgOiBcIlwiKSksXG4gICAgICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlIHx8IFhSZWdFeHAuT1VUU0lERV9DTEFTUyxcbiAgICAgICAgICAgIHRyaWdnZXI6IHRyaWdnZXIgfHwgbnVsbFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHBhdHRlcm4gYW5kIGZsYWdzOyByZXR1cm5zIGFuIGV4dGVuZGVkIGBSZWdFeHBgIG9iamVjdC4gSWYgdGhlIHBhdHRlcm4gYW5kIGZsYWdcbiAgICAvLyBjb21iaW5hdGlvbiBoYXMgcHJldmlvdXNseSBiZWVuIGNhY2hlZCwgdGhlIGNhY2hlZCBjb3B5IGlzIHJldHVybmVkOyBvdGhlcndpc2UgdGhlIG5ld2x5XG4gICAgLy8gY3JlYXRlZCByZWdleCBpcyBjYWNoZWRcbiAgICBYUmVnRXhwLmNhY2hlID0gZnVuY3Rpb24gKHBhdHRlcm4sIGZsYWdzKSB7XG4gICAgICAgIHZhciBrZXkgPSBwYXR0ZXJuICsgXCIvXCIgKyAoZmxhZ3MgfHwgXCJcIik7XG4gICAgICAgIHJldHVybiBYUmVnRXhwLmNhY2hlW2tleV0gfHwgKFhSZWdFeHAuY2FjaGVba2V5XSA9IFhSZWdFeHAocGF0dGVybiwgZmxhZ3MpKTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIGBSZWdFeHBgIGluc3RhbmNlOyByZXR1cm5zIGEgY29weSB3aXRoIHRoZSBgL2dgIGZsYWcgc2V0LiBUaGUgY29weSBoYXMgYSBmcmVzaFxuICAgIC8vIGBsYXN0SW5kZXhgIChzZXQgdG8gemVybykuIElmIHlvdSB3YW50IHRvIGNvcHkgYSByZWdleCB3aXRob3V0IGZvcmNpbmcgdGhlIGBnbG9iYWxgXG4gICAgLy8gcHJvcGVydHksIHVzZSBgWFJlZ0V4cChyZWdleClgLiBEbyBub3QgdXNlIGBSZWdFeHAocmVnZXgpYCBiZWNhdXNlIGl0IHdpbGwgbm90IHByZXNlcnZlXG4gICAgLy8gc3BlY2lhbCBwcm9wZXJ0aWVzIHJlcXVpcmVkIGZvciBuYW1lZCBjYXB0dXJlXG4gICAgWFJlZ0V4cC5jb3B5QXNHbG9iYWwgPSBmdW5jdGlvbiAocmVnZXgpIHtcbiAgICAgICAgcmV0dXJuIGNsb25lKHJlZ2V4LCBcImdcIik7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBzdHJpbmc7IHJldHVybnMgdGhlIHN0cmluZyB3aXRoIHJlZ2V4IG1ldGFjaGFyYWN0ZXJzIGVzY2FwZWQuIFRoZSByZXR1cm5lZCBzdHJpbmdcbiAgICAvLyBjYW4gc2FmZWx5IGJlIHVzZWQgYXQgYW55IHBvaW50IHdpdGhpbiBhIHJlZ2V4IHRvIG1hdGNoIHRoZSBwcm92aWRlZCBsaXRlcmFsIHN0cmluZy4gRXNjYXBlZFxuICAgIC8vIGNoYXJhY3RlcnMgYXJlIFsgXSB7IH0gKCApICogKyA/IC0gLiAsIFxcIF4gJCB8ICMgYW5kIHdoaXRlc3BhY2VcbiAgICBYUmVnRXhwLmVzY2FwZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bLVtcXF17fSgpKis/LixcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIik7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBzdHJpbmcgdG8gc2VhcmNoLCByZWdleCB0byBzZWFyY2ggd2l0aCwgcG9zaXRpb24gdG8gc3RhcnQgdGhlIHNlYXJjaCB3aXRoaW4gdGhlXG4gICAgLy8gc3RyaW5nIChkZWZhdWx0OiAwKSwgYW5kIGFuIG9wdGlvbmFsIEJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIG1hdGNoZXMgbXVzdCBzdGFydCBhdC1vci1cbiAgICAvLyBhZnRlciB0aGUgcG9zaXRpb24gb3IgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBvbmx5LiBUaGlzIGZ1bmN0aW9uIGlnbm9yZXMgdGhlIGBsYXN0SW5kZXhgXG4gICAgLy8gb2YgdGhlIHByb3ZpZGVkIHJlZ2V4IGluIGl0cyBvd24gaGFuZGxpbmcsIGJ1dCB1cGRhdGVzIHRoZSBwcm9wZXJ0eSBmb3IgY29tcGF0aWJpbGl0eVxuICAgIFhSZWdFeHAuZXhlY0F0ID0gZnVuY3Rpb24gKHN0ciwgcmVnZXgsIHBvcywgYW5jaG9yZWQpIHtcbiAgICAgICAgdmFyIHIyID0gY2xvbmUocmVnZXgsIFwiZ1wiICsgKChhbmNob3JlZCAmJiBoYXNOYXRpdmVZKSA/IFwieVwiIDogXCJcIikpLFxuICAgICAgICAgICAgbWF0Y2g7XG4gICAgICAgIHIyLmxhc3RJbmRleCA9IHBvcyA9IHBvcyB8fCAwO1xuICAgICAgICBtYXRjaCA9IHIyLmV4ZWMoc3RyKTsgLy8gUnVuIHRoZSBhbHRlcmVkIGBleGVjYCAocmVxdWlyZWQgZm9yIGBsYXN0SW5kZXhgIGZpeCwgZXRjLilcbiAgICAgICAgaWYgKGFuY2hvcmVkICYmIG1hdGNoICYmIG1hdGNoLmluZGV4ICE9PSBwb3MpXG4gICAgICAgICAgICBtYXRjaCA9IG51bGw7XG4gICAgICAgIGlmIChyZWdleC5nbG9iYWwpXG4gICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSBtYXRjaCA/IHIyLmxhc3RJbmRleCA6IDA7XG4gICAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9O1xuXG4gICAgLy8gQnJlYWtzIHRoZSB1bnJlc3RvcmFibGUgbGluayB0byBYUmVnRXhwJ3MgcHJpdmF0ZSBsaXN0IG9mIHRva2VucywgdGhlcmVieSBwcmV2ZW50aW5nXG4gICAgLy8gc3ludGF4IGFuZCBmbGFnIGNoYW5nZXMuIFNob3VsZCBiZSBydW4gYWZ0ZXIgWFJlZ0V4cCBhbmQgYW55IHBsdWdpbnMgYXJlIGxvYWRlZFxuICAgIFhSZWdFeHAuZnJlZXplVG9rZW5zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBYUmVnRXhwLmFkZFRva2VuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBydW4gYWRkVG9rZW4gYWZ0ZXIgZnJlZXplVG9rZW5zXCIpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGFueSB2YWx1ZTsgcmV0dXJucyBhIEJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIGBSZWdFeHBgIG9iamVjdC5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBhbHNvIGB0cnVlYCBmb3IgcmVnZXggbGl0ZXJhbHMgYW5kIHJlZ2V4ZXMgY3JlYXRlZCBieSB0aGUgYFhSZWdFeHBgXG4gICAgLy8gY29uc3RydWN0b3IuIFRoaXMgd29ya3MgY29ycmVjdGx5IGZvciB2YXJpYWJsZXMgY3JlYXRlZCBpbiBhbm90aGVyIGZyYW1lLCB3aGVuIGBpbnN0YW5jZW9mYFxuICAgIC8vIGFuZCBgY29uc3RydWN0b3JgIGNoZWNrcyB3b3VsZCBmYWlsIHRvIHdvcmsgYXMgaW50ZW5kZWRcbiAgICBYUmVnRXhwLmlzUmVnRXhwID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKSA9PT0gXCJbb2JqZWN0IFJlZ0V4cF1cIjtcbiAgICB9O1xuXG4gICAgLy8gRXhlY3V0ZXMgYGNhbGxiYWNrYCBvbmNlIHBlciBtYXRjaCB3aXRoaW4gYHN0cmAuIFByb3ZpZGVzIGEgc2ltcGxlciBhbmQgY2xlYW5lciB3YXkgdG9cbiAgICAvLyBpdGVyYXRlIG92ZXIgcmVnZXggbWF0Y2hlcyBjb21wYXJlZCB0byB0aGUgdHJhZGl0aW9uYWwgYXBwcm9hY2hlcyBvZiBzdWJ2ZXJ0aW5nXG4gICAgLy8gYFN0cmluZy5wcm90b3R5cGUucmVwbGFjZWAgb3IgcmVwZWF0ZWRseSBjYWxsaW5nIGBleGVjYCB3aXRoaW4gYSBgd2hpbGVgIGxvb3BcbiAgICBYUmVnRXhwLml0ZXJhdGUgPSBmdW5jdGlvbiAoc3RyLCByZWdleCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIHIyID0gY2xvbmUocmVnZXgsIFwiZ1wiKSxcbiAgICAgICAgICAgIGkgPSAtMSwgbWF0Y2g7XG4gICAgICAgIHdoaWxlIChtYXRjaCA9IHIyLmV4ZWMoc3RyKSkgeyAvLyBSdW4gdGhlIGFsdGVyZWQgYGV4ZWNgIChyZXF1aXJlZCBmb3IgYGxhc3RJbmRleGAgZml4LCBldGMuKVxuICAgICAgICAgICAgaWYgKHJlZ2V4Lmdsb2JhbClcbiAgICAgICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSByMi5sYXN0SW5kZXg7IC8vIERvaW5nIHRoaXMgdG8gZm9sbG93IGV4cGVjdGF0aW9ucyBpZiBgbGFzdEluZGV4YCBpcyBjaGVja2VkIHdpdGhpbiBgY2FsbGJhY2tgXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG1hdGNoLCArK2ksIHN0ciwgcmVnZXgpO1xuICAgICAgICAgICAgaWYgKHIyLmxhc3RJbmRleCA9PT0gbWF0Y2guaW5kZXgpXG4gICAgICAgICAgICAgICAgcjIubGFzdEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlZ2V4Lmdsb2JhbClcbiAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBzdHJpbmcgYW5kIGFuIGFycmF5IG9mIHJlZ2V4ZXM7IHJldHVybnMgdGhlIHJlc3VsdCBvZiB1c2luZyBlYWNoIHN1Y2Nlc3NpdmUgcmVnZXhcbiAgICAvLyB0byBzZWFyY2ggd2l0aGluIHRoZSBtYXRjaGVzIG9mIHRoZSBwcmV2aW91cyByZWdleC4gVGhlIGFycmF5IG9mIHJlZ2V4ZXMgY2FuIGFsc28gY29udGFpblxuICAgIC8vIG9iamVjdHMgd2l0aCBgcmVnZXhgIGFuZCBgYmFja3JlZmAgcHJvcGVydGllcywgaW4gd2hpY2ggY2FzZSB0aGUgbmFtZWQgb3IgbnVtYmVyZWQgYmFjay1cbiAgICAvLyByZWZlcmVuY2VzIHNwZWNpZmllZCBhcmUgcGFzc2VkIGZvcndhcmQgdG8gdGhlIG5leHQgcmVnZXggb3IgcmV0dXJuZWQuIEUuZy46XG4gICAgLy8gdmFyIHhyZWdleHBJbWdGaWxlTmFtZXMgPSBYUmVnRXhwLm1hdGNoQ2hhaW4oaHRtbCwgW1xuICAgIC8vICAgICB7cmVnZXg6IC88aW1nXFxiKFtePl0rKT4vaSwgYmFja3JlZjogMX0sIC8vIDxpbWc+IHRhZyBhdHRyaWJ1dGVzXG4gICAgLy8gICAgIHtyZWdleDogWFJlZ0V4cCgnKD9peCkgXFxcXHMgc3JjPVwiICg/PHNyYz4gW15cIl0rICknKSwgYmFja3JlZjogXCJzcmNcIn0sIC8vIHNyYyBhdHRyaWJ1dGUgdmFsdWVzXG4gICAgLy8gICAgIHtyZWdleDogWFJlZ0V4cChcIl5odHRwOi8veHJlZ2V4cFxcXFwuY29tKC9bXiM/XSspXCIsIFwiaVwiKSwgYmFja3JlZjogMX0sIC8vIHhyZWdleHAuY29tIHBhdGhzXG4gICAgLy8gICAgIC9bXlxcL10rJC8gLy8gZmlsZW5hbWVzIChzdHJpcCBkaXJlY3RvcnkgcGF0aHMpXG4gICAgLy8gXSk7XG4gICAgWFJlZ0V4cC5tYXRjaENoYWluID0gZnVuY3Rpb24gKHN0ciwgY2hhaW4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJlY3Vyc2VDaGFpbiAodmFsdWVzLCBsZXZlbCkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBjaGFpbltsZXZlbF0ucmVnZXggPyBjaGFpbltsZXZlbF0gOiB7cmVnZXg6IGNoYWluW2xldmVsXX0sXG4gICAgICAgICAgICAgICAgcmVnZXggPSBjbG9uZShpdGVtLnJlZ2V4LCBcImdcIiksXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IFtdLCBpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIFhSZWdFeHAuaXRlcmF0ZSh2YWx1ZXNbaV0sIHJlZ2V4LCBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKGl0ZW0uYmFja3JlZiA/IChtYXRjaFtpdGVtLmJhY2tyZWZdIHx8IFwiXCIpIDogbWF0Y2hbMF0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICgobGV2ZWwgPT09IGNoYWluLmxlbmd0aCAtIDEpIHx8ICFtYXRjaGVzLmxlbmd0aCkgP1xuICAgICAgICAgICAgICAgIG1hdGNoZXMgOiByZWN1cnNlQ2hhaW4obWF0Y2hlcywgbGV2ZWwgKyAxKTtcbiAgICAgICAgfShbc3RyXSwgMCk7XG4gICAgfTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgTmV3IFJlZ0V4cCBwcm90b3R5cGUgbWV0aG9kc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBBY2NlcHRzIGEgY29udGV4dCBvYmplY3QgYW5kIGFyZ3VtZW50cyBhcnJheTsgcmV0dXJucyB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgYGV4ZWNgIHdpdGggdGhlXG4gICAgLy8gZmlyc3QgdmFsdWUgaW4gdGhlIGFyZ3VtZW50cyBhcnJheS4gdGhlIGNvbnRleHQgaXMgaWdub3JlZCBidXQgaXMgYWNjZXB0ZWQgZm9yIGNvbmdydWl0eVxuICAgIC8vIHdpdGggYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWBcbiAgICBSZWdFeHAucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24gKGNvbnRleHQsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlYyhhcmdzWzBdKTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIGNvbnRleHQgb2JqZWN0IGFuZCBzdHJpbmc7IHJldHVybnMgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIGBleGVjYCB3aXRoIHRoZSBwcm92aWRlZFxuICAgIC8vIHN0cmluZy4gdGhlIGNvbnRleHQgaXMgaWdub3JlZCBidXQgaXMgYWNjZXB0ZWQgZm9yIGNvbmdydWl0eSB3aXRoIGBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbGBcbiAgICBSZWdFeHAucHJvdG90eXBlLmNhbGwgPSBmdW5jdGlvbiAoY29udGV4dCwgc3RyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4ZWMoc3RyKTtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBPdmVycmlkZW4gbmF0aXZlIG1ldGhvZHNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gQWRkcyBuYW1lZCBjYXB0dXJlIHN1cHBvcnQgKHdpdGggYmFja3JlZmVyZW5jZXMgcmV0dXJuZWQgYXMgYHJlc3VsdC5uYW1lYCksIGFuZCBmaXhlcyB0d29cbiAgICAvLyBjcm9zcy1icm93c2VyIGlzc3VlcyBwZXIgRVMzOlxuICAgIC8vIC0gQ2FwdHVyZWQgdmFsdWVzIGZvciBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cHMgc2hvdWxkIGJlIHJldHVybmVkIGFzIGB1bmRlZmluZWRgLFxuICAgIC8vICAgcmF0aGVyIHRoYW4gdGhlIGVtcHR5IHN0cmluZy5cbiAgICAvLyAtIGBsYXN0SW5kZXhgIHNob3VsZCBub3QgYmUgaW5jcmVtZW50ZWQgYWZ0ZXIgemVyby1sZW5ndGggbWF0Y2hlcy5cbiAgICBSZWdFeHAucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBtYXRjaCwgbmFtZSwgcjIsIG9yaWdMYXN0SW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5nbG9iYWwpXG4gICAgICAgICAgICBvcmlnTGFzdEluZGV4ID0gdGhpcy5sYXN0SW5kZXg7XG4gICAgICAgIG1hdGNoID0gbmF0aXYuZXhlYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIC8vIEZpeCBicm93c2VycyB3aG9zZSBgZXhlY2AgbWV0aG9kcyBkb24ndCBjb25zaXN0ZW50bHkgcmV0dXJuIGB1bmRlZmluZWRgIGZvclxuICAgICAgICAgICAgLy8gbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBzXG4gICAgICAgICAgICBpZiAoIWNvbXBsaWFudEV4ZWNOcGNnICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgaW5kZXhPZihtYXRjaCwgXCJcIikgPiAtMSkge1xuICAgICAgICAgICAgICAgIHIyID0gUmVnRXhwKHRoaXMuc291cmNlLCBuYXRpdi5yZXBsYWNlLmNhbGwoZ2V0TmF0aXZlRmxhZ3ModGhpcyksIFwiZ1wiLCBcIlwiKSk7XG4gICAgICAgICAgICAgICAgLy8gVXNpbmcgYHN0ci5zbGljZShtYXRjaC5pbmRleClgIHJhdGhlciB0aGFuIGBtYXRjaFswXWAgaW4gY2FzZSBsb29rYWhlYWQgYWxsb3dlZFxuICAgICAgICAgICAgICAgIC8vIG1hdGNoaW5nIGR1ZSB0byBjaGFyYWN0ZXJzIG91dHNpZGUgdGhlIG1hdGNoXG4gICAgICAgICAgICAgICAgbmF0aXYucmVwbGFjZS5jYWxsKChzdHIgKyBcIlwiKS5zbGljZShtYXRjaC5pbmRleCksIHIyLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBdHRhY2ggbmFtZWQgY2FwdHVyZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBpZiAodGhpcy5feHJlZ2V4cCAmJiB0aGlzLl94cmVnZXhwLmNhcHR1cmVOYW1lcykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbWF0Y2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHRoaXMuX3hyZWdleHAuY2FwdHVyZU5hbWVzW2kgLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgIG1hdGNoW25hbWVdID0gbWF0Y2hbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRml4IGJyb3dzZXJzIHRoYXQgaW5jcmVtZW50IGBsYXN0SW5kZXhgIGFmdGVyIHplcm8tbGVuZ3RoIG1hdGNoZXNcbiAgICAgICAgICAgIGlmICghY29tcGxpYW50TGFzdEluZGV4SW5jcmVtZW50ICYmIHRoaXMuZ2xvYmFsICYmICFtYXRjaFswXS5sZW5ndGggJiYgKHRoaXMubGFzdEluZGV4ID4gbWF0Y2guaW5kZXgpKVxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEluZGV4LS07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmdsb2JhbClcbiAgICAgICAgICAgIHRoaXMubGFzdEluZGV4ID0gb3JpZ0xhc3RJbmRleDsgLy8gRml4IElFLCBPcGVyYSBidWcgKGxhc3QgdGVzdGVkIElFIDkuMC41LCBPcGVyYSAxMS42MSBvbiBXaW5kb3dzKVxuICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfTtcblxuICAgIC8vIEZpeCBicm93c2VyIGJ1Z3MgaW4gbmF0aXZlIG1ldGhvZFxuICAgIFJlZ0V4cC5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgLy8gVXNlIHRoZSBuYXRpdmUgYGV4ZWNgIHRvIHNraXAgc29tZSBwcm9jZXNzaW5nIG92ZXJoZWFkLCBldmVuIHRob3VnaCB0aGUgYWx0ZXJlZFxuICAgICAgICAvLyBgZXhlY2Agd291bGQgdGFrZSBjYXJlIG9mIHRoZSBgbGFzdEluZGV4YCBmaXhlc1xuICAgICAgICB2YXIgbWF0Y2gsIG9yaWdMYXN0SW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5nbG9iYWwpXG4gICAgICAgICAgICBvcmlnTGFzdEluZGV4ID0gdGhpcy5sYXN0SW5kZXg7XG4gICAgICAgIG1hdGNoID0gbmF0aXYuZXhlYy5jYWxsKHRoaXMsIHN0cik7XG4gICAgICAgIC8vIEZpeCBicm93c2VycyB0aGF0IGluY3JlbWVudCBgbGFzdEluZGV4YCBhZnRlciB6ZXJvLWxlbmd0aCBtYXRjaGVzXG4gICAgICAgIGlmIChtYXRjaCAmJiAhY29tcGxpYW50TGFzdEluZGV4SW5jcmVtZW50ICYmIHRoaXMuZ2xvYmFsICYmICFtYXRjaFswXS5sZW5ndGggJiYgKHRoaXMubGFzdEluZGV4ID4gbWF0Y2guaW5kZXgpKVxuICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXgtLTtcbiAgICAgICAgaWYgKCF0aGlzLmdsb2JhbClcbiAgICAgICAgICAgIHRoaXMubGFzdEluZGV4ID0gb3JpZ0xhc3RJbmRleDsgLy8gRml4IElFLCBPcGVyYSBidWcgKGxhc3QgdGVzdGVkIElFIDkuMC41LCBPcGVyYSAxMS42MSBvbiBXaW5kb3dzKVxuICAgICAgICByZXR1cm4gISFtYXRjaDtcbiAgICB9O1xuXG4gICAgLy8gQWRkcyBuYW1lZCBjYXB0dXJlIHN1cHBvcnQgYW5kIGZpeGVzIGJyb3dzZXIgYnVncyBpbiBuYXRpdmUgbWV0aG9kXG4gICAgU3RyaW5nLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uIChyZWdleCkge1xuICAgICAgICBpZiAoIVhSZWdFeHAuaXNSZWdFeHAocmVnZXgpKVxuICAgICAgICAgICAgcmVnZXggPSBSZWdFeHAocmVnZXgpOyAvLyBOYXRpdmUgYFJlZ0V4cGBcbiAgICAgICAgaWYgKHJlZ2V4Lmdsb2JhbCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5hdGl2Lm1hdGNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSAwOyAvLyBGaXggSUUgYnVnXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWdleC5leGVjKHRoaXMpOyAvLyBSdW4gdGhlIGFsdGVyZWQgYGV4ZWNgXG4gICAgfTtcblxuICAgIC8vIEFkZHMgc3VwcG9ydCBmb3IgYCR7bn1gIHRva2VucyBmb3IgbmFtZWQgYW5kIG51bWJlcmVkIGJhY2tyZWZlcmVuY2VzIGluIHJlcGxhY2VtZW50IHRleHQsXG4gICAgLy8gYW5kIHByb3ZpZGVzIG5hbWVkIGJhY2tyZWZlcmVuY2VzIHRvIHJlcGxhY2VtZW50IGZ1bmN0aW9ucyBhcyBgYXJndW1lbnRzWzBdLm5hbWVgLiBBbHNvXG4gICAgLy8gZml4ZXMgY3Jvc3MtYnJvd3NlciBkaWZmZXJlbmNlcyBpbiByZXBsYWNlbWVudCB0ZXh0IHN5bnRheCB3aGVuIHBlcmZvcm1pbmcgYSByZXBsYWNlbWVudFxuICAgIC8vIHVzaW5nIGEgbm9ucmVnZXggc2VhcmNoIHZhbHVlLCBhbmQgdGhlIHZhbHVlIG9mIHJlcGxhY2VtZW50IHJlZ2V4ZXMnIGBsYXN0SW5kZXhgIHByb3BlcnR5XG4gICAgLy8gZHVyaW5nIHJlcGxhY2VtZW50IGl0ZXJhdGlvbnMuIE5vdGUgdGhhdCB0aGlzIGRvZXNuJ3Qgc3VwcG9ydCBTcGlkZXJNb25rZXkncyBwcm9wcmlldGFyeVxuICAgIC8vIHRoaXJkIChgZmxhZ3NgKSBwYXJhbWV0ZXJcbiAgICBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiAoc2VhcmNoLCByZXBsYWNlbWVudCkge1xuICAgICAgICB2YXIgaXNSZWdleCA9IFhSZWdFeHAuaXNSZWdFeHAoc2VhcmNoKSxcbiAgICAgICAgICAgIGNhcHR1cmVOYW1lcywgcmVzdWx0LCBzdHIsIG9yaWdMYXN0SW5kZXg7XG5cbiAgICAgICAgLy8gVGhlcmUgYXJlIHRvbyBtYW55IGNvbWJpbmF0aW9ucyBvZiBzZWFyY2gvcmVwbGFjZW1lbnQgdHlwZXMvdmFsdWVzIGFuZCBicm93c2VyIGJ1Z3MgdGhhdFxuICAgICAgICAvLyBwcmVjbHVkZSBwYXNzaW5nIHRvIG5hdGl2ZSBgcmVwbGFjZWAsIHNvIGRvbid0IHRyeVxuICAgICAgICAvL2lmICguLi4pXG4gICAgICAgIC8vICAgIHJldHVybiBuYXRpdi5yZXBsYWNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgaWYgKGlzUmVnZXgpIHtcbiAgICAgICAgICAgIGlmIChzZWFyY2guX3hyZWdleHApXG4gICAgICAgICAgICAgICAgY2FwdHVyZU5hbWVzID0gc2VhcmNoLl94cmVnZXhwLmNhcHR1cmVOYW1lczsgLy8gQXJyYXkgb3IgYG51bGxgXG4gICAgICAgICAgICBpZiAoIXNlYXJjaC5nbG9iYWwpXG4gICAgICAgICAgICAgICAgb3JpZ0xhc3RJbmRleCA9IHNlYXJjaC5sYXN0SW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWFyY2ggPSBzZWFyY2ggKyBcIlwiOyAvLyBUeXBlIGNvbnZlcnNpb25cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmVwbGFjZW1lbnQpID09PSBcIltvYmplY3QgRnVuY3Rpb25dXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5hdGl2LnJlcGxhY2UuY2FsbCh0aGlzICsgXCJcIiwgc2VhcmNoLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhcHR1cmVOYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGFuZ2UgdGhlIGBhcmd1bWVudHNbMF1gIHN0cmluZyBwcmltaXRpdmUgdG8gYSBTdHJpbmcgb2JqZWN0IHdoaWNoIGNhbiBzdG9yZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyBTdHJpbmcoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3RvcmUgbmFtZWQgYmFja3JlZmVyZW5jZXMgb24gYGFyZ3VtZW50c1swXWBcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXB0dXJlTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXB0dXJlTmFtZXNbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdW2NhcHR1cmVOYW1lc1tpXV0gPSBhcmd1bWVudHNbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBgbGFzdEluZGV4YCBiZWZvcmUgY2FsbGluZyBgcmVwbGFjZW1lbnRgIChmaXggYnJvd3NlcnMpXG4gICAgICAgICAgICAgICAgaWYgKGlzUmVnZXggJiYgc2VhcmNoLmdsb2JhbClcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLmxhc3RJbmRleCA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMl0gKyBhcmd1bWVudHNbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXBsYWNlbWVudC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHIgPSB0aGlzICsgXCJcIjsgLy8gVHlwZSBjb252ZXJzaW9uLCBzbyBgYXJnc1thcmdzLmxlbmd0aCAtIDFdYCB3aWxsIGJlIGEgc3RyaW5nIChnaXZlbiBub25zdHJpbmcgYHRoaXNgKVxuICAgICAgICAgICAgcmVzdWx0ID0gbmF0aXYucmVwbGFjZS5jYWxsKHN0ciwgc2VhcmNoLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7IC8vIEtlZXAgdGhpcyBmdW5jdGlvbidzIGBhcmd1bWVudHNgIGF2YWlsYWJsZSB0aHJvdWdoIGNsb3N1cmVcbiAgICAgICAgICAgICAgICByZXR1cm4gbmF0aXYucmVwbGFjZS5jYWxsKHJlcGxhY2VtZW50ICsgXCJcIiwgcmVwbGFjZW1lbnRUb2tlbiwgZnVuY3Rpb24gKCQwLCAkMSwgJDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTnVtYmVyZWQgYmFja3JlZmVyZW5jZSAod2l0aG91dCBkZWxpbWl0ZXJzKSBvciBzcGVjaWFsIHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgICAgIGlmICgkMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICgkMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCIkXCI6IHJldHVybiBcIiRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiJlwiOiByZXR1cm4gYXJnc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYFwiOiByZXR1cm4gYXJnc1thcmdzLmxlbmd0aCAtIDFdLnNsaWNlKDAsIGFyZ3NbYXJncy5sZW5ndGggLSAyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIidcIjogcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXS5zbGljZShhcmdzW2FyZ3MubGVuZ3RoIC0gMl0gKyBhcmdzWzBdLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTnVtYmVyZWQgYmFja3JlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdoYXQgZG9lcyBcIiQxMFwiIG1lYW4/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gQmFja3JlZmVyZW5jZSAxMCwgaWYgMTAgb3IgbW9yZSBjYXB0dXJpbmcgZ3JvdXBzIGV4aXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gQmFja3JlZmVyZW5jZSAxIGZvbGxvd2VkIGJ5IFwiMFwiLCBpZiAxLTkgY2FwdHVyaW5nIGdyb3VwcyBleGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIE90aGVyd2lzZSwgaXQncyB0aGUgc3RyaW5nIFwiJDEwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBub3RlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2VzIGNhbm5vdCBiZSBtb3JlIHRoYW4gdHdvIGRpZ2l0cyAoZW5mb3JjZWQgYnkgYHJlcGxhY2VtZW50VG9rZW5gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIFwiJDAxXCIgaXMgZXF1aXZhbGVudCB0byBcIiQxXCIgaWYgYSBjYXB0dXJpbmcgZ3JvdXAgZXhpc3RzLCBvdGhlcndpc2UgaXQncyB0aGUgc3RyaW5nIFwiJDAxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBUaGVyZSBpcyBubyBcIiQwXCIgdG9rZW4gKFwiJCZcIiBpcyB0aGUgZW50aXJlIG1hdGNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGl0ZXJhbE51bWJlcnMgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkMSA9ICskMTsgLy8gVHlwZSBjb252ZXJzaW9uOyBkcm9wIGxlYWRpbmcgemVyb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoISQxKSAvLyBgJDFgIHdhcyBcIjBcIiBvciBcIjAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCQxID4gYXJncy5sZW5ndGggLSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmFsTnVtYmVycyA9IFN0cmluZy5wcm90b3R5cGUuc2xpY2UuY2FsbCgkMSwgLTEpICsgbGl0ZXJhbE51bWJlcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkMSA9IE1hdGguZmxvb3IoJDEgLyAxMCk7IC8vIERyb3AgdGhlIGxhc3QgZGlnaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCQxID8gYXJnc1skMV0gfHwgXCJcIiA6IFwiJFwiKSArIGxpdGVyYWxOdW1iZXJzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBOYW1lZCBiYWNrcmVmZXJlbmNlIG9yIGRlbGltaXRlZCBudW1iZXJlZCBiYWNrcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXaGF0IGRvZXMgXCIke259XCIgbWVhbj9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gQmFja3JlZmVyZW5jZSB0byBudW1iZXJlZCBjYXB0dXJlIG4uIFR3byBkaWZmZXJlbmNlcyBmcm9tIFwiJG5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgLSBuIGNhbiBiZSBtb3JlIHRoYW4gdHdvIGRpZ2l0c1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAtIEJhY2tyZWZlcmVuY2UgMCBpcyBhbGxvd2VkLCBhbmQgaXMgdGhlIGVudGlyZSBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlIHRvIG5hbWVkIGNhcHR1cmUgbiwgaWYgaXQgZXhpc3RzIGFuZCBpcyBub3QgYSBudW1iZXIgb3ZlcnJpZGRlbiBieSBudW1iZXJlZCBjYXB0dXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtIE90aGVyd2lzZSwgaXQncyB0aGUgc3RyaW5nIFwiJHtufVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbiA9ICskMjsgLy8gVHlwZSBjb252ZXJzaW9uOyBkcm9wIGxlYWRpbmcgemVyb3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuIDw9IGFyZ3MubGVuZ3RoIC0gMylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJnc1tuXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4gPSBjYXB0dXJlTmFtZXMgPyBpbmRleE9mKGNhcHR1cmVOYW1lcywgJDIpIDogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbiA+IC0xID8gYXJnc1tuICsgMV0gOiAkMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNSZWdleCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaC5nbG9iYWwpXG4gICAgICAgICAgICAgICAgc2VhcmNoLmxhc3RJbmRleCA9IDA7IC8vIEZpeCBJRSwgU2FmYXJpIGJ1ZyAobGFzdCB0ZXN0ZWQgSUUgOS4wLjUsIFNhZmFyaSA1LjEuMiBvbiBXaW5kb3dzKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlYXJjaC5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4OyAvLyBGaXggSUUsIE9wZXJhIGJ1ZyAobGFzdCB0ZXN0ZWQgSUUgOS4wLjUsIE9wZXJhIDExLjYxIG9uIFdpbmRvd3MpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvLyBBIGNvbnNpc3RlbnQgY3Jvc3MtYnJvd3NlciwgRVMzIGNvbXBsaWFudCBgc3BsaXRgXG4gICAgU3RyaW5nLnByb3RvdHlwZS5zcGxpdCA9IGZ1bmN0aW9uIChzIC8qIHNlcGFyYXRvciAqLywgbGltaXQpIHtcbiAgICAgICAgLy8gSWYgc2VwYXJhdG9yIGBzYCBpcyBub3QgYSByZWdleCwgdXNlIHRoZSBuYXRpdmUgYHNwbGl0YFxuICAgICAgICBpZiAoIVhSZWdFeHAuaXNSZWdFeHAocykpXG4gICAgICAgICAgICByZXR1cm4gbmF0aXYuc3BsaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICB2YXIgc3RyID0gdGhpcyArIFwiXCIsIC8vIFR5cGUgY29udmVyc2lvblxuICAgICAgICAgICAgb3V0cHV0ID0gW10sXG4gICAgICAgICAgICBsYXN0TGFzdEluZGV4ID0gMCxcbiAgICAgICAgICAgIG1hdGNoLCBsYXN0TGVuZ3RoO1xuXG4gICAgICAgIC8vIEJlaGF2aW9yIGZvciBgbGltaXRgOiBpZiBpdCdzLi4uXG4gICAgICAgIC8vIC0gYHVuZGVmaW5lZGA6IE5vIGxpbWl0XG4gICAgICAgIC8vIC0gYE5hTmAgb3IgemVybzogUmV0dXJuIGFuIGVtcHR5IGFycmF5XG4gICAgICAgIC8vIC0gQSBwb3NpdGl2ZSBudW1iZXI6IFVzZSBgTWF0aC5mbG9vcihsaW1pdClgXG4gICAgICAgIC8vIC0gQSBuZWdhdGl2ZSBudW1iZXI6IE5vIGxpbWl0XG4gICAgICAgIC8vIC0gT3RoZXI6IFR5cGUtY29udmVydCwgdGhlbiB1c2UgdGhlIGFib3ZlIHJ1bGVzXG4gICAgICAgIGlmIChsaW1pdCA9PT0gdW5kZWZpbmVkIHx8ICtsaW1pdCA8IDApIHtcbiAgICAgICAgICAgIGxpbWl0ID0gSW5maW5pdHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaW1pdCA9IE1hdGguZmxvb3IoK2xpbWl0KTtcbiAgICAgICAgICAgIGlmICghbGltaXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBpcyByZXF1aXJlZCBpZiBub3QgYHMuZ2xvYmFsYCwgYW5kIGl0IGF2b2lkcyBuZWVkaW5nIHRvIHNldCBgcy5sYXN0SW5kZXhgIHRvIHplcm9cbiAgICAgICAgLy8gYW5kIHJlc3RvcmUgaXQgdG8gaXRzIG9yaWdpbmFsIHZhbHVlIHdoZW4gd2UncmUgZG9uZSB1c2luZyB0aGUgcmVnZXhcbiAgICAgICAgcyA9IFhSZWdFeHAuY29weUFzR2xvYmFsKHMpO1xuXG4gICAgICAgIHdoaWxlIChtYXRjaCA9IHMuZXhlYyhzdHIpKSB7IC8vIFJ1biB0aGUgYWx0ZXJlZCBgZXhlY2AgKHJlcXVpcmVkIGZvciBgbGFzdEluZGV4YCBmaXgsIGV0Yy4pXG4gICAgICAgICAgICBpZiAocy5sYXN0SW5kZXggPiBsYXN0TGFzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goc3RyLnNsaWNlKGxhc3RMYXN0SW5kZXgsIG1hdGNoLmluZGV4KSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaC5pbmRleCA8IHN0ci5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KG91dHB1dCwgbWF0Y2guc2xpY2UoMSkpO1xuXG4gICAgICAgICAgICAgICAgbGFzdExlbmd0aCA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsYXN0TGFzdEluZGV4ID0gcy5sYXN0SW5kZXg7XG5cbiAgICAgICAgICAgICAgICBpZiAob3V0cHV0Lmxlbmd0aCA+PSBsaW1pdClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzLmxhc3RJbmRleCA9PT0gbWF0Y2guaW5kZXgpXG4gICAgICAgICAgICAgICAgcy5sYXN0SW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYXN0TGFzdEluZGV4ID09PSBzdHIubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoIW5hdGl2LnRlc3QuY2FsbChzLCBcIlwiKSB8fCBsYXN0TGVuZ3RoKVxuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goc3RyLnNsaWNlKGxhc3RMYXN0SW5kZXgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXRwdXQubGVuZ3RoID4gbGltaXQgPyBvdXRwdXQuc2xpY2UoMCwgbGltaXQpIDogb3V0cHV0O1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFByaXZhdGUgaGVscGVyIGZ1bmN0aW9uc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBTdXBwb3J0aW5nIGZ1bmN0aW9uIGZvciBgWFJlZ0V4cGAsIGBYUmVnRXhwLmNvcHlBc0dsb2JhbGAsIGV0Yy4gUmV0dXJucyBhIGNvcHkgb2YgYSBgUmVnRXhwYFxuICAgIC8vIGluc3RhbmNlIHdpdGggYSBmcmVzaCBgbGFzdEluZGV4YCAoc2V0IHRvIHplcm8pLCBwcmVzZXJ2aW5nIHByb3BlcnRpZXMgcmVxdWlyZWQgZm9yIG5hbWVkXG4gICAgLy8gY2FwdHVyZS4gQWxzbyBhbGxvd3MgYWRkaW5nIG5ldyBmbGFncyBpbiB0aGUgcHJvY2VzcyBvZiBjb3B5aW5nIHRoZSByZWdleFxuICAgIGZ1bmN0aW9uIGNsb25lIChyZWdleCwgYWRkaXRpb25hbEZsYWdzKSB7XG4gICAgICAgIGlmICghWFJlZ0V4cC5pc1JlZ0V4cChyZWdleCkpXG4gICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJ0eXBlIFJlZ0V4cCBleHBlY3RlZFwiKTtcbiAgICAgICAgdmFyIHggPSByZWdleC5feHJlZ2V4cDtcbiAgICAgICAgcmVnZXggPSBYUmVnRXhwKHJlZ2V4LnNvdXJjZSwgZ2V0TmF0aXZlRmxhZ3MocmVnZXgpICsgKGFkZGl0aW9uYWxGbGFncyB8fCBcIlwiKSk7XG4gICAgICAgIGlmICh4KSB7XG4gICAgICAgICAgICByZWdleC5feHJlZ2V4cCA9IHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHguc291cmNlLFxuICAgICAgICAgICAgICAgIGNhcHR1cmVOYW1lczogeC5jYXB0dXJlTmFtZXMgPyB4LmNhcHR1cmVOYW1lcy5zbGljZSgwKSA6IG51bGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZ2V4O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE5hdGl2ZUZsYWdzIChyZWdleCkge1xuICAgICAgICByZXR1cm4gKHJlZ2V4Lmdsb2JhbCAgICAgPyBcImdcIiA6IFwiXCIpICtcbiAgICAgICAgICAgICAgIChyZWdleC5pZ25vcmVDYXNlID8gXCJpXCIgOiBcIlwiKSArXG4gICAgICAgICAgICAgICAocmVnZXgubXVsdGlsaW5lICA/IFwibVwiIDogXCJcIikgK1xuICAgICAgICAgICAgICAgKHJlZ2V4LmV4dGVuZGVkICAgPyBcInhcIiA6IFwiXCIpICsgLy8gUHJvcG9zZWQgZm9yIEVTNDsgaW5jbHVkZWQgaW4gQVMzXG4gICAgICAgICAgICAgICAocmVnZXguc3RpY2t5ICAgICA/IFwieVwiIDogXCJcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuVG9rZW5zIChwYXR0ZXJuLCBpbmRleCwgc2NvcGUsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGkgPSB0b2tlbnMubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0LCBtYXRjaCwgdDtcbiAgICAgICAgLy8gUHJvdGVjdCBhZ2FpbnN0IGNvbnN0cnVjdGluZyBYUmVnRXhwcyB3aXRoaW4gdG9rZW4gaGFuZGxlciBhbmQgdHJpZ2dlciBmdW5jdGlvbnNcbiAgICAgICAgaXNJbnNpZGVDb25zdHJ1Y3RvciA9IHRydWU7XG4gICAgICAgIC8vIE11c3QgcmVzZXQgYGlzSW5zaWRlQ29uc3RydWN0b3JgLCBldmVuIGlmIGEgYHRyaWdnZXJgIG9yIGBoYW5kbGVyYCB0aHJvd3NcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHsgLy8gUnVuIGluIHJldmVyc2Ugb3JkZXJcbiAgICAgICAgICAgICAgICB0ID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgICAgIGlmICgoc2NvcGUgJiB0LnNjb3BlKSAmJiAoIXQudHJpZ2dlciB8fCB0LnRyaWdnZXIuY2FsbChjb250ZXh0KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5wYXR0ZXJuLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IHQucGF0dGVybi5leGVjKHBhdHRlcm4pOyAvLyBSdW5uaW5nIHRoZSBhbHRlcmVkIGBleGVjYCBoZXJlIGFsbG93cyB1c2Ugb2YgbmFtZWQgYmFja3JlZmVyZW5jZXMsIGV0Yy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogdC5oYW5kbGVyLmNhbGwoY29udGV4dCwgbWF0Y2gsIHNjb3BlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpc0luc2lkZUNvbnN0cnVjdG9yID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbmRleE9mIChhcnJheSwgaXRlbSwgZnJvbSkge1xuICAgICAgICBpZiAoQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIC8vIFVzZSB0aGUgbmF0aXZlIGFycmF5IG1ldGhvZCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0sIGZyb20pO1xuICAgICAgICBmb3IgKHZhciBpID0gZnJvbSB8fCAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSlcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBCdWlsdC1pbiB0b2tlbnNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gQXVnbWVudCBYUmVnRXhwJ3MgcmVndWxhciBleHByZXNzaW9uIHN5bnRheCBhbmQgZmxhZ3MuIE5vdGUgdGhhdCB3aGVuIGFkZGluZyB0b2tlbnMsIHRoZVxuICAgIC8vIHRoaXJkIChgc2NvcGVgKSBhcmd1bWVudCBkZWZhdWx0cyB0byBgWFJlZ0V4cC5PVVRTSURFX0NMQVNTYFxuXG4gICAgLy8gQ29tbWVudCBwYXR0ZXJuOiAoPyMgKVxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXChcXD8jW14pXSpcXCkvLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgdG9rZW5zIHNlcGFyYXRlZCB1bmxlc3MgdGhlIGZvbGxvd2luZyB0b2tlbiBpcyBhIHF1YW50aWZpZXJcbiAgICAgICAgICAgIHJldHVybiBuYXRpdi50ZXN0LmNhbGwocXVhbnRpZmllciwgbWF0Y2guaW5wdXQuc2xpY2UobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpKSA/IFwiXCIgOiBcIig/OilcIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBDYXB0dXJpbmcgZ3JvdXAgKG1hdGNoIHRoZSBvcGVuaW5nIHBhcmVudGhlc2lzIG9ubHkpLlxuICAgIC8vIFJlcXVpcmVkIGZvciBzdXBwb3J0IG9mIG5hbWVkIGNhcHR1cmluZyBncm91cHNcbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFwoKD8hXFw/KS8sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FwdHVyZU5hbWVzLnB1c2gobnVsbCk7XG4gICAgICAgICAgICByZXR1cm4gXCIoXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTmFtZWQgY2FwdHVyaW5nIGdyb3VwIChtYXRjaCB0aGUgb3BlbmluZyBkZWxpbWl0ZXIgb25seSk6ICg/PG5hbWU+XG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcKFxcPzwoWyRcXHddKyk+LyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICB0aGlzLmNhcHR1cmVOYW1lcy5wdXNoKG1hdGNoWzFdKTtcbiAgICAgICAgICAgIHRoaXMuaGFzTmFtZWRDYXB0dXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBcIihcIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBOYW1lZCBiYWNrcmVmZXJlbmNlOiBcXGs8bmFtZT5cbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFxcXGs8KFtcXHckXSspPi8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5kZXhPZih0aGlzLmNhcHR1cmVOYW1lcywgbWF0Y2hbMV0pO1xuICAgICAgICAgICAgLy8gS2VlcCBiYWNrcmVmZXJlbmNlcyBzZXBhcmF0ZSBmcm9tIHN1YnNlcXVlbnQgbGl0ZXJhbCBudW1iZXJzLiBQcmVzZXJ2ZSBiYWNrLVxuICAgICAgICAgICAgLy8gcmVmZXJlbmNlcyB0byBuYW1lZCBncm91cHMgdGhhdCBhcmUgdW5kZWZpbmVkIGF0IHRoaXMgcG9pbnQgYXMgbGl0ZXJhbCBzdHJpbmdzXG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPiAtMSA/XG4gICAgICAgICAgICAgICAgXCJcXFxcXCIgKyAoaW5kZXggKyAxKSArIChpc05hTihtYXRjaC5pbnB1dC5jaGFyQXQobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpKSA/IFwiXCIgOiBcIig/OilcIikgOlxuICAgICAgICAgICAgICAgIG1hdGNoWzBdO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIEVtcHR5IGNoYXJhY3RlciBjbGFzczogW10gb3IgW15dXG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcW1xcXj9dLyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAvLyBGb3IgY3Jvc3MtYnJvd3NlciBjb21wYXRpYmlsaXR5IHdpdGggRVMzLCBjb252ZXJ0IFtdIHRvIFxcYlxcQiBhbmQgW15dIHRvIFtcXHNcXFNdLlxuICAgICAgICAgICAgLy8gKD8hKSBzaG91bGQgd29yayBsaWtlIFxcYlxcQiwgYnV0IGlzIHVucmVsaWFibGUgaW4gRmlyZWZveFxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzBdID09PSBcIltdXCIgPyBcIlxcXFxiXFxcXEJcIiA6IFwiW1xcXFxzXFxcXFNdXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTW9kZSBtb2RpZmllciBhdCB0aGUgc3RhcnQgb2YgdGhlIHBhdHRlcm4gb25seSwgd2l0aCBhbnkgY29tYmluYXRpb24gb2YgZmxhZ3MgaW1zeDogKD9pbXN4KVxuICAgIC8vIERvZXMgbm90IHN1cHBvcnQgeCg/aSksICg/LWkpLCAoP2ktbSksICg/aTogKSwgKD9pKSg/bSksIGV0Yy5cbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXlxcKFxcPyhbaW1zeF0rKVxcKS8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgdGhpcy5zZXRGbGFnKG1hdGNoWzFdKTtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIFdoaXRlc3BhY2UgYW5kIGNvbW1lbnRzLCBpbiBmcmVlLXNwYWNpbmcgKGFrYSBleHRlbmRlZCkgbW9kZSBvbmx5XG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgLyg/Olxccyt8Iy4qKSsvLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgdG9rZW5zIHNlcGFyYXRlZCB1bmxlc3MgdGhlIGZvbGxvd2luZyB0b2tlbiBpcyBhIHF1YW50aWZpZXJcbiAgICAgICAgICAgIHJldHVybiBuYXRpdi50ZXN0LmNhbGwocXVhbnRpZmllciwgbWF0Y2guaW5wdXQuc2xpY2UobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpKSA/IFwiXCIgOiBcIig/OilcIjtcbiAgICAgICAgfSxcbiAgICAgICAgWFJlZ0V4cC5PVVRTSURFX0NMQVNTLFxuICAgICAgICBmdW5jdGlvbiAoKSB7cmV0dXJuIHRoaXMuaGFzRmxhZyhcInhcIik7fVxuICAgICk7XG5cbiAgICAvLyBEb3QsIGluIGRvdGFsbCAoYWthIHNpbmdsZWxpbmUpIG1vZGUgb25seVxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXC4vLFxuICAgICAgICBmdW5jdGlvbiAoKSB7cmV0dXJuIFwiW1xcXFxzXFxcXFNdXCI7fSxcbiAgICAgICAgWFJlZ0V4cC5PVVRTSURFX0NMQVNTLFxuICAgICAgICBmdW5jdGlvbiAoKSB7cmV0dXJuIHRoaXMuaGFzRmxhZyhcInNcIik7fVxuICAgICk7XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIEJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gVW5jb21tZW50IHRoZSBmb2xsb3dpbmcgYmxvY2sgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBYUmVnRXhwIDEuMC0xLjI6XG4gICAgLypcbiAgICBYUmVnRXhwLm1hdGNoV2l0aGluQ2hhaW4gPSBYUmVnRXhwLm1hdGNoQ2hhaW47XG4gICAgUmVnRXhwLnByb3RvdHlwZS5hZGRGbGFncyA9IGZ1bmN0aW9uIChzKSB7cmV0dXJuIGNsb25lKHRoaXMsIHMpO307XG4gICAgUmVnRXhwLnByb3RvdHlwZS5leGVjQWxsID0gZnVuY3Rpb24gKHMpIHt2YXIgciA9IFtdOyBYUmVnRXhwLml0ZXJhdGUocywgdGhpcywgZnVuY3Rpb24gKG0pIHtyLnB1c2gobSk7fSk7IHJldHVybiByO307XG4gICAgUmVnRXhwLnByb3RvdHlwZS5mb3JFYWNoRXhlYyA9IGZ1bmN0aW9uIChzLCBmLCBjKSB7cmV0dXJuIFhSZWdFeHAuaXRlcmF0ZShzLCB0aGlzLCBmLCBjKTt9O1xuICAgIFJlZ0V4cC5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAocykge3ZhciByID0gUmVnRXhwKFwiXig/OlwiICsgdGhpcy5zb3VyY2UgKyBcIikkKD8hXFxcXHMpXCIsIGdldE5hdGl2ZUZsYWdzKHRoaXMpKTsgaWYgKHRoaXMuZ2xvYmFsKSB0aGlzLmxhc3RJbmRleCA9IDA7IHJldHVybiBzLnNlYXJjaChyKSA9PT0gMDt9O1xuICAgICovXG5cbn0pKCk7XG5cblxubW9kdWxlLmV4cG9ydHMuWFJlZ0V4cCA9IFhSZWdFeHA7IiwidmFyIFhSZWdFeHAgPSByZXF1aXJlKFwiLi9YUmVnRXhwXCIpLlhSZWdFeHA7XG52YXIgY2xhc3NOYW1lLFxuICAgZ3V0dGVyO1xuLy9cbi8vIEJlZ2luIGFub255bW91cyBmdW5jdGlvbi4gVGhpcyBpcyB1c2VkIHRvIGNvbnRhaW4gbG9jYWwgc2NvcGUgdmFyaWFibGVzIHdpdGhvdXQgcG9sdXR0aW5nIGdsb2JhbCBzY29wZS5cbi8vXG52YXIgU3ludGF4SGlnaGxpZ2h0ZXIgPSBmdW5jdGlvbigpIHsgXG5cbi8vIENvbW1vbkpTXG5pZiAodHlwZW9mKHJlcXVpcmUpICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZihYUmVnRXhwKSA9PSAndW5kZWZpbmVkJylcbntcbi8vIE5vIG9wIHNpbmNlIHJlcXVpcmVkIHByb3Blcmx5IGF0IHRvcCBvZiBmaWxlXG5cbn1cblxuLy8gU2hvcnRjdXQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIFN5bnRheEhpZ2hsaWdodGVyIHZhcmlhYmxlLlxuLy8gVGhpcyBpcyBhIHNob3J0aGFuZCBmb3IgbG9jYWwgcmVmZXJlbmNlIGluIG9yZGVyIHRvIGF2b2lkIGxvbmcgbmFtZXNwYWNlIFxuLy8gcmVmZXJlbmNlcyB0byBTeW50YXhIaWdobGlnaHRlci53aGF0ZXZlci4uLlxudmFyIHNoID0ge1xuXHRkZWZhdWx0cyA6IHtcblx0XHQvKiogQWRkaXRpb25hbCBDU1MgY2xhc3MgbmFtZXMgdG8gYmUgYWRkZWQgdG8gaGlnaGxpZ2h0ZXIgZWxlbWVudHMuICovXG5cdFx0J2NsYXNzLW5hbWUnIDogJycsXG5cdFx0XG5cdFx0LyoqIEZpcnN0IGxpbmUgbnVtYmVyLiAqL1xuXHRcdCdmaXJzdC1saW5lJyA6IDEsXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogUGFkcyBsaW5lIG51bWJlcnMuIFBvc3NpYmxlIHZhbHVlcyBhcmU6XG5cdFx0ICpcblx0XHQgKiAgIGZhbHNlIC0gZG9uJ3QgcGFkIGxpbmUgbnVtYmVycy5cblx0XHQgKiAgIHRydWUgIC0gYXV0b21hdGljYWx5IHBhZCBudW1iZXJzIHdpdGggbWluaW11bSByZXF1aXJlZCBudW1iZXIgb2YgbGVhZGluZyB6ZXJvZXMuXG5cdFx0ICogICBbaW50XSAtIGxlbmd0aCB1cCB0byB3aGljaCBwYWQgbGluZSBudW1iZXJzLlxuXHRcdCAqL1xuXHRcdCdwYWQtbGluZS1udW1iZXJzJyA6IGZhbHNlLFxuXHRcdFxuXHRcdC8qKiBMaW5lcyB0byBoaWdobGlnaHQuICovXG5cdFx0J2hpZ2hsaWdodCcgOiBudWxsLFxuXHRcdFxuXHRcdC8qKiBUaXRsZSB0byBiZSBkaXNwbGF5ZWQgYWJvdmUgdGhlIGNvZGUgYmxvY2suICovXG5cdFx0J3RpdGxlJyA6IG51bGwsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgc21hcnQgdGFicy4gKi9cblx0XHQnc21hcnQtdGFicycgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBHZXRzIG9yIHNldHMgdGFiIHNpemUuICovXG5cdFx0J3RhYi1zaXplJyA6IDQsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgZ3V0dGVyLiAqL1xuXHRcdCdndXR0ZXInIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBvciBkaXNhYmxlcyB0b29sYmFyLiAqL1xuXHRcdCd0b29sYmFyJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgcXVpY2sgY29kZSBjb3B5IGFuZCBwYXN0ZSBmcm9tIGRvdWJsZSBjbGljay4gKi9cblx0XHQncXVpY2stY29kZScgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBGb3JjZXMgY29kZSB2aWV3IHRvIGJlIGNvbGxhcHNlZC4gKi9cblx0XHQnY29sbGFwc2UnIDogZmFsc2UsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgYXV0b21hdGljIGxpbmtzLiAqL1xuXHRcdCdhdXRvLWxpbmtzJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEdldHMgb3Igc2V0cyBsaWdodCBtb2RlLiBFcXVhdmFsZW50IHRvIHR1cm5pbmcgb2ZmIGd1dHRlciBhbmQgdG9vbGJhci4gKi9cblx0XHQnbGlnaHQnIDogZmFsc2UsXG5cblx0XHQndW5pbmRlbnQnIDogdHJ1ZSxcblx0XHRcblx0XHQnaHRtbC1zY3JpcHQnIDogZmFsc2Vcblx0fSxcblx0XG5cdGNvbmZpZyA6IHtcblx0XHRzcGFjZSA6ICcmbmJzcDsnLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIHVzZSBvZiA8U0NSSVBUIHR5cGU9XCJzeW50YXhoaWdobGlnaHRlclwiIC8+IHRhZ3MuICovXG5cdFx0dXNlU2NyaXB0VGFncyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEJsb2dnZXIgbW9kZSBmbGFnLiAqL1xuXHRcdGJsb2dnZXJNb2RlIDogZmFsc2UsXG5cdFx0XG5cdFx0c3RyaXBCcnMgOiBmYWxzZSxcblx0XHRcblx0XHQvKiogTmFtZSBvZiB0aGUgdGFnIHRoYXQgU3ludGF4SGlnaGxpZ2h0ZXIgd2lsbCBhdXRvbWF0aWNhbGx5IGxvb2sgZm9yLiAqL1xuXHRcdHRhZ05hbWUgOiAncHJlJyxcblx0XHRcblx0XHRzdHJpbmdzIDoge1xuXHRcdFx0ZXhwYW5kU291cmNlIDogJ2V4cGFuZCBzb3VyY2UnLFxuXHRcdFx0aGVscCA6ICc/Jyxcblx0XHRcdGFsZXJ0OiAnU3ludGF4SGlnaGxpZ2h0ZXJcXG5cXG4nLFxuXHRcdFx0bm9CcnVzaCA6ICdDYW5cXCd0IGZpbmQgYnJ1c2ggZm9yOiAnLFxuXHRcdFx0YnJ1c2hOb3RIdG1sU2NyaXB0IDogJ0JydXNoIHdhc25cXCd0IGNvbmZpZ3VyZWQgZm9yIGh0bWwtc2NyaXB0IG9wdGlvbjogJyxcblx0XHRcdFxuXHRcdFx0Ly8gdGhpcyBpcyBwb3B1bGF0ZWQgYnkgdGhlIGJ1aWxkIHNjcmlwdFxuXHRcdFx0YWJvdXREaWFsb2cgOiAnQEFCT1VUQCdcblx0XHR9XG5cdH0sXG5cdFxuXHQvKiogSW50ZXJuYWwgJ2dsb2JhbCcgdmFyaWFibGVzLiAqL1xuXHR2YXJzIDoge1xuXHRcdGRpc2NvdmVyZWRCcnVzaGVzIDogbnVsbCxcblx0XHRoaWdobGlnaHRlcnMgOiB7fVxuXHR9LFxuXHRcblx0LyoqIFRoaXMgb2JqZWN0IGlzIHBvcHVsYXRlZCBieSB1c2VyIGluY2x1ZGVkIGV4dGVybmFsIGJydXNoIGZpbGVzLiAqL1xuXHRicnVzaGVzIDoge30sXG5cblx0LyoqIENvbW1vbiByZWd1bGFyIGV4cHJlc3Npb25zLiAqL1xuXHRyZWdleExpYiA6IHtcblx0XHRtdWx0aUxpbmVDQ29tbWVudHNcdFx0XHQ6IC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2dtLFxuXHRcdHNpbmdsZUxpbmVDQ29tbWVudHNcdFx0XHQ6IC9cXC9cXC8uKiQvZ20sXG5cdFx0c2luZ2xlTGluZVBlcmxDb21tZW50c1x0XHQ6IC8jLiokL2dtLFxuXHRcdGRvdWJsZVF1b3RlZFN0cmluZ1x0XHRcdDogL1wiKFteXFxcXFwiXFxuXXxcXFxcLikqXCIvZyxcblx0XHRzaW5nbGVRdW90ZWRTdHJpbmdcdFx0XHQ6IC8nKFteXFxcXCdcXG5dfFxcXFwuKSonL2csXG5cdFx0bXVsdGlMaW5lRG91YmxlUXVvdGVkU3RyaW5nXHQ6IG5ldyBYUmVnRXhwKCdcIihbXlxcXFxcXFxcXCJdfFxcXFxcXFxcLikqXCInLCAnZ3MnKSxcblx0XHRtdWx0aUxpbmVTaW5nbGVRdW90ZWRTdHJpbmdcdDogbmV3IFhSZWdFeHAoXCInKFteXFxcXFxcXFwnXXxcXFxcXFxcXC4pKidcIiwgJ2dzJyksXG5cdFx0eG1sQ29tbWVudHNcdFx0XHRcdFx0OiAvKCZsdDt8PCkhLS1bXFxzXFxTXSo/LS0oJmd0O3w+KS9nbSxcblx0XHR1cmxcdFx0XHRcdFx0XHRcdDogL1xcdys6XFwvXFwvW1xcdy0uXFwvPyUmPTpAOyNdKi9nLFxuXHRcdFxuXHRcdC8qKiA8Pz0gPz4gdGFncy4gKi9cblx0XHRwaHBTY3JpcHRUYWdzIFx0XHRcdFx0OiB7IGxlZnQ6IC8oJmx0O3w8KVxcPyg/Oj18cGhwKT8vZywgcmlnaHQ6IC9cXD8oJmd0O3w+KS9nLCAnZW9mJyA6IHRydWUgfSxcblx0XHRcblx0XHQvKiogPCU9ICU+IHRhZ3MuICovXG5cdFx0YXNwU2NyaXB0VGFnc1x0XHRcdFx0OiB7IGxlZnQ6IC8oJmx0O3w8KSU9Py9nLCByaWdodDogLyUoJmd0O3w+KS9nIH0sXG5cdFx0XG5cdFx0LyoqIDxzY3JpcHQ+IHRhZ3MuICovXG5cdFx0c2NyaXB0U2NyaXB0VGFnc1x0XHRcdDogeyBsZWZ0OiAvKCZsdDt8PClcXHMqc2NyaXB0Lio/KCZndDt8PikvZ2ksIHJpZ2h0OiAvKCZsdDt8PClcXC9cXHMqc2NyaXB0XFxzKigmZ3Q7fD4pL2dpIH1cblx0fSxcblxuXHR0b29sYmFyOiB7XG5cdFx0LyoqXG5cdFx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciB0aGUgdG9vbGJhci5cblx0XHQgKiBAcGFyYW0ge0hpZ2hsaWdodGVyfSBoaWdobGlnaHRlciBIaWdobGlnaHRlciBpbnN0YW5jZS5cblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdFx0ICovXG5cdFx0Z2V0SHRtbDogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIpXG5cdFx0e1xuXHRcdFx0dmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cInRvb2xiYXJcIj4nLFxuXHRcdFx0XHRpdGVtcyA9IHNoLnRvb2xiYXIuaXRlbXMsXG5cdFx0XHRcdGxpc3QgPSBpdGVtcy5saXN0XG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0ZnVuY3Rpb24gZGVmYXVsdEdldEh0bWwoaGlnaGxpZ2h0ZXIsIG5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzaC50b29sYmFyLmdldEJ1dHRvbkh0bWwoaGlnaGxpZ2h0ZXIsIG5hbWUsIHNoLmNvbmZpZy5zdHJpbmdzW25hbWVdKTtcblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKylcblx0XHRcdFx0aHRtbCArPSAoaXRlbXNbbGlzdFtpXV0uZ2V0SHRtbCB8fCBkZWZhdWx0R2V0SHRtbCkoaGlnaGxpZ2h0ZXIsIGxpc3RbaV0pO1xuXHRcdFx0XG5cdFx0XHRodG1sICs9ICc8L2Rpdj4nO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gaHRtbDtcblx0XHR9LFxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgYSByZWd1bGFyIGJ1dHRvbiBpbiB0aGUgdG9vbGJhci5cblx0XHQgKiBAcGFyYW0ge0hpZ2hsaWdodGVyfSBoaWdobGlnaHRlciBIaWdobGlnaHRlciBpbnN0YW5jZS5cblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gY29tbWFuZE5hbWVcdFx0Q29tbWFuZCBuYW1lIHRoYXQgd291bGQgYmUgZXhlY3V0ZWQuXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsXHRcdFx0TGFiZWwgdGV4dCB0byBkaXNwbGF5LlxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRcdFx0UmV0dXJucyBIVE1MIG1hcmt1cC5cblx0XHQgKi9cblx0XHRnZXRCdXR0b25IdG1sOiBmdW5jdGlvbihoaWdobGlnaHRlciwgY29tbWFuZE5hbWUsIGxhYmVsKVxuXHRcdHtcblx0XHRcdHJldHVybiAnPHNwYW4+PGEgaHJlZj1cIiNcIiBjbGFzcz1cInRvb2xiYXJfaXRlbSdcblx0XHRcdFx0KyAnIGNvbW1hbmRfJyArIGNvbW1hbmROYW1lXG5cdFx0XHRcdCsgJyAnICsgY29tbWFuZE5hbWVcblx0XHRcdFx0KyAnXCI+JyArIGxhYmVsICsgJzwvYT48L3NwYW4+J1xuXHRcdFx0XHQ7XG5cdFx0fSxcblx0XHRcblx0XHQvKipcblx0XHQgKiBFdmVudCBoYW5kbGVyIGZvciBhIHRvb2xiYXIgYW5jaG9yLlxuXHRcdCAqL1xuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKGUpXG5cdFx0e1xuXHRcdFx0dmFyIHRhcmdldCA9IGUudGFyZ2V0LFxuXHRcdFx0XHRjbGFzc05hbWUgPSB0YXJnZXQuY2xhc3NOYW1lIHx8ICcnXG5cdFx0XHRcdDtcblxuXHRcdFx0ZnVuY3Rpb24gZ2V0VmFsdWUobmFtZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHIgPSBuZXcgUmVnRXhwKG5hbWUgKyAnXyhcXFxcdyspJyksXG5cdFx0XHRcdFx0bWF0Y2ggPSByLmV4ZWMoY2xhc3NOYW1lKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IG51bGw7XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHR2YXIgaGlnaGxpZ2h0ZXIgPSBnZXRIaWdobGlnaHRlckJ5SWQoZmluZFBhcmVudEVsZW1lbnQodGFyZ2V0LCAnLnN5bnRheGhpZ2hsaWdodGVyJykuaWQpLFxuXHRcdFx0XHRjb21tYW5kTmFtZSA9IGdldFZhbHVlKCdjb21tYW5kJylcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHQvLyBleGVjdXRlIHRoZSB0b29sYmFyIGNvbW1hbmRcblx0XHRcdGlmIChoaWdobGlnaHRlciAmJiBjb21tYW5kTmFtZSlcblx0XHRcdFx0c2gudG9vbGJhci5pdGVtc1tjb21tYW5kTmFtZV0uZXhlY3V0ZShoaWdobGlnaHRlcik7XG5cblx0XHRcdC8vIGRpc2FibGUgZGVmYXVsdCBBIGNsaWNrIGJlaGF2aW91clxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH0sXG5cdFx0XG5cdFx0LyoqIENvbGxlY3Rpb24gb2YgdG9vbGJhciBpdGVtcy4gKi9cblx0XHRpdGVtcyA6IHtcblx0XHRcdC8vIE9yZGVyZWQgbGlzIG9mIGl0ZW1zIGluIHRoZSB0b29sYmFyLiBDYW4ndCBleHBlY3QgYGZvciAodmFyIG4gaW4gaXRlbXMpYCB0byBiZSBjb25zaXN0ZW50LlxuXHRcdFx0bGlzdDogWydleHBhbmRTb3VyY2UnLCAnaGVscCddLFxuXG5cdFx0XHRleHBhbmRTb3VyY2U6IHtcblx0XHRcdFx0Z2V0SHRtbDogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoaGlnaGxpZ2h0ZXIuZ2V0UGFyYW0oJ2NvbGxhcHNlJykgIT0gdHJ1ZSlcblx0XHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhciB0aXRsZSA9IGhpZ2hsaWdodGVyLmdldFBhcmFtKCd0aXRsZScpO1xuXHRcdFx0XHRcdHJldHVybiBzaC50b29sYmFyLmdldEJ1dHRvbkh0bWwoaGlnaGxpZ2h0ZXIsICdleHBhbmRTb3VyY2UnLCB0aXRsZSA/IHRpdGxlIDogc2guY29uZmlnLnN0cmluZ3MuZXhwYW5kU291cmNlKTtcblx0XHRcdFx0fSxcblx0XHRcdFxuXHRcdFx0XHRleGVjdXRlOiBmdW5jdGlvbihoaWdobGlnaHRlcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBkaXYgPSBnZXRIaWdobGlnaHRlckRpdkJ5SWQoaGlnaGxpZ2h0ZXIuaWQpO1xuXHRcdFx0XHRcdHJlbW92ZUNsYXNzKGRpdiwgJ2NvbGxhcHNlZCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHQvKiogQ29tbWFuZCB0byBkaXNwbGF5IHRoZSBhYm91dCBkaWFsb2cgd2luZG93LiAqL1xuXHRcdFx0aGVscDoge1xuXHRcdFx0XHRleGVjdXRlOiBmdW5jdGlvbihoaWdobGlnaHRlcilcblx0XHRcdFx0e1x0XG5cdFx0XHRcdFx0dmFyIHduZCA9IHBvcHVwKCcnLCAnX2JsYW5rJywgNTAwLCAyNTAsICdzY3JvbGxiYXJzPTAnKSxcblx0XHRcdFx0XHRcdGRvYyA9IHduZC5kb2N1bWVudFxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRvYy53cml0ZShzaC5jb25maWcuc3RyaW5ncy5hYm91dERpYWxvZyk7XG5cdFx0XHRcdFx0ZG9jLmNsb3NlKCk7XG5cdFx0XHRcdFx0d25kLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEZpbmRzIGFsbCBlbGVtZW50cyBvbiB0aGUgcGFnZSB3aGljaCBzaG91bGQgYmUgcHJvY2Vzc2VzIGJ5IFN5bnRheEhpZ2hsaWdodGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZ2xvYmFsUGFyYW1zXHRcdE9wdGlvbmFsIHBhcmFtZXRlcnMgd2hpY2ggb3ZlcnJpZGUgZWxlbWVudCdzIFxuXHQgKiBcdFx0XHRcdFx0XHRcdFx0XHRwYXJhbWV0ZXJzLiBPbmx5IHVzZWQgaWYgZWxlbWVudCBpcyBzcGVjaWZpZWQuXG5cdCAqIFxuXHQgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFx0T3B0aW9uYWwgZWxlbWVudCB0byBoaWdobGlnaHQuIElmIG5vbmUgaXNcblx0ICogXHRcdFx0XHRcdFx0XHRwcm92aWRlZCwgYWxsIGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IGRvY3VtZW50IFxuXHQgKiBcdFx0XHRcdFx0XHRcdGFyZSByZXR1cm5lZCB3aGljaCBxdWFsaWZ5LlxuXHQgKlxuXHQgKiBAcmV0dXJuIHtBcnJheX1cdFJldHVybnMgbGlzdCBvZiA8Y29kZT57IHRhcmdldDogRE9NRWxlbWVudCwgcGFyYW1zOiBPYmplY3QgfTwvY29kZT4gb2JqZWN0cy5cblx0ICovXG5cdGZpbmRFbGVtZW50czogZnVuY3Rpb24oZ2xvYmFsUGFyYW1zLCBlbGVtZW50KVxuXHR7XG5cdFx0dmFyIGVsZW1lbnRzID0gZWxlbWVudCA/IFtlbGVtZW50XSA6IHRvQXJyYXkoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2guY29uZmlnLnRhZ05hbWUpKSwgXG5cdFx0XHRjb25mID0gc2guY29uZmlnLFxuXHRcdFx0cmVzdWx0ID0gW11cblx0XHRcdDtcblxuXHRcdC8vIHN1cHBvcnQgZm9yIDxTQ1JJUFQgVFlQRT1cInN5bnRheGhpZ2hsaWdodGVyXCIgLz4gZmVhdHVyZVxuXHRcdGlmIChjb25mLnVzZVNjcmlwdFRhZ3MpXG5cdFx0XHRlbGVtZW50cyA9IGVsZW1lbnRzLmNvbmNhdChnZXRTeW50YXhIaWdobGlnaHRlclNjcmlwdFRhZ3MoKSk7XG5cblx0XHRpZiAoZWxlbWVudHMubGVuZ3RoID09PSAwKSBcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIFxuXHRcdHtcblx0XHRcdHZhciBpdGVtID0ge1xuXHRcdFx0XHR0YXJnZXQ6IGVsZW1lbnRzW2ldLCBcblx0XHRcdFx0Ly8gbG9jYWwgcGFyYW1zIHRha2UgcHJlY2VkZW5jZSBvdmVyIGdsb2JhbHNcblx0XHRcdFx0cGFyYW1zOiBtZXJnZShnbG9iYWxQYXJhbXMsIHBhcnNlUGFyYW1zKGVsZW1lbnRzW2ldLmNsYXNzTmFtZSkpXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoaXRlbS5wYXJhbXNbJ2JydXNoJ10gPT0gbnVsbClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFxuXHRcdFx0cmVzdWx0LnB1c2goaXRlbSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNob3J0aGFuZCB0byBoaWdobGlnaHQgYWxsIGVsZW1lbnRzIG9uIHRoZSBwYWdlIHRoYXQgYXJlIG1hcmtlZCBhcyBcblx0ICogU3ludGF4SGlnaGxpZ2h0ZXIgc291cmNlIGNvZGUuXG5cdCAqIFxuXHQgKiBAcGFyYW0ge09iamVjdH0gZ2xvYmFsUGFyYW1zXHRcdE9wdGlvbmFsIHBhcmFtZXRlcnMgd2hpY2ggb3ZlcnJpZGUgZWxlbWVudCdzIFxuXHQgKiBcdFx0XHRcdFx0XHRcdFx0XHRwYXJhbWV0ZXJzLiBPbmx5IHVzZWQgaWYgZWxlbWVudCBpcyBzcGVjaWZpZWQuXG5cdCAqIFxuXHQgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFx0T3B0aW9uYWwgZWxlbWVudCB0byBoaWdobGlnaHQuIElmIG5vbmUgaXNcblx0ICogXHRcdFx0XHRcdFx0XHRwcm92aWRlZCwgYWxsIGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IGRvY3VtZW50IFxuXHQgKiBcdFx0XHRcdFx0XHRcdGFyZSBoaWdobGlnaHRlZC5cblx0ICovIFxuXHRoaWdobGlnaHQ6IGZ1bmN0aW9uKGdsb2JhbFBhcmFtcywgZWxlbWVudClcblx0e1xuXHRcdHZhciBlbGVtZW50cyA9IHRoaXMuZmluZEVsZW1lbnRzKGdsb2JhbFBhcmFtcywgZWxlbWVudCksXG5cdFx0XHRwcm9wZXJ0eU5hbWUgPSAnaW5uZXJIVE1MJywgXG5cdFx0XHRoaWdobGlnaHRlciA9IG51bGwsXG5cdFx0XHRjb25mID0gc2guY29uZmlnXG5cdFx0XHQ7XG5cblx0XHRpZiAoZWxlbWVudHMubGVuZ3RoID09PSAwKSBcblx0XHRcdHJldHVybjtcblx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykgXG5cdFx0e1xuXHRcdFx0dmFyIGVsZW1lbnQgPSBlbGVtZW50c1tpXSxcblx0XHRcdFx0dGFyZ2V0ID0gZWxlbWVudC50YXJnZXQsXG5cdFx0XHRcdHBhcmFtcyA9IGVsZW1lbnQucGFyYW1zLFxuXHRcdFx0XHRicnVzaE5hbWUgPSBwYXJhbXMuYnJ1c2gsXG5cdFx0XHRcdGNvZGVcblx0XHRcdFx0O1xuXG5cdFx0XHRpZiAoYnJ1c2hOYW1lID09IG51bGwpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHQvLyBJbnN0YW50aWF0ZSBhIGJydXNoXG5cdFx0XHRpZiAocGFyYW1zWydodG1sLXNjcmlwdCddID09ICd0cnVlJyB8fCBzaC5kZWZhdWx0c1snaHRtbC1zY3JpcHQnXSA9PSB0cnVlKSBcblx0XHRcdHtcblx0XHRcdFx0aGlnaGxpZ2h0ZXIgPSBuZXcgc2guSHRtbFNjcmlwdChicnVzaE5hbWUpO1xuXHRcdFx0XHRicnVzaE5hbWUgPSAnaHRtbHNjcmlwdCc7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBicnVzaCA9IGZpbmRCcnVzaChicnVzaE5hbWUpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGJydXNoKVxuXHRcdFx0XHRcdGhpZ2hsaWdodGVyID0gbmV3IGJydXNoKCk7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Y29kZSA9IHRhcmdldFtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0XG5cdFx0XHQvLyByZW1vdmUgQ0RBVEEgZnJvbSA8U0NSSVBULz4gdGFncyBpZiBpdCdzIHByZXNlbnRcblx0XHRcdGlmIChjb25mLnVzZVNjcmlwdFRhZ3MpXG5cdFx0XHRcdGNvZGUgPSBzdHJpcENEYXRhKGNvZGUpO1xuXHRcdFx0XHRcblx0XHRcdC8vIEluamVjdCB0aXRsZSBpZiB0aGUgYXR0cmlidXRlIGlzIHByZXNlbnRcblx0XHRcdGlmICgodGFyZ2V0LnRpdGxlIHx8ICcnKSAhPSAnJylcblx0XHRcdFx0cGFyYW1zLnRpdGxlID0gdGFyZ2V0LnRpdGxlO1xuXHRcdFx0XHRcblx0XHRcdHBhcmFtc1snYnJ1c2gnXSA9IGJydXNoTmFtZTtcblx0XHRcdGhpZ2hsaWdodGVyLmluaXQocGFyYW1zKTtcblx0XHRcdGVsZW1lbnQgPSBoaWdobGlnaHRlci5nZXREaXYoY29kZSk7XG5cdFx0XHRcblx0XHRcdC8vIGNhcnJ5IG92ZXIgSURcblx0XHRcdGlmICgodGFyZ2V0LmlkIHx8ICcnKSAhPSAnJylcblx0XHRcdFx0ZWxlbWVudC5pZCA9IHRhcmdldC5pZDtcblx0XHRcdFxuXHRcdFx0dGFyZ2V0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsZW1lbnQsIHRhcmdldCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgU3ludGF4SGlnaGxpZ2h0ZXIuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgT3B0aW9uYWwgcGFyYW1zIHRvIGFwcGx5IHRvIGFsbCBoaWdobGlnaHRlZCBlbGVtZW50cy5cblx0ICovXG5cdGFsbDogZnVuY3Rpb24ocGFyYW1zKVxuXHR7XG5cdFx0YXR0YWNoRXZlbnQoXG5cdFx0XHR3aW5kb3csXG5cdFx0XHQnbG9hZCcsXG5cdFx0XHRmdW5jdGlvbigpIHsgc2guaGlnaGxpZ2h0KHBhcmFtcyk7IH1cblx0XHQpO1xuXHR9XG59OyAvLyBlbmQgb2Ygc2hcblxuLyoqXG4gKiBDaGVja3MgaWYgdGFyZ2V0IERPTSBlbGVtZW50cyBoYXMgc3BlY2lmaWVkIENTUyBjbGFzcy5cbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudCB0byBjaGVjay5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgTmFtZSBvZiB0aGUgQ1NTIGNsYXNzIHRvIGNoZWNrIGZvci5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBjbGFzcyBuYW1lIGlzIHByZXNlbnQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gaGFzQ2xhc3ModGFyZ2V0LCBjbGFzc05hbWUpXG57XG5cdHJldHVybiB0YXJnZXQuY2xhc3NOYW1lLmluZGV4T2YoY2xhc3NOYW1lKSAhPSAtMTtcbn07XG5cbi8qKlxuICogQWRkcyBDU1MgY2xhc3MgbmFtZSB0byB0aGUgdGFyZ2V0IERPTSBlbGVtZW50LlxuICogQHBhcmFtIHtET01FbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50LlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBOZXcgQ1NTIGNsYXNzIHRvIGFkZC5cbiAqL1xuZnVuY3Rpb24gYWRkQ2xhc3ModGFyZ2V0LCBjbGFzc05hbWUpXG57XG5cdGlmICghaGFzQ2xhc3ModGFyZ2V0LCBjbGFzc05hbWUpKVxuXHRcdHRhcmdldC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIENTUyBjbGFzcyBuYW1lIGZyb20gdGhlIHRhcmdldCBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgQ1NTIGNsYXNzIHRvIHJlbW92ZS5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlQ2xhc3ModGFyZ2V0LCBjbGFzc05hbWUpXG57XG5cdHRhcmdldC5jbGFzc05hbWUgPSB0YXJnZXQuY2xhc3NOYW1lLnJlcGxhY2UoY2xhc3NOYW1lLCAnJyk7XG59O1xuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBzb3VyY2UgdG8gYXJyYXkgb2JqZWN0LiBNb3N0bHkgdXNlZCBmb3IgZnVuY3Rpb24gYXJndW1lbnRzIGFuZCBcbiAqIGxpc3RzIHJldHVybmVkIGJ5IGdldEVsZW1lbnRzQnlUYWdOYW1lKCkgd2hpY2ggYXJlbid0IEFycmF5IG9iamVjdHMuXG4gKiBAcGFyYW0ge0xpc3R9IHNvdXJjZSBTb3VyY2UgbGlzdC5cbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFycmF5LlxuICovXG5mdW5jdGlvbiB0b0FycmF5KHNvdXJjZSlcbntcblx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIFxuXHRcdHJlc3VsdC5wdXNoKHNvdXJjZVtpXSk7XG5cdFx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFNwbGl0cyBibG9jayBvZiB0ZXh0IGludG8gbGluZXMuXG4gKiBAcGFyYW0ge1N0cmluZ30gYmxvY2sgQmxvY2sgb2YgdGV4dC5cbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFycmF5IG9mIGxpbmVzLlxuICovXG5mdW5jdGlvbiBzcGxpdExpbmVzKGJsb2NrKVxue1xuXHRyZXR1cm4gYmxvY2suc3BsaXQoL1xccj9cXG4vKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgSFRNTCBJRCBmb3IgdGhlIGhpZ2hsaWdodGVyLlxuICogQHBhcmFtIHtTdHJpbmd9IGhpZ2hsaWdodGVySWQgSGlnaGxpZ2h0ZXIgSUQuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgSFRNTCBJRC5cbiAqL1xuZnVuY3Rpb24gZ2V0SGlnaGxpZ2h0ZXJJZChpZClcbntcblx0dmFyIHByZWZpeCA9ICdoaWdobGlnaHRlcl8nO1xuXHRyZXR1cm4gaWQuaW5kZXhPZihwcmVmaXgpID09IDAgPyBpZCA6IHByZWZpeCArIGlkO1xufTtcblxuLyoqXG4gKiBGaW5kcyBIaWdobGlnaHRlciBpbnN0YW5jZSBieSBJRC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBoaWdobGlnaHRlcklkIEhpZ2hsaWdodGVyIElELlxuICogQHJldHVybiB7SGlnaGxpZ2h0ZXJ9IFJldHVybnMgaW5zdGFuY2Ugb2YgdGhlIGhpZ2hsaWdodGVyLlxuICovXG5mdW5jdGlvbiBnZXRIaWdobGlnaHRlckJ5SWQoaWQpXG57XG5cdHJldHVybiBzaC52YXJzLmhpZ2hsaWdodGVyc1tnZXRIaWdobGlnaHRlcklkKGlkKV07XG59O1xuXG4vKipcbiAqIEZpbmRzIGhpZ2hsaWdodGVyJ3MgRElWIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBoaWdobGlnaHRlcklkIEhpZ2hsaWdodGVyIElELlxuICogQHJldHVybiB7RWxlbWVudH0gUmV0dXJucyBoaWdobGlnaHRlcidzIERJViBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBnZXRIaWdobGlnaHRlckRpdkJ5SWQoaWQpXG57XG5cdHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChnZXRIaWdobGlnaHRlcklkKGlkKSk7XG59O1xuXG4vKipcbiAqIFN0b3JlcyBoaWdobGlnaHRlciBzbyB0aGF0IGdldEhpZ2hsaWdodGVyQnlJZCgpIGNhbiBkbyBpdHMgdGhpbmcuIEVhY2hcbiAqIGhpZ2hsaWdodGVyIG11c3QgY2FsbCB0aGlzIG1ldGhvZCB0byBwcmVzZXJ2ZSBpdHNlbGYuXG4gKiBAcGFyYW0ge0hpZ2hpbGdodGVyfSBoaWdobGlnaHRlciBIaWdobGlnaHRlciBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc3RvcmVIaWdobGlnaHRlcihoaWdobGlnaHRlcilcbntcblx0c2gudmFycy5oaWdobGlnaHRlcnNbZ2V0SGlnaGxpZ2h0ZXJJZChoaWdobGlnaHRlci5pZCldID0gaGlnaGxpZ2h0ZXI7XG59O1xuXG4vKipcbiAqIExvb2tzIGZvciBhIGNoaWxkIG9yIHBhcmVudCBub2RlIHdoaWNoIGhhcyBzcGVjaWZpZWQgY2xhc3NuYW1lLlxuICogRXF1aXZhbGVudCB0byBqUXVlcnkncyAkKGNvbnRhaW5lcikuZmluZChcIi5jbGFzc05hbWVcIilcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFRhcmdldCBlbGVtZW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHNlYXJjaCBDbGFzcyBuYW1lIG9yIG5vZGUgbmFtZSB0byBsb29rIGZvci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmV2ZXJzZSBJZiBzZXQgdG8gdHJ1ZSwgd2lsbCBnbyB1cCB0aGUgbm9kZSB0cmVlIGluc3RlYWQgb2YgZG93bi5cbiAqIEByZXR1cm4ge0VsZW1lbnR9IFJldHVybnMgZm91bmQgY2hpbGQgb3IgcGFyZW50IGVsZW1lbnQgb24gbnVsbC5cbiAqL1xuZnVuY3Rpb24gZmluZEVsZW1lbnQodGFyZ2V0LCBzZWFyY2gsIHJldmVyc2UgLyogb3B0aW9uYWwgKi8pXG57XG5cdGlmICh0YXJnZXQgPT0gbnVsbClcblx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0dmFyIG5vZGVzXHRcdFx0PSByZXZlcnNlICE9IHRydWUgPyB0YXJnZXQuY2hpbGROb2RlcyA6IFsgdGFyZ2V0LnBhcmVudE5vZGUgXSxcblx0XHRwcm9wZXJ0eVRvRmluZFx0PSB7ICcjJyA6ICdpZCcsICcuJyA6ICdjbGFzc05hbWUnIH1bc2VhcmNoLnN1YnN0cigwLCAxKV0gfHwgJ25vZGVOYW1lJyxcblx0XHRleHBlY3RlZFZhbHVlLFxuXHRcdGZvdW5kXG5cdFx0O1xuXG5cdGV4cGVjdGVkVmFsdWUgPSBwcm9wZXJ0eVRvRmluZCAhPSAnbm9kZU5hbWUnXG5cdFx0PyBzZWFyY2guc3Vic3RyKDEpXG5cdFx0OiBzZWFyY2gudG9VcHBlckNhc2UoKVxuXHRcdDtcblx0XHRcblx0Ly8gbWFpbiByZXR1cm4gb2YgdGhlIGZvdW5kIG5vZGVcblx0aWYgKCh0YXJnZXRbcHJvcGVydHlUb0ZpbmRdIHx8ICcnKS5pbmRleE9mKGV4cGVjdGVkVmFsdWUpICE9IC0xKVxuXHRcdHJldHVybiB0YXJnZXQ7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgbm9kZXMgJiYgaSA8IG5vZGVzLmxlbmd0aCAmJiBmb3VuZCA9PSBudWxsOyBpKyspXG5cdFx0Zm91bmQgPSBmaW5kRWxlbWVudChub2Rlc1tpXSwgc2VhcmNoLCByZXZlcnNlKTtcblx0XG5cdHJldHVybiBmb3VuZDtcbn07XG5cbi8qKlxuICogTG9va3MgZm9yIGEgcGFyZW50IG5vZGUgd2hpY2ggaGFzIHNwZWNpZmllZCBjbGFzc25hbWUuXG4gKiBUaGlzIGlzIGFuIGFsaWFzIHRvIDxjb2RlPmZpbmRFbGVtZW50KGNvbnRhaW5lciwgY2xhc3NOYW1lLCB0cnVlKTwvY29kZT4uXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCBUYXJnZXQgZWxlbWVudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgQ2xhc3MgbmFtZSB0byBsb29rIGZvci5cbiAqIEByZXR1cm4ge0VsZW1lbnR9IFJldHVybnMgZm91bmQgcGFyZW50IGVsZW1lbnQgb24gbnVsbC5cbiAqL1xuZnVuY3Rpb24gZmluZFBhcmVudEVsZW1lbnQodGFyZ2V0LCBjbGFzc05hbWUpXG57XG5cdHJldHVybiBmaW5kRWxlbWVudCh0YXJnZXQsIGNsYXNzTmFtZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIEZpbmRzIGFuIGluZGV4IG9mIGVsZW1lbnQgaW4gdGhlIGFycmF5LlxuICogQGlnbm9yZVxuICogQHBhcmFtIHtPYmplY3R9IHNlYXJjaEVsZW1lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBmcm9tSW5kZXhcbiAqIEByZXR1cm4ge051bWJlcn0gUmV0dXJucyBpbmRleCBvZiBlbGVtZW50IGlmIGZvdW5kOyAtMSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGluZGV4T2YoYXJyYXksIHNlYXJjaEVsZW1lbnQsIGZyb21JbmRleClcbntcblx0ZnJvbUluZGV4ID0gTWF0aC5tYXgoZnJvbUluZGV4IHx8IDAsIDApO1xuXG5cdGZvciAodmFyIGkgPSBmcm9tSW5kZXg7IGkgPCBhcnJheS5sZW5ndGg7IGkrKylcblx0XHRpZihhcnJheVtpXSA9PSBzZWFyY2hFbGVtZW50KVxuXHRcdFx0cmV0dXJuIGk7XG5cdFxuXHRyZXR1cm4gLTE7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBlbGVtZW50IElELlxuICovXG5mdW5jdGlvbiBndWlkKHByZWZpeClcbntcblx0cmV0dXJuIChwcmVmaXggfHwgJycpICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMDAwMCkudG9TdHJpbmcoKTtcbn07XG5cbi8qKlxuICogTWVyZ2VzIHR3byBvYmplY3RzLiBWYWx1ZXMgZnJvbSBvYmoyIG92ZXJyaWRlIHZhbHVlcyBpbiBvYmoxLlxuICogRnVuY3Rpb24gaXMgTk9UIHJlY3Vyc2l2ZSBhbmQgd29ya3Mgb25seSBmb3Igb25lIGRpbWVuc2lvbmFsIG9iamVjdHMuXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBGaXJzdCBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMiBTZWNvbmQgb2JqZWN0LlxuICogQHJldHVybiB7T2JqZWN0fSBSZXR1cm5zIGNvbWJpbmF0aW9uIG9mIGJvdGggb2JqZWN0cy5cbiAqL1xuZnVuY3Rpb24gbWVyZ2Uob2JqMSwgb2JqMilcbntcblx0dmFyIHJlc3VsdCA9IHt9LCBuYW1lO1xuXG5cdGZvciAobmFtZSBpbiBvYmoxKSBcblx0XHRyZXN1bHRbbmFtZV0gPSBvYmoxW25hbWVdO1xuXHRcblx0Zm9yIChuYW1lIGluIG9iajIpIFxuXHRcdHJlc3VsdFtuYW1lXSA9IG9iajJbbmFtZV07XG5cdFx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEF0dGVtcHRzIHRvIGNvbnZlcnQgc3RyaW5nIHRvIGJvb2xlYW4uXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgSW5wdXQgc3RyaW5nLlxuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGlucHV0IHdhcyBcInRydWVcIiwgZmFsc2UgaWYgaW5wdXQgd2FzIFwiZmFsc2VcIiBhbmQgdmFsdWUgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiB0b0Jvb2xlYW4odmFsdWUpXG57XG5cdHZhciByZXN1bHQgPSB7IFwidHJ1ZVwiIDogdHJ1ZSwgXCJmYWxzZVwiIDogZmFsc2UgfVt2YWx1ZV07XG5cdHJldHVybiByZXN1bHQgPT0gbnVsbCA/IHZhbHVlIDogcmVzdWx0O1xufTtcblxuLyoqXG4gKiBPcGVucyB1cCBhIGNlbnRlcmVkIHBvcHVwIHdpbmRvdy5cbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcdFx0VVJMIHRvIG9wZW4gaW4gdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXHRcdFBvcHVwIG5hbWUuXG4gKiBAcGFyYW0ge2ludH0gd2lkdGhcdFx0UG9wdXAgd2lkdGguXG4gKiBAcGFyYW0ge2ludH0gaGVpZ2h0XHRcdFBvcHVwIGhlaWdodC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zXHR3aW5kb3cub3BlbigpIG9wdGlvbnMuXG4gKiBAcmV0dXJuIHtXaW5kb3d9XHRcdFx0UmV0dXJucyB3aW5kb3cgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHBvcHVwKHVybCwgbmFtZSwgd2lkdGgsIGhlaWdodCwgb3B0aW9ucylcbntcblx0dmFyIHggPSAoc2NyZWVuLndpZHRoIC0gd2lkdGgpIC8gMixcblx0XHR5ID0gKHNjcmVlbi5oZWlnaHQgLSBoZWlnaHQpIC8gMlxuXHRcdDtcblx0XHRcblx0b3B0aW9ucyArPVx0JywgbGVmdD0nICsgeCArIFxuXHRcdFx0XHQnLCB0b3A9JyArIHkgK1xuXHRcdFx0XHQnLCB3aWR0aD0nICsgd2lkdGggK1xuXHRcdFx0XHQnLCBoZWlnaHQ9JyArIGhlaWdodFxuXHRcdDtcblx0b3B0aW9ucyA9IG9wdGlvbnMucmVwbGFjZSgvXiwvLCAnJyk7XG5cblx0dmFyIHdpbiA9IHdpbmRvdy5vcGVuKHVybCwgbmFtZSwgb3B0aW9ucyk7XG5cdHdpbi5mb2N1cygpO1xuXHRyZXR1cm4gd2luO1xufTtcblxuLyoqXG4gKiBBZGRzIGV2ZW50IGhhbmRsZXIgdG8gdGhlIHRhcmdldCBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHRcdFRhcmdldCBvYmplY3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVx0XHROYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmNcdEhhbmRsaW5nIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBhdHRhY2hFdmVudChvYmosIHR5cGUsIGZ1bmMsIHNjb3BlKVxue1xuXHRmdW5jdGlvbiBoYW5kbGVyKGUpXG5cdHtcblx0XHRlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0XG5cdFx0aWYgKCFlLnRhcmdldClcblx0XHR7XG5cdFx0XHRlLnRhcmdldCA9IGUuc3JjRWxlbWVudDtcblx0XHRcdGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMucmV0dXJuVmFsdWUgPSBmYWxzZTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdFx0XG5cdFx0ZnVuYy5jYWxsKHNjb3BlIHx8IHdpbmRvdywgZSk7XG5cdH07XG5cdFxuXHRpZiAob2JqLmF0dGFjaEV2ZW50KSBcblx0e1xuXHRcdG9iai5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgaGFuZGxlcik7XG5cdH1cblx0ZWxzZSBcblx0e1xuXHRcdG9iai5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcblx0fVxufTtcblxuLyoqXG4gKiBEaXNwbGF5cyBhbiBhbGVydC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIGRpc3BsYXkuXG4gKi9cbmZ1bmN0aW9uIGFsZXJ0KHN0cilcbntcblx0d2luZG93LmFsZXJ0KHNoLmNvbmZpZy5zdHJpbmdzLmFsZXJ0ICsgc3RyKTtcbn07XG5cbi8qKlxuICogRmluZHMgYSBicnVzaCBieSBpdHMgYWxpYXMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFsaWFzXHRcdEJydXNoIGFsaWFzLlxuICogQHBhcmFtIHtCb29sZWFufSBzaG93QWxlcnRcdFN1cHByZXNzZXMgdGhlIGFsZXJ0IGlmIGZhbHNlLlxuICogQHJldHVybiB7QnJ1c2h9XHRcdFx0XHRSZXR1cm5zIGJ1cnNoIGNvbnN0cnVjdG9yIGlmIGZvdW5kLCBudWxsIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gZmluZEJydXNoKGFsaWFzLCBzaG93QWxlcnQpXG57XG5cdHZhciBicnVzaGVzID0gc2gudmFycy5kaXNjb3ZlcmVkQnJ1c2hlcyxcblx0XHRyZXN1bHQgPSBudWxsXG5cdFx0O1xuXHRcblx0aWYgKGJydXNoZXMgPT0gbnVsbCkgXG5cdHtcblx0XHRicnVzaGVzID0ge307XG5cdFx0XG5cdFx0Ly8gRmluZCBhbGwgYnJ1c2hlc1xuXHRcdGZvciAodmFyIGJydXNoIGluIHNoLmJydXNoZXMpIFxuXHRcdHtcblx0XHRcdHZhciBpbmZvID0gc2guYnJ1c2hlc1ticnVzaF0sXG5cdFx0XHRcdGFsaWFzZXMgPSBpbmZvLmFsaWFzZXNcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHRpZiAoYWxpYXNlcyA9PSBudWxsKSBcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdC8vIGtlZXAgdGhlIGJydXNoIG5hbWVcblx0XHRcdGluZm8uYnJ1c2hOYW1lID0gYnJ1c2gudG9Mb3dlckNhc2UoKTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbGlhc2VzLmxlbmd0aDsgaSsrKSBcblx0XHRcdFx0YnJ1c2hlc1thbGlhc2VzW2ldXSA9IGJydXNoO1xuXHRcdH1cblx0XHRcblx0XHRzaC52YXJzLmRpc2NvdmVyZWRCcnVzaGVzID0gYnJ1c2hlcztcblx0fVxuXHRcblx0cmVzdWx0ID0gc2guYnJ1c2hlc1ticnVzaGVzW2FsaWFzXV07XG5cblx0aWYgKHJlc3VsdCA9PSBudWxsICYmIHNob3dBbGVydClcblx0XHRhbGVydChzaC5jb25maWcuc3RyaW5ncy5ub0JydXNoICsgYWxpYXMpO1xuXHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBjYWxsYmFjayBvbiBlYWNoIGxpbmUgYW5kIHJlcGxhY2VzIGVhY2ggbGluZSB3aXRoIHJlc3VsdCBmcm9tIHRoZSBjYWxsYmFjay5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzdHJcdFx0XHRJbnB1dCBzdHJpbmcuXG4gKiBAcGFyYW0ge09iamVjdH0gY2FsbGJhY2tcdFx0Q2FsbGJhY2sgZnVuY3Rpb24gdGFraW5nIG9uZSBzdHJpbmcgYXJndW1lbnQgYW5kIHJldHVybmluZyBhIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZWFjaExpbmUoc3RyLCBjYWxsYmFjaylcbntcblx0dmFyIGxpbmVzID0gc3BsaXRMaW5lcyhzdHIpO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKylcblx0XHRsaW5lc1tpXSA9IGNhbGxiYWNrKGxpbmVzW2ldLCBpKTtcblx0XHRcblx0Ly8gaW5jbHVkZSBcXHIgdG8gZW5hYmxlIGNvcHktcGFzdGUgb24gd2luZG93cyAoaWU4KSB3aXRob3V0IGdldHRpbmcgZXZlcnl0aGluZyBvbiBvbmUgbGluZVxuXHRyZXR1cm4gbGluZXMuam9pbignXFxyXFxuJyk7XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgYSBzcGVjaWFsIHRyaW0gd2hpY2ggb25seSByZW1vdmVzIGZpcnN0IGFuZCBsYXN0IGVtcHR5IGxpbmVzXG4gKiBhbmQgZG9lc24ndCBhZmZlY3QgdmFsaWQgbGVhZGluZyBzcGFjZSBvbiB0aGUgZmlyc3QgbGluZS5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgIElucHV0IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgIFJldHVybnMgc3RyaW5nIHdpdGhvdXQgZW1wdHkgZmlyc3QgYW5kIGxhc3QgbGluZXMuXG4gKi9cbmZ1bmN0aW9uIHRyaW1GaXJzdEFuZExhc3RMaW5lcyhzdHIpXG57XG5cdHJldHVybiBzdHIucmVwbGFjZSgvXlsgXSpbXFxuXSt8W1xcbl0qWyBdKiQvZywgJycpO1xufTtcblxuLyoqXG4gKiBQYXJzZXMga2V5L3ZhbHVlIHBhaXJzIGludG8gaGFzaCBvYmplY3QuXG4gKiBcbiAqIFVuZGVyc3RhbmRzIHRoZSBmb2xsb3dpbmcgZm9ybWF0czpcbiAqIC0gbmFtZTogd29yZDtcbiAqIC0gbmFtZTogW3dvcmQsIHdvcmRdO1xuICogLSBuYW1lOiBcInN0cmluZ1wiO1xuICogLSBuYW1lOiAnc3RyaW5nJztcbiAqIFxuICogRm9yIGV4YW1wbGU6XG4gKiAgIG5hbWUxOiB2YWx1ZTsgbmFtZTI6IFt2YWx1ZSwgdmFsdWVdOyBuYW1lMzogJ3ZhbHVlJ1xuICogICBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICAgSW5wdXQgc3RyaW5nLlxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICBSZXR1cm5zIGRlc2VyaWFsaXplZCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlUGFyYW1zKHN0cilcbntcblx0dmFyIG1hdGNoLCBcblx0XHRyZXN1bHQgPSB7fSxcblx0XHRhcnJheVJlZ2V4ID0gbmV3IFhSZWdFeHAoXCJeXFxcXFsoPzx2YWx1ZXM+KC4qPykpXFxcXF0kXCIpLFxuXHRcdHJlZ2V4ID0gbmV3IFhSZWdFeHAoXG5cdFx0XHRcIig/PG5hbWU+W1xcXFx3LV0rKVwiICtcblx0XHRcdFwiXFxcXHMqOlxcXFxzKlwiICtcblx0XHRcdFwiKD88dmFsdWU+XCIgK1xuXHRcdFx0XHRcIltcXFxcdy0lI10rfFwiICtcdFx0Ly8gd29yZFxuXHRcdFx0XHRcIlxcXFxbLio/XFxcXF18XCIgK1x0XHQvLyBbXSBhcnJheVxuXHRcdFx0XHQnXCIuKj9cInwnICtcdFx0XHQvLyBcIlwiIHN0cmluZ1xuXHRcdFx0XHRcIicuKj8nXCIgK1x0XHRcdC8vICcnIHN0cmluZ1xuXHRcdFx0XCIpXFxcXHMqOz9cIixcblx0XHRcdFwiZ1wiXG5cdFx0KVxuXHRcdDtcblxuXHR3aGlsZSAoKG1hdGNoID0gcmVnZXguZXhlYyhzdHIpKSAhPSBudWxsKSBcblx0e1xuXHRcdHZhciB2YWx1ZSA9IG1hdGNoLnZhbHVlXG5cdFx0XHQucmVwbGFjZSgvXlsnXCJdfFsnXCJdJC9nLCAnJykgLy8gc3RyaXAgcXVvdGVzIGZyb20gZW5kIG9mIHN0cmluZ3Ncblx0XHRcdDtcblx0XHRcblx0XHQvLyB0cnkgdG8gcGFyc2UgYXJyYXkgdmFsdWVcblx0XHRpZiAodmFsdWUgIT0gbnVsbCAmJiBhcnJheVJlZ2V4LnRlc3QodmFsdWUpKVxuXHRcdHtcblx0XHRcdHZhciBtID0gYXJyYXlSZWdleC5leGVjKHZhbHVlKTtcblx0XHRcdHZhbHVlID0gbS52YWx1ZXMubGVuZ3RoID4gMCA/IG0udmFsdWVzLnNwbGl0KC9cXHMqLFxccyovKSA6IFtdO1xuXHRcdH1cblx0XHRcblx0XHRyZXN1bHRbbWF0Y2gubmFtZV0gPSB2YWx1ZTtcblx0fVxuXHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogV3JhcHMgZWFjaCBsaW5lIG9mIHRoZSBzdHJpbmcgaW50byA8Y29kZS8+IHRhZyB3aXRoIGdpdmVuIHN0eWxlIGFwcGxpZWQgdG8gaXQuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICBJbnB1dCBzdHJpbmcuXG4gKiBAcGFyYW0ge1N0cmluZ30gY3NzICAgU3R5bGUgbmFtZSB0byBhcHBseSB0byB0aGUgc3RyaW5nLlxuICogQHJldHVybiB7U3RyaW5nfSAgICAgIFJldHVybnMgaW5wdXQgc3RyaW5nIHdpdGggZWFjaCBsaW5lIHN1cnJvdW5kZWQgYnkgPHNwYW4vPiB0YWcuXG4gKi9cbmZ1bmN0aW9uIHdyYXBMaW5lc1dpdGhDb2RlKHN0ciwgY3NzKVxue1xuXHRpZiAoc3RyID09IG51bGwgfHwgc3RyLmxlbmd0aCA9PSAwIHx8IHN0ciA9PSAnXFxuJykgXG5cdFx0cmV0dXJuIHN0cjtcblxuXHRzdHIgPSBzdHIucmVwbGFjZSgvPC9nLCAnJmx0OycpO1xuXG5cdC8vIFJlcGxhY2UgdHdvIG9yIG1vcmUgc2VxdWVudGlhbCBzcGFjZXMgd2l0aCAmbmJzcDsgbGVhdmluZyBsYXN0IHNwYWNlIHVudG91Y2hlZC5cblx0c3RyID0gc3RyLnJlcGxhY2UoLyB7Mix9L2csIGZ1bmN0aW9uKG0pXG5cdHtcblx0XHR2YXIgc3BhY2VzID0gJyc7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtLmxlbmd0aCAtIDE7IGkrKylcblx0XHRcdHNwYWNlcyArPSBzaC5jb25maWcuc3BhY2U7XG5cdFx0XG5cdFx0cmV0dXJuIHNwYWNlcyArICcgJztcblx0fSk7XG5cblx0Ly8gU3BsaXQgZWFjaCBsaW5lIGFuZCBhcHBseSA8c3BhbiBjbGFzcz1cIi4uLlwiPi4uLjwvc3Bhbj4gdG8gdGhlbSBzbyB0aGF0XG5cdC8vIGxlYWRpbmcgc3BhY2VzIGFyZW4ndCBpbmNsdWRlZC5cblx0aWYgKGNzcyAhPSBudWxsKSBcblx0XHRzdHIgPSBlYWNoTGluZShzdHIsIGZ1bmN0aW9uKGxpbmUpXG5cdFx0e1xuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09IDApIFxuXHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHRcblx0XHRcdHZhciBzcGFjZXMgPSAnJztcblx0XHRcdFxuXHRcdFx0bGluZSA9IGxpbmUucmVwbGFjZSgvXigmbmJzcDt8ICkrLywgZnVuY3Rpb24ocylcblx0XHRcdHtcblx0XHRcdFx0c3BhY2VzID0gcztcblx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdGlmIChsaW5lLmxlbmd0aCA9PSAwKSBcblx0XHRcdFx0cmV0dXJuIHNwYWNlcztcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHNwYWNlcyArICc8Y29kZSBjbGFzcz1cIicgKyBjc3MgKyAnXCI+JyArIGxpbmUgKyAnPC9jb2RlPic7XG5cdFx0fSk7XG5cblx0cmV0dXJuIHN0cjtcbn07XG5cbi8qKlxuICogUGFkcyBudW1iZXIgd2l0aCB6ZXJvcyB1bnRpbCBpdCdzIGxlbmd0aCBpcyB0aGUgc2FtZSBhcyBnaXZlbiBsZW5ndGguXG4gKiBcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1iZXJcdE51bWJlciB0byBwYWQuXG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoXHRNYXggc3RyaW5nIGxlbmd0aCB3aXRoLlxuICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFJldHVybnMgYSBzdHJpbmcgcGFkZGVkIHdpdGggcHJvcGVyIGFtb3VudCBvZiAnMCcuXG4gKi9cbmZ1bmN0aW9uIHBhZE51bWJlcihudW1iZXIsIGxlbmd0aClcbntcblx0dmFyIHJlc3VsdCA9IG51bWJlci50b1N0cmluZygpO1xuXHRcblx0d2hpbGUgKHJlc3VsdC5sZW5ndGggPCBsZW5ndGgpXG5cdFx0cmVzdWx0ID0gJzAnICsgcmVzdWx0O1xuXHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgdGFicyB3aXRoIHNwYWNlcy5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IGNvZGVcdFx0U291cmNlIGNvZGUuXG4gKiBAcGFyYW0ge051bWJlcn0gdGFiU2l6ZVx0U2l6ZSBvZiB0aGUgdGFiLlxuICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFJldHVybnMgY29kZSB3aXRoIGFsbCB0YWJzIHJlcGxhY2VzIGJ5IHNwYWNlcy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1RhYnMoY29kZSwgdGFiU2l6ZSlcbntcblx0dmFyIHRhYiA9ICcnO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0YWJTaXplOyBpKyspXG5cdFx0dGFiICs9ICcgJztcblxuXHRyZXR1cm4gY29kZS5yZXBsYWNlKC9cXHQvZywgdGFiKTtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgdGFicyB3aXRoIHNtYXJ0IHNwYWNlcy5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgICAgQ29kZSB0byBmaXggdGhlIHRhYnMgaW4uXG4gKiBAcGFyYW0ge051bWJlcn0gdGFiU2l6ZSBOdW1iZXIgb2Ygc3BhY2VzIGluIGEgY29sdW1uLlxuICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgUmV0dXJucyBjb2RlIHdpdGggYWxsIHRhYnMgcmVwbGFjZXMgd2l0aCByb3BlciBhbW91bnQgb2Ygc3BhY2VzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzU21hcnRUYWJzKGNvZGUsIHRhYlNpemUpXG57XG5cdHZhciBsaW5lcyA9IHNwbGl0TGluZXMoY29kZSksXG5cdFx0dGFiID0gJ1xcdCcsXG5cdFx0c3BhY2VzID0gJydcblx0XHQ7XG5cdFxuXHQvLyBDcmVhdGUgYSBzdHJpbmcgd2l0aCAxMDAwIHNwYWNlcyB0byBjb3B5IHNwYWNlcyBmcm9tLi4uIFxuXHQvLyBJdCdzIGFzc3VtZWQgdGhhdCB0aGVyZSB3b3VsZCBiZSBubyBpbmRlbnRhdGlvbiBsb25nZXIgdGhhbiB0aGF0LlxuXHRmb3IgKHZhciBpID0gMDsgaSA8IDUwOyBpKyspIFxuXHRcdHNwYWNlcyArPSAnICAgICAgICAgICAgICAgICAgICAnOyAvLyAyMCBzcGFjZXMgKiA1MFxuXHRcdFx0XG5cdC8vIFRoaXMgZnVuY3Rpb24gaW5zZXJ0cyBzcGVjaWZpZWQgYW1vdW50IG9mIHNwYWNlcyBpbiB0aGUgc3RyaW5nXG5cdC8vIHdoZXJlIGEgdGFiIGlzIHdoaWxlIHJlbW92aW5nIHRoYXQgZ2l2ZW4gdGFiLlxuXHRmdW5jdGlvbiBpbnNlcnRTcGFjZXMobGluZSwgcG9zLCBjb3VudClcblx0e1xuXHRcdHJldHVybiBsaW5lLnN1YnN0cigwLCBwb3MpXG5cdFx0XHQrIHNwYWNlcy5zdWJzdHIoMCwgY291bnQpXG5cdFx0XHQrIGxpbmUuc3Vic3RyKHBvcyArIDEsIGxpbmUubGVuZ3RoKSAvLyBwb3MgKyAxIHdpbGwgZ2V0IHJpZCBvZiB0aGUgdGFiXG5cdFx0XHQ7XG5cdH07XG5cblx0Ly8gR28gdGhyb3VnaCBhbGwgdGhlIGxpbmVzIGFuZCBkbyB0aGUgJ3NtYXJ0IHRhYnMnIG1hZ2ljLlxuXHRjb2RlID0gZWFjaExpbmUoY29kZSwgZnVuY3Rpb24obGluZSlcblx0e1xuXHRcdGlmIChsaW5lLmluZGV4T2YodGFiKSA9PSAtMSkgXG5cdFx0XHRyZXR1cm4gbGluZTtcblx0XHRcblx0XHR2YXIgcG9zID0gMDtcblx0XHRcblx0XHR3aGlsZSAoKHBvcyA9IGxpbmUuaW5kZXhPZih0YWIpKSAhPSAtMSkgXG5cdFx0e1xuXHRcdFx0Ly8gVGhpcyBpcyBwcmV0dHkgbXVjaCBhbGwgdGhlcmUgaXMgdG8gdGhlICdzbWFydCB0YWJzJyBsb2dpYy5cblx0XHRcdC8vIEJhc2VkIG9uIHRoZSBwb3NpdGlvbiB3aXRoaW4gdGhlIGxpbmUgYW5kIHNpemUgb2YgYSB0YWIsXG5cdFx0XHQvLyBjYWxjdWxhdGUgdGhlIGFtb3VudCBvZiBzcGFjZXMgd2UgbmVlZCB0byBpbnNlcnQuXG5cdFx0XHR2YXIgc3BhY2VzID0gdGFiU2l6ZSAtIHBvcyAlIHRhYlNpemU7XG5cdFx0XHRsaW5lID0gaW5zZXJ0U3BhY2VzKGxpbmUsIHBvcywgc3BhY2VzKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmU7XG5cdH0pO1xuXHRcblx0cmV0dXJuIGNvZGU7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIHZhcmlvdXMgc3RyaW5nIGZpeGVzIGJhc2VkIG9uIGNvbmZpZ3VyYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGZpeElucHV0U3RyaW5nKHN0cilcbntcblx0dmFyIGJyID0gLzxiclxccypcXC8/PnwmbHQ7YnJcXHMqXFwvPyZndDsvZ2k7XG5cdFxuXHRpZiAoc2guY29uZmlnLmJsb2dnZXJNb2RlID09IHRydWUpXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoYnIsICdcXG4nKTtcblxuXHRpZiAoc2guY29uZmlnLnN0cmlwQnJzID09IHRydWUpXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoYnIsICcnKTtcblx0XHRcblx0cmV0dXJuIHN0cjtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwgd2hpdGUgc3BhY2UgYXQgdGhlIGJlZ2luaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmcuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICBTdHJpbmcgdG8gdHJpbS5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBSZXR1cm5zIHN0cmluZyB3aXRob3V0IGxlYWRpbmcgYW5kIGZvbGxvd2luZyB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzLlxuICovXG5mdW5jdGlvbiB0cmltKHN0cilcbntcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFVuaW5kZW50cyBhIGJsb2NrIG9mIHRleHQgYnkgdGhlIGxvd2VzdCBjb21tb24gaW5kZW50IGFtb3VudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICBUZXh0IHRvIHVuaW5kZW50LlxuICogQHJldHVybiB7U3RyaW5nfSAgICAgIFJldHVybnMgdW5pbmRlbnRlZCB0ZXh0IGJsb2NrLlxuICovXG5mdW5jdGlvbiB1bmluZGVudChzdHIpXG57XG5cdHZhciBsaW5lcyA9IHNwbGl0TGluZXMoZml4SW5wdXRTdHJpbmcoc3RyKSksXG5cdFx0aW5kZW50cyA9IG5ldyBBcnJheSgpLFxuXHRcdHJlZ2V4ID0gL15cXHMqLyxcblx0XHRtaW4gPSAxMDAwXG5cdFx0O1xuXHRcblx0Ly8gZ28gdGhyb3VnaCBldmVyeSBsaW5lIGFuZCBjaGVjayBmb3IgY29tbW9uIG51bWJlciBvZiBpbmRlbnRzXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoICYmIG1pbiA+IDA7IGkrKykgXG5cdHtcblx0XHR2YXIgbGluZSA9IGxpbmVzW2ldO1xuXHRcdFxuXHRcdGlmICh0cmltKGxpbmUpLmxlbmd0aCA9PSAwKSBcblx0XHRcdGNvbnRpbnVlO1xuXHRcdFxuXHRcdHZhciBtYXRjaGVzID0gcmVnZXguZXhlYyhsaW5lKTtcblx0XHRcblx0XHQvLyBJbiB0aGUgZXZlbnQgdGhhdCBqdXN0IG9uZSBsaW5lIGRvZXNuJ3QgaGF2ZSBsZWFkaW5nIHdoaXRlIHNwYWNlXG5cdFx0Ly8gd2UgY2FuJ3QgdW5pbmRlbnQgYW55dGhpbmcsIHNvIGJhaWwgY29tcGxldGVseS5cblx0XHRpZiAobWF0Y2hlcyA9PSBudWxsKSBcblx0XHRcdHJldHVybiBzdHI7XG5cdFx0XHRcblx0XHRtaW4gPSBNYXRoLm1pbihtYXRjaGVzWzBdLmxlbmd0aCwgbWluKTtcblx0fVxuXHRcblx0Ly8gdHJpbSBtaW5pbXVtIGNvbW1vbiBudW1iZXIgb2Ygd2hpdGUgc3BhY2UgZnJvbSB0aGUgYmVnaW5pbmcgb2YgZXZlcnkgbGluZVxuXHRpZiAobWluID4gMCkgXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykgXG5cdFx0XHRsaW5lc1tpXSA9IGxpbmVzW2ldLnN1YnN0cihtaW4pO1xuXHRcblx0cmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufTtcblxuLyoqXG4gKiBDYWxsYmFjayBtZXRob2QgZm9yIEFycmF5LnNvcnQoKSB3aGljaCBzb3J0cyBtYXRjaGVzIGJ5XG4gKiBpbmRleCBwb3NpdGlvbiBhbmQgdGhlbiBieSBsZW5ndGguXG4gKiBcbiAqIEBwYXJhbSB7TWF0Y2h9IG0xXHRMZWZ0IG9iamVjdC5cbiAqIEBwYXJhbSB7TWF0Y2h9IG0yICAgIFJpZ2h0IG9iamVjdC5cbiAqIEByZXR1cm4ge051bWJlcn0gICAgIFJldHVybnMgLTEsIDAgb3IgLTEgYXMgYSBjb21wYXJpc29uIHJlc3VsdC5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hlc1NvcnRDYWxsYmFjayhtMSwgbTIpXG57XG5cdC8vIHNvcnQgbWF0Y2hlcyBieSBpbmRleCBmaXJzdFxuXHRpZihtMS5pbmRleCA8IG0yLmluZGV4KVxuXHRcdHJldHVybiAtMTtcblx0ZWxzZSBpZihtMS5pbmRleCA+IG0yLmluZGV4KVxuXHRcdHJldHVybiAxO1xuXHRlbHNlXG5cdHtcblx0XHQvLyBpZiBpbmRleCBpcyB0aGUgc2FtZSwgc29ydCBieSBsZW5ndGhcblx0XHRpZihtMS5sZW5ndGggPCBtMi5sZW5ndGgpXG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0ZWxzZSBpZihtMS5sZW5ndGggPiBtMi5sZW5ndGgpXG5cdFx0XHRyZXR1cm4gMTtcblx0fVxuXHRcblx0cmV0dXJuIDA7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBvbiBwcm92aWRlZCBjb2RlIGFuZCByZXR1cm5zIGFsbFxuICogbWF0Y2hlcyB0aGF0IGFyZSBmb3VuZC5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgICAgQ29kZSB0byBleGVjdXRlIHJlZ3VsYXIgZXhwcmVzc2lvbiBvbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSByZWdleCAgIFJlZ3VsYXIgZXhwcmVzc2lvbiBpdGVtIGluZm8gZnJvbSA8Y29kZT5yZWdleExpc3Q8L2NvZGU+IGNvbGxlY3Rpb24uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICBSZXR1cm5zIGEgbGlzdCBvZiBNYXRjaCBvYmplY3RzLlxuICovIFxuZnVuY3Rpb24gZ2V0TWF0Y2hlcyhjb2RlLCByZWdleEluZm8pXG57XG5cdGZ1bmN0aW9uIGRlZmF1bHRBZGQobWF0Y2gsIHJlZ2V4SW5mbylcblx0e1xuXHRcdHJldHVybiBtYXRjaFswXTtcblx0fTtcblx0XG5cdHZhciBpbmRleCA9IDAsXG5cdFx0bWF0Y2ggPSBudWxsLFxuXHRcdG1hdGNoZXMgPSBbXSxcblx0XHRmdW5jID0gcmVnZXhJbmZvLmZ1bmMgPyByZWdleEluZm8uZnVuYyA6IGRlZmF1bHRBZGRcblx0XHQ7XG5cdFxuXHR3aGlsZSgobWF0Y2ggPSByZWdleEluZm8ucmVnZXguZXhlYyhjb2RlKSkgIT0gbnVsbClcblx0e1xuXHRcdHZhciByZXN1bHRNYXRjaCA9IGZ1bmMobWF0Y2gsIHJlZ2V4SW5mbyk7XG5cdFx0XG5cdFx0aWYgKHR5cGVvZihyZXN1bHRNYXRjaCkgPT0gJ3N0cmluZycpXG5cdFx0XHRyZXN1bHRNYXRjaCA9IFtuZXcgc2guTWF0Y2gocmVzdWx0TWF0Y2gsIG1hdGNoLmluZGV4LCByZWdleEluZm8uY3NzKV07XG5cblx0XHRtYXRjaGVzID0gbWF0Y2hlcy5jb25jYXQocmVzdWx0TWF0Y2gpO1xuXHR9XG5cdFxuXHRyZXR1cm4gbWF0Y2hlcztcbn07XG5cbi8qKlxuICogVHVybnMgYWxsIFVSTHMgaW4gdGhlIGNvZGUgaW50byA8YS8+IHRhZ3MuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZSBJbnB1dCBjb2RlLlxuICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIGNvZGUgd2l0aCA8L2E+IHRhZ3MuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NVcmxzKGNvZGUpXG57XG5cdHZhciBndCA9IC8oLiopKCgmZ3Q7fCZsdDspLiopLztcblx0XG5cdHJldHVybiBjb2RlLnJlcGxhY2Uoc2gucmVnZXhMaWIudXJsLCBmdW5jdGlvbihtKVxuXHR7XG5cdFx0dmFyIHN1ZmZpeCA9ICcnLFxuXHRcdFx0bWF0Y2ggPSBudWxsXG5cdFx0XHQ7XG5cdFx0XG5cdFx0Ly8gV2UgaW5jbHVkZSAmbHQ7IGFuZCAmZ3Q7IGluIHRoZSBVUkwgZm9yIHRoZSBjb21tb24gY2FzZXMgbGlrZSA8aHR0cDovL2dvb2dsZS5jb20+XG5cdFx0Ly8gVGhlIHByb2JsZW0gaXMgdGhhdCB0aGV5IGdldCB0cmFuc2Zvcm1lZCBpbnRvICZsdDtodHRwOi8vZ29vZ2xlLmNvbSZndDtcblx0XHQvLyBXaGVyZSBhcyAmZ3Q7IGVhc2lseSBsb29rcyBsaWtlIHBhcnQgb2YgdGhlIFVSTCBzdHJpbmcuXG5cdFxuXHRcdGlmIChtYXRjaCA9IGd0LmV4ZWMobSkpXG5cdFx0e1xuXHRcdFx0bSA9IG1hdGNoWzFdO1xuXHRcdFx0c3VmZml4ID0gbWF0Y2hbMl07XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiAnPGEgaHJlZj1cIicgKyBtICsgJ1wiPicgKyBtICsgJzwvYT4nICsgc3VmZml4O1xuXHR9KTtcbn07XG5cbi8qKlxuICogRmluZHMgYWxsIDxTQ1JJUFQgVFlQRT1cInN5bnRheGhpZ2hsaWdodGVyXCIgLz4gZWxlbWVudHNzLlxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYXJyYXkgb2YgYWxsIGZvdW5kIFN5bnRheEhpZ2hsaWdodGVyIHRhZ3MuXG4gKi9cbmZ1bmN0aW9uIGdldFN5bnRheEhpZ2hsaWdodGVyU2NyaXB0VGFncygpXG57XG5cdHZhciB0YWdzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpLFxuXHRcdHJlc3VsdCA9IFtdXG5cdFx0O1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0YWdzLmxlbmd0aDsgaSsrKVxuXHRcdGlmICh0YWdzW2ldLnR5cGUgPT0gJ3N5bnRheGhpZ2hsaWdodGVyJylcblx0XHRcdHJlc3VsdC5wdXNoKHRhZ3NbaV0pO1xuXHRcdFx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFN0cmlwcyA8IVtDREFUQVtdXT4gZnJvbSA8U0NSSVBUIC8+IGNvbnRlbnQgYmVjYXVzZSBpdCBzaG91bGQgYmUgdXNlZFxuICogdGhlcmUgaW4gbW9zdCBjYXNlcyBmb3IgWEhUTUwgY29tcGxpYW5jZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBvcmlnaW5hbFx0SW5wdXQgY29kZS5cbiAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBjb2RlIHdpdGhvdXQgbGVhZGluZyA8IVtDREFUQVtdXT4gdGFncy5cbiAqL1xuZnVuY3Rpb24gc3RyaXBDRGF0YShvcmlnaW5hbClcbntcblx0dmFyIGxlZnQgPSAnPCFbQ0RBVEFbJyxcblx0XHRyaWdodCA9ICddXT4nLFxuXHRcdC8vIGZvciBzb21lIHJlYXNvbiBJRSBpbnNlcnRzIHNvbWUgbGVhZGluZyBibGFua3MgaGVyZVxuXHRcdGNvcHkgPSB0cmltKG9yaWdpbmFsKSxcblx0XHRjaGFuZ2VkID0gZmFsc2UsXG5cdFx0bGVmdExlbmd0aCA9IGxlZnQubGVuZ3RoLFxuXHRcdHJpZ2h0TGVuZ3RoID0gcmlnaHQubGVuZ3RoXG5cdFx0O1xuXHRcblx0aWYgKGNvcHkuaW5kZXhPZihsZWZ0KSA9PSAwKVxuXHR7XG5cdFx0Y29weSA9IGNvcHkuc3Vic3RyaW5nKGxlZnRMZW5ndGgpO1xuXHRcdGNoYW5nZWQgPSB0cnVlO1xuXHR9XG5cdFxuXHR2YXIgY29weUxlbmd0aCA9IGNvcHkubGVuZ3RoO1xuXHRcblx0aWYgKGNvcHkuaW5kZXhPZihyaWdodCkgPT0gY29weUxlbmd0aCAtIHJpZ2h0TGVuZ3RoKVxuXHR7XG5cdFx0Y29weSA9IGNvcHkuc3Vic3RyaW5nKDAsIGNvcHlMZW5ndGggLSByaWdodExlbmd0aCk7XG5cdFx0Y2hhbmdlZCA9IHRydWU7XG5cdH1cblx0XG5cdHJldHVybiBjaGFuZ2VkID8gY29weSA6IG9yaWdpbmFsO1xufTtcblxuXG4vKipcbiAqIFF1aWNrIGNvZGUgbW91c2UgZG91YmxlIGNsaWNrIGhhbmRsZXIuXG4gKi9cbmZ1bmN0aW9uIHF1aWNrQ29kZUhhbmRsZXIoZSlcbntcblx0dmFyIHRhcmdldCA9IGUudGFyZ2V0LFxuXHRcdGhpZ2hsaWdodGVyRGl2ID0gZmluZFBhcmVudEVsZW1lbnQodGFyZ2V0LCAnLnN5bnRheGhpZ2hsaWdodGVyJyksXG5cdFx0Y29udGFpbmVyID0gZmluZFBhcmVudEVsZW1lbnQodGFyZ2V0LCAnLmNvbnRhaW5lcicpLFxuXHRcdHRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKSxcblx0XHRoaWdobGlnaHRlclxuXHRcdDtcblxuXHRpZiAoIWNvbnRhaW5lciB8fCAhaGlnaGxpZ2h0ZXJEaXYgfHwgZmluZEVsZW1lbnQoY29udGFpbmVyLCAndGV4dGFyZWEnKSlcblx0XHRyZXR1cm47XG5cblx0aGlnaGxpZ2h0ZXIgPSBnZXRIaWdobGlnaHRlckJ5SWQoaGlnaGxpZ2h0ZXJEaXYuaWQpO1xuXHRcblx0Ly8gYWRkIHNvdXJjZSBjbGFzcyBuYW1lXG5cdGFkZENsYXNzKGhpZ2hsaWdodGVyRGl2LCAnc291cmNlJyk7XG5cblx0Ly8gSGF2ZSB0byBnbyBvdmVyIGVhY2ggbGluZSBhbmQgZ3JhYiBpdCdzIHRleHQsIGNhbid0IGp1c3QgZG8gaXQgb24gdGhlXG5cdC8vIGNvbnRhaW5lciBiZWNhdXNlIEZpcmVmb3ggbG9zZXMgYWxsIFxcbiB3aGVyZSBhcyBXZWJraXQgZG9lc24ndC5cblx0dmFyIGxpbmVzID0gY29udGFpbmVyLmNoaWxkTm9kZXMsXG5cdFx0Y29kZSA9IFtdXG5cdFx0O1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKylcblx0XHRjb2RlLnB1c2gobGluZXNbaV0uaW5uZXJUZXh0IHx8IGxpbmVzW2ldLnRleHRDb250ZW50KTtcblx0XG5cdC8vIHVzaW5nIFxcciBpbnN0ZWFkIG9mIFxcciBvciBcXHJcXG4gbWFrZXMgdGhpcyB3b3JrIGVxdWFsbHkgd2VsbCBvbiBJRSwgRkYgYW5kIFdlYmtpdFxuXHRjb2RlID0gY29kZS5qb2luKCdcXHInKTtcblxuICAgIC8vIEZvciBXZWJraXQgYnJvd3NlcnMsIHJlcGxhY2UgbmJzcCB3aXRoIGEgYnJlYWtpbmcgc3BhY2VcbiAgICBjb2RlID0gY29kZS5yZXBsYWNlKC9cXHUwMGEwL2csIFwiIFwiKTtcblx0XG5cdC8vIGluamVjdCA8dGV4dGFyZWEvPiB0YWdcblx0dGV4dGFyZWEuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY29kZSkpO1xuXHRjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuXHRcblx0Ly8gcHJlc2VsZWN0IGFsbCB0ZXh0XG5cdHRleHRhcmVhLmZvY3VzKCk7XG5cdHRleHRhcmVhLnNlbGVjdCgpO1xuXHRcblx0Ly8gc2V0IHVwIGhhbmRsZXIgZm9yIGxvc3QgZm9jdXNcblx0YXR0YWNoRXZlbnQodGV4dGFyZWEsICdibHVyJywgZnVuY3Rpb24oZSlcblx0e1xuXHRcdHRleHRhcmVhLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGV4dGFyZWEpO1xuXHRcdHJlbW92ZUNsYXNzKGhpZ2hsaWdodGVyRGl2LCAnc291cmNlJyk7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBNYXRjaCBvYmplY3QuXG4gKi9cbnNoLk1hdGNoID0gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjc3MpXG57XG5cdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0dGhpcy5pbmRleCA9IGluZGV4O1xuXHR0aGlzLmxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblx0dGhpcy5jc3MgPSBjc3M7XG5cdHRoaXMuYnJ1c2hOYW1lID0gbnVsbDtcbn07XG5cbnNoLk1hdGNoLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKClcbntcblx0cmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG4vKipcbiAqIFNpbXVsYXRlcyBIVE1MIGNvZGUgd2l0aCBhIHNjcmlwdGluZyBsYW5ndWFnZSBlbWJlZGRlZC5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IHNjcmlwdEJydXNoTmFtZSBCcnVzaCBuYW1lIG9mIHRoZSBzY3JpcHRpbmcgbGFuZ3VhZ2UuXG4gKi9cbnNoLkh0bWxTY3JpcHQgPSBmdW5jdGlvbihzY3JpcHRCcnVzaE5hbWUpXG57XG5cdHZhciBicnVzaENsYXNzID0gZmluZEJydXNoKHNjcmlwdEJydXNoTmFtZSksXG5cdFx0c2NyaXB0QnJ1c2gsXG5cdFx0eG1sQnJ1c2ggPSBuZXcgc2guYnJ1c2hlcy5YbWwoKSxcblx0XHRicmFja2V0c1JlZ2V4ID0gbnVsbCxcblx0XHRyZWYgPSB0aGlzLFxuXHRcdG1ldGhvZHNUb0V4cG9zZSA9ICdnZXREaXYgZ2V0SHRtbCBpbml0Jy5zcGxpdCgnICcpXG5cdFx0O1xuXG5cdGlmIChicnVzaENsYXNzID09IG51bGwpXG5cdFx0cmV0dXJuO1xuXHRcblx0c2NyaXB0QnJ1c2ggPSBuZXcgYnJ1c2hDbGFzcygpO1xuXHRcblx0Zm9yKHZhciBpID0gMDsgaSA8IG1ldGhvZHNUb0V4cG9zZS5sZW5ndGg7IGkrKylcblx0XHQvLyBtYWtlIGEgY2xvc3VyZSBzbyB3ZSBkb24ndCBsb3NlIHRoZSBuYW1lIGFmdGVyIGkgY2hhbmdlc1xuXHRcdChmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuYW1lID0gbWV0aG9kc1RvRXhwb3NlW2ldO1xuXHRcdFx0XG5cdFx0XHRyZWZbbmFtZV0gPSBmdW5jdGlvbigpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB4bWxCcnVzaFtuYW1lXS5hcHBseSh4bWxCcnVzaCwgYXJndW1lbnRzKTtcblx0XHRcdH07XG5cdFx0fSkoKTtcblx0XG5cdGlmIChzY3JpcHRCcnVzaC5odG1sU2NyaXB0ID09IG51bGwpXG5cdHtcblx0XHRhbGVydChzaC5jb25maWcuc3RyaW5ncy5icnVzaE5vdEh0bWxTY3JpcHQgKyBzY3JpcHRCcnVzaE5hbWUpO1xuXHRcdHJldHVybjtcblx0fVxuXHRcblx0eG1sQnJ1c2gucmVnZXhMaXN0LnB1c2goXG5cdFx0eyByZWdleDogc2NyaXB0QnJ1c2guaHRtbFNjcmlwdC5jb2RlLCBmdW5jOiBwcm9jZXNzIH1cblx0KTtcblx0XG5cdGZ1bmN0aW9uIG9mZnNldE1hdGNoZXMobWF0Y2hlcywgb2Zmc2V0KVxuXHR7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBtYXRjaGVzLmxlbmd0aDsgaisrKSBcblx0XHRcdG1hdGNoZXNbal0uaW5kZXggKz0gb2Zmc2V0O1xuXHR9XG5cdFxuXHRmdW5jdGlvbiBwcm9jZXNzKG1hdGNoLCBpbmZvKVxuXHR7XG5cdFx0dmFyIGNvZGUgPSBtYXRjaC5jb2RlLFxuXHRcdFx0bWF0Y2hlcyA9IFtdLFxuXHRcdFx0cmVnZXhMaXN0ID0gc2NyaXB0QnJ1c2gucmVnZXhMaXN0LFxuXHRcdFx0b2Zmc2V0ID0gbWF0Y2guaW5kZXggKyBtYXRjaC5sZWZ0Lmxlbmd0aCxcblx0XHRcdGh0bWxTY3JpcHQgPSBzY3JpcHRCcnVzaC5odG1sU2NyaXB0LFxuXHRcdFx0cmVzdWx0XG5cdFx0XHQ7XG5cblx0XHQvLyBhZGQgYWxsIG1hdGNoZXMgZnJvbSB0aGUgY29kZVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVnZXhMaXN0Lmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdHJlc3VsdCA9IGdldE1hdGNoZXMoY29kZSwgcmVnZXhMaXN0W2ldKTtcblx0XHRcdG9mZnNldE1hdGNoZXMocmVzdWx0LCBvZmZzZXQpO1xuXHRcdFx0bWF0Y2hlcyA9IG1hdGNoZXMuY29uY2F0KHJlc3VsdCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIGFkZCBsZWZ0IHNjcmlwdCBicmFja2V0XG5cdFx0aWYgKGh0bWxTY3JpcHQubGVmdCAhPSBudWxsICYmIG1hdGNoLmxlZnQgIT0gbnVsbClcblx0XHR7XG5cdFx0XHRyZXN1bHQgPSBnZXRNYXRjaGVzKG1hdGNoLmxlZnQsIGh0bWxTY3JpcHQubGVmdCk7XG5cdFx0XHRvZmZzZXRNYXRjaGVzKHJlc3VsdCwgbWF0Y2guaW5kZXgpO1xuXHRcdFx0bWF0Y2hlcyA9IG1hdGNoZXMuY29uY2F0KHJlc3VsdCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIGFkZCByaWdodCBzY3JpcHQgYnJhY2tldFxuXHRcdGlmIChodG1sU2NyaXB0LnJpZ2h0ICE9IG51bGwgJiYgbWF0Y2gucmlnaHQgIT0gbnVsbClcblx0XHR7XG5cdFx0XHRyZXN1bHQgPSBnZXRNYXRjaGVzKG1hdGNoLnJpZ2h0LCBodG1sU2NyaXB0LnJpZ2h0KTtcblx0XHRcdG9mZnNldE1hdGNoZXMocmVzdWx0LCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxhc3RJbmRleE9mKG1hdGNoLnJpZ2h0KSk7XG5cdFx0XHRtYXRjaGVzID0gbWF0Y2hlcy5jb25jYXQocmVzdWx0KTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBtYXRjaGVzLmxlbmd0aDsgaisrKVxuXHRcdFx0bWF0Y2hlc1tqXS5icnVzaE5hbWUgPSBicnVzaENsYXNzLmJydXNoTmFtZTtcblx0XHRcdFxuXHRcdHJldHVybiBtYXRjaGVzO1xuXHR9XG59O1xuXG4vKipcbiAqIE1haW4gSGlnaGxpdGhlciBjbGFzcy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5zaC5IaWdobGlnaHRlciA9IGZ1bmN0aW9uKClcbntcblx0Ly8gbm90IHB1dHRpbmcgYW55IGNvZGUgaW4gaGVyZSBiZWNhdXNlIG9mIHRoZSBwcm90b3R5cGUgaW5oZXJpdGFuY2Vcbn07XG5cbnNoLkhpZ2hsaWdodGVyLnByb3RvdHlwZSA9IHtcblx0LyoqXG5cdCAqIFJldHVybnMgdmFsdWUgb2YgdGhlIHBhcmFtZXRlciBwYXNzZWQgdG8gdGhlIGhpZ2hsaWdodGVyLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVx0XHRcdFx0TmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdFZhbHVlXHRcdERlZmF1bHQgdmFsdWUuXG5cdCAqIEByZXR1cm4ge09iamVjdH1cdFx0XHRcdFx0UmV0dXJucyBmb3VuZCB2YWx1ZSBvciBkZWZhdWx0IHZhbHVlIG90aGVyd2lzZS5cblx0ICovXG5cdGdldFBhcmFtOiBmdW5jdGlvbihuYW1lLCBkZWZhdWx0VmFsdWUpXG5cdHtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5wYXJhbXNbbmFtZV07XG5cdFx0cmV0dXJuIHRvQm9vbGVhbihyZXN1bHQgPT0gbnVsbCA/IGRlZmF1bHRWYWx1ZSA6IHJlc3VsdCk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogU2hvcnRjdXQgdG8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgpLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVx0XHROYW1lIG9mIHRoZSBlbGVtZW50IHRvIGNyZWF0ZSAoRElWLCBBLCBldGMpLlxuXHQgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH1cdFJldHVybnMgbmV3IEhUTUwgZWxlbWVudC5cblx0ICovXG5cdGNyZWF0ZTogZnVuY3Rpb24obmFtZSlcblx0e1xuXHRcdHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEFwcGxpZXMgYWxsIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byB0aGUgY29kZSBhbmQgc3RvcmVzIGFsbCBmb3VuZFxuXHQgKiBtYXRjaGVzIGluIHRoZSBgdGhpcy5tYXRjaGVzYCBhcnJheS5cblx0ICogQHBhcmFtIHtBcnJheX0gcmVnZXhMaXN0XHRcdExpc3Qgb2YgcmVndWxhciBleHByZXNzaW9ucy5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGVcdFx0XHRTb3VyY2UgY29kZS5cblx0ICogQHJldHVybiB7QXJyYXl9XHRcdFx0XHRSZXR1cm5zIGxpc3Qgb2YgbWF0Y2hlcy5cblx0ICovXG5cdGZpbmRNYXRjaGVzOiBmdW5jdGlvbihyZWdleExpc3QsIGNvZGUpXG5cdHtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0XG5cdFx0aWYgKHJlZ2V4TGlzdCAhPSBudWxsKVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZWdleExpc3QubGVuZ3RoOyBpKyspIFxuXHRcdFx0XHQvLyBCVUc6IGxlbmd0aCByZXR1cm5zIGxlbisxIGZvciBhcnJheSBpZiBtZXRob2RzIGFkZGVkIHRvIHByb3RvdHlwZSBjaGFpbiAob2lzaW5nQGdtYWlsLmNvbSlcblx0XHRcdFx0aWYgKHR5cGVvZiAocmVnZXhMaXN0W2ldKSA9PSBcIm9iamVjdFwiKVxuXHRcdFx0XHRcdHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZ2V0TWF0Y2hlcyhjb2RlLCByZWdleExpc3RbaV0pKTtcblx0XHRcblx0XHQvLyBzb3J0IGFuZCByZW1vdmUgbmVzdGVkIHRoZSBtYXRjaGVzXG5cdFx0cmV0dXJuIHRoaXMucmVtb3ZlTmVzdGVkTWF0Y2hlcyhyZXN1bHQuc29ydChtYXRjaGVzU29ydENhbGxiYWNrKSk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQ2hlY2tzIHRvIHNlZSBpZiBhbnkgb2YgdGhlIG1hdGNoZXMgYXJlIGluc2lkZSBvZiBvdGhlciBtYXRjaGVzLiBcblx0ICogVGhpcyBwcm9jZXNzIHdvdWxkIGdldCByaWQgb2YgaGlnaGxpZ3RlZCBzdHJpbmdzIGluc2lkZSBjb21tZW50cywgXG5cdCAqIGtleXdvcmRzIGluc2lkZSBzdHJpbmdzIGFuZCBzbyBvbi5cblx0ICovXG5cdHJlbW92ZU5lc3RlZE1hdGNoZXM6IGZ1bmN0aW9uKG1hdGNoZXMpXG5cdHtcblx0XHQvLyBPcHRpbWl6ZWQgYnkgSm9zZSBQcmFkbyAoaHR0cDovL2pvc2VwcmFkby5jb20pXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGVzLmxlbmd0aDsgaSsrKSBcblx0XHR7IFxuXHRcdFx0aWYgKG1hdGNoZXNbaV0gPT09IG51bGwpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgaXRlbUkgPSBtYXRjaGVzW2ldLFxuXHRcdFx0XHRpdGVtSUVuZFBvcyA9IGl0ZW1JLmluZGV4ICsgaXRlbUkubGVuZ3RoXG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgbWF0Y2hlcy5sZW5ndGggJiYgbWF0Y2hlc1tpXSAhPT0gbnVsbDsgaisrKSBcblx0XHRcdHtcblx0XHRcdFx0dmFyIGl0ZW1KID0gbWF0Y2hlc1tqXTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChpdGVtSiA9PT0gbnVsbCkgXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdGVsc2UgaWYgKGl0ZW1KLmluZGV4ID4gaXRlbUlFbmRQb3MpIFxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRlbHNlIGlmIChpdGVtSi5pbmRleCA9PSBpdGVtSS5pbmRleCAmJiBpdGVtSi5sZW5ndGggPiBpdGVtSS5sZW5ndGgpXG5cdFx0XHRcdFx0bWF0Y2hlc1tpXSA9IG51bGw7XG5cdFx0XHRcdGVsc2UgaWYgKGl0ZW1KLmluZGV4ID49IGl0ZW1JLmluZGV4ICYmIGl0ZW1KLmluZGV4IDwgaXRlbUlFbmRQb3MpIFxuXHRcdFx0XHRcdG1hdGNoZXNbal0gPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbWF0Y2hlcztcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IGNvbnRhaW5pbmcgaW50ZWdlciBsaW5lIG51bWJlcnMgc3RhcnRpbmcgZnJvbSB0aGUgJ2ZpcnN0LWxpbmUnIHBhcmFtLlxuXHQgKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhcnJheSBvZiBpbnRlZ2Vycy5cblx0ICovXG5cdGZpZ3VyZU91dExpbmVOdW1iZXJzOiBmdW5jdGlvbihjb2RlKVxuXHR7XG5cdFx0dmFyIGxpbmVzID0gW10sXG5cdFx0XHRmaXJzdExpbmUgPSBwYXJzZUludCh0aGlzLmdldFBhcmFtKCdmaXJzdC1saW5lJykpXG5cdFx0XHQ7XG5cdFx0XG5cdFx0ZWFjaExpbmUoY29kZSwgZnVuY3Rpb24obGluZSwgaW5kZXgpXG5cdFx0e1xuXHRcdFx0bGluZXMucHVzaChpbmRleCArIGZpcnN0TGluZSk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmVzO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIERldGVybWluZXMgaWYgc3BlY2lmaWVkIGxpbmUgbnVtYmVyIGlzIGluIHRoZSBoaWdobGlnaHRlZCBsaXN0LlxuXHQgKi9cblx0aXNMaW5lSGlnaGxpZ2h0ZWQ6IGZ1bmN0aW9uKGxpbmVOdW1iZXIpXG5cdHtcblx0XHR2YXIgbGlzdCA9IHRoaXMuZ2V0UGFyYW0oJ2hpZ2hsaWdodCcsIFtdKTtcblx0XHRcblx0XHRpZiAodHlwZW9mKGxpc3QpICE9ICdvYmplY3QnICYmIGxpc3QucHVzaCA9PSBudWxsKSBcblx0XHRcdGxpc3QgPSBbIGxpc3QgXTtcblx0XHRcblx0XHRyZXR1cm4gaW5kZXhPZihsaXN0LCBsaW5lTnVtYmVyLnRvU3RyaW5nKCkpICE9IC0xO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgYSBzaW5nbGUgbGluZSBvZiBjb2RlIHdoaWxlIGRldGVybWluaW5nIGFsdGVybmF0aW5nIGxpbmUgc3R5bGUuXG5cdCAqIEBwYXJhbSB7SW50ZWdlcn0gbGluZU51bWJlclx0TGluZSBudW1iZXIuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlIExpbmVcdEhUTUwgbWFya3VwLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0XHRSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHQgKi9cblx0Z2V0TGluZUh0bWw6IGZ1bmN0aW9uKGxpbmVJbmRleCwgbGluZU51bWJlciwgY29kZSlcblx0e1xuXHRcdHZhciBjbGFzc2VzID0gW1xuXHRcdFx0J2xpbmUnLFxuXHRcdFx0J251bWJlcicgKyBsaW5lTnVtYmVyLFxuXHRcdFx0J2luZGV4JyArIGxpbmVJbmRleCxcblx0XHRcdCdhbHQnICsgKGxpbmVOdW1iZXIgJSAyID09IDAgPyAxIDogMikudG9TdHJpbmcoKVxuXHRcdF07XG5cdFx0XG5cdFx0aWYgKHRoaXMuaXNMaW5lSGlnaGxpZ2h0ZWQobGluZU51bWJlcikpXG5cdFx0IFx0Y2xhc3Nlcy5wdXNoKCdoaWdobGlnaHRlZCcpO1xuXHRcdFxuXHRcdGlmIChsaW5lTnVtYmVyID09IDApXG5cdFx0XHRjbGFzc2VzLnB1c2goJ2JyZWFrJyk7XG5cdFx0XHRcblx0XHRyZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY2xhc3Nlcy5qb2luKCcgJykgKyAnXCI+JyArIGNvZGUgKyAnPC9kaXY+Jztcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIGxpbmUgbnVtYmVyIGNvbHVtbi5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGVcdFx0XHRDb21wbGV0ZSBjb2RlIEhUTUwgbWFya3VwLlxuXHQgKiBAcGFyYW0ge0FycmF5fSBsaW5lTnVtYmVyc1x0Q2FsY3VsYXRlZCBsaW5lIG51bWJlcnMuXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRcdFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdCAqL1xuXHRnZXRMaW5lTnVtYmVyc0h0bWw6IGZ1bmN0aW9uKGNvZGUsIGxpbmVOdW1iZXJzKVxuXHR7XG5cdFx0dmFyIGh0bWwgPSAnJyxcblx0XHRcdGNvdW50ID0gc3BsaXRMaW5lcyhjb2RlKS5sZW5ndGgsXG5cdFx0XHRmaXJzdExpbmUgPSBwYXJzZUludCh0aGlzLmdldFBhcmFtKCdmaXJzdC1saW5lJykpLFxuXHRcdFx0cGFkID0gdGhpcy5nZXRQYXJhbSgncGFkLWxpbmUtbnVtYmVycycpXG5cdFx0XHQ7XG5cdFx0XG5cdFx0aWYgKHBhZCA9PSB0cnVlKVxuXHRcdFx0cGFkID0gKGZpcnN0TGluZSArIGNvdW50IC0gMSkudG9TdHJpbmcoKS5sZW5ndGg7XG5cdFx0ZWxzZSBpZiAoaXNOYU4ocGFkKSA9PSB0cnVlKVxuXHRcdFx0cGFkID0gMDtcblx0XHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKylcblx0XHR7XG5cdFx0XHR2YXIgbGluZU51bWJlciA9IGxpbmVOdW1iZXJzID8gbGluZU51bWJlcnNbaV0gOiBmaXJzdExpbmUgKyBpLFxuXHRcdFx0XHRjb2RlID0gbGluZU51bWJlciA9PSAwID8gc2guY29uZmlnLnNwYWNlIDogcGFkTnVtYmVyKGxpbmVOdW1iZXIsIHBhZClcblx0XHRcdFx0O1xuXHRcdFx0XHRcblx0XHRcdGh0bWwgKz0gdGhpcy5nZXRMaW5lSHRtbChpLCBsaW5lTnVtYmVyLCBjb2RlKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogU3BsaXRzIGJsb2NrIG9mIHRleHQgaW50byBpbmRpdmlkdWFsIERJViBsaW5lcy5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGVcdFx0XHRDb2RlIHRvIGhpZ2hsaWdodC5cblx0ICogQHBhcmFtIHtBcnJheX0gbGluZU51bWJlcnNcdENhbGN1bGF0ZWQgbGluZSBudW1iZXJzLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0XHRSZXR1cm5zIGhpZ2hsaWdodGVkIGNvZGUgaW4gSFRNTCBmb3JtLlxuXHQgKi9cblx0Z2V0Q29kZUxpbmVzSHRtbDogZnVuY3Rpb24oaHRtbCwgbGluZU51bWJlcnMpXG5cdHtcblx0XHRodG1sID0gdHJpbShodG1sKTtcblx0XHRcblx0XHR2YXIgbGluZXMgPSBzcGxpdExpbmVzKGh0bWwpLFxuXHRcdFx0cGFkTGVuZ3RoID0gdGhpcy5nZXRQYXJhbSgncGFkLWxpbmUtbnVtYmVycycpLFxuXHRcdFx0Zmlyc3RMaW5lID0gcGFyc2VJbnQodGhpcy5nZXRQYXJhbSgnZmlyc3QtbGluZScpKSxcblx0XHRcdGh0bWwgPSAnJyxcblx0XHRcdGJydXNoTmFtZSA9IHRoaXMuZ2V0UGFyYW0oJ2JydXNoJylcblx0XHRcdDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGxpbmUgPSBsaW5lc1tpXSxcblx0XHRcdFx0aW5kZW50ID0gL14oJm5ic3A7fFxccykrLy5leGVjKGxpbmUpLFxuXHRcdFx0XHRzcGFjZXMgPSBudWxsLFxuXHRcdFx0XHRsaW5lTnVtYmVyID0gbGluZU51bWJlcnMgPyBsaW5lTnVtYmVyc1tpXSA6IGZpcnN0TGluZSArIGk7XG5cdFx0XHRcdDtcblxuXHRcdFx0aWYgKGluZGVudCAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRzcGFjZXMgPSBpbmRlbnRbMF0udG9TdHJpbmcoKTtcblx0XHRcdFx0bGluZSA9IGxpbmUuc3Vic3RyKHNwYWNlcy5sZW5ndGgpO1xuXHRcdFx0XHRzcGFjZXMgPSBzcGFjZXMucmVwbGFjZSgnICcsIHNoLmNvbmZpZy5zcGFjZSk7XG5cdFx0XHR9XG5cblx0XHRcdGxpbmUgPSB0cmltKGxpbmUpO1xuXHRcdFx0XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT0gMClcblx0XHRcdFx0bGluZSA9IHNoLmNvbmZpZy5zcGFjZTtcblx0XHRcdFxuXHRcdFx0aHRtbCArPSB0aGlzLmdldExpbmVIdG1sKFxuXHRcdFx0XHRpLFxuXHRcdFx0XHRsaW5lTnVtYmVyLCBcblx0XHRcdFx0KHNwYWNlcyAhPSBudWxsID8gJzxjb2RlIGNsYXNzPVwiJyArIGJydXNoTmFtZSArICcgc3BhY2VzXCI+JyArIHNwYWNlcyArICc8L2NvZGU+JyA6ICcnKSArIGxpbmVcblx0XHRcdCk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgSFRNTCBmb3IgdGhlIHRhYmxlIHRpdGxlIG9yIGVtcHR5IHN0cmluZyBpZiB0aXRsZSBpcyBudWxsLlxuXHQgKi9cblx0Z2V0VGl0bGVIdG1sOiBmdW5jdGlvbih0aXRsZSlcblx0e1xuXHRcdHJldHVybiB0aXRsZSA/ICc8Y2FwdGlvbj4nICsgdGl0bGUgKyAnPC9jYXB0aW9uPicgOiAnJztcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBGaW5kcyBhbGwgbWF0Y2hlcyBpbiB0aGUgc291cmNlIGNvZGUuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFNvdXJjZSBjb2RlIHRvIHByb2Nlc3MgbWF0Y2hlcyBpbi5cblx0ICogQHBhcmFtIHtBcnJheX0gbWF0Y2hlc1x0RGlzY292ZXJlZCByZWdleCBtYXRjaGVzLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgZm9ybWF0dGVkIEhUTUwgd2l0aCBwcm9jZXNzZWQgbWF0aGVzLlxuXHQgKi9cblx0Z2V0TWF0Y2hlc0h0bWw6IGZ1bmN0aW9uKGNvZGUsIG1hdGNoZXMpXG5cdHtcblx0XHR2YXIgcG9zID0gMCwgXG5cdFx0XHRyZXN1bHQgPSAnJyxcblx0XHRcdGJydXNoTmFtZSA9IHRoaXMuZ2V0UGFyYW0oJ2JydXNoJywgJycpXG5cdFx0XHQ7XG5cdFx0XG5cdFx0ZnVuY3Rpb24gZ2V0QnJ1c2hOYW1lQ3NzKG1hdGNoKVxuXHRcdHtcblx0XHRcdHZhciByZXN1bHQgPSBtYXRjaCA/IChtYXRjaC5icnVzaE5hbWUgfHwgYnJ1c2hOYW1lKSA6IGJydXNoTmFtZTtcblx0XHRcdHJldHVybiByZXN1bHQgPyByZXN1bHQgKyAnICcgOiAnJztcblx0XHR9O1xuXHRcdFxuXHRcdC8vIEZpbmFsbHksIGdvIHRocm91Z2ggdGhlIGZpbmFsIGxpc3Qgb2YgbWF0Y2hlcyBhbmQgcHVsbCB0aGUgYWxsXG5cdFx0Ly8gdG9nZXRoZXIgYWRkaW5nIGV2ZXJ5dGhpbmcgaW4gYmV0d2VlbiB0aGF0IGlzbid0IGEgbWF0Y2guXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGVzLmxlbmd0aDsgaSsrKSBcblx0XHR7XG5cdFx0XHR2YXIgbWF0Y2ggPSBtYXRjaGVzW2ldLFxuXHRcdFx0XHRtYXRjaEJydXNoTmFtZVxuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdGlmIChtYXRjaCA9PT0gbnVsbCB8fCBtYXRjaC5sZW5ndGggPT09IDApIFxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0bWF0Y2hCcnVzaE5hbWUgPSBnZXRCcnVzaE5hbWVDc3MobWF0Y2gpO1xuXHRcdFx0XG5cdFx0XHRyZXN1bHQgKz0gd3JhcExpbmVzV2l0aENvZGUoY29kZS5zdWJzdHIocG9zLCBtYXRjaC5pbmRleCAtIHBvcyksIG1hdGNoQnJ1c2hOYW1lICsgJ3BsYWluJylcblx0XHRcdFx0XHQrIHdyYXBMaW5lc1dpdGhDb2RlKG1hdGNoLnZhbHVlLCBtYXRjaEJydXNoTmFtZSArIG1hdGNoLmNzcylcblx0XHRcdFx0XHQ7XG5cblx0XHRcdHBvcyA9IG1hdGNoLmluZGV4ICsgbWF0Y2gubGVuZ3RoICsgKG1hdGNoLm9mZnNldCB8fCAwKTtcblx0XHR9XG5cblx0XHQvLyBkb24ndCBmb3JnZXQgdG8gYWRkIHdoYXRldmVyJ3MgcmVtYWluaW5nIGluIHRoZSBzdHJpbmdcblx0XHRyZXN1bHQgKz0gd3JhcExpbmVzV2l0aENvZGUoY29kZS5zdWJzdHIocG9zKSwgZ2V0QnJ1c2hOYW1lQ3NzKCkgKyAncGxhaW4nKTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciB0aGUgd2hvbGUgc3ludGF4IGhpZ2hsaWdodGVyLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZSBTb3VyY2UgY29kZS5cblx0ICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHQgKi9cblx0Z2V0SHRtbDogZnVuY3Rpb24oY29kZSlcblx0e1xuXHRcdHZhciBodG1sID0gJycsXG5cdFx0XHRjbGFzc2VzID0gWyAnc3ludGF4aGlnaGxpZ2h0ZXInIF0sXG5cdFx0XHR0YWJTaXplLFxuXHRcdFx0bWF0Y2hlcyxcblx0XHRcdGxpbmVOdW1iZXJzXG5cdFx0XHQ7XG5cdFx0XG5cdFx0Ly8gcHJvY2VzcyBsaWdodCBtb2RlXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ2xpZ2h0JykgPT0gdHJ1ZSlcblx0XHRcdHRoaXMucGFyYW1zLnRvb2xiYXIgPSB0aGlzLnBhcmFtcy5ndXR0ZXIgPSBmYWxzZTtcblxuXHRcdGNsYXNzTmFtZSA9ICdzeW50YXhoaWdobGlnaHRlcic7XG5cblx0XHRpZiAodGhpcy5nZXRQYXJhbSgnY29sbGFwc2UnKSA9PSB0cnVlKVxuXHRcdFx0Y2xhc3Nlcy5wdXNoKCdjb2xsYXBzZWQnKTtcblx0XHRcblx0XHRpZiAoKGd1dHRlciA9IHRoaXMuZ2V0UGFyYW0oJ2d1dHRlcicpKSA9PSBmYWxzZSlcblx0XHRcdGNsYXNzZXMucHVzaCgnbm9ndXR0ZXInKTtcblxuXHRcdC8vIGFkZCBjdXN0b20gdXNlciBzdHlsZSBuYW1lXG5cdFx0Y2xhc3Nlcy5wdXNoKHRoaXMuZ2V0UGFyYW0oJ2NsYXNzLW5hbWUnKSk7XG5cblx0XHQvLyBhZGQgYnJ1c2ggYWxpYXMgdG8gdGhlIGNsYXNzIG5hbWUgZm9yIGN1c3RvbSBDU1Ncblx0XHRjbGFzc2VzLnB1c2godGhpcy5nZXRQYXJhbSgnYnJ1c2gnKSk7XG5cblx0XHRjb2RlID0gdHJpbUZpcnN0QW5kTGFzdExpbmVzKGNvZGUpXG5cdFx0XHQucmVwbGFjZSgvXFxyL2csICcgJykgLy8gSUUgbGV0cyB0aGVzZSBidWdnZXJzIHRocm91Z2hcblx0XHRcdDtcblxuXHRcdHRhYlNpemUgPSB0aGlzLmdldFBhcmFtKCd0YWItc2l6ZScpO1xuXG5cdFx0Ly8gcmVwbGFjZSB0YWJzIHdpdGggc3BhY2VzXG5cdFx0Y29kZSA9IHRoaXMuZ2V0UGFyYW0oJ3NtYXJ0LXRhYnMnKSA9PSB0cnVlXG5cdFx0XHQ/IHByb2Nlc3NTbWFydFRhYnMoY29kZSwgdGFiU2l6ZSlcblx0XHRcdDogcHJvY2Vzc1RhYnMoY29kZSwgdGFiU2l6ZSlcblx0XHRcdDtcblxuXHRcdC8vIHVuaW5kZW50IGNvZGUgYnkgdGhlIGNvbW1vbiBpbmRlbnRhdGlvblxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCd1bmluZGVudCcpKVxuXHRcdFx0Y29kZSA9IHVuaW5kZW50KGNvZGUpO1xuXG5cdFx0aWYgKGd1dHRlcilcblx0XHRcdGxpbmVOdW1iZXJzID0gdGhpcy5maWd1cmVPdXRMaW5lTnVtYmVycyhjb2RlKTtcblx0XHRcblx0XHQvLyBmaW5kIG1hdGNoZXMgaW4gdGhlIGNvZGUgdXNpbmcgYnJ1c2hlcyByZWdleCBsaXN0XG5cdFx0bWF0Y2hlcyA9IHRoaXMuZmluZE1hdGNoZXModGhpcy5yZWdleExpc3QsIGNvZGUpO1xuXHRcdC8vIHByb2Nlc3NlcyBmb3VuZCBtYXRjaGVzIGludG8gdGhlIGh0bWxcblx0XHRodG1sID0gdGhpcy5nZXRNYXRjaGVzSHRtbChjb2RlLCBtYXRjaGVzKTtcblx0XHQvLyBmaW5hbGx5LCBzcGxpdCBhbGwgbGluZXMgc28gdGhhdCB0aGV5IHdyYXAgd2VsbFxuXHRcdGh0bWwgPSB0aGlzLmdldENvZGVMaW5lc0h0bWwoaHRtbCwgbGluZU51bWJlcnMpO1xuXG5cdFx0Ly8gZmluYWxseSwgcHJvY2VzcyB0aGUgbGlua3Ncblx0XHRpZiAodGhpcy5nZXRQYXJhbSgnYXV0by1saW5rcycpKVxuXHRcdFx0aHRtbCA9IHByb2Nlc3NVcmxzKGh0bWwpO1xuXHRcdFxuXHRcdGlmICh0eXBlb2YobmF2aWdhdG9yKSAhPSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL01TSUUvKSlcblx0XHRcdGNsYXNzZXMucHVzaCgnaWUnKTtcblx0XHRcblx0XHRodG1sID0gXG5cdFx0XHQnPGRpdiBpZD1cIicgKyBnZXRIaWdobGlnaHRlcklkKHRoaXMuaWQpICsgJ1wiIGNsYXNzPVwiJyArIGNsYXNzZXMuam9pbignICcpICsgJ1wiPidcblx0XHRcdFx0KyAodGhpcy5nZXRQYXJhbSgndG9vbGJhcicpID8gc2gudG9vbGJhci5nZXRIdG1sKHRoaXMpIDogJycpXG5cdFx0XHRcdCsgJzx0YWJsZSBib3JkZXI9XCIwXCIgY2VsbHBhZGRpbmc9XCIwXCIgY2VsbHNwYWNpbmc9XCIwXCI+J1xuXHRcdFx0XHRcdCsgdGhpcy5nZXRUaXRsZUh0bWwodGhpcy5nZXRQYXJhbSgndGl0bGUnKSlcblx0XHRcdFx0XHQrICc8dGJvZHk+J1xuXHRcdFx0XHRcdFx0KyAnPHRyPidcblx0XHRcdFx0XHRcdFx0KyAoZ3V0dGVyID8gJzx0ZCBjbGFzcz1cImd1dHRlclwiPicgKyB0aGlzLmdldExpbmVOdW1iZXJzSHRtbChjb2RlKSArICc8L3RkPicgOiAnJylcblx0XHRcdFx0XHRcdFx0KyAnPHRkIGNsYXNzPVwiY29kZVwiPidcblx0XHRcdFx0XHRcdFx0XHQrICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+J1xuXHRcdFx0XHRcdFx0XHRcdFx0KyBodG1sXG5cdFx0XHRcdFx0XHRcdFx0KyAnPC9kaXY+J1xuXHRcdFx0XHRcdFx0XHQrICc8L3RkPidcblx0XHRcdFx0XHRcdCsgJzwvdHI+J1xuXHRcdFx0XHRcdCsgJzwvdGJvZHk+J1xuXHRcdFx0XHQrICc8L3RhYmxlPidcblx0XHRcdCsgJzwvZGl2Pidcblx0XHRcdDtcblx0XHRcdFxuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEhpZ2hsaWdodHMgdGhlIGNvZGUgYW5kIHJldHVybnMgY29tcGxldGUgSFRNTC5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgICAgIENvZGUgdG8gaGlnaGxpZ2h0LlxuXHQgKiBAcmV0dXJuIHtFbGVtZW50fSAgICAgICAgUmV0dXJucyBjb250YWluZXIgRElWIGVsZW1lbnQgd2l0aCBhbGwgbWFya3VwLlxuXHQgKi9cblx0Z2V0RGl2OiBmdW5jdGlvbihjb2RlKVxuXHR7XG5cdFx0aWYgKGNvZGUgPT09IG51bGwpIFxuXHRcdFx0Y29kZSA9ICcnO1xuXHRcdFxuXHRcdHRoaXMuY29kZSA9IGNvZGU7XG5cblx0XHR2YXIgZGl2ID0gdGhpcy5jcmVhdGUoJ2RpdicpO1xuXG5cdFx0Ly8gY3JlYXRlIG1haW4gSFRNTFxuXHRcdGRpdi5pbm5lckhUTUwgPSB0aGlzLmdldEh0bWwoY29kZSk7XG5cdFx0XG5cdFx0Ly8gc2V0IHVwIGNsaWNrIGhhbmRsZXJzXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ3Rvb2xiYXInKSlcblx0XHRcdGF0dGFjaEV2ZW50KGZpbmRFbGVtZW50KGRpdiwgJy50b29sYmFyJyksICdjbGljaycsIHNoLnRvb2xiYXIuaGFuZGxlcik7XG5cdFx0XG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ3F1aWNrLWNvZGUnKSlcblx0XHRcdGF0dGFjaEV2ZW50KGZpbmRFbGVtZW50KGRpdiwgJy5jb2RlJyksICdkYmxjbGljaycsIHF1aWNrQ29kZUhhbmRsZXIpO1xuXHRcdFxuXHRcdHJldHVybiBkaXY7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGhpZ2hsaWdodGVyL2JydXNoLlxuXHQgKlxuXHQgKiBDb25zdHJ1Y3RvciBpc24ndCB1c2VkIGZvciBpbml0aWFsaXphdGlvbiBzbyB0aGF0IG5vdGhpbmcgZXhlY3V0ZXMgZHVyaW5nIG5lY2Vzc2FyeVxuXHQgKiBgbmV3IFN5bnRheEhpZ2hsaWdodGVyLkhpZ2hsaWdodGVyKClgIGNhbGwgd2hlbiBzZXR0aW5nIHVwIGJydXNoIGluaGVyaXRlbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0hhc2h9IHBhcmFtcyBIaWdobGlnaHRlciBwYXJhbWV0ZXJzLlxuXHQgKi9cblx0aW5pdDogZnVuY3Rpb24ocGFyYW1zKVxuXHR7XG5cdFx0dGhpcy5pZCA9IGd1aWQoKTtcblx0XHRcblx0XHQvLyByZWdpc3RlciB0aGlzIGluc3RhbmNlIGluIHRoZSBoaWdobGlnaHRlcnMgbGlzdFxuXHRcdHN0b3JlSGlnaGxpZ2h0ZXIodGhpcyk7XG5cdFx0XG5cdFx0Ly8gbG9jYWwgcGFyYW1zIHRha2UgcHJlY2VkZW5jZSBvdmVyIGRlZmF1bHRzXG5cdFx0dGhpcy5wYXJhbXMgPSBtZXJnZShzaC5kZWZhdWx0cywgcGFyYW1zIHx8IHt9KVxuXHRcdFxuXHRcdC8vIHByb2Nlc3MgbGlnaHQgbW9kZVxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdsaWdodCcpID09IHRydWUpXG5cdFx0XHR0aGlzLnBhcmFtcy50b29sYmFyID0gdGhpcy5wYXJhbXMuZ3V0dGVyID0gZmFsc2U7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQ29udmVydHMgc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2Yga2V5d29yZHMgaW50byBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmcuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICAgU3BhY2Ugc2VwYXJhdGVkIGtleXdvcmRzLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgIFJldHVybnMgcmVndWxhciBleHByZXNzaW9uIHN0cmluZy5cblx0ICovXG5cdGdldEtleXdvcmRzOiBmdW5jdGlvbihzdHIpXG5cdHtcblx0XHRzdHIgPSBzdHJcblx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXHMrL2csICd8Jylcblx0XHRcdDtcblx0XHRcblx0XHRyZXR1cm4gJ1xcXFxiKD86JyArIHN0ciArICcpXFxcXGInO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIE1ha2VzIGEgYnJ1c2ggY29tcGF0aWJsZSB3aXRoIHRoZSBgaHRtbC1zY3JpcHRgIGZ1bmN0aW9uYWxpdHkuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSByZWdleEdyb3VwIE9iamVjdCBjb250YWluaW5nIGBsZWZ0YCBhbmQgYHJpZ2h0YCByZWd1bGFyIGV4cHJlc3Npb25zLlxuXHQgKi9cblx0Zm9ySHRtbFNjcmlwdDogZnVuY3Rpb24ocmVnZXhHcm91cClcblx0e1xuXHRcdHZhciByZWdleCA9IHsgJ2VuZCcgOiByZWdleEdyb3VwLnJpZ2h0LnNvdXJjZSB9O1xuXG5cdFx0aWYocmVnZXhHcm91cC5lb2YpXG5cdFx0XHRyZWdleC5lbmQgPSBcIig/Oig/OlwiICsgcmVnZXguZW5kICsgXCIpfCQpXCI7XG5cdFx0XG5cdFx0dGhpcy5odG1sU2NyaXB0ID0ge1xuXHRcdFx0bGVmdCA6IHsgcmVnZXg6IHJlZ2V4R3JvdXAubGVmdCwgY3NzOiAnc2NyaXB0JyB9LFxuXHRcdFx0cmlnaHQgOiB7IHJlZ2V4OiByZWdleEdyb3VwLnJpZ2h0LCBjc3M6ICdzY3JpcHQnIH0sXG5cdFx0XHRjb2RlIDogbmV3IFhSZWdFeHAoXG5cdFx0XHRcdFwiKD88bGVmdD5cIiArIHJlZ2V4R3JvdXAubGVmdC5zb3VyY2UgKyBcIilcIiArXG5cdFx0XHRcdFwiKD88Y29kZT4uKj8pXCIgK1xuXHRcdFx0XHRcIig/PHJpZ2h0PlwiICsgcmVnZXguZW5kICsgXCIpXCIsXG5cdFx0XHRcdFwic2dpXCJcblx0XHRcdFx0KVxuXHRcdH07XG5cdH1cbn07IC8vIGVuZCBvZiBIaWdobGlnaHRlclxuXG5yZXR1cm4gc2g7XG59KCk7IC8vIGVuZCBvZiBhbm9ueW1vdXMgZnVuY3Rpb25cblxuLy8gQ29tbW9uSlNcbnR5cGVvZihleHBvcnRzKSAhPSAndW5kZWZpbmVkJyA/IGV4cG9ydHMuU3ludGF4SGlnaGxpZ2h0ZXIgPSBTeW50YXhIaWdobGlnaHRlciA6IG51bGw7XG4iLCJ2YXIgZnMgICAgICAgICA9ICByZXF1aXJlKCdmcycpXG4gICwgcGF0aCAgICAgICA9ICByZXF1aXJlKCdwYXRoJylcbiAgLCB1dGlsICAgICAgID0gIHJlcXVpcmUoJ3V0aWwnKVxuICAsIGlubGluZSAgICAgPSAgcmVxdWlyZSgnLi9pbmxpbmUtc2NyaXB0cycpXG4gICwgc2NyaXB0c0RpciA9ICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9saWIvc2NyaXB0cycpXG4gICwgc3R5bGVzRGlyICA9ICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9saWIvc3R5bGVzJylcbiAgLCBzdHlsZXNcbiAgLCBsYW5nTWFwICAgID0gIHsgfVxuICAsIHNpbWlsYXJNYXAgPSAgeyB9XG4gICwgc2ltaWxhckxhbmdzID0gIHtcbiAgICAgICAgJ2pzJyAgICAgOiAgWyAnanNvbicgXVxuICAgICAgLCAncHl0aG9uJyA6ICBbJ2NvZmZlZScsICdncm9vdnknLCAnaHMnLCAnaGFza2VsbCcgXVxuICAgIH1cbiAgO1xuXG5cbi8vIFNlbGYgaW52b2tpbmcgZnVuY3Rpb25zIGJsb2NrIHVudGlsIHRoZXkgYXJlIGZpbmlzaGVkIGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0IFxuLy8gdGhpcyBtb2R1bGUgaXMgcHJvcGVybHkgaW5pdGlhbGl6ZWQgYmVmb3JlIGl0IGlzIHJldHVybmVkLlxuLy8gU2luY2UgdGhpcyBvbmx5IGhhcHBlbnMgb25jZSAod2hlbiBtb2R1bGUgaXMgcmVxdWlyZWQpLCBpdCBzaG91bGRuJ3QgYmUgYSBwcm9ibGVtLlxuKGZ1bmN0aW9uIG1hcEJydXNoZXMoKSB7XG4gIGZzLnJlYWRkaXJTeW5jKHNjcmlwdHNEaXIpLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICBpZiAoIWZpbGUubWF0Y2goL3NoQnJ1c2hcXHcrXFwuanMvKSkgcmV0dXJuO1xuICAgIFxuICAgIHZhciBsYW5ndWFnZSA9IHJlcXVpcmUocGF0aC5qb2luKHNjcmlwdHNEaXIsIGZpbGUpKTtcbiAgICBsYW5ndWFnZS5CcnVzaC5hbGlhc2VzLmZvckVhY2goZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgICBsYW5nTWFwW2FsaWFzLnRvTG93ZXJDYXNlKCldID0gbGFuZ3VhZ2U7XG4gICAgfSk7XG4gIH0pOyAgXG5cbiAgLy8gQWRkIHNvbWUga25vd24gYWxpYXNlc1xuICBsYW5nTWFwWydjcyddID0gbGFuZ01hcFsnYyMnXTtcblxuICAvLyBBZGQgc2ltaWxhciBicnVzaGVzIHRvIHNpbWlsYXIgbWFwXG4gIE9iamVjdC5rZXlzKHNpbWlsYXJMYW5ncykuZm9yRWFjaChmdW5jdGlvbiAobGFuZykge1xuICAgIHNpbWlsYXJMYW5nc1tsYW5nXS5mb3JFYWNoKGZ1bmN0aW9uIChzaW1pbGFyKSB7XG4gICAgICBzaW1pbGFyTWFwW3NpbWlsYXJdID0gbGFuZ01hcFtsYW5nXTtcbiAgICB9KTtcbiAgfSk7XG59KSAoKTtcblxuKGZ1bmN0aW9uIGNvbGxlY3RTdHlsZXMgKCkge1xuICBzdHlsZXMgPSBmcy5yZWFkZGlyU3luYyhzdHlsZXNEaXIpXG4gICAgLmZpbHRlcihmdW5jdGlvbiAoZmlsZU5hbWUpIHtcbiAgICAgIHJldHVybiBmaWxlTmFtZS5tYXRjaCgvc2hDb3JlLitcXC5jc3MvKTtcbiAgICB9KVxuICAgIC5tYXAoZnVuY3Rpb24gKGZpbGVOYW1lKSB7XG4gICAgICB2YXIgbm9ybWFsaXplZEZpbGVOYW1lID0gIGZpbGVOYW1lLnJlcGxhY2UoL3NoQ29yZS8sICcnKVxuICAgICAgICAsIGV4dExlbmd0aCAgICAgICAgICA9ICBwYXRoLmV4dG5hbWUobm9ybWFsaXplZEZpbGVOYW1lKS5sZW5ndGhcbiAgICAgICAgLCBuYW1lTGVuZ3RoICAgICAgICAgPSAgbm9ybWFsaXplZEZpbGVOYW1lLmxlbmd0aCAtIGV4dExlbmd0aFxuICAgICAgICAsIHN0eWxlTmFtZSAgICAgICAgICA9ICBub3JtYWxpemVkRmlsZU5hbWUuc3Vic3RyKDAsIG5hbWVMZW5ndGgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLCBmdWxsRmlsZVBhdGggICAgICAgPSAgcGF0aC5qb2luKHN0eWxlc0RpciwgZmlsZU5hbWUpXG4gICAgICAgIDtcblxuICAgICAgcmV0dXJuIHsgbmFtZTogc3R5bGVOYW1lLCBzb3VyY2VQYXRoOiBmdWxsRmlsZVBhdGggfTtcbiAgICAgIFxuICAgIH0pO1xufSkgKCk7XG5cbmZ1bmN0aW9uIGdldExhbmd1YWdlKGFsaWFzLCBzdHJpY3QpIHtcbiAgLy8gYWNjZXB0ICouZXh0LCAuZXh0IGFuZCBleHRcbiAgdmFyIG5vcm1hbGl6ZWRBbGlhcyA9IGFsaWFzLnJlcGxhY2UoL15cXCovLCcnKS5yZXBsYWNlKC9eXFwuLywnJyk7XG5cbiAgdmFyIG1hdGNoID0gbGFuZ01hcFtub3JtYWxpemVkQWxpYXNdIHx8ICghc3RyaWN0ID8gc2ltaWxhck1hcFtub3JtYWxpemVkQWxpYXNdIDogdm9pZCAwKTtcbiAgXG4gIC8vIE5lZWQgdG8gcmVtZW1iZXIgaWYgdXNlciBpcyBoaWdobGlnaHRpbmcgaHRtbCBvciB4aHRtbCBmb3IgaW5zdGFuY2UgZm9yIHVzZSBpbiBoaWdobGlnaHRcbiAgaWYgKG1hdGNoKSBtYXRjaC5zcGVjaWZpZWRBbGlhcyA9IG5vcm1hbGl6ZWRBbGlhcztcblxuICByZXR1cm4gbWF0Y2g7XG59XG5cbi8vIG9wdGlvbnM6IGh0dHA6Ly9hbGV4Z29yYmF0Y2hldi5jb20vU3ludGF4SGlnaGxpZ2h0ZXIvbWFudWFsL2NvbmZpZ3VyYXRpb24vXG5mdW5jdGlvbiBoaWdobGlnaHQoY29kZSwgbGFuZ3VhZ2UsIG9wdGlvbnMpIHtcbiAgdmFyIG1lcmdlZE9wdHMgPSB7IH1cbiAgICAsIGRlZmF1bHRzID0ge1xuICAgICAgICAgIHRvb2xiYXI6IGZhbHNlXG4gICAgICAgICwgJ2ZpcnN0LWxpbmUnOiAxXG4gICAgICB9XG4gICAgLCBoaWdobGlnaHRlZEh0bWxcbiAgICA7XG5cbiAgaWYgKCFsYW5ndWFnZSkgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCB0byBwYXNzIGEgbGFuZ3VhZ2Ugb2J0YWluZWQgdmlhIFwiZ2V0TGFuZ3VhZ2VcIicpO1xuICBpZiAoIWxhbmd1YWdlLkJydXNoKSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHBhc3MgYSBsYW5ndWFnZSB3aXRoIGEgQnJ1c2gsIG9idGFpbmVkIHZpYSBcImdldExhbmd1YWdlXCInKTtcblxuICBpZiAob3B0aW9ucykge1xuICAgIC8vIEdhdGhlciBhbGwgdXNlciBzcGVjaWZpZWQgb3B0aW9ucyBmaXJzdFxuICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgbWVyZ2VkT3B0c1trZXldID0gb3B0aW9uc1trZXldO1xuICAgIH0pO1xuICAgIC8vIEFkZCBkZWZhdWx0IG9wdGlvbiBvbmx5IGlmIHVzZXIgZGlkbid0IHNwZWNpZnkgaXRzIHZhbHVlXG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgbWVyZ2VkT3B0c1trZXldID0gb3B0aW9uc1trZXldIHx8IGRlZmF1bHRzW2tleV07XG4gICAgfSk7XG5cbiAgfSBlbHNlIHtcbiAgICBtZXJnZWRPcHRzID0gZGVmYXVsdHM7XG4gIH1cblxuICB2YXIgYnJ1c2ggPSBuZXcgbGFuZ3VhZ2UuQnJ1c2goKTtcbiAgYnJ1c2guaW5pdChtZXJnZWRPcHRzKTtcblxuICBoaWdobGlnaHRlZEh0bWwgPSBicnVzaC5nZXRIdG1sKGNvZGUpO1xuXG4gIGlmIChsYW5ndWFnZSA9PT0gbGFuZ01hcFsnaHRtbCddKSB7XG4gICAgdmFyIGxpbmVzID0gY29kZS5zcGxpdCgnXFxuJylcbiAgICAgICwgc2NyaXB0cyA9IGlubGluZS5maW5kU2NyaXB0cyhsaW5lcywgbGFuZ3VhZ2Uuc3BlY2lmaWVkQWxpYXMpO1xuXG4gICAgLy8gSGlnaGxpZ2h0IGNvZGUgaW4gYmV0d2VlbiBzY3JpcHRzIHRhZ3MgYW5kIGludGVyamVjdCBpdCBpbnRvIGhpZ2hsaWdodGVkIGh0bWxcbiAgICBzY3JpcHRzLmZvckVhY2goZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgdmFyIHNjcmlwdExhbmcgPSBsYW5nTWFwW3NjcmlwdC50YWcuYWxpYXNdXG4gICAgICAgICwgYnJ1c2ggPSBuZXcgc2NyaXB0TGFuZy5CcnVzaCgpXG4gICAgICAgICwgb3B0cyA9IG1lcmdlZE9wdHNcbiAgICAgICAgO1xuXG4gICAgICAvLyBhZGFwdCBsaW5lIG51bWJlcnMgb2YgaGlnaGxpZ2h0ZWQgY29kZSBzaW5jZSBpdCBpcyBpbiB0aGUgbWlkZGxlIG9mIGh0bWwgZG9jdW1lbnRcbiAgICAgIG9wdHNbJ2ZpcnN0LWxpbmUnXSA9IG1lcmdlZE9wdHNbJ2ZpcnN0LWxpbmUnXSArIHNjcmlwdC5mcm9tO1xuICAgICAgXG4gICAgICBicnVzaC5pbml0KG9wdHMpO1xuXG4gICAgICB2YXIgaGlnaGxpZ2h0ZWRTY3JpcHQgPSBicnVzaC5nZXRIdG1sKHNjcmlwdC5jb2RlKVxuICAgICAgICAsIGhpZ2xpZ2h0ZWRMaW5lcyA9IGlubGluZS5leHRyYWN0TGluZXMoaGlnaGxpZ2h0ZWRTY3JpcHQpO1xuXG4gICAgICBoaWdobGlnaHRlZEh0bWwgPSBpbmxpbmUucmVwbGFjZVBsYWluTGluZXMoc2NyaXB0LmZyb20sIHNjcmlwdC50bywgaGlnaGxpZ2h0ZWRIdG1sLCBoaWdsaWdodGVkTGluZXMpO1xuICAgIH0pO1xuIH0gXG5cbiAgcmV0dXJuIGhpZ2hsaWdodGVkSHRtbDtcbn1cblxuXG5mdW5jdGlvbiBnZXRTdHlsZXMgKCkge1xuICByZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBjb3B5U3R5bGUgKHN0eWxlLCB0Z3QsIGNiKSB7XG4gIHZhciBzb3VyY2VQYXRoXG4gICAgLCBzdHlsZU5hbWU7XG5cbiAgLy8gQWxsb3cgc3R5bGUgdG8ganVzdCBiZSBhIHN0cmluZyAoaXRzIG5hbWUpIG9yIGEgc3R5bGUgcmV0dXJuZWQgZnJvbSBnZXRTdHlsZXNcbiAgaWYgKHR5cGVvZiBzdHlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdHlsZU5hbWUgPSBzdHlsZTtcblxuICAgIHZhciBtYXRjaGluZ1N0eWxlID0gc3R5bGVzLmZpbHRlcihmdW5jdGlvbiAocykgeyByZXR1cm4gcy5uYW1lID09PSBzdHlsZTsgfSlbMF07XG5cbiAgICBpZiAoIW1hdGNoaW5nU3R5bGUpIFxuICAgICAgY2IobmV3IEVycm9yKCdTdHlsZSBuYW1lZCBcIicgKyBzdHlsZSArICdcIiBub3QgZm91bmQuJykpO1xuICAgIGVsc2VcbiAgICAgIHNvdXJjZVBhdGggPSBtYXRjaGluZ1N0eWxlLnNvdXJjZVBhdGg7XG5cbiAgfSBlbHNlIGlmICghc3R5bGUuc291cmNlUGF0aCkge1xuICAgIGNiKG5ldyBFcnJvcignc3R5bGUgbmVlZHMgdG8gYmUgc3RyaW5nIG9yIGhhdmUgXCJzb3VyY2VQYXRoXCIgcHJvcGVydHknKSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGVOYW1lID0gc3R5bGUubmFtZTtcbiAgICBzb3VyY2VQYXRoID0gc3R5bGUuc291cmNlUGF0aDtcbiAgfVxuXG4gIHZhciByZWFkU3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShzb3VyY2VQYXRoKVxuICAgICwgd3JpdGVTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShwYXRoLmpvaW4odGd0LCBzdHlsZU5hbWUgKyAnLmNzcycpKVxuICAgIDsgXG5cbiAgdXRpbC5wdW1wKHJlYWRTdHJlYW0sIHdyaXRlU3RyZWFtLCBjYik7XG59XG5cblxuZnVuY3Rpb24gY29weVN0eWxlcyh0Z3QsIGNiKSB7XG4gIHZhciBwZW5kaW5nID0gc3R5bGVzLmxlbmd0aDtcbiAgc3R5bGVzLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbiAgICBjb3B5U3R5bGUocywgdGd0LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7IFxuICAgICAgICBjYihlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKC0tcGVuZGluZyA9PT0gMCkgY2IoKTtcbiAgICAgIH0gXG4gICAgfSk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBoaWdobGlnaHQgICA6ICBoaWdobGlnaHRcbiAgLCBnZXRMYW5ndWFnZSA6ICBnZXRMYW5ndWFnZVxuICAsIGdldFN0eWxlcyAgIDogIGdldFN0eWxlc1xuICAsIGNvcHlTdHlsZSAgIDogIGNvcHlTdHlsZVxuICAsIGNvcHlTdHlsZXMgIDogIGNvcHlTdHlsZXNcbn07XG5cbiJdfQ==
