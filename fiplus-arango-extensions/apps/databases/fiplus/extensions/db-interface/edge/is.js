var db = require('org/arangodb').db;
var error = require('error');
var period = require('db-interface/node/time_period');
var loc = require('db-interface/node/location');

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
    var result;
    var period_node = (new period.TimePeriod()).saveTimePeriod(start_time, end_time);

    // Only allow one is edge per suggestion.
    var example = {};
    example[this.FROM_FIELD] = suggestion_id;
    if(this.db.is.firstExample(example) == null) {
        result = this.db.is.save(suggestion_id, period_node._id, {});
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
    var result;

    var location_node = (new loc.Location()).saveLocation(latitude, longitude);

    var example = {};
    example[this.FROM_FIELD] = suggestion_id;
    result = this.db.is.firstExample(example);
    if(result == null) {
        result = this.db.is.save(suggestion_id, location_node._id, {});
        if(result.error == true) {
            throw new error.GenericError('Saving location suggestion is ' + latitude + ', ' + longitude + ' failed.');
        }
    }
    return result;
};

exports.Is = Is;