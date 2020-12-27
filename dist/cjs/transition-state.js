'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TransitionError = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rsvp = require('rsvp');

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
                    // Call the redirect hook. The reason we call it here
                    // vs. afterModel is so that redirects into child
                    // routes don't re-run the model hooks for this
                    // already-resolved route.
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
//# sourceMappingURL=transition-state.js.map