var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var user = require('db-interface/node/user');
var underscore = require('underscore');
var helper = require('db-interface/util/helper');
var query = require('db-interface/util/query');
var favourited = require('db-interface/edge/favourited');
var voted = require('db-interface/edge/voted');
var interested_in = require('db-interface/edge/interested_in');
var in_location = require('db-interface/edge/in_location');
var confirmer = require('db-interface/edge/confirmed').Confirmed;
var location = require('db-interface/node/location');
var model_common = require('model-common');

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

    function matchActivitiesNearLocation(user_latitude, user_longitude, activity_list, num_activities_requested){
        //Need to create a temporary collection for a list of activity ids and their most relevant location to user Geo indexing.
        //Our activities
        db._drop('activities_with_location');
        db._create('activities_with_location');
        var old_index;
        var latitude;
        var longitude;

        db.activities_with_location.ensureGeoIndex("loc");

        var Confirmer = new confirmer();
        var confirmedLocation =  new model_common.Location();
        var activity_location;

        //Figure out the most relevant location for a given activity
        for(var i = 0; i < activity_list.length; i++) {
            old_index = i;
            confirmedLocation = Confirmer.getConfirmedLocation("activity/" + activity_list[i].activity_id);
            if(confirmedLocation != null)
            {
                activity_location = confirmedLocation;
            }
            else
            {
                activity_location = (new voted.Voted()).getMostVotedLocation("activity/" + activity_list[i].activity_id);
            }
            if(activity_location != null) {
                latitude = activity_location.latitude;
                longitude = activity_location.longitude;

                db.activities_with_location.save({
                    "activity_id": activity_list[i].activity_id,
                    "old_index": i,
                    "loc": [latitude, longitude]
                });
            }
        }

        var activities_sorted_by_loc = db.activities_with_location.near(user_latitude, user_longitude).limit(num_activities_requested).toArray();
        var sorted_activities = [];
        for(var i = 0; i < activities_sorted_by_loc.length; i++) {
            sorted_activities[i] = activity_list[activities_sorted_by_loc[i].old_index];
        }

        return sorted_activities;
    }

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

    //CURRENTLY NOT USED! Might be useful in the future. Should we delete?
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

    //This is the haversine formula.
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    function getLocationScore(current_user_handle, activity_handle){
        var location_score;
        var activity_location;
        var Confirmer = new confirmer();
        var confirmedLocation =  new model_common.Location();
        var distance;
        confirmedLocation = Confirmer.getConfirmedLocation(activity_handle);
        if(confirmedLocation != null)
        {
            activity_location = confirmedLocation;
        }
        else
        {
            activity_location = (new voted.Voted()).getMostVotedLocation(activity_handle);
        }

        var Location = new location.Location();
        var user_location = (new in_location.InLocation()).getUserLocation(current_user_handle);

        distance = getDistanceFromLatLonInKm(user_location[Location.LATITUDE_FIELD], user_location[Location.LONGITUDE_FIELD], activity_location.latitude, activity_location.longitude);

        //If activity location is exactly the same place as user location, we will get a 0 but we can't divide by 0
        //so set it to a really small number.
        if(distance == 0)
        {
            distance = 0.000001;
        }
        //Doing this to make sure if activity location is closer, it should have a higher score.
        location_score = 1/(distance);
        return location_score;
    };

    function getTimeScore(reference_time, activity_handle){
        var time_score;
        var activity_time;
        var Confirmer = new confirmer();
        var confirmedTime =  new model_common.Time();
        confirmedTime = Confirmer.getConfirmedTime(activity_handle);
        if(confirmedTime != null)
        {
            activity_time = confirmedTime.start;
        }
        else
        {
            activity_time = (new voted.Voted()).getMostVotedSuggestedFutureTime(activity_handle, reference_time);
        }
        var time_difference = activity_time - reference_time;
        //If activity time is exactly the same place as reference time, we will get a 0 but we can't divide by 0
        //so set it to a really small number.
        if(time_difference == 0)
        {
            time_difference = 0.000001;
        }
        //Doing this to make sure if activity_time is happening first, it should have a higher score.
        time_score = 1/(time_difference);
        return time_score;
    };

    function getSocialProximityScore(current_user_handle, activity_handle){
        var social_score;
        //Only favourites for now
        social_score = (new favourited.Favourited()).getNumberOfFavouritesInActivity(current_user_handle, activity_handle);
        return social_score;
    };

    function getInterestScore(current_user_handle, activity_handle){
        var interest_score;
        interest_score = (new interested_in.InterestedIn()).getNumberOfInterestsInActivity(current_user_handle, activity_handle);
        return interest_score;
    };

    function normalizeGivenScores(score_array){
        var min_score = Math.min.apply(null, score_array);
        var max_score = Math.max.apply(null, score_array);

        //Normalize each value of the score array
        for (var i = 0; i < score_array.length; i++) {
            if(min_score == max_score)
                score_array[i] = 0.5;
            else{
                score_array[i] = (score_array[i] - min_score)/(max_score - min_score);
            }
        }
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
        var reference_time = query.getDateNow(); //Reference time to be used for time score.
        var interest_weight = 5; //Can be changed later on or can be user modifiable.
        var social_weight = 2; //Can be changed later on or can be user modifiable.
        var time_weight = 2; //Can be changed later on or can be user modifiable.
        var location_weight = 3; //Can be changed later on or can be user modifiable.
        var time_scores = [];
        var interest_scores = [];
        var social_proximity_scores = [];
        var location_scores = [];

        //First step is to figure out the list of time scores, interest scores, and social proximity scores. Can't build the activity list
        //with scores right away because the individual scores needs to be normalized after obtaining all of them before using them to
        //calculate match scores.
        for(var i = 0; i < activity_list.length; i++) {
            //Get interest score
            if(by_interest) {
                interest_scores.push(getInterestScore(current_user_handle, "activity/" + activity_list[i].activity_id));
            }
            //Get social proximity score
            if(by_social_proximity) {
                social_proximity_scores.push(getSocialProximityScore(current_user_handle, "activity/" + activity_list[i].activity_id));
            }
            //Get geo proximity score
            if(by_location) {
                location_scores.push(getLocationScore(current_user_handle, "activity/" + activity_list[i].activity_id));
            }
            //Get time score
            if(by_time) {
                time_scores.push(getTimeScore(reference_time, "activity/" + activity_list[i].activity_id));
            }
        }

        //Normalize the score arrays we obtained
        if(by_interest) {
            normalizeGivenScores(interest_scores);
        }
        if(by_social_proximity) {
            normalizeGivenScores(social_proximity_scores);
        }
        if(by_location) {
            normalizeGivenScores(location_scores);
        }
        if(by_time) {
            normalizeGivenScores(time_scores);
        }

        //Figure out the total match score based on wanted parameters and normalized scores. Can remove all these booleans if we just want to do all of
        //them automatically and the new inputs will be weights for each wanted parameters than booleans.
        for(var i = 0; i < activity_list.length; i++) {
            match_score = 0; //Start with 0 match score
            old_index = i;
            //Add interest score in match score.
            if(by_interest)
            {
                match_score += interest_weight*interest_scores[i];
            }
            //Add social proximity score in match score.
            if(by_social_proximity)
            {
                match_score += social_weight*social_proximity_scores[i];
            }
            //Add geo proximity score in match score.
            if(by_location)
            {
                match_score += location_weight*location_scores[i];
            }
            //Add time score in match score.
            if(by_time)
            {
                match_score += time_weight*time_scores[i];
            }
            activity_list_with_score.push({
                "activity_id": activity_list[i].activity_id,
                "old_index": i,
                "match_score": match_score
            });
        }
        var sorted_activities = [];
        sorted_activities = rankActivitiesBasedOnMatchScore(activity_list, activity_list_with_score);
        return sorted_activities;
    };

    //CURRENTLY NOT USED! Might be useful in the future. Should we delete?
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

    function getFutureJoinedActivities(userId){
        var activities = [];
        var activity_list = query.getJoinedActivities(userId, true, false);
        var activity_list_length = activity_list.length;

        for (var i = 0; i < activity_list_length; i++) {
            var activity_node = activity_list[i];
            addIfNotExist(activity_node, activities);
        }
        return activities;
    };

    function appendActivitiesList(activities, added_activities, max_activities_length, joined_activities){
        for(var j = 0; j < added_activities.length; j++)
        {
            var activity_node = db.activity.document(added_activities[j].activity_id);
            //Check first if it is already a joined activity. If it is, don't add.
            var isJoined = joined_activities.some(function (el) {
                return el.activity_id === activity_node._key;
            });
            if (!isJoined) {
                //Only push to user_activities_array if we didn't meet the num_activities requirement yet
                if (activities.length < max_activities_length) {
                    addIfNotExist(activity_node, activities);
                }
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
        var by_location = request.params('by_location');
        var activities = [];
        //This is for the interest tab
        if(by_interest) {
            activities = matchActivitiesWithUserInterests(user_object, num_activities_requested);
            //Calculate the match score with respect to interest and time for all of the qualified events and rank them accordingly.
            activities = calculateMatchScoreAndSort(user_object._id, activities, true, false, false, true);
        }
        //This is for the Near Me tab
        else if(by_location) {
            var temp_activities = [];
            temp_activities = matchFutureActivities();
            var Location = new location.Location();
            var user_location = (new in_location.InLocation()).getUserLocation(user_object._id);
            //matchActivitiesNearLocation already sorts from nearest to farthest.
            activities = matchActivitiesNearLocation(user_location[Location.LATITUDE_FIELD], user_location[Location.LONGITUDE_FIELD], temp_activities, num_activities_requested);
        }
        //This is for the main page tab. More factors will be incorporated here in the future to decide which activities to return
        else{
            var temp_activities = [];
            var joined_activities = [];
            //Grab joined_activities
            joined_activities = getFutureJoinedActivities(user_object._id);
            //Grab all future events(this is the only hard filter for now. Later on it will be all future events within a certain radius in x km)
            temp_activities = matchFutureActivities();
            //Calculate the match score for all of the qualified events and rank them accordingly.
            temp_activities = calculateMatchScoreAndSort(user_object._id, temp_activities, true, true, true, true);
            //Fill up activities with ranked activities from temp_activities until we reach num_activities_requested amount
            appendActivitiesList(activities, temp_activities, num_activities_requested, joined_activities);
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
    }).queryParam("by_location", {
        type: joi.boolean(),
        required: false,
        description: 'If activities should be filtered by user location (false by default). by_interest must be false if this is true.'
    }).queryParam("priority_offset", {
      type: joi.number().integer(),
      required: false,
      description: 'NOT USABLE YET! The priority level to start at (zero by default). To be used when updating activity list with new activities and the first priority_offset number of activities should be skipped.'
    }).onlyIfAuthenticated();
}());
