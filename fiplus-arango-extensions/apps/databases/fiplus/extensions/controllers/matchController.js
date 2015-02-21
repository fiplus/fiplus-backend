var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var user = require('db-interface/node/user');
var underscore = require('underscore');
var helper = require('db-interface/util/helper');

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
                var activity_node = db.activity.document(edge._from);
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
        var activity_list = db.activity.all().limit(num_activities_requested).toArray();
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
        var by_interest = request.params('by_interest');
        var user_object = db.user.document(request.session.get('uid'));
        var activities = [];

        if(by_interest) {
            activities = matchActivitiesWithUserInterests(user_object, num_activities_requested);
        }

        //If activities is null(i.e. there are no matches at all, just grab 'num_activities' amount
        //of activities from activities collection.
        if (activities.length < num_activities_requested) {
            activities = matchDefaultActivities(num_activities_requested - activities.length);
        }

        response.json(activities);

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
      type: foxx.Model,
	  required: false,
      description: 'NOT USABLE YET! Location near which to search for activities'
    }).onlyIfAuthenticated();
}());
