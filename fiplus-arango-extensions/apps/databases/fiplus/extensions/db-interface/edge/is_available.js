var db = require('org/arangodb').db;
var error = require('error');
var time_period = require('db-interface/node/time_period');

/**
 * Constructs an is_available db interface object
 * @constructor
 */
var IsAvailable = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'is_available';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

/**
 * Creating an is_available edge between a user and time period.
 */
IsAvailable.prototype.saveIsAvailableEdge = function(user_id, start_time, end_time)
{
    var result;
    var time_period_object = (new time_period.TimePeriod()).saveTimePeriod(start_time, end_time);

    //Allow for multiple is_available per user. Save directly.
    result = this.db.is_available.save(user_id, time_period_object._id, {});
    if(result.error == true)
    {
        throw new error.GenericError('Saving user time availability for ' + user_id + ' failed.');
    }

    return result;
}

exports.IsAvailable = IsAvailable;