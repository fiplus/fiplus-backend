var db = require('org/arangodb').db;
var error = require('error');

/**
* Constructs an time stamp db interface object
* @constructor
*/
var SuggestedTime = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'suggested_time';
};

exports.SuggestedTime = SuggestedTime;