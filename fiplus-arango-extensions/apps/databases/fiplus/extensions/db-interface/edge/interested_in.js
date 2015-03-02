var db = require('org/arangodb').db;
var error = require('error');
var interest = require('db-interface/node/interest');
var tagger = require('db-interface/edge/tagged').Tagged;

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

InterestedIn.prototype.isInterest = function(currentUserHandle, InterestHandle)
{
    var IsInterest = true;
    var interestedInObject = {};
    interestedInObject[this.FROM_FIELD] = currentUserHandle;
    interestedInObject[this.TO_FIELD] = InterestHandle;

    var result = this.db.interested_in.firstExample(interestedInObject);
    if(result == null)
    {
        IsInterest = false;
    }
    return IsInterest;
};

InterestedIn.prototype.getNumberOfInterestsInActivity = function(currentUserHandle, activityHandle)
{
    var NumInterests = 0;
    var Tagger = new tagger();
    var Tagged_Interests_Id_List = Tagger.getTaggedInterestsID(activityHandle);

    for(var i = 0; i < Tagged_Interests_Id_List.length; i++) {
        if(this.isInterest(currentUserHandle, "interest/" + Tagged_Interests_Id_List[i])) {
            NumInterests++;
        }
    }

    return NumInterests;
};

InterestedIn.prototype.deleteUserInterests = function(userHandle)
{
    var interested_in_object = {};
    interested_in_object[this.FROM_FIELD] = userHandle;
    var db = this.db;

    // removeByExample cannot occur within a user transaction (is a transaction itself and not allowed nested trans.)
    var result = this.db.interested_in.byExample(interested_in_object).toArray();
    result.forEach(function(interestedInEdge) {
        var removeResult = db.interested_in.remove(interestedInEdge);
        if(removeResult.error == true)
        {
            throw new error.GenericError('interested_in edge removal for ' + userHandle + ' failed.');
        }
    });
};

exports.InterestedIn = InterestedIn;

