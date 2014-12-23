var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var qb = require('aqb');
var db = require("org/arangodb").db;
var creator = require('db-interface/edge/created').Created;
var tagger = require('db-interface/edge/tagged').Tagged;
var suggester = require('db-interface/edge/suggested').Suggested;
var joiner = require('db-interface/edge/joined').Joined;
var voted = require('db-interface/edge/voted').Voted;
var actor = require('db-interface/node/activity').Activity;
var error = require('error');
var model = require('model');


(function() {
    "use strict";

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

    /*
     * createActivity
     */
    controller.post('/', function(req, res) {
        var activity = req.params('Activity');

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
            Suggester.saveSuggestedTimeEdge(activity_id, time.start, time.end);
        }

        var locations = activity.get('suggested_locations');
        for (var i = 0; i < locations.length; i++) {
            var location = locations[i];
            Suggester.saveSuggestedLocationEdge(activity_id, location.latitude, location.longitude);
        }

        res.body = "Success";
    }).bodyParam('Activity', {
        type: model.ActivityModel
    });

   /*
    * GetEvent
    */
    controller.get('/:activityid', function(req, res) {
        var activity_id = 'activity/' + req.params('activityid');
        var eventDetail = new model.ActivityModel();
        var Actor = new actor();
        var activity_node = Actor.get(activity_id);
        eventDetail.name = activity_node[Actor.NAME_FIELD];
        eventDetail.description = activity_node[Actor.DESCRIPTION_FIELD];
        eventDetail.max_attendees = activity_node[Actor.MAXIMUM_ATTENDANCE_FIELD];
        eventDetail.creator = (new creator()).getCreator(activity_id);
        eventDetail.tagged_interests = (new tagger()).getTags(activity_id);
        // TODO if there is a confirmed time/location, return an array of 1 with only the confirmed suggestion
        var Suggester = new suggester();
        eventDetail.suggested_times = Suggester.getSuggestedTimes(activity_id);
        eventDetail.suggested_locations = Suggester.getSuggestedLocations(activity_id);

        res.json(eventDetail);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'The activity more information is requested for'
    });

    controller.post('/icebreaker/answer', function(req, res) {

    }).bodyParam('Answer', {
        type: model.IcebreakerAnswerModel
    });

    controller.put('/icebreaker', function(req, res) {

    }).bodyParam('Icebreaker', {
        type: model.IcebreakerModel
    });

    controller.delete('/:activity_id/user/:user_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to remove user from'
    }).pathParam('user_id', {
        type: joi.string(),
        description: 'The user to remove from activity'
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
        type: model.EmptyBody
    });

    /*
     * suggestTimePeriodForActivity
     */
    controller.put('/:activityId/time', function(request, response) {
        var activityId = 'activity/'+request.params('activityId');
        var times = request.params('Time');

        var suggest = new suggester();
        suggest.saveSuggestedTimeEdge(activityId, times.get('start'), times.get('end'));

    }).pathParam('activityId', {
        type: joi.string(),
        description: 'Activity suggestion will be linked to'
    }).bodyParam('Time', {
        type: model.TimeModel,
        description: 'The suggested start and end time'
    });

    /*
     * suggestLocationForActivity
     */
    controller.put('/:activityId/location', function(request, response) {
        var activityId = 'activity/'+request.params('activityId');
        var times = request.params('Location');

        var suggest = new suggester();
        suggest.saveSuggestedLocationEdge(activityId, times.get('latitude'), times.get('longitude'));
    }).pathParam('activityId', {
        type: joi.string(),
        description: 'Activity to be linked to location'
    }).bodyParam('Location', {
        type: model.LocationModel,
        description: 'The latitude and longitude of the location'
    });

    /*
     * voteForSuggestion
     */
    controller.post('/suggestion/:suggestionId/user/:userId', function(request, response) {
        var suggestionId = 'suggestion/' + request.params('suggestionId');
        var userId = 'user/' + request.params('userId');

        (new voted()).saveUserVote(userId, suggestionId);

    }).pathParam('suggestionId', {
        type: joi.string(),
        description: 'The suggestion id being voted for'
    }).pathParam('userId', {
        type: joi.string(),
        description: 'The user that is voting'
    }).bodyParam('Undocumented', {
        type: model.EmptyBody
    });

    controller.post('/:activity_id/location/:location_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to confirm location for'
    }).pathParam('location_id', {
        type: joi.string(),
        description: 'The location to confirm for'
    }).bodyParam('Undocumented', {
        type: model.EmptyBody
    });

    controller.put('/comment', function(req, res) {

    }).bodyParam('Comment', {
        type: model.CommentModel
    });

    controller.put('/report', function(req, res) {

    }).bodyParam('Report', {
        type: model.ReportModel
    });

    /*
     * tagActivityWithInterest
     */
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
        type: model.EmptyBody
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
        type: model.EmptyBody
    });
}());
