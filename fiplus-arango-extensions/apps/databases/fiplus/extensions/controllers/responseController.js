var foxx = require("org/arangodb/foxx");
var joi = require("joi");

(function() {
   'use strict';

    var controller = new foxx.Controller(applicationContext);

    var InterestArrayModel = foxx.Model.extend({
       schema: {
           interests: joi.array()
       }
    });

    /**
     * responses
     */
    controller.put('/', function(request, response) {
        // Empty as this request is only here as a placeholder for response models
    }).bodyParam('InterestResponse', {
        type: InterestArrayModel
    });
}());
