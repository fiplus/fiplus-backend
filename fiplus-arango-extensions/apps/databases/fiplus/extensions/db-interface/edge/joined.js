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
    this.GET_JOINER_MAX = 50;
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

Joined.prototype.getNumJoiners = function(activity_id)
{
    return this.db.joined.edges(activity_id).length;
}

Joined.prototype.getJoiners = function(activity_id, maximum)
{
    if(maximum == null) {
        maximum = this.GET_JOINER_MAX;
    }
    var joiners = [];
    var num_joiners = this.getNumJoiners(activity_id);
    var joined_array = this.db.joined.inEdges(activity_id);
    var limit = (num_joiners <= maximum)? num_joiners: maximum;

    for(var i = 0; i < limit; i++) {
        joiners.push(this.db.user.document(joined_array[i]._from)._key);
    }
    return joiners;
}

exports.Joined = Joined;