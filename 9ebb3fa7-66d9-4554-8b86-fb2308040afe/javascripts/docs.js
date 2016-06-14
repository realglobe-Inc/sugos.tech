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
module.exports={
  "SUGOS at Github": "https://github.com/realglobe-Inc/sugos"
}
},{}],9:[function(require,module,exports){
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
},{"../components/docs.component.js":10,"apeman-brws-react":"apeman-brws-react"}],10:[function(require,module,exports){
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
},{"./fragments/header":11,"./views/guide_view":15,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","apeman-react-style":"apeman-react-style","react":"react"}],11:[function(require,module,exports){
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
},{"../../services/link_service":17,"../fragments/logo":12,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],12:[function(require,module,exports){
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
},{"apeman-react-mixins":"apeman-react-mixins","react":"react"}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _apemanReactMarkdown = require('apeman-react-markdown');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EOL = _apemanReactMarkdown.ApMarkdown.EOL;


var Markdown = _react2.default.createClass({
  displayName: 'Markdown',

  propTypes: {},
  statics: {
    EOL: EOL
  },
  getDefaultProps: function getDefaultProps() {
    var s = this;
    return {
      links: require('../../../doc/links')
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;

    return _react2.default.createElement(_apemanReactMarkdown.ApMarkdown, props);
  }
});

exports.default = Markdown;
},{"../../../doc/links":8,"apeman-react-markdown":23,"marked":25,"react":"react"}],14:[function(require,module,exports){
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
},{"react":"react"}],15:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GuideView = _react2.default.createClass({
  displayName: 'GuideView',

  mixins: [_apemanReactMixins.ApLocaleMixin],
  getInitialState: function getInitialState() {
    return {
      toggle: 'QUICK_START'
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;
    var state = s.state;

    var l = s.getLocale();

    var _section = s._renderSection;
    var _ifToggle = function _ifToggle(value, components) {
      return value === state.toggle ? components : null;
    };

    return _react2.default.createElement(
      _apemanReactBasic.ApView,
      { className: 'guide-view' },
      _react2.default.createElement(_apemanReactBasic.ApViewHeader, { titleText: l('titles.GUIDES_TITLE') }),
      _react2.default.createElement(
        _apemanReactBasic.ApViewBody,
        null,
        _react2.default.createElement(
          'div',
          { className: 'guide-toggle-container' },
          _react2.default.createElement(_apemanReactBasic.ApToggle, { value: state.toggle,
            options: s.getToggleOptions(),
            onToggle: s.handleToggle
          })
        ),
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _apemanReactBasic.ApArticle,
            null,
            _ifToggle('QUICK_START', [_section('cloud-setup', {
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
            })]),
            _ifToggle('REFERENCES', ['No reference available yet']),
            _ifToggle('TIPS', ['No tips available yet'])
          )
        )
      )
    );
  },


  // ------------------
  // Custom
  // ------------------

  handleToggle: function handleToggle(e) {
    var s = this;
    s.setState({ toggle: e.data });
  },
  getToggleOptions: function getToggleOptions() {
    var s = this;
    var l = s.getLocale();
    return {
      QUICK_START: _react2.default.createElement(
        'span',
        null,
        l('toggles.QUICK_START')
      ),
      REFERENCES: _react2.default.createElement(
        'span',
        null,
        l('toggles.REFERENCES')
      ),
      TIPS: _react2.default.createElement(
        'span',
        null,
        l('toggles.TIPS')
      )
    };
  },


  // ------------------
  // Private
  // ------------------

  _renderSection: function _renderSection(name, config) {
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
            _react2.default.createElement(_markdown2.default, { src: [].concat(text).join(_markdown.EOL + _markdown.EOL) })
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
  }
});

module.exports = GuideView;
},{"../../services/snippet_service":18,"../fragments/markdown":13,"../fragments/snippet":14,"apeman-react-basic":"apeman-react-basic","apeman-react-mixins":"apeman-react-mixins","react":"react"}],16:[function(require,module,exports){
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
},{"ape-highlighting":20,"fs":1}],17:[function(require,module,exports){
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

},{"_process":5,"path":4}],18:[function(require,module,exports){
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
},{"../constants/snippet_constants":16}],19:[function(require,module,exports){
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

},{"fs":1,"jsx-syntaxhighlighter":24,"node-syntaxhighlighter":29}],20:[function(require,module,exports){
/**
 * ape framework module for highlighting.
 * @module ape-highlighting
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get highlightJsx () { return d(require('./highlight_jsx')) }
}

},{"./highlight_jsx":19}],21:[function(require,module,exports){
/**
 * Markdown component
 * @constructor ApMarkdown
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

var _apemanReactMixins2 = _interopRequireDefault(_apemanReactMixins);

var _os = require('os');

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends ApMarkdown */
var ApMarkdown = _react2.default.createClass({
  displayName: 'ApMarkdown',


  // --------------------
  // Specs
  // --------------------

  propTypes: {
    /** Source text */
    src: _react.PropTypes.string,
    /** Link urls */
    links: _react.PropTypes.object
  },

  mixins: [_apemanReactMixins2.default],

  statics: {
    EOL: _os.EOL
  },

  getInitialState: function getInitialState() {
    return {};
  },
  getDefaultProps: function getDefaultProps() {
    return {
      src: null
    };
  },
  render: function render() {
    var s = this;
    var state = s.state;
    var props = s.props;

    var content = s.compileMarkdown([].concat(props.src, props.children));
    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('ap-markdown', props.className),
        style: Object.assign({}, props.style) },
      _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: content } })
    );
  },


  // --------------------
  // Lifecycle
  // --------------------

  // ------------------
  // Custom
  // ------------------
  /**
   * Compile markdown text
   * @param {string|string[]} src
   * @returns {?string}
   */
  compileMarkdown: function compileMarkdown(src) {
    var s = this;
    var props = s.props;

    if (!src) {
      return null;
    }
    if (Array.isArray(src)) {
      src = src.join(_os.EOL);
    }
    var links = Object.keys(props.links || {}).map(function (name) {
      return '[' + name + ']: ' + props.links[name];
    }).join(_os.EOL);
    return (0, _marked2.default)([src, links].join(_os.EOL));
  }

  // ------------------
  // Private
  // ------------------

});

