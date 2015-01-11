var db = require('org/arangodb').db;
var error = require('error');

/**
 * Constructs a voted db interface object
 * @constructor
 */
var Voted = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'suggested';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

Voted.prototype.saveUserVote = function(userId, suggestionId)
{
    if(!db.user.exists(userId))
    {
        throw new error.NotFoundError('User')
    }

    if(!db.suggestion.exists(suggestionId))
    {
        throw new error.NotFoundError('Suggestion');
    }

    var example = {};
    example[this.FROM_FIELD] = userId;
    example[this.TO_FIELD] = suggestionId;
    var result = db.voted.firstExample(example);
    if(result == null)
    {
        result = db.voted.save(userId, suggestionId, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving user vote for suggestion failed.');
        }
    }
    return result;
};

exports.Voted = Voted;