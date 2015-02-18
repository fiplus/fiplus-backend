
var NewActivityMessage = function(activityId, message) {
  this.type = 'new_activity';
  this.activityId = activityId;
  this.message = message;
};
exports.NewActivityMessage = NewActivityMessage;
