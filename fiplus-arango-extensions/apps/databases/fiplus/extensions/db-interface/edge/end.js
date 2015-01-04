var db = require('org/arangodb').db;
var error = require('error');
var stamp = require('time_stamp');

/**
* Constructs a end db interface object
* @constructor
*/
var End = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'end';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

/**
 * Creating a end time edge. Links time period to the timestamp.
 */
End.prototype.saveEndEdge = function(time_period_id, timestamp)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var stamp_node = (new stamp.TimeStamp()).saveTimeStamp(timestamp);

    var endObject = {fromField:time_period_id, toField:stamp_node._id};

    result = this.db.end.firstExample({fromField:time_period_id});
    // Only allow one end edge per time period.
    if(result == null)
    {
        result = this.db.end.save(endObject);
        if(result.error == true) {
            throw new error.GenericError('Saving start time' + timestamp + ' failed.');
        }
    }
    return result;
};

exports.End = End;