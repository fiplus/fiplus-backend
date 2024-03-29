var db = require('org/arangodb').db;
var error = require('error');
var is = require('db-interface/edge/is');

/**
* Constructs a suggestion db interface object
* @constructor
*/
var Suggestion = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'suggestion';
};

/**
 * Add a time suggestion
 */
Suggestion.prototype.saveTimeSuggestion = function(start_time, end_time)
{
    var result;

    // Every created suggestion is unique
    result = this.db.suggestion.save({});
    if(result.error == true) {
        throw new error.GenericError('Saving time suggestion failed.');
    }

    var is_edge = (new is.Is()).saveIsTimeEdge(result._id, start_time, end_time);

    return result;
};

/**
 * Add a location suggestion
 */
Suggestion.prototype.saveLocationSuggestion = function(latitude, longitude, address)
{
    var result;

    // Every created suggestion is unique
    result = this.db.suggestion.save({});
    if(result.error == true) {
        throw new error.GenericError('Saving location suggestion failed.');
    }

    var is_edge = (new is.Is()).saveIsLocationEdge(result._id, latitude, longitude, address);

    return result;
};

exports.Suggestion = Suggestion;