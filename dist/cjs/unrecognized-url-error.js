'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var UnrecognizedURLError = function () {
    UnrecognizedURLError.prototype = Object.create(Error.prototype);
    UnrecognizedURLError.prototype.constructor = UnrecognizedURLError;
    function UnrecognizedURLError(message) {
        var error = Error.call(this, message);
        this.name = 'UnrecognizedURLError';
        this.message = message || 'UnrecognizedURL';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnrecognizedURLError);
        } else {
            this.stack = error.stack;
        }
    }
    return UnrecognizedURLError;
}();
exports.default = UnrecognizedURLError;
//# sourceMappingURL=unrecognized-url-error.js.map