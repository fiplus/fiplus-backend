var foxx = require("org/arangodb/foxx");
var auth = foxx.requireApp('/credential-auth').auth;
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var user = require('db-interface/node/user').User;
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
        })
        .errorResponse(error.UnauthorizedError, error.UnauthorizedError.code, 'Authentication Error', function(e) {
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

    /*
     * registerUser
     */
    controller.post('/register', function(req, res) {
        var credentials = req.params('registration'),
            email = credentials.get('email'),
            User = new user();

        var password = auth.hashPassword(credentials.get('password'));
        User.createUser(email, {}, password);

        req.session.get('sessionData').username = email;
        req.session.setUser(User.resolve(email));
        req.session.save();
    }).bodyParam('registration', {
        type: model.CredentialModel,
        description: 'Email, and Password'
    });

    /*
     * login
     */
    controller.post('/login', function(req, res) {
        var credentials = req.params('credentials'),
            email = credentials.get('email'),
            User = new user();

        var user_auth = User.getAuthWithEmail(email);
        var valid = auth.verifyPassword(
            user_auth ? user_auth : {},
            credentials.get('password')
        );

        if (valid) {
            req.session.get('sessionData').username = email;
            req.session.setUser(User.resolve(email));
            req.session.save();

        } else {
            throw new error.UnauthorizedError(email, 'login');
        }
    }).bodyParam('credentials', {
        type: model.CredentialModel,
        description: 'Email and Password'
    });

    /*
     * logout
     */
    controller.destroySession('/logout', function(req, res) {
    });
    
    controller.get('/whoami', function(req, res) {
        var user_id = req.session.get('uid');
        var ret = new model.WhoAmIModel();
        ret.user_id = user_id.substr(user_id.indexOf("/") + 1, user_id.length);
        res.json(ret);
    }).onlyIfAuthenticated();

    controller.get('/echo', function(req, res) {
        res.json(req);
    });

    //User can view recently attended activities
    controller.get("/users/history", function (req, res) {
        //stub
    }).bodyParam("HistoryRequest", {
        type: model.HistoryRequestModel
    }).onlyIfAuthenticated();

    //Delete user
    controller.delete("/", function (req, res) {
        //stub
    }).onlyIfAuthenticated();

    /*
     * saveUserProfile
     */
    controller.put("/profile", function (req, res) {
        var userprofile = req.params("UserProfile");
        var config_success = true; //Assume success in the start. Will turn to false if one save or update fails.
        //It is expected that this will return a valid value because the email used at this point is the email used to login
        //which is a prerequisite before a user can configure a profile. No error check needed.
        var email = userprofile.get("email");

        var User = new user();
        var target_user = User.getUserWithEmail(email);
        var uid = req.session.get('uid');
        if (uid != target_user._id) {
            throw new error.UnauthorizedError(uid, "save user profile on " + email)
        }

        User.updateUsername(target_user._id, userprofile.get('username'));
        User.updateUserProfilePic(target_user._id, userprofile.get("profile_pic"));
        User.updateUserAge(target_user._id, userprofile.get("age"));
        User.updateUserGender(target_user._id, userprofile.get("gender"));
        User.updateUserLocationProximitySetting(target_user._id, userprofile.get("location_proximity_setting"));

        (new in_location.InLocation()).saveInLocationEdge(target_user._id, userprofile.get("location").latitude, userprofile.get("location").longitude);

        var start_time;
        var end_time;
        var availabilities = userprofile.get('availabilities');
        if(availabilities != null) {
            //Delete old availabilities
            (new is_available.IsAvailable()).deleteUserAvailabilities(target_user._id);
            //Add new availabilities
            for (var i = 0; i < availabilities.length; i++) {
                var start = availabilities[i].start;
                var end = availabilities[i].end;
                (new is_available.IsAvailable()).saveIsAvailableEdge(target_user._id, start, end);
            }
        }

        var tagged_interests = userprofile.get("tagged_interests");
        if(tagged_interests != null) {
            //Delete old interests
            (new interested_in.InterestedIn()).deleteUserInterests(target_user._id);
            //Add new interests
            for (var i = 0; i < tagged_interests.length; i++) {
                var input_interest_name = tagged_interests[i];
                (new interested_in.InterestedIn()).saveUserInterest(target_user._id, input_interest_name);
            }
        }
    }).bodyParam("UserProfile", {
        type: model.UserProfileModel
    }).onlyIfAuthenticated();

    /*
     * GetUserProfile
     */
    controller.get('/profile/:useremail', function(req, res) {
        var useremail = req.params('useremail');
        var userProfileDetail = new model.UserProfileModel();
        var User = new user();

        var user_node = User.getUserWithEmail(useremail);
        userProfileDetail.email = useremail;

        var user_data = user_node[User.DATA_FIELD];

        // Public information
        userProfileDetail.username = user_data[User.DATA_USERNAME_FIELD];
        userProfileDetail.profile_pic = user_data[User.DATA_PROFILE_PIC_FIELD];
        userProfileDetail.tagged_interests = (new interested_in.InterestedIn()).getUserInterests(user_node._id);

        // Private information
        if (req.session.get('uid') == user_node._id) {

            userProfileDetail.age = user_data[User.DATA_AGE_FIELD];
            userProfileDetail.gender = user_data[User.DATA_GENDER_FIELD];
            userProfileDetail.location_proximity_setting = user_data[User.DATA_LOCATION_PROXIMITY_SETTING_FIELD];

            var Location = new location.Location();
            var location_node = (new in_location.InLocation()).getUserLocation(user_node._id);
            var locationModel = new model.LocationModel();

            if(location_node != null) {
                locationModel.latitude = location_node[Location.LATITUDE_FIELD];
                locationModel.longitude = location_node[Location.LONGITUDE_FIELD];
            }

            userProfileDetail.location = locationModel;
            userProfileDetail.availabilities = (new is_available.IsAvailable()).getUserAvailabilities(user_node._id);
        }

        res.json(userProfileDetail);
    }).pathParam('useremail', {
        type: joi.string(),
        description: 'The email of user to get profile for'
    }).onlyIfAuthenticated();

    //Add Favourite
    controller.post("/favourites/:user_name", function (req, res) {
        //stub
    }).pathParam('user_name', {
        type: joi.string(),
        description: 'The user to add to favourites'
    }).bodyParam("Undocumented",{
        type: model.EmptyBody
    }).onlyIfAuthenticated();

    //Delete Favourite
    controller.delete("/favourites/:user_name", function (req, res) {
        //stub
    }).pathParam('user_name', {
        type: joi.string(),
        description: 'The user to remove from favourites'
    }).onlyIfAuthenticated();

    //Get Favourite
    controller.get("/favourites", function (req, res) {
        //stub
    }).onlyIfAuthenticated();
}());
