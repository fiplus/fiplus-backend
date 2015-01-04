var db = require('org/arangodb').db;
var error = require('error');
var interest = require('interest');

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
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;

    // Checking for interest and saving if doesn't exist
    var interestApi = new interest.Interest();
    var existingInterest = interestApi.getInterestWithText(interestText);
    if(existingInterest == null)
    {
        existingInterest = interestApi.saveInterestToDb(interestText);
    }

    var taggedObject = {fromField:activityHandle,toField:existingInterest._id};

    if(this.db.tagged.firstExample(taggedObject) == null)
    {
        var result = this.db.tagged.save(activityHandle,existingInterest._id,{});
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