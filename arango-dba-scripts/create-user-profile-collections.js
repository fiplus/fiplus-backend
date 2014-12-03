db._drop('location');
db._drop('time_period');
db._drop('interest');

db._create('location');
db._create('time_period');
db._create('interest');

var graph = require('org/arangodb/general-graph');

var fiplus = graph._graph('fiplus');
if(db._collection('in_location') != null) fiplus._deleteEdgeDefinition('in_location', true);
if(db._collection('is_available') != null) fiplus._deleteEdgeDefinition('is_available', true);
if(db._collection('interested_in') != null) fiplus._deleteEdgeDefinition('interested_in', true);

var in_location = graph._directedRelation('in_location', 'users', 'location');
var is_available = graph._directedRelation('is_available', 'users', 'time_period');
var interested_in = graph._directedRelation('interested_in', 'users', 'interest');

fiplus._extendEdgeDefinitions(in_location);
fiplus._extendEdgeDefinitions(is_available);
fiplus._extendEdgeDefinitions(interested_in);

