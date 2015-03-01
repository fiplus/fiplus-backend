var creator = require('db-interface/edge/created').Created;
var tagger = require('db-interface/edge/tagged').Tagged;
var suggester = require('db-interface/edge/suggested').Suggested;
var voted = require('db-interface/edge/voted').Voted;
var actor = require('db-interface/node/activity').Activity;
var joiner = require('db-interface/edge/joined').Joined;
var confirmer = require('db-interface/edge/confirmed').Confirmed;
var user = require('db-interface/node/user').User;
var interested_in = require('db-interface/edge/interested_in');
var in_location = require('db-interface/edge/in_location');
var location = require('db-interface/node/location');
var is_available = require('db-interface/edge/is_available');
var favourited = require('db-interface/edge/favourited');
var model_common = require('model-common');

exports.getActivity = function(activity_node)
{
    var Actor = new actor();

    var activity = new model_common.Activity();
    activity.activity_id = activity_node._key;
    activity.Name = activity_node[Actor.NAME_FIELD];
    activity.description = activity_node[Actor.DESCRIPTION_FIELD];
    activity.max_attendees = activity_node[Actor.MAXIMUM_ATTENDANCE_FIELD];
    activity.allow_joiner_input = activity_node[Actor.ALLOW_JOINER_INPUT];
    activity.num_attendees = (new joiner()).getNumJoiners(activity_node._id);
    activity.creator = (new creator()).getCreator(activity_node._id);
    activity.tagged_interests = (new tagger()).getTags(activity_node._id);
    activity.is_cancelled = activity_node[Actor.IS_CANCELLED];

    var Suggester = new suggester();
    var Confirmer = new confirmer();
    var confirmedTime = Confirmer.getConfirmedTime(activity_node._id);
    if(confirmedTime != null)
    {
        activity.times = [confirmedTime];
    }
    else
    {
        activity.times = Suggester.getSuggestedTimes(activity_node._id);
    }

    var confirmedLoc = Confirmer.getConfirmedLocation(activity_node._id);

    if(confirmedLoc != null)
    {
        activity.locations = [confirmedLoc];
    }
    else
    {
        activity.locations = Suggester.getSuggestedLocations(activity_node._id);
    }
    return activity;
};

exports.getProfile = function(target_user_node, current_userId)
{
    var User = new user();
    var profile = new model_common.UserProfile();

    var user_data = target_user_node[User.DATA_FIELD];

    // Public information
    profile.user_id = target_user_node._key;
    profile.username = user_data[User.DATA_USERNAME_FIELD];
    profile.profile_pic = user_data[User.DATA_PROFILE_PIC_FIELD];
    profile.tagged_interests = (new interested_in.InterestedIn()).getUserInterests(target_user_node._id);
    profile.favourited = (new favourited.Favourited()).isFavourite(current_userId, target_user_node._id);

    // Private information
    if (current_userId == target_user_node._id) {

        profile.email = target_user_node[User.EMAIL_FIELD];
        profile.age = user_data[User.DATA_AGE_FIELD];
        profile.gender = user_data[User.DATA_GENDER_FIELD];
        profile.location_proximity_setting = user_data[User.DATA_LOCATION_PROXIMITY_SETTING_FIELD];

        var Location = new location.Location();
        var location_node = (new in_location.InLocation()).getUserLocation(target_user_node._id);

        var loc = new model_common.Location();
        if(location_node != null) {
            loc.latitude = location_node[Location.LATITUDE_FIELD];
            loc.longitude = location_node[Location.LONGITUDE_FIELD];
        }

        profile.location = loc;
        profile.availabilities = (new is_available.IsAvailable()).getUserAvailabilities(target_user_node._id);
    }
    return profile;
};