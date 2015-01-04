var db = require('org/arangodb').db;
var error = require('error');
var location = require('location');

/**
 * Constructs an tagged db interface object
 * @constructor
 */
var Tagged = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'tagged';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

Tagged.prototype.tagActivityWithInterest = function(activityHandle, interestHandle)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var taggedObject = {fromField:activityHandle,toField:interestHandle};

    if(this.db.tagged.firstExample(taggedObject) == null)
    {
        var result = this.db.tagged.save(activityHandle,interestHandle,{});
        if(result.error == true)
        {
            throw new error.GenericError('Saving activity tag failed');
        }
    }
    else
    {
        throw new error.NotAllowedError('Duplicate tagging');
    }
};

exports.Tagged = Tagged;
