var NotFoundError = function(unfoundObject) {
    this.message = unfoundObject + ' not found';
};
NotFoundError.prototype = new Error();

var NotAllowedError = function(operationdesc) {
    this.message = operationdesc + ' not allowed.';
};
NotAllowedError.prototype = new Error();

exports.NotFoundError = NotFoundError;
exports.NotAllowedError = NotAllowedError;