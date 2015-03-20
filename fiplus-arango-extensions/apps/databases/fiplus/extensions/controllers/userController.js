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
var favourited = require('db-interface/edge/favourited');
var model_common = require('model-common');
var query = require('db-interface/util/query');
var helper = require('db-interface/util/helper');
var defines = require('db-interface/util/defines');

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
        db._executeTransaction({
            collections:{
                write:defines.collectionList
            },
            params:{
                req:req,
                res:res
            },
            action:function(params) {
                var credentials = params.req.params('registration'),
                    email = credentials.get('email'),
                    User = new user();
                var password = auth.hashPassword(credentials.get('password'));
                var createdUser = User.createUser(email, {}, password);

                // Adding an 'All' interest by default enabling notifications for all events etc.
                // until they remove this from their profile. This ensures that by default the application
                // will be engaging to the user, with the ability to throttle that engagement if desired.
                (new interested_in.InterestedIn()).saveUserInterest(createdUser.get('_id'), 'All');

                params.req.session.get('sessionData').username = email;
                params.req.session.setUser(User.resolve(email));
                params.req.session.save();
            }
        });
    }).bodyParam('registration', {
        type: foxx.Model,
        description: 'Email, and Password'
    });

    /*
     * login
     */
    controller.post('/login', function(req, res) {

        db._executeTransaction({
            collections:{
                write:defines.collectionList
            },
            params:{
                req:req,
                res:res
            },
            action:function(params) {
                var credentials = params.req.params('credentials'),
                    email = credentials.get('email'),
                    User = new user();

                try {
                    var user_auth = User.getAuthWithEmail(email);
                } catch(err) {
                    // obfuscate to avoid account discovery
                    throw new error.UnauthorizedError(email, 'login');
                }
                var valid = auth.verifyPassword(
                    user_auth ? user_auth : {},
                    credentials.get('password')
                );
                if (valid) {
                    params.req.session.get('sessionData').username = email;
                    params.req.session.setUser(User.resolve(email));
                    params.req.session.save();
                } else {
                    throw new error.UnauthorizedError(email, 'login');
                }
            }
        });
    }).bodyParam('credentials', {
        type: foxx.Model,
        description: 'Email and Password'
    });

    /*
     * logout
     */
    controller.destroySession('/logout', function(req, res) {
    });
    
    controller.get('/whoami', function(req, res) {
        var user_id = req.session.get('uid');
        var ret = new model_common.WhoAmI();
        ret.user_id = user_id.substr(user_id.indexOf("/") + 1, user_id.length);
        res.json(ret);
    }).onlyIfAuthenticated();

    controller.get('/echo', function(req, res) {
        res.json(req);
    });

    controller.post('/device', function(request, response) {
        db._executeTransaction({
            collections:{
                write:defines.collectionList
            },
            params:{
                request:request,
                response:response
            },
            action:function(params) {
                var user_id = params.request.session.get('uid');
                var deviceIds = params.request.params('device_ids');

                var User = new user();
                User.updateDeviceId(user_id, deviceIds.get('current_device_id'), deviceIds.get('new_device_id'));
            }
        });
    }).bodyParam('device_ids', {
        type: foxx.Model
    }).onlyIfAuthenticated();

    //Delete user
    controller.delete("/", function (req, res) {
        //stub
    }).onlyIfAuthenticated();

    /*
     * saveUserProfile
     */
    controller.put("/profile", function (req, res) {
        db._executeTransaction({
            collections:{
                write:defines.collectionList
            },
            params:{
                req:req,
                res:res
            },
            action:function(params){
                var userprofile = params.req.params("UserProfile");
                var config_success = true; //Assume success in the start. Will turn to false if one save or update fails.
                //It is expected that this will return a valid value because the email used at this point is the email used to login
                //which is a prerequisite before a user can configure a profile. No error check needed.
                var email = userprofile.get("email");

                var User = new user();
                var target_user = User.getUserWithEmail(email);
                var uid = params.req.session.get('uid');
                if (uid != target_user._id) {
                    throw new error.UnauthorizedError(uid, "save user profile on " + email)
                }

                User.updateUsername(target_user._id, userprofile.get('username'));
                User.updateUserProfilePic(target_user._id, userprofile.get("profile_pic"));
                User.updateUserAge(target_user._id, userprofile.get("age"));
                User.updateUserGender(target_user._id, userprofile.get("gender"));
                User.updateUserLocationProximitySetting(target_user._id, userprofile.get("location_proximity_setting"));

                var location = userprofile.get("location");
                if(location != null) {
                    (new in_location.InLocation()).saveInLocationEdge(target_user._id, location.latitude, location.longitude, location.address);
                }
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
                        // Remove 'all' tag if more specific interests are added otherwise the more specific tags will have no efficacy
                        if(tagged_interests.length == 1 || tagged_interests[i] != 'All')
                        {
                            var input_interest_name = tagged_interests[i];
                            (new interested_in.InterestedIn()).saveUserInterest(target_user._id, input_interest_name);
                        }
                    }
                }
            }
        })
    }).bodyParam("UserProfile", {
        type: foxx.Model
    }).onlyIfAuthenticated();

    /*
     * GetUserProfile
     */
    controller.get('/profile/:userId', function(req, res) {
        var userId = 'user/' + req.params('userId');
        var User = new user();

        var user_node = User.getUserWithId(userId);
        var current_userId = req.session.get('uid');

        var profile = helper.getProfile(user_node, current_userId);

        res.json(profile);
    }).pathParam('userId', {
        type: joi.string(),
        description: 'The userId to get profile for'
    }).onlyIfAuthenticated();

    controller.get('/activities', function(request, response) {
        var activities = [];
        var activity_nodes = query.getJoinedActivities('user/'+request.params('userId'), request.params('future'), request.params('past'));
        activity_nodes.forEach(function(activity_node) {
            var act = helper.getActivity(activity_node, request.session.get('uid'));
            activities.push(act);
        });
        response.json(activities);
    }).queryParam('future', {
        type: joi.boolean()
    }).queryParam('past', {
        type: joi.boolean()
    }).queryParam('userId', {
        type: joi.string()
    }).onlyIfAuthenticated();

    //addFavourite
    controller.post("/favourites/:userId", function (req, res) {
        db._executeTransaction({
            collections:{
                write:defines.collectionList
            },
            params:{
                req:req,
                res:res
            },
            action:function(params) {
                var targetUserId = 'user/' + req.params('userId');
                var currentUserId = req.session.get('uid');
                (new favourited.Favourited()).addFavourite(currentUserId, targetUserId);
            }
        });
    }).pathParam('userId', {
        type: joi.string(),
        description: 'The userId to add to favourites'
    }).onlyIfAuthenticated();

    //deleteFavourite
    controller.delete("/favourites/:userId", function (req, res) {
        var targetUserId = 'user/' + req.params('userId');
        var currentUserId = req.session.get('uid');
        (new favourited.Favourited()).deleteFavourite(currentUserId, targetUserId);
    }).pathParam('userId', {
        type: joi.string(),
        description: 'The userId to remove from favourites'
    }).onlyIfAuthenticated();

    //getFavourites
    controller.get("/favourites", function (req, res) {
        var currentUserId = req.session.get('uid');
        var lim = req.params('Limit');

        var favourites = new model_common.Favourites();
        favourites.favourite_users = (new favourited.Favourited()).getUserFavouritesProfile(currentUserId, lim);

        res.json(favourites);
    }).queryParam('Limit', {
        type: joi.number().integer(),
        description: 'The maximum number of favourited users to return'
    }).onlyIfAuthenticated();
}());
