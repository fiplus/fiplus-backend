var db = require('org/arangodb').db;
var error = require('error');
var act = require('activity');

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
Created.prototype.saveCreatedEdge = function(user_id, activity_name, description, maximum_attendance)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var activity_node = (new act.Activity()).saveActivityToDb(activity_name, description, maximum_attendance);

    var createdObject = {fromField:user_id, toField:activity_node._id};

    var result = this.db.created.save(createdObject);
    if(result.error == true) {
        throw new error.GenericError('Saving created activity ' + activity_name + ' failed.');
    }
    return result;
};

exports.Created = Created;