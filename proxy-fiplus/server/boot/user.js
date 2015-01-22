var loopback = require("loopback");
var app = require('../server');
var request = require('request');
var fwd = require('./arango-fwd');

var ds = app.dataSources.db;
var user = ds.createModel ('User',{},{base:loopback.Model});
module.exports=user;

user.registerUser = function(creds, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/register',
    method: 'GET',
    json: req.body
  }, function(e, response, body) {
    if(e)
    {
      console.log(e);
      cb(null);
    }
    else
    {
      fwd.forwardResponse(response);

      // No error so 1st arg = null
      cb(null, body);
    }
  });
};

user.registerUser.shared = true;
user.registerUser.accepts = {arg: 'credentials', type: 'Credentials', http: {source: 'body'}};
user.registerUser.returns = {arg: 'data', type: 'MyModel', root: true};
user.registerUser.http = {verb: 'get', path: '/interest'};
user.registerUser.description = 'Registers the user';
user.afterRemote('registerUser', function(ctx, model, next) {
  ctx.res.headers = fwd.receivedHeaders;
  next();
});

app.model(user); 
