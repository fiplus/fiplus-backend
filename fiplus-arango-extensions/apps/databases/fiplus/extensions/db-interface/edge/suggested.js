var db = require('org/arangodb').db;
var error = require('error');
var period = require('db-interface/node/time_period').TimePeriod;
var location = require('db-interface/node/location').Location;
var stamp = require('db-interface/node/time_stamp').TimeStamp;
var sug = require('db-interface/node/suggestion').Suggestion;
var voted = require('db-interface/edge/voted').Voted;
var model_common = require('model-common');

/**
* Constructs a suggested db interface object
* @constructor
*/
var Suggested = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'suggested';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

/**
 * Creating a suggested edge. Links activity to suggestion
 */
Suggested.prototype.saveSuggestedTimeEdge = function(activity_id, start_time, end_time, user_id)
{
    var result;

    if(!(db.activity.exists(activity_id)))
    {
        throw new error.NotFoundError('Activity');
    }

    // check to see if suggestion already exists
    db.suggested.outEdges(activity_id).forEach(function(edge) {
        var suggestion_id = edge._to;
        var timePeriod_id = db.is.outEdges(suggestion_id)[0]._to;

        // if node found is time and not location
        if (timePeriod_id.indexOf("time_period") > -1) {
            var start_id = db.start.outEdges(timePeriod_id)[0]._to;
            var startStamp = db.time_stamp.document(start_id);
            if (startStamp.value == start_time) {
                var end_id = db.end.outEdges(timePeriod_id)[0]._to;
                var endStamp = db.time_stamp.document(end_id);
                if (endStamp.value == end_time) {
                    throw new error.NotAllowedError("Time period suggestion already exists for this activity. Duplicate suggestions");
                }
            }
        }
    });

    var suggestion_node = (new sug()).saveTimeSuggestion(start_time, end_time);
    var result = this.db.suggested.save(activity_id, suggestion_node._id, {});
    if(result.error == true) {
        throw new error.GenericError('Saving suggested time ' + start_time + ', ' + end_time + ' failed.');
    }

    //If suggestion didn't fail. Vote for it.
    (new voted()).saveUserVote(user_id, suggestion_node._id);
    return suggestion_node._key;
};

/**
 * Creating a suggested edge. Links activity to location.
 */
Suggested.prototype.saveSuggestedLocationEdge = function(activity_id, latitude, longitude, address, user_id)
{
    var result;

    if(!db.activity.exists(activity_id))
    {
        throw new error.NotFoundError('Activity');
    }

    // check to see if suggestion already exists
    db.suggested.outEdges(activity_id).forEach(function(edge) {
        var suggestion_id = edge._to;
        var location_id = db.is.outEdges(suggestion_id)[0]._to;

        // if node found is location and not time
        if (location_id.indexOf("location") > -1) {
            var location_doc = db.location.document(location_id);
            if (location_doc != null) {
                if (location_doc.latitude == latitude && location_doc.longitude == longitude && location_doc.address == address) {
                    throw new error.NotAllowedError("Location suggestion already exists for this activity. Duplicate suggestions");
                }
            }
        }
    });

    var suggestion_node = (new sug()).saveLocationSuggestion(latitude, longitude, address);
    result = this.db.suggested.save(activity_id, suggestion_node, {});
    if(result.error == true) {
        throw new error.GenericError('Saving suggested location ' + address + ' failed.');
    }
    //If suggestion didn't fail. Vote for it.
    (new voted()).saveUserVote(user_id, suggestion_node._id);
    return suggestion_node._key;
};

Suggested.prototype.getSuggestedTimes = function(activity_id)
{
    var times = [];
    var Voted = new voted();
    db.suggested.outEdges(activity_id).forEach(function(edge) {
        var timePeriod_id = db.is.outEdges(edge._to)[0]._to;
        if (timePeriod_id.indexOf("time_period") > -1) {
            var time = new model_common.Time();
            var start = db.start.outEdges(timePeriod_id)[0]._to;
            var end = db.end.outEdges(timePeriod_id)[0]._to;
            var Stamp = new stamp();
            time.suggestion_id = db.suggestion.document(edge._to)._key;
            time.suggestion_votes = Voted.getNumberOfUserVotes(db.suggestion.document(edge._to));
            time.suggestion_voters = Voted.getVotersId(db.suggestion.document(edge._to));
            time.start = db.time_stamp.document(start)[Stamp.VALUE_FIELD];
            time.end = db.time_stamp.document(end)[Stamp.VALUE_FIELD];
            times.push(time);
        }
    });
    return times;
};

Suggested.prototype.getSuggestedLocations = function(activity_id)
{
    var locations = [];
    var Voted = new voted();
    db.suggested.outEdges(activity_id).forEach(function(edge) {
        var location_id = db.is.outEdges(edge._to)[0]._to;
        if (location_id.indexOf("location") > -1) {
            var loc_model = new model_common.Location();
            var Location = new location();
            var loc_node = Location.get(location_id);
            loc_model.suggestion_id = db.suggestion.document(edge._to)._key;
            loc_model.suggestion_votes = Voted.getNumberOfUserVotes(db.suggestion.document(edge._to));
            loc_model.suggestion_voters = Voted.getVotersId(db.suggestion.document(edge._to));
            loc_model.longitude = loc_node[Location.LONGITUDE_FIELD];
            loc_model.latitude = loc_node[Location.LATITUDE_FIELD];
            loc_model.address = loc_node[Location.ADDRESS_FIELD];
            locations.push(loc_model);
        }
    });
    return locations;
};

exports.Suggested = Suggested;