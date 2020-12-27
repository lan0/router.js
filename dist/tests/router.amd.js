//# sourceMappingURL=core.js.map
define("router/core", [], function () {
  "use strict";
});
define('router/index', ['exports', 'router/router', 'router/transition', 'router/transition-state', 'router/route-info'], function (exports, _router, _transition, _transitionState, _routeInfo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _interopRequireDefault(_router).default;
    }
  });
  Object.defineProperty(exports, 'InternalTransition', {
    enumerable: true,
    get: function () {
      return _interopRequireDefault(_transition).default;
    }
  });
  Object.defineProperty(exports, 'logAbort', {
    enumerable: true,
    get: function () {
      return _transition.logAbort;
    }
  });
  Object.defineProperty(exports, 'STATE_SYMBOL', {
    enumerable: true,
    get: function () {
      return _transition.STATE_SYMBOL;
    }
  });
  Object.defineProperty(exports, 'PARAMS_SYMBOL', {
    enumerable: true,
    get: function () {
      return _transition.PARAMS_SYMBOL;
    }
  });
  Object.defineProperty(exports, 'QUERY_PARAMS_SYMBOL', {
    enumerable: true,
    get: function () {
      return _transition.QUERY_PARAMS_SYMBOL;
    }
  });
  Object.defineProperty(exports, 'TransitionState', {
    enumerable: true,
    get: function () {
      return _interopRequireDefault(_transitionState).default;
    }
  });
  Object.defineProperty(exports, 'TransitionError', {
    enumerable: true,
    get: function () {
      return _transitionState.TransitionError;
    }
  });
  Object.defineProperty(exports, 'InternalRouteInfo', {
    enumerable: true,
    get: function () {
      return _interopRequireDefault(_routeInfo).default;
    }
  });

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }
});
define('router/route-info', ['exports', 'rsvp', 'router/transition', 'router/utils'], function (exports, _rsvp, _transition2, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.UnresolvedRouteInfoByObject = exports.UnresolvedRouteInfoByParam = exports.ResolvedRouteInfo = undefined;
    exports.toReadOnlyRouteInfo = toReadOnlyRouteInfo;

    var _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);

            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;

            if (getter === undefined) {
                return undefined;
            }

            return getter.call(receiver);
        }
    };

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

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

    var ROUTE_INFOS = new WeakMap();
    function toReadOnlyRouteInfo(routeInfos) {
        var queryParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var includeAttributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        return routeInfos.map(function (info, i) {
            var name = info.name,
                params = info.params,
                paramNames = info.paramNames,
                context = info.context,
                route = info.route;

            if (ROUTE_INFOS.has(info) && includeAttributes) {
                var _routeInfo = ROUTE_INFOS.get(info);
                _routeInfo = attachMetadata(route, _routeInfo);
                var routeInfoWithAttribute = createRouteInfoWithAttributes(_routeInfo, context);
                ROUTE_INFOS.set(info, routeInfoWithAttribute);
                return routeInfoWithAttribute;
            }
            var routeInfo = {
                find: function find(predicate, thisArg) {
                    var publicInfo = void 0;
                    var arr = [];
                    if (predicate.length === 3) {
                        arr = routeInfos.map(function (info) {
                            return ROUTE_INFOS.get(info);
                        });
                    }
                    for (var _i = 0; routeInfos.length > _i; _i++) {
                        publicInfo = ROUTE_INFOS.get(routeInfos[_i]);
                        if (predicate.call(thisArg, publicInfo, _i, arr)) {
                            return publicInfo;
                        }
                    }
                    return undefined;
                },

                get name() {
                    return name;
                },
                get paramNames() {
                    return paramNames;
                },
                get metadata() {
                    return buildRouteInfoMetadata(info.route);
                },
                get parent() {
                    var parent = routeInfos[i - 1];
                    if (parent === undefined) {
                        return null;
                    }
                    return ROUTE_INFOS.get(parent);
                },
                get child() {
                    var child = routeInfos[i + 1];
                    if (child === undefined) {
                        return null;
                    }
                    return ROUTE_INFOS.get(child);
                },
                get localName() {
                    var parts = this.name.split('.');
                    return parts[parts.length - 1];
                },
                get params() {
                    return params;
                },
                get queryParams() {
                    return queryParams;
                }
            };
            if (includeAttributes) {
                routeInfo = createRouteInfoWithAttributes(routeInfo, context);
            }
            ROUTE_INFOS.set(info, routeInfo);
            return routeInfo;
        });
    }
    function createRouteInfoWithAttributes(routeInfo, context) {
        var attributes = {
            get attributes() {
                return context;
            }
        };
        if (!Object.isExtensible(routeInfo) || routeInfo.hasOwnProperty('attributes')) {
            return Object.freeze(Object.assign({}, routeInfo, attributes));
        }
        return Object.assign(routeInfo, attributes);
    }
    function buildRouteInfoMetadata(route) {
        if (route !== undefined && route !== null && route.buildRouteInfoMetadata !== undefined) {
            return route.buildRouteInfoMetadata();
        }
        return null;
    }
    function attachMetadata(route, routeInfo) {
        var metadata = {
            get metadata() {
                return buildRouteInfoMetadata(route);
            }
        };
        if (!Object.isExtensible(routeInfo) || routeInfo.hasOwnProperty('metadata')) {
            return Object.freeze(Object.assign({}, routeInfo, metadata));
        }
        return Object.assign(routeInfo, metadata);
    }

    var InternalRouteInfo = function () {
        function InternalRouteInfo(router, name, paramNames, route) {
            _classCallCheck(this, InternalRouteInfo);

            this._routePromise = undefined;
            this._route = null;
            this.params = {};
            this.isResolved = false;
            this.name = name;
            this.paramNames = paramNames;
            this.router = router;
            if (route) {
                this._processRoute(route);
            }
        }

        _createClass(InternalRouteInfo, [{
            key: 'getModel',
            value: function getModel(_transition) {
                return _rsvp.Promise.resolve(this.context);
            }
        }, {
            key: 'serialize',
            value: function serialize(_context) {
                return this.params || {};
            }
        }, {
            key: 'resolve',
            value: function resolve(shouldContinue, transition) {
                var _this = this;

                return _rsvp.Promise.resolve(this.routePromise).then(function (route) {
                    return _this.checkForAbort(shouldContinue, route);
                }).then(function () {
                    return _this.runBeforeModelHook(transition);
                }).then(function () {
                    return _this.checkForAbort(shouldContinue, null);
                }).then(function () {
                    return _this.getModel(transition);
                }).then(function (resolvedModel) {
                    return _this.checkForAbort(shouldContinue, resolvedModel);
                }).then(function (resolvedModel) {
                    return _this.runAfterModelHook(transition, resolvedModel);
                }).then(function (resolvedModel) {
                    return _this.becomeResolved(transition, resolvedModel);
                });
            }
        }, {
            key: 'becomeResolved',
            value: function becomeResolved(transition, resolvedContext) {
                var params = this.serialize(resolvedContext);
                if (transition) {
                    this.stashResolvedModel(transition, resolvedContext);
                    transition[_transition2.PARAMS_SYMBOL] = transition[_transition2.PARAMS_SYMBOL] || {};
                    transition[_transition2.PARAMS_SYMBOL][this.name] = params;
                }
                var context = void 0;
                var contextsMatch = resolvedContext === this.context;
                if ('context' in this || !contextsMatch) {
                    context = resolvedContext;
                }
                var cached = ROUTE_INFOS.get(this);
                var resolved = new ResolvedRouteInfo(this.router, this.name, this.paramNames, params, this.route, context);
                if (cached !== undefined) {
                    ROUTE_INFOS.set(resolved, cached);
                }
                return resolved;
            }
        }, {
            key: 'shouldSupercede',
            value: function shouldSupercede(routeInfo) {
                // Prefer this newer routeInfo over `other` if:
                // 1) The other one doesn't exist
                // 2) The names don't match
                // 3) This route has a context that doesn't match
                //    the other one (or the other one doesn't have one).
                // 4) This route has parameters that don't match the other.
                if (!routeInfo) {
                    return true;
                }
                var contextsMatch = routeInfo.context === this.context;
                return routeInfo.name !== this.name || 'context' in this && !contextsMatch || this.hasOwnProperty('params') && !paramsMatch(this.params, routeInfo.params);
            }
        }, {
            key: 'log',
            value: function log(transition, message) {
                if (transition.log) {
                    transition.log(this.name + ': ' + message);
                }
            }
        }, {
            key: 'updateRoute',
            value: function updateRoute(route) {
                route._internalName = this.name;
                return this.route = route;
            }
        }, {
            key: 'runBeforeModelHook',
            value: function runBeforeModelHook(transition) {
                if (transition.trigger) {
                    transition.trigger(true, 'willResolveModel', transition, this.route);
                }
                var result = void 0;
                if (this.route) {
                    if (this.route.beforeModel !== undefined) {
                        result = this.route.beforeModel(transition);
                    }
                }
                if ((0, _transition2.isTransition)(result)) {
                    result = null;
                }
                return _rsvp.Promise.resolve(result);
            }
        }, {
            key: 'runAfterModelHook',
            value: function runAfterModelHook(transition, resolvedModel) {
                // Stash the resolved model on the payload.
                // This makes it possible for users to swap out
                // the resolved model in afterModel.
                var name = this.name;
                this.stashResolvedModel(transition, resolvedModel);
                var result = void 0;
                if (this.route !== undefined) {
                    if (this.route.afterModel !== undefined) {
                        result = this.route.afterModel(resolvedModel, transition);
                    }
                }
                result = (0, _transition2.prepareResult)(result);
                return _rsvp.Promise.resolve(result).then(function () {
                    // Ignore the fulfilled value returned from afterModel.
                    // Return the value stashed in resolvedModels, which
                    // might have been swapped out in afterModel.
                    return transition.resolvedModels[name];
                });
            }
        }, {
            key: 'checkForAbort',
            value: function checkForAbort(shouldContinue, value) {
                return _rsvp.Promise.resolve(shouldContinue()).then(function () {
                    // We don't care about shouldContinue's resolve value;
                    // pass along the original value passed to this fn.
                    return value;
                }, null);
            }
        }, {
            key: 'stashResolvedModel',
            value: function stashResolvedModel(transition, resolvedModel) {
                transition.resolvedModels = transition.resolvedModels || {};
                transition.resolvedModels[this.name] = resolvedModel;
            }
        }, {
            key: 'fetchRoute',
            value: function fetchRoute() {
                var route = this.router.getRoute(this.name);
                return this._processRoute(route);
            }
        }, {
            key: '_processRoute',
            value: function _processRoute(route) {
                var _this2 = this;

                // Setup a routePromise so that we can wait for asynchronously loaded routes
                this.routePromise = _rsvp.Promise.resolve(route);
                // Wait until the 'route' property has been updated when chaining to a route
                // that is a promise
                if ((0, _utils.isPromise)(route)) {
                    this.routePromise = this.routePromise.then(function (r) {
                        return _this2.updateRoute(r);
                    });
                    // set to undefined to avoid recursive loop in the route getter
                    return this.route = undefined;
                } else if (route) {
                    return this.updateRoute(route);
                }
                return undefined;
            }
        }, {
            key: 'route',
            get: function get() {
                // _route could be set to either a route object or undefined, so we
                // compare against null to know when it's been set
                if (this._route !== null) {
                    return this._route;
                }
                return this.fetchRoute();
            },
            set: function set(route) {
                this._route = route;
            }
        }, {
            key: 'routePromise',
            get: function get() {
                if (this._routePromise) {
                    return this._routePromise;
                }
                this.fetchRoute();
                return this._routePromise;
            },
            set: function set(routePromise) {
                this._routePromise = routePromise;
            }
        }]);

        return InternalRouteInfo;
    }();

    exports.default = InternalRouteInfo;

    var ResolvedRouteInfo = exports.ResolvedRouteInfo = function (_InternalRouteInfo) {
        _inherits(ResolvedRouteInfo, _InternalRouteInfo);

        function ResolvedRouteInfo(router, name, paramNames, params, route, context) {
            _classCallCheck(this, ResolvedRouteInfo);

            var _this3 = _possibleConstructorReturn(this, (ResolvedRouteInfo.__proto__ || Object.getPrototypeOf(ResolvedRouteInfo)).call(this, router, name, paramNames, route));

            _this3.params = params;
            _this3.isResolved = true;
            _this3.context = context;
            return _this3;
        }

        _createClass(ResolvedRouteInfo, [{
            key: 'resolve',
            value: function resolve(_shouldContinue, transition) {
                // A ResolvedRouteInfo just resolved with itself.
                if (transition && transition.resolvedModels) {
                    transition.resolvedModels[this.name] = this.context;
                }
                return _rsvp.Promise.resolve(this);
            }
        }]);

        return ResolvedRouteInfo;
    }(InternalRouteInfo);

    var UnresolvedRouteInfoByParam = exports.UnresolvedRouteInfoByParam = function (_InternalRouteInfo2) {
        _inherits(UnresolvedRouteInfoByParam, _InternalRouteInfo2);

        function UnresolvedRouteInfoByParam(router, name, paramNames, params, route) {
            _classCallCheck(this, UnresolvedRouteInfoByParam);

            var _this4 = _possibleConstructorReturn(this, (UnresolvedRouteInfoByParam.__proto__ || Object.getPrototypeOf(UnresolvedRouteInfoByParam)).call(this, router, name, paramNames, route));

            _this4.params = {};
            _this4.params = params;
            return _this4;
        }

        _createClass(UnresolvedRouteInfoByParam, [{
            key: 'getModel',
            value: function getModel(transition) {
                var fullParams = this.params;
                if (transition && transition[_transition2.QUERY_PARAMS_SYMBOL]) {
                    fullParams = {};
                    (0, _utils.merge)(fullParams, this.params);
                    fullParams.queryParams = transition[_transition2.QUERY_PARAMS_SYMBOL];
                }
                var route = this.route;
                var result = undefined;
                if (route.deserialize) {
                    result = route.deserialize(fullParams, transition);
                } else if (route.model) {
                    result = route.model(fullParams, transition);
                }
                if (result && (0, _transition2.isTransition)(result)) {
                    result = undefined;
                }
                return _rsvp.Promise.resolve(result);
            }
        }]);

        return UnresolvedRouteInfoByParam;
    }(InternalRouteInfo);

    var UnresolvedRouteInfoByObject = exports.UnresolvedRouteInfoByObject = function (_InternalRouteInfo3) {
        _inherits(UnresolvedRouteInfoByObject, _InternalRouteInfo3);

        function UnresolvedRouteInfoByObject(router, name, paramNames, context) {
            _classCallCheck(this, UnresolvedRouteInfoByObject);

            var _this5 = _possibleConstructorReturn(this, (UnresolvedRouteInfoByObject.__proto__ || Object.getPrototypeOf(UnresolvedRouteInfoByObject)).call(this, router, name, paramNames));

            _this5.context = context;
            _this5.serializer = _this5.router.getSerializer(name);
            return _this5;
        }

        _createClass(UnresolvedRouteInfoByObject, [{
            key: 'getModel',
            value: function getModel(transition) {
                if (this.router.log !== undefined) {
                    this.router.log(this.name + ': resolving provided model');
                }
                return _get(UnresolvedRouteInfoByObject.prototype.__proto__ || Object.getPrototypeOf(UnresolvedRouteInfoByObject.prototype), 'getModel', this).call(this, transition);
            }
            /**
              @private
                 Serializes a route using its custom `serialize` method or
              by a default that looks up the expected property name from
              the dynamic segment.
                 @param {Object} model the model to be serialized for this route
            */

        }, {
            key: 'serialize',
            value: function serialize(model) {
                var paramNames = this.paramNames,
                    context = this.context;

                if (!model) {
                    model = context;
                }
                var object = {};
                if ((0, _utils.isParam)(model)) {
                    object[paramNames[0]] = model;
                    return object;
                }
                // Use custom serialize if it exists.
                if (this.serializer) {
                    // invoke this.serializer unbound (getSerializer returns a stateless function)
                    return this.serializer.call(null, model, paramNames);
                } else if (this.route !== undefined) {
                    if (this.route.serialize) {
                        return this.route.serialize(model, paramNames);
                    }
                }
                if (paramNames.length !== 1) {
                    return;
                }
                var name = paramNames[0];
                if (/_id$/.test(name)) {
                    object[name] = model.id;
                } else {
                    object[name] = model;
                }
                return object;
            }
        }]);

        return UnresolvedRouteInfoByObject;
    }(InternalRouteInfo);

    function paramsMatch(a, b) {
        if (!a !== !b) {
            // Only one is null.
            return false;
        }
        if (!a) {
            // Both must be null.
            return true;
        }
        // Note: this assumes that both params have the same
        // number of keys, but since we're comparing the
        // same routes, they should.
        for (var k in a) {
            if (a.hasOwnProperty(k) && a[k] !== b[k]) {
                return false;
            }
        }
        return true;
    }
    //# sourceMappingURL=route-info.js.map
});
define('router/router', ['exports', 'route-recognizer', 'rsvp', 'router/route-info', 'router/transition', 'router/transition-aborted-error', 'router/transition-intent/named-transition-intent', 'router/transition-intent/url-transition-intent', 'router/transition-state', 'router/utils'], function (exports, _routeRecognizer, _rsvp, _routeInfo, _transition, _transitionAbortedError, _namedTransitionIntent, _urlTransitionIntent, _transitionState, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _routeRecognizer2 = _interopRequireDefault(_routeRecognizer);

    var _transition2 = _interopRequireDefault(_transition);

    var _transitionAbortedError2 = _interopRequireDefault(_transitionAbortedError);

    var _namedTransitionIntent2 = _interopRequireDefault(_namedTransitionIntent);

    var _urlTransitionIntent2 = _interopRequireDefault(_urlTransitionIntent);

    var _transitionState2 = _interopRequireDefault(_transitionState);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

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

    var Router = function () {
        function Router(logger) {
            _classCallCheck(this, Router);

            this._lastQueryParams = {};
            this.state = undefined;
            this.oldState = undefined;
            this.activeTransition = undefined;
            this.currentRouteInfos = undefined;
            this._changedQueryParams = undefined;
            this.currentSequence = 0;
            this.log = logger;
            this.recognizer = new _routeRecognizer2.default();
            this.reset();
        }
        /**
          The main entry point into the router. The API is essentially
          the same as the `map` method in `route-recognizer`.
             This method extracts the String handler at the last `.to()`
          call and uses it as the name of the whole route.
             @param {Function} callback
        */


        _createClass(Router, [{
            key: 'map',
            value: function map(callback) {
                this.recognizer.map(callback, function (recognizer, routes) {
                    for (var i = routes.length - 1, proceed = true; i >= 0 && proceed; --i) {
                        var route = routes[i];
                        var handler = route.handler;
                        recognizer.add(routes, { as: handler });
                        proceed = route.path === '/' || route.path === '' || handler.slice(-6) === '.index';
                    }
                });
            }
        }, {
            key: 'hasRoute',
            value: function hasRoute(route) {
                return this.recognizer.hasRoute(route);
            }
        }, {
            key: 'queryParamsTransition',
            value: function queryParamsTransition(changelist, wasTransitioning, oldState, newState) {
                var _this = this;

                this.fireQueryParamDidChange(newState, changelist);
                if (!wasTransitioning && this.activeTransition) {
                    // One of the routes in queryParamsDidChange
                    // caused a transition. Just return that transition.
                    return this.activeTransition;
                } else {
                    // Running queryParamsDidChange didn't change anything.
                    // Just update query params and be on our way.
                    // We have to return a noop transition that will
                    // perform a URL update at the end. This gives
                    // the user the ability to set the url update
                    // method (default is replaceState).
                    var newTransition = new _transition2.default(this, undefined, newState);
                    newTransition.queryParamsOnly = true;
                    this.setupContexts(newState, newTransition);
                    oldState.queryParams = this.finalizeQueryParamChange(newState.routeInfos, newState.queryParams, newTransition);
                    newTransition[_transition.QUERY_PARAMS_SYMBOL] = newState.queryParams;
                    this.toReadOnlyInfos(newTransition, newState);
                    this.routeWillChange(newTransition);
                    newTransition.promise = newTransition.promise.then(function (result) {
                        if (!newTransition.isAborted) {
                            _this._updateURL(newTransition, oldState);
                            _this.didTransition(_this.currentRouteInfos);
                            _this.toInfos(newTransition, newState.routeInfos, true);
                            _this.routeDidChange(newTransition);
                        }
                        return result;
                    }, null, (0, _utils.promiseLabel)('Transition complete'));
                    return newTransition;
                }
            }
        }, {
            key: 'transitionByIntent',
            value: function transitionByIntent(intent, isIntermediate) {
                try {
                    return this.getTransitionByIntent(intent, isIntermediate);
                } catch (e) {
                    return new _transition2.default(this, intent, undefined, e, undefined);
                }
            }
        }, {
            key: 'recognize',
            value: function recognize(url) {
                var intent = new _urlTransitionIntent2.default(this, url);
                var newState = this.generateNewState(intent);
                if (newState === null) {
                    return newState;
                }
                var readonlyInfos = (0, _routeInfo.toReadOnlyRouteInfo)(newState.routeInfos, newState.queryParams);
                return readonlyInfos[readonlyInfos.length - 1];
            }
        }, {
            key: 'recognizeAndLoad',
            value: function recognizeAndLoad(url) {
                var intent = new _urlTransitionIntent2.default(this, url);
                var newState = this.generateNewState(intent);
                if (newState === null) {
                    return _rsvp.Promise.reject('URL ' + url + ' was not recognized');
                }
                var newTransition = new _transition2.default(this, intent, newState, undefined);
                return newTransition.then(function () {
                    var routeInfosWithAttributes = (0, _routeInfo.toReadOnlyRouteInfo)(newState.routeInfos, newTransition[_transition.QUERY_PARAMS_SYMBOL], true);
                    return routeInfosWithAttributes[routeInfosWithAttributes.length - 1];
                });
            }
        }, {
            key: 'generateNewState',
            value: function generateNewState(intent) {
                try {
                    return intent.applyToState(this.state, false);
                } catch (e) {
                    return null;
                }
            }
        }, {
            key: 'getTransitionByIntent',
            value: function getTransitionByIntent(intent, isIntermediate) {
                var _this2 = this;

                var wasTransitioning = !!this.activeTransition;
                var oldState = wasTransitioning ? this.activeTransition[_transition.STATE_SYMBOL] : this.state;
                var newTransition = void 0;
                var newState = intent.applyToState(oldState, isIntermediate);
                var queryParamChangelist = (0, _utils.getChangelist)(oldState.queryParams, newState.queryParams);
                if (routeInfosEqual(newState.routeInfos, oldState.routeInfos)) {
                    // This is a no-op transition. See if query params changed.
                    if (queryParamChangelist) {
                        var _newTransition = this.queryParamsTransition(queryParamChangelist, wasTransitioning, oldState, newState);
                        _newTransition.queryParamsOnly = true;
                        return _newTransition;
                    }
                    // No-op. No need to create a new transition.
                    return this.activeTransition || new _transition2.default(this, undefined, undefined);
                }
                if (isIntermediate) {
                    newState.queryParams = oldState.queryParams;
                    var transition = new _transition2.default(this, undefined, newState);
                    this.toReadOnlyInfos(transition, newState);
                    this.setupContexts(newState, transition);
                    this.routeWillChange(transition);
                    return this.activeTransition;
                }
                // Create a new transition to the destination route.
                newTransition = new _transition2.default(this, intent, newState, undefined, this.activeTransition);
                // transition is to same route with same params, only query params differ.
                // not caught above probably because refresh() has been used
                if (routeInfosSameExceptQueryParams(newState.routeInfos, oldState.routeInfos)) {
                    newTransition.queryParamsOnly = true;
                }
                this.toReadOnlyInfos(newTransition, newState);
                // Abort and usurp any previously active transition.
                if (this.activeTransition) {
                    this.activeTransition.redirect(newTransition);
                }
                this.activeTransition = newTransition;
                // Transition promises by default resolve with resolved state.
                // For our purposes, swap out the promise to resolve
                // after the transition has been finalized.
                newTransition.promise = newTransition.promise.then(function (result) {
                    return _this2.finalizeTransition(newTransition, result);
                }, null, (0, _utils.promiseLabel)('Settle transition promise when transition is finalized'));
                if (!wasTransitioning) {
                    this.notifyExistingHandlers(newState, newTransition);
                }
                this.fireQueryParamDidChange(newState, queryParamChangelist);
                return newTransition;
            }
        }, {
            key: 'doTransition',
            value: function doTransition(name) {
                var modelsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                var isIntermediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                var lastArg = modelsArray[modelsArray.length - 1];
                var queryParams = {};
                if (lastArg !== undefined && lastArg.hasOwnProperty('queryParams')) {
                    queryParams = modelsArray.pop().queryParams;
                }
                var intent = void 0;
                if (name === undefined) {
                    (0, _utils.log)(this, 'Updating query params');
                    // A query param update is really just a transition
                    // into the route you're already on.
                    var routeInfos = this.state.routeInfos;

                    intent = new _namedTransitionIntent2.default(this, routeInfos[routeInfos.length - 1].name, undefined, [], queryParams);
                } else if (name.charAt(0) === '/') {
                    (0, _utils.log)(this, 'Attempting URL transition to ' + name);
                    intent = new _urlTransitionIntent2.default(this, name);
                } else {
                    (0, _utils.log)(this, 'Attempting transition to ' + name);
                    intent = new _namedTransitionIntent2.default(this, name, undefined, modelsArray, queryParams);
                }
                return this.transitionByIntent(intent, isIntermediate);
            }
        }, {
            key: 'finalizeTransition',
            value: function finalizeTransition(transition, newState) {
                try {
                    (0, _utils.log)(transition.router, transition.sequence, 'Resolved all models on destination route; finalizing transition.');
                    var routeInfos = newState.routeInfos;
                    // Run all the necessary enter/setup/exit hooks
                    this.setupContexts(newState, transition);
                    // Check if a redirect occurred in enter/setup
                    if (transition.isAborted) {
                        // TODO: cleaner way? distinguish b/w targetRouteInfos?
                        this.state.routeInfos = this.currentRouteInfos;
                        return _rsvp.Promise.reject((0, _transition.logAbort)(transition));
                    }
                    this._updateURL(transition, newState);
                    transition.isActive = false;
                    this.activeTransition = undefined;
                    this.triggerEvent(this.currentRouteInfos, true, 'didTransition', []);
                    this.didTransition(this.currentRouteInfos);
                    this.toInfos(transition, newState.routeInfos, true);
                    this.routeDidChange(transition);
                    (0, _utils.log)(this, transition.sequence, 'TRANSITION COMPLETE.');
                    // Resolve with the final route.
                    return routeInfos[routeInfos.length - 1].route;
                } catch (e) {
                    if (!(e instanceof _transitionAbortedError2.default)) {
                        var infos = transition[_transition.STATE_SYMBOL].routeInfos;
                        transition.trigger(true, 'error', e, transition, infos[infos.length - 1].route);
                        transition.abort();
                    }
                    throw e;
                }
            }
        }, {
            key: 'setupContexts',
            value: function setupContexts(newState, transition) {
                var partition = this.partitionRoutes(this.state, newState);
                var i = void 0,
                    l = void 0,
                    route = void 0;
                for (i = 0, l = partition.exited.length; i < l; i++) {
                    route = partition.exited[i].route;
                    delete route.context;
                    if (route !== undefined) {
                        if (route._internalReset !== undefined) {
                            route._internalReset(true, transition);
                        }
                        if (route.exit !== undefined) {
                            route.exit(transition);
                        }
                    }
                }
                var oldState = this.oldState = this.state;
                this.state = newState;
                var currentRouteInfos = this.currentRouteInfos = partition.unchanged.slice();
                try {
                    for (i = 0, l = partition.reset.length; i < l; i++) {
                        route = partition.reset[i].route;
                        if (route !== undefined) {
                            if (route._internalReset !== undefined) {
                                route._internalReset(false, transition);
                            }
                        }
                    }
                    for (i = 0, l = partition.updatedContext.length; i < l; i++) {
                        this.routeEnteredOrUpdated(currentRouteInfos, partition.updatedContext[i], false, transition);
                    }
                    for (i = 0, l = partition.entered.length; i < l; i++) {
                        this.routeEnteredOrUpdated(currentRouteInfos, partition.entered[i], true, transition);
                    }
                } catch (e) {
                    this.state = oldState;
                    this.currentRouteInfos = oldState.routeInfos;
                    throw e;
                }
                this.state.queryParams = this.finalizeQueryParamChange(currentRouteInfos, newState.queryParams, transition);
            }
        }, {
            key: 'fireQueryParamDidChange',
            value: function fireQueryParamDidChange(newState, queryParamChangelist) {
                // If queryParams changed trigger event
                if (queryParamChangelist) {
                    // This is a little hacky but we need some way of storing
                    // changed query params given that no activeTransition
                    // is guaranteed to have occurred.
                    this._changedQueryParams = queryParamChangelist.all;
                    this.triggerEvent(newState.routeInfos, true, 'queryParamsDidChange', [queryParamChangelist.changed, queryParamChangelist.all, queryParamChangelist.removed]);
                    this._changedQueryParams = undefined;
                }
            }
        }, {
            key: 'routeEnteredOrUpdated',
            value: function routeEnteredOrUpdated(currentRouteInfos, routeInfo, enter, transition) {
                var route = routeInfo.route,
                    context = routeInfo.context;
                function _routeEnteredOrUpdated(route) {
                    if (enter) {
                        if (route.enter !== undefined) {
                            route.enter(transition);
                        }
                    }
                    if (transition && transition.isAborted) {
                        throw new _transitionAbortedError2.default();
                    }
                    route.context = context;
                    if (route.contextDidChange !== undefined) {
                        route.contextDidChange();
                    }
                    if (route.setup !== undefined) {
                        route.setup(context, transition);
                    }
                    if (transition && transition.isAborted) {
                        throw new _transitionAbortedError2.default();
                    }
                    currentRouteInfos.push(routeInfo);
                    return route;
                }
                // If the route doesn't exist, it means we haven't resolved the route promise yet
                if (route === undefined) {
                    routeInfo.routePromise = routeInfo.routePromise.then(_routeEnteredOrUpdated);
                } else {
                    _routeEnteredOrUpdated(route);
                }
                return true;
            }
        }, {
            key: 'partitionRoutes',
            value: function partitionRoutes(oldState, newState) {
                var oldRouteInfos = oldState.routeInfos;
                var newRouteInfos = newState.routeInfos;
                var routes = {
                    updatedContext: [],
                    exited: [],
                    entered: [],
                    unchanged: [],
                    reset: []
                };
                var routeChanged = void 0,
                    contextChanged = false,
                    i = void 0,
                    l = void 0;
                for (i = 0, l = newRouteInfos.length; i < l; i++) {
                    var oldRouteInfo = oldRouteInfos[i],
                        newRouteInfo = newRouteInfos[i];
                    if (!oldRouteInfo || oldRouteInfo.route !== newRouteInfo.route) {
                        routeChanged = true;
                    }
                    if (routeChanged) {
                        routes.entered.push(newRouteInfo);
                        if (oldRouteInfo) {
                            routes.exited.unshift(oldRouteInfo);
                        }
                    } else if (contextChanged || oldRouteInfo.context !== newRouteInfo.context) {
                        contextChanged = true;
                        routes.updatedContext.push(newRouteInfo);
                    } else {
                        routes.unchanged.push(oldRouteInfo);
                    }
                }
                for (i = newRouteInfos.length, l = oldRouteInfos.length; i < l; i++) {
                    routes.exited.unshift(oldRouteInfos[i]);
                }
                routes.reset = routes.updatedContext.slice();
                routes.reset.reverse();
                return routes;
            }
        }, {
            key: '_updateURL',
            value: function _updateURL(transition, state) {
                var urlMethod = transition.urlMethod;
                if (!urlMethod) {
                    return;
                }
                var routeInfos = state.routeInfos;
                var routeName = routeInfos[routeInfos.length - 1].name;

                var params = {};
                for (var i = routeInfos.length - 1; i >= 0; --i) {
                    var routeInfo = routeInfos[i];
                    (0, _utils.merge)(params, routeInfo.params);
                    if (routeInfo.route.inaccessibleByURL) {
                        urlMethod = null;
                    }
                }
                if (urlMethod) {
                    params.queryParams = transition._visibleQueryParams || state.queryParams;
                    var url = this.recognizer.generate(routeName, params);
                    // transitions during the initial transition must always use replaceURL.
                    // When the app boots, you are at a url, e.g. /foo. If some route
                    // redirects to bar as part of the initial transition, you don't want to
                    // add a history entry for /foo. If you do, pressing back will immediately
                    // hit the redirect again and take you back to /bar, thus killing the back
                    // button
                    var initial = transition.isCausedByInitialTransition;
                    // say you are at / and you click a link to route /foo. In /foo's
                    // route, the transition is aborted using replacewith('/bar').
                    // Because the current url is still /, the history entry for / is
                    // removed from the history. Clicking back will take you to the page
                    // you were on before /, which is often not even the app, thus killing
                    // the back button. That's why updateURL is always correct for an
                    // aborting transition that's not the initial transition
                    var replaceAndNotAborting = urlMethod === 'replace' && !transition.isCausedByAbortingTransition;
                    // because calling refresh causes an aborted transition, this needs to be
                    // special cased - if the initial transition is a replace transition, the
                    // urlMethod should be honored here.
                    var isQueryParamsRefreshTransition = transition.queryParamsOnly && urlMethod === 'replace';
                    // say you are at / and you a `replaceWith(/foo)` is called. Then, that
                    // transition is aborted with `replaceWith(/bar)`. At the end, we should
                    // end up with /bar replacing /. We are replacing the replace. We only
                    // will replace the initial route if all subsequent aborts are also
                    // replaces. However, there is some ambiguity around the correct behavior
                    // here.
                    var replacingReplace = urlMethod === 'replace' && transition.isCausedByAbortingReplaceTransition;
                    if (initial || replaceAndNotAborting || isQueryParamsRefreshTransition || replacingReplace) {
                        this.replaceURL(url);
                    } else {
                        this.updateURL(url);
                    }
                }
            }
        }, {
            key: 'finalizeQueryParamChange',
            value: function finalizeQueryParamChange(resolvedHandlers, newQueryParams, transition) {
                // We fire a finalizeQueryParamChange event which
                // gives the new route hierarchy a chance to tell
                // us which query params it's consuming and what
                // their final values are. If a query param is
                // no longer consumed in the final route hierarchy,
                // its serialized segment will be removed
                // from the URL.
                for (var k in newQueryParams) {
                    if (newQueryParams.hasOwnProperty(k) && newQueryParams[k] === null) {
                        delete newQueryParams[k];
                    }
                }
                var finalQueryParamsArray = [];
                this.triggerEvent(resolvedHandlers, true, 'finalizeQueryParamChange', [newQueryParams, finalQueryParamsArray, transition]);
                if (transition) {
                    transition._visibleQueryParams = {};
                }
                var finalQueryParams = {};
                for (var i = 0, len = finalQueryParamsArray.length; i < len; ++i) {
                    var qp = finalQueryParamsArray[i];
                    finalQueryParams[qp.key] = qp.value;
                    if (transition && qp.visible !== false) {
                        transition._visibleQueryParams[qp.key] = qp.value;
                    }
                }
                return finalQueryParams;
            }
        }, {
            key: 'toReadOnlyInfos',
            value: function toReadOnlyInfos(newTransition, newState) {
                var oldRouteInfos = this.state.routeInfos;
                this.fromInfos(newTransition, oldRouteInfos);
                this.toInfos(newTransition, newState.routeInfos);
                this._lastQueryParams = newState.queryParams;
            }
        }, {
            key: 'fromInfos',
            value: function fromInfos(newTransition, oldRouteInfos) {
                if (newTransition !== undefined && oldRouteInfos.length > 0) {
                    var fromInfos = (0, _routeInfo.toReadOnlyRouteInfo)(oldRouteInfos, Object.assign({}, this._lastQueryParams), true);
                    newTransition.from = fromInfos[fromInfos.length - 1] || null;
                }
            }
        }, {
            key: 'toInfos',
            value: function toInfos(newTransition, newRouteInfos) {
                var includeAttributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                if (newTransition !== undefined && newRouteInfos.length > 0) {
                    var toInfos = (0, _routeInfo.toReadOnlyRouteInfo)(newRouteInfos, Object.assign({}, newTransition[_transition.QUERY_PARAMS_SYMBOL]), includeAttributes);
                    newTransition.to = toInfos[toInfos.length - 1] || null;
                }
            }
        }, {
            key: 'notifyExistingHandlers',
            value: function notifyExistingHandlers(newState, newTransition) {
                var oldRouteInfos = this.state.routeInfos,
                    changing = [],
                    i = void 0,
                    oldRouteInfoLen = void 0,
                    oldHandler = void 0,
                    newRouteInfo = void 0;
                oldRouteInfoLen = oldRouteInfos.length;
                for (i = 0; i < oldRouteInfoLen; i++) {
                    oldHandler = oldRouteInfos[i];
                    newRouteInfo = newState.routeInfos[i];
                    if (!newRouteInfo || oldHandler.name !== newRouteInfo.name) {
                        break;
                    }
                    if (!newRouteInfo.isResolved) {
                        changing.push(oldHandler);
                    }
                }
                this.triggerEvent(oldRouteInfos, true, 'willTransition', [newTransition]);
                this.routeWillChange(newTransition);
                this.willTransition(oldRouteInfos, newState.routeInfos, newTransition);
            }
        }, {
            key: 'reset',
            value: function reset() {
                if (this.state) {
                    (0, _utils.forEach)(this.state.routeInfos.slice().reverse(), function (routeInfo) {
                        var route = routeInfo.route;
                        if (route !== undefined) {
                            if (route.exit !== undefined) {
                                route.exit();
                            }
                        }
                        return true;
                    });
                }
                this.oldState = undefined;
                this.state = new _transitionState2.default();
                this.currentRouteInfos = undefined;
            }
        }, {
            key: 'handleURL',
            value: function handleURL(url) {
                // Perform a URL-based transition, but don't change
                // the URL afterward, since it already happened.
                if (url.charAt(0) !== '/') {
                    url = '/' + url;
                }
                return this.doTransition(url).method(null);
            }
        }, {
            key: 'transitionTo',
            value: function transitionTo(name) {
                for (var _len = arguments.length, contexts = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    contexts[_key - 1] = arguments[_key];
                }

                if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
                    contexts.push(name);
                    return this.doTransition(undefined, contexts, false);
                }
                return this.doTransition(name, contexts);
            }
        }, {
            key: 'intermediateTransitionTo',
            value: function intermediateTransitionTo(name) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                return this.doTransition(name, args, true);
            }
        }, {
            key: 'refresh',
            value: function refresh(pivotRoute) {
                var previousTransition = this.activeTransition;
                var state = previousTransition ? previousTransition[_transition.STATE_SYMBOL] : this.state;
                var routeInfos = state.routeInfos;
                if (pivotRoute === undefined) {
                    pivotRoute = routeInfos[0].route;
                }
                (0, _utils.log)(this, 'Starting a refresh transition');
                var name = routeInfos[routeInfos.length - 1].name;
                var intent = new _namedTransitionIntent2.default(this, name, pivotRoute, [], this._changedQueryParams || state.queryParams);
                var newTransition = this.transitionByIntent(intent, false);
                // if the previous transition is a replace transition, that needs to be preserved
                if (previousTransition && previousTransition.urlMethod === 'replace') {
                    newTransition.method(previousTransition.urlMethod);
                }
                return newTransition;
            }
        }, {
            key: 'replaceWith',
            value: function replaceWith(name) {
                return this.doTransition(name).method('replace');
            }
        }, {
            key: 'generate',
            value: function generate(routeName) {
                for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                    args[_key3 - 1] = arguments[_key3];
                }

                var partitionedArgs = (0, _utils.extractQueryParams)(args),
                    suppliedParams = partitionedArgs[0],
                    queryParams = partitionedArgs[1];
                // Construct a TransitionIntent with the provided params
                // and apply it to the present state of the router.
                var intent = new _namedTransitionIntent2.default(this, routeName, undefined, suppliedParams);
                var state = intent.applyToState(this.state, false);
                var params = {};
                for (var i = 0, len = state.routeInfos.length; i < len; ++i) {
                    var routeInfo = state.routeInfos[i];
                    var routeParams = routeInfo.serialize();
                    (0, _utils.merge)(params, routeParams);
                }
                params.queryParams = queryParams;
                return this.recognizer.generate(routeName, params);
            }
        }, {
            key: 'applyIntent',
            value: function applyIntent(routeName, contexts) {
                var intent = new _namedTransitionIntent2.default(this, routeName, undefined, contexts);
                var state = this.activeTransition && this.activeTransition[_transition.STATE_SYMBOL] || this.state;
                return intent.applyToState(state, false);
            }
        }, {
            key: 'isActiveIntent',
            value: function isActiveIntent(routeName, contexts, queryParams, _state) {
                var state = _state || this.state,
                    targetRouteInfos = state.routeInfos,
                    routeInfo = void 0,
                    len = void 0;
                if (!targetRouteInfos.length) {
                    return false;
                }
                var targetHandler = targetRouteInfos[targetRouteInfos.length - 1].name;
                var recogHandlers = this.recognizer.handlersFor(targetHandler);
                var index = 0;
                for (len = recogHandlers.length; index < len; ++index) {
                    routeInfo = targetRouteInfos[index];
                    if (routeInfo.name === routeName) {
                        break;
                    }
                }
                if (index === recogHandlers.length) {
                    // The provided route name isn't even in the route hierarchy.
                    return false;
                }
                var testState = new _transitionState2.default();
                testState.routeInfos = targetRouteInfos.slice(0, index + 1);
                recogHandlers = recogHandlers.slice(0, index + 1);
                var intent = new _namedTransitionIntent2.default(this, targetHandler, undefined, contexts);
                var newState = intent.applyToHandlers(testState, recogHandlers, targetHandler, true, true);
                var routesEqual = routeInfosEqual(newState.routeInfos, testState.routeInfos);
                if (!queryParams || !routesEqual) {
                    return routesEqual;
                }
                // Get a hash of QPs that will still be active on new route
                var activeQPsOnNewHandler = {};
                (0, _utils.merge)(activeQPsOnNewHandler, queryParams);
                var activeQueryParams = state.queryParams;
                for (var key in activeQueryParams) {
                    if (activeQueryParams.hasOwnProperty(key) && activeQPsOnNewHandler.hasOwnProperty(key)) {
                        activeQPsOnNewHandler[key] = activeQueryParams[key];
                    }
                }
                return routesEqual && !(0, _utils.getChangelist)(activeQPsOnNewHandler, queryParams);
            }
        }, {
            key: 'isActive',
            value: function isActive(routeName) {
                for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = arguments[_key4];
                }

                var partitionedArgs = (0, _utils.extractQueryParams)(args);
                return this.isActiveIntent(routeName, partitionedArgs[0], partitionedArgs[1]);
            }
        }, {
            key: 'trigger',
            value: function trigger(name) {
                for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                    args[_key5 - 1] = arguments[_key5];
                }

                this.triggerEvent(this.currentRouteInfos, false, name, args);
            }
        }]);

        return Router;
    }();

    exports.default = Router;

    function routeInfosEqual(routeInfos, otherRouteInfos) {
        if (routeInfos.length !== otherRouteInfos.length) {
            return false;
        }
        for (var i = 0, len = routeInfos.length; i < len; ++i) {
            if (routeInfos[i] !== otherRouteInfos[i]) {
                return false;
            }
        }
        return true;
    }
    function routeInfosSameExceptQueryParams(routeInfos, otherRouteInfos) {
        if (routeInfos.length !== otherRouteInfos.length) {
            return false;
        }
        for (var i = 0, len = routeInfos.length; i < len; ++i) {
            if (routeInfos[i].name !== otherRouteInfos[i].name) {
                return false;
            }
            if (!paramsEqual(routeInfos[i].params, otherRouteInfos[i].params)) {
                return false;
            }
        }
        return true;
    }
    function paramsEqual(params, otherParams) {
        if (!params && !otherParams) {
            return true;
        } else if (!params && !!otherParams || !!params && !otherParams) {
            // one is falsy but other is not;
            return false;
        }
        var keys = Object.keys(params);
        var otherKeys = Object.keys(otherParams);
        if (keys.length !== otherKeys.length) {
            return false;
        }
        for (var i = 0, len = keys.length; i < len; ++i) {
            var key = keys[i];
            if (params[key] !== otherParams[key]) {
                return false;
            }
        }
        return true;
    }
    //# sourceMappingURL=router.js.map
});
define('router/transition-aborted-error', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var TransitionAbortedError = function () {
        TransitionAbortedError.prototype = Object.create(Error.prototype);
        TransitionAbortedError.prototype.constructor = TransitionAbortedError;
        function TransitionAbortedError(message) {
            var error = Error.call(this, message);
            this.name = 'TransitionAborted';
            this.message = message || 'TransitionAborted';
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, TransitionAbortedError);
            } else {
                this.stack = error.stack;
            }
        }
        return TransitionAbortedError;
    }();
    exports.default = TransitionAbortedError;
});
define("router/transition-intent", ["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var TransitionIntent = exports.TransitionIntent = function TransitionIntent(router) {
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, TransitionIntent);

        this.router = router;
        this.data = data;
    };
});
define('router/transition-intent/named-transition-intent', ['exports', 'router/route-info', 'router/transition-intent', 'router/transition-state', 'router/utils'], function (exports, _routeInfo, _transitionIntent, _transitionState, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _transitionState2 = _interopRequireDefault(_transitionState);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var NamedTransitionIntent = function (_TransitionIntent) {
        _inherits(NamedTransitionIntent, _TransitionIntent);

        function NamedTransitionIntent(router, name, pivotHandler) {
            var contexts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
            var queryParams = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
            var data = arguments[5];

            _classCallCheck(this, NamedTransitionIntent);

            var _this = _possibleConstructorReturn(this, (NamedTransitionIntent.__proto__ || Object.getPrototypeOf(NamedTransitionIntent)).call(this, router, data));

            _this.preTransitionState = undefined;
            _this.name = name;
            _this.pivotHandler = pivotHandler;
            _this.contexts = contexts;
            _this.queryParams = queryParams;
            return _this;
        }

        _createClass(NamedTransitionIntent, [{
            key: 'applyToState',
            value: function applyToState(oldState, isIntermediate) {
                // TODO: WTF fix me
                var partitionedArgs = (0, _utils.extractQueryParams)([this.name].concat(this.contexts)),
                    pureArgs = partitionedArgs[0],
                    handlers = this.router.recognizer.handlersFor(pureArgs[0]);
                var targetRouteName = handlers[handlers.length - 1].handler;
                return this.applyToHandlers(oldState, handlers, targetRouteName, isIntermediate, false);
            }
        }, {
            key: 'applyToHandlers',
            value: function applyToHandlers(oldState, parsedHandlers, targetRouteName, isIntermediate, checkingIfActive) {
                var i = void 0,
                    len = void 0;
                var newState = new _transitionState2.default();
                var objects = this.contexts.slice(0);
                var invalidateIndex = parsedHandlers.length;
                // Pivot handlers are provided for refresh transitions
                if (this.pivotHandler) {
                    for (i = 0, len = parsedHandlers.length; i < len; ++i) {
                        if (parsedHandlers[i].handler === this.pivotHandler._internalName) {
                            invalidateIndex = i;
                            break;
                        }
                    }
                }
                for (i = parsedHandlers.length - 1; i >= 0; --i) {
                    var result = parsedHandlers[i];
                    var name = result.handler;
                    var oldHandlerInfo = oldState.routeInfos[i];
                    var newHandlerInfo = null;
                    if (result.names.length > 0) {
                        if (i >= invalidateIndex) {
                            newHandlerInfo = this.createParamHandlerInfo(name, result.names, objects, oldHandlerInfo);
                        } else {
                            newHandlerInfo = this.getHandlerInfoForDynamicSegment(name, result.names, objects, oldHandlerInfo, targetRouteName, i);
                        }
                    } else {
                        // This route has no dynamic segment.
                        // Therefore treat as a param-based handlerInfo
                        // with empty params. This will cause the `model`
                        // hook to be called with empty params, which is desirable.
                        newHandlerInfo = this.createParamHandlerInfo(name, result.names, objects, oldHandlerInfo);
                    }
                    if (checkingIfActive) {
                        // If we're performing an isActive check, we want to
                        // serialize URL params with the provided context, but
                        // ignore mismatches between old and new context.
                        newHandlerInfo = newHandlerInfo.becomeResolved(null, newHandlerInfo.context);
                        var oldContext = oldHandlerInfo && oldHandlerInfo.context;
                        if (result.names.length > 0 && oldHandlerInfo.context !== undefined && newHandlerInfo.context === oldContext) {
                            // If contexts match in isActive test, assume params also match.
                            // This allows for flexibility in not requiring that every last
                            // handler provide a `serialize` method
                            newHandlerInfo.params = oldHandlerInfo && oldHandlerInfo.params;
                        }
                        newHandlerInfo.context = oldContext;
                    }
                    var handlerToUse = oldHandlerInfo;
                    if (i >= invalidateIndex || newHandlerInfo.shouldSupercede(oldHandlerInfo)) {
                        invalidateIndex = Math.min(i, invalidateIndex);
                        handlerToUse = newHandlerInfo;
                    }
                    if (isIntermediate && !checkingIfActive) {
                        handlerToUse = handlerToUse.becomeResolved(null, handlerToUse.context);
                    }
                    newState.routeInfos.unshift(handlerToUse);
                }
                if (objects.length > 0) {
                    throw new Error('More context objects were passed than there are dynamic segments for the route: ' + targetRouteName);
                }
                if (!isIntermediate) {
                    this.invalidateChildren(newState.routeInfos, invalidateIndex);
                }
                (0, _utils.merge)(newState.queryParams, this.queryParams || {});
                return newState;
            }
        }, {
            key: 'invalidateChildren',
            value: function invalidateChildren(handlerInfos, invalidateIndex) {
                for (var i = invalidateIndex, l = handlerInfos.length; i < l; ++i) {
                    var handlerInfo = handlerInfos[i];
                    if (handlerInfo.isResolved) {
                        var _handlerInfos$i = handlerInfos[i],
                            name = _handlerInfos$i.name,
                            params = _handlerInfos$i.params,
                            route = _handlerInfos$i.route,
                            paramNames = _handlerInfos$i.paramNames;

                        handlerInfos[i] = new _routeInfo.UnresolvedRouteInfoByParam(this.router, name, paramNames, params, route);
                    }
                }
            }
        }, {
            key: 'getHandlerInfoForDynamicSegment',
            value: function getHandlerInfoForDynamicSegment(name, names, objects, oldHandlerInfo, _targetRouteName, i) {
                var objectToUse = void 0;
                if (objects.length > 0) {
                    // Use the objects provided for this transition.
                    objectToUse = objects[objects.length - 1];
                    if ((0, _utils.isParam)(objectToUse)) {
                        return this.createParamHandlerInfo(name, names, objects, oldHandlerInfo);
                    } else {
                        objects.pop();
                    }
                } else if (oldHandlerInfo && oldHandlerInfo.name === name) {
                    // Reuse the matching oldHandlerInfo
                    return oldHandlerInfo;
                } else {
                    if (this.preTransitionState) {
                        var preTransitionHandlerInfo = this.preTransitionState.routeInfos[i];
                        objectToUse = preTransitionHandlerInfo && preTransitionHandlerInfo.context;
                    } else {
                        // Ideally we should throw this error to provide maximal
                        // information to the user that not enough context objects
                        // were provided, but this proves too cumbersome in Ember
                        // in cases where inner template helpers are evaluated
                        // before parent helpers un-render, in which cases this
                        // error somewhat prematurely fires.
                        //throw new Error("Not enough context objects were provided to complete a transition to " + targetRouteName + ". Specifically, the " + name + " route needs an object that can be serialized into its dynamic URL segments [" + names.join(', ') + "]");
                        return oldHandlerInfo;
                    }
                }
                return new _routeInfo.UnresolvedRouteInfoByObject(this.router, name, names, objectToUse);
            }
        }, {
            key: 'createParamHandlerInfo',
            value: function createParamHandlerInfo(name, names, objects, oldHandlerInfo) {
                var params = {};
                // Soak up all the provided string/numbers
                var numNames = names.length;
                var missingParams = [];
                while (numNames--) {
                    // Only use old params if the names match with the new handler
                    var oldParams = oldHandlerInfo && name === oldHandlerInfo.name && oldHandlerInfo.params || {};
                    var peek = objects[objects.length - 1];
                    var paramName = names[numNames];
                    if ((0, _utils.isParam)(peek)) {
                        params[paramName] = '' + objects.pop();
                    } else {
                        // If we're here, this means only some of the params
                        // were string/number params, so try and use a param
                        // value from a previous handler.
                        if (oldParams.hasOwnProperty(paramName)) {
                            params[paramName] = oldParams[paramName];
                        } else {
                            missingParams.push(paramName);
                        }
                    }
                }
                if (missingParams.length > 0) {
                    throw new Error('You didn\'t provide enough string/numeric parameters to satisfy all of the dynamic segments for route ' + name + '.' + (' Missing params: ' + missingParams));
                }
                return new _routeInfo.UnresolvedRouteInfoByParam(this.router, name, names, params);
            }
        }]);

        return NamedTransitionIntent;
    }(_transitionIntent.TransitionIntent);

    exports.default = NamedTransitionIntent;
});
define('router/transition-intent/url-transition-intent', ['exports', 'router/route-info', 'router/transition-intent', 'router/transition-state', 'router/unrecognized-url-error', 'router/utils'], function (exports, _routeInfo, _transitionIntent, _transitionState, _unrecognizedUrlError, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _transitionState2 = _interopRequireDefault(_transitionState);

    var _unrecognizedUrlError2 = _interopRequireDefault(_unrecognizedUrlError);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var URLTransitionIntent = function (_TransitionIntent) {
        _inherits(URLTransitionIntent, _TransitionIntent);

        function URLTransitionIntent(router, url, data) {
            _classCallCheck(this, URLTransitionIntent);

            var _this = _possibleConstructorReturn(this, (URLTransitionIntent.__proto__ || Object.getPrototypeOf(URLTransitionIntent)).call(this, router, data));

            _this.url = url;
            _this.preTransitionState = undefined;
            return _this;
        }

        _createClass(URLTransitionIntent, [{
            key: 'applyToState',
            value: function applyToState(oldState) {
                var newState = new _transitionState2.default();
                var results = this.router.recognizer.recognize(this.url),
                    i = void 0,
                    len = void 0;
                if (!results) {
                    throw new _unrecognizedUrlError2.default(this.url);
                }
                var statesDiffer = false;
                var _url = this.url;
                // Checks if a handler is accessible by URL. If it is not, an error is thrown.
                // For the case where the handler is loaded asynchronously, the error will be
                // thrown once it is loaded.
                function checkHandlerAccessibility(handler) {
                    if (handler && handler.inaccessibleByURL) {
                        throw new _unrecognizedUrlError2.default(_url);
                    }
                    return handler;
                }
                for (i = 0, len = results.length; i < len; ++i) {
                    var result = results[i];
                    var name = result.handler;
                    var paramNames = [];
                    if (this.router.recognizer.hasRoute(name)) {
                        paramNames = this.router.recognizer.handlersFor(name)[i].names;
                    }
                    var newRouteInfo = new _routeInfo.UnresolvedRouteInfoByParam(this.router, name, paramNames, result.params);
                    var route = newRouteInfo.route;
                    if (route) {
                        checkHandlerAccessibility(route);
                    } else {
                        // If the hanlder is being loaded asynchronously, check if we can
                        // access it after it has resolved
                        newRouteInfo.routePromise = newRouteInfo.routePromise.then(checkHandlerAccessibility);
                    }
                    var oldRouteInfo = oldState.routeInfos[i];
                    if (statesDiffer || newRouteInfo.shouldSupercede(oldRouteInfo)) {
                        statesDiffer = true;
                        newState.routeInfos[i] = newRouteInfo;
                    } else {
                        newState.routeInfos[i] = oldRouteInfo;
                    }
                }
                (0, _utils.merge)(newState.queryParams, results.queryParams);
                return newState;
            }
        }]);

        return URLTransitionIntent;
    }(_transitionIntent.TransitionIntent);

    exports.default = URLTransitionIntent;
});
define('router/transition-state', ['exports', 'rsvp', 'router/utils'], function (exports, _rsvp, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.TransitionError = undefined;

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

    var TransitionState = function () {
        function TransitionState() {
            _classCallCheck(this, TransitionState);

            this.routeInfos = [];
            this.queryParams = {};
            this.params = {};
        }

        _createClass(TransitionState, [{
            key: 'promiseLabel',
            value: function promiseLabel(label) {
                var targetName = '';
                (0, _utils.forEach)(this.routeInfos, function (routeInfo) {
                    if (targetName !== '') {
                        targetName += '.';
                    }
                    targetName += routeInfo.name;
                    return true;
                });
                return (0, _utils.promiseLabel)("'" + targetName + "': " + label);
            }
        }, {
            key: 'resolve',
            value: function resolve(shouldContinue, transition) {
                // First, calculate params for this state. This is useful
                // information to provide to the various route hooks.
                var params = this.params;
                (0, _utils.forEach)(this.routeInfos, function (routeInfo) {
                    params[routeInfo.name] = routeInfo.params || {};
                    return true;
                });
                transition.resolveIndex = 0;
                var currentState = this;
                var wasAborted = false;
                // The prelude RSVP.resolve() asyncs us into the promise land.
                return _rsvp.Promise.resolve(null, this.promiseLabel('Start transition')).then(resolveOneRouteInfo, null, this.promiseLabel('Resolve route')).catch(handleError, this.promiseLabel('Handle error'));
                function innerShouldContinue() {
                    return _rsvp.Promise.resolve(shouldContinue(), currentState.promiseLabel('Check if should continue')).catch(function (reason) {
                        // We distinguish between errors that occurred
                        // during resolution (e.g. before"Model/model/afterModel),
                        // and aborts due to a rejecting promise from shouldContinue().
                        wasAborted = true;
                        return _rsvp.Promise.reject(reason);
                    }, currentState.promiseLabel('Handle abort'));
                }
                function handleError(error) {
                    // This is the only possible
                    // reject value of TransitionState#resolve
                    var routeInfos = currentState.routeInfos;
                    var errorHandlerIndex = transition.resolveIndex >= routeInfos.length ? routeInfos.length - 1 : transition.resolveIndex;
                    return _rsvp.Promise.reject(new TransitionError(error, currentState.routeInfos[errorHandlerIndex].route, wasAborted, currentState));
                }
                function proceed(resolvedRouteInfo) {
                    var wasAlreadyResolved = currentState.routeInfos[transition.resolveIndex].isResolved;
                    // Swap the previously unresolved routeInfo with
                    // the resolved routeInfo
                    currentState.routeInfos[transition.resolveIndex++] = resolvedRouteInfo;
                    if (!wasAlreadyResolved) {
                        var route = resolvedRouteInfo.route;

                        if (route !== undefined) {
                            if (route.redirect) {
                                route.redirect(resolvedRouteInfo.context, transition);
                            }
                        }
                    }
                    // Proceed after ensuring that the redirect hook
                    // didn't abort this transition by transitioning elsewhere.
                    return innerShouldContinue().then(resolveOneRouteInfo, null, currentState.promiseLabel('Resolve route'));
                }
                function resolveOneRouteInfo() {
                    if (transition.resolveIndex === currentState.routeInfos.length) {
                        // This is is the only possible
                        // fulfill value of TransitionState#resolve
                        return currentState;
                    }
                    var routeInfo = currentState.routeInfos[transition.resolveIndex];
                    return routeInfo.resolve(innerShouldContinue, transition).then(proceed, null, currentState.promiseLabel('Proceed'));
                }
            }
        }]);

        return TransitionState;
    }();

    exports.default = TransitionState;

    var TransitionError = exports.TransitionError = function TransitionError(error, route, wasAborted, state) {
        _classCallCheck(this, TransitionError);

        this.error = error;
        this.route = route;
        this.wasAborted = wasAborted;
        this.state = state;
    };
});
define('router/transition', ['exports', 'rsvp', 'router/transition-aborted-error', 'router/utils'], function (exports, _rsvp, _transitionAbortedError, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.QUERY_PARAMS_SYMBOL = exports.PARAMS_SYMBOL = exports.STATE_SYMBOL = undefined;
    exports.logAbort = logAbort;
    exports.isTransition = isTransition;
    exports.prepareResult = prepareResult;

    var _transitionAbortedError2 = _interopRequireDefault(_transitionAbortedError);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

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

    var STATE_SYMBOL = exports.STATE_SYMBOL = '__STATE__-2619860001345920-3322w3';
    var PARAMS_SYMBOL = exports.PARAMS_SYMBOL = '__PARAMS__-261986232992830203-23323';
    var QUERY_PARAMS_SYMBOL = exports.QUERY_PARAMS_SYMBOL = '__QPS__-2619863929824844-32323';
    /**
      A Transition is a thennable (a promise-like object) that represents
      an attempt to transition to another route. It can be aborted, either
      explicitly via `abort` or by attempting another transition while a
      previous one is still underway. An aborted transition can also
      be `retry()`d later.
    
      @class Transition
      @constructor
      @param {Object} router
      @param {Object} intent
      @param {Object} state
      @param {Object} error
      @private
     */

    var Transition = function () {
        function Transition(router, intent, state) {
            var _this = this;

            var error = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
            var previousTransition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;

            _classCallCheck(this, Transition);

            this.from = null;
            this.to = undefined;
            this.isAborted = false;
            this.isActive = true;
            this.urlMethod = 'update';
            this.resolveIndex = 0;
            this.queryParamsOnly = false;
            this.isTransition = true;
            this.isCausedByAbortingTransition = false;
            this.isCausedByInitialTransition = false;
            this.isCausedByAbortingReplaceTransition = false;
            this._visibleQueryParams = {};
            this[STATE_SYMBOL] = state || router.state;
            this.intent = intent;
            this.router = router;
            this.data = intent && intent.data || {};
            this.resolvedModels = {};
            this[QUERY_PARAMS_SYMBOL] = {};
            this.promise = undefined;
            this.error = undefined;
            this[PARAMS_SYMBOL] = {};
            this.routeInfos = [];
            this.targetName = undefined;
            this.pivotHandler = undefined;
            this.sequence = -1;
            if (error) {
                this.promise = _rsvp.Promise.reject(error);
                this.error = error;
                return;
            }
            // if you're doing multiple redirects, need the new transition to know if it
            // is actually part of the first transition or not. Any further redirects
            // in the initial transition also need to know if they are part of the
            // initial transition
            this.isCausedByAbortingTransition = !!previousTransition;
            this.isCausedByInitialTransition = !!previousTransition && (previousTransition.isCausedByInitialTransition || previousTransition.sequence === 0);
            // Every transition in the chain is a replace
            this.isCausedByAbortingReplaceTransition = !!previousTransition && previousTransition.urlMethod === 'replace' && (!previousTransition.isCausedByAbortingTransition || previousTransition.isCausedByAbortingReplaceTransition);
            if (state) {
                this[PARAMS_SYMBOL] = state.params;
                this[QUERY_PARAMS_SYMBOL] = state.queryParams;
                this.routeInfos = state.routeInfos;
                var len = state.routeInfos.length;
                if (len) {
                    this.targetName = state.routeInfos[len - 1].name;
                }
                for (var i = 0; i < len; ++i) {
                    var handlerInfo = state.routeInfos[i];
                    // TODO: this all seems hacky
                    if (!handlerInfo.isResolved) {
                        break;
                    }
                    this.pivotHandler = handlerInfo.route;
                }
                this.sequence = router.currentSequence++;
                this.promise = state.resolve(function () {
                    if (_this.isAborted) {
                        return _rsvp.Promise.reject(false, (0, _utils.promiseLabel)('Transition aborted - reject'));
                    }
                    return _rsvp.Promise.resolve(true);
                }, this).catch(function (result) {
                    return _rsvp.Promise.reject(_this.router.transitionDidError(result, _this));
                }, (0, _utils.promiseLabel)('Handle Abort'));
            } else {
                this.promise = _rsvp.Promise.resolve(this[STATE_SYMBOL]);
                this[PARAMS_SYMBOL] = {};
            }
        }
        /**
          The Transition's internal promise. Calling `.then` on this property
          is that same as calling `.then` on the Transition object itself, but
          this property is exposed for when you want to pass around a
          Transition's promise, but not the Transition object itself, since
          Transition object can be externally `abort`ed, while the promise
          cannot.
             @property promise
          @type {Object}
          @public
         */
        /**
          Custom state can be stored on a Transition's `data` object.
          This can be useful for decorating a Transition within an earlier
          hook and shared with a later hook. Properties set on `data` will
          be copied to new transitions generated by calling `retry` on this
          transition.
             @property data
          @type {Object}
          @public
         */
        /**
          A standard promise hook that resolves if the transition
          succeeds and rejects if it fails/redirects/aborts.
             Forwards to the internal `promise` property which you can
          use in situations where you want to pass around a thennable,
          but not the Transition itself.
             @method then
          @param {Function} onFulfilled
          @param {Function} onRejected
          @param {String} label optional string for labeling the promise.
          Useful for tooling.
          @return {Promise}
          @public
         */


        _createClass(Transition, [{
            key: 'then',
            value: function then(onFulfilled, onRejected, label) {
                return this.promise.then(onFulfilled, onRejected, label);
            }
        }, {
            key: 'catch',
            value: function _catch(onRejection, label) {
                return this.promise.catch(onRejection, label);
            }
        }, {
            key: 'finally',
            value: function _finally(callback, label) {
                return this.promise.finally(callback, label);
            }
        }, {
            key: 'abort',
            value: function abort() {
                this.rollback();
                var transition = new Transition(this.router, undefined, undefined, undefined);
                transition.to = this.from;
                transition.from = this.from;
                transition.isAborted = true;
                this.router.routeWillChange(transition);
                this.router.routeDidChange(transition);
                return this;
            }
        }, {
            key: 'rollback',
            value: function rollback() {
                if (!this.isAborted) {
                    (0, _utils.log)(this.router, this.sequence, this.targetName + ': transition was aborted');
                    if (this.intent !== undefined && this.intent !== null) {
                        this.intent.preTransitionState = this.router.state;
                    }
                    this.isAborted = true;
                    this.isActive = false;
                    this.router.activeTransition = undefined;
                }
            }
        }, {
            key: 'redirect',
            value: function redirect(newTransition) {
                this.rollback();
                this.router.routeWillChange(newTransition);
            }
        }, {
            key: 'retry',
            value: function retry() {
                // TODO: add tests for merged state retry()s
                this.abort();
                var newTransition = this.router.transitionByIntent(this.intent, false);
                // inheriting a `null` urlMethod is not valid
                // the urlMethod is only set to `null` when
                // the transition is initiated *after* the url
                // has been updated (i.e. `router.handleURL`)
                //
                // in that scenario, the url method cannot be
                // inherited for a new transition because then
                // the url would not update even though it should
                if (this.urlMethod !== null) {
                    newTransition.method(this.urlMethod);
                }
                return newTransition;
            }
        }, {
            key: 'method',
            value: function method(_method) {
                this.urlMethod = _method;
                return this;
            }
        }, {
            key: 'send',
            value: function send() {
                var ignoreFailure = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                var _name = arguments[1];
                var err = arguments[2];
                var transition = arguments[3];
                var handler = arguments[4];

                this.trigger(ignoreFailure, _name, err, transition, handler);
            }
        }, {
            key: 'trigger',
            value: function trigger() {
                var ignoreFailure = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                var name = arguments[1];

                // TODO: Deprecate the current signature
                if (typeof ignoreFailure === 'string') {
                    name = ignoreFailure;
                    ignoreFailure = false;
                }

                for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                    args[_key - 2] = arguments[_key];
                }

                this.router.triggerEvent(this[STATE_SYMBOL].routeInfos.slice(0, this.resolveIndex + 1), ignoreFailure, name, args);
            }
        }, {
            key: 'followRedirects',
            value: function followRedirects() {
                var router = this.router;
                return this.promise.catch(function (reason) {
                    if (router.activeTransition) {
                        return router.activeTransition.followRedirects();
                    }
                    return _rsvp.Promise.reject(reason);
                });
            }
        }, {
            key: 'toString',
            value: function toString() {
                return 'Transition (sequence ' + this.sequence + ')';
            }
        }, {
            key: 'log',
            value: function log(message) {
                (0, _utils.log)(this.router, this.sequence, message);
            }
        }]);

        return Transition;
    }();

    exports.default = Transition;

    /**
      @private
    
      Logs and returns an instance of TransitionAborted.
     */
    function logAbort(transition) {
        (0, _utils.log)(transition.router, transition.sequence, 'detected abort.');
        return new _transitionAbortedError2.default();
    }
    function isTransition(obj) {
        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj instanceof Transition && obj.isTransition;
    }
    function prepareResult(obj) {
        if (isTransition(obj)) {
            return null;
        }
        return obj;
    }
    //# sourceMappingURL=transition.js.map
});
define('router/unrecognized-url-error', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var UnrecognizedURLError = function () {
        UnrecognizedURLError.prototype = Object.create(Error.prototype);
        UnrecognizedURLError.prototype.constructor = UnrecognizedURLError;
        function UnrecognizedURLError(message) {
            var error = Error.call(this, message);
            this.name = 'UnrecognizedURLError';
            this.message = message || 'UnrecognizedURL';
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, UnrecognizedURLError);
            } else {
                this.stack = error.stack;
            }
        }
        return UnrecognizedURLError;
    }();
    exports.default = UnrecognizedURLError;
});
define('router/utils', ['exports'], function (exports) {
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

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var slice = exports.slice = Array.prototype.slice;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
      Determines if an object is Promise by checking if it is "thenable".
    **/
    function isPromise(p) {
        return p !== null && (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object' && typeof p.then === 'function';
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
});//# sourceMappingURL=router.amd.map
