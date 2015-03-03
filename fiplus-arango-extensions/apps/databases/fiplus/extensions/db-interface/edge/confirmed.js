var db = require('org/arangodb').db;
var error = require('error');
var stamp = require('db-interface/node/time_stamp').TimeStamp;
var joiner = require('db-interface/edge/joined').Joined;
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

function confirmSuggestion(activityId, suggestedId, is_time)
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
Confirmed.prototype.confirmVoters = function(activityId)
{
    var _this = this;
    var isConfirm = this.isConfirmed(activityId);
    if(isConfirm.confirmed)
    {
        if(isConfirm.time_sug != null)
        {
            // find all voters of the suggestion
            db.voted.inEdges(isConfirm.time_sug).forEach(function (edge) {
                var voter_id = edge._from;
                // if user voted for both time and location (if suggestion exists), confirm
                if (isConfirm.loc_sug == null ||
                    db.voted.firstExample({"_from": voter_id, "_to": isConfirm.loc_sug}) != null) {
                    _this.confirmUser(voter_id, activityId);
                }
            });
        }
        else if (isConfirm.loc_sug != null) {
            db.voted.inEdges(isConfirm.loc_sug).forEach(function (edge) {
                var voter_id = edge._from;
                // if user voted for location, and no time suggestion
                _this.confirmUser(voter_id, activityId);
            });
        }
    }
}

// returns true if the activity has been confirmed (both time and location). False otherwise
Confirmed.prototype.isConfirmed = function(activityId)
{
    var time_sug, loc_sug;
    var hasTime = false;
    var hasLoc = false;
    db.confirmed.outEdges(activityId).forEach(function(edge)
    {
        var id = edge._to;
        if((id.split('/')[0] ==  "time_period"))
        {
            hasTime = true;
            db.is.inEdges(id).forEach(function (edge) {
                var sug = edge._from;
                if(db.suggested.firstExample({"_from":activityId, "_to":sug}) != null)
                {
                    time_sug = sug;
                }
            });
        }
        else if((id.split('/')[0] ==  "location"))
        {
            hasLoc = true;
            db.is.inEdges(id).forEach(function (edge) {
                var sug = edge._from;
                if(db.suggested.firstExample({"_from":activityId, "_to":sug}) != null)
                {
                    loc_sug = sug;
                }
            });
        }
    });

    return{
        confirmed: hasTime && hasLoc,
        time_sug: time_sug,
        loc_sug: loc_sug
    };
}

Confirmed.prototype.confirmUser = function(userId, activityId)
{
    if(db.confirmed.firstExample({"_from": userId, "_to": activityId}) == null)
    {
        var result = db.confirmed.save(userId, activityId, {});
        if (result.error == true)
        {
            throw new error.GenericError('Saving confirmation for voter failed.');
        }
    }
}

Confirmed.prototype.saveConfirmed = function(activityId, suggestionId)
{
    if(!db.suggestion.exists(suggestionId))
    {
        throw new error.NotFoundError('Suggestion');
    }

    var id = db.is.outEdges(suggestionId)[0]._to;
    var is_time = (id.split('/')[0] ==  "time_period");
    var result = confirmSuggestion(activityId, id, is_time);
    this.confirmVoters(activityId);
    return result;
};

Confirmed.prototype.saveConfirmedTime = function(activityId, start_time, end_time)
{
    var period_node = (new period()).saveTimePeriod(start_time, end_time);

    var result = confirmSuggestion(activityId, period_node._id, true);
    this.confirmVoters(activityId);
    return result;
};

Confirmed.prototype.saveConfirmedLocation = function(activityId, latitude, longitude)
{
    var loc_node = (new location()).saveLocation(latitude, longitude);

    var result = confirmSuggestion(activityId, loc_node._id, false);
    this.confirmVoters(activityId);
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

Confirmed.prototype.getNumConfirmers = function(activity_id)
{
    //Note: assumes x -> confirmed -> activity, x is always user
    return this.db.confirmed.inEdges(activity_id).length;
};

Confirmed.prototype.getConfirmersProfile = function(activity_id, maximum, current_userId)
{
    if(maximum == null) {
        maximum = (new joiner()).GET_JOINER_MAX;
    }
    var joiners = [];
    var num_joiners = this.getNumConfirmers(activity_id);
    var joined_array = this.db.confirmed.inEdges(activity_id);
    var limit = (num_joiners <= maximum)? num_joiners: maximum;

    for(var i = 0; i < limit; i++) {
        joiners.push(helper.getProfile(this.db.user.document(joined_array[i]._from), current_userId));
    }
    return joiners;

};

Confirmed.prototype.getConfirmersId = function(activity_id, maximum)
{
    if(maximum == null) {
        maximum = (new joiner()).GET_JOINER_MAX;
    }
    var joiners = [];
    var num_joiners = this.getNumConfirmers(activity_id);
    var joined_array = this.db.confirmed.inEdges(activity_id);
    var limit = (num_joiners <= maximum)? num_joiners: maximum;

    for(var i = 0; i < limit; i++) {
        joiners.push(this.db.user.document(joined_array[i]._from)._key);
    }
    return joiners;
};

Confirmed.prototype.setUserConfirmedActivity = function(userHandle, activityHandle)
{
    var Activity = new activity();

    (new user()).exists(userHandle);
    Activity.exists(activityHandle);

    if(Activity.activityFull(activityHandle))
    {
        throw new error.NotAllowedError('Activity is full. Joining is');
    }

    var joinedObject = {};
    joinedObject[this.FROM_FIELD] = userHandle;
    joinedObject[this.TO_FIELD] = activityHandle;
    var result = this.db.joined.firstExample(joinedObject);

    if(result == null)
    {
        result = this.db.joined.save(userHandle, activityHandle, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving user joined activity failed.');
        }
    }
    return result;
};

exports.Confirmed = Confirmed;