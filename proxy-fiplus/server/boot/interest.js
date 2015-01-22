var loopback = require("loopback");
var app = require('../server');
var request = require('request');
var fwd = require('./arango-fwd');

var ds = app.dataSources.db;
var interest = ds.createModel ('Interest',{},{base:loopback.Model});

interest.getInterestsWithInput = function(input, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/interest?' + req.originalUrl.split('?')[1],
    method: 'GET',
    body: req.body,
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

interest.getInterestsWithInput.shared = true;
interest.getInterestsWithInput.accepts = [{arg:'input', type: 'string', http:{source:'query'}},
  {arg:'req', type:'object',http:{source:'req'}}];
interest.getInterestsWithInput.returns = {arg:'interests',type:['string']};
interest.getInterestsWithInput.http = {verb: 'GET', path: '/'};
interest.getInterestsWithInput.description = 'Get interests with input';
interest.afterRemote('getInterestsWithInput', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

app.model(interest);
