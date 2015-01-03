var db = require('org/arangodb').db;
var error = require('error');
var timestamp = require('time_stamp');

/**
 * Constructs an in_location db interface object
 * @constructor
 */
var In_location = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'in_location';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
}

/**
 * Creating an in_location edge between a user and location.
 */
In_location.prototype.saveInLocationUserEdge = function(user, location)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var in_location_object = {fromField:user._id, toField:location._id};
    //Only allow one in_location edge per user.
    if(this.db.in_location.firstExample({fromField:user._id}) == null)
    {
        result = this.db.in_location.save(in_location_object);
        if(result.error == true)
        {
            throw new error.GenericError('Saving user location ' + location + ' failed.');
        }
    }
    else
    {
        throw new error.NotAllowedError('Multiple in_location edges for user ' + user);
    }
    return result;
}

/**
 * Creating an in_location edge between an activity and location.
 */
In_location.prototype.saveInLocationActivityEdge = function(activity, location)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var in_location_object = {fromField:activity._id, toField:location._id};
    //Only allow one in_location edge per activity.
    if(this.db.in_location.firstExample({fromField:activity._id}) == null)
    {
        result = this.db.in_location.save(in_location_object);
        if(result.error == true)
        {
            throw new error.GenericError('Saving activity location ' + location + ' failed.');
        }
    }
    else
    {
        throw new error.NotAllowedError('Multiple in_location edges for activity ' + activity);
    }
    return result;
}

/**
 * Updating the location of a user.
 */
In_location.prototype.updateInLocationUserEdge = function(in_location, user, location)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var in_location_object = {fromField:user._id, toField:location._id};

    result = this.db.in_location.update(in_location._id, in_location_object);
    if(result.error == true)
    {
        throw new error.GenericError('Location update for ' + user + ' failed.');
    }

    return result;
}

/**
 * Updating the location of an activity.
 */
In_location.prototype.updateInLocationActivityEdge = function(in_location, activity, location)
{
    var fromField = this.FROM_FIELD;
    var toField = this.TO_FIELD;
    var result;

    var in_location_object = {fromField:activity._id, toField:location._id};

    result = this.db.in_location.update(in_location._id, in_location_object);
    if(result.error == true)
    {
        throw new error.GenericError('Location update for ' + activity + ' failed.');
    }

    return result;
}

exports.In_location = In_location;