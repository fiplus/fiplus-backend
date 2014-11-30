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

}());
