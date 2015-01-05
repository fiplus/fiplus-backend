db._drop('time_stamp');
db._drop('user');
db._drop('interest');
db._drop('time_period');
db._drop('activity');
db._drop('location');
db._drop('comment');
db._drop('suggestion');
db._drop('icebreaker');

db._create('time_stamp');
db._create('user');
db._create('interest');
db._create('time_period');
db._create('activity');
db._create('location');
db._create('comment');
db._create('suggestion');
db._create('icebreaker');

var graph = require('org/arangodb/general-graph');

if (graph._exists('fiplus'))
{
    graph._drop('fiplus', true);
}

var start = graph._directedRelation('start', 'time_period', 'time_stamp');
var end = graph._directedRelation('end', 'time_period', 'time_stamp');
var confirmed = graph._directedRelation('confirmed', ['activity','user'], ['time_period','location','activity']);
var in_location = graph._directedRelation('in_location', 'user', 'location');
var is_available = graph._directedRelation('is_available', 'user', 'time_period');
var interested_in = graph._directedRelation('interested_in', 'user', 'interest');
var is = graph._directedRelation('is', 'suggestion', ['time_period','location']);
var suggested = graph._directedRelation('suggested', 'activity', 'suggestion');
var has = graph._directedRelation('has', 'activity', ['comment', 'icebreaker']);
var joined = graph._directedRelation('joined', 'user', 'activity');
var participated = graph._directedRelation('participated', 'user', 'activity');
var created = graph._directedRelation('created', 'user', 'activity');
var tagged = graph._directedRelation('tagged', 'activity', 'interest');
var voted = graph._directedRelation('voted', 'user', 'suggestion');
var favourited = graph._directedRelation('favourited', 'user', 'user');

var edges = graph._edgeDefinitions(
    start,
    end,
    confirmed,
    in_location,
    is_available,
    interested_in,
    is,
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
db.time_stamp.ensureUniqueConstraint('value');
db.location.ensureUniqueConstraint('latitude', 'longitude');
db.user.ensureUniqueConstraint('email');

db.start.ensureUniqueConstraint('_to', '_from');
db.end.ensureUniqueConstraint('_to', '_from');
db.in_location.ensureUniqueConstraint('_to', '_from');
db.tagged.ensureUniqueConstraint('_to', '_from');
db.interested_in.ensureUniqueConstraint('_to', '_from');
db.joined.ensureUniqueConstraint('_to', '_from');
db.is.ensureUniqueConstraint('_to', '_from');
db.suggested.ensureUniqueConstraint('_to', '_from');
db.participated.ensureUniqueConstraint('_to', '_from');