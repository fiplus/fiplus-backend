var db = require('org/arangodb').db;
var error = require('error');
var helper = require('db-interface/util/helper');
var query = require('db-interface/util/query');

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
    return this.db.favourited.outEdges(currentUserHandle).length;
}

Favourited.prototype.getUserFavouritesProfile = function(currentUserHandle, maximum)
{
    if(maximum == null) {
        maximum = this.GET_FAVOURITES_MAX;
    }

    var userfavourites = [];
    var num_favourites = this.getNumFavourites(currentUserHandle);
    var favourites_array = this.db.favourited.outEdges(currentUserHandle);
    var limit = (num_favourites <= maximum)? num_favourites: maximum;


    for(var i = 0; i < limit; i++) {
        userfavourites.push(helper.getProfile(this.db.user.document(favourites_array[i]._to), currentUserHandle));
    }
    return userfavourites;
};

Favourited.prototype.getUserFavouritesID = function(currentUserHandle)
{
    //Return all favourited users
    var userfavourites = [];
    var favourites_array = this.db.favourited.outEdges(currentUserHandle);
    for(var i = 0; i < favourites_array.length; i++) {
        userfavourites.push(favourites_array[i]._to);
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

Favourited.prototype.isFavourite = function(currentUserHandle, targetUserHandle)
{
    var IsFavourite = true;
    var favouritedObject = {};
    favouritedObject[this.FROM_FIELD] = currentUserHandle;
    favouritedObject[this.TO_FIELD] = targetUserHandle;

    var result = this.db.favourited.firstExample(favouritedObject);
    if(result == null)
    {
        IsFavourite = false;
    }
    return IsFavourite;
};

Favourited.prototype.getNumberOfFavouritesInActivity = function(currentUserHandle, activityHandle)
{
    var Favourites_In_Activity = query.getFavouritesInActivity(activityHandle, currentUserHandle);
    var NumFavourites = Favourites_In_Activity.length;

    return NumFavourites;
};

exports.Favourited = Favourited;

