var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var model = require("model");

(function() {
   'use strict';

    var controller = new foxx.Controller(applicationContext);

    /*
     * responses
     */
    controller.put('/', function(request, response) {
        // Empty as this request is only here as a placeholder for response models
    }).bodyParam('InterestResponse', {
        type: model.InterestArrayModel
    }).bodyParam('ActivitiesResponse', {
        type: model.ActivityArrayModel
    }).bodyParam('ActivityDetailResponse', {
        type: model.ActivityModel
    }).bodyParam('UserProfileDetailResponse', {
        type: model.UserProfileModel
    });
}());
