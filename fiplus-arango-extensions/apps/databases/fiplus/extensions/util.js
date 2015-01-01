var db = require("org/arangodb").db;
var errors = require('errors');

var linkActivityWithInterest = function(activityHandle, interestText)
{
    if(!db.activity.exists(activityHandle))
    {
        throw new errors.NotFoundError('Activity');
    }

    var interestHandle = db.interest.firstExample({'name':interestText});

    if(interestHandle == null)
    {
        interestHandle = db.interest.save({'name':interestText});
    }

    var taggedEdge = db.tagged.firstExample({_from:activityHandle, _to:interestHandle._id});
    if(taggedEdge == null)
    {
        db.tagged.save(activityHandle, interestHandle, {});
    }
    else
    {
        throw new errors.NotAllowedError('Duplicate tags');
    }
};

exports.linkActivityWithInterest = linkActivityWithInterest;
