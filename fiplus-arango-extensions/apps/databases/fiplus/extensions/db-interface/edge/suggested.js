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

    var suggestion_node = (new sug.Suggestion()).saveTimeSuggestion(start_time, end_time);
    var suggestedObject = {fromField:activity_id, toField:suggestion_node._id};

    result = this.db.suggested.firstExample(suggestedObject);
    if(result == null) {
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

    var suggestion_node = (new sug.Suggestion()).saveLocationSuggestion(latitude, longitude);
    var suggestedObject = {fromField:activity_id, toField:suggestion_node._id};

    result = this.db.suggested.firstExample(suggestedObject);
    if(result == null) {
        result = this.db.suggested.save(suggestedObject);
        if(result.error == true) {
            throw new error.GenericError('Saving suggested location ' + latitude + ', ' + longitude + ' failed.');
        }
    }
    return result;
};

exports.Suggested = Suggested;