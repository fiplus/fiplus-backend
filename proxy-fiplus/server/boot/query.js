var Database = require('arangojs');

var dbconn = new Database({
  databaseName: 'fiplus',
  arangoVersion: '20304'
});

exports.getDeviceIdsInterestedInActivity = function(activity_id, cb)
{
  var deviceIds = [];
  var qCallback = function(err, cursor)
  {
    if(!err)
    {
      cursor.all(function(err, results) {
        cb(err, results[0]);
      });
    }
    else
    {
      console.log(err);
    }
  };

  dbconn.query("let devices = (" +
              "for t in graph_edges('fiplus', @activity, {edgeCollectionRestriction:'tagged'}) " +
              "for i in graph_edges('fiplus', t._to, {edgeCollectionRestriction:'interested_in'}) " +
              "for u in user " +
              "filter u._id == i._from and u.userData.device_ids != null " +
              "return u.userData.device_ids) " +
            "return unique(flatten(devices))", {activity: 'activity/' + activity_id}, qCallback);
  return deviceIds;
};

exports.getDeviceIdsJoinedActivity = function(activity_id, cb)
{
  var deviceIds = [];
  var qCallback = function(err, cursor)
  {
    if(!err)
    {
      cursor.all(function(err, results) {
        cb(err, results[0]);
      });
    }
    else
    {
      console.log(err);
    }
  };

  dbconn.query("let devices = (" +
  "for j in graph_edges('fiplus', @activity, {edgeCollectionRestriction:'joined'}) " +
  "let u = document(j._from)" +
  "filter u.userData.device_ids != null " +
  "return u.userData.device_ids) " +
  "return unique(flatten(devices))", {activity: 'activity/' + activity_id}, qCallback);
  return deviceIds;
};

exports.removeBadRegistrationId = function(deviceId)
{
  var qCallback = function(err, cursor)
  {
      if(err) console.log(err);
  };

  dbconn.query("for u in user " +
  "filter @deviceId in u.userData.device_ids " +
  "update {_key: u._key, userData:{device_ids:remove_value(u.userData.device_ids,@deviceId,1)}} in user", {deviceId:deviceId}, qCallback);
};
