'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _routeInfo = require('../route-info');

var _transitionIntent = require('../transition-intent');

var _transitionState = require('../transition-state');

var _transitionState2 = _interopRequireDefault(_transitionState);

var _unrecognizedUrlError = require('../unrecognized-url-error');

var _unrecognizedUrlError2 = _interopRequireDefault(_unrecognizedUrlError);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
//# sourceMappingURL=url-transition-intent.js.map


exports.default = URLTransitionIntent;