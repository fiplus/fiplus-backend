var db = require('org/arangodb').db;
var error = require('error');
var start = require('start');
var end = require('end');

/**
* Constructs an time stamp db interface object
* @constructor
*/
var TimePeriod = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'time_period';
};

/**
 * Add a time period with start and end times
 */
TimePeriod.prototype.saveTimePeriod = function(start_time, end_time)
{
    var result;

    // Every created time stamp is unique
    result = this.db.time_period.save({});
    if(result.error == true) {
        throw new error.GenericError('Saving time period failed.');
    }

    var start_edge = (new start.Start()).saveStartEdge(result._id, start_time);
    var end_edge = (new end.End()).saveEndEdge(result._id, end_time);

    return result;
};

exports.TimePeriod = TimePeriod;