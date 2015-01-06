var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var interest = require('db-interface/node/interest');

(function () {
    var controller = new foxx.Controller(applicationContext);

    /**
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
    })
}());