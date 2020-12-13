const TransitionAbortedError = (function () {
    TransitionAbortedError.prototype = Object.create(Error.prototype);
    TransitionAbortedError.prototype.constructor = TransitionAbortedError;
    function TransitionAbortedError(message) {
        let error = Error.call(this, message);
        this.name = 'TransitionAborted';
        this.message = message || 'TransitionAborted';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransitionAbortedError);
        }
        else {
            this.stack = error.stack;
        }
    }
    return TransitionAbortedError;
})();
export default TransitionAbortedError;
//# sourceMappingURL=transition-aborted-error.js.map