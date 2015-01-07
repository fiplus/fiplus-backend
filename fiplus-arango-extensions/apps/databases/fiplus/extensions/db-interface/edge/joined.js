var db = require('org/arangodb').db;
var error = require('error');
var activity = require('db-interface/node/activity').Activity;
var user = require('db-interface/node/user').User;

/**
 * Constructs a joined db interface object
 * @constructor
 */
var Joined = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'joined';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

Joined.prototype.setUserJoinedActivity = function(userHandle, activityHandle)
{
    var Activity = new activity();

    (new user()).exists(userHandle);
    Activity.exists(activityHandle);

    if(Activity.activityFull(activityHandle))
    {
        throw new error.NotAllowedError('Activity is full. Joining is');
    }

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