var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var error = require('error');
var tag = require('db-interface/edge/tagged');

(function() {
    "use strict";

    var EmptyBody = foxx.Model.extend({
        schema: {
        }
    });

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

    var ActivityModel = foxx.Model.extend({
        schema: {
            name: joi.string(),
            description: joi.string(),
            tagged_interests: joi.array()
        }
    });

    controller.post('/', function(req, res) {

    }).bodyParam('Activity', {
        type: ActivityModel
    });

    var IcebreakerAnswerModel = foxx.Model.extend({
        schema: {
            activity_id: joi.string(),
            user_id: joi.string(),
            answer: joi.string()
        }
    });

    controller.post('/icebreaker/answer', function(req, res) {

    }).bodyParam('Answer', {
        type: IcebreakerAnswerModel
    });

    var IcebreakerModel = foxx.Model.extend({
        schema: {
            activity_id: joi.string(),
            question: joi.string(),
            answer: joi.string()
        }
    });

    controller.put('/icebreaker', function(req, res) {

    }).bodyParam('Icebreaker', {
        type: IcebreakerModel
    });

    controller.put('/:activity_id/user/:user_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to join'
    }).pathParam('user_id', {
        type: joi.string(),
        description: 'User id to add to activity'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });

    controller.delete('/:activity_id/user/:user_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to remove user from'
    }).pathParam('user_id', {
        type: joi.string(),
        description: 'The user to remove from activity'
    });

    var TimeModel = foxx.Model.extend({
       schema: {
           start: joi.number().integer(),
           end: joi.number().integer()
       }
    });

    controller.put('/:activity_id/time', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string()
    }).bodyParam('Time', {
        type: TimeModel
    });

    controller.post('/:activity_id/time/:time_id/user/:user_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to confirm for'
    }).pathParam('time_id', {
        type: joi.string(),
        description: 'The time to confirm for'
    }).pathParam('user_id', {
        type: joi.string(),
        description: 'The user that is confirming'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });

    var LocationModel = foxx.Model.extend({
        schema: {
            activity_id: joi.string(),
            latitude: joi.number(),
            longitude: joi.number()
        }
    });

    controller.put('/location', function(req, res) {

    }).bodyParam('Location', {
        type: LocationModel
    });

    controller.post('/:activity_id/location/:location_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to confirm location for'
    }).pathParam('location_id', {
        type: joi.string(),
        description: 'The location to confirm for'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });

    var CommentModel = foxx.Model.extend({
       schema: {
           activity_id: joi.string(),
           user_id: joi.string(),
           comment: joi.string()
       }
    });

    controller.put('/comment', function(req, res) {

    }).bodyParam('Comment', {
        type: CommentModel
    });

    var ReportModel = foxx.Model.extend({
       schema: {
           reported_user_id: joi.string(),
           reported_comment_id: joi.string()
       }
    });

    controller.put('/report', function(req, res) {

    }).bodyParam('Report', {
        type: ReportModel
    });

    controller.put('/:activityid/interest/:interest', function(request, response){
        var activityHandle = 'activity/' + request.params('activityid');
        var interest = request.params('interest');

        (new tag.Tagged()).tagActivityWithInterest(activityHandle, interest);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'Activity being tagged'
    }).pathParam('interest', {
        type: joi.string(),
        description: 'The interest text'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });

}());
