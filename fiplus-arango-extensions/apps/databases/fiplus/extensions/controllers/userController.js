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

    var UserModel = foxx.Model.extend({
        schema: {
            email: joi.string()
        }
    });

    //Register user
    controller.post("/register", function (req, res) {
        var user = req.params("User");
        var result = db.users.save({"email":user.get("email")});

        if(result.error == true) {
            res.body = "Error";
        }
        else {
            res.body = "Success";
        }
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
    })

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

    controller.put("/profile", function (req, res) {
        var userprofile = req.params("UserProfile");
        var config_success = true; //Assume success in the start. Will turn to false if one save or update fails.
        var result;
        //It is expected that this will return a valid value because the email used at this point is the email used to login
        //which is a prerequisite before a user can configure a profile. No error check needed.
        var target_user = db.users.firstExample("email", userprofile.get("email"));
        result = db.users.update(target_user._id, {"profile_pic":userprofile.get("profile_pic"), "age":userprofile.get("age"), "gender":userprofile.get("gender"), "location_proximity_setting":userprofile.get("location_proximity_setting")});
        if(result.error == true)
        {
            config_success = false;
        }

        var input_location_object = {"latitude":userprofile.get("latitude"), "longitude":userprofile.get("longitude")};
        var location_object;
        if(db.location.byExample(input_location_object).count() > 0)
        {
            location_object = db.location.firstExample(input_location_object);
        }
        else
        {
            location_object = db.location.save(input_location_object);
            if(location_object.error == true)
            {
                config_success = false;
            }
        }
        result = db.in_location.save(target_user._id, location_object._id, {});
        if(result.error == true)
        {
            config_success = false;
        }

        var start_time;
        var end_time;
        var availabilities = userprofile.get('availabilities');
        for(var i = 0; i < availabilities.length; i++)
        {
            var start = availabilities[i].start;
            start_time = db.time_stamp.firstExample({value:start});
            if(start_time == null)
            {
                start_time = db.time_stamp.save({value:start});
            }

            var end = availabilities[i].end;
             end_time = db.time_stamp.firstExample({value:end});
            if(end_time == null)
            {
                end_time = db.time_stamp.save({value:end});
            }

            var time_period = db.time_period.save({});
            db.starts.save(time_period._id, start_time._id, {});
            db.ends.save(time_period._id, end_time._id, {});

            if(time_period.error == true)
            {
                config_success = false;
            }

            result = db.is_available.save(target_user._id, time_period._id, {});
            if(result.error == true)
            {
                config_success = false;
            }
        }

        var tagged_interests = userprofile.get("tagged_interests");
        for (var i = 0; i < tagged_interests.length; i++)
        {
            var input_interest_object = {name: tagged_interests[i]};
            var interest_object;
            if(db.interest.byExample(input_interest_object).count() > 0)
            {
                interest_object = db.interest.firstExample(input_interest_object);
            }
            else
            {
                interest_object = db.interest.save(input_interest_object);
                if(interest_object.error == true)
                {
                    config_success = false;
                }
            }
            result = db.interested_in.save(target_user._id, interest_object._id, {});
            if(result.error == true)
            {
                config_success = false;
            }
        }
        if(config_success == false) {
            res.body = "Error";
        }
        else {
            res.body = "Success";
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
