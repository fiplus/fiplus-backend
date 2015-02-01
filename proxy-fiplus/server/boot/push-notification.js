var gcm = require('node-gcm-service');
var database = require('arangojs');
var registrationIds = [];

var func = function(err, cursor)
{
   cursor.all(createRegisterIDArray);
}

var createRegisterIDArray = function(err, device_id_array)
{
  for (var i = 0; i < device_id_array.length; i++) {
    registrationIds.push(device_id_array[i]); //registration id from our server
    console.info(registrationIds);
  }
}




exports.SendNotification = function(activity_id) {
  //Get all the registration ids
  var db = new database({databaseName: 'fiplus', arangoVersion: '20304'});

  db.query("let devices = (for t in graph_edges('fiplus', '" + activity_id + "', {edgeCollectionRestriction:'tagged'})" +
  "for i in graph_edges('fiplus', t._to, {edgeCollectionRestriction:'interested_in'}) for u in user " +
  "filter u._id == i._from and u.userData.device_ids != null return u.userData.device_ids) return unique(flatten(devices))", func);


  var gcmSender = new gcm.Sender();
  gcmSender.setAPIKey("AIzaSyDwbfeTyVbI1GvMh0JLNyweaNhSbqbgMzI");
  var gcmMessage = new gcm.Message({
    data: {
      message: "Test Message for Allan"
    },
    delay_while_idle: true,
    time_to_live: 34,
    dry_run: true
  });

  for (var i = 0; i < registrationIds.length; i++) {
    gcmSender.sendMessage(gcmMessage.toString(), registrationIds[i], true, function (err, data) {
      if (!err) {
        // do something
        console.info("data", JSON.stringify(data));
      } else {
        // handle error
        console.info("error", JSON.stringify(err));
      }
    });

  }
}
