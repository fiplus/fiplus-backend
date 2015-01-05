var db = require('org/arangodb').db;
var error = require('./error');

var Participated = new function()
{
    this.db = db;
    this.COLLECTION_NAME = 'participated';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

Participated.prototype.setUserParticipatedInActivity = function(userHandle, activityHandle)
{
    var participatedObject = {};
    participatedObject[this.FROM_FIELD] = userHandle;
    participatedObject[this.TO_FIELD] = activityHandle;

    var result = this.db.participated.firstExample(participatedObject);
    if(result == null)
    {
        result = this.db.participated.save(userHandle, activityHandle, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving user participated in activity failed.');
        }
    }
    return result;
};

exports.Participated = Participated;