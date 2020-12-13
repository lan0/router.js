'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UnresolvedRouteInfoByObject = exports.UnresolvedRouteInfoByParam = exports.ResolvedRouteInfo = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.toReadOnlyRouteInfo = toReadOnlyRouteInfo;

var _rsvp = require('rsvp');

var _transition2 = require('./transition');

var _utils = require('./utils');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
            find(predicate, thisArg) {
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