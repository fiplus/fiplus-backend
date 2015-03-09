var db = require('org/arangodb').db;
var error = require('error');
var interest = require('db-interface/node/interest').Interest;
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
    if(!db.activity.exists(activityHandle))
    {
        throw new error.NotFoundError('Activity');
    }

    // Checking for interest and saving if doesn't exist
    var interestApi = new interest();
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

Tagged.prototype.getTags = function(activity_id)
{
    var Interest = new interest();
    var tags = [];
    this.db.tagged.outEdges(activity_id).forEach(function(edge) {
        var interest = Interest.getInterest(edge._to);

        // Filtering out 'All' tag as this is added automatically and it's implicit/obvious that all activities belongs to all activities
        if(interest != 'All')
        {
            tags.push(interest);
        }
    });
    return tags;
};

Tagged.prototype.getTaggedInterestsID = function(activity_id)
{
    var taggedinterests = [];
    this.db.tagged.outEdges(activity_id).forEach(function(edge) {
        taggedinterests.push(db.interest.document(edge._to)._key);
    });
    return taggedinterests;
};

exports.Tagged = Tagged;
