import { Promise } from 'rsvp';
import { Dict } from './core';
import Router, { SerializerFunc } from './router';
import InternalTransition, { PublicTransition as Transition } from './transition';
interface IModel {
    id?: string | number;
}
export interface Route {
    inaccessibleByURL?: boolean;
    routeName: string;
    _internalName: string;
    context: unknown;
    events?: Dict<Function>;
    model?(params: Dict<unknown>, transition: Transition): Promise<Dict<unknown> | null | undefined> | undefined | Dict<unknown>;
    deserialize?(params: Dict<unknown>, transition: Transition): Dict<unknown>;
    serialize?(model: {}, params: string[]): {} | undefined;
    beforeModel?(transition: Transition): Promise<any> | any;
    afterModel?(resolvedModel: any, transition: Transition): Promise<any> | any;
    setup?(context: Dict<unknown>, transition: Transition): void;
    enter?(transition: Transition): void;
    exit?(transition?: Transition): void;
    _internalReset?(wasReset: boolean, transition?: Transition): void;
    contextDidChange?(): void;
    redirect?(context: Dict<unknown>, transition: Transition): void;
    buildRouteInfoMetadata?(): unknown;
}
export declare type Continuation = () => PromiseLike<boolean> | boolean;
export interface RouteInfo {
    readonly name: string;
    readonly parent: RouteInfo | RouteInfoWithAttributes | null;
    readonly child: RouteInfo | RouteInfoWithAttributes | null;
    readonly localName: string;
    readonly params: Dict<unknown>;
    readonly paramNames: string[];
    readonly queryParams: Dict<unknown>;
    readonly metadata: unknown;
    find(predicate: (this: any, routeInfo: RouteInfo, i: number) => boolean, thisArg?: any): RouteInfo | undefined;
}
export interface RouteInfoWithAttributes extends RouteInfo {
    attributes: any;
}
export declare function toReadOnlyRouteInfo(routeInfos: InternalRouteInfo<Route>[], queryParams?: Dict<unknown>, includeAttributes?: boolean): RouteInfoWithAttributes[] | RouteInfo[];
export default class InternalRouteInfo<T extends Route> {
    private _routePromise?;
    private _route?;
    protected router: Router<T>;
    paramNames: string[];
    name: string;
    params: Dict<unknown>;
    queryParams?: Dict<unknown>;
    context?: Dict<unknown>;
    isResolved: boolean;
    constructor(router: Router<T>, name: string, paramNames: string[], route?: T);
    getModel(_transition: InternalTransition<T>): Promise<Dict<unknown> | undefined>;
    serialize(_context?: Dict<unknown>): Dict<unknown>;
    resolve(shouldContinue: Continuation, transition: InternalTransition<T>): Promise<ResolvedRouteInfo<T>>;
    becomeResolved(transition: InternalTransition<T> | null, resolvedContext: Dict<unknown>): ResolvedRouteInfo<T>;
    shouldSupercede(routeInfo?: InternalRouteInfo<T>): boolean;
    route: T | undefined;
    routePromise: Promise<T>;
    protected log(transition: InternalTransition<T>, message: string): void;
    private updateRoute;
    private runBeforeModelHook;
    private runAfterModelHook;
    private checkForAbort;
    private stashResolvedModel;
    private fetchRoute;
    private _processRoute;
}
export declare class ResolvedRouteInfo<T extends Route> extends InternalRouteInfo<T> {
    isResolved: boolean;
    constructor(router: Router<T>, name: string, paramNames: string[], params: Dict<unknown>, route: T, context?: Dict<unknown>);
    resolve(_shouldContinue: Continuation, transition: InternalTransition<T>): Promise<InternalRouteInfo<T>>;
}
export declare class UnresolvedRouteInfoByParam<T extends Route> extends InternalRouteInfo<T> {
    params: Dict<unknown>;
    constructor(router: Router<T>, name: string, paramNames: string[], params: Dict<unknown>, route?: T);
    getModel(transition: InternalTransition<T>): Promise<Dict<unknown> | undefined>;
}
export declare class UnresolvedRouteInfoByObject<T extends Route> extends InternalRouteInfo<T> {
    serializer?: SerializerFunc;
    constructor(router: Router<T>, name: string, paramNames: string[], context: Dict<unknown>);
    getModel(transition: InternalTransition<T>): Promise<Dict<unknown> | undefined>;
    /**
      @private
  
      Serializes a route using its custom `serialize` method or
      by a default that looks up the expected property name from
      the dynamic segment.
  
      @param {Object} model the model to be serialized for this route
    */
    serialize(model?: IModel): any;
}
export {};