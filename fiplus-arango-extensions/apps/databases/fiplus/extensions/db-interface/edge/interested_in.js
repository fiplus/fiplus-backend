var db = require('org/arangodb').db;
var error = require('error');
var interest = require('db-interface/node/interest');

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
    var interestApi = new interest.Interest();
    var existingInterest = interestApi.saveInterestToDb(interestText);

    var interestedInObject = {};
    interestedInObject[this.FROM_FIELD] = userHandle;
    interestedInObject[this.TO_FIELD] = existingInterest._id;

    var result = this.db.interested_in.firstExample(interestedInObject);
    if(result == null)
    {
        result = this.db.interested_in.save(userHandle, existingInterest._id, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving user interest failed');
        }
    }
    return result;
};

InterestedIn.prototype.getUserInterests = function(userHandle)
{
    var Interest = new interest.Interest();
    var userinterests = [];
    this.db.interested_in.outEdges(userHandle).forEach(function(edge) {
        userinterests.push(Interest.getInterest(edge._to));
    });
    return userinterests;
};


InterestedIn.prototype.deleteUserInterests = function(userHandle)
{
    var interested_in_object = {};
    interested_in_object[this.FROM_FIELD] = userHandle;
    result = this.db.interested_in.removeByExample(interested_in_object);
    if(result.error == true)
    {
        throw new error.GenericError('interested_in edge removal for ' + userHandle + ' failed.');
    }
};

exports.InterestedIn = InterestedIn;

