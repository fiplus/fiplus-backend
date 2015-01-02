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

Interest.prototype.getAllInterests = function()
{
    return this.db.interest.toArray();
};

Interest.prototype.saveInterestToDb = function(name)
{
    var nameField = this.NAME_FIELD;
    var interestObject = {nameField:name};
    var result;
    if(!this.db.interest.firstExample(interestObject) != null)
    {
        result = this.db.interest.save(interestObject);
        if(result.error == true)
        {
            throw new error.GenericError('Saving ' + name + ' failed.');
        }
    }
    else
    {
        throw new error.NotAllowedError('Duplicate interests');
    }
    return result;
};

exports.Interest = Interest;