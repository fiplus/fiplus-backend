var db = require('org/arangodb').db;
var error = require('error');
var period = require('time_period');
var loc = require('location');

/**
* Constructs an is db interface object
* @constructor
*/
var Is = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'is';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

/**
 * Creating a Is edge. Links suggestion to time period.
 */
Is.prototype.saveIsTimeEdge = function(suggestion_id, start_time, end_time)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var period_node = (new period.TimePeriod()).saveTimePeriod(start_time, end_time);

    var isObject = {fromField:suggestion_id, toField:period_node._id};

    // Only allow one is edge per suggestion.
    if(this.db.is.firstExample({fromField:suggestion_id}) == null) {
        result = this.db.is.save(isObject);
        if(result.error == true) {
            throw new error.GenericError('Saving time suggestion is ' + start_time + ', ' + end_time + ' failed.');
        }
    } else {
        throw new error.NotAllowedError('Multiple is edges for suggestion ' + suggestion_id);
    }
    return result;
};

/**
 * Creating a Is edge. Links suggestion to location.
 */
Is.prototype.saveIsLocationEdge = function(suggestion_id, latitude, longitude)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var location_node = (new loc.Location()).saveLocation(latitude, longitude);

    var isObject = {fromField:suggestion_id, toField:location_node._id};

    // Only allow one is edge per suggestion.
    if(this.db.is.firstExample({fromField:suggestion_id}) == null) {
        result = this.db.is.save(isObject);
        if(result.error == true) {
            throw new error.GenericError('Saving location suggestion is ' + latitude + ', ' + longitude + ' failed.');
        }
    } else {
        throw new error.NotAllowedError('Multiple is edges for suggestion ' + suggestion_id);
    }
    return result;
};

exports.Is = Is;