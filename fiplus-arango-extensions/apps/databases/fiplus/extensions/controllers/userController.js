var foxx = require("org/arangodb/foxx");
var auth = foxx.requireApp('/credential-auth').auth;
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var user = require('db-interface/node/user');
var in_location = require('db-interface/edge/in_location');
var location = require('db-interface/node/location');
var is_available = require('db-interface/edge/is_available');
var interested_in = require('db-interface/edge/interested_in');
var model = require('model');


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
     * registerUser
     */
    controller.post('/register', function(req, res) {
        var credentials = req.params('credentials'),
            username = credentials.get('username'),
            email = credentials.get('email'),
            password = auth.hashPassword(credentials.get('password'));
        (new user.User()).saveUserToDb(username, email, password);
    }).bodyParam('credentials', {
        type: model.CredentialModel,
        description: 'Username and Password'
    });

    //User can view recently attended activities
    controller.get("/users/history", function (req, res) {
        //stub
    }).bodyParam("HistoryRequest", {
        type: model.HistoryRequestModel
    });

    //Delete user
    controller.delete("/", function (req, res) {
        //stub
    });

    controller.put("/", function (req, res) {
        //stub
    }).bodyParam("ConfigUser", {
        type: model.ConfigUserModel
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
        (new user.User()).updateUsername(target_user._id, userprofile.get('username'));
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
        type: model.UserProfileModel
    });

    /*
     * GetUserProfile
     */
    controller.get('/profile/:useremail', function(req, res) {
        var useremail = req.params('useremail');
        var userProfileDetail = new model.UserProfileModel();
        var User = new user.User();
        var user_node = User.getUserWithEmail(useremail);
        User.exists(user_node._id);
        userProfileDetail.email = useremail;
        userProfileDetail.username = user_node[User.USERNAME_FIELD];
        userProfileDetail.profile_pic = user_node[User.PROFILE_PIC_FIELD];
        userProfileDetail.age = user_node[User.AGE_FIELD];
        userProfileDetail.gender = user_node[User.GENDER_FIELD];
        var Location = new location.Location();
        var location_node = (new in_location.InLocation()).getUserLocation(user_node._id);
        userProfileDetail.latitude = location_node[Location.LATITUDE_FIELD];
        userProfileDetail.longitude = location_node[Location.LONGITUDE_FIELD];
        userProfileDetail.location_proximity_setting = user_node[User.LOCATION_PROXIMITY_SETTING_FIELD];
        userProfileDetail.availabilities = (new is_available.IsAvailable()).getUserAvailabilities(user_node._id);
        userProfileDetail.tagged_interests = (new interested_in.InterestedIn()).getUserInterests(user_node._id);

        res.json(userProfileDetail);
    }).pathParam('useremail', {
        type: joi.string(),
        description: 'The email of user to get profile for'
    });

    //Add Favourite
    controller.post("/favourites/:user_name", function (req, res) {
        //stub
    }).pathParam('user_name', {
        type: joi.string(),
        description: 'The user to add to favourites'
    }).bodyParam("Undocumented",{type: model.EmptyBody});

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
