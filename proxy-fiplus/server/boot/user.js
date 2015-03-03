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
    headers: {
      cookie: req.get('Cookie')
    },
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
    headers: {
      cookie: req.get('Cookie')
    },
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
    headers: {
      cookie: req.get('Cookie')
    },
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

user.whoAmI = function(req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/whoami',
    method: 'GET',
    headers: {
      cookie: req.get('Cookie')
    },
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

user.whoAmI.shared = true;
user.whoAmI.accepts = [{arg:'req', type:'object',http:{source:'req'}}];
user.whoAmI.returns = {arg:'who', type: 'WhoAmI',http:{source:'body'}, root:true};
user.whoAmI.http = {verb: 'GET', path: '/whoami'};
user.whoAmI.description = 'Responds with what your true essence is';
user.afterRemote('whoAmI', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.echo = function(req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/echo',
    method: 'GET',
    headers: {
      cookie: req.get('Cookie')
    },
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
    headers: {
      cookie: req.get('Cookie')
    },
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

user.getUserProfile = function(userId, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/profile/' + userId,
    method: 'GET',
    headers: {
      cookie: req.get('Cookie')
    },
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
user.getUserProfile.accepts = [{arg:'userId', type:'string',http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
user.getUserProfile.http = {verb: 'GET', path: '/profile/:userId'};
user.getUserProfile.description = 'Retrieves the users profile';
user.afterRemote('getUserProfile', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.addFavourite = function(userId, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/favourites/' + userId,
    method: 'POST',
    headers: {
      cookie: req.get('Cookie')
    },
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

user.addFavourite.shared = true;
user.addFavourite.accepts = [{arg:'userId', type:'string',http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
user.addFavourite.http = {verb: 'POST', path: '/favourites/:userId'};
user.addFavourite.description = 'Adds a user to the favourite list';
user.afterRemote('addFavourite', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.getFavourites = function(Limit, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/user/favourites?' + req.originalUrl.split('?')[1],
    method: 'GET',
    headers: {
      cookie: req.get('Cookie')
    },
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

user.getFavourites.shared = true;
user.getFavourites.accepts = [{arg:'Limit', type: 'number', http:{source:'query'}},
  {arg:'req', type:'object',http:{source:'req'}}];
user.getFavourites.returns = {arg: 'favourites', type: 'Favourites', root:true};
user.getFavourites.http = {verb: 'GET', path: '/favourites'};
user.getFavourites.description = 'Retrieves favourited users';
user.afterRemote('getFavourites', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});


user.deleteFavourites = function(userId, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/user/favourites/' + userId,
    method: 'DELETE',
    headers: {
      cookie: req.get('Cookie')
    },
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

user.deleteFavourites.shared = true;
user.deleteFavourites.accepts = [{arg:'userId', type:'string',http:{source:'path'}},
  {arg:'req', type:'object',http:{source:'req'}}];
user.deleteFavourites.http = {verb: 'DELETE', path: '/favourites/:userId'};
user.deleteFavourites.description = 'Deletes a favourited user';
user.afterRemote('deleteFavourites', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.setDeviceId = function(device_ids, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/device',
    method: 'POST',
    headers: {
      cookie: req.get('Cookie')
    },
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

user.setDeviceId.shared = true;
user.setDeviceId.accepts = [{arg:'device_ids', type:'SetDeviceId',http:{source:'body'}},{arg:'req', type:'object',http:{source:'req'}}];
user.setDeviceId.http = {verb: 'POST', path: '/device'};
user.setDeviceId.description = 'Maps user with device for push notifications';
user.afterRemote('setDeviceId', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

user.getActivities = function(userId, past, future, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/user/activities?' + req.originalUrl.split('?')[1],
    method: 'GET',
    headers: {
      cookie: req.get('Cookie')
    },
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

user.getActivities.shared = true;
user.getActivities.accepts = [{arg:'userId', type:'string', http:{source:'query'}},{arg:'past', type:'boolean',http:{source:'query'}},{arg:'future', type:'boolean',http:{source:'query'}},{arg:'req', type:'object',http:{source:'req'}}];
user.getActivities.returns = {arg:'activities', type:['Activity'],http:{source:'body'}, root:true};
user.getActivities.http = {verb: 'GET', path: '/activities'};
user.getActivities.description = 'Gets activities joined by user, returns all if both options set to false';
user.afterRemote('getActivities', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

app.model(user); 
