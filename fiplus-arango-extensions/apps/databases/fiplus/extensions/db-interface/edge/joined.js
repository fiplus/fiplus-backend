var db = require('org/arangodb').db;
var error = require('error');

var Joined = new function()
{
    this.db = db;
    this.COLLECTION_NAME = 'joined';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

Joined.prototype.setUserJoinedActivity = function(userHandle, activityHandle)
{
    var joinedObject = {};
    joinedObject[this.FROM_FIELD] = userHandle;
    joinedObject[this.TO_FIELD] = activityHandle;
    var result = this.db.joined.firstExample(joinedObject);
    if(result == null)
    {
        result = this.db.joined.save(userHandle, activityHandle, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving user joined activity failed.');
        }
    }
    return result;
};

exports.Joined = Joined;