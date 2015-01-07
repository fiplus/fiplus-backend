var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var creator = require('db-interface/edge/created').Created;
var tagger = require('db-interface/edge/tagged').Tagged;
var suggester = require('db-interface/edge/suggested').Suggested;
var joiner = require('db-interface/edge/joined').Joined;
var error = require('error');

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
            max_attendees: joi.number().integer(),
            creator: joi.string(),
            tagged_interests: joi.array(),    // format string
            suggested_times: joi.array(),     // format TimeModel
            suggested_locations: joi.array() // format LocationModel
        }
    });

    controller.post('/', function(req, res) {
        var activity = req.params('activity');

        var max = activity.get('max_attendees');
        if(max < 2) {
            throw new error.NotAllowedError("Non-group activities are ");
        }

        var creator_id = 'user/' + activity.get('creator');
        var Creator = new creator();
        var created_edge = db.created.document((Creator.saveCreatedEdge(creator_id ,activity.get('name'),
            activity.get('description'), max))._id);
        var activity_id = created_edge._to;

        var Joiner = new joiner();
        Joiner.setUserJoinedActivity(creator_id, activity_id);

        var Tagger = new tagger();
        var interests = activity.get('tagged_interests');
        for (var i = 0; i < interests.length; i++) {
            Tagger.tagActivityWithInterest(activity_id, interests[i]);
        }

        var Suggester = new suggester();
        var times = activity.get('suggested_times');
        for (var i = 0; i < times.length; i++) {
            var time = times[i];
            // disallow end time before start time
            if(time.end < time.start) {
                throw new error.NotAllowedError("Activity ending before it starts is ");
            }
            // disallow date suggestions in the past
            var now = Date();
            if(time.end < now.value) {
                throw new error.NotAllowedError("A suggestion in the past is ");
            }
            Suggester.saveSuggestedTimeEdge(activity_id, time.start, time.end);
        }

        var locations = activity.get('suggested_locations');
        for (var i = 0; i < locations.length; i++) {
            var location = locations[i];
            Suggester.saveSuggestedLocationEdge(activity_id, location.latitude, location.longitude);
        }

        res.body = "Success";
    }).bodyParam('activity', {
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

        (new tagger()).tagActivityWithInterest(activityHandle, interest);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'Activity being tagged'
    }).pathParam('interest', {
        type: joi.string(),
        description: 'The interest text'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });

    /*
     * joinActivity
     */
    controller.put('/:activityid/user/:userid', function(req, res) {
        var activity_id = 'activity/' + req.params('activityid');
        var user_id = 'user/' + req.params('userid');

        (new joiner()).setUserJoinedActivity(user_id, activity_id);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'The activity to join'
    }).pathParam('userid', {
        type: joi.string(),
        description: 'User id to add to activity'
    }).bodyParam('Undocumented', {
        type: EmptyBody
    });
}());
