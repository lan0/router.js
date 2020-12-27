import { Route } from './route-info';
import Router from './router';
import TransitionState from './transition-state';
export declare type OpaqueIntent = TransitionIntent<any>;
export declare abstract class TransitionIntent<T extends Route> {
    data: {};
    router: Router<T>;
    constructor(router: Router<T>, data?: {});
    preTransitionState?: TransitionState<T>;
    abstract applyToState(oldState: TransitionState<T>, isIntermidate: boolean): TransitionState<T>;
}