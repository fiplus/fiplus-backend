var loopback = require("loopback");
var app = require('../server');
var request = require('request');
var fwd = require('./arango-fwd');
var push = require('./push-notification');

var ds = app.dataSources.db;
var activity = ds.createModel ('Act',{},{base:loopback.Model});

activity.createActivity = function(activity, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL+'/activity',
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

activity.createActivity.shared = true;
activity.createActivity.accepts = [{arg: 'activity', type: 'Activity', http: {source: 'body'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.createActivity.http = {verb: 'POST', path: '/'};
activity.createActivity.description = 'Creates the activity';
activity.afterRemote('createActivity', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  if(ctx.res.statusCode == 200)
  {
    push.SendNotificationOnActivityCreate(ctx.res.body);
  }
  ctx.res.end();
});

activity.getActivity = function(id, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id,
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

activity.getActivity.shared = true;
activity.getActivity.accepts = [{arg:'id', type: 'string', http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.getActivity.returns = {arg: 'activity', type: 'Activity', root:true};
activity.getActivity.http = {verb: 'GET', path: '/:id'};
activity.getActivity.description = 'Retrieves the activity';
activity.afterRemote('getActivity', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.getAttendees = function(id, limit, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id + '/user?' + req.originalUrl.split('?')[1],
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

activity.getAttendees.shared = true;
activity.getAttendees.accepts = [{arg:'id', type: 'string', http:{source:'path'}},
  {arg:'Limit', type: 'number', http:{source:'query'}},
  {arg:'req', type:'object',http:{source:'req'}}];
activity.getAttendees.returns = {arg: 'attendees', type: 'Attendee', root:true};
activity.getAttendees.http = {verb: 'GET', path: '/:id/user'};
activity.getAttendees.description = 'Retrieves the activity attendees';
activity.afterRemote('getAttendees', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.suggestTimeForActivity = function(id, time, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id + '/time',
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

activity.suggestTimeForActivity.shared = true;
activity.suggestTimeForActivity.accepts = [{arg:'id', type: 'string', http:{source:'path'}},
  {arg:'time', type: 'Time', http:{source:'body'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.suggestTimeForActivity.http = {verb: 'PUT', path: '/:id/time'};
activity.suggestTimeForActivity.description = 'Adds the time suggestion to activity';
activity.afterRemote('suggestTimeForActivity', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.suggestLocationForActivity = function(id, location, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id + '/location',
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

activity.suggestLocationForActivity.shared = true;
activity.suggestLocationForActivity.accepts = [{arg:'id', type: 'string', http:{source:'path'}},
  {arg:'location', type: 'Location', http:{source:'body'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.suggestLocationForActivity.http = {verb: 'PUT', path: '/:id/location'};
activity.suggestLocationForActivity.description = 'Adds the location suggestion to activity';
activity.afterRemote('suggestLocationForActivity', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.voteForSuggestion = function(id, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/suggestion/' + id + '/user',
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

activity.voteForSuggestion.shared = true;
activity.voteForSuggestion.accepts = [{arg:'id', type: 'string', http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.voteForSuggestion.http = {verb: 'POST', path: '/suggestion/:id/user'};
activity.voteForSuggestion.description = 'Votes for the specified suggestion';
activity.afterRemote('voteForSuggestion', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.tagActivityWithInterest = function(id, text, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id + '/interest/' + text,
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

activity.tagActivityWithInterest.shared = true;
activity.tagActivityWithInterest.accepts = [{arg:'id', type: 'string', http:{source:'path'}},
  {arg:'text', type: 'string', http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.tagActivityWithInterest.http = {verb: 'PUT', path: '/:id/interest/:text'};
activity.tagActivityWithInterest.description = 'Tags the activity with the interest';
activity.afterRemote('tagActivityWithInterest', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.joinActivity = function(id, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id + '/user/',
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

activity.joinActivity.shared = true;
activity.joinActivity.accepts = [{arg:'id', type: 'string', http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.joinActivity.http = {verb: 'PUT', path: '/:id/user'};
activity.joinActivity.description = 'Join activity';
activity.afterRemote('joinActivity', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.unjoinActivity = function(id, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id + '/user/',
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

activity.unjoinActivity.shared = true;
activity.unjoinActivity.accepts = [{arg:'id', type: 'string', http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.unjoinActivity.http = {verb: 'DELETE', path: '/:id/user'};
activity.unjoinActivity.description = 'Unjoin activity';
activity.afterRemote('unjoinActivity', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  ctx.res.end();
});

activity.cancelActivity = function(id, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + id,
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

activity.cancelActivity.shared = true;
activity.cancelActivity.accepts = [{arg:'id', type: 'string', http:{source:'path'}},{arg:'req', type:'object',http:{source:'req'}}];
activity.cancelActivity.http = {verb: 'DELETE', path: '/:id'};
activity.cancelActivity.description = 'Cancel activity';
activity.afterRemote('cancelActivity', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  if(ctx.res.statusCode == 200)
  {
    push.SendCancelledActivityMessage(ctx.res.body);
  }
  ctx.res.end();
});


activity.firmUpSuggestion = function(activityId, suggestionId, req, cb) {

  request({
    url: fwd.FIPLUS_BASE_URL + '/activity/' + activityId + '/confirm/' + suggestionId,
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

activity.firmUpSuggestion.shared = true;
activity.firmUpSuggestion.accepts = [
  {arg:'activityId', type: 'string', http:{source:'path'}},
  {arg:'suggestionId', type: 'string', http:{source:'path'}},
  {arg:'req', type:'object',http:{source:'req'}}
];
activity.firmUpSuggestion.http = {verb: 'POST', path: '/:activityId/confirm/:suggestionId'};
activity.firmUpSuggestion.description = 'Firms up (confirms) specified suggestion';
activity.afterRemote('firmUpSuggestion', function(ctx, model, next) {
  fwd.forwardResponse(ctx.res);
  ctx.res.send(ctx.res.body);
  if(ctx.res.statusCode == 200)
  {
    push.SendNotificationOnFirmUp(ctx.res.body);
  }
  ctx.res.end();
});

app.model(activity);
