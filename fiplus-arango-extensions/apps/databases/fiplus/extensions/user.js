var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;



(function() {
    "use strict";

    var controller = new foxx.Controller(applicationContext);

    var UserModel = foxx.Model.extend({
        schema: {
            email: joi.string().email()
        }
    });

    //Register user
    controller.post("/register", function (req, res) {
        var user = req.params("user");
        var result = db.users.save({"email":user.get("email")});

        if(result.error == true) {
            res.body = "Error";
        }
        else {
            res.body = "Success";
        }
    }).bodyParam("user", {
        type: UserModel
    });

    var HistoryRequestModel = foxx.Model.extend({
        schema: {
            duration: joi.number(),
            targetuser: joi.string()
        }
    });

    //User can view recently attended events
    controller.get("/users/history", function (req, res) {
        //stub
    }).bodyParam("historyrequest", {
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
            email: joi.string().email(),
            password: joi.string()
        }
    });

    controller.put("/", function (req, res) {
        //stub
    }).bodyParam("configuser", {
        type: ConfigUserModel
    });

    //User configures profile/setting
    var UserProfileModel = foxx.Model.extend({
        schema: {
            email: joi.string().email(),
            profile_pic: joi.valid('jpg', 'png'),
            age: joi.number(),
            gender: joi.string(),
            latitude: joi.number(),
            longitude: joi.number(),
            location_proximity_setting: joi.boolean(),
            start_time_stamp: joi.number(),
            end_time_stamp: joi.number(),
            tagged_interests: joi.array()
        }
    });

    controller.put("/profile", function (req, res) {
        var userprofile = req.params("userprofile");
        var config_success = true; //Assume success in the start. Will turn to false if one save or update fails.
        var result;
        //It is expected that this will return a valid value because the email used at this point is the email used to login
        //which is a prerequisite before a user can configure a profile. No error check needed.
        var target_user = db.users.firstExample("email", userprofile.get("email"));
        result = db.users.update(target_user._id, {"Profile pic":userprofile.get("profile_pic"), "Age":userprofile.get("age"), "Gender":userprofile.get("gender"), "Location Proximity Setting":userprofile.get("location_proximity_setting")});
        if(result.error == true)
        {
            config_success = false;
        }

        var input_location_object = {"Latitude":userprofile.get("lat"), "Longitude":userprofile.get("long")};
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

        var input_start_time_stamp_object = {"start_time_stamp":userprofile.get("start_time_stamp")};
        var start_time_stamp_object;
        if(db.time_stamp.byExample(input_start_time_stamp_object).count() > 0)
        {
            start_time_stamp_object = db.time_stamp.firstExample(input_start_time_stamp_object);
        }
        else
        {
            start_time_stamp_object = db.time_stamp.save(input_start_time_stamp_object);
            if(start_time_stamp_object.error == true)
            {
                config_success = false;
            }
        }

        var input_end_time_stamp_object = {"end_time_stamp":userprofile.get("end_time_stamp")};
        var end_time_stamp_object;
        if(db.time_stamp.byExample(input_end_time_stamp_object).count() > 0)
        {
            end_time_stamp_object = db.time_stamp.firstExample(input_end_time_stamp_object);
        }
        else
        {
            end_time_stamp_object = db.time_stamp.save(input_end_time_stamp_object);
            if(end_time_stamp_object.error == true)
            {
                config_success = false;
            }
        }

        var time_period_object = db.time_period.save({});
        if(time_period_object.error == true)
        {
            config_success = false;
        }

        result = db.starts.save(time_period_object._id, start_time_stamp_object._id, {});
        if(result.error == true)
        {
            config_success = false;
        }

        result = db.ends.save(time_period_object._id, end_time_stamp_object._id, {});
        if(result.error == true)
        {
            config_success = false;
        }

        result = db.is_available.save(target_user._id, time_period_object._id, {});
        if(result.error == true)
        {
            config_success = false;
        }

        var tagged_interests = userprofile.get("tagged_interests");
        for (var i = 0; i < tagged_interests.length; i++)
        {
            var input_interest_object = tagged_interests[i];
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
    }).bodyParam("userprofile", {
        type: UserProfileModel
    });

    //Add Favourite
    controller.post("/favourites/:user_name", function (req, res) {
        //stub
    }).pathParam('user_name', {
        type: joi.string(),
        description: 'The user to add to favourites'
    });

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
