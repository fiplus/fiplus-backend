var db = require('org/arangodb').db;
var error = require('error');
var act = require('db-interface/node/activity');


/**
 * Constructs a created db interface object
 * @constructor
 */
var Created = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'created';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

/**
 * Creating a created edge. Links user to the activity they create.
 */
Created.prototype.saveCreatedEdge = function(user_id, activity_name, description, maximum_attendance, allow_joiner_input)
{
    var result;
    var activity_node = (new act.Activity()).saveActivityToDb(activity_name, description, maximum_attendance, allow_joiner_input);
    var result = this.db.created.save(user_id, activity_node._id, {});
    if(result.error == true) {
        throw new error.GenericError('Saving created activity ' + activity_name + ' failed.');
    }
    return result;
};

Created.prototype.getCreator = function(activity_id)
{
    var creator_id = this.db.created.inEdges(activity_id)[0]._from;
    return this.db.user.document(creator_id)._key;
}

exports.Created = Created;