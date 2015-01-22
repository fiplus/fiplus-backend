var app = require('../server');
var ds = app.datasources.db;

var Credentials = {
  email: String,
  password: String
};

ds.define('Credentials', Credentials);






