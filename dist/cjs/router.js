'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _routeRecognizer = require('route-recognizer');

var _routeRecognizer2 = _interopRequireDefault(_routeRecognizer);

var _rsvp = require('rsvp');

var _routeInfo = require('./route-info');

var _transition = require('./transition');

var _transition2 = _interopRequireDefault(_transition);

var _transitionAbortedError = require('./transition-aborted-error');

var _transitionAbortedError2 = _interopRequireDefault(_transitionAbortedError);

var _namedTransitionIntent = require('./transition-intent/named-transition-intent');

var _namedTransitionIntent2 = _interopRequireDefault(_namedTransitionIntent);

var _urlTransitionIntent = require('./transition-intent/url-transition-intent');

var _urlTransitionIntent2 = _interopRequireDefault(_urlTransitionIntent);

var _transitionState = require('./transition-state');

var _transitionState2 = _interopRequireDefault(_transitionState);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
                return _rsvp.Promise.reject(`URL ${url} was not recognized`);
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
        /**
        @private
           Begins and returns a Transition based on the provided
        arguments. Accepts arguments in the form of both URL
        transitions and named transitions.
           @param {Router} router
        @param {Array[Object]} args arguments passed to transitionTo,
          replaceWith, or handleURL
        */

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
        /**
        @private
           Updates the URL (if necessary) and calls `setupContexts`
        to update the router's array of `currentRouteInfos`.
        */

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
        /**
        @private
           Takes an Array of `RouteInfo`s, figures out which ones are
        exiting, entering, or changing contexts, and calls the
        proper route hooks.
           For example, consider the following tree of routes. Each route is
        followed by the URL segment it handles.
           ```
        |~index ("/")
        | |~posts ("/posts")
        | | |-showPost ("/:id")
        | | |-newPost ("/new")
        | | |-editPost ("/edit")
        | |~about ("/about/:id")
        ```
           Consider the following transitions:
           1. A URL transition to `/posts/1`.
           1. Triggers the `*model` callbacks on the
              `index`, `posts`, and `showPost` routes
           2. Triggers the `enter` callback on the same
           3. Triggers the `setup` callback on the same
        2. A direct transition to `newPost`
           1. Triggers the `exit` callback on `showPost`
           2. Triggers the `enter` callback on `newPost`
           3. Triggers the `setup` callback on `newPost`
        3. A direct transition to `about` with a specified
           context object
           1. Triggers the `exit` callback on `newPost`
              and `posts`
           2. Triggers the `serialize` callback on `about`
           3. Triggers the `enter` callback on `about`
           4. Triggers the `setup` callback on `about`
           @param {Router} transition
        @param {TransitionState} newState
        */

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
        /**
        @private
           Fires queryParamsDidChange event
        */

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
        /**
        @private
           Helper method used by setupContexts. Handles errors or redirects
        that may happen in enter/setup.
        */

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
        /**
        @private
           This function is called when transitioning from one URL to
        another to determine which routes are no longer active,
        which routes are newly active, and which routes remain
        active but have their context changed.
           Take a list of old routes and new routes and partition
        them into four buckets:
           * unchanged: the route was active in both the old and
          new URL, and its context remains the same
        * updated context: the route was active in both the
          old and new URL, but its context changed. The route's
          `setup` method, if any, will be called with the new
          context.
        * exited: the route was active in the old URL, but is
          no longer active.
        * entered: the route was not active in the old URL, but
          is now active.
           The PartitionedRoutes structure has four fields:
           * `updatedContext`: a list of `RouteInfo` objects that
          represent routes that remain active but have a changed
          context
        * `entered`: a list of `RouteInfo` objects that represent
          routes that are newly active
        * `exited`: a list of `RouteInfo` objects that are no
          longer active.
        * `unchanged`: a list of `RouteInfo` objects that remain active.
           @param {Array[InternalRouteInfo]} oldRoutes a list of the route
          information for the previous URL (or `[]` if this is the
          first handled transition)
        @param {Array[InternalRouteInfo]} newRoutes a list of the route
          information for the new URL
           @return {Partition}
        */

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
        /**
          Clears the current and target route routes and triggers exit
          on each of them starting at the leaf and traversing up through
          its ancestors.
        */

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
        /**
          let handler = routeInfo.handler;
          The entry point for handling a change to the URL (usually
          via the back and forward button).
             Returns an Array of handlers and the parameters associated
          with those parameters.
             @param {String} url a URL to process
             @return {Array} an Array of `[handler, parameter]` tuples
        */

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
        /**
          Transition into the specified named route.
             If necessary, trigger the exit callback on any routes
          that are no longer represented by the target route.
             @param {String} name the name of the route
        */

    }, {
        key: 'transitionTo',
        value: function transitionTo(name) {
            for (var _len = arguments.length, contexts = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                contexts[_key - 1] = arguments[_key];
            }

            if (typeof name === 'object') {
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
        /**
          Identical to `transitionTo` except that the current URL will be replaced
          if possible.
             This method is intended primarily for use with `replaceState`.
             @param {String} name the name of the route
        */

    }, {
        key: 'replaceWith',
        value: function replaceWith(name) {
            return this.doTransition(name).method('replace');
        }
        /**
          Take a named route and context objects and generate a
          URL.
             @param {String} name the name of the route to generate
            a URL for
          @param {...Object} objects a list of objects to serialize
             @return {String} a URL
        */

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