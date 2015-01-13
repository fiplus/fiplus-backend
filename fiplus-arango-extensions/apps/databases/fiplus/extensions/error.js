var GenericError = function (message) {
    this.message = 'Error: ' + message;
};
GenericError.code = 500;
GenericError.prototype = new Error();

var NotFoundError = function(unfoundObject) {
    this.message = unfoundObject + ' not found';
};
NotFoundError.code = 404;
NotFoundError.prototype = new Error();

var NotAllowedError = function(operationdesc) {
    this.message = operationdesc + ' not allowed.';
};
NotAllowedError.code = 400;
NotAllowedError.prototype = new Error();

var UnauthorizedError = function(credential, task) {
    this.message = credential + ' is not authorized to perform ' + task + '.';
};
UnauthorizedError.code = 401;
UnauthorizedError.prototype = new Error();

exports.GenericError = GenericError;
exports.NotFoundError = NotFoundError;
exports.NotAllowedError = NotAllowedError;
exports.UnauthorizedError = UnauthorizedError;