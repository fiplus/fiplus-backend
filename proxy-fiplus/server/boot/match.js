var loopback = require("loopback");
var app = require('../server');
var request = require('request');
var fwd = require('./arango-fwd');

var ds = app.dataSources.db;
var match = ds.createModel ('Match',{},{base:loopback.Model});

match.matchActivities = function( num, by_interest, by_location, offset, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/match/activities?' + req.originalUrl.split('?')[1],
    method: 'GET',
    headers: {
      cookie: req.get('Cookie')
    },
    json: true
  }, function(e, response) {
    if(e)
    {
      console.log(e);
    }
    else
    {
      fwd.saveArangoResponse(response);

      // No error so 1st arg = null
      cb(null, response.body);
    }
  });
};

match.matchActivities.shared = true;
match.matchActivities.accepts = [
  {arg:'num_activities', type: 'number', http:{source:'query'}},
  {arg:'by_interest', type: 'boolean', http:{source:'query'}},
  {arg:'by_location', type: 'boolean', http:{source:'query'}},
  {arg:'priority_offset', type: 'number', http:{source:'query'}},
  {arg:'req', type:'object',http:{source:'req'}}];
match.matchActivities.returns = {arg:'activities',type:['Activity'], root:true};
match.matchActivities.http = {verb: 'GET', path: '/activities'};
match.matchActivities.description = 'Match activities';
match.afterRemote('matchActivities', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

app.model(match);
