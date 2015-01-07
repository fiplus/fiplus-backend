var db = require('org/arangodb').db;
var error = require('error');
var tagged = require('db-interface/edge/tagged');

/**
 * Constructs an activity db interface object
 * @constructor
 * Required fields: name, description, maximum attendance
 * Related edges: creator, tagged, suggested, joined, participated, confirmed, has
 */
var Activity = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'activity';
    this.NAME_FIELD = 'name';
    this.DESCRIPTION_FIELD = 'description';
    this.MAXIMUM_ATTENDANCE_FIELD = 'maximum_attendance';
};

Activity.prototype.saveActivityToDb = function(name, description, maximum_attendance)
{
    var activityObject = {};
    activityObject[this.NAME_FIELD] = name;
    activityObject[this.DESCRIPTION_FIELD] = description;
    activityObject[this.MAXIMUM_ATTENDANCE_FIELD] = maximum_attendance;

    var result = this.db.activity.save(activityObject);
    if(result.error == true)
    {
        throw new error.GenericError('Saving activity ' + name + ' failed.');
    }
    return result;
};

Activity.prototype.getNumJoiners = function(activity_id) {
    return this.db.joined.outEdges(activity_id).length;
};
Activity.prototype.getMaximum = function(activity_id) {
    return this.db.activity.document(activity_id).maximum_attendance;
};
Activity.prototype.activityFull = function(activity_id) {
    return this.getNumJoiners(activity_id) >= this.getMaximum(activity_id);
};

exports.Activity = Activity;