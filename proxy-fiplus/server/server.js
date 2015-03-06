var loopback = require('loopback');
var boot = require('loopback-boot');
var https = require('https');
var http = require('http');
var sslconfig = require('./ssl-config');

var app = module.exports = loopback();

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

app.start = function() {

  var options = {
    key: sslconfig.privateKey,
    cert: sslconfig.certificate
  };

  var server;
  if(process.argv.indexOf('--nossl') != -1)
  {
    server = http.createServer(app);
  }
  else
  {
    server = https.createServer(options, app);
  }

  // start the web server
  return server.listen(app.get('port'), function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
