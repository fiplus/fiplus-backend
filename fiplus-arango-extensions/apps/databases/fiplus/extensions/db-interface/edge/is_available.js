var db = require('org/arangodb').db;
var error = require('error');
var time_period = require('db-interface/node/time_period');
var time_stamp = require('db-interface/node/time_stamp');
var model = require('model');

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

/**
 * Get user availabilities
 */
IsAvailable.prototype.getUserAvailabilities = function(user_id)
{
    var useravailabilities = [];
    this.db.is_available.outEdges(user_id).forEach(function(edge) {
        var timePeriod_id = edge._to;
        if (timePeriod_id.indexOf("time_period") > -1) {
            var time = new model.TimeModel();
            var start = db.start.outEdges(timePeriod_id)[0]._to;
            var end = db.end.outEdges(timePeriod_id)[0]._to;
            var Stamp = new time_stamp.TimeStamp();
            time.start = db.time_stamp.document(start)[Stamp.VALUE_FIELD];
            time.end = db.time_stamp.document(end)[Stamp.VALUE_FIELD];
            useravailabilities.push(time);
        }
    });
    return useravailabilities;
};

exports.IsAvailable = IsAvailable;