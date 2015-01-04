var db = require('org/arangodb').db;
var error = require('error');
var interest = require('interest');

/**
 * Constructs a user interest db interface object
 * @constructor
 */
var InterestedIn = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'interested_in';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

InterestedIn.prototype.saveUserInterest = function(userHandle, interestText)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;

    var interestApi = new interest.Interest();
    var existingInterest = interestApi.saveInterestToDb(interestText);

    var interestedInObject = {fromField:userHandle,toField:existingInterest._id};

    var result = this.db.interested_in.firstExample(interestedInObject);
    if(result == null)
    {
        result = this.db.interested_in.save(interestedInObject);
        if(result.error == true)
        {
            throw new error.GenericError('Saving user interest failed');
        }
    }
    return result;
};

exports.InterestedIn = InterestedIn;

