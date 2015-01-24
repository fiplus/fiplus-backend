var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var model = require("model");
var error = require('error');
var user = require('db-interface/node/user');
var underscore = require('underscore');

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

    controller.activateSessions({
        sessionStorageApp: '/sessions',
        type: 'cookie',
        cookie: {
            name: 'sid',
            secret: 'Answ3rK3y?B33nz!J0ck.'
        }
    });

    var locationModel = foxx.Model.extend({
	schema: {
	    lat: joi.number(),
	    lon: joi.number()
	}
    });

    function matchActivitiesWithUserInterests(user_object, num_activities_requested){
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
                var addActivity = db.activity.document(edge._from);
                if (activities.length < num_activities_requested && underscore.findWhere(activities, addActivity) == null) {
                    // Mobile apps needs the _key to be retrievable by the sdk
                    addActivity.activity_id = addActivity._key;
                    activities.push(addActivity);
                }
            });
        }
        return activities;
    };

    function matchDefaultActivities(num_activities_requested){
        var activities = [];
        var activity_list = db.activity.all().limit(num_activities_requested).toArray();
        var activity_list_length = activity_list.length;

        for (var i = 0; i < activity_list_length; i++) {
            var addActivity = activity_list[i];
            if (underscore.findWhere(activities, addActivity) == null) {
                // Mobile apps needs the _key to be retrievable by the sdk
                addActivity.activity_id = addActivity._key;
                activities.push(addActivity);
            }

        }
        return activities;
    };

    /*
     * matchActivities
     */
    controller.get('/activities', function (request, response) {
        var user_email = request.params('email');
        var num_activities_requested = request.params('num_activities');
        var user_object = (new user.User()).getUserWithEmail(user_email);
        var activities = [];
        if (request.session.get('uid') == user_object._id) {
            activities = matchActivitiesWithUserInterests(user_object, num_activities_requested);

            //If activities is null(i.e. there are no matches at all, just grab 'num_activities' amount
            //of activities from activities collection.
            if (activities.length == 0) {
                activities = matchDefaultActivities(num_activities_requested);
            }
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
      description: 'NOT USABLE YET! If activities should be filtered by user interest (false by default)'
    }).queryParam("priority_offset", {
      type: joi.number().integer(),
      required: false,
      description: 'NOT USABLE YET! The priority level to start at (zero by default). To be used when updating activity list with new activities and the first priority_offset number of activities should be skipped.'
    }).bodyParam('location', {
      type: model.LocationModel,
	  required: false,
      description: 'NOT USABLE YET! Location near which to search for activities'
    }).onlyIfAuthenticated();
}());
