db._drop('time_stamp');
db._drop('user');
db._drop('interest');
db._drop('time_period');
db._drop('activity');
db._drop('location');
db._drop('comment');
db._drop('suggested_location');
db._drop('suggested_time');
db._drop('icebreaker');

db._create('time_stamp');
db._create('user');
db._create('interest');
db._create('time_period');
db._create('activity');
db._create('location');
db._create('comment');
db._create('suggested_location');
db._create('suggested_time');
db._create('icebreaker');

var graph = require('org/arangodb/general-graph');

if (graph._exists('fiplus'))
{
    graph._drop('fiplus', true);
}


var start = graph._directedRelation('starts', 'time_period', 'time_stamp');
var end = graph._directedRelation('ends', 'time_period', 'time_stamp');
var confirmed = graph._directedRelation('confirmed', ['activity','user'], ['time_period','location','activity']);
var in_location = graph._directedRelation('in_location', 'user', 'location');
var is_available = graph._directedRelation('is_available', 'user', 'time_period');
var interested_in = graph._directedRelation('interested_in', 'user', 'interest');
var occurs = graph._directedRelation('occurs', ['suggested_time', 'suggested_location'], ['time_period','location']);
var suggested = graph._directedRelation('suggested', 'activity', ['suggested_time','suggested_location']);
var has = graph._directedRelation('has', 'activity', ['comment', 'icebreaker']);
var joined = graph._directedRelation('joined', 'user', 'activity');
var participated = graph._directedRelation('participated', 'user', 'activity');
var created = graph._directedRelation('created', 'user', 'activity');
var tagged = graph._directedRelation('tagged', 'activity', 'interest');
var voted = graph._directedRelation('voted', 'user', ['suggested_time','suggested_location']);
var favourited = graph._directedRelation('favourited', 'user', 'user');


var edges = graph._edgeDefinitions(
    start,
    end,
    confirmed,
    in_location,
    is_available,
    interested_in,
    occurs,
    suggested,
    has,
    joined,
    participated,
    created,
    tagged,
    voted,
    favourited);

graph._create('fiplus', edges);

// Indexes
db.interest.ensureFulltextIndex('name');
db.interest.ensureUniqueConstraint('name');