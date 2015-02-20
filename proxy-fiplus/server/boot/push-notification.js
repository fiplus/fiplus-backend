var gcm = require('node-gcm-service');
var query = require('./query');
var push_message = require("./push-message");

exports.SendNotificationOnActivityCreate = function(activity)
{
  var createActivityResponse = JSON.parse(activity);
  query.getDeviceIdsInterestedInActivity(createActivityResponse.activity_id, function(err, devices) {
    var gcmSender = new gcm.Sender();
    gcmSender.setAPIKey("AIzaSyDwbfeTyVbI1GvMh0JLNyweaNhSbqbgMzI");
    var message = new push_message.NewActivityMessage(createActivityResponse.activity_id, createActivityResponse.Name + ' event created!');
    console.log(JSON.stringify(message));
    var gcmMessage = new gcm.Message({
      data: message,
      dry_run: false
    });

    devices.forEach(function(id) {
      gcmSender.sendMessage(gcmMessage.toString(), id, true, function (err, data) {
        // TODO More robust error/gcm result handling, i.e deleting invalid reg ids
        if (!err) {
          // do something
          console.info("data", JSON.stringify(data));
        } else {
          // handle error
          console.info("error " + err);
        }
      });
    });
  });

};