define('backburner', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                arr2[i] = arr[i];
            }

            return arr2;
        } else {
            return Array.from(arr);
        }
    }

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var SET_TIMEOUT = setTimeout;
    var NOOP = function NOOP() {};
    function buildNext(flush) {
        // Using "promises first" here to:
        //
        // 1) Ensure more consistent experience on browsers that
        //    have differently queued microtasks (separate queues for
        //    MutationObserver vs Promises).
        // 2) Ensure better debugging experiences (it shows up in Chrome
        //    call stack as "Promise.then (async)") which is more consistent
        //    with user expectations
        //
        // When Promise is unavailable use MutationObserver (mostly so that we
        // still get microtasks on IE11), and when neither MutationObserver and
        // Promise are present use a plain old setTimeout.
        if (typeof Promise === 'function') {
            var autorunPromise = Promise.resolve();
            return function () {
                return autorunPromise.then(flush);
            };
        } else if (typeof MutationObserver === 'function') {
            var iterations = 0;
            var observer = new MutationObserver(flush);
            var node = document.createTextNode('');
            observer.observe(node, { characterData: true });
            return function () {
                iterations = ++iterations % 2;
                node.data = '' + iterations;
                return iterations;
            };
        } else {
            return function () {
                return SET_TIMEOUT(flush, 0);
            };
        }
    }
    function buildPlatform(flush) {
        var clearNext = NOOP;
        return {
            setTimeout: function (_setTimeout) {
                function setTimeout(_x, _x2) {
                    return _setTimeout.apply(this, arguments);
                }

                setTimeout.toString = function () {
                    return _setTimeout.toString();
                };

                return setTimeout;
            }(function (fn, ms) {
                return setTimeout(fn, ms);
            }),
            clearTimeout: function (_clearTimeout) {
                function clearTimeout(_x3) {
                    return _clearTimeout.apply(this, arguments);
                }

                clearTimeout.toString = function () {
                    return _clearTimeout.toString();
                };

                return clearTimeout;
            }(function (timerId) {
                return clearTimeout(timerId);
            }),
            now: function now() {
                return Date.now();
            },

            next: buildNext(flush),
            clearNext: clearNext
        };
    }

    var NUMBER = /\d+/;
    var TIMERS_OFFSET = 6;
    function isCoercableNumber(suspect) {
        var type = typeof suspect === 'undefined' ? 'undefined' : _typeof(suspect);
        return type === 'number' && suspect === suspect || type === 'string' && NUMBER.test(suspect);
    }
    function getOnError(options) {
        return options.onError || options.onErrorTarget && options.onErrorTarget[options.onErrorMethod];
    }
    function findItem(target, method, collection) {
        var index = -1;
        for (var i = 0, l = collection.length; i < l; i += 4) {
            if (collection[i] === target && collection[i + 1] === method) {
                index = i;
                break;
            }
        }
        return index;
    }
    function findTimerItem(target, method, collection) {
        var index = -1;
        for (var i = 2, l = collection.length; i < l; i += 6) {
            if (collection[i] === target && collection[i + 1] === method) {
                index = i - 2;
                break;
            }
        }
        return index;
    }
    function getQueueItems(items, queueItemLength) {
        var queueItemPositionOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        var queueItems = [];
        for (var i = 0; i < items.length; i += queueItemLength) {
            var maybeError = items[i + 3 /* stack */ + queueItemPositionOffset];
            var queueItem = {
                target: items[i + 0 /* target */ + queueItemPositionOffset],
                method: items[i + 1 /* method */ + queueItemPositionOffset],
                args: items[i + 2 /* args */ + queueItemPositionOffset],
                stack: maybeError !== undefined && 'stack' in maybeError ? maybeError.stack : ''
            };
            queueItems.push(queueItem);
        }
        return queueItems;
    }

    function binarySearch(time, timers) {
        var start = 0;
        var end = timers.length - TIMERS_OFFSET;
        var middle = void 0;
        var l = void 0;
        while (start < end) {
            // since timers is an array of pairs 'l' will always
            // be an integer
            l = (end - start) / TIMERS_OFFSET;
            // compensate for the index in case even number
            // of pairs inside timers
            middle = start + l - l % TIMERS_OFFSET;
            if (time >= timers[middle]) {
                start = middle + TIMERS_OFFSET;
            } else {
                end = middle;
            }
        }
        return time >= timers[start] ? start + TIMERS_OFFSET : start;
    }

    var QUEUE_ITEM_LENGTH = 4;

    var Queue = function () {
        function Queue(name) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var globalOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            _classCallCheck(this, Queue);

            this._queueBeingFlushed = [];
            this.targetQueues = new Map();
            this.index = 0;
            this._queue = [];
            this.name = name;
            this.options = options;
            this.globalOptions = globalOptions;
        }

        _createClass(Queue, [{
            key: 'stackFor',
            value: function stackFor(index) {
                if (index < this._queue.length) {
                    var entry = this._queue[index * 3 + QUEUE_ITEM_LENGTH];
                    if (entry) {
                        return entry.stack;
                    } else {
                        return null;
                    }
                }
            }
        }, {
            key: 'flush',
            value: function flush(sync) {
                var _options = this.options,
                    before = _options.before,
                    after = _options.after;

                var target = void 0;
                var method = void 0;
                var args = void 0;
                var errorRecordedForStack = void 0;
                this.targetQueues.clear();
                if (this._queueBeingFlushed.length === 0) {
                    this._queueBeingFlushed = this._queue;
                    this._queue = [];
                }
                if (before !== undefined) {
                    before();
                }
                var invoke = void 0;
                var queueItems = this._queueBeingFlushed;
                if (queueItems.length > 0) {
                    var onError = getOnError(this.globalOptions);
                    invoke = onError ? this.invokeWithOnError : this.invoke;
                    for (var i = this.index; i < queueItems.length; i += QUEUE_ITEM_LENGTH) {
                        this.index += QUEUE_ITEM_LENGTH;
                        method = queueItems[i + 1];
                        // method could have been nullified / canceled during flush
                        if (method !== null) {
                            //
                            //    ** Attention intrepid developer **
                            //
                            //    To find out the stack of this task when it was scheduled onto
                            //    the run loop, add the following to your app.js:
                            //
                            //    Ember.run.backburner.DEBUG = true; // NOTE: This slows your app, don't leave it on in production.
                            //
                            //    Once that is in place, when you are at a breakpoint and navigate
                            //    here in the stack explorer, you can look at `errorRecordedForStack.stack`,
                            //    which will be the captured stack when this job was scheduled.
                            //
                            //    One possible long-term solution is the following Chrome issue:
                            //       https://bugs.chromium.org/p/chromium/issues/detail?id=332624
                            //
                            target = queueItems[i];
                            args = queueItems[i + 2];
                            errorRecordedForStack = queueItems[i + 3]; // Debugging assistance
                            invoke(target, method, args, onError, errorRecordedForStack);
                        }
                        if (this.index !== this._queueBeingFlushed.length && this.globalOptions.mustYield && this.globalOptions.mustYield()) {
                            return 1 /* Pause */;
                        }
                    }
                }
                if (after !== undefined) {
                    after();
                }
                this._queueBeingFlushed.length = 0;
                this.index = 0;
                if (sync !== false && this._queue.length > 0) {
                    // check if new items have been added
                    this.flush(true);
                }
            }
        }, {
            key: 'hasWork',
            value: function hasWork() {
                return this._queueBeingFlushed.length > 0 || this._queue.length > 0;
            }
        }, {
            key: 'cancel',
            value: function cancel(_ref) {
                var target = _ref.target,
                    method = _ref.method;

                var queue = this._queue;
                var targetQueueMap = this.targetQueues.get(target);
                if (targetQueueMap !== undefined) {
                    targetQueueMap.delete(method);
                }
                var index = findItem(target, method, queue);
                if (index > -1) {
                    queue.splice(index, QUEUE_ITEM_LENGTH);
                    return true;
                }
                // if not found in current queue
                // could be in the queue that is being flushed
                queue = this._queueBeingFlushed;
                index = findItem(target, method, queue);
                if (index > -1) {
                    queue[index + 1] = null;
                    return true;
                }
                return false;
            }
        }, {
            key: 'push',
            value: function push(target, method, args, stack) {
                this._queue.push(target, method, args, stack);
                return {
                    queue: this,
                    target: target,
                    method: method
                };
            }
        }, {
            key: 'pushUnique',
            value: function pushUnique(target, method, args, stack) {
                var localQueueMap = this.targetQueues.get(target);
                if (localQueueMap === undefined) {
                    localQueueMap = new Map();
                    this.targetQueues.set(target, localQueueMap);
                }
                var index = localQueueMap.get(method);
                if (index === undefined) {
                    var queueIndex = this._queue.push(target, method, args, stack) - QUEUE_ITEM_LENGTH;
                    localQueueMap.set(method, queueIndex);
                } else {
                    var queue = this._queue;
                    queue[index + 2] = args; // replace args
                    queue[index + 3] = stack; // replace stack
                }
                return {
                    queue: this,
                    target: target,
                    method: method
                };
            }
        }, {
            key: '_getDebugInfo',
            value: function _getDebugInfo(debugEnabled) {
                if (debugEnabled) {
                    var debugInfo = getQueueItems(this._queue, QUEUE_ITEM_LENGTH);
                    return debugInfo;
                }
                return undefined;
            }
        }, {
            key: 'invoke',
            value: function invoke(target, method, args /*, onError, errorRecordedForStack */) {
                if (args === undefined) {
                    method.call(target);
                } else {
                    method.apply(target, args);
                }
            }
        }, {
            key: 'invokeWithOnError',
            value: function invokeWithOnError(target, method, args, onError, errorRecordedForStack) {
                try {
                    if (args === undefined) {
                        method.call(target);
                    } else {
                        method.apply(target, args);
                    }
                } catch (error) {
                    onError(error, errorRecordedForStack);
                }
            }
        }]);

        return Queue;
    }();

    var DeferredActionQueues = function () {
        function DeferredActionQueues() {
            var queueNames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var options = arguments[1];

            _classCallCheck(this, DeferredActionQueues);

            this.queues = {};
            this.queueNameIndex = 0;
            this.queueNames = queueNames;
            queueNames.reduce(function (queues, queueName) {
                queues[queueName] = new Queue(queueName, options[queueName], options);
                return queues;
            }, this.queues);
        }
        /**
         * @method schedule
         * @param {String} queueName
         * @param {Any} target
         * @param {Any} method
         * @param {Any} args
         * @param {Boolean} onceFlag
         * @param {Any} stack
         * @return queue
         */


        _createClass(DeferredActionQueues, [{
            key: 'schedule',
            value: function schedule(queueName, target, method, args, onceFlag, stack) {
                var queues = this.queues;
                var queue = queues[queueName];
                if (queue === undefined) {
                    throw new Error('You attempted to schedule an action in a queue (' + queueName + ') that doesn\'t exist');
                }
                if (method === undefined || method === null) {
                    throw new Error('You attempted to schedule an action in a queue (' + queueName + ') for a method that doesn\'t exist');
                }
                this.queueNameIndex = 0;
                if (onceFlag) {
                    return queue.pushUnique(target, method, args, stack);
                } else {
                    return queue.push(target, method, args, stack);
                }
            }
        }, {
            key: 'flush',
            value: function flush() {
                var fromAutorun = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                var queue = void 0;
                var queueName = void 0;
                var numberOfQueues = this.queueNames.length;
                while (this.queueNameIndex < numberOfQueues) {
                    queueName = this.queueNames[this.queueNameIndex];
                    queue = this.queues[queueName];
                    if (queue.hasWork() === false) {
                        this.queueNameIndex++;
                        if (fromAutorun && this.queueNameIndex < numberOfQueues) {
                            return 1 /* Pause */;
                        }
                    } else {
                        if (queue.flush(false /* async */) === 1 /* Pause */) {
                                return 1 /* Pause */;
                            }
                    }
                }
            }
        }, {
            key: '_getDebugInfo',
            value: function _getDebugInfo(debugEnabled) {
                if (debugEnabled) {
                    var debugInfo = {};
                    var queue = void 0;
                    var queueName = void 0;
                    var numberOfQueues = this.queueNames.length;
                    var i = 0;
                    while (i < numberOfQueues) {
                        queueName = this.queueNames[i];
                        queue = this.queues[queueName];
                        debugInfo[queueName] = queue._getDebugInfo(debugEnabled);
                        i++;
                    }
                    return debugInfo;
                }
                return;
            }
        }]);

        return DeferredActionQueues;
    }();

    function iteratorDrain(fn) {
        var iterator = fn();
        var result = iterator.next();
        while (result.done === false) {
            result.value();
            result = iterator.next();
        }
    }

    var noop = function noop() {};
    var DISABLE_SCHEDULE = Object.freeze([]);
    function parseArgs() {
        var length = arguments.length;
        var args = void 0;
        var method = void 0;
        var target = void 0;
        if (length === 0) {} else if (length === 1) {
            target = null;
            method = arguments[0];
        } else {
            var argsIndex = 2;
            var methodOrTarget = arguments[0];
            var methodOrArgs = arguments[1];
            var type = typeof methodOrArgs === 'undefined' ? 'undefined' : _typeof(methodOrArgs);
            if (type === 'function') {
                target = methodOrTarget;
                method = methodOrArgs;
            } else if (methodOrTarget !== null && type === 'string' && methodOrArgs in methodOrTarget) {
                target = methodOrTarget;
                method = target[methodOrArgs];
            } else if (typeof methodOrTarget === 'function') {
                argsIndex = 1;
                target = null;
                method = methodOrTarget;
            }
            if (length > argsIndex) {
                var len = length - argsIndex;
                args = new Array(len);
                for (var i = 0; i < len; i++) {
                    args[i] = arguments[i + argsIndex];
                }
            }
        }
        return [target, method, args];
    }
    function parseTimerArgs() {
        var _parseArgs = parseArgs.apply(undefined, arguments),
            _parseArgs2 = _slicedToArray(_parseArgs, 3),
            target = _parseArgs2[0],
            method = _parseArgs2[1],
            args = _parseArgs2[2];

        var wait = 0;
        var length = args !== undefined ? args.length : 0;
        if (length > 0) {
            var last = args[length - 1];
            if (isCoercableNumber(last)) {
                wait = parseInt(args.pop(), 10);
            }
        }
        return [target, method, args, wait];
    }
    function parseDebounceArgs() {
        var target = void 0;
        var method = void 0;
        var isImmediate = void 0;
        var args = void 0;
        var wait = void 0;
        if (arguments.length === 2) {
            method = arguments[0];
            wait = arguments[1];
            target = null;
        } else {
            var _parseArgs3 = parseArgs.apply(undefined, arguments);

            var _parseArgs4 = _slicedToArray(_parseArgs3, 3);

            target = _parseArgs4[0];
            method = _parseArgs4[1];
            args = _parseArgs4[2];

            if (args === undefined) {
                wait = 0;
            } else {
                wait = args.pop();
                if (!isCoercableNumber(wait)) {
                    isImmediate = wait === true;
                    wait = args.pop();
                }
            }
        }
        wait = parseInt(wait, 10);
        return [target, method, args, wait, isImmediate];
    }
    var UUID = 0;
    var beginCount = 0;
    var endCount = 0;
    var beginEventCount = 0;
    var endEventCount = 0;
    var runCount = 0;
    var joinCount = 0;
    var deferCount = 0;
    var scheduleCount = 0;
    var scheduleIterableCount = 0;
    var deferOnceCount = 0;
    var scheduleOnceCount = 0;
    var setTimeoutCount = 0;
    var laterCount = 0;
    var throttleCount = 0;
    var debounceCount = 0;
    var cancelTimersCount = 0;
    var cancelCount = 0;
    var autorunsCreatedCount = 0;
    var autorunsCompletedCount = 0;
    var deferredActionQueuesCreatedCount = 0;
    var nestedDeferredActionQueuesCreated = 0;

    var Backburner = function () {
        function Backburner(queueNames, options) {
            var _this = this;

            _classCallCheck(this, Backburner);

            this.DEBUG = false;
            this.currentInstance = null;
            this.instanceStack = [];
            this._eventCallbacks = {
                end: [],
                begin: []
            };
            this._timerTimeoutId = null;
            this._timers = [];
            this._autorun = false;
            this._autorunStack = null;
            this.queueNames = queueNames;
            this.options = options || {};
            if (typeof this.options.defaultQueue === 'string') {
                this._defaultQueue = this.options.defaultQueue;
            } else {
                this._defaultQueue = this.queueNames[0];
            }
            this._onBegin = this.options.onBegin || noop;
            this._onEnd = this.options.onEnd || noop;
            this._boundRunExpiredTimers = this._runExpiredTimers.bind(this);
            this._boundAutorunEnd = function () {
                autorunsCompletedCount++;
                // if the autorun was already flushed, do nothing
                if (_this._autorun === false) {
                    return;
                }
                _this._autorun = false;
                _this._autorunStack = null;
                _this._end(true /* fromAutorun */);
            };
            var builder = this.options._buildPlatform || buildPlatform;
            this._platform = builder(this._boundAutorunEnd);
        }

        _createClass(Backburner, [{
            key: 'begin',
            value: function begin() {
                beginCount++;
                var options = this.options;
                var previousInstance = this.currentInstance;
                var current = void 0;
                if (this._autorun !== false) {
                    current = previousInstance;
                    this._cancelAutorun();
                } else {
                    if (previousInstance !== null) {
                        nestedDeferredActionQueuesCreated++;
                        this.instanceStack.push(previousInstance);
                    }
                    deferredActionQueuesCreatedCount++;
                    current = this.currentInstance = new DeferredActionQueues(this.queueNames, options);
                    beginEventCount++;
                    this._trigger('begin', current, previousInstance);
                }
                this._onBegin(current, previousInstance);
                return current;
            }
        }, {
            key: 'end',
            value: function end() {
                endCount++;
                this._end(false);
            }
        }, {
            key: 'on',
            value: function on(eventName, callback) {
                if (typeof callback !== 'function') {
                    throw new TypeError('Callback must be a function');
                }
                var callbacks = this._eventCallbacks[eventName];
                if (callbacks !== undefined) {
                    callbacks.push(callback);
                } else {
                    throw new TypeError('Cannot on() event ' + eventName + ' because it does not exist');
                }
            }
        }, {
            key: 'off',
            value: function off(eventName, callback) {
                var callbacks = this._eventCallbacks[eventName];
                if (!eventName || callbacks === undefined) {
                    throw new TypeError('Cannot off() event ' + eventName + ' because it does not exist');
                }
                var callbackFound = false;
                if (callback) {
                    for (var i = 0; i < callbacks.length; i++) {
                        if (callbacks[i] === callback) {
                            callbackFound = true;
                            callbacks.splice(i, 1);
                            i--;
                        }
                    }
                }
                if (!callbackFound) {
                    throw new TypeError('Cannot off() callback that does not exist');
                }
            }
        }, {
            key: 'run',
            value: function run() {
                runCount++;

                var _parseArgs5 = parseArgs.apply(undefined, arguments),
                    _parseArgs6 = _slicedToArray(_parseArgs5, 3),
                    target = _parseArgs6[0],
                    method = _parseArgs6[1],
                    args = _parseArgs6[2];

                return this._run(target, method, args);
            }
        }, {
            key: 'join',
            value: function join() {
                joinCount++;

                var _parseArgs7 = parseArgs.apply(undefined, arguments),
                    _parseArgs8 = _slicedToArray(_parseArgs7, 3),
                    target = _parseArgs8[0],
                    method = _parseArgs8[1],
                    args = _parseArgs8[2];

                return this._join(target, method, args);
            }
        }, {
            key: 'defer',
            value: function defer(queueName, target, method) {
                deferCount++;

                for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
                    args[_key - 3] = arguments[_key];
                }

                return this.schedule.apply(this, [queueName, target, method].concat(args));
            }
        }, {
            key: 'schedule',
            value: function schedule(queueName) {
                scheduleCount++;

                for (var _len2 = arguments.length, _args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    _args[_key2 - 1] = arguments[_key2];
                }

                var _parseArgs9 = parseArgs.apply(undefined, _args),
                    _parseArgs10 = _slicedToArray(_parseArgs9, 3),
                    target = _parseArgs10[0],
                    method = _parseArgs10[1],
                    args = _parseArgs10[2];

                var stack = this.DEBUG ? new Error() : undefined;
                return this._ensureInstance().schedule(queueName, target, method, args, false, stack);
            }
        }, {
            key: 'scheduleIterable',
            value: function scheduleIterable(queueName, iterable) {
                scheduleIterableCount++;
                var stack = this.DEBUG ? new Error() : undefined;
                return this._ensureInstance().schedule(queueName, null, iteratorDrain, [iterable], false, stack);
            }
        }, {
            key: 'deferOnce',
            value: function deferOnce(queueName, target, method) {
                deferOnceCount++;

                for (var _len3 = arguments.length, args = Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
                    args[_key3 - 3] = arguments[_key3];
                }

                return this.scheduleOnce.apply(this, [queueName, target, method].concat(args));
            }
        }, {
            key: 'scheduleOnce',
            value: function scheduleOnce(queueName) {
                scheduleOnceCount++;

                for (var _len4 = arguments.length, _args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    _args[_key4 - 1] = arguments[_key4];
                }

                var _parseArgs11 = parseArgs.apply(undefined, _args),
                    _parseArgs12 = _slicedToArray(_parseArgs11, 3),
                    target = _parseArgs12[0],
                    method = _parseArgs12[1],
                    args = _parseArgs12[2];

                var stack = this.DEBUG ? new Error() : undefined;
                return this._ensureInstance().schedule(queueName, target, method, args, true, stack);
            }
        }, {
            key: 'setTimeout',
            value: function setTimeout() {
                setTimeoutCount++;
                return this.later.apply(this, arguments);
            }
        }, {
            key: 'later',
            value: function later() {
                laterCount++;

                var _parseTimerArgs = parseTimerArgs.apply(undefined, arguments),
                    _parseTimerArgs2 = _slicedToArray(_parseTimerArgs, 4),
                    target = _parseTimerArgs2[0],
                    method = _parseTimerArgs2[1],
                    args = _parseTimerArgs2[2],
                    wait = _parseTimerArgs2[3];

                return this._later(target, method, args, wait);
            }
        }, {
            key: 'throttle',
            value: function throttle() {
                throttleCount++;

                var _parseDebounceArgs = parseDebounceArgs.apply(undefined, arguments),
                    _parseDebounceArgs2 = _slicedToArray(_parseDebounceArgs, 5),
                    target = _parseDebounceArgs2[0],
                    method = _parseDebounceArgs2[1],
                    args = _parseDebounceArgs2[2],
                    wait = _parseDebounceArgs2[3],
                    _parseDebounceArgs2$ = _parseDebounceArgs2[4],
                    isImmediate = _parseDebounceArgs2$ === undefined ? true : _parseDebounceArgs2$;

                var index = findTimerItem(target, method, this._timers);
                var timerId = void 0;
                if (index === -1) {
                    timerId = this._later(target, method, isImmediate ? DISABLE_SCHEDULE : args, wait);
                    if (isImmediate) {
                        this._join(target, method, args);
                    }
                } else {
                    timerId = this._timers[index + 1];
                    var argIndex = index + 4;
                    if (this._timers[argIndex] !== DISABLE_SCHEDULE) {
                        this._timers[argIndex] = args;
                    }
                }
                return timerId;
            }
        }, {
            key: 'debounce',
            value: function debounce() {
                debounceCount++;

                var _parseDebounceArgs3 = parseDebounceArgs.apply(undefined, arguments),
                    _parseDebounceArgs4 = _slicedToArray(_parseDebounceArgs3, 5),
                    target = _parseDebounceArgs4[0],
                    method = _parseDebounceArgs4[1],
                    args = _parseDebounceArgs4[2],
                    wait = _parseDebounceArgs4[3],
                    _parseDebounceArgs4$ = _parseDebounceArgs4[4],
                    isImmediate = _parseDebounceArgs4$ === undefined ? false : _parseDebounceArgs4$;

                var _timers = this._timers;
                var index = findTimerItem(target, method, _timers);
                var timerId = void 0;
                if (index === -1) {
                    timerId = this._later(target, method, isImmediate ? DISABLE_SCHEDULE : args, wait);
                    if (isImmediate) {
                        this._join(target, method, args);
                    }
                } else {
                    var executeAt = this._platform.now() + wait;
                    var argIndex = index + 4;
                    if (_timers[argIndex] === DISABLE_SCHEDULE) {
                        args = DISABLE_SCHEDULE;
                    }
                    timerId = _timers[index + 1];
                    var i = binarySearch(executeAt, _timers);
                    if (index + TIMERS_OFFSET === i) {
                        _timers[index] = executeAt;
                        _timers[argIndex] = args;
                    } else {
                        var stack = this._timers[index + 5];
                        this._timers.splice(i, 0, executeAt, timerId, target, method, args, stack);
                        this._timers.splice(index, TIMERS_OFFSET);
                    }
                    if (index === 0) {
                        this._reinstallTimerTimeout();
                    }
                }
                return timerId;
            }
        }, {
            key: 'cancelTimers',
            value: function cancelTimers() {
                cancelTimersCount++;
                this._clearTimerTimeout();
                this._timers = [];
                this._cancelAutorun();
            }
        }, {
            key: 'hasTimers',
            value: function hasTimers() {
                return this._timers.length > 0 || this._autorun;
            }
        }, {
            key: 'cancel',
            value: function cancel(timer) {
                cancelCount++;
                if (timer === null || timer === undefined) {
                    return false;
                }
                var timerType = typeof timer === 'undefined' ? 'undefined' : _typeof(timer);
                if (timerType === 'number') {
                    // we're cancelling a setTimeout or throttle or debounce
                    return this._cancelLaterTimer(timer);
                } else if (timerType === 'object' && timer.queue && timer.method) {
                    // we're cancelling a deferOnce
                    return timer.queue.cancel(timer);
                }
                return false;
            }
        }, {
            key: 'ensureInstance',
            value: function ensureInstance() {
                this._ensureInstance();
            }
        }, {
            key: 'getDebugInfo',
            value: function getDebugInfo() {
                var _this2 = this;

                if (this.DEBUG) {
                    return {
                        autorun: this._autorunStack,
                        counters: this.counters,
                        timers: getQueueItems(this._timers, TIMERS_OFFSET, 2),
                        instanceStack: [this.currentInstance].concat(_toConsumableArray(this.instanceStack)).map(function (deferredActionQueue) {
                            return deferredActionQueue && deferredActionQueue._getDebugInfo(_this2.DEBUG);
                        })
                    };
                }
                return undefined;
            }
        }, {
            key: '_end',
            value: function _end(fromAutorun) {
                var currentInstance = this.currentInstance;
                var nextInstance = null;
                if (currentInstance === null) {
                    throw new Error('end called without begin');
                }
                // Prevent double-finally bug in Safari 6.0.2 and iOS 6
                // This bug appears to be resolved in Safari 6.0.5 and iOS 7
                var finallyAlreadyCalled = false;
                var result = void 0;
                try {
                    result = currentInstance.flush(fromAutorun);
                } finally {
                    if (!finallyAlreadyCalled) {
                        finallyAlreadyCalled = true;
                        if (result === 1 /* Pause */) {
                                var plannedNextQueue = this.queueNames[currentInstance.queueNameIndex];
                                this._scheduleAutorun(plannedNextQueue);
                            } else {
                            this.currentInstance = null;
                            if (this.instanceStack.length > 0) {
                                nextInstance = this.instanceStack.pop();
                                this.currentInstance = nextInstance;
                            }
                            this._trigger('end', currentInstance, nextInstance);
                            this._onEnd(currentInstance, nextInstance);
                        }
                    }
                }
            }
        }, {
            key: '_join',
            value: function _join(target, method, args) {
                if (this.currentInstance === null) {
                    return this._run(target, method, args);
                }
                if (target === undefined && args === undefined) {
                    return method();
                } else {
                    return method.apply(target, args);
                }
            }
        }, {
            key: '_run',
            value: function _run(target, method, args) {
                var onError = getOnError(this.options);
                this.begin();
                if (onError) {
                    try {
                        return method.apply(target, args);
                    } catch (error) {
                        onError(error);
                    } finally {
                        this.end();
                    }
                } else {
                    try {
                        return method.apply(target, args);
                    } finally {
                        this.end();
                    }
                }
            }
        }, {
            key: '_cancelAutorun',
            value: function _cancelAutorun() {
                if (this._autorun) {
                    this._platform.clearNext();
                    this._autorun = false;
                    this._autorunStack = null;
                }
            }
        }, {
            key: '_later',
            value: function _later(target, method, args, wait) {
                var stack = this.DEBUG ? new Error() : undefined;
                var executeAt = this._platform.now() + wait;
                var id = UUID++;
                if (this._timers.length === 0) {
                    this._timers.push(executeAt, id, target, method, args, stack);
                    this._installTimerTimeout();
                } else {
                    // find position to insert
                    var i = binarySearch(executeAt, this._timers);
                    this._timers.splice(i, 0, executeAt, id, target, method, args, stack);
                    // always reinstall since it could be out of sync
                    this._reinstallTimerTimeout();
                }
                return id;
            }
        }, {
            key: '_cancelLaterTimer',
            value: function _cancelLaterTimer(timer) {
                for (var i = 1; i < this._timers.length; i += TIMERS_OFFSET) {
                    if (this._timers[i] === timer) {
                        this._timers.splice(i - 1, TIMERS_OFFSET);
                        if (i === 1) {
                            this._reinstallTimerTimeout();
                        }
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: '_trigger',
            value: function _trigger(eventName, arg1, arg2) {
                var callbacks = this._eventCallbacks[eventName];
                if (callbacks !== undefined) {
                    for (var i = 0; i < callbacks.length; i++) {
                        callbacks[i](arg1, arg2);
                    }
                }
            }
        }, {
            key: '_runExpiredTimers',
            value: function _runExpiredTimers() {
                this._timerTimeoutId = null;
                if (this._timers.length > 0) {
                    this.begin();
                    this._scheduleExpiredTimers();
                    this.end();
                }
            }
        }, {
            key: '_scheduleExpiredTimers',
            value: function _scheduleExpiredTimers() {
                var timers = this._timers;
                var i = 0;
                var l = timers.length;
                var defaultQueue = this._defaultQueue;
                var n = this._platform.now();
                for (; i < l; i += TIMERS_OFFSET) {
                    var executeAt = timers[i];
                    if (executeAt > n) {
                        break;
                    }
                    var _args2 = timers[i + 4];
                    if (_args2 !== DISABLE_SCHEDULE) {
                        var target = timers[i + 2];
                        var method = timers[i + 3];
                        var stack = timers[i + 5];
                        this.currentInstance.schedule(defaultQueue, target, method, _args2, false, stack);
                    }
                }
                timers.splice(0, i);
                this._installTimerTimeout();
            }
        }, {
            key: '_reinstallTimerTimeout',
            value: function _reinstallTimerTimeout() {
                this._clearTimerTimeout();
                this._installTimerTimeout();
            }
        }, {
            key: '_clearTimerTimeout',
            value: function _clearTimerTimeout() {
                if (this._timerTimeoutId === null) {
                    return;
                }
                this._platform.clearTimeout(this._timerTimeoutId);
                this._timerTimeoutId = null;
            }
        }, {
            key: '_installTimerTimeout',
            value: function _installTimerTimeout() {
                if (this._timers.length === 0) {
                    return;
                }
                var minExpiresAt = this._timers[0];
                var n = this._platform.now();
                var wait = Math.max(0, minExpiresAt - n);
                this._timerTimeoutId = this._platform.setTimeout(this._boundRunExpiredTimers, wait);
            }
        }, {
            key: '_ensureInstance',
            value: function _ensureInstance() {
                var currentInstance = this.currentInstance;
                if (currentInstance === null) {
                    this._autorunStack = this.DEBUG ? new Error() : undefined;
                    currentInstance = this.begin();
                    this._scheduleAutorun(this.queueNames[0]);
                }
                return currentInstance;
            }
        }, {
            key: '_scheduleAutorun',
            value: function _scheduleAutorun(plannedNextQueue) {
                autorunsCreatedCount++;
                var next = this._platform.next;
                var flush = this.options.flush;
                if (flush) {
                    flush(plannedNextQueue, next);
                } else {
                    next();
                }
                this._autorun = true;
            }
        }, {
            key: 'counters',
            get: function get() {
                return {
                    begin: beginCount,
                    end: endCount,
                    events: {
                        begin: beginEventCount,
                        end: endEventCount
                    },
                    autoruns: {
                        created: autorunsCreatedCount,
                        completed: autorunsCompletedCount
                    },
                    run: runCount,
                    join: joinCount,
                    defer: deferCount,
                    schedule: scheduleCount,
                    scheduleIterable: scheduleIterableCount,
                    deferOnce: deferOnceCount,
                    scheduleOnce: scheduleOnceCount,
                    setTimeout: setTimeoutCount,
                    later: laterCount,
                    throttle: throttleCount,
                    debounce: debounceCount,
                    cancelTimers: cancelTimersCount,
                    cancel: cancelCount,
                    loops: {
                        total: deferredActionQueuesCreatedCount,
                        nested: nestedDeferredActionQueuesCreated
                    }
                };
            }
        }, {
            key: 'defaultQueue',
            get: function get() {
                return this._defaultQueue;
            }
        }]);

        return Backburner;
    }();

    Backburner.Queue = Queue;
    Backburner.buildPlatform = buildPlatform;
    Backburner.buildNext = buildNext;

    exports.default = Backburner;
    exports.buildPlatform = buildPlatform;
});
define("route-recognizer", ["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var createObject = Object.create;
    function createMap() {
        var map = createObject(null);
        map["__"] = undefined;
        delete map["__"];
        return map;
    }

    var Target = function Target(path, matcher, delegate) {
        this.path = path;
        this.matcher = matcher;
        this.delegate = delegate;
    };
    Target.prototype.to = function to(target, callback) {
        var delegate = this.delegate;
        if (delegate && delegate.willAddRoute) {
            target = delegate.willAddRoute(this.matcher.target, target);
        }
        this.matcher.add(this.path, target);
        if (callback) {
            if (callback.length === 0) {
                throw new Error("You must have an argument in the function passed to `to`");
            }
            this.matcher.addChild(this.path, target, callback, this.delegate);
        }
    };
    var Matcher = function Matcher(target) {
        this.routes = createMap();
        this.children = createMap();
        this.target = target;
    };
    Matcher.prototype.add = function add(path, target) {
        this.routes[path] = target;
    };
    Matcher.prototype.addChild = function addChild(path, target, callback, delegate) {
        var matcher = new Matcher(target);
        this.children[path] = matcher;
        var match = generateMatch(path, matcher, delegate);
        if (delegate && delegate.contextEntered) {
            delegate.contextEntered(target, match);
        }
        callback(match);
    };
    function generateMatch(startingPath, matcher, delegate) {
        function match(path, callback) {
            var fullPath = startingPath + path;
            if (callback) {
                callback(generateMatch(fullPath, matcher, delegate));
            } else {
                return new Target(fullPath, matcher, delegate);
            }
        }

        return match;
    }
    function addRoute(routeArray, path, handler) {
        var len = 0;
        for (var i = 0; i < routeArray.length; i++) {
            len += routeArray[i].path.length;
        }
        path = path.substr(len);
        var route = { path: path, handler: handler };
        routeArray.push(route);
    }
    function eachRoute(baseRoute, matcher, callback, binding) {
        var routes = matcher.routes;
        var paths = Object.keys(routes);
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var routeArray = baseRoute.slice();
            addRoute(routeArray, path, routes[path]);
            var nested = matcher.children[path];
            if (nested) {
                eachRoute(routeArray, nested, callback, binding);
            } else {
                callback.call(binding, routeArray);
            }
        }
    }
    var map = function map(callback, addRouteCallback) {
        var matcher = new Matcher();
        callback(generateMatch("", matcher, this.delegate));
        eachRoute([], matcher, function (routes) {
            if (addRouteCallback) {
                addRouteCallback(this, routes);
            } else {
                this.add(routes);
            }
        }, this);
    };

    // Normalizes percent-encoded values in `path` to upper-case and decodes percent-encoded
    // values that are not reserved (i.e., unicode characters, emoji, etc). The reserved
    // chars are "/" and "%".
    // Safe to call multiple times on the same path.
    // Normalizes percent-encoded values in `path` to upper-case and decodes percent-encoded
    function normalizePath(path) {
        return path.split("/").map(normalizeSegment).join("/");
    }
    // We want to ensure the characters "%" and "/" remain in percent-encoded
    // form when normalizing paths, so replace them with their encoded form after
    // decoding the rest of the path
    var SEGMENT_RESERVED_CHARS = /%|\//g;
    function normalizeSegment(segment) {
        if (segment.length < 3 || segment.indexOf("%") === -1) {
            return segment;
        }
        return decodeURIComponent(segment).replace(SEGMENT_RESERVED_CHARS, encodeURIComponent);
    }
    // We do not want to encode these characters when generating dynamic path segments
    // See https://tools.ietf.org/html/rfc3986#section-3.3
    // sub-delims: "!", "$", "&", "'", "(", ")", "*", "+", ",", ";", "="
    // others allowed by RFC 3986: ":", "@"
    //
    // First encode the entire path segment, then decode any of the encoded special chars.
    //
    // The chars "!", "'", "(", ")", "*" do not get changed by `encodeURIComponent`,
    // so the possible encoded chars are:
    // ['%24', '%26', '%2B', '%2C', '%3B', '%3D', '%3A', '%40'].
    var PATH_SEGMENT_ENCODINGS = /%(?:2(?:4|6|B|C)|3(?:B|D|A)|40)/g;
    function encodePathSegment(str) {
        return encodeURIComponent(str).replace(PATH_SEGMENT_ENCODINGS, decodeURIComponent);
    }

    var escapeRegex = /(\/|\.|\*|\+|\?|\||\(|\)|\[|\]|\{|\}|\\)/g;
    var isArray = Array.isArray;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function getParam(params, key) {
        if ((typeof params === "undefined" ? "undefined" : _typeof(params)) !== "object" || params === null) {
            throw new Error("You must pass an object as the second argument to `generate`.");
        }
        if (!hasOwnProperty.call(params, key)) {
            throw new Error("You must provide param `" + key + "` to `generate`.");
        }
        var value = params[key];
        var str = typeof value === "string" ? value : "" + value;
        if (str.length === 0) {
            throw new Error("You must provide a param `" + key + "`.");
        }
        return str;
    }
    var eachChar = [];
    eachChar[0 /* Static */] = function (segment, currentState) {
        var state = currentState;
        var value = segment.value;
        for (var i = 0; i < value.length; i++) {
            var ch = value.charCodeAt(i);
            state = state.put(ch, false, false);
        }
        return state;
    };
    eachChar[1 /* Dynamic */] = function (_, currentState) {
        return currentState.put(47 /* SLASH */, true, true);
    };
    eachChar[2 /* Star */] = function (_, currentState) {
        return currentState.put(-1 /* ANY */, false, true);
    };
    eachChar[4 /* Epsilon */] = function (_, currentState) {
        return currentState;
    };
    var regex = [];
    regex[0 /* Static */] = function (segment) {
        return segment.value.replace(escapeRegex, "\\$1");
    };
    regex[1 /* Dynamic */] = function () {
        return "([^/]+)";
    };
    regex[2 /* Star */] = function () {
        return "(.+)";
    };
    regex[4 /* Epsilon */] = function () {
        return "";
    };
    var generate = [];
    generate[0 /* Static */] = function (segment) {
        return segment.value;
    };
    generate[1 /* Dynamic */] = function (segment, params) {
        var value = getParam(params, segment.value);
        if (RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS) {
            return encodePathSegment(value);
        } else {
            return value;
        }
    };
    generate[2 /* Star */] = function (segment, params) {
        return getParam(params, segment.value);
    };
    generate[4 /* Epsilon */] = function () {
        return "";
    };
    var EmptyObject = Object.freeze({});
    var EmptyArray = Object.freeze([]);
    // The `names` will be populated with the paramter name for each dynamic/star
    // segment. `shouldDecodes` will be populated with a boolean for each dyanamic/star
    // segment, indicating whether it should be decoded during recognition.
    function parse(segments, route, types) {
        // normalize route as not starting with a "/". Recognition will
        // also normalize.
        if (route.length > 0 && route.charCodeAt(0) === 47 /* SLASH */) {
                route = route.substr(1);
            }
        var parts = route.split("/");
        var names = undefined;
        var shouldDecodes = undefined;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var flags = 0;
            var type = 0;
            if (part === "") {
                type = 4 /* Epsilon */;
            } else if (part.charCodeAt(0) === 58 /* COLON */) {
                    type = 1 /* Dynamic */;
                } else if (part.charCodeAt(0) === 42 /* STAR */) {
                    type = 2 /* Star */;
                } else {
                type = 0 /* Static */;
            }
            flags = 2 << type;
            if (flags & 12 /* Named */) {
                    part = part.slice(1);
                    names = names || [];
                    names.push(part);
                    shouldDecodes = shouldDecodes || [];
                    shouldDecodes.push((flags & 4 /* Decoded */) !== 0);
                }
            if (flags & 14 /* Counted */) {
                    types[type]++;
                }
            segments.push({
                type: type,
                value: normalizeSegment(part)
            });
        }
        return {
            names: names || EmptyArray,
            shouldDecodes: shouldDecodes || EmptyArray
        };
    }
    function isEqualCharSpec(spec, char, negate) {
        return spec.char === char && spec.negate === negate;
    }
    // A State has a character specification and (`charSpec`) and a list of possible
    // subsequent states (`nextStates`).
    //
    // If a State is an accepting state, it will also have several additional
    // properties:
    //
    // * `regex`: A regular expression that is used to extract parameters from paths
    //   that reached this accepting state.
    // * `handlers`: Information on how to convert the list of captures into calls
    //   to registered handlers with the specified parameters
    // * `types`: How many static, dynamic or star segments in this route. Used to
    //   decide which route to use if multiple registered routes match a path.
    //
    // Currently, State is implemented naively by looping over `nextStates` and
    // comparing a character specification against a character. A more efficient
    // implementation would use a hash of keys pointing at one or more next states.
    var State = function State(states, id, char, negate, repeat) {
        this.states = states;
        this.id = id;
        this.char = char;
        this.negate = negate;
        this.nextStates = repeat ? id : null;
        this.pattern = "";
        this._regex = undefined;
        this.handlers = undefined;
        this.types = undefined;
    };
    State.prototype.regex = function regex$1() {
        if (!this._regex) {
            this._regex = new RegExp(this.pattern);
        }
        return this._regex;
    };
    State.prototype.get = function get(char, negate) {
        var this$1 = this;

        var nextStates = this.nextStates;
        if (nextStates === null) {
            return;
        }
        if (isArray(nextStates)) {
            for (var i = 0; i < nextStates.length; i++) {
                var child = this$1.states[nextStates[i]];
                if (isEqualCharSpec(child, char, negate)) {
                    return child;
                }
            }
        } else {
            var child$1 = this.states[nextStates];
            if (isEqualCharSpec(child$1, char, negate)) {
                return child$1;
            }
        }
    };
    State.prototype.put = function put(char, negate, repeat) {
        var state;
        // If the character specification already exists in a child of the current
        // state, just return that state.
        if (state = this.get(char, negate)) {
            return state;
        }
        // Make a new state for the character spec
        var states = this.states;
        state = new State(states, states.length, char, negate, repeat);
        states[states.length] = state;
        // Insert the new state as a child of the current state
        if (this.nextStates == null) {
            this.nextStates = state.id;
        } else if (isArray(this.nextStates)) {
            this.nextStates.push(state.id);
        } else {
            this.nextStates = [this.nextStates, state.id];
        }
        // Return the new state
        return state;
    };
    // Find a list of child states matching the next character
    State.prototype.match = function match(ch) {
        var this$1 = this;

        var nextStates = this.nextStates;
        if (!nextStates) {
            return [];
        }
        var returned = [];
        if (isArray(nextStates)) {
            for (var i = 0; i < nextStates.length; i++) {
                var child = this$1.states[nextStates[i]];
                if (isMatch(child, ch)) {
                    returned.push(child);
                }
            }
        } else {
            var child$1 = this.states[nextStates];
            if (isMatch(child$1, ch)) {
                returned.push(child$1);
            }
        }
        return returned;
    };
    function isMatch(spec, char) {
        return spec.negate ? spec.char !== char && spec.char !== -1 /* ANY */ : spec.char === char || spec.char === -1 /* ANY */;
    }
    // This is a somewhat naive strategy, but should work in a lot of cases
    // A better strategy would properly resolve /posts/:id/new and /posts/edit/:id.
    //
    // This strategy generally prefers more static and less dynamic matching.
    // Specifically, it
    //
    //  * prefers fewer stars to more, then
    //  * prefers using stars for less of the match to more, then
    //  * prefers fewer dynamic segments to more, then
    //  * prefers more static segments to more
    function sortSolutions(states) {
        return states.sort(function (a, b) {
            var ref = a.types || [0, 0, 0];
            var astatics = ref[0];
            var adynamics = ref[1];
            var astars = ref[2];
            var ref$1 = b.types || [0, 0, 0];
            var bstatics = ref$1[0];
            var bdynamics = ref$1[1];
            var bstars = ref$1[2];
            if (astars !== bstars) {
                return astars - bstars;
            }
            if (astars) {
                if (astatics !== bstatics) {
                    return bstatics - astatics;
                }
                if (adynamics !== bdynamics) {
                    return bdynamics - adynamics;
                }
            }
            if (adynamics !== bdynamics) {
                return adynamics - bdynamics;
            }
            if (astatics !== bstatics) {
                return bstatics - astatics;
            }
            return 0;
        });
    }
    function recognizeChar(states, ch) {
        var nextStates = [];
        for (var i = 0, l = states.length; i < l; i++) {
            var state = states[i];
            nextStates = nextStates.concat(state.match(ch));
        }
        return nextStates;
    }
    var RecognizeResults = function RecognizeResults(queryParams) {
        this.length = 0;
        this.queryParams = queryParams || {};
    };

    RecognizeResults.prototype.splice = Array.prototype.splice;
    RecognizeResults.prototype.slice = Array.prototype.slice;
    RecognizeResults.prototype.push = Array.prototype.push;
    function findHandler(state, originalPath, queryParams) {
        var handlers = state.handlers;
        var regex = state.regex();
        if (!regex || !handlers) {
            throw new Error("state not initialized");
        }
        var captures = originalPath.match(regex);
        var currentCapture = 1;
        var result = new RecognizeResults(queryParams);
        result.length = handlers.length;
        for (var i = 0; i < handlers.length; i++) {
            var handler = handlers[i];
            var names = handler.names;
            var shouldDecodes = handler.shouldDecodes;
            var params = EmptyObject;
            var isDynamic = false;
            if (names !== EmptyArray && shouldDecodes !== EmptyArray) {
                for (var j = 0; j < names.length; j++) {
                    isDynamic = true;
                    var name = names[j];
                    var capture = captures && captures[currentCapture++];
                    if (params === EmptyObject) {
                        params = {};
                    }
                    if (RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS && shouldDecodes[j]) {
                        params[name] = capture && decodeURIComponent(capture);
                    } else {
                        params[name] = capture;
                    }
                }
            }
            result[i] = {
                handler: handler.handler,
                params: params,
                isDynamic: isDynamic
            };
        }
        return result;
    }
    function decodeQueryParamPart(part) {
        // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
        part = part.replace(/\+/gm, "%20");
        var result;
        try {
            result = decodeURIComponent(part);
        } catch (error) {
            result = "";
        }
        return result;
    }
    var RouteRecognizer = function RouteRecognizer() {
        this.names = createMap();
        var states = [];
        var state = new State(states, 0, -1 /* ANY */, true, false);
        states[0] = state;
        this.states = states;
        this.rootState = state;
    };
    RouteRecognizer.prototype.add = function add(routes, options) {
        var currentState = this.rootState;
        var pattern = "^";
        var types = [0, 0, 0];
        var handlers = new Array(routes.length);
        var allSegments = [];
        var isEmpty = true;
        var j = 0;
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var ref = parse(allSegments, route.path, types);
            var names = ref.names;
            var shouldDecodes = ref.shouldDecodes;
            // preserve j so it points to the start of newly added segments
            for (; j < allSegments.length; j++) {
                var segment = allSegments[j];
                if (segment.type === 4 /* Epsilon */) {
                        continue;
                    }
                isEmpty = false;
                // Add a "/" for the new segment
                currentState = currentState.put(47 /* SLASH */, false, false);
                pattern += "/";
                // Add a representation of the segment to the NFA and regex
                currentState = eachChar[segment.type](segment, currentState);
                pattern += regex[segment.type](segment);
            }
            handlers[i] = {
                handler: route.handler,
                names: names,
                shouldDecodes: shouldDecodes
            };
        }
        if (isEmpty) {
            currentState = currentState.put(47 /* SLASH */, false, false);
            pattern += "/";
        }
        currentState.handlers = handlers;
        currentState.pattern = pattern + "$";
        currentState.types = types;
        var name;
        if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object" && options !== null && options.as) {
            name = options.as;
        }
        if (name) {
            // if (this.names[name]) {
            //   throw new Error("You may not add a duplicate route named `" + name + "`.");
            // }
            this.names[name] = {
                segments: allSegments,
                handlers: handlers
            };
        }
    };
    RouteRecognizer.prototype.handlersFor = function handlersFor(name) {
        var route = this.names[name];
        if (!route) {
            throw new Error("There is no route named " + name);
        }
        var result = new Array(route.handlers.length);
        for (var i = 0; i < route.handlers.length; i++) {
            var handler = route.handlers[i];
            result[i] = handler;
        }
        return result;
    };
    RouteRecognizer.prototype.hasRoute = function hasRoute(name) {
        return !!this.names[name];
    };
    RouteRecognizer.prototype.generate = function generate$1(name, params) {
        var route = this.names[name];
        var output = "";
        if (!route) {
            throw new Error("There is no route named " + name);
        }
        var segments = route.segments;
        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            if (segment.type === 4 /* Epsilon */) {
                    continue;
                }
            output += "/";
            output += generate[segment.type](segment, params);
        }
        if (output.charAt(0) !== "/") {
            output = "/" + output;
        }
        if (params && params.queryParams) {
            output += this.generateQueryString(params.queryParams);
        }
        return output;
    };
    RouteRecognizer.prototype.generateQueryString = function generateQueryString(params) {
        var pairs = [];
        var keys = Object.keys(params);
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = params[key];
            if (value == null) {
                continue;
            }
            var pair = encodeURIComponent(key);
            if (isArray(value)) {
                for (var j = 0; j < value.length; j++) {
                    var arrayPair = key + "[]" + "=" + encodeURIComponent(value[j]);
                    pairs.push(arrayPair);
                }
            } else {
                pair += "=" + encodeURIComponent(value);
                pairs.push(pair);
            }
        }
        if (pairs.length === 0) {
            return "";
        }
        return "?" + pairs.join("&");
    };
    RouteRecognizer.prototype.parseQueryString = function parseQueryString(queryString) {
        var pairs = queryString.split("&");
        var queryParams = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("="),
                key = decodeQueryParamPart(pair[0]),
                keyLength = key.length,
                isArray = false,
                value = void 0;
            if (pair.length === 1) {
                value = "true";
            } else {
                // Handle arrays
                if (keyLength > 2 && key.slice(keyLength - 2) === "[]") {
                    isArray = true;
                    key = key.slice(0, keyLength - 2);
                    if (!queryParams[key]) {
                        queryParams[key] = [];
                    }
                }
                value = pair[1] ? decodeQueryParamPart(pair[1]) : "";
            }
            if (isArray) {
                queryParams[key].push(value);
            } else {
                queryParams[key] = value;
            }
        }
        return queryParams;
    };
    RouteRecognizer.prototype.recognize = function recognize(path) {
        var results;
        var states = [this.rootState];
        var queryParams = {};
        var isSlashDropped = false;
        var hashStart = path.indexOf("#");
        if (hashStart !== -1) {
            path = path.substr(0, hashStart);
        }
        var queryStart = path.indexOf("?");
        if (queryStart !== -1) {
            var queryString = path.substr(queryStart + 1, path.length);
            path = path.substr(0, queryStart);
            queryParams = this.parseQueryString(queryString);
        }
        if (path.charAt(0) !== "/") {
            path = "/" + path;
        }
        var originalPath = path;
        if (RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS) {
            path = normalizePath(path);
        } else {
            path = decodeURI(path);
            originalPath = decodeURI(originalPath);
        }
        var pathLen = path.length;
        if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
            path = path.substr(0, pathLen - 1);
            originalPath = originalPath.substr(0, originalPath.length - 1);
            isSlashDropped = true;
        }
        for (var i = 0; i < path.length; i++) {
            states = recognizeChar(states, path.charCodeAt(i));
            if (!states.length) {
                break;
            }
        }
        var solutions = [];
        for (var i$1 = 0; i$1 < states.length; i$1++) {
            if (states[i$1].handlers) {
                solutions.push(states[i$1]);
            }
        }
        states = sortSolutions(solutions);
        var state = solutions[0];
        if (state && state.handlers) {
            // if a trailing slash was dropped and a star segment is the last segment
            // specified, put the trailing slash back
            if (isSlashDropped && state.pattern && state.pattern.slice(-5) === "(.+)$") {
                originalPath = originalPath + "/";
            }
            results = findHandler(state, originalPath, queryParams);
        }
        return results;
    };
    RouteRecognizer.VERSION = "0.3.4";
    // Set to false to opt-out of encoding and decoding path segments.
    // See https://github.com/tildeio/route-recognizer/pull/55
    RouteRecognizer.ENCODE_AND_DECODE_PATH_SEGMENTS = true;
    RouteRecognizer.Normalizer = {
        normalizeSegment: normalizeSegment, normalizePath: normalizePath, encodePathSegment: encodePathSegment
    };
    RouteRecognizer.prototype.map = map;

    exports.default = RouteRecognizer;
});
define('rsvp', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  /*!
   * @overview RSVP - a tiny implementation of Promises/A+.
   * @copyright Copyright (c) 2016 Yehuda Katz, Tom Dale, Stefan Penner and contributors
   * @license   Licensed under MIT license
   *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
   * @version   4.8.4+ff10049b
   */

  function callbacksFor(object) {
    var callbacks = object._promiseCallbacks;

    if (!callbacks) {
      callbacks = object._promiseCallbacks = {};
    }

    return callbacks;
  }

  /**
    @class EventTarget
    @for rsvp
    @public
  */
  var EventTarget = {

    /**
      `EventTarget.mixin` extends an object with EventTarget methods. For
      Example:
       ```javascript
      import EventTarget from 'rsvp';
       let object = {};
       EventTarget.mixin(object);
       object.on('finished', function(event) {
        // handle event
      });
       object.trigger('finished', { detail: value });
      ```
       `EventTarget.mixin` also works with prototypes:
       ```javascript
      import EventTarget from 'rsvp';
       let Person = function() {};
      EventTarget.mixin(Person.prototype);
       let yehuda = new Person();
      let tom = new Person();
       yehuda.on('poke', function(event) {
        console.log('Yehuda says OW');
      });
       tom.on('poke', function(event) {
        console.log('Tom says OW');
      });
       yehuda.trigger('poke');
      tom.trigger('poke');
      ```
       @method mixin
      @for rsvp
      @private
      @param {Object} object object to extend with EventTarget methods
    */
    mixin: function mixin(object) {
      object.on = this.on;
      object.off = this.off;
      object.trigger = this.trigger;
      object._promiseCallbacks = undefined;
      return object;
    },

    /**
      Registers a callback to be executed when `eventName` is triggered
       ```javascript
      object.on('event', function(eventInfo){
        // handle the event
      });
       object.trigger('event');
      ```
       @method on
      @for EventTarget
      @private
      @param {String} eventName name of the event to listen for
      @param {Function} callback function to be called when the event is triggered.
    */
    on: function on(eventName, callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
      }

      var allCallbacks = callbacksFor(this);
      var callbacks = allCallbacks[eventName];

      if (!callbacks) {
        callbacks = allCallbacks[eventName] = [];
      }

      if (callbacks.indexOf(callback) === -1) {
        callbacks.push(callback);
      }
    },

    /**
      You can use `off` to stop firing a particular callback for an event:
       ```javascript
      function doStuff() { // do stuff! }
      object.on('stuff', doStuff);
       object.trigger('stuff'); // doStuff will be called
       // Unregister ONLY the doStuff callback
      object.off('stuff', doStuff);
      object.trigger('stuff'); // doStuff will NOT be called
      ```
       If you don't pass a `callback` argument to `off`, ALL callbacks for the
      event will not be executed when the event fires. For example:
       ```javascript
      let callback1 = function(){};
      let callback2 = function(){};
       object.on('stuff', callback1);
      object.on('stuff', callback2);
       object.trigger('stuff'); // callback1 and callback2 will be executed.
       object.off('stuff');
      object.trigger('stuff'); // callback1 and callback2 will not be executed!
      ```
       @method off
      @for rsvp
      @private
      @param {String} eventName event to stop listening to
      @param {Function} [callback] optional argument. If given, only the function
      given will be removed from the event's callback queue. If no `callback`
      argument is given, all callbacks will be removed from the event's callback
      queue.
    */
    off: function off(eventName, callback) {
      var allCallbacks = callbacksFor(this);

      if (!callback) {
        allCallbacks[eventName] = [];
        return;
      }

      var callbacks = allCallbacks[eventName];
      var index = callbacks.indexOf(callback);

      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    },

    /**
      Use `trigger` to fire custom events. For example:
       ```javascript
      object.on('foo', function(){
        console.log('foo event happened!');
      });
      object.trigger('foo');
      // 'foo event happened!' logged to the console
      ```
       You can also pass a value as a second argument to `trigger` that will be
      passed as an argument to all event listeners for the event:
       ```javascript
      object.on('foo', function(value){
        console.log(value.name);
      });
       object.trigger('foo', { name: 'bar' });
      // 'bar' logged to the console
      ```
       @method trigger
      @for rsvp
      @private
      @param {String} eventName name of the event to be triggered
      @param {*} [options] optional value to be passed to any event handlers for
      the given `eventName`
    */
    trigger: function trigger(eventName, options, label) {
      var allCallbacks = callbacksFor(this);

      var callbacks = allCallbacks[eventName];
      if (callbacks) {
        // Don't cache the callbacks.length since it may grow
        var callback = void 0;
        for (var i = 0; i < callbacks.length; i++) {
          callback = callbacks[i];
          callback(options, label);
        }
      }
    }
  };

  var config = {
    instrument: false
  };

  EventTarget['mixin'](config);

  function configure(name, value) {
    if (arguments.length === 2) {
      config[name] = value;
    } else {
      return config[name];
    }
  }

  var queue = [];

  function scheduleFlush() {
    setTimeout(function () {
      for (var i = 0; i < queue.length; i++) {
        var entry = queue[i];

        var payload = entry.payload;

        payload.guid = payload.key + payload.id;
        payload.childGuid = payload.key + payload.childId;
        if (payload.error) {
          payload.stack = payload.error.stack;
        }

        config['trigger'](entry.name, entry.payload);
      }
      queue.length = 0;
    }, 50);
  }

  function instrument(eventName, promise, child) {
    if (1 === queue.push({
      name: eventName,
      payload: {
        key: promise._guidKey,
        id: promise._id,
        eventName: eventName,
        detail: promise._result,
        childId: child && child._id,
        label: promise._label,
        timeStamp: Date.now(),
        error: config["instrument-with-stack"] ? new Error(promise._label) : null
      } })) {
      scheduleFlush();
    }
  }

  /**
    `Promise.resolve` returns a promise that will become resolved with the
    passed `value`. It is shorthand for the following:
  
    ```javascript
    import Promise from 'rsvp';
  
    let promise = new Promise(function(resolve, reject){
      resolve(1);
    });
  
    promise.then(function(value){
      // value === 1
    });
    ```
  
    Instead of writing the above, your code now simply becomes the following:
  
    ```javascript
    import Promise from 'rsvp';
  
    let promise = RSVP.Promise.resolve(1);
  
    promise.then(function(value){
      // value === 1
    });
    ```
  
    @method resolve
    @for Promise
    @static
    @param {*} object value that the returned promise will be resolved with
    @param {String} [label] optional string for identifying the returned promise.
    Useful for tooling.
    @return {Promise} a promise that will become fulfilled with the given
    `value`
  */
  function resolve$$1(object, label) {
    /*jshint validthis:true */
    var Constructor = this;

    if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
      return object;
    }

    var promise = new Constructor(noop, label);
    resolve$1(promise, object);
    return promise;
  }

  function withOwnPromise() {
    return new TypeError('A promises callback cannot return that same promise.');
  }

  function objectOrFunction(x) {
    var type = typeof x === 'undefined' ? 'undefined' : _typeof(x);
    return x !== null && (type === 'object' || type === 'function');
  }

  function noop() {}

  var PENDING = void 0;
  var FULFILLED = 1;
  var REJECTED = 2;

  var TRY_CATCH_ERROR = { error: null };

  function getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      TRY_CATCH_ERROR.error = error;
      return TRY_CATCH_ERROR;
    }
  }

  var tryCatchCallback = void 0;
  function tryCatcher() {
    try {
      var target = tryCatchCallback;
      tryCatchCallback = null;
      return target.apply(this, arguments);
    } catch (e) {
      TRY_CATCH_ERROR.error = e;
      return TRY_CATCH_ERROR;
    }
  }

  function tryCatch(fn) {
    tryCatchCallback = fn;
    return tryCatcher;
  }

  function handleForeignThenable(promise, thenable, then$$1) {
    config.async(function (promise) {
      var sealed = false;
      var result = tryCatch(then$$1).call(thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable === value) {
          fulfill(promise, value);
        } else {
          resolve$1(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;

        reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));

      if (!sealed && result === TRY_CATCH_ERROR) {
        sealed = true;
        var error = TRY_CATCH_ERROR.error;
        TRY_CATCH_ERROR.error = null;
        reject(promise, error);
      }
    }, promise);
  }

  function handleOwnThenable(promise, thenable) {
    if (thenable._state === FULFILLED) {
      fulfill(promise, thenable._result);
    } else if (thenable._state === REJECTED) {
      thenable._onError = null;
      reject(promise, thenable._result);
    } else {
      subscribe(thenable, undefined, function (value) {
        if (thenable === value) {
          fulfill(promise, value);
        } else {
          resolve$1(promise, value);
        }
      }, function (reason) {
        return reject(promise, reason);
      });
    }
  }

  function handleMaybeThenable(promise, maybeThenable, then$$1) {
    var isOwnThenable = maybeThenable.constructor === promise.constructor && then$$1 === then && promise.constructor.resolve === resolve$$1;

    if (isOwnThenable) {
      handleOwnThenable(promise, maybeThenable);
    } else if (then$$1 === TRY_CATCH_ERROR) {
      var error = TRY_CATCH_ERROR.error;
      TRY_CATCH_ERROR.error = null;
      reject(promise, error);
    } else if (typeof then$$1 === 'function') {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }

  function resolve$1(promise, value) {
    if (promise === value) {
      fulfill(promise, value);
    } else if (objectOrFunction(value)) {
      handleMaybeThenable(promise, value, getThen(value));
    } else {
      fulfill(promise, value);
    }
  }

  function publishRejection(promise) {
    if (promise._onError) {
      promise._onError(promise._result);
    }

    publish(promise);
  }

  function fulfill(promise, value) {
    if (promise._state !== PENDING) {
      return;
    }

    promise._result = value;
    promise._state = FULFILLED;

    if (promise._subscribers.length === 0) {
      if (config.instrument) {
        instrument('fulfilled', promise);
      }
    } else {
      config.async(publish, promise);
    }
  }

  function reject(promise, reason) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._state = REJECTED;
    promise._result = reason;
    config.async(publishRejection, promise);
  }

  function subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;

    parent._onError = null;

    subscribers[length] = child;
    subscribers[length + FULFILLED] = onFulfillment;
    subscribers[length + REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      config.async(publish, parent);
    }
  }

  function publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;

    if (config.instrument) {
      instrument(settled === FULFILLED ? 'fulfilled' : 'rejected', promise);
    }

    if (subscribers.length === 0) {
      return;
    }

    var child = void 0,
        callback = void 0,
        result = promise._result;

    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];

      if (child) {
        invokeCallback(settled, child, callback, result);
      } else {
        callback(result);
      }
    }

    promise._subscribers.length = 0;
  }

  function invokeCallback(state, promise, callback, result) {
    var hasCallback = typeof callback === 'function';
    var value = void 0;

    if (hasCallback) {
      value = tryCatch(callback)(result);
    } else {
      value = result;
    }

    if (promise._state !== PENDING) {
      // noop
    } else if (value === promise) {
      reject(promise, withOwnPromise());
    } else if (value === TRY_CATCH_ERROR) {
      var error = TRY_CATCH_ERROR.error;
      TRY_CATCH_ERROR.error = null; // release
      reject(promise, error);
    } else if (hasCallback) {
      resolve$1(promise, value);
    } else if (state === FULFILLED) {
      fulfill(promise, value);
    } else if (state === REJECTED) {
      reject(promise, value);
    }
  }

  function initializePromise(promise, resolver) {
    var resolved = false;
    try {
      resolver(function (value) {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve$1(promise, value);
      }, function (reason) {
        if (resolved) {
          return;
        }
        resolved = true;
        reject(promise, reason);
      });
    } catch (e) {
      reject(promise, e);
    }
  }

  function then(onFulfillment, onRejection, label) {
    var parent = this;
    var state = parent._state;

    if (state === FULFILLED && !onFulfillment || state === REJECTED && !onRejection) {
      config.instrument && instrument('chained', parent, parent);
      return parent;
    }

    parent._onError = null;

    var child = new parent.constructor(noop, label);
    var result = parent._result;

    config.instrument && instrument('chained', parent, child);

    if (state === PENDING) {
      subscribe(parent, child, onFulfillment, onRejection);
    } else {
      var callback = state === FULFILLED ? onFulfillment : onRejection;
      config.async(function () {
        return invokeCallback(state, child, callback, result);
      });
    }

    return child;
  }

  var Enumerator = function () {
    function Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(noop, label);
      this._abortOnReject = abortOnReject;
      this._isUsingOwnPromise = Constructor === Promise;
      this._isUsingOwnResolve = Constructor.resolve === resolve$$1;

      this._init.apply(this, arguments);
    }

    Enumerator.prototype._init = function _init(Constructor, input) {
      var len = input.length || 0;
      this.length = len;
      this._remaining = len;
      this._result = new Array(len);

      this._enumerate(input);
    };

    Enumerator.prototype._enumerate = function _enumerate(input) {
      var length = this.length;
      var promise = this.promise;

      for (var i = 0; promise._state === PENDING && i < length; i++) {
        this._eachEntry(input[i], i, true);
      }
      this._checkFullfillment();
    };

    Enumerator.prototype._checkFullfillment = function _checkFullfillment() {
      if (this._remaining === 0) {
        var result = this._result;
        fulfill(this.promise, result);
        this._result = null;
      }
    };

    Enumerator.prototype._settleMaybeThenable = function _settleMaybeThenable(entry, i, firstPass) {
      var c = this._instanceConstructor;

      if (this._isUsingOwnResolve) {
        var then$$1 = getThen(entry);

        if (then$$1 === then && entry._state !== PENDING) {
          entry._onError = null;
          this._settledAt(entry._state, i, entry._result, firstPass);
        } else if (typeof then$$1 !== 'function') {
          this._settledAt(FULFILLED, i, entry, firstPass);
        } else if (this._isUsingOwnPromise) {
          var promise = new c(noop);
          handleMaybeThenable(promise, entry, then$$1);
          this._willSettleAt(promise, i, firstPass);
        } else {
          this._willSettleAt(new c(function (resolve) {
            return resolve(entry);
          }), i, firstPass);
        }
      } else {
        this._willSettleAt(c.resolve(entry), i, firstPass);
      }
    };

    Enumerator.prototype._eachEntry = function _eachEntry(entry, i, firstPass) {
      if (entry !== null && (typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) === 'object') {
        this._settleMaybeThenable(entry, i, firstPass);
      } else {
        this._setResultAt(FULFILLED, i, entry, firstPass);
      }
    };

    Enumerator.prototype._settledAt = function _settledAt(state, i, value, firstPass) {
      var promise = this.promise;

      if (promise._state === PENDING) {
        if (this._abortOnReject && state === REJECTED) {
          reject(promise, value);
        } else {
          this._setResultAt(state, i, value, firstPass);
          this._checkFullfillment();
        }
      }
    };

    Enumerator.prototype._setResultAt = function _setResultAt(state, i, value, firstPass) {
      this._remaining--;
      this._result[i] = value;
    };

    Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i, firstPass) {
      var _this = this;

      subscribe(promise, undefined, function (value) {
        return _this._settledAt(FULFILLED, i, value, firstPass);
      }, function (reason) {
        return _this._settledAt(REJECTED, i, reason, firstPass);
      });
    };

    return Enumerator;
  }();

  function setSettledResult(state, i, value) {
    this._remaining--;
    if (state === FULFILLED) {
      this._result[i] = {
        state: 'fulfilled',
        value: value
      };
    } else {
      this._result[i] = {
        state: 'rejected',
        reason: value
      };
    }
  }

  /**
    `Promise.all` accepts an array of promises, and returns a new promise which
    is fulfilled with an array of fulfillment values for the passed promises, or
    rejected with the reason of the first passed promise to be rejected. It casts all
    elements of the passed iterable to promises as it runs this algorithm.
  
    Example:
  
    ```javascript
    import Promise, { resolve } from 'rsvp';
  
    let promise1 = resolve(1);
    let promise2 = resolve(2);
    let promise3 = resolve(3);
    let promises = [ promise1, promise2, promise3 ];
  
    Promise.all(promises).then(function(array){
      // The array here would be [ 1, 2, 3 ];
    });
    ```
  
    If any of the `promises` given to `RSVP.all` are rejected, the first promise
    that is rejected will be given as an argument to the returned promises's
    rejection handler. For example:
  
    Example:
  
    ```javascript
    import Promise, { resolve, reject } from 'rsvp';
  
    let promise1 = resolve(1);
    let promise2 = reject(new Error("2"));
    let promise3 = reject(new Error("3"));
    let promises = [ promise1, promise2, promise3 ];
  
    Promise.all(promises).then(function(array){
      // Code here never runs because there are rejected promises!
    }, function(error) {
      // error.message === "2"
    });
    ```
  
    @method all
    @for Promise
    @param {Array} entries array of promises
    @param {String} [label] optional string for labeling the promise.
    Useful for tooling.
    @return {Promise} promise that is fulfilled when all `promises` have been
    fulfilled, or rejected if any of them become rejected.
    @static
  */
  function all(entries, label) {
    if (!Array.isArray(entries)) {
      return this.reject(new TypeError("Promise.all must be called with an array"), label);
    }
    return new Enumerator(this, entries, true /* abort on reject */, label).promise;
  }

  /**
    `Promise.race` returns a new promise which is settled in the same way as the
    first passed promise to settle.
  
    Example:
  
    ```javascript
    import Promise from 'rsvp';
  
    let promise1 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 1');
      }, 200);
    });
  
    let promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 2');
      }, 100);
    });
  
    Promise.race([promise1, promise2]).then(function(result){
      // result === 'promise 2' because it was resolved before promise1
      // was resolved.
    });
    ```
  
    `Promise.race` is deterministic in that only the state of the first
    settled promise matters. For example, even if other promises given to the
    `promises` array argument are resolved, but the first settled promise has
    become rejected before the other promises became fulfilled, the returned
    promise will become rejected:
  
    ```javascript
    import Promise from 'rsvp';
  
    let promise1 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 1');
      }, 200);
    });
  
    let promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        reject(new Error('promise 2'));
      }, 100);
    });
  
    Promise.race([promise1, promise2]).then(function(result){
      // Code here never runs
    }, function(reason){
      // reason.message === 'promise 2' because promise 2 became rejected before
      // promise 1 became fulfilled
    });
    ```
  
    An example real-world use case is implementing timeouts:
  
    ```javascript
    import Promise from 'rsvp';
  
    Promise.race([ajax('foo.json'), timeout(5000)])
    ```
  
    @method race
    @for Promise
    @static
    @param {Array} entries array of promises to observe
    @param {String} [label] optional string for describing the promise returned.
    Useful for tooling.
    @return {Promise} a promise which settles in the same way as the first passed
    promise to settle.
  */
  function race(entries, label) {
    /*jshint validthis:true */
    var Constructor = this;

    var promise = new Constructor(noop, label);

    if (!Array.isArray(entries)) {
      reject(promise, new TypeError('Promise.race must be called with an array'));
      return promise;
    }

    for (var i = 0; promise._state === PENDING && i < entries.length; i++) {
      subscribe(Constructor.resolve(entries[i]), undefined, function (value) {
        return resolve$1(promise, value);
      }, function (reason) {
        return reject(promise, reason);
      });
    }

    return promise;
  }

  /**
    `Promise.reject` returns a promise rejected with the passed `reason`.
    It is shorthand for the following:
  
    ```javascript
    import Promise from 'rsvp';
  
    let promise = new Promise(function(resolve, reject){
      reject(new Error('WHOOPS'));
    });
  
    promise.then(function(value){
      // Code here doesn't run because the promise is rejected!
    }, function(reason){
      // reason.message === 'WHOOPS'
    });
    ```
  
    Instead of writing the above, your code now simply becomes the following:
  
    ```javascript
    import Promise from 'rsvp';
  
    let promise = Promise.reject(new Error('WHOOPS'));
  
    promise.then(function(value){
      // Code here doesn't run because the promise is rejected!
    }, function(reason){
      // reason.message === 'WHOOPS'
    });
    ```
  
    @method reject
    @for Promise
    @static
    @param {*} reason value that the returned promise will be rejected with.
    @param {String} [label] optional string for identifying the returned promise.
    Useful for tooling.
    @return {Promise} a promise rejected with the given `reason`.
  */
  function reject$1(reason, label) {
    /*jshint validthis:true */
    var Constructor = this;
    var promise = new Constructor(noop, label);
    reject(promise, reason);
    return promise;
  }

  var guidKey = 'rsvp_' + Date.now() + '-';
  var counter = 0;

  function needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  /**
    Promise objects represent the eventual result of an asynchronous operation. The
    primary way of interacting with a promise is through its `then` method, which
    registers callbacks to receive either a promise’s eventual value or the reason
    why the promise cannot be fulfilled.
  
    Terminology
    -----------
  
    - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
    - `thenable` is an object or function that defines a `then` method.
    - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
    - `exception` is a value that is thrown using the throw statement.
    - `reason` is a value that indicates why a promise was rejected.
    - `settled` the final resting state of a promise, fulfilled or rejected.
  
    A promise can be in one of three states: pending, fulfilled, or rejected.
  
    Promises that are fulfilled have a fulfillment value and are in the fulfilled
    state.  Promises that are rejected have a rejection reason and are in the
    rejected state.  A fulfillment value is never a thenable.
  
    Promises can also be said to *resolve* a value.  If this value is also a
    promise, then the original promise's settled state will match the value's
    settled state.  So a promise that *resolves* a promise that rejects will
    itself reject, and a promise that *resolves* a promise that fulfills will
    itself fulfill.
  
  
    Basic Usage:
    ------------
  
    ```js
    let promise = new Promise(function(resolve, reject) {
      // on success
      resolve(value);
  
      // on failure
      reject(reason);
    });
  
    promise.then(function(value) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
  
    Advanced Usage:
    ---------------
  
    Promises shine when abstracting away asynchronous interactions such as
    `XMLHttpRequest`s.
  
    ```js
    function getJSON(url) {
      return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
  
        xhr.open('GET', url);
        xhr.onreadystatechange = handler;
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
  
        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              resolve(this.response);
            } else {
              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
            }
          }
        };
      });
    }
  
    getJSON('/posts.json').then(function(json) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
  
    Unlike callbacks, promises are great composable primitives.
  
    ```js
    Promise.all([
      getJSON('/posts'),
      getJSON('/comments')
    ]).then(function(values){
      values[0] // => postsJSON
      values[1] // => commentsJSON
  
      return values;
    });
    ```
  
    @class Promise
    @public
    @param {function} resolver
    @param {String} [label] optional string for labeling the promise.
    Useful for tooling.
    @constructor
  */

  var Promise = function () {
    function Promise(resolver, label) {
      this._id = counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      config.instrument && instrument('created', this);

      if (noop !== resolver) {
        typeof resolver !== 'function' && needsResolver();
        this instanceof Promise ? initializePromise(this, resolver) : needsNew();
      }
    }

    Promise.prototype._onError = function _onError(reason) {
      var _this = this;

      config.after(function () {
        if (_this._onError) {
          config.trigger('error', reason, _this._label);
        }
      });
    };

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
    
      ```js
      function findAuthor(){
        throw new Error('couldn\'t find that author');
      }
    
      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }
    
      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```
    
      @method catch
      @param {Function} onRejection
      @param {String} [label] optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */

    Promise.prototype.catch = function _catch(onRejection, label) {
      return this.then(undefined, onRejection, label);
    };

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves
    
      Synchronous example:
    
      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }
    
      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuthor();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```
    
      Asynchronous example:
    
      ```js
      findAuthor().catch(function(reason){
        return findOtherAuthor();
      }).finally(function(){
        // author was either found, or not
      });
      ```
    
      @method finally
      @param {Function} callback
      @param {String} [label] optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */

    Promise.prototype.finally = function _finally(callback, label) {
      var promise = this;
      var constructor = promise.constructor;

      if (typeof callback === 'function') {
        return promise.then(function (value) {
          return constructor.resolve(callback()).then(function () {
            return value;
          });
        }, function (reason) {
          return constructor.resolve(callback()).then(function () {
            throw reason;
          });
        });
      }

      return promise.then(callback, callback);
    };

    return Promise;
  }();

  Promise.cast = resolve$$1; // deprecated
  Promise.all = all;
  Promise.race = race;
  Promise.resolve = resolve$$1;
  Promise.reject = reject$1;

  Promise.prototype._guidKey = guidKey;

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we\'re unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we\'re unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfillment
    @param {Function} onRejection
    @param {String} [label] optional string for labeling the promise.
    Useful for tooling.
    @return {Promise}
  */
  Promise.prototype.then = then;

  function makeObject(_, argumentNames) {
    var obj = {};
    var length = _.length;
    var args = new Array(length);

    for (var x = 0; x < length; x++) {
      args[x] = _[x];
    }

    for (var i = 0; i < argumentNames.length; i++) {
      var name = argumentNames[i];
      obj[name] = args[i + 1];
    }

    return obj;
  }

  function arrayResult(_) {
    var length = _.length;
    var args = new Array(length - 1);

    for (var i = 1; i < length; i++) {
      args[i - 1] = _[i];
    }

    return args;
  }

  function wrapThenable(_then, promise) {
    return {
      then: function then(onFulFillment, onRejection) {
        return _then.call(promise, onFulFillment, onRejection);
      }
    };
  }

  /**
    `denodeify` takes a 'node-style' function and returns a function that
    will return an `Promise`. You can use `denodeify` in Node.js or the
    browser when you'd prefer to use promises over using callbacks. For example,
    `denodeify` transforms the following:
  
    ```javascript
    let fs = require('fs');
  
    fs.readFile('myfile.txt', function(err, data){
      if (err) return handleError(err);
      handleData(data);
    });
    ```
  
    into:
  
    ```javascript
    let fs = require('fs');
    let readFile = denodeify(fs.readFile);
  
    readFile('myfile.txt').then(handleData, handleError);
    ```
  
    If the node function has multiple success parameters, then `denodeify`
    just returns the first one:
  
    ```javascript
    let request = denodeify(require('request'));
  
    request('http://example.com').then(function(res) {
      // ...
    });
    ```
  
    However, if you need all success parameters, setting `denodeify`'s
    second parameter to `true` causes it to return all success parameters
    as an array:
  
    ```javascript
    let request = denodeify(require('request'), true);
  
    request('http://example.com').then(function(result) {
      // result[0] -> res
      // result[1] -> body
    });
    ```
  
    Or if you pass it an array with names it returns the parameters as a hash:
  
    ```javascript
    let request = denodeify(require('request'), ['res', 'body']);
  
    request('http://example.com').then(function(result) {
      // result.res
      // result.body
    });
    ```
  
    Sometimes you need to retain the `this`:
  
    ```javascript
    let app = require('express')();
    let render = denodeify(app.render.bind(app));
    ```
  
    The denodified function inherits from the original function. It works in all
    environments, except IE 10 and below. Consequently all properties of the original
    function are available to you. However, any properties you change on the
    denodeified function won't be changed on the original function. Example:
  
    ```javascript
    let request = denodeify(require('request')),
        cookieJar = request.jar(); // <- Inheritance is used here
  
    request('http://example.com', {jar: cookieJar}).then(function(res) {
      // cookieJar.cookies holds now the cookies returned by example.com
    });
    ```
  
    Using `denodeify` makes it easier to compose asynchronous operations instead
    of using callbacks. For example, instead of:
  
    ```javascript
    let fs = require('fs');
  
    fs.readFile('myfile.txt', function(err, data){
      if (err) { ... } // Handle error
      fs.writeFile('myfile2.txt', data, function(err){
        if (err) { ... } // Handle error
        console.log('done')
      });
    });
    ```
  
    you can chain the operations together using `then` from the returned promise:
  
    ```javascript
    let fs = require('fs');
    let readFile = denodeify(fs.readFile);
    let writeFile = denodeify(fs.writeFile);
  
    readFile('myfile.txt').then(function(data){
      return writeFile('myfile2.txt', data);
    }).then(function(){
      console.log('done')
    }).catch(function(error){
      // Handle error
    });
    ```
  
    @method denodeify
    @public
    @static
    @for rsvp
    @param {Function} nodeFunc a 'node-style' function that takes a callback as
    its last argument. The callback expects an error to be passed as its first
    argument (if an error occurred, otherwise null), and the value from the
    operation as its second argument ('function(err, value){ }').
    @param {Boolean|Array} [options] An optional paramter that if set
    to `true` causes the promise to fulfill with the callback's success arguments
    as an array. This is useful if the node function has multiple success
    paramters. If you set this paramter to an array with names, the promise will
    fulfill with a hash with these names as keys and the success parameters as
    values.
    @return {Function} a function that wraps `nodeFunc` to return a `Promise`
  */
  function denodeify(nodeFunc, options) {
    var fn = function fn() {
      var l = arguments.length;
      var args = new Array(l + 1);
      var promiseInput = false;

      for (var i = 0; i < l; ++i) {
        var arg = arguments[i];

        if (!promiseInput) {
          // TODO: clean this up
          promiseInput = needsPromiseInput(arg);
          if (promiseInput === TRY_CATCH_ERROR) {
            var error = TRY_CATCH_ERROR.error;
            TRY_CATCH_ERROR.error = null;
            var p = new Promise(noop);
            reject(p, error);
            return p;
          } else if (promiseInput && promiseInput !== true) {
            arg = wrapThenable(promiseInput, arg);
          }
        }
        args[i] = arg;
      }

      var promise = new Promise(noop);

      args[l] = function (err, val) {
        if (err) {
          reject(promise, err);
        } else if (options === undefined) {
          resolve$1(promise, val);
        } else if (options === true) {
          resolve$1(promise, arrayResult(arguments));
        } else if (Array.isArray(options)) {
          resolve$1(promise, makeObject(arguments, options));
        } else {
          resolve$1(promise, val);
        }
      };

      if (promiseInput) {
        return handlePromiseInput(promise, args, nodeFunc, this);
      } else {
        return handleValueInput(promise, args, nodeFunc, this);
      }
    };

    fn.__proto__ = nodeFunc;

    return fn;
  }

  function handleValueInput(promise, args, nodeFunc, self) {
    var result = tryCatch(nodeFunc).apply(self, args);
    if (result === TRY_CATCH_ERROR) {
      var error = TRY_CATCH_ERROR.error;
      TRY_CATCH_ERROR.error = null;
      reject(promise, error);
    }
    return promise;
  }

  function handlePromiseInput(promise, args, nodeFunc, self) {
    return Promise.all(args).then(function (args) {
      return handleValueInput(promise, args, nodeFunc, self);
    });
  }

  function needsPromiseInput(arg) {
    if (arg !== null && (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object') {
      if (arg.constructor === Promise) {
        return true;
      } else {
        return getThen(arg);
      }
    } else {
      return false;
    }
  }

  /**
    This is a convenient alias for `Promise.all`.
  
    @method all
    @public
    @static
    @for rsvp
    @param {Array} array Array of promises.
    @param {String} [label] An optional label. This is useful
    for tooling.
  */
  function all$1(array, label) {
    return Promise.all(array, label);
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  /**
  @module rsvp
  @public
  **/

  var AllSettled = function (_Enumerator) {
    _inherits(AllSettled, _Enumerator);

    function AllSettled(Constructor, entries, label) {
      return _possibleConstructorReturn(this, _Enumerator.call(this, Constructor, entries, false /* don't abort on reject */, label));
    }

    return AllSettled;
  }(Enumerator);

  AllSettled.prototype._setResultAt = setSettledResult;

  /**
  `RSVP.allSettled` is similar to `RSVP.all`, but instead of implementing
  a fail-fast method, it waits until all the promises have returned and
  shows you all the results. This is useful if you want to handle multiple
  promises' failure states together as a set.
   Returns a promise that is fulfilled when all the given promises have been
  settled. The return promise is fulfilled with an array of the states of
  the promises passed into the `promises` array argument.
   Each state object will either indicate fulfillment or rejection, and
  provide the corresponding value or reason. The states will take one of
  the following formats:
   ```javascript
  { state: 'fulfilled', value: value }
    or
  { state: 'rejected', reason: reason }
  ```
   Example:
   ```javascript
  let promise1 = RSVP.Promise.resolve(1);
  let promise2 = RSVP.Promise.reject(new Error('2'));
  let promise3 = RSVP.Promise.reject(new Error('3'));
  let promises = [ promise1, promise2, promise3 ];
   RSVP.allSettled(promises).then(function(array){
    // array == [
    //   { state: 'fulfilled', value: 1 },
    //   { state: 'rejected', reason: Error },
    //   { state: 'rejected', reason: Error }
    // ]
    // Note that for the second item, reason.message will be '2', and for the
    // third item, reason.message will be '3'.
  }, function(error) {
    // Not run. (This block would only be called if allSettled had failed,
    // for instance if passed an incorrect argument type.)
  });
  ```
   @method allSettled
  @public
  @static
  @for rsvp
  @param {Array} entries
  @param {String} [label] - optional string that describes the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled with an array of the settled
  states of the constituent promises.
  */

  function allSettled(entries, label) {
    if (!Array.isArray(entries)) {
      return Promise.reject(new TypeError("Promise.allSettled must be called with an array"), label);
    }

    return new AllSettled(Promise, entries, label).promise;
  }

  /**
    This is a convenient alias for `Promise.race`.
  
    @method race
    @public
    @static
    @for rsvp
    @param {Array} array Array of promises.
    @param {String} [label] An optional label. This is useful
    for tooling.
   */
  function race$1(array, label) {
    return Promise.race(array, label);
  }

  function _possibleConstructorReturn$1(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
  }

  function _inherits$1(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var PromiseHash = function (_Enumerator) {
    _inherits$1(PromiseHash, _Enumerator);

    function PromiseHash(Constructor, object) {
      var abortOnReject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var label = arguments[3];
      return _possibleConstructorReturn$1(this, _Enumerator.call(this, Constructor, object, abortOnReject, label));
    }

    PromiseHash.prototype._init = function _init(Constructor, object) {
      this._result = {};
      this._enumerate(object);
    };

    PromiseHash.prototype._enumerate = function _enumerate(input) {
      var keys = Object.keys(input);

      var length = keys.length;
      var promise = this.promise;
      this._remaining = length;

      var key = void 0,
          val = void 0;
      for (var i = 0; promise._state === PENDING && i < length; i++) {
        key = keys[i];
        val = input[key];
        this._eachEntry(val, key, true);
      }

      this._checkFullfillment();
    };

    return PromiseHash;
  }(Enumerator);

  /**
    `hash` is similar to `all`, but takes an object instead of an array
    for its `promises` argument.
  
    Returns a promise that is fulfilled when all the given promises have been
    fulfilled, or rejected if any of them become rejected. The returned promise
    is fulfilled with a hash that has the same key names as the `promises` object
    argument. If any of the values in the object are not promises, they will
    simply be copied over to the fulfilled object.
  
    Example:
  
    ```javascript
    let promises = {
      myPromise: resolve(1),
      yourPromise: resolve(2),
      theirPromise: resolve(3),
      notAPromise: 4
    };
  
    hash(promises).then(function(hash){
      // hash here is an object that looks like:
      // {
      //   myPromise: 1,
      //   yourPromise: 2,
      //   theirPromise: 3,
      //   notAPromise: 4
      // }
    });
    ```
  
    If any of the `promises` given to `hash` are rejected, the first promise
    that is rejected will be given as the reason to the rejection handler.
  
    Example:
  
    ```javascript
    let promises = {
      myPromise: resolve(1),
      rejectedPromise: reject(new Error('rejectedPromise')),
      anotherRejectedPromise: reject(new Error('anotherRejectedPromise')),
    };
  
    hash(promises).then(function(hash){
      // Code here never runs because there are rejected promises!
    }, function(reason) {
      // reason.message === 'rejectedPromise'
    });
    ```
  
    An important note: `hash` is intended for plain JavaScript objects that
    are just a set of keys and values. `hash` will NOT preserve prototype
    chains.
  
    Example:
  
    ```javascript
    import { hash, resolve } from 'rsvp';
    function MyConstructor(){
      this.example = resolve('Example');
    }
  
    MyConstructor.prototype = {
      protoProperty: resolve('Proto Property')
    };
  
    let myObject = new MyConstructor();
  
    hash(myObject).then(function(hash){
      // protoProperty will not be present, instead you will just have an
      // object that looks like:
      // {
      //   example: 'Example'
      // }
      //
      // hash.hasOwnProperty('protoProperty'); // false
      // 'undefined' === typeof hash.protoProperty
    });
    ```
  
    @method hash
    @public
    @static
    @for rsvp
    @param {Object} object
    @param {String} [label] optional string that describes the promise.
    Useful for tooling.
    @return {Promise} promise that is fulfilled when all properties of `promises`
    have been fulfilled, or rejected if any of them become rejected.
  */
  function hash(object, label) {
    return Promise.resolve(object, label).then(function (object) {
      if (object === null || (typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') {
        throw new TypeError("Promise.hash must be called with an object");
      }
      return new PromiseHash(Promise, object, label).promise;
    });
  }

  function _possibleConstructorReturn$2(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
  }

  function _inherits$2(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var HashSettled = function (_PromiseHash) {
    _inherits$2(HashSettled, _PromiseHash);

    function HashSettled(Constructor, object, label) {
      return _possibleConstructorReturn$2(this, _PromiseHash.call(this, Constructor, object, false, label));
    }

    return HashSettled;
  }(PromiseHash);

  HashSettled.prototype._setResultAt = setSettledResult;

  /**
    `hashSettled` is similar to `allSettled`, but takes an object
    instead of an array for its `promises` argument.
  
    Unlike `all` or `hash`, which implement a fail-fast method,
    but like `allSettled`, `hashSettled` waits until all the
    constituent promises have returned and then shows you all the results
    with their states and values/reasons. This is useful if you want to
    handle multiple promises' failure states together as a set.
  
    Returns a promise that is fulfilled when all the given promises have been
    settled, or rejected if the passed parameters are invalid.
  
    The returned promise is fulfilled with a hash that has the same key names as
    the `promises` object argument. If any of the values in the object are not
    promises, they will be copied over to the fulfilled object and marked with state
    'fulfilled'.
  
    Example:
  
    ```javascript
    import { hashSettled, resolve } from 'rsvp';
  
    let promises = {
      myPromise: resolve(1),
      yourPromise: resolve(2),
      theirPromise: resolve(3),
      notAPromise: 4
    };
  
    hashSettled(promises).then(function(hash){
      // hash here is an object that looks like:
      // {
      //   myPromise: { state: 'fulfilled', value: 1 },
      //   yourPromise: { state: 'fulfilled', value: 2 },
      //   theirPromise: { state: 'fulfilled', value: 3 },
      //   notAPromise: { state: 'fulfilled', value: 4 }
      // }
    });
    ```
  
    If any of the `promises` given to `hash` are rejected, the state will
    be set to 'rejected' and the reason for rejection provided.
  
    Example:
  
    ```javascript
    import { hashSettled, reject, resolve } from 'rsvp';
  
    let promises = {
      myPromise: resolve(1),
      rejectedPromise: reject(new Error('rejection')),
      anotherRejectedPromise: reject(new Error('more rejection')),
    };
  
    hashSettled(promises).then(function(hash){
      // hash here is an object that looks like:
      // {
      //   myPromise:              { state: 'fulfilled', value: 1 },
      //   rejectedPromise:        { state: 'rejected', reason: Error },
      //   anotherRejectedPromise: { state: 'rejected', reason: Error },
      // }
      // Note that for rejectedPromise, reason.message == 'rejection',
      // and for anotherRejectedPromise, reason.message == 'more rejection'.
    });
    ```
  
    An important note: `hashSettled` is intended for plain JavaScript objects that
    are just a set of keys and values. `hashSettled` will NOT preserve prototype
    chains.
  
    Example:
  
    ```javascript
    import Promise, { hashSettled, resolve } from 'rsvp';
  
    function MyConstructor(){
      this.example = resolve('Example');
    }
  
    MyConstructor.prototype = {
      protoProperty: Promise.resolve('Proto Property')
    };
  
    let myObject = new MyConstructor();
  
    hashSettled(myObject).then(function(hash){
      // protoProperty will not be present, instead you will just have an
      // object that looks like:
      // {
      //   example: { state: 'fulfilled', value: 'Example' }
      // }
      //
      // hash.hasOwnProperty('protoProperty'); // false
      // 'undefined' === typeof hash.protoProperty
    });
    ```
  
    @method hashSettled
    @public
    @for rsvp
    @param {Object} object
    @param {String} [label] optional string that describes the promise.
    Useful for tooling.
    @return {Promise} promise that is fulfilled when when all properties of `promises`
    have been settled.
    @static
  */

  function hashSettled(object, label) {
    return Promise.resolve(object, label).then(function (object) {
      if (object === null || (typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') {
        throw new TypeError("hashSettled must be called with an object");
      }

      return new HashSettled(Promise, object, false, label).promise;
    });
  }

  /**
    `rethrow` will rethrow an error on the next turn of the JavaScript event
    loop in order to aid debugging.
  
    Promises A+ specifies that any exceptions that occur with a promise must be
    caught by the promises implementation and bubbled to the last handler. For
    this reason, it is recommended that you always specify a second rejection
    handler function to `then`. However, `rethrow` will throw the exception
    outside of the promise, so it bubbles up to your console if in the browser,
    or domain/cause uncaught exception in Node. `rethrow` will also throw the
    error again so the error can be handled by the promise per the spec.
  
    ```javascript
    import { rethrow } from 'rsvp';
  
    function throws(){
      throw new Error('Whoops!');
    }
  
    let promise = new Promise(function(resolve, reject){
      throws();
    });
  
    promise.catch(rethrow).then(function(){
      // Code here doesn't run because the promise became rejected due to an
      // error!
    }, function (err){
      // handle the error here
    });
    ```
  
    The 'Whoops' error will be thrown on the next turn of the event loop
    and you can watch for it in your console. You can also handle it using a
    rejection handler given to `.then` or `.catch` on the returned promise.
  
    @method rethrow
    @public
    @static
    @for rsvp
    @param {Error} reason reason the promise became rejected.
    @throws Error
    @static
  */
  function rethrow(reason) {
    setTimeout(function () {
      throw reason;
    });
    throw reason;
  }

  /**
    `defer` returns an object similar to jQuery's `$.Deferred`.
    `defer` should be used when porting over code reliant on `$.Deferred`'s
    interface. New code should use the `Promise` constructor instead.
  
    The object returned from `defer` is a plain object with three properties:
  
    * promise - an `Promise`.
    * reject - a function that causes the `promise` property on this object to
      become rejected
    * resolve - a function that causes the `promise` property on this object to
      become fulfilled.
  
    Example:
  
     ```javascript
     let deferred = defer();
  
     deferred.resolve("Success!");
  
     deferred.promise.then(function(value){
       // value here is "Success!"
     });
     ```
  
    @method defer
    @public
    @static
    @for rsvp
    @param {String} [label] optional string for labeling the promise.
    Useful for tooling.
    @return {Object}
   */

  function defer(label) {
    var deferred = { resolve: undefined, reject: undefined };

    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    }, label);

    return deferred;
  }

  function _possibleConstructorReturn$3(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
  }

  function _inherits$3(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var MapEnumerator = function (_Enumerator) {
    _inherits$3(MapEnumerator, _Enumerator);

    function MapEnumerator(Constructor, entries, mapFn, label) {
      return _possibleConstructorReturn$3(this, _Enumerator.call(this, Constructor, entries, true, label, mapFn));
    }

    MapEnumerator.prototype._init = function _init(Constructor, input, bool, label, mapFn) {
      var len = input.length || 0;
      this.length = len;
      this._remaining = len;
      this._result = new Array(len);
      this._mapFn = mapFn;

      this._enumerate(input);
    };

    MapEnumerator.prototype._setResultAt = function _setResultAt(state, i, value, firstPass) {
      if (firstPass) {
        var val = tryCatch(this._mapFn)(value, i);
        if (val === TRY_CATCH_ERROR) {
          this._settledAt(REJECTED, i, val.error, false);
        } else {
          this._eachEntry(val, i, false);
        }
      } else {
        this._remaining--;
        this._result[i] = value;
      }
    };

    return MapEnumerator;
  }(Enumerator);

  /**
   `map` is similar to JavaScript's native `map` method. `mapFn` is eagerly called
    meaning that as soon as any promise resolves its value will be passed to `mapFn`.
    `map` returns a promise that will become fulfilled with the result of running
    `mapFn` on the values the promises become fulfilled with.
  
    For example:
  
    ```javascript
    import { map, resolve } from 'rsvp';
  
    let promise1 = resolve(1);
    let promise2 = resolve(2);
    let promise3 = resolve(3);
    let promises = [ promise1, promise2, promise3 ];
  
    let mapFn = function(item){
      return item + 1;
    };
  
    map(promises, mapFn).then(function(result){
      // result is [ 2, 3, 4 ]
    });
    ```
  
    If any of the `promises` given to `map` are rejected, the first promise
    that is rejected will be given as an argument to the returned promise's
    rejection handler. For example:
  
    ```javascript
    import { map, reject, resolve } from 'rsvp';
  
    let promise1 = resolve(1);
    let promise2 = reject(new Error('2'));
    let promise3 = reject(new Error('3'));
    let promises = [ promise1, promise2, promise3 ];
  
    let mapFn = function(item){
      return item + 1;
    };
  
    map(promises, mapFn).then(function(array){
      // Code here never runs because there are rejected promises!
    }, function(reason) {
      // reason.message === '2'
    });
    ```
  
    `map` will also wait if a promise is returned from `mapFn`. For example,
    say you want to get all comments from a set of blog posts, but you need
    the blog posts first because they contain a url to those comments.
  
    ```javscript
    import { map } from 'rsvp';
  
    let mapFn = function(blogPost){
      // getComments does some ajax and returns an Promise that is fulfilled
      // with some comments data
      return getComments(blogPost.comments_url);
    };
  
    // getBlogPosts does some ajax and returns an Promise that is fulfilled
    // with some blog post data
    map(getBlogPosts(), mapFn).then(function(comments){
      // comments is the result of asking the server for the comments
      // of all blog posts returned from getBlogPosts()
    });
    ```
  
    @method map
    @public
    @static
    @for rsvp
    @param {Array} promises
    @param {Function} mapFn function to be called on each fulfilled promise.
    @param {String} [label] optional string for labeling the promise.
    Useful for tooling.
    @return {Promise} promise that is fulfilled with the result of calling
    `mapFn` on each fulfilled promise or value when they become fulfilled.
     The promise will be rejected if any of the given `promises` become rejected.
  */
  function map(promises, mapFn, label) {
    if (typeof mapFn !== 'function') {
      return Promise.reject(new TypeError("map expects a function as a second argument"), label);
    }

    return Promise.resolve(promises, label).then(function (promises) {
      if (!Array.isArray(promises)) {
        throw new TypeError("map must be called with an array");
      }
      return new MapEnumerator(Promise, promises, mapFn, label).promise;
    });
  }

  /**
    This is a convenient alias for `Promise.resolve`.
  
    @method resolve
    @public
    @static
    @for rsvp
    @param {*} value value that the returned promise will be resolved with
    @param {String} [label] optional string for identifying the returned promise.
    Useful for tooling.
    @return {Promise} a promise that will become fulfilled with the given
    `value`
  */
  function resolve$2(value, label) {
    return Promise.resolve(value, label);
  }

  /**
    This is a convenient alias for `Promise.reject`.
  
    @method reject
    @public
    @static
    @for rsvp
    @param {*} reason value that the returned promise will be rejected with.
    @param {String} [label] optional string for identifying the returned promise.
    Useful for tooling.
    @return {Promise} a promise rejected with the given `reason`.
  */
  function reject$2(reason, label) {
    return Promise.reject(reason, label);
  }

  function _possibleConstructorReturn$4(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
  }

  function _inherits$4(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var EMPTY_OBJECT = {};

  var FilterEnumerator = function (_MapEnumerator) {
    _inherits$4(FilterEnumerator, _MapEnumerator);

    function FilterEnumerator() {
      return _possibleConstructorReturn$4(this, _MapEnumerator.apply(this, arguments));
    }

    FilterEnumerator.prototype._checkFullfillment = function _checkFullfillment() {
      if (this._remaining === 0 && this._result !== null) {
        var result = this._result.filter(function (val) {
          return val !== EMPTY_OBJECT;
        });
        fulfill(this.promise, result);
        this._result = null;
      }
    };

    FilterEnumerator.prototype._setResultAt = function _setResultAt(state, i, value, firstPass) {
      if (firstPass) {
        this._result[i] = value;
        var val = tryCatch(this._mapFn)(value, i);
        if (val === TRY_CATCH_ERROR) {
          this._settledAt(REJECTED, i, val.error, false);
        } else {
          this._eachEntry(val, i, false);
        }
      } else {
        this._remaining--;
        if (!value) {
          this._result[i] = EMPTY_OBJECT;
        }
      }
    };

    return FilterEnumerator;
  }(MapEnumerator);

  /**
   `filter` is similar to JavaScript's native `filter` method.
   `filterFn` is eagerly called meaning that as soon as any promise
    resolves its value will be passed to `filterFn`. `filter` returns
    a promise that will become fulfilled with the result of running
    `filterFn` on the values the promises become fulfilled with.
  
    For example:
  
    ```javascript
    import { filter, resolve } from 'rsvp';
  
    let promise1 = resolve(1);
    let promise2 = resolve(2);
    let promise3 = resolve(3);
  
    let promises = [promise1, promise2, promise3];
  
    let filterFn = function(item){
      return item > 1;
    };
  
    filter(promises, filterFn).then(function(result){
      // result is [ 2, 3 ]
    });
    ```
  
    If any of the `promises` given to `filter` are rejected, the first promise
    that is rejected will be given as an argument to the returned promise's
    rejection handler. For example:
  
    ```javascript
    import { filter, reject, resolve } from 'rsvp';
  
    let promise1 = resolve(1);
    let promise2 = reject(new Error('2'));
    let promise3 = reject(new Error('3'));
    let promises = [ promise1, promise2, promise3 ];
  
    let filterFn = function(item){
      return item > 1;
    };
  
    filter(promises, filterFn).then(function(array){
      // Code here never runs because there are rejected promises!
    }, function(reason) {
      // reason.message === '2'
    });
    ```
  
    `filter` will also wait for any promises returned from `filterFn`.
    For instance, you may want to fetch a list of users then return a subset
    of those users based on some asynchronous operation:
  
    ```javascript
    import { filter, resolve } from 'rsvp';
  
    let alice = { name: 'alice' };
    let bob   = { name: 'bob' };
    let users = [ alice, bob ];
  
    let promises = users.map(function(user){
      return resolve(user);
    });
  
    let filterFn = function(user){
      // Here, Alice has permissions to create a blog post, but Bob does not.
      return getPrivilegesForUser(user).then(function(privs){
        return privs.can_create_blog_post === true;
      });
    };
    filter(promises, filterFn).then(function(users){
      // true, because the server told us only Alice can create a blog post.
      users.length === 1;
      // false, because Alice is the only user present in `users`
      users[0] === bob;
    });
    ```
  
    @method filter
    @public
    @static
    @for rsvp
    @param {Array} promises
    @param {Function} filterFn - function to be called on each resolved value to
    filter the final results.
    @param {String} [label] optional string describing the promise. Useful for
    tooling.
    @return {Promise}
  */

  function filter(promises, filterFn, label) {
    if (typeof filterFn !== 'function') {
      return Promise.reject(new TypeError("filter expects function as a second argument"), label);
    }

    return Promise.resolve(promises, label).then(function (promises) {
      if (!Array.isArray(promises)) {
        throw new TypeError("filter must be called with an array");
      }
      return new FilterEnumerator(Promise, promises, filterFn, label).promise;
    });
  }

  var len = 0;
  var vertxNext = void 0;
  function asap(callback, arg) {
    queue$1[len] = callback;
    queue$1[len + 1] = arg;
    len += 2;
    if (len === 2) {
      // If len is 1, that means that we need to schedule an async flush.
      // If additional callbacks are queued before the queue is flushed, they
      // will be processed by this flush that we are scheduling.
      scheduleFlush$1();
    }
  }

  var browserWindow = typeof window !== 'undefined' ? window : undefined;
  var browserGlobal = browserWindow || {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  // test for web worker but not in IE10
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

  // node
  function useNextTick() {
    var nextTick = process.nextTick;
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // setImmediate should be used instead instead
    var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
    if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
      nextTick = setImmediate;
    }
    return function () {
      return nextTick(flush);
    };
  }

  // vertx
  function useVertxTimer() {
    if (typeof vertxNext !== 'undefined') {
      return function () {
        vertxNext(flush);
      };
    }
    return useSetTimeout();
  }

  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return function () {
      return node.data = iterations = ++iterations % 2;
    };
  }

  // web worker
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function () {
      return channel.port2.postMessage(0);
    };
  }

  function useSetTimeout() {
    return function () {
      return setTimeout(flush, 1);
    };
  }

  var queue$1 = new Array(1000);

  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue$1[i];
      var arg = queue$1[i + 1];

      callback(arg);

      queue$1[i] = undefined;
      queue$1[i + 1] = undefined;
    }

    len = 0;
  }

  function attemptVertex() {
    try {
      var vertx = Function('return this')().require('vertx');
      vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return useVertxTimer();
    } catch (e) {
      return useSetTimeout();
    }
  }

  var scheduleFlush$1 = void 0;
  // Decide what async method to use to triggering processing of queued callbacks:
  if (isNode) {
    scheduleFlush$1 = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush$1 = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush$1 = useMessageChannel();
  } else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush$1 = attemptVertex();
  } else {
    scheduleFlush$1 = useSetTimeout();
  }

  // defaults
  config.async = asap;
  config.after = function (cb) {
    return setTimeout(cb, 0);
  };
  var cast = resolve$2;

  var async = function async(callback, arg) {
    return config.async(callback, arg);
  };

  function on() {
    config.on.apply(config, arguments);
  }

  function off() {
    config.off.apply(config, arguments);
  }

  // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
  if (typeof window !== 'undefined' && _typeof(window['__PROMISE_INSTRUMENTATION__']) === 'object') {
    var callbacks = window['__PROMISE_INSTRUMENTATION__'];
    configure('instrument', true);
    for (var eventName in callbacks) {
      if (callbacks.hasOwnProperty(eventName)) {
        on(eventName, callbacks[eventName]);
      }
    }
  }

  // the default export here is for backwards compat:
  //   https://github.com/tildeio/rsvp.js/issues/434
  var rsvp = {
    asap: asap,
    cast: cast,
    Promise: Promise,
    EventTarget: EventTarget,
    all: all$1,
    allSettled: allSettled,
    race: race$1,
    hash: hash,
    hashSettled: hashSettled,
    rethrow: rethrow,
    defer: defer,
    denodeify: denodeify,
    configure: configure,
    on: on,
    off: off,
    resolve: resolve$2,
    reject: reject$2,
    map: map,
    async: async,
    filter: filter
  };

  exports.default = rsvp;
  exports.asap = asap;
  exports.cast = cast;
  exports.Promise = Promise;
  exports.EventTarget = EventTarget;
  exports.all = all$1;
  exports.allSettled = allSettled;
  exports.race = race$1;
  exports.hash = hash;
  exports.hashSettled = hashSettled;
  exports.rethrow = rethrow;
  exports.defer = defer;
  exports.denodeify = denodeify;
  exports.configure = configure;
  exports.on = on;
  exports.off = off;
  exports.resolve = resolve$2;
  exports.reject = reject$2;
  exports.map = map;
  exports.async = async;
  exports.filter = filter;
});//# sourceMappingURL=vendor.map
