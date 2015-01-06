var db = require('org/arangodb').db;
var error = require('error');

/**
* Constructs a time stamp db interface object
* @constructor
*/
var TimeStamp = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'time_stamp';
    this.VALUE_FIELD = 'value';
};

/**
 * Add a unique timestamp to the collection. Return the added timestamp's node
 */
TimeStamp.prototype.saveTimeStamp = function(value)
{
    var valueObject = {};
    valueObject[this.VALUE_FIELD] = value;
    var result;

    result = this.db.time_stamp.firstExample(valueObject);
    if(result == null) {
        result = this.db.interest.save(valueObject);
        if(result.error == true) {
            throw new error.GenericError('Saving ' + value + ' failed.');
        }
    }
    return result;
};

exports.TimeStamp = TimeStamp;