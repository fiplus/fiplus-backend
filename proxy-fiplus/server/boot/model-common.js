
var Credentials = function(){};
Credentials.email = String;
Credentials.password = String;
exports.Credentials = Credentials;

var UserProfile = function(){};
UserProfile.user_id = String;
UserProfile.email = String;
UserProfile.username = String;
UserProfile.profile_pic = String;
UserProfile.favourited = Boolean;
UserProfile.age = Number;
UserProfile.gender = String;
UserProfile.location = 'Location';
UserProfile.location_proximity_setting = Boolean;
UserProfile.availabilities = ['Time'];
UserProfile.tagged_interests = [String];
exports.UserProfile = UserProfile;

var Location = function(){};
Location.location_id = String;
Location.suggestion_id = String;
Location.suggestion_votes = Number;
Location.suggestion_voters = [String];
Location.latitude = Number;
Location.longitude = Number;
exports.Location = Location;

var Time = function(){};
Time.time_id = String;
Time.suggestion_id = String;
Time.suggestion_votes = Number;
Time.suggestion_voters = [String];
Time.start = Number;
Time.end = Number;
exports.Time = Time;

var Activity = function(){};
Activity.activity_id = String;
Activity.Name = String;
Activity.description = String;
Activity.max_attendees = Number;
Activity.allow_joiner_input = Boolean;
Activity.num_attendees = Number;
Activity.creator = String;
Activity.tagged_interests = [String];
Activity.times = ['Time'];
Activity.locations = ['Location'];
Activity.is_cancelled = Boolean;
exports.Activity = Activity;

var Favourites = function(){};
Favourites.favourite_users = ['UserProfile'];
exports.Favourites = Favourites;

var Icebreaker = function(){};
Icebreaker.activity_id = String;
Icebreaker.question = String;
Icebreaker.answer = String;
exports.Icebreaker = Icebreaker;

var IcebreakerAnswer = function(){};
IcebreakerAnswer.activity_id = String;
IcebreakerAnswer.user_id = String;
IcebreakerAnswer.answer = String;
exports.IcebreakerAnswer = IcebreakerAnswer;

var Comment = function(){};
Comment.activity_id = String;
Comment.user_id = String;
Comment.comment = String;
exports.Comment = Comment;

var Report = function(){};
Report.reported_user_id = String;
Report.reported_comment_id = String;
exports.Report = Report;

var HistoryRequest = function(){};
HistoryRequest.duration = Number;
HistoryRequest.targetuser = String;
exports.HistoryRequest = HistoryRequest;

var Attendee = function(){};
Attendee.num_attendees = Number;
Attendee.participants = ['UserProfile'];
Attendee.joiners = [String];
exports.Attendee = Attendee;

var SetDeviceId = function(){};
SetDeviceId.current_device_id = String;
SetDeviceId.new_device_id = String;
exports.SetDeviceId = SetDeviceId;

var WhoAmI = function(){};
WhoAmI.user_id = String;
exports.WhoAmI = WhoAmI;

var CreateCancelActivityResponse = function(){};
CreateCancelActivityResponse.activity_id = String;
CreateCancelActivityResponse.Name = String;
exports.CreateActivityResponse = CreateCancelActivityResponse;

var FirmUpResponse = function(){};
FirmUpResponse.activity_id = String;
FirmUpResponse.Name = String;
FirmUpResponse.time = 'Time';
FirmUpResponse.location = 'Location';
exports.FirmUpResponse = FirmUpResponse;
