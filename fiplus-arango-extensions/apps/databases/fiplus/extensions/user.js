var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;


var UserModel = foxx.Model.extend({
    schema: {
        email: joi.string().email()
    }
});

(function() {
    "use strict";

    var controller = new foxx.Controller(applicationContext);
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
}());
