var db = require('org/arangodb').db;
var error = require('error');
var location = require('db-interface/node/location').Location;


/**
 * Constructs an in_location db interface object
 * @constructor
 */
var InLocation = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'in_location';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
};

/**
 * Creating an in_location edge between a user and location.
 */
InLocation.prototype.saveInLocationEdge = function(user_id, latitude, longitude)
{
    var locationApi = new location.Location();
    var location_node = locationApi.saveLocation(latitude, longitude);
    var result;

    //Only allow one in_location edge per user.
    var example = {};
    example[this.FROM_FIELD] = user_id;
    if(this.db.in_location.firstExample(example) == null)
    {
        result = this.db.in_location.save(user_id, location_node._id, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving user location ' + location_node + ' failed.');
        }
    }
    else
    {
        throw new error.NotAllowedError('Multiple in_location edges for user ' + user_id);
    }
    return result;
};

/**
 * Updating the location of a user.
 */
InLocation.prototype.updateInLocationEdge = function(in_location_id, user_id, latitude, longitude)
{
    var result;

    var location = (new location.Location()).saveLocation(latitude, longitude);
    var in_location_object = {};
    in_location_object[this.FROM_FIELD] = user_id;
    in_location_object[this.TO_FIELD] = location._id;

    // _from and _to are immutable once saved, so need to delete and save
    result = this.db.in_location.removeByExample(in_location_object);
    if(result.error == true)
    {
        throw new error.GenericError('Location update for ' + user_id + ' failed.');
    }

    result = this.db.in_location.save(user_id, location._id, {});
    if(result.error == true)
    {
        throw new error.GenericError('Location update for ' + user_id + ' failed.');
    }

    return result;
};

/**
 * Get the location of a user.
 */
InLocation.prototype.getUserLocation = function(user_id)
{
    var userlocation_id = this.db.in_location.outEdges(user_id)[0]._to;
    var Location = new location();
    var userlocation_node = Location.get(userlocation_id);
    return userlocation_node;
};

exports.InLocation = InLocation;