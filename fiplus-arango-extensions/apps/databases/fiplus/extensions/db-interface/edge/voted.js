var db = require('org/arangodb').db;
var error = require('error');

/**
 * Constructs a voted db interface object
 * @constructor
 */
var Voted = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'voted';
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

// deletes all the user's votes for an activity, e.g. when the user unjoins the activity
Voted.prototype.deleteAllUserVotesForActivity = function(userId, activityId)
{
    var _this = this;
    if(!db.activity.exists(activityId))
    {
        throw new error.NotFoundError('Activity not found')
    }

    db.suggested.outEdges(activityId).forEach(function(edge) {
        _this.deleteUserVote(userId, edge._to);
    });
};

Voted.prototype.deleteUserVote = function(userId, suggestionId)
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
    var result = db.voted.removeByExample(example);
    if(result.error == true)
    {
        throw new error.GenericError('vote edge removal for ' + userId + ' failed.');
    }
    return result;
};

Voted.prototype.getNumberOfUserVotes = function(suggestionId)
{
    var vote_count = 0;
    var votes = db.voted.inEdges(suggestionId);
    if(votes != null)
    {
        vote_count = votes.length;
    }
    return vote_count;
};

Voted.prototype.getVotersId = function(suggestionId)
{
    var voters = [];
    var voters_array = db.voted.inEdges(suggestionId);

    for(var i = 0; i < voters_array.length; i++) {
        voters.push(this.db.user.document(voters_array[i]._from)._key);
    }
    return voters;
};

exports.Voted = Voted;