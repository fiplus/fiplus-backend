var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;


var UserModel = foxx.Model.extend({
    schema: {
        email: joi.string().email()
    }
});

(function() {
    "use strict";
    
    var controller = new foxx.Controller(applicationContext);

    var locationModel = foxx.Model.extend({
	schema: {
	    lat: joi.number(),
	    lon: joi.number()
	}
    });

    controller.get('/event/:user_id/:num_events/:by_interest/:priority_offset', function (req, res) {

    }).pathParam('user_id', {
      type: joi.string(),
      required: true,
      description: 'The user for which we are retrieving events'
    }).pathParam('num_events', {
      type: joi.number().integer(),
      required: true,
      description: 'The number of events that are requested'
    }).pathParam('by_interest', {
      type: joi.boolean(),
      required: false,
      description: 'If events should be filtered by user interest (false by default)'
    }).pathParam('priority_offset', {
      type: joi.number().integer(),
      required: false,
      description: 'The priority level to start at (zero by default). To be used when updating event list with new events and the first priority_offest number of events should be skipped.'
    }).bodyParam('location', {
      type: locationModel,
      description: 'Location near which to search for events'
    });
}());
