var db = require('org/arangodb').db;
var error = require('error');
var stamp = require('time_stamp');

/**
* Constructs a start db interface object
* @constructor
*/
var Start = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'start';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

/**
 * Creating a start time edge. Links time period to the timestamp.
 */
Start.prototype.saveStartEdge = function(time_period_id, timestamp)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var stamp_node = (new stamp.TimeStamp()).saveTimeStamp(timestamp);

    var startObject = {fromField:time_period_id, toField:stamp_node._id};

    // Only allow one start edge per time period.
    if(this.db.start.firstExample({fromField:time_period_id}) == null) {
        result = this.db.start.save(startObject);
        if(result.error == true) {
            throw new error.GenericError('Saving start time' + timestamp + ' failed.');
        }
    } else {
        throw new error.NotAllowedError('Multiple start edges for time period' + time_period_id);
    }
    return result;
};

exports.Start = Start;