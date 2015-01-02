var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;

(function () {
    var controller = new foxx.Controller(applicationContext);

    controller.get("/", function(request, response) {
        var input = request.params("input");
        var results;
        if(input != null)
        {
            results = db.interest.fulltext("name", "prefix:" + input).toArray();
        }
        else
        {
            results = db.interest.toArray();
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