
var NewActivityMessage = function(activityId, message) {
  this.type = 'new_activity';
  this.activityId = activityId;
  this.message = message;
};
exports.NewActivityMessage = NewActivityMessage;

var FirmUpMessage = function(activityId, Name, time, location) {
  this.type = 'firm_up';
  this.activityId = activityId;
  this.Name = Name;
  this.time = JSON.stringify(time);
  this.location = JSON.stringify(location);
};
exports.FirmUpMessage = FirmUpMessage;


var CancelledActivityMessage = function(activityId, message) {
  this.type = 'cancelled_activity';
  this.activityId = activityId;
  this.message = message;
};
exports.CancelledActivityMessage = CancelledActivityMessage;


