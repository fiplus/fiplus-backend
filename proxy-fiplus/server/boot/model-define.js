var model = require('./model-common');

var app = require('../server');
var ds = app.datasources.db;

ds.define('Credentials', model.Credentials);
ds.define('UserProfile', model.UserProfile);
ds.define('Location', model.Location);
ds.define('Time', model.Time);
ds.define('Activity', model.Activity);
ds.define('Icebreaker', model.Icebreaker);
ds.define('IcebreakerAnswer', model.IcebreakerAnswer);
ds.define('Comment', model.Comment);
ds.define('Report', model.Report);
ds.define('HistoryRequest', model.HistoryRequest);
ds.define('Attendee', model.Attendee);
ds.define('SetDeviceId', model.SetDeviceId);
ds.define('WhoAmI', model.WhoAmI);
ds.define('CreateActivityResponse', model.CreateActivityResponse);
ds.define('Favourites', model.Favourites);
