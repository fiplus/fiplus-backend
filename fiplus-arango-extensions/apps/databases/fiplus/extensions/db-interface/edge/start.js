var db = require('org/arangodb').db;
var error = require('error');
var stamp = require('db-interface/node/time_stamp');

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
    var result;
    var stamp_node = (new stamp.TimeStamp()).saveTimeStamp(timestamp);

    var example = {};
    example[this.FROM_FIELD] = time_period_id;
    result = this.db.start.firstExample(example);
    // Only allow one start edge per time period.
    if(result == null)
    {
        result = this.db.start.save(time_period_id, stamp_node._id, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving start time' + timestamp + ' failed.');
        }
    }
    return result;
};

exports.Start = Start;