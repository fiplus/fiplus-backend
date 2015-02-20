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
    this.NAME_FIELD = 'Name';
    this.DESCRIPTION_FIELD = 'description';
    this.MAXIMUM_ATTENDANCE_FIELD = 'max_attendees';
    this.ALLOW_JOINER_INPUT = 'allow_joiner_input'
};

Activity.prototype.saveActivityToDb = function(name, description, maximum_attendance, allow_joiner_input)
{
    var activityObject = {};
    activityObject[this.NAME_FIELD] = name;
    activityObject[this.DESCRIPTION_FIELD] = description;
    activityObject[this.MAXIMUM_ATTENDANCE_FIELD] = maximum_attendance;
    activityObject[this.ALLOW_JOINER_INPUT] = allow_joiner_input;

    var result = this.db.activity.save(activityObject);
    if(result.error == true)
    {
        throw new error.GenericError('Saving activity ' + name + ' failed.');
    }
    return result;
};

Activity.prototype.get = function(activity_id) {
    this.exists(activity_id);
    return this.db.activity.document(activity_id);
}

Activity.prototype.exists = function(activity_id) {
    if(!this.db.activity.exists(activity_id)) {
        throw new error.NotFoundError("Activity " + activity_id);
    }
    return true;
};

Activity.prototype.activityFull = function(activity_id) {
    var activity = this.db.activity.document(activity_id);
    var max = activity[this.MAXIMUM_ATTENDANCE_FIELD];
    var fill = this.db.joined.outEdges(activity_id).length;

    return (fill >= max);
};

exports.Activity = Activity;