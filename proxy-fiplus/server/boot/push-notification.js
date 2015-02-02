var gcm = require('node-gcm-service');
var query = require('./query');

exports.SendNotificationOnActivityCreate = function(activity_id)
{
  query.getDeviceIdsInterestedInActivity(activity_id, function(err, devices) {
    var gcmSender = new gcm.Sender();
    gcmSender.setAPIKey("AIzaSyDwbfeTyVbI1GvMh0JLNyweaNhSbqbgMzI");
    var gcmMessage = new gcm.Message({
      data: {
        message: "A new event related to one of your interests has been created. Check it out!"
      },
      dry_run: false
    });

    gcmSender.sendMessage(gcmMessage.toString(), devices, true, function (err, data) {
      if (!err) {
        // do something
        console.info("data", JSON.stringify(data));
      } else {
        // handle error
        console.info("error " + err);
      }
    });
  });

};
