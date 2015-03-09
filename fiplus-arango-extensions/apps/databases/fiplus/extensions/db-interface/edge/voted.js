var db = require('org/arangodb').db;
var error = require('error');
var suggested = require('db-interface/edge/suggested');
var model_common = require('model-common');



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

    // Requires user to be joined before voting
    var suggestedExample = {};
    suggestedExample._to = suggestionId;
    var suggested = db.suggested.firstExample(suggestedExample);
    if(suggested)
    {
        var joinedExample = {};
        joinedExample._from = userId;
        joinedExample._to = suggested._from;
        var joined = db.joined.firstExample(joinedExample);
        if(!joined)
        {
            throw new error.UnauthorizedError('Voting for event user not joined to');
        }
    }
    else
    {
        throw new error.GenericError('Suggestion id does not have corresponding suggested edge');
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

Voted.prototype.getVotersId = function(suggestionId) {
    var voters = [];
    var voters_array = db.voted.inEdges(suggestionId);

    for (var i = 0; i < voters_array.length; i++) {
        voters.push(this.db.user.document(voters_array[i]._from)._key);
    }
    return voters;
};

//Returns the most voted suggested future time. If there is a tie, the suggestion that will happen first will be returned.
Voted.prototype.getMostVotedSuggestedFutureTime = function(activityHandle, reference_time)
{
    var suggested_times = [];
    var most_voted_time;
    var current_max_vote_count;
    suggested_times = (new suggested.Suggested()).getSuggestedTimes(activityHandle);
    var is_future_time_found = false;
    //First step is to find the first future time, need to ignore past time suggestions.
    //First future time will be the first value of most_voted_time then go from there.
    for (var i = 0; i < suggested_times.length; i++)
    {
        //We only care about non-stale suggestions
        if(suggested_times[i].start > reference_time)
        {
            if(!is_future_time_found)
            {
                is_future_time_found = true;
                most_voted_time = suggested_times[i].start;
                current_max_vote_count = this.getNumberOfUserVotes("suggestion/" + suggested_times[i].suggestion_id);
            }
            //If current suggested time got more votes or got the same votes but earlier time, replace the most_voted_time with it.
            else if((this.getNumberOfUserVotes("suggestion/" + suggested_times[i].suggestion_id) > current_max_vote_count) ||((this.getNumberOfUserVotes("suggestion/" + suggested_times[i].suggestion_id) == current_max_vote_count) && suggested_times[i].start < most_voted_time))
            {
                current_max_vote_count = this.getNumberOfUserVotes("suggestion/" + suggested_times[i].suggestion_id);
                most_voted_time = suggested_times[i].start;
            }
        }
    }
    return most_voted_time;
};

exports.Voted = Voted;