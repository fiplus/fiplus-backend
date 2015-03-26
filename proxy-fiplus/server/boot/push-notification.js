var gcm = require('node-gcm-service');
var query = require('./query');
var push_message = require("./push-message");

function sendPushNotification(message, deviceIds)
{
  var gcmSender = new gcm.Sender();
  gcmSender.setAPIKey("AIzaSyDwbfeTyVbI1GvMh0JLNyweaNhSbqbgMzI");

  console.log(JSON.stringify(message));
  var gcmMessage = new gcm.Message({
    data: message,
    dry_run: false
  });

  deviceIds.forEach(function(id) {
    gcmSender.sendMessage(gcmMessage.toString(), id, true, function (err, response) {
      // TODO More robust error/gcm result handling, i.e deleting invalid reg ids

      // Need to removed registration ids that are old or invalid
      if(response.old_registration_id || response.error) {
        query.removeBadRegistrationId(id);
      }

      if (!err) {
        // do something
        console.info(JSON.stringify(response));
      } else {
        // handle error
        console.info("error " + err);
      }
    });
  });
}

exports.SendNotificationOnActivityCreate = function(activity)
{
  var createActivityResponse = JSON.parse(activity);
  query.getDeviceIdsInterestedInActivity(createActivityResponse.activity_id, function(err, devices) {

    var message = new push_message.NewActivityMessage(createActivityResponse.activity_id,
      createActivityResponse.Name + ' activity created!');

    sendPushNotification(message, devices);
  });
};

exports.SendNotificationOnFirmUp = function(firmUp)
{
  var firmUpResponse = JSON.parse(firmUp);
  query.getDeviceIdsJoinedActivity(firmUpResponse.activity_id, function(err, devices) {

    var message = new push_message.FirmUpMessage(firmUpResponse.activity_id, firmUpResponse.Name,
      firmUpResponse.time, firmUpResponse.location);

    sendPushNotification(message, devices);
  });
};

exports.SendCancelledActivityMessage = function(activity)
{
  var cancelActivityResponse = JSON.parse(activity);
  query.getDeviceIdsJoinedActivity(cancelActivityResponse.activity_id, function(err, devices) {
    var message = new push_message.CancelledActivityMessage(cancelActivityResponse.activity_id,
      cancelActivityResponse.Name + ' has been cancelled');

    sendPushNotification(message, devices);
  });
};
