var db = require('org/arangodb').db;
var error = require('error');
var period = require('time_period');
var sug = require('suggestion');

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
Suggested.prototype.saveSuggestedTimeEdge = function(activity_id, start_time, end_time)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    // check to see if suggestion already exists
    db.suggested.outEdges(activity_id).forEach(function(edge) {
        var suggestion_id = edge._to;
        var timePeriod_id = db.is.outEdges(suggestion_id)._to;

        // if node found is time and not location
        if (db.time_period.exists(timePeriod_id)) {
            var startStamp = db.time_stamp.document(db.start.outEdges(timePeriod_id)._to);
            if (startStamp.value == start_time) {
                var endStamp = db.time_stamp.document(db.end.outEdges(timePeriod_id)._to);
                if (endStamp.value == end_time) {
                    throw new error.NotAllowedError("Time period suggestion already exists for this activity. Duplicate suggestions");
                }
            }
        }
    });

    var suggestion_node = (new sug.Suggestion()).saveTimeSuggestion(start_time, end_time);
    var suggestedObject = {fromField:activity_id, toField:suggestion_node._id};

    var result = this.db.suggested.save(suggestedObject);
    if(result.error == true) {
        throw new error.GenericError('Saving suggested time ' + start_time + ', ' + end_time + ' failed.');
    }
    return result;
};

/**
 * Creating a suggested edge. Links activity to location.
 */
Suggested.prototype.saveSuggestedLocationEdge = function(activity_id, latitude, longitude)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    // check to see if suggestion already exists
    db.suggested.outEdges(activity_id).forEach(function(edge) {
        var suggestion_id = edge._to;
        var location_id = db.is.outEdges(suggestion_id)._to;

        // if node found is location and not time
        location = db.location.document(location_id);
        if (location != null) {
            if (location.latitude == latitude && location.longitude == longitude) {
                throw new error.NotAllowedError("Location suggestion already exists for this activity. Duplicate suggestions");
            }
        }
    });

    var suggestion_node = (new sug.Suggestion()).saveLocationSuggestion(latitude, longitude);
    var suggestedObject = {fromField:activity_id, toField:suggestion_node._id};

    result = this.db.suggested.save(suggestedObject);
    if(result.error == true) {
        throw new error.GenericError('Saving suggested location ' + latitude + ', ' + longitude + ' failed.');
    }
    return result;
};

exports.Suggested = Suggested;