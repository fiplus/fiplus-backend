var GenericError = function (message) {
    this.message = 'Error: ' + message;
};
GenericError.prototype = new Error();

var NotFoundError = function(unfoundObject) {
    this.message = unfoundObject + ' not found';
};
NotFoundError.prototype = new Error();

var NotAllowedError = function(operationdesc) {
    this.message = operationdesc + ' not allowed.';
};
NotAllowedError.prototype = new Error();

exports.GenericError = GenericError;
exports.NotFoundError = NotFoundError;
exports.NotAllowedError = NotAllowedError;