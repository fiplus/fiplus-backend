var app = require('../server');
var ds = app.datasources.db;

var Credentials = {
  email: String,
  password: String
};
ds.define('Credentials', Credentials);

var UserProfile = {
  user_id: String,
  email: String,
  username: String,
  profile_pic: String,
  age: Number,
  gender: String,
  location: 'Location',
  location_proximity_setting: Boolean,
  availabilities: ['Time'],
  tagged_interests: [String]
};
ds.define('UserProfile', UserProfile);

var Location = {
  location_id: String,
  suggestion_id: String,
  latitude: Number,
  longitude: Number
};
ds.define('Location', Location);

var Time = {
  time_id: String,
  suggestion_id: String,
  start: Number,
  end: Number
};
ds.define('Time', Time);

var Activity = {
    activity_id: String,
    name: String,
    description: String,
    max_attendees: Number,
    creator: String,
    tagged_interests: [String],
    suggested_times: ['Time'],
    suggested_locations: ['Location']
};
ds.define('Activity', Activity);

var Icebreaker = {
    activity_id: String,
    question: String,
    answer: String
};
ds.define('Icebreaker', Icebreaker);

var IcebreakerAnswer = {
    activity_id: String,
    user_id: String,
    answer: String
};
ds.define('IcebreakerAnswer', IcebreakerAnswer);

var Comment = {
    activity_id: String,
    user_id: String,
    comment: String
};
ds.define('Comment', Comment);

var Report = {
    reported_user_id: String,
    reported_comment_id: String
};
ds.define('Report', Report);

var HistoryRequest = {
    duration: Number,
    targetuser: String
};
ds.define('HistoryRequest', HistoryRequest);

var Attendee = {
    num_attendees: Number,
    participants: [String],
    joiners: [String]
};
ds.define('Attendee', Attendee);

var SetDeviceId = {
  current_device_id: String,
  new_device_id: String
};
ds.define('SetDeviceId', SetDeviceId);
