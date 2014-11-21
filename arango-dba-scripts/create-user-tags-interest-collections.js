var USERS_COLLECTION = "users";
var TAGS_COLLECTION = "tags";

db._drop(USERS_COLLECTION);
db._drop(TAGS_COLLECTION);

db._create(USERS_COLLECTION);
db._create(TAGS_COLLECTION);

var gm = require('org/arangodb/general-graph');

var interests = gm._directedRelation('interested_in', 'users', 'tags');

if (gm._exists('fiplus'))
{
	gm._drop('fiplus');
}
var edges = gm._edgeDefinitions();
gm._extendEdgeDefinitions(edges, interests);

gm._create('fiplus', edges);

