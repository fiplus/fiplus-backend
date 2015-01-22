var loopback = require("loopback");
var app = require('../server');
var request = require('request');
var fwd = require('./arango-fwd');

var ds = app.dataSources.db;
var user = ds.createModel ('User',{},{base:loopback.Model});

user.registerUser = function(creds, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/register',
    method: 'POST',
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

user.registerUser.shared = true;
user.registerUser.accepts = [{arg: 'credentials', type: 'Credentials', http: {source: 'body'}},{arg:'req', type:'object',http:{source:'req'}}];
user.registerUser.http = {verb: 'POST', path: '/register'};
user.registerUser.description = 'Registers the user';
user.afterRemote('registerUser', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.login = function(creds, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/login',
    method: 'POST',
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

user.login.shared = true;
user.login.accepts = [{arg: 'credentials', type: 'Credentials', http: {source: 'body'}},{arg:'req', type:'object',http:{source:'req'}}];
user.login.http = {verb: 'POST', path: '/login'};
user.login.description = 'Logs in user';
user.afterRemote('login', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.logout = function(req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/logout',
    method: 'POST',
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

user.logout.shared = true;
user.logout.accepts = [{arg:'req', type:'object',http:{source:'req'}}];
user.logout.http = {verb: 'POST', path: '/logout'};
user.logout.description = 'Logout';
user.afterRemote('logout', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.echo = function(req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/echo',
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

user.echo.shared = true;
user.echo.accepts = [{arg:'req', type:'object',http:{source:'req'}}];
user.echo.http = {verb: 'GET', path: '/echo'};
user.echo.description = 'Echos the sent response';
user.afterRemote('echo', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.saveUserProfile = function(user, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/profile',
    method: 'PUT',
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

user.saveUserProfile.shared = true;
user.saveUserProfile.accepts = [{arg:'user', type:'UserProfile', http:{source:'body'}},{arg:'req', type:'object',http:{source:'req'}}];
user.saveUserProfile.http = {verb: 'PUT', path: '/profile'};
user.saveUserProfile.description = 'Saves/updates the users profile';
user.afterRemote('saveUserProfile', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.getUserProfile = function(email, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/profile/' + email,
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

user.getUserProfile.shared = true;
user.getUserProfile.returns = {arg:'user', type:'UserProfile', root:true};
user.getUserProfile.accepts = [{arg:'email', type:'string',http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
user.getUserProfile.http = {verb: 'GET', path: '/profile/:email'};
user.getUserProfile.description = 'Retrieves the users profile';
user.afterRemote('getUserProfile', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

app.model(user); 
