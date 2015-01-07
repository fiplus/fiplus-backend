var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var model = require("model");
var error = require('error');
var user = require('db-interface/node/user');

var UserModel = foxx.Model.extend({
    schema: {
        email: joi.string().email()
    }
});

(function() {
    "use strict";
    
    var controller = new foxx.Controller(applicationContext);
    controller.allRoutes
        .errorResponse(error.NotAllowedError, error.NotAllowedError.code, 'Not Allowed', function(e) {
            return {
                error: e.message
            }
        })
        .errorResponse(error.NotFoundError, error.NotFoundError.code, 'Not Found', function(e) {
            return {
                error: e.message
            }
        })
        .errorResponse(error.GenericError, error.GenericError.code, 'Server Error', function(e) {
            return{
                error: e.message
            }
        });

    /*
     * matchActivities
     */
    controller.get('/activities', function (request, response) {
        var user_email = request.params('email');
        var num_activities_requested = request.params('num_activities');
        var user_object = (new user.User()).getUserWithEmail(user_email);
        var user_interests_array = [];
        //Get all interests of given user
        db.interested_in.outEdges(user_object._id).forEach(function(edge) {
            user_interests_array.push(edge._to);
        });
        var user_interests_array_length = user_interests_array.length;
        var activities = [];
        var interest_id;

        for (var i = 0; i < user_interests_array_length; i++) {
            interest_id = user_interests_array[i];
            //Get available activities associated with the given interests
            db.tagged.inEdges(interest_id).forEach(function (edge) {
                //Only push to user_activities_array if we didn't meet the num_activities requirement yet
                if (activities.length < num_activities_requested) {
                    activities.push(db.activity.document(edge._from));
                }
            });
        }
        var jsonactivities = {};
        jsonactivities["activities"] = activities;
        response.json(jsonactivities);

    }).queryParam("email", {
      type: joi.string(),
      required: true,
      description: 'The user email for which we are retrieving activities'
    }).queryParam("num_activities", {
      type: joi.number().integer(),
      required: true,
      description: 'The number of activities that are requested'
    }).queryParam("by_interest", {
      type: joi.boolean(),
      required: false,
      description: 'If activities should be filtered by user interest (false by default)'
    }).queryParam("priority_offset", {
      type: joi.number().integer(),
      required: false,
      description: 'The priority level to start at (zero by default). To be used when updating activity list with new activities and the first priority_offset number of activities should be skipped.'
    }).bodyParam('location', {
      type: model.LocationModel,
	  required: false,
      description: 'Location near which to search for activities'
    });
}());
