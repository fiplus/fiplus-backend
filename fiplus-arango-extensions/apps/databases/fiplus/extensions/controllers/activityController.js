var foxx = require("org/arangodb/foxx");
var joi = require("joi");
var db = require("org/arangodb").db;
var creator = require('db-interface/edge/created').Created;
var tagger = require('db-interface/edge/tagged').Tagged;
var suggester = require('db-interface/edge/suggested').Suggested;
var joiner = require('db-interface/edge/joined').Joined;
var voted = require('db-interface/edge/voted').Voted;
var confirmer = require('db-interface/edge/confirmed').Confirmed;
var actor = require('db-interface/node/activity').Activity;
var user = require('db-interface/node/user').User;
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
        })
        .errorResponse(error.UnauthorizedError, error.UnauthorizedError.code, 'Authentication Error', function(e) {
            return{
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
            throw new error.UnauthorizedError(uid, "createActivity with creator " + creator_id);
        }

        var Creator = new creator();
        var created_edge = db.created.document((Creator.saveCreatedEdge(creator_id ,activity.get('Name'),
            activity.get('description'), max, activity.get('allow_joiner_input')))._id);
        var activity_id = created_edge._to;

        var Joiner = new joiner();
        Joiner.setUserJoinedActivity(creator_id, activity_id);

        var Tagger = new tagger();
        var interests = activity.get('tagged_interests');
        for (var i = 0; i < interests.length; i++) {
            Tagger.tagActivityWithInterest(activity_id, interests[i]);
        }

        var Suggester = new suggester();
        var Confirmer = new confirmer();
        var times = activity.get('times');
        for (var i = 0; i < times.length; i++)
        {
            var time = times[i];
            if(time.suggestion_id == "-1")
            {
                Confirmer.saveConfirmedTime(activity_id, times.start, times.end);
            }
            else
            {
                Suggester.saveSuggestedTimeEdge(activity_id, time.start, time.end);
            }
        }

        var locations = activity.get('locations');
        for (var i = 0; i < locations.length; i++)
        {
            var location = locations[i];
            if(location.suggestion_id == "-1")
            {
                Confirmer.saveConfirmedLocation(activity_id, location.latitude, location.longitude);
            }
            else
            {
                Suggester.saveSuggestedLocationEdge(activity_id, location.latitude, location.longitude);
            }
        }

        // Return the activity key and name value so that push notifications can be sent for activity
        var createActivityResponse = new model_common.CreateCancelActivityResponse();
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
        var current_userId = req.session.get('uid');
        var lim = req.params('Limit');
        (new actor()).exists(activity_id);

        var Joiner = new joiner();
        var attendees = new model_common.Attendee();
        attendees.num_attendees = Joiner.getNumJoiners(activity_id);
        // TODO attendeeDetail.participants
        //Will be reverted to this in the future
        //attendees.joiners =  Joiner.getJoinersProfile(activity_id, lim, current_userId);
        //Temporary code for alpha
        attendees.joiners =  Joiner.getJoinersId(activity_id, lim);

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

    /*
     * firmUpSuggestion
     */
    controller.post('/:activityId/confirm/:suggestionId', function(req, res) {
        var activityId = 'activity/' + req.params('activityId');
        var suggestionId = 'suggestion/' + req.params('suggestionId');

        (new actor()).exists(activityId);

        // Check privilege: only creators can firm up
        var user_id = req.session.get('uid');
        var creator_id = 'user/' + (new creator()).getCreator(activityId);
        if(user_id != creator_id)
        {
            throw new error.UnauthorizedError(user_id, 'Firm Up');
        }

        // Add confirmed edge
        var Confirmer = new confirmer();
        var result = Confirmer.saveConfirmed(activityId, suggestionId);

        // Return the activity key and name value so that push notifications can be sent for activity
        // Note: a confirmed time and location sent one after the other will trigger 2 push notifications.
        var FirmUpResponse = new model_common.FirmUpResponse();
        FirmUpResponse.activity_id = activityId.split('/')[1];
        FirmUpResponse.Name = (new actor).get(activityId).Name;
        FirmUpResponse.time = Confirmer.getConfirmedTime(activityId);
        FirmUpResponse.location = Confirmer.getConfirmedLocation(activityId);

        res.json(JSON.stringify(FirmUpResponse));
    }).pathParam('activityId', {
        type: joi.string(),
        description: 'The activity to confirm for'
    }).pathParam('suggestionId', {
        type: joi.string(),
        description: 'The time to confirm for'
    }).onlyIfAuthenticated();

    /*
     * suggestTimePeriodForActivity
     */
    controller.put('/:activityId/time', function(request, response) {
        var activityId = 'activity/'+request.params('activityId');
        var times = request.params('Time');

        var suggest = new suggester();
        (new actor()).checkIfCancelled(activityId);
        checkIfAllowedToSuggest(activityId, request.session.get('uid'));
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
        (new actor()).checkIfCancelled(activityId);
        checkIfAllowedToSuggest(activityId, request.session.get('uid'));
        suggest.saveSuggestedLocationEdge(activityId, times.get('latitude'), times.get('longitude'));
    }).pathParam('activityId', {
        type: joi.string(),
        description: 'Activity to be linked to location'
    }).bodyParam('Location', {
        type: foxx.Model,
        description: 'The latitude and longitude of the location'
    }).onlyIfAuthenticated();

    function checkIfAllowedToSuggest(activityId, userId) {
        var Activity = new actor();
        var activity = Activity.get(activityId);


        var Joined = new joiner();
        // Only joined users are allowed to suggest, and if a joiner then continue to check if activity is open
        if(Joined.getJoinersId(activityId, null).indexOf(userId.split('/')[1]) == -1)
        {
            throw new error.NotAllowedError('Suggestions from non-joiners');
        }

        var Created = new creator();
        if(!activity[Activity.ALLOW_JOINER_INPUT] && userId != Created.getCreator(activityId))
        {
            throw new error.NotAllowedError('Suggestions from joiners');
        }
    }

    /*
     * voteForSuggestion
     */
    controller.post('/suggestion/:suggestionId/user', function(request, response) {
        var suggestionId = 'suggestion/' + request.params('suggestionId');

        var uid = request.session.get('uid');

        // Getting the suggested edge for given suggestion in order to get activity to check if it is cancelled
        var suggestedEdge = {};
        suggestedEdge._to = suggestionId;
        suggestedEdge = db.suggested.firstExample(suggestedEdge);
        if(suggestedEdge != null)
        {
            (new actor()).checkIfCancelled(suggestedEdge._from);
        }
        else
        {
            throw new error.NotFoundError('Suggested edge for suggestion ');
        }

        (new voted()).saveUserVote(uid, suggestionId);

    }).pathParam('suggestionId', {
        type: joi.string(),
        description: 'The suggestion id being voted for'
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

        (new actor()).checkIfCancelled(activityHandle);
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

        (new actor()).checkIfCancelled(activity_id);
        (new joiner()).setUserJoinedActivity(uid, activity_id);
    }).pathParam('activityid', {
        type: joi.string(),
        description: 'The activity to join'
    }).pathParam('userid', {
        type: joi.string(),
        description: 'User id to add to activity'
    }).onlyIfAuthenticated();

    // Cancel activity
    controller.delete("/:activityid", function(request, response) {
        var activity_id = 'activity/' + request.params('activityid');

        var uid = request.session.get('uid');
        require('console').log(uid);
        var createdEdge = {};
        createdEdge._from = uid;
        createdEdge._to = activity_id;
        var result = db.created.firstExample(createdEdge);
        if(result == null)
        {
            throw new error.NotAllowedError('Cancelling activity by non-creator');
        }

        (new actor()).cancelActivity(activity_id);

        // Return the activity key and name value so that push notifications can be sent for activity
        var cancelledActivityResponse = new model_common.CreateCancelActivityResponse();

        var activity = db.activity.document(activity_id);
        cancelledActivityResponse.activity_id = activity_id.split('/')[1];
        cancelledActivityResponse.Name = activity[(new actor()).NAME_FIELD];
        response.json(JSON.stringify(cancelledActivityResponse));
    }).pathParam('activityid', {
        type: joi.string()
    }).onlyIfAuthenticated();

    controller.delete('/:activityid/user', function(request, response) {
        var activity_id = 'activity/' + request.params('activityid');
        var uid = request.session.get('uid');

        (new joiner()).removeUserJoinedActivity(uid, activity_id);
    }).pathParam('activityid', {
        type: joi.string(),
        descriptions: 'The activity to unjoin'
    }).onlyIfAuthenticated();
}());
