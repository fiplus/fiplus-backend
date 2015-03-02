var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var user = require('db-interface/node/user');
var underscore = require('underscore');
var helper = require('db-interface/util/helper');
var query = require('db-interface/util/query');
var favourited = require('db-interface/edge/favourited');
var interested_in = require('db-interface/edge/interested_in');
var console = require('console');

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

    //Returns true if activity_node exists in activities
    function addIfNotExist(activity_node, activities){
        var found = activities.some(function (el) {
            return el.activity_id === activity_node._key;
        });
        if (!found) {
            var act = helper.getActivity(activity_node);
            activities.push(act);
        }
    };

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
                if(activity_node != null) {
                    //Only push to user_activities_array if we didn't meet the num_activities requirement yet
                    if (activities.length < num_activities_requested) {
                        addIfNotExist(activity_node, activities);
                    }
                }
            });
        }
        return activities;
    };

    function rankActivitiesBasedOnSocialProximity(currentUserHandle, activities){
        var activity_ids_with_favourite_count = [];
        //Figure out how many user favourites there are for each activity
        for(var i = 0; i < activities.length; i++) {
            activity_ids_with_favourite_count.push({
                "activity_id": activities[i].activity_id,
                "old_index": i,
                "num_favourites": (new favourited.Favourited()).getNumberOfFavouritesInActivity(currentUserHandle, "activity/" + activities[i].activity_id)
            });

        }
        activity_ids_with_favourite_count.sort(function(a,b) {return b.num_favourites-a.num_favourites;});

        var sorted_activities = [];
        for(var i = 0; i < activity_ids_with_favourite_count.length; i++) {
            sorted_activities[i] = activities[activity_ids_with_favourite_count[i].old_index];
        }
        return sorted_activities;
    };

    function rankActivitiesBasedOnMatchScore(original_activity_list, activity_list_with_score){
        activity_list_with_score.sort(function(a,b) {return b.match_score-a.match_score;});

        var sorted_activities = [];
        for(var i = 0; i < activity_list_with_score.length; i++) {
            sorted_activities[i] = original_activity_list[activity_list_with_score[i].old_index];
        }
        return sorted_activities;
    };

    function calculateMatchScoreAndSort(current_user_handle, activity_list, by_interest, by_social_proximity, by_location, by_time){
        var activity_list_with_score = [];
        var old_index;
        var match_score;
        var interest_weight = 3; //Can be changed later on or can be user modifiable.
        var social_weight = 1; //Can be changed later on or can be user modifiable.
        //Figure out the total match score based on wanted parameters. Can remove all these booleans if we just want to do all of
        //them automatically and the new inputs will be weights for each wanted parameters than booleans.
        for(var i = 0; i < activity_list.length; i++) {
            match_score = 0; //Start with 0 match score
            old_index = i;
            //Add interest score in match score.
            if(by_interest)
            {
                match_score += interest_weight*(new interested_in.InterestedIn()).getNumberOfInterestsInActivity(current_user_handle, "activity/" + activity_list[i].activity_id);
            }
            //Add social proximity score in match score.
            if(by_social_proximity)
            {
                match_score += social_weight*(new favourited.Favourited()).getNumberOfFavouritesInActivity(current_user_handle, "activity/" + activity_list[i].activity_id);
            }
            //Add geo proximity score in match score.
            if(by_location)
            {
               //Stub
            }
            //Add time score in match score.
            if(by_time)
            {
                //Stub
            }
            activity_list_with_score.push({
                "activity_id": activity_list[i].activity_id,
                "old_index": i,
                "match_score": match_score
            });
        }
        var sorted_activities = [];
        console.log(activity_list_with_score);
        sorted_activities = rankActivitiesBasedOnMatchScore(activity_list, activity_list_with_score);
        return sorted_activities;
    };

    //Grabs all the current activities with at least 1 favourited user of user_object attending
    function matchActivitiesWithUserFavourites(user_object){
        var user_favourites_array = (new favourited.Favourited()).getUserFavouritesID(user_object._id);
        var user_favourites_array_length = user_favourites_array.length;
        var activities = [];
        var favourited_user_id;

        for (var i = 0; i < user_favourites_array_length; i++) {
            favourited_user_id = user_favourites_array[i];
            //Get available activities associated with the given favourites
            var activity_nodes = query.getJoinedActivities(favourited_user_id, true, false);
            activity_nodes.forEach(function(activity_node) {
                if(activity_node != null) {
                    var found = addIfNotExist(activity_node, activities);
                }
            });
        }

        activities = rankActivitiesBasedOnSocialProximity(user_object._id, activities);
        return activities;
    };

    function matchFutureActivities(){
        var activities = [];
        var activity_list = query.getFutureActivities();
        var activity_list_length = activity_list.length;

        for (var i = 0; i < activity_list_length; i++) {
            var activity_node = activity_list[i];
            addIfNotExist(activity_node, activities);
        }
        return activities;
    };

    function appendActivitiesList(activities, added_activities, max_activities_length){
        for(var j = 0; j < added_activities.length; j++)
        {
            var activity_node = db.activity.document(added_activities[j].activity_id);
            //Only push to user_activities_array if we didn't meet the num_activities requirement yet
            if (activities.length < max_activities_length) {
                addIfNotExist(activity_node, activities);
            }
        }
    }

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
            var temp_activities = [];
            //Grab all future events(this is the only hard filter for now. Later on it will be all future events within a certain radius in x km)
            temp_activities = matchFutureActivities();
            //Calculate the match score for all of the qualified events and rank them accordingly.
            temp_activities = calculateMatchScoreAndSort(user_object._id, temp_activities, true, true, false, false);
            //Fill up activities with ranked activities from temp_activities until we reach num_activities_requested amount
            appendActivitiesList(activities, temp_activities, num_activities_requested);
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
