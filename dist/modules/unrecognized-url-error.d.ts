export interface UnrecognizedURLContructor {
    new (message?: string): UnrecognizedURLError;
    readonly prototype: UnrecognizedURLError;
}
export interface UnrecognizedURLError extends Error {
    constructor: UnrecognizedURLContructor;
}
declare const UnrecognizedURLError: UnrecognizedURLContructor;
export default UnrecognizedURLError;
