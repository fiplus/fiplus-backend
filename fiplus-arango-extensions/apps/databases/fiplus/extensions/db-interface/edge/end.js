var db = require('org/arangodb').db;
var error = require('error');
var stamp = require('db-interface/node/time_stamp');

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
    var result;
    var stamp_node = (new stamp.TimeStamp()).saveTimeStamp(timestamp);

    var example = {};
    example[this.FROM_FIELD] = time_period_id;
    result = this.db.end.firstExample(example);
    // Only allow one end edge per time period.
    if(result == null)
    {
        result = this.db.end.save(time_period_id, stamp_node._id, {});
        if(result.error == true) {
            throw new error.GenericError('Saving start time' + timestamp + ' failed.');
        }
    }
    return result;
};

exports.End = End;