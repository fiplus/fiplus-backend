var db = require('org/arangodb').db;
var error = require('error');
var time_period = require('time_period');

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
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var time_period = (new time_period.TimePeriod()).saveTimePeriod(start_time, end_time);
    var is_available_object = {fromField:user_id, toField:time_period._id};
    //Allow for multiple is_available per user. Save directly.
    result = this.db.is_available.save(is_available_object);
    if(result.error == true)
    {
        throw new error.GenericError('Saving user time availability for ' + user_id + ' failed.');
    }

    return result;
}

exports.IsAvailable = IsAvailable;