var db = require('org/arangodb').db;
var error = require('error');
var interest = require('db-interface/node/interest');

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

Tagged.prototype.tagActivityWithInterest = function(activityHandle, interestText)
{
    // Checking for interest and saving if doesn't exist
    var interestApi = new interest.Interest();
    var existingInterest = interestApi.saveInterestToDb(interestText);

    var taggedObject = {};
    taggedObject[this.FROM_FIELD] = activityHandle;
    taggedObject[this.TO_FIELD] = existingInterest._id;

    var result = this.db.tagged.firstExample(taggedObject);
    if(result == null)
    {
        result = this.db.tagged.save(activityHandle, existingInterest._id, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving activity tag failed');
        }
    }
    return result;
};

exports.Tagged = Tagged;
