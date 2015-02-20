var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var creator = require('db-interface/edge/created').Created;
var tagger = require('db-interface/edge/tagged').Tagged;
var suggester = require('db-interface/edge/suggested').Suggested;
var joiner = require('db-interface/edge/joined').Joined;
var voted = require('db-interface/edge/voted').Voted;
var actor = require('db-interface/node/activity').Activity;
var error = require('error');
var model_common = require('model-common');
var helper = require('db-interface/util/helper');

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

    controller.activateSessions({
        sessionStorageApp: '/sessions',
        type: 'cookie',
        cookie: {
            name: 'sid',
            secret: 'Answ3rK3y?B33nz!J0ck.'
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
        var uid = req.session.get('uid');
        if (uid != creator_id) {
            throw new error.UnauthorizedError(uid, "createActivity with creator " + creator_id)
        }

        var Creator = new creator();
        var created_edge = db.created.document((Creator.saveCreatedEdge(creator_id ,activity.get('Name'),
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

        // Return the activity key and name value so that push notifications can be sent for activity
        var createActivityResponse = new model_common.CreateActivityResponse();
        createActivityResponse.activity_id = activity_id.split('/')[1];
        createActivityResponse.Name = activity.get('Name');
        res.json(JSON.stringify(createActivityResponse));
    }).bodyParam('Activity', {
        type: foxx.Model
    }).onlyIfAuthenticated();

   /*
    * GetActivity
    */
    controller.get('/:activityid', function(req, res) {
        var activity_id = 'activity/' + req.params('activityid');

        var activity_node = (new actor()).get(activity_id);
        var activity = helper.getActivity(activity_node);
        res.json(activity);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'The activity more information is requested for'
    }).onlyIfAuthenticated();

    /*
     * GetAttendees
     */
    controller.get('/:activityid/user', function(req, res) {
        var activity_id = 'activity/' + req.params('activityid');
        var lim = req.params('Limit');
        (new actor()).exists(activity_id);

        var Joiner = new joiner();
        var attendees = new model_common.Attendee();
        attendees.num_attendees = Joiner.getNumJoiners(activity_id);
        // TODO attendeeDetail.participants
        attendees.joiners =  Joiner.getJoiners(activity_id, lim);

        res.json(attendees);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'The activity more information is requested for'
    }).queryParam('Limit', {
        type: joi.number().integer(),
        description: 'The maximum number of attendees to return'
    }).onlyIfAuthenticated();

    controller.post('/icebreaker/answer', function(req, res) {

    }).bodyParam('Answer', {
        type: foxx.Model
    }).onlyIfAuthenticated();

    controller.put('/icebreaker', function(req, res) {

    }).bodyParam('Icebreaker', {
        type: foxx.Model
    }).onlyIfAuthenticated();

    controller.delete('/:activity_id/user/:user_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to remove user from'
    }).pathParam('user_id', {
        type: joi.string(),
        description: 'The user to remove from activity'
    }).onlyIfAuthenticated();

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
    }).onlyIfAuthenticated();

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
        type: foxx.Model,
        description: 'The suggested start and end time'
    }).onlyIfAuthenticated();

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
        type: foxx.Model,
        description: 'The latitude and longitude of the location'
    }).onlyIfAuthenticated();

    /*
     * voteForSuggestion
     */
    controller.post('/suggestion/:suggestionId/user', function(request, response) {
        var suggestionId = 'suggestion/' + request.params('suggestionId');

        var uid = request.session.get('uid');

        (new voted()).saveUserVote(uid, suggestionId);

    }).pathParam('suggestionId', {
        type: joi.string(),
        description: 'The suggestion id being voted for'
    }).onlyIfAuthenticated();

    controller.post('/:activity_id/location/:location_id', function(req, res) {

    }).pathParam('activity_id', {
        type: joi.string(),
        description: 'The activity to confirm location for'
    }).pathParam('location_id', {
        type: joi.string(),
        description: 'The location to confirm for'
    }).onlyIfAuthenticated();

    controller.put('/comment', function(req, res) {

    }).bodyParam('Comment', {
        type: foxx.Model
    }).onlyIfAuthenticated();

    controller.put('/report', function(req, res) {

    }).bodyParam('Report', {
        type: foxx.Model
    }).onlyIfAuthenticated();

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
    }).onlyIfAuthenticated();

    /*
     * joinActivity
     */
    controller.put('/:activityid/user', function(req, res) {
        var activity_id = 'activity/' + req.params('activityid');
        var uid = req.session.get('uid');

        (new joiner()).setUserJoinedActivity(uid, activity_id);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'The activity to join'
    }).pathParam('userid', {
        type: joi.string(),
        description: 'User id to add to activity'
    }).onlyIfAuthenticated();
}());
