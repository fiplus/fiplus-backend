var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var user = require('db-interface/node/user');
var underscore = require('underscore');
var helper = require('db-interface/util/helper');
var query = require('db-interface/util/query');

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

    function matchActivitiesWithUserInterests(user_object, num_activities_requested){
        var user_interests_array = query.getInterestsOfUser(user_object._id);
        var user_interests_array_length = user_interests_array.length;
        var activities = [];
        var interest_id;

        for (var i = 0; i < user_interests_array_length; i++) {
            interest_id = user_interests_array[i];
            //Get available activities associated with the given interests
            var activity_nodes = query.getActivitiesWithGivenInterest(interest_id);
            activity_nodes.forEach(function(activity_node) {
                //Only push to user_activities_array if we didn't meet the num_activities requirement yet
                if (activities.length < num_activities_requested) {
                    var act = helper.getActivity(activity_node);
                    if(underscore.findWhere(activities, activity_node) == null) {
                        activities.push(act);
                    }
                }
            });
        }
        return activities;
    };

    function matchDefaultActivities(num_activities_requested){
        var activities = [];
        var activity_list = query.getDefaultActivities();
        var activity_list_length = activity_list.length;

        for (var i = 0; i < activity_list_length; i++) {
            var activity_node = activity_list[i];
            var act = helper.getActivity(activity_node);
            if (underscore.findWhere(activities, activity_node) == null) {
                activities.push(act);
            }
        }
        return activities;
    };

    /*
     * matchActivities
     */
    controller.get('/activities', function (request, response) {
        var num_activities_requested = request.params('num_activities');
        var user_object = db.user.document(request.session.get('uid'));
        var by_interest = request.params('by_interest');
        var activities = [];
        //This is for the interest tab
        if(by_interest) {
            activities = matchActivitiesWithUserInterests(user_object, num_activities_requested);
        }
        //This is for the main page tab. More factors will be incorporated here in the future to decide which activities to return
        else{
            activities = matchActivitiesWithUserInterests(user_object, num_activities_requested);
            //If activities is not yet full, just grab 'num_activities_requested - activities.length' amount
            //of activities from activities collection.
            if (activities.length < num_activities_requested) {
                activities = matchDefaultActivities(num_activities_requested - activities.length);
            }
        }
        response.json(activities);

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
      description: 'NOT USABLE YET! The priority level to start at (zero by default). To be used when updating activity list with new activities and the first priority_offset number of activities should be skipped.'
    }).bodyParam('location', {
      type: foxx.Model,
	  required: false,
      description: 'NOT USABLE YET! Location near which to search for activities'
    }).onlyIfAuthenticated();
}());
