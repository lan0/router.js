'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isPromise = isPromise;
exports.merge = merge;
exports.extractQueryParams = extractQueryParams;
exports.coerceQueryParamsToString = coerceQueryParamsToString;
exports.log = log;
exports.isParam = isParam;
exports.forEach = forEach;
exports.getChangelist = getChangelist;
exports.promiseLabel = promiseLabel;
var slice = exports.slice = Array.prototype.slice;
var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
  Determines if an object is Promise by checking if it is "thenable".
**/
function isPromise(p) {
    return p !== null && typeof p === 'object' && typeof p.then === 'function';
}
function merge(hash, other) {
    for (var prop in other) {
        if (hasOwnProperty.call(other, prop)) {
            hash[prop] = other[prop];
        }
    }
}
/**
  @private

  Extracts query params from the end of an array
**/
function extractQueryParams(array) {
    var len = array && array.length,
        head = void 0,
        queryParams = void 0;
    if (len && len > 0) {
        var obj = array[len - 1];
        if (isQueryParams(obj)) {
            queryParams = obj.queryParams;
            head = slice.call(array, 0, len - 1);
            return [head, queryParams];
        }
    }
    return [array, null];
}
function isQueryParams(obj) {
    return obj && hasOwnProperty.call(obj, 'queryParams');
}
/**
  @private

  Coerces query param properties and array elements into strings.
**/
function coerceQueryParamsToString(queryParams) {
    for (var key in queryParams) {
        var val = queryParams[key];
        if (typeof val === 'number') {
            queryParams[key] = '' + val;
        } else if (Array.isArray(val)) {
            for (var i = 0, l = val.length; i < l; i++) {
                val[i] = '' + val[i];
            }
        }
    }
}
/**
  @private
 */
function log(router) {
    if (!router.log) {
        return;
    }

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    if (args.length === 2) {
        var sequence = args[0],
            msg = args[1];

        router.log('Transition #' + sequence + ': ' + msg);
    } else {
        var _msg = args[0];

        router.log(_msg);
    }
}
function isParam(object) {
    return typeof object === 'string' || object instanceof String || typeof object === 'number' || object instanceof Number;
}
function forEach(array, callback) {
    for (var i = 0, l = array.length; i < l && callback(array[i]) !== false; i++) {
        // empty intentionally
    }
}
function getChangelist(oldObject, newObject) {
    var key = void 0;
    var results = {
        all: {},
        changed: {},
        removed: {}
    };
    merge(results.all, newObject);
    var didChange = false;
    coerceQueryParamsToString(oldObject);
    coerceQueryParamsToString(newObject);
    // Calculate removals
    for (key in oldObject) {
        if (hasOwnProperty.call(oldObject, key)) {
            if (!hasOwnProperty.call(newObject, key)) {
                didChange = true;
                results.removed[key] = oldObject[key];
            }
        }
    }
    // Calculate changes
    for (key in newObject) {
        if (hasOwnProperty.call(newObject, key)) {
            var oldElement = oldObject[key];
            var newElement = newObject[key];
            if (isArray(oldElement) && isArray(newElement)) {
                if (oldElement.length !== newElement.length) {
                    results.changed[key] = newObject[key];
                    didChange = true;
                } else {
                    for (var i = 0, l = oldElement.length; i < l; i++) {
                        if (oldElement[i] !== newElement[i]) {
                            results.changed[key] = newObject[key];
                            didChange = true;
                        }
                    }
                }
            } else if (oldObject[key] !== newObject[key]) {
                results.changed[key] = newObject[key];
                didChange = true;
            }
        }
    }
    return didChange ? results : undefined;
}
function isArray(obj) {
    return Array.isArray(obj);
}
function promiseLabel(label) {
    return 'Router: ' + label;
}
//# sourceMappingURL=utils.js.map