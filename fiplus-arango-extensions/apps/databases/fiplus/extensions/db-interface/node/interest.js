var db = require('org/arangodb').db;
var error = require('./../error');

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

Interest.prototype.getAllInterests = function()
{
    return this.db.interest.toArray();
};

Interest.prototype.saveInterestToDb = function(name)
{
    var interestObject = {};
    interestObject[this.NAME_FIELD] = name;
    var result = this.db.interest.firstExample(interestObject);
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