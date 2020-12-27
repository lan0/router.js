export interface TransitionAbortedErrorContructor {
    new (message?: string): ITransitionAbortedError;
    readonly prototype: ITransitionAbortedError;
}
export interface ITransitionAbortedError extends Error {
    constructor: TransitionAbortedErrorContructor;
}
declare const TransitionAbortedError: TransitionAbortedErrorContructor;
export default TransitionAbortedError;
