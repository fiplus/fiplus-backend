var db = require('org/arangodb').db;
var error = require('error');

/**
 * Constructs a location db interface object
 * @constructor
 */
var Location = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'location';
    this.LATITUDE_FIELD = 'latitude';
    this.LONGITUDE_FIELD = 'longitude';
};

/**
 * Add a unique location to the collection. Return the added location node.
 * If there is a location node associated to the given latitude and longitude, it returns that.
 */
Location.prototype.saveLocation = function(latitude, longitude)
{
    var locationObject = {};
    locationObject[this.LATITUDE_FIELD] = latitude;
    locationObject[this.LONGITUDE_FIELD] = longitude;
    var result;

    result = this.db.location.firstExample(locationObject);
    if(result == null)
    {
        result = this.db.location.save(locationObject);
        if(result.error == true)
        {
            throw new error.GenericError('Saving ' + latitude + ' and ' + longitude + ' failed');
        }
    }
    return result;
};

exports.Location = Location;