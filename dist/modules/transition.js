import { Promise } from 'rsvp';
import TransitionAborted from './transition-aborted-error';
import { log, promiseLabel } from './utils';
import { DEBUG } from '@glimmer/env';
export const STATE_SYMBOL = `__STATE__-2619860001345920-3322w3`;
export const PARAMS_SYMBOL = `__PARAMS__-261986232992830203-23323`;
export const QUERY_PARAMS_SYMBOL = `__QPS__-2619863929824844-32323`;
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
export default class Transition {
    constructor(router, intent, state, error = undefined, previousTransition = undefined) {
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
        this.data = (intent && intent.data) || {};
        this.resolvedModels = {};
        this[QUERY_PARAMS_SYMBOL] = {};
        this.promise = undefined;
        this.error = undefined;
        this[PARAMS_SYMBOL] = {};
        this.routeInfos = [];
        this.targetName = undefined;
        this.pivotHandler = undefined;
        this.sequence = -1;
        if (DEBUG) {
            let error = new Error(`Transition creation stack`);
            this.debugCreationStack = () => error.stack;
            // not aborted yet, will be replaced when `this.isAborted` is set
            this.debugAbortStack = () => undefined;
            this.debugPreviousTransition = previousTransition;
        }
        if (error) {
            this.promise = Promise.reject(error);
            this.error = error;
            return;
        }
        // if you're doing multiple redirects, need the new transition to know if it
        // is actually part of the first transition or not. Any further redirects
        // in the initial transition also need to know if they are part of the
        // initial transition
        this.isCausedByAbortingTransition = !!previousTransition;
        this.isCausedByInitialTransition =
            !!previousTransition &&
                (previousTransition.isCausedByInitialTransition || previousTransition.sequence === 0);
        // Every transition in the chain is a replace
        this.isCausedByAbortingReplaceTransition =
            !!previousTransition &&
                previousTransition.urlMethod === 'replace' &&
                (!previousTransition.isCausedByAbortingTransition ||
                    previousTransition.isCausedByAbortingReplaceTransition);
        if (state) {
            this[PARAMS_SYMBOL] = state.params;
            this[QUERY_PARAMS_SYMBOL] = state.queryParams;
            this.routeInfos = state.routeInfos;
            let len = state.routeInfos.length;
            if (len) {
                this.targetName = state.routeInfos[len - 1].name;
            }
            for (let i = 0; i < len; ++i) {
                let handlerInfo = state.routeInfos[i];
                // TODO: this all seems hacky
                if (!handlerInfo.isResolved) {
                    break;
                }
                this.pivotHandler = handlerInfo.route;
            }
            this.sequence = router.currentSequence++;
            this.promise = state
                .resolve(() => {
                if (this.isAborted) {
                    return Promise.reject(false, promiseLabel('Transition aborted - reject'));
                }
                return Promise.resolve(true);
            }, this)
                .catch((result) => {
                return Promise.reject(this.router.transitionDidError(result, this));
            }, promiseLabel('Handle Abort'));
        }
        else {
            this.promise = Promise.resolve(this[STATE_SYMBOL]);
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
    then(onFulfilled, onRejected, label) {
        return this.promise.then(onFulfilled, onRejected, label);
    }
    /**
  
      Forwards to the internal `promise` property which you can
      use in situations where you want to pass around a thennable,
      but not the Transition itself.
  
      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
      @public
     */
    catch(onRejection, label) {
        return this.promise.catch(onRejection, label);
    }
    /**
  
      Forwards to the internal `promise` property which you can
      use in situations where you want to pass around a thennable,
      but not the Transition itself.
  
      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
      @public
     */
    finally(callback, label) {
        return this.promise.finally(callback, label);
    }
    /**
      Aborts the Transition. Note you can also implicitly abort a transition
      by initiating another transition while a previous one is underway.
  
      @method abort
      @return {Transition} this transition
      @public
     */
    abort() {
        this.rollback();
        let transition = new Transition(this.router, undefined, undefined, undefined);
        transition.to = this.from;
        transition.from = this.from;
        transition.isAborted = true;
        this.router.routeWillChange(transition);
        this.router.routeDidChange(transition);
        return this;
    }
    rollback() {
        if (!this.isAborted) {
            log(this.router, this.sequence, this.targetName + ': transition was aborted');
            if (DEBUG) {
                let error = new Error(`Transition aborted stack`);
                this.debugAbortStack = () => error.stack;
            }
            if (this.intent !== undefined && this.intent !== null) {
                this.intent.preTransitionState = this.router.state;
            }
            this.isAborted = true;
            this.isActive = false;
            this.router.activeTransition = undefined;
        }
    }
    redirect(newTransition) {
        this.rollback();
        this.router.routeWillChange(newTransition);
    }
    /**
  
      Retries a previously-aborted transition (making sure to abort the
      transition if it's still active). Returns a new transition that
      represents the new attempt to transition.
  
      @method retry
      @return {Transition} new transition
      @public
     */
    retry() {
        // TODO: add tests for merged state retry()s
        this.abort();
        let newTransition = this.router.transitionByIntent(this.intent, false);
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
    /**
  
      Sets the URL-changing method to be employed at the end of a
      successful transition. By default, a new Transition will just
      use `updateURL`, but passing 'replace' to this method will
      cause the URL to update using 'replaceWith' instead. Omitting
      a parameter will disable the URL change, allowing for transitions
      that don't update the URL at completion (this is also used for
      handleURL, since the URL has already changed before the
      transition took place).
  
      @method method
      @param {String} method the type of URL-changing method to use
        at the end of a transition. Accepted values are 'replace',
        falsy values, or any other non-falsy value (which is
        interpreted as an updateURL transition).
  
      @return {Transition} this transition
      @public
     */
    method(method) {
        this.urlMethod = method;
        return this;
    }
    // Alias 'trigger' as 'send'
    send(ignoreFailure = false, _name, err, transition, handler) {
        this.trigger(ignoreFailure, _name, err, transition, handler);
    }
    /**
  
      Fires an event on the current list of resolved/resolving
      handlers within this transition. Useful for firing events
      on route hierarchies that haven't fully been entered yet.
  
      Note: This method is also aliased as `send`
  
      @method trigger
      @param {Boolean} [ignoreFailure=false] a boolean specifying whether unhandled events throw an error
      @param {String} name the name of the event to fire
      @public
     */
    trigger(ignoreFailure = false, name, ...args) {
        // TODO: Deprecate the current signature
        if (typeof ignoreFailure === 'string') {
            name = ignoreFailure;
            ignoreFailure = false;
        }
        this.router.triggerEvent(this[STATE_SYMBOL].routeInfos.slice(0, this.resolveIndex + 1), ignoreFailure, name, args);
    }
    /**
      Transitions are aborted and their promises rejected
      when redirects occur; this method returns a promise
      that will follow any redirects that occur and fulfill
      with the value fulfilled by any redirecting transitions
      that occur.
  
      @method followRedirects
      @return {Promise} a promise that fulfills with the same
        value that the final redirecting transition fulfills with
      @public
     */
    followRedirects() {
        let router = this.router;
        return this.promise.catch(function (reason) {
            if (router.activeTransition) {
                return router.activeTransition.followRedirects();
            }
            return Promise.reject(reason);
        });
    }
    toString() {
        return 'Transition (sequence ' + this.sequence + ')';
    }
    /**
      @private
     */
    log(message) {
        log(this.router, this.sequence, message);
    }
}
/**
  @private

  Logs and returns an instance of TransitionAborted.
 */
export function logAbort(transition) {
    log(transition.router, transition.sequence, 'detected abort.');
    return new TransitionAborted();
}
export function isTransition(obj) {
    return typeof obj === 'object' && obj instanceof Transition && obj.isTransition;
}
export function prepareResult(obj) {
    if (isTransition(obj)) {
        return null;
    }
    return obj;
}
//# sourceMappingURL=transition.js.map