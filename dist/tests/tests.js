//# sourceMappingURL=core.js.map
define("lib/router/core", [], function () {
  "use strict";
});
define('lib/router/index', ['exports', 'lib/router/router', 'lib/router/transition', 'lib/router/transition-state', 'lib/router/route-info'], function (exports, _router, _transition, _transitionState, _routeInfo) {
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
define('lib/router/route-info', ['exports', 'rsvp', 'lib/router/transition', 'lib/router/utils'], function (exports, _rsvp, _transition2, _utils) {
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
define('lib/router/router', ['exports', 'route-recognizer', 'rsvp', 'lib/router/route-info', 'lib/router/transition', 'lib/router/transition-aborted-error', 'lib/router/transition-intent/named-transition-intent', 'lib/router/transition-intent/url-transition-intent', 'lib/router/transition-state', 'lib/router/utils'], function (exports, _routeRecognizer, _rsvp, _routeInfo, _transition, _transitionAbortedError, _namedTransitionIntent, _urlTransitionIntent, _transitionState, _utils) {
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
define('lib/router/transition-aborted-error', ['exports'], function (exports) {
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
define("lib/router/transition-intent", ["exports"], function (exports) {
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
define('lib/router/transition-intent/named-transition-intent', ['exports', 'lib/router/route-info', 'lib/router/transition-intent', 'lib/router/transition-state', 'lib/router/utils'], function (exports, _routeInfo, _transitionIntent, _transitionState, _utils) {
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
define('lib/router/transition-intent/url-transition-intent', ['exports', 'lib/router/route-info', 'lib/router/transition-intent', 'lib/router/transition-state', 'lib/router/unrecognized-url-error', 'lib/router/utils'], function (exports, _routeInfo, _transitionIntent, _transitionState, _unrecognizedUrlError, _utils) {
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
define('lib/router/transition-state', ['exports', 'rsvp', 'lib/router/utils'], function (exports, _rsvp, _utils) {
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
define('lib/router/transition', ['exports', 'rsvp', 'lib/router/transition-aborted-error', 'lib/router/utils'], function (exports, _rsvp, _transitionAbortedError, _utils) {
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
define('lib/router/unrecognized-url-error', ['exports'], function (exports) {
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
define('lib/router/utils', ['exports'], function (exports) {
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
});
define('tests/async_get_handler_test', ['rsvp', 'tests/test_helpers'], function (_rsvp, _test_helpers) {
    'use strict';

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

    function map(router) {
        router.map(function (match) {
            match('/index').to('index');
            match('/foo').to('foo', function (match) {
                match('/').to('fooIndex');
                match('/bar').to('fooBar');
            });
        });
    }
    // Intentionally use QUnit.module instead of module from test_helpers
    // so that we avoid using Backburner to handle the async portions of
    // the test suite
    var routes = void 0;
    var router = void 0;
    QUnit.module('Async Get Handler', {
        beforeEach: function beforeEach() {
            QUnit.config.testTimeout = 60000;
            routes = {};
        },
        afterEach: function afterEach() {
            QUnit.config.testTimeout = 1000;
        }
    });
    QUnit.test('can transition to lazily-resolved routes', function (assert) {
        var done = assert.async();

        var LazyRouter = function (_TestRouter) {
            _inherits(LazyRouter, _TestRouter);

            function LazyRouter() {
                _classCallCheck(this, LazyRouter);

                return _possibleConstructorReturn(this, (LazyRouter.__proto__ || Object.getPrototypeOf(LazyRouter)).apply(this, arguments));
            }

            _createClass(LazyRouter, [{
                key: 'getRoute',
                value: function getRoute(name) {
                    return new _rsvp.Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(routes[name] || (routes[name] = (0, _test_helpers.createHandler)('empty')));
                        }, 1);
                    });
                }
            }]);

            return LazyRouter;
        }(_test_helpers.TestRouter);

        router = new LazyRouter();
        map(router);
        var fooCalled = false;
        var fooBarCalled = false;
        routes.foo = (0, _test_helpers.createHandler)('foo', {
            model: function model() {
                fooCalled = true;
            }
        });
        routes.fooBar = (0, _test_helpers.createHandler)('fooBar', {
            model: function model() {
                fooBarCalled = true;
            }
        });
        router.transitionTo('/foo/bar').then(function () {
            assert.ok(fooCalled, 'foo is called before transition ends');
            assert.ok(fooBarCalled, 'fooBar is called before transition ends');
            done();
        });
        assert.ok(!fooCalled, 'foo is not called synchronously');
        assert.ok(!fooBarCalled, 'fooBar is not called synchronously');
    });
    QUnit.test('calls hooks of lazily-resolved routes in order', function (assert) {
        var done = assert.async();
        var operations = [];

        var LazyRouter = function (_TestRouter2) {
            _inherits(LazyRouter, _TestRouter2);

            function LazyRouter() {
                _classCallCheck(this, LazyRouter);

                return _possibleConstructorReturn(this, (LazyRouter.__proto__ || Object.getPrototypeOf(LazyRouter)).apply(this, arguments));
            }

            _createClass(LazyRouter, [{
                key: 'getRoute',
                value: function getRoute(name) {
                    operations.push('get handler ' + name);
                    return new _rsvp.Promise(function (resolve) {
                        var timeoutLength = name === 'foo' ? 100 : 1;
                        setTimeout(function () {
                            operations.push('resolved ' + name);
                            resolve(routes[name] || (routes[name] = (0, _test_helpers.createHandler)('empty')));
                        }, timeoutLength);
                    });
                }
            }]);

            return LazyRouter;
        }(_test_helpers.TestRouter);

        router = new LazyRouter();
        map(router);
        routes.foo = (0, _test_helpers.createHandler)('foo', {
            model: function model() {
                operations.push('model foo');
            }
        });
        routes.fooBar = (0, _test_helpers.createHandler)('fooBar', {
            model: function model() {
                operations.push('model fooBar');
            }
        });
        router.transitionTo('/foo/bar').then(function () {
            assert.deepEqual(operations, ['get handler foo', 'get handler fooBar', 'resolved fooBar', 'resolved foo', 'model foo', 'model fooBar'], 'order of operations is correct');
            done();
        }, null);
    });
    //# sourceMappingURL=async_get_handler_test.js.map
});
define('tests/index', ['tests/async_get_handler_test', 'tests/handler_info_test', 'tests/query_params_test', 'tests/router_test', 'tests/transition-aborted-error_test', 'tests/transition_intent_test', 'tests/transition_state_test', 'tests/unrecognized-url-error_test', 'tests/utils_test'], function () {
  'use strict';
});
define('tests/query_params_test', ['rsvp', 'tests/test_helpers'], function (_rsvp, _test_helpers) {
    'use strict';

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

    var router = void 0,
        handlers = void 0,
        expectedUrl = void 0;
    var scenarios = [{
        name: 'Sync Get Handler',
        getHandler: function getHandler(name) {
            return handlers[name] || (handlers[name] = (0, _test_helpers.createHandler)('empty'));
        }
    }, {
        name: 'Async Get Handler',
        getHandler: function getHandler(name) {
            return _rsvp.Promise.resolve(handlers[name] || (handlers[name] = (0, _test_helpers.createHandler)('empty')));
        }
    }];
    scenarios.forEach(function (scenario) {
        (0, _test_helpers.module)('Query Params (' + scenario.name + ')', {
            setup: function setup(assert) {
                handlers = {};
                expectedUrl = undefined;
                map(assert, function (match) {
                    match('/index').to('index');
                    match('/parent').to('parent', function (match) {
                        match('/').to('parentIndex');
                        match('/child').to('parentChild');
                    });
                });
            }
        });
        function map(assert, fn) {
            var QPRouter = function (_TestRouter) {
                _inherits(QPRouter, _TestRouter);

                function QPRouter() {
                    _classCallCheck(this, QPRouter);

                    return _possibleConstructorReturn(this, (QPRouter.__proto__ || Object.getPrototypeOf(QPRouter)).apply(this, arguments));
                }

                _createClass(QPRouter, [{
                    key: 'routeDidChange',
                    value: function routeDidChange() {}
                }, {
                    key: 'routeWillChange',
                    value: function routeWillChange() {}
                }, {
                    key: 'didTransition',
                    value: function didTransition() {}
                }, {
                    key: 'willTransition',
                    value: function willTransition() {}
                }, {
                    key: 'triggerEvent',
                    value: function triggerEvent(handlerInfos, ignoreFailure, name, args) {
                        _test_helpers.trigger.apply(undefined, [handlerInfos, ignoreFailure, name].concat(_toConsumableArray(args)));
                    }
                }, {
                    key: 'replaceURL',
                    value: function replaceURL(name) {
                        this.updateURL(name);
                    }
                }, {
                    key: 'getRoute',
                    value: function getRoute(name) {
                        return scenario.getHandler(name);
                    }
                }, {
                    key: 'getSerializer',
                    value: function getSerializer() {
                        throw new Error('never');
                    }
                }, {
                    key: 'updateURL',
                    value: function updateURL(newUrl) {
                        if (expectedUrl) {
                            assert.equal(newUrl, expectedUrl, 'The url is ' + newUrl + ' as expected');
                        }
                    }
                }]);

                return QPRouter;
            }(_test_helpers.TestRouter);

            router = new QPRouter();
            router.map(fn);
        }
        function consumeAllFinalQueryParams(params, finalParams) {
            for (var key in params) {
                var value = params[key];
                delete params[key];
                finalParams.push({ key: key, value: value });
            }
            return true;
        }
        (0, _test_helpers.test)('a change in query params fires a queryParamsDidChange event', function (assert) {
            assert.expect(7);
            var count = 0;
            handlers.index = (0, _test_helpers.createHandler)('index', {
                setup: function setup() {
                    assert.equal(count, 0, "setup should be called exactly once since we're only changing query params after the first transition");
                },
                events: {
                    finalizeQueryParamChange: consumeAllFinalQueryParams,
                    queryParamsDidChange: function queryParamsDidChange(changed, all) {
                        switch (count) {
                            case 0:
                                assert.ok(false, "shouldn't fire on first trans");
                                break;
                            case 1:
                                assert.deepEqual(changed, { foo: '5' });
                                assert.deepEqual(all, { foo: '5' });
                                break;
                            case 2:
                                assert.deepEqual(changed, { bar: '6' });
                                assert.deepEqual(all, { foo: '5', bar: '6' });
                                break;
                            case 3:
                                assert.deepEqual(changed, { foo: '8', bar: '9' });
                                assert.deepEqual(all, { foo: '8', bar: '9' });
                                break;
                        }
                    }
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index');
            count = 1;
            (0, _test_helpers.transitionTo)(router, '/index?foo=5');
            count = 2;
            (0, _test_helpers.transitionTo)(router, '/index?foo=5&bar=6');
            count = 3;
            (0, _test_helpers.transitionTo)(router, '/index?foo=8&bar=9');
        });
        (0, _test_helpers.test)('transitioning between routes fires a queryParamsDidChange event', function (assert) {
            assert.expect(8);
            var count = 0;
            handlers.parent = (0, _test_helpers.createHandler)('parent', {
                events: {
                    finalizeQueryParamChange: consumeAllFinalQueryParams,
                    queryParamsDidChange: function queryParamsDidChange(changed, all) {
                        switch (count) {
                            case 0:
                                assert.ok(false, "shouldn't fire on first trans");
                                break;
                            case 1:
                                assert.deepEqual(changed, { foo: '5' });
                                assert.deepEqual(all, { foo: '5' });
                                break;
                            case 2:
                                assert.deepEqual(changed, { bar: '6' });
                                assert.deepEqual(all, { foo: '5', bar: '6' });
                                break;
                            case 3:
                                assert.deepEqual(changed, { foo: '8', bar: '9' });
                                assert.deepEqual(all, { foo: '8', bar: '9' });
                                break;
                            case 4:
                                assert.deepEqual(changed, { foo: '10', bar: '11' });
                                assert.deepEqual(all, { foo: '10', bar: '11' });
                        }
                    }
                }
            });
            handlers.parentChild = (0, _test_helpers.createHandler)('parentChild', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange() {
                        // Do nothing since this handler isn't consuming the QPs
                        return true;
                    },
                    queryParamsDidChange: function queryParamsDidChange() {
                        return true;
                    }
                }
            });
            (0, _test_helpers.transitionTo)(router, '/parent/child');
            count = 1;
            (0, _test_helpers.transitionTo)(router, '/parent/child?foo=5');
            count = 2;
            (0, _test_helpers.transitionTo)(router, '/parent/child?foo=5&bar=6');
            count = 3;
            (0, _test_helpers.transitionTo)(router, '/parent/child?foo=8&bar=9');
            count = 4;
            (0, _test_helpers.transitionTo)(router, '/parent?foo=10&bar=11');
        });
        (0, _test_helpers.test)('Refreshing the route when changing only query params should correctly set queryParamsOnly', function (assert) {
            assert.expect(16);
            var initialTransition = true;
            var expectReplace = void 0;
            router.updateURL = function () {
                assert.notOk(expectReplace, 'Expected replace but update was called');
            };
            router.replaceURL = function () {
                assert.ok(expectReplace, 'Replace was called but update was expected');
            };
            handlers.index = (0, _test_helpers.createHandler)('index', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(_params, _finalParams, transition) {
                        if (initialTransition) {
                            assert.notOk(transition.queryParamsOnly, 'should not be query params only transition');
                            initialTransition = false;
                        } else {
                            assert.ok(transition.queryParamsOnly, 'should be query params only transition');
                        }
                    },
                    queryParamsDidChange: function queryParamsDidChange() {
                        router.refresh();
                    }
                }
            });
            handlers.child = (0, _test_helpers.createHandler)('child', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(_params, _finalParams, transition) {
                        assert.notOk(transition.queryParamsOnly, 'should be normal transition');
                        return true;
                    }
                }
            });
            expectReplace = false;
            var transition = (0, _test_helpers.transitionTo)(router, '/index');
            assert.notOk(transition.queryParamsOnly, 'Initial transition is not query params only transition');
            transition = (0, _test_helpers.transitionTo)(router, '/index?foo=123');
            assert.ok(transition.queryParamsOnly, 'Second transition with updateURL intent is query params only');
            expectReplace = true;
            transition = router.replaceWith('/index?foo=456');
            (0, _test_helpers.flushBackburner)();
            assert.ok(transition.queryParamsOnly, 'Third transition with replaceURL intent is query params only');
            expectReplace = false;
            transition = (0, _test_helpers.transitionTo)(router, '/parent/child?foo=789');
            assert.notOk(transition.queryParamsOnly, 'Fourth transition with transtionTo intent is not query params only');
            transition = (0, _test_helpers.transitionTo)(router, '/parent/child?foo=901');
            assert.ok(transition.queryParamsOnly, 'Firth transition with transtionTo intent is query params only');
            transition = (0, _test_helpers.transitionTo)(router, '/index?foo=123');
            assert.notOk(transition.queryParamsOnly, 'Firth transition with transtionTo intent is not query params only');
        });
        (0, _test_helpers.test)('a handler can opt into a full-on transition by calling refresh', function (assert) {
            assert.expect(3);
            var count = 0;
            handlers.index = (0, _test_helpers.createHandler)('index', {
                model: function model() {
                    switch (count) {
                        case 0:
                            assert.ok(true, 'model called in initial transition');
                            break;
                        case 1:
                            assert.ok(true, 'model called during refresh');
                            break;
                        case 2:
                            assert.ok(true, 'model called during refresh w 2 QPs');
                            break;
                        default:
                            assert.ok(false, "shouldn't have been called for " + count);
                    }
                },
                events: {
                    queryParamsDidChange: function queryParamsDidChange() {
                        if (count === 0) {
                            assert.ok(false, "shouldn't fire on first trans");
                        } else {
                            router.refresh(this);
                        }
                    },
                    finalizeQueryParamChange: consumeAllFinalQueryParams
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index');
            count = 1;
            (0, _test_helpers.transitionTo)(router, '/index?foo=5');
            count = 2;
            (0, _test_helpers.transitionTo)(router, '/index?foo=5&wat=lol');
        });
        (0, _test_helpers.test)('at the end of a query param change a finalizeQueryParamChange event is fired', function (assert) {
            assert.expect(5);
            var eventHandled = false;
            var count = 0;
            handlers.index = (0, _test_helpers.createHandler)('index', {
                setup: function setup() {
                    assert.notOk(eventHandled, 'setup should happen before eventHandled');
                },
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(all) {
                        eventHandled = true;
                        switch (count) {
                            case 0:
                                assert.deepEqual(all, {});
                                break;
                            case 1:
                                assert.deepEqual(all, { foo: '5' });
                                break;
                            case 2:
                                assert.deepEqual(all, { foo: '5', bar: '6' });
                                break;
                            case 3:
                                assert.deepEqual(all, { foo: '8', bar: '9' });
                                break;
                        }
                    }
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index');
            count = 1;
            (0, _test_helpers.transitionTo)(router, '/index?foo=5');
            count = 2;
            (0, _test_helpers.transitionTo)(router, '/index?foo=5&bar=6');
            count = 3;
            (0, _test_helpers.transitionTo)(router, '/index?foo=8&bar=9');
        });
        (0, _test_helpers.test)('failing to consume QPs in finalize event tells the router it no longer has those params', function (assert) {
            assert.expect(2);
            handlers.index = (0, _test_helpers.createHandler)('index', {
                setup: function setup() {
                    assert.ok(true, 'setup was entered');
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index?foo=8&bar=9');
            assert.deepEqual(router.state.queryParams, {});
        });
        (0, _test_helpers.test)('consuming QPs in finalize event tells the router those params are active', function (assert) {
            assert.expect(1);
            handlers.index = (0, _test_helpers.createHandler)('index', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(params, finalParams) {
                        finalParams.push({ key: 'foo', value: params.foo });
                    }
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index?foo=8&bar=9');
            assert.deepEqual(router.state.queryParams, { foo: '8' });
        });
        (0, _test_helpers.test)("can hide query params from URL if they're marked as visible=false in finalizeQueryParamChange", function (assert) {
            assert.expect(2);
            handlers.index = (0, _test_helpers.createHandler)('index', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(params, finalParams) {
                        finalParams.push({ key: 'foo', value: params.foo, visible: false });
                        finalParams.push({ key: 'bar', value: params.bar });
                    }
                }
            });
            expectedUrl = '/index?bar=9';
            (0, _test_helpers.transitionTo)(router, '/index?foo=8&bar=9');
            assert.deepEqual(router.state.queryParams, { foo: '8', bar: '9' });
        });
        (0, _test_helpers.test)('transitionTo() works with single query param arg', function (assert) {
            assert.expect(2);
            handlers.index = (0, _test_helpers.createHandler)('index', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(params, finalParams) {
                        finalParams.push({ key: 'foo', value: params.foo });
                        finalParams.push({ key: 'bar', value: params.bar });
                    }
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index?bar=9&foo=8');
            assert.deepEqual(router.state.queryParams, { foo: '8', bar: '9' });
            expectedUrl = '/index?foo=123';
            (0, _test_helpers.transitionTo)(router, { queryParams: { foo: '123' } });
        });
        (0, _test_helpers.test)('handleURL will NOT follow up with a replace URL if query params are already in sync', function (assert) {
            assert.expect(0);
            router.replaceURL = function (url) {
                assert.ok(false, "query params are in sync, this replaceURL shouldn't happen: " + url);
            };
            router.handleURL('/index');
        });
        (0, _test_helpers.test)('model hook receives queryParams', function (assert) {
            assert.expect(1);
            handlers.index = (0, _test_helpers.createHandler)('index', {
                model: function model(params) {
                    assert.deepEqual(params, { queryParams: { foo: '5' } });
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index?foo=5');
        });
        (0, _test_helpers.test)('can cause full transition by calling refresh within queryParamsDidChange', function (assert) {
            assert.expect(5);
            var modelCount = 0;
            handlers.index = (0, _test_helpers.createHandler)('index', {
                model: function model(params) {
                    ++modelCount;
                    if (modelCount === 1) {
                        assert.deepEqual(params, { queryParams: { foo: '5' } });
                    } else if (modelCount === 2) {
                        assert.deepEqual(params, { queryParams: { foo: '6' } });
                    }
                },
                events: {
                    queryParamsDidChange: function queryParamsDidChange() {
                        router.refresh(this);
                    }
                }
            });
            assert.equal(modelCount, 0);
            (0, _test_helpers.transitionTo)(router, '/index?foo=5');
            assert.equal(modelCount, 1);
            (0, _test_helpers.transitionTo)(router, '/index?foo=6');
            assert.equal(modelCount, 2);
        });
        (0, _test_helpers.test)('can retry a query-params refresh', function (assert) {
            var causeRedirect = false;
            map(assert, function (match) {
                match('/index').to('index');
                match('/login').to('login');
            });
            assert.expect(11);
            var redirect = false;
            var indexTransition = void 0;
            handlers.index = (0, _test_helpers.createHandler)('index', {
                model: function model(_params, transition) {
                    if (redirect) {
                        indexTransition = transition;
                        router.transitionTo('login');
                    }
                },
                setup: function setup() {
                    assert.ok(true, 'index#setup');
                },
                events: {
                    queryParamsDidChange: function queryParamsDidChange() {
                        assert.ok(true, 'index#queryParamsDidChange');
                        redirect = causeRedirect;
                        router.refresh(this);
                    },
                    finalizeQueryParamChange: function finalizeQueryParamChange(params, finalParams) {
                        finalParams.foo = params.foo; // TODO wat
                        finalParams.push({ key: 'foo', value: params.foo });
                    }
                }
            });
            handlers.login = (0, _test_helpers.createHandler)('login', {
                setup: function setup() {
                    assert.ok(true, 'login#setup');
                }
            });
            expectedUrl = '/index?foo=abc';
            (0, _test_helpers.transitionTo)(router, '/index?foo=abc');
            causeRedirect = true;
            expectedUrl = '/login';
            (0, _test_helpers.transitionTo)(router, '/index?foo=def');
            (0, _test_helpers.flushBackburner)();
            causeRedirect = false;
            redirect = false;
            assert.ok(indexTransition, 'index transition was saved');
            indexTransition.retry();
            expectedUrl = '/index?foo=def';
        });
        (0, _test_helpers.test)('tests whether query params to transitionTo are considered active', function (assert) {
            assert.expect(6);
            handlers.index = (0, _test_helpers.createHandler)('index', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(params, finalParams) {
                        finalParams.push({ key: 'foo', value: params.foo });
                        finalParams.push({ key: 'bar', value: params.bar });
                    }
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index?foo=8&bar=9');
            assert.deepEqual(router.state.queryParams, { foo: '8', bar: '9' });
            assert.ok(router.isActive('index', { queryParams: { foo: '8', bar: '9' } }), 'The index handler is active');
            assert.ok(router.isActive('index', { queryParams: { foo: 8, bar: 9 } }), 'Works when property is number');
            assert.notOk(router.isActive('index', { queryParams: { foo: '9' } }), 'Only supply one changed query param');
            assert.notOk(router.isActive('index', {
                queryParams: { foo: '8', bar: '10', baz: '11' }
            }), 'A new query param was added');
            assert.notOk(router.isActive('index', { queryParams: { foo: '8', bar: '11' } }), 'A query param changed');
        });
        (0, _test_helpers.test)('tests whether array query params to transitionTo are considered active', function (assert) {
            assert.expect(7);
            handlers.index = (0, _test_helpers.createHandler)('index', {
                events: {
                    finalizeQueryParamChange: function finalizeQueryParamChange(params, finalParams) {
                        finalParams.push({ key: 'foo', value: params.foo });
                    }
                }
            });
            (0, _test_helpers.transitionTo)(router, '/index?foo[]=1&foo[]=2');
            assert.deepEqual(router.state.queryParams, { foo: ['1', '2'] });
            assert.ok(router.isActive('index', { queryParams: { foo: ['1', '2'] } }), 'The index handler is active');
            assert.ok(router.isActive('index', { queryParams: { foo: [1, 2] } }), 'Works when array has numeric elements');
            assert.notOk(router.isActive('index', { queryParams: { foo: ['2', '1'] } }), 'Change order');
            assert.notOk(router.isActive('index', { queryParams: { foo: ['1', '2', '3'] } }), 'Change Length');
            assert.notOk(router.isActive('index', { queryParams: { foo: ['3', '4'] } }), 'Change Content');
            assert.notOk(router.isActive('index', { queryParams: { foo: [] } }), 'Empty Array');
        });
    });
    //# sourceMappingURL=query_params_test.js.map
});
define('tests/router_test', ['router/transition', 'rsvp', 'tests/test_helpers'], function (_transition2, _rsvp, _test_helpers) {
    'use strict';

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

    var router = void 0;
    var url = void 0;
    var routes = void 0;
    function isPresent(maybe) {
        return maybe !== undefined && maybe !== null;
    }
    var serializers = void 0,
        expectedUrl = void 0;
    var scenarios = [{
        name: 'Sync Get Handler',
        async: false,
        getRoute: function getRoute(name) {
            return routes[name] || (routes[name] = (0, _test_helpers.createHandler)('empty'));
        },
        getSerializer: function getSerializer(_name) {
            return undefined;
        }
    }, {
        name: 'Async Get Handler',
        async: true,
        getRoute: function getRoute(name) {
            // Treat 'loading' route transitions are synchronous
            var handler = routes[name] || (routes[name] = (0, _test_helpers.createHandler)('empty'));
            return name === 'loading' ? handler : _rsvp.Promise.resolve(handler);
        },
        getSerializer: function getSerializer(name) {
            return serializers && serializers[name];
        }
    }];
    scenarios.forEach(function (scenario) {
        (0, _test_helpers.module)('The router (' + scenario.name + ')', {
            setup: function setup(assert) {
                routes = {};
                expectedUrl = undefined;
                url = undefined;
                map(assert, function (match) {
                    match('/index').to('index');
                    match('/about').to('about');
                    match('/faq').to('faq');
                    match('/nested').to('nestedParent', function (match) {
                        match('/').to('nestedChild');
                    });
                    match('/posts', function (match) {
                        match('/:id').to('showPost');
                        match('/:postId/:commentId').to('showComment');
                        match('/on/:date').to('showPostsForDate');
                        match('/admin/:id').to('admin', function (match) {
                            match('/posts').to('adminPosts');
                            match('/posts/:post_id').to('adminPost');
                        });
                        match('/').to('postIndex', function (match) {
                            match('/all').to('showAllPosts');
                            // TODO: Support canonical: true
                            match('/').to('showAllPosts');
                            match('/popular').to('showPopularPosts');
                            match('/filter/:filter_id').to('showFilteredPosts');
                        });
                    });
                });
            }
        });
        function map(assert, fn) {
            var Router = function (_TestRouter) {
                _inherits(Router, _TestRouter);

                function Router() {
                    _classCallCheck(this, Router);

                    return _possibleConstructorReturn(this, (Router.__proto__ || Object.getPrototypeOf(Router)).apply(this, arguments));
                }

                _createClass(Router, [{
                    key: 'routeDidChange',
                    value: function routeDidChange() {}
                }, {
                    key: 'routeWillChange',
                    value: function routeWillChange() {}
                }, {
                    key: 'didTransition',
                    value: function didTransition() {}
                }, {
                    key: 'willTransition',
                    value: function willTransition() {}
                }, {
                    key: 'replaceURL',
                    value: function replaceURL(name) {
                        this.updateURL(name);
                    }
                }, {
                    key: 'triggerEvent',
                    value: function triggerEvent(handlerInfos, ignoreFailure, name, args) {
                        _test_helpers.trigger.apply(undefined, [handlerInfos, ignoreFailure, name].concat(_toConsumableArray(args)));
                    }
                }, {
                    key: 'getRoute',
                    value: function getRoute(name) {
                        return scenario.getRoute(name);
                    }
                }, {
                    key: 'getSerializer',
                    value: function getSerializer(name) {
                        return scenario.getSerializer(name);
                    }
                }, {
                    key: 'updateURL',
                    value: function updateURL(newUrl) {
                        if (expectedUrl) {
                            assert.equal(newUrl, expectedUrl, 'The url is ' + newUrl + ' as expected');
                        }
                        url = newUrl;
                    }
                }]);

                return Router;
            }(_test_helpers.TestRouter);

            router = new Router();
            router.map(fn);
        }
        (0, _test_helpers.test)('Mapping adds named routes to the end', function (assert) {
            url = router.recognizer.generate('showPost', { id: 1 });
            assert.equal(url, '/posts/1');
            url = router.recognizer.generate('showAllPosts');
            assert.equal(url, '/posts');
            url = router.recognizer.generate('showComment', {
                postId: 1,
                commentId: 2
            });
            assert.equal(url, '/posts/1/2');
            url = router.generate('showComment', 1, 2);
            assert.equal(url, '/posts/1/2');
        });
        (0, _test_helpers.test)('Handling an invalid URL returns a rejecting promise', function (assert) {
            router.handleURL('/unknown').then((0, _test_helpers.shouldNotHappen)(assert), function (e) {
                assert.equal(e.name, 'UnrecognizedURLError', 'error.name is UnrecognizedURLError');
            });
        });
        function routePath(infos) {
            var path = [];
            for (var i = 0, l = infos.length; i < l; i++) {
                path.push(infos[i].name);
            }
            return path.join('.');
        }
        (0, _test_helpers.test)('Handling a URL triggers model on the handler and passes the result into the setup method', function (assert) {
            assert.expect(4);
            var post = { post: true };
            routes = {
                showPost: (0, _test_helpers.createHandler)('showPost', {
                    model: function model(params) {
                        assert.deepEqual(params, { id: '1', queryParams: {} }, 'showPost#model called with id 1');
                        return post;
                    },
                    setup: function setup(object) {
                        assert.strictEqual(object, post, 'setup was called with expected model');
                        assert.equal(routes.showPost.context, post, 'context was properly set on showPost handler');
                    }
                })
            };
            router.didTransition = function (infos) {
                assert.equal(routePath(infos), 'showPost');
            };
            router.handleURL('/posts/1');
        });
        (0, _test_helpers.test)('isActive should not break on initial intermediate route', function (assert) {
            assert.expect(1);
            router.intermediateTransitionTo('/posts/admin/1/posts');
            assert.ok(router.isActive('admin', '1'));
        });
        (0, _test_helpers.test)('Handling a URL passes in query params', function (assert) {
            assert.expect(3);
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    model: function model(_params, transition) {
                        assert.deepEqual(transition[_transition2.QUERY_PARAMS_SYMBOL], {
                            sort: 'date',
                            filter: 'true'
                        });
                    },
                    events: {
                        finalizeQueryParamChange: function finalizeQueryParamChange(params, finalParams) {
                            assert.ok(true, 'finalizeQueryParamChange');
                            // need to consume the params so that the router
                            // knows that they're active
                            finalParams.push({ key: 'sort', value: params.sort });
                            finalParams.push({ key: 'filter', value: params.filter });
                        }
                    }
                })
            };
            router.handleURL('/index?sort=date&filter');
            (0, _test_helpers.flushBackburner)();
            assert.deepEqual(router.state.queryParams, {
                sort: 'date',
                filter: 'true'
            });
        });
        (0, _test_helpers.test)('handleURL accepts slash-less URLs', function (assert) {
            assert.expect(1);
            routes = {
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    setup: function setup() {
                        assert.ok(true, "showAllPosts' setup called");
                    }
                })
            };
            router.handleURL('posts/all');
        });
        (0, _test_helpers.test)('handleURL accepts query params', function (assert) {
            assert.expect(1);
            routes = {
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    setup: function setup() {
                        assert.ok(true, "showAllPosts' setup called");
                    }
                })
            };
            router.handleURL('/posts/all?sort=name&sortDirection=descending');
        });
        (0, _test_helpers.test)("redirect hook shouldn't get called on parent routes", function (assert) {
            map(assert, function (match) {
                match('/').to('app', function (match) {
                    match('/').to('index');
                    match('/other').to('other');
                });
            });
            var appRedirects = 0;
            routes = {
                app: (0, _test_helpers.createHandler)('app', {
                    redirect: function redirect() {
                        appRedirects++;
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/');
            assert.equal(appRedirects, 1);
            (0, _test_helpers.transitionTo)(router, 'other');
            assert.equal(appRedirects, 1);
        });
        (0, _test_helpers.test)('when transitioning with the same context, setup should only be called once', function (assert) {
            var parentSetupCount = 0,
                childSetupCount = 0;
            var context = { id: 1 };
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post', function (match) {
                    match('/details').to('postDetails');
                });
            });
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    setup: function setup() {
                        parentSetupCount++;
                    }
                }),
                postDetails: (0, _test_helpers.createHandler)('postDetails', {
                    setup: function setup() {
                        childSetupCount++;
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/');
            assert.equal(parentSetupCount, 0, 'precondition - parent not setup');
            assert.equal(childSetupCount, 0, 'precondition - child not setup');
            (0, _test_helpers.transitionTo)(router, 'postDetails', context);
            assert.equal(parentSetupCount, 1, 'after initial transition parent is setup once');
            assert.equal(childSetupCount, 1, 'after initial transition child is setup once');
            (0, _test_helpers.transitionTo)(router, 'postDetails', context);
            assert.equal(parentSetupCount, 1, 'after duplicate transition, parent is still setup once');
            assert.equal(childSetupCount, 1, 'after duplicate transition, child is still setup once');
        });
        (0, _test_helpers.test)('basic route change events', function (assert) {
            assert.expect(11);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post', function (match) {
                    match('/details').to('postDetails');
                });
            });
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    model: function model() {
                        return { title: 'The Title' };
                    }
                }),
                postDetails: (0, _test_helpers.createHandler)('postDetails', {
                    model: function model() {
                        return { body: 'The Content' };
                    }
                })
            };
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (isPresent(transition.to)) {
                    assert.equal(transition.to.localName, 'postDetails');
                    assert.equal(transition.from, null);
                    assert.equal(transition.to.parent.localName, 'post');
                    assert.equal(transition.to.attributes, undefined);
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                var to = transition.to;
                if (isPresent(transition.to)) {
                    assert.equal(to.localName, 'postDetails');
                    assert.equal(transition.from, null);
                    assert.equal(to.parent.localName, 'post');
                    assert.deepEqual(to.attributes, { body: 'The Content' });
                    assert.deepEqual(to.parent.attributes, {
                        title: 'The Title'
                    });
                }
            };
            router.transitionTo('/posts/1/details').then(function () {
                assert.equal(enteredWillChange, 1);
                assert.equal(enteredDidChange, 1);
            });
        });
        (0, _test_helpers.test)('basic events with route metadata', function (assert) {
            assert.expect(10);
            map(assert, function (match) {
                match('/').to('index');
                match('/profile').to('profile');
                match('/posts/:id').to('post', function (match) {
                    match('/details').to('postDetails');
                });
            });
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    buildRouteInfoMetadata: function buildRouteInfoMetadata() {
                        return 'post-page';
                    },
                    model: function model() {
                        return { title: 'The Title' };
                    }
                }),
                profile: (0, _test_helpers.createHandler)('profile', {
                    buildRouteInfoMetadata: function buildRouteInfoMetadata() {
                        return 'profile-page';
                    }
                }),
                postDetails: (0, _test_helpers.createHandler)('postDetails', {
                    buildRouteInfoMetadata: function buildRouteInfoMetadata() {
                        return 'post-details-page';
                    },
                    model: function model() {
                        return { body: 'The Content' };
                    }
                })
            };
            router.routeWillChange = function (transition) {
                if (!isPresent(transition.from) && isPresent(transition.to)) {
                    if (scenario.async) {
                        assert.equal(transition.to.metadata, null, 'initial to leaf');
                        assert.equal(transition.to.parent.metadata, null, 'initial to leaf');
                    } else {
                        assert.equal(transition.to.metadata, 'post-details-page');
                        assert.equal(transition.to.parent.metadata, 'post-page');
                    }
                }
                if (isPresent(transition.from) && isPresent(transition.to)) {
                    if (scenario.async) {
                        assert.equal(transition.from.metadata, 'post-details-page', 'from leaf');
                        assert.equal(transition.from.parent.metadata, 'post-page', 'from parent');
                        assert.equal(transition.to.metadata, null, 'to leaf');
                    } else {
                        assert.equal(transition.from.metadata, 'post-details-page');
                        assert.equal(transition.from.parent.metadata, 'post-page');
                        assert.equal(transition.to.metadata, 'profile-page');
                    }
                }
            };
            router.routeDidChange = function (transition) {
                if (!isPresent(transition.from) && isPresent(transition.to)) {
                    assert.equal(transition.to.metadata, 'post-details-page', 'initial to leaf');
                    assert.equal(transition.to.parent.metadata, 'post-page', 'initial to parent');
                }
                if (isPresent(transition.from) && isPresent(transition.to)) {
                    assert.equal(transition.from.metadata, 'post-details-page', 'from: /profile visited');
                    assert.equal(transition.from.parent.metadata, 'post-page', 'from: /profile visited parent');
                    assert.equal(transition.to.metadata, 'profile-page', 'to: /profile');
                }
            };
            router.transitionTo('/posts/1/details').then(function () {
                return router.transitionTo('/profile');
            });
        });
        (0, _test_helpers.test)('basic route change events with replacement', function (assert) {
            assert.expect(14);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post', function (match) {
                    match('/details').to('postDetails');
                });
                match('/post-details/:id').to('canonicalPostDetails');
            });
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post'),
                postDetails: (0, _test_helpers.createHandler)('postDetails'),
                canonicalPostDetails: (0, _test_helpers.createHandler)('canonicalPostDetails')
            };
            var replacement = false;
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (isPresent(transition.to)) {
                    if (replacement) {
                        assert.equal(transition.to.localName, 'canonicalPostDetails');
                        assert.equal(isPresent(transition.from) && transition.from.localName, 'postDetails');
                        assert.equal(transition.to.parent, null);
                    } else {
                        assert.equal(transition.to.localName, 'postDetails');
                        assert.equal(transition.from, null);
                        assert.equal(transition.to.parent.localName, 'post');
                    }
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                if (isPresent(transition.to)) {
                    if (replacement) {
                        assert.equal(transition.to.localName, 'canonicalPostDetails');
                        assert.equal(isPresent(transition.from) && transition.from.localName, 'postDetails');
                        assert.equal(transition.to.parent, null);
                    } else {
                        assert.equal(transition.to.localName, 'postDetails');
                        assert.equal(transition.from, null);
                        assert.equal(transition.to.parent.localName, 'post');
                    }
                }
            };
            router.transitionTo('/posts/1/details').then(function () {
                replacement = true;
                return router.replaceWith('/post-details/1');
            }).then(function () {
                assert.equal(enteredWillChange, 2);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)('basic route change events with nested replacement', function (assert) {
            assert.expect(12);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post', function (match) {
                    match('/details').to('postDetails');
                });
                match('/post-details/:id').to('canonicalPostDetails');
            });
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post'),
                postDetails: (0, _test_helpers.createHandler)('postDetails', {
                    model: function model() {
                        router.replaceWith('/post-details/1');
                        replacement = true;
                    }
                }),
                canonicalPostDetails: (0, _test_helpers.createHandler)('canonicalPostDetails')
            };
            var replacement = false;
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (isPresent(transition.to)) {
                    if (replacement) {
                        assert.equal(transition.to.localName, 'canonicalPostDetails');
                        assert.equal(transition.from, null);
                        assert.equal(transition.to.parent, null);
                    } else {
                        assert.equal(transition.to.localName, 'postDetails');
                        assert.equal(transition.from, null);
                        assert.equal(transition.to.parent.localName, 'post');
                        replacement = true;
                    }
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                assert.equal(transition.to.localName, 'canonicalPostDetails');
                assert.equal(transition.from, null);
                assert.equal(transition.to.parent, null);
            };
            router.transitionTo('/posts/1/details').catch(function (err) {
                assert.equal(err.name, 'TransitionAborted');
                return router.activeTransition;
            }).then(function () {
                assert.equal(enteredWillChange, 2);
                assert.equal(enteredDidChange, 1);
            });
        });
        (0, _test_helpers.test)('basic route change events with params', function (assert) {
            assert.expect(26);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post');
            });
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    model: function model() {
                        return _rsvp.Promise.resolve('Index');
                    }
                }),
                post: (0, _test_helpers.createHandler)('post', {
                    model: function model(params) {
                        return _rsvp.Promise.resolve(params.id);
                    }
                })
            };
            var newParam = false;
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                assert.deepEqual(transition.to.paramNames, ['id']);
                if (newParam) {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'post');
                    assert.deepEqual(isPresent(transition.from) && transition.from.attributes, '1');
                    assert.deepEqual(transition.to.params, { id: '2' });
                    assert.equal(url, '/posts/1');
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(transition.from, null);
                    assert.notOk(url);
                    assert.deepEqual(transition.to.params, { id: '1' });
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                var to = transition.to;
                assert.deepEqual(transition.to.paramNames, ['id']);
                if (newParam) {
                    assert.equal(to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'post');
                    assert.deepEqual(to.params, { id: '2' });
                    assert.deepEqual(to.attributes, '2');
                    assert.deepEqual(isPresent(transition.from) && transition.from.attributes, '1');
                    assert.equal(url, '/posts/2');
                } else {
                    assert.equal(to.localName, 'post');
                    assert.equal(transition.from, null);
                    assert.equal(url, '/posts/1');
                    assert.deepEqual(to.params, { id: '1' });
                    assert.deepEqual(to.attributes, '1');
                }
            };
            router.transitionTo('/posts/1').then(function () {
                newParam = true;
                return router.transitionTo('/posts/2');
            }).then(function () {
                assert.equal(enteredWillChange, 2);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)('top-level recognizeAndLoad url', function (assert) {
            map(assert, function (match) {
                match('/').to('index');
            });
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    model: function model() {
                        return { name: 'index', data: 1 };
                    }
                })
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            router.recognizeAndLoad('/').then(function (routeInfoWithAttributes) {
                assert.notOk(router.activeTransition, 'Does not create an active transition');
                if (routeInfoWithAttributes === null) {
                    assert.ok(false);
                    return;
                }
                assert.equal(routeInfoWithAttributes.name, 'index');
                assert.equal(routeInfoWithAttributes.localName, 'index');
                assert.equal(routeInfoWithAttributes.parent, null);
                assert.equal(routeInfoWithAttributes.child, null);
                assert.deepEqual(routeInfoWithAttributes.attributes, { name: 'index', data: 1 });
                assert.deepEqual(routeInfoWithAttributes.queryParams, {});
                assert.deepEqual(routeInfoWithAttributes.params, {});
                assert.deepEqual(routeInfoWithAttributes.paramNames, []);
            });
        });
        (0, _test_helpers.test)('top-level parameterized recognizeAndLoad', function (assert) {
            map(assert, function (match) {
                match('/posts/:id').to('posts');
            });
            routes = {
                posts: (0, _test_helpers.createHandler)('posts', {
                    model: function model(params) {
                        return { name: 'posts', data: params.id };
                    }
                })
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            router.recognizeAndLoad('/posts/123').then(function (routeInfoWithAttributes) {
                assert.notOk(router.activeTransition, 'Does not create an active transition');
                if (routeInfoWithAttributes === null) {
                    assert.ok(false);
                    return;
                }
                assert.equal(routeInfoWithAttributes.name, 'posts');
                assert.equal(routeInfoWithAttributes.localName, 'posts');
                assert.equal(routeInfoWithAttributes.parent, null);
                assert.equal(routeInfoWithAttributes.child, null);
                assert.deepEqual(routeInfoWithAttributes.attributes, { name: 'posts', data: '123' });
                assert.deepEqual(routeInfoWithAttributes.queryParams, {});
                assert.deepEqual(routeInfoWithAttributes.params, { id: '123' });
                assert.deepEqual(routeInfoWithAttributes.paramNames, ['id']);
            });
        });
        (0, _test_helpers.test)('nested recognizeAndLoad', function (assert) {
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                showPopularPosts: (0, _test_helpers.createHandler)('showPopularPosts', {
                    model: function model() {
                        return { name: 'showPopularPosts', data: 123 };
                    }
                })
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            router.recognizeAndLoad('/posts/popular').then(function (routeInfoWithAttributes) {
                assert.notOk(router.activeTransition, 'Does not create an active transition');
                if (routeInfoWithAttributes === null) {
                    assert.ok(false);
                    return;
                }
                assert.equal(routeInfoWithAttributes.name, 'showPopularPosts');
                assert.equal(routeInfoWithAttributes.localName, 'showPopularPosts');
                assert.equal(routeInfoWithAttributes.parent.name, 'postIndex');
                assert.equal(routeInfoWithAttributes.child, null);
                assert.deepEqual(routeInfoWithAttributes.attributes, {
                    name: 'showPopularPosts',
                    data: 123
                });
                assert.deepEqual(routeInfoWithAttributes.queryParams, {});
                assert.deepEqual(routeInfoWithAttributes.params, {});
                assert.deepEqual(routeInfoWithAttributes.paramNames, []);
            });
        });
        (0, _test_helpers.test)('nested params recognizeAndLoad', function (assert) {
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                showFilteredPosts: (0, _test_helpers.createHandler)('showFilteredPosts', {
                    model: function model(params) {
                        return { name: 'showFilteredPosts', data: params.filter_id };
                    }
                })
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            router.recognizeAndLoad('/posts/filter/1').then(function (routeInfoWithAttributes) {
                assert.notOk(router.activeTransition, 'Does not create an active transition');
                if (routeInfoWithAttributes === null) {
                    assert.ok(false);
                    return;
                }
                assert.equal(routeInfoWithAttributes.name, 'showFilteredPosts');
                assert.equal(routeInfoWithAttributes.localName, 'showFilteredPosts');
                assert.equal(routeInfoWithAttributes.parent.name, 'postIndex');
                assert.equal(routeInfoWithAttributes.child, null);
                assert.deepEqual(routeInfoWithAttributes.attributes, {
                    name: 'showFilteredPosts',
                    data: '1'
                });
                assert.deepEqual(routeInfoWithAttributes.queryParams, {});
                assert.deepEqual(routeInfoWithAttributes.params, { filter_id: '1' });
                assert.deepEqual(routeInfoWithAttributes.paramNames, ['filter_id']);
            });
        });
        (0, _test_helpers.test)('top-level QPs recognizeAndLoad', function (assert) {
            routes = {
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    model: function model() {
                        return { name: 'showAllPosts', data: 'qp' };
                    }
                })
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            router.recognizeAndLoad('/posts/?a=b').then(function (routeInfoWithAttributes) {
                assert.notOk(router.activeTransition, 'Does not create an active transition');
                if (routeInfoWithAttributes === null) {
                    assert.ok(false);
                    return;
                }
                assert.equal(routeInfoWithAttributes.name, 'showAllPosts');
                assert.equal(routeInfoWithAttributes.localName, 'showAllPosts');
                assert.equal(routeInfoWithAttributes.parent.name, 'postIndex');
                assert.equal(routeInfoWithAttributes.child, null);
                assert.deepEqual(routeInfoWithAttributes.attributes, {
                    name: 'showAllPosts',
                    data: 'qp'
                });
                assert.deepEqual(routeInfoWithAttributes.queryParams, { a: 'b' });
                assert.deepEqual(routeInfoWithAttributes.params, {});
                assert.deepEqual(routeInfoWithAttributes.paramNames, []);
            });
        });
        (0, _test_helpers.test)('top-level params and QPs recognizeAndLoad', function (assert) {
            routes = {
                postsIndex: (0, _test_helpers.createHandler)('postsIndex'),
                showFilteredPosts: (0, _test_helpers.createHandler)('showFilteredPosts', {
                    model: function model(params) {
                        return { name: 'showFilteredPosts', data: params.filter_id };
                    }
                })
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            router.recognizeAndLoad('/posts/filter/123?a=b').then(function (routeInfoWithAttributes) {
                assert.notOk(router.activeTransition, 'Does not create an active transition');
                if (routeInfoWithAttributes === null) {
                    assert.ok(false);
                    return;
                }
                assert.equal(routeInfoWithAttributes.name, 'showFilteredPosts');
                assert.equal(routeInfoWithAttributes.localName, 'showFilteredPosts');
                assert.equal(routeInfoWithAttributes.parent.name, 'postIndex');
                assert.equal(routeInfoWithAttributes.child, null);
                assert.deepEqual(routeInfoWithAttributes.attributes, {
                    name: 'showFilteredPosts',
                    data: '123'
                });
                assert.deepEqual(routeInfoWithAttributes.queryParams, { a: 'b' });
                assert.deepEqual(routeInfoWithAttributes.params, { filter_id: '123' });
                assert.deepEqual(routeInfoWithAttributes.paramNames, ['filter_id']);
            });
        });
        (0, _test_helpers.test)('unrecognized url rejects', function (assert) {
            router.recognizeAndLoad('/fixzzz').then(function () {
                assert.ok(false, 'never here');
            }, function (reason) {
                assert.equal(reason, 'URL /fixzzz was not recognized');
            });
        });
        (0, _test_helpers.test)('top-level recognize url', function (assert) {
            map(assert, function (match) {
                match('/').to('index');
            });
            routes = {
                post: (0, _test_helpers.createHandler)('post')
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            var routeInfo = router.recognize('/');
            assert.notOk(router.activeTransition, 'Does not create an active transition');
            if (routeInfo === null) {
                assert.ok(false);
                return;
            }
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            assert.equal(routeInfo.name, 'index');
            assert.equal(routeInfo.localName, 'index');
            assert.equal(routeInfo.parent, null);
            assert.equal(routeInfo.child, null);
            assert.deepEqual(routeInfo.queryParams, {});
            assert.deepEqual(routeInfo.params, {});
            assert.deepEqual(routeInfo.paramNames, []);
        });
        (0, _test_helpers.test)('top-level recognize url with params', function (assert) {
            map(assert, function (match) {
                match('/posts/:id').to('post');
            });
            routes = {
                post: (0, _test_helpers.createHandler)('post')
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            var routeInfo = router.recognize('/posts/123');
            assert.notOk(router.activeTransition, 'Does not create an active transition');
            if (routeInfo === null) {
                assert.ok(false);
                return;
            }
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            assert.equal(routeInfo.name, 'post');
            assert.equal(routeInfo.localName, 'post');
            assert.equal(routeInfo.parent, null);
            assert.equal(routeInfo.child, null);
            assert.deepEqual(routeInfo.queryParams, {});
            assert.deepEqual(routeInfo.params, { id: '123' });
            assert.deepEqual(routeInfo.paramNames, ['id']);
        });
        (0, _test_helpers.test)('nested recognize url', function (assert) {
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                showPopularPosts: (0, _test_helpers.createHandler)('showPopularPosts')
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            var routeInfo = router.recognize('/posts/popular');
            assert.notOk(router.activeTransition, 'Does not create an active transition');
            if (routeInfo === null) {
                assert.ok(false);
                return;
            }
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            assert.equal(routeInfo.name, 'showPopularPosts');
            assert.equal(routeInfo.localName, 'showPopularPosts');
            assert.equal(routeInfo.parent.name, 'postIndex');
            assert.equal(routeInfo.child, null);
            assert.deepEqual(routeInfo.queryParams, {});
            assert.deepEqual(routeInfo.params, {});
            assert.deepEqual(routeInfo.paramNames, []);
        });
        (0, _test_helpers.test)('nested recognize url with params', function (assert) {
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                showFilteredPosts: (0, _test_helpers.createHandler)('showFilteredPosts')
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            var routeInfo = router.recognize('/posts/filter/123');
            assert.notOk(router.activeTransition, 'Does not create an active transition');
            if (routeInfo === null) {
                assert.ok(false);
                return;
            }
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            assert.equal(routeInfo.name, 'showFilteredPosts');
            assert.equal(routeInfo.localName, 'showFilteredPosts');
            assert.equal(routeInfo.parent.name, 'postIndex');
            assert.equal(routeInfo.child, null);
            assert.deepEqual(routeInfo.queryParams, {});
            assert.deepEqual(routeInfo.params, { filter_id: '123' });
            assert.deepEqual(routeInfo.paramNames, ['filter_id']);
        });
        (0, _test_helpers.test)('top-level recognize url with QPs', function (assert) {
            map(assert, function (match) {
                match('/').to('index');
            });
            routes = {
                index: (0, _test_helpers.createHandler)('index')
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            var routeInfo = router.recognize('/?a=123');
            assert.notOk(router.activeTransition, 'Does not create an active transition');
            if (routeInfo === null) {
                assert.ok(false);
                return;
            }
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            assert.equal(routeInfo.name, 'index');
            assert.equal(routeInfo.localName, 'index');
            assert.equal(routeInfo.parent, null);
            assert.equal(routeInfo.child, null);
            assert.deepEqual(routeInfo.queryParams, { a: '123' });
            assert.deepEqual(routeInfo.params, {});
            assert.deepEqual(routeInfo.paramNames, []);
        });
        (0, _test_helpers.test)('nested recognize url with QPs', function (assert) {
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                showPopularPosts: (0, _test_helpers.createHandler)('showPopularPosts')
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            var routeInfo = router.recognize('/posts/popular?fizz=bar');
            assert.notOk(router.activeTransition, 'Does not create an active transition');
            if (routeInfo === null) {
                assert.ok(false);
                return;
            }
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            assert.equal(routeInfo.name, 'showPopularPosts');
            assert.equal(routeInfo.localName, 'showPopularPosts');
            assert.equal(routeInfo.parent.name, 'postIndex');
            assert.equal(routeInfo.child, null);
            assert.deepEqual(routeInfo.queryParams, { fizz: 'bar' });
            assert.deepEqual(routeInfo.params, {});
            assert.deepEqual(routeInfo.paramNames, []);
        });
        (0, _test_helpers.test)('nested recognize url with QPs and params', function (assert) {
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                showFilteredPosts: (0, _test_helpers.createHandler)('showFilteredPosts')
            };
            assert.notOk(router.activeTransition, 'Does not start with an active transition');
            var routeInfo = router.recognize('/posts/filter/123?fizz=bar');
            assert.notOk(router.activeTransition, 'Does not create an active transition');
            if (routeInfo === null) {
                assert.ok(false);
                return;
            }
            router.replaceURL = function () {
                assert.ok(false, 'Should not replace the URL');
            };
            router.updateURL = function () {
                assert.ok(false, 'Should not update the URL');
            };
            assert.equal(routeInfo.name, 'showFilteredPosts');
            assert.equal(routeInfo.localName, 'showFilteredPosts');
            assert.equal(routeInfo.parent.name, 'postIndex');
            assert.equal(routeInfo.child, null);
            assert.deepEqual(routeInfo.queryParams, { fizz: 'bar' });
            assert.deepEqual(routeInfo.params, { filter_id: '123' });
            assert.deepEqual(routeInfo.paramNames, ['filter_id']);
        });
        (0, _test_helpers.test)('unrecognized url returns null', function (assert) {
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post');
            });
            routes = {
                post: (0, _test_helpers.createHandler)('post')
            };
            var routeInfo = router.recognize('/fixzzz');
            assert.equal(routeInfo, null, 'Unrecognized url');
        });
        (0, _test_helpers.test)('basic route change events with nested params', function (assert) {
            assert.expect(14);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id/foo').to('post');
            });
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post')
            };
            var newParam = false;
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (newParam) {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'post');
                    assert.deepEqual(transition.to.params, { id: '2' });
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(transition.from, null);
                    assert.deepEqual(transition.to.params, { id: '1' });
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                if (newParam) {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'post');
                    assert.deepEqual(transition.to.params, { id: '2' });
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(transition.from, null);
                    assert.deepEqual(transition.to.params, { id: '1' });
                }
            };
            router.transitionTo('/posts/1/foo').then(function () {
                newParam = true;
                return router.transitionTo('/posts/2/foo');
            }).then(function () {
                assert.equal(enteredWillChange, 2);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)('basic route change events with query params', function (assert) {
            assert.expect(20);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post');
            });
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post')
            };
            var newParam = false;
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (newParam) {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'post');
                    assert.deepEqual(transition.to.queryParams, { trk: 'b' });
                    assert.deepEqual(isPresent(transition.from) && transition.from.queryParams, { trk: 'a' });
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(transition.from, null);
                    assert.deepEqual(transition.to.queryParams, { trk: 'a' });
                }
                assert.deepEqual(transition.to.params, { id: '1' });
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                if (newParam) {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'post');
                    assert.deepEqual(transition.to.queryParams, { trk: 'b' });
                    assert.deepEqual(isPresent(transition.from) && transition.from.queryParams, { trk: 'a' });
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(transition.from, null);
                    assert.deepEqual(transition.to.queryParams, { trk: 'a' });
                }
                assert.deepEqual(transition.to.params, { id: '1' });
            };
            router.transitionTo('/posts/1?trk=a').then(function () {
                newParam = true;
                return router.transitionTo('/posts/1?trk=b');
            }).then(function () {
                assert.equal(enteredWillChange, 2);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)('basic route to one with query params', function (assert) {
            assert.expect(8);
            map(assert, function (match) {
                match('/').to('index');
                match('/search').to('search');
            });
            routes = {
                search: (0, _test_helpers.createHandler)('search')
            };
            var newParam = false;
            router.routeWillChange = function (transition) {
                if (newParam) {
                    assert.deepEqual(transition.to.queryParams, { term: 'b' }, 'going to page with qps');
                    assert.deepEqual(isPresent(transition.from) && transition.from.queryParams, {}, 'from never has qps');
                } else {
                    assert.equal(transition.from, null);
                    assert.deepEqual(transition.to.queryParams, {});
                }
            };
            router.routeDidChange = function (transition) {
                if (newParam) {
                    assert.deepEqual(transition.to.queryParams, { term: 'b' });
                    assert.deepEqual(isPresent(transition.from) && transition.from.queryParams, {});
                } else {
                    assert.equal(transition.from, null);
                    assert.deepEqual(transition.to.queryParams, {});
                }
            };
            router.transitionTo('/').then(function () {
                newParam = true;
                return router.transitionTo('search', { queryParams: { term: 'b' } });
            });
        });
        (0, _test_helpers.test)('redirects route events', function (assert) {
            assert.expect(19);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts', function (match) {
                    match('/:id').to('post');
                    match('/details').to('postDetails');
                });
                match('/foo', function (match) {
                    match('/').to('foo', function (match) {
                        match('/bar').to('bar');
                    });
                });
                match('/ok').to('ok');
            });
            var redirected1 = false;
            var redirected2 = false;
            var initial = true;
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    model: function model() {
                        redirected1 = true;
                        router.transitionTo('/foo/bar');
                    }
                }),
                foo: (0, _test_helpers.createHandler)('foo', {
                    model: function model() {
                        redirected1 = false;
                        redirected2 = true;
                        router.transitionTo('/ok');
                    }
                }),
                ok: (0, _test_helpers.createHandler)('ok'),
                bar: (0, _test_helpers.createHandler)('bar'),
                postDetails: (0, _test_helpers.createHandler)('postDetails')
            };
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index');
                    assert.equal(transition.from, null);
                    assert.equal(transition.to.parent, null);
                } else if (redirected1) {
                    assert.equal(transition.to.localName, 'bar');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.parent.localName, 'foo');
                } else if (redirected2) {
                    assert.equal(transition.to.localName, 'ok');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.parent, null);
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.parent, null);
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index');
                    assert.equal(transition.from, null);
                    initial = false;
                } else {
                    assert.equal(transition.to.localName, 'ok');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                }
            };
            router.transitionTo('/').then(function () {
                return router.transitionTo('/posts/1');
            }).catch(function (err) {
                console.log(err);
                assert.equal(err.name, 'TransitionAborted');
                return router.activeTransition;
            }).then(function () {
                assert.equal(enteredWillChange, 4);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)('abort route events', function (assert) {
            assert.expect(19);
            map(assert, function (match) {
                match('/').to('index');
                match('/posts', function (match) {
                    match('/:id').to('post');
                    match('/details').to('postDetails');
                });
                match('/foo', function (match) {
                    match('/').to('foo', function (match) {
                        match('/bar').to('bar');
                    });
                });
            });
            var redirected = false;
            var initial = true;
            var aborted = false;
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    model: function model() {
                        redirected = true;
                        router.transitionTo('/foo/bar');
                    }
                }),
                foo: (0, _test_helpers.createHandler)('foo', {
                    model: function model(_model, transition) {
                        aborted = true;
                        redirected = false;
                        transition.abort();
                    }
                }),
                bar: (0, _test_helpers.createHandler)('bar'),
                postDetails: (0, _test_helpers.createHandler)('postDetails')
            };
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index');
                    assert.equal(transition.from, null);
                    assert.equal(transition.to.parent, null);
                } else if (redirected) {
                    assert.equal(transition.to.localName, 'bar');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.parent.localName, 'foo');
                } else if (aborted) {
                    assert.equal(transition.isAborted, true);
                    assert.equal(transition.to, transition.from);
                    assert.equal(transition.to.localName, 'index');
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.parent, null);
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index');
                    assert.equal(transition.from, null);
                    initial = false;
                } else {
                    assert.equal(transition.to.localName, 'index');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                }
            };
            router.transitionTo('/').then(function () {
                return router.transitionTo('/posts/1');
            }).catch(function (err) {
                assert.equal(err.name, 'TransitionAborted');
                return router.activeTransition;
            }).then(function () {
                assert.equal(enteredWillChange, 4);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)('abort query param only', function (assert) {
            assert.expect(6);
            map(assert, function (match) {
                match('/').to('index');
            });
            routes = {
                search: (0, _test_helpers.createHandler)('search')
            };
            var newParam = false;
            var initial = true;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                if (!initial) {
                    assert.ok(false, 'updateURL should not be called');
                }
            };
            router.routeWillChange = function (transition) {
                if (!transition.isAborted) {
                    if (newParam) {
                        assert.deepEqual(transition.to.queryParams, { term: 'b' }, 'going to page with qps');
                        assert.deepEqual(isPresent(transition.from) && transition.from.queryParams, {}, 'from never has qps');
                    } else {
                        assert.strictEqual(transition.from, null, 'null transition from');
                        assert.deepEqual(transition.to.queryParams, {}, 'empty transition queryParams');
                    }
                }
                if (!initial) {
                    if (!transition.isAborted) {
                        newParam = false;
                        transition.abort();
                    }
                }
            };
            router.routeDidChange = function (transition) {
                if (!transition.isAborted) {
                    assert.strictEqual(transition.from, null, 'routeDidChange null from transition');
                    assert.deepEqual(transition.to.queryParams, {}, 'routeDidChange empty queryParams');
                }
            };
            router.transitionTo('/').then(function () {
                newParam = true;
                initial = false;
                return router.transitionTo({ queryParams: { term: 'b' } });
            });
        });
        (0, _test_helpers.test)('always has a transition through the substates', function (assert) {
            map(assert, function (match) {
                match('/').to('index');
                match('/posts', function (match) {
                    match('/:id').to('post');
                    match('/details').to('postDetails');
                });
                match('/foo', function (match) {
                    match('/').to('foo', function (match) {
                        match('/bar').to('bar');
                    });
                });
                match('/err').to('fooError');
            });
            var enterSubstate = false;
            var initial = true;
            var isAborted = false;
            var errorHandled = false;
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    beforeModel: function beforeModel(transition) {
                        isAborted = true;
                        transition.abort();
                        enterSubstate = true;
                        router.intermediateTransitionTo('fooError');
                    }
                }),
                foo: (0, _test_helpers.createHandler)('foo')
            };
            router.transitionDidError = function (error, transition) {
                if (error.wasAborted || transition.isAborted) {
                    return (0, _transition2.logAbort)(transition);
                } else {
                    transition.trigger(false, 'error', error.error, transition, error.route);
                    if (errorHandled) {
                        transition.rollback();
                        router.routeDidChange(transition);
                        return transition;
                    } else {
                        transition.abort();
                        return error.error;
                    }
                }
            };
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index', 'initial');
                    assert.equal(transition.from, null, 'initial');
                    assert.equal(transition.to.parent, null, 'initial');
                } else if (isAborted) {
                    assert.equal(transition.to.localName, 'index', 'aborted');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index', 'aborted');
                } else if (enterSubstate) {
                    assert.equal(transition.to.localName, 'fooError', 'substate');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index', 'substate');
                    assert.equal(transition.to.parent.localName, 'foo', 'substate');
                } else {
                    assert.equal(transition.to.localName, 'post', 'to post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index', 'to post');
                    assert.equal(transition.to.parent, null, 'to post');
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index', 'initial');
                    assert.equal(transition.from, null, 'initial');
                    initial = false;
                } else if (isAborted) {
                    assert.equal(transition.to.localName, 'index', 'aborted');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index', 'aborted');
                    isAborted = false;
                } else {
                    assert.equal(transition.to.localName, 'bar');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                }
            };
            router.transitionTo('/').then(function () {
                return router.transitionTo('/posts/1');
            }).catch(function (err) {
                assert.equal(err.name, 'TransitionAborted');
                return router.activeTransition;
            }).finally(function () {
                assert.equal(enteredWillChange, 4);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)('error route events', function (assert) {
            map(assert, function (match) {
                match('/').to('index');
                match('/posts', function (match) {
                    match('/:id').to('post');
                    match('/details').to('postDetails');
                });
                match('/foo', function (match) {
                    match('/').to('foo', function (match) {
                        match('/bar').to('bar');
                    });
                });
                match('/err').to('fooError');
            });
            var redirected = false;
            var initial = true;
            var errored = false;
            var errorHandled = false;
            var enteredWillChange = 0;
            var enteredDidChange = 0;
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    model: function model() {
                        redirected = true;
                        router.transitionTo('/foo/bar');
                    }
                }),
                foo: (0, _test_helpers.createHandler)('foo', {
                    model: function model() {
                        errored = true;
                        redirected = false;
                        throw new Error('boom');
                    },

                    events: {
                        error: function error() {
                            errorHandled = true;
                            router.intermediateTransitionTo('fooError');
                        }
                    }
                }),
                fooError: (0, _test_helpers.createHandler)('fooError'),
                bar: (0, _test_helpers.createHandler)('bar'),
                postDetails: (0, _test_helpers.createHandler)('postDetails')
            };
            router.transitionDidError = function (error, transition) {
                if (error.wasAborted || transition.isAborted) {
                    return (0, _transition2.logAbort)(transition);
                } else {
                    transition.trigger(false, 'error', error.error, transition, error.route);
                    if (errorHandled) {
                        transition.rollback();
                        router.toInfos(transition, router.state.routeInfos, true);
                        router.routeDidChange(transition);
                        return transition;
                    } else {
                        transition.abort();
                        return error.error;
                    }
                }
            };
            router.routeWillChange = function (transition) {
                enteredWillChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index');
                    assert.equal(transition.from, null);
                    assert.equal(transition.to.parent, null);
                } else if (redirected) {
                    assert.equal(transition.to.localName, 'bar');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.parent.localName, 'foo');
                } else if (errored) {
                    assert.equal(transition.isAborted, false);
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.localName, 'fooError');
                } else {
                    assert.equal(transition.to.localName, 'post');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                    assert.equal(transition.to.parent, null);
                }
            };
            router.routeDidChange = function (transition) {
                enteredDidChange++;
                if (initial) {
                    assert.equal(transition.to.localName, 'index');
                    assert.equal(transition.from, null);
                    initial = false;
                } else {
                    assert.equal(transition.to.localName, 'fooError');
                    assert.equal(isPresent(transition.from) && transition.from.localName, 'index');
                }
            };
            router.transitionTo('/').then(function () {
                return router.transitionTo('/posts/1');
            }).catch(function (err) {
                assert.equal(err.name, 'TransitionAborted');
                return router.activeTransition;
            }).finally(function () {
                assert.equal(enteredWillChange, 4);
                assert.equal(enteredDidChange, 2);
            });
        });
        (0, _test_helpers.test)("when transitioning to a new parent and child state, the parent's context should be available to the child's model", function (assert) {
            assert.expect(1);
            var contexts = [];
            map(assert, function (match) {
                match('/').to('index');
                match('/posts/:id').to('post', function (match) {
                    match('/details').to('postDetails');
                });
            });
            routes = {
                post: (0, _test_helpers.createHandler)('post', {
                    model: function model() {
                        return contexts;
                    }
                }),
                postDetails: (0, _test_helpers.createHandler)('postDetails', {
                    name: 'postDetails',
                    afterModel: function afterModel(_model, transition) {
                        contexts.push(transition.resolvedModels.post);
                    }
                })
            };
            router.handleURL('/').then(function () {
                // This is a crucial part of the test
                // In some cases, calling `generate` was preventing `model` from being called
                router.generate('postDetails', { id: 1 });
                return router.transitionTo('postDetails', { id: 1 });
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function (value) {
                assert.deepEqual(contexts, [{ id: 1 }], 'parent context is available');
                return value;
            }, (0, _test_helpers.shouldNotHappen)(assert));
        });
        (0, _test_helpers.test)('handleURL: Handling a nested URL triggers each handler', function (assert) {
            assert.expect(37);
            var posts = [];
            var allPosts = { all: true };
            var popularPosts = { popular: true };
            var amazingPosts = { id: 'amazing' };
            var sadPosts = { id: 'sad' };
            var counter = 0;
            var postIndexHandler = (0, _test_helpers.createHandler)('postIndex', {
                model: function model(params, transition) {
                    assert.equal(transition.from, null, 'initial transition');
                    assert.equal(transition.to && transition.to.localName, 'showAllPosts', 'going to leaf');
                    // this will always get called, since it's at the root
                    // of all of the routes tested here
                    assert.deepEqual(params, { queryParams: {} }, 'params should be empty in postIndexHandler#model');
                    return posts;
                },
                setup: function setup(context) {
                    if (counter === 0) {
                        assert.equal(postIndexHandler.context, posts, 'postIndexHandler context should be set up in postIndexHandler#setup');
                        assert.strictEqual(context, posts, 'The object passed in to postIndexHandler#setup should be posts');
                    } else {
                        assert.ok(false, 'Should not get here');
                    }
                }
            });
            var showAllPostsHandler = (0, _test_helpers.createHandler)('showAllPosts', {
                model: function model(params, transition) {
                    if (counter > 0 && counter < 4) {
                        assert.equal(postIndexHandler.context, posts, 'postIndexHandler context should be set up in showAllPostsHandler#model');
                    }
                    if (counter < 4) {
                        assert.equal(transition.from, null, 'initial transition');
                        assert.equal(transition.to && transition.to.localName, 'showAllPosts', 'at leaf');
                        assert.deepEqual(params, { queryParams: {} }, 'params should be empty in showAllPostsHandler#model');
                        return allPosts;
                    } else {
                        assert.ok(false, 'Should not get here');
                    }
                    return;
                },
                setup: function setup(context) {
                    if (counter === 0) {
                        assert.equal(postIndexHandler.context, posts, 'postIndexHandler context should be set up in showAllPostsHandler#setup');
                        assert.equal(showAllPostsHandler.context, allPosts, 'showAllPostsHandler context should be set up in showAllPostsHandler#setup');
                        assert.strictEqual(context, allPosts, 'The object passed in should be allPosts in showAllPostsHandler#setup');
                    } else {
                        assert.ok(false, 'Should not get here');
                    }
                }
            });
            var showPopularPostsHandler = (0, _test_helpers.createHandler)('showPopularPosts', {
                model: function model(params) {
                    if (counter < 3) {
                        assert.ok(false, 'Should not get here');
                    } else if (counter === 3) {
                        assert.equal(postIndexHandler.context, posts, 'postIndexHandler context should be set up in showPopularPostsHandler#model');
                        assert.deepEqual(params, { queryParams: {} }, 'params should be empty in showPopularPostsHandler#serialize');
                        return popularPosts;
                    } else {
                        assert.ok(false, 'Should not get here');
                    }
                    return;
                },
                setup: function setup(context) {
                    if (counter === 3) {
                        assert.equal(postIndexHandler.context, posts, 'postIndexHandler context should be set up in showPopularPostsHandler#setup');
                        assert.equal(showPopularPostsHandler.context, popularPosts, 'showPopularPostsHandler context should be set up in showPopularPostsHandler#setup');
                        assert.strictEqual(context, popularPosts, 'The object passed to showPopularPostsHandler#setup should be popular posts');
                    } else {
                        assert.ok(false, 'Should not get here');
                    }
                }
            });
            var showFilteredPostsHandler = (0, _test_helpers.createHandler)('showFilteredPosts', {
                model: function model(params, transition) {
                    if (counter < 4) {
                        assert.ok(false, 'Should not get here');
                    } else if (counter === 4) {
                        assert.equal(transition.from && transition.from.localName, 'showPopularPosts');
                        assert.equal(postIndexHandler.context, posts, 'postIndexHandler context should be set up in showFilteredPostsHandler#model');
                        assert.deepEqual(params, { filter_id: 'amazing', queryParams: {} }, "params should be { filter_id: 'amazing' } in showFilteredPostsHandler#model");
                        return amazingPosts;
                    } else if (counter === 5) {
                        assert.equal(transition.from && transition.from.localName, 'showFilteredPosts', 'came from same route');
                        assert.equal(transition.to && transition.to.localName, 'showFilteredPosts', 'going to same route');
                        assert.equal(transition.from && transition.from.params.filter_id, 'amazing', 'old params');
                        assert.equal(transition.to && transition.to.params.filter_id, 'sad', 'new params');
                        assert.equal(postIndexHandler.context, posts, 'postIndexHandler context should be posts in showFilteredPostsHandler#model');
                        assert.deepEqual(params, { filter_id: 'sad', queryParams: {} }, "params should be { filter_id: 'sad' } in showFilteredPostsHandler#model");
                        return sadPosts;
                    } else {
                        assert.ok(false, 'Should not get here');
                    }
                    return;
                },
                setup: function setup(context) {
                    if (counter === 4) {
                        assert.equal(postIndexHandler.context, posts);
                        assert.equal(showFilteredPostsHandler.context, amazingPosts);
                        assert.strictEqual(context, amazingPosts);
                    } else if (counter === 5) {
                        assert.equal(postIndexHandler.context, posts);
                        assert.equal(showFilteredPostsHandler.context, sadPosts);
                        assert.strictEqual(context, sadPosts);
                    } else {
                        assert.ok(false, 'Should not get here');
                    }
                }
            });
            routes = {
                postIndex: postIndexHandler,
                showAllPosts: showAllPostsHandler,
                showPopularPosts: showPopularPostsHandler,
                showFilteredPosts: showFilteredPostsHandler
            };
            router.transitionTo('/posts').then(function () {
                assert.ok(true, '1: Finished, trying /posts/all');
                counter++;
                return router.transitionTo('/posts/all');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                assert.ok(true, '2: Finished, trying /posts');
                counter++;
                return router.transitionTo('/posts');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                assert.ok(true, '3: Finished, trying /posts/popular');
                counter++;
                return router.transitionTo('/posts/popular');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                assert.ok(true, '4: Finished, trying /posts/filter/amazing');
                counter++;
                return router.transitionTo('/posts/filter/amazing');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                assert.ok(true, '5: Finished, trying /posts/filter/sad');
                counter++;
                return router.transitionTo('/posts/filter/sad');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                assert.ok(true, '6: Finished!');
            }, (0, _test_helpers.shouldNotHappen)(assert));
        });
        (0, _test_helpers.test)('it can handle direct transitions to named routes', function (assert) {
            var allPosts = { all: true };
            var popularPosts = { popular: true };
            var amazingPosts = { filter: 'amazing' };
            var sadPosts = { filter: 'sad' };
            var postIndexHandler = (0, _test_helpers.createHandler)('postIndex', {
                model: function model() {
                    return allPosts;
                },
                serialize: function serialize() {
                    return {};
                }
            });
            var showAllPostsHandler = (0, _test_helpers.createHandler)('showAllPosts', {
                model: function model() {
                    //assert.ok(!params, 'params is falsy for non dynamic routes');
                    return allPosts;
                },
                serialize: function serialize() {
                    return {};
                },
                setup: function setup(context) {
                    assert.strictEqual(context, allPosts, 'showAllPosts should get correct setup');
                }
            });
            var showPopularPostsHandler = (0, _test_helpers.createHandler)('showPopularPosts', {
                model: function model() {
                    return popularPosts;
                },
                serialize: function serialize() {
                    return {};
                },
                setup: function setup(context) {
                    assert.strictEqual(context, popularPosts, 'showPopularPosts#setup should be called with the deserialized value');
                }
            });
            var showFilteredPostsHandler = (0, _test_helpers.createHandler)('showFilteredPosts', {
                model: function model(params) {
                    if (!params) {
                        return;
                    }
                    if (params.filter_id === 'amazing') {
                        return amazingPosts;
                    } else if (params.filter_id === 'sad') {
                        return sadPosts;
                    }
                    return;
                },
                serialize: function serialize(context, params) {
                    assert.deepEqual(params, ['filter_id'], 'showFilteredPosts should get correct serialize');
                    return { filter_id: context.filter };
                },
                setup: function setup(context) {
                    if (counter === 2) {
                        assert.strictEqual(context, amazingPosts, 'showFilteredPosts should get setup with amazingPosts');
                    } else if (counter === 3) {
                        assert.strictEqual(context, sadPosts, 'showFilteredPosts should get setup setup with sadPosts');
                    }
                }
            });
            routes = {
                postIndex: postIndexHandler,
                showAllPosts: showAllPostsHandler,
                showPopularPosts: showPopularPostsHandler,
                showFilteredPosts: showFilteredPostsHandler
            };
            router.updateURL = function (url) {
                var expected = {
                    0: '/posts',
                    1: '/posts/popular',
                    2: '/posts/filter/amazing',
                    3: '/posts/filter/sad',
                    4: '/posts'
                };
                assert.equal(url, expected[counter], 'updateURL should be called with correct url');
            };
            var counter = 0;
            router.handleURL('/posts').then(function () {
                return router.transitionTo('showAllPosts');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                counter++;
                return router.transitionTo('showPopularPosts');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                counter++;
                return router.transitionTo('showFilteredPosts', amazingPosts);
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                counter++;
                return router.transitionTo('showFilteredPosts', sadPosts);
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                counter++;
                return router.transitionTo('showAllPosts');
            }, (0, _test_helpers.shouldNotHappen)(assert));
        });
        (0, _test_helpers.test)('replaceWith calls replaceURL', function (assert) {
            var updateCount = 0,
                replaceCount = 0;
            router.updateURL = function () {
                updateCount++;
            };
            router.replaceURL = function () {
                replaceCount++;
            };
            router.handleURL('/posts').then(function () {
                return router.replaceWith('about');
            }).then(function () {
                assert.equal(updateCount, 0, 'should not call updateURL');
                assert.equal(replaceCount, 1, 'should call replaceURL once');
            });
        });
        (0, _test_helpers.test)('applyIntent returns a tentative state based on a named transition', function (assert) {
            (0, _test_helpers.transitionTo)(router, '/posts');
            var state = router.applyIntent('faq', []);
            assert.ok(state.routeInfos.length);
        });
        (0, _test_helpers.test)('Moving to a new top-level route triggers exit callbacks', function (assert) {
            assert.expect(6);
            var allPosts = { posts: 'all' };
            var postsStore = { 1: { id: 1 }, 2: { id: 2 } };
            var currentId = void 0;
            var currentPath = void 0;
            routes = {
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    model: function model() {
                        return allPosts;
                    },
                    setup: function setup(posts, transition) {
                        assert.ok(!(0, _test_helpers.isExiting)(this, transition.routeInfos));
                        assert.equal(posts, allPosts, 'The correct context was passed into showAllPostsHandler#setup');
                        currentPath = 'postIndex.showAllPosts';
                    },
                    exit: function exit(transition) {
                        assert.ok((0, _test_helpers.isExiting)(this, transition.routeInfos));
                    }
                }),
                showPost: (0, _test_helpers.createHandler)('showPost', {
                    model: function model(params) {
                        var id = parseInt(params.id, 10);
                        return postsStore[id];
                    },
                    serialize: function serialize(post) {
                        return { id: post.id };
                    },
                    setup: function setup(post) {
                        currentPath = 'showPost';
                        assert.equal(post.id, currentId, 'The post id is ' + currentId);
                    }
                })
            };
            router.handleURL('/posts').then(function () {
                expectedUrl = '/posts/1';
                currentId = 1;
                return router.transitionTo('showPost', postsStore[1]);
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function () {
                assert.equal(routePath(router.currentRouteInfos), currentPath);
            }, (0, _test_helpers.shouldNotHappen)(assert));
        });
        (0, _test_helpers.test)('pivotHandler is exposed on Transition object', function (assert) {
            assert.expect(3);
            routes = {
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    beforeModel: function beforeModel(transition) {
                        assert.ok(!transition.pivotHandler, 'First route transition has no pivot route');
                    }
                }),
                showPopularPosts: (0, _test_helpers.createHandler)('showPopularPosts', {
                    beforeModel: function beforeModel(transition) {
                        assert.equal(transition.pivotHandler, routes.postIndex, 'showAllPosts -> showPopularPosts pivotHandler is postIndex');
                    }
                }),
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                about: (0, _test_helpers.createHandler)('about', {
                    beforeModel: function beforeModel(transition) {
                        assert.ok(!transition.pivotHandler, 'top-level transition has no pivotHandler');
                    }
                })
            };
            router.handleURL('/posts').then(function () {
                return router.transitionTo('showPopularPosts');
            }).then(function () {
                return router.transitionTo('about');
            });
        });
        (0, _test_helpers.test)('transition.resolvedModels after redirects b/w routes', function (assert) {
            assert.expect(3);
            map(assert, function (match) {
                match('/').to('application', function (match) {
                    match('/peter').to('peter');
                    match('/wagenet').to('wagenet');
                });
            });
            var app = { app: true };
            routes = {
                application: (0, _test_helpers.createHandler)('application', {
                    model: function model() {
                        assert.ok(true, 'application#model');
                        return app;
                    }
                }),
                peter: (0, _test_helpers.createHandler)('peter', {
                    model: function model(_params, transition) {
                        assert.deepEqual(transition.resolvedModels.application, app, 'peter: resolvedModel correctly stored in resolvedModels for parent route');
                        router.transitionTo('wagenet');
                    }
                }),
                wagenet: (0, _test_helpers.createHandler)('wagenet', {
                    model: function model(_params, transition) {
                        assert.deepEqual(transition.resolvedModels.application, app, 'wagenet: resolvedModel correctly stored in resolvedModels for parent route');
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/peter');
        });
        (0, _test_helpers.test)('transition.resolvedModels after redirects within the same route', function (assert) {
            var admin = { admin: true },
                redirect = true;
            routes = {
                admin: (0, _test_helpers.createHandler)('admin', {
                    model: function model() {
                        assert.ok(true, 'admin#model');
                        return admin;
                    }
                }),
                adminPosts: (0, _test_helpers.createHandler)('adminPosts', {
                    model: function model(_params, transition) {
                        assert.deepEqual(transition.resolvedModels.admin, admin, 'resolvedModel correctly stored in resolvedModels for parent route');
                        if (redirect) {
                            redirect = false;
                            router.transitionTo('adminPosts');
                        }
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/posts/admin/1/posts');
        });
        (0, _test_helpers.test)('Moving to the same route with a different parent dynamic segment re-runs model', function (assert) {
            var admins = { 1: { id: 1 }, 2: { id: 2 } },
                adminPosts = { 1: { id: 1 }, 2: { id: 2 } };
            routes = {
                admin: (0, _test_helpers.createHandler)('admin', {
                    currentModel: -1,
                    model: function model(params) {
                        return this.currentModel = admins[params.id];
                    }
                }),
                adminPosts: (0, _test_helpers.createHandler)('adminPosts', {
                    model: function model() {
                        return adminPosts[routes.admin.currentModel.id];
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/posts/admin/1/posts');
            assert.equal(routes.admin.context, admins[1]);
            assert.equal(routes.adminPosts.context, adminPosts[1]);
            (0, _test_helpers.transitionTo)(router, '/posts/admin/2/posts');
            assert.equal(routes.admin.context, admins[2]);
            assert.equal(routes.adminPosts.context, adminPosts[2]);
        });
        (0, _test_helpers.test)('Moving to a sibling route only triggers exit callbacks on the current route (when transitioned internally)', function (assert) {
            assert.expect(8);
            var allPosts = { posts: 'all' };
            var showAllPostsHandler = (0, _test_helpers.createHandler)('showAllPosts', {
                model: function model() {
                    return allPosts;
                },
                setup: function setup(posts) {
                    assert.equal(posts, allPosts, 'The correct context was passed into showAllPostsHandler#setup');
                },
                enter: function enter() {
                    assert.ok(true, 'The sibling handler should be entered');
                },
                exit: function exit() {
                    assert.ok(true, 'The sibling handler should be exited');
                }
            });
            var filters = {};
            var showFilteredPostsHandler = (0, _test_helpers.createHandler)('showFilteredPosts', {
                enter: function enter() {
                    assert.ok(true, 'The new handler was entered');
                },
                exit: function exit() {
                    assert.ok(false, 'The new handler should not be exited');
                },
                model: function model(params) {
                    var id = params.filter_id;
                    if (!filters[id]) {
                        filters[id] = { id: id };
                    }
                    return filters[id];
                },
                serialize: function serialize(filter) {
                    assert.equal(filter.id, 'favorite', "The filter should be 'favorite'");
                    return { filter_id: filter.id };
                },
                setup: function setup(filter) {
                    assert.equal(filter.id, 'favorite', 'showFilteredPostsHandler#setup was called with the favorite filter');
                }
            });
            var postIndexHandler = (0, _test_helpers.createHandler)('postIndex', {
                enter: function enter() {
                    assert.ok(true, 'The outer handler was entered only once');
                },
                exit: function exit() {
                    assert.ok(false, 'The outer handler was not exited');
                }
            });
            routes = {
                postIndex: postIndexHandler,
                showAllPosts: showAllPostsHandler,
                showFilteredPosts: showFilteredPostsHandler
            };
            router.handleURL('/posts').then(function () {
                expectedUrl = '/posts/filter/favorite';
                return router.transitionTo('showFilteredPosts', { id: 'favorite' });
            });
        });
        (0, _test_helpers.test)('Moving to a sibling route only triggers exit callbacks on the current route (when transitioned via a URL change)', function (assert) {
            assert.expect(7);
            var allPosts = { posts: 'all' };
            var showAllPostsHandler = (0, _test_helpers.createHandler)('showAllPostsHandler', {
                model: function model() {
                    return allPosts;
                },
                setup: function setup(posts) {
                    assert.equal(posts, allPosts, 'The correct context was passed into showAllPostsHandler#setup');
                },
                enter: function enter() {
                    assert.ok(true, 'The sibling handler should be entered');
                },
                exit: function exit() {
                    assert.ok(true, 'The sibling handler should be exited');
                }
            });
            var filters = {};
            var showFilteredPostsHandler = (0, _test_helpers.createHandler)('showFilteredPosts', {
                enter: function enter() {
                    assert.ok(true, 'The new handler was entered');
                },
                exit: function exit() {
                    assert.ok(false, 'The new handler should not be exited');
                },
                model: function model(params) {
                    assert.equal(params.filter_id, 'favorite', "The filter should be 'favorite'");
                    var id = params.filter_id;
                    if (!filters[id]) {
                        filters[id] = { id: id };
                    }
                    return filters[id];
                },
                serialize: function serialize(filter) {
                    return { filter_id: filter.id };
                },
                setup: function setup(filter) {
                    assert.equal(filter.id, 'favorite', 'showFilteredPostsHandler#setup was called with the favorite filter');
                }
            });
            var postIndexHandler = (0, _test_helpers.createHandler)('postIndex', {
                enter: function enter() {
                    assert.ok(true, 'The outer handler was entered only once');
                },
                exit: function exit() {
                    assert.ok(false, 'The outer handler was not exited');
                }
            });
            routes = {
                postIndex: postIndexHandler,
                showAllPosts: showAllPostsHandler,
                showFilteredPosts: showFilteredPostsHandler
            };
            router.handleURL('/posts');
            (0, _test_helpers.flushBackburner)();
            expectedUrl = '/posts/filter/favorite';
            router.handleURL(expectedUrl);
        });
        (0, _test_helpers.test)('events can be targeted at the current handler', function (assert) {
            assert.expect(2);
            routes = {
                showPost: (0, _test_helpers.createHandler)('showPost', {
                    enter: function enter() {
                        assert.ok(true, 'The show post handler was entered');
                    },
                    events: {
                        expand: function expand() {
                            assert.equal(this, routes.showPost, 'The handler is the `this` for the event');
                        }
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/posts/1');
            router.trigger('expand');
        });
        (0, _test_helpers.test)('event triggering is pluggable', function (assert) {
            routes = {
                showPost: (0, _test_helpers.createHandler)('showPost', {
                    enter: function enter() {
                        assert.ok(true, 'The show post handler was entered');
                    },
                    actions: {
                        expand: function expand() {
                            assert.equal(this, routes.showPost, 'The handler is the `this` for the event');
                        }
                    }
                })
            };
            router.triggerEvent = function (handlerInfos, ignoreFailure, name, args) {
                if (!handlerInfos) {
                    if (ignoreFailure) {
                        return;
                    }
                    throw new Error("Could not trigger event '" + name + "'. There are no active handlers");
                }
                for (var i = handlerInfos.length - 1; i >= 0; i--) {
                    var handlerInfo = handlerInfos[i],
                        handler = handlerInfo.route;
                    if (handler.actions && handler.actions[name]) {
                        if (handler.actions[name].apply(handler, args) !== true) {
                            return;
                        }
                    }
                }
            };
            router.handleURL('/posts/1').then(function () {
                router.trigger('expand');
            });
        });
        (0, _test_helpers.test)('Unhandled events raise an exception', function (assert) {
            router.handleURL('/posts/1');
            assert.throws(function () {
                router.trigger('doesnotexist');
            }, /doesnotexist/);
        });
        (0, _test_helpers.test)('events can be targeted at a parent handler', function (assert) {
            assert.expect(3);
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex', {
                    enter: function enter() {
                        assert.ok(true, 'The post index handler was entered');
                    },
                    events: {
                        expand: function expand() {
                            assert.equal(this, routes.postIndex, 'The handler is the `this` in events');
                        }
                    }
                }),
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    enter: function enter() {
                        assert.ok(true, 'The show all posts handler was entered');
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/posts');
            router.trigger('expand');
        });
        (0, _test_helpers.test)('events can bubble up to a parent handler via `return true`', function (assert) {
            assert.expect(4);
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex', {
                    enter: function enter() {
                        assert.ok(true, 'The post index handler was entered');
                    },
                    events: {
                        expand: function expand() {
                            assert.equal(this, routes.postIndex, 'The handler is the `this` in events');
                        }
                    }
                }),
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    enter: function enter() {
                        assert.ok(true, 'The show all posts handler was entered');
                    },
                    events: {
                        expand: function expand() {
                            assert.equal(this, routes.showAllPosts, 'The handler is the `this` in events');
                            return true;
                        }
                    }
                })
            };
            router.handleURL('/posts').then(function () {
                router.trigger('expand');
            });
        });
        (0, _test_helpers.test)("handled-then-bubbled events don't throw an exception if uncaught by parent route", function (assert) {
            assert.expect(3);
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex', {
                    enter: function enter() {
                        assert.ok(true, 'The post index handler was entered');
                    }
                }),
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    enter: function enter() {
                        assert.ok(true, 'The show all posts handler was entered');
                    },
                    events: {
                        expand: function expand() {
                            assert.equal(this, routes.showAllPosts, 'The handler is the `this` in events');
                            return true;
                        }
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/posts');
            router.trigger('expand');
        });
        (0, _test_helpers.test)('events only fire on the closest handler', function (assert) {
            assert.expect(5);
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex', {
                    enter: function enter() {
                        assert.ok(true, 'The post index handler was entered');
                    },
                    events: {
                        expand: function expand() {
                            assert.ok(false, 'Should not get to the parent handler');
                        }
                    }
                }),
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    enter: function enter() {
                        assert.ok(true, 'The show all posts handler was entered');
                    },
                    events: {
                        expand: function expand(passedContext1, passedContext2) {
                            assert.equal(context1, passedContext1, 'A context is passed along');
                            assert.equal(context2, passedContext2, 'A second context is passed along');
                            assert.equal(this, routes.showAllPosts, 'The handler is passed into events as `this`');
                        }
                    }
                })
            };
            var context1 = {},
                context2 = {};
            router.handleURL('/posts').then(function () {
                router.trigger('expand', context1, context2);
            });
        });
        (0, _test_helpers.test)("Date params aren't treated as string/number params", function (assert) {
            assert.expect(1);
            routes = {
                showPostsForDate: (0, _test_helpers.createHandler)('showPostsForDate', {
                    serialize: function serialize(date) {
                        return {
                            date: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
                        };
                    },
                    model: function model() {
                        assert.ok(false, "model shouldn't be called; the date is the provided model");
                    }
                })
            };
            if (scenario.async) {
                serializers = {
                    showPostsForDate: function showPostsForDate(date) {
                        return {
                            date: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
                        };
                    }
                };
            }
            var result = router.generate('showPostsForDate', new Date(1815, 5, 18));
            assert.equal(result, '/posts/on/1815-5-18');
        });
        (0, _test_helpers.test)('getSerializer takes precedence over handler.serialize', function (assert) {
            assert.expect(2);
            router.getSerializer = function () {
                return function (date) {
                    assert.ok(true, 'getSerializer called');
                    return {
                        date: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
                    };
                };
            };
            routes = {
                showPostsForDate: (0, _test_helpers.createHandler)('showPostsForDate', {
                    serialize: function serialize() {
                        assert.ok(false, "serialize method shouldn't be called");
                        return {};
                    },
                    model: function model() {
                        assert.ok(false, "model shouldn't be called; the date is the provided model");
                    }
                })
            };
            assert.equal(router.generate('showPostsForDate', new Date(1815, 5, 18)), '/posts/on/1815-5-18');
        });
        (0, _test_helpers.test)('the serializer method is unbound', function (assert) {
            assert.expect(1);
            router.getSerializer = function () {
                return function (date) {
                    assert.equal(this, undefined);
                    return {
                        date: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
                    };
                };
            };
            router.generate('showPostsForDate', new Date(1815, 5, 18));
        });
        (0, _test_helpers.test)('params are known by a transition up front', function (assert) {
            assert.expect(2);
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex', {
                    model: function model(_params, transition) {
                        assert.deepEqual(transition[_transition2.PARAMS_SYMBOL], {
                            postIndex: {},
                            showFilteredPosts: { filter_id: 'sad' }
                        });
                    }
                }),
                showFilteredPosts: (0, _test_helpers.createHandler)('showFilteredPosts', {
                    model: function model(_params, transition) {
                        assert.deepEqual(transition[_transition2.PARAMS_SYMBOL], {
                            postIndex: {},
                            showFilteredPosts: { filter_id: 'sad' }
                        });
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/posts/filter/sad', 'blorg');
        });
        (0, _test_helpers.test)('transitionTo uses the current context if you are already in a handler with a context that is not changing', function (assert) {
            var admin = { id: 47 },
                adminPost = { id: 74 };
            routes = {
                admin: (0, _test_helpers.createHandler)('admin', {
                    serialize: function serialize(object) {
                        assert.equal(object.id, 47, 'The object passed to serialize is correct');
                        return { id: 47 };
                    },
                    model: function model(params) {
                        assert.equal(params.id, 47, 'The object passed to serialize is correct');
                        return admin;
                    }
                }),
                adminPost: (0, _test_helpers.createHandler)('adminPost', {
                    serialize: function serialize(object) {
                        return { post_id: object.id };
                    },
                    model: function model(params) {
                        assert.equal(params.id, 74, 'The object passed to serialize is correct');
                        return adminPost;
                    }
                })
            };
            expectedUrl = '/posts/admin/47/posts/74';
            (0, _test_helpers.transitionTo)(router, 'adminPost', admin, adminPost);
            expectedUrl = '/posts/admin/47/posts/75';
            (0, _test_helpers.transitionTo)(router, 'adminPost', { id: 75 });
        });
        (0, _test_helpers.test)('check for mid-transition correctness', function (assert) {
            var posts = {
                1: { id: 1 },
                2: { id: 2 },
                3: { id: 3 }
            };
            var showPostHandler = (0, _test_helpers.createHandler)('showPost', {
                serialize: function serialize(object) {
                    return object && { id: object.id } || null;
                },
                model: function model(params) {
                    var id = params.id;
                    return posts[id];
                }
            });
            routes = {
                showPost: showPostHandler
            };
            // Get a reference to the transition, mid-transition.
            router.willTransition = function () {
                var midTransitionState = router.activeTransition[_transition2.STATE_SYMBOL];
                // Make sure that the activeIntent doesn't match post 300.
                var isPost300Targeted = router.isActiveIntent('showPost', [300], undefined, midTransitionState);
                assert.notOk(isPost300Targeted, 'Post 300 should not match post 3.');
            };
            // Go to post 3. This triggers our test.
            (0, _test_helpers.transitionTo)(router, '/posts/3');
            // Clean up.
            delete router.willTransition;
        });
        (0, _test_helpers.test)('tests whether arguments to transitionTo are considered active', function (assert) {
            var admin = { id: 47 },
                adminPost = { id: 74 },
                posts = {
                1: { id: 1 },
                2: { id: 2 },
                3: { id: 3 }
            };
            var adminHandler = (0, _test_helpers.createHandler)('admin', {
                serialize: function serialize() {
                    return { id: 47 };
                },
                model: function model() {
                    return admin;
                }
            });
            var adminPostHandler = (0, _test_helpers.createHandler)('adminPost', {
                serialize: function serialize(object) {
                    return { post_id: object.id };
                },
                model: function model() {
                    return adminPost;
                }
            });
            var showPostHandler = (0, _test_helpers.createHandler)('showPost', {
                serialize: function serialize(object) {
                    return object && { id: object.id } || null;
                },
                model: function model(params) {
                    return posts[params.id];
                }
            });
            routes = {
                admin: adminHandler,
                adminPost: adminPostHandler,
                showPost: showPostHandler
            };
            (0, _test_helpers.transitionTo)(router, '/posts/1');
            assert.ok(router.isActive('showPost'), 'The showPost handler is active');
            assert.ok(router.isActive('showPost', posts[1]), 'The showPost handler is active with the appropriate context');
            assert.ok(!router.isActive('showPost', posts[2]), 'The showPost handler is inactive when the context is different');
            assert.ok(!router.isActive('adminPost'), 'The adminPost handler is inactive');
            assert.ok(!router.isActive('showPost', null), 'The showPost handler is inactive with a null context');
            (0, _test_helpers.transitionTo)(router, 'adminPost', admin, adminPost);
            assert.ok(router.isActive('adminPost'), 'The adminPost handler is active');
            assert.ok(router.isActive('adminPost', adminPost), 'The adminPost handler is active with the current context');
            assert.ok(router.isActive('adminPost', admin, adminPost), 'The adminPost handler is active with the current and parent context');
            assert.ok(router.isActive('admin'), 'The admin handler is active');
            assert.ok(router.isActive('admin', admin), 'The admin handler is active with its context');
        });
        (0, _test_helpers.test)('calling generate on a non-dynamic route does not blow away parent contexts', function (assert) {
            map(assert, function (match) {
                match('/projects').to('projects', function (match) {
                    match('/').to('projectsIndex');
                    match('/project').to('project', function (match) {
                        match('/').to('projectIndex');
                    });
                });
            });
            var projects = {};
            routes = {
                projects: (0, _test_helpers.createHandler)('projects', {
                    model: function model() {
                        return projects;
                    }
                })
            };
            router.handleURL('/projects').then(function () {
                assert.equal(routes.projects.context, projects, 'projects handler has correct context');
                router.generate('projectIndex');
                assert.equal(routes.projects.context, projects, 'projects handler retains correct context');
            });
        });
        (0, _test_helpers.test)('calling transitionTo on a dynamic parent route causes non-dynamic child context to be updated', function (assert) {
            map(assert, function (match) {
                match('/project/:project_id').to('project', function (match) {
                    match('/').to('projectIndex');
                });
            });
            var projectHandler = (0, _test_helpers.createHandler)('project', {
                model: function model(params) {
                    delete params.queryParams;
                    return params;
                }
            });
            var projectIndexHandler = (0, _test_helpers.createHandler)('projectIndex', {
                model: function model(_params, transition) {
                    return transition.resolvedModels.project;
                }
            });
            routes = {
                project: projectHandler,
                projectIndex: projectIndexHandler
            };
            (0, _test_helpers.transitionTo)(router, '/project/1');
            assert.deepEqual(projectHandler.context, { project_id: '1' }, 'project handler retains correct context');
            assert.deepEqual(projectIndexHandler.context, { project_id: '1' }, 'project index handler has correct context');
            router.generate('projectIndex', { project_id: '2' });
            assert.deepEqual(projectHandler.context, { project_id: '1' }, 'project handler retains correct context');
            assert.deepEqual(projectIndexHandler.context, { project_id: '1' }, 'project index handler retains correct context');
            (0, _test_helpers.transitionTo)(router, 'projectIndex', { project_id: '2' });
            assert.deepEqual(projectHandler.context, { project_id: '2' }, 'project handler has updated context');
            assert.deepEqual(projectIndexHandler.context, { project_id: '2' }, 'project index handler has updated context');
        });
        (0, _test_helpers.test)('reset exits and clears the current and target route handlers', function (assert) {
            var postIndexExited = false;
            var showAllPostsExited = false;
            var steps = 0;
            assert.equal(++steps, 1);
            var postIndexHandler = (0, _test_helpers.createHandler)('postIndex', {
                exit: function exit() {
                    postIndexExited = true;
                    assert.equal(++steps, 4);
                }
            });
            var showAllPostsHandler = (0, _test_helpers.createHandler)('showAllPosts', {
                exit: function exit() {
                    showAllPostsExited = true;
                    assert.equal(++steps, 3);
                }
            });
            routes = {
                postIndex: postIndexHandler,
                showAllPosts: showAllPostsHandler
            };
            (0, _test_helpers.transitionTo)(router, '/posts/all');
            assert.equal(++steps, 2);
            router.reset();
            assert.ok(postIndexExited, 'Post index handler did not exit');
            assert.ok(showAllPostsExited, 'Show all posts handler did not exit');
            assert.equal(router.currentRouteInfos, null, 'currentHandlerInfos should be null');
        });
        (0, _test_helpers.test)('any of the model hooks can redirect with or without promise', function (assert) {
            assert.expect(26);
            var setupShouldBeEntered = false;
            var returnPromise = false;
            var redirectTo = void 0;
            function redirectToAbout() {
                if (returnPromise) {
                    return (0, _rsvp.reject)().then(null, function () {
                        router.transitionTo(redirectTo);
                    });
                } else {
                    router.transitionTo(redirectTo);
                }
                return;
            }
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    beforeModel: redirectToAbout,
                    model: redirectToAbout,
                    afterModel: redirectToAbout,
                    setup: function setup() {
                        assert.ok(setupShouldBeEntered, 'setup should be entered at this time');
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, "about handler's setup function was called");
                    }
                }),
                borf: (0, _test_helpers.createHandler)('borf', {
                    setup: function setup() {
                        assert.ok(true, 'borf setup entered');
                    }
                })
            };
            function testStartup(assert, firstExpectedURL) {
                map(assert, function (match) {
                    match('/').to('index');
                    match('/about').to('about');
                    match('/foo').to('foo');
                    match('/borf').to('borf');
                });
                redirectTo = 'about';
                // Perform a redirect on startup.
                expectedUrl = firstExpectedURL || '/about';
                (0, _test_helpers.transitionTo)(router, '/');
                expectedUrl = '/borf';
                redirectTo = 'borf';
                (0, _test_helpers.transitionTo)(router, 'index');
            }
            testStartup(assert);
            returnPromise = true;
            testStartup(assert);
            delete routes.index.beforeModel;
            returnPromise = false;
            testStartup(assert);
            returnPromise = true;
            testStartup(assert);
            delete routes.index.model;
            returnPromise = false;
            testStartup(assert);
            returnPromise = true;
            testStartup(assert);
            delete routes.index.afterModel;
            setupShouldBeEntered = true;
            testStartup(assert, '/');
        });
        (0, _test_helpers.test)('transitionTo with a promise pauses the transition until resolve, passes resolved context to setup', function (assert) {
            routes = {
                index: (0, _test_helpers.createHandler)('index'),
                showPost: (0, _test_helpers.createHandler)('showPost', {
                    setup: function setup(context) {
                        assert.deepEqual(context, { id: 1 }, 'setup receives a resolved context');
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/index');
            (0, _test_helpers.transitionTo)(router, 'showPost', new _rsvp.Promise(function (resolve) {
                resolve({ id: 1 });
            }));
        });
        (0, _test_helpers.test)('error handler gets called for errors in validation hooks', function (assert) {
            assert.expect(25);
            var setupShouldBeEntered = false;
            var expectedReason = { reason: 'No funciona, mon frere.' };
            function throwAnError() {
                return (0, _rsvp.reject)(expectedReason);
            }
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    beforeModel: throwAnError,
                    model: throwAnError,
                    afterModel: throwAnError,
                    events: {
                        error: function error(reason) {
                            assert.equal(reason, expectedReason, "the value passed to the error handler is what was 'thrown' from the hook");
                        }
                    },
                    setup: function setup() {
                        assert.ok(setupShouldBeEntered, 'setup should be entered at this time');
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, "about handler's setup function was called");
                    }
                })
            };
            function testStartup(assert) {
                map(assert, function (match) {
                    match('/').to('index');
                    match('/about').to('about');
                });
                // Perform a redirect on startup.
                return router.handleURL('/').then(null, function (reason) {
                    assert.equal(reason, expectedReason, 'handleURL error reason is what was originally thrown');
                    return router.transitionTo('index').then((0, _test_helpers.shouldNotHappen)(assert), function (newReason) {
                        assert.equal(newReason, expectedReason, 'transitionTo error reason is what was originally thrown');
                    });
                });
            }
            testStartup(assert).then(function () {
                return testStartup(assert);
            }).then(function () {
                delete routes.index.beforeModel;
                return testStartup(assert);
            }).then(function () {
                return testStartup(assert);
            }).then(function () {
                delete routes.index.model;
                return testStartup(assert);
            }).then(function () {
                return testStartup(assert);
            }).then(function () {
                delete routes.index.afterModel;
                setupShouldBeEntered = true;
                return testStartup(assert);
            });
        });
        (0, _test_helpers.test)("Errors shouldn't be handled after proceeding to next child route", function (assert) {
            assert.expect(3);
            map(assert, function (match) {
                match('/parent').to('parent', function (match) {
                    match('/articles').to('articles');
                    match('/login').to('login');
                });
            });
            routes = {
                articles: (0, _test_helpers.createHandler)('articles', {
                    beforeModel: function beforeModel() {
                        assert.ok(true, 'articles beforeModel was entered');
                        return (0, _rsvp.reject)('blorg');
                    },
                    events: {
                        error: function error() {
                            assert.ok(true, 'error handled in articles');
                            router.transitionTo('login');
                        }
                    }
                }),
                login: (0, _test_helpers.createHandler)('login', {
                    setup: function setup() {
                        assert.ok(true, 'login#setup');
                    }
                }),
                parent: (0, _test_helpers.createHandler)('parent', {
                    events: {
                        error: function error() {
                            assert.ok(false, "handled error shouldn't bubble up to parent route");
                        }
                    }
                })
            };
            router.handleURL('/parent/articles');
        });
        (0, _test_helpers.test)("Error handling shouldn't trigger for transitions that are already aborted", function (assert) {
            assert.expect(1);
            map(assert, function (match) {
                match('/slow_failure').to('slow_failure');
                match('/good').to('good');
            });
            routes = {
                slow_failure: (0, _test_helpers.createHandler)('showFailure', {
                    model: function model() {
                        return new _rsvp.Promise(function (_res, rej) {
                            router.transitionTo('good');
                            rej();
                        });
                    },
                    events: {
                        error: function error() {
                            assert.ok(false, "error handling shouldn't fire");
                        }
                    }
                }),
                good: (0, _test_helpers.createHandler)('good', {
                    setup: function setup() {
                        assert.ok(true, 'good#setup');
                    }
                })
            };
            router.handleURL('/slow_failure');
            (0, _test_helpers.flushBackburner)();
        });
        (0, _test_helpers.test)('Transitions to the same destination as the active transition just return the active transition', function (assert) {
            assert.expect(1);
            var transition0 = router.handleURL('/index');
            var transition1 = router.handleURL('/index');
            assert.equal(transition0, transition1);
            (0, _test_helpers.flushBackburner)();
        });
        (0, _test_helpers.test)('can redirect from error handler', function (assert) {
            assert.expect(4);
            var errorCount = 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index'),
                showPost: (0, _test_helpers.createHandler)('showPost', {
                    model: function model() {
                        return (0, _rsvp.reject)('borf!');
                    },
                    events: {
                        error: function error(e) {
                            errorCount++;
                            assert.equal(e, 'borf!', 'received error thrown from model');
                            // Redirect to index.
                            router.transitionTo('index').then(function () {
                                if (errorCount === 1) {
                                    // transition back here to test transitionTo error handling.
                                    return router.transitionTo('showPost', (0, _rsvp.reject)('borf!')).then((0, _test_helpers.shouldNotHappen)(assert), function (e) {
                                        assert.equal(e, 'borf!', 'got thing');
                                    });
                                }
                                return;
                            }, (0, _test_helpers.shouldNotHappen)(assert));
                        }
                    },
                    setup: function setup() {
                        assert.ok(false, 'should not get here');
                    }
                })
            };
            router.handleURL('/posts/123').then((0, _test_helpers.shouldNotHappen)(assert), function (reason) {
                assert.equal(reason, 'borf!', 'expected reason received from first failed transition');
            });
        });
        (0, _test_helpers.test)('can redirect from setup/enter', function (assert) {
            assert.expect(5);
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    enter: function enter() {
                        assert.ok(true, 'index#enter called');
                        router.transitionTo('about').then(secondAttempt, (0, _test_helpers.shouldNotHappen)(assert));
                    },
                    setup: function setup() {
                        assert.ok(true, 'index#setup called');
                        router.transitionTo('/about').then(thirdAttempt, (0, _test_helpers.shouldNotHappen)(assert));
                    },
                    events: {
                        error: function error() {
                            assert.ok(false, 'redirects should not call error hook');
                        }
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about#setup was entered');
                    }
                })
            };
            router.handleURL('/index').then((0, _test_helpers.shouldNotHappen)(assert), (0, _test_helpers.assertAbort)(assert));
            function secondAttempt() {
                delete routes.index.enter;
                router.transitionTo('index').then((0, _test_helpers.shouldNotHappen)(assert), (0, _test_helpers.assertAbort)(assert));
            }
            function thirdAttempt() {
                delete routes.index.setup;
                router.transitionTo('index').then(null, (0, _test_helpers.shouldNotHappen)(assert));
            }
        });
        (0, _test_helpers.test)('redirecting to self from validation hooks should no-op (and not infinite loop)', function (assert) {
            assert.expect(2);
            var count = 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    afterModel: function afterModel() {
                        if (count++ > 10) {
                            assert.ok(false, 'infinite loop occurring');
                        } else {
                            assert.ok(count <= 2, 'running index no more than twice');
                            router.transitionTo('index');
                        }
                    },
                    setup: function setup() {
                        assert.ok(true, 'setup was called');
                    }
                })
            };
            router.handleURL('/index');
        });
        (0, _test_helpers.test)('Transition#method(null) prevents URLs from updating', function (assert) {
            assert.expect(1);
            routes = {
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about#setup was called');
                    }
                })
            };
            router.updateURL = function () {
                assert.ok(false, "updateURL shouldn't have been called");
            };
            // Test multiple calls to method in a row.
            router.handleURL('/index').method(null);
            router.handleURL('/index').method(null);
            (0, _test_helpers.flushBackburner)();
            router.transitionTo('about').method(null);
            (0, _test_helpers.flushBackburner)();
        });
        (0, _test_helpers.test)('redirecting to self from enter hooks should no-op (and not infinite loop)', function (assert) {
            assert.expect(1);
            var count = 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    setup: function setup() {
                        if (count++ > 10) {
                            assert.ok(false, 'infinite loop occurring');
                        } else {
                            assert.ok(true, 'setup was called');
                            router.transitionTo('index');
                        }
                    }
                })
            };
            router.handleURL('/index');
        });
        (0, _test_helpers.test)('redirecting to child handler from validation hooks should no-op (and not infinite loop)', function (assert) {
            assert.expect(4);
            routes = {
                postIndex: (0, _test_helpers.createHandler)('postIndex', {
                    beforeModel: function beforeModel() {
                        assert.ok(true, 'postIndex beforeModel called');
                        router.transitionTo('showAllPosts');
                    }
                }),
                showAllPosts: (0, _test_helpers.createHandler)('showAllPosts', {
                    beforeModel: function beforeModel() {
                        assert.ok(true, 'showAllPosts beforeModel called');
                    }
                }),
                showPopularPosts: (0, _test_helpers.createHandler)('showPopularPosts', {
                    beforeModel: function beforeModel() {
                        assert.ok(true, 'showPopularPosts beforeModel called');
                    }
                })
            };
            router.handleURL('/posts/popular').then(function () {
                assert.ok(false, 'redirected handleURL should not succeed');
            }, function () {
                assert.ok(true, 'redirected handleURL should fail');
            });
        });
        function startUpSetup(assert) {
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    setup: function setup() {
                        assert.ok(true, 'index setup called');
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about setup called');
                    }
                }),
                faq: (0, _test_helpers.createHandler)('faq', {
                    setup: function setup() {
                        assert.ok(true, 'faq setup called');
                    }
                })
            };
        }
        (0, _test_helpers.test)('transitionTo with named transition can be called at startup', function (assert) {
            assert.expect(2);
            startUpSetup(assert);
            router.transitionTo('index').then(function () {
                assert.ok(true, 'success handler called');
            }, function () {
                assert.ok(false, 'failure handle should not be called');
            });
        });
        (0, _test_helpers.test)('transitionTo with URL transition can be called at startup', function (assert) {
            assert.expect(2);
            startUpSetup(assert);
            router.transitionTo('/index').then(function () {
                assert.ok(true, 'success handler called');
            }, function () {
                assert.ok(false, 'failure handle should not be called');
            });
        });
        (0, _test_helpers.test)('transitions fire a didTransition event on the destination route', function (assert) {
            assert.expect(1);
            routes = {
                about: (0, _test_helpers.createHandler)('about', {
                    events: {
                        didTransition: function didTransition() {
                            assert.ok(true, "index's didTransition was called");
                        }
                    }
                })
            };
            router.handleURL('/index').then(function () {
                router.transitionTo('about');
            }, (0, _test_helpers.shouldNotHappen)(assert));
        });
        (0, _test_helpers.test)('willTransition function fired before route change', function (assert) {
            assert.expect(1);
            var beforeModelNotCalled = true;
            routes = {
                about: (0, _test_helpers.createHandler)('about', {
                    beforeModel: function beforeModel() {
                        beforeModelNotCalled = false;
                    }
                })
            };
            router.willTransition = function () {
                assert.ok(beforeModelNotCalled, 'about beforeModel hook should not be called at this time');
            };
            router.handleURL('/about');
        });
        (0, _test_helpers.test)('willTransition function fired with handler infos passed in', function (assert) {
            assert.expect(2);
            router.handleURL('/about').then(function () {
                router.willTransition = function (fromInfos, toInfos) {
                    assert.equal(routePath(fromInfos), 'about', 'first argument should be the old handler infos');
                    assert.equal(routePath(toInfos), 'postIndex.showPopularPosts', 'second argument should be the new handler infos');
                };
                router.handleURL('/posts/popular');
            });
        });
        (0, _test_helpers.test)('willTransition function fired with cancellable transition passed in', function (assert) {
            assert.expect(2);
            router.handleURL('/index').then(function () {
                router.willTransition = function (_fromInfos, _toInfos, transition) {
                    assert.ok(true, "index's transitionTo was called");
                    transition.abort();
                };
                return router.transitionTo('about').then((0, _test_helpers.shouldNotHappen)(assert), (0, _test_helpers.assertAbort)(assert));
            });
        });
        (0, _test_helpers.test)('transitions can be aborted in the willTransition event', function (assert) {
            assert.expect(3);
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    setup: function setup() {
                        assert.ok(true, 'index setup called');
                    },
                    events: {
                        willTransition: function willTransition(transition) {
                            assert.ok(true, "index's transitionTo was called");
                            transition.abort();
                        }
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about setup called');
                    }
                })
            };
            router.handleURL('/index').then(function () {
                return router.transitionTo('about').then((0, _test_helpers.shouldNotHappen)(assert), (0, _test_helpers.assertAbort)(assert));
            });
        });
        (0, _test_helpers.test)('transitions can redirected in the willTransition event', function (assert) {
            assert.expect(2);
            var destFlag = true;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    setup: function setup() {
                        assert.ok(true, 'index setup called');
                    },
                    events: {
                        willTransition: function willTransition() {
                            // Router code must be careful here not to refire
                            // `willTransition` when a transition is already
                            // underway, else infinite loop.
                            var dest = destFlag ? 'about' : 'faq';
                            destFlag = !destFlag;
                            router.transitionTo(dest);
                        }
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about setup called');
                    }
                }),
                faq: (0, _test_helpers.createHandler)('faq', {
                    setup: function setup() {
                        assert.ok(false, 'faq setup should not be called');
                    }
                })
            };
            router.handleURL('/index').then(function () {
                router.transitionTo('faq');
            });
        });
        (0, _test_helpers.test)('transitions that abort and enter into a substate', function (assert) {
            assert.expect(3);
            routes = {
                index: (0, _test_helpers.createHandler)('index'),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about setup called');
                    },
                    events: {
                        willTransition: function willTransition(transition) {
                            assert.ok(true, 'willTransition');
                            transition.abort();
                            router.intermediateTransitionTo('faq');
                        }
                    }
                }),
                faq: (0, _test_helpers.createHandler)('faq', {
                    setup: function setup() {
                        assert.ok(true, 'faq setup called');
                    }
                })
            };
            router.handleURL('/about').then(function () {
                return router.transitionTo('index');
            });
        });
        (0, _test_helpers.test)('aborted transitions can be saved and later retried', function (assert) {
            assert.expect(9);
            var shouldPrevent = true,
                transitionToAbout = void 0,
                lastTransition = void 0,
                retryTransition = void 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    setup: function setup() {
                        assert.ok(true, 'index setup called');
                    },
                    events: {
                        willTransition: function willTransition(transition) {
                            assert.ok(true, "index's willTransition was called");
                            if (shouldPrevent) {
                                transition.data.foo = 'hello';
                                transition.foo = 'hello';
                                transition.abort();
                                lastTransition = transition;
                            } else {
                                assert.ok(!transition.foo, 'no foo property exists on new transition');
                                assert.equal(transition.data.foo, 'hello', 'values stored in data hash of old transition persist when retried');
                            }
                        }
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about setup called');
                    }
                })
            };
            router.handleURL('/index').then(function () {
                router.transitionTo('about').then((0, _test_helpers.shouldNotHappen)(assert), function () {
                    assert.ok(true, 'transition was blocked');
                    shouldPrevent = false;
                    transitionToAbout = lastTransition;
                    retryTransition = transitionToAbout.retry();
                    assert.equal(retryTransition.urlMethod, 'update');
                    return retryTransition;
                }).then(function () {
                    assert.ok(true, 'transition succeeded via .retry()');
                }, (0, _test_helpers.shouldNotHappen)(assert));
            });
        });
        (0, _test_helpers.test)('aborted transitions can be saved and later retried asynchronously', function (assert) {
            assert.expect(2);
            var abortedTransition = void 0;
            var shouldPrevent = true;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    events: {
                        willTransition: function willTransition(transition) {
                            if (shouldPrevent) {
                                abortedTransition = transition.abort();
                                router.intermediateTransitionTo('loading');
                            }
                        }
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about setup called');
                    }
                }),
                loading: (0, _test_helpers.createHandler)('loading', {
                    setup: function setup() {
                        assert.ok(true, 'loading setup called');
                    }
                })
            };
            router.handleURL('/index').then(function () {
                return router.transitionTo('about').then((0, _test_helpers.shouldNotHappen)(assert), function () {
                    shouldPrevent = false;
                    return new _rsvp.Promise(function (resolve) {
                        var transition = abortedTransition.retry();
                        resolve(transition);
                    });
                }).then(function () {
                    assert.ok(true, 'transition succeeded via .retry()');
                }, (0, _test_helpers.shouldNotHappen)(assert)).catch((0, _test_helpers.shouldNotHappen)(assert));
            });
        });
        (0, _test_helpers.test)('if an aborted transition is retried, it preserves the urlMethod of the original one', function (assert) {
            assert.expect(9);
            var shouldPrevent = true,
                transitionToAbout = void 0,
                lastTransition = void 0,
                retryTransition = void 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    setup: function setup() {
                        assert.ok(true, 'index setup called');
                    },
                    events: {
                        willTransition: function willTransition(transition) {
                            assert.ok(true, "index's willTransition was called");
                            if (shouldPrevent) {
                                transition.data.foo = 'hello';
                                transition.foo = 'hello';
                                transition.abort();
                                lastTransition = transition;
                            } else {
                                assert.ok(!transition.foo, 'no foo property exists on new transition');
                                assert.equal(transition.data.foo, 'hello', 'values stored in data hash of old transition persist when retried');
                            }
                        }
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'about setup called');
                    }
                })
            };
            router.handleURL('/index').then(function () {
                router.replaceWith('about').then((0, _test_helpers.shouldNotHappen)(assert), function () {
                    assert.ok(true, 'transition was blocked');
                    shouldPrevent = false;
                    transitionToAbout = lastTransition;
                    retryTransition = transitionToAbout.retry();
                    assert.equal(retryTransition.urlMethod, 'replace');
                    return transitionToAbout.retry();
                }).then(function () {
                    assert.ok(true, 'transition succeeded via .retry()');
                }, (0, _test_helpers.shouldNotHappen)(assert));
            });
        });
        (0, _test_helpers.test)('if an initial transition is aborted during validation phase and later retried', function (assert) {
            assert.expect(7);
            var shouldRedirectToLogin = true;
            var currentURL = '/login';
            var urlStack = [];
            var lastTransition = void 0;
            map(assert, function (match) {
                match('/').to('index');
                match('/login').to('login');
            });
            router.updateURL = function (url) {
                urlStack.push(['updateURL', url]);
                currentURL = url;
            };
            router.replaceURL = function (url) {
                urlStack.push(['replaceURL', url]);
                currentURL = url;
            };
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    beforeModel: function beforeModel(transition) {
                        assert.ok(true, 'index model called');
                        if (shouldRedirectToLogin) {
                            lastTransition = transition;
                            return router.transitionTo('/login');
                        }
                        return;
                    }
                }),
                login: (0, _test_helpers.createHandler)('login', {
                    setup: function setup() {
                        assert.ok('login setup called');
                    }
                })
            };
            // use `handleURL` to emulate initial transition properly
            (0, _test_helpers.handleURL)(router, '/').then((0, _test_helpers.shouldNotHappen)(assert, 'initial transition aborted'), function () {
                assert.equal(currentURL, '/login', 'currentURL matches');
                assert.deepEqual(urlStack, [['replaceURL', '/login']]);
                shouldRedirectToLogin = false;
                return lastTransition.retry();
            }).then(function () {
                assert.equal(currentURL, '/', 'after retry currentURL is updated');
                assert.deepEqual(urlStack, [['replaceURL', '/login'], ['updateURL', '/']]);
            }, (0, _test_helpers.shouldNotHappen)(assert, 'final catch'));
        });
        (0, _test_helpers.test)('completed transitions can be saved and later retried', function (assert) {
            assert.expect(8);
            var post = { id: '123' },
                savedTransition = void 0;
            routes = {
                showPost: (0, _test_helpers.createHandler)('showPost', {
                    afterModel: function afterModel(model, transition) {
                        if (savedTransition === undefined) {
                            assert.equal(transition.from && transition.from.localName, 'index', 'starting point');
                        } else {
                            assert.equal(transition.from && transition.from.localName, 'about', 'new starting point');
                        }
                        assert.equal(transition.to && transition.to.localName, 'showPost', 'to points at leaf');
                        assert.equal(model, post, "showPost's afterModel got the expected post model");
                        savedTransition = transition;
                    }
                }),
                index: (0, _test_helpers.createHandler)('index', {
                    model: function model(_params, transition) {
                        assert.equal(transition.from, null);
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(true, 'setup was entered');
                    }
                })
            };
            router.handleURL('/index').then(function () {
                return router.transitionTo('showPost', post);
            }).then(function () {
                return router.transitionTo('about');
            }).then(function () {
                return savedTransition.retry();
            });
        });
        function setupAuthenticatedExample(assert) {
            map(assert, function (match) {
                match('/index').to('index');
                match('/login').to('login');
                match('/admin').to('admin', function (match) {
                    match('/about').to('about');
                    match('/posts/:post_id').to('adminPost');
                });
            });
            var isLoggedIn = false,
                lastRedirectedTransition = void 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index'),
                login: (0, _test_helpers.createHandler)('login', {
                    events: {
                        logUserIn: function logUserIn() {
                            isLoggedIn = true;
                            lastRedirectedTransition.retry();
                        }
                    }
                }),
                admin: (0, _test_helpers.createHandler)('admin', {
                    beforeModel: function beforeModel(transition) {
                        lastRedirectedTransition = transition;
                        assert.ok(true, 'beforeModel redirect was called');
                        if (!isLoggedIn) {
                            router.transitionTo('login');
                        }
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    setup: function setup() {
                        assert.ok(isLoggedIn, 'about was entered only after user logged in');
                    }
                }),
                adminPost: (0, _test_helpers.createHandler)('adminPost', {
                    model: function model(params) {
                        assert.deepEqual(params, { post_id: '5', queryParams: {} }, 'adminPost received params previous transition attempt');
                        return 'adminPost';
                    },
                    setup: function setup(model) {
                        assert.equal(model, 'adminPost', 'adminPost was entered with correct model');
                    }
                })
            };
        }
        (0, _test_helpers.test)('authenticated routes: starting on non-auth route', function (assert) {
            assert.expect(8);
            setupAuthenticatedExample(assert);
            (0, _test_helpers.transitionTo)(router, '/index');
            (0, _test_helpers.transitionToWithAbort)(assert, router, 'about');
            (0, _test_helpers.transitionToWithAbort)(assert, router, 'about');
            (0, _test_helpers.transitionToWithAbort)(assert, router, '/admin/about');
            // Log in. This will retry the last failed transition to 'about'.
            router.trigger('logUserIn');
        });
        (0, _test_helpers.test)('authenticated routes: starting on auth route', function (assert) {
            assert.expect(8);
            setupAuthenticatedExample(assert);
            (0, _test_helpers.transitionToWithAbort)(assert, router, '/admin/about');
            (0, _test_helpers.transitionToWithAbort)(assert, router, '/admin/about');
            (0, _test_helpers.transitionToWithAbort)(assert, router, 'about');
            // Log in. This will retry the last failed transition to 'about'.
            router.trigger('logUserIn');
        });
        (0, _test_helpers.test)('authenticated routes: starting on parameterized auth route', function (assert) {
            assert.expect(5);
            setupAuthenticatedExample(assert);
            (0, _test_helpers.transitionToWithAbort)(assert, router, '/admin/posts/5');
            // Log in. This will retry the last failed transition to '/posts/5'.
            router.trigger('logUserIn');
        });
        (0, _test_helpers.test)('An instantly aborted transition fires no hooks', function (assert) {
            assert.expect(8);
            var hooksShouldBeCalled = false;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    beforeModel: function beforeModel(transition) {
                        assert.equal(transition.from, null, 'from is "null" on initial transitions even with aborts');
                        assert.ok(hooksShouldBeCalled, 'index beforeModel hook should be called at this time');
                    }
                }),
                about: (0, _test_helpers.createHandler)('about', {
                    beforeModel: function beforeModel() {
                        assert.ok(hooksShouldBeCalled, 'about beforeModel hook should be called at this time');
                    }
                })
            };
            router.transitionTo('index').abort().then((0, _test_helpers.shouldNotHappen)(assert), function () {
                assert.ok(true, 'Failure handler called for index');
                return router.transitionTo('/index').abort();
            }).then((0, _test_helpers.shouldNotHappen)(assert), function () {
                assert.ok(true, 'Failure handler called for /index');
                hooksShouldBeCalled = true;
                return router.transitionTo('index');
            }).then(function () {
                assert.ok(true, 'Success handler called for index');
                hooksShouldBeCalled = false;
                return router.transitionTo('about').abort();
            }, (0, _test_helpers.shouldNotHappen)(assert)).then((0, _test_helpers.shouldNotHappen)(assert), function () {
                assert.ok(true, 'failure handler called for about');
                return router.transitionTo('/about').abort();
            }).then((0, _test_helpers.shouldNotHappen)(assert), function () {
                assert.ok(true, 'failure handler called for /about');
                hooksShouldBeCalled = true;
                return router.transitionTo('/about');
            });
        });
        (0, _test_helpers.test)('a successful transition resolves with the target handler', function (assert) {
            assert.expect(2);
            // Note: this is extra convenient for Ember where you can all
            // .transitionTo right on the route.
            routes = {
                index: (0, _test_helpers.createHandler)('index', { borfIndex: true }),
                about: (0, _test_helpers.createHandler)('about', { borfAbout: true })
            };
            router.handleURL('/index').then(function (route) {
                assert.ok(route['borfIndex'], 'resolved to index handler');
                return router.transitionTo('about');
            }, (0, _test_helpers.shouldNotHappen)(assert)).then(function (result) {
                assert.ok(result.borfAbout, 'resolved to about handler');
            });
        });
        (0, _test_helpers.test)('transitions have a .promise property', function (assert) {
            assert.expect(2);
            router.handleURL('/index').promise.then(function () {
                var promise = router.transitionTo('about').abort().promise;
                assert.ok(promise, 'promise exists on aborted transitions');
                return promise;
            }, (0, _test_helpers.shouldNotHappen)(assert)).then((0, _test_helpers.shouldNotHappen)(assert), function () {
                assert.ok(true, 'failure handler called');
            });
        });
        (0, _test_helpers.test)('the serialize function is bound to the correct object when called', function (assert) {
            assert.expect(scenario.async ? 0 : 1);
            routes = {
                showPostsForDate: (0, _test_helpers.createHandler)('showPostsForDate', {
                    serialize: function serialize(date) {
                        assert.equal(this, routes.showPostsForDate);
                        return {
                            date: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
                        };
                    }
                })
            };
            router.generate('showPostsForDate', new Date(1815, 5, 18));
        });
        (0, _test_helpers.test)('transitionTo will soak up resolved parent models of active transition', function (assert) {
            assert.expect(5);
            var admin = { id: 47 },
                adminPost = { id: 74 },
                adminSetupShouldBeEntered = false;
            function adminPromise() {
                return new _rsvp.Promise(function (res) {
                    res(admin);
                });
            }
            var adminHandler = (0, _test_helpers.createHandler)('admin', {
                serialize: function serialize(object) {
                    assert.equal(object.id, 47, 'The object passed to serialize is correct');
                    return { id: 47 };
                },
                model: function model(params) {
                    assert.equal(params.id, 47, 'The object passed to serialize is correct');
                    return admin;
                },
                setup: function setup() {
                    assert.ok(adminSetupShouldBeEntered, "adminHandler's setup should be called at this time");
                }
            });
            var adminPostHandler = (0, _test_helpers.createHandler)('adminPost', {
                serialize: function serialize(object) {
                    return { post_id: object.id };
                },
                setup: function setup() {
                    assert.equal(adminHandler.context, admin, 'adminPostHandler receives resolved soaked promise from previous transition');
                },
                model: function model() {
                    return adminPost;
                }
            });
            var adminPostsHandler = (0, _test_helpers.createHandler)('adminPosts', {
                beforeModel: function beforeModel() {
                    adminSetupShouldBeEntered = true;
                    router.transitionTo('adminPost', adminPost);
                }
            });
            var indexHandler = (0, _test_helpers.createHandler)('index', {
                setup: function setup() {
                    assert.ok(true, 'index entered');
                }
            });
            routes = {
                index: indexHandler,
                admin: adminHandler,
                adminPost: adminPostHandler,
                adminPosts: adminPostsHandler
            };
            router.transitionTo('index').then(function () {
                router.transitionTo('adminPosts', adminPromise()).then((0, _test_helpers.shouldNotHappen)(assert), (0, _test_helpers.assertAbort)(assert));
            });
        });
        (0, _test_helpers.test)("transitionTo will soak up resolved all models of active transition, including present route's resolved model", function (assert) {
            assert.expect(2);
            var modelCalled = 0,
                hasRedirected = false;
            map(assert, function (match) {
                match('/post').to('post', function (match) {
                    match('/').to('postIndex');
                    match('/new').to('postNew');
                });
            });
            var postHandler = (0, _test_helpers.createHandler)('post', {
                model: function model() {
                    assert.equal(modelCalled++, 0, "postHandler's model should only be called once");
                    return { title: 'Hello world' };
                },
                redirect: function redirect() {
                    if (!hasRedirected) {
                        hasRedirected = true;
                        router.transitionTo('postNew');
                    }
                }
            });
            routes = {
                post: postHandler,
                postIndex: (0, _test_helpers.createHandler)('postIndex'),
                postNew: (0, _test_helpers.createHandler)('postNew')
            };
            router.transitionTo('postIndex').then((0, _test_helpers.shouldNotHappen)(assert), (0, _test_helpers.assertAbort)(assert));
        });
        (0, _test_helpers.test)("can reference leaf '/' route by leaf or parent name", function (assert) {
            map(assert, function (match) {
                match('/').to('app', function (match) {
                    match('/').to('index');
                    match('/nest').to('nest', function (match) {
                        match('/').to('nest.index');
                    });
                });
            });
            function assertOnRoute(name) {
                var last = router.currentRouteInfos[router.currentRouteInfos.length - 1];
                assert.equal(last.name, name);
            }
            (0, _test_helpers.transitionTo)(router, 'app');
            assertOnRoute('index');
            (0, _test_helpers.transitionTo)(router, 'nest');
            assertOnRoute('nest.index');
            (0, _test_helpers.transitionTo)(router, 'app');
            assertOnRoute('index');
        });
        (0, _test_helpers.test)('resolved models can be swapped out within afterModel', function (assert) {
            assert.expect(3);
            var modelPre = {},
                modelPost = {};
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    model: function model() {
                        return modelPre;
                    },
                    afterModel: function afterModel(resolvedModel, transition) {
                        assert.equal(resolvedModel, transition.resolvedModels.index, "passed-in resolved model equals model in transition's hash");
                        assert.equal(resolvedModel, modelPre, 'passed-in resolved model equals model returned from `model`');
                        transition.resolvedModels.index = modelPost;
                    },
                    setup: function setup(model) {
                        assert.equal(model, modelPost, 'the model passed to `setup` is the one substituted in afterModel');
                    }
                })
            };
            router.transitionTo('index');
        });
        (0, _test_helpers.test)('String/number args in transitionTo are treated as url params', function (assert) {
            assert.expect(11);
            var adminParams = { id: '1' },
                adminModel = { id: '1' },
                adminPostModel = { id: '2' };
            routes = {
                admin: (0, _test_helpers.createHandler)('admin', {
                    model: function model(params) {
                        delete params.queryParams;
                        assert.deepEqual(params, adminParams, 'admin handler gets the number passed in via transitionTo, converts to string');
                        return adminModel;
                    }
                }),
                adminPost: (0, _test_helpers.createHandler)('adminPost', {
                    model: function model(params) {
                        delete params.queryParams;
                        assert.deepEqual(params, { post_id: '2' }, 'adminPost handler gets the string passed in via transitionTo');
                        return adminPostModel;
                    },
                    setup: function setup() {
                        assert.ok(true, 'adminPost setup was entered');
                    }
                })
            };
            router.handleURL('/index').then(function () {
                expectedUrl = '/posts/admin/1/posts/2';
                return router.transitionTo('adminPost', 1, '2');
            }).then(function () {
                assert.ok(router.isActive('adminPost', 1, '2'), 'adminPost is active via params');
                assert.ok(router.isActive('adminPost', 1, adminPostModel), 'adminPost is active via contexts');
                adminParams = { id: '0' };
                expectedUrl = '/posts/admin/0/posts/2';
                return router.transitionTo('adminPost', 0, '2');
            }).then(function () {
                assert.ok(router.isActive('adminPost', 0, '2'), 'adminPost is active via params');
                assert.ok(router.isActive('adminPost', 0, adminPostModel), 'adminPost is active via contexts');
            }, (0, _test_helpers.shouldNotHappen)(assert));
        });
        (0, _test_helpers.test)("Transitions returned from beforeModel/model/afterModel hooks aren't treated as pausing promises", function (assert) {
            assert.expect(6);
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    beforeModel: function beforeModel() {
                        assert.ok(true, 'index beforeModel called');
                        return router.transitionTo('index');
                    },
                    model: function model() {
                        assert.ok(true, 'index model called');
                        return router.transitionTo('index');
                    },
                    afterModel: function afterModel() {
                        assert.ok(true, 'index afterModel called');
                        return router.transitionTo('index');
                    }
                })
            };
            function testStartup(assert) {
                map(assert, function (match) {
                    match('/index').to('index');
                });
                return router.handleURL('/index');
            }
            testStartup(assert).then(function () {
                delete routes.index.beforeModel;
                return testStartup(assert);
            }).then(function () {
                delete routes.index.model;
                return testStartup(assert);
            }).then(function () {
                delete routes.index.afterModel;
                return testStartup(assert);
            });
        });
        /* TODO: revisit this idea
        test("exceptions thrown from model hooks aren't swallowed", function(assert) {
        assert.expect(7);
           enableErrorHandlingDeferredActionQueue();
           let anError = {};
        function throwAnError() {
          throw anError;
        }
           let routeWasEntered = false;
           handlers = {
          index: {
            beforeModel: throwAnError,
            model: throwAnError,
            afterModel: throwAnError,
            setup: function(model) {
              routeWasEntered = true;
            }
          }
        };
           let hooks = ['beforeModel', 'model', 'afterModel'];
           while(hooks.length) {
          let transition = router.transitionTo('index');
          flush(anError);
          transition.abort();
          assert.ok(!routeWasEntered, "route hasn't been entered yet");
          delete handlers.index[hooks.shift()];
        }
           router.transitionTo('index');
        flush(anError);
           assert.ok(routeWasEntered, "route was finally entered");
        });
        */
        (0, _test_helpers.test)('Transition#followRedirects() returns a promise that fulfills when any redirecting transitions complete', function (assert) {
            assert.expect(3);
            routes.about = (0, _test_helpers.createHandler)('about', {
                redirect: function redirect() {
                    router.transitionTo('faq').then(null, (0, _test_helpers.shouldNotHappen)(assert));
                }
            });
            router.transitionTo('/index').followRedirects().then(function (handler) {
                assert.equal(handler, routes.index, 'followRedirects works with non-redirecting transitions');
                return router.transitionTo('about').followRedirects();
            }).then(function (handler) {
                assert.equal(handler, routes.faq, 'followRedirects promise resolved with redirected faq handler');
                routes.about.beforeModel = function (transition) {
                    transition.abort();
                    return undefined;
                };
                // followRedirects should just reject for non-redirecting transitions.
                return router.transitionTo('about').followRedirects().then((0, _test_helpers.shouldNotHappen)(assert), (0, _test_helpers.assertAbort)(assert));
            });
        });
        (0, _test_helpers.test)("Returning a redirecting Transition from a model hook doesn't cause things to explode", function (assert) {
            assert.expect(2);
            routes.index = (0, _test_helpers.createHandler)('index', {
                beforeModel: function beforeModel() {
                    return router.transitionTo('about');
                }
            });
            routes.about = (0, _test_helpers.createHandler)('about', {
                setup: function setup() {
                    assert.ok(true, 'about#setup was called');
                }
            });
            router.transitionTo('/index').then(null, (0, _test_helpers.assertAbort)(assert));
        });
        (0, _test_helpers.test)('Generate works w queryparams', function (assert) {
            assert.equal(router.generate('index'), '/index', 'just index');
            assert.equal(router.generate('index', { queryParams: { foo: '123' } }), '/index?foo=123', 'just index');
            assert.equal(router.generate('index', { queryParams: { foo: '123', bar: '456' } }), '/index?bar=456&foo=123', 'just index');
        });
        if (scenario.async) {
            (0, _test_helpers.test)('Generate does not invoke getHandler', function (assert) {
                var originalGetHandler = router.getRoute;
                router.getRoute = function () {
                    assert.ok(false, 'getHandler should not be called');
                    return (0, _test_helpers.createHandler)('empty');
                };
                assert.equal(router.generate('index'), '/index', 'just index');
                assert.equal(router.generate('index', { queryParams: { foo: '123' } }), '/index?foo=123', 'just index');
                assert.equal(router.generate('index', { queryParams: { foo: '123', bar: '456' } }), '/index?bar=456&foo=123', 'just index');
                router.getRoute = originalGetHandler;
            });
        }
        (0, _test_helpers.test)('errors in enter/setup hooks fire `error`', function (assert) {
            assert.expect(4);
            var count = 0;
            routes = {
                index: (0, _test_helpers.createHandler)('index', {
                    enter: function enter() {
                        throw 'OMG ENTER';
                    },
                    setup: function setup() {
                        throw 'OMG SETUP';
                    },
                    events: {
                        error: function error(e) {
                            if (count === 0) {
                                assert.equal(e, 'OMG ENTER', "enter's throw value passed to error hook");
                            } else if (count === 1) {
                                assert.equal(e, 'OMG SETUP', "setup's throw value passed to error hook");
                            } else {
                                assert.ok(false, 'should not happen');
                            }
                        }
                    }
                })
            };
            router.handleURL('/index').then((0, _test_helpers.shouldNotHappen)(assert), function (reason) {
                assert.equal(reason, 'OMG ENTER', "enters's error was propagated");
                count++;
                delete routes.index.enter;
                return router.handleURL('/index');
            }).then((0, _test_helpers.shouldNotHappen)(assert), function (reason) {
                assert.equal(reason, 'OMG SETUP', "setup's error was propagated");
                delete routes.index.setup;
            });
        });
        (0, _test_helpers.test)('invalidating parent model with different string/numeric parameters invalidates children', function (assert) {
            map(assert, function (match) {
                match('/:p').to('parent', function (match) {
                    match('/:c').to('child');
                });
            });
            assert.expect(8);
            var count = 0;
            routes = {
                parent: (0, _test_helpers.createHandler)('parent', {
                    model: function model(params) {
                        assert.ok(true, 'parent model called');
                        return { id: params.p };
                    },
                    setup: function setup(model) {
                        if (count === 0) {
                            assert.deepEqual(model, { id: '1' });
                        } else {
                            assert.deepEqual(model, { id: '2' });
                        }
                    }
                }),
                child: (0, _test_helpers.createHandler)('child', {
                    model: function model(params) {
                        assert.ok(true, 'child model called');
                        return { id: params.c };
                    },
                    setup: function setup(model) {
                        if (count === 0) {
                            assert.deepEqual(model, { id: '1' });
                        } else {
                            assert.deepEqual(model, { id: '1' });
                        }
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, 'child', '1', '1');
            count = 1;
            (0, _test_helpers.transitionTo)(router, 'child', '2', '1');
        });
        (0, _test_helpers.test)('intents make use of previous transition state in case not enough contexts are provided to retry a transition', function (assert) {
            assert.expect(3);
            map(assert, function (match) {
                match('/').to('application', function (match) {
                    match('/users/:user').to('user', function (match) {
                        match('/index').to('userIndex');
                        match('/auth').to('auth');
                    });
                    match('/login').to('login');
                });
            });
            var hasAuthed = false,
                savedTransition = void 0,
                didFinish = false;
            routes = {
                auth: (0, _test_helpers.createHandler)('auth', {
                    beforeModel: function beforeModel(transition) {
                        if (!hasAuthed) {
                            savedTransition = transition;
                            router.transitionTo('login');
                        }
                    },
                    setup: function setup() {
                        didFinish = true;
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, 'userIndex', { user: 'machty' });
            // Then attempt to transition into auth; this will redirect.
            (0, _test_helpers.transitionTo)(router, 'auth');
            assert.ok(savedTransition, 'transition was saved');
            hasAuthed = true;
            savedTransition.retry();
            (0, _test_helpers.flushBackburner)();
            assert.ok(didFinish, 'did enter auth route');
            assert.equal(routes.user.context.user, 'machty', 'User was remembered upon retry');
        });
        (0, _test_helpers.test)('A failed transition calls the catch and finally callbacks', function (assert) {
            assert.expect(2);
            map(assert, function (match) {
                match('/').to('application', function (match) {
                    match('/bad').to('badRoute');
                });
            });
            routes = {
                badRoute: (0, _test_helpers.createHandler)('badRoute', {
                    beforeModel: function beforeModel() {
                        return new _rsvp.Promise(function (_resolve, reject) {
                            reject('example reason');
                        });
                    }
                })
            };
            router.handleURL('/bad').catch(function () {
                assert.ok(true, 'catch callback was called');
            }).finally(function () {
                assert.ok(true, 'finally callback was called');
            });
            (0, _test_helpers.flushBackburner)();
        });
        (0, _test_helpers.test)('A successful transition calls the finally callback', function (assert) {
            assert.expect(1);
            map(assert, function (match) {
                match('/').to('application', function (match) {
                    match('/example').to('exampleRoute');
                });
            });
            router.handleURL('/example').finally(function () {
                assert.ok(true, 'finally callback was called');
            });
        });
        (0, _test_helpers.test)('transition sets isActive by default', function (assert) {
            assert.expect(2);
            map(assert, function (match) {
                match('/').to('application', function (match) {
                    match('/example').to('exampleRoute');
                });
            });
            var transition = router.handleURL('/example');
            assert.equal(transition.isActive, true);
            assert.equal(transition.isAborted, false);
        });
        (0, _test_helpers.test)('transition sets isActive to false when aborted', function (assert) {
            assert.expect(4);
            map(assert, function (match) {
                match('/').to('application', function (match) {
                    match('/example').to('exampleRoute');
                });
            });
            var transition = router.handleURL('/example');
            assert.equal(transition.isActive, true, 'precond');
            assert.equal(transition.isAborted, false, 'precond');
            transition.abort();
            assert.equal(transition.isActive, false, 'isActive should be false after abort');
            assert.equal(transition.isAborted, true, 'isAborted is set to true after abort');
        });
        if (scenario.async) {
            (0, _test_helpers.test)('getHandler is invoked synchronously when returning Promises', function (assert) {
                assert.expect(2);
                var count = 0;
                var handlerCount = 2;
                routes = {
                    postIndex: (0, _test_helpers.createHandler)('postIndex'),
                    showAllPosts: (0, _test_helpers.createHandler)('showAllPosts')
                };
                router.getRoute = function () {
                    count++;
                    return scenario.getRoute.apply(null, arguments).then(function (handler) {
                        assert.equal(count, handlerCount);
                        return handler;
                    });
                };
                router.transitionTo('/posts/all');
            });
        }
        (0, _test_helpers.module)('Multiple dynamic segments per route (' + scenario.name + ')');
        (0, _test_helpers.test)('Multiple string/number params are soaked up', function (assert) {
            assert.expect(3);
            map(assert, function (match) {
                match('/:foo_id/:bar_id').to('bar');
            });
            routes = {
                bar: (0, _test_helpers.createHandler)('bar', {
                    model: function model() {
                        return {};
                    }
                })
            };
            expectedUrl = '/omg/lol';
            (0, _test_helpers.transitionTo)(router, 'bar', 'omg', 'lol');
            expectedUrl = '/omg/heehee';
            (0, _test_helpers.transitionTo)(router, 'bar', 'heehee');
            expectedUrl = '/lol/no';
            (0, _test_helpers.transitionTo)(router, 'bar', 'lol', 'no');
        });
        (0, _test_helpers.module)('isActive (' + scenario.name + ')', {
            setup: function setup(assert) {
                routes = {
                    parent: (0, _test_helpers.createHandler)('parent', {
                        serialize: function serialize(obj) {
                            return {
                                one: obj.one,
                                two: obj.two
                            };
                        }
                    }),
                    child: (0, _test_helpers.createHandler)('child', {
                        serialize: function serialize(obj) {
                            return {
                                three: obj.three,
                                four: obj.four
                            };
                        }
                    })
                };
                // When using an async getHandler serializers need to be loaded separately
                if (scenario.async) {
                    serializers = {
                        parent: function parent(obj) {
                            return {
                                one: obj.one,
                                two: obj.two
                            };
                        },
                        child: function child(obj) {
                            return {
                                three: obj.three,
                                four: obj.four
                            };
                        }
                    };
                }
                map(assert, function (match) {
                    match('/:one/:two').to('parent', function (match) {
                        match('/:three/:four').to('child');
                    });
                });
                expectedUrl = null;
                (0, _test_helpers.transitionTo)(router, 'child', 'a', 'b', 'c', 'd');
            }
        });
        (0, _test_helpers.test)('isActive supports multiple soaked up string/number params (via params)', function (assert) {
            assert.ok(router.isActive('child'), 'child');
            assert.ok(router.isActive('parent'), 'parent');
            assert.ok(router.isActive('child', 'd'), 'child d');
            assert.ok(router.isActive('child', 'c', 'd'), 'child c d');
            assert.ok(router.isActive('child', 'b', 'c', 'd'), 'child b c d');
            assert.ok(router.isActive('child', 'a', 'b', 'c', 'd'), 'child a b c d');
            assert.ok(!router.isActive('child', 'e'), '!child e');
            assert.ok(!router.isActive('child', 'c', 'e'), '!child c e');
            assert.ok(!router.isActive('child', 'e', 'd'), '!child e d');
            assert.ok(!router.isActive('child', 'x', 'x'), '!child x x');
            assert.ok(!router.isActive('child', 'b', 'c', 'e'), '!child b c e');
            assert.ok(!router.isActive('child', 'b', 'e', 'd'), 'child b e d');
            assert.ok(!router.isActive('child', 'e', 'c', 'd'), 'child e c d');
            assert.ok(!router.isActive('child', 'a', 'b', 'c', 'e'), 'child a b c e');
            assert.ok(!router.isActive('child', 'a', 'b', 'e', 'd'), 'child a b e d');
            assert.ok(!router.isActive('child', 'a', 'e', 'c', 'd'), 'child a e c d');
            assert.ok(!router.isActive('child', 'e', 'b', 'c', 'd'), 'child e b c d');
            assert.ok(router.isActive('parent', 'b'), 'parent b');
            assert.ok(router.isActive('parent', 'a', 'b'), 'parent a b');
            assert.ok(!router.isActive('parent', 'c'), '!parent c');
            assert.ok(!router.isActive('parent', 'a', 'c'), '!parent a c');
            assert.ok(!router.isActive('parent', 'c', 'b'), '!parent c b');
            assert.ok(!router.isActive('parent', 'c', 't'), '!parent c t');
        });
        (0, _test_helpers.test)('isActive supports multiple soaked up string/number params (via serialized objects)', function (assert) {
            assert.ok(router.isActive('child', { three: 'c', four: 'd' }), 'child(3:c, 4:d)');
            assert.ok(!router.isActive('child', { three: 'e', four: 'd' }), '!child(3:e, 4:d)');
            assert.ok(!router.isActive('child', { three: 'c', four: 'e' }), '!child(3:c, 4:e)');
            assert.ok(!router.isActive('child', { three: 'c' }), '!child(3:c)');
            assert.ok(!router.isActive('child', { four: 'd' }), '!child(4:d)');
            assert.ok(!router.isActive('child', {}), '!child({})');
            assert.ok(router.isActive('parent', { one: 'a', two: 'b' }), 'parent(1:a, 2:b)');
            assert.ok(!router.isActive('parent', { one: 'e', two: 'b' }), '!parent(1:e, 2:b)');
            assert.ok(!router.isActive('parent', { one: 'a', two: 'e' }), '!parent(1:a, 2:e)');
            assert.ok(!router.isActive('parent', { one: 'a' }), '!parent(1:a)');
            assert.ok(!router.isActive('parent', { two: 'b' }), '!parent(2:b)');
            assert.ok(router.isActive('child', { one: 'a', two: 'b' }, { three: 'c', four: 'd' }), 'child(1:a, 2:b, 3:c, 4:d)');
            assert.ok(!router.isActive('child', { one: 'e', two: 'b' }, { three: 'c', four: 'd' }), '!child(1:e, 2:b, 3:c, 4:d)');
            assert.ok(!router.isActive('child', { one: 'a', two: 'b' }, { three: 'c', four: 'e' }), '!child(1:a, 2:b, 3:c, 4:e)');
        });
        (0, _test_helpers.test)('isActive supports multiple soaked up string/number params (mixed)', function (assert) {
            assert.ok(router.isActive('child', 'a', 'b', { three: 'c', four: 'd' }));
            assert.ok(router.isActive('child', 'b', { three: 'c', four: 'd' }));
            assert.ok(!router.isActive('child', 'a', { three: 'c', four: 'd' }));
            assert.ok(router.isActive('child', { one: 'a', two: 'b' }, 'c', 'd'));
            assert.ok(router.isActive('child', { one: 'a', two: 'b' }, 'd'));
            assert.ok(!router.isActive('child', { one: 'a', two: 'b' }, 'c'));
            assert.ok(!router.isActive('child', 'a', 'b', { three: 'e', four: 'd' }));
            assert.ok(!router.isActive('child', 'b', { three: 'e', four: 'd' }));
            assert.ok(!router.isActive('child', { one: 'e', two: 'b' }, 'c', 'd'));
            assert.ok(!router.isActive('child', { one: 'e', two: 'b' }, 'd'));
        });
        (0, _test_helpers.module)('Preservation of params between redirects (' + scenario.name + ')', {
            setup: function setup(assert) {
                expectedUrl = null;
                map(assert, function (match) {
                    match('/').to('index');
                    match('/:foo_id').to('foo', function (match) {
                        match('/').to('fooIndex');
                        match('/:bar_id').to('bar', function (match) {
                            match('/').to('barIndex');
                        });
                    });
                });
                routes = {
                    foo: (0, _test_helpers.createHandler)('foo', {
                        modelCount: undefined,
                        model: function model(params) {
                            this.modelCount = this.modelCount ? this.modelCount + 1 : 1;
                            return { id: params.foo_id };
                        },
                        afterModel: function afterModel() {
                            router.transitionTo('barIndex', '789');
                        }
                    }),
                    bar: (0, _test_helpers.createHandler)('bar', {
                        model: function model(params) {
                            this.modelCount = this.modelCount ? this.modelCount + 1 : 1;
                            return { id: params.bar_id };
                        }
                    })
                };
            }
        });
        (0, _test_helpers.test)("Starting on '/' root index", function (assert) {
            (0, _test_helpers.transitionTo)(router, '/');
            // Should call model for foo and bar
            expectedUrl = '/123/789';
            (0, _test_helpers.transitionTo)(router, 'barIndex', '123', '456');
            assert.equal(routes.foo.modelCount, 2, 'redirect in foo#afterModel should run foo#model twice (since validation failed)');
            assert.deepEqual(routes.foo.context, { id: '123' });
            assert.deepEqual(routes.bar.context, { id: '789' }, 'bar should have redirected to bar 789');
            // Try setting foo's context to 200; this should redirect
            // bar to '789' but preserve the new foo 200.
            expectedUrl = '/200/789';
            (0, _test_helpers.transitionTo)(router, 'fooIndex', '200');
            assert.equal(routes.foo.modelCount, 4, 'redirect in foo#afterModel should re-run foo#model');
            assert.deepEqual(routes.foo.context, { id: '200' });
            assert.deepEqual(routes.bar.context, { id: '789' }, 'bar should have redirected to bar 789');
        });
        (0, _test_helpers.test)("Starting on '/' root index, using redirect", function (assert) {
            routes.foo.redirect = routes.foo.afterModel;
            delete routes.foo.afterModel;
            (0, _test_helpers.transitionTo)(router, '/');
            // Should call model for foo and bar
            expectedUrl = '/123/789';
            (0, _test_helpers.transitionTo)(router, 'barIndex', '123', '456');
            assert.equal(routes.foo.modelCount, 1, 'redirect in foo#redirect should NOT run foo#model (since validation succeeded)');
            assert.deepEqual(routes.foo.context, { id: '123' });
            assert.deepEqual(routes.bar.context, { id: '789' }, 'bar should have redirected to bar 789');
            // Try setting foo's context to 200; this should redirect
            // bar to '789' but preserve the new foo 200.
            expectedUrl = '/200/789';
            (0, _test_helpers.transitionTo)(router, 'fooIndex', '200');
            assert.equal(routes.foo.modelCount, 2, 'redirect in foo#redirect should NOT foo#model');
            assert.deepEqual(routes.foo.context, { id: '200' });
            assert.deepEqual(routes.bar.context, { id: '789' }, 'bar should have redirected to bar 789');
        });
        (0, _test_helpers.test)('Starting on non root index', function (assert) {
            (0, _test_helpers.transitionTo)(router, '/123/456');
            assert.deepEqual(routes.foo.context, { id: '123' });
            assert.deepEqual(routes.bar.context, { id: '789' }, 'bar should have redirected to bar 789');
            // Try setting foo's context to 200; this should redirect
            // bar to '789' but preserve the new foo 200.
            expectedUrl = '/200/789';
            (0, _test_helpers.transitionTo)(router, 'fooIndex', '200');
            assert.deepEqual(routes.foo.context, { id: '200' });
            assert.deepEqual(routes.bar.context, { id: '789' }, 'bar should have redirected to bar 789');
        });
        /* TODO revisit
        test("A failed handler's setup shouldn't prevent future transitions", function(assert) {
        assert.expect(2);
           enableErrorHandlingDeferredActionQueue();
           map(assert, function(match) {
          match("/parent").to('parent', function(match) {
            match("/articles").to('articles');
            match("/login").to('login');
          });
        });
           let error = new Error("blorg");
           handlers = {
          articles: {
            setup: function() {
              assert.ok(true, "articles setup was entered");
              throw error;
            },
            events: {
              error: function() {
                assert.ok(true, "error handled in articles");
                router.transitionTo('login');
              }
            }
          },
             login: {
            setup: function() {
              start();
            }
          }
        };
           router.handleURL('/parent/articles');
        flush(error);
        });
        */
        (0, _test_helpers.test)("beforeModel shouldn't be refired with incorrect params during redirect", function (assert) {
            // Source: https://github.com/emberjs/ember.js/issues/3407
            assert.expect(3);
            map(assert, function (match) {
                match('/').to('index');
                match('/people/:id').to('people', function (match) {
                    match('/').to('peopleIndex');
                    match('/home').to('peopleHome');
                });
            });
            var peopleModels = [null, {}, {}];
            var peopleBeforeModelCalled = false;
            routes = {
                people: (0, _test_helpers.createHandler)('people', {
                    beforeModel: function beforeModel() {
                        assert.ok(!peopleBeforeModelCalled, 'people#beforeModel should only be called once');
                        peopleBeforeModelCalled = true;
                    },
                    model: function model(params) {
                        assert.ok(params.id, 'people#model called');
                        return peopleModels[params.id];
                    }
                }),
                peopleIndex: (0, _test_helpers.createHandler)('peopleIndex', {
                    afterModel: function afterModel() {
                        router.transitionTo('peopleHome');
                    }
                }),
                peopleHome: (0, _test_helpers.createHandler)('peopleHome', {
                    setup: function setup() {
                        assert.ok(true, 'I was entered');
                    }
                })
            };
            (0, _test_helpers.transitionTo)(router, '/');
            (0, _test_helpers.transitionTo)(router, 'peopleIndex', '1');
        });
        (0, _test_helpers.module)('URL-less routes (' + scenario.name + ')', {
            setup: function setup(assert) {
                routes = {};
                expectedUrl = null;
                map(assert, function (match) {
                    match('/index').to('index');
                    match('/admin').to('admin', function (match) {
                        match('/posts').to('adminPosts');
                        match('/articles').to('adminArticles');
                    });
                });
            }
        });
        (0, _test_helpers.test)("Transitioning into a route marked as inaccessibleByURL doesn't update the URL", function (assert) {
            assert.expect(1);
            routes = {
                adminPosts: (0, _test_helpers.createHandler)('adminPosts', {
                    inaccessibleByURL: true
                })
            };
            router.handleURL('/index').then(function () {
                url = '/index';
                return router.transitionTo('adminPosts');
            }).then(function () {
                assert.equal(url, '/index');
            });
        });
        (0, _test_helpers.test)("Transitioning into a route with a parent route marked as inaccessibleByURL doesn't update the URL", function (assert) {
            assert.expect(2);
            routes = {
                admin: (0, _test_helpers.createHandler)('admin', {
                    inaccessibleByURL: true
                })
            };
            (0, _test_helpers.transitionTo)(router, '/index');
            url = '/index';
            (0, _test_helpers.transitionTo)(router, 'adminPosts');
            assert.equal(url, '/index');
            (0, _test_helpers.transitionTo)(router, 'adminArticles');
            assert.equal(url, '/index');
        });
        (0, _test_helpers.test)('Handling a URL on a route marked as inaccessible behaves like a failed url match', function (assert) {
            assert.expect(1);
            routes = {
                admin: (0, _test_helpers.createHandler)('admin', {
                    inaccessibleByURL: true
                })
            };
            router.handleURL('/index').then(function () {
                return router.handleURL('/admin/posts');
            }).then((0, _test_helpers.shouldNotHappen)(assert), function (e) {
                assert.equal(e.name, 'UnrecognizedURLError', 'error.name is UnrecognizedURLError');
            });
        });
        (0, _test_helpers.module)('Intermediate transitions (' + scenario.name + ')', {
            setup: function setup(assert) {
                routes = {};
                expectedUrl = null;
                map(assert, function (match) {
                    match('/').to('application', function (match) {
                        //match("/").to("index");
                        match('/foo').to('foo');
                        match('/loading').to('loading');
                    });
                });
            }
        });
        (0, _test_helpers.test)('intermediateTransitionTo() has the correct RouteInfo objects', function (assert) {
            assert.expect(5);
            routes = {
                application: (0, _test_helpers.createHandler)('application'),
                foo: (0, _test_helpers.createHandler)('foo', {
                    model: function model() {
                        router.intermediateTransitionTo('loading');
                        return new _rsvp.Promise(function (resolve) {
                            resolve();
                        });
                    }
                }),
                loading: (0, _test_helpers.createHandler)('loading')
            };
            var enteredCount = 0;
            router.routeWillChange = function (transition) {
                if (enteredCount === 0) {
                    assert.equal(transition.to.name, 'foo', 'going to');
                    enteredCount++;
                } else if (enteredCount === 1) {
                    assert.equal(transition.to.name, 'loading', 'entering');
                    enteredCount++;
                } else {
                    assert.equal(transition.to.name, 'foo', 'back to');
                    enteredCount++;
                }
                assert.equal(transition.from, null);
            };
            router.routeDidChange = function (transition) {
                if (enteredCount === 1) {
                    assert.equal(transition.to.name, 'loading');
                } else {
                    assert.equal(transition.to.name, 'foo', 'landed at');
                }
            };
            (0, _test_helpers.transitionTo)(router, '/foo');
        });
        (0, _test_helpers.test)("intermediateTransitionTo() forces an immediate intermediate transition that doesn't cancel currently active async transitions", function (assert) {
            assert.expect(11);
            var counter = 1,
                willResolves = void 0,
                appModel = {},
                fooModel = {};
            function counterAt(expectedValue, description) {
                assert.equal(counter, expectedValue, 'Step ' + expectedValue + ': ' + description);
                counter++;
            }
            routes = {
                application: (0, _test_helpers.createHandler)('application', {
                    model: function model() {
                        return appModel;
                    },
                    setup: function setup(obj) {
                        counterAt(1, 'application#setup');
                        assert.equal(obj, appModel, 'application#setup is passed the return value from model');
                    },
                    events: {
                        willResolveModel: function willResolveModel(_transition, handler) {
                            assert.equal(willResolves.shift(), handler, 'willResolveModel event fired and passed expanded handler');
                        }
                    }
                }),
                foo: (0, _test_helpers.createHandler)('foo', {
                    model: function model() {
                        router.intermediateTransitionTo('loading');
                        counterAt(3, 'intermediate transition finished within foo#model');
                        return new _rsvp.Promise(function (resolve) {
                            counterAt(4, "foo's model promise resolves");
                            resolve(fooModel);
                        });
                    },
                    setup: function setup(obj) {
                        counterAt(6, 'foo#setup');
                        assert.equal(obj, fooModel, 'foo#setup is passed the resolve model promise');
                    }
                }),
                loading: (0, _test_helpers.createHandler)('loading', {
                    model: function model() {
                        assert.ok(false, "intermediate transitions don't call model hooks");
                    },
                    setup: function setup() {
                        counterAt(2, 'loading#setup');
                    },
                    exit: function exit() {
                        counterAt(5, 'loading state exited');
                    }
                })
            };
            willResolves = [routes.application, routes.foo];
            (0, _test_helpers.transitionTo)(router, '/foo');
            counterAt(7, 'original transition promise resolves');
        });
        (0, _test_helpers.test)('Calling transitionTo during initial transition in validation hook should use replaceURL', function (assert) {
            assert.expect(4);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
            });
            var fooModelCount = 0,
                barModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(false, 'The url was not correctly replaced on initial transition');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(true, 'The url was replaced correctly on initial transition');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.transitionTo('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler
            };
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/bar');
            assert.equal(fooModelCount, 1);
            assert.equal(barModelCount, 1);
        });
        (0, _test_helpers.test)('Calling transitionTo during initial transition in validation hook with multiple redirects should use replaceURL', function (assert) {
            assert.expect(5);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
                match('/baz').to('baz');
            });
            var fooModelCount = 0,
                barModelCount = 0,
                bazModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(false, 'The url was not correctly replaced on initial transition');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(true, 'The url was replaced correctly on initial transition');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.transitionTo('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                    router.transitionTo('/baz');
                }
            });
            var bazHandler = (0, _test_helpers.createHandler)('baz', {
                model: function model() {
                    bazModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler,
                baz: bazHandler
            };
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/baz');
            assert.equal(fooModelCount, 1);
            assert.equal(barModelCount, 1);
            assert.equal(bazModelCount, 1);
        });
        (0, _test_helpers.test)('Calling transitionTo after initial transition in validation hook should use updateUrl', function (assert) {
            assert.expect(8);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
            });
            var fooModelCount = 0,
                barModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(true, 'updateURL should be used');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(false, 'replaceURL should not be used');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.transitionTo('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler
            };
            (0, _test_helpers.transitionTo)(router, '/bar');
            assert.equal(url, '/bar');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
            assert.equal(fooModelCount, 0, 'Foo model should not be called');
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/bar');
            assert.equal(barModelCount, 2, 'Bar model should be called twice');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
        });
        (0, _test_helpers.test)('Calling transitionTo after initial transition in validation hook with multiple redirects should use updateUrl', function (assert) {
            assert.expect(10);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
                match('/baz').to('baz');
            });
            var fooModelCount = 0,
                barModelCount = 0,
                bazModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(true, 'updateURL should be used');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(false, 'replaceURL should not be used');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.transitionTo('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                    router.transitionTo('/baz');
                }
            });
            var bazHandler = (0, _test_helpers.createHandler)('baz', {
                model: function model() {
                    bazModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler,
                baz: bazHandler
            };
            (0, _test_helpers.transitionTo)(router, '/baz');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 1, 'Baz model should be called once');
            assert.equal(fooModelCount, 0, 'Foo model should not be called');
            assert.equal(barModelCount, 0, 'Bar model should not be called');
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 2, 'Baz model should be called twice');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
        });
        (0, _test_helpers.test)('Calling replaceWith during initial transition in validation hook should use replaceURL', function (assert) {
            assert.expect(4);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
            });
            var fooModelCount = 0,
                barModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(false, 'The url was not correctly replaced on initial transition');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(true, 'The url was replaced correctly on initial transition');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.replaceWith('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler
            };
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/bar');
            assert.equal(fooModelCount, 1);
            assert.equal(barModelCount, 1);
        });
        (0, _test_helpers.test)('Calling replaceWith during initial transition in validation hook with multiple redirects should use replaceURL', function (assert) {
            assert.expect(5);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
                match('/baz').to('baz');
            });
            var fooModelCount = 0,
                barModelCount = 0,
                bazModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(false, 'The url was not correctly replaced on initial transition');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(true, 'The url was replaced correctly on initial transition');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.replaceWith('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                    router.replaceWith('/baz');
                }
            });
            var bazHandler = (0, _test_helpers.createHandler)('baz', {
                model: function model() {
                    bazModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler,
                baz: bazHandler
            };
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/baz');
            assert.equal(fooModelCount, 1, 'should call foo model once');
            assert.equal(barModelCount, 1, 'should call bar model once');
            assert.equal(bazModelCount, 1, 'should call baz model once');
        });
        (0, _test_helpers.test)('Calling replaceWith after initial transition in validation hook should use updateUrl', function (assert) {
            assert.expect(8);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
            });
            var fooModelCount = 0,
                barModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(true, 'updateURL should be used');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(false, 'replaceURL should not be used');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.replaceWith('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler
            };
            (0, _test_helpers.transitionTo)(router, '/bar');
            assert.equal(url, '/bar');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
            assert.equal(fooModelCount, 0, 'Foo model should not be called');
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/bar');
            assert.equal(barModelCount, 2, 'Bar model should be called twice');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
        });
        (0, _test_helpers.test)('Calling replaceWith after initial transition in validation hook with multiple redirects should use updateUrl', function (assert) {
            assert.expect(10);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
                match('/baz').to('baz');
            });
            var fooModelCount = 0,
                barModelCount = 0,
                bazModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(true, 'updateURL should be used');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(false, 'replaceURL should not be used');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.replaceWith('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                    router.replaceWith('/baz');
                }
            });
            var bazHandler = (0, _test_helpers.createHandler)('baz', {
                model: function model() {
                    bazModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler,
                baz: bazHandler
            };
            (0, _test_helpers.transitionTo)(router, '/baz');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 1, 'Bar model should be called once');
            assert.equal(fooModelCount, 0, 'Foo model should not be called');
            assert.equal(barModelCount, 0, 'Baz model should not be called');
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 2, 'Baz model should be called twice');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
        });
        (0, _test_helpers.test)('Calling replaceWith after initial replace in validation hook with multiple redirects should use replaceUrl', function (assert) {
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
                match('/baz').to('baz');
                match('/qux').to('qux');
            });
            var fooModelCount = 0,
                barModelCount = 0,
                bazModelCount = 0,
                history = [];
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                history.push(url);
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                if (history.length === 0) {
                    assert.ok(false, 'should not replace on initial');
                }
                history[history.length - 1] = url;
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.replaceWith('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                    router.replaceWith('/baz');
                }
            });
            var bazHandler = (0, _test_helpers.createHandler)('baz', {
                model: function model() {
                    bazModelCount++;
                }
            });
            var quxHandler = (0, _test_helpers.createHandler)('qux', {
                model: function model() {}
            });
            routes = {
                foo: fooHandler,
                bar: barHandler,
                baz: bazHandler,
                qux: quxHandler
            };
            (0, _test_helpers.transitionTo)(router, '/qux');
            assert.equal(history.length, 1, 'only one history item');
            assert.equal(history[0], '/qux', 'history item is /qux');
            (0, _test_helpers.replaceWith)(router, '/foo');
            assert.equal(history.length, 1, 'still only one history item, replaced the previous');
            assert.equal(history[0], '/baz', 'history item is /foo');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
            assert.equal(bazModelCount, 1, 'Baz model should be called once');
        });
        (0, _test_helpers.test)('Mixing multiple types of redirect during initial transition should work', function (assert) {
            assert.expect(10);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
                match('/baz').to('baz');
            });
            var fooModelCount = 0,
                barModelCount = 0,
                bazModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(true, 'updateURL should be used');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(false, 'replaceURL should not be used');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.replaceWith('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                    router.transitionTo('/baz');
                }
            });
            var bazHandler = (0, _test_helpers.createHandler)('baz', {
                model: function model() {
                    bazModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler,
                baz: bazHandler
            };
            (0, _test_helpers.transitionTo)(router, '/baz');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 1, 'Bar model should be called once');
            assert.equal(fooModelCount, 0, 'Foo model should not be called');
            assert.equal(barModelCount, 0, 'Baz model should not be called');
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 2, 'Baz model should be called twice');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
        });
        (0, _test_helpers.test)('Mixing multiple types of redirects after initial transition should work', function (assert) {
            assert.expect(12);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
                match('/baz').to('baz');
            });
            var fooModelCount = 0,
                barModelCount = 0,
                bazModelCount = 0,
                updateUrlCount = 0,
                replaceUrlCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                updateUrlCount++;
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                replaceUrlCount++;
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                    router.replaceWith('/bar');
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                    router.transitionTo('/baz');
                }
            });
            var bazHandler = (0, _test_helpers.createHandler)('baz', {
                model: function model() {
                    bazModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler,
                baz: bazHandler
            };
            (0, _test_helpers.transitionTo)(router, '/baz');
            // actually replaceURL probably makes more sense here, but it's an initial
            // transition to a route that the page loaded on, so it's a no-op and doesn't
            // cause a problem
            assert.equal(replaceUrlCount, 0, 'replaceURL should not be used');
            assert.equal(updateUrlCount, 1, 'updateURL should be used for initial transition');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 1, 'Baz model should be called once');
            assert.equal(fooModelCount, 0, 'Foo model should not be called');
            assert.equal(barModelCount, 0, 'Bar model should not be called');
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(replaceUrlCount, 0, 'replaceURL should not be used');
            assert.equal(updateUrlCount, 2, 'updateURL should be used for subsequent transition');
            assert.equal(url, '/baz');
            assert.equal(bazModelCount, 2, 'Baz model should be called twice');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
        });
        (0, _test_helpers.test)('Calling replaceWith after initial transition outside validation hook should use replaceURL', function (assert) {
            assert.expect(7);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
            });
            var fooModelCount = 0,
                barModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.equal(updateUrl, '/foo', 'incorrect url for updateURL');
            };
            router.replaceURL = function (replaceUrl) {
                url = replaceUrl;
                assert.equal(replaceUrl, '/bar', 'incorrect url for replaceURL');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler
            };
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/foo', 'failed initial transition');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 0, 'Bar model should not be called');
            router.replaceWith('/bar');
            (0, _test_helpers.flushBackburner)();
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
        });
        (0, _test_helpers.test)('Calling transitionTo after initial transition outside validation hook should use updateUrl', function (assert) {
            assert.expect(7);
            map(assert, function (match) {
                match('/foo').to('foo');
                match('/bar').to('bar');
            });
            var fooModelCount = 0,
                barModelCount = 0;
            router.updateURL = function (updateUrl) {
                url = updateUrl;
                assert.ok(true, 'updateURL is used');
            };
            router.replaceURL = function (replaceURL) {
                url = replaceURL;
                assert.ok(false, 'replaceURL should not be used');
            };
            var fooHandler = (0, _test_helpers.createHandler)('foo', {
                model: function model() {
                    fooModelCount++;
                }
            });
            var barHandler = (0, _test_helpers.createHandler)('bar', {
                model: function model() {
                    barModelCount++;
                }
            });
            routes = {
                foo: fooHandler,
                bar: barHandler
            };
            (0, _test_helpers.transitionTo)(router, '/foo');
            assert.equal(url, '/foo', 'failed initial transition');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 0, 'Bar model should not be called');
            (0, _test_helpers.transitionTo)(router, '/bar');
            assert.equal(fooModelCount, 1, 'Foo model should be called once');
            assert.equal(barModelCount, 1, 'Bar model should be called once');
        });
        (0, _test_helpers.test)('transitioning to the same route with different context should not reenter the route', function (assert) {
            map(assert, function (match) {
                match('/project/:project_id').to('project');
            });
            var projectEnterCount = 0;
            var projectSetupCount = 0;
            var projectHandler = (0, _test_helpers.createHandler)('project', {
                model: function model(params) {
                    delete params.queryParams;
                    return params;
                },
                enter: function enter() {
                    projectEnterCount++;
                },
                setup: function setup() {
                    projectSetupCount++;
                }
            });
            routes = {
                project: projectHandler
            };
            (0, _test_helpers.transitionTo)(router, '/project/1');
            assert.equal(projectEnterCount, 1, 'project handler should have been entered once');
            assert.equal(projectSetupCount, 1, 'project handler should have been setup once');
            (0, _test_helpers.transitionTo)(router, '/project/2');
            assert.equal(projectEnterCount, 1, 'project handler should still have been entered only once');
            assert.equal(projectSetupCount, 2, 'project handler should have been setup twice');
        });
        (0, _test_helpers.test)('synchronous transition errors can be detected synchronously', function (assert) {
            map(assert, function (match) {
                match('/').to('root');
            });
            router.getRoute = function () {
                throw new Error('boom!');
            };
            assert.equal((0, _test_helpers.transitionTo)(router, '/').error.message, 'boom!');
        });
    });
    //# sourceMappingURL=router_test.js.map
});
define('tests/test_helpers', ['exports', 'backburner', 'router', 'router/route-info', 'router/transition', 'router/transition-aborted-error', 'rsvp'], function (exports, _backburner, _router, _routeInfo, _transition2, _transitionAbortedError, _rsvp) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.TestRouter = exports.assertAbort = exports.stubbedHandlerInfoFactory = exports.shouldNotHappen = exports.replaceWith = exports.transitionToWithAbort = exports.transitionTo = exports.handleURL = exports.flushBackburner = exports.test = exports.module = undefined;
    exports.isExiting = isExiting;
    exports.createHandler = createHandler;
    exports.createHandlerInfo = createHandlerInfo;
    exports.trigger = trigger;

    var _backburner2 = _interopRequireDefault(_backburner);

    var _router2 = _interopRequireDefault(_router);

    var _routeInfo2 = _interopRequireDefault(_routeInfo);

    var _transitionAbortedError2 = _interopRequireDefault(_transitionAbortedError);

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

    QUnit.config.testTimeout = 1000;
    var bb = new _backburner2.default(['promises']);
    function customAsync(callback, promise) {
        bb.defer('promises', promise, callback, promise);
    }
    function flushBackburner() {
        bb.end();
        bb.begin();
    }
    var test = QUnit.test;
    function _module(name, options) {
        options = options || {};
        QUnit.module(name, {
            beforeEach: function beforeEach() {
                (0, _rsvp.configure)('async', customAsync);
                bb.begin();
                if (options.setup) {
                    options.setup.apply(this, arguments);
                }
            },
            afterEach: function afterEach() {
                bb.end();
                if (options.teardown) {
                    options.teardown.apply(this, arguments);
                }
            }
        });
    }
    function assertAbort(assert) {
        return function _assertAbort(e) {
            assert.ok(e instanceof _transitionAbortedError2.default, 'transition was redirected/aborted');
        };
    }
    // Helper method that performs a transition and flushes
    // the backburner queue. Helpful for when you want to write
    // tests that avoid .then callbacks.
    function transitionTo(router, path) {
        for (var _len = arguments.length, context = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            context[_key - 2] = arguments[_key];
        }

        var result = router.transitionTo.apply(router, [path].concat(context));
        flushBackburner();
        return result;
    }
    function transitionToWithAbort(assert, router, path) {
        var args = [path];
        router.transitionTo.apply(router, args).then(shouldNotHappen, assertAbort(assert));
        flushBackburner();
    }
    function replaceWith(router, path) {
        var result = router.transitionTo.apply(router, [path]).method('replace');
        flushBackburner();
        return result;
    }
    function handleURL(router, url) {
        var result = router.handleURL.apply(router, [url]);
        flushBackburner();
        return result;
    }
    function shouldNotHappen(assert, _message) {
        var message = _message || 'this .then handler should not be called';
        return function _shouldNotHappen(error) {
            console.error(error.stack); // eslint-disable-line
            assert.ok(false, message);
            return error;
        };
    }
    function isExiting(route, routeInfos) {
        for (var i = 0, len = routeInfos.length; i < len; ++i) {
            var routeInfo = routeInfos[i];
            if (routeInfo.name === route || routeInfo.route === route) {
                return false;
            }
        }
        return true;
    }
    function stubbedHandlerInfoFactory(name, props) {
        var obj = Object.create(props);
        obj._handlerInfoType = name;
        return obj;
    }
    _module('backburner sanity test');
    test('backburnerized testing works as expected', function (assert) {
        assert.expect(1);
        (0, _rsvp.resolve)('hello').then(function (word) {
            assert.equal(word, 'hello', 'backburner flush in teardown resolved this promise');
        });
    });
    exports.module = _module;
    exports.test = test;
    exports.flushBackburner = flushBackburner;
    exports.handleURL = handleURL;
    exports.transitionTo = transitionTo;
    exports.transitionToWithAbort = transitionToWithAbort;
    exports.replaceWith = replaceWith;
    exports.shouldNotHappen = shouldNotHappen;
    exports.stubbedHandlerInfoFactory = stubbedHandlerInfoFactory;
    exports.assertAbort = assertAbort;
    function createHandler(name, options) {
        return Object.assign({ name: name, routeName: name, context: undefined, names: [], handler: name, _internalName: name }, options);
    }

    var TestRouter = exports.TestRouter = function (_Router) {
        _inherits(TestRouter, _Router);

        function TestRouter() {
            _classCallCheck(this, TestRouter);

            return _possibleConstructorReturn(this, (TestRouter.__proto__ || Object.getPrototypeOf(TestRouter)).apply(this, arguments));
        }

        _createClass(TestRouter, [{
            key: 'didTransition',
            value: function didTransition() {}
        }, {
            key: 'willTransition',
            value: function willTransition() {}
        }, {
            key: 'updateURL',
            value: function updateURL(_url) {}
        }, {
            key: 'replaceURL',
            value: function replaceURL(_url) {}
        }, {
            key: 'triggerEvent',
            value: function triggerEvent(_handlerInfos, _ignoreFailure, _name, _args) {}
        }, {
            key: 'routeDidChange',
            value: function routeDidChange() {}
        }, {
            key: 'routeWillChange',
            value: function routeWillChange() {}
        }, {
            key: 'transitionDidError',
            value: function transitionDidError(error, transition) {
                if (error.wasAborted || transition.isAborted) {
                    return (0, _transition2.logAbort)(transition);
                } else {
                    transition.trigger(false, 'error', error.error, this, error.route);
                    transition.abort();
                    return error.error;
                }
            }
        }, {
            key: 'getRoute',
            value: function getRoute(_name) {
                return {};
            }
        }, {
            key: 'getSerializer',
            value: function getSerializer(_name) {
                return function () {};
            }
        }]);

        return TestRouter;
    }(_router2.default);

    function createHandlerInfo(name) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var Stub = function (_RouteInfo) {
            _inherits(Stub, _RouteInfo);

            function Stub(name, router, handler) {
                _classCallCheck(this, Stub);

                return _possibleConstructorReturn(this, (Stub.__proto__ || Object.getPrototypeOf(Stub)).call(this, router, name, [], handler));
            }

            _createClass(Stub, [{
                key: 'getModel',
                value: function getModel(_transition) {
                    return {};
                }
            }, {
                key: 'getUnresolved',
                value: function getUnresolved() {
                    return new _routeInfo.UnresolvedRouteInfoByParam(this.router, 'empty', [], {});
                }
            }]);

            return Stub;
        }(_routeInfo2.default);

        var handler = options.handler || createHandler('foo');
        delete options.handler;
        Object.assign(Stub.prototype, options);
        var stub = new Stub(name, new TestRouter(), handler);
        return stub;
    }
    function trigger(handlerInfos, ignoreFailure, name) {
        for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
            args[_key2 - 3] = arguments[_key2];
        }

        if (!handlerInfos) {
            if (ignoreFailure) {
                return;
            }
            throw new Error("Could not trigger event '" + name + "'. There are no active handlers");
        }
        var eventWasHandled = false;
        for (var i = handlerInfos.length - 1; i >= 0; i--) {
            var currentHandlerInfo = handlerInfos[i],
                currentHandler = currentHandlerInfo.route;
            // If there is no handler, it means the handler hasn't resolved yet which
            // means that we should trigger the event later when the handler is available
            if (!currentHandler) {
                currentHandlerInfo.routePromise.then(function (resolvedHandler) {
                    resolvedHandler.events[name].apply(resolvedHandler, args);
                });
                continue;
            }
            if (currentHandler.events && currentHandler.events[name]) {
                if (currentHandler.events[name].apply(currentHandler, args) === true) {
                    eventWasHandled = true;
                } else {
                    return;
                }
            }
        }
        // In the case that we got an UnrecognizedURLError as an event with no handler,
        // let it bubble up
        if (name === 'error' && args[0].name === 'UnrecognizedURLError') {
            throw args[0];
        } else if (!eventWasHandled && !ignoreFailure) {
            throw new Error("Nothing handled the event '" + name + "'.");
        }
    }
    //# sourceMappingURL=test_helpers.js.map
});
define('tests/transition-aborted-error_test', ['router/transition-aborted-error', 'tests/test_helpers'], function (_transitionAbortedError, _test_helpers) {
    'use strict';

    var _transitionAbortedError2 = _interopRequireDefault(_transitionAbortedError);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (0, _test_helpers.module)('transition-aborted-error');
    (0, _test_helpers.test)('correct inheritance and name', function (assert) {
        var error = void 0;
        try {
            throw new _transitionAbortedError2.default('Message');
        } catch (e) {
            error = e;
        }
        // it would be more correct with TransitionAbortedError, but other libraries may rely on this name
        assert.equal(error.name, 'TransitionAborted', "TransitionAbortedError has the name 'TransitionAborted'");
        assert.ok(error instanceof _transitionAbortedError2.default);
        assert.ok(error instanceof Error);
    });
    //# sourceMappingURL=transition-aborted-error_test.js.map
});
define('tests/transition_intent_test', ['router/transition-intent/named-transition-intent', 'router/transition-intent/url-transition-intent', 'router/transition-state', 'tests/test_helpers', 'router/route-info', 'rsvp'], function (_namedTransitionIntent, _urlTransitionIntent, _transitionState, _test_helpers, _routeInfo, _rsvp) {
    'use strict';

    var _namedTransitionIntent2 = _interopRequireDefault(_namedTransitionIntent);

    var _urlTransitionIntent2 = _interopRequireDefault(_urlTransitionIntent);

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

    var handlers = void 0,
        recognizer = void 0;
    var scenarios = [{
        name: 'Sync Get Handler',
        async: false,
        getHandler: function getHandler(name) {
            return handlers[name] || (handlers[name] = (0, _test_helpers.createHandler)(name));
        }
    }, {
        name: 'Async Get Handler',
        async: true,
        getHandler: function getHandler(name) {
            return _rsvp.Promise.resolve(handlers[name] || (handlers[name] = (0, _test_helpers.createHandler)(name)));
        }
    }];
    scenarios.forEach(function (scenario) {
        var TransitionRouter = function (_TestRouter) {
            _inherits(TransitionRouter, _TestRouter);

            function TransitionRouter() {
                _classCallCheck(this, TransitionRouter);

                return _possibleConstructorReturn(this, (TransitionRouter.__proto__ || Object.getPrototypeOf(TransitionRouter)).apply(this, arguments));
            }

            _createClass(TransitionRouter, [{
                key: 'getRoute',
                value: function getRoute(name) {
                    return scenario.getHandler(name);
                }
            }]);

            return TransitionRouter;
        }(_test_helpers.TestRouter);

        var router = void 0;
        // Asserts that a handler from a handlerInfo equals an expected valued.
        // Returns a promise during async scenarios to wait until the handler is ready.
        function assertHandlerEquals(assert, handlerInfo, expected) {
            if (!scenario.async) {
                return assert.equal(handlerInfo.route, expected);
            } else {
                assert.equal(handlerInfo.route, undefined);
                return handlerInfo.routePromise.then(function (handler) {
                    assert.equal(handler, expected);
                });
            }
        }
        // TODO: remove repetition, DRY in to test_helpers.
        (0, _test_helpers.module)('TransitionIntent (' + scenario.name + ')', {
            setup: function setup() {
                handlers = {};
                handlers.foo = (0, _test_helpers.createHandler)('foo');
                handlers.bar = (0, _test_helpers.createHandler)('bar');
                handlers.articles = (0, _test_helpers.createHandler)('articles');
                handlers.comments = (0, _test_helpers.createHandler)('comments');
                recognizer = {
                    handlersFor: function handlersFor(name) {
                        if (name === 'comments') {
                            return [{
                                handler: 'articles',
                                names: ['article_id']
                            }, {
                                handler: 'comments',
                                names: ['comment_id']
                            }];
                        }
                        return;
                    },
                    hasRoute: function hasRoute(name) {
                        return name === 'comments';
                    },
                    recognize: function recognize(url) {
                        if (url === '/foo/bar') {
                            return [{
                                handler: 'foo',
                                isDynamic: false,
                                params: {}
                            }, {
                                handler: 'bar',
                                isDynamic: false,
                                params: {}
                            }];
                        } else if (url === '/articles/123/comments/456') {
                            return [{
                                handler: 'articles',
                                isDynamic: true,
                                params: { article_id: '123' }
                            }, {
                                handler: 'comments',
                                isDynamic: true,
                                params: { comment_id: '456' }
                            }];
                        }
                        return;
                    }
                };
                router = new TransitionRouter();
                router.recognizer = recognizer;
            }
        });
        (0, _test_helpers.test)('URLTransitionIntent can be applied to an empty state', function (assert) {
            var state = new _transitionState2.default();
            var intent = new _urlTransitionIntent2.default(router, '/foo/bar');
            var newState = intent.applyToState(state);
            var handlerInfos = newState.routeInfos;
            assert.equal(handlerInfos.length, 2);
            assert.notOk(handlerInfos[0].isResolved, 'generated state consists of unresolved handler info, 1');
            assert.notOk(handlerInfos[1].isResolved, 'generated state consists of unresolved handler info, 2');
            _rsvp.Promise.all([assertHandlerEquals(assert, handlerInfos[0], handlers.foo), assertHandlerEquals(assert, handlerInfos[1], handlers.bar)]);
        });
        (0, _test_helpers.test)('URLTransitionIntent applied to single unresolved URL handlerInfo', function (assert) {
            var state = new _transitionState2.default();
            var startingHandlerInfo = new _routeInfo.UnresolvedRouteInfoByParam(router, 'foo', [], {}, handlers.foo);
            // This single unresolved handler info will be preserved
            // in the new array of handlerInfos.
            // Reason: if it were resolved, we wouldn't want to replace it.
            // So we only want to replace if it's actually known to be
            // different.
            state.routeInfos = [startingHandlerInfo];
            var intent = new _urlTransitionIntent2.default(router, '/foo/bar');
            var newState = intent.applyToState(state);
            var handlerInfos = newState.routeInfos;
            assert.equal(handlerInfos.length, 2);
            assert.equal(handlerInfos[0], startingHandlerInfo, "The starting foo handlerInfo wasn't overridden because the new one wasn't any different");
            assert.ok(handlerInfos[1] instanceof _routeInfo.UnresolvedRouteInfoByParam, 'generated state consists of UnresolvedHandlerInfoByParam, 2');
            assertHandlerEquals(assert, handlerInfos[1], handlers.bar);
        });
        (0, _test_helpers.test)('URLTransitionIntent applied to an already-resolved handlerInfo', function (assert) {
            var state = new _transitionState2.default();
            var startingHandlerInfo = new _routeInfo.ResolvedRouteInfo(router, 'foo', [], {}, handlers.foo);
            state.routeInfos = [startingHandlerInfo];
            var intent = new _urlTransitionIntent2.default(router, '/foo/bar');
            var newState = intent.applyToState(state);
            var handlerInfos = newState.routeInfos;
            assert.equal(handlerInfos.length, 2);
            assert.equal(handlerInfos[0], startingHandlerInfo, "The starting foo resolved handlerInfo wasn't overridden because the new one wasn't any different");
            assert.ok(handlerInfos[1] instanceof _routeInfo.UnresolvedRouteInfoByParam, 'generated state consists of UnresolvedHandlerInfoByParam, 2');
            assertHandlerEquals(assert, handlerInfos[1], handlers.bar);
        });
        (0, _test_helpers.test)('URLTransitionIntent applied to an already-resolved handlerInfo (non-empty params)', function (assert) {
            var state = new _transitionState2.default();
            var article = {};
            var startingHandlerInfo = new _routeInfo.ResolvedRouteInfo(router, 'articles', [], { article_id: 'some-other-id' }, (0, _test_helpers.createHandler)('articles'), article);
            state.routeInfos = [startingHandlerInfo];
            var intent = new _urlTransitionIntent2.default(router, '/articles/123/comments/456');
            var newState = intent.applyToState(state);
            var handlerInfos = newState.routeInfos;
            assert.equal(handlerInfos.length, 2);
            assert.ok(handlerInfos[0] !== startingHandlerInfo, 'The starting foo resolved handlerInfo was overridden because the new had different params');
            assert.ok(handlerInfos[1] instanceof _routeInfo.UnresolvedRouteInfoByParam, 'generated state consists of UnresolvedHandlerInfoByParam, 2');
            assertHandlerEquals(assert, handlerInfos[1], handlers.comments);
        });
        (0, _test_helpers.test)('URLTransitionIntent applied to an already-resolved handlerInfo of different route', function (assert) {
            var state = new _transitionState2.default();
            var startingHandlerInfo = new _routeInfo.ResolvedRouteInfo(router, 'alex', [], {}, handlers.foo);
            state.routeInfos = [startingHandlerInfo];
            var intent = new _urlTransitionIntent2.default(router, '/foo/bar');
            var newState = intent.applyToState(state);
            var handlerInfos = newState.routeInfos;
            assert.equal(handlerInfos.length, 2);
            assert.ok(handlerInfos[0] !== startingHandlerInfo, 'The starting foo resolved handlerInfo gets overridden because the new one has a different name');
            assert.ok(handlerInfos[1] instanceof _routeInfo.UnresolvedRouteInfoByParam, 'generated state consists of UnresolvedHandlerInfoByParam, 2');
            assertHandlerEquals(assert, handlerInfos[1], handlers.bar);
        });
        (0, _test_helpers.test)('NamedTransitionIntent applied to an already-resolved handlerInfo (non-empty params)', function (assert) {
            var state = new _transitionState2.default();
            var article = {};
            var comment = {};
            var startingHandlerInfo = new _routeInfo.ResolvedRouteInfo(router, 'articles', [], { article_id: 'some-other-id' }, (0, _test_helpers.createHandler)('articles'), article);
            state.routeInfos = [startingHandlerInfo];
            var intent = new _namedTransitionIntent2.default(router, 'comments', undefined, [article, comment]);
            var newState = intent.applyToState(state, false);
            var handlerInfos = newState.routeInfos;
            assert.equal(handlerInfos.length, 2);
            assert.equal(handlerInfos[0], startingHandlerInfo);
            assert.equal(handlerInfos[0].context, article);
            assert.ok(handlerInfos[1] instanceof _routeInfo.UnresolvedRouteInfoByObject, 'generated state consists of UnresolvedHandlerInfoByObject, 2');
            assert.equal(handlerInfos[1].context, comment);
            assertHandlerEquals(assert, handlerInfos[1], handlers.comments);
        });
    });
    //# sourceMappingURL=transition_intent_test.js.map
});
define('tests/transition_state_test', ['router/route-info', 'router/transition-state', 'rsvp', 'tests/test_helpers'], function (_routeInfo, _transitionState, _rsvp, _test_helpers) {
    'use strict';

    var _transitionState2 = _interopRequireDefault(_transitionState);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (0, _test_helpers.module)('TransitionState');
    (0, _test_helpers.test)('it starts off with default state', function (assert) {
        var state = new _transitionState2.default();
        assert.deepEqual(state.routeInfos, [], 'it has an array of handlerInfos');
    });
    (0, _test_helpers.test)("#resolve delegates to handleInfo objects' resolve()", function (assert) {
        assert.expect(7);
        var state = new _transitionState2.default();
        var counter = 0;
        var resolvedHandlerInfos = [{}, {}];
        state.routeInfos = [(0, _test_helpers.createHandlerInfo)('one', {
            resolve: function resolve(shouldContinue) {
                ++counter;
                assert.equal(counter, 1);
                shouldContinue();
                return (0, _rsvp.resolve)(resolvedHandlerInfos[0]);
            }
        }), (0, _test_helpers.createHandlerInfo)('two', {
            resolve: function resolve(shouldContinue) {
                ++counter;
                assert.equal(counter, 2);
                shouldContinue();
                return (0, _rsvp.resolve)(resolvedHandlerInfos[1]);
            }
        })];
        function keepGoing() {
            assert.ok(true, 'continuation function was called');
            return _rsvp.Promise.resolve(false);
        }
        state.resolve(keepGoing, {}).then(function (result) {
            assert.deepEqual(result.routeInfos, resolvedHandlerInfos);
        });
    });
    (0, _test_helpers.test)('State resolution can be halted', function (assert) {
        assert.expect(2);
        var state = new _transitionState2.default();
        state.routeInfos = [(0, _test_helpers.createHandlerInfo)('one', {
            resolve: function resolve(shouldContinue) {
                return shouldContinue();
            }
        }), (0, _test_helpers.createHandlerInfo)('two', {
            resolve: function resolve() {
                assert.ok(false, 'I should not be entered because we threw an error in shouldContinue');
            }
        })];
        function keepGoing() {
            return (0, _rsvp.reject)('NOPE');
        }
        state.resolve(keepGoing, {}).catch(function (reason) {
            assert.equal(reason.error, 'NOPE');
            assert.ok(reason.wasAborted, 'state resolution was correctly marked as aborted');
        });
        (0, _test_helpers.flushBackburner)();
    });
    (0, _test_helpers.test)('Integration w/ HandlerInfos', function (assert) {
        assert.expect(4);
        var state = new _transitionState2.default();
        var router = new _test_helpers.TestRouter();
        var fooModel = {};
        var barModel = {};
        var transition = {};
        state.routeInfos = [new _routeInfo.UnresolvedRouteInfoByParam(router, 'foo', ['foo_id'], { foo_id: '123' }, (0, _test_helpers.createHandler)('foo', {
            model: function model(params, payload) {
                assert.equal(payload, transition);
                assert.equal(params.foo_id, '123', 'foo#model received expected params');
                return (0, _rsvp.resolve)(fooModel);
            }
        })), new _routeInfo.UnresolvedRouteInfoByObject(router, 'bar', ['bar_id'], (0, _rsvp.resolve)(barModel))];
        function noop() {
            return _rsvp.Promise.resolve(false);
        }
        state.resolve(noop, transition).then(function (result) {
            var models = [];
            for (var i = 0; i < result.routeInfos.length; i++) {
                models.push(result.routeInfos[i].context);
            }
            assert.equal(models[0], fooModel);
            assert.equal(models[1], barModel);
            return _rsvp.Promise.resolve(new _transitionState2.default());
        }).catch(function (error) {
            assert.ok(false, 'Caught error: ' + error);
        });
    });
    //# sourceMappingURL=transition_state_test.js.map
});
define('tests/unrecognized-url-error_test', ['router/unrecognized-url-error', 'tests/test_helpers'], function (_unrecognizedUrlError, _test_helpers) {
    'use strict';

    var _unrecognizedUrlError2 = _interopRequireDefault(_unrecognizedUrlError);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (0, _test_helpers.module)('unrecognized-url-error');
    (0, _test_helpers.test)('correct inheritance', function (assert) {
        var error = void 0;
        try {
            throw new _unrecognizedUrlError2.default('Message');
        } catch (e) {
            error = e;
        }
        assert.ok(error instanceof _unrecognizedUrlError2.default);
        assert.ok(error instanceof Error);
    });
    //# sourceMappingURL=unrecognized-url-error_test.js.map
});
define('tests/utils_test', ['router/utils', 'tests/test_helpers'], function (_utils, _test_helpers) {
    'use strict';

    (0, _test_helpers.module)('utils');
    (0, _test_helpers.test)('getChangelist', function (assert) {
        var result = (0, _utils.getChangelist)({}, { foo: '123' });
        assert.deepEqual(result, {
            all: { foo: '123' },
            changed: { foo: '123' },
            removed: {}
        });
        result = (0, _utils.getChangelist)({ foo: '123' }, { foo: '123' });
        assert.notOk(result);
        result = (0, _utils.getChangelist)({ foo: '123' }, {});
        assert.deepEqual(result, { all: {}, changed: {}, removed: { foo: '123' } });
        result = (0, _utils.getChangelist)({ foo: '123', bar: '456' }, { foo: '123' });
        assert.deepEqual(result, {
            all: { foo: '123' },
            changed: {},
            removed: { bar: '456' }
        });
        result = (0, _utils.getChangelist)({ foo: '123', bar: '456' }, { foo: '456' });
        assert.deepEqual(result, {
            all: { foo: '456' },
            changed: { foo: '456' },
            removed: { bar: '456' }
        });
    });
    //# sourceMappingURL=utils_test.js.map
});//# sourceMappingURL=tests.map
