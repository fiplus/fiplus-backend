var db = require('org/arangodb').db;
var error = require('error');
var stamp = require('db-interface/node/time_stamp').TimeStamp;
var period = require('db-interface/node/time_period').TimePeriod;
var model_common = require('model-common');
var location = require('db-interface/node/location').Location;

/**
 * Constructs a confirmed db interface object
 * @constructor
 */
var Confirmed = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'confirmed';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

function save(activityId, suggestedId, is_time)
{
    if(!db.activity.exists(activityId))
    {
        throw new error.NotFoundError('Activity')
    }

    // delete existing time or location confirmation accordingly
    db.confirmed.outEdges(activityId).forEach(function (edge)
    {
        if(edge._to.split('/')[0] ==  "time_period")
        {
            if(is_time)
            {
                db.confirmed.remove(edge._key);
            }
        }
        else if(edge._to.split('/')[0] ==  "location")
        {
            if(!is_time)
            {
                db.confirmed.remove(edge._key);
            }
        }
    });

    // save confirmation
    var result = db.confirmed.save(activityId, suggestedId, {});
    if(result.error == true)
    {
        throw new error.GenericError('Saving confirmation for suggestion failed.');
    }

    return result;
}

// confirm all users that have voted for the event
function confirmVoters(activityId, suggestionId)
{
    // find all voters of the suggestion
    db.voted.inEdges(suggestionId).forEach(function(edge)
    {
        var voter_id = edge._from;
        // create a confirmed edge between user and activity
        var result = db.confirmed.save(voter_id, activityId, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving confirmation for voter failed.');
        }
    });
}

Confirmed.prototype.saveConfirmed = function(activityId, suggestionId)
{
    if(!db.suggestion.exists(suggestionId))
    {
        throw new error.NotFoundError('Suggestion');
    }

    var id = db.is.outEdges(suggestionId)[0]._to;
    var is_time = (id.split('/')[0] ==  "time_period");
    var result = save(activityId, id, is_time);
    confirmVoters(activityId, suggestionId);
    return result;
};

Confirmed.prototype.saveConfirmedTime = function(activityId, start_time, end_time)
{
    var period_node = (new period()).saveTimePeriod(start_time, end_time);

    var result = save(activityId, period_node._id, true);
    confirmVoters(activityId, suggestionId);
    return result;
};

Confirmed.prototype.saveConfirmedLocation = function(activityId, latitude, longitude)
{
    var loc_node = (new location()).saveLocation(latitude, longitude);

    var result = save(activityId, loc_node._id, false);
    confirmVoters(activityId, suggestionId);
    return result;
};

Confirmed.prototype.getConfirmedTime = function(activity_id)
{
    var time;
    var edges = db.confirmed.outEdges(activity_id);
    for(var i = 0; i < edges.length; i++)
    {
        var timePeriod_id = edges[i]._to;
        if (timePeriod_id.indexOf("time_period") > -1)
        {
            time = new model_common.Time();
            var start = db.start.outEdges(timePeriod_id)[0]._to;
            var end = db.end.outEdges(timePeriod_id)[0]._to;
            var Stamp = new stamp();
            time.suggestion_id = "-1";
            time.start = db.time_stamp.document(start)[Stamp.VALUE_FIELD];
            time.end = db.time_stamp.document(end)[Stamp.VALUE_FIELD];
        }
    }

    return time;
};

Confirmed.prototype.getConfirmedLocation = function(activity_id)
{
    var loc_model;
    var edges = db.confirmed.outEdges(activity_id);
    for(var i = 0; i < edges.length; i++)
    {
        var location_id = edges[i]._to;
        if (location_id.indexOf("location") > -1)
        {
            loc_model = new model_common.Location();
            var Location = new location();
            var loc_node = Location.get(location_id);
            loc_model.suggestion_id = "-1";
            loc_model.longitude = loc_node[Location.LONGITUDE_FIELD];
            loc_model.latitude = loc_node[Location.LATITUDE_FIELD];
        }
    }
    return loc_model;
};

exports.Confirmed = Confirmed;