var db = require('org/arangodb').db;
var error = require('error');

/**
 * Constructs an interest db interface object
 * @constructor
 */
var Interest = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'interest';

    this.NAME_FIELD = 'name';
};

Interest.prototype.getInterestsWithPrefix = function(prefix)
{
    return this.db.interest.fulltext(this.NAME_FIELD, "prefix:" + prefix).toArray();
};

Interest.prototype.getInterestWithText = function(interestText)
{
    var example = {};
    example[this.NAME_FIELD] = interestText;
    return this.db.interest.firstExample(example);
};

Interest.prototype.exists = function(interest_id) {
    if(!this.db.interest.exists(interest_id)) {
        throw new error.NotFoundError("Interest " + interest_id);
    }
    return true;
};

Interest.prototype.getInterest = function(interest_id)
{
    this.exists(interest_id);
    return this.db.interest.document(interest_id)[this.NAME_FIELD];
};

Interest.prototype.getAllInterests = function()
{
    return this.db.interest.toArray();
};

Interest.prototype.saveInterestToDb = function(name)
{
    var interestObject = {};

    // Desired format for interest is first letter capitalized
    interestObject[this.NAME_FIELD] = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();;

    // Returns the existing (case-insensitive) interest if any; If no matches then this line returns null
    var result = this.db.interest.fulltext(this.NAME_FIELD, "complete:" + name).toArray()[0];
    if(result == null)
    {
        result = this.db.interest.save(interestObject);
        if(result.error == true)
        {
            throw new error.GenericError('Saving ' + name + ' failed.');
        }
    }
    return result;
};

exports.Interest = Interest;