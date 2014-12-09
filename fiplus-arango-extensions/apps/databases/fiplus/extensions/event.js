var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;

(function() {
    "use strict";

    var EmptyBody = foxx.Model.extend({
        schema: {
        }
    });

    var controller = new foxx.Controller(applicationContext);

    var EventModel = foxx.Model.extend({
        schema: {
            name: joi.string(),
            description: joi.string(),
            tagged_interests: joi.array()
        }
    });

    controller.post('/', function(req, res) {

    }).bodyParam('Event', {
        type: EventModel
    });

    var IcebreakerAnswerModel = foxx.Model.extend({
        schema: {
            event_id: joi.string(),
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
            event_id: joi.string(),
            question: joi.string(),
            answer: joi.string()
        }
    });

    controller.put('/icebreaker', function(req, res) {

    }).bodyParam('Icebreaker', {
        type: IcebreakerModel
    });

    controller.put('/:event/user/:user', function(req, res) {

    }).pathParam('event', {
        type: joi.string(),
        description: 'The event to join'
    }).pathParam('user', {
        type: joi.string(),
        description: 'User id to add to event'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });

    controller.delete('/:event_id/user/:user_id', function(req, res) {

    }).pathParam('event_id', {
        type: joi.string(),
        description: 'The event to remove user from'
    }).pathParam('user_id', {
        type: joi.string(),
        description: 'The user to remove from event'
    });

    var TimeModel = foxx.Model.extend({
       schema: {
           start: joi.number().integer(),
           end: joi.number().integer()
       }
    });

    controller.put('/:event_id/time', function(req, res) {

    }).pathParam('event_id', {
        type: joi.string()
    }).bodyParam('Time', {
        type: TimeModel
    });

    controller.post('/:event_id/time/:time_id/user/:user_id', function(req, res) {

    }).pathParam('event_id', {
        type: joi.string(),
        description: 'The event to confirm for'
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
            event_id: joi.string(),
            latitude: joi.number(),
            longitude: joi.number()
        }
    });

    controller.put('/location', function(req, res) {

    }).bodyParam('Location', {
        type: LocationModel
    });

    controller.post('/:event_id/location/:location_id', function(req, res) {

    }).pathParam('event_id', {
        type: joi.string(),
        description: 'The event to confirm location for'
    }).pathParam('location_id', {
        type: joi.string(),
        description: 'The location to confirm for'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });

    var CommentModel = foxx.Model.extend({
       schema: {
           event_id: joi.string(),
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

}());
