db._drop('year');
db._drop('month');
db._drop('day');
db._drop('time');
db._drop('period');
db._drop('event');

db._create('year');
db._create('month');
db._create('day');
db._create('time');
db._create('period');
db._create('event');

var graph = require('org/arangodb/general-graph');

var fiplus = graph._graph('fiplus');
if(db._collection('in_year') != null) fiplus._deleteEdgeDefinition('in_year', true);
if(db._collection('in_month')!= null)  fiplus._deleteEdgeDefinition('in_month', true);
if(db._collection('in_day')!= null)  fiplus._deleteEdgeDefinition('in_day', true);
if(db._collection('in_time')!= null)  fiplus._deleteEdgeDefinition('in_time', true);
if(db._collection('starts')!= null)  fiplus._deleteEdgeDefinition('starts', true);
if(db._collection('ends')!= null)  fiplus._deleteEdgeDefinition('ends', true);
if(db._collection('is_available')!= null) fiplus._deleteEdgeDefinition('is_available', true);
if(db._collection('suggested_time')!= null)  fiplus._deleteEdgeDefinition('suggested_time', true);
if(db._collection('confirmed_time')!= null)  fiplus._deleteEdgeDefinition('confirmed_time', true);

var in_year = graph._directedRelation('in_year', 'month', 'year');
var in_month = graph._directedRelation('in_month', 'day', 'month');
var in_day = graph._directedRelation('in_day', 'time', 'day');
var start = graph._directedRelation('starts', 'period', 'time');
var end = graph._directedRelation('ends', 'period', 'time');
var is_available = graph._directedRelation('is_available', 'users', 'period');
var suggested_time = graph._directedRelation('suggested_time', 'event', 'period');
var confirmed_time = graph._directedRelation('confirmed_time', 'event', 'period');

fiplus._extendEdgeDefinitions(in_year);
fiplus._extendEdgeDefinitions(in_month);
fiplus._extendEdgeDefinitions(in_day);
fiplus._extendEdgeDefinitions(start);
fiplus._extendEdgeDefinitions(end);
fiplus._extendEdgeDefinitions(is_available);
fiplus._extendEdgeDefinitions(suggested_time);
fiplus._extendEdgeDefinitions(confirmed_time);