exports.default = ApMarkdown;

},{"apeman-react-mixins":"apeman-react-mixins","classnames":"classnames","marked":25,"os":3,"react":"react"}],22:[function(require,module,exports){
/**
 * Style for ApMarkdown.
 * @constructor ApMarkdownStyle
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactStyle = require('apeman-react-style');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends ApMarkdownStyle */
var ApMarkdownStyle = _react2.default.createClass({
  displayName: 'ApMarkdownStyle',

  propTypes: {
    style: _react.PropTypes.object,
    highlightColor: _react.PropTypes.string
  },
  getDefaultProps: function getDefaultProps() {
    return {
      style: {},
      highlightColor: _apemanReactStyle.ApStyle.DEFAULT_HIGHLIGHT_COLOR,
      backgroundColor: _apemanReactStyle.ApStyle.DEFAULT_BACKGROUND_COLOR
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;
    var highlightColor = props.highlightColor;
    var backgroundColor = props.backgroundColor;


    var data = {
      '.ap-markdown': {
        transform: 'translateZ(0)' //Force rendering
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

exports.default = ApMarkdownStyle;

},{"apeman-react-style":"apeman-react-style","react":"react"}],23:[function(require,module,exports){
/**
 * apeman react package to render markdowns
 * @module apeman-react-markdown
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get ApMarkdownStyle () { return d(require('./ap_markdown_style')) },
  get ApMarkdown () { return d(require('./ap_markdown')) }
}

},{"./ap_markdown":21,"./ap_markdown_style":22}],24:[function(require,module,exports){
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

},{"node-syntaxhighlighter/lib/scripts/XRegExp":27,"node-syntaxhighlighter/lib/scripts/shCore":28}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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

},{"./XRegExp":27}],29:[function(require,module,exports){
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

},{"./inline-scripts":26,"fs":1,"path":4,"util":7}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4yLjEvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMi4xL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjIuMS9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMi4xL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvb3MtYnJvd3NlcmlmeS9icm93c2VyLmpzIiwiLi4vLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3Y2LjIuMS9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4yLjEvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjYuMi4xL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIi4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4yLjEvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJkb2MvbGlua3MuanNvbiIsImxpYi9icm93c2VyL2RvY3MuYnJvd3Nlci5qcyIsImxpYi9jb21wb25lbnRzL2RvY3MuY29tcG9uZW50LmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL2hlYWRlci5qcyIsImxpYi9jb21wb25lbnRzL2ZyYWdtZW50cy9sb2dvLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL21hcmtkb3duLmpzIiwibGliL2NvbXBvbmVudHMvZnJhZ21lbnRzL3NuaXBwZXQuanMiLCJsaWIvY29tcG9uZW50cy92aWV3cy9ndWlkZV92aWV3LmpzIiwibGliL2NvbnN0YW50cy9zbmlwcGV0X2NvbnN0YW50cy5qcyIsImxpYi9zZXJ2aWNlcy9saW5rX3NlcnZpY2UuanMiLCJsaWIvc2VydmljZXMvc25pcHBldF9zZXJ2aWNlLmpzIiwibm9kZV9tb2R1bGVzL2FwZS1oaWdobGlnaHRpbmcvbGliL2hpZ2hsaWdodF9qc3guanMiLCJub2RlX21vZHVsZXMvYXBlLWhpZ2hsaWdodGluZy9saWIvaW5kZXguanMiLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9hcGVtYW4tcHJvamVjdHMvYXBlbWFuLXJlYWN0LW1hcmtkb3duL2xpYi9hcF9tYXJrZG93bi5qc3giLCIvVXNlcnMvb2t1bmlzaGluaXNoaS9Qcm9qZWN0cy9hcGVtYW4tcHJvamVjdHMvYXBlbWFuLXJlYWN0LW1hcmtkb3duL2xpYi9hcF9tYXJrZG93bl9zdHlsZS5qc3giLCJub2RlX21vZHVsZXMvYXBlbWFuLXJlYWN0LW1hcmtkb3duL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qc3gtc3ludGF4aGlnaGxpZ2h0ZXIvc2hCcnVzaEpzeC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXN5bnRheGhpZ2hsaWdodGVyL2lubGluZS1zY3JpcHRzLmpzIiwibm9kZV9tb2R1bGVzL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbGliL3NjcmlwdHMvWFJlZ0V4cC5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXN5bnRheGhpZ2hsaWdodGVyL2xpYi9zY3JpcHRzL3NoQ29yZS5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLXN5bnRheGhpZ2hsaWdodGVyL25vZGUtc3ludGF4aGlnaGxpZ2h0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNQQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7QUFHQSxJQUFNLGFBQWEsZ0JBQU0sV0FBTixDQUFrQjtBQUFBOzs7Ozs7O0FBTW5DLGFBQVc7O0FBRVQsU0FBSyxpQkFBTSxNQUZGOztBQUlULFdBQU8saUJBQU07QUFKSixHQU53Qjs7QUFhbkMsVUFBUSw2QkFiMkI7O0FBaUJuQyxXQUFTO0FBQ1A7QUFETyxHQWpCMEI7O0FBcUJuQyxpQkFyQm1DLDZCQXFCaEI7QUFDakIsV0FBTyxFQUFQO0FBQ0QsR0F2QmtDO0FBeUJuQyxpQkF6Qm1DLDZCQXlCaEI7QUFDakIsV0FBTztBQUNMLFdBQUs7QUFEQSxLQUFQO0FBR0QsR0E3QmtDO0FBK0JuQyxRQS9CbUMsb0JBK0J6QjtBQUNSLFFBQU0sSUFBSSxJQUFWO0FBRFEsUUFFRixLQUZFLEdBRWUsQ0FGZixDQUVGLEtBRkU7QUFBQSxRQUVLLEtBRkwsR0FFZSxDQUZmLENBRUssS0FGTDs7QUFHUixRQUFJLFVBQVUsRUFBRSxlQUFGLENBQWtCLEdBQUcsTUFBSCxDQUFVLE1BQU0sR0FBaEIsRUFBcUIsTUFBTSxRQUEzQixDQUFsQixDQUFkO0FBQ0EsV0FDRTtBQUFBO01BQUEsRUFBSyxXQUFZLDBCQUFXLGFBQVgsRUFBMEIsTUFBTSxTQUFoQyxDQUFqQjtBQUNLLGVBQVEsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixNQUFNLEtBQXhCLENBRGI7TUFFRSx1Q0FBSyx5QkFBMEIsRUFBQyxRQUFRLE9BQVQsRUFBL0I7QUFGRixLQURGO0FBTUQsR0F6Q2tDOzs7Ozs7Ozs7Ozs7Ozs7QUF1RG5DLGlCQXZEbUMsMkJBdURsQixHQXZEa0IsRUF1RGI7QUFDcEIsUUFBTSxJQUFJLElBQVY7QUFEb0IsUUFFZCxLQUZjLEdBRUosQ0FGSSxDQUVkLEtBRmM7O0FBR3BCLFFBQUksQ0FBQyxHQUFMLEVBQVU7QUFDUixhQUFPLElBQVA7QUFDRDtBQUNELFFBQUksTUFBTSxPQUFOLENBQWMsR0FBZCxDQUFKLEVBQXdCO0FBQ3RCLFlBQU0sSUFBSSxJQUFKLFNBQU47QUFDRDtBQUNELFFBQUksUUFBUSxPQUFPLElBQVAsQ0FBWSxNQUFNLEtBQU4sSUFBZSxFQUEzQixFQUNULEdBRFMsQ0FDTCxVQUFDLElBQUQ7QUFBQSxtQkFBYyxJQUFkLFdBQXdCLE1BQU0sS0FBTixDQUFhLElBQWIsQ0FBeEI7QUFBQSxLQURLLEVBRVQsSUFGUyxTQUFaO0FBR0EsV0FBTyxzQkFBTyxDQUFFLEdBQUYsRUFBTyxLQUFQLEVBQWUsSUFBZixTQUFQLENBQVA7QUFDRDs7Ozs7O0FBcEVrQyxDQUFsQixDQUFuQjs7a0JBMkVlLFU7Ozs7Ozs7O0FDcEZmOzs7Ozs7QUFFQTs7OztBQUNBOzs7OztBQUdBLElBQU0sa0JBQWtCLGdCQUFNLFdBQU4sQ0FBa0I7QUFBQTs7QUFDeEMsYUFBVztBQUNULFdBQU8saUJBQU0sTUFESjtBQUVULG9CQUFnQixpQkFBTTtBQUZiLEdBRDZCO0FBS3hDLGlCQUx3Qyw2QkFLckI7QUFDakIsV0FBTztBQUNMLGFBQU8sRUFERjtBQUVMLHNCQUFnQiwwQkFBUSx1QkFGbkI7QUFHTCx1QkFBaUIsMEJBQVE7QUFIcEIsS0FBUDtBQUtELEdBWHVDO0FBWXhDLFFBWndDLG9CQVk5QjtBQUNSLFFBQU0sSUFBSSxJQUFWO0FBRFEsUUFFRixLQUZFLEdBRVEsQ0FGUixDQUVGLEtBRkU7QUFBQSxRQUlGLGNBSkUsR0FJa0MsS0FKbEMsQ0FJRixjQUpFO0FBQUEsUUFJYyxlQUpkLEdBSWtDLEtBSmxDLENBSWMsZUFKZDs7O0FBTVIsUUFBSSxPQUFPO0FBQ1Qsc0JBQWdCO0FBQ2QsbUJBQVcsZTtBQURHO0FBRFAsS0FBWDtBQUtBLFFBQUksaUJBQWlCLEVBQXJCO0FBQ0EsUUFBSSxrQkFBa0IsRUFBdEI7QUFDQSxRQUFJLGlCQUFpQixFQUFyQjtBQUNBLFdBQ0U7QUFBQTtNQUFBLEVBQVMsTUFBTyxPQUFPLE1BQVAsQ0FBYyxJQUFkLEVBQW9CLE1BQU0sS0FBMUIsQ0FBaEI7QUFDUyx3QkFBaUIsY0FEMUI7QUFFUyx5QkFBa0IsZUFGM0I7QUFHUyx3QkFBaUI7QUFIMUI7TUFJRyxNQUFNO0FBSlQsS0FERjtBQU9EO0FBakN1QyxDQUFsQixDQUF4Qjs7a0JBb0NlLGU7OztBQy9DZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcndDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0ckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJleHBvcnRzLmVuZGlhbm5lc3MgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnTEUnIH07XG5cbmV4cG9ydHMuaG9zdG5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGxvY2F0aW9uLmhvc3RuYW1lXG4gICAgfVxuICAgIGVsc2UgcmV0dXJuICcnO1xufTtcblxuZXhwb3J0cy5sb2FkYXZnID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW10gfTtcblxuZXhwb3J0cy51cHRpbWUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAwIH07XG5cbmV4cG9ydHMuZnJlZW1lbSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gTnVtYmVyLk1BWF9WQUxVRTtcbn07XG5cbmV4cG9ydHMudG90YWxtZW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7XG59O1xuXG5leHBvcnRzLmNwdXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbXSB9O1xuXG5leHBvcnRzLnR5cGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnQnJvd3NlcicgfTtcblxuZXhwb3J0cy5yZWxlYXNlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmFwcFZlcnNpb247XG4gICAgfVxuICAgIHJldHVybiAnJztcbn07XG5cbmV4cG9ydHMubmV0d29ya0ludGVyZmFjZXNcbj0gZXhwb3J0cy5nZXROZXR3b3JrSW50ZXJmYWNlc1xuPSBmdW5jdGlvbiAoKSB7IHJldHVybiB7fSB9O1xuXG5leHBvcnRzLmFyY2ggPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnamF2YXNjcmlwdCcgfTtcblxuZXhwb3J0cy5wbGF0Zm9ybSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdicm93c2VyJyB9O1xuXG5leHBvcnRzLnRtcGRpciA9IGV4cG9ydHMudG1wRGlyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnL3RtcCc7XG59O1xuXG5leHBvcnRzLkVPTCA9ICdcXG4nO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsYXN0ID0gcGFydHNbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gU3BsaXQgYSBmaWxlbmFtZSBpbnRvIFtyb290LCBkaXIsIGJhc2VuYW1lLCBleHRdLCB1bml4IHZlcnNpb25cbi8vICdyb290JyBpcyBqdXN0IGEgc2xhc2gsIG9yIG5vdGhpbmcuXG52YXIgc3BsaXRQYXRoUmUgPVxuICAgIC9eKFxcLz98KShbXFxzXFxTXSo/KSgoPzpcXC57MSwyfXxbXlxcL10rP3wpKFxcLlteLlxcL10qfCkpKD86W1xcL10qKSQvO1xudmFyIHNwbGl0UGF0aCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gIHJldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKTtcbn07XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZWRQYXRoID0gJycsXG4gICAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICB2YXIgcGF0aCA9IChpID49IDApID8gYXJndW1lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5qb2luIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuLy8gcGF0aC5yZWxhdGl2ZShmcm9tLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuZXhwb3J0cy5kZWxpbWl0ZXIgPSAnOic7XG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIHJlc3VsdCA9IHNwbGl0UGF0aChwYXRoKSxcbiAgICAgIHJvb3QgPSByZXN1bHRbMF0sXG4gICAgICBkaXIgPSByZXN1bHRbMV07XG5cbiAgaWYgKCFyb290ICYmICFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lIHdoYXRzb2V2ZXJcbiAgICByZXR1cm4gJy4nO1xuICB9XG5cbiAgaWYgKGRpcikge1xuICAgIC8vIEl0IGhhcyBhIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgZGlyID0gZGlyLnN1YnN0cigwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gcm9vdCArIGRpcjtcbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aChwYXRoKVsyXTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbXBhcmlzb24gY2FzZS1pbnNlbnNpdGl2ZSBvbiB3aW5kb3dzP1xuICBpZiAoZXh0ICYmIGYuc3Vic3RyKC0xICogZXh0Lmxlbmd0aCkgPT09IGV4dCkge1xuICAgIGYgPSBmLnN1YnN0cigwLCBmLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBmO1xufTtcblxuXG5leHBvcnRzLmV4dG5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBzcGxpdFBhdGgocGF0aClbM107XG59O1xuXG5mdW5jdGlvbiBmaWx0ZXIgKHhzLCBmKSB7XG4gICAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbnZhciBzdWJzdHIgPSAnYWInLnN1YnN0cigtMSkgPT09ICdiJ1xuICAgID8gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikgeyByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKSB9XG4gICAgOiBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKTtcbiAgICB9XG47XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXQgZG9uJ3QgYnJlYWsgdGhpbmdzLlxudmFyIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcblxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gY2FjaGVkU2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2FjaGVkQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiU1VHT1MgYXQgR2l0aHViXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3JlYWxnbG9iZS1JbmMvc3Vnb3NcIlxufSIsIi8qKlxuICogQnJvd3NlciBzY3JpcHQgZm9yIGRvY3MuXG4gKlxuICogR2VuZXJhdGVkIGJ5IGNveiBvbiA2LzkvMjAxNixcbiAqIGZyb20gYSB0ZW1wbGF0ZSBwcm92aWRlZCBieSBhcGVtYW4tYnVkLW1vY2suXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9hcGVtYW5CcndzUmVhY3QgPSByZXF1aXJlKCdhcGVtYW4tYnJ3cy1yZWFjdCcpO1xuXG52YXIgX2FwZW1hbkJyd3NSZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGVtYW5CcndzUmVhY3QpO1xuXG52YXIgX2RvY3NDb21wb25lbnQgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2RvY3MuY29tcG9uZW50LmpzJyk7XG5cbnZhciBfZG9jc0NvbXBvbmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kb2NzQ29tcG9uZW50KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIENPTlRBSU5FUl9JRCA9ICdkb2NzLXdyYXAnO1xud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF93aW5kb3cgPSB3aW5kb3c7XG4gIHZhciBsb2NhbGUgPSBfd2luZG93LmxvY2FsZTtcblxuICBfYXBlbWFuQnJ3c1JlYWN0Mi5kZWZhdWx0LnJlbmRlcihDT05UQUlORVJfSUQsIF9kb2NzQ29tcG9uZW50Mi5kZWZhdWx0LCB7XG4gICAgbG9jYWxlOiBsb2NhbGVcbiAgfSwgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAvLyBUaGUgY29tcG9uZW50IGlzIHJlYWR5LlxuICB9KTtcbn07IiwiLyoqXG4gKiBDb21wb25lbnQgb2YgZG9jcy5cbiAqXG4gKiBHZW5lcmF0ZWQgYnkgY296IG9uIDYvOS8yMDE2LFxuICogZnJvbSBhIHRlbXBsYXRlIHByb3ZpZGVkIGJ5IGFwZW1hbi1idWQtbW9jay5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdFN0eWxlID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LXN0eWxlJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2FwZW1hblJlYWN0TWl4aW5zID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1peGlucycpO1xuXG52YXIgX2hlYWRlciA9IHJlcXVpcmUoJy4vZnJhZ21lbnRzL2hlYWRlcicpO1xuXG52YXIgX2hlYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWFkZXIpO1xuXG52YXIgX2d1aWRlX3ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2d1aWRlX3ZpZXcnKTtcblxudmFyIF9ndWlkZV92aWV3MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2d1aWRlX3ZpZXcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgRG9jc0NvbXBvbmVudCA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnRG9jc0NvbXBvbmVudCcsXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFja2VyOiBuZXcgX2FwZW1hblJlYWN0QmFzaWMuQXBWaWV3U3RhY2suU3RhY2tlcih7XG4gICAgICAgIHJvb3Q6IF9ndWlkZV92aWV3Mi5kZWZhdWx0LFxuICAgICAgICByb290UHJvcHM6IHt9XG4gICAgICB9KVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuXG4gICAgcy5yZWdpc3RlckxvY2FsZShwcm9wcy5sb2NhbGUpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFBhZ2UsXG4gICAgICBudWxsLFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2hlYWRlcjIuZGVmYXVsdCwgeyB0YWI6ICdET0NTJyB9KSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcE1haW4sXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld1N0YWNrLCB7IHN0YWNrZXI6IHByb3BzLnN0YWNrZXIgfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRG9jc0NvbXBvbmVudDsiLCIvKipcbiAqIEhlYWRlciBjb21wb25lbnRcbiAqIEBjbGFzcyBIZWFkZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfYXBlbWFuUmVhY3RNaXhpbnMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtbWl4aW5zJyk7XG5cbnZhciBfYXBlbWFuUmVhY3RCYXNpYyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1iYXNpYycpO1xuXG52YXIgX2xvZ28gPSByZXF1aXJlKCcuLi9mcmFnbWVudHMvbG9nbycpO1xuXG52YXIgX2xvZ28yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9nbyk7XG5cbnZhciBfbGlua19zZXJ2aWNlID0gcmVxdWlyZSgnLi4vLi4vc2VydmljZXMvbGlua19zZXJ2aWNlJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKiBAbGVuZHMgSGVhZGVyICovXG52YXIgSGVhZGVyID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdIZWFkZXInLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHRhYjogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhYjogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgbWl4aW5zOiBbX2FwZW1hblJlYWN0TWl4aW5zLkFwTG9jYWxlTWl4aW5dLFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcbiAgICB2YXIgdGFiID0gcHJvcHMudGFiO1xuXG4gICAgdmFyIGwgPSBzLmdldExvY2FsZSgpO1xuICAgIHZhciBfdGFiSXRlbSA9IF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyVGFiSXRlbS5jcmVhdGVJdGVtO1xuICAgIHZhciBfbGluayA9IGZ1bmN0aW9uIF9saW5rKCkge1xuICAgICAgcmV0dXJuIF9saW5rX3NlcnZpY2Uuc2luZ2xldG9uLnJlc29sdmVIdG1sTGluay5hcHBseShfbGlua19zZXJ2aWNlLnNpbmdsZXRvbiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyLFxuICAgICAgeyBjbGFzc05hbWU6ICdoZWFkZXInIH0sXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBDb250YWluZXIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwSGVhZGVyTG9nbyxcbiAgICAgICAgICB7IGhyZWY6IF9saW5rKCdpbmRleC5odG1sJykgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbG9nbzIuZGVmYXVsdCwgbnVsbClcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBIZWFkZXJUYWIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5ET0NTX1BBR0UnKSwgX2xpbmsoJ2RvY3MuaHRtbCcpLCB7IHNlbGVjdGVkOiB0YWIgPT09ICdET0NTJyB9KSxcbiAgICAgICAgICBfdGFiSXRlbShsKCdwYWdlcy5DQVNFU19QQUdFJyksIF9saW5rKCdjYXNlcy5odG1sJyksIHsgc2VsZWN0ZWQ6IHRhYiA9PT0gJ0NBU0VTJyB9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEhlYWRlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIExvZ28gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0xvZ28nLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnaDEnLFxuICAgICAgeyBjbGFzc05hbWU6ICdsb2dvJyB9LFxuICAgICAgbCgnbG9nby5MT0dPJylcbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9nbzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcblxudmFyIF9tYXJrZWQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFya2VkKTtcblxudmFyIF9hcGVtYW5SZWFjdE1hcmtkb3duID0gcmVxdWlyZSgnYXBlbWFuLXJlYWN0LW1hcmtkb3duJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBFT0wgPSBfYXBlbWFuUmVhY3RNYXJrZG93bi5BcE1hcmtkb3duLkVPTDtcblxuXG52YXIgTWFya2Rvd24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ01hcmtkb3duJyxcblxuICBwcm9wVHlwZXM6IHt9LFxuICBzdGF0aWNzOiB7XG4gICAgRU9MOiBFT0xcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICBsaW5rczogcmVxdWlyZSgnLi4vLi4vLi4vZG9jL2xpbmtzJylcbiAgICB9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfYXBlbWFuUmVhY3RNYXJrZG93bi5BcE1hcmtkb3duLCBwcm9wcyk7XG4gIH1cbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNYXJrZG93bjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIFNuaXBwZXQgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1NuaXBwZXQnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHNyYzogX3JlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZFxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gcy5wcm9wcztcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdzbmlwcGV0JywgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHsgX19odG1sOiBwcm9wcy5zcmMgfSB9KTtcbiAgfVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNuaXBwZXQ7IiwiLyoqXG4gKiBWaWV3IGZvciBndWlkZVxuICogQGNsYXNzIEd1aWRlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2FwZW1hblJlYWN0QmFzaWMgPSByZXF1aXJlKCdhcGVtYW4tcmVhY3QtYmFzaWMnKTtcblxudmFyIF9hcGVtYW5SZWFjdE1peGlucyA9IHJlcXVpcmUoJ2FwZW1hbi1yZWFjdC1taXhpbnMnKTtcblxudmFyIF9zbmlwcGV0ID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL3NuaXBwZXQnKTtcblxudmFyIF9zbmlwcGV0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NuaXBwZXQpO1xuXG52YXIgX21hcmtkb3duID0gcmVxdWlyZSgnLi4vZnJhZ21lbnRzL21hcmtkb3duJyk7XG5cbnZhciBfbWFya2Rvd24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFya2Rvd24pO1xuXG52YXIgX3NuaXBwZXRfc2VydmljZSA9IHJlcXVpcmUoJy4uLy4uL3NlcnZpY2VzL3NuaXBwZXRfc2VydmljZScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgR3VpZGVWaWV3ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdHdWlkZVZpZXcnLFxuXG4gIG1peGluczogW19hcGVtYW5SZWFjdE1peGlucy5BcExvY2FsZU1peGluXSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRvZ2dsZTogJ1FVSUNLX1NUQVJUJ1xuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBzLnByb3BzO1xuICAgIHZhciBzdGF0ZSA9IHMuc3RhdGU7XG5cbiAgICB2YXIgbCA9IHMuZ2V0TG9jYWxlKCk7XG5cbiAgICB2YXIgX3NlY3Rpb24gPSBzLl9yZW5kZXJTZWN0aW9uO1xuICAgIHZhciBfaWZUb2dnbGUgPSBmdW5jdGlvbiBfaWZUb2dnbGUodmFsdWUsIGNvbXBvbmVudHMpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gc3RhdGUudG9nZ2xlID8gY29tcG9uZW50cyA6IG51bGw7XG4gICAgfTtcblxuICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlldyxcbiAgICAgIHsgY2xhc3NOYW1lOiAnZ3VpZGUtdmlldycgfSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9hcGVtYW5SZWFjdEJhc2ljLkFwVmlld0hlYWRlciwgeyB0aXRsZVRleHQ6IGwoJ3RpdGxlcy5HVUlERVNfVElUTEUnKSB9KSxcbiAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFZpZXdCb2R5LFxuICAgICAgICBudWxsLFxuICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICB7IGNsYXNzTmFtZTogJ2d1aWRlLXRvZ2dsZS1jb250YWluZXInIH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX2FwZW1hblJlYWN0QmFzaWMuQXBUb2dnbGUsIHsgdmFsdWU6IHN0YXRlLnRvZ2dsZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHMuZ2V0VG9nZ2xlT3B0aW9ucygpLFxuICAgICAgICAgICAgb25Ub2dnbGU6IHMuaGFuZGxlVG9nZ2xlXG4gICAgICAgICAgfSlcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwQXJ0aWNsZSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfaWZUb2dnbGUoJ1FVSUNLX1NUQVJUJywgW19zZWN0aW9uKCdjbG91ZC1zZXR1cCcsIHtcbiAgICAgICAgICAgICAgdGl0bGU6IGwoJ3NlY3Rpb25zLkdVSURFX0NMT1VEX1NFVFVQX1RJVExFJyksXG4gICAgICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkdVSURFX0NMT1VEX1NFVFVQX1RFWFQnKSxcbiAgICAgICAgICAgICAgc25pcHBldDogX3NuaXBwZXRfc2VydmljZS5zaW5nbGV0b24uZ2V0U25pcHBldCgnZXhhbXBsZUNsb3VkJylcbiAgICAgICAgICAgIH0pLCBfc2VjdGlvbignc3BvdC1ydW4nLCB7XG4gICAgICAgICAgICAgIHRpdGxlOiBsKCdzZWN0aW9ucy5HVUlERV9TUE9UX1JVTl9USVRMRScpLFxuICAgICAgICAgICAgICB0ZXh0OiBsKCdzZWN0aW9ucy5HVUlERV9TUE9UX1JVTl9URVhUJyksXG4gICAgICAgICAgICAgIHNuaXBwZXQ6IF9zbmlwcGV0X3NlcnZpY2Uuc2luZ2xldG9uLmdldFNuaXBwZXQoJ2V4YW1wbGVTcG90JylcbiAgICAgICAgICAgIH0pLCBfc2VjdGlvbigndGVybWluYWwtdXNlJywge1xuICAgICAgICAgICAgICB0aXRsZTogbCgnc2VjdGlvbnMuR1VJREVfVEVSTUlOQUxfVVNFX1RJVExFJyksXG4gICAgICAgICAgICAgIHRleHQ6IGwoJ3NlY3Rpb25zLkdVSURFX1RFUk1JTkFMX1VTRV9URVhUJyksXG4gICAgICAgICAgICAgIHNuaXBwZXQ6IF9zbmlwcGV0X3NlcnZpY2Uuc2luZ2xldG9uLmdldFNuaXBwZXQoJ2V4YW1wbGVUZXJtaW5hbCcpXG4gICAgICAgICAgICB9KV0pLFxuICAgICAgICAgICAgX2lmVG9nZ2xlKCdSRUZFUkVOQ0VTJywgWydObyByZWZlcmVuY2UgYXZhaWxhYmxlIHlldCddKSxcbiAgICAgICAgICAgIF9pZlRvZ2dsZSgnVElQUycsIFsnTm8gdGlwcyBhdmFpbGFibGUgeWV0J10pXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDdXN0b21cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgaGFuZGxlVG9nZ2xlOiBmdW5jdGlvbiBoYW5kbGVUb2dnbGUoZSkge1xuICAgIHZhciBzID0gdGhpcztcbiAgICBzLnNldFN0YXRlKHsgdG9nZ2xlOiBlLmRhdGEgfSk7XG4gIH0sXG4gIGdldFRvZ2dsZU9wdGlvbnM6IGZ1bmN0aW9uIGdldFRvZ2dsZU9wdGlvbnMoKSB7XG4gICAgdmFyIHMgPSB0aGlzO1xuICAgIHZhciBsID0gcy5nZXRMb2NhbGUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgUVVJQ0tfU1RBUlQ6IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnc3BhbicsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGwoJ3RvZ2dsZXMuUVVJQ0tfU1RBUlQnKVxuICAgICAgKSxcbiAgICAgIFJFRkVSRU5DRVM6IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnc3BhbicsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGwoJ3RvZ2dsZXMuUkVGRVJFTkNFUycpXG4gICAgICApLFxuICAgICAgVElQUzogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdzcGFuJyxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgbCgndG9nZ2xlcy5USVBTJylcbiAgICAgIClcbiAgICB9O1xuICB9LFxuXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFByaXZhdGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX3JlbmRlclNlY3Rpb246IGZ1bmN0aW9uIF9yZW5kZXJTZWN0aW9uKG5hbWUsIGNvbmZpZykge1xuICAgIHZhciB0aXRsZSA9IGNvbmZpZy50aXRsZTtcbiAgICB2YXIgdGV4dCA9IGNvbmZpZy50ZXh0O1xuICAgIHZhciBzbmlwcGV0ID0gY29uZmlnLnNuaXBwZXQ7XG5cbiAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBfYXBlbWFuUmVhY3RCYXNpYy5BcFNlY3Rpb24sXG4gICAgICB7IGlkOiAnZ3VpZGUtJyArIG5hbWUgKyAnLXNlY3Rpb24nLFxuICAgICAgICBjbGFzc05hbWU6ICdndWlkZS1zZWN0aW9uJyxcbiAgICAgICAga2V5OiBuYW1lXG4gICAgICB9LFxuICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9hcGVtYW5SZWFjdEJhc2ljLkFwU2VjdGlvbkhlYWRlcixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgdGl0bGVcbiAgICAgICksXG4gICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgX2FwZW1hblJlYWN0QmFzaWMuQXBTZWN0aW9uQm9keSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS10ZXh0LWNvbnRhaW5lcicgfSxcbiAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS1kZXNjcmlwdGlvbicgfSxcbiAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXJrZG93bjIuZGVmYXVsdCwgeyBzcmM6IFtdLmNvbmNhdCh0ZXh0KS5qb2luKF9tYXJrZG93bi5FT0wgKyBfbWFya2Rvd24uRU9MKSB9KVxuICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgeyBjbGFzc05hbWU6ICdndWlkZS1pbWFnZS1jb250YWluZXInIH0sXG4gICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZ3VpZGUtc25pcHBldCcgfSxcbiAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9zbmlwcGV0Mi5kZWZhdWx0LCB7IHNyYzogc25pcHBldCB9KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1aWRlVmlldzsiLCIvKipcbiAqIEBuYW1lc3BhY2UgU25pcHBldENvbnN0YW50c1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZXhhbXBsZVRlcm1pbmFsID0gZXhwb3J0cy5leGFtcGxlU3BvdCA9IGV4cG9ydHMuZXhhbXBsZUNsb3VkID0gZXhwb3J0cy5leGFtcGxlVXNhZ2UgPSB1bmRlZmluZWQ7XG5cbnZhciBfYXBlSGlnaGxpZ2h0aW5nID0gcmVxdWlyZSgnYXBlLWhpZ2hsaWdodGluZycpO1xuXG52YXIgX2ZzID0gcmVxdWlyZSgnZnMnKTtcblxudmFyIF9mczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9mcyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBleGlzdHMgPSBmdW5jdGlvbiBleGlzdHMoZmlsZW5hbWUpIHtcbiAgcmV0dXJuIF9mczIuZGVmYXVsdC5leGlzdHNTeW5jICYmIF9mczIuZGVmYXVsdC5leGlzdHNTeW5jKGZpbGVuYW1lKTtcbn07XG52YXIgcmVhZCA9IGZ1bmN0aW9uIHJlYWQoZmlsZW5hbWUpIHtcbiAgcmV0dXJuIGV4aXN0cyhmaWxlbmFtZSkgJiYgX2ZzMi5kZWZhdWx0LnJlYWRGaWxlU3luYyhmaWxlbmFtZSkudG9TdHJpbmcoKSB8fCBudWxsO1xufTtcblxudmFyIGV4YW1wbGVVc2FnZSA9IF9hcGVIaWdobGlnaHRpbmcuaGlnaGxpZ2h0SnN4LmNvZGUocmVhZChyZXF1aXJlLnJlc29sdmUoJ3N1Z29zL2V4YW1wbGUvZXhhbXBsZS11c2FnZS5qcycpKSk7XG52YXIgZXhhbXBsZUNsb3VkID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9tb2R1bGVzL2V4YW1wbGUtY2xvdWQuanMnKSkpO1xudmFyIGV4YW1wbGVTcG90ID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9tb2R1bGVzL2V4YW1wbGUtc3BvdC5qcycpKSk7XG52YXIgZXhhbXBsZVRlcm1pbmFsID0gX2FwZUhpZ2hsaWdodGluZy5oaWdobGlnaHRKc3guY29kZShyZWFkKHJlcXVpcmUucmVzb2x2ZSgnc3Vnb3MvZXhhbXBsZS9tb2R1bGVzL2V4YW1wbGUtdGVybWluYWwuanMnKSkpO1xuXG5leHBvcnRzLmV4YW1wbGVVc2FnZSA9IGV4YW1wbGVVc2FnZTtcbmV4cG9ydHMuZXhhbXBsZUNsb3VkID0gZXhhbXBsZUNsb3VkO1xuZXhwb3J0cy5leGFtcGxlU3BvdCA9IGV4YW1wbGVTcG90O1xuZXhwb3J0cy5leGFtcGxlVGVybWluYWwgPSBleGFtcGxlVGVybWluYWw7IiwiLyoqXG4gKiBAY2xhc3MgTGlua1NlcnZpY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLyoqIEBsZW5kcyBMaW5rU2VydmljZSAqL1xuXG52YXIgTGlua1NlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIExpbmtTZXJ2aWNlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaW5rU2VydmljZSk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTGlua1NlcnZpY2UsIFt7XG4gICAga2V5OiAncmVzb2x2ZUh0bWxMaW5rJyxcblxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZSBhIGh0bWwgbGlua1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIEh0bWwgZmlsZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gLSBSZXNvbHZlZCBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZUh0bWxMaW5rKGZpbGVuYW1lKSB7XG4gICAgICB2YXIgcyA9IHRoaXM7XG4gICAgICB2YXIgbGFuZyA9IHMuX2dldExhbmcoKTtcbiAgICAgIHZhciBodG1sRGlyID0gbGFuZyA/ICdodG1sLycgKyBsYW5nIDogJ2h0bWwnO1xuICAgICAgcmV0dXJuIHBhdGguam9pbihodG1sRGlyLCBmaWxlbmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2dldExhbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0TGFuZygpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTEFORztcbiAgICAgIH1cbiAgICAgIHJldHVybiB3aW5kb3cubGFuZztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTGlua1NlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgTGlua1NlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihMaW5rU2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gTGlua1NlcnZpY2U7IiwiLyoqXG4gKiBAY2xhc3MgU25pcHBldFNlcnZpY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKiogQGxlbmRzIFNuaXBwZXRTZXJ2aWNlICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBTbmlwcGV0U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU25pcHBldFNlcnZpY2UoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNuaXBwZXRTZXJ2aWNlKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTbmlwcGV0U2VydmljZSwgW3tcbiAgICBrZXk6ICdnZXRTbmlwcGV0JyxcblxuICAgIC8qKlxuICAgICAqIEdldCBzbmlwcGV0IHdpdGggbmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBzbmlwcGV0XG4gICAgICogQHJldHVybnMgez9zdHJpbmd9IC0gTWF0Y2hlZCBzbmlwcGV0XG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFNuaXBwZXQobmFtZSkge1xuICAgICAgdmFyIHMgPSB0aGlzO1xuICAgICAgdmFyIHNuaXBwZXRzID0gcy5fZ2V0U25pcHBldHMoKTtcbiAgICAgIHJldHVybiBzbmlwcGV0c1tuYW1lXTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfZ2V0U25pcHBldHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0U25pcHBldHMoKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoJy4uL2NvbnN0YW50cy9zbmlwcGV0X2NvbnN0YW50cycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdpbmRvdy5zbmlwcGV0cztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU25pcHBldFNlcnZpY2U7XG59KCk7XG5cbnZhciBzaW5nbGV0b24gPSBuZXcgU25pcHBldFNlcnZpY2UoKTtcblxuT2JqZWN0LmFzc2lnbihTbmlwcGV0U2VydmljZSwge1xuICBzaW5nbGV0b246IHNpbmdsZXRvblxufSk7XG5cbmV4cG9ydHMuc2luZ2xldG9uID0gc2luZ2xldG9uO1xuZXhwb3J0cy5kZWZhdWx0ID0gU25pcHBldFNlcnZpY2U7IiwiLyoqXG4gKiBAZnVuY3Rpb24gaGlnaGxpZ2h0SnN4XG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjIC0gU291cmNlIHN0cmluZy5cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gT3B0aW9uYWwgc2V0dGluZ3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAtIEhpZ2hsaWdodGVkIHN0cmluZy5cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgbnNoID0gcmVxdWlyZSgnbm9kZS1zeW50YXhoaWdobGlnaHRlcicpXG5jb25zdCBqc3ggPSByZXF1aXJlKCdqc3gtc3ludGF4aGlnaGxpZ2h0ZXInKVxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5cbi8qKiBAbGVuZHMgaGlnaGxpZ2h0SnN4ICovXG5mdW5jdGlvbiBoaWdobGlnaHRKc3ggKHNyYywgb3B0aW9ucyA9IHt9KSB7XG4gIGxldCBzdHlsZSA9IGhpZ2hsaWdodEpzeC5zdHlsZSgpXG4gIGxldCBjb2RlID0gaGlnaGxpZ2h0SnN4LmNvZGUoc3JjKVxuICByZXR1cm4gW1xuICAgICc8ZGl2PicsXG4gICAgJzxzdHlsZSBzY29wZWQ9XCJzY29wZWRcIj4nICsgc3R5bGUgKyAnPC9zdHlsZT4nLFxuICAgIGNvZGUsXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCcnKVxufVxuXG5oaWdobGlnaHRKc3guY29kZSA9IGZ1bmN0aW9uIChzcmMpIHtcbiAgcmV0dXJuIG5zaC5oaWdobGlnaHQoc3JjLCBqc3gsIHsgZ3V0dGVyOiBmYWxzZSB9KVxufVxuXG5oaWdobGlnaHRKc3guc3R5bGUgPSBmdW5jdGlvbiAoKSB7XG4gIGxldCBmaWxlbmFtZSA9IG5zaC5nZXRTdHlsZXMoKVsgMCBdLnNvdXJjZVBhdGhcbiAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSkudG9TdHJpbmcoKVxufVxuXG5oaWdobGlnaHRKc3guZnJvbUZpbGUgPSBmdW5jdGlvbiAoZmlsZW5hbWUsIG9wdGlvbnMpIHtcbiAgbGV0IHNyYyA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSkudG9TdHJpbmcoKVxuICByZXR1cm4gaGlnaGxpZ2h0SnN4KHNyYywgb3B0aW9ucylcbn1cbm1vZHVsZS5leHBvcnRzID0gaGlnaGxpZ2h0SnN4XG4iLCIvKipcbiAqIGFwZSBmcmFtZXdvcmsgbW9kdWxlIGZvciBoaWdobGlnaHRpbmcuXG4gKiBAbW9kdWxlIGFwZS1oaWdobGlnaHRpbmdcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxubGV0IGQgPSAobW9kdWxlKSA9PiBtb2R1bGUuZGVmYXVsdCB8fCBtb2R1bGVcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBoaWdobGlnaHRKc3ggKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2hpZ2hsaWdodF9qc3gnKSkgfVxufVxuIiwiLyoqXG4gKiBNYXJrZG93biBjb21wb25lbnRcbiAqIEBjb25zdHJ1Y3RvciBBcE1hcmtkb3duXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcyBhcyB0eXBlc30gZnJvbSAncmVhY3QnXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuaW1wb3J0IEFwUHVyZU1peGluIGZyb20gJ2FwZW1hbi1yZWFjdC1taXhpbnMnXG5pbXBvcnQge0VPTH0gZnJvbSAnb3MnXG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCdcblxuLyoqIEBsZW5kcyBBcE1hcmtkb3duICovXG5jb25zdCBBcE1hcmtkb3duID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNwZWNzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqIFNvdXJjZSB0ZXh0ICovXG4gICAgc3JjOiB0eXBlcy5zdHJpbmcsXG4gICAgLyoqIExpbmsgdXJscyAqL1xuICAgIGxpbmtzOiB0eXBlcy5vYmplY3RcbiAgfSxcblxuICBtaXhpbnM6IFtcbiAgICBBcFB1cmVNaXhpblxuICBdLFxuXG4gIHN0YXRpY3M6IHtcbiAgICBFT0xcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUgKCkge1xuICAgIHJldHVybiB7fVxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogbnVsbFxuICAgIH1cbiAgfSxcblxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgc3RhdGUsIHByb3BzIH0gPSBzXG4gICAgbGV0IGNvbnRlbnQgPSBzLmNvbXBpbGVNYXJrZG93bihbXS5jb25jYXQocHJvcHMuc3JjLCBwcm9wcy5jaGlsZHJlbikpXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsgY2xhc3NuYW1lcygnYXAtbWFya2Rvd24nLCBwcm9wcy5jbGFzc05hbWUpIH1cbiAgICAgICAgICAgc3R5bGU9eyBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5zdHlsZSkgfT5cbiAgICAgICAgPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17IHtfX2h0bWw6IGNvbnRlbnR9IH0+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gTGlmZWN5Y2xlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEN1c3RvbVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cbiAgLyoqXG4gICAqIENvbXBpbGUgbWFya2Rvd24gdGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ3xzdHJpbmdbXX0gc3JjXG4gICAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICAgKi9cbiAgY29tcGlsZU1hcmtkb3duIChzcmMpIHtcbiAgICBjb25zdCBzID0gdGhpc1xuICAgIGxldCB7IHByb3BzIH0gPSBzXG4gICAgaWYgKCFzcmMpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5qb2luKEVPTClcbiAgICB9XG4gICAgbGV0IGxpbmtzID0gT2JqZWN0LmtleXMocHJvcHMubGlua3MgfHwge30pXG4gICAgICAubWFwKChuYW1lKSA9PiBgWyR7bmFtZX1dOiAke3Byb3BzLmxpbmtzWyBuYW1lIF19YClcbiAgICAgIC5qb2luKEVPTClcbiAgICByZXR1cm4gbWFya2VkKFsgc3JjLCBsaW5rcyBdLmpvaW4oRU9MKSlcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBQcml2YXRlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxufSlcblxuZXhwb3J0IGRlZmF1bHQgQXBNYXJrZG93blxuIiwiLyoqXG4gKiBTdHlsZSBmb3IgQXBNYXJrZG93bi5cbiAqIEBjb25zdHJ1Y3RvciBBcE1hcmtkb3duU3R5bGVcbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzIGFzIHR5cGVzfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7QXBTdHlsZX0gZnJvbSAnYXBlbWFuLXJlYWN0LXN0eWxlJ1xuXG4vKiogQGxlbmRzIEFwTWFya2Rvd25TdHlsZSAqL1xuY29uc3QgQXBNYXJrZG93blN0eWxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBzdHlsZTogdHlwZXMub2JqZWN0LFxuICAgIGhpZ2hsaWdodENvbG9yOiB0eXBlcy5zdHJpbmdcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3R5bGU6IHt9LFxuICAgICAgaGlnaGxpZ2h0Q29sb3I6IEFwU3R5bGUuREVGQVVMVF9ISUdITElHSFRfQ09MT1IsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IEFwU3R5bGUuREVGQVVMVF9CQUNLR1JPVU5EX0NPTE9SXG4gICAgfVxuICB9LFxuICByZW5kZXIgKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzXG4gICAgbGV0IHsgcHJvcHMgfSA9IHNcblxuICAgIGxldCB7IGhpZ2hsaWdodENvbG9yLCBiYWNrZ3JvdW5kQ29sb3IgfSA9IHByb3BzXG5cbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICcuYXAtbWFya2Rvd24nOiB7XG4gICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknIC8vRm9yY2UgcmVuZGVyaW5nXG4gICAgICB9XG4gICAgfVxuICAgIGxldCBzbWFsbE1lZGlhRGF0YSA9IHt9XG4gICAgbGV0IG1lZGl1bU1lZGlhRGF0YSA9IHt9XG4gICAgbGV0IGxhcmdlTWVkaWFEYXRhID0ge31cbiAgICByZXR1cm4gKFxuICAgICAgPEFwU3R5bGUgZGF0YT17IE9iamVjdC5hc3NpZ24oZGF0YSwgcHJvcHMuc3R5bGUpIH1cbiAgICAgICAgICAgICAgIHNtYWxsTWVkaWFEYXRhPXsgc21hbGxNZWRpYURhdGEgfVxuICAgICAgICAgICAgICAgbWVkaXVtTWVkaWFEYXRhPXsgbWVkaXVtTWVkaWFEYXRhIH1cbiAgICAgICAgICAgICAgIGxhcmdlTWVkaWFEYXRhPXsgbGFyZ2VNZWRpYURhdGEgfVxuICAgICAgPnsgcHJvcHMuY2hpbGRyZW4gfTwvQXBTdHlsZT5cbiAgICApXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IEFwTWFya2Rvd25TdHlsZVxuIiwiLyoqXG4gKiBhcGVtYW4gcmVhY3QgcGFja2FnZSB0byByZW5kZXIgbWFya2Rvd25zXG4gKiBAbW9kdWxlIGFwZW1hbi1yZWFjdC1tYXJrZG93blxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZCA9IChtb2R1bGUpID0+IG1vZHVsZS5kZWZhdWx0IHx8IG1vZHVsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IEFwTWFya2Rvd25TdHlsZSAoKSB7IHJldHVybiBkKHJlcXVpcmUoJy4vYXBfbWFya2Rvd25fc3R5bGUnKSkgfSxcbiAgZ2V0IEFwTWFya2Rvd24gKCkgeyByZXR1cm4gZChyZXF1aXJlKCcuL2FwX21hcmtkb3duJykpIH1cbn1cbiIsInZhciBYUmVnRXhwID0gcmVxdWlyZShcIm5vZGUtc3ludGF4aGlnaGxpZ2h0ZXIvbGliL3NjcmlwdHMvWFJlZ0V4cFwiKS5YUmVnRXhwO1xyXG52YXIgU3ludGF4SGlnaGxpZ2h0ZXI7XHJcbjsoZnVuY3Rpb24oKVxyXG57XHJcblx0Ly8gQ29tbW9uSlNcclxuXHRTeW50YXhIaWdobGlnaHRlciA9IFN5bnRheEhpZ2hsaWdodGVyIHx8ICh0eXBlb2YgcmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCc/IHJlcXVpcmUoXCJub2RlLXN5bnRheGhpZ2hsaWdodGVyL2xpYi9zY3JpcHRzL3NoQ29yZVwiKS5TeW50YXhIaWdobGlnaHRlciA6IG51bGwpO1xyXG5cclxuXHRmdW5jdGlvbiBCcnVzaCgpXHJcblx0e1xyXG5cdFx0ZnVuY3Rpb24gcHJvY2VzcyhtYXRjaCwgcmVnZXhJbmZvKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgY29uc3RydWN0b3IgPSBTeW50YXhIaWdobGlnaHRlci5NYXRjaCxcclxuXHRcdFx0XHRjb2RlID0gbWF0Y2hbMF0sXHJcblx0XHRcdFx0dGFnID0gbmV3IFhSZWdFeHAoJygmbHQ7fDwpW1xcXFxzXFxcXC9cXFxcP10qKD88bmFtZT5bOlxcXFx3LVxcXFwuXSspJywgJ3hnJykuZXhlYyhjb2RlKSxcclxuXHRcdFx0XHRyZXN1bHQgPSBbXVxyXG5cdFx0XHRcdDtcclxuXHRcdFxyXG5cdFx0XHRpZiAobWF0Y2guYXR0cmlidXRlcyAhPSBudWxsKSBcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBhdHRyaWJ1dGVzLFxyXG5cdFx0XHRcdFx0cmVnZXggPSBuZXcgWFJlZ0V4cCgnKD88bmFtZT4gW1xcXFx3OlxcXFwtXFxcXC5dKyknICtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQnXFxcXHMqPVxcXFxzKicgK1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCcoPzx2YWx1ZT4gXCIuKj9cInxcXCcuKj9cXCd8XFxcXHcrKScsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0J3hnJyk7XHJcblxyXG5cdFx0XHRcdHdoaWxlICgoYXR0cmlidXRlcyA9IHJlZ2V4LmV4ZWMoY29kZSkpICE9IG51bGwpIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzLm5hbWUsIG1hdGNoLmluZGV4ICsgYXR0cmlidXRlcy5pbmRleCwgJ2NvbG9yMScpKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzLnZhbHVlLCBtYXRjaC5pbmRleCArIGF0dHJpYnV0ZXMuaW5kZXggKyBhdHRyaWJ1dGVzWzBdLmluZGV4T2YoYXR0cmlidXRlcy52YWx1ZSksICdzdHJpbmcnKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAodGFnICE9IG51bGwpXHJcblx0XHRcdFx0cmVzdWx0LnB1c2goXHJcblx0XHRcdFx0XHRuZXcgY29uc3RydWN0b3IodGFnLm5hbWUsIG1hdGNoLmluZGV4ICsgdGFnWzBdLmluZGV4T2YodGFnLm5hbWUpLCAna2V5d29yZCcpXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBrZXl3b3JkcyA9XHQnYnJlYWsgY2FzZSBjYXRjaCBjb250aW51ZSAnICtcclxuXHRcdFx0XHRcdFx0J2RlZmF1bHQgZGVsZXRlIGRvIGVsc2UgZmFsc2UgICcgK1xyXG5cdFx0XHRcdFx0XHQnZm9yIGZ1bmN0aW9uIGlmIGluIGluc3RhbmNlb2YgJyArXHJcblx0XHRcdFx0XHRcdCduZXcgbnVsbCByZXR1cm4gc3VwZXIgc3dpdGNoICcgK1xyXG5cdFx0XHRcdFx0XHQndGhpcyB0aHJvdyB0cnVlIHRyeSB0eXBlb2YgdmFyIHdoaWxlIHdpdGgnXHJcblx0XHRcdFx0XHRcdDtcclxuXHJcblx0XHR2YXIgciA9IFN5bnRheEhpZ2hsaWdodGVyLnJlZ2V4TGliO1xyXG5cdFxyXG5cdFx0dGhpcy5yZWdleExpc3QgPSBbXHJcblx0XHRcdHsgcmVnZXg6IHIubXVsdGlMaW5lRG91YmxlUXVvdGVkU3RyaW5nLFx0XHRcdFx0XHRjc3M6ICdzdHJpbmcnIH0sXHRcdFx0Ly8gZG91YmxlIHF1b3RlZCBzdHJpbmdzXHJcblx0XHRcdHsgcmVnZXg6IHIubXVsdGlMaW5lU2luZ2xlUXVvdGVkU3RyaW5nLFx0XHRcdFx0XHRjc3M6ICdzdHJpbmcnIH0sXHRcdFx0Ly8gc2luZ2xlIHF1b3RlZCBzdHJpbmdzXHJcblx0XHRcdHsgcmVnZXg6IHIuc2luZ2xlTGluZUNDb21tZW50cyxcdFx0XHRcdFx0XHRcdGNzczogJ2NvbW1lbnRzJyB9LFx0XHRcdC8vIG9uZSBsaW5lIGNvbW1lbnRzXHJcblx0XHRcdHsgcmVnZXg6IHIubXVsdGlMaW5lQ0NvbW1lbnRzLFx0XHRcdFx0XHRcdFx0Y3NzOiAnY29tbWVudHMnIH0sXHRcdFx0Ly8gbXVsdGlsaW5lIGNvbW1lbnRzXHJcblx0XHRcdHsgcmVnZXg6IC9cXHMqIy4qL2dtLFx0XHRcdFx0XHRcdFx0XHRcdGNzczogJ3ByZXByb2Nlc3NvcicgfSxcdFx0Ly8gcHJlcHJvY2Vzc29yIHRhZ3MgbGlrZSAjcmVnaW9uIGFuZCAjZW5kcmVnaW9uXHJcblx0XHRcdHsgcmVnZXg6IG5ldyBSZWdFeHAodGhpcy5nZXRLZXl3b3JkcyhrZXl3b3JkcyksICdnbScpLFx0Y3NzOiAna2V5d29yZCcgfSxcclxuXHRcdFx0XHJcblx0XHRcdHsgcmVnZXg6IG5ldyBYUmVnRXhwKCcoXFxcXCZsdDt8PClcXFxcIVxcXFxbW1xcXFx3XFxcXHNdKj9cXFxcWygufFxcXFxzKSo/XFxcXF1cXFxcXShcXFxcJmd0O3w+KScsICdnbScpLFx0XHRcdGNzczogJ2NvbG9yMicgfSxcdC8vIDwhWyAuLi4gWyAuLi4gXV0+XHJcblx0XHRcdHsgcmVnZXg6IFN5bnRheEhpZ2hsaWdodGVyLnJlZ2V4TGliLnhtbENvbW1lbnRzLFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNzczogJ2NvbW1lbnRzJyB9LFx0Ly8gPCEtLSAuLi4gLS0+XHJcblx0XHRcdHsgcmVnZXg6IG5ldyBYUmVnRXhwKCcoJmx0O3w8KVtcXFxcc1xcXFwvXFxcXD9dKihcXFxcdyspKD88YXR0cmlidXRlcz4uKj8pW1xcXFxzXFxcXC9cXFxcP10qKCZndDt8PiknLCAnc2cnKSwgZnVuYzogcHJvY2VzcyB9XHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHR0aGlzLmZvckh0bWxTY3JpcHQoci5zY3JpcHRTY3JpcHRUYWdzKTtcclxuXHR9O1xyXG5cclxuXHRCcnVzaC5wcm90b3R5cGVcdD0gbmV3IFN5bnRheEhpZ2hsaWdodGVyLkhpZ2hsaWdodGVyKCk7XHJcblx0QnJ1c2guYWxpYXNlc1x0PSBbJ2pzeCddO1xyXG5cclxuXHRTeW50YXhIaWdobGlnaHRlci5icnVzaGVzLkpTWCA9IEJydXNoO1xyXG5cclxuXHQvLyBDb21tb25KU1xyXG5cdHR5cGVvZihleHBvcnRzKSAhPSAndW5kZWZpbmVkJyA/IGV4cG9ydHMuQnJ1c2ggPSBCcnVzaCA6IG51bGw7XHJcbn0pKCk7XHJcbiIsIi8qKlxuICogbWFya2VkIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkXG4gKi9cblxuOyhmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXlxcbisvLFxuICBjb2RlOiAvXiggezR9W15cXG5dK1xcbiopKy8sXG4gIGZlbmNlczogbm9vcCxcbiAgaHI6IC9eKCAqWy0qX10pezMsfSAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSAqKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvLFxuICBucHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gKig9fC0pezIsfSAqKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCAqPlteXFxuXSsoXFxuKD8hZGVmKVteXFxuXSspKlxcbiopKy8sXG4gIGxpc3Q6IC9eKCAqKShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogL14gKig/OmNvbW1lbnQgKig/OlxcbnxcXHMqJCl8Y2xvc2VkICooPzpcXG57Mix9fFxccyokKXxjbG9zaW5nICooPzpcXG57Mix9fFxccyokKSkvLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArW1wiKF0oW15cXG5dKylbXCIpXSk/ICooPzpcXG4rfCQpLyxcbiAgdGFibGU6IG5vb3AsXG4gIHBhcmFncmFwaDogL14oKD86W15cXG5dK1xcbj8oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8dGFnfGRlZikpKylcXG4qLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZCtcXC4pLztcbmJsb2NrLml0ZW0gPSAvXiggKikoYnVsbCkgW15cXG5dKig/Olxcbig/IVxcMWJ1bGwgKVteXFxuXSopKi87XG5ibG9jay5pdGVtID0gcmVwbGFjZShibG9jay5pdGVtLCAnZ20nKVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoKTtcblxuYmxvY2subGlzdCA9IHJlcGxhY2UoYmxvY2subGlzdClcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzpbLSpfXSAqKXszLH0oPzpcXFxcbit8JCkpJylcbiAgKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gICgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gcmVwbGFjZShibG9jay5ibG9ja3F1b3RlKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbmJsb2NrLl90YWcgPSAnKD8hKD86J1xuICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZSdcbiAgKyAnfHZhcnxzYW1wfGtiZHxzdWJ8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvJ1xuICArICd8c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpXFxcXGIpXFxcXHcrKD8hOi98W15cXFxcd1xcXFxzQF0qQClcXFxcYic7XG5cbmJsb2NrLmh0bWwgPSByZXBsYWNlKGJsb2NrLmh0bWwpXG4gICgnY29tbWVudCcsIC88IS0tW1xcc1xcU10qPy0tPi8pXG4gICgnY2xvc2VkJywgLzwodGFnKVtcXHNcXFNdKz88XFwvXFwxPi8pXG4gICgnY2xvc2luZycsIC88dGFnKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LylcbiAgKC90YWcvZywgYmxvY2suX3RhZylcbiAgKCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJ2hyJywgYmxvY2suaHIpXG4gICgnaGVhZGluZycsIGJsb2NrLmhlYWRpbmcpXG4gICgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgKCdibG9ja3F1b3RlJywgYmxvY2suYmxvY2txdW90ZSlcbiAgKCd0YWcnLCAnPCcgKyBibG9jay5fdGFnKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSBtZXJnZSh7fSwgYmxvY2spO1xuXG4vKipcbiAqIEdGTSBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2suZ2ZtID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBmZW5jZXM6IC9eICooYHszLH18fnszLH0pWyBcXC5dKihcXFMrKT8gKlxcbihbXFxzXFxTXSo/KVxccypcXDEgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IC9eLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICsoW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS9cbn0pO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnKD8hJywgJyg/ISdcbiAgICArIGJsb2NrLmdmbS5mZW5jZXMuc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwyJykgKyAnfCdcbiAgICArIGJsb2NrLmxpc3Quc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwzJykgKyAnfCcpXG4gICgpO1xuXG4vKipcbiAqIEdGTSArIFRhYmxlcyBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2sudGFibGVzID0gbWVyZ2Uoe30sIGJsb2NrLmdmbSwge1xuICBucHRhYmxlOiAvXiAqKFxcUy4qXFx8LiopXFxuICooWy06XSsgKlxcfFstfCA6XSopXFxuKCg/Oi4qXFx8LiooPzpcXG58JCkpKilcXG4qLyxcbiAgdGFibGU6IC9eICpcXHwoLispXFxuICpcXHwoICpbLTpdK1stfCA6XSopXFxuKCg/OiAqXFx8LiooPzpcXG58JCkpKilcXG4qL1xufSk7XG5cbi8qKlxuICogQmxvY2sgTGV4ZXJcbiAqL1xuXG5mdW5jdGlvbiBMZXhlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW5zLmxpbmtzID0ge307XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLnJ1bGVzID0gYmxvY2subm9ybWFsO1xuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50YWJsZXMpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay50YWJsZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay5nZm07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIEJsb2NrIFJ1bGVzXG4gKi9cblxuTGV4ZXIucnVsZXMgPSBibG9jaztcblxuLyoqXG4gKiBTdGF0aWMgTGV4IE1ldGhvZFxuICovXG5cbkxleGVyLmxleCA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucykge1xuICB2YXIgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbn07XG5cbi8qKlxuICogUHJlcHJvY2Vzc2luZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS5sZXggPSBmdW5jdGlvbihzcmMpIHtcbiAgc3JjID0gc3JjXG4gICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpXG4gICAgLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKVxuICAgIC5yZXBsYWNlKC9cXHUyNDI0L2csICdcXG4nKTtcblxuICByZXR1cm4gdGhpcy50b2tlbihzcmMsIHRydWUpO1xufTtcblxuLyoqXG4gKiBMZXhpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUudG9rZW4gPSBmdW5jdGlvbihzcmMsIHRvcCwgYnEpIHtcbiAgdmFyIHNyYyA9IHNyYy5yZXBsYWNlKC9eICskL2dtLCAnJylcbiAgICAsIG5leHRcbiAgICAsIGxvb3NlXG4gICAgLCBjYXBcbiAgICAsIGJ1bGxcbiAgICAsIGJcbiAgICAsIGl0ZW1cbiAgICAsIHNwYWNlXG4gICAgLCBpXG4gICAgLCBsO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBuZXdsaW5lXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubmV3bGluZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzBdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ3NwYWNlJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiB7NH0vZ20sICcnKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IGNhcC5yZXBsYWNlKC9cXG4rJC8sICcnKVxuICAgICAgICAgIDogY2FwXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGZlbmNlcyAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmZlbmNlcy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICBsYW5nOiBjYXBbMl0sXG4gICAgICAgIHRleHQ6IGNhcFszXSB8fCAnJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgdGV4dDogY2FwWzJdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIG5vIGxlYWRpbmcgcGlwZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMubnB0YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXS5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxoZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMl0gPT09ICc9JyA/IDEgOiAyLFxuICAgICAgICB0ZXh0OiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oci5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hyJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBibG9ja3F1b3RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYmxvY2txdW90ZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9zdGFydCdcbiAgICAgIH0pO1xuXG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiAqPiA/L2dtLCAnJyk7XG5cbiAgICAgIC8vIFBhc3MgYHRvcGAgdG8ga2VlcCB0aGUgY3VycmVudFxuICAgICAgLy8gXCJ0b3BsZXZlbFwiIHN0YXRlLiBUaGlzIGlzIGV4YWN0bHlcbiAgICAgIC8vIGhvdyBtYXJrZG93bi5wbCB3b3Jrcy5cbiAgICAgIHRoaXMudG9rZW4oY2FwLCB0b3AsIHRydWUpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpc3RcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saXN0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGJ1bGwgPSBjYXBbMl07XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9zdGFydCcsXG4gICAgICAgIG9yZGVyZWQ6IGJ1bGwubGVuZ3RoID4gMVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBlYWNoIHRvcC1sZXZlbCBpdGVtLlxuICAgICAgY2FwID0gY2FwWzBdLm1hdGNoKHRoaXMucnVsZXMuaXRlbSk7XG5cbiAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgIGwgPSBjYXAubGVuZ3RoO1xuICAgICAgaSA9IDA7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBjYXBbaV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0IGl0ZW0ncyBidWxsZXRcbiAgICAgICAgLy8gc28gaXQgaXMgc2VlbiBhcyB0aGUgbmV4dCB0b2tlbi5cbiAgICAgICAgc3BhY2UgPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXiAqKFsqKy1dfFxcZCtcXC4pICsvLCAnJyk7XG5cbiAgICAgICAgLy8gT3V0ZGVudCB3aGF0ZXZlciB0aGVcbiAgICAgICAgLy8gbGlzdCBpdGVtIGNvbnRhaW5zLiBIYWNreS5cbiAgICAgICAgaWYgKH5pdGVtLmluZGV4T2YoJ1xcbiAnKSkge1xuICAgICAgICAgIHNwYWNlIC09IGl0ZW0ubGVuZ3RoO1xuICAgICAgICAgIGl0ZW0gPSAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCdeIHsxLCcgKyBzcGFjZSArICd9JywgJ2dtJyksICcnKVxuICAgICAgICAgICAgOiBpdGVtLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBuZXh0IGxpc3QgaXRlbSBiZWxvbmdzIGhlcmUuXG4gICAgICAgIC8vIEJhY2twZWRhbCBpZiBpdCBkb2VzIG5vdCBiZWxvbmcgaW4gdGhpcyBsaXN0LlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNtYXJ0TGlzdHMgJiYgaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBiID0gYmxvY2suYnVsbGV0LmV4ZWMoY2FwW2kgKyAxXSlbMF07XG4gICAgICAgICAgaWYgKGJ1bGwgIT09IGIgJiYgIShidWxsLmxlbmd0aCA+IDEgJiYgYi5sZW5ndGggPiAxKSkge1xuICAgICAgICAgICAgc3JjID0gY2FwLnNsaWNlKGkgKyAxKS5qb2luKCdcXG4nKSArIHNyYztcbiAgICAgICAgICAgIGkgPSBsIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciBpdGVtIGlzIGxvb3NlIG9yIG5vdC5cbiAgICAgICAgLy8gVXNlOiAvKF58XFxuKSg/ISApW15cXG5dK1xcblxcbig/IVxccyokKS9cbiAgICAgICAgLy8gZm9yIGRpc2NvdW50IGJlaGF2aW9yLlxuICAgICAgICBsb29zZSA9IG5leHQgfHwgL1xcblxcbig/IVxccyokKS8udGVzdChpdGVtKTtcbiAgICAgICAgaWYgKGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgbmV4dCA9IGl0ZW0uY2hhckF0KGl0ZW0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nO1xuICAgICAgICAgIGlmICghbG9vc2UpIGxvb3NlID0gbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6IGxvb3NlXG4gICAgICAgICAgICA/ICdsb29zZV9pdGVtX3N0YXJ0J1xuICAgICAgICAgICAgOiAnbGlzdF9pdGVtX3N0YXJ0J1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWN1cnNlLlxuICAgICAgICB0aGlzLnRva2VuKGl0ZW0sIGZhbHNlLCBicSk7XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbV9lbmQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3RfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGh0bWxcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5odG1sLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICdwYXJhZ3JhcGgnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHByZTogIXRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAmJiAoY2FwWzFdID09PSAncHJlJyB8fCBjYXBbMV0gPT09ICdzY3JpcHQnIHx8IGNhcFsxXSA9PT0gJ3N0eWxlJyksXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWZcbiAgICBpZiAoKCFicSAmJiB0b3ApICYmIChjYXAgPSB0aGlzLnJ1bGVzLmRlZi5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMubGlua3NbY2FwWzFdLnRvTG93ZXJDYXNlKCldID0ge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMudGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvKD86ICpcXHwgKik/XFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV1cbiAgICAgICAgICAucmVwbGFjZSgvXiAqXFx8ICp8ICpcXHwgKiQvZywgJycpXG4gICAgICAgICAgLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnBhcmFncmFwaC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICB0ZXh0OiBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIC8vIFRvcC1sZXZlbCBzaG91bGQgbmV2ZXIgcmVhY2ggaGVyZS5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFtcXFxcYCp7fVxcW1xcXSgpIytcXC0uIV8+XSkvLFxuICBhdXRvbGluazogL148KFteID5dKyhAfDpcXC8pW14gPl0rKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogL148IS0tW1xcc1xcU10qPy0tPnxePFxcLz9cXHcrKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LyxcbiAgbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFwoaHJlZlxcKS8sXG4gIHJlZmxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxccypcXFsoW15cXF1dKilcXF0vLFxuICBub2xpbms6IC9eIT9cXFsoKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV0pKilcXF0vLFxuICBzdHJvbmc6IC9eX18oW1xcc1xcU10rPylfXyg/IV8pfF5cXCpcXCooW1xcc1xcU10rPylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXFxiXygoPzpbXl9dfF9fKSs/KV9cXGJ8XlxcKigoPzpcXCpcXCp8W1xcc1xcU10pKz8pXFwqKD8hXFwqKS8sXG4gIGNvZGU6IC9eKGArKVxccyooW1xcc1xcU10qP1teYF0pXFxzKlxcMSg/IWApLyxcbiAgYnI6IC9eIHsyLH1cXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3AsXG4gIHRleHQ6IC9eW1xcc1xcU10rPyg/PVtcXFxcPCFcXFtfKmBdfCB7Mix9XFxufCQpL1xufTtcblxuaW5saW5lLl9pbnNpZGUgPSAvKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV18XFxdKD89W15cXFtdKlxcXSkpKi87XG5pbmxpbmUuX2hyZWYgPSAvXFxzKjw/KFtcXHNcXFNdKj8pPj8oPzpcXHMrWydcIl0oW1xcc1xcU10qPylbJ1wiXSk/XFxzKi87XG5cbmlubGluZS5saW5rID0gcmVwbGFjZShpbmxpbmUubGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAoKTtcblxuaW5saW5lLnJlZmxpbmsgPSByZXBsYWNlKGlubGluZS5yZWZsaW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0gbWVyZ2Uoe30sIGlubGluZSk7XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBzdHJvbmc6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICBlbTogL15fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKXxeXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKikvXG59KTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgZXNjYXBlOiByZXBsYWNlKGlubGluZS5lc2NhcGUpKCddKScsICd+fF0pJykoKSxcbiAgdXJsOiAvXihodHRwcz86XFwvXFwvW15cXHM8XStbXjwuLDo7XCInKVxcXVxcc10pLyxcbiAgZGVsOiAvXn5+KD89XFxTKShbXFxzXFxTXSo/XFxTKX5+LyxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUudGV4dClcbiAgICAoJ118JywgJ35dfCcpXG4gICAgKCd8JywgJ3xodHRwcz86Ly98JylcbiAgICAoKVxufSk7XG5cbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IHJlcGxhY2UoaW5saW5lLmJyKSgnezIsfScsICcqJykoKSxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUuZ2ZtLnRleHQpKCd7Mix9JywgJyonKSgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUgTGV4ZXIgJiBDb21waWxlclxuICovXG5cbmZ1bmN0aW9uIElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLmxpbmtzID0gbGlua3M7XG4gIHRoaXMucnVsZXMgPSBpbmxpbmUubm9ybWFsO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGlmICghdGhpcy5saW5rcykge1xuICAgIHRocm93IG5ld1xuICAgICAgRXJyb3IoJ1Rva2VucyBhcnJheSByZXF1aXJlcyBhIGBsaW5rc2AgcHJvcGVydHkuJyk7XG4gIH1cblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmJyZWFrcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5nZm07XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgIHRoaXMucnVsZXMgPSBpbmxpbmUucGVkYW50aWM7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgSW5saW5lIFJ1bGVzXG4gKi9cblxuSW5saW5lTGV4ZXIucnVsZXMgPSBpbmxpbmU7XG5cbi8qKlxuICogU3RhdGljIExleGluZy9Db21waWxpbmcgTWV0aG9kXG4gKi9cblxuSW5saW5lTGV4ZXIub3V0cHV0ID0gZnVuY3Rpb24oc3JjLCBsaW5rcywgb3B0aW9ucykge1xuICB2YXIgaW5saW5lID0gbmV3IElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKTtcbiAgcmV0dXJuIGlubGluZS5vdXRwdXQoc3JjKTtcbn07XG5cbi8qKlxuICogTGV4aW5nL0NvbXBpbGluZ1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihzcmMpIHtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsaW5rXG4gICAgLCB0ZXh0XG4gICAgLCBocmVmXG4gICAgLCBjYXA7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIGVzY2FwZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVzY2FwZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gY2FwWzFdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYXV0b2xpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5hdXRvbGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGNhcFsxXS5jaGFyQXQoNikgPT09ICc6J1xuICAgICAgICAgID8gdGhpcy5tYW5nbGUoY2FwWzFdLnN1YnN0cmluZyg3KSlcbiAgICAgICAgICA6IHRoaXMubWFuZ2xlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0aGlzLm1hbmdsZSgnbWFpbHRvOicpICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdXJsIChnZm0pXG4gICAgaWYgKCF0aGlzLmluTGluayAmJiAoY2FwID0gdGhpcy5ydWxlcy51cmwuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRhZy5leGVjKHNyYykpIHtcbiAgICAgIGlmICghdGhpcy5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pXG4gICAgICAgIDogY2FwWzBdXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH0pO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSB0aGlzLmxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmsgfHwgIWxpbmsuaHJlZikge1xuICAgICAgICBvdXQgKz0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgc3JjID0gY2FwWzBdLnN1YnN0cmluZygxKSArIHNyYztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwgbGluayk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gc3Ryb25nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuc3Ryb25nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnN0cm9uZyh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGVzcGFuKGVzY2FwZShjYXBbMl0sIHRydWUpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYnIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYnIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlbCAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmRlbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5kZWwodGhpcy5vdXRwdXQoY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KGVzY2FwZSh0aGlzLnNtYXJ0eXBhbnRzKGNhcFswXSkpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvbXBpbGUgTGlua1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXRMaW5rID0gZnVuY3Rpb24oY2FwLCBsaW5rKSB7XG4gIHZhciBocmVmID0gZXNjYXBlKGxpbmsuaHJlZilcbiAgICAsIHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG5cbiAgcmV0dXJuIGNhcFswXS5jaGFyQXQoMCkgIT09ICchJ1xuICAgID8gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIHRpdGxlLCB0aGlzLm91dHB1dChjYXBbMV0pKVxuICAgIDogdGhpcy5yZW5kZXJlci5pbWFnZShocmVmLCB0aXRsZSwgZXNjYXBlKGNhcFsxXSkpO1xufTtcblxuLyoqXG4gKiBTbWFydHlwYW50cyBUcmFuc2Zvcm1hdGlvbnNcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUuc21hcnR5cGFudHMgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzKSByZXR1cm4gdGV4dDtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn07XG5cbi8qKlxuICogTWFuZ2xlIExpbmtzXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm1hbmdsZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMubWFuZ2xlKSByZXR1cm4gdGV4dDtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsID0gdGV4dC5sZW5ndGhcbiAgICAsIGkgPSAwXG4gICAgLCBjaDtcblxuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cblxuZnVuY3Rpb24gUmVuZGVyZXIob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xufVxuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZSA9IGZ1bmN0aW9uKGNvZGUsIGxhbmcsIGVzY2FwZWQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgIGNvZGUgPSBvdXQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFsYW5nKSB7XG4gICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnXFxuPC9jb2RlPjwvcHJlPic7XG4gIH1cblxuICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICsgZXNjYXBlKGxhbmcsIHRydWUpXG4gICAgKyAnXCI+J1xuICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICsgJ1xcbjwvY29kZT48L3ByZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJsb2NrcXVvdGUgPSBmdW5jdGlvbihxdW90ZSkge1xuICByZXR1cm4gJzxibG9ja3F1b3RlPlxcbicgKyBxdW90ZSArICc8L2Jsb2NrcXVvdGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICByZXR1cm4gaHRtbDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5oZWFkaW5nID0gZnVuY3Rpb24odGV4dCwgbGV2ZWwsIHJhdykge1xuICByZXR1cm4gJzxoJ1xuICAgICsgbGV2ZWxcbiAgICArICcgaWQ9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4XG4gICAgKyByYXcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd10rL2csICctJylcbiAgICArICdcIj4nXG4gICAgKyB0ZXh0XG4gICAgKyAnPC9oJ1xuICAgICsgbGV2ZWxcbiAgICArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ociA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oYm9keSwgb3JkZXJlZCkge1xuICB2YXIgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgcmV0dXJuICc8JyArIHR5cGUgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdGl0ZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGxpPicgKyB0ZXh0ICsgJzwvbGk+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5wYXJhZ3JhcGggPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHA+JyArIHRleHQgKyAnPC9wPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGUgPSBmdW5jdGlvbihoZWFkZXIsIGJvZHkpIHtcbiAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICsgJzx0aGVhZD5cXG4nXG4gICAgKyBoZWFkZXJcbiAgICArICc8L3RoZWFkPlxcbidcbiAgICArICc8dGJvZHk+XFxuJ1xuICAgICsgYm9keVxuICAgICsgJzwvdGJvZHk+XFxuJ1xuICAgICsgJzwvdGFibGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZXJvdyA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgcmV0dXJuICc8dHI+XFxuJyArIGNvbnRlbnQgKyAnPC90cj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlY2VsbCA9IGZ1bmN0aW9uKGNvbnRlbnQsIGZsYWdzKSB7XG4gIHZhciB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gIHZhciB0YWcgPSBmbGFncy5hbGlnblxuICAgID8gJzwnICsgdHlwZSArICcgc3R5bGU9XCJ0ZXh0LWFsaWduOicgKyBmbGFncy5hbGlnbiArICdcIj4nXG4gICAgOiAnPCcgKyB0eXBlICsgJz4nO1xuICByZXR1cm4gdGFnICsgY29udGVudCArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuLy8gc3BhbiBsZXZlbCByZW5kZXJlclxuUmVuZGVyZXIucHJvdG90eXBlLnN0cm9uZyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8c3Ryb25nPicgKyB0ZXh0ICsgJzwvc3Ryb25nPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGVtPicgKyB0ZXh0ICsgJzwvZW0+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2Rlc3BhbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8Y29kZT4nICsgdGV4dCArICc8L2NvZGU+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5iciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5kZWwgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGRlbD4nICsgdGV4dCArICc8L2RlbD4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBpZiAodGhpcy5vcHRpb25zLnNhbml0aXplKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBwcm90ID0gZGVjb2RlVVJJQ29tcG9uZW50KHVuZXNjYXBlKGhyZWYpKVxuICAgICAgICAucmVwbGFjZSgvW15cXHc6XS9nLCAnJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cbiAgdmFyIG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaW1hZ2UgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuIHRleHQ7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zLCByZW5kZXJlcikge1xuICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zLCByZW5kZXJlcik7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVuZGVyZXIpO1xuICB0aGlzLnRva2VucyA9IHNyYy5yZXZlcnNlKCk7XG5cbiAgdmFyIG91dCA9ICcnO1xuICB3aGlsZSAodGhpcy5uZXh0KCkpIHtcbiAgICBvdXQgKz0gdGhpcy50b2soKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbn07XG5cbi8qKlxuICogUHJldmlldyBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXSB8fCAwO1xufTtcblxuLyoqXG4gKiBQYXJzZSBUZXh0IFRva2Vuc1xuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2R5ID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gIHdoaWxlICh0aGlzLnBlZWsoKS50eXBlID09PSAndGV4dCcpIHtcbiAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5uZXh0KCkudGV4dDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmlubGluZS5vdXRwdXQoYm9keSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIEN1cnJlbnQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnRvayA9IGZ1bmN0aW9uKCkge1xuICBzd2l0Y2ggKHRoaXMudG9rZW4udHlwZSkge1xuICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjYXNlICdocic6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgfVxuICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSxcbiAgICAgICAgdGhpcy50b2tlbi5kZXB0aCxcbiAgICAgICAgdGhpcy50b2tlbi50ZXh0KTtcbiAgICB9XG4gICAgY2FzZSAnY29kZSc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmNvZGUodGhpcy50b2tlbi50ZXh0LFxuICAgICAgICB0aGlzLnRva2VuLmxhbmcsXG4gICAgICAgIHRoaXMudG9rZW4uZXNjYXBlZCk7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgdmFyIGhlYWRlciA9ICcnXG4gICAgICAgICwgYm9keSA9ICcnXG4gICAgICAgICwgaVxuICAgICAgICAsIHJvd1xuICAgICAgICAsIGNlbGxcbiAgICAgICAgLCBmbGFnc1xuICAgICAgICAsIGo7XG5cbiAgICAgIC8vIGhlYWRlclxuICAgICAgY2VsbCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZsYWdzID0geyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH07XG4gICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4uaGVhZGVyW2ldKSxcbiAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJvdyA9IHRoaXMudG9rZW4uY2VsbHNbaV07XG5cbiAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dChyb3dbal0pLFxuICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnXG4gICAgICAgICwgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZDtcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2tlbi50eXBlID09PSAndGV4dCdcbiAgICAgICAgICA/IHRoaXMucGFyc2VUZXh0KClcbiAgICAgICAgICA6IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsb29zZV9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgdmFyIGh0bWwgPSAhdGhpcy50b2tlbi5wcmUgJiYgIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICA/IHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpXG4gICAgICAgIDogdGhpcy50b2tlbi50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbChodG1sKTtcbiAgICB9XG4gICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpKTtcbiAgICB9XG4gICAgY2FzZSAndGV4dCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlVGV4dCgpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSghZW5jb2RlID8gLyYoPyEjP1xcdys7KS9nIDogLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKFsjXFx3XSspOy9nLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGYobmFtZSwgdmFsKSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxXG4gICAgLCB0YXJnZXRcbiAgICAsIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0XG4gICAgICAsIHRva2Vuc1xuICAgICAgLCBwZW5kaW5nXG4gICAgICAsIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyID0gZTtcbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUoKTtcblxuICAgIGZvciAoOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAoZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdjb2RlJykge1xuICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQuJztcbiAgICBpZiAoKG9wdCB8fCBtYXJrZWQuZGVmYXVsdHMpLnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmRlZmF1bHRzID0ge1xuICBnZm06IHRydWUsXG4gIHRhYmxlczogdHJ1ZSxcbiAgYnJlYWtzOiBmYWxzZSxcbiAgcGVkYW50aWM6IGZhbHNlLFxuICBzYW5pdGl6ZTogZmFsc2UsXG4gIHNhbml0aXplcjogbnVsbCxcbiAgbWFuZ2xlOiB0cnVlLFxuICBzbWFydExpc3RzOiBmYWxzZSxcbiAgc2lsZW50OiBmYWxzZSxcbiAgaGlnaGxpZ2h0OiBudWxsLFxuICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICBzbWFydHlwYW50czogZmFsc2UsXG4gIGhlYWRlclByZWZpeDogJycsXG4gIHJlbmRlcmVyOiBuZXcgUmVuZGVyZXIsXG4gIHhodG1sOiBmYWxzZVxufTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xuXG5tYXJrZWQuUGFyc2VyID0gUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IFBhcnNlci5wYXJzZTtcblxubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5cbm1hcmtlZC5MZXhlciA9IExleGVyO1xubWFya2VkLmxleGVyID0gTGV4ZXIubGV4O1xuXG5tYXJrZWQuSW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlcjtcbm1hcmtlZC5pbmxpbmVMZXhlciA9IElubGluZUxleGVyLm91dHB1dDtcblxubWFya2VkLnBhcnNlID0gbWFya2VkO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbWFya2VkO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbWFya2VkOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMubWFya2VkID0gbWFya2VkO1xufVxuXG59KS5jYWxsKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcyB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpO1xufSgpKTtcbiIsIi8qanNoaW50IGxheGJyZWFrOiB0cnVlICovXG5cbnZhciBjb2RlUGF0dGVybiA9IC88dGQgY2xhc3M9XCJjb2RlXCIuKj88XFwvdGQ+L1xuICAsIGFsbFNjcmlwdFRhZ3MgPSBbXG4gICAgICBcbiAgICAgICAgLy8gPHNjcmlwdD4gLi4uIDwvc2NyaXB0PlxuICAgICAgICB7IG9wZW46IC88c2NyaXB0W14+XSo+LywgY2xvc2U6IC88XFwvc2NyaXB0W14+XSo+LywgYWxpYXM6ICdqcycgfVxuXG4gICAgICAgIC8vIDw/IC4uLiA/PlxuICAgICAgLCB7IG9wZW46IC9eXFxzKjxcXD9cXHMqJC8sIGNsb3NlOiAvXlxccypcXD8+XFxzKiQvLCAgYWxpYXM6ICdwaHAnIH1cblxuICAgICAgICAvLyA8IVtDREFUQVsgLi4uIF1dICAgICAtLSAoaW5saW5lIGFjdGlvbnNjcmlwdCkgb25seSB1c2VkIGZvciB4aHRtbFxuICAgICAgLCB7IG9wZW46IC9eXFxzKj88IVxcW0NEQVRBXFxbXFxzKj8kLywgY2xvc2U6IC9eXFxzKj9cXF1cXF0+XFxzKj8kLywgYWxpYXM6ICdhczMnLCBhcHBseVRvOiAneGh0bWwnIH1cbiAgICBdO1xuXG5mdW5jdGlvbiBmaW5kU2NyaXB0cyhsaW5lcywgc3BlY2lmaWVkQWxpYXMpIHtcbiAgdmFyIHNjcmlwdHMgPSBbXVxuICAgICwgaW5TY3JpcHQgPSBmYWxzZVxuICAgICwgY3VycmVudFNjcmlwdFxuICAgICwgc2NyaXB0VGFncyA9IGFsbFNjcmlwdFRhZ3NcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgLy8gRS5nLiwgaW4gY2FzZSBvZiAhW0NEQVRBIG1ha2Ugc3VyZSB3ZSBvbmx5IGhpZ2hsaWdodCBpZiB1c2VyIHNwZWNpZmllZCB4aHRtbFxuICAgICAgICAgIHJldHVybiAhdGFnLmFwcGx5VG8gfHwgdGFnLmFwcGx5VG8gPT09IHNwZWNpZmllZEFsaWFzO1xuICAgICAgICB9KTtcblxuICBmb3IgKHZhciBsaW5lTnVtICA9IDA7IGxpbmVOdW0gPCBsaW5lcy5sZW5ndGg7IGxpbmVOdW0rKykge1xuICAgIHZhciBsaW5lID0gbGluZXNbbGluZU51bV07XG5cbiAgICBpZiAoIWluU2NyaXB0KSB7XG4gICAgICB2YXIgbWF0Y2hpbmdUYWcgPSBudWxsO1xuXG4gICAgICBmb3IgKHZhciB0YWdJbmRleCA9IDA7IHRhZ0luZGV4IDwgc2NyaXB0VGFncy5sZW5ndGg7IHRhZ0luZGV4KyspIHtcbiAgICAgICAgdmFyIHRhZyA9IHNjcmlwdFRhZ3NbdGFnSW5kZXhdO1xuXG4gICAgICAgIGlmIChsaW5lLm1hdGNoKHRhZy5vcGVuKSkgeyBcbiAgICAgICAgICBtYXRjaGluZ1RhZyA9IHRhZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWF0Y2hpbmdUYWcpIHtcbiAgICAgICAgaW5TY3JpcHQgPSB0cnVlO1xuICAgICAgICBjdXJyZW50U2NyaXB0ID0geyBmcm9tOiBsaW5lTnVtICsgMSwgY29kZTogJycsIHRhZzogbWF0Y2hpbmdUYWcgfTtcbiAgICAgIH1cblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGxpbmUubWF0Y2goY3VycmVudFNjcmlwdC50YWcuY2xvc2UpKSB7XG4gICAgICBpblNjcmlwdCA9IGZhbHNlO1xuICAgICAgY3VycmVudFNjcmlwdC50byA9IGxpbmVOdW0gLSAxO1xuICAgICAgc2NyaXB0cy5wdXNoKGN1cnJlbnRTY3JpcHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY3VycmVudFNjcmlwdC5jb2RlICs9IGxpbmUgKyAnXFxuJztcbiAgfVxuXG4gIHJldHVybiBzY3JpcHRzO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0TGluZXMoaHRtbCkge1xuICB2YXIgY29kZSA9IGh0bWwubWF0Y2goY29kZVBhdHRlcm4pWzBdXG4gICAgLCBsaW5lcyA9IGNvZGUubWF0Y2goLzxkaXYgK2NsYXNzPVwibGluZSAuKz88XFwvZGl2Pi9tZyk7XG5cbiAgcmV0dXJuIGxpbmVzLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlUGxhaW5MaW5lcyhmcm9tSW5kZXgsIHRvSW5kZXgsIGh0bWwsIHJlcGxhY2VtZW50KSB7XG4gIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKFxuICAgICAgICAgICc8ZGl2ICtjbGFzcz1cIlteXCJdKz9pbmRleCcgKyBmcm9tSW5kZXggKyAnW15cIl0qXCInICAvLyBvcGVuaW5nIHRhZyBvZiBzdGFydFxuICAgICAgICArICcuKycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNjcmlwdCBodG1sXG4gICAgICAgICsgJzxkaXYgK2NsYXNzPVwiW15cIl0rP2luZGV4JyArIHRvSW5kZXggKyAnW15cIl0qXCInICAgIC8vIG9wZW5pbmcgdGFnIG9mIGVuZFxuICAgICAgICArICcuKz88L2Rpdj4nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsb3NpbmcgdGFnIG9mIGVuZFxuICAgICAgKVxuICAgICwgY29kZSAgICAgICAgICAgICAgICA9ICBodG1sLm1hdGNoKGNvZGVQYXR0ZXJuKVswXVxuICAgICwgY29kZVdpdGhSZXBsYWNlbWVudCA9ICBjb2RlLnJlcGxhY2UocmVnZXhwLCByZXBsYWNlbWVudCk7XG5cbiAgcmV0dXJuIGh0bWwucmVwbGFjZShjb2RlLCBjb2RlV2l0aFJlcGxhY2VtZW50KTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBmaW5kU2NyaXB0cyAgICAgICA6ICBmaW5kU2NyaXB0c1xuICAsIGV4dHJhY3RMaW5lcyAgICAgIDogIGV4dHJhY3RMaW5lc1xuICAsIHJlcGxhY2VQbGFpbkxpbmVzIDogIHJlcGxhY2VQbGFpbkxpbmVzXG59O1xuIiwiLy8gWFJlZ0V4cCAxLjUuMVxuLy8gKGMpIDIwMDctMjAxMiBTdGV2ZW4gTGV2aXRoYW5cbi8vIE1JVCBMaWNlbnNlXG4vLyA8aHR0cDovL3hyZWdleHAuY29tPlxuLy8gUHJvdmlkZXMgYW4gYXVnbWVudGVkLCBleHRlbnNpYmxlLCBjcm9zcy1icm93c2VyIGltcGxlbWVudGF0aW9uIG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMsXG4vLyBpbmNsdWRpbmcgc3VwcG9ydCBmb3IgYWRkaXRpb25hbCBzeW50YXgsIGZsYWdzLCBhbmQgbWV0aG9kc1xuXG52YXIgWFJlZ0V4cDtcblxuaWYgKFhSZWdFeHApIHtcbiAgICAvLyBBdm9pZCBydW5uaW5nIHR3aWNlLCBzaW5jZSB0aGF0IHdvdWxkIGJyZWFrIHJlZmVyZW5jZXMgdG8gbmF0aXZlIGdsb2JhbHNcbiAgICB0aHJvdyBFcnJvcihcImNhbid0IGxvYWQgWFJlZ0V4cCB0d2ljZSBpbiB0aGUgc2FtZSBmcmFtZVwiKTtcbn1cblxuLy8gUnVuIHdpdGhpbiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gdG8gcHJvdGVjdCB2YXJpYWJsZXMgYW5kIGF2b2lkIG5ldyBnbG9iYWxzXG4oZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgQ29uc3RydWN0b3JcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gQWNjZXB0cyBhIHBhdHRlcm4gYW5kIGZsYWdzOyByZXR1cm5zIGEgbmV3LCBleHRlbmRlZCBgUmVnRXhwYCBvYmplY3QuIERpZmZlcnMgZnJvbSBhIG5hdGl2ZVxuICAgIC8vIHJlZ3VsYXIgZXhwcmVzc2lvbiBpbiB0aGF0IGFkZGl0aW9uYWwgc3ludGF4IGFuZCBmbGFncyBhcmUgc3VwcG9ydGVkIGFuZCBjcm9zcy1icm93c2VyXG4gICAgLy8gc3ludGF4IGluY29uc2lzdGVuY2llcyBhcmUgYW1lbGlvcmF0ZWQuIGBYUmVnRXhwKC9yZWdleC8pYCBjbG9uZXMgYW4gZXhpc3RpbmcgcmVnZXggYW5kXG4gICAgLy8gY29udmVydHMgdG8gdHlwZSBYUmVnRXhwXG4gICAgWFJlZ0V4cCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBmbGFncykge1xuICAgICAgICB2YXIgb3V0cHV0ID0gW10sXG4gICAgICAgICAgICBjdXJyU2NvcGUgPSBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgICAgICBwb3MgPSAwLFxuICAgICAgICAgICAgY29udGV4dCwgdG9rZW5SZXN1bHQsIG1hdGNoLCBjaHIsIHJlZ2V4O1xuXG4gICAgICAgIGlmIChYUmVnRXhwLmlzUmVnRXhwKHBhdHRlcm4pKSB7XG4gICAgICAgICAgICBpZiAoZmxhZ3MgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJjYW4ndCBzdXBwbHkgZmxhZ3Mgd2hlbiBjb25zdHJ1Y3Rpbmcgb25lIFJlZ0V4cCBmcm9tIGFub3RoZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gY2xvbmUocGF0dGVybik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVG9rZW5zIGJlY29tZSBwYXJ0IG9mIHRoZSByZWdleCBjb25zdHJ1Y3Rpb24gcHJvY2Vzcywgc28gcHJvdGVjdCBhZ2FpbnN0IGluZmluaXRlXG4gICAgICAgIC8vIHJlY3Vyc2lvbiB3aGVuIGFuIFhSZWdFeHAgaXMgY29uc3RydWN0ZWQgd2l0aGluIGEgdG9rZW4gaGFuZGxlciBvciB0cmlnZ2VyXG4gICAgICAgIGlmIChpc0luc2lkZUNvbnN0cnVjdG9yKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBjYWxsIHRoZSBYUmVnRXhwIGNvbnN0cnVjdG9yIHdpdGhpbiB0b2tlbiBkZWZpbml0aW9uIGZ1bmN0aW9uc1wiKTtcblxuICAgICAgICBmbGFncyA9IGZsYWdzIHx8IFwiXCI7XG4gICAgICAgIGNvbnRleHQgPSB7IC8vIGB0aGlzYCBvYmplY3QgZm9yIGN1c3RvbSB0b2tlbnNcbiAgICAgICAgICAgIGhhc05hbWVkQ2FwdHVyZTogZmFsc2UsXG4gICAgICAgICAgICBjYXB0dXJlTmFtZXM6IFtdLFxuICAgICAgICAgICAgaGFzRmxhZzogZnVuY3Rpb24gKGZsYWcpIHtyZXR1cm4gZmxhZ3MuaW5kZXhPZihmbGFnKSA+IC0xO30sXG4gICAgICAgICAgICBzZXRGbGFnOiBmdW5jdGlvbiAoZmxhZykge2ZsYWdzICs9IGZsYWc7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHdoaWxlIChwb3MgPCBwYXR0ZXJuLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGN1c3RvbSB0b2tlbnMgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gcnVuVG9rZW5zKHBhdHRlcm4sIHBvcywgY3VyclNjb3BlLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgaWYgKHRva2VuUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2godG9rZW5SZXN1bHQub3V0cHV0KTtcbiAgICAgICAgICAgICAgICBwb3MgKz0gKHRva2VuUmVzdWx0Lm1hdGNoWzBdLmxlbmd0aCB8fCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIG5hdGl2ZSBtdWx0aWNoYXJhY3RlciBtZXRhc2VxdWVuY2VzIChleGNsdWRpbmcgY2hhcmFjdGVyIGNsYXNzZXMpIGF0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2ggPSBuYXRpdi5leGVjLmNhbGwobmF0aXZlVG9rZW5zW2N1cnJTY29wZV0sIHBhdHRlcm4uc2xpY2UocG9zKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2gobWF0Y2hbMF0pO1xuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNociA9IHBhdHRlcm4uY2hhckF0KHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaHIgPT09IFwiW1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyclNjb3BlID0gWFJlZ0V4cC5JTlNJREVfQ0xBU1M7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNociA9PT0gXCJdXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyU2NvcGUgPSBYUmVnRXhwLk9VVFNJREVfQ0xBU1M7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgcG9zaXRpb24gb25lIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChjaHIpO1xuICAgICAgICAgICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZWdleCA9IFJlZ0V4cChvdXRwdXQuam9pbihcIlwiKSwgbmF0aXYucmVwbGFjZS5jYWxsKGZsYWdzLCBmbGFnQ2xpcCwgXCJcIikpO1xuICAgICAgICByZWdleC5feHJlZ2V4cCA9IHtcbiAgICAgICAgICAgIHNvdXJjZTogcGF0dGVybixcbiAgICAgICAgICAgIGNhcHR1cmVOYW1lczogY29udGV4dC5oYXNOYW1lZENhcHR1cmUgPyBjb250ZXh0LmNhcHR1cmVOYW1lcyA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlZ2V4O1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFB1YmxpYyBwcm9wZXJ0aWVzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIFhSZWdFeHAudmVyc2lvbiA9IFwiMS41LjFcIjtcblxuICAgIC8vIFRva2VuIHNjb3BlIGJpdGZsYWdzXG4gICAgWFJlZ0V4cC5JTlNJREVfQ0xBU1MgPSAxO1xuICAgIFhSZWdFeHAuT1VUU0lERV9DTEFTUyA9IDI7XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFByaXZhdGUgdmFyaWFibGVzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHZhciByZXBsYWNlbWVudFRva2VuID0gL1xcJCg/OihcXGRcXGQ/fFskJmAnXSl8eyhbJFxcd10rKX0pL2csXG4gICAgICAgIGZsYWdDbGlwID0gL1teZ2lteV0rfChbXFxzXFxTXSkoPz1bXFxzXFxTXSpcXDEpL2csIC8vIE5vbm5hdGl2ZSBhbmQgZHVwbGljYXRlIGZsYWdzXG4gICAgICAgIHF1YW50aWZpZXIgPSAvXig/Ols/KitdfHtcXGQrKD86LFxcZCopP30pXFw/Py8sXG4gICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSBmYWxzZSxcbiAgICAgICAgdG9rZW5zID0gW10sXG4gICAgICAgIC8vIENvcHkgbmF0aXZlIGdsb2JhbHMgZm9yIHJlZmVyZW5jZSAoXCJuYXRpdmVcIiBpcyBhbiBFUzMgcmVzZXJ2ZWQga2V5d29yZClcbiAgICAgICAgbmF0aXYgPSB7XG4gICAgICAgICAgICBleGVjOiBSZWdFeHAucHJvdG90eXBlLmV4ZWMsXG4gICAgICAgICAgICB0ZXN0OiBSZWdFeHAucHJvdG90eXBlLnRlc3QsXG4gICAgICAgICAgICBtYXRjaDogU3RyaW5nLnByb3RvdHlwZS5tYXRjaCxcbiAgICAgICAgICAgIHJlcGxhY2U6IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSxcbiAgICAgICAgICAgIHNwbGl0OiBTdHJpbmcucHJvdG90eXBlLnNwbGl0XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBsaWFudEV4ZWNOcGNnID0gbmF0aXYuZXhlYy5jYWxsKC8oKT8/LywgXCJcIilbMV0gPT09IHVuZGVmaW5lZCwgLy8gY2hlY2sgYGV4ZWNgIGhhbmRsaW5nIG9mIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3Vwc1xuICAgICAgICBjb21wbGlhbnRMYXN0SW5kZXhJbmNyZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgeCA9IC9eL2c7XG4gICAgICAgICAgICBuYXRpdi50ZXN0LmNhbGwoeCwgXCJcIik7XG4gICAgICAgICAgICByZXR1cm4gIXgubGFzdEluZGV4O1xuICAgICAgICB9KCksXG4gICAgICAgIGhhc05hdGl2ZVkgPSBSZWdFeHAucHJvdG90eXBlLnN0aWNreSAhPT0gdW5kZWZpbmVkLFxuICAgICAgICBuYXRpdmVUb2tlbnMgPSB7fTtcblxuICAgIC8vIGBuYXRpdmVUb2tlbnNgIG1hdGNoIG5hdGl2ZSBtdWx0aWNoYXJhY3RlciBtZXRhc2VxdWVuY2VzIG9ubHkgKGluY2x1ZGluZyBkZXByZWNhdGVkIG9jdGFscyxcbiAgICAvLyBleGNsdWRpbmcgY2hhcmFjdGVyIGNsYXNzZXMpXG4gICAgbmF0aXZlVG9rZW5zW1hSZWdFeHAuSU5TSURFX0NMQVNTXSA9IC9eKD86XFxcXCg/OlswLTNdWzAtN117MCwyfXxbNC03XVswLTddP3x4W1xcZEEtRmEtZl17Mn18dVtcXGRBLUZhLWZdezR9fGNbQS1aYS16XXxbXFxzXFxTXSkpLztcbiAgICBuYXRpdmVUb2tlbnNbWFJlZ0V4cC5PVVRTSURFX0NMQVNTXSA9IC9eKD86XFxcXCg/OjAoPzpbMC0zXVswLTddezAsMn18WzQtN11bMC03XT8pP3xbMS05XVxcZCp8eFtcXGRBLUZhLWZdezJ9fHVbXFxkQS1GYS1mXXs0fXxjW0EtWmEtel18W1xcc1xcU10pfFxcKFxcP1s6PSFdfFs/KitdXFw/fHtcXGQrKD86LFxcZCopP31cXD8/KS87XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFB1YmxpYyBtZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIExldHMgeW91IGV4dGVuZCBvciBjaGFuZ2UgWFJlZ0V4cCBzeW50YXggYW5kIGNyZWF0ZSBjdXN0b20gZmxhZ3MuIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IGJ5XG4gICAgLy8gdGhlIFhSZWdFeHAgbGlicmFyeSBhbmQgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIFhSZWdFeHAgcGx1Z2lucy4gVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCBmb3JcbiAgICAvLyB1c2VycyB3aXRoIGFkdmFuY2VkIGtub3dsZWRnZSBvZiBKYXZhU2NyaXB0J3MgcmVndWxhciBleHByZXNzaW9uIHN5bnRheCBhbmQgYmVoYXZpb3IuIEl0IGNhblxuICAgIC8vIGJlIGRpc2FibGVkIGJ5IGBYUmVnRXhwLmZyZWV6ZVRva2Vuc2BcbiAgICBYUmVnRXhwLmFkZFRva2VuID0gZnVuY3Rpb24gKHJlZ2V4LCBoYW5kbGVyLCBzY29wZSwgdHJpZ2dlcikge1xuICAgICAgICB0b2tlbnMucHVzaCh7XG4gICAgICAgICAgICBwYXR0ZXJuOiBjbG9uZShyZWdleCwgXCJnXCIgKyAoaGFzTmF0aXZlWSA/IFwieVwiIDogXCJcIikpLFxuICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZSB8fCBYUmVnRXhwLk9VVFNJREVfQ0xBU1MsXG4gICAgICAgICAgICB0cmlnZ2VyOiB0cmlnZ2VyIHx8IG51bGxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBwYXR0ZXJuIGFuZCBmbGFnczsgcmV0dXJucyBhbiBleHRlbmRlZCBgUmVnRXhwYCBvYmplY3QuIElmIHRoZSBwYXR0ZXJuIGFuZCBmbGFnXG4gICAgLy8gY29tYmluYXRpb24gaGFzIHByZXZpb3VzbHkgYmVlbiBjYWNoZWQsIHRoZSBjYWNoZWQgY29weSBpcyByZXR1cm5lZDsgb3RoZXJ3aXNlIHRoZSBuZXdseVxuICAgIC8vIGNyZWF0ZWQgcmVnZXggaXMgY2FjaGVkXG4gICAgWFJlZ0V4cC5jYWNoZSA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBmbGFncykge1xuICAgICAgICB2YXIga2V5ID0gcGF0dGVybiArIFwiL1wiICsgKGZsYWdzIHx8IFwiXCIpO1xuICAgICAgICByZXR1cm4gWFJlZ0V4cC5jYWNoZVtrZXldIHx8IChYUmVnRXhwLmNhY2hlW2tleV0gPSBYUmVnRXhwKHBhdHRlcm4sIGZsYWdzKSk7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBgUmVnRXhwYCBpbnN0YW5jZTsgcmV0dXJucyBhIGNvcHkgd2l0aCB0aGUgYC9nYCBmbGFnIHNldC4gVGhlIGNvcHkgaGFzIGEgZnJlc2hcbiAgICAvLyBgbGFzdEluZGV4YCAoc2V0IHRvIHplcm8pLiBJZiB5b3Ugd2FudCB0byBjb3B5IGEgcmVnZXggd2l0aG91dCBmb3JjaW5nIHRoZSBgZ2xvYmFsYFxuICAgIC8vIHByb3BlcnR5LCB1c2UgYFhSZWdFeHAocmVnZXgpYC4gRG8gbm90IHVzZSBgUmVnRXhwKHJlZ2V4KWAgYmVjYXVzZSBpdCB3aWxsIG5vdCBwcmVzZXJ2ZVxuICAgIC8vIHNwZWNpYWwgcHJvcGVydGllcyByZXF1aXJlZCBmb3IgbmFtZWQgY2FwdHVyZVxuICAgIFhSZWdFeHAuY29weUFzR2xvYmFsID0gZnVuY3Rpb24gKHJlZ2V4KSB7XG4gICAgICAgIHJldHVybiBjbG9uZShyZWdleCwgXCJnXCIpO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgc3RyaW5nOyByZXR1cm5zIHRoZSBzdHJpbmcgd2l0aCByZWdleCBtZXRhY2hhcmFjdGVycyBlc2NhcGVkLiBUaGUgcmV0dXJuZWQgc3RyaW5nXG4gICAgLy8gY2FuIHNhZmVseSBiZSB1c2VkIGF0IGFueSBwb2ludCB3aXRoaW4gYSByZWdleCB0byBtYXRjaCB0aGUgcHJvdmlkZWQgbGl0ZXJhbCBzdHJpbmcuIEVzY2FwZWRcbiAgICAvLyBjaGFyYWN0ZXJzIGFyZSBbIF0geyB9ICggKSAqICsgPyAtIC4gLCBcXCBeICQgfCAjIGFuZCB3aGl0ZXNwYWNlXG4gICAgWFJlZ0V4cC5lc2NhcGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgc3RyaW5nIHRvIHNlYXJjaCwgcmVnZXggdG8gc2VhcmNoIHdpdGgsIHBvc2l0aW9uIHRvIHN0YXJ0IHRoZSBzZWFyY2ggd2l0aGluIHRoZVxuICAgIC8vIHN0cmluZyAoZGVmYXVsdDogMCksIGFuZCBhbiBvcHRpb25hbCBCb29sZWFuIGluZGljYXRpbmcgd2hldGhlciBtYXRjaGVzIG11c3Qgc3RhcnQgYXQtb3ItXG4gICAgLy8gYWZ0ZXIgdGhlIHBvc2l0aW9uIG9yIGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gb25seS4gVGhpcyBmdW5jdGlvbiBpZ25vcmVzIHRoZSBgbGFzdEluZGV4YFxuICAgIC8vIG9mIHRoZSBwcm92aWRlZCByZWdleCBpbiBpdHMgb3duIGhhbmRsaW5nLCBidXQgdXBkYXRlcyB0aGUgcHJvcGVydHkgZm9yIGNvbXBhdGliaWxpdHlcbiAgICBYUmVnRXhwLmV4ZWNBdCA9IGZ1bmN0aW9uIChzdHIsIHJlZ2V4LCBwb3MsIGFuY2hvcmVkKSB7XG4gICAgICAgIHZhciByMiA9IGNsb25lKHJlZ2V4LCBcImdcIiArICgoYW5jaG9yZWQgJiYgaGFzTmF0aXZlWSkgPyBcInlcIiA6IFwiXCIpKSxcbiAgICAgICAgICAgIG1hdGNoO1xuICAgICAgICByMi5sYXN0SW5kZXggPSBwb3MgPSBwb3MgfHwgMDtcbiAgICAgICAgbWF0Y2ggPSByMi5leGVjKHN0cik7IC8vIFJ1biB0aGUgYWx0ZXJlZCBgZXhlY2AgKHJlcXVpcmVkIGZvciBgbGFzdEluZGV4YCBmaXgsIGV0Yy4pXG4gICAgICAgIGlmIChhbmNob3JlZCAmJiBtYXRjaCAmJiBtYXRjaC5pbmRleCAhPT0gcG9zKVxuICAgICAgICAgICAgbWF0Y2ggPSBudWxsO1xuICAgICAgICBpZiAocmVnZXguZ2xvYmFsKVxuICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gbWF0Y2ggPyByMi5sYXN0SW5kZXggOiAwO1xuICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfTtcblxuICAgIC8vIEJyZWFrcyB0aGUgdW5yZXN0b3JhYmxlIGxpbmsgdG8gWFJlZ0V4cCdzIHByaXZhdGUgbGlzdCBvZiB0b2tlbnMsIHRoZXJlYnkgcHJldmVudGluZ1xuICAgIC8vIHN5bnRheCBhbmQgZmxhZyBjaGFuZ2VzLiBTaG91bGQgYmUgcnVuIGFmdGVyIFhSZWdFeHAgYW5kIGFueSBwbHVnaW5zIGFyZSBsb2FkZWRcbiAgICBYUmVnRXhwLmZyZWV6ZVRva2VucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgWFJlZ0V4cC5hZGRUb2tlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiY2FuJ3QgcnVuIGFkZFRva2VuIGFmdGVyIGZyZWV6ZVRva2Vuc1wiKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhbnkgdmFsdWU7IHJldHVybnMgYSBCb29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSBgUmVnRXhwYCBvYmplY3QuXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgYWxzbyBgdHJ1ZWAgZm9yIHJlZ2V4IGxpdGVyYWxzIGFuZCByZWdleGVzIGNyZWF0ZWQgYnkgdGhlIGBYUmVnRXhwYFxuICAgIC8vIGNvbnN0cnVjdG9yLiBUaGlzIHdvcmtzIGNvcnJlY3RseSBmb3IgdmFyaWFibGVzIGNyZWF0ZWQgaW4gYW5vdGhlciBmcmFtZSwgd2hlbiBgaW5zdGFuY2VvZmBcbiAgICAvLyBhbmQgYGNvbnN0cnVjdG9yYCBjaGVja3Mgd291bGQgZmFpbCB0byB3b3JrIGFzIGludGVuZGVkXG4gICAgWFJlZ0V4cC5pc1JlZ0V4cCA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09IFwiW29iamVjdCBSZWdFeHBdXCI7XG4gICAgfTtcblxuICAgIC8vIEV4ZWN1dGVzIGBjYWxsYmFja2Agb25jZSBwZXIgbWF0Y2ggd2l0aGluIGBzdHJgLiBQcm92aWRlcyBhIHNpbXBsZXIgYW5kIGNsZWFuZXIgd2F5IHRvXG4gICAgLy8gaXRlcmF0ZSBvdmVyIHJlZ2V4IG1hdGNoZXMgY29tcGFyZWQgdG8gdGhlIHRyYWRpdGlvbmFsIGFwcHJvYWNoZXMgb2Ygc3VidmVydGluZ1xuICAgIC8vIGBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VgIG9yIHJlcGVhdGVkbHkgY2FsbGluZyBgZXhlY2Agd2l0aGluIGEgYHdoaWxlYCBsb29wXG4gICAgWFJlZ0V4cC5pdGVyYXRlID0gZnVuY3Rpb24gKHN0ciwgcmVnZXgsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciByMiA9IGNsb25lKHJlZ2V4LCBcImdcIiksXG4gICAgICAgICAgICBpID0gLTEsIG1hdGNoO1xuICAgICAgICB3aGlsZSAobWF0Y2ggPSByMi5leGVjKHN0cikpIHsgLy8gUnVuIHRoZSBhbHRlcmVkIGBleGVjYCAocmVxdWlyZWQgZm9yIGBsYXN0SW5kZXhgIGZpeCwgZXRjLilcbiAgICAgICAgICAgIGlmIChyZWdleC5nbG9iYWwpXG4gICAgICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gcjIubGFzdEluZGV4OyAvLyBEb2luZyB0aGlzIHRvIGZvbGxvdyBleHBlY3RhdGlvbnMgaWYgYGxhc3RJbmRleGAgaXMgY2hlY2tlZCB3aXRoaW4gYGNhbGxiYWNrYFxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCBtYXRjaCwgKytpLCBzdHIsIHJlZ2V4KTtcbiAgICAgICAgICAgIGlmIChyMi5sYXN0SW5kZXggPT09IG1hdGNoLmluZGV4KVxuICAgICAgICAgICAgICAgIHIyLmxhc3RJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZWdleC5nbG9iYWwpXG4gICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSAwO1xuICAgIH07XG5cbiAgICAvLyBBY2NlcHRzIGEgc3RyaW5nIGFuZCBhbiBhcnJheSBvZiByZWdleGVzOyByZXR1cm5zIHRoZSByZXN1bHQgb2YgdXNpbmcgZWFjaCBzdWNjZXNzaXZlIHJlZ2V4XG4gICAgLy8gdG8gc2VhcmNoIHdpdGhpbiB0aGUgbWF0Y2hlcyBvZiB0aGUgcHJldmlvdXMgcmVnZXguIFRoZSBhcnJheSBvZiByZWdleGVzIGNhbiBhbHNvIGNvbnRhaW5cbiAgICAvLyBvYmplY3RzIHdpdGggYHJlZ2V4YCBhbmQgYGJhY2tyZWZgIHByb3BlcnRpZXMsIGluIHdoaWNoIGNhc2UgdGhlIG5hbWVkIG9yIG51bWJlcmVkIGJhY2stXG4gICAgLy8gcmVmZXJlbmNlcyBzcGVjaWZpZWQgYXJlIHBhc3NlZCBmb3J3YXJkIHRvIHRoZSBuZXh0IHJlZ2V4IG9yIHJldHVybmVkLiBFLmcuOlxuICAgIC8vIHZhciB4cmVnZXhwSW1nRmlsZU5hbWVzID0gWFJlZ0V4cC5tYXRjaENoYWluKGh0bWwsIFtcbiAgICAvLyAgICAge3JlZ2V4OiAvPGltZ1xcYihbXj5dKyk+L2ksIGJhY2tyZWY6IDF9LCAvLyA8aW1nPiB0YWcgYXR0cmlidXRlc1xuICAgIC8vICAgICB7cmVnZXg6IFhSZWdFeHAoJyg/aXgpIFxcXFxzIHNyYz1cIiAoPzxzcmM+IFteXCJdKyApJyksIGJhY2tyZWY6IFwic3JjXCJ9LCAvLyBzcmMgYXR0cmlidXRlIHZhbHVlc1xuICAgIC8vICAgICB7cmVnZXg6IFhSZWdFeHAoXCJeaHR0cDovL3hyZWdleHBcXFxcLmNvbSgvW14jP10rKVwiLCBcImlcIiksIGJhY2tyZWY6IDF9LCAvLyB4cmVnZXhwLmNvbSBwYXRoc1xuICAgIC8vICAgICAvW15cXC9dKyQvIC8vIGZpbGVuYW1lcyAoc3RyaXAgZGlyZWN0b3J5IHBhdGhzKVxuICAgIC8vIF0pO1xuICAgIFhSZWdFeHAubWF0Y2hDaGFpbiA9IGZ1bmN0aW9uIChzdHIsIGNoYWluKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiByZWN1cnNlQ2hhaW4gKHZhbHVlcywgbGV2ZWwpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gY2hhaW5bbGV2ZWxdLnJlZ2V4ID8gY2hhaW5bbGV2ZWxdIDoge3JlZ2V4OiBjaGFpbltsZXZlbF19LFxuICAgICAgICAgICAgICAgIHJlZ2V4ID0gY2xvbmUoaXRlbS5yZWdleCwgXCJnXCIpLFxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBbXSwgaTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBYUmVnRXhwLml0ZXJhdGUodmFsdWVzW2ldLCByZWdleCwgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXMucHVzaChpdGVtLmJhY2tyZWYgPyAobWF0Y2hbaXRlbS5iYWNrcmVmXSB8fCBcIlwiKSA6IG1hdGNoWzBdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoKGxldmVsID09PSBjaGFpbi5sZW5ndGggLSAxKSB8fCAhbWF0Y2hlcy5sZW5ndGgpID9cbiAgICAgICAgICAgICAgICBtYXRjaGVzIDogcmVjdXJzZUNoYWluKG1hdGNoZXMsIGxldmVsICsgMSk7XG4gICAgICAgIH0oW3N0cl0sIDApO1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIE5ldyBSZWdFeHAgcHJvdG90eXBlIG1ldGhvZHNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gQWNjZXB0cyBhIGNvbnRleHQgb2JqZWN0IGFuZCBhcmd1bWVudHMgYXJyYXk7IHJldHVybnMgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIGBleGVjYCB3aXRoIHRoZVxuICAgIC8vIGZpcnN0IHZhbHVlIGluIHRoZSBhcmd1bWVudHMgYXJyYXkuIHRoZSBjb250ZXh0IGlzIGlnbm9yZWQgYnV0IGlzIGFjY2VwdGVkIGZvciBjb25ncnVpdHlcbiAgICAvLyB3aXRoIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgXG4gICAgUmVnRXhwLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uIChjb250ZXh0LCBhcmdzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4ZWMoYXJnc1swXSk7XG4gICAgfTtcblxuICAgIC8vIEFjY2VwdHMgYSBjb250ZXh0IG9iamVjdCBhbmQgc3RyaW5nOyByZXR1cm5zIHRoZSByZXN1bHQgb2YgY2FsbGluZyBgZXhlY2Agd2l0aCB0aGUgcHJvdmlkZWRcbiAgICAvLyBzdHJpbmcuIHRoZSBjb250ZXh0IGlzIGlnbm9yZWQgYnV0IGlzIGFjY2VwdGVkIGZvciBjb25ncnVpdHkgd2l0aCBgRnVuY3Rpb24ucHJvdG90eXBlLmNhbGxgXG4gICAgUmVnRXhwLnByb3RvdHlwZS5jYWxsID0gZnVuY3Rpb24gKGNvbnRleHQsIHN0cikge1xuICAgICAgICByZXR1cm4gdGhpcy5leGVjKHN0cik7XG4gICAgfTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgT3ZlcnJpZGVuIG5hdGl2ZSBtZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEFkZHMgbmFtZWQgY2FwdHVyZSBzdXBwb3J0ICh3aXRoIGJhY2tyZWZlcmVuY2VzIHJldHVybmVkIGFzIGByZXN1bHQubmFtZWApLCBhbmQgZml4ZXMgdHdvXG4gICAgLy8gY3Jvc3MtYnJvd3NlciBpc3N1ZXMgcGVyIEVTMzpcbiAgICAvLyAtIENhcHR1cmVkIHZhbHVlcyBmb3Igbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBzIHNob3VsZCBiZSByZXR1cm5lZCBhcyBgdW5kZWZpbmVkYCxcbiAgICAvLyAgIHJhdGhlciB0aGFuIHRoZSBlbXB0eSBzdHJpbmcuXG4gICAgLy8gLSBgbGFzdEluZGV4YCBzaG91bGQgbm90IGJlIGluY3JlbWVudGVkIGFmdGVyIHplcm8tbGVuZ3RoIG1hdGNoZXMuXG4gICAgUmVnRXhwLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgbWF0Y2gsIG5hbWUsIHIyLCBvcmlnTGFzdEluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgb3JpZ0xhc3RJbmRleCA9IHRoaXMubGFzdEluZGV4O1xuICAgICAgICBtYXRjaCA9IG5hdGl2LmV4ZWMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAvLyBGaXggYnJvd3NlcnMgd2hvc2UgYGV4ZWNgIG1ldGhvZHMgZG9uJ3QgY29uc2lzdGVudGx5IHJldHVybiBgdW5kZWZpbmVkYCBmb3JcbiAgICAgICAgICAgIC8vIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3Vwc1xuICAgICAgICAgICAgaWYgKCFjb21wbGlhbnRFeGVjTnBjZyAmJiBtYXRjaC5sZW5ndGggPiAxICYmIGluZGV4T2YobWF0Y2gsIFwiXCIpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByMiA9IFJlZ0V4cCh0aGlzLnNvdXJjZSwgbmF0aXYucmVwbGFjZS5jYWxsKGdldE5hdGl2ZUZsYWdzKHRoaXMpLCBcImdcIiwgXCJcIikpO1xuICAgICAgICAgICAgICAgIC8vIFVzaW5nIGBzdHIuc2xpY2UobWF0Y2guaW5kZXgpYCByYXRoZXIgdGhhbiBgbWF0Y2hbMF1gIGluIGNhc2UgbG9va2FoZWFkIGFsbG93ZWRcbiAgICAgICAgICAgICAgICAvLyBtYXRjaGluZyBkdWUgdG8gY2hhcmFjdGVycyBvdXRzaWRlIHRoZSBtYXRjaFxuICAgICAgICAgICAgICAgIG5hdGl2LnJlcGxhY2UuY2FsbCgoc3RyICsgXCJcIikuc2xpY2UobWF0Y2guaW5kZXgpLCByMiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXR0YWNoIG5hbWVkIGNhcHR1cmUgcHJvcGVydGllc1xuICAgICAgICAgICAgaWYgKHRoaXMuX3hyZWdleHAgJiYgdGhpcy5feHJlZ2V4cC5jYXB0dXJlTmFtZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IG1hdGNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSB0aGlzLl94cmVnZXhwLmNhcHR1cmVOYW1lc1tpIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFtuYW1lXSA9IG1hdGNoW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZpeCBicm93c2VycyB0aGF0IGluY3JlbWVudCBgbGFzdEluZGV4YCBhZnRlciB6ZXJvLWxlbmd0aCBtYXRjaGVzXG4gICAgICAgICAgICBpZiAoIWNvbXBsaWFudExhc3RJbmRleEluY3JlbWVudCAmJiB0aGlzLmdsb2JhbCAmJiAhbWF0Y2hbMF0ubGVuZ3RoICYmICh0aGlzLmxhc3RJbmRleCA+IG1hdGNoLmluZGV4KSlcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RJbmRleC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nbG9iYWwpXG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleCA9IG9yaWdMYXN0SW5kZXg7IC8vIEZpeCBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgT3BlcmEgMTEuNjEgb24gV2luZG93cylcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH07XG5cbiAgICAvLyBGaXggYnJvd3NlciBidWdzIGluIG5hdGl2ZSBtZXRob2RcbiAgICBSZWdFeHAucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIC8vIFVzZSB0aGUgbmF0aXZlIGBleGVjYCB0byBza2lwIHNvbWUgcHJvY2Vzc2luZyBvdmVyaGVhZCwgZXZlbiB0aG91Z2ggdGhlIGFsdGVyZWRcbiAgICAgICAgLy8gYGV4ZWNgIHdvdWxkIHRha2UgY2FyZSBvZiB0aGUgYGxhc3RJbmRleGAgZml4ZXNcbiAgICAgICAgdmFyIG1hdGNoLCBvcmlnTGFzdEluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuZ2xvYmFsKVxuICAgICAgICAgICAgb3JpZ0xhc3RJbmRleCA9IHRoaXMubGFzdEluZGV4O1xuICAgICAgICBtYXRjaCA9IG5hdGl2LmV4ZWMuY2FsbCh0aGlzLCBzdHIpO1xuICAgICAgICAvLyBGaXggYnJvd3NlcnMgdGhhdCBpbmNyZW1lbnQgYGxhc3RJbmRleGAgYWZ0ZXIgemVyby1sZW5ndGggbWF0Y2hlc1xuICAgICAgICBpZiAobWF0Y2ggJiYgIWNvbXBsaWFudExhc3RJbmRleEluY3JlbWVudCAmJiB0aGlzLmdsb2JhbCAmJiAhbWF0Y2hbMF0ubGVuZ3RoICYmICh0aGlzLmxhc3RJbmRleCA+IG1hdGNoLmluZGV4KSlcbiAgICAgICAgICAgIHRoaXMubGFzdEluZGV4LS07XG4gICAgICAgIGlmICghdGhpcy5nbG9iYWwpXG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleCA9IG9yaWdMYXN0SW5kZXg7IC8vIEZpeCBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LjAuNSwgT3BlcmEgMTEuNjEgb24gV2luZG93cylcbiAgICAgICAgcmV0dXJuICEhbWF0Y2g7XG4gICAgfTtcblxuICAgIC8vIEFkZHMgbmFtZWQgY2FwdHVyZSBzdXBwb3J0IGFuZCBmaXhlcyBicm93c2VyIGJ1Z3MgaW4gbmF0aXZlIG1ldGhvZFxuICAgIFN0cmluZy5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbiAocmVnZXgpIHtcbiAgICAgICAgaWYgKCFYUmVnRXhwLmlzUmVnRXhwKHJlZ2V4KSlcbiAgICAgICAgICAgIHJlZ2V4ID0gUmVnRXhwKHJlZ2V4KTsgLy8gTmF0aXZlIGBSZWdFeHBgXG4gICAgICAgIGlmIChyZWdleC5nbG9iYWwpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuYXRpdi5tYXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gMDsgLy8gRml4IElFIGJ1Z1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVnZXguZXhlYyh0aGlzKTsgLy8gUnVuIHRoZSBhbHRlcmVkIGBleGVjYFxuICAgIH07XG5cbiAgICAvLyBBZGRzIHN1cHBvcnQgZm9yIGAke259YCB0b2tlbnMgZm9yIG5hbWVkIGFuZCBudW1iZXJlZCBiYWNrcmVmZXJlbmNlcyBpbiByZXBsYWNlbWVudCB0ZXh0LFxuICAgIC8vIGFuZCBwcm92aWRlcyBuYW1lZCBiYWNrcmVmZXJlbmNlcyB0byByZXBsYWNlbWVudCBmdW5jdGlvbnMgYXMgYGFyZ3VtZW50c1swXS5uYW1lYC4gQWxzb1xuICAgIC8vIGZpeGVzIGNyb3NzLWJyb3dzZXIgZGlmZmVyZW5jZXMgaW4gcmVwbGFjZW1lbnQgdGV4dCBzeW50YXggd2hlbiBwZXJmb3JtaW5nIGEgcmVwbGFjZW1lbnRcbiAgICAvLyB1c2luZyBhIG5vbnJlZ2V4IHNlYXJjaCB2YWx1ZSwgYW5kIHRoZSB2YWx1ZSBvZiByZXBsYWNlbWVudCByZWdleGVzJyBgbGFzdEluZGV4YCBwcm9wZXJ0eVxuICAgIC8vIGR1cmluZyByZXBsYWNlbWVudCBpdGVyYXRpb25zLiBOb3RlIHRoYXQgdGhpcyBkb2Vzbid0IHN1cHBvcnQgU3BpZGVyTW9ua2V5J3MgcHJvcHJpZXRhcnlcbiAgICAvLyB0aGlyZCAoYGZsYWdzYCkgcGFyYW1ldGVyXG4gICAgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24gKHNlYXJjaCwgcmVwbGFjZW1lbnQpIHtcbiAgICAgICAgdmFyIGlzUmVnZXggPSBYUmVnRXhwLmlzUmVnRXhwKHNlYXJjaCksXG4gICAgICAgICAgICBjYXB0dXJlTmFtZXMsIHJlc3VsdCwgc3RyLCBvcmlnTGFzdEluZGV4O1xuXG4gICAgICAgIC8vIFRoZXJlIGFyZSB0b28gbWFueSBjb21iaW5hdGlvbnMgb2Ygc2VhcmNoL3JlcGxhY2VtZW50IHR5cGVzL3ZhbHVlcyBhbmQgYnJvd3NlciBidWdzIHRoYXRcbiAgICAgICAgLy8gcHJlY2x1ZGUgcGFzc2luZyB0byBuYXRpdmUgYHJlcGxhY2VgLCBzbyBkb24ndCB0cnlcbiAgICAgICAgLy9pZiAoLi4uKVxuICAgICAgICAvLyAgICByZXR1cm4gbmF0aXYucmVwbGFjZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIGlmIChpc1JlZ2V4KSB7XG4gICAgICAgICAgICBpZiAoc2VhcmNoLl94cmVnZXhwKVxuICAgICAgICAgICAgICAgIGNhcHR1cmVOYW1lcyA9IHNlYXJjaC5feHJlZ2V4cC5jYXB0dXJlTmFtZXM7IC8vIEFycmF5IG9yIGBudWxsYFxuICAgICAgICAgICAgaWYgKCFzZWFyY2guZ2xvYmFsKVxuICAgICAgICAgICAgICAgIG9yaWdMYXN0SW5kZXggPSBzZWFyY2gubGFzdEluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VhcmNoID0gc2VhcmNoICsgXCJcIjsgLy8gVHlwZSBjb252ZXJzaW9uXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHJlcGxhY2VtZW50KSA9PT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuYXRpdi5yZXBsYWNlLmNhbGwodGhpcyArIFwiXCIsIHNlYXJjaCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChjYXB0dXJlTmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hhbmdlIHRoZSBgYXJndW1lbnRzWzBdYCBzdHJpbmcgcHJpbWl0aXZlIHRvIGEgU3RyaW5nIG9iamVjdCB3aGljaCBjYW4gc3RvcmUgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0gPSBuZXcgU3RyaW5nKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN0b3JlIG5hbWVkIGJhY2tyZWZlcmVuY2VzIG9uIGBhcmd1bWVudHNbMF1gXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FwdHVyZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FwdHVyZU5hbWVzW2ldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtjYXB0dXJlTmFtZXNbaV1dID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgYGxhc3RJbmRleGAgYmVmb3JlIGNhbGxpbmcgYHJlcGxhY2VtZW50YCAoZml4IGJyb3dzZXJzKVxuICAgICAgICAgICAgICAgIGlmIChpc1JlZ2V4ICYmIHNlYXJjaC5nbG9iYWwpXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5sYXN0SW5kZXggPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDJdICsgYXJndW1lbnRzWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnQuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gdGhpcyArIFwiXCI7IC8vIFR5cGUgY29udmVyc2lvbiwgc28gYGFyZ3NbYXJncy5sZW5ndGggLSAxXWAgd2lsbCBiZSBhIHN0cmluZyAoZ2l2ZW4gbm9uc3RyaW5nIGB0aGlzYClcbiAgICAgICAgICAgIHJlc3VsdCA9IG5hdGl2LnJlcGxhY2UuY2FsbChzdHIsIHNlYXJjaCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzOyAvLyBLZWVwIHRoaXMgZnVuY3Rpb24ncyBgYXJndW1lbnRzYCBhdmFpbGFibGUgdGhyb3VnaCBjbG9zdXJlXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnJlcGxhY2UuY2FsbChyZXBsYWNlbWVudCArIFwiXCIsIHJlcGxhY2VtZW50VG9rZW4sIGZ1bmN0aW9uICgkMCwgJDEsICQyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE51bWJlcmVkIGJhY2tyZWZlcmVuY2UgKHdpdGhvdXQgZGVsaW1pdGVycykgb3Igc3BlY2lhbCB2YXJpYWJsZVxuICAgICAgICAgICAgICAgICAgICBpZiAoJDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoJDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiJFwiOiByZXR1cm4gXCIkXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIiZcIjogcmV0dXJuIGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImBcIjogcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXS5zbGljZSgwLCBhcmdzW2FyZ3MubGVuZ3RoIC0gMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCInXCI6IHJldHVybiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0uc2xpY2UoYXJnc1thcmdzLmxlbmd0aCAtIDJdICsgYXJnc1swXS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE51bWJlcmVkIGJhY2tyZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaGF0IGRvZXMgXCIkMTBcIiBtZWFuP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgMTAsIGlmIDEwIG9yIG1vcmUgY2FwdHVyaW5nIGdyb3VwcyBleGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgMSBmb2xsb3dlZCBieSBcIjBcIiwgaWYgMS05IGNhcHR1cmluZyBncm91cHMgZXhpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBPdGhlcndpc2UsIGl0J3MgdGhlIHN0cmluZyBcIiQxMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gbm90ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBCYWNrcmVmZXJlbmNlcyBjYW5ub3QgYmUgbW9yZSB0aGFuIHR3byBkaWdpdHMgKGVuZm9yY2VkIGJ5IGByZXBsYWNlbWVudFRva2VuYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBcIiQwMVwiIGlzIGVxdWl2YWxlbnQgdG8gXCIkMVwiIGlmIGEgY2FwdHVyaW5nIGdyb3VwIGV4aXN0cywgb3RoZXJ3aXNlIGl0J3MgdGhlIHN0cmluZyBcIiQwMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gVGhlcmUgaXMgbm8gXCIkMFwiIHRva2VuIChcIiQmXCIgaXMgdGhlIGVudGlyZSBtYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpdGVyYWxOdW1iZXJzID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJDEgPSArJDE7IC8vIFR5cGUgY29udmVyc2lvbjsgZHJvcCBsZWFkaW5nIHplcm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEkMSkgLy8gYCQxYCB3YXMgXCIwXCIgb3IgXCIwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgkMSA+IGFyZ3MubGVuZ3RoIC0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl0ZXJhbE51bWJlcnMgPSBTdHJpbmcucHJvdG90eXBlLnNsaWNlLmNhbGwoJDEsIC0xKSArIGxpdGVyYWxOdW1iZXJzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJDEgPSBNYXRoLmZsb29yKCQxIC8gMTApOyAvLyBEcm9wIHRoZSBsYXN0IGRpZ2l0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgkMSA/IGFyZ3NbJDFdIHx8IFwiXCIgOiBcIiRcIikgKyBsaXRlcmFsTnVtYmVycztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gTmFtZWQgYmFja3JlZmVyZW5jZSBvciBkZWxpbWl0ZWQgbnVtYmVyZWQgYmFja3JlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2hhdCBkb2VzIFwiJHtufVwiIG1lYW4/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAtIEJhY2tyZWZlcmVuY2UgdG8gbnVtYmVyZWQgY2FwdHVyZSBuLiBUd28gZGlmZmVyZW5jZXMgZnJvbSBcIiRuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgIC0gbiBjYW4gYmUgbW9yZSB0aGFuIHR3byBkaWdpdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgLSBCYWNrcmVmZXJlbmNlIDAgaXMgYWxsb3dlZCwgYW5kIGlzIHRoZSBlbnRpcmUgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0gQmFja3JlZmVyZW5jZSB0byBuYW1lZCBjYXB0dXJlIG4sIGlmIGl0IGV4aXN0cyBhbmQgaXMgbm90IGEgbnVtYmVyIG92ZXJyaWRkZW4gYnkgbnVtYmVyZWQgY2FwdHVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLSBPdGhlcndpc2UsIGl0J3MgdGhlIHN0cmluZyBcIiR7bn1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG4gPSArJDI7IC8vIFR5cGUgY29udmVyc2lvbjsgZHJvcCBsZWFkaW5nIHplcm9zXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobiA8PSBhcmdzLmxlbmd0aCAtIDMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3Nbbl07XG4gICAgICAgICAgICAgICAgICAgICAgICBuID0gY2FwdHVyZU5hbWVzID8gaW5kZXhPZihjYXB0dXJlTmFtZXMsICQyKSA6IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG4gPiAtMSA/IGFyZ3NbbiArIDFdIDogJDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzUmVnZXgpIHtcbiAgICAgICAgICAgIGlmIChzZWFyY2guZ2xvYmFsKVxuICAgICAgICAgICAgICAgIHNlYXJjaC5sYXN0SW5kZXggPSAwOyAvLyBGaXggSUUsIFNhZmFyaSBidWcgKGxhc3QgdGVzdGVkIElFIDkuMC41LCBTYWZhcmkgNS4xLjIgb24gV2luZG93cylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZWFyY2gubGFzdEluZGV4ID0gb3JpZ0xhc3RJbmRleDsgLy8gRml4IElFLCBPcGVyYSBidWcgKGxhc3QgdGVzdGVkIElFIDkuMC41LCBPcGVyYSAxMS42MSBvbiBXaW5kb3dzKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgLy8gQSBjb25zaXN0ZW50IGNyb3NzLWJyb3dzZXIsIEVTMyBjb21wbGlhbnQgYHNwbGl0YFxuICAgIFN0cmluZy5wcm90b3R5cGUuc3BsaXQgPSBmdW5jdGlvbiAocyAvKiBzZXBhcmF0b3IgKi8sIGxpbWl0KSB7XG4gICAgICAgIC8vIElmIHNlcGFyYXRvciBgc2AgaXMgbm90IGEgcmVnZXgsIHVzZSB0aGUgbmF0aXZlIGBzcGxpdGBcbiAgICAgICAgaWYgKCFYUmVnRXhwLmlzUmVnRXhwKHMpKVxuICAgICAgICAgICAgcmV0dXJuIG5hdGl2LnNwbGl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgdmFyIHN0ciA9IHRoaXMgKyBcIlwiLCAvLyBUeXBlIGNvbnZlcnNpb25cbiAgICAgICAgICAgIG91dHB1dCA9IFtdLFxuICAgICAgICAgICAgbGFzdExhc3RJbmRleCA9IDAsXG4gICAgICAgICAgICBtYXRjaCwgbGFzdExlbmd0aDtcblxuICAgICAgICAvLyBCZWhhdmlvciBmb3IgYGxpbWl0YDogaWYgaXQncy4uLlxuICAgICAgICAvLyAtIGB1bmRlZmluZWRgOiBObyBsaW1pdFxuICAgICAgICAvLyAtIGBOYU5gIG9yIHplcm86IFJldHVybiBhbiBlbXB0eSBhcnJheVxuICAgICAgICAvLyAtIEEgcG9zaXRpdmUgbnVtYmVyOiBVc2UgYE1hdGguZmxvb3IobGltaXQpYFxuICAgICAgICAvLyAtIEEgbmVnYXRpdmUgbnVtYmVyOiBObyBsaW1pdFxuICAgICAgICAvLyAtIE90aGVyOiBUeXBlLWNvbnZlcnQsIHRoZW4gdXNlIHRoZSBhYm92ZSBydWxlc1xuICAgICAgICBpZiAobGltaXQgPT09IHVuZGVmaW5lZCB8fCArbGltaXQgPCAwKSB7XG4gICAgICAgICAgICBsaW1pdCA9IEluZmluaXR5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGltaXQgPSBNYXRoLmZsb29yKCtsaW1pdCk7XG4gICAgICAgICAgICBpZiAoIWxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgaWYgbm90IGBzLmdsb2JhbGAsIGFuZCBpdCBhdm9pZHMgbmVlZGluZyB0byBzZXQgYHMubGFzdEluZGV4YCB0byB6ZXJvXG4gICAgICAgIC8vIGFuZCByZXN0b3JlIGl0IHRvIGl0cyBvcmlnaW5hbCB2YWx1ZSB3aGVuIHdlJ3JlIGRvbmUgdXNpbmcgdGhlIHJlZ2V4XG4gICAgICAgIHMgPSBYUmVnRXhwLmNvcHlBc0dsb2JhbChzKTtcblxuICAgICAgICB3aGlsZSAobWF0Y2ggPSBzLmV4ZWMoc3RyKSkgeyAvLyBSdW4gdGhlIGFsdGVyZWQgYGV4ZWNgIChyZXF1aXJlZCBmb3IgYGxhc3RJbmRleGAgZml4LCBldGMuKVxuICAgICAgICAgICAgaWYgKHMubGFzdEluZGV4ID4gbGFzdExhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4LCBtYXRjaC5pbmRleCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2guaW5kZXggPCBzdHIubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShvdXRwdXQsIG1hdGNoLnNsaWNlKDEpKTtcblxuICAgICAgICAgICAgICAgIGxhc3RMZW5ndGggPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGFzdExhc3RJbmRleCA9IHMubGFzdEluZGV4O1xuXG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dC5sZW5ndGggPj0gbGltaXQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocy5sYXN0SW5kZXggPT09IG1hdGNoLmluZGV4KVxuICAgICAgICAgICAgICAgIHMubGFzdEluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFzdExhc3RJbmRleCA9PT0gc3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCFuYXRpdi50ZXN0LmNhbGwocywgXCJcIikgfHwgbGFzdExlbmd0aClcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4KSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0Lmxlbmd0aCA+IGxpbWl0ID8gb3V0cHV0LnNsaWNlKDAsIGxpbWl0KSA6IG91dHB1dDtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQcml2YXRlIGhlbHBlciBmdW5jdGlvbnNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gU3VwcG9ydGluZyBmdW5jdGlvbiBmb3IgYFhSZWdFeHBgLCBgWFJlZ0V4cC5jb3B5QXNHbG9iYWxgLCBldGMuIFJldHVybnMgYSBjb3B5IG9mIGEgYFJlZ0V4cGBcbiAgICAvLyBpbnN0YW5jZSB3aXRoIGEgZnJlc2ggYGxhc3RJbmRleGAgKHNldCB0byB6ZXJvKSwgcHJlc2VydmluZyBwcm9wZXJ0aWVzIHJlcXVpcmVkIGZvciBuYW1lZFxuICAgIC8vIGNhcHR1cmUuIEFsc28gYWxsb3dzIGFkZGluZyBuZXcgZmxhZ3MgaW4gdGhlIHByb2Nlc3Mgb2YgY29weWluZyB0aGUgcmVnZXhcbiAgICBmdW5jdGlvbiBjbG9uZSAocmVnZXgsIGFkZGl0aW9uYWxGbGFncykge1xuICAgICAgICBpZiAoIVhSZWdFeHAuaXNSZWdFeHAocmVnZXgpKVxuICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwidHlwZSBSZWdFeHAgZXhwZWN0ZWRcIik7XG4gICAgICAgIHZhciB4ID0gcmVnZXguX3hyZWdleHA7XG4gICAgICAgIHJlZ2V4ID0gWFJlZ0V4cChyZWdleC5zb3VyY2UsIGdldE5hdGl2ZUZsYWdzKHJlZ2V4KSArIChhZGRpdGlvbmFsRmxhZ3MgfHwgXCJcIikpO1xuICAgICAgICBpZiAoeCkge1xuICAgICAgICAgICAgcmVnZXguX3hyZWdleHAgPSB7XG4gICAgICAgICAgICAgICAgc291cmNlOiB4LnNvdXJjZSxcbiAgICAgICAgICAgICAgICBjYXB0dXJlTmFtZXM6IHguY2FwdHVyZU5hbWVzID8geC5jYXB0dXJlTmFtZXMuc2xpY2UoMCkgOiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWdleDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXROYXRpdmVGbGFncyAocmVnZXgpIHtcbiAgICAgICAgcmV0dXJuIChyZWdleC5nbG9iYWwgICAgID8gXCJnXCIgOiBcIlwiKSArXG4gICAgICAgICAgICAgICAocmVnZXguaWdub3JlQ2FzZSA/IFwiaVwiIDogXCJcIikgK1xuICAgICAgICAgICAgICAgKHJlZ2V4Lm11bHRpbGluZSAgPyBcIm1cIiA6IFwiXCIpICtcbiAgICAgICAgICAgICAgIChyZWdleC5leHRlbmRlZCAgID8gXCJ4XCIgOiBcIlwiKSArIC8vIFByb3Bvc2VkIGZvciBFUzQ7IGluY2x1ZGVkIGluIEFTM1xuICAgICAgICAgICAgICAgKHJlZ2V4LnN0aWNreSAgICAgPyBcInlcIiA6IFwiXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1blRva2VucyAocGF0dGVybiwgaW5kZXgsIHNjb3BlLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpID0gdG9rZW5zLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdCwgbWF0Y2gsIHQ7XG4gICAgICAgIC8vIFByb3RlY3QgYWdhaW5zdCBjb25zdHJ1Y3RpbmcgWFJlZ0V4cHMgd2l0aGluIHRva2VuIGhhbmRsZXIgYW5kIHRyaWdnZXIgZnVuY3Rpb25zXG4gICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSB0cnVlO1xuICAgICAgICAvLyBNdXN0IHJlc2V0IGBpc0luc2lkZUNvbnN0cnVjdG9yYCwgZXZlbiBpZiBhIGB0cmlnZ2VyYCBvciBgaGFuZGxlcmAgdGhyb3dzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7IC8vIFJ1biBpbiByZXZlcnNlIG9yZGVyXG4gICAgICAgICAgICAgICAgdCA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoKHNjb3BlICYgdC5zY29wZSkgJiYgKCF0LnRyaWdnZXIgfHwgdC50cmlnZ2VyLmNhbGwoY29udGV4dCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHQucGF0dGVybi5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSB0LnBhdHRlcm4uZXhlYyhwYXR0ZXJuKTsgLy8gUnVubmluZyB0aGUgYWx0ZXJlZCBgZXhlY2AgaGVyZSBhbGxvd3MgdXNlIG9mIG5hbWVkIGJhY2tyZWZlcmVuY2VzLCBldGMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaC5pbmRleCA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IHQuaGFuZGxlci5jYWxsKGNvbnRleHQsIG1hdGNoLCBzY29wZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaXNJbnNpZGVDb25zdHJ1Y3RvciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5kZXhPZiAoYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICAgICAgaWYgKEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSAvLyBVc2UgdGhlIG5hdGl2ZSBhcnJheSBtZXRob2QgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtLCBmcm9tKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IGZyb20gfHwgMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgQnVpbHQtaW4gdG9rZW5zXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEF1Z21lbnQgWFJlZ0V4cCdzIHJlZ3VsYXIgZXhwcmVzc2lvbiBzeW50YXggYW5kIGZsYWdzLiBOb3RlIHRoYXQgd2hlbiBhZGRpbmcgdG9rZW5zLCB0aGVcbiAgICAvLyB0aGlyZCAoYHNjb3BlYCkgYXJndW1lbnQgZGVmYXVsdHMgdG8gYFhSZWdFeHAuT1VUU0lERV9DTEFTU2BcblxuICAgIC8vIENvbW1lbnQgcGF0dGVybjogKD8jIClcbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFwoXFw/I1teKV0qXFwpLyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRva2VucyBzZXBhcmF0ZWQgdW5sZXNzIHRoZSBmb2xsb3dpbmcgdG9rZW4gaXMgYSBxdWFudGlmaWVyXG4gICAgICAgICAgICByZXR1cm4gbmF0aXYudGVzdC5jYWxsKHF1YW50aWZpZXIsIG1hdGNoLmlucHV0LnNsaWNlKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSkgPyBcIlwiIDogXCIoPzopXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQ2FwdHVyaW5nIGdyb3VwIChtYXRjaCB0aGUgb3BlbmluZyBwYXJlbnRoZXNpcyBvbmx5KS5cbiAgICAvLyBSZXF1aXJlZCBmb3Igc3VwcG9ydCBvZiBuYW1lZCBjYXB0dXJpbmcgZ3JvdXBzXG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcKCg/IVxcPykvLFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhcHR1cmVOYW1lcy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIFwiKFwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIE5hbWVkIGNhcHR1cmluZyBncm91cCAobWF0Y2ggdGhlIG9wZW5pbmcgZGVsaW1pdGVyIG9ubHkpOiAoPzxuYW1lPlxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXChcXD88KFskXFx3XSspPi8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgdGhpcy5jYXB0dXJlTmFtZXMucHVzaChtYXRjaFsxXSk7XG4gICAgICAgICAgICB0aGlzLmhhc05hbWVkQ2FwdHVyZSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gXCIoXCI7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTmFtZWQgYmFja3JlZmVyZW5jZTogXFxrPG5hbWU+XG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL1xcXFxrPChbXFx3JF0rKT4vLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGluZGV4T2YodGhpcy5jYXB0dXJlTmFtZXMsIG1hdGNoWzFdKTtcbiAgICAgICAgICAgIC8vIEtlZXAgYmFja3JlZmVyZW5jZXMgc2VwYXJhdGUgZnJvbSBzdWJzZXF1ZW50IGxpdGVyYWwgbnVtYmVycy4gUHJlc2VydmUgYmFjay1cbiAgICAgICAgICAgIC8vIHJlZmVyZW5jZXMgdG8gbmFtZWQgZ3JvdXBzIHRoYXQgYXJlIHVuZGVmaW5lZCBhdCB0aGlzIHBvaW50IGFzIGxpdGVyYWwgc3RyaW5nc1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4ID4gLTEgP1xuICAgICAgICAgICAgICAgIFwiXFxcXFwiICsgKGluZGV4ICsgMSkgKyAoaXNOYU4obWF0Y2guaW5wdXQuY2hhckF0KG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSkgPyBcIlwiIDogXCIoPzopXCIpIDpcbiAgICAgICAgICAgICAgICBtYXRjaFswXTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBFbXB0eSBjaGFyYWN0ZXIgY2xhc3M6IFtdIG9yIFteXVxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC9cXFtcXF4/XS8sXG4gICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgLy8gRm9yIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJpbGl0eSB3aXRoIEVTMywgY29udmVydCBbXSB0byBcXGJcXEIgYW5kIFteXSB0byBbXFxzXFxTXS5cbiAgICAgICAgICAgIC8vICg/ISkgc2hvdWxkIHdvcmsgbGlrZSBcXGJcXEIsIGJ1dCBpcyB1bnJlbGlhYmxlIGluIEZpcmVmb3hcbiAgICAgICAgICAgIHJldHVybiBtYXRjaFswXSA9PT0gXCJbXVwiID8gXCJcXFxcYlxcXFxCXCIgOiBcIltcXFxcc1xcXFxTXVwiO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIE1vZGUgbW9kaWZpZXIgYXQgdGhlIHN0YXJ0IG9mIHRoZSBwYXR0ZXJuIG9ubHksIHdpdGggYW55IGNvbWJpbmF0aW9uIG9mIGZsYWdzIGltc3g6ICg/aW1zeClcbiAgICAvLyBEb2VzIG5vdCBzdXBwb3J0IHgoP2kpLCAoPy1pKSwgKD9pLW0pLCAoP2k6ICksICg/aSkoP20pLCBldGMuXG4gICAgWFJlZ0V4cC5hZGRUb2tlbihcbiAgICAgICAgL15cXChcXD8oW2ltc3hdKylcXCkvLFxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RmxhZyhtYXRjaFsxXSk7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBXaGl0ZXNwYWNlIGFuZCBjb21tZW50cywgaW4gZnJlZS1zcGFjaW5nIChha2EgZXh0ZW5kZWQpIG1vZGUgb25seVxuICAgIFhSZWdFeHAuYWRkVG9rZW4oXG4gICAgICAgIC8oPzpcXHMrfCMuKikrLyxcbiAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRva2VucyBzZXBhcmF0ZWQgdW5sZXNzIHRoZSBmb2xsb3dpbmcgdG9rZW4gaXMgYSBxdWFudGlmaWVyXG4gICAgICAgICAgICByZXR1cm4gbmF0aXYudGVzdC5jYWxsKHF1YW50aWZpZXIsIG1hdGNoLmlucHV0LnNsaWNlKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSkgPyBcIlwiIDogXCIoPzopXCI7XG4gICAgICAgIH0sXG4gICAgICAgIFhSZWdFeHAuT1VUU0lERV9DTEFTUyxcbiAgICAgICAgZnVuY3Rpb24gKCkge3JldHVybiB0aGlzLmhhc0ZsYWcoXCJ4XCIpO31cbiAgICApO1xuXG4gICAgLy8gRG90LCBpbiBkb3RhbGwgKGFrYSBzaW5nbGVsaW5lKSBtb2RlIG9ubHlcbiAgICBYUmVnRXhwLmFkZFRva2VuKFxuICAgICAgICAvXFwuLyxcbiAgICAgICAgZnVuY3Rpb24gKCkge3JldHVybiBcIltcXFxcc1xcXFxTXVwiO30sXG4gICAgICAgIFhSZWdFeHAuT1VUU0lERV9DTEFTUyxcbiAgICAgICAgZnVuY3Rpb24gKCkge3JldHVybiB0aGlzLmhhc0ZsYWcoXCJzXCIpO31cbiAgICApO1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBCYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIFVuY29tbWVudCB0aGUgZm9sbG93aW5nIGJsb2NrIGZvciBjb21wYXRpYmlsaXR5IHdpdGggWFJlZ0V4cCAxLjAtMS4yOlxuICAgIC8qXG4gICAgWFJlZ0V4cC5tYXRjaFdpdGhpbkNoYWluID0gWFJlZ0V4cC5tYXRjaENoYWluO1xuICAgIFJlZ0V4cC5wcm90b3R5cGUuYWRkRmxhZ3MgPSBmdW5jdGlvbiAocykge3JldHVybiBjbG9uZSh0aGlzLCBzKTt9O1xuICAgIFJlZ0V4cC5wcm90b3R5cGUuZXhlY0FsbCA9IGZ1bmN0aW9uIChzKSB7dmFyIHIgPSBbXTsgWFJlZ0V4cC5pdGVyYXRlKHMsIHRoaXMsIGZ1bmN0aW9uIChtKSB7ci5wdXNoKG0pO30pOyByZXR1cm4gcjt9O1xuICAgIFJlZ0V4cC5wcm90b3R5cGUuZm9yRWFjaEV4ZWMgPSBmdW5jdGlvbiAocywgZiwgYykge3JldHVybiBYUmVnRXhwLml0ZXJhdGUocywgdGhpcywgZiwgYyk7fTtcbiAgICBSZWdFeHAucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKHMpIHt2YXIgciA9IFJlZ0V4cChcIl4oPzpcIiArIHRoaXMuc291cmNlICsgXCIpJCg/IVxcXFxzKVwiLCBnZXROYXRpdmVGbGFncyh0aGlzKSk7IGlmICh0aGlzLmdsb2JhbCkgdGhpcy5sYXN0SW5kZXggPSAwOyByZXR1cm4gcy5zZWFyY2gocikgPT09IDA7fTtcbiAgICAqL1xuXG59KSgpO1xuXG5cbm1vZHVsZS5leHBvcnRzLlhSZWdFeHAgPSBYUmVnRXhwOyIsInZhciBYUmVnRXhwID0gcmVxdWlyZShcIi4vWFJlZ0V4cFwiKS5YUmVnRXhwO1xudmFyIGNsYXNzTmFtZSxcbiAgIGd1dHRlcjtcbi8vXG4vLyBCZWdpbiBhbm9ueW1vdXMgZnVuY3Rpb24uIFRoaXMgaXMgdXNlZCB0byBjb250YWluIGxvY2FsIHNjb3BlIHZhcmlhYmxlcyB3aXRob3V0IHBvbHV0dGluZyBnbG9iYWwgc2NvcGUuXG4vL1xudmFyIFN5bnRheEhpZ2hsaWdodGVyID0gZnVuY3Rpb24oKSB7IFxuXG4vLyBDb21tb25KU1xuaWYgKHR5cGVvZihyZXF1aXJlKSAhPSAndW5kZWZpbmVkJyAmJiB0eXBlb2YoWFJlZ0V4cCkgPT0gJ3VuZGVmaW5lZCcpXG57XG4vLyBObyBvcCBzaW5jZSByZXF1aXJlZCBwcm9wZXJseSBhdCB0b3Agb2YgZmlsZVxuXG59XG5cbi8vIFNob3J0Y3V0IG9iamVjdCB3aGljaCB3aWxsIGJlIGFzc2lnbmVkIHRvIHRoZSBTeW50YXhIaWdobGlnaHRlciB2YXJpYWJsZS5cbi8vIFRoaXMgaXMgYSBzaG9ydGhhbmQgZm9yIGxvY2FsIHJlZmVyZW5jZSBpbiBvcmRlciB0byBhdm9pZCBsb25nIG5hbWVzcGFjZSBcbi8vIHJlZmVyZW5jZXMgdG8gU3ludGF4SGlnaGxpZ2h0ZXIud2hhdGV2ZXIuLi5cbnZhciBzaCA9IHtcblx0ZGVmYXVsdHMgOiB7XG5cdFx0LyoqIEFkZGl0aW9uYWwgQ1NTIGNsYXNzIG5hbWVzIHRvIGJlIGFkZGVkIHRvIGhpZ2hsaWdodGVyIGVsZW1lbnRzLiAqL1xuXHRcdCdjbGFzcy1uYW1lJyA6ICcnLFxuXHRcdFxuXHRcdC8qKiBGaXJzdCBsaW5lIG51bWJlci4gKi9cblx0XHQnZmlyc3QtbGluZScgOiAxLFxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFBhZHMgbGluZSBudW1iZXJzLiBQb3NzaWJsZSB2YWx1ZXMgYXJlOlxuXHRcdCAqXG5cdFx0ICogICBmYWxzZSAtIGRvbid0IHBhZCBsaW5lIG51bWJlcnMuXG5cdFx0ICogICB0cnVlICAtIGF1dG9tYXRpY2FseSBwYWQgbnVtYmVycyB3aXRoIG1pbmltdW0gcmVxdWlyZWQgbnVtYmVyIG9mIGxlYWRpbmcgemVyb2VzLlxuXHRcdCAqICAgW2ludF0gLSBsZW5ndGggdXAgdG8gd2hpY2ggcGFkIGxpbmUgbnVtYmVycy5cblx0XHQgKi9cblx0XHQncGFkLWxpbmUtbnVtYmVycycgOiBmYWxzZSxcblx0XHRcblx0XHQvKiogTGluZXMgdG8gaGlnaGxpZ2h0LiAqL1xuXHRcdCdoaWdobGlnaHQnIDogbnVsbCxcblx0XHRcblx0XHQvKiogVGl0bGUgdG8gYmUgZGlzcGxheWVkIGFib3ZlIHRoZSBjb2RlIGJsb2NrLiAqL1xuXHRcdCd0aXRsZScgOiBudWxsLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIHNtYXJ0IHRhYnMuICovXG5cdFx0J3NtYXJ0LXRhYnMnIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogR2V0cyBvciBzZXRzIHRhYiBzaXplLiAqL1xuXHRcdCd0YWItc2l6ZScgOiA0LFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGd1dHRlci4gKi9cblx0XHQnZ3V0dGVyJyA6IHRydWUsXG5cdFx0XG5cdFx0LyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdG9vbGJhci4gKi9cblx0XHQndG9vbGJhcicgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIHF1aWNrIGNvZGUgY29weSBhbmQgcGFzdGUgZnJvbSBkb3VibGUgY2xpY2suICovXG5cdFx0J3F1aWNrLWNvZGUnIDogdHJ1ZSxcblx0XHRcblx0XHQvKiogRm9yY2VzIGNvZGUgdmlldyB0byBiZSBjb2xsYXBzZWQuICovXG5cdFx0J2NvbGxhcHNlJyA6IGZhbHNlLFxuXHRcdFxuXHRcdC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGF1dG9tYXRpYyBsaW5rcy4gKi9cblx0XHQnYXV0by1saW5rcycgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBHZXRzIG9yIHNldHMgbGlnaHQgbW9kZS4gRXF1YXZhbGVudCB0byB0dXJuaW5nIG9mZiBndXR0ZXIgYW5kIHRvb2xiYXIuICovXG5cdFx0J2xpZ2h0JyA6IGZhbHNlLFxuXG5cdFx0J3VuaW5kZW50JyA6IHRydWUsXG5cdFx0XG5cdFx0J2h0bWwtc2NyaXB0JyA6IGZhbHNlXG5cdH0sXG5cdFxuXHRjb25maWcgOiB7XG5cdFx0c3BhY2UgOiAnJm5ic3A7Jyxcblx0XHRcblx0XHQvKiogRW5hYmxlcyB1c2Ugb2YgPFNDUklQVCB0eXBlPVwic3ludGF4aGlnaGxpZ2h0ZXJcIiAvPiB0YWdzLiAqL1xuXHRcdHVzZVNjcmlwdFRhZ3MgOiB0cnVlLFxuXHRcdFxuXHRcdC8qKiBCbG9nZ2VyIG1vZGUgZmxhZy4gKi9cblx0XHRibG9nZ2VyTW9kZSA6IGZhbHNlLFxuXHRcdFxuXHRcdHN0cmlwQnJzIDogZmFsc2UsXG5cdFx0XG5cdFx0LyoqIE5hbWUgb2YgdGhlIHRhZyB0aGF0IFN5bnRheEhpZ2hsaWdodGVyIHdpbGwgYXV0b21hdGljYWxseSBsb29rIGZvci4gKi9cblx0XHR0YWdOYW1lIDogJ3ByZScsXG5cdFx0XG5cdFx0c3RyaW5ncyA6IHtcblx0XHRcdGV4cGFuZFNvdXJjZSA6ICdleHBhbmQgc291cmNlJyxcblx0XHRcdGhlbHAgOiAnPycsXG5cdFx0XHRhbGVydDogJ1N5bnRheEhpZ2hsaWdodGVyXFxuXFxuJyxcblx0XHRcdG5vQnJ1c2ggOiAnQ2FuXFwndCBmaW5kIGJydXNoIGZvcjogJyxcblx0XHRcdGJydXNoTm90SHRtbFNjcmlwdCA6ICdCcnVzaCB3YXNuXFwndCBjb25maWd1cmVkIGZvciBodG1sLXNjcmlwdCBvcHRpb246ICcsXG5cdFx0XHRcblx0XHRcdC8vIHRoaXMgaXMgcG9wdWxhdGVkIGJ5IHRoZSBidWlsZCBzY3JpcHRcblx0XHRcdGFib3V0RGlhbG9nIDogJ0BBQk9VVEAnXG5cdFx0fVxuXHR9LFxuXHRcblx0LyoqIEludGVybmFsICdnbG9iYWwnIHZhcmlhYmxlcy4gKi9cblx0dmFycyA6IHtcblx0XHRkaXNjb3ZlcmVkQnJ1c2hlcyA6IG51bGwsXG5cdFx0aGlnaGxpZ2h0ZXJzIDoge31cblx0fSxcblx0XG5cdC8qKiBUaGlzIG9iamVjdCBpcyBwb3B1bGF0ZWQgYnkgdXNlciBpbmNsdWRlZCBleHRlcm5hbCBicnVzaCBmaWxlcy4gKi9cblx0YnJ1c2hlcyA6IHt9LFxuXG5cdC8qKiBDb21tb24gcmVndWxhciBleHByZXNzaW9ucy4gKi9cblx0cmVnZXhMaWIgOiB7XG5cdFx0bXVsdGlMaW5lQ0NvbW1lbnRzXHRcdFx0OiAvXFwvXFwqW1xcc1xcU10qP1xcKlxcLy9nbSxcblx0XHRzaW5nbGVMaW5lQ0NvbW1lbnRzXHRcdFx0OiAvXFwvXFwvLiokL2dtLFxuXHRcdHNpbmdsZUxpbmVQZXJsQ29tbWVudHNcdFx0OiAvIy4qJC9nbSxcblx0XHRkb3VibGVRdW90ZWRTdHJpbmdcdFx0XHQ6IC9cIihbXlxcXFxcIlxcbl18XFxcXC4pKlwiL2csXG5cdFx0c2luZ2xlUXVvdGVkU3RyaW5nXHRcdFx0OiAvJyhbXlxcXFwnXFxuXXxcXFxcLikqJy9nLFxuXHRcdG11bHRpTGluZURvdWJsZVF1b3RlZFN0cmluZ1x0OiBuZXcgWFJlZ0V4cCgnXCIoW15cXFxcXFxcXFwiXXxcXFxcXFxcXC4pKlwiJywgJ2dzJyksXG5cdFx0bXVsdGlMaW5lU2luZ2xlUXVvdGVkU3RyaW5nXHQ6IG5ldyBYUmVnRXhwKFwiJyhbXlxcXFxcXFxcJ118XFxcXFxcXFwuKSonXCIsICdncycpLFxuXHRcdHhtbENvbW1lbnRzXHRcdFx0XHRcdDogLygmbHQ7fDwpIS0tW1xcc1xcU10qPy0tKCZndDt8PikvZ20sXG5cdFx0dXJsXHRcdFx0XHRcdFx0XHQ6IC9cXHcrOlxcL1xcL1tcXHctLlxcLz8lJj06QDsjXSovZyxcblx0XHRcblx0XHQvKiogPD89ID8+IHRhZ3MuICovXG5cdFx0cGhwU2NyaXB0VGFncyBcdFx0XHRcdDogeyBsZWZ0OiAvKCZsdDt8PClcXD8oPzo9fHBocCk/L2csIHJpZ2h0OiAvXFw/KCZndDt8PikvZywgJ2VvZicgOiB0cnVlIH0sXG5cdFx0XG5cdFx0LyoqIDwlPSAlPiB0YWdzLiAqL1xuXHRcdGFzcFNjcmlwdFRhZ3NcdFx0XHRcdDogeyBsZWZ0OiAvKCZsdDt8PCklPT8vZywgcmlnaHQ6IC8lKCZndDt8PikvZyB9LFxuXHRcdFxuXHRcdC8qKiA8c2NyaXB0PiB0YWdzLiAqL1xuXHRcdHNjcmlwdFNjcmlwdFRhZ3NcdFx0XHQ6IHsgbGVmdDogLygmbHQ7fDwpXFxzKnNjcmlwdC4qPygmZ3Q7fD4pL2dpLCByaWdodDogLygmbHQ7fDwpXFwvXFxzKnNjcmlwdFxccyooJmd0O3w+KS9naSB9XG5cdH0sXG5cblx0dG9vbGJhcjoge1xuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgdGhlIHRvb2xiYXIuXG5cdFx0ICogQHBhcmFtIHtIaWdobGlnaHRlcn0gaGlnaGxpZ2h0ZXIgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UuXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHRcdCAqL1xuXHRcdGdldEh0bWw6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdHtcblx0XHRcdHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJ0b29sYmFyXCI+Jyxcblx0XHRcdFx0aXRlbXMgPSBzaC50b29sYmFyLml0ZW1zLFxuXHRcdFx0XHRsaXN0ID0gaXRlbXMubGlzdFxuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdGZ1bmN0aW9uIGRlZmF1bHRHZXRIdG1sKGhpZ2hsaWdodGVyLCBuYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gc2gudG9vbGJhci5nZXRCdXR0b25IdG1sKGhpZ2hsaWdodGVyLCBuYW1lLCBzaC5jb25maWcuc3RyaW5nc1tuYW1lXSk7XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspXG5cdFx0XHRcdGh0bWwgKz0gKGl0ZW1zW2xpc3RbaV1dLmdldEh0bWwgfHwgZGVmYXVsdEdldEh0bWwpKGhpZ2hsaWdodGVyLCBsaXN0W2ldKTtcblx0XHRcdFxuXHRcdFx0aHRtbCArPSAnPC9kaXY+Jztcblx0XHRcdFxuXHRcdFx0cmV0dXJuIGh0bWw7XG5cdFx0fSxcblx0XHRcblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIGEgcmVndWxhciBidXR0b24gaW4gdGhlIHRvb2xiYXIuXG5cdFx0ICogQHBhcmFtIHtIaWdobGlnaHRlcn0gaGlnaGxpZ2h0ZXIgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UuXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGNvbW1hbmROYW1lXHRcdENvbW1hbmQgbmFtZSB0aGF0IHdvdWxkIGJlIGV4ZWN1dGVkLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbFx0XHRcdExhYmVsIHRleHQgdG8gZGlzcGxheS5cblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0XHRcdFJldHVybnMgSFRNTCBtYXJrdXAuXG5cdFx0ICovXG5cdFx0Z2V0QnV0dG9uSHRtbDogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIsIGNvbW1hbmROYW1lLCBsYWJlbClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJzxzcGFuPjxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ0b29sYmFyX2l0ZW0nXG5cdFx0XHRcdCsgJyBjb21tYW5kXycgKyBjb21tYW5kTmFtZVxuXHRcdFx0XHQrICcgJyArIGNvbW1hbmROYW1lXG5cdFx0XHRcdCsgJ1wiPicgKyBsYWJlbCArICc8L2E+PC9zcGFuPidcblx0XHRcdFx0O1xuXHRcdH0sXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogRXZlbnQgaGFuZGxlciBmb3IgYSB0b29sYmFyIGFuY2hvci5cblx0XHQgKi9cblx0XHRoYW5kbGVyOiBmdW5jdGlvbihlKVxuXHRcdHtcblx0XHRcdHZhciB0YXJnZXQgPSBlLnRhcmdldCxcblx0XHRcdFx0Y2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZSB8fCAnJ1xuXHRcdFx0XHQ7XG5cblx0XHRcdGZ1bmN0aW9uIGdldFZhbHVlKG5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciByID0gbmV3IFJlZ0V4cChuYW1lICsgJ18oXFxcXHcrKScpLFxuXHRcdFx0XHRcdG1hdGNoID0gci5leGVjKGNsYXNzTmFtZSlcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0dmFyIGhpZ2hsaWdodGVyID0gZ2V0SGlnaGxpZ2h0ZXJCeUlkKGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgJy5zeW50YXhoaWdobGlnaHRlcicpLmlkKSxcblx0XHRcdFx0Y29tbWFuZE5hbWUgPSBnZXRWYWx1ZSgnY29tbWFuZCcpXG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0Ly8gZXhlY3V0ZSB0aGUgdG9vbGJhciBjb21tYW5kXG5cdFx0XHRpZiAoaGlnaGxpZ2h0ZXIgJiYgY29tbWFuZE5hbWUpXG5cdFx0XHRcdHNoLnRvb2xiYXIuaXRlbXNbY29tbWFuZE5hbWVdLmV4ZWN1dGUoaGlnaGxpZ2h0ZXIpO1xuXG5cdFx0XHQvLyBkaXNhYmxlIGRlZmF1bHQgQSBjbGljayBiZWhhdmlvdXJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9LFxuXHRcdFxuXHRcdC8qKiBDb2xsZWN0aW9uIG9mIHRvb2xiYXIgaXRlbXMuICovXG5cdFx0aXRlbXMgOiB7XG5cdFx0XHQvLyBPcmRlcmVkIGxpcyBvZiBpdGVtcyBpbiB0aGUgdG9vbGJhci4gQ2FuJ3QgZXhwZWN0IGBmb3IgKHZhciBuIGluIGl0ZW1zKWAgdG8gYmUgY29uc2lzdGVudC5cblx0XHRcdGxpc3Q6IFsnZXhwYW5kU291cmNlJywgJ2hlbHAnXSxcblxuXHRcdFx0ZXhwYW5kU291cmNlOiB7XG5cdFx0XHRcdGdldEh0bWw6IGZ1bmN0aW9uKGhpZ2hsaWdodGVyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGhpZ2hsaWdodGVyLmdldFBhcmFtKCdjb2xsYXBzZScpICE9IHRydWUpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHR2YXIgdGl0bGUgPSBoaWdobGlnaHRlci5nZXRQYXJhbSgndGl0bGUnKTtcblx0XHRcdFx0XHRyZXR1cm4gc2gudG9vbGJhci5nZXRCdXR0b25IdG1sKGhpZ2hsaWdodGVyLCAnZXhwYW5kU291cmNlJywgdGl0bGUgPyB0aXRsZSA6IHNoLmNvbmZpZy5zdHJpbmdzLmV4cGFuZFNvdXJjZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcblx0XHRcdFx0ZXhlY3V0ZTogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgZGl2ID0gZ2V0SGlnaGxpZ2h0ZXJEaXZCeUlkKGhpZ2hsaWdodGVyLmlkKTtcblx0XHRcdFx0XHRyZW1vdmVDbGFzcyhkaXYsICdjb2xsYXBzZWQnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqIENvbW1hbmQgdG8gZGlzcGxheSB0aGUgYWJvdXQgZGlhbG9nIHdpbmRvdy4gKi9cblx0XHRcdGhlbHA6IHtcblx0XHRcdFx0ZXhlY3V0ZTogZnVuY3Rpb24oaGlnaGxpZ2h0ZXIpXG5cdFx0XHRcdHtcdFxuXHRcdFx0XHRcdHZhciB3bmQgPSBwb3B1cCgnJywgJ19ibGFuaycsIDUwMCwgMjUwLCAnc2Nyb2xsYmFycz0wJyksXG5cdFx0XHRcdFx0XHRkb2MgPSB3bmQuZG9jdW1lbnRcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkb2Mud3JpdGUoc2guY29uZmlnLnN0cmluZ3MuYWJvdXREaWFsb2cpO1xuXHRcdFx0XHRcdGRvYy5jbG9zZSgpO1xuXHRcdFx0XHRcdHduZC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhbGwgZWxlbWVudHMgb24gdGhlIHBhZ2Ugd2hpY2ggc2hvdWxkIGJlIHByb2Nlc3NlcyBieSBTeW50YXhIaWdobGlnaHRlci5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGdsb2JhbFBhcmFtc1x0XHRPcHRpb25hbCBwYXJhbWV0ZXJzIHdoaWNoIG92ZXJyaWRlIGVsZW1lbnQncyBcblx0ICogXHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1ldGVycy4gT25seSB1c2VkIGlmIGVsZW1lbnQgaXMgc3BlY2lmaWVkLlxuXHQgKiBcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcdE9wdGlvbmFsIGVsZW1lbnQgdG8gaGlnaGxpZ2h0LiBJZiBub25lIGlzXG5cdCAqIFx0XHRcdFx0XHRcdFx0cHJvdmlkZWQsIGFsbCBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBkb2N1bWVudCBcblx0ICogXHRcdFx0XHRcdFx0XHRhcmUgcmV0dXJuZWQgd2hpY2ggcXVhbGlmeS5cblx0ICpcblx0ICogQHJldHVybiB7QXJyYXl9XHRSZXR1cm5zIGxpc3Qgb2YgPGNvZGU+eyB0YXJnZXQ6IERPTUVsZW1lbnQsIHBhcmFtczogT2JqZWN0IH08L2NvZGU+IG9iamVjdHMuXG5cdCAqL1xuXHRmaW5kRWxlbWVudHM6IGZ1bmN0aW9uKGdsb2JhbFBhcmFtcywgZWxlbWVudClcblx0e1xuXHRcdHZhciBlbGVtZW50cyA9IGVsZW1lbnQgPyBbZWxlbWVudF0gOiB0b0FycmF5KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHNoLmNvbmZpZy50YWdOYW1lKSksIFxuXHRcdFx0Y29uZiA9IHNoLmNvbmZpZyxcblx0XHRcdHJlc3VsdCA9IFtdXG5cdFx0XHQ7XG5cblx0XHQvLyBzdXBwb3J0IGZvciA8U0NSSVBUIFRZUEU9XCJzeW50YXhoaWdobGlnaHRlclwiIC8+IGZlYXR1cmVcblx0XHRpZiAoY29uZi51c2VTY3JpcHRUYWdzKVxuXHRcdFx0ZWxlbWVudHMgPSBlbGVtZW50cy5jb25jYXQoZ2V0U3ludGF4SGlnaGxpZ2h0ZXJTY3JpcHRUYWdzKCkpO1xuXG5cdFx0aWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkgXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSBcblx0XHR7XG5cdFx0XHR2YXIgaXRlbSA9IHtcblx0XHRcdFx0dGFyZ2V0OiBlbGVtZW50c1tpXSwgXG5cdFx0XHRcdC8vIGxvY2FsIHBhcmFtcyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBnbG9iYWxzXG5cdFx0XHRcdHBhcmFtczogbWVyZ2UoZ2xvYmFsUGFyYW1zLCBwYXJzZVBhcmFtcyhlbGVtZW50c1tpXS5jbGFzc05hbWUpKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKGl0ZW0ucGFyYW1zWydicnVzaCddID09IG51bGwpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdHJlc3VsdC5wdXNoKGl0ZW0pO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTaG9ydGhhbmQgdG8gaGlnaGxpZ2h0IGFsbCBlbGVtZW50cyBvbiB0aGUgcGFnZSB0aGF0IGFyZSBtYXJrZWQgYXMgXG5cdCAqIFN5bnRheEhpZ2hsaWdodGVyIHNvdXJjZSBjb2RlLlxuXHQgKiBcblx0ICogQHBhcmFtIHtPYmplY3R9IGdsb2JhbFBhcmFtc1x0XHRPcHRpb25hbCBwYXJhbWV0ZXJzIHdoaWNoIG92ZXJyaWRlIGVsZW1lbnQncyBcblx0ICogXHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1ldGVycy4gT25seSB1c2VkIGlmIGVsZW1lbnQgaXMgc3BlY2lmaWVkLlxuXHQgKiBcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcdE9wdGlvbmFsIGVsZW1lbnQgdG8gaGlnaGxpZ2h0LiBJZiBub25lIGlzXG5cdCAqIFx0XHRcdFx0XHRcdFx0cHJvdmlkZWQsIGFsbCBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBkb2N1bWVudCBcblx0ICogXHRcdFx0XHRcdFx0XHRhcmUgaGlnaGxpZ2h0ZWQuXG5cdCAqLyBcblx0aGlnaGxpZ2h0OiBmdW5jdGlvbihnbG9iYWxQYXJhbXMsIGVsZW1lbnQpXG5cdHtcblx0XHR2YXIgZWxlbWVudHMgPSB0aGlzLmZpbmRFbGVtZW50cyhnbG9iYWxQYXJhbXMsIGVsZW1lbnQpLFxuXHRcdFx0cHJvcGVydHlOYW1lID0gJ2lubmVySFRNTCcsIFxuXHRcdFx0aGlnaGxpZ2h0ZXIgPSBudWxsLFxuXHRcdFx0Y29uZiA9IHNoLmNvbmZpZ1xuXHRcdFx0O1xuXG5cdFx0aWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkgXG5cdFx0XHRyZXR1cm47XG5cdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIFxuXHRcdHtcblx0XHRcdHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV0sXG5cdFx0XHRcdHRhcmdldCA9IGVsZW1lbnQudGFyZ2V0LFxuXHRcdFx0XHRwYXJhbXMgPSBlbGVtZW50LnBhcmFtcyxcblx0XHRcdFx0YnJ1c2hOYW1lID0gcGFyYW1zLmJydXNoLFxuXHRcdFx0XHRjb2RlXG5cdFx0XHRcdDtcblxuXHRcdFx0aWYgKGJydXNoTmFtZSA9PSBudWxsKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0Ly8gSW5zdGFudGlhdGUgYSBicnVzaFxuXHRcdFx0aWYgKHBhcmFtc1snaHRtbC1zY3JpcHQnXSA9PSAndHJ1ZScgfHwgc2guZGVmYXVsdHNbJ2h0bWwtc2NyaXB0J10gPT0gdHJ1ZSkgXG5cdFx0XHR7XG5cdFx0XHRcdGhpZ2hsaWdodGVyID0gbmV3IHNoLkh0bWxTY3JpcHQoYnJ1c2hOYW1lKTtcblx0XHRcdFx0YnJ1c2hOYW1lID0gJ2h0bWxzY3JpcHQnO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgYnJ1c2ggPSBmaW5kQnJ1c2goYnJ1c2hOYW1lKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChicnVzaClcblx0XHRcdFx0XHRoaWdobGlnaHRlciA9IG5ldyBicnVzaCgpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGNvZGUgPSB0YXJnZXRbcHJvcGVydHlOYW1lXTtcblx0XHRcdFxuXHRcdFx0Ly8gcmVtb3ZlIENEQVRBIGZyb20gPFNDUklQVC8+IHRhZ3MgaWYgaXQncyBwcmVzZW50XG5cdFx0XHRpZiAoY29uZi51c2VTY3JpcHRUYWdzKVxuXHRcdFx0XHRjb2RlID0gc3RyaXBDRGF0YShjb2RlKTtcblx0XHRcdFx0XG5cdFx0XHQvLyBJbmplY3QgdGl0bGUgaWYgdGhlIGF0dHJpYnV0ZSBpcyBwcmVzZW50XG5cdFx0XHRpZiAoKHRhcmdldC50aXRsZSB8fCAnJykgIT0gJycpXG5cdFx0XHRcdHBhcmFtcy50aXRsZSA9IHRhcmdldC50aXRsZTtcblx0XHRcdFx0XG5cdFx0XHRwYXJhbXNbJ2JydXNoJ10gPSBicnVzaE5hbWU7XG5cdFx0XHRoaWdobGlnaHRlci5pbml0KHBhcmFtcyk7XG5cdFx0XHRlbGVtZW50ID0gaGlnaGxpZ2h0ZXIuZ2V0RGl2KGNvZGUpO1xuXHRcdFx0XG5cdFx0XHQvLyBjYXJyeSBvdmVyIElEXG5cdFx0XHRpZiAoKHRhcmdldC5pZCB8fCAnJykgIT0gJycpXG5cdFx0XHRcdGVsZW1lbnQuaWQgPSB0YXJnZXQuaWQ7XG5cdFx0XHRcblx0XHRcdHRhcmdldC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbGVtZW50LCB0YXJnZXQpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIFN5bnRheEhpZ2hsaWdodGVyLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIE9wdGlvbmFsIHBhcmFtcyB0byBhcHBseSB0byBhbGwgaGlnaGxpZ2h0ZWQgZWxlbWVudHMuXG5cdCAqL1xuXHRhbGw6IGZ1bmN0aW9uKHBhcmFtcylcblx0e1xuXHRcdGF0dGFjaEV2ZW50KFxuXHRcdFx0d2luZG93LFxuXHRcdFx0J2xvYWQnLFxuXHRcdFx0ZnVuY3Rpb24oKSB7IHNoLmhpZ2hsaWdodChwYXJhbXMpOyB9XG5cdFx0KTtcblx0fVxufTsgLy8gZW5kIG9mIHNoXG5cbi8qKlxuICogQ2hlY2tzIGlmIHRhcmdldCBET00gZWxlbWVudHMgaGFzIHNwZWNpZmllZCBDU1MgY2xhc3MuXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnQgdG8gY2hlY2suXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIE5hbWUgb2YgdGhlIENTUyBjbGFzcyB0byBjaGVjayBmb3IuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgY2xhc3MgbmFtZSBpcyBwcmVzZW50LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGhhc0NsYXNzKHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHRyZXR1cm4gdGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKGNsYXNzTmFtZSkgIT0gLTE7XG59O1xuXG4vKipcbiAqIEFkZHMgQ1NTIGNsYXNzIG5hbWUgdG8gdGhlIHRhcmdldCBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgTmV3IENTUyBjbGFzcyB0byBhZGQuXG4gKi9cbmZ1bmN0aW9uIGFkZENsYXNzKHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHRpZiAoIWhhc0NsYXNzKHRhcmdldCwgY2xhc3NOYW1lKSlcblx0XHR0YXJnZXQuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBDU1MgY2xhc3MgbmFtZSBmcm9tIHRoZSB0YXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0RPTUVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIENTUyBjbGFzcyB0byByZW1vdmUuXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHR0YXJnZXQuY2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZS5yZXBsYWNlKGNsYXNzTmFtZSwgJycpO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgc291cmNlIHRvIGFycmF5IG9iamVjdC4gTW9zdGx5IHVzZWQgZm9yIGZ1bmN0aW9uIGFyZ3VtZW50cyBhbmQgXG4gKiBsaXN0cyByZXR1cm5lZCBieSBnZXRFbGVtZW50c0J5VGFnTmFtZSgpIHdoaWNoIGFyZW4ndCBBcnJheSBvYmplY3RzLlxuICogQHBhcmFtIHtMaXN0fSBzb3VyY2UgU291cmNlIGxpc3QuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gdG9BcnJheShzb3VyY2UpXG57XG5cdHZhciByZXN1bHQgPSBbXTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSBcblx0XHRyZXN1bHQucHVzaChzb3VyY2VbaV0pO1xuXHRcdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBTcGxpdHMgYmxvY2sgb2YgdGV4dCBpbnRvIGxpbmVzLlxuICogQHBhcmFtIHtTdHJpbmd9IGJsb2NrIEJsb2NrIG9mIHRleHQuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhcnJheSBvZiBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gc3BsaXRMaW5lcyhibG9jaylcbntcblx0cmV0dXJuIGJsb2NrLnNwbGl0KC9cXHI/XFxuLyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIEhUTUwgSUQgZm9yIHRoZSBoaWdobGlnaHRlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBoaWdobGlnaHRlcklkIEhpZ2hsaWdodGVyIElELlxuICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIEhUTUwgSUQuXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodGVySWQoaWQpXG57XG5cdHZhciBwcmVmaXggPSAnaGlnaGxpZ2h0ZXJfJztcblx0cmV0dXJuIGlkLmluZGV4T2YocHJlZml4KSA9PSAwID8gaWQgOiBwcmVmaXggKyBpZDtcbn07XG5cbi8qKlxuICogRmluZHMgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UgYnkgSUQuXG4gKiBAcGFyYW0ge1N0cmluZ30gaGlnaGxpZ2h0ZXJJZCBIaWdobGlnaHRlciBJRC5cbiAqIEByZXR1cm4ge0hpZ2hsaWdodGVyfSBSZXR1cm5zIGluc3RhbmNlIG9mIHRoZSBoaWdobGlnaHRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0SGlnaGxpZ2h0ZXJCeUlkKGlkKVxue1xuXHRyZXR1cm4gc2gudmFycy5oaWdobGlnaHRlcnNbZ2V0SGlnaGxpZ2h0ZXJJZChpZCldO1xufTtcblxuLyoqXG4gKiBGaW5kcyBoaWdobGlnaHRlcidzIERJViBjb250YWluZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gaGlnaGxpZ2h0ZXJJZCBIaWdobGlnaHRlciBJRC5cbiAqIEByZXR1cm4ge0VsZW1lbnR9IFJldHVybnMgaGlnaGxpZ2h0ZXIncyBESVYgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZ2V0SGlnaGxpZ2h0ZXJEaXZCeUlkKGlkKVxue1xuXHRyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZ2V0SGlnaGxpZ2h0ZXJJZChpZCkpO1xufTtcblxuLyoqXG4gKiBTdG9yZXMgaGlnaGxpZ2h0ZXIgc28gdGhhdCBnZXRIaWdobGlnaHRlckJ5SWQoKSBjYW4gZG8gaXRzIHRoaW5nLiBFYWNoXG4gKiBoaWdobGlnaHRlciBtdXN0IGNhbGwgdGhpcyBtZXRob2QgdG8gcHJlc2VydmUgaXRzZWxmLlxuICogQHBhcmFtIHtIaWdoaWxnaHRlcn0gaGlnaGxpZ2h0ZXIgSGlnaGxpZ2h0ZXIgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0b3JlSGlnaGxpZ2h0ZXIoaGlnaGxpZ2h0ZXIpXG57XG5cdHNoLnZhcnMuaGlnaGxpZ2h0ZXJzW2dldEhpZ2hsaWdodGVySWQoaGlnaGxpZ2h0ZXIuaWQpXSA9IGhpZ2hsaWdodGVyO1xufTtcblxuLyoqXG4gKiBMb29rcyBmb3IgYSBjaGlsZCBvciBwYXJlbnQgbm9kZSB3aGljaCBoYXMgc3BlY2lmaWVkIGNsYXNzbmFtZS5cbiAqIEVxdWl2YWxlbnQgdG8galF1ZXJ5J3MgJChjb250YWluZXIpLmZpbmQoXCIuY2xhc3NOYW1lXCIpXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCBUYXJnZXQgZWxlbWVudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWFyY2ggQ2xhc3MgbmFtZSBvciBub2RlIG5hbWUgdG8gbG9vayBmb3IuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJldmVyc2UgSWYgc2V0IHRvIHRydWUsIHdpbGwgZ28gdXAgdGhlIG5vZGUgdHJlZSBpbnN0ZWFkIG9mIGRvd24uXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBSZXR1cm5zIGZvdW5kIGNoaWxkIG9yIHBhcmVudCBlbGVtZW50IG9uIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGZpbmRFbGVtZW50KHRhcmdldCwgc2VhcmNoLCByZXZlcnNlIC8qIG9wdGlvbmFsICovKVxue1xuXHRpZiAodGFyZ2V0ID09IG51bGwpXG5cdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdHZhciBub2Rlc1x0XHRcdD0gcmV2ZXJzZSAhPSB0cnVlID8gdGFyZ2V0LmNoaWxkTm9kZXMgOiBbIHRhcmdldC5wYXJlbnROb2RlIF0sXG5cdFx0cHJvcGVydHlUb0ZpbmRcdD0geyAnIycgOiAnaWQnLCAnLicgOiAnY2xhc3NOYW1lJyB9W3NlYXJjaC5zdWJzdHIoMCwgMSldIHx8ICdub2RlTmFtZScsXG5cdFx0ZXhwZWN0ZWRWYWx1ZSxcblx0XHRmb3VuZFxuXHRcdDtcblxuXHRleHBlY3RlZFZhbHVlID0gcHJvcGVydHlUb0ZpbmQgIT0gJ25vZGVOYW1lJ1xuXHRcdD8gc2VhcmNoLnN1YnN0cigxKVxuXHRcdDogc2VhcmNoLnRvVXBwZXJDYXNlKClcblx0XHQ7XG5cdFx0XG5cdC8vIG1haW4gcmV0dXJuIG9mIHRoZSBmb3VuZCBub2RlXG5cdGlmICgodGFyZ2V0W3Byb3BlcnR5VG9GaW5kXSB8fCAnJykuaW5kZXhPZihleHBlY3RlZFZhbHVlKSAhPSAtMSlcblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IG5vZGVzICYmIGkgPCBub2Rlcy5sZW5ndGggJiYgZm91bmQgPT0gbnVsbDsgaSsrKVxuXHRcdGZvdW5kID0gZmluZEVsZW1lbnQobm9kZXNbaV0sIHNlYXJjaCwgcmV2ZXJzZSk7XG5cdFxuXHRyZXR1cm4gZm91bmQ7XG59O1xuXG4vKipcbiAqIExvb2tzIGZvciBhIHBhcmVudCBub2RlIHdoaWNoIGhhcyBzcGVjaWZpZWQgY2xhc3NuYW1lLlxuICogVGhpcyBpcyBhbiBhbGlhcyB0byA8Y29kZT5maW5kRWxlbWVudChjb250YWluZXIsIGNsYXNzTmFtZSwgdHJ1ZSk8L2NvZGU+LlxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IGVsZW1lbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIENsYXNzIG5hbWUgdG8gbG9vayBmb3IuXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBSZXR1cm5zIGZvdW5kIHBhcmVudCBlbGVtZW50IG9uIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgY2xhc3NOYW1lKVxue1xuXHRyZXR1cm4gZmluZEVsZW1lbnQodGFyZ2V0LCBjbGFzc05hbWUsIHRydWUpO1xufTtcblxuLyoqXG4gKiBGaW5kcyBhbiBpbmRleCBvZiBlbGVtZW50IGluIHRoZSBhcnJheS5cbiAqIEBpZ25vcmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZWFyY2hFbGVtZW50XG4gKiBAcGFyYW0ge051bWJlcn0gZnJvbUluZGV4XG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFJldHVybnMgaW5kZXggb2YgZWxlbWVudCBpZiBmb3VuZDsgLTEgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCBzZWFyY2hFbGVtZW50LCBmcm9tSW5kZXgpXG57XG5cdGZyb21JbmRleCA9IE1hdGgubWF4KGZyb21JbmRleCB8fCAwLCAwKTtcblxuXHRmb3IgKHZhciBpID0gZnJvbUluZGV4OyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspXG5cdFx0aWYoYXJyYXlbaV0gPT0gc2VhcmNoRWxlbWVudClcblx0XHRcdHJldHVybiBpO1xuXHRcblx0cmV0dXJuIC0xO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB1bmlxdWUgZWxlbWVudCBJRC5cbiAqL1xuZnVuY3Rpb24gZ3VpZChwcmVmaXgpXG57XG5cdHJldHVybiAocHJlZml4IHx8ICcnKSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApLnRvU3RyaW5nKCk7XG59O1xuXG4vKipcbiAqIE1lcmdlcyB0d28gb2JqZWN0cy4gVmFsdWVzIGZyb20gb2JqMiBvdmVycmlkZSB2YWx1ZXMgaW4gb2JqMS5cbiAqIEZ1bmN0aW9uIGlzIE5PVCByZWN1cnNpdmUgYW5kIHdvcmtzIG9ubHkgZm9yIG9uZSBkaW1lbnNpb25hbCBvYmplY3RzLlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgRmlyc3Qgb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IG9iajIgU2Vjb25kIG9iamVjdC5cbiAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBjb21iaW5hdGlvbiBvZiBib3RoIG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKG9iajEsIG9iajIpXG57XG5cdHZhciByZXN1bHQgPSB7fSwgbmFtZTtcblxuXHRmb3IgKG5hbWUgaW4gb2JqMSkgXG5cdFx0cmVzdWx0W25hbWVdID0gb2JqMVtuYW1lXTtcblx0XG5cdGZvciAobmFtZSBpbiBvYmoyKSBcblx0XHRyZXN1bHRbbmFtZV0gPSBvYmoyW25hbWVdO1xuXHRcdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBjb252ZXJ0IHN0cmluZyB0byBib29sZWFuLlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIElucHV0IHN0cmluZy5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBpbnB1dCB3YXMgXCJ0cnVlXCIsIGZhbHNlIGlmIGlucHV0IHdhcyBcImZhbHNlXCIgYW5kIHZhbHVlIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlKVxue1xuXHR2YXIgcmVzdWx0ID0geyBcInRydWVcIiA6IHRydWUsIFwiZmFsc2VcIiA6IGZhbHNlIH1bdmFsdWVdO1xuXHRyZXR1cm4gcmVzdWx0ID09IG51bGwgPyB2YWx1ZSA6IHJlc3VsdDtcbn07XG5cbi8qKlxuICogT3BlbnMgdXAgYSBjZW50ZXJlZCBwb3B1cCB3aW5kb3cuXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXHRcdFVSTCB0byBvcGVuIGluIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVx0XHRQb3B1cCBuYW1lLlxuICogQHBhcmFtIHtpbnR9IHdpZHRoXHRcdFBvcHVwIHdpZHRoLlxuICogQHBhcmFtIHtpbnR9IGhlaWdodFx0XHRQb3B1cCBoZWlnaHQuXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9uc1x0d2luZG93Lm9wZW4oKSBvcHRpb25zLlxuICogQHJldHVybiB7V2luZG93fVx0XHRcdFJldHVybnMgd2luZG93IGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBwb3B1cCh1cmwsIG5hbWUsIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpXG57XG5cdHZhciB4ID0gKHNjcmVlbi53aWR0aCAtIHdpZHRoKSAvIDIsXG5cdFx0eSA9IChzY3JlZW4uaGVpZ2h0IC0gaGVpZ2h0KSAvIDJcblx0XHQ7XG5cdFx0XG5cdG9wdGlvbnMgKz1cdCcsIGxlZnQ9JyArIHggKyBcblx0XHRcdFx0JywgdG9wPScgKyB5ICtcblx0XHRcdFx0Jywgd2lkdGg9JyArIHdpZHRoICtcblx0XHRcdFx0JywgaGVpZ2h0PScgKyBoZWlnaHRcblx0XHQ7XG5cdG9wdGlvbnMgPSBvcHRpb25zLnJlcGxhY2UoL14sLywgJycpO1xuXG5cdHZhciB3aW4gPSB3aW5kb3cub3Blbih1cmwsIG5hbWUsIG9wdGlvbnMpO1xuXHR3aW4uZm9jdXMoKTtcblx0cmV0dXJuIHdpbjtcbn07XG5cbi8qKlxuICogQWRkcyBldmVudCBoYW5kbGVyIHRvIHRoZSB0YXJnZXQgb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IG9ialx0XHRUYXJnZXQgb2JqZWN0LlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcdFx0TmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jXHRIYW5kbGluZyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYXR0YWNoRXZlbnQob2JqLCB0eXBlLCBmdW5jLCBzY29wZSlcbntcblx0ZnVuY3Rpb24gaGFuZGxlcihlKVxuXHR7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdFxuXHRcdGlmICghZS50YXJnZXQpXG5cdFx0e1xuXHRcdFx0ZS50YXJnZXQgPSBlLnNyY0VsZW1lbnQ7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnJldHVyblZhbHVlID0gZmFsc2U7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRcdFxuXHRcdGZ1bmMuY2FsbChzY29wZSB8fCB3aW5kb3csIGUpO1xuXHR9O1xuXHRcblx0aWYgKG9iai5hdHRhY2hFdmVudCkgXG5cdHtcblx0XHRvYmouYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGhhbmRsZXIpO1xuXHR9XG5cdGVsc2UgXG5cdHtcblx0XHRvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XG5cdH1cbn07XG5cbi8qKlxuICogRGlzcGxheXMgYW4gYWxlcnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBkaXNwbGF5LlxuICovXG5mdW5jdGlvbiBhbGVydChzdHIpXG57XG5cdHdpbmRvdy5hbGVydChzaC5jb25maWcuc3RyaW5ncy5hbGVydCArIHN0cik7XG59O1xuXG4vKipcbiAqIEZpbmRzIGEgYnJ1c2ggYnkgaXRzIGFsaWFzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhbGlhc1x0XHRCcnVzaCBhbGlhcy5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hvd0FsZXJ0XHRTdXBwcmVzc2VzIHRoZSBhbGVydCBpZiBmYWxzZS5cbiAqIEByZXR1cm4ge0JydXNofVx0XHRcdFx0UmV0dXJucyBidXJzaCBjb25zdHJ1Y3RvciBpZiBmb3VuZCwgbnVsbCBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGZpbmRCcnVzaChhbGlhcywgc2hvd0FsZXJ0KVxue1xuXHR2YXIgYnJ1c2hlcyA9IHNoLnZhcnMuZGlzY292ZXJlZEJydXNoZXMsXG5cdFx0cmVzdWx0ID0gbnVsbFxuXHRcdDtcblx0XG5cdGlmIChicnVzaGVzID09IG51bGwpIFxuXHR7XG5cdFx0YnJ1c2hlcyA9IHt9O1xuXHRcdFxuXHRcdC8vIEZpbmQgYWxsIGJydXNoZXNcblx0XHRmb3IgKHZhciBicnVzaCBpbiBzaC5icnVzaGVzKSBcblx0XHR7XG5cdFx0XHR2YXIgaW5mbyA9IHNoLmJydXNoZXNbYnJ1c2hdLFxuXHRcdFx0XHRhbGlhc2VzID0gaW5mby5hbGlhc2VzXG5cdFx0XHRcdDtcblx0XHRcdFxuXHRcdFx0aWYgKGFsaWFzZXMgPT0gbnVsbCkgXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHQvLyBrZWVwIHRoZSBicnVzaCBuYW1lXG5cdFx0XHRpbmZvLmJydXNoTmFtZSA9IGJydXNoLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYWxpYXNlcy5sZW5ndGg7IGkrKykgXG5cdFx0XHRcdGJydXNoZXNbYWxpYXNlc1tpXV0gPSBicnVzaDtcblx0XHR9XG5cdFx0XG5cdFx0c2gudmFycy5kaXNjb3ZlcmVkQnJ1c2hlcyA9IGJydXNoZXM7XG5cdH1cblx0XG5cdHJlc3VsdCA9IHNoLmJydXNoZXNbYnJ1c2hlc1thbGlhc11dO1xuXG5cdGlmIChyZXN1bHQgPT0gbnVsbCAmJiBzaG93QWxlcnQpXG5cdFx0YWxlcnQoc2guY29uZmlnLnN0cmluZ3Mubm9CcnVzaCArIGFsaWFzKTtcblx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY2FsbGJhY2sgb24gZWFjaCBsaW5lIGFuZCByZXBsYWNlcyBlYWNoIGxpbmUgd2l0aCByZXN1bHQgZnJvbSB0aGUgY2FsbGJhY2suXG4gKiBAcGFyYW0ge09iamVjdH0gc3RyXHRcdFx0SW5wdXQgc3RyaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IGNhbGxiYWNrXHRcdENhbGxiYWNrIGZ1bmN0aW9uIHRha2luZyBvbmUgc3RyaW5nIGFyZ3VtZW50IGFuZCByZXR1cm5pbmcgYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGVhY2hMaW5lKHN0ciwgY2FsbGJhY2spXG57XG5cdHZhciBsaW5lcyA9IHNwbGl0TGluZXMoc3RyKTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspXG5cdFx0bGluZXNbaV0gPSBjYWxsYmFjayhsaW5lc1tpXSwgaSk7XG5cdFx0XG5cdC8vIGluY2x1ZGUgXFxyIHRvIGVuYWJsZSBjb3B5LXBhc3RlIG9uIHdpbmRvd3MgKGllOCkgd2l0aG91dCBnZXR0aW5nIGV2ZXJ5dGhpbmcgb24gb25lIGxpbmVcblx0cmV0dXJuIGxpbmVzLmpvaW4oJ1xcclxcbicpO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGEgc3BlY2lhbCB0cmltIHdoaWNoIG9ubHkgcmVtb3ZlcyBmaXJzdCBhbmQgbGFzdCBlbXB0eSBsaW5lc1xuICogYW5kIGRvZXNuJ3QgYWZmZWN0IHZhbGlkIGxlYWRpbmcgc3BhY2Ugb24gdGhlIGZpcnN0IGxpbmUuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBSZXR1cm5zIHN0cmluZyB3aXRob3V0IGVtcHR5IGZpcnN0IGFuZCBsYXN0IGxpbmVzLlxuICovXG5mdW5jdGlvbiB0cmltRmlyc3RBbmRMYXN0TGluZXMoc3RyKVxue1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL15bIF0qW1xcbl0rfFtcXG5dKlsgXSokL2csICcnKTtcbn07XG5cbi8qKlxuICogUGFyc2VzIGtleS92YWx1ZSBwYWlycyBpbnRvIGhhc2ggb2JqZWN0LlxuICogXG4gKiBVbmRlcnN0YW5kcyB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gKiAtIG5hbWU6IHdvcmQ7XG4gKiAtIG5hbWU6IFt3b3JkLCB3b3JkXTtcbiAqIC0gbmFtZTogXCJzdHJpbmdcIjtcbiAqIC0gbmFtZTogJ3N0cmluZyc7XG4gKiBcbiAqIEZvciBleGFtcGxlOlxuICogICBuYW1lMTogdmFsdWU7IG5hbWUyOiBbdmFsdWUsIHZhbHVlXTsgbmFtZTM6ICd2YWx1ZSdcbiAqICAgXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgIElucHV0IHN0cmluZy5cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgUmV0dXJucyBkZXNlcmlhbGl6ZWQgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBwYXJzZVBhcmFtcyhzdHIpXG57XG5cdHZhciBtYXRjaCwgXG5cdFx0cmVzdWx0ID0ge30sXG5cdFx0YXJyYXlSZWdleCA9IG5ldyBYUmVnRXhwKFwiXlxcXFxbKD88dmFsdWVzPiguKj8pKVxcXFxdJFwiKSxcblx0XHRyZWdleCA9IG5ldyBYUmVnRXhwKFxuXHRcdFx0XCIoPzxuYW1lPltcXFxcdy1dKylcIiArXG5cdFx0XHRcIlxcXFxzKjpcXFxccypcIiArXG5cdFx0XHRcIig/PHZhbHVlPlwiICtcblx0XHRcdFx0XCJbXFxcXHctJSNdK3xcIiArXHRcdC8vIHdvcmRcblx0XHRcdFx0XCJcXFxcWy4qP1xcXFxdfFwiICtcdFx0Ly8gW10gYXJyYXlcblx0XHRcdFx0J1wiLio/XCJ8JyArXHRcdFx0Ly8gXCJcIiBzdHJpbmdcblx0XHRcdFx0XCInLio/J1wiICtcdFx0XHQvLyAnJyBzdHJpbmdcblx0XHRcdFwiKVxcXFxzKjs/XCIsXG5cdFx0XHRcImdcIlxuXHRcdClcblx0XHQ7XG5cblx0d2hpbGUgKChtYXRjaCA9IHJlZ2V4LmV4ZWMoc3RyKSkgIT0gbnVsbCkgXG5cdHtcblx0XHR2YXIgdmFsdWUgPSBtYXRjaC52YWx1ZVxuXHRcdFx0LnJlcGxhY2UoL15bJ1wiXXxbJ1wiXSQvZywgJycpIC8vIHN0cmlwIHF1b3RlcyBmcm9tIGVuZCBvZiBzdHJpbmdzXG5cdFx0XHQ7XG5cdFx0XG5cdFx0Ly8gdHJ5IHRvIHBhcnNlIGFycmF5IHZhbHVlXG5cdFx0aWYgKHZhbHVlICE9IG51bGwgJiYgYXJyYXlSZWdleC50ZXN0KHZhbHVlKSlcblx0XHR7XG5cdFx0XHR2YXIgbSA9IGFycmF5UmVnZXguZXhlYyh2YWx1ZSk7XG5cdFx0XHR2YWx1ZSA9IG0udmFsdWVzLmxlbmd0aCA+IDAgPyBtLnZhbHVlcy5zcGxpdCgvXFxzKixcXHMqLykgOiBbXTtcblx0XHR9XG5cdFx0XG5cdFx0cmVzdWx0W21hdGNoLm5hbWVdID0gdmFsdWU7XG5cdH1cblx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFdyYXBzIGVhY2ggbGluZSBvZiB0aGUgc3RyaW5nIGludG8gPGNvZGUvPiB0YWcgd2l0aCBnaXZlbiBzdHlsZSBhcHBsaWVkIHRvIGl0LlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgSW5wdXQgc3RyaW5nLlxuICogQHBhcmFtIHtTdHJpbmd9IGNzcyAgIFN0eWxlIG5hbWUgdG8gYXBwbHkgdG8gdGhlIHN0cmluZy5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBSZXR1cm5zIGlucHV0IHN0cmluZyB3aXRoIGVhY2ggbGluZSBzdXJyb3VuZGVkIGJ5IDxzcGFuLz4gdGFnLlxuICovXG5mdW5jdGlvbiB3cmFwTGluZXNXaXRoQ29kZShzdHIsIGNzcylcbntcblx0aWYgKHN0ciA9PSBudWxsIHx8IHN0ci5sZW5ndGggPT0gMCB8fCBzdHIgPT0gJ1xcbicpIFxuXHRcdHJldHVybiBzdHI7XG5cblx0c3RyID0gc3RyLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcblxuXHQvLyBSZXBsYWNlIHR3byBvciBtb3JlIHNlcXVlbnRpYWwgc3BhY2VzIHdpdGggJm5ic3A7IGxlYXZpbmcgbGFzdCBzcGFjZSB1bnRvdWNoZWQuXG5cdHN0ciA9IHN0ci5yZXBsYWNlKC8gezIsfS9nLCBmdW5jdGlvbihtKVxuXHR7XG5cdFx0dmFyIHNwYWNlcyA9ICcnO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGggLSAxOyBpKyspXG5cdFx0XHRzcGFjZXMgKz0gc2guY29uZmlnLnNwYWNlO1xuXHRcdFxuXHRcdHJldHVybiBzcGFjZXMgKyAnICc7XG5cdH0pO1xuXG5cdC8vIFNwbGl0IGVhY2ggbGluZSBhbmQgYXBwbHkgPHNwYW4gY2xhc3M9XCIuLi5cIj4uLi48L3NwYW4+IHRvIHRoZW0gc28gdGhhdFxuXHQvLyBsZWFkaW5nIHNwYWNlcyBhcmVuJ3QgaW5jbHVkZWQuXG5cdGlmIChjc3MgIT0gbnVsbCkgXG5cdFx0c3RyID0gZWFjaExpbmUoc3RyLCBmdW5jdGlvbihsaW5lKVxuXHRcdHtcblx0XHRcdGlmIChsaW5lLmxlbmd0aCA9PSAwKSBcblx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0XG5cdFx0XHR2YXIgc3BhY2VzID0gJyc7XG5cdFx0XHRcblx0XHRcdGxpbmUgPSBsaW5lLnJlcGxhY2UoL14oJm5ic3A7fCApKy8sIGZ1bmN0aW9uKHMpXG5cdFx0XHR7XG5cdFx0XHRcdHNwYWNlcyA9IHM7XG5cdFx0XHRcdHJldHVybiAnJztcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT0gMCkgXG5cdFx0XHRcdHJldHVybiBzcGFjZXM7XG5cdFx0XHRcblx0XHRcdHJldHVybiBzcGFjZXMgKyAnPGNvZGUgY2xhc3M9XCInICsgY3NzICsgJ1wiPicgKyBsaW5lICsgJzwvY29kZT4nO1xuXHRcdH0pO1xuXG5cdHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIFBhZHMgbnVtYmVyIHdpdGggemVyb3MgdW50aWwgaXQncyBsZW5ndGggaXMgdGhlIHNhbWUgYXMgZ2l2ZW4gbGVuZ3RoLlxuICogXG4gKiBAcGFyYW0ge051bWJlcn0gbnVtYmVyXHROdW1iZXIgdG8gcGFkLlxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aFx0TWF4IHN0cmluZyBsZW5ndGggd2l0aC5cbiAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRSZXR1cm5zIGEgc3RyaW5nIHBhZGRlZCB3aXRoIHByb3BlciBhbW91bnQgb2YgJzAnLlxuICovXG5mdW5jdGlvbiBwYWROdW1iZXIobnVtYmVyLCBsZW5ndGgpXG57XG5cdHZhciByZXN1bHQgPSBudW1iZXIudG9TdHJpbmcoKTtcblx0XG5cdHdoaWxlIChyZXN1bHQubGVuZ3RoIDwgbGVuZ3RoKVxuXHRcdHJlc3VsdCA9ICcwJyArIHJlc3VsdDtcblx0XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlcGxhY2VzIHRhYnMgd2l0aCBzcGFjZXMuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFNvdXJjZSBjb2RlLlxuICogQHBhcmFtIHtOdW1iZXJ9IHRhYlNpemVcdFNpemUgb2YgdGhlIHRhYi5cbiAqIEByZXR1cm4ge1N0cmluZ31cdFx0XHRSZXR1cm5zIGNvZGUgd2l0aCBhbGwgdGFicyByZXBsYWNlcyBieSBzcGFjZXMuXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NUYWJzKGNvZGUsIHRhYlNpemUpXG57XG5cdHZhciB0YWIgPSAnJztcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGFiU2l6ZTsgaSsrKVxuXHRcdHRhYiArPSAnICc7XG5cblx0cmV0dXJuIGNvZGUucmVwbGFjZSgvXFx0L2csIHRhYik7XG59O1xuXG4vKipcbiAqIFJlcGxhY2VzIHRhYnMgd2l0aCBzbWFydCBzcGFjZXMuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlICAgIENvZGUgdG8gZml4IHRoZSB0YWJzIGluLlxuICogQHBhcmFtIHtOdW1iZXJ9IHRhYlNpemUgTnVtYmVyIG9mIHNwYWNlcyBpbiBhIGNvbHVtbi5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgIFJldHVybnMgY29kZSB3aXRoIGFsbCB0YWJzIHJlcGxhY2VzIHdpdGggcm9wZXIgYW1vdW50IG9mIHNwYWNlcy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1NtYXJ0VGFicyhjb2RlLCB0YWJTaXplKVxue1xuXHR2YXIgbGluZXMgPSBzcGxpdExpbmVzKGNvZGUpLFxuXHRcdHRhYiA9ICdcXHQnLFxuXHRcdHNwYWNlcyA9ICcnXG5cdFx0O1xuXHRcblx0Ly8gQ3JlYXRlIGEgc3RyaW5nIHdpdGggMTAwMCBzcGFjZXMgdG8gY29weSBzcGFjZXMgZnJvbS4uLiBcblx0Ly8gSXQncyBhc3N1bWVkIHRoYXQgdGhlcmUgd291bGQgYmUgbm8gaW5kZW50YXRpb24gbG9uZ2VyIHRoYW4gdGhhdC5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCA1MDsgaSsrKSBcblx0XHRzcGFjZXMgKz0gJyAgICAgICAgICAgICAgICAgICAgJzsgLy8gMjAgc3BhY2VzICogNTBcblx0XHRcdFxuXHQvLyBUaGlzIGZ1bmN0aW9uIGluc2VydHMgc3BlY2lmaWVkIGFtb3VudCBvZiBzcGFjZXMgaW4gdGhlIHN0cmluZ1xuXHQvLyB3aGVyZSBhIHRhYiBpcyB3aGlsZSByZW1vdmluZyB0aGF0IGdpdmVuIHRhYi5cblx0ZnVuY3Rpb24gaW5zZXJ0U3BhY2VzKGxpbmUsIHBvcywgY291bnQpXG5cdHtcblx0XHRyZXR1cm4gbGluZS5zdWJzdHIoMCwgcG9zKVxuXHRcdFx0KyBzcGFjZXMuc3Vic3RyKDAsIGNvdW50KVxuXHRcdFx0KyBsaW5lLnN1YnN0cihwb3MgKyAxLCBsaW5lLmxlbmd0aCkgLy8gcG9zICsgMSB3aWxsIGdldCByaWQgb2YgdGhlIHRhYlxuXHRcdFx0O1xuXHR9O1xuXG5cdC8vIEdvIHRocm91Z2ggYWxsIHRoZSBsaW5lcyBhbmQgZG8gdGhlICdzbWFydCB0YWJzJyBtYWdpYy5cblx0Y29kZSA9IGVhY2hMaW5lKGNvZGUsIGZ1bmN0aW9uKGxpbmUpXG5cdHtcblx0XHRpZiAobGluZS5pbmRleE9mKHRhYikgPT0gLTEpIFxuXHRcdFx0cmV0dXJuIGxpbmU7XG5cdFx0XG5cdFx0dmFyIHBvcyA9IDA7XG5cdFx0XG5cdFx0d2hpbGUgKChwb3MgPSBsaW5lLmluZGV4T2YodGFiKSkgIT0gLTEpIFxuXHRcdHtcblx0XHRcdC8vIFRoaXMgaXMgcHJldHR5IG11Y2ggYWxsIHRoZXJlIGlzIHRvIHRoZSAnc21hcnQgdGFicycgbG9naWMuXG5cdFx0XHQvLyBCYXNlZCBvbiB0aGUgcG9zaXRpb24gd2l0aGluIHRoZSBsaW5lIGFuZCBzaXplIG9mIGEgdGFiLFxuXHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBhbW91bnQgb2Ygc3BhY2VzIHdlIG5lZWQgdG8gaW5zZXJ0LlxuXHRcdFx0dmFyIHNwYWNlcyA9IHRhYlNpemUgLSBwb3MgJSB0YWJTaXplO1xuXHRcdFx0bGluZSA9IGluc2VydFNwYWNlcyhsaW5lLCBwb3MsIHNwYWNlcyk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBsaW5lO1xuXHR9KTtcblx0XG5cdHJldHVybiBjb2RlO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyB2YXJpb3VzIHN0cmluZyBmaXhlcyBiYXNlZCBvbiBjb25maWd1cmF0aW9uLlxuICovXG5mdW5jdGlvbiBmaXhJbnB1dFN0cmluZyhzdHIpXG57XG5cdHZhciBiciA9IC88YnJcXHMqXFwvPz58Jmx0O2JyXFxzKlxcLz8mZ3Q7L2dpO1xuXHRcblx0aWYgKHNoLmNvbmZpZy5ibG9nZ2VyTW9kZSA9PSB0cnVlKVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKGJyLCAnXFxuJyk7XG5cblx0aWYgKHNoLmNvbmZpZy5zdHJpcEJycyA9PSB0cnVlKVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKGJyLCAnJyk7XG5cdFx0XG5cdHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIHdoaXRlIHNwYWNlIGF0IHRoZSBiZWdpbmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgU3RyaW5nIHRvIHRyaW0uXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgUmV0dXJucyBzdHJpbmcgd2l0aG91dCBsZWFkaW5nIGFuZCBmb2xsb3dpbmcgd2hpdGUgc3BhY2UgY2hhcmFjdGVycy5cbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpXG57XG5cdHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufTtcblxuLyoqXG4gKiBVbmluZGVudHMgYSBibG9jayBvZiB0ZXh0IGJ5IHRoZSBsb3dlc3QgY29tbW9uIGluZGVudCBhbW91bnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgVGV4dCB0byB1bmluZGVudC5cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBSZXR1cm5zIHVuaW5kZW50ZWQgdGV4dCBibG9jay5cbiAqL1xuZnVuY3Rpb24gdW5pbmRlbnQoc3RyKVxue1xuXHR2YXIgbGluZXMgPSBzcGxpdExpbmVzKGZpeElucHV0U3RyaW5nKHN0cikpLFxuXHRcdGluZGVudHMgPSBuZXcgQXJyYXkoKSxcblx0XHRyZWdleCA9IC9eXFxzKi8sXG5cdFx0bWluID0gMTAwMFxuXHRcdDtcblx0XG5cdC8vIGdvIHRocm91Z2ggZXZlcnkgbGluZSBhbmQgY2hlY2sgZm9yIGNvbW1vbiBudW1iZXIgb2YgaW5kZW50c1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aCAmJiBtaW4gPiAwOyBpKyspIFxuXHR7XG5cdFx0dmFyIGxpbmUgPSBsaW5lc1tpXTtcblx0XHRcblx0XHRpZiAodHJpbShsaW5lKS5sZW5ndGggPT0gMCkgXG5cdFx0XHRjb250aW51ZTtcblx0XHRcblx0XHR2YXIgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMobGluZSk7XG5cdFx0XG5cdFx0Ly8gSW4gdGhlIGV2ZW50IHRoYXQganVzdCBvbmUgbGluZSBkb2Vzbid0IGhhdmUgbGVhZGluZyB3aGl0ZSBzcGFjZVxuXHRcdC8vIHdlIGNhbid0IHVuaW5kZW50IGFueXRoaW5nLCBzbyBiYWlsIGNvbXBsZXRlbHkuXG5cdFx0aWYgKG1hdGNoZXMgPT0gbnVsbCkgXG5cdFx0XHRyZXR1cm4gc3RyO1xuXHRcdFx0XG5cdFx0bWluID0gTWF0aC5taW4obWF0Y2hlc1swXS5sZW5ndGgsIG1pbik7XG5cdH1cblx0XG5cdC8vIHRyaW0gbWluaW11bSBjb21tb24gbnVtYmVyIG9mIHdoaXRlIHNwYWNlIGZyb20gdGhlIGJlZ2luaW5nIG9mIGV2ZXJ5IGxpbmVcblx0aWYgKG1pbiA+IDApIFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIFxuXHRcdFx0bGluZXNbaV0gPSBsaW5lc1tpXS5zdWJzdHIobWluKTtcblx0XG5cdHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn07XG5cbi8qKlxuICogQ2FsbGJhY2sgbWV0aG9kIGZvciBBcnJheS5zb3J0KCkgd2hpY2ggc29ydHMgbWF0Y2hlcyBieVxuICogaW5kZXggcG9zaXRpb24gYW5kIHRoZW4gYnkgbGVuZ3RoLlxuICogXG4gKiBAcGFyYW0ge01hdGNofSBtMVx0TGVmdCBvYmplY3QuXG4gKiBAcGFyYW0ge01hdGNofSBtMiAgICBSaWdodCBvYmplY3QuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBSZXR1cm5zIC0xLCAwIG9yIC0xIGFzIGEgY29tcGFyaXNvbiByZXN1bHQuXG4gKi9cbmZ1bmN0aW9uIG1hdGNoZXNTb3J0Q2FsbGJhY2sobTEsIG0yKVxue1xuXHQvLyBzb3J0IG1hdGNoZXMgYnkgaW5kZXggZmlyc3Rcblx0aWYobTEuaW5kZXggPCBtMi5pbmRleClcblx0XHRyZXR1cm4gLTE7XG5cdGVsc2UgaWYobTEuaW5kZXggPiBtMi5pbmRleClcblx0XHRyZXR1cm4gMTtcblx0ZWxzZVxuXHR7XG5cdFx0Ly8gaWYgaW5kZXggaXMgdGhlIHNhbWUsIHNvcnQgYnkgbGVuZ3RoXG5cdFx0aWYobTEubGVuZ3RoIDwgbTIubGVuZ3RoKVxuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdGVsc2UgaWYobTEubGVuZ3RoID4gbTIubGVuZ3RoKVxuXHRcdFx0cmV0dXJuIDE7XG5cdH1cblx0XG5cdHJldHVybiAwO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gb24gcHJvdmlkZWQgY29kZSBhbmQgcmV0dXJucyBhbGxcbiAqIG1hdGNoZXMgdGhhdCBhcmUgZm91bmQuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlICAgIENvZGUgdG8gZXhlY3V0ZSByZWd1bGFyIGV4cHJlc3Npb24gb24uXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXggICBSZWd1bGFyIGV4cHJlc3Npb24gaXRlbSBpbmZvIGZyb20gPGNvZGU+cmVnZXhMaXN0PC9jb2RlPiBjb2xsZWN0aW9uLlxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgUmV0dXJucyBhIGxpc3Qgb2YgTWF0Y2ggb2JqZWN0cy5cbiAqLyBcbmZ1bmN0aW9uIGdldE1hdGNoZXMoY29kZSwgcmVnZXhJbmZvKVxue1xuXHRmdW5jdGlvbiBkZWZhdWx0QWRkKG1hdGNoLCByZWdleEluZm8pXG5cdHtcblx0XHRyZXR1cm4gbWF0Y2hbMF07XG5cdH07XG5cdFxuXHR2YXIgaW5kZXggPSAwLFxuXHRcdG1hdGNoID0gbnVsbCxcblx0XHRtYXRjaGVzID0gW10sXG5cdFx0ZnVuYyA9IHJlZ2V4SW5mby5mdW5jID8gcmVnZXhJbmZvLmZ1bmMgOiBkZWZhdWx0QWRkXG5cdFx0O1xuXHRcblx0d2hpbGUoKG1hdGNoID0gcmVnZXhJbmZvLnJlZ2V4LmV4ZWMoY29kZSkpICE9IG51bGwpXG5cdHtcblx0XHR2YXIgcmVzdWx0TWF0Y2ggPSBmdW5jKG1hdGNoLCByZWdleEluZm8pO1xuXHRcdFxuXHRcdGlmICh0eXBlb2YocmVzdWx0TWF0Y2gpID09ICdzdHJpbmcnKVxuXHRcdFx0cmVzdWx0TWF0Y2ggPSBbbmV3IHNoLk1hdGNoKHJlc3VsdE1hdGNoLCBtYXRjaC5pbmRleCwgcmVnZXhJbmZvLmNzcyldO1xuXG5cdFx0bWF0Y2hlcyA9IG1hdGNoZXMuY29uY2F0KHJlc3VsdE1hdGNoKTtcblx0fVxuXHRcblx0cmV0dXJuIG1hdGNoZXM7XG59O1xuXG4vKipcbiAqIFR1cm5zIGFsbCBVUkxzIGluIHRoZSBjb2RlIGludG8gPGEvPiB0YWdzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgSW5wdXQgY29kZS5cbiAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBjb2RlIHdpdGggPC9hPiB0YWdzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzVXJscyhjb2RlKVxue1xuXHR2YXIgZ3QgPSAvKC4qKSgoJmd0O3wmbHQ7KS4qKS87XG5cdFxuXHRyZXR1cm4gY29kZS5yZXBsYWNlKHNoLnJlZ2V4TGliLnVybCwgZnVuY3Rpb24obSlcblx0e1xuXHRcdHZhciBzdWZmaXggPSAnJyxcblx0XHRcdG1hdGNoID0gbnVsbFxuXHRcdFx0O1xuXHRcdFxuXHRcdC8vIFdlIGluY2x1ZGUgJmx0OyBhbmQgJmd0OyBpbiB0aGUgVVJMIGZvciB0aGUgY29tbW9uIGNhc2VzIGxpa2UgPGh0dHA6Ly9nb29nbGUuY29tPlxuXHRcdC8vIFRoZSBwcm9ibGVtIGlzIHRoYXQgdGhleSBnZXQgdHJhbnNmb3JtZWQgaW50byAmbHQ7aHR0cDovL2dvb2dsZS5jb20mZ3Q7XG5cdFx0Ly8gV2hlcmUgYXMgJmd0OyBlYXNpbHkgbG9va3MgbGlrZSBwYXJ0IG9mIHRoZSBVUkwgc3RyaW5nLlxuXHRcblx0XHRpZiAobWF0Y2ggPSBndC5leGVjKG0pKVxuXHRcdHtcblx0XHRcdG0gPSBtYXRjaFsxXTtcblx0XHRcdHN1ZmZpeCA9IG1hdGNoWzJdO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gJzxhIGhyZWY9XCInICsgbSArICdcIj4nICsgbSArICc8L2E+JyArIHN1ZmZpeDtcblx0fSk7XG59O1xuXG4vKipcbiAqIEZpbmRzIGFsbCA8U0NSSVBUIFRZUEU9XCJzeW50YXhoaWdobGlnaHRlclwiIC8+IGVsZW1lbnRzcy5cbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFycmF5IG9mIGFsbCBmb3VuZCBTeW50YXhIaWdobGlnaHRlciB0YWdzLlxuICovXG5mdW5jdGlvbiBnZXRTeW50YXhIaWdobGlnaHRlclNjcmlwdFRhZ3MoKVxue1xuXHR2YXIgdGFncyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSxcblx0XHRyZXN1bHQgPSBbXVxuXHRcdDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGFncy5sZW5ndGg7IGkrKylcblx0XHRpZiAodGFnc1tpXS50eXBlID09ICdzeW50YXhoaWdobGlnaHRlcicpXG5cdFx0XHRyZXN1bHQucHVzaCh0YWdzW2ldKTtcblx0XHRcdFxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBTdHJpcHMgPCFbQ0RBVEFbXV0+IGZyb20gPFNDUklQVCAvPiBjb250ZW50IGJlY2F1c2UgaXQgc2hvdWxkIGJlIHVzZWRcbiAqIHRoZXJlIGluIG1vc3QgY2FzZXMgZm9yIFhIVE1MIGNvbXBsaWFuY2UuXG4gKiBAcGFyYW0ge1N0cmluZ30gb3JpZ2luYWxcdElucHV0IGNvZGUuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgY29kZSB3aXRob3V0IGxlYWRpbmcgPCFbQ0RBVEFbXV0+IHRhZ3MuXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQ0RhdGEob3JpZ2luYWwpXG57XG5cdHZhciBsZWZ0ID0gJzwhW0NEQVRBWycsXG5cdFx0cmlnaHQgPSAnXV0+Jyxcblx0XHQvLyBmb3Igc29tZSByZWFzb24gSUUgaW5zZXJ0cyBzb21lIGxlYWRpbmcgYmxhbmtzIGhlcmVcblx0XHRjb3B5ID0gdHJpbShvcmlnaW5hbCksXG5cdFx0Y2hhbmdlZCA9IGZhbHNlLFxuXHRcdGxlZnRMZW5ndGggPSBsZWZ0Lmxlbmd0aCxcblx0XHRyaWdodExlbmd0aCA9IHJpZ2h0Lmxlbmd0aFxuXHRcdDtcblx0XG5cdGlmIChjb3B5LmluZGV4T2YobGVmdCkgPT0gMClcblx0e1xuXHRcdGNvcHkgPSBjb3B5LnN1YnN0cmluZyhsZWZ0TGVuZ3RoKTtcblx0XHRjaGFuZ2VkID0gdHJ1ZTtcblx0fVxuXHRcblx0dmFyIGNvcHlMZW5ndGggPSBjb3B5Lmxlbmd0aDtcblx0XG5cdGlmIChjb3B5LmluZGV4T2YocmlnaHQpID09IGNvcHlMZW5ndGggLSByaWdodExlbmd0aClcblx0e1xuXHRcdGNvcHkgPSBjb3B5LnN1YnN0cmluZygwLCBjb3B5TGVuZ3RoIC0gcmlnaHRMZW5ndGgpO1xuXHRcdGNoYW5nZWQgPSB0cnVlO1xuXHR9XG5cdFxuXHRyZXR1cm4gY2hhbmdlZCA/IGNvcHkgOiBvcmlnaW5hbDtcbn07XG5cblxuLyoqXG4gKiBRdWljayBjb2RlIG1vdXNlIGRvdWJsZSBjbGljayBoYW5kbGVyLlxuICovXG5mdW5jdGlvbiBxdWlja0NvZGVIYW5kbGVyKGUpXG57XG5cdHZhciB0YXJnZXQgPSBlLnRhcmdldCxcblx0XHRoaWdobGlnaHRlckRpdiA9IGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgJy5zeW50YXhoaWdobGlnaHRlcicpLFxuXHRcdGNvbnRhaW5lciA9IGZpbmRQYXJlbnRFbGVtZW50KHRhcmdldCwgJy5jb250YWluZXInKSxcblx0XHR0ZXh0YXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyksXG5cdFx0aGlnaGxpZ2h0ZXJcblx0XHQ7XG5cblx0aWYgKCFjb250YWluZXIgfHwgIWhpZ2hsaWdodGVyRGl2IHx8IGZpbmRFbGVtZW50KGNvbnRhaW5lciwgJ3RleHRhcmVhJykpXG5cdFx0cmV0dXJuO1xuXG5cdGhpZ2hsaWdodGVyID0gZ2V0SGlnaGxpZ2h0ZXJCeUlkKGhpZ2hsaWdodGVyRGl2LmlkKTtcblx0XG5cdC8vIGFkZCBzb3VyY2UgY2xhc3MgbmFtZVxuXHRhZGRDbGFzcyhoaWdobGlnaHRlckRpdiwgJ3NvdXJjZScpO1xuXG5cdC8vIEhhdmUgdG8gZ28gb3ZlciBlYWNoIGxpbmUgYW5kIGdyYWIgaXQncyB0ZXh0LCBjYW4ndCBqdXN0IGRvIGl0IG9uIHRoZVxuXHQvLyBjb250YWluZXIgYmVjYXVzZSBGaXJlZm94IGxvc2VzIGFsbCBcXG4gd2hlcmUgYXMgV2Via2l0IGRvZXNuJ3QuXG5cdHZhciBsaW5lcyA9IGNvbnRhaW5lci5jaGlsZE5vZGVzLFxuXHRcdGNvZGUgPSBbXVxuXHRcdDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspXG5cdFx0Y29kZS5wdXNoKGxpbmVzW2ldLmlubmVyVGV4dCB8fCBsaW5lc1tpXS50ZXh0Q29udGVudCk7XG5cdFxuXHQvLyB1c2luZyBcXHIgaW5zdGVhZCBvZiBcXHIgb3IgXFxyXFxuIG1ha2VzIHRoaXMgd29yayBlcXVhbGx5IHdlbGwgb24gSUUsIEZGIGFuZCBXZWJraXRcblx0Y29kZSA9IGNvZGUuam9pbignXFxyJyk7XG5cbiAgICAvLyBGb3IgV2Via2l0IGJyb3dzZXJzLCByZXBsYWNlIG5ic3Agd2l0aCBhIGJyZWFraW5nIHNwYWNlXG4gICAgY29kZSA9IGNvZGUucmVwbGFjZSgvXFx1MDBhMC9nLCBcIiBcIik7XG5cdFxuXHQvLyBpbmplY3QgPHRleHRhcmVhLz4gdGFnXG5cdHRleHRhcmVhLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNvZGUpKTtcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRleHRhcmVhKTtcblx0XG5cdC8vIHByZXNlbGVjdCBhbGwgdGV4dFxuXHR0ZXh0YXJlYS5mb2N1cygpO1xuXHR0ZXh0YXJlYS5zZWxlY3QoKTtcblx0XG5cdC8vIHNldCB1cCBoYW5kbGVyIGZvciBsb3N0IGZvY3VzXG5cdGF0dGFjaEV2ZW50KHRleHRhcmVhLCAnYmx1cicsIGZ1bmN0aW9uKGUpXG5cdHtcblx0XHR0ZXh0YXJlYS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRleHRhcmVhKTtcblx0XHRyZW1vdmVDbGFzcyhoaWdobGlnaHRlckRpdiwgJ3NvdXJjZScpO1xuXHR9KTtcbn07XG5cbi8qKlxuICogTWF0Y2ggb2JqZWN0LlxuICovXG5zaC5NYXRjaCA9IGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY3NzKVxue1xuXHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdHRoaXMuaW5kZXggPSBpbmRleDtcblx0dGhpcy5sZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cdHRoaXMuY3NzID0gY3NzO1xuXHR0aGlzLmJydXNoTmFtZSA9IG51bGw7XG59O1xuXG5zaC5NYXRjaC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpXG57XG5cdHJldHVybiB0aGlzLnZhbHVlO1xufTtcblxuLyoqXG4gKiBTaW11bGF0ZXMgSFRNTCBjb2RlIHdpdGggYSBzY3JpcHRpbmcgbGFuZ3VhZ2UgZW1iZWRkZWQuXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzY3JpcHRCcnVzaE5hbWUgQnJ1c2ggbmFtZSBvZiB0aGUgc2NyaXB0aW5nIGxhbmd1YWdlLlxuICovXG5zaC5IdG1sU2NyaXB0ID0gZnVuY3Rpb24oc2NyaXB0QnJ1c2hOYW1lKVxue1xuXHR2YXIgYnJ1c2hDbGFzcyA9IGZpbmRCcnVzaChzY3JpcHRCcnVzaE5hbWUpLFxuXHRcdHNjcmlwdEJydXNoLFxuXHRcdHhtbEJydXNoID0gbmV3IHNoLmJydXNoZXMuWG1sKCksXG5cdFx0YnJhY2tldHNSZWdleCA9IG51bGwsXG5cdFx0cmVmID0gdGhpcyxcblx0XHRtZXRob2RzVG9FeHBvc2UgPSAnZ2V0RGl2IGdldEh0bWwgaW5pdCcuc3BsaXQoJyAnKVxuXHRcdDtcblxuXHRpZiAoYnJ1c2hDbGFzcyA9PSBudWxsKVxuXHRcdHJldHVybjtcblx0XG5cdHNjcmlwdEJydXNoID0gbmV3IGJydXNoQ2xhc3MoKTtcblx0XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBtZXRob2RzVG9FeHBvc2UubGVuZ3RoOyBpKyspXG5cdFx0Ly8gbWFrZSBhIGNsb3N1cmUgc28gd2UgZG9uJ3QgbG9zZSB0aGUgbmFtZSBhZnRlciBpIGNoYW5nZXNcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmFtZSA9IG1ldGhvZHNUb0V4cG9zZVtpXTtcblx0XHRcdFxuXHRcdFx0cmVmW25hbWVdID0gZnVuY3Rpb24oKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4geG1sQnJ1c2hbbmFtZV0uYXBwbHkoeG1sQnJ1c2gsIGFyZ3VtZW50cyk7XG5cdFx0XHR9O1xuXHRcdH0pKCk7XG5cdFxuXHRpZiAoc2NyaXB0QnJ1c2guaHRtbFNjcmlwdCA9PSBudWxsKVxuXHR7XG5cdFx0YWxlcnQoc2guY29uZmlnLnN0cmluZ3MuYnJ1c2hOb3RIdG1sU2NyaXB0ICsgc2NyaXB0QnJ1c2hOYW1lKTtcblx0XHRyZXR1cm47XG5cdH1cblx0XG5cdHhtbEJydXNoLnJlZ2V4TGlzdC5wdXNoKFxuXHRcdHsgcmVnZXg6IHNjcmlwdEJydXNoLmh0bWxTY3JpcHQuY29kZSwgZnVuYzogcHJvY2VzcyB9XG5cdCk7XG5cdFxuXHRmdW5jdGlvbiBvZmZzZXRNYXRjaGVzKG1hdGNoZXMsIG9mZnNldClcblx0e1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgbWF0Y2hlcy5sZW5ndGg7IGorKykgXG5cdFx0XHRtYXRjaGVzW2pdLmluZGV4ICs9IG9mZnNldDtcblx0fVxuXHRcblx0ZnVuY3Rpb24gcHJvY2VzcyhtYXRjaCwgaW5mbylcblx0e1xuXHRcdHZhciBjb2RlID0gbWF0Y2guY29kZSxcblx0XHRcdG1hdGNoZXMgPSBbXSxcblx0XHRcdHJlZ2V4TGlzdCA9IHNjcmlwdEJydXNoLnJlZ2V4TGlzdCxcblx0XHRcdG9mZnNldCA9IG1hdGNoLmluZGV4ICsgbWF0Y2gubGVmdC5sZW5ndGgsXG5cdFx0XHRodG1sU2NyaXB0ID0gc2NyaXB0QnJ1c2guaHRtbFNjcmlwdCxcblx0XHRcdHJlc3VsdFxuXHRcdFx0O1xuXG5cdFx0Ly8gYWRkIGFsbCBtYXRjaGVzIGZyb20gdGhlIGNvZGVcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2V4TGlzdC5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRyZXN1bHQgPSBnZXRNYXRjaGVzKGNvZGUsIHJlZ2V4TGlzdFtpXSk7XG5cdFx0XHRvZmZzZXRNYXRjaGVzKHJlc3VsdCwgb2Zmc2V0KTtcblx0XHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHQpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBhZGQgbGVmdCBzY3JpcHQgYnJhY2tldFxuXHRcdGlmIChodG1sU2NyaXB0LmxlZnQgIT0gbnVsbCAmJiBtYXRjaC5sZWZ0ICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0cmVzdWx0ID0gZ2V0TWF0Y2hlcyhtYXRjaC5sZWZ0LCBodG1sU2NyaXB0LmxlZnQpO1xuXHRcdFx0b2Zmc2V0TWF0Y2hlcyhyZXN1bHQsIG1hdGNoLmluZGV4KTtcblx0XHRcdG1hdGNoZXMgPSBtYXRjaGVzLmNvbmNhdChyZXN1bHQpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBhZGQgcmlnaHQgc2NyaXB0IGJyYWNrZXRcblx0XHRpZiAoaHRtbFNjcmlwdC5yaWdodCAhPSBudWxsICYmIG1hdGNoLnJpZ2h0ICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0cmVzdWx0ID0gZ2V0TWF0Y2hlcyhtYXRjaC5yaWdodCwgaHRtbFNjcmlwdC5yaWdodCk7XG5cdFx0XHRvZmZzZXRNYXRjaGVzKHJlc3VsdCwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sYXN0SW5kZXhPZihtYXRjaC5yaWdodCkpO1xuXHRcdFx0bWF0Y2hlcyA9IG1hdGNoZXMuY29uY2F0KHJlc3VsdCk7XG5cdFx0fVxuXHRcdFxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgbWF0Y2hlcy5sZW5ndGg7IGorKylcblx0XHRcdG1hdGNoZXNbal0uYnJ1c2hOYW1lID0gYnJ1c2hDbGFzcy5icnVzaE5hbWU7XG5cdFx0XHRcblx0XHRyZXR1cm4gbWF0Y2hlcztcblx0fVxufTtcblxuLyoqXG4gKiBNYWluIEhpZ2hsaXRoZXIgY2xhc3MuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuc2guSGlnaGxpZ2h0ZXIgPSBmdW5jdGlvbigpXG57XG5cdC8vIG5vdCBwdXR0aW5nIGFueSBjb2RlIGluIGhlcmUgYmVjYXVzZSBvZiB0aGUgcHJvdG90eXBlIGluaGVyaXRhbmNlXG59O1xuXG5zaC5IaWdobGlnaHRlci5wcm90b3R5cGUgPSB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHZhbHVlIG9mIHRoZSBwYXJhbWV0ZXIgcGFzc2VkIHRvIHRoZSBoaWdobGlnaHRlci5cblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcdFx0XHRcdE5hbWUgb2YgdGhlIHBhcmFtZXRlci5cblx0ICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRWYWx1ZVx0XHREZWZhdWx0IHZhbHVlLlxuXHQgKiBAcmV0dXJuIHtPYmplY3R9XHRcdFx0XHRcdFJldHVybnMgZm91bmQgdmFsdWUgb3IgZGVmYXVsdCB2YWx1ZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRnZXRQYXJhbTogZnVuY3Rpb24obmFtZSwgZGVmYXVsdFZhbHVlKVxuXHR7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyYW1zW25hbWVdO1xuXHRcdHJldHVybiB0b0Jvb2xlYW4ocmVzdWx0ID09IG51bGwgPyBkZWZhdWx0VmFsdWUgOiByZXN1bHQpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNob3J0Y3V0IHRvIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoKS5cblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcdFx0TmFtZSBvZiB0aGUgZWxlbWVudCB0byBjcmVhdGUgKERJViwgQSwgZXRjKS5cblx0ICogQHJldHVybiB7SFRNTEVsZW1lbnR9XHRSZXR1cm5zIG5ldyBIVE1MIGVsZW1lbnQuXG5cdCAqL1xuXHRjcmVhdGU6IGZ1bmN0aW9uKG5hbWUpXG5cdHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBBcHBsaWVzIGFsbCByZWd1bGFyIGV4cHJlc3Npb24gdG8gdGhlIGNvZGUgYW5kIHN0b3JlcyBhbGwgZm91bmRcblx0ICogbWF0Y2hlcyBpbiB0aGUgYHRoaXMubWF0Y2hlc2AgYXJyYXkuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHJlZ2V4TGlzdFx0XHRMaXN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFx0U291cmNlIGNvZGUuXG5cdCAqIEByZXR1cm4ge0FycmF5fVx0XHRcdFx0UmV0dXJucyBsaXN0IG9mIG1hdGNoZXMuXG5cdCAqL1xuXHRmaW5kTWF0Y2hlczogZnVuY3Rpb24ocmVnZXhMaXN0LCBjb2RlKVxuXHR7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdFxuXHRcdGlmIChyZWdleExpc3QgIT0gbnVsbClcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVnZXhMaXN0Lmxlbmd0aDsgaSsrKSBcblx0XHRcdFx0Ly8gQlVHOiBsZW5ndGggcmV0dXJucyBsZW4rMSBmb3IgYXJyYXkgaWYgbWV0aG9kcyBhZGRlZCB0byBwcm90b3R5cGUgY2hhaW4gKG9pc2luZ0BnbWFpbC5jb20pXG5cdFx0XHRcdGlmICh0eXBlb2YgKHJlZ2V4TGlzdFtpXSkgPT0gXCJvYmplY3RcIilcblx0XHRcdFx0XHRyZXN1bHQgPSByZXN1bHQuY29uY2F0KGdldE1hdGNoZXMoY29kZSwgcmVnZXhMaXN0W2ldKSk7XG5cdFx0XG5cdFx0Ly8gc29ydCBhbmQgcmVtb3ZlIG5lc3RlZCB0aGUgbWF0Y2hlc1xuXHRcdHJldHVybiB0aGlzLnJlbW92ZU5lc3RlZE1hdGNoZXMocmVzdWx0LnNvcnQobWF0Y2hlc1NvcnRDYWxsYmFjaykpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENoZWNrcyB0byBzZWUgaWYgYW55IG9mIHRoZSBtYXRjaGVzIGFyZSBpbnNpZGUgb2Ygb3RoZXIgbWF0Y2hlcy4gXG5cdCAqIFRoaXMgcHJvY2VzcyB3b3VsZCBnZXQgcmlkIG9mIGhpZ2hsaWd0ZWQgc3RyaW5ncyBpbnNpZGUgY29tbWVudHMsIFxuXHQgKiBrZXl3b3JkcyBpbnNpZGUgc3RyaW5ncyBhbmQgc28gb24uXG5cdCAqL1xuXHRyZW1vdmVOZXN0ZWRNYXRjaGVzOiBmdW5jdGlvbihtYXRjaGVzKVxuXHR7XG5cdFx0Ly8gT3B0aW1pemVkIGJ5IEpvc2UgUHJhZG8gKGh0dHA6Ly9qb3NlcHJhZG8uY29tKVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykgXG5cdFx0eyBcblx0XHRcdGlmIChtYXRjaGVzW2ldID09PSBudWxsKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0dmFyIGl0ZW1JID0gbWF0Y2hlc1tpXSxcblx0XHRcdFx0aXRlbUlFbmRQb3MgPSBpdGVtSS5pbmRleCArIGl0ZW1JLmxlbmd0aFxuXHRcdFx0XHQ7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGogPSBpICsgMTsgaiA8IG1hdGNoZXMubGVuZ3RoICYmIG1hdGNoZXNbaV0gIT09IG51bGw7IGorKykgXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBpdGVtSiA9IG1hdGNoZXNbal07XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoaXRlbUogPT09IG51bGwpIFxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRlbHNlIGlmIChpdGVtSi5pbmRleCA+IGl0ZW1JRW5kUG9zKSBcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZWxzZSBpZiAoaXRlbUouaW5kZXggPT0gaXRlbUkuaW5kZXggJiYgaXRlbUoubGVuZ3RoID4gaXRlbUkubGVuZ3RoKVxuXHRcdFx0XHRcdG1hdGNoZXNbaV0gPSBudWxsO1xuXHRcdFx0XHRlbHNlIGlmIChpdGVtSi5pbmRleCA+PSBpdGVtSS5pbmRleCAmJiBpdGVtSi5pbmRleCA8IGl0ZW1JRW5kUG9zKSBcblx0XHRcdFx0XHRtYXRjaGVzW2pdID0gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG1hdGNoZXM7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIGludGVnZXIgbGluZSBudW1iZXJzIHN0YXJ0aW5nIGZyb20gdGhlICdmaXJzdC1saW5lJyBwYXJhbS5cblx0ICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYXJyYXkgb2YgaW50ZWdlcnMuXG5cdCAqL1xuXHRmaWd1cmVPdXRMaW5lTnVtYmVyczogZnVuY3Rpb24oY29kZSlcblx0e1xuXHRcdHZhciBsaW5lcyA9IFtdLFxuXHRcdFx0Zmlyc3RMaW5lID0gcGFyc2VJbnQodGhpcy5nZXRQYXJhbSgnZmlyc3QtbGluZScpKVxuXHRcdFx0O1xuXHRcdFxuXHRcdGVhY2hMaW5lKGNvZGUsIGZ1bmN0aW9uKGxpbmUsIGluZGV4KVxuXHRcdHtcblx0XHRcdGxpbmVzLnB1c2goaW5kZXggKyBmaXJzdExpbmUpO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBsaW5lcztcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIGlmIHNwZWNpZmllZCBsaW5lIG51bWJlciBpcyBpbiB0aGUgaGlnaGxpZ2h0ZWQgbGlzdC5cblx0ICovXG5cdGlzTGluZUhpZ2hsaWdodGVkOiBmdW5jdGlvbihsaW5lTnVtYmVyKVxuXHR7XG5cdFx0dmFyIGxpc3QgPSB0aGlzLmdldFBhcmFtKCdoaWdobGlnaHQnLCBbXSk7XG5cdFx0XG5cdFx0aWYgKHR5cGVvZihsaXN0KSAhPSAnb2JqZWN0JyAmJiBsaXN0LnB1c2ggPT0gbnVsbCkgXG5cdFx0XHRsaXN0ID0gWyBsaXN0IF07XG5cdFx0XG5cdFx0cmV0dXJuIGluZGV4T2YobGlzdCwgbGluZU51bWJlci50b1N0cmluZygpKSAhPSAtMTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgSFRNTCBtYXJrdXAgZm9yIGEgc2luZ2xlIGxpbmUgb2YgY29kZSB3aGlsZSBkZXRlcm1pbmluZyBhbHRlcm5hdGluZyBsaW5lIHN0eWxlLlxuXHQgKiBAcGFyYW0ge0ludGVnZXJ9IGxpbmVOdW1iZXJcdExpbmUgbnVtYmVyLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZSBMaW5lXHRIVE1MIG1hcmt1cC5cblx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0UmV0dXJucyBIVE1MIG1hcmt1cC5cblx0ICovXG5cdGdldExpbmVIdG1sOiBmdW5jdGlvbihsaW5lSW5kZXgsIGxpbmVOdW1iZXIsIGNvZGUpXG5cdHtcblx0XHR2YXIgY2xhc3NlcyA9IFtcblx0XHRcdCdsaW5lJyxcblx0XHRcdCdudW1iZXInICsgbGluZU51bWJlcixcblx0XHRcdCdpbmRleCcgKyBsaW5lSW5kZXgsXG5cdFx0XHQnYWx0JyArIChsaW5lTnVtYmVyICUgMiA9PSAwID8gMSA6IDIpLnRvU3RyaW5nKClcblx0XHRdO1xuXHRcdFxuXHRcdGlmICh0aGlzLmlzTGluZUhpZ2hsaWdodGVkKGxpbmVOdW1iZXIpKVxuXHRcdCBcdGNsYXNzZXMucHVzaCgnaGlnaGxpZ2h0ZWQnKTtcblx0XHRcblx0XHRpZiAobGluZU51bWJlciA9PSAwKVxuXHRcdFx0Y2xhc3Nlcy5wdXNoKCdicmVhaycpO1xuXHRcdFx0XG5cdFx0cmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzZXMuam9pbignICcpICsgJ1wiPicgKyBjb2RlICsgJzwvZGl2Pic7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogR2VuZXJhdGVzIEhUTUwgbWFya3VwIGZvciBsaW5lIG51bWJlciBjb2x1bW4uXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFx0Q29tcGxldGUgY29kZSBIVE1MIG1hcmt1cC5cblx0ICogQHBhcmFtIHtBcnJheX0gbGluZU51bWJlcnNcdENhbGN1bGF0ZWQgbGluZSBudW1iZXJzLlxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XHRcdFx0XHRSZXR1cm5zIEhUTUwgbWFya3VwLlxuXHQgKi9cblx0Z2V0TGluZU51bWJlcnNIdG1sOiBmdW5jdGlvbihjb2RlLCBsaW5lTnVtYmVycylcblx0e1xuXHRcdHZhciBodG1sID0gJycsXG5cdFx0XHRjb3VudCA9IHNwbGl0TGluZXMoY29kZSkubGVuZ3RoLFxuXHRcdFx0Zmlyc3RMaW5lID0gcGFyc2VJbnQodGhpcy5nZXRQYXJhbSgnZmlyc3QtbGluZScpKSxcblx0XHRcdHBhZCA9IHRoaXMuZ2V0UGFyYW0oJ3BhZC1saW5lLW51bWJlcnMnKVxuXHRcdFx0O1xuXHRcdFxuXHRcdGlmIChwYWQgPT0gdHJ1ZSlcblx0XHRcdHBhZCA9IChmaXJzdExpbmUgKyBjb3VudCAtIDEpLnRvU3RyaW5nKCkubGVuZ3RoO1xuXHRcdGVsc2UgaWYgKGlzTmFOKHBhZCkgPT0gdHJ1ZSlcblx0XHRcdHBhZCA9IDA7XG5cdFx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGxpbmVOdW1iZXIgPSBsaW5lTnVtYmVycyA/IGxpbmVOdW1iZXJzW2ldIDogZmlyc3RMaW5lICsgaSxcblx0XHRcdFx0Y29kZSA9IGxpbmVOdW1iZXIgPT0gMCA/IHNoLmNvbmZpZy5zcGFjZSA6IHBhZE51bWJlcihsaW5lTnVtYmVyLCBwYWQpXG5cdFx0XHRcdDtcblx0XHRcdFx0XG5cdFx0XHRodG1sICs9IHRoaXMuZ2V0TGluZUh0bWwoaSwgbGluZU51bWJlciwgY29kZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNwbGl0cyBibG9jayBvZiB0ZXh0IGludG8gaW5kaXZpZHVhbCBESVYgbGluZXMuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXHRcdFx0Q29kZSB0byBoaWdobGlnaHQuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGxpbmVOdW1iZXJzXHRDYWxjdWxhdGVkIGxpbmUgbnVtYmVycy5cblx0ICogQHJldHVybiB7U3RyaW5nfVx0XHRcdFx0UmV0dXJucyBoaWdobGlnaHRlZCBjb2RlIGluIEhUTUwgZm9ybS5cblx0ICovXG5cdGdldENvZGVMaW5lc0h0bWw6IGZ1bmN0aW9uKGh0bWwsIGxpbmVOdW1iZXJzKVxuXHR7XG5cdFx0aHRtbCA9IHRyaW0oaHRtbCk7XG5cdFx0XG5cdFx0dmFyIGxpbmVzID0gc3BsaXRMaW5lcyhodG1sKSxcblx0XHRcdHBhZExlbmd0aCA9IHRoaXMuZ2V0UGFyYW0oJ3BhZC1saW5lLW51bWJlcnMnKSxcblx0XHRcdGZpcnN0TGluZSA9IHBhcnNlSW50KHRoaXMuZ2V0UGFyYW0oJ2ZpcnN0LWxpbmUnKSksXG5cdFx0XHRodG1sID0gJycsXG5cdFx0XHRicnVzaE5hbWUgPSB0aGlzLmdldFBhcmFtKCdicnVzaCcpXG5cdFx0XHQ7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdHZhciBsaW5lID0gbGluZXNbaV0sXG5cdFx0XHRcdGluZGVudCA9IC9eKCZuYnNwO3xcXHMpKy8uZXhlYyhsaW5lKSxcblx0XHRcdFx0c3BhY2VzID0gbnVsbCxcblx0XHRcdFx0bGluZU51bWJlciA9IGxpbmVOdW1iZXJzID8gbGluZU51bWJlcnNbaV0gOiBmaXJzdExpbmUgKyBpO1xuXHRcdFx0XHQ7XG5cblx0XHRcdGlmIChpbmRlbnQgIT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0c3BhY2VzID0gaW5kZW50WzBdLnRvU3RyaW5nKCk7XG5cdFx0XHRcdGxpbmUgPSBsaW5lLnN1YnN0cihzcGFjZXMubGVuZ3RoKTtcblx0XHRcdFx0c3BhY2VzID0gc3BhY2VzLnJlcGxhY2UoJyAnLCBzaC5jb25maWcuc3BhY2UpO1xuXHRcdFx0fVxuXG5cdFx0XHRsaW5lID0gdHJpbShsaW5lKTtcblx0XHRcdFxuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09IDApXG5cdFx0XHRcdGxpbmUgPSBzaC5jb25maWcuc3BhY2U7XG5cdFx0XHRcblx0XHRcdGh0bWwgKz0gdGhpcy5nZXRMaW5lSHRtbChcblx0XHRcdFx0aSxcblx0XHRcdFx0bGluZU51bWJlciwgXG5cdFx0XHRcdChzcGFjZXMgIT0gbnVsbCA/ICc8Y29kZSBjbGFzcz1cIicgKyBicnVzaE5hbWUgKyAnIHNwYWNlc1wiPicgKyBzcGFjZXMgKyAnPC9jb2RlPicgOiAnJykgKyBsaW5lXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIEhUTUwgZm9yIHRoZSB0YWJsZSB0aXRsZSBvciBlbXB0eSBzdHJpbmcgaWYgdGl0bGUgaXMgbnVsbC5cblx0ICovXG5cdGdldFRpdGxlSHRtbDogZnVuY3Rpb24odGl0bGUpXG5cdHtcblx0XHRyZXR1cm4gdGl0bGUgPyAnPGNhcHRpb24+JyArIHRpdGxlICsgJzwvY2FwdGlvbj4nIDogJyc7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogRmluZHMgYWxsIG1hdGNoZXMgaW4gdGhlIHNvdXJjZSBjb2RlLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gY29kZVx0XHRTb3VyY2UgY29kZSB0byBwcm9jZXNzIG1hdGNoZXMgaW4uXG5cdCAqIEBwYXJhbSB7QXJyYXl9IG1hdGNoZXNcdERpc2NvdmVyZWQgcmVnZXggbWF0Y2hlcy5cblx0ICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIGZvcm1hdHRlZCBIVE1MIHdpdGggcHJvY2Vzc2VkIG1hdGhlcy5cblx0ICovXG5cdGdldE1hdGNoZXNIdG1sOiBmdW5jdGlvbihjb2RlLCBtYXRjaGVzKVxuXHR7XG5cdFx0dmFyIHBvcyA9IDAsIFxuXHRcdFx0cmVzdWx0ID0gJycsXG5cdFx0XHRicnVzaE5hbWUgPSB0aGlzLmdldFBhcmFtKCdicnVzaCcsICcnKVxuXHRcdFx0O1xuXHRcdFxuXHRcdGZ1bmN0aW9uIGdldEJydXNoTmFtZUNzcyhtYXRjaClcblx0XHR7XG5cdFx0XHR2YXIgcmVzdWx0ID0gbWF0Y2ggPyAobWF0Y2guYnJ1c2hOYW1lIHx8IGJydXNoTmFtZSkgOiBicnVzaE5hbWU7XG5cdFx0XHRyZXR1cm4gcmVzdWx0ID8gcmVzdWx0ICsgJyAnIDogJyc7XG5cdFx0fTtcblx0XHRcblx0XHQvLyBGaW5hbGx5LCBnbyB0aHJvdWdoIHRoZSBmaW5hbCBsaXN0IG9mIG1hdGNoZXMgYW5kIHB1bGwgdGhlIGFsbFxuXHRcdC8vIHRvZ2V0aGVyIGFkZGluZyBldmVyeXRoaW5nIGluIGJldHdlZW4gdGhhdCBpc24ndCBhIG1hdGNoLlxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykgXG5cdFx0e1xuXHRcdFx0dmFyIG1hdGNoID0gbWF0Y2hlc1tpXSxcblx0XHRcdFx0bWF0Y2hCcnVzaE5hbWVcblx0XHRcdFx0O1xuXHRcdFx0XG5cdFx0XHRpZiAobWF0Y2ggPT09IG51bGwgfHwgbWF0Y2gubGVuZ3RoID09PSAwKSBcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdG1hdGNoQnJ1c2hOYW1lID0gZ2V0QnJ1c2hOYW1lQ3NzKG1hdGNoKTtcblx0XHRcdFxuXHRcdFx0cmVzdWx0ICs9IHdyYXBMaW5lc1dpdGhDb2RlKGNvZGUuc3Vic3RyKHBvcywgbWF0Y2guaW5kZXggLSBwb3MpLCBtYXRjaEJydXNoTmFtZSArICdwbGFpbicpXG5cdFx0XHRcdFx0KyB3cmFwTGluZXNXaXRoQ29kZShtYXRjaC52YWx1ZSwgbWF0Y2hCcnVzaE5hbWUgKyBtYXRjaC5jc3MpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRwb3MgPSBtYXRjaC5pbmRleCArIG1hdGNoLmxlbmd0aCArIChtYXRjaC5vZmZzZXQgfHwgMCk7XG5cdFx0fVxuXG5cdFx0Ly8gZG9uJ3QgZm9yZ2V0IHRvIGFkZCB3aGF0ZXZlcidzIHJlbWFpbmluZyBpbiB0aGUgc3RyaW5nXG5cdFx0cmVzdWx0ICs9IHdyYXBMaW5lc1dpdGhDb2RlKGNvZGUuc3Vic3RyKHBvcyksIGdldEJydXNoTmFtZUNzcygpICsgJ3BsYWluJyk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEdlbmVyYXRlcyBIVE1MIG1hcmt1cCBmb3IgdGhlIHdob2xlIHN5bnRheCBoaWdobGlnaHRlci5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNvZGUgU291cmNlIGNvZGUuXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyBIVE1MIG1hcmt1cC5cblx0ICovXG5cdGdldEh0bWw6IGZ1bmN0aW9uKGNvZGUpXG5cdHtcblx0XHR2YXIgaHRtbCA9ICcnLFxuXHRcdFx0Y2xhc3NlcyA9IFsgJ3N5bnRheGhpZ2hsaWdodGVyJyBdLFxuXHRcdFx0dGFiU2l6ZSxcblx0XHRcdG1hdGNoZXMsXG5cdFx0XHRsaW5lTnVtYmVyc1xuXHRcdFx0O1xuXHRcdFxuXHRcdC8vIHByb2Nlc3MgbGlnaHQgbW9kZVxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdsaWdodCcpID09IHRydWUpXG5cdFx0XHR0aGlzLnBhcmFtcy50b29sYmFyID0gdGhpcy5wYXJhbXMuZ3V0dGVyID0gZmFsc2U7XG5cblx0XHRjbGFzc05hbWUgPSAnc3ludGF4aGlnaGxpZ2h0ZXInO1xuXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ2NvbGxhcHNlJykgPT0gdHJ1ZSlcblx0XHRcdGNsYXNzZXMucHVzaCgnY29sbGFwc2VkJyk7XG5cdFx0XG5cdFx0aWYgKChndXR0ZXIgPSB0aGlzLmdldFBhcmFtKCdndXR0ZXInKSkgPT0gZmFsc2UpXG5cdFx0XHRjbGFzc2VzLnB1c2goJ25vZ3V0dGVyJyk7XG5cblx0XHQvLyBhZGQgY3VzdG9tIHVzZXIgc3R5bGUgbmFtZVxuXHRcdGNsYXNzZXMucHVzaCh0aGlzLmdldFBhcmFtKCdjbGFzcy1uYW1lJykpO1xuXG5cdFx0Ly8gYWRkIGJydXNoIGFsaWFzIHRvIHRoZSBjbGFzcyBuYW1lIGZvciBjdXN0b20gQ1NTXG5cdFx0Y2xhc3Nlcy5wdXNoKHRoaXMuZ2V0UGFyYW0oJ2JydXNoJykpO1xuXG5cdFx0Y29kZSA9IHRyaW1GaXJzdEFuZExhc3RMaW5lcyhjb2RlKVxuXHRcdFx0LnJlcGxhY2UoL1xcci9nLCAnICcpIC8vIElFIGxldHMgdGhlc2UgYnVnZ2VycyB0aHJvdWdoXG5cdFx0XHQ7XG5cblx0XHR0YWJTaXplID0gdGhpcy5nZXRQYXJhbSgndGFiLXNpemUnKTtcblxuXHRcdC8vIHJlcGxhY2UgdGFicyB3aXRoIHNwYWNlc1xuXHRcdGNvZGUgPSB0aGlzLmdldFBhcmFtKCdzbWFydC10YWJzJykgPT0gdHJ1ZVxuXHRcdFx0PyBwcm9jZXNzU21hcnRUYWJzKGNvZGUsIHRhYlNpemUpXG5cdFx0XHQ6IHByb2Nlc3NUYWJzKGNvZGUsIHRhYlNpemUpXG5cdFx0XHQ7XG5cblx0XHQvLyB1bmluZGVudCBjb2RlIGJ5IHRoZSBjb21tb24gaW5kZW50YXRpb25cblx0XHRpZiAodGhpcy5nZXRQYXJhbSgndW5pbmRlbnQnKSlcblx0XHRcdGNvZGUgPSB1bmluZGVudChjb2RlKTtcblxuXHRcdGlmIChndXR0ZXIpXG5cdFx0XHRsaW5lTnVtYmVycyA9IHRoaXMuZmlndXJlT3V0TGluZU51bWJlcnMoY29kZSk7XG5cdFx0XG5cdFx0Ly8gZmluZCBtYXRjaGVzIGluIHRoZSBjb2RlIHVzaW5nIGJydXNoZXMgcmVnZXggbGlzdFxuXHRcdG1hdGNoZXMgPSB0aGlzLmZpbmRNYXRjaGVzKHRoaXMucmVnZXhMaXN0LCBjb2RlKTtcblx0XHQvLyBwcm9jZXNzZXMgZm91bmQgbWF0Y2hlcyBpbnRvIHRoZSBodG1sXG5cdFx0aHRtbCA9IHRoaXMuZ2V0TWF0Y2hlc0h0bWwoY29kZSwgbWF0Y2hlcyk7XG5cdFx0Ly8gZmluYWxseSwgc3BsaXQgYWxsIGxpbmVzIHNvIHRoYXQgdGhleSB3cmFwIHdlbGxcblx0XHRodG1sID0gdGhpcy5nZXRDb2RlTGluZXNIdG1sKGh0bWwsIGxpbmVOdW1iZXJzKTtcblxuXHRcdC8vIGZpbmFsbHksIHByb2Nlc3MgdGhlIGxpbmtzXG5cdFx0aWYgKHRoaXMuZ2V0UGFyYW0oJ2F1dG8tbGlua3MnKSlcblx0XHRcdGh0bWwgPSBwcm9jZXNzVXJscyhodG1sKTtcblx0XHRcblx0XHRpZiAodHlwZW9mKG5hdmlnYXRvcikgIT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9NU0lFLykpXG5cdFx0XHRjbGFzc2VzLnB1c2goJ2llJyk7XG5cdFx0XG5cdFx0aHRtbCA9IFxuXHRcdFx0JzxkaXYgaWQ9XCInICsgZ2V0SGlnaGxpZ2h0ZXJJZCh0aGlzLmlkKSArICdcIiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIj4nXG5cdFx0XHRcdCsgKHRoaXMuZ2V0UGFyYW0oJ3Rvb2xiYXInKSA/IHNoLnRvb2xiYXIuZ2V0SHRtbCh0aGlzKSA6ICcnKVxuXHRcdFx0XHQrICc8dGFibGUgYm9yZGVyPVwiMFwiIGNlbGxwYWRkaW5nPVwiMFwiIGNlbGxzcGFjaW5nPVwiMFwiPidcblx0XHRcdFx0XHQrIHRoaXMuZ2V0VGl0bGVIdG1sKHRoaXMuZ2V0UGFyYW0oJ3RpdGxlJykpXG5cdFx0XHRcdFx0KyAnPHRib2R5Pidcblx0XHRcdFx0XHRcdCsgJzx0cj4nXG5cdFx0XHRcdFx0XHRcdCsgKGd1dHRlciA/ICc8dGQgY2xhc3M9XCJndXR0ZXJcIj4nICsgdGhpcy5nZXRMaW5lTnVtYmVyc0h0bWwoY29kZSkgKyAnPC90ZD4nIDogJycpXG5cdFx0XHRcdFx0XHRcdCsgJzx0ZCBjbGFzcz1cImNvZGVcIj4nXG5cdFx0XHRcdFx0XHRcdFx0KyAnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPidcblx0XHRcdFx0XHRcdFx0XHRcdCsgaHRtbFxuXHRcdFx0XHRcdFx0XHRcdCsgJzwvZGl2Pidcblx0XHRcdFx0XHRcdFx0KyAnPC90ZD4nXG5cdFx0XHRcdFx0XHQrICc8L3RyPidcblx0XHRcdFx0XHQrICc8L3Rib2R5Pidcblx0XHRcdFx0KyAnPC90YWJsZT4nXG5cdFx0XHQrICc8L2Rpdj4nXG5cdFx0XHQ7XG5cdFx0XHRcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBIaWdobGlnaHRzIHRoZSBjb2RlIGFuZCByZXR1cm5zIGNvbXBsZXRlIEhUTUwuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlICAgICBDb2RlIHRvIGhpZ2hsaWdodC5cblx0ICogQHJldHVybiB7RWxlbWVudH0gICAgICAgIFJldHVybnMgY29udGFpbmVyIERJViBlbGVtZW50IHdpdGggYWxsIG1hcmt1cC5cblx0ICovXG5cdGdldERpdjogZnVuY3Rpb24oY29kZSlcblx0e1xuXHRcdGlmIChjb2RlID09PSBudWxsKSBcblx0XHRcdGNvZGUgPSAnJztcblx0XHRcblx0XHR0aGlzLmNvZGUgPSBjb2RlO1xuXG5cdFx0dmFyIGRpdiA9IHRoaXMuY3JlYXRlKCdkaXYnKTtcblxuXHRcdC8vIGNyZWF0ZSBtYWluIEhUTUxcblx0XHRkaXYuaW5uZXJIVE1MID0gdGhpcy5nZXRIdG1sKGNvZGUpO1xuXHRcdFxuXHRcdC8vIHNldCB1cCBjbGljayBoYW5kbGVyc1xuXHRcdGlmICh0aGlzLmdldFBhcmFtKCd0b29sYmFyJykpXG5cdFx0XHRhdHRhY2hFdmVudChmaW5kRWxlbWVudChkaXYsICcudG9vbGJhcicpLCAnY2xpY2snLCBzaC50b29sYmFyLmhhbmRsZXIpO1xuXHRcdFxuXHRcdGlmICh0aGlzLmdldFBhcmFtKCdxdWljay1jb2RlJykpXG5cdFx0XHRhdHRhY2hFdmVudChmaW5kRWxlbWVudChkaXYsICcuY29kZScpLCAnZGJsY2xpY2snLCBxdWlja0NvZGVIYW5kbGVyKTtcblx0XHRcblx0XHRyZXR1cm4gZGl2O1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBoaWdobGlnaHRlci9icnVzaC5cblx0ICpcblx0ICogQ29uc3RydWN0b3IgaXNuJ3QgdXNlZCBmb3IgaW5pdGlhbGl6YXRpb24gc28gdGhhdCBub3RoaW5nIGV4ZWN1dGVzIGR1cmluZyBuZWNlc3Nhcnlcblx0ICogYG5ldyBTeW50YXhIaWdobGlnaHRlci5IaWdobGlnaHRlcigpYCBjYWxsIHdoZW4gc2V0dGluZyB1cCBicnVzaCBpbmhlcml0ZW5jZS5cblx0ICpcblx0ICogQHBhcmFtIHtIYXNofSBwYXJhbXMgSGlnaGxpZ2h0ZXIgcGFyYW1ldGVycy5cblx0ICovXG5cdGluaXQ6IGZ1bmN0aW9uKHBhcmFtcylcblx0e1xuXHRcdHRoaXMuaWQgPSBndWlkKCk7XG5cdFx0XG5cdFx0Ly8gcmVnaXN0ZXIgdGhpcyBpbnN0YW5jZSBpbiB0aGUgaGlnaGxpZ2h0ZXJzIGxpc3Rcblx0XHRzdG9yZUhpZ2hsaWdodGVyKHRoaXMpO1xuXHRcdFxuXHRcdC8vIGxvY2FsIHBhcmFtcyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBkZWZhdWx0c1xuXHRcdHRoaXMucGFyYW1zID0gbWVyZ2Uoc2guZGVmYXVsdHMsIHBhcmFtcyB8fCB7fSlcblx0XHRcblx0XHQvLyBwcm9jZXNzIGxpZ2h0IG1vZGVcblx0XHRpZiAodGhpcy5nZXRQYXJhbSgnbGlnaHQnKSA9PSB0cnVlKVxuXHRcdFx0dGhpcy5wYXJhbXMudG9vbGJhciA9IHRoaXMucGFyYW1zLmd1dHRlciA9IGZhbHNlO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENvbnZlcnRzIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGtleXdvcmRzIGludG8gYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyICAgIFNwYWNlIHNlcGFyYXRlZCBrZXl3b3Jkcy5cblx0ICogQHJldHVybiB7U3RyaW5nfSAgICAgICBSZXR1cm5zIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmcuXG5cdCAqL1xuXHRnZXRLZXl3b3JkczogZnVuY3Rpb24oc3RyKVxuXHR7XG5cdFx0c3RyID0gc3RyXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnfCcpXG5cdFx0XHQ7XG5cdFx0XG5cdFx0cmV0dXJuICdcXFxcYig/OicgKyBzdHIgKyAnKVxcXFxiJztcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBNYWtlcyBhIGJydXNoIGNvbXBhdGlibGUgd2l0aCB0aGUgYGh0bWwtc2NyaXB0YCBmdW5jdGlvbmFsaXR5LlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcmVnZXhHcm91cCBPYmplY3QgY29udGFpbmluZyBgbGVmdGAgYW5kIGByaWdodGAgcmVndWxhciBleHByZXNzaW9ucy5cblx0ICovXG5cdGZvckh0bWxTY3JpcHQ6IGZ1bmN0aW9uKHJlZ2V4R3JvdXApXG5cdHtcblx0XHR2YXIgcmVnZXggPSB7ICdlbmQnIDogcmVnZXhHcm91cC5yaWdodC5zb3VyY2UgfTtcblxuXHRcdGlmKHJlZ2V4R3JvdXAuZW9mKVxuXHRcdFx0cmVnZXguZW5kID0gXCIoPzooPzpcIiArIHJlZ2V4LmVuZCArIFwiKXwkKVwiO1xuXHRcdFxuXHRcdHRoaXMuaHRtbFNjcmlwdCA9IHtcblx0XHRcdGxlZnQgOiB7IHJlZ2V4OiByZWdleEdyb3VwLmxlZnQsIGNzczogJ3NjcmlwdCcgfSxcblx0XHRcdHJpZ2h0IDogeyByZWdleDogcmVnZXhHcm91cC5yaWdodCwgY3NzOiAnc2NyaXB0JyB9LFxuXHRcdFx0Y29kZSA6IG5ldyBYUmVnRXhwKFxuXHRcdFx0XHRcIig/PGxlZnQ+XCIgKyByZWdleEdyb3VwLmxlZnQuc291cmNlICsgXCIpXCIgK1xuXHRcdFx0XHRcIig/PGNvZGU+Lio/KVwiICtcblx0XHRcdFx0XCIoPzxyaWdodD5cIiArIHJlZ2V4LmVuZCArIFwiKVwiLFxuXHRcdFx0XHRcInNnaVwiXG5cdFx0XHRcdClcblx0XHR9O1xuXHR9XG59OyAvLyBlbmQgb2YgSGlnaGxpZ2h0ZXJcblxucmV0dXJuIHNoO1xufSgpOyAvLyBlbmQgb2YgYW5vbnltb3VzIGZ1bmN0aW9uXG5cbi8vIENvbW1vbkpTXG50eXBlb2YoZXhwb3J0cykgIT0gJ3VuZGVmaW5lZCcgPyBleHBvcnRzLlN5bnRheEhpZ2hsaWdodGVyID0gU3ludGF4SGlnaGxpZ2h0ZXIgOiBudWxsO1xuIiwidmFyIGZzICAgICAgICAgPSAgcmVxdWlyZSgnZnMnKVxuICAsIHBhdGggICAgICAgPSAgcmVxdWlyZSgncGF0aCcpXG4gICwgdXRpbCAgICAgICA9ICByZXF1aXJlKCd1dGlsJylcbiAgLCBpbmxpbmUgICAgID0gIHJlcXVpcmUoJy4vaW5saW5lLXNjcmlwdHMnKVxuICAsIHNjcmlwdHNEaXIgPSAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vbGliL3NjcmlwdHMnKVxuICAsIHN0eWxlc0RpciAgPSAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vbGliL3N0eWxlcycpXG4gICwgc3R5bGVzXG4gICwgbGFuZ01hcCAgICA9ICB7IH1cbiAgLCBzaW1pbGFyTWFwID0gIHsgfVxuICAsIHNpbWlsYXJMYW5ncyA9ICB7XG4gICAgICAgICdqcycgICAgIDogIFsgJ2pzb24nIF1cbiAgICAgICwgJ3B5dGhvbicgOiAgWydjb2ZmZWUnLCAnZ3Jvb3Z5JywgJ2hzJywgJ2hhc2tlbGwnIF1cbiAgICB9XG4gIDtcblxuXG4vLyBTZWxmIGludm9raW5nIGZ1bmN0aW9ucyBibG9jayB1bnRpbCB0aGV5IGFyZSBmaW5pc2hlZCBpbiBvcmRlciB0byBlbnN1cmUgdGhhdCBcbi8vIHRoaXMgbW9kdWxlIGlzIHByb3Blcmx5IGluaXRpYWxpemVkIGJlZm9yZSBpdCBpcyByZXR1cm5lZC5cbi8vIFNpbmNlIHRoaXMgb25seSBoYXBwZW5zIG9uY2UgKHdoZW4gbW9kdWxlIGlzIHJlcXVpcmVkKSwgaXQgc2hvdWxkbid0IGJlIGEgcHJvYmxlbS5cbihmdW5jdGlvbiBtYXBCcnVzaGVzKCkge1xuICBmcy5yZWFkZGlyU3luYyhzY3JpcHRzRGlyKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgaWYgKCFmaWxlLm1hdGNoKC9zaEJydXNoXFx3K1xcLmpzLykpIHJldHVybjtcbiAgICBcbiAgICB2YXIgbGFuZ3VhZ2UgPSByZXF1aXJlKHBhdGguam9pbihzY3JpcHRzRGlyLCBmaWxlKSk7XG4gICAgbGFuZ3VhZ2UuQnJ1c2guYWxpYXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChhbGlhcykge1xuICAgICAgbGFuZ01hcFthbGlhcy50b0xvd2VyQ2FzZSgpXSA9IGxhbmd1YWdlO1xuICAgIH0pO1xuICB9KTsgIFxuXG4gIC8vIEFkZCBzb21lIGtub3duIGFsaWFzZXNcbiAgbGFuZ01hcFsnY3MnXSA9IGxhbmdNYXBbJ2MjJ107XG5cbiAgLy8gQWRkIHNpbWlsYXIgYnJ1c2hlcyB0byBzaW1pbGFyIG1hcFxuICBPYmplY3Qua2V5cyhzaW1pbGFyTGFuZ3MpLmZvckVhY2goZnVuY3Rpb24gKGxhbmcpIHtcbiAgICBzaW1pbGFyTGFuZ3NbbGFuZ10uZm9yRWFjaChmdW5jdGlvbiAoc2ltaWxhcikge1xuICAgICAgc2ltaWxhck1hcFtzaW1pbGFyXSA9IGxhbmdNYXBbbGFuZ107XG4gICAgfSk7XG4gIH0pO1xufSkgKCk7XG5cbihmdW5jdGlvbiBjb2xsZWN0U3R5bGVzICgpIHtcbiAgc3R5bGVzID0gZnMucmVhZGRpclN5bmMoc3R5bGVzRGlyKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gKGZpbGVOYW1lKSB7XG4gICAgICByZXR1cm4gZmlsZU5hbWUubWF0Y2goL3NoQ29yZS4rXFwuY3NzLyk7XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uIChmaWxlTmFtZSkge1xuICAgICAgdmFyIG5vcm1hbGl6ZWRGaWxlTmFtZSA9ICBmaWxlTmFtZS5yZXBsYWNlKC9zaENvcmUvLCAnJylcbiAgICAgICAgLCBleHRMZW5ndGggICAgICAgICAgPSAgcGF0aC5leHRuYW1lKG5vcm1hbGl6ZWRGaWxlTmFtZSkubGVuZ3RoXG4gICAgICAgICwgbmFtZUxlbmd0aCAgICAgICAgID0gIG5vcm1hbGl6ZWRGaWxlTmFtZS5sZW5ndGggLSBleHRMZW5ndGhcbiAgICAgICAgLCBzdHlsZU5hbWUgICAgICAgICAgPSAgbm9ybWFsaXplZEZpbGVOYW1lLnN1YnN0cigwLCBuYW1lTGVuZ3RoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICwgZnVsbEZpbGVQYXRoICAgICAgID0gIHBhdGguam9pbihzdHlsZXNEaXIsIGZpbGVOYW1lKVxuICAgICAgICA7XG5cbiAgICAgIHJldHVybiB7IG5hbWU6IHN0eWxlTmFtZSwgc291cmNlUGF0aDogZnVsbEZpbGVQYXRoIH07XG4gICAgICBcbiAgICB9KTtcbn0pICgpO1xuXG5mdW5jdGlvbiBnZXRMYW5ndWFnZShhbGlhcywgc3RyaWN0KSB7XG4gIC8vIGFjY2VwdCAqLmV4dCwgLmV4dCBhbmQgZXh0XG4gIHZhciBub3JtYWxpemVkQWxpYXMgPSBhbGlhcy5yZXBsYWNlKC9eXFwqLywnJykucmVwbGFjZSgvXlxcLi8sJycpO1xuXG4gIHZhciBtYXRjaCA9IGxhbmdNYXBbbm9ybWFsaXplZEFsaWFzXSB8fCAoIXN0cmljdCA/IHNpbWlsYXJNYXBbbm9ybWFsaXplZEFsaWFzXSA6IHZvaWQgMCk7XG4gIFxuICAvLyBOZWVkIHRvIHJlbWVtYmVyIGlmIHVzZXIgaXMgaGlnaGxpZ2h0aW5nIGh0bWwgb3IgeGh0bWwgZm9yIGluc3RhbmNlIGZvciB1c2UgaW4gaGlnaGxpZ2h0XG4gIGlmIChtYXRjaCkgbWF0Y2guc3BlY2lmaWVkQWxpYXMgPSBub3JtYWxpemVkQWxpYXM7XG5cbiAgcmV0dXJuIG1hdGNoO1xufVxuXG4vLyBvcHRpb25zOiBodHRwOi8vYWxleGdvcmJhdGNoZXYuY29tL1N5bnRheEhpZ2hsaWdodGVyL21hbnVhbC9jb25maWd1cmF0aW9uL1xuZnVuY3Rpb24gaGlnaGxpZ2h0KGNvZGUsIGxhbmd1YWdlLCBvcHRpb25zKSB7XG4gIHZhciBtZXJnZWRPcHRzID0geyB9XG4gICAgLCBkZWZhdWx0cyA9IHtcbiAgICAgICAgICB0b29sYmFyOiBmYWxzZVxuICAgICAgICAsICdmaXJzdC1saW5lJzogMVxuICAgICAgfVxuICAgICwgaGlnaGxpZ2h0ZWRIdG1sXG4gICAgO1xuXG4gIGlmICghbGFuZ3VhZ2UpIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gcGFzcyBhIGxhbmd1YWdlIG9idGFpbmVkIHZpYSBcImdldExhbmd1YWdlXCInKTtcbiAgaWYgKCFsYW5ndWFnZS5CcnVzaCkgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCB0byBwYXNzIGEgbGFuZ3VhZ2Ugd2l0aCBhIEJydXNoLCBvYnRhaW5lZCB2aWEgXCJnZXRMYW5ndWFnZVwiJyk7XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICAvLyBHYXRoZXIgYWxsIHVzZXIgc3BlY2lmaWVkIG9wdGlvbnMgZmlyc3RcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIG1lcmdlZE9wdHNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICB9KTtcbiAgICAvLyBBZGQgZGVmYXVsdCBvcHRpb24gb25seSBpZiB1c2VyIGRpZG4ndCBzcGVjaWZ5IGl0cyB2YWx1ZVxuICAgIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIG1lcmdlZE9wdHNba2V5XSA9IG9wdGlvbnNba2V5XSB8fCBkZWZhdWx0c1trZXldO1xuICAgIH0pO1xuXG4gIH0gZWxzZSB7XG4gICAgbWVyZ2VkT3B0cyA9IGRlZmF1bHRzO1xuICB9XG5cbiAgdmFyIGJydXNoID0gbmV3IGxhbmd1YWdlLkJydXNoKCk7XG4gIGJydXNoLmluaXQobWVyZ2VkT3B0cyk7XG5cbiAgaGlnaGxpZ2h0ZWRIdG1sID0gYnJ1c2guZ2V0SHRtbChjb2RlKTtcblxuICBpZiAobGFuZ3VhZ2UgPT09IGxhbmdNYXBbJ2h0bWwnXSkge1xuICAgIHZhciBsaW5lcyA9IGNvZGUuc3BsaXQoJ1xcbicpXG4gICAgICAsIHNjcmlwdHMgPSBpbmxpbmUuZmluZFNjcmlwdHMobGluZXMsIGxhbmd1YWdlLnNwZWNpZmllZEFsaWFzKTtcblxuICAgIC8vIEhpZ2hsaWdodCBjb2RlIGluIGJldHdlZW4gc2NyaXB0cyB0YWdzIGFuZCBpbnRlcmplY3QgaXQgaW50byBoaWdobGlnaHRlZCBodG1sXG4gICAgc2NyaXB0cy5mb3JFYWNoKGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgIHZhciBzY3JpcHRMYW5nID0gbGFuZ01hcFtzY3JpcHQudGFnLmFsaWFzXVxuICAgICAgICAsIGJydXNoID0gbmV3IHNjcmlwdExhbmcuQnJ1c2goKVxuICAgICAgICAsIG9wdHMgPSBtZXJnZWRPcHRzXG4gICAgICAgIDtcblxuICAgICAgLy8gYWRhcHQgbGluZSBudW1iZXJzIG9mIGhpZ2hsaWdodGVkIGNvZGUgc2luY2UgaXQgaXMgaW4gdGhlIG1pZGRsZSBvZiBodG1sIGRvY3VtZW50XG4gICAgICBvcHRzWydmaXJzdC1saW5lJ10gPSBtZXJnZWRPcHRzWydmaXJzdC1saW5lJ10gKyBzY3JpcHQuZnJvbTtcbiAgICAgIFxuICAgICAgYnJ1c2guaW5pdChvcHRzKTtcblxuICAgICAgdmFyIGhpZ2hsaWdodGVkU2NyaXB0ID0gYnJ1c2guZ2V0SHRtbChzY3JpcHQuY29kZSlcbiAgICAgICAgLCBoaWdsaWdodGVkTGluZXMgPSBpbmxpbmUuZXh0cmFjdExpbmVzKGhpZ2hsaWdodGVkU2NyaXB0KTtcblxuICAgICAgaGlnaGxpZ2h0ZWRIdG1sID0gaW5saW5lLnJlcGxhY2VQbGFpbkxpbmVzKHNjcmlwdC5mcm9tLCBzY3JpcHQudG8sIGhpZ2hsaWdodGVkSHRtbCwgaGlnbGlnaHRlZExpbmVzKTtcbiAgICB9KTtcbiB9IFxuXG4gIHJldHVybiBoaWdobGlnaHRlZEh0bWw7XG59XG5cblxuZnVuY3Rpb24gZ2V0U3R5bGVzICgpIHtcbiAgcmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gY29weVN0eWxlIChzdHlsZSwgdGd0LCBjYikge1xuICB2YXIgc291cmNlUGF0aFxuICAgICwgc3R5bGVOYW1lO1xuXG4gIC8vIEFsbG93IHN0eWxlIHRvIGp1c3QgYmUgYSBzdHJpbmcgKGl0cyBuYW1lKSBvciBhIHN0eWxlIHJldHVybmVkIGZyb20gZ2V0U3R5bGVzXG4gIGlmICh0eXBlb2Ygc3R5bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3R5bGVOYW1lID0gc3R5bGU7XG5cbiAgICB2YXIgbWF0Y2hpbmdTdHlsZSA9IHN0eWxlcy5maWx0ZXIoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIHMubmFtZSA9PT0gc3R5bGU7IH0pWzBdO1xuXG4gICAgaWYgKCFtYXRjaGluZ1N0eWxlKSBcbiAgICAgIGNiKG5ldyBFcnJvcignU3R5bGUgbmFtZWQgXCInICsgc3R5bGUgKyAnXCIgbm90IGZvdW5kLicpKTtcbiAgICBlbHNlXG4gICAgICBzb3VyY2VQYXRoID0gbWF0Y2hpbmdTdHlsZS5zb3VyY2VQYXRoO1xuXG4gIH0gZWxzZSBpZiAoIXN0eWxlLnNvdXJjZVBhdGgpIHtcbiAgICBjYihuZXcgRXJyb3IoJ3N0eWxlIG5lZWRzIHRvIGJlIHN0cmluZyBvciBoYXZlIFwic291cmNlUGF0aFwiIHByb3BlcnR5JykpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlTmFtZSA9IHN0eWxlLm5hbWU7XG4gICAgc291cmNlUGF0aCA9IHN0eWxlLnNvdXJjZVBhdGg7XG4gIH1cblxuICB2YXIgcmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oc291cmNlUGF0aClcbiAgICAsIHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aC5qb2luKHRndCwgc3R5bGVOYW1lICsgJy5jc3MnKSlcbiAgICA7IFxuXG4gIHV0aWwucHVtcChyZWFkU3RyZWFtLCB3cml0ZVN0cmVhbSwgY2IpO1xufVxuXG5cbmZ1bmN0aW9uIGNvcHlTdHlsZXModGd0LCBjYikge1xuICB2YXIgcGVuZGluZyA9IHN0eWxlcy5sZW5ndGg7XG4gIHN0eWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG4gICAgY29weVN0eWxlKHMsIHRndCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgaWYgKGVycikgeyBcbiAgICAgICAgY2IoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICgtLXBlbmRpbmcgPT09IDApIGNiKCk7XG4gICAgICB9IFxuICAgIH0pO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaGlnaGxpZ2h0ICAgOiAgaGlnaGxpZ2h0XG4gICwgZ2V0TGFuZ3VhZ2UgOiAgZ2V0TGFuZ3VhZ2VcbiAgLCBnZXRTdHlsZXMgICA6ICBnZXRTdHlsZXNcbiAgLCBjb3B5U3R5bGUgICA6ICBjb3B5U3R5bGVcbiAgLCBjb3B5U3R5bGVzICA6ICBjb3B5U3R5bGVzXG59O1xuXG4iXX0=
