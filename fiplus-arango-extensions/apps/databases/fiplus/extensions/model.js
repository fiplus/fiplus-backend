var foxx = require("org/arangodb/foxx");
var joi = require("joi");

var EmptyBody = foxx.Model.extend({
    schema: {
    }
});
exports.EmptyBody = EmptyBody;

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
exports.ActivityModel = ActivityModel;

var IcebreakerModel = foxx.Model.extend({
    schema: {
        activity_id: joi.string(),
        question: joi.string(),
        answer: joi.string()
    }
});
exports.IcebreakerModel = IcebreakerModel;

var IcebreakerAnswerModel = foxx.Model.extend({
    schema: {
        activity_id: joi.string(),
        user_id: joi.string(),
        answer: joi.string()
    }
});
exports.IcebreakerAnswerModel = IcebreakerAnswerModel;

var TimeModel = foxx.Model.extend({
    schema: {
        start: joi.number().integer(),
        end: joi.number().integer()
    }
});
exports.TimeModel = TimeModel;

var LocationModel = foxx.Model.extend({
    schema: {
        latitude: joi.number(),
        longitude: joi.number()
    }
});
exports.LocationModel = LocationModel;

var CommentModel = foxx.Model.extend({
    schema: {
        activity_id: joi.string(),
        user_id: joi.string(),
        comment: joi.string()
    }
});
exports.CommentModel = CommentModel;

var ReportModel = foxx.Model.extend({
    schema: {
        reported_user_id: joi.string(),
        reported_comment_id: joi.string()
    }
});
exports.ReportModel = ReportModel;


var UserModel = foxx.Model.extend({
    schema: {
        email: joi.string()
    }
});
exports.UserModel = UserModel;

var HistoryRequestModel = foxx.Model.extend({
    schema: {
        duration: joi.number().integer(),
        targetuser: joi.string()
    }
});
exports.HistoryRequestModel = HistoryRequestModel;

var ConfigUserModel = foxx.Model.extend({
    schema: {
        username: joi.string(),
        email: joi.string(),
        password: joi.string()
    }
});
exports.ConfigUserModel = ConfigUserModel;

//User configures profile/setting
var UserProfileModel = foxx.Model.extend({
    schema: {
        email: joi.string(),
        username: joi.string(),
        profile_pic: joi.string(),
        age: joi.number().integer(),
        gender: joi.string(),
        location: joi.object(),
        location_proximity_setting: joi.boolean(),
        availabilities: joi.array(), // item type TimeModel
        tagged_interests: joi.array() // type String
    }
});
exports.UserProfileModel = UserProfileModel;

var InterestArrayModel = foxx.Model.extend({
    schema: {
        interests: joi.array()
    }
});
exports.InterestArrayModel = InterestArrayModel;

var ActivityArrayModel = foxx.Model.extend({
    schema: {
        activities: joi.array()
    }
});
exports.ActivityArrayModel = ActivityArrayModel;

var AttendeeModel = foxx.Model.extend({
    schema: {
        num_attendees: joi.number().integer(),
        participants: joi.array(),   // format string (ids)
        joiners: joi.array()     // format string (ids)
    }
});
exports.AttendeeModel = AttendeeModel;

var CredentialModel = foxx.Model.extend({
    schema: {
        email: joi.string(),
        password: joi.string()
    }
});
exports.CredentialModel = CredentialModel;

var WhoAmIModel = foxx.Model.extend({
    schema: {
        user_id: joi.string()
    }
});
exports.WhoAmIModel = WhoAmIModel;

var SetDeviceIds = foxx.Model.extend({
});
exports.SetDeviceIds = SetDeviceIds;