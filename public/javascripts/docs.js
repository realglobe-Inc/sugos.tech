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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvb3MtYnJvd3NlcmlmeS9icm93c2VyLmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjAuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJsaWIvYnJvd3Nlci9kb2NzLmJyb3dzZXIuanMiLCJsaWIvY29tcG9uZW50cy9kb2NzLmNvbXBvbmVudC5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9oZWFkZXIuanMiLCJsaWIvY29tcG9uZW50cy9mcmFnbWVudHMvbG9nby5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9tYXJrZG93bi5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9zbmlwcGV0LmpzIiwibGliL2NvbXBvbmVudHMvdmlld3MvZ3VpZGVfdmlldy5qcyIsImxpYi9jb25zdGFudHMvc25pcHBldF9jb25zdGFudHMuanMiLCJsaWIvc2VydmljZXMvbGlua19zZXJ2aWNlLmpzIiwibGliL3NlcnZpY2VzL3NuaXBwZXRfc2VydmljZS5qcyIsIm5vZGVfbW9kdWxlcy9hcGUtaGlnaGxpZ2h0aW5nL2xpYi9oaWdobGlnaHRfanN4LmpzIiwibm9kZV9tb2R1bGVzL2FwZS1oaWdobGlnaHRpbmcvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2pzeC1zeW50YXhoaWdobGlnaHRlci9zaEJydXNoSnN4LmpzIiwibm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvaW5saW5lLXNjcmlwdHMuanMiLCJub2RlX21vZHVsZXMvbm9kZS1zeW50YXhoaWdobGlnaHRlci9saWIvc2NyaXB0cy9YUmVnRXhwLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbGliL3NjcmlwdHMvc2hDb3JlLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbm9kZS1zeW50YXhoaWdobGlnaHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyd0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDenBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsImV4cG9ydHMuZW5kaWFubmVzcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdMRScgfTtcblxuZXhwb3J0cy5ob3N0bmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIGxvY2F0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gbG9jYXRpb24uaG9zdG5hbWVcbiAgICB9XG4gICAgZWxzZSByZXR1cm4gJyc7XG59O1xuXG5leHBvcnRzLmxvYWRhdmcgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbXSB9O1xuXG5leHBvcnRzLnVwdGltZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDAgfTtcblxuZXhwb3J0cy5mcmVlbWVtID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBOdW1iZXIuTUFYX1ZBTFVFO1xufTtcblxuZXhwb3J0cy50b3RhbG1lbSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gTnVtYmVyLk1BWF9WQUxVRTtcbn07XG5cbmV4cG9ydHMuY3B1cyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtdIH07XG5cbmV4cG9ydHMudHlwZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdCcm93c2VyJyB9O1xuXG5leHBvcnRzLnJlbGVhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3IuYXBwVmVyc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xufTtcblxuZXhwb3J0cy5uZXR3b3JrSW50ZXJmYWNlc1xuPSBleHBvcnRzLmdldE5ldHdvcmtJbnRlcmZhY2VzXG49IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHt9IH07XG5cbmV4cG9ydHMuYXJjaCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdqYXZhc2NyaXB0JyB9O1xuXG5leHBvcnRzLnBsYXRmb3JtID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJ2Jyb3dzZXInIH07XG5cbmV4cG9ydHMudG1wZGlyID0gZXhwb3J0cy50bXBEaXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICcvdG1wJztcbn07XG5cbmV4cG9ydHMuRU9MID0gJ1xcbic7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qKlxuICogQnJvd3NlciBzY3JpcHQgZm9yIGRvY3MuXG4gKlxuICogR2VuZXJhdGVkIGJ5IGNveiBvbiA2LzkvMjAxNixcbiAqIGZyb20gYSB0ZW1wbGF0ZSBwcm92aWRlZCBieSBhcGVtYW4tYnVkLW1vY2suXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9hcGVtYW5CcndzUmVhY3QgPSByZXF1aXJlKCdhcGVtYW4tYnJ3cy1yZWFjdCcpO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGVtYW5CcndzUmVhY3QpO1xuXG52YXIgX2RvY3NDb21wb25lbnQgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2RvY3MuY29tcG9uZW50LmpzJyk7XG5cbnZhciBfZG9jc0NvbXBvbmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kb2NzQ29tcG9uZW50KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENPTlRBSU5FUl9JRCA9ICdkb2NzLXdyYXAnO1xud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF93aW5kb3cgPSB3aW5kb3c7XG4gIHZhciBsb2NhbGUgPSBfd2luZG93LmxvY2FsZTtcblxuICBfYXBlbWFuQnJ3c1JlYWN0Mi5kZWZhdWx0LnJlbmRlcihDT05UQUlORVJfSUQsIF9kb2NzQ29tcG9uZW50Mi5kZWZhdWx0LCB7XG4gICAgbG9jYWxlOiBsb2NhbGVcbiAgfSwgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAvLyBUaGUgY29tcG9uZW50IGlzIHJlYWR5LlxuICB9KTtcbn07IiwiLyoqXG4gKiBDb21wb25lbnQgb2YgZG9jcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdFN0eWxlID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LXN0eWxlJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2hlYWRlciA9IHJlcXVpcmUoJy4vZnJhZ21lbnRzL2hlYWRlcicpO1xuXG52YXIgX2hlYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWFkZXIpO1xuXG52YXIgX2d1aWRlX3ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2d1aWRlX3ZpZXcnKTtcblxudmFyIF9ndWlkZV92aWV3MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2d1aWRlX3ZpZXcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgRG9jc0NvbXBvbmVudCA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnRG9jc0NvbXBvbmVudCcsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFja2VyOiBuZXcgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2suU3RhY2tlcih7XG4gICAgICAgIHJvb3Q6IF9ndWlkZV92aWV3Mi5kZWZhdWx0LFxuICAgICAgICByb290UHJvcHM6IHt9XG4gICAgICB9KVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgcy5yZWdpc3RlckxvY2FsZShwcm9wcy5sb2NhbGUpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFBhZ2UsXG4gICAgICBudWxsLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2hlYWRlcjIuZGVmYXVsdCwgeyB0YWI6ICdET0NTJyB9KSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcE1haW4sXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLCB7IHN0YWNrZXI6IHByb3BzLnN0YWNrZXIgfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRG9jc0NvbXBvbmVudDsiLCIvKipcbiAqIEhlYWRlciBjb21wb25lbnRcbiAqIEBjbGFzcyBIZWFkZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2xvZ28gPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvbG9nbycpO1xuXG52YXIgX2xvZ28yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9nbyk7XG5cbnZhciBfbGlua19zZXJ2aWNlID0gcmVxdWlyZSgnLi4vLi4vc2VydmljZXMvbGlua19zZXJ2aWNlJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKiBAbGVuZHMgSGVhZGVyICovXG52YXIgSGVhZGVyID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdIZWFkZXInLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHRhYjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhYjogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgdGFiID0gcHJvcHMudGFiO1xuXG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHZhciBfdGFiSXRlbSA9IF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyVGFiSXRlbS5jcmVhdGVJdGVtO1xuICAgIHZhciBfbGluayA9IGZ1bmN0aW9uIF9saW5rKCkge1xuICAgICAgcmV0dXJuIF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLnJlc29sdmVIdG1sTGluay5hcHBseShfbGlua19zZXJ2aWNlLnNpbmdsZXRvbiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyLFxuICAgICAgeyBjbGFzc05hbWU6ICdoZWFkZXInIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBDb250YWluZXIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyTG9nbyxcbiAgICAgICAgICB7IGhyZWY6IF9saW5rKCdpbmRleC5odG1sJykgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbG9nbzIuZGVmYXVsdCwgbnVsbClcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5ET0NTX1BBR0UnKSwgX2xpbmsoJ2RvY3MuaHRtbCcpLCB7IHNlbGVjdGVkOiB0YWIgPT09ICdET0NTJyB9KSxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5DQVNFU19QQUdFJyksIF9saW5rKCdjYXNlcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0NBU0VTJyB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEhlYWRlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIExvZ28gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0xvZ28nLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2gxJyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnbG9nbycgfSxcbiAgICAgICdTVUdPUydcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9nbzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcblxudmFyIF9tYXJrZWQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFya2VkKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIE1hcmtkb3duID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdNYXJrZG93bicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGV4dDogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBudWxsXG4gICAgfTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBwcm9wcyA9IHMucHJvcHM7XG5cbiAgICB2YXIgY29udGVudCA9ICgwLCBfbWFya2VkMi5kZWZhdWx0KShwcm9wcy50ZXh0KTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHsgX19odG1sOiBjb250ZW50IH0gfSk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNYXJrZG93bjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFNuaXBwZXQgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1NuaXBwZXQnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZFxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdzbmlwcGV0JywgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHsgX19odG1sOiBwcm9wcy5zcmMgfSB9KTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNuaXBwZXQ7IiwiLyoqXG4gKiBWaWV3IGZvciBndWlkZVxuICogQGNsYXNzIEd1aWRlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9zbmlwcGV0ID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL3NuaXBwZXQnKTtcblxudmFyIF9zbmlwcGV0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NuaXBwZXQpO1xuXG52YXIgX21hcmtkb3duID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL21hcmtkb3duJyk7XG5cbnZhciBfbWFya2Rvd24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFya2Rvd24pO1xuXG52YXIgX3NuaXBwZXRfc2VydmljZSA9IHJlcXVpcmUoJy4uLy4uL3NlcnZpY2VzL3NuaXBwZXRfc2VydmljZScpO1xuXG52YXIgX29zID0gcmVxdWlyZSgnb3MnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIEd1aWRlVmlldyA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnR3VpZGVWaWV3JyxcblxuICBtaXhpbnM6IFtfYXBlbWFuUmVhY3RNaXhpbnMuQXBMb2NhbGVNaXhpbl0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG5cbiAgICB2YXIgX3NlY3Rpb24gPSBmdW5jdGlvbiBfc2VjdGlvbihuYW1lLCBjb25maWcpIHtcbiAgICAgIHZhciB0aXRsZSA9IGNvbmZpZy50aXRsZTtcbiAgICAgIHZhciB0ZXh0ID0gY29uZmlnLnRleHQ7XG4gICAgICB2YXIgc25pcHBldCA9IGNvbmZpZy5zbmlwcGV0O1xuXG4gICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbixcbiAgICAgICAgeyBpZDogJ2d1aWRlLScgKyBuYW1lICsgJy1zZWN0aW9uJyxcbiAgICAgICAgICBjbGFzc05hbWU6ICdndWlkZS1zZWN0aW9uJyxcbiAgICAgICAgICBrZXk6IG5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uSGVhZGVyLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgdGl0bGVcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uQm9keSxcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2d1aWRlLXRleHQtY29udGFpbmVyJyB9LFxuICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2d1aWRlLWRlc2NyaXB0aW9uJyB9LFxuICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWFya2Rvd24yLmRlZmF1bHQsIHsgdGV4dDogW10uY29uY2F0KHRleHQpLmpvaW4oX29zLkVPTCArIF9vcy5FT0wpIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS1pbWFnZS1jb250YWluZXInIH0sXG4gICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZ3VpZGUtc25pcHBldCcgfSxcbiAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX3NuaXBwZXQyLmRlZmF1bHQsIHsgc3JjOiBzbmlwcGV0IH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXcsXG4gICAgICB7IGNsYXNzTmFtZTogJ2d1aWRlLXZpZXcnIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdIZWFkZXIsIG51bGwpLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0JvZHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIFtfc2VjdGlvbignY2xvdWQtc2V0dXAnLCB7XG4gICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkdVSURFX0NMT1VEX1NFVFVQX1RJVExFJyksXG4gICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuR1VJREVfQ0xPVURfU0VUVVBfVEVYVCcpLFxuICAgICAgICAgIHNuaXBwZXQ6IF9zbmlwcGV0X3NlcnZpY2Uuc2luZ2xldG9uLmdldFNuaXBwZXQoJ2V4YW1wbGVDbG91ZCcpXG4gICAgICAgIH0pLCBfc2VjdGlvbignc3BvdC1ydW4nLCB7XG4gICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkdVSURFX1NQT1RfUlVOX1RJVExFJyksXG4gICAgICAgICAgdGV4dDogbCgnc2VjdGlvbnMuR1VJREVfU1BPVF9SVU5fVEVYVCcpLFxuICAgICAgICAgIHNuaXBwZXQ6IF9zbmlwcGV0X3NlcnZpY2Uuc2luZ2xldG9uLmdldFNuaXBwZXQoJ2V4YW1wbGVTcG90JylcbiAgICAgICAgfSksIF9zZWN0aW9uKCd0ZXJtaW5hbC11c2UnLCB7XG4gICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkdVSURFX1RFUk1JTkFMX1VTRV9USVRMRScpLFxuICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkdVSURFX1RFUk1JTkFMX1VTRV9URVhUJyksXG4gICAgICAgICAgc25pcHBldDogX3NuaXBwZXRfc2VydmljZS5zaW5nbGV0b24uZ2V0U25pcHBldCgnZXhhbXBsZVRlcm1pbmFsJylcbiAgICAgICAgfSldXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpZGVWaWV3OyIsIi8qKlxuICogQG5hbWVzcGFjZSBTbmlwcGV0Q29uc3RhbnRzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5leGFtcGxlVGVybWluYWwgPSBleHBvcnRzLmV4YW1wbGVTcG90ID0gZXhwb3J0cy5leGFtcGxlQ2xvdWQgPSBleHBvcnRzLmV4YW1wbGVVc2FnZSA9IHVuZGVmaW5lZDtcblxudmFyIF9hcGVIaWdobGlnaHRpbmcgPSByZXF1aXJlKCdhcGUtaGlnaGxpZ2h0aW5nJyk7XG5cbnZhciBfZnMgPSByZXF1aXJlKCdmcycpO1xuXG52YXIgX2ZzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGV4aXN0cyA9IGZ1bmN0aW9uIGV4aXN0cyhmaWxlbmFtZSkge1xuICByZXR1cm4gX2ZzMi5kZWZhdWx0LmV4aXN0c1N5bmMgJiYgX2ZzMi5kZWZhdWx0LmV4aXN0c1N5bmMoZmlsZW5hbWUpO1xufTtcbnZhciByZWFkID0gZnVuY3Rpb24gcmVhZChmaWxlbmFtZSkge1xuICByZXR1cm4gZXhpc3RzKGZpbGVuYW1lKSAmJiBfZnMyLmRlZmF1bHQucmVhZEZpbGVTeW5jKGZpbGVuYW1lKS50b1N0cmluZygpIHx8IG51bGw7XG59O1xuXG52YXIgZXhhbXBsZVVzYWdlID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9leGFtcGxlLXVzYWdlLmpzJykpKTtcbnZhciBleGFtcGxlQ2xvdWQgPSBfYXBlSGlnaGxpZ2h0aW5nLmhpZ2hsaWdodEpzeC5jb2RlKHJlYWQocmVxdWlyZS5yZXNvbHZlKCdzdWdvcy9leGFtcGxlL21vZHVsZXMvZXhhbXBsZS1jbG91ZC5qcycpKSk7XG52YXIgZXhhbXBsZVNwb3QgPSBfYXBlSGlnaGxpZ2h0aW5nLmhpZ2hsaWdodEpzeC5jb2RlKHJlYWQocmVxdWlyZS5yZXNvbHZlKCdzdWdvcy9leGFtcGxlL21vZHVsZXMvZXhhbXBsZS1zcG90LmpzJykpKTtcbnZhciBleGFtcGxlVGVybWluYWwgPSBfYXBlSGlnaGxpZ2h0aW5nLmhpZ2hsaWdodEpzeC5jb2RlKHJlYWQocmVxdWlyZS5yZXNvbHZlKCdzdWdvcy9leGFtcGxlL21vZHVsZXMvZXhhbXBsZS10ZXJtaW5hbC5qcycpKSk7XG5cbmV4cG9ydHMuZXhhbXBsZVVzYWdlID0gZXhhbXBsZVVzYWdlO1xuZXhwb3J0cy5leGFtcGxlQ2xvdWQgPSBleGFtcGxlQ2xvdWQ7XG5leHBvcnRzLmV4YW1wbGVTcG90ID0gZXhhbXBsZVNwb3Q7XG5leHBvcnRzLmV4YW1wbGVUZXJtaW5hbCA9IGV4YW1wbGVUZXJtaW5hbDsiLCIvKipcbiAqIEBjbGFzcyBMaW5rU2VydmljZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vKiogQGxlbmRzIExpbmtTZXJ2aWNlICovXG5cbnZhciBMaW5rU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTGlua1NlcnZpY2UoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExpbmtTZXJ2aWNlKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhMaW5rU2VydmljZSwgW3tcbiAgICBrZXk6ICdyZXNvbHZlSHRtbExpbmsnLFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIGEgaHRtbCBsaW5rXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gSHRtbCBmaWxlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFJlc29sdmVkIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlSHRtbExpbmsoZmlsZW5hbWUpIHtcbiAgICAgIHZhciBzID0gdGhpcztcbiAgICAgIHZhciBsYW5nID0gcy5fZ2V0TGFuZygpO1xuICAgICAgdmFyIGh0bWxEaXIgPSBsYW5nID8gJ2h0bWwvJyArIGxhbmcgOiAnaHRtbCc7XG4gICAgICByZXR1cm4gcGF0aC5qb2luKGh0bWxEaXIsIGZpbGVuYW1lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfZ2V0TGFuZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9nZXRMYW5nKCkge1xuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5MQU5HO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpbmRvdy5sYW5nO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBMaW5rU2VydmljZTtcbn0oKTtcblxudmFyIHNpbmdsZXRvbiA9IG5ldyBMaW5rU2VydmljZSgpO1xuXG5PYmplY3QuYXNzaWduKExpbmtTZXJ2aWNlLCB7XG4gIHNpbmdsZXRvbjogc2luZ2xldG9uXG59KTtcblxuZXhwb3J0cy5zaW5nbGV0b24gPSBzaW5nbGV0b247XG5leHBvcnRzLmRlZmF1bHQgPSBMaW5rU2VydmljZTsiLCIvKipcbiAqIEBjbGFzcyBTbmlwcGV0U2VydmljZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKiBAbGVuZHMgU25pcHBldFNlcnZpY2UgKi9cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNuaXBwZXRTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTbmlwcGV0U2VydmljZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU25pcHBldFNlcnZpY2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNuaXBwZXRTZXJ2aWNlLCBbe1xuICAgIGtleTogJ2dldFNuaXBwZXQnLFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNuaXBwZXQgd2l0aCBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHNuaXBwZXRcbiAgICAgKiBAcmV0dXJucyB7P3N0cmluZ30gLSBNYXRjaGVkIHNuaXBwZXRcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U25pcHBldChuYW1lKSB7XG4gICAgICB2YXIgcyA9IHRoaXM7XG4gICAgICB2YXIgc25pcHBldHMgPSBzLl9nZXRTbmlwcGV0cygpO1xuICAgICAgcmV0dXJuIHNuaXBwZXRzW25hbWVdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19nZXRTbmlwcGV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9nZXRTbmlwcGV0cygpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcmVxdWlyZSgnLi4vY29uc3RhbnRzL3NuaXBwZXRfY29uc3RhbnRzJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93LnNuaXBwZXRzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTbmlwcGV0U2VydmljZTtcbn0oKTtcblxudmFyIHNpbmdsZXRvbiA9IG5ldyBTbmlwcGV0U2VydmljZSgpO1xuXG5PYmplY3QuYXNzaWduKFNuaXBwZXRTZXJ2aWNlLCB7XG4gIHNpbmdsZXRvbjogc2luZ2xldG9uXG59KTtcblxuZXhwb3J0cy5zaW5nbGV0b24gPSBzaW5nbGV0b247XG5leHBvcnRzLmRlZmF1bHQgPSBTbmlwcGV0U2VydmljZTsiLCIvKipcbiAqIEBmdW5jdGlvbiBoaWdobGlnaHRKc3hcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmMgLSBTb3VyY2Ugc3RyaW5nLlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBPcHRpb25hbCBzZXR0aW5ncy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IC0gSGlnaGxpZ2h0ZWQgc3RyaW5nLlxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBuc2ggPSByZXF1aXJlKCdub2RlLXN5bnRheGhpZ2hsaWdodGVyJylcbmNvbnN0IGpzeCA9IHJlcXVpcmUoJ2pzeC1zeW50YXhoaWdobGlnaHRlcicpXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuLyoqIEBsZW5kcyBoaWdobGlnaHRKc3ggKi9cbmZ1bmN0aW9uIGhpZ2hsaWdodEpzeCAoc3JjLCBvcHRpb25zID0ge30pIHtcbiAgbGV0IHN0eWxlID0gaGlnaGxpZ2h0SnN4LnN0eWxlKClcbiAgbGV0IGNvZGUgPSBoaWdobGlnaHRKc3guY29kZShzcmMpXG4gIHJldHVybiBbXG4gICAgJzxkaXY+JyxcbiAgICAnPHN0eWxlIHNjb3BlZD1cInNjb3BlZFwiPicgKyBzdHlsZSArICc8L3N0eWxlPicsXG4gICAgY29kZSxcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJycpXG59XG5cbmhpZ2hsaWdodEpzeC5jb2RlID0gZnVuY3Rpb24gKHNyYykge1xuICByZXR1cm4gbnNoLmhpZ2hsaWdodChzcmMsIGpzeCwgeyBndXR0ZXI6IGZhbHNlIH0pXG59XG5cbmhpZ2hsaWdodEpzeC5zdHlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IGZpbGVuYW1lID0gbnNoLmdldFN0eWxlcygpWyAwIF0uc291cmNlUGF0aFxuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lKS50b1N0cmluZygpXG59XG5cbmhpZ2hsaWdodEpzeC5mcm9tRmlsZSA9IGZ1bmN0aW9uIChmaWxlbmFtZSwgb3B0aW9ucykge1xuICBsZXQgc3JjID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lKS50b1N0cmluZygpXG4gIHJldHVybiBoaWdobGlnaHRKc3goc3JjLCBvcHRpb25zKVxufVxubW9kdWxlLmV4cG9ydHMgPSBoaWdobGlnaHRKc3hcbiIsIi8qKlxuICogYXBlIGZyYW1ld29yayBtb2R1bGUgZm9yIGhpZ2hsaWdodGluZy5cbiAqIEBtb2R1bGUgYXBlLWhpZ2hsaWdodGluZ1xuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IGhpZ2hsaWdodEpzeCAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vaGlnaGxpZ2h0X2pzeCcpKSB9XG59XG4iLCJ2YXIgWFJlZ0V4cCA9IHJlcXVpcmUoXCJub2RlLXN5bnRheGhpZ2hsaWdodGVyL2xpYi9zY3JpcHRzL1hSZWdFeHBcIikuWFJlZ0V4cDtcclxudmFyIFN5bnRheEhpZ2hsaWdodGVyO1xyXG47KGZ1bmN0aW9uKClcclxue1xyXG5cdC8vIENvbW1vbkpTXHJcblx0U3ludGF4SGlnaGxpZ2h0ZXIgPSBTeW50YXhIaWdobGlnaHRlciB8fCAodHlwZW9mIHJlcXVpcmUgIT09ICd1bmRlZmluZWQnPyByZXF1aXJlKFwibm9kZS1zeW50YXhoaWdobGlnaHRlci9saWIvc2NyaXB0cy9zaENvcmVcIikuU3ludGF4SGlnaGxpZ2h0ZXIgOiBudWxsKTtcclxuXHJcblx0ZnVuY3Rpb24gQnJ1c2goKVxyXG5cdHtcclxuXHRcdGZ1bmN0aW9uIHByb2Nlc3MobWF0Y2gsIHJlZ2V4SW5mbylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGNvbnN0cnVjdG9yID0gU3ludGF4SGlnaGxpZ2h0ZXIuTWF0Y2gsXHJcblx0XHRcdFx0Y29kZSA9IG1hdGNoWzBdLFxyXG5cdFx0XHRcdHRhZyA9IG5ldyBYUmVnRXhwKCcoJmx0O3w8KVtcXFxcc1xcXFwvXFxcXD9dKig/PG5hbWU+WzpcXFxcdy1cXFxcLl0rKScsICd4ZycpLmV4ZWMoY29kZSksXHJcblx0XHRcdFx0cmVzdWx0ID0gW11cclxuXHRcdFx0XHQ7XHJcblx0XHRcclxuXHRcdFx0aWYgKG1hdGNoLmF0dHJpYnV0ZXMgIT0gbnVsbCkgXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgYXR0cmlidXRlcyxcclxuXHRcdFx0XHRcdHJlZ2V4ID0gbmV3IFhSZWdFeHAoJyg/PG5hbWU+IFtcXFxcdzpcXFxcLVxcXFwuXSspJyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0J1xcXFxzKj1cXFxccyonICtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQnKD88dmFsdWU+IFwiLio/XCJ8XFwnLio/XFwnfFxcXFx3KyknLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCd4ZycpO1xyXG5cclxuXHRcdFx0XHR3aGlsZSAoKGF0dHJpYnV0ZXMgPSByZWdleC5leGVjKGNvZGUpKSAhPSBudWxsKSBcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgY29uc3RydWN0b3IoYXR0cmlidXRlcy5uYW1lLCBtYXRjaC5pbmRleCArIGF0dHJpYnV0ZXMuaW5kZXgsICdjb2xvcjEnKSk7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgY29uc3RydWN0b3IoYXR0cmlidXRlcy52YWx1ZSwgbWF0Y2guaW5kZXggKyBhdHRyaWJ1dGVzLmluZGV4ICsgYXR0cmlidXRlc1swXS5pbmRleE9mKGF0dHJpYnV0ZXMudmFsdWUpLCAnc3RyaW5nJykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHRhZyAhPSBudWxsKVxyXG5cdFx0XHRcdHJlc3VsdC5wdXNoKFxyXG5cdFx0XHRcdFx0bmV3IGNvbnN0cnVjdG9yKHRhZy5uYW1lLCBtYXRjaC5pbmRleCArIHRhZ1swXS5pbmRleE9mKHRhZy5uYW1lKSwgJ2tleXdvcmQnKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIga2V5d29yZHMgPVx0J2JyZWFrIGNhc2UgY2F0Y2ggY29udGludWUgJyArXHJcblx0XHRcdFx0XHRcdCdkZWZhdWx0IGRlbGV0ZSBkbyBlbHNlIGZhbHNlICAnICtcclxuXHRcdFx0XHRcdFx0J2ZvciBmdW5jdGlvbiBpZiBpbiBpbnN0YW5jZW9mICcgK1xyXG5cdFx0XHRcdFx0XHQnbmV3IG51bGwgcmV0dXJuIHN1cGVyIHN3aXRjaCAnICtcclxuXHRcdFx0XHRcdFx0J3RoaXMgdGhyb3cgdHJ1ZSB0cnkgdHlwZW9mIHZhciB3aGlsZSB3aXRoJ1xyXG5cdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0dmFyIHIgPSBTeW50YXhIaWdobGlnaHRlci5yZWdleExpYjtcclxuXHRcclxuXHRcdHRoaXMucmVnZXhMaXN0ID0gW1xyXG5cdFx0XHR7IHJlZ2V4OiByLm11bHRpTGluZURvdWJsZVF1b3RlZFN0cmluZyxcdFx0XHRcdFx0Y3NzOiAnc3RyaW5nJyB9LFx0XHRcdC8vIGRvdWJsZSBxdW90ZWQgc3RyaW5nc1xyXG5cdFx0XHR7IHJlZ2V4OiByLm11bHRpTGluZVNpbmdsZVF1b3RlZFN0cmluZyxcdFx0XHRcdFx0Y3NzOiAnc3RyaW5nJyB9LFx0XHRcdC8vIHNpbmdsZSBxdW90ZWQgc3RyaW5nc1xyXG5cdFx0XHR7IHJlZ2V4OiByLnNpbmdsZUxpbmVDQ29tbWVudHMsXHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdFx0XHQvLyBvbmUgbGluZSBjb21tZW50c1xyXG5cdFx0XHR7IHJlZ2V4OiByLm11bHRpTGluZUNDb21tZW50cyxcdFx0XHRcdFx0XHRcdGNzczogJ2NvbW1lbnRzJyB9LFx0XHRcdC8vIG11bHRpbGluZSBjb21tZW50c1xyXG5cdFx0XHR7IHJlZ2V4OiAvXFxzKiMuKi9nbSxcdFx0XHRcdFx0XHRcdFx0XHRjc3M6ICdwcmVwcm9jZXNzb3InIH0sXHRcdC8vIHByZXByb2Nlc3NvciB0YWdzIGxpa2UgI3JlZ2lvbiBhbmQgI2VuZHJlZ2lvblxyXG5cdFx0XHR7IHJlZ2V4OiBuZXcgUmVnRXhwKHRoaXMuZ2V0S2V5d29yZHMoa2V5d29yZHMpLCAnZ20nKSxcdGNzczogJ2tleXdvcmQnIH0sXHJcblx0XHRcdFxyXG5cdFx0XHR7IHJlZ2V4OiBuZXcgWFJlZ0V4cCgnKFxcXFwmbHQ7fDwpXFxcXCFcXFxcW1tcXFxcd1xcXFxzXSo/XFxcXFsoLnxcXFxccykqP1xcXFxdXFxcXF0oXFxcXCZndDt8PiknLCAnZ20nKSxcdFx0XHRjc3M6ICdjb2xvcjInIH0sXHQvLyA8IVsgLi4uIFsgLi4uIF1dPlxyXG5cdFx0XHR7IHJlZ2V4OiBTeW50YXhIaWdobGlnaHRlci5yZWdleExpYi54bWxDb21tZW50cyxcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdC8vIDwhLS0gLi4uIC0tPlxyXG5cdFx0XHR7IHJlZ2V4OiBuZXcgWFJlZ0V4cCgnKCZsdDt8PClbXFxcXHNcXFxcL1xcXFw/XSooXFxcXHcrKSg/PGF0dHJpYnV0ZXM+Lio/KVtcXFxcc1xcXFwvXFxcXD9dKigmZ3Q7fD4pJywgJ3NnJyksIGZ1bmM6IHByb2Nlc3MgfVxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0dGhpcy5mb3JIdG1sU2NyaXB0KHIuc2NyaXB0U2NyaXB0VGFncyk7XHJcblx0fTtcclxuXHJcblx0QnJ1c2gucHJvdG90eXBlXHQ9IG5ldyBTeW50YXhIaWdobGlnaHRlci5IaWdobGlnaHRlcigpO1xyXG5cdEJydXNoLmFsaWFzZXNcdD0gWydqc3gnXTtcclxuXHJcblx0U3ludGF4SGlnaGxpZ2h0ZXIuYnJ1c2hlcy5KU1ggPSBCcnVzaDtcclxuXHJcblx0Ly8gQ29tbW9uSlNcclxuXHR0eXBlb2YoZXhwb3J0cykgIT0gJ3VuZGVmaW5lZCcgPyBleHBvcnRzLkJydXNoID0gQnJ1c2ggOiBudWxsO1xyXG59KSgpO1xyXG4iLCIvKipcbiAqIG1hcmtlZCAtIGEgbWFya2Rvd24gcGFyc2VyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCwgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZFxuICovXG5cbjsoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBibG9jayA9IHtcbiAgbmV3bGluZTogL15cXG4rLyxcbiAgY29kZTogL14oIHs0fVteXFxuXStcXG4qKSsvLFxuICBmZW5jZXM6IG5vb3AsXG4gIGhyOiAvXiggKlstKl9dKXszLH0gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKihbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpLyxcbiAgbnB0YWJsZTogbm9vcCxcbiAgbGhlYWRpbmc6IC9eKFteXFxuXSspXFxuICooPXwtKXsyLH0gKig/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggKj5bXlxcbl0rKFxcbig/IWRlZilbXlxcbl0rKSpcXG4qKSsvLFxuICBsaXN0OiAvXiggKikoYnVsbCkgW1xcc1xcU10rPyg/OmhyfGRlZnxcXG57Mix9KD8hICkoPyFcXDFidWxsIClcXG4qfFxccyokKS8sXG4gIGh0bWw6IC9eICooPzpjb21tZW50ICooPzpcXG58XFxzKiQpfGNsb3NlZCAqKD86XFxuezIsfXxcXHMqJCl8Y2xvc2luZyAqKD86XFxuezIsfXxcXHMqJCkpLyxcbiAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogK1tcIihdKFteXFxuXSspW1wiKV0pPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wLFxuICBwYXJhZ3JhcGg6IC9eKCg/OlteXFxuXStcXG4/KD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfHRhZ3xkZWYpKSspXFxuKi8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGQrXFwuKS87XG5ibG9jay5pdGVtID0gL14oICopKGJ1bGwpIFteXFxuXSooPzpcXG4oPyFcXDFidWxsIClbXlxcbl0qKSovO1xuYmxvY2suaXRlbSA9IHJlcGxhY2UoYmxvY2suaXRlbSwgJ2dtJylcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCk7XG5cbmJsb2NrLmxpc3QgPSByZXBsYWNlKGJsb2NrLmxpc3QpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86Wy0qX10gKil7Myx9KD86XFxcXG4rfCQpKScpXG4gICgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IHJlcGxhY2UoYmxvY2suYmxvY2txdW90ZSlcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG5ibG9jay5fdGFnID0gJyg/ISg/OidcbiAgKyAnYXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGUnXG4gICsgJ3x2YXJ8c2FtcHxrYmR8c3VifHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkbydcbiAgKyAnfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKVxcXFxiKVxcXFx3Kyg/ITovfFteXFxcXHdcXFxcc0BdKkApXFxcXGInO1xuXG5ibG9jay5odG1sID0gcmVwbGFjZShibG9jay5odG1sKVxuICAoJ2NvbW1lbnQnLCAvPCEtLVtcXHNcXFNdKj8tLT4vKVxuICAoJ2Nsb3NlZCcsIC88KHRhZylbXFxzXFxTXSs/PFxcL1xcMT4vKVxuICAoJ2Nsb3NpbmcnLCAvPHRhZyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8pXG4gICgvdGFnL2csIGJsb2NrLl90YWcpXG4gICgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCdocicsIGJsb2NrLmhyKVxuICAoJ2hlYWRpbmcnLCBibG9jay5oZWFkaW5nKVxuICAoJ2xoZWFkaW5nJywgYmxvY2subGhlYWRpbmcpXG4gICgnYmxvY2txdW90ZScsIGJsb2NrLmJsb2NrcXVvdGUpXG4gICgndGFnJywgJzwnICsgYmxvY2suX3RhZylcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2subm9ybWFsID0gbWVyZ2Uoe30sIGJsb2NrKTtcblxuLyoqXG4gKiBHRk0gQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLmdmbSA9IG1lcmdlKHt9LCBibG9jay5ub3JtYWwsIHtcbiAgZmVuY2VzOiAvXiAqKGB7Myx9fH57Myx9KVsgXFwuXSooXFxTKyk/ICpcXG4oW1xcc1xcU10qPylcXHMqXFwxICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiAvXi8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSArKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvXG59KTtcblxuYmxvY2suZ2ZtLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJyg/IScsICcoPyEnXG4gICAgKyBibG9jay5nZm0uZmVuY2VzLnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMicpICsgJ3wnXG4gICAgKyBibG9jay5saXN0LnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMycpICsgJ3wnKVxuICAoKTtcblxuLyoqXG4gKiBHRk0gKyBUYWJsZXMgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLnRhYmxlcyA9IG1lcmdlKHt9LCBibG9jay5nZm0sIHtcbiAgbnB0YWJsZTogL14gKihcXFMuKlxcfC4qKVxcbiAqKFstOl0rICpcXHxbLXwgOl0qKVxcbigoPzouKlxcfC4qKD86XFxufCQpKSopXFxuKi8sXG4gIHRhYmxlOiAvXiAqXFx8KC4rKVxcbiAqXFx8KCAqWy06XStbLXwgOl0qKVxcbigoPzogKlxcfC4qKD86XFxufCQpKSopXFxuKi9cbn0pO1xuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cblxuZnVuY3Rpb24gTGV4ZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2Vucy5saW5rcyA9IHt9O1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5ydWxlcyA9IGJsb2NrLm5vcm1hbDtcblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMudGFibGVzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2sudGFibGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2suZ2ZtO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBCbG9jayBSdWxlc1xuICovXG5cbkxleGVyLnJ1bGVzID0gYmxvY2s7XG5cbi8qKlxuICogU3RhdGljIExleCBNZXRob2RcbiAqL1xuXG5MZXhlci5sZXggPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMpIHtcbiAgdmFyIGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG59O1xuXG4vKipcbiAqIFByZXByb2Nlc3NpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHNyYyA9IHNyY1xuICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC9cXHQvZywgJyAgICAnKVxuICAgIC5yZXBsYWNlKC9cXHUwMGEwL2csICcgJylcbiAgICAucmVwbGFjZSgvXFx1MjQyNC9nLCAnXFxuJyk7XG5cbiAgcmV0dXJuIHRoaXMudG9rZW4oc3JjLCB0cnVlKTtcbn07XG5cbi8qKlxuICogTGV4aW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLnRva2VuID0gZnVuY3Rpb24oc3JjLCB0b3AsIGJxKSB7XG4gIHZhciBzcmMgPSBzcmMucmVwbGFjZSgvXiArJC9nbSwgJycpXG4gICAgLCBuZXh0XG4gICAgLCBsb29zZVxuICAgICwgY2FwXG4gICAgLCBidWxsXG4gICAgLCBiXG4gICAgLCBpdGVtXG4gICAgLCBzcGFjZVxuICAgICwgaVxuICAgICwgbDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gbmV3bGluZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLm5ld2xpbmUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFswXS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdzcGFjZSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gezR9L2dtLCAnJyk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBjYXAucmVwbGFjZSgvXFxuKyQvLCAnJylcbiAgICAgICAgICA6IGNhcFxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBmZW5jZXMgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5mZW5jZXMuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgbGFuZzogY2FwWzJdLFxuICAgICAgICB0ZXh0OiBjYXBbM10gfHwgJydcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQ6IGNhcFsyXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSBubyBsZWFkaW5nIHBpcGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLm5wdGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV0uc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzJdID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdocidcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYmxvY2txdW90ZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrcXVvdGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfc3RhcnQnXG4gICAgICB9KTtcblxuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gKj4gPy9nbSwgJycpO1xuXG4gICAgICAvLyBQYXNzIGB0b3BgIHRvIGtlZXAgdGhlIGN1cnJlbnRcbiAgICAgIC8vIFwidG9wbGV2ZWxcIiBzdGF0ZS4gVGhpcyBpcyBleGFjdGx5XG4gICAgICAvLyBob3cgbWFya2Rvd24ucGwgd29ya3MuXG4gICAgICB0aGlzLnRva2VuKGNhcCwgdG9wLCB0cnVlKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaXN0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGlzdC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBidWxsID0gY2FwWzJdO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3Rfc3RhcnQnLFxuICAgICAgICBvcmRlcmVkOiBidWxsLmxlbmd0aCA+IDFcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZXQgZWFjaCB0b3AtbGV2ZWwgaXRlbS5cbiAgICAgIGNhcCA9IGNhcFswXS5tYXRjaCh0aGlzLnJ1bGVzLml0ZW0pO1xuXG4gICAgICBuZXh0ID0gZmFsc2U7XG4gICAgICBsID0gY2FwLmxlbmd0aDtcbiAgICAgIGkgPSAwO1xuXG4gICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpdGVtID0gY2FwW2ldO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdCBpdGVtJ3MgYnVsbGV0XG4gICAgICAgIC8vIHNvIGl0IGlzIHNlZW4gYXMgdGhlIG5leHQgdG9rZW4uXG4gICAgICAgIHNwYWNlID0gaXRlbS5sZW5ndGg7XG4gICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL14gKihbKistXXxcXGQrXFwuKSArLywgJycpO1xuXG4gICAgICAgIC8vIE91dGRlbnQgd2hhdGV2ZXIgdGhlXG4gICAgICAgIC8vIGxpc3QgaXRlbSBjb250YWlucy4gSGFja3kuXG4gICAgICAgIGlmICh+aXRlbS5pbmRleE9mKCdcXG4gJykpIHtcbiAgICAgICAgICBzcGFjZSAtPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgICBpdGVtID0gIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgPyBpdGVtLnJlcGxhY2UobmV3IFJlZ0V4cCgnXiB7MSwnICsgc3BhY2UgKyAnfScsICdnbScpLCAnJylcbiAgICAgICAgICAgIDogaXRlbS5yZXBsYWNlKC9eIHsxLDR9L2dtLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgbmV4dCBsaXN0IGl0ZW0gYmVsb25ncyBoZXJlLlxuICAgICAgICAvLyBCYWNrcGVkYWwgaWYgaXQgZG9lcyBub3QgYmVsb25nIGluIHRoaXMgbGlzdC5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zbWFydExpc3RzICYmIGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgYiA9IGJsb2NrLmJ1bGxldC5leGVjKGNhcFtpICsgMV0pWzBdO1xuICAgICAgICAgIGlmIChidWxsICE9PSBiICYmICEoYnVsbC5sZW5ndGggPiAxICYmIGIubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgICAgIHNyYyA9IGNhcC5zbGljZShpICsgMSkuam9pbignXFxuJykgKyBzcmM7XG4gICAgICAgICAgICBpID0gbCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgaXRlbSBpcyBsb29zZSBvciBub3QuXG4gICAgICAgIC8vIFVzZTogLyhefFxcbikoPyEgKVteXFxuXStcXG5cXG4oPyFcXHMqJCkvXG4gICAgICAgIC8vIGZvciBkaXNjb3VudCBiZWhhdmlvci5cbiAgICAgICAgbG9vc2UgPSBuZXh0IHx8IC9cXG5cXG4oPyFcXHMqJCkvLnRlc3QoaXRlbSk7XG4gICAgICAgIGlmIChpICE9PSBsIC0gMSkge1xuICAgICAgICAgIG5leHQgPSBpdGVtLmNoYXJBdChpdGVtLmxlbmd0aCAtIDEpID09PSAnXFxuJztcbiAgICAgICAgICBpZiAoIWxvb3NlKSBsb29zZSA9IG5leHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBsb29zZVxuICAgICAgICAgICAgPyAnbG9vc2VfaXRlbV9zdGFydCdcbiAgICAgICAgICAgIDogJ2xpc3RfaXRlbV9zdGFydCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVjdXJzZS5cbiAgICAgICAgdGhpcy50b2tlbihpdGVtLCBmYWxzZSwgYnEpO1xuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fZW5kJ1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBodG1sXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHRtbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAncGFyYWdyYXBoJ1xuICAgICAgICAgIDogJ2h0bWwnLFxuICAgICAgICBwcmU6ICF0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgJiYgKGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScpLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVmXG4gICAgaWYgKCghYnEgJiYgdG9wKSAmJiAoY2FwID0gdGhpcy5ydWxlcy5kZWYuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLmxpbmtzW2NhcFsxXS50b0xvd2VyQ2FzZSgpXSA9IHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9O1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoLyg/OiAqXFx8ICopP1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldXG4gICAgICAgICAgLnJlcGxhY2UoL14gKlxcfCAqfCAqXFx8ICokL2csICcnKVxuICAgICAgICAgIC5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5wYXJhZ3JhcGguZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgdGV4dDogY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICAvLyBUb3AtbGV2ZWwgc2hvdWxkIG5ldmVyIHJlYWNoIGhlcmUuXG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbXFxcXGAqe31cXFtcXF0oKSMrXFwtLiFfPl0pLyxcbiAgYXV0b2xpbms6IC9ePChbXiA+XSsoQHw6XFwvKVteID5dKyk+LyxcbiAgdXJsOiBub29wLFxuICB0YWc6IC9ePCEtLVtcXHNcXFNdKj8tLT58XjxcXC8/XFx3Kyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8sXG4gIGxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxcKGhyZWZcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXHMqXFxbKFteXFxdXSopXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKCg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dKSopXFxdLyxcbiAgc3Ryb25nOiAvXl9fKFtcXHNcXFNdKz8pX18oPyFfKXxeXFwqXFwqKFtcXHNcXFNdKz8pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXlxcYl8oKD86W15fXXxfXykrPylfXFxifF5cXCooKD86XFwqXFwqfFtcXHNcXFNdKSs/KVxcKig/IVxcKikvLFxuICBjb2RlOiAvXihgKylcXHMqKFtcXHNcXFNdKj9bXmBdKVxccypcXDEoPyFgKS8sXG4gIGJyOiAvXiB7Mix9XFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wLFxuICB0ZXh0OiAvXltcXHNcXFNdKz8oPz1bXFxcXDwhXFxbXypgXXwgezIsfVxcbnwkKS9cbn07XG5cbmlubGluZS5faW5zaWRlID0gLyg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dfFxcXSg/PVteXFxbXSpcXF0pKSovO1xuaW5saW5lLl9ocmVmID0gL1xccyo8PyhbXFxzXFxTXSo/KT4/KD86XFxzK1snXCJdKFtcXHNcXFNdKj8pWydcIl0pP1xccyovO1xuXG5pbmxpbmUubGluayA9IHJlcGxhY2UoaW5saW5lLmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgnaHJlZicsIGlubGluZS5faHJlZilcbiAgKCk7XG5cbmlubGluZS5yZWZsaW5rID0gcmVwbGFjZShpbmxpbmUucmVmbGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IG1lcmdlKHt9LCBpbmxpbmUpO1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgc3Ryb25nOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXyl8XlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopL1xufSk7XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIGVzY2FwZTogcmVwbGFjZShpbmxpbmUuZXNjYXBlKSgnXSknLCAnfnxdKScpKCksXG4gIHVybDogL14oaHR0cHM/OlxcL1xcL1teXFxzPF0rW148Liw6O1wiJylcXF1cXHNdKS8sXG4gIGRlbDogL15+fig/PVxcUykoW1xcc1xcU10qP1xcUyl+fi8sXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLnRleHQpXG4gICAgKCddfCcsICd+XXwnKVxuICAgICgnfCcsICd8aHR0cHM/Oi8vfCcpXG4gICAgKClcbn0pO1xuXG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IG1lcmdlKHt9LCBpbmxpbmUuZ2ZtLCB7XG4gIGJyOiByZXBsYWNlKGlubGluZS5icikoJ3syLH0nLCAnKicpKCksXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLmdmbS50ZXh0KSgnezIsfScsICcqJykoKVxufSk7XG5cbi8qKlxuICogSW5saW5lIExleGVyICYgQ29tcGlsZXJcbiAqL1xuXG5mdW5jdGlvbiBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5saW5rcyA9IGxpbmtzO1xuICB0aGlzLnJ1bGVzID0gaW5saW5lLm5vcm1hbDtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICBpZiAoIXRoaXMubGlua3MpIHtcbiAgICB0aHJvdyBuZXdcbiAgICAgIEVycm9yKCdUb2tlbnMgYXJyYXkgcmVxdWlyZXMgYSBgbGlua3NgIHByb3BlcnR5LicpO1xuICB9XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5icmVha3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuZ2ZtO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICB0aGlzLnJ1bGVzID0gaW5saW5lLnBlZGFudGljO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIElubGluZSBSdWxlc1xuICovXG5cbklubGluZUxleGVyLnJ1bGVzID0gaW5saW5lO1xuXG4vKipcbiAqIFN0YXRpYyBMZXhpbmcvQ29tcGlsaW5nIE1ldGhvZFxuICovXG5cbklubGluZUxleGVyLm91dHB1dCA9IGZ1bmN0aW9uKHNyYywgbGlua3MsIG9wdGlvbnMpIHtcbiAgdmFyIGlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucyk7XG4gIHJldHVybiBpbmxpbmUub3V0cHV0KHNyYyk7XG59O1xuXG4vKipcbiAqIExleGluZy9Db21waWxpbmdcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbGlua1xuICAgICwgdGV4dFxuICAgICwgaHJlZlxuICAgICwgY2FwO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBlc2NhcGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lc2NhcGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IGNhcFsxXTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGF1dG9saW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYXV0b2xpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBjYXBbMV0uY2hhckF0KDYpID09PSAnOidcbiAgICAgICAgICA/IHRoaXMubWFuZ2xlKGNhcFsxXS5zdWJzdHJpbmcoNykpXG4gICAgICAgICAgOiB0aGlzLm1hbmdsZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGhpcy5tYW5nbGUoJ21haWx0bzonKSArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgfVxuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHVybCAoZ2ZtKVxuICAgIGlmICghdGhpcy5pbkxpbmsgJiYgKGNhcCA9IHRoaXMucnVsZXMudXJsLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICBocmVmID0gdGV4dDtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50YWcuZXhlYyhzcmMpKSB7XG4gICAgICBpZiAoIXRoaXMuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKVxuICAgICAgICA6IGNhcFswXVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZW1cbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lbS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5lbSh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLCB0cnVlKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBiclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJyKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWwgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5kZWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZGVsKHRoaXMub3V0cHV0KGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGV4dChlc2NhcGUodGhpcy5zbWFydHlwYW50cyhjYXBbMF0pKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb21waWxlIExpbmtcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0TGluayA9IGZ1bmN0aW9uKGNhcCwgbGluaykge1xuICB2YXIgaHJlZiA9IGVzY2FwZShsaW5rLmhyZWYpXG4gICAgLCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuXG4gIHJldHVybiBjYXBbMF0uY2hhckF0KDApICE9PSAnISdcbiAgICA/IHRoaXMucmVuZGVyZXIubGluayhocmVmLCB0aXRsZSwgdGhpcy5vdXRwdXQoY2FwWzFdKSlcbiAgICA6IHRoaXMucmVuZGVyZXIuaW1hZ2UoaHJlZiwgdGl0bGUsIGVzY2FwZShjYXBbMV0pKTtcbn07XG5cbi8qKlxuICogU21hcnR5cGFudHMgVHJhbnNmb3JtYXRpb25zXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLnNtYXJ0eXBhbnRzID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5zbWFydHlwYW50cykgcmV0dXJuIHRleHQ7XG4gIHJldHVybiB0ZXh0XG4gICAgLy8gZW0tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gZW4tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tL2csICdcXHUyMDEzJylcbiAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XCJcXHNdKScvZywgJyQxXFx1MjAxOCcpXG4gICAgLy8gY2xvc2luZyBzaW5nbGVzICYgYXBvc3Ryb3BoZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpXG4gICAgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1xcdTIwMThcXHNdKVwiL2csICckMVxcdTIwMWMnKVxuICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cIi9nLCAnXFx1MjAxZCcpXG4gICAgLy8gZWxsaXBzZXNcbiAgICAucmVwbGFjZSgvXFwuezN9L2csICdcXHUyMDI2Jyk7XG59O1xuXG4vKipcbiAqIE1hbmdsZSBMaW5rc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5tYW5nbGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLm1hbmdsZSkgcmV0dXJuIHRleHQ7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbCA9IHRleHQubGVuZ3RoXG4gICAgLCBpID0gMFxuICAgICwgY2g7XG5cbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZW5kZXJlclxuICovXG5cbmZ1bmN0aW9uIFJlbmRlcmVyKG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbn1cblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGUgPSBmdW5jdGlvbihjb2RlLCBsYW5nLCBlc2NhcGVkKSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgdmFyIG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICBjb2RlID0gb3V0O1xuICAgIH1cbiAgfVxuXG4gIGlmICghbGFuZykge1xuICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJ1xcbjwvY29kZT48L3ByZT4nO1xuICB9XG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICArIGVzY2FwZShsYW5nLCB0cnVlKVxuICAgICsgJ1wiPidcbiAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICArICdcXG48L2NvZGU+PC9wcmU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ibG9ja3F1b3RlID0gZnVuY3Rpb24ocXVvdGUpIHtcbiAgcmV0dXJuICc8YmxvY2txdW90ZT5cXG4nICsgcXVvdGUgKyAnPC9ibG9ja3F1b3RlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWw7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaGVhZGluZyA9IGZ1bmN0aW9uKHRleHQsIGxldmVsLCByYXcpIHtcbiAgcmV0dXJuICc8aCdcbiAgICArIGxldmVsXG4gICAgKyAnIGlkPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmhlYWRlclByZWZpeFxuICAgICsgcmF3LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHddKy9nLCAnLScpXG4gICAgKyAnXCI+J1xuICAgICsgdGV4dFxuICAgICsgJzwvaCdcbiAgICArIGxldmVsXG4gICAgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKGJvZHksIG9yZGVyZWQpIHtcbiAgdmFyIHR5cGUgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCc7XG4gIHJldHVybiAnPCcgKyB0eXBlICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3RpdGVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxsaT4nICsgdGV4dCArICc8L2xpPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUucGFyYWdyYXBoID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxwPicgKyB0ZXh0ICsgJzwvcD5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24oaGVhZGVyLCBib2R5KSB7XG4gIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICArICc8dGhlYWQ+XFxuJ1xuICAgICsgaGVhZGVyXG4gICAgKyAnPC90aGVhZD5cXG4nXG4gICAgKyAnPHRib2R5PlxcbidcbiAgICArIGJvZHlcbiAgICArICc8L3Rib2R5PlxcbidcbiAgICArICc8L3RhYmxlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVyb3cgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiAnPHRyPlxcbicgKyBjb250ZW50ICsgJzwvdHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZWNlbGwgPSBmdW5jdGlvbihjb250ZW50LCBmbGFncykge1xuICB2YXIgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICB2YXIgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICA/ICc8JyArIHR5cGUgKyAnIHN0eWxlPVwidGV4dC1hbGlnbjonICsgZmxhZ3MuYWxpZ24gKyAnXCI+J1xuICAgIDogJzwnICsgdHlwZSArICc+JztcbiAgcmV0dXJuIHRhZyArIGNvbnRlbnQgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cbi8vIHNwYW4gbGV2ZWwgcmVuZGVyZXJcblJlbmRlcmVyLnByb3RvdHlwZS5zdHJvbmcgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHN0cm9uZz4nICsgdGV4dCArICc8L3N0cm9uZz4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxlbT4nICsgdGV4dCArICc8L2VtPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZXNwYW4gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGNvZGU+JyArIHRleHQgKyAnPC9jb2RlPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYnIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxkZWw+JyArIHRleHQgKyAnPC9kZWw+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saW5rID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2UoL1teXFx3Ol0vZywgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG4gIHZhciBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmltYWdlID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgdmFyIG91dCA9ICc8aW1nIHNyYz1cIicgKyBocmVmICsgJ1wiIGFsdD1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiB0ZXh0O1xufTtcblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cblxuZnVuY3Rpb24gUGFyc2VyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbiA9IG51bGw7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLm9wdGlvbnMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG59XG5cbi8qKlxuICogU3RhdGljIFBhcnNlIE1ldGhvZFxuICovXG5cblBhcnNlci5wYXJzZSA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucywgcmVuZGVyZXIpIHtcbiAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucywgcmVuZGVyZXIpO1xuICByZXR1cm4gcGFyc2VyLnBhcnNlKHNyYyk7XG59O1xuXG4vKipcbiAqIFBhcnNlIExvb3BcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oc3JjKSB7XG4gIHRoaXMuaW5saW5lID0gbmV3IElubGluZUxleGVyKHNyYy5saW5rcywgdGhpcy5vcHRpb25zLCB0aGlzLnJlbmRlcmVyKTtcbiAgdGhpcy50b2tlbnMgPSBzcmMucmV2ZXJzZSgpO1xuXG4gIHZhciBvdXQgPSAnJztcbiAgd2hpbGUgKHRoaXMubmV4dCgpKSB7XG4gICAgb3V0ICs9IHRoaXMudG9rKCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2VuID0gdGhpcy50b2tlbnMucG9wKCk7XG59O1xuXG4vKipcbiAqIFByZXZpZXcgTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy50b2tlbnMubGVuZ3RoIC0gMV0gfHwgMDtcbn07XG5cbi8qKlxuICogUGFyc2UgVGV4dCBUb2tlbnNcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlVGV4dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYm9keSA9IHRoaXMudG9rZW4udGV4dDtcblxuICB3aGlsZSAodGhpcy5wZWVrKCkudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgYm9keSArPSAnXFxuJyArIHRoaXMubmV4dCgpLnRleHQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5pbmxpbmUub3V0cHV0KGJvZHkpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBDdXJyZW50IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS50b2sgPSBmdW5jdGlvbigpIHtcbiAgc3dpdGNoICh0aGlzLnRva2VuLnR5cGUpIHtcbiAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY2FzZSAnaHInOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgIH1cbiAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCksXG4gICAgICAgIHRoaXMudG9rZW4uZGVwdGgsXG4gICAgICAgIHRoaXMudG9rZW4udGV4dCk7XG4gICAgfVxuICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5jb2RlKHRoaXMudG9rZW4udGV4dCxcbiAgICAgICAgdGhpcy50b2tlbi5sYW5nLFxuICAgICAgICB0aGlzLnRva2VuLmVzY2FwZWQpO1xuICAgIH1cbiAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgIHZhciBoZWFkZXIgPSAnJ1xuICAgICAgICAsIGJvZHkgPSAnJ1xuICAgICAgICAsIGlcbiAgICAgICAgLCByb3dcbiAgICAgICAgLCBjZWxsXG4gICAgICAgICwgZmxhZ3NcbiAgICAgICAgLCBqO1xuXG4gICAgICAvLyBoZWFkZXJcbiAgICAgIGNlbGwgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmhlYWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBmbGFncyA9IHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9O1xuICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLmhlYWRlcltpXSksXG4gICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICByb3cgPSB0aGlzLnRva2VuLmNlbGxzW2ldO1xuXG4gICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQocm93W2pdKSxcbiAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdibG9ja3F1b3RlX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdibG9ja3F1b3RlX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ibG9ja3F1b3RlKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJ1xuICAgICAgICAsIG9yZGVyZWQgPSB0aGlzLnRva2VuLm9yZGVyZWQ7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkKTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rZW4udHlwZSA9PT0gJ3RleHQnXG4gICAgICAgICAgPyB0aGlzLnBhcnNlVGV4dCgpXG4gICAgICAgICAgOiB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbG9vc2VfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgIHZhciBodG1sID0gIXRoaXMudG9rZW4ucHJlICYmICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgPyB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KVxuICAgICAgICA6IHRoaXMudG9rZW4udGV4dDtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmh0bWwoaHRtbCk7XG4gICAgfVxuICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSk7XG4gICAgfVxuICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5wYXJzZVRleHQoKSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuXG5mdW5jdGlvbiBlc2NhcGUoaHRtbCwgZW5jb2RlKSB7XG4gIHJldHVybiBodG1sXG4gICAgLnJlcGxhY2UoIWVuY29kZSA/IC8mKD8hIz9cXHcrOykvZyA6IC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgLnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSgvJihbI1xcd10rKTsvZywgZnVuY3Rpb24oXywgbikge1xuICAgIG4gPSBuLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG4gPT09ICdjb2xvbicpIHJldHVybiAnOic7XG4gICAgaWYgKG4uY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIHJldHVybiBuLmNoYXJBdCgxKSA9PT0gJ3gnXG4gICAgICAgID8gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChuLnN1YnN0cmluZygyKSwgMTYpKVxuICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoK24uc3Vic3RyaW5nKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZShyZWdleCwgb3B0KSB7XG4gIHJlZ2V4ID0gcmVnZXguc291cmNlO1xuICBvcHQgPSBvcHQgfHwgJyc7XG4gIHJldHVybiBmdW5jdGlvbiBzZWxmKG5hbWUsIHZhbCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgsIG9wdCk7XG4gICAgdmFsID0gdmFsLnNvdXJjZSB8fCB2YWw7XG4gICAgdmFsID0gdmFsLnJlcGxhY2UoLyhefFteXFxbXSlcXF4vZywgJyQxJyk7XG4gICAgcmVnZXggPSByZWdleC5yZXBsYWNlKG5hbWUsIHZhbCk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxubm9vcC5leGVjID0gbm9vcDtcblxuZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gIHZhciBpID0gMVxuICAgICwgdGFyZ2V0XG4gICAgLCBrZXk7XG5cbiAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChrZXkgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHRhcmdldFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIGlmIChjYWxsYmFjayB8fCB0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgICBvcHQgPSBudWxsO1xuICAgIH1cblxuICAgIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCB8fCB7fSk7XG5cbiAgICB2YXIgaGlnaGxpZ2h0ID0gb3B0LmhpZ2hsaWdodFxuICAgICAgLCB0b2tlbnNcbiAgICAgICwgcGVuZGluZ1xuICAgICAgLCBpID0gMDtcblxuICAgIHRyeSB7XG4gICAgICB0b2tlbnMgPSBMZXhlci5sZXgoc3JjLCBvcHQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgIH1cblxuICAgIHBlbmRpbmcgPSB0b2tlbnMubGVuZ3RoO1xuXG4gICAgdmFyIGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG91dCA9IFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVyciA9IGU7XG4gICAgICB9XG5cbiAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgIHJldHVybiBlcnJcbiAgICAgICAgPyBjYWxsYmFjayhlcnIpXG4gICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICBpZiAoIXBlbmRpbmcpIHJldHVybiBkb25lKCk7XG5cbiAgICBmb3IgKDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnY29kZScpIHtcbiAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgaWYgKGNvZGUgPT0gbnVsbCB8fCBjb2RlID09PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSh0b2tlbnNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGlmIChvcHQpIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShMZXhlci5sZXgoc3JjLCBvcHQpLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkLic7XG4gICAgaWYgKChvcHQgfHwgbWFya2VkLmRlZmF1bHRzKS5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG5cbm1hcmtlZC5vcHRpb25zID1cbm1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG1lcmdlKG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgcmV0dXJuIG1hcmtlZDtcbn07XG5cbm1hcmtlZC5kZWZhdWx0cyA9IHtcbiAgZ2ZtOiB0cnVlLFxuICB0YWJsZXM6IHRydWUsXG4gIGJyZWFrczogZmFsc2UsXG4gIHBlZGFudGljOiBmYWxzZSxcbiAgc2FuaXRpemU6IGZhbHNlLFxuICBzYW5pdGl6ZXI6IG51bGwsXG4gIG1hbmdsZTogdHJ1ZSxcbiAgc21hcnRMaXN0czogZmFsc2UsXG4gIHNpbGVudDogZmFsc2UsXG4gIGhpZ2hsaWdodDogbnVsbCxcbiAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgc21hcnR5cGFudHM6IGZhbHNlLFxuICBoZWFkZXJQcmVmaXg6ICcnLFxuICByZW5kZXJlcjogbmV3IFJlbmRlcmVyLFxuICB4aHRtbDogZmFsc2Vcbn07XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5cbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xuXG5tYXJrZWQuTGV4ZXIgPSBMZXhlcjtcbm1hcmtlZC5sZXhlciA9IExleGVyLmxleDtcblxubWFya2VkLklubGluZUxleGVyID0gSW5saW5lTGV4ZXI7XG5tYXJrZWQuaW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlci5vdXRwdXQ7XG5cbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IG1hcmtlZDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG1hcmtlZDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLm1hcmtlZCA9IG1hcmtlZDtcbn1cblxufSkuY2FsbChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTtcbn0oKSk7XG4iLCIvKmpzaGludCBsYXhicmVhazogdHJ1ZSAqL1xuXG52YXIgY29kZVBhdHRlcm4gPSAvPHRkIGNsYXNzPVwiY29kZVwiLio/PFxcL3RkPi9cbiAgLCBhbGxTY3JpcHRUYWdzID0gW1xuICAgICAgXG4gICAgICAgIC8vIDxzY3JpcHQ+IC4uLiA8L3NjcmlwdD5cbiAgICAgICAgeyBvcGVuOiAvPHNjcmlwdFtePl0qPi8sIGNsb3NlOiAvPFxcL3NjcmlwdFtePl0qPi8sIGFsaWFzOiAnanMnIH1cblxuICAgICAgICAvLyA8PyAuLi4gPz5cbiAgICAgICwgeyBvcGVuOiAvXlxccyo8XFw/XFxzKiQvLCBjbG9zZTogL15cXHMqXFw/PlxccyokLywgIGFsaWFzOiAncGhwJyB9XG5cbiAgICAgICAgLy8gPCFbQ0RBVEFbIC4uLiBdXSAgICAgLS0gKGlubGluZSBhY3Rpb25zY3JpcHQpIG9ubHkgdXNlZCBmb3IgeGh0bWxcbiAgICAgICwgeyBvcGVuOiAvXlxccyo/PCFcXFtDREFUQVxcW1xccyo/JC8sIGNsb3NlOiAvXlxccyo/XFxdXFxdPlxccyo/JC8sIGFsaWFzOiAnYXMzJywgYXBwbHlUbzogJ3hodG1sJyB9XG4gICAgXTtcblxuZnVuY3Rpb24gZmluZFNjcmlwdHMobGluZXMsIHNwZWNpZmllZEFsaWFzKSB7XG4gIHZhciBzY3JpcHRzID0gW11cbiAgICAsIGluU2NyaXB0ID0gZmFsc2VcbiAgICAsIGN1cnJlbnRTY3JpcHRcbiAgICAsIHNjcmlwdFRhZ3MgPSBhbGxTY3JpcHRUYWdzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgIC8vIEUuZy4sIGluIGNhc2Ugb2YgIVtDREFUQSBtYWtlIHN1cmUgd2Ugb25seSBoaWdobGlnaHQgaWYgdXNlciBzcGVjaWZpZWQgeGh0bWxcbiAgICAgICAgICByZXR1cm4gIXRhZy5hcHBseVRvIHx8IHRhZy5hcHBseVRvID09PSBzcGVjaWZpZWRBbGlhcztcbiAgICAgICAgfSk7XG5cbiAgZm9yICh2YXIgbGluZU51bSAgPSAwOyBsaW5lTnVtIDwgbGluZXMubGVuZ3RoOyBsaW5lTnVtKyspIHtcbiAgICB2YXIgbGluZSA9IGxpbmVzW2xpbmVOdW1dO1xuXG4gICAgaWYgKCFpblNjcmlwdCkge1xuICAgICAgdmFyIG1hdGNoaW5nVGFnID0gbnVsbDtcblxuICAgICAgZm9yICh2YXIgdGFnSW5kZXggPSAwOyB0YWdJbmRleCA8IHNjcmlwdFRhZ3MubGVuZ3RoOyB0YWdJbmRleCsrKSB7XG4gICAgICAgIHZhciB0YWcgPSBzY3JpcHRUYWdzW3RhZ0luZGV4XTtcblxuICAgICAgICBpZiAobGluZS5tYXRjaCh0YWcub3BlbikpIHsgXG4gICAgICAgICAgbWF0Y2hpbmdUYWcgPSB0YWc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1hdGNoaW5nVGFnKSB7XG4gICAgICAgIGluU2NyaXB0ID0gdHJ1ZTtcbiAgICAgICAgY3VycmVudFNjcmlwdCA9IHsgZnJvbTogbGluZU51bSArIDEsIGNvZGU6ICcnLCB0YWc6IG1hdGNoaW5nVGFnIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChsaW5lLm1hdGNoKGN1cnJlbnRTY3JpcHQudGFnLmNsb3NlKSkge1xuICAgICAgaW5TY3JpcHQgPSBmYWxzZTtcbiAgICAgIGN1cnJlbnRTY3JpcHQudG8gPSBsaW5lTnVtIC0gMTtcbiAgICAgIHNjcmlwdHMucHVzaChjdXJyZW50U2NyaXB0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGN1cnJlbnRTY3JpcHQuY29kZSArPSBsaW5lICsgJ1xcbic7XG4gIH1cblxuICByZXR1cm4gc2NyaXB0cztcbn1cblxuZnVuY3Rpb24gZXh0cmFjdExpbmVzKGh0bWwpIHtcbiAgdmFyIGNvZGUgPSBodG1sLm1hdGNoKGNvZGVQYXR0ZXJuKVswXVxuICAgICwgbGluZXMgPSBjb2RlLm1hdGNoKC88ZGl2ICtjbGFzcz1cImxpbmUgLis/PFxcL2Rpdj4vbWcpO1xuXG4gIHJldHVybiBsaW5lcy5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVBsYWluTGluZXMoZnJvbUluZGV4LCB0b0luZGV4LCBodG1sLCByZXBsYWNlbWVudCkge1xuICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChcbiAgICAgICAgICAnPGRpdiArY2xhc3M9XCJbXlwiXSs/aW5kZXgnICsgZnJvbUluZGV4ICsgJ1teXCJdKlwiJyAgLy8gb3BlbmluZyB0YWcgb2Ygc3RhcnRcbiAgICAgICAgKyAnLisnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzY3JpcHQgaHRtbFxuICAgICAgICArICc8ZGl2ICtjbGFzcz1cIlteXCJdKz9pbmRleCcgKyB0b0luZGV4ICsgJ1teXCJdKlwiJyAgICAvLyBvcGVuaW5nIHRhZyBvZiBlbmRcbiAgICAgICAgKyAnLis/PC9kaXY+JyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjbG9zaW5nIHRhZyBvZiBlbmRcbiAgICAgIClcbiAgICAsIGNvZGUgICAgICAgICAgICAgICAgPSAgaHRtbC5tYXRjaChjb2RlUGF0dGVybilbMF1cbiAgICAsIGNvZGVXaXRoUmVwbGFjZW1lbnQgPSAgY29kZS5yZXBsYWNlKHJlZ2V4cCwgcmVwbGFjZW1lbnQpO1xuXG4gIHJldHVybiBodG1sLnJlcGxhY2UoY29kZSwgY29kZVdpdGhSZXBsYWNlbWVudCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZmluZFNjcmlwdHMgICAgICAgOiAgZmluZFNjcmlwdHNcbiAgLCBleHRyYWN0TGluZXMgICAgICA6ICBleHRyYWN0TGluZXNcbiAgLCByZXBsYWNlUGxhaW5MaW5lcyA6ICByZXBsYWNlUGxhaW5MaW5lc1xufTtcbiIsIi8vIFhSZWdFeHAgMS41LjFcbi8vIChjKSAyMDA3LTIwMTIgU3RldmVuIExldml0aGFuXG4vLyBNSVQgTGljZW5zZVxuLy8gPGh0dHA6Ly94cmVnZXhwLmNvbT5cbi8vIFByb3ZpZGVzIGFuIGF1Z21lbnRlZCwgZXh0ZW5zaWJsZSwgY3Jvc3MtYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiByZWd1bGFyIGV4cHJlc3Npb25zLFxuLy8gaW5jbHVkaW5nIHN1cHBvcnQgZm9yIGFkZGl0aW9uYWwgc3ludGF4LCBmbGFncywgYW5kIG1ldGhvZHNcblxudmFyIFhSZWdFeHA7XG5cbmlmIChYUmVnRXhwKSB7XG4gICAgLy8gQXZvaWQgcnVubmluZyB0d2ljZSwgc2luY2UgdGhhdCB3b3VsZCBicmVhayByZWZlcmVuY2VzIHRvIG5hdGl2ZSBnbG9iYWxzXG4gICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBsb2FkIFhSZWdFeHAgdHdpY2UgaW4gdGhlIHNhbWUgZnJhbWVcIik7XG59XG5cbi8vIFJ1biB3aXRoaW4gYW4gYW5vbnltb3VzIGZ1bmN0aW9uIHRvIHByb3RlY3QgdmFyaWFibGVzIGFuZCBhdm9pZCBuZXcgZ2xvYmFsc1xuKGZ1bmN0aW9uICh1bmRlZmluZWQpIHtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIENvbnN0cnVjdG9yXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEFjY2VwdHMgYSBwYXR0ZXJuIGFuZCBmbGFnczsgcmV0dXJucyBhIG5ldywgZXh0ZW5kZWQgYFJlZ0V4cGAgb2JqZWN0LiBEaWZmZXJzIGZyb20gYSBuYXRpdmVcbiAgICAvLyByZWd1bGFyIGV4cHJlc3Npb24gaW4gdGhhdCBhZGRpdGlvbmFsIHN5bnRheCBhbmQgZmxhZ3MgYXJlIHN1cHBvcnRlZCBhbmQgY3Jvc3MtYnJvd3NlclxuICAgIC8vIHN5bnRheCBpbmNvbnNpc3RlbmNpZXMgYXJlIGFtZWxpb3JhdGVkLiBgWFJlZ0V4cCgvcmVnZXgvKWAgY2xvbmVzIGFuIGV4aXN0aW5nIHJlZ2V4IGFuZFxuICAgIC8vIGNvbnZlcnRzIHRvIHR5cGUgWFJlZ0V4cFxuICAgIFhSZWdFeHAgPSBmdW5jdGlvbiAocGF0dGVybiwgZmxhZ3MpIHtcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdLFxuICAgICAgICAgICAgY3VyclNjb3BlID0gWFJlZ0V4cC5PVVRTSURFX0NMQVNTLFxuICAgICAgICAgICAgcG9zID0gMCxcbiAgICAgICAgICAgIGNvbnRleHQsIHRva2VuUmVzdWx0LCBtYXRjaCwgY2hyLCByZWdleDtcblxuICAgICAgICBpZiAoWFJlZ0V4cC5pc1JlZ0V4cChwYXR0ZXJuKSkge1xuICAgICAgICAgICAgaWYgKGZsYWdzICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiY2FuJ3Qgc3VwcGx5IGZsYWdzIHdoZW4gY29uc3RydWN0aW5nIG9uZSBSZWdFeHAgZnJvbSBhbm90aGVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGNsb25lKHBhdHRlcm4pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRva2VucyBiZWNvbWUgcGFydCBvZiB0aGUgcmVnZXggY29uc3RydWN0aW9uIHByb2Nlc3MsIHNvIHByb3RlY3QgYWdhaW5zdCBpbmZpbml0ZVxuICAgICAgICAvLyByZWN1cnNpb24gd2hlbiBhbiBYUmVnRXhwIGlzIGNvbnN0cnVjdGVkIHdpdGhpbiBhIHRva2VuIGhhbmRsZXIgb3IgdHJpZ2dlclxuICAgICAgICBpZiAoaXNJbnNpZGVDb25zdHJ1Y3RvcilcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiY2FuJ3QgY2FsbCB0aGUgWFJlZ0V4cCBjb25zdHJ1Y3RvciB3aXRoaW4gdG9rZW4gZGVmaW5pdGlvbiBmdW5jdGlvbnNcIik7XG5cbiAgICAgICAgZmxhZ3MgPSBmbGFncyB8fCBcIlwiO1xuICAgICAgICBjb250ZXh0ID0geyAvLyBgdGhpc2Agb2JqZWN0IGZvciBjdXN0b20gdG9rZW5zXG4gICAgICAgICAgICBoYXNOYW1lZENhcHR1cmU6IGZhbHNlLFxuICAgICAgICAgICAgY2FwdHVyZU5hbWVzOiBbXSxcbiAgICAgICAgICAgIGhhc0ZsYWc6IGZ1bmN0aW9uIChmbGFnKSB7cmV0dXJuIGZsYWdzLmluZGV4T2YoZmxhZykgPiAtMTt9LFxuICAgICAgICAgICAgc2V0RmxhZzogZnVuY3Rpb24gKGZsYWcpIHtmbGFncyArPSBmbGFnO31cbiAgICAgICAgfTtcblxuICAgICAgICB3aGlsZSAocG9zIDwgcGF0dGVybi5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBjdXN0b20gdG9rZW5zIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgICAgICB0b2tlblJlc3VsdCA9IHJ1blRva2VucyhwYXR0ZXJuLCBwb3MsIGN1cnJTY29wZSwgY29udGV4dCk7XG5cbiAgICAgICAgICAgIGlmICh0b2tlblJlc3VsdCkge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHRva2VuUmVzdWx0Lm91dHB1dCk7XG4gICAgICAgICAgICAgICAgcG9zICs9ICh0b2tlblJlc3VsdC5tYXRjaFswXS5sZW5ndGggfHwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBuYXRpdmUgbXVsdGljaGFyYWN0ZXIgbWV0YXNlcXVlbmNlcyAoZXhjbHVkaW5nIGNoYXJhY3RlciBjbGFzc2VzKSBhdFxuICAgICAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoID0gbmF0aXYuZXhlYy5jYWxsKG5hdGl2ZVRva2Vuc1tjdXJyU2NvcGVdLCBwYXR0ZXJuLnNsaWNlKHBvcykpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKG1hdGNoWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjaHIgPSBwYXR0ZXJuLmNoYXJBdChwb3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hyID09PSBcIltcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJTY29wZSA9IFhSZWdFeHAuSU5TSURFX0NMQVNTO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjaHIgPT09IFwiXVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyclNjb3BlID0gWFJlZ0V4cC5PVVRTSURFX0NMQVNTO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHBvc2l0aW9uIG9uZSBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goY2hyKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVnZXggPSBSZWdFeHAob3V0cHV0LmpvaW4oXCJcIiksIG5hdGl2LnJlcGxhY2UuY2FsbChmbGFncywgZmxhZ0NsaXAsIFwiXCIpKTtcbiAgICAgICAgcmVnZXguX3hyZWdleHAgPSB7XG4gICAgICAgICAgICBzb3VyY2U6IHBhdHRlcm4sXG4gICAgICAgICAgICBjYXB0dXJlTmFtZXM6IGNvbnRleHQuaGFzTmFtZWRDYXB0dXJlID8gY29udGV4dC5jYXB0dXJlTmFtZXMgOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZWdleDtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQdWJsaWMgcHJvcGVydGllc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBYUmVnRXhwLnZlcnNpb24gPSBcIjEuNS4xXCI7XG5cbiAgICAvLyBUb2tlbiBzY29wZSBiaXRmbGFnc1xuICAgIFhSZWdFeHAuSU5TSURFX0NMQVNTID0gMTtcbiAgICBYUmVnRXhwLk9VVFNJREVfQ0xBU1MgPSAyO1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQcml2YXRlIHZhcmlhYmxlc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICB2YXIgcmVwbGFjZW1lbnRUb2tlbiA9IC9cXCQoPzooXFxkXFxkP3xbJCZgJ10pfHsoWyRcXHddKyl9KS9nLFxuICAgICAgICBmbGFnQ2xpcCA9IC9bXmdpbXldK3woW1xcc1xcU10pKD89W1xcc1xcU10qXFwxKS9nLCAvLyBOb25uYXRpdmUgYW5kIGR1cGxpY2F0ZSBmbGFnc1xuICAgICAgICBxdWFudGlmaWVyID0gL14oPzpbPyorXXx7XFxkKyg/OixcXGQqKT99KVxcPz8vLFxuICAgICAgICBpc0luc2lkZUNvbnN0cnVjdG9yID0gZmFsc2UsXG4gICAgICAgIHRva2VucyA9IFtdLFxuICAgICAgICAvLyBDb3B5IG5hdGl2ZSBnbG9iYWxzIGZvciByZWZlcmVuY2UgKFwibmF0aXZlXCIgaXMgYW4gRVMzIHJlc2VydmVkIGtleXdvcmQpXG4gICAgICAgIG5hdGl2ID0ge1xuICAgICAgICAgICAgZXhlYzogUmVnRXhwLnByb3RvdHlwZS5leGVjLFxuICAgICAgICAgICAgdGVzdDogUmVnRXhwLnByb3RvdHlwZS50ZXN0LFxuICAgICAgICAgICAgbWF0Y2g6IFN0cmluZy5wcm90b3R5cGUubWF0Y2gsXG4gICAgICAgICAgICByZXBsYWNlOiBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UsXG4gICAgICAgICAgICBzcGxpdDogU3RyaW5nLnByb3RvdHlwZS5zcGxpdFxuICAgICAgICB9LFxuICAgICAgICBjb21wbGlhbnRFeGVjTnBjZyA9IG5hdGl2LmV4ZWMuY2FsbCgvKCk/Py8sIFwiXCIpWzFdID09PSB1bmRlZmluZWQsIC8vIGNoZWNrIGBleGVjYCBoYW5kbGluZyBvZiBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cHNcbiAgICAgICAgY29tcGxpYW50TGFzdEluZGV4SW5jcmVtZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHggPSAvXi9nO1xuICAgICAgICAgICAgbmF0aXYudGVzdC5jYWxsKHgsIFwiXCIpO1xuICAgICAgICAgICAgcmV0dXJuICF4Lmxhc3RJbmRleDtcbiAgICAgICAgfSgpLFxuICAgICAgICBoYXNOYXRpdmVZID0gUmVnRXhwLnByb3RvdHlwZS5zdGlja3kgIT09IHVuZGVmaW5lZCxcbiAgICAgICAgbmF0aXZlVG9rZW5zID0ge307XG5cbiAgICAvLyBgbmF0aXZlVG9rZW5zYCBtYXRjaCBuYXRpdmUgbXVsdGljaGFyYWN0ZXIgbWV0YXNlcXVlbmNlcyBvbmx5IChpbmNsdWRpbmcgZGVwcmVjYXRlZCBvY3RhbHMsXG4gICAgLy8gZXhjbHVkaW5nIGNoYXJhY3RlciBjbGFzc2VzKVxuICAgIG5hdGl2ZVRva2Vuc1tYUmVnRXhwLklOU0lERV9DTEFTU10gPSAvXig/OlxcXFwoPzpbMC0zXVswLTddezAsMn18WzQtN11bMC03XT98eFtcXGRBLUZhLWZdezJ9fHVbXFxkQS1GYS1mXXs0fXxjW0EtWmEtel18W1xcc1xcU10pKS87XG4gICAgbmF0aXZlVG9rZW5zW1hSZWdFeHAuT1VUU0lERV9DTEFTU10gPSAvXig/OlxcXFwoPzowKD86WzAtM11bMC03XXswLDJ9fFs0LTddWzAtN10/KT98WzEtOV1cXGQqfHhbXFxkQS1GYS1mXXsyfXx1W1xcZEEtRmEtZl17NH18Y1tBLVphLXpdfFtcXHNcXFNdKXxcXChcXD9bOj0hXXxbPyorXVxcP3x7XFxkKyg/OixcXGQqKT99XFw/PykvO1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQdWJsaWMgbWV0aG9kc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBMZXRzIHlvdSBleHRlbmQgb3IgY2hhbmdlIFhSZWdFeHAgc3ludGF4IGFuZCBjcmVhdGUgY3VzdG9tIGZsYWdzLiBUaGlzIGlzIHVzZWQgaW50ZXJuYWxseSBieVxuICAgIC8vIHRoZSBYUmVnRXhwIGxpYnJhcnkgYW5kIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBYUmVnRXhwIHBsdWdpbnMuIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgZm9yXG4gICAgLy8gdXNlcnMgd2l0aCBhZHZhbmNlZCBrbm93bGVkZ2Ugb2YgSmF2YVNjcmlwdCdzIHJlZ3VsYXIgZXhwcmVzc2lvbiBzeW50YXggYW5kIGJlaGF2aW9yLiBJdCBjYW5cbiAgICAvLyBiZSBkaXNhYmxlZCBieSBgWFJlZ0V4cC5mcmVlemVUb2tlbnNgXG4gICAgWFJlZ0V4cC5hZGRUb2tlbiA9IGZ1bmN0aW9uIChyZWdleCwgaGFuZGxlciwgc2NvcGUsIHRyaWdnZXIpIHtcbiAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgcGF0dGVybjogY2xvbmUocmVnZXgsIFwiZ1wiICsgKGhhc05hdGl2ZVkgPyBcInlcIiA6IFwiXCIpKSxcbiAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICBzY29wZTogc2NvcGUgfHwgWFJlZ0V4cC5PVVRTSURFX0NMQVNTLFxuICAgICAgICAgICAgdHJpZ2dlcjogdHJpZ2dlciB8fCBudWxsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgcGF0dGVybiBhbmQgZmxhZ3M7IHJldHVybnMgYW4gZXh0ZW5kZWQgYFJlZ0V4cGAgb2JqZWN0LiBJZiB0aGUgcGF0dGVybiBhbmQgZmxhZ1xuICAgIC8vIGNvbWJpbmF0aW9uIGhhcyBwcmV2aW91c2x5IGJlZW4gY2FjaGVkLCB0aGUgY2FjaGVkIGNvcHkgaXMgcmV0dXJuZWQ7IG90aGVyd2lzZSB0aGUgbmV3bHlcbiAgICAvLyBjcmVhdGVkIHJlZ2V4IGlzIGNhY2hlZFxuICAgIFhSZWdFeHAuY2FjaGUgPSBmdW5jdGlvbiAocGF0dGVybiwgZmxhZ3MpIHtcbiAgICAgICAgdmFyIGtleSA9IHBhdHRlcm4gKyBcIi9cIiArIChmbGFncyB8fCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIFhSZWdFeHAuY2FjaGVba2V5XSB8fCAoWFJlZ0V4cC5jYWNoZVtrZXldID0gWFJlZ0V4cChwYXR0ZXJuLCBmbGFncykpO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgYFJlZ0V4cGAgaW5zdGFuY2U7IHJldHVybnMgYSBjb3B5IHdpdGggdGhlIGAvZ2AgZmxhZyBzZXQuIFRoZSBjb3B5IGhhcyBhIGZyZXNoXG4gICAgLy8gYGxhc3RJbmRleGAgKHNldCB0byB6ZXJvKS4gSWYgeW91IHdhbnQgdG8gY29weSBhIHJlZ2V4IHdpdGhvdXQgZm9yY2luZyB0aGUgYGdsb2JhbGBcbiAgICAvLyBwcm9wZXJ0eSwgdXNlIGBYUmVnRXhwKHJlZ2V4KWAuIERvIG5vdCB1c2UgYFJlZ0V4cChyZWdleClgIGJlY2F1c2UgaXQgd2lsbCBub3QgcHJlc2VydmVcbiAgICAvLyBzcGVjaWFsIHByb3BlcnRpZXMgcmVxdWlyZWQgZm9yIG5hbWVkIGNhcHR1cmVcbiAgICBYUmVnRXhwLmNvcHlBc0dsb2JhbCA9IGZ1bmN0aW9uIChyZWdleCkge1xuICAgICAgICByZXR1cm4gY2xvbmUocmVnZXgsIFwiZ1wiKTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHN0cmluZzsgcmV0dXJucyB0aGUgc3RyaW5nIHdpdGggcmVnZXggbWV0YWNoYXJhY3RlcnMgZXNjYXBlZC4gVGhlIHJldHVybmVkIHN0cmluZ1xuICAgIC8vIGNhbiBzYWZlbHkgYmUgdXNlZCBhdCBhbnkgcG9pbnQgd2l0aGluIGEgcmVnZXggdG8gbWF0Y2ggdGhlIHByb3ZpZGVkIGxpdGVyYWwgc3RyaW5nLiBFc2NhcGVkXG4gICAgLy8gY2hhcmFjdGVycyBhcmUgWyBdIHsgfSAoICkgKiArID8gLSAuICwgXFwgXiAkIHwgIyBhbmQgd2hpdGVzcGFjZVxuICAgIFhSZWdFeHAuZXNjYXBlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1stW1xcXXt9KCkqKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHN0cmluZyB0byBzZWFyY2gsIHJlZ2V4IHRvIHNlYXJjaCB3aXRoLCBwb3NpdGlvbiB0byBzdGFydCB0aGUgc2VhcmNoIHdpdGhpbiB0aGVcbiAgICAvLyBzdHJpbmcgKGRlZmF1bHQ6IDApLCBhbmQgYW4gb3B0aW9uYWwgQm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgbWF0Y2hlcyBtdXN0IHN0YXJ0IGF0LW9yLVxuICAgIC8vIGFmdGVyIHRoZSBwb3NpdGlvbiBvciBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIG9ubHkuIFRoaXMgZnVuY3Rpb24gaWdub3JlcyB0aGUgYGxhc3RJbmRleGBcbiAgICAvLyBvZiB0aGUgcHJvdmlkZWQgcmVnZXggaW4gaXRzIG93biBoYW5kbGluZywgYnV0IHVwZGF0ZXMgdGhlIHByb3BlcnR5IGZvciBjb21wYXRpYmlsaXR5XG4gICAgWFJlZ0V4cC5leGVjQXQgPSBmdW5jdGlvbiAoc3RyLCByZWdleCwgcG9zLCBhbmNob3JlZCkge1xuICAgICAgICB2YXIgcjIgPSBjbG9uZShyZWdleCwgXCJnXCIgKyAoKGFuY2hvcmVkICYmIGhhc05hdGl2ZVkpID8gXCJ5XCIgOiBcIlwiKSksXG4gICAgICAgICAgICBtYXRjaDtcbiAgICAgICAgcjIubGFzdEluZGV4ID0gcG9zID0gcG9zIHx8IDA7XG4gICAgICAgIG1hdGNoID0gcjIuZXhlYyhzdHIpOyAvLyBSdW4gdGhlIGFsdGVyZWQgYGV4ZWNgIChyZXF1aXJlZCBmb3IgYGxhc3RJbmRleGAgZml4LCBldGMuKVxuICAgICAgICBpZiAoYW5jaG9yZWQgJiYgbWF0Y2ggJiYgbWF0Y2guaW5kZXggIT09IHBvcylcbiAgICAgICAgICAgIG1hdGNoID0gbnVsbDtcbiAgICAgICAgaWYgKHJlZ2V4Lmdsb2JhbClcbiAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IG1hdGNoID8gcjIubGFzdEluZGV4IDogMDtcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH07XG5cbiAgICAvLyBCcmVha3MgdGhlIHVucmVzdG9yYWJsZSBsaW5rIHRvIFhSZWdFeHAncyBwcml2YXRlIGxpc3Qgb2YgdG9rZW5zLCB0aGVyZWJ5IHByZXZlbnRpbmdcbiAgICAvLyBzeW50YXggYW5kIGZsYWcgY2hhbmdlcy4gU2hvdWxkIGJlIHJ1biBhZnRlciBYUmVnRXhwIGFuZCBhbnkgcGx1Z2lucyBhcmUgbG9hZGVkXG4gICAgWFJlZ0V4cC5mcmVlemVUb2tlbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFhSZWdFeHAuYWRkVG9rZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImNhbid0IHJ1biBhZGRUb2tlbiBhZnRlciBmcmVlemVUb2tlbnNcIik7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYW55IHZhbHVlOyByZXR1cm5zIGEgQm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEgYFJlZ0V4cGAgb2JqZWN0LlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGlzIGFsc28gYHRydWVgIGZvciByZWdleCBsaXRlcmFscyBhbmQgcmVnZXhlcyBjcmVhdGVkIGJ5IHRoZSBgWFJlZ0V4cGBcbiAgICAvLyBjb25zdHJ1Y3Rvci4gVGhpcyB3b3JrcyBjb3JyZWN0bHkgZm9yIHZhcmlhYmxlcyBjcmVhdGVkIGluIGFub3RoZXIgZnJhbWUsIHdoZW4gYGluc3RhbmNlb2ZgXG4gICAgLy8gYW5kIGBjb25zdHJ1Y3RvcmAgY2hlY2tzIHdvdWxkIGZhaWwgdG8gd29yayBhcyBpbnRlbmRlZFxuICAgIFhSZWdFeHAuaXNSZWdFeHAgPSBmdW5jdGlvbiAobykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pID09PSBcIltvYmplY3QgUmVnRXhwXVwiO1xuICAgIH07XG5cbiAgICAvLyBFeGVjdXRlcyBgY2FsbGJhY2tgIG9uY2UgcGVyIG1hdGNoIHdpdGhpbiBgc3RyYC4gUHJvdmlkZXMgYSBzaW1wbGVyIGFuZCBjbGVhbmVyIHdheSB0b1xuICAgIC8vIGl0ZXJhdGUgb3ZlciByZWdleCBtYXRjaGVzIGNvbXBhcmVkIHRvIHRoZSB0cmFkaXRpb25hbCBhcHByb2FjaGVzIG9mIHN1YnZlcnRpbmdcbiAgICAvLyBgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlYCBvciByZXBlYXRlZGx5IGNhbGxpbmcgYGV4ZWNgIHdpdGhpbiBhIGB3aGlsZWAgbG9vcFxuICAgIFhSZWdFeHAuaXRlcmF0ZSA9IGZ1bmN0aW9uIChzdHIsIHJlZ2V4LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICB2YXIgcjIgPSBjbG9uZShyZWdleCwgXCJnXCIpLFxuICAgICAgICAgICAgaSA9IC0xLCBtYXRjaDtcbiAgICAgICAgd2hpbGUgKG1hdGNoID0gcjIuZXhlYyhzdHIpKSB7IC8vIFJ1biB0aGUgYWx0ZXJlZCBgZXhlY2AgKHJlcXVpcmVkIGZvciBgbGFzdEluZGV4YCBmaXgsIGV0Yy4pXG4gICAgICAgICAgICBpZiAocmVnZXguZ2xvYmFsKVxuICAgICAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IHIyLmxhc3RJbmRleDsgLy8gRG9pbmcgdGhpcyB0byBmb2xsb3cgZXhwZWN0YXRpb25zIGlmIGBsYXN0SW5kZXhgIGlzIGNoZWNrZWQgd2l0aGluIGBjYWxsYmFja2BcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgbWF0Y2gsICsraSwgc3RyLCByZWdleCk7XG4gICAgICAgICAgICBpZiAocjIubGFzdEluZGV4ID09PSBtYXRjaC5pbmRleClcbiAgICAgICAgICAgICAgICByMi5sYXN0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVnZXguZ2xvYmFsKVxuICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHN0cmluZyBhbmQgYW4gYXJyYXkgb2YgcmVnZXhlczsgcmV0dXJucyB0aGUgcmVzdWx0IG9mIHVzaW5nIGVhY2ggc3VjY2Vzc2l2ZSByZWdleFxuICAgIC8vIHRvIHNlYXJjaCB3aXRoaW4gdGhlIG1hdGNoZXMgb2YgdGhlIHByZXZpb3VzIHJlZ2V4LiBUaGUgYXJyYXkgb2YgcmVnZXhlcyBjYW4gYWxzbyBjb250YWluXG4gICAgLy8gb2JqZWN0cyB3aXRoIGByZWdleGAgYW5kIGBiYWNrcmVmYCBwcm9wZXJ0aWVzLCBpbiB3aGljaCBjYXNlIHRoZSBuYW1lZCBvciBudW1iZXJlZCBiYWNrLVxuICAgIC8vIHJlZmVyZW5jZXMgc3BlY2lmaWVkIGFyZSBwYXNzZWQgZm9yd2FyZCB0byB0aGUgbmV4dCByZWdleCBvciByZXR1cm5lZC4gRS5nLjpcbiAgICAvLyB2YXIgeHJlZ2V4cEltZ0ZpbGVOYW1lcyA9IFhSZWdFeHAubWF0Y2hDaGFpbihodG1sLCBbXG4gICAgLy8gICAgIHtyZWdleDogLzxpbWdcXGIoW14+XSspPi9pLCBiYWNrcmVmOiAxfSwgLy8gPGltZz4gdGFnIGF0dHJpYnV0ZXNcbiAgICAvLyAgICAge3JlZ2V4OiBYUmVnRXhwKCcoP2l4KSBcXFxccyBzcmM9XCIgKD88c3JjPiBbXlwiXSsgKScpLCBiYWNrcmVmOiBcInNyY1wifSwgLy8gc3JjIGF0dHJpYnV0ZSB2YWx1ZXNcbiAgICAvLyAgICAge3JlZ2V4OiBYUmVnRXhwKFwiXmh0dHA6Ly94cmVnZXhwXFxcXC5jb20oL1teIz9dKylcIiwgXCJpXCIpLCBiYWNrcmVmOiAxfSwgLy8geHJlZ2V4cC5jb20gcGF0aHNcbiAgICAvLyAgICAgL1teXFwvXSskLyAvLyBmaWxlbmFtZXMgKHN0cmlwIGRpcmVjdG9yeSBwYXRocylcbiAgICAvLyBdKTtcbiAgICBYUmVnRXhwLm1hdGNoQ2hhaW4gPSBmdW5jdGlvbiAoc3RyLCBjaGFpbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcmVjdXJzZUNoYWluICh2YWx1ZXMsIGxldmVsKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGNoYWluW2xldmVsXS5yZWdleCA/IGNoYWluW2xldmVsXSA6IHtyZWdleDogY2hhaW5bbGV2ZWxdfSxcbiAgICAgICAgICAgICAgICByZWdleCA9IGNsb25lKGl0ZW0ucmVnZXgsIFwiZ1wiKSxcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gW10sIGk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgWFJlZ0V4cC5pdGVyYXRlKHZhbHVlc1tpXSwgcmVnZXgsIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goaXRlbS5iYWNrcmVmID8gKG1hdGNoW2l0ZW0uYmFja3JlZl0gfHwgXCJcIikgOiBtYXRjaFswXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKChsZXZlbCA9PT0gY2hhaW4ubGVuZ3RoIC0gMSkgfHwgIW1hdGNoZXMubGVuZ3RoKSA/XG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA6IHJlY3Vyc2VDaGFpbihtYXRjaGVzLCBsZXZlbCArIDEpO1xuICAgICAgICB9KFtzdHJdLCAwKTtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBOZXcgUmVnRXhwIHByb3RvdHlwZSBtZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEFjY2VwdHMgYSBjb250ZXh0IG9iamVjdCBhbmQgYXJndW1lbnRzIGFycmF5OyByZXR1cm5zIHRoZSByZXN1bHQgb2YgY2FsbGluZyBgZXhlY2Agd2l0aCB0aGVcbiAgICAvLyBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJndW1lbnRzIGFycmF5LiB0aGUgY29udGV4dCBpcyBpZ25vcmVkIGJ1dCBpcyBhY2NlcHRlZCBmb3IgY29uZ3J1aXR5XG4gICAgLy8gd2l0aCBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YFxuICAgIFJlZ0V4cC5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbiAoY29udGV4dCwgYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy5leGVjKGFyZ3NbMF0pO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgY29udGV4dCBvYmplY3QgYW5kIHN0cmluZzsgcmV0dXJucyB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgYGV4ZWNgIHdpdGggdGhlIHByb3ZpZGVkXG4gICAgLy8gc3RyaW5nLiB0aGUgY29udGV4dCBpcyBpZ25vcmVkIGJ1dCBpcyBhY2NlcHRlZCBmb3IgY29uZ3J1aXR5IHdpdGggYEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsYFxuICAgIFJlZ0V4cC5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uIChjb250ZXh0LCBzdHIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlYyhzdHIpO1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIE92ZXJyaWRlbiBuYXRpdmUgbWV0aG9kc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBBZGRzIG5hbWVkIGNhcHR1cmUgc3VwcG9ydCAod2l0aCBiYWNrcmVmZXJlbmNlcyByZXR1cm5lZCBhcyBgcmVzdWx0Lm5hbWVgKSwgYW5kIGZpeGVzIHR3b1xuICAgIC8vIGNyb3NzLWJyb3dzZXIgaXNzdWVzIHBlciBFUzM6XG4gICAgLy8gLSBDYXB0dXJlZCB2YWx1ZXMgZm9yIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3VwcyBzaG91bGQgYmUgcmV0dXJuZWQgYXMgYHVuZGVmaW5lZGAsXG4gICAgLy8gICByYXRoZXIgdGhhbiB0aGUgZW1wdHkgc3RyaW5nLlxuICAgIC8vIC0gYGxhc3RJbmRleGAgc2hvdWxkIG5vdCBiZSBpbmNyZW1lbnRlZCBhZnRlciB6ZXJvLWxlbmd0aCBtYXRjaGVzLlxuICAgIFJlZ0V4cC5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgdmFyIG1hdGNoLCBuYW1lLCByMiwgb3JpZ0xhc3RJbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLmdsb2JhbClcbiAgICAgICAgICAgIG9yaWdMYXN0SW5kZXggPSB0aGlzLmxhc3RJbmRleDtcbiAgICAgICAgbWF0Y2ggPSBuYXRpdi5leGVjLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gRml4IGJyb3dzZXJzIHdob3NlIGBleGVjYCBtZXRob2RzIGRvbid0IGNvbnNpc3RlbnRseSByZXR1cm4gYHVuZGVmaW5lZGAgZm9yXG4gICAgICAgICAgICAvLyBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cHNcbiAgICAgICAgICAgIGlmICghY29tcGxpYW50RXhlY05wY2cgJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBpbmRleE9mKG1hdGNoLCBcIlwiKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcjIgPSBSZWdFeHAodGhpcy5zb3VyY2UsIG5hdGl2LnJlcGxhY2UuY2FsbChnZXROYXRpdmVGbGFncyh0aGlzKSwgXCJnXCIsIFwiXCIpKTtcbiAgICAgICAgICAgICAgICAvLyBVc2luZyBgc3RyLnNsaWNlKG1hdGNoLmluZGV4KWAgcmF0aGVyIHRoYW4gYG1hdGNoWzBdYCBpbiBjYXNlIGxvb2thaGVhZCBhbGxvd2VkXG4gICAgICAgICAgICAgICAgLy8gbWF0Y2hpbmcgZHVlIHRvIGNoYXJhY3RlcnMgb3V0c2lkZSB0aGUgbWF0Y2hcbiAgICAgICAgICAgICAgICBuYXRpdi5yZXBsYWNlLmNhbGwoKHN0ciArIFwiXCIpLnNsaWNlKG1hdGNoLmluZGV4KSwgcjIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEF0dGFjaCBuYW1lZCBjYXB0dXJlIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlmICh0aGlzLl94cmVnZXhwICYmIHRoaXMuX3hyZWdleHAuY2FwdHVyZU5hbWVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBtYXRjaC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdGhpcy5feHJlZ2V4cC5jYXB0dXJlTmFtZXNbaSAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbbmFtZV0gPSBtYXRjaFtpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGaXggYnJvd3NlcnMgdGhhdCBpbmNyZW1lbnQgYGxhc3RJbmRleGAgYWZ0ZXIgemVyby1sZW5ndGggbWF0Y2hlc1xuICAgICAgICAgICAgaWYgKCFjb21wbGlhbnRMYXN0SW5kZXhJbmNyZW1lbnQgJiYgdGhpcy5nbG9iYWwgJiYgIW1hdGNoWzBdLmxlbmd0aCAmJiAodGhpcy5sYXN0SW5kZXggPiBtYXRjaC5pbmRleCkpXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4OyAvLyBGaXggSUUsIE9wZXJhIGJ1ZyAobGFzdCB0ZXN0ZWQgSUUgOS4wLjUsIE9wZXJhIDExLjYxIG9uIFdpbmRvd3MpXG4gICAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9O1xuXG4gICAgLy8gRml4IGJyb3dzZXIgYnVncyBpbiBuYXRpdmUgbWV0aG9kXG4gICAgUmVnRXhwLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAvLyBVc2UgdGhlIG5hdGl2ZSBgZXhlY2AgdG8gc2tpcCBzb21lIHByb2Nlc3Npbmcgb3ZlcmhlYWQsIGV2ZW4gdGhvdWdoIHRoZSBhbHRlcmVkXG4gICAgICAgIC8vIGBleGVjYCB3b3VsZCB0YWtlIGNhcmUgb2YgdGhlIGBsYXN0SW5kZXhgIGZpeGVzXG4gICAgICAgIHZhciBtYXRjaCwgb3JpZ0xhc3RJbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLmdsb2JhbClcbiAgICAgICAgICAgIG9yaWdMYXN0SW5kZXggPSB0aGlzLmxhc3RJbmRleDtcbiAgICAgICAgbWF0Y2ggPSBuYXRpdi5leGVjLmNhbGwodGhpcywgc3RyKTtcbiAgICAgICAgLy8gRml4IGJyb3dzZXJzIHRoYXQgaW5jcmVtZW50IGBsYXN0SW5kZXhgIGFmdGVyIHplcm8tbGVuZ3RoIG1hdGNoZXNcbiAgICAgICAgaWYgKG1hdGNoICYmICFjb21wbGlhbnRMYXN0SW5kZXhJbmNyZW1lbnQgJiYgdGhpcy5nbG9iYWwgJiYgIW1hdGNoWzBdLmxlbmd0aCAmJiAodGhpcy5sYXN0SW5kZXggPiBtYXRjaC5pbmRleCkpXG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleC0tO1xuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4OyAvLyBGaXggSUUsIE9wZXJhIGJ1ZyAobGFzdCB0ZXN0ZWQgSUUgOS4wLjUsIE9wZXJhIDExLjYxIG9uIFdpbmRvd3MpXG4gICAgICAgIHJldHVybiAhIW1hdGNoO1xuICAgIH07XG5cbiAgICAvLyBBZGRzIG5hbWVkIGNhcHR1cmUgc3VwcG9ydCBhbmQgZml4ZXMgYnJvd3NlciBidWdzIGluIG5hdGl2ZSBtZXRob2RcbiAgICBTdHJpbmcucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24gKHJlZ2V4KSB7XG4gICAgICAgIGlmICghWFJlZ0V4cC5pc1JlZ0V4cChyZWdleCkpXG4gICAgICAgICAgICByZWdleCA9IFJlZ0V4cChyZWdleCk7IC8vIE5hdGl2ZSBgUmVnRXhwYFxuICAgICAgICBpZiAocmVnZXguZ2xvYmFsKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmF0aXYubWF0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IDA7IC8vIEZpeCBJRSBidWdcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZ2V4LmV4ZWModGhpcyk7IC8vIFJ1biB0aGUgYWx0ZXJlZCBgZXhlY2BcbiAgICB9O1xuXG4gICAgLy8gQWRkcyBzdXBwb3J0IGZvciBgJHtufWAgdG9rZW5zIGZvciBuYW1lZCBhbmQgbnVtYmVyZWQgYmFja3JlZmVyZW5jZXMgaW4gcmVwbGFjZW1lbnQgdGV4dCxcbiAgICAvLyBhbmQgcHJvdmlkZXMgbmFtZWQgYmFja3JlZmVyZW5jZXMgdG8gcmVwbGFjZW1lbnQgZnVuY3Rpb25zIGFzIGBhcmd1bWVudHNbMF0ubmFtZWAuIEFsc29cbiAgICAvLyBmaXhlcyBjcm9zcy1icm93c2VyIGRpZmZlcmVuY2VzIGluIHJlcGxhY2VtZW50IHRleHQgc3ludGF4IHdoZW4gcGVyZm9ybWluZyBhIHJlcGxhY2VtZW50XG4gICAgLy8gdXNpbmcgYSBub25yZWdleCBzZWFyY2ggdmFsdWUsIGFuZCB0aGUgdmFsdWUgb2YgcmVwbGFjZW1lbnQgcmVnZXhlcycgYGxhc3RJbmRleGAgcHJvcGVydHlcbiAgICAvLyBkdXJpbmcgcmVwbGFjZW1lbnQgaXRlcmF0aW9ucy4gTm90ZSB0aGF0IHRoaXMgZG9lc24ndCBzdXBwb3J0IFNwaWRlck1vbmtleSdzIHByb3ByaWV0YXJ5XG4gICAgLy8gdGhpcmQgKGBmbGFnc2ApIHBhcmFtZXRlclxuICAgIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIChzZWFyY2gsIHJlcGxhY2VtZW50KSB7XG4gICAgICAgIHZhciBpc1JlZ2V4ID0gWFJlZ0V4cC5pc1JlZ0V4cChzZWFyY2gpLFxuICAgICAgICAgICAgY2FwdHVyZU5hbWVzLCByZXN1bHQsIHN0ciwgb3JpZ0xhc3RJbmRleDtcblxuICAgICAgICAvLyBUaGVyZSBhcmUgdG9vIG1hbnkgY29tYmluYXRpb25zIG9mIHNlYXJjaC9yZXBsYWNlbWVudCB0eXBlcy92YWx1ZXMgYW5kIGJyb3dzZXIgYnVncyB0aGF0XG4gICAgICAgIC8vIHByZWNsdWRlIHBhc3NpbmcgdG8gbmF0aXZlIGByZXBsYWNlYCwgc28gZG9uJ3QgdHJ5XG4gICAgICAgIC8vaWYgKC4uLilcbiAgICAgICAgLy8gICAgcmV0dXJuIG5hdGl2LnJlcGxhY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICBpZiAoaXNSZWdleCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaC5feHJlZ2V4cClcbiAgICAgICAgICAgICAgICBjYXB0dXJlTmFtZXMgPSBzZWFyY2guX3hyZWdleHAuY2FwdHVyZU5hbWVzOyAvLyBBcnJheSBvciBgbnVsbGBcbiAgICAgICAgICAgIGlmICghc2VhcmNoLmdsb2JhbClcbiAgICAgICAgICAgICAgICBvcmlnTGFzdEluZGV4ID0gc2VhcmNoLmxhc3RJbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlYXJjaCA9IHNlYXJjaCArIFwiXCI7IC8vIFR5cGUgY29udmVyc2lvblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZXBsYWNlbWVudCkgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIikge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmF0aXYucmVwbGFjZS5jYWxsKHRoaXMgKyBcIlwiLCBzZWFyY2gsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FwdHVyZU5hbWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoYW5nZSB0aGUgYGFyZ3VtZW50c1swXWAgc3RyaW5nIHByaW1pdGl2ZSB0byBhIFN0cmluZyBvYmplY3Qgd2hpY2ggY2FuIHN0b3JlIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3IFN0cmluZyhhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSBuYW1lZCBiYWNrcmVmZXJlbmNlcyBvbiBgYXJndW1lbnRzWzBdYFxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcHR1cmVOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhcHR1cmVOYW1lc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1bY2FwdHVyZU5hbWVzW2ldXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGBsYXN0SW5kZXhgIGJlZm9yZSBjYWxsaW5nIGByZXBsYWNlbWVudGAgKGZpeCBicm93c2VycylcbiAgICAgICAgICAgICAgICBpZiAoaXNSZWdleCAmJiBzZWFyY2guZ2xvYmFsKVxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gubGFzdEluZGV4ID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAyXSArIGFyZ3VtZW50c1swXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VtZW50LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IHRoaXMgKyBcIlwiOyAvLyBUeXBlIGNvbnZlcnNpb24sIHNvIGBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1gIHdpbGwgYmUgYSBzdHJpbmcgKGdpdmVuIG5vbnN0cmluZyBgdGhpc2ApXG4gICAgICAgICAgICByZXN1bHQgPSBuYXRpdi5yZXBsYWNlLmNhbGwoc3RyLCBzZWFyY2gsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50czsgLy8gS2VlcCB0aGlzIGZ1bmN0aW9uJ3MgYGFyZ3VtZW50c2AgYXZhaWxhYmxlIHRocm91Z2ggY2xvc3VyZVxuICAgICAgICAgICAgICAgIHJldHVybiBuYXRpdi5yZXBsYWNlLmNhbGwocmVwbGFjZW1lbnQgKyBcIlwiLCByZXBsYWNlbWVudFRva2VuLCBmdW5jdGlvbiAoJDAsICQxLCAkMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBOdW1iZXJlZCBiYWNrcmVmZXJlbmNlICh3aXRob3V0IGRlbGltaXRlcnMpIG9yIHNwZWNpYWwgdmFyaWFibGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKCQxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIiRcIjogcmV0dXJuIFwiJFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCImXCI6IHJldHVybiBhcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJgXCI6IHJldHVybiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0uc2xpY2UoMCwgYXJnc1thcmdzLmxlbmd0aCAtIDJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiJ1wiOiByZXR1cm4gYXJnc1thcmdzLmxlbmd0aCAtIDFdLnNsaWNlKGFyZ3NbYXJncy5sZW5ndGggLSAyXSArIGFyZ3NbMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOdW1iZXJlZCBiYWNrcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2hhdCBkb2VzIFwiJDEwXCIgbWVhbj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlIDEwLCBpZiAxMCBvciBtb3JlIGNhcHR1cmluZyBncm91cHMgZXhpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlIDEgZm9sbG93ZWQgYnkgXCIwXCIsIGlmIDEtOSBjYXB0dXJpbmcgZ3JvdXBzIGV4aXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gT3RoZXJ3aXNlLCBpdCdzIHRoZSBzdHJpbmcgXCIkMTBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIG5vdGU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gQmFja3JlZmVyZW5jZXMgY2Fubm90IGJlIG1vcmUgdGhhbiB0d28gZGlnaXRzIChlbmZvcmNlZCBieSBgcmVwbGFjZW1lbnRUb2tlbmApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gXCIkMDFcIiBpcyBlcXVpdmFsZW50IHRvIFwiJDFcIiBpZiBhIGNhcHR1cmluZyBncm91cCBleGlzdHMsIG90aGVyd2lzZSBpdCdzIHRoZSBzdHJpbmcgXCIkMDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIFRoZXJlIGlzIG5vIFwiJDBcIiB0b2tlbiAoXCIkJlwiIGlzIHRoZSBlbnRpcmUgbWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXRlcmFsTnVtYmVycyA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQxID0gKyQxOyAvLyBUeXBlIGNvbnZlcnNpb247IGRyb3AgbGVhZGluZyB6ZXJvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghJDEpIC8vIGAkMWAgd2FzIFwiMFwiIG9yIFwiMDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoJDEgPiBhcmdzLmxlbmd0aCAtIDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdGVyYWxOdW1iZXJzID0gU3RyaW5nLnByb3RvdHlwZS5zbGljZS5jYWxsKCQxLCAtMSkgKyBsaXRlcmFsTnVtYmVycztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQxID0gTWF0aC5mbG9vcigkMSAvIDEwKTsgLy8gRHJvcCB0aGUgbGFzdCBkaWdpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJDEgPyBhcmdzWyQxXSB8fCBcIlwiIDogXCIkXCIpICsgbGl0ZXJhbE51bWJlcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIE5hbWVkIGJhY2tyZWZlcmVuY2Ugb3IgZGVsaW1pdGVkIG51bWJlcmVkIGJhY2tyZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdoYXQgZG9lcyBcIiR7bn1cIiBtZWFuP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlIHRvIG51bWJlcmVkIGNhcHR1cmUgbi4gVHdvIGRpZmZlcmVuY2VzIGZyb20gXCIkblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAtIG4gY2FuIGJlIG1vcmUgdGhhbiB0d28gZGlnaXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgIC0gQmFja3JlZmVyZW5jZSAwIGlzIGFsbG93ZWQsIGFuZCBpcyB0aGUgZW50aXJlIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgdG8gbmFtZWQgY2FwdHVyZSBuLCBpZiBpdCBleGlzdHMgYW5kIGlzIG5vdCBhIG51bWJlciBvdmVycmlkZGVuIGJ5IG51bWJlcmVkIGNhcHR1cmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gT3RoZXJ3aXNlLCBpdCdzIHRoZSBzdHJpbmcgXCIke259XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuID0gKyQyOyAvLyBUeXBlIGNvbnZlcnNpb247IGRyb3AgbGVhZGluZyB6ZXJvc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4gPD0gYXJncy5sZW5ndGggLSAzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmdzW25dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IGNhcHR1cmVOYW1lcyA/IGluZGV4T2YoY2FwdHVyZU5hbWVzLCAkMikgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuID4gLTEgPyBhcmdzW24gKyAxXSA6ICQwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1JlZ2V4KSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoLmdsb2JhbClcbiAgICAgICAgICAgICAgICBzZWFyY2gubGFzdEluZGV4ID0gMDsgLy8gRml4IElFLCBTYWZhcmkgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgU2FmYXJpIDUuMS4yIG9uIFdpbmRvd3MpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VhcmNoLmxhc3RJbmRleCA9IG9yaWdMYXN0SW5kZXg7IC8vIEZpeCBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgT3BlcmEgMTEuNjEgb24gV2luZG93cylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8vIEEgY29uc2lzdGVudCBjcm9zcy1icm93c2VyLCBFUzMgY29tcGxpYW50IGBzcGxpdGBcbiAgICBTdHJpbmcucHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gKHMgLyogc2VwYXJhdG9yICovLCBsaW1pdCkge1xuICAgICAgICAvLyBJZiBzZXBhcmF0b3IgYHNgIGlzIG5vdCBhIHJlZ2V4LCB1c2UgdGhlIG5hdGl2ZSBgc3BsaXRgXG4gICAgICAgIGlmICghWFJlZ0V4cC5pc1JlZ0V4cChzKSlcbiAgICAgICAgICAgIHJldHVybiBuYXRpdi5zcGxpdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHZhciBzdHIgPSB0aGlzICsgXCJcIiwgLy8gVHlwZSBjb252ZXJzaW9uXG4gICAgICAgICAgICBvdXRwdXQgPSBbXSxcbiAgICAgICAgICAgIGxhc3RMYXN0SW5kZXggPSAwLFxuICAgICAgICAgICAgbWF0Y2gsIGxhc3RMZW5ndGg7XG5cbiAgICAgICAgLy8gQmVoYXZpb3IgZm9yIGBsaW1pdGA6IGlmIGl0J3MuLi5cbiAgICAgICAgLy8gLSBgdW5kZWZpbmVkYDogTm8gbGltaXRcbiAgICAgICAgLy8gLSBgTmFOYCBvciB6ZXJvOiBSZXR1cm4gYW4gZW1wdHkgYXJyYXlcbiAgICAgICAgLy8gLSBBIHBvc2l0aXZlIG51bWJlcjogVXNlIGBNYXRoLmZsb29yKGxpbWl0KWBcbiAgICAgICAgLy8gLSBBIG5lZ2F0aXZlIG51bWJlcjogTm8gbGltaXRcbiAgICAgICAgLy8gLSBPdGhlcjogVHlwZS1jb252ZXJ0LCB0aGVuIHVzZSB0aGUgYWJvdmUgcnVsZXNcbiAgICAgICAgaWYgKGxpbWl0ID09PSB1bmRlZmluZWQgfHwgK2xpbWl0IDwgMCkge1xuICAgICAgICAgICAgbGltaXQgPSBJbmZpbml0eTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbWl0ID0gTWF0aC5mbG9vcigrbGltaXQpO1xuICAgICAgICAgICAgaWYgKCFsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIGlmIG5vdCBgcy5nbG9iYWxgLCBhbmQgaXQgYXZvaWRzIG5lZWRpbmcgdG8gc2V0IGBzLmxhc3RJbmRleGAgdG8gemVyb1xuICAgICAgICAvLyBhbmQgcmVzdG9yZSBpdCB0byBpdHMgb3JpZ2luYWwgdmFsdWUgd2hlbiB3ZSdyZSBkb25lIHVzaW5nIHRoZSByZWdleFxuICAgICAgICBzID0gWFJlZ0V4cC5jb3B5QXNHbG9iYWwocyk7XG5cbiAgICAgICAgd2hpbGUgKG1hdGNoID0gcy5leGVjKHN0cikpIHsgLy8gUnVuIHRoZSBhbHRlcmVkIGBleGVjYCAocmVxdWlyZWQgZm9yIGBsYXN0SW5kZXhgIGZpeCwgZXRjLilcbiAgICAgICAgICAgIGlmIChzLmxhc3RJbmRleCA+IGxhc3RMYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChzdHIuc2xpY2UobGFzdExhc3RJbmRleCwgbWF0Y2guaW5kZXgpKTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoLmluZGV4IDwgc3RyLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkob3V0cHV0LCBtYXRjaC5zbGljZSgxKSk7XG5cbiAgICAgICAgICAgICAgICBsYXN0TGVuZ3RoID0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxhc3RMYXN0SW5kZXggPSBzLmxhc3RJbmRleDtcblxuICAgICAgICAgICAgICAgIGlmIChvdXRwdXQubGVuZ3RoID49IGxpbWl0KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHMubGFzdEluZGV4ID09PSBtYXRjaC5pbmRleClcbiAgICAgICAgICAgICAgICBzLmxhc3RJbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxhc3RMYXN0SW5kZXggPT09IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghbmF0aXYudGVzdC5jYWxsKHMsIFwiXCIpIHx8IGxhc3RMZW5ndGgpXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChzdHIuc2xpY2UobGFzdExhc3RJbmRleCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dC5sZW5ndGggPiBsaW1pdCA/IG91dHB1dC5zbGljZSgwLCBsaW1pdCkgOiBvdXRwdXQ7XG4gICAgfTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgUHJpdmF0ZSBoZWxwZXIgZnVuY3Rpb25zXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIFN1cHBvcnRpbmcgZnVuY3Rpb24gZm9yIGBYUmVnRXhwYCwgYFhSZWdFeHAuY29weUFzR2xvYmFsYCwgZXRjLiBSZXR1cm5zIGEgY29weSBvZiBhIGBSZWdFeHBgXG4gICAgLy8gaW5zdGFuY2Ugd2l0aCBhIGZyZXNoIGBsYXN0SW5kZXhgIChzZXQgdG8gemVybyksIHByZXNlcnZpbmcgcHJvcGVydGllcyByZXF1aXJlZCBmb3IgbmFtZWRcbiAgICAvLyBjYXB0dXJlLiBBbHNvIGFsbG93cyBhZGRpbmcgbmV3IGZsYWdzIGluIHRoZSBwcm9jZXNzIG9mIGNvcHlpbmcgdGhlIHJlZ2V4XG4gICAgZnVuY3Rpb24gY2xvbmUgKHJlZ2V4LCBhZGRpdGlvbmFsRmxhZ3MpIHtcbiAgICAgICAgaWYgKCFYUmVnRXhwLmlzUmVnRXhwKHJlZ2V4KSlcbiAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcihcInR5cGUgUmVnRXhwIGV4cGVjdGVkXCIpO1xuICAgICAgICB2YXIgeCA9IHJlZ2V4Ll94cmVnZXhwO1xuICAgICAgICByZWdleCA9IFhSZWdFeHAocmVnZXguc291cmNlLCBnZXROYXRpdmVGbGFncyhyZWdleCkgKyAoYWRkaXRpb25hbEZsYWdzIHx8IFwiXCIpKTtcbiAgICAgICAgaWYgKHgpIHtcbiAgICAgICAgICAgIHJlZ2V4Ll94cmVnZXhwID0ge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogeC5zb3VyY2UsXG4gICAgICAgICAgICAgICAgY2FwdHVyZU5hbWVzOiB4LmNhcHR1cmVOYW1lcyA/IHguY2FwdHVyZU5hbWVzLnNsaWNlKDApIDogbnVsbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVnZXg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TmF0aXZlRmxhZ3MgKHJlZ2V4KSB7XG4gICAgICAgIHJldHVybiAocmVnZXguZ2xvYmFsICAgICA/IFwiZ1wiIDogXCJcIikgK1xuICAgICAgICAgICAgICAgKHJlZ2V4Lmlnbm9yZUNhc2UgPyBcImlcIiA6IFwiXCIpICtcbiAgICAgICAgICAgICAgIChyZWdleC5tdWx0aWxpbmUgID8gXCJtXCIgOiBcIlwiKSArXG4gICAgICAgICAgICAgICAocmVnZXguZXh0ZW5kZWQgICA/IFwieFwiIDogXCJcIikgKyAvLyBQcm9wb3NlZCBmb3IgRVM0OyBpbmNsdWRlZCBpbiBBUzNcbiAgICAgICAgICAgICAgIChyZWdleC5zdGlja3kgICAgID8gXCJ5XCIgOiBcIlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBydW5Ub2tlbnMgKHBhdHRlcm4sIGluZGV4LCBzY29wZSwgY29udGV4dCkge1xuICAgICAgICB2YXIgaSA9IHRva2Vucy5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQsIG1hdGNoLCB0O1xuICAgICAgICAvLyBQcm90ZWN0IGFnYWluc3QgY29uc3RydWN0aW5nIFhSZWdFeHBzIHdpdGhpbiB0b2tlbiBoYW5kbGVyIGFuZCB0cmlnZ2VyIGZ1bmN0aW9uc1xuICAgICAgICBpc0luc2lkZUNvbnN0cnVjdG9yID0gdHJ1ZTtcbiAgICAgICAgLy8gTXVzdCByZXNldCBgaXNJbnNpZGVDb25zdHJ1Y3RvcmAsIGV2ZW4gaWYgYSBgdHJpZ2dlcmAgb3IgYGhhbmRsZXJgIHRocm93c1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKGktLSkgeyAvLyBSdW4gaW4gcmV2ZXJzZSBvcmRlclxuICAgICAgICAgICAgICAgIHQgPSB0b2tlbnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKChzY29wZSAmIHQuc2NvcGUpICYmICghdC50cmlnZ2VyIHx8IHQudHJpZ2dlci5jYWxsKGNvbnRleHQpKSkge1xuICAgICAgICAgICAgICAgICAgICB0LnBhdHRlcm4ubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gdC5wYXR0ZXJuLmV4ZWMocGF0dGVybik7IC8vIFJ1bm5pbmcgdGhlIGFsdGVyZWQgYGV4ZWNgIGhlcmUgYWxsb3dzIHVzZSBvZiBuYW1lZCBiYWNrcmVmZXJlbmNlcywgZXRjLlxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2guaW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiB0LmhhbmRsZXIuY2FsbChjb250ZXh0LCBtYXRjaCwgc2NvcGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluZGV4T2YgKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgICAgIGlmIChBcnJheS5wcm90b3R5cGUuaW5kZXhPZikgLy8gVXNlIHRoZSBuYXRpdmUgYXJyYXkgbWV0aG9kIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgZnJvbSk7XG4gICAgICAgIGZvciAodmFyIGkgPSBmcm9tIHx8IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKVxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIEJ1aWx0LWluIHRva2Vuc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBBdWdtZW50IFhSZWdFeHAncyByZWd1bGFyIGV4cHJlc3Npb24gc3ludGF4IGFuZCBmbGFncy4gTm90ZSB0aGF0IHdoZW4gYWRkaW5nIHRva2VucywgdGhlXG4gICAgLy8gdGhpcmQgKGBzY29wZWApIGFyZ3VtZW50IGRlZmF1bHRzIHRvIGBYUmVnRXhwLk9VVFNJREVfQ0xBU1NgXG5cbiAgICAvLyBDb21tZW50IHBhdHRlcm46ICg/IyApXG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcKFxcPyNbXildKlxcKS8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gS2VlcCB0b2tlbnMgc2VwYXJhdGVkIHVubGVzcyB0aGUgZm9sbG93aW5nIHRva2VuIGlzIGEgcXVhbnRpZmllclxuICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnRlc3QuY2FsbChxdWFudGlmaWVyLCBtYXRjaC5pbnB1dC5zbGljZShtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkpID8gXCJcIiA6IFwiKD86KVwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIENhcHR1cmluZyBncm91cCAobWF0Y2ggdGhlIG9wZW5pbmcgcGFyZW50aGVzaXMgb25seSkuXG4gICAgLy8gUmVxdWlyZWQgZm9yIHN1cHBvcnQgb2YgbmFtZWQgY2FwdHVyaW5nIGdyb3Vwc1xuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXCgoPyFcXD8pLyxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jYXB0dXJlTmFtZXMucHVzaChudWxsKTtcbiAgICAgICAgICAgIHJldHVybiBcIihcIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBOYW1lZCBjYXB0dXJpbmcgZ3JvdXAgKG1hdGNoIHRoZSBvcGVuaW5nIGRlbGltaXRlciBvbmx5KTogKD88bmFtZT5cbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFwoXFw/PChbJFxcd10rKT4vLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuY2FwdHVyZU5hbWVzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgICAgICAgdGhpcy5oYXNOYW1lZENhcHR1cmUgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIFwiKFwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIE5hbWVkIGJhY2tyZWZlcmVuY2U6IFxcazxuYW1lPlxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXFxcazwoW1xcdyRdKyk+LyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMuY2FwdHVyZU5hbWVzLCBtYXRjaFsxXSk7XG4gICAgICAgICAgICAvLyBLZWVwIGJhY2tyZWZlcmVuY2VzIHNlcGFyYXRlIGZyb20gc3Vic2VxdWVudCBsaXRlcmFsIG51bWJlcnMuIFByZXNlcnZlIGJhY2stXG4gICAgICAgICAgICAvLyByZWZlcmVuY2VzIHRvIG5hbWVkIGdyb3VwcyB0aGF0IGFyZSB1bmRlZmluZWQgYXQgdGhpcyBwb2ludCBhcyBsaXRlcmFsIHN0cmluZ3NcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA+IC0xID9cbiAgICAgICAgICAgICAgICBcIlxcXFxcIiArIChpbmRleCArIDEpICsgKGlzTmFOKG1hdGNoLmlucHV0LmNoYXJBdChtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkpID8gXCJcIiA6IFwiKD86KVwiKSA6XG4gICAgICAgICAgICAgICAgbWF0Y2hbMF07XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gRW1wdHkgY2hhcmFjdGVyIGNsYXNzOiBbXSBvciBbXl1cbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFxbXFxeP10vLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIC8vIEZvciBjcm9zcy1icm93c2VyIGNvbXBhdGliaWxpdHkgd2l0aCBFUzMsIGNvbnZlcnQgW10gdG8gXFxiXFxCIGFuZCBbXl0gdG8gW1xcc1xcU10uXG4gICAgICAgICAgICAvLyAoPyEpIHNob3VsZCB3b3JrIGxpa2UgXFxiXFxCLCBidXQgaXMgdW5yZWxpYWJsZSBpbiBGaXJlZm94XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hbMF0gPT09IFwiW11cIiA/IFwiXFxcXGJcXFxcQlwiIDogXCJbXFxcXHNcXFxcU11cIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBNb2RlIG1vZGlmaWVyIGF0IHRoZSBzdGFydCBvZiB0aGUgcGF0dGVybiBvbmx5LCB3aXRoIGFueSBjb21iaW5hdGlvbiBvZiBmbGFncyBpbXN4OiAoP2ltc3gpXG4gICAgLy8gRG9lcyBub3Qgc3VwcG9ydCB4KD9pKSwgKD8taSksICg/aS1tKSwgKD9pOiApLCAoP2kpKD9tKSwgZXRjLlxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9eXFwoXFw/KFtpbXN4XSspXFwpLyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICB0aGlzLnNldEZsYWcobWF0Y2hbMV0pO1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gV2hpdGVzcGFjZSBhbmQgY29tbWVudHMsIGluIGZyZWUtc3BhY2luZyAoYWthIGV4dGVuZGVkKSBtb2RlIG9ubHlcbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvKD86XFxzK3wjLiopKy8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gS2VlcCB0b2tlbnMgc2VwYXJhdGVkIHVubGVzcyB0aGUgZm9sbG93aW5nIHRva2VuIGlzIGEgcXVhbnRpZmllclxuICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnRlc3QuY2FsbChxdWFudGlmaWVyLCBtYXRjaC5pbnB1dC5zbGljZShtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkpID8gXCJcIiA6IFwiKD86KVwiO1xuICAgICAgICB9LFxuICAgICAgICBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gdGhpcy5oYXNGbGFnKFwieFwiKTt9XG4gICAgKTtcblxuICAgIC8vIERvdCwgaW4gZG90YWxsIChha2Egc2luZ2xlbGluZSkgbW9kZSBvbmx5XG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcLi8sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gXCJbXFxcXHNcXFxcU11cIjt9LFxuICAgICAgICBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gdGhpcy5oYXNGbGFnKFwic1wiKTt9XG4gICAgKTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgQmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBVbmNvbW1lbnQgdGhlIGZvbGxvd2luZyBibG9jayBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFhSZWdFeHAgMS4wLTEuMjpcbiAgICAvKlxuICAgIFhSZWdFeHAubWF0Y2hXaXRoaW5DaGFpbiA9IFhSZWdFeHAubWF0Y2hDaGFpbjtcbiAgICBSZWdFeHAucHJvdG90eXBlLmFkZEZsYWdzID0gZnVuY3Rpb24gKHMpIHtyZXR1cm4gY2xvbmUodGhpcywgcyk7fTtcbiAgICBSZWdFeHAucHJvdG90eXBlLmV4ZWNBbGwgPSBmdW5jdGlvbiAocykge3ZhciByID0gW107IFhSZWdFeHAuaXRlcmF0ZShzLCB0aGlzLCBmdW5jdGlvbiAobSkge3IucHVzaChtKTt9KTsgcmV0dXJuIHI7fTtcbiAgICBSZWdFeHAucHJvdG90eXBlLmZvckVhY2hFeGVjID0gZnVuY3Rpb24gKHMsIGYsIGMpIHtyZXR1cm4gWFJlZ0V4cC5pdGVyYXRlKHMsIHRoaXMsIGYsIGMpO307XG4gICAgUmVnRXhwLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uIChzKSB7dmFyIHIgPSBSZWdFeHAoXCJeKD86XCIgKyB0aGlzLnNvdXJjZSArIFwiKSQoPyFcXFxccylcIiwgZ2V0TmF0aXZlRmxhZ3ModGhpcykpOyBpZiAodGhpcy5nbG9iYWwpIHRoaXMubGFzdEluZGV4ID0gMDsgcmV0dXJuIHMuc2VhcmNoKHIpID09PSAwO307XG4gICAgKi9cblxufSkoKTtcblxuXG5tb2R1bGUuZXhwb3J0cy5YUmVnRXhwID0gWFJlZ0V4cDsiLCJ2YXIgWFJlZ0V4cCA9IHJlcXVpcmUoXCIuL1hSZWdFeHBcIikuWFJlZ0V4cDtcbnZhciBjbGFzc05hbWUsXG4gICBndXR0ZXI7XG4vL1xuLy8gQmVnaW4gYW5vbnltb3VzIGZ1bmN0aW9uLiBUaGlzIGlzIHVzZWQgdG8gY29udGFpbiBsb2NhbCBzY29wZSB2YXJpYWJsZXMgd2l0aG91dCBwb2x1dHRpbmcgZ2xvYmFsIHNjb3BlLlxuLy9cbnZhciBTeW50YXhIaWdobGlnaHRlciA9IGZ1bmN0aW9uKCkgeyBcblxuLy8gQ29tbW9uSlNcbmlmICh0eXBlb2YocmVxdWlyZSkgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mKFhSZWdFeHApID09ICd1bmRlZmluZWQnKVxue1xuLy8gTm8gb3Agc2luY2UgcmVxdWlyZWQgcHJvcGVybHkgYXQgdG9wIG9mIGZpbGVcblxufVxuXG4vLyBTaG9ydGN1dCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBhc3NpZ25lZCB0byB0aGUgU3ludGF4SGlnaGxpZ2h0ZXIgdmFyaWFibGUuXG4vLyBUaGlzIGlzIGEgc2hvcnRoYW5kIGZvciBsb2NhbCByZWZlcmVuY2UgaW4gb3JkZXIgdG8gYXZvaWQgbG9uZyBuYW1lc3BhY2UgXG4vLyByZWZlcmVuY2VzIHRvIFN5bnRheEhpZ2hsaWdodGVyLndoYXRldmVyLi4uXG52YXIgc2ggPSB7XG5cdGRlZmF1bHRzIDoge1xuXHRcdC8qKiBBZGRpdGlvbmFsIENTUyBjbGFzcyBuYW1lcyB0byBiZSBhZGRlZCB0byBoaWdobGlnaHRlciBlbGVtZW50cy4gKi9cblx0XHQnY2xhc3MtbmFtZScgOiAnJyxcblx0XHRcblx0XHQvKiogRmlyc3QgbGluZSBudW1iZXIuICovXG5cdFx0J2ZpcnN0LWxpbmUnIDogMSxcblx0XHRcblx0XHQvKipcblx0XHQgKiBQYWRzIGxpbmUgbnVtYmVycy4gUG9zc2libGUgdmFsdWVzIGFyZTpcblx0XHQgKlxuXHRcdCAqICAgZmFsc2UgLSBkb24ndCBwYWQgbGluZSBudW1iZXJzLlxuXHRcdCAqICAgdHJ1ZSAgLSBhdXRvbWF0aWNhbHkgcGFkIG51bWJlcnMgd2l0aCBtaW5pbXVtIHJlcXVpcmVkIG51bWJlciBvZiBsZWFkaW5nIHplcm9lcy5cblx0XHQgKiAgIFtpbnRdIC0gbGVuZ3RoIHVwIHRvIHdoaWNoIHBhZCBsaW5lIG51bWJlcnMuXG5cdFx0ICovXG5cdFx0J3BhZC1saW5lLW51bWJlcnMnIDogZmFsc2UsXG5cdFx0XG5cdFx0LyoqIExpbmVzIHRvIGhpZ2hsaWdodC4gKi9cblx0XHQnaGlnaGxpZ2h0JyA6IG51bGwsXG5cdFx0XG5cdFx0LyoqIFRpdGxlIHRvIGJlIGRpc3BsYXllZCBhYm92ZSB0aGUgY29kZSBibG9jay4gKi9cblx0XHQndGl0bGUnIDogbnVsbCxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBzbWFydCB0YWJzLiAqL1xuXHRcdCdzbWFydC10YWJzJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEdldHMgb3Igc2V0cyB0YWIgc2l6ZS4gKi9cblx0XHQndGFiLXNpemUnIDogNCxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBndXR0ZXIuICovXG5cdFx0J2d1dHRlcicgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIHRvb2xiYXIuICovXG5cdFx0J3Rvb2xiYXInIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBxdWljayBjb2RlIGNvcHkgYW5kIHBhc3RlIGZyb20gZG91YmxlIGNsaWNrLiAqL1xuXHRcdCdxdWljay1jb2RlJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEZvcmNlcyBjb2RlIHZpZXcgdG8gYmUgY29sbGFwc2VkLiAqL1xuXHRcdCdjb2xsYXBzZScgOiBmYWxzZSxcblx0XHRcblx0XHQvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBhdXRvbWF0aWMgbGlua3MuICovXG5cdFx0J2F1dG8tbGlua3MnIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogR2V0cyBvciBzZXRzIGxpZ2h0IG1vZGUuIEVxdWF2YWxlbnQgdG8gdHVybmluZyBvZmYgZ3V0dGVyIGFuZCB0b29sYmFyLiAqL1xuXHRcdCdsaWdodCcgOiBmYWxzZSxcblxuXHRcdCd1bmluZGVudCcgOiB0cnVlLFxuXHRcdFxuXHRcdCdodG1sLXNjcmlwdCcgOiBmYWxzZVxuXHR9LFxuXHRcblx0Y29uZmlnIDoge1xuXHRcdHNwYWNlIDogJyZuYnNwOycsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgdXNlIG9mIDxTQ1JJUFQgdHlwZT1cInN5bnRheGhpZ2hsaWdodGVyXCIgLz4gdGFncy4gKi9cblx0XHR1c2VTY3JpcHRUYWdzIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogQmxvZ2dlciBtb2RlIGZsYWcuICovXG5cdFx0YmxvZ2dlck1vZGUgOiBmYWxzZSxcblx0XHRcblx0XHRzdHJpcEJycyA6IGZhbHNlLFxuXHRcdFxuXHRcdC8qKiBOYW1lIG9mIHRoZSB0YWcgdGhhdCBTeW50YXhIaWdobGlnaHRlciB3aWxsIGF1dG9tYXRpY2FsbHkgbG9vayBmb3IuICovXG5cdFx0dGFnTmFtZSA6ICdwcmUnLFxuXHRcdFxuXHRcdHN0cmluZ3MgOiB7XG5cdFx0XHRleHBhbmRTb3VyY2UgOiAnZXhwYW5kIHNvdXJjZScsXG5cdFx0XHRoZWxwIDogJz8nLFxuXHRcdFx0YWxlcnQ6ICdTeW50YXhIaWdobGlnaHRlclxcblxcbicsXG5cdFx0XHRub0JydXNoIDogJ0NhblxcJ3QgZmluZCBicnVzaCBmb3I6ICcsXG5cdFx0XHRicnVzaE5vdEh0bWxTY3JpcHQgOiAnQnJ1c2ggd2FzblxcJ3QgY29uZmlndXJlZCBmb3IgaHRtbC1zY3JpcHQgb3B0aW9uOiAnLFxuXHRcdFx0XG5cdFx0XHQvLyB0aGlzIGlzIHBvcHVsYXRlZCBieSB0aGUgYnVpbGQgc2NyaXB0XG5cdFx0XHRhYm91dERpYWxvZyA6ICdAQUJPVVRAJ1xuXHRcdH1cblx0fSxcblx0XG5cdC8qKiBJbnRlcm5hbCAnZ2xvYmFsJyB2YXJpYWJsZXMuICovXG5cdHZhcnMgOiB7XG5cdFx0ZGlzY292ZXJlZEJydXNoZXMgOiBudWxsLFxuXHRcdGhpZ2hsaWdodGVycyA6IHt9XG5cdH0sXG5cdFxuXHQvKiogVGhpcyBvYmplY3QgaXMgcG9wdWxhdGVkIGJ5IHVzZXIgaW5jbHVkZWQgZXh0ZXJuYWwgYnJ1c2ggZmlsZXMuICovXG5cdGJydXNoZXMgOiB7fSxcblxuXHQvKiogQ29tbW9uIHJlZ3VsYXIgZXhwcmVzc2lvbnMuICovXG5cdHJlZ2V4TGliIDoge1xuXHRcdG11bHRpTGluZUNDb21tZW50c1x0XHRcdDogL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZ20sXG5cdFx0c2luZ2xlTGluZUNDb21tZW50c1x0XHRcdDogL1xcL1xcLy4qJC9nbSxcblx0XHRzaW5nbGVMaW5lUGVybENvbW1lbnRzXHRcdDogLyMuKiQvZ20sXG5cdFx0ZG91YmxlUXVvdGVkU3RyaW5nXHRcdFx0OiAvXCIoW15cXFxcXCJcXG5dfFxcXFwuKSpcIi9nLFxuXHRcdHNpbmdsZVF1b3RlZFN0cmluZ1x0XHRcdDogLycoW15cXFxcJ1xcbl18XFxcXC4pKicvZyxcblx0XHRtdWx0aUxpbmVEb3VibGVRdW90ZWRTdHJpbmdcdDogbmV3IFhSZWdFeHAoJ1wiKFteXFxcXFxcXFxcIl18XFxcXFxcXFwuKSpcIicsICdncycpLFxuXHRcdG11bHRpTGluZVNpbmdsZVF1b3RlZFN0cmluZ1x0OiBuZXcgWFJlZ0V4cChcIicoW15cXFxcXFxcXCddfFxcXFxcXFxcLikqJ1wiLCAnZ3MnKSxcblx0XHR4bWxDb21tZW50c1x0XHRcdFx0XHQ6IC8oJmx0O3w8KSEtLVtcXHNcXFNdKj8tLSgmZ3Q7fD4pL2dtLFxuXHRcdHVybFx0XHRcdFx0XHRcdFx0OiAvXFx3KzpcXC9cXC9bXFx3LS5cXC8/JSY9OkA7I10qL2csXG5cdFx0XG5cdFx0LyoqIDw/PSA/PiB0YWdzLiAqL1xuXHRcdHBocFNjcmlwdFRhZ3MgXHRcdFx0XHQ6IHsgbGVmdDogLygmbHQ7fDwpXFw/KD86PXxwaHApPy9nLCByaWdodDogL1xcPygmZ3Q7fD4pL2csICdlb2YnIDogdHJ1ZSB9LFxuXHRcdFxuXHRcdC8qKiA8JT0gJT4gdGFncy4gKi9cblx0XHRhc3BTY3JpcHRUYWdzXHRcdFx0XHQ6IHsgbGVmdDogLygmbHQ7fDwpJT0/L2csIHJpZ2h0OiAvJSgmZ3Q7fD4pL2cgfSxcblx0XHRcblx0XHQvKiogPHNjcmlwdD4gdGFncy4gKi9cblx0XHRzY3JpcHRTY3JpcHRUYWdzXHRcdFx0OiB7IGxlZnQ6IC8oJmx0O3w8KVxccypzY3JpcHQuKj8oJmd0O3w+KS9naSwgcmlnaHQ6IC8oJmx0O3w8KVxcL1xccypzY3JpcHRcXHMqKCZndDt8PikvZ2kgfVxuXHR9LFxuXG5cdHRvb2xiYXI6IHtcblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIHRoZSB0b29sYmFyLlxuXHRcdCAqIEBwYXJhbSB7SGlnaGxpZ2h0ZXJ9IGhpZ2hsaWdodGVyIEhpZ2hsaWdodGVyIGluc3RhbmNlLlxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBIVE1MIG1hcmt1cC5cblx0XHQgKi9cblx0XHRnZXRIdG1sOiBmdW5jdGlvbihoaWdobGlnaHRlcilcblx0XHR7XG5cdFx0XHR2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwidG9vbGJhclwiPicsXG5cdFx0XHRcdGl0ZW1zID0gc2gudG9vbGJhci5pdGVtcyxcblx0XHRcdFx0bGlzdCA9IGl0ZW1zLmxpc3Rcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBkZWZhdWx0R2V0SHRtbChoaWdobGlnaHRlciwgbmFtZSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHNoLnRvb2xiYXIuZ2V0QnV0dG9uSHRtbChoaWdobGlnaHRlciwgbmFtZSwgc2guY29uZmlnLnN0cmluZ3NbbmFtZV0pO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKVxuXHRcdFx0XHRodG1sICs9IChpdGVtc1tsaXN0W2ldXS5nZXRIdG1sIHx8IGRlZmF1bHRHZXRIdG1sKShoaWdobGlnaHRlciwgbGlzdFtpXSk7XG5cdFx0XHRcblx0XHRcdGh0bWwgKz0gJzwvZGl2Pic7XG5cdFx0XHRcblx0XHRcdHJldHVybiBodG1sO1xuXHRcdH0sXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciBhIHJlZ3VsYXIgYnV0dG9uIGluIHRoZSB0b29sYmFyLlxuXHRcdCAqIEBwYXJhbSB7SGlnaGxpZ2h0ZXJ9IGhpZ2hsaWdodGVyIEhpZ2hsaWdodGVyIGluc3RhbmNlLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBjb21tYW5kTmFtZVx0XHRDb21tYW5kIG5hbWUgdGhhdCB3b3VsZCBiZSBleGVjdXRlZC5cblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWxcdFx0XHRMYWJlbCB0ZXh0IHRvIGRpc3BsYXkuXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0XHRSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHRcdCAqL1xuXHRcdGdldEJ1dHRvbkh0bWw6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyLCBjb21tYW5kTmFtZSwgbGFiZWwpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICc8c3Bhbj48YSBocmVmPVwiI1wiIGNsYXNzPVwidG9vbGJhcl9pdGVtJ1xuXHRcdFx0XHQrICcgY29tbWFuZF8nICsgY29tbWFuZE5hbWVcblx0XHRcdFx0KyAnICcgKyBjb21tYW5kTmFtZVxuXHRcdFx0XHQrICdcIj4nICsgbGFiZWwgKyAnPC9hPjwvc3Bhbj4nXG5cdFx0XHRcdDtcblx0XHR9LFxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEV2ZW50IGhhbmRsZXIgZm9yIGEgdG9vbGJhciBhbmNob3IuXG5cdFx0ICovXG5cdFx0aGFuZGxlcjogZnVuY3Rpb24oZSlcblx0XHR7XG5cdFx0XHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQsXG5cdFx0XHRcdGNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUgfHwgJydcblx0XHRcdFx0O1xuXG5cdFx0XHRmdW5jdGlvbiBnZXRWYWx1ZShuYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgciA9IG5ldyBSZWdFeHAobmFtZSArICdfKFxcXFx3KyknKSxcblx0XHRcdFx0XHRtYXRjaCA9IHIuZXhlYyhjbGFzc05hbWUpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogbnVsbDtcblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdHZhciBoaWdobGlnaHRlciA9IGdldEhpZ2hsaWdodGVyQnlJZChmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsICcuc3ludGF4aGlnaGxpZ2h0ZXInKS5pZCksXG5cdFx0XHRcdGNvbW1hbmROYW1lID0gZ2V0VmFsdWUoJ2NvbW1hbmQnKVxuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdC8vIGV4ZWN1dGUgdGhlIHRvb2xiYXIgY29tbWFuZFxuXHRcdFx0aWYgKGhpZ2hsaWdodGVyICYmIGNvbW1hbmROYW1lKVxuXHRcdFx0XHRzaC50b29sYmFyLml0ZW1zW2NvbW1hbmROYW1lXS5leGVjdXRlKGhpZ2hsaWdodGVyKTtcblxuXHRcdFx0Ly8gZGlzYWJsZSBkZWZhdWx0IEEgY2xpY2sgYmVoYXZpb3VyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fSxcblx0XHRcblx0XHQvKiogQ29sbGVjdGlvbiBvZiB0b29sYmFyIGl0ZW1zLiAqL1xuXHRcdGl0ZW1zIDoge1xuXHRcdFx0Ly8gT3JkZXJlZCBsaXMgb2YgaXRlbXMgaW4gdGhlIHRvb2xiYXIuIENhbid0IGV4cGVjdCBgZm9yICh2YXIgbiBpbiBpdGVtcylgIHRvIGJlIGNvbnNpc3RlbnQuXG5cdFx0XHRsaXN0OiBbJ2V4cGFuZFNvdXJjZScsICdoZWxwJ10sXG5cblx0XHRcdGV4cGFuZFNvdXJjZToge1xuXHRcdFx0XHRnZXRIdG1sOiBmdW5jdGlvbihoaWdobGlnaHRlcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChoaWdobGlnaHRlci5nZXRQYXJhbSgnY29sbGFwc2UnKSAhPSB0cnVlKVxuXHRcdFx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIHRpdGxlID0gaGlnaGxpZ2h0ZXIuZ2V0UGFyYW0oJ3RpdGxlJyk7XG5cdFx0XHRcdFx0cmV0dXJuIHNoLnRvb2xiYXIuZ2V0QnV0dG9uSHRtbChoaWdobGlnaHRlciwgJ2V4cGFuZFNvdXJjZScsIHRpdGxlID8gdGl0bGUgOiBzaC5jb25maWcuc3RyaW5ncy5leHBhbmRTb3VyY2UpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XG5cdFx0XHRcdGV4ZWN1dGU6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGRpdiA9IGdldEhpZ2hsaWdodGVyRGl2QnlJZChoaWdobGlnaHRlci5pZCk7XG5cdFx0XHRcdFx0cmVtb3ZlQ2xhc3MoZGl2LCAnY29sbGFwc2VkJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8qKiBDb21tYW5kIHRvIGRpc3BsYXkgdGhlIGFib3V0IGRpYWxvZyB3aW5kb3cuICovXG5cdFx0XHRoZWxwOiB7XG5cdFx0XHRcdGV4ZWN1dGU6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdFx0XHR7XHRcblx0XHRcdFx0XHR2YXIgd25kID0gcG9wdXAoJycsICdfYmxhbmsnLCA1MDAsIDI1MCwgJ3Njcm9sbGJhcnM9MCcpLFxuXHRcdFx0XHRcdFx0ZG9jID0gd25kLmRvY3VtZW50XG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ZG9jLndyaXRlKHNoLmNvbmZpZy5zdHJpbmdzLmFib3V0RGlhbG9nKTtcblx0XHRcdFx0XHRkb2MuY2xvc2UoKTtcblx0XHRcdFx0XHR3bmQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogRmluZHMgYWxsIGVsZW1lbnRzIG9uIHRoZSBwYWdlIHdoaWNoIHNob3VsZCBiZSBwcm9jZXNzZXMgYnkgU3ludGF4SGlnaGxpZ2h0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBnbG9iYWxQYXJhbXNcdFx0T3B0aW9uYWwgcGFyYW1ldGVycyB3aGljaCBvdmVycmlkZSBlbGVtZW50J3MgXG5cdCAqIFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuIE9ubHkgdXNlZCBpZiBlbGVtZW50IGlzIHNwZWNpZmllZC5cblx0ICogXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XHRPcHRpb25hbCBlbGVtZW50IHRvIGhpZ2hsaWdodC4gSWYgbm9uZSBpc1xuXHQgKiBcdFx0XHRcdFx0XHRcdHByb3ZpZGVkLCBhbGwgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQgXG5cdCAqIFx0XHRcdFx0XHRcdFx0YXJlIHJldHVybmVkIHdoaWNoIHF1YWxpZnkuXG5cdCAqXG5cdCAqIEByZXR1cm4ge0FycmF5fVx0UmV0dXJucyBsaXN0IG9mIDxjb2RlPnsgdGFyZ2V0OiBET01FbGVtZW50LCBwYXJhbXM6IE9iamVjdCB9PC9jb2RlPiBvYmplY3RzLlxuXHQgKi9cblx0ZmluZEVsZW1lbnRzOiBmdW5jdGlvbihnbG9iYWxQYXJhbXMsIGVsZW1lbnQpXG5cdHtcblx0XHR2YXIgZWxlbWVudHMgPSBlbGVtZW50ID8gW2VsZW1lbnRdIDogdG9BcnJheShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShzaC5jb25maWcudGFnTmFtZSkpLCBcblx0XHRcdGNvbmYgPSBzaC5jb25maWcsXG5cdFx0XHRyZXN1bHQgPSBbXVxuXHRcdFx0O1xuXG5cdFx0Ly8gc3VwcG9ydCBmb3IgPFNDUklQVCBUWVBFPVwic3ludGF4aGlnaGxpZ2h0ZXJcIiAvPiBmZWF0dXJlXG5cdFx0aWYgKGNvbmYudXNlU2NyaXB0VGFncylcblx0XHRcdGVsZW1lbnRzID0gZWxlbWVudHMuY29uY2F0KGdldFN5bnRheEhpZ2hsaWdodGVyU2NyaXB0VGFncygpKTtcblxuXHRcdGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIFxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykgXG5cdFx0e1xuXHRcdFx0dmFyIGl0ZW0gPSB7XG5cdFx0XHRcdHRhcmdldDogZWxlbWVudHNbaV0sIFxuXHRcdFx0XHQvLyBsb2NhbCBwYXJhbXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgZ2xvYmFsc1xuXHRcdFx0XHRwYXJhbXM6IG1lcmdlKGdsb2JhbFBhcmFtcywgcGFyc2VQYXJhbXMoZWxlbWVudHNbaV0uY2xhc3NOYW1lKSlcblx0XHRcdH07XG5cblx0XHRcdGlmIChpdGVtLnBhcmFtc1snYnJ1c2gnXSA9PSBudWxsKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XG5cdFx0XHRyZXN1bHQucHVzaChpdGVtKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogU2hvcnRoYW5kIHRvIGhpZ2hsaWdodCBhbGwgZWxlbWVudHMgb24gdGhlIHBhZ2UgdGhhdCBhcmUgbWFya2VkIGFzIFxuXHQgKiBTeW50YXhIaWdobGlnaHRlciBzb3VyY2UgY29kZS5cblx0ICogXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBnbG9iYWxQYXJhbXNcdFx0T3B0aW9uYWwgcGFyYW1ldGVycyB3aGljaCBvdmVycmlkZSBlbGVtZW50J3MgXG5cdCAqIFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuIE9ubHkgdXNlZCBpZiBlbGVtZW50IGlzIHNwZWNpZmllZC5cblx0ICogXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XHRPcHRpb25hbCBlbGVtZW50IHRvIGhpZ2hsaWdodC4gSWYgbm9uZSBpc1xuXHQgKiBcdFx0XHRcdFx0XHRcdHByb3ZpZGVkLCBhbGwgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnQgXG5cdCAqIFx0XHRcdFx0XHRcdFx0YXJlIGhpZ2hsaWdodGVkLlxuXHQgKi8gXG5cdGhpZ2hsaWdodDogZnVuY3Rpb24oZ2xvYmFsUGFyYW1zLCBlbGVtZW50KVxuXHR7XG5cdFx0dmFyIGVsZW1lbnRzID0gdGhpcy5maW5kRWxlbWVudHMoZ2xvYmFsUGFyYW1zLCBlbGVtZW50KSxcblx0XHRcdHByb3BlcnR5TmFtZSA9ICdpbm5lckhUTUwnLCBcblx0XHRcdGhpZ2hsaWdodGVyID0gbnVsbCxcblx0XHRcdGNvbmYgPSBzaC5jb25maWdcblx0XHRcdDtcblxuXHRcdGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIFxuXHRcdFx0cmV0dXJuO1xuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSBcblx0XHR7XG5cdFx0XHR2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldLFxuXHRcdFx0XHR0YXJnZXQgPSBlbGVtZW50LnRhcmdldCxcblx0XHRcdFx0cGFyYW1zID0gZWxlbWVudC5wYXJhbXMsXG5cdFx0XHRcdGJydXNoTmFtZSA9IHBhcmFtcy5icnVzaCxcblx0XHRcdFx0Y29kZVxuXHRcdFx0XHQ7XG5cblx0XHRcdGlmIChicnVzaE5hbWUgPT0gbnVsbClcblx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdC8vIEluc3RhbnRpYXRlIGEgYnJ1c2hcblx0XHRcdGlmIChwYXJhbXNbJ2h0bWwtc2NyaXB0J10gPT0gJ3RydWUnIHx8IHNoLmRlZmF1bHRzWydodG1sLXNjcmlwdCddID09IHRydWUpIFxuXHRcdFx0e1xuXHRcdFx0XHRoaWdobGlnaHRlciA9IG5ldyBzaC5IdG1sU2NyaXB0KGJydXNoTmFtZSk7XG5cdFx0XHRcdGJydXNoTmFtZSA9ICdodG1sc2NyaXB0Jztcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dmFyIGJydXNoID0gZmluZEJydXNoKGJydXNoTmFtZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoYnJ1c2gpXG5cdFx0XHRcdFx0aGlnaGxpZ2h0ZXIgPSBuZXcgYnJ1c2goKTtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb2RlID0gdGFyZ2V0W3Byb3BlcnR5TmFtZV07XG5cdFx0XHRcblx0XHRcdC8vIHJlbW92ZSBDREFUQSBmcm9tIDxTQ1JJUFQvPiB0YWdzIGlmIGl0J3MgcHJlc2VudFxuXHRcdFx0aWYgKGNvbmYudXNlU2NyaXB0VGFncylcblx0XHRcdFx0Y29kZSA9IHN0cmlwQ0RhdGEoY29kZSk7XG5cdFx0XHRcdFxuXHRcdFx0Ly8gSW5qZWN0IHRpdGxlIGlmIHRoZSBhdHRyaWJ1dGUgaXMgcHJlc2VudFxuXHRcdFx0aWYgKCh0YXJnZXQudGl0bGUgfHwgJycpICE9ICcnKVxuXHRcdFx0XHRwYXJhbXMudGl0bGUgPSB0YXJnZXQudGl0bGU7XG5cdFx0XHRcdFxuXHRcdFx0cGFyYW1zWydicnVzaCddID0gYnJ1c2hOYW1lO1xuXHRcdFx0aGlnaGxpZ2h0ZXIuaW5pdChwYXJhbXMpO1xuXHRcdFx0ZWxlbWVudCA9IGhpZ2hsaWdodGVyLmdldERpdihjb2RlKTtcblx0XHRcdFxuXHRcdFx0Ly8gY2Fycnkgb3ZlciBJRFxuXHRcdFx0aWYgKCh0YXJnZXQuaWQgfHwgJycpICE9ICcnKVxuXHRcdFx0XHRlbGVtZW50LmlkID0gdGFyZ2V0LmlkO1xuXHRcdFx0XG5cdFx0XHR0YXJnZXQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWxlbWVudCwgdGFyZ2V0KTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHRoZSBTeW50YXhIaWdobGlnaHRlci5cblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBPcHRpb25hbCBwYXJhbXMgdG8gYXBwbHkgdG8gYWxsIGhpZ2hsaWdodGVkIGVsZW1lbnRzLlxuXHQgKi9cblx0YWxsOiBmdW5jdGlvbihwYXJhbXMpXG5cdHtcblx0XHRhdHRhY2hFdmVudChcblx0XHRcdHdpbmRvdyxcblx0XHRcdCdsb2FkJyxcblx0XHRcdGZ1bmN0aW9uKCkgeyBzaC5oaWdobGlnaHQocGFyYW1zKTsgfVxuXHRcdCk7XG5cdH1cbn07IC8vIGVuZCBvZiBzaFxuXG4vKipcbiAqIENoZWNrcyBpZiB0YXJnZXQgRE9NIGVsZW1lbnRzIGhhcyBzcGVjaWZpZWQgQ1NTIGNsYXNzLlxuICogQHBhcmFtIHtET01FbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50IHRvIGNoZWNrLlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBOYW1lIG9mIHRoZSBDU1MgY2xhc3MgdG8gY2hlY2sgZm9yLlxuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGNsYXNzIG5hbWUgaXMgcHJlc2VudCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBoYXNDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0cmV0dXJuIHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZihjbGFzc05hbWUpICE9IC0xO1xufTtcblxuLyoqXG4gKiBBZGRzIENTUyBjbGFzcyBuYW1lIHRvIHRoZSB0YXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIE5ldyBDU1MgY2xhc3MgdG8gYWRkLlxuICovXG5mdW5jdGlvbiBhZGRDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0aWYgKCFoYXNDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSkpXG5cdFx0dGFyZ2V0LmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgQ1NTIGNsYXNzIG5hbWUgZnJvbSB0aGUgdGFyZ2V0IERPTSBlbGVtZW50LlxuICogQHBhcmFtIHtET01FbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50LlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBDU1MgY2xhc3MgdG8gcmVtb3ZlLlxuICovXG5mdW5jdGlvbiByZW1vdmVDbGFzcyh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0dGFyZ2V0LmNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUucmVwbGFjZShjbGFzc05hbWUsICcnKTtcbn07XG5cbi8qKlxuICogQ29udmVydHMgdGhlIHNvdXJjZSB0byBhcnJheSBvYmplY3QuIE1vc3RseSB1c2VkIGZvciBmdW5jdGlvbiBhcmd1bWVudHMgYW5kIFxuICogbGlzdHMgcmV0dXJuZWQgYnkgZ2V0RWxlbWVudHNCeVRhZ05hbWUoKSB3aGljaCBhcmVuJ3QgQXJyYXkgb2JqZWN0cy5cbiAqIEBwYXJhbSB7TGlzdH0gc291cmNlIFNvdXJjZSBsaXN0LlxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHRvQXJyYXkoc291cmNlKVxue1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykgXG5cdFx0cmVzdWx0LnB1c2goc291cmNlW2ldKTtcblx0XHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogU3BsaXRzIGJsb2NrIG9mIHRleHQgaW50byBsaW5lcy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBibG9jayBCbG9jayBvZiB0ZXh0LlxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYXJyYXkgb2YgbGluZXMuXG4gKi9cbmZ1bmN0aW9uIHNwbGl0TGluZXMoYmxvY2spXG57XG5cdHJldHVybiBibG9jay5zcGxpdCgvXFxyP1xcbi8pO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBIVE1MIElEIGZvciB0aGUgaGlnaGxpZ2h0ZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gaGlnaGxpZ2h0ZXJJZCBIaWdobGlnaHRlciBJRC5cbiAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBIVE1MIElELlxuICovXG5mdW5jdGlvbiBnZXRIaWdobGlnaHRlcklkKGlkKVxue1xuXHR2YXIgcHJlZml4ID0gJ2hpZ2hsaWdodGVyXyc7XG5cdHJldHVybiBpZC5pbmRleE9mKHByZWZpeCkgPT0gMCA/IGlkIDogcHJlZml4ICsgaWQ7XG59O1xuXG4vKipcbiAqIEZpbmRzIEhpZ2hsaWdodGVyIGluc3RhbmNlIGJ5IElELlxuICogQHBhcmFtIHtTdHJpbmd9IGhpZ2hsaWdodGVySWQgSGlnaGxpZ2h0ZXIgSUQuXG4gKiBAcmV0dXJuIHtIaWdobGlnaHRlcn0gUmV0dXJucyBpbnN0YW5jZSBvZiB0aGUgaGlnaGxpZ2h0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodGVyQnlJZChpZClcbntcblx0cmV0dXJuIHNoLnZhcnMuaGlnaGxpZ2h0ZXJzW2dldEhpZ2hsaWdodGVySWQoaWQpXTtcbn07XG5cbi8qKlxuICogRmluZHMgaGlnaGxpZ2h0ZXIncyBESVYgY29udGFpbmVyLlxuICogQHBhcmFtIHtTdHJpbmd9IGhpZ2hsaWdodGVySWQgSGlnaGxpZ2h0ZXIgSUQuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBSZXR1cm5zIGhpZ2hsaWdodGVyJ3MgRElWIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodGVyRGl2QnlJZChpZClcbntcblx0cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGdldEhpZ2hsaWdodGVySWQoaWQpKTtcbn07XG5cbi8qKlxuICogU3RvcmVzIGhpZ2hsaWdodGVyIHNvIHRoYXQgZ2V0SGlnaGxpZ2h0ZXJCeUlkKCkgY2FuIGRvIGl0cyB0aGluZy4gRWFjaFxuICogaGlnaGxpZ2h0ZXIgbXVzdCBjYWxsIHRoaXMgbWV0aG9kIHRvIHByZXNlcnZlIGl0c2VsZi5cbiAqIEBwYXJhbSB7SGlnaGlsZ2h0ZXJ9IGhpZ2hsaWdodGVyIEhpZ2hsaWdodGVyIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBzdG9yZUhpZ2hsaWdodGVyKGhpZ2hsaWdodGVyKVxue1xuXHRzaC52YXJzLmhpZ2hsaWdodGVyc1tnZXRIaWdobGlnaHRlcklkKGhpZ2hsaWdodGVyLmlkKV0gPSBoaWdobGlnaHRlcjtcbn07XG5cbi8qKlxuICogTG9va3MgZm9yIGEgY2hpbGQgb3IgcGFyZW50IG5vZGUgd2hpY2ggaGFzIHNwZWNpZmllZCBjbGFzc25hbWUuXG4gKiBFcXVpdmFsZW50IHRvIGpRdWVyeSdzICQoY29udGFpbmVyKS5maW5kKFwiLmNsYXNzTmFtZVwiKVxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VhcmNoIENsYXNzIG5hbWUgb3Igbm9kZSBuYW1lIHRvIGxvb2sgZm9yLlxuICogQHBhcmFtIHtCb29sZWFufSByZXZlcnNlIElmIHNldCB0byB0cnVlLCB3aWxsIGdvIHVwIHRoZSBub2RlIHRyZWUgaW5zdGVhZCBvZiBkb3duLlxuICogQHJldHVybiB7RWxlbWVudH0gUmV0dXJucyBmb3VuZCBjaGlsZCBvciBwYXJlbnQgZWxlbWVudCBvbiBudWxsLlxuICovXG5mdW5jdGlvbiBmaW5kRWxlbWVudCh0YXJnZXQsIHNlYXJjaCwgcmV2ZXJzZSAvKiBvcHRpb25hbCAqLylcbntcblx0aWYgKHRhcmdldCA9PSBudWxsKVxuXHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHR2YXIgbm9kZXNcdFx0XHQ9IHJldmVyc2UgIT0gdHJ1ZSA/IHRhcmdldC5jaGlsZE5vZGVzIDogWyB0YXJnZXQucGFyZW50Tm9kZSBdLFxuXHRcdHByb3BlcnR5VG9GaW5kXHQ9IHsgJyMnIDogJ2lkJywgJy4nIDogJ2NsYXNzTmFtZScgfVtzZWFyY2guc3Vic3RyKDAsIDEpXSB8fCAnbm9kZU5hbWUnLFxuXHRcdGV4cGVjdGVkVmFsdWUsXG5cdFx0Zm91bmRcblx0XHQ7XG5cblx0ZXhwZWN0ZWRWYWx1ZSA9IHByb3BlcnR5VG9GaW5kICE9ICdub2RlTmFtZSdcblx0XHQ/IHNlYXJjaC5zdWJzdHIoMSlcblx0XHQ6IHNlYXJjaC50b1VwcGVyQ2FzZSgpXG5cdFx0O1xuXHRcdFxuXHQvLyBtYWluIHJldHVybiBvZiB0aGUgZm91bmQgbm9kZVxuXHRpZiAoKHRhcmdldFtwcm9wZXJ0eVRvRmluZF0gfHwgJycpLmluZGV4T2YoZXhwZWN0ZWRWYWx1ZSkgIT0gLTEpXG5cdFx0cmV0dXJuIHRhcmdldDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBub2RlcyAmJiBpIDwgbm9kZXMubGVuZ3RoICYmIGZvdW5kID09IG51bGw7IGkrKylcblx0XHRmb3VuZCA9IGZpbmRFbGVtZW50KG5vZGVzW2ldLCBzZWFyY2gsIHJldmVyc2UpO1xuXHRcblx0cmV0dXJuIGZvdW5kO1xufTtcblxuLyoqXG4gKiBMb29rcyBmb3IgYSBwYXJlbnQgbm9kZSB3aGljaCBoYXMgc3BlY2lmaWVkIGNsYXNzbmFtZS5cbiAqIFRoaXMgaXMgYW4gYWxpYXMgdG8gPGNvZGU+ZmluZEVsZW1lbnQoY29udGFpbmVyLCBjbGFzc05hbWUsIHRydWUpPC9jb2RlPi5cbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFRhcmdldCBlbGVtZW50LlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBuYW1lIHRvIGxvb2sgZm9yLlxuICogQHJldHVybiB7RWxlbWVudH0gUmV0dXJucyBmb3VuZCBwYXJlbnQgZWxlbWVudCBvbiBudWxsLlxuICovXG5mdW5jdGlvbiBmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsIGNsYXNzTmFtZSlcbntcblx0cmV0dXJuIGZpbmRFbGVtZW50KHRhcmdldCwgY2xhc3NOYW1lLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRmluZHMgYW4gaW5kZXggb2YgZWxlbWVudCBpbiB0aGUgYXJyYXkuXG4gKiBAaWdub3JlXG4gKiBAcGFyYW0ge09iamVjdH0gc2VhcmNoRWxlbWVudFxuICogQHBhcmFtIHtOdW1iZXJ9IGZyb21JbmRleFxuICogQHJldHVybiB7TnVtYmVyfSBSZXR1cm5zIGluZGV4IG9mIGVsZW1lbnQgaWYgZm91bmQ7IC0xIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgc2VhcmNoRWxlbWVudCwgZnJvbUluZGV4KVxue1xuXHRmcm9tSW5kZXggPSBNYXRoLm1heChmcm9tSW5kZXggfHwgMCwgMCk7XG5cblx0Zm9yICh2YXIgaSA9IGZyb21JbmRleDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKVxuXHRcdGlmKGFycmF5W2ldID09IHNlYXJjaEVsZW1lbnQpXG5cdFx0XHRyZXR1cm4gaTtcblx0XG5cdHJldHVybiAtMTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdW5pcXVlIGVsZW1lbnQgSUQuXG4gKi9cbmZ1bmN0aW9uIGd1aWQocHJlZml4KVxue1xuXHRyZXR1cm4gKHByZWZpeCB8fCAnJykgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKS50b1N0cmluZygpO1xufTtcblxuLyoqXG4gKiBNZXJnZXMgdHdvIG9iamVjdHMuIFZhbHVlcyBmcm9tIG9iajIgb3ZlcnJpZGUgdmFsdWVzIGluIG9iajEuXG4gKiBGdW5jdGlvbiBpcyBOT1QgcmVjdXJzaXZlIGFuZCB3b3JrcyBvbmx5IGZvciBvbmUgZGltZW5zaW9uYWwgb2JqZWN0cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIEZpcnN0IG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoyIFNlY29uZCBvYmplY3QuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgY29tYmluYXRpb24gb2YgYm90aCBvYmplY3RzLlxuICovXG5mdW5jdGlvbiBtZXJnZShvYmoxLCBvYmoyKVxue1xuXHR2YXIgcmVzdWx0ID0ge30sIG5hbWU7XG5cblx0Zm9yIChuYW1lIGluIG9iajEpIFxuXHRcdHJlc3VsdFtuYW1lXSA9IG9iajFbbmFtZV07XG5cdFxuXHRmb3IgKG5hbWUgaW4gb2JqMikgXG5cdFx0cmVzdWx0W25hbWVdID0gb2JqMltuYW1lXTtcblx0XHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gY29udmVydCBzdHJpbmcgdG8gYm9vbGVhbi5cbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBJbnB1dCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgaW5wdXQgd2FzIFwidHJ1ZVwiLCBmYWxzZSBpZiBpbnB1dCB3YXMgXCJmYWxzZVwiIGFuZCB2YWx1ZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSlcbntcblx0dmFyIHJlc3VsdCA9IHsgXCJ0cnVlXCIgOiB0cnVlLCBcImZhbHNlXCIgOiBmYWxzZSB9W3ZhbHVlXTtcblx0cmV0dXJuIHJlc3VsdCA9PSBudWxsID8gdmFsdWUgOiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIE9wZW5zIHVwIGEgY2VudGVyZWQgcG9wdXAgd2luZG93LlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFx0XHRVUkwgdG8gb3BlbiBpbiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcdFx0UG9wdXAgbmFtZS5cbiAqIEBwYXJhbSB7aW50fSB3aWR0aFx0XHRQb3B1cCB3aWR0aC5cbiAqIEBwYXJhbSB7aW50fSBoZWlnaHRcdFx0UG9wdXAgaGVpZ2h0LlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnNcdHdpbmRvdy5vcGVuKCkgb3B0aW9ucy5cbiAqIEByZXR1cm4ge1dpbmRvd31cdFx0XHRSZXR1cm5zIHdpbmRvdyBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gcG9wdXAodXJsLCBuYW1lLCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKVxue1xuXHR2YXIgeCA9IChzY3JlZW4ud2lkdGggLSB3aWR0aCkgLyAyLFxuXHRcdHkgPSAoc2NyZWVuLmhlaWdodCAtIGhlaWdodCkgLyAyXG5cdFx0O1xuXHRcdFxuXHRvcHRpb25zICs9XHQnLCBsZWZ0PScgKyB4ICsgXG5cdFx0XHRcdCcsIHRvcD0nICsgeSArXG5cdFx0XHRcdCcsIHdpZHRoPScgKyB3aWR0aCArXG5cdFx0XHRcdCcsIGhlaWdodD0nICsgaGVpZ2h0XG5cdFx0O1xuXHRvcHRpb25zID0gb3B0aW9ucy5yZXBsYWNlKC9eLC8sICcnKTtcblxuXHR2YXIgd2luID0gd2luZG93Lm9wZW4odXJsLCBuYW1lLCBvcHRpb25zKTtcblx0d2luLmZvY3VzKCk7XG5cdHJldHVybiB3aW47XG59O1xuXG4vKipcbiAqIEFkZHMgZXZlbnQgaGFuZGxlciB0byB0aGUgdGFyZ2V0IG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcdFx0VGFyZ2V0IG9iamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXHRcdE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY1x0SGFuZGxpbmcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGF0dGFjaEV2ZW50KG9iaiwgdHlwZSwgZnVuYywgc2NvcGUpXG57XG5cdGZ1bmN0aW9uIGhhbmRsZXIoZSlcblx0e1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRcblx0XHRpZiAoIWUudGFyZ2V0KVxuXHRcdHtcblx0XHRcdGUudGFyZ2V0ID0gZS5zcmNFbGVtZW50O1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0XHRcblx0XHRmdW5jLmNhbGwoc2NvcGUgfHwgd2luZG93LCBlKTtcblx0fTtcblx0XG5cdGlmIChvYmouYXR0YWNoRXZlbnQpIFxuXHR7XG5cdFx0b2JqLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBoYW5kbGVyKTtcblx0fVxuXHRlbHNlIFxuXHR7XG5cdFx0b2JqLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuXHR9XG59O1xuXG4vKipcbiAqIERpc3BsYXlzIGFuIGFsZXJ0LlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBTdHJpbmcgdG8gZGlzcGxheS5cbiAqL1xuZnVuY3Rpb24gYWxlcnQoc3RyKVxue1xuXHR3aW5kb3cuYWxlcnQoc2guY29uZmlnLnN0cmluZ3MuYWxlcnQgKyBzdHIpO1xufTtcblxuLyoqXG4gKiBGaW5kcyBhIGJydXNoIGJ5IGl0cyBhbGlhcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWxpYXNcdFx0QnJ1c2ggYWxpYXMuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3dBbGVydFx0U3VwcHJlc3NlcyB0aGUgYWxlcnQgaWYgZmFsc2UuXG4gKiBAcmV0dXJuIHtCcnVzaH1cdFx0XHRcdFJldHVybnMgYnVyc2ggY29uc3RydWN0b3IgaWYgZm91bmQsIG51bGwgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBmaW5kQnJ1c2goYWxpYXMsIHNob3dBbGVydClcbntcblx0dmFyIGJydXNoZXMgPSBzaC52YXJzLmRpc2NvdmVyZWRCcnVzaGVzLFxuXHRcdHJlc3VsdCA9IG51bGxcblx0XHQ7XG5cdFxuXHRpZiAoYnJ1c2hlcyA9PSBudWxsKSBcblx0e1xuXHRcdGJydXNoZXMgPSB7fTtcblx0XHRcblx0XHQvLyBGaW5kIGFsbCBicnVzaGVzXG5cdFx0Zm9yICh2YXIgYnJ1c2ggaW4gc2guYnJ1c2hlcykgXG5cdFx0e1xuXHRcdFx0dmFyIGluZm8gPSBzaC5icnVzaGVzW2JydXNoXSxcblx0XHRcdFx0YWxpYXNlcyA9IGluZm8uYWxpYXNlc1xuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdGlmIChhbGlhc2VzID09IG51bGwpIFxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Ly8ga2VlcCB0aGUgYnJ1c2ggbmFtZVxuXHRcdFx0aW5mby5icnVzaE5hbWUgPSBicnVzaC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFsaWFzZXMubGVuZ3RoOyBpKyspIFxuXHRcdFx0XHRicnVzaGVzW2FsaWFzZXNbaV1dID0gYnJ1c2g7XG5cdFx0fVxuXHRcdFxuXHRcdHNoLnZhcnMuZGlzY292ZXJlZEJydXNoZXMgPSBicnVzaGVzO1xuXHR9XG5cdFxuXHRyZXN1bHQgPSBzaC5icnVzaGVzW2JydXNoZXNbYWxpYXNdXTtcblxuXHRpZiAocmVzdWx0ID09IG51bGwgJiYgc2hvd0FsZXJ0KVxuXHRcdGFsZXJ0KHNoLmNvbmZpZy5zdHJpbmdzLm5vQnJ1c2ggKyBhbGlhcyk7XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIGNhbGxiYWNrIG9uIGVhY2ggbGluZSBhbmQgcmVwbGFjZXMgZWFjaCBsaW5lIHdpdGggcmVzdWx0IGZyb20gdGhlIGNhbGxiYWNrLlxuICogQHBhcmFtIHtPYmplY3R9IHN0clx0XHRcdElucHV0IHN0cmluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjYWxsYmFja1x0XHRDYWxsYmFjayBmdW5jdGlvbiB0YWtpbmcgb25lIHN0cmluZyBhcmd1bWVudCBhbmQgcmV0dXJuaW5nIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBlYWNoTGluZShzdHIsIGNhbGxiYWNrKVxue1xuXHR2YXIgbGluZXMgPSBzcGxpdExpbmVzKHN0cik7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxuXHRcdGxpbmVzW2ldID0gY2FsbGJhY2sobGluZXNbaV0sIGkpO1xuXHRcdFxuXHQvLyBpbmNsdWRlIFxcciB0byBlbmFibGUgY29weS1wYXN0ZSBvbiB3aW5kb3dzIChpZTgpIHdpdGhvdXQgZ2V0dGluZyBldmVyeXRoaW5nIG9uIG9uZSBsaW5lXG5cdHJldHVybiBsaW5lcy5qb2luKCdcXHJcXG4nKTtcbn07XG5cbi8qKlxuICogVGhpcyBpcyBhIHNwZWNpYWwgdHJpbSB3aGljaCBvbmx5IHJlbW92ZXMgZmlyc3QgYW5kIGxhc3QgZW1wdHkgbGluZXNcbiAqIGFuZCBkb2Vzbid0IGFmZmVjdCB2YWxpZCBsZWFkaW5nIHNwYWNlIG9uIHRoZSBmaXJzdCBsaW5lLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyBzdHJpbmcgd2l0aG91dCBlbXB0eSBmaXJzdCBhbmQgbGFzdCBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gdHJpbUZpcnN0QW5kTGFzdExpbmVzKHN0cilcbntcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9eWyBdKltcXG5dK3xbXFxuXSpbIF0qJC9nLCAnJyk7XG59O1xuXG4vKipcbiAqIFBhcnNlcyBrZXkvdmFsdWUgcGFpcnMgaW50byBoYXNoIG9iamVjdC5cbiAqIFxuICogVW5kZXJzdGFuZHMgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogLSBuYW1lOiB3b3JkO1xuICogLSBuYW1lOiBbd29yZCwgd29yZF07XG4gKiAtIG5hbWU6IFwic3RyaW5nXCI7XG4gKiAtIG5hbWU6ICdzdHJpbmcnO1xuICogXG4gKiBGb3IgZXhhbXBsZTpcbiAqICAgbmFtZTE6IHZhbHVlOyBuYW1lMjogW3ZhbHVlLCB2YWx1ZV07IG5hbWUzOiAndmFsdWUnXG4gKiAgIFxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgICBJbnB1dCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgIFJldHVybnMgZGVzZXJpYWxpemVkIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VQYXJhbXMoc3RyKVxue1xuXHR2YXIgbWF0Y2gsIFxuXHRcdHJlc3VsdCA9IHt9LFxuXHRcdGFycmF5UmVnZXggPSBuZXcgWFJlZ0V4cChcIl5cXFxcWyg/PHZhbHVlcz4oLio/KSlcXFxcXSRcIiksXG5cdFx0cmVnZXggPSBuZXcgWFJlZ0V4cChcblx0XHRcdFwiKD88bmFtZT5bXFxcXHctXSspXCIgK1xuXHRcdFx0XCJcXFxccyo6XFxcXHMqXCIgK1xuXHRcdFx0XCIoPzx2YWx1ZT5cIiArXG5cdFx0XHRcdFwiW1xcXFx3LSUjXSt8XCIgK1x0XHQvLyB3b3JkXG5cdFx0XHRcdFwiXFxcXFsuKj9cXFxcXXxcIiArXHRcdC8vIFtdIGFycmF5XG5cdFx0XHRcdCdcIi4qP1wifCcgK1x0XHRcdC8vIFwiXCIgc3RyaW5nXG5cdFx0XHRcdFwiJy4qPydcIiArXHRcdFx0Ly8gJycgc3RyaW5nXG5cdFx0XHRcIilcXFxccyo7P1wiLFxuXHRcdFx0XCJnXCJcblx0XHQpXG5cdFx0O1xuXG5cdHdoaWxlICgobWF0Y2ggPSByZWdleC5leGVjKHN0cikpICE9IG51bGwpIFxuXHR7XG5cdFx0dmFyIHZhbHVlID0gbWF0Y2gudmFsdWVcblx0XHRcdC5yZXBsYWNlKC9eWydcIl18WydcIl0kL2csICcnKSAvLyBzdHJpcCBxdW90ZXMgZnJvbSBlbmQgb2Ygc3RyaW5nc1xuXHRcdFx0O1xuXHRcdFxuXHRcdC8vIHRyeSB0byBwYXJzZSBhcnJheSB2YWx1ZVxuXHRcdGlmICh2YWx1ZSAhPSBudWxsICYmIGFycmF5UmVnZXgudGVzdCh2YWx1ZSkpXG5cdFx0e1xuXHRcdFx0dmFyIG0gPSBhcnJheVJlZ2V4LmV4ZWModmFsdWUpO1xuXHRcdFx0dmFsdWUgPSBtLnZhbHVlcy5sZW5ndGggPiAwID8gbS52YWx1ZXMuc3BsaXQoL1xccyosXFxzKi8pIDogW107XG5cdFx0fVxuXHRcdFxuXHRcdHJlc3VsdFttYXRjaC5uYW1lXSA9IHZhbHVlO1xuXHR9XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBXcmFwcyBlYWNoIGxpbmUgb2YgdGhlIHN0cmluZyBpbnRvIDxjb2RlLz4gdGFnIHdpdGggZ2l2ZW4gc3R5bGUgYXBwbGllZCB0byBpdC5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgIElucHV0IHN0cmluZy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjc3MgICBTdHlsZSBuYW1lIHRvIGFwcGx5IHRvIHRoZSBzdHJpbmcuXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyBpbnB1dCBzdHJpbmcgd2l0aCBlYWNoIGxpbmUgc3Vycm91bmRlZCBieSA8c3Bhbi8+IHRhZy5cbiAqL1xuZnVuY3Rpb24gd3JhcExpbmVzV2l0aENvZGUoc3RyLCBjc3MpXG57XG5cdGlmIChzdHIgPT0gbnVsbCB8fCBzdHIubGVuZ3RoID09IDAgfHwgc3RyID09ICdcXG4nKSBcblx0XHRyZXR1cm4gc3RyO1xuXG5cdHN0ciA9IHN0ci5yZXBsYWNlKC88L2csICcmbHQ7Jyk7XG5cblx0Ly8gUmVwbGFjZSB0d28gb3IgbW9yZSBzZXF1ZW50aWFsIHNwYWNlcyB3aXRoICZuYnNwOyBsZWF2aW5nIGxhc3Qgc3BhY2UgdW50b3VjaGVkLlxuXHRzdHIgPSBzdHIucmVwbGFjZSgvIHsyLH0vZywgZnVuY3Rpb24obSlcblx0e1xuXHRcdHZhciBzcGFjZXMgPSAnJztcblx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoIC0gMTsgaSsrKVxuXHRcdFx0c3BhY2VzICs9IHNoLmNvbmZpZy5zcGFjZTtcblx0XHRcblx0XHRyZXR1cm4gc3BhY2VzICsgJyAnO1xuXHR9KTtcblxuXHQvLyBTcGxpdCBlYWNoIGxpbmUgYW5kIGFwcGx5IDxzcGFuIGNsYXNzPVwiLi4uXCI+Li4uPC9zcGFuPiB0byB0aGVtIHNvIHRoYXRcblx0Ly8gbGVhZGluZyBzcGFjZXMgYXJlbid0IGluY2x1ZGVkLlxuXHRpZiAoY3NzICE9IG51bGwpIFxuXHRcdHN0ciA9IGVhY2hMaW5lKHN0ciwgZnVuY3Rpb24obGluZSlcblx0XHR7XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT0gMCkgXG5cdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFxuXHRcdFx0dmFyIHNwYWNlcyA9ICcnO1xuXHRcdFx0XG5cdFx0XHRsaW5lID0gbGluZS5yZXBsYWNlKC9eKCZuYnNwO3wgKSsvLCBmdW5jdGlvbihzKVxuXHRcdFx0e1xuXHRcdFx0XHRzcGFjZXMgPSBzO1xuXHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09IDApIFxuXHRcdFx0XHRyZXR1cm4gc3BhY2VzO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gc3BhY2VzICsgJzxjb2RlIGNsYXNzPVwiJyArIGNzcyArICdcIj4nICsgbGluZSArICc8L2NvZGU+Jztcblx0XHR9KTtcblxuXHRyZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBQYWRzIG51bWJlciB3aXRoIHplcm9zIHVudGlsIGl0J3MgbGVuZ3RoIGlzIHRoZSBzYW1lIGFzIGdpdmVuIGxlbmd0aC5cbiAqIFxuICogQHBhcmFtIHtOdW1iZXJ9IG51bWJlclx0TnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcdE1heCBzdHJpbmcgbGVuZ3RoIHdpdGguXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0UmV0dXJucyBhIHN0cmluZyBwYWRkZWQgd2l0aCBwcm9wZXIgYW1vdW50IG9mICcwJy5cbiAqL1xuZnVuY3Rpb24gcGFkTnVtYmVyKG51bWJlciwgbGVuZ3RoKVxue1xuXHR2YXIgcmVzdWx0ID0gbnVtYmVyLnRvU3RyaW5nKCk7XG5cdFxuXHR3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IGxlbmd0aClcblx0XHRyZXN1bHQgPSAnMCcgKyByZXN1bHQ7XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyB0YWJzIHdpdGggc3BhY2VzLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRTb3VyY2UgY29kZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0YWJTaXplXHRTaXplIG9mIHRoZSB0YWIuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0UmV0dXJucyBjb2RlIHdpdGggYWxsIHRhYnMgcmVwbGFjZXMgYnkgc3BhY2VzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzVGFicyhjb2RlLCB0YWJTaXplKVxue1xuXHR2YXIgdGFiID0gJyc7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRhYlNpemU7IGkrKylcblx0XHR0YWIgKz0gJyAnO1xuXG5cdHJldHVybiBjb2RlLnJlcGxhY2UoL1xcdC9nLCB0YWIpO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyB0YWJzIHdpdGggc21hcnQgc3BhY2VzLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZSAgICBDb2RlIHRvIGZpeCB0aGUgdGFicyBpbi5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0YWJTaXplIE51bWJlciBvZiBzcGFjZXMgaW4gYSBjb2x1bW4uXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgICBSZXR1cm5zIGNvZGUgd2l0aCBhbGwgdGFicyByZXBsYWNlcyB3aXRoIHJvcGVyIGFtb3VudCBvZiBzcGFjZXMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NTbWFydFRhYnMoY29kZSwgdGFiU2l6ZSlcbntcblx0dmFyIGxpbmVzID0gc3BsaXRMaW5lcyhjb2RlKSxcblx0XHR0YWIgPSAnXFx0Jyxcblx0XHRzcGFjZXMgPSAnJ1xuXHRcdDtcblx0XG5cdC8vIENyZWF0ZSBhIHN0cmluZyB3aXRoIDEwMDAgc3BhY2VzIHRvIGNvcHkgc3BhY2VzIGZyb20uLi4gXG5cdC8vIEl0J3MgYXNzdW1lZCB0aGF0IHRoZXJlIHdvdWxkIGJlIG5vIGluZGVudGF0aW9uIGxvbmdlciB0aGFuIHRoYXQuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgNTA7IGkrKykgXG5cdFx0c3BhY2VzICs9ICcgICAgICAgICAgICAgICAgICAgICc7IC8vIDIwIHNwYWNlcyAqIDUwXG5cdFx0XHRcblx0Ly8gVGhpcyBmdW5jdGlvbiBpbnNlcnRzIHNwZWNpZmllZCBhbW91bnQgb2Ygc3BhY2VzIGluIHRoZSBzdHJpbmdcblx0Ly8gd2hlcmUgYSB0YWIgaXMgd2hpbGUgcmVtb3ZpbmcgdGhhdCBnaXZlbiB0YWIuXG5cdGZ1bmN0aW9uIGluc2VydFNwYWNlcyhsaW5lLCBwb3MsIGNvdW50KVxuXHR7XG5cdFx0cmV0dXJuIGxpbmUuc3Vic3RyKDAsIHBvcylcblx0XHRcdCsgc3BhY2VzLnN1YnN0cigwLCBjb3VudClcblx0XHRcdCsgbGluZS5zdWJzdHIocG9zICsgMSwgbGluZS5sZW5ndGgpIC8vIHBvcyArIDEgd2lsbCBnZXQgcmlkIG9mIHRoZSB0YWJcblx0XHRcdDtcblx0fTtcblxuXHQvLyBHbyB0aHJvdWdoIGFsbCB0aGUgbGluZXMgYW5kIGRvIHRoZSAnc21hcnQgdGFicycgbWFnaWMuXG5cdGNvZGUgPSBlYWNoTGluZShjb2RlLCBmdW5jdGlvbihsaW5lKVxuXHR7XG5cdFx0aWYgKGxpbmUuaW5kZXhPZih0YWIpID09IC0xKSBcblx0XHRcdHJldHVybiBsaW5lO1xuXHRcdFxuXHRcdHZhciBwb3MgPSAwO1xuXHRcdFxuXHRcdHdoaWxlICgocG9zID0gbGluZS5pbmRleE9mKHRhYikpICE9IC0xKSBcblx0XHR7XG5cdFx0XHQvLyBUaGlzIGlzIHByZXR0eSBtdWNoIGFsbCB0aGVyZSBpcyB0byB0aGUgJ3NtYXJ0IHRhYnMnIGxvZ2ljLlxuXHRcdFx0Ly8gQmFzZWQgb24gdGhlIHBvc2l0aW9uIHdpdGhpbiB0aGUgbGluZSBhbmQgc2l6ZSBvZiBhIHRhYixcblx0XHRcdC8vIGNhbGN1bGF0ZSB0aGUgYW1vdW50IG9mIHNwYWNlcyB3ZSBuZWVkIHRvIGluc2VydC5cblx0XHRcdHZhciBzcGFjZXMgPSB0YWJTaXplIC0gcG9zICUgdGFiU2l6ZTtcblx0XHRcdGxpbmUgPSBpbnNlcnRTcGFjZXMobGluZSwgcG9zLCBzcGFjZXMpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbGluZTtcblx0fSk7XG5cdFxuXHRyZXR1cm4gY29kZTtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgdmFyaW91cyBzdHJpbmcgZml4ZXMgYmFzZWQgb24gY29uZmlndXJhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZml4SW5wdXRTdHJpbmcoc3RyKVxue1xuXHR2YXIgYnIgPSAvPGJyXFxzKlxcLz8+fCZsdDticlxccypcXC8/Jmd0Oy9naTtcblx0XG5cdGlmIChzaC5jb25maWcuYmxvZ2dlck1vZGUgPT0gdHJ1ZSlcblx0XHRzdHIgPSBzdHIucmVwbGFjZShiciwgJ1xcbicpO1xuXG5cdGlmIChzaC5jb25maWcuc3RyaXBCcnMgPT0gdHJ1ZSlcblx0XHRzdHIgPSBzdHIucmVwbGFjZShiciwgJycpO1xuXHRcdFxuXHRyZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCB3aGl0ZSBzcGFjZSBhdCB0aGUgYmVnaW5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZy5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgIFN0cmluZyB0byB0cmltLlxuICogQHJldHVybiB7U3RyaW5nfSAgICAgIFJldHVybnMgc3RyaW5nIHdpdGhvdXQgbGVhZGluZyBhbmQgZm9sbG93aW5nIHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMuXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKVxue1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn07XG5cbi8qKlxuICogVW5pbmRlbnRzIGEgYmxvY2sgb2YgdGV4dCBieSB0aGUgbG93ZXN0IGNvbW1vbiBpbmRlbnQgYW1vdW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgIFRleHQgdG8gdW5pbmRlbnQuXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyB1bmluZGVudGVkIHRleHQgYmxvY2suXG4gKi9cbmZ1bmN0aW9uIHVuaW5kZW50KHN0cilcbntcblx0dmFyIGxpbmVzID0gc3BsaXRMaW5lcyhmaXhJbnB1dFN0cmluZyhzdHIpKSxcblx0XHRpbmRlbnRzID0gbmV3IEFycmF5KCksXG5cdFx0cmVnZXggPSAvXlxccyovLFxuXHRcdG1pbiA9IDEwMDBcblx0XHQ7XG5cdFxuXHQvLyBnbyB0aHJvdWdoIGV2ZXJ5IGxpbmUgYW5kIGNoZWNrIGZvciBjb21tb24gbnVtYmVyIG9mIGluZGVudHNcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGggJiYgbWluID4gMDsgaSsrKSBcblx0e1xuXHRcdHZhciBsaW5lID0gbGluZXNbaV07XG5cdFx0XG5cdFx0aWYgKHRyaW0obGluZSkubGVuZ3RoID09IDApIFxuXHRcdFx0Y29udGludWU7XG5cdFx0XG5cdFx0dmFyIG1hdGNoZXMgPSByZWdleC5leGVjKGxpbmUpO1xuXHRcdFxuXHRcdC8vIEluIHRoZSBldmVudCB0aGF0IGp1c3Qgb25lIGxpbmUgZG9lc24ndCBoYXZlIGxlYWRpbmcgd2hpdGUgc3BhY2Vcblx0XHQvLyB3ZSBjYW4ndCB1bmluZGVudCBhbnl0aGluZywgc28gYmFpbCBjb21wbGV0ZWx5LlxuXHRcdGlmIChtYXRjaGVzID09IG51bGwpIFxuXHRcdFx0cmV0dXJuIHN0cjtcblx0XHRcdFxuXHRcdG1pbiA9IE1hdGgubWluKG1hdGNoZXNbMF0ubGVuZ3RoLCBtaW4pO1xuXHR9XG5cdFxuXHQvLyB0cmltIG1pbmltdW0gY29tbW9uIG51bWJlciBvZiB3aGl0ZSBzcGFjZSBmcm9tIHRoZSBiZWdpbmluZyBvZiBldmVyeSBsaW5lXG5cdGlmIChtaW4gPiAwKSBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSBcblx0XHRcdGxpbmVzW2ldID0gbGluZXNbaV0uc3Vic3RyKG1pbik7XG5cdFxuXHRyZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59O1xuXG4vKipcbiAqIENhbGxiYWNrIG1ldGhvZCBmb3IgQXJyYXkuc29ydCgpIHdoaWNoIHNvcnRzIG1hdGNoZXMgYnlcbiAqIGluZGV4IHBvc2l0aW9uIGFuZCB0aGVuIGJ5IGxlbmd0aC5cbiAqIFxuICogQHBhcmFtIHtNYXRjaH0gbTFcdExlZnQgb2JqZWN0LlxuICogQHBhcmFtIHtNYXRjaH0gbTIgICAgUmlnaHQgb2JqZWN0LlxuICogQHJldHVybiB7TnVtYmVyfSAgICAgUmV0dXJucyAtMSwgMCBvciAtMSBhcyBhIGNvbXBhcmlzb24gcmVzdWx0LlxuICovXG5mdW5jdGlvbiBtYXRjaGVzU29ydENhbGxiYWNrKG0xLCBtMilcbntcblx0Ly8gc29ydCBtYXRjaGVzIGJ5IGluZGV4IGZpcnN0XG5cdGlmKG0xLmluZGV4IDwgbTIuaW5kZXgpXG5cdFx0cmV0dXJuIC0xO1xuXHRlbHNlIGlmKG0xLmluZGV4ID4gbTIuaW5kZXgpXG5cdFx0cmV0dXJuIDE7XG5cdGVsc2Vcblx0e1xuXHRcdC8vIGlmIGluZGV4IGlzIHRoZSBzYW1lLCBzb3J0IGJ5IGxlbmd0aFxuXHRcdGlmKG0xLmxlbmd0aCA8IG0yLmxlbmd0aClcblx0XHRcdHJldHVybiAtMTtcblx0XHRlbHNlIGlmKG0xLmxlbmd0aCA+IG0yLmxlbmd0aClcblx0XHRcdHJldHVybiAxO1xuXHR9XG5cdFxuXHRyZXR1cm4gMDtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIG9uIHByb3ZpZGVkIGNvZGUgYW5kIHJldHVybnMgYWxsXG4gKiBtYXRjaGVzIHRoYXQgYXJlIGZvdW5kLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZSAgICBDb2RlIHRvIGV4ZWN1dGUgcmVndWxhciBleHByZXNzaW9uIG9uLlxuICogQHBhcmFtIHtPYmplY3R9IHJlZ2V4ICAgUmVndWxhciBleHByZXNzaW9uIGl0ZW0gaW5mbyBmcm9tIDxjb2RlPnJlZ2V4TGlzdDwvY29kZT4gY29sbGVjdGlvbi5cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgIFJldHVybnMgYSBsaXN0IG9mIE1hdGNoIG9iamVjdHMuXG4gKi8gXG5mdW5jdGlvbiBnZXRNYXRjaGVzKGNvZGUsIHJlZ2V4SW5mbylcbntcblx0ZnVuY3Rpb24gZGVmYXVsdEFkZChtYXRjaCwgcmVnZXhJbmZvKVxuXHR7XG5cdFx0cmV0dXJuIG1hdGNoWzBdO1xuXHR9O1xuXHRcblx0dmFyIGluZGV4ID0gMCxcblx0XHRtYXRjaCA9IG51bGwsXG5cdFx0bWF0Y2hlcyA9IFtdLFxuXHRcdGZ1bmMgPSByZWdleEluZm8uZnVuYyA/IHJlZ2V4SW5mby5mdW5jIDogZGVmYXVsdEFkZFxuXHRcdDtcblx0XG5cdHdoaWxlKChtYXRjaCA9IHJlZ2V4SW5mby5yZWdleC5leGVjKGNvZGUpKSAhPSBudWxsKVxuXHR7XG5cdFx0dmFyIHJlc3VsdE1hdGNoID0gZnVuYyhtYXRjaCwgcmVnZXhJbmZvKTtcblx0XHRcblx0XHRpZiAodHlwZW9mKHJlc3VsdE1hdGNoKSA9PSAnc3RyaW5nJylcblx0XHRcdHJlc3VsdE1hdGNoID0gW25ldyBzaC5NYXRjaChyZXN1bHRNYXRjaCwgbWF0Y2guaW5kZXgsIHJlZ2V4SW5mby5jc3MpXTtcblxuXHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHRNYXRjaCk7XG5cdH1cblx0XG5cdHJldHVybiBtYXRjaGVzO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbGwgVVJMcyBpbiB0aGUgY29kZSBpbnRvIDxhLz4gdGFncy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlIElucHV0IGNvZGUuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgY29kZSB3aXRoIDwvYT4gdGFncy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1VybHMoY29kZSlcbntcblx0dmFyIGd0ID0gLyguKikoKCZndDt8Jmx0OykuKikvO1xuXHRcblx0cmV0dXJuIGNvZGUucmVwbGFjZShzaC5yZWdleExpYi51cmwsIGZ1bmN0aW9uKG0pXG5cdHtcblx0XHR2YXIgc3VmZml4ID0gJycsXG5cdFx0XHRtYXRjaCA9IG51bGxcblx0XHRcdDtcblx0XHRcblx0XHQvLyBXZSBpbmNsdWRlICZsdDsgYW5kICZndDsgaW4gdGhlIFVSTCBmb3IgdGhlIGNvbW1vbiBjYXNlcyBsaWtlIDxodHRwOi8vZ29vZ2xlLmNvbT5cblx0XHQvLyBUaGUgcHJvYmxlbSBpcyB0aGF0IHRoZXkgZ2V0IHRyYW5zZm9ybWVkIGludG8gJmx0O2h0dHA6Ly9nb29nbGUuY29tJmd0O1xuXHRcdC8vIFdoZXJlIGFzICZndDsgZWFzaWx5IGxvb2tzIGxpa2UgcGFydCBvZiB0aGUgVVJMIHN0cmluZy5cblx0XG5cdFx0aWYgKG1hdGNoID0gZ3QuZXhlYyhtKSlcblx0XHR7XG5cdFx0XHRtID0gbWF0Y2hbMV07XG5cdFx0XHRzdWZmaXggPSBtYXRjaFsyXTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuICc8YSBocmVmPVwiJyArIG0gKyAnXCI+JyArIG0gKyAnPC9hPicgKyBzdWZmaXg7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBGaW5kcyBhbGwgPFNDUklQVCBUWVBFPVwic3ludGF4aGlnaGxpZ2h0ZXJcIiAvPiBlbGVtZW50c3MuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhcnJheSBvZiBhbGwgZm91bmQgU3ludGF4SGlnaGxpZ2h0ZXIgdGFncy5cbiAqL1xuZnVuY3Rpb24gZ2V0U3ludGF4SGlnaGxpZ2h0ZXJTY3JpcHRUYWdzKClcbntcblx0dmFyIHRhZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksXG5cdFx0cmVzdWx0ID0gW11cblx0XHQ7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRhZ3MubGVuZ3RoOyBpKyspXG5cdFx0aWYgKHRhZ3NbaV0udHlwZSA9PSAnc3ludGF4aGlnaGxpZ2h0ZXInKVxuXHRcdFx0cmVzdWx0LnB1c2godGFnc1tpXSk7XG5cdFx0XHRcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogU3RyaXBzIDwhW0NEQVRBW11dPiBmcm9tIDxTQ1JJUFQgLz4gY29udGVudCBiZWNhdXNlIGl0IHNob3VsZCBiZSB1c2VkXG4gKiB0aGVyZSBpbiBtb3N0IGNhc2VzIGZvciBYSFRNTCBjb21wbGlhbmNlLlxuICogQHBhcmFtIHtTdHJpbmd9IG9yaWdpbmFsXHRJbnB1dCBjb2RlLlxuICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIGNvZGUgd2l0aG91dCBsZWFkaW5nIDwhW0NEQVRBW11dPiB0YWdzLlxuICovXG5mdW5jdGlvbiBzdHJpcENEYXRhKG9yaWdpbmFsKVxue1xuXHR2YXIgbGVmdCA9ICc8IVtDREFUQVsnLFxuXHRcdHJpZ2h0ID0gJ11dPicsXG5cdFx0Ly8gZm9yIHNvbWUgcmVhc29uIElFIGluc2VydHMgc29tZSBsZWFkaW5nIGJsYW5rcyBoZXJlXG5cdFx0Y29weSA9IHRyaW0ob3JpZ2luYWwpLFxuXHRcdGNoYW5nZWQgPSBmYWxzZSxcblx0XHRsZWZ0TGVuZ3RoID0gbGVmdC5sZW5ndGgsXG5cdFx0cmlnaHRMZW5ndGggPSByaWdodC5sZW5ndGhcblx0XHQ7XG5cdFxuXHRpZiAoY29weS5pbmRleE9mKGxlZnQpID09IDApXG5cdHtcblx0XHRjb3B5ID0gY29weS5zdWJzdHJpbmcobGVmdExlbmd0aCk7XG5cdFx0Y2hhbmdlZCA9IHRydWU7XG5cdH1cblx0XG5cdHZhciBjb3B5TGVuZ3RoID0gY29weS5sZW5ndGg7XG5cdFxuXHRpZiAoY29weS5pbmRleE9mKHJpZ2h0KSA9PSBjb3B5TGVuZ3RoIC0gcmlnaHRMZW5ndGgpXG5cdHtcblx0XHRjb3B5ID0gY29weS5zdWJzdHJpbmcoMCwgY29weUxlbmd0aCAtIHJpZ2h0TGVuZ3RoKTtcblx0XHRjaGFuZ2VkID0gdHJ1ZTtcblx0fVxuXHRcblx0cmV0dXJuIGNoYW5nZWQgPyBjb3B5IDogb3JpZ2luYWw7XG59O1xuXG5cbi8qKlxuICogUXVpY2sgY29kZSBtb3VzZSBkb3VibGUgY2xpY2sgaGFuZGxlci5cbiAqL1xuZnVuY3Rpb24gcXVpY2tDb2RlSGFuZGxlcihlKVxue1xuXHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQsXG5cdFx0aGlnaGxpZ2h0ZXJEaXYgPSBmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsICcuc3ludGF4aGlnaGxpZ2h0ZXInKSxcblx0XHRjb250YWluZXIgPSBmaW5kUGFyZW50RWxlbWVudCh0YXJnZXQsICcuY29udGFpbmVyJyksXG5cdFx0dGV4dGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpLFxuXHRcdGhpZ2hsaWdodGVyXG5cdFx0O1xuXG5cdGlmICghY29udGFpbmVyIHx8ICFoaWdobGlnaHRlckRpdiB8fCBmaW5kRWxlbWVudChjb250YWluZXIsICd0ZXh0YXJlYScpKVxuXHRcdHJldHVybjtcblxuXHRoaWdobGlnaHRlciA9IGdldEhpZ2hsaWdodGVyQnlJZChoaWdobGlnaHRlckRpdi5pZCk7XG5cdFxuXHQvLyBhZGQgc291cmNlIGNsYXNzIG5hbWVcblx0YWRkQ2xhc3MoaGlnaGxpZ2h0ZXJEaXYsICdzb3VyY2UnKTtcblxuXHQvLyBIYXZlIHRvIGdvIG92ZXIgZWFjaCBsaW5lIGFuZCBncmFiIGl0J3MgdGV4dCwgY2FuJ3QganVzdCBkbyBpdCBvbiB0aGVcblx0Ly8gY29udGFpbmVyIGJlY2F1c2UgRmlyZWZveCBsb3NlcyBhbGwgXFxuIHdoZXJlIGFzIFdlYmtpdCBkb2Vzbid0LlxuXHR2YXIgbGluZXMgPSBjb250YWluZXIuY2hpbGROb2Rlcyxcblx0XHRjb2RlID0gW11cblx0XHQ7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxuXHRcdGNvZGUucHVzaChsaW5lc1tpXS5pbm5lclRleHQgfHwgbGluZXNbaV0udGV4dENvbnRlbnQpO1xuXHRcblx0Ly8gdXNpbmcgXFxyIGluc3RlYWQgb2YgXFxyIG9yIFxcclxcbiBtYWtlcyB0aGlzIHdvcmsgZXF1YWxseSB3ZWxsIG9uIElFLCBGRiBhbmQgV2Via2l0XG5cdGNvZGUgPSBjb2RlLmpvaW4oJ1xccicpO1xuXG4gICAgLy8gRm9yIFdlYmtpdCBicm93c2VycywgcmVwbGFjZSBuYnNwIHdpdGggYSBicmVha2luZyBzcGFjZVxuICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL1xcdTAwYTAvZywgXCIgXCIpO1xuXHRcblx0Ly8gaW5qZWN0IDx0ZXh0YXJlYS8+IHRhZ1xuXHR0ZXh0YXJlYS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjb2RlKSk7XG5cdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cdFxuXHQvLyBwcmVzZWxlY3QgYWxsIHRleHRcblx0dGV4dGFyZWEuZm9jdXMoKTtcblx0dGV4dGFyZWEuc2VsZWN0KCk7XG5cdFxuXHQvLyBzZXQgdXAgaGFuZGxlciBmb3IgbG9zdCBmb2N1c1xuXHRhdHRhY2hFdmVudCh0ZXh0YXJlYSwgJ2JsdXInLCBmdW5jdGlvbihlKVxuXHR7XG5cdFx0dGV4dGFyZWEucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0ZXh0YXJlYSk7XG5cdFx0cmVtb3ZlQ2xhc3MoaGlnaGxpZ2h0ZXJEaXYsICdzb3VyY2UnKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIE1hdGNoIG9iamVjdC5cbiAqL1xuc2guTWF0Y2ggPSBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNzcylcbntcblx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR0aGlzLmluZGV4ID0gaW5kZXg7XG5cdHRoaXMubGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXHR0aGlzLmNzcyA9IGNzcztcblx0dGhpcy5icnVzaE5hbWUgPSBudWxsO1xufTtcblxuc2guTWF0Y2gucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKVxue1xuXHRyZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cbi8qKlxuICogU2ltdWxhdGVzIEhUTUwgY29kZSB3aXRoIGEgc2NyaXB0aW5nIGxhbmd1YWdlIGVtYmVkZGVkLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc2NyaXB0QnJ1c2hOYW1lIEJydXNoIG5hbWUgb2YgdGhlIHNjcmlwdGluZyBsYW5ndWFnZS5cbiAqL1xuc2guSHRtbFNjcmlwdCA9IGZ1bmN0aW9uKHNjcmlwdEJydXNoTmFtZSlcbntcblx0dmFyIGJydXNoQ2xhc3MgPSBmaW5kQnJ1c2goc2NyaXB0QnJ1c2hOYW1lKSxcblx0XHRzY3JpcHRCcnVzaCxcblx0XHR4bWxCcnVzaCA9IG5ldyBzaC5icnVzaGVzLlhtbCgpLFxuXHRcdGJyYWNrZXRzUmVnZXggPSBudWxsLFxuXHRcdHJlZiA9IHRoaXMsXG5cdFx0bWV0aG9kc1RvRXhwb3NlID0gJ2dldERpdiBnZXRIdG1sIGluaXQnLnNwbGl0KCcgJylcblx0XHQ7XG5cblx0aWYgKGJydXNoQ2xhc3MgPT0gbnVsbClcblx0XHRyZXR1cm47XG5cdFxuXHRzY3JpcHRCcnVzaCA9IG5ldyBicnVzaENsYXNzKCk7XG5cdFxuXHRmb3IodmFyIGkgPSAwOyBpIDwgbWV0aG9kc1RvRXhwb3NlLmxlbmd0aDsgaSsrKVxuXHRcdC8vIG1ha2UgYSBjbG9zdXJlIHNvIHdlIGRvbid0IGxvc2UgdGhlIG5hbWUgYWZ0ZXIgaSBjaGFuZ2VzXG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5hbWUgPSBtZXRob2RzVG9FeHBvc2VbaV07XG5cdFx0XHRcblx0XHRcdHJlZltuYW1lXSA9IGZ1bmN0aW9uKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHhtbEJydXNoW25hbWVdLmFwcGx5KHhtbEJydXNoLCBhcmd1bWVudHMpO1xuXHRcdFx0fTtcblx0XHR9KSgpO1xuXHRcblx0aWYgKHNjcmlwdEJydXNoLmh0bWxTY3JpcHQgPT0gbnVsbClcblx0e1xuXHRcdGFsZXJ0KHNoLmNvbmZpZy5zdHJpbmdzLmJydXNoTm90SHRtbFNjcmlwdCArIHNjcmlwdEJydXNoTmFtZSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdFxuXHR4bWxCcnVzaC5yZWdleExpc3QucHVzaChcblx0XHR7IHJlZ2V4OiBzY3JpcHRCcnVzaC5odG1sU2NyaXB0LmNvZGUsIGZ1bmM6IHByb2Nlc3MgfVxuXHQpO1xuXHRcblx0ZnVuY3Rpb24gb2Zmc2V0TWF0Y2hlcyhtYXRjaGVzLCBvZmZzZXQpXG5cdHtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG1hdGNoZXMubGVuZ3RoOyBqKyspIFxuXHRcdFx0bWF0Y2hlc1tqXS5pbmRleCArPSBvZmZzZXQ7XG5cdH1cblx0XG5cdGZ1bmN0aW9uIHByb2Nlc3MobWF0Y2gsIGluZm8pXG5cdHtcblx0XHR2YXIgY29kZSA9IG1hdGNoLmNvZGUsXG5cdFx0XHRtYXRjaGVzID0gW10sXG5cdFx0XHRyZWdleExpc3QgPSBzY3JpcHRCcnVzaC5yZWdleExpc3QsXG5cdFx0XHRvZmZzZXQgPSBtYXRjaC5pbmRleCArIG1hdGNoLmxlZnQubGVuZ3RoLFxuXHRcdFx0aHRtbFNjcmlwdCA9IHNjcmlwdEJydXNoLmh0bWxTY3JpcHQsXG5cdFx0XHRyZXN1bHRcblx0XHRcdDtcblxuXHRcdC8vIGFkZCBhbGwgbWF0Y2hlcyBmcm9tIHRoZSBjb2RlXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZWdleExpc3QubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0cmVzdWx0ID0gZ2V0TWF0Y2hlcyhjb2RlLCByZWdleExpc3RbaV0pO1xuXHRcdFx0b2Zmc2V0TWF0Y2hlcyhyZXN1bHQsIG9mZnNldCk7XG5cdFx0XHRtYXRjaGVzID0gbWF0Y2hlcy5jb25jYXQocmVzdWx0KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gYWRkIGxlZnQgc2NyaXB0IGJyYWNrZXRcblx0XHRpZiAoaHRtbFNjcmlwdC5sZWZ0ICE9IG51bGwgJiYgbWF0Y2gubGVmdCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdHJlc3VsdCA9IGdldE1hdGNoZXMobWF0Y2gubGVmdCwgaHRtbFNjcmlwdC5sZWZ0KTtcblx0XHRcdG9mZnNldE1hdGNoZXMocmVzdWx0LCBtYXRjaC5pbmRleCk7XG5cdFx0XHRtYXRjaGVzID0gbWF0Y2hlcy5jb25jYXQocmVzdWx0KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gYWRkIHJpZ2h0IHNjcmlwdCBicmFja2V0XG5cdFx0aWYgKGh0bWxTY3JpcHQucmlnaHQgIT0gbnVsbCAmJiBtYXRjaC5yaWdodCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdHJlc3VsdCA9IGdldE1hdGNoZXMobWF0Y2gucmlnaHQsIGh0bWxTY3JpcHQucmlnaHQpO1xuXHRcdFx0b2Zmc2V0TWF0Y2hlcyhyZXN1bHQsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGFzdEluZGV4T2YobWF0Y2gucmlnaHQpKTtcblx0XHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHQpO1xuXHRcdH1cblx0XHRcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG1hdGNoZXMubGVuZ3RoOyBqKyspXG5cdFx0XHRtYXRjaGVzW2pdLmJydXNoTmFtZSA9IGJydXNoQ2xhc3MuYnJ1c2hOYW1lO1xuXHRcdFx0XG5cdFx0cmV0dXJuIG1hdGNoZXM7XG5cdH1cbn07XG5cbi8qKlxuICogTWFpbiBIaWdobGl0aGVyIGNsYXNzLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnNoLkhpZ2hsaWdodGVyID0gZnVuY3Rpb24oKVxue1xuXHQvLyBub3QgcHV0dGluZyBhbnkgY29kZSBpbiBoZXJlIGJlY2F1c2Ugb2YgdGhlIHByb3RvdHlwZSBpbmhlcml0YW5jZVxufTtcblxuc2guSGlnaGxpZ2h0ZXIucHJvdG90eXBlID0ge1xuXHQvKipcblx0ICogUmV0dXJucyB2YWx1ZSBvZiB0aGUgcGFyYW1ldGVyIHBhc3NlZCB0byB0aGUgaGlnaGxpZ2h0ZXIuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXHRcdFx0XHROYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0VmFsdWVcdFx0RGVmYXVsdCB2YWx1ZS5cblx0ICogQHJldHVybiB7T2JqZWN0fVx0XHRcdFx0XHRSZXR1cm5zIGZvdW5kIHZhbHVlIG9yIGRlZmF1bHQgdmFsdWUgb3RoZXJ3aXNlLlxuXHQgKi9cblx0Z2V0UGFyYW06IGZ1bmN0aW9uKG5hbWUsIGRlZmF1bHRWYWx1ZSlcblx0e1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLnBhcmFtc1tuYW1lXTtcblx0XHRyZXR1cm4gdG9Cb29sZWFuKHJlc3VsdCA9PSBudWxsID8gZGVmYXVsdFZhbHVlIDogcmVzdWx0KTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTaG9ydGN1dCB0byBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCkuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXHRcdE5hbWUgb2YgdGhlIGVsZW1lbnQgdG8gY3JlYXRlIChESVYsIEEsIGV0YykuXG5cdCAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVx0UmV0dXJucyBuZXcgSFRNTCBlbGVtZW50LlxuXHQgKi9cblx0Y3JlYXRlOiBmdW5jdGlvbihuYW1lKVxuXHR7XG5cdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQXBwbGllcyBhbGwgcmVndWxhciBleHByZXNzaW9uIHRvIHRoZSBjb2RlIGFuZCBzdG9yZXMgYWxsIGZvdW5kXG5cdCAqIG1hdGNoZXMgaW4gdGhlIGB0aGlzLm1hdGNoZXNgIGFycmF5LlxuXHQgKiBAcGFyYW0ge0FycmF5fSByZWdleExpc3RcdFx0TGlzdCBvZiByZWd1bGFyIGV4cHJlc3Npb25zLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRcdFNvdXJjZSBjb2RlLlxuXHQgKiBAcmV0dXJuIHtBcnJheX1cdFx0XHRcdFJldHVybnMgbGlzdCBvZiBtYXRjaGVzLlxuXHQgKi9cblx0ZmluZE1hdGNoZXM6IGZ1bmN0aW9uKHJlZ2V4TGlzdCwgY29kZSlcblx0e1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHRcblx0XHRpZiAocmVnZXhMaXN0ICE9IG51bGwpXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2V4TGlzdC5sZW5ndGg7IGkrKykgXG5cdFx0XHRcdC8vIEJVRzogbGVuZ3RoIHJldHVybnMgbGVuKzEgZm9yIGFycmF5IGlmIG1ldGhvZHMgYWRkZWQgdG8gcHJvdG90eXBlIGNoYWluIChvaXNpbmdAZ21haWwuY29tKVxuXHRcdFx0XHRpZiAodHlwZW9mIChyZWdleExpc3RbaV0pID09IFwib2JqZWN0XCIpXG5cdFx0XHRcdFx0cmVzdWx0ID0gcmVzdWx0LmNvbmNhdChnZXRNYXRjaGVzKGNvZGUsIHJlZ2V4TGlzdFtpXSkpO1xuXHRcdFxuXHRcdC8vIHNvcnQgYW5kIHJlbW92ZSBuZXN0ZWQgdGhlIG1hdGNoZXNcblx0XHRyZXR1cm4gdGhpcy5yZW1vdmVOZXN0ZWRNYXRjaGVzKHJlc3VsdC5zb3J0KG1hdGNoZXNTb3J0Q2FsbGJhY2spKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDaGVja3MgdG8gc2VlIGlmIGFueSBvZiB0aGUgbWF0Y2hlcyBhcmUgaW5zaWRlIG9mIG90aGVyIG1hdGNoZXMuIFxuXHQgKiBUaGlzIHByb2Nlc3Mgd291bGQgZ2V0IHJpZCBvZiBoaWdobGlndGVkIHN0cmluZ3MgaW5zaWRlIGNvbW1lbnRzLCBcblx0ICoga2V5d29yZHMgaW5zaWRlIHN0cmluZ3MgYW5kIHNvIG9uLlxuXHQgKi9cblx0cmVtb3ZlTmVzdGVkTWF0Y2hlczogZnVuY3Rpb24obWF0Y2hlcylcblx0e1xuXHRcdC8vIE9wdGltaXplZCBieSBKb3NlIFByYWRvIChodHRwOi8vam9zZXByYWRvLmNvbSlcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIFxuXHRcdHsgXG5cdFx0XHRpZiAobWF0Y2hlc1tpXSA9PT0gbnVsbClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciBpdGVtSSA9IG1hdGNoZXNbaV0sXG5cdFx0XHRcdGl0ZW1JRW5kUG9zID0gaXRlbUkuaW5kZXggKyBpdGVtSS5sZW5ndGhcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBqID0gaSArIDE7IGogPCBtYXRjaGVzLmxlbmd0aCAmJiBtYXRjaGVzW2ldICE9PSBudWxsOyBqKyspIFxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgaXRlbUogPSBtYXRjaGVzW2pdO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGl0ZW1KID09PSBudWxsKSBcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0ZWxzZSBpZiAoaXRlbUouaW5kZXggPiBpdGVtSUVuZFBvcykgXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGVsc2UgaWYgKGl0ZW1KLmluZGV4ID09IGl0ZW1JLmluZGV4ICYmIGl0ZW1KLmxlbmd0aCA+IGl0ZW1JLmxlbmd0aClcblx0XHRcdFx0XHRtYXRjaGVzW2ldID0gbnVsbDtcblx0XHRcdFx0ZWxzZSBpZiAoaXRlbUouaW5kZXggPj0gaXRlbUkuaW5kZXggJiYgaXRlbUouaW5kZXggPCBpdGVtSUVuZFBvcykgXG5cdFx0XHRcdFx0bWF0Y2hlc1tqXSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBtYXRjaGVzO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyBpbnRlZ2VyIGxpbmUgbnVtYmVycyBzdGFydGluZyBmcm9tIHRoZSAnZmlyc3QtbGluZScgcGFyYW0uXG5cdCAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFycmF5IG9mIGludGVnZXJzLlxuXHQgKi9cblx0ZmlndXJlT3V0TGluZU51bWJlcnM6IGZ1bmN0aW9uKGNvZGUpXG5cdHtcblx0XHR2YXIgbGluZXMgPSBbXSxcblx0XHRcdGZpcnN0TGluZSA9IHBhcnNlSW50KHRoaXMuZ2V0UGFyYW0oJ2ZpcnN0LWxpbmUnKSlcblx0XHRcdDtcblx0XHRcblx0XHRlYWNoTGluZShjb2RlLCBmdW5jdGlvbihsaW5lLCBpbmRleClcblx0XHR7XG5cdFx0XHRsaW5lcy5wdXNoKGluZGV4ICsgZmlyc3RMaW5lKTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gbGluZXM7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyBpZiBzcGVjaWZpZWQgbGluZSBudW1iZXIgaXMgaW4gdGhlIGhpZ2hsaWdodGVkIGxpc3QuXG5cdCAqL1xuXHRpc0xpbmVIaWdobGlnaHRlZDogZnVuY3Rpb24obGluZU51bWJlcilcblx0e1xuXHRcdHZhciBsaXN0ID0gdGhpcy5nZXRQYXJhbSgnaGlnaGxpZ2h0JywgW10pO1xuXHRcdFxuXHRcdGlmICh0eXBlb2YobGlzdCkgIT0gJ29iamVjdCcgJiYgbGlzdC5wdXNoID09IG51bGwpIFxuXHRcdFx0bGlzdCA9IFsgbGlzdCBdO1xuXHRcdFxuXHRcdHJldHVybiBpbmRleE9mKGxpc3QsIGxpbmVOdW1iZXIudG9TdHJpbmcoKSkgIT0gLTE7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciBhIHNpbmdsZSBsaW5lIG9mIGNvZGUgd2hpbGUgZGV0ZXJtaW5pbmcgYWx0ZXJuYXRpbmcgbGluZSBzdHlsZS5cblx0ICogQHBhcmFtIHtJbnRlZ2VyfSBsaW5lTnVtYmVyXHRMaW5lIG51bWJlci5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgTGluZVx0SFRNTCBtYXJrdXAuXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRcdFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdCAqL1xuXHRnZXRMaW5lSHRtbDogZnVuY3Rpb24obGluZUluZGV4LCBsaW5lTnVtYmVyLCBjb2RlKVxuXHR7XG5cdFx0dmFyIGNsYXNzZXMgPSBbXG5cdFx0XHQnbGluZScsXG5cdFx0XHQnbnVtYmVyJyArIGxpbmVOdW1iZXIsXG5cdFx0XHQnaW5kZXgnICsgbGluZUluZGV4LFxuXHRcdFx0J2FsdCcgKyAobGluZU51bWJlciAlIDIgPT0gMCA/IDEgOiAyKS50b1N0cmluZygpXG5cdFx0XTtcblx0XHRcblx0XHRpZiAodGhpcy5pc0xpbmVIaWdobGlnaHRlZChsaW5lTnVtYmVyKSlcblx0XHQgXHRjbGFzc2VzLnB1c2goJ2hpZ2hsaWdodGVkJyk7XG5cdFx0XG5cdFx0aWYgKGxpbmVOdW1iZXIgPT0gMClcblx0XHRcdGNsYXNzZXMucHVzaCgnYnJlYWsnKTtcblx0XHRcdFxuXHRcdHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIj4nICsgY29kZSArICc8L2Rpdj4nO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgbGluZSBudW1iZXIgY29sdW1uLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRcdENvbXBsZXRlIGNvZGUgSFRNTCBtYXJrdXAuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGxpbmVOdW1iZXJzXHRDYWxjdWxhdGVkIGxpbmUgbnVtYmVycy5cblx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0UmV0dXJucyBIVE1MIG1hcmt1cC5cblx0ICovXG5cdGdldExpbmVOdW1iZXJzSHRtbDogZnVuY3Rpb24oY29kZSwgbGluZU51bWJlcnMpXG5cdHtcblx0XHR2YXIgaHRtbCA9ICcnLFxuXHRcdFx0Y291bnQgPSBzcGxpdExpbmVzKGNvZGUpLmxlbmd0aCxcblx0XHRcdGZpcnN0TGluZSA9IHBhcnNlSW50KHRoaXMuZ2V0UGFyYW0oJ2ZpcnN0LWxpbmUnKSksXG5cdFx0XHRwYWQgPSB0aGlzLmdldFBhcmFtKCdwYWQtbGluZS1udW1iZXJzJylcblx0XHRcdDtcblx0XHRcblx0XHRpZiAocGFkID09IHRydWUpXG5cdFx0XHRwYWQgPSAoZmlyc3RMaW5lICsgY291bnQgLSAxKS50b1N0cmluZygpLmxlbmd0aDtcblx0XHRlbHNlIGlmIChpc05hTihwYWQpID09IHRydWUpXG5cdFx0XHRwYWQgPSAwO1xuXHRcdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKVxuXHRcdHtcblx0XHRcdHZhciBsaW5lTnVtYmVyID0gbGluZU51bWJlcnMgPyBsaW5lTnVtYmVyc1tpXSA6IGZpcnN0TGluZSArIGksXG5cdFx0XHRcdGNvZGUgPSBsaW5lTnVtYmVyID09IDAgPyBzaC5jb25maWcuc3BhY2UgOiBwYWROdW1iZXIobGluZU51bWJlciwgcGFkKVxuXHRcdFx0XHQ7XG5cdFx0XHRcdFxuXHRcdFx0aHRtbCArPSB0aGlzLmdldExpbmVIdG1sKGksIGxpbmVOdW1iZXIsIGNvZGUpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTcGxpdHMgYmxvY2sgb2YgdGV4dCBpbnRvIGluZGl2aWR1YWwgRElWIGxpbmVzLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRcdENvZGUgdG8gaGlnaGxpZ2h0LlxuXHQgKiBAcGFyYW0ge0FycmF5fSBsaW5lTnVtYmVyc1x0Q2FsY3VsYXRlZCBsaW5lIG51bWJlcnMuXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRcdFJldHVybnMgaGlnaGxpZ2h0ZWQgY29kZSBpbiBIVE1MIGZvcm0uXG5cdCAqL1xuXHRnZXRDb2RlTGluZXNIdG1sOiBmdW5jdGlvbihodG1sLCBsaW5lTnVtYmVycylcblx0e1xuXHRcdGh0bWwgPSB0cmltKGh0bWwpO1xuXHRcdFxuXHRcdHZhciBsaW5lcyA9IHNwbGl0TGluZXMoaHRtbCksXG5cdFx0XHRwYWRMZW5ndGggPSB0aGlzLmdldFBhcmFtKCdwYWQtbGluZS1udW1iZXJzJyksXG5cdFx0XHRmaXJzdExpbmUgPSBwYXJzZUludCh0aGlzLmdldFBhcmFtKCdmaXJzdC1saW5lJykpLFxuXHRcdFx0aHRtbCA9ICcnLFxuXHRcdFx0YnJ1c2hOYW1lID0gdGhpcy5nZXRQYXJhbSgnYnJ1c2gnKVxuXHRcdFx0O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHR2YXIgbGluZSA9IGxpbmVzW2ldLFxuXHRcdFx0XHRpbmRlbnQgPSAvXigmbmJzcDt8XFxzKSsvLmV4ZWMobGluZSksXG5cdFx0XHRcdHNwYWNlcyA9IG51bGwsXG5cdFx0XHRcdGxpbmVOdW1iZXIgPSBsaW5lTnVtYmVycyA/IGxpbmVOdW1iZXJzW2ldIDogZmlyc3RMaW5lICsgaTtcblx0XHRcdFx0O1xuXG5cdFx0XHRpZiAoaW5kZW50ICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHNwYWNlcyA9IGluZGVudFswXS50b1N0cmluZygpO1xuXHRcdFx0XHRsaW5lID0gbGluZS5zdWJzdHIoc3BhY2VzLmxlbmd0aCk7XG5cdFx0XHRcdHNwYWNlcyA9IHNwYWNlcy5yZXBsYWNlKCcgJywgc2guY29uZmlnLnNwYWNlKTtcblx0XHRcdH1cblxuXHRcdFx0bGluZSA9IHRyaW0obGluZSk7XG5cdFx0XHRcblx0XHRcdGlmIChsaW5lLmxlbmd0aCA9PSAwKVxuXHRcdFx0XHRsaW5lID0gc2guY29uZmlnLnNwYWNlO1xuXHRcdFx0XG5cdFx0XHRodG1sICs9IHRoaXMuZ2V0TGluZUh0bWwoXG5cdFx0XHRcdGksXG5cdFx0XHRcdGxpbmVOdW1iZXIsIFxuXHRcdFx0XHQoc3BhY2VzICE9IG51bGwgPyAnPGNvZGUgY2xhc3M9XCInICsgYnJ1c2hOYW1lICsgJyBzcGFjZXNcIj4nICsgc3BhY2VzICsgJzwvY29kZT4nIDogJycpICsgbGluZVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBIVE1MIGZvciB0aGUgdGFibGUgdGl0bGUgb3IgZW1wdHkgc3RyaW5nIGlmIHRpdGxlIGlzIG51bGwuXG5cdCAqL1xuXHRnZXRUaXRsZUh0bWw6IGZ1bmN0aW9uKHRpdGxlKVxuXHR7XG5cdFx0cmV0dXJuIHRpdGxlID8gJzxjYXB0aW9uPicgKyB0aXRsZSArICc8L2NhcHRpb24+JyA6ICcnO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEZpbmRzIGFsbCBtYXRjaGVzIGluIHRoZSBzb3VyY2UgY29kZS5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGVcdFx0U291cmNlIGNvZGUgdG8gcHJvY2VzcyBtYXRjaGVzIGluLlxuXHQgKiBAcGFyYW0ge0FycmF5fSBtYXRjaGVzXHREaXNjb3ZlcmVkIHJlZ2V4IG1hdGNoZXMuXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBmb3JtYXR0ZWQgSFRNTCB3aXRoIHByb2Nlc3NlZCBtYXRoZXMuXG5cdCAqL1xuXHRnZXRNYXRjaGVzSHRtbDogZnVuY3Rpb24oY29kZSwgbWF0Y2hlcylcblx0e1xuXHRcdHZhciBwb3MgPSAwLCBcblx0XHRcdHJlc3VsdCA9ICcnLFxuXHRcdFx0YnJ1c2hOYW1lID0gdGhpcy5nZXRQYXJhbSgnYnJ1c2gnLCAnJylcblx0XHRcdDtcblx0XHRcblx0XHRmdW5jdGlvbiBnZXRCcnVzaE5hbWVDc3MobWF0Y2gpXG5cdFx0e1xuXHRcdFx0dmFyIHJlc3VsdCA9IG1hdGNoID8gKG1hdGNoLmJydXNoTmFtZSB8fCBicnVzaE5hbWUpIDogYnJ1c2hOYW1lO1xuXHRcdFx0cmV0dXJuIHJlc3VsdCA/IHJlc3VsdCArICcgJyA6ICcnO1xuXHRcdH07XG5cdFx0XG5cdFx0Ly8gRmluYWxseSwgZ28gdGhyb3VnaCB0aGUgZmluYWwgbGlzdCBvZiBtYXRjaGVzIGFuZCBwdWxsIHRoZSBhbGxcblx0XHQvLyB0b2dldGhlciBhZGRpbmcgZXZlcnl0aGluZyBpbiBiZXR3ZWVuIHRoYXQgaXNuJ3QgYSBtYXRjaC5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIFxuXHRcdHtcblx0XHRcdHZhciBtYXRjaCA9IG1hdGNoZXNbaV0sXG5cdFx0XHRcdG1hdGNoQnJ1c2hOYW1lXG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0aWYgKG1hdGNoID09PSBudWxsIHx8IG1hdGNoLmxlbmd0aCA9PT0gMCkgXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRtYXRjaEJydXNoTmFtZSA9IGdldEJydXNoTmFtZUNzcyhtYXRjaCk7XG5cdFx0XHRcblx0XHRcdHJlc3VsdCArPSB3cmFwTGluZXNXaXRoQ29kZShjb2RlLnN1YnN0cihwb3MsIG1hdGNoLmluZGV4IC0gcG9zKSwgbWF0Y2hCcnVzaE5hbWUgKyAncGxhaW4nKVxuXHRcdFx0XHRcdCsgd3JhcExpbmVzV2l0aENvZGUobWF0Y2gudmFsdWUsIG1hdGNoQnJ1c2hOYW1lICsgbWF0Y2guY3NzKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0cG9zID0gbWF0Y2guaW5kZXggKyBtYXRjaC5sZW5ndGggKyAobWF0Y2gub2Zmc2V0IHx8IDApO1xuXHRcdH1cblxuXHRcdC8vIGRvbid0IGZvcmdldCB0byBhZGQgd2hhdGV2ZXIncyByZW1haW5pbmcgaW4gdGhlIHN0cmluZ1xuXHRcdHJlc3VsdCArPSB3cmFwTGluZXNXaXRoQ29kZShjb2RlLnN1YnN0cihwb3MpLCBnZXRCcnVzaE5hbWVDc3MoKSArICdwbGFpbicpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIHRoZSB3aG9sZSBzeW50YXggaGlnaGxpZ2h0ZXIuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlIFNvdXJjZSBjb2RlLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdCAqL1xuXHRnZXRIdG1sOiBmdW5jdGlvbihjb2RlKVxuXHR7XG5cdFx0dmFyIGh0bWwgPSAnJyxcblx0XHRcdGNsYXNzZXMgPSBbICdzeW50YXhoaWdobGlnaHRlcicgXSxcblx0XHRcdHRhYlNpemUsXG5cdFx0XHRtYXRjaGVzLFxuXHRcdFx0bGluZU51bWJlcnNcblx0XHRcdDtcblx0XHRcblx0XHQvLyBwcm9jZXNzIGxpZ2h0IG1vZGVcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgnbGlnaHQnKSA9PSB0cnVlKVxuXHRcdFx0dGhpcy5wYXJhbXMudG9vbGJhciA9IHRoaXMucGFyYW1zLmd1dHRlciA9IGZhbHNlO1xuXG5cdFx0Y2xhc3NOYW1lID0gJ3N5bnRheGhpZ2hsaWdodGVyJztcblxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdjb2xsYXBzZScpID09IHRydWUpXG5cdFx0XHRjbGFzc2VzLnB1c2goJ2NvbGxhcHNlZCcpO1xuXHRcdFxuXHRcdGlmICgoZ3V0dGVyID0gdGhpcy5nZXRQYXJhbSgnZ3V0dGVyJykpID09IGZhbHNlKVxuXHRcdFx0Y2xhc3Nlcy5wdXNoKCdub2d1dHRlcicpO1xuXG5cdFx0Ly8gYWRkIGN1c3RvbSB1c2VyIHN0eWxlIG5hbWVcblx0XHRjbGFzc2VzLnB1c2godGhpcy5nZXRQYXJhbSgnY2xhc3MtbmFtZScpKTtcblxuXHRcdC8vIGFkZCBicnVzaCBhbGlhcyB0byB0aGUgY2xhc3MgbmFtZSBmb3IgY3VzdG9tIENTU1xuXHRcdGNsYXNzZXMucHVzaCh0aGlzLmdldFBhcmFtKCdicnVzaCcpKTtcblxuXHRcdGNvZGUgPSB0cmltRmlyc3RBbmRMYXN0TGluZXMoY29kZSlcblx0XHRcdC5yZXBsYWNlKC9cXHIvZywgJyAnKSAvLyBJRSBsZXRzIHRoZXNlIGJ1Z2dlcnMgdGhyb3VnaFxuXHRcdFx0O1xuXG5cdFx0dGFiU2l6ZSA9IHRoaXMuZ2V0UGFyYW0oJ3RhYi1zaXplJyk7XG5cblx0XHQvLyByZXBsYWNlIHRhYnMgd2l0aCBzcGFjZXNcblx0XHRjb2RlID0gdGhpcy5nZXRQYXJhbSgnc21hcnQtdGFicycpID09IHRydWVcblx0XHRcdD8gcHJvY2Vzc1NtYXJ0VGFicyhjb2RlLCB0YWJTaXplKVxuXHRcdFx0OiBwcm9jZXNzVGFicyhjb2RlLCB0YWJTaXplKVxuXHRcdFx0O1xuXG5cdFx0Ly8gdW5pbmRlbnQgY29kZSBieSB0aGUgY29tbW9uIGluZGVudGF0aW9uXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ3VuaW5kZW50JykpXG5cdFx0XHRjb2RlID0gdW5pbmRlbnQoY29kZSk7XG5cblx0XHRpZiAoZ3V0dGVyKVxuXHRcdFx0bGluZU51bWJlcnMgPSB0aGlzLmZpZ3VyZU91dExpbmVOdW1iZXJzKGNvZGUpO1xuXHRcdFxuXHRcdC8vIGZpbmQgbWF0Y2hlcyBpbiB0aGUgY29kZSB1c2luZyBicnVzaGVzIHJlZ2V4IGxpc3Rcblx0XHRtYXRjaGVzID0gdGhpcy5maW5kTWF0Y2hlcyh0aGlzLnJlZ2V4TGlzdCwgY29kZSk7XG5cdFx0Ly8gcHJvY2Vzc2VzIGZvdW5kIG1hdGNoZXMgaW50byB0aGUgaHRtbFxuXHRcdGh0bWwgPSB0aGlzLmdldE1hdGNoZXNIdG1sKGNvZGUsIG1hdGNoZXMpO1xuXHRcdC8vIGZpbmFsbHksIHNwbGl0IGFsbCBsaW5lcyBzbyB0aGF0IHRoZXkgd3JhcCB3ZWxsXG5cdFx0aHRtbCA9IHRoaXMuZ2V0Q29kZUxpbmVzSHRtbChodG1sLCBsaW5lTnVtYmVycyk7XG5cblx0XHQvLyBmaW5hbGx5LCBwcm9jZXNzIHRoZSBsaW5rc1xuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdhdXRvLWxpbmtzJykpXG5cdFx0XHRodG1sID0gcHJvY2Vzc1VybHMoaHRtbCk7XG5cdFx0XG5cdFx0aWYgKHR5cGVvZihuYXZpZ2F0b3IpICE9ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvTVNJRS8pKVxuXHRcdFx0Y2xhc3Nlcy5wdXNoKCdpZScpO1xuXHRcdFxuXHRcdGh0bWwgPSBcblx0XHRcdCc8ZGl2IGlkPVwiJyArIGdldEhpZ2hsaWdodGVySWQodGhpcy5pZCkgKyAnXCIgY2xhc3M9XCInICsgY2xhc3Nlcy5qb2luKCcgJykgKyAnXCI+J1xuXHRcdFx0XHQrICh0aGlzLmdldFBhcmFtKCd0b29sYmFyJykgPyBzaC50b29sYmFyLmdldEh0bWwodGhpcykgOiAnJylcblx0XHRcdFx0KyAnPHRhYmxlIGJvcmRlcj1cIjBcIiBjZWxscGFkZGluZz1cIjBcIiBjZWxsc3BhY2luZz1cIjBcIj4nXG5cdFx0XHRcdFx0KyB0aGlzLmdldFRpdGxlSHRtbCh0aGlzLmdldFBhcmFtKCd0aXRsZScpKVxuXHRcdFx0XHRcdCsgJzx0Ym9keT4nXG5cdFx0XHRcdFx0XHQrICc8dHI+J1xuXHRcdFx0XHRcdFx0XHQrIChndXR0ZXIgPyAnPHRkIGNsYXNzPVwiZ3V0dGVyXCI+JyArIHRoaXMuZ2V0TGluZU51bWJlcnNIdG1sKGNvZGUpICsgJzwvdGQ+JyA6ICcnKVxuXHRcdFx0XHRcdFx0XHQrICc8dGQgY2xhc3M9XCJjb2RlXCI+J1xuXHRcdFx0XHRcdFx0XHRcdCsgJzxkaXYgY2xhc3M9XCJjb250YWluZXJcIj4nXG5cdFx0XHRcdFx0XHRcdFx0XHQrIGh0bWxcblx0XHRcdFx0XHRcdFx0XHQrICc8L2Rpdj4nXG5cdFx0XHRcdFx0XHRcdCsgJzwvdGQ+J1xuXHRcdFx0XHRcdFx0KyAnPC90cj4nXG5cdFx0XHRcdFx0KyAnPC90Ym9keT4nXG5cdFx0XHRcdCsgJzwvdGFibGU+J1xuXHRcdFx0KyAnPC9kaXY+J1xuXHRcdFx0O1xuXHRcdFx0XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogSGlnaGxpZ2h0cyB0aGUgY29kZSBhbmQgcmV0dXJucyBjb21wbGV0ZSBIVE1MLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZSAgICAgQ29kZSB0byBoaWdobGlnaHQuXG5cdCAqIEByZXR1cm4ge0VsZW1lbnR9ICAgICAgICBSZXR1cm5zIGNvbnRhaW5lciBESVYgZWxlbWVudCB3aXRoIGFsbCBtYXJrdXAuXG5cdCAqL1xuXHRnZXREaXY6IGZ1bmN0aW9uKGNvZGUpXG5cdHtcblx0XHRpZiAoY29kZSA9PT0gbnVsbCkgXG5cdFx0XHRjb2RlID0gJyc7XG5cdFx0XG5cdFx0dGhpcy5jb2RlID0gY29kZTtcblxuXHRcdHZhciBkaXYgPSB0aGlzLmNyZWF0ZSgnZGl2Jyk7XG5cblx0XHQvLyBjcmVhdGUgbWFpbiBIVE1MXG5cdFx0ZGl2LmlubmVySFRNTCA9IHRoaXMuZ2V0SHRtbChjb2RlKTtcblx0XHRcblx0XHQvLyBzZXQgdXAgY2xpY2sgaGFuZGxlcnNcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgndG9vbGJhcicpKVxuXHRcdFx0YXR0YWNoRXZlbnQoZmluZEVsZW1lbnQoZGl2LCAnLnRvb2xiYXInKSwgJ2NsaWNrJywgc2gudG9vbGJhci5oYW5kbGVyKTtcblx0XHRcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgncXVpY2stY29kZScpKVxuXHRcdFx0YXR0YWNoRXZlbnQoZmluZEVsZW1lbnQoZGl2LCAnLmNvZGUnKSwgJ2RibGNsaWNrJywgcXVpY2tDb2RlSGFuZGxlcik7XG5cdFx0XG5cdFx0cmV0dXJuIGRpdjtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgaGlnaGxpZ2h0ZXIvYnJ1c2guXG5cdCAqXG5cdCAqIENvbnN0cnVjdG9yIGlzbid0IHVzZWQgZm9yIGluaXRpYWxpemF0aW9uIHNvIHRoYXQgbm90aGluZyBleGVjdXRlcyBkdXJpbmcgbmVjZXNzYXJ5XG5cdCAqIGBuZXcgU3ludGF4SGlnaGxpZ2h0ZXIuSGlnaGxpZ2h0ZXIoKWAgY2FsbCB3aGVuIHNldHRpbmcgdXAgYnJ1c2ggaW5oZXJpdGVuY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7SGFzaH0gcGFyYW1zIEhpZ2hsaWdodGVyIHBhcmFtZXRlcnMuXG5cdCAqL1xuXHRpbml0OiBmdW5jdGlvbihwYXJhbXMpXG5cdHtcblx0XHR0aGlzLmlkID0gZ3VpZCgpO1xuXHRcdFxuXHRcdC8vIHJlZ2lzdGVyIHRoaXMgaW5zdGFuY2UgaW4gdGhlIGhpZ2hsaWdodGVycyBsaXN0XG5cdFx0c3RvcmVIaWdobGlnaHRlcih0aGlzKTtcblx0XHRcblx0XHQvLyBsb2NhbCBwYXJhbXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgZGVmYXVsdHNcblx0XHR0aGlzLnBhcmFtcyA9IG1lcmdlKHNoLmRlZmF1bHRzLCBwYXJhbXMgfHwge30pXG5cdFx0XG5cdFx0Ly8gcHJvY2VzcyBsaWdodCBtb2RlXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ2xpZ2h0JykgPT0gdHJ1ZSlcblx0XHRcdHRoaXMucGFyYW1zLnRvb2xiYXIgPSB0aGlzLnBhcmFtcy5ndXR0ZXIgPSBmYWxzZTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBrZXl3b3JkcyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uIHN0cmluZy5cblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0ciAgICBTcGFjZSBzZXBhcmF0ZWQga2V5d29yZHMuXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgUmV0dXJucyByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuXHQgKi9cblx0Z2V0S2V5d29yZHM6IGZ1bmN0aW9uKHN0cilcblx0e1xuXHRcdHN0ciA9IHN0clxuXHRcdFx0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuXHRcdFx0LnJlcGxhY2UoL1xccysvZywgJ3wnKVxuXHRcdFx0O1xuXHRcdFxuXHRcdHJldHVybiAnXFxcXGIoPzonICsgc3RyICsgJylcXFxcYic7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogTWFrZXMgYSBicnVzaCBjb21wYXRpYmxlIHdpdGggdGhlIGBodG1sLXNjcmlwdGAgZnVuY3Rpb25hbGl0eS5cblx0ICogQHBhcmFtIHtPYmplY3R9IHJlZ2V4R3JvdXAgT2JqZWN0IGNvbnRhaW5pbmcgYGxlZnRgIGFuZCBgcmlnaHRgIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG5cdCAqL1xuXHRmb3JIdG1sU2NyaXB0OiBmdW5jdGlvbihyZWdleEdyb3VwKVxuXHR7XG5cdFx0dmFyIHJlZ2V4ID0geyAnZW5kJyA6IHJlZ2V4R3JvdXAucmlnaHQuc291cmNlIH07XG5cblx0XHRpZihyZWdleEdyb3VwLmVvZilcblx0XHRcdHJlZ2V4LmVuZCA9IFwiKD86KD86XCIgKyByZWdleC5lbmQgKyBcIil8JClcIjtcblx0XHRcblx0XHR0aGlzLmh0bWxTY3JpcHQgPSB7XG5cdFx0XHRsZWZ0IDogeyByZWdleDogcmVnZXhHcm91cC5sZWZ0LCBjc3M6ICdzY3JpcHQnIH0sXG5cdFx0XHRyaWdodCA6IHsgcmVnZXg6IHJlZ2V4R3JvdXAucmlnaHQsIGNzczogJ3NjcmlwdCcgfSxcblx0XHRcdGNvZGUgOiBuZXcgWFJlZ0V4cChcblx0XHRcdFx0XCIoPzxsZWZ0PlwiICsgcmVnZXhHcm91cC5sZWZ0LnNvdXJjZSArIFwiKVwiICtcblx0XHRcdFx0XCIoPzxjb2RlPi4qPylcIiArXG5cdFx0XHRcdFwiKD88cmlnaHQ+XCIgKyByZWdleC5lbmQgKyBcIilcIixcblx0XHRcdFx0XCJzZ2lcIlxuXHRcdFx0XHQpXG5cdFx0fTtcblx0fVxufTsgLy8gZW5kIG9mIEhpZ2hsaWdodGVyXG5cbnJldHVybiBzaDtcbn0oKTsgLy8gZW5kIG9mIGFub255bW91cyBmdW5jdGlvblxuXG4vLyBDb21tb25KU1xudHlwZW9mKGV4cG9ydHMpICE9ICd1bmRlZmluZWQnID8gZXhwb3J0cy5TeW50YXhIaWdobGlnaHRlciA9IFN5bnRheEhpZ2hsaWdodGVyIDogbnVsbDtcbiIsInZhciBmcyAgICAgICAgID0gIHJlcXVpcmUoJ2ZzJylcbiAgLCBwYXRoICAgICAgID0gIHJlcXVpcmUoJ3BhdGgnKVxuICAsIHV0aWwgICAgICAgPSAgcmVxdWlyZSgndXRpbCcpXG4gICwgaW5saW5lICAgICA9ICByZXF1aXJlKCcuL2lubGluZS1zY3JpcHRzJylcbiAgLCBzY3JpcHRzRGlyID0gIHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2xpYi9zY3JpcHRzJylcbiAgLCBzdHlsZXNEaXIgID0gIHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2xpYi9zdHlsZXMnKVxuICAsIHN0eWxlc1xuICAsIGxhbmdNYXAgICAgPSAgeyB9XG4gICwgc2ltaWxhck1hcCA9ICB7IH1cbiAgLCBzaW1pbGFyTGFuZ3MgPSAge1xuICAgICAgICAnanMnICAgICA6ICBbICdqc29uJyBdXG4gICAgICAsICdweXRob24nIDogIFsnY29mZmVlJywgJ2dyb292eScsICdocycsICdoYXNrZWxsJyBdXG4gICAgfVxuICA7XG5cblxuLy8gU2VsZiBpbnZva2luZyBmdW5jdGlvbnMgYmxvY2sgdW50aWwgdGhleSBhcmUgZmluaXNoZWQgaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXQgXG4vLyB0aGlzIG1vZHVsZSBpcyBwcm9wZXJseSBpbml0aWFsaXplZCBiZWZvcmUgaXQgaXMgcmV0dXJuZWQuXG4vLyBTaW5jZSB0aGlzIG9ubHkgaGFwcGVucyBvbmNlICh3aGVuIG1vZHVsZSBpcyByZXF1aXJlZCksIGl0IHNob3VsZG4ndCBiZSBhIHByb2JsZW0uXG4oZnVuY3Rpb24gbWFwQnJ1c2hlcygpIHtcbiAgZnMucmVhZGRpclN5bmMoc2NyaXB0c0RpcikuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xuICAgIGlmICghZmlsZS5tYXRjaCgvc2hCcnVzaFxcdytcXC5qcy8pKSByZXR1cm47XG4gICAgXG4gICAgdmFyIGxhbmd1YWdlID0gcmVxdWlyZShwYXRoLmpvaW4oc2NyaXB0c0RpciwgZmlsZSkpO1xuICAgIGxhbmd1YWdlLkJydXNoLmFsaWFzZXMuZm9yRWFjaChmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgIGxhbmdNYXBbYWxpYXMudG9Mb3dlckNhc2UoKV0gPSBsYW5ndWFnZTtcbiAgICB9KTtcbiAgfSk7ICBcblxuICAvLyBBZGQgc29tZSBrbm93biBhbGlhc2VzXG4gIGxhbmdNYXBbJ2NzJ10gPSBsYW5nTWFwWydjIyddO1xuXG4gIC8vIEFkZCBzaW1pbGFyIGJydXNoZXMgdG8gc2ltaWxhciBtYXBcbiAgT2JqZWN0LmtleXMoc2ltaWxhckxhbmdzKS5mb3JFYWNoKGZ1bmN0aW9uIChsYW5nKSB7XG4gICAgc2ltaWxhckxhbmdzW2xhbmddLmZvckVhY2goZnVuY3Rpb24gKHNpbWlsYXIpIHtcbiAgICAgIHNpbWlsYXJNYXBbc2ltaWxhcl0gPSBsYW5nTWFwW2xhbmddO1xuICAgIH0pO1xuICB9KTtcbn0pICgpO1xuXG4oZnVuY3Rpb24gY29sbGVjdFN0eWxlcyAoKSB7XG4gIHN0eWxlcyA9IGZzLnJlYWRkaXJTeW5jKHN0eWxlc0RpcilcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIChmaWxlTmFtZSkge1xuICAgICAgcmV0dXJuIGZpbGVOYW1lLm1hdGNoKC9zaENvcmUuK1xcLmNzcy8pO1xuICAgIH0pXG4gICAgLm1hcChmdW5jdGlvbiAoZmlsZU5hbWUpIHtcbiAgICAgIHZhciBub3JtYWxpemVkRmlsZU5hbWUgPSAgZmlsZU5hbWUucmVwbGFjZSgvc2hDb3JlLywgJycpXG4gICAgICAgICwgZXh0TGVuZ3RoICAgICAgICAgID0gIHBhdGguZXh0bmFtZShub3JtYWxpemVkRmlsZU5hbWUpLmxlbmd0aFxuICAgICAgICAsIG5hbWVMZW5ndGggICAgICAgICA9ICBub3JtYWxpemVkRmlsZU5hbWUubGVuZ3RoIC0gZXh0TGVuZ3RoXG4gICAgICAgICwgc3R5bGVOYW1lICAgICAgICAgID0gIG5vcm1hbGl6ZWRGaWxlTmFtZS5zdWJzdHIoMCwgbmFtZUxlbmd0aCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAsIGZ1bGxGaWxlUGF0aCAgICAgICA9ICBwYXRoLmpvaW4oc3R5bGVzRGlyLCBmaWxlTmFtZSlcbiAgICAgICAgO1xuXG4gICAgICByZXR1cm4geyBuYW1lOiBzdHlsZU5hbWUsIHNvdXJjZVBhdGg6IGZ1bGxGaWxlUGF0aCB9O1xuICAgICAgXG4gICAgfSk7XG59KSAoKTtcblxuZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UoYWxpYXMsIHN0cmljdCkge1xuICAvLyBhY2NlcHQgKi5leHQsIC5leHQgYW5kIGV4dFxuICB2YXIgbm9ybWFsaXplZEFsaWFzID0gYWxpYXMucmVwbGFjZSgvXlxcKi8sJycpLnJlcGxhY2UoL15cXC4vLCcnKTtcblxuICB2YXIgbWF0Y2ggPSBsYW5nTWFwW25vcm1hbGl6ZWRBbGlhc10gfHwgKCFzdHJpY3QgPyBzaW1pbGFyTWFwW25vcm1hbGl6ZWRBbGlhc10gOiB2b2lkIDApO1xuICBcbiAgLy8gTmVlZCB0byByZW1lbWJlciBpZiB1c2VyIGlzIGhpZ2hsaWdodGluZyBodG1sIG9yIHhodG1sIGZvciBpbnN0YW5jZSBmb3IgdXNlIGluIGhpZ2hsaWdodFxuICBpZiAobWF0Y2gpIG1hdGNoLnNwZWNpZmllZEFsaWFzID0gbm9ybWFsaXplZEFsaWFzO1xuXG4gIHJldHVybiBtYXRjaDtcbn1cblxuLy8gb3B0aW9uczogaHR0cDovL2FsZXhnb3JiYXRjaGV2LmNvbS9TeW50YXhIaWdobGlnaHRlci9tYW51YWwvY29uZmlndXJhdGlvbi9cbmZ1bmN0aW9uIGhpZ2hsaWdodChjb2RlLCBsYW5ndWFnZSwgb3B0aW9ucykge1xuICB2YXIgbWVyZ2VkT3B0cyA9IHsgfVxuICAgICwgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgdG9vbGJhcjogZmFsc2VcbiAgICAgICAgLCAnZmlyc3QtbGluZSc6IDFcbiAgICAgIH1cbiAgICAsIGhpZ2hsaWdodGVkSHRtbFxuICAgIDtcblxuICBpZiAoIWxhbmd1YWdlKSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHBhc3MgYSBsYW5ndWFnZSBvYnRhaW5lZCB2aWEgXCJnZXRMYW5ndWFnZVwiJyk7XG4gIGlmICghbGFuZ3VhZ2UuQnJ1c2gpIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gcGFzcyBhIGxhbmd1YWdlIHdpdGggYSBCcnVzaCwgb2J0YWluZWQgdmlhIFwiZ2V0TGFuZ3VhZ2VcIicpO1xuXG4gIGlmIChvcHRpb25zKSB7XG4gICAgLy8gR2F0aGVyIGFsbCB1c2VyIHNwZWNpZmllZCBvcHRpb25zIGZpcnN0XG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBtZXJnZWRPcHRzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgfSk7XG4gICAgLy8gQWRkIGRlZmF1bHQgb3B0aW9uIG9ubHkgaWYgdXNlciBkaWRuJ3Qgc3BlY2lmeSBpdHMgdmFsdWVcbiAgICBPYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBtZXJnZWRPcHRzW2tleV0gPSBvcHRpb25zW2tleV0gfHwgZGVmYXVsdHNba2V5XTtcbiAgICB9KTtcblxuICB9IGVsc2Uge1xuICAgIG1lcmdlZE9wdHMgPSBkZWZhdWx0cztcbiAgfVxuXG4gIHZhciBicnVzaCA9IG5ldyBsYW5ndWFnZS5CcnVzaCgpO1xuICBicnVzaC5pbml0KG1lcmdlZE9wdHMpO1xuXG4gIGhpZ2hsaWdodGVkSHRtbCA9IGJydXNoLmdldEh0bWwoY29kZSk7XG5cbiAgaWYgKGxhbmd1YWdlID09PSBsYW5nTWFwWydodG1sJ10pIHtcbiAgICB2YXIgbGluZXMgPSBjb2RlLnNwbGl0KCdcXG4nKVxuICAgICAgLCBzY3JpcHRzID0gaW5saW5lLmZpbmRTY3JpcHRzKGxpbmVzLCBsYW5ndWFnZS5zcGVjaWZpZWRBbGlhcyk7XG5cbiAgICAvLyBIaWdobGlnaHQgY29kZSBpbiBiZXR3ZWVuIHNjcmlwdHMgdGFncyBhbmQgaW50ZXJqZWN0IGl0IGludG8gaGlnaGxpZ2h0ZWQgaHRtbFxuICAgIHNjcmlwdHMuZm9yRWFjaChmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICB2YXIgc2NyaXB0TGFuZyA9IGxhbmdNYXBbc2NyaXB0LnRhZy5hbGlhc11cbiAgICAgICAgLCBicnVzaCA9IG5ldyBzY3JpcHRMYW5nLkJydXNoKClcbiAgICAgICAgLCBvcHRzID0gbWVyZ2VkT3B0c1xuICAgICAgICA7XG5cbiAgICAgIC8vIGFkYXB0IGxpbmUgbnVtYmVycyBvZiBoaWdobGlnaHRlZCBjb2RlIHNpbmNlIGl0IGlzIGluIHRoZSBtaWRkbGUgb2YgaHRtbCBkb2N1bWVudFxuICAgICAgb3B0c1snZmlyc3QtbGluZSddID0gbWVyZ2VkT3B0c1snZmlyc3QtbGluZSddICsgc2NyaXB0LmZyb207XG4gICAgICBcbiAgICAgIGJydXNoLmluaXQob3B0cyk7XG5cbiAgICAgIHZhciBoaWdobGlnaHRlZFNjcmlwdCA9IGJydXNoLmdldEh0bWwoc2NyaXB0LmNvZGUpXG4gICAgICAgICwgaGlnbGlnaHRlZExpbmVzID0gaW5saW5lLmV4dHJhY3RMaW5lcyhoaWdobGlnaHRlZFNjcmlwdCk7XG5cbiAgICAgIGhpZ2hsaWdodGVkSHRtbCA9IGlubGluZS5yZXBsYWNlUGxhaW5MaW5lcyhzY3JpcHQuZnJvbSwgc2NyaXB0LnRvLCBoaWdobGlnaHRlZEh0bWwsIGhpZ2xpZ2h0ZWRMaW5lcyk7XG4gICAgfSk7XG4gfSBcblxuICByZXR1cm4gaGlnaGxpZ2h0ZWRIdG1sO1xufVxuXG5cbmZ1bmN0aW9uIGdldFN0eWxlcyAoKSB7XG4gIHJldHVybiBzdHlsZXM7XG59XG5cbmZ1bmN0aW9uIGNvcHlTdHlsZSAoc3R5bGUsIHRndCwgY2IpIHtcbiAgdmFyIHNvdXJjZVBhdGhcbiAgICAsIHN0eWxlTmFtZTtcblxuICAvLyBBbGxvdyBzdHlsZSB0byBqdXN0IGJlIGEgc3RyaW5nIChpdHMgbmFtZSkgb3IgYSBzdHlsZSByZXR1cm5lZCBmcm9tIGdldFN0eWxlc1xuICBpZiAodHlwZW9mIHN0eWxlID09PSAnc3RyaW5nJykge1xuICAgIHN0eWxlTmFtZSA9IHN0eWxlO1xuXG4gICAgdmFyIG1hdGNoaW5nU3R5bGUgPSBzdHlsZXMuZmlsdGVyKGZ1bmN0aW9uIChzKSB7IHJldHVybiBzLm5hbWUgPT09IHN0eWxlOyB9KVswXTtcblxuICAgIGlmICghbWF0Y2hpbmdTdHlsZSkgXG4gICAgICBjYihuZXcgRXJyb3IoJ1N0eWxlIG5hbWVkIFwiJyArIHN0eWxlICsgJ1wiIG5vdCBmb3VuZC4nKSk7XG4gICAgZWxzZVxuICAgICAgc291cmNlUGF0aCA9IG1hdGNoaW5nU3R5bGUuc291cmNlUGF0aDtcblxuICB9IGVsc2UgaWYgKCFzdHlsZS5zb3VyY2VQYXRoKSB7XG4gICAgY2IobmV3IEVycm9yKCdzdHlsZSBuZWVkcyB0byBiZSBzdHJpbmcgb3IgaGF2ZSBcInNvdXJjZVBhdGhcIiBwcm9wZXJ0eScpKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZU5hbWUgPSBzdHlsZS5uYW1lO1xuICAgIHNvdXJjZVBhdGggPSBzdHlsZS5zb3VyY2VQYXRoO1xuICB9XG5cbiAgdmFyIHJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHNvdXJjZVBhdGgpXG4gICAgLCB3cml0ZVN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHBhdGguam9pbih0Z3QsIHN0eWxlTmFtZSArICcuY3NzJykpXG4gICAgOyBcblxuICB1dGlsLnB1bXAocmVhZFN0cmVhbSwgd3JpdGVTdHJlYW0sIGNiKTtcbn1cblxuXG5mdW5jdGlvbiBjb3B5U3R5bGVzKHRndCwgY2IpIHtcbiAgdmFyIHBlbmRpbmcgPSBzdHlsZXMubGVuZ3RoO1xuICBzdHlsZXMuZm9yRWFjaChmdW5jdGlvbiAocykge1xuICAgIGNvcHlTdHlsZShzLCB0Z3QsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGlmIChlcnIpIHsgXG4gICAgICAgIGNiKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoLS1wZW5kaW5nID09PSAwKSBjYigpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGhpZ2hsaWdodCAgIDogIGhpZ2hsaWdodFxuICAsIGdldExhbmd1YWdlIDogIGdldExhbmd1YWdlXG4gICwgZ2V0U3R5bGVzICAgOiAgZ2V0U3R5bGVzXG4gICwgY29weVN0eWxlICAgOiAgY29weVN0eWxlXG4gICwgY29weVN0eWxlcyAgOiAgY29weVN0eWxlc1xufTtcblxuIl19
