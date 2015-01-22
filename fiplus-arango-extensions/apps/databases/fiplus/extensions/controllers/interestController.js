var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var interest = require('db-interface/node/interest');

(function () {
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
            return {
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
     * getInterestsWithInput
     */
    controller.get("/", function(request, response) {
        var input = request.params("input");
        var interestApi = new interest.Interest();

        var results;
        if(input != null)
        {
            results = interestApi.getInterestsWithPrefix(input);
        }
        else
        {
            results = interestApi.getAllInterests();
        }

        var interests = [];
        for(var i = 0; i < results.length; i++)
        {
            interests.push(results[i]["name"]);
        }

        var jsoninterests = {};
        jsoninterests["interests"] = interests;
        response.json(jsoninterests);

    }).queryParam("input", {
        type: joi.string(),
        description: "Current interest input of the user"
    }).onlyIfAuthenticated();
}());