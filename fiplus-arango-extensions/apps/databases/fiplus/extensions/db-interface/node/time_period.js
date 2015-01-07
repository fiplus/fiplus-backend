var db = require('org/arangodb').db;
var error = require('error');
var start = require('db-interface/edge/start');
var end = require('db-interface/edge/end');

/**
* Constructs an time period db interface object
* @constructor
*/
var TimePeriod = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'time_period';
};

/**
 * Add a time period with start and end times.
 */
TimePeriod.prototype.saveTimePeriod = function(start_time, end_time)
{
    var result;

    if(end_time < start_time) {
        throw new error.NotAllowedError("End time before start time");
    }

    var nowMillis = Date.now();
    if(end_time < nowMillis) {
        throw new error.NotAllowedError("Time periods in past");
    }

    //Prevent the creation of a time period with the same start and end time as another time period.
    var time_period_collection = this.db.time_period.toArray();
    var time_period_collection_length = this.db.time_period.count();
    var time_period;
    for (var i=0; i < time_period_collection_length; i++)
    {
        time_period = time_period_collection[i];

        var start_timestamp_id = this.db.start.outEdges(time_period._id)[0]._to ;
        if(start_timestamp_id != null)
        {
            var start_timestamp_value = this.db.time_stamp.document(start_timestamp_id).value;
            if (start_timestamp_value == start_time) {
                var end_timestamp_id = this.db.end.outEdges(time_period._id)[0]._to;
                var end_timestamp_value = this.db.time_stamp.document(end_timestamp_id).value;
                if (end_timestamp_value == end_time) {
                    //We found an existing time_period node with the same start and end time
                    result = time_period;
                    return result;
                }
            }
        }
    }
    // Every created time period is unique
    result = this.db.time_period.save({});
    if (result.error == true) {
        throw new error.GenericError('Saving time period failed.');
    }

    var start_edge = (new start.Start()).saveStartEdge(result._id, start_time);
    var end_edge = (new end.End()).saveEndEdge(result._id, end_time);

    return result;
};

exports.TimePeriod = TimePeriod;