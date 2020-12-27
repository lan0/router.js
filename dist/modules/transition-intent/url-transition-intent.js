import { UnresolvedRouteInfoByParam } from '../route-info';
import { TransitionIntent } from '../transition-intent';
import TransitionState from '../transition-state';
import UnrecognizedURLError from '../unrecognized-url-error';
import { merge } from '../utils';
export default class URLTransitionIntent extends TransitionIntent {
    constructor(router, url, data) {
        super(router, data);
        this.url = url;
        this.preTransitionState = undefined;
    }
    applyToState(oldState) {
        let newState = new TransitionState();
        let results = this.router.recognizer.recognize(this.url), i, len;
        if (!results) {
            throw new UnrecognizedURLError(this.url);
        }
        let statesDiffer = false;
        let _url = this.url;
        // Checks if a handler is accessible by URL. If it is not, an error is thrown.
        // For the case where the handler is loaded asynchronously, the error will be
        // thrown once it is loaded.
        function checkHandlerAccessibility(handler) {
            if (handler && handler.inaccessibleByURL) {
                throw new UnrecognizedURLError(_url);
            }
            return handler;
        }
        for (i = 0, len = results.length; i < len; ++i) {
            let result = results[i];
            let name = result.handler;
            let paramNames = [];
            if (this.router.recognizer.hasRoute(name)) {
                paramNames = this.router.recognizer.handlersFor(name)[i].names;
            }
            let newRouteInfo = new UnresolvedRouteInfoByParam(this.router, name, paramNames, result.params);
            let route = newRouteInfo.route;
            if (route) {
                checkHandlerAccessibility(route);
            }
            else {
                // If the hanlder is being loaded asynchronously, check if we can
                // access it after it has resolved
                newRouteInfo.routePromise = newRouteInfo.routePromise.then(checkHandlerAccessibility);
            }
            let oldRouteInfo = oldState.routeInfos[i];
            if (statesDiffer || newRouteInfo.shouldSupercede(oldRouteInfo)) {
                statesDiffer = true;
                newState.routeInfos[i] = newRouteInfo;
            }
            else {
                newState.routeInfos[i] = oldRouteInfo;
            }
        }
        merge(newState.queryParams, results.queryParams);
        return newState;
    }
}
//# sourceMappingURL=url-transition-intent.js.map