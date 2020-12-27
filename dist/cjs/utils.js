"use strict";

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
exports.slice = void 0;
const slice = Array.prototype.slice;
exports.slice = slice;
const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
  Determines if an object is Promise by checking if it is "thenable".
**/

function isPromise(p) {
  return p !== null && typeof p === 'object' && typeof p.then === 'function';
}

function merge(hash, other) {
  for (let prop in other) {
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
  let len = array && array.length,
      head,
      queryParams;

  if (len && len > 0) {
    let obj = array[len - 1];

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
  for (let key in queryParams) {
    let val = queryParams[key];

    if (typeof val === 'number') {
      queryParams[key] = '' + val;
    } else if (Array.isArray(val)) {
      for (let i = 0, l = val.length; i < l; i++) {
        val[i] = '' + val[i];
      }
    }
  }
}
/**
  @private
 */


function log(router, ...args) {
  if (!router.log) {
    return;
  }

  if (args.length === 2) {
    let [sequence, msg] = args;
    router.log('Transition #' + sequence + ': ' + msg);
  } else {
    let [msg] = args;
    router.log(msg);
  }
}

function isParam(object) {
  return typeof object === 'string' || object instanceof String || typeof object === 'number' || object instanceof Number;
}

function forEach(array, callback) {
  for (let i = 0, l = array.length; i < l && callback(array[i]) !== false; i++) {// empty intentionally
  }
}

function getChangelist(oldObject, newObject) {
  let key;
  let results = {
    all: {},
    changed: {},
    removed: {}
  };
  merge(results.all, newObject);
  let didChange = false;
  coerceQueryParamsToString(oldObject);
  coerceQueryParamsToString(newObject); // Calculate removals

  for (key in oldObject) {
    if (hasOwnProperty.call(oldObject, key)) {
      if (!hasOwnProperty.call(newObject, key)) {
        didChange = true;
        results.removed[key] = oldObject[key];
      }
    }
  } // Calculate changes


  for (key in newObject) {
    if (hasOwnProperty.call(newObject, key)) {
      let oldElement = oldObject[key];
      let newElement = newObject[key];

      if (isArray(oldElement) && isArray(newElement)) {
        if (oldElement.length !== newElement.length) {
          results.changed[key] = newObject[key];
          didChange = true;
        } else {
          for (let i = 0, l = oldElement.length; i < l; i++) {
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