var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var user = require('db-interface/node/user');
var in_location = require('db-interface/edge/in_location');
var is_available = require('db-interface/edge/is_available');
var interested_in = require('db-interface/edge/interested_in');



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

    var UserModel = foxx.Model.extend({
        schema: {
            email: joi.string()
        }
    });

    //Register user
    controller.post("/register", function (req, res) {
        var user_input = req.params("User");
        (new user.User()).saveUserToDb(user_input.get("email"));

    }).bodyParam("User", {
        type: UserModel
    });

    var HistoryRequestModel = foxx.Model.extend({
        schema: {
            duration: joi.number().integer(),
            targetuser: joi.string()
        }
    });

    //User can view recently attended activities
    controller.get("/users/history", function (req, res) {
        //stub
    }).bodyParam("HistoryRequest", {
        type: HistoryRequestModel
    });

    //Delete user


    controller.delete("/", function (req, res) {
        //stub
    });

    //Edit user
    var ConfigUserModel = foxx.Model.extend({
        schema: {
            username: joi.string(),
            email: joi.string(),
            password: joi.string()
        }
    });

    controller.put("/", function (req, res) {
        //stub
    }).bodyParam("ConfigUser", {
        type: ConfigUserModel
    });

    //User configures profile/setting
    var UserProfileModel = foxx.Model.extend({
        schema: {
            email: joi.string(),
            profile_pic: joi.string(),
            age: joi.number().integer(),
            gender: joi.string(),
            latitude: joi.number(),
            longitude: joi.number(),
            location_proximity_setting: joi.boolean(),
            availabilities: joi.array(), // item type TimeModel
            tagged_interests: joi.array() // type String
        }
    });

    /*
     * saveUserProfile
     */
    controller.put("/profile", function (req, res) {
        var userprofile = req.params("UserProfile");
        var config_success = true; //Assume success in the start. Will turn to false if one save or update fails.

        //It is expected that this will return a valid value because the email used at this point is the email used to login
        //which is a prerequisite before a user can configure a profile. No error check needed.
        var target_user = (new user.User()).getUserWithEmail(userprofile.get("email"));
        (new user.User()).updateUserProfilePic(target_user._id, userprofile.get("profile_pic"));
        (new user.User()).updateUserAge(target_user._id, userprofile.get("age"));
        (new user.User()).updateUserGender(target_user._id, userprofile.get("gender"));
        (new user.User()).updateUserLocationProximitySetting(target_user._id, userprofile.get("location_proximity_setting"));

        (new in_location.InLocation()).saveInLocationEdge(target_user._id, userprofile.get("latitude"), userprofile.get("longitude"));

        var start_time;
        var end_time;
        var availabilities = userprofile.get('availabilities');
        for(var i = 0; i < availabilities.length; i++)
        {
            var start = availabilities[i].start;
            var end = availabilities[i].end;
            (new is_available.IsAvailable()).saveIsAvailableEdge(target_user._id, start, end);
        }

        var tagged_interests = userprofile.get("tagged_interests");
        for (var i = 0; i < tagged_interests.length; i++)
        {
            var input_interest_name = tagged_interests[i];
            (new interested_in.InterestedIn()).saveUserInterest(target_user._id, input_interest_name);
        }
    }).bodyParam("UserProfile", {
        type: UserProfileModel
    });


    var EmptyBody = foxx.Model.extend({
        schema: {
        }
    });
    //Add Favourite
    controller.post("/favourites/:user_name", function (req, res) {
        //stub
    }).pathParam('user_name', {
        type: joi.string(),
        description: 'The user to add to favourites'
    }).bodyParam("Undocumented",{type: EmptyBody});

    //Delete Favourite
    controller.delete("/favourites/:user_name", function (req, res) {
        //stub
    }).pathParam('user_name', {
        type: joi.string(),
        description: 'The user to remove from favourites'
    });

    //Get Favourite
    controller.get("/favourites", function (req, res) {
        //stub
    });
}());
