'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _routeInfo = require('../route-info');

var _transitionIntent = require('../transition-intent');

var _transitionState = require('../transition-state');

var _transitionState2 = _interopRequireDefault(_transitionState);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
                throw new Error(`You didn't provide enough string/numeric parameters to satisfy all of the dynamic segments for route ${name}.` + ` Missing params: ${missingParams}`);
            }
            return new _routeInfo.UnresolvedRouteInfoByParam(this.router, name, names, params);
        }
    }]);

    return NamedTransitionIntent;
}(_transitionIntent.TransitionIntent);
//# sourceMappingURL=named-transition-intent.js.map


exports.default = NamedTransitionIntent;