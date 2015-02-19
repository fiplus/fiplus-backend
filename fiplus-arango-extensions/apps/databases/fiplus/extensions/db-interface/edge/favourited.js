var db = require('org/arangodb').db;
var error = require('error');

/**
 * Constructs a favourited db interface object
 * @constructor
 */
var Favourited = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'favourited';
    this.FROM_FIELD = '_from';
    this.TO_FIELD = '_to';
    this.GET_FAVOURITES_MAX = 50;
};

Favourited.prototype.addFavourite = function(currentUserHandle, targetUserHandle)
{
    var favouritedObject = {};
    favouritedObject[this.FROM_FIELD] = currentUserHandle;
    favouritedObject[this.TO_FIELD] = targetUserHandle;

    var result = this.db.favourited.firstExample(favouritedObject);
    if(result == null)
    {
        result = this.db.favourited.save(currentUserHandle, targetUserHandle, {});
        if(result.error == true)
        {
            throw new error.GenericError('Saving user favourite failed');
        }
    }
    return result;
};

Favourited.prototype.getNumFavourites = function(currentUserHandle)
{
    return this.db.favourited.edges(currentUserHandle).length;
}

Favourited.prototype.getUserFavourites = function(currentUserHandle, maximum)
{
    if(maximum == null) {
        maximum = this.GET_FAVOURITES_MAX;
    }

    var userfavourites = [];
    var num_favourites = this.getNumFavourites(currentUserHandle);
    var favourites_array = this.db.favourited.outEdges(currentUserHandle);
    var limit = (num_favourites <= maximum)? num_favourites: maximum;


    for(var i = 0; i < limit; i++) {
        userfavourites.push(this.db.user.document(favourites_array[i]._to)._key);
    }
    return userfavourites;
};


Favourited.prototype.deleteFavourite = function(currentUserHandle, targetUserHandle)
{
    var favouritedObject = {};
    favouritedObject[this.FROM_FIELD] = currentUserHandle;
    favouritedObject[this.TO_FIELD] = targetUserHandle;
    result = this.db.favourited.removeByExample(favouritedObject);
    if(result.error == true)
    {
        throw new error.GenericError('favourited edge removal for ' + currentUserHandle + ' failed.');
    }
};

exports.Favourited = Favourited;

