var db = require('org/arangodb').db;
var error = require('error');
var location = require('db-interface/node/location');


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
InLocation.prototype.saveInLocationEdge = function(user_id, latitude, longitude, address)
{
    var locationApi = new location.Location();
    var location_node = locationApi.saveLocation(latitude, longitude, address);
    var result;

    //Only allow one in_location edge per user.
    var example = {};
    example[this.FROM_FIELD] = user_id;
    var user_in_location_edge = this.db.in_location.firstExample(example);
    //If there is already a location associated to a user and the user wants to update it,
    //delete the older location and save the new one
    if(user_in_location_edge != null)
    {
        this.updateInLocationEdge(user_in_location_edge._id, user_id, latitude, longitude, address);
    }
    else
    {
        result = this.db.in_location.save(user_id, location_node._id, {});
        if (result.error == true) {
            throw new error.GenericError('Saving user location ' + location_node + ' failed.');
        }
        return result;
    }
};

/**
 * Updating the location of a user.
 */
InLocation.prototype.updateInLocationEdge = function(in_location_id, user_id, latitude, longitude, address)
{
    var result;

    var location_object = (new location.Location()).saveLocation(latitude, longitude, address);
    var in_location_object = {};
    in_location_object[this.FROM_FIELD] = user_id;
    // _from and _to are immutable once saved, so need to delete and save
    result = this.db.in_location.removeByExample(in_location_object);
    if(result.error == true)
    {
        throw new error.GenericError('in_location edge removal for ' + user_id + ' failed.');
    }

    in_location_object[this.FROM_FIELD] = user_id;
    in_location_object[this.TO_FIELD] = location_object._id;

    result = this.db.in_location.save(user_id, location_object._id, {});
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
    var userlocation_node = null;
    if(this.db.in_location.outEdges(user_id)[0] != null) {
        var userlocation_id = this.db.in_location.outEdges(user_id)[0]._to;
        var Location = new location.Location();
        var userlocation_node = Location.get(userlocation_id);
    }
    return userlocation_node;
};

exports.InLocation = InLocation;