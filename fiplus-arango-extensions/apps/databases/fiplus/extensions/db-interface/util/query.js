var db = require('org/arangodb').db;

function getFutureSuggestedAndNotConfirmedActivities(returnValue, excludeCancelled)
{
    var cancelledFilter = '';
    if(excludeCancelled)
    {
        cancelledFilter = 'filter !activity.is_cancelled '
    }

    return "let s = ( " +
    "for activity in activities "+
    "filter length(for c in confirmed filter c._from == activity._id return c._to) == 0 "+
    "for suggested in suggested "+
    "filter activity._id == suggested._from "+
    "for is in is "+
    "filter suggested._to == is._from "+
    "for start in start "+
    "filter is._to == start._from "+
    "filter document(start._to).value >= date_now() "+
        cancelledFilter +
        returnValue + ") ";
}

function getFutureConfirmedActivities(returnValue, excludeCancelled)
{
    var cancelledFilter = '';
    if(excludeCancelled)
    {
        cancelledFilter = 'filter !activity.is_cancelled '
    }

    return "let c = ( " +
    "for activity in activities "+
    "for confirmed in confirmed "+
    "filter activity._id == confirmed._from "+
    "for start in start "+
    "filter start._from == confirmed._to "+
    "filter document(start._to).value >= date_now() "+
    cancelledFilter +
    returnValue + ") ";
}

//Only return past confirmed and non-cancelled joined activities for recent activities.
function getPastConfirmedActivities(returnValue)
{
    return "let c = ( " +
        "for activity in activities " +
        "for confirmed_is in graph_edges('fiplus', activity, {edgeCollectionRestriction:'confirmed', endVertexCollectionRestriction:'time_period'}) "+
        "for confirmed_end in graph_edges('fiplus', confirmed_is._to, {edgeCollectionRestriction:'end'}) "+
        "filter document(confirmed_end._to).value <= date_now() " +
        "filter !activity.is_cancelled " +
        returnValue + ") ";
}


exports.getJoinedActivities = function(userId, future, past)
{
    if(future && !past)
    {
        var returnValue = "return activity";
        return db._query(
        "let activities = (for user in user for joined in joined filter joined._from == user._id && user._id == @userId return document(joined._to)) " +
        getFutureSuggestedAndNotConfirmedActivities(returnValue, false) +
        getFutureConfirmedActivities(returnValue, false) +
        "return union_distinct(s,c)", {userId:userId}).toArray()[0];
    }
    else if(!future && past)
    {
        var returnValue = "return document(activity)";
        return db._query(
            "let activities = (for confirmed in graph_edges('fiplus', @userId, {edgeCollectionRestriction:'confirmed'}) return confirmed._to) " +
            getPastConfirmedActivities(returnValue) +
            "return c", {userId:userId}).toArray()[0];

    }
    else
    {
        return db._query("for user in user "+
        "for joined in joined "+
        "filter joined._from == user._id && user._id == @userId "+
        "return document(joined._to)", {userId:userId}).toArray();
    }
};

exports.removeExistingDeviceIds = function(deviceId) {
    db._query("for u in user " +
    "filter @deviceId in u.userData.device_ids " +
    "update {_key: u._key, userData:{device_ids:remove_value(u.userData.device_ids,@deviceId,1)}} in user", {deviceId:deviceId});
};

exports.getActivitiesWithGivenInterest = function(interestId)
{
    return db._query("return unique(for s in start "+
    "filter document(s._to).value >= date_now() "+
    "for is in is "+
    "filter is._to == s._from "+
    "for suggested in suggested "+
    "filter suggested._to == is._from "+
    "for tagged in tagged "+
    "filter tagged._from == suggested._from "+
    "filter tagged._to == @interestId && !document(tagged._from).is_cancelled "+
    "return document(tagged._from))", {interestId:interestId._id}).toArray()[0];
};

exports.getFavouritesInActivity = function(activityId, userId)
{
    return db._query("for joined in joined "+
    "for activity in activity "+
    "filter activity._id == joined._to && activity._id == @activityId "+
    "for favourited in favourited "+
    "filter favourited._from == joined._from && favourited._from == @userId "+
    "return favourited._to", {activityId:activityId,userId:userId}).toArray()[0];
};

exports.getInterestsOfUser = function(userId)
{
    return db._query("for interested_in in interested_in "+
    "filter interested_in._from == @userId return document(interested_in._to)", {userId:userId}).toArray();
};


exports.getFutureActivities = function()
{
    return db._query(
        "let activities = (for a in activity return a) " +
        getFutureSuggestedAndNotConfirmedActivities(returnValue, true) +
        getFutureConfirmedActivities(returnValue, true) +
        "return union_distinct(s,c)").toArray()[0];
};

// Returns all the confirmed and unconfirmed event attendees
exports.getAllAttendees = function(actId)
{
    return db._query(
            "return union( "+
            "(for joined in joined filter joined._to == 'activity/1' return document(joined._from)), "+
            "(for confirmed in confirmed filter confirmed._to == 'activity/1' return document(confirmed._from)))" ,
            {actId:actId}).toArray()[0];
};

exports.getDateNow = function()
{
    return db._query("return date_now()").toArray()[0];
};
