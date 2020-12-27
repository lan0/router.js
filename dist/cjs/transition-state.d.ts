import { Promise } from 'rsvp';
import { Dict } from './core';
import InternalRouteInfo, { Continuation, Route } from './route-info';
import Transition from './transition';
interface IParams {
    [key: string]: unknown;
}
export default class TransitionState<T extends Route> {
    routeInfos: InternalRouteInfo<T>[];
    queryParams: Dict<unknown>;
    params: IParams;
    promiseLabel(label: string): string;
    resolve(shouldContinue: Continuation, transition: Transition<T>): Promise<TransitionState<T>>;
}
export declare class TransitionError {
    error: Error;
    route: Route;
    wasAborted: boolean;
    state: TransitionState<any>;
    constructor(error: Error, route: Route, wasAborted: boolean, state: TransitionState<any>);
}
export {};