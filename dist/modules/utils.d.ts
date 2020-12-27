import { Promise } from 'rsvp';
import { Dict } from './core';
import Router from './router';
export declare const slice: (start?: number | undefined, end?: number | undefined) => any[];
/**
  Determines if an object is Promise by checking if it is "thenable".
**/
export declare function isPromise<T>(p: any): p is Promise<T>;
export declare function merge(hash: Dict<unknown>, other?: Dict<unknown>): void;
/**
  @private

  Extracts query params from the end of an array
**/
export declare function extractQueryParams<T>(array: T[]): [T[], Dict<unknown> | null];
/**
  @private

  Coerces query param properties and array elements into strings.
**/
export declare function coerceQueryParamsToString(queryParams: Dict<unknown>): void;
/**
  @private
 */
export declare function log(router: Router<any>, ...args: (string | number)[]): void;
export declare function isParam(object: any): object is string | number;
export declare function forEach<T>(array: T[], callback: (item: T) => boolean): void;
export interface ChangeList {
    all: Dict<unknown>;
    changed: Dict<unknown>;
    removed: Dict<unknown>;
}
export declare function getChangelist(oldObject: Dict<unknown>, newObject: Dict<unknown>): ChangeList | undefined;
export declare function promiseLabel(label: string): string;
