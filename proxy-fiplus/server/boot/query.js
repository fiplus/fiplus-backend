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
    cursor.all(function(err, results) {
      cb(err, results[0]);
    })
  };

  dbconn.query("let devices = (" +
              "for t in graph_edges('fiplus', @activity, {edgeCollectionRestriction:'tagged'}) " +
              "for i in graph_edges('fiplus', t._to, {edgeCollectionRestriction:'interested_in'}) " +
              "for u in user " +
              "filter u._id == i._from and u.userData.device_ids != null " +
              "return u.userData.device_ids) " +
            "return unique(flatten(devices))", {activity: activity_id}, qCallback);
  return deviceIds;
};

