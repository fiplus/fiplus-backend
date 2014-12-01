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
            profile_pic: joi.valid('jpg', 'png'),
            age: joi.number(),
            gender: joi.string(),
            lat: joi.number(),
            long: joi.number(),
            location_proximity_setting: joi.boolean(),
            start_year_availability: joi.number(),
            start_month_availability: joi.number(),
            start_day_availability: joi.number(),
            start_hour_availability: joi.number(),
            end_year_availability: joi.number(),
            end_month_availability: joi.number(),
            end_day_availability: joi.number(),
            end_hour_availability: joi.number(),
            tagged_interests: joi.array()
        }
    });

    controller.put("/profile", function (req, res) {
        //stub
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
