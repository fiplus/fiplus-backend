var creator = require('db-interface/edge/created').Created;
var tagger = require('db-interface/edge/tagged').Tagged;
var suggester = require('db-interface/edge/suggested').Suggested;
var voted = require('db-interface/edge/voted').Voted;
var actor = require('db-interface/node/activity').Activity;
var model_common = require('model-common');

exports.getActivity = function(activity_node)
{
    var Actor = new actor();

    var activity = new model_common.Activity();
    activity.activity_id = activity_node._key;
    activity.Name = activity_node[Actor.NAME_FIELD];
    activity.description = activity_node[Actor.DESCRIPTION_FIELD];
    activity.max_attendees = activity_node[Actor.MAXIMUM_ATTENDANCE_FIELD];
    activity.creator = (new creator()).getCreator(activity_node._id);
    activity.tagged_interests = (new tagger()).getTags(activity_node._id);
    // TODO if there is a confirmed time/location, return an array of 1 with only the confirmed suggestion
    var Suggester = new suggester();
    activity.suggested_times = Suggester.getSuggestedTimes(activity_node._id);
    activity.suggested_locations = Suggester.getSuggestedLocations(activity_node._id);
    return activity;
};